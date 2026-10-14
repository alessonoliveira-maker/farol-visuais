import { Filter, Minus, TrendingDown, TrendingUp, Unplug } from 'lucide-react';

import { formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, GRID_COLUMNS, GRID_ROWS, MONTHS, UF_GRID, type UfQualifiedSeries } from './data';

/**
 * Tile map com mini gráfico por UF, lido como tendência: cada tile classifica a UF em alta, em queda ou
 * estável pela variação dos 3 últimos meses (do mês de base ao último), pinta a linha pela classe e
 * escreve o último valor e a variação com sinal. Cada tile tem a própria escala, porque a pergunta é
 * a direção da série e não o volume.
 */
export interface TrendTileMapProps {
  readonly data?: readonly UfQualifiedSeries[];
  readonly months?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 100;
const VIEW_H = 32;
const PAD_X = 3;
const PAD_Y = 4;
/** Janela da tendência: o último mês contra o mês de 2 posições antes, ou seja, os 3 últimos meses. */
const WINDOW_MONTHS = 3;
/** Variação abaixo de 5% em módulo é estável: nem verde nem vermelho. */
const FLAT_THRESHOLD = 0.05;
/** A partir de 10% de variação, a casa decimal não muda a decisão (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;
/** Amplitude mínima da escala do tile, em fração do maior valor: sem isso uma série estável vira serra. */
const MIN_SPAN = 0.3;
/** Piso absoluto da amplitude, em leads: série de 0 e 1 não pode virar uma serra que parece queda de 100%. */
const MIN_SPAN_COUNT = 4;
const TILE_RADIUS = 'rounded-[4px]';

type Trend = 'up' | 'down' | 'flat' | 'none';

interface Reading {
  readonly entry: UfQualifiedSeries;
  readonly last: number | null;
  readonly base: number | null;
  readonly delta: number | null;
  readonly trend: Trend;
}

const TREND_STROKE: Readonly<Record<Trend, string>> = {
  up: 'var(--positive)',
  down: 'var(--negative)',
  flat: 'var(--text-muted)',
  none: 'var(--text-muted)',
};
const TREND_TEXT: Readonly<Record<Trend, string>> = {
  up: 'text-positive',
  down: 'text-negative',
  flat: 'text-text-secondary',
  none: 'text-text-muted',
};
const TREND_DOT: Readonly<Record<Trend, string>> = {
  up: 'bg-positive',
  down: 'bg-negative',
  flat: 'bg-text-muted',
  none: 'bg-text-muted',
};

function xAt(index: number, count: number): number {
  return PAD_X + (index / Math.max(1, count - 1)) * (VIEW_W - 2 * PAD_X);
}

/** Domínio próprio do tile: do menor ao maior valor medido, ampliado até a amplitude mínima. */
function domainOf(values: readonly (number | null)[]): readonly [number, number] | null {
  const measured = values.flatMap((value) => (value === null ? [] : [value]));
  if (measured.length === 0) return null;
  const low = Math.min(...measured);
  const high = Math.max(...measured);
  const span = Math.max(high - low, high * MIN_SPAN, MIN_SPAN_COUNT);
  const middle = (high + low) / 2;
  return [middle - span / 2, middle + span / 2];
}

function yAt(value: number, domain: readonly [number, number]): number {
  return PAD_Y + (1 - (value - domain[0]) / (domain[1] - domain[0])) * (VIEW_H - 2 * PAD_Y);
}

/** Mês `null` fecha o trecho e abre outro: a linha quebra em vez de interpolar. */
function linePath(values: readonly (number | null)[], domain: readonly [number, number]): string {
  let path = '';
  let open = false;
  values.forEach((value, index) => {
    if (value === null) {
      open = false;
      return;
    }
    path += `${open ? 'L' : 'M'}${xAt(index, values.length).toFixed(2)} ${yAt(value, domain).toFixed(2)}`;
    open = true;
  });
  return path;
}

/** Variação do mês de base ao último. Base ausente ou zero não dá variação: devolve `null`, nunca 0. */
function readEntry(entry: UfQualifiedSeries): Reading {
  const values = entry.qualified;
  const last = values[values.length - 1] ?? null;
  const base = values[values.length - WINDOW_MONTHS] ?? null;
  const delta = last !== null && base !== null && base > 0 ? (last - base) / base : null;
  const trend: Trend = delta === null ? 'none' : Math.abs(delta) < FLAT_THRESHOLD ? 'flat' : delta > 0 ? 'up' : 'down';
  return { entry, last, base, delta, trend };
}

/** Sinal à mão sobre o valor absoluto: o `+` não vem de nenhum formatador e o menos é o tipográfico (U+2212). */
function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  if (absolute === 0) return formatPercent(0, 1);
  const digits = absolute >= WHOLE_PERCENT_FROM ? 0 : 1;
  return `${fraction > 0 ? '+' : '−'}${formatPercent(absolute, digits)}`;
}

function biggest(readings: readonly Reading[], sign: 1 | -1): Reading | undefined {
  return readings
    .filter((item) => item.delta !== null && item.delta * sign > 0 && item.trend !== 'flat')
    .reduce<Reading | undefined>(
      (best, item) => (best === undefined || (item.delta ?? 0) * sign > (best.delta ?? 0) * sign ? item : best),
      undefined,
    );
}

export default function TrendTileMap({ data = defaultData, months = MONTHS, height, className }: TrendTileMapProps) {
  const readings = data.map(readEntry);
  const measured = readings.filter((item) => item.last !== null || item.entry.qualified.some((value) => value !== null));

  if (measured.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com lead qualificado medido neste recorte: não há tendência a classificar.</span>
      </div>
    );
  }

  const baseMonth = months[months.length - WINDOW_MONTHS];
  const lastMonth = months[months.length - 1];
  const baseLabel = baseMonth === undefined ? '' : formatMonthShort(baseMonth);
  const lastLabel = lastMonth === undefined ? '' : formatMonthShort(lastMonth);
  const count = (trend: Trend) => readings.filter((item) => item.trend === trend).length;
  const noBase = readings.filter((item) => item.trend === 'none').length;
  const topUp = biggest(readings, 1);
  const topDown = biggest(readings, -1);

  const summary =
    `Mapa de tiles com a tendência de leads qualificados de ${baseLabel} a ${lastLabel} em ${formatInt(data.length)} UFs: ` +
    `${formatInt(count('up'))} em alta, ${formatInt(count('down'))} em queda, ${formatInt(count('flat'))} estáveis e ${formatInt(noBase)} sem base para comparar. ` +
    (topUp?.delta == null ? '' : `Maior alta: ${topUp.entry.uf}, ${signedPercent(topUp.delta)}. `) +
    (topDown?.delta == null ? '' : `Maior queda: ${topDown.entry.uf}, ${signedPercent(topDown.delta)}.`);

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="m-0 shrink-0 text-xs font-medium text-text-secondary">
        {`${formatInt(count('up'))} UFs em alta, ${formatInt(count('down'))} em queda, ${formatInt(count('flat'))} estáveis e ${formatInt(noBase)} sem base, de ${baseLabel} a ${lastLabel}`}
      </p>
      <div
        aria-hidden
        className="grid min-h-0 flex-1 gap-1"
        style={{
          gridTemplateColumns: `repeat(${String(GRID_COLUMNS)}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${String(GRID_ROWS)}, minmax(0, 1fr))`,
        }}
      >
        {readings.map(({ entry, last, base, delta, trend }) => {
          const position = UF_GRID[entry.uf];
          const domain = domainOf(entry.qualified);
          const lastIndex = entry.qualified.length - 1;
          const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
          return (
            <div
              className={cn('flex min-h-0 min-w-0 flex-col gap-0.5 bg-surface-sunken px-1.5 py-1', TILE_RADIUS)}
              key={entry.uf}
              style={{ gridColumn: position.column, gridRow: position.row }}
              title={
                domain === null
                  ? `${entry.name}: ${formatUnavailable()}`
                  : `${entry.name}: ${base === null ? formatUnavailable() : formatInt(base)} em ${baseLabel}, ${last === null ? formatUnavailable() : formatInt(last)} em ${lastLabel}`
              }
            >
              <div className="flex shrink-0 items-center justify-between gap-1 leading-4">
                <span className="text-xs font-semibold text-text-secondary">{entry.uf}</span>
                {domain === null || trend === 'none' ? null : <Icon aria-hidden className={cn('size-3.5 shrink-0', TREND_TEXT[trend])} strokeWidth={2.5} />}
              </div>
              {domain === null ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-0.5 text-text-muted">
                  <Unplug aria-hidden className="size-3.5 shrink-0" />
                  <span className="text-[0.6875rem] leading-none">{formatUnavailable()}</span>
                </div>
              ) : (
                <>
                  <div className="relative min-h-0 flex-1">
                    <svg aria-hidden className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
                      <path
                        d={linePath(entry.qualified, domain)}
                        fill="none"
                        stroke={TREND_STROKE[trend]}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                    {/* O ponto final é HTML porque o SVG esticado deformaria o círculo. */}
                    {last === null ? null : (
                      <span
                        className={cn('absolute -mt-1 -ml-1 size-2 rounded-full', TREND_DOT[trend])}
                        style={{
                          left: `${String((xAt(lastIndex, entry.qualified.length) / VIEW_W) * 100)}%`,
                          top: `${String((yAt(last, domain) / VIEW_H) * 100)}%`,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex shrink-0 items-baseline justify-between gap-1 leading-4">
                    <span className="font-display text-xs font-semibold text-text-primary tabular-nums">
                      {last === null ? formatUnavailable() : formatInt(last)}
                    </span>
                    <span className={cn('font-display text-[0.6875rem] font-medium tabular-nums', TREND_TEXT[trend])}>
                      {delta === null ? 'sem base' : signedPercent(delta)}
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted tabular-nums">
        <span>{`Variação de ${baseLabel} para ${lastLabel}; estável abaixo de ${formatPercent(FLAT_THRESHOLD, 0)}. O número é o de ${lastLabel}, em leads qualificados.`}</span>
        <span>Cada tile na própria escala: a linha mostra direção, não volume. Sem base: mês de partida zerado ou sem coleta.</span>
      </div>
    </figure>
  );
}
