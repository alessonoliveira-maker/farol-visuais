import { Filter, Unplug } from 'lucide-react';

import { formatInt, formatMonthLong, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadsContribution, type OriginLeads } from './data';

/**
 * Cartão de KPI com lista de contribuição: o total de leads do mês e as maiores origens em ordem
 * decrescente, cada uma com barra proporcional ao TOTAL (não ao maior item), a linha de demais que
 * fecha a soma e a linha própria dos leads sem origem registrada, com a etiqueta LACUNA. A função pura
 * `buildContribution` monta topo, demais e sem rótulo e confere a soma antes de desenhar.
 */
export interface LeadContributionCardProps {
  readonly data?: LeadsContribution;
  /** Quantas origens aparecem pelo nome antes da linha de demais (de 3 a 5). */
  readonly topCount?: number;
  readonly className?: string;
}

/** Abaixo de 3 nomes a lista não explica; acima de 5 ela vira a protagonista e o visual é outro. */
const MIN_TOP = 3;
const MAX_TOP = 5;
const DEFAULT_TOP = 5;
const PERCENT_BASE = 100;
const COLLATION_LOCALE = 'pt-BR';
const REST_ID = 'rest';
const UNLABELED_ID = 'unlabeled';

type RowKind = 'top' | 'rest' | 'unlabeled';

interface ContributionEntry {
  readonly id: string;
  readonly kind: RowKind;
  readonly name: string;
  readonly count: number;
}

interface ContributionRow extends ContributionEntry {
  /** Largura da barra: fração exata do total, de 0 a 1. */
  readonly fraction: number;
  /** Participação inteira, de 0 a 100, pelo maior resto. */
  readonly share: number;
}

interface Contribution {
  readonly total: number;
  readonly rows: readonly ContributionRow[];
  readonly topCount: number;
  readonly topShare: number;
  readonly unlabeled: ContributionRow | null;
  /** Total menos a soma das linhas: zero quando a lista fecha o número. */
  readonly gap: number;
}

/** Percentuais inteiros pelo maior resto: somam 100 exatos; empate no resto fica com a linha que vem antes. */
function wholeShares(values: readonly number[]): readonly number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const exact = values.map((value) => (value / total) * PERCENT_BASE);
  const shares = exact.map((value) => Math.floor(value));
  let missing = PERCENT_BASE - shares.reduce((sum, value) => sum + value, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (const { index } of byRemainder) {
    if (missing <= 0) break;
    shares[index] = (shares[index] ?? 0) + 1;
    missing -= 1;
  }
  return shares;
}

/** Maior primeiro; empate decidido pelo nome, para a lista não trocar de lugar a cada carga. */
function byCountThenName(a: OriginLeads, b: OriginLeads): number {
  return b.count - a.count || a.name.localeCompare(b.name, COLLATION_LOCALE);
}

/** Topo, demais e sem rótulo, com a conferência da soma contra o total do número. */
function buildContribution(data: LeadsContribution, topCount: number): Contribution | null {
  if (data.total === null || data.total <= 0) return null;
  const total = data.total;
  const size = Math.min(Math.max(Math.round(topCount), MIN_TOP), MAX_TOP);
  const sorted = [...data.origins].sort(byCountThenName);
  const head = sorted.slice(0, size);
  const tail = sorted.slice(size);
  const entries: ContributionEntry[] = head.map((origin): ContributionEntry => ({ id: origin.id, kind: 'top', name: origin.name, count: origin.count }));
  if (tail.length > 0) {
    const noun = tail.length === 1 ? 'origem' : 'origens';
    entries.push({ id: REST_ID, kind: 'rest', name: `Demais (${formatInt(tail.length)} ${noun})`, count: tail.reduce((sum, origin) => sum + origin.count, 0) });
  }
  if (data.unlabeled > 0) entries.push({ id: UNLABELED_ID, kind: 'unlabeled', name: 'Sem origem registrada', count: data.unlabeled });
  const shares = wholeShares(entries.map((entry) => entry.count));
  const rows = entries.map((entry, index) => ({ ...entry, fraction: Math.min(entry.count / total, 1), share: shares[index] ?? 0 }));
  const top = rows.filter((row) => row.kind === 'top');
  return {
    total,
    rows,
    topCount: top.length,
    topShare: top.reduce((sum, row) => sum + row.share, 0),
    unlabeled: rows.find((row) => row.kind === 'unlabeled') ?? null,
    gap: total - rows.reduce((sum, row) => sum + row.count, 0),
  };
}

function percentText(share: number): string {
  return formatPercent(share / PERCENT_BASE, 0);
}

function summaryOf(data: LeadsContribution, contribution: Contribution | null): string {
  const head = `Cartão de KPI com lista de contribuição: ${data.label.toLowerCase()} em ${formatMonthLong(data.month)}`;
  if (data.total === null) return `${head}, ${formatUnavailable()} por falta de coleta; não há origens para listar.`;
  if (contribution === null) return `${head}, nenhum lead no recorte; zero medido, sem origens para listar.`;
  const leader = contribution.rows[0];
  const lines = [
    `${head}, ${formatInt(contribution.total)} leads.`,
    leader ? `As ${formatInt(contribution.topCount)} maiores origens somam ${percentText(contribution.topShare)}, lideradas por ${leader.name} com ${formatInt(leader.count)}.` : '',
    contribution.unlabeled ? `Sem origem registrada: ${formatInt(contribution.unlabeled.count)} (${percentText(contribution.unlabeled.share)}).` : '',
  ];
  return lines.filter(Boolean).join(' ');
}

export default function LeadContributionCard({ data = defaultData, topCount = DEFAULT_TOP, className }: LeadContributionCardProps) {
  const contribution = buildContribution(data, topCount);
  const summary = summaryOf(data, contribution);

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4 tabular-nums', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-xs text-text-muted">total de {formatMonthShort(data.month)}</p>
      </div>

      {data.total === null ? (
        <>
          <p className="mt-2 flex items-center gap-2 text-text-muted">
            <Unplug aria-hidden className="size-5 shrink-0" />
            <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
          </p>
          <p className="mt-2 text-xs text-text-muted">sem coleta no período: a lista de origens também fica de fora</p>
        </>
      ) : (
        <p className="mt-2 flex items-baseline gap-1.5">
          <span className="kpi-number text-3xl leading-none font-semibold text-text-primary">{formatInt(data.total)}</span>
          <span className="text-xs text-text-muted">leads</span>
        </p>
      )}

      {data.total !== null && contribution === null ? (
        <div className="mt-4 flex min-h-0 flex-1 items-center gap-2 text-xs text-text-muted" role="status">
          <Filter aria-hidden className="size-4 shrink-0" />
          <span>Nenhum lead neste recorte: não há origens para listar.</span>
        </div>
      ) : null}

      {contribution !== null ? (
        <>
          <p aria-hidden className="mt-2 min-w-0 text-xs text-text-secondary">
            As <span className="font-semibold text-text-primary">{formatInt(contribution.topCount)}</span> maiores origens somam{' '}
            <span className="font-semibold text-text-primary">{percentText(contribution.topShare)}</span> do total
          </p>

          <ol className="mt-3 flex min-w-0 flex-1 flex-col justify-center gap-1.5">
            {contribution.rows.map((row, index) => (
              <li className="flex min-w-0 items-center gap-2" key={row.id}>
                <span className="w-4 shrink-0 text-right text-[0.6875rem] text-text-muted">{row.kind === 'top' ? index + 1 : ''}</span>
                <span aria-hidden className="relative h-2 w-16 shrink-0 overflow-hidden rounded-xs bg-surface-sunken">
                  <span
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-xs',
                      row.kind === 'unlabeled' ? 'border border-dashed border-text-muted' : 'bg-line-strong',
                    )}
                    style={{ width: `${(row.fraction * PERCENT_BASE).toFixed(2)}%` }}
                  />
                </span>
                <span className={cn('min-w-0 flex-1 text-xs leading-4', row.kind === 'top' ? 'text-text-secondary' : 'text-text-muted')}>
                  {row.name}
                  {row.kind === 'unlabeled' ? (
                    <span className="ml-1.5 rounded-xs border border-text-muted px-1 py-px text-[0.6875rem] font-semibold tracking-wide text-text-muted">
                      LACUNA
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-right font-display text-xs font-semibold text-text-primary">{formatInt(row.count)}</span>
                <span className="w-9 shrink-0 text-right text-[0.6875rem] text-text-muted">{percentText(row.share)}</span>
              </li>
            ))}
          </ol>

          {contribution.gap !== 0 ? <p className="mt-1 text-[0.6875rem] text-negative">a lista não fecha a soma do total: confira a carga</p> : null}
        </>
      ) : null}
    </article>
  );
}
