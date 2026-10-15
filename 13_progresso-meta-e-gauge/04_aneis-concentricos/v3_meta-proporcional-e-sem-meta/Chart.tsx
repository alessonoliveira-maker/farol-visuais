import { CalendarClock, CircleDashed, Filter, TrendingUp } from 'lucide-react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  businessDaysConsidered as defaultBusinessDaysConsidered,
  businessDaysInWeek as defaultBusinessDaysInWeek,
  data as defaultData,
  type ProportionalGoalRing,
} from './data';

/**
 * Três anéis concêntricos de uma pessoa que entrou na semana no meio do caminho: duas metas
 * proporcionais aos dias úteis restantes, uma sem meta ainda definida e uma acima de 100%. O
 * anel de fora segue mais longo que o de dentro para o mesmo percentual, então o valor de cada
 * meta vai escrito na lista ao lado, nunca só no comprimento do arco.
 */
export interface ProportionalGoalRingsProps {
  readonly data?: readonly ProportionalGoalRing[];
  readonly businessDaysConsidered?: number;
  readonly businessDaysInWeek?: number;
  readonly height?: number;
  readonly className?: string;
}

const RING_COLOR: Readonly<Record<string, string>> = {
  entradas: 'var(--chart-1)',
  agendas: 'var(--chart-3)',
  sla: 'var(--chart-6)',
};
const RING_BANDS: ReadonlyArray<{ readonly inner: string; readonly outer: string }> = [
  { inner: '80%', outer: '100%' },
  { inner: '55%', outer: '75%' },
  { inner: '30%', outer: '50%' },
];
const CORNER_RADIUS = 6;
const TRACK_FILL = { fill: 'var(--surface-sunken)' } as const;
const NO_GOAL_TRACK = { fill: 'none', stroke: 'var(--text-muted)', strokeDasharray: '3 3' } as const;

function bandForIndex(index: number): { readonly inner: string; readonly outer: string } {
  return RING_BANDS[index] ?? RING_BANDS[RING_BANDS.length - 1] ?? { inner: '30%', outer: '50%' };
}

function unitFor(count: number, ring: { readonly unit: string; readonly unitOne: string }): string {
  return count === 1 ? ring.unitOne : ring.unit;
}

function ringColor(id: string): string {
  return RING_COLOR[id] ?? 'var(--chart-1)';
}

export default function ProportionalGoalRings({
  data = defaultData,
  businessDaysConsidered = defaultBusinessDaysConsidered,
  businessDaysInWeek = defaultBusinessDaysInWeek,
  height,
  className,
}: ProportionalGoalRingsProps) {
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
        <span>Nenhuma meta neste recorte para a pessoa.</span>
      </div>
    );
  }

  const rings = data.map((ring) => {
    const pct = ring.goal === null ? null : (ring.value / ring.goal) * 100;
    const missing = ring.goal === null ? null : Math.max(ring.goal - ring.value, 0);
    return { ...ring, pct, closed: pct !== null && pct >= 100, missing };
  });

  const withoutGoal = rings.find((ring) => ring.goal === null);
  const over = rings.find((ring) => (ring.pct ?? 0) > 100);
  const under = rings.find((ring) => ring.pct !== null && ring.pct < 100);
  const summary = [
    `Anéis concêntricos com ${String(rings.length)} metas de alguém que entrou na semana.`,
    over ? `${over.label} passou de 100%, com ${formatPercent((over.pct ?? 0) / 100)} da meta proporcional.` : '',
    under
      ? `${under.label} não fechou, ${(under.missing ?? 0) === 1 ? 'falta' : 'faltam'} ${formatInt(under.missing ?? 0)} ${unitFor(under.missing ?? 0, under)}.`
      : '',
    withoutGoal
      ? `${withoutGoal.label} ainda sem meta definida, com ${formatInt(withoutGoal.value)} ${unitFor(withoutGoal.value, withoutGoal)}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <p className="flex shrink-0 items-center gap-1.5 text-xs text-text-muted">
        <CalendarClock aria-hidden className="size-3.5 shrink-0" />
        Meta proporcional: {String(businessDaysConsidered)} de {String(businessDaysInWeek)} dias úteis considerados
      </p>
      <div className="flex min-h-0 flex-1 items-center gap-6">
        <div aria-hidden className="relative aspect-square h-full max-h-full shrink-0">
          {rings.map((ring, index) => {
            const band = bandForIndex(index);
            const value = ring.pct === null ? 0 : Math.min(ring.pct, 100);
            return (
              <div className="absolute inset-0" key={ring.id}>
                <ResponsiveContainer height="100%" width="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    data={[{ value }]}
                    endAngle={-270}
                    innerRadius={band.inner}
                    outerRadius={band.outer}
                    startAngle={90}
                  >
                    <PolarAngleAxis domain={[0, 100]} tick={false} type="number" />
                    <RadialBar
                      background={ring.pct === null ? NO_GOAL_TRACK : TRACK_FILL}
                      cornerRadius={CORNER_RADIUS}
                      dataKey="value"
                      fill={ringColor(ring.id)}
                      isAnimationActive={animate}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
        <ul className="min-w-0 flex-1 space-y-2.5">
          {rings.map((ring) => (
            <li className="min-w-0" key={ring.id}>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn('size-2.5 shrink-0 rounded-full', ring.goal === null && 'border border-dashed border-text-muted')}
                  style={ring.goal === null ? undefined : { backgroundColor: ringColor(ring.id) }}
                />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-text-primary">{ring.label}</span>
                {ring.goal === null ? (
                  <CircleDashed aria-hidden className="size-4 shrink-0 text-text-muted" />
                ) : (ring.pct ?? 0) > 100 ? (
                  <TrendingUp aria-hidden className="size-4 shrink-0 text-positive" />
                ) : null}
              </div>
              <p className="pl-5 text-xs text-text-muted">
                <span className="kpi-number font-semibold text-text-primary">{formatInt(ring.value)}</span>{' '}
                {ring.goal === null
                  ? `${unitFor(ring.value, ring)}, sem meta definida`
                  : `de ${formatInt(ring.goal)} ${unitFor(ring.goal, ring)}, ${
                      ring.closed
                        ? formatPercent((ring.pct ?? 0) / 100)
                        : `${(ring.missing ?? 0) === 1 ? 'falta' : 'faltam'} ${formatInt(ring.missing ?? 0)} ${unitFor(ring.missing ?? 0, ring)}`
                    }`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
