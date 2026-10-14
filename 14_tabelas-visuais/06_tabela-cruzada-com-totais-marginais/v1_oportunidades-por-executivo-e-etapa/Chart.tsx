import { Ban } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, STAGES, type ExecutiveStageRow } from './data';

/**
 * Tabela cruzada de oportunidades abertas por executivo e por etapa do funil, em CSS grid,
 * com o total de cada linha, o total de cada coluna e o total geral no canto. Uma célula sem
 * caso (papel que não cobre a etapa) nunca é lida como zero: leva o ícone de "não se aplica"
 * e entra fora das somas, distinta da contagem medida zero.
 */
export interface OpportunityCrossTableProps {
  readonly data?: readonly ExecutiveStageRow[];
  readonly height?: number;
  readonly className?: string;
}

/** Largura da coluna de rótulo do executivo, generosa para nome composto (TIP-7). */
const NAME_COLUMN_WIDTH = 168;
/** Largura da coluna de total, fixa para o algarismo tabular alinhar entre as linhas. */
const TOTAL_COLUMN_WIDTH = 68;

function sum(values: readonly (number | null)[]): number {
  return values.reduce<number>((acc, value) => acc + (value ?? 0), 0);
}

export default function OpportunityCrossTable({ data = defaultData, height, className }: OpportunityCrossTableProps) {
  const style = height === undefined ? undefined : { height };
  const rowTotals = data.map((row) => sum(row.counts));
  const colTotals = STAGES.map((_, stageIndex) => sum(data.map((row) => row.counts[stageIndex] ?? null)));
  const grandTotal = sum(rowTotals);

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center', className)} role="status" style={style}>
        <p className="text-xs text-text-muted">Nenhum executivo neste recorte: não há oportunidades para cruzar com etapa.</p>
      </div>
    );
  }

  const leaderIndex = rowTotals.reduce((best, value, index) => (value > (rowTotals[best] ?? 0) ? index : best), 0);
  const leader = data[leaderIndex];
  const busiestStageIndex = colTotals.reduce((best, value, index) => (value > (colTotals[best] ?? 0) ? index : best), 0);
  const busiestStage = STAGES[busiestStageIndex];

  const summary =
    `Tabela cruzada com ${String(data.length)} executivos por ${String(STAGES.length)} etapas do funil em 2026-09, ` +
    `com total de linha, de coluna e geral. ${String(grandTotal)} oportunidades abertas. ` +
    `${leader?.name ?? ''} lidera com ${String(rowTotals[leaderIndex] ?? 0)}; ${busiestStage ?? ''} concentra o maior total ` +
    `de coluna, com ${String(colTotals[busiestStageIndex] ?? 0)}.`;

  const gridTemplateColumns = `${String(NAME_COLUMN_WIDTH)}px repeat(${String(STAGES.length)}, minmax(0, 1fr)) ${String(TOTAL_COLUMN_WIDTH)}px`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="table" style={style}>
      <div className="grid gap-x-1 gap-y-1" role="rowgroup" style={{ gridTemplateColumns }}>
        <div role="row" style={{ display: 'contents' }}>
          <span className="self-end pb-0.5 text-[0.6875rem] font-medium text-text-muted" role="columnheader">
            Executivo
          </span>
          {STAGES.map((stage) => (
            <span className="self-end pb-0.5 text-center text-[0.6875rem] font-medium text-text-secondary" key={stage} role="columnheader">
              {stage}
            </span>
          ))}
          <span className="self-end pb-0.5 text-right text-[0.6875rem] font-medium text-text-secondary" role="columnheader">
            Total
          </span>
        </div>

        {data.map((row, rowIndex) => (
          <div className="border-t border-line-subtle" key={row.id} role="row" style={{ display: 'contents' }}>
            <span className="flex items-center py-0.5 pr-2 text-[0.6875rem] leading-tight text-text-secondary" role="rowheader">
              <span className={cn(rowIndex === leaderIndex && 'font-semibold text-text-primary')}>{row.name}</span>
            </span>
            {STAGES.map((stage, stageIndex) => {
              const value = row.counts[stageIndex] ?? null;
              return (
                <span className="flex items-center justify-center py-0.5" key={stage} role="cell">
                  {value === null ? (
                    <span className="inline-flex items-center gap-1 text-text-muted" title="não se aplica">
                      <Ban aria-hidden className="size-3" strokeWidth={1.75} />
                      <span className="sr-only">não se aplica: {row.role} não trabalha {stage}</span>
                    </span>
                  ) : (
                    <span className="font-display text-xs tabular-nums text-text-primary">{formatInt(value)}</span>
                  )}
                </span>
              );
            })}
            <span className="flex items-center justify-end rounded bg-surface-sunken py-0.5 pr-2 font-display text-xs font-semibold tabular-nums text-text-primary">
              {formatInt(rowTotals[rowIndex] ?? 0)}
            </span>
          </div>
        ))}

        <div className="border-t border-line-strong" role="row" style={{ display: 'contents' }}>
          <span className="py-1 text-[0.6875rem] font-semibold text-text-secondary" role="rowheader">
            Total
          </span>
          {colTotals.map((total, stageIndex) => (
            <span
              className="flex items-center justify-center rounded bg-surface-sunken py-1 font-display text-xs font-semibold tabular-nums text-text-primary"
              key={STAGES[stageIndex]}
            >
              {formatInt(total)}
            </span>
          ))}
          <span className="flex items-center justify-end rounded bg-surface-sunken py-1 pr-2 font-display text-sm font-semibold tabular-nums text-text-primary">
            {formatInt(grandTotal)}
          </span>
        </div>
      </div>

      <p aria-hidden className="shrink-0 text-[0.6875rem] leading-snug text-text-muted">
        <Ban aria-hidden className="mr-1 inline size-3 -translate-y-px" strokeWidth={1.75} /> não se aplica: o papel do
        executivo não cobre a etapa. Uma célula com <span className="font-display tabular-nums">{formatInt(0)}</span>{' '}
        é contagem medida, sem oportunidade aberta ali.
      </p>
    </div>
  );
}
