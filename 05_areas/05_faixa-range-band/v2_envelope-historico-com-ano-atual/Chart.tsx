import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, LabelList, ResponsiveContainer, XAxis, YAxis, type DotItemDotProps, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, partialAsOf as defaultPartialAsOf, type WeeklyEnvelope } from './data';

/**
 * Envelope de mínimo e máximo histórico por semana do ano (2023 a 2025) com a série de 2026 em
 * linha por cima, o único destaque colorido do visual. Semanas de 2026 fora do envelope ganham
 * um ponto vazio maior; a última semana, ainda em coleta, ganha ponto vazado em vez de sólido.
 */
export interface WeeklyEnvelopeChartProps {
  readonly data?: readonly WeeklyEnvelope[];
  readonly partialAsOf?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 16, right: 72, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 60;
const DOMAIN: readonly [number, number] = [0, 160];
const TICKS = [0, 40, 80, 120, 160] as const;
const BAND_FILL = 'var(--line-strong)';
const BAND_OPACITY = 0.28;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface BandRow extends WeeklyEnvelope {
  readonly envelope: readonly [number, number];
  readonly currentSolid: number | null;
  readonly currentTail: number | null;
}

interface TickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly payload?: { readonly value?: number };
}

export default function WeeklyEnvelopeChart({
  data = defaultData,
  partialAsOf = defaultPartialAsOf,
  height,
  className,
}: WeeklyEnvelopeChartProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não houve entrada de lead registrada no período.</span>
      </div>
    );
  }

  const lastIndex = data.length - 1;
  const tailStart = lastIndex > 0 ? lastIndex - 1 : lastIndex;
  const lastPartial = data[lastIndex]?.partial ?? false;
  const rows: readonly BandRow[] = data.map((row, index) => ({
    ...row,
    envelope: [row.minHistorical, row.maxHistorical],
    currentSolid: lastPartial && index === lastIndex ? null : row.current,
    currentTail: lastPartial && (index === lastIndex || index === tailStart) ? row.current : null,
  }));
  const last = rows[lastIndex]!;
  const outside = rows.filter((row) => !row.partial && (row.current < row.minHistorical || row.current > row.maxHistorical));
  const above = outside.filter((row) => row.current > row.maxHistorical).length;
  const below = outside.length - above;

  const summary = [
    `Gráfico de área com o envelope semanal de entradas de lead de 2026 contra o mínimo e o máximo de 2023 a 2025, em ${String(rows.length)} semanas.`,
    outside.length > 0 ? `${String(outside.length)} romperam o envelope, ${String(above)} acima e ${String(below)} abaixo.` : 'Nenhuma semana rompeu o envelope.',
    last.partial ? `A última, S${String(last.weekNumber)}, está parcial até ${formatDate(partialAsOf)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const reading = [
    outside.length > 0 ? `${String(outside.length)} semanas fora do envelope, ${String(above)} acima e ${String(below)} abaixo` : null,
    last.partial ? `semana S${String(last.weekNumber).padStart(2, '0')} parcial até ${formatDate(partialAsOf)}` : null,
  ]
    .filter(Boolean)
    .join('; ') || null;

  const renderWeekTick = ({ x, y, payload }: TickProps): ReactElement => (
    <text className="font-display" dominantBaseline="hanging" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={Number(x ?? 0)} y={Number(y ?? 0)}>
      {`S${String(payload?.value ?? 0).padStart(2, '0')}`}
    </text>
  );

  const renderValueTick = ({ x, y, payload }: TickProps): ReactElement => {
    const value = payload?.value ?? 0;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={Number(x ?? 0)} y={Number(y ?? 0)}>
        {value === DOMAIN[1] ? `${formatInt(value)} leads` : formatInt(value)}
      </text>
    );
  };

  const renderEnvelopeEnd = (text: string) => {
    const Renderer = ({ x, y, index }: LabelProps): ReactElement | null => {
      if (index !== lastIndex) return null;
      return (
        <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} fontWeight={500} style={HALO} textAnchor="start" x={Number(x) + 8} y={Number(y)}>
          {text}
        </text>
      );
    };
    return Renderer;
  };

  const renderCurrentDot = ({ cx, cy, index, value }: DotItemDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || index === undefined || value === null) return null;
    const row = rows[index];
    if (!row) return null;
    if (row.partial) return <circle cx={cx} cy={cy} fill="var(--surface-raised)" key={`dot-${String(index)}`} r={4} stroke="var(--chart-1)" strokeWidth={2} />;
    const isOutside = row.current < row.minHistorical || row.current > row.maxHistorical;
    if (isOutside) {
      return (
        <path
          d={`M ${String(cx)} ${String(cy - 5)} L ${String(cx + 5)} ${String(cy)} L ${String(cx)} ${String(cy + 5)} L ${String(cx - 5)} ${String(cy)} Z`}
          fill="none"
          key={`dot-${String(index)}`}
          stroke="var(--chart-1)"
          strokeWidth={2}
        />
      );
    }
    return <circle cx={cx} cy={cy} fill="var(--chart-1)" key={`dot-${String(index)}`} r={0} />;
  };

  const renderTailDot = (props: DotItemDotProps): ReactElement | null => {
    if (props.index !== lastIndex) return null;
    return renderCurrentDot(props);
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">{reading}</p> : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis axisLine={false} dataKey="weekNumber" interval={2} tick={renderWeekTick} tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} domain={[...DOMAIN]} tick={renderValueTick} tickLine={false} ticks={[...TICKS]} width={VALUE_AXIS_WIDTH} />
            <Area dataKey="envelope" fill={BAND_FILL} fillOpacity={BAND_OPACITY} isAnimationActive={animate} stroke="none" />
            <Line dataKey="maxHistorical" dot={false} isAnimationActive={false} stroke="none" strokeWidth={0}>
              <LabelList content={renderEnvelopeEnd('máximo')} dataKey="maxHistorical" />
            </Line>
            <Line dataKey="minHistorical" dot={false} isAnimationActive={false} stroke="none" strokeWidth={0}>
              <LabelList content={renderEnvelopeEnd('mínimo')} dataKey="minHistorical" />
            </Line>
            <Line connectNulls={false} dataKey="currentSolid" dot={renderCurrentDot} isAnimationActive={animate} stroke="var(--chart-1)" strokeWidth={2} type="monotone" />
            {lastPartial ? (
              <Line
                connectNulls={false}
                dataKey="currentTail"
                dot={renderTailDot}
                isAnimationActive={false}
                stroke="var(--chart-1)"
                strokeDasharray="4 4"
                strokeWidth={2}
                type="monotone"
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
