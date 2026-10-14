import { useMemo } from 'react';
import { Filter } from 'lucide-react';

import { formatCurrency, formatCurrencyAxis, formatInt, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, WITHOUT_LEADS, type Campaign, type Platform } from './data';

/**
 * Sina plot: os pontos de um strip plot espalhados para os lados só até onde a densidade deixa. Onde
 * há muitos casos o ponto pode ir longe do eixo, onde há poucos ele fica colado nele, e o conjunto
 * desenha sozinho a silhueta do violino. Serve quando a forma importa e cada caso também.
 *
 * A posição lateral não carrega informação: sai de um hash do código da campanha, para ser a mesma
 * em todo render, e a legenda diz isso com todas as letras. O que carrega informação é a posição no
 * eixo de valor e a cor, que aqui tem um papel só: campanha com criativo em vídeo.
 *
 * A largura é por contagem, e não por área: a plataforma com mais campanhas desenha a forma mais
 * larga. É a escala honesta quando os grupos têm tamanhos diferentes e a pergunta é onde os casos
 * estão; por área, quarenta campanhas pareceriam tantas quanto trezentas.
 *
 * A geometria é SVG puro, desenhado no tamanho do corpo do cartão para a escala sair 1 (GEO-18).
 */
export interface CplSinaPlotProps {
  readonly data?: readonly Platform[];
  readonly withoutLeads?: number;
  readonly height?: number;
  readonly className?: string;
}

interface CurvePoint {
  readonly value: number;
  /** Densidade vezes o n do grupo: casos por real, a grandeza que a largura por contagem desenha. */
  readonly count: number;
}

interface SinaPoint {
  readonly campaign: Campaign;
  /** Casos por real no valor do ponto: o teto do deslocamento lateral. */
  readonly count: number;
  /** Lado e fração do teto, de −1 a 1, tirados do código da campanha. */
  readonly side: number;
}

interface Shape {
  readonly platform: Platform;
  readonly n: number;
  readonly videos: number;
  /** Campanhas em vídeo acima da mediana da própria plataforma. */
  readonly videosAbove: number;
  readonly median: number;
  readonly atMedian: number;
  readonly max: number;
  readonly curve: readonly CurvePoint[];
  readonly peak: number;
  readonly points: readonly SinaPoint[];
}

/** Largura do desenho: o corpo do cartão de 640 px, para o `<svg>` sair em escala 1. */
const VIEW_W = 574;
const TOP = 6;
const ROW_H = 66;
const AXIS_H = 22;
const LABEL_W = 140;
const PLOT_X0 = LABEL_W;
const PLOT_X1 = VIEW_W - 22;
/** Meia largura da forma no valor com mais campanhas do conjunto. */
const HALF_MAX = 30;
/** O ponto usa até esta fração da meia largura, para não encostar no contorno. */
const SINA_SHARE = 0.86;
const AXIS_STEP = 100;
const CURVE_STEPS = 80;
const OTHER_R = 1.5;
const VIDEO_R = 2.25;
const MEDIAN_OVERHANG = 3;
const VIDEO_FILL = 'var(--chart-2)';
const OTHER_FILL = 'var(--text-muted)';
const OUTLINE_STROKE = 'var(--text-muted)';
const MEDIAN_STROKE = 'var(--text-primary)';
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

/** Casos por real no valor pedido: núcleo gaussiano somado, sem dividir pelo n. `null` para lista vazia. */
function countAt(values: readonly number[], band: number, x: number): number | null {
  if (values.length === 0) return null;
  let total = 0;
  for (const value of values) {
    const z = (x - value) / band;
    total += Math.exp(-0.5 * z * z);
  }
  return total / (band * SQRT_TWO_PI);
}

function cplOf(platform: Platform): number[] {
  return platform.campaigns.map((campaign) => campaign.cpl).sort((a, b) => a - b);
}

/** Fração de 0 a 1 tirada do código da campanha: a mesma campanha cai no mesmo lugar em todo render. */
function hashFraction(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 2246822519);
  hash ^= hash >>> 13;
  return (hash >>> 0) / 4294967296;
}

/** A forma de uma plataforma: resumo, curva por contagem e o teto lateral de cada ponto. */
function buildShape(platform: Platform, band: number): Shape | null {
  const sorted = cplOf(platform);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = quantile(sorted, 0.5);
  if (min === undefined || max === undefined || median === null) return null;
  const atMedian = countAt(sorted, band, median);
  if (atMedian === null) return null;
  const curve: CurvePoint[] = [];
  for (let step = 0; step <= CURVE_STEPS; step += 1) {
    const value = min + ((max - min) * step) / CURVE_STEPS;
    const count = countAt(sorted, band, value);
    if (count !== null) curve.push({ value, count });
  }
  const points: SinaPoint[] = [];
  for (const campaign of platform.campaigns) {
    const count = countAt(sorted, band, campaign.cpl);
    if (count !== null) points.push({ campaign, count, side: hashFraction(campaign.id) * 2 - 1 });
  }
  const videos = platform.campaigns.filter((campaign) => campaign.video);
  return {
    platform,
    n: sorted.length,
    videos: videos.length,
    videosAbove: videos.filter((campaign) => campaign.cpl > median).length,
    median,
    atMedian,
    max,
    curve,
    /* A semente é a contagem na mediana, uma medida do próprio grupo: o pico nunca é menor que ela. */
    peak: curve.reduce((top, point) => Math.max(top, point.count), atMedian),
    points,
  };
}

/** Contorno fechado do violino deitado: a borda de cima da esquerda para a direita, e a de baixo de volta. */
function outlinePath(curve: readonly CurvePoint[], toX: (value: number) => number, toHalf: (count: number) => number, cy: number): string {
  const pair = (x: number, y: number): string => `${String(Math.round(x * 100) / 100)},${String(Math.round(y * 100) / 100)}`;
  const upper = curve.map((point) => pair(toX(point.value), cy - toHalf(point.count)));
  const lower = [...curve].reverse().map((point) => pair(toX(point.value), cy + toHalf(point.count)));
  return `M${upper.join('L')}L${lower.join('L')}Z`;
}

export default function CplSinaPlot({
  data = defaultData,
  withoutLeads = WITHOUT_LEADS,
  height,
  className,
}: CplSinaPlotProps) {
  const style = height === undefined ? undefined : { height };

  /* A densidade no valor de cada ponto custa n ao quadrado por grupo: só se refaz quando o dado muda. */
  const model = useMemo(() => {
    /** Banda única para todas as formas: a mediana das bandas de Silverman de cada plataforma. */
    const bands = data
      .map((platform) => silverman(cplOf(platform)))
      .filter((value): value is number => value !== null)
      .sort((a, b) => a - b);
    const band = quantile(bands, 0.5);
    if (band === null) return null;
    /** Ordem pela mediana, da plataforma mais barata no topo à mais cara. */
    const shapes = data
      .map((platform) => buildShape(platform, band))
      .filter((shape): shape is Shape => shape !== null)
      .sort((a, b) => a.median - b.median);
    return { band, shapes };
  }, [data]);

  const drawn = model === null ? [] : model.shapes;
  const first = drawn[0];
  const last = drawn[drawn.length - 1];

  if (model === null || first === undefined || last === undefined) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha com lead neste recorte: não há custo por lead para desenhar.</span>
      </div>
    );
  }

  const { band, shapes } = model;
  /** Plataforma sem campanha no recorte continua na grade, por último e sem forma. */
  const unmeasured = data.filter((platform) => platform.campaigns.length === 0);
  /** Largura por contagem: uma escala só, contra o valor com mais campanhas do conjunto. */
  const peak = shapes.reduce((top, shape) => Math.max(top, shape.peak), first.peak);
  const ceiling = Math.ceil(Math.max(AXIS_STEP, ...shapes.map((shape) => shape.max)) / AXIS_STEP) * AXIS_STEP;
  const ticks = Array.from({ length: ceiling / AXIS_STEP + 1 }, (_, index) => index * AXIS_STEP);
  const toX = (value: number): number => PLOT_X0 + (value / ceiling) * (PLOT_X1 - PLOT_X0);
  const toHalf = (count: number): number => (count / peak) * HALF_MAX;
  const axisY = TOP + (shapes.length + unmeasured.length) * ROW_H;
  const viewH = axisY + AXIS_H;

  const total = shapes.reduce((sum, shape) => sum + shape.n, 0);
  const videos = shapes.reduce((sum, shape) => sum + shape.videos, 0);
  const videosAbove = shapes.reduce((sum, shape) => sum + shape.videosAbove, 0);
  const videoRate = formatRateWithVolume(videosAbove, videos);
  const videoText = `${videoRate} das campanhas em vídeo passam da mediana da própria plataforma`;
  const regime =
    videosAbove * 2 > videos ? 'Vídeo mora na cauda cara' : videosAbove * 2 < videos ? 'Vídeo mora na cauda barata' : 'Vídeo não tem lado';
  /* Forma curta da mesma frase, para caber numa linha na largura do corpo (GEO-14). */
  const reading = videos === 0 ? 'Nenhuma campanha em vídeo neste recorte.' : `${regime}: ${videoRate} acima da mediana da própria plataforma.`;

  const summary =
    `Sina plot do custo por lead de ${formatInt(total)} campanhas em ${formatInt(shapes.length)} plataformas. ` +
    `A mediana vai de ${formatCurrency(first.median, 0)} em ${first.platform.name.toLowerCase()} ` +
    `a ${formatCurrency(last.median, 0)} em ${last.platform.name.toLowerCase()}. ` +
    (videos === 0 ? 'Nenhuma campanha em vídeo.' : `${videoText}.`);

  const dot = (shape: Shape, point: SinaPoint, cy: number) => (
    <circle
      cx={toX(point.campaign.cpl)}
      /* A fração lateral é limitada pela meia largura no valor do próprio ponto: é isso que faz a
         nuvem de pontos desenhar a silhueta em vez de uma faixa retangular. */
      cy={cy + point.side * toHalf(point.count) * SINA_SHARE}
      fill={point.campaign.video ? VIDEO_FILL : OTHER_FILL}
      key={`${shape.platform.id}-${point.campaign.id}`}
      r={point.campaign.video ? VIDEO_R : OTHER_R}
      stroke={point.campaign.video ? SURFACE : undefined}
      strokeWidth={point.campaign.video ? 0.75 : undefined}
    />
  );

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
          <span className="size-2 rounded-full" style={{ backgroundColor: VIDEO_FILL }} />
          <span>campanha com criativo em vídeo</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full" style={{ backgroundColor: OTHER_FILL }} />
          <span>demais campanhas</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-0.5" style={{ backgroundColor: MEDIAN_STROKE }} />
          <span>mediana da plataforma</span>
        </span>
        <span className="text-text-muted">a posição lateral do ponto não tem significado</span>
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
              {formatCurrencyAxis(tick)}
            </text>
          </g>
        ))}
        {shapes.map((shape, index) => {
          const cy = TOP + index * ROW_H + ROW_H / 2;
          const reach = toHalf(shape.atMedian) + MEDIAN_OVERHANG;
          return (
            <g key={shape.platform.id}>
              <text fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={cy - 12}>
                {shape.platform.name}
              </text>
              <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={cy + 4}>
                {`n ${formatInt(shape.n)} · ${formatInt(shape.videos)} em vídeo`}
              </text>
              <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={cy + 19}>
                {`mediana ${formatCurrency(shape.median, 0)}`}
              </text>
              <path d={outlinePath(shape.curve, toX, toHalf, cy)} fill="none" stroke={OUTLINE_STROKE} strokeLinejoin="round" strokeWidth={1} />
              {/* Vídeo por último, por cima: é a camada que a pergunta pede, e no meio de trezentos
                  pontos neutros ela se perderia desenhada na ordem do dado. */}
              {shape.points.filter((point) => !point.campaign.video).map((point) => dot(shape, point, cy))}
              {shape.points.filter((point) => point.campaign.video).map((point) => dot(shape, point, cy))}
              {/* Revestimento na cor da superfície por baixo do traço: a mediana cruza pontos de duas
                  cores, e nenhum token contrasta com as duas e com o cartão (TOK-10). */}
              <line stroke={SURFACE} strokeWidth={4} x1={toX(shape.median)} x2={toX(shape.median)} y1={cy - reach} y2={cy + reach} />
              <line stroke={MEDIAN_STROKE} strokeWidth={2} x1={toX(shape.median)} x2={toX(shape.median)} y1={cy - reach} y2={cy + reach} />
            </g>
          );
        })}
        {unmeasured.map((platform, index) => {
          const cy = TOP + (shapes.length + index) * ROW_H + ROW_H / 2;
          return (
            <g key={platform.id}>
              <text fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={cy - 4}>
                {platform.name}
              </text>
              <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={cy + 12}>
                {`n ${formatInt(platform.campaigns.length)}`}
              </text>
              <text fill="var(--text-muted)" fontSize={11} x={PLOT_X0 + 8} y={cy + 4}>
                {`${formatUnavailable()}: nenhuma campanha com lead no recorte`}
              </text>
            </g>
          );
        })}
      </svg>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`custo por lead, n ${formatInt(total)} campanhas do semestre`}</span>
        {/* A ordem vai escrita: sem esta linha os nomes leem como lista arbitrária (GEO-12). */}
        <span>ordem de mediana crescente, de cima para baixo</span>
        <span>largura por contagem: mais larga onde há mais campanhas</span>
        <span className="tabular-nums">{`banda de Silverman única de ${formatCurrency(band, 0)}`}</span>
        <span>forma cortada no mínimo e no máximo observados</span>
        {withoutLeads <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(withoutLeads)} campanhas sem nenhum lead ficaram fora`}</span>
        )}
      </div>
    </figure>
  );
}
