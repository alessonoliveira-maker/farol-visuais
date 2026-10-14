import type { ReactElement } from 'react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, sdrName, weekLabel, type WeeklyGoalUnit } from './data';

/**
 * Anel de unidades: um segmento igual por agenda da meta semanal, marcada ou pendente. O
 * leitor conta segmentos, não estima ângulo, e a legenda diz em número quanto vale cada um.
 */
export interface WeeklyGoalRingProps {
  readonly data?: readonly WeeklyGoalUnit[];
  readonly height?: number;
  readonly className?: string;
}

const INNER_RADIUS = '70%';
const OUTER_RADIUS = '92%';
/** Vão fixo de 3 graus come proporção pequena demais acima de 40 unidades; com N=20 o teto de 3
 * já é o valor da fórmula (Math.min(3, 120 / N) = Math.min(3, 6) = 3). */
function paddingAngleFor(n: number): number {
  return Math.min(3, 120 / n);
}

interface CenterLabelProps {
  readonly viewBox?: { readonly cx?: number; readonly cy?: number; readonly x?: number; readonly y?: number };
}

export default function WeeklyGoalRing({ data = defaultData, height, className }: WeeklyGoalRingProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <span>Nenhuma linha neste recorte: não há meta semanal cadastrada.</span>
      </div>
    );
  }

  const doneCount = data.filter((row) => row.done).length;
  const pendingCount = data.length - doneCount;

  const summary =
    `Anel de unidades com as ${String(data.length)} agendas da meta semanal de ${sdrName}, ${weekLabel}. ` +
    `${String(doneCount)} marcadas e ${String(pendingCount)} pendentes. Cada segmento do anel vale 1 agenda.`;

  const renderCenter = ({ viewBox }: CenterLabelProps): ReactElement | null => {
    if (viewBox?.cx === undefined || viewBox.cy === undefined) return null;
    return (
      <text textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
        <tspan className="font-display" dy="-0.2em" fill="var(--text-primary)" fontSize={30} fontWeight={600} x={viewBox.cx}>
          {formatInt(doneCount)}
        </tspan>
        <tspan className="font-sans" dy="1.6em" fill="var(--text-muted)" fontSize={11} x={viewBox.cx}>
          de {formatInt(data.length)} agendas
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-center gap-4', className)} role="img" style={style}>
      <div className="aspect-square h-full max-h-full shrink-0">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer={false} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
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
              stroke="var(--surface-raised)"
              strokeWidth={1.5}
            >
              {data.map((row) => (
                <Cell fill={row.done ? 'var(--chart-1)' : 'var(--line-strong)'} key={row.id} />
              ))}
              <Label content={renderCenter} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
        <ul className="space-y-2.5">
          <li className="flex items-center gap-2.5 text-xs">
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--chart-1)' }} />
            <span className="min-w-0 flex-1 text-text-secondary">Marcada</span>
            <span className="kpi-number w-6 shrink-0 text-right text-text-primary">{formatInt(doneCount)}</span>
          </li>
          <li className="flex items-center gap-2.5 text-xs">
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--line-strong)' }} />
            <span className="min-w-0 flex-1 text-text-secondary">Pendente</span>
            <span className="kpi-number w-6 shrink-0 text-right text-text-primary">{formatInt(pendingCount)}</span>
          </li>
        </ul>
        <p aria-hidden className="text-[0.6875rem] text-text-muted">
          Cada segmento do anel vale <span className="font-display tabular-nums">{formatInt(1)}</span> agenda.
        </p>
      </div>
    </div>
  );
}
