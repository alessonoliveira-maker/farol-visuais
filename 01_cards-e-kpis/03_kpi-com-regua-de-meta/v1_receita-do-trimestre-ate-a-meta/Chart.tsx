import { ArrowUpRight, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatDate, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QuarterGoal } from './data';

/**
 * Cartão de KPI com barra de progresso até a meta: o realizado em destaque, um trilho de 8 px com
 * o preenchimento proporcional e o rodapé com o par realizado e meta. Responde "quanto já foi" sem
 * julgar o ritmo: sem o tempo decorrido a barra não sabe se 69% é bom, então abaixo da meta nenhuma
 * cor semântica entra. Acima de 100% o preenchimento para no fim do trilho e o excedente vai escrito.
 * HTML com Tailwind; o trilho é um `progressbar` de verdade para o leitor de tela.
 */
export interface GoalProgressCardProps {
  readonly data?: QuarterGoal;
  readonly className?: string;
}

/** Abaixo da meta, o percentual inteiro para em 99%: 99,6% escrito como 100% promete o que não houve. */
const LAST_WHOLE_BELOW_GOAL = 0.99;
/** Fração positiva que arredondaria para 0%: escrita como "menos de 1%", para não parecer zero medido. */
const SMALLEST_WHOLE = 0.005;

type GoalState =
  | { readonly kind: 'unavailable'; readonly goal: number | null }
  | { readonly kind: 'no-goal'; readonly realized: number }
  | { readonly kind: 'progress'; readonly realized: number; readonly goal: number; readonly share: number };

function goalState({ realized, goal }: QuarterGoal): GoalState {
  if (realized === null) return { kind: 'unavailable', goal: goal !== null && goal > 0 ? goal : null };
  if (goal === null || goal <= 0) return { kind: 'no-goal', realized };
  return { kind: 'progress', realized, goal, share: realized / goal };
}

/** Percentual inteiro da meta, com as duas bordas honestas (nem 100% antes da hora, nem 0% com venda). */
function shareLabel(share: number): string {
  if (share > 0 && share < SMALLEST_WHOLE) return 'menos de 1%';
  const whole = Math.round(share * 100) / 100;
  return formatPercent(share < 1 ? Math.min(whole, LAST_WHOLE_BELOW_GOAL) : whole, 0);
}

/** Largura do preenchimento: clampada no trilho, porque o excedente já está escrito. */
function fillWidth(share: number): string {
  return `${String(Math.min(Math.max(share, 0), 1) * 100)}%`;
}

function summaryOf(data: QuarterGoal, state: GoalState): string {
  const head = `Cartão de KPI com barra de progresso. ${data.label} até ${formatDate(data.asOf)}`;
  if (state.kind === 'unavailable') {
    const goalText = state.goal === null ? 'sem meta declarada' : `meta de ${formatCurrencyCompact(state.goal)}`;
    return `${head}, realizado ${formatUnavailable()} por falta de coleta; ${goalText}. A barra fica vazia em vez de mostrar zero.`;
  }
  if (state.kind === 'no-goal') {
    return `${head}: ${formatCurrencyCompact(state.realized)}. Sem meta declarada para o período, então não há percentual nem julgamento.`;
  }
  const pair = `${formatCurrencyCompact(state.realized)}, ${shareLabel(state.share)} da meta de ${formatCurrencyCompact(state.goal)}`;
  const rest =
    state.share >= 1
      ? `Meta batida com ${formatCurrencyCompact(state.realized - state.goal)} acima.`
      : `Faltam ${formatCurrencyCompact(state.goal - state.realized)} para a meta.`;
  return `${head}: ${pair}. ${rest}`;
}

export default function GoalProgressCard({ data = defaultData, className }: GoalProgressCardProps) {
  const state = goalState(data);
  const summary = summaryOf(data, state);

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4 tabular-nums', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-xs text-text-muted">até {formatDate(data.asOf)}</p>
      </div>

      {state.kind === 'unavailable' ? (
        <p className="mt-2 flex items-center gap-2 text-text-muted">
          <Unplug aria-hidden className="size-5 shrink-0" />
          <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
        </p>
      ) : (
        <p className="kpi-number mt-2 text-3xl leading-none font-semibold text-text-primary">{formatCurrencyCompact(state.realized)}</p>
      )}

      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
        {state.kind === 'progress' && state.share >= 1 ? (
          <>
            <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-positive">
              <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={2.5} />
              <span className="kpi-number">{formatCurrencyCompact(state.realized - state.goal)} acima</span>
            </span>
            <span className="min-w-0 truncate">
              da meta de <span className="kpi-number text-text-secondary">{formatCurrencyCompact(state.goal)}</span>
            </span>
          </>
        ) : state.kind === 'progress' ? (
          <span className="min-w-0 truncate">
            faltam <span className="kpi-number text-text-secondary">{formatCurrencyCompact(state.goal - state.realized)}</span> para a meta
          </span>
        ) : state.kind === 'no-goal' ? (
          <span className="min-w-0 truncate">sem meta declarada para o período</span>
        ) : (
          <span className="min-w-0 truncate">sem coleta de receita no período</span>
        )}
      </p>

      <div className="mt-auto pt-4">
        {state.kind === 'progress' ? (
          <div
            aria-label={`${data.label} contra a meta`}
            aria-valuemax={state.goal}
            aria-valuemin={0}
            aria-valuenow={Math.min(state.realized, state.goal)}
            aria-valuetext={`${formatCurrencyCompact(state.realized)} de ${formatCurrencyCompact(state.goal)}, ${shareLabel(state.share)} da meta`}
            className="h-2 w-full rounded-full bg-surface-sunken"
            role="progressbar"
          >
            <div className="h-full rounded-full bg-chart-1" style={{ width: fillWidth(state.share) }} />
          </div>
        ) : (
          <div aria-hidden className="h-2 w-full rounded-full border border-dashed border-text-muted" />
        )}

        <div className="mt-2 flex min-w-0 items-baseline justify-between gap-3 text-xs text-text-muted">
          {state.kind === 'progress' ? (
            <>
              <span className="min-w-0 truncate">
                <span className="kpi-number text-text-secondary">{formatCurrencyCompact(state.realized)}</span> de{' '}
                <span className="kpi-number text-text-secondary">{formatCurrencyCompact(state.goal)}</span>
              </span>
              <span className="kpi-number shrink-0 text-sm leading-none font-semibold text-text-primary">{shareLabel(state.share)}</span>
            </>
          ) : state.kind === 'unavailable' && state.goal !== null ? (
            <span className="min-w-0 truncate">
              meta de <span className="kpi-number text-text-secondary">{formatCurrencyCompact(state.goal)}</span>, sem realizado para comparar
            </span>
          ) : (
            <span className="min-w-0 truncate">régua neutra, sem percentual</span>
          )}
        </div>
      </div>
    </article>
  );
}
