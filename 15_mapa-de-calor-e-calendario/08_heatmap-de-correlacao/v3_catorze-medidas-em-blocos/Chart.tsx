import { Filter } from 'lucide-react';

import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BLOCKS, data as defaultData, MEASURES, OBSERVATIONS } from './data';

/**
 * Matriz de correlação de catorze medidas, com a força no tamanho da marca e o sinal na forma dela.
 * Quatro decisões sustentam a densidade.
 *
 * A cor sai do canal principal. Com catorze medidas não cabe número em célula nenhuma, e sem número
 * escrito a cor não sustenta mais de dois níveis nesta paleta; então quem carrega a força é a ÁREA da
 * marca, que é contínua, e a cor fica só com o sinal.
 *
 * O sinal tem dois canais, cor e forma: círculo quando as duas medidas andam no mesmo sentido,
 * losango de área igual quando andam em sentido contrário. A forma se lê em qualquer tamanho, e a cor
 * sozinha não seria pista suficiente.
 *
 * O nome de cada medida mora na DIAGONAL, não nos dois eixos: o triângulo inferior deixa o espaço à
 * direita de cada diagonal livre, e ali o nome cabe inteiro, na horizontal, sem número de índice e
 * sem reticência. Assim as catorze medidas se nomeiam uma vez cada, e a coluna de uma marca se lê no
 * nome que começa logo acima dela.
 *
 * A ordem é a do agrupamento e os blocos se separam por ESPAÇO, nunca por linha: um traço atravessando
 * a grade não tem token que alcance contraste contra a marca preenchida e contra o cartão ao mesmo
 * tempo.
 */
export interface BlockedCorrelationMatrixProps {
  readonly data?: readonly (readonly number[])[];
  readonly observations?: number;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Corpo do canvas de 640 x 620 na moldura `card`: 574 x 501,5 px com o caso de uso em uma linha e
 * 574 x 485 px em duas. O `viewBox` vai na altura do pior caso, para a escala do SVG sair 1 nas duas
 * alturas de cabeçalho.
 */
const VIEW_W = 574;
const VIEW_H = 484;
const TOP_H = 18;
const HEAD_BASELINE = 12;
const CELL_W = 31;
const CELL_H = 26;
const STEP_X = 33;
const STEP_Y = 28;
/** Vão extra entre blocos. Espaço separa grupos; borda não. */
const GROUP_GAP = 6;
/** Raio do círculo em módulo 1. O losango de área igual chega a 12 px de meia diagonal, que é o teto da célula. */
const RADIUS_MAX = 9.5;
/** Meia diagonal do losango de área igual à do círculo: raiz de pi sobre 2. */
const DIAMOND_FACTOR = 1.2533;
/** Degraus fixos da régua de tamanho. O último degrau é o máximo observado, calculado do dado. */
const RULER_STEPS = [0.2, 0.5] as const;
const RULER_LABEL_X = 0;
const RULER_CENTERS = [112, 176, 242] as const;
const RULER_TEXT_GAP = 12;
const SHAPE_CIRCLE_X = 310;
const SHAPE_DIAMOND_X = 410;
const SHAPE_RADIUS = 5;
const FOOTER_ONE = 438;
const FOOTER_TWO = 454;
const FOOTER_THREE = 470;
const POSITIVE_COLOR = 'var(--chart-1)';
const NEGATIVE_COLOR = 'var(--chart-5)';
const SAMPLE_COLOR = 'var(--text-muted)';

/** Deslocamento de cada índice, com o vão extra somado a cada troca de bloco. */
function offsets(step: number): readonly number[] {
  const result: number[] = [];
  let extra = 0;
  for (let index = 0; index < MEASURES.length; index += 1) {
    const previous = MEASURES[index - 1];
    const current = MEASURES[index];
    if (previous !== undefined && current !== undefined && previous.blockId !== current.blockId) {
      extra += GROUP_GAP;
    }
    result.push(index * step + extra);
  }
  return result;
}

const COLUMN_X = offsets(STEP_X);
const ROW_Y = offsets(STEP_Y);

/** Módulo médio de uma lista de coeficientes. Lista vazia não tem média, e `null` diz isso. */
function meanAbsolute(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + Math.abs(value), 0) / values.length;
}

/** Maior módulo da matriz. Sem par, não há máximo. */
function maxAbsolute(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((best, value) => Math.max(best, Math.abs(value)), 0);
}

function radiusOf(value: number): number {
  return RADIUS_MAX * Math.sqrt(Math.abs(value));
}

/** Losango em pontos explícitos: `transform` em forma cega as guardas de marca do preview. */
function diamondPoints(cx: number, cy: number, radius: number): string {
  const half = radius * DIAMOND_FACTOR;
  return [
    `${String(cx)},${String(cy - half)}`,
    `${String(cx + half)},${String(cy)}`,
    `${String(cx)},${String(cy + half)}`,
    `${String(cx - half)},${String(cy)}`,
  ].join(' ');
}

export default function BlockedCorrelationMatrix({
  data = defaultData,
  observations = OBSERVATIONS,
  height,
  className,
}: BlockedCorrelationMatrixProps) {
  const pairs = data.flatMap((row, rowIndex) =>
    row.map((value, columnIndex) => ({
      value,
      rowMeasure: MEASURES[rowIndex + 1],
      columnMeasure: MEASURES[columnIndex],
    })),
  );
  const firstBlock = BLOCKS[0]?.id;
  const secondBlock = BLOCKS[1]?.id;
  const withinFirst = meanAbsolute(
    pairs
      .filter((pair) => pair.rowMeasure?.blockId === firstBlock && pair.columnMeasure?.blockId === firstBlock)
      .map((pair) => pair.value),
  );
  const acrossFirstSecond = meanAbsolute(
    pairs
      .filter(
        (pair) =>
          (pair.rowMeasure?.blockId === secondBlock && pair.columnMeasure?.blockId === firstBlock) ||
          (pair.rowMeasure?.blockId === firstBlock && pair.columnMeasure?.blockId === secondBlock),
      )
      .map((pair) => pair.value),
  );
  const observed = maxAbsolute(pairs.map((pair) => pair.value));
  const opposite = pairs
    .filter((pair) => pair.value < 0)
    .reduce<(typeof pairs)[number] | null>(
      (best, pair) => (best === null || Math.abs(pair.value) > Math.abs(best.value) ? pair : best),
      null,
    );

  const summary =
    withinFirst === null || acrossFirstSecond === null || opposite === null
      ? 'Matriz de correlação sem par para medir.'
      : `Matriz de correlação de ${formatInt(MEASURES.length)} métricas semanais em ${formatInt(BLOCKS.length)} blocos, na variação semana a semana de ${formatInt(observations)} semanas. ` +
        `O módulo médio dentro do ${BLOCKS[0]?.label ?? ''} é ${formatDecimal(withinFirst, 2)} e cai a ${formatDecimal(acrossFirstSecond, 2)} contra a ${BLOCKS[1]?.label ?? ''}. ` +
        `Mais contrário: ${opposite.rowMeasure?.label ?? ''} com ${opposite.columnMeasure?.label ?? ''}.`;

  if (pairs.length === 0 || observed === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden height={16} width={16} />
        <span>O recorte não tem par de métricas com histórico, então não há correlação a medir.</span>
      </div>
    );
  }

  const rulerSteps = [...RULER_STEPS, observed];

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {BLOCKS.map((block) => {
          const first = MEASURES.findIndex((measure) => measure.blockId === block.id);
          if (first < 0) return null;
          return (
            <text
              fill="var(--text-muted)"
              fontSize={11}
              key={block.id}
              textAnchor="start"
              x={COLUMN_X[first] ?? 0}
              y={HEAD_BASELINE}
            >
              {block.label}
            </text>
          );
        })}

        {/* O nome fica na diagonal e corre para a direita, onde o triângulo inferior deixa espaço
            livre: nenhuma medida fica sem nome, nem a primeira, que só existe como coluna, nem a
            última, que só existe como linha (GEO-13). */}
        {MEASURES.map((measure, index) => (
          <text
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize={11}
            key={measure.id}
            textAnchor="start"
            x={COLUMN_X[index] ?? 0}
            y={TOP_H + (ROW_Y[index] ?? 0) + CELL_H / 2}
          >
            {measure.label}
          </text>
        ))}

        {data.map((row, rowIndex) => {
          const measure = MEASURES[rowIndex + 1];
          const cy = TOP_H + (ROW_Y[rowIndex + 1] ?? 0) + CELL_H / 2;
          return (
            <g key={measure?.id ?? rowIndex}>
              {row.map((value, columnIndex) => {
                const cx = (COLUMN_X[columnIndex] ?? 0) + CELL_W / 2;
                const radius = radiusOf(value);
                const color = value >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;
                const key = `${String(rowIndex)}-${String(columnIndex)}`;
                return value >= 0 ? (
                  <circle cx={cx} cy={cy} fill={color} key={key} r={radius} />
                ) : (
                  <polygon fill={color} key={key} points={diamondPoints(cx, cy, radius)} />
                );
              })}
            </g>
          );
        })}

        <text fill="var(--text-muted)" fontSize={11} x={RULER_LABEL_X} y={FOOTER_ONE}>
          área pelo módulo:
        </text>
        {rulerSteps.map((step, index) => (
          <g key={step}>
            <circle
              cx={RULER_CENTERS[index] ?? 0}
              cy={FOOTER_ONE - 4}
              fill={SAMPLE_COLOR}
              r={RADIUS_MAX * Math.sqrt(step)}
            />
            <text
              className="tabular-nums"
              fill="var(--text-muted)"
              fontSize={11}
              x={(RULER_CENTERS[index] ?? 0) + RULER_TEXT_GAP}
              y={FOOTER_ONE}
            >
              {formatDecimal(step, 2)}
            </text>
          </g>
        ))}
        <circle cx={SHAPE_CIRCLE_X} cy={FOOTER_ONE - 4} fill={POSITIVE_COLOR} r={SHAPE_RADIUS} />
        <text fill="var(--text-muted)" fontSize={11} x={SHAPE_CIRCLE_X + RULER_TEXT_GAP} y={FOOTER_ONE}>
          sobem juntas
        </text>
        <polygon
          fill={NEGATIVE_COLOR}
          points={diamondPoints(SHAPE_DIAMOND_X, FOOTER_ONE - 4, SHAPE_RADIUS)}
        />
        <text fill="var(--text-muted)" fontSize={11} x={SHAPE_DIAMOND_X + RULER_TEXT_GAP} y={FOOTER_ONE}>
          sentido contrário
        </text>

        <text fill="var(--text-muted)" fontSize={11} x={0} y={FOOTER_TWO}>
          os mesmos três blocos, na mesma ordem, nos dois eixos; o vão maior separa bloco de bloco
        </text>
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={FOOTER_THREE}>
          {`Pearson sobre a variação semana a semana de ${formatInt(observations)} semanas fechadas; correlação não é causa`}
        </text>
      </svg>
    </figure>
  );
}
