import { Filter } from 'lucide-react';

import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, EXPECTED_PAIR, MEASURES, OBSERVATIONS, WORKING_PAIR } from './data';

/**
 * Heatmap de correlação para leitura executiva: das 45 células, só as fortes levam número e anel, e
 * o resto fica em cor. Três decisões separam esta versão da matriz completa.
 *
 * A escala é discreta, em três faixas nomeadas na legenda, e não uma rampa contínua. O motivo é
 * medido: sem número escrito na célula a cor não sustenta mais de dois níveis, porque nenhum neutro
 * do Farol alcança 3:1 contra o cartão e a rampa sequencial tem só três degraus úteis. Três faixas
 * com o intervalo escrito afirmam o que a cor de fato entrega.
 *
 * Os polos saem de dois slots categóricos opostos em matiz, ciano e magenta, e não de `--positive`
 * com `--negative`: correlação negativa não é resultado ruim, e vermelho ao lado de verde faz a
 * matriz inteira parecer um placar.
 *
 * A pergunta do cartão tem duas respostas, e as duas estão anotadas: o par que anda junto e o par
 * que a diretoria espera forte e que não aparece, este último com anel tracejado, porque ausência de
 * relação não chama atenção sozinha.
 */
export interface StrongPairsHeatmapProps {
  readonly data?: readonly (readonly number[])[];
  readonly observations?: number;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Corpo do canvas `largo` na moldura `card`: 894 px de largura, e 265 px de altura no pior caso, o
 * do caso de uso em duas linhas. O `viewBox` fica na altura do pior caso para a escala do SVG sair 1
 * nas duas alturas de cabeçalho, que é o conserto da dívida de TAMANHO-TEXTO da v1.
 */
const VIEW_W = 894;
const VIEW_H = 264;
const LEFT_W = 112;
const LABEL_RIGHT = LEFT_W - 8;
const TOP_H = 20;
const HEAD_BASELINE = 12;
const CELL_W = 42;
const CELL_H = 19;
const STEP_X = 48;
const STEP_Y = 24;
/** Acima deste módulo a faixa é forte: número escrito, cor cheia e anel. */
const STRONG = 0.7;
/** Abaixo deste módulo não há relação a afirmar, e a célula sai no neutro. */
const WEAK = 0.3;
const RING_OFFSET = 1.25;
const RING_STROKE = 1.5;
/**
 * Opacidade da faixa moderada. O mínimo medido para a marca composta ficar em 3:1 nos dois temas é
 * 0,66 no ciano e 0,63 no magenta; 0,72 fica acima dos dois com folga e ainda separa a faixa
 * moderada da forte a olho.
 */
const MODERATE_OPACITY = 0.72;
/** Mínimo medido de `--text-muted` é 0,72; 0,78 fica acima e mantém o neutro discreto. */
const NEUTRAL_OPACITY = 0.78;
const MARK_W = 9;
const MARK_H = 6;
const ANNOTATION_X = 562;
const ANNOTATION_Y1 = 96;
const ANNOTATION_Y2 = 118;
const LEGEND_Y1 = 245;
const LEGEND_Y2 = 261;
const SWATCH_W = 14;
const SWATCH_H = 10;
const SWATCH_GAP = 6;
const SLOT_A = 0;
const SLOT_B = 236;
const SLOT_C = 466;
const SLOT_D = 700;
const POSITIVE_COLOR = 'var(--chart-1)';
const NEGATIVE_COLOR = 'var(--chart-5)';
const NEUTRAL_COLOR = 'var(--text-muted)';

/** Sinal tipográfico à mão: `formatDecimal` de número negativo devolve hífen, e hífen não é menos. */
function signed(value: number): string {
  return `${value < 0 ? '−' : ''}${formatDecimal(Math.abs(value), 2)}`;
}

/** Triângulo do sinal, em pontos explícitos: `transform` em forma cega as guardas de marca. */
function markPoints(x: number, y: number, up: boolean): string {
  const left = x - MARK_W / 2;
  const right = x + MARK_W / 2;
  const top = y - MARK_H / 2;
  const bottom = y + MARK_H / 2;
  return up
    ? `${String(left)},${String(bottom)} ${String(right)},${String(bottom)} ${String(x)},${String(top)}`
    : `${String(left)},${String(top)} ${String(right)},${String(top)} ${String(x)},${String(bottom)}`;
}

export default function StrongPairsHeatmap({
  data = defaultData,
  observations = OBSERVATIONS,
  height,
  className,
}: StrongPairsHeatmapProps) {
  const pairs = data.flatMap((row, rowIndex) =>
    row.map((value, columnIndex) => ({
      value,
      from: MEASURES[rowIndex + 1]?.label ?? '',
      to: MEASURES[columnIndex]?.label ?? '',
    })),
  );
  const ranked = [...pairs].sort((left, right) => Math.abs(right.value) - Math.abs(left.value));
  const top = ranked.slice(0, 3);
  const strongCount = pairs.filter((pair) => Math.abs(pair.value) >= STRONG).length;

  const working = data[WORKING_PAIR.rowIndex]?.[WORKING_PAIR.columnIndex];
  const expected = data[EXPECTED_PAIR.rowIndex]?.[EXPECTED_PAIR.columnIndex];
  const workingLabel =
    working === undefined
      ? ''
      : `${MEASURES[WORKING_PAIR.columnIndex]?.label ?? ''} e ${MEASURES[WORKING_PAIR.rowIndex + 1]?.label ?? ''} andam juntos: ${signed(working)}`;
  const expectedLabel =
    expected === undefined
      ? ''
      : `${MEASURES[EXPECTED_PAIR.rowIndex + 1]?.label ?? ''} não acompanham: ${signed(expected)}`;

  const summary =
    top.length === 0
      ? 'Matriz de correlação sem par para medir.'
      : `Matriz de correlação entre ${formatInt(MEASURES.length)} métricas semanais do funil, em ${formatInt(observations)} semanas fechadas, com ${formatInt(strongCount)} pares fortes. ` +
        `Os três mais fortes: ${top.map((pair) => `${pair.from} com ${pair.to}, ${signed(pair.value)}`).join('; ')}.`;

  if (pairs.length === 0) {
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

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {/* A medida 1 só existe como coluna, porque o triângulo inferior descarta a primeira linha:
            sem este rótulo de canto ela fica sem nome em lugar nenhum do cartão (GEO-13). */}
        <text
          className="tabular-nums"
          fill="var(--text-secondary)"
          fontSize={11}
          textAnchor="end"
          x={LABEL_RIGHT}
          y={HEAD_BASELINE}
        >
          {`${formatInt(1)} ${MEASURES[0]?.label ?? ''}`}
        </text>

        {MEASURES.slice(0, data.length).map((measure, columnIndex) => (
          <text
            className="font-display tabular-nums"
            fill="var(--text-muted)"
            fontSize={11}
            key={measure.id}
            textAnchor="middle"
            x={LEFT_W + columnIndex * STEP_X + CELL_W / 2}
            y={HEAD_BASELINE}
          >
            {formatInt(columnIndex + 1)}
          </text>
        ))}

        {data.map((row, rowIndex) => {
          const measure = MEASURES[rowIndex + 1];
          const y = TOP_H + rowIndex * STEP_Y;
          return (
            <g key={measure?.id ?? rowIndex}>
              <text
                className="tabular-nums"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={11}
                textAnchor="end"
                x={LABEL_RIGHT}
                y={y + CELL_H / 2}
              >
                {`${formatInt(rowIndex + 2)} ${measure?.label ?? ''}`}
              </text>
              {row.map((value, columnIndex) => {
                const x = LEFT_W + columnIndex * STEP_X;
                const magnitude = Math.abs(value);
                const strong = magnitude >= STRONG;
                const moderate = !strong && magnitude >= WEAK;
                const fill = magnitude < WEAK ? NEUTRAL_COLOR : value >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;
                const opacity = strong ? 1 : magnitude < WEAK ? NEUTRAL_OPACITY : MODERATE_OPACITY;
                const isExpected =
                  rowIndex === EXPECTED_PAIR.rowIndex && columnIndex === EXPECTED_PAIR.columnIndex;
                return (
                  <g key={`${String(rowIndex)}-${String(columnIndex)}`}>
                    <rect
                      fill={fill}
                      fillOpacity={opacity}
                      height={CELL_H}
                      rx={2}
                      width={CELL_W}
                      x={x}
                      y={y}
                    />
                    {strong ? (
                      <rect
                        fill="none"
                        height={CELL_H + RING_OFFSET * 2}
                        rx={3}
                        stroke="var(--text-primary)"
                        strokeWidth={RING_STROKE}
                        width={CELL_W + RING_OFFSET * 2}
                        x={x - RING_OFFSET}
                        y={y - RING_OFFSET}
                      />
                    ) : null}
                    {isExpected ? (
                      <rect
                        fill="none"
                        height={CELL_H + RING_OFFSET * 2}
                        rx={3}
                        stroke="var(--text-muted)"
                        strokeDasharray="3 2"
                        strokeWidth={RING_STROKE}
                        width={CELL_W + RING_OFFSET * 2}
                        x={x - RING_OFFSET}
                        y={y - RING_OFFSET}
                      />
                    ) : null}
                    {strong ? (
                      <text
                        className="font-display tabular-nums"
                        dominantBaseline="central"
                        fill="var(--surface-raised)"
                        fontSize={11}
                        textAnchor="middle"
                        x={x + CELL_W / 2}
                        y={y + CELL_H / 2}
                      >
                        {signed(value)}
                      </text>
                    ) : null}
                    {moderate ? (
                      <polygon
                        fill="var(--surface-raised)"
                        points={markPoints(x + CELL_W / 2, y + CELL_H / 2, value >= 0)}
                      />
                    ) : null}
                  </g>
                );
              })}
            </g>
          );
        })}

        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={ANNOTATION_X} y={ANNOTATION_Y1}>
          {workingLabel}
        </text>
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={ANNOTATION_X} y={ANNOTATION_Y2}>
          {expectedLabel}
        </text>

        <rect fill={POSITIVE_COLOR} height={SWATCH_H} rx={2} width={SWATCH_W} x={SLOT_A} y={LEGEND_Y1 - 8} />
        <text
          className="tabular-nums"
          fill="var(--text-muted)"
          fontSize={11}
          x={SLOT_A + SWATCH_W + SWATCH_GAP}
          y={LEGEND_Y1}
        >
          {`${formatDecimal(STRONG, 2)} ou mais: sobem juntas`}
        </text>
        <rect fill={NEGATIVE_COLOR} height={SWATCH_H} rx={2} width={SWATCH_W} x={SLOT_B} y={LEGEND_Y1 - 8} />
        <text
          className="tabular-nums"
          fill="var(--text-muted)"
          fontSize={11}
          x={SLOT_B + SWATCH_W + SWATCH_GAP}
          y={LEGEND_Y1}
        >
          {`${formatDecimal(STRONG, 2)} ou mais: sentido contrário`}
        </text>
        <rect
          fill={POSITIVE_COLOR}
          fillOpacity={MODERATE_OPACITY}
          height={SWATCH_H}
          rx={2}
          width={SWATCH_W}
          x={SLOT_C}
          y={LEGEND_Y1 - 8}
        />
        <polygon
          fill="var(--surface-raised)"
          points={markPoints(SLOT_C + SWATCH_W / 2, LEGEND_Y1 - 3, true)}
        />
        <text
          className="tabular-nums"
          fill="var(--text-muted)"
          fontSize={11}
          x={SLOT_C + SWATCH_W + SWATCH_GAP}
          y={LEGEND_Y1}
        >
          {`${formatDecimal(WEAK, 2)} a ${formatDecimal(STRONG - 0.01, 2)}: moderada, sinal na seta`}
        </text>
        <rect
          fill={NEUTRAL_COLOR}
          fillOpacity={NEUTRAL_OPACITY}
          height={SWATCH_H}
          rx={2}
          width={SWATCH_W}
          x={SLOT_D}
          y={LEGEND_Y1 - 8}
        />
        <text
          className="tabular-nums"
          fill="var(--text-muted)"
          fontSize={11}
          x={SLOT_D + SWATCH_W + SWATCH_GAP}
          y={LEGEND_Y1}
        >
          {`abaixo de ${formatDecimal(WEAK, 2)}: sem relação`}
        </text>

        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={LEGEND_Y2}>
          {`Pearson em nível sobre ${formatInt(observations)} semanas fechadas; número e anel só nos pares fortes; anel tracejado: a relação esperada que não apareceu`}
        </text>
      </svg>
    </figure>
  );
}
