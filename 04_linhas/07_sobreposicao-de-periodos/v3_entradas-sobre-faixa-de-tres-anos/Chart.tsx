import { Filter } from 'lucide-react';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyLeadRecord } from './data';

/**
 * Entradas de leads por semana ISO de 2026 sobre a faixa de mínimo e máximo da mesma semana em
 * 2023, 2024 e 2025. A faixa cobre o período inteiro; a linha de 2026 para na última semana
 * medida, e as semanas em que 2026 sai da faixa levam ponto e valor escritos.
 */
export interface LeadsOverThreeYearBandProps {
  readonly data?: readonly WeeklyLeadRecord[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 16, right: 88, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 40;
const BAND_FILL = 'var(--line-strong)';
const BAND_OPACITY = 0.28;
const LABEL_GAP = 8;
const OUTLIER_LABEL_OFFSET = 14;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface BandRow {
  readonly week: number;
  readonly band: readonly [number, number];
  readonly current: number | null;
}

export default function LeadsOverThreeYearBand({ data = defaultData, height, className }: LeadsOverThreeYearBandProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não há entradas para comparar com anos anteriores.</span>
      </div>
    );
  }

  const byYearWeek = new Map<string, number>();
  const weeks = new Set<number>();
  for (const record of data) {
    byYearWeek.set(`${String(record.year)}-${String(record.isoWeek)}`, record.leads);
    weeks.add(record.isoWeek);
  }
  const rows: readonly BandRow[] = Array.from(weeks)
    .sort((a, b) => a - b)
    .map((week) => {
      const history = [2023, 2024, 2025].map((year) => byYearWeek.get(`${String(year)}-${String(week)}`) ?? 0);
      return {
        week,
        band: [Math.min(...history), Math.max(...history)] as [number, number],
        current: byYearWeek.get(`2026-${String(week)}`) ?? null,
      };
    });

  const lastCurrentIndex = rows.reduce((last, row, index) => (row.current !== null ? index : last), -1);
  const outsideCount = rows.filter((row) => row.current !== null && (row.current < row.band[0] || row.current > row.band[1])).length;

  const summary = [
    `Gráfico de linha com as entradas de leads por semana ISO de 2026, sobre a faixa de mínimo e máximo da mesma semana em 2023 a 2025.`,
    lastCurrentIndex >= 0
      ? `Medido até a semana ${String(rows[lastCurrentIndex]?.week ?? 0)}, com ${String(outsideCount)} semanas fora da faixa histórica.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderCurrentDot = ({ cx, cy, index, value }: DotItemDotProps) => {
    const row = rows[index];
    if (!row || cx === undefined || cy === undefined || typeof value !== 'number') return null;
    const isLast = index === lastCurrentIndex;
    const outside = value < row.band[0] || value > row.band[1];
    if (!isLast && !outside) return null;
    if (isLast) {
      return (
        <g key="current-end">
          <circle cx={cx} cy={cy} fill="var(--chart-1)" r={4} />
          <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} x={cx + LABEL_GAP} y={cy}>
            <tspan className="font-sans">2026 </tspan>
            {formatInt(value)}
          </text>
        </g>
      );
    }
    const above = value > row.band[1];
    return (
      <g key={`outlier-${String(row.week)}`}>
        <circle cx={cx} cy={cy} fill="var(--chart-1)" r={4} />
        <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="middle" x={cx} y={cy + (above ? -OUTLIER_LABEL_OFFSET : OUTLIER_LABEL_OFFSET)}>
          {formatInt(value)}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-muted">
        Faixa sombreada: mínimo e máximo semanal de 2023 a 2025.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} dataKey="week" tickFormatter={(value: number) => `sem ${formatInt(value)}`} tickMargin={8} />
            <YAxis {...AXIS_PROPS} allowDecimals={false} domain={[0, 260]} tickFormatter={(value: number) => formatInt(value)} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip valueFormat="int" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <Area dataKey="band" fill={BAND_FILL} fillOpacity={BAND_OPACITY} isAnimationActive={animate} stroke="none" />
            <Line connectNulls={false} dataKey="current" dot={renderCurrentDot} isAnimationActive={animate} name="2026" stroke="var(--chart-1)" strokeWidth={2} type="linear" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
