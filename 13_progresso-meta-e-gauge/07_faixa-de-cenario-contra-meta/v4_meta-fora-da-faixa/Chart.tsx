import type { ReactElement } from 'react';
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type AnnualScenario } from './data';

/**
 * A mesma barra flutuante da v1, para o caso em que nem o cenário otimista alcança a meta: a
 * faixa inteira fica à esquerda do traço da meta, sem esticar o eixo para disfarçar a
 * distância, e a lacuna vai escrita em valor e em percentual.
 */
export interface ScenarioRangeChartProps {
  readonly data?: AnnualScenario;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 30, right: 64, bottom: 30, left: 0 } as const;
const BAR_SIZE = 28;
const VALUE_LABEL_GAP = 6;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface RangeShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
}

export default function ScenarioRangeChart({ data = defaultData, height, className }: ScenarioRangeChartProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [{ id: data.period, floor: data.floor, span: data.ceiling - data.floor }];
  const domainMax = Math.max(data.ceiling, data.goal) * 1.14;
  const gap = data.goal - data.ceiling;
  const asOfLabel = formatMonthShort(data.asOf.slice(0, 7));

  const summary = [
    `Barra de faixa de cenário com a receita projetada de ${data.period}, entre ${formatCurrencyCompact(data.floor)} e ${formatCurrencyCompact(data.ceiling)}.`,
    `A meta anual de ${formatCurrencyCompact(data.goal)} fica fora da faixa inteira: faltam ${formatCurrencyCompact(gap)}, ${formatPercent(gap / data.goal)}, mesmo no otimista.`,
  ].join(' ');

  const renderRange = ({ x = 0, y = 0, width = 0, height: barHeight = 0 }: RangeShapeProps): ReactElement => {
    const span = data.ceiling - data.floor;
    const baseFrac = span === 0 ? 0 : Math.min(Math.max((data.base - data.floor) / span, 0), 1);
    const baseX = x + width * baseFrac;
    const midY = y + barHeight / 2;
    return (
      <g>
        <rect fill="var(--chart-1)" height={barHeight} rx={3} width={width} x={x} y={y} />
        <line stroke="var(--text-primary)" strokeWidth={2} x1={baseX} x2={baseX} y1={y - 5} y2={y + barHeight + 5} />
        <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="end" x={x - VALUE_LABEL_GAP} y={midY}>
          {formatCurrencyCompact(data.floor)}
        </text>
        <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} textAnchor="start" x={x + width + VALUE_LABEL_GAP} y={midY}>
          {formatCurrencyCompact(data.ceiling)}
        </text>
        <text className="font-display" fill="var(--text-primary)" fontSize={11} fontWeight={600} style={HALO} textAnchor="middle" x={baseX} y={y + barHeight + 18}>
          base {formatCurrencyCompact(data.base)}
        </text>
      </g>
    );
  };

  const renderGoalLabel = ({ viewBox }: { viewBox?: { x?: number; y?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="end" x={(viewBox?.x ?? 0) + 2} y={(viewBox?.y ?? 0) - 8}>
      meta {formatCurrencyCompact(data.goal)}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        Faltam <span className="kpi-number font-medium text-negative">{formatCurrencyCompact(gap)}</span> ({formatPercent(gap / data.goal)} da meta) até o teto {formatCurrencyCompact(data.ceiling)} alcançar a meta {data.goalScope}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} data={rows} layout="vertical" margin={MARGIN} stackOffset="none">
            <XAxis
              axisLine={false}
              domain={[0, domainMax]}
              height={18}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickLine={false}
              type="number"
            />
            <YAxis dataKey="id" hide type="category" />
            <Bar dataKey="floor" fill="none" isAnimationActive={false} legendType="none" stackId="range" />
            <Bar dataKey="span" isAnimationActive={animate} maxBarSize={BAR_SIZE} shape={renderRange} stackId="range" />
            <ReferenceLine ifOverflow="extendDomain" label={renderGoalLabel} stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1.5} x={data.goal} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Sobre o fechado até {asOfLabel}: pessimista ({data.floorPremise}), base ({data.basePremise}) e otimista ({data.ceilingPremise}).
      </p>
    </div>
  );
}
