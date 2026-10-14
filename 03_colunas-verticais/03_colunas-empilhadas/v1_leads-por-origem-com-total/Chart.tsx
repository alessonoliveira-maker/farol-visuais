import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyOriginLeads } from './data';

/** Colunas empilhadas por mês, uma por origem, com o total escrito acima de cada uma. */
export interface StackedOriginColumnsProps {
  readonly data?: readonly MonthlyOriginLeads[];
  readonly height?: number;
  readonly className?: string;
}

interface Segment {
  readonly key: 'indicacao' | 'organico' | 'pago';
  readonly label: string;
  readonly color: string;
}

/** Base ao topo: o componente que o leitor mais precisa acompanhar fica na base da pilha. */
const SEGMENTS: readonly Segment[] = [
  { key: 'indicacao', label: 'Indicação', color: 'var(--chart-1)' },
  { key: 'organico', label: 'Orgânico', color: 'var(--chart-3)' },
  { key: 'pago', label: 'Mídia paga', color: 'var(--chart-6)' },
];
const MARGIN = { top: 24, right: 4, bottom: 0, left: 0 } as const;
const BAR_MAX = 40;
const SEPARATOR_STROKE = 'var(--surface-raised)';
const SEPARATOR_WIDTH = 1.5;

export default function StackedOriginColumns({ data = defaultData, height, className }: StackedOriginColumnsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não houve leads no período.
      </div>
    );
  }

  const rows = data.map((row) => ({ ...row, total: row.indicacao + row.organico + row.pago }));
  const peak = rows.reduce((max, row) => (row.total > max.total ? row : max), rows[0]!);
  const totalGeral = rows.reduce((sum, row) => sum + row.total, 0);

  const summary =
    `Gráfico de colunas empilhadas com leads de ${String(rows.length)} meses em três origens: indicação, ` +
    `orgânico e mídia paga. O total do período é ${formatInt(totalGeral)} leads, com pico em ` +
    `${formatMonthShort(peak.month)}, ${formatInt(peak.total)} leads.`;

  const renderTotal = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const isPeak = row.month === peak.month;
    return (
      <text
        className="font-display"
        fill={isPeak ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={isPeak ? 700 : 500}
        textAnchor="middle"
        x={Number(x) + Number(width) / 2}
        y={Number(y) - 6}
      >
        {formatInt(row.total)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        {[...SEGMENTS].reverse().map((segment) => (
          <li className="flex items-center gap-1.5" key={segment.key}>
            <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: segment.color }} />
            {segment.label}
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="35%" data={rows} margin={MARGIN}>
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
            <YAxis allowDecimals={false} axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} tickMargin={8} width={40} />
            <Tooltip content={<ChartTooltip showTotal valueFormat="int" />} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
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
                {i === SEGMENTS.length - 1 ? <LabelList content={renderTotal} dataKey="total" /> : null}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
