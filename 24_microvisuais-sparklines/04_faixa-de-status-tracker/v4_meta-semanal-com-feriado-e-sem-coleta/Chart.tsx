import { Filter } from 'lucide-react';

import { formatDate, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, FIRST_WEEK, WEEKLY_TARGET, type WeekReading } from './data';

/**
 * Faixa semanal da meta de agendas: um bloco por semana, batida, fora da meta, feriado ou sem
 * coleta. Feriado e sem coleta são estados próprios e ficam fora da conta, então o resumo conta
 * semanas com dado, e não semanas do calendário. A maior sequência de metas batidas vem anotada
 * acima da fileira; qualquer semana que não seja batida a interrompe.
 */
export interface WeeklyTargetStripProps {
  readonly data?: readonly WeekReading[];
  readonly height?: number;
  readonly className?: string;
}

const MS_WEEK = 7 * 86_400_000;
const NEUTRAL_COLOR = 'var(--text-muted)';

type WeekState = 'hit' | 'miss' | 'holiday' | 'none';

/** A altura menor do fora da meta é o segundo canal, para o estado não depender só do matiz. */
const STATE_CLASS: Record<WeekState, string> = {
  hit: 'h-6 bg-positive',
  miss: 'h-3.5 bg-negative',
  holiday: 'h-6 bg-line-strong',
  none: 'h-6 border border-solid',
};

const LEGEND: readonly { readonly state: WeekState; readonly label: string; readonly swatch: string }[] = [
  { state: 'hit', label: 'meta batida', swatch: 'h-3 bg-positive' },
  { state: 'miss', label: 'fora da meta, bloco mais baixo', swatch: 'h-2 bg-negative' },
  { state: 'holiday', label: 'feriado, fora da conta', swatch: 'h-3 bg-line-strong' },
  { state: 'none', label: 'sem dado, fora da conta', swatch: 'h-3 border border-solid' },
];

function stateOf(reading: WeekReading): WeekState {
  if (reading.holiday) return 'holiday';
  if (reading.agendas === null) return 'none';
  return reading.agendas >= WEEKLY_TARGET ? 'hit' : 'miss';
}

/** Data em UTC: a semana nunca muda de lugar por causa de fuso. */
function isoAt(week: number): string {
  const [year, month, day] = FIRST_WEEK.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1) + week * MS_WEEK).toISOString().slice(0, 10);
}

interface Run {
  readonly start: number;
  readonly length: number;
}

/** Maior trecho seguido de semanas batidas; em empate vale o primeiro. */
function longestRun(states: readonly WeekState[]): Run | null {
  let best: Run | null = null;
  let start = 0;
  states.forEach((state, index) => {
    if (state !== 'hit') {
      start = index + 1;
      return;
    }
    const length = index - start + 1;
    if (best === null || length > best.length) best = { start, length };
  });
  return best;
}

export default function WeeklyTargetStrip({ data = defaultData, height, className }: WeeklyTargetStripProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-2 text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4" />
        <p className="text-xs">O recorte não tem semanas medidas, então não há faixa para desenhar.</p>
      </div>
    );
  }

  const states = data.map(stateOf);
  const hits = states.filter((state) => state === 'hit').length;
  const misses = states.filter((state) => state === 'miss').length;
  const holidays = states.filter((state) => state === 'holiday').length;
  const gaps = states.filter((state) => state === 'none').length;
  const withData = hits + misses;
  const run = longestRun(states);
  const holidayIndex = states.indexOf('holiday');
  const firstLabel = formatDate(isoAt(0));
  const lastLabel = formatDate(isoAt(data.length - 1));

  const summary =
    `Meta semanal de agendas em ${formatInt(data.length)} semanas, de ${firstLabel} a ${lastLabel}: ` +
    `${formatInt(hits)} de ${formatInt(withData)} semanas com dado bateram a meta e ${formatInt(misses)} ficaram fora. ` +
    `Fora da conta: ${formatInt(holidays)} de feriado e ${formatInt(gaps)} sem coleta. ` +
    (run === null ? 'Nenhuma semana bateu a meta.' : `A maior sequência batida tem ${formatInt(run.length)} semanas.`);

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col justify-center gap-4', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden>
        <p className="tabular-nums">
          <span className="font-display text-sm font-semibold text-text-primary">
            {withData === 0 ? formatUnavailable() : `${formatInt(hits)} de ${formatInt(withData)}`}
          </span>
          <span className="ml-2 text-xs text-text-secondary">
            {`semanas com dado bateram a meta de ${formatInt(WEEKLY_TARGET)} agendas`}
          </span>
        </p>
        <p className="mt-1 text-[0.6875rem] leading-4 text-text-muted tabular-nums">
          {`Fora da conta: ${formatInt(holidays)} de feriado e ${formatInt(gaps)} sem coleta.`}
        </p>
      </div>

      <div aria-hidden>
        <div className="flex h-4 gap-px text-[0.6875rem] leading-4 whitespace-nowrap text-text-muted tabular-nums">
          {data.map((_, index) => (
            <span className={cn('flex min-w-0 flex-1', index === holidayIndex && 'justify-center')} key={isoAt(index)}>
              {run !== null && index === run.start ? `maior sequência: ${formatInt(run.length)} semanas batidas` : null}
              {index === holidayIndex ? 'feriado' : null}
            </span>
          ))}
        </div>
        {/* A barra da sequência é uma peça só, posicionada em fração da fileira: células soltas com vão
            de 1 px desenhavam um tracejado que se lia como sublinhado do texto. */}
        <div className="h-2">
          {run === null ? null : (
            <div
              className="mt-1 border-t border-solid border-text-secondary"
              style={{
                marginLeft: `${String((run.start / data.length) * 100)}%`,
                width: `${String((run.length / data.length) * 100)}%`,
              }}
            />
          )}
        </div>
        <div className="flex h-6 items-end gap-px">
          {states.map((state, index) => (
            <span
              className={cn('min-w-0 flex-1 rounded-sm', STATE_CLASS[state])}
              key={isoAt(index)}
              style={state === 'none' ? { borderColor: NEUTRAL_COLOR } : undefined}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[0.6875rem] leading-4 text-text-muted tabular-nums">
          <span>{`semana de ${firstLabel}`}</span>
          <span>{`semana de ${lastLabel}`}</span>
        </div>
      </div>

      <div aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        {LEGEND.map(({ state, label, swatch }) => (
          <span className="flex items-center gap-1.5" key={state}>
            <span
              className={cn('w-3 shrink-0 rounded-sm', swatch)}
              style={state === 'none' ? { borderColor: NEUTRAL_COLOR } : undefined}
            />
            {label}
          </span>
        ))}
      </div>
    </figure>
  );
}
