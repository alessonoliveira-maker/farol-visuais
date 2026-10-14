import { Filter } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type FunnelCells } from './data';

/**
 * Quadrados de células iguais, um por etapa do funil: o lado cresce com a raiz quadrada do total,
 * então a área acompanha o valor e magnitudes distantes cabem lado a lado. Todos os quadrados
 * usam a mesma célula e o mesmo vão, e ficam alinhados pela base; a linha incompleta fica no topo.
 * A comparação de área é aproximada, por isso o número exato vai escrito sob cada quadrado.
 */
export interface FunnelSquaresProps {
  readonly data?: FunnelCells;
  readonly className?: string;
}

/** Lado da célula e vão, em px. O passo (CELL + GAP) é o mesmo em todo quadrado: respiro fixo por célula não distorce a área (GEO-16). */
const CELL = 8;
const GAP = 2;
const FILL_COLOR = 'var(--chart-1)';

/** Células de um total: inteiro mais próximo. Total positivo que arredonda para 0 fica sem célula e é dito no texto. */
function cellsFor(total: number, unit: number): number {
  return Math.max(0, Math.round(total / unit));
}

/** Lado do quadrado em células: o menor inteiro cujo quadrado comporta todas. */
function squareSide(cells: number): number {
  return Math.max(1, Math.ceil(Math.sqrt(cells)));
}

/**
 * Posição de cada célula na grade e ordem de preenchimento a partir do canto inferior esquerdo, linha
 * por linha. O índice do DOM é lido de cima para baixo: a linha de cima é a incompleta, alinhada à
 * esquerda, e as de baixo são cheias. A posição é explícita (gridRow e gridColumn), porque sem ela o
 * auto-posicionamento da grade encheria a primeira linha e deixaria a incompleta na base.
 */
function place(index: number, cells: number, side: number): { readonly row: number; readonly column: number; readonly order: number } {
  const rows = Math.ceil(cells / side);
  const topCount = cells - (rows - 1) * side;
  const row = index < topCount ? 0 : 1 + Math.floor((index - topCount) / side);
  const column = index < topCount ? index : (index - topCount) % side;
  return { row: row + 1, column: column + 1, order: (rows - 1 - row) * side + column };
}

function CellSquare({ cells }: { readonly cells: number }) {
  const side = squareSide(cells);
  const rows = Math.ceil(cells / side);
  return (
    <div
      aria-hidden
      className="grid shrink-0"
      style={{
        gap: GAP,
        gridTemplateColumns: `repeat(${String(side)}, ${String(CELL)}px)`,
        gridTemplateRows: `repeat(${String(rows)}, ${String(CELL)}px)`,
      }}
    >
      {Array.from({ length: cells }, (_, index) => (
        <span
          className="rounded-[1px]"
          key={`cell-${String(index)}`}
          style={{ backgroundColor: FILL_COLOR, gridColumnStart: place(index, cells, side).column, gridRowStart: place(index, cells, side).row }}
        />
      ))}
    </div>
  );
}

export default function FunnelSquares({ data = defaultData, className }: FunnelSquaresProps) {
  const stages = data.stages.map((stage) => ({ ...stage, cells: cellsFor(stage.total, data.unit) }));

  if (stages.length === 0 || data.unit <= 0 || stages.every((stage) => stage.total <= 0)) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma etapa com total neste recorte: não há o que desenhar em células.</span>
      </div>
    );
  }

  const parts = stages.map((stage) => `${formatInt(stage.total)} ${stage.label} em ${formatInt(stage.cells)}`);
  const summary =
    `Quadrados de área proporcional ao total, com 1 célula valendo ${formatInt(data.unit)}, no ${data.period}: ` +
    `${parts.join(', ')} células. Células arredondadas ao inteiro mais próximo.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="img">
      {/* Duas linhas: os quadrados alinhados pela base (self-end) e, abaixo, o texto de cada um (self-start). */}
      <div
        className="grid min-h-0 flex-1 auto-cols-max grid-flow-col justify-start gap-x-8 gap-y-2"
        style={{ gridTemplateRows: 'minmax(0, 1fr) auto' }}
      >
        {stages.flatMap((stage) => [
          <div className="self-end" key={`${stage.id}-square`}>
            <CellSquare cells={stage.cells} />
          </div>,
          <div className="self-start" key={`${stage.id}-text`}>
            <p className="kpi-number text-sm leading-5 font-semibold text-text-primary">
              {formatInt(stage.total)} {stage.label}
            </p>
            <p className="text-xs leading-4 tabular-nums text-text-muted">
              {stage.cells === 0 ? 'menos de 1 célula' : `${formatInt(stage.cells)} ${stage.cells === 1 ? 'célula' : 'células'}`}
            </p>
          </div>,
        ])}
      </div>

      <ul className="flex min-w-0 shrink-0 flex-wrap items-center gap-x-4 gap-y-0.5 text-xs leading-4 text-text-muted">
        <li className="flex items-center gap-2">
          <span aria-hidden className="shrink-0 rounded-[1px]" style={{ backgroundColor: FILL_COLOR, height: CELL, width: CELL }} />
          <span className="tabular-nums">1 célula = {formatInt(data.unit)} por etapa</span>
        </li>
        <li className="tabular-nums">{data.period}. Células arredondadas.</li>
      </ul>
    </figure>
  );
}
