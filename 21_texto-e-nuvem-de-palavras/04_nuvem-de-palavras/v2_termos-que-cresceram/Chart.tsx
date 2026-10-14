import { Filter } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  periodLabel as defaultPeriodLabel,
  previousPeriodLabel as defaultPreviousPeriodLabel,
  previousTotalResponses as defaultPreviousTotalResponses,
  totalResponses as defaultTotalResponses,
  type TermChange,
} from './data';

/**
 * Nuvem de palavras com destaque de mudança: o vocabulário inteiro do trimestre fica em tom
 * neutro, e só os termos que cresceram acima do corte contra o trimestre anterior acendem, em cor
 * e em peso. Responde quais assuntos ganharam espaço sem tirar da frente os que já eram grandes.
 *
 * 1. O tamanho segue o período atual: fonte pela raiz quadrada das respostas, do maior ao menor.
 * 2. A variação é `(atual − anterior) ÷ anterior`, e devolve `null` quando não há base. Termo sem
 *    base anterior sai com a marca `novo` e fica fora do destaque: não existe percentual sobre zero.
 * 3. O destaque pede variação ACIMA do corte; quem cresce exatamente o corte fica neutro.
 * 4. A dica de cada termo traz as duas contagens, cada uma com o total do seu período, e a variação
 *    com a base nomeada.
 *
 * O layout é a mesma espiral determinística da versão em espiral: caixa medida com `measureText`
 * depois de `document.fonts` confirmar a face (GEO-8), e soma por glifo até lá.
 */
export interface RisingTermsWordCloudProps {
  readonly data?: readonly TermChange[];
  /** Respostas do período atual e do anterior: os denominadores que a dica escreve. */
  readonly totalResponses?: number;
  readonly previousTotalResponses?: number;
  /** Os dois períodos, como se escrevem na tela. */
  readonly periodLabel?: string;
  readonly previousPeriodLabel?: string;
  /** Corte de alta, em fração: 0,5 acende quem cresceu mais de 50%. */
  readonly growthCut?: number;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Plano do layout, do tamanho do corpo medido para a escala do `<svg>` sair 1 (GEO-18): 574 px de
 * largura do cartão e 198 px de altura, que é o corpo de 265 px do canvas de 640x400 menos a linha
 * de leitura (24 px), a nota de duas linhas (41 px) e 2 px de sobra. Em outro tamanho de cartão,
 * troque o plano pelo corpo medido do destino, por ponto de quebra.
 */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 198;
const MIN_FONT = 12;
const MAX_FONT = 48;
const DEFAULT_GROWTH_CUT = 0.5;
/**
 * O destaque vai em 600 contra 400 do resto, e não em 700: o peso 700 cabe em no máximo dois
 * elementos por visual (TIP-3), e o número de termos acima do corte depende do recorte.
 */
const RISING_WEIGHT = 600;
const NEUTRAL_WEIGHT = 400;
const NEW_TAG = 'novo';
const NEW_TAG_FONT = 11;
const NEW_TAG_WEIGHT = 600;
/** Vão entre o termo e a marca `novo`, em px. */
const NEW_TAG_GAP = 4;
/** Folga em volta de cada termo: 2 px por lado, isto é 4 px de tinta a tinta entre vizinhos. */
const TERM_PADDING = 2;
/** Quanto o raio da espiral cresce a cada volta, em px, antes do esticamento horizontal. */
const SPIRAL_TURN_GAP = 6;
/** Distância percorrida sobre a espiral entre duas tentativas, em px. */
const SPIRAL_ARC_STEP = 5;
/**
 * Piso da caixa de tinta, em em: a caixa medida de uma palavra sem ascendente nem descendente é
 * mais baixa que a régua de colisão do catálogo (0,72 acima e 0,10 abaixo da linha de base), e
 * sem o piso duas palavras ficariam mais perto do que o respiro pede.
 */
const INK_ASCENT_EM = 0.72;
const INK_DESCENT_EM = 0.1;
/** Caixa da estimativa, em em: a maior tinta da minúscula acentuada e do descendente no Manrope. */
const ESTIMATE_ASCENT_EM = 0.81;
const ESTIMATE_DESCENT_EM = 0.26;
const GLYPH_DEFAULT_EM = 0.63;
/**
 * Avanço de cada glifo do Manrope em em, medido no peso 700, que é o mais largo: a estimativa erra
 * para o lado de sobrar espaço (GEO-8). Letra acentuada tem o avanço da letra de base.
 */
const GLYPH_EM: Readonly<Record<string, number>> = {
  a: 0.576, b: 0.616, c: 0.575, d: 0.617, e: 0.602, f: 0.378, g: 0.616, h: 0.625, i: 0.28,
  j: 0.288, k: 0.538, l: 0.28, m: 0.899, n: 0.625, o: 0.618, p: 0.616, q: 0.617, r: 0.399,
  s: 0.541, t: 0.433, u: 0.625, v: 0.553, w: 0.802, x: 0.554, y: 0.559, z: 0.533,
  ' ': 0.2, '-': 0.42,
};

interface TextBox {
  readonly width: number;
  readonly ascent: number;
  readonly descent: number;
}

type Measure = (text: string, size: number, weight: number) => TextBox;

/** Caixa estimada pela soma dos glifos: vale até a fonte carregar, e nunca subestima. */
function estimateBox(text: string, size: number): TextBox {
  let em = 0;
  for (const char of text.toLowerCase().normalize('NFD')) {
    // Marca de acento combinante não avança: o acento vai sobre a letra de base.
    if (char >= '̀' && char <= 'ͯ') continue;
    em += GLYPH_EM[char] ?? GLYPH_DEFAULT_EM;
  }
  return { width: em * size, ascent: ESTIMATE_ASCENT_EM * size, descent: ESTIMATE_DESCENT_EM * size };
}

/**
 * Medida real por Canvas 2D, com cache por peso, tamanho e termo. Só é criada depois de
 * `document.fonts.check` confirmar a face: medir antes guardaria a largura da fonte do sistema.
 */
function createCanvasMeasure(family: string): Measure | null {
  const context = document.createElement('canvas').getContext('2d');
  if (context === null) return null;
  const cache = new Map<string, TextBox>();
  return (text, size, weight) => {
    const key = `${String(weight)}|${String(size)}|${text}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    context.font = `${String(weight)} ${String(size)}px ${family}`;
    const metrics = context.measureText(text);
    const box: TextBox = {
      width: metrics.width,
      ascent: Math.max(metrics.actualBoundingBoxAscent, INK_ASCENT_EM * size),
      descent: Math.max(metrics.actualBoundingBoxDescent, INK_DESCENT_EM * size),
    };
    cache.set(key, box);
    return box;
  };
}

/** `rising` cresceu acima do corte, `new` não tem base anterior, `steady` é todo o resto. */
type TermStatus = 'rising' | 'new' | 'steady';

interface RankedTerm {
  readonly term: TermChange;
  /** Variação contra o período anterior, ou `null` quando não há base. */
  readonly variation: number | null;
  readonly status: TermStatus;
}

interface Rect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

interface PlacedTerm extends RankedTerm {
  readonly size: number;
  readonly weight: number;
  /** Centro horizontal do conjunto, termo mais marca: o `<text>` ancora no meio. */
  readonly x: number;
  /** Linha de base do termo. */
  readonly y: number;
}

interface CloudLayout {
  /** Todos os termos com resposta, do maior para o menor: a ordem da lista em `sr-only`. */
  readonly ranked: readonly RankedTerm[];
  readonly placed: readonly PlacedTerm[];
  /** Termos que deram a volta inteira na espiral sem achar lugar. */
  readonly discarded: readonly RankedTerm[];
}

/** Variação relativa contra a base. Sem base, ausente ou zerada, não há variação: `null`, nunca 0. */
function variationOf(current: number, previous: number | null): number | null {
  if (previous === null || previous <= 0) return null;
  return (current - previous) / previous;
}

function statusOf(variation: number | null, growthCut: number): TermStatus {
  if (variation === null) return 'new';
  return variation > growthCut ? 'rising' : 'steady';
}

/** Fonte pela raiz quadrada do valor sobre o maior, sem deslocar o zero e com piso de leitura. */
function fontSizeFor(value: number, maxValue: number): number {
  if (maxValue <= 0) return MIN_FONT;
  return Math.max(MIN_FONT, Math.round(MAX_FONT * Math.sqrt(value / maxValue)));
}

/** Quanto a marca `novo` sobe para o topo dela alinhar com o topo do termo, em px. */
function tagRiseFor(size: number): number {
  return Math.max(0, INK_ASCENT_EM * (size - NEW_TAG_FONT));
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

/**
 * Espiral arquimediana a partir do centro do plano, esticada na horizontal pela proporção dele,
 * para a nuvem ocupar o retângulo e não um círculo. Devolve a caixa já com a folga, ou `null`
 * quando a espiral passa dos cantos do plano sem achar lugar.
 */
function findPlace(box: TextBox, taken: readonly Rect[]): Rect | null {
  const halfWidth = box.width / 2 + TERM_PADDING;
  const halfHeight = (box.ascent + box.descent) / 2 + TERM_PADDING;
  if (halfWidth * 2 > VIEW_WIDTH || halfHeight * 2 > VIEW_HEIGHT) return null;
  const centerX = VIEW_WIDTH / 2;
  const centerY = VIEW_HEIGHT / 2;
  const stretch = VIEW_WIDTH / VIEW_HEIGHT;
  const maxRadius = Math.hypot(centerY, centerY);
  let theta = 0;
  for (;;) {
    const radius = (SPIRAL_TURN_GAP * theta) / (2 * Math.PI);
    if (radius > maxRadius) return null;
    const x = centerX + stretch * radius * Math.cos(theta);
    const y = centerY + radius * Math.sin(theta);
    const rect: Rect = { left: x - halfWidth, top: y - halfHeight, right: x + halfWidth, bottom: y + halfHeight };
    const inside = rect.left >= 0 && rect.top >= 0 && rect.right <= VIEW_WIDTH && rect.bottom <= VIEW_HEIGHT;
    if (inside && !taken.some((other) => overlaps(rect, other))) return rect;
    // Passo de arco constante: o ângulo anda menos quanto mais longe do centro.
    theta += SPIRAL_ARC_STEP / Math.max(radius, SPIRAL_ARC_STEP);
  }
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function buildLayout(terms: readonly TermChange[], growthCut: number, measure: Measure): CloudLayout {
  // Desempate pelo `id`, em comparação de código: não depende do idioma do navegador.
  const ranked: RankedTerm[] = terms
    .filter((term) => term.current > 0)
    .sort((a, b) => b.current - a.current || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((term) => {
      const variation = variationOf(term.current, term.previous);
      return { term, variation, status: statusOf(variation, growthCut) };
    });
  const maxValue = ranked[0]?.term.current ?? 0;
  const taken: Rect[] = [];
  const drafts: PlacedTerm[] = [];
  const discarded: RankedTerm[] = [];
  for (const entry of ranked) {
    const size = fontSizeFor(entry.term.current, maxValue);
    const weight = entry.status === 'rising' ? RISING_WEIGHT : NEUTRAL_WEIGHT;
    // Toda caixa é medida no peso do destaque, o mais largo: assim o termo que cruza o corte de
    // um período para o outro muda de cor e de peso sem empurrar os vizinhos de lugar.
    const word = measure(entry.term.label, size, RISING_WEIGHT);
    // A marca `novo` entra na caixa do termo: os dois andam juntos e nada encosta nela.
    const tagWidth = entry.status === 'new' ? NEW_TAG_GAP + measure(NEW_TAG, NEW_TAG_FONT, NEW_TAG_WEIGHT).width : 0;
    const rect = findPlace({ ...word, width: word.width + tagWidth }, taken);
    if (rect === null) {
      discarded.push(entry);
      continue;
    }
    taken.push(rect);
    drafts.push({ ...entry, size, weight, x: (rect.left + rect.right) / 2, y: rect.top + TERM_PADDING + word.ascent });
  }
  if (taken.length === 0) return { ranked, placed: [], discarded };
  // A espiral nasce no centro do plano, mas a nuvem pronta não fica centrada nele: o
  // enquadramento final sai da caixa do conjunto, e nunca tira nenhum termo do plano.
  const left = Math.min(...taken.map((rect) => rect.left));
  const right = Math.max(...taken.map((rect) => rect.right));
  const top = Math.min(...taken.map((rect) => rect.top));
  const bottom = Math.max(...taken.map((rect) => rect.bottom));
  const shiftX = (VIEW_WIDTH - left - right) / 2;
  const shiftY = (VIEW_HEIGHT - top - bottom) / 2;
  const placed = drafts.map((draft) => ({ ...draft, x: round1(draft.x + shiftX), y: round1(draft.y + shiftY) }));
  return { ranked, placed, discarded };
}

/** Assinatura textual do dado: o layout só recalcula quando o CONTEÚDO muda, não o array. */
function signatureOf(terms: readonly TermChange[]): string {
  return terms.map((term) => `${term.id}:${term.label}=${String(term.current)}/${String(term.previous)}`).join('|');
}

/** A contagem nunca sai crua: leva o substantivo, no singular ou no plural (NUM-6). */
function countOf(value: number, singular: string, plural: string): string {
  return `${formatInt(value)} ${value === 1 ? singular : plural}`;
}

/** Sinal à mão sobre o valor absoluto (NUM-3); inteira a partir de 10%, uma casa abaixo (NUM-1). */
function formatVariation(variation: number): string {
  const sign = variation > 0 ? '+' : variation < 0 ? '−' : '';
  const size = Math.abs(variation);
  return `${sign}${formatPercent(size, size >= 0.1 ? 0 : 1)}`;
}

export default function RisingTermsWordCloud({
  data = defaultData,
  totalResponses = defaultTotalResponses,
  previousTotalResponses = defaultPreviousTotalResponses,
  periodLabel = defaultPeriodLabel,
  previousPeriodLabel = defaultPreviousPeriodLabel,
  growthCut = DEFAULT_GROWTH_CUT,
  height,
  className,
}: RisingTermsWordCloudProps) {
  const signature = signatureOf(data);
  const svgRef = useRef<SVGSVGElement>(null);
  const [measure, setMeasure] = useState<Measure>(() => estimateBox);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- a assinatura textual é a dependência real
  const layout = useMemo(() => buildLayout(data, growthCut, measure), [signature, growthCut, measure]);
  const isEmpty = layout.ranked.length === 0 || totalResponses <= 0;

  useLayoutEffect(() => {
    const node = svgRef.current;
    if (node === null || !('fonts' in document)) return undefined;
    // A família sai do estilo computado: é a do Farol, sem nome de fonte escrito aqui.
    const family = getComputedStyle(node).fontFamily;
    const font = `${String(RISING_WEIGHT)} ${String(MAX_FONT)}px ${family}`;
    const sample = signature;
    let alive = true;
    const adopt = () => {
      // Só troca a estimativa pela medida quando a face exata já carregou (GEO-8).
      if (!alive || !document.fonts.check(font, sample)) return;
      const measured = createCanvasMeasure(family);
      // O estado é uma função, então a troca vai pela forma de atualização, com o tipo escrito.
      if (measured !== null) setMeasure((current: Measure): Measure => (current === estimateBox ? measured : current));
    };
    adopt();
    // `load` pede a face e `ready` espera o que estiver em curso: sem os dois, a fonte que chega
    // depois da montagem não refaz o layout e a nuvem fica para sempre na estimativa.
    void document.fonts
      .load(font, sample)
      .then(() => document.fonts.ready)
      .then(adopt, () => undefined);
    return () => {
      alive = false;
    };
  }, [isEmpty, signature]);

  const style = height === undefined ? undefined : { height };

  if (isEmpty) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum motivo de perda escrito neste recorte: não há termos para comparar.</span>
      </div>
    );
  }

  const cutLabel = formatPercent(growthCut, 0);
  const rising = layout.ranked.filter((entry) => entry.status === 'rising');
  const newCount = layout.ranked.filter((entry) => entry.status === 'new').length;
  // A lista vem ordenada pelo período atual, então o primeiro em alta é o mais citado deles.
  const topRising = rising[0];
  const topRisingChange =
    topRising && topRising.variation !== null && topRising.term.previous !== null
      ? `${formatVariation(topRising.variation)} contra ${countOf(topRising.term.previous, 'resposta', 'respostas')}`
      : '';
  const risingCount = countOf(rising.length, 'termo subiu', 'termos subiram');
  const discardedCount = layout.discarded.length;
  const discardedIds = new Set(layout.discarded.map((entry) => entry.term.id));

  /** O que a dica e a lista dizem de um termo: as duas contagens e a variação com a base nomeada. */
  const describe = ({ term, variation }: RankedTerm): string => {
    const now = `${countOf(term.current, 'resposta', 'respostas')} de ${formatInt(totalResponses)} (${periodLabel})`;
    if (variation === null || term.previous === null) {
      return `${term.label}: ${now}. Novo: nenhuma das ${formatInt(previousTotalResponses)} respostas anteriores cita o termo (${previousPeriodLabel}), então não há variação a calcular.`;
    }
    const before = `${countOf(term.previous, 'resposta', 'respostas')} de ${formatInt(previousTotalResponses)} (${previousPeriodLabel})`;
    return `${term.label}: ${now}, ${formatVariation(variation)} contra ${before}.`;
  };

  const summary = [
    `Nuvem de palavras com ${countOf(layout.placed.length, 'termo', 'termos')} de ${formatInt(totalResponses)} motivos de perda, ${periodLabel}.`,
    topRising
      ? `${risingCount} mais de ${cutLabel} contra o período anterior; lidera ${topRising.term.label}, ${topRisingChange}.`
      : `Nenhum termo subiu mais de ${cutLabel} contra o período anterior.`,
    newCount > 0 ? `${countOf(newCount, 'termo é novo', 'termos são novos')}, sem base para variação.` : '',
    discardedCount > 0 ? `${countOf(discardedCount, 'termo ficou', 'termos ficaram')} fora da nuvem.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('relative flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {topRising ? (
          <>
            <span className="font-semibold tabular-nums" style={{ color: 'var(--chart-1)' }}>
              {risingCount}
            </span>{' '}
            mais de <span className="tabular-nums">{cutLabel}</span>. Lidera{' '}
            <span className="font-semibold" style={{ color: 'var(--chart-1)' }}>
              {topRising.term.label}
            </span>
            : <span className="tabular-nums text-text-primary">{topRisingChange}</span> ({previousPeriodLabel}).
          </>
        ) : (
          <>
            Nenhum termo subiu mais de <span className="tabular-nums">{cutLabel}</span> contra o período anterior ({previousPeriodLabel}).
          </>
        )}
      </p>
      <div className="min-h-0 flex-1">
        <svg aria-hidden className="h-full w-full" ref={svgRef} viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
          {layout.placed.map((entry) => (
            <g key={entry.term.id}>
              {/* A dica acrescenta o que a nuvem não escreve: as duas contagens e a variação. */}
              <title>{describe(entry)}</title>
              <text
                fill={entry.status === 'rising' ? 'var(--chart-1)' : 'var(--text-muted)'}
                fontSize={entry.size}
                fontWeight={entry.weight}
                textAnchor="middle"
                x={entry.x}
                y={entry.y}
              >
                {entry.term.label}
                {entry.status === 'new' ? (
                  <tspan dx={NEW_TAG_GAP} dy={-tagRiseFor(entry.size)} fill="var(--text-primary)" fontSize={NEW_TAG_FONT} fontWeight={NEW_TAG_WEIGHT}>
                    {NEW_TAG}
                  </tspan>
                ) : null}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {/* Lista equivalente para leitor de tela: todos os termos, na ordem do peso, com a variação. */}
      {/* Cada item também é `sr-only`: empilhados em fluxo, eles passariam da área do corpo. O
          recuo de 50% tira do canto o pixel que a margem negativa da classe desloca. */}
      <ol className="sr-only left-1/2 top-1/2">
        {layout.ranked.map((entry) => (
          <li className="sr-only" key={entry.term.id}>{`${describe(entry)}${discardedIds.has(entry.term.id) ? ' Fora da nuvem.' : ''}`}</li>
        ))}
      </ol>
      {/* Duas linhas fixas: a primeira é a legenda do destaque e da marca, a segunda o método. */}
      <div className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        <p>
          <span className="font-semibold" style={{ color: 'var(--chart-1)' }}>
            Em destaque
          </span>
          : alta acima de <span className="tabular-nums">{cutLabel}</span>.{' '}
          <span className="font-semibold text-text-primary">{NEW_TAG}</span>: sem resposta no período anterior, fora da variação.
        </p>
        <p className="tabular-nums">
          {discardedCount > 0
            ? `${countOf(discardedCount, 'termo', 'termos')} fora da nuvem por falta de espaço.`
            : 'Tamanho pela raiz quadrada das respostas.'}{' '}
          {periodLabel} contra {previousPeriodLabel}.
        </p>
      </div>
    </div>
  );
}
