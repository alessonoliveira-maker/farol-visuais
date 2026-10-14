import { Filter } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, outrasCount as defaultOutrasCount, type CampaignWeek } from './data';

/**
 * Streamgraph: área empilhada deslocada em torno do centro (stackOffset="silhouette"), sem eixo y
 * numérico. A forma mostra onde o volume semanal se concentrou e o peso relativo entre campanhas,
 * nunca o valor pontual de uma camada isolada; o total do ano de cada campanha mora na legenda e
 * o valor da semana, na dica. A ordem das camadas é decidida aqui a partir do total do ano, maior
 * ao centro alternando lados, porque o Recharts empilha na ordem dos filhos.
 */
export interface CampaignStreamProps {
  readonly data?: readonly CampaignWeek[];
  readonly outrasCount?: number;
  readonly height?: number;
  readonly className?: string;
}

type NamedKey = Exclude<keyof CampaignWeek, 'week' | 'outras'>;
type LayerKey = NamedKey | 'outras';

const NAMED_KEYS: readonly NamedKey[] = [
  'buscaPaga',
  'socialPago',
  'nutricaoEmail',
  'webinar',
  'parceriaCanal',
  'eventoPresencial',
];

/** Cor fixa por campanha (COR-3), nos slots 1, 3, 6, 5, 2, 4 da ordem de atribuição (COR-8). */
const LAYER_COLOR: Record<LayerKey, string> = {
  buscaPaga: 'var(--chart-1)',
  socialPago: 'var(--chart-3)',
  nutricaoEmail: 'var(--chart-6)',
  webinar: 'var(--chart-5)',
  parceriaCanal: 'var(--chart-2)',
  eventoPresencial: 'var(--chart-4)',
  outras: 'var(--line-strong)',
};

const NAMED_LABEL: Record<NamedKey, string> = {
  buscaPaga: 'Busca paga',
  socialPago: 'Social pago',
  nutricaoEmail: 'Nutrição por email',
  webinar: 'Webinar',
  parceriaCanal: 'Parceria de canal',
  eventoPresencial: 'Evento presencial',
};

const MARGIN = { top: 8, right: 12, bottom: 0, left: 12 } as const;
const SEPARATOR_STROKE = 'var(--surface-raised)';

/** Uma semana por mês novo, para o eixo de tempo mostrar tique mensal sobre dado semanal. */
function monthlyTicks(rows: readonly CampaignWeek[]): readonly string[] {
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

/** Total do ano por camada nomeada, para decidir ordem e legenda. */
function totalsByKey(rows: readonly CampaignWeek[]): Record<NamedKey, number> {
  const totals = { buscaPaga: 0, socialPago: 0, nutricaoEmail: 0, webinar: 0, parceriaCanal: 0, eventoPresencial: 0 };
  for (const row of rows) for (const key of NAMED_KEYS) totals[key] += row[key];
  return totals;
}

/** Ordem "de dentro para fora": maior total primeiro, alternando entre as duas pontas da pilha. */
function insideOutOrder(totals: Record<NamedKey, number>): NamedKey[] {
  const sorted = [...NAMED_KEYS].sort((a, b) => totals[b] - totals[a]);
  const ordered: NamedKey[] = [];
  sorted.forEach((key, index) => (index % 2 === 0 ? ordered.push(key) : ordered.unshift(key)));
  return ordered;
}

export default function CampaignStream({
  data = defaultData,
  outrasCount = defaultOutrasCount,
  height,
  className,
}: CampaignStreamProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [...data];

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não houve lead atribuído a campanha no período.</span>
      </div>
    );
  }

  const totals = totalsByKey(rows);
  const outrasTotal = rows.reduce((sum, row) => sum + row.outras, 0);
  const yearTotal = NAMED_KEYS.reduce((sum, key) => sum + totals[key], 0) + outrasTotal;
  const leaderKey = NAMED_KEYS.reduce((best, key) => (totals[key] > totals[best] ? key : best), NAMED_KEYS[0] ?? 'buscaPaga');
  const leaderShare = yearTotal > 0 ? totals[leaderKey] / yearTotal : 0;
  const layerOrder: readonly LayerKey[] = ['outras', ...insideOutOrder(totals)];

  const summary = [
    `Streamgraph com leads semanais de ${String(NAMED_KEYS.length)} campanhas e outras ${String(outrasCount)} agregadas, em ${String(rows.length)} semanas de 2026, sem eixo numérico.`,
    `Lidera ${NAMED_LABEL[leaderKey]}, com ${formatInt(totals[leaderKey])} leads no ano, ${formatPercent(leaderShare, 0)} do total.`,
    `Total do ano: ${formatInt(yearTotal)} leads.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 shrink-0 text-xs text-text-secondary">
        Lidera <span className="font-semibold text-text-primary">{NAMED_LABEL[leaderKey]}</span>, com{' '}
        <span className="kpi-number font-semibold text-text-primary">{formatInt(totals[leaderKey])}</span> leads no ano (
        {formatPercent(leaderShare, 0)}). Total do ano: <span className="kpi-number font-semibold text-text-primary">{formatInt(yearTotal)}</span> leads.
      </p>
      <p aria-hidden className="mb-2 shrink-0 text-[0.6875rem] text-text-muted">
        Forma sem eixo numérico: mostra concentração relativa entre semanas, não o valor exato de uma camada; total do ano na
        legenda, valor da semana na dica.
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
                isAnimationActive={animate}
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
