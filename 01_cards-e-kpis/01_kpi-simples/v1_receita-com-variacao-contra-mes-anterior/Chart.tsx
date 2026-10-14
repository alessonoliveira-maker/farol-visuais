import { Minus, TrendingDown, TrendingUp, Unplug, type LucideIcon } from 'lucide-react';

import {
  formatCurrency,
  formatCurrencyCompact,
  formatMonthLong,
  formatMonthShort,
  formatPercent,
  formatUnavailable,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyRevenueKpi, type Polarity } from './data';

/**
 * KPI simples com variação: a receita reconhecida do mês em número grande, o quanto ela se afastou
 * do mês anterior com sinal, ícone e cor pela polaridade, e a base da comparação escrita na mesma
 * linha. Responde "quanto entrou e isso é bom?" sem abrir outra tela.
 */
export interface RevenueVarianceKpiProps {
  readonly data?: MonthlyRevenueKpi;
  readonly className?: string;
}

/** Variação abaixo de 0,05% é lida como estável: nem verde nem vermelho. */
const FLAT_THRESHOLD = 0.0005;
/** A partir de 10% a casa decimal não muda a decisão (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;

type Direction = 'up' | 'down' | 'flat';
type Tone = 'good' | 'bad' | 'neutral';

type Comparison =
  | { readonly kind: 'variance'; readonly fraction: number; readonly base: number; readonly direction: Direction; readonly tone: Tone }
  | { readonly kind: 'no-previous' }
  | { readonly kind: 'zero-base' };

const TONE_CLASS: Record<Tone, string> = {
  good: 'text-positive',
  bad: 'text-negative',
  neutral: 'text-text-secondary',
};

const DIRECTION_ICON: Record<Direction, LucideIcon> = { up: TrendingUp, down: TrendingDown, flat: Minus };

/** A cor sai da polaridade da métrica, nunca do sinal da variação (COR-6). */
function compare(current: number, previous: number | null, polarity: Polarity): Comparison {
  if (previous === null) return { kind: 'no-previous' };
  if (previous === 0 && current !== 0) return { kind: 'zero-base' };
  const fraction = previous === 0 ? 0 : (current - previous) / Math.abs(previous);
  if (Math.abs(fraction) < FLAT_THRESHOLD) return { kind: 'variance', fraction, base: previous, direction: 'flat', tone: 'neutral' };
  const direction: Direction = fraction > 0 ? 'up' : 'down';
  const improved = polarity === 'higher-is-better' ? direction === 'up' : direction === 'down';
  const tone: Tone = polarity === 'neutral' ? 'neutral' : improved ? 'good' : 'bad';
  return { kind: 'variance', fraction, base: previous, direction, tone };
}

/** Sinal à mão sobre o valor absoluto: `formatPercent` de número negativo devolveria hífen (NUM-3). */
function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  return `${fraction > 0 ? '+' : '−'}${formatPercent(absolute, absolute >= WHOLE_PERCENT_FROM ? 0 : 1)}`;
}

function describe(data: MonthlyRevenueKpi, comparison: Comparison | null): string {
  const { current, previous } = data;
  const head =
    current.value === null
      ? `Cartão de KPI, ${data.label.toLowerCase()} de ${formatMonthLong(current.month)}: ${formatUnavailable()}, ${data.unavailableReason ?? 'sem medição no mês'}.`
      : `Cartão de KPI, ${data.label.toLowerCase()} de ${formatMonthLong(current.month)}: ${formatCurrencyCompact(current.value)}, exatos ${formatCurrency(current.value)}.`;
  if (comparison === null) return head;
  if (comparison.kind === 'no-previous') return `${head} Sem mês anterior medido para comparar.`;
  if (comparison.kind === 'zero-base') {
    return `${head} Sem base de comparação: ${formatMonthLong(previous.month)} teve ${formatCurrencyCompact(0)}.`;
  }
  const verdict =
    comparison.tone === 'good'
      ? data.polarity === 'higher-is-better'
        ? ' Para esta métrica, subir é bom.'
        : ' Para esta métrica, cair é bom.'
      : comparison.tone === 'bad'
        ? ' Para esta métrica, é piora.'
        : '';
  const movement =
    comparison.direction === 'flat'
      ? 'Estável'
      : `${comparison.direction === 'up' ? 'Alta' : 'Queda'} de ${formatPercent(Math.abs(comparison.fraction), 1)}`;
  return `${head} ${movement} contra ${formatMonthLong(previous.month)}, que teve ${formatCurrencyCompact(comparison.base)}.${verdict}`;
}

export default function RevenueVarianceKpi({ data = defaultData, className }: RevenueVarianceKpiProps) {
  const { current, previous } = data;
  const comparison = current.value === null ? null : compare(current.value, previous.value, data.polarity);
  const DeltaIcon = comparison?.kind === 'variance' ? DIRECTION_ICON[comparison.direction] : null;

  return (
    <article
      aria-label={describe(data, comparison)}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">total de {formatMonthShort(current.month)}</p>
      </div>

      <div className="mt-3 flex h-7.5 min-w-0 items-end">
        {current.value === null ? (
          <p className="inline-flex items-center gap-1.5 text-text-muted">
            <Unplug aria-hidden className="size-4" />
            <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
          </p>
        ) : (
          <p className="kpi-number text-3xl leading-none font-semibold text-text-primary" title={formatCurrency(current.value)}>
            {formatCurrencyCompact(current.value)}
          </p>
        )}
      </div>

      <p className="mt-2 flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs text-text-muted tabular-nums">
        {comparison === null ? <span>{data.unavailableReason ?? 'sem medição no mês'}</span> : null}
        {comparison?.kind === 'no-previous' ? <span>sem mês anterior medido para comparar</span> : null}
        {comparison?.kind === 'zero-base' ? (
          <span>
            sem base de comparação: {formatMonthShort(previous.month)} teve{' '}
            <span className="kpi-number">{formatCurrencyCompact(0)}</span>
          </span>
        ) : null}
        {comparison?.kind === 'variance' && DeltaIcon ? (
          <>
            <span className={cn('inline-flex shrink-0 items-center gap-1 font-semibold', TONE_CLASS[comparison.tone])}>
              <DeltaIcon aria-hidden className="size-3.5" strokeWidth={2.25} />
              {comparison.direction === 'flat' ? 'estável' : <span className="kpi-number">{signedPercent(comparison.fraction)}</span>}
            </span>
            <span className="min-w-0">
              contra <span className="kpi-number text-text-secondary">{formatCurrencyCompact(comparison.base)}</span> em{' '}
              {formatMonthShort(previous.month)}
            </span>
          </>
        ) : null}
      </p>
    </article>
  );
}
