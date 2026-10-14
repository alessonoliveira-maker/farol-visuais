import { Filter, TriangleAlert } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { formatInt, formatMonthShort, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, period as defaultPeriod, totalResponses as defaultTotalResponses, type IntakeTerm } from './data';

/**
 * Nuvem de palavras que sabe quando não ser nuvem. A mesma função de layout, `buildLayout`, olha a
 * contagem do recorte e devolve um de três desenhos:
 *
 * 1. `empty`: nenhum termo com resposta. A peça dá lugar ao estado vazio, com `role="status"`.
 * 2. `list`: menos de `MIN_RESPONSES` respostas ou menos de `MIN_TERMS` termos. Com tão pouco, o
 *    tamanho da fonte inventaria um padrão que a amostra não sustenta, então os termos saem em
 *    lista ordenada, com a posição, a contagem e o aviso de amostra pequena.
 * 3. `cloud`: a espiral determinística, com a fonte pela raiz quadrada das respostas e um teto
 *    para termo longo. O termo que passaria de `MAX_TERM_WIDTH_SHARE` da largura do plano tem a
 *    fonte reduzida até caber, e como aí o tamanho deixa de dizer o valor, a dica e a nota trazem
 *    o número exato e o tamanho que o valor pediria.
 *
 * O dado publicado tem 22 respostas e 9 termos: ele exercita o caminho da lista, e é esse que o
 * preview fotografa. O caminho da nuvem responde a qualquer recorte acima dos dois mínimos.
 */
export interface IntakeTermsCloudProps {
  readonly data?: readonly IntakeTerm[];
  /** Respostas com texto no recorte: o denominador, e a contagem que decide entre nuvem e lista. */
  readonly totalResponses?: number;
  /** Mês do recorte, em `YYYY-MM`. */
  readonly period?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Abaixo de qualquer um dos dois mínimos a peça desenha a lista, e não a nuvem. */
const MIN_RESPONSES = 30;
const MIN_TERMS = 15;
/** Colunas da lista ordenada, lidas de cima para baixo. */
const LIST_COLUMNS = 2;
/**
 * Plano da nuvem, do tamanho do corpo medido para a escala do `<svg>` sair 1 (GEO-18): 574 px de
 * largura do cartão e 160 px de altura, que é o corpo de 225 px do canvas `card` menos a linha de
 * leitura (24 px) e a nota de até duas linhas (41 px).
 */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 160;
const MIN_FONT = 12;
const MAX_FONT = 48;
const TERM_WEIGHT = 600;
/** Teto de largura de um termo, em fração do plano: acima disso a fonte encolhe até caber. */
const MAX_TERM_WIDTH_SHARE = 0.5;
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

interface RankedTerm {
  readonly term: IntakeTerm;
  /** Posição com empate: termos de mesma contagem dividem a posição, e a seguinte pula. */
  readonly rank: number;
}

interface Rect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

interface PlacedTerm extends RankedTerm {
  readonly size: number;
  /** Tamanho que o valor pediria: maior que `size` quando o teto de largura atuou. */
  readonly nominalSize: number;
  /** Centro horizontal da palavra: o `<text>` ancora no meio. */
  readonly x: number;
  /** Linha de base da palavra. */
  readonly y: number;
}

/** O que a peça desenha, decidido pela contagem do recorte e não por quem chama. */
type PieceLayout =
  | { readonly mode: 'empty' }
  | { readonly mode: 'list'; readonly ranked: readonly RankedTerm[] }
  | {
      readonly mode: 'cloud';
      readonly ranked: readonly RankedTerm[];
      readonly placed: readonly PlacedTerm[];
      /** Termos que deram a volta inteira na espiral sem achar lugar. */
      readonly discarded: readonly RankedTerm[];
    };

/** Do maior para o menor, com empate dividindo a posição (1º, 2º, 3º, 3º, 5º). */
function rankTerms(terms: readonly IntakeTerm[]): RankedTerm[] {
  // Desempate da ordem pelo `id`, em comparação de código: não depende do idioma do navegador.
  const sorted = terms
    .filter((term) => term.responses > 0)
    .sort((a, b) => b.responses - a.responses || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  let rank = 0;
  return sorted.map((term, index) => {
    if (sorted[index - 1]?.responses !== term.responses) rank = index + 1;
    return { term, rank };
  });
}

/** Fonte pela raiz quadrada do valor sobre o maior, sem deslocar o zero e com piso de leitura. */
function fontSizeFor(value: number, maxValue: number): number {
  if (maxValue <= 0) return MIN_FONT;
  return Math.max(MIN_FONT, Math.round(MAX_FONT * Math.sqrt(value / maxValue)));
}

/**
 * Teto para termo longo: o maior tamanho, até o nominal, em que a largura do termo fica dentro de
 * `MAX_TERM_WIDTH_SHARE` do plano. A largura cresce em linha com a fonte, então a regra de três
 * basta; o piso de leitura vence o teto, e aí quem não couber no plano é descartado e contado.
 */
function cappedSizeFor(label: string, nominalSize: number, measure: Measure): number {
  const limit = VIEW_WIDTH * MAX_TERM_WIDTH_SHARE;
  const width = measure(label, nominalSize, TERM_WEIGHT).width;
  if (width <= limit) return nominalSize;
  return Math.max(MIN_FONT, Math.floor((nominalSize * limit) / width));
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

/** A função única de layout: decide entre vazio, lista e nuvem, e só então posiciona. */
function buildLayout(terms: readonly IntakeTerm[], totalResponses: number, measure: Measure): PieceLayout {
  const ranked = rankTerms(terms);
  if (ranked.length === 0 || totalResponses <= 0) return { mode: 'empty' };
  if (totalResponses < MIN_RESPONSES || ranked.length < MIN_TERMS) return { mode: 'list', ranked };

  const maxValue = ranked[0]?.term.responses ?? 0;
  const taken: Rect[] = [];
  const drafts: PlacedTerm[] = [];
  const discarded: RankedTerm[] = [];
  for (const entry of ranked) {
    const nominalSize = fontSizeFor(entry.term.responses, maxValue);
    const size = cappedSizeFor(entry.term.label, nominalSize, measure);
    const box = measure(entry.term.label, size, TERM_WEIGHT);
    const rect = findPlace(box, taken);
    if (rect === null) {
      discarded.push(entry);
      continue;
    }
    taken.push(rect);
    drafts.push({ ...entry, size, nominalSize, x: (rect.left + rect.right) / 2, y: rect.top + TERM_PADDING + box.ascent });
  }
  if (taken.length === 0) return { mode: 'cloud', ranked, placed: [], discarded };
  // A espiral nasce no centro do plano, mas a nuvem pronta não fica centrada nele: o
  // enquadramento final sai da caixa do conjunto, e nunca tira nenhum termo do plano.
  const left = Math.min(...taken.map((rect) => rect.left));
  const right = Math.max(...taken.map((rect) => rect.right));
  const top = Math.min(...taken.map((rect) => rect.top));
  const bottom = Math.max(...taken.map((rect) => rect.bottom));
  const shiftX = (VIEW_WIDTH - left - right) / 2;
  const shiftY = (VIEW_HEIGHT - top - bottom) / 2;
  const placed = drafts.map((draft) => ({ ...draft, x: round1(draft.x + shiftX), y: round1(draft.y + shiftY) }));
  return { mode: 'cloud', ranked, placed, discarded };
}

/** Assinatura textual do dado: o layout só recalcula quando o CONTEÚDO muda, não o array. */
function signatureOf(terms: readonly IntakeTerm[]): string {
  return terms.map((term) => `${term.id}:${term.label}=${String(term.responses)}`).join('|');
}

/** A contagem nunca sai crua: leva o substantivo, no singular ou no plural (NUM-6). */
function countOf(value: number, singular: string, plural: string): string {
  return `${formatInt(value)} ${value === 1 ? singular : plural}`;
}

function responsesOf(value: number): string {
  return countOf(value, 'resposta', 'respostas');
}

export default function IntakeTermsCloud({
  data = defaultData,
  totalResponses = defaultTotalResponses,
  period = defaultPeriod,
  height,
  className,
}: IntakeTermsCloudProps) {
  const signature = signatureOf(data);
  const svgRef = useRef<SVGSVGElement>(null);
  const [measure, setMeasure] = useState<Measure>(() => estimateBox);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- a assinatura textual é a dependência real
  const layout = useMemo(() => buildLayout(data, totalResponses, measure), [signature, totalResponses, measure]);
  const isCloud = layout.mode === 'cloud';

  useLayoutEffect(() => {
    const node = svgRef.current;
    // Só a nuvem mede texto: na lista e no vazio não há `<svg>` e o efeito não faz nada.
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
  }, [isCloud, signature]);

  const style = height === undefined ? undefined : { height };
  const month = formatMonthShort(period);

  if (layout.mode === 'empty') {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma resposta com texto em {month}: não há termos para listar nem para a nuvem.</span>
      </div>
    );
  }

  const [leader, second] = layout.ranked;
  const termCount = countOf(layout.ranked.length, 'termo', 'termos');

  if (layout.mode === 'list') {
    const rows = Math.ceil(layout.ranked.length / LIST_COLUMNS);
    const summary = [
      `Lista ordenada de ${termCount} em ${responsesOf(totalResponses)} de pré-vendas, ${month}.`,
      `Amostra pequena para a nuvem, que pede ${formatInt(MIN_RESPONSES)} respostas e ${formatInt(MIN_TERMS)} termos.`,
      leader ? `Lidera ${leader.term.label}, com ${responsesOf(leader.term.responses)}.` : '',
      second ? `Depois vem ${second.term.label}, com ${responsesOf(second.term.responses)}.` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
        <p className="mb-3 flex shrink-0 items-start gap-2 text-xs tabular-nums text-text-secondary">
          <TriangleAlert aria-hidden className="mt-px size-4 shrink-0 text-warning" />
          <span>
            <span className="font-semibold text-warning">Amostra pequena em {month}.</span> São {responsesOf(totalResponses)} e {termCount}:
            abaixo de {formatInt(MIN_RESPONSES)} respostas ou de {formatInt(MIN_TERMS)} termos o tamanho da palavra inventaria padrão, então
            os termos vão em lista ordenada.
          </span>
        </p>
        {/* Duas colunas lidas de cima para baixo: a posição escrita em cada linha dá a ordem. Cada
            coluna tem a largura do próprio conteúdo, para o termo longo caber inteiro numa linha;
            o piso zero deixa a coluna ceder, e aí o nome quebra em vez de ser cortado (TIP-7). */}
        <ol
          className="grid grid-flow-col justify-start gap-x-10 gap-y-3"
          style={{ gridTemplateColumns: `repeat(${String(LIST_COLUMNS)}, minmax(0, max-content))`, gridTemplateRows: `repeat(${String(rows)}, auto)` }}
        >
          {layout.ranked.map(({ term, rank }) => (
            <li className="flex min-w-0 items-baseline gap-2" key={term.id}>
              <span className="w-6 shrink-0 text-right font-display text-xs text-text-muted">{formatInt(rank)}º</span>
              <span className={cn('min-w-0 text-sm text-text-primary', rank === 1 && 'font-semibold')}>{term.label}</span>
              <span className="ml-auto shrink-0 pl-4 font-display text-xs text-text-secondary">{responsesOf(term.responses)}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const leaderRate = leader ? formatRateWithVolume(leader.term.responses, totalResponses) : '';
  // Quem teve a fonte reduzida pelo teto: o tamanho deles deixou de dizer o valor.
  const capped = layout.placed.filter((entry) => entry.size < entry.nominalSize);
  const firstCapped = capped[0];
  const discardedCount = layout.discarded.length;
  const discardedIds = new Set(layout.discarded.map((entry) => entry.term.id));

  const summary = [
    `Nuvem de palavras com ${countOf(layout.placed.length, 'termo', 'termos')} de ${responsesOf(totalResponses)} de pré-vendas, ${month}.`,
    leader ? `O mais citado é ${leader.term.label}: ${leaderRate} das respostas.` : '',
    firstCapped ? `${countOf(capped.length, 'termo longo', 'termos longos')} com a fonte limitada para caber.` : '',
    discardedCount > 0 ? `${countOf(discardedCount, 'termo ficou', 'termos ficaram')} fora da nuvem.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('relative flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {leader ? (
          <>
            {month}: o termo mais citado é <span className="font-semibold text-text-primary">{leader.term.label}</span>, em{' '}
            <span className="tabular-nums text-text-primary">{leaderRate}</span> das respostas.
          </>
        ) : null}
      </p>
      <div className="min-h-0 flex-1">
        <svg aria-hidden className="h-full w-full" ref={svgRef} viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
          {layout.placed.map(({ term, size, nominalSize, x, y }) => (
            <g key={term.id}>
              {/* A dica traz o valor exato, e no termo com teto diz também o tamanho que ele pediria. */}
              <title>
                {`${term.label}: ${formatRateWithVolume(term.responses, totalResponses)} das respostas.${
                  size < nominalSize ? ` Fonte limitada a ${formatInt(size)} px para caber; o valor pediria ${formatInt(nominalSize)} px.` : ''
                }`}
              </title>
              {/* Termo com teto sai em `--text-primary`: o segundo canal avisa que o tamanho não vale. */}
              <text
                fill={size < nominalSize ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={size}
                fontWeight={TERM_WEIGHT}
                textAnchor="middle"
                x={x}
                y={y}
              >
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
        {layout.ranked.map(({ term }) => (
          <li className="sr-only" key={term.id}>{`${term.label}: ${responsesOf(term.responses)}${discardedIds.has(term.id) ? ', fora da nuvem' : ''}`}</li>
        ))}
      </ol>
      <div className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        <p>
          Tamanho pela raiz quadrada das respostas.
          {discardedCount > 0 ? ` ${countOf(discardedCount, 'termo', 'termos')} fora da nuvem por falta de espaço.` : ''}
        </p>
        {firstCapped ? (
          <p>
            Em destaque, fonte limitada para caber: <span className="font-semibold text-text-primary">{firstCapped.term.label}</span> (
            {responsesOf(firstCapped.term.responses)}){capped.length > 1 ? ` e mais ${countOf(capped.length - 1, 'termo', 'termos')}` : ''}.
          </p>
        ) : null}
      </div>
    </div>
  );
}
