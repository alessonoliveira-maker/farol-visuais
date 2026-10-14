import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps,
} from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, eventLabel as defaultEventLabel, eventWeek as defaultEventWeek, target as defaultTarget, type WeeklySla } from './data';

/** Linha simples do percentual semanal no SLA contra a meta, com o evento que antecede a queda. */
export interface SlaVsTargetProps {
  readonly data?: readonly WeeklySla[];
  readonly target?: number;
  readonly eventWeek?: string;
  readonly eventLabel?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 28, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 44;
const DOMAIN: readonly [number, number] = [0.7, 1];
const TICKS = [0.7, 0.8, 0.9, 1] as const;

export default function SlaVsTarget({
  data = defaultData,
  target = defaultTarget,
  eventWeek = defaultEventWeek,
  eventLabel = defaultEventLabel,
  height,
  className,
}: SlaVsTargetProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = data;

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não há atendimento no SLA para desenhar.</span>
      </div>
    );
  }

  const belowCount = rows.filter((row) => row.pctInSla < target).length;
  const last = rows[rows.length - 1]!;
  const lastBelow = last.pctInSla < target;

  const summary = [
    `Gráfico de linha com o percentual semanal de leads atendidos no SLA em ${String(rows.length)} semanas, contra a meta de ${formatPercent(target, 0)}.`,
    `${String(belowCount)} de ${String(rows.length)} semanas ficaram abaixo da meta.`,
    `Depois da ${eventLabel.toLowerCase()} em ${formatMonthShort(eventWeek)}, a última semana fechou em ${formatPercent(last.pctInSla, 0)}${lastBelow ? ', abaixo da meta' : ''}.`,
  ].join(' ');

  const renderDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || index === undefined) return null;
    const row = rows[index];
    if (!row) return null;
    if (row.pctInSla < target) {
      return (
        <path
          d={`M ${String(cx)} ${String(cy - 4)} L ${String(cx + 4)} ${String(cy + 3)} L ${String(cx - 4)} ${String(cy + 3)} Z`}
          fill="var(--negative)"
          key={`dot-${String(index)}`}
        />
      );
    }
    return <circle cx={cx} cy={cy} fill="var(--chart-1)" key={`dot-${String(index)}`} r={2.5} />;
  };

  const renderTargetLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly width?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0)} y={MARGIN.top - 10}>
      meta <tspan className="font-display">{formatPercent(target, 0)}</tspan>
    </text>
  );

  const renderEventLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x ?? 0} y={12}>
      {eventLabel}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="kpi-number font-medium text-text-primary">{formatInt(belowCount)}</span> de{' '}
        <span className="tabular-nums">{formatInt(rows.length)}</span> semanas abaixo da meta de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatPercent(target, 0)}</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="week" tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={DOMAIN}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              ticks={[...TICKS]}
              width={VALUE_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="date" valueFormat="percent" />}
              cursor={{ stroke: CURSOR_COLOR }}
              isAnimationActive={false}
            />
            <Line activeDot={{ r: 4 }} dataKey="pctInSla" dot={renderDot} isAnimationActive={animate} stroke="var(--chart-1)" strokeWidth={2} type="linear" />
            <ReferenceLine ifOverflow="extendDomain" label={renderTargetLabel} stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1} y={target} />
            <ReferenceLine ifOverflow="extendDomain" label={renderEventLabel} stroke="var(--line-strong)" strokeDasharray="3 3" strokeWidth={1} x={eventWeek} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
