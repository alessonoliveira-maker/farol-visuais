import { Filter } from 'lucide-react';
import { Line, LineChart, ReferenceArea, ResponsiveContainer, YAxis, type DotItemDotProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatHours, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ResponseSlaTrend } from './data';

/**
 * Cartão de KPI: a mediana do tempo de primeira resposta e a sparkline dos últimos dias úteis, com
 * a faixa do SLA contratado em tom rebaixado atrás do traço. Só os dias que saem da faixa levam
 * ponto, em --negative, e a contagem deles vem escrita no rodapé.
 */
export interface ResponseSlaCardProps {
  readonly data?: ResponseSlaTrend;
  readonly className?: string;
}

const MARGIN = { top: 4, right: 4, bottom: 4, left: 4 } as const;
/** Folga acima do maior valor, como fração dele, para o traço não encostar na borda. */
const DOMAIN_PAD = 0.08;
const MIN_POINTS = 3;

/** Mediana de uma lista de horas; `null` para lista vazia (EST-1b). */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle];
  const lower = sorted[middle - 1];
  if (upper === undefined) return null;
  return sorted.length % 2 === 1 || lower === undefined ? upper : (lower + upper) / 2;
}

export default function ResponseSlaCard({ data = defaultData, className }: ResponseSlaCardProps) {
  const animate = useAnimateOnce();
  const series = [...data.series];
  const measured = series.flatMap((point) => (point.hours === null ? [] : [point.hours]));

  if (measured.length < MIN_POINTS) {
    return (
      <div
        className={cn(
          'flex h-full w-full min-w-0 items-center gap-2 rounded-lg border border-line-subtle bg-surface-raised p-4 text-xs text-text-muted',
          className,
        )}
        role="status"
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Série curta demais: sem dias medidos suficientes para comparar a primeira resposta com o SLA.</span>
      </div>
    );
  }

  const limit = data.slaLimitHours;
  const outsideCount = measured.filter((hours) => hours > limit).length;
  const mid = median(measured);
  const midText = mid === null ? null : formatHours(Math.round(mid * 10) / 10);
  const highest = Math.max(...measured, limit);
  const first = series[0];
  const last = series[series.length - 1];
  const countText = `${formatInt(outsideCount)} de ${formatInt(measured.length)} dias fora do SLA`;

  const summary = [
    `Cartão de KPI com o tempo da primeira resposta nos últimos ${String(series.length)} dias úteis, contra o SLA contratado de até ${formatHours(limit)}.`,
    midText !== null ? `A mediana foi de ${midText}.` : '',
    `${countText}.`,
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
      <p className="kpi-number mt-2 text-3xl leading-none font-semibold text-text-primary">{midText ?? ''}</p>
      <p className="mt-2 min-w-0 truncate text-xs text-text-muted">
        mediana de {formatInt(measured.length)} dias úteis, SLA contratado até{' '}
        <span className="kpi-number text-text-secondary">{formatHours(limit)}</span>
      </p>

      <div aria-hidden className="mt-3 min-h-8 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={series} margin={MARGIN}>
            <YAxis domain={[0, highest * (1 + DOMAIN_PAD)]} hide />
            {/* Declarada antes do Line: a ordem do documento é a ordem de pintura, e a faixa fica atrás do traço. */}
            <ReferenceArea fill="var(--surface-sunken)" fillOpacity={1} ifOverflow="extendDomain" y1={0} y2={limit} />
            <Line
              connectNulls={false}
              dataKey="hours"
              dot={({ cx, cy, index }: DotItemDotProps) => {
                const hours = series[index]?.hours;
                if (cx === undefined || cy === undefined || hours === null || hours === undefined || hours <= limit) return null;
                return (
                  <circle cx={cx} cy={cy} fill="var(--negative)" key={`out-${String(index)}`} r={3.5} stroke="var(--surface-raised)" strokeWidth={1.5} />
                );
              }}
              isAnimationActive={animate}
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2 text-[0.6875rem] leading-none text-text-muted tabular-nums">
        <span className="shrink-0 font-semibold text-negative">{countText}</span>
        <span className="min-w-0 truncate">{first && last ? `${formatDate(first.date)} a ${formatDate(last.date)}` : ''}</span>
      </div>
    </article>
  );
}
