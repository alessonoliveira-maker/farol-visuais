import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QuarterLosses } from './data';

/** Colunas a 100% no caso limite: amostra pequena e trimestre sem nenhuma perda registrada. */
export interface SmallSampleLossColumnsProps {
  readonly data?: readonly QuarterLosses[];
  readonly height?: number;
  readonly className?: string;
}

interface Segment {
  readonly key: 'semFit' | 'preco' | 'concorrencia' | 'semMotivo';
  readonly label: string;
  readonly color?: string;
}

interface AreaLabelProps {
  readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number; readonly height?: number };
}

interface AxisTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly index?: number;
}

/** Abaixo deste n, a fatia normalizada não sustenta leitura de mix (2026-09-17). */
const SAMPLE_FLOOR = 10;
const MARGIN = { top: 20, right: 4, bottom: 0, left: 4 } as const;
const BAR_MAX = 24;
const SEGMENTS: readonly Segment[] = [
  { key: 'semFit', label: 'Sem fit', color: 'var(--chart-1)' },
  { key: 'preco', label: 'Preço', color: 'var(--chart-3)' },
  { key: 'concorrencia', label: 'Concorrência', color: 'var(--chart-6)' },
  { key: 'semMotivo', label: 'Sem motivo registrado' },
];

function totalOf(row: QuarterLosses): number {
  return row.semFit + row.preco + row.concorrencia + row.semMotivo;
}

export default function SmallSampleLossColumns({ data = defaultData, height, className }: SmallSampleLossColumnsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum trimestre neste recorte: não há perdas para comparar.
      </div>
    );
  }

  const rows = data.map((row) => ({ ...row, n: totalOf(row) }));
  const small = rows.find((row) => row.n > 0 && row.n < SAMPLE_FLOOR);
  const empty = rows.find((row) => row.n === 0);
  const measured = rows.filter((row) => row.n >= SAMPLE_FLOOR);
  const measuredTotal = measured.reduce((sum, row) => sum + row.n, 0);

  const summary =
    `Gráfico de colunas empilhadas a 100% com motivos de perda em ${String(rows.length)} trimestres, ` +
    `piso de amostra ${formatInt(SAMPLE_FLOOR)}.` +
    (small ? ` ${small.quarter} tem só ${formatInt(small.n)}, amostra pequena.` : '') +
    (empty ? ` ${empty.quarter} mediu zero perdas no trimestre, não é falta de coleta.` : '') +
    ` Medidos somam ${formatInt(measuredTotal)} perdas.`;

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

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const list = (props.payload ?? [])
      .filter((entry) => typeof entry.value === 'number' && entry.value > 0)
      .map((entry) => {
        const row = rows.find((candidate) => candidate.quarter === props.label);
        const denominator = row?.n ?? 0;
        const numerator = typeof entry.value === 'number' ? entry.value : 0;
        return { ...entry, value: formatRateWithVolume(numerator, denominator) };
      }) as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={props.label} payload={list} valueFormat="text" />;
  };

  const renderSmallLabel = ({ viewBox }: AreaLabelProps): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) / 2} y={(viewBox?.y ?? 0) - 6}>
      {'amostra pequena'}
    </text>
  );

  /**
   * "Sem perda" e não "sem registro": é zero medido (EST-3, o trimestre foi coberto e não teve
   * perda), não indisponibilidade de coleta (EST-2). O tique do eixo escreve o n exato, 0 perdas,
   * o que junto com esta palavra fecha a distinção sem alargar o texto além da coluna.
   */
  const renderEmptyLabel = ({ viewBox }: AreaLabelProps): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={12} textAnchor="middle" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) / 2} y={(viewBox?.y ?? 0) + (viewBox?.height ?? 0) / 2}>
      {'sem perda'}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        {[...SEGMENTS].reverse().map((segment) => (
          <li className="flex items-center gap-1.5" key={segment.key}>
            {segment.color ? (
              <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: segment.color }} />
            ) : (
              <span aria-hidden className="size-2.5 shrink-0 border-[1.5px] border-text-muted" />
            )}
            {segment.label}
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="35%" data={rows} margin={MARGIN} stackOffset="expand">
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis axisLine={false} dataKey="quarter" height={44} interval={0} tick={renderQuarterTick} tickLine={false} />
            <YAxis axisLine={false} domain={[0, 1]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(value: number) => formatPercent(value, 0)} tickLine={false} tickMargin={8} ticks={[0, 0.5, 1]} width={44} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {SEGMENTS.map((segment, i) => (
              <Bar
                dataKey={segment.key}
                fill={segment.color ?? 'none'}
                isAnimationActive={animate}
                key={segment.key}
                maxBarSize={BAR_MAX}
                name={segment.label}
                radius={i === SEGMENTS.length - 1 ? [3, 3, 0, 0] : undefined}
                stackId="pilha"
                stroke={segment.color ? 'var(--surface-raised)' : 'var(--text-muted)'}
                strokeWidth={segment.color ? 1.5 : 1}
              />
            ))}
            {small ? <ReferenceArea fill="none" ifOverflow="visible" label={renderSmallLabel} stroke="var(--text-muted)" strokeDasharray="3 3" x1={small.quarter} x2={small.quarter} /> : null}
            {empty ? <ReferenceArea fill="var(--surface-sunken)" ifOverflow="visible" label={renderEmptyLabel} x1={empty.quarter} x2={empty.quarter} /> : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
