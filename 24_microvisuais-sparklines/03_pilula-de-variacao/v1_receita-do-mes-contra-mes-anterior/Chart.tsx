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
import { data as defaultData, type Polarity, type RevenueBase, type RevenuePillKpi } from './data';

/**
 * Receita do mês com pílula de variação: o número do mês e, colada a ele, a variação contra cada
 * base nomeada, com sinal tipográfico, glifo e cor pela polaridade da métrica. Responde "subiu ou
 * caiu, e contra o quê?" sem abrir outra tela.
 */
export interface RevenuePillProps {
  readonly data?: RevenuePillKpi;
  readonly className?: string;
}

/** Variação dentro de 1% para mais ou para menos é lida como estável: nem verde nem vermelho, glifo Minus. */
const FLAT_BAND = 0.01;
/** A partir de 10% a casa decimal não muda a decisão (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;

type Direction = 'up' | 'down' | 'flat';
type Tone = 'good' | 'bad' | 'neutral';

type Pill =
  | { readonly kind: 'variance'; readonly fraction: number; readonly direction: Direction; readonly tone: Tone }
  | { readonly kind: 'no-base' }
  | { readonly kind: 'zero-base' };

const TONE_CLASS: Record<Tone, string> = {
  good: 'text-positive',
  bad: 'text-negative',
  neutral: 'text-text-secondary',
};

const DIRECTION_ICON: Record<Direction, LucideIcon> = { up: TrendingUp, down: TrendingDown, flat: Minus };

/** A cor sai da polaridade da métrica, nunca do sinal da variação (COR-6). */
function pillOf(current: number, base: number | null, polarity: Polarity): Pill {
  if (base === null) return { kind: 'no-base' };
  if (base === 0) return current === 0 ? { kind: 'variance', fraction: 0, direction: 'flat', tone: 'neutral' } : { kind: 'zero-base' };
  const fraction = (current - base) / Math.abs(base);
  if (Math.abs(fraction) <= FLAT_BAND) return { kind: 'variance', fraction, direction: 'flat', tone: 'neutral' };
  const direction: Direction = fraction > 0 ? 'up' : 'down';
  const improved = polarity === 'higher-is-better' ? direction === 'up' : direction === 'down';
  const tone: Tone = polarity === 'neutral' ? 'neutral' : improved ? 'good' : 'bad';
  return { kind: 'variance', fraction, direction, tone };
}

function percentText(fraction: number): string {
  const absolute = Math.abs(fraction);
  return formatPercent(absolute, absolute >= WHOLE_PERCENT_FROM ? 0 : 1);
}

/** Sinal à mão sobre o valor absoluto: `formatPercent` não escreve o `+` (NUM-3). */
function signedPercent(fraction: number): string {
  return `${fraction > 0 ? '+' : fraction < 0 ? '−' : ''}${percentText(fraction)}`;
}

function sentence(base: RevenueBase, pill: Pill): string {
  if (pill.kind === 'no-base') return `Sem ${base.name} medido para comparar.`;
  if (pill.kind === 'zero-base') return `Sem base contra ${formatMonthShort(base.month)}, que teve ${formatCurrencyCompact(0)}.`;
  const against = `contra ${formatCurrencyCompact(base.value ?? 0)} em ${formatMonthShort(base.month)}`;
  if (pill.direction === 'flat') {
    return `Estável, ${signedPercent(pill.fraction)}, ${against}, dentro da faixa de ${formatPercent(FLAT_BAND, 0)}.`;
  }
  return `${pill.direction === 'up' ? 'Alta' : 'Queda'} de ${percentText(pill.fraction)} ${against}.`;
}

function BaseRow({ base, pill }: { base: RevenueBase; pill: Pill }) {
  const Icon = pill.kind === 'variance' ? DIRECTION_ICON[pill.direction] : Minus;
  const tone = pill.kind === 'variance' ? TONE_CLASS[pill.tone] : TONE_CLASS.neutral;
  return (
    <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-muted tabular-nums">
      <span className={cn('inline-flex shrink-0 items-center gap-1 font-semibold', tone)}>
        <Icon aria-hidden className="size-3.5" strokeWidth={2.25} />
        {pill.kind === 'variance' ? <span className="kpi-number">{signedPercent(pill.fraction)}</span> : null}
        {pill.kind === 'variance' && pill.direction === 'flat' ? <span>estável</span> : null}
      </span>
      {pill.kind === 'no-base' ? <span>sem {base.name} medido para comparar</span> : null}
      {pill.kind === 'zero-base' ? (
        <span>
          sem {base.name} medido para comparar: {formatMonthShort(base.month)} teve{' '}
          <span className="kpi-number">{formatCurrencyCompact(0)}</span>
        </span>
      ) : null}
      {pill.kind === 'variance' ? (
        <span className="min-w-0">
          contra <span className="kpi-number text-text-secondary">{formatCurrencyCompact(base.value ?? 0)}</span> em{' '}
          {formatMonthShort(base.month)}
        </span>
      ) : null}
    </p>
  );
}

export default function RevenuePill({ data = defaultData, className }: RevenuePillProps) {
  const pills = data.bases.map((base) => ({
    base,
    pill: data.value === null ? ({ kind: 'no-base' } as const) : pillOf(data.value, base.value, data.polarity),
  }));
  const head =
    data.value === null
      ? `Cartão de ${data.label.toLowerCase()} de ${formatMonthLong(data.month)}: ${formatUnavailable()}.`
      : `Cartão de ${data.label.toLowerCase()} de ${formatMonthLong(data.month)}: ${formatCurrencyCompact(data.value)}.`;
  const summary = data.value === null ? head : [head, ...pills.map(({ base, pill }) => sentence(base, pill))].join(' ');

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">total de {formatMonthShort(data.month)}</p>
      </div>

      <div className="mt-3 flex h-7.5 min-w-0 items-end">
        {data.value === null ? (
          <p className="inline-flex items-center gap-1.5 text-text-muted">
            <Unplug aria-hidden className="size-4" />
            <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
          </p>
        ) : (
          <p className="kpi-number text-3xl leading-none font-semibold text-text-primary" title={formatCurrency(data.value)}>
            {formatCurrencyCompact(data.value)}
          </p>
        )}
      </div>

      <div className="mt-3 flex min-w-0 flex-col gap-2">
        {data.value === null ? (
          <p className="text-xs text-text-muted">sem medição no mês para comparar</p>
        ) : (
          pills.map(({ base, pill }) => <BaseRow base={base} key={base.id} pill={pill} />)
        )}
      </div>

      <p className="mt-auto text-[0.6875rem] text-text-muted tabular-nums">
        estável quando a variação fica dentro de ±{formatPercent(FLAT_BAND, 0)}
      </p>
    </article>
  );
}
