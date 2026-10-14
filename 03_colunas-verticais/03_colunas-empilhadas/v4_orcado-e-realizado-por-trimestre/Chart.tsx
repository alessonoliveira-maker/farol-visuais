import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QuarterlyBudgetRow } from './data';

/**
 * Orçado (contorno) e realizado (sólido) lado a lado por trimestre, com o regime rotulado sob
 * cada coluna e o trimestre lido acima do par, num único eixo com tique de duas linhas.
 */
export interface BudgetVsActualColumnsProps {
  readonly data?: readonly QuarterlyBudgetRow[];
  readonly height?: number;
  readonly className?: string;
}

interface Layer {
  readonly key: 'consultoria' | 'gestao' | 'imoveis';
  readonly label: string;
  readonly color: string;
}

const LAYERS: readonly Layer[] = [
  { key: 'consultoria', label: 'Consultoria', color: 'var(--chart-1)' },
  { key: 'gestao', label: 'Gestão de carteira', color: 'var(--chart-3)' },
  { key: 'imoveis', label: 'Imóveis', color: 'var(--chart-6)' },
];
const MARGIN = { top: 24, right: 4, bottom: 0, left: 0 } as const;
const BAR_MAX = 20;
const AXIS_HEIGHT = 38;

interface AxisTickProps {
  readonly x: number | string;
  readonly y: number | string;
  readonly index: number;
}

function total(row: QuarterlyBudgetRow): number {
  return (row.consultoria ?? 0) + (row.gestao ?? 0) + (row.imoveis ?? 0);
}

function nonNullTooltip(props: TooltipContentProps<TooltipValueType, number | string>): ReactElement {
  const filtered = (props.payload ?? []).filter((entry) => typeof entry.value === 'number') as ChartTooltipProps['payload'];
  return <ChartTooltip active={props.active} label={props.label} payload={filtered} valueFormat="currencyCompact" />;
}

export default function BudgetVsActualColumns({ data = defaultData, height, className }: BudgetVsActualColumnsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum trimestre neste recorte: não há orçado nem realizado no período.
      </div>
    );
  }

  const rows = data.map((row) => ({ ...row, axisLabel: `${row.quarter} ${row.regime === 'orcado' ? 'orçado' : 'realizado'}` }));
  const t3Orcado = rows.find((row) => row.quarter === 'T3/2026' && row.regime === 'orcado');
  const t3Real = rows.find((row) => row.quarter === 'T3/2026' && row.regime === 'realizado');
  const diff = t3Real && t3Orcado ? total(t3Real) - total(t3Orcado) : 0;
  const semOrcamento = rows.find((row) => row.regime === 'orcado' && !row.budgetApproved);

  const summary =
    `Gráfico de colunas empilhadas comparando orçado e realizado em quatro trimestres de 2026, em três linhas de custo. ` +
    `${t3Real && t3Orcado ? `O terceiro trimestre passou o orçado em ${formatCurrencyCompact(Math.abs(diff))}. ` : ''}` +
    `${semOrcamento ? `${semOrcamento.quarter} não teve orçamento aprovado.` : ''}`;

  const renderAxisTick = ({ x, y, index }: AxisTickProps): ReactElement | null => {
    const row = rows[index];
    if (!row) return null;
    const isFirstOfPair = row.regime === 'orcado';
    const regimeLabel = row.regime === 'orcado' ? (row.budgetApproved ? 'orç.' : 'sem orçamento') : 'real.';
    return (
      <g transform={`translate(${String(x)},${String(y)})`}>
        {isFirstOfPair ? (
          <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={600} textAnchor="start" x={-8} y={12}>
            {row.quarter}
          </text>
        ) : null}
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={0} y={28}>
          {regimeLabel}
        </text>
      </g>
    );
  };

  const renderDiff = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row || row.quarter !== 'T3/2026' || row.regime !== 'realizado') return null;
    const sign = diff >= 0 ? '+' : '−';
    return (
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={Number(x) + Number(width) / 2} y={Number(y) - 6}>
        {`${sign}${formatCurrencyCompact(Math.abs(diff))} vs orçado`}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-text-secondary">
        {LAYERS.map((layer) => (
          <span className="flex items-center gap-1.5" key={layer.key}>
            <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: layer.color }} />
            {layer.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-text-muted">
          <span aria-hidden className="size-2.5 shrink-0 border border-text-muted" />
          Orçado (contorno)
        </span>
        <span className="flex items-center gap-1.5 text-text-muted">
          <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: 'var(--text-muted)' }} />
          Realizado (sólido)
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="20%" data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis axisLine={false} dataKey="axisLabel" height={AXIS_HEIGHT} interval={0} tick={renderAxisTick} tickLine={false} />
            <YAxis
              axisLine={false}
              domain={[0, 'dataMax']}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={(v: number) => formatCurrencyAxis(v)}
              tickLine={false}
              tickMargin={8}
              width={56}
            />
            <Tooltip content={nonNullTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {LAYERS.map((layer, i) => (
              <Bar dataKey={layer.key} isAnimationActive={animate} key={layer.key} maxBarSize={BAR_MAX} name={layer.label} radius={i === LAYERS.length - 1 ? [3, 3, 0, 0] : undefined} stackId="pilha" strokeWidth={1.5}>
                {rows.map((row) => (
                  <Cell fill={row.regime === 'realizado' ? layer.color : 'transparent'} key={`${layer.key}-${row.axisLabel}`} stroke={layer.color} />
                ))}
                {i === LAYERS.length - 1 ? <LabelList content={renderDiff} dataKey={layer.key} /> : null}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
