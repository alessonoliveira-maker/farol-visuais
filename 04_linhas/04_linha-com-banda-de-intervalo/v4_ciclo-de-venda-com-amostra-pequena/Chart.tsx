import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps,
  type LabelProps,
} from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatDays, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, MIN_SAMPLE as defaultMinSample, type SalesCycleMonth } from './data';

/**
 * Mediana mensal do ciclo de venda sobre uma faixa entre quartis que some no mês com amostra
 * pequena: a mediana continua marcada como ponto isolado, e a contagem de vendas junto de cada
 * ponto diz por que a faixa está ou não está ali.
 */
export interface SalesCycleBandProps {
  readonly data?: readonly SalesCycleMonth[];
  readonly minSample?: number;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 28, right: 28, bottom: 0, left: 28 } as const;
const VALUE_AXIS_WIDTH = 56;
const BAND_FILL = 'var(--line-strong)';
const BAND_OPACITY = 0.32;
const COUNT_LABEL_OFFSET = 14;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

type Band = readonly [number, number] | null;

interface BandRow extends SalesCycleMonth {
  readonly band: Band;
}

export default function SalesCycleBand({
  data = defaultData,
  minSample = defaultMinSample,
  height,
  className,
}: SalesCycleBandProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há ciclo de venda para medir.</span>
      </div>
    );
  }

  const rows: readonly BandRow[] = data.map((row) => ({
    ...row,
    band: row.p25Days === null || row.p75Days === null ? null : [row.p25Days, row.p75Days],
  }));
  const small = rows.filter((row) => row.sampleSize < minSample);
  const last = rows[rows.length - 1]!;
  const first = rows[0]!;

  const summary = [
    `Gráfico de linha com a mediana mensal do ciclo de venda de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}, com faixa entre o 1º e o 3º quartil.`,
    `${String(small.length)} de ${String(rows.length)} meses com menos de ${formatInt(minSample)} fechamentos ficaram sem faixa, com a mediana isolada; fechou ${formatMonthShort(last.month)} em ${formatDays(last.medianDays)}.`,
  ].join(' ');

  const renderDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || index === undefined) return null;
    const row = rows[index];
    if (!row || row.band !== null) return <circle cx={cx} cy={cy} key={`dot-${String(index)}`} r={0} />;
    return <circle cx={cx} cy={cy} fill="var(--surface-raised)" key={`dot-${String(index)}`} r={4} stroke="var(--chart-1)" strokeWidth={2} />;
  };

  const renderCountLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    return (
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={Number(x)} y={Number(y) - COUNT_LABEL_OFFSET}>
        <tspan className="font-display">{formatInt(row.sampleSize)}</tspan> vendas
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-muted">
        Faixa entre quartis omitida em mês com menos de {formatInt(minSample)} fechamentos.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, 'dataMax + 10']} tickFormatter={(value: number) => formatDays(value)} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip labelFormat="month" valueFormat="days" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <Area connectNulls={false} dataKey="band" fill={BAND_FILL} fillOpacity={BAND_OPACITY} isAnimationActive={animate} stroke="none" tooltipType="none" />
            <Line dataKey="medianDays" dot={renderDot} isAnimationActive={animate} stroke="var(--chart-1)" strokeWidth={2} type="linear">
              <LabelList content={renderCountLabel} dataKey="sampleSize" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
