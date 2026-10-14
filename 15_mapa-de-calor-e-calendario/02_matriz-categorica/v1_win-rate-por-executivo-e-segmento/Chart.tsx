import { Filter } from 'lucide-react';
import { useState } from 'react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, SEGMENTS, type ExecutiveRow, type SegmentOutcome } from './data';

/**
 * Matriz categórica em cor: HeatGrid de execução comercial. Linhas são executivos, colunas são
 * segmentos de cliente, e cada célula escreve as duas metades da mesma medida: a taxa de vitória em
 * cima e o volume que a sustenta embaixo (NUM-1). Sem o volume, 12% de 4 fechadas lê igual a 72% de
 * 21, e o segmento onde a taxa despenca costuma ser justamente o de menor amostra.
 *
 * A escala de cor é fixa de 0% a 100%, porque taxa já tem teto natural: escalar pelo maior valor do
 * recorte mudaria o significado da cor entre um recorte e outro. As faixas pulam `--seq-4` e
 * `--seq-5`, repetindo a medição do modelo 01: nenhum dos dois textos disponíveis alcança 4,5:1
 * contra elas nos dois temas ao mesmo tempo.
 */
export interface WinRateHeatGridProps {
  readonly data?: readonly ExecutiveRow[];
  readonly height?: number;
  readonly className?: string;
}

const CELL_W = 84;
const CELL_H = 38;
const GAP = 2;
const LEFT_W = 108;
const TOP_H = 38;
const CELL_RADIUS = 2;

/**
 * Piso de amostra para a taxa ser conclusiva. Abaixo dele a célula continua escrevendo a taxa, e
 * continua colorida, mas ganha contorno pontilhado: o número está lá, a confiança nele não.
 */
const MIN_SAMPLE = 8;

/** Mesma escala de 5 faixas do modelo 01 (heatmap dia por hora), medida nos dois temas. */
const BUCKET_COLORS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
/** As 3 faixas baixas leem com o texto do cartão; as 2 faixas altas, com o texto sobre acento. */
const TEXT_COLORS = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
const BUCKET_EDGES = [0.2, 0.4, 0.6, 0.8] as const;

type OrderMode = 'geral' | 'semelhanca';

/** Par sem nenhuma oportunidade fechada é ausência de instrumento, nunca desempenho zero. */
function rateOf(outcome: SegmentOutcome | undefined): number | null {
  if (outcome === undefined || outcome.closed <= 0) return null;
  return outcome.wins / outcome.closed;
}

function bucketOf(rate: number): number {
  let bucket = 0;
  for (const edge of BUCKET_EDGES) if (rate >= edge) bucket += 1;
  return bucket;
}

function stepX(columnIndex: number): number {
  return LEFT_W + columnIndex * (CELL_W + GAP);
}

function stepY(rowIndex: number): number {
  return TOP_H + rowIndex * (CELL_H + GAP);
}

/** Taxa geral do executivo pelas contagens, que é a média ponderada pelo volume de cada par. */
function overallRate(row: ExecutiveRow): number | null {
  let wins = 0;
  let closed = 0;
  for (const outcome of row.outcomes) {
    wins += outcome.wins;
    closed += outcome.closed;
  }
  return closed === 0 ? null : wins / closed;
}

/** Maior taxa primeiro; executivo sem nenhuma fechada (null) vai por último, separado do zero medido. */
function byRateDesc(a: ExecutiveRow, b: ExecutiveRow): number {
  const ra = overallRate(a);
  const rb = overallRate(b);
  if (ra === null && rb === null) return 0;
  if (ra === null) return 1;
  if (rb === null) return -1;
  return rb - ra;
}

function distance(a: ExecutiveRow, b: ExecutiveRow): number {
  const fallbackA = overallRate(a);
  const fallbackB = overallRate(b);
  // Sem base de comparação, o executivo fica infinitamente longe: nunca é encostado num perfil por um zero inventado.
  if (fallbackA === null || fallbackB === null) return Number.POSITIVE_INFINITY;
  let sum = 0;
  for (let index = 0; index < SEGMENTS.length; index += 1) {
    const ra = rateOf(a.outcomes[index]) ?? fallbackA;
    const rb = rateOf(b.outcomes[index]) ?? fallbackB;
    sum += (ra - rb) ** 2;
  }
  return Math.sqrt(sum);
}

/**
 * Cadeia gulosa do vizinho mais próximo: parte de quem tem a maior taxa geral e encadeia sempre
 * pelo perfil mais parecido. Determinístico porque o dado é fixo, e derivado só do modo e do dado
 * recebido: num recorte menor a cadeia é reencadeada desde outra semente, o que é esperado.
 */
function bySimilarity(rows: readonly ExecutiveRow[]): readonly ExecutiveRow[] {
  const remaining = [...rows].sort(byRateDesc);
  const first = remaining.shift();
  if (!first) return rows;
  const ordered: ExecutiveRow[] = [first];
  let current = first;
  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    remaining.forEach((candidate, index) => {
      const d = distance(current, candidate);
      if (d < bestDistance) {
        bestDistance = d;
        bestIndex = index;
      }
    });
    const next = remaining.splice(bestIndex, 1)[0];
    if (next) {
      ordered.push(next);
      current = next;
    }
  }
  return ordered;
}

export default function WinRateHeatGrid({ data = defaultData, height, className }: WinRateHeatGridProps) {
  const [mode, setMode] = useState<OrderMode>('geral');

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: a matriz não tem o que colorir.</span>
      </div>
    );
  }

  const rows = mode === 'geral' ? [...data].sort(byRateDesc) : bySimilarity(data);

  /** Destaque só entre amostras conclusivas: contornar a maior taxa de 3 fechadas ensinaria o erro. */
  const columnMaxId = SEGMENTS.map((_, columnIndex) => {
    let bestId: string | null = null;
    let bestRate = Number.NEGATIVE_INFINITY;
    for (const row of data) {
      const outcome = row.outcomes[columnIndex];
      const rate = rateOf(outcome);
      if (rate === null || outcome === undefined || outcome.closed < MIN_SAMPLE) continue;
      if (rate > bestRate) {
        bestRate = rate;
        bestId = row.id;
      }
    }
    return bestId;
  });

  const segmentTotals = SEGMENTS.map((segment, columnIndex) => {
    let wins = 0;
    let closed = 0;
    for (const row of data) {
      const outcome = row.outcomes[columnIndex];
      if (outcome === undefined) continue;
      wins += outcome.wins;
      closed += outcome.closed;
    }
    return { segment, wins, closed, rate: closed === 0 ? null : wins / closed };
  });
  let weakest = segmentTotals[0];
  for (const entry of segmentTotals) {
    if (entry.rate === null) continue;
    if (weakest === undefined || weakest.rate === null || entry.rate < weakest.rate) weakest = entry;
  }

  const leader = rows[0];
  const leaderRate = leader ? overallRate(leader) : null;
  const leaderPhrase =
    leader && leaderRate !== null
      ? `${leader.name} lidera, com ${formatPercent(leaderRate, 1)}. `
      : 'Nenhum executivo tem oportunidade fechada para liderar. ';
  const summary =
    leader && weakest && weakest.rate !== null
      ? `Win rate de ${formatInt(data.length)} executivos em ${formatInt(SEGMENTS.length)} segmentos, com o volume escrito em cada célula. ` +
        leaderPhrase +
        `${weakest.segment.label} é o segmento mais fraco: ${formatPercent(weakest.rate, 1)} em ${formatInt(weakest.closed)} fechadas.`
      : 'Matriz de calor sem executivos para comparar.';

  const viewWidth = LEFT_W + SEGMENTS.length * (CELL_W + GAP) - GAP;
  const viewHeight = TOP_H + rows.length * (CELL_H + GAP) - GAP;

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-label="Ordenar executivos por" className="flex shrink-0 items-center gap-1.5 text-xs text-text-muted" role="group">
        <span>Ordenar por</span>
        <button
          aria-pressed={mode === 'geral'}
          className={cn(
            'rounded-full border px-2 py-1 leading-none whitespace-nowrap',
            mode === 'geral' ? 'border-line-strong font-medium text-text-primary' : 'border-line-subtle text-text-muted',
          )}
          onClick={() => setMode('geral')}
          type="button"
        >
          Taxa geral
        </button>
        <button
          aria-pressed={mode === 'semelhanca'}
          className={cn(
            'rounded-full border px-2 py-1 leading-none whitespace-nowrap',
            mode === 'semelhanca' ? 'border-line-strong font-medium text-text-primary' : 'border-line-subtle text-text-muted',
          )}
          onClick={() => setMode('semelhanca')}
          type="button"
        >
          Semelhança de perfil
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <svg aria-hidden className="shrink-0" height={viewHeight} viewBox={`0 0 ${String(viewWidth)} ${String(viewHeight)}`} width={viewWidth}>
          {segmentTotals.map((total, columnIndex) => (
            <g key={total.segment.id}>
              <text
                fill="var(--text-secondary)"
                fontSize={12}
                textAnchor="middle"
                x={stepX(columnIndex) + CELL_W / 2}
                y={14}
              >
                {total.segment.label}
              </text>
              <text
                className="font-display tabular-nums"
                fill="var(--text-muted)"
                fontSize={11}
                textAnchor="middle"
                x={stepX(columnIndex) + CELL_W / 2}
                y={29}
              >
                {`${formatInt(total.closed)} fechadas`}
              </text>
            </g>
          ))}
          {rows.map((row, rowIndex) => (
            <g key={row.id}>
              <text
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={12}
                textAnchor="end"
                x={LEFT_W - 8}
                y={stepY(rowIndex) + CELL_H / 2}
              >
                {row.name}
              </text>
              {SEGMENTS.map((segment, columnIndex) => {
                const outcome = row.outcomes[columnIndex];
                const rate = rateOf(outcome);
                const closed = outcome?.closed ?? 0;
                const x = stepX(columnIndex);
                const y = stepY(rowIndex);
                if (rate === null || outcome === undefined) {
                  return (
                    <g key={`${row.id}-${segment.id}`}>
                      <rect
                        fill="none"
                        height={CELL_H - 1}
                        rx={CELL_RADIUS}
                        stroke="var(--text-muted)"
                        strokeWidth={1}
                        width={CELL_W - 1}
                        x={x + 0.5}
                        y={y + 0.5}
                      />
                      <text
                        dominantBaseline="central"
                        fill="var(--text-muted)"
                        fontSize={11}
                        textAnchor="middle"
                        x={x + CELL_W / 2}
                        y={y + CELL_H / 2}
                      >
                        {formatUnavailable()}
                      </text>
                    </g>
                  );
                }
                const bucket = bucketOf(rate);
                const isColumnMax = columnMaxId[columnIndex] === row.id;
                const isThin = closed < MIN_SAMPLE;
                const textColor = TEXT_COLORS[bucket] ?? 'var(--text-primary)';
                return (
                  <g key={`${row.id}-${segment.id}`}>
                    <rect fill={BUCKET_COLORS[bucket]} height={CELL_H} rx={CELL_RADIUS} width={CELL_W} x={x} y={y} />
                    {isColumnMax ? (
                      <rect
                        fill="none"
                        height={CELL_H - 1.5}
                        rx={CELL_RADIUS}
                        stroke="var(--text-primary)"
                        strokeWidth={1.5}
                        width={CELL_W - 1.5}
                        x={x + 0.75}
                        y={y + 0.75}
                      />
                    ) : null}
                    {isThin ? (
                      <rect
                        fill="none"
                        height={CELL_H - 1.5}
                        rx={CELL_RADIUS}
                        stroke="var(--text-muted)"
                        strokeDasharray="3 2"
                        strokeWidth={1.5}
                        width={CELL_W - 1.5}
                        x={x + 0.75}
                        y={y + 0.75}
                      />
                    ) : null}
                    <text
                      className={cn('font-display tabular-nums', isColumnMax && 'font-semibold')}
                      fill={textColor}
                      fontSize={14}
                      textAnchor="middle"
                      x={x + CELL_W / 2}
                      y={y + 16}
                    >
                      {formatPercent(rate, 1)}
                    </text>
                    <text
                      className="font-display tabular-nums"
                      fill={textColor}
                      fontSize={11}
                      textAnchor="middle"
                      x={x + CELL_W / 2}
                      y={y + 30}
                    >
                      {`${formatInt(outcome.wins)} de ${formatInt(closed)}`}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="flex items-center gap-2">
          <span className="font-display tabular-nums text-text-secondary">0%</span>
          <span className="flex items-center gap-0.5">
            {BUCKET_COLORS.map((color, index) => (
              <span
                className="h-3 w-5 rounded-[2px] first:rounded-l-full last:rounded-r-full"
                key={`scale-${String(index)}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </span>
          <span className="font-display tabular-nums text-text-secondary">100%</span>
        </span>
        <span>ganhas sobre fechadas</span>
        <span>contorno cheio: maior taxa do segmento</span>
        <span className="tabular-nums">{`pontilhado: menos de ${formatInt(MIN_SAMPLE)} fechadas`}</span>
      </div>
    </figure>
  );
}
