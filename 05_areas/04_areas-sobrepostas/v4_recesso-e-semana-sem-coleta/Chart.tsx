import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyScheduleGap } from './data';

/**
 * Duas áreas sobrepostas, capacidade ao fundo e realizado à frente, com duas ausências que não
 * podem virar a mesma coisa: recesso é capacidade e realizado zero medido (EST-3, a marca é
 * desenhada e escreve 0), e semana sem coleta é o realizado em `null` (EIX-10, quebra a área em
 * vez de virar zero). Cada uma leva sua própria `ReferenceArea`, no máximo duas por visual (ANO-1).
 */
export interface ScheduleGapAreaProps {
  readonly data?: readonly WeeklyScheduleGap[];
  readonly height?: number;
  readonly className?: string;
}

const CAPACITY_FILL = 'var(--line-strong)';
const CAPACITY_STROKE = 'var(--line-strong)';
const HELD_STROKE = 'var(--chart-1)';
const HELD_FILL = 'var(--chart-1)';
const MARGIN = { top: 20, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 40;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface ZeroLabelProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly index?: number;
}

interface ValueTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly payload?: { readonly value?: number };
}

/** Grade em intervalo redondo (EIX-4): nunca o topo cru de 'dataMax'. */
function computeNiceTicks(maxValue: number, targetCount = 4): readonly number[] {
  if (maxValue <= 0) return [0, 1];
  const roughStep = maxValue / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const topTick = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= topTick + step / 2; value += step) ticks.push(Math.round(value));
  return ticks;
}

export default function ScheduleGapArea({ data = defaultData, height, className }: ScheduleGapAreaProps) {
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
        <span>Nenhuma semana neste recorte: não há capacidade nem realizado medidos no período.</span>
      </div>
    );
  }

  const recessIndex = data.findIndex((row) => row.capacity === 0);
  const gapIndex = data.findIndex((row) => row.held === null);
  const recessRow = recessIndex === -1 ? undefined : data[recessIndex];
  const gapRow = gapIndex === -1 ? undefined : data[gapIndex];
  const maxValue = Math.max(...data.map((row) => Math.max(row.capacity, row.held ?? 0)));
  const ticks = computeNiceTicks(maxValue);
  const domainTop = ticks[ticks.length - 1] ?? maxValue;

  const summary = [
    `Duas áreas sobrepostas com capacidade ao fundo e realizado à frente, ${formatInt(data.length)} semanas.`,
    recessRow ? `Recesso em ${formatDate(recessRow.week)}: as duas em zero medido.` : '',
    gapRow ? `Sem coleta em ${formatDate(gapRow.week)}: realizado não registrado.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderZeroLabel = ({ cx, cy, index }: ZeroLabelProps): ReactElement | null => {
    if (index !== recessIndex || cx === undefined || cy === undefined) return null;
    return (
      <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={600} key="zero-label" style={HALO} textAnchor="middle" x={cx} y={cy - 10}>
        0
      </text>
    );
  };

  const renderValueTick = ({ x = 0, y = 0, payload }: ValueTickProps): ReactElement => (
    <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={Number(x)} y={Number(y)}>
      {formatInt(payload?.value ?? 0)}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Capacidade (fundo) e realizado (frente){gapRow ? `; sem coleta em ${formatMonthShort(gapRow.week)}: ${formatUnavailable()}` : ''}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={data} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="week"
              interval={1}
              tickFormatter={(value: string) => formatDate(value).slice(0, 5)}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, domainTop]} tick={renderValueTick} tickLine={false} ticks={[...ticks]} width={VALUE_AXIS_WIDTH} />
            <Tooltip
              content={<ChartTooltip labelFormat="date" valueFormat="int" />}
              cursor={{ stroke: 'var(--line-subtle)' }}
              isAnimationActive={false}
            />
            {recessRow ? (
              <ReferenceArea
                fill="var(--surface-sunken)"
                fillOpacity={1}
                ifOverflow="extendDomain"
                label={{ value: 'recesso', fill: 'var(--text-muted)', fontSize: 11, position: 'insideTop' }}
                x1={recessRow.week}
                x2={recessRow.week}
              />
            ) : null}
            {gapRow ? (
              <ReferenceArea
                fill="var(--surface-sunken)"
                fillOpacity={1}
                ifOverflow="extendDomain"
                label={{ value: 'sem coleta', fill: 'var(--text-muted)', fontSize: 11, position: 'insideTop' }}
                stroke="var(--text-muted)"
                strokeDasharray="3 3"
                x1={gapRow.week}
                x2={gapRow.week}
              />
            ) : null}
            {/* O 0 do recesso já aparece na própria linha: a marca desce ao chão em vez de sumir (EST-3). */}
            <Area
              connectNulls={false}
              dataKey="capacity"
              fill={CAPACITY_FILL}
              fillOpacity={0.14}
              isAnimationActive={animate}
              name="Capacidade"
              stroke={CAPACITY_STROKE}
              strokeWidth={1.5}
              type="stepAfter"
            />
            <Area
              connectNulls={false}
              dataKey="held"
              dot={renderZeroLabel}
              fill={HELD_FILL}
              fillOpacity={0.55}
              isAnimationActive={animate}
              name="Realizado"
              stroke={HELD_STROKE}
              strokeWidth={2}
              type="stepAfter"
            />
            <ReferenceLine stroke="var(--line-strong)" strokeWidth={1} y={0} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
