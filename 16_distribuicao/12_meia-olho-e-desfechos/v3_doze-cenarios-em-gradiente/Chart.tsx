import { Filter } from 'lucide-react';
import { useId } from 'react';

import { formatCurrencyCompact, formatInt, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CEILING, data as defaultData, type BudgetScenario } from './data';

/**
 * Intervalo em gradiente: a meia densidade deitada numa faixa de 16 px, em que a força da cor faz o
 * papel que a altura fazia. É o que deixa doze cenários caberem num cartão em que doze formas não
 * caberiam. Sobre a faixa vão o ponto da mediana, o traço grosso dos 66% centrais e o fino dos 95%,
 * e são eles que carregam os números: a cor diz só onde os desfechos se concentram.
 *
 * Duas decisões desta peça não são de gosto. A cor nunca cai abaixo de 66% de opacidade, que é o
 * menor valor em que `--chart-1` composta com o cartão ainda mede 3:1 nos dois temas (ACE-5): a
 * faixa não esmaece até sumir, ela termina no menor e no maior desfecho simulados. E os desfechos
 * parados no teto de atendimento saem da faixa e viram uma barra própria, à direita da linha do
 * teto, com a taxa e o volume escritos: uma parede não é densidade, e suavizá-la espalharia para os
 * lados uma massa que está num valor só.
 *
 * A geometria é SVG puro, desenhado no tamanho do corpo do cartão para a escala sair 1 (GEO-18).
 */
export interface BudgetGradientIntervalsProps {
  readonly data?: readonly BudgetScenario[];
  /** Teto de atendimento, em entradas por mês. Desfecho neste valor conta como parado no teto. */
  readonly ceiling?: number;
  readonly height?: number;
  readonly className?: string;
}

interface Strip {
  readonly from: number;
  readonly to: number;
  /** Opacidade de cada ponto da grade, do menor ao maior desfecho abaixo do teto. */
  readonly stops: readonly number[];
}

interface Summary {
  readonly n: number;
  readonly median: number;
  readonly innerLow: number;
  readonly innerHigh: number;
  readonly outerLow: number;
  readonly outerHigh: number;
  /** Desfechos parados no teto. */
  readonly capped: number;
  /** `null` quando não há dois desfechos distintos abaixo do teto para desenhar faixa. */
  readonly strip: Strip | null;
}

interface Row {
  readonly scenario: BudgetScenario;
  /** `null` quando o cenário não tem desfecho simulado: sem faixa, sem mediana, nunca zero. */
  readonly summary: Summary | null;
}

type MeasuredRow = Row & { readonly summary: Summary };

/** Largura do desenho: o corpo do cartão de 640 px, para o `<svg>` sair em escala 1. */
const VIEW_W = 574;
/** Margem de cima reservada para os nomes das colunas e do teto, fora das marcas (ANO-3). */
const TOP = 20;
const HEADER_Y = 11;
const ROW_H = 28;
const STRIP_H = 16;
const AXIS_H = 22;
/** Borda direita da coluna da mediana, que é número e alinha à direita (TIP-6). */
const MEDIAN_X = 152;
const PLOT_X0 = 168;
const PLOT_X1 = 408;
/** A barra do teto começa depois da linha do teto, e 100% dos desfechos valeriam esta largura. */
const CAP_GAP = 8;
const CAP_FULL_W = 48;
const CAP_BAR_H = 12;
/** Largura mínima da barra quando algum desfecho para no teto: abaixo disso ela some no cartão. */
const CAP_MIN_W = 2;
const AXIS_STEP = 100;
const INNER_W = 4;
const OUTER_W = 1.5;
const MEDIAN_R = 4;
/** Contorno na cor da superfície em volta dos traços e do ponto: é o segundo fundo que os separa da faixa (TOK-10). */
const RING_W = 1.5;
/** Massa central de cada intervalo: é dela que saem os percentis e o texto de tela. */
const INNER_MASS = 0.66;
const OUTER_MASS = 0.95;
/** Pontos da grade em que a densidade é avaliada: um `stop` do gradiente por ponto. */
const GRADIENT_STEPS = 32;
/** Piso de opacidade de `--chart-1` para a cor composta medir 3:1 contra o cartão nos dois temas (ACE-5). */
const OPACITY_FLOOR = 0.66;
const STRIP_FILL = 'var(--chart-1)';
const INTERVAL_STROKE = 'var(--text-primary)';
const CEILING_STROKE = 'var(--text-muted)';
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

/**
 * A faixa de um cenário: a densidade dos desfechos abaixo do teto, avaliada na grade e convertida em
 * opacidade contra o pico da própria linha, com o piso da ACE-5. `null` sem dois valores distintos.
 */
function buildStrip(below: readonly number[], band: number): Strip | null {
  const from = below[0];
  const to = below[below.length - 1];
  if (from === undefined || to === undefined || to <= from) return null;
  const densities: number[] = [];
  for (let step = 0; step <= GRADIENT_STEPS; step += 1) {
    const density = densityAt(below, band, from + ((to - from) * step) / GRADIENT_STEPS);
    if (density !== null) densities.push(density);
  }
  const peak = largest(densities);
  if (peak === null || peak <= 0) return null;
  return { from, to, stops: densities.map((density) => OPACITY_FLOOR + (1 - OPACITY_FLOOR) * (density / peak)) };
}

/** O resumo de um cenário: percentis sobre todos os desfechos, contagem no teto e a faixa do que ficou abaixo dele. */
function summarize(outcomes: readonly number[], band: number | null, ceiling: number): Summary | null {
  const sorted = [...outcomes].sort((a, b) => a - b);
  const median = quantile(sorted, 0.5);
  const innerLow = quantile(sorted, (1 - INNER_MASS) / 2);
  const innerHigh = quantile(sorted, (1 + INNER_MASS) / 2);
  const outerLow = quantile(sorted, (1 - OUTER_MASS) / 2);
  const outerHigh = quantile(sorted, (1 + OUTER_MASS) / 2);
  if (median === null || innerLow === null || innerHigh === null || outerLow === null || outerHigh === null) return null;
  const below = sorted.filter((value) => value < ceiling);
  return {
    n: sorted.length,
    median,
    innerLow,
    innerHigh,
    outerLow,
    outerHigh,
    capped: sorted.length - below.length,
    strip: band === null ? null : buildStrip(below, band),
  };
}

export default function BudgetGradientIntervals({
  data = defaultData,
  ceiling = CEILING,
  height,
  className,
}: BudgetGradientIntervalsProps) {
  const style = height === undefined ? undefined : { height };
  /* O `useId` devolve dois-pontos ou aspas angulares, conforme a versão do React, e nenhum dos dois
     serve dentro de `url(#...)`: sem a limpeza o gradiente não é achado e a faixa sai sem cor. */
  const gradientPrefix = `faixa-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  /** Ordem de orçamento crescente, de cima para baixo: é a escala do cenário, não um ranking. */
  const ordered = [...data].sort((a, b) => a.budget - b.budget);
  /** Banda única para todos os cenários: a mediana das bandas de Silverman do que ficou abaixo do teto. */
  const bands = ordered
    .map((scenario) => silverman(scenario.outcomes.filter((value) => value < ceiling).sort((a, b) => a - b)))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);
  const band = quantile(bands, 0.5);
  const rows: readonly Row[] = ordered.map((scenario) => ({ scenario, summary: summarize(scenario.outcomes, band, ceiling) }));
  const measured = rows.filter((row): row is MeasuredRow => row.summary !== null);
  const first = measured[0];
  const last = measured[measured.length - 1];

  if (first === undefined || last === undefined || ceiling <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum desfecho simulado neste recorte: não há cenário de orçamento para comparar.</span>
      </div>
    );
  }

  /** O primeiro orçamento a partir do qual TODOS os seguintes têm a mediana no teto, e não só o primeiro que encosta. */
  let saturatedFrom: MeasuredRow | null = null;
  for (let index = measured.length - 1; index >= 0; index -= 1) {
    const row = measured[index];
    if (row === undefined || row.summary.median < ceiling) break;
    saturatedFrom = row;
  }

  const toX = (value: number): number => PLOT_X0 + Math.min(1, Math.max(0, value / ceiling)) * (PLOT_X1 - PLOT_X0);
  const ticks: number[] = [];
  for (let tick = 0; tick <= ceiling; tick += AXIS_STEP) ticks.push(tick);
  const axisY = TOP + rows.length * ROW_H;
  const viewH = axisY + AXIS_H;
  const capX = PLOT_X1 + CAP_GAP;
  const total = measured.reduce((sum, row) => sum + row.summary.n, 0);
  const ceilingText = `${formatInt(ceiling)} entradas`;

  const reading =
    saturatedFrom === null
      ? `Nenhum cenário tem a mediana no teto de ${ceilingText}.`
      : `A partir de ${formatCurrencyCompact(saturatedFrom.scenario.budget)} por mês a mediana encosta no teto de ${ceilingText}.`;
  const summary =
    `Gradiente das entradas por mês em ${formatInt(measured.length)} cenários de orçamento, ` +
    `de ${formatCurrencyCompact(first.scenario.budget)} a ${formatCurrencyCompact(last.scenario.budget)}. ${reading} ` +
    `No maior orçamento, ${formatRateWithVolume(last.summary.capped, last.summary.n)} dos desfechos param no teto.`;

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
        <defs>
          {rows.map((row, index) => {
            const strip = row.summary?.strip;
            if (strip === null || strip === undefined) return null;
            return (
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id={`${gradientPrefix}-${String(index)}`}
                key={row.scenario.id}
                x1={toX(strip.from)}
                x2={toX(strip.to)}
                y1={0}
                y2={0}
              >
                {strip.stops.map((opacity, step) => (
                  <stop
                    key={`stop-${String(step)}`}
                    offset={step / Math.max(1, strip.stops.length - 1)}
                    stopColor={STRIP_FILL}
                    stopOpacity={Math.round(opacity * 1000) / 1000}
                  />
                ))}
              </linearGradient>
            );
          })}
        </defs>
        <text fill="var(--text-muted)" fontSize={11} x={0} y={HEADER_Y}>
          orçamento
        </text>
        <text fill="var(--text-muted)" fontSize={11} textAnchor="end" x={MEDIAN_X} y={HEADER_Y}>
          mediana
        </text>
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={PLOT_X1} y={HEADER_Y}>
          {`teto de ${ceilingText}`}
        </text>
        <text fill="var(--text-muted)" fontSize={11} textAnchor="end" x={VIEW_W} y={HEADER_Y}>
          parados no teto
        </text>
        {ticks.map((tick) => (
          <g key={`tick-${String(tick)}`}>
            {tick >= ceiling ? null : <line stroke="var(--line-subtle)" strokeWidth={1} x1={toX(tick)} x2={toX(tick)} y1={TOP} y2={axisY} />}
            <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={toX(tick)} y={axisY + 15}>
              {`${formatInt(tick)} entradas`}
            </text>
          </g>
        ))}
        <line stroke={CEILING_STROKE} strokeDasharray="4 3" strokeWidth={1} x1={PLOT_X1} x2={PLOT_X1} y1={TOP - 4} y2={axisY} />
        {rows.map((row, index) => {
          const cy = TOP + index * ROW_H + ROW_H / 2;
          const item = row.summary;
          const budget = (
            <text className="tabular-nums" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={cy}>
              {formatCurrencyCompact(row.scenario.budget)}
            </text>
          );
          if (item === null) {
            return (
              <g key={row.scenario.id}>
                {budget}
                <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={PLOT_X0} y={cy}>
                  {`${formatUnavailable()}: cenário sem desfecho simulado`}
                </text>
              </g>
            );
          }
          const capWidth = item.capped === 0 ? 0 : Math.max(CAP_MIN_W, (item.capped / item.n) * CAP_FULL_W);
          return (
            <g key={row.scenario.id}>
              {budget}
              <text className="tabular-nums" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} textAnchor="end" x={MEDIAN_X} y={cy}>
                {`${formatInt(Math.round(item.median))} entradas`}
              </text>
              {item.strip === null ? null : (
                <>
                  {/* Fundo opaco na cor do cartão por baixo da faixa: sem ele a linha de grade aparece
                      através da cor translúcida e lê como marca dentro do intervalo. */}
                  <rect fill={SURFACE} height={STRIP_H} width={toX(item.strip.to) - toX(item.strip.from)} x={toX(item.strip.from)} y={cy - STRIP_H / 2} />
                  <rect
                    fill={`url(#${gradientPrefix}-${String(index)})`}
                    height={STRIP_H}
                    width={toX(item.strip.to) - toX(item.strip.from)}
                    x={toX(item.strip.from)}
                    y={cy - STRIP_H / 2}
                  />
                </>
              )}
              {/* Cada traço tem por baixo o mesmo traço mais largo na cor do cartão: sobre a faixa ciano
                  o traço claro do tema escuro mede 1,53:1 e some sem esse segundo fundo (TOK-10). */}
              <line stroke={SURFACE} strokeWidth={OUTER_W + RING_W * 2} x1={toX(item.outerLow)} x2={toX(item.outerHigh)} y1={cy} y2={cy} />
              <line stroke={INTERVAL_STROKE} strokeWidth={OUTER_W} x1={toX(item.outerLow)} x2={toX(item.outerHigh)} y1={cy} y2={cy} />
              <line stroke={SURFACE} strokeWidth={INNER_W + RING_W * 2} x1={toX(item.innerLow)} x2={toX(item.innerHigh)} y1={cy} y2={cy} />
              <line stroke={INTERVAL_STROKE} strokeWidth={INNER_W} x1={toX(item.innerLow)} x2={toX(item.innerHigh)} y1={cy} y2={cy} />
              <circle cx={toX(item.median)} cy={cy} fill={INTERVAL_STROKE} paintOrder="stroke" r={MEDIAN_R} stroke={SURFACE} strokeWidth={RING_W * 2} />
              {/* A massa no teto é barra própria, fora da faixa. Zero medido não ganha barra e ganha o
                  zero escrito: a ausência, que é outra coisa, escreve indisponível no lugar da linha. */}
              {capWidth === 0 ? null : <rect fill={STRIP_FILL} height={CAP_BAR_H} width={capWidth} x={capX} y={cy - CAP_BAR_H / 2} />}
              <text
                className="tabular-nums"
                dominantBaseline="central"
                fill={item.capped === 0 ? 'var(--text-muted)' : 'var(--text-secondary)'}
                fontSize={11}
                textAnchor="end"
                x={VIEW_W}
                y={cy}
              >
                {formatRateWithVolume(item.capped, item.n)}
              </text>
            </g>
          );
        })}
      </svg>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`entradas por mês, n ${formatInt(total)} desfechos simulados`}</span>
        <span>cor mais forte onde os desfechos da linha se concentram</span>
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
        <span className="flex items-center gap-1">
          <span className="h-2 w-3" style={{ backgroundColor: STRIP_FILL }} />
          <span>barra: desfechos parados no teto</span>
        </span>
        {/* A ordem vai escrita: sem esta linha os orçamentos leem como lista arbitrária (GEO-12). */}
        <span>orçamento mensal de mídia em ordem crescente</span>
      </div>
    </figure>
  );
}
