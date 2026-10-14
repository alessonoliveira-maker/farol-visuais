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
import { formatCurrencyAxis, formatCurrencyCompact, formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type DailyCpl } from './data';

/** CPL diário sobre uma faixa móvel de mínimo e máximo das 8 semanas anteriores: dispersão
 * histórica, não meta. Dias fora da faixa ganham marca, cor e valor escrito. */
export interface DailyCplBandProps {
  readonly data?: readonly DailyCpl[];
  readonly height?: number;
  readonly className?: string;
}

const HISTORY_WINDOW_DAYS = 56;
const HISTORY_WINDOW_WEEKS = HISTORY_WINDOW_DAYS / 7;
const MARGIN = { top: 26, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 56;
const BAND_FILL = 'var(--line-strong)';
const BAND_OPACITY = 0.32;
const VALUE_LABEL_GAP = 10;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

type Deviation = 'acima' | 'abaixo' | null;

interface DisplayRow extends DailyCpl {
  readonly band: readonly [number, number];
  readonly deviation: Deviation;
}

function buildDisplayRows(rows: readonly DailyCpl[]): readonly DisplayRow[] {
  const out: DisplayRow[] = [];
  for (let index = HISTORY_WINDOW_DAYS; index < rows.length; index += 1) {
    const row = rows[index];
    const history = rows.slice(index - HISTORY_WINDOW_DAYS, index);
    if (!row || history.length < HISTORY_WINDOW_DAYS) continue;
    const values = history.map((item) => item.cpl);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const deviation: Deviation = row.cpl > max ? 'acima' : row.cpl < min ? 'abaixo' : null;
    out.push({ ...row, band: [min, max], deviation });
  }
  return out;
}

export default function DailyCplBand({ data = defaultData, height, className }: DailyCplBandProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = buildDisplayRows(data);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>
          Nenhum dia neste recorte tem as <span className="tabular-nums">{formatInt(HISTORY_WINDOW_WEEKS)}</span> semanas anteriores
          completas para a faixa.
        </span>
      </div>
    );
  }

  const outliers = rows.filter((row) => row.deviation !== null);
  const spike = outliers.find((row) => row.deviation === 'acima');
  const dip = outliers.find((row) => row.deviation === 'abaixo');
  const summary = [
    `Gráfico de linha com o CPL diário de mídia paga em ${String(rows.length)} dias, sobre a faixa sombreada de mínimo e máximo das 8 semanas anteriores.`,
    `${String(outliers.length)} de ${String(rows.length)} dias saíram da faixa.`,
    spike ? `Pico de ${formatCurrencyCompact(spike.cpl)} em ${formatDate(spike.date)}.` : '',
    dip ? `Vale de ${formatCurrencyCompact(dip.cpl)} em ${formatDate(dip.date)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || index === undefined) return null;
    const row = rows[index];
    if (!row || row.deviation === null) return <circle cx={cx} cy={cy} key={`dot-${String(index)}`} r={0} />;
    const color = row.deviation === 'acima' ? 'var(--negative)' : 'var(--positive)';
    const path =
      row.deviation === 'acima'
        ? `M ${String(cx)} ${String(cy - 4)} L ${String(cx + 4)} ${String(cy + 3)} L ${String(cx - 4)} ${String(cy + 3)} Z`
        : `M ${String(cx)} ${String(cy + 4)} L ${String(cx + 4)} ${String(cy - 3)} L ${String(cx - 4)} ${String(cy - 3)} Z`;
    return <path d={path} fill={color} key={`dot-${String(index)}`} />;
  };

  const renderOutlierValue = ({ x, y, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row || row.deviation === null) return null;
    const color = row.deviation === 'acima' ? 'var(--negative)' : 'var(--positive)';
    const dy = row.deviation === 'acima' ? -VALUE_LABEL_GAP : VALUE_LABEL_GAP + 8;
    return (
      <text className="font-display" fill={color} fontSize={12} fontWeight={700} style={HALO} textAnchor="middle" x={Number(x)} y={Number(y) + dy}>
        {formatCurrencyCompact(row.cpl)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-muted">
        Faixa sombreada: mínimo e máximo das <span className="tabular-nums">{formatInt(HISTORY_WINDOW_WEEKS)}</span> semanas anteriores a
        cada dia.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="date" tickFormatter={formatDate} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} tickFormatter={formatCurrencyAxis} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip labelFormat="date" valueFormat="currencyCompact" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <Area dataKey="band" fill={BAND_FILL} fillOpacity={BAND_OPACITY} isAnimationActive={animate} stroke="none" tooltipType="none" />
            <Line dataKey="cpl" dot={renderDot} isAnimationActive={animate} stroke="var(--chart-1)" strokeWidth={2} type="linear">
              <LabelList content={renderOutlierValue} dataKey="cpl" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
