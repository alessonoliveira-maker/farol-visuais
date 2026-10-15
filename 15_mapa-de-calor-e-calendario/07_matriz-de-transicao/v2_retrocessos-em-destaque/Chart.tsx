import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periodEnd as defaultPeriodEnd, STAGES, type TransitionRow } from './data';

/**
 * Matriz de transição com o retrocesso como assunto. A mesma lista de etapas nos dois eixos, a
 * origem na linha, o destino na coluna, e o percentual da linha escrito em cada célula.
 *
 * Três decisões separam esta versão da matriz de fluxo comum.
 *
 * As duas metades do triângulo têm escala PRÓPRIA, e não uma rampa só: retrocesso e avanço são
 * grandezas de ordem diferente no mesmo cartão, e uma rampa comum deixaria a metade de baixo inteira
 * no primeiro degrau. São duas legendas, cada uma com o teto de cada degrau escrito.
 *
 * Os degraus saem de corte por tercil do que foi observado, nunca de divisão linear do máximo. A
 * distribuição é torta de propósito, e o corte linear jogaria quase toda célula no primeiro degrau,
 * o que faz a cor parar de ordenar.
 *
 * E o retrocesso não vive só da cor: além de estar geometricamente abaixo da diagonal, cada célula
 * de retrocesso leva um marcador de volta desenhado ao lado do número. O degrau mais claro das duas
 * rampas fica abaixo de 3:1 contra o cartão, então a cor sozinha não sustentaria a leitura.
 */
export interface StageSetbackMatrixProps {
  readonly data?: readonly TransitionRow[];
  readonly periodEnd?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas de 960x400 na moldura card com o caso de uso em uma linha: 894 x 281,5 px. */
const VIEW_W = 894;
const VIEW_H = 281;

const LABEL_RIGHT = 92;
const GRID_X = 100;
const TOP_H = 34;
const CELL_W = 76;
const CELL_H = 32;
const GAP = 2;
const TOTAL_X = 578;
const TOTAL_W = 70;
const PANEL_X = 672;
const MARKER_DX = 24;
const TEXT_DX = 6;

const STEPS = 3;
const ADVANCE_FILLS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
] as const;
/** Sobre os três degraus claros da rampa sequencial quem passa de 4,5:1 é o texto principal. */
const ADVANCE_TEXTS = ['var(--text-primary)', 'var(--text-primary)', 'var(--text-primary)'] as const;
/**
 * Rampa de retrocesso composta a partir de `--negative` sobre o próprio cartão. O Farol não tem
 * rampa divergente, e o caminho da opacidade está fechado: a ACE-5 pede piso de 0,66 em `--negative`,
 * o que deixaria um degrau só. A composição opaca resolve os dois temas e mantém o número legível.
 */
const SETBACK_FILLS = [
  'color-mix(in oklab, var(--negative) 28%, var(--surface-raised))',
  'color-mix(in oklab, var(--negative) 55%, var(--surface-raised))',
  'var(--negative)',
] as const;
/** Medido degrau a degrau: nos dois claros vence o texto do cartão, no cheio vence o vazado. */
const SETBACK_TEXTS = ['var(--text-primary)', 'var(--text-primary)', 'var(--surface-raised)'] as const;
const STAY_FILL = 'var(--surface-sunken)';
const STAY_TEXT = 'var(--text-secondary)';
/** Zero medido desenha a célula vazada, para o poço da diagonal continuar querendo dizer só permanência. */
const EMPTY_TEXT = 'var(--text-muted)';
const EMPTY_STROKE = 'var(--line-subtle)';

interface CellStat {
  readonly row: number;
  readonly column: number;
  readonly origin: number;
  readonly value: number;
  readonly total: number;
  readonly share: number;
  /** Percentual inteiro da linha, repartido pelo maior resto: é o que a célula escreve e a legenda lê. */
  readonly percent: number;
}

/**
 * Percentual inteiro de cada contagem sobre o total, repartido pelo maior resto para a linha somar
 * 100. Empate de resto desempata pela posição, que é determinística. Total zero devolve null.
 */
function wholePercents(counts: readonly number[], total: number): readonly number[] | null {
  if (total <= 0) return null;
  const floors = counts.map((count) => Math.floor((count * 100) / total));
  const order = counts
    .map((count, index) => ({ index, rest: count * 100 - (floors[index] ?? 0) * total }))
    .sort((first, second) => second.rest - first.rest || first.index - second.index);
  const missing = 100 - floors.reduce((sum, value) => sum + value, 0);
  const result = [...floors];
  for (let step = 0; step < missing; step += 1) {
    const target = order[step]?.index ?? 0;
    result[target] = (result[target] ?? 0) + 1;
  }
  return result;
}

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

/** Devolve o par de cores do degrau, e não o índice, para o chamador não recontar a rampa. */
function rampStep(
  share: number,
  ceilings: readonly number[] | null,
  fills: readonly string[],
  texts: readonly string[],
): { readonly fill: string; readonly text: string } {
  let step = fills.length - 1;
  for (let candidate = 0; candidate < (ceilings ?? []).length; candidate += 1) {
    if (share <= (ceilings?.[candidate] ?? share)) {
      step = candidate;
      break;
    }
  }
  return { fill: fills[step] ?? STAY_FILL, text: texts[step] ?? STAY_TEXT };
}

export default function StageSetbackMatrix({
  data = defaultData,
  periodEnd = defaultPeriodEnd,
  height,
  className,
}: StageSetbackMatrixProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum movimento neste recorte: não houve medição de avanço nem de retrocesso.</span>
      </div>
    );
  }

  const originOf = (id: string): number => STAGES.findIndex((stage) => stage.id === id);
  const totals = data.map((row) => row.to.reduce((sum, value) => sum + value, 0));
  const rowPercents = data.map((row, rowIndex) => wholePercents(row.to, totals[rowIndex] ?? 0));

  const moves = data.flatMap((row, rowIndex): CellStat[] => {
    const origin = originOf(row.from);
    const total = totals[rowIndex] ?? 0;
    if (total === 0) return [];
    return row.to.flatMap((value, columnIndex): CellStat[] =>
      value === 0 || columnIndex === origin
        ? []
        : [
            {
              row: rowIndex,
              column: columnIndex,
              origin,
              value,
              total,
              share: value / total,
              percent: rowPercents[rowIndex]?.[columnIndex] ?? 0,
            },
          ],
    );
  });
  const setbacks = moves.filter((cell) => cell.column < cell.origin);
  const advances = moves.filter((cell) => cell.column > cell.origin);
  const setbackCount = setbacks.reduce((sum, cell) => sum + cell.value, 0);
  const advanceCount = advances.reduce((sum, cell) => sum + cell.value, 0);
  const worst = setbacks.reduce<CellStat | null>(
    (best, cell) => (best === null || cell.share > best.share ? cell : best),
    null,
  );

  const advanceCeilings = tercileCeilings(advances.map((cell) => cell.percent / 100));
  const setbackCeilings = tercileCeilings(setbacks.map((cell) => cell.percent / 100));

  const summary =
    worst === null
      ? `Matriz de transição entre ${formatInt(STAGES.length)} etapas do funil, sem retrocesso medido no trimestre.`
      : `Matriz de transição entre ${formatInt(STAGES.length)} etapas do funil, com o retrocesso em destaque. ` +
        `Foram ${formatInt(setbackCount)} movimentos de volta contra ${formatInt(advanceCount)} de avanço. ` +
        `O maior é ${STAGES[worst.origin]?.label ?? ''} de volta para ${STAGES[worst.column]?.label ?? ''}, ` +
        `${formatRateWithVolume(worst.value, worst.total, 0)}.`;

  const cellX = (columnIndex: number): number => GRID_X + columnIndex * (CELL_W + GAP);
  const cellY = (rowIndex: number): number => TOP_H + rowIndex * (CELL_H + GAP);
  const gridBottom = cellY(Math.max(0, data.length - 1)) + CELL_H;

  return (
    <div
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {STAGES.map((stage, columnIndex) => (
          <text
            fill="var(--text-muted)"
            fontSize={11}
            key={stage.id}
            textAnchor="middle"
            x={cellX(columnIndex) + CELL_W / 2}
            y={24}
          >
            {stage.label}
          </text>
        ))}
        <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={TOTAL_X + TOTAL_W / 2} y={24}>
          movimentos
        </text>

        {data.map((row, rowIndex) => {
          const origin = originOf(row.from);
          const total = totals[rowIndex] ?? 0;
          const y = cellY(rowIndex);
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
                {STAGES[origin]?.label ?? row.from}
              </text>

              {total === 0 ? (
                <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={GRID_X} y={y + CELL_H / 2}>
                  {formatUnavailable()}
                </text>
              ) : (
                row.to.map((value, columnIndex) => {
                  const x = cellX(columnIndex);
                  const centerX = x + CELL_W / 2;
                  const share = (rowPercents[rowIndex]?.[columnIndex] ?? 0) / 100;
                  const isStay = columnIndex === origin;
                  const isSetback = columnIndex < origin;
                  const isEmpty = value === 0;
                  const marked = isSetback && !isEmpty;
                  const ramp = isSetback
                    ? rampStep(share, setbackCeilings, SETBACK_FILLS, SETBACK_TEXTS)
                    : rampStep(share, advanceCeilings, ADVANCE_FILLS, ADVANCE_TEXTS);
                  const fill = isEmpty ? 'none' : isStay ? STAY_FILL : ramp.fill;
                  const textFill = isEmpty ? EMPTY_TEXT : isStay ? STAY_TEXT : ramp.text;
                  const isWorst = worst !== null && worst.row === rowIndex && worst.column === columnIndex;
                  return (
                    <g key={`${row.from}-${String(columnIndex)}`}>
                      <rect
                        fill={fill}
                        height={isEmpty ? CELL_H - 1 : CELL_H}
                        rx={2}
                        stroke={isEmpty ? EMPTY_STROKE : 'none'}
                        width={isEmpty ? CELL_W - 1 : CELL_W}
                        x={isEmpty ? x + 0.5 : x}
                        y={isEmpty ? y + 0.5 : y}
                      />
                      {isWorst ? (
                        <rect
                          fill="none"
                          height={CELL_H - 2}
                          rx={2}
                          stroke="var(--text-primary)"
                          strokeWidth={2}
                          width={CELL_W - 2}
                          x={x + 1}
                          y={y + 1}
                        />
                      ) : null}
                      {marked ? (
                        <path
                          d={`M ${String(centerX - MARKER_DX)} ${String(y + CELL_H / 2)} l 7 -5 v 10 z`}
                          fill={textFill}
                        />
                      ) : null}
                      <text
                        className="font-display tabular-nums"
                        dominantBaseline="central"
                        fill={textFill}
                        fontSize={12}
                        textAnchor="middle"
                        x={centerX + (marked ? TEXT_DX : 0)}
                        y={y + CELL_H / 2}
                      >
                        {formatPercent(share, 0)}
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
                x={TOTAL_X + TOTAL_W / 2}
                y={y + CELL_H / 2}
              >
                {formatInt(total)}
              </text>
            </g>
          );
        })}

        <line stroke="var(--line-subtle)" strokeWidth={1} x1={TOTAL_X - 12} x2={TOTAL_X - 12} y1={14} y2={gridBottom} />
        <line stroke="var(--line-subtle)" strokeWidth={1} x1={PANEL_X - 12} x2={PANEL_X - 12} y1={14} y2={gridBottom} />

        <text fill="var(--text-secondary)" fontSize={11} x={PANEL_X} y={44}>
          avanço, % da linha
        </text>
        {(advanceCeilings ?? []).map((ceiling, step) => (
          <g key={`avanco-${String(step)}`}>
            <rect fill={ADVANCE_FILLS[step]} height={14} rx={2} width={20} x={PANEL_X} y={52 + step * 18} />
            <text
              className="tabular-nums"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              x={PANEL_X + 28}
              y={59 + step * 18}
            >
              {`até ${formatPercent(ceiling, 0)}`}
            </text>
          </g>
        ))}

        <text fill="var(--text-secondary)" fontSize={11} x={PANEL_X} y={136}>
          retrocesso, % da linha
        </text>
        {(setbackCeilings ?? []).map((ceiling, step) => (
          <g key={`retrocesso-${String(step)}`}>
            <rect fill={SETBACK_FILLS[step]} height={14} rx={2} width={20} x={PANEL_X} y={144 + step * 18} />
            <path d={`M ${String(PANEL_X + 5)} ${String(151 + step * 18)} l 7 -5 v 10 z`} fill={SETBACK_TEXTS[step]} />
            <text
              className="tabular-nums"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              x={PANEL_X + 28}
              y={151 + step * 18}
            >
              {`até ${formatPercent(ceiling, 0)}`}
            </text>
          </g>
        ))}

        <rect fill={STAY_FILL} height={14} rx={2} width={20} x={PANEL_X} y={202} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={PANEL_X + 28} y={209}>
          ficou na etapa
        </text>
        <rect
          fill="none"
          height={13}
          rx={2}
          stroke={EMPTY_STROKE}
          width={19}
          x={PANEL_X + 0.5}
          y={220.5}
        />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={PANEL_X + 28} y={227}>
          sem movimento
        </text>

        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={252}>
          {worst === null
            ? 'Nenhum retrocesso medido no trimestre'
            : `${STAGES[worst.origin]?.label ?? ''} volta a ${STAGES[worst.column]?.label ?? ''}: ${formatRateWithVolume(worst.value, worst.total, 0)}`}
        </text>
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={270}>
          {`Linha: de onde saiu; coluna: para onde foi. Percentual sobre os movimentos da linha; ganha e perdida ficam fora. Trimestre até ${formatDate(periodEnd)}.`}
        </text>
      </svg>
    </div>
  );
}
