import { Filter } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, minorShareThreshold as defaultThreshold, outrasCount as defaultOutrasCount, type CreativeWeek } from './data';

/**
 * Streamgraph de criativos de mídia paga: cada um entra e sai do ar em janela própria, com 0
 * verdadeiro (EST-3) fora dela, nunca lacuna. Criativos abaixo do corte de participação no total
 * do período vão para "outras", com a contagem e o corte escritos no rodapé, para dezenas de
 * criativos não virarem faixas finas e ilegíveis. Animação desligada: prática que sustenta muitas
 * camadas na mesma tela, mesmo nesta demonstração reduzida a 4 nomeados mais outras.
 */
export interface CreativeStreamProps {
  readonly data?: readonly CreativeWeek[];
  readonly outrasCount?: number;
  readonly minorShareThreshold?: number;
  readonly height?: number;
  readonly className?: string;
}

type NamedKey = Exclude<keyof CreativeWeek, 'week' | 'outras'>;
type LayerKey = NamedKey | 'outras';

const NAMED_KEYS: readonly NamedKey[] = ['creativoLancamento', 'creativoEvergreen', 'creativoRelancamento', 'creativoFechamento'];
const NAMED_LABEL: Record<NamedKey, string> = {
  creativoLancamento: 'Lançamento',
  creativoEvergreen: 'Evergreen',
  creativoRelancamento: 'Relançamento',
  creativoFechamento: 'Fechamento',
};
const LAYER_COLOR: Record<LayerKey, string> = {
  creativoLancamento: 'var(--chart-1)',
  creativoEvergreen: 'var(--chart-3)',
  creativoRelancamento: 'var(--chart-6)',
  creativoFechamento: 'var(--chart-5)',
  outras: 'var(--line-strong)',
};
const MARGIN = { top: 8, right: 12, bottom: 0, left: 12 } as const;
const SEPARATOR_STROKE = 'var(--surface-raised)';

function monthlyTicks(rows: readonly CreativeWeek[]): readonly string[] {
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

function totalsByKey(rows: readonly CreativeWeek[]): Record<NamedKey, number> {
  const totals = { creativoLancamento: 0, creativoEvergreen: 0, creativoRelancamento: 0, creativoFechamento: 0 };
  for (const row of rows) for (const key of NAMED_KEYS) totals[key] += row[key];
  return totals;
}

function insideOutOrder(totals: Record<NamedKey, number>): NamedKey[] {
  const sorted = [...NAMED_KEYS].sort((a, b) => totals[b] - totals[a]);
  const ordered: NamedKey[] = [];
  sorted.forEach((key, index) => (index % 2 === 0 ? ordered.push(key) : ordered.unshift(key)));
  return ordered;
}

export default function CreativeStream({
  data = defaultData,
  outrasCount = defaultOutrasCount,
  minorShareThreshold = defaultThreshold,
  height,
  className,
}: CreativeStreamProps) {
  const style = height === undefined ? undefined : { height };
  const rows = [...data];

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: nenhum criativo esteve no ar no período.</span>
      </div>
    );
  }

  const totals = totalsByKey(rows);
  const outrasTotal = rows.reduce((sum, row) => sum + row.outras, 0);
  const periodTotal = NAMED_KEYS.reduce((sum, key) => sum + totals[key], 0) + outrasTotal;
  const layerOrder: readonly LayerKey[] = ['outras', ...insideOutOrder(totals)];
  const offAirWeeks = NAMED_KEYS.reduce((count, key) => count + rows.filter((row) => row[key] === 0).length, 0);

  const summary = [
    `Streamgraph com leads semanais de ${String(NAMED_KEYS.length)} criativos e outros ${String(outrasCount)} de vida curta, em ${String(rows.length)} semanas, sem eixo numérico.`,
    `Cada criativo fica fora do ar em parte do período: ${String(offAirWeeks)} semanas com zero medido entre os quatro nomeados.`,
    `Total do período: ${formatInt(periodTotal)} leads.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 shrink-0 text-xs text-text-secondary">
        Quatro criativos entram e saem do ar ao longo do período; fora do ar, o valor é{' '}
        <span className="font-semibold text-text-primary">zero medido</span>, não lacuna. Total do período:{' '}
        <span className="kpi-number font-semibold text-text-primary">{formatInt(periodTotal)}</span> leads.
      </p>
      <p aria-hidden className="mb-2 shrink-0 text-[0.6875rem] text-text-muted">
        Forma sem eixo numérico: mostra entrada e saída de criativos, não o valor exato de uma semana. Abaixo de{' '}
        {formatPercent(minorShareThreshold, 0)} de participação no total do período, o criativo vai para Outras.
      </p>
      <div className="mb-2 flex shrink-0 flex-wrap gap-x-3 gap-y-1">
        {layerOrder.map((key) => (
          <span className="flex items-center gap-1 text-xs text-text-secondary" key={key}>
            <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: LAYER_COLOR[key] }} />
            {key === 'outras' ? `Outras (n=${String(outrasCount)})` : NAMED_LABEL[key]}{' '}
            <span className="kpi-number text-text-primary">{formatInt(key === 'outras' ? outrasTotal : totals[key])}</span>
          </span>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart accessibilityLayer={false} data={rows} margin={MARGIN} stackOffset="silhouette">
            <XAxis
              axisLine={false}
              dataKey="week"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={formatMonthShort}
              tickLine={false}
              tickMargin={8}
              ticks={[...monthlyTicks(rows)]}
            />
            <YAxis hide />
            <Tooltip
              content={<ChartTooltip labelFormat="month" valueFormat="int" />}
              cursor={{ stroke: 'var(--line-strong)' }}
              isAnimationActive={false}
              itemSorter={(item) => -layerOrder.indexOf(item.dataKey as LayerKey)}
            />
            {layerOrder.map((key) => (
              <Area
                dataKey={key}
                fill={LAYER_COLOR[key]}
                fillOpacity={0.92}
                isAnimationActive={false}
                key={key}
                name={key === 'outras' ? `Outras (n=${String(outrasCount)})` : NAMED_LABEL[key]}
                stackId="leads"
                stroke={SEPARATOR_STROKE}
                strokeWidth={1.5}
                type="monotone"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
