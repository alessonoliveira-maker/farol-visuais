import { Filter } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
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
import {
  formatCurrency,
  formatCurrencyAxis,
  formatCurrencyCompact,
  formatMonthShort,
  formatPercent,
  formatRateWithVolume,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { annualTarget, data as defaultData, type MonthlyRevenue } from './data';

/**
 * Receita de cada mês contra o ritmo linear da meta anual, com o acumulado do ano, em dois modos
 * de leitura que carregam as mesmas cores e os mesmos domínios: dois painéis alinhados, que é o
 * que a EIX-8 do contrato manda, e o eixo duplo, que o catálogo pede para esta versão demonstrar.
 *
 * O modo painéis é o padrão, e por isso é ele que o preview retrata. O eixo duplo não se defende
 * com uma frase de rodapé dizendo que as escalas são independentes: quando ele está ligado, a peça
 * imprime a taxa de câmbio implícita que o desenho está afirmando entre as duas grandezas e o que
 * essa taxa vira com um passo a mais no eixo da direita, sem nenhum número do dado mudar.
 */
export interface LinearPaceProps {
  readonly data?: readonly MonthlyRevenue[];
  /** Modo inicial de leitura. O padrão é `paineis`, que é a entrega sem eixo duplo. */
  readonly initialMode?: 'paineis' | 'duplo';
  readonly height?: number;
  readonly className?: string;
}

type Mode = 'paineis' | 'duplo';

interface PaceRow extends MonthlyRevenue {
  readonly accumulated: number | null;
  readonly abovePace: boolean;
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

const AXIS_MONTH = 'mes';
const AXIS_ACCUM = 'acumulado';
const TICK_COUNT = 3;
/** Altura declarada do ritmo linear no eixo do mês: metade do eixo, o que fixa o domínio em duas vezes o ritmo. */
const PACE_AT = 0.5;
const ACCUM_COLOR = 'var(--chart-1)';
const ABOVE_COLOR = 'var(--positive)';
const BELOW_COLOR = 'var(--negative)';
const REFERENCE_COLOR = 'var(--text-muted)';
const CURSOR = { fill: 'var(--line-subtle)' } as const;
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;
const MARGIN = { top: 20, right: 8, bottom: 0, left: 0 } as const;
/** Faixa do eixo X: 8 px de tickMargin mais cerca de 15 px de tinta de uma linha de 11 px (EIX-6b). */
const X_AXIS_HEIGHT = 23;
/** O painel de cima reserva no rodapé a mesma faixa que o de baixo gasta com o eixo, senão os dois planos saem de alturas diferentes (EIX-12). */
const MARGIN_TOP_PANEL = { top: 20, right: 8, bottom: X_AXIS_HEIGHT, left: 0 } as const;
/** Tinta de `R$ 12,0 mi` em Space Grotesk tabular a 11 px, somada glifo a glifo: 56,66 px, mais os 18 px de sobrecarga do eixo. Os dois painéis usam a mesma largura para o plano nascer na mesma coluna. */
const AXIS_WIDTH = 76;
const MAX_BAR_SIZE = 24;
const TICK = { className: 'font-display', fill: REFERENCE_COLOR, fontSize: 11 } as const;
const MODE_LABEL: Readonly<Record<Mode, string>> = { paineis: 'Painéis', duplo: 'Eixo duplo' };

interface ReferenceLabelProps {
  readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number };
}

/** Tiques igualmente espaçados de zero até `domainMax`: o topo é sempre um valor com significado, então dividir em partes iguais o mantém exato no último tique. */
function evenTicks(domainMax: number, tickCount: number): readonly number[] {
  if (domainMax <= 0) return Array.from({ length: tickCount }, (_, index) => index);
  const step = domainMax / (tickCount - 1);
  return Array.from({ length: tickCount }, (_, index) => Math.round(step * index));
}

/** Maior valor da lista, ou `null` em lista vazia: ausência não é zero (EST-1b). */
function maxOf(values: readonly number[]): number | null {
  return values.reduce<number | null>((max, value) => (max === null || value > max ? value : max), null);
}

/** Soma acumulada mês a mês, parando no primeiro mês sem receita fechada. */
function withAccumulated(rows: readonly MonthlyRevenue[], pace: number): readonly PaceRow[] {
  let running = 0;
  return rows.map((row) => {
    if (row.revenue === null) return { ...row, accumulated: null, abovePace: false };
    running += row.revenue;
    return { ...row, accumulated: running, abovePace: row.revenue >= pace };
  });
}

export default function LinearPace({
  data = defaultData,
  initialMode = 'paineis',
  height,
  className,
}: LinearPaceProps) {
  const animate = useAnimateOnce();
  const [mode, setMode] = useState<Mode>(initialMode);
  const style = height === undefined ? undefined : { height };
  const pace = annualTarget / 12;

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: sem receita fechada não há ritmo linear a comparar.</span>
      </div>
    );
  }

  const rows = withAccumulated(data, pace);
  const closed = rows.filter((row) => row.revenue !== null);
  const above = closed.filter((row) => row.abovePace);
  const lastClosedIndex = rows.reduce((last, row, index) => (row.revenue === null ? last : index), -1);
  const lastClosed = lastClosedIndex >= 0 ? rows[lastClosedIndex] : undefined;
  const lastAccumulated = lastClosed?.accumulated ?? null;

  const monthlyValues = rows.map((row) => row.revenue).filter((value): value is number => value !== null);
  const maxMonthly = maxOf(monthlyValues);
  const leftDomainMax = maxMonthly === null ? pace / PACE_AT : Math.max(pace / PACE_AT, maxMonthly);
  const rightDomainMax = lastAccumulated === null ? annualTarget : Math.max(annualTarget, lastAccumulated);
  const leftTicks = evenTicks(leftDomainMax, TICK_COUNT);
  const rightTicks = evenTicks(rightDomainMax, TICK_COUNT);
  const pctOfTarget = lastAccumulated === null ? null : lastAccumulated / annualTarget;
  const paceRate = formatRateWithVolume(above.length, closed.length);
  /** A taxa de câmbio que o eixo duplo afirma: quanto de acumulado o desenho iguala a um real de mês. */
  const implicitRate = rightDomainMax / leftDomainMax;
  const nextStepRate = (rightDomainMax + rightDomainMax / (TICK_COUNT - 1)) / leftDomainMax;

  const summary =
    pctOfTarget === null
      ? 'Gráfico combinado sem nenhum mês fechado neste recorte para comparar com o ritmo linear da meta anual.'
      : `Gráfico combinado da receita mensal de 2026 com o acumulado do ano. ${paceRate} dos meses fechados ficaram acima do ritmo linear de ${formatCurrencyCompact(pace)}, e o acumulado chegou a ${formatPercent(pctOfTarget, 0)} da meta anual de ${formatCurrencyCompact(annualTarget)}.`;

  const reading =
    pctOfTarget === null
      ? 'Nenhum mês fechado ainda neste recorte'
      : `${paceRate} dos meses fechados acima do ritmo linear de ${formatCurrencyCompact(pace)} por mês`;

  const scaleNote =
    mode === 'duplo'
      ? `Eixo duplo: o desenho equipara ${formatCurrency(1)} do mês a ${formatCurrency(implicitRate)} do acumulado, e um passo a mais no eixo da direita leva o empate a ${formatCurrency(nextStepRate)}.`
      : 'Painéis: cada grandeza tem o seu plano, e nenhuma altura equipara uma à outra.';

  const xAxis = {
    axisLine: false,
    dataKey: 'month',
    height: X_AXIS_HEIGHT,
    interval: 0,
    tick: TICK,
    tickFormatter: (value: string) => formatMonthShort(value),
    tickLine: false,
    tickMargin: 8,
  } as const;

  function tooltipEntries(row: PaceRow, withMonth: boolean, withAccum: boolean): readonly TooltipEntry[] {
    const entries: TooltipEntry[] = [];
    if (withMonth && row.revenue !== null) {
      entries.push({
        color: row.abovePace ? ABOVE_COLOR : BELOW_COLOR,
        dataKey: 'revenue',
        graphicalItemId: 'revenue',
        name: row.abovePace ? 'Mês acima do ritmo' : 'Mês abaixo do ritmo',
        value: row.revenue,
      });
    }
    if (withAccum && row.accumulated !== null) {
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

  const makeTooltip =
    (withMonth: boolean, withAccum: boolean) =>
    (tooltipProps: TooltipContentProps): ReactElement | null => {
      const month = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
      const row = month === undefined ? undefined : rows.find((candidate) => candidate.month === month);
      if (tooltipProps.active !== true || !row) return null;
      return (
        <ChartTooltip
          active
          label={month}
          labelFormat="month"
          payload={tooltipEntries(row, withMonth, withAccum)}
          valueFormat="currencyCompact"
        />
      );
    };

  const renderBar = ({ x, y, width, height: barHeight, originalDataIndex }: BarShapeProps): ReactElement => {
    const row = rows[originalDataIndex];
    return (
      <Rectangle
        fill={row?.abovePace === true ? ABOVE_COLOR : BELOW_COLOR}
        height={Number(barHeight)}
        radius={[3, 3, 0, 0]}
        width={Number(width)}
        x={Number(x)}
        y={Number(y)}
      />
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
          x={cx + 8}
          y={cy - 11}
        >
          {formatCurrencyCompact(row.accumulated)}
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
        <tspan className="font-display">{formatCurrencyCompact(value)}</tspan>
      </text>
    );

  const accumulatedPanel = (
    <ResponsiveContainer height="100%" width="100%">
      <ComposedChart accessibilityLayer={false} barCategoryGap="34%" data={[...rows]} margin={MARGIN_TOP_PANEL}>
        <CartesianGrid stroke="var(--line-subtle)" vertical={false} yAxisId={AXIS_ACCUM} />
        <XAxis {...xAxis} hide scale="band" />
        <YAxis
          axisLine={false}
          domain={[0, rightDomainMax]}
          orientation="left"
          tick={TICK}
          tickFormatter={(value: number) => formatCurrencyAxis(value)}
          tickLine={false}
          tickMargin={8}
          ticks={[...rightTicks]}
          width={AXIS_WIDTH}
          yAxisId={AXIS_ACCUM}
        />
        <Tooltip content={makeTooltip(false, true)} cursor={CURSOR} isAnimationActive={false} />
        <ReferenceLine
          ifOverflow="extendDomain"
          label={renderReferenceLabel('Meta anual', annualTarget)}
          stroke={REFERENCE_COLOR}
          strokeDasharray="3 3"
          y={annualTarget}
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
  );

  const monthlyPanel = (
    <ResponsiveContainer height="100%" width="100%">
      <ComposedChart accessibilityLayer={false} barCategoryGap="34%" data={[...rows]} margin={MARGIN}>
        <CartesianGrid stroke="var(--line-subtle)" vertical={false} yAxisId={AXIS_MONTH} />
        <XAxis {...xAxis} />
        <YAxis
          axisLine={false}
          domain={[0, leftDomainMax]}
          tick={TICK}
          tickFormatter={(value: number) => formatCurrencyAxis(value)}
          tickLine={false}
          tickMargin={8}
          ticks={[...leftTicks]}
          width={AXIS_WIDTH}
          yAxisId={AXIS_MONTH}
        />
        <Tooltip content={makeTooltip(true, false)} cursor={CURSOR} isAnimationActive={false} />
        <ReferenceLine
          ifOverflow="extendDomain"
          label={renderReferenceLabel('Ritmo linear', pace)}
          stroke={REFERENCE_COLOR}
          strokeDasharray="3 3"
          y={pace}
          yAxisId={AXIS_MONTH}
        />
        <Bar
          dataKey="revenue"
          isAnimationActive={animate}
          maxBarSize={MAX_BAR_SIZE}
          name="Receita do mês"
          shape={renderBar}
          yAxisId={AXIS_MONTH}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const dualChart = (
    <ResponsiveContainer height="100%" width="100%">
      <ComposedChart accessibilityLayer={false} barCategoryGap="34%" data={[...rows]} margin={MARGIN}>
        <CartesianGrid stroke="var(--line-subtle)" vertical={false} yAxisId={AXIS_MONTH} />
        <XAxis {...xAxis} />
        <YAxis
          axisLine={false}
          domain={[0, leftDomainMax]}
          tick={TICK}
          tickFormatter={(value: number) => formatCurrencyAxis(value)}
          tickLine={false}
          tickMargin={8}
          ticks={[...leftTicks]}
          width={AXIS_WIDTH}
          yAxisId={AXIS_MONTH}
        />
        <YAxis
          axisLine={false}
          domain={[0, rightDomainMax]}
          orientation="right"
          tick={{ ...TICK, fill: ACCUM_COLOR }}
          tickFormatter={(value: number) => formatCurrencyAxis(value)}
          tickLine={false}
          tickMargin={8}
          ticks={[...rightTicks]}
          width={AXIS_WIDTH}
          yAxisId={AXIS_ACCUM}
        />
        <Tooltip content={makeTooltip(true, true)} cursor={CURSOR} isAnimationActive={false} />
        <ReferenceLine
          ifOverflow="extendDomain"
          label={renderReferenceLabel('Ritmo linear', pace)}
          stroke={REFERENCE_COLOR}
          strokeDasharray="3 3"
          y={pace}
          yAxisId={AXIS_MONTH}
        />
        <Bar
          dataKey="revenue"
          isAnimationActive={animate}
          maxBarSize={MAX_BAR_SIZE}
          name="Receita do mês"
          shape={renderBar}
          yAxisId={AXIS_MONTH}
        />
        <Line
          activeDot={false}
          connectNulls={false}
          dataKey="accumulated"
          dot={false}
          isAnimationActive={animate}
          legendType="none"
          name="Revestimento do acumulado"
          stroke="var(--surface-raised)"
          strokeWidth={5}
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
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
        <p aria-hidden className="text-xs text-text-secondary">
          {reading}
        </p>
        <div
          aria-label="Modo de leitura"
          className="inline-flex shrink-0 rounded-md border border-line-subtle p-0.5"
          role="radiogroup"
        >
          {(Object.keys(MODE_LABEL) as Mode[]).map((key) => (
            <button
              aria-checked={mode === key}
              className={cn('rounded px-1.5 py-0.5 text-xs font-medium', mode === key ? 'bg-chart-1' : 'text-text-secondary')}
              key={key}
              onClick={() => {
                setMode(key);
              }}
              role="radio"
              style={mode === key ? { color: 'var(--accent-cyan-contrast)' } : undefined}
              type="button"
            >
              {MODE_LABEL[key]}
            </button>
          ))}
        </div>
      </div>
      {mode === 'paineis' ? (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex min-h-0 flex-1 flex-col">
            <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
              Acumulado do ano (R$)
            </p>
            <div className="min-h-0 flex-1">{accumulatedPanel}</div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
              Receita do mês (R$)
            </p>
            <div className="min-h-0 flex-1">{monthlyPanel}</div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <p aria-hidden className="flex shrink-0 justify-between text-xs font-medium text-text-secondary">
            <span>Receita do mês (R$), eixo da esquerda</span>
            <span style={{ color: ACCUM_COLOR }}>Acumulado do ano (R$), eixo da direita</span>
          </p>
          <div className="min-h-0 flex-1">{dualChart}</div>
        </div>
      )}
      <p aria-hidden className="mt-2 shrink-0 text-[11px] text-text-muted">
        {scaleNote}
      </p>
    </div>
  );
}
