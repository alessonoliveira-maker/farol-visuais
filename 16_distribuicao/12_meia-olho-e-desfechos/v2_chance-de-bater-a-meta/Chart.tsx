import { Filter } from 'lucide-react';

import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, DOMAIN, META, type Scenario } from './data';

/**
 * Meia-olho contra uma meta: a meia densidade de cada cenário é partida na meta, e a parte que
 * passa dela sai preenchida enquanto a que fica aquém sai só em contorno. A área preenchida é a
 * chance de bater a meta, e o texto da linha escreve a mesma chance com o volume, porque num
 * cenário em que passam cinco desfechos de quatrocentos a área é um fio que ninguém mede no olho.
 *
 * A diferença entre os dois lados é de forma, e não só de cor: preenchido contra vazado. A meta é
 * uma linha só, atravessando todas as linhas, e só faz sentido porque o domínio é o mesmo para todos
 * os cenários: ele entra por prop, calculado por quem monta a página. Entre o contorno e o
 * preenchimento fica um vão na cor do cartão, que é onde a linha da meta passa sem cruzar marca.
 *
 * A geometria é SVG puro, desenhado no tamanho do corpo do cartão para a escala sair 1 (GEO-18).
 */
export interface MetaChanceHalfEyeProps {
  readonly data?: readonly Scenario[];
  /** Meta de receita, em reais. */
  readonly meta?: number;
  /** Domínio do eixo, em reais, o mesmo para todos os cenários. Desfecho fora dele é desenhado na borda. */
  readonly domain?: readonly [number, number];
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
  /** Desfechos que passam da meta, contados no dado cru e não na área suavizada. */
  readonly above: number;
}

interface Row {
  readonly scenario: Scenario;
  /** `null` quando o cenário não tem desfecho simulado: sem forma, sem mediana, nunca zero. */
  readonly eye: Eye | null;
}

type MeasuredRow = Row & { readonly eye: Eye };

/** Largura do desenho: o corpo do cartão de 640 px, para o `<svg>` sair em escala 1. */
const VIEW_W = 574;
/** Margem de cima reservada para o nome da meta, fora das marcas (ANO-3). */
const TOP = 20;
const ROW_H = 58;
const AXIS_H = 22;
/** Linha de base do nome dentro da linha do cenário, e o passo das duas linhas de número abaixo. */
const NAME_Y = 18;
const LINE_STEP = 15;
const LABEL_W = 196;
/** Meio vão, em pixels, entre o contorno e o preenchimento: é por ele que a linha da meta passa (TOK-10). */
const SPLIT_GAP = 2.5;
const OUTLINE_W = 1.5;
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
const MAX_TICKS = 6;
const TICK_BASES = [1, 2, 2.5, 5] as const;
const SLAB_FILL = 'var(--chart-1)';
/** Contorno do lado que fica aquém da meta: 5,21:1 no escuro e 5,37:1 no claro contra o cartão. */
const OUTLINE_STROKE = 'var(--text-muted)';
const META_STROKE = 'var(--text-muted)';
const INTERVAL_STROKE = 'var(--text-primary)';
const SURFACE = 'var(--surface-raised)';
const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);

/** Maior valor de uma lista. `null` para lista vazia, nunca `-Infinity`. */
function largest(values: readonly number[]): number | null {
  let best: number | null = null;
  for (const value of values) if (best === null || value > best) best = value;
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

/** O olho de um cenário: mediana, os dois intervalos centrais, a curva cortada nos extremos e a contagem acima da meta. */
function buildEye(outcomes: readonly number[], band: number, meta: number): Eye | null {
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
  const above = sorted.filter((value) => value > meta).length;
  return { n: sorted.length, min, max, median, innerLow, innerHigh, outerLow, outerHigh, curve, peak, above };
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

/** Densidade da curva num valor qualquer, por interpolação linear entre os pontos da grade. `null` fora dela. */
function curveAt(curve: readonly CurvePoint[], value: number): number | null {
  for (let index = 1; index < curve.length; index += 1) {
    const before = curve[index - 1];
    const after = curve[index];
    if (before === undefined || after === undefined) continue;
    if (value < before.value || value > after.value) continue;
    const span = after.value - before.value;
    if (span <= 0) return before.density;
    return before.density + ((value - before.value) / span) * (after.density - before.density);
  }
  return null;
}

/** O trecho da curva entre dois valores, com as duas pontas interpoladas. Vazio quando o trecho não existe. */
function cutCurve(curve: readonly CurvePoint[], from: number, to: number): readonly CurvePoint[] {
  const first = curve[0];
  const last = curve[curve.length - 1];
  if (first === undefined || last === undefined) return [];
  const low = Math.max(from, first.value);
  const high = Math.min(to, last.value);
  if (low >= high) return [];
  const lowDensity = curveAt(curve, low);
  const highDensity = curveAt(curve, high);
  if (lowDensity === null || highDensity === null) return [];
  return [
    { value: low, density: lowDensity },
    ...curve.filter((point) => point.value > low && point.value < high),
    { value: high, density: highDensity },
  ];
}

/** Caminho fechado de um trecho da meia densidade: sobe na primeira ponta, segue a curva e desce na última. */
function slabPath(curve: readonly CurvePoint[], toX: (value: number) => number, toH: (density: number) => number, base: number): string {
  const pair = (x: number, y: number): string => `${String(Math.round(x * 100) / 100)},${String(Math.round(y * 100) / 100)}`;
  const first = curve[0];
  const last = curve[curve.length - 1];
  if (first === undefined || last === undefined) return '';
  const top = curve.map((point) => pair(toX(point.value), base - toH(point.density)));
  return `M${pair(toX(first.value), base)}L${top.join('L')}L${pair(toX(last.value), base)}Z`;
}

export default function MetaChanceHalfEye({
  data = defaultData,
  meta = META,
  domain = DOMAIN,
  height,
  className,
}: MetaChanceHalfEyeProps) {
  const style = height === undefined ? undefined : { height };
  const [domainLow, domainHigh] = domain;

  /** Banda única para todos os cenários: a mediana das bandas de Silverman de cada um. */
  const bands = data
    .map((scenario) => silverman([...scenario.outcomes].sort((a, b) => a - b)))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);
  const band = quantile(bands, 0.5);

  /** A ordem é a do dado, do cenário mais contido ao mais ousado: é escala ordinal, não ranking. */
  const rows: readonly Row[] = data.map((scenario) => ({
    scenario,
    eye: band === null ? null : buildEye(scenario.outcomes, band, meta),
  }));
  const measured = rows.filter((row): row is MeasuredRow => row.eye !== null);
  const byRate = [...measured].sort((a, b) => a.eye.above / a.eye.n - b.eye.above / b.eye.n);
  const lowest = byRate[0];
  const highest = byRate[byRate.length - 1];

  /** Uma escala só de altura para todos os cenários, medida antes do estado vazio. */
  const peak = largest(measured.map((row) => row.eye.peak));

  if (band === null || lowest === undefined || highest === undefined || peak === null || domainHigh <= domainLow) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum desfecho simulado neste recorte: não há cenário para medir contra a meta.</span>
      </div>
    );
  }

  const step = tickStep(domainHigh - domainLow);
  const ticks: number[] = [];
  for (let tick = Math.ceil(domainLow / step) * step; tick <= domainHigh; tick += step) ticks.push(tick);
  /** Valor fora do domínio que o pai mandou é desenhado na borda, nunca em cima da coluna de nomes. */
  const toX = (value: number): number =>
    PLOT_X0 + Math.min(1, Math.max(0, (value - domainLow) / (domainHigh - domainLow))) * (PLOT_X1 - PLOT_X0);
  const toH = (density: number): number => (density / peak) * SLAB_H;
  /** O meio vão em pixels, convertido para reais: é o que afasta cada lado da forma da linha da meta. */
  const gapValue = (SPLIT_GAP / (PLOT_X1 - PLOT_X0)) * (domainHigh - domainLow);
  const axisY = TOP + rows.length * ROW_H;
  const viewH = axisY + AXIS_H;
  const metaX = toX(meta);
  const metaText = formatCurrencyCompact(meta);
  const total = measured.reduce((sum, row) => sum + row.eye.n, 0);
  const majority = measured.filter((row) => row.eye.above * 2 > row.eye.n);

  const reading =
    majority.length === 0
      ? `Nenhum cenário passa da meta de ${metaText} em mais da metade dos desfechos.`
      : `${formatInt(majority.length)} de ${formatInt(measured.length)} cenários ${majority.length === 1 ? 'passa' : 'passam'} ` +
        `da meta de ${metaText} em mais da metade dos desfechos.`;
  const summary =
    `Meia-olho da receita de 2027 em ${formatInt(measured.length)} cenários simulados contra a meta de ${metaText}. ` +
    `Ficam acima dela ${formatRateWithVolume(lowest.eye.above, lowest.eye.n)} dos desfechos ${lowest.scenario.phrase} ` +
    `e ${formatRateWithVolume(highest.eye.above, highest.eye.n)} ${highest.scenario.phrase}, os dois extremos.`;

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
        {/* A meta é uma linha só para todas as linhas de cenário, com o nome na margem de cima. Ela vem
            antes das formas no desenho, para os traços de intervalo passarem por cima dela. */}
        <line stroke={META_STROKE} strokeDasharray="4 3" strokeWidth={1} x1={metaX} x2={metaX} y1={TOP - 4} y2={axisY} />
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={metaX} y={11}>
          {`meta ${metaText}`}
        </text>
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
          const below = cutCurve(eye.curve, Number.NEGATIVE_INFINITY, meta - gapValue);
          const above = cutCurve(eye.curve, meta + gapValue, Number.POSITIVE_INFINITY);
          return (
            <g key={row.scenario.id}>
              {name}
              <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={600} x={0} y={rowTop + NAME_Y + LINE_STEP}>
                {formatRateWithVolume(eye.above, eye.n)}
              </text>
              <text fill="var(--text-muted)" fontSize={11} x={0} y={rowTop + NAME_Y + LINE_STEP * 2}>
                dos desfechos acima da meta
              </text>
              {/* Aquém da meta a forma é vazada, e além dela é cheia: a diferença é de forma, não só de cor. */}
              {below.length === 0 ? null : (
                <path d={slabPath(below, toX, toH, base)} fill="none" stroke={OUTLINE_STROKE} strokeLinejoin="round" strokeWidth={OUTLINE_W} />
              )}
              {above.length === 0 ? null : <path d={slabPath(above, toX, toH, base)} fill={SLAB_FILL} />}
              <line stroke={INTERVAL_STROKE} strokeWidth={OUTER_W} x1={toX(eye.outerLow)} x2={toX(eye.outerHigh)} y1={lineY} y2={lineY} />
              <line stroke={INTERVAL_STROKE} strokeWidth={INNER_W} x1={toX(eye.innerLow)} x2={toX(eye.innerHigh)} y1={lineY} y2={lineY} />
              {/* `paintOrder` põe o anel por baixo do preenchimento: sem ele o traço da superfície
                  come metade do raio do ponto. */}
              <circle cx={toX(eye.median)} cy={lineY} fill={INTERVAL_STROKE} paintOrder="stroke" r={MEDIAN_R} stroke={SURFACE} strokeWidth={RING_W * 2} />
            </g>
          );
        })}
      </svg>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`receita de 2027, n ${formatInt(total)} desfechos simulados`}</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-3" style={{ backgroundColor: SLAB_FILL }} />
          <span>cheio: acima da meta</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-3 border-[1.5px]" style={{ borderColor: OUTLINE_STROKE }} />
          <span>vazado: até a meta</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full" style={{ backgroundColor: INTERVAL_STROKE }} />
          <span>ponto: mediana</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1 w-3" style={{ backgroundColor: INTERVAL_STROKE }} />
          <span className="tabular-nums">{`traço grosso: ${formatPercent(INNER_MASS, 0)} dos desfechos`}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3" style={{ backgroundColor: INTERVAL_STROKE }} />
          <span className="tabular-nums">{`traço fino: ${formatPercent(OUTER_MASS, 0)}`}</span>
        </span>
      </div>
    </figure>
  );
}
