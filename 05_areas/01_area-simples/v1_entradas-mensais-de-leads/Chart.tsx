import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyLeads } from './data';

/**
 * Área temporal de série única: o preenchimento até o zero mede volume mensal, a linha mede
 * tendência. Uma frase de leitura calculada do dado diz se a entrada está em alta ou em queda.
 */
export interface MonthlyLeadsAreaProps {
  readonly data?: readonly MonthlyLeads[];
  readonly height?: number;
  readonly className?: string;
}

const AREA_FILL_OPACITY = 0.18;
const MARGIN = { top: 12, right: 12, bottom: 0, left: 0 } as const;
const Y_AXIS_WIDTH = 64;
const GRID_TARGET_COUNT = 4;

interface ValueTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly payload?: { readonly value?: number };
}

/** 3 a 5 linhas de grade em intervalo redondo (EIX-4): passo 1, 2 ou 5 vezes a potência de 10. */
function computeNiceTicks(maxValue: number, targetCount = GRID_TARGET_COUNT): readonly number[] {
  if (maxValue <= 0) return [0, 1];
  const roughStep = maxValue / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const topTick = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= topTick + step / 2; value += step) {
    ticks.push(Math.round(value));
  }
  return ticks;
}

export default function MonthlyLeadsArea({ data = defaultData, height, className }: MonthlyLeadsAreaProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não houve entrada de lead registrada no período.</span>
      </div>
    );
  }

  const first = data[0];
  const last = data[data.length - 1];
  const maxValue = Math.max(...data.map((row) => row.leads));
  const ticks = computeNiceTicks(maxValue);
  const domainTop = ticks[ticks.length - 1] ?? maxValue;
  const trend = !first || !last || last.leads === first.leads ? null : last.leads > first.leads ? 'alta' : 'queda';
  const variation =
    first && first.leads > 0 ? Math.round(((last?.leads ?? 0) - first.leads) / first.leads * 100) : null;

  const summary = [
    `Gráfico de área com as entradas mensais de leads de ${formatMonthShort(first?.month ?? '')} a ${formatMonthShort(last?.month ?? '')}, ${String(data.length)} meses.`,
    last ? `Terminou em ${formatInt(last.leads)} leads.` : '',
    trend && variation !== null
      ? `Está em ${trend}, ${trend === 'alta' ? '+' : '−'}${String(Math.abs(variation))}% contra ${formatInt(first?.leads ?? 0)} leads no início da série.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const reading =
    trend && variation !== null
      ? `${trend === 'alta' ? 'Em alta' : 'Em queda'}: ${trend === 'alta' ? '+' : '−'}${String(Math.abs(variation))}% desde ${formatMonthShort(first?.month ?? '')}`
      : null;

  const renderValueTick = ({ x = 0, y = 0, payload }: ValueTickProps): ReactElement => {
    const value = payload?.value ?? 0;
    const label = value === domainTop ? `${formatInt(value)} leads` : formatInt(value);
    return (
      <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={Number(x)} y={Number(y)}>
        {label}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary tabular-nums">{reading}</p> : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart accessibilityLayer={false} data={[...data]} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={formatMonthShort}
              tickLine={false}
              tickMargin={8}
              interval={data.length > 8 ? 1 : 0}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              domain={[0, domainTop]}
              tick={renderValueTick}
              tickLine={false}
              ticks={[...ticks]}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="month" valueFormat="int" />}
              cursor={{ stroke: CURSOR_COLOR }}
              isAnimationActive={false}
            />
            <Area
              activeDot={{ r: 4 }}
              dataKey="leads"
              fill="var(--chart-1)"
              fillOpacity={AREA_FILL_OPACITY}
              isAnimationActive={animate}
              name="leads"
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
