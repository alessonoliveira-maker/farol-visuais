import { CircleCheck, CircleDashed, Minus, OctagonX, TrendingDown, TrendingUp, TriangleAlert, Unplug, type LucideIcon } from 'lucide-react';

import { formatCurrency, formatCurrencyCompact, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Polarity, type QuarterRevenueKpi, type StatusRule } from './data';

/**
 * KPI comparativo: a receita do trimestre em destaque, o trimestre anterior e a meta como apoios
 * em duas colunas, e um selo de status que sai de uma régua escrita no próprio cartão. Responde
 * "estamos na meta e quanto falta?" sem esconder que o número cresceu sobre o anterior.
 */
export interface QuarterTargetKpiProps {
  readonly data?: QuarterRevenueKpi;
  readonly className?: string;
}

/** A partir de 10% a casa decimal não muda a decisão (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;
/** Variação abaixo de 0,05% é lida como estável: nem verde nem vermelho (COR-6). */
const FLAT_THRESHOLD = 0.0005;

type StatusKey = 'on-target' | 'attention' | 'off-target' | 'no-target';
type Direction = 'up' | 'down' | 'flat';
type Tone = 'good' | 'bad' | 'neutral';

/** Variação sobre o trimestre anterior: mesma forma da v1, com base incluída para o texto não depender de fechamento externo. */
type GrowthComparison =
  | { readonly kind: 'variance'; readonly fraction: number; readonly base: number; readonly direction: Direction; readonly tone: Tone }
  | { readonly kind: 'no-current' }
  | { readonly kind: 'no-previous' }
  | { readonly kind: 'zero-base' };

const TONE_CLASS: Record<Tone, string> = {
  good: 'text-positive',
  bad: 'text-negative',
  neutral: 'text-text-secondary',
};

const DIRECTION_ICON: Record<Direction, LucideIcon> = { up: TrendingUp, down: TrendingDown, flat: Minus };

/** A cor sai da polaridade da métrica, nunca do sinal da variação (COR-6); ausência de atual e ausência
 * de anterior viram frases diferentes porque a base que falta não é a mesma (EST-4). */
function compareGrowth(current: number | null, previous: number | null, polarity: Polarity): GrowthComparison {
  if (current === null) return { kind: 'no-current' };
  if (previous === null) return { kind: 'no-previous' };
  if (previous === 0) return { kind: 'zero-base' };
  const fraction = (current - previous) / Math.abs(previous);
  if (Math.abs(fraction) < FLAT_THRESHOLD) return { kind: 'variance', fraction, base: previous, direction: 'flat', tone: 'neutral' };
  const direction: Direction = fraction > 0 ? 'up' : 'down';
  const improved = polarity === 'higher-is-better' ? direction === 'up' : direction === 'down';
  const tone: Tone = polarity === 'neutral' ? 'neutral' : improved ? 'good' : 'bad';
  return { kind: 'variance', fraction, base: previous, direction, tone };
}

function describeGrowth(comparison: GrowthComparison, currentLabel: string, previousLabel: string): string {
  if (comparison.kind === 'no-current') return `Sem ${currentLabel} medido para comparar com o ${previousLabel}.`;
  if (comparison.kind === 'no-previous') return `Sem ${previousLabel} medido para comparar.`;
  if (comparison.kind === 'zero-base') return `${previousLabel} teve ${formatCurrencyCompact(0)}, sem base para calcular variação.`;
  const movement =
    comparison.direction === 'flat'
      ? 'Estável'
      : `${comparison.direction === 'up' ? 'Alta' : 'Queda'} de ${formatPercent(Math.abs(comparison.fraction), 1)}`;
  return `${movement} sobre o ${previousLabel}, que teve ${formatCurrencyCompact(comparison.base)}.`;
}

/** Cada status tem forma de ícone própria além da cor: círculo, triângulo, octógono, tracejado. */
const STATUS: Record<StatusKey, { readonly label: string; readonly icon: LucideIcon; readonly tone: string }> = {
  'on-target': { label: 'no alvo', icon: CircleCheck, tone: 'border-positive text-positive' },
  attention: { label: 'atenção', icon: TriangleAlert, tone: 'border-warning text-warning' },
  'off-target': { label: 'fora do alvo', icon: OctagonX, tone: 'border-negative text-negative' },
  'no-target': { label: 'sem meta', icon: CircleDashed, tone: 'border-text-muted text-text-muted' },
};

/**
 * Quanto da meta foi cumprido, lido pela **polaridade** da métrica e não pela razão crua.
 *
 * A razão `current / target` só mede atingimento quando a meta é piso. Numa métrica de "menor é
 * melhor" a meta é teto, e a razão crua faz o estouro crescer: gastar o dobro do teto daria 200%
 * e cairia em "no alvo". O recíproco `target / current` devolve o atingimento na mesma escala da
 * régua, sem inventar corte novo. Sem direção preferida, o que conta é a proximidade da meta, que
 * julga os dois lados igual.
 */
function attainmentOf(current: number, target: number, polarity: Polarity): number {
  if (polarity === 'lower-is-better') return current <= 0 ? Number.POSITIVE_INFINITY : target / current;
  if (polarity === 'neutral') return 1 - Math.abs(current - target) / target;
  return current / target;
}

/** O corte pertence à faixa de cima: 95,0% de atingimento já é "no alvo". */
function statusOf(current: number, target: number | null, rule: StatusRule, polarity: Polarity): StatusKey {
  if (target === null || target <= 0) return 'no-target';
  const attainment = attainmentOf(current, target, polarity);
  if (attainment >= rule.onTargetFrom) return 'on-target';
  return attainment >= rule.attentionFrom ? 'attention' : 'off-target';
}

function verdictOf(current: number, target: number | null): string {
  if (target === null || target <= 0) return 'meta do trimestre ainda não definida';
  if (current === target) return 'exatamente na meta';
  const gap = formatCurrencyCompact(Math.abs(target - current));
  return current < target ? `abaixo da meta por ${gap}` : `acima da meta por ${gap}`;
}

/** Sinal à mão sobre o valor absoluto: `formatPercent` de número negativo devolveria hífen (NUM-3). */
function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  return `${fraction >= 0 ? '+' : '−'}${formatPercent(absolute, absolute >= WHOLE_PERCENT_FROM ? 0 : 1)}`;
}

export default function QuarterTargetKpi({ data = defaultData, className }: QuarterTargetKpiProps) {
  const { current, previous, target, rule } = data;
  const period = `${formatMonthShort(data.firstMonth)} a ${formatMonthShort(data.lastMonth)}`;
  const value = current.value;
  const status = value === null ? null : STATUS[statusOf(value, target, rule, data.polarity)];
  const verdict = value === null ? null : verdictOf(value, target);
  const reach = value !== null && target !== null && target > 0 ? value / target : null;
  const growth = compareGrowth(value, previous.value, data.polarity);
  const GrowthIcon = growth.kind === 'variance' ? DIRECTION_ICON[growth.direction] : null;
  const rulePhrase = `no alvo desde ${formatPercent(rule.onTargetFrom, 0)} da meta; atenção de ${formatPercent(rule.attentionFrom, 0)} a ${formatPercent(rule.onTargetFrom, 0)}`;

  const summary = [
    `Cartão de KPI, ${data.label.toLowerCase()} do ${current.label}, de ${period}:`,
    value === null ? `${formatUnavailable()}.` : `${formatCurrencyCompact(value)}.`,
    status && verdict ? `Status ${status.label}, ${verdict}${reach === null ? '' : `, ${formatPercent(reach, 1)} da meta`}.` : '',
    describeGrowth(growth, current.label, previous.label),
  ].join(' ');

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 text-xs font-medium text-text-secondary tabular-nums">
          {data.label} do {current.label}
        </p>
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">{period}</p>
      </div>

      <div className="mt-3 flex h-7.5 min-w-0 items-end">
        {value === null ? (
          <p className="inline-flex items-center gap-1.5 text-text-muted">
            <Unplug aria-hidden className="size-4" />
            <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
          </p>
        ) : (
          <p className="kpi-number text-3xl leading-none font-semibold text-text-primary" title={formatCurrency(value)}>
            {formatCurrencyCompact(value)}
          </p>
        )}
      </div>

      <div className="mt-3 flex min-h-5.5 min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {status ? (
          <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-semibold', status.tone)}>
            <status.icon aria-hidden className="size-3.5" strokeWidth={2.25} />
            {status.label}
          </span>
        ) : null}
        <span className="min-w-0 text-text-secondary tabular-nums">{verdict ?? 'sem medição do trimestre para julgar a meta'}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-6">
        <div className="min-w-0">
          <p className="text-[0.6875rem] text-text-muted tabular-nums">{previous.label}</p>
          <p className="kpi-number mt-1 text-sm font-semibold text-text-primary" title={previous.value === null ? undefined : formatCurrency(previous.value)}>
            {previous.value === null ? formatUnavailable() : formatCurrencyCompact(previous.value)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[0.6875rem] text-text-muted tabular-nums">
            {growth.kind === 'variance' && GrowthIcon ? (
              <>
                <span className={cn('inline-flex items-center gap-0.5 font-semibold', TONE_CLASS[growth.tone])}>
                  <GrowthIcon aria-hidden className="size-3" strokeWidth={2.5} />
                  {growth.direction === 'flat' ? 'estável' : <span className="kpi-number">{signedPercent(growth.fraction)}</span>}
                </span>
                <span>sobre o {previous.label}</span>
              </>
            ) : growth.kind === 'no-current' ? (
              <span>falta {current.label} para comparar</span>
            ) : growth.kind === 'zero-base' ? (
              <span>
                {previous.label} teve <span className="kpi-number">{formatCurrencyCompact(0)}</span>, sem base para variação
              </span>
            ) : (
              <span>sem base de comparação</span>
            )}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[0.6875rem] text-text-muted tabular-nums">Meta do {current.label}</p>
          <p className="kpi-number mt-1 text-sm font-semibold text-text-primary" title={target === null ? undefined : formatCurrency(target)}>
            {target === null ? <span className="font-sans font-medium text-text-muted">sem meta</span> : formatCurrencyCompact(target)}
          </p>
          <p className="mt-1 text-[0.6875rem] text-text-muted tabular-nums">
            {reach === null ? 'sem atingimento a calcular' : <><span className="kpi-number text-text-secondary">{formatPercent(reach, 1)}</span> da meta</>}
          </p>
        </div>
      </div>

      <p className="mt-auto pt-3 text-[0.6875rem] text-text-muted tabular-nums">{rulePhrase}</p>
    </article>
  );
}
