import { CheckCircle2, CircleAlert, CircleDashed, Filter } from 'lucide-react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, weekStart as defaultWeekStart, type WeeklyGoalRing } from './data';

/**
 * Três anéis concêntricos, um por meta independente da pré-vendas na mesma semana. A leitura de
 * cada anel é binária: fechou ou não fechou. O anel de fora desenha um arco fisicamente mais
 * longo que o de dentro para o mesmo percentual, então o formato nunca compara as metas entre
 * si: o valor bruto, a meta e o percentual de cada uma vão escritos na lista ao lado.
 */
export interface ConcentricGoalRingsProps {
  readonly data?: readonly WeeklyGoalRing[];
  readonly weekStart?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Cor por categoria de meta, fixa por id: nunca por posição no array. */
const RING_COLOR: Readonly<Record<string, string>> = {
  entradas: 'var(--chart-1)',
  agendas: 'var(--chart-3)',
  sla: 'var(--chart-6)',
};
/** Bandas de raio do anel de fora para o de dentro, com vão de 5 pontos entre elas. */
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

function plural(count: number, ring: { readonly unit: string; readonly unitOne: string }): string {
  return `${formatInt(count)} ${count === 1 ? ring.unitOne : ring.unit}`;
}

function ringColor(id: string): string {
  return RING_COLOR[id] ?? 'var(--chart-1)';
}

export default function ConcentricGoalRings({
  data = defaultData,
  weekStart = defaultWeekStart,
  height,
  className,
}: ConcentricGoalRingsProps) {
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
        <span>Nenhuma meta neste recorte para a semana.</span>
      </div>
    );
  }

  const rings = data.map((ring) => {
    const pct = ring.goal === null ? null : (ring.value / ring.goal) * 100;
    const missing = ring.goal === null ? null : Math.max(ring.goal - ring.value, 0);
    return { ...ring, pct, closed: pct !== null && pct >= 100, missing };
  });

  const closedCount = rings.filter((ring) => ring.closed).length;
  const parts = rings.map((ring) => {
    if (ring.pct === null) return `${ring.label} sem meta definida, com ${plural(ring.value, ring)}.`;
    const pct = formatPercent(ring.pct / 100, 0);
    if (ring.closed) return `${ring.label} fechou, ${pct}.`;
    const missing = ring.missing ?? 0;
    return `${ring.label} não fechou, ${pct}; ${missing === 1 ? 'falta' : 'faltam'} ${plural(missing, ring)}.`;
  });
  const summary = [
    `Anéis concêntricos com ${String(rings.length)} metas da pré-vendas, semana de ${formatDate(weekStart)}.`,
    `${String(closedCount)} de ${String(rings.length)} metas fechadas.`,
    ...parts,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-center gap-6', className)} role="figure" style={style}>
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
              <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: ringColor(ring.id) }} />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-text-primary">{ring.label}</span>
              {ring.pct === null ? (
                <CircleDashed aria-hidden className="size-4 shrink-0 text-text-muted" />
              ) : ring.closed ? (
                <CheckCircle2 aria-hidden className="size-4 shrink-0 text-positive" />
              ) : (
                <CircleAlert aria-hidden className="size-4 shrink-0 text-text-muted" />
              )}
            </div>
            <p className="flex items-baseline gap-1 pl-5 text-xs text-text-muted">
              <span className="kpi-number w-9 shrink-0 text-right font-semibold text-text-primary">{formatInt(ring.value)}</span>
              {ring.goal === null ? (
                <span className="min-w-0 flex-1">{ring.value === 1 ? ring.unitOne : ring.unit}, sem meta definida</span>
              ) : (
                <>
                  <span className="shrink-0">de</span>
                  <span className="kpi-number w-9 shrink-0 text-right">{formatInt(ring.goal)}</span>
                  <span className="min-w-0 flex-1 truncate">{ring.goal === 1 ? ring.unitOne : ring.unit}</span>
                  <span className="kpi-number w-11 shrink-0 text-right font-semibold text-text-primary">
                    {formatPercent((ring.pct ?? 0) / 100, 0)}
                  </span>
                </>
              )}
            </p>
            {ring.pct !== null && !ring.closed ? (
              <p className="pl-5 text-xs text-text-muted">
                {(ring.missing ?? 0) === 1 ? 'falta' : 'faltam'}{' '}
                <span className="kpi-number">{formatInt(ring.missing ?? 0)}</span> {(ring.missing ?? 0) === 1 ? ring.unitOne : ring.unit}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
