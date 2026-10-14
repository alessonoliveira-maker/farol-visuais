import { Filter } from 'lucide-react';

import { formatDate, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SlaDay, type SlaDayState, type SlaTracker } from './data';

/**
 * Cartão de KPI: percentual de dias dentro do SLA de primeiro contato numa fita de 60 dias
 * corridos, uma célula por dia. HTML com Tailwind, sem BarChart: fim de semana e dia sem coleta
 * saem do denominador e ganham desenho próprio, para não ler falha onde só há calendário ou fonte
 * muda.
 */
export interface SlaTrackerCardProps {
  readonly data?: SlaTracker;
  readonly className?: string;
}

const CELL_CLASS: Record<SlaDayState, string> = {
  dentro: 'bg-chart-1',
  fora: 'bg-negative',
  sem_dado: 'border border-dashed border-text-muted bg-transparent',
  fim_de_semana: 'bg-surface-sunken',
};

const STATE_LABEL: Record<SlaDayState, string> = {
  dentro: 'dentro do SLA',
  fora: 'fora do SLA',
  sem_dado: 'sem coleta',
  fim_de_semana: 'fim de semana',
};

/** Ordem de leitura da legenda, da situação boa para a mais rara. */
const LEGEND_ORDER: readonly SlaDayState[] = ['dentro', 'fora', 'sem_dado', 'fim_de_semana'];

/** Rótulo curto da legenda; o title de cada célula usa a versão longa de STATE_LABEL. */
const LEGEND_LABEL: Record<SlaDayState, string> = {
  dentro: 'dentro',
  fora: 'fora',
  sem_dado: 'sem coleta',
  fim_de_semana: 'fim de semana',
};

interface GapRange {
  readonly start: string;
  readonly end: string;
  readonly count: number;
}

function longestGap(days: readonly SlaDay[]): GapRange | null {
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;
  days.forEach((day, index) => {
    if (day.state === 'sem_dado') {
      if (curLen === 0) curStart = index;
      curLen += 1;
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
      }
    } else {
      curLen = 0;
    }
  });
  if (bestLen === 0 || bestStart === -1) return null;
  const first = days[bestStart];
  const last = days[bestStart + bestLen - 1];
  if (!first || !last) return null;
  return { start: first.date, end: last.date, count: bestLen };
}

export default function SlaTrackerCard({ data = defaultData, className }: SlaTrackerCardProps) {
  const { days, label, thresholdHours } = data;
  const first = days.at(0);
  const last = days.at(-1);
  const validDays = days.filter((day) => day.state === 'dentro' || day.state === 'fora');
  const withinDays = validDays.filter((day) => day.state === 'dentro').length;
  const gap = longestGap(days);

  if (days.length === 0) {
    return (
      <div
        className={cn(
          'flex h-full w-full min-w-0 items-center gap-2 rounded-lg border border-line-subtle bg-surface-raised p-4 text-xs text-text-muted',
          className,
        )}
        role="status"
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum dia neste recorte: sem SLA medido no período.</span>
      </div>
    );
  }

  const summary = [
    `Fita de estado com ${String(days.length)} dias corridos do SLA de primeiro contato de ${String(thresholdHours)} horas.`,
    `${formatRateWithVolume(withinDays, validDays.length)} dias válidos ficaram dentro do SLA.`,
    gap ? `Sem coleta por ${String(gap.count)} dias úteis seguidos, de ${formatDate(gap.start)} a ${formatDate(gap.end)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{label}</p>
        <p className="shrink-0 text-xs text-text-muted">até {thresholdHours} h</p>
      </div>

      <p className="kpi-number mt-2 text-3xl leading-none font-semibold text-text-primary">
        {formatRateWithVolume(withinDays, validDays.length)}
      </p>
      <p className="mt-1 text-xs text-text-muted">dias válidos dentro do SLA</p>

      <div aria-hidden className="mt-3 flex min-h-8 flex-1 items-stretch gap-px">
        {days.map((day) => (
          <div
            className={cn('min-w-[2px] flex-1 rounded-[1px]', CELL_CLASS[day.state])}
            key={day.date}
            title={`${formatDate(day.date)}: ${STATE_LABEL[day.state]}`}
          />
        ))}
      </div>

      {first && last ? (
        <div className="mt-1 flex items-baseline justify-between text-[0.6875rem] leading-none text-text-muted tabular-nums">
          <span>{formatDate(first.date)}</span>
          <span>{formatDate(last.date)}</span>
        </div>
      ) : null}

      <div aria-hidden className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.6875rem] leading-none text-text-muted">
        {LEGEND_ORDER.map((state) => (
          <span className="inline-flex items-center gap-1" key={state}>
            <span aria-hidden className={cn('size-2 shrink-0 rounded-[1px]', CELL_CLASS[state])} />
            {LEGEND_LABEL[state]}
          </span>
        ))}
      </div>
    </article>
  );
}
