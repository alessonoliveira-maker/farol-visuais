import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { annualTarget as defaultAnnualTarget, data as defaultData, type MonthlyRevenue } from './data';

/**
 * Burn-up: a receita reconhecida acumulada mês a mês, somada em TypeScript a partir do mensal,
 * contra a trajetória linear da meta anual. Meses futuros ficam em `null` (a soma para ali, não
 * repete o último valor) e uma `ReferenceLine` marca o valor total da meta no topo do domínio.
 */
export interface AccumulatedVsAnnualTargetProps {
  readonly data?: readonly MonthlyRevenue[];
  readonly annualTarget?: number;
  readonly height?: number;
  readonly className?: string;
}

/** A meta é sempre anual: doze meses, mesmo quando o recorte mostra menos. */
const MONTHS_IN_YEAR = 12;
const MARGIN = { top: 22, right: 20, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 64;
const DOMAIN: readonly [number, number] = [0, 10_500_000];
const TICKS = [0, 2_500_000, 5_000_000, 7_500_000, 10_000_000] as const;
const VALUE_LABEL_GAP = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface TargetLabelProps {
  readonly viewBox?: { readonly x?: number; readonly width?: number };
}

export default function AccumulatedVsAnnualTarget({
  data = defaultData,
  annualTarget = defaultAnnualTarget,
  height,
  className,
}: AccumulatedVsAnnualTargetProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita reconhecida para acumular.</span>
      </div>
    );
  }

  let running = 0;
  let stopped = false;
  const rows = data.map((row, index) => {
    if (!stopped && row.revenueRecognized !== null) {
      running += row.revenueRecognized;
    } else {
      stopped = true;
    }
    return {
      month: row.month,
      cumulativeActual: stopped ? null : running,
      cumulativeTarget: (annualTarget * (index + 1)) / MONTHS_IN_YEAR,
    };
  });

  let lastActualIndex = -1;
  rows.forEach((row, index) => {
    if (row.cumulativeActual !== null) lastActualIndex = index;
  });
  const first = rows[0]!;
  const last = lastActualIndex >= 0 ? rows[lastActualIndex] : undefined;
  const gap = last ? last.cumulativeActual! - last.cumulativeTarget : 0;
  const behind = gap < 0;

  const summary = last
    ? `Gráfico de linha com a receita reconhecida acumulada de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)} de 2026, contra a trajetória linear da meta anual de ${formatCurrencyCompact(annualTarget)}. O acumulado soma ${formatCurrencyCompact(last.cumulativeActual ?? 0)}, ${formatCurrencyCompact(Math.abs(gap))} ${behind ? 'abaixo' : 'acima'} da trajetória até este mês.`
    : `Gráfico de linha com a trajetória linear da meta anual de ${formatCurrencyCompact(annualTarget)}: nenhum mês fechado ainda para acumular.`;

  const renderDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (index !== lastActualIndex || cx === undefined || cy === undefined) return null;
    const row = rows[index];
    if (!row || row.cumulativeActual === null) return null;
    return (
      <g key="actual-end">
        <circle cx={cx} cy={cy} fill="var(--chart-1)" r={3} />
        <text
          className="font-display"
          dominantBaseline="central"
          fill="var(--text-primary)"
          fontSize={12}
          fontWeight={700}
          style={HALO}
          x={Number(cx) + VALUE_LABEL_GAP}
          y={Number(cy)}
        >
          {formatCurrencyCompact(row.cumulativeActual)}
        </text>
      </g>
    );
  };

  const renderTargetLabel = ({ viewBox }: TargetLabelProps): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0)} y={MARGIN.top - 10}>
      meta anual <tspan className="font-display">{formatCurrencyCompact(annualTarget)}</tspan>
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {last ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
          Acumulado de {formatMonthShort(first.month)} a {formatMonthShort(last.month)}:{' '}
          <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(last.cumulativeActual ?? 0)}</span>,{' '}
          <span className={behind ? 'kpi-number font-medium text-negative' : 'kpi-number font-medium text-positive'}>
            {formatCurrencyCompact(Math.abs(gap))} {behind ? 'abaixo' : 'acima'}
          </span>{' '}
          da trajetória da meta anual
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={DOMAIN} tickFormatter={formatCurrencyAxis} ticks={[...TICKS]} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip labelFormat="month" valueFormat="currencyCompact" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <Line dataKey="cumulativeTarget" dot={false} isAnimationActive={false} name="Meta acumulada" stroke="var(--line-strong)" strokeDasharray="4 4" strokeWidth={1.5} type="linear" />
            <Line
              activeDot={{ r: 4 }}
              connectNulls={false}
              dataKey="cumulativeActual"
              dot={renderDot}
              isAnimationActive={animate}
              name="Realizado acumulado"
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="linear"
            />
            <ReferenceLine ifOverflow="extendDomain" label={renderTargetLabel} stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1} y={annualTarget} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
