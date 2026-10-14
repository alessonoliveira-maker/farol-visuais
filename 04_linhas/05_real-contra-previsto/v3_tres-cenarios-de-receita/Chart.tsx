import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  Line,
  LabelList,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps,
  type LabelProps,
} from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  measuredMonth as defaultMeasuredMonth,
  scenarioMethod as defaultScenarioMethod,
  type RevenueScenario,
} from './data';

/**
 * Três cenários de receita, tracejados com pesos diferentes, saindo do mesmo mês medido: o
 * cenário base carrega a cor de destaque e os extremos ficam em neutro.
 */
export interface RevenueScenariosLineProps {
  readonly data?: readonly RevenueScenario[];
  readonly measuredMonth?: string;
  readonly scenarioMethod?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 20, right: 168, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 60;
const TICK_COUNT = 4;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Teto de eixo em passo redondo, sempre acima do maior valor (EIX-4). */
function niceCeiling(max: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(max, 1)));
  const residual = max / magnitude;
  const step = residual <= 2 ? 0.5 : residual <= 5 ? 1 : 2;
  const ceiling = Math.ceil(max / (step * magnitude)) * step * magnitude;
  return ceiling <= max ? ceiling + step * magnitude : ceiling;
}

export default function RevenueScenariosLine({
  data = defaultData,
  measuredMonth = defaultMeasuredMonth,
  scenarioMethod = defaultScenarioMethod,
  height,
  className,
}: RevenueScenariosLineProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = data;

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há cenário de receita para desenhar.</span>
      </div>
    );
  }

  const lastIndex = rows.length - 1;
  const last = rows[lastIndex];
  const allValues = rows.flatMap((row) => [row.conservative, row.base, row.optimistic]).filter((value): value is number => value !== null);
  const ceiling = niceCeiling(Math.max(1, ...allValues));
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (ceiling / TICK_COUNT) * i);

  const summary = last
    ? `Gráfico de linha com três cenários de receita reconhecida a partir de ${formatMonthShort(measuredMonth)}, tracejados do mesmo ponto medido. Em ${formatMonthShort(last.month)} a saída varia de ${formatCurrencyCompact(last.conservative ?? 0)} no conservador a ${formatCurrencyCompact(last.optimistic ?? 0)} no otimista; base em ${formatCurrencyCompact(last.base ?? 0)}.`
    : 'Gráfico de linha com três cenários de receita, sem mês medido.';

  const renderJunctionDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null =>
    index === 0 && cx !== undefined && cy !== undefined ? (
      <circle cx={cx} cy={cy} fill="var(--chart-1)" key="junction-dot" r={3} stroke="var(--surface-raised)" strokeWidth={1.5} />
    ) : null;

  const renderScenarioLabel = (name: string, fill: string) =>
    ({ x, y, index }: LabelProps): ReactElement | null => {
      if (index !== lastIndex || !last) return null;
      const value = name === 'Conservador' ? last.conservative : name === 'Base' ? last.base : last.optimistic;
      return (
        <text className="font-display" dominantBaseline="central" fill={fill} fontSize={12} fontWeight={name === 'Base' ? 700 : 500} style={HALO} textAnchor="start" x={Number(x) + 8} y={Number(y)}>
          <tspan className="font-sans" fontWeight={500}>{name} </tspan>
          {formatCurrencyCompact(value ?? 0)}
        </text>
      );
    };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {scenarioMethod}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, ceiling]} tickFormatter={formatCurrencyAxis} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip labelFormat="month" valueFormat="currencyCompact" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <Line dataKey="conservative" dot={false} isAnimationActive={animate} name="Conservador" stroke="var(--line-strong)" strokeDasharray="3 3" strokeWidth={1.5} type="linear">
              <LabelList content={renderScenarioLabel('Conservador', 'var(--text-secondary)')} dataKey="conservative" />
            </Line>
            <Line dataKey="base" dot={renderJunctionDot} isAnimationActive={animate} name="Base" stroke="var(--chart-1)" strokeDasharray="5 3" strokeWidth={2.5} type="linear">
              <LabelList content={renderScenarioLabel('Base', 'var(--text-primary)')} dataKey="base" />
            </Line>
            <Line dataKey="optimistic" dot={false} isAnimationActive={animate} name="Otimista" stroke="var(--line-strong)" strokeDasharray="7 3" strokeWidth={1.5} type="linear">
              <LabelList content={renderScenarioLabel('Otimista', 'var(--text-secondary)')} dataKey="optimistic" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
