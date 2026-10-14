import { Filter } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps, type TooltipContentProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type BusinessDayCumulativeBookings } from './data';

/**
 * Agendas acumuladas de dois meses com números diferentes de dias úteis, alinhadas pela fração do
 * mês já decorrida (0 a 100%) em vez do dia civil, para o mês curto não parecer uma queda só por
 * ter menos dias úteis. Nenhum ponto é inventado além do último dia útil real de cada mês.
 */
export interface BusinessMonthFractionProps {
  readonly data?: readonly BusinessDayCumulativeBookings[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 16, right: 96, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 40;
const LABEL_GAP = 8;
/** ROT-9: piso vertical entre duas âncoras de rótulo de 12 px para a tinta nunca se encostar. */
const LABEL_ANCHOR_GAP = 16;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;
const SERIES_COLORS = ['var(--chart-3)', 'var(--chart-1)'] as const;

interface FractionRow {
  readonly month: string;
  readonly businessDay: number;
  readonly totalDays: number;
  readonly fraction: number;
  readonly cumulativeBookings: number;
}

interface EndPoint {
  readonly cx: number;
  readonly cy: number;
  readonly value: number;
}

function MonthProgressTooltip({ active, label, payload }: Partial<TooltipContentProps<number | string, string | number>>) {
  if (!active || !payload || payload.length === 0) return null;
  const rewritten = payload
    .map((entry) => {
      const row = entry.payload as FractionRow | undefined;
      if (!row) return null;
      return {
        ...entry,
        name: formatMonthShort(row.month),
        value: `${formatInt(row.businessDay)}º de ${formatInt(row.totalDays)} dias úteis, ${formatPercent(row.fraction)}: ${formatInt(row.cumulativeBookings)} agendas`,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  return <ChartTooltip active={active} label={label} payload={rewritten} valueFormat="text" />;
}

export default function BusinessMonthFraction({ data = defaultData, height, className }: BusinessMonthFractionProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há agendas para comparar por fração de dias úteis.</span>
      </div>
    );
  }

  const months = Array.from(new Set(data.map((row) => row.month))).sort();
  const series = months.map((month) => {
    const rows = data.filter((row) => row.month === month);
    const totalDays = rows.reduce((max, row) => Math.max(max, row.businessDay), 0);
    const fractionRows: readonly FractionRow[] = rows.map((row) => ({
      month: row.month,
      businessDay: row.businessDay,
      totalDays,
      fraction: row.businessDay / totalDays,
      cumulativeBookings: row.cumulativeBookings,
    }));
    return { month, totalDays, rows: fractionRows, color: SERIES_COLORS[months.indexOf(month) % SERIES_COLORS.length] ?? 'var(--chart-1)' };
  });

  const summary = [
    `Gráfico de linhas com agendas acumuladas de ${series.map((s) => formatMonthShort(s.month)).join(' e ')}, alinhadas pela fração do mês útil já decorrida.`,
    series
      .map((s) => {
        const last = s.rows[s.rows.length - 1];
        return last ? `${formatMonthShort(s.month)} fecha em ${formatInt(last.cumulativeBookings)} agendas nos seus ${formatInt(s.totalDays)} dias úteis` : '';
      })
      .filter(Boolean)
      .join('; '),
  ]
    .filter(Boolean)
    .join('. ');

  let priorEnd: EndPoint | undefined;

  const renderEndDot = (seriesIndex: number, color: string, monthLabel: string) => ({ cx, cy, index, value }: DotItemDotProps) => {
    const activeSeries = series[seriesIndex];
    if (!activeSeries || index !== activeSeries.rows.length - 1 || cx === undefined || cy === undefined || typeof value !== 'number') return null;
    let labelY = cy;
    if (priorEnd && Math.abs(priorEnd.cx - cx) < 24 && Math.abs(priorEnd.cy - cy) < LABEL_ANCHOR_GAP) {
      labelY = cy <= priorEnd.cy ? priorEnd.cy - LABEL_ANCHOR_GAP : priorEnd.cy + LABEL_ANCHOR_GAP;
    }
    const displaced = Math.abs(labelY - cy) > 0.5;
    if (!priorEnd) priorEnd = { cx, cy, value };
    return (
      <g key={`end-${monthLabel}`}>
        <circle cx={cx} cy={cy} fill={color} r={3} />
        {displaced ? <line stroke={color} strokeWidth={1} x1={cx + 2} x2={cx + 2} y1={cy} y2={labelY} /> : null}
        <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} x={cx + LABEL_GAP} y={labelY}>
          <tspan className="font-sans">{monthLabel} </tspan>
          {formatInt(value)}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-muted">
        Eixo horizontal em fração do mês útil: <span className="tabular-nums">{formatPercent(0, 0)}</span> é o primeiro dia útil e{' '}
        <span className="tabular-nums">{formatPercent(1, 0)}</span> o último de cada mês.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} dataKey="fraction" domain={[0, 1]} tickFormatter={(value: number) => formatPercent(value, 0)} tickMargin={8} ticks={[0, 0.25, 0.5, 0.75, 1]} type="number" />
            <YAxis {...AXIS_PROPS} allowDecimals={false} domain={[0, 200]} tickFormatter={(value: number) => formatInt(value)} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={<MonthProgressTooltip />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            {series.map((s, index) => (
              <Line
                data={s.rows}
                dataKey="cumulativeBookings"
                dot={renderEndDot(index, s.color, formatMonthShort(s.month))}
                isAnimationActive={animate}
                key={s.month}
                name={formatMonthShort(s.month)}
                stroke={s.color}
                strokeWidth={2}
                type="linear"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
