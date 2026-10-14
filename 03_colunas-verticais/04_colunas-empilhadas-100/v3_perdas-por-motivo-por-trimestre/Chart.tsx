import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QuarterLosses } from './data';

/** Colunas a 100% no caso denso: motivos de perda por trimestre, em ordem fixa pelo peso recente. */
export interface LossReasonQuartersProps {
  readonly data?: readonly QuarterLosses[];
  readonly height?: number;
  readonly className?: string;
}

type RankableId = 'semFit' | 'preco' | 'concorrencia' | 'semRetorno' | 'outros';
type MotiveId = RankableId | 'semMotivo';

interface MotiveMeta {
  readonly label: string;
  readonly slot?: 1 | 2 | 3 | 4 | 5 | 6;
}

interface AxisTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly index?: number;
}

const RANKABLE: readonly RankableId[] = ['semFit', 'preco', 'concorrencia', 'semRetorno', 'outros'];
const META: Readonly<Record<MotiveId, MotiveMeta>> = {
  semFit: { label: 'Sem fit', slot: 1 },
  preco: { label: 'Preço', slot: 3 },
  concorrencia: { label: 'Concorrência', slot: 6 },
  semRetorno: { label: 'Sem retorno do contato', slot: 5 },
  outros: { label: 'Outros (3 motivos)', slot: 2 },
  semMotivo: { label: 'Sem motivo registrado' },
};
const MARGIN = { top: 8, right: 4, bottom: 0, left: 4 } as const;
const BAR_MAX = 24;
/** Largo o bastante para "Sem retorno do contato" (o rótulo mais longo) nunca cortar (TIP-7). */
const LEGEND_WIDTH = 216;

/** Percentuais inteiros que somam 100 pelo maior resto. */
function largestRemainder(values: readonly number[], total: number): number[] {
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const shares = raw.map((value) => Math.floor(value));
  let missing = 100 - shares.reduce((sum, value) => sum + value, 0);
  const bySurplus = raw
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of bySurplus) {
    if (missing <= 0) break;
    shares[index] = (shares[index] ?? 0) + 1;
    missing -= 1;
  }
  return shares;
}

function totalOf(row: QuarterLosses): number {
  return row.semFit + row.preco + row.concorrencia + row.semRetorno + row.outros + row.semMotivo;
}

export default function LossReasonQuarters({ data = defaultData, height, className }: LossReasonQuartersProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum trimestre neste recorte: não há perdas para comparar.
      </div>
    );
  }

  const last = data[data.length - 1]!;
  const first = data[0]!;
  /** Ordem fixa pelo peso do motivo no trimestre mais recente; a ausência fica sempre por último. */
  const order: readonly MotiveId[] = [...[...RANKABLE].sort((a, b) => last[b] - last[a]), 'semMotivo'];
  const rows = data.map((row) => ({ ...row, n: totalOf(row) }));
  /** Mesma conta do maior resto da legenda, para a linha de leitura nunca divergir dela em 1 ponto. */
  const firstShares = largestRemainder(order.map((id) => first[id]), totalOf(first));
  const lastShares = largestRemainder(order.map((id) => last[id]), totalOf(last));
  const concFirstPct = firstShares[order.indexOf('concorrencia')] ?? 0;
  const concLastPct = lastShares[order.indexOf('concorrencia')] ?? 0;

  const summary =
    `Gráfico de colunas empilhadas a 100% com motivos de perda em ${String(rows.length)} trimestres, ` +
    `ordenados pelo peso no trimestre mais recente. Concorrência sobe de ${formatInt(concFirstPct)}% em T1 para ` +
    `${formatInt(concLastPct)}% no último trimestre e vira o motivo mais citado, com ${formatInt(last.concorrencia)} ` +
    `de ${formatInt(totalOf(last))} perdas.`;

  const renderQuarterTick = ({ x, y, index }: AxisTickProps): ReactElement => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return <g />;
    return (
      <g>
        <text className="font-sans" fill="var(--text-muted)" fontSize={12} textAnchor="middle" x={Number(x)} y={Number(y) + 14}>
          {row.quarter}
        </text>
        <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor="middle" x={Number(x)} y={Number(y) + 28}>
          {`${formatInt(row.n)} perdas`}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">Concorrência</span> sobe de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(concFirstPct)}%</span> para{' '}
        <span className="kpi-number font-semibold text-text-primary">{formatInt(concLastPct)}%</span> das perdas e vira o motivo mais citado
      </p>
      <div className="flex min-h-0 flex-1 gap-6">
        <div className="min-h-0 min-w-0 flex-1">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart accessibilityLayer={false} barCategoryGap="32%" data={rows} margin={MARGIN} stackOffset="expand">
              <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
              <XAxis axisLine={false} dataKey="quarter" height={44} interval={0} tick={renderQuarterTick} tickLine={false} />
              <YAxis axisLine={false} domain={[0, 1]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(value: number) => formatPercent(value, 0)} tickLine={false} tickMargin={8} ticks={[0, 0.5, 1]} width={44} />
              <Tooltip content={<ChartTooltip valueFormat="int" />} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} itemSorter={(item) => -order.indexOf(item.dataKey as MotiveId)} />
              {order.map((id, i) => {
                const slot = META[id].slot;
                const color = slot === undefined ? undefined : (CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)');
                return (
                  <Bar
                    dataKey={id}
                    fill={color ?? 'none'}
                    isAnimationActive={animate}
                    key={id}
                    maxBarSize={BAR_MAX}
                    name={META[id].label}
                    radius={i === order.length - 1 ? [3, 3, 0, 0] : undefined}
                    stackId="pilha"
                    stroke={color === undefined ? 'var(--text-muted)' : 'var(--surface-raised)'}
                    strokeWidth={color === undefined ? 1 : 1.5}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ul aria-hidden className="flex shrink-0 flex-col justify-center gap-2.5 text-xs text-text-secondary" style={{ width: LEGEND_WIDTH }}>
          {[...order].reverse().map((id) => {
            const meta = META[id];
            const color = meta.slot === undefined ? undefined : (CHART_SERIES_COLORS[meta.slot - 1] ?? 'var(--chart-1)');
            const pct = lastShares[order.indexOf(id)] ?? 0;
            return (
              <li className="grid grid-cols-[10px_1fr_auto] items-center gap-2" key={id}>
                <span aria-hidden className={cn('size-2.5 shrink-0 rounded-[2px]', color === undefined && 'border-[1.5px] border-text-muted')} style={color === undefined ? undefined : { backgroundColor: color }} />
                <span className="truncate">{meta.label}</span>
                <span className="kpi-number text-right text-text-primary">{formatInt(pct)}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
