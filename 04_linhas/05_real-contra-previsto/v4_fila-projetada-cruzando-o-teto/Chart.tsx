import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
} from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  capacityCeiling as defaultCapacityCeiling,
  cutoffWeek as defaultCutoffWeek,
  data as defaultData,
  queueMethod as defaultQueueMethod,
  type WeeklyQueueForecast,
} from './data';

/**
 * Fila semanal projetada contra o teto de capacidade: trecho sólido até o corte, tracejado na
 * projeção, com a semana de cruzamento estimada por interpolação linear em TypeScript.
 */
export interface QueueVsCeilingLineProps {
  readonly data?: readonly WeeklyQueueForecast[];
  readonly cutoffWeek?: string;
  readonly capacityCeiling?: number;
  readonly queueMethod?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 26, right: 16, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 40;
const TICK_COUNT = 4;
/** Teto de tiques do eixo de categoria do Farol (EIX-7); acima disso, os rótulos afinam. */
const CATEGORY_TICK_LIMIT = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;
const MS_PER_DAY = 86_400_000;

/** Teto de eixo em passo redondo, sempre acima do maior valor (EIX-4). */
function niceCeiling(max: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(max, 1)));
  const residual = max / magnitude;
  const step = residual <= 2 ? 0.5 : residual <= 5 ? 1 : 2;
  const ceiling = Math.ceil(max / (step * magnitude)) * step * magnitude;
  return ceiling <= max ? ceiling + step * magnitude : ceiling;
}

/** `YYYY-MM-DD` para número de dias, sem depender do relógio (argumento sempre explícito). */
function toDayNumber(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1) / MS_PER_DAY;
}

/** Número de dias de volta para `YYYY-MM-DD`, sem depender do relógio (argumento sempre explícito). */
function fromDayNumber(day: number): string {
  const date = new Date(day * MS_PER_DAY);
  const y = String(date.getUTCFullYear());
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Semana estimada do cruzamento com o teto, por interpolação linear entre os dois pontos que o cercam. */
function findCrossing(rows: readonly WeeklyQueueForecast[], ceiling: number): string | null {
  for (let i = 0; i < rows.length - 1; i += 1) {
    const a = rows[i];
    const b = rows[i + 1];
    if (a?.projected == null || b?.projected == null) continue;
    if (a.projected <= ceiling && b.projected > ceiling) {
      const fraction = (ceiling - a.projected) / (b.projected - a.projected);
      const dayA = toDayNumber(a.week);
      const dayB = toDayNumber(b.week);
      return fromDayNumber(dayA + fraction * (dayB - dayA));
    }
  }
  return null;
}

export default function QueueVsCeilingLine({
  data = defaultData,
  cutoffWeek = defaultCutoffWeek,
  capacityCeiling = defaultCapacityCeiling,
  queueMethod = defaultQueueMethod,
  height,
  className,
}: QueueVsCeilingLineProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = data;

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não há fila nem projeção para desenhar.</span>
      </div>
    );
  }

  const lastRealIndex = rows.reduce((found, row, index) => (row.real !== null ? index : found), -1);
  const crossing = findCrossing(rows, capacityCeiling);
  const crossingDay = crossing === null ? null : toDayNumber(crossing);
  const allValues = rows.flatMap((row) => [row.real, row.projected]).filter((value): value is number => value !== null);
  const ceiling = niceCeiling(Math.max(1, capacityCeiling, ...allValues));
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (ceiling / TICK_COUNT) * i);
  const tickInterval = rows.length > CATEGORY_TICK_LIMIT ? Math.ceil(rows.length / CATEGORY_TICK_LIMIT) - 1 : 0;
  /** Semana em número de dias: o eixo precisa de escala numérica para posicionar a semana de
   * cruzamento, que cai entre duas semanas medidas e não existe como categoria (EIX, README da
   * família, regra 1). */
  const chartRows = rows.map((row) => ({ ...row, day: toDayNumber(row.week) }));
  const dayTicks = chartRows.filter((_, index) => index % (tickInterval + 1) === 0).map((row) => row.day);

  const summary = [
    `Gráfico de linha com a fila semanal de primeiro contato, sólida até o corte e tracejada na projeção, contra um teto de ${formatInt(capacityCeiling)}.`,
    crossing ? `Cruza o teto na semana de ${formatDate(crossing)}.` : 'Não cruza o teto no horizonte projetado.',
  ]
    .filter(Boolean)
    .join(' ');

  const renderCeilingLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly width?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0)} y={MARGIN.top - 10}>
      teto <tspan className="font-display">{formatInt(capacityCeiling)}</tspan>
    </text>
  );

  const renderCrossingLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--negative)" fontSize={11} textAnchor="middle" x={viewBox?.x ?? 0} y={12}>
      cruza <tspan className="font-display">{formatDate(crossing ?? '')}</tspan>
    </text>
  );

  const renderRealLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index !== lastRealIndex) return null;
    const row = rows[lastRealIndex];
    if (!row) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} textAnchor="middle" x={Number(x)} y={Number(y) - 14}>
        {formatInt(row.real ?? 0)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {queueMethod}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={chartRows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="day" domain={['dataMin', 'dataMax']} scale="linear" tickFormatter={(day: number) => formatDate(fromDayNumber(day))} tickMargin={8} ticks={dayTicks} type="number" />
            <YAxis {...AXIS_PROPS} allowDecimals={false} axisLine={false} domain={[0, ceiling]} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Tooltip
              content={({ active, label, payload }) => {
                const weekLabel = typeof label === 'number' ? fromDayNumber(label) : '';
                const isCutoff = weekLabel === cutoffWeek;
                const filtered = isCutoff ? payload?.filter((entry) => entry.dataKey !== 'projected') : payload;
                return <ChartTooltip active={active} label={weekLabel} labelFormat="date" payload={filtered} valueFormat="int" />;
              }}
              cursor={{ stroke: CURSOR_COLOR }}
              isAnimationActive={false}
            />
            <Line connectNulls={false} dataKey="real" isAnimationActive={animate} name="Real" stroke="var(--chart-1)" strokeWidth={2} type="linear">
              <LabelList content={renderRealLabel} dataKey="real" />
            </Line>
            <Line connectNulls={false} dataKey="projected" isAnimationActive={animate} name="Projetado" stroke="var(--chart-1)" strokeDasharray="4 4" strokeWidth={2} type="linear" />
            <ReferenceLine ifOverflow="extendDomain" label={renderCeilingLabel} stroke="var(--negative)" strokeDasharray="3 3" strokeWidth={1} y={capacityCeiling} />
            {crossingDay === null ? null : (
              <ReferenceLine ifOverflow="extendDomain" label={renderCrossingLabel} stroke="var(--line-strong)" strokeDasharray="3 3" strokeWidth={1} x={crossingDay} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
