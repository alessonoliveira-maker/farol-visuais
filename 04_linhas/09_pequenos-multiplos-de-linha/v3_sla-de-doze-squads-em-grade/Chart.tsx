import { AlertTriangle, Filter } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { CURSOR_COLOR } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, goalRate as defaultGoalRate, type SquadSla } from './data';

/**
 * Um LineChart por squad, 4 colunas por 3 linhas, todos com o mesmo eixo y de 0% a 100% e a
 * mesma meta tracejada de SLA. Com 12 painéis simultâneos a animação fica desligada e o eixo y
 * só imprime tique em texto na primeira coluna; a largura reservada é igual nas demais, para o
 * eixo x continuar alinhado entre colunas.
 */
export interface SquadSlaSmallMultiplesProps {
  readonly data?: readonly SquadSla[];
  readonly goalRate?: number;
  readonly height?: number;
  readonly className?: string;
}

const COLS = 4;
/**
 * Uma só margem para todo painel: o XAxis fica sempre presente (nunca `hide`), só a rotulagem
 * muda entre linhas, então a altura reservada para o eixo é igual em cima e embaixo.
 */
const MARGIN = { top: 4, right: 4, bottom: 4, left: 0 } as const;
const Y_AXIS_WIDTH = 48;
const Y_TICKS = [0, 0.5, 1];
const SYNC_ID = 'sla-por-squad';

export default function SquadSlaSmallMultiples({
  data = defaultData,
  goalRate = defaultGoalRate,
  height,
  className,
}: SquadSlaSmallMultiplesProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum squad neste recorte: não houve atendimento medido no período.</span>
      </div>
    );
  }

  const withStats = data.map((squad) => {
    const below = squad.points.filter((point) => point.rate < goalRate).length;
    const last = squad.points[squad.points.length - 1];
    return { squad, below, last };
  });
  const weeks = data[0]?.points.length ?? 0;
  const perfect = withStats.filter((row) => row.below === 0).length;
  const worst = [...withStats].sort((a, b) => b.below - a.below)[0];
  const tickWeeks =
    data[0]?.points && data[0].points.length > 0
      ? [data[0].points[0]?.week ?? '', data[0].points[data[0].points.length - 1]?.week ?? '']
      : [];

  const summary =
    `Grade com ${String(data.length)} linhas de SLA semanal por squad, nas últimas ${String(weeks)} semanas, na mesma escala de 0% a 100% e contra a meta tracejada de ${formatPercent(goalRate, 0)}.` +
    (worst
      ? ` ${worst.squad.name} é o mais abaixo, com ${String(worst.below)} de ${String(weeks)} semanas abaixo; ${String(perfect)} squads nunca ficaram abaixo.`
      : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Meta de <span className="kpi-number font-medium text-text-primary">{formatPercent(goalRate, 0)}</span> de SLA
        tracejada em cada painel; contagem no cabeçalho é de semanas abaixo dela.
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-3 gap-3">
        {withStats.map(({ squad, below, last }, index) => {
          const isBottomRow = index >= withStats.length - COLS;
          const isFirstCol = index % COLS === 0;
          const isCurrentlyBelow = (last?.rate ?? 1) < goalRate;
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={squad.id}>
              <div className="mb-0.5 flex shrink-0 items-center gap-1">
                <span className="truncate text-[0.6875rem] leading-tight font-medium text-text-secondary">
                  {squad.name}
                </span>
                {isCurrentlyBelow ? <AlertTriangle aria-hidden className="size-3 shrink-0 text-negative" /> : null}
              </div>
              <div
                className={cn(
                  'mb-1 shrink-0 text-[0.6875rem] leading-tight',
                  below > 0 ? 'text-negative' : 'text-text-muted',
                )}
              >
                {String(below)} de {String(weeks)} semanas
              </div>
              <div className="min-h-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart
                    accessibilityLayer={false}
                    data={[...squad.points]}
                    margin={MARGIN}
                    syncId={SYNC_ID}
                  >
                    <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
                    <XAxis
                      axisLine={false}
                      dataKey="week"
                      tick={isBottomRow ? { fill: 'var(--text-muted)', fontSize: 11 } : false}
                      tickFormatter={(value: string) => formatMonthShort(value.slice(0, 7))}
                      tickLine={false}
                      tickMargin={6}
                      ticks={tickWeeks}
                    />
                    <YAxis
                      axisLine={false}
                      domain={[0, 1]}
                      tick={isFirstCol ? { fill: 'var(--text-muted)', fontSize: 11 } : false}
                      tickFormatter={(value: number) => formatPercent(value, 0)}
                      tickLine={false}
                      ticks={Y_TICKS}
                      width={Y_AXIS_WIDTH}
                    />
                    <Tooltip
                      content={<ChartTooltip labelFormat="date" valueFormat="percent" />}
                      cursor={{ stroke: CURSOR_COLOR }}
                      isAnimationActive={false}
                    />
                    <ReferenceLine
                      ifOverflow="extendDomain"
                      stroke="var(--text-muted)"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      y={goalRate}
                    />
                    <Line
                      dataKey="rate"
                      dot={false}
                      isAnimationActive={false}
                      stroke={isCurrentlyBelow ? 'var(--negative)' : 'var(--chart-1)'}
                      strokeWidth={1.5}
                      type="linear"
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
