import { Filter } from 'lucide-react';

import { formatDecimal, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, WITHOUT_CONTACT, type Channel } from './data';

/**
 * Bean plot: o violino com um traço curto por minuto com lead dentro dele. A forma diz onde os casos
 * se concentram e os traços dizem em quais minutos há casos, e é o traço que entrega o que a curva
 * suave esconde: o vão entre valores medidos. Leads no mesmo minuto dividem o traço; a contagem
 * mora na forma e no n de cada canal, nunca na cor do traço.
 *
 * Aqui o valor repetido é o assunto. Um quarto de um canal marca exatamente 0 minuto, e a suavização
 * espalharia esse pico numa barriga larga perto da origem, com cara de canal rápido. Por isso o
 * valor que concentra uma fração grande do grupo sai da curva e vira um traço próprio, cheio e mais
 * alto que o feijão, com a contagem escrita. Ele continua na mediana, e o rodapé diz isso.
 *
 * O original desenha a média do grupo e a média geral. Em tempo até o contato a cauda longa puxa a
 * média para um valor que quase nenhum lead tem, então entram a mediana do grupo e a mediana geral.
 *
 * A geometria é SVG puro, desenhado no tamanho do corpo do cartão para a escala sair 1 (GEO-18).
 */
export interface FirstContactBeanPlotProps {
  readonly data?: readonly Channel[];
  readonly withoutContact?: number;
  readonly height?: number;
  readonly className?: string;
}

interface CurvePoint {
  readonly value: number;
  readonly density: number;
}

/** Valor que concentra uma fração grande do grupo: sai da curva e ganha traço próprio. */
interface Mass {
  readonly value: number;
  readonly count: number;
}

interface Summary {
  readonly channel: Channel;
  readonly n: number;
  readonly median: number;
  readonly masses: readonly Mass[];
  /** As observações que ficam na curva e nos traços, em ordem crescente. */
  readonly smooth: readonly number[];
}

interface Bean extends Summary {
  /** `null` quando o grupo é pequeno demais para estimar forma: só os traços. */
  readonly curve: readonly CurvePoint[] | null;
  readonly atMedian: number | null;
}

/** Largura do desenho: o corpo do cartão de 640 px, para o `<svg>` sair em escala 1. */
const VIEW_W = 574;
const TOP = 16;
const ROW_H = 60;
const AXIS_H = 22;
const LABEL_W = 156;
const PLOT_X0 = LABEL_W;
const PLOT_X1 = VIEW_W - 24;
/** Meia largura do feijão no ponto de maior densidade do conjunto. */
const HALF_MAX = 20;
const TICK_HALF = 5;
/** Grupo sem curva: o traço é a única marca dele, então sai mais alto e mais grosso para se ver. */
const SOLO_TICK_HALF = 8;
const SOLO_TICK_W = 1.5;
const MEDIAN_OVERHANG = 3;
const AXIS_STEP = 30;
const CURVE_STEPS = 80;
/** Abaixo disto não há forma a estimar: o grupo fica só com os traços e o n escrito. */
const DENSITY_MIN_N = 30;
/** Um valor só com esta fração do grupo, e pelo menos `MASS_MIN_COUNT` casos, é massa e não ruído. */
const MASS_SHARE = 0.2;
const MASS_MIN_COUNT = 10;
const BEAN_STROKE = 'var(--chart-1)';
const MASS_STROKE = 'var(--negative)';
const MEDIAN_STROKE = 'var(--text-primary)';
const OVERALL_STROKE = 'var(--text-muted)';
const SURFACE = 'var(--surface-raised)';
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

/** Resumo de um canal, com a massa separada do resto. `null` para canal sem lead medido. */
function summarize(channel: Channel): Summary | null {
  const sorted = [...channel.minutes].sort((a, b) => a - b);
  const median = quantile(sorted, 0.5);
  if (median === null) return null;
  const counts = new Map<number, number>();
  for (const value of sorted) counts.set(value, (counts.get(value) ?? 0) + 1);
  const masses = [...counts.entries()]
    .filter(([, count]) => count >= MASS_MIN_COUNT && count >= MASS_SHARE * sorted.length)
    .map(([value, count]) => ({ value, count }));
  const smooth = sorted.filter((value) => !masses.some((mass) => mass.value === value));
  return { channel, n: sorted.length, median, masses, smooth };
}

/**
 * A curva do feijão, cortada no menor e no maior valor da parte suave. A densidade é multiplicada
 * pela fração do grupo que ficou na curva: tirar a massa não pode devolver a área dela ao resto.
 */
function buildBean(summary: Summary, band: number | null): Bean {
  const min = summary.smooth[0];
  const max = summary.smooth[summary.smooth.length - 1];
  if (band === null || min === undefined || max === undefined || summary.smooth.length < DENSITY_MIN_N) {
    return { ...summary, curve: null, atMedian: null };
  }
  const share = summary.smooth.length / summary.n;
  const curve: CurvePoint[] = [];
  for (let step = 0; step <= CURVE_STEPS; step += 1) {
    const value = min + ((max - min) * step) / CURVE_STEPS;
    const density = densityAt(summary.smooth, band, value);
    if (density !== null) curve.push({ value, density: density * share });
  }
  const atMedian = densityAt(summary.smooth, band, summary.median);
  return { ...summary, curve, atMedian: atMedian === null ? null : atMedian * share };
}

/** Contorno fechado do feijão deitado: a borda de cima da esquerda para a direita, e a de baixo de volta. */
function beanPath(curve: readonly CurvePoint[], toX: (value: number) => number, toHalf: (density: number) => number, cy: number): string {
  const pair = (x: number, y: number): string => `${String(Math.round(x * 100) / 100)},${String(Math.round(y * 100) / 100)}`;
  const upper = curve.map((point) => pair(toX(point.value), cy - toHalf(point.density)));
  const lower = [...curve].reverse().map((point) => pair(toX(point.value), cy + toHalf(point.density)));
  return `M${upper.join('L')}L${lower.join('L')}Z`;
}

/** Minutos inteiros com a unidade. */
function minutesLabel(value: number): string {
  return `${formatInt(Math.round(value))} min`;
}

export default function FirstContactBeanPlot({
  data = defaultData,
  withoutContact = WITHOUT_CONTACT,
  height,
  className,
}: FirstContactBeanPlotProps) {
  const style = height === undefined ? undefined : { height };

  /** Ordem pela mediana, do canal mais rápido no topo ao mais lento. */
  const summaries = data
    .map((channel) => summarize(channel))
    .filter((summary): summary is Summary => summary !== null)
    .sort((a, b) => a.median - b.median);
  /** Canal sem lead medido continua na grade, por último e sem marca. */
  const unmeasured = data.filter((channel) => channel.minutes.length === 0);
  const first = summaries[0];
  const last = summaries[summaries.length - 1];
  const overall = quantile(data.flatMap((channel) => channel.minutes).sort((a, b) => a - b), 0.5);

  if (first === undefined || last === undefined || overall === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead com contato neste recorte: não há tempo até o primeiro contato para desenhar.</span>
      </div>
    );
  }

  /** Banda única: a mediana das bandas de Silverman dos canais que têm casos para ganhar curva. */
  const bands = summaries
    .filter((summary) => summary.smooth.length >= DENSITY_MIN_N)
    .map((summary) => silverman(summary.smooth))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);
  const band = quantile(bands, 0.5);
  const beans = summaries.map((summary) => buildBean(summary, band));

  /** Largura por área: uma escala só, contra a maior densidade do conjunto. `null` sem curva nenhuma. */
  const densities = beans.flatMap((bean) => (bean.curve === null ? [] : bean.curve.map((point) => point.density)));
  const peak = densities.length === 0 ? null : Math.max(...densities);
  const longest = Math.max(AXIS_STEP, ...data.flatMap((channel) => channel.minutes));
  const ceiling = Math.ceil(longest / AXIS_STEP) * AXIS_STEP;
  const ticks = Array.from({ length: ceiling / AXIS_STEP + 1 }, (_, index) => index * AXIS_STEP);
  const toX = (value: number): number => PLOT_X0 + (value / ceiling) * (PLOT_X1 - PLOT_X0);
  const toHalf = (density: number): number => (peak === null ? TICK_HALF : (density / peak) * HALF_MAX);
  const axisY = TOP + (beans.length + unmeasured.length) * ROW_H;
  const viewH = axisY + AXIS_H;

  const total = beans.reduce((sum, bean) => sum + bean.n, 0);
  const massTotal = beans.reduce((sum, bean) => sum + bean.masses.reduce((inner, mass) => inner + mass.count, 0), 0);
  /** O primeiro canal com massa é o achado da peça. */
  const suspect = beans.find((bean) => bean.masses.length > 0);
  const mass = suspect?.masses[0];
  const massText =
    suspect === undefined || mass === undefined
      ? null
      : `${formatInt(mass.count)} leads de ${suspect.channel.name.toLowerCase()} marcam exatamente ${minutesLabel(mass.value)}`;
  /* Forma curta da frase acessível, para caber numa linha na largura do corpo (GEO-14). */
  const reading =
    suspect === undefined || mass === undefined
      ? `Nenhum valor concentra ${formatPercent(MASS_SHARE, 0)} ou mais de um canal: sem sinal de carimbo automático.`
      : `${formatInt(mass.count)} leads de ${suspect.channel.name.toLowerCase()} em ${minutesLabel(mass.value)}: possível carimbo automático, conferir a coleta.`;

  const summary =
    `Bean plot dos minutos até o primeiro contato de ${formatInt(total)} leads em ${formatInt(beans.length)} canais. ` +
    `A mediana vai de ${minutesLabel(first.median)} em ${first.channel.name.toLowerCase()} ` +
    `a ${minutesLabel(last.median)} em ${last.channel.name.toLowerCase()}. ` +
    (massText === null ? 'Nenhum valor repetido concentra um canal.' : `${massText}, possível carimbo automático.`);

  const halo = { paintOrder: 'stroke', stroke: SURFACE, strokeWidth: 3 } as const;

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
      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-secondary">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-px" style={{ backgroundColor: BEAN_STROKE }} />
          <span>um traço por minuto com lead; leads no mesmo minuto dividem o traço</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-0.5" style={{ backgroundColor: MEDIAN_STROKE }} />
          <span>mediana do canal</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 border-l-2 border-dotted" style={{ borderColor: OVERALL_STROKE }} />
          <span className="tabular-nums">{`mediana geral, ${minutesLabel(overall)}`}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-[3px]" style={{ backgroundColor: MASS_STROKE }} />
          <span className="tabular-nums">{`valor com ${formatPercent(MASS_SHARE, 0)} ou mais do canal, fora da curva`}</span>
        </span>
      </div>

      {/* `viewBox` do tamanho do corpo e altura pela proporção: escala 1, texto de 11 px em 11 px (GEO-18). */}
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
              {minutesLabel(tick)}
            </text>
          </g>
        ))}
        <line stroke={OVERALL_STROKE} strokeDasharray="2 3" strokeWidth={1.5} x1={toX(overall)} x2={toX(overall)} y1={TOP - 8} y2={axisY} />
        {beans.map((bean, index) => {
          const cy = TOP + index * ROW_H + ROW_H / 2;
          const tickHalf = bean.curve === null ? SOLO_TICK_HALF : TICK_HALF;
          const reach = Math.max(tickHalf, bean.atMedian === null ? tickHalf : toHalf(bean.atMedian)) + MEDIAN_OVERHANG;
          const lowest = bean.smooth[0];
          return (
            <g key={bean.channel.id}>
              <text fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={cy - 3}>
                {bean.channel.name}
              </text>
              <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={cy + 12}>
                {`n ${formatInt(bean.n)} · mediana ${minutesLabel(bean.median)}`}
              </text>
              {bean.curve === null ? null : (
                <path d={beanPath(bean.curve, toX, toHalf, cy)} fill="none" stroke={BEAN_STROKE} strokeLinejoin="round" strokeWidth={1.5} />
              )}
              {/* Um traço por minuto com lead, cheio: leads no mesmo minuto dividem o traço, e a
                  cor não carrega contagem nenhuma (GEO-11, ACE-5). */}
              {[...new Set(bean.smooth)].map((value) => (
                <line
                  key={`${bean.channel.id}-${String(value)}`}
                  stroke={BEAN_STROKE}
                  strokeWidth={bean.curve === null ? SOLO_TICK_W : 1}
                  x1={toX(value)}
                  x2={toX(value)}
                  y1={cy - tickHalf}
                  y2={cy + tickHalf}
                />
              ))}
              <line stroke={SURFACE} strokeWidth={4} x1={toX(bean.median)} x2={toX(bean.median)} y1={cy - reach} y2={cy + reach} />
              <line stroke={MEDIAN_STROKE} strokeWidth={2} x1={toX(bean.median)} x2={toX(bean.median)} y1={cy - reach} y2={cy + reach} />
              {/* A massa não depende da opacidade para aparecer: traço cheio, mais largo e mais alto
                  que o feijão, com a contagem escrita ao lado (ACE-2, ACE-5). */}
              {bean.masses.map((item) => (
                <g key={`mass-${String(item.value)}`}>
                  <line stroke={MASS_STROKE} strokeWidth={3} x1={toX(item.value)} x2={toX(item.value)} y1={cy - HALF_MAX - 2} y2={cy + HALF_MAX + 2} />
                  <text className="tabular-nums" fill="var(--text-secondary)" fontSize={11} fontWeight={600} style={halo} x={toX(item.value) + 7} y={cy - HALF_MAX - 4}>
                    {`${formatInt(item.count)} leads em ${minutesLabel(item.value)}: conferir a coleta`}
                  </text>
                </g>
              ))}
              {bean.curve !== null || lowest === undefined ? null : (
                <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} style={halo} x={toX(lowest)} y={cy - tickHalf - 8}>
                  {`n ${formatInt(bean.n)}: amostra curta, só os traços`}
                </text>
              )}
            </g>
          );
        })}
        {unmeasured.map((channel, index) => {
          const cy = TOP + (beans.length + index) * ROW_H + ROW_H / 2;
          return (
            <g key={channel.id}>
              <text fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={cy - 3}>
                {channel.name}
              </text>
              <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={cy + 12}>
                {`n ${formatInt(channel.minutes.length)}`}
              </text>
              <text fill="var(--text-muted)" fontSize={11} x={PLOT_X0 + 8} y={cy + 4}>
                {`${formatUnavailable()}: nenhum lead com contato no recorte`}
              </text>
            </g>
          );
        })}
      </svg>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`minutos até o primeiro contato, n ${formatInt(total)} leads no mês`}</span>
        {/* A ordem vai escrita: sem esta linha os nomes leem como lista arbitrária (GEO-12). */}
        <span>ordem de mediana crescente, de cima para baixo</span>
        {band === null ? null : (
          <span className="tabular-nums">{`largura por área na mesma escala, banda de Silverman única de ${formatDecimal(band, 1)} min`}</span>
        )}
        <span className="tabular-nums">{`curva a partir de ${formatInt(DENSITY_MIN_N)} leads`}</span>
        {massTotal <= 0 ? null : (
          <span className="tabular-nums">{`as medianas contam os ${formatInt(massTotal)} leads do valor repetido`}</span>
        )}
        {withoutContact <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(withoutContact)} leads ainda sem contato ficaram fora`}</span>
        )}
      </div>
    </figure>
  );
}
