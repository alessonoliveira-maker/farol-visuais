import { Filter } from 'lucide-react';
import { useId, type ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatDate, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { asOfDate as defaultAsOfDate, currentMonth as defaultCurrentMonth, data as defaultData, type MonthlyRevenueForecastGoal } from './data';

/** Receita reconhecida por mês, com o previsto restante hachurado e a meta em traço por coluna. */
export interface RevenueForecastGoalProps {
  readonly data?: readonly MonthlyRevenueForecastGoal[];
  readonly currentMonth?: string;
  readonly asOfDate?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Largo ≈ 960 × 400 px, corpo ≈ 894 × 274 px (seção 13). Eixo de moeda 56 px (rótulo "R$ 750 mil"
 * numa linha só). Margem de topo maior porque o traço de meta precisa de espaço acima da coluna
 * mais alta do mês corrente.
 */
const MARGIN = { top: 20, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 56;
const BAR_CATEGORY_GAP = '34%';
/**
 * ESP-6, realizado e previstoRestante empilhados contam como uma série (sem `barGap` entre os
 * dois): disponível ≈ 894 − 56 − 8 = 830; passo ≈ 830 / 12 ≈ 69,2; espessura ≈ 69,2 × 0,32 ≈
 * 22,1 px. Acima do piso de 12 px; sem rótulo desenhado dentro da marca.
 */
const BAR_MAX = 22;
const TICK_STEP = 200_000;
const VALUE_LABEL_GAP = 6;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface Row extends MonthlyRevenueForecastGoal {
  readonly previstoRestante: number;
  readonly realizadoLabel: string;
}

interface GhostShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
}

interface TextLabelProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly width?: number | string;
  readonly value?: unknown;
}

function niceCeiling(max: number, step: number): number {
  return Math.max(step, Math.ceil(max / step) * step);
}

export default function RevenueForecastGoal({
  data = defaultData,
  currentMonth = defaultCurrentMonth,
  asOfDate = defaultAsOfDate,
  height,
  className,
}: RevenueForecastGoalProps) {
  const animate = useAnimateOnce();
  const patternId = useId();
  const style = height === undefined ? undefined : { height };
  const rows = [...data];

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita reconhecida nem previsão para o período.</span>
      </div>
    );
  }

  const closedRows = rows.filter((row) => row.forecast === null);
  const peakClosed = closedRows.reduce((max, row) => (row.realizado > max.realizado ? row : max), closedRows[0] ?? rows[0]!);
  const lastClosed = closedRows[closedRows.length - 1];
  const current = rows.find((row) => row.month === currentMonth);

  const withRestante: readonly Row[] = rows.map((row) => {
    const previstoRestante = row.forecast === null ? 0 : Math.max(0, row.forecast - row.realizado);
    const isLabeled = row.forecast === null && (row.month === peakClosed?.month || row.month === lastClosed?.month);
    return { ...row, previstoRestante, realizadoLabel: isLabeled ? formatCurrencyCompact(row.realizado) : '' };
  });

  const totalRealizado = rows.reduce((sum, row) => sum + row.realizado, 0);
  const totalPrevisto = withRestante.reduce((sum, row) => sum + row.previstoRestante, 0);
  const ceiling = niceCeiling(Math.max(...withRestante.map((row) => Math.max(row.realizado + row.previstoRestante, row.meta))), TICK_STEP);
  const ticks = Array.from({ length: 5 }, (_, i) => (ceiling / 4) * i);

  const currentTotal = current ? current.realizado + Math.max(0, (current.forecast ?? 0) - current.realizado) : 0;
  const currentGap = current ? currentTotal - current.meta : 0;
  const gapText = current
    ? currentGap >= 0
      ? `${formatCurrencyCompact(currentGap)} acima da meta`
      : `faltam ${formatCurrencyCompact(Math.abs(currentGap))} para a meta`
    : '';

  const summary = [
    `Gráfico de colunas com a receita reconhecida de ${String(rows.length)} meses, previsto restante em hachura e a meta em traço por coluna.`,
    `Realizado ${formatCurrencyCompact(totalRealizado)} até ${formatDate(asOfDate)}; previsto ${formatCurrencyCompact(totalPrevisto)}, sem somar.`,
    current ? `Em ${formatMonthShort(current.month)} ${gapText}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderRestante = ({ x = 0, y = 0, width = 0, height: barHeight = 0, payload }: { readonly x?: number; readonly y?: number; readonly width?: number; readonly height?: number; readonly payload?: Row }): ReactElement | null => {
    if (!payload || payload.previstoRestante <= 0) return null;
    return <rect fill={`url(#${patternId})`} height={Math.max(barHeight, 1)} rx={2} stroke="var(--chart-1)" strokeWidth={1} width={width} x={x} y={y} />;
  };

  const renderMetaTick = ({ x = 0, y = 0, width = 0 }: GhostShapeProps): ReactElement => (
    <g>
      <line stroke="var(--surface-raised)" strokeWidth={4} x1={x} x2={x + width} y1={y} y2={y} />
      <line stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1.5} x1={x} x2={x + width} y1={y} y2={y} />
    </g>
  );

  const renderRealizadoLabel = ({ x, y, width, value }: TextLabelProps): ReactElement | null => {
    if (!value) return null;
    return (
      <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="middle" x={Number(x) + Number(width) / 2} y={Number(y) - VALUE_LABEL_GAP}>
        {String(value)}
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const month = typeof props.label === 'string' ? props.label : '';
    const row = withRestante.find((entry) => entry.month === month);
    const [first] = props.payload ?? [];
    if (!props.active || !first || !row) return null;
    const entries = [
      { ...first, color: 'var(--chart-1)', name: 'Realizado', value: row.realizado },
      ...(row.forecast === null ? [] : [{ ...first, color: 'var(--chart-1)', name: 'Previsto restante', value: row.previstoRestante }]),
      { ...first, color: 'var(--text-muted)', name: 'Meta', value: row.meta },
    ];
    return <ChartTooltip active={props.active} label={month} labelFormat="month" payload={entries} valueFormat="currencyCompact" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 shrink-0 rounded-[2px] bg-chart-1" />
          realizado
        </span>
        <span className="flex items-center gap-1.5">
          <svg aria-hidden className="size-3 shrink-0" viewBox="0 0 12 12">
            <rect fill="none" height={11} rx={2} stroke="var(--chart-1)" strokeWidth={1} width={11} x={0.5} y={0.5} />
            <line stroke="var(--chart-1)" strokeOpacity={0.55} strokeWidth={1} x1={2} x2={5} y1={11} y2={0} />
            <line stroke="var(--chart-1)" strokeOpacity={0.55} strokeWidth={1} x1={7} x2={10} y1={11} y2={0} />
          </svg>
          previsto
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-0 w-3 shrink-0 border-t border-dashed border-line-strong" />
          meta
        </span>
        <span className="ml-auto">
          <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(totalRealizado)}</span> realizado ·{' '}
          <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(totalPrevisto)}</span> previsto
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={withRestante} margin={MARGIN}>
            <defs>
              <pattern height={6} id={patternId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={6}>
                <rect fill="var(--surface-raised)" height={6} width={6} />
                <line stroke="var(--chart-1)" strokeOpacity={0.55} strokeWidth={1.5} x1={0} x2={0} y1={0} y2={6} />
              </pattern>
            </defs>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" tickFormatter={formatMonthShort} tickMargin={8} xAxisId="cols" />
            <XAxis dataKey="month" hide xAxisId="meta" />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, ceiling]} tickFormatter={formatCurrencyAxis} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="realizado" fill="var(--chart-1)" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[2, 2, 0, 0]} stackId="month" xAxisId="cols">
              <LabelList content={renderRealizadoLabel} dataKey="realizadoLabel" />
            </Bar>
            <Bar dataKey="previstoRestante" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderRestante} stackId="month" xAxisId="cols" />
            <Bar dataKey="meta" isAnimationActive={false} maxBarSize={BAR_MAX} shape={renderMetaTick} xAxisId="meta" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {current ? (
        <p aria-hidden className="mt-1 shrink-0 truncate text-xs text-text-muted">
          {formatMonthShort(current.month)}: realizado mais previsto{' '}
          <span className={cn('kpi-number font-medium', currentGap >= 0 ? 'text-positive' : 'text-negative')}>{gapText}</span>
        </p>
      ) : null}
    </div>
  );
}
