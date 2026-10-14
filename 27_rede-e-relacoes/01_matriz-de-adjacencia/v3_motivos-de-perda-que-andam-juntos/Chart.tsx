import { Filter } from 'lucide-react';
import { useMemo, useState } from 'react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LossReasonData } from './data';

/**
 * Matriz de adjacência de motivos de perda registrados juntos, ordenada por baricentro iterativo: cada
 * motivo vai para a média ponderada das posições dos motivos a que se liga, até a ordem parar de
 * mudar. Em ordem alfabética a matriz parece ruído; ordenada, as famílias de motivo viram blocos
 * junto da diagonal. A ordem é escolhida num seletor, e a PADRÃO é o agrupamento, que é a única das
 * três em que o bloco aparece. Triângulo inferior só, porque a relação é simétrica.
 *
 * O cabeçalho de coluna é o NÚMERO da posição, e o nome mora na linha, com o mesmo número na frente:
 * nome girado a 90 graus fere a TIP-5, e nome horizontal de 18 colunas não cabe. A margem esquerda
 * sai do maior rótulo, e abaixo de 480 px o contêiner rola na horizontal com o cabeçalho de linha
 * fixo (a coluna de rótulos é um SVG `sticky` ao lado do SVG das células).
 */
export interface LossReasonMatrixProps {
  readonly data?: LossReasonData;
  readonly height?: number;
  readonly className?: string;
}

type OrderMode = 'grupo' | 'frequencia' | 'nome';

const ORDER_MODES: readonly { readonly id: OrderMode; readonly label: string; readonly phrase: string }[] = [
  { id: 'grupo', label: 'Agrupamento (padrão)', phrase: 'agrupamento' },
  { id: 'frequencia', label: 'Frequência', phrase: 'frequência' },
  { id: 'nome', label: 'Nome', phrase: 'nome' },
];
const DEFAULT_MODE: OrderMode = 'grupo';

const CELL_W = 20;
const CELL_H = 18;
const GAP = 2;
const HEADER_H = 16;
/** Largura média de um caractere em 11 px: decide a margem esquerda pelo maior rótulo. */
const CHAR_W = 6.2;
const NUMBER_W = 22;
const LABEL_PAD = 8;
const BLOCK_SIZE = 3;
const MAX_ITERATIONS = 24;
const LEGEND_LINE = 14;
const LEGEND_CHARS = 30;

const CLASS_COLORS = [
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const CLASS_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
const ZERO_FILL = 'var(--surface-sunken)';
const DIAGONAL_FILL = 'var(--line-subtle)';

type Weights = ReadonlyMap<string, number>;

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function sumOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

function ceilingsOf(values: readonly number[]): readonly number[] | null {
  const sorted = values.filter((value) => value > 0).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const at = (share: number): number => sorted[Math.max(0, Math.ceil(sorted.length * share) - 1)] ?? 0;
  return [at(0.25), at(0.5), at(0.75), at(1)];
}

function classOf(value: number, ceilings: readonly number[]): number {
  const found = ceilings.findIndex((ceiling) => value <= ceiling);
  return found === -1 ? ceilings.length - 1 : found;
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function wrap(text: string, limit: number): readonly string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(' ')) {
    const next = current === '' ? word : `${current} ${word}`;
    if (next.length > limit && current !== '') {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}

/**
 * Baricentro iterativo: parte da ordem por nome (determinística) e reposiciona cada motivo na média
 * das posições dos vizinhos, ponderada pelo peso do par. Motivo sem nenhum par fica onde está.
 * Para quando a ordem repete ou no teto de iterações.
 */
function barycenterOrder(ids: readonly string[], weights: Weights): readonly string[] {
  let order = [...ids];
  for (let step = 0; step < MAX_ITERATIONS; step += 1) {
    const position = new Map(order.map((id, index) => [id, index]));
    const scored = order.map((id, index) => {
      let weighted = 0;
      let total = 0;
      for (const other of order) {
        if (other === id) continue;
        const weight = weights.get(pairKey(id, other)) ?? 0;
        weighted += weight * (position.get(other) ?? 0);
        total += weight;
      }
      return { id, index, score: total > 0 ? weighted / total : index };
    });
    const next = scored.sort((a, b) => a.score - b.score || a.index - b.index).map((entry) => entry.id);
    if (next.every((id, index) => id === order[index])) break;
    order = next;
  }
  return order;
}

export default function LossReasonMatrix({ data = defaultData, height, className }: LossReasonMatrixProps) {
  const [mode, setMode] = useState<OrderMode>(DEFAULT_MODE);

  const weights = useMemo<Weights>(
    () => new Map(data.pairs.map((pair) => [pairKey(pair.a, pair.b), pair.losses])),
    [data.pairs],
  );
  const orders = useMemo<Record<OrderMode, readonly string[]>>(() => {
    const byName = [...data.reasons].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')).map((reason) => reason.id);
    const degree = (id: string): number =>
      byName.reduce((sum, other) => (other === id ? sum : sum + (weights.get(pairKey(id, other)) ?? 0)), 0);
    return {
      nome: byName,
      frequencia: [...byName].sort((a, b) => degree(b) - degree(a)),
      grupo: barycenterOrder(byName, weights),
    };
  }, [data.reasons, weights]);

  if (data.reasons.length < 2 || data.pairs.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma perda com dois motivos neste recorte: a matriz não tem par para pintar.</span>
      </div>
    );
  }

  const labelOf = new Map(data.reasons.map((reason) => [reason.id, reason.label]));
  const order = orders[mode];
  const count = order.length;
  const weightOf = (a: string, b: string): number => weights.get(pairKey(a, b)) ?? 0;

  const maxChars = data.reasons.reduce((longest, reason) => Math.max(longest, reason.label.length), 0);
  const leftW = NUMBER_W + LABEL_PAD + Math.ceil(maxChars * CHAR_W);
  const matrixW = count * (CELL_W + GAP) - GAP;
  const viewH = HEADER_H + count * (CELL_H + GAP) - GAP;
  const stepX = (col: number): number => col * (CELL_W + GAP);
  const stepY = (row: number): number => HEADER_H + row * (CELL_H + GAP);

  const positive: number[] = [];
  let biggest: { a: string; b: string; losses: number } | null = null;
  for (let row = 1; row < count; row += 1) {
    for (let col = 0; col < row; col += 1) {
      const a = order[row];
      const b = order[col];
      if (a === undefined || b === undefined) continue;
      const losses = weightOf(a, b);
      if (losses > 0) positive.push(losses);
      if (biggest === null || losses > biggest.losses) biggest = { a, b, losses };
    }
  }
  const ceilings = ceilingsOf(positive);

  /** Bloco: a janela de motivos vizinhos na ordem atual com mais perdas internas entre si. */
  let block: { start: number; losses: number } | null = null;
  for (let start = 0; start + BLOCK_SIZE <= count; start += 1) {
    const ids = order.slice(start, start + BLOCK_SIZE);
    const losses = sumOf(ids.flatMap((id, index) => ids.slice(index + 1).map((other) => weightOf(id, other)))) ?? 0;
    if (block === null || losses > block.losses) block = { start, losses };
  }
  const blockIds = block === null ? [] : order.slice(block.start, block.start + BLOCK_SIZE);
  const blockNames = blockIds.map((id, index) => (index === 0 ? (labelOf.get(id) ?? id) : lowerFirst(labelOf.get(id) ?? id)));
  const blockLine =
    block !== null && blockNames.length === BLOCK_SIZE
      ? `${blockNames[0] ?? ''}, ${blockNames[1] ?? ''} e ${blockNames[2] ?? ''}: ${formatInt(block.losses)} perdas juntas`
      : '';

  const modeLabel = ORDER_MODES.find((entry) => entry.id === mode)?.phrase ?? '';
  const summary =
    biggest !== null && ceilings !== null && block !== null
      ? `Matriz de coocorrência de ${formatInt(count)} motivos em ${formatInt(data.totalLosses)} perdas de ${data.year}, em ordem de ${modeLabel}. ` +
        `O par mais frequente é ${lowerFirst(labelOf.get(biggest.a) ?? '')} com ${lowerFirst(labelOf.get(biggest.b) ?? '')}, com ${formatInt(biggest.losses)} perdas. ` +
        `Três motivos andam colados, com ${formatInt(block.losses)} perdas entre si.`
      : 'Matriz de coocorrência sem nenhum par de motivos na mesma perda.';

  const classLabels = (ceilings ?? []).map((ceiling, index) => {
    const floor = index === 0 ? 1 : (ceilings?.[index - 1] ?? 0) + 1;
    return floor >= ceiling ? formatInt(ceiling) : `${formatInt(floor)} a ${formatInt(ceiling)}`;
  });
  const legendX = matrixW - (18 + LEGEND_CHARS * CHAR_W);
  const legendY = (line: number): number => HEADER_H + 8 + line * LEGEND_LINE;
  const noteLines = wrap(blockLine, LEGEND_CHARS);

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-label="Ordenar motivos por" className="flex shrink-0 items-center gap-1.5 text-xs text-text-muted" role="group">
        <span>Ordenar por</span>
        {ORDER_MODES.map((entry) => (
          <button
            aria-pressed={mode === entry.id}
            className={cn(
              'rounded-full border px-2 py-1 leading-none whitespace-nowrap',
              mode === entry.id ? 'border-line-strong font-medium text-text-primary' : 'border-line-subtle text-text-muted',
            )}
            key={entry.id}
            onClick={() => setMode(entry.id)}
            type="button"
          >
            {entry.label}
          </button>
        ))}
      </div>

      {/* Abaixo de 480 px o contêiner rola na horizontal; a coluna de rótulos é `sticky` e leva o fundo do cartão para as células não passarem por baixo dela. */}
      <div className="min-h-0 flex-1 overflow-x-auto">
        <div className="flex w-max">
          <svg aria-hidden className="sticky left-0 z-10 shrink-0 bg-surface-raised" height={viewH} viewBox={`0 0 ${String(leftW)} ${String(viewH)}`} width={leftW}>
            {order.map((id, row) => (
              <g key={id}>
                <text
                  className="font-display tabular-nums"
                  dominantBaseline="central"
                  fill="var(--text-muted)"
                  fontSize={11}
                  textAnchor="end"
                  x={NUMBER_W - 4}
                  y={stepY(row) + CELL_H / 2}
                >
                  {formatInt(row + 1)}
                </text>
                <text
                  dominantBaseline="central"
                  fill="var(--text-secondary)"
                  fontSize={11}
                  x={NUMBER_W + 4}
                  y={stepY(row) + CELL_H / 2}
                >
                  {labelOf.get(id) ?? id}
                </text>
              </g>
            ))}
          </svg>

          <svg aria-hidden className="shrink-0" height={viewH} viewBox={`0 0 ${String(matrixW)} ${String(viewH)}`} width={matrixW}>
            {order.map((id, col) => (
              <text
                className="font-display tabular-nums"
                fill="var(--text-muted)"
                fontSize={11}
                key={id}
                textAnchor="middle"
                x={stepX(col) + CELL_W / 2}
                y={11}
              >
                {formatInt(col + 1)}
              </text>
            ))}

            {order.map((rowId, row) =>
              order.slice(0, row + 1).map((colId, col) => {
                const x = stepX(col);
                const y = stepY(row);
                if (col === row) {
                  return <rect fill={DIAGONAL_FILL} height={CELL_H} key={`${rowId}-${colId}`} rx={2} width={CELL_W} x={x} y={y} />;
                }
                const losses = weightOf(rowId, colId);
                const bucket = losses > 0 && ceilings !== null ? classOf(losses, ceilings) : -1;
                return (
                  <g key={`${rowId}-${colId}`}>
                    <rect fill={bucket === -1 ? ZERO_FILL : CLASS_COLORS[bucket]} height={CELL_H} rx={2} width={CELL_W} x={x} y={y} />
                    <text
                      className="font-display tabular-nums"
                      dominantBaseline="central"
                      fill={bucket === -1 ? 'var(--text-muted)' : (CLASS_TEXT[bucket] ?? 'var(--text-primary)')}
                      fontSize={11}
                      textAnchor="middle"
                      x={x + CELL_W / 2}
                      y={y + CELL_H / 2}
                    >
                      {formatInt(losses)}
                    </text>
                  </g>
                );
              }),
            )}

            {block !== null ? (
              <rect
                fill="none"
                height={BLOCK_SIZE * CELL_H + (BLOCK_SIZE - 1) * GAP + 3}
                rx={3}
                stroke="var(--chart-1)"
                strokeWidth={1.5}
                width={BLOCK_SIZE * CELL_W + (BLOCK_SIZE - 1) * GAP + 3}
                x={stepX(block.start) - 1.5}
                y={stepY(block.start) - 1.5}
              />
            ) : null}

            <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={legendX} y={legendY(0)}>
              perdas juntas, em quartis:
            </text>
            {classLabels.map((label, index) => (
              <g key={label}>
                <rect fill={CLASS_COLORS[index]} height={10} rx={2} width={14} x={legendX} y={legendY(index + 1) - 5} />
                <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={legendX + 18} y={legendY(index + 1)}>
                  {label}
                </text>
              </g>
            ))}
            <rect fill={ZERO_FILL} height={10} rx={2} width={14} x={legendX} y={legendY(5) - 5} />
            <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={legendX + 18} y={legendY(5)}>
              {`${formatInt(0)}: nunca juntos`}
            </text>
            <rect fill="none" height={9} rx={2} stroke="var(--chart-1)" strokeWidth={1.5} width={13} x={legendX + 0.5} y={legendY(6) - 4.5} />
            <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={legendX + 18} y={legendY(6)}>
              bloco de três motivos colados
            </text>
            {noteLines.map((line, index) => (
              <text
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={11}
                key={line}
                x={legendX}
                y={legendY(7 + index) + 4}
              >
                {line}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </figure>
  );
}
