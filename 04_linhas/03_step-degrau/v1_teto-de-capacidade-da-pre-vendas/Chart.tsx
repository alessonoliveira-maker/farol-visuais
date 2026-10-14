import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps,
} from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { cutoffDate as defaultCutoffDate, data as defaultData, type CapacityStep } from './data';

/**
 * Teto de agendas por semana da pré-vendas em degrau: o valor vale a partir da data da mudança
 * (stepAfter, nunca curva), com o motivo de cada contratação ou saída na dica e a maior mudança
 * anotada. O último ponto repete o valor na data de corte para o patamar final ter largura.
 */
export interface CapacityCeilingStepProps {
  readonly data?: readonly CapacityStep[];
  readonly cutoffDate?: string;
  readonly height?: number;
  readonly className?: string;
}

interface ChartRow {
  readonly date: string;
  readonly ts: number;
  readonly value: number;
  readonly motivo?: string;
}

const MARGIN = { top: 26, right: 96, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 32;
const END_LABEL_GAP = 8;
const MINUS = '−';
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Timestamp determinístico de uma data YYYY-MM-DD, para o eixo numérico de tempo respeitar a duração real do degrau. */
function toTimestamp(date: string): number {
  return new Date(date).getTime();
}

/** Mês curto a partir do timestamp do eixo, sem depender do fuso do navegador (a origem é sempre UTC). */
function tickMonth(ts: number): string {
  return formatMonthShort(new Date(ts).toISOString().slice(0, 7));
}

interface StepTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{ readonly payload?: unknown }>;
}

/** Motivo da mudança na dica: o `ChartTooltip` só sabe formatar número, então o texto chega pronto. */
function renderStepTooltip({ active, payload }: StepTooltipProps): ReactElement | null {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload as ChartRow | undefined;
  if (!row) return null;
  const items: ChartTooltipProps['payload'] = [
    { color: 'var(--chart-1)', dataKey: 'value', graphicalItemId: 'value', name: 'Teto', value: `${formatInt(row.value)} agendas` },
    ...(row.motivo ? [{ color: 'var(--text-muted)', dataKey: 'motivo', graphicalItemId: 'motivo', name: 'Motivo', value: row.motivo }] : []),
  ];
  return <ChartTooltip active label={formatDate(row.date)} payload={items} valueFormat="text" />;
}

export default function CapacityCeilingStep({
  data = defaultData,
  cutoffDate = defaultCutoffDate,
  height,
  className,
}: CapacityCeilingStepProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const steps = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const last = steps[steps.length - 1];

  if (!last) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma mudança de teto neste recorte: não há capacidade para desenhar.</span>
      </div>
    );
  }

  const first = steps[0];
  const rows: ChartRow[] = [
    ...steps.map((step) => ({ date: step.date, ts: toTimestamp(step.date), value: step.value, motivo: step.motivo })),
    { date: cutoffDate, ts: toTimestamp(cutoffDate), value: last.value },
  ];

  let biggest: { readonly step: CapacityStep; readonly diff: number } | null = null;
  for (let i = 1; i < steps.length; i += 1) {
    const previous = steps[i - 1];
    const current = steps[i];
    if (!previous || !current) continue;
    const diff = current.value - previous.value;
    if (!biggest || Math.abs(diff) > Math.abs(biggest.diff)) biggest = { step: current, diff };
  }

  const maxTick = Math.max(5, Math.ceil((last.value + 2) / 5) * 5);
  const ticks = Array.from({ length: maxTick / 5 + 1 }, (_, i) => i * 5);

  const summary = [
    `Gráfico de linha em degrau com o teto de agendas por semana da pré-vendas, de ${formatMonthShort(first?.date.slice(0, 7) ?? '')} a ${formatMonthShort(cutoffDate.slice(0, 7))}.`,
    `Hoje o teto é de ${formatInt(last.value)} agendas, depois de ${String(steps.length - 1)} mudanças.`,
    biggest ? `A maior foi em ${formatDate(biggest.step.date)}: ${biggest.diff > 0 ? '+' : MINUS}${formatInt(Math.abs(biggest.diff))}, ${biggest.step.motivo.toLowerCase()}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || index === undefined) return null;
    const row = rows[index];
    if (!row) return null;
    if (index === rows.length - 1) {
      return (
        <g key={`dot-${String(index)}`}>
          <circle cx={cx} cy={cy} fill="var(--chart-1)" r={3} />
          <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} x={cx + END_LABEL_GAP} y={cy}>
            {formatInt(last.value)} agendas
          </text>
        </g>
      );
    }
    if (row.motivo === undefined) return null;
    return <circle cx={cx} cy={cy} fill="var(--chart-1)" key={`dot-${String(index)}`} r={3} />;
  };

  const renderChangeLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number } }): ReactElement | null => {
    if (!biggest) return null;
    const sign = biggest.diff > 0 ? '+' : MINUS;
    return (
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x ?? 0} y={12}>
        {sign}
        {formatInt(Math.abs(biggest.diff))}: {biggest.step.motivo}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Teto atual: <span className="kpi-number font-medium text-text-primary">{formatInt(last.value)} agendas</span> por semana, em{' '}
        <span className="tabular-nums">{formatInt(steps.length)}</span> patamares desde {formatMonthShort(first?.date.slice(0, 7) ?? '')}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="ts" domain={['dataMin', 'dataMax']} scale="time" tickFormatter={tickMonth} tickMargin={8} type="number" />
            <YAxis {...AXIS_PROPS} allowDecimals={false} axisLine={false} domain={[0, maxTick]} tickFormatter={(value: number) => formatInt(value)} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={renderStepTooltip} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <Line activeDot={{ r: 4 }} dataKey="value" dot={renderDot} isAnimationActive={animate} stroke="var(--chart-1)" strokeWidth={2} type="stepAfter" />
            {biggest ? (
              <ReferenceLine ifOverflow="extendDomain" label={renderChangeLabel} stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1} x={toTimestamp(biggest.step.date)} />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
