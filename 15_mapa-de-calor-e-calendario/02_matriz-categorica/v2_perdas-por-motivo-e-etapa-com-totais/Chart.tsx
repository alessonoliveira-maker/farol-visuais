import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, STAGES, type LossReasonRow } from './data';

/**
 * Matriz categórica em cor com totais nas margens: motivo de perda nas linhas, etapa do funil nas
 * colunas, contagem de perdas em cada par.
 *
 * DUAS ESCALAS, CADA UMA NOMEADA, e é isto que a versão ensina. A cor do miolo mede a perda do PAR
 * motivo e etapa; o comprimento das barras das margens mede o TOTAL, que é outra grandeza e por isso
 * fica fora da rampa, em `--text-muted`. As duas margens compartilham a mesma régua de comprimento,
 * com teto no maior total observado entre linhas e colunas, para que barras de igual comprimento
 * signifiquem contagens iguais nos dois sentidos; sem isso um total de linha e um de coluna do mesmo
 * tamanho contariam coisas diferentes.
 *
 * QUANTOS NÍVEIS A COR AFIRMA. A rampa desenha cinco degraus, `--seq-1` a `--seq-3` e `--seq-6` a
 * `--seq-7`, pulando `--seq-4` e `--seq-5` porque nenhum texto disponível alcança 4,5:1 contra eles
 * nos dois temas. Medido degrau contra degrau, só o salto de `--seq-3` para `--seq-6` separa de fato
 * (3,03:1 no escuro e 2,84:1 no claro); os outros três vizinhos medem de 1,23:1 a 1,52:1. Então a
 * cor afirma DOIS níveis, baixo e alto, e serve de varredura: a ordem fina mora no número escrito em
 * toda célula, que é a condição da isenção da TOK-8 para usar mais de três degraus.
 *
 * TRÊS ESTADOS DE CÉLULA, em canais diferentes, porque ausência não é zero: par com perdas recebe a
 * faixa e o número; zero medido recebe o poço `--surface-sunken` com contorno sólido e o zero
 * escrito; par sem registro recebe contorno tracejado e o rótulo de ausência por extenso.
 */
export interface LossMatrixWithTotalsProps {
  readonly data?: readonly LossReasonRow[];
  readonly height?: number;
  readonly className?: string;
}

/** O corpo do cartão de 960 x 530 na moldura `card`, medido: 960 − 66 por 530 − 118,5. */
const VIEW_W = 894;
const VIEW_H = 411.5;

const LEFT_W = 150;
const CELL_W = 104;
const CELL_H = 30;
const GAP = 2;
const MARGIN_GAP = 16;
/** Teto comum às duas margens, em px, que a maior das duas somas ocupa por inteiro. */
const BAR_MAX = 54;
const ROW_BAR_H = 12;
const COL_BAR_W = 14;
const VALUE_GAP = 6;
const VALUE_W = 30;

const READ_Y = 12;
const NOTE_Y = 30;
const HEAD_Y = 54;
const GRID_TOP = 64;
const CELL_RADIUS = 2;

/** Largura de tudo o que se desenha, para centrar no corpo em vez de encostar à esquerda (ESP-3). */
const PLOT_W = LEFT_W + STAGES.length * (CELL_W + GAP) - GAP + MARGIN_GAP + BAR_MAX + VALUE_GAP + VALUE_W;
const ORIGIN_X = (VIEW_W - PLOT_W) / 2;
const GRID_LEFT = ORIGIN_X + LEFT_W;
const GRID_RIGHT = GRID_LEFT + STAGES.length * (CELL_W + GAP) - GAP;
const BARS_X = GRID_RIGHT + MARGIN_GAP;
const VALUE_X = BARS_X + BAR_MAX + VALUE_GAP + VALUE_W;

/**
 * Linha de base das barras de coluna. Elas crescem PARA CIMA a partir dela, e não para baixo a
 * partir do topo, para que a base comum fique encostada nos números e o olho compare comprimento sem
 * atravessar um vão que muda de tamanho com o valor.
 */
const BOTTOM_BASE = 350;
const COL_VALUE_Y = 364;
const FOOT_A = 384;
const FOOT_B = 402;
const SWATCH_W = 20;
const SWATCH_H = 12;
const SCALE_BLOCK_W = 96;
/**
 * Paradas da linha de rodapé, medidas pela tabela por glifo de `colisao.mjs` e não pela média por
 * classe: a primeira etiqueta ocupa 268,3 px a partir de 26 px, então a segunda parada em 320 px
 * deixa 25,7 px de respiro, bem acima dos 4 px da ROT-9.
 */
const FOOT_STOP_TWO = 320;
const FOOT_STOP_THREE = 440;

/** Piso da rampa: a faixa mais baixa começa em uma perda, porque zero medido tem desenho próprio. */
const BAND_FLOOR = 1;
/** Cinco degraus com texto legível nos dois temas. `--seq-4` e `--seq-5` não aceitam texto nenhum. */
const BAND_COLORS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
/** Texto do cartão nas três faixas claras da rampa, texto sobre acento nas duas escuras. */
const BAND_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
const BAND_COUNT = BAND_COLORS.length;

function sumOf(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Soma só do que foi medido. `null` quando nada foi medido, porque ausência não soma zero (EST-1b). */
function measuredTotal(counts: readonly (number | null)[]): number | null {
  const measured = counts.filter((count): count is number => count !== null);
  if (measured.length === 0) return null;
  return sumOf(measured);
}

/** Maior valor da lista. `null` na lista vazia, porque `Math.max` de nada devolve infinito. */
function maxOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((champion, value) => (value > champion ? value : champion), values[0] ?? 0);
}

/** Borda inferior da faixa, com a última terminando no maior par observado (ROT-5b). */
function bandEdge(index: number, ceiling: number): number {
  const span = ceiling - BAND_FLOOR + 1;
  return BAND_FLOOR + Math.round((index * span) / BAND_COUNT);
}

function bandOf(value: number, ceiling: number): number {
  for (let index = BAND_COUNT - 1; index > 0; index -= 1) {
    if (value >= bandEdge(index, ceiling)) return index;
  }
  return 0;
}

function columnX(columnIndex: number): number {
  return GRID_LEFT + columnIndex * (CELL_W + GAP);
}

function rowY(rowIndex: number): number {
  return GRID_TOP + rowIndex * (CELL_H + GAP);
}

/** Uma linha da matriz com o total dela já resolvido, para ordenar e desenhar a margem direita. */
interface ReasonTotal {
  readonly row: LossReasonRow;
  readonly total: number;
}

export default function LossMatrixWithTotals({ data = defaultData, height, className }: LossMatrixWithTotalsProps) {
  const reasons: readonly ReasonTotal[] = data
    .map((row) => ({ row, total: measuredTotal(row.byStage) }))
    .filter((entry): entry is ReasonTotal => entry.total !== null)
    .sort((left, right) => right.total - left.total);

  const cellValues = data.flatMap((row) => row.byStage.filter((count): count is number => count !== null && count > 0));
  const ceiling = maxOf(cellValues);

  if (reasons.length === 0 || ceiling === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma perda registrada neste recorte: a matriz não tem o que colorir.</span>
      </div>
    );
  }

  const stageTotals = STAGES.map((stage, columnIndex) => ({
    stage,
    total: measuredTotal(data.map((row) => row.byStage[columnIndex] ?? null)),
  }));
  const grandTotal = sumOf(reasons.map((entry) => entry.total));
  const marginCeiling =
    maxOf([...reasons.map((entry) => entry.total), ...stageTotals.map((entry) => entry.total ?? 0)]) ?? 1;

  let topStage = stageTotals[0];
  for (const entry of stageTotals) {
    if (entry.total === null) continue;
    if (topStage === undefined || topStage.total === null || entry.total > topStage.total) topStage = entry;
  }
  const topStageIndex = STAGES.findIndex((stage) => stage.id === topStage?.stage.id);
  let topReason = reasons[0];
  for (const entry of reasons) {
    const own = entry.row.byStage[topStageIndex] ?? null;
    const best = topReason?.row.byStage[topStageIndex] ?? null;
    if (own === null) continue;
    if (topReason === undefined || best === null || own > best) topReason = entry;
  }
  const topStageTotal = topStage?.total ?? null;
  const topReasonInStage = topReason?.row.byStage[topStageIndex] ?? null;
  const topShare =
    topStageTotal !== null && topStageTotal > 0 && topReasonInStage !== null ? topReasonInStage / topStageTotal : null;
  const leader = reasons[0];

  const note =
    topStage !== undefined && topStageTotal !== null && topReason !== undefined && topShare !== null
      ? `${topStage.stage.label}: ${topReason.row.label} faz ${formatPercent(topShare, 0)} das ${formatInt(topStageTotal)} perdas`
      : null;

  const summary =
    topStage !== undefined && topStageTotal !== null && leader !== undefined && topReason !== undefined && topShare !== null
      ? `Matriz de calor com ${formatInt(grandTotal)} perdas do trimestre em ${formatInt(reasons.length)} motivos por ${formatInt(STAGES.length)} etapas do funil, com o total escrito nas duas margens. ` +
        `${topStage.stage.label} é a etapa com mais perdas, ${formatRateWithVolume(topStageTotal, grandTotal)}, e ${topReason.row.label} responde por ${formatPercent(topShare, 0)} delas.`
      : `Matriz de calor com ${formatInt(grandTotal)} perdas do trimestre em ${formatInt(reasons.length)} motivos por ${formatInt(STAGES.length)} etapas do funil.`;

  return (
    <div
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {topStage === undefined || topStageTotal === null ? null : (
          <text fill="var(--text-secondary)" fontSize={12} x={ORIGIN_X} y={READ_Y}>
            <tspan className="font-semibold" fill="var(--text-primary)">
              {topStage.stage.label}
            </tspan>{' '}
            é a etapa com mais perdas do trimestre:{' '}
            <tspan className="font-display tabular-nums">{formatRateWithVolume(topStageTotal, grandTotal)}</tspan>.
          </text>
        )}
        {note === null ? null : (
          <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={ORIGIN_X} y={NOTE_Y}>
            {note}
          </text>
        )}

        {STAGES.map((stage, columnIndex) => (
          <text
            fill="var(--text-secondary)"
            fontSize={12}
            key={stage.id}
            textAnchor="middle"
            x={columnX(columnIndex) + CELL_W / 2}
            y={HEAD_Y}
          >
            {stage.label}
          </text>
        ))}

        {reasons.map((entry, rowIndex) => {
          const y = rowY(rowIndex);
          return (
            <g key={entry.row.id}>
              <text
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={12}
                textAnchor="end"
                x={GRID_LEFT - 8}
                y={y + CELL_H / 2}
              >
                {entry.row.label}
              </text>

              {STAGES.map((stage, columnIndex) => {
                const value = entry.row.byStage[columnIndex] ?? null;
                const x = columnX(columnIndex);
                const key = `${entry.row.id}-${stage.id}`;
                if (value === null) {
                  return (
                    <g key={key}>
                      <rect
                        fill="none"
                        height={CELL_H - 1}
                        rx={CELL_RADIUS}
                        stroke="var(--text-muted)"
                        strokeDasharray="3 2"
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
                if (value === 0) {
                  return (
                    <g key={key}>
                      <rect
                        fill="var(--surface-sunken)"
                        height={CELL_H - 1}
                        rx={CELL_RADIUS}
                        stroke="var(--text-muted)"
                        width={CELL_W - 1}
                        x={x + 0.5}
                        y={y + 0.5}
                      />
                      <text
                        className="font-display tabular-nums"
                        dominantBaseline="central"
                        fill="var(--text-primary)"
                        fontSize={12}
                        textAnchor="middle"
                        x={x + CELL_W / 2}
                        y={y + CELL_H / 2}
                      >
                        {formatInt(value)}
                      </text>
                    </g>
                  );
                }
                const band = bandOf(value, ceiling);
                return (
                  <g key={key}>
                    <rect fill={BAND_COLORS[band]} height={CELL_H} rx={CELL_RADIUS} width={CELL_W} x={x} y={y} />
                    <text
                      className="font-display tabular-nums"
                      dominantBaseline="central"
                      fill={BAND_TEXT[band] ?? 'var(--text-primary)'}
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

              <rect
                fill="var(--text-muted)"
                height={ROW_BAR_H}
                rx={1}
                width={(entry.total / marginCeiling) * BAR_MAX}
                x={BARS_X}
                y={y + (CELL_H - ROW_BAR_H) / 2}
              />
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={11}
                textAnchor="end"
                x={VALUE_X}
                y={y + CELL_H / 2}
              >
                {formatInt(entry.total)}
              </text>
            </g>
          );
        })}

        {stageTotals.map((entry, columnIndex) =>
          entry.total === null ? null : (
            <g key={`total-${entry.stage.id}`}>
              <rect
                fill="var(--text-muted)"
                height={(entry.total / marginCeiling) * BAR_MAX}
                rx={1}
                width={COL_BAR_W}
                x={columnX(columnIndex) + (CELL_W - COL_BAR_W) / 2}
                y={BOTTOM_BASE - (entry.total / marginCeiling) * BAR_MAX}
              />
              <text
                className="font-display tabular-nums"
                fill="var(--text-secondary)"
                fontSize={11}
                textAnchor="middle"
                x={columnX(columnIndex) + CELL_W / 2}
                y={COL_VALUE_Y}
              >
                {formatInt(entry.total)}
              </text>
            </g>
          ),
        )}

        {BAND_COLORS.map((color, index) => {
          const x = ORIGIN_X + index * SCALE_BLOCK_W;
          const floor = bandEdge(index, ceiling);
          const roof = index === BAND_COUNT - 1 ? ceiling : bandEdge(index + 1, ceiling) - 1;
          return (
            <g key={`band-${String(index)}`}>
              <rect fill={color} height={SWATCH_H} rx={2} width={SWATCH_W} x={x} y={FOOT_A - SWATCH_H / 2} />
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize={11}
                x={x + SWATCH_W + 6}
                y={FOOT_A}
              >
                {formatInt(floor)} a {formatInt(roof)}
              </text>
            </g>
          );
        })}
        <text
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={ORIGIN_X + BAND_COUNT * SCALE_BLOCK_W + 8}
          y={FOOT_A}
        >
          cor do miolo: perdas no par; motivos ordenados pelo total
        </text>

        <rect fill="var(--text-muted)" height={SWATCH_H} rx={1} width={SWATCH_W} x={ORIGIN_X} y={FOOT_B - SWATCH_H / 2} />
        <text
          className="tabular-nums"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={ORIGIN_X + SWATCH_W + 6}
          y={FOOT_B}
        >
          margens: total de perdas, régua comum, teto em {formatInt(marginCeiling)}
        </text>
        <rect
          fill="var(--surface-sunken)"
          height={SWATCH_H}
          rx={1}
          stroke="var(--text-muted)"
          width={SWATCH_W}
          x={ORIGIN_X + FOOT_STOP_TWO}
          y={FOOT_B - SWATCH_H / 2}
        />
        <text
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={ORIGIN_X + FOOT_STOP_TWO + SWATCH_W + 6}
          y={FOOT_B}
        >
          zero medido
        </text>
        <rect
          fill="none"
          height={SWATCH_H}
          rx={1}
          stroke="var(--text-muted)"
          strokeDasharray="3 2"
          width={SWATCH_W}
          x={ORIGIN_X + FOOT_STOP_THREE}
          y={FOOT_B - SWATCH_H / 2}
        />
        <text
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          x={ORIGIN_X + FOOT_STOP_THREE + SWATCH_W + 6}
          y={FOOT_B}
        >
          motivo sem registro na etapa
        </text>
      </svg>
    </div>
  );
}
