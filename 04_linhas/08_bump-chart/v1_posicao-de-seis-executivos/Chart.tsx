import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, quarters as defaultQuarters, type ExecutiveRevenueSeries } from './data';

/**
 * Bump chart: a posição de cada executivo no ranking de receita reconhecida, trimestre a
 * trimestre. O eixo mostra a posição, não o valor; a receita que gerou cada posição fica na
 * dica, para a distância entre executivos não se confundir com a distância no desenho.
 */
export interface ExecutivePositionBumpProps {
  readonly data?: readonly ExecutiveRevenueSeries[];
  readonly quarters?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

interface ChartRow {
  readonly quarter: string;
  readonly raw: Readonly<Record<string, number>>;
  readonly ranks: Readonly<Record<string, number>>;
}

const MARGIN = { top: 20, right: 108, bottom: 4, left: 140 } as const;
const RANK_AXIS_WIDTH = 36;
const DOT_RADIUS = 9;
const LABEL_GAP = 8;
/** Slots categóricos na ordem da COR-8: chart-1, 3, 6, 5, 2, 4. */
const SERIES_COLORS = ['var(--chart-1)', 'var(--chart-3)', 'var(--chart-6)', 'var(--chart-5)', 'var(--chart-2)', 'var(--chart-4)'] as const;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Ranking por competição (1, 2, 2, 4): empate reparte o mesmo lugar; desempate estável pelo nome. */
function rankPeriod(items: readonly { id: string; name: string; value: number }[]): Record<string, number> {
  const sorted = [...items].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'pt-BR'));
  const ranks: Record<string, number> = {};
  sorted.forEach((item, index) => {
    const prev = sorted[index - 1];
    ranks[item.id] = prev !== undefined && prev.value === item.value ? (ranks[prev.id] ?? index + 1) : index + 1;
  });
  return ranks;
}

export default function ExecutivePositionBump({ data = defaultData, quarters = defaultQuarters, height, className }: ExecutivePositionBumpProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0 || quarters.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não há posição para ranquear.</span>
      </div>
    );
  }

  const rows: ChartRow[] = quarters.map((quarter, qIndex) => {
    const items = data.map((series) => ({ id: series.id, name: series.name, value: series.values[qIndex] ?? 0 }));
    const raw: Record<string, number> = {};
    items.forEach((item) => {
      raw[item.id] = item.value;
    });
    return { quarter, raw, ranks: rankPeriod(items) };
  });

  const lastIndex = rows.length - 1;
  const lastRow = rows[lastIndex];
  const firstRow = rows[0];
  const leaderOf = (row: ChartRow | undefined) => (row ? data.find((s) => row.ranks[s.id] === 1) : undefined);
  const leaderLast = leaderOf(lastRow);
  const leaderFirst = leaderOf(firstRow);

  const summary = leaderLast && leaderFirst && firstRow && lastRow
    ? `Gráfico de linhas em posição (bump chart) com o ranking de receita reconhecida de ${String(data.length)} executivos em ${String(quarters.length)} trimestres encerrados entre ${formatMonthShort(firstRow.quarter)} e ${formatMonthShort(lastRow.quarter)}. O eixo mostra a posição, não o valor. Liderava ${leaderFirst.name} no início; termina liderando ${leaderLast.name}.`
    : 'Gráfico de linhas em posição (bump chart) sem trimestre para ranquear.';

  const nameById = new Map(data.map((s) => [s.id, s.name]));

  const renderDot = (seriesId: string, color: string) => ({ cx, cy, index, value }: DotItemDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || value === undefined || value === null || index === undefined) return null;
    const name = nameById.get(seriesId) ?? '';
    return (
      <g key={`${seriesId}-${String(index)}`}>
        {index === 0 ? (
          <text className="font-sans" dominantBaseline="central" fill={color} fontSize={12} fontWeight={500} style={HALO} textAnchor="end" x={cx - RANK_AXIS_WIDTH - LABEL_GAP * 2} y={cy}>
            {name}
          </text>
        ) : null}
        <circle cx={cx} cy={cy} fill="var(--surface-raised)" r={DOT_RADIUS} stroke={color} strokeWidth={2} />
        <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={11} fontWeight={600} textAnchor="middle" x={cx} y={cy}>
          {String(value)}
        </text>
        {index === lastIndex ? (
          <text className="font-sans" dominantBaseline="central" fill={color} fontSize={12} fontWeight={500} style={HALO} textAnchor="start" x={cx + DOT_RADIUS + LABEL_GAP} y={cy}>
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
      return { ...entry, value: rawValue ?? entry.value };
    });
    return <ChartTooltip active={props.active} label={props.label} labelFormat="month" payload={mapped as unknown as ChartTooltipProps['payload']} valueFormat="currencyCompact" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Eixo mostra a posição no ranking, não o valor; a receita de cada trimestre fica na dica.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="quarter" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
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
    </div>
  );
}
