import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps,
  type LabelProps,
} from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyRevenue } from './data';

/** Linha simples de receita reconhecida mensal, com o mês faltante liberado e rótulo só no fim. */
export interface RevenueLineProps {
  readonly data?: readonly MonthlyRevenue[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 20, right: 80, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 56;
const TICK_COUNT = 4;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Próximo mês em `YYYY-MM`, sem depender de `Date`. */
function nextMonth(month: string): string {
  const [yearText, monthText] = month.split('-');
  const year = Number(yearText);
  const monthNumber = Number(monthText);
  return monthNumber === 12 ? `${String(year + 1)}-01` : `${String(year)}-${String(monthNumber + 1).padStart(2, '0')}`;
}

/** Calendário mensal completo entre o primeiro e o último mês do dado, com `null` onde falta. */
function buildCalendar(rows: readonly MonthlyRevenue[]): readonly MonthlyRevenue[] {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) return [];
  const byMonth = new Map(rows.map((row) => [row.month, row.revenue]));
  const months: MonthlyRevenue[] = [];
  let cursor = first.month;
  for (let guard = 0; guard < 240; guard += 1) {
    months.push({ month: cursor, revenue: byMonth.get(cursor) ?? null });
    if (cursor === last.month) break;
    cursor = nextMonth(cursor);
  }
  return months;
}

/** Teto de eixo arredondado para 3 a 5 linhas de grade em passo redondo. */
function niceCeiling(max: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(max, 1)));
  const residual = max / magnitude;
  const step = residual <= 2 ? 0.5 : residual <= 5 ? 1 : 2;
  return Math.ceil(max / (step * magnitude)) * step * magnitude;
}

export default function RevenueLine({ data = defaultData, height, className }: RevenueLineProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = buildCalendar(data);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita reconhecida para desenhar.</span>
      </div>
    );
  }

  const validRows = rows.filter((row): row is MonthlyRevenue & { revenue: number } => row.revenue !== null);
  const lastValidIndex = rows.reduce((found, row, index) => (row.revenue !== null ? index : found), -1);
  const lastValid = validRows.length > 0 ? validRows[validRows.length - 1] : undefined;
  const ceiling = niceCeiling(Math.max(1, ...validRows.map((row) => row.revenue)));
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (ceiling / TICK_COUNT) * i);
  const first = rows[0];

  const summary = [
    first && lastValid
      ? `Gráfico de linha com a receita reconhecida mensal de ${formatMonthShort(first.month)} a ${formatMonthShort(lastValid.month)}.`
      : 'Gráfico de linha com a receita reconhecida mensal.',
    lastValid ? `Fechou ${formatMonthShort(lastValid.month)} em ${formatCurrencyCompact(lastValid.revenue)}, o maior valor do período.` : 'Sem mês com receita medida.',
  ]
    .filter(Boolean)
    .join(' ');

  const renderEndDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null =>
    index === lastValidIndex && cx !== undefined && cy !== undefined ? (
      <circle cx={cx} cy={cy} fill="var(--chart-1)" key="end-dot" r={4} stroke="var(--surface-raised)" strokeWidth={1.5} />
    ) : null;

  const renderEndLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index !== lastValidIndex || !lastValid) return null;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-primary)"
        fontSize={12}
        fontWeight={700}
        style={HALO}
        textAnchor="start"
        x={Number(x) + 10}
        y={Number(y)}
      >
        {formatCurrencyCompact(lastValid.revenue)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <ResponsiveContainer height="100%" width="100%">
        <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
          <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, ceiling]} tickFormatter={formatCurrencyAxis} ticks={ticks} width={VALUE_AXIS_WIDTH} />
          <Tooltip
            content={<ChartTooltip labelFormat="month" valueFormat="currencyCompact" />}
            cursor={{ stroke: CURSOR_COLOR }}
            isAnimationActive={false}
          />
          <Line
            activeDot={{ r: 4 }}
            connectNulls={false}
            dataKey="revenue"
            dot={renderEndDot}
            isAnimationActive={animate}
            stroke="var(--chart-1)"
            strokeWidth={2}
            type="linear"
          >
            <LabelList content={renderEndLabel} dataKey="revenue" />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
