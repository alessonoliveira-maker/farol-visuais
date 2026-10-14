import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyCostLayers } from './data';

/** Custo mensal em três camadas empilhadas, com a direta na base e o total escrito acima. */
export interface CostLayersColumnsProps {
  readonly data?: readonly MonthlyCostLayers[];
  readonly height?: number;
  readonly className?: string;
}

interface Layer {
  readonly key: 'direta' | 'rateio' | 'estrutura';
  readonly label: string;
  readonly perimeter: string;
  readonly color: string;
}

const LAYERS: readonly Layer[] = [
  { key: 'direta', label: 'Direta', perimeter: 'só o custo direto', color: 'var(--chart-1)' },
  { key: 'rateio', label: 'Rateio de time', perimeter: 'direta + tempo do time', color: 'var(--chart-3)' },
  { key: 'estrutura', label: 'Estrutura', perimeter: 'direta + time + estrutura fixa', color: 'var(--chart-6)' },
];
const MARGIN = { top: 24, right: 4, bottom: 0, left: 0 } as const;
const BAR_MAX = 24;

export default function CostLayersColumns({ data = defaultData, height, className }: CostLayersColumnsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não houve custo apurado no período.
      </div>
    );
  }

  const rows = data.map((row) => ({ ...row, total: row.direta + row.rateio + row.estrutura }));
  const totalAno = rows.reduce((sum, row) => sum + row.total, 0);
  const estruturaAno = rows.reduce((sum, row) => sum + row.estrutura, 0);
  const shareEstrutura = totalAno === 0 ? 0 : estruturaAno / totalAno;

  const summary =
    `Gráfico de colunas empilhadas com o custo mensal de ${String(rows.length)} meses em três camadas: ` +
    `direta, rateio de time e estrutura. O total do período é ${formatCurrencyCompact(totalAno)}, dos quais ` +
    `${formatPercent(shareEstrutura)} vieram da camada de estrutura.`;

  const renderTotal = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    return (
      <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor="middle" x={Number(x) + Number(width) / 2} y={Number(y) - 6}>
        {formatCurrencyCompact(row.total)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 shrink-0 text-xs text-text-secondary">
        Estrutura respondeu por <span className="kpi-number font-semibold text-text-primary">{formatPercent(shareEstrutura)}</span> do custo no ano.
      </p>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-text-muted">
        {LAYERS.map((layer) => (
          <li className="flex items-center gap-1.5" key={layer.key}>
            <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: layer.color }} />
            <span className="font-medium text-text-secondary">{layer.label}</span>: {layer.perimeter}
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="32%" data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              interval={0}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v: number) => formatCurrencyAxis(v)} tickLine={false} tickMargin={8} width={56} />
            <Tooltip content={<ChartTooltip showTotal valueFormat="currencyCompact" />} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {LAYERS.map((layer, i) => (
              <Bar
                dataKey={layer.key}
                fill={layer.color}
                isAnimationActive={animate}
                key={layer.key}
                maxBarSize={BAR_MAX}
                name={layer.label}
                radius={i === LAYERS.length - 1 ? [3, 3, 0, 0] : undefined}
                stackId="pilha"
                stroke="var(--surface-raised)"
                strokeWidth={1.5}
              >
                {i === LAYERS.length - 1 ? <LabelList content={renderTotal} dataKey="total" /> : null}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
