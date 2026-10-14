import { ChevronRight, CircleAlert, Clock, Minus, TrendingDown, TrendingUp, TriangleAlert, type LucideIcon } from 'lucide-react';

import { formatCurrencyCompact, formatDate, formatDays, formatHours, formatInt, formatMonthLong, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CostPerLeadKpi, type Freshness, type Provenance, type RatioWindow } from './data';

/**
 * KPI de razão: o CPL qualificado com as duas parcelas escritas, a variação lida pela polaridade,
 * o ponto de ação quando o CPL passa do limiar, o carimbo de coleta da fonte e a procedência.
 * Responde "quanto custou cada lead bom, de onde sai o número e se ele é de hoje".
 */
export interface CostPerLeadCardProps {
  readonly data?: CostPerLeadKpi;
  readonly className?: string;
}

/** A partir de 10% a casa decimal não muda a decisão (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;
/** Variação abaixo de 0,05% é lida como estável. */
const FLAT_THRESHOLD = 0.0005;
/** Abaixo de 30 leads a razão não sustenta julgamento: a variação perde a cor semântica. */
const MIN_DENOMINATOR = 30;
const HOUR_MS = 3_600_000;

const PROVENANCE: Record<Provenance, { readonly label: string; readonly tone: string }> = {
  medido: { label: 'MEDIDO', tone: 'text-prov-medido' },
  derivado: { label: 'DERIVADO', tone: 'text-prov-derivado' },
  premissa: { label: 'PREMISSA', tone: 'text-prov-premissa' },
  lacuna: { label: 'LACUNA', tone: 'text-prov-lacuna' },
};

function costPerLead(window: RatioWindow): number | null {
  return window.leads > 0 ? window.spend / window.leads : null;
}

type FreshState = { readonly kind: 'fresh' | 'stale'; readonly lagHours: number } | { readonly kind: 'inconsistent' };

/** O relógio vem do dado (o pai passa no Farol), nunca de `new Date()` sem argumento. */
function freshnessOf(freshness: Freshness): FreshState {
  const lagHours = (Date.parse(freshness.referenceAt) - Date.parse(freshness.collectedAt)) / HOUR_MS;
  if (!Number.isFinite(lagHours) || lagHours < 0) return { kind: 'inconsistent' };
  return { kind: lagHours > freshness.expectedEveryHours ? 'stale' : 'fresh', lagHours };
}

/** Carimbo absoluto e curto: só a data, por `formatDate`. `@/lib/format` não tem formatador de
 * hora (seção 6), e fatiar a hora e o fuso direto do ISO no componente sairia da lista de
 * imports permitidos; o pedido de um formatador de hora com fuso fica registrado no README,
 * seção Referências, em vez de contornar aqui. */
function stamp(iso: string): string {
  return formatDate(iso.slice(0, 10));
}

export default function CostPerLeadCard({ data = defaultData, className }: CostPerLeadCardProps) {
  const { current, previous, freshness } = data;
  const cpl = costPerLead(current);
  const previousCpl = previous === null ? null : costPerLead(previous);
  const fraction = cpl !== null && previousCpl !== null && previousCpl > 0 ? (cpl - previousCpl) / previousCpl : null;
  const flat = fraction !== null && Math.abs(fraction) < FLAT_THRESHOLD;
  const smallSample = current.leads < MIN_DENOMINATOR || (previous !== null && previous.leads < MIN_DENOMINATOR);
  const improved = fraction !== null && (data.polarity === 'lower-is-better' ? fraction < 0 : fraction > 0);
  const tone = fraction === null || flat || smallSample || data.polarity === 'neutral' ? 'text-text-secondary' : improved ? 'text-positive' : 'text-negative';
  const DeltaIcon: LucideIcon = flat || fraction === null ? Minus : fraction > 0 ? TrendingUp : TrendingDown;
  const threshold = data.actionThreshold;
  /** O lado ruim do limiar segue a polaridade: para "menor é melhor" o ponto de ação acende
   * acima do limiar; para "maior é melhor", acende abaixo. O texto do selo usa esta mesma
   * palavra, nunca "acima" fixo (item 22 da revisão). */
  const thresholdWord = data.polarity === 'higher-is-better' ? 'abaixo' : 'acima';
  const actionLit =
    cpl !== null && threshold !== null && (data.polarity === 'lower-is-better' ? cpl > threshold : cpl < threshold);
  const fresh = freshnessOf(freshness);
  const provenance = PROVENANCE[data.provenance];
  const absolutePercent = fraction === null ? '' : formatPercent(Math.abs(fraction), Math.abs(fraction) >= WHOLE_PERCENT_FROM ? 0 : 1);

  const summary = [
    `Cartão de KPI ${provenance.label.toLowerCase()}, ${data.label} de ${formatMonthLong(current.month)}:`,
    cpl === null
      ? `CPL sem cálculo, ${formatCurrencyCompact(current.spend)} em ${formatInt(current.leads)} leads.`
      : `${formatCurrencyCompact(cpl)}, ${formatCurrencyCompact(current.spend)} em ${formatInt(current.leads)} leads.`,
    cpl === null
      ? 'Sem variação calculada.'
      : previous === null
        ? 'Sem mês anterior medido para comparar.'
        : previousCpl === null
          ? `CPL sem cálculo em ${formatMonthLong(previous.month)}, ${formatInt(previous.leads)} leads.`
          : fraction !== null
            ? `${flat ? 'Estável' : `${fraction < 0 ? 'Queda' : 'Alta'} de ${absolutePercent}`} contra ${formatMonthLong(previous.month)}, ${formatCurrencyCompact(previousCpl)}.`
            : 'Sem mês anterior medido para comparar.',
    actionLit && threshold !== null
      ? `${thresholdWord === 'abaixo' ? 'Abaixo' : 'Acima'} do limiar de ação de ${formatCurrencyCompact(threshold)}.`
      : '',
    fresh.kind === 'inconsistent' ? 'Carimbo de coleta inconsistente.' : `Coleta de ${stamp(freshness.collectedAt)}${fresh.kind === 'stale' ? ', defasada' : ''}.`,
  ].join(' ');

  return (
    <article
      aria-label={summary}
      className={cn('relative flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3 text-[0.6875rem] leading-none">
        <p className={cn('font-semibold', provenance.tone)}>{provenance.label}</p>
        <p className="shrink-0 text-text-muted tabular-nums">{formatMonthShort(current.month)}</p>
      </div>

      <div className="mt-2 flex min-h-5 min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="min-w-0 text-xs font-medium text-text-secondary">{data.label}</p>
        {actionLit && threshold !== null ? (
          <p
            aria-label={`Ponto de ação: ${data.label} ${thresholdWord} do limiar de ${formatCurrencyCompact(threshold)}`}
            className="inline-flex shrink-0 items-center gap-1 text-[0.6875rem] font-medium text-warning"
            role="img"
          >
            <CircleAlert aria-hidden className="size-3.5" strokeWidth={2.25} />
            <span aria-hidden>
              {thresholdWord} do limiar de <span className="kpi-number">{formatCurrencyCompact(threshold)}</span>
            </span>
          </p>
        ) : null}
      </div>

      <div className="mt-2 flex h-7.5 min-w-0 items-end">
        {cpl === null ? (
          <p className="font-display text-xl leading-none text-text-muted">CPL sem cálculo</p>
        ) : (
          <p className="kpi-number text-3xl leading-none font-semibold text-text-primary">{formatCurrencyCompact(cpl)}</p>
        )}
      </div>

      <p className="mt-2 flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs text-text-muted tabular-nums">
        {cpl === null ? (
          <span>
            <span className="kpi-number">{formatInt(current.leads)}</span> leads qualificados, CPL sem cálculo
          </span>
        ) : previous === null ? (
          <span>sem mês anterior medido para comparar</span>
        ) : previousCpl === null ? (
          <span>
            CPL sem cálculo em {formatMonthShort(previous.month)}, <span className="kpi-number">{formatInt(previous.leads)}</span> leads qualificados
          </span>
        ) : fraction !== null ? (
          <>
            <span className={cn('inline-flex shrink-0 items-center gap-1 font-semibold', tone)}>
              <DeltaIcon aria-hidden className="size-3.5" strokeWidth={2.25} />
              <span className="kpi-number">{flat ? 'estável' : `${fraction > 0 ? '+' : '−'}${absolutePercent}`}</span>
            </span>
            <span>
              contra <span className="kpi-number text-text-secondary">{formatCurrencyCompact(previousCpl)}</span> em {formatMonthShort(previous.month)}
            </span>
          </>
        ) : (
          <span>sem mês anterior medido para comparar</span>
        )}
      </p>

      <p className="mt-1 text-xs text-text-muted">
        {current.leads === 0 ? (
          <>
            <span className="kpi-number text-text-secondary">{formatCurrencyCompact(current.spend)}</span> investidos,{' '}
            <span className="kpi-number text-text-secondary">{formatInt(current.leads)}</span> leads qualificados
          </>
        ) : (
          <>
            <span className="kpi-number text-text-secondary">{formatCurrencyCompact(current.spend)}</span> em{' '}
            <span className="kpi-number text-text-secondary">{formatInt(current.leads)}</span> leads qualificados
          </>
        )}
      </p>

      <div className="mt-auto flex min-w-0 items-end justify-between gap-3 pt-3">
        <p className={cn('flex min-w-0 items-start gap-1.5 text-[0.6875rem]', fresh.kind === 'stale' ? 'text-warning' : 'text-text-muted')}>
          {fresh.kind === 'stale' ? <TriangleAlert aria-hidden className="mt-px size-3.5 shrink-0" /> : <Clock aria-hidden className="mt-px size-3.5 shrink-0" />}
          {fresh.kind === 'inconsistent' ? (
            <span>carimbo de coleta inconsistente</span>
          ) : (
            <span className="tabular-nums">
              <span className="block">
                {fresh.kind === 'stale'
                  ? `defasado há ${fresh.lagHours >= 48 ? formatDays(Math.floor(fresh.lagHours / 24)) : formatHours(Math.round(fresh.lagHours))}`
                  : `dado de ${stamp(freshness.collectedAt)}`}
              </span>
              <span className="block">
                {fresh.kind === 'stale' ? `última coleta ${stamp(freshness.collectedAt)}` : `atualiza a cada ${formatHours(freshness.expectedEveryHours)}`}
              </span>
            </span>
          )}
        </p>
        <a
          aria-label={`Abrir as campanhas de ${formatMonthLong(current.month)}`}
          className="group inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-text-secondary outline-none hover:text-text-primary"
          href={data.href}
        >
          Ver campanhas
          <ChevronRight aria-hidden className="size-3.5" strokeWidth={2.25} />
          <span className="absolute inset-0 rounded-lg group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary" />
        </a>
      </div>
    </article>
  );
}
