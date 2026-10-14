import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { capacitySteps as defaultCapacitySteps, data as defaultData, type CapacityStep, type WeeklyDemand } from './data';

/**
 * Demanda semanal de entradas contra o teto de capacidade em degrau da pré-vendas, no mesmo eixo
 * e na mesma unidade: sem área e sem eixo duplo. As semanas em que a demanda passou do teto levam
 * marca própria e o excedente escrito por cima.
 */
export interface DemandVsCapacityStepProps {
  readonly data?: readonly WeeklyDemand[];
  readonly capacitySteps?: readonly CapacityStep[];
  readonly height?: number;
  readonly className?: string;
}

interface Row {
  readonly week: string;
  readonly ts: number;
  readonly demand: number;
  readonly capacity: number;
  readonly excess: number;
}

const MARGIN = { top: 16, right: 128, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 32;
const END_LABEL_GAP = 8;
const EXCESS_LABEL_GAP = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

function toTimestamp(date: string): number {
  return new Date(date).getTime();
}

function tickMonth(ts: number): string {
  return formatMonthShort(new Date(ts).toISOString().slice(0, 7));
}

/** Um tique por mês presente no dado (primeira semana daquele mês): o espaçamento por dia do "nice tick" padrão repetia o mesmo mês em janela curta. */
function monthTicks(rows: readonly Row[]): number[] {
  const seen = new Set<string>();
  const result: number[] = [];
  for (const row of rows) {
    const key = row.week.slice(0, 7);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(row.ts);
  }
  return result;
}

/** Teto vigente numa semana: o último degrau cuja data não é posterior à semana. */
function capacityAt(week: string, steps: readonly CapacityStep[]): number {
  let value = 0;
  for (const step of steps) {
    if (step.date <= week) value = step.value;
    else break;
  }
  return value;
}

interface DemandTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{ readonly payload?: unknown }>;
}

function renderDemandTooltip({ active, payload }: DemandTooltipProps): ReactElement | null {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload as Row | undefined;
  if (!row) return null;
  const items: ChartTooltipProps['payload'] = [
    { color: 'var(--chart-1)', dataKey: 'demand', graphicalItemId: 'demand', name: 'Demanda', value: `${formatInt(row.demand)} entradas` },
    { color: 'var(--text-muted)', dataKey: 'capacity', graphicalItemId: 'capacity', name: 'Teto', value: `${formatInt(row.capacity)} agendas` },
    ...(row.excess > 0 ? [{ color: 'var(--negative)', dataKey: 'excess', graphicalItemId: 'excess', name: 'Excedente', value: `+${formatInt(row.excess)}` }] : []),
  ];
  return <ChartTooltip active label={formatDate(row.week)} payload={items} valueFormat="text" />;
}

export default function DemandVsCapacityStep({
  data = defaultData,
  capacitySteps = defaultCapacitySteps,
  height,
  className,
}: DemandVsCapacityStepProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const weeks = [...data].sort((a, b) => a.week.localeCompare(b.week));

  if (weeks.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não há demanda para comparar com o teto.</span>
      </div>
    );
  }

  const steps = [...capacitySteps].sort((a, b) => a.date.localeCompare(b.date));
  const rows: Row[] = weeks.map((row) => {
    const capacity = capacityAt(row.week, steps);
    return { week: row.week, ts: toTimestamp(row.week), demand: row.demand, capacity, excess: Math.max(0, row.demand - capacity) };
  });
  const last = rows[rows.length - 1];
  const first = rows[0];
  if (!last || !first) return null;

  const above = rows.filter((row) => row.excess > 0);
  const lastCut = steps[steps.length - 1];
  const maxValue = Math.max(...rows.map((row) => Math.max(row.demand, row.capacity)));
  const maxTick = Math.max(5, Math.ceil((maxValue + 1) / 5) * 5);
  const ticks = Array.from({ length: maxTick / 5 + 1 }, (_, i) => i * 5);
  const xTicks = monthTicks(rows);

  const summary = [
    `Gráfico de linha com a demanda semanal de entradas contra o teto de capacidade em degrau da pré-vendas, de ${formatMonthShort(first.week.slice(0, 7))} a ${formatMonthShort(last.week.slice(0, 7))}.`,
    `${String(above.length)} de ${String(rows.length)} semanas passaram do teto, a maioria após o corte de capacidade de ${lastCut ? formatDate(lastCut.date) : ''}.`,
  ].join(' ');

  const renderDemandDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || index === undefined) return null;
    const row = rows[index];
    if (!row) return null;
    if (index === rows.length - 1) {
      return (
        <g key="demand-end">
          <circle cx={cx} cy={cy} fill="var(--chart-1)" r={3} />
          <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} x={cx + END_LABEL_GAP} y={cy}>
            {formatInt(row.demand)} entradas{row.excess > 0 ? ` (+${formatInt(row.excess)})` : ''}
          </text>
        </g>
      );
    }
    if (row.excess <= 0) return null;
    return (
      <g key={`excess-${String(index)}`}>
        <path d={`M ${String(cx)} ${String(cy - 4)} L ${String(cx + 4)} ${String(cy + 3)} L ${String(cx - 4)} ${String(cy + 3)} Z`} fill="var(--negative)" />
        <text className="font-display" fill="var(--negative)" fontSize={11} fontWeight={600} style={HALO} textAnchor="middle" x={cx} y={cy - EXCESS_LABEL_GAP}>
          +{formatInt(row.excess)}
        </text>
      </g>
    );
  };

  const renderCapacityDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || index === undefined || index !== rows.length - 1) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} x={cx + END_LABEL_GAP} y={cy}>
        {formatInt(last.capacity)} agendas
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="kpi-number font-medium text-text-primary">{formatInt(above.length)}</span> de{' '}
        <span className="tabular-nums">{formatInt(rows.length)}</span> semanas passaram do teto de capacidade
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="ts" domain={['dataMin', 'dataMax']} scale="time" ticks={xTicks} tickFormatter={tickMonth} tickMargin={8} type="number" />
            <YAxis {...AXIS_PROPS} allowDecimals={false} axisLine={false} domain={[0, maxTick]} tickFormatter={(value: number) => formatInt(value)} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={renderDemandTooltip} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <Line activeDot={false} dataKey="capacity" dot={renderCapacityDot} isAnimationActive={animate} stroke="var(--line-strong)" strokeWidth={1.5} type="stepAfter" />
            <Line activeDot={{ r: 4 }} dataKey="demand" dot={renderDemandDot} isAnimationActive={animate} stroke="var(--chart-1)" strokeWidth={2} type="linear" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
