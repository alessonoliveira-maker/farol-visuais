import { Filter } from 'lucide-react';
import { useId, type ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyRevenueRegime } from './data';

/** Receita reconhecida do ano: colunas sólidas nos meses fechados, hachuradas nos projetados. */
export interface RevenueYearWithProjectionProps {
  readonly data?: readonly MonthlyRevenueRegime[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Card ≈ 574 × 234 px de corpo (seção 13). Reservo 40 px de topo para as duas linhas do rótulo do
 * ReferenceArea (método na primeira, "a partir de mês/ano" na segunda) viverem fora da área de
 * plotagem, no mesmo mecanismo do molde 01/v2 (renderWindowLabel a viewBox.y − 8): assim elas
 * nunca disputam altura com o topo das colunas. 32 px bastavam para uma linha; a segunda linha do
 * método pede 8 px a mais para não raspar o topo do SVG.
 */
const MARGIN = { top: 40, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 48;
const BAR_CATEGORY_GAP = '34%';
/**
 * ESP-6, série única: disponível ≈ 574 − 48 (eixo) − 8 (margem) = 518; passo ≈ 518 / 12 ≈ 43,2;
 * espessura ≈ 43,2 × (1 − 2 × 0,34) ≈ 43,2 × 0,32 ≈ 13,8 px. Acima do piso de 12 px (ESP-2); sem
 * rótulo desenhado dentro da marca, então o piso de 18 px não se aplica.
 */
const BAR_MAX = 14;
const TICK_STEP = 300_000;

interface BarShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: MonthlyRevenueRegime;
}

function niceCeiling(max: number, step: number): number {
  return Math.max(step, Math.ceil(max / step) * step);
}

export default function RevenueYearWithProjection({ data = defaultData, height, className }: RevenueYearWithProjectionProps) {
  const animate = useAnimateOnce();
  const patternId = useId();
  const style = height === undefined ? undefined : { height };
  const rows = [...data];

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita reconhecida nem projeção para o período.</span>
      </div>
    );
  }

  const closed = rows.filter((row) => row.regime === 'realizado');
  const projected = rows.filter((row) => row.regime === 'projecao');
  const totalClosed = closed.reduce((sum, row) => sum + row.revenue, 0);
  const totalProjected = projected.reduce((sum, row) => sum + row.revenue, 0);
  const ceiling = niceCeiling(Math.max(...rows.map((row) => row.revenue)), TICK_STEP);
  const ticks = Array.from({ length: 4 }, (_, i) => (ceiling / 3) * i);
  const firstProjected = projected[0];
  const lastRow = rows[rows.length - 1];

  const summary = [
    `Gráfico de colunas com a receita reconhecida de ${String(rows.length)} meses, ${String(closed.length)} fechados e ${String(projected.length)} projetados${firstProjected ? ` a partir de ${formatMonthShort(firstProjected.month)}` : ''}.`,
    `Realizado ${formatCurrencyCompact(totalClosed)}; projeção de ${formatCurrencyCompact(totalProjected)}, sem somar os dois num único total.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderColumn = ({ x = 0, y = 0, width = 0, height: barHeight = 0, payload }: BarShapeProps): ReactElement | null => {
    if (!payload) return null;
    const isProjection = payload.regime === 'projecao';
    return (
      <rect
        fill={isProjection ? `url(#${patternId})` : 'var(--chart-1)'}
        height={Math.max(barHeight, 1)}
        rx={3}
        stroke={isProjection ? 'var(--chart-1)' : 'none'}
        strokeWidth={isProjection ? 1 : 0}
        width={width}
        x={x}
        y={y}
      />
    );
  };

  const renderAreaLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly width?: number; readonly y?: number } }): ReactElement => {
    const cx = (viewBox?.x ?? 0) + (viewBox?.width ?? 0) / 2;
    const baseline = (viewBox?.y ?? 0) - 8;
    return (
      <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={baseline}>
        <tspan dy="-1.2em" x={cx}>
          <tspan className="font-sans">projeção a partir de </tspan>
          <tspan className="font-display">{firstProjected ? formatMonthShort(firstProjected.month) : ''}</tspan>
        </tspan>
        <tspan className="font-sans" dy="1.2em" x={cx}>
          média móvel dos meses fechados
        </tspan>
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    if (!props.active || !props.payload) return null;
    const month = typeof props.label === 'string' ? props.label : '';
    const row = rows.find((entry) => entry.month === month);
    const payload = props.payload.map((entry) => ({
      ...entry,
      name: row?.regime === 'projecao' ? 'Receita, projeção' : 'Receita, realizado',
      value: entry.value,
    }));
    return <ChartTooltip active={props.active} label={month} labelFormat="month" payload={payload} valueFormat="currencyCompact" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 shrink-0 rounded-[2px] bg-chart-1" />
          realizado
        </span>
        <span className="flex items-center gap-1.5">
          <svg aria-hidden className="size-3 shrink-0" viewBox="0 0 12 12">
            <rect fill="none" height={11} rx={2} stroke="var(--chart-1)" strokeWidth={1} width={11} x={0.5} y={0.5} />
            <line stroke="var(--chart-1)" strokeOpacity={0.55} strokeWidth={1} x1={2} x2={5} y1={11} y2={0} />
            <line stroke="var(--chart-1)" strokeOpacity={0.55} strokeWidth={1} x1={7} x2={10} y1={11} y2={0} />
          </svg>
          projetado
        </span>
        <span className="ml-auto">
          <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(totalClosed)}</span> realizado ·{' '}
          <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(totalProjected)}</span> projetado
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} margin={MARGIN}>
            <defs>
              <pattern height={6} id={patternId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={6}>
                <rect fill="var(--surface-raised)" height={6} width={6} />
                <line stroke="var(--chart-1)" strokeOpacity={0.55} strokeWidth={1.5} x1={0} x2={0} y1={0} y2={6} />
              </pattern>
            </defs>
            {firstProjected && lastRow ? (
              <ReferenceArea
                fill="var(--surface-sunken)"
                ifOverflow="visible"
                label={renderAreaLabel}
                x1={firstProjected.month}
                x2={lastRow.month}
              />
            ) : null}
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, ceiling]} tickFormatter={formatCurrencyAxis} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="revenue" fill="var(--chart-1)" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderColumn} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
