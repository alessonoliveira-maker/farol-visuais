import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, usePlotArea, useXAxisScale, type TooltipContentProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { currentWeek as defaultCurrentWeek, data as defaultData, type WeeklyIntake } from './data';

/** Uma coluna por semana em 26 semanas, com o mês do grupo lido no eixo de cima. */
export interface WeeklyTwoLevelColumnsProps {
  readonly data?: readonly WeeklyIntake[];
  readonly currentWeek?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 24, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 36;
const BAR_CATEGORY_GAP = '30%';
/**
 * ESP-6, série única: passo = disponível / categorias; espessura = passo × (1 − 2 × 0,30).
 * Corpo do cartão largo ≈ 894 × 274 px; disponível ≈ 894 − 36 (eixo) − 8 (margem) = 850;
 * passo ≈ 32,7 para 26 semanas; espessura ≈ 32,7 × 0,4 ≈ 13,1 px, acima do piso de 12 px.
 */
const BAR_MAX = 13;

interface MonthGroup {
  readonly month: string;
  readonly firstWeek: string;
  readonly lastWeek: string;
  readonly anchor: 'start' | 'middle' | 'end';
}

/** Agrupa semanas consecutivas do mesmo mês; guarda a semana que abre e a que fecha o grupo. */
function groupByMonth(rows: readonly WeeklyIntake[]): readonly MonthGroup[] {
  const starts: { readonly month: string; readonly start: number }[] = [];
  rows.forEach((row, i) => {
    const last = starts.at(-1);
    if (last && last.month === row.month) return;
    starts.push({ month: row.month, start: i });
  });
  return starts.map((group, i) => {
    const end = i + 1 < starts.length ? (starts[i + 1]?.start ?? rows.length) : rows.length;
    const anchor = i === 0 ? 'start' : i === starts.length - 1 ? 'end' : 'middle';
    return { month: group.month, firstWeek: rows[group.start]!.week, lastWeek: rows[end - 1]!.week, anchor };
  });
}

/**
 * Separador de mês e rótulo do grupo, ancorados na banda real do eixo `week` (Checklist 15).
 * O eixo numérico paralelo que existia antes tinha um passo por semana levemente diferente do
 * passo real de categoria, e o desvio acumulado furava as colunas 11 e 16. `useXAxisScale` lê a
 * escala de categoria já calculada pelo Recharts para o próprio eixo `week`, então o traço nasce
 * exatamente na fronteira entre bandas, nunca dentro de uma barra.
 */
function MonthOverlay({ months }: { readonly months: readonly MonthGroup[] }): ReactElement | null {
  const scale = useXAxisScale('week');
  const plot = usePlotArea();
  if (!scale || !plot) return null;
  return (
    <g aria-hidden>
      {months.slice(1).map((group) => {
        const boundary = scale(group.firstWeek, { position: 'start' });
        if (boundary === undefined) return null;
        return <line key={group.month} stroke="var(--line-subtle)" x1={boundary} x2={boundary} y1={plot.y} y2={plot.y + plot.height} />;
      })}
      {months.map((group) => {
        const xStart = scale(group.firstWeek, { position: 'start' });
        const xEnd = scale(group.lastWeek, { position: 'end' });
        if (xStart === undefined || xEnd === undefined) return null;
        const x = group.anchor === 'start' ? xStart : group.anchor === 'end' ? xEnd : (xStart + xEnd) / 2;
        return (
          <text key={group.month} className="font-sans" fill="var(--text-secondary)" fontSize={12} fontWeight={500} textAnchor={group.anchor} x={x} y={plot.y - 8}>
            {formatMonthShort(`${group.month}-01`)}
          </text>
        );
      })}
    </g>
  );
}

export default function WeeklyTwoLevelColumns({
  data = defaultData,
  currentWeek = defaultCurrentWeek,
  height,
  className,
}: WeeklyTwoLevelColumnsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não houve entrada registrada no período.</span>
      </div>
    );
  }

  const rows = [...data];
  const months = groupByMonth(rows);
  const currentRow = rows.find((row) => row.week === currentWeek);
  const currentIndex = rows.findIndex((row) => row.week === currentWeek);
  const peakIndex = rows.reduce((best, row, i) => (row.entradas > (rows[best]?.entradas ?? -1) ? i : best), 0);

  const summary = [
    `Gráfico de colunas com entradas semanais na pré-vendas em ${formatInt(rows.length)} semanas, agrupadas por mês.`,
    `Pico na semana ${String(peakIndex + 1)}, com ${formatInt(rows[peakIndex]?.entradas ?? 0)} entradas.`,
    currentRow ? `A semana corrente, com início em ${formatDate(currentRow.weekStart)}, segue parcial.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const weekTick = (props: { readonly x?: number | string; readonly y?: number | string; readonly payload?: { readonly value?: unknown } }): ReactElement => {
    const value = typeof props.payload?.value === 'string' ? props.payload.value : '';
    const isCurrent = value === currentWeek;
    const label = value.replace(/^S0*/, '');
    return (
      <text
        className="font-display"
        fill={isCurrent ? 'var(--text-primary)' : 'var(--text-muted)'}
        fontSize={11}
        fontWeight={isCurrent ? 700 : 400}
        textAnchor="middle"
        x={props.x}
        y={Number(props.y ?? 0) + 12}
      >
        {label}
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    if (!props.active || !props.payload) return null;
    const week = typeof props.label === 'string' ? props.label : '';
    const row = rows.find((item) => item.week === week);
    const parcial = week === currentWeek ? ', semana parcial' : '';
    const label = row ? `${week}, semana de ${formatDate(row.weekStart)}${parcial}` : week;
    const payload = props.payload.map((entry) => ({
      ...entry,
      name: typeof entry.name === 'string' ? entry.name : String(entry.name ?? ''),
      value: typeof entry.value === 'number' || typeof entry.value === 'string' ? entry.value : String(entry.value ?? ''),
    }));
    return <ChartTooltip active={props.active} label={label} payload={payload} valueFormat="int" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {currentRow ? (
        <p aria-hidden className="mb-1 shrink-0 text-xs text-text-secondary">
          Semana <span className="font-semibold text-text-primary">{formatInt(currentIndex + 1)}</span> segue{' '}
          <span className="font-semibold text-text-primary">parcial</span>, com início em{' '}
          <span className="kpi-number font-medium text-text-primary">{formatDate(currentRow.weekStart)}</span>
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis axisLine={false} dataKey="week" interval={0} tick={weekTick} tickLine={false} xAxisId="week" />
            <YAxis {...AXIS_PROPS} allowDecimals={false} axisLine={false} domain={[0, 'dataMax']} tickCount={4} tickFormatter={formatInt} tickLine={false} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="entradas" fill="var(--chart-1)" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[2, 2, 0, 0]} xAxisId="week" />
            <MonthOverlay months={months} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
