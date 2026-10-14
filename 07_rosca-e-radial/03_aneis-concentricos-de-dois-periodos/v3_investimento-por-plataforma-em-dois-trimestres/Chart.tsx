import { Filter } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatDecimal, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  currentQuarterLabel as defaultCurrentQuarterLabel,
  data as defaultData,
  previousQuarterLabel as defaultPreviousQuarterLabel,
  type PlatformRing,
} from './data';

/**
 * Anéis concêntricos densos: quatro plataformas, total de cada trimestre na legenda e a
 * participação nos dois trimestres lado a lado com a diferença em pontos percentuais em toda
 * linha, não só na de maior variação (diferente da v2, que destaca uma categoria só).
 */
export interface TwoPeriodDonutQuarterProps {
  readonly data?: readonly PlatformRing[];
  readonly previousQuarterLabel?: string;
  readonly currentQuarterLabel?: string;
  readonly height?: number;
  readonly className?: string;
}

const START_ANGLE = 90;
const END_ANGLE = -270;
/** Miolo alargado (ACE-3): o hole em 30% deixava pouca margem para o rótulo central sem cruzar o
 * anel interno; em 38% o texto cabe com folga nos dois temas. */
const INNER_RADIUS_PREVIOUS = '38%';
const OUTER_RADIUS_PREVIOUS = '54%';
const INNER_RADIUS_CURRENT = '62%';
const OUTER_RADIUS_CURRENT = '82%';
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

export default function TwoPeriodDonutQuarter({
  data = defaultData,
  previousQuarterLabel = defaultPreviousQuarterLabel,
  currentQuarterLabel = defaultCurrentQuarterLabel,
  height,
  className,
}: TwoPeriodDonutQuarterProps) {
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
  const previousTotal = rows.reduce((sum, row) => sum + row.previous, 0);
  const currentPercents = toIntegerPercents(rows.map((row) => row.current));
  const previousPercents = toIntegerPercents(rows.map((row) => row.previous));
  const rawDeltas = rows.map((row) => (row.current / currentTotal) * 100 - (row.previous / previousTotal) * 100);
  const totalVariation = (currentTotal - previousTotal) / previousTotal;

  const gainIndex = rawDeltas.reduce((best, value, index) => (value > (rawDeltas[best] ?? -Infinity) ? index : best), 0);
  const lossIndex = rawDeltas.reduce((worst, value, index) => (value < (rawDeltas[worst] ?? Infinity) ? index : worst), 0);
  const gainer = rows[gainIndex];
  const loser = rows[lossIndex];

  const summary = `Gráfico de dois anéis concêntricos com o investimento por plataforma em dois trimestres. Total de ${formatCurrencyCompact(currentTotal)}, ${totalVariation >= 0 ? '+' : '−'}${formatPercent(Math.abs(totalVariation), 0)} contra ${formatCurrencyCompact(previousTotal)}. ${gainer ? `${gainer.name} ganhou mais participação` : ''}${loser ? `; ${loser.name} perdeu mais` : ''}.`;

  return (
    <figure aria-label={summary} className={cn('@container m-0 h-full w-full min-w-0', className)} role="figure" style={style}>
      <div className="flex h-full min-h-0 flex-col gap-4 @sm:flex-row @sm:items-center @sm:gap-7">
        <div aria-hidden className="relative aspect-square h-full max-h-full w-full max-w-56 shrink-0 @sm:h-full @sm:w-auto @sm:max-w-none">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                cx="50%"
                cy="50%"
                data={rows.map((row) => ({ name: row.name, value: row.previous }))}
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
                {rows.map((row) => (
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
            <span className="text-[11px] text-text-muted">no trimestre</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p aria-hidden className="mb-2 text-[11px] text-text-muted">
            {previousQuarterLabel}: {formatCurrencyCompact(previousTotal)} · {currentQuarterLabel}: {formatCurrencyCompact(currentTotal)}
          </p>
          <ul className="space-y-2.5">
            {rows.map((row, index) => (
              <li className="flex min-w-0 items-center gap-2.5 leading-5" key={row.id}>
                <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: colorOf(row.slot) }} />
                <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">{row.name}</span>
                <span className="kpi-number w-9 shrink-0 text-right text-xs text-text-muted">
                  {formatPercent((previousPercents[index] ?? 0) / 100, 0)}
                </span>
                <span className="kpi-number w-9 shrink-0 text-right text-sm font-semibold text-text-primary">
                  {formatPercent((currentPercents[index] ?? 0) / 100, 0)}
                </span>
                <span className="kpi-number w-14 shrink-0 text-right text-xs text-text-secondary">{pointsLabel(rawDeltas[index] ?? 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </figure>
  );
}
