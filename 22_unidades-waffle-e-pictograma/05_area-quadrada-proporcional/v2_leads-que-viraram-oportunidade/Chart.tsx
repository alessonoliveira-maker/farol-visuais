import { Filter } from 'lucide-react';

import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadConversion } from './data';

/**
 * Um quadrado de células iguais para o total de leads do semestre, com o subconjunto que virou
 * oportunidade aceso a partir do canto inferior esquerdo e o resto apagado. O bloco aceso leva a
 * anotação com o número e a taxa exata; o restante leva a dele. Não há legenda separada: cada
 * anotação diz de qual grupo é o número.
 */
export interface ConversionSquareProps {
  readonly data?: LeadConversion;
  readonly className?: string;
}

/** Lado da célula e vão, em px; o passo é o mesmo em toda a grade (GEO-16). */
const CELL = 12;
const GAP = 2;
const PITCH = CELL + GAP;
const LIT_COLOR = 'var(--chart-1)';
/** Cor do colchete do resto: texto de apoio, porque `--line-strong` não se vê como traço que carrega a relação (ACE-6). */
const REST_BRACKET_COLOR = 'var(--text-muted)';

function cellsFor(total: number, unit: number): number {
  return Math.max(0, Math.round(total / unit));
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

/** Altura em px de `rows` linhas de células, sem o vão depois da última. */
function rowsHeight(rows: number): number {
  return Math.max(0, rows * PITCH - GAP);
}

export default function ConversionSquare({ data = defaultData, className }: ConversionSquareProps) {
  if (data.total <= 0 || data.unit <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há quadrado para acender.</span>
      </div>
    );
  }

  const converted = Math.min(Math.max(data.converted, 0), data.total);
  const totalCells = cellsFor(data.total, data.unit);
  const litCells = Math.min(cellsFor(converted, data.unit), totalCells);
  const side = squareSide(totalCells);
  const rows = Math.ceil(totalCells / side);
  const litRows = Math.ceil(litCells / side);
  const restRows = rows - litRows;
  const rest = data.total - converted;
  const rate = formatRateWithVolume(converted, data.total);

  const summary =
    `Quadrado de ${formatInt(totalCells)} células, cada uma vale ${formatInt(data.unit)} leads, para ${formatInt(data.total)} leads do ${data.period}: ` +
    `${formatInt(litCells)} acesas são as ${formatInt(converted)} oportunidades, ${rate}. ` +
    `Os outros ${formatInt(rest)} leads ficam apagados.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-3', className)} role="img">
      <div className="shrink-0">
        <p className="kpi-number text-sm leading-5 font-semibold text-text-primary">{formatInt(data.total)} leads do semestre</p>
        <p className="text-xs leading-4 tabular-nums text-text-muted">{formatInt(totalCells)} células no quadrado</p>
      </div>

      <div className="flex min-h-0 flex-1 items-end gap-4">
        <div
          aria-hidden
          className="grid shrink-0"
          style={{
            gap: GAP,
            gridTemplateColumns: `repeat(${String(side)}, ${String(CELL)}px)`,
            gridTemplateRows: `repeat(${String(rows)}, ${String(CELL)}px)`,
          }}
        >
          {Array.from({ length: totalCells }, (_, index) => {
            const isLit = place(index, totalCells, side).order < litCells;
            return (
              <span
                className={cn('rounded-[2px]', !isLit && 'border border-line-strong bg-surface-sunken')}
                key={`cell-${String(index)}`}
                style={{
                  ...(isLit ? { backgroundColor: LIT_COLOR } : {}),
                  gridColumnStart: place(index, totalCells, side).column,
                  gridRowStart: place(index, totalCells, side).row,
                }}
              />
            );
          })}
        </div>

        {/* Colunas de anotação com a altura exata do quadrado: o resto no topo e o aceso na base, nas linhas que cada um ocupa. */}
        <div className="flex min-w-0 flex-1 flex-col justify-between" style={{ height: rowsHeight(rows) }}>
          {restRows > 0 ? (
            <div className="flex flex-col justify-start border-l-2 pl-2" style={{ borderColor: REST_BRACKET_COLOR, height: rowsHeight(restRows) }}>
              <p className="text-xs leading-4 text-text-secondary">
                <span className="kpi-number font-medium tabular-nums">{formatInt(rest)}</span> leads sem oportunidade, apagados
              </p>
            </div>
          ) : null}
          {litRows > 0 ? (
            <div className="flex flex-col justify-center border-l-2 pl-2" style={{ borderColor: LIT_COLOR, height: rowsHeight(litRows) }}>
              <p className="kpi-number text-sm leading-5 font-bold text-text-primary">{formatInt(converted)} oportunidades</p>
              <p className="text-xs leading-4 tabular-nums text-text-secondary">{rate}</p>
            </div>
          ) : null}
        </div>
      </div>

      <p className="shrink-0 text-xs leading-4 tabular-nums text-text-muted">
        1 célula = {formatInt(data.unit)} leads; células arredondadas ao inteiro mais próximo.
      </p>
    </figure>
  );
}
