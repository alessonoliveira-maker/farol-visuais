import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';
import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyRevenueVsTarget } from './data';

/**
 * Colunas com a receita reconhecida de cada mês e uma linha com a meta do mesmo mês, no mesmo
 * eixo y. A dica mostra realizado, meta e a diferença entre os dois; o último ponto da linha
 * carrega o rótulo direto da meta vigente.
 */
export interface MonthlyRevenueBarLineProps {
  readonly data?: readonly MonthlyRevenueVsTarget[];
  readonly height?: number;
  readonly className?: string;
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

const MARGIN = { top: 26, right: 10, bottom: 0, left: 0 } as const;
const Y_AXIS_WIDTH = 58;
const MAX_BAR_SIZE = 30;
const GRID_STEPS = 4;
const BAR_FILL = 'var(--chart-1)';
const LINE_STROKE = 'var(--chart-3)';
/** Halo na cor do cartão: o rótulo da meta continua legível sobre a coluna do último mês. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Menor número redondo (1, 2 ou 5 vezes uma potência de 10) que não fica abaixo do passo pedido. */
function niceStep(roughStep: number): number {
  if (roughStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(roughStep));
  const magnitude = 10 ** exponent;
  const fraction = roughStep / magnitude;
  const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * magnitude;
}

/** Domínio a partir do zero, com a primeira linha de grade redonda acima do maior valor (EIX-1, EIX-4). */
function buildDomain(maxValue: number): { domainMax: number; ticks: readonly number[] } {
  const step = niceStep(maxValue / GRID_STEPS);
  const domainMax = Math.ceil(maxValue / step) * step;
  const count = Math.round(domainMax / step);
  return { domainMax, ticks: Array.from({ length: count + 1 }, (_, i) => i * step) };
}

/**
 * As três linhas da dica de um mês: realizado, meta e a diferença entre os dois.
 *
 * Construída a partir do próprio `data`, e não do `payload` que o Recharts devolve, porque o
 * tipo genérico do `payload` nativo (`ValueType`, que inclui array) não fecha com o tipo mais
 * estrito que o `ChartTooltip` do Farol declara (DIC-2); buscar o mês pela própria linha do
 * dado evita o conflito de tipos sem reimplementar a dica.
 */
function buildTooltipEntries(row: MonthlyRevenueVsTarget): readonly TooltipEntry[] {
  const diff = row.revenue - row.target;
  return [
    { color: BAR_FILL, dataKey: 'revenue', graphicalItemId: 'revenue', name: 'Receita reconhecida', value: row.revenue },
    { color: LINE_STROKE, dataKey: 'target', graphicalItemId: 'target', name: 'Meta', value: row.target },
    {
      color: diff >= 0 ? 'var(--positive)' : 'var(--negative)',
      dataKey: 'diff',
      graphicalItemId: 'diff',
      name: 'Diferença',
      value: `${diff >= 0 ? '+' : '−'}${formatCurrencyCompact(Math.abs(diff))}`,
    },
  ];
}

export default function MonthlyRevenueBarLine({
  data = defaultData,
  height,
  className,
}: MonthlyRevenueBarLineProps) {
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
        <span>Nenhum mês neste recorte: não há receita reconhecida nem meta para comparar.</span>
      </div>
    );
  }

  const rows = data;
  const maxValue = rows.reduce((max, row) => Math.max(max, row.revenue, row.target), 0);
  const { domainMax, ticks } = buildDomain(maxValue);
  const xTicks = rows.filter((_, index) => index % 2 === 0).map((row) => row.month);
  const hits = rows.filter((row) => row.revenue >= row.target).length;

  const worst = rows.reduce<{ row: MonthlyRevenueVsTarget; diff: number } | null>((acc, row) => {
    const diff = row.revenue - row.target;
    if (diff >= 0) return acc;
    return acc === null || diff < acc.diff ? { row, diff } : acc;
  }, null);

  const lastRow = rows[rows.length - 1];

  const summary = [
    `Gráfico de colunas com a receita reconhecida mensal de ${String(rows.length)} meses de 2026 e linha com a meta de cada mês.`,
    `${String(hits)} de ${String(rows.length)} meses bateram a meta.`,
    worst
      ? `Maior falta em ${formatMonthShort(worst.row.month)}, ${formatCurrencyCompact(Math.abs(worst.diff))} abaixo da meta.`
      : 'Todos os meses bateram a meta.',
  ].join(' ');

  const reading = worst
    ? `${String(hits)} de ${String(rows.length)} meses bateram a meta; maior falta em ${formatMonthShort(worst.row.month)}, ${formatCurrencyCompact(Math.abs(worst.diff))} abaixo`
    : `Os ${String(rows.length)} meses bateram a meta do ano`;

  const renderTargetLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index === undefined || index !== rows.length - 1 || !lastRow) return null;
    return (
      <text
        className="font-display"
        fill="var(--chart-3)"
        fontSize={12}
        fontWeight={700}
        style={HALO}
        textAnchor="end"
        x={Number(x)}
        y={Number(y) - 10}
      >
        Meta {formatCurrencyCompact(lastRow.target)}
      </text>
    );
  };

  const renderTooltip = (tooltipProps: TooltipContentProps): ReactElement | null => {
    const month = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = month === undefined ? undefined : rows.find((candidate) => candidate.month === month);
    if (!tooltipProps.active || !row) return null;
    return (
      <ChartTooltip
        active={tooltipProps.active}
        label={month}
        labelFormat="month"
        payload={buildTooltipEntries(row)}
        valueFormat="currencyCompact"
      />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} barCategoryGap="34%" data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickMargin={8}
              ticks={xTicks}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, domainMax]}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              ticks={[...ticks]}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={renderTooltip}
              cursor={{ fill: 'var(--line-subtle)' }}
              isAnimationActive={false}
              itemSorter={(item) => (item.dataKey === 'revenue' ? 0 : item.dataKey === 'target' ? 1 : 2)}
            />
            <Bar
              dataKey="revenue"
              fill={BAR_FILL}
              isAnimationActive={animate}
              maxBarSize={MAX_BAR_SIZE}
              name="Receita reconhecida"
              radius={[3, 3, 0, 0]}
            />
            <Line
              activeDot={{ r: 4, fill: LINE_STROKE }}
              dataKey="target"
              dot={{ r: 3, fill: LINE_STROKE, strokeWidth: 0 }}
              isAnimationActive={animate}
              name="Meta"
              stroke={LINE_STROKE}
              strokeWidth={2}
              type="monotone"
            >
              <LabelList content={renderTargetLabel} dataKey="target" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
