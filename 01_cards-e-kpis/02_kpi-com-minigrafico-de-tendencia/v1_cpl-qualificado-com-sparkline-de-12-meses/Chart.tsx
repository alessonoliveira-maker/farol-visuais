import { ArrowDownRight, ArrowRight, ArrowUpRight, Unplug } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, type DotItemDotProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatMonthLong, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CplTrend } from './data';

/**
 * Cartão de KPI: o CPL qualificado do mês, a variação contra o mês anterior com polaridade
 * "menor melhor", e a sparkline dos últimos 12 meses logo abaixo, sem eixo nem grade, com o
 * ponto final aceso. Recharts nativo; a linha quebra no mês sem coleta em vez de interpolar.
 */
export interface CplSparklineCardProps {
  readonly data?: CplTrend;
  readonly className?: string;
}

const MARGIN = { top: 4, right: 4, bottom: 4, left: 4 } as const;
/** Variação abaixo disto (0,05%) é lida como estável: nem verde nem vermelho. */
const FLAT_THRESHOLD = 0.0005;
/** A partir de 10% de variação, a casa decimal não muda a decisão. */
const WHOLE_PERCENT_FROM = 0.1;

function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  const digits = absolute >= WHOLE_PERCENT_FROM ? 0 : 1;
  // Sinal de menos tipográfico (U+2212), não hífen.
  return `${fraction > 0 ? '+' : '−'}${formatPercent(absolute, digits)}`;
}

export default function CplSparklineCard({ data = defaultData, className }: CplSparklineCardProps) {
  const animate = useAnimateOnce();
  const series = [...data.series];
  const first = series.at(0);
  const current = series.at(-1);
  const previous = series.at(-2);
  const currentValue = current?.value ?? null;
  const previousValue = previous?.value ?? null;
  const lastIndex = series.length - 1;

  const delta =
    currentValue !== null && previousValue !== null && previousValue !== 0 ? (currentValue - previousValue) / previousValue : null;
  const isFlat = delta !== null && Math.abs(delta) < FLAT_THRESHOLD;
  const isDown = delta !== null && delta < 0;
  const isGood = delta !== null && !isFlat && (data.goodDirection === 'down' ? isDown : !isDown);
  const DeltaIcon = isFlat ? ArrowRight : isDown ? ArrowDownRight : ArrowUpRight;

  const validValues = series.flatMap((point) => (point.value === null ? [] : [point.value]));
  const lowest = validValues.length > 0 ? Math.min(...validValues) : null;
  const isLowest = currentValue !== null && lowest !== null && currentValue === lowest;

  const summary = [
    currentValue !== null && current
      ? `Cartão de KPI com tendência de 12 meses do ${data.label}. Em ${formatMonthLong(current.month)} fechou em ${formatCurrencyCompact(currentValue)}${isLowest ? ', o menor ponto da série' : ''}.`
      : `${data.label}: ${formatUnavailable()} no mês atual.`,
    delta !== null && previous && previousValue !== null
      ? `${isFlat ? 'Estável' : isDown ? 'Queda' : 'Alta'} de ${formatPercent(Math.abs(delta), 1)} contra ${formatMonthLong(previous.month)}.`
      : 'Sem mês anterior medido para comparar.',
    first ? `Série de ${String(series.length)} meses desde ${formatMonthShort(first.month)}, com um mês sem coleta no meio.` : '',
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
        <p className="shrink-0 text-xs text-text-muted tabular-nums">{formatInt(series.length)} meses</p>
      </div>

      {currentValue === null ? (
        <p className="mt-2 flex items-center gap-2 text-text-muted">
          <Unplug aria-hidden className="size-5 shrink-0" />
          <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
        </p>
      ) : (
        <p className="kpi-number mt-2 text-3xl leading-none font-semibold text-text-primary">{formatCurrencyCompact(currentValue)}</p>
      )}

      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
        {delta !== null && previous && previousValue !== null ? (
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
              contra <span className="kpi-number text-text-secondary">{formatCurrencyCompact(previousValue)}</span> em{' '}
              {formatMonthShort(previous.month)}
            </span>
          </>
        ) : (
          <span>sem mês anterior medido para comparar</span>
        )}
      </p>

      <div aria-hidden className="mt-4 min-h-8 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={series} margin={MARGIN}>
            <Line
              connectNulls={false}
              dataKey="value"
              dot={({ cx, cy, index }: DotItemDotProps) =>
                index === lastIndex && cx !== undefined && cy !== undefined ? (
                  <circle cx={cx} cy={cy} fill="var(--chart-1)" key="end-dot" r={3.5} stroke="var(--surface-raised)" strokeWidth={1.5} />
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
      {first && current ? (
        <div className="mt-2 flex justify-between text-[0.6875rem] leading-none text-text-muted tabular-nums">
          <span>{formatMonthShort(first.month)}</span>
          <span>{formatMonthShort(current.month)}</span>
        </div>
      ) : null}
    </article>
  );
}
