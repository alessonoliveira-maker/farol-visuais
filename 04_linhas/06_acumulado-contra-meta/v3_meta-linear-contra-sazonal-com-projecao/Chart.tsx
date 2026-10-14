import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { annualTarget as defaultAnnualTarget, data as defaultData, priorYear as defaultPriorYear, type MonthlyRevenue, type PriorYearMonth } from './data';

/**
 * Duas trajetórias de meta acumulada para a mesma receita: a linear (um doze avos por mês) e a
 * sazonal (o peso de cada mês em 2025 aplicado à meta anual). A prop `metaVariant` alterna qual
 * das duas aparece; o realizado tem sua própria projeção tracejada de agosto a dezembro, na
 * mesma forma sazonal, e cada trajetória termina com um rótulo no lugar de legenda.
 */
export interface AccumulatedSeasonalOrLinearProps {
  readonly data?: readonly MonthlyRevenue[];
  readonly priorYear?: readonly PriorYearMonth[];
  readonly annualTarget?: number;
  readonly metaVariant?: 'linear' | 'sazonal';
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 20, right: 172, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 64;
const DOMAIN: readonly [number, number] = [0, 10_500_000];
const TICKS = [0, 2_500_000, 5_000_000, 7_500_000, 10_000_000] as const;
const VALUE_LABEL_GAP = 8;
const LABEL_ANCHOR_GAP = 16;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface Point {
  readonly cx: number;
  readonly cy: number;
}

export default function AccumulatedSeasonalOrLinear({
  data = defaultData,
  priorYear = defaultPriorYear,
  annualTarget = defaultAnnualTarget,
  metaVariant = 'sazonal',
  height,
  className,
}: AccumulatedSeasonalOrLinearProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0 || priorYear.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita para acumular nem ano anterior para derivar o peso.</span>
      </div>
    );
  }

  const total2025 = priorYear.reduce((sum, month) => sum + month.revenue, 0);

  /** Para no primeiro mês sem medição: os meses depois dele não somam, mesmo que venham
   * preenchidos mais adiante no array (a lacuna nunca vira zero, EIX-10). */
  let actualRunning = 0;
  let halted = false;
  const actualCumulative = data.map((row) => {
    if (halted || row.revenueRecognized === null) {
      halted = true;
      return null;
    }
    actualRunning += row.revenueRecognized;
    return actualRunning;
  });
  let lastMeasuredIndex = -1;
  actualCumulative.forEach((value, index) => {
    if (value !== null) lastMeasuredIndex = index;
  });
  const actualAtCutoff = lastMeasuredIndex >= 0 ? actualCumulative[lastMeasuredIndex]! : 0;
  const measuredPrior2025 = priorYear.slice(0, lastMeasuredIndex + 1).reduce((sum, month) => sum + month.revenue, 0);
  const growthFactor = measuredPrior2025 > 0 ? actualAtCutoff / measuredPrior2025 : 1;

  let projectionRunning = actualAtCutoff;
  let seasonalWeightRunning = 0;
  const rows = data.map((row, index) => {
    seasonalWeightRunning += (priorYear[index]?.revenue ?? 0) / total2025;
    const cumulativeSeasonal = annualTarget * seasonalWeightRunning;
    const cumulativeLinear = (annualTarget * (index + 1)) / data.length;
    let cumulativeProjection: number | null = null;
    if (index === lastMeasuredIndex) {
      cumulativeProjection = actualAtCutoff;
    } else if (index > lastMeasuredIndex) {
      projectionRunning += (priorYear[index]?.revenue ?? 0) * growthFactor;
      cumulativeProjection = projectionRunning;
    }
    return {
      month: row.month,
      cumulativeActual: actualCumulative[index],
      cumulativeProjection,
      cumulativeMeta: metaVariant === 'sazonal' ? cumulativeSeasonal : cumulativeLinear,
    };
  });

  const lastRow = rows[rows.length - 1]!;
  const cutoffMonth = data[lastMeasuredIndex];

  const summary =
    cutoffMonth && lastRow
      ? `Gráfico de linha com a receita reconhecida acumulada do ano inteiro de 2026, medida até ${formatMonthShort(cutoffMonth.month)} e projetada dali até dezembro, contra a trajetória ${metaVariant} da meta anual de ${formatCurrencyCompact(annualTarget)}. A projeção fecha o ano em ${formatCurrencyCompact(lastRow.cumulativeProjection ?? 0)}.`
      : 'Gráfico de linha vazio.';

  let metaEnd: Point | undefined;

  const renderMetaLabel = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (index !== rows.length - 1 || cx === undefined || cy === undefined) return null;
    metaEnd = { cx: Number(cx), cy: Number(cy) };
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} fontWeight={600} style={HALO} x={Number(cx) + VALUE_LABEL_GAP} y={Number(cy)}>
        <tspan className="font-sans">meta {metaVariant} </tspan>
        {formatCurrencyCompact(annualTarget)}
      </text>
    );
  };

  const renderProjectionLabel = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (index !== rows.length - 1 || cx === undefined || cy === undefined) return null;
    let py = Number(cy);
    if (metaEnd && Math.abs(metaEnd.cy - py) < LABEL_ANCHOR_GAP) {
      py = py <= metaEnd.cy ? metaEnd.cy - LABEL_ANCHOR_GAP : metaEnd.cy + LABEL_ANCHOR_GAP;
    }
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} x={Number(cx) + VALUE_LABEL_GAP} y={py}>
        <tspan className="font-sans" fontWeight={500}>
          projetado{' '}
        </tspan>
        {formatCurrencyCompact(rows[rows.length - 1]?.cumulativeProjection ?? 0)}
      </text>
    );
  };

  const renderActualDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (index !== lastMeasuredIndex || cx === undefined || cy === undefined) return null;
    return <circle cx={Number(cx)} cy={Number(cy)} fill="var(--chart-1)" key="cutoff-dot" r={3} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {cutoffMonth ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
          Acumulado de jan a dez de 2026, medido até <span className="font-semibold text-text-primary">{formatMonthShort(cutoffMonth.month)}</span> e projetado dali em diante, contra a{' '}
          <span className="font-semibold text-text-primary">meta anual</span> de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(annualTarget)}</span> na trajetória {metaVariant}
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={DOMAIN} tickFormatter={formatCurrencyAxis} ticks={[...TICKS]} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip labelFormat="month" valueFormat="currencyCompact" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <Line dataKey="cumulativeMeta" dot={renderMetaLabel} isAnimationActive={false} name={`Meta ${metaVariant}`} stroke="var(--line-strong)" strokeDasharray="4 4" strokeWidth={1.5} type="linear" />
            <Line
              activeDot={{ r: 4 }}
              connectNulls={false}
              dataKey="cumulativeActual"
              dot={renderActualDot}
              isAnimationActive={animate}
              name="Realizado acumulado"
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="linear"
            />
            <Line connectNulls={false} dataKey="cumulativeProjection" dot={renderProjectionLabel} isAnimationActive={false} name="Projeção" stroke="var(--chart-1)" strokeDasharray="4 4" strokeWidth={2} type="linear" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
