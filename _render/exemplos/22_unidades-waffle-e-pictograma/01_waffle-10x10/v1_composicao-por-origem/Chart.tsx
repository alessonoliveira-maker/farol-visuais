import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, totalCaption as defaultCaption, type OriginSlice } from './data';

/**
 * Waffle 10 por 10: cada quadrado é 1% do total. A geometria é calculada aqui, em SVG puro, e a
 * divisão em 100 quadrados usa o método do maior resto, para a soma dar sempre 100. O percentual
 * da legenda é a contagem de quadrados, então grade e legenda nunca discordam.
 */
export interface OriginWaffleProps {
  readonly data?: readonly OriginSlice[];
  /** O que o total conta e em que período, escrito depois do número ("oportunidades no trimestre"). */
  readonly caption?: string;
  readonly className?: string;
}

const GRID = 10;
const CELLS = GRID * GRID;
const VIEW = 100;
const GAP = 1.8;
const CELL = (VIEW - GAP * (GRID - 1)) / GRID;
const CELL_RADIUS = 1.2;
/** Ausência de dado: quadrado vazado com contorno em texto neutro (5,2:1 no escuro, 5,4:1 no claro). */
const NEUTRAL_STROKE = 'var(--text-muted)';
/** Em unidades do viewBox: cerca de 1,25 px num cartão de 240 px de altura, escalando com a grade. */
const NEUTRAL_STROKE_WIDTH = 0.55;
/**
 * Ordem de atribuição dos slots quando a categoria não traz o seu (CONTRATO, COR-8): 2 e 4 por
 * último, porque repetem o hex de `--warning` e `--positive`. O teto honesto é 6 (COR-4).
 */
const SLOT_ORDER = [1, 3, 6, 5, 2, 4] as const;

interface Share {
  readonly slice: OriginSlice;
  readonly cells: number;
  readonly color: string | null;
}

function slotColor(slice: OriginSlice, fallbackIndex: number): string {
  // Sem slot, vale a ordem de ENTRADA do dado, nunca a do ranking: trocar o período não troca a cor.
  const slot = slice.slot ?? SLOT_ORDER[Math.min(fallbackIndex, SLOT_ORDER.length - 1)] ?? 1;
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** Distribui 100 quadrados pelo maior resto: arredonda para baixo e entrega o que falta a quem tem a maior sobra. */
function toShares(slices: readonly OriginSlice[]): Share[] {
  const ordered = [...slices].sort((a, b) => Number(a.neutral ?? false) - Number(b.neutral ?? false) || b.count - a.count);
  const total = ordered.reduce((sum, slice) => sum + slice.count, 0);
  if (total <= 0) return [];
  const raw = ordered.map((slice) => (slice.count / total) * CELLS);
  const cells = raw.map(Math.floor);
  let missing = CELLS - cells.reduce((sum, value) => sum + value, 0);
  const byRemainder = raw.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest);
  for (const { index } of byRemainder) {
    if (missing <= 0) break;
    cells[index] = (cells[index] ?? 0) + 1;
    missing -= 1;
  }
  return ordered.map((slice, index) => ({
    slice,
    cells: cells[index] ?? 0,
    color: slice.neutral ? null : slotColor(slice, slices.indexOf(slice)),
  }));
}

export default function OriginWaffle({ data = defaultData, caption = defaultCaption, className }: OriginWaffleProps) {
  const shares = toShares(data);
  const total = data.reduce((sum, slice) => sum + slice.count, 0);

  if (shares.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum registro neste recorte: a composição não tem o que dividir.</span>
      </div>
    );
  }

  const cellColors = shares.flatMap((share) => Array.from({ length: share.cells }, () => share.color));
  const leader = shares.find((share) => !share.slice.neutral);

  const summary = [
    `Gráfico de waffle: ${formatInt(total)} ${caption}, em 100 quadrados de 1% cada.`,
    leader ? `${leader.slice.label} lidera com ${formatInt(leader.cells)} de cada 100.` : '',
    ...shares.map((share) => `${share.slice.label}: ${formatPercent(share.cells / CELLS, 0)} (${formatInt(share.slice.count)}).`),
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <figure aria-label={summary} className={cn('@container m-0 h-full w-full min-w-0', className)} role="figure">
      <div className="flex h-full min-h-0 flex-col gap-4 @sm:flex-row @sm:items-center @sm:gap-7">
        <svg
          aria-hidden
          className="aspect-square max-h-full w-full max-w-56 shrink-0 @sm:h-full @sm:w-auto @sm:max-w-none"
          viewBox={`0 0 ${String(VIEW)} ${String(VIEW)}`}
        >
          {cellColors.map((color, index) => {
            const x = (index % GRID) * (CELL + GAP);
            const y = Math.floor(index / GRID) * (CELL + GAP);
            const key = `cell-${String(index)}`;
            if (color === null) {
              const inset = NEUTRAL_STROKE_WIDTH / 2;
              return (
                <rect
                  fill="none"
                  height={CELL - inset * 2}
                  key={key}
                  rx={CELL_RADIUS}
                  stroke={NEUTRAL_STROKE}
                  strokeWidth={NEUTRAL_STROKE_WIDTH}
                  width={CELL - inset * 2}
                  x={x + inset}
                  y={y + inset}
                />
              );
            }
            return <rect fill={color} height={CELL} key={key} rx={CELL_RADIUS} width={CELL} x={x} y={y} />;
          })}
        </svg>

        <div className="min-w-0 flex-1">
          <p className="text-xs leading-5 text-text-muted">
            <span className="kpi-number text-sm leading-none font-semibold text-text-primary">{formatInt(total)}</span> {caption}
          </p>
          <p className="text-xs leading-5 text-text-muted">cada quadrado é 1% do total</p>
          <ul className="space-y-2.5 pt-4">
            {shares.map((share) => (
              <li className="flex min-w-0 items-center gap-2.5 leading-5" key={share.slice.id}>
                <span
                  aria-hidden
                  className={cn('size-3 shrink-0 rounded-[3px]', share.color === null && 'border-[1.5px] border-text-muted')}
                  style={share.color === null ? undefined : { backgroundColor: share.color }}
                />
                <span className={cn('min-w-0 flex-1 truncate text-xs leading-5', share.slice.neutral ? 'text-text-muted' : 'text-text-secondary')}>
                  {share.slice.label}
                </span>
                <span className="kpi-number w-10 shrink-0 text-right text-sm leading-5 font-semibold text-text-primary">
                  {formatPercent(share.cells / CELLS, 0)}
                </span>
                <span className="kpi-number w-7 shrink-0 text-right text-xs leading-5 text-text-muted">{formatInt(share.slice.count)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </figure>
  );
}
