import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyOriginTail } from './data';

/** Colunas empilhadas com 5 origens nomeadas, uma cauda agrupada e a ausência sempre visível. */
export interface StackedOriginTailColumnsProps {
  readonly data?: readonly MonthlyOriginTail[];
  readonly height?: number;
  readonly className?: string;
}

type NumericKey = 'indicacao' | 'organico' | 'pago' | 'parceria' | 'evento' | 'outros' | 'semOrigem';

interface Segment {
  readonly key: NumericKey;
  readonly label: string;
  readonly color?: string;
  readonly outline?: boolean;
}

/** Cinco origens nomeadas (base ao topo), a cauda agrupada e a ausência, sempre por último. */
const SEGMENTS: readonly Segment[] = [
  { key: 'indicacao', label: 'Indicação', color: 'var(--chart-1)' },
  { key: 'organico', label: 'Orgânico', color: 'var(--chart-3)' },
  { key: 'pago', label: 'Mídia paga', color: 'var(--chart-6)' },
  { key: 'parceria', label: 'Parceria', color: 'var(--chart-5)' },
  { key: 'evento', label: 'Evento', color: 'var(--chart-2)' },
  { key: 'outros', label: 'Outros (n=9)', color: 'var(--chart-4)' },
  { key: 'semOrigem', label: 'Sem origem declarada', outline: true },
];
const MARGIN = { top: 8, right: 4, bottom: 0, left: 0 } as const;
const BAR_MAX = 44;

export default function StackedOriginTailColumns({ data = defaultData, height, className }: StackedOriginTailColumnsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não houve leads no período.
      </div>
    );
  }

  const rows = data;
  const totalGeral = rows.reduce(
    (sum, row) => sum + row.indicacao + row.organico + row.pago + row.parceria + row.evento + row.outros + row.semOrigem,
    0,
  );
  const semOrigemTotal = rows.reduce((sum, row) => sum + row.semOrigem, 0);

  const summary =
    `Gráfico de colunas empilhadas com leads de ${String(rows.length)} meses em cinco origens nomeadas, ` +
    `mais Outros (nove origens menores) e Sem origem declarada. O total do período é ${formatInt(totalGeral)} leads, ` +
    `${formatInt(semOrigemTotal)} deles sem origem registrada.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap gap-x-3 gap-y-1 text-[0.6875rem] text-text-secondary">
        {[...SEGMENTS].reverse().map((segment) => (
          <li className="flex items-center gap-1.5" key={segment.key}>
            {segment.outline ? (
              <span aria-hidden className="size-2.5 shrink-0 border border-text-muted" />
            ) : (
              <span aria-hidden className="size-2.5 shrink-0" style={{ backgroundColor: segment.color }} />
            )}
            {segment.label}
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="35%" data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              interval={0}
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis allowDecimals={false} axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} tickMargin={8} width={36} />
            <Tooltip
              content={(props: TooltipContentProps<TooltipValueType, number | string>) => {
                const filtered = (props.payload ?? []).filter(
                  (entry) => typeof entry.value === 'number' && entry.value > 0,
                ) as ChartTooltipProps['payload'];
                return <ChartTooltip active={props.active} label={props.label} payload={filtered} valueFormat="int" />;
              }}
              cursor={{ fill: 'var(--line-subtle)' }}
              isAnimationActive={false}
            />
            {SEGMENTS.map((segment) => (
              <Bar
                dataKey={segment.key}
                fill={segment.outline ? 'transparent' : segment.color}
                isAnimationActive={animate}
                key={segment.key}
                maxBarSize={BAR_MAX}
                name={segment.label}
                radius={segment.key === 'semOrigem' ? [3, 3, 0, 0] : undefined}
                stackId="pilha"
                stroke={segment.outline ? 'var(--text-muted)' : 'var(--surface-raised)'}
                strokeWidth={segment.outline ? 1 : 1.5}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
