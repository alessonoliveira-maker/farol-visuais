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
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  cutoffWeek as defaultCutoffWeek,
  data as defaultData,
  forecastMethod as defaultForecastMethod,
  type WeeklyClosingsForecast,
} from './data';

/**
 * Fechamentos por semana: trecho sólido até a semana de corte, trecho tracejado no forecast. A
 * semana de corte repete o valor nas duas chaves, para a linha não abrir buraco na virada.
 */
export interface ClosingsForecastLineProps {
  readonly data?: readonly WeeklyClosingsForecast[];
  readonly cutoffWeek?: string;
  readonly forecastMethod?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 26, right: 40, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 40;
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

export default function ClosingsForecastLine({
  data = defaultData,
  cutoffWeek = defaultCutoffWeek,
  forecastMethod = defaultForecastMethod,
  height,
  className,
}: ClosingsForecastLineProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = data;

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não há fechamento nem forecast para desenhar.</span>
      </div>
    );
  }

  const lastRealIndex = rows.reduce((found, row, index) => (row.real !== null ? index : found), -1);
  const lastProjectedIndex = rows.reduce((found, row, index) => (row.projected !== null ? index : found), -1);
  const lastReal = lastRealIndex >= 0 ? rows[lastRealIndex] : undefined;
  const lastProjected = lastProjectedIndex >= 0 ? rows[lastProjectedIndex] : undefined;
  const projectedTotal = rows
    .filter((row, index) => row.projected !== null && index !== lastRealIndex)
    .reduce((sum, row) => sum + (row.projected ?? 0), 0);
  const allValues = rows.flatMap((row) => [row.real, row.projected]).filter((value): value is number => value !== null);
  const ceiling = niceCeiling(Math.max(1, ...allValues));
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (ceiling / TICK_COUNT) * i);
  const tickInterval = rows.length > CATEGORY_TICK_LIMIT ? Math.ceil(rows.length / CATEGORY_TICK_LIMIT) - 1 : 0;

  const summary = [
    `Gráfico de linha com fechamentos por semana de ${formatDate(rows[0]?.week ?? '')} a ${formatDate(rows[rows.length - 1]?.week ?? '')}, sólido até o corte e tracejado no forecast.`,
    lastReal ? `Corte em ${formatDate(cutoffWeek)} com ${formatInt(lastReal.real ?? 0)} fechamentos medidos.` : '',
    lastProjected ? `Forecast soma ${formatInt(projectedTotal)} fechamentos até ${formatDate(lastProjected.week)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderCutoffLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x ?? 0} y={12}>
      corte <tspan className="font-display">{formatDate(cutoffWeek)}</tspan>
    </text>
  );

  const renderRealLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (!lastReal || index !== lastRealIndex) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} textAnchor="middle" x={Number(x)} y={Number(y) - 14}>
        {formatInt(lastReal.real ?? 0)}
      </text>
    );
  };

  const renderProjectedLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (!lastProjected || index !== lastProjectedIndex) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="end" x={Number(x) - 4} y={Number(y) - 12}>
        {formatInt(lastProjected.projected ?? 0)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {forecastMethod} Soma projetada:{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(projectedTotal)}</span> fechamentos.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="week" interval={tickInterval} tickFormatter={formatDate} tickMargin={8} />
            <YAxis {...AXIS_PROPS} allowDecimals={false} axisLine={false} domain={[0, ceiling]} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Tooltip
              content={({ active, label, payload }) => {
                const isCutoff = label === cutoffWeek;
                const filtered = isCutoff ? payload?.filter((entry) => entry.dataKey !== 'projected') : payload;
                return <ChartTooltip active={active} label={label} labelFormat="date" payload={filtered} valueFormat="int" />;
              }}
              cursor={{ stroke: CURSOR_COLOR }}
              isAnimationActive={false}
            />
            <Line connectNulls={false} dataKey="real" isAnimationActive={animate} name="Real" stroke="var(--chart-1)" strokeWidth={2} type="linear">
              <LabelList content={renderRealLabel} dataKey="real" />
            </Line>
            <Line connectNulls={false} dataKey="projected" isAnimationActive={animate} name="Forecast" stroke="var(--chart-1)" strokeDasharray="4 4" strokeWidth={2} type="linear">
              <LabelList content={renderProjectedLabel} dataKey="projected" />
            </Line>
            <ReferenceLine ifOverflow="extendDomain" label={renderCutoffLabel} stroke="var(--line-strong)" strokeDasharray="3 3" strokeWidth={1} x={cutoffWeek} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
