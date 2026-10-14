import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { correctionMonth as defaultCorrectionMonth, data as defaultData, type MonthlyLeadOrigin } from './data';

/**
 * Área 100% da origem de lead com "sem origem declarada" como camada de ausência, vazada, no
 * topo da pilha. A correção de coleta passou a exigir o campo de origem no formulário; a linha
 * de leitura declara a participação da ausência antes e depois, e o total de leads do mês, para
 * a queda da fatia não ser lida como queda de leads.
 */
export interface LeadOriginShareAreaProps {
  readonly data?: readonly MonthlyLeadOrigin[];
  readonly correctionMonth?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 26, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 48;
const TICK_INTERVAL = 1;
const PERCENT_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
const LAYER_STROKE = 'var(--surface-raised)';
/** Slots categóricos na ordem 1, 3, 6 da COR-8; a ausência não entra no teto de 6 (COR-4). */
const ORIGIN_FILL: Record<'indicacao' | 'conteudo' | 'evento', string> = {
  indicacao: 'var(--chart-1)',
  conteudo: 'var(--chart-3)',
  evento: 'var(--chart-6)',
};
const ORIGIN_LABEL: Record<'indicacao' | 'conteudo' | 'evento', string> = {
  indicacao: 'Indicação',
  conteudo: 'Conteúdo',
  evento: 'Evento',
};
const ORIGIN_KEYS = ['indicacao', 'conteudo', 'evento'] as const;
const ABSENCE_STROKE = 'var(--text-muted)';

function shareOf(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function referenceLabel({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number } }): ReactElement {
  return (
    <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x ?? 0} y={(viewBox?.y ?? 0) - 10}>
      correção {formatDate('2026-06-02')}
    </text>
  );
}

export default function LeadOriginShareArea({
  data = defaultData,
  correctionMonth = defaultCorrectionMonth,
  height,
  className,
}: LeadOriginShareAreaProps) {
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
        <span>Nenhum mês neste recorte: não há lead para compor a origem.</span>
      </div>
    );
  }

  const first = data[0];
  const last = data[data.length - 1];
  const totalOf = (row: MonthlyLeadOrigin) => row.indicacao + row.conteudo + row.evento + row.semOrigem;
  const firstTotal = first ? totalOf(first) : 0;
  const lastTotal = last ? totalOf(last) : 0;
  const absenceShareFirst = first ? shareOf(first.semOrigem, firstTotal) : 0;
  const absenceShareLast = last ? shareOf(last.semOrigem, lastTotal) : 0;

  const summary =
    first && last
      ? `Área 100% com a origem de lead mensal de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}. ` +
        `Sem origem caiu de ${formatPercent(absenceShareFirst / 100, 0)} para ${formatPercent(absenceShareLast / 100, 0)} após a correção de ${formatDate('2026-06-02')}. ` +
        `Total em ${formatMonthShort(last.month)}: ${formatInt(lastTotal)} leads.`
      : 'Área 100% da origem de lead mensal, com a ausência declarada no topo.';

  const reading =
    first && last
      ? {
          from: formatPercent(absenceShareFirst / 100, 0),
          fromMonth: formatMonthShort(first.month),
          to: formatPercent(absenceShareLast / 100, 0),
          toMonth: formatMonthShort(last.month),
          total: formatInt(lastTotal),
        }
      : null;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          Sem origem: <span className="kpi-number font-medium text-text-primary">{reading.from}</span> em {reading.fromMonth}{' '}
          para <span className="kpi-number font-medium text-text-primary">{reading.to}</span> em {reading.toMonth}. Total:{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.total}</span> leads
        </p>
      ) : null}
      <ul className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        <li className="flex items-center gap-1.5 text-xs leading-4">
          <span aria-hidden className="size-2 shrink-0 rounded-sm border-[1.5px] border-text-muted" />
          <span className="text-text-secondary">Sem origem declarada</span>
        </li>
        {[...ORIGIN_KEYS].reverse().map((key) => (
          <li className="flex items-center gap-1.5 text-xs leading-4" key={key}>
            <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: ORIGIN_FILL[key] }} />
            <span className="text-text-secondary">{ORIGIN_LABEL[key]}</span>
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart data={[...data]} margin={MARGIN} stackOffset="expand">
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              interval={TICK_INTERVAL}
              tickFormatter={formatMonthShort}
              tickMargin={8}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, 1]}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              ticks={[...PERCENT_TICKS]}
              width={VALUE_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="month" valueFormat="int" />}
              cursor={{ stroke: 'var(--line-strong)' }}
              isAnimationActive={false}
            />
            {ORIGIN_KEYS.map((key) => (
              <Area
                dataKey={key}
                fill={ORIGIN_FILL[key]}
                fillOpacity={0.9}
                isAnimationActive={animate}
                key={key}
                name={ORIGIN_LABEL[key]}
                stackId="origem"
                stroke={LAYER_STROKE}
                strokeWidth={1.5}
                type="monotone"
              />
            ))}
            <Area
              dataKey="semOrigem"
              fill="none"
              fillOpacity={0}
              isAnimationActive={animate}
              name="Sem origem declarada"
              stackId="origem"
              stroke={ABSENCE_STROKE}
              strokeWidth={1.5}
              type="monotone"
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={referenceLabel}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              x={correctionMonth}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
