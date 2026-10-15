import { Filter } from 'lucide-react';
import { useState } from 'react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  NEW_ID,
  NEW_LABEL,
  OUTCOMES,
  periodEnd as defaultPeriodEnd,
  periodStart as defaultPeriodStart,
  STAGES,
  type TransitionRow,
} from './data';

/**
 * Matriz de transição: a etapa de origem na linha (de), a de destino na coluna (para), e a contagem
 * de oportunidades na célula. A mesma lista de etapas nos dois eixos, na ordem do funil, é o que dá
 * sentido geométrico à leitura: acima da diagonal são avanços, abaixo são retrocessos, e a diagonal
 * é quem ficou parado. Uma linha extra, Nova no trimestre, guarda quem entrou, e as colunas Ganha e
 * Perdida guardam quem saiu: assim os cinco totais somam o universo todo.
 *
 * Duas decisões sustentam a honestidade do desenho. A permanência fica fora da escala de cor,
 * porque é quase sempre o maior número da linha e achataria todo o resto numa faixa só. E o
 * retrocesso, que costuma ser pequeno e sumir numa rampa sequencial, ganha contorno próprio: é
 * exatamente a classe de movimento que um Sankey esconde ao desenhar o funil sempre para a frente.
 */
export interface StageTransitionMatrixProps {
  readonly data?: readonly TransitionRow[];
  readonly periodStart?: string;
  readonly periodEnd?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas de 960x480 na moldura card com o caso de uso em uma linha: 894 x 361,5 px. */
const VIEW_W = 894;
const VIEW_H = 361;

const CELL_W = 56;
const CELL_H = 30;
const GAP = 2;
/** Vão extra antes das colunas terminais: Ganha e Perdida não são etapa do funil. */
const OUTCOME_GAP = 14;
/** Vão extra antes da linha Nova no trimestre, que também não é etapa. */
const NEW_GAP = 8;
const LEFT_W = 106;
const TOP_H = 52;
const PANEL_X = 606;
const STAY_STROKE = 'var(--text-muted)';
const ZERO_STROKE = 'var(--line-subtle)';

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

interface HoverCell {
  readonly row: number;
  readonly column: number;
}

export default function StageTransitionMatrix({
  data = defaultData,
  periodStart = defaultPeriodStart,
  periodEnd = defaultPeriodEnd,
  height,
  className,
}: StageTransitionMatrixProps) {
  const [hover, setHover] = useState<HoverCell | null>(null);

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade neste recorte: a matriz de transição não tem o que medir.</span>
      </div>
    );
  }

  const columns = STAGES.length + OUTCOMES.length;

  /** O domínio da cor ignora a diagonal: a permanência entra depois, em neutro e com o valor escrito. */
  const moving = data.flatMap((row) => {
    const originIndex = STAGES.findIndex((stage) => stage.id === row.from);
    return [...row.toStages.filter((_, index) => index !== originIndex), ...row.toOutcomes];
  });
  const max: number | null = moving.length > 0 ? Math.max(...moving) : null;

  const bucketOf = (value: number): number => {
    if (max === null || max <= 0) return 0;
    const step = Math.ceil((value / max) * BUCKET_COLORS.length);
    return Math.min(BUCKET_COLORS.length - 1, Math.max(0, step - 1));
  };

  const stepX = (columnIndex: number): number =>
    LEFT_W + columnIndex * (CELL_W + GAP) + (columnIndex >= STAGES.length ? OUTCOME_GAP : 0);
  const stepY = (rowIndex: number): number =>
    TOP_H + rowIndex * (CELL_H + GAP) + (data[rowIndex]?.from === NEW_ID ? NEW_GAP : 0);

  /** Cada oportunidade cai numa célula só: os cinco totais particionam o universo. */
  const stayed = data.reduce((sum, row) => {
    const originIndex = STAGES.findIndex((stage) => stage.id === row.from);
    return sum + (row.toStages[originIndex] ?? 0);
  }, 0);
  const advances = data.reduce((sum, row) => {
    const originIndex = STAGES.findIndex((stage) => stage.id === row.from);
    if (originIndex < 0) return sum;
    return sum + row.toStages.reduce((inner, value, index) => (index > originIndex ? inner + value : inner), 0);
  }, 0);
  const setbacks = data.reduce((sum, row) => {
    const originIndex = STAGES.findIndex((stage) => stage.id === row.from);
    if (originIndex < 0) return sum;
    return sum + row.toStages.reduce((inner, value, index) => (index < originIndex ? inner + value : inner), 0);
  }, 0);
  const rowTotals = data.map((row) => [...row.toStages, ...row.toOutcomes].reduce((sum, value) => sum + value, 0));
  const entered = data.reduce((sum, row, index) => (row.from === NEW_ID ? sum + (rowTotals[index] ?? 0) : sum), 0);
  const left = data.reduce(
    (sum, row) => (row.from === NEW_ID ? sum : sum + row.toOutcomes.reduce((inner, value) => inner + value, 0)),
    0,
  );
  const universe = stayed + advances + setbacks + entered + left;

  const labelOfRow = (row: TransitionRow): string =>
    row.from === NEW_ID ? NEW_LABEL : (STAGES.find((stage) => stage.id === row.from)?.label ?? row.from);
  const labelOfColumn = (column: number): string =>
    column < STAGES.length ? (STAGES[column]?.label ?? '') : (OUTCOMES[column - STAGES.length]?.label ?? '');

  const biggest = data.reduce<{ row: number; column: number; value: number } | null>((best, row, rowIndex) => {
    const originIndex = STAGES.findIndex((stage) => stage.id === row.from);
    let local = best;
    [...row.toStages, ...row.toOutcomes].forEach((value, column) => {
      if (column === originIndex) return;
      if (local === null || value > local.value) local = { row: rowIndex, column, value };
    });
    return local;
  }, null);

  /** A dica e a leitura padrão são a mesma frase: o percentual da linha com o volume junto. */
  const readout = ((): string => {
    const target = hover ?? (biggest === null ? null : { row: biggest.row, column: biggest.column });
    if (target === null) return '';
    const row = data[target.row];
    if (row === undefined) return '';
    const value = [...row.toStages, ...row.toOutcomes][target.column] ?? 0;
    const prefix = hover === null ? 'Maior fluxo, ' : '';
    return `${prefix}${labelOfRow(row)} para ${labelOfColumn(target.column)}: ${formatRateWithVolume(value, rowTotals[target.row] ?? 0, 1)} da linha`;
  })();

  const summary =
    biggest === null
      ? 'Matriz de transição sem oportunidade no período.'
      : `Matriz de transição de ${formatInt(universe)} oportunidades entre ${formatInt(STAGES.length)} etapas, de ${formatDate(periodStart)} a ${formatDate(periodEnd)}; linha é de, coluna é para. ` +
        `Permaneceram ${formatInt(stayed)}, avançaram ${formatInt(advances)}, regrediram ${formatInt(setbacks)}, entraram ${formatInt(entered)}, saíram ${formatInt(left)}. ` +
        `O maior é ${labelOfRow(data[biggest.row] ?? { from: '', toStages: [], toOutcomes: [] })} para ${labelOfColumn(biggest.column)}, ${formatInt(biggest.value)}.`;

  const gridRight = LEFT_W + columns * (CELL_W + GAP) - GAP + OUTCOME_GAP;
  const gridBottom = stepY(data.length - 1) + CELL_H;
  const newRowIndex = data.findIndex((row) => row.from === NEW_ID);

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <g>
          <text fill="var(--text-secondary)" fontSize={11} x={LEFT_W} y={11}>
            {`para: etapa em ${formatDate(periodEnd)}`}
          </text>
          <text fill="var(--text-secondary)" fontSize={11} textAnchor="end" x={LEFT_W - 8} y={44}>
            de
          </text>
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
                  y={upper ? 28 : 43}
                >
                  {stage.label}
                </text>
                {upper ? (
                  <line
                    stroke="var(--line-subtle)"
                    strokeWidth={1}
                    x1={centerX}
                    x2={centerX}
                    y1={32}
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
                  {labelOfRow(row)}
                </text>

                {[...row.toStages, ...row.toOutcomes].map((value, columnIndex) => {
                  const x = stepX(columnIndex);
                  const y = stepY(rowIndex);
                  const isStay = columnIndex === originIndex;
                  const isSetback = columnIndex < originIndex;
                  const isZero = value === 0 && !isStay;
                  const bucket = bucketOf(value);
                  const textColor = isStay ? 'var(--text-secondary)' : isZero ? 'var(--text-muted)' : TEXT_COLORS[bucket];
                  return (
                    <g
                      key={`${row.from}-${String(columnIndex)}`}
                      onMouseEnter={() => setHover({ row: rowIndex, column: columnIndex })}
                      onMouseLeave={() => setHover(null)}
                    >
                      <rect
                        fill={isStay ? STAY_COLOR : isZero ? 'none' : BUCKET_COLORS[bucket]}
                        height={isStay || isZero ? CELL_H - 1.5 : CELL_H}
                        rx={2}
                        stroke={isStay ? STAY_STROKE : isZero ? ZERO_STROKE : 'none'}
                        strokeWidth={isStay ? 1.5 : 1}
                        width={isStay || isZero ? CELL_W - 1.5 : CELL_W}
                        x={isStay || isZero ? x + 0.75 : x}
                        y={isStay || isZero ? y + 0.75 : y}
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
            y1={16}
            y2={gridBottom}
          />
          {newRowIndex >= 0 ? (
            <line
              stroke="var(--line-subtle)"
              strokeWidth={1}
              x1={0}
              x2={gridRight}
              y1={stepY(newRowIndex) - NEW_GAP / 2}
              y2={stepY(newRowIndex) - NEW_GAP / 2}
            />
          ) : null}

          <line stroke="var(--line-subtle)" strokeWidth={1} x1={PANEL_X - 12} x2={PANEL_X - 12} y1={0} y2={gridBottom} />
          <text fill="var(--text-secondary)" fontSize={11} x={PANEL_X} y={11}>
            totais, em oportunidades
          </text>
          {[
            { key: 'ficaram', label: 'permaneceram (diagonal)', value: stayed, swatch: 'stay' },
            { key: 'avancaram', label: 'avançaram (acima)', value: advances, swatch: 'advance' },
            { key: 'regrediram', label: 'regrediram (abaixo)', value: setbacks, swatch: 'setback' },
            { key: 'entraram', label: 'entraram (linha Nova)', value: entered, swatch: 'none' },
            { key: 'sairam', label: 'saíram (Ganha e Perdida)', value: left, swatch: 'none' },
          ].map((entry, index) => {
            const centerY = 34 + index * 24;
            return (
              <g key={entry.key}>
                {entry.swatch === 'stay' ? (
                  <rect
                    fill={STAY_COLOR}
                    height={13}
                    rx={2}
                    stroke={STAY_STROKE}
                    strokeWidth={1.5}
                    width={19}
                    x={PANEL_X + 0.75}
                    y={centerY - 6.5}
                  />
                ) : null}
                {entry.swatch === 'advance' ? (
                  <rect fill={BUCKET_COLORS[2]} height={14} rx={2} width={20} x={PANEL_X} y={centerY - 7} />
                ) : null}
                {entry.swatch === 'setback' ? (
                  <rect
                    fill={BUCKET_COLORS[0]}
                    height={13}
                    rx={2}
                    stroke="var(--negative)"
                    strokeWidth={1.5}
                    width={19}
                    x={PANEL_X + 0.75}
                    y={centerY - 6.5}
                  />
                ) : null}
                <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={PANEL_X + 28} y={centerY}>
                  {entry.label}
                </text>
                <text
                  className="font-display tabular-nums"
                  dominantBaseline="central"
                  fill="var(--text-primary)"
                  fontSize={12}
                  textAnchor="end"
                  x={VIEW_W}
                  y={centerY}
                >
                  {formatInt(entry.value)}
                </text>
              </g>
            );
          })}
          <line stroke="var(--line-subtle)" strokeWidth={1} x1={PANEL_X} x2={VIEW_W} y1={142} y2={142} />
          <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} x={PANEL_X + 28} y={156}>
            total
          </text>
          <text
            className="font-display tabular-nums"
            dominantBaseline="central"
            fill="var(--text-primary)"
            fontSize={12}
            textAnchor="end"
            x={VIEW_W}
            y={156}
          >
            {formatInt(universe)}
          </text>

          {max === null ? null : (
            <g>
              <text fill="var(--text-secondary)" fontSize={11} x={PANEL_X} y={190}>
                escala, oportunidades por célula
              </text>
              <text className="font-display tabular-nums" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={PANEL_X} y={210}>
                {formatInt(1)}
              </text>
              {BUCKET_COLORS.map((color, index) => (
                <rect fill={color} height={14} key={color} rx={2} width={20} x={PANEL_X + 16 + index * 22} y={203} />
              ))}
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize={11}
                x={PANEL_X + 16 + BUCKET_COLORS.length * 22 + 4}
                y={210}
              >
                {formatInt(max)}
              </text>
            </g>
          )}
          <rect fill="none" height={13} rx={2} stroke={ZERO_STROKE} width={19} x={PANEL_X + 0.5} y={227.5} />
          <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={PANEL_X + 28} y={234}>
            zero medido, fora da escala
          </text>

          <text className="tabular-nums" fill="var(--text-secondary)" fontSize={12} x={0} y={304}>
            {readout}
          </text>
          <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={322}>
            {`Linha: etapa em ${formatDate(periodStart)} (de). Coluna: etapa em ${formatDate(periodEnd)} (para). Cada oportunidade conta uma vez, em ${formatInt(universe)}.`}
          </text>
          <text fill="var(--text-muted)" fontSize={11} x={0} y={340}>
            Diagonal fora da escala de cor. Contorno de alerta: retrocesso. Ganha e Perdida não são etapa e não abrem linha.
          </text>
        </g>
      </svg>
    </figure>
  );
}
