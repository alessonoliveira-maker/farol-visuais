import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, months as defaultMonths, type LeadOriginSeries } from './data';

/**
 * Bump chart com uma origem em destaque: as demais sete ficam em neutro para o olho seguir só a
 * que mais subiu, com uma anotação escrevendo de onde ela saiu e onde chegou.
 */
export interface LeadOriginBumpProps {
  readonly data?: readonly LeadOriginSeries[];
  readonly highlightId?: string;
  readonly months?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

interface ChartRow {
  readonly month: string;
  readonly raw: Readonly<Record<string, number>>;
  readonly ranks: Readonly<Record<string, number>>;
}

const MARGIN = { top: 28, right: 132, bottom: 4, left: 8 } as const;
const RANK_AXIS_WIDTH = 26;
const DOT_RADIUS = 7;
const HIGHLIGHT_DOT_RADIUS = 8;
const LABEL_GAP = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

function rankPeriod(items: readonly { id: string; name: string; value: number }[]): Record<string, number> {
  const sorted = [...items].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'pt-BR'));
  const ranks: Record<string, number> = {};
  sorted.forEach((item, index) => {
    const prev = sorted[index - 1];
    ranks[item.id] = prev !== undefined && prev.value === item.value ? (ranks[prev.id] ?? index + 1) : index + 1;
  });
  return ranks;
}

export default function LeadOriginBump({ data = defaultData, highlightId = defaultHighlightId, months = defaultMonths, height, className }: LeadOriginBumpProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0 || months.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não há posição para ranquear.</span>
      </div>
    );
  }

  const rows: ChartRow[] = months.map((month, mIndex) => {
    const items = data.map((series) => ({ id: series.id, name: series.name, value: series.values[mIndex] ?? 0 }));
    const raw: Record<string, number> = {};
    items.forEach((item) => {
      raw[item.id] = item.value;
    });
    return { month, raw, ranks: rankPeriod(items) };
  });

  const lastIndex = rows.length - 1;
  const midIndex = Math.floor(lastIndex / 2);
  const firstRow = rows[0];
  const lastRow = rows[lastIndex];
  const highlight = data.find((s) => s.id === highlightId) ?? data[0];
  const startRank = highlight && firstRow ? firstRow.ranks[highlight.id] : undefined;
  const endRank = highlight && lastRow ? lastRow.ranks[highlight.id] : undefined;

  const summary = highlight && startRank !== undefined && endRank !== undefined && firstRow && lastRow
    ? `Gráfico de linhas em posição (bump chart) com o ranking de volume de 8 origens de lead entre ${formatMonthShort(firstRow.month)} e ${formatMonthShort(lastRow.month)}. O eixo mostra a posição, não o valor. ${highlight.name} é a origem que mais sobe: sai da ${String(startRank)}ª posição e termina na ${String(endRank)}ª, com ${formatInt(highlight.values[lastIndex] ?? 0)} leads no último mês.`
    : 'Gráfico de linhas em posição (bump chart) sem origem para destacar.';

  const renderDot = (seriesId: string, isHighlight: boolean) => ({ cx, cy, index, value }: DotItemDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || value === undefined || value === null || index === undefined) return null;
    const color = isHighlight ? 'var(--chart-1)' : 'var(--line-strong)';
    const radius = isHighlight ? HIGHLIGHT_DOT_RADIUS : DOT_RADIUS;
    return (
      <g key={`${seriesId}-${String(index)}`}>
        {isHighlight && index === midIndex && startRank !== undefined && endRank !== undefined ? (
          <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={cx} y={cy - radius - 10}>
            de {formatInt(startRank)}º a {formatInt(endRank)}º em {formatInt(months.length)} meses
          </text>
        ) : null}
        <circle cx={cx} cy={cy} fill={color} r={radius} />
        {isHighlight && index === lastIndex ? (
          <text className="font-sans" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} textAnchor="start" x={cx + radius + LABEL_GAP} y={cy}>
            {highlight?.name}
          </text>
        ) : null}
      </g>
    );
  };

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, string | number>) => {
    const row = props.payload?.[0]?.payload as ChartRow | undefined;
    const mapped = (props.payload ?? []).map((entry) => {
      const id = data.find((s) => `${s.name} (leads)` === entry.name)?.id;
      const rawValue = id !== undefined ? row?.raw[id] : undefined;
      return { ...entry, value: rawValue ?? entry.value };
    });
    return <ChartTooltip active={props.active} label={props.label} labelFormat="month" payload={mapped as unknown as ChartTooltipProps['payload']} valueFormat="int" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Eixo mostra a posição no ranking, não o volume; o volume de cada origem fica na dica.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              domain={[1, data.length]}
              interval={0}
              reversed
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={(value: number) => `${String(value)}º`}
              tickLine={false}
              ticks={Array.from({ length: data.length }, (_, i) => i + 1)}
              width={RANK_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: 'var(--line-strong)' }} isAnimationActive={false} itemSorter={(item) => Number(item.value) || 0} />
            {data.map((series) => {
              const isHighlight = series.id === highlightId;
              return (
                <Line
                  connectNulls={false}
                  dataKey={(row: ChartRow) => row.ranks[series.id] ?? null}
                  dot={renderDot(series.id, isHighlight)}
                  isAnimationActive={animate}
                  key={series.id}
                  name={`${series.name} (leads)`}
                  stroke={isHighlight ? 'var(--chart-1)' : 'var(--line-strong)'}
                  strokeWidth={isHighlight ? 2.5 : 1}
                  type="linear"
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
