import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  LabelList,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  type LabelProps,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyCompact, formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyResult } from './data';

/**
 * Linha do tempo de círculos com três estados que não se confundem: receita (círculo cheio), estorno
 * (contorno vazado, com a área do valor absoluto e o sinal no texto) e zero medido (ponto mínimo com
 * o texto R$ 0). O mês sem coleta é uma faixa neutra com a palavra indisponível, nunca um círculo.
 */
export interface ResultTimelineProps {
  readonly data?: readonly MonthlyResult[];
  readonly height?: number;
  readonly className?: string;
}

type MarkKind = 'receita' | 'estorno' | 'zero';

interface Point {
  readonly id: string;
  readonly product: string;
  readonly month: string;
  readonly kind: MarkKind;
  /** Valor com sinal: o estorno é negativo aqui, e só a área usa o absoluto. */
  readonly value: number;
  readonly x: number;
  readonly y: number;
  /** Valor absoluto, que alimenta o ZAxis; nunca negativo. */
  readonly size: number;
  /** Receita do mesmo mês e produto, para o rótulo do estorno passar por fora dela. */
  readonly revenue: number;
}

const MARGIN = { top: 8, right: 24, bottom: 4, left: 8 } as const;
const Y_AXIS_WIDTH = 116;
const MS_PER_DAY = 86_400_000;
const HALF_MONTH_DAYS = 15;
const EDGE_PAD_DAYS = 16;
/** Área em px² do maior círculo; o diâmetro de 44 px cabe na faixa de cerca de 56 px. */
const AREA_MAX = 1500;
/** ACE-5: `--chart-1` composto com o cartão fica acima de 3:1 nos dois temas a partir de 0,66. */
const BUBBLE_FILL_OPACITY = 0.72;
const REFUND_STROKE_WIDTH = 2;
const ZERO_RADIUS = 3;
const LABEL_GAP = 12;
const LEGEND_REFERENCES = [50_000, 200_000] as const;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

function monthMs(month: string): number {
  const [y, m] = month.split('-').map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, 1);
}

function monthLabel(month: string): string {
  return formatMonthShort(`${month}-01`);
}

/** Raio em px do círculo cuja área segue a escala do ZAxis, de zero a `AREA_MAX`. */
function radiusOf(value: number, maxValue: number): number {
  return maxValue > 0 ? Math.sqrt(((Math.abs(value) / maxValue) * AREA_MAX) / Math.PI) : 0;
}

/** Soma dos estornos, ou `null` quando não há nenhum (EST-1b). */
function sumRefunds(list: readonly MonthlyResult[]): number | null {
  const refunds = list.filter((row) => row.refund < 0);
  return refunds.length === 0 ? null : refunds.reduce((sum, row) => sum + row.refund, 0);
}

/** Forma do zero medido: ponto mínimo cheio, que não é círculo de dado nem faixa de ausência. */
function ZeroMark({ cx, cy }: { readonly cx?: number; readonly cy?: number }): ReactElement | null {
  if (cx === undefined || cy === undefined) return null;
  return <circle cx={cx} cy={cy} fill="var(--text-secondary)" r={ZERO_RADIUS} stroke="var(--surface-raised)" strokeWidth={1} />;
}

export default function ResultTimeline({ data = defaultData, height, className }: ResultTimelineProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita nem estorno para desenhar.</span>
      </div>
    );
  }

  const lanes = [...new Set(data.map((row) => row.product))];
  const laneCount = lanes.length;
  const months = [...new Set(data.map((row) => row.month))].sort();
  const laneY = (product: string) => laneCount - 1 - lanes.indexOf(product);
  const sizes = data.flatMap((row) => [Math.abs(row.refund), row.revenue ?? 0]);
  const maxValue = sizes.reduce((best, value) => Math.max(best, value), 0);
  const firstMs = monthMs(months[0] ?? '1970-01');
  const lastMs = monthMs(months[months.length - 1] ?? '1970-01');
  const domainX: [number, number] = [firstMs - EDGE_PAD_DAYS * MS_PER_DAY, lastMs + EDGE_PAD_DAYS * MS_PER_DAY];
  const laneTicks = lanes.map((_, index) => index);

  const base = (row: MonthlyResult, kind: MarkKind, value: number): Point => ({
    id: `${row.id}-${kind}`,
    product: row.product,
    month: row.month,
    kind,
    value,
    x: monthMs(row.month),
    y: laneY(row.product),
    size: Math.abs(value),
    revenue: row.revenue ?? 0,
  });
  // REC-13: os maiores vão primeiro, para o pequeno não ficar sob o vizinho.
  const revenuePoints = data
    .filter((row) => row.revenue !== null && row.revenue > 0)
    .map((row) => base(row, 'receita', row.revenue ?? 0))
    .sort((a, b) => b.size - a.size);
  const refundPoints = data.filter((row) => row.refund < 0).map((row) => base(row, 'estorno', row.refund));
  const zeroPoints = data.filter((row) => row.revenue === 0).map((row) => base(row, 'zero', 0));

  /** Mês sem coleta em todas as faixas vira uma faixa de altura inteira; em uma faixa só, vira faixa dela. */
  const missingRows = data.filter((row) => row.revenue === null);
  const missingMonths = months.filter((month) => data.filter((row) => row.month === month).every((row) => row.revenue === null));
  const missingPartial = missingRows.filter((row) => !missingMonths.includes(row.month));
  const refundTotal = sumRefunds(data);
  const refundCount = refundPoints.length;
  const legendValues = [...LEGEND_REFERENCES.filter((value) => value < maxValue), maxValue];
  const legendBox = Math.ceil(2 * radiusOf(maxValue, maxValue));
  const missingNames = [...new Set(missingRows.map((row) => row.month))].sort().map(monthLabel);

  const reading = [
    refundTotal === null ? 'Sem estornos neste recorte.' : `${formatInt(refundCount)} ${refundCount === 1 ? 'estorno soma' : 'estornos somam'} ${formatCurrencyCompact(refundTotal)}.`,
    missingNames.length === 0 ? '' : `${formatInt(missingNames.length)} ${missingNames.length === 1 ? 'mês sem coleta' : 'meses sem coleta'} (${missingNames.join(' e ')}) ${missingNames.length === 1 ? 'aparece' : 'aparecem'} como ${formatUnavailable().toLowerCase()}, não como zero.`,
    zeroPoints.length === 0 ? '' : `${formatInt(zeroPoints.length)} ${zeroPoints.length === 1 ? 'zero medido tem' : 'zeros medidos têm'} ponto próprio.`,
  ]
    .filter(Boolean)
    .join(' ');

  const summary = [
    `Linha do tempo de círculos com a receita mensal de ${formatInt(laneCount)} produtos, de ${monthLabel(months[0] ?? '')} a ${monthLabel(months[months.length - 1] ?? '')}.`,
    refundTotal === null ? '' : `Os ${formatInt(refundCount)} estornos somam ${formatCurrencyCompact(refundTotal)}, desenhados como contorno vazado.`,
    missingNames.length === 0 ? '' : `${missingNames.join(' e ')} sem coleta, escritos como ${formatUnavailable().toLowerCase()} e nunca como zero.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const name = point.kind === 'estorno' ? 'Estorno' : 'Receita';
    const entries = [
      { dataKey: 'month', name: 'Mês', value: monthLabel(point.month) },
      { dataKey: 'value', name, value: point.kind === 'zero' ? formatCurrency(0, 0) : formatCurrency(point.value, 0) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.product} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  /** Estorno escrito com sinal sob a maior marca do mesmo mês: contorno ou círculo cheio, o que passar mais longe. */
  const renderRefundLabel = ({ x, y, width, height: boxHeight, index }: LabelProps): ReactElement | null => {
    const point = index === undefined ? undefined : refundPoints[index];
    if (x === undefined || y === undefined || !point) return null;
    const cx = Number(x) + Number(width ?? 0) / 2;
    const cy = Number(y) + Number(boxHeight ?? 0) / 2;
    const reach = Math.max(Number(width ?? 0) / 2, radiusOf(point.revenue, maxValue));
    return (
      <text className="font-display" fill="var(--negative)" fontSize={11} fontWeight={600} style={HALO} textAnchor="middle" x={cx} y={cy + reach + LABEL_GAP}>
        {formatCurrencyCompact(point.value)}
      </text>
    );
  };

  const renderZeroLabel = ({ x, y, width, height: boxHeight, index }: LabelProps): ReactElement | null => {
    const point = index === undefined ? undefined : zeroPoints[index];
    if (x === undefined || y === undefined || !point) return null;
    return (
      <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={600} style={HALO} textAnchor="middle" x={Number(x) + Number(width ?? 0) / 2} y={Number(y) + Number(boxHeight ?? 0) / 2 + ZERO_RADIUS + LABEL_GAP}>
        {formatCurrencyCompact(0)}
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
              tickFormatter={(value: number) => monthLabel(new Date(value).toISOString().slice(0, 7))}
              tickLine={false}
              tickMargin={8}
              ticks={months.map(monthMs)}
              type="number"
            />
            {/* REC-14: eixo de categoria abriria uma banda por ponto; o numérico com tique nomeado não. */}
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="y"
              domain={[-0.5, laneCount - 0.5]}
              interval={0}
              tickFormatter={(value: number) => lanes[laneCount - 1 - value] ?? ''}
              tickLine={false}
              tickMargin={8}
              ticks={laneTicks}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            {/* REC-31: área em px² de 0 ao maior valor absoluto; o estorno usa Math.abs, nunca área negativa. */}
            <ZAxis dataKey="size" domain={[0, maxValue]} range={[0, AREA_MAX]} type="number" />
            {/* ANO-4: faixa de ausência em --surface-sunken com a palavra; REC-1: extendDomain para não descartar. */}
            {missingMonths.map((month) => (
              <ReferenceArea
                fill="var(--surface-sunken)"
                ifOverflow="extendDomain"
                key={month}
                label={{ fill: 'var(--text-muted)', fontSize: 11, position: 'insideTop', value: formatUnavailable() }}
                x1={monthMs(month) - HALF_MONTH_DAYS * MS_PER_DAY}
                x2={monthMs(month) + HALF_MONTH_DAYS * MS_PER_DAY}
                y1={-0.5}
                y2={laneCount - 0.5}
              />
            ))}
            {missingPartial.map((row) => (
              <ReferenceArea
                fill="var(--surface-sunken)"
                ifOverflow="extendDomain"
                key={row.id}
                label={{ fill: 'var(--text-muted)', fontSize: 11, position: 'insideTop', value: formatUnavailable() }}
                x1={monthMs(row.month) - HALF_MONTH_DAYS * MS_PER_DAY}
                x2={monthMs(row.month) + HALF_MONTH_DAYS * MS_PER_DAY}
                y1={laneY(row.product) - 0.5}
                y2={laneY(row.product) + 0.5}
              />
            ))}
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={revenuePoints} fill="var(--chart-1)" fillOpacity={BUBBLE_FILL_OPACITY} isAnimationActive={animate} stroke="var(--surface-raised)" strokeWidth={1} />
            {/* O estorno é desenhado por último, para o contorno ficar por cima do círculo cheio do mesmo mês. */}
            <Scatter data={refundPoints} fill="none" isAnimationActive={animate} stroke="var(--negative)" strokeWidth={REFUND_STROKE_WIDTH}>
              <LabelList content={renderRefundLabel} dataKey="size" />
            </Scatter>
            <Scatter data={zeroPoints} isAnimationActive={animate} shape={ZeroMark}>
              <LabelList content={renderZeroLabel} dataKey="size" />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 items-end gap-6 text-[0.6875rem] text-text-muted">
        <span>Valor no mês</span>
        {legendValues.map((value) => {
          const radius = radiusOf(value, maxValue);
          return (
            <span className="flex items-end gap-2" key={value}>
              <svg height={legendBox} width={legendBox}>
                <circle cx={legendBox / 2} cy={legendBox - radius} fill="var(--chart-1)" fillOpacity={BUBBLE_FILL_OPACITY} r={radius} stroke="var(--surface-raised)" strokeWidth={1} />
              </svg>
              <span className="font-display tabular-nums">{formatCurrencyCompact(value)}</span>
            </span>
          );
        })}
        <span className="flex items-center gap-2">
          <svg aria-hidden height={16} width={16}>
            <circle cx={8} cy={8} fill="none" r={6} stroke="var(--negative)" strokeWidth={REFUND_STROKE_WIDTH} />
          </svg>
          estorno
        </span>
        <span className="flex items-center gap-2">
          <svg aria-hidden height={16} width={16}>
            <circle cx={8} cy={8} fill="var(--text-secondary)" r={ZERO_RADIUS} />
          </svg>
          zero medido
        </span>
        <span className="flex items-center gap-2">
          <svg aria-hidden height={16} width={24}>
            <rect fill="var(--surface-sunken)" height={14} rx={2} stroke="var(--line-strong)" width={22} x={1} y={1} />
          </svg>
          sem coleta
        </span>
      </div>
    </div>
  );
}
