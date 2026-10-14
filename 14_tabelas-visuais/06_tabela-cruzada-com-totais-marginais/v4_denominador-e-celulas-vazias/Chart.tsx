import { Ban, Unplug } from 'lucide-react';
import { useState } from 'react';

import { formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, MONTHS, type OriginMonthCell, type OriginMonthlyLeadsWithGaps } from './data';

/**
 * Tabela cruzada de leads por origem e mês com alternador de percentual (do total, da linha,
 * da coluna) e as três respostas de uma célula sem número: vazio (indisponível, sem captação),
 * não se aplica (ícone, fora do escopo estrutural) e zero medido (0%, pintado no degrau mais
 * baixo da escala). As três nunca dividem cor nem glifo.
 */
export interface OriginGapCrossTableProps {
  readonly data?: readonly OriginMonthlyLeadsWithGaps[];
  readonly height?: number;
  readonly className?: string;
}

type PercentMode = 'total' | 'row' | 'col';

const MODE_LABEL: Record<PercentMode, string> = { total: '% do total', row: '% da linha', col: '% da coluna' };
const MODE_DENOMINATOR: Record<PercentMode, string> = {
  total: 'total geral de leads medidos',
  row: 'total de leads medidos da própria origem',
  col: 'total de leads medidos do próprio mês',
};

const SEQ_TOKENS = ['var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-6)', 'var(--seq-7)'];
const SEQ_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
];
const NAME_COLUMN_WIDTH = 156;
const TOTAL_COLUMN_WIDTH = 46;

function isMeasured(cell: OriginMonthCell): cell is number {
  return typeof cell === 'number';
}

/** Percentual inteiro por maior resto, só sobre as células medidas do grupo (NUM-2). */
function percentsForGroup(cells: readonly OriginMonthCell[]): readonly (number | null)[] {
  const measuredIndexes: number[] = [];
  const measuredValues: number[] = [];
  cells.forEach((cell, index) => {
    if (isMeasured(cell)) {
      measuredIndexes.push(index);
      measuredValues.push(cell);
    }
  });
  const total = measuredValues.reduce((acc, value) => acc + value, 0);
  const result: (number | null)[] = cells.map(() => null);
  if (total <= 0) return result;
  const raw = measuredValues.map((value) => (value / total) * 100);
  const floors = raw.map((value) => Math.floor(value));
  const remainder = 100 - floors.reduce((acc, value) => acc + value, 0);
  const order = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);
  const rounded = [...floors];
  for (let i = 0; i < remainder; i += 1) {
    const target = order[i];
    if (target) rounded[target.index] = (rounded[target.index] ?? 0) + 1;
  }
  measuredIndexes.forEach((originalIndex, k) => {
    result[originalIndex] = rounded[k] ?? 0;
  });
  return result;
}

function levelForValue(value: number, min: number, max: number): number {
  const span = max - min || 1;
  const t = (value - min) / span;
  return Math.min(SEQ_TOKENS.length - 1, Math.max(0, Math.round(t * (SEQ_TOKENS.length - 1))));
}

export default function OriginGapCrossTable({ data = defaultData, height, className }: OriginGapCrossTableProps) {
  const style = height === undefined ? undefined : { height };
  const [mode, setMode] = useState<PercentMode>('row');

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center', className)} role="status" style={style}>
        <p className="text-xs text-text-muted">Nenhuma origem neste recorte: sem leads para cruzar por mês.</p>
      </div>
    );
  }

  const rowTotals = data.map((row) => row.counts.filter(isMeasured).reduce((acc, value) => acc + value, 0));
  const colTotals = MONTHS.map((_, j) =>
    data.reduce((acc, row) => {
      const cell = row.counts[j];
      return acc + (typeof cell === 'number' ? cell : 0);
    }, 0),
  );
  const grandTotal = rowTotals.reduce((acc, value) => acc + value, 0);

  const rowPercents = data.map((row) => percentsForGroup(row.counts));
  const colPercents = MONTHS.map((_, j) => percentsForGroup(data.map((row) => row.counts[j] ?? 'na')));
  const totalPercents = percentsForGroup(data.flatMap((row) => row.counts));

  function percentAt(rowIndex: number, monthIndex: number): number | null {
    if (mode === 'row') return rowPercents[rowIndex]?.[monthIndex] ?? null;
    if (mode === 'col') return colPercents[monthIndex]?.[rowIndex] ?? null;
    return totalPercents[rowIndex * MONTHS.length + monthIndex] ?? null;
  }

  const visiblePercents: number[] = [];
  data.forEach((_, i) => MONTHS.forEach((__, j) => {
    const value = percentAt(i, j);
    if (value !== null) visiblePercents.push(value);
  }));
  const min = visiblePercents.length > 0 ? Math.min(...visiblePercents) : 0;
  const max = visiblePercents.length > 0 ? Math.max(...visiblePercents) : 1;

  const vazioCount = data.reduce((acc, row) => acc + row.counts.filter((c) => c === 'vazio').length, 0);
  const naCount = data.reduce((acc, row) => acc + row.counts.filter((c) => c === 'na').length, 0);
  const summary =
    `Tabela cruzada de leads por ${String(data.length)} origens em ${String(MONTHS.length)} meses de 2026, em ${MODE_LABEL[mode]} ` +
    `sobre ${MODE_DENOMINATOR[mode]}. Total geral de ${String(grandTotal)} leads medidos. ` +
    `${String(vazioCount)} indisponíveis antes da origem existir; ${String(naCount)} não se aplicam, fora do piloto.`;

  const gridTemplateColumns = `${String(NAME_COLUMN_WIDTH)}px repeat(${String(MONTHS.length)}, minmax(0, 1fr)) ${String(TOTAL_COLUMN_WIDTH)}px`;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-1.5', className)} role="group" style={style}>
      <div className="flex shrink-0 items-center justify-between gap-2">
        <p aria-hidden className="text-[0.6875rem] text-text-muted">Denominador: {MODE_DENOMINATOR[mode]}</p>
        <div className="inline-flex shrink-0 rounded-md border border-line-subtle p-0.5" role="radiogroup" aria-label="Denominador do percentual">
          {(Object.keys(MODE_LABEL) as PercentMode[]).map((key) => (
            <button
              aria-checked={mode === key}
              className={cn(
                'rounded px-1.5 py-0.5 text-[0.6875rem] font-medium',
                mode === key ? 'bg-chart-1' : 'text-text-secondary',
              )}
              key={key}
              onClick={() => { setMode(key); }}
              role="radio"
              style={mode === key ? { color: 'var(--accent-cyan-contrast)' } : undefined}
              type="button"
            >
              {MODE_LABEL[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-x-0.5 gap-y-0.5" role="table" style={{ gridTemplateColumns }}>
        <span className="self-end pb-0.5 text-[0.6875rem] font-medium text-text-muted" role="columnheader">
          {MODE_LABEL[mode]}
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
            {MONTHS.map((month, monthIndex) => {
              const cell = row.counts[monthIndex] ?? 'na';
              if (cell === 'vazio') {
                return (
                  <span className="flex items-center justify-center gap-1 py-0.5 text-text-muted" key={month} role="cell">
                    <Unplug aria-hidden className="size-3" strokeWidth={1.75} />
                    <span className="sr-only">
                      {formatUnavailable()}: origem ainda não existia em {formatMonthShort(month)}
                    </span>
                  </span>
                );
              }
              if (cell === 'na') {
                return (
                  <span className="flex items-center justify-center py-0.5 text-text-muted" key={month} role="cell">
                    <Ban aria-hidden className="size-3" strokeWidth={1.75} />
                    <span className="sr-only">não se aplica em {formatMonthShort(month)}: fora da janela do piloto</span>
                  </span>
                );
              }
              const percent = percentAt(rowIndex, monthIndex);
              const level = percent === null ? 0 : levelForValue(percent, min, max);
              return (
                <span
                  className="flex items-center justify-center rounded-sm py-0.5"
                  key={month}
                  role="cell"
                  style={{ backgroundColor: SEQ_TOKENS[level] }}
                >
                  <span className="font-display text-[0.6875rem] font-medium tabular-nums" style={{ color: SEQ_TEXT[level] }}>
                    {formatPercent((percent ?? 0) / 100, 0)}
                  </span>
                </span>
              );
            })}
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

      <figcaption aria-hidden className="flex shrink-0 flex-wrap items-center gap-2 text-[0.6875rem] text-text-muted">
        <span className="font-display tabular-nums">{formatPercent(min / 100, 0)}</span>
        <span className="flex overflow-hidden rounded-sm">
          {SEQ_TOKENS.map((token) => (
            <span className="h-3 w-5" key={token} style={{ backgroundColor: token }} />
          ))}
        </span>
        <span className="font-display tabular-nums">{formatPercent(max / 100, 0)}</span>
        <span>· escala só do miolo em {MODE_LABEL[mode]}</span>
        <span className="inline-flex items-center gap-1">
          <Unplug aria-hidden className="size-3" strokeWidth={1.75} /> {formatUnavailable()}: origem sem captação naquele mês
        </span>
        <span className="inline-flex items-center gap-1">
          <Ban aria-hidden className="size-3" strokeWidth={1.75} /> não se aplica: fora da janela do piloto
        </span>
        <span>Zero medido usa o fundo do degrau mais baixo da escala, nunca fica sem cor.</span>
      </figcaption>
    </figure>
  );
}
