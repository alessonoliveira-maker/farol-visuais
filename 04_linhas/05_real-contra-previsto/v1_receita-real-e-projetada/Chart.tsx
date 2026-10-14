import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
} from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  cutoffMonth as defaultCutoffMonth,
  data as defaultData,
  projectionMethod as defaultProjectionMethod,
  type MonthlyRevenueForecast,
} from './data';

/**
 * Receita reconhecida mensal: trecho sólido até o mês medido, trecho tracejado na projeção. O
 * mês de corte repete o valor nas duas chaves, para a linha não abrir buraco na virada.
 */
export interface RevenueForecastLineProps {
  readonly data?: readonly MonthlyRevenueForecast[];
  readonly cutoffMonth?: string;
  readonly projectionMethod?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 26, right: 96, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 56;
const TICK_COUNT = 4;
/** Teto de tiques do eixo de categoria do Farol (EIX-7); acima disso, os rótulos afinam. */
const CATEGORY_TICK_LIMIT = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Teto de eixo em passo redondo, sempre acima do maior valor (EIX-4). */
function niceCeiling(max: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(max, 1)));
  const residual = max / magnitude;
  const step = residual <= 2 ? 0.5 : residual <= 5 ? 1 : 2;
  const ceiling = Math.ceil(max / (step * magnitude)) * step * magnitude;
  return ceiling <= max ? ceiling + step * magnitude : ceiling;
}

export default function RevenueForecastLine({
  data = defaultData,
  cutoffMonth = defaultCutoffMonth,
  projectionMethod = defaultProjectionMethod,
  height,
  className,
}: RevenueForecastLineProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = data;

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita reconhecida nem projeção para desenhar.</span>
      </div>
    );
  }

  const lastRealIndex = rows.reduce((found, row, index) => (row.real !== null ? index : found), -1);
  const lastProjectedIndex = rows.reduce((found, row, index) => (row.projected !== null ? index : found), -1);
  const lastReal = lastRealIndex >= 0 ? rows[lastRealIndex] : undefined;
  const lastProjected = lastProjectedIndex >= 0 ? rows[lastProjectedIndex] : undefined;
  const allValues = rows.flatMap((row) => [row.real, row.projected]).filter((value): value is number => value !== null);
  const ceiling = niceCeiling(Math.max(1, ...allValues));
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (ceiling / TICK_COUNT) * i);
  const tickInterval = rows.length > CATEGORY_TICK_LIMIT ? Math.ceil(rows.length / CATEGORY_TICK_LIMIT) - 1 : 0;

  const summary = [
    `Gráfico de linha com a receita reconhecida mensal de ${formatMonthShort(rows[0]?.month ?? '')} a ${formatMonthShort(rows[rows.length - 1]?.month ?? '')}, sólida até o medido e tracejada na projeção.`,
    lastReal ? `Fechou ${formatMonthShort(lastReal.month)} em ${formatCurrencyCompact(lastReal.real ?? 0)}.` : '',
    lastProjected ? `Projeção termina ${formatMonthShort(lastProjected.month)} em ${formatCurrencyCompact(lastProjected.projected ?? 0)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderCutoffLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x ?? 0} y={12}>
      hoje
    </text>
  );

  const renderRealLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (!lastReal || index !== lastRealIndex) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} textAnchor="middle" x={Number(x)} y={Number(y) - 14}>
        {formatCurrencyCompact(lastReal.real ?? 0)}
      </text>
    );
  };

  const renderProjectedLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (!lastProjected || index !== lastProjectedIndex) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="start" x={Number(x) + 8} y={Number(y)}>
        {formatCurrencyCompact(lastProjected.projected ?? 0)}
      </text>
    );
  };


  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {projectionMethod}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={tickInterval} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, ceiling]} tickFormatter={formatCurrencyAxis} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Tooltip
              content={({ active, label, payload }) => {
                const isCutoff = label === cutoffMonth;
                const filtered = isCutoff ? payload?.filter((entry) => entry.dataKey !== 'projected') : payload;
                return <ChartTooltip active={active} label={label} labelFormat="month" payload={filtered} valueFormat="currencyCompact" />;
              }}
              cursor={{ stroke: CURSOR_COLOR }}
              isAnimationActive={false}
            />
            <Line connectNulls={false} dataKey="real" isAnimationActive={animate} name="Real" stroke="var(--chart-1)" strokeWidth={2} type="linear">
              <LabelList content={renderRealLabel} dataKey="real" />
            </Line>
            <Line connectNulls={false} dataKey="projected" isAnimationActive={animate} name="Projetado" stroke="var(--chart-1)" strokeDasharray="4 4" strokeWidth={2} type="linear">
              <LabelList content={renderProjectedLabel} dataKey="projected" />
            </Line>
            <ReferenceLine ifOverflow="extendDomain" label={renderCutoffLabel} stroke="var(--line-strong)" strokeDasharray="3 3" strokeWidth={1} x={cutoffMonth} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
