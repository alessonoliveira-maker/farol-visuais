import { Filter } from 'lucide-react';

import { formatPercentFromScale100 } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periodAfter, periodBefore, type ChannelQualified } from './data';

/**
 * Slope chart: a participação de cada canal nos leads qualificados em dois anos, uma reta por
 * canal numa escala única. A reta fica no valor real; só o rótulo se afasta quando dois valores
 * ficam a menos de uma linha de texto um do outro, e um traço guia liga o rótulo ao ponto.
 */
export interface ChannelSlopeProps {
  readonly data?: readonly ChannelQualified[];
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox é o corpo do canvas quadrado (card, caso de uso em duas linhas): escala 1, texto sem encolher (GEO-18). */
const VIEW_W = 422;
const VIEW_H = 355;
const READING_Y = 13;
const HEADER_Y = 40;
const PLOT_TOP = 58;
const PLOT_BOTTOM = 338;
const X_LEFT = 150;
const X_RIGHT = 272;
const DOT_RADIUS = 4.5;
const LINE_WIDTH = 2;
const LINE_WIDTH_LEAD = 3;
/** Distância horizontal do ponto até o valor escrito, espaço do traço guia. */
const LABEL_OFFSET = 16;
const VALUE_WIDTH = 36;
const LABEL_GAP = 15;
/** Deslocamento do rótulo, em px, a partir do qual o traço guia aparece. */
const LEADER_MIN = 8;
const DOMAIN_STEP = 5;
/** Slots categóricos por nome de token; a cor vem do `slot` do dado, nunca da posição (COR-3). */
const SLOT_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'] as const;

/** Percentual inteiro de cada parte, somando 100 pelo maior resto (NUM-2); `null` sem total. */
function wholePercents(counts: readonly number[]): readonly number[] | null {
  if (counts.length === 0) return null;
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (total <= 0) return null;
  const exact = counts.map((count) => (count / total) * 100);
  const result = exact.map((value) => Math.floor(value));
  const missing = 100 - result.reduce((sum, value) => sum + value, 0);
  const byRemainder = exact.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (let k = 0; k < missing; k += 1) {
    const slot = byRemainder[k];
    if (slot) result[slot.index] = (result[slot.index] ?? 0) + 1;
  }
  return result;
}

/** Menor e maior de uma lista; `null` para lista vazia (EST-1b), nunca um limite inventado. */
function extent(list: readonly number[]): readonly [number, number] | null {
  const first = list[0];
  if (first === undefined) return null;
  let low = first;
  let high = first;
  for (const value of list) {
    if (value < low) low = value;
    if (value > high) high = value;
  }
  return [low, high];
}

/**
 * afastarRotulos: dado o y desejado de cada rótulo, devolve o y de cada um com `gap` de folga,
 * dentro de [min, max]. Rótulos vizinhos formam um bloco que se centra no próprio grupo (mínimos
 * quadrados), então o deslocamento se reparte em vez de empurrar tudo para baixo.
 */
function spreadLabels(wanted: readonly number[], gap: number, min: number, max: number): readonly number[] {
  const order = wanted.map((_, index) => index).sort((a, b) => (wanted[a] ?? 0) - (wanted[b] ?? 0) || a - b);
  const clampStart = (adj: number, n: number) => Math.min(Math.max(adj / n, min), max - (n - 1) * gap);
  const blocks: { n: number; adj: number; start: number }[] = [];
  for (const index of order) {
    const adj0 = wanted[index] ?? 0;
    let current = { n: 1, adj: adj0, start: clampStart(adj0, 1) };
    for (let prev = blocks[blocks.length - 1]; prev !== undefined && prev.start + prev.n * gap > current.start; prev = blocks[blocks.length - 1]) {
      blocks.pop();
      const n = prev.n + current.n;
      const adj = prev.adj + current.adj - current.n * prev.n * gap;
      current = { n, adj, start: clampStart(adj, n) };
    }
    blocks.push(current);
  }
  const placed: number[] = wanted.map(() => 0);
  let cursor = 0;
  for (const block of blocks) {
    for (let j = 0; j < block.n; j += 1) {
      const target = order[cursor];
      if (target !== undefined) placed[target] = block.start + j * gap;
      cursor += 1;
    }
  }
  return placed;
}

interface SlopeRow {
  readonly item: ChannelQualified;
  readonly before: number;
  readonly after: number;
  readonly color: string;
  readonly yBefore: number;
  readonly yAfter: number;
  readonly labelBefore: number;
  readonly labelAfter: number;
}

export default function ChannelSlope({ data = defaultData, height, className }: ChannelSlopeProps) {
  const style = height === undefined ? undefined : { height };
  const beforePct = wholePercents(data.map((item) => item.qualifiedBefore));
  const afterPct = wholePercents(data.map((item) => item.qualifiedAfter));

  const range = beforePct === null || afterPct === null ? null : extent([...beforePct, ...afterPct]);
  if (beforePct === null || afterPct === null || range === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum canal com lead qualificado neste recorte: não há participação para comparar entre os anos.</span>
      </div>
    );
  }

  const domainMax = Math.ceil(range[1] / DOMAIN_STEP) * DOMAIN_STEP;
  /* Slope lê posição, não comprimento: a escala começa no degrau abaixo do menor valor, para a altura inteira trabalhar. */
  const domainMin = Math.floor(range[0] / DOMAIN_STEP) * DOMAIN_STEP;
  const yOf = (value: number) => PLOT_BOTTOM - ((value - domainMin) / (domainMax - domainMin)) * (PLOT_BOTTOM - PLOT_TOP);
  const wantedBefore = beforePct.map((value) => yOf(value));
  const wantedAfter = afterPct.map((value) => yOf(value));
  const placedBefore = spreadLabels(wantedBefore, LABEL_GAP, PLOT_TOP, PLOT_BOTTOM);
  const placedAfter = spreadLabels(wantedAfter, LABEL_GAP, PLOT_TOP, PLOT_BOTTOM);

  const rows: SlopeRow[] = data.map((item, index) => ({
    item,
    before: beforePct[index] ?? 0,
    after: afterPct[index] ?? 0,
    color: SLOT_COLORS[item.slot - 1] ?? 'var(--text-muted)',
    yBefore: wantedBefore[index] ?? 0,
    yAfter: wantedAfter[index] ?? 0,
    labelBefore: placedBefore[index] ?? 0,
    labelAfter: placedAfter[index] ?? 0,
  }));

  const delta = (row: SlopeRow) => row.after - row.before;
  const riser = rows.reduce((best, row) => (delta(row) > delta(best) ? row : best), rows[0]!);
  const faller = rows.reduce((worst, row) => (delta(row) < delta(worst) ? row : worst), rows[0]!);
  const pct = (value: number) => formatPercentFromScale100(value, 0);
  const lower = (row: SlopeRow) => row.item.name.toLowerCase();

  const riseText = `maior alta: ${lower(riser)}, de ${pct(riser.before)} para ${pct(riser.after)}`;
  const fallText = delta(faller) < 0 ? `; maior queda: ${lower(faller)}, de ${pct(faller.before)} para ${pct(faller.after)}` : '';
  const readingLine = `Maior alta: ${lower(riser)}, de ${pct(riser.before)} para ${pct(riser.after)} dos leads.`;
  const summary = `Gráfico de inclinação com a participação de ${String(rows.length)} canais nos leads qualificados, de ${periodBefore} para ${periodAfter}: ${riseText}${fallText}.`;

  return (
    <svg aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style} viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
      {/* Linha de leitura (ANO-5): conclusão calculada do dado; a frase da raiz já diz o mesmo. */}
      <text aria-hidden className="font-sans" fill="var(--text-secondary)" fontSize={12} x={0} y={READING_Y}>
        {readingLine}
      </text>

      {[
        { x: X_LEFT, label: periodBefore },
        { x: X_RIGHT, label: periodAfter },
      ].map((column) => (
        <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={600} key={column.label} textAnchor="middle" x={column.x} y={HEADER_Y}>
          {column.label}
        </text>
      ))}

      {rows.map((row) => (
        <line
          key={`line-${row.item.id}`}
          stroke={row.color}
          strokeLinecap="round"
          strokeWidth={row === riser ? LINE_WIDTH_LEAD : LINE_WIDTH}
          x1={X_LEFT}
          x2={X_RIGHT}
          y1={row.yBefore}
          y2={row.yAfter}
        />
      ))}

      {rows.map((row) => {
        const lead = row === riser;
        const weight = lead ? 700 : 500;
        return (
          <g key={`ends-${row.item.id}`}>
            {/* Traço guia só quando o rótulo saiu do lugar do ponto (afastarRotulos). */}
            {Math.abs(row.labelBefore - row.yBefore) > LEADER_MIN ? (
              <line stroke="var(--text-muted)" strokeWidth={1} x1={X_LEFT - DOT_RADIUS - 1} x2={X_LEFT - LABEL_OFFSET + 3} y1={row.yBefore} y2={row.labelBefore} />
            ) : null}
            {Math.abs(row.labelAfter - row.yAfter) > LEADER_MIN ? (
              <line stroke="var(--text-muted)" strokeWidth={1} x1={X_RIGHT + DOT_RADIUS + 1} x2={X_RIGHT + LABEL_OFFSET - 3} y1={row.yAfter} y2={row.labelAfter} />
            ) : null}
            <circle cx={X_LEFT} cy={row.yBefore} fill={row.color} r={DOT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} />
            <circle cx={X_RIGHT} cy={row.yAfter} fill={row.color} r={DOT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} />

            <text className="font-sans" dominantBaseline="central" fill={row.color} fontSize={12} fontWeight={weight} textAnchor="end" x={X_LEFT - LABEL_OFFSET - VALUE_WIDTH} y={row.labelBefore}>
              {row.item.name}
            </text>
            <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={500} textAnchor="end" x={X_LEFT - LABEL_OFFSET} y={row.labelBefore}>
              {pct(row.before)}
            </text>
            <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={500} textAnchor="start" x={X_RIGHT + LABEL_OFFSET} y={row.labelAfter}>
              {pct(row.after)}
            </text>
            <text className="font-sans" dominantBaseline="central" fill={row.color} fontSize={12} fontWeight={weight} textAnchor="start" x={X_RIGHT + LABEL_OFFSET + VALUE_WIDTH} y={row.labelAfter}>
              {row.item.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
