import type { ReactElement } from 'react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, goal, type WeeklyGoalStatus, type WeeklyGoalStatusUnit } from './data';

/**
 * Anel de unidades em três status: realizada, marcada e faltante, cada uma um segmento igual,
 * na ordem fixa do array (que já é a ordem de desenho a partir das 12 horas).
 */
export interface WeeklyGoalStatusRingProps {
  readonly data?: readonly WeeklyGoalStatusUnit[];
  readonly height?: number;
  readonly className?: string;
}

const INNER_RADIUS = '70%';
const OUTER_RADIUS = '92%';

const LABELS: Record<WeeklyGoalStatus, string> = {
  realizada: 'Realizada',
  marcada: 'Marcada para os próximos dias',
  faltante: 'Faltante',
};

function paddingAngleFor(n: number): number {
  return Math.min(3, 120 / n);
}

function fillFor(status: WeeklyGoalStatus): string {
  if (status === 'realizada') return 'var(--chart-1)';
  if (status === 'marcada') return 'var(--line-strong)';
  return 'none';
}

function strokeFor(status: WeeklyGoalStatus): string {
  return status === 'faltante' ? 'var(--text-muted)' : 'var(--surface-raised)';
}

interface CenterLabelProps {
  readonly viewBox?: { readonly cx?: number; readonly cy?: number; readonly x?: number; readonly y?: number };
}

export default function WeeklyGoalStatusRing({ data = defaultData, height, className }: WeeklyGoalStatusRingProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <span>Nenhuma linha neste recorte: não há meta semanal cadastrada.</span>
      </div>
    );
  }

  const counts: Record<WeeklyGoalStatus, number> = { realizada: 0, marcada: 0, faltante: 0 };
  for (const row of data) counts[row.status] += 1;
  const order: readonly WeeklyGoalStatus[] = ['realizada', 'marcada', 'faltante'];

  const summary =
    `Anel de unidades com as ${String(data.length)} agendas da meta semanal em três status. ` +
    `${String(counts.realizada)} realizadas, ${String(counts.marcada)} marcadas para os próximos dias e ` +
    `${String(counts.faltante)} faltantes; a meta é ${String(goal)} e cada segmento vale 1 agenda.`;

  const renderCenter = ({ viewBox }: CenterLabelProps): ReactElement | null => {
    if (viewBox?.cx === undefined || viewBox.cy === undefined) return null;
    return (
      <text textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
        <tspan className="font-display" dy="-0.2em" fill="var(--text-primary)" fontSize={30} fontWeight={600} x={viewBox.cx}>
          {formatInt(counts.realizada)}
        </tspan>
        <tspan className="font-sans" dy="1.6em" fill="var(--text-muted)" fontSize={11} x={viewBox.cx}>
          realizadas, meta {formatInt(goal)}
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-center gap-6', className)} role="img" style={style}>
      <div className="aspect-square h-full max-h-full shrink-0">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer={false} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              cx="50%"
              cy="50%"
              data={data}
              dataKey={() => 1}
              endAngle={-270}
              innerRadius={INNER_RADIUS}
              isAnimationActive={animate}
              nameKey="id"
              outerRadius={OUTER_RADIUS}
              paddingAngle={paddingAngleFor(data.length)}
              startAngle={90}
            >
              {data.map((row) => (
                <Cell fill={fillFor(row.status)} key={row.id} stroke={strokeFor(row.status)} />
              ))}
              <Label content={renderCenter} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
        <ul className="space-y-2.5">
          {order.map((status) => (
            <li className="flex items-center gap-2.5 text-xs" key={status}>
              <span
                aria-hidden
                className={cn('size-2.5 shrink-0 rounded-full', status === 'faltante' && 'border border-text-muted')}
                style={status === 'faltante' ? undefined : { backgroundColor: fillFor(status) }}
              />
              <span className={cn('min-w-0 flex-1 truncate', status === 'faltante' ? 'text-text-muted' : 'text-text-secondary')}>
                {LABELS[status]}
              </span>
              <span className="kpi-number w-6 shrink-0 text-right text-text-primary">{formatInt(counts[status])}</span>
            </li>
          ))}
        </ul>
        <p aria-hidden className="text-[0.6875rem] text-text-muted">
          Cada segmento do anel vale <span className="font-display tabular-nums">{formatInt(1)}</span> agenda.
        </p>
      </div>
    </div>
  );
}
