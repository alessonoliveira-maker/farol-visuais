import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyLeadQuality } from './data';

/**
 * Colunas com o total de leads do mês, no eixo esquerdo, e linha com o percentual qualificado
 * sobre esse total, no eixo direito. Os dois domínios nascem em zero e têm o mesmo número de
 * marcas, calculados por uma função pura para o Recharts nunca arredondar por conta própria.
 */
export interface LeadsQualifiedRateProps {
  readonly data?: readonly MonthlyLeadQuality[];
  readonly height?: number;
  readonly className?: string;
}

const AXIS_QTY = 'leads';
const AXIS_RATE = 'taxa';
const RATE_KEY = 'qualifiedRate';
const TICK_COUNT = 5;
const FORCED_TICK_LIMIT = 8;
const LEADS_COLOR = 'var(--chart-1)';
const RATE_COLOR = 'var(--chart-3)';
const CURSOR = { fill: 'var(--line-subtle)' } as const;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;
const MARGIN = { top: 22, right: 20, bottom: 0, left: 0 } as const;
const AXIS_WIDTH = 40;
/** Espaço acima da última marca só para o título do eixo caber sem tocar o tique do topo. */
const HEADROOM = 1.16;

interface NiceDomain {
  readonly domain: readonly [number, number];
  readonly ticks: readonly number[];
}

interface RateRow extends MonthlyLeadQuality {
  readonly qualifiedRate: number | null;
}

/**
 * Domínio e tiques sem o automático do Recharts: o maior valor decide um passo "redondo" (1, 2,
 * 5 ou 10 vezes uma potência de 10) e o domínio é esse passo vezes o número de marcas menos uma.
 * Os dois eixos chamam esta função com o mesmo `tickCount`, então o zero e o número de marcas
 * sempre coincidem, que é o requisito de um eixo duplo honesto (Datawrapper, seção 17.3 EIX-1).
 */
function computeNiceDomain(maxValue: number, tickCount: number): NiceDomain {
  if (maxValue <= 0) {
    return { domain: [0, 1], ticks: Array.from({ length: tickCount }, (_, index) => index / (tickCount - 1)) };
  }
  const rawStep = maxValue / (tickCount - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const ticks = Array.from({ length: tickCount }, (_, index) => Number((step * index).toPrecision(10)));
  return { domain: [0, step * (tickCount - 1)], ticks };
}

export default function LeadsQualifiedRate({ data = defaultData, height, className }: LeadsQualifiedRateProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há leads para comparar com a qualificação.</span>
      </div>
    );
  }

  const rows: RateRow[] = data.map((row) => ({ ...row, qualifiedRate: row.leads > 0 ? row.qualifiedLeads / row.leads : null }));
  const first = rows[0];
  const last = rows[rows.length - 1];
  const qtyDomain = computeNiceDomain(Math.max(...rows.map((row) => row.leads)), TICK_COUNT);
  const rateDomain = computeNiceDomain(Math.max(...rows.map((row) => row.qualifiedRate ?? 0)), TICK_COUNT);
  const xInterval = rows.length <= FORCED_TICK_LIMIT ? 0 : 'preserveStartEnd';

  const summary =
    first && last
      ? `Gráfico combinado com colunas de leads mensais e linha do percentual qualificado, de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}. Os leads foram de ${formatInt(first.leads)} para ${formatInt(last.leads)}, e a qualificação foi de ${formatPercent(first.qualifiedRate ?? 0, 1)} para ${formatPercent(last.qualifiedRate ?? 0, 1)}.`
      : 'Gráfico combinado sem meses para comparar leads e qualificação.';

  const renderRateLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row || row.qualifiedRate === null || index !== rows.length - 1) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill={RATE_COLOR} fontSize={12} fontWeight={700} style={HALO} textAnchor="end" x={Number(x) - 4} y={Number(y) - 10}>
        {formatPercent(row.qualifiedRate, 1)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {first && last ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          Leads de <span className="kpi-number font-medium text-text-primary">{formatInt(first.leads)}</span> para{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(last.leads)}</span>; qualificados de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatPercent(first.qualifiedRate ?? 0, 1)}</span> para{' '}
          <span className="kpi-number font-medium text-text-primary">{formatPercent(last.qualifiedRate ?? 0, 1)}</span>
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} barCategoryGap="34%" data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} yAxisId={AXIS_QTY} />
            <XAxis
              axisLine={false}
              dataKey="month"
              interval={xInterval}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={formatMonthShort}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              allowDataOverflow
              axisLine={false}
              domain={[0, qtyDomain.domain[1] * HEADROOM]}
              label={{ value: 'leads', fill: LEADS_COLOR, fontSize: 11, position: 'top' }}
              niceTicks="none"
              tick={{ fill: LEADS_COLOR, fontSize: 11 }}
              tickFormatter={formatInt}
              tickLine={false}
              tickMargin={8}
              ticks={[...qtyDomain.ticks]}
              width={AXIS_WIDTH}
              yAxisId={AXIS_QTY}
            />
            <YAxis
              allowDataOverflow
              axisLine={false}
              domain={[0, rateDomain.domain[1] * HEADROOM]}
              label={{ value: '% qualif.', fill: RATE_COLOR, fontSize: 11, position: 'top' }}
              niceTicks="none"
              orientation="right"
              tick={{ fill: RATE_COLOR, fontSize: 11 }}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickLine={false}
              tickMargin={8}
              ticks={[...rateDomain.ticks]}
              width={AXIS_WIDTH}
              yAxisId={AXIS_RATE}
            />
            <Tooltip
              content={(tooltipProps) => {
                const payload = tooltipProps.payload?.map((entry) => {
                  if (entry.dataKey !== RATE_KEY) return entry;
                  const row = entry.payload as RateRow | undefined;
                  if (!row) return entry;
                  return { ...entry, value: formatRateWithVolume(row.qualifiedLeads, row.leads) };
                });
                return (
                  <ChartTooltip
                    active={tooltipProps.active}
                    label={tooltipProps.label}
                    payload={payload as ChartTooltipProps['payload']}
                    valueFormat="int"
                  />
                );
              }}
              cursor={CURSOR}
              isAnimationActive={false}
            />
            <Bar dataKey="leads" fill={LEADS_COLOR} isAnimationActive={animate} maxBarSize={28} name="Leads" radius={[3, 3, 0, 0]} yAxisId={AXIS_QTY} />
            <Line
              connectNulls={false}
              dataKey={RATE_KEY}
              dot={{ fill: RATE_COLOR, r: 3, strokeWidth: 0 }}
              isAnimationActive={animate}
              label={renderRateLabel}
              name="Qualificados"
              stroke={RATE_COLOR}
              strokeWidth={2}
              yAxisId={AXIS_RATE}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
