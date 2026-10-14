import { Check, Filter, Lock, SkipForward } from 'lucide-react';

import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type NonLinearPath, type PathStep } from './data';

/**
 * Stepper de um percurso que não é linha reta: etapa pulada (tracejada, com a palavra), retorno
 * (seta curta por cima dos conectores, com a data da volta) e passo atual bloqueado (cadeado e
 * motivo). Abaixo de 480 px de largura os passos empilham na vertical, por container query.
 */
export interface NonLinearStepperProps {
  readonly data?: NonLinearPath;
  readonly height?: number;
  readonly className?: string;
}

/** Texto sobre o preenchimento de --chart-1 (ROT-6): token que inverte com o tema. */
const ON_CHART_1 = 'var(--accent-cyan-contrast)';
/** Metade do lado do marcador de 36 px: o centro do marcador, de onde a seta de retorno parte. */
const MARKER_CENTER = '1.125rem';

function MarkerShape({ step, number, blocked }: { readonly step: PathStep; readonly number: number; readonly blocked: boolean }) {
  if (step.status === 'done') {
    return (
      <span className="flex size-7 items-center justify-center rounded-full bg-chart-1" style={{ color: ON_CHART_1 }}>
        <Check aria-hidden className="size-4" strokeWidth={3} />
      </span>
    );
  }
  if (step.status === 'current') {
    return (
      // Anel duplo marca o passo atual sem depender de cor; bloqueado troca o número pelo cadeado.
      <span className="flex size-9 items-center justify-center rounded-full border-2 border-chart-1">
        <span className="kpi-number flex size-6 items-center justify-center rounded-full bg-chart-1 text-xs font-semibold" style={{ color: ON_CHART_1 }}>
          {blocked ? <Lock aria-hidden className="size-3.5" strokeWidth={2.5} /> : formatInt(number)}
        </span>
      </span>
    );
  }
  if (step.status === 'skipped') {
    return (
      <span className="flex size-7 items-center justify-center rounded-full border-2 border-dashed border-text-muted text-text-muted">
        <SkipForward aria-hidden className="size-3.5" />
      </span>
    );
  }
  return (
    <span className="kpi-number flex size-7 items-center justify-center rounded-full border-2 border-text-muted text-xs font-semibold text-text-secondary">
      {formatInt(number)}
    </span>
  );
}

/** Caixa fixa de 36 px: todo marcador tem o mesmo centro, de onde parte a seta de retorno. */
function Marker(props: { readonly step: PathStep; readonly number: number; readonly blocked: boolean }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center">
      <MarkerShape {...props} />
    </span>
  );
}

/** Conector que chega à etapa: cheio quando a etapa foi alcançada, tracejado quando foi pulada, fino quando é futura. */
function connectorClass(next: PathStep | undefined): string {
  if (next?.status === 'done' || next?.status === 'current') return 'w-0.5 bg-chart-1 @min-[480px]:h-0.5 @min-[480px]:w-auto';
  if (next?.status === 'skipped') return 'border-l border-dashed border-text-muted @min-[480px]:border-l-0 @min-[480px]:border-t';
  return 'w-px bg-text-muted @min-[480px]:h-px @min-[480px]:w-auto';
}

function statusLines(step: PathStep, blocked: boolean): readonly string[] {
  if (step.status === 'skipped') return ['pulada'];
  if (step.status === 'pending' || step.reachedOn === null) return ['pendente'];
  if (step.status === 'current') return [blocked ? 'bloqueada' : 'em curso', `desde ${formatDate(step.reachedOn)}`];
  return [formatDate(step.reachedOn)];
}

export default function NonLinearStepper({ data = defaultData, height, className }: NonLinearStepperProps) {
  const { opportunity, steps, returns, block } = data;
  const style = height === undefined ? undefined : { height };

  if (steps.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Este recorte não tem percurso registrado, então não há etapa para situar.</span>
      </div>
    );
  }

  const count = steps.length;
  const labelOf = (id: string): string => (steps.find((step) => step.id === id)?.label ?? id).toLowerCase();
  const skipped = steps.filter((step) => step.status === 'skipped');
  const current = steps.find((step) => step.status === 'current');
  const arcs = returns.flatMap((back) => {
    const from = steps.findIndex((step) => step.id === back.fromId);
    const to = steps.findIndex((step) => step.id === back.toId);
    return from < 0 || to < 0 ? [] : [{ ...back, left: Math.min(from, to), right: Math.max(from, to) }];
  });

  const summary =
    `Stepper do percurso da oportunidade ${opportunity} em ${formatInt(count)} etapas: ${formatInt(skipped.length)} pulada` +
    (arcs[0] ? `, retorno de ${labelOf(arcs[0].fromId)} para ${labelOf(arcs[0].toId)} em ${formatDate(arcs[0].on)}` : '') +
    (current ? `, passo atual em ${current.label.toLowerCase()}` : '') +
    (block ? ` bloqueado, ${block.reason}.` : '.');

  const reading =
    (block ? `Bloqueada em ${labelOf(block.stepId)}` : current ? `Em ${current.label.toLowerCase()}` : 'Sem etapa em curso') +
    (arcs[0] ? `, depois de voltar de ${labelOf(arcs[0].fromId)} em ${formatDate(arcs[0].on)}` : '') +
    (skipped.length > 0 ? `; pulou ${skipped.map((step) => step.label.toLowerCase()).join(' e ')}` : '') +
    '.';

  return (
    <div
      aria-label={summary}
      className={cn('@container flex h-full w-full min-w-0 flex-col justify-center gap-3', className)}
      role="group"
      style={style}
    >
      <p className="text-xs font-medium text-text-secondary">
        Oportunidade <span className="kpi-number font-semibold text-text-primary">{opportunity}</span>
      </p>

      <div>
        {arcs.map((arc) => (
          <div aria-hidden className="relative hidden h-10 @min-[480px]:block" key={`${arc.fromId}-${arc.toId}`}>
            <p
              className="kpi-number absolute top-0 text-center text-[0.6875rem] font-semibold text-text-secondary"
              style={{
                left: `calc(${String((arc.left / count) * 100)}% + ${MARKER_CENTER})`,
                right: `calc(${String(((count - arc.right) / count) * 100)}% - ${MARKER_CENTER})`,
              }}
            >
              volta em {formatDate(arc.on)}
            </p>
            {/* Colchete de bordas: vai do centro do marcador de origem ao do destino, com a ponta de seta no destino. */}
            <span
              className="absolute top-5 bottom-1.5 rounded-t-lg border-x-2 border-t-2 border-text-secondary"
              style={{
                left: `calc(${String((arc.left / count) * 100)}% + ${MARKER_CENTER})`,
                right: `calc(${String(((count - arc.right) / count) * 100)}% - ${MARKER_CENTER})`,
              }}
            >
              {/* Ponta de seta presa ao pé da perna esquerda do colchete: é a perna que chega ao destino. */}
              <svg className="absolute -bottom-1.5 -left-[5px] block text-text-secondary" height="6" viewBox="0 0 8 6" width="8">
                <path d="M0 0 L8 0 L4 6 Z" fill="currentColor" />
              </svg>
            </span>
          </div>
        ))}
        <ol className="flex w-full min-w-0 flex-col @min-[480px]:flex-row">
          {steps.map((step, index) => {
            const isLast = index === count - 1;
            const blocked = block?.stepId === step.id;
            return (
              <li
                aria-current={step.status === 'current' ? 'step' : undefined}
                className="flex min-w-0 flex-1 gap-3 @min-[480px]:block"
                key={step.id}
              >
                <div className="flex flex-col items-center @min-[480px]:h-9 @min-[480px]:flex-row">
                  <Marker blocked={blocked} number={index + 1} step={step} />
                  {isLast ? null : (
                    <span aria-hidden className={cn('my-1 min-h-3 flex-1 @min-[480px]:mx-2 @min-[480px]:my-0 @min-[480px]:min-h-0', connectorClass(steps[index + 1]))} />
                  )}
                </div>
                <div className="min-w-0 pb-3 @min-[480px]:mt-2 @min-[480px]:pr-3 @min-[480px]:pb-0">
                  <p className={cn('text-xs', step.status === 'current' ? 'font-bold text-text-primary' : step.status === 'done' ? 'font-semibold text-text-secondary' : 'font-medium text-text-muted')}>
                    {step.label}
                  </p>
                  {statusLines(step, blocked).map((line) => (
                    <p className="kpi-number mt-0.5 text-[0.6875rem] text-text-muted" key={line}>
                      {line}
                    </p>
                  ))}
                  {blocked && block ? <p className="mt-0.5 text-[0.6875rem] text-text-secondary">{block.reason}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <p aria-hidden className="text-xs font-medium text-text-secondary">
        {reading}
      </p>
    </div>
  );
}
