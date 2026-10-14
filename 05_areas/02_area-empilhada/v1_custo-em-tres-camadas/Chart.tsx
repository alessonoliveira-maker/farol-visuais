import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
} from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyCostLayer } from './data';

/**
 * Área empilhada do custo mensal em três camadas: direto na base, depois alocado e estrutura.
 * O topo da pilha é o total, escrito por extenso como total no último mês; a linha de leitura
 * dá o mesmo total e a participação de cada camada, o todo e as partes na mesma frase.
 */
export interface StackedCostAreaProps {
  readonly data?: readonly MonthlyCostLayer[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 30, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 60;
/** Acima de 8 meses o eixo mostra um a cada dois, senão os rótulos colam (EIX-7 vale até 8). */
const TICK_INTERVAL = 1;
const LAYER_STROKE = 'var(--surface-raised)';
/** Slots categóricos na ordem 1, 3, 6 da COR-8: direto, alocado, estrutura. */
const LAYER_FILL: Record<'direto' | 'alocado' | 'estrutura', string> = {
  direto: 'var(--chart-1)',
  alocado: 'var(--chart-3)',
  estrutura: 'var(--chart-6)',
};
const LAYER_ORDER: Record<string, number> = { direto: 0, alocado: 1, estrutura: 2 };
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Passo redondo de grade: 4 a 5 linhas entre 0 e o teto (EIX-4). */
function niceTicks(maxValue: number): readonly number[] {
  if (maxValue <= 0) return [0];
  const rawStep = maxValue / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const ticks: number[] = [];
  for (let value = 0; value <= maxValue + step; value += step) ticks.push(value);
  return ticks;
}

/** Percentual inteiro que soma 100 pelo maior resto (NUM-2). */
function shareOfHundred(parts: readonly number[]): readonly number[] {
  const total = parts.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return parts.map(() => 0);
  const raw = parts.map((value) => (value / total) * 100);
  const floors = raw.map(Math.floor);
  let remainder = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  const result = [...floors];
  for (const { index } of order) {
    if (remainder <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    remainder -= 1;
  }
  return result;
}

export default function StackedCostArea({ data = defaultData, height, className }: StackedCostAreaProps) {
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
        <span>Nenhum mês neste recorte: não há custo lançado no período.</span>
      </div>
    );
  }

  const rows = data.map((row) => ({ ...row, total: row.direto + row.alocado + row.estrutura }));
  const first = rows[0];
  const last = rows[rows.length - 1];
  const maxTotal = Math.max(...rows.map((row) => row.total));
  const ticks = niceTicks(maxTotal);
  const yMax = ticks[ticks.length - 1] ?? maxTotal;
  const [direto, alocado, estrutura] = last ? shareOfHundred([last.direto, last.alocado, last.estrutura]) : [0, 0, 0];

  const summary = first && last
    ? `Área empilhada com o custo mensal em três camadas de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)} de 2026. ` +
      `Fechou em ${formatCurrencyCompact(last.total)}, sendo ${String(direto)}% direto, ${String(alocado)}% alocado e ${String(estrutura)}% estrutura.`
    : 'Área empilhada do custo mensal em três camadas.';

  const renderTotalLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index === undefined || index !== rows.length - 1) return null;
    const row = rows[index];
    if (!row) return null;
    return (
      <text
        className="font-display"
        fill="var(--text-primary)"
        fontSize={12}
        fontWeight={700}
        style={HALO}
        textAnchor="end"
        x={Number(x)}
        y={Number(y) - 10}
      >
        <tspan className="font-sans" fill="var(--text-secondary)" fontWeight={500}>
          total{' '}
        </tspan>
        {formatCurrencyCompact(row.total)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {last ? (
        <p aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
          <span>
            Total em <span className="font-display font-semibold text-text-primary">{formatMonthShort(last.month)}</span>:{' '}
            <span className="kpi-number font-semibold text-text-primary">{formatCurrencyCompact(last.total)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span aria-hidden className="size-2 shrink-0 rounded-sm bg-chart-1" />
            Direto {String(direto)}%
          </span>
          <span className="flex items-center gap-1">
            <span aria-hidden className="size-2 shrink-0 rounded-sm bg-chart-3" />
            Alocado {String(alocado)}%
          </span>
          <span className="flex items-center gap-1">
            <span aria-hidden className="size-2 shrink-0 rounded-sm bg-chart-6" />
            Estrutura {String(estrutura)}%
          </span>
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              interval={TICK_INTERVAL}
              tickFormatter={formatMonthShort}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, yMax]}
              tickFormatter={formatCurrencyAxis}
              tickLine={false}
              ticks={[...ticks]}
              width={VALUE_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="month" showTotal valueFormat="currencyCompact" />}
              cursor={{ stroke: 'var(--line-strong)' }}
              isAnimationActive={false}
              itemSorter={(item) => -(LAYER_ORDER[String(item.dataKey)] ?? 0)}
            />
            <Area
              dataKey="direto"
              fill={LAYER_FILL.direto}
              fillOpacity={0.9}
              isAnimationActive={animate}
              name="Direto"
              stackId="custo"
              stroke={LAYER_STROKE}
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="alocado"
              fill={LAYER_FILL.alocado}
              fillOpacity={0.9}
              isAnimationActive={animate}
              name="Alocado"
              stackId="custo"
              stroke={LAYER_STROKE}
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="estrutura"
              fill={LAYER_FILL.estrutura}
              fillOpacity={0.9}
              isAnimationActive={animate}
              name="Estrutura"
              stackId="custo"
              stroke={LAYER_STROKE}
              strokeWidth={2}
              type="monotone"
            >
              <LabelList content={renderTotalLabel} dataKey="total" />
            </Area>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
