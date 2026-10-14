import { Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, Rectangle, ResponsiveContainer, XAxis, YAxis, type BarShapeProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  highlightId as defaultHighlightId,
  metrics as defaultMetrics,
  type MetricSpec,
  type PlatformMetrics,
} from './data';

/**
 * Pequenos múltiplos de barras: um BarChart por métrica, mesma plataforma na mesma linha em todos
 * os painéis, porque as cinco métricas têm unidades diferentes e não cabem num eixo comum. A
 * coluna de nome, à esquerda, reserva o mesmo cabeçalho em branco dos painéis (`HEADER_H`) para as
 * linhas caírem na mesma altura em todos, sem medir o DOM.
 */
export interface MetricSmallMultiplesProps {
  readonly data?: readonly PlatformMetrics[];
  readonly metrics?: readonly MetricSpec[];
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

const HIGHLIGHT_FILL = 'var(--chart-1)';
const NEUTRAL_FILL = 'var(--line-strong)';
const HEADER_H = 32;
const NAME_COLUMN_WIDTH = 116;
/**
 * `right` reserva o rótulo mais largo possível no painel: a palavra "indisponível" com o ícone
 * (maior que qualquer valor formatado desta versão). Sem essa margem o maior valor de cada painel
 * (o que encosta em `dataMax`) escreve o rótulo fora do corpo, e no último painel fora do canvas.
 */
const MARGIN = { top: 0, right: 92, bottom: 0, left: 0 } as const;
const VALUE_LABEL_GAP = 6;
const UNAVAILABLE_ICON_SIZE = 11;
const UNAVAILABLE_TEXT_GAP = 4;
const BAR_MAX = 10;
const BAR_RADIUS: [number, number, number, number] = [0, 2, 2, 0];

function formatMetricValue(metric: MetricSpec, value: number): string {
  return metric.unit === 'currency' ? formatCurrencyCompact(value) : formatPercent(value, 1);
}

interface Extreme {
  readonly id: string;
  readonly value: number;
}

function bestAndWorst(rows: readonly PlatformMetrics[], metric: MetricSpec): { best?: Extreme; worst?: Extreme } {
  const entries: Extreme[] = [];
  for (const row of rows) {
    const value = row.values[metric.key];
    if (value !== null) entries.push({ id: row.id, value });
  }
  if (entries.length === 0) return {};
  const [first, ...rest] = entries;
  if (!first) return {};
  let best = first;
  let worst = first;
  for (const entry of rest) {
    const better = metric.goodDirection === 'down' ? entry.value < best.value : entry.value > best.value;
    const badder = metric.goodDirection === 'down' ? entry.value > worst.value : entry.value < worst.value;
    if (better) best = entry;
    if (badder) worst = entry;
  }
  return { best, worst };
}

function evaluateHighlight(
  rows: readonly PlatformMetrics[],
  metrics: readonly MetricSpec[],
  highlightId: string,
): { bestLabels: string[]; worstLabels: string[] } {
  const bestLabels: string[] = [];
  const worstLabels: string[] = [];
  for (const metric of metrics) {
    if (metric.goodDirection === 'none') continue;
    const { best, worst } = bestAndWorst(rows, metric);
    if (best?.id === highlightId) bestLabels.push(metric.label);
    if (worst?.id === highlightId && worst.id !== best?.id) worstLabels.push(metric.label);
  }
  return { bestLabels, worstLabels };
}

interface MetricPanelProps {
  readonly metric: MetricSpec;
  readonly rows: readonly PlatformMetrics[];
  readonly highlightId: string;
  readonly animate: boolean;
}

interface PlotRow {
  readonly id: string;
  readonly value: number | null;
  readonly plotValue: number;
}

function MetricPanel({ metric, rows, highlightId, animate }: MetricPanelProps): ReactElement {
  const plotRows: PlotRow[] = rows.map((row) => {
    const value = row.values[metric.key];
    return { id: row.id, value, plotValue: value ?? 0 };
  });

  /**
   * Barra e rótulo desenhados juntos a partir do `payload` do próprio Recharts, nunca do `index`
   * da `LabelList`: o Recharts descarta barras de largura zero do array antes de numerar (métrica
   * indisponível vira `plotValue = 0`), o que empurrava o rótulo indisponível para a linha seguinte
   * (mesma causa do v3, aqui sem `shape` o array ficava mesmo sem esse escape). Com `shape`, o
   * Recharts para de descartar a barra de largura zero e o `payload` sempre aponta a linha certa.
   */
  const renderBar = ({ x, y, width, height: barHeight, payload }: BarShapeProps): ReactElement | null => {
    const row = payload as PlotRow | undefined;
    if (!row) return null;
    const textX = Number(x) + Number(width) + VALUE_LABEL_GAP;
    const textY = Number(y) + Number(barHeight) / 2;
    if (row.value === null) {
      return (
        <g>
          <Unplug
            aria-hidden
            className="text-text-muted"
            height={UNAVAILABLE_ICON_SIZE}
            width={UNAVAILABLE_ICON_SIZE}
            x={textX}
            y={textY - UNAVAILABLE_ICON_SIZE / 2}
          />
          <text
            className="font-sans"
            dominantBaseline="central"
            fill="var(--text-muted)"
            fontSize={11}
            x={textX + UNAVAILABLE_ICON_SIZE + UNAVAILABLE_TEXT_GAP}
            y={textY}
          >
            {formatUnavailable()}
          </text>
        </g>
      );
    }
    const isHighlight = row.id === highlightId;
    return (
      <g>
        <Rectangle
          fill={isHighlight ? HIGHLIGHT_FILL : NEUTRAL_FILL}
          height={Number(barHeight)}
          radius={BAR_RADIUS}
          width={Number(width)}
          x={Number(x)}
          y={Number(y)}
        />
        <text
          className="font-display"
          dominantBaseline="central"
          fill={isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontSize={11}
          fontWeight={isHighlight ? 700 : 500}
          x={textX}
          y={textY}
        >
          {formatMetricValue(metric, row.value)}
        </text>
      </g>
    );
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="shrink-0 leading-tight" style={{ height: HEADER_H }}>
        <p className="truncate text-xs font-semibold text-text-primary">{metric.label}</p>
        <p className="truncate text-[0.6875rem] text-text-muted">{metric.note}</p>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="26%" data={plotRows} layout="vertical" margin={MARGIN}>
            <XAxis dataKey="plotValue" domain={[0, 'dataMax']} hide type="number" />
            <YAxis dataKey="id" hide type="category" />
            <Bar dataKey="plotValue" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function MetricSmallMultiples({
  data = defaultData,
  metrics = defaultMetrics,
  highlightId = defaultHighlightId,
  height,
  className,
}: MetricSmallMultiplesProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0 || metrics.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte: não houve investimento de mídia medido no mês.</span>
      </div>
    );
  }

  const highlightRow = data.find((row) => row.id === highlightId);
  const { bestLabels, worstLabels } = evaluateHighlight(data, metrics, highlightId);

  const summary = [
    `Pequenos múltiplos comparando ${String(data.length)} plataformas de mídia em ${String(metrics.length)} métricas.`,
    highlightRow && bestLabels.length > 0 ? `${highlightRow.platform} lidera em ${bestLabels.join(' e ')}.` : '',
    highlightRow && worstLabels.length > 0 ? `Fica atrás em ${worstLabels.join(' e ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {highlightRow && (bestLabels.length > 0 || worstLabels.length > 0) ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">{highlightRow.platform}</span>
          {bestLabels.length > 0 ? (
            <>
              {' '}
              lidera em <span className="text-text-primary">{bestLabels.join(', ')}</span>
            </>
          ) : null}
          {worstLabels.length > 0 ? (
            <>
              , atrás em <span className="text-text-primary">{worstLabels.join(', ')}</span>
            </>
          ) : null}
        </p>
      ) : null}
      <div className="flex min-h-0 flex-1 gap-2">
        <div className="flex shrink-0 flex-col" style={{ width: NAME_COLUMN_WIDTH }}>
          <div className="shrink-0" style={{ height: HEADER_H }} />
          <div className="grid min-h-0 flex-1" style={{ gridTemplateRows: `repeat(${String(data.length)}, minmax(0, 1fr))` }}>
            {data.map((row) => {
              const isHighlight = row.id === highlightId;
              return (
                <div
                  className={cn(
                    'flex items-center truncate text-xs',
                    isHighlight ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary',
                  )}
                  key={row.id}
                >
                  {row.platform}
                </div>
              );
            })}
          </div>
        </div>
        {metrics.map((metric) => (
          <MetricPanel animate={animate} highlightId={highlightId} key={metric.key} metric={metric} rows={data} />
        ))}
      </div>
    </div>
  );
}
