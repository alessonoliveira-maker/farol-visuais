import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyPaidShare } from './data';

/** Colunas a 100% com a origem paga na base: quando ela passa do limiar de 70% do mix. */
export interface PaidShareColumnsProps {
  readonly data?: readonly MonthlyPaidShare[];
  readonly height?: number;
  readonly className?: string;
}

const THRESHOLD = 0.7;
/** Topo ganha espaço para duas linhas: o n do mês e, no mês de virada, a anotação do limiar. */
const MARGIN = { top: 40, right: 56, bottom: 0, left: 4 } as const;
const BAR_MAX = 24;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;
/**
 * Piso do rótulo desenhado dentro do segmento (decisão do dono, medida em 2026-09-17): texto de
 * 12 px só entra na marca se ela tiver ao menos o tamanho do texto mais 6 px, ou seja 18 px.
 * Abaixo disso o percentual sai para cima do segmento, com halo porque pisa no vizinho neutro.
 */
const LABEL_MIN_HEIGHT = 18;

interface ThresholdLabelProps {
  readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number };
}

export default function PaidShareColumns({ data = defaultData, height, className }: PaidShareColumnsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não houve leads no período.
      </div>
    );
  }

  const rows = data.map((row) => {
    const n = row.pago + row.outras;
    const fraction = n > 0 ? row.pago / n : 0;
    return { ...row, n, fraction, pct: Math.round(fraction * 100) };
  });
  const last = rows[rows.length - 1]!;
  const crossing = rows.find((row) => row.fraction >= THRESHOLD);

  const summary = crossing
    ? `Gráfico de colunas empilhadas a 100% com a origem paga na base, em ${String(rows.length)} meses. ` +
      `Mídia paga cruza ${formatPercent(THRESHOLD, 0)} do mix em ${formatMonthShort(crossing.month)}, com ` +
      `${formatInt(crossing.pago)} de ${formatInt(crossing.n)} leads, e chega a ${formatInt(last.pct)}% em ${formatMonthShort(last.month)}.`
    : `Gráfico de colunas empilhadas a 100% com a origem paga na base, em ${String(rows.length)} meses. ` +
      `Mídia paga termina a série em ${formatInt(last.pct)}% do mix, sem cruzar ${formatPercent(THRESHOLD, 0)}.`;

  const renderCount = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    return (
      <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor="middle" x={Number(x) + Number(width) / 2} y={Number(y) - 6}>
        {`${formatInt(row.n)} leads`}
      </text>
    );
  };

  const renderPaidShare = ({ x, y, width, height: segHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const text = `${formatInt(row.pct)}%`;
    const cx = Number(x) + Number(width) / 2;
    if (Number(segHeight) >= LABEL_MIN_HEIGHT) {
      return (
        <text className="font-display" dominantBaseline="central" fill="var(--accent-cyan-contrast)" fontSize={12} fontWeight={700} textAnchor="middle" x={cx} y={Number(y) + Number(segHeight) / 2}>
          {text}
        </text>
      );
    }
    return (
      <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={700} style={HALO} textAnchor="middle" x={cx} y={Number(y) - 6}>
        {text}
      </text>
    );
  };

  /** Segunda linha, acima do n (que fica em y - 6): evita repetir a frase da linha de leitura. */
  const renderCrossing = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row || !crossing || row.month !== crossing.month) return null;
    return (
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={Number(x) + Number(width) / 2} y={Number(y) - 20}>
        {`cruza ${formatPercent(THRESHOLD, 0)} aqui`}
      </text>
    );
  };

  const renderThresholdLabel = ({ viewBox }: ThresholdLabelProps): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="start" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) + 4} y={viewBox?.y ?? 0}>
      {`limiar ${formatPercent(THRESHOLD, 0)}`}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        Mídia paga {crossing ? 'cruza' : 'não cruza'} <span className="kpi-number font-medium text-text-primary">{formatPercent(THRESHOLD, 0)}</span> do mix
        {crossing ? <> em <span className="font-medium text-text-primary">{formatMonthShort(crossing.month)}</span></> : null}, com{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(last.pct)}%</span> em {formatMonthShort(last.month)}
      </p>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: 'var(--chart-1)' }} />
          Mídia paga <span className="kpi-number font-bold text-text-primary">{formatInt(last.pct)}%</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: 'var(--line-strong)' }} />
          Outras origens <span className="kpi-number text-text-primary">{formatInt(100 - last.pct)}%</span>
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="35%" data={rows} margin={MARGIN} stackOffset="expand">
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis axisLine={false} dataKey="month" interval={0} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={(value: string) => formatMonthShort(value)} tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} domain={[0, 1]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(value: number) => formatPercent(value, 0)} tickLine={false} tickMargin={8} ticks={[0, 0.5, 1]} width={44} />
            <Tooltip content={<ChartTooltip valueFormat="int" />} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="pago" fill="var(--chart-1)" isAnimationActive={animate} maxBarSize={BAR_MAX} name="Mídia paga" stackId="pilha">
              <LabelList content={renderPaidShare} dataKey="pago" />
            </Bar>
            <Bar dataKey="outras" fill="var(--line-strong)" isAnimationActive={animate} maxBarSize={BAR_MAX} name="Outras origens" radius={[3, 3, 0, 0]} stackId="pilha" stroke="var(--surface-raised)" strokeWidth={1.5}>
              <LabelList content={renderCount} dataKey="outras" />
              <LabelList content={renderCrossing} dataKey="outras" />
            </Bar>
            <ReferenceLine ifOverflow="extendDomain" label={renderThresholdLabel} stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1} y={THRESHOLD} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
