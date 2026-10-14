import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { AXIS_PROPS, CHART_SERIES_COLORS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  capacity as defaultCapacity,
  data as defaultData,
  stages as defaultStages,
  type QueueWeek,
  type StageDefinition,
} from './data';

/**
 * Colunas empilhadas com o estoque da fila de pré-vendas por etapa e uma linha de teto na mesma
 * unidade, oportunidades em aberto. A altura da pilha e a altura do teto se comparam direto: o
 * que a peça afirma é em quais semanas a fila passou da capacidade da equipe.
 */
export interface QueueVsCapacityProps {
  readonly data?: readonly QueueWeek[];
  /** Etapas da base da pilha para o topo. */
  readonly stages?: readonly StageDefinition[];
  /** Teto de capacidade da equipe, em oportunidades em aberto. */
  readonly capacity?: number;
  readonly height?: number;
  readonly className?: string;
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

interface QueueRow extends QueueWeek {
  readonly total: number;
}

const GRID_STEPS = 4;
const MARGIN = { top: 30, right: 10, bottom: 0, left: 0 } as const;
/** EIX-6: contagem de três algarismos cabe no piso da faixa. */
const Y_AXIS_WIDTH = 48;
const TICK_MARGIN = 8;
/** EIX-6b: `tickMargin` de 8 px mais cerca de 15 px de tinta de uma linha de 11 px. */
const X_AXIS_HEIGHT = 24;
const BAR_CATEGORY_GAP = '30%';
/**
 * ESP-6: a pilha inteira ocupa um lugar só na banda, então não há `barGap` a declarar. Passo
 * = 836 / 26 = 32,2 px e espessura = 32,2 × (1 − 2 × 0,30) = 12,9 px, acima do piso de 12 px da
 * ESP-2 e abaixo do teto de 24 px.
 */
const BAR_MAX = 24;
const STACK_ID = 'fila';
/** Vão entre camadas vizinhas da pilha (COR-5): as cores categóricas não contrastam entre si. */
const SEGMENT_GAP = 2;
const TOTAL_LABEL_GAP = 6;
/**
 * TOK-10: nenhum token alcança 3:1 contra o cartão e contra a coluna ao mesmo tempo, então o teto
 * ganha um fundo próprio, um revestimento na cor do cartão desenhado por baixo do traço e com o
 * mesmo tracejado, em vez de uma cor que só funcionaria fora da pilha.
 */
const CAPACITY_STROKE = 'var(--text-muted)';
const CAPACITY_UNDERLAY = 'var(--surface-raised)';
const CAPACITY_DASH = '6 4';
const CAPACITY_WIDTH = 1.5;
const CAPACITY_UNDERLAY_WIDTH = 5;
/** Faixa reservada no topo do corpo: o rótulo do teto nunca compete com o total de uma coluna (REC-4). */
const CAPACITY_LABEL_Y = MARGIN.top - 16;
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;

/** Menor número redondo (1, 2 ou 5 vezes uma potência de 10) que não fica abaixo do passo pedido. */
function niceStep(roughStep: number): number {
  if (roughStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(roughStep));
  const magnitude = 10 ** exponent;
  const fraction = roughStep / magnitude;
  const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * magnitude;
}

/** Domínio a partir do zero, terminando na primeira linha de grade redonda acima do maior valor (EIX-1, EIX-4). */
function buildDomain(maxValue: number): { domainMax: number; ticks: readonly number[] } {
  const step = niceStep(maxValue / GRID_STEPS);
  const domainMax = Math.ceil(maxValue / step) * step;
  const count = Math.round(domainMax / step);
  return { domainMax, ticks: Array.from({ length: count + 1 }, (_, index) => index * step) };
}

function stageColor(stage: StageDefinition): string {
  return CHART_SERIES_COLORS[stage.slot - 1] ?? 'var(--chart-1)';
}

/** Um tique por mês presente no dado, ancorado na primeira semana daquele mês (REC-21). */
function monthAnchorTicks(rows: readonly QueueRow[]): readonly string[] {
  const seen = new Set<string>();
  const ticks: string[] = [];
  for (const row of rows) {
    const month = row.week.slice(0, 7);
    if (seen.has(month)) continue;
    seen.add(month);
    ticks.push(row.week);
  }
  return ticks;
}

/**
 * Segmento da pilha com o vão da COR-5 aberto na base. O primeiro segmento não abre vão, porque a
 * base dele é o zero do eixo, e a altura sai de baixo para o topo da pilha continuar no valor exato.
 *
 * A forma própria também impede o Recharts de descartar o retângulo de altura zero, o que mantém o
 * índice de cada rótulo alinhado com a linha do dado (REC-11).
 */
function segmentShape(fill: string, isBase: boolean) {
  return ({ x, y, width, height }: BarShapeProps): ReactElement => {
    const gap = isBase ? 0 : SEGMENT_GAP;
    const drawnHeight = height - gap;
    if (width <= 0 || drawnHeight <= 0) return <g />;
    return <rect fill={fill} height={drawnHeight} width={width} x={x} y={y} />;
  };
}

/** A âncora do total não desenha nada: ela existe só para o rótulo nascer no topo exato da pilha. */
function anchorShape(): ReactElement {
  return <g />;
}

export default function QueueVsCapacity({
  data = defaultData,
  stages = defaultStages,
  capacity = defaultCapacity,
  height,
  className,
}: QueueVsCapacityProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0 || stages.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não há fila em aberto para comparar com o teto.</span>
      </div>
    );
  }

  const keys = stages.map((stage) => stage.key);
  const rows: readonly QueueRow[] = data.map((row) => ({
    ...row,
    total: keys.reduce((sum, key) => sum + row[key], 0),
  }));
  const maxTotal = rows.reduce((max, row) => Math.max(max, row.total), 0);
  const { domainMax, ticks } = buildDomain(Math.max(maxTotal, capacity));
  const xTicks = monthAnchorTicks(rows);

  const over = rows.filter((row) => row.total > capacity);
  const peak = rows.reduce<QueueRow | null>(
    (best, row) => (best === null || row.total > best.total ? row : best),
    null,
  );

  const summary = [
    `Gráfico de colunas empilhadas com o estoque da fila de pré-vendas em ${formatInt(rows.length)} semanas, dividido em ${formatInt(stages.length)} etapas, contra o teto de ${formatInt(capacity)} oportunidades.`,
    `${formatInt(over.length)} semanas passaram o teto.`,
    peak === null
      ? ''
      : `Pico de ${formatInt(peak.total)} oportunidades em ${formatDate(peak.week)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  /** Ordem visual da pilha, do topo para a base: é a ordem da legenda e a da dica (ROT-4, DIC-4). */
  const visualOrder = [...stages].reverse();

  const buildTooltipEntries = (row: QueueRow): readonly TooltipEntry[] =>
    visualOrder.map((stage) => ({
      color: stageColor(stage),
      dataKey: stage.key,
      graphicalItemId: stage.key,
      name: stage.label,
      value: row[stage.key],
    }));

  const renderTotal = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const above = row.total > capacity;
    return (
      <text
        className="font-display"
        dominantBaseline="auto"
        fill={above ? 'var(--negative)' : 'var(--text-muted)'}
        fontSize={11}
        fontWeight={above ? 600 : 500}
        style={HALO}
        textAnchor="middle"
        x={Number(x) + Number(width) / 2}
        y={Number(y) - TOTAL_LABEL_GAP}
      >
        {formatInt(row.total)}
      </text>
    );
  };

  const renderCapacityLabel = ({
    viewBox,
  }: {
    readonly viewBox?: { readonly x?: number; readonly width?: number };
  }): ReactElement => (
    <text
      className="font-sans"
      fill="var(--text-muted)"
      fontSize={11}
      style={HALO}
      textAnchor="end"
      x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0)}
      y={CAPACITY_LABEL_Y}
    >
      teto <tspan className="font-display">{formatInt(capacity)}</tspan> oportunidades
    </text>
  );

  const renderTooltip = (tooltipProps: TooltipContentProps): ReactElement | null => {
    const week = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = week === undefined ? undefined : rows.find((candidate) => candidate.week === week);
    if (!tooltipProps.active || !row) return null;
    return (
      <ChartTooltip
        active={tooltipProps.active}
        label={week}
        labelFormat="date"
        payload={buildTooltipEntries(row)}
        showTotal
        valueFormat="int"
      />
    );
  };

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="img"
      style={style}
    >
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-5 text-text-secondary">
        {visualOrder.map((stage) => (
          <li className="flex items-center gap-2" key={stage.key}>
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: stageColor(stage) }}
            />
            {stage.label}
          </li>
        ))}
      </ul>
      {/* Sem `truncate`, pela TIP-7: a cauda desta linha carrega o pico, que é conclusão. */}
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="kpi-number font-semibold text-text-primary">{formatInt(over.length)}</span>{' '}
        das <span className="tabular-nums">{formatInt(rows.length)}</span> semanas passaram o teto de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(capacity)}</span>{' '}
        oportunidades
        {peak === null ? null : (
          <>
            ; pico de{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(peak.total)}</span>{' '}
            em {formatDate(peak.week)}
          </>
        )}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart
            accessibilityLayer={false}
            barCategoryGap={BAR_CATEGORY_GAP}
            data={[...rows]}
            margin={MARGIN}
          >
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="week"
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickMargin={TICK_MARGIN}
              ticks={[...xTicks]}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, domainMax]}
              tickFormatter={(value: number) => formatInt(value)}
              tickMargin={TICK_MARGIN}
              ticks={[...ticks]}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={renderTooltip}
              cursor={{ fill: 'var(--line-subtle)' }}
              isAnimationActive={false}
            />
            {stages.map((stage, index) => (
              <Bar
                dataKey={stage.key}
                fill={stageColor(stage)}
                isAnimationActive={animate}
                key={stage.key}
                maxBarSize={BAR_MAX}
                name={stage.label}
                shape={segmentShape(stageColor(stage), index === 0)}
                stackId={STACK_ID}
              />
            ))}
            <Bar
              dataKey="anchor"
              isAnimationActive={false}
              legendType="none"
              maxBarSize={BAR_MAX}
              name="Total da fila"
              shape={anchorShape}
              stackId={STACK_ID}
            >
              <LabelList content={renderTotal} dataKey="anchor" />
            </Bar>
            <ReferenceLine
              ifOverflow="extendDomain"
              stroke={CAPACITY_UNDERLAY}
              strokeDasharray={CAPACITY_DASH}
              strokeWidth={CAPACITY_UNDERLAY_WIDTH}
              y={capacity}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderCapacityLabel}
              stroke={CAPACITY_STROKE}
              strokeDasharray={CAPACITY_DASH}
              strokeWidth={CAPACITY_WIDTH}
              y={capacity}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
