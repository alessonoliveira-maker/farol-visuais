import type { ReactElement } from 'react';
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { asOf, basePremise, ceilingPremise, data as defaultData, floorPremise, goal, goalScope, type QuarterlyCumulative } from './data';

/**
 * Quatro faixas de cenário, uma por trimestre acumulado de 2027, no mesmo eixo de valor. A
 * meta anual cruza as quatro como uma única linha tracejada; o primeiro trimestre cuja faixa
 * passa a conter a meta ganha peso no rótulo e uma anotação curta.
 */
export interface ScenarioRangeRowsChartProps {
  readonly data?: readonly QuarterlyCumulative[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 12, right: 140, bottom: 30, left: 0 } as const;
const NAME_AXIS_WIDTH = 56;
/** Passo derivado (ESP-6): quatro linhas em canvas largo, vão de 34% renderiza cerca de 26 px de espessura. */
const BAR_CATEGORY_GAP = '34%';
const BAR_MAX = 30;
const VALUE_LABEL_GAP = 6;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

type Row = QuarterlyCumulative & { readonly span: number };

interface RangeShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: Row;
}

interface TickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

export default function ScenarioRangeRowsChart({ data = defaultData, height, className }: ScenarioRangeRowsChartProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows: readonly Row[] = data.map((row) => ({ ...row, span: row.ceiling - row.floor }));
  const domainMax = Math.max(...rows.map((row) => row.ceiling), goal) * 1.005;
  const firstContaining = rows.find((row) => row.floor <= goal && goal <= row.ceiling);
  const asOfLabel = formatMonthShort(asOf.slice(0, 7));

  const summary = [
    `Gráfico de faixas de cenário com a receita acumulada de 2027 por trimestre, de ${rows[0]?.label ?? ''} a ${rows.at(-1)?.label ?? ''}, contra a meta ${goalScope === 'ano' ? 'anual' : 'do período'} de ${formatCurrencyCompact(goal)}.`,
    firstContaining
      ? `A faixa passa a conter a meta a partir de ${firstContaining.label}, entre ${formatCurrencyCompact(firstContaining.floor)} e ${formatCurrencyCompact(firstContaining.ceiling)}.`
      : 'Nenhum trimestre tem a meta dentro da própria faixa.',
  ].join(' ');

  const renderTick = ({ y, payload }: TickProps): ReactElement => {
    const isFirst = payload?.value === firstContaining?.label;
    return (
      <text dominantBaseline="central" fill={isFirst ? 'var(--text-primary)' : 'var(--text-secondary)'} fontSize={12} fontWeight={isFirst ? 700 : 500} x={0} y={Number(y)}>
        {String(payload?.value ?? '')}
      </text>
    );
  };

  const renderRange = ({ x = 0, y = 0, width = 0, height: barHeight = 0, payload }: RangeShapeProps): ReactElement => {
    if (!payload) return <g />;
    const baseFrac = payload.span === 0 ? 0 : Math.min(Math.max((payload.base - payload.floor) / payload.span, 0), 1);
    const baseX = x + width * baseFrac;
    const midY = y + barHeight / 2;
    const isFirst = payload.id === firstContaining?.id;
    return (
      <g>
        <rect fill="var(--chart-1)" height={barHeight} rx={3} width={width} x={x} y={y} />
        <line stroke="var(--text-primary)" strokeWidth={2} x1={baseX} x2={baseX} y1={y - 4} y2={y + barHeight + 4} />
        <text
          className="font-display"
          dominantBaseline="central"
          fill="var(--text-primary)"
          fontSize={12}
          fontWeight={isFirst ? 700 : 500}
          style={HALO}
          textAnchor="start"
          x={x + width + VALUE_LABEL_GAP}
          y={isFirst ? midY - 8 : midY}
        >
          {formatCurrencyCompact(payload.ceiling)}
        </text>
        {isFirst ? (
          <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="start" x={x + width + VALUE_LABEL_GAP} y={midY + 10}>
            contém a meta
          </text>
        ) : null}
        {/* ROT-1 a ROT-5: o traço do cenário base nunca fica sozinho, o valor vai escrito abaixo dele. */}
        <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={500} style={HALO} textAnchor="middle" x={baseX} y={y + barHeight + 15}>
          base {formatCurrencyCompact(payload.base)}
        </text>
      </g>
    );
  };

  const renderGoalLabel = ({ viewBox }: { viewBox?: { x?: number; y?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={viewBox?.x ?? 0} y={(viewBox?.y ?? 0) - 2}>
      meta anual {formatCurrencyCompact(goal)}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {firstContaining ? (
          <>
            A faixa passa a conter a meta em <span className="font-semibold text-text-primary">{firstContaining.label}</span>
          </>
        ) : (
          'Nenhum trimestre contém a meta na própria faixa'
        )}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis
              axisLine={false}
              domain={[0, domainMax]}
              height={18}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickLine={false}
              type="number"
            />
            <YAxis axisLine={false} dataKey="label" interval={0} tick={renderTick} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            {/* ReferenceLine antes das marcas (ROT-7): a barra e seus rótulos com halo pintam por
              cima da linha da meta, então o halo protege de verdade onde as duas se cruzam. */}
            <ReferenceLine ifOverflow="extendDomain" label={renderGoalLabel} stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1.5} x={goal} />
            <Bar dataKey="floor" fill="none" isAnimationActive={false} legendType="none" stackId="range" />
            <Bar dataKey="span" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderRange} stackId="range" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Sobre o fechado até {asOfLabel}: pessimista ({floorPremise}), base ({basePremise}) e otimista ({ceilingPremise}), acumulados sem sazonalidade.
      </p>
    </div>
  );
}
