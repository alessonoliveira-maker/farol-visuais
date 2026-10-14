import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  outsideDictionary as defaultOutside,
  periodEnd as defaultPeriodEnd,
  RETIRED_STAGE,
  retiredOn as defaultRetiredOn,
  smallBase as defaultSmallBase,
  STAGES,
  type TransitionRow,
} from './data';

/**
 * Matriz de transição no trimestre em que o processo mudou. O assunto desta versão não é o fluxo: é
 * o que fazer quando a matriz encontra os quatro casos que a quebram.
 *
 * A diagonal domina, com quatro em cada cinco movimentos, e por isso fica em neutro e fora do
 * domínio da cor, com o número escrito. Dentro da rampa ela achataria todo o resto numa faixa só.
 *
 * A etapa sem movimento nenhum vira uma faixa com o motivo escrito, e não uma fileira de células
 * apagadas: linha vazia desenhada como célula fraca se lê como movimento pequeno.
 *
 * A linha de base pequena sai da escala e vai vazada, nunca esmaecida por opacidade, porque a
 * opacidade em marca é perda de contraste medida e o degrau mais claro da rampa já não alcança 3:1.
 * O tamanho da base fica escrito na margem, que é o que permite desconfiar do percentual.
 *
 * E o estágio extinto continua na matriz, hachurado e com a data da mudança escrita no rodapé.
 * Apagar a coluna faria os totais do histórico deixarem de fechar sem que ninguém soubesse por quê.
 */
export interface ProcessChangeMatrixProps {
  readonly data?: readonly TransitionRow[];
  readonly smallBase?: number;
  readonly outsideDictionary?: number;
  readonly retiredOn?: string;
  readonly periodEnd?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas de 640x400 na moldura card com o caso de uso em uma linha: 574 x 281,5 px. */
const VIEW_W = 574;
const VIEW_H = 281;

const LABEL_RIGHT = 74;
const GRID_X = 82;
const TOP_H = 28;
const CELL_W = 64;
const CELL_H = 30;
const GAP = 2;
const BASE_X = 486;
const BASE_W = 70;
const HATCH_STEP = 8;
const KNOCKOUT_W = 32;
const KNOCKOUT_H = 20;

const STEPS = 3;
const MOVE_FILLS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
] as const;
/** Os três degraus claros da rampa aceitam o texto principal nos dois temas, medido em 6,33 no pior. */
const MOVE_TEXT = 'var(--text-primary)';
const STAY_FILL = 'var(--surface-sunken)';
const STAY_TEXT = 'var(--text-secondary)';
const OUT_STROKE = 'var(--line-subtle)';
const OUT_TEXT = 'var(--text-muted)';
const HATCH_STROKE = 'var(--text-muted)';

/** Teto de cada degrau por tercil do observado. Lista vazia não tem teto: devolve null, nunca zero. */
function tercileCeilings(values: readonly number[]): readonly number[] | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((first, second) => first - second);
  const size = Math.ceil(sorted.length / STEPS);
  return Array.from({ length: STEPS }, (_, step) => {
    const index = Math.min(sorted.length - 1, (step + 1) * size - 1);
    return sorted[index] ?? 0;
  });
}

/** Devolve a cor do degrau, e não o índice, para o chamador não recontar a rampa. */
function rampFill(value: number, ceilings: readonly number[] | null): string {
  let step = MOVE_FILLS.length - 1;
  for (let candidate = 0; candidate < (ceilings ?? []).length; candidate += 1) {
    if (value <= (ceilings?.[candidate] ?? value)) {
      step = candidate;
      break;
    }
  }
  return MOVE_FILLS[step] ?? STAY_FILL;
}

interface HatchSegment {
  readonly offset: number;
  readonly from: number;
  readonly to: number;
}

/**
 * Segmentos de uma hachura a 45 graus dentro de uma caixa, calculados um a um em vez de saírem de um
 * `pattern`: o serializador do preview precisa resolver cor concreta em cada traço desenhado.
 */
function hatchSegments(width: number, height: number): readonly HatchSegment[] {
  const ticks = Math.ceil((width + height) / HATCH_STEP);
  return Array.from({ length: ticks }, (_, tick): HatchSegment => {
    const offset = tick * HATCH_STEP;
    return { offset, from: Math.max(0, offset - width), to: Math.min(height, offset) };
  }).filter((segment) => segment.to > segment.from);
}

export default function ProcessChangeMatrix({
  data = defaultData,
  smallBase = defaultSmallBase,
  outsideDictionary = defaultOutside,
  retiredOn = defaultRetiredOn,
  periodEnd = defaultPeriodEnd,
  height,
  className,
}: ProcessChangeMatrixProps) {
  const columns = [...STAGES, RETIRED_STAGE];
  const retiredColumn = columns.length - 1;
  const totals = data.map((row) => row.to.reduce((sum, value) => sum + value, 0));
  const moved = data.reduce(
    (sum, row, rowIndex) => sum + row.to.reduce((inner, value, column) => (column === rowIndex ? inner : inner + value), 0),
    0,
  );
  const stayed = data.reduce((sum, row, rowIndex) => sum + (row.to[rowIndex] ?? 0), 0);
  const counted = stayed + moved;

  const scaleValues = data.flatMap((row, rowIndex) => {
    const total = totals[rowIndex] ?? 0;
    if (total === 0 || total < smallBase) return [];
    return row.to.filter((value, column) => value > 0 && column !== rowIndex && column !== retiredColumn);
  });
  const ceilings = tercileCeilings(scaleValues);
  const emptyIndex = totals.findIndex((total) => total === 0);
  const emptyLabel = emptyIndex < 0 ? null : (STAGES[emptyIndex]?.label ?? null);
  /** Sem movimento contado não há taxa de permanência: a conta devolve ausência, nunca zero. */
  const stayShare = counted === 0 ? null : stayed / counted;

  const summary =
    stayShare === null
      ? `Matriz de transição entre ${formatInt(STAGES.length)} etapas do funil, sem movimento medido no trimestre.`
      : `Matriz de transição entre ${formatInt(STAGES.length)} etapas do funil em ${formatInt(counted)} movimentos, ` +
        `com ${formatPercent(stayShare, 0)} de permanência na diagonal. ` +
        `${emptyLabel === null ? 'Nenhuma etapa ficou parada' : `A etapa ${emptyLabel} ficou sem movimento no período`}, ` +
        `e o estágio ${RETIRED_STAGE.label} saiu do processo em ${formatDate(retiredOn)}.`;

  const cellX = (column: number): number => GRID_X + column * (CELL_W + GAP);
  const cellY = (rowIndex: number): number => TOP_H + rowIndex * (CELL_H + GAP);
  const gridWidth = columns.length * (CELL_W + GAP) - GAP;

  return (
    <div
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {columns.map((stage, column) => (
          <text
            fill={column === retiredColumn ? 'var(--text-secondary)' : 'var(--text-muted)'}
            fontSize={11}
            key={stage.id}
            textAnchor="middle"
            x={cellX(column) + CELL_W / 2}
            y={20}
          >
            {stage.label}
          </text>
        ))}
        <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={BASE_X + BASE_W / 2} y={20}>
          movimentos
        </text>

        {data.map((row, rowIndex) => {
          const y = cellY(rowIndex);
          const total = totals[rowIndex] ?? 0;
          const thin = total > 0 && total < smallBase;
          return (
            <g key={row.from}>
              <text
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={11}
                textAnchor="end"
                x={LABEL_RIGHT}
                y={y + CELL_H / 2}
              >
                {STAGES[rowIndex]?.label ?? row.from}
              </text>

              {total === 0 ? (
                <g>
                  <rect
                    fill="none"
                    height={CELL_H - 1}
                    rx={2}
                    stroke={OUT_STROKE}
                    width={gridWidth - 1}
                    x={GRID_X + 0.5}
                    y={y + 0.5}
                  />
                  <text
                    dominantBaseline="central"
                    fill={OUT_TEXT}
                    fontSize={11}
                    textAnchor="middle"
                    x={GRID_X + gridWidth / 2}
                    y={y + CELL_H / 2}
                  >
                    sem movimento no período
                  </text>
                </g>
              ) : (
                row.to.map((value, column) => {
                  const x = cellX(column);
                  const isStay = column === rowIndex;
                  const isRetired = column === retiredColumn;
                  const outOfScale = thin || isRetired;
                  const fill = outOfScale ? 'none' : isStay ? STAY_FILL : rampFill(value, ceilings);
                  const textFill = outOfScale ? OUT_TEXT : isStay ? STAY_TEXT : MOVE_TEXT;
                  return (
                    <g key={`${row.from}-${String(column)}`}>
                      <rect
                        fill={fill}
                        height={outOfScale ? CELL_H - 1 : CELL_H}
                        rx={2}
                        stroke={outOfScale ? OUT_STROKE : 'none'}
                        width={outOfScale ? CELL_W - 1 : CELL_W}
                        x={outOfScale ? x + 0.5 : x}
                        y={outOfScale ? y + 0.5 : y}
                      />
                      {isRetired
                        ? hatchSegments(CELL_W, CELL_H).map((segment) => (
                            <line
                              key={`hachura-${String(segment.offset)}`}
                              stroke={HATCH_STROKE}
                              strokeWidth={1}
                              x1={x + segment.offset - segment.from}
                              x2={x + segment.offset - segment.to}
                              y1={y + segment.from}
                              y2={y + segment.to}
                            />
                          ))
                        : null}
                      {isRetired ? (
                        <rect
                          fill="var(--surface-raised)"
                          height={KNOCKOUT_H}
                          width={KNOCKOUT_W}
                          x={x + CELL_W / 2 - KNOCKOUT_W / 2}
                          y={y + CELL_H / 2 - KNOCKOUT_H / 2}
                        />
                      ) : null}
                      <text
                        className="font-display tabular-nums"
                        dominantBaseline="central"
                        fill={textFill}
                        fontSize={12}
                        textAnchor="middle"
                        x={x + CELL_W / 2}
                        y={y + CELL_H / 2}
                      >
                        {formatInt(value)}
                      </text>
                    </g>
                  );
                })
              )}

              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill={thin ? OUT_TEXT : 'var(--text-secondary)'}
                fontSize={12}
                textAnchor="middle"
                x={BASE_X + BASE_W / 2}
                y={y + CELL_H / 2}
              >
                {formatInt(total)}
              </text>
            </g>
          );
        })}

        <line
          stroke="var(--line-subtle)"
          strokeWidth={1}
          x1={BASE_X - 10}
          x2={BASE_X - 10}
          y1={10}
          y2={cellY(Math.max(0, data.length - 1)) + CELL_H}
        />

        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={0} y={206}>
          movimento
        </text>
        {(ceilings ?? []).map((ceiling, step) => (
          <g key={`degrau-${String(step)}`}>
            <rect fill={MOVE_FILLS[step]} height={14} rx={2} width={20} x={72 + step * 68} y={199} />
            <text
              className="tabular-nums"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              x={98 + step * 68}
              y={206}
            >
              {`até ${formatInt(ceiling)}`}
            </text>
          </g>
        ))}

        <rect fill={STAY_FILL} height={14} rx={2} width={20} x={0} y={223} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={26} y={230}>
          ficou na etapa
        </text>
        <rect fill="none" height={13} rx={2} stroke={OUT_STROKE} width={19} x={116.5} y={223.5} />
        <text className="tabular-nums" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={142} y={230}>
          {`base menor que ${formatInt(smallBase)}`}
        </text>
        <g>
          <rect fill="none" height={13} rx={2} stroke={OUT_STROKE} width={19} x={258.5} y={223.5} />
          {hatchSegments(19, 13).map((segment) => (
            <line
              key={`amostra-${String(segment.offset)}`}
              stroke={HATCH_STROKE}
              strokeWidth={1}
              x1={258.5 + segment.offset - segment.from}
              x2={258.5 + segment.offset - segment.to}
              y1={223.5 + segment.from}
              y2={223.5 + segment.to}
            />
          ))}
        </g>
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={284} y={230}>
          estágio extinto
        </text>

        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={256}>
          {`${RETIRED_STAGE.label} saiu do processo em ${formatDate(retiredOn)} e a coluna guarda só o histórico.`}
        </text>
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={274}>
          {`${formatInt(outsideDictionary)} movimentos caíram fora do dicionário e vão contados à parte. Até ${formatDate(periodEnd)}.`}
        </text>
      </svg>
    </div>
  );
}
