import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type CampaignPeakWeek } from './data';

/**
 * Streamgraph com uma campanha em destaque: as demais dividem o mesmo neutro, separadas por
 * contorno, e só a campanha de `highlightId` recebe cor própria e rótulo em negrito, o segundo
 * canal que a COR-2 pede porque no destaque de série única a cor sozinha não basta. Sem eixo
 * numérico: os dois picos do ano são anotados com o total da semana, porque a forma não deixa ler
 * o valor de uma camada isolada.
 */
type LayerKey = Exclude<keyof CampaignPeakWeek, 'week'>;

export interface CampaignPeakStreamProps {
  readonly data?: readonly CampaignPeakWeek[];
  readonly highlightId?: LayerKey;
  readonly height?: number;
  readonly className?: string;
}

const LAYER_KEYS: readonly LayerKey[] = ['buscaPaga', 'socialPago', 'nutricaoEmail', 'eventoPresencial', 'webinarSetembro'];
const LAYER_LABEL: Record<LayerKey, string> = {
  buscaPaga: 'Busca paga',
  socialPago: 'Social pago',
  nutricaoEmail: 'Nutrição por email',
  eventoPresencial: 'Evento presencial',
  webinarSetembro: 'Webinar de setembro',
};
const HIGHLIGHT_FILL = 'var(--chart-1)';
const NEUTRAL_FILL = 'var(--line-strong)';
const SEPARATOR_STROKE = 'var(--surface-raised)';
const MARGIN = { top: 30, right: 12, bottom: 0, left: 12 } as const;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface PeakLabelProps {
  readonly viewBox?: { readonly x?: number };
  readonly text: string;
}

function totalOf(row: CampaignPeakWeek): number {
  return LAYER_KEYS.reduce((sum, key) => sum + row[key], 0);
}

function monthlyTicks(rows: readonly CampaignPeakWeek[]): readonly string[] {
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

/** Semana de maior total dentro de um recorte de índices, para achar cada pico sem hardcodar data. */
function peakIndex(rows: readonly CampaignPeakWeek[], from: number, to: number): number {
  let best = from;
  for (let i = from; i < to && i < rows.length; i += 1) if (totalOf(rows[i] as CampaignPeakWeek) > totalOf(rows[best] as CampaignPeakWeek)) best = i;
  return best;
}

function insideOutOrder(keys: readonly LayerKey[], totals: Record<LayerKey, number>): LayerKey[] {
  const sorted = [...keys].sort((a, b) => totals[b] - totals[a]);
  const ordered: LayerKey[] = [];
  sorted.forEach((key, index) => (index % 2 === 0 ? ordered.push(key) : ordered.unshift(key)));
  return ordered;
}

export default function CampaignPeakStream({
  data = defaultData,
  highlightId = defaultHighlightId as LayerKey,
  height,
  className,
}: CampaignPeakStreamProps) {
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

  const totals = LAYER_KEYS.reduce((acc, key) => ({ ...acc, [key]: rows.reduce((sum, row) => sum + row[key], 0) }), {} as Record<LayerKey, number>);
  const layerOrder = insideOutOrder(LAYER_KEYS, totals);
  const half = Math.floor(rows.length / 2);
  const iPeakA = peakIndex(rows, 0, half);
  const iPeakB = peakIndex(rows, half, rows.length);
  const rowA = rows[iPeakA];
  const rowB = rows[iPeakB];
  const totalA = rowA ? totalOf(rowA) : 0;
  const totalB = rowB ? totalOf(rowB) : 0;
  const highlightShareB = rowB && totalB > 0 ? rowB[highlightId as LayerKey] / totalB : 0;

  const summary = [
    `Streamgraph com leads semanais de ${String(LAYER_KEYS.length)} campanhas em ${String(rows.length)} semanas de 2026, sem eixo numérico.`,
    rowA ? `Primeiro pico em ${formatMonthShort(rowA.week)}, com ${formatInt(totalA)} leads na semana, difuso entre campanhas.` : '',
    rowB ? `Segundo pico em ${formatMonthShort(rowB.week)}, com ${formatInt(totalB)} leads, ${formatPercent(highlightShareB, 0)} vindos de ${LAYER_LABEL[highlightId as LayerKey]}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderPeakLabel =
    (text: string) =>
    ({ viewBox }: PeakLabelProps): ReactElement => (
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={viewBox?.x ?? 0} y={12}>
        {text}
      </text>
    );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 shrink-0 text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{LAYER_LABEL[highlightId as LayerKey]}</span> carrega{' '}
        <span className="kpi-number font-semibold text-text-primary">{formatPercent(highlightShareB, 0)}</span> do segundo pico
        ({formatMonthShort(rowB?.week ?? '')}); o primeiro ({formatMonthShort(rowA?.week ?? '')}) é difuso entre as demais.
      </p>
      <p aria-hidden className="mb-2 shrink-0 text-[0.6875rem] text-text-muted">
        Forma sem eixo numérico: o total de cada pico está na anotação, o valor da semana por campanha, na dica.
      </p>
      <div className="mb-2 flex shrink-0 flex-wrap gap-x-3 gap-y-1">
        {layerOrder.map((key) => {
          const isHighlight = key === highlightId;
          return (
            <span
              className={cn('flex items-center gap-1 text-xs', isHighlight ? 'font-semibold text-text-primary' : 'text-text-secondary')}
              key={key}
            >
              <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: isHighlight ? HIGHLIGHT_FILL : NEUTRAL_FILL }} />
              {LAYER_LABEL[key]}
            </span>
          );
        })}
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
            {rowA ? (
              <ReferenceLine
                label={renderPeakLabel(`pico 1 · ${formatInt(totalA)}`)}
                stroke="var(--text-muted)"
                strokeDasharray="3 3"
                x={rowA.week}
              />
            ) : null}
            {rowB ? (
              <ReferenceLine
                label={renderPeakLabel(`pico 2 · ${formatInt(totalB)}`)}
                stroke="var(--text-muted)"
                strokeDasharray="3 3"
                x={rowB.week}
              />
            ) : null}
            {layerOrder.map((key) => (
              <Area
                dataKey={key}
                fill={key === highlightId ? HIGHLIGHT_FILL : NEUTRAL_FILL}
                fillOpacity={0.92}
                isAnimationActive={animate}
                key={key}
                name={LAYER_LABEL[key]}
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
