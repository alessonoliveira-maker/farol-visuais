import type { ReactElement } from 'react';
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QuarterlyScenario } from './data';

/**
 * Barra flutuante horizontal: a saída do planejamento não é um número, é a faixa entre o
 * cenário pessimista e o otimista. O cenário base é um traço sólido dentro da faixa; a meta,
 * um traço tracejado que cruza tudo, sempre em extendDomain para nunca sumir do eixo.
 */
export interface ScenarioRangeChartProps {
  readonly data?: QuarterlyScenario;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 30, right: 16, bottom: 30, left: 0 } as const;
/** Cerca de um terço da altura do corpo no canvas faixa: mesma espessura já verificada no bullet chart (02/01). */
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
  const rows = [{ id: data.quarter, floor: data.floor, span: data.ceiling - data.floor }];
  const domainMax = Math.max(data.ceiling, data.goal) * 1.06;
  const gapToGoal = data.goal - data.base;
  const asOfLabel = formatMonthShort(data.asOf);

  const summary = [
    `Barra de faixa de cenário com a receita projetada de ${data.quarter}, entre ${formatCurrencyCompact(data.floor)} e ${formatCurrencyCompact(data.ceiling)}.`,
    `O cenário base é ${formatCurrencyCompact(data.base)}, ${gapToGoal > 0 ? `${formatCurrencyCompact(gapToGoal)} abaixo` : `${formatCurrencyCompact(-gapToGoal)} acima`} da meta ${data.goalScope} de ${formatCurrencyCompact(data.goal)}.`,
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
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={viewBox?.x ?? 0} y={(viewBox?.y ?? 0) - 8}>
      meta {formatCurrencyCompact(data.goal)}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        Base <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(data.base)}</span>
        {gapToGoal > 0 ? (
          <> fica <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(gapToGoal)}</span> ({formatPercent(gapToGoal / data.goal)}) abaixo da meta</>
        ) : (
          <> já supera a meta em <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(-gapToGoal)}</span></>
        )}
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
            {/* ReferenceLine antes das marcas (ROT-7): a barra e seus rótulos com halo pintam por
              cima da linha da meta, então o halo protege de verdade onde as duas se cruzam. */}
            <ReferenceLine ifOverflow="extendDomain" label={renderGoalLabel} stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1.5} x={data.goal} />
            <Bar dataKey="floor" fill="none" isAnimationActive={false} legendType="none" stackId="range" />
            <Bar dataKey="span" isAnimationActive={animate} maxBarSize={BAR_SIZE} shape={renderRange} stackId="range" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Sobre o fechado até {asOfLabel}: pessimista ({data.floorPremise}), base ({data.basePremise}) e otimista ({data.ceilingPremise}).
      </p>
    </div>
  );
}
