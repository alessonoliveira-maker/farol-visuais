import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, goal as defaultGoal, todayMonth as defaultTodayMonth, type CumulativeMonth } from './data';

/**
 * Leque de projeção sobre a receita acumulada contra a meta anual: a probabilidade de superar
 * a meta em dezembro sai de uma interpolação linear entre os percentis do último mês, não de
 * um sorteio; a legenda escreve essa mesma leitura em texto, sem depender só da cor da faixa.
 */
export interface RevenueGoalFanProps {
  readonly data?: readonly CumulativeMonth[];
  readonly goal?: number;
  readonly todayMonth?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 28, right: 150, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 56;
const DOMAIN: readonly [number, number] = [0, 4_800_000];
const TICKS = [0, 1_200_000, 2_400_000, 3_600_000, 4_800_000] as const;
const BAND_FILL = 'var(--line-strong)';
const BAND90_OPACITY = 0.16;
const BAND50_OPACITY = 0.3;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;
/** Pontos conhecidos da distribuição acumulada de dezembro: fração abaixo do valor (CDF). */
const PERCENTILE_FRACTIONS = [0.05, 0.25, 0.5, 0.75, 0.95] as const;

interface FanRow extends CumulativeMonth {
  readonly band90: readonly [number, number] | null;
  readonly band50: readonly [number, number] | null;
}

function lastIndexWith(rows: readonly FanRow[], key: 'real' | 'median'): number {
  let found = -1;
  rows.forEach((row, index) => {
    if (row[key] !== null) found = index;
  });
  return found;
}

/** Probabilidade de superar a meta por interpolação linear entre os percentis conhecidos (CDF por partes). */
function probabilityAboveGoal(row: CumulativeMonth, goalValue: number): number | null {
  const values = [row.p05, row.p25, row.median, row.p75, row.p95];
  if (values.some((value) => value === null)) return null;
  const points = PERCENTILE_FRACTIONS.map((fraction, index) => [fraction, values[index] as number] as const);
  const first = points[0]!;
  const lastPoint = points[points.length - 1]!;
  if (goalValue <= first[1]) return 1 - first[0];
  if (goalValue >= lastPoint[1]) return 1 - lastPoint[0];
  for (let index = 0; index < points.length - 1; index += 1) {
    const [f0, v0] = points[index]!;
    const [f1, v1] = points[index + 1]!;
    if (goalValue >= v0 && goalValue <= v1) {
      const fraction = f0 + ((goalValue - v0) / (v1 - v0)) * (f1 - f0);
      return 1 - fraction;
    }
  }
  return null;
}

export default function RevenueGoalFan({ data = defaultData, goal = defaultGoal, todayMonth = defaultTodayMonth, height, className }: RevenueGoalFanProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita acumulada para projetar.</span>
      </div>
    );
  }

  const rows: readonly FanRow[] = data.map((row) => ({
    ...row,
    band90: row.p05 === null || row.p95 === null ? null : [row.p05, row.p95],
    band50: row.p25 === null || row.p75 === null ? null : [row.p25, row.p75],
  }));
  const realEnd = lastIndexWith(rows, 'real');
  const junction = rows[realEnd];
  const last = rows[rows.length - 1]!;
  const probability = probabilityAboveGoal(last, goal);

  const summary =
    junction === undefined || probability === null
      ? 'Gráfico de área com leque de projeção da receita acumulada, sem mês real medido ainda.'
      : `Gráfico de área com leque de projeção da receita acumulada de ${formatMonthShort(rows[0]?.month ?? '')} a ${formatMonthShort(last.month)} contra a meta de ${formatCurrencyCompact(goal)}. Real acumulado até ${formatMonthShort(junction.month)}: ${formatCurrencyCompact(junction.real ?? 0)}. Cerca de ${formatPercent(probability, 0)} de chance de superar a meta em ${formatMonthShort(last.month)}.`;

  const reading =
    probability === null
      ? ''
      : `Cerca de ${formatPercent(probability, 0)} de chance de superar a meta, por interpolação linear entre os percentis de dez/26.`;

  const renderGoalLabel = ({ value, viewBox }: { value?: unknown; viewBox?: { x?: number; y?: number } }): ReactElement | null => {
    void value;
    return (
      <text className="font-display" dominantBaseline="auto" fill="var(--text-muted)" fontSize={11} textAnchor="start" x={(viewBox?.x ?? 0) + 4} y={(viewBox?.y ?? 0) - 4}>
        {`meta ${formatCurrencyCompact(goal)}`}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis axisLine={false} dataKey="month" interval={1} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatMonthShort} tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} domain={[...DOMAIN]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(value: number) => formatCurrencyAxis(value)} ticks={[...TICKS]} width={VALUE_AXIS_WIDTH} />
            <ReferenceLine ifOverflow="extendDomain" label={renderGoalLabel} stroke="var(--text-muted)" strokeDasharray="3 3" y={goal} />
            <ReferenceLine label={{ value: 'hoje', position: 'insideBottomRight', fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--text-muted)" strokeDasharray="3 3" x={todayMonth} />
            <Area connectNulls={false} dataKey="band90" fill={BAND_FILL} fillOpacity={BAND90_OPACITY} isAnimationActive={animate} stroke="none" />
            <Area connectNulls={false} dataKey="band50" fill={BAND_FILL} fillOpacity={BAND50_OPACITY} isAnimationActive={animate} stroke="none" />
            <Line connectNulls={false} dataKey="real" dot={false} isAnimationActive={false} stroke="var(--chart-1)" strokeWidth={2} />
            <Line connectNulls={false} dataKey="median" dot={false} isAnimationActive={false} stroke="var(--chart-1)" strokeDasharray="4 4" strokeWidth={2}>
              <LabelList
                content={({ x, y, index }: LabelProps): ReactElement | null => {
                  if (index !== rows.length - 1) return null;
                  return (
                    <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={600} style={HALO} textAnchor="start" x={Number(x) + 8} y={Number(y)}>
                      {`mediana ${formatCurrencyCompact(last.median ?? 0)}`}
                    </text>
                  );
                }}
                dataKey="median"
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 flex-wrap gap-x-6 gap-y-1 text-[0.6875rem] text-text-secondary tabular-nums">
        <span className="flex items-center gap-2.5">
          <span className="inline-block size-2.5 rounded-xs" style={{ backgroundColor: BAND_FILL, opacity: BAND50_OPACITY }} />
          {`50% dos cenários (p25 a p75): ${formatCurrencyCompact(last.p25 ?? 0)} a ${formatCurrencyCompact(last.p75 ?? 0)}`}
        </span>
        <span className="flex items-center gap-2.5">
          <span className="inline-block size-2.5 rounded-xs" style={{ backgroundColor: BAND_FILL, opacity: BAND90_OPACITY }} />
          {`90% dos cenários (p05 a p95): ${formatCurrencyCompact(last.p05 ?? 0)} a ${formatCurrencyCompact(last.p95 ?? 0)}`}
        </span>
      </div>
    </div>
  );
}
