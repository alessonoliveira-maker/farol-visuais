import { Filter } from 'lucide-react';
import { useId, type ReactElement } from 'react';
import { Area, AreaChart, ResponsiveContainer, usePlotArea, useXAxisScale, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ChannelSample } from './data';

/**
 * Densidades sobrepostas de um mesmo CPL em dois canais, na mesma grade e com a mesma banda. Cada
 * curva é normalizada para área 1, então canais com n diferente se comparam pela forma, e a região
 * onde as duas curvas custam parecido vai hachurada, com a faixa escrita.
 */
export interface ChannelDensityProps {
  readonly data?: readonly ChannelSample[];
  readonly height?: number;
  readonly className?: string;
}

const GRID_SIZE = 120;
/** CPL não é negativo: a grade nunca começa abaixo de zero. */
const NON_NEGATIVE = true;
const MIN_SAMPLE = 2;
const AREA_FILL_OPACITY = 0.25;
const MARGIN = { top: 24, right: 16, bottom: 0, left: 16 } as const;
const X_TICK_TARGET = 7;
/** Cor por posição da legenda, na ordem de atribuição dos slots (COR-8). A ordem do dado é fixa. */
const SERIES_COLORS = ['var(--chart-1)', 'var(--chart-3)', 'var(--chart-6)', 'var(--chart-5)'] as const;
/** Duas densidades "custam igual" onde a menor chega a 60% da maior, com piso para a cauda vazia. */
const CROSSING_RATIO = 0.6;
const CROSSING_FLOOR = 0.15;
const CROSSING_STEP = 10;
const TAIL_SHARE = 0.9;
const HATCH_GAP = 7;

interface Row {
  readonly x: number;
  readonly [key: string]: number;
}

/** Quantil por interpolação linear, ou `null` quando não há amostra. */
function quantile(sorted: readonly number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const low = sorted[lower] ?? 0;
  const high = sorted[Math.min(lower + 1, sorted.length - 1)] ?? low;
  return low + (high - low) * (position - lower);
}

/** Banda de Silverman sobre a amostra reunida: uma só para todos os canais. */
function silverman(values: readonly number[]): number | null {
  if (values.length < MIN_SAMPLE) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const deviation = Math.sqrt(sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (sorted.length - 1));
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqrSpread = q1 === null || q3 === null ? 0 : (q3 - q1) / 1.34;
  const spread = iqrSpread > 0 ? Math.min(deviation, iqrSpread) : deviation;
  return spread > 0 ? 0.9 * spread * sorted.length ** -0.2 : null;
}

function kernel(values: readonly number[], x: number, bandwidth: number): number {
  const sum = values.reduce((total, value) => total + Math.exp(-0.5 * ((x - value) / bandwidth) ** 2), 0);
  return sum / (values.length * bandwidth * Math.sqrt(2 * Math.PI));
}

/** Passo de 1, 2 ou 5 vezes a potência de 10, para tiques em intervalo redondo. */
function niceTicks(low: number, high: number): readonly number[] {
  const rough = (high - low) / X_TICK_TARGET;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;
  const ticks: number[] = [];
  for (let value = Math.ceil(low / step) * step; value <= high; value += step) ticks.push(Math.round(value));
  return ticks;
}

interface CrossingBandProps {
  readonly from: number;
  readonly to: number;
  readonly label: string;
}

/**
 * Hachura da região de cruzamento. Os hooks do Recharts entregam a escala e a área de plotagem, que
 * é o único jeito de a posição não ser chute. Vem ANTES das `Area` na árvore: o que se pinta depois
 * cobre o que se pinta antes, e a hachura fica atrás das curvas.
 */
function CrossingBand({ from, to, label }: CrossingBandProps): ReactElement | null {
  const clipId = useId();
  const xScale = useXAxisScale();
  const plot = usePlotArea();
  if (xScale === undefined || plot === undefined) return null;
  const left = xScale(from);
  const right = xScale(to);
  if (left === undefined || right === undefined) return null;
  const top = plot.y;
  const bottom = plot.y + plot.height;
  const slant = bottom - top;
  const lines: ReactElement[] = [];
  for (let offset = -slant; offset < right - left; offset += HATCH_GAP) {
    lines.push(
      <line
        key={offset}
        stroke="var(--text-muted)"
        strokeWidth={1}
        x1={left + offset}
        x2={left + offset + slant}
        y1={bottom}
        y2={top}
      />,
    );
  }
  return (
    <g>
      <clipPath id={clipId}>
        <rect height={slant} width={right - left} x={left} y={top} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>{lines}</g>
      <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={(left + right) / 2} y={top - 8}>
        {label}
      </text>
    </g>
  );
}

export default function ChannelDensity({ data = defaultData, height, className }: ChannelDensityProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const pooled = data.flatMap((channel) => [...channel.values]);
  const bandwidth = silverman(pooled);

  if (data.length === 0 || pooled.length === 0 || data.some((channel) => channel.values.length === 0) || bandwidth === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Algum canal ficou sem campanha neste recorte: sem amostra dos dois lados não há curva para comparar.</span>
      </div>
    );
  }

  const low = NON_NEGATIVE ? Math.max(0, Math.min(...pooled)) : Math.min(...pooled);
  const high = Math.max(...pooled);
  const rows: Row[] = Array.from({ length: GRID_SIZE }, (_, index) => {
    const x = low + ((high - low) * index) / (GRID_SIZE - 1);
    const entries = data.map((channel, channelIndex) => [`c${String(channelIndex)}`, kernel(channel.values, x, bandwidth)] as const);
    return { x, ...Object.fromEntries(entries) };
  });
  const top = Math.max(0, ...rows.flatMap((row) => data.map((_, index) => row[`c${String(index)}`] ?? 0)));

  /** Região de cruzamento: onde a curva menor chega a 60% da maior, entre os dois picos. */
  const peakOf = (index: number): number => Math.max(0, ...rows.map((row) => row[`c${String(index)}`] ?? 0));
  const smallestPeak = data.length === 2 ? Math.min(peakOf(0), peakOf(1)) : 0;
  const crossingRows =
    data.length === 2
      ? rows.filter((row) => {
          const a = row.c0 ?? 0;
          const b = row.c1 ?? 0;
          return Math.min(a, b) >= CROSSING_RATIO * Math.max(a, b) && Math.min(a, b) >= CROSSING_FLOOR * smallestPeak;
        })
      : [];
  const firstCrossing = crossingRows[0];
  const lastCrossing = crossingRows[crossingRows.length - 1];
  const crossing =
    firstCrossing === undefined || lastCrossing === undefined
      ? null
      : {
          from: Math.floor(firstCrossing.x / CROSSING_STEP) * CROSSING_STEP,
          to: Math.ceil(lastCrossing.x / CROSSING_STEP) * CROSSING_STEP,
        };
  const crossingRange = crossing === null ? '' : `${formatCurrencyCompact(crossing.from)} a ${formatCurrencyCompact(crossing.to)}`;
  const crossingLabel = `Custo parecido: ${crossingRange}`;

  /** Onde começam os 10% mais caros de cada canal, na ordem da legenda. */
  const tails = data.map((channel) => quantile([...channel.values].sort((a, b) => a - b), TAIL_SHARE));
  const tailText = data
    .map((channel, index) => `${formatCurrencyCompact(tails[index] ?? 0)} ${channel.inPhrase}`)
    .join(' e ');
  const priciest = tails.reduce<number>((best, value, index) => ((value ?? 0) > (tails[best] ?? 0) ? index : best), 0);
  const reading = `Os 10% mais caros começam em ${tailText}.`;

  const summary =
    `Gráfico de densidades sobrepostas do CPL de ${data.map((channel) => channel.name.toLowerCase()).join(' e ')}, com ${formatInt(pooled.length)} campanhas. ` +
    `${reading} A cauda mais cara fica ${data[priciest]?.inPhrase ?? ''}.${crossing === null ? '' : ` As curvas se aproximam de ${crossingRange}.`}`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      <p aria-hidden className="m-0 shrink-0 text-xs font-medium text-text-secondary">
        {reading}
      </p>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        {data.map((channel, index) => (
          <span className="inline-flex items-center gap-1.5 tabular-nums" key={channel.id}>
            <span className="inline-block h-2 w-2 rounded-[2px]" style={{ background: SERIES_COLORS[index] }} />
            <span className="text-text-secondary">{channel.name}</span>
            {`n ${formatInt(channel.values.length)}`}
          </span>
        ))}
        <span>cada curva tem área unitária, então o n não altera a altura</span>
      </div>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <XAxis
              axisLine={{ stroke: 'var(--line-strong)' }}
              dataKey="x"
              domain={[low, high]}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickLine={false}
              tickMargin={8}
              ticks={[...niceTicks(low, high)]}
              type="number"
            />
            {/* Eixo Y omitido: altura de densidade é relativa e não é contagem. */}
            <YAxis domain={[0, top * 1.05]} hide />
            {crossing === null ? null : <CrossingBand from={crossing.from} label={crossingLabel} to={crossing.to} />}
            {data.map((channel, index) => (
              <Area
                dataKey={`c${String(index)}`}
                fill={SERIES_COLORS[index]}
                fillOpacity={AREA_FILL_OPACITY}
                isAnimationActive={animate}
                key={channel.id}
                name={channel.name}
                stroke={SERIES_COLORS[index]}
                strokeWidth={2}
                type="monotone"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div aria-hidden className="shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`CPL por campanha, banda comum ${formatCurrencyCompact(bandwidth)}`}</span>
        {crossing === null ? null : (
          <span className="tabular-nums">
            {` · faixa hachurada: custo parecido, onde a curva menor passa de ${formatInt(CROSSING_RATIO * 100)}% da maior`}
          </span>
        )}
      </div>
    </figure>
  );
}
