import { Filter } from 'lucide-react';
import { useId } from 'react';

import { formatDecimal, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  type CellDatum,
  data as defaultData,
  LEVEL_TRAP,
  MEASURES,
  MIN_PAIRS,
  OBSERVATIONS,
} from './data';

/**
 * Matriz de correlação com os três estados de célula separados no desenho, e não só na prosa.
 *
 * Coeficiente medido sai em cor cheia, com o valor e o número de pares escritos por dentro. A cor
 * carrega só o SINAL, e a força vai escrita: a versão existe para separar estados de célula, não para
 * graduar intensidade, e três faixas de cor competiriam com a leitura que importa aqui.
 *
 * Par com menos de doze pares sai hachurado, com o n escrito: o coeficiente existe na conta e não
 * sustenta leitura, então ele não vira marca. Medida com variância zero não tem coeficiente nenhum, e
 * ali a célula fica vazada, com contorno tracejado e o rótulo único de ausência do Farol. Zero ali
 * seria afirmação: diria que as duas medidas não têm relação, quando não há relação a afirmar.
 *
 * O n vai em TODA célula porque a exclusão é por par: cada célula usa só as semanas em que as duas
 * medidas existem, então vizinhas na mesma linha têm amostras diferentes e a matriz não tem um n só.
 */
export interface PartialPairsHeatmapProps {
  readonly data?: readonly (readonly CellDatum[])[];
  readonly observations?: number;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Corpo do canvas `quadrado` na moldura `card`: 422 x 372 px com o caso de uso em uma linha e
 * 422 x 355,5 px em duas. O `viewBox` vai na altura do pior caso, para a escala do SVG sair 1 nas
 * duas alturas de cabeçalho.
 */
const VIEW_W = 422;
const VIEW_H = 355;
const LEFT_W = 82;
const LABEL_RIGHT = LEFT_W - 8;
const TOP_H = 32;
/** Altura de linha do cabeçalho. Com 13 px a tinta de "Mídia" ficava a 3,98 px da de "paga", abaixo do respiro de 4. */
const HEAD_LINE = 14;
const HEAD_BOTTOM = TOP_H - 5;
const CELL_W = 64;
const CELL_H = 36;
/** Passo de 68 com célula de 64 deixa 4 px de vão, que é o respiro mínimo entre a tinta de duas células vizinhas. */
const STEP_X = 68;
const STEP_Y = 40;
const HATCH_SIZE = 4;
const HATCH_STROKE = 1.5;
const DASH = '3 2';
const ANNOTATION_Y1 = 250;
const ANNOTATION_Y2 = 266;
const LEGEND_ONE = 292;
const LEGEND_TWO = 308;
const LEGEND_THREE = 324;
const LEGEND_FOUR = 340;
const SWATCH_W = 14;
const SWATCH_H = 10;
const SWATCH_GAP = 6;
const SLOT_TWO_A = 110;
const SLOT_TWO_B = 140;
const POSITIVE_COLOR = 'var(--chart-1)';
const NEGATIVE_COLOR = 'var(--chart-5)';

/** Sinal tipográfico à mão: `formatDecimal` de número negativo devolve hífen, e hífen não é menos. */
function signed(value: number): string {
  return `${value < 0 ? '−' : ''}${formatDecimal(Math.abs(value), 2)}`;
}

function pairsLabel(pairs: number): string {
  return `${formatInt(pairs)} pares`;
}

export default function PartialPairsHeatmap({
  data = defaultData,
  observations = OBSERVATIONS,
  height,
  className,
}: PartialPairsHeatmapProps) {
  const hatchId = useId();

  const cells = data.flatMap((row, rowIndex) =>
    row.map((cell, columnIndex) => ({
      cell,
      rowIndex,
      columnIndex,
    })),
  );
  const measured = cells.filter(
    (entry) => entry.cell.coefficient !== null && entry.cell.pairs >= MIN_PAIRS,
  ).length;
  const thin = cells.filter(
    (entry) => entry.cell.coefficient !== null && entry.cell.pairs < MIN_PAIRS,
  ).length;
  const undefinedCount = cells.filter((entry) => entry.cell.coefficient === null).length;
  const constantMeasure = MEASURES.find((measure) => measure.constant);

  const trap = data[LEVEL_TRAP.rowIndex]?.[LEVEL_TRAP.columnIndex]?.coefficient;
  const trapRow = MEASURES[LEVEL_TRAP.rowIndex + 1]?.label ?? '';
  const trapColumn = MEASURES[LEVEL_TRAP.columnIndex]?.label ?? '';

  const summary =
    cells.length === 0
      ? 'Matriz de correlação sem par para medir.'
      : `Matriz de correlação entre ${formatInt(MEASURES.length)} medidas semanais em ${formatInt(observations)} semanas, com ${formatInt(cells.length)} pares: ` +
        `${formatInt(measured)} têm coeficiente, ${formatInt(thin)} saem hachurados por menos de ${formatInt(MIN_PAIRS)} pares ` +
        `e em ${formatInt(undefinedCount)} ele fica ${formatUnavailable()}, porque ${constantMeasure?.label ?? ''} não variou.`;

  if (cells.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden height={16} width={16} />
        <span>O recorte não tem par de medidas com histórico, então não há correlação a medir.</span>
      </div>
    );
  }

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <defs>
          <pattern
            height={HATCH_SIZE}
            id={hatchId}
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
            width={HATCH_SIZE}
          >
            <rect fill="var(--surface-raised)" height={HATCH_SIZE} width={HATCH_SIZE} x={0} y={0} />
            <line stroke="var(--text-muted)" strokeWidth={HATCH_STROKE} x1={0} x2={0} y1={0} y2={HATCH_SIZE} />
          </pattern>
        </defs>

        {/* Os dois eixos levam o nome da medida. O triângulo inferior descarta a primeira linha e a
            última coluna, então numerar um dos eixos deixaria a medida 1 sem nome (GEO-13). */}
        {MEASURES.slice(0, data.length).map((measure, columnIndex) => (
          <g key={measure.id}>
            {measure.columnLines.map((line, lineIndex) => (
              <text
                fill="var(--text-secondary)"
                fontSize={11}
                key={`${measure.id}-${String(lineIndex)}`}
                textAnchor="middle"
                x={LEFT_W + columnIndex * STEP_X + CELL_W / 2}
                y={HEAD_BOTTOM - (measure.columnLines.length - 1 - lineIndex) * HEAD_LINE}
              >
                {line}
              </text>
            ))}
          </g>
        ))}

        {data.map((row, rowIndex) => {
          const measure = MEASURES[rowIndex + 1];
          const y = TOP_H + rowIndex * STEP_Y;
          return (
            <g key={measure?.id ?? rowIndex}>
              <text
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={11}
                textAnchor="end"
                x={LABEL_RIGHT}
                y={y + CELL_H / 2}
              >
                {measure?.label ?? ''}
              </text>
              {row.map((cell, columnIndex) => {
                const x = LEFT_W + columnIndex * STEP_X;
                const key = `${String(rowIndex)}-${String(columnIndex)}`;
                const value = cell.coefficient;
                if (value === null) {
                  return (
                    <g key={key}>
                      <rect
                        fill="none"
                        height={CELL_H}
                        rx={2}
                        stroke="var(--text-muted)"
                        strokeDasharray={DASH}
                        width={CELL_W}
                        x={x}
                        y={y}
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
                if (cell.pairs < MIN_PAIRS) {
                  return (
                    <g key={key}>
                      <rect fill={`url(#${hatchId})`} height={CELL_H} rx={2} width={CELL_W} x={x} y={y} />
                      {/* A tinta cruza a hachura, então leva halo na cor da superfície (ROT-7): sem
                          ele as diagonais passam por dentro dos glifos e o n deixa de se ler. */}
                      <text
                        className="tabular-nums"
                        dominantBaseline="central"
                        fill="var(--text-muted)"
                        fontSize={11}
                        style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
                        textAnchor="middle"
                        x={x + CELL_W / 2}
                        y={y + CELL_H / 2}
                      >
                        {pairsLabel(cell.pairs)}
                      </text>
                    </g>
                  );
                }
                return (
                  <g key={key}>
                    <rect
                      fill={value >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
                      height={CELL_H}
                      rx={2}
                      width={CELL_W}
                      x={x}
                      y={y}
                    />
                    <text
                      className="font-display tabular-nums"
                      dominantBaseline="central"
                      fill="var(--surface-raised)"
                      fontSize={12}
                      textAnchor="middle"
                      x={x + CELL_W / 2}
                      y={y + 13}
                    >
                      {signed(value)}
                    </text>
                    <text
                      className="tabular-nums"
                      dominantBaseline="central"
                      fill="var(--surface-raised)"
                      fontSize={11}
                      textAnchor="middle"
                      x={x + CELL_W / 2}
                      y={y + 27}
                    >
                      {pairsLabel(cell.pairs)}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={ANNOTATION_Y1}>
          {trap === undefined || trap === null
            ? ''
            : `${trapRow} e ${trapColumn}: ${signed(trap)} em nível`}
        </text>
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={ANNOTATION_Y2}>
          {`na variação é ${signed(LEVEL_TRAP.onVariation)}; era tendência comum`}
        </text>

        <rect fill={POSITIVE_COLOR} height={SWATCH_H} rx={2} width={SWATCH_W} x={0} y={LEGEND_ONE - 8} />
        <text fill="var(--text-muted)" fontSize={11} x={SWATCH_W + SWATCH_GAP} y={LEGEND_ONE}>
          sobem juntas
        </text>
        <rect
          fill={NEGATIVE_COLOR}
          height={SWATCH_H}
          rx={2}
          width={SWATCH_W}
          x={SLOT_TWO_A}
          y={LEGEND_ONE - 8}
        />
        <text fill="var(--text-muted)" fontSize={11} x={SLOT_TWO_A + SWATCH_W + SWATCH_GAP} y={LEGEND_ONE}>
          sentido contrário
        </text>

        <rect fill={`url(#${hatchId})`} height={SWATCH_H} rx={2} width={SWATCH_W} x={0} y={LEGEND_TWO - 8} />
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={SWATCH_W + SWATCH_GAP} y={LEGEND_TWO}>
          {`menos de ${formatInt(MIN_PAIRS)} pares`}
        </text>
        <rect
          fill="none"
          height={SWATCH_H}
          rx={2}
          stroke="var(--text-muted)"
          strokeDasharray={DASH}
          width={SWATCH_W}
          x={SLOT_TWO_B}
          y={LEGEND_TWO - 8}
        />
        <text fill="var(--text-muted)" fontSize={11} x={SLOT_TWO_B + SWATCH_W + SWATCH_GAP} y={LEGEND_TWO}>
          variância zero
        </text>

        <text fill="var(--text-muted)" fontSize={11} x={0} y={LEGEND_THREE}>
          pares: semanas com as duas medidas; a exclusão por par muda a amostra
        </text>
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={LEGEND_FOUR}>
          {`Pearson em nível sobre ${formatInt(observations)} semanas; correlação não é causa`}
        </text>
      </svg>
    </figure>
  );
}
