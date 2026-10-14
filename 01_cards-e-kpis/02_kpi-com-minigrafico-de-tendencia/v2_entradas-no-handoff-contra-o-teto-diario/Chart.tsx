import { Filter } from 'lucide-react';
import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type HandoffTrend } from './data';

/**
 * Cartão de KPI: quantos dos últimos dias úteis passaram do teto diário da fila de handoff.
 * Sparkbar em Recharts com domínio a partir do zero e uma ReferenceLine tracejada no teto; as
 * colunas que estouram o teto acendem em --negative, as demais ficam em --chart-1.
 */
export interface HandoffCapCardProps {
  readonly data?: HandoffTrend;
  readonly className?: string;
}

const MARGIN = { top: 10, right: 4, bottom: 0, left: 4 } as const;
const MAX_BAR_SIZE = 10;

export default function HandoffCapCard({ data = defaultData, className }: HandoffCapCardProps) {
  const animate = useAnimateOnce();
  const days = data.days;
  const first = days.at(0);
  const last = days.at(-1);
  const overCount = days.filter((day) => day.count > data.threshold).length;
  const peak = days.reduce<(typeof days)[number] | null>(
    (max, day) => (max === null || day.count > max.count ? day : max),
    null,
  );

  if (days.length === 0) {
    return (
      <div
        className={cn(
          'flex h-full w-full min-w-0 items-center gap-2 rounded-lg border border-line-subtle bg-surface-raised p-4 text-xs text-text-muted',
          className,
        )}
        role="status"
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum dia útil neste recorte: sem entradas medidas na fila de handoff.</span>
      </div>
    );
  }

  const summary = [
    `Gráfico de colunas com as entradas diárias no handoff nos últimos ${String(days.length)} dias úteis, contra o teto de ${formatInt(data.threshold)}.`,
    `${formatRateWithVolume(overCount, days.length)} dias passaram do teto.`,
    peak ? `O maior pico foi em ${formatDate(peak.date)}, com ${formatInt(peak.count)} entradas.` : '',
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
        {formatRateWithVolume(overCount, days.length)}
      </p>
      <p className="mt-2 text-xs text-text-muted">
        teto diário de <span className="kpi-number text-text-secondary">{formatInt(data.threshold)}</span> entradas
      </p>

      <div aria-hidden className="mt-4 min-h-8 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="32%" data={[...days]} margin={MARGIN}>
            <YAxis domain={[0, 'dataMax']} hide />
            <Bar dataKey="count" isAnimationActive={animate} maxBarSize={MAX_BAR_SIZE} radius={[1, 1, 0, 0]}>
              {days.map((day) => (
                <Cell fill={day.count > data.threshold ? 'var(--negative)' : 'var(--chart-1)'} key={day.date} />
              ))}
            </Bar>
            <ReferenceLine
              ifOverflow="extendDomain"
              stroke="var(--line-strong)"
              strokeDasharray="3 3"
              strokeWidth={1}
              y={data.threshold}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {first && last ? (
        <div className="mt-2 flex items-baseline justify-between text-[0.6875rem] leading-none text-text-muted">
          <span className="tabular-nums">
            {formatDate(first.date)} a {formatDate(last.date)}
          </span>
          <span>só dias úteis</span>
        </div>
      ) : null}
    </article>
  );
}
