import { Filter } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyBookingRecord } from './data';

/**
 * Agendas comerciais por semana ISO, o ano corrente contra o ano anterior no mesmo eixo de
 * calendário relativo (a semana, não a data civil). O pivot de formato longo para uma coluna por
 * ano acontece aqui; o ano corrente termina em nulo depois da última semana medida, sem repetir
 * o último valor, e cada linha leva o rótulo do ano escrito na própria ponta, sem legenda.
 */
export interface YearOverYearBookingsProps {
  readonly data?: readonly WeeklyBookingRecord[];
  readonly height?: number;
  readonly className?: string;
}

const WEEKS_IN_YEAR = 52;
const MARGIN = { top: 16, right: 56, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 32;
/** ROT-2 aplicado à ponta da linha: respiro entre o último ponto e o rótulo. */
const LABEL_GAP = 8;
/** ROT-9: piso vertical entre duas âncoras de rótulo de 12 px para a tinta nunca se encostar. */
const LABEL_ANCHOR_GAP = 16;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface WeekRow {
  readonly week: number;
  readonly y2025: number | null;
  readonly y2026: number | null;
}

interface EndPoint {
  readonly cx: number;
  readonly cy: number;
  readonly value: number;
}

export default function YearOverYearBookings({ data = defaultData, height, className }: YearOverYearBookingsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não há agendas para comparar entre os anos.</span>
      </div>
    );
  }

  const byYearWeek = new Map<string, number>();
  for (const record of data) byYearWeek.set(`${String(record.year)}-${String(record.isoWeek)}`, record.bookings);
  const rows: readonly WeekRow[] = Array.from({ length: WEEKS_IN_YEAR }, (_, i) => {
    const week = i + 1;
    return {
      week,
      y2025: byYearWeek.get(`2025-${String(week)}`) ?? null,
      y2026: byYearWeek.get(`2026-${String(week)}`) ?? null,
    };
  });

  const lastCurrentIndex = rows.reduce((last, row, index) => (row.y2026 !== null ? index : last), -1);
  const lastCurrent = lastCurrentIndex >= 0 ? rows[lastCurrentIndex] : undefined;
  const sameWeekPrevious = lastCurrent ? (byYearWeek.get(`2025-${String(lastCurrent.week)}`) ?? null) : null;
  const delta = lastCurrent?.y2026 !== null && lastCurrent?.y2026 !== undefined && sameWeekPrevious !== null ? lastCurrent.y2026 - sameWeekPrevious : null;

  const summary = [
    `Gráfico de linhas com agendas comerciais por semana ISO, 2026 contra 2025.`,
    lastCurrent?.y2026 !== null && lastCurrent?.y2026 !== undefined && sameWeekPrevious !== null
      ? `Na semana ${String(lastCurrent.week)}, 2026 soma ${String(lastCurrent.y2026)} agendas contra ${String(sameWeekPrevious)} na mesma semana de 2025, ${delta !== null && delta >= 0 ? 'acima' : 'abaixo'} em ${formatInt(Math.abs(delta ?? 0))}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  let previousEnd: EndPoint | undefined;

  const renderPreviousDot = ({ cx, cy, index, value }: DotItemDotProps) => {
    if (index !== rows.length - 1 || cx === undefined || cy === undefined || typeof value !== 'number') return null;
    previousEnd = { cx, cy, value };
    return <circle cx={cx} cy={cy} fill="var(--line-strong)" key="previous-dot" r={3} />;
  };

  const renderCurrentDotAndLabels = ({ cx, cy, index, value }: DotItemDotProps) => {
    if (index !== lastCurrentIndex || cx === undefined || cy === undefined || typeof value !== 'number' || !previousEnd) return null;
    const sameColumn = Math.abs(cx - previousEnd.cx) < 24;
    let currentY = cy;
    if (sameColumn && Math.abs(previousEnd.cy - cy) < LABEL_ANCHOR_GAP) {
      currentY = cy <= previousEnd.cy ? previousEnd.cy - LABEL_ANCHOR_GAP : previousEnd.cy + LABEL_ANCHOR_GAP;
    }
    const displaced = Math.abs(currentY - cy) > 0.5;
    return (
      <g key="current-dot">
        <circle cx={cx} cy={cy} fill="var(--chart-1)" r={3} />
        <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} x={previousEnd.cx + LABEL_GAP} y={previousEnd.cy}>
          <tspan className="font-sans">2025 </tspan>
          {formatInt(previousEnd.value)}
        </text>
        {displaced ? <line stroke="var(--chart-1)" strokeWidth={1} x1={cx + 2} x2={cx + 2} y1={cy} y2={currentY} /> : null}
        <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} x={cx + LABEL_GAP} y={currentY}>
          <tspan className="font-sans">2026 </tspan>
          {formatInt(value)}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        Semana <span className="tabular-nums">{String(lastCurrent?.week ?? 0)}</span> de 2026:{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(lastCurrent?.y2026 ?? 0)}</span> agendas,{' '}
        {delta !== null && delta >= 0 ? 'acima' : 'abaixo'} da mesma semana de 2025 em <span className="tabular-nums">{formatInt(Math.abs(delta ?? 0))}</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} dataKey="week" tickFormatter={(value: number) => `sem ${formatInt(value)}`} tickMargin={8} ticks={[1, 13, 26, 39, 52]} type="number" />
            <YAxis {...AXIS_PROPS} allowDecimals={false} domain={[0, 60]} tickFormatter={(value: number) => formatInt(value)} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip valueFormat="int" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <Line connectNulls={false} dataKey="y2025" dot={renderPreviousDot} isAnimationActive={animate} name="2025" stroke="var(--line-strong)" strokeWidth={2} type="linear" />
            <Line connectNulls={false} dataKey="y2026" dot={renderCurrentDotAndLabels} isAnimationActive={animate} name="2026" stroke="var(--chart-1)" strokeWidth={2} type="linear" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
