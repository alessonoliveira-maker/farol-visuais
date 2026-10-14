import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, ComposedChart, Line, ReferenceDot, ReferenceLine, ResponsiveContainer, Scatter, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, GRID_COLOR } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AXIS_STEP_DAYS, data as defaultData, type OpportunityCase } from './data';

/**
 * Curva de sobrevivência de Kaplan-Meier: a proporção das oportunidades que ainda não chegaram à
 * decisão, dia a dia, sem descartar as que seguem abertas. Medir só as encerradas encurta o ciclo,
 * porque as longas ainda estão abertas; aqui elas entram como censura, um traço vertical na curva,
 * e saem da conta de quem está em risco no dia em que foram vistas pela última vez.
 *
 * O evento é a decisão, ganho ou perda. Perda nunca vira censura: a curva desceria devagar demais e
 * a chance de ganhar sairia inflada.
 */
export interface DecisionSurvivalProps {
  readonly data?: readonly OpportunityCase[];
  readonly height?: number;
  readonly className?: string;
}

interface KmStep {
  readonly days: number;
  readonly survival: number;
}

const Y_AXIS_WIDTH = 52;
const MARGIN = { top: 10, right: 24, bottom: 0, left: 8 } as const;
/** A tabela de em risco começa onde o plano começa: margem da esquerda mais a largura do eixo Y. */
const GUTTER = MARGIN.left + Y_AXIS_WIDTH;
/** EIX-6b: `tickMargin` de 8 mais cerca de 15 px de tinta de 11 px. */
const X_AXIS_HEIGHT = 26;
const CURVE_STROKE = 'var(--chart-1)';
const GUIDE_STROKE = 'var(--line-strong)';
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
const CENSOR_HALF_HEIGHT = 4;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/**
 * Kaplan-Meier com eventos e censuras agrupados por dia. No mesmo dia o evento sai do grupo em risco
 * antes da censura, que é a convenção do estimador. Cada dia com evento multiplica a curva por
 * (1 menos eventos sobre em risco); dia só com censura não mexe na altura, só reduz o grupo.
 */
function kaplanMeier(cases: readonly OpportunityCase[]): KmStep[] {
  const byDay = new Map<number, { events: number; censored: number }>();
  for (const item of cases) {
    const group = byDay.get(item.days) ?? { events: 0, censored: 0 };
    if (item.decided) group.events += 1;
    else group.censored += 1;
    byDay.set(item.days, group);
  }
  let atRisk = cases.length;
  let survival = 1;
  const steps: KmStep[] = [{ days: 0, survival: 1 }];
  for (const day of [...byDay.keys()].sort((a, b) => a - b)) {
    const group = byDay.get(day);
    if (!group) continue;
    if (group.events > 0) survival *= 1 - group.events / atRisk;
    steps.push({ days: day, survival });
    atRisk -= group.events + group.censored;
  }
  return steps;
}

/** Primeiro dia em que a curva chega a 50% ou menos, ou `null` quando ela nunca cruza. */
function medianDays(steps: readonly KmStep[]): number | null {
  const crossing = steps.find((step) => step.survival <= 0.5);
  return crossing ? crossing.days : null;
}

function survivalAt(steps: readonly KmStep[], day: number): number {
  let value = 1;
  for (const step of steps) if (step.days <= day) value = step.survival;
  return value;
}

const renderCensorTick = ({ cx, cy }: { readonly cx?: number; readonly cy?: number }): ReactElement => (
  <line stroke={CURVE_STROKE} strokeWidth={1.5} x1={cx} x2={cx} y1={(cy ?? 0) - CENSOR_HALF_HEIGHT} y2={(cy ?? 0) + CENSOR_HALF_HEIGHT} />
);

export default function DecisionSurvival({ data = defaultData, height, className }: DecisionSurvivalProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade neste recorte: não há tempo até a decisão para estimar.</span>
      </div>
    );
  }

  const steps = kaplanMeier(data);
  const median = medianDays(steps);
  const open = data.filter((item) => !item.decided).length;
  const longest = data.reduce((most, item) => Math.max(most, item.days), 0);
  const ceiling = Math.ceil(longest / AXIS_STEP_DAYS) * AXIS_STEP_DAYS;
  const ticks = Array.from({ length: ceiling / AXIS_STEP_DAYS + 1 }, (_, index) => index * AXIS_STEP_DAYS);
  const censorDays = [...new Set(data.filter((item) => !item.decided).map((item) => item.days))].sort((a, b) => a - b);
  const censors = censorDays.map((day) => ({ days: day, survival: survivalAt(steps, day) }));
  const medianText = median === null ? null : `metade decide em até ${formatDays(median)}`;

  const renderMedianLabel =
    (text: string) =>
    ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number } }): ReactElement => (
      <text className="tabular-nums" fill="var(--text-secondary)" fontSize={11} style={HALO} textAnchor="end" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) - 4} y={(viewBox?.y ?? 0) - 8}>
        {text}
      </text>
    );

  const summary =
    `Curva de sobrevivência de ${formatInt(data.length)} oportunidades até a decisão, ganho ou perda. ` +
    (median === null ? 'A curva não chega a 50%, então não há mediana. ' : `Metade decide em até ${formatDays(median)}. `) +
    `${formatInt(open)} seguem abertas e entram como censura. O caso mais longo tem ${formatDays(longest)}.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <p aria-hidden className="m-0 shrink-0 text-xs leading-4 text-text-secondary">
        {median === null
          ? `A curva das ${formatInt(data.length)} oportunidades não chega a 50%: a mediana ainda não existe`
          : `Metade das ${formatInt(data.length)} oportunidades decide em até ${formatDays(median)}, contando as ${formatInt(open)} ainda abertas`}
      </p>
      <span aria-hidden className="shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        oportunidades ainda sem decisão, por dia desde a abertura
      </span>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="days" domain={[0, ceiling]} height={X_AXIS_HEIGHT} tickFormatter={(value: number) => formatInt(value)} tickLine={false} tickMargin={8} ticks={ticks} type="number" />
            <YAxis {...AXIS_PROPS} axisLine={false} dataKey="survival" domain={[0, 1]} tickFormatter={(value: number) => formatPercent(value, 0)} tickLine={false} tickMargin={8} ticks={[...Y_TICKS]} type="number" width={Y_AXIS_WIDTH} />
            <ReferenceLine ifOverflow="extendDomain" label={medianText === null ? undefined : renderMedianLabel(medianText)} stroke={GUIDE_STROKE} strokeDasharray="4 3" y={0.5} />
            {median === null ? null : (
              <ReferenceLine ifOverflow="extendDomain" segment={[{ x: median, y: 0 }, { x: median, y: 0.5 }]} stroke={GUIDE_STROKE} strokeDasharray="4 3" />
            )}
            <Line data={steps} dataKey="survival" dot={false} isAnimationActive={false} stroke={CURVE_STROKE} strokeWidth={2} type="stepAfter" />
            {/* Censura é traço vertical e não ponto: o traço lê como "a observação para aqui" sem competir com o degrau. */}
            <Scatter data={censors} dataKey="survival" isAnimationActive={false} legendType="none" shape={renderCensorTick} />
            {median === null ? null : <ReferenceDot fill={CURVE_STROKE} ifOverflow="extendDomain" r={4} stroke="var(--surface-raised)" strokeWidth={1.5} x={median} y={0.5} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Mesmas margens do gráfico: cada número fica no x do tique de cima, por porcentagem do domínio. */}
      <div aria-hidden className="relative h-4 shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        <span className="absolute left-0">em risco</span>
        <div className="absolute inset-y-0" style={{ left: GUTTER, right: MARGIN.right }}>
          {ticks.map((tick) => (
            <span className="absolute -translate-x-1/2 tabular-nums text-text-secondary" key={tick} style={{ left: `${String((tick / ceiling) * 100)}%` }}>
              {formatInt(data.filter((item) => item.days >= tick).length)}
            </span>
          ))}
        </div>
      </div>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span>traço vertical na curva: oportunidade ainda aberta, entra como censura</span>
        <span>o evento é ganho ou perda; perda nunca vira censura</span>
      </div>
    </figure>
  );
}
