import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, CartesianGrid, ComposedChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { budgetVersion, data as defaultData, type MonthlyProjectCostVsBudget } from './data';

/**
 * Dois painéis alinhados pelo mesmo eixo x e pelo mesmo `syncId`, com o custo do projeto contra o
 * orçado em cima e a variação embaixo, escritos para os casos-limite em que a variação quase deixa
 * de ser publicável.
 *
 * O que esta versão resolve, e a v1 não: orçado ZERO e orçado AUSENTE são coisas diferentes e
 * precisam de marcas diferentes, um desvio de R$ 800 ao lado de um de R$ 900 mil só existe na tela
 * por piso de marca e por valor escrito, e uma referência que trocou de versão no meio do ano tem de
 * dizer onde trocou, ou a variação mistura dois orçamentos sem avisar.
 */
export interface MonthlyProjectCostVsBudgetPanelsProps {
  readonly data?: readonly MonthlyProjectCostVsBudget[];
  /** Polaridade da métrica: custo é "menorMelhor". Decide a cor da variação, nunca o sinal dela. */
  readonly polarity?: CostPolarity;
  readonly height?: number;
  readonly className?: string;
}

/** "menorMelhor": estourar o orçado é ruim. "maiorMelhor": ficar abaixo do orçado é ruim. */
export type CostPolarity = 'maiorMelhor' | 'menorMelhor';

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

const SYNC_ID = 'orcado-zero-e-troca-de-versao';
/**
 * A margem inferior do painel principal reserva os 18 px em que o `R$ 0` do mês de orçado zero é
 * escrito: abaixo da linha de base não existe mais nada nesse painel, porque o eixo de categoria
 * mora só no painel de baixo. A margem esquerda e a direita são idênticas nos dois painéis, que é
 * o lado que precisa alinhar (REC-16).
 */
const MAIN_MARGIN = { top: 20, right: 12, bottom: 18, left: 0 } as const;
const VARIANCE_MARGIN = { top: 20, right: 12, bottom: 0, left: 0 } as const;
/**
 * Largura do eixo de valor. A `EIX-6` pede de 48 a 64 px e a conta glifo a glifo não cabe: o tique
 * mais largo é `R$ -750 mil`, com 59,43 px de tinta em Space Grotesk tabular a 11 px, que somados
 * aos 18 px de sobrecarga do eixo (tickSize 6, tickMargin 8 e folga de p99) pedem 77,43 px. Declaro
 * os 84 px (o tique negativo só fica em uma linha com 81, EIX-6 emenda de 2026-10-02) e registro a tensão na nota do `meta.json`.
 */
const Y_AXIS_WIDTH = 84;
const MAIN_GRID_STEPS = 4;
const VARIANCE_HEADROOM = 1.15;
/** Teto de categorias que o eixo imprime inteiras (EIX-7); repete o `FORCED_TICK_LIMIT` do Farol. */
const CATEGORY_TICK_LIMIT = 8;
const REALIZADO_FILL = 'var(--chart-1)';
const ORCADO_STROKE = 'var(--chart-1)';
/**
 * Coluna fantasma (ESP-6, ESP-2). Canvas de 780 px de largura dá corpo de 714 px; descontados o
 * eixo de 84 px e a margem direita de 12 px sobram 618 px de plano, então o passo de 8 meses mede
 * 77,25 px. O fantasma seria `77,25 × (1 − 2 × 0,30)`, isto é 30,9 px, e o teto de 24 px da ESP-2
 * em cartão o corta em 24 px; o sólido central mede 15,6 px, acima do piso de 12 px.
 */
const MAIN_BAR_CATEGORY_GAP = '30%';
const MAIN_MAX_BAR_SIZE = 24;
const MAIN_SOLID_RATIO = 0.65;
const VARIANCE_BAR_CATEGORY_GAP = '30%';
const VARIANCE_MAX_BAR_SIZE = 20;
/**
 * Piso de altura da coluna de variação, em pixels.
 *
 * Ele existe porque o desvio de R$ 800 mede 0,03 px num domínio de R$ 1,5 mi e simplesmente não
 * desenha. O preço é honesto e está declarado: com o piso, R$ 800 e R$ 30 mil desenham a MESMA
 * marca de 3 px, então quem separa os dois é o valor escrito em cima da coluna, não a altura dela.
 * O pacote só aplica o piso quando a altura calculada é menor que ele (`Bar.js:627`), então a marca
 * das colunas grandes não é alterada.
 */
const MIN_POINT_SIZE = 3;
const LABEL_GAP = 6;
/** Passo entre as duas linhas do rótulo de variação, em pixels: 11 px de tinta com 2 px de respiro. */
const LABEL_LINE_STEP = 13;
/** Espessura e sobra do traço que marca o orçado zero, para ele existir na tela com altura zero. */
const ZERO_MARK_THICKNESS = 1.5;
/**
 * Esta versão NÃO usa halo, e a decisão é medida, não esquecimento.
 *
 * A `ROT-7` pede halo no rótulo que cruza linha de referência ou outra marca, e aqui nenhum rótulo
 * cruza: todos nascem além da ponta da coluna, a folga do domínio garante o espaço, e a faixa da
 * troca de versão é estrutura de fundo, não marca de dado. Com halo o resultado piora, porque o
 * halo é a cor do CARTÃO e a faixa não é: sobre ela cada rótulo ganharia uma caixa clara em volta,
 * medida no primeiro render desta versão.
 *
 * `NO_FILL` é o retângulo sem preenchimento da faixa do mês sem base: ela é VAZADA e a da troca de
 * versão é pintada, e são duas coisas diferentes que não podem chegar com a mesma marca (ACE-2).
 */
const NO_FILL = 'none';

interface Row extends MonthlyProjectCostVsBudget {
  /** Variação contra o orçado, ou `null` no mês sem orçamento registrado: ausência não é zero. */
  readonly variacao: number | null;
  /** Primeira linha do rótulo: a variação absoluta, sempre escrita quando existe variação. */
  readonly rotuloValor: string | null;
  /** Segunda linha: o percentual contra a base, ausente quando a base é zero ou não existe. */
  readonly rotuloPercentual: string | null;
}

/** Menor número redondo (1, 2 ou 5 vezes uma potência de 10) que não fica abaixo do passo pedido. */
function niceStep(roughStep: number): number {
  if (roughStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(roughStep));
  const magnitude = 10 ** exponent;
  const fraction = roughStep / magnitude;
  const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * magnitude;
}

/** O passo redondo seguinte, na escada 1, 2, 5, 10. */
function nextNiceStep(step: number): number {
  return niceStep(step * 1.5 + 1);
}

/** Domínio a partir do zero com no máximo `steps` degraus redondos (EIX-1, EIX-4). */
function buildDomain(maxValue: number, steps: number): { domainMax: number; ticks: readonly number[] } {
  let step = niceStep(maxValue / steps);
  while (Math.ceil(maxValue / step) > steps) step = nextNiceStep(step);
  const domainMax = Math.max(step, Math.ceil(maxValue / step) * step);
  const count = Math.round(domainMax / step);
  return { domainMax, ticks: Array.from({ length: count + 1 }, (_, index) => index * step) };
}

/** Domínio simétrico com folga acima do maior desvio, para o rótulo caber além da ponta da coluna. */
function buildVarianceDomain(maxAbsValue: number, headroom: number): { domainMax: number; ticks: readonly number[] } {
  const raw = maxAbsValue * headroom;
  const step = niceStep(raw / 2);
  const domainMax = Math.max(step, Math.ceil(raw / step) * step);
  const half = domainMax / 2;
  return { domainMax, ticks: [-domainMax, -half, 0, half, domainMax] };
}

/** A polaridade decide o que é ruim, nunca o sinal da variação sozinho (COR-6). */
function isBad(variacao: number, polarity: CostPolarity): boolean {
  if (variacao === 0) return false;
  return polarity === 'menorMelhor' ? variacao > 0 : variacao < 0;
}

function varianceColor(variacao: number, polarity: CostPolarity): string {
  if (variacao === 0) return 'var(--line-strong)';
  return isBad(variacao, polarity) ? 'var(--negative)' : 'var(--positive)';
}

function signedCurrency(value: number): string {
  return `${value >= 0 ? '+' : '−'}${formatCurrencyCompact(Math.abs(value))}`;
}

/** Variação inteira a partir de 10% e com uma casa abaixo disso (NUM-1), com sinal à mão (NUM-3). */
function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  return `${fraction >= 0 ? '+' : '−'}${formatPercent(absolute, absolute >= 0.1 ? 0 : 1)}`;
}

/**
 * Deriva a variação e as duas linhas do rótulo.
 *
 * Sem orçado registrado não existe variação: sai `null`, o Recharts descarta a coluna antes de
 * desenhar e a `ReferenceArea` do mês escreve o motivo. Com orçado ZERO existe variação e ela é
 * inteira, mas não existe percentual, porque a base é zero: a segunda linha do rótulo simplesmente
 * não nasce, e é isso que "orçado zero sem percentual" quer dizer.
 */
function buildRows(rows: readonly MonthlyProjectCostVsBudget[]): readonly Row[] {
  return rows.map((row) => {
    const orcado = row.orcado;
    if (orcado === null) {
      return { ...row, variacao: null, rotuloValor: null, rotuloPercentual: null };
    }
    const variacao = row.realizado - orcado;
    const fracao = fractionOfBase(variacao, orcado);
    return {
      ...row,
      variacao,
      rotuloValor: signedCurrency(variacao),
      rotuloPercentual: fracao === null ? null : signedPercent(fracao),
    };
  });
}

/** Fração de variação contra a base, ou `null` sem base positiva: ausência nunca é zero (EST-1b). */
function fractionOfBase(variacao: number, base: number): number | null {
  if (base <= 0) return null;
  return variacao / base;
}

interface MainShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  /** Retângulo do plano inteiro que o Recharts entrega junto de cada barra (`BarRectangleItem`). */
  readonly background?: { readonly height?: number };
  readonly payload?: Row;
}

/**
 * Coluna fantasma do painel principal, e as três formas que a referência pode ter.
 *
 * A geometria é ancorada no REALIZADO, e não na referência, exatamente porque a referência falta em
 * um mês e é zero em outro: ancorada nela, o mês sem orçado ficaria sem retângulo e levaria embora o
 * custo realizado, que existe e é alto.
 *
 * As três formas, que é a pendência que a v1 deixou aberta em 2026-09-25:
 * orçado positivo, contorno vazado e tracejado da altura dele;
 * orçado ZERO, traço tracejado na linha de base mais o `R$ 0` escrito, porque retângulo de altura
 * zero não é desenhado pelo SVG e zero medido é zero (EST-3);
 * orçado AUSENTE, nenhuma marca de referência, e o motivo escrito no painel de baixo (EST-4).
 */
function renderMainColumn(domainMax: number) {
  return function MainColumn({ x = 0, y = 0, width = 0, height = 0, background, payload }: MainShapeProps): ReactElement | null {
    if (!payload) return null;
    const plotHeight = background?.height ?? 0;
    /** `domainMax` nunca é zero: `buildDomain` devolve no mínimo um passo redondo. */
    const scale = plotHeight / domainMax;
    const baseline = y + height;
    const orcado = payload.orcado;
    const orcadoHeight = orcado === null ? 0 : orcado * scale;
    const solidWidth = width * MAIN_SOLID_RATIO;
    return (
      <g>
        {orcado === null || orcado === 0 ? null : (
          <rect
            fill="none"
            height={orcadoHeight}
            rx={2}
            stroke={ORCADO_STROKE}
            strokeDasharray="3 3"
            strokeWidth={ZERO_MARK_THICKNESS}
            width={width}
            x={x}
            y={baseline - orcadoHeight}
          />
        )}
        <rect fill={REALIZADO_FILL} height={height} rx={3} width={solidWidth} x={x + (width - solidWidth) / 2} y={y} />
        {orcado === 0 ? (
          <g>
            <line
              stroke={ORCADO_STROKE}
              strokeDasharray="3 3"
              strokeWidth={ZERO_MARK_THICKNESS}
              x1={x}
              x2={x + width}
              y1={baseline}
              y2={baseline}
            />
            <text
              className="font-display"
              fill="var(--text-muted)"
              fontSize={11}
              fontWeight={500}
              textAnchor="middle"
              x={x + width / 2}
              y={baseline + LABEL_GAP + 6}
            >
              {formatCurrencyAxis(orcado)}
            </text>
          </g>
        ) : null}
      </g>
    );
  };
}

interface VarianceShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: Row;
}

/**
 * Coluna de variação com o rótulo de duas linhas: a variação absoluta e, quando a base permite, o
 * percentual contra ela.
 *
 * O rótulo nasce dentro do `shape` porque só ele recebe a linha inteira do dado: o `LabelList` passa
 * apenas atributos SVG válidos e o índice que ele entrega conta retângulos desenhados, não linhas do
 * array, o que com um `null` no meio da série leria a linha errada (REC-5).
 *
 * As duas linhas moram num `<text>` só, com `tspan`, porque duas frases irmãs do mesmo texto são uma
 * frase quebrada para o leitor de colisão, e dois `<text>` separados a 13 px seriam um par a mais para
 * conferir sem necessidade.
 *
 * Coluna negativa chega com `height` NEGATIVO e `y` na borda de baixo. O retângulo do pacote
 * normaliza ao desenhar; a conta do rótulo não. Por isso a normalização acontece aqui, uma vez.
 */
function renderVarianceColumn(polarity: CostPolarity) {
  return function VarianceColumn({ x = 0, y = 0, width = 0, height = 0, payload }: VarianceShapeProps): ReactElement | null {
    if (!payload || payload.variacao === null || payload.rotuloValor === null) return null;
    const top = Math.min(y, y + height);
    const tall = Math.abs(height);
    const bottom = top + tall;
    const color = varianceColor(payload.variacao, polarity);
    const acima = payload.variacao >= 0;
    const linhas = payload.rotuloPercentual === null ? 1 : 2;
    const centerX = x + width / 2;
    const textY = acima ? top - LABEL_GAP - (linhas - 1) * LABEL_LINE_STEP : bottom + LABEL_GAP;
    return (
      <g>
        <rect fill={color} height={tall} rx={2} width={width} x={x} y={top} />
        <text
          className="font-display"
          dominantBaseline={acima ? 'auto' : 'hanging'}
          fill={color}
          fontSize={11}
          fontWeight={500}
          textAnchor="middle"
          x={centerX}
          y={textY}
        >
          <tspan x={centerX}>{payload.rotuloValor}</tspan>
          {payload.rotuloPercentual === null ? null : (
            <tspan dy={LABEL_LINE_STEP} x={centerX}>
              {payload.rotuloPercentual}
            </tspan>
          )}
        </text>
      </g>
    );
  };
}

interface BandShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
}

/**
 * A faixa da troca de versão do orçamento, com o texto dela.
 *
 * O `shape` é o único lugar que recebe a faixa já em pixel, e ele pode desenhar FORA da área de
 * plotagem, dentro da margem: é lá que o texto mora, para não colidir com o topo das colunas
 * (REC-27, ANO-3). A `ReferenceArea` recebe `y1` e `y2` porque sem os dois o `shape` não recebe
 * retângulo nenhum e o desenho sai vazio, em silêncio (REC-28).
 */
function renderVersionBand(label: string) {
  return function VersionBand({ x = 0, y = 0, width = 0, height = 0 }: BandShapeProps): ReactElement {
    return (
      <g>
        <rect fill="var(--surface-sunken)" height={height} width={width} x={x} y={y} />
        <text
          className="font-display"
          fill="var(--text-muted)"
          fontSize={11}
          fontWeight={500}
          textAnchor="middle"
          x={x + width / 2}
          y={y - LABEL_GAP}
        >
          {label}
        </text>
      </g>
    );
  };
}

/**
 * A faixa do mês sem base, com o motivo escrito no lugar da coluna que não existe (EST-4).
 *
 * A faixa cobre uma categoria só, de `x1` igual a `x2`. Isso funciona porque o pacote mapeia `x1`
 * pelo INÍCIO da banda e `x2` pelo FIM dela, então a faixa nasce com a largura de uma banda inteira
 * em vez de largura zero.
 */
function renderNoBaseBand(label: string) {
  return function NoBaseBand({ x = 0, y = 0, width = 0, height = 0 }: BandShapeProps): ReactElement {
    return (
      <g>
        <rect
          fill={NO_FILL}
          height={height}
          stroke="var(--line-strong)"
          strokeDasharray="4 4"
          width={width}
          x={x}
          y={y}
        />
        <text
          fill="var(--text-muted)"
          fontSize={11}
          textAnchor="middle"
          x={x + width / 2}
          y={y + height / 2 + LABEL_GAP + 8}
        >
          {label}
        </text>
      </g>
    );
  };
}

/** Duas linhas de dica no painel principal: o payload automático traria só o realizado. */
function buildMainTooltipEntries(row: Row): readonly TooltipEntry[] {
  const realizado: TooltipEntry = {
    color: REALIZADO_FILL,
    dataKey: 'realizado',
    graphicalItemId: 'realizado',
    name: 'Custo realizado',
    value: row.realizado,
  };
  return [
    realizado,
    {
      color: ORCADO_STROKE,
      dataKey: 'orcado',
      graphicalItemId: 'orcado',
      name: 'Orçado',
      value: row.orcado === null ? formatUnavailable() : formatCurrencyCompact(row.orcado),
    },
  ];
}

/** A dica da variação: sem orçado registrado ela escreve a ausência, nunca zero (EST-2). */
function buildVarianceTooltipEntries(row: Row, polarity: CostPolarity): readonly TooltipEntry[] {
  if (row.variacao === null || row.rotuloValor === null) {
    return [
      { color: 'var(--text-muted)', dataKey: 'variacao', graphicalItemId: 'variacao', name: 'Variação', value: formatUnavailable() },
    ];
  }
  const color = varianceColor(row.variacao, polarity);
  const absolute: TooltipEntry = {
    color,
    dataKey: 'variacao',
    graphicalItemId: 'variacao',
    name: 'Variação',
    value: row.rotuloValor,
  };
  if (row.rotuloPercentual === null) return [absolute];
  return [absolute, { color, dataKey: 'orcado', graphicalItemId: 'orcado', name: 'Sobre o orçado', value: row.rotuloPercentual }];
}

export default function MonthlyProjectCostVsBudgetPanels({
  data = defaultData,
  polarity = 'menorMelhor',
  height,
  className,
}: MonthlyProjectCostVsBudgetPanelsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há custo realizado nem orçado para comparar.</span>
      </div>
    );
  }

  const rows = buildRows(data);
  const mainMax = rows.reduce((max, row) => {
    const comOrcado = row.orcado === null ? max : Math.max(max, row.orcado);
    return Math.max(comOrcado, row.realizado);
  }, 0);
  const mainDomain = buildDomain(mainMax, MAIN_GRID_STEPS);
  const varianceMax = rows.reduce((max, row) => (row.variacao === null ? max : Math.max(max, Math.abs(row.variacao))), 0);
  const varianceDomain = buildVarianceDomain(varianceMax, VARIANCE_HEADROOM);
  const xTicks =
    rows.length <= CATEGORY_TICK_LIMIT
      ? rows.map((row) => row.month)
      : rows.filter((_, index) => index % 2 === 0).map((row) => row.month);
  const lastMonth = rows[rows.length - 1]?.month;
  const semBase = rows.find((row) => row.orcado === null);
  const orcadoZero = rows.find((row) => row.orcado === 0);
  const versionLabel = `orçamento ${budgetVersion.label} desde ${formatMonthShort(budgetVersion.fromMonth)}`;

  const pedacos = [
    orcadoZero === undefined || orcadoZero.variacao === null
      ? null
      : `${formatMonthShort(orcadoZero.month)} gastou ${formatCurrencyCompact(Math.abs(orcadoZero.variacao))} sem orçamento`,
    semBase === undefined ? null : `${formatMonthShort(semBase.month)} não tem base`,
    `o orçado trocou de versão em ${formatMonthShort(budgetVersion.fromMonth)}`,
  ].filter((pedaco): pedaco is string => pedaco !== null);
  const reading = pedacos.join('; ');

  const summary = [
    `Dois painéis com o custo de ${String(rows.length)} meses de 2026 contra o orçado: nível em cima, variação embaixo.`,
    orcadoZero === undefined || orcadoZero.variacao === null
      ? 'Todos os meses têm orçamento registrado.'
      : `${formatMonthShort(orcadoZero.month)} gastou ${formatCurrencyCompact(Math.abs(orcadoZero.variacao))} sem orçamento, então não tem percentual.`,
    semBase === undefined
      ? `O orçado trocou de versão em ${formatMonthShort(budgetVersion.fromMonth)}.`
      : `${formatMonthShort(semBase.month)} não tem base e o orçado trocou de versão em ${formatMonthShort(budgetVersion.fromMonth)}.`,
  ].join(' ');

  const renderMainTooltip = (tooltipProps: { active?: boolean; label?: number | string }): ReactElement | null => {
    const month = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = month === undefined ? undefined : rows.find((candidate) => candidate.month === month);
    if (!tooltipProps.active || !row) return null;
    return <ChartTooltip active label={month} labelFormat="month" payload={buildMainTooltipEntries(row)} valueFormat="currencyCompact" />;
  };

  const renderVarianceTooltip = (tooltipProps: { active?: boolean; label?: number | string }): ReactElement | null => {
    const month = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = month === undefined ? undefined : rows.find((candidate) => candidate.month === month);
    if (!tooltipProps.active || !row) return null;
    return <ChartTooltip active label={month} labelFormat="month" payload={buildVarianceTooltipEntries(row, polarity)} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-1 flex shrink-0 items-center justify-between gap-3">
            <p aria-hidden className="min-w-0 truncate text-xs font-medium text-text-secondary">
              Custo do projeto (R$)
            </p>
            <ul aria-hidden className="flex shrink-0 items-center gap-4 text-xs text-text-secondary">
              <li className="flex items-center gap-2.5">
                <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: REALIZADO_FILL }} />
                Custo realizado
              </li>
              <li className="flex items-center gap-2.5">
                <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ border: `1.5px dashed ${ORCADO_STROKE}` }} />
                Orçado
              </li>
            </ul>
          </div>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer height="100%" width="100%">
              <ComposedChart accessibilityLayer={false} barCategoryGap={MAIN_BAR_CATEGORY_GAP} data={[...rows]} margin={MAIN_MARGIN} syncId={SYNC_ID}>
                <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
                <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" hide ticks={[...xTicks]} />
                <YAxis
                  {...AXIS_PROPS}
                  axisLine={false}
                  domain={[0, mainDomain.domainMax]}
                  tickFormatter={(value: number) => formatCurrencyAxis(value)}
                  ticks={[...mainDomain.ticks]}
                  interval={0}
                  width={Y_AXIS_WIDTH}
                />
                <Tooltip content={renderMainTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
                {lastMonth === undefined ? null : (
                  <ReferenceArea
                    ifOverflow="extendDomain"
                    shape={renderVersionBand(versionLabel)}
                    x1={budgetVersion.fromMonth}
                    x2={lastMonth}
                    y1={0}
                    y2={mainDomain.domainMax}
                  />
                )}
                <Bar dataKey="realizado" isAnimationActive={animate} maxBarSize={MAIN_MAX_BAR_SIZE} shape={renderMainColumn(mainDomain.domainMax)} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex h-48 shrink-0 flex-col">
          <p aria-hidden className="mb-1 shrink-0 truncate text-xs font-medium text-text-secondary">
            Variação contra o orçado (R$, escala própria)
          </p>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer height="100%" width="100%">
              <ComposedChart accessibilityLayer={false} barCategoryGap={VARIANCE_BAR_CATEGORY_GAP} data={[...rows]} margin={VARIANCE_MARGIN} syncId={SYNC_ID}>
                <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
                <XAxis
                  {...AXIS_PROPS}
                  axisLine={false}
                  dataKey="month"
                  tickFormatter={(value: string) => formatMonthShort(value)}
                  tickMargin={8}
                  ticks={[...xTicks]}
                />
                <YAxis
                  {...AXIS_PROPS}
                  axisLine={false}
                  domain={[-varianceDomain.domainMax, varianceDomain.domainMax]}
                  tickFormatter={(value: number) => formatCurrencyAxis(value)}
                  ticks={[...varianceDomain.ticks]}
                  interval={0}
                  width={Y_AXIS_WIDTH}
                />
                <Tooltip content={renderVarianceTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
                {lastMonth === undefined ? null : (
                  <ReferenceArea
                    fill="var(--surface-sunken)"
                    fillOpacity={1}
                    ifOverflow="extendDomain"
                    x1={budgetVersion.fromMonth}
                    x2={lastMonth}
                  />
                )}
                {semBase === undefined ? null : (
                  <ReferenceArea
                    ifOverflow="extendDomain"
                    shape={renderNoBaseBand('sem base')}
                    x1={semBase.month}
                    x2={semBase.month}
                    y1={-varianceDomain.domainMax}
                    y2={varianceDomain.domainMax}
                  />
                )}
                <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" strokeWidth={1} y={0} />
                <Bar
                  dataKey="variacao"
                  isAnimationActive={animate}
                  maxBarSize={VARIANCE_MAX_BAR_SIZE}
                  minPointSize={MIN_POINT_SIZE}
                  name="Variação"
                  shape={renderVarianceColumn(polarity)}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
