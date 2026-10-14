import { Filter } from 'lucide-react';

import { formatDays, formatDecimal, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, WITHOUT_OPEN_DATE, type Segment } from './data';

/**
 * Violino: a densidade de cada grupo espelhada em torno de um eixo, larga onde há muitos casos e fina
 * onde há poucos. Ganha do box plot exatamente onde ele mente: aqui o terceiro segmento tem dois
 * picos, e a caixa de quartis dele seria um retângulo largo com a mediana perto de um deles.
 *
 * Três decisões sustentam a comparação entre as formas. A banda de suavização é uma só para os três
 * grupos, porque banda por grupo alisa mais justamente o grupo mais espalhado e esconde o segundo
 * pico. A largura é por área, contra a densidade máxima do conjunto, então toda forma tem a mesma
 * área e a mais estreita é a mais alta. E a forma é cortada no menor e no maior valor observados: a
 * cauda que a suavização inventaria além deles não é dado.
 *
 * A geometria é SVG puro, desenhado no tamanho do corpo do cartão para a escala sair 1 (GEO-18).
 */
export interface CycleViolinProps {
  readonly data?: readonly Segment[];
  readonly withoutOpenDate?: number;
  readonly height?: number;
  readonly className?: string;
}

interface CurvePoint {
  readonly value: number;
  readonly density: number;
}

interface Shape {
  readonly n: number;
  readonly min: number;
  readonly max: number;
  readonly q1: number;
  readonly median: number;
  readonly q3: number;
  readonly curve: readonly CurvePoint[];
  /** Maior densidade da própria forma. */
  readonly peak: number;
  /** Densidade no valor da mediana, que limita a espessura do marcador. */
  readonly atMedian: number;
  /** Cada pico da forma, do menor valor para o maior, com a densidade que posiciona a anotação. */
  readonly modes: readonly CurvePoint[];
}

interface Row {
  readonly segment: Segment;
  /** `null` quando o segmento não tem negócio no recorte: sem forma, sem mediana, nunca zero. */
  readonly shape: Shape | null;
}

/** Largura e altura do desenho: o corpo do cartão de 640 px, para o `<svg>` sair em escala 1. */
const VIEW_W = 574;
const TOP = 8;
const ROW_H = 64;
const AXIS_H = 22;
const LABEL_W = 150;
const PLOT_X0 = LABEL_W;
const PLOT_X1 = VIEW_W - 26;
/** Meia largura da forma no ponto de maior densidade do conjunto. */
const HALF_MAX = 26;
const AXIS_STEP = 30;
/** Pontos da grade em que a densidade é avaliada, do mínimo ao máximo observados. */
const CURVE_STEPS = 80;
/** Pico conta como pico a partir desta fração da maior densidade da própria forma. */
const MODE_MIN_SHARE = 0.4;
/** O marcador ocupa no máximo esta fração da largura do violino na mediana. */
const MARKER_SHARE = 0.6;
const MARKER_MAX = 6;
const MARKER_MIN = 2;
const MEDIAN_R = 4;
/** Anel na cor da superfície: é ele que separa o marcador do preenchimento do violino (TOK-10). */
const RING_W = 1.5;
const VIOLIN_FILL = 'var(--chart-1)';
const MARKER_FILL = 'var(--text-primary)';
const RING_STROKE = 'var(--surface-raised)';
const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);

/** Quartil por interpolação linear. `null` para lista vazia. */
function quantile(sorted: readonly number[], p: number): number | null {
  const position = (sorted.length - 1) * p;
  const base = Math.floor(position);
  const low = sorted[base];
  if (low === undefined) return null;
  const high = sorted[base + 1] ?? low;
  return low + (position - base) * (high - low);
}

/** Banda de Silverman de um grupo. `null` com menos de dois casos ou sem dispersão nenhuma. */
function silverman(sorted: readonly number[]): number | null {
  const n = sorted.length;
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  if (n < 2 || q1 === null || q3 === null) return null;
  const mean = sorted.reduce((sum, value) => sum + value, 0) / n;
  const deviation = Math.sqrt(sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1));
  const iqr = q3 - q1;
  const spread = iqr > 0 ? Math.min(deviation, iqr / 1.34) : deviation;
  if (spread <= 0) return null;
  return 0.9 * spread * n ** -0.2;
}

/** Densidade por núcleo gaussiano no valor pedido. `null` para lista vazia. */
function densityAt(values: readonly number[], band: number, x: number): number | null {
  if (values.length === 0) return null;
  let total = 0;
  for (const value of values) {
    const z = (x - value) / band;
    total += Math.exp(-0.5 * z * z);
  }
  return total / (values.length * band * SQRT_TWO_PI);
}

/** A forma de um grupo: resumo, curva cortada nos extremos observados e picos. */
function buildShape(values: readonly number[], band: number): Shape | null {
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  if (min === undefined || max === undefined || q1 === null || median === null || q3 === null) return null;
  const atMedian = densityAt(sorted, band, median);
  if (atMedian === null) return null;
  const curve: CurvePoint[] = [];
  for (let step = 0; step <= CURVE_STEPS; step += 1) {
    const value = min + ((max - min) * step) / CURVE_STEPS;
    const density = densityAt(sorted, band, value);
    if (density !== null) curve.push({ value, density });
  }
  const peak = Math.max(...curve.map((point) => point.density));
  const modes = curve.filter((point, index) => {
    const before = curve[index - 1];
    const after = curve[index + 1];
    if (before === undefined || after === undefined) return false;
    return point.density > before.density && point.density >= after.density && point.density >= MODE_MIN_SHARE * peak;
  });
  return { n: sorted.length, min, max, q1, median, q3, curve, peak, atMedian, modes };
}

/** Caminho fechado do violino deitado: a borda de cima da esquerda para a direita, e a de baixo de volta. */
function violinPath(curve: readonly CurvePoint[], toX: (value: number) => number, toHalf: (density: number) => number, cy: number): string {
  const pair = (x: number, y: number): string => `${String(Math.round(x * 100) / 100)},${String(Math.round(y * 100) / 100)}`;
  const upper = curve.map((point) => pair(toX(point.value), cy - toHalf(point.density)));
  const lower = [...curve].reverse().map((point) => pair(toX(point.value), cy + toHalf(point.density)));
  return `M${upper.join('L')}L${lower.join('L')}Z`;
}

export default function CycleViolin({
  data = defaultData,
  withoutOpenDate = WITHOUT_OPEN_DATE,
  height,
  className,
}: CycleViolinProps) {
  const style = height === undefined ? undefined : { height };

  /** Banda única para todos os grupos: a mediana das bandas de Silverman de cada um. */
  const bands = data
    .map((segment) => silverman([...segment.cycles].sort((a, b) => a - b)))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);
  const band = quantile(bands, 0.5);

  /** Ordem pela mediana, do ciclo mais curto no topo ao mais longo; segmento sem negócio por último. */
  const rows: readonly Row[] = data
    .map((segment) => ({ segment, shape: band === null ? null : buildShape(segment.cycles, band) }))
    .sort((a, b) => {
      if (a.shape === null || b.shape === null) return (a.shape === null ? 1 : 0) - (b.shape === null ? 1 : 0);
      return a.shape.median - b.shape.median;
    });
  const measured = rows.filter((row): row is Row & { shape: Shape } => row.shape !== null);
  const first = measured[0];
  const last = measured[measured.length - 1];

  if (band === null || first === undefined || last === undefined) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum negócio ganho neste recorte: não há ciclo para desenhar a forma.</span>
      </div>
    );
  }

  /** Largura por área: uma escala só, contra a maior densidade do conjunto. */
  const peak = Math.max(...measured.map((row) => row.shape.peak));
  const ceiling = Math.ceil(Math.max(AXIS_STEP, ...measured.map((row) => row.shape.max)) / AXIS_STEP) * AXIS_STEP;
  const ticks = Array.from({ length: ceiling / AXIS_STEP + 1 }, (_, index) => index * AXIS_STEP);
  const toX = (value: number): number => PLOT_X0 + (value / ceiling) * (PLOT_X1 - PLOT_X0);
  const toHalf = (density: number): number => (density / peak) * HALF_MAX;
  const axisY = TOP + rows.length * ROW_H;
  const viewH = axisY + AXIS_H;
  const total = measured.reduce((sum, row) => sum + row.shape.n, 0);

  /** O primeiro segmento com mais de um pico é o achado da peça, e o único que recebe anotação. */
  const split = measured.find((row) => row.shape.modes.length > 1);
  const othersSingle = measured.every((row) => row === split || row.shape.modes.length === 1);
  const splitText =
    split === undefined
      ? 'Nenhum segmento tem mais de um pico'
      : `${split.segment.name} tem ${formatInt(split.shape.modes.length)} picos, perto de ${split.shape.modes
          .map((mode) => formatDays(Math.round(mode.value)))
          .join(' e de ')}`;
  const reading =
    split === undefined
      ? `${splitText}: cada forma tem um ritmo de fechamento só.`
      : `${splitText}${othersSingle ? '; os demais segmentos têm um só' : ''}.`;

  const summary =
    `Violinos do ciclo de venda de ${formatInt(total)} negócios em ${formatInt(measured.length)} segmentos. ` +
    `A mediana vai de ${formatDays(Math.round(first.shape.median))} em ${first.segment.name.toLowerCase()} ` +
    `a ${formatDays(Math.round(last.shape.median))} em ${last.segment.name.toLowerCase()}. ${splitText}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      <p aria-hidden className="shrink-0 text-xs leading-4 font-medium text-text-secondary tabular-nums">
        {reading}
      </p>
      {/* `viewBox` do tamanho do corpo e altura pela proporção: o desenho sai em escala 1 e o texto
          de 11 px chega à tela com 11 px (GEO-18). */}
      <svg
        aria-hidden
        className="block h-auto w-full shrink-0"
        style={{ aspectRatio: `${String(VIEW_W)} / ${String(viewH)}` }}
        viewBox={`0 0 ${String(VIEW_W)} ${String(viewH)}`}
      >
        {ticks.map((tick) => (
          <g key={`tick-${String(tick)}`}>
            <line stroke="var(--line-subtle)" strokeWidth={1} x1={toX(tick)} x2={toX(tick)} y1={TOP} y2={axisY} />
            <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={toX(tick)} y={axisY + 15}>
              {formatDays(tick)}
            </text>
          </g>
        ))}
        {rows.map((row, index) => {
          const cy = TOP + index * ROW_H + ROW_H / 2;
          const { shape } = row;
          const label = (
            <text fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={cy - 3}>
              {row.segment.name}
            </text>
          );
          if (shape === null) {
            return (
              <g key={row.segment.id}>
                {label}
                <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={cy + 12}>
                  {`n ${formatInt(row.segment.cycles.length)}`}
                </text>
                <text fill="var(--text-muted)" fontSize={11} x={PLOT_X0 + 8} y={cy + 4}>
                  {`${formatUnavailable()}: nenhum negócio no recorte`}
                </text>
              </g>
            );
          }
          /* Marcador limitado a 0,6 vez a largura do violino na mediana: em forma fina ele afina
             junto, em vez de vazar para fora dela. */
          const thickness = Math.max(MARKER_MIN, Math.min(MARKER_MAX, MARKER_SHARE * 2 * toHalf(shape.atMedian)));
          return (
            <g key={row.segment.id}>
              {label}
              <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={cy + 12}>
                {`n ${formatInt(shape.n)} · mediana ${formatDays(Math.round(shape.median))}`}
              </text>
              <path d={violinPath(shape.curve, toX, toHalf, cy)} fill={VIOLIN_FILL} />
              {/* `paintOrder` põe o anel por baixo do preenchimento: sem ele o traço come metade da
                  espessura do marcador. O anel é o segundo fundo que a TOK-10 pede. */}
              <rect
                fill={MARKER_FILL}
                height={thickness}
                paintOrder="stroke"
                stroke={RING_STROKE}
                strokeWidth={RING_W * 2}
                width={Math.max(toX(shape.q3) - toX(shape.q1), MARKER_MIN)}
                x={toX(shape.q1)}
                y={cy - thickness / 2}
              />
              <circle
                cx={toX(shape.median)}
                cy={cy}
                fill={MARKER_FILL}
                paintOrder="stroke"
                r={Math.min(MEDIAN_R, thickness / 2 + 1)}
                stroke={RING_STROKE}
                strokeWidth={RING_W * 2}
              />
              {row !== split
                ? null
                : shape.modes.slice(0, 2).map((mode) => (
                    <text
                      className="tabular-nums"
                      fill="var(--text-muted)"
                      fontSize={11}
                      key={`mode-${String(mode.value)}`}
                      paintOrder="stroke"
                      stroke="var(--surface-raised)"
                      strokeWidth={3}
                      textAnchor="middle"
                      x={toX(mode.value)}
                      y={cy - toHalf(mode.density) - 6}
                    >
                      {`pico em ${formatDays(Math.round(mode.value))}`}
                    </text>
                  ))}
            </g>
          );
        })}
      </svg>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`dias de ciclo, n ${formatInt(total)} negócios ganhos`}</span>
        <span className="flex items-center gap-1">
          <span className="h-1 w-3" style={{ backgroundColor: MARKER_FILL }} />
          <span>barra: metade central</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full" style={{ backgroundColor: MARKER_FILL }} />
          <span>ponto: mediana</span>
        </span>
        {/* A ordem vai escrita: sem esta linha os nomes leem como lista arbitrária (GEO-12). */}
        <span>ordem de mediana crescente, de cima para baixo</span>
        <span>largura por área, na mesma escala</span>
        <span className="tabular-nums">{`banda de Silverman única de ${formatDecimal(band, 1)} dias`}</span>
        <span>forma cortada no mínimo e no máximo observados</span>
        {withoutOpenDate <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(withoutOpenDate)} negócios sem data de abertura ficaram fora`}</span>
        )}
      </div>
    </figure>
  );
}
