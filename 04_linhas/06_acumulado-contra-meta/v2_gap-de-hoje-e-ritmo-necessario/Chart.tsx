import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, quarterlyTarget as defaultQuarterlyTarget, type FortnightClosing } from './data';

/**
 * Fechamentos acumulados por quinzena contra a trajetória linear da meta do trimestre: um
 * conector vertical marca o gap na quinzena de corte e uma segunda linha, tracejada a partir
 * dali, mostra o ritmo por quinzena que fecharia a meta até o fim do trimestre.
 */
export interface QuarterGapAndPaceProps {
  readonly data?: readonly FortnightClosing[];
  readonly quarterlyTarget?: number;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 20, right: 44, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 56;
const DOMAIN: readonly [number, number] = [0, 2_500_000];
const TICKS = [0, 500_000, 1_000_000, 1_500_000, 2_000_000, 2_500_000] as const;
const VALUE_LABEL_GAP = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface Point {
  readonly cx: number;
  readonly cy: number;
}

export default function QuarterGapAndPace({
  data = defaultData,
  quarterlyTarget = defaultQuarterlyTarget,
  height,
  className,
}: QuarterGapAndPaceProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma quinzena neste recorte: não há fechamentos para acumular.</span>
      </div>
    );
  }

  let running = 0;
  let stopped = false;
  const rows = data.map((row, index) => {
    if (!stopped && row.closedAmount !== null) {
      running += row.closedAmount;
    } else {
      stopped = true;
    }
    return { periodEnd: row.periodEnd, cumulativeActual: stopped ? null : running, cumulativeTarget: (quarterlyTarget * (index + 1)) / data.length };
  });

  let cutoffIndex = -1;
  rows.forEach((row, index) => {
    if (row.cumulativeActual !== null) cutoffIndex = index;
  });
  const lastIndex = rows.length - 1;
  const cutoff = cutoffIndex >= 0 ? rows[cutoffIndex] : undefined;
  const gap = cutoff ? cutoff.cumulativeActual! - cutoff.cumulativeTarget : 0;
  const behind = gap < 0;
  const periodsLeft = lastIndex - cutoffIndex;
  const requiredPace = cutoff && periodsLeft > 0 ? (quarterlyTarget - cutoff.cumulativeActual!) / periodsLeft : 0;

  const rowsWithPace = rows.map((row, index) => ({
    ...row,
    requiredPaceCumulative: cutoff && (index === cutoffIndex || index === lastIndex) ? (index === cutoffIndex ? cutoff.cumulativeActual : quarterlyTarget) : null,
  }));

  const summary =
    cutoff && cutoffIndex < lastIndex
      ? `Gráfico de linha com fechamentos acumulados por quinzena contra a meta do trimestre de ${formatCurrencyCompact(quarterlyTarget)}. Até ${formatDate(cutoff.periodEnd)} soma ${formatCurrencyCompact(cutoff.cumulativeActual ?? 0)}, ${formatCurrencyCompact(Math.abs(gap))} ${behind ? 'abaixo' : 'acima'} da meta. Ritmo necessário: ${formatCurrencyCompact(requiredPace)} por quinzena.`
      : 'Gráfico de linha com o trimestre já encerrado.';

  /** Capturado pelo dot fantasma da meta e lido pelo dot do realizado, na mesma ordem do JSX. */
  let targetAtCutoff: Point | undefined;

  const renderTargetGhost = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (index !== cutoffIndex || cx === undefined || cy === undefined) return null;
    targetAtCutoff = { cx: Number(cx), cy: Number(cy) };
    return null;
  };

  const renderActualDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (index !== cutoffIndex || cx === undefined || cy === undefined || !cutoff) return null;
    const ax = Number(cx);
    const ay = Number(cy);
    const target = targetAtCutoff;
    return (
      <g key="gap-anno">
        <circle cx={ax} cy={ay} fill="var(--chart-1)" r={3} />
        <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} x={ax + VALUE_LABEL_GAP} y={ay}>
          {formatCurrencyCompact(cutoff.cumulativeActual ?? 0)}
        </text>
        {target ? (
          <>
            <line stroke={behind ? 'var(--negative)' : 'var(--positive)'} strokeDasharray="2 2" strokeWidth={1.5} x1={ax - 14} x2={ax - 14} y1={ay} y2={target.cy} />
            <text
              className="font-sans"
              fill={behind ? 'var(--negative)' : 'var(--positive)'}
              fontSize={11}
              style={HALO}
              textAnchor="end"
              x={ax - 20}
              y={(ay + target.cy) / 2}
            >
              {formatCurrencyCompact(Math.abs(gap))} {behind ? 'abaixo' : 'acima'} da meta
            </text>
          </>
        ) : null}
      </g>
    );
  };

  const renderPaceDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (index !== lastIndex || cx === undefined || cy === undefined || periodsLeft <= 0) return null;
    return (
      <g key="pace-end">
        <rect fill="var(--chart-1)" height={6} width={6} x={Number(cx) - 3} y={Number(cy) - 3} />
        <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={600} style={HALO} textAnchor="end" x={Number(cx) - VALUE_LABEL_GAP} y={Number(cy) - 12}>
          ritmo necessário {formatCurrencyCompact(requiredPace)}/quinzena
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {cutoff ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          Quinzena de <span className="font-semibold text-text-primary">{formatDate(cutoff.periodEnd)}</span> contra a{' '}
          <span className="font-semibold text-text-primary">meta do trimestre</span> (jul a set de 2026)
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rowsWithPace} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="periodEnd" interval={0} padding={{ right: 16 }} tickFormatter={formatDate} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={DOMAIN} tickFormatter={formatCurrencyAxis} ticks={[...TICKS]} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip labelFormat="date" valueFormat="currencyCompact" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <Line dataKey="cumulativeTarget" dot={renderTargetGhost} isAnimationActive={false} name="Meta do trimestre" stroke="var(--line-strong)" strokeDasharray="4 4" strokeWidth={1.5} type="linear" />
            <Line connectNulls dataKey="requiredPaceCumulative" dot={renderPaceDot} isAnimationActive={false} name="Ritmo necessário" stroke="var(--chart-1)" strokeDasharray="2 3" strokeWidth={1.5} type="linear" />
            <Line
              activeDot={{ r: 4 }}
              connectNulls={false}
              dataKey="cumulativeActual"
              dot={renderActualDot}
              isAnimationActive={animate}
              name="Fechado acumulado"
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="linear"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
