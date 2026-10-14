import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  originalAnnualTarget as defaultOriginalAnnualTarget,
  revisedAnnualTarget as defaultRevisedAnnualTarget,
  revisionMonth as defaultRevisionMonth,
  type MonthlyRevenue,
} from './data';

/**
 * Acumulado real contra uma meta em degrau: a mesma trajetória usa `type="stepAfter"` para não
 * redesenhar o passado com o valor novo, só troca o ritmo dos meses a partir da revisão. Um mês
 * com estorno faz o acumulado cair, e a queda é anotada, não suavizada.
 */
export interface AccumulatedWithRevisedTargetProps {
  readonly data?: readonly MonthlyRevenue[];
  readonly originalAnnualTarget?: number;
  readonly revisedAnnualTarget?: number;
  readonly revisionMonth?: string;
  readonly height?: number;
  readonly className?: string;
}

const MONTHS_IN_YEAR = 12;
const MARGIN = { top: 28, right: 20, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 64;
const DOMAIN: readonly [number, number] = [0, 8_000_000];
const TICKS = [0, 2_000_000, 4_000_000, 6_000_000, 8_000_000] as const;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

export default function AccumulatedWithRevisedTarget({
  data = defaultData,
  originalAnnualTarget = defaultOriginalAnnualTarget,
  revisedAnnualTarget = defaultRevisedAnnualTarget,
  revisionMonth = defaultRevisionMonth,
  height,
  className,
}: AccumulatedWithRevisedTargetProps) {
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

  const revisionIndex = data.findIndex((row) => row.month === revisionMonth);
  const oldPace = originalAnnualTarget / MONTHS_IN_YEAR;
  const cumBeforeRevision = oldPace * Math.max(revisionIndex, 0);
  const monthsAfterRevision = MONTHS_IN_YEAR - Math.max(revisionIndex, 0);
  const newPace = monthsAfterRevision > 0 ? (revisedAnnualTarget - cumBeforeRevision) / monthsAfterRevision : 0;

  let actualRunning = 0;
  const rows = data.map((row, index) => {
    actualRunning += row.revenueRecognized;
    const cumulativeTarget =
      revisionIndex < 0 || index < revisionIndex ? oldPace * (index + 1) : cumBeforeRevision + newPace * (index - revisionIndex + 1);
    return { month: row.month, cumulativeActual: actualRunning, cumulativeTarget };
  });

  const last = rows[rows.length - 1]!;
  const first = rows[0]!;
  const dropIndex = data.findIndex((row) => row.revenueRecognized < 0);
  const dropRow = dropIndex >= 0 ? data[dropIndex] : undefined;
  const gap = last.cumulativeActual - last.cumulativeTarget;
  const behind = gap < 0;

  const summary = [
    `Gráfico de linha com a receita acumulada de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)} de 2026 contra a meta anual, revisada de ${formatCurrencyCompact(originalAnnualTarget)} para ${formatCurrencyCompact(revisedAnnualTarget)} em ${formatMonthShort(revisionMonth)}.`,
    dropRow ? `Um estorno em ${formatMonthShort(dropRow.month)} derruba o acumulado para ${formatCurrencyCompact(last.cumulativeActual)},` : `Fecha em ${formatCurrencyCompact(last.cumulativeActual)},`,
    `${formatCurrencyCompact(Math.abs(gap))} ${behind ? 'abaixo' : 'acima'} da meta.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderActualDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || index === undefined) return null;
    const isDrop = index === dropIndex && !!dropRow;
    const isLast = index === rows.length - 1;
    if (!isDrop && !isLast) return null;
    const x = Number(cx);
    const y = Number(cy);
    return (
      <g key="actual-marker">
        {isDrop ? (
          <path d={`M ${String(x)} ${String(y - 4)} L ${String(x + 4)} ${String(y + 4)} L ${String(x - 4)} ${String(y + 4)} Z`} fill="var(--negative)" />
        ) : (
          <circle cx={x} cy={y} fill="var(--chart-1)" r={3} />
        )}
        {isLast ? (
          <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} textAnchor="end" x={x} y={y - 12}>
            {formatCurrencyCompact(last.cumulativeActual)}
          </text>
        ) : null}
        {isDrop && dropRow ? (
          <text className="font-sans" fill="var(--negative)" fontSize={11} style={HALO} textAnchor="end" x={x} y={y + 16}>
            estorno <tspan className="font-display">{formatCurrencyCompact(Math.abs(dropRow.revenueRecognized))}</tspan>
          </text>
        ) : null}
      </g>
    );
  };

  const renderRevisionLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={viewBox?.x ?? 0} y={14}>
      <tspan>meta revisada: </tspan>
      <tspan className="font-display">{formatCurrencyCompact(originalAnnualTarget)}</tspan>
      <tspan> para </tspan>
      <tspan className="font-display">{formatCurrencyCompact(revisedAnnualTarget)}</tspan>
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Acumulado de {formatMonthShort(first.month)} a {formatMonthShort(last.month)}:{' '}
        <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(last.cumulativeActual)}</span>,{' '}
        <span className={behind ? 'kpi-number font-medium text-negative' : 'kpi-number font-medium text-positive'}>
          {formatCurrencyCompact(Math.abs(gap))} {behind ? 'abaixo' : 'acima'}
        </span>{' '}
        da meta anual revisada
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={DOMAIN} tickFormatter={formatCurrencyAxis} ticks={[...TICKS]} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip labelFormat="month" valueFormat="currencyCompact" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <Line dataKey="cumulativeTarget" dot={false} isAnimationActive={false} name="Meta acumulada" stroke="var(--line-strong)" strokeDasharray="4 4" strokeWidth={1.5} type="stepAfter" />
            <Line
              activeDot={{ r: 4 }}
              dataKey="cumulativeActual"
              dot={renderActualDot}
              isAnimationActive={animate}
              name="Realizado acumulado"
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="linear"
            />
            {revisionIndex >= 0 ? (
              <ReferenceLine ifOverflow="extendDomain" label={renderRevisionLabel} stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1} x={revisionMonth} />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
