import { Filter } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatDecimal, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { currentMonth as defaultCurrentMonth, data as defaultData, previousMonth as defaultPreviousMonth, type PlatformRing } from './data';

/**
 * Uma categoria nova entra só no anel externo. O anel interno fecha 100% com quem já existia no
 * mês anterior, sem a categoria nova; a legenda escreve "sem dado" no lugar de um 0% que a
 * plataforma nunca teve, e a variação dela sai como "sem base de comparação", nunca um p.p. calculado.
 */
export interface TwoPeriodDonutNewCategoryProps {
  readonly data?: readonly PlatformRing[];
  readonly previousMonth?: string;
  readonly currentMonth?: string;
  readonly height?: number;
  readonly className?: string;
}

const START_ANGLE = 90;
const END_ANGLE = -270;
const INNER_RADIUS_PREVIOUS = '30%';
const OUTER_RADIUS_PREVIOUS = '48%';
const INNER_RADIUS_CURRENT = '56%';
const OUTER_RADIUS_CURRENT = '80%';
const RING_STROKE = 'var(--surface-raised)';
const PREVIOUS_OPACITY = 0.45;

function colorOf(slot: number): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

function toIntegerPercents(values: readonly number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map(Math.floor);
  let missing = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest);
  const result = [...floors];
  for (const { index } of order) {
    if (missing <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    missing -= 1;
  }
  return result;
}

function pointsLabel(points: number): string {
  const sign = points > 0 ? '+' : points < 0 ? '−' : '';
  return `${sign}${formatDecimal(Math.abs(points), 1)} p.p.`;
}

export default function TwoPeriodDonutNewCategory({
  data = defaultData,
  previousMonth = defaultPreviousMonth,
  currentMonth = defaultCurrentMonth,
  height,
  className,
}: TwoPeriodDonutNewCategoryProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [...data].sort((a, b) => b.current - a.current);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte: não há investimento para comparar.</span>
      </div>
    );
  }

  const currentTotal = rows.reduce((sum, row) => sum + row.current, 0);
  const currentPercents = toIntegerPercents(rows.map((row) => row.current));
  const previousRowsWithValue = rows.flatMap((row) => (row.previous === null ? [] : [{ ...row, previous: row.previous }]));
  const previousTotal = previousRowsWithValue.reduce((sum, row) => sum + row.previous, 0);
  const previousPercents = toIntegerPercents(previousRowsWithValue.map((row) => row.previous));

  const newcomer = rows.find((row) => row.previous === null);
  const existing = rows.filter((row) => row.previous !== null);
  const rawDeltas = new Map(
    existing.map((row) => {
      const previousShare = ((row.previous ?? 0) / previousTotal) * 100;
      const currentShare = (row.current / currentTotal) * 100;
      return [row.id, currentShare - previousShare] as const;
    }),
  );
  const worstId = existing.reduce(
    (worst, row) => ((rawDeltas.get(row.id) ?? 0) < (rawDeltas.get(worst) ?? Infinity) ? row.id : worst),
    existing[0]?.id ?? '',
  );
  const worst = existing.find((row) => row.id === worstId);

  const summary = `Gráfico de dois anéis concêntricos com o investimento por plataforma. ${newcomer ? `${newcomer.name} entrou em ${formatMonthShort(currentMonth)}, sem dado em ${formatMonthShort(previousMonth)}.` : ''} ${worst ? `${worst.name} foi quem mais perdeu participação.` : ''}`;

  return (
    <figure aria-label={summary} className={cn('@container m-0 h-full w-full min-w-0', className)} role="figure" style={style}>
      <div className="flex h-full min-h-0 flex-col gap-4 @sm:flex-row @sm:items-center @sm:gap-7">
        <div aria-hidden className="relative aspect-square h-full max-h-full w-full max-w-56 shrink-0 @sm:h-full @sm:w-auto @sm:max-w-none">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                cx="50%"
                cy="50%"
                data={previousRowsWithValue.map((row) => ({ name: row.name, value: row.previous }))}
                dataKey="value"
                endAngle={END_ANGLE}
                innerRadius={INNER_RADIUS_PREVIOUS}
                isAnimationActive={animate}
                nameKey="name"
                outerRadius={OUTER_RADIUS_PREVIOUS}
                startAngle={START_ANGLE}
                stroke={RING_STROKE}
                strokeWidth={2}
              >
                {previousRowsWithValue.map((row) => (
                  <Cell fill={colorOf(row.slot)} fillOpacity={PREVIOUS_OPACITY} key={row.id} />
                ))}
              </Pie>
              <Pie
                cx="50%"
                cy="50%"
                data={rows.map((row) => ({ name: row.name, value: row.current }))}
                dataKey="value"
                endAngle={END_ANGLE}
                innerRadius={INNER_RADIUS_CURRENT}
                isAnimationActive={animate}
                nameKey="name"
                outerRadius={OUTER_RADIUS_CURRENT}
                startAngle={START_ANGLE}
                stroke={RING_STROKE}
                strokeWidth={2}
              >
                {rows.map((row) => (
                  <Cell fill={colorOf(row.slot)} key={row.id} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="kpi-number text-sm leading-none font-semibold text-text-primary">{formatCurrencyCompact(currentTotal)}</span>
            <span className="text-[11px] text-text-muted">no mês atual</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p aria-hidden className="text-[11px] text-text-muted">
            Anel interno: {formatMonthShort(previousMonth)} · anel externo: {formatMonthShort(currentMonth)}
          </p>
          <p aria-hidden className="mb-2 text-[11px] text-text-muted">
            O interno fecha <span className="tabular-nums">100%</span> só com quem já existia; a categoria nova aparece só por fora
          </p>
          <ul className="space-y-2.5">
            {rows.map((row) => {
              const previousIndex = previousRowsWithValue.findIndex((entry) => entry.id === row.id);
              const currentIndex = rows.findIndex((entry) => entry.id === row.id);
              const delta = rawDeltas.get(row.id);
              return (
                <li className="flex min-w-0 items-center gap-2.5 leading-5" key={row.id}>
                  <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: colorOf(row.slot) }} />
                  <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">{row.name}</span>
                  <span className="kpi-number w-16 shrink-0 text-right text-xs whitespace-nowrap text-text-muted">
                    {previousIndex === -1 ? 'sem dado' : formatPercent((previousPercents[previousIndex] ?? 0) / 100, 0)}
                  </span>
                  <span className="kpi-number w-9 shrink-0 text-right text-sm font-semibold text-text-primary">
                    {formatPercent((currentPercents[currentIndex] ?? 0) / 100, 0)}
                  </span>
                  <span className="kpi-number w-14 shrink-0 text-right text-xs whitespace-nowrap text-text-muted">
                    {delta === undefined ? 'sem base' : pointsLabel(delta)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </figure>
  );
}
