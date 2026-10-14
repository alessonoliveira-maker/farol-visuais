import { Filter } from 'lucide-react';

import { formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, periods as defaultPeriods, type PlatformSeries } from './data';

/**
 * Area bump em SVG puro com uma plataforma em destaque: a posição vertical é o ranking do período
 * e a espessura é o investimento, na mesma escala em todos os períodos. Leia primeiro a posição do
 * destaque; a espessura é a leitura secundária. A coluna de cada período fica centrada na altura do
 * corpo porque o total varia (regra declarada). Pintura em duas camadas: as faixas neutras primeiro,
 * o destaque por último, para ficar por cima nos cruzamentos com qualquer outra faixa.
 */
export interface PlatformHighlightBumpProps {
  readonly data?: readonly PlatformSeries[];
  readonly periods?: readonly string[];
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 894;
const VIEW_H = 282;
/** Margens largas: cabem "1º Marketplace de vídeo" à esquerda e "Marketplace de vídeo R$ 190,0 mil" à direita. */
const MARGIN = { top: 28, right: 232, bottom: 28, left: 172 } as const;
const ROW_GAP = 12;
const MAX_THICKNESS = 28;
const ZERO_THICKNESS = 2;
const STUB_WIDTH = 12;
const RIBBON_STROKE = 'var(--surface-raised)';
const HIGHLIGHT_FILL = 'var(--chart-1)';
const NEUTRAL_FILL = 'var(--line-strong)';
const DOT_RADIUS = 3;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface Band {
  readonly top: number;
  readonly bottom: number;
  readonly value: number;
  readonly rank: number;
}

function rankIds(series: readonly PlatformSeries[], t: number, previous: readonly string[]): string[] {
  const previousRank = new Map(previous.map((id, index) => [id, index]));
  return series
    .filter((s) => (s.values[t] ?? null) !== null)
    .map((s) => ({ id: s.id, value: s.values[t] as number }))
    .sort((a, b) => b.value - a.value || (previousRank.get(a.id) ?? 0) - (previousRank.get(b.id) ?? 0))
    .map((item) => item.id);
}

function buildColumns(series: readonly PlatformSeries[], periodCount: number, scale: number, bodyTop: number, bodyHeight: number) {
  let previous = series.map((s) => s.id);
  const columns: Map<string, Band>[] = [];
  for (let t = 0; t < periodCount; t += 1) {
    const order = rankIds(series, t, previous);
    if (order.length > 0) previous = order;
    const thickness = order.map((id) => {
      const value = series.find((s) => s.id === id)?.values[t] ?? 0;
      return value === 0 ? ZERO_THICKNESS : Math.max(value, 0) * scale;
    });
    const columnHeight = thickness.reduce((sum, h) => sum + h, 0) + ROW_GAP * Math.max(order.length - 1, 0);
    let y = bodyTop + (bodyHeight - columnHeight) / 2;
    const column = new Map<string, Band>();
    order.forEach((id, rank) => {
      const h = thickness[rank] ?? ZERO_THICKNESS;
      const value = series.find((s) => s.id === id)?.values[t] ?? 0;
      column.set(id, { top: y, bottom: y + h, value, rank });
      y += h + ROW_GAP;
    });
    columns.push(column);
  }
  return columns;
}

function ribbonPath(x0: number, x1: number, a: Band, b: Band): string {
  const mx = (x0 + x1) / 2;
  return `M${x0} ${a.top} C${mx} ${a.top} ${mx} ${b.top} ${x1} ${b.top} L${x1} ${b.bottom} C${mx} ${b.bottom} ${mx} ${a.bottom} ${x0} ${a.bottom} Z`;
}

function stubPath(x: number, band: Band): string {
  return `M${x - STUB_WIDTH / 2} ${band.top} L${x + STUB_WIDTH / 2} ${band.top} L${x + STUB_WIDTH / 2} ${band.bottom} L${x - STUB_WIDTH / 2} ${band.bottom} Z`;
}

export default function PlatformHighlightBump({
  data = defaultData,
  periods = defaultPeriods,
  highlightId = defaultHighlightId,
  height,
  className,
}: PlatformHighlightBumpProps) {
  const periodCount = Math.min(data.reduce((max, s) => Math.max(max, s.values.length), 0), periods.length);

  if (data.length === 0 || periodCount === 0) {
    return (
      <div
        aria-label="Sem plataformas para desenhar o ranking neste recorte."
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte: não há ranking para desenhar.</span>
      </div>
    );
  }

  const bodyTop = MARGIN.top;
  const bodyHeight = VIEW_H - MARGIN.top - MARGIN.bottom;
  const maxValue = data.reduce((max: number, s) => s.values.reduce((m: number, v) => Math.max(m, v ?? 0), max), 0);
  const scale = maxValue > 0 ? MAX_THICKNESS / maxValue : 0;
  const columns = buildColumns(data, periodCount, scale, bodyTop, bodyHeight);
  const plotWidth = VIEW_W - MARGIN.left - MARGIN.right;
  const xAt = (t: number) => MARGIN.left + (periodCount <= 1 ? 0 : (plotWidth * t) / (periodCount - 1));

  const covered = new Set<string>();
  const neutralShapes: { id: string; d: string }[] = [];
  const highlightShapes: { id: string; d: string }[] = [];
  for (let t = 0; t < periodCount - 1; t += 1) {
    for (const series of data) {
      const a = columns[t]?.get(series.id);
      const b = columns[t + 1]?.get(series.id);
      if (!a || !b) continue;
      const shape = { id: series.id, d: ribbonPath(xAt(t), xAt(t + 1), a, b) };
      (series.id === highlightId ? highlightShapes : neutralShapes).push(shape);
      covered.add(`${String(t)}-${series.id}`);
      covered.add(`${String(t + 1)}-${series.id}`);
    }
  }
  for (let t = 0; t < periodCount; t += 1) {
    for (const series of data) {
      const band = columns[t]?.get(series.id);
      if (!band || covered.has(`${String(t)}-${series.id}`)) continue;
      const shape = { id: series.id, d: stubPath(xAt(t), band) };
      (series.id === highlightId ? highlightShapes : neutralShapes).push(shape);
    }
  }

  const first = columns[0];
  const last = columns[periodCount - 1];
  const highlight = data.find((s) => s.id === highlightId);
  const highlightStart = first?.get(highlightId);
  const highlightEnd = last?.get(highlightId);
  const summary = [
    `Area bump com o investimento trimestral de ${String(data.length)} plataformas fictícias, em ${String(periodCount)} trimestres, com uma em destaque.`,
    highlight && highlightStart && highlightEnd
      ? `${highlight.label} sai do ${String(highlightStart.rank + 1)}º lugar e termina em ${String(highlightEnd.rank + 1)}º, com ${formatCurrencyCompact(highlightEnd.value)}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={height === undefined ? undefined : { height }}>
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <text className="font-sans" fill="var(--text-muted)" fontSize={12} x={MARGIN.left} y={16}>
          Posição vertical é o ranking do trimestre; espessura da faixa é o investimento
        </text>
        {neutralShapes.map((shape, index) => (
          <path d={shape.d} fill={NEUTRAL_FILL} key={`neutral-${shape.id}-${String(index)}`} stroke={RIBBON_STROKE} strokeWidth={1.5} />
        ))}
        {highlightShapes.map((shape, index) => (
          <path d={shape.d} fill={HIGHLIGHT_FILL} key={`highlight-${shape.id}-${String(index)}`} stroke={RIBBON_STROKE} strokeWidth={1.5} />
        ))}
        {periods.slice(0, periodCount).map((_, t) => {
          const band = columns[t]?.get(highlightId);
          if (!band) return null;
          const cx = xAt(t);
          const cy = (band.top + band.bottom) / 2;
          return (
            <g key={`rank-${String(t)}`}>
              <circle cx={cx} cy={cy} fill={HIGHLIGHT_FILL} r={DOT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1} />
              <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={11} fontWeight={600} style={HALO} textAnchor="middle" x={cx} y={cy - DOT_RADIUS - 8}>
                {formatInt(band.rank + 1)}º
              </text>
            </g>
          );
        })}
        {data.map((series) => {
          const start = first?.get(series.id);
          const end = last?.get(series.id);
          const isHighlight = series.id === highlightId;
          const textFill = isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)';
          const weight = isHighlight ? 700 : 500;
          return (
            <g key={`label-${series.id}`}>
              {start ? (
                <text className="font-sans" dominantBaseline="central" fill={textFill} fontSize={12} fontWeight={weight} textAnchor="end" x={MARGIN.left - 10} y={(start.top + start.bottom) / 2}>
                  <tspan className="font-display">{formatInt(start.rank + 1)}º</tspan> {series.label}
                </text>
              ) : null}
              {end ? (
                <text className="font-sans" dominantBaseline="central" fill={textFill} fontSize={12} fontWeight={weight} textAnchor="start" x={VIEW_W - MARGIN.right + 10} y={(end.top + end.bottom) / 2}>
                  {series.label} <tspan className="font-display">{formatCurrencyCompact(end.value)}</tspan>
                </text>
              ) : null}
            </g>
          );
        })}
        {periods.slice(0, periodCount).map((label, index) => (
          <text className="font-sans" dominantBaseline="hanging" fill="var(--text-muted)" fontSize={11} key={`tick-${label}`} textAnchor="middle" x={xAt(index)} y={VIEW_H - MARGIN.bottom + 6}>
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
