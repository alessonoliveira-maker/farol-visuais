import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyLeads } from './data';

/** Uma coluna por mês, nascendo do zero, com o mês de pico e o último mês rotulados. */
export interface MonthlyColumnsProps {
  readonly data?: readonly MonthlyLeads[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 24, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 34;
const BAR_CATEGORY_GAP = '30%';
/**
 * ESP-6, série única: passo = disponível / categorias; espessura = passo × (1 − 2 × 0,30).
 * Corpo do cartão ≈ 574 px; disponível ≈ 574 − 34 (eixo) − 8 (margem) = 532; passo ≈ 44,3;
 * espessura ≈ 44,3 × 0,4 ≈ 17,7 px. maxBarSize fecha nesse valor, não num redondo arbitrário.
 */
const BAR_MAX = 18;
const GAP_MARK_HEIGHT = 10;
const VALUE_LABEL_GAP = 6;

interface FilledMonth {
  readonly month: string;
  readonly leads: number | null;
}

interface BarShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: FilledMonth;
}

/**
 * Reconstrói a sequência de meses do primeiro ao último do calendário, não do `rows.length`:
 * com um mês ausente na origem, `rows.length` é menor que o número real de meses do recorte e a
 * antiga contagem por índice perdia o último mês. Mês sem dado vira `leads: null`, nunca zero.
 */
function fillMonths(rows: readonly MonthlyLeads[]): readonly FilledMonth[] {
  if (rows.length === 0) return [];
  const byMonth = new Map(rows.map((row) => [row.month, row]));
  const [year0, month0] = rows[0]!.month.split('-').map(Number) as [number, number];
  const [year1, month1] = rows[rows.length - 1]!.month.split('-').map(Number) as [number, number];
  const span = (year1 - year0) * 12 + (month1 - month0) + 1;
  return Array.from({ length: span }, (_, i) => {
    const cursor = new Date(Date.UTC(year0, month0 - 1 + i, 1));
    const key = `${String(cursor.getUTCFullYear())}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`;
    const found = byMonth.get(key);
    return { month: key, leads: found ? found.leads : null };
  });
}

export default function MonthlyColumns({ data = defaultData, height, className }: MonthlyColumnsProps) {
  const animate = useAnimateOnce();
  const rows = fillMonths(data);
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não houve entrada de leads registrada no período.</span>
      </div>
    );
  }

  const peakIndex = rows.reduce<number>((best, row, i) => {
    if (row.leads === null) return best;
    return best === -1 || row.leads > (rows[best]?.leads ?? -1) ? i : best;
  }, -1);
  const lastIndex = rows.length - 1;
  const peak = peakIndex >= 0 ? rows[peakIndex] : undefined;
  const last = rows[lastIndex];
  const peakMonth = peak ? formatMonthShort(peak.month) : '';
  const lastMonth = last ? formatMonthShort(last.month) : '';

  const summary = [
    `Gráfico de colunas com o total de leads em cada um dos últimos ${formatInt(rows.length)} meses.`,
    peak ? `Pico em ${peakMonth}, com ${formatInt(peak.leads ?? 0)} leads.` : '',
    last && lastIndex !== peakIndex
      ? last.leads === null
        ? `Último mês do recorte, ${lastMonth}, sem coleta.`
        : `Último mês registrado, ${lastMonth}, com ${formatInt(last.leads)} leads.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderBar = ({ x = 0, y = 0, width = 0, height: barHeight = 0, payload }: BarShapeProps): ReactElement | null => {
    if (!payload) return null;
    if (payload.leads === null) {
      return (
        <rect fill="none" height={GAP_MARK_HEIGHT} rx={2} stroke="var(--text-muted)" strokeDasharray="2 2" width={width} x={x} y={y + barHeight - GAP_MARK_HEIGHT} />
      );
    }
    return <rect fill="var(--chart-1)" height={barHeight} rx={3} width={width} x={x} y={y} />;
  };

  const renderValue = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    if (index === undefined || (index !== peakIndex && index !== lastIndex)) return null;
    const row = rows[index];
    if (!row) return null;
    const cx = Number(x) + Number(width) / 2;
    if (row.leads === null) {
      return (
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={Number(y) - VALUE_LABEL_GAP}>
          {formatUnavailable()}
        </text>
      );
    }
    const isPeak = index === peakIndex;
    return (
      <text
        className="font-display"
        fill={isPeak ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={isPeak ? 700 : 500}
        textAnchor="middle"
        x={cx}
        y={Number(y) - VALUE_LABEL_GAP}
      >
        {formatInt(row.leads)}
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    if (!props.active || !props.payload) return null;
    const monthKey = typeof props.label === 'string' ? props.label : '';
    const row = rows.find((item) => item.month === monthKey);
    const payload = props.payload.map((entry) => ({
      ...entry,
      name: typeof entry.name === 'string' ? entry.name : String(entry.name ?? ''),
      value: row?.leads === null ? formatUnavailable() : typeof entry.value === 'number' || typeof entry.value === 'string' ? entry.value : String(entry.value ?? ''),
    }));
    return <ChartTooltip active={props.active} label={monthKey} labelFormat="month" payload={payload} valueFormat="int" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {peak ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
          Pico em <span className="font-semibold text-text-primary">{peakMonth}</span>, com{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(peak.leads ?? 0)}</span> leads
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} allowDecimals={false} axisLine={false} domain={[0, 'dataMax']} tickCount={4} tickFormatter={formatInt} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey={(row: FilledMonth) => row.leads ?? 0}
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              minPointSize={(_value, index) => (rows[index]?.leads === null ? GAP_MARK_HEIGHT : 0)}
              shape={renderBar}
            >
              <LabelList content={renderValue} dataKey="leads" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
