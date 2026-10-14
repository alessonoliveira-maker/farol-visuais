import { Filter } from 'lucide-react';
import { useState } from 'react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, GROUPS, type CooccurrenceData, type OriginNode } from './data';

/**
 * Matriz de adjacência de uma relação simétrica: as mesmas origens nas linhas e nas colunas, só o
 * triângulo inferior, e a contagem de jornadas em que o par aparece junto escrita em cada célula.
 * O nome de cada origem fica na ponta da própria linha, dentro do triângulo vazio, e a coluna dela
 * encontra a diagonal nesse mesmo ponto: as 12 origens se nomeiam sem texto girado e sem origem órfã.
 *
 * A ordem é a informação: grupo na ordem do dado, e dentro do grupo quem tem mais coocorrências
 * primeiro. A cor é por quartil dos pares com coocorrência, porque um par gigante numa rampa linear
 * deixaria os outros 60 numa faixa só. Pula `--seq-4` e `--seq-5`, que não têm texto legível nos
 * dois temas; a contagem escrita carrega o que as faixas baixas, de pouco contraste, não carregam.
 */
export interface OriginCooccurrenceMatrixProps {
  readonly data?: CooccurrenceData;
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 422;
const VIEW_H = 355;
const CELL_W = 24;
const CELL_H = 20;
const GAP = 2;
/** Faixa acima de cada grupo, nos dois eixos: o nome do grupo mora nela, e espaço separa grupo, borda não (ESP-5). */
const GROUP_SLOT = 13;
const MATRIX_TOP = 20;
const LABEL_OFFSET = 6;
/** Largura média de um caractere em 11 px, só para posicionar a legenda. */
const CHAR_W = 6.2;

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
const HOVER_FILL = 'var(--surface-overlay)';

interface Ordered {
  readonly node: OriginNode;
  readonly degree: number;
}

interface Hover {
  readonly row: number;
  readonly col: number;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** Teto de cada quartil dos valores positivos; `null` quando não há par com coocorrência. */
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

export default function OriginCooccurrenceMatrix({
  data = defaultData,
  height,
  className,
}: OriginCooccurrenceMatrixProps) {
  const [hover, setHover] = useState<Hover | null>(null);

  if (data.nodes.length < 2 || data.pairs.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma jornada com duas origens neste recorte: a matriz não tem par para pintar.</span>
      </div>
    );
  }

  const counts = new Map<string, number>();
  for (const pair of data.pairs) counts.set(pairKey(pair.a, pair.b), pair.journeys);
  const countOf = (a: string, b: string): number => counts.get(pairKey(a, b)) ?? 0;

  const groupOrder = new Map(GROUPS.map((group, index) => [group.id, index]));
  const ordered: Ordered[] = data.nodes
    .map((node) => ({
      node,
      degree: data.nodes.reduce((sum, other) => (other.id === node.id ? sum : sum + countOf(node.id, other.id)), 0),
    }))
    .sort(
      (a, b) =>
        (groupOrder.get(a.node.group) ?? 0) - (groupOrder.get(b.node.group) ?? 0) ||
        b.degree - a.degree ||
        a.node.label.localeCompare(b.node.label, 'pt-BR'),
    );

  const groupIndex = (index: number): number => groupOrder.get(ordered[index]?.node.group ?? 'pago') ?? 0;
  const posX = (index: number): number => index * (CELL_W + GAP) + groupIndex(index) * GROUP_SLOT;
  const posY = (index: number): number => MATRIX_TOP + index * (CELL_H + GAP) + (groupIndex(index) + 1) * GROUP_SLOT;

  const positive: number[] = [];
  let within = 0;
  let total = 0;
  let biggest: { a: OriginNode; b: OriginNode; journeys: number } | null = null;
  for (let row = 1; row < ordered.length; row += 1) {
    for (let col = 0; col < row; col += 1) {
      const a = ordered[row]?.node;
      const b = ordered[col]?.node;
      if (a === undefined || b === undefined) continue;
      const journeys = countOf(a.id, b.id);
      if (journeys > 0) positive.push(journeys);
      total += journeys;
      if (a.group === b.group) within += journeys;
      if (biggest === null || journeys > biggest.journeys) biggest = { a, b, journeys };
    }
  }
  const ceilings = ceilingsOf(positive);
  const withinShare = total > 0 ? within / total : null;

  const summary =
    biggest !== null && ceilings !== null && withinShare !== null
      ? `Matriz de coocorrência entre ${formatInt(ordered.length)} origens em ${formatMonthShort(data.month)}, ordenada por grupo. ` +
        `O maior par é ${lowerFirst(biggest.a.label)} com ${lowerFirst(biggest.b.label)}, com ${formatInt(biggest.journeys)} jornadas. ` +
        `${formatPercent(withinShare, 0)} das coocorrências ficam dentro do mesmo grupo.`
      : 'Matriz de coocorrência sem nenhum par de origens na mesma jornada.';

  const readout = (() => {
    if (hover !== null) {
      const a = ordered[hover.row]?.node;
      const b = ordered[hover.col]?.node;
      if (a !== undefined && b !== undefined && a.id !== b.id) {
        const journeys = countOf(a.id, b.id);
        const share = data.journeys > 0 ? ` (${formatPercent(journeys / data.journeys, 1)})` : '';
        return `${a.label} e ${b.label}: ${formatInt(journeys)} jornadas${share}`;
      }
    }
    return biggest === null ? '' : `Maior par: ${biggest.a.label} com ${biggest.b.label} (${formatInt(biggest.journeys)} jornadas)`;
  })();

  const lastY = posY(ordered.length - 1) + CELL_H;
  const legendY = lastY + 13;
  const legendSecondY = legendY + 14;
  const classLabels = (ceilings ?? []).map((ceiling, index) => {
    const floor = index === 0 ? 1 : (ceilings?.[index - 1] ?? 0) + 1;
    return floor >= ceiling ? formatInt(ceiling) : `${formatInt(floor)} a ${formatInt(ceiling)}`;
  });
  const legendTitle = 'jornadas (quartis):';
  let legendX = legendTitle.length * CHAR_W + 8;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col items-center', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="shrink-0" height={VIEW_H} viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`} width={VIEW_W}>
        <text fill="var(--text-secondary)" fontSize={12} x={0} y={12}>
          {readout}
        </text>

        {hover !== null ? (
          <g>
            <rect fill={HOVER_FILL} height={CELL_H} width={VIEW_W} x={0} y={posY(hover.row)} />
            <rect fill={HOVER_FILL} height={lastY - MATRIX_TOP} width={CELL_W} x={posX(hover.col)} y={MATRIX_TOP} />
          </g>
        ) : null}

        {ordered.map((entry, row) => {
          const groupLabel = GROUPS.find((group) => group.id === entry.node.group)?.label ?? '';
          const firstOfGroup = row === 0 || ordered[row - 1]?.node.group !== entry.node.group;
          const active = hover !== null && (hover.row === row || hover.col === row);
          return (
            <g key={entry.node.id}>
              <text
                dominantBaseline="central"
                fill={active ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={11}
                fontWeight={active ? 600 : 400}
                x={posX(row) + CELL_W + LABEL_OFFSET}
                y={posY(row) + CELL_H / 2}
              >
                {entry.node.label}
              </text>
              {firstOfGroup ? (
                <text
                  dominantBaseline="central"
                  fill="var(--text-muted)"
                  fontSize={11}
                  fontWeight={600}
                  x={posX(row)}
                  y={posY(row) - (GROUP_SLOT + GAP) / 2}
                >
                  {groupLabel}
                </text>
              ) : null}
              {ordered.slice(0, row + 1).map((other, col) => {
                const x = posX(col);
                const y = posY(row);
                if (col === row) {
                  return <rect fill={DIAGONAL_FILL} height={CELL_H} key={other.node.id} rx={2} width={CELL_W} x={x} y={y} />;
                }
                const journeys = countOf(entry.node.id, other.node.id);
                const bucket = journeys > 0 && ceilings !== null ? classOf(journeys, ceilings) : -1;
                return (
                  <g
                    key={other.node.id}
                    onMouseEnter={() => setHover({ row, col })}
                    onMouseLeave={() => setHover(null)}
                  >
                    <rect
                      fill={bucket === -1 ? ZERO_FILL : CLASS_COLORS[bucket]}
                      height={CELL_H}
                      rx={2}
                      width={CELL_W}
                      x={x}
                      y={y}
                    />
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
          );
        })}

        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={0} y={legendY}>
          {legendTitle}
        </text>
        {classLabels.map((label, index) => {
          const x = legendX;
          legendX += 14 + 4 + label.length * CHAR_W + 8;
          return (
            <g key={label}>
              <rect fill={CLASS_COLORS[index]} height={10} rx={2} width={14} x={x} y={legendY - 5} />
              <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={x + 18} y={legendY}>
                {label}
              </text>
            </g>
          );
        })}
        <rect fill={ZERO_FILL} height={10} rx={2} width={14} x={0} y={legendSecondY - 5} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={18} y={legendSecondY}>
          {`${formatInt(0)}: nunca juntas no mês`}
        </text>
        <rect fill={DIAGONAL_FILL} height={10} rx={2} width={14} x={150} y={legendSecondY - 5} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={168} y={legendSecondY}>
          diagonal: a própria origem
        </text>
      </svg>
    </figure>
  );
}
