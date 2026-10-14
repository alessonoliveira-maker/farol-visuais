import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, scale as defaultScale, type OriginRatings, type ScalePoint } from './data';

/**
 * Versão mini da pilha divergente, uma barra estreita por linha, para caber doze origens num card
 * alto sem perder o centro comum. O neutro fica em coluna própria de número, não de barra: numa
 * faixa de 28 px uma barra de neutro ficaria fina demais para comparar visualmente.
 */
export interface OriginLikertMiniProps {
  readonly data?: readonly OriginRatings[];
  readonly scale?: readonly ScalePoint[];
  readonly height?: number;
  readonly className?: string;
}

const GRID_COLUMNS = 'grid grid-cols-[11rem_minmax(0,1fr)_5rem_4.5rem] gap-x-3';
const ROW_HEIGHT = 28;
const BAR_HEIGHT = 18;
const SEGMENT_SEPARATOR = 1;
const LABEL_MIN_SHARE = 0.1;
const SEPARATOR_STROKE = 'var(--surface-raised)';
const ZERO_STROKE = 'var(--line-strong)';
const SEGMENT_TEXT = 'var(--accent-cyan-contrast)';

/** Junta rótulos em prosa: "A", "A e B" ou "A, B e C" (sem vírgula sobrando, sem "e" repetido). */
function joinLabels(labels: readonly string[]): string {
  if (labels.length <= 1) return labels[0] ?? '';
  return `${labels.slice(0, -1).join(', ')} e ${labels[labels.length - 1]}`;
}

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

function toRow(item: OriginRatings, scale: readonly ScalePoint[]) {
  const counts = scale.map((point) => item.counts[point.key]);
  const total = counts.reduce((sum, value) => sum + value, 0);
  const percents = largestRemainder(counts);
  const poleSum = (pole: ScalePoint['pole']) =>
    scale.reduce((sum, point, index) => (point.pole === pole ? sum + (percents[index] ?? 0) : sum), 0);
  const negative = poleSum('negative');
  const segments: Segment[] = [];
  let cursor = -negative;
  scale.forEach((point, index) => {
    if (point.pole === 'neutral') return;
    const percent = percents[index] ?? 0;
    segments.push({ point, percent, start: cursor });
    cursor += percent;
  });
  return { item, total, negative, neutral: poleSum('neutral'), positive: poleSum('positive'), segments };
}

function pointColor(point: ScalePoint): string {
  return point.slot === undefined ? 'var(--line-strong)' : (CHART_SERIES_COLORS[point.slot - 1] ?? 'var(--line-strong)');
}

function toX(fraction: number): string {
  return `${String(Math.round(fraction * 10000) / 100)}%`;
}

export default function OriginLikertMini({ data = defaultData, scale = defaultScale, height, className }: OriginLikertMiniProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma avaliação neste recorte: não houve handoff avaliado no período.</span>
      </div>
    );
  }

  const rows = data.map((item) => toRow(item, scale));
  const leftMax = Math.max(0, ...rows.map((row) => row.negative));
  const rightMax = Math.max(0, ...rows.map((row) => row.positive));
  const span = Math.max(1, leftMax + rightMax);
  const zero = toX(leftMax / span);
  /** Todas as origens com saldo negativo, da pior para a menos ruim (nunca assume que há só uma). */
  const negativeRows = rows.filter((row) => row.positive < row.negative).sort((a, b) => a.positive - a.negative - (b.positive - b.negative));
  const negativeSentence =
    negativeRows.length === 0
      ? ''
      : negativeRows.length === 1
        ? `A única com mais avaliação ruim que boa é ${negativeRows[0]?.item.label}.`
        : `As origens com mais avaliação ruim que boa são ${joinLabels(negativeRows.map((row) => row.item.label))}.`;
  const summary = `Gráfico de barras divergentes empilhadas mini com ${formatInt(rows.length)} origens de lead numa escala de ${formatInt(scale.length)} pontos. ${negativeSentence}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col justify-center', className)} role="img" style={style}>
      <div aria-hidden className={cn(GRID_COLUMNS, 'mb-2 shrink-0 items-center')}>
        <span />
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          {scale
            .filter((point) => point.pole !== 'neutral')
            .map((point) => (
              <span className="flex items-center gap-1 text-xs text-text-secondary" key={point.key}>
                <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: pointColor(point) }} />
                {point.label}
              </span>
            ))}
        </div>
        <span />
        <span />
      </div>
      {rows.map((row) => (
        <div className={cn(GRID_COLUMNS, 'shrink-0 items-center')} key={row.item.id} style={{ height: ROW_HEIGHT }}>
          <span className="truncate text-xs font-medium text-text-secondary">{row.item.label}</span>
          <svg aria-hidden className="block w-full" height={ROW_HEIGHT}>
            {row.segments.map((segment) =>
              segment.percent > 0 ? (
                <rect
                  fill={pointColor(segment.point)}
                  height={BAR_HEIGHT}
                  key={segment.point.key}
                  stroke={SEPARATOR_STROKE}
                  strokeWidth={SEGMENT_SEPARATOR}
                  width={toX(segment.percent / span)}
                  x={toX((segment.start + leftMax) / span)}
                  y={(ROW_HEIGHT - BAR_HEIGHT) / 2}
                />
              ) : null,
            )}
            {row.segments.map((segment) =>
              segment.percent / span >= LABEL_MIN_SHARE ? (
                <text
                  className="font-display"
                  dominantBaseline="central"
                  fill={SEGMENT_TEXT}
                  fontSize={11}
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
          <span className="font-display text-right text-xs whitespace-nowrap text-text-muted tabular-nums">{formatPercent(row.neutral / 100, 0)} neutro</span>
          <span className="text-right text-[0.6875rem] whitespace-nowrap text-text-muted tabular-nums">{formatInt(row.total)} resp.</span>
        </div>
      ))}
    </div>
  );
}
