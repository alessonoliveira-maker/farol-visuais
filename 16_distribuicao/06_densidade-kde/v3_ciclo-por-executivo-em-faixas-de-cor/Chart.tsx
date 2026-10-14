import { Filter } from 'lucide-react';
import { useId, type ReactElement } from 'react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveCycles } from './data';

/**
 * Faixas de densidade: uma tira por executivo, com a cor da célula dizendo quão denso é o ciclo
 * naquele ponto da régua, e a mesma régua em todas as tiras. Cabem 12 distribuições onde caberiam
 * três curvas. A cor é a densidade dentro de cada tira, e não o volume: tira de 30 negócios e tira
 * de 58 acendem até o mesmo degrau.
 */
export interface CycleStripsProps {
  readonly data?: readonly ExecutiveCycles[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 574;
const NAME_X = 0;
const COUNT_X = 138;
const PLOT_X = 150;
const PLOT_W = 392;
const ROW_STEP = 29;
const STRIP_H = 20;
const AXIS_H = 24;
const GRID_SIZE = 120;
/** Passo do eixo de dias: a régua cresce de 60 em 60, e o teto é o primeiro múltiplo acima do maior ciclo. */
const TICK_STEP = 60;
/** Abaixo disto a tira não estima forma: hachura e rótulo no lugar da cor. */
const MIN_STRIP_SAMPLE = 15;
const MIN_SAMPLE = 2;
/** Degraus de densidade relativa ao pico da própria tira; abaixo do primeiro a célula fica vazia. */
const LEVEL_EDGES = [0.05, 0.35, 0.65] as const;
/** Os três degraus altos da rampa (seq-5 a seq-7): seq-4 e abaixo não se separam do cartão (TOK-8). */
const LEVEL_COLORS = CHART_SEQUENTIAL_COLORS.slice(4);
const HATCH_GAP = 6;
const SMALL_LABEL_W = 88;
const MEDIAN_W = 2;
const CELL_OVERLAP = 0.4;

interface Strip {
  readonly item: ExecutiveCycles;
  readonly median: number | null;
  readonly low: number;
  readonly high: number;
  readonly small: boolean;
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

/** Banda de Silverman sobre a amostra reunida: uma só para todas as tiras. */
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

/** Degrau de cor da densidade relativa, ou `null` quando a célula fica vazia. */
function levelOf(relative: number): number | null {
  const reached = LEVEL_EDGES.filter((edge) => relative >= edge).length;
  return reached === 0 ? null : reached - 1;
}

export default function CycleStrips({ data = defaultData, height, className }: CycleStripsProps) {
  const uid = useId();
  const style = height === undefined ? undefined : { height };
  const pooled = data.flatMap((item) => [...item.cycles]);
  const bandwidth = silverman(pooled);

  if (data.length === 0 || pooled.length === 0 || bandwidth === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo com negócio ganho neste recorte: sem amostra não há faixa para desenhar.</span>
      </div>
    );
  }

  const domainMax = Math.max(TICK_STEP, Math.ceil(Math.max(...pooled) / TICK_STEP) * TICK_STEP);
  const px = (days: number): number => PLOT_X + (days / domainMax) * PLOT_W;
  const ticks = Array.from({ length: domainMax / TICK_STEP + 1 }, (_, index) => index * TICK_STEP);

  const strips: Strip[] = data.map((item) => ({
    item,
    median: quantile([...item.cycles].sort((a, b) => a - b), 0.5),
    low: Math.min(...item.cycles),
    high: Math.max(...item.cycles),
    small: item.cycles.length < MIN_STRIP_SAMPLE,
  }));
  /** Quem tem amostra vai por mediana crescente, o mais rápido primeiro; as tiras pequenas fecham a lista. */
  const solid = strips.filter((strip) => !strip.small).sort((a, b) => (a.median ?? 0) - (b.median ?? 0));
  const small = strips.filter((strip) => strip.small);
  const ordered = [...solid, ...small];

  const fastest = solid[0];
  const slowest = solid[solid.length - 1];
  const totalDeals = pooled.length;
  const reading =
    fastest?.median != null && slowest?.median != null
      ? `Mediana de ${formatDays(fastest.median)} (${fastest.item.name}) a ${formatDays(slowest.median)} (${slowest.item.name}).`
      : 'Nenhuma tira tem amostra suficiente para estimar a mediana.';
  const summary =
    `Faixas de densidade do ciclo de fechamento de ${formatInt(data.length)} executivos, com ${formatInt(totalDeals)} negócios ganhos. ${reading}` +
    (small.length === 0 ? '' : ` ${formatInt(small.length)} com menos de ${formatInt(MIN_STRIP_SAMPLE)} negócios vão hachuradas.`);

  const viewH = ordered.length * ROW_STEP + AXIS_H;

  const renderRow = (strip: Strip, index: number): ReactElement => {
    const top = index * ROW_STEP;
    const mid = top + STRIP_H / 2;
    const { item } = strip;
    const cellW = PLOT_W / GRID_SIZE;
    const cells: ReactElement[] = [];
    if (!strip.small && item.cycles.length > 0) {
      const densities = Array.from({ length: GRID_SIZE }, (_, cell) => {
        const center = ((cell + 0.5) * domainMax) / GRID_SIZE;
        return { cell, center, value: center < strip.low || center > strip.high ? null : kernel(item.cycles, center, bandwidth) };
      });
      const peak = Math.max(0, ...densities.map((entry) => entry.value ?? 0));
      densities.forEach((entry) => {
        if (entry.value === null || peak <= 0) return;
        const level = levelOf(entry.value / peak);
        if (level === null) return;
        cells.push(
          <rect
            fill={LEVEL_COLORS[level]}
            height={STRIP_H}
            key={entry.cell}
            shapeRendering="crispEdges"
            width={cellW + CELL_OVERLAP}
            x={PLOT_X + entry.cell * cellW}
            y={top}
          />,
        );
      });
    }

    const hatchLeft = px(strip.low);
    const hatchRight = px(strip.high);
    const clipId = `${uid}-${item.id}`;
    const hatch: ReactElement[] = [];
    if (strip.small && item.cycles.length > 0) {
      for (let offset = -STRIP_H; offset < hatchRight - hatchLeft; offset += HATCH_GAP) {
        hatch.push(
          <line
            key={offset}
            stroke="var(--text-muted)"
            strokeWidth={1}
            x1={hatchLeft + offset}
            x2={hatchLeft + offset + STRIP_H}
            y1={top + STRIP_H}
            y2={top}
          />,
        );
      }
    }
    const labelFits = hatchRight + 6 + SMALL_LABEL_W <= VIEW_W;

    return (
      <g key={item.id}>
        <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} x={NAME_X} y={mid}>
          {item.name}
        </text>
        <text
          className="font-display"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={11}
          textAnchor="end"
          x={COUNT_X}
          y={mid}
        >
          {`n ${formatInt(item.cycles.length)}`}
        </text>
        <line stroke="var(--line-subtle)" strokeWidth={1} x1={PLOT_X} x2={PLOT_X + PLOT_W} y1={top + STRIP_H} y2={top + STRIP_H} />
        {cells}
        {strip.small && item.cycles.length > 0 ? (
          <>
            <clipPath id={clipId}>
              <rect height={STRIP_H} width={hatchRight - hatchLeft} x={hatchLeft} y={top} />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>{hatch}</g>
            <text
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              textAnchor={labelFits ? 'start' : 'end'}
              x={labelFits ? hatchRight + 6 : hatchLeft - 6}
              y={mid}
            >
              amostra pequena
            </text>
          </>
        ) : null}
        {item.cycles.length === 0 ? (
          <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={PLOT_X + 4} y={mid}>
            sem negócio ganho no recorte
          </text>
        ) : null}
        {!strip.small && strip.median !== null ? (
          <line
            stroke="var(--surface-raised)"
            strokeWidth={MEDIAN_W}
            x1={px(strip.median)}
            x2={px(strip.median)}
            y1={top}
            y2={top + STRIP_H}
          />
        ) : null}
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

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="inline-flex items-center gap-1">
          menos denso
          {LEVEL_COLORS.map((color) => (
            <span className="inline-block h-2 w-3" key={color} style={{ background: color }} />
          ))}
          mais denso
        </span>
        <span>cor é densidade dentro da tira, não volume</span>
        <span>corte vazado: mediana</span>
        <span className="tabular-nums">{`banda comum ${formatDays(Math.round(bandwidth))}`}</span>
      </div>

      <svg
        aria-hidden
        className="min-h-0 w-full flex-1"
        preserveAspectRatio="xMidYMin meet"
        viewBox={`0 0 ${String(VIEW_W)} ${String(viewH)}`}
      >
        {ordered.map(renderRow)}
        <line
          stroke="var(--line-strong)"
          strokeWidth={1}
          x1={PLOT_X}
          x2={PLOT_X + PLOT_W}
          y1={ordered.length * ROW_STEP}
          y2={ordered.length * ROW_STEP}
        />
        {ticks.map((tick) => (
          <text
            className="font-display"
            fill="var(--text-muted)"
            fontSize={11}
            key={tick}
            textAnchor="middle"
            x={px(tick)}
            y={ordered.length * ROW_STEP + 16}
          >
            {formatDays(tick)}
          </text>
        ))}
      </svg>
    </figure>
  );
}
