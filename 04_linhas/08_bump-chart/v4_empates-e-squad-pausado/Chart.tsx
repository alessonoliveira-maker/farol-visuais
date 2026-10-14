import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, weeks as defaultWeeks, type SquadSlaSeries } from './data';

/**
 * Bump chart de SLA semanal por squad: empates de verdade dividem a mesma posição (competição
 * 1º, 2º, 2º, 4º), e o squad sem operação some do ranking sem herdar a última colocação.
 */
export interface SquadSlaBumpProps {
  readonly data?: readonly SquadSlaSeries[];
  readonly weeks?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

interface ChartRow {
  readonly week: string;
  readonly raw: Readonly<Record<string, number>>;
  readonly ranks: Readonly<Record<string, number | null>>;
  readonly labelOffset: Readonly<Record<string, number>>;
}

const MARGIN = { top: 20, right: 116, bottom: 4, left: 148 } as const;
const RANK_AXIS_WIDTH = 36;
const DOT_RADIUS = 9;
const LABEL_GAP = 8;
const TIE_OFFSET = 20;
/** Slots categóricos na ordem da COR-8: chart-1, 3, 6, 5, 2. */
const SERIES_COLORS = ['var(--chart-1)', 'var(--chart-3)', 'var(--chart-6)', 'var(--chart-5)', 'var(--chart-2)'] as const;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Tique curto de eixo (dia/mês, sem ano): a data cheia de `formatDate` não cabe em 8 categorias
 * sem virar texto colado no vizinho. */
function shortDate(iso: string): string {
  const [, month, day] = iso.split('-');
  return `${day ?? ''}/${month ?? ''}`;
}

/** Competição 1º, 2º, 2º, 4º: só quem operou entra na disputa; desempate estável pelo nome. */
function rankWeek(items: readonly { id: string; name: string; value: number | null }[]): Record<string, number | null> {
  const active = items.filter((item): item is { id: string; name: string; value: number } => item.value !== null);
  const sorted = [...active].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'pt-BR'));
  const ranks: Record<string, number | null> = {};
  items.forEach((item) => {
    ranks[item.id] = null;
  });
  sorted.forEach((item, index) => {
    const prev = sorted[index - 1];
    ranks[item.id] = prev !== undefined && prev.value === item.value ? (ranks[prev.id] ?? index + 1) : index + 1;
  });
  return ranks;
}

/** Mesma anticolisão de rótulos das pontas usada no modelo: separa nomes empatados sem mexer
 * no ponto real do dado. */
function computeLabelOffsets(ranks: Readonly<Record<string, number | null>>): Record<string, number> {
  const groups = new Map<number, string[]>();
  Object.entries(ranks).forEach(([id, rank]) => {
    if (rank === null) return;
    const list = groups.get(rank) ?? [];
    list.push(id);
    groups.set(rank, list);
  });
  const offsets: Record<string, number> = {};
  groups.forEach((ids) => {
    const sorted = [...ids].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const mid = (sorted.length - 1) / 2;
    sorted.forEach((id, i) => {
      offsets[id] = (i - mid) * TIE_OFFSET;
    });
  });
  return offsets;
}

export default function SquadSlaBump({ data = defaultData, weeks = defaultWeeks, height, className }: SquadSlaBumpProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0 || weeks.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum squad neste recorte: não há posição para ranquear.</span>
      </div>
    );
  }

  const rows: ChartRow[] = weeks.map((week, wIndex) => {
    const items = data.map((series) => ({ id: series.id, name: series.name, value: series.values[wIndex] ?? null }));
    const raw: Record<string, number> = {};
    items.forEach((item) => {
      if (item.value !== null) raw[item.id] = item.value;
    });
    const ranks = rankWeek(items);
    return { week, raw, ranks, labelOffset: computeLabelOffsets(ranks) };
  });

  const lastIndex = rows.length - 1;
  const boundaryBySeries = new Map<string, Record<number, 'entry' | 'exit'>>();
  data.forEach((series) => {
    const seriesRanks = rows.map((r) => r.ranks[series.id] ?? null);
    const boundaries: Record<number, 'entry' | 'exit'> = {};
    seriesRanks.forEach((rank, i) => {
      if (rank === null) return;
      const prev = i > 0 ? seriesRanks[i - 1] : undefined;
      const next = i < lastIndex ? seriesRanks[i + 1] : undefined;
      if (i > 0 && prev === null) boundaries[i] = 'entry';
      if (i < lastIndex && next === null) boundaries[i] = 'exit';
    });
    boundaryBySeries.set(series.id, boundaries);
  });

  const pausedCount = data.reduce((sum, s) => sum + s.values.filter((v) => v === null).length, 0);
  const summary = rows[0] && rows[lastIndex]
    ? `Gráfico de linhas em posição (bump chart) com o ranking semanal de SLA de ${String(data.length)} squads, de ${formatDate(rows[0].week)} a ${formatDate(rows[lastIndex].week)}. Empate reparte a colocação, e um squad soma ${String(pausedCount)} semanas sem operar, sem herdar a última posição.`
    : 'Gráfico de linhas em posição (bump chart) sem semana para ranquear.';

  const nameById = new Map(data.map((s) => [s.id, s.name]));

  const renderDot = (seriesId: string, color: string) => ({ cx, cy, index, value }: DotItemDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || value === undefined || value === null || index === undefined) return null;
    const name = nameById.get(seriesId) ?? '';
    const boundary = boundaryBySeries.get(seriesId)?.[index];
    const row = rows[index];
    /** Empate real faz dois pontos caírem no mesmo pixel; sem o deslocamento, o número de um
     * fica escrito exatamente sobre o número do outro (COLISAO-TEXTO). */
    const offset = row?.labelOffset[seriesId] ?? 0;
    const py = cy + offset;
    return (
      <g key={`${seriesId}-${String(index)}`}>
        {index === 0 ? (
          <text className="font-sans" dominantBaseline="central" fill={color} fontSize={12} fontWeight={500} style={HALO} textAnchor="end" x={cx - RANK_AXIS_WIDTH - LABEL_GAP * 2} y={py}>
            {name}
          </text>
        ) : null}
        {boundary ? <circle cx={cx} cy={py} fill="none" r={DOT_RADIUS + 4} stroke={color} strokeDasharray="2 2" strokeWidth={1.5} /> : null}
        <circle cx={cx} cy={py} fill="var(--surface-raised)" r={DOT_RADIUS} stroke={color} strokeWidth={2} />
        <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={11} fontWeight={600} textAnchor="middle" x={cx} y={py}>
          {String(value)}
        </text>
        {index === lastIndex ? (
          <text className="font-sans" dominantBaseline="central" fill={color} fontSize={12} fontWeight={500} style={HALO} textAnchor="start" x={cx + DOT_RADIUS + LABEL_GAP} y={py}>
            {name}
          </text>
        ) : null}
      </g>
    );
  };

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, string | number>) => {
    const row = props.payload?.[0]?.payload as ChartRow | undefined;
    const mapped = (props.payload ?? []).map((entry) => {
      const id = data.find((s) => s.name === entry.name)?.id;
      const rawValue = id !== undefined ? row?.raw[id] : undefined;
      return { ...entry, value: rawValue === undefined ? entry.value : rawValue / 100 };
    });
    return <ChartTooltip active={props.active} label={props.label} labelFormat="date" payload={mapped as unknown as ChartTooltipProps['payload']} valueFormat="percent" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Eixo mostra a posição, não o SLA; empate reparte a colocação e pausa não é última posição.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="week" interval={0} tickFormatter={shortDate} tickMargin={8} />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              domain={[1, data.length]}
              reversed
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={(value: number) => `${String(value)}º`}
              tickLine={false}
              tickMargin={DOT_RADIUS + 8}
              ticks={Array.from({ length: data.length }, (_, i) => i + 1)}
              width={RANK_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: 'var(--line-strong)' }} isAnimationActive={false} itemSorter={(item) => Number(item.value) || 0} />
            {data.map((series, seriesIndex) => {
              const color = SERIES_COLORS[seriesIndex % SERIES_COLORS.length] ?? 'var(--chart-1)';
              return (
                <Line
                  connectNulls={false}
                  dataKey={(row: ChartRow) => row.ranks[series.id] ?? null}
                  dot={renderDot(series.id, color)}
                  isAnimationActive={animate}
                  key={series.id}
                  name={series.name}
                  stroke={color}
                  strokeWidth={2}
                  type="linear"
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">
        Empate reparte a colocação (1º, 2º, 2º, 4º); o desempate estável usa o nome do squad.
      </p>
    </div>
  );
}
