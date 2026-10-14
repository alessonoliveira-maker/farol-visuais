import { Filter } from 'lucide-react';

import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Scenario } from './data';

/**
 * Meia-olho: a faixa de um cenário simulado em três camadas na mesma linha. Em cima, a meia
 * densidade dos desfechos, alta onde o simulador caiu mais vezes; na base, o traço grosso com os
 * 66% centrais, o traço fino com os 95% e o ponto na mediana. A forma diz onde a massa está, e os
 * traços dão os números que se citam em reunião.
 *
 * Três decisões sustentam a comparação entre os cenários. A banda de suavização é uma só, porque
 * banda por cenário alisa mais justamente o mais espalhado. A altura é por densidade na mesma
 * escala, então toda forma tem a mesma área e a mais estreita é a mais alta. E a forma é cortada no
 * menor e no maior desfecho simulados: a cauda que a suavização inventaria além deles não saiu do
 * simulador, e esmaecer a forma além do domínio sugeriria desfecho que ninguém simulou.
 *
 * A geometria é SVG puro, desenhado no tamanho do corpo do cartão para a escala sair 1 (GEO-18).
 */
export interface ScenarioHalfEyeProps {
  readonly data?: readonly Scenario[];
  readonly height?: number;
  readonly className?: string;
}

interface CurvePoint {
  readonly value: number;
  readonly density: number;
}

interface Eye {
  readonly n: number;
  readonly min: number;
  readonly max: number;
  readonly median: number;
  readonly innerLow: number;
  readonly innerHigh: number;
  readonly outerLow: number;
  readonly outerHigh: number;
  readonly curve: readonly CurvePoint[];
  /** Maior densidade da própria forma. */
  readonly peak: number;
}

interface Row {
  readonly scenario: Scenario;
  /** `null` quando o cenário não tem desfecho simulado: sem forma, sem mediana, nunca zero. */
  readonly eye: Eye | null;
}

type MeasuredRow = Row & { readonly eye: Eye };

/** Largura do desenho: o corpo do cartão de 640 px, para o `<svg>` sair em escala 1. */
const VIEW_W = 574;
const TOP = 6;
const ROW_H = 62;
const AXIS_H = 22;
/** Linha de base do nome dentro da linha do cenário, e o passo das duas linhas de número abaixo. */
const NAME_Y = 18;
const LINE_STEP = 15;
/** Da linha dos traços até a base do rótulo escrito embaixo dela, e o vão do rótulo ao lado. */
const LABEL_DROP = 16;
const LABEL_GAP = 8;
const LABEL_W = 196;
const PLOT_X0 = LABEL_W;
const PLOT_X1 = VIEW_W - 28;
/** Altura da forma no ponto de maior densidade do conjunto. */
const SLAB_H = 34;
/** Do topo da linha até a base da forma. */
const SLAB_BASE = 38;
/** Da base da forma até o centro dos traços de intervalo, que ficam fora do preenchimento. */
const INTERVAL_DROP = 8;
const INNER_W = 5;
const OUTER_W = 1.5;
const MEDIAN_R = 4.5;
/** Anel na cor da superfície: separa o ponto do traço grosso em que ele pousa. */
const RING_W = 1.5;
/** Massa central de cada intervalo: é dela que saem os percentis e o texto de tela. */
const INNER_MASS = 0.66;
const OUTER_MASS = 0.95;
/** Pontos da grade em que a densidade é avaliada, do menor ao maior desfecho. */
const CURVE_STEPS = 64;
/** Folga do domínio além dos extremos, como fração da amplitude. */
const DOMAIN_PAD = 0.03;
const MAX_TICKS = 6;
const TICK_BASES = [1, 2, 2.5, 5] as const;
const SLAB_FILL = 'var(--chart-1)';
const INTERVAL_STROKE = 'var(--text-primary)';
const SURFACE = 'var(--surface-raised)';
const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);

/** Maior valor de uma lista. `null` para lista vazia, nunca `-Infinity`. */
function largest(values: readonly number[]): number | null {
  let best: number | null = null;
  for (const value of values) if (best === null || value > best) best = value;
  return best;
}

/** Menor valor de uma lista. `null` para lista vazia, nunca `Infinity`. */
function smallest(values: readonly number[]): number | null {
  let best: number | null = null;
  for (const value of values) if (best === null || value < best) best = value;
  return best;
}

/** Percentil por interpolação linear. `null` para lista vazia. */
function quantile(sorted: readonly number[], p: number): number | null {
  const position = (sorted.length - 1) * p;
  const base = Math.floor(position);
  const low = sorted[base];
  if (low === undefined) return null;
  const high = sorted[base + 1] ?? low;
  return low + (position - base) * (high - low);
}

/** Banda de Silverman de um cenário. `null` com menos de dois desfechos ou sem dispersão. */
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

/** O olho de um cenário: mediana, os dois intervalos centrais e a curva cortada nos extremos. */
function buildEye(outcomes: readonly number[], band: number): Eye | null {
  const sorted = [...outcomes].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = quantile(sorted, 0.5);
  const innerLow = quantile(sorted, (1 - INNER_MASS) / 2);
  const innerHigh = quantile(sorted, (1 + INNER_MASS) / 2);
  const outerLow = quantile(sorted, (1 - OUTER_MASS) / 2);
  const outerHigh = quantile(sorted, (1 + OUTER_MASS) / 2);
  if (min === undefined || max === undefined || median === null) return null;
  if (innerLow === null || innerHigh === null || outerLow === null || outerHigh === null) return null;
  const curve: CurvePoint[] = [];
  for (let step = 0; step <= CURVE_STEPS; step += 1) {
    const value = min + ((max - min) * step) / CURVE_STEPS;
    const density = densityAt(sorted, band, value);
    if (density !== null) curve.push({ value, density });
  }
  const peak = largest(curve.map((point) => point.density));
  if (peak === null) return null;
  return { n: sorted.length, min, max, median, innerLow, innerHigh, outerLow, outerHigh, curve, peak };
}

/** Passo redondo do eixo: o menor entre 1, 2, 2,5 e 5 vezes uma potência de dez que cabe no teto de tiques. */
function tickStep(span: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(span / MAX_TICKS));
  for (const scale of [1, 10]) {
    for (const base of TICK_BASES) {
      const step = base * magnitude * scale;
      if (span / step <= MAX_TICKS) return step;
    }
  }
  return magnitude * 100;
}

/** Caminho fechado da meia densidade: sobe do menor desfecho, segue a curva e desce no maior. */
function slabPath(curve: readonly CurvePoint[], toX: (value: number) => number, toH: (density: number) => number, base: number): string {
  const pair = (x: number, y: number): string => `${String(Math.round(x * 100) / 100)},${String(Math.round(y * 100) / 100)}`;
  const first = curve[0];
  const last = curve[curve.length - 1];
  if (first === undefined || last === undefined) return '';
  const top = curve.map((point) => pair(toX(point.value), base - toH(point.density)));
  return `M${pair(toX(first.value), base)}L${top.join('L')}L${pair(toX(last.value), base)}Z`;
}

export default function ScenarioHalfEye({ data = defaultData, height, className }: ScenarioHalfEyeProps) {
  const style = height === undefined ? undefined : { height };

  /** Banda única para todos os cenários: a mediana das bandas de Silverman de cada um. */
  const bands = data
    .map((scenario) => silverman([...scenario.outcomes].sort((a, b) => a - b)))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);
  const band = quantile(bands, 0.5);

  /** A ordem é a do dado, do cenário mais contido ao mais ousado: é escala ordinal, não ranking. */
  const rows: readonly Row[] = data.map((scenario) => ({
    scenario,
    eye: band === null ? null : buildEye(scenario.outcomes, band),
  }));
  const measured = rows.filter((row): row is MeasuredRow => row.eye !== null);
  const byMedian = [...measured].sort((a, b) => a.eye.median - b.eye.median);
  const lowest = byMedian[0];
  const highest = byMedian[byMedian.length - 1];
  const widest = measured.reduce<MeasuredRow | null>(
    (best, row) => (best === null || row.eye.outerHigh - row.eye.outerLow > best.eye.outerHigh - best.eye.outerLow ? row : best),
    null,
  );

  /** Um domínio só para todos os cenários e uma escala só de altura, medidos antes do estado vazio. */
  const dataMin = smallest(measured.map((row) => row.eye.min));
  const dataMax = largest(measured.map((row) => row.eye.max));
  const peak = largest(measured.map((row) => row.eye.peak));

  if (band === null || lowest === undefined || highest === undefined || widest === null || dataMin === null || dataMax === null || peak === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum desfecho simulado neste recorte: não há faixa de cenário para desenhar.</span>
      </div>
    );
  }

  /** A folga do domínio além dos extremos evita que a forma encoste na coluna de nomes. */
  const pad = Math.max(dataMax - dataMin, 1) * DOMAIN_PAD;
  const domainLow = dataMin - pad;
  const domainHigh = dataMax + pad;
  const step = tickStep(domainHigh - domainLow);
  const ticks: number[] = [];
  for (let tick = Math.ceil(domainLow / step) * step; tick <= domainHigh; tick += step) ticks.push(tick);
  const toX = (value: number): number => PLOT_X0 + ((value - domainLow) / (domainHigh - domainLow)) * (PLOT_X1 - PLOT_X0);
  const toH = (density: number): number => (density / peak) * SLAB_H;
  const axisY = TOP + rows.length * ROW_H;
  const viewH = axisY + AXIS_H;
  const total = measured.reduce((sum, row) => sum + row.eye.n, 0);
  const innerText = formatPercent(INNER_MASS, 0);
  const outerText = formatPercent(OUTER_MASS, 0);
  /** Só a primeira linha medida nomeia os traços: repetir o nome em toda linha é ruído. */
  const labelled = measured[0];

  const reading =
    `Faixa de ${outerText} mais larga ${widest.scenario.phrase}: ` +
    `${formatCurrencyCompact(widest.eye.outerLow)} a ${formatCurrencyCompact(widest.eye.outerHigh)}.`;
  const summary =
    `Meia-olho da receita de 2027 em ${formatInt(measured.length)} cenários simulados, com mediana e intervalos de ${innerText} e ${outerText}. ` +
    `A mediana vai de ${formatCurrencyCompact(lowest.eye.median)} a ${formatCurrencyCompact(highest.eye.median)}. ${reading}`;

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
              {formatCurrencyAxis(tick)}
            </text>
          </g>
        ))}
        {rows.map((row, index) => {
          const rowTop = TOP + index * ROW_H;
          const base = rowTop + SLAB_BASE;
          const lineY = base + INTERVAL_DROP;
          const { eye } = row;
          const name = (
            <text fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={rowTop + NAME_Y}>
              {row.scenario.name}
            </text>
          );
          if (eye === null) {
            return (
              <g key={row.scenario.id}>
                {name}
                <text fill="var(--text-muted)" fontSize={11} x={0} y={rowTop + NAME_Y + LINE_STEP}>
                  {`${formatUnavailable()}: cenário sem desfecho simulado`}
                </text>
              </g>
            );
          }
          return (
            <g key={row.scenario.id}>
              {name}
              <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={rowTop + NAME_Y + LINE_STEP}>
                {`mediana ${formatCurrencyCompact(eye.median)}`}
              </text>
              <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={rowTop + NAME_Y + LINE_STEP * 2}>
                {`${innerText} de ${formatCurrencyCompact(eye.innerLow)} a ${formatCurrencyCompact(eye.innerHigh)}`}
              </text>
              <path d={slabPath(eye.curve, toX, toH, base)} fill={SLAB_FILL} />
              <line stroke={INTERVAL_STROKE} strokeWidth={OUTER_W} x1={toX(eye.outerLow)} x2={toX(eye.outerHigh)} y1={lineY} y2={lineY} />
              <line stroke={INTERVAL_STROKE} strokeWidth={INNER_W} x1={toX(eye.innerLow)} x2={toX(eye.innerHigh)} y1={lineY} y2={lineY} />
              {/* `paintOrder` põe o anel por baixo do preenchimento: sem ele o traço da superfície
                  come metade do raio do ponto. */}
              <circle cx={toX(eye.median)} cy={lineY} fill={INTERVAL_STROKE} paintOrder="stroke" r={MEDIAN_R} stroke={SURFACE} strokeWidth={RING_W * 2} />
              {row !== labelled ? null : (
                <>
                  <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={(toX(eye.innerLow) + toX(eye.innerHigh)) / 2} y={lineY + LABEL_DROP}>
                    {innerText}
                  </text>
                  {/* Halo na cor do cartão: o rótulo fica na altura do traço e cruza as linhas de grade (ROT-7). */}
                  <text
                    className="tabular-nums"
                    dominantBaseline="central"
                    fill="var(--text-muted)"
                    fontSize={11}
                    paintOrder="stroke"
                    stroke={SURFACE}
                    strokeWidth={4}
                    x={toX(eye.outerHigh) + LABEL_GAP}
                    y={lineY}
                  >
                    {`${outerText} dos desfechos`}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`receita de 2027, n ${formatInt(total)} desfechos simulados`}</span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full" style={{ backgroundColor: INTERVAL_STROKE }} />
          <span>ponto: mediana</span>
        </span>
        <span>altura pela densidade, na mesma escala</span>
        <span>forma cortada no menor e no maior desfecho simulados</span>
        <span>faixa de cenários, não previsão pontual</span>
      </div>
    </figure>
  );
}
