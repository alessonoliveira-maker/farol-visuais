import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';

import { AXIS_PROPS, CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyMeetings } from './data';

/**
 * Colunas agrupadas: agendas marcadas e agendas realizadas lado a lado em cada um dos últimos
 * seis meses, com cor fixa por série, grade e tique de contagem, e a taxa de realização com o
 * volume na dica de cada mês.
 */
export interface MeetingsByMonthProps {
  /** Um mês por linha. A ordem de entrada não importa: o componente ordena. */
  readonly data?: readonly MonthlyMeetings[];
  /** Altura em px quando o pai não tem altura definida (no corpo de um VisualCard, por exemplo). */
  readonly height?: number;
  readonly className?: string;
}

type SeriesKey = 'scheduled' | 'held';

interface SeriesSpec {
  readonly key: SeriesKey;
  readonly label: string;
  readonly fill: string;
}

/** Cor fixa por série na ordem de slots do CONTRATO (COR-8): principal no slot 1, a segunda no slot 3. */
const SERIES: readonly SeriesSpec[] = [
  { key: 'scheduled', label: 'Marcadas', fill: CHART_SERIES_COLORS[0] },
  { key: 'held', label: 'Realizadas', fill: CHART_SERIES_COLORS[2] },
];
const MARGIN = { top: 8, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 36;
/** Vão dentro do grupo (curto, para o par ler junto) e vão entre meses (largo, para separar). */
const BAR_GAP = 1;
const BAR_CATEGORY_GAP = '30%';
/**
 * Passo pela ESP-6: corpo do cartão com cerca de 526 px de largura de plotagem (574 do corpo do
 * preset `card` menos 36 do eixo de valor e 12 de margem) para 6 meses dá passo de 87,7 px. Com
 * BAR_GAP de 1 px e BAR_CATEGORY_GAP no piso de 30% (o vão mínimo, que maximiza a espessura):
 * espessura = (87,7 × 0,40 − 1 × 1) / 2 séries ≈ 17,0 px, acima do piso de 12 px da ESP-2.
 * Conferido no preview.svg, não só na constante declarada (decisão do dono, 2026-09-18).
 */
const BAR_MAX = 17;
const BAR_RADIUS: [number, number, number, number] = [3, 3, 0, 0];
const GRID_TICKS = 4;

function byMonth(a: MonthlyMeetings, b: MonthlyMeetings): number {
  return a.month.localeCompare(b.month);
}

/** O mês com a menor taxa de realização; no empate, o que marcou mais, porque perde mais reuniões. */
function lowestShowRate(rows: readonly MonthlyMeetings[]): MonthlyMeetings | undefined {
  let worst: MonthlyMeetings | undefined;
  for (const row of rows) {
    if (row.scheduled <= 0) continue;
    if (!worst) {
      worst = row;
      continue;
    }
    const rate = row.held / row.scheduled;
    const worstRate = worst.held / worst.scheduled;
    if (rate < worstRate || (rate === worstRate && row.scheduled > worst.scheduled)) worst = row;
  }
  return worst;
}

interface MonthTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly index?: number;
}

export default function MeetingsByMonth({ data = defaultData, height, className }: MeetingsByMonthProps) {
  const animate = useAnimateOnce();
  const rows = [...data].sort(byMonth);
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: a pré-vendas não marcou agenda no período.</span>
      </div>
    );
  }

  const worst = lowestShowRate(rows);
  const first = rows[0];
  const last = rows[rows.length - 1];
  const totalScheduled = rows.reduce((sum, row) => sum + row.scheduled, 0);
  const totalHeld = rows.reduce((sum, row) => sum + row.held, 0);

  const summary = [
    `Gráfico de colunas agrupadas com agendas marcadas e realizadas em ${String(rows.length)} meses${
      first && last ? `, de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}` : ''
    }.`,
    worst ? `Menor realização em ${formatMonthShort(worst.month)}, ${formatRateWithVolume(worst.held, worst.scheduled)}.` : '',
    `No conjunto, ${formatRateWithVolume(totalHeld, totalScheduled)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderMonthTick = ({ x, y, index = -1 }: MonthTickProps): ReactElement => {
    const row = rows[index];
    const isWorst = row !== undefined && row.month === worst?.month;
    return (
      <text
        className="font-sans"
        fill={isWorst ? 'var(--text-primary)' : 'var(--text-muted)'}
        fontSize={11}
        fontWeight={isWorst ? 600 : 400}
        textAnchor="middle"
        x={Number(x)}
        y={Number(y) + 12}
      >
        {row ? formatMonthShort(row.month) : ''}
      </text>
    );
  };

  /**
   * Dica no formato do ChartTooltip (mesmo fundo, borda e algarismo tabular), com uma linha a
   * mais: a taxa de realização com volume, por formatRateWithVolume. O ChartTooltip do Farol não
   * calcula taxa derivada de duas séries, então a peça monta o mesmo desenho à mão.
   */
  const renderTooltip = ({ active, payload, label }: TooltipContentProps): ReactElement | null => {
    if (!active || !payload || payload.length === 0) return null;
    const scheduled = payload.find((entry) => entry.dataKey === 'scheduled')?.value;
    const held = payload.find((entry) => entry.dataKey === 'held')?.value;
    const rate =
      typeof scheduled === 'number' && typeof held === 'number' && scheduled > 0
        ? formatRateWithVolume(held, scheduled)
        : null;
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
        {rate ? (
          <p className="mt-1 border-t border-line-subtle pt-1 text-text-secondary">
            Realização: <span className="kpi-number font-medium text-text-primary">{rate}</span>
          </p>
        ) : null}
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
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tick={renderMonthTick} tickLine={false} />
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
    </div>
  );
}
