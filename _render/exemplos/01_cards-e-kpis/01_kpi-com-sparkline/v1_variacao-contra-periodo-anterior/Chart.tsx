import { ArrowDownRight, ArrowRight, ArrowUpRight, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatMonthLong, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type KpiTrend, type MonthlyPoint } from './data';

/**
 * Cartão de KPI: o número do período, a variação contra o período anterior com sinal, ícone e
 * cor pelo sentido do "bom", e a sparkline dos meses logo abaixo, com o ponto de comparação vazado
 * e o ponto atual cheio. HTML com Tailwind; a sparkline é SVG com geometria calculada aqui.
 */
export interface KpiTrendCardProps {
  readonly data?: KpiTrend;
  readonly className?: string;
}

/** Caixa de desenho da sparkline; o SVG estica na largura e o traço não engorda. */
const SPARK_WIDTH = 240;
const SPARK_HEIGHT = 48;
const SPARK_PAD = 5;
/** Variação abaixo disto (0,05%) é lida como estável: nem verde nem vermelho. */
const FLAT_THRESHOLD = 0.0005;
/** A partir de 10% de variação, a casa decimal não muda a decisão. */
const WHOLE_PERCENT_FROM = 0.1;

interface SparkPoint {
  readonly x: number;
  readonly y: number;
}

interface SparkGeometry {
  /** Um caminho por trecho contínuo: mês sem medição quebra a linha. */
  readonly segments: readonly string[];
  readonly points: readonly (SparkPoint | null)[];
}

function sparkGeometry(series: readonly MonthlyPoint[]): SparkGeometry | null {
  const values = series.flatMap((point) => (point.value === null ? [] : [point.value]));
  if (series.length < 2 || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = SPARK_WIDTH / (series.length - 1);
  const points = series.map((point, index) =>
    point.value === null ? null : { x: index * step, y: SPARK_PAD + (1 - (point.value - min) / span) * (SPARK_HEIGHT - SPARK_PAD * 2) },
  );
  const segments: string[] = [];
  let current = '';
  for (const point of points) {
    if (point === null) {
      if (current) segments.push(current);
      current = '';
      continue;
    }
    current += `${current ? 'L' : 'M'}${point.x.toFixed(2)} ${point.y.toFixed(2)} `;
  }
  if (current) segments.push(current);
  return { segments, points };
}

function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  const digits = absolute >= WHOLE_PERCENT_FROM ? 0 : 1;
  // Sinal de menos tipográfico (U+2212), não hífen: alinha com o mais no algarismo tabular.
  return `${fraction > 0 ? '+' : '−'}${formatPercent(absolute, digits)}`;
}

function position(point: SparkPoint): { left: string; top: string } {
  return { left: `${String((point.x / SPARK_WIDTH) * 100)}%`, top: `${String((point.y / SPARK_HEIGHT) * 100)}%` };
}

export default function KpiTrendCard({ data = defaultData, className }: KpiTrendCardProps) {
  const first = data.series.at(0);
  const current = data.series.at(-1);
  const previous = data.series.at(-2);
  const currentValue = current?.value ?? null;
  const previousValue = previous?.value ?? null;

  const delta = currentValue !== null && previousValue !== null && previousValue !== 0 ? (currentValue - previousValue) / previousValue : null;
  const isFlat = delta !== null && Math.abs(delta) < FLAT_THRESHOLD;
  const isUp = delta !== null && delta > 0;
  const isGood = delta !== null && !isFlat && (data.goodDirection === 'up' ? isUp : !isUp);
  const DeltaIcon = isFlat ? ArrowRight : isUp ? ArrowUpRight : ArrowDownRight;
  const geometry = sparkGeometry(data.series);
  const lastPoint = geometry?.points.at(-1) ?? null;
  const previousPoint = geometry?.points.at(-2) ?? null;

  const summary = [
    currentValue !== null && current
      ? `${data.label} em ${formatMonthLong(current.month)}: ${formatCurrencyCompact(currentValue)}.`
      : `${data.label}: ${formatUnavailable()} no período atual.`,
    delta !== null && previous && previousValue !== null
      ? `${isFlat ? 'Estável' : isUp ? 'Alta' : 'Queda'} de ${formatPercent(Math.abs(delta), 1)} contra ${formatMonthLong(previous.month)}, que teve ${formatCurrencyCompact(previousValue)}.`
      : 'Sem período anterior medido para comparar.',
    `Tendência de ${String(data.series.length)} meses.`,
  ].join(' ');

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-xs text-text-muted">total do mês</p>
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

      {geometry ? (
        <div aria-hidden className="mt-4 flex min-h-0 flex-1 flex-col">
          <div className="relative min-h-8 w-full flex-1">
            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              preserveAspectRatio="none"
              viewBox={`0 0 ${String(SPARK_WIDTH)} ${String(SPARK_HEIGHT)}`}
            >
              {geometry.segments.map((segment) => (
                <path
                  d={segment}
                  fill="none"
                  key={segment}
                  stroke="var(--chart-1)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {previousPoint ? (
              <span
                className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-chart-1 bg-surface-raised"
                style={position(previousPoint)}
              />
            ) : null}
            {lastPoint ? (
              <span
                className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-1 ring-2 ring-surface-raised"
                style={position(lastPoint)}
              />
            ) : null}
          </div>
          {first && current ? (
            <div className="mt-2 flex justify-between text-[0.6875rem] leading-none text-text-muted tabular-nums">
              <span>{formatMonthShort(first.month)}</span>
              <span>{formatMonthShort(current.month)}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
