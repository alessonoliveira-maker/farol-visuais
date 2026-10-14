import { Filter } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  periodLabel as defaultPeriodLabel,
  totalResponses as defaultTotalResponses,
  type LossTerm,
} from './data';

/**
 * Nuvem de palavras em espiral: cada termo dos motivos de perda sai com a fonte proporcional à raiz
 * quadrada das respostas que o citam, para dar o assunto do trimestre de relance. O layout é todo
 * calculado aqui, em SVG puro, e é determinístico:
 *
 * 1. Os termos entram do maior para o menor, com empate resolvido pelo `id`.
 * 2. A fonte vem de `MAX_FONT × √(respostas ÷ maior)`, com piso em `MIN_FONT`: raiz quadrada porque
 *    a área da palavra cresce com o quadrado da fonte, e sem deslocar o zero.
 * 3. Cada termo caminha por uma espiral arquimediana a partir do centro, esticada na proporção do
 *    plano, até a caixa dele não encostar em nenhuma já posicionada nem sair do plano.
 * 4. Quem dá a volta inteira sem achar lugar fica fora da nuvem, e a nota conta quantos ficaram.
 *
 * A caixa de cada termo é medida com `measureText`, e só depois de `document.fonts` confirmar a
 * face (GEO-8); até lá vale a soma por glifo, que superestima de propósito. A lista ordenada em
 * `sr-only` entrega os mesmos termos, com o valor, a quem não vê o desenho.
 */
export interface LossReasonsWordCloudProps {
  readonly data?: readonly LossTerm[];
  /** Respostas do recorte: o denominador da taxa de citação. */
  readonly totalResponses?: number;
  /** Período do recorte, como se escreve na tela. */
  readonly periodLabel?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Plano do layout, do tamanho do corpo medido para a escala do `<svg>` sair 1 (GEO-18): 574 px de
 * largura do cartão e 176 px de altura, que é o corpo de 225 px do canvas `card` menos a linha de
 * leitura (24 px) e a nota (24,5 px). Em outro tamanho de cartão, troque o plano pelo corpo medido
 * do destino, por ponto de quebra, e nunca a cada redimensionamento: a nuvem trocaria de lugar.
 */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 176;
const MIN_FONT = 12;
const MAX_FONT = 48;
const TERM_WEIGHT = 600;
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

interface Rect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

interface PlacedTerm {
  readonly term: LossTerm;
  readonly size: number;
  /** Centro horizontal da palavra: o `<text>` ancora no meio. */
  readonly x: number;
  /** Linha de base da palavra. */
  readonly y: number;
}

interface CloudLayout {
  /** Todos os termos com resposta, do maior para o menor: a ordem da lista em `sr-only`. */
  readonly ranked: readonly LossTerm[];
  readonly placed: readonly PlacedTerm[];
  /** Termos que deram a volta inteira na espiral sem achar lugar. */
  readonly discarded: readonly LossTerm[];
}

/** Fonte pela raiz quadrada do valor sobre o maior, sem deslocar o zero e com piso de leitura. */
function fontSizeFor(value: number, maxValue: number): number {
  if (maxValue <= 0) return MIN_FONT;
  return Math.max(MIN_FONT, Math.round(MAX_FONT * Math.sqrt(value / maxValue)));
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

function buildLayout(terms: readonly LossTerm[], measure: Measure): CloudLayout {
  // Desempate pelo `id`, em comparação de código: não depende do idioma do navegador.
  const ranked = terms
    .filter((term) => term.responses > 0)
    .sort((a, b) => b.responses - a.responses || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const maxValue = ranked[0]?.responses ?? 0;
  const taken: Rect[] = [];
  const drafts: PlacedTerm[] = [];
  const discarded: LossTerm[] = [];
  for (const term of ranked) {
    const size = fontSizeFor(term.responses, maxValue);
    const box = measure(term.label, size, TERM_WEIGHT);
    const rect = findPlace(box, taken);
    if (rect === null) {
      discarded.push(term);
      continue;
    }
    taken.push(rect);
    drafts.push({ term, size, x: (rect.left + rect.right) / 2, y: rect.top + TERM_PADDING + box.ascent });
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
function signatureOf(terms: readonly LossTerm[]): string {
  return terms.map((term) => `${term.id}:${term.label}=${String(term.responses)}`).join('|');
}

/** A contagem nunca sai crua: leva o substantivo, no singular ou no plural (NUM-6). */
function countOf(value: number, singular: string, plural: string): string {
  return `${formatInt(value)} ${value === 1 ? singular : plural}`;
}

export default function LossReasonsWordCloud({
  data = defaultData,
  totalResponses = defaultTotalResponses,
  periodLabel = defaultPeriodLabel,
  height,
  className,
}: LossReasonsWordCloudProps) {
  const signature = signatureOf(data);
  const svgRef = useRef<SVGSVGElement>(null);
  const [measure, setMeasure] = useState<Measure>(() => estimateBox);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- a assinatura textual é a dependência real
  const layout = useMemo(() => buildLayout(data, measure), [signature, measure]);
  const isEmpty = layout.ranked.length === 0 || totalResponses <= 0;

  useLayoutEffect(() => {
    const node = svgRef.current;
    if (node === null || !('fonts' in document)) return undefined;
    // A família sai do estilo computado: é a do Farol, sem nome de fonte escrito aqui.
    const family = getComputedStyle(node).fontFamily;
    const font = `${String(TERM_WEIGHT)} ${String(MAX_FONT)}px ${family}`;
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
        <span>Nenhum motivo de perda escrito neste recorte: não há termos para a nuvem.</span>
      </div>
    );
  }

  const [leader, second, third] = layout.ranked;
  const leaderRate = leader ? formatRateWithVolume(leader.responses, totalResponses) : '';
  const discardedCount = layout.discarded.length;
  const largestDiscarded = layout.discarded[0];
  const discardedIds = new Set(layout.discarded.map((term) => term.id));

  const summary = [
    `Nuvem de palavras com ${countOf(layout.placed.length, 'termo', 'termos')} de ${formatInt(totalResponses)} motivos de perda, ${periodLabel}.`,
    leader ? `O mais citado é ${leader.label}: ${leaderRate} das respostas.` : '',
    second && third ? `Depois vêm ${second.label} e ${third.label}.` : '',
    discardedCount > 0 ? `${countOf(discardedCount, 'termo ficou', 'termos ficaram')} fora da nuvem por falta de espaço.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('relative flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {leader ? (
          <>
            {periodLabel}: o termo mais citado é <span className="font-semibold text-text-primary">{leader.label}</span>, em{' '}
            <span className="tabular-nums text-text-primary">{leaderRate}</span> das respostas.
          </>
        ) : null}
      </p>
      <div className="min-h-0 flex-1">
        <svg aria-hidden className="h-full w-full" ref={svgRef} viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
          {layout.placed.map(({ term, size, x, y }) => (
            <g key={term.id}>
              {/* A dica acrescenta o que a nuvem não escreve: a taxa com o volume e as ocorrências. */}
              <title>
                {`${term.label}: ${formatRateWithVolume(term.responses, totalResponses)} das respostas, ${countOf(term.occurrences, 'ocorrência', 'ocorrências')}`}
              </title>
              <text fill="var(--text-secondary)" fontSize={size} fontWeight={TERM_WEIGHT} textAnchor="middle" x={x} y={y}>
                {term.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {/* Lista equivalente para leitor de tela: todos os termos, na ordem do peso, com o valor. */}
      {/* Cada item também é `sr-only`: empilhados em fluxo, eles passariam da área do corpo. O
          recuo de 50% tira do canto o pixel que a margem negativa da classe desloca. */}
      <ol className="sr-only left-1/2 top-1/2">
        {layout.ranked.map((term) => (
          <li className="sr-only" key={term.id}>
            {`${term.label}: ${countOf(term.responses, 'resposta', 'respostas')}${discardedIds.has(term.id) ? ', fora da nuvem' : ''}`}
          </li>
        ))}
      </ol>
      <p className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        Tamanho pela raiz quadrada das respostas.
        {largestDiscarded ? (
          <span title={layout.discarded.map((term) => term.label).join(', ')}>
            {` ${countOf(discardedCount, 'termo', 'termos')} fora da nuvem, o maior com ${countOf(largestDiscarded.responses, 'resposta', 'respostas')}.`}
          </span>
        ) : null}
      </p>
    </div>
  );
}
