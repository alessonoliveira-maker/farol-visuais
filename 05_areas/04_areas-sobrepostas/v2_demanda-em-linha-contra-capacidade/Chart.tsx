import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyLeadDemand } from './data';

/**
 * Capacidade de triagem em Area clara (stepAfter, muda por contratação) desenhada antes da linha
 * de demanda, saturada e por cima, como pede o guia de eixo duplo do estudo 08: a área é o
 * envelope pálido, a linha é a protagonista. Semana em que a demanda passa a capacidade ganha um
 * ponto na cor negativa com o excedente escrito ao lado, sinal e palavra, nunca só a cor.
 */
export interface LeadDemandComposedProps {
  readonly data?: readonly WeeklyLeadDemand[];
  readonly height?: number;
  readonly className?: string;
}

const CAPACITY_FILL = 'var(--line-strong)';
const CAPACITY_STROKE = 'var(--line-strong)';
const DEMAND_STROKE = 'var(--chart-1)';
const OVER_FILL = 'var(--negative)';
const MARGIN = { top: 22, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 40;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface DemandDotProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly index?: number;
  readonly payload?: WeeklyLeadDemand;
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

export default function LeadDemandComposed({ data = defaultData, height, className }: LeadDemandComposedProps) {
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
        <span>Nenhuma semana neste recorte: não há demanda nem capacidade medidas no período.</span>
      </div>
    );
  }

  const overWeeks = data.filter((row) => row.demand > row.capacity);
  const peak = overWeeks.reduce<WeeklyLeadDemand | undefined>(
    (best, row) => (!best || row.demand - row.capacity > best.demand - best.capacity ? row : best),
    undefined,
  );
  /**
   * Semanas seguidas acima do teto ganham rótulo só no pico do trecho (ANO-1): rotular cada uma
   * lotava o espaço entre pontos vizinhos e colava um número no outro (ROT-9).
   */
  const peakIndexOfRun = new Set<number>();
  data.forEach((row, i) => {
    const isOver = row.demand > row.capacity;
    const wasOver = i > 0 && (data[i - 1]?.demand ?? 0) > (data[i - 1]?.capacity ?? 0);
    if (!isOver || wasOver) return;
    let runEnd = i;
    while (runEnd + 1 < data.length && (data[runEnd + 1]?.demand ?? 0) > (data[runEnd + 1]?.capacity ?? 0)) runEnd += 1;
    let peakIndex = i;
    for (let j = i; j <= runEnd; j += 1) {
      const current = data[j];
      const best = data[peakIndex];
      if (current && best && current.demand - current.capacity > best.demand - best.capacity) peakIndex = j;
    }
    peakIndexOfRun.add(peakIndex);
  });
  const first = data[0];
  const last = data[data.length - 1];
  const maxValue = Math.max(...data.map((row) => Math.max(row.capacity, row.demand)));
  const ticks = computeNiceTicks(maxValue);
  const domainTop = ticks[ticks.length - 1] ?? maxValue;

  const summary = first && last
    ? `Área de capacidade de triagem e linha de demanda de leads por semana, ${formatInt(data.length)} semanas, de ${formatMonthShort(first.week)} a ${formatMonthShort(last.week)}. ` +
      `${formatInt(overWeeks.length)} ${overWeeks.length === 1 ? 'semana passou' : 'semanas passaram'} da capacidade.` +
      (peak ? ` Pico em ${formatMonthShort(peak.week)}, ${formatInt(peak.demand - peak.capacity)} acima do teto.` : '')
    : 'Área de capacidade e linha de demanda de leads por semana.';

  const renderDemandDot = ({ cx, cy, index, payload }: DemandDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || index === undefined || !payload) return null;
    const over = payload.demand - payload.capacity;
    if (over <= 0) {
      return <circle cx={cx} cy={cy} fill={DEMAND_STROKE} key={`dot-${String(index)}`} r={2.5} />;
    }
    if (!peakIndexOfRun.has(index)) {
      return <circle cx={cx} cy={cy} fill={OVER_FILL} key={`dot-${String(index)}`} r={4} stroke="var(--surface-raised)" strokeWidth={1.5} />;
    }
    return (
      <g key={`dot-${String(index)}`}>
        <circle cx={cx} cy={cy} fill={OVER_FILL} r={4} stroke="var(--surface-raised)" strokeWidth={1.5} />
        <text className="font-display" fill={OVER_FILL} fontSize={11} fontWeight={700} style={HALO} textAnchor="middle" x={cx} y={cy - 12}>
          {`+${formatInt(over)} acima`}
        </text>
      </g>
    );
  };

  const renderValueTick = ({ x = 0, y = 0, payload }: ValueTickProps): ReactElement => (
    <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={Number(x)} y={Number(y)}>
      {formatInt(payload?.value ?? 0)}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        <li className="flex items-center gap-1.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="h-2 w-3.5 shrink-0 rounded-[2px]" style={{ backgroundColor: CAPACITY_FILL, opacity: 0.35 }} />
          Capacidade de triagem (fundo)
        </li>
        <li className="flex items-center gap-1.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="h-0.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: DEMAND_STROKE }} />
          Demanda de entradas (frente)
        </li>
      </ul>
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
            <Area
              dataKey="capacity"
              fill={CAPACITY_FILL}
              fillOpacity={0.16}
              isAnimationActive={animate}
              name="Capacidade"
              stroke={CAPACITY_STROKE}
              strokeWidth={1}
              type="stepAfter"
            />
            <Line
              dataKey="demand"
              dot={renderDemandDot}
              isAnimationActive={animate}
              name="Demanda"
              stroke={DEMAND_STROKE}
              strokeWidth={2}
              type="monotone"
            />
            <ReferenceLine stroke="var(--line-strong)" strokeWidth={1} y={0} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
