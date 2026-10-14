import { Filter } from 'lucide-react';
import { Bar, BarChart, Cell, ReferenceDot, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type BookingsTrend } from './data';

/**
 * Cartão de KPI: as agendas marcadas na semana atual e o sparkbar das últimas semanas, uma coluna
 * por semana, com base no zero e sem eixo. A semana atual acende em --chart-1; as demais ficam
 * em tom neutro. Recharts nativo, domínio de 0 ao máximo e animação só na entrada.
 */
export interface WeeklyBookingsSparkbarProps {
  readonly data?: BookingsTrend;
  readonly className?: string;
}

const MARGIN = { top: 6, right: 2, bottom: 2, left: 2 } as const;
const BAR_CATEGORY_GAP = '30%';
/**
 * Piso do sparkbar: 3 px por coluna mais 1 px de vão (cerca de 25 colunas em 100 px).
 * Conta do corpo stage de 328 px: (328 − 32 de padding − 4 de margem) / 16 semanas = 18,25 px de passo;
 * espessura = 18,25 × (1 − 2 × 0,30) = 7,3 px, bem acima do piso. Teto de 12 px para o cartão largo do Farol.
 */
const BAR_MAX = 12;
const DOT_RADIUS = 3.5;
/** Opacidade mínima de --text-muted para a marca composta ficar em 3:1 (ACE-5). */
const NEUTRAL_OPACITY = 0.72;

function sumOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : values.reduce((acc, value) => acc + value, 0);
}

function meanOf(values: readonly number[]): number | null {
  const total = sumOf(values);
  return total === null ? null : total / values.length;
}

export default function WeeklyBookingsSparkbar({ data = defaultData, className }: WeeklyBookingsSparkbarProps) {
  const animate = useAnimateOnce();
  const weeks = [...data.weeks];
  const first = weeks.at(0);
  const current = weeks.at(-1);

  if (!first || !current) {
    return (
      <div
        className={cn(
          'flex h-full w-full min-w-0 items-center gap-2 rounded-lg border border-line-subtle bg-surface-raised p-4 text-xs text-text-muted',
          className,
        )}
        role="status"
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não houve agenda marcada no período.</span>
      </div>
    );
  }

  const values = weeks.map((week) => week.bookings);
  const total = sumOf(values);
  const mean = meanOf(values);
  const highest = Math.max(...values);
  const lastIndex = weeks.length - 1;
  const rank = values.filter((value) => value > current.bookings).length + 1;
  const count = formatInt(weeks.length);

  const summary =
    total !== null && mean !== null
      ? `Gráfico de colunas com as agendas marcadas em ${count} semanas, ${formatInt(total)} no total e média de ${formatDecimal(mean, 1)} por semana. A semana atual, de ${formatDate(current.weekStart)}, teve ${formatInt(current.bookings)} agendas, ${String(rank)}º de ${count}.`
      : '';

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-xs text-text-muted tabular-nums">{count} semanas</p>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3">
        <p className="flex items-baseline gap-1.5">
          <span className="kpi-number text-3xl leading-none font-semibold text-text-primary">{formatInt(current.bookings)}</span>
          <span className="text-xs text-text-secondary">agendas</span>
        </p>
        <p className="shrink-0 text-xs font-semibold text-text-secondary tabular-nums">
          {String(rank)}º de {count}
        </p>
      </div>

      <div aria-hidden className="mt-3 min-h-8 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={weeks} margin={MARGIN}>
            {/* Eixos escondidos só para fixar o domínio: a base no zero (EIX-1) e o teto no maior valor. */}
            <XAxis dataKey="weekStart" hide />
            <YAxis domain={[0, highest]} hide />
            {/* ifOverflow estendido: sem ele o ponto some se o domínio for recortado (REC-1). */}
            <ReferenceDot
              fill="var(--chart-1)"
              ifOverflow="extendDomain"
              r={DOT_RADIUS}
              stroke="var(--surface-raised)"
              strokeWidth={1.5}
              x={current.weekStart}
              y={current.bookings}
            />
            <Bar dataKey="bookings" isAnimationActive={animate} maxBarSize={BAR_MAX}>
              {weeks.map((week, index) => (
                <Cell
                  fill={index === lastIndex ? 'var(--chart-1)' : 'var(--text-muted)'}
                  fillOpacity={index === lastIndex ? 1 : NEUTRAL_OPACITY}
                  key={week.weekStart}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {mean !== null ? (
        <div className="mt-2 flex items-baseline justify-between gap-2 text-[0.6875rem] leading-none text-text-muted tabular-nums">
          <span className="min-w-0 truncate">média de {formatDecimal(mean, 1)} por semana</span>
          <span className="shrink-0">desde {formatDate(first.weekStart)}</span>
        </div>
      ) : null}
    </article>
  );
}
