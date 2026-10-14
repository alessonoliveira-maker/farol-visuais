import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, MONTHS, type OriginMonthlyLeads } from './data';

/**
 * Tabela cruzada de leads por origem e mês, lida por padrão em percentual da linha: cada
 * origem soma 100% nos seus 12 meses, com o denominador nomeado no cabeçalho e a contagem
 * absoluta só na margem. Toda combinação tem registro nesta versão; zero é contagem medida.
 */
export interface LeadsByOriginMonthProps {
  readonly data?: readonly OriginMonthlyLeads[];
  readonly height?: number;
  readonly className?: string;
  /** Denominador do percentual de cada célula; o padrão é a linha (a origem). */
  readonly percentMode?: 'total' | 'row' | 'col';
}

const MODE_LABEL: Record<'total' | 'row' | 'col', string> = {
  total: '% do total',
  row: '% da linha',
  col: '% da coluna',
};

/** Frase do denominador ativo, usada na frase acessível e na nota de rodapé (nunca fixa em "linha"). */
const MODE_DENOMINATOR: Record<'total' | 'row' | 'col', string> = {
  total: 'o total geral de leads do ano',
  row: 'o total de leads da própria origem',
  col: 'o total de leads do próprio mês',
};

const NAME_COLUMN_WIDTH = 156;
const TOTAL_COLUMN_WIDTH = 48;

function sum(values: readonly number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

/** Percentual inteiro por maior resto (NUM-2): o grupo sempre soma 100, nunca 99 ou 101. */
function largestRemainderPercents(counts: readonly number[], total: number): number[] {
  if (total <= 0) return counts.map(() => 0);
  const raw = counts.map((count) => (count / total) * 100);
  const floors = raw.map((value) => Math.floor(value));
  const remainder = 100 - sum(floors);
  const order = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  for (let i = 0; i < remainder; i += 1) {
    const target = order[i];
    if (target) result[target.index] = (result[target.index] ?? 0) + 1;
  }
  return result;
}

export default function LeadsByOriginMonth({ data = defaultData, height, className, percentMode = 'row' }: LeadsByOriginMonthProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center', className)} role="status" style={style}>
        <p className="text-xs text-text-muted">Nenhuma origem neste recorte: sem leads para cruzar por mês.</p>
      </div>
    );
  }

  const rowTotals = data.map((row) => sum(row.counts));
  const colTotals = MONTHS.map((_, monthIndex) => sum(data.map((row) => row.counts[monthIndex] ?? 0)));
  const grandTotal = sum(rowTotals);

  const rowPercents = data.map((row, rowIndex) => largestRemainderPercents(row.counts, rowTotals[rowIndex] ?? 0));
  const colPercents = MONTHS.map((_, monthIndex) => largestRemainderPercents(data.map((row) => row.counts[monthIndex] ?? 0), colTotals[monthIndex] ?? 0));
  const totalPercents = largestRemainderPercents(data.flatMap((row) => row.counts), grandTotal);

  function percentAt(rowIndex: number, monthIndex: number): number {
    if (percentMode === 'row') return rowPercents[rowIndex]?.[monthIndex] ?? 0;
    if (percentMode === 'col') return colPercents[monthIndex]?.[rowIndex] ?? 0;
    return totalPercents[rowIndex * MONTHS.length + monthIndex] ?? 0;
  }

  const topIndex = rowTotals.reduce((best, value, index) => (value > (rowTotals[best] ?? 0) ? index : best), 0);
  const topOrigin = data[topIndex];
  const summary =
    `Tabela cruzada de leads por ${String(data.length)} origens em ${String(MONTHS.length)} meses de 2026, ` +
    `lida em ${MODE_LABEL[percentMode]}: cada célula soma 100% sobre ${MODE_DENOMINATOR[percentMode]}. ` +
    `${String(grandTotal)} leads no ano ao todo. ${topOrigin?.name ?? ''} concentra o maior total anual, ` +
    `com ${String(rowTotals[topIndex] ?? 0)} leads.`;

  const gridTemplateColumns = `${String(NAME_COLUMN_WIDTH)}px repeat(${String(MONTHS.length)}, minmax(0, 1fr)) ${String(TOTAL_COLUMN_WIDTH)}px`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-1', className)} role="table" style={style}>
      <div className="grid gap-x-0.5 gap-y-0.5" style={{ gridTemplateColumns }}>
        <span className="self-end pb-0.5 text-[0.6875rem] font-medium text-text-muted" role="columnheader">
          {MODE_LABEL[percentMode]}
        </span>
        {MONTHS.map((month) => (
          <span className="self-end pb-0.5 text-center text-[0.6875rem] font-medium text-text-secondary" key={month} role="columnheader">
            {formatMonthShort(month)}
          </span>
        ))}
        <span className="self-end pb-0.5 text-right text-[0.6875rem] font-medium text-text-secondary" role="columnheader">
          Total (nº)
        </span>

        <div role="rowgroup" style={{ display: 'contents' }}>
          {data.map((row, rowIndex) => (
            <div className="col-span-full grid grid-cols-subgrid border-t border-line-subtle" key={row.id} role="row">
              <span className="py-0.5 pr-1.5 text-[0.6875rem] leading-tight text-text-secondary" role="rowheader">
                {row.name}
              </span>
              {MONTHS.map((month, monthIndex) => (
                <span
                  className="flex items-center justify-center py-0.5 font-display text-[0.6875rem] tabular-nums text-text-primary"
                  key={month}
                  role="cell"
                >
                  {formatPercent(percentAt(rowIndex, monthIndex) / 100, 0)}
                </span>
              ))}
              <span className="flex items-center justify-end rounded bg-surface-sunken py-0.5 pr-1 font-display text-[0.6875rem] font-semibold tabular-nums text-text-primary">
                {formatInt(rowTotals[rowIndex] ?? 0)}
              </span>
            </div>
          ))}
        </div>

        <div className="col-span-full grid grid-cols-subgrid border-t border-line-strong pt-0.5" role="row">
          <span className="text-[0.6875rem] font-semibold text-text-secondary" role="rowheader">
            Total
          </span>
          {colTotals.map((total, monthIndex) => (
            <span
              className="flex items-center justify-center rounded bg-surface-sunken font-display text-[0.6875rem] font-semibold tabular-nums text-text-primary"
              key={MONTHS[monthIndex]}
            >
              {formatInt(total)}
            </span>
          ))}
          <span className="flex items-center justify-end rounded bg-surface-sunken pr-1 font-display text-xs font-semibold tabular-nums text-text-primary">
            {formatInt(grandTotal)}
          </span>
        </div>
      </div>

      <p aria-hidden className="shrink-0 text-[0.6875rem] leading-snug text-text-muted">
        {MODE_LABEL[percentMode]}: cada célula soma sobre {MODE_DENOMINATOR[percentMode]}, fechando{' '}
        <span className="font-display tabular-nums">{formatInt(100)}</span> pelo maior resto. A coluna Total (nº) é
        contagem absoluta, nunca percentual, e não some com o miolo.
      </p>
    </div>
  );
}
