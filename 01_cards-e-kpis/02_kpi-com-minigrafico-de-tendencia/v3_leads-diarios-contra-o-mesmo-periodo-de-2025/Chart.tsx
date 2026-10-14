import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, YAxis, type DotItemDotProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type YearOverYearLeads } from './data';

/**
 * Cartão de KPI: leads por dia dos últimos 30 dias contra os mesmos 30 dias do ano anterior,
 * alinhados por dia da semana. A série anterior corre atrás, neutra e tracejada; a atual corre
 * na frente, cheia e na cor do cartão. Recharts nativo, com o pico de campanha do ano anterior
 * anotado em vez de recortar a escala comum às duas séries.
 */
export interface YearOverYearSparklineCardProps {
  readonly data?: YearOverYearLeads;
  readonly className?: string;
}

const MARGIN = { top: 8, right: 42, bottom: 4, left: 4 } as const;
/** Variação abaixo disto (0,05%) é lida como estável: nem verde nem vermelho. */
const FLAT_THRESHOLD = 0.0005;
const WHOLE_PERCENT_FROM = 0.1;

interface MergedPoint {
  readonly index: number;
  readonly current: number;
  readonly previous: number;
}

function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  const digits = absolute >= WHOLE_PERCENT_FROM ? 0 : 1;
  return `${fraction > 0 ? '+' : '−'}${formatPercent(absolute, digits)}`;
}

export default function YearOverYearSparklineCard({ data = defaultData, className }: YearOverYearSparklineCardProps) {
  const animate = useAnimateOnce();
  const length = Math.min(data.current.length, data.previous.length);
  const merged: MergedPoint[] = [];
  for (let i = 0; i < length; i += 1) {
    const current = data.current[i];
    const previous = data.previous[i];
    if (current && previous) merged.push({ index: i, current: current.value, previous: previous.value });
  }
  const lastIndex = merged.length - 1;

  const totalCurrent = merged.reduce((sum, point) => sum + point.current, 0);
  const totalPrevious = merged.reduce((sum, point) => sum + point.previous, 0);
  const delta = totalPrevious !== 0 ? (totalCurrent - totalPrevious) / totalPrevious : null;
  const isFlat = delta !== null && Math.abs(delta) < FLAT_THRESHOLD;
  const isUp = delta !== null && delta > 0;
  const isGood = delta !== null && !isFlat && (data.goodDirection === 'up' ? isUp : !isUp);
  const DeltaIcon = isFlat ? ArrowRight : isUp ? ArrowUpRight : ArrowDownRight;

  const allValues = merged.flatMap((point) => [point.current, point.previous]);
  const domainMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const domainMax = allValues.length > 0 ? Math.max(...allValues) : 0;

  const spikePoint = merged[data.campaignSpikeIndex];
  const spikeValue = spikePoint?.previous ?? null;
  const isSpikeExtreme = spikeValue !== null && spikeValue === domainMax;

  const summary = [
    `Gráfico de linhas com ${data.label.toLowerCase()} dos últimos ${String(merged.length)} dias de ${data.currentYear} sobre os mesmos dias de ${data.previousYear}, alinhados por dia da semana.`,
    delta !== null
      ? `Total de ${data.currentYear}: ${formatInt(totalCurrent)} leads, ${isFlat ? 'estável' : signedPercent(delta)} contra ${formatInt(totalPrevious)} em ${data.previousYear}.`
      : `Total de ${data.currentYear}: ${formatInt(totalCurrent)} leads, sem total de ${data.previousYear} para comparar.`,
    isSpikeExtreme ? `Pico isolado de campanha em ${data.previousYear} achata a escala comum às duas séries.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-xs text-text-muted tabular-nums">{formatInt(merged.length)} dias</p>
      </div>

      <p className="kpi-number mt-2 text-3xl leading-none font-semibold text-text-primary">{formatInt(totalCurrent)}</p>

      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
        {delta !== null ? (
          <>
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-0.5 font-semibold',
                isFlat ? 'text-text-secondary' : isGood ? 'text-positive' : 'text-negative',
              )}
            >
              <DeltaIcon aria-hidden className="size-3.5" strokeWidth={2.5} />
              <span className="kpi-number">{isFlat ? 'estável' : signedPercent(delta)}</span>
            </span>
            <span className="min-w-0 truncate">
              contra <span className="kpi-number text-text-secondary">{formatInt(totalPrevious)}</span> em {data.previousYear}
            </span>
          </>
        ) : (
          <span>sem total de {data.previousYear} para comparar</span>
        )}
      </p>

      <div aria-hidden className="mt-4 min-h-8 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={merged} margin={MARGIN}>
            <YAxis domain={[domainMin, domainMax]} hide />
            <Line
              dataKey="previous"
              dot={({ cx, cy, index }: DotItemDotProps) =>
                index === data.campaignSpikeIndex && cx !== undefined && cy !== undefined ? (
                  <circle cx={cx} cy={cy} fill="none" key="spike" r={4} stroke="var(--line-strong)" strokeWidth={1.5} />
                ) : index === lastIndex && cx !== undefined && cy !== undefined ? (
                  <text className="font-display" fill="var(--text-muted)" fontSize={11} key="prev-label" x={cx + 6} y={cy + 3}>
                    {data.previousYear}
                  </text>
                ) : null
              }
              isAnimationActive={animate}
              stroke="var(--line-strong)"
              strokeDasharray="3 3"
              strokeWidth={1}
              type="monotone"
            />
            <Line
              dataKey="current"
              dot={({ cx, cy, index }: DotItemDotProps) =>
                index === lastIndex && cx !== undefined && cy !== undefined ? (
                  <g key="current-end">
                    <circle cx={cx} cy={cy} fill="var(--chart-1)" r={3.5} stroke="var(--surface-raised)" strokeWidth={1.5} />
                    <text
                      className="font-display"
                      fill="var(--chart-1)"
                      fontSize={11}
                      fontWeight={700}
                      style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
                      x={cx + 6}
                      y={cy - 5}
                    >
                      {data.currentYear}
                    </text>
                  </g>
                ) : null
              }
              isAnimationActive={animate}
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[0.6875rem] leading-none text-text-muted">
        alinhado por dia da semana
        {isSpikeExtreme ? ', pico de campanha isolado achata a escala' : ''}
      </p>
    </article>
  );
}
