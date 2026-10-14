import { Filter } from 'lucide-react';
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData } from './data';

/**
 * Densidade de uma medida contínua: a curva suave que responde a mesma pergunta do histograma sem o
 * degrau do bin. Aqui, onde se concentra o ticket dos negócios ganhos e se a curva tem mais de um
 * pico. A largura do bin vira a banda do kernel, e por isso ela é escrita no rodapé.
 */
export interface TicketDensityProps {
  readonly data?: readonly number[];
  readonly height?: number;
  readonly className?: string;
}

/** Pontos da grade onde a curva é calculada. */
const GRID_SIZE = 120;
/** Ticket não é negativo: a grade nunca começa abaixo de zero, mesmo que a banda empurrasse a cauda. */
const NON_NEGATIVE = true;
const AREA_FILL_OPACITY = 0.18;
const MARGIN = { top: 24, right: 16, bottom: 0, left: 16 } as const;
/** Alvo de tiques no eixo X: com a amplitude deste dado, 7 cai no passo redondo de R$ 20 mil. */
const X_TICK_TARGET = 7;
/** Piso do pico: abaixo de 20% da altura máxima, uma elevação é ruído da banda e não um pico. */
const PEAK_FLOOR = 0.2;
/** O vale entre dois picos precisa cair a 75% do menor deles, ou os dois são um pico só. */
const VALLEY_RATIO = 0.75;
const MIN_SAMPLE = 2;

interface DensityRow {
  readonly x: number;
  readonly density: number;
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

/** Banda de Silverman: 0,9 vezes o menor entre o desvio e a amplitude interquartil sobre 1,34, vezes n^-1/5. */
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

/** Kernel gaussiano sobre grade uniforme, recortada no mínimo e no máximo observados. */
function estimate(values: readonly number[], bandwidth: number): DensityRow[] {
  if (values.length === 0) return [];
  const low = NON_NEGATIVE ? Math.max(0, Math.min(...values)) : Math.min(...values);
  const high = Math.max(...values);
  const norm = 1 / (values.length * bandwidth * Math.sqrt(2 * Math.PI));
  return Array.from({ length: GRID_SIZE }, (_, index) => {
    const x = low + ((high - low) * index) / (GRID_SIZE - 1);
    const density = values.reduce((sum, value) => sum + Math.exp(-0.5 * ((x - value) / bandwidth) ** 2), 0);
    return { x, density: density * norm };
  });
}

/** Picos separados: máximos locais acima do piso, fundidos quando o vale entre eles é raso. */
function findPeaks(rows: readonly DensityRow[]): readonly DensityRow[] {
  const top = Math.max(...rows.map((row) => row.density));
  const kept: number[] = [];
  for (let index = 1; index < rows.length - 1; index += 1) {
    const current = rows[index]?.density ?? 0;
    const isPeak = current > (rows[index - 1]?.density ?? 0) && current >= (rows[index + 1]?.density ?? 0);
    if (!isPeak || current < PEAK_FLOOR * top) continue;
    const previous = kept[kept.length - 1];
    if (previous === undefined) {
      kept.push(index);
      continue;
    }
    const valley = Math.min(...rows.slice(previous, index + 1).map((row) => row.density));
    const lowerPeak = Math.min(current, rows[previous]?.density ?? 0);
    if (valley <= VALLEY_RATIO * lowerPeak) kept.push(index);
    else if (current > (rows[previous]?.density ?? 0)) kept[kept.length - 1] = index;
  }
  return kept.flatMap((index) => {
    const row = rows[index];
    return row === undefined ? [] : [row];
  });
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

export default function TicketDensity({ data = defaultData, height, className }: TicketDensityProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const bandwidth = silverman(data);

  if (data.length === 0 || bandwidth === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum negócio ganho com ticket suficiente neste recorte: sem amostra não há curva para estimar.</span>
      </div>
    );
  }

  const rows = estimate(data, bandwidth);
  const low = rows[0]?.x ?? 0;
  const high = rows[rows.length - 1]?.x ?? low;
  const top = Math.max(...rows.map((row) => row.density));
  const peaks = findPeaks(rows);
  const median = quantile([...data].sort((a, b) => a - b), 0.5);
  const medianText = median === null ? '' : formatCurrencyCompact(median);
  const firstPeak = peaks[0];
  const lastPeak = peaks[peaks.length - 1];
  /** A frase só localiza a mediana quando a conta confirma: no vale, ou na descida do primeiro pico. */
  const valley =
    firstPeak === undefined || lastPeak === undefined || firstPeak === lastPeak
      ? undefined
      : rows
          .filter((row) => row.x > firstPeak.x && row.x < lastPeak.x)
          .reduce<DensityRow | undefined>((best, row) => (best === undefined || row.density < best.density ? row : best), undefined);
  const placement =
    median === null || firstPeak === undefined || valley === undefined
      ? ''
      : Math.abs(median - valley.x) <= bandwidth
        ? ', no vale entre eles'
        : median > firstPeak.x && median < valley.x
          ? ', na descida do primeiro pico'
          : '';
  const peaksText = peaks.map((peak) => formatCurrencyCompact(peak.x)).join(' e ');

  const shape =
    peaks.length >= 2
      ? `A curva tem ${String(peaks.length)} picos, perto de ${peaksText}.`
      : `A curva tem um pico só, perto de ${peaksText}.`;
  const reading = `${shape} Mediana ${medianText}${placement}.`;
  const summary =
    `Gráfico de densidade do ticket de ${formatInt(data.length)} negócios ganhos, de ${formatCurrencyCompact(low)} a ${formatCurrencyCompact(high)}. ` +
    `${shape} Mediana ${medianText}, banda ${formatCurrencyCompact(bandwidth)}.`;

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
            {/* O eixo Y é omitido de propósito: altura de densidade não é contagem, e um número ali seria
                lido como tal. A nota de altura relativa está no rodapé. */}
            <YAxis domain={[0, top * 1.05]} hide />
            {median === null ? null : (
              /* extendDomain: sem ele o Recharts descarta a referência que cai fora do domínio (REC-1). */
              <ReferenceLine
                ifOverflow="extendDomain"
                label={{ fill: 'var(--text-muted)', fontSize: 11, position: 'top', value: `mediana ${medianText}` }}
                stroke="var(--line-strong)"
                strokeDasharray="4 4"
                x={median}
              />
            )}
            <Area
              dataKey="density"
              fill="var(--chart-1)"
              fillOpacity={AREA_FILL_OPACITY}
              isAnimationActive={animate}
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`n ${formatInt(data.length)} negócios ganhos`}</span>
        <span className="tabular-nums">{`banda ${formatCurrencyCompact(bandwidth)}`}</span>
        <span>altura relativa, sem eixo Y</span>
      </div>
    </figure>
  );
}
