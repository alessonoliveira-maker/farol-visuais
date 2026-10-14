import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { annualTarget, data as defaultData, type MonthlyRevenue } from './data';

/**
 * Colunas com a receita reconhecida de cada mês, no eixo esquerdo, e linha com o acumulado do
 * ano, no eixo direito, com a meta anual como referência nesse mesmo eixo. As duas escalas não
 * têm relação natural entre si: o cruzamento entre a linha e o topo de uma coluna não significa
 * nada e não é anotado (ver README, Anatomia, item 3).
 */
export interface RevenueAndAccumulatedProps {
  readonly data?: readonly MonthlyRevenue[];
  readonly height?: number;
  readonly className?: string;
}

interface AccumulatedRow extends MonthlyRevenue {
  readonly accumulated: number | null;
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

const AXIS_MONTH = 'mes';
const AXIS_ACCUM = 'acumulado';
const TICK_COUNT = 5;
/** Meta mensal se o ano inteiro andasse no ritmo linear da meta anual. */
const LINEAR_PACE = annualTarget / 12;
const BAR_COLOR = 'var(--chart-1)';
const LINE_COLOR = 'var(--chart-3)';
const CURSOR = { fill: 'var(--line-subtle)' } as const;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;
const MARGIN = { top: 24, right: 16, bottom: 0, left: 0 } as const;
const AXIS_WIDTH = 56;
const MAX_BAR_SIZE = 26;
/** Espaço acima do maior tique para o título do eixo caber sem tocar a marca do topo. */
const HEADROOM = 1.16;

/** Tiques igualmente espaçados de 0 até `domainMax`, sem arredondamento: o topo é sempre um valor com significado (a meta anual, o dobro do ritmo linear), então dividir em partes iguais mantém esse valor exato no último tique. */
function evenTicks(domainMax: number, tickCount: number): readonly number[] {
  if (domainMax <= 0) return Array.from({ length: tickCount }, (_, index) => index);
  const step = domainMax / (tickCount - 1);
  return Array.from({ length: tickCount }, (_, index) => Math.round(step * index));
}

export default function RevenueAndAccumulated({ data = defaultData, height, className }: RevenueAndAccumulatedProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita nem acumulado para comparar com a meta.</span>
      </div>
    );
  }

  let running = 0;
  let lastClosedIndex = -1;
  const rows: AccumulatedRow[] = data.map((row, index) => {
    if (row.revenue === null) return { ...row, accumulated: null };
    running += row.revenue;
    lastClosedIndex = index;
    return { ...row, accumulated: running };
  });

  const lastClosed = lastClosedIndex >= 0 ? rows[lastClosedIndex] : undefined;
  const maxMonthly = rows.reduce((max, row) => Math.max(max, row.revenue ?? 0), 0);
  const leftDomainMax = Math.max(maxMonthly, LINEAR_PACE * 2);
  const leftTicks = evenTicks(leftDomainMax, TICK_COUNT);
  const accumulatedMax = lastClosed?.accumulated ?? 0;
  const rightDomainMax = Math.max(annualTarget, accumulatedMax);
  const rightTicks = evenTicks(rightDomainMax, TICK_COUNT);
  const pctOfTarget = lastClosed && lastClosed.accumulated !== null ? lastClosed.accumulated / annualTarget : 0;
  const xTicks = rows.filter((_, index) => index % 2 === 0).map((row) => row.month);

  const summary =
    lastClosed && lastClosed.accumulated !== null
      ? `Gráfico combinado com colunas da receita reconhecida mensal de 2026 e linha do acumulado do ano no eixo direito. Até ${formatMonthShort(lastClosed.month)} o acumulado chegou a ${formatCurrencyCompact(lastClosed.accumulated)}, ${formatPercent(pctOfTarget, 0)} da meta anual de ${formatCurrencyCompact(annualTarget)}.`
      : 'Gráfico combinado sem nenhum mês fechado neste recorte para comparar com a meta anual.';

  const reading =
    lastClosed && lastClosed.accumulated !== null
      ? `Acumulado de ${formatCurrencyCompact(lastClosed.accumulated)} até ${formatMonthShort(lastClosed.month)}, ${formatPercent(pctOfTarget, 0)} da meta anual de ${formatCurrencyCompact(annualTarget)}`
      : 'Nenhum mês fechado ainda neste recorte';

  function buildTooltipEntries(row: AccumulatedRow): readonly TooltipEntry[] {
    const entries: TooltipEntry[] = [];
    if (row.revenue !== null) {
      entries.push({ color: BAR_COLOR, dataKey: 'revenue', graphicalItemId: 'revenue', name: 'Receita do mês', value: row.revenue });
    }
    if (row.accumulated !== null) {
      entries.push({ color: LINE_COLOR, dataKey: 'accumulated', graphicalItemId: 'accumulated', name: 'Acumulado do ano', value: row.accumulated });
    }
    return entries;
  }

  const renderTooltip = (tooltipProps: TooltipContentProps): ReactElement | null => {
    const month = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = month === undefined ? undefined : rows.find((candidate) => candidate.month === month);
    if (!tooltipProps.active || !row) return null;
    return (
      <ChartTooltip
        active={tooltipProps.active}
        label={month}
        labelFormat="month"
        payload={buildTooltipEntries(row)}
        valueFormat="currencyCompact"
      />
    );
  };

  const renderAccumulatedPoint = ({ x, y, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row || row.accumulated === null || index !== lastClosedIndex) return null;
    const cx = Number(x);
    const cy = Number(y);
    return (
      <g>
        <circle cx={cx} cy={cy} fill={LINE_COLOR} r={4} stroke="var(--surface-raised)" strokeWidth={2} />
        <text className="font-display" dominantBaseline="central" fill={LINE_COLOR} fontSize={12} fontWeight={700} style={HALO} textAnchor="start" x={cx + 8} y={cy - 10}>
          {formatCurrencyCompact(row.accumulated)}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} barCategoryGap="34%" data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} yAxisId={AXIS_MONTH} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickLine={false}
              tickMargin={8}
              ticks={xTicks}
            />
            <YAxis
              axisLine={false}
              domain={[0, leftDomainMax * HEADROOM]}
              label={{ value: 'receita', fill: BAR_COLOR, fontSize: 11, position: 'top' }}
              tick={{ fill: BAR_COLOR, fontSize: 11 }}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickLine={false}
              tickMargin={8}
              ticks={[...leftTicks]}
              width={AXIS_WIDTH}
              yAxisId={AXIS_MONTH}
            />
            <YAxis
              axisLine={false}
              domain={[0, rightDomainMax * HEADROOM]}
              label={{ value: 'acumulado', fill: LINE_COLOR, fontSize: 11, position: 'top' }}
              orientation="right"
              tick={{ fill: LINE_COLOR, fontSize: 11 }}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickLine={false}
              tickMargin={8}
              ticks={[...rightTicks]}
              width={AXIS_WIDTH}
              yAxisId={AXIS_ACCUM}
            />
            <Tooltip content={renderTooltip} cursor={CURSOR} isAnimationActive={false} />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{ fill: 'var(--text-muted)', fontSize: 11, position: 'insideBottomRight', value: `Meta anual ${formatCurrencyCompact(annualTarget)}` }}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              y={annualTarget}
              yAxisId={AXIS_ACCUM}
            />
            <Bar
              dataKey="revenue"
              fill={BAR_COLOR}
              isAnimationActive={animate}
              maxBarSize={MAX_BAR_SIZE}
              name="Receita do mês"
              radius={[3, 3, 0, 0]}
              yAxisId={AXIS_MONTH}
            />
            <Line
              connectNulls={false}
              dataKey="accumulated"
              dot={false}
              isAnimationActive={animate}
              label={renderAccumulatedPoint}
              name="Acumulado do ano"
              stroke={LINE_COLOR}
              strokeWidth={2}
              yAxisId={AXIS_ACCUM}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
