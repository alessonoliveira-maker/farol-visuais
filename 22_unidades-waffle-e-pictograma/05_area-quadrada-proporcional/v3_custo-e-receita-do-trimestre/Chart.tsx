import { Filter } from 'lucide-react';

import { formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CostVsRevenue, type Provenance } from './data';

/**
 * Dois quadrados de blocos iguais, um para o custo e outro para a receita do trimestre. O quadrado
 * da receita tem as primeiras células, as que o custo cobre, no mesmo tom neutro do quadrado do custo,
 * e acende só a diferença: a folga do trimestre. O valor exato e a procedência vão sob cada quadrado.
 */
export interface CostRevenueSquaresProps {
  readonly data?: CostVsRevenue;
  readonly className?: string;
}

/** Lado da célula e vão, em px; o passo é o mesmo nos dois quadrados (GEO-16). */
const CELL = 7;
const GAP = 2;
const PITCH = CELL + GAP;
const COVERED_COLOR = 'var(--text-muted)';
const SURPLUS_COLOR = 'var(--chart-1)';

const PROVENANCE: Record<Provenance, { readonly label: string; readonly tone: string }> = {
  medido: { label: 'MEDIDO', tone: 'text-prov-medido' },
  derivado: { label: 'DERIVADO', tone: 'text-prov-derivado' },
};

function cellsFor(value: number, unit: number): number {
  return Math.max(0, Math.round(value / unit));
}

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

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Quadrado de `cells` células; as `coveredCells` primeiras, a partir da base, em tom neutro e as demais acesas. */
function CellSquare({ cells, coveredCells }: { readonly cells: number; readonly coveredCells: number }) {
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
          style={{
            backgroundColor: place(index, cells, side).order < coveredCells ? COVERED_COLOR : SURPLUS_COLOR,
            gridColumnStart: place(index, cells, side).column, gridRowStart: place(index, cells, side).row,
          }}
        />
      ))}
    </div>
  );
}

function AmountText({ label, value, provenance, cells }: { readonly label: string; readonly value: number; readonly provenance: Provenance; readonly cells: number }) {
  const tag = PROVENANCE[provenance];
  return (
    <div className="self-start">
      <p className="flex items-baseline gap-2">
        <span className="kpi-number text-sm leading-5 font-semibold text-text-primary">{formatCurrencyCompact(value)}</span>
        <span className={cn('text-[0.6875rem] leading-4 font-semibold tracking-wide', tag.tone)}>{tag.label}</span>
      </p>
      <p className="text-xs leading-4 text-text-secondary">{capitalize(label)}</p>
      <p className="text-xs leading-4 tabular-nums text-text-muted">{formatInt(cells)} células</p>
    </div>
  );
}

export default function CostRevenueSquares({ data = defaultData, className }: CostRevenueSquaresProps) {
  if (data.unit <= 0 || (data.cost.value <= 0 && data.revenue.value <= 0)) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum custo nem receita neste recorte: não há blocos para desenhar.</span>
      </div>
    );
  }

  const costCells = cellsFor(data.cost.value, data.unit);
  const revenueCells = cellsFor(data.revenue.value, data.unit);
  const surplusCells = Math.max(0, revenueCells - costCells);
  const revenueSide = squareSide(revenueCells);
  const revenueRows = Math.ceil(revenueCells / revenueSide);
  // Linhas da receita que contêm célula de folga: do topo até a linha onde a primeira acende.
  const surplusRows = surplusCells === 0 ? 0 : revenueRows - Math.floor(costCells / revenueSide);
  const surplusValue = data.revenue.value - data.cost.value;
  const unitText = formatCurrencyCompact(data.unit);

  const summary =
    `Dois quadrados de área proporcional, 1 célula = ${unitText}, no ${data.period}: ${data.cost.label} de ` +
    `${formatCurrencyCompact(data.cost.value)} em ${formatInt(costCells)} células e ${data.revenue.label} de ` +
    `${formatCurrencyCompact(data.revenue.value)} em ${formatInt(revenueCells)}, com folga de ${formatInt(surplusCells)} células.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="img">
      <div
        className="grid min-h-0 flex-1 auto-cols-max grid-flow-col justify-start gap-x-8 gap-y-2"
        style={{ gridTemplateRows: 'minmax(0, 1fr) auto' }}
      >
        <div className="self-end">
          <CellSquare cells={costCells} coveredCells={costCells} />
        </div>
        <AmountText cells={costCells} label={data.cost.label} provenance={data.cost.provenance} value={data.cost.value} />

        <div className="flex items-start gap-3 self-end">
          <CellSquare cells={revenueCells} coveredCells={costCells} />
          {/* Colchete só nas linhas que têm folga acesa; o número é a diferença exata, e as células são a diferença das contagens. */}
          {surplusCells > 0 ? (
            <div className="border-l-2 pl-2" style={{ borderColor: SURPLUS_COLOR, minHeight: surplusRows * PITCH - GAP }}>
              <p className="kpi-number text-sm leading-4 font-bold text-text-primary">Folga de {formatInt(surplusCells)} células</p>
              <p className="text-xs leading-4 tabular-nums text-text-secondary">{formatCurrencyCompact(surplusValue)} acima do custo</p>
            </div>
          ) : (
            <p className="max-w-32 text-xs leading-4 text-text-secondary">Sem folga: o custo cobre toda a receita.</p>
          )}
        </div>
        <AmountText cells={revenueCells} label={data.revenue.label} provenance={data.revenue.provenance} value={data.revenue.value} />
      </div>

      <ul className="flex min-w-0 shrink-0 flex-wrap items-center gap-x-4 gap-y-0.5 text-xs leading-4 text-text-muted">
        <li className="flex items-center gap-2">
          <span aria-hidden className="shrink-0 rounded-[1px]" style={{ backgroundColor: COVERED_COLOR, height: CELL, width: CELL }} />
          <span>coberto pelo custo</span>
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="shrink-0 rounded-[1px]" style={{ backgroundColor: SURPLUS_COLOR, height: CELL, width: CELL }} />
          <span>folga do trimestre</span>
        </li>
        <li className="ml-auto tabular-nums">1 célula = {unitText}; células arredondadas</li>
      </ul>
    </figure>
  );
}
