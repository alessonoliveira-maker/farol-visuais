import { Filter } from 'lucide-react';
import { useState, type ReactElement } from 'react';

import { formatCurrency, formatCurrencyAxis, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthCpl } from './data';

/**
 * Ridgeline do CPL das campanhas: uma densidade por mês, 18 faixas empilhadas e sobrepostas na
 * vizinha, todas na mesma régua em reais. Mostra como a forma do custo mudou mês a mês, e não só a
 * mediana; a dica por faixa dá o mês, o n de campanhas e a mediana.
 */
export interface CplRidgelineProps {
  readonly data?: readonly MonthCpl[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 574;
const NAME_X = 0;
const PLOT_X = 56;
const PLOT_W = 484;
/** Rótulo de mês só a cada três faixas: 18 nomes em 11 px não cabem no passo de 17 px sem virar muro. */
const LABEL_EVERY = 3;
const GRID_SIZE = 120;
/** Altura do pico de uma faixa, e quanto dela invade a faixa de cima: o passo vem dos dois. */
const PEAK_H = 31;
const OVERLAP = 0.4;
const ROW_STEP = PEAK_H * (1 - OVERLAP);
const AXIS_H = 28;
/** Passo do eixo em reais: a régua cresce de 50 em 50, e o teto é o primeiro múltiplo acima do maior CPL. */
const TICK_STEP = 50;
/** Piso de altura: a faixa mais baixa nunca desenha menos que esta fração do pico global. */
const HEIGHT_FLOOR = 0.08;
/** Abaixo disto a faixa não estima forma: um traço por negócio no lugar da curva. */
const MIN_CURVE_SAMPLE = 30;
const MIN_SAMPLE = 2;
const MEDIAN_W = 1.5;
const OUTLINE_W = 1.5;
const MARK_H = 12;
const SMALL_LABEL_W = 88;
const TIP_W = 150;
const TIP_H = 36;

interface Band {
  readonly item: MonthCpl;
  readonly median: number | null;
  readonly low: number;
  readonly high: number;
  /** Densidade na grade da faixa, ou `null` quando a amostra é pequena demais para curva. */
  readonly density: readonly number[] | null;
  readonly peak: number;
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

/** Banda de Silverman sobre a amostra reunida: uma só para todas as faixas. */
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

function buildBand(item: MonthCpl, bandwidth: number): Band {
  const sorted = [...item.costs].sort((a, b) => a - b);
  const low = sorted[0] ?? 0;
  const high = sorted[sorted.length - 1] ?? 0;
  const density =
    sorted.length < MIN_CURVE_SAMPLE
      ? null
      : Array.from({ length: GRID_SIZE }, (_, cell) =>
          kernel(sorted, low + ((high - low) * cell) / (GRID_SIZE - 1), bandwidth),
        );
  return { item, median: quantile(sorted, 0.5), low, high, density, peak: Math.max(0, ...(density ?? [])) };
}

export default function CplRidgeline({ data = defaultData, height, className }: CplRidgelineProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const style = height === undefined ? undefined : { height };
  const pooled = data.flatMap((item) => [...item.costs]);
  const bandwidth = silverman(pooled);

  if (data.length === 0 || pooled.length === 0 || bandwidth === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte: sem campanha não há distribuição de CPL para desenhar.</span>
      </div>
    );
  }

  const domainMax = Math.max(TICK_STEP, Math.ceil(Math.max(...pooled) / TICK_STEP) * TICK_STEP);
  const px = (days: number): number => PLOT_X + (days / domainMax) * PLOT_W;
  const ticks = Array.from({ length: domainMax / TICK_STEP + 1 }, (_, index) => index * TICK_STEP);

  const bands = data.map((item) => buildBand(item, bandwidth));
  const globalPeak = Math.max(...bands.map((band) => band.peak));
  /** Escala da faixa: relativa ao pico global, e nunca abaixo do piso. */
  const scaleOf = (band: Band): number => (globalPeak > 0 ? Math.max(band.peak / globalPeak, HEIGHT_FLOOR) : 0);
  const lifted = bands.filter((band) => band.density !== null && globalPeak > 0 && band.peak / globalPeak < HEIGHT_FLOOR);
  const heightAt = (band: Band, value: number): number => (band.peak > 0 ? (value / band.peak) * scaleOf(band) * PEAK_H : 0);

  const baseOf = (index: number): number => PEAK_H + index * ROW_STEP;
  const axisY = baseOf(bands.length - 1) + 8;
  const viewH = axisY + AXIS_H;

  const first = bands[0];
  const last = bands[bands.length - 1];
  const reading =
    first?.median != null && last?.median != null
      ? `Mediana de ${formatCurrency(first.median)} em ${formatMonthShort(first.item.month)} e de ${formatCurrency(last.median)} em ${formatMonthShort(last.item.month)}.`
      : 'Nenhum mês tem amostra suficiente para estimar a mediana.';
  const summary =
    `Ridgeline do CPL de ${formatInt(pooled.length)} campanhas em ${formatInt(data.length)} meses, na mesma régua em reais. ${reading}`;

  const renderRow = (band: Band, index: number): ReactElement => {
    const base = baseOf(index);
    const { item } = band;
    const points =
      band.density === null
        ? ''
        : band.density
            .map((value, cell) => {
              const days = band.low + ((band.high - band.low) * cell) / (GRID_SIZE - 1);
              return `L${px(days).toFixed(2)} ${(base - heightAt(band, value)).toFixed(2)}`;
            })
            .join(' ');
    const medianHeight =
      band.median === null || band.density === null ? 0 : heightAt(band, kernel(item.costs, band.median, bandwidth));
    const labelFits = px(band.high) + 6 + SMALL_LABEL_W <= VIEW_W;

    return (
      <g key={item.id}>
        {index % LABEL_EVERY === 0 ? (
          <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} x={NAME_X} y={base}>
            {formatMonthShort(item.month)}
          </text>
        ) : null}
        {band.density === null ? (
          <>
            {item.costs.map((days, mark) => (
              <line
                key={mark}
                stroke="var(--chart-1)"
                strokeWidth={1.5}
                x1={px(days)}
                x2={px(days)}
                y1={base}
                y2={base - MARK_H}
              />
            ))}
            <text
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              textAnchor={labelFits ? 'start' : 'end'}
              x={labelFits ? px(band.high) + 6 : px(band.low) - 6}
              y={base - MARK_H / 2}
            >
              amostra pequena
            </text>
          </>
        ) : (
          <path
            d={`M${px(band.low).toFixed(2)} ${base} ${points} L${px(band.high).toFixed(2)} ${base} Z`}
            fill="var(--chart-1)"
            stroke="var(--surface-raised)"
            strokeLinejoin="round"
            strokeWidth={OUTLINE_W}
          />
        )}
        {/* A linha-base vem depois do preenchimento: o contorno na cor do cartão a apagaria nas caudas. */}
        <line stroke="var(--line-subtle)" strokeWidth={1} x1={PLOT_X} x2={PLOT_X + PLOT_W} y1={base} y2={base} />
        {band.median !== null && band.density !== null ? (
          <line
            stroke="var(--surface-raised)"
            strokeWidth={MEDIAN_W}
            x1={px(band.median)}
            x2={px(band.median)}
            y1={base}
            y2={base - medianHeight}
          />
        ) : null}
      </g>
    );
  };

  const hovered = bands.findIndex((band) => band.item.id === hoverId);
  const hoveredBand = hovered === -1 ? undefined : bands[hovered];
  const tip = hoveredBand === undefined ? undefined : { band: hoveredBand, index: hovered };

  /** Dica da faixa: mês, n de campanhas e mediana, que a faixa sozinha não escreve. */
  const renderTip = (band: Band, index: number): ReactElement => {
    const x = PLOT_X + PLOT_W - TIP_W;
    const y = Math.max(0, baseOf(index) - PEAK_H - TIP_H / 2);
    return (
      <g pointerEvents="none">
        <rect fill="var(--surface-overlay)" height={TIP_H} rx={4} stroke="var(--line-subtle)" width={TIP_W} x={x} y={y} />
        <text fill="var(--text-primary)" fontSize={11} fontWeight={600} x={x + 8} y={y + 14}>
          {`${formatMonthShort(band.item.month)}, n ${formatInt(band.item.costs.length)} campanhas`}
        </text>
        <text className="font-display" fill="var(--text-secondary)" fontSize={11} x={x + 8} y={y + 28}>
          {band.median === null ? '' : `mediana ${formatCurrency(band.median)}`}
        </text>
      </g>
    );
  };

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

      <svg
        aria-hidden
        className="min-h-0 w-full flex-1"
        preserveAspectRatio="xMidYMin meet"
        viewBox={`0 0 ${String(VIEW_W)} ${String(viewH)}`}
      >
        {ticks.map((tick) => (
          <line key={tick} stroke="var(--line-subtle)" strokeWidth={1} x1={px(tick)} x2={px(tick)} y1={0} y2={axisY} />
        ))}
        {bands.map(renderRow)}
        {bands.map((band, index) => (
          <rect
            fill="transparent"
            height={ROW_STEP}
            key={band.item.id}
            onMouseEnter={() => {
              setHoverId(band.item.id);
            }}
            onMouseLeave={() => {
              setHoverId(null);
            }}
            width={PLOT_X + PLOT_W}
            x={0}
            y={baseOf(index) - ROW_STEP / 2}
          />
        ))}
        {tip === undefined ? null : renderTip(tip.band, tip.index)}
        <line stroke="var(--line-strong)" strokeWidth={1} x1={PLOT_X} x2={PLOT_X + PLOT_W} y1={axisY} y2={axisY} />
        {ticks.map((tick) => (
          <text
            className="font-display"
            fill="var(--text-muted)"
            fontSize={11}
            key={tick}
            textAnchor="middle"
            x={px(tick)}
            y={axisY + 16}
          >
            {formatCurrencyAxis(tick)}
          </text>
        ))}
      </svg>

      <p aria-hidden className="m-0 shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        {`Altura na mesma escala em todas as faixas, com piso de ${formatInt(HEIGHT_FLOOR * 100)}%` +
          (lifted.length === 0 ? '' : ` (${formatInt(lifted.length)} faixa elevada ao piso)`) +
          `. Banda comum de ${formatCurrency(bandwidth)}. Corte vazado: mediana.`}
      </p>
    </figure>
  );
}
