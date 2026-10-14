import { Filter } from 'lucide-react';
import { useId } from 'react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginNode, type SparseData } from './data';

/**
 * Matriz de adjacência esparsa. Com 40 origens e 92% dos pares em zero, a matriz inteira seria uma
 * parede de células vazias; as origens sem NENHUM par saem da grade e voltam como uma linha escrita
 * com a contagem do que saiu. O que fica (18 por 18) separa duas ausências que não se confundem:
 * zero MEDIDO, desenhado em neutro com o 0 escrito, e par SEM MEDIÇÃO, hachurado e sem número.
 *
 * Origem que tem pelo menos um par sem medição fica na matriz mesmo sem par positivo: tirá-la
 * esconderia justamente a lacuna da fonte. Triângulo inferior só, porque a relação é simétrica; os
 * nomes ficam na margem esquerda, com o número da posição repetido no topo de cada coluna.
 */
export interface SparseMatrixProps {
  readonly data?: SparseData;
  readonly height?: number;
  readonly className?: string;
}

const CELL_W = 20;
const CELL_H = 18;
const GAP = 2;
const HEADER_H = 16;
/** Largura média de um caractere em 11 px: decide a margem esquerda pelo maior rótulo. */
const CHAR_W = 6.2;
const NUMBER_W = 22;
const LABEL_PAD = 8;
const LEGEND_LINE = 15;
const LEGEND_CHARS = 30;
const FOOTER_GAP = 10;
const HATCH_STEP = 4;

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

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
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

export default function SparseMatrix({ data = defaultData, height, className }: SparseMatrixProps) {
  const hatchId = useId();

  if (data.nodes.length < 2 || data.pairs.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma jornada com duas origens neste recorte: a matriz não tem par para desenhar.</span>
      </div>
    );
  }

  /** `undefined` é par fora da lista (zero medido), `null` é par sem medição. */
  const values = new Map(data.pairs.map((pair) => [pairKey(pair.a, pair.b), pair.journeys]));
  const valueOf = (a: string, b: string): number | null => values.get(pairKey(a, b)) ?? (values.has(pairKey(a, b)) ? null : 0);

  const degreeOf = (id: string): number =>
    data.pairs.reduce((sum, pair) => (pair.a === id || pair.b === id ? sum + (pair.journeys ?? 0) : sum), 0);
  const touched = (id: string): boolean => data.pairs.some((pair) => (pair.a === id || pair.b === id) && pair.journeys !== 0);

  const kept: OriginNode[] = data.nodes
    .filter((node) => touched(node.id))
    .sort((a, b) => degreeOf(b.id) - degreeOf(a.id) || a.label.localeCompare(b.label, 'pt-BR'));
  const collapsedCount = data.nodes.length - kept.length;
  const count = kept.length;
  const totalPairs = (data.nodes.length * (data.nodes.length - 1)) / 2;

  const positive: number[] = [];
  let unmeasured = 0;
  let biggest: { a: OriginNode; b: OriginNode; journeys: number } | null = null;
  for (const pair of data.pairs) {
    if (pair.journeys === null) {
      unmeasured += 1;
      continue;
    }
    if (pair.journeys > 0) positive.push(pair.journeys);
    const a = data.nodes.find((node) => node.id === pair.a);
    const b = data.nodes.find((node) => node.id === pair.b);
    if (a !== undefined && b !== undefined && (biggest === null || pair.journeys > biggest.journeys)) {
      biggest = { a, b, journeys: pair.journeys };
    }
  }
  const ceilings = ceilingsOf(positive);
  const zeroShare = totalPairs > 0 ? (totalPairs - positive.length - unmeasured) / totalPairs : null;

  const summary =
    biggest !== null && ceilings !== null && zeroShare !== null
      ? `Matriz de coocorrência reduzida de ${formatInt(data.nodes.length)} para ${formatInt(count)} origens em ${formatMonthShort(data.month)}. ` +
        `${formatInt(collapsedCount)} origens sem nenhum par saíram da grade; ${formatPercent(zeroShare, 0)} dos ${formatInt(totalPairs)} pares são zero medido e ${formatInt(unmeasured)} não têm medição. ` +
        `O maior par é ${lowerFirst(biggest.a.label)} com ${lowerFirst(biggest.b.label)}.`
      : 'Matriz de coocorrência sem nenhum par de origens na mesma jornada.';

  const maxChars = kept.reduce((longest, node) => Math.max(longest, node.label.length), 0);
  const leftW = NUMBER_W + LABEL_PAD + Math.ceil(maxChars * CHAR_W);
  const matrixW = count * (CELL_W + GAP) - GAP;
  const viewW = leftW + matrixW;
  const gridBottom = HEADER_H + count * (CELL_H + GAP) - GAP;
  const viewH = gridBottom + FOOTER_GAP + 30;
  const stepX = (col: number): number => leftW + col * (CELL_W + GAP);
  const stepY = (row: number): number => HEADER_H + row * (CELL_H + GAP);

  const classLabels = (ceilings ?? []).map((ceiling, index) => {
    const floor = index === 0 ? 1 : (ceilings?.[index - 1] ?? 0) + 1;
    return floor >= ceiling ? formatInt(ceiling) : `${formatInt(floor)} a ${formatInt(ceiling)}`;
  });
  const legendX = viewW - (18 + LEGEND_CHARS * CHAR_W);
  const legendY = (line: number): number => HEADER_H + 8 + line * LEGEND_LINE;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col items-center', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="shrink-0" height={viewH} viewBox={`0 0 ${String(viewW)} ${String(viewH)}`} width={viewW}>
        <defs>
          {/* Hachura em traço de 1,5 px a 45 graus: lê como "sem dado" contra o zero, que é cor chapada com o 0 escrito. */}
          <pattern height={HATCH_STEP} id={hatchId} patternUnits="userSpaceOnUse" width={HATCH_STEP}>
            <path d={`M0 ${String(HATCH_STEP)} L${String(HATCH_STEP)} 0`} stroke="var(--text-muted)" strokeWidth={1.5} />
          </pattern>
        </defs>

        {kept.map((node, col) => (
          <text
            className="font-display tabular-nums"
            fill="var(--text-muted)"
            fontSize={11}
            key={node.id}
            textAnchor="middle"
            x={stepX(col) + CELL_W / 2}
            y={11}
          >
            {formatInt(col + 1)}
          </text>
        ))}

        {kept.map((rowNode, row) => (
          <g key={rowNode.id}>
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
            <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} x={NUMBER_W + 4} y={stepY(row) + CELL_H / 2}>
              {rowNode.label}
            </text>
            {kept.slice(0, row + 1).map((colNode, col) => {
              const x = stepX(col);
              const y = stepY(row);
              if (col === row) {
                return <rect fill={DIAGONAL_FILL} height={CELL_H} key={colNode.id} rx={2} width={CELL_W} x={x} y={y} />;
              }
              const journeys = valueOf(rowNode.id, colNode.id);
              if (journeys === null) {
                return (
                  <g key={colNode.id}>
                    <rect fill={`url(#${hatchId})`} height={CELL_H} rx={2} width={CELL_W} x={x} y={y} />
                    <rect fill="none" height={CELL_H - 1} rx={2} stroke="var(--text-muted)" strokeWidth={1} width={CELL_W - 1} x={x + 0.5} y={y + 0.5} />
                  </g>
                );
              }
              const bucket = journeys > 0 && ceilings !== null ? classOf(journeys, ceilings) : -1;
              return (
                <g key={colNode.id}>
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
                    {formatInt(journeys)}
                  </text>
                </g>
              );
            })}
          </g>
        ))}

        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={legendX} y={legendY(0)}>
          jornadas por par, em quartis:
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
          {`${formatInt(0)}: medido, nunca juntas`}
        </text>
        <rect fill={`url(#${hatchId})`} height={10} rx={2} width={14} x={legendX} y={legendY(6) - 5} />
        <rect fill="none" height={9} rx={2} stroke="var(--text-muted)" strokeWidth={1} width={13} x={legendX + 0.5} y={legendY(6) - 4.5} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={legendX + 18} y={legendY(6)}>
          sem medição na fonte
        </text>

        <text fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={gridBottom + FOOTER_GAP + 12}>
          {`${formatInt(collapsedCount)} origens sem relação ficaram fora da grade`}
        </text>
        <text fill="var(--text-muted)" fontSize={11} x={0} y={gridBottom + FOOTER_GAP + 28}>
          {`Eram ${formatInt(data.nodes.length)} origens e ${formatInt(totalPairs)} pares: ${formatPercent(zeroShare ?? 0, 0)} em zero medido, ${formatInt(unmeasured)} sem medição.`}
        </text>
      </svg>
    </figure>
  );
}
