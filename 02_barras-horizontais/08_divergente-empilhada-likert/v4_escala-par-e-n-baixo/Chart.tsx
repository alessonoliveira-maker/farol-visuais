import { Filter, Unplug } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, scale as defaultScale, type ScalePoint, type StatementRatings } from './data';

/**
 * Pilha divergente de escala par, sem ponto neutro: o zero cai exatamente na fronteira entre o
 * último ponto negativo e o primeiro positivo, sem coluna de meio. Item sem nenhuma resposta
 * escreve indisponível; item com poucas respostas perde opacidade e ganha o selo "n baixo", porque
 * uma pilha de 4 pessoas ocupa a mesma largura visual de uma de 40.
 */
export interface ScaleParityLikertProps {
  readonly data?: readonly StatementRatings[];
  readonly scale?: readonly ScalePoint[];
  readonly height?: number;
  readonly className?: string;
}

const GRID_COLUMNS = 'grid grid-cols-[13rem_minmax(0,1fr)_6.5rem] gap-x-4';
const ROW_HEIGHT = 28;
const BAR_HEIGHT = 18;
const SEGMENT_SEPARATOR = 1.5;
const LABEL_MIN_SHARE = 0.08;
const LOW_N_THRESHOLD = 10;
const SEPARATOR_STROKE = 'var(--surface-raised)';
const ZERO_STROKE = 'var(--line-strong)';
const SEGMENT_TEXT = 'var(--accent-cyan-contrast)';

interface Segment {
  readonly point: ScalePoint;
  readonly percent: number;
  readonly start: number;
}

function largestRemainder(counts: readonly number[]): number[] {
  const total = counts.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return counts.map(() => 0);
  const raw = counts.map((value) => (value / total) * 100);
  const result = raw.map(Math.floor);
  let missing = 100 - result.reduce((sum, value) => sum + value, 0);
  const byRemainder = raw
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of byRemainder) {
    if (missing <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    missing -= 1;
  }
  return result;
}

function pointColor(point: ScalePoint): string {
  return CHART_SERIES_COLORS[point.slot - 1] ?? 'var(--line-strong)';
}

function toX(fraction: number): string {
  return `${String(Math.round(fraction * 10000) / 100)}%`;
}

export default function ScaleParityLikert({ data = defaultData, scale = defaultScale, height, className }: ScaleParityLikertProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma afirmação neste recorte: a pesquisa não teve resposta no período.</span>
      </div>
    );
  }

  const rows = data.map((item) => {
    if (!item.counts) return { item, total: 0, negative: 0, positive: 0, segments: [] as Segment[] };
    const counts = scale.map((point) => item.counts?.[point.key] ?? 0);
    const total = counts.reduce((sum, value) => sum + value, 0);
    const percents = largestRemainder(counts);
    const negative = scale.reduce((sum, point, index) => (point.pole === 'negative' ? sum + (percents[index] ?? 0) : sum), 0);
    const positive = scale.reduce((sum, point, index) => (point.pole === 'positive' ? sum + (percents[index] ?? 0) : sum), 0);
    let cursor = -negative;
    const segments = scale.map((point, index) => {
      const percent = percents[index] ?? 0;
      const segment = { point, percent, start: cursor };
      cursor += percent;
      return segment;
    });
    return { item, total, negative, positive, segments };
  });
  const answered = rows.filter((row) => row.item.counts !== undefined);
  const leftMax = Math.max(0, ...answered.map((row) => row.negative));
  const rightMax = Math.max(0, ...answered.map((row) => row.positive));
  const span = Math.max(1, leftMax + rightMax);
  const zero = toX(leftMax / span);
  const summary = `Gráfico de barras divergentes empilhadas com ${formatInt(answered.length)} afirmações numa escala par de ${formatInt(scale.length)} pontos, sem ponto neutro. Uma afirmação está sem resposta no período.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className={cn(GRID_COLUMNS, 'mb-1 shrink-0 items-center gap-y-1')}>
        <span />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {scale.map((point) => (
            <span className="flex items-center gap-1.5 text-xs text-text-secondary" key={point.key}>
              <span className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: pointColor(point) }} />
              {point.label}
            </span>
          ))}
        </div>
      </div>

      {rows.map((row) => {
        const lowN = row.total > 0 && row.total < LOW_N_THRESHOLD;
        return (
          <div className={cn(GRID_COLUMNS, 'shrink-0 items-center')} key={row.item.id} style={{ height: ROW_HEIGHT }}>
            <span className="text-xs font-medium whitespace-nowrap text-text-secondary">{row.item.label}</span>
            {row.item.counts === undefined ? (
              <span className="flex items-center gap-2 text-xs text-text-muted">
                <Unplug aria-hidden className="size-4 shrink-0" />
                {formatUnavailable()}
              </span>
            ) : (
              <svg aria-hidden className="block w-full" height={ROW_HEIGHT}>
                {row.segments.map((segment) =>
                  segment.percent > 0 ? (
                    <rect
                      fill={pointColor(segment.point)}
                      fillOpacity={lowN ? 0.6 : 1}
                      height={BAR_HEIGHT}
                      key={segment.point.key}
                      stroke={SEPARATOR_STROKE}
                      strokeOpacity={lowN ? 0.6 : 1}
                      strokeWidth={SEGMENT_SEPARATOR}
                      width={toX(segment.percent / span)}
                      x={toX((segment.start + leftMax) / span)}
                      y={(ROW_HEIGHT - BAR_HEIGHT) / 2}
                    />
                  ) : null,
                )}
                {row.segments.map((segment) =>
                  !lowN && segment.percent / span >= LABEL_MIN_SHARE ? (
                    <text
                      className="font-display"
                      dominantBaseline="central"
                      fill={SEGMENT_TEXT}
                      fontSize={12}
                      fontWeight={500}
                      key={segment.point.key}
                      textAnchor="middle"
                      x={toX((segment.start + segment.percent / 2 + leftMax) / span)}
                      y={ROW_HEIGHT / 2}
                    >
                      {formatPercent(segment.percent / 100, 0)}
                    </text>
                  ) : null,
                )}
                <line stroke={ZERO_STROKE} strokeWidth={1} x1={zero} x2={zero} y1={0} y2={ROW_HEIGHT} />
              </svg>
            )}
            <span className="flex items-center justify-end gap-1.5 text-right text-[0.6875rem] whitespace-nowrap text-text-muted tabular-nums">
              {lowN ? <span className="rounded-sm bg-surface-overlay px-1 py-0.5 text-[0.6875rem] text-warning">n baixo</span> : null}
              {row.total > 0 ? `${formatInt(row.total)} respostas` : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
