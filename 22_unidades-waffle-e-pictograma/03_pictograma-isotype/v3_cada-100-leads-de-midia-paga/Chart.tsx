import { Filter, User } from 'lucide-react';

import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PaidLeadFunnel } from './data';

/**
 * Pictograma isotype de 100 figuras com três níveis aninhados: quem tem telefone contém quem qualificou,
 * que contém quem chegou à agenda. Os níveis nascem do mesmo canto, então a matriz se lê como um funil.
 */
export interface PaidFunnelPictogramProps {
  readonly data?: PaidLeadFunnel;
  readonly className?: string;
}

const GRID = 10;
const CELLS = GRID * GRID;
const CELL_PX = 16;
const ICON_STROKE = 2.5;
const INDENT_PX = 12;
const EMPTY_COLOR = 'var(--line-strong)';
const LEVEL_COLORS = ['var(--seq-5)', 'var(--seq-7)', 'var(--chart-1)'] as const;

interface Level {
  readonly key: string;
  readonly label: string;
  readonly figures: number;
  readonly leads: number;
  /** Só o nível final é figura cheia; os outros ficam em contorno (segundo canal além da cor). */
  readonly solid: boolean;
  readonly color: string;
}

/** Figuras inteiras de 100 para uma contagem; `null` sem base, porque 0 de 0 não é taxa (EST-1b). */
function figuresOf(count: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.round((Math.min(Math.max(count, 0), total) / total) * CELLS);
}

/** Posição da figura na ordem de preenchimento: coluna a coluna, e dentro da coluna de baixo para cima. */
function fillOrder(row: number, column: number): number {
  return column * GRID + (GRID - 1 - row);
}

export default function PaidFunnelPictogram({ data = defaultData, className }: PaidFunnelPictogramProps) {
  const phone = figuresOf(data.withPhone, data.total);
  const qualified = figuresOf(data.qualified, data.total);
  const scheduled = figuresOf(data.scheduled, data.total);

  if (phone === null || qualified === null || scheduled === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead de mídia paga neste recorte: a matriz não tem o que dividir.</span>
      </div>
    );
  }

  // Cada nível cabe dentro do anterior, mesmo se o arredondamento empurrar um para fora.
  const phoneFigures = phone;
  const qualifiedFigures = Math.min(qualified, phoneFigures);
  const scheduledFigures = Math.min(scheduled, qualifiedFigures);
  const levels: readonly Level[] = [
    { key: 'phone', label: 'têm telefone', figures: phoneFigures, leads: data.withPhone, solid: false, color: LEVEL_COLORS[0] },
    { key: 'qualified', label: 'desses, qualificam', figures: qualifiedFigures, leads: data.qualified, solid: false, color: LEVEL_COLORS[1] },
    { key: 'scheduled', label: 'desses, agendam', figures: scheduledFigures, leads: data.scheduled, solid: true, color: LEVEL_COLORS[2] },
  ];
  const withoutPhone = CELLS - phoneFigures;
  const wonPer100 = (data.won / data.total) * CELLS;
  const summary =
    `Pictograma de ${formatInt(CELLS)} figuras que resume ${formatInt(data.total)} leads de mídia paga do ${data.period}: ` +
    `em cada ${formatInt(CELLS)}, ${formatInt(withoutPhone)} não têm telefone e ${formatInt(phoneFigures)} têm; desses ${formatInt(phoneFigures)}, ` +
    `${formatInt(qualifiedFigures)} qualificam e, desses, ${formatInt(scheduledFigures)} chegam à agenda; a venda é de ${formatDecimal(wonPer100, 1)} em ${formatInt(CELLS)}.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col justify-between gap-2', className)} role="figure">
      <div className="flex min-h-0 items-start gap-6">
        <div
          aria-hidden
          className="grid shrink-0 gap-0.5"
          style={{ gridTemplateColumns: `repeat(${String(GRID)}, ${String(CELL_PX)}px)`, gridTemplateRows: `repeat(${String(GRID)}, ${String(CELL_PX)}px)` }}
        >
          {Array.from({ length: CELLS }, (_, index) => {
            const order = fillOrder(Math.floor(index / GRID), index % GRID);
            // O nível mais avançado que contém a posição pinta a figura: a lista vai do mais amplo ao mais estreito.
            const level = [...levels].reverse().find((candidate) => order < candidate.figures);
            return (
              <span className="flex items-center justify-center" key={`cell-${String(index)}`}>
                <User
                  aria-hidden
                  className="size-3.5 shrink-0"
                  fill={level?.solid === true ? 'currentColor' : 'none'}
                  strokeWidth={ICON_STROKE}
                  style={{ color: level?.color ?? EMPTY_COLOR }}
                />
              </span>
            );
          })}
        </div>

        <ul aria-hidden className="m-0 flex min-w-0 flex-1 list-none flex-col gap-2 p-0">
          <li className="flex items-center gap-2">
            <User aria-hidden className="size-4 shrink-0" fill="none" strokeWidth={ICON_STROKE} style={{ color: EMPTY_COLOR }} />
            <span className="font-display w-8 shrink-0 text-right text-xl leading-7 font-semibold text-text-primary tabular-nums">
              {formatInt(withoutPhone)}
            </span>
            <span className="min-w-0 flex-1 text-xs leading-5 text-text-secondary">não têm telefone</span>
            <span className="shrink-0 text-xs leading-5 text-text-muted tabular-nums">{formatInt(data.total - data.withPhone)} leads</span>
          </li>
          {levels.map((level, depth) => (
            <li className="flex items-center gap-2" key={level.key} style={{ paddingLeft: `${String(depth * INDENT_PX)}px` }}>
              <User
                aria-hidden
                className="size-4 shrink-0"
                fill={level.solid ? 'currentColor' : 'none'}
                strokeWidth={ICON_STROKE}
                style={{ color: level.color }}
              />
              <span className="font-display w-8 shrink-0 text-right text-xl leading-7 font-semibold text-text-primary tabular-nums">
                {formatInt(level.figures)}
              </span>
              <span className="min-w-0 flex-1 text-xs leading-5 text-text-secondary">{level.label}</span>
              <span className="shrink-0 text-xs leading-5 text-text-muted tabular-nums">{formatInt(level.leads)} leads</span>
            </li>
          ))}
          <li className="flex items-center gap-2" style={{ paddingLeft: `${String(levels.length * INDENT_PX)}px` }}>
            <span className="size-4 shrink-0 rounded-full border border-dashed border-text-muted" />
            <span className="font-display w-8 shrink-0 text-right text-xl leading-7 font-semibold text-text-primary tabular-nums">
              {formatDecimal(wonPer100, 1)}
            </span>
            <span className="min-w-0 flex-1 text-xs leading-5 text-text-secondary">vendem, menos de uma figura</span>
            <span className="shrink-0 text-xs leading-5 text-text-muted tabular-nums">{formatInt(data.won)} leads</span>
          </li>
        </ul>
      </div>

      <p aria-hidden className="m-0 flex items-center gap-4 text-xs leading-5 text-text-muted">
        <span className="tabular-nums">
          {formatInt(1)} figura = {formatInt(1)} em cada {formatInt(CELLS)}
        </span>
        <span className="ml-auto tabular-nums">
          {formatInt(CELLS)} equivale a {formatInt(data.total)} leads do {data.period}
        </span>
      </p>
    </figure>
  );
}
