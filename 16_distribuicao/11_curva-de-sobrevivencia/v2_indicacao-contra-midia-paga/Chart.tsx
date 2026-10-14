import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, ComposedChart, Line, ReferenceDot, ReferenceLine, ResponsiveContainer, Scatter, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, GRID_COLOR } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AXIS_STEP_DAYS, data as defaultData, type OpportunityCase, type OriginGroup } from './data';

/**
 * Duas curvas de Kaplan-Meier, uma por origem, no mesmo plano. A pergunta é qual origem decide mais
 * rápido, e a resposta honesta só aparece com as abertas dentro da conta: comparar só as encerradas
 * favorece a origem que mais deixa casos longos abertos. Cada origem tem a cor do próprio slot, e a
 * mediana dela se lê onde a curva cruza os 50%.
 */
export interface OriginSurvivalProps {
  readonly data?: readonly OriginGroup[];
  readonly height?: number;
  readonly className?: string;
}

interface KmStep {
  readonly days: number;
  readonly survival: number;
}

const Y_AXIS_WIDTH = 52;
const MARGIN = { top: 10, right: 24, bottom: 0, left: 8 } as const;
const GUTTER = MARGIN.left + Y_AXIS_WIDTH;
/** EIX-6b: `tickMargin` de 8 mais cerca de 15 px de tinta de 11 px. */
const X_AXIS_HEIGHT = 26;
const GUIDE_STROKE = 'var(--line-strong)';
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
const CENSOR_HALF_HEIGHT = 4;
const LABEL_LINE_HEIGHT = 14;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Kaplan-Meier com eventos e censuras agrupados por dia; no mesmo dia o evento sai do grupo em risco antes da censura. */
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

/** Slot do dado para a cor, na ordem da COR-8; a cor pertence ao grupo, não à posição dele na lista. */
const SLOT_COLOR: Readonly<Record<number, string>> = {
  1: 'var(--chart-1)',
  2: 'var(--chart-2)',
  3: 'var(--chart-3)',
  4: 'var(--chart-4)',
  5: 'var(--chart-5)',
  6: 'var(--chart-6)',
};
const colorOf = (group: OriginGroup): string => SLOT_COLOR[group.slot] ?? 'var(--chart-1)';

const renderCensorTick =
  (color: string) =>
  ({ cx, cy }: { readonly cx?: number; readonly cy?: number }): ReactElement => (
    <line stroke={color} strokeWidth={1.5} x1={cx} x2={cx} y1={(cy ?? 0) - CENSOR_HALF_HEIGHT} y2={(cy ?? 0) + CENSOR_HALF_HEIGHT} />
  );

export default function OriginSurvival({ data = defaultData, height, className }: OriginSurvivalProps) {
  const style = height === undefined ? undefined : { height };
  const all = data.flatMap((group) => group.cases);

  if (all.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade neste recorte: não há tempo até a decisão para comparar as origens.</span>
      </div>
    );
  }

  const groups = data
    .filter((group) => group.cases.length > 0)
    .map((group) => {
      const steps = kaplanMeier(group.cases);
      const censorDays = [...new Set(group.cases.filter((item) => !item.decided).map((item) => item.days))].sort((a, b) => a - b);
      return {
        group,
        steps,
        median: medianDays(steps),
        open: group.cases.filter((item) => !item.decided).length,
        censors: censorDays.map((day) => ({ days: day, survival: survivalAt(steps, day) })),
      };
    });
  const longest = all.reduce((most, item) => Math.max(most, item.days), 0);
  const ceiling = Math.ceil(longest / AXIS_STEP_DAYS) * AXIS_STEP_DAYS;
  const ticks = Array.from({ length: ceiling / AXIS_STEP_DAYS + 1 }, (_, index) => index * AXIS_STEP_DAYS);
  const medianOf = (entry: (typeof groups)[number]): string =>
    `${entry.group.label}: metade decide em até ${entry.median === null ? 'um prazo que a curva não alcança' : formatDays(entry.median)}`;

  /** Os dois rótulos empilham acima da guia, na ordem da legenda, no canto livre onde as curvas já passaram de 50%. */
  const renderMedianLabels = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number } }): ReactElement => (
    <g>
      {groups.map((entry, index) => (
        <text
          className="tabular-nums"
          fill="var(--text-secondary)"
          fontSize={11}
          key={entry.group.key}
          style={HALO}
          textAnchor="end"
          x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) - 4}
          y={(viewBox?.y ?? 0) - 8 - (groups.length - 1 - index) * LABEL_LINE_HEIGHT}
        >
          {medianOf(entry)}
        </text>
      ))}
    </g>
  );

  const medians = groups.map((entry) => `${entry.group.label} ${entry.median === null ? 'indefinida' : formatDays(entry.median)}`).join(', ');
  const summary =
    `Gráfico de ${formatInt(groups.length)} curvas de sobrevivência do tempo até a decisão por origem, com as abertas contadas como censura. ` +
    `Mediana: ${medians}. ` +
    `Abertas: ${groups.map((entry) => `${entry.group.label} ${formatInt(entry.open)} de ${formatInt(entry.group.cases.length)}`).join(', ')}.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <p aria-hidden className="m-0 shrink-0 text-xs leading-4 text-text-secondary">
        {`Mediana contando as abertas: ${medians}`}
      </p>
      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-secondary">
        {groups.map((entry) => (
          <span className="inline-flex items-center gap-2 tabular-nums" key={entry.group.key}>
            <span className="h-0.5 w-4 shrink-0" style={{ backgroundColor: colorOf(entry.group) }} />
            {`${entry.group.label}: ${formatInt(entry.group.cases.length)} oportunidades, ${formatInt(entry.open)} abertas`}
          </span>
        ))}
      </div>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="days" domain={[0, ceiling]} height={X_AXIS_HEIGHT} tickFormatter={(value: number) => formatInt(value)} tickLine={false} tickMargin={8} ticks={ticks} type="number" />
            <YAxis {...AXIS_PROPS} axisLine={false} dataKey="survival" domain={[0, 1]} tickFormatter={(value: number) => formatPercent(value, 0)} tickLine={false} tickMargin={8} ticks={[...Y_TICKS]} type="number" width={Y_AXIS_WIDTH} />
            <ReferenceLine ifOverflow="extendDomain" label={renderMedianLabels} stroke={GUIDE_STROKE} strokeDasharray="4 3" y={0.5} />
            {groups.map((entry) =>
              entry.median === null ? null : (
                <ReferenceLine ifOverflow="extendDomain" key={`drop-${entry.group.key}`} segment={[{ x: entry.median, y: 0 }, { x: entry.median, y: 0.5 }]} stroke={colorOf(entry.group)} strokeDasharray="4 3" />
              ),
            )}
            {groups.map((entry) => (
              <Line data={entry.steps} dataKey="survival" dot={false} isAnimationActive={false} key={entry.group.key} stroke={colorOf(entry.group)} strokeWidth={2} type="stepAfter" />
            ))}
            {groups.map((entry) => (
              <Scatter data={entry.censors} dataKey="survival" isAnimationActive={false} key={`censor-${entry.group.key}`} legendType="none" shape={renderCensorTick(colorOf(entry.group))} />
            ))}
            {groups.map((entry) =>
              entry.median === null ? null : (
                <ReferenceDot fill={colorOf(entry.group)} ifOverflow="extendDomain" key={`dot-${entry.group.key}`} r={4} stroke="var(--surface-raised)" strokeWidth={1.5} x={entry.median} y={0.5} />
              ),
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Mesmas margens do gráfico: cada número fica no x do tique de cima, por porcentagem do domínio. */}
      <div aria-hidden className="flex shrink-0 flex-col text-[0.6875rem] leading-4 text-text-muted">
        <span>em risco, na ordem da legenda</span>
        {groups.map((entry) => (
          <div className="relative h-4" key={`risk-${entry.group.key}`}>
            <span className="absolute top-1/2 h-0.5 w-4 -translate-y-1/2" style={{ backgroundColor: colorOf(entry.group), left: MARGIN.left }} />
            <div className="absolute inset-y-0" style={{ left: GUTTER, right: MARGIN.right }}>
              {ticks.map((tick) => (
                <span className="absolute -translate-x-1/2 tabular-nums text-text-secondary" key={tick} style={{ left: `${String((tick / ceiling) * 100)}%` }}>
                  {formatInt(entry.group.cases.filter((item) => item.days >= tick).length)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span>traço vertical na curva: oportunidade ainda aberta, na cor da própria origem</span>
        <span>dias desde a abertura; o evento é ganho ou perda</span>
      </div>
    </figure>
  );
}
