import { Filter, Flag, Unplug } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';

import { formatCurrencyCompact, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  ABC_CRITERIA,
  data as defaultData,
  XYZ_CRITERIA,
  type AbcClass,
  type PortfolioCell,
  type XyzClass,
} from './data';

/**
 * Matriz agregada 3x3 da carteira em ABC (receita) e XYZ (previsibilidade). Cada célula é um botão
 * com a contagem de contas, a soma da receita e a participação no total. As zonas diagonais pela
 * soma dos índices vão em três tons baixos da rampa, e a célula A e Z leva contorno: receita alta
 * que só entra no forecast como faixa. O tamanho das células é igual, e não mede nada.
 */
export interface AbcXyzMatrixProps {
  readonly data?: readonly PortfolioCell[];
  readonly height?: number;
  readonly className?: string;
}

const LABEL_W = 84;
const GAP = 8;
const CELL_MIN_H = 64;
const GRID_COLS = 3;
const ROWS_TEMPLATE = `repeat(3, minmax(${String(CELL_MIN_H)}px, 1fr))`;
/** A e Z: receita alta com previsão ruim, que o forecast trata como faixa e não como ponto. */
const FORECAST_CELL = { abc: 'A', xyz: 'Z' } as const;

/**
 * Zona pela soma dos índices (A e X valem 0): de 0 a 1 proteger, 2 gerir, 3 ou mais revisar.
 * Só os três degraus baixos da rampa, onde `--text-primary` passa de 4,5:1 nos dois temas.
 */
const ZONES = [
  { id: 'protect', label: 'Proteger', color: 'var(--seq-3)' },
  { id: 'manage', label: 'Gerir', color: 'var(--seq-2)' },
  { id: 'review', label: 'Revisar', color: 'var(--seq-1)' },
] as const;

function zoneOf(rowIndex: number, columnIndex: number): (typeof ZONES)[number] {
  const sum = rowIndex + columnIndex;
  return sum <= 1 ? ZONES[0] : sum === 2 ? ZONES[1] : ZONES[2];
}

/** Participação inteira que soma 100, pelo maior resto (NUM-2). Célula sem receita medida fica de fora. */
function sharesOf(values: readonly (number | null)[]): readonly (number | null)[] {
  const total = values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  if (total <= 0) return values.map(() => null);
  const parts = values.map((value, index) => {
    const exact = ((value ?? 0) / total) * 100;
    return { index, floor: Math.floor(exact), rest: exact - Math.floor(exact), measured: value !== null };
  });
  let missing = 100 - parts.reduce((sum, part) => sum + part.floor, 0);
  for (const part of parts.filter((p) => p.measured).sort((a, b) => b.rest - a.rest || a.index - b.index)) {
    if (missing <= 0) break;
    part.floor += 1;
    missing -= 1;
  }
  return parts.map((part) => (part.measured ? part.floor : null));
}

const ABC_IDS: readonly AbcClass[] = ['A', 'B', 'C'];
const XYZ_IDS: readonly XyzClass[] = ['X', 'Y', 'Z'];

export default function AbcXyzMatrix({ data = defaultData, height, className }: AbcXyzMatrixProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma conta neste recorte: a matriz não tem o que classificar.</span>
      </div>
    );
  }

  const slots = ABC_IDS.flatMap((abc) => XYZ_IDS.map((xyz) => data.find((cell) => cell.abc === abc && cell.xyz === xyz)));
  const shares = sharesOf(slots.map((cell) => cell?.revenue ?? null));
  const totalAccounts = data.reduce((sum, cell) => sum + cell.accounts, 0);
  const totalRevenue = data.reduce((sum, cell) => sum + (cell.revenue ?? 0), 0);
  const forecastIndex = ABC_IDS.indexOf(FORECAST_CELL.abc) * GRID_COLS + XYZ_IDS.indexOf(FORECAST_CELL.xyz);
  const forecast = slots[forecastIndex];
  const forecastShare = shares[forecastIndex] ?? null;

  const summary =
    `Matriz de três por três com ${formatInt(totalAccounts)} contas por receita (ABC) e previsibilidade mensal (XYZ), somando ${formatCurrencyCompact(totalRevenue)}. ` +
    (forecast !== undefined && forecastShare !== null
      ? `A célula A e Z reúne ${formatInt(forecast.accounts)} contas e ${formatPercent(forecastShare / 100, 0)} da receita, e entra no forecast como faixa.`
      : 'A célula A e Z não tem receita medida.');

  /** Setas movem o foco entre células; o resto da matriz tem um só tabIndex 0 (roving). */
  function onKeyDown(event: KeyboardEvent, index: number) {
    const row = Math.floor(index / GRID_COLS);
    const column = index % GRID_COLS;
    const next =
      event.key === 'ArrowRight' ? [row, column + 1] : event.key === 'ArrowLeft' ? [row, column - 1] : event.key === 'ArrowDown' ? [row + 1, column] : event.key === 'ArrowUp' ? [row - 1, column] : null;
    if (next === null) return;
    const [nextRow = row, nextColumn = column] = next;
    if (nextRow < 0 || nextRow >= ABC_IDS.length || nextColumn < 0 || nextColumn >= GRID_COLS) return;
    event.preventDefault();
    const target = nextRow * GRID_COLS + nextColumn;
    setActive(target);
    refs.current[target]?.focus();
  }

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col gap-1.5', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="shrink-0 text-[11px] leading-snug text-text-muted">
        Cortes fixos de negócio, não por quantil.
      </p>

      <div
        className="grid min-h-0 flex-1"
        style={{ gridTemplateColumns: `${String(LABEL_W)}px 1fr`, gridTemplateRows: 'auto auto 1fr', columnGap: GAP }}
      >
        <div />
        <div className="flex items-center gap-1 pb-1 text-[11px] font-medium text-text-muted">
          <span>Previsibilidade mensal, da maior para a menor</span>
        </div>

        <div className="flex flex-col items-start text-[11px] font-medium leading-tight text-text-muted">
          <span>Receita</span>
          <span className="font-normal">da maior para a menor</span>
        </div>
        <div className="grid grid-cols-3 gap-px px-px pb-1 text-center">
          {XYZ_CRITERIA.map((column) => (
            <span className="flex flex-col" key={column.id}>
              <span className="text-xs font-semibold text-text-primary">{column.label}</span>
              <span className="text-[11px] text-text-muted">{column.criterion}</span>
            </span>
          ))}
        </div>

        <div className="grid gap-px py-px" style={{ gridTemplateRows: ROWS_TEMPLATE }}>
          {ABC_CRITERIA.map((row) => (
            <span className="flex flex-col justify-center text-right" key={row.id}>
              <span className="text-xs font-semibold text-text-primary">{row.label}</span>
              <span className="text-[11px] leading-tight text-text-muted">{row.criterion}</span>
            </span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-px bg-line-subtle p-px" style={{ gridTemplateRows: ROWS_TEMPLATE }} role="group" aria-label="Células da carteira">
          {slots.map((cell, index) => {
            const rowIndex = Math.floor(index / GRID_COLS);
            const columnIndex = index % GRID_COLS;
            const abc = ABC_IDS[rowIndex] ?? 'A';
            const xyz = XYZ_IDS[columnIndex] ?? 'X';
            const zone = zoneOf(rowIndex, columnIndex);
            const share = shares[index] ?? null;
            const isForecast = index === forecastIndex;
            const label =
              cell === undefined
                ? `${abc} e ${xyz}: sem medição`
                : `${abc} e ${xyz}, zona ${zone.label.toLowerCase()}: ${formatInt(cell.accounts)} contas` +
                  (cell.revenue === null ? ', receita sem medição' : `, ${formatCurrencyCompact(cell.revenue)}, ${formatPercent((share ?? 0) / 100, 0)} da receita`) +
                  (isForecast ? ', entra no forecast como faixa' : '');
            return (
              <button
                aria-label={label}
                className={cn(
                  'flex min-w-0 flex-col justify-center px-2 py-1 text-left text-text-primary',
                  isForecast && 'ring-2 ring-inset ring-text-primary',
                )}
                key={`${abc}${xyz}`}
                onClick={() => setActive(index)}
                onFocus={() => setActive(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                ref={(node) => {
                  refs.current[index] = node;
                }}
                style={{ backgroundColor: zone.color }}
                tabIndex={index === active ? 0 : -1}
                type="button"
              >
                {cell === undefined ? (
                  <span className="flex items-center gap-1 text-[11px]">
                    <Unplug aria-hidden className="size-3 shrink-0" />
                    {formatUnavailable()}
                  </span>
                ) : (
                  <>
                    <span className="flex items-baseline gap-1">
                      <span className="kpi-number text-lg font-semibold">{formatInt(cell.accounts)}</span>
                      <span className="text-[11px]">{cell.accounts === 1 ? 'conta' : 'contas'}</span>
                      {isForecast ? <Flag aria-hidden className="ml-auto size-3 shrink-0 self-center" /> : null}
                    </span>
                    <span className="font-display text-xs tabular-nums">
                      {cell.revenue === null ? formatUnavailable() : formatCurrencyCompact(cell.revenue)}
                    </span>
                    <span className="font-display text-[11px] tabular-nums">
                      {share === null ? '' : `${formatPercent(share / 100, 0)} da receita`}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-text-muted">
        <span>Zona pela soma dos índices:</span>
        {ZONES.map((zone) => (
          <span className="flex items-center gap-1" key={zone.id}>
            <span className="size-3 shrink-0" style={{ backgroundColor: zone.color }} />
            {zone.label}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <Flag aria-hidden className="size-3 shrink-0" />
          entra no forecast como faixa
        </span>
      </p>
    </figure>
  );
}
