import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  cutoffDate as defaultCutoffDate,
  data as defaultData,
  vacationEnd as defaultVacationEnd,
  vacationStart as defaultVacationStart,
  type FunctionKey,
  type TeamChange,
} from './data';

/**
 * Tamanho da equipe comercial por função, em área empilhada em degrau a partir do zero: cada
 * camada vale a partir da data do registro (stepAfter), com contorno separando as três funções e
 * a queda das férias coletivas marcada por faixa.
 */
export interface TeamSizeStepAreaProps {
  readonly data?: readonly TeamChange[];
  readonly cutoffDate?: string;
  readonly vacationStart?: string;
  readonly vacationEnd?: string;
  readonly height?: number;
  readonly className?: string;
}

interface Row {
  readonly date: string;
  readonly ts: number;
  readonly preVendas: number;
  readonly vendas: number;
  readonly atendimento: number;
  readonly motivos: readonly string[];
}

const SERIES = [
  { key: 'preVendas', name: 'Pré-vendas', color: 'var(--chart-1)' },
  { key: 'vendas', name: 'Vendas', color: 'var(--chart-3)' },
  { key: 'atendimento', name: 'Atendimento', color: 'var(--chart-6)' },
] as const satisfies readonly { key: FunctionKey; name: string; color: string }[];

const MARGIN = { top: 16, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 32;
const LAYER_STROKE = 'var(--surface-raised)';

function toTimestamp(date: string): number {
  return new Date(date).getTime();
}

function tickMonth(ts: number): string {
  return formatMonthShort(new Date(ts).toISOString().slice(0, 7));
}

/** Um tique por mês presente no dado (primeira data daquele mês): o "nice tick" padrão do Recharts pulava abril. */
function monthTicks(rows: readonly Row[]): number[] {
  const seen = new Set<string>();
  const result: number[] = [];
  for (const row of rows) {
    const key = row.date.slice(0, 7);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(row.ts);
  }
  return result;
}

/** Uma linha por data única do registro, com o valor de cada função carregado do último evento até ali (ordem do array). */
function buildRows(events: readonly TeamChange[], cutoffDate: string): Row[] {
  const dates = Array.from(new Set([...events.map((event) => event.date), cutoffDate])).sort((a, b) => a.localeCompare(b));
  const current: Record<FunctionKey, number> = { preVendas: 0, vendas: 0, atendimento: 0 };
  let index = 0;
  const rows: Row[] = [];
  for (const date of dates) {
    const motivos: string[] = [];
    while (index < events.length) {
      const event = events[index];
      if (!event || event.date !== date) break;
      current[event.categoria] = event.valor;
      const label = SERIES.find((s) => s.key === event.categoria)?.name ?? event.categoria;
      motivos.push(`${label}: ${event.motivo}`);
      index += 1;
    }
    rows.push({ date, ts: toTimestamp(date), preVendas: current.preVendas, vendas: current.vendas, atendimento: current.atendimento, motivos });
  }
  return rows;
}

interface TeamTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{ readonly payload?: unknown }>;
}

function renderTeamTooltip({ active, payload }: TeamTooltipProps): ReactElement | null {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload as Row | undefined;
  if (!row) return null;
  const total = row.preVendas + row.vendas + row.atendimento;
  const items: ChartTooltipProps['payload'] = [
    ...SERIES.map((s) => ({ color: s.color, dataKey: s.key, graphicalItemId: s.key, name: s.name, value: `${formatInt(row[s.key])} pessoas` })),
    { color: 'var(--text-secondary)', dataKey: 'total', graphicalItemId: 'total', name: 'Total', value: `${formatInt(total)} pessoas` },
    ...(row.motivos.length > 0
      ? [{ color: 'var(--text-muted)', dataKey: 'motivos', graphicalItemId: 'motivos', name: 'Mudança', value: row.motivos.join('; ') }]
      : []),
  ];
  return <ChartTooltip active label={formatDate(row.date)} payload={items} valueFormat="text" />;
}

const renderVacationLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly width?: number } }): ReactElement => (
  <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) / 2} y={12}>
    Férias coletivas
  </text>
);

export default function TeamSizeStepArea({
  data = defaultData,
  cutoffDate = defaultCutoffDate,
  vacationStart = defaultVacationStart,
  vacationEnd = defaultVacationEnd,
  height,
  className,
}: TeamSizeStepAreaProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum registro de equipe neste recorte: não há composição para desenhar.</span>
      </div>
    );
  }

  const rows = buildRows(data, cutoffDate);
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) return null;

  const firstTotal = first.preVendas + first.vendas + first.atendimento;
  const lastTotal = last.preVendas + last.vendas + last.atendimento;
  const maxTotal = Math.max(...rows.map((row) => row.preVendas + row.vendas + row.atendimento));
  const ceiling = Math.max(5, Math.ceil((maxTotal + 1) / 5) * 5);
  const ticks = Array.from({ length: ceiling / 5 + 1 }, (_, i) => i * 5);
  const xTicks = monthTicks(rows);

  const summary = [
    `Gráfico de área empilhada em degrau com o tamanho da equipe comercial por função, de ${formatMonthShort(first.date.slice(0, 7))} a ${formatMonthShort(cutoffDate.slice(0, 7))}.`,
    `A equipe foi de ${formatInt(firstTotal)} para ${formatInt(lastTotal)} pessoas, com as três funções caindo juntas nas férias coletivas de ${formatDate(vacationStart)} a ${formatDate(vacationEnd)}.`,
  ].join(' ');

  const legendOrder = [...SERIES].reverse();

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 items-center gap-3 text-xs text-text-secondary">
        {legendOrder.map((s) => (
          <span className="flex items-center gap-1.5" key={s.key}>
            <span aria-hidden className="size-2.5 rounded-[2px]" style={{ backgroundColor: s.color }} />
            {s.name}
          </span>
        ))}
        <span className="ml-auto">
          hoje <span className="kpi-number font-medium text-text-primary">{formatInt(lastTotal)}</span> pessoas
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="ts" domain={['dataMin', 'dataMax']} scale="time" ticks={xTicks} tickFormatter={tickMonth} tickMargin={8} type="number" />
            <YAxis {...AXIS_PROPS} allowDecimals={false} axisLine={false} domain={[0, ceiling]} tickFormatter={(value: number) => formatInt(value)} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={renderTeamTooltip} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <ReferenceArea
              fill="var(--surface-sunken)"
              fillOpacity={0.55}
              ifOverflow="extendDomain"
              label={renderVacationLabel}
              stroke="var(--line-subtle)"
              strokeDasharray="3 3"
              x1={toTimestamp(vacationStart)}
              x2={toTimestamp(vacationEnd)}
            />
            {SERIES.map((s) => (
              <Area
                dataKey={s.key}
                fill={s.color}
                fillOpacity={1}
                isAnimationActive={animate}
                key={s.key}
                name={s.name}
                stackId="equipe"
                stroke={LAYER_STROKE}
                strokeWidth={1}
                type="stepAfter"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
