import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, outrasCount as defaultOutrasCount, type WeeklyLeadOrigin } from './data';

/**
 * Área 100% da origem de lead semanal, com um painel de total simples sincronizado abaixo: a
 * pilha normalizada mostra a composição, mas esconde que o total semanal caiu ao longo do ano, e
 * é exatamente esse esconderijo que o painel de baixo existe para fechar (decisão do dono: toda
 * peça da família precisa dizer o total em algum lugar). Seis origens coloridas na ordem de slot
 * da COR-8, "Outras" em neutro e "Sem origem declarada" vazada, sempre por último no topo.
 */
export interface LeadOriginWithTotalProps {
  readonly data?: readonly WeeklyLeadOrigin[];
  readonly outrasCount?: number;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 4, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 48;
const PERCENT_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
const LAYER_STROKE = 'var(--surface-raised)';
const NEUTRAL_FILL = 'var(--line-strong)';
const ABSENCE_STROKE = 'var(--text-muted)';
/** Slots categóricos na ordem 1, 3, 6, 5, 2, 4 da COR-8, base a topo da pilha. */
const ORIGIN_KEYS = ['indicacao', 'conteudo', 'evento', 'parceria', 'anuncio', 'referencia'] as const;
const ORIGIN_FILL: Record<(typeof ORIGIN_KEYS)[number], string> = {
  indicacao: 'var(--chart-1)',
  conteudo: 'var(--chart-3)',
  evento: 'var(--chart-6)',
  parceria: 'var(--chart-5)',
  anuncio: 'var(--chart-2)',
  referencia: 'var(--chart-4)',
};
const ORIGIN_LABEL: Record<(typeof ORIGIN_KEYS)[number], string> = {
  indicacao: 'Indicação',
  conteudo: 'Conteúdo',
  evento: 'Evento',
  parceria: 'Parceria',
  anuncio: 'Anúncio',
  referencia: 'Referência',
};

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

/** Uma semana por mês novo, para o eixo de tempo mostrar tique mensal sobre dado semanal. */
function monthlyTicks(rows: readonly WeeklyLeadOrigin[]): readonly string[] {
  const ticks: string[] = [];
  let lastMonth = '';
  for (const row of rows) {
    const month = row.week.slice(0, 7);
    if (month !== lastMonth) {
      ticks.push(row.week);
      lastMonth = month;
    }
  }
  return ticks;
}

function totalOf(row: WeeklyLeadOrigin): number {
  return (
    row.indicacao + row.conteudo + row.evento + row.parceria + row.anuncio + row.referencia + row.outras + row.semOrigem
  );
}
export default function LeadOriginWithTotal({
  data = defaultData,
  outrasCount = defaultOutrasCount,
  height,
  className,
}: LeadOriginWithTotalProps): ReactElement {
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
        <span>Nenhuma semana neste recorte: não há origem de lead para compor.</span>
      </div>
    );
  }

  const rows = [...data];
  const ticks = monthlyTicks(rows);
  const totals = rows.map(totalOf);
  const maxTotal = Math.max(...totals, 0);
  const totalTicks = niceTicks(maxTotal);
  const totalYMax = totalTicks[totalTicks.length - 1] ?? maxTotal;
  const first = rows[0];
  const last = rows[rows.length - 1];
  const firstTotal = first ? totalOf(first) : 0;
  const lastTotal = last ? totalOf(last) : 0;
  const dropShare = firstTotal > 0 ? (firstTotal - lastTotal) / firstTotal : 0;

  const summary =
    first && last
      ? `Área 100% com a origem de lead semanal em 52 semanas de 2026, e painel de total abaixo. ` +
        `Total caiu de ${formatInt(firstTotal)} para ${formatInt(lastTotal)} leads por semana, queda de ${formatPercent(dropShare, 0)}, mesmo com a composição se redistribuindo.`
      : 'Área 100% da origem de lead semanal, com painel de total abaixo.';

  const reading =
    first && last
      ? {
          fromTotal: formatInt(firstTotal),
          toTotal: formatInt(lastTotal),
          drop: formatPercent(dropShare, 0),
        }
      : null;

  const legendItems: readonly { readonly key: string; readonly label: string; readonly swatch: 'fill' | 'neutral' | 'hollow'; readonly color?: string }[] = [
    { key: 'semOrigem', label: 'Sem origem declarada', swatch: 'hollow' },
    { key: 'outras', label: `Outras (n=${formatInt(outrasCount)})`, swatch: 'neutral' },
    ...[...ORIGIN_KEYS].reverse().map((key) => ({ key, label: ORIGIN_LABEL[key], swatch: 'fill' as const, color: ORIGIN_FILL[key] })),
  ];

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
          Total caiu de <span className="kpi-number font-medium text-text-primary">{reading.fromTotal}</span> para{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.toTotal}</span> leads na semana, uma queda de{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.drop}</span>
        </p>
      ) : null}
      <ul className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        {legendItems.map((item) => (
          <li className="flex items-center gap-1.5 text-xs leading-4" key={item.key}>
            <span
              aria-hidden
              className={cn(
                'size-2 shrink-0 rounded-sm',
                item.swatch === 'hollow' && 'border-[1.5px] border-text-muted',
                item.swatch === 'neutral' && 'bg-line-strong',
              )}
              style={item.swatch === 'fill' ? { backgroundColor: item.color } : undefined}
            />
            <span className="text-text-secondary">{item.label}</span>
          </li>
        ))}
      </ul>
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="min-h-0" style={{ flex: '7 1 0%' }}>
          <ResponsiveContainer height="100%" width="100%">
            <ComposedChart data={rows} margin={MARGIN} stackOffset="expand" syncId="leads-origem-total">
              <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
              <XAxis {...AXIS_PROPS} dataKey="week" hide />
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
                dataKey="outras"
                fill={NEUTRAL_FILL}
                fillOpacity={0.5}
                isAnimationActive={animate}
                name={`Outras (n=${formatInt(outrasCount)})`}
                stackId="origem"
                stroke={LAYER_STROKE}
                strokeWidth={1.5}
                type="monotone"
              />
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
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="min-h-0" style={{ flex: '3 1 0%' }}>
          <ResponsiveContainer height="100%" width="100%">
            <ComposedChart data={rows} margin={MARGIN} syncId="leads-origem-total">
              <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
              <XAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="week"
                tickFormatter={formatMonthShort}
                tickMargin={8}
                ticks={[...ticks]}
              />
              <YAxis
                {...AXIS_PROPS}
                axisLine={false}
                domain={[0, totalYMax]}
                tickFormatter={(value: number) => formatInt(value)}
                ticks={[...totalTicks]}
                width={VALUE_AXIS_WIDTH}
              />
              <Tooltip
                content={<ChartTooltip labelFormat="month" valueFormat="int" />}
                cursor={{ stroke: 'var(--line-strong)' }}
                isAnimationActive={false}
              />
              <Area
                dataKey={(row: WeeklyLeadOrigin) => totalOf(row)}
                fill="var(--chart-1)"
                fillOpacity={0.18}
                isAnimationActive={animate}
                name="Total"
                stroke="var(--chart-1)"
                strokeWidth={2}
                type="monotone"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
