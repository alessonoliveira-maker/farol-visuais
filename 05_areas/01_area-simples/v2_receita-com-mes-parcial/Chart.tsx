import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatDate, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, partialAsOf, type MonthlyRevenue } from './data';

/**
 * Área de receita mensal em que o mês corrente, ainda em curso, sai desenhado à parte: o trecho
 * fechado é sólido, o trecho em curso é tracejado, e a média compara só contra o que fechou.
 */
export interface MonthlyRevenueAreaProps {
  readonly data?: readonly MonthlyRevenue[];
  readonly height?: number;
  readonly className?: string;
}

const AREA_FILL_OPACITY = 0.18;
const MARGIN = { top: 22, right: 16, bottom: 0, left: 0 } as const;
const Y_AXIS_WIDTH = 64;
const GRID_TARGET_COUNT = 4;
const REFERENCE_STROKE = 'var(--text-muted)';
/** Y fixo na margem superior reservada (ANO-3): o rótulo nunca disputa espaço com a curva. */
const REFERENCE_LABEL_Y = 14;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface ValueTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly payload?: { readonly value?: number };
}

function computeNiceTicks(maxValue: number, targetCount = GRID_TARGET_COUNT): readonly number[] {
  if (maxValue <= 0) return [0, 1];
  const roughStep = maxValue / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const topTick = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= topTick + step / 2; value += step) {
    ticks.push(Math.round(value));
  }
  return ticks;
}

interface ReferenceLabelProps {
  readonly viewBox?: { readonly x?: number; readonly width?: number };
}

export default function MonthlyRevenueArea({ data = defaultData, height, className }: MonthlyRevenueAreaProps) {
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
        <span>Nenhum mês neste recorte: não houve receita reconhecida no período.</span>
      </div>
    );
  }

  const partialIndex = data.findIndex((row) => row.partial);
  const lastFullIndex = partialIndex === -1 ? data.length - 1 : partialIndex - 1;
  const closedRows = partialIndex === -1 ? data : data.slice(0, partialIndex);
  const average = closedRows.length > 0 ? closedRows.reduce((sum, row) => sum + row.revenue, 0) / closedRows.length : 0;
  const partialRow = partialIndex === -1 ? undefined : data[partialIndex];
  const lastClosedRow = data[lastFullIndex];

  const chartData = data.map((row, index) => ({
    month: row.month,
    solid: index <= lastFullIndex ? row.revenue : null,
    dashed: index === lastFullIndex || index === partialIndex ? row.revenue : null,
  }));

  const maxValue = Math.max(...data.map((row) => row.revenue));
  const ticks = computeNiceTicks(maxValue);
  const domainTop = ticks[ticks.length - 1] ?? maxValue;

  const summary = [
    `Gráfico de área com a receita reconhecida por mês de ${formatMonthShort(data[0]?.month ?? '')} a ${formatMonthShort(data[data.length - 1]?.month ?? '')}.`,
    lastClosedRow ? `O último mês fechado, ${formatMonthShort(lastClosedRow.month)}, somou ${formatCurrencyCompact(lastClosedRow.revenue)}.` : '',
    partialRow
      ? `${formatMonthShort(partialRow.month)} está parcial até ${formatDate(partialAsOf)}, com ${formatCurrencyCompact(partialRow.revenue)} até agora.`
      : '',
    `Média dos meses fechados: ${formatCurrencyCompact(average)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const reading = partialRow ? `${formatMonthShort(partialRow.month)} parcial até ${formatDate(partialAsOf)}` : null;

  const renderReferenceLabel = ({ viewBox }: ReferenceLabelProps): ReactElement => (
    <text
      fill="var(--text-muted)"
      fontSize={11}
      style={HALO}
      textAnchor="end"
      x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0)}
      y={REFERENCE_LABEL_Y}
    >
      <tspan className="font-sans">média </tspan>
      <tspan className="font-display">{formatCurrencyCompact(average)}</tspan>
    </text>
  );

  const renderValueTick = ({ x = 0, y = 0, payload }: ValueTickProps): ReactElement => (
    <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={Number(x)} y={Number(y)}>
      {formatCurrencyAxis(payload?.value ?? 0)}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">{reading}</p> : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart accessibilityLayer={false} data={chartData} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={formatMonthShort}
              tickLine={false}
              tickMargin={8}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              domain={[0, domainTop]}
              tick={renderValueTick}
              tickLine={false}
              ticks={[...ticks]}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="month" valueFormat="currencyCompact" />}
              cursor={{ stroke: CURSOR_COLOR }}
              isAnimationActive={false}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderReferenceLabel}
              stroke={REFERENCE_STROKE}
              strokeDasharray="3 3"
              strokeWidth={1}
              y={average}
            />
            <Area
              dataKey="solid"
              dot={false}
              fill="var(--chart-1)"
              fillOpacity={AREA_FILL_OPACITY}
              isAnimationActive={animate}
              name="receita"
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="dashed"
              dot={false}
              fill="var(--chart-1)"
              fillOpacity={AREA_FILL_OPACITY}
              isAnimationActive={false}
              legendType="none"
              name="receita"
              stroke="var(--chart-1)"
              strokeDasharray="4 4"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
