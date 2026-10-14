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
 * A normalização é uma propriedade, não um estado interno, porque o preview não carrega interação:
 * bruto mostra contagem, e os três modos normalizados trocam a base e a escala junto com ela. A
 * legenda acompanha o modo, e por isso ela lê o mesmo formatador das células.
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

/** Corpo do canvas de 960x480 na moldura card com o caso de uso em uma linha: 894 x 361,5 px. */
const VIEW_W = 894;
const VIEW_H = 361;

const LABEL_RIGHT = 126;
const GRID_X = 134;
const TOP_H = 66;
const CELL_W = 84;
const CELL_H = 34;
const GAP = 2;
const SUPPORT_X = 574;
const SUPPORT_W = 80;
const PANEL_X = 678;
const PRECISION_RIGHT = 812;
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

const MODES: readonly { readonly id: NormalizationMode; readonly label: string; readonly width: number }[] = [
  { id: 'bruto', label: 'bruto', width: 50 },
  { id: 'linha', label: 'por linha', width: 66 },
  { id: 'coluna', label: 'por coluna', width: 76 },
  { id: 'total', label: 'total', width: 46 },
];

/** Taxa de acerto. Denominador zero não tem taxa: devolver zero afirmaria que a conta deu zero. */
function rate(hits: number, base: number): number | null {
  return base <= 0 ? null : hits / base;
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
  mode = 'bruto',
  periodEnd = defaultPeriodEnd,
  height,
  className,
}: ConfusionMatrixProps) {
  const rowTotals = data.map((row) => row.predicted.reduce((sum, value) => sum + value, 0));
  const columnTotals = REASONS.map((_, column) => data.reduce((sum, row) => sum + (row.predicted[column] ?? 0), 0));
  const grandTotal = rowTotals.reduce((sum, value) => sum + value, 0);
  const hits = data.reduce((sum, row, index) => sum + (row.predicted[index] ?? 0), 0);
  const coefficient = matthews(hits, grandTotal, rowTotals, columnTotals);

  const scaled = (value: number, rowTotal: number, columnTotal: number): number | null => {
    if (mode === 'linha') return rate(value, rowTotal);
    if (mode === 'coluna') return rate(value, columnTotal);
    if (mode === 'total') return rate(value, grandTotal);
    return value;
  };
  const writeCell = (value: number | null): string => {
    if (value === null) return formatUnavailable();
    return mode === 'bruto' ? formatInt(value) : formatPercent(value, 0);
  };

  const errors = data.flatMap((row, rowIndex) => {
    if ((rowTotals[rowIndex] ?? 0) === 0) return [];
    return row.predicted.flatMap((value, column) => {
      if (column === rowIndex) return [];
      const magnitude = scaled(value, rowTotals[rowIndex] ?? 0, columnTotals[column] ?? 0);
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
  const modeStart = 82;

  return (
    <div
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={0} y={14}>
          normalização
        </text>
        {MODES.map((option, index) => {
          const offset = MODES.slice(0, index).reduce((sum, previous) => sum + previous.width + 6, 0);
          const active = option.id === mode;
          return (
            <g key={option.id}>
              <rect
                fill={active ? 'var(--surface-sunken)' : 'none'}
                height={20}
                rx={4}
                stroke={active ? 'var(--text-muted)' : 'none'}
                width={option.width}
                x={modeStart + offset}
                y={4}
              />
              <text
                dominantBaseline="central"
                fill={active ? 'var(--text-primary)' : 'var(--text-muted)'}
                fontSize={11}
                textAnchor="middle"
                x={modeStart + offset + option.width / 2}
                y={14}
              >
                {option.label}
              </text>
            </g>
          );
        })}
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
            y={58}
          >
            {reason.label}
          </text>
        ))}
        <text fill="var(--text-secondary)" fontSize={11} textAnchor="end" x={LABEL_RIGHT} y={58}>
          revisado
        </text>
        <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={SUPPORT_X + SUPPORT_W / 2} y={58}>
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
                row.predicted.map((value, column) => {
                  const x = cellX(column);
                  const isHit = column === rowIndex;
                  const magnitude = scaled(value, rowTotal, columnTotals[column] ?? 0);
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

        <line stroke="var(--line-subtle)" strokeWidth={1} x1={SUPPORT_X - 12} x2={SUPPORT_X - 12} y1={30} y2={gridBottom} />
        <line stroke="var(--line-subtle)" strokeWidth={1} x1={PANEL_X - 12} x2={PANEL_X - 12} y1={30} y2={gridBottom} />

        <text fill="var(--text-muted)" fontSize={11} textAnchor="end" x={PRECISION_RIGHT} y={58}>
          precisão
        </text>
        <text fill="var(--text-muted)" fontSize={11} textAnchor="end" x={RECALL_RIGHT} y={58}>
          revocação
        </text>
        {REASONS.map((reason, index) => {
          const precision = rate(data[index]?.predicted[index] ?? 0, columnTotals[index] ?? 0);
          const recall = rate(data[index]?.predicted[index] ?? 0, rowTotals[index] ?? 0);
          const y = cellY(index) + CELL_H / 2;
          return (
            <g key={`classe-${reason.id}`}>
              <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} x={PANEL_X} y={y}>
                {reason.label}
              </text>
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-primary)"
                fontSize={precision === null ? 11 : 12}
                textAnchor="end"
                x={PRECISION_RIGHT}
                y={y}
              >
                {precision === null ? formatUnavailable() : formatPercent(precision, 0)}
              </text>
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-primary)"
                fontSize={recall === null ? 11 : 12}
                textAnchor="end"
                x={RECALL_RIGHT}
                y={y}
              >
                {recall === null ? formatUnavailable() : formatPercent(recall, 0)}
              </text>
            </g>
          );
        })}
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={PANEL_X} y={268}>
          coeficiente de Matthews
        </text>
        <text
          className="font-display tabular-nums"
          dominantBaseline="central"
          fill="var(--text-primary)"
          fontSize={12}
          textAnchor="end"
          x={RECALL_RIGHT}
          y={268}
        >
          {coefficient === null ? formatUnavailable() : formatDecimal(coefficient, 2)}
        </text>

        <rect fill={HIT_FILL} height={14} rx={2} width={20} x={0} y={271} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={26} y={278}>
          acerto, fora da escala
        </text>
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={152} y={278}>
          {mode === 'bruto' ? 'erro, em perdas' : 'erro, % da base'}
        </text>
        {(ceilings ?? []).map((ceiling, step) => (
          <g key={`degrau-${String(step)}`}>
            <rect fill={ERROR_FILLS[step]} height={14} rx={2} width={20} x={248 + step * 82} y={271} />
            <text
              className="tabular-nums"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              x={274 + step * 82}
              y={278}
            >
              {`até ${writeCell(ceiling)}`}
            </text>
          </g>
        ))}

        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={316}>
          {`Linha: motivo confirmado na revisão. Coluna: motivo sugerido pelo classificador. Amostra de ${formatInt(grandTotal)} perdas revisadas até ${formatDate(periodEnd)}.`}
        </text>
        <text fill="var(--text-muted)" fontSize={11} x={0} y={336}>
          Classe sem caso revisado não tem revocação: a conta devolve ausência e a linha vai hachurada.
        </text>
      </svg>
    </div>
  );
}
