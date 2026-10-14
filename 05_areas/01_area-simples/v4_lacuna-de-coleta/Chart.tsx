import { Filter } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
} from 'recharts';
import type { ReactElement } from 'react';

import { CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyLeads } from './data';

/**
 * Área semanal em que a lacuna de coleta quebra o traço e ganha uma faixa nomeada, para não ser
 * lida como zero, e o zero de fato medido continua desenhado e escrito.
 */
export interface WeeklyLeadsGapAreaProps {
  readonly data?: readonly WeeklyLeads[];
  readonly height?: number;
  readonly className?: string;
}

const AREA_FILL_OPACITY = 0.18;
const MARGIN = { top: 12, right: 12, bottom: 0, left: 0 } as const;
const Y_AXIS_WIDTH = 64;
const GRID_TARGET_COUNT = 4;

interface ValueTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly payload?: { readonly value?: number };
}

function computeNiceTicks(maxValue: number, targetCount = GRID_TARGET_COUNT): readonly number[] {
  if (maxValue <= 0) return [0, 1];
  const roughStep = maxValue / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const topTick = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= topTick + step / 2; value += step) {
    ticks.push(Math.round(value));
  }
  return ticks;
}

export default function WeeklyLeadsGapArea({ data = defaultData, height, className }: WeeklyLeadsGapAreaProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não houve entrada de lead registrada no período.</span>
      </div>
    );
  }

  const measured = data.filter((row): row is WeeklyLeads & { leads: number } => row.leads !== null);
  const maxValue = Math.max(0, ...measured.map((row) => row.leads));
  const ticks = computeNiceTicks(maxValue);
  const domainTop = ticks[ticks.length - 1] ?? maxValue;

  const gapWeeks = data.filter((row) => row.leads === null);
  const firstGap = gapWeeks[0];
  const lastGap = gapWeeks[gapWeeks.length - 1];
  const zeroWeeks = measured.filter((row) => row.leads === 0);

  const summary = [
    `Gráfico de área com entradas semanais de leads de ${formatMonthShort(data[0]?.week ?? '')} a ${formatMonthShort(data[data.length - 1]?.week ?? '')}.`,
    gapWeeks.length > 0 && firstGap && lastGap
      ? `${String(gapWeeks.length)} semanas sem coleta entre ${formatMonthShort(firstGap.week)} e ${formatMonthShort(lastGap.week)}, sem dado.`
      : '',
    zeroWeeks.length > 0
      ? `A semana de ${formatMonthShort(zeroWeeks[0]?.week ?? '')} foi medida e teve zero lead.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const reading =
    gapWeeks.length > 0 ? `${String(gapWeeks.length)} semanas sem coleta, distintas de semana com zero medido` : null;

  const renderValueTick = ({ x = 0, y = 0, payload }: ValueTickProps): ReactElement => {
    const value = payload?.value ?? 0;
    const label = value === domainTop ? `${formatInt(value)} leads` : formatInt(value);
    return (
      <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={Number(x)} y={Number(y)}>
        {label}
      </text>
    );
  };

  const renderZeroLabel = ({ x, y, value }: LabelProps): ReactElement | null => {
    if (Number(value) !== 0) return null;
    return (
      <text className="font-display" fill="var(--text-secondary)" fontSize={11} textAnchor="middle" x={Number(x)} y={Number(y) - 8}>
        0
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">{reading}</p> : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart accessibilityLayer={false} data={[...data]} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="week"
              interval={2}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={formatMonthShort}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              domain={[0, domainTop]}
              tick={renderValueTick}
              tickLine={false}
              ticks={[...ticks]}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="month" valueFormat="int" />}
              cursor={{ stroke: CURSOR_COLOR }}
              isAnimationActive={false}
            />
            {firstGap && lastGap ? (
              <ReferenceArea
                fill="var(--surface-sunken)"
                fillOpacity={1}
                ifOverflow="visible"
                label={{ value: 'sem coleta', position: 'insideTop', fill: 'var(--text-muted)', fontSize: 11 }}
                x1={firstGap.week}
                x2={lastGap.week}
              />
            ) : null}
            <Area
              connectNulls={false}
              dataKey="leads"
              dot={false}
              fill="var(--chart-1)"
              fillOpacity={AREA_FILL_OPACITY}
              isAnimationActive={animate}
              name="leads"
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="monotone"
            >
              <LabelList content={renderZeroLabel} dataKey="leads" />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
