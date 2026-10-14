import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  annualTarget,
  data as defaultData,
  verticals as defaultVerticals,
  type MonthlyClosings,
  type Vertical,
  type VerticalKey,
} from './data';

/**
 * Colunas empilhadas com os fechamentos de cada mês repartidos por vertical, e uma única linha
 * sobre a pilha com o acumulado do ano inteiro, no eixo da direita. A linha não é o total do mês,
 * que já é a altura da própria coluna: ela é a soma corrida, e por isso nunca desce.
 *
 * As duas grandezas não têm relação natural, e a peça não se defende dizendo isso: o rodapé
 * imprime a taxa de câmbio que o desenho está afirmando entre os dois topos, e o que ela vira com
 * um passo a mais no eixo da direita, que é o que a emenda da EIX-8 pede de quem assume o eixo
 * duplo de propósito.
 */
export interface ClosingsByVerticalProps {
  readonly data?: readonly MonthlyClosings[];
  /** Verticais na ordem da pilha, de baixo para cima, cada uma com o seu slot de cor. */
  readonly verticals?: readonly Vertical[];
  readonly height?: number;
  readonly className?: string;
}

interface ClosingsRow extends MonthlyClosings {
  readonly total: number | null;
  readonly accumulated: number | null;
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

const AXIS_MONTH = 'mes';
const AXIS_ACCUM = 'acumulado';
const TICK_COUNT = 3;
/** Altura declarada do ritmo linear no eixo do mês: metade do eixo. */
const PACE_AT = 0.5;
/** A linha do acumulado não é categoria da pilha, então fica fora da ordem de slots da COR-8 e longe dos hexes repetidos de --chart-2 e --chart-4. */
const ACCUM_COLOR = 'var(--chart-7)';
const REFERENCE_COLOR = 'var(--text-muted)';
const SLOT_COLOR: Readonly<Record<number, string>> = {
  1: 'var(--chart-1)',
  2: 'var(--chart-2)',
  3: 'var(--chart-3)',
  4: 'var(--chart-4)',
  5: 'var(--chart-5)',
  6: 'var(--chart-6)',
};
const CURSOR = { fill: 'var(--line-subtle)' } as const;
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;
const MARGIN = { top: 20, right: 0, bottom: 0, left: 0 } as const;
/** Faixa do eixo X: 8 px de tickMargin mais cerca de 15 px de tinta de uma linha de 11 px (EIX-6b). */
const X_AXIS_HEIGHT = 23;
/** Tinta do maior tique, `120`, em Space Grotesk tabular a 11 px: 20,46 px, mais 18 px de sobrecarga. O piso de 48 da EIX-6 governa. */
const AXIS_WIDTH = 48;
const MAX_BAR_SIZE = 24;
const TICK = { className: 'font-display', fill: REFERENCE_COLOR, fontSize: 11 } as const;
const UNIT = 'fechamentos';

interface ReferenceLabelProps {
  readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number };
}

/** Tiques igualmente espaçados de zero até `domainMax`, mantendo o topo exato no último tique. */
function evenTicks(domainMax: number, tickCount: number): readonly number[] {
  if (domainMax <= 0) return Array.from({ length: tickCount }, (_, index) => index);
  const step = domainMax / (tickCount - 1);
  return Array.from({ length: tickCount }, (_, index) => Math.round(step * index));
}

/** Maior valor da lista, ou `null` em lista vazia: ausência não é zero (EST-1b). */
function maxOf(values: readonly number[]): number | null {
  return values.reduce<number | null>((max, value) => (max === null || value > max ? value : max), null);
}

/** Total do mês, ou `null` quando o mês inteiro ainda não fechou. */
function monthTotal(row: MonthlyClosings, keys: readonly VerticalKey[]): number | null {
  const present = keys.map((key) => row[key]).filter((value): value is number => value !== null);
  if (present.length === 0) return null;
  return present.reduce((sum, value) => sum + value, 0);
}

/** Soma corrida dos totais mensais, parando no primeiro mês sem fechamento. */
function withAccumulated(rows: readonly MonthlyClosings[], keys: readonly VerticalKey[]): readonly ClosingsRow[] {
  let running = 0;
  return rows.map((row) => {
    const total = monthTotal(row, keys);
    if (total === null) return { ...row, total: null, accumulated: null };
    running += total;
    return { ...row, total, accumulated: running };
  });
}

/** Fechamentos do ano de uma vertical, ou `null` quando ela não tem nenhum mês fechado. */
function verticalTotal(rows: readonly MonthlyClosings[], key: VerticalKey): number | null {
  const present = rows.map((row) => row[key]).filter((value): value is number => value !== null);
  if (present.length === 0) return null;
  return present.reduce((sum, value) => sum + value, 0);
}

export default function ClosingsByVertical({
  data = defaultData,
  verticals = defaultVerticals,
  height,
  className,
}: ClosingsByVerticalProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const pace = annualTarget / 12;

  if (data.length === 0 || verticals.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: sem fechamento não há composição por vertical a mostrar.</span>
      </div>
    );
  }

  const keys = verticals.map((vertical) => vertical.key);
  const rows = withAccumulated(data, keys);
  const lastClosedIndex = rows.reduce((last, row, index) => (row.total === null ? last : index), -1);
  const lastClosed = lastClosedIndex >= 0 ? rows[lastClosedIndex] : undefined;
  const lastAccumulated = lastClosed?.accumulated ?? null;

  const totals = verticals.map((vertical) => ({ vertical, total: verticalTotal(data, vertical.key) }));
  const leader = totals.reduce<{ readonly vertical: Vertical; readonly total: number } | null>((best, item) => {
    if (item.total === null) return best;
    if (best === null || item.total > best.total) return { vertical: item.vertical, total: item.total };
    return best;
  }, null);

  const monthTotals = rows.map((row) => row.total).filter((value): value is number => value !== null);
  const maxMonth = maxOf(monthTotals);
  const leftDomainMax = maxMonth === null ? pace / PACE_AT : Math.max(pace / PACE_AT, maxMonth);
  const rightDomainMax = lastAccumulated === null ? annualTarget : Math.max(annualTarget, lastAccumulated);
  const leftTicks = evenTicks(leftDomainMax, TICK_COUNT);
  const rightTicks = evenTicks(rightDomainMax, TICK_COUNT);
  const pctOfTarget = lastAccumulated === null ? null : lastAccumulated / annualTarget;
  const leaderShare =
    leader === null || lastAccumulated === null ? null : formatRateWithVolume(leader.total, lastAccumulated);
  const nextRightMax = rightDomainMax + rightDomainMax / (TICK_COUNT - 1);

  const summary =
    leader === null || leaderShare === null || pctOfTarget === null
      ? 'Colunas empilhadas sem nenhum mês fechado neste recorte para repartir por vertical.'
      : `Colunas empilhadas com os fechamentos de cada mês de 2026 por vertical e linha do acumulado do ano. ${leader.vertical.name} responde por ${leaderShare}, e o acumulado chegou a ${formatPercent(pctOfTarget, 0)} da meta anual de ${formatInt(annualTarget)} ${UNIT}.`;

  const reading =
    leader === null || leaderShare === null || pctOfTarget === null
      ? 'Nenhum mês fechado ainda neste recorte'
      : `${leader.vertical.name} responde por ${leaderShare} dos ${UNIT}, e o acumulado está em ${formatPercent(pctOfTarget, 0)} da meta anual`;

  const scaleNote = `Eixo duplo: o topo equipara ${formatInt(leftDomainMax)} ${UNIT} do mês a ${formatInt(rightDomainMax)} no acumulado, e um passo a mais na direita leva o empate a ${formatInt(nextRightMax)}.`;

  function tooltipEntries(row: ClosingsRow): readonly TooltipEntry[] {
    const entries: TooltipEntry[] = [];
    for (const vertical of verticals) {
      const value = row[vertical.key];
      if (value === null) continue;
      entries.push({
        color: SLOT_COLOR[vertical.slot] ?? ACCUM_COLOR,
        dataKey: vertical.key,
        graphicalItemId: vertical.key,
        name: vertical.name,
        value,
      });
    }
    if (row.accumulated !== null) {
      entries.push({
        color: ACCUM_COLOR,
        dataKey: 'accumulated',
        graphicalItemId: 'accumulated',
        name: 'Acumulado do ano',
        value: row.accumulated,
      });
    }
    return entries;
  }

  const renderTooltip = (tooltipProps: TooltipContentProps): ReactElement | null => {
    const month = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = month === undefined ? undefined : rows.find((candidate) => candidate.month === month);
    if (tooltipProps.active !== true || !row) return null;
    return <ChartTooltip active label={month} labelFormat="month" payload={tooltipEntries(row)} valueFormat="int" />;
  };

  const renderAccumulatedPoint = ({ x, y, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row || row.accumulated === null || index !== lastClosedIndex) return null;
    const cx = Number(x);
    const cy = Number(y);
    return (
      <g>
        <circle cx={cx} cy={cy} fill={ACCUM_COLOR} r={4} stroke="var(--surface-raised)" strokeWidth={2} />
        <text
          className="font-display"
          dominantBaseline="central"
          fill={ACCUM_COLOR}
          fontSize={12}
          fontWeight={700}
          style={HALO}
          textAnchor="start"
          x={cx + 8}
          y={cy - 11}
        >
          {formatInt(row.accumulated)}
        </text>
      </g>
    );
  };

  const renderReferenceLabel =
    (word: string, value: number) =>
    ({ viewBox }: ReferenceLabelProps): ReactElement => (
      <text
        fill={REFERENCE_COLOR}
        fontSize={11}
        style={HALO}
        textAnchor="end"
        x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0)}
        y={(viewBox?.y ?? 0) - 6}
      >
        <tspan className="font-sans">{word} </tspan>
        <tspan className="font-display">{formatInt(value)}</tspan>
        <tspan className="font-sans"> {UNIT}</tspan>
      </text>
    );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
        {[...totals].reverse().map(({ vertical, total }) => (
          <span className="flex items-center gap-1.5" key={vertical.key}>
            <span
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: SLOT_COLOR[vertical.slot] ?? ACCUM_COLOR }}
            />
            {vertical.name}
            {total === null ? (
              <span className="flex items-center gap-1 text-text-muted">
                <Unplug className="size-3 shrink-0" />
                {formatUnavailable()}
              </span>
            ) : (
              <span className="kpi-number text-text-primary">{formatInt(total)}</span>
            )}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 shrink-0 rounded-full" style={{ backgroundColor: ACCUM_COLOR }} />
          Acumulado total
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} barCategoryGap="34%" data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} yAxisId={AXIS_MONTH} />
            <XAxis
              axisLine={false}
              dataKey="month"
              height={X_AXIS_HEIGHT}
              interval={0}
              tick={TICK}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              domain={[0, leftDomainMax]}
              tick={TICK}
              tickFormatter={(value: number) => formatInt(value)}
              tickLine={false}
              tickMargin={8}
              ticks={[...leftTicks]}
              width={AXIS_WIDTH}
              yAxisId={AXIS_MONTH}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              domain={[0, rightDomainMax]}
              orientation="right"
              tick={{ ...TICK, fill: ACCUM_COLOR }}
              tickFormatter={(value: number) => formatInt(value)}
              tickLine={false}
              tickMargin={8}
              ticks={[...rightTicks]}
              width={AXIS_WIDTH}
              yAxisId={AXIS_ACCUM}
            />
            <Tooltip content={renderTooltip} cursor={CURSOR} isAnimationActive={false} />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderReferenceLabel('Meta anual', annualTarget)}
              stroke={REFERENCE_COLOR}
              strokeDasharray="3 3"
              y={annualTarget}
              yAxisId={AXIS_ACCUM}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderReferenceLabel('Ritmo linear', pace)}
              stroke={REFERENCE_COLOR}
              strokeDasharray="3 3"
              y={pace}
              yAxisId={AXIS_MONTH}
            />
            {verticals.map((vertical) => (
              <Bar
                dataKey={vertical.key}
                fill={SLOT_COLOR[vertical.slot] ?? ACCUM_COLOR}
                isAnimationActive={animate}
                key={vertical.key}
                maxBarSize={MAX_BAR_SIZE}
                name={vertical.name}
                stackId="closings"
                stroke="var(--surface-raised)"
                strokeWidth={1}
                yAxisId={AXIS_MONTH}
              />
            ))}
            <Line
              connectNulls={false}
              dataKey="accumulated"
              dot={false}
              isAnimationActive={animate}
              label={renderAccumulatedPoint}
              name="Acumulado do ano"
              stroke={ACCUM_COLOR}
              strokeWidth={2}
              yAxisId={AXIS_ACCUM}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[11px] text-text-muted">
        {scaleNote}
      </p>
    </div>
  );
}
