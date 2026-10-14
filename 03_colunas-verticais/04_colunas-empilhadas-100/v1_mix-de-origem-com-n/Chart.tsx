import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyOriginCount } from './data';

/** Colunas empilhadas a 100%: o mix de origem por mês, com o n de cada mês sempre escrito. */
export interface OriginMixColumnsProps {
  readonly data?: readonly MonthlyOriginCount[];
  readonly height?: number;
  readonly className?: string;
}

type OriginKey = 'pago' | 'organico' | 'indicacao';

interface Segment {
  readonly key: OriginKey;
  readonly label: string;
  readonly color: string;
}

/** Base ao topo: paga e indicação nas pontas, únicas com referência comum entre meses. */
const SEGMENTS: readonly Segment[] = [
  { key: 'pago', label: 'Mídia paga', color: 'var(--chart-1)' },
  { key: 'organico', label: 'Orgânico', color: 'var(--chart-3)' },
  { key: 'indicacao', label: 'Indicação', color: 'var(--chart-6)' },
];
const MARGIN = { top: 24, right: 4, bottom: 0, left: 4 } as const;
const BAR_MAX = 24;
const SEPARATOR_STROKE = 'var(--surface-raised)';
const SEPARATOR_WIDTH = 1.5;

/** Percentuais inteiros que somam 100: piso de cada parte e o resto para as maiores sobras. */
function largestRemainder(values: readonly number[], total: number): number[] {
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const shares = raw.map((value) => Math.floor(value));
  let missing = 100 - shares.reduce((sum, value) => sum + value, 0);
  const bySurplus = raw
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of bySurplus) {
    if (missing <= 0) break;
    shares[index] = (shares[index] ?? 0) + 1;
    missing -= 1;
  }
  return shares;
}

export default function OriginMixColumns({ data = defaultData, height, className }: OriginMixColumnsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não houve leads no período.
      </div>
    );
  }

  const rows = data.map((row) => {
    const raw = SEGMENTS.map((segment) => row[segment.key]);
    const n = raw.reduce((sum, value) => sum + value, 0);
    const shares = largestRemainder(raw, n);
    return { ...row, n, shares };
  });
  const peak = rows.reduce((max, row) => (row.n > max.n ? row : max), rows[0]!);
  const last = rows[rows.length - 1]!;

  const summary =
    `Gráfico de colunas empilhadas a 100% com o mix de origem de leads em ${String(rows.length)} meses. ` +
    `O volume varia de ${formatInt(Math.min(...rows.map((row) => row.n)))} a ${formatInt(peak.n)} leads por mês, ` +
    `com pico em ${formatMonthShort(peak.month)}. Em ${formatMonthShort(last.month)} mídia paga responde por ` +
    `${formatPercent((last.shares[0] ?? 0) / 100, 0)} do mix.`;

  const renderCount = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const isPeak = row.month === peak.month;
    return (
      <text
        className="font-display"
        fill={isPeak ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={11}
        fontWeight={isPeak ? 700 : 500}
        textAnchor="middle"
        x={Number(x) + Number(width) / 2}
        y={Number(y) - 6}
      >
        {`${formatInt(row.n)} leads`}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        {SEGMENTS.map((segment, i) => (
          <li className="flex items-center gap-1.5" key={segment.key}>
            <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: segment.color }} />
            {segment.label}
            <span className="kpi-number text-text-primary">{formatPercent((last.shares[i] ?? 0) / 100, 0)}</span>
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="35%" data={rows} margin={MARGIN} stackOffset="expand">
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              interval={0}
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              domain={[0, 1]}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickLine={false}
              tickMargin={8}
              ticks={[0, 0.5, 1]}
              width={44}
            />
            <Tooltip content={<ChartTooltip valueFormat="int" />} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {SEGMENTS.map((segment, i) => (
              <Bar
                dataKey={segment.key}
                fill={segment.color}
                isAnimationActive={animate}
                key={segment.key}
                maxBarSize={BAR_MAX}
                name={segment.label}
                radius={i === SEGMENTS.length - 1 ? [3, 3, 0, 0] : undefined}
                stackId="pilha"
                stroke={SEPARATOR_STROKE}
                strokeWidth={SEPARATOR_WIDTH}
              >
                {i === SEGMENTS.length - 1 ? <LabelList content={renderCount} dataKey="indicacao" /> : null}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
