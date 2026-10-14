import { Filter } from 'lucide-react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, totalCaption as defaultCaption, type OutcomeSlice } from './data';

/**
 * Waffle empilhado de 10 por 10: cada quadrado é 1% das oportunidades encerradas e cada desfecho é um
 * bloco contíguo. Só as ganhas acendem em cor; perdidas e desqualificadas ficam em dois neutros, e a
 * ausência de motivo vai por último, hachurada. Categoria com menos de um quadrado fica na legenda,
 * sem célula forçada, e o percentual impresso de cada bloco é a contagem de quadrados dele.
 */
export interface OutcomeWaffleProps {
  readonly data?: readonly OutcomeSlice[];
  /** O que o total conta e em que período, escrito depois do número. */
  readonly caption?: string;
  readonly className?: string;
}

const GRID = 10;
const CELLS = GRID * GRID;
const WIN_COLOR = 'var(--chart-1)';
/** Neutros na ordem de entrada: o primeiro é o maior bloco neutro e o mais escuro contra o cartão. */
const NEUTRAL_COLORS = ['var(--text-secondary)', 'var(--text-muted)'] as const;
const MISSING_STROKE = 'var(--line-strong)';

interface Block {
  readonly slice: OutcomeSlice;
  readonly cells: number;
  readonly share: number;
  /** Cor do bloco; `null` para a ausência, que vai hachurada. */
  readonly color: string | null;
}

/** Percentual de uma contagem sobre o total; `null` sem total, porque 0 de 0 não é taxa zero (EST-1b). */
function shareOf(count: number, total: number): number | null {
  return total > 0 ? count / total : null;
}

/** Ausência por último; as demais seguem a ordem do dado, que já vem do maior para o menor. */
function stackOrder(slices: readonly OutcomeSlice[]): readonly OutcomeSlice[] {
  return [...slices.filter((s) => s.kind !== 'missing'), ...slices.filter((s) => s.kind === 'missing')];
}

/**
 * Maior resto sobre as categorias que merecem ao menos um quadrado. Quem pesa menos de 1% fica com
 * zero célula e vai para a legenda: forçar um quadrado inflaria a fração em até 3 vezes.
 */
function toBlocks(slices: readonly OutcomeSlice[]): readonly Block[] {
  const ordered = stackOrder(slices);
  const total = ordered.reduce((sum, s) => sum + s.count, 0);
  const eligible = ordered.filter((s) => (shareOf(s.count, total) ?? 0) * CELLS >= 1);
  const base = eligible.reduce((sum, s) => sum + s.count, 0);
  if (base <= 0) return [];
  const raw = eligible.map((s) => (s.count / base) * CELLS);
  const cells = raw.map(Math.floor);
  let missing = CELLS - cells.reduce((sum, value) => sum + value, 0);
  const byRemainder = raw.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of byRemainder) {
    if (missing <= 0) break;
    cells[index] = (cells[index] ?? 0) + 1;
    missing -= 1;
  }
  let neutralIndex = 0;
  return ordered.map((slice) => {
    const at = eligible.indexOf(slice);
    let color: string | null = WIN_COLOR;
    if (slice.kind === 'missing') color = null;
    if (slice.kind === 'neutral') {
      color = NEUTRAL_COLORS[Math.min(neutralIndex, NEUTRAL_COLORS.length - 1)] ?? 'var(--text-muted)';
      neutralIndex += 1;
    }
    return { slice, cells: at < 0 ? 0 : (cells[at] ?? 0), share: shareOf(slice.count, total) ?? 0, color };
  });
}

/** Posição da célula na ordem de preenchimento: coluna a coluna, e dentro da coluna de baixo para cima. */
function fillOrder(row: number, column: number): number {
  return column * GRID + (GRID - 1 - row);
}

function Hatch() {
  return (
    <svg aria-hidden className="size-full" preserveAspectRatio="none" viewBox="0 0 10 10">
      <path d="M0 10L10 0M0 5L5 0M5 10L10 5" stroke={MISSING_STROKE} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function OutcomeWaffle({ data = defaultData, caption = defaultCaption, className }: OutcomeWaffleProps) {
  const blocks = toBlocks(data);
  const total = data.reduce((sum, slice) => sum + slice.count, 0);

  if (blocks.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted tabular-nums', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade encerrada neste recorte: a grade não tem o que dividir em 100.</span>
      </div>
    );
  }

  // Ordem de preenchimento: cada célula descobre a que bloco pertence pela soma acumulada das contagens.
  const owners: (Block | undefined)[] = [];
  for (const block of blocks) for (let i = 0; i < block.cells; i += 1) owners.push(block);
  const winner = blocks.find((block) => block.slice.kind === 'win');
  const tiny = blocks.filter((block) => block.cells === 0);
  const summary =
    `Gráfico de waffle: ${formatInt(total)} ${caption}, em 100 quadrados de 1% cada. ` +
    `${winner ? `As ${winner.slice.label.toLowerCase()} ocupam ${formatInt(winner.cells)} de 100. ` : ''}` +
    `${blocks.filter((b) => b.cells > 0).map((b) => `${b.slice.label.toLowerCase()}, ${formatInt(b.cells)}`).join('; ')}` +
    `${tiny.length > 0 ? `; ${tiny.map((b) => b.slice.label.toLowerCase()).join(', ')} com menos de um quadrado` : ''}.`;

  return (
    <figure aria-label={summary} className={cn('@container m-0 h-full w-full min-w-0', className)} role="img">
      <div className="flex h-full min-h-0 flex-col gap-4 @sm:flex-row @sm:items-center">
      {/* grid-rows-10 explícito: sem ele as linhas viram auto e a célula estica com a altura do contêiner. */}
      <div aria-hidden className="grid aspect-square max-h-full w-full max-w-48 shrink-0 grid-cols-10 grid-rows-10 gap-0.5 @sm:h-full @sm:w-auto @sm:max-w-none">
        {Array.from({ length: CELLS }, (_, index) => {
          const owner = owners[fillOrder(Math.floor(index / GRID), index % GRID)];
          const key = `cell-${String(index)}`;
          if (owner === undefined) return <span className="min-h-0 min-w-0 rounded-[2px] bg-surface-sunken" key={key} />;
          if (owner.color === null) {
            return (
              <span className="min-h-0 min-w-0 overflow-hidden rounded-[2px] border border-line-strong" key={key}>
                <Hatch />
              </span>
            );
          }
          return <span className="min-h-0 min-w-0 rounded-[2px]" key={key} style={{ backgroundColor: owner.color }} />;
        })}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs leading-5 font-medium text-text-secondary" aria-hidden>
          {winner ? `${formatInt(winner.cells)} de cada 100 foram ganhas` : 'Nenhuma venda ganha neste recorte'}
        </p>
        <p className="pb-2 text-xs leading-5 text-text-muted">
          <span className="kpi-number text-sm font-semibold text-text-primary">{formatInt(total)}</span> {caption}
        </p>
        <ul className="space-y-1">
          {blocks.map((block) => (
            <li className="flex min-w-0 items-center gap-2.5 leading-5" key={block.slice.id}>
              <span
                aria-hidden
                className={cn('size-3 shrink-0 overflow-hidden rounded-[2px]', block.color === null && 'border border-line-strong', block.cells === 0 && 'border border-dashed border-text-muted')}
                style={block.color === null || block.cells === 0 ? undefined : { backgroundColor: block.color }}
              >
                {block.color === null && block.cells > 0 ? <Hatch /> : null}
              </span>
              <span className={cn('min-w-0 flex-1 text-xs leading-5', block.slice.kind === 'missing' ? 'text-text-muted' : 'text-text-secondary')}>
                {block.slice.label}
                {block.cells === 0 ? ', menos de 1 quadrado' : ''}
              </span>
              <span className={cn('kpi-number w-12 shrink-0 text-right text-sm leading-5', block.cells === 0 ? 'font-medium text-text-muted' : 'font-semibold text-text-primary')}>
                {block.cells === 0 ? formatPercent(block.share) : formatPercent(block.cells / CELLS, 0)}
              </span>
              <span className="kpi-number w-8 shrink-0 text-right text-xs leading-5 text-text-muted">{formatInt(block.slice.count)}</span>
            </li>
          ))}
        </ul>
        <p className="pt-2 text-xs leading-5 text-text-muted tabular-nums">1 quadrado = 1% das encerradas</p>
      </div>
      </div>
    </figure>
  );
}
