import { Filter, Unplug } from 'lucide-react';

import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QueueData, type QueueRow } from './data';

/**
 * Micro waffles em linha de cartão: por fila, as posições de SDR como unidades reais de 6 px (cheia é
 * ocupada, tracejada é vaga) e a conversão em venda numa grade de 100 com célula de 3 px. No tamanho
 * micro nenhuma unidade é parcial: a taxa é arredondada e escrita por extenso, e a que não chega a um
 * quadrado vira o chip "menos de 1 em 100", com a grade vazia.
 */
export interface QueueWafflesProps {
  readonly data?: QueueData;
  readonly className?: string;
}

const GRID = 10;
const CONVERSION_CELLS = GRID * GRID;
const OCCUPIED_COLOR = 'var(--chart-1)';
const CONVERSION_COLOR = 'var(--chart-3)';

/** Conversão de 0 a 1; `null` sem leads, porque 0 de 0 não é taxa zero (EST-1b). */
function conversionRate(row: QueueRow): number | null {
  if (row.leads === null || row.sales === null || row.leads <= 0) return null;
  return Math.min(Math.max(row.sales / row.leads, 0), 1);
}

/** Quadrados inteiros da grade de 100; `null` sem taxa. Abaixo de 1% fica 0, e o chip diz o motivo. */
function conversionCells(rate: number | null): number | null {
  if (rate === null) return null;
  const exact = Math.min(Math.max(rate, 0), 1) * CONVERSION_CELLS;
  return exact > 0 && exact < 1 ? 0 : Math.round(exact);
}

/** Posição na ordem de preenchimento: coluna a coluna, e dentro da coluna de baixo para cima. */
function fillOrder(row: number, column: number): number {
  return column * GRID + (GRID - 1 - row);
}

function describe(row: QueueRow, positions: number): string {
  const cells = conversionCells(conversionRate(row));
  const seats = row.occupied === null ? 'sem ocupação' : `${formatInt(row.occupied)} de ${formatInt(positions)}`;
  const sale = cells === null ? 'sem conversão' : cells === 0 && (conversionRate(row) ?? 0) > 0 ? 'menos de 1 em 100' : `${formatInt(cells)} em 100`;
  return `${row.label}: ${seats}, ${sale}`;
}

function ConversionGrid({ cells }: { readonly cells: number | null }) {
  if (cells === null) {
    return <div aria-hidden className="size-[39px] shrink-0 rounded-[2px] border border-dashed border-line-strong" />;
  }
  return (
    // grid-rows-10 explícito: sem ele as linhas viram auto e a célula estica com a altura do contêiner.
    <div aria-hidden className="grid size-[39px] shrink-0 grid-cols-10 grid-rows-10 gap-px">
      {Array.from({ length: CONVERSION_CELLS }, (_, index) => {
        const isFilled = fillOrder(Math.floor(index / GRID), index % GRID) < cells;
        return (
          <span
            className={cn('min-h-0 min-w-0 rounded-[1px]', !isFilled && 'bg-line-subtle')}
            key={`cell-${String(index)}`}
            style={isFilled ? { backgroundColor: CONVERSION_COLOR } : undefined}
          />
        );
      })}
    </div>
  );
}

export default function QueueWaffles({ data = defaultData, className }: QueueWafflesProps) {
  if (data.rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma fila neste recorte: não há posições para contar.</span>
      </div>
    );
  }

  const summary = `Gráfico de waffle das filas de SDR, posições ocupadas e conversão em venda. ${data.rows.map((row) => describe(row, data.positions)).join('; ')}.`;

  return (
    <ul aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 list-none flex-col justify-between p-0', className)} role="img">
      {data.rows.map((row) => {
        const rate = conversionRate(row);
        const cells = conversionCells(rate);
        return (
          <li className="flex min-w-0 items-center justify-between gap-3" key={row.id}>
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-5 font-medium text-text-secondary">{row.label}</p>
              {row.occupied === null ? (
                <p className="flex items-center gap-1 text-[0.6875rem] leading-4 text-text-muted">
                  <Unplug aria-hidden className="size-3 shrink-0" />
                  <span className="whitespace-nowrap">ocupação {formatUnavailable()}</span>
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <div aria-hidden className="flex gap-0.5">
                    {Array.from({ length: data.positions }, (_, seat) => (
                      <span
                        className={cn('size-1.5 shrink-0 rounded-[1px]', seat >= (row.occupied ?? 0) && 'border border-dashed border-text-muted')}
                        key={`seat-${String(seat)}`}
                        style={seat < (row.occupied ?? 0) ? { backgroundColor: OCCUPIED_COLOR } : undefined}
                      />
                    ))}
                  </div>
                  <span className="kpi-number whitespace-nowrap text-[0.6875rem] leading-4 text-text-muted">
                    {formatInt(row.occupied)} de {formatInt(data.positions)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ConversionGrid cells={cells} />
              <div className="w-36">
                {cells === null ? (
                  <p className="flex items-center gap-1 text-text-muted">
                    <Unplug aria-hidden className="size-3.5 shrink-0" />
                    <span className="text-xs leading-5">{formatUnavailable()}</span>
                  </p>
                ) : cells === 0 && (rate ?? 0) > 0 ? (
                  <p className="inline-block whitespace-nowrap rounded-[3px] border border-line-strong px-1 text-[0.6875rem] leading-4 text-text-secondary tabular-nums">menos de 1 em 100</p>
                ) : (
                  <p className="kpi-number text-sm leading-5 font-semibold text-text-primary">{`${formatInt(cells)} em 100`}</p>
                )}
                <p className="kpi-number whitespace-nowrap text-[0.6875rem] leading-4 text-text-muted">
                  {rate === null || row.sales === null || row.leads === null
                    ? 'sem base de leads'
                    : `${formatPercent(rate)}: ${formatInt(row.sales)} de ${formatInt(row.leads)} leads`}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
