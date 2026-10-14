import type { ReactElement } from 'react';
import { Filter } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';

import { AXIS_PROPS, CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyLeadsByPlatform } from './data';

/**
 * Colunas agrupadas: leads mensais de três plataformas de mídia paga lado a lado, com o total do
 * semestre por plataforma no rodapé e a dica listando as três na ordem visual das colunas.
 */
export interface LeadsByPlatformProps {
  /** Um mês por linha. A ordem de entrada não importa: o componente ordena. */
  readonly data?: readonly MonthlyLeadsByPlatform[];
  /** Altura em px quando o pai não tem altura definida (no corpo de um VisualCard, por exemplo). */
  readonly height?: number;
  readonly className?: string;
}

type SeriesKey = 'paidSearch' | 'video' | 'social';

interface SeriesSpec {
  readonly key: SeriesKey;
  readonly label: string;
  readonly fill: string;
}

/** Cor por slot fixo da série, na ordem de slots do CONTRATO (COR-8): 1, 3 e 6. */
const SERIES: readonly SeriesSpec[] = [
  { key: 'paidSearch', label: 'Busca paga', fill: CHART_SERIES_COLORS[0] },
  { key: 'video', label: 'Vídeo online', fill: CHART_SERIES_COLORS[2] },
  { key: 'social', label: 'Rede social', fill: CHART_SERIES_COLORS[5] },
];
const MARGIN = { top: 8, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 36;
/** Três séries na banda: vão curto e explícito entre colunas vizinhas (ESP-6). */
const BAR_GAP = 1.5;
const BAR_CATEGORY_GAP = '30%';
/**
 * Passo pela ESP-6: corpo do cartão largo ~= 894 x 274 px; disponível ~= 894 − 36 (eixo de
 * contagem) − 8 (margem) = 850 px para 6 meses, passo ~= 141,7 px. Com BAR_GAP de 1,5 px e
 * BAR_CATEGORY_GAP no piso de 30%: espessura = (141,7 × 0,40 − 1,5 × 2) / 3 ~= 17,9 px, acima do
 * piso de 12 px da ESP-2. Conferido no preview.svg, não só na constante declarada.
 */
const BAR_MAX = 17;
const BAR_RADIUS: [number, number, number, number] = [3, 3, 0, 0];
const GRID_TICKS = 4;

function byMonth(a: MonthlyLeadsByPlatform, b: MonthlyLeadsByPlatform): number {
  return a.month.localeCompare(b.month);
}

function total(rows: readonly MonthlyLeadsByPlatform[], key: SeriesKey): number {
  return rows.reduce((sum, row) => sum + row[key], 0);
}

export default function LeadsByPlatform({ data = defaultData, height, className }: LeadsByPlatformProps) {
  const animate = useAnimateOnce();
  const rows = [...data].sort(byMonth);
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: nenhuma plataforma trouxe lead no período.</span>
      </div>
    );
  }

  const first = rows[0];
  const last = rows[rows.length - 1];
  const totals = SERIES.map((series) => ({ series, value: total(rows, series.key) }));
  const leader = totals.reduce((max, entry) => (entry.value > max.value ? entry : max), totals[0] ?? { series: SERIES[0], value: 0 });

  const summary = [
    `Gráfico de colunas agrupadas com leads mensais de ${String(SERIES.length)} plataformas de mídia paga${
      first && last ? `, de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}` : ''
    }.`,
    leader.series ? `No semestre, ${leader.series.label} lidera com ${formatInt(leader.value)} leads.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = ({ active, payload, label }: TooltipContentProps): ReactElement | null => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{typeof label === 'string' ? formatMonthShort(label) : ''}</p>
        <ul className="flex flex-col gap-1">
          {SERIES.map((series) => {
            const value = payload.find((entry) => entry.dataKey === series.key)?.value;
            return (
              <li className="flex items-center gap-2 text-text-secondary" key={series.key}>
                <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: series.fill }} />
                {series.label}:{' '}
                <span className="kpi-number font-medium text-text-primary">{formatInt(typeof value === 'number' ? value : 0)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul aria-hidden className="mb-2 flex shrink-0 items-center gap-4 text-xs text-text-secondary">
        {SERIES.map((series) => (
          <li className="flex items-center gap-2.5" key={series.key}>
            <span className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: series.fill }} />
            {series.label}
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} barGap={BAR_GAP} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              interval={0}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickLine={false}
            />
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              tickCount={GRID_TICKS}
              tickFormatter={(value: number) => formatInt(value)}
              tickLine={false}
              width={VALUE_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {SERIES.map((series) => (
              <Bar
                dataKey={series.key}
                fill={series.fill}
                isAnimationActive={animate}
                key={series.key}
                maxBarSize={BAR_MAX}
                name={series.label}
                radius={BAR_RADIUS}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul aria-hidden className="mt-2 flex shrink-0 items-center justify-between gap-4 border-t border-line-subtle pt-2 text-[0.6875rem] text-text-muted">
        {totals.map(({ series, value }) => (
          <li className="flex items-center gap-1.5" key={series.key}>
            <span>{series.label}</span>
            <span className="kpi-number font-medium text-text-primary tabular-nums">{formatInt(value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
