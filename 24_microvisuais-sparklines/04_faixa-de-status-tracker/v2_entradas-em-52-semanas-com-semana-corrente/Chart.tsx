import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AS_OF, CUTOFFS, data as defaultData, FIRST_WEEK, type WeekEntries } from './data';

/**
 * Faixa de calor das entradas por semana: um bloco por semana, pintado por uma de três classes.
 * Lê-se em que época o volume se concentrou. A semana corrente leva contorno e o valor escrito,
 * porque está incompleta e a classe dela engana; semana sem coleta é contorno vazado e nunca cai
 * na menor classe, que significa "poucas entradas medidas".
 */
export interface WeeklyHeatStripProps {
  readonly data?: readonly WeekEntries[];
  readonly height?: number;
  readonly className?: string;
}

const MS_WEEK = 7 * 86_400_000;
/** Três degraus da rampa (seq 5 a seq 7), os únicos a 3:1 contra o cartão nos dois temas (TOK-8). */
const CLASS_COLORS = [CHART_SEQUENTIAL_COLORS[4], CHART_SEQUENTIAL_COLORS[5], CHART_SEQUENTIAL_COLORS[6]] as const;
const NO_DATA_COLOR = 'var(--text-muted)';
const CURRENT_COLOR = 'var(--text-primary)';
/** Viradas de trimestre: jan, abr, jul e out (meses 0, 3, 6 e 9). */
const QUARTER_STEP = 3;

function classOf(value: number): number {
  return CUTOFFS.filter((cutoff) => value >= cutoff).length;
}

/** Data em UTC: a semana nunca muda de coluna por causa de fuso. */
function isoAt(week: number): string {
  const [year, month, day] = FIRST_WEEK.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1) + week * MS_WEEK).toISOString().slice(0, 10);
}

/** Rótulo de classe pelos cortes: a legenda diz o intervalo, e a cor só acompanha. */
function classLabel(index: number): string {
  const low = CUTOFFS[index - 1];
  const high = CUTOFFS[index];
  if (low === undefined && high !== undefined) return `menos de ${formatInt(high)}`;
  if (high === undefined && low !== undefined) return `${formatInt(low)} ou mais`;
  return `${formatInt(low ?? 0)} a ${formatInt((high ?? 0) - 1)}`;
}

export default function WeeklyHeatStrip({ data = defaultData, height, className }: WeeklyHeatStripProps) {
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

  const lastIndex = data.length - 1;
  const current = data[lastIndex] ?? null;
  const measured = data.filter((value): value is number => value !== null);
  const peak = measured.length === 0 ? null : Math.max(...measured);
  const peakWeek = peak === null ? null : formatDate(isoAt(data.indexOf(peak)));
  const gaps = data.length - measured.length;
  const asOf = formatDate(AS_OF);

  const summary =
    `Faixa de calor de ${formatInt(data.length)} semanas de entradas, a partir de ${formatDate(isoAt(0))}. ` +
    (peak === null || peakWeek === null
      ? 'Nenhuma semana tem dado. '
      : `O pico é de ${formatInt(peak)} na semana de ${peakWeek}. `) +
    (current === null
      ? 'A semana corrente está sem dado. '
      : `A semana corrente tem ${formatInt(current)} até ${asOf}, parcial. `) +
    `${formatInt(gaps)} semanas ficaram sem dado.`;

  const monthKey = (week: number) => isoAt(week).slice(0, 7);
  const turns = data.map((_, week) => {
    const month = Number(monthKey(week).slice(5, 7)) - 1;
    const isTurn = month % QUARTER_STEP === 0 && (week === 0 || monthKey(week) !== monthKey(week - 1));
    return isTurn ? formatMonthShort(monthKey(week)) : null;
  });

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col justify-center gap-4', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden className="flex items-end gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex h-4 gap-px text-[0.6875rem] leading-4 whitespace-nowrap text-text-muted tabular-nums">
            {turns.map((label, week) => (
              <span className={cn('flex min-w-0 flex-1', week === lastIndex && 'justify-end')} key={isoAt(week)}>
                {label}
              </span>
            ))}
          </div>
          <div className="mt-1 flex h-8 gap-px">
            {data.map((value, week) => {
              const isCurrent = week === lastIndex;
              const fill = value === null ? undefined : CLASS_COLORS[classOf(value)];
              return (
                <span
                  className="min-w-0 flex-1 rounded-sm border border-solid"
                  key={isoAt(week)}
                  style={{
                    backgroundColor: fill,
                    borderColor: isCurrent ? CURRENT_COLOR : (fill ?? NO_DATA_COLOR),
                  }}
                />
              );
            })}
          </div>
        </div>

        <dl className="flex w-44 shrink-0 flex-col gap-2 border-l border-line-subtle pl-4 text-[0.6875rem] leading-4 text-text-muted">
          <div className="tabular-nums">
            <dd className="font-display text-sm font-semibold text-text-primary">
              {current === null ? 'sem dado' : `${formatInt(current)} entradas`}
            </dd>
            <dt>{`semana corrente, parcial até ${asOf}`}</dt>
          </div>
          {peak === null ? null : (
            <div className="tabular-nums">
              <dd className="text-xs text-text-secondary">{`${formatInt(peak)} na semana mais cheia`}</dd>
              <dt>{`semana de ${peakWeek ?? ''}`}</dt>
            </div>
          )}
        </dl>
      </div>

      <div aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span>entradas por semana:</span>
        {CLASS_COLORS.map((color, index) => (
          <span className="flex items-center gap-1.5 tabular-nums" key={color}>
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
            {classLabel(index)}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-solid" style={{ borderColor: NO_DATA_COLOR }} />
          sem dado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-solid" style={{ borderColor: CURRENT_COLOR }} />
          semana corrente
        </span>
      </div>
    </figure>
  );
}
