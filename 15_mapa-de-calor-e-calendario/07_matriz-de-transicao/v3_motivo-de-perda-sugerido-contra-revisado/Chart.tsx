import { Filter } from 'lucide-react';
import { useState } from 'react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatDecimal, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periodEnd as defaultPeriodEnd, REASONS, type ConfusionRow } from './data';

/**
 * Matriz de confusão de um classificador de motivo de perda: na linha o motivo que a revisão humana
 * confirmou, na coluna o motivo que o classificador sugeriu, e os dois nomes escritos no cabeçalho,
 * porque trocar os eixos inverte precisão com revocação sem mudar nada no desenho.
 *
 * A diagonal é o acerto e fica fora da escala de cor, em cor semântica chapada: ela costuma ser o
 * maior número de cada linha e, dentro da rampa, achataria a leitura do erro, que é o assunto do
 * cartão. A rampa cobre só o fora da diagonal, com corte por quartil do observado.
 *
 * A normalização é um seletor de verdade: o modo inicial vem da prop `mode` (o preview desenha o
 * estado inicial) e os quatro botões HTML, com `aria-pressed`, trocam o modo. Bruto mostra contagem,
 * e os três modos normalizados trocam a base e a escala junto com ela. O percentual inteiro de cada
 * linha (ou coluna, ou do total) sai pelo maior resto e soma 100; nos modos por linha e por coluna a
 * diagonal é a revocação ou a precisão arredondada, o mesmo inteiro que o painel escreve ao lado da
 * taxa de uma casa. A legenda lê o mesmo inteiro das células.
 *
 * O caso de divisão por zero está no dado: a classe Fora de hora não tem caso revisado, então a
 * revocação dela não existe. O cálculo devolve null, nunca zero, a linha vai hachurada e o painel
 * escreve a ausência. A precisão dessa classe, ao contrário, tem denominador e vale zero de verdade.
 */
export type NormalizationMode = 'bruto' | 'linha' | 'coluna' | 'total';

export interface ConfusionMatrixProps {
  readonly data?: readonly ConfusionRow[];
  readonly mode?: NormalizationMode;
  readonly periodEnd?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Corpo do canvas de 960x480 na moldura card com o caso de uso em uma linha: 894 x 361,5 px. A
 * fileira HTML do seletor toma SELECTOR_H dessa altura, e o `viewBox` é do que sobra (894 x 337,5),
 * então o `<svg>` continua em escala 1.
 */
const VIEW_W = 894;
const SELECTOR_H = 24;
const VIEW_H = 361 - SELECTOR_H;

const LABEL_RIGHT = 126;
const GRID_X = 134;
const TOP_H = 42;
const CELL_W = 84;
const CELL_H = 34;
const GAP = 2;
const SUPPORT_X = 574;
const SUPPORT_W = 80;
const PANEL_X = 678;
const PRECISION_RIGHT = 818;
const RECALL_RIGHT = 890;
const HATCH_STEP = 9;

const STEPS = 4;
/** Quatro degraus legíveis: sobre os três claros vence o texto principal, sobre o escuro o vazado. */
const ERROR_FILLS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
] as const;
const ERROR_TEXTS = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--surface-raised)',
] as const;
const HIT_FILL = 'var(--positive)';
const HIT_TEXT = 'var(--surface-raised)';
const EMPTY_STROKE = 'var(--line-subtle)';
const HATCH_STROKE = 'var(--text-muted)';

const MODES: readonly { readonly id: NormalizationMode; readonly label: string }[] = [
  { id: 'bruto', label: 'bruto' },
  { id: 'linha', label: 'por linha (revocação)' },
  { id: 'coluna', label: 'por coluna (precisão)' },
  { id: 'total', label: 'total' },
];

/**
 * Taxa de acerto de uma casa com o volume em linha própria: "74,4%" e "410 de 551". Denominador zero
 * não tem taxa: devolve null, porque zero afirmaria que a conta deu zero.
 */
function rateLines(hits: number, base: number): { readonly rate: string; readonly volume: string } | null {
  if (base <= 0) return null;
  return { rate: formatPercent(hits / base, 1), volume: `${formatInt(hits)} de ${formatInt(base)}` };
}

/**
 * Percentual inteiro de cada contagem sobre o total, pelo maior resto, de modo que a soma seja 100.
 * Com `fixed`, essa posição vira o inteiro da taxa arredondada (a diagonal, que é a mesma taxa do
 * painel) e o resto de 100 é repartido entre as demais. Empate de resto desempata pela posição.
 * Total zero devolve null: sem base não há percentual.
 */
function wholePercents(counts: readonly number[], total: number, fixed?: number): readonly number[] | null {
  if (total <= 0) return null;
  const pinned = fixed === undefined ? null : Math.round(((counts[fixed] ?? 0) * 100) / total);
  const floors = counts.map((count, index) => (index === fixed ? (pinned ?? 0) : Math.floor((count * 100) / total)));
  const order = counts
    .flatMap((count, index) => (index === fixed ? [] : [{ index, rest: count * 100 - Math.floor((count * 100) / total) * total }]))
    .sort((first, second) => second.rest - first.rest || first.index - second.index);
  const missing = 100 - floors.reduce((sum, value) => sum + value, 0);
  const result = [...floors];
  for (let step = 0; step < missing; step += 1) {
    const target = order[step]?.index;
    if (target !== undefined) result[target] = (result[target] ?? 0) + 1;
  }
  return result;
}

/**
 * Coeficiente de correlação de Matthews na forma multiclasse. Devolve null quando a dispersão é
 * nula, que é o caso de um classificador que sugeriu uma classe só.
 */
function matthews(
  hits: number,
  total: number,
  rowTotals: readonly number[],
  columnTotals: readonly number[],
): number | null {
  const crossed = rowTotals.reduce((sum, value, index) => sum + value * (columnTotals[index] ?? 0), 0);
  const rowSquares = rowTotals.reduce((sum, value) => sum + value * value, 0);
  const columnSquares = columnTotals.reduce((sum, value) => sum + value * value, 0);
  const spread = (total * total - rowSquares) * (total * total - columnSquares);
  if (spread <= 0) return null;
  return (hits * total - crossed) / Math.sqrt(spread);
}

/** Teto de cada degrau por quartil do observado. Lista vazia não tem teto: devolve null. */
function quartileCeilings(values: readonly number[]): readonly number[] | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((first, second) => first - second);
  const size = Math.ceil(sorted.length / STEPS);
  return Array.from({ length: STEPS }, (_, step) => {
    const index = Math.min(sorted.length - 1, (step + 1) * size - 1);
    return sorted[index] ?? 0;
  });
}

/** Devolve o par de cores do degrau, e não o índice, para o chamador não recontar a rampa. */
function rampStep(
  value: number,
  ceilings: readonly number[] | null,
  fills: readonly string[],
  texts: readonly string[],
): { readonly fill: string; readonly text: string } {
  let step = fills.length - 1;
  for (let candidate = 0; candidate < (ceilings ?? []).length; candidate += 1) {
    if (value <= (ceilings?.[candidate] ?? value)) {
      step = candidate;
      break;
    }
  }
  return { fill: fills[step] ?? HIT_FILL, text: texts[step] ?? HIT_TEXT };
}

export default function ConfusionMatrix({
  data = defaultData,
  mode: initialMode = 'bruto',
  periodEnd = defaultPeriodEnd,
  height,
  className,
}: ConfusionMatrixProps) {
  const [mode, setMode] = useState<NormalizationMode>(initialMode);

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma perda revisada neste recorte: a matriz de confusão não tem amostra.</span>
      </div>
    );
  }

  const rowTotals = data.map((row) => row.predicted.reduce((sum, value) => sum + value, 0));
  const columnTotals = REASONS.map((_, column) => data.reduce((sum, row) => sum + (row.predicted[column] ?? 0), 0));
  const grandTotal = rowTotals.reduce((sum, value) => sum + value, 0);
  const hits = data.reduce((sum, row, index) => sum + (row.predicted[index] ?? 0), 0);
  const coefficient = matthews(hits, grandTotal, rowTotals, columnTotals);

  /** Grade do que a célula escreve: contagem no bruto; no resto, o inteiro do maior resto sobre 100. */
  const grid: readonly (readonly (number | null)[])[] = (() => {
    if (mode === 'bruto') return data.map((row) => row.predicted);
    if (mode === 'linha') {
      return data.map((row, rowIndex) => {
        const percents = wholePercents(row.predicted, rowTotals[rowIndex] ?? 0, rowIndex);
        return row.predicted.map((_, column) => (percents === null ? null : (percents[column] ?? 0) / 100));
      });
    }
    if (mode === 'coluna') {
      const byColumn = REASONS.map((_, column) =>
        wholePercents(
          data.map((row) => row.predicted[column] ?? 0),
          columnTotals[column] ?? 0,
          column,
        ),
      );
      return data.map((row, rowIndex) =>
        row.predicted.map((_, column) => {
          const percents = byColumn[column] ?? null;
          return percents === null ? null : (percents[rowIndex] ?? 0) / 100;
        }),
      );
    }
    const flat = wholePercents(
      data.flatMap((row) => row.predicted),
      grandTotal,
    );
    return data.map((row, rowIndex) =>
      row.predicted.map((_, column) => (flat === null ? null : (flat[rowIndex * REASONS.length + column] ?? 0) / 100)),
    );
  })();
  const writeCell = (value: number | null): string => {
    if (value === null) return formatUnavailable();
    return mode === 'bruto' ? formatInt(value) : formatPercent(value, 0);
  };

  const errors = data.flatMap((row, rowIndex) => {
    if ((rowTotals[rowIndex] ?? 0) === 0) return [];
    return row.predicted.flatMap((value, column) => {
      if (column === rowIndex) return [];
      const magnitude = grid[rowIndex]?.[column] ?? null;
      return magnitude === null ? [] : [{ rowIndex, column, value, magnitude }];
    });
  });
  const ceilings = quartileCeilings(errors.map((cell) => cell.magnitude));
  const worst = errors.reduce<(typeof errors)[number] | null>(
    (best, cell) => (best === null || cell.value > best.value ? cell : best),
    null,
  );

  const summary =
    worst === null
      ? `Matriz de confusão de ${formatInt(REASONS.length)} motivos de perda, sem erro medido na amostra revisada.`
      : `Matriz de confusão de ${formatInt(REASONS.length)} motivos de perda, revisado nas linhas e sugerido nas colunas, ` +
        `sobre ${formatInt(grandTotal)} perdas. O maior erro é ${REASONS[worst.rowIndex]?.label ?? ''} lido como ` +
        `${REASONS[worst.column]?.label ?? ''}, em ${formatInt(worst.value)} perdas. ` +
        `O coeficiente de Matthews é ${coefficient === null ? formatUnavailable() : formatDecimal(coefficient, 2)}.`;

  const cellX = (column: number): number => GRID_X + column * (CELL_W + GAP);
  const cellY = (rowIndex: number): number => TOP_H + rowIndex * (CELL_H + GAP);
  const gridWidth = REASONS.length * (CELL_W + GAP) - GAP;
  const gridBottom = cellY(Math.max(0, data.length - 1)) + CELL_H;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div
        aria-label="Normalização da matriz"
        className="flex shrink-0 items-center gap-1.5 text-xs text-text-muted"
        role="group"
        style={{ height: SELECTOR_H }}
      >
        <span>normalização</span>
        {MODES.map((option) => (
          <button
            aria-pressed={option.id === mode}
            className={cn(
              'rounded-full border px-2 py-1 leading-none whitespace-nowrap',
              option.id === mode ? 'border-line-strong font-medium text-text-primary' : 'border-line-subtle text-text-muted',
            )}
            key={option.id}
            onClick={() => setMode(option.id)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      <svg aria-hidden className="min-h-0 w-full flex-1" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <g>
        <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} textAnchor="end" x={GRID_X + gridWidth} y={14}>
          sugerido pelo classificador
        </text>

        {REASONS.map((reason, column) => (
          <text
            fill="var(--text-muted)"
            fontSize={11}
            key={reason.id}
            textAnchor="middle"
            x={cellX(column) + CELL_W / 2}
            y={34}
          >
            {reason.label}
          </text>
        ))}
        <text fill="var(--text-secondary)" fontSize={11} textAnchor="end" x={LABEL_RIGHT} y={34}>
          revisado
        </text>
        <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={SUPPORT_X + SUPPORT_W / 2} y={34}>
          revisadas
        </text>

        {data.map((row, rowIndex) => {
          const y = cellY(rowIndex);
          const rowTotal = rowTotals[rowIndex] ?? 0;
          return (
            <g key={row.actual}>
              <text
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={11}
                textAnchor="end"
                x={LABEL_RIGHT}
                y={y + CELL_H / 2}
              >
                {REASONS[rowIndex]?.label ?? row.actual}
              </text>

              {rowTotal === 0 ? (
                <g>
                  <rect
                    fill="none"
                    height={CELL_H - 1}
                    rx={2}
                    stroke={EMPTY_STROKE}
                    width={gridWidth - 1}
                    x={GRID_X + 0.5}
                    y={y + 0.5}
                  />
                  {Array.from({ length: Math.ceil((gridWidth + CELL_H) / HATCH_STEP) }, (_, tick) => {
                    const offset = tick * HATCH_STEP;
                    const start = Math.max(0, offset - gridWidth);
                    const end = Math.min(CELL_H, offset);
                    return end <= start ? null : (
                      <line
                        key={`hachura-${String(tick)}`}
                        stroke={HATCH_STROKE}
                        strokeWidth={1}
                        x1={GRID_X + offset - start}
                        x2={GRID_X + offset - end}
                        y1={y + start}
                        y2={y + end}
                      />
                    );
                  })}
                  {/* A tinta de 11 px pede 17 px de marca pela ESP-2, então o recorte da hachura tem 18. */}
                  <rect
                    fill="var(--surface-raised)"
                    height={18}
                    width={80}
                    x={GRID_X + gridWidth / 2 - 40}
                    y={y + CELL_H / 2 - 9}
                  />
                  <text
                    dominantBaseline="central"
                    fill="var(--text-muted)"
                    fontSize={11}
                    textAnchor="middle"
                    x={GRID_X + gridWidth / 2}
                    y={y + CELL_H / 2}
                  >
                    {formatUnavailable()}
                  </text>
                </g>
              ) : (
                row.predicted.map((_, column) => {
                  const x = cellX(column);
                  const isHit = column === rowIndex;
                  const magnitude = grid[rowIndex]?.[column] ?? null;
                  const ramp = magnitude === null ? null : rampStep(magnitude, ceilings, ERROR_FILLS, ERROR_TEXTS);
                  const fill = ramp === null ? 'none' : isHit ? HIT_FILL : ramp.fill;
                  const textFill = ramp === null ? 'var(--text-muted)' : isHit ? HIT_TEXT : ramp.text;
                  return (
                    <g key={`${row.actual}-${String(column)}`}>
                      <rect
                        fill={fill}
                        height={CELL_H}
                        rx={2}
                        stroke={magnitude === null ? EMPTY_STROKE : 'none'}
                        width={CELL_W}
                        x={x}
                        y={y}
                      />
                      <text
                        className="font-display tabular-nums"
                        dominantBaseline="central"
                        fill={textFill}
                        fontSize={magnitude === null ? 11 : 12}
                        textAnchor="middle"
                        x={x + CELL_W / 2}
                        y={y + CELL_H / 2}
                      >
                        {writeCell(magnitude)}
                      </text>
                    </g>
                  );
                })
              )}

              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={12}
                textAnchor="middle"
                x={SUPPORT_X + SUPPORT_W / 2}
                y={y + CELL_H / 2}
              >
                {formatInt(rowTotal)}
              </text>
            </g>
          );
        })}

        <line stroke="var(--line-subtle)" strokeWidth={1} x1={SUPPORT_X - 12} x2={SUPPORT_X - 12} y1={24} y2={gridBottom} />
        <line stroke="var(--line-subtle)" strokeWidth={1} x1={PANEL_X - 12} x2={PANEL_X - 12} y1={6} y2={gridBottom} />

        <text fill="var(--text-muted)" fontSize={11} textAnchor="end" x={PRECISION_RIGHT} y={34}>
          precisão
        </text>
        <text fill="var(--text-muted)" fontSize={11} textAnchor="end" x={RECALL_RIGHT} y={34}>
          revocação
        </text>
        {REASONS.map((reason, index) => {
          const hitsOfClass = data[index]?.predicted[index] ?? 0;
          const precision = rateLines(hitsOfClass, columnTotals[index] ?? 0);
          const recall = rateLines(hitsOfClass, rowTotals[index] ?? 0);
          const y = cellY(index) + CELL_H / 2;
          return (
            <g key={`classe-${reason.id}`}>
              <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} x={PANEL_X} y={y}>
                {reason.label}
              </text>
              {[
                { key: 'precisao', pair: precision, right: PRECISION_RIGHT },
                { key: 'revocacao', pair: recall, right: RECALL_RIGHT },
              ].map((entry) =>
                entry.pair === null ? (
                  <text
                    dominantBaseline="central"
                    fill="var(--text-primary)"
                    fontSize={11}
                    key={entry.key}
                    textAnchor="end"
                    x={entry.right}
                    y={y}
                  >
                    {formatUnavailable()}
                  </text>
                ) : (
                  <g key={entry.key}>
                    <text
                      className="font-display tabular-nums"
                      dominantBaseline="central"
                      fill="var(--text-primary)"
                      fontSize={12}
                      textAnchor="end"
                      x={entry.right}
                      y={y - 7}
                    >
                      {entry.pair.rate}
                    </text>
                    <text
                      className="tabular-nums"
                      dominantBaseline="central"
                      fill="var(--text-muted)"
                      fontSize={11}
                      textAnchor="end"
                      x={entry.right}
                      y={y + 8}
                    >
                      {entry.pair.volume}
                    </text>
                  </g>
                ),
              )}
            </g>
          );
        })}
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={PANEL_X} y={244}>
          coeficiente de Matthews
        </text>
        <text
          className="font-display tabular-nums"
          dominantBaseline="central"
          fill="var(--text-primary)"
          fontSize={12}
          textAnchor="end"
          x={RECALL_RIGHT}
          y={244}
        >
          {coefficient === null ? formatUnavailable() : formatDecimal(coefficient, 2)}
        </text>

        <rect fill={HIT_FILL} height={14} rx={2} width={20} x={0} y={247} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={26} y={254}>
          acerto, fora da escala
        </text>
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={152} y={254}>
          {mode === 'bruto' ? 'erro, em perdas' : 'erro, % da base'}
        </text>
        {(ceilings ?? []).map((ceiling, step) => (
          <g key={`degrau-${String(step)}`}>
            <rect fill={ERROR_FILLS[step]} height={14} rx={2} width={20} x={248 + step * 82} y={247} />
            <text
              className="tabular-nums"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              x={274 + step * 82}
              y={254}
            >
              {`até ${writeCell(ceiling)}`}
            </text>
          </g>
        ))}

        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={292}>
          {`Linha: motivo confirmado na revisão. Coluna: motivo sugerido pelo classificador. Amostra de ${formatInt(grandTotal)} perdas revisadas até ${formatDate(periodEnd)}.`}
        </text>
        <text fill="var(--text-muted)" fontSize={11} x={0} y={312}>
          Classe sem caso revisado não tem revocação: a conta devolve ausência e a linha vai hachurada.
        </text>
        </g>
      </svg>
    </div>
  );
}
