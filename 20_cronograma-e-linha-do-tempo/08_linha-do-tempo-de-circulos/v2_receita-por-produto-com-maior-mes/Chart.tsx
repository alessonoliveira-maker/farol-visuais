import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  usePlotArea,
  useYAxisScale,
  XAxis,
  YAxis,
  ZAxis,
  type LabelProps,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CHART_SERIES_COLORS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyCompact, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyRevenue } from './data';

/**
 * Linha do tempo de círculos com uma faixa por produto e um círculo por mês. Todas as faixas
 * dividem o mesmo domínio de ZAxis, de zero ao maior mês do dado, então círculos de faixas
 * diferentes se comparam. As faixas vão do maior ao menor total do período, e o total vem escrito
 * à direita de cada faixa.
 */
export interface ProductTimelineProps {
  readonly data?: readonly MonthlyRevenue[];
  readonly height?: number;
  readonly className?: string;
}

interface Point extends MonthlyRevenue {
  readonly x: number;
  readonly y: number;
}

interface Lane {
  readonly product: string;
  readonly slot: number;
  readonly total: number;
}

const MARGIN = { top: 20, right: 128, bottom: 4, left: 8 } as const;
const Y_AXIS_WIDTH = 128;
const MS_PER_DAY = 86_400_000;
/** Meio mês de folga de cada lado: o primeiro e o último círculo não encostam na borda do eixo. */
const EDGE_PAD_DAYS = 15;
const TICK_EVERY_MONTHS = 3;
/** Área em px² do maior círculo; o diâmetro de 28 px cabe na faixa. */
const AREA_MAX = 600;
/** ACE-5: a maior opacidade mínima entre `--chart-1`, 3, 6 e 5 é 0,71 (a de `--chart-6`). */
const BUBBLE_FILL_OPACITY = 0.72;
const LEGEND_REFERENCES = [100_000, 400_000] as const;
const TOTAL_GAP = 12;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Milissegundos UTC do primeiro dia de um mês `YYYY-MM`. */
function monthMs(month: string): number {
  const [y, m] = month.split('-').map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, 1);
}

/** Primeiro dia do mês, em milissegundos UTC, deslocado por `shift` meses. */
function monthShift(ms: number, shift: number): number {
  const date = new Date(ms);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + shift, 1);
}

/** `YYYY-MM` de um instante em milissegundos UTC. */
function toMonth(ms: number): string {
  return new Date(ms).toISOString().slice(0, 7);
}

function slotColor(slot: number): string {
  return CHART_SERIES_COLORS[slot - 1] ?? CHART_SERIES_COLORS[0];
}

/** Raio em px do círculo cuja área segue a escala do ZAxis, de zero a `AREA_MAX`. */
function radiusOf(value: number, maxValue: number): number {
  return maxValue > 0 ? Math.sqrt(((value / maxValue) * AREA_MAX) / Math.PI) : 0;
}

/** Total do período; `null` para lista vazia (EST-1b). */
function sumRevenue(list: readonly MonthlyRevenue[]): number | null {
  return list.length === 0 ? null : list.reduce((sum, row) => sum + row.revenue, 0);
}

/** Mês de maior receita, ou `null` para lista vazia (EST-1b). */
function peakOf(list: readonly MonthlyRevenue[]): MonthlyRevenue | null {
  return list.reduce<MonthlyRevenue | null>((best, row) => (best === null || row.revenue > best.revenue ? row : best), null);
}

/** Totais escritos à direita de cada faixa, posicionados pela escala do eixo Y. */
function PeriodTotals({ lanes }: { readonly lanes: readonly Lane[] }): ReactElement | null {
  const yScale = useYAxisScale();
  const area = usePlotArea();
  if (!yScale || !area) return null;
  const x = area.x + area.width + TOTAL_GAP;
  return (
    <g>
      <text className="font-display tabular-nums" fill="var(--text-muted)" fontSize={11} x={x} y={area.y - 8}>
        Total em 24 meses
      </text>
      {lanes.map((lane, index) => {
        const y = yScale(lanes.length - 1 - index);
        if (y === undefined) return null;
        return (
          <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={600} key={lane.product} x={x} y={y + 4}>
            {formatCurrencyCompact(lane.total)}
          </text>
        );
      })}
    </g>
  );
}

export default function ProductTimeline({ data = defaultData, height, className }: ProductTimelineProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  /** Mês sem receita medida maior que zero não tem área: sai do desenho e do total. */
  const rows = data.filter((row) => row.revenue > 0);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma receita neste recorte: não há mês com valor para desenhar.</span>
      </div>
    );
  }

  const lanes: Lane[] = [...new Set(rows.map((row) => row.product))]
    .map((product) => {
      const own = rows.filter((row) => row.product === product);
      return { product, slot: own[0]?.slot ?? 1, total: sumRevenue(own) ?? 0 };
    })
    .sort((a, b) => b.total - a.total);
  const laneCount = lanes.length;
  const maxValue = Math.max(...rows.map((row) => row.revenue));
  const months = rows.map((row) => monthMs(row.month));
  const firstMs = Math.min(...months);
  const lastMs = Math.max(...months);
  const domainX: [number, number] = [firstMs - EDGE_PAD_DAYS * MS_PER_DAY, lastMs + EDGE_PAD_DAYS * MS_PER_DAY];
  const ticks: number[] = [];
  for (let cursor = firstMs; cursor <= lastMs; cursor = monthShift(cursor, TICK_EVERY_MONTHS)) ticks.push(cursor);
  const laneTicks = lanes.map((_, index) => index);
  const peak = peakOf(rows);
  const grandTotal = sumRevenue(rows);
  const leader = lanes[0];
  const legendValues = [...LEGEND_REFERENCES.filter((value) => value < maxValue), maxValue];
  const legendBox = Math.ceil(2 * radiusOf(maxValue, maxValue));

  // REC-13: dentro de cada faixa os maiores vão primeiro, para o menor não ficar sob o vizinho.
  const seriesOf = (lane: Lane): Point[] =>
    rows
      .filter((row) => row.product === lane.product)
      .map((row) => ({ ...row, x: monthMs(row.month), y: laneCount - 1 - lanes.indexOf(lane) }))
      .sort((a, b) => b.revenue - a.revenue);

  const reading =
    peak && grandTotal !== null && leader
      ? `${peak.product === leader.product ? `${leader.product} tem o maior mês, ${formatCurrencyCompact(peak.revenue)} em ${formatMonthShort(`${peak.month}-01`)}, e lidera o período` : `${peak.product} tem o maior mês, ${formatCurrencyCompact(peak.revenue)} em ${formatMonthShort(`${peak.month}-01`)}; ${leader.product} lidera o período`} com ${formatPercent(leader.total / grandTotal, 0)} da receita. Faixas do maior ao menor total.`
      : '';

  const summary = [
    `Linha do tempo de círculos com a receita mensal de ${formatInt(laneCount)} produtos, de ${formatMonthShort(`${toMonth(firstMs)}-01`)} a ${formatMonthShort(`${toMonth(lastMs)}-01`)}.`,
    peak ? `O maior mês é de ${peak.product}, ${formatCurrencyCompact(peak.revenue)} em ${formatMonthShort(`${peak.month}-01`)}.` : '',
    leader && grandTotal !== null ? `${leader.product} lidera, com ${formatCurrencyCompact(leader.total)} de ${formatCurrencyCompact(grandTotal)} no período.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'month', name: 'Mês', value: formatMonthShort(`${point.month}-01`) },
      { dataKey: 'revenue', name: 'Receita', value: formatCurrency(point.revenue, 0) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.product} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  /** Anotação só no maior círculo: o texto sobe pelo raio dele (a caixa do rótulo tem 2 x raio). */
  const renderPeakLabel = (series: readonly Point[]) =>
    function PeakLabel({ x, y, width, height: boxHeight, index }: LabelProps): ReactElement | null {
      const point = index === undefined ? undefined : series[index];
      if (x === undefined || y === undefined || !point || point.id !== peak?.id) return null;
      const cx = Number(x) + Number(width ?? 0) / 2;
      const cy = Number(y) + Number(boxHeight ?? 0) / 2;
      return (
        <text className="font-display" fill="var(--text-primary)" fontSize={11} fontWeight={700} style={HALO} textAnchor="middle" x={cx} y={cy - Number(boxHeight ?? 0) / 2 - 6}>
          {`maior mês, ${formatMonthShort(`${point.month}-01`)}: ${formatCurrencyCompact(point.revenue)}`}
        </text>
      );
    };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            {/* EIX-3b: tempo e faixa são lidos por posição, então a grade corre nos dois sentidos. */}
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="x"
              domain={domainX}
              interval={0}
              tickFormatter={(value: number) => formatMonthShort(`${toMonth(value)}-01`)}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              type="number"
            />
            {/* REC-14: eixo de categoria abriria uma banda por ponto; o numérico com tique nomeado não. */}
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="y"
              domain={[-0.5, laneCount - 0.5]}
              interval={0}
              tickFormatter={(value: number) => lanes[laneCount - 1 - value]?.product ?? ''}
              tickLine={false}
              tickMargin={8}
              ticks={laneTicks}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            {/* REC-31: área em px², de 0 ao maior mês, igual em todas as faixas. */}
            <ZAxis dataKey="revenue" domain={[0, maxValue]} range={[0, AREA_MAX]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {lanes.map((lane) => {
              const series = seriesOf(lane);
              return (
                <Scatter
                  data={series}
                  fill={slotColor(lane.slot)}
                  fillOpacity={BUBBLE_FILL_OPACITY}
                  isAnimationActive={animate}
                  key={lane.product}
                  stroke="var(--surface-raised)"
                  strokeWidth={1}
                >
                  <LabelList content={renderPeakLabel(series)} dataKey="revenue" />
                </Scatter>
              );
            })}
            <PeriodTotals lanes={lanes} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 items-end gap-6 text-[0.6875rem] text-text-muted">
        <span>Receita no mês</span>
        {legendValues.map((value) => {
          const radius = radiusOf(value, maxValue);
          return (
            <span className="flex items-end gap-2" key={value}>
              <svg height={legendBox} width={legendBox}>
                <circle cx={legendBox / 2} cy={legendBox - radius} fill="var(--text-muted)" fillOpacity={BUBBLE_FILL_OPACITY} r={radius} stroke="var(--surface-raised)" strokeWidth={1} />
              </svg>
              <span className="font-display tabular-nums">{formatCurrencyCompact(value)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
