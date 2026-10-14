import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, ComposedChart, Line, ReferenceDot, ReferenceLine, ResponsiveContainer, Scatter, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, GRID_COLOR } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AXIS_STEP_MINUTES, data as defaultData, SLA_MINUTES, type LeadCase, type LeadGroup } from './data';

/**
 * Curva de sobrevivência do primeiro contato humano, por tipo de dia de entrada. O evento é o
 * contato; o lead ainda sem contato na extração é censura, com a idade dele naquele momento, e não
 * um contato em zero minuto. A leitura é o cruzamento com o SLA: que parte dos leads ainda não foi
 * contatada quando os 30 minutos se esgotam, para cada curva.
 *
 * `inverted` vira a mesma estimativa de cabeça para baixo, "já contatados": sobe em vez de descer e
 * lê como a acumulada do modelo 04. O sentido vive escrito acima do gráfico, porque as duas formas
 * são idênticas no desenho e respondem perguntas opostas.
 */
export interface FirstContactSurvivalProps {
  readonly data?: readonly LeadGroup[];
  readonly slaMinutes?: number;
  readonly inverted?: boolean;
  readonly height?: number;
  readonly className?: string;
}

interface KmStep {
  readonly minutes: number;
  readonly share: number;
}

const Y_AXIS_WIDTH = 52;
const MARGIN = { top: 10, right: 24, bottom: 0, left: 8 } as const;
/** EIX-6b: `tickMargin` de 8 mais cerca de 15 px de tinta de 11 px. */
const X_AXIS_HEIGHT = 26;
const GUIDE_STROKE = 'var(--line-strong)';
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
const CENSOR_HALF_HEIGHT = 4;
const LABEL_DX = 8;
/** O rótulo do cruzamento sobe quando a curva desce para a direita, e desce quando ela sobe. */
const LABEL_DY = 12;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Kaplan-Meier com contatos e censuras agrupados por minuto; no mesmo minuto o contato sai do grupo em risco antes da censura. */
function kaplanMeier(cases: readonly LeadCase[]): KmStep[] {
  const byMinute = new Map<number, { events: number; censored: number }>();
  for (const item of cases) {
    const group = byMinute.get(item.minutes) ?? { events: 0, censored: 0 };
    if (item.reached) group.events += 1;
    else group.censored += 1;
    byMinute.set(item.minutes, group);
  }
  let atRisk = cases.length;
  let survival = 1;
  const steps: KmStep[] = [{ minutes: 0, share: 1 }];
  for (const minute of [...byMinute.keys()].sort((a, b) => a - b)) {
    const group = byMinute.get(minute);
    if (!group) continue;
    if (group.events > 0) survival *= 1 - group.events / atRisk;
    steps.push({ minutes: minute, share: survival });
    atRisk -= group.events + group.censored;
  }
  return steps;
}

/** Altura da curva no minuto dado, ou `null` sem nenhum lead na base: percentual sem base não é zero. */
function shareAt(steps: readonly KmStep[], minute: number, total: number): number | null {
  if (total === 0) return null;
  let value = 1;
  for (const step of steps) if (step.minutes <= minute) value = step.share;
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
const colorOf = (group: LeadGroup): string => SLOT_COLOR[group.slot] ?? 'var(--chart-1)';

const renderCensorTick =
  (color: string) =>
  ({ cx, cy }: { readonly cx?: number; readonly cy?: number }): ReactElement => (
    <line stroke={color} strokeWidth={1.5} x1={cx} x2={cx} y1={(cy ?? 0) - CENSOR_HALF_HEIGHT} y2={(cy ?? 0) + CENSOR_HALF_HEIGHT} />
  );

export default function FirstContactSurvival({ data = defaultData, slaMinutes = SLA_MINUTES, inverted = false, height, className }: FirstContactSurvivalProps) {
  const style = height === undefined ? undefined : { height };
  const all = data.flatMap((group) => group.cases);

  if (all.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há tempo até o primeiro contato para estimar.</span>
      </div>
    );
  }

  const flip = (value: number): number => (inverted ? 1 - value : value);
  const sense = inverted ? 'já contatados' : 'ainda sem contato';
  const groups = data
    .filter((group) => group.cases.length > 0)
    .map((group) => {
      const steps = kaplanMeier(group.cases);
      const censorMinutes = [...new Set(group.cases.filter((item) => !item.reached).map((item) => item.minutes))].sort((a, b) => a - b);
      const atSla = shareAt(steps, slaMinutes, group.cases.length);
      return {
        group,
        rows: steps.map((step) => ({ minutes: step.minutes, share: flip(step.share) })),
        atSla: atSla === null ? null : flip(atSla),
        open: group.cases.filter((item) => !item.reached).length,
        censors: censorMinutes.map((minute) => ({ minutes: minute, share: flip(shareAt(steps, minute, group.cases.length) ?? 1) })),
      };
    });
  const longest = all.reduce((most, item) => Math.max(most, item.minutes), 0);
  const ceiling = Math.max(Math.ceil(longest / AXIS_STEP_MINUTES) * AXIS_STEP_MINUTES, slaMinutes);
  const ticks = Array.from({ length: ceiling / AXIS_STEP_MINUTES + 1 }, (_, index) => index * AXIS_STEP_MINUTES);
  const atSlaText = (entry: (typeof groups)[number]): string => `${entry.group.label}: ${entry.atSla === null ? 'sem base' : formatPercent(entry.atSla, 0)} ${sense}`;

  const renderCrossingLabel =
    (text: string) =>
    ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number } }): ReactElement => (
      <text className="tabular-nums" fill="var(--text-primary)" fontSize={11} fontWeight={500} style={HALO} x={(viewBox?.x ?? 0) + LABEL_DX} y={(viewBox?.y ?? 0) + (inverted ? LABEL_DY + 4 : -LABEL_DY)}>
        {text}
      </text>
    );

  const reading = `No SLA de ${formatInt(slaMinutes)} minutos, ${groups.map((entry) => `${entry.group.label} ${entry.atSla === null ? 'sem base' : formatPercent(entry.atSla, 0)}`).join(', ')} ${sense}`;
  const summary =
    `Gráfico de ${formatInt(groups.length)} curvas de sobrevivência do tempo até o primeiro contato humano, com os leads ainda sem contato contados como censura. ` +
    `No SLA de ${formatInt(slaMinutes)} minutos, ${sense}: ${groups.map((entry) => `${entry.group.label} ${entry.atSla === null ? 'sem base' : formatPercent(entry.atSla, 0)}`).join(', ')}.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <p aria-hidden className="m-0 shrink-0 text-xs leading-4 text-text-secondary">
        {reading}
      </p>
      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-secondary">
        {groups.map((entry) => (
          <span className="inline-flex items-center gap-2 tabular-nums" key={entry.group.key}>
            <span className="h-0.5 w-4 shrink-0" style={{ backgroundColor: colorOf(entry.group) }} />
            {`${entry.group.label}: ${formatInt(entry.group.cases.length)} leads, ${formatInt(entry.open)} sem contato na extração`}
          </span>
        ))}
        <span className="text-text-muted">{`eixo vertical: leads ${sense}`}</span>
      </div>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="minutes" domain={[0, ceiling]} height={X_AXIS_HEIGHT} tickFormatter={(value: number) => formatInt(value)} tickLine={false} tickMargin={8} ticks={ticks} type="number" />
            <YAxis {...AXIS_PROPS} axisLine={false} dataKey="share" domain={[0, 1]} tickFormatter={(value: number) => formatPercent(value, 0)} tickLine={false} tickMargin={8} ticks={[...Y_TICKS]} type="number" width={Y_AXIS_WIDTH} />
            <ReferenceLine ifOverflow="extendDomain" stroke={GUIDE_STROKE} strokeDasharray="4 3" x={slaMinutes} />
            {groups.map((entry) => (
              <Line data={entry.rows} dataKey="share" dot={false} isAnimationActive={false} key={entry.group.key} stroke={colorOf(entry.group)} strokeWidth={2} type="stepAfter" />
            ))}
            {groups.map((entry) => (
              <Scatter data={entry.censors} dataKey="share" isAnimationActive={false} key={`censor-${entry.group.key}`} legendType="none" shape={renderCensorTick(colorOf(entry.group))} />
            ))}
            {/* Sem base não há cruzamento: o ponto e o rótulo saem juntos, em vez de cair na origem como um SLA medido. */}
            {groups.map((entry) =>
              entry.atSla === null ? null : (
                <ReferenceDot fill={colorOf(entry.group)} ifOverflow="extendDomain" key={`dot-${entry.group.key}`} label={renderCrossingLabel(atSlaText(entry))} r={4} stroke="var(--surface-raised)" strokeWidth={1.5} x={slaMinutes} y={entry.atSla} />
              ),
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span>{`minutos desde a entrada do lead; guia vertical: SLA de ${formatInt(slaMinutes)} minutos`}</span>
        <span>traço vertical na curva: lead ainda sem contato, na cor do próprio grupo</span>
      </div>
    </figure>
  );
}
