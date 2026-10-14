import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, XAxis, YAxis, useChartHeight, useYAxisScale } from 'recharts';

import { AXIS_PROPS, GRID_COLOR } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent, formatPercentPoints } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type DailySla } from './data';

/**
 * Área de diferença contra um limiar constante, em série longa: o SLA diário pinta uma cor
 * quando fica abaixo do limiar de 90%, com o corte de cor calculado na altura exata do limiar
 * já renderizado. A cor de alerta só existe abaixo da linha; a contagem de dias e o déficit
 * somado aparecem escritos, nunca só na cor.
 */
export interface DailySlaDifferenceProps {
  readonly data?: readonly DailySla[];
  readonly height?: number;
  readonly className?: string;
}

const THRESHOLD = 0.9;
const MARGIN = { top: 24, right: 16, bottom: 0, left: 0 } as const;
const Y_AXIS_WIDTH = 48;
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;

/** Corte duro de cor na altura exata do limiar, medida no eixo já renderizado. */
function ThresholdSplitDefs({ id, threshold }: { readonly id: string; readonly threshold: number }): ReactElement | null {
  const yScale = useYAxisScale();
  const chartHeight = useChartHeight();
  if (!yScale || chartHeight === undefined || chartHeight <= 0) return null;
  const pixel = yScale(threshold);
  if (pixel === undefined) return null;
  const offset = Math.min(1, Math.max(0, pixel / chartHeight));
  return (
    <defs>
      <linearGradient gradientUnits="userSpaceOnUse" id={id} x1={0} x2={0} y1={0} y2={chartHeight}>
        <stop offset={offset} stopColor="var(--line-strong)" stopOpacity={0.3} />
        <stop offset={offset} stopColor="var(--negative)" stopOpacity={0.55} />
      </linearGradient>
    </defs>
  );
}

interface ReferenceLabelProps {
  readonly viewBox?: { readonly x?: number; readonly y?: number };
}

function renderThresholdLabel({ viewBox }: ReferenceLabelProps): ReactElement {
  return (
    <text
      className="font-display"
      fill="var(--text-muted)"
      fontSize={11}
      style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
      textAnchor="start"
      x={(viewBox?.x ?? 0) + 4}
      y={(viewBox?.y ?? 0) - 6}
    >
      limiar {formatPercent(THRESHOLD, 0)}
    </text>
  );
}

export default function DailySlaDifference({ data = defaultData, height, className }: DailySlaDifferenceProps) {
  const gradientId = useId();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum dia neste recorte: não há SLA para comparar com o limiar.</span>
      </div>
    );
  }

  const belowDays = data.filter((row) => row.sla < THRESHOLD);
  const deficitPoints = belowDays.reduce((sum, row) => sum + (THRESHOLD - row.sla) * 100, 0);
  const monthStartIndexes = data.reduce<number[]>((acc, row, index) => (row.date.endsWith('-01') ? [...acc, index] : acc), []);

  const thresholdLabel = formatPercent(THRESHOLD, 0);
  const summary = [
    `Gráfico de área com o SLA diário de primeiro contato de ${formatInt(data.length)} dias, com a cor de alerta só abaixo do limiar de ${thresholdLabel}.`,
    `${formatInt(belowDays.length)} dos ${formatInt(data.length)} dias ficaram abaixo do limiar.`,
    `Déficit somado de ${formatPercentPoints(deficitPoints)}.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 flex-col gap-1 text-xs text-text-secondary">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: 'var(--line-strong)', opacity: 0.3 }} />
            Dentro do limiar
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: 'var(--negative)' }} />
            Abaixo do limiar
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 border-t border-dashed" style={{ borderColor: 'var(--text-muted)' }} />
            Limiar {thresholdLabel}
          </span>
        </p>
        <p className="truncate">
          <span className="kpi-number font-medium text-text-primary">
            {formatInt(belowDays.length)} de {formatInt(data.length)} dias
          </span>{' '}
          abaixo do limiar; déficit somado de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatPercentPoints(deficitPoints)}</span>.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart accessibilityLayer={false} data={[...data]} margin={MARGIN}>
            <ThresholdSplitDefs id={gradientId} threshold={THRESHOLD} />
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="date" interval={0} tickFormatter={formatMonthShort} tickMargin={8} ticks={monthStartIndexes.map((index) => data[index]?.date ?? '')} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, 1]} tickFormatter={(value: number) => formatPercent(value, 0)} ticks={[...Y_TICKS]} width={Y_AXIS_WIDTH} />
            <ReferenceLine ifOverflow="extendDomain" label={renderThresholdLabel} stroke="var(--text-muted)" strokeDasharray="3 3" y={THRESHOLD} />
            <Area baseValue={THRESHOLD} dataKey="sla" fill={`url(#${gradientId})`} fillOpacity={1} isAnimationActive={false} stroke={`url(#${gradientId})`} strokeWidth={1.5} type="linear" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
