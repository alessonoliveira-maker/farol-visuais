import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, todayWeek as defaultTodayWeek, type WeeklyBooking } from './data';

/**
 * Leque de agendas semanais projetadas contra o teto de capacidade da pré-vendas, desenhado
 * como Line em degrau (stepAfter) tracejada. A única anotação além de "hoje" é a primeira
 * semana em que o p75 passa do teto, achada no próprio dado, nunca digitada à mão. O selo de
 * procedência do trecho projetado é do VisualCard que embrulha este componente (ANO-6): o Chart
 * não desenha etiqueta de PREMISSA.
 */
export interface BookingsCapacityFanProps {
  readonly data?: readonly WeeklyBooking[];
  readonly todayWeek?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 28, right: 96, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 48;
const DOMAIN: readonly [number, number] = [0, 90];
const TICKS = [0, 30, 60, 90] as const;
const BAND_FILL = 'var(--line-strong)';
const BAND90_OPACITY = 0.16;
const BAND50_OPACITY = 0.3;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface FanRow extends WeeklyBooking {
  readonly band90: readonly [number, number] | null;
  readonly band50: readonly [number, number] | null;
}

function lastIndexWith(rows: readonly FanRow[], key: 'real' | 'median'): number {
  let found = -1;
  rows.forEach((row, index) => {
    if (row[key] !== null) found = index;
  });
  return found;
}

/** Primeira semana, a partir da junção, em que o p75 passa do teto de capacidade. */
function firstCrossing(rows: readonly FanRow[]): FanRow | undefined {
  return rows.find((row) => row.p75 !== null && row.p75 > row.ceiling);
}

export default function BookingsCapacityFan({ data = defaultData, todayWeek = defaultTodayWeek, height, className }: BookingsCapacityFanProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não há agenda para projetar.</span>
      </div>
    );
  }

  const rows: readonly FanRow[] = data.map((row) => ({
    ...row,
    band90: row.p05 === null || row.p95 === null ? null : [row.p05, row.p95],
    band50: row.p25 === null || row.p75 === null ? null : [row.p25, row.p75],
  }));
  const realEnd = lastIndexWith(rows, 'real');
  const medianEnd = lastIndexWith(rows, 'median');
  const junction = rows[realEnd];
  const crossing = firstCrossing(rows);
  const ceiling = rows[0]?.ceiling ?? 0;

  const summary =
    junction === undefined
      ? 'Gráfico de área com leque de agendas semanais projetadas, sem semana real medida ainda.'
      : `Gráfico de área com leque de agendas semanais de ${rows[0]?.week ?? ''} a ${rows[rows.length - 1]?.week ?? ''} contra o teto de ${formatInt(ceiling)} agendas por semana. Real medido até ${junction.week}, ${formatInt(junction.real ?? 0)} agendas. ${crossing === undefined ? 'O p75 projetado não passa do teto até o fim do horizonte.' : `O p75 passa do teto pela primeira vez em ${crossing.week}, ${formatDate(crossing.mondayDate)}.`}`;

  const reading =
    crossing === undefined
      ? 'Teto de capacidade semanal em Line tracejada; p75 não cruza o teto no horizonte projetado.'
      : `Teto de capacidade semanal em Line tracejada; p75 passa do teto em ${crossing.week} (${formatDate(crossing.mondayDate)}).`;

  const renderJunctionLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index !== realEnd || junction === undefined) return null;
    return (
      <text className="font-display" dominantBaseline="auto" fill="var(--text-primary)" fontSize={12} fontWeight={600} style={HALO} textAnchor="end" x={Number(x) - 10} y={Number(y) - 10}>
        {`real ${formatInt(junction.real ?? 0)}`}
      </text>
    );
  };

  const renderMedianEnd = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index !== medianEnd) return null;
    const value = rows[medianEnd]?.median;
    if (value === null || value === undefined) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={600} style={HALO} textAnchor="start" x={Number(x) + 8} y={Number(y)}>
        {`mediana ${formatInt(value)}`}
      </text>
    );
  };

  const renderCeilingEnd = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index !== rows.length - 1) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="start" x={Number(x) + 8} y={Number(y) + 14}>
        {`teto ${formatInt(ceiling)}`}
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
          <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis axisLine={false} dataKey="week" interval={1} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} domain={[...DOMAIN]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(value: number) => formatInt(value)} ticks={[...TICKS]} width={VALUE_AXIS_WIDTH} />
            <ReferenceLine label={{ value: 'hoje', position: 'insideTopRight', fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--text-muted)" strokeDasharray="3 3" x={todayWeek} />
            {crossing !== undefined && (
              <ReferenceLine label={{ value: crossing.week, position: 'insideTopLeft', fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--text-muted)" strokeDasharray="3 3" x={crossing.week} />
            )}
            <Area connectNulls={false} dataKey="band90" fill={BAND_FILL} fillOpacity={BAND90_OPACITY} isAnimationActive={animate} stroke="none" />
            <Area connectNulls={false} dataKey="band50" fill={BAND_FILL} fillOpacity={BAND50_OPACITY} isAnimationActive={animate} stroke="none" />
            <Line dataKey="ceiling" dot={false} isAnimationActive={false} stroke="var(--text-muted)" strokeDasharray="4 4" type="stepAfter">
              <LabelList content={renderCeilingEnd} dataKey="ceiling" />
            </Line>
            <Line connectNulls={false} dataKey="real" dot={false} isAnimationActive={false} stroke="var(--chart-1)" strokeWidth={2}>
              <LabelList content={renderJunctionLabel} dataKey="real" />
            </Line>
            <Line connectNulls={false} dataKey="median" dot={false} isAnimationActive={false} stroke="var(--chart-1)" strokeDasharray="4 4" strokeWidth={2}>
              <LabelList content={renderMedianEnd} dataKey="median" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
