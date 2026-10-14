import { Filter, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QuarterTotal, type QuarterTotals } from './data';

/**
 * Quadrados de células iguais para totais que a área ainda compara, e outra forma para os que ela
 * não compara. O componente confere a razão entre o maior e o menor total: a partir de
 * RATIO_LIMIT o menor viraria uma célula e passa a número com barra, com o motivo escrito. Saldo
 * negativo não tem área e sai com o sinal de menos; total indisponível escreve o rótulo de ausência.
 */
export interface AreaLimitSquaresProps {
  readonly data?: QuarterTotals;
  readonly className?: string;
}

/** Lado da célula e vão, em px; o passo é o mesmo em todo quadrado (GEO-16). */
const CELL = 6;
const GAP = 2;
/** Razão entre o maior e o menor total a partir da qual a área deixa de comparar. */
const RATIO_LIMIT = 100;
/** Largura da trilha da barra, em px, que representa o maior total. */
const BAR_TRACK = 144;
/** Piso da barra, em px: sem ele 0,5% da trilha (0,7 px) sumiria. O valor escrito é o exato. */
const BAR_MIN = 2;

/** Cor por slot categórico, escrita por extenso: o check só reconhece token literal, não montado por template. */
const SLOT_COLORS: Readonly<Record<number, string>> = {
  1: 'var(--chart-1)',
  2: 'var(--chart-2)',
  3: 'var(--chart-3)',
  4: 'var(--chart-4)',
  5: 'var(--chart-5)',
  6: 'var(--chart-6)',
};

function slotColor(slot: number): string {
  return SLOT_COLORS[slot] ?? 'var(--text-muted)';
}

type Kind = 'square' | 'bar' | 'negative' | 'zero' | 'unavailable';

interface Classified {
  readonly total: QuarterTotal;
  readonly kind: Kind;
  readonly cells: number;
  /** Maior total dividido por este; `null` quando não há razão (sem valor positivo). */
  readonly ratio: number | null;
}

/** Maior total positivo; `null` quando nenhum total é positivo (EST-1b). */
function largestPositive(totals: readonly QuarterTotal[]): number | null {
  const positives = totals.flatMap((total) => (total.value !== null && total.value > 0 ? [total.value] : []));
  return positives.length === 0 ? null : Math.max(...positives);
}

function classify(totals: readonly QuarterTotal[], unit: number): readonly Classified[] {
  const largest = largestPositive(totals);
  return totals.map((total): Classified => {
    const { value } = total;
    if (value === null) return { total, kind: 'unavailable', cells: 0, ratio: null };
    if (value < 0) return { total, kind: 'negative', cells: 0, ratio: null };
    if (value === 0 || largest === null) return { total, kind: 'zero', cells: 0, ratio: null };
    const ratio = largest / value;
    const cells = Math.max(0, Math.round(value / unit));
    return { total, kind: ratio >= RATIO_LIMIT ? 'bar' : 'square', cells, ratio };
  });
}

function squareSide(cells: number): number {
  return Math.max(1, Math.ceil(Math.sqrt(cells)));
}

/**
 * Posição de cada célula na grade: o índice do DOM é lido de cima para baixo, com a linha incompleta
 * no topo, alinhada à esquerda. A posição é explícita (gridRow e gridColumn), porque sem ela o
 * auto-posicionamento da grade encheria a primeira linha e deixaria a incompleta na base.
 */
function place(index: number, cells: number, side: number): { readonly row: number; readonly column: number } {
  const rows = Math.ceil(cells / side);
  const topCount = cells - (rows - 1) * side;
  const row = index < topCount ? 0 : 1 + Math.floor((index - topCount) / side);
  const column = index < topCount ? index : (index - topCount) % side;
  return { row: row + 1, column: column + 1 };
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function CellSquare({ cells, color }: { readonly cells: number; readonly color: string }) {
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
        <span className="rounded-[1px]" key={`cell-${String(index)}`} style={{ backgroundColor: color, gridColumnStart: place(index, cells, side).column, gridRowStart: place(index, cells, side).row }} />
      ))}
    </div>
  );
}

/** Linha da coluna de fora do desenho: número com barra, saldo negativo, zero ou ausência. */
function ExceptionRow({ item, largest }: { readonly item: Classified; readonly largest: number | null }) {
  const { total, kind, ratio } = item;
  const value = total.value;
  return (
    <li className="min-w-0">
      <p className="text-xs leading-4 text-text-secondary">{capitalize(total.label)}</p>
      {kind === 'unavailable' ? (
        <p className="flex items-center gap-2 text-sm leading-5 text-text-muted">
          <Unplug aria-hidden className="size-4 shrink-0" />
          <span>{formatUnavailable()}</span>
        </p>
      ) : (
        <p className="flex items-baseline gap-2">
          <span className={cn('kpi-number shrink-0 text-sm leading-5 font-semibold whitespace-nowrap', kind === 'negative' ? 'text-negative' : 'text-text-primary')}>
            {value === null ? '' : formatCurrencyCompact(value)}
          </span>
          <span className="text-xs leading-4 text-text-muted">
            {kind === 'negative' ? 'saldo negativo: área não tem sinal' : null}
            {kind === 'zero' ? 'zero medido: sem área para desenhar' : null}
            {kind === 'bar' && ratio !== null ? `${formatInt(Math.round(ratio))} vezes menor que o maior total` : null}
          </span>
        </p>
      )}
      {kind === 'bar' && value !== null && largest !== null ? (
        <div aria-hidden className="mt-1 h-2 border border-line-strong bg-surface-sunken" style={{ width: BAR_TRACK }}>
          <div className="h-full" style={{ backgroundColor: slotColor(total.slot), width: Math.max(BAR_MIN, (value / largest) * BAR_TRACK) }} />
        </div>
      ) : null}
    </li>
  );
}

export default function AreaLimitSquares({ data = defaultData, className }: AreaLimitSquaresProps) {
  const items = classify(data.totals, data.unit);
  const squares = items.filter((item) => item.kind === 'square');
  const outside = items.filter((item) => item.kind !== 'square');
  const largest = largestPositive(data.totals);

  if (data.unit <= 0 || items.length === 0 || largest === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum total positivo neste recorte: a área não tem o que comparar.</span>
      </div>
    );
  }

  const ratios = items.flatMap((item) => (item.ratio === null ? [] : [item.ratio]));
  const widest = ratios.length === 0 ? null : Math.max(...ratios);
  const barItems = items.filter((item) => item.kind === 'bar');
  const reason =
    widest === null
      ? ''
      : widest >= RATIO_LIMIT
        ? `Maior contra menor: ${formatInt(Math.round(widest))} para um, acima do limite de ${formatInt(RATIO_LIMIT)}. O menor vai em número com barra.`
        : `Maior contra menor: ${formatInt(Math.round(widest))} para um, dentro do limite de ${formatInt(RATIO_LIMIT)}. Todos cabem em quadrado.`;

  const unitText = formatCurrencyCompact(data.unit);
  const sentenceParts = [
    `${squares.map((item) => `${item.total.label} em ${formatInt(item.cells)}`).join(' e ')} células`,
    ...barItems.map((item) => `${item.total.label}, ${formatInt(Math.round(item.ratio ?? 0))} vezes menor, em barra`),
    ...outside.filter((item) => item.kind === 'negative').map((item) => `${item.total.label} negativo`),
    ...outside.filter((item) => item.kind === 'unavailable').map((item) => `${item.total.label} ${formatUnavailable()}`),
  ];
  const summary = `Área proporcional, 1 célula = ${unitText}: ${sentenceParts.join('; ')}.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="img">
      <p aria-hidden className="shrink-0 text-xs leading-4 text-text-secondary">{reason}</p>

      <div className="flex min-h-0 flex-1 items-start gap-8">
        <div
          className="grid min-h-0 shrink-0 auto-cols-max grid-flow-col justify-start gap-x-6 gap-y-2"
          style={{ gridTemplateRows: 'minmax(0, 1fr) auto' }}
        >
          {squares.flatMap((item) => [
            <div className="self-end" key={`${item.total.id}-square`}>
              <CellSquare cells={item.cells} color={slotColor(item.total.slot)} />
            </div>,
            <div className="self-start" key={`${item.total.id}-text`}>
              <p className="kpi-number text-sm leading-5 font-semibold text-text-primary">{formatCurrencyCompact(item.total.value ?? 0)}</p>
              <p className="text-xs leading-4 text-text-secondary">{capitalize(item.total.label)}</p>
              <p className="text-xs leading-4 tabular-nums text-text-muted">{formatInt(item.cells)} células</p>
            </div>,
          ])}
        </div>

        <ul className="flex min-w-0 flex-1 flex-col gap-3">
          {outside.map((item) => (
            <ExceptionRow item={item} key={item.total.id} largest={largest} />
          ))}
        </ul>
      </div>

      <p className="flex shrink-0 items-center gap-2 text-xs leading-4 tabular-nums text-text-muted">
        <span aria-hidden className="shrink-0 rounded-[1px] border border-text-muted" style={{ height: CELL, width: CELL }} />
        <span>1 célula = {unitText}</span>
      </p>
    </figure>
  );
}
