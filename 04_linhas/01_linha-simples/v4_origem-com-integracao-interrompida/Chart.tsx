import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, gapEnd as defaultGapEnd, gapStart as defaultGapStart, type DailyOrigin } from './data';

/** Linha simples de leads diários com um período sem coleta declarado, não lido como zero. */
export interface DailyOriginGapProps {
  readonly data?: readonly DailyOrigin[];
  readonly gapStart?: string;
  readonly gapEnd?: string;
  readonly height?: number;
  readonly className?: string;
}

interface PlotRow extends DailyOrigin {
  /** Só o trecho final (o dia de junção e o dia parcial), para o traço tracejado. */
  readonly leadsPartial: number | null;
}

const MARGIN = { top: 24, right: 16, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 36;

/**
 * As duas linhas leem o mesmo array e o mesmo eixo de categoria: dar a cada `Line` o seu próprio
 * array de `data` confundiu o domínio categórico (os tiques saíram fora de ordem), então o corte
 * entre o trecho cheio e o trecho tracejado vira uma segunda chave nas mesmas linhas.
 */
function withPartialTail(rows: readonly DailyOrigin[]): readonly PlotRow[] {
  const lastIndex = rows.length - 1;
  return rows.map((row, index) => ({
    ...row,
    leads: index === lastIndex ? null : row.leads,
    leadsPartial: index === lastIndex || index === lastIndex - 1 ? row.leads : null,
  }));
}

/** Um ponto é isolado quando os dois vizinhos, na chave `leads`, são nulos. */
function isIsolated(rows: readonly PlotRow[], index: number): boolean {
  const current = rows[index];
  if (!current || current.leads === null) return false;
  const prev = rows[index - 1];
  const next = rows[index + 1];
  const prevGone = index === 0 || !prev || prev.leads === null;
  const nextGone = index === rows.length - 1 || !next || next.leads === null;
  return prevGone && nextGone;
}

function niceCeiling(max: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(max, 1)));
  const residual = max / magnitude;
  const step = residual <= 2 ? 0.5 : residual <= 5 ? 1 : 2;
  return Math.ceil(max / (step * magnitude)) * step * magnitude;
}

export default function DailyOriginGap({
  data = defaultData,
  gapStart = defaultGapStart,
  gapEnd = defaultGapEnd,
  height,
  className,
}: DailyOriginGapProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = data;
  const lastIndex = rows.length - 1;

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum dia neste recorte: não houve leads desta origem para desenhar.</span>
      </div>
    );
  }

  const values = rows.flatMap((row) => (row.leads === null ? [] : [row.leads]));
  const ceiling = niceCeiling(Math.max(1, ...values));
  const plotRows = withPartialTail(rows);
  const missingDays = rows.filter((row) => row.leads === null).length;
  const first = rows[0]!;
  const last = rows[lastIndex]!;

  const summary = [
    `Gráfico de linha com leads diários de uma origem entre ${formatDate(first.date)} e ${formatDate(last.date)}.`,
    `Integração fora do ar por ${String(missingDays)} dias entre ${formatDate(gapStart)} e ${formatDate(gapEnd)}, sem contar como zero.`,
    `Último dia, ${formatDate(last.date)}, parcial.`,
  ].join(' ');

  const renderDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (index === undefined || cx === undefined || cy === undefined) return null;
    if (index === lastIndex - 1 || isIsolated(plotRows, index)) {
      return <circle cx={cx} cy={cy} fill="var(--chart-1)" key={`dot-${String(index)}`} r={3.5} stroke="var(--surface-raised)" strokeWidth={1.5} />;
    }
    return null;
  };

  const renderGapLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) / 2} y={(viewBox?.y ?? 0) + 14}>
      sem coleta
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Parcial até <span className="kpi-number font-medium text-text-primary">{formatDate(last.date)}</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={plotRows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="date" tickFormatter={formatDate} tickMargin={8} />
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              domain={[0, ceiling]}
              tickFormatter={(value: number) => formatInt(Math.round(value))}
              width={VALUE_AXIS_WIDTH}
            />
            <Tooltip content={<ChartTooltip labelFormat="date" valueFormat="int" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <ReferenceArea fill="var(--surface-sunken)" ifOverflow="extendDomain" label={renderGapLabel} stroke="none" x1={gapStart} x2={gapEnd} />
            <Line connectNulls={false} dataKey="leads" dot={renderDot} isAnimationActive={animate} stroke="var(--chart-1)" strokeWidth={2} type="linear" />
            <Line
              connectNulls={false}
              dataKey="leadsPartial"
              dot={false}
              isAnimationActive={animate}
              stroke="var(--chart-1)"
              strokeDasharray="4 4"
              strokeWidth={2}
              tooltipType="none"
              type="linear"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
