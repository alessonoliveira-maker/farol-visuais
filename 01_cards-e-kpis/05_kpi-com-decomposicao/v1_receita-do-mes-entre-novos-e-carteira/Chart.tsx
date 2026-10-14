import { Filter, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatInt, formatMonthLong, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type RevenueComposition } from './data';

/**
 * Cartão de KPI hierárquico por soma: o total do mês em 30 px e, abaixo, as partes que o formam em
 * 14 px, cada uma com a participação inteira. A relação de soma é escrita e conferida aqui: o que as
 * partes não explicam vira a linha "Sem classificação", e partes acima do total viram aviso escrito.
 */
export interface RevenueSplitCardProps {
  readonly data?: RevenueComposition;
  readonly className?: string;
}

/** Diferença abaixo de R$ 1 é arredondamento da carga, não resto a declarar. */
const RESIDUAL_TOLERANCE = 1;
const RESIDUAL_ID = 'residual';
const RESIDUAL_LABEL = 'Sem classificação';
const PERCENT_BASE = 100;

interface ChildRow {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  /** Participação inteira, de 0 a 100. */
  readonly share: number;
  readonly isResidual: boolean;
}

interface SumReading {
  readonly total: number;
  readonly namedCount: number;
  /** Total menos a soma das partes: positivo é resto sem classificação; negativo, partes acima do total. */
  readonly residual: number;
  readonly rows: readonly ChildRow[];
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

/** Confere a soma antes de desenhar e acrescenta o resto nomeado quando as partes não chegam ao total. */
function readSum(data: RevenueComposition): SumReading | null {
  if (data.total === null || data.parts.length === 0) return null;
  const partsSum = data.parts.reduce((sum, part) => sum + part.value, 0);
  const residual = data.total - partsSum;
  const entries = data.parts.map((part) => ({ id: part.id, label: part.label, value: part.value, isResidual: false }));
  if (residual >= RESIDUAL_TOLERANCE) entries.push({ id: RESIDUAL_ID, label: RESIDUAL_LABEL, value: residual, isResidual: true });
  const shares = wholeShares(entries.map((entry) => Math.max(entry.value, 0)));
  const rows = entries.map((entry, index) => ({ ...entry, share: shares[index] ?? 0 }));
  return { total: data.total, namedCount: data.parts.length, residual, rows };
}

function relationText(reading: SumReading): string {
  const parts = `${formatInt(reading.namedCount)} ${reading.namedCount === 1 ? 'parte' : 'partes'}`;
  if (Math.abs(reading.residual) < RESIDUAL_TOLERANCE) return `soma exata de ${parts}`;
  if (reading.residual > 0) return `${parts} somam ${formatCurrencyCompact(reading.total - reading.residual)}; o resto está sem classificação`;
  return `as partes passam do total em ${formatCurrencyCompact(-reading.residual)}: confira a carga`;
}

function summaryOf(data: RevenueComposition, reading: SumReading | null): string {
  const head = `Cartão de KPI com decomposição por soma. ${data.label} em ${formatMonthLong(data.month)}`;
  if (data.total === null) return `${head}: ${formatUnavailable()} por falta de coleta, então não há partes para mostrar.`;
  if (reading === null) return `${head}: ${formatCurrencyCompact(data.total)}, sem partes registradas no recorte para decompor o total.`;
  const rows = reading.rows.map((row) => `${row.label}, ${formatCurrencyCompact(row.value)} (${formatPercent(row.share / PERCENT_BASE, 0)})`);
  return `${head}: ${formatCurrencyCompact(reading.total)}, ${relationText(reading)}. ${rows.join('; ')}.`;
}

export default function RevenueSplitCard({ data = defaultData, className }: RevenueSplitCardProps) {
  const reading = readSum(data);
  const summary = summaryOf(data, reading);

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
          <p className="mt-2 text-xs text-text-muted">sem coleta no período: as partes também ficam de fora</p>
        </>
      ) : (
        <p className="kpi-number mt-2 text-3xl leading-none font-semibold text-text-primary">{formatCurrencyCompact(data.total)}</p>
      )}

      {data.total !== null && reading === null ? (
        <div className="mt-4 flex min-h-0 flex-1 items-center gap-2 text-xs text-text-muted" role="status">
          <Filter aria-hidden className="size-4 shrink-0" />
          <span>Nenhuma parte registrada neste recorte: o total não tem decomposição para mostrar.</span>
        </div>
      ) : null}

      {reading !== null ? (
        <>
          <p className={cn('mt-2 text-xs', reading.residual <= -RESIDUAL_TOLERANCE ? 'text-negative' : 'text-text-muted')}>
            {relationText(reading)}
          </p>
          <ul className="mt-auto flex min-w-0 items-start gap-3 pt-4">
            {reading.rows.map((row, index) => (
              <li className="flex min-w-0 flex-1 items-start gap-3" key={row.id}>
                {index > 0 ? (
                  <span aria-hidden className="kpi-number pt-4 text-sm leading-5 font-semibold text-text-muted">
                    +
                  </span>
                ) : null}
                <div className="min-w-0">
                  <p className={cn('text-[0.6875rem] leading-4 font-medium', row.isResidual ? 'text-text-muted' : 'text-text-secondary')}>
                    {row.label}
                  </p>
                  <p className={cn('kpi-number text-sm leading-5 font-semibold', row.isResidual ? 'text-text-secondary' : 'text-text-primary')}>
                    {formatCurrencyCompact(row.value)}
                  </p>
                  <p className="text-[0.6875rem] leading-4 text-text-muted">{formatPercent(row.share / PERCENT_BASE, 0)} do total</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}
