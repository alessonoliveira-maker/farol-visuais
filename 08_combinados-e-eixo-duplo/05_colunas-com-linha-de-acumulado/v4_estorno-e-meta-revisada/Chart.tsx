import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyRevenue } from './data';

/**
 * Colunas da receita de cada mês, com um estorno que desce abaixo do zero, e a linha do acumulado
 * do ano, que desce junto. A meta anual é revisada no meio do ano e entra como degrau no eixo do
 * acumulado, desenhada a partir do dado e não à mão.
 *
 * O que esta versão resolve é o alinhamento dos dois zeros: os eixos têm grandezas e amplitudes
 * diferentes, e sem alinhar a fração negativa de cada um os dois zeros caem em pixels diferentes,
 * de modo que a mesma linha horizontal significa zero para uma série e outro número para a outra.
 * A função `alignZero` estica o lado negativo do eixo que precisa de menos até as duas frações
 * ficarem iguais, e aí uma única linha de zero serve aos dois. O preço está no desenho e é
 * declarado: a metade de baixo do plano existe para uma coluna só.
 */
export interface ChargebackAndRevisedTargetProps {
  readonly data?: readonly MonthlyRevenue[];
  readonly height?: number;
  readonly className?: string;
}

interface ChargebackRow extends MonthlyRevenue {
  readonly accumulated: number | null;
}

interface Domain {
  readonly min: number;
  readonly max: number;
}

interface TargetStep {
  readonly value: number;
  readonly first: string;
  readonly last: string;
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

const AXIS_MONTH = 'mes';
const AXIS_ACCUM = 'acumulado';
const TICK_COUNT = 5;
/** Passo do eixo do mês, em reais: o domínio vai ao primeiro múltiplo além do dado, como a EIX-4 pede. */
const LEFT_STEP = 100_000;
/** Passo do eixo do acumulado, em reais. */
const RIGHT_STEP = 400_000;
const BAR_COLOR = 'var(--chart-1)';
const CHARGEBACK_COLOR = 'var(--negative)';
const ACCUM_COLOR = 'var(--chart-3)';
const TARGET_COLOR = 'var(--text-muted)';
const ZERO_COLOR = 'var(--line-strong)';
/** Abaixo das colunas, que vivem em 300, e acima da grade, que vive em −100: a linha de zero é a base da marca, não uma régua por cima dela. */
const ZERO_Z = 250;
const CURSOR = { fill: 'var(--line-subtle)' } as const;
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;
const MARGIN = { top: 12, right: 0, bottom: 0, left: 0 } as const;
/** Faixa do eixo X: 8 px de tickMargin mais cerca de 15 px de tinta de uma linha de 11 px (EIX-6b). */
const X_AXIS_HEIGHT = 23;
/** Tinta de `R$ −200 mil` em Space Grotesk a 11 px, somada glifo a glifo: 61,79 px, mais os 18 px de sobrecarga do eixo. */
const AXIS_WIDTH = 84;
const MAX_BAR_SIZE = 24;
/** Meia banda mais um respiro: o rótulo do último ponto sai da coluna daquele mês em vez de passar por cima dela. */
const LAST_LABEL_GAP = 22;
const TICK = { className: 'font-display', fill: 'var(--text-muted)', fontSize: 11 } as const;
const MINUS = '−';

/** O sinal que o Intl escreve é hífen; a seção 8 pede o sinal de menos tipográfico. O número continua saindo do formatador da casa. */
function axisTick(value: number): string {
  return formatCurrencyAxis(value).replace('-', MINUS);
}

/** Primeiro múltiplo de `step` estritamente além de `value`, no sentido do próprio sinal. */
function beyond(value: number, step: number): number {
  if (value >= 0) return (Math.floor(value / step) + 1) * step;
  return (Math.ceil(value / step) - 1) * step;
}

/** Tiques igualmente espaçados entre `min` e `max`, inclusive as duas pontas. */
function evenTicks(domain: Domain, tickCount: number): readonly number[] {
  const step = (domain.max - domain.min) / (tickCount - 1);
  return Array.from({ length: tickCount }, (_, index) => Math.round(domain.min + step * index));
}

/**
 * Põe o zero dos dois eixos no mesmo pixel.
 *
 * A fração do plano que fica abaixo do zero é `−min / (max − min)`. Quando ela difere entre os
 * dois eixos, os dois zeros caem em alturas diferentes. A função toma a maior das duas frações e
 * estica o lado negativo do outro eixo até alcançá-la, sem nunca encolher domínio: o que o dado
 * pede continua dentro.
 */
function alignZero(left: Domain, right: Domain): { readonly left: Domain; readonly right: Domain } {
  const share = (domain: Domain): number =>
    domain.max <= 0 || domain.min >= 0 ? 0 : -domain.min / (domain.max - domain.min);
  const fraction = Math.max(share(left), share(right));
  if (fraction <= 0) return { left, right };
  const stretch = (domain: Domain): Domain => ({
    min: (-fraction / (1 - fraction)) * domain.max,
    max: domain.max,
  });
  return { left: stretch(left), right: stretch(right) };
}

/** Menor e maior valor da lista, ou `null` em lista vazia: ausência não é zero (EST-1b). */
function boundsOf(values: readonly number[]): Domain | null {
  return values.reduce<Domain | null>(
    (bounds, value) =>
      bounds === null
        ? { min: value, max: value }
        : { min: Math.min(bounds.min, value), max: Math.max(bounds.max, value) },
    null,
  );
}

/** Trechos em que a meta ficou igual, na ordem dos meses: é o degrau da revisão, lido do dado. */
function targetSteps(rows: readonly MonthlyRevenue[]): readonly TargetStep[] {
  const steps: TargetStep[] = [];
  for (const row of rows) {
    const current = steps[steps.length - 1];
    if (current !== undefined && current.value === row.target) {
      steps[steps.length - 1] = { ...current, last: row.month };
      continue;
    }
    steps.push({ value: row.target, first: row.month, last: row.month });
  }
  return steps;
}

/** Soma corrida da receita, parando no primeiro mês que ainda não fechou. */
function withAccumulated(rows: readonly MonthlyRevenue[]): readonly ChargebackRow[] {
  let running = 0;
  return rows.map((row) => {
    if (row.revenue === null) return { ...row, accumulated: null };
    running += row.revenue;
    return { ...row, accumulated: running };
  });
}

export default function ChargebackAndRevisedTarget({
  data = defaultData,
  height,
  className,
}: ChargebackAndRevisedTargetProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: sem receita fechada não há acumulado nem meta a comparar.</span>
      </div>
    );
  }

  const rows = withAccumulated(data);
  const steps = targetSteps(data);
  const lastClosedIndex = rows.reduce((last, row, index) => (row.revenue === null ? last : index), -1);
  const lastClosed = lastClosedIndex >= 0 ? rows[lastClosedIndex] : undefined;
  const lastAccumulated = lastClosed?.accumulated ?? null;
  const currentTarget = lastClosed?.target ?? null;

  const monthlyValues = rows.map((row) => row.revenue).filter((value): value is number => value !== null);
  const accumValues = rows.map((row) => row.accumulated).filter((value): value is number => value !== null);
  const monthlyBounds = boundsOf(monthlyValues);
  const accumBounds = boundsOf([...accumValues, ...rows.map((row) => row.target)]);
  const rawLeft: Domain = {
    min: monthlyBounds === null || monthlyBounds.min >= 0 ? 0 : beyond(monthlyBounds.min, LEFT_STEP),
    max: monthlyBounds === null ? LEFT_STEP : beyond(monthlyBounds.max, LEFT_STEP),
  };
  const rawRight: Domain = {
    min: accumBounds === null || accumBounds.min >= 0 ? 0 : beyond(accumBounds.min, RIGHT_STEP),
    max: accumBounds === null ? RIGHT_STEP : beyond(accumBounds.max, RIGHT_STEP),
  };
  const aligned = alignZero(rawLeft, rawRight);
  const leftTicks = evenTicks(aligned.left, TICK_COUNT);
  const rightTicks = evenTicks(aligned.right, TICK_COUNT);
  const pctOfTarget =
    lastAccumulated === null || currentTarget === null || currentTarget <= 0 ? null : lastAccumulated / currentTarget;

  const summary =
    lastClosed === undefined || lastAccumulated === null || currentTarget === null || pctOfTarget === null
      ? 'Gráfico combinado sem nenhum mês fechado neste recorte para acumular contra a meta.'
      : `Colunas da receita de cada mês de 2026, com um estorno que desce abaixo do zero, e linha do acumulado do ano. O acumulado chegou a ${formatCurrencyCompact(lastAccumulated)} em ${formatMonthShort(lastClosed.month)}, ${formatPercent(pctOfTarget, 0)} da meta vigente de ${formatCurrencyCompact(currentTarget)}.`;

  const reading =
    lastClosed === undefined || lastAccumulated === null || currentTarget === null || pctOfTarget === null
      ? 'Nenhum mês fechado ainda neste recorte'
      : `Acumulado de ${formatCurrencyCompact(lastAccumulated)} até ${formatMonthShort(lastClosed.month)}, ${formatPercent(pctOfTarget, 0)} da meta vigente de ${formatCurrencyCompact(currentTarget)}`;

  const stepsNote = steps
    .map((step) => `${formatCurrencyCompact(step.value)} de ${formatMonthShort(step.first)} a ${formatMonthShort(step.last)}`)
    .join('; ');
  const scaleNote = `Meta vigente: ${stepsNote}. Os dois eixos partilham o zero, e nada além dele.`;

  function tooltipEntries(row: ChargebackRow): readonly TooltipEntry[] {
    const entries: TooltipEntry[] = [];
    if (row.revenue !== null) {
      entries.push({
        color: row.revenue < 0 ? CHARGEBACK_COLOR : BAR_COLOR,
        dataKey: 'revenue',
        graphicalItemId: 'revenue',
        name: row.revenue < 0 ? 'Estorno do mês' : 'Receita do mês',
        value: row.revenue,
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
    entries.push({
      color: TARGET_COLOR,
      dataKey: 'target',
      graphicalItemId: 'target',
      name: 'Meta vigente',
      value: row.target,
    });
    return entries;
  }

  const renderTooltip = (tooltipProps: TooltipContentProps): ReactElement | null => {
    const month = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = month === undefined ? undefined : rows.find((candidate) => candidate.month === month);
    if (tooltipProps.active !== true || !row) return null;
    return (
      <ChartTooltip
        active
        label={month}
        labelFormat="month"
        payload={tooltipEntries(row)}
        valueFormat="currencyCompact"
      />
    );
  };

  const renderBar = ({ x, y, width, height: barHeight, originalDataIndex }: BarShapeProps): ReactElement => {
    const row = rows[originalDataIndex];
    const negative = row !== undefined && row.revenue !== null && row.revenue < 0;
    return (
      <Rectangle
        fill={negative ? CHARGEBACK_COLOR : BAR_COLOR}
        height={Number(barHeight)}
        radius={negative ? [0, 0, 3, 3] : [3, 3, 0, 0]}
        width={Number(width)}
        x={Number(x)}
        y={Number(y)}
      />
    );
  };

  /**
   * O retângulo de uma coluna negativa chega com `y` no pixel do VALOR e `height` NEGATIVO, porque
   * o Recharts calcula `height = base − valor` (`cartesian/Bar.js`, ramo `horizontal`). O `Rectangle`
   * normaliza os dois na hora de desenhar, mas conta de rótulo, não: `y + height / 2` é o meio da
   * marca com qualquer sinal, e é onde este rótulo ancora, à direita da coluna e fora dela.
   */
  const renderChargebackLabel = ({ x, y, width, height: barHeight, value }: LabelProps): ReactElement | null => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount >= 0) return null;
    return (
      <text
        dominantBaseline="central"
        fill={CHARGEBACK_COLOR}
        fontSize={11}
        style={HALO}
        textAnchor="start"
        x={Number(x) + Number(width) + 8}
        y={Number(y) + Number(barHeight) / 2}
      >
        <tspan className="font-sans">estorno de </tspan>
        <tspan className="font-display">{formatCurrencyCompact(Math.abs(amount))}</tspan>
      </text>
    );
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
          x={cx + LAST_LABEL_GAP}
          y={cy + 13}
        >
          {formatCurrencyCompact(row.accumulated)}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
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
              axisLine={false}
              domain={[aligned.left.min, aligned.left.max]}
              tick={TICK}
              tickFormatter={(value: number) => axisTick(value)}
              tickLine={false}
              tickMargin={8}
              ticks={[...leftTicks]}
              width={AXIS_WIDTH}
              yAxisId={AXIS_MONTH}
            />
            <YAxis
              axisLine={false}
              domain={[aligned.right.min, aligned.right.max]}
              orientation="right"
              tick={{ ...TICK, fill: ACCUM_COLOR }}
              tickFormatter={(value: number) => axisTick(value)}
              tickLine={false}
              tickMargin={8}
              ticks={[...rightTicks]}
              width={AXIS_WIDTH}
              yAxisId={AXIS_ACCUM}
            />
            <Tooltip content={renderTooltip} cursor={CURSOR} isAnimationActive={false} />
            <ReferenceLine
              ifOverflow="extendDomain"
              stroke={ZERO_COLOR}
              y={0}
              yAxisId={AXIS_MONTH}
              zIndex={ZERO_Z}
            />
            <Bar
              dataKey="revenue"
              isAnimationActive={animate}
              maxBarSize={MAX_BAR_SIZE}
              name="Receita do mês"
              shape={renderBar}
              yAxisId={AXIS_MONTH}
            >
              <LabelList content={renderChargebackLabel} dataKey="revenue" />
            </Bar>
            <Line
              dataKey="target"
              dot={false}
              isAnimationActive={animate}
              name="Meta vigente"
              stroke={TARGET_COLOR}
              strokeDasharray="4 4"
              strokeWidth={1.5}
              type="stepAfter"
              yAxisId={AXIS_ACCUM}
            />
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
