import { Filter } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ChannelCpl } from './data';

/**
 * Um LineChart por canal, com o mesmo eixo x e o mesmo syncId. A escala de valor é comum aos
 * quatro painéis, e a nota acima da grade diz isso por extenso, porque escala por painel é o
 * jeito clássico de a peça mentir sem querer.
 */
export interface ChannelCplSmallMultiplesProps {
  readonly data?: readonly ChannelCpl[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Uma só margem para todo painel: o XAxis fica sempre presente (nunca `hide`), só a rotulagem
 * muda entre linhas, então a altura reservada para o eixo é igual em cima e embaixo.
 */
const MARGIN = { top: 4, right: 8, bottom: 4, left: 0 } as const;
const Y_AXIS_WIDTH = 48;
const TICK_MONTHS = ['2026-01', '2026-04', '2026-08'];
const SYNC_ID = 'cpl-por-canal';
/** Arredonda o teto do eixo comum para a centena acima do maior valor do conjunto. */
const ROUND_STEP = 100;

export default function ChannelCplSmallMultiples({
  data = defaultData,
  height,
  className,
}: ChannelCplSmallMultiplesProps) {
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
        <span>Nenhum canal neste recorte: não houve investimento em mídia paga no período.</span>
      </div>
    );
  }

  const allValues = data.flatMap((channel) => channel.points.map((point) => point.value));
  const rawMax = allValues.length > 0 ? Math.max(...allValues) : 0;
  const domainMax = Math.ceil((rawMax * 1.05) / ROUND_STEP) * ROUND_STEP;
  const yTicks = [0, domainMax / 2, domainMax];

  const withLast = data.map((channel) => ({
    channel,
    last: channel.points[channel.points.length - 1],
  }));
  const sorted = [...withLast].sort((a, b) => (b.last?.value ?? 0) - (a.last?.value ?? 0));
  const priciest = sorted[0];
  const cheapest = sorted[sorted.length - 1];

  const summary =
    `Grade com um gráfico de linha por canal, mostrando o CPL mensal de ${String(data.length)} canais entre 2026-01 e 2026-08, todos na mesma escala de R$ 0 a ${formatCurrencyCompact(domainMax)}.` +
    (priciest?.last && cheapest?.last && priciest !== cheapest
      ? ` Em 2026-08, ${priciest.channel.name} é o mais caro, a ${formatCurrencyCompact(priciest.last.value)}, e ${cheapest.channel.name} o mais barato, a ${formatCurrencyCompact(cheapest.last.value)}.`
      : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Escala de CPL comum aos quatro painéis: <span className="kpi-number font-medium text-text-primary">R$ 0</span>{' '}
        a <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(domainMax)}</span>.
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3">
        {data.map((channel, index) => {
          const isBottomRow = index >= data.length - 2;
          const last = channel.points[channel.points.length - 1];
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={channel.id}>
              <div className="mb-1 flex shrink-0 items-baseline justify-between gap-2">
                <span className="text-xs leading-tight font-medium text-text-secondary">{channel.name}</span>
                <span className="kpi-number shrink-0 text-xs font-semibold text-text-primary">
                  {last ? formatCurrencyCompact(last.value) : ''}
                </span>
              </div>
              <div className="min-h-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart
                    accessibilityLayer={false}
                    data={[...channel.points]}
                    margin={MARGIN}
                    syncId={SYNC_ID}
                  >
                    <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
                    <XAxis
                      axisLine={false}
                      dataKey="month"
                      tick={isBottomRow ? { fill: 'var(--text-muted)', fontSize: 11 } : false}
                      tickFormatter={(value: string) => formatMonthShort(value)}
                      tickLine={false}
                      tickMargin={8}
                      ticks={TICK_MONTHS}
                    />
                    <YAxis
                      axisLine={false}
                      domain={[0, domainMax]}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      tickFormatter={(value: number) => formatCurrencyAxis(value)}
                      tickLine={false}
                      ticks={yTicks}
                      width={Y_AXIS_WIDTH}
                    />
                    <Tooltip
                      content={<ChartTooltip labelFormat="month" valueFormat="currencyCompact" />}
                      cursor={{ stroke: CURSOR_COLOR }}
                      isAnimationActive={false}
                    />
                    <Line
                      activeDot={{ r: 4 }}
                      dataKey="value"
                      dot={false}
                      isAnimationActive={animate}
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
