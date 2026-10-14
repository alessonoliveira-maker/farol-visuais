import { Filter } from 'lucide-react';
import { useId, type ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, daysElapsed as defaultDaysElapsed, daysInMonth as defaultDaysInMonth, type MonthlyLeadsPartial } from './data';

/** Leads por mês, o mês corrente dividido em realizado sólido e restante hachurado. */
export interface PartialMonthColumnsProps {
  readonly data?: readonly MonthlyLeadsPartial[];
  readonly daysElapsed?: number;
  readonly daysInMonth?: number;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Card ≈ 574 × 234 px de corpo. Margem de topo para o rótulo do maior mês fechado (6 px acima da
 * coluna) não colidir com a grade: sem ela e sem headroom no domínio, a medição mostrou o "320"
 * cortado pela borda do SVG (EIX-4: o eixo precisa terminar na grade acima do maior valor, não
 * exatamente nele).
 */
const MARGIN = { top: 24, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 32;
const BAR_CATEGORY_GAP = '34%';
/**
 * ESP-6, duas séries empilhadas no mesmo `stackId` contam como uma só banda (não há `barGap`
 * entre pilha e pilha): disponível ≈ 574 − 32 − 8 = 534; passo ≈ 534 / 12 ≈ 44,5; espessura ≈
 * 44,5 × (1 − 2 × 0,34) ≈ 14,2 px. Acima do piso de 12 px.
 */
const BAR_MAX = 15;
const VALUE_LABEL_GAP = 6;
const TICK_STEP = 100;

interface Row extends MonthlyLeadsPartial {
  readonly closed: number;
  readonly actual: number;
  readonly restante: number;
  readonly closedLabel: string;
  readonly currentLabel: string;
}

interface TextLabelProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly width?: number | string;
  readonly value?: unknown;
}

function niceCeiling(max: number, step: number): number {
  return Math.max(step, Math.ceil(max / step) * step);
}

export default function PartialMonthColumns({
  data = defaultData,
  daysElapsed = defaultDaysElapsed,
  daysInMonth = defaultDaysInMonth,
  height,
  className,
}: PartialMonthColumnsProps) {
  const animate = useAnimateOnce();
  const patternId = useId();
  const style = height === undefined ? undefined : { height };
  const rows = [...data];

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há entrada de leads registrada no período.</span>
      </div>
    );
  }

  const current = rows.find((row) => row.current);
  const closedRows = rows.filter((row) => !row.current);
  const remainingDays = current ? Math.max(0, daysInMonth - daysElapsed) : 0;
  const pace = current && daysElapsed > 0 ? current.leads / daysElapsed : 0;
  const projectedRestante = current ? Math.round(pace * remainingDays) : 0;
  const projectedTotal = current ? current.leads + projectedRestante : 0;
  const peakClosed = closedRows.reduce((max, row) => (row.leads > max.leads ? row : max), closedRows[0] ?? rows[0]!);
  const lastClosed = closedRows[closedRows.length - 1];

  /**
   * O rótulo vai num `dataKey` de texto próprio (`closedLabel`, `currentLabel`), lido pelo
   * `LabelList` direto do payload da linha (`getValueByDataKey`), em vez de reconstruído por
   * `index`: numa pilha, o Recharts só inclui no item list de cada `Bar` os meses em que aquele
   * segmento é maior que zero, e `index` deixa de bater com `closedRows`/`rows` assim que algum
   * mês tem valor zero no meio da série (o mesmo mecanismo documentado no modelo 06/v4).
   */
  const withSplit: readonly Row[] = rows.map((row) => ({
    ...row,
    closed: row.current ? 0 : row.leads,
    actual: row.current ? row.leads : 0,
    restante: row.current ? projectedRestante : 0,
    closedLabel: !row.current && (row.month === peakClosed?.month || row.month === lastClosed?.month) ? formatInt(row.leads) : '',
    currentLabel: row.current ? formatInt(projectedTotal) : '',
  }));

  const ceiling = niceCeiling(Math.max(peakClosed?.leads ?? 0, projectedTotal), TICK_STEP);
  const ticks = Array.from({ length: ceiling / TICK_STEP + 1 }, (_, i) => i * TICK_STEP);

  const summary = [
    `Gráfico de colunas com leads por mês em ${String(rows.length)} meses.`,
    current
      ? `${formatMonthShort(current.month)} está parcial: ${String(daysElapsed)} de ${String(daysInMonth)} dias, ${String(current.leads)} leads já entraram e o ritmo atual projeta ${String(projectedTotal)} no mês fechado.`
      : '',
    peakClosed ? `O maior mês fechado foi ${formatMonthShort(peakClosed.month)}, com ${String(peakClosed.leads)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTick = ({ x = 0, y = 0, payload }: { readonly x?: number | string; readonly y?: number | string; readonly payload?: { readonly value?: unknown } }): ReactElement => {
    const isCurrent = payload?.value === current?.month;
    return (
      <text className="font-sans" fill={isCurrent ? 'var(--chart-1)' : 'var(--text-muted)'} fontSize={11} fontWeight={isCurrent ? 700 : 400} textAnchor="middle" x={x} y={Number(y) + 12}>
        {formatMonthShort(String(payload?.value ?? ''))}
      </text>
    );
  };

  const renderClosedLabel = ({ x, y, width, value }: TextLabelProps): ReactElement | null => {
    if (!value) return null;
    return (
      <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={500} textAnchor="middle" x={Number(x) + Number(width) / 2} y={Number(y) - VALUE_LABEL_GAP}>
        {String(value)}
      </text>
    );
  };

  const renderCurrentLabel = ({ x, y, width, value }: TextLabelProps): ReactElement | null => {
    if (!value) return null;
    return (
      <text className="font-display" fill="var(--chart-1)" fontSize={12} fontWeight={700} textAnchor="middle" x={Number(x) + Number(width) / 2} y={Number(y) - VALUE_LABEL_GAP}>
        {String(value)}
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const [first] = props.payload ?? [];
    if (!props.active || !first) return null;
    const month = typeof props.label === 'string' ? props.label : '';
    const isCurrent = month === current?.month;
    const value = isCurrent ? (current?.leads ?? 0) : (rows.find((row) => row.month === month)?.leads ?? 0);
    return (
      <ChartTooltip active={props.active} label={month} labelFormat="month" payload={[{ ...first, name: isCurrent ? 'Leads, parcial até agora' : 'Leads', value }]} valueFormat="int" />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {current ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          <span className="font-semibold text-chart-1">{formatMonthShort(current.month)} parcial</span>,{' '}
          <span className="tabular-nums">{String(daysElapsed)} de {String(daysInMonth)} dias</span>: ritmo de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(Math.round(pace))}</span>/dia projeta{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(projectedTotal)}</span>
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={withSplit} margin={MARGIN}>
            <defs>
              <pattern height={6} id={patternId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={6}>
                <rect fill="var(--surface-raised)" height={6} width={6} />
                <line stroke="var(--chart-1)" strokeOpacity={0.55} strokeWidth={1.5} x1={0} x2={0} y1={0} y2={6} />
              </pattern>
            </defs>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" tick={renderTick} tickLine={false} />
            <YAxis {...AXIS_PROPS} allowDecimals={false} axisLine={false} domain={[0, ceiling]} tickFormatter={formatInt} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="closed" fill="var(--line-strong)" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[3, 3, 0, 0]} stackId="month">
              <LabelList content={renderClosedLabel} dataKey="closedLabel" />
            </Bar>
            <Bar dataKey="actual" fill="var(--chart-1)" isAnimationActive={animate} maxBarSize={BAR_MAX} stackId="month" />
            <Bar dataKey="restante" fill={`url(#${patternId})`} isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[3, 3, 0, 0]} stackId="month" stroke="var(--chart-1)" strokeWidth={1}>
              <LabelList content={renderCurrentLabel} dataKey="currentLabel" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
