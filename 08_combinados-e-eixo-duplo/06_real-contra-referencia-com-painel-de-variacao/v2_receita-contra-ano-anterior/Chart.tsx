import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, CartesianGrid, ComposedChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { basePercentFloor, data as defaultData, type MonthlyRevenueVsLastYear } from './data';

/**
 * Dois painéis alinhados pelo mesmo eixo x e pelo mesmo `syncId`: em cima, a receita de cada mês
 * de 2026 em coluna sólida dentro do contorno vazado do mesmo mês de 2025; embaixo, a variação
 * contra 2025 em reais, com escala própria e cor pela polaridade da métrica.
 *
 * O que esta versão resolve, e a v1 não: a variação percentual só é publicável quando a base
 * aguenta, então o percentual é escrito acima do piso de base e abaixo dele sai só a variação
 * absoluta; e só os dois maiores desvios levam rótulo, cada um nomeando a base na mesma linha.
 */
export interface MonthlyRevenueVsLastYearPanelsProps {
  readonly data?: readonly MonthlyRevenueVsLastYear[];
  /** Polaridade da métrica: receita é "maiorMelhor". Decide a cor da variação, nunca o sinal dela. */
  readonly polarity?: RevenuePolarity;
  /** Piso de base para publicar percentual. Abaixo dele, o rótulo escreve só a variação absoluta. */
  readonly percentFloor?: number;
  readonly height?: number;
  readonly className?: string;
}

/** "maiorMelhor": crescer é bom. "menorMelhor": crescer é ruim. */
export type RevenuePolarity = 'maiorMelhor' | 'menorMelhor';

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

const SYNC_ID = 'receita-contra-ano-anterior';
/**
 * A margem inferior do painel principal reserva os 8 px em que o tique `R$ 0` do eixo de valor é
 * escrito: com margem zero e o eixo de categoria escondido, o tique da base fica sem espaço e o
 * eixo o descarta em silêncio, o que foi medido no primeiro render. A margem esquerda e a direita
 * são idênticas nos dois painéis, que é o lado que precisa alinhar (REC-16).
 */
const MAIN_MARGIN = { top: 20, right: 12, bottom: 8, left: 0 } as const;
const VARIANCE_MARGIN = { top: 20, right: 12, bottom: 0, left: 0 } as const;
/**
 * Largura do eixo de valor. A `EIX-6` pede de 48 a 64 px, e a conta glifo a glifo não cabe nesse
 * teto: o tique mais largo do painel de variação é `R$ -300 mil`, que mede 59,43 px de tinta em
 * Space Grotesk com dígito tabular a 11 px e pede 77,43 px de eixo somada a sobrecarga de 18 px
 * (tickSize 6, tickMargin 8 e a folga de p99). Declaro 84 px (a conta pedia 77,43, mas o tique negativo de centenas de milhar só fica em uma linha com 81 px, EIX-6 emenda de 2026-10-02) e registro a
 * tensão, que é decisão do dono do catálogo e está escrita na nota do `meta.json`.
 */
const Y_AXIS_WIDTH = 84;
/** Quantos degraus de grade o painel principal tenta usar: 4 degraus, 5 linhas (EIX-4). */
const MAIN_GRID_STEPS = 4;
/** Folga acima do maior desvio, para o rótulo anotado caber além da ponta da coluna. */
const VARIANCE_HEADROOM = 1.35;
const CATEGORY_TICK_LIMIT = 8;
const REALIZADO_FILL = 'var(--chart-1)';
/** A base usa a mesma cor do realizado, só vazada e tracejada: mede o mesmo 5,90:1 (17.10). */
const BASE_STROKE = 'var(--chart-1)';
/**
 * Coluna fantasma (ESP-6, ESP-2): uma série só por banda, no dado do realizado, e o contorno da
 * base desenhado pelo `shape` a partir da escala do eixo. Canvas de 760 px de largura dá corpo de
 * 694 px; descontados o eixo de 84 px e a margem direita de 12 px sobram 598 px de plano, então o
 * passo de 12 meses mede 49,83 px, o fantasma `49,83 × (1 − 2 × 0,30)` mede 19,93 px e o sólido
 * central (`MAIN_SOLID_RATIO`) mede 12,95 px, os dois acima do piso de 12 px da ESP-2.
 */
const MAIN_BAR_CATEGORY_GAP = '30%';
const MAIN_MAX_BAR_SIZE = 22;
const MAIN_SOLID_RATIO = 0.65;
const VARIANCE_BAR_CATEGORY_GAP = '30%';
const VARIANCE_MAX_BAR_SIZE = 20;
/** Sem isso um desvio de poucos mil reais não desenha marca nenhuma no plano de 122 px. */
const MIN_POINT_SIZE = 3;
/** Vão entre a tinta do rótulo anotado e a ponta da coluna. */
const LABEL_GAP = 6;
/** Vão lateral entre a tinta do rótulo de dentro e a borda da própria coluna (GEO-4). */
const LABEL_SIDE_GAP = 4;
/** Quantos desvios recebem rótulo: os dois maiores em valor absoluto, e o resto fica silencioso. */
const ANNOTATED = 2;
/** Halo na cor do cartão: o rótulo anotado cruza a linha de grade do painel de variação (ROT-7). */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface Row extends MonthlyRevenueVsLastYear {
  readonly variacao: number;
  /** Fração de variação contra a base, ou `null` quando a base não alcança o piso declarado. */
  readonly fracao: number | null;
  /** Texto do rótulo anotado, ou `null` no mês silencioso. */
  readonly rotulo: string | null;
  /** `true` põe a tinta além da ponta da coluna; `false` põe dentro do vão dela. */
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

/** O passo redondo seguinte, na escada 1, 2, 5, 10: serve para fechar a contagem de linhas. */
function nextNiceStep(step: number): number {
  return niceStep(step * 1.5 + 1);
}

/**
 * Domínio a partir do zero com no máximo `steps` degraus redondos (EIX-1, EIX-4). O laço existe
 * porque o passo redondo do primeiro chute às vezes precisa de um degrau extra para cobrir o maior
 * valor, e aí a grade passaria do teto de 5 linhas que a EIX-4 pede em cartão.
 */
function buildDomain(maxValue: number, steps: number): { domainMax: number; ticks: readonly number[] } {
  let step = niceStep(maxValue / steps);
  while (Math.ceil(maxValue / step) > steps) step = nextNiceStep(step);
  const domainMax = Math.max(step, Math.ceil(maxValue / step) * step);
  const count = Math.round(domainMax / step);
  return { domainMax, ticks: Array.from({ length: count + 1 }, (_, index) => index * step) };
}

/**
 * Domínio simétrico com folga acima do maior desvio e cinco linhas de grade.
 *
 * A folga não é enfeite: sem ela a coluna do maior desvio encosta na borda do plano e o rótulo
 * anotado dela não tem onde nascer. Com `VARIANCE_HEADROOM` de 1,35 o maior desvio ocupa cerca de
 * dois terços da metade do plano e sobram cerca de 21 px além da ponta, contra os 17 px que a
 * tinta de 11 px mais o vão de 6 px pedem.
 */
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

/**
 * Fração de variação contra a base, ou `null` quando a base não alcança o piso.
 *
 * Devolve `null` e nunca `0` (EST-1b): base pequena não produz percentual pequeno, produz
 * percentual sem sentido, e é isso que o piso declarado evita.
 */
function percentOfBase(variacao: number, base: number, floor: number): number | null {
  if (base < floor || base <= 0) return null;
  return variacao / base;
}

/** O rótulo anotado: percentual quando a base aguenta, variação absoluta quando não (NUM-4). */
function annotatedLabel(row: Omit<Row, 'rotulo' | 'rotuloAncora' | 'rotuloFora'>): string {
  const valor = row.fracao === null ? signedCurrency(row.variacao) : signedPercent(row.fracao);
  return `${valor} contra ${formatCurrencyCompact(row.baseAnterior)} em ${formatMonthShort(row.baseMonth)}`;
}

/**
 * Deriva a variação, a fração contra a base e quem recebe rótulo.
 *
 * Os dois maiores desvios em valor absoluto ganham rótulo e o resto fica silencioso: com 12 meses e
 * rótulo de até 226 px de tinta, escrever os doze empilharia texto sobre texto. A âncora é decidida
 * pela posição da coluna na série, para a tinta correr para dentro do plano e nunca sair dele.
 */
function buildRows(
  rows: readonly MonthlyRevenueVsLastYear[],
  floor: number,
): readonly Row[] {
  const derived = rows.map((row) => {
    const variacao = row.realizado - row.baseAnterior;
    return { ...row, variacao, fracao: percentOfBase(variacao, row.baseAnterior, floor) };
  });
  const annotated = new Set(
    [...derived]
      .sort((first, second) => Math.abs(second.variacao) - Math.abs(first.variacao))
      .slice(0, ANNOTATED)
      .map((row) => row.month),
  );
  const middle = derived.length / 2;
  return derived.map((row, index) => {
    const ancora: 'end' | 'start' = index < middle ? 'start' : 'end';
    return {
      ...row,
      rotulo: annotated.has(row.month) ? annotatedLabel(row) : null,
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
 * Coluna fantasma do painel principal, ancorada no REALIZADO e não na referência.
 *
 * A diferença importa: ancorada na referência, um mês de base zero ou ausente deixaria a série sem
 * retângulo e levaria o realizado embora junto. Ancorada no realizado, a geometria do Recharts já é
 * a da coluna sólida e o contorno da base sai da escala do eixo, `plano / domínio`, que é a mesma
 * conta que o eixo usa.
 */
function renderMainColumn(domainMax: number) {
  return function MainColumn({ x = 0, y = 0, width = 0, height = 0, background, payload }: MainShapeProps): ReactElement | null {
    if (!payload) return null;
    const solidWidth = width * MAIN_SOLID_RATIO;
    const plotHeight = background?.height ?? 0;
    /** `domainMax` nunca é zero: `buildDomain` devolve no mínimo um passo redondo. */
    const scale = plotHeight / domainMax;
    const baseline = y + height;
    const baseHeight = payload.baseAnterior * scale;
    return (
      <g>
        <rect
          fill="none"
          height={baseHeight}
          rx={2}
          stroke={BASE_STROKE}
          strokeDasharray="3 3"
          strokeWidth={1.5}
          width={width}
          x={x}
          y={baseline - baseHeight}
        />
        <rect fill={REALIZADO_FILL} height={height} rx={3} width={solidWidth} x={x + (width - solidWidth) / 2} y={y} />
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
 * Coluna de variação e, nos dois meses anotados, o rótulo dela.
 *
 * O rótulo nasce aqui dentro, e não num `LabelList`, porque o `shape` é o único lugar que recebe a
 * linha inteira do dado: o `LabelList` só passa atributos SVG válidos, e o índice que ele entrega
 * conta os retângulos desenhados, não as linhas do array (REC-5).
 *
 * Coluna negativa chega com `height` NEGATIVO e `y` na borda de baixo. O retângulo do pacote
 * normaliza ao desenhar; a conta do rótulo não normaliza nada. Por isso a normalização acontece
 * aqui, uma vez, e serve às duas.
 */
function renderVarianceColumn(polarity: RevenuePolarity) {
  return function VarianceColumn({ x = 0, y = 0, width = 0, height = 0, payload }: VarianceShapeProps): ReactElement | null {
    if (!payload) return null;
    const top = Math.min(y, y + height);
    const tall = Math.abs(height);
    const bottom = top + tall;
    const color = varianceColor(payload.variacao, polarity);
    const rotulo = payload.rotulo;
    /**
     * Fora: a tinta vai além da ponta, acima dela, onde a folga do domínio abriu espaço. Dentro: a
     * tinta fica no vão da própria coluna, acima da ponta de baixo, e encostada na borda dela pelo
     * lado de fora, para o halo não apagar justamente a marca que o rótulo explica (GEO-4).
     */
    const textY = payload.rotuloFora ? top - LABEL_GAP : bottom - LABEL_GAP;
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

/** Duas linhas de dica no painel principal: o payload automático traria só o realizado. */
function buildMainTooltipEntries(row: Row): readonly TooltipEntry[] {
  return [
    { color: REALIZADO_FILL, dataKey: 'realizado', graphicalItemId: 'realizado', name: 'Receita 2026', value: row.realizado },
    { color: BASE_STROKE, dataKey: 'baseAnterior', graphicalItemId: 'baseAnterior', name: 'Receita 2025', value: row.baseAnterior },
  ];
}

/**
 * Uma linha de dica com a variação absoluta e, quando a base aguenta, outra com o percentual. O
 * sinal é tipográfico à mão (NUM-3), porque o formatador de moeda imprimiria hífen.
 */
function buildVarianceTooltipEntries(row: Row, polarity: RevenuePolarity): readonly TooltipEntry[] {
  const color = varianceColor(row.variacao, polarity);
  const absolute: TooltipEntry = {
    color,
    dataKey: 'variacao',
    graphicalItemId: 'variacao',
    name: 'Variação',
    value: signedCurrency(row.variacao),
  };
  if (row.fracao === null) return [absolute];
  return [
    absolute,
    { color, dataKey: 'fracao', graphicalItemId: 'fracao', name: 'Sobre a base', value: signedPercent(row.fracao) },
  ];
}

export default function MonthlyRevenueVsLastYearPanels({
  data = defaultData,
  polarity = 'maiorMelhor',
  percentFloor = basePercentFloor,
  height,
  className,
}: MonthlyRevenueVsLastYearPanelsProps) {
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
        <span>Nenhum mês neste recorte: não há receita de 2026 nem de 2025 para comparar.</span>
      </div>
    );
  }

  const rows = buildRows(data, percentFloor);
  const mainMax = rows.reduce((max, row) => Math.max(max, row.realizado, row.baseAnterior), 0);
  const mainDomain = buildDomain(mainMax, MAIN_GRID_STEPS);
  const varianceMax = rows.reduce((max, row) => Math.max(max, Math.abs(row.variacao)), 0);
  const varianceDomain = buildVarianceDomain(varianceMax, VARIANCE_HEADROOM);
  const xTicks =
    rows.length <= CATEGORY_TICK_LIMIT
      ? rows.map((row) => row.month)
      : rows.filter((_, index) => index % 2 === 0).map((row) => row.month);

  const grew = rows.filter((row) => row.variacao > 0);
  const worst = rows.reduce<Row | null>((acc, row) => (acc === null || row.variacao < acc.variacao ? row : acc), null);
  const queda =
    worst === null || worst.variacao >= 0
      ? 'nenhum mês ficou abaixo de 2025'
      : `a maior queda é ${formatMonthShort(worst.month)}, ${formatCurrencyCompact(Math.abs(worst.variacao))} abaixo de ${formatMonthShort(worst.baseMonth)}`;
  const reading = `${String(grew.length)} de ${String(rows.length)} meses cresceram contra 2025; ${queda}`;

  const summary = [
    `Dois painéis com a receita mensal de ${String(rows.length)} meses de 2026 contra o mesmo mês de 2025: o nível em cima, a variação embaixo.`,
    `${String(grew.length)} de ${String(rows.length)} meses cresceram.`,
    worst === null || worst.variacao >= 0
      ? 'Nenhum mês ficou abaixo do mesmo mês de 2025.'
      : `A maior queda foi em ${formatMonthShort(worst.month)}, ${formatCurrencyCompact(Math.abs(worst.variacao))} abaixo de ${formatMonthShort(worst.baseMonth)}.`,
  ].join(' ');

  const renderMainTooltip = (tooltipProps: { active?: boolean; label?: number | string }): ReactElement | null => {
    const month = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = month === undefined ? undefined : rows.find((candidate) => candidate.month === month);
    if (!tooltipProps.active || !row) return null;
    return (
      <ChartTooltip active label={month} labelFormat="month" payload={buildMainTooltipEntries(row)} valueFormat="currencyCompact" />
    );
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
              Receita mensal (R$)
            </p>
            <ul aria-hidden className="flex shrink-0 items-center gap-4 text-xs text-text-secondary">
              <li className="flex items-center gap-2.5">
                <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: REALIZADO_FILL }} />
                Receita 2026
              </li>
              <li className="flex items-center gap-2.5">
                <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ border: `1.5px dashed ${BASE_STROKE}` }} />
                Receita 2025
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
                <Bar dataKey="realizado" isAnimationActive={animate} maxBarSize={MAIN_MAX_BAR_SIZE} shape={renderMainColumn(mainDomain.domainMax)} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex h-48 shrink-0 flex-col">
          <p aria-hidden className="mb-1 shrink-0 truncate text-xs font-medium text-text-secondary">
            {`Variação contra 2025 (R$, escala própria; % só com base acima de ${formatCurrencyCompact(percentFloor)})`}
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
