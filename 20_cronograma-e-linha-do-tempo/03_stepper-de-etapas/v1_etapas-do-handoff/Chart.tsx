import { Check, Filter } from 'lucide-react';

import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type HandoffProgress } from './data';

/**
 * Stepper horizontal das etapas do handoff de uma oportunidade: onde ela está agora, sem escala
 * de tempo. Concluída leva check, atual leva anel duplo e rótulo em peso maior, futura é vazada.
 * Os estados se leem sem cor. HTML com Tailwind, lista ordenada com flex.
 */
export interface HandoffStepperProps {
  readonly data?: HandoffProgress;
  readonly height?: number;
  readonly className?: string;
}

/** Texto sobre o preenchimento de --chart-1 (ROT-6): token que inverte com o tema. */
const ON_CHART_1 = 'var(--accent-cyan-contrast)';

type StepState = 'done' | 'current' | 'pending';

/** Índice da última etapa alcançada; null quando nenhuma foi alcançada (nunca 0 por falta). */
function lastReachedIndex(steps: HandoffProgress['steps']): number | null {
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

export default function HandoffStepper({ data = defaultData, height, className }: HandoffStepperProps) {
  const { opportunity, steps } = data;
  const style = height === undefined ? undefined : { height };

  if (steps.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Este recorte não tem etapas de handoff, então não há onde situar a oportunidade.</span>
      </div>
    );
  }

  const current = lastReachedIndex(steps);
  const currentStep = current === null ? undefined : steps[current];
  const nextStep = current === null ? steps[0] : steps[current + 1];
  const doneCount = current ?? 0;

  const summary =
    (currentStep
      ? `Stepper do handoff da oportunidade ${opportunity}: passo ${formatInt((current ?? 0) + 1)} de ${formatInt(steps.length)}, ${currentStep.label.toLowerCase()}. `
      : `Stepper do handoff da oportunidade ${opportunity}: nenhuma das ${formatInt(steps.length)} etapas foi alcançada. `) +
    `${formatInt(doneCount)} etapas concluídas` +
    (nextStep ? `; a próxima é ${nextStep.label.toLowerCase()}.` : '; processo completo.');

  const reading = nextStep
    ? `Aguardando ${nextStep.label.toLowerCase()}.`
    : 'Todas as etapas foram alcançadas.';

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-4', className)}
      role="group"
      style={style}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium text-text-secondary">
          Oportunidade <span className="kpi-number font-semibold text-text-primary">{opportunity}</span>
        </p>
        {currentStep ? (
          <p className="text-xs text-text-muted">
            passo <span className="kpi-number font-semibold text-text-secondary">{formatInt((current ?? 0) + 1)}</span> de{' '}
            <span className="kpi-number">{formatInt(steps.length)}</span>
          </p>
        ) : null}
      </div>

      <ol className="flex w-full min-w-0">
        {steps.map((step, index) => {
          const state = stateOf(index, current);
          const isLast = index === steps.length - 1;
          return (
            <li aria-current={state === 'current' ? 'step' : undefined} className={cn('min-w-0', isLast ? 'shrink-0' : 'flex-1')} key={step.id}>
              <div className="flex h-9 items-center">
                <Marker number={index + 1} state={state} />
                {isLast ? null : (
                  <span
                    aria-hidden
                    className={cn('mx-2 flex-1', state === 'done' ? 'h-0.5 bg-chart-1' : 'h-px bg-text-muted')}
                  />
                )}
              </div>
              <div className="mt-2 pr-3">
                <p className={cn('text-xs', state === 'current' ? 'font-bold text-text-primary' : state === 'done' ? 'font-semibold text-text-secondary' : 'font-medium text-text-muted')}>
                  {step.label}
                </p>
                <p className="kpi-number mt-0.5 text-[0.6875rem] text-text-muted">
                  {step.reachedOn === null ? 'pendente' : state === 'current' ? `desde ${formatDate(step.reachedOn)}` : formatDate(step.reachedOn)}
                </p>
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
