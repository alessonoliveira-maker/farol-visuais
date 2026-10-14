import { AlertTriangle, Check, Filter } from 'lucide-react';

import { formatDate, formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type TimedHandoff } from './data';

/**
 * Stepper das etapas do handoff com o tempo entre os passos contra o SLA. Cada conector entre
 * duas etapas alcançadas leva a duração em dias; a que passa do limite vai em --warning com
 * ícone e texto do limite. O passo atual conta os dias em aberto até a data de referência do dado.
 */
export interface TimedStepperProps {
  readonly data?: TimedHandoff;
  readonly height?: number;
  readonly className?: string;
}

/** Texto sobre o preenchimento de --chart-1 (ROT-6): token que inverte com o tema. */
const ON_CHART_1 = 'var(--accent-cyan-contrast)';
const MS_PER_DAY = 86_400_000;

type StepState = 'done' | 'current' | 'pending';

/** Dias inteiros entre duas datas `YYYY-MM-DD`, por UTC: sem fuso e sem relógio. */
function daysBetween(from: string, to: string): number | null {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  if (fy === undefined || fm === undefined || fd === undefined || ty === undefined || tm === undefined || td === undefined) return null;
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / MS_PER_DAY);
}

function lastReachedIndex(steps: TimedHandoff['steps']): number | null {
  let found: number | null = null;
  steps.forEach((step, index) => {
    if (step.reachedOn !== null) found = index;
  });
  return found;
}

function stateOf(index: number, current: number | null): StepState {
  if (current === null || index > current) return 'pending';
  return index === current ? 'current' : 'done';
}

function MarkerShape({ state, number }: { readonly state: StepState; readonly number: number }) {
  if (state === 'done') {
    return (
      <span className="flex size-7 items-center justify-center rounded-full bg-chart-1" style={{ color: ON_CHART_1 }}>
        <Check aria-hidden className="size-4" strokeWidth={3} />
      </span>
    );
  }
  if (state === 'current') {
    // Anel duplo: o contorno de --chart-1 em volta do miolo preenchido é a pista do passo atual sem depender de cor.
    return (
      <span className="flex size-9 items-center justify-center rounded-full border-2 border-chart-1">
        <span className="kpi-number flex size-6 items-center justify-center rounded-full bg-chart-1 text-xs font-semibold" style={{ color: ON_CHART_1 }}>
          {formatInt(number)}
        </span>
      </span>
    );
  }
  return (
    <span className="kpi-number flex size-7 items-center justify-center rounded-full border-2 border-text-muted text-xs font-semibold text-text-secondary">
      {formatInt(number)}
    </span>
  );
}

/** Caixa fixa de 36 px, alinhada à esquerda: marcadores de tamanhos diferentes dividem o mesmo centro vertical. */
function Marker(props: { readonly state: StepState; readonly number: number }) {
  return (
    <span className="flex size-9 shrink-0 items-center">
      <MarkerShape {...props} />
    </span>
  );
}

export default function TimedStepper({ data = defaultData, height, className }: TimedStepperProps) {
  const { opportunity, steps, slaDays, referenceDate } = data;
  const style = height === undefined ? undefined : { height };

  if (steps.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Este recorte não tem etapas de handoff, então não há passagem para medir contra o SLA.</span>
      </div>
    );
  }

  const current = lastReachedIndex(steps);
  const currentStep = current === null ? undefined : steps[current];

  // Duração de cada passagem i para i + 1, só quando as duas etapas foram alcançadas.
  const gaps = steps.map((step, index) => {
    const next = steps[index + 1];
    return step.reachedOn !== null && next?.reachedOn != null ? daysBetween(step.reachedOn, next.reachedOn) : null;
  });
  const measured = gaps.filter((gap): gap is number => gap !== null);
  const breaches = measured.filter((gap) => gap > slaDays).length;
  const openDays = currentStep?.reachedOn != null ? daysBetween(currentStep.reachedOn, referenceDate) : null;
  const openOver = openDays !== null && openDays > slaDays;

  const summary =
    `Stepper do handoff da oportunidade ${opportunity} com SLA de ${formatDays(slaDays)} por passagem: ` +
    `${formatInt(breaches)} de ${formatInt(measured.length)} passagens passaram do limite` +
    (currentStep && openDays !== null
      ? `; passo atual, ${currentStep.label.toLowerCase()}, em aberto há ${formatDays(openDays)}.`
      : '.');

  const reading = `${formatInt(breaches)} de ${formatInt(measured.length)} passagens acima do SLA de ${formatDays(slaDays)}${
    openOver && openDays !== null ? `; o passo atual já está em aberto há ${formatDays(openDays)}` : ''
  }.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-3', className)}
      role="group"
      style={style}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium text-text-secondary">
          Oportunidade <span className="kpi-number font-semibold text-text-primary">{opportunity}</span>
        </p>
        <p className="text-xs text-text-muted">SLA de {formatDays(slaDays)} por passagem</p>
      </div>

      <ol className="flex w-full min-w-0">
        {steps.map((step, index) => {
          const state = stateOf(index, current);
          const isLast = index === steps.length - 1;
          const gap = gaps[index] ?? null;
          const over = gap !== null && gap > slaDays;
          return (
            <li aria-current={state === 'current' ? 'step' : undefined} className={cn('min-w-0', isLast ? 'shrink-0' : 'flex-1')} key={step.id}>
              <div className="flex h-16 items-end">
                <Marker number={index + 1} state={state} />
                {isLast ? null : (
                  <div className="mx-2 flex min-w-0 flex-1 flex-col">
                    <div className="flex min-h-7 flex-col items-center justify-end pb-0.5 text-[0.6875rem] leading-snug">
                      {gap === null ? null : (
                        <>
                          <span className={cn('kpi-number flex items-center gap-1 font-semibold', over ? 'text-warning' : 'text-text-muted')}>
                            {over ? <AlertTriangle aria-hidden className="size-3 shrink-0" /> : null}
                            {formatDays(gap)}
                          </span>
                          {over ? <span className="text-warning">acima de {formatDays(slaDays)}</span> : null}
                        </>
                      )}
                    </div>
                    <div className="flex h-9 items-center">
                      <span aria-hidden className={cn('w-full', state === 'done' ? (over ? 'h-0.5 bg-warning' : 'h-0.5 bg-chart-1') : 'h-px bg-text-muted')} />
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 pr-3">
                <p className={cn('text-xs', state === 'current' ? 'font-bold text-text-primary' : state === 'done' ? 'font-semibold text-text-secondary' : 'font-medium text-text-muted')}>
                  {step.label}
                </p>
                <p className="kpi-number mt-0.5 text-[0.6875rem] text-text-muted">
                  {step.reachedOn === null ? 'pendente' : state === 'current' ? `desde ${formatDate(step.reachedOn)}` : formatDate(step.reachedOn)}
                </p>
                {state === 'current' && openDays !== null ? (
                  <p className={cn('kpi-number mt-0.5 flex items-center gap-1 text-[0.6875rem] font-semibold', openOver ? 'text-warning' : 'text-text-secondary')}>
                    {openOver ? <AlertTriangle aria-hidden className="size-3 shrink-0" /> : null}
                    {formatDays(openDays)} em aberto
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <p aria-hidden className="text-xs font-medium text-text-secondary">
        {reading}
      </p>
    </div>
  );
}
