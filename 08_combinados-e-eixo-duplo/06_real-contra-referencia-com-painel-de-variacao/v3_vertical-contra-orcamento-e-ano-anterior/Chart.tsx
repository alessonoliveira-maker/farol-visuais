import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, CartesianGrid, ComposedChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type VerticalRevenueVsTwoReferences } from './data';

/**
 * Três painéis alinhados pelo mesmo eixo de categoria e pelo mesmo `syncId`: em cima, a receita de
 * cada vertical em coluna sólida dentro do contorno vazado do orçamento, com o traço do ano anterior
 * na altura dele; embaixo, uma variação por referência, cada uma com escala própria e escrita.
 *
 * O que esta versão resolve, e a v1 não: com duas referências, uma esconde a outra. Uma vertical
 * cresce muito contra o ano anterior e ainda fica abaixo do orçado, e com um painel de variação só
 * essa divergência não aparece. Cada painel anota o seu maior desvio, dois no visual inteiro (ANO-1).
 */
export interface VerticalRevenueVsTwoReferencesPanelsProps {
  readonly data?: readonly VerticalRevenueVsTwoReferences[];
  /** Polaridade da métrica: receita é "maiorMelhor". Decide a cor da variação, nunca o sinal dela. */
  readonly polarity?: RevenuePolarity;
  readonly height?: number;
  readonly className?: string;
}

/** "maiorMelhor": crescer é bom. "menorMelhor": crescer é ruim. */
export type RevenuePolarity = 'maiorMelhor' | 'menorMelhor';

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

const SYNC_ID = 'vertical-contra-orcamento-e-ano-anterior';
/**
 * A margem inferior do painel principal reserva os 8 px em que o tique `R$ 0` do eixo de valor é
 * escrito: com margem zero e o eixo de categoria escondido, o tique da base fica sem espaço e o
 * eixo o descarta em silêncio, o que foi medido no primeiro render. A margem esquerda e a direita
 * são idênticas nos dois painéis, que é o lado que precisa alinhar (REC-16).
 */
const MAIN_MARGIN = { top: 20, right: 12, bottom: 8, left: 0 } as const;
/**
 * O painel de variação do meio esconde o eixo de categoria, então ele também precisa da margem de
 * baixo: sem ela o tique da borda inferior nasce fora da caixa do gráfico e o painel seguinte o
 * corta ao meio, o que foi medido no segundo render desta versão. O painel de baixo não precisa,
 * porque o eixo de categoria já reserva a altura dele.
 */
const MIDDLE_MARGIN = { top: 20, right: 12, bottom: 8, left: 0 } as const;
const VARIANCE_MARGIN = { top: 20, right: 12, bottom: 0, left: 0 } as const;
/**
 * Largura do eixo de valor, idêntica nos três painéis: é ela que alinha os planos na horizontal
 * (REC-16). A `EIX-6` pede de 48 a 64 px e a conta glifo a glifo não cabe: o tique mais largo é
 * `R$ -300 mil`, com 59,43 px de tinta em Space Grotesk tabular a 11 px, que somados aos 18 px de
 * sobrecarga do eixo pedem 77,43 px. Declaro 84 px: o tique `−R$ 300 mil` só fica em uma linha com 81 px (EIX-6, emenda de 2026-10-02) e 80 o quebrava; a tensão está no `meta.json`.
 */
const Y_AXIS_WIDTH = 84;
const MAIN_GRID_STEPS = 4;
const VARIANCE_HEADROOM = 1.35;
/** Teto de categorias que o eixo imprime inteiras (EIX-7); repete o `FORCED_TICK_LIMIT` do Farol. */
const CATEGORY_TICK_LIMIT = 8;
const REALIZADO_FILL = 'var(--chart-1)';
/** Orçamento vazado e tracejado, na mesma cor do realizado: é a referência de planejamento. */
const ORCADO_STROKE = 'var(--chart-1)';
/** Ano anterior em traço neutro: é referência de histórico, e não pode competir com o orçamento. */
const ANO_ANTERIOR_FILL = 'var(--text-muted)';
const ANO_ANTERIOR_THICKNESS = 2.5;
const ANO_ANTERIOR_OVERHANG = 4;
/**
 * Coluna fantasma (ESP-6, ESP-2). Canvas de 640 px de largura dá corpo de 574 px; descontados o
 * eixo de 84 px e a margem direita de 12 px sobram 478 px de plano, então o passo de 6 verticais
 * mede 79,67 px. O fantasma seria `79,67 × (1 − 2 × 0,30)`, isto é 31,87 px, e o teto de 24 px da
 * ESP-2 em cartão o corta em 24 px; o sólido central mede 15,6 px, acima do piso de 12 px.
 */
const MAIN_BAR_CATEGORY_GAP = '30%';
const MAIN_MAX_BAR_SIZE = 24;
const MAIN_SOLID_RATIO = 0.65;
const VARIANCE_BAR_CATEGORY_GAP = '30%';
const VARIANCE_MAX_BAR_SIZE = 20;
const MIN_POINT_SIZE = 3;
const LABEL_GAP = 6;
const LABEL_SIDE_GAP = 4;
const LABEL_CAP_HEIGHT = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface Row extends VerticalRevenueVsTwoReferences {
  readonly desvioOrcado: number;
  readonly desvioAnoAnterior: number;
}

interface VarianceRow {
  readonly id: string;
  readonly vertical: string;
  readonly variacao: number;
  readonly base: number;
  /** Texto do desvio anotado, ou `null` nas verticais silenciosas. */
  readonly rotulo: string | null;
  readonly rotuloFora: boolean;
  readonly rotuloAncora: 'end' | 'start';
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

/** Domínio simétrico com folga acima do maior desvio, para o rótulo anotado caber além da ponta. */
function buildVarianceDomain(maxAbsValue: number, headroom: number): { domainMax: number; ticks: readonly number[] } {
  const raw = maxAbsValue * headroom;
  const step = niceStep(raw / 2);
  const domainMax = Math.max(step, Math.ceil(raw / step) * step);
  const half = domainMax / 2;
  return { domainMax, ticks: [-domainMax, -half, 0, half, domainMax] };
}

/** A polaridade decide o que é ruim, nunca o sinal da variação sozinho (COR-6). */
function isBad(variacao: number, polarity: RevenuePolarity): boolean {
  if (variacao === 0) return false;
  return polarity === 'menorMelhor' ? variacao > 0 : variacao < 0;
}

function varianceColor(variacao: number, polarity: RevenuePolarity): string {
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

/** Fração de variação contra a base, ou `null` sem base positiva: ausência nunca é zero (EST-1b). */
function fractionOfBase(variacao: number, base: number): number | null {
  if (base <= 0) return null;
  return variacao / base;
}

function buildRows(rows: readonly VerticalRevenueVsTwoReferences[]): readonly Row[] {
  return rows.map((row) => ({
    ...row,
    desvioOrcado: row.realizado - row.orcado,
    desvioAnoAnterior: row.realizado - row.anoAnterior,
  }));
}

/**
 * As linhas de um painel de variação, com o maior desvio anotado e o resto silencioso.
 *
 * O rótulo nomeia a base na mesma linha (NUM-4) e traz o percentual contra ela, porque a magnitude
 * em reais já está no eixo do painel e o que o eixo não diz é o tamanho relativo do desvio.
 */
function buildVarianceRows(
  rows: readonly Row[],
  pick: (row: Row) => { variacao: number; base: number },
  baseName: string,
): readonly VarianceRow[] {
  const derived = rows.map((row) => {
    const { variacao, base } = pick(row);
    return { id: row.id, vertical: row.vertical, variacao, base };
  });
  const worst = derived.reduce<{ id: string; variacao: number } | null>(
    (acc, row) => (acc === null || Math.abs(row.variacao) > Math.abs(acc.variacao) ? row : acc),
    null,
  );
  const middle = derived.length / 2;
  return derived.map((row, index) => {
    const fraction = fractionOfBase(row.variacao, row.base);
    const valor = fraction === null ? signedCurrency(row.variacao) : signedPercent(fraction);
    const ancora: 'end' | 'start' = index < middle ? 'start' : 'end';
    return {
      ...row,
      rotulo: worst !== null && worst.id === row.id ? `${valor} contra ${formatCurrencyCompact(row.base)} ${baseName}` : null,
      rotuloFora: row.variacao >= 0,
      rotuloAncora: ancora,
    };
  });
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
 * Coluna fantasma com DUAS referências, desenhada de uma vez.
 *
 * As três marcas saem do mesmo `shape` de propósito, e não de uma `Bar` mais uma `Line`: entre tipos
 * de marca diferentes quem decide a ordem de pintura é o zIndex do pacote, não a ordem do JSX, e uma
 * `Line` (400) pinta sempre sobre qualquer `Bar` (300). Num painel em que o traço do ano anterior
 * precisa ficar por cima do contorno do orçamento e por baixo de nada, a ordem só fica sob controle
 * se as três marcas nascerem dentro do mesmo elemento (REC-13, emenda de 2026-09-29).
 *
 * A geometria é ancorada no REALIZADO: `y` e `height` já vêm da coluna sólida, e as duas referências
 * saem da escala do eixo, `plano / domínio`, que é a mesma conta que o eixo usa.
 */
function renderMainColumn(domainMax: number) {
  return function MainColumn({ x = 0, y = 0, width = 0, height = 0, background, payload }: MainShapeProps): ReactElement | null {
    if (!payload) return null;
    const plotHeight = background?.height ?? 0;
    /** `domainMax` nunca é zero: `buildDomain` devolve no mínimo um passo redondo. */
    const scale = plotHeight / domainMax;
    const baseline = y + height;
    const orcadoHeight = payload.orcado * scale;
    const anoAnteriorY = baseline - payload.anoAnterior * scale;
    const solidWidth = width * MAIN_SOLID_RATIO;
    return (
      <g>
        <rect
          fill="none"
          height={orcadoHeight}
          rx={2}
          stroke={ORCADO_STROKE}
          strokeDasharray="3 3"
          strokeWidth={1.5}
          width={width}
          x={x}
          y={baseline - orcadoHeight}
        />
        <rect fill={REALIZADO_FILL} height={height} rx={3} width={solidWidth} x={x + (width - solidWidth) / 2} y={y} />
        <rect
          fill={ANO_ANTERIOR_FILL}
          height={ANO_ANTERIOR_THICKNESS}
          width={width + 2 * ANO_ANTERIOR_OVERHANG}
          x={x - ANO_ANTERIOR_OVERHANG}
          y={anoAnteriorY - ANO_ANTERIOR_THICKNESS / 2}
        />
      </g>
    );
  };
}

interface VarianceShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: VarianceRow;
}

/**
 * Coluna de variação e, na vertical anotada, o rótulo dela.
 *
 * O rótulo nasce dentro do `shape` porque só ele recebe a linha inteira do dado: o `LabelList` passa
 * apenas atributos SVG válidos e o índice que ele entrega conta retângulos desenhados (REC-5).
 *
 * Coluna negativa chega com `height` NEGATIVO e `y` na borda de baixo. O retângulo do pacote
 * normaliza ao desenhar; a conta do rótulo não. Por isso a normalização acontece aqui, uma vez.
 */
function renderVarianceColumn(polarity: RevenuePolarity) {
  return function VarianceColumn({ x = 0, y = 0, width = 0, height = 0, payload }: VarianceShapeProps): ReactElement | null {
    if (!payload) return null;
    const top = Math.min(y, y + height);
    const tall = Math.abs(height);
    const bottom = top + tall;
    const color = varianceColor(payload.variacao, polarity);
    const rotulo = payload.rotulo;
    /** Desvio negativo: o rótulo desce para além da ponta da própria coluna (ROT-7, GEO-4), onde nenhuma coluna vizinha chega; ao lado da coluna ele correria por baixo da vizinha. */
    const textY = payload.rotuloFora ? top - LABEL_GAP : bottom + LABEL_GAP + LABEL_CAP_HEIGHT;
    const textX = payload.rotuloFora
      ? x + width / 2
      : payload.rotuloAncora === 'start'
        ? x + width + LABEL_SIDE_GAP
        : x - LABEL_SIDE_GAP;
    return (
      <g>
        <rect fill={color} height={tall} rx={2} width={width} x={x} y={top} />
        {rotulo === null ? null : (
          <text
            className="font-display"
            fill={color}
            fontSize={11}
            fontWeight={500}
            style={HALO}
            textAnchor={payload.rotuloAncora}
            x={textX}
            y={textY}
          >
            {rotulo}
          </text>
        )}
      </g>
    );
  };
}

/** Três linhas de dica no painel principal: o payload automático traria só o realizado. */
function buildMainTooltipEntries(row: Row): readonly TooltipEntry[] {
  return [
    { color: REALIZADO_FILL, dataKey: 'realizado', graphicalItemId: 'realizado', name: 'Receita 2026', value: row.realizado },
    { color: ORCADO_STROKE, dataKey: 'orcado', graphicalItemId: 'orcado', name: 'Orçamento', value: row.orcado },
    { color: ANO_ANTERIOR_FILL, dataKey: 'anoAnterior', graphicalItemId: 'anoAnterior', name: 'Receita 2025', value: row.anoAnterior },
  ];
}

/** Uma linha de dica com o desvio e outra com o percentual contra a base daquele painel. */
function buildVarianceTooltipEntries(row: VarianceRow, polarity: RevenuePolarity): readonly TooltipEntry[] {
  const color = varianceColor(row.variacao, polarity);
  const fraction = fractionOfBase(row.variacao, row.base);
  const absolute: TooltipEntry = {
    color,
    dataKey: 'variacao',
    graphicalItemId: 'variacao',
    name: 'Desvio',
    value: signedCurrency(row.variacao),
  };
  if (fraction === null) return [absolute];
  return [absolute, { color, dataKey: 'base', graphicalItemId: 'base', name: 'Sobre a base', value: signedPercent(fraction) }];
}

interface VariancePanelArgs {
  readonly rows: readonly VarianceRow[];
  readonly domainMax: number;
  readonly ticks: readonly number[];
  readonly categoryTicks: readonly string[];
  readonly title: string;
  readonly heightClass: string;
  readonly showCategoryAxis: boolean;
  readonly margin: { readonly top: number; readonly right: number; readonly bottom: number; readonly left: number };
  readonly polarity: RevenuePolarity;
  readonly animate: boolean;
}

/**
 * Um painel de variação, desenhado duas vezes com escalas diferentes.
 *
 * As alturas são escolhidas para os dois planos saírem IGUAIS: o de cima esconde o eixo de categoria
 * e recebe essa altura de volta para o próprio plano, então o de baixo precisa de 22 px a mais para
 * não ficar com o corpo menor (REC-16, REC-17). Com 144 e 166 px os dois planos medem 96 px, e as
 * duas variações ficam comparáveis em proporção mesmo com domínios diferentes, que é o que cada
 * título escreve. A conta de cada um: `144 − 20 de título − 20 de margem de cima − 8 de margem de
 * baixo` e `166 − 20 − 20 − 30 de eixo de categoria`.
 */
function renderVariancePanel({
  rows,
  domainMax,
  ticks,
  categoryTicks,
  title,
  heightClass,
  showCategoryAxis,
  margin,
  polarity,
  animate,
}: VariancePanelArgs): ReactElement {
  const renderTooltip = (tooltipProps: { active?: boolean; label?: number | string }): ReactElement | null => {
    const vertical = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = vertical === undefined ? undefined : rows.find((candidate) => candidate.vertical === vertical);
    if (!tooltipProps.active || !row) return null;
    return <ChartTooltip active label={vertical} payload={buildVarianceTooltipEntries(row, polarity)} />;
  };

  return (
    <div className={cn('flex shrink-0 flex-col', heightClass)}>
      <p aria-hidden className="mb-1 shrink-0 truncate text-xs font-medium text-text-secondary">
        {title}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} barCategoryGap={VARIANCE_BAR_CATEGORY_GAP} data={[...rows]} margin={margin} syncId={SYNC_ID}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="vertical"
              hide={!showCategoryAxis}
              tickMargin={8}
              ticks={[...categoryTicks]}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[-domainMax, domainMax]}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              ticks={[...ticks]}
              interval={0}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" strokeWidth={1} y={0} />
            <Bar
              dataKey="variacao"
              isAnimationActive={animate}
              maxBarSize={VARIANCE_MAX_BAR_SIZE}
              minPointSize={MIN_POINT_SIZE}
              name="Desvio"
              shape={renderVarianceColumn(polarity)}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function VerticalRevenueVsTwoReferencesPanels({
  data = defaultData,
  polarity = 'maiorMelhor',
  height,
  className,
}: VerticalRevenueVsTwoReferencesPanelsProps) {
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
        <span>Nenhuma vertical neste recorte: não há receita, orçamento nem ano anterior para comparar.</span>
      </div>
    );
  }

  const rows = buildRows(data);
  const mainMax = rows.reduce((max, row) => Math.max(max, row.realizado, row.orcado, row.anoAnterior), 0);
  const mainDomain = buildDomain(mainMax, MAIN_GRID_STEPS);
  const orcadoRows = buildVarianceRows(rows, (row) => ({ variacao: row.desvioOrcado, base: row.orcado }), 'orçado');
  const anteriorRows = buildVarianceRows(rows, (row) => ({ variacao: row.desvioAnoAnterior, base: row.anoAnterior }), 'em 2025');
  const orcadoDomain = buildVarianceDomain(
    orcadoRows.reduce((max, row) => Math.max(max, Math.abs(row.variacao)), 0),
    VARIANCE_HEADROOM,
  );
  const anteriorDomain = buildVarianceDomain(
    anteriorRows.reduce((max, row) => Math.max(max, Math.abs(row.variacao)), 0),
    VARIANCE_HEADROOM,
  );
  const categoryTicks =
    rows.length <= CATEGORY_TICK_LIMIT
      ? rows.map((row) => row.vertical)
      : rows.filter((_, index) => index % 2 === 0).map((row) => row.vertical);

  const acimaOrcado = rows.filter((row) => !isBad(row.desvioOrcado, polarity) && row.desvioOrcado !== 0);
  const acimaAnterior = rows.filter((row) => !isBad(row.desvioAnoAnterior, polarity) && row.desvioAnoAnterior !== 0);
  /** A vertical em que as duas referências discordam mais: é ela que o visual existe para mostrar. */
  const divergente = rows.reduce<Row | null>((acc, row) => {
    const discorda = isBad(row.desvioOrcado, polarity) !== isBad(row.desvioAnoAnterior, polarity);
    if (!discorda) return acc;
    return acc === null || Math.abs(row.desvioOrcado) > Math.abs(acc.desvioOrcado) ? row : acc;
  }, null);
  const fracaoDivergente = divergente === null ? null : fractionOfBase(divergente.desvioAnoAnterior, divergente.anoAnterior);
  const divergencia =
    divergente === null || fracaoDivergente === null
      ? 'as duas referências concordam em todas as verticais'
      : `${divergente.vertical} sobe ${signedPercent(fracaoDivergente)} sobre 2025 e fica abaixo do orçado`;
  const reading = `${String(acimaOrcado.length)} de ${String(rows.length)} acima do orçamento e ${String(acimaAnterior.length)} de ${String(rows.length)} acima de 2025; ${divergencia}`;

  const summary = [
    `Três painéis com a receita de ${String(rows.length)} verticais: o nível em cima, as duas variações embaixo.`,
    `${String(acimaOrcado.length)} de ${String(rows.length)} verticais bateram o orçamento e ${String(acimaAnterior.length)} de ${String(rows.length)} cresceram contra 2025.`,
    divergente === null || fracaoDivergente === null
      ? 'Nenhuma vertical recebe leitura oposta das duas referências.'
      : `${divergente.vertical} sobe ${signedPercent(fracaoDivergente)} sobre 2025 e ainda fica abaixo do orçado.`,
  ].join(' ');

  const renderMainTooltip = (tooltipProps: { active?: boolean; label?: number | string }): ReactElement | null => {
    const vertical = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = vertical === undefined ? undefined : rows.find((candidate) => candidate.vertical === vertical);
    if (!tooltipProps.active || !row) return null;
    return <ChartTooltip active label={vertical} payload={buildMainTooltipEntries(row)} valueFormat="currencyCompact" />;
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
              Receita por vertical (R$)
            </p>
            <ul aria-hidden className="flex shrink-0 items-center gap-3 text-xs text-text-secondary">
              <li className="flex items-center gap-2">
                <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: REALIZADO_FILL }} />
                Receita 2026
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ border: `1.5px dashed ${ORCADO_STROKE}` }} />
                Orçamento
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="h-0.5 w-3 shrink-0" style={{ backgroundColor: ANO_ANTERIOR_FILL }} />
                Receita 2025
              </li>
            </ul>
          </div>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer height="100%" width="100%">
              <ComposedChart accessibilityLayer={false} barCategoryGap={MAIN_BAR_CATEGORY_GAP} data={[...rows]} margin={MAIN_MARGIN} syncId={SYNC_ID}>
                <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
                <XAxis {...AXIS_PROPS} axisLine={false} dataKey="vertical" hide ticks={[...categoryTicks]} />
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
                <Bar dataKey="realizado" isAnimationActive={animate} maxBarSize={MAIN_MAX_BAR_SIZE} shape={renderMainColumn(mainDomain.domainMax)} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        {renderVariancePanel({
          animate,
          categoryTicks,
          domainMax: orcadoDomain.domainMax,
          heightClass: 'h-36',
          margin: MIDDLE_MARGIN,
          polarity,
          rows: orcadoRows,
          showCategoryAxis: false,
          ticks: orcadoDomain.ticks,
          title: 'Desvio contra o orçamento (R$, escala própria)',
        })}
        {renderVariancePanel({
          animate,
          categoryTicks,
          domainMax: anteriorDomain.domainMax,
          heightClass: 'h-[166px]',
          margin: VARIANCE_MARGIN,
          polarity,
          rows: anteriorRows,
          showCategoryAxis: true,
          ticks: anteriorDomain.ticks,
          title: 'Desvio contra 2025 (R$, escala própria, mais larga que a de cima)',
        })}
      </div>
    </div>
  );
}
