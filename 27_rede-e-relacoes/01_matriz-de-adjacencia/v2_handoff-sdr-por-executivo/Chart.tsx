import { Filter } from 'lucide-react';
import { useState } from 'react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type HandoffData } from './data';

/**
 * Matriz de adjacência dirigida: a linha é o SDR que repassa (origem), a coluna é o executivo que
 * recebe (destino), e a célula escreve o percentual DA LINHA, porque a pergunta é como cada SDR
 * distribui o que repassa, e não quanto cada um repassa. A contagem vai na leitura do topo ao passar
 * o cursor, e os totais marginais ficam fora da grade: sem eles, 70% de 7 agendas lê igual a 70% de 50.
 *
 * O par mais concentrado ganha contorno desenhado FORA da célula, no vão, em `--chart-1` sobre o
 * cartão: dentro, o contorno cairia sobre `--seq-7`, que no escuro quase não difere do ciano. Só
 * concorre a destaque o SDR com base mínima, senão 5 de 7 ensinaria o erro.
 */
export interface HandoffMatrixProps {
  readonly data?: HandoffData;
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 574;
const VIEW_H = 252;
const LEFT_W = 48;
const CELL_W = 38;
const CELL_H = 22;
/** Vão de 4 px: é nele que cabe o contorno do destaque, fora das células vizinhas. */
const GAP = 4;
const MATRIX_TOP = 38;
const TOTAL_GAP = 8;
const TOTAL_W = 36;
const NOTE_GAP = 12;
const NOTE_CHARS = 15;
const CHAR_W = 6.2;
const LEGEND_LINE = 14;
/** Base mínima de agendas para um SDR concorrer ao destaque. */
const MIN_BASE = 10;
const EDGES = [10, 20, 35] as const;

const CLASS_COLORS = [
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const CLASS_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
const ZERO_FILL = 'var(--surface-sunken)';
const HOVER_FILL = 'var(--surface-overlay)';

interface Hover {
  readonly row: number;
  readonly col: number;
}

function sumOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

/** Percentuais inteiros da linha que somam 100, pelo maior resto (NUM-2); `null` sem base. */
function rowPercents(values: readonly number[]): readonly number[] | null {
  const total = sumOf(values);
  if (total === null || total <= 0) return null;
  const exact = values.map((value) => (value / total) * 100);
  const floors = exact.map((value) => Math.floor(value));
  let left = 100 - floors.reduce((sum, value) => sum + value, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const entry of byRemainder) {
    if (left <= 0) break;
    floors[entry.index] = (floors[entry.index] ?? 0) + 1;
    left -= 1;
  }
  return floors;
}

function classOf(percent: number): number {
  return EDGES.filter((edge) => percent >= edge).length;
}

/** Quebra por palavra em linhas curtas, para a anotação caber na margem direita. */
function wrap(text: string, limit: number): readonly string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(' ')) {
    const next = current === '' ? word : `${current} ${word}`;
    if (next.length > limit && current !== '') {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}

export default function HandoffMatrix({ data = defaultData, height, className }: HandoffMatrixProps) {
  const [hover, setHover] = useState<Hover | null>(null);

  if (data.rows.length === 0 || data.executives.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum repasse neste recorte: a matriz não tem SDR para comparar.</span>
      </div>
    );
  }

  const rows = data.rows.map((row) => ({
    row,
    label: data.sdrs.find((sdr) => sdr.id === row.sdrId)?.label ?? row.sdrId,
    total: sumOf(row.toExecutives),
    percents: rowPercents(row.toExecutives),
  }));
  const columnTotals = data.executives.map((_, col) => sumOf(rows.map((entry) => entry.row.toExecutives[col] ?? 0)));
  const grandTotal = sumOf(rows.map((entry) => entry.total ?? 0));

  let top: { row: number; col: number; percent: number } | null = null;
  rows.forEach((entry, rowIndex) => {
    if (entry.percents === null || (entry.total ?? 0) < MIN_BASE) return;
    entry.percents.forEach((percent, col) => {
      if (top === null || percent > top.percent) top = { row: rowIndex, col, percent };
    });
  });
  const best = top as { row: number; col: number; percent: number } | null;
  const bestEntry = best === null ? undefined : rows[best.row];
  const bestPercents = bestEntry?.percents ?? null;
  const topTwo =
    bestPercents === null
      ? null
      : [...bestPercents]
          .sort((a, b) => b - a)
          .slice(0, 2)
          .reduce((sum, value) => sum + value, 0);
  const bestExec = best === null ? undefined : data.executives[best.col];

  const summary =
    best !== null && bestEntry !== undefined && bestExec !== undefined && topTwo !== null && grandTotal !== null
      ? `Matriz de repasses de ${formatInt(rows.length)} SDRs para ${formatInt(data.executives.length)} executivos em ${data.period}, com ${formatInt(grandTotal)} agendas. ` +
        `Entre os SDRs com ao menos ${formatInt(MIN_BASE)} agendas, o par mais concentrado é ${bestEntry.label} com o executivo ${bestExec.label}, com ${formatPercent(best.percent / 100, 0)} da linha. ` +
        `${bestEntry.label} repassou ${formatPercent(topTwo / 100, 0)} para dois executivos.`
      : 'Matriz de repasses sem nenhum SDR com base mínima para destacar.';

  const stepX = (col: number): number => LEFT_W + col * (CELL_W + GAP);
  const stepY = (row: number): number => MATRIX_TOP + row * (CELL_H + GAP);
  const gridRight = stepX(data.executives.length) - GAP;
  const totalX = gridRight + TOTAL_GAP;
  const noteX = totalX + TOTAL_W + NOTE_GAP;
  const totalsY = stepY(rows.length) + 2;
  const legendY = totalsY + CELL_H + 12;

  const readout = (() => {
    if (hover === null) return '';
    const entry = rows[hover.row];
    const exec = data.executives[hover.col];
    const count = entry?.row.toExecutives[hover.col];
    if (entry === undefined || exec === undefined || count === undefined || entry.total === null) return '';
    return `${entry.label} para executivo ${exec.label}: ${formatInt(count)} de ${formatInt(entry.total)} agendas`;
  })();

  const classLabels = [
    `até ${formatPercent((EDGES[0] - 1) / 100, 0)}`,
    `${formatPercent(EDGES[0] / 100, 0)} a ${formatPercent((EDGES[1] - 1) / 100, 0)}`,
    `${formatPercent(EDGES[1] / 100, 0)} a ${formatPercent((EDGES[2] - 1) / 100, 0)}`,
    `${formatPercent(EDGES[2] / 100, 0)} ou mais`,
  ];
  const legendTitle = '% da linha:';
  let legendX = legendTitle.length * CHAR_W + 8;

  const noteLines =
    best !== null && bestEntry !== undefined && topTwo !== null
      ? wrap(`${bestEntry.label} repassou ${formatPercent(topTwo / 100, 0)} para dois executivos`, NOTE_CHARS)
      : [];
  const noteCenter = best === null ? 0 : stepY(best.row) + CELL_H / 2;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col items-center', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="shrink-0" height={VIEW_H} viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`} width={VIEW_W}>
        <text fill="var(--text-muted)" fontSize={11} x={0} y={11}>
          Linha: SDR de origem. Coluna: executivo de destino.
        </text>
        <text fill="var(--text-secondary)" fontSize={11} textAnchor="end" x={VIEW_W} y={11}>
          {readout}
        </text>

        {hover !== null ? (
          <g>
            <rect fill={HOVER_FILL} height={CELL_H + GAP} width={gridRight} x={0} y={stepY(hover.row) - GAP / 2} />
            <rect
              fill={HOVER_FILL}
              height={stepY(rows.length) - MATRIX_TOP}
              width={CELL_W + GAP}
              x={stepX(hover.col) - GAP / 2}
              y={MATRIX_TOP - GAP / 2}
            />
          </g>
        ) : null}

        {data.executives.map((exec, col) => (
          <text
            fill={hover?.col === col ? 'var(--text-primary)' : 'var(--text-muted)'}
            fontSize={11}
            key={exec.id}
            textAnchor="middle"
            x={stepX(col) + CELL_W / 2}
            y={MATRIX_TOP - 10}
          >
            {exec.label}
          </text>
        ))}
        <text fill="var(--text-muted)" fontSize={11} textAnchor="end" x={totalX + TOTAL_W} y={MATRIX_TOP - 10}>
          total
        </text>

        {rows.map((entry, rowIndex) => {
          const isBestRow = best?.row === rowIndex;
          const thin = (entry.total ?? 0) < MIN_BASE;
          return (
            <g key={entry.row.sdrId}>
              <text
                dominantBaseline="central"
                fill={isBestRow || hover?.row === rowIndex ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={11}
                fontWeight={isBestRow ? 700 : 400}
                textAnchor="end"
                x={LEFT_W - 8}
                y={stepY(rowIndex) + CELL_H / 2}
              >
                {entry.label}
              </text>
              {entry.row.toExecutives.map((count, col) => {
                const x = stepX(col);
                const y = stepY(rowIndex);
                const percent = entry.percents?.[col];
                const isBest = best?.row === rowIndex && best.col === col;
                const bucket = percent === undefined || count === 0 ? -1 : classOf(percent);
                return (
                  <g
                    key={data.executives[col]?.id ?? String(col)}
                    onMouseEnter={() => setHover({ row: rowIndex, col })}
                    onMouseLeave={() => setHover(null)}
                  >
                    <rect
                      fill={bucket === -1 ? ZERO_FILL : CLASS_COLORS[bucket]}
                      height={CELL_H}
                      rx={2}
                      width={CELL_W}
                      x={x}
                      y={y}
                    />
                    {isBest ? (
                      <rect
                        fill="none"
                        height={CELL_H + 3}
                        rx={3}
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        width={CELL_W + 3}
                        x={x - 1.5}
                        y={y - 1.5}
                      />
                    ) : null}
                    {thin && count > 0 ? (
                      <rect
                        fill="none"
                        height={CELL_H - 1.5}
                        rx={2}
                        stroke={CLASS_TEXT[bucket] ?? 'var(--text-primary)'}
                        strokeDasharray="3 2"
                        strokeWidth={1.5}
                        width={CELL_W - 1.5}
                        x={x + 0.75}
                        y={y + 0.75}
                      />
                    ) : null}
                    <text
                      className="font-display tabular-nums"
                      dominantBaseline="central"
                      fill={bucket === -1 ? 'var(--text-muted)' : (CLASS_TEXT[bucket] ?? 'var(--text-primary)')}
                      fontSize={12}
                      fontWeight={isBest ? 700 : undefined}
                      textAnchor="middle"
                      x={x + CELL_W / 2}
                      y={y + CELL_H / 2}
                    >
                      {formatPercent((percent ?? 0) / 100, 0)}
                    </text>
                  </g>
                );
              })}
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={12}
                textAnchor="end"
                x={totalX + TOTAL_W}
                y={stepY(rowIndex) + CELL_H / 2}
              >
                {formatInt(entry.total ?? 0)}
              </text>
            </g>
          );
        })}

        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={LEFT_W - 8} y={totalsY + CELL_H / 2}>
          total
        </text>
        {columnTotals.map((total, col) => (
          <text
            className="font-display tabular-nums"
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize={12}
            key={data.executives[col]?.id ?? String(col)}
            textAnchor="middle"
            x={stepX(col) + CELL_W / 2}
            y={totalsY + CELL_H / 2}
          >
            {formatInt(total ?? 0)}
          </text>
        ))}
        <text
          className="font-display tabular-nums"
          dominantBaseline="central"
          fill="var(--text-secondary)"
          fontSize={12}
          textAnchor="end"
          x={totalX + TOTAL_W}
          y={totalsY + CELL_H / 2}
        >
          {formatInt(grandTotal ?? 0)}
        </text>

        {noteLines.map((line, index) => (
          <text
            dominantBaseline="central"
            fill="var(--text-muted)"
            fontSize={11}
            key={line}
            x={noteX}
            y={noteCenter + (index - (noteLines.length - 1) / 2) * 14}
          >
            {line}
          </text>
        ))}

        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={0} y={legendY}>
          {legendTitle}
        </text>
        {classLabels.map((label, index) => {
          const x = legendX;
          legendX += 14 + 4 + label.length * CHAR_W + 10;
          return (
            <g key={label}>
              <rect fill={CLASS_COLORS[index]} height={10} rx={2} width={14} x={x} y={legendY - 5} />
              <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={x + 18} y={legendY}>
                {label}
              </text>
            </g>
          );
        })}
        <rect fill={ZERO_FILL} height={10} rx={2} width={14} x={legendX} y={legendY - 5} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={legendX + 18} y={legendY}>
          {`${formatPercent(0, 0)}: nenhum repasse`}
        </text>
        <rect
          fill="none"
          height={9}
          rx={2}
          stroke="var(--text-muted)"
          strokeDasharray="3 2"
          strokeWidth={1.5}
          width={13}
          x={0.5}
          y={legendY + LEGEND_LINE - 4.5}
        />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={18} y={legendY + LEGEND_LINE}>
          {`pontilhado: SDR com menos de ${formatInt(MIN_BASE)} agendas, fora do destaque`}
        </text>
      </svg>
    </figure>
  );
}
