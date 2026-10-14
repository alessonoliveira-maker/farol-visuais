import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyScheduleCapacity } from './data';

/**
 * Duas áreas da mesma unidade sem stackId, uma atrás da outra: a capacidade (fundo, contorno
 * forte e preenchimento leve em neutro) é o envelope, e o realizado (frente, chart-1, mais
 * saturado) é a parte contida nela. O rótulo de cada área fica dentro do próprio traçado, perto
 * do ponto de maior separação (capacidade) e do ponto de maior ocupação (realizado), para nomear
 * qual camada é qual sem legenda.
 */
export interface ScheduleCapacityAreaProps {
  readonly data?: readonly WeeklyScheduleCapacity[];
  readonly height?: number;
  readonly className?: string;
}

const CAPACITY_STROKE = 'var(--line-strong)';
const CAPACITY_FILL = 'var(--line-strong)';
const HELD_STROKE = 'var(--chart-1)';
const HELD_FILL = 'var(--chart-1)';
const MARGIN = { top: 20, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 40;
/** Halo obrigatório (ROT-7): o rótulo pode cair perto do traço em outro recorte de dado. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface DirectLabelProps {
  readonly x?: number | string;
  readonly y?: number | string;
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

export default function ScheduleCapacityArea({ data = defaultData, height, className }: ScheduleCapacityAreaProps) {
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
        <span>Nenhuma semana neste recorte: não há capacidade nem agendas medidas no período.</span>
      </div>
    );
  }

  const totalCapacity = data.reduce((sum, row) => sum + row.capacity, 0);
  const totalHeld = data.reduce((sum, row) => sum + row.held, 0);
  const occupancy = totalCapacity > 0 ? totalHeld / totalCapacity : 0;
  const gaps = data.map((row) => row.capacity - row.held);
  let gapIndex = 0;
  let fullIndex = 0;
  gaps.forEach((gap, i) => {
    const currentGap = gaps[gapIndex] ?? gap;
    const currentFull = gaps[fullIndex] ?? gap;
    if (gap > currentGap) gapIndex = i;
    if (gap < currentFull) fullIndex = i;
  });
  const first = data[0];
  const last = data[data.length - 1];
  const maxValue = Math.max(...data.map((row) => row.capacity));
  const ticks = computeNiceTicks(maxValue);
  const domainTop = ticks[ticks.length - 1] ?? maxValue;

  const summary = first && last
    ? `Duas áreas sobrepostas com capacidade de agendas ao fundo e realizadas à frente, ${formatInt(data.length)} semanas, de ${formatMonthShort(first.week)} a ${formatMonthShort(last.week)}. ` +
      `Ocupação média de ${formatPercent(occupancy)}. Semana de ${formatMonthShort(data[fullIndex]?.week ?? '')} chegou mais perto do teto.`
    : 'Duas áreas sobrepostas com capacidade semanal de agendas e agendas realizadas.';

  const renderCapacityLabel = ({ x, y, index }: DirectLabelProps): ReactElement | null => {
    if (index !== gapIndex || x === undefined || y === undefined) return null;
    const row = data[index];
    if (!row) return null;
    return (
      <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={600} style={HALO} textAnchor="middle" x={x} y={Number(y) - 10}>
        {`Capacidade ${formatInt(row.capacity)}`}
      </text>
    );
  };

  const renderHeldLabel = ({ x, y, index }: DirectLabelProps): ReactElement | null => {
    if (index !== fullIndex || x === undefined || y === undefined) return null;
    const row = data[index];
    if (!row) return null;
    return (
      <text className="font-display" fill="var(--text-primary)" fontSize={11} fontWeight={700} style={HALO} textAnchor="middle" x={x} y={Number(y) + 14}>
        {`Realizado ${formatInt(row.held)}`}
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
        Ocupação média:{' '}
        <span className="kpi-number font-semibold text-text-primary">{formatPercent(occupancy)}</span>
        {' · '}realizado (frente) sobre capacidade (fundo), {formatInt(data.length)} semanas
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart accessibilityLayer={false} data={data} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="week"
              interval={4}
              tickFormatter={formatMonthShort}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, domainTop]} tick={renderValueTick} tickLine={false} ticks={[...ticks]} width={VALUE_AXIS_WIDTH} />
            <Tooltip
              content={<ChartTooltip labelFormat="date" valueFormat="int" />}
              cursor={{ stroke: 'var(--line-subtle)' }}
              isAnimationActive={false}
            />
            <Area
              dataKey="capacity"
              fill={CAPACITY_FILL}
              fillOpacity={0.14}
              isAnimationActive={animate}
              name="Capacidade"
              stroke={CAPACITY_STROKE}
              strokeWidth={1.5}
              type="monotone"
            >
              <LabelList content={renderCapacityLabel} dataKey="capacity" />
            </Area>
            <Area
              dataKey="held"
              fill={HELD_FILL}
              fillOpacity={0.55}
              isAnimationActive={animate}
              name="Realizado"
              stroke={HELD_STROKE}
              strokeWidth={2}
              type="monotone"
            >
              <LabelList content={renderHeldLabel} dataKey="held" />
            </Area>
            <ReferenceLine stroke="var(--line-strong)" strokeWidth={1} y={0} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
