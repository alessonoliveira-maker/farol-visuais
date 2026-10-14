import { Filter, Unplug } from 'lucide-react';

import { formatInt, formatMonthLong, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightKey as defaultHighlightKey, type LeadsByOrigin } from './data';

/**
 * Cartão de KPI com barra de composição: o total de leads do mês e uma barra única segmentada cuja
 * ordem vem da configuração das origens, nunca do valor. A origem acesa fica em --chart-1; as outras
 * ficam em neutro, que só é legível porque cada valor está escrito na legenda ao lado.
 */
export interface LeadOriginBarCardProps {
  readonly data?: LeadsByOrigin;
  /** Chave da origem em destaque; `null` apaga o destaque e a leitura passa a citar a maior origem. */
  readonly highlightKey?: string | null;
  readonly className?: string;
}

/** Teto de partes da barra: da quinta em diante, as últimas da configuração viram uma parte só. */
const MAX_SEGMENTS = 5;
const OTHERS_ID = 'others';
const UNCONFIGURED_ID = 'unconfigured';
const PERCENT_BASE = 100;

interface Segment {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  /** Participação inteira, de 0 a 100. */
  readonly share: number;
  readonly highlighted: boolean;
}

/** Percentuais inteiros pelo maior resto: somam 100 exatos; empate no resto fica com a parte que vem antes. */
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

/** Segmentos na ordem da configuração; contagem sem origem configurada não some, vira a última parte. */
function buildSegments(origins: LeadsByOrigin['origins'], counts: NonNullable<LeadsByOrigin['counts']>, highlightKey: string | null): readonly Segment[] {
  const countByKey = new Map(counts.map((item) => [item.key, item.count]));
  const configured = origins.map((origin) => ({ id: origin.key, label: origin.label, count: countByKey.get(origin.key) ?? 0 }));
  const known = new Set(origins.map((origin) => origin.key));
  const unconfigured = counts.filter((item) => !known.has(item.key)).reduce((sum, item) => sum + item.count, 0);
  const parts = unconfigured > 0 ? [...configured, { id: UNCONFIGURED_ID, label: 'Origem fora da configuração', count: unconfigured }] : configured;
  const capped =
    parts.length <= MAX_SEGMENTS
      ? parts
      : [
          ...parts.slice(0, MAX_SEGMENTS - 1),
          {
            id: OTHERS_ID,
            label: `Outras (${formatInt(parts.length - MAX_SEGMENTS + 1)} origens)`,
            count: parts.slice(MAX_SEGMENTS - 1).reduce((sum, part) => sum + part.count, 0),
          },
        ];
  const shares = wholeShares(capped.map((part) => part.count));
  return capped.map((part, index) => ({ ...part, share: shares[index] ?? 0, highlighted: part.id === highlightKey }));
}

function shareText(segment: Segment): string {
  return formatPercent(segment.share / PERCENT_BASE, 0);
}

function summaryOf(data: LeadsByOrigin, total: number | null, segments: readonly Segment[]): string {
  const head = `Cartão de KPI com barra de composição: ${data.label.toLowerCase()} em ${formatMonthLong(data.month)}`;
  if (total === null) return `${head}, ${formatUnavailable()} por falta de coleta; não há composição por origem para mostrar.`;
  if (total === 0) return `${head}, nenhum lead no recorte; zero medido, sem composição por origem para mostrar.`;
  const parts = segments.map((segment) => `${segment.label}${segment.highlighted ? ', em destaque,' : ','} ${formatInt(segment.count)} (${shareText(segment)})`);
  return `${head}, ${formatInt(total)} leads. ${parts.join('; ')}.`;
}

export default function LeadOriginBarCard({ data = defaultData, highlightKey = defaultHighlightKey, className }: LeadOriginBarCardProps) {
  const total = data.counts === null ? null : data.counts.reduce((sum, item) => sum + item.count, 0);
  const segments = data.counts === null ? [] : buildSegments(data.origins, data.counts, highlightKey);
  const drawn = segments.filter((segment) => segment.count > 0);
  const lead = segments.find((segment) => segment.highlighted) ?? [...segments].sort((a, b) => b.count - a.count)[0];
  const summary = summaryOf(data, total, segments);

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

      {total === null ? (
        <p className="mt-2 flex items-center gap-2 text-text-muted">
          <Unplug aria-hidden className="size-5 shrink-0" />
          <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
        </p>
      ) : (
        <p className="mt-2 flex items-baseline gap-2">
          <span className="kpi-number text-3xl leading-none font-semibold text-text-primary">{formatInt(total)}</span>
          <span className="text-xs text-text-muted">leads</span>
        </p>
      )}

      {total === null || total === 0 || lead === undefined ? (
        <div className="mt-4 flex min-h-0 flex-1 items-center gap-2 text-xs text-text-muted" role="status">
          {total === null ? <Unplug aria-hidden className="size-4 shrink-0" /> : <Filter aria-hidden className="size-4 shrink-0" />}
          <span>{total === null ? 'Sem coleta de origem no período: a composição fica de fora.' : 'Nenhum lead neste recorte: não há origens para compor o total.'}</span>
        </div>
      ) : (
        <>
          <p aria-hidden className="mt-2 min-w-0 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">{lead.label}</span> {lead.highlighted ? 'responde por' : 'lidera com'}{' '}
            <span className="font-semibold text-text-primary">{shareText(lead)}</span> do volume
          </p>

          <div aria-hidden className="mt-3 flex w-full min-w-0">
            {drawn.map((segment, index) => (
              <span
                className={cn(
                  'h-2.5 min-w-0 basis-0',
                  index > 0 && 'border-l-2 border-surface-raised',
                  index === 0 && 'rounded-l-xs',
                  index === drawn.length - 1 && 'rounded-r-xs',
                  segment.highlighted ? 'bg-chart-1' : 'bg-line-strong',
                )}
                key={segment.id}
                style={{ flexGrow: segment.count }}
              />
            ))}
          </div>

          <ul className="mt-auto space-y-2.5 pt-4">
            {segments.map((segment) => (
              <li className="flex min-w-0 items-center gap-2.5 text-xs leading-4" key={segment.id}>
                <span aria-hidden className={cn('size-2.5 shrink-0 rounded-xs', segment.highlighted ? 'bg-chart-1' : 'bg-line-strong')} />
                <span className={cn('min-w-0 flex-1', segment.highlighted ? 'font-bold text-text-primary' : 'text-text-secondary')}>{segment.label}</span>
                <span className={cn('w-9 shrink-0 text-right font-display', segment.highlighted ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                  {formatInt(segment.count)}
                </span>
                <span className="w-9 shrink-0 text-right text-[0.6875rem] text-text-muted">{shareText(segment)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}
