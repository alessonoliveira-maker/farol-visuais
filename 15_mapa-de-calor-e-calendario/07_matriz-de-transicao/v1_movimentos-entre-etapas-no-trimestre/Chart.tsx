import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, OUTCOMES, STAGES, type TransitionRow } from './data';

/**
 * Matriz de transição: a etapa de origem na linha, a de destino na coluna, e a contagem de
 * movimentos na célula. A mesma lista de etapas nos dois eixos, na ordem do funil, é o que dá
 * sentido geométrico à leitura: acima da diagonal são avanços, abaixo são retrocessos, e a diagonal
 * é quem ficou parado.
 *
 * Duas decisões sustentam a honestidade do desenho. A permanência fica fora da escala de cor,
 * porque é quase sempre o maior número da linha e achataria todo o resto numa faixa só. E o
 * retrocesso, que costuma ser pequeno e sumir numa rampa sequencial, ganha contorno próprio: é
 * exatamente a classe de movimento que um Sankey esconde ao desenhar o funil sempre para a frente.
 */
export interface StageTransitionMatrixProps {
  readonly data?: readonly TransitionRow[];
  readonly height?: number;
  readonly className?: string;
}

const CELL_W = 56;
const CELL_H = 30;
const GAP = 2;
/** Vão extra antes das colunas terminais: Ganha e Perdida não são etapa do funil. */
const OUTCOME_GAP = 14;
const LEFT_W = 86;
const TOP_H = 36;

const BUCKET_COLORS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const TEXT_COLORS = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
const STAY_COLOR = 'var(--surface-sunken)';

export default function StageTransitionMatrix({ data = defaultData, height, className }: StageTransitionMatrixProps) {
  const columns = STAGES.length + OUTCOMES.length;

  /** O domínio da cor ignora a diagonal: a permanência entra depois, em neutro e com o valor escrito. */
  const moving = data.flatMap((row) => {
    const originIndex = STAGES.findIndex((stage) => stage.id === row.from);
    return [...row.toStages.filter((_, index) => index !== originIndex), ...row.toOutcomes];
  });
  const max = moving.length > 0 ? Math.max(...moving) : 0;

  const bucketOf = (value: number): number => {
    if (max <= 0) return 0;
    const step = Math.ceil((value / max) * BUCKET_COLORS.length);
    return Math.min(BUCKET_COLORS.length - 1, Math.max(0, step - 1));
  };

  const stepX = (columnIndex: number): number =>
    LEFT_W + columnIndex * (CELL_W + GAP) + (columnIndex >= STAGES.length ? OUTCOME_GAP : 0);
  const stepY = (rowIndex: number): number => TOP_H + rowIndex * (CELL_H + GAP);

  const advances = data.reduce((sum, row) => {
    const originIndex = STAGES.findIndex((stage) => stage.id === row.from);
    return sum + row.toStages.reduce((inner, value, index) => (index > originIndex ? inner + value : inner), 0);
  }, 0);
  const setbacks = data.reduce((sum, row) => {
    const originIndex = STAGES.findIndex((stage) => stage.id === row.from);
    return sum + row.toStages.reduce((inner, value, index) => (index < originIndex ? inner + value : inner), 0);
  }, 0);
  const biggest = data.reduce<{ from: string; to: string; value: number } | null>((best, row) => {
    const originIndex = STAGES.findIndex((stage) => stage.id === row.from);
    let local = best;
    row.toStages.forEach((value, index) => {
      if (index === originIndex) return;
      if (local === null || value > local.value) {
        local = { from: STAGES[originIndex]?.label ?? '', to: STAGES[index]?.label ?? '', value };
      }
    });
    return local;
  }, null);

  const summary =
    biggest === null
      ? 'Matriz de transição sem movimento no período.'
      : `Matriz de transição entre ${formatInt(STAGES.length)} etapas do funil no trimestre. ` +
        `O maior fluxo é ${biggest.from} para ${biggest.to}, com ${formatInt(biggest.value)} movimentos. ` +
        `Foram ${formatInt(advances)} avanços contra ${formatInt(setbacks)} retrocessos.`;

  const viewWidth = LEFT_W + columns * (CELL_W + GAP) - GAP + OUTCOME_GAP;
  const viewHeight = TOP_H + data.length * (CELL_H + GAP) - GAP;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <svg aria-hidden className="h-full max-w-full" viewBox={`0 0 ${String(viewWidth)} ${String(viewHeight)}`}>
          {/* Rótulo de coluna alternado em duas alturas: "Qualificação" em 11 px é mais largo que a
              célula, e escalonar resolve sem encolher o texto abaixo do piso da TIP-2. */}
          {[...STAGES, ...OUTCOMES].map((stage, columnIndex) => {
            const upper = columnIndex % 2 === 0;
            const centerX = stepX(columnIndex) + CELL_W / 2;
            return (
              <g key={stage.id}>
                <text
                  fill={columnIndex >= STAGES.length ? 'var(--text-secondary)' : 'var(--text-muted)'}
                  fontSize={11}
                  textAnchor="middle"
                  x={centerX}
                  y={upper ? 11 : 26}
                >
                  {stage.label}
                </text>
                {upper ? (
                  <line
                    stroke="var(--line-subtle)"
                    strokeWidth={1}
                    x1={centerX}
                    x2={centerX}
                    y1={15}
                    y2={TOP_H - 4}
                  />
                ) : null}
              </g>
            );
          })}

          {data.map((row, rowIndex) => {
            const originIndex = STAGES.findIndex((stage) => stage.id === row.from);
            return (
              <g key={row.from}>
                <text
                  dominantBaseline="central"
                  fill="var(--text-secondary)"
                  fontSize={11}
                  textAnchor="end"
                  x={LEFT_W - 8}
                  y={stepY(rowIndex) + CELL_H / 2}
                >
                  {STAGES[originIndex]?.label ?? row.from}
                </text>

                {[...row.toStages, ...row.toOutcomes].map((value, columnIndex) => {
                  const x = stepX(columnIndex);
                  const y = stepY(rowIndex);
                  const isStay = columnIndex === originIndex;
                  const isSetback = columnIndex < originIndex;
                  const bucket = bucketOf(value);
                  const textColor = isStay || value === 0 ? 'var(--text-muted)' : TEXT_COLORS[bucket];
                  return (
                    <g key={`${row.from}-${String(columnIndex)}`}>
                      <rect
                        fill={isStay || value === 0 ? STAY_COLOR : BUCKET_COLORS[bucket]}
                        height={CELL_H}
                        rx={2}
                        width={CELL_W}
                        x={x}
                        y={y}
                      />
                      {isSetback && value > 0 ? (
                        <rect
                          fill="none"
                          height={CELL_H - 1.5}
                          rx={2}
                          stroke="var(--negative)"
                          strokeWidth={1.5}
                          width={CELL_W - 1.5}
                          x={x + 0.75}
                          y={y + 0.75}
                        />
                      ) : null}
                      <text
                        className="font-display tabular-nums"
                        dominantBaseline="central"
                        fill={textColor}
                        fontSize={12}
                        textAnchor="middle"
                        x={x + CELL_W / 2}
                        y={y + CELL_H / 2}
                      >
                        {formatInt(value)}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          <line
            stroke="var(--line-subtle)"
            strokeWidth={1}
            x1={stepX(STAGES.length) - OUTCOME_GAP / 2}
            x2={stepX(STAGES.length) - OUTCOME_GAP / 2}
            y1={0}
            y2={viewHeight}
          />
        </svg>
      </div>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="flex items-center gap-1">
          <span className="font-display tabular-nums">{formatInt(1)}</span>
          {BUCKET_COLORS.map((color) => (
            <span className="h-3 w-4 rounded-[2px]" key={color} style={{ backgroundColor: color }} />
          ))}
          <span className="font-display tabular-nums">{formatInt(max)}</span>
        </span>
        <span>movimentos no trimestre</span>
        <span>diagonal: ficou na etapa, fora da escala</span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-4 rounded-[2px] border" style={{ borderColor: 'var(--negative)' }} />
          <span className="tabular-nums">{`retrocesso, ${formatInt(setbacks)} contra ${formatInt(advances)} avanços`}</span>
        </span>
      </div>
    </figure>
  );
}
