import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { asOfWeek as defaultAsOfWeek, data as defaultData, type WeeklyCapacityForecast } from './data';

/**
 * Capacidade planejada até dezembro, já aprovada, em Area de fundo; demanda real sólida até hoje
 * e demanda projetada tracejada depois, na mesma Line, com uma linha vertical marcando a semana
 * de corte. A projeção não leva selo de premissa aqui: isso é do VisualCard (ANO-6), o Chart só
 * desenha o traço tracejado e nomeia o trecho na linha de leitura.
 */
export interface CapacityForecastComposedProps {
  readonly data?: readonly WeeklyCapacityForecast[];
  readonly asOfWeek?: string;
  readonly height?: number;
  readonly className?: string;
}

const CAPACITY_FILL = 'var(--line-strong)';
const CAPACITY_STROKE = 'var(--line-strong)';
const DEMAND_STROKE = 'var(--chart-1)';
const MARGIN = { top: 22, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 40;
const TICK_INTERVAL = 4;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface CutLabelProps {
  readonly viewBox?: { readonly x?: number };
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

export default function CapacityForecastComposed({
  data = defaultData,
  asOfWeek = defaultAsOfWeek,
  height,
  className,
}: CapacityForecastComposedProps) {
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
        <span>Nenhuma semana neste recorte: não há capacidade nem demanda medidas ou projetadas.</span>
      </div>
    );
  }

  const cutIndex = data.reduce((last, row, i) => (row.demandReal !== null ? i : last), 0);
  const rows = data.map((row, i) => ({
    week: row.week,
    capacity: row.capacity,
    real: i <= cutIndex ? row.demandReal : null,
    projected: i === cutIndex ? row.demandReal : i > cutIndex ? row.demandProjected : null,
  }));
  const cutRow = data[cutIndex];
  const lastRow = data[data.length - 1];
  const yearEndAboveCapacity = lastRow && lastRow.demandProjected !== null ? lastRow.demandProjected > lastRow.capacity : false;
  const maxValue = Math.max(...data.map((row) => Math.max(row.capacity, row.demandReal ?? 0, row.demandProjected ?? 0)));
  const ticks = computeNiceTicks(maxValue);
  const domainTop = ticks[ticks.length - 1] ?? maxValue;

  const summary = cutRow && lastRow
    ? `Área de capacidade planejada e linha de demanda por semana, jan a dez de 2026, sólida até ${formatDate(asOfWeek)} e projetada e tracejada depois. ` +
      `Demanda medida em ${formatDate(asOfWeek)}: ${formatInt(cutRow.demandReal ?? 0)}. ` +
      (yearEndAboveCapacity ? `A projeção de fim de ano passa o teto.` : `A projeção de fim de ano segue dentro do teto.`)
    : 'Área de capacidade planejada e linha de demanda real e projetada.';

  const renderCutLabel = ({ viewBox }: CutLabelProps): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={viewBox?.x ?? 0} y={14}>
      hoje
    </text>
  );

  const renderValueTick = ({ x = 0, y = 0, payload }: ValueTickProps): ReactElement => (
    <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={Number(x)} y={Number(y)}>
      {formatInt(payload?.value ?? 0)}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Capacidade planejada (fundo) e demanda (frente, em linha): sólida até {formatDate(asOfWeek)}, tracejada de projeção depois
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="week"
              interval={TICK_INTERVAL}
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
              name="Capacidade planejada"
              stroke={CAPACITY_STROKE}
              strokeWidth={1}
              type="stepAfter"
            />
            <Line
              dataKey="real"
              dot={false}
              isAnimationActive={animate}
              name="Demanda medida"
              stroke={DEMAND_STROKE}
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="projected"
              dot={false}
              isAnimationActive={false}
              name="Demanda projetada"
              stroke={DEMAND_STROKE}
              strokeDasharray="4 4"
              strokeWidth={2}
              type="monotone"
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderCutLabel}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              strokeWidth={1}
              x={cutRow?.week}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
