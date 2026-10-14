import { Filter } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type BusinessDayRevenue } from './data';

/**
 * Receita reconhecida acumulada do mês corrente por dia útil, alinhada não pela data civil mas
 * pela posição no mês, contra a média da mesma acumulação nos 6 meses anteriores. O corte de hoje
 * é o último dia útil medido do mês corrente, e a diferença ali é escrita com a base nomeada.
 */
export interface RevenueVsSixMonthAverageProps {
  readonly data?: readonly BusinessDayRevenue[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 16, right: 120, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 56;
const LABEL_GAP = 8;
/** ROT-9: piso vertical entre duas âncoras de rótulo de 12 px para a tinta nunca se encostar. */
const LABEL_ANCHOR_GAP = 16;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface TodayPoint {
  readonly cx: number;
  readonly cy: number;
  readonly value: number;
}

export default function RevenueVsSixMonthAverage({ data = defaultData, height, className }: RevenueVsSixMonthAverageProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum dia útil neste recorte: não há receita para comparar com a média.</span>
      </div>
    );
  }

  const lastIndex = data.length - 1;
  const todayIndex = data.reduce((last, row, index) => (row.current !== null ? index : last), -1);
  const today = todayIndex >= 0 ? data[todayIndex] : undefined;
  const diff = today?.current !== undefined && today?.current !== null ? today.current - today.sixMonthAverage : null;
  const diffFraction = diff !== null && today ? diff / today.sixMonthAverage : null;

  const summary = [
    `Gráfico de linhas com a receita acumulada do mês por dia útil, contra a média dos 6 meses anteriores.`,
    today && diff !== null && diffFraction !== null
      ? `No dia útil ${String(today.businessDay)}: ${formatCurrencyCompact(today.current ?? 0)}, ${diff >= 0 ? '+' : '−'}${formatPercent(Math.abs(diffFraction))} contra a média de ${formatCurrencyCompact(today.sixMonthAverage)}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  let todayAverage: TodayPoint | undefined;

  const renderAverageDot = ({ cx, cy, index, value }: DotItemDotProps) => {
    const row = data[index];
    if (!row || cx === undefined || cy === undefined || typeof value !== 'number') return null;
    if (row.businessDay === today?.businessDay) {
      todayAverage = { cx, cy, value };
      return <circle cx={cx} cy={cy} fill="var(--line-strong)" key="avg-today-dot" r={3} />;
    }
    if (index === lastIndex) {
      return (
        <g key="avg-end">
          <circle cx={cx} cy={cy} fill="var(--line-strong)" r={3} />
          <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} x={cx + LABEL_GAP} y={cy}>
            <tspan className="font-sans">média </tspan>
            {formatCurrencyCompact(value)}
          </text>
        </g>
      );
    }
    return null;
  };

  const renderCurrentDotAndLabel = ({ cx, cy, index, value }: DotItemDotProps) => {
    if (index !== todayIndex || cx === undefined || cy === undefined || typeof value !== 'number' || !todayAverage) return null;
    let currentY = cy;
    if (Math.abs(todayAverage.cy - cy) < LABEL_ANCHOR_GAP) {
      currentY = cy <= todayAverage.cy ? todayAverage.cy - LABEL_ANCHOR_GAP : todayAverage.cy + LABEL_ANCHOR_GAP;
    }
    const displaced = Math.abs(currentY - cy) > 0.5;
    return (
      <g key="current-today-dot">
        <circle cx={cx} cy={cy} fill="var(--chart-1)" r={3} />
        <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} x={todayAverage.cx + LABEL_GAP} y={todayAverage.cy}>
          <tspan className="font-sans">média </tspan>
          {formatCurrencyCompact(todayAverage.value)}
        </text>
        {displaced ? <line stroke="var(--chart-1)" strokeWidth={1} x1={cx + 2} x2={cx + 2} y1={cy} y2={currentY} /> : null}
        <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} x={cx + LABEL_GAP} y={currentY}>
          <tspan className="font-sans">2026 09 </tspan>
          {formatCurrencyCompact(value)}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        Dia útil <span className="tabular-nums">{String(today?.businessDay ?? 0)}</span>:{' '}
        <span className="kpi-number font-medium text-text-primary">{diff !== null && diff >= 0 ? '+' : '−'}{formatPercent(Math.abs(diffFraction ?? 0))}</span> contra a média de{' '}
        {formatCurrencyCompact(today?.sixMonthAverage ?? 0)} dos últimos <span className="tabular-nums">{formatInt(6)}</span> meses
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={data} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} dataKey="businessDay" tickFormatter={(value: number) => formatInt(value)} tickMargin={8} ticks={[1, 6, 11, 16, 22]} type="number" />
            <YAxis {...AXIS_PROPS} domain={[0, 1_100_000]} tickFormatter={formatCurrencyAxis} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip valueFormat="currencyCompact" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{ value: `hoje: dia útil ${String(today?.businessDay ?? 0)}`, fill: 'var(--text-muted)', fontSize: 11, position: 'insideTopLeft' }}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              x={today?.businessDay}
            />
            <Line dataKey="sixMonthAverage" dot={renderAverageDot} isAnimationActive={animate} name="Média 6 meses" stroke="var(--line-strong)" strokeDasharray="4 4" strokeWidth={2} type="linear" />
            <Line connectNulls={false} dataKey="current" dot={renderCurrentDotAndLabel} isAnimationActive={animate} name="2026 09" stroke="var(--chart-1)" strokeWidth={2} type="linear" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
