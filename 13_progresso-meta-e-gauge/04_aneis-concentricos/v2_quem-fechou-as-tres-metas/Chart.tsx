import { CheckCircle2, Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, weekStart as defaultWeekStart, type GoalCount, type PersonGoalStatus } from './data';

/**
 * Seis pequenos múltiplos do mesmo trio de anéis concêntricos, todos na mesma escala e no mesmo
 * raio, para responder quem fechou entradas, agendas e SLA na semana. O anel de fora ainda
 * desenha um arco mais longo que o de dentro para o mesmo percentual, então cada trio traz os
 * três números escritos embaixo em vez de comparar os anéis pelo olho.
 */
export interface PeopleGoalRingsGridProps {
  readonly data?: readonly PersonGoalStatus[];
  readonly weekStart?: string;
  readonly height?: number;
  readonly className?: string;
}

const METRIC_ORDER = ['entradas', 'agendas', 'sla'] as const;
type MetricId = (typeof METRIC_ORDER)[number];
const METRIC_LABEL: Readonly<Record<MetricId, string>> = { entradas: 'Entradas', agendas: 'Agendas', sla: 'SLA' };
/** Cor por categoria de meta, fixa: igual em todos os trios da grade. */
const METRIC_COLOR: Readonly<Record<MetricId, string>> = {
  entradas: 'var(--chart-1)',
  agendas: 'var(--chart-3)',
  sla: 'var(--chart-6)',
};
const RING_BANDS: ReadonlyArray<{ readonly inner: string; readonly outer: string }> = [
  { inner: '82%', outer: '100%' },
  { inner: '58%', outer: '76%' },
  { inner: '34%', outer: '52%' },
];
const CORNER_RADIUS = 4;
const TRACK_FILL = { fill: 'var(--surface-sunken)' } as const;

function bandForIndex(index: number): { readonly inner: string; readonly outer: string } {
  return RING_BANDS[index] ?? RING_BANDS[RING_BANDS.length - 1] ?? { inner: '34%', outer: '52%' };
}

function pctOf(metric: GoalCount): number {
  return (metric.value / metric.goal) * 100;
}

/**
 * Legenda única da grade: qual cor é qual meta, na mesma ordem dos anéis (de fora para dentro).
 * Sem ela nenhuma pessoa da grade dizia o que cada anel media (ROT-4).
 */
function MetricLegend(): ReactElement {
  return (
    <div className="mb-2 flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[0.6875rem] text-text-secondary">
      {METRIC_ORDER.map((id) => (
        <span className="flex items-center gap-1.5" key={id}>
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: METRIC_COLOR[id] }} />
          {METRIC_LABEL[id]}
        </span>
      ))}
    </div>
  );
}

export default function PeopleGoalRingsGrid({
  data = defaultData,
  weekStart = defaultWeekStart,
  height,
  className,
}: PeopleGoalRingsGridProps) {
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
        <span>Nenhuma pessoa neste recorte para a semana.</span>
      </div>
    );
  }

  const people = data.map((person) => {
    const rings = METRIC_ORDER.map((id) => ({ id, ...person[id], pct: pctOf(person[id]) }));
    return { ...person, rings, allClosed: rings.every((ring) => ring.pct >= 100) };
  });

  const allClosedCount = people.filter((person) => person.allClosed).length;
  const exception = people.find((person) => !person.allClosed);
  const exceptionOpen = exception?.rings.filter((ring) => ring.pct < 100) ?? [];
  const summary = [
    `Grade com ${String(people.length)} pessoas da pré-vendas, cada uma com o trio de anéis de entradas, agendas e SLA da semana de ${formatDate(weekStart)}.`,
    `${String(allClosedCount)} de ${String(people.length)} fecharam as três metas.`,
    exception
      ? `${exception.name} não fechou ${exceptionOpen.map((ring) => METRIC_LABEL[ring.id]).join(' e ')}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <MetricLegend />
      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-4">
      {people.map((person) => (
        <div className="flex min-w-0 flex-col items-center gap-1.5" key={person.id}>
          <div aria-hidden className="relative aspect-square h-16 max-h-full shrink-0">
            {person.rings.map((ring, index) => {
              const band = bandForIndex(index);
              const value = Math.min(ring.pct, 100);
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
                        background={TRACK_FILL}
                        cornerRadius={CORNER_RADIUS}
                        dataKey="value"
                        fill={METRIC_COLOR[ring.id]}
                        isAnimationActive={animate}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <p className="w-full truncate text-center text-xs font-medium text-text-primary">{person.name}</p>
          <p className="kpi-number flex w-full flex-wrap justify-center gap-x-2 gap-y-0.5 text-[0.6875rem] text-text-muted">
            {person.rings.map((ring) => {
              const closed = ring.pct >= 100;
              return (
                <span className="inline-flex items-center gap-0.5" key={ring.id}>
                  {closed ? <CheckCircle2 aria-hidden className="size-2.5 text-positive" /> : null}
                  <span style={{ color: closed ? 'var(--text-primary)' : undefined }}>
                    {formatInt(ring.value)}/{formatInt(ring.goal)}
                  </span>
                </span>
              );
            })}
          </p>
          <span className="flex h-3.5 items-center gap-1 text-[0.6875rem] font-medium text-positive">
            {person.allClosed ? (
              <>
                <CheckCircle2 aria-hidden className="size-3" />
                três metas
              </>
            ) : null}
          </span>
        </div>
      ))}
      </div>
    </div>
  );
}
