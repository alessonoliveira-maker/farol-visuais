import { ArrowDownRight, ArrowRight, ArrowUpRight, Filter } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, YAxis, type DotItemDotProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatMonthLong, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type RevenueTrend } from './data';

/**
 * Cartão de KPI: a receita reconhecida do mês e a sparkline dos últimos 12 meses, sem eixo,
 * grade, legenda nem dica. O ponto final acende em --chart-1; o melhor e o pior mês levam um
 * ponto neutro. O número fica em HTML irmão do gráfico, fora do SVG.
 */
export interface RevenueSparklineCardProps {
  readonly data?: RevenueTrend;
  readonly className?: string;
}

/** Margem lateral de 6 px: o ponto final (raio 3,5 mais contorno 1,5) não pode sair do SVG (ESP-3). */
const MARGIN = { top: 4, right: 6, bottom: 4, left: 6 } as const;
/** Folga do domínio acima do máximo e abaixo do mínimo, como fração da amplitude da série. */
const DOMAIN_PAD = 0.08;
/** Série com menos pontos que isto não vira linha (EIX-11). */
const MIN_POINTS = 3;
/** Variação abaixo disto (0,05%) é lida como estável. */
const FLAT_THRESHOLD = 0.0005;
/** A partir de 10% de variação, a casa decimal não muda a decisão. */
const WHOLE_PERCENT_FROM = 0.1;

/** Percentual sem sinal, com a mesma regra de casas no corpo e na frase acessível (DAD-5). */
function plainPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  return formatPercent(absolute, absolute >= WHOLE_PERCENT_FROM ? 0 : 1);
}

function signedPercent(fraction: number): string {
  // Sinal de menos tipográfico (U+2212), não hífen.
  return `${fraction > 0 ? '+' : '−'}${plainPercent(fraction)}`;
}

export default function RevenueSparklineCard({ data = defaultData, className }: RevenueSparklineCardProps) {
  const animate = useAnimateOnce();
  const series = [...data.series];

  if (series.length < MIN_POINTS) {
    return (
      <div
        className={cn(
          'flex h-full w-full min-w-0 items-center gap-2 rounded-lg border border-line-subtle bg-surface-raised p-4 text-xs text-text-muted',
          className,
        )}
        role="status"
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Série curta demais: sem meses suficientes para desenhar a tendência da receita.</span>
      </div>
    );
  }

  const first = series[0];
  const current = series[series.length - 1];
  const lastIndex = series.length - 1;
  const values = series.map((point) => point.value);
  const seed = values[0] ?? 0;
  const highest = values.reduce((top, value) => Math.max(top, value), seed);
  const lowest = values.reduce((bottom, value) => Math.min(bottom, value), seed);
  const highestIndex = values.indexOf(highest);
  const lowestIndex = values.indexOf(lowest);
  const best = series[highestIndex];
  const pad = (highest - lowest) * DOMAIN_PAD;

  const delta = first && first.value !== 0 && current ? (current.value - first.value) / first.value : null;
  const isFlat = delta !== null && Math.abs(delta) < FLAT_THRESHOLD;
  const isDown = delta !== null && delta < 0;
  const DeltaIcon = isFlat ? ArrowRight : isDown ? ArrowDownRight : ArrowUpRight;
  const gapToBest = best && best.value !== 0 && current ? (current.value - best.value) / best.value : null;

  const summary = [
    first && current
      ? `Cartão de KPI com a receita reconhecida dos últimos ${String(series.length)} meses. Em ${formatMonthLong(current.month)} fechou em ${formatCurrencyCompact(current.value)}.`
      : '',
    delta !== null && first
      ? `${isFlat ? 'Estável' : isDown ? 'Queda' : 'Alta'} de ${plainPercent(delta)} contra ${formatMonthShort(first.month)}.`
      : '',
    best && gapToBest !== null
      ? gapToBest === 0
        ? `O mês atual é o melhor da série.`
        : `O melhor mês foi ${formatMonthShort(best.month)}, com ${formatCurrencyCompact(best.value)}, e o mês atual está ${plainPercent(gapToBest)} abaixo.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{data.label}</p>
      <p className="kpi-number mt-2 text-3xl leading-none font-semibold text-text-primary">
        {current ? formatCurrencyCompact(current.value) : ''}
      </p>
      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
        {delta !== null && first ? (
          <>
            <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-text-secondary">
              <DeltaIcon aria-hidden className="size-3.5" strokeWidth={2.5} />
              <span className="kpi-number">{isFlat ? 'estável' : signedPercent(delta)}</span>
            </span>
            <span className="min-w-0 truncate">
              contra <span className="kpi-number text-text-secondary">{formatCurrencyCompact(first.value)}</span> em{' '}
              {formatMonthShort(first.month)}
            </span>
          </>
        ) : (
          <span>sem mês de partida medido para comparar</span>
        )}
      </p>

      <div aria-hidden className="mt-3 min-h-8 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={series} margin={MARGIN}>
            {/* Eixo escondido só para fixar o domínio: do mínimo ao máximo com folga, sem o traço encostar na borda. */}
            <YAxis domain={[lowest - pad, highest + pad]} hide />
            <Line
              dataKey="value"
              dot={({ cx, cy, index }: DotItemDotProps) => {
                if (cx === undefined || cy === undefined) return null;
                if (index === lastIndex) {
                  return <circle cx={cx} cy={cy} fill="var(--chart-1)" key="end-dot" r={3.5} stroke="var(--surface-raised)" strokeWidth={1.5} />;
                }
                // O ponto final vence quando coincide com um extremo: este ramo só roda nos demais índices.
                if (index === highestIndex || index === lowestIndex) {
                  return <circle cx={cx} cy={cy} fill="var(--text-muted)" key={`extreme-${String(index)}`} r={2.5} stroke="var(--surface-raised)" strokeWidth={1} />;
                }
                return null;
              }}
              isAnimationActive={animate}
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {best && gapToBest !== null ? (
        <div className="mt-2 flex items-baseline justify-between gap-2 text-[0.6875rem] leading-none text-text-muted tabular-nums">
          <span className="min-w-0 truncate">
            melhor mês {formatMonthShort(best.month)}, {formatCurrencyCompact(best.value)}
          </span>
          <span className="shrink-0">{gapToBest === 0 ? 'hoje no pico' : `hoje ${signedPercent(gapToBest)}`}</span>
        </div>
      ) : null}
    </article>
  );
}
