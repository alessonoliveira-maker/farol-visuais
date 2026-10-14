import { useState } from 'react';
import { Filter, User } from 'lucide-react';

import { formatInt, formatPercent } from '@/lib/format';
import { seriesColor } from '@/components/visuals/charts/chartTheme';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type NewClientOrigin } from './data';

/**
 * Pictograma isotype de 100 figuras: cada figura vale 1% dos clientes novos, as categorias ocupam
 * blocos contíguos pela mesma ordem do waffle, e a frase em destaque diz a taxa em linguagem de conselho.
 */
export interface IndicationPictogramProps {
  readonly data?: readonly NewClientOrigin[];
  readonly highlightId?: string;
  readonly className?: string;
}

const GRID = 10;
const CELLS = GRID * GRID;
const CELL_PX = 20;
const ICON_STROKE = 2.5;
const NEUTRAL_COLOR = 'var(--text-muted)';
const DIMMED_COLOR = 'var(--line-strong)';
const PER_GROUP = 10;

function categoryColor(origin: NewClientOrigin): string {
  return origin.isUndeclared === true || origin.slot === undefined ? NEUTRAL_COLOR : seriesColor(origin.slot - 1);
}

/** Figuras por categoria pelo maior resto, para a matriz fechar em 100; `null` sem clientes (EST-1b). */
function largestRemainder(values: readonly number[]): number[] | null {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return null;
  const exact = values.map((value) => (value / total) * CELLS);
  const counts = exact.map((value) => Math.floor(value));
  const missing = CELLS - counts.reduce((sum, count) => sum + count, 0);
  exact
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index)
    .slice(0, missing)
    .forEach(({ index }) => {
      counts[index] = (counts[index] ?? 0) + 1;
    });
  return counts;
}

/** Posição da figura na ordem de preenchimento: coluna a coluna, e dentro da coluna de baixo para cima. */
function fillOrder(row: number, column: number): number {
  return column * GRID + (GRID - 1 - row);
}

export default function IndicationPictogram({
  data = defaultData,
  highlightId = defaultHighlightId,
  className,
}: IndicationPictogramProps) {
  const [focusId, setFocusId] = useState<string | null>(null);
  const counts = largestRemainder(data.map((origin) => origin.clients));

  if (counts === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cliente novo neste recorte: a matriz não tem o que dividir.</span>
      </div>
    );
  }

  const owners = data.flatMap((origin, index) => Array.from({ length: counts[index] ?? 0 }, () => origin));
  const total = data.reduce((sum, origin) => sum + origin.clients, 0);
  const highlightIndex = Math.max(
    0,
    data.findIndex((origin) => origin.id === highlightId),
  );
  const highlight = data[highlightIndex];
  const highlightSquares = counts[highlightIndex] ?? 0;
  const perGroup = Math.round((highlightSquares / CELLS) * PER_GROUP);
  const approx = (highlightSquares * PER_GROUP) % CELLS === 0 ? '' : 'cerca de ';
  const summary =
    `Pictograma de ${formatInt(CELLS)} figuras que resume ${formatInt(total)} clientes novos do ano: ` +
    `${approx}${formatInt(perGroup)} em cada ${formatInt(PER_GROUP)} chegaram por ${highlight?.name.toLowerCase() ?? ''}, ` +
    `${formatInt(highlightSquares)} figuras de ${formatInt(CELLS)}.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col justify-between gap-3', className)} role="figure">
      <div className="flex min-h-0 items-start gap-5">
        <div
          aria-hidden
          className="grid shrink-0 gap-0.5"
          style={{ gridTemplateColumns: `repeat(${String(GRID)}, ${String(CELL_PX)}px)`, gridTemplateRows: `repeat(${String(GRID)}, ${String(CELL_PX)}px)` }}
        >
          {Array.from({ length: CELLS }, (_, index) => {
            const owner = owners[fillOrder(Math.floor(index / GRID), index % GRID)];
            const lit = focusId === null || owner?.id === focusId;
            return (
              <span className="flex items-center justify-center" key={`cell-${String(index)}`}>
                <User
                  aria-hidden
                  className="size-[18px] shrink-0 motion-safe:transition-colors motion-safe:duration-150"
                  strokeWidth={ICON_STROKE}
                  style={{ color: owner !== undefined && lit ? categoryColor(owner) : DIMMED_COLOR }}
                />
              </span>
            );
          })}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <p className="font-display m-0 text-2xl leading-8 font-semibold text-text-primary">
              {approx}
              {formatInt(perGroup)} em cada {formatInt(PER_GROUP)}
            </p>
            <p className="m-0 text-xs leading-5 text-text-secondary">
              dos {formatInt(total)} clientes novos do ano chegaram por {highlight?.name.toLowerCase() ?? ''}
            </p>
          </div>

          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {data.map((origin, index) => (
              <li key={origin.id}>
                {/* Foco e mouse na legenda acendem a categoria; o apagado usa --line-strong, não alfa (ACE-5). */}
                <button
                  className="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-[2px] border-0 bg-transparent p-0 text-left outline-offset-2"
                  onBlur={() => setFocusId(null)}
                  onFocus={() => setFocusId(origin.id)}
                  onMouseEnter={() => setFocusId(origin.id)}
                  onMouseLeave={() => setFocusId(null)}
                  type="button"
                >
                  <User aria-hidden className="size-4 shrink-0" strokeWidth={ICON_STROKE} style={{ color: categoryColor(origin) }} />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-xs leading-4', origin.id === highlightId ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                      {origin.name}
                    </span>
                    <span className="block text-xs leading-4 text-text-muted tabular-nums">{formatInt(origin.clients)} clientes</span>
                  </span>
                  <span className={cn('font-display w-10 shrink-0 text-right text-sm tabular-nums', origin.id === highlightId ? 'font-bold text-text-primary' : 'font-semibold text-text-secondary')}>
                    {formatPercent((counts[index] ?? 0) / CELLS, 0)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="m-0 flex items-center gap-4 text-xs leading-5 text-text-muted">
        <span className="tabular-nums">
          {formatInt(1)} figura = {formatInt(1)} de cada {formatInt(CELLS)}
        </span>
        <span className="font-display ml-auto tabular-nums">n = {formatInt(total)} clientes</span>
      </p>
    </figure>
  );
}
