import { Filter, Pause, Play, SkipForward } from 'lucide-react';
import { useEffect, useState } from 'react';

import { formatCurrencyAxis, formatCurrencyCompact, formatDecimal, formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BIN, data as defaultData, DOMAIN, META, type Outcome } from './data';

/**
 * Desfechos hipotéticos: em vez de resumir a incerteza numa forma, a peça mostra um desfecho do
 * simulador por vez, e quem assiste sente a frequência com que a meta é batida. Serve para
 * apresentação ao vivo, e só para ela: no papel a animação congela num quadro, e um quadro sozinho
 * se lê como previsão.
 *
 * Por isso a peça tem duas versões e escolhe sozinha. Com movimento reduzido no sistema, na
 * impressão ou com `staticOnly`, sai o quantile dotplot: os mesmos desfechos, um ponto cada,
 * empilhados em faixas, com a nota de que aquela é a versão estática. Nas duas o eixo é o mesmo e é
 * fixo sobre todos os desfechos, e nas duas o ponto cheio é o desfecho que atinge a meta.
 *
 * Nenhuma transição liga um quadro ao seguinte: o ponto some de um lugar e aparece no outro.
 * Interpolar desenharia, no meio do caminho, receitas que o simulador nunca produziu.
 *
 * A geometria é SVG puro, desenhado no tamanho do corpo do cartão para a escala sair 1 (GEO-18).
 */
export interface HypotheticalOutcomesProps {
  readonly data?: readonly Outcome[];
  /** Meta de receita do trimestre, em reais. Desfecho igual ou maior atinge a meta. */
  readonly meta?: number;
  /** Domínio fixo do eixo, em reais. Desfecho fora dele é desenhado na borda. */
  readonly domain?: readonly [number, number];
  /** Largura da faixa de empilhamento da versão estática, em reais. */
  readonly bin?: number;
  /** Força a versão estática, para exportação em que a consulta de mídia não chega. */
  readonly staticOnly?: boolean;
  readonly height?: number;
  readonly className?: string;
}

interface Dot {
  readonly run: number;
  /** Centro da faixa em que o desfecho caiu, em reais. */
  readonly center: number;
  /** Posição na pilha da faixa, a partir de zero. */
  readonly level: number;
  readonly hit: boolean;
}

/** Largura do desenho: o corpo do cartão de 640 px, para o `<svg>` sair em escala 1. */
const VIEW_W = 574;
/** Margem de cima reservada para o nome da meta, fora das marcas (ANO-3). */
const TOP = 20;
const PLOT_H = 90;
const AXIS_H = 22;
const PLOT_X0 = 28;
const PLOT_X1 = VIEW_W - 28;
const DOT_R_MAX = 6;
/** Vão entre dois pontos vizinhos da versão estática, na pilha e entre faixas. */
const DOT_GAP = 1;
const HOLLOW_W = 1.5;
/** Raio do ponto único da versão animada, e a altura dele acima da linha de base. */
const FRAME_R = 7;
const FRAME_LIFT = 26;
/** Meia largura reservada ao rótulo do quadro: perto das bordas ele para aqui em vez de sair do desenho. */
const FRAME_LABEL_HALF = 88;
/** Meio segundo por desfecho: tempo de ver onde o ponto caiu, sem dar tempo de decorar um quadro. */
const STEP_MS = 500;
/** Semente do sorteio da ordem dos quadros: a apresentação de hoje repete a de ontem. */
const ORDER_SEED = 7;
const MAX_TICKS = 6;
const TICK_BASES = [1, 2, 2.5, 5] as const;
/** As duas situações em que a animação dá lugar à versão estática. */
const STATIC_QUERIES = ['(prefers-reduced-motion: reduce)', 'print'] as const;
const HIT_FILL = 'var(--chart-1)';
/** Contorno do desfecho abaixo da meta: 5,21:1 no escuro e 5,37:1 no claro contra o cartão. */
const MISS_STROKE = 'var(--text-muted)';
const META_STROKE = 'var(--text-muted)';
const BUTTON_CLASS =
  'flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-overlay hover:text-text-primary';

/** Maior valor de uma lista. `null` para lista vazia, nunca `-Infinity`. */
function largest(values: readonly number[]): number | null {
  let best: number | null = null;
  for (const value of values) if (best === null || value > best) best = value;
  return best;
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

/** Gerador de 32 bits com semente fixa: o sorteio é reproduzível, e não depende de relógio. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** A ordem em que os desfechos aparecem: um embaralhamento de semente fixa das posições do dado. */
function frameOrder(count: number, seed: number): readonly number[] {
  const next = seededRandom(seed);
  const order = Array.from({ length: count }, (_, index) => index);
  for (let index = count - 1; index > 0; index -= 1) {
    const other = Math.floor(next() * (index + 1));
    const here = order[index];
    const there = order[other];
    if (here === undefined || there === undefined) continue;
    order[index] = there;
    order[other] = here;
  }
  return order;
}

/** Os pontos da versão estática: cada desfecho no centro da sua faixa, empilhado sobre os anteriores. */
function stackDots(outcomes: readonly Outcome[], bin: number, meta: number): readonly Dot[] {
  const levels = new Map<number, number>();
  return [...outcomes]
    .sort((a, b) => a.revenue - b.revenue || a.run - b.run)
    .map((outcome) => {
      const slot = Math.floor(outcome.revenue / bin);
      const level = levels.get(slot) ?? 0;
      levels.set(slot, level + 1);
      return { run: outcome.run, center: (slot + 0.5) * bin, level, hit: outcome.revenue >= meta };
    });
}

function matchesStatic(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return STATIC_QUERIES.some((query) => window.matchMedia(query).matches);
}

/**
 * Movimento reduzido no sistema ou página indo para a impressão. O valor inicial já sai da
 * consulta, e não de um efeito: com efeito, a primeira pintura seria a animada e o PDF a pegaria.
 */
function useStaticVersion(): boolean {
  const [isStatic, setIsStatic] = useState(matchesStatic);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const queries = STATIC_QUERIES.map((query) => window.matchMedia(query));
    const onChange = () => {
      setIsStatic(queries.some((query) => query.matches));
    };
    for (const query of queries) query.addEventListener('change', onChange);
    return () => {
      for (const query of queries) query.removeEventListener('change', onChange);
    };
  }, []);
  return isStatic;
}

interface FrameState {
  readonly index: number;
  readonly playing: boolean;
  readonly toggle: () => void;
  readonly advance: () => void;
}

/**
 * O quadro da vez. Troca a cada `stepMs` enquanto está tocando, por um temporizador que se rearma a
 * cada quadro e se desfaz na pausa e na desmontagem; ao fim da lista volta ao começo, porque os
 * desfechos não têm ordem e a animação não tem final. Parado em `enabled` falso, que é a versão estática.
 */
function useFrame(total: number, stepMs: number, enabled: boolean): FrameState {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!enabled || !playing || total < 2) return;
    const timer = setTimeout(() => {
      setIndex((current) => (current + 1) % total);
    }, stepMs);
    return () => {
      clearTimeout(timer);
    };
  }, [enabled, playing, index, total, stepMs]);

  return {
    index: total < 1 ? 0 : index % total,
    playing,
    toggle: () => {
      setPlaying((wasPlaying) => !wasPlaying);
    },
    advance: () => {
      if (total < 2) return;
      setPlaying(false);
      setIndex((current) => (current + 1) % total);
    },
  };
}

export default function HypotheticalOutcomes({
  data = defaultData,
  meta = META,
  domain = DOMAIN,
  bin = BIN,
  staticOnly = false,
  height,
  className,
}: HypotheticalOutcomesProps) {
  const style = height === undefined ? undefined : { height };
  const prefersStatic = useStaticVersion();
  const isStatic = prefersStatic || staticOnly;
  const frame = useFrame(data.length, STEP_MS, !isStatic);
  const [domainLow, domainHigh] = domain;

  const sorted = data.map((outcome) => outcome.revenue).sort((a, b) => a - b);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];

  const dots = stackDots(data, bin, meta);
  /** O nível mais alto de pilha, a partir de zero. `null` sem nenhum ponto. */
  const topLevel = largest(dots.map((dot) => dot.level));

  if (lowest === undefined || highest === undefined || topLevel === null || domainHigh <= domainLow || bin <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum desfecho simulado neste recorte: não há o que apresentar contra a meta.</span>
      </div>
    );
  }

  const hits = sorted.filter((value) => value >= meta).length;
  /** Valor fora do domínio que o pai mandou é desenhado na borda, nunca fora da área. */
  const toX = (value: number): number =>
    PLOT_X0 + Math.min(1, Math.max(0, (value - domainLow) / (domainHigh - domainLow))) * (PLOT_X1 - PLOT_X0);
  const step = tickStep(domainHigh - domainLow);
  const ticks: number[] = [];
  for (let tick = Math.ceil(domainLow / step) * step; tick <= domainHigh; tick += step) ticks.push(tick);
  const baseY = TOP + PLOT_H;
  const viewH = baseY + AXIS_H;
  const metaX = toX(meta);
  const metaText = formatCurrencyCompact(meta);

  /** O raio sai da pilha mais alta e da largura da faixa: nenhuma pilha passa da área nem invade a faixa vizinha. */
  const tallest = topLevel + 1;
  const binWidth = (bin / (domainHigh - domainLow)) * (PLOT_X1 - PLOT_X0);
  const radius = Math.max(1, Math.min(DOT_R_MAX, (PLOT_H / tallest - DOT_GAP) / 2, (binWidth - DOT_GAP) / 2));

  const order = frameOrder(data.length, ORDER_SEED);
  const current = data[order[frame.index] ?? 0];
  const currentHit = current !== undefined && current.revenue >= meta;

  const rateText = formatRateWithVolume(hits, sorted.length);
  const reading = `${rateText} dos desfechos atingem a meta de ${metaText}.`;
  const summary =
    `Receita do trimestre em ${formatInt(sorted.length)} desfechos simulados, de ${formatCurrencyCompact(lowest)} a ${formatCurrencyCompact(highest)}, ` +
    `em eixo fixo. ${reading} ` +
    (isStatic ? 'Versão estática: cada ponto é um desfecho.' : 'Versão animada: um desfecho por vez, com pausa.');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="group" style={style}>
      <div className="flex min-h-7 shrink-0 items-center gap-2">
        {isStatic ? null : (
          <>
            <button aria-label={frame.playing ? 'Pausar os desfechos' : 'Retomar os desfechos'} className={BUTTON_CLASS} onClick={frame.toggle} type="button">
              {frame.playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
            </button>
            <button aria-label="Avançar um desfecho" className={BUTTON_CLASS} onClick={frame.advance} type="button">
              <SkipForward aria-hidden className="size-4" />
            </button>
            <span aria-hidden className="shrink-0 text-xs leading-4 font-medium text-text-primary tabular-nums">
              {`desfecho ${formatInt(frame.index + 1)} de ${formatInt(data.length)}`}
            </span>
          </>
        )}
        <p aria-hidden className="min-w-0 text-xs leading-4 font-medium text-text-secondary tabular-nums">
          {reading}
        </p>
      </div>
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
            <line stroke="var(--line-subtle)" strokeWidth={1} x1={toX(tick)} x2={toX(tick)} y1={TOP} y2={baseY} />
            <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={toX(tick)} y={baseY + 15}>
              {formatCurrencyAxis(tick)}
            </text>
          </g>
        ))}
        <line stroke="var(--line-strong)" strokeWidth={1} x1={PLOT_X0} x2={PLOT_X1} y1={baseY} y2={baseY} />
        <line stroke={META_STROKE} strokeDasharray="4 3" strokeWidth={1} x1={metaX} x2={metaX} y1={TOP - 4} y2={baseY} />
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={metaX} y={11}>
          {`meta ${metaText}`}
        </text>
        {isStatic
          ? dots.map((dot) => {
              const cy = baseY - DOT_GAP - radius - dot.level * (radius * 2 + DOT_GAP);
              /* Cheio atinge a meta e vazado fica abaixo dela: a diferença é de forma, não só de cor. */
              return dot.hit ? (
                <circle cx={toX(dot.center)} cy={cy} fill={HIT_FILL} key={dot.run} r={radius} />
              ) : (
                <circle cx={toX(dot.center)} cy={cy} fill="none" key={dot.run} r={radius - HOLLOW_W / 2} stroke={MISS_STROKE} strokeWidth={HOLLOW_W} />
              );
            })
          : current === undefined
            ? null
            : (
                <g>
                  {currentHit ? (
                    <circle cx={toX(current.revenue)} cy={baseY - FRAME_LIFT} fill={HIT_FILL} r={FRAME_R} />
                  ) : (
                    <circle cx={toX(current.revenue)} cy={baseY - FRAME_LIFT} fill="none" r={FRAME_R - 1} stroke={MISS_STROKE} strokeWidth={2} />
                  )}
                  <line stroke={currentHit ? HIT_FILL : MISS_STROKE} strokeWidth={1.5} x1={toX(current.revenue)} x2={toX(current.revenue)} y1={baseY - FRAME_LIFT + FRAME_R} y2={baseY} />
                  <text
                    className="font-display"
                    fill="var(--text-primary)"
                    fontSize={12}
                    fontWeight={600}
                    paintOrder="stroke"
                    stroke="var(--surface-raised)"
                    strokeWidth={4}
                    textAnchor="middle"
                    x={Math.min(VIEW_W - FRAME_LABEL_HALF, Math.max(FRAME_LABEL_HALF, toX(current.revenue)))}
                    y={baseY - FRAME_LIFT - FRAME_R - 8}
                  >
                    {`${formatCurrencyCompact(current.revenue)}, ${currentHit ? 'atinge a meta' : 'abaixo da meta'}`}
                  </text>
                </g>
              )}
      </svg>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`receita do trimestre, n ${formatInt(sorted.length)} desfechos simulados`}</span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full" style={{ backgroundColor: HIT_FILL }} />
          <span>cheio: atinge a meta</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full border-[1.5px]" style={{ borderColor: MISS_STROKE }} />
          <span>vazado: abaixo dela</span>
        </span>
        {isStatic ? (
          <>
            <span className="tabular-nums">{`cada ponto é um desfecho, em faixas de ${formatCurrencyCompact(bin)}`}</span>
            <span>versão estática dos desfechos animados</span>
          </>
        ) : (
          <span className="tabular-nums">{`um desfecho a cada ${formatDecimal(STEP_MS / 1000, 1)} segundo, em eixo fixo`}</span>
        )}
      </div>
    </div>
  );
}
