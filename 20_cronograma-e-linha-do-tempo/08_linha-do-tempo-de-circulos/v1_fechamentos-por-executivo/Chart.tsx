import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyCompact, formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Closing } from './data';

/**
 * Linha do tempo de círculos: uma faixa por executivo, cada fechamento na data exata e com a área
 * do círculo proporcional ao valor. O eixo de tempo é numérico em milissegundos UTC e o eixo das
 * faixas é numérico com tique escrito pelo nome (REC-14). A área parte de zero, sem piso: o círculo
 * de R$ 10 mil tem a metade da área do de R$ 20 mil, e a legenda usa a mesma conta.
 */
export interface ClosingTimelineProps {
  readonly data?: readonly Closing[];
  readonly height?: number;
  readonly className?: string;
}

interface Point extends Closing {
  readonly x: number;
  readonly y: number;
}

const MARGIN = { top: 8, right: 24, bottom: 4, left: 8 } as const;
const Y_AXIS_WIDTH = 92;
/** Área em px² do maior círculo; o teto cabe na altura de uma faixa (cerca de 30 px). */
const AREA_MAX = 700;
/** ACE-5: `--chart-1` composto com o cartão fica acima de 3:1 nos dois temas a partir de 0,66. */
const BUBBLE_FILL_OPACITY = 0.72;
/** Referências redondas da régua de tamanho; a última não é constante, é o maior valor do recorte. */
const LEGEND_REFERENCES = [25_000, 75_000] as const;

/** Milissegundos UTC de uma data `YYYY-MM-DD`, sem `Date` sem argumento. */
function toMs(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** `YYYY-MM-DD` de um instante em milissegundos UTC. */
function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Primeiro dia do mês, em milissegundos UTC, deslocado por `shift` meses. */
function monthStart(ms: number, shift: number): number {
  const date = new Date(ms);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + shift, 1);
}

/** Primeiro dia de cada mês que cabe no domínio, em milissegundos UTC. */
function monthTicks(from: number, to: number): number[] {
  const ticks: number[] = [];
  for (let cursor = monthStart(from, 0); cursor <= to; cursor = monthStart(cursor, 1)) {
    if (cursor >= from) ticks.push(cursor);
  }
  return ticks;
}

/** Maior fechamento da lista, ou `null` quando ela é vazia (EST-1b). */
function largestClosing(list: readonly Closing[]): Closing | null {
  return list.reduce<Closing | null>((best, item) => (best === null || item.value > best.value ? item : best), null);
}

/** Soma dos valores, ou `null` quando a lista é vazia (EST-1b). */
function totalValue(list: readonly Closing[]): number | null {
  return list.length === 0 ? null : list.reduce((sum, item) => sum + item.value, 0);
}

/** Raio em px do círculo cuja área segue a escala do ZAxis, de zero a `AREA_MAX`. */
function radiusOf(value: number, maxValue: number): number {
  return maxValue > 0 ? Math.sqrt(((value / maxValue) * AREA_MAX) / Math.PI) : 0;
}

export default function ClosingTimeline({ data = defaultData, height, className }: ClosingTimelineProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  /** Fechamento de valor zero ou negativo não tem área a desenhar: não entra no círculo nem no total. */
  const closings = data.filter((item) => item.value > 0);

  if (closings.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum fechamento neste recorte: não há data com valor para desenhar.</span>
      </div>
    );
  }

  const lanes = [...new Set(closings.map((item) => item.executive))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const laneCount = lanes.length;
  const maxValue = Math.max(...closings.map((item) => item.value));
  // REC-13: o último desenhado cobre o vizinho, então os maiores vão primeiro.
  const points: Point[] = closings
    .map((item) => ({ ...item, x: toMs(item.date), y: laneCount - 1 - lanes.indexOf(item.executive) }))
    .sort((a, b) => b.value - a.value);
  const times = points.map((point) => point.x);
  const domainX: [number, number] = [monthStart(Math.min(...times), 0), monthStart(Math.max(...times), 1)];
  const ticks = monthTicks(domainX[0], domainX[1]);
  const laneTicks = lanes.map((_, index) => index);
  const biggest = largestClosing(closings);
  const total = totalValue(closings);
  const legendValues = [...LEGEND_REFERENCES.filter((value) => value < maxValue), maxValue];
  const legendBox = Math.ceil(2 * radiusOf(maxValue, maxValue));

  const reading =
    biggest && total !== null
      ? `${biggest.executive} tem o maior fechamento: ${formatCurrencyCompact(biggest.value)} em ${formatDate(biggest.date)}. Os ${formatInt(closings.length)} fechamentos somam ${formatCurrencyCompact(total)}.`
      : '';

  const summary = [
    `Linha do tempo de círculos com ${formatInt(closings.length)} fechamentos de ${formatInt(laneCount)} executivos, de ${formatDate(toIso(Math.min(...times)))} a ${formatDate(toIso(Math.max(...times)))}.`,
    biggest ? `O maior é de ${biggest.executive}, ${formatCurrencyCompact(biggest.value)} em ${formatDate(biggest.date)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'date', name: 'Data', value: formatDate(point.date) },
      { dataKey: 'value', name: 'Valor', value: formatCurrency(point.value, 0) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.executive} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            {/* EIX-3b: tempo e faixa são lidos por posição, então a grade corre nos dois sentidos. */}
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="x"
              domain={domainX}
              interval={0}
              tickFormatter={(value: number) => formatMonthShort(toIso(value))}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              type="number"
            />
            {/* REC-14: eixo de categoria abriria uma banda por ponto; o numérico com tique nomeado não. */}
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="y"
              domain={[-0.5, laneCount - 0.5]}
              interval={0}
              tickFormatter={(value: number) => lanes[laneCount - 1 - value] ?? ''}
              tickLine={false}
              tickMargin={8}
              ticks={laneTicks}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            {/* REC-31: o range é área em px²; começa em 0 e o domínio também, para a área ser proporcional ao valor. */}
            <ZAxis dataKey="value" domain={[0, maxValue]} range={[0, AREA_MAX]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={points} fill="var(--chart-1)" fillOpacity={BUBBLE_FILL_OPACITY} isAnimationActive={animate} stroke="var(--surface-raised)" strokeWidth={1} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 items-end gap-6 text-[0.6875rem] text-text-muted">
        <span>Valor do fechamento</span>
        {legendValues.map((value) => {
          const radius = radiusOf(value, maxValue);
          return (
            <span className="flex items-end gap-2" key={value}>
              <svg height={legendBox} width={legendBox}>
                <circle cx={legendBox / 2} cy={legendBox - radius} fill="var(--chart-1)" fillOpacity={BUBBLE_FILL_OPACITY} r={radius} stroke="var(--surface-raised)" strokeWidth={1} />
              </svg>
              <span className="font-display tabular-nums">{formatCurrencyCompact(value)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
