import { Filter } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { formatInt, formatMonthShort, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, period as defaultPeriod, rootWord as defaultRootWord, type ObjectionOutcome } from './data';

/**
 * Árvore de palavras de sufixo com o desfecho no fim do ramo: cada folha escreve a parcela das
 * ligações daquele ramo cuja oportunidade foi perdida depois, e até dois ramos com maioria perdida
 * acendem. Apoia a revisão de roteiro da pré-vendas: mostra em quais continuações insistir menos.
 *
 * A trie, a poda e a fusão de cadeia são as da árvore simples (`buildTree`), com um número a mais
 * por nó: as ligações perdidas. Um ramo é o caminho da raiz até uma folha. A regra de destaque
 * (`pickHighlights`) é uma só e vai escrita na nota do rodapé: parcela perdida acima de
 * `MAJORITY_SHARE`, pelo menos `MIN_HIGHLIGHT_VOLUME` ligações no ramo e, entre os que passam, os
 * `MAX_HIGHLIGHTS` de maior parcela. Metade exata não é maioria, e maioria em ramo pequeno não
 * acende: a parcela continua escrita, sem destaque.
 *
 * O destaque não depende só da cor (COR-2, ACE-2): a folha vai em `--chart-1` e peso 700, a
 * parcela em `--chart-1` e peso 600, e o conector do caminho inteiro, da raiz à folha, engrossa de
 * `CONNECTOR_STROKE` para `HIGHLIGHT_STROKE`. As palavras do meio do caminho ficam neutras, porque
 * levam também a ramos sem maioria. Peso 700 só nas folhas destacadas, que são no máximo duas
 * (TIP-3); por isso a raiz usa 600.
 *
 * Tamanho da palavra, posição, medida de largura e escala seguem a árvore simples: raiz quadrada
 * da parcela de ligações com piso de `FONT_MIN`, Y pelas folhas com o pai no meio dos filhos, X
 * pela largura medida no Canvas depois que a face carregou (GEO-8) e `<svg>` com largura e altura
 * iguais ao `viewBox`, na largura do corpo, para a escala sair 1 (GEO-18).
 */
export interface OutcomeWordTreeProps {
  readonly data?: readonly ObjectionOutcome[];
  /** Palavra raiz; a comparação é pela chave sem acento e em minúsculas. */
  readonly rootWord?: string;
  /** Primeiro e último mês das ligações, em `YYYY-MM`. */
  readonly period?: { readonly start: string; readonly end: string };
  readonly height?: number;
  readonly className?: string;
}

/** Largura do corpo no canvas de 640 px com moldura card (640 menos 66): escala 1 (GEO-18). */
const VIEW_W = 574;
const PAD_X = 4;
const PAD_Y = 6;
/** Contagem mínima de ligações para um ramo entrar na árvore. */
const MIN_COUNT = 3;
/** Quantas palavras depois da raiz a trie guarda. */
const MAX_DEPTH = 3;
const FONT_MAX = 36;
const FONT_MIN = 13;
const COUNT_FONT = 11;
/** A raiz fica em 600: o peso 700 é só das folhas destacadas, no máximo duas (TIP-3). */
const ROOT_WEIGHT = 600;
const WORD_WEIGHT = 500;
const HIGHLIGHT_WEIGHT = 700;
const MEASURED_WEIGHTS = [WORD_WEIGHT, ROOT_WEIGHT, HIGHLIGHT_WEIGHT] as const;
/** Regra de destaque: parcela perdida acima da metade, com volume, e só os de maior parcela. */
const MAJORITY_SHARE = 0.5;
const MIN_HIGHLIGHT_VOLUME = 8;
const MAX_HIGHLIGHTS = 2;
/** Altura da linha de uma folha: o piso serve a palavra de 13 px, e a maior pede 1,5 vez o corpo. */
const ROW_MIN = 22;
const ROW_FACTOR = 1.5;
/** Vão entre o fim da palavra e o começo das filhas: cresce com o espalhamento vertical delas. */
const GAP_MIN = 32;
const GAP_MAX = 64;
const GAP_SPREAD_RATIO = 0.22;
const CONNECTOR_PAD = 5;
const CONNECTOR_STROKE = 1.5;
const HIGHLIGHT_STROKE = 3;
const COUNT_GAP = 8;

type Measure = (text: string, fontPx: number, weight: number) => number;

/** Avanço por glifo de Manrope, em em: a tabela do dossiê, a mesma da guarda de colisão. */
const GLYPH_EM: Readonly<Record<string, number>> = {
  ' ': 0.216, '-': 0.433, a: 0.567, b: 0.632, c: 0.526, d: 0.599, e: 0.593, f: 0.382, g: 0.579,
  h: 0.587, i: 0.257, j: 0.227, k: 0.667, l: 0.243, m: 0.822, n: 0.607, o: 0.605, p: 0.58,
  q: 0.543, r: 0.351, s: 0.53, t: 0.394, u: 0.623, v: 0.457, w: 0.625, x: 0.464, y: 0.702,
  z: 0.516, á: 0.558, â: 0.497, ã: 0.58, ç: 0.536, é: 0.574, ê: 0.618, í: 0.217, ó: 0.641,
  õ: 0.525, ú: 0.603,
};
/** Glifo fora da tabela (maiúscula, dígito) entra pelo teto, para a estimativa errar para mais. */
const GLYPH_DEFAULT_EM = 0.7;
/** Pesos 600 e 700 alargam o glifo; o fator também erra para mais. */
const HEAVY_WEIGHT_FACTOR = 1.06;
const ESTIMATE_SLACK_PX = 2;
/** Dígito tabular de Space Grotesk mede 0,62 em: serve só para reservar a largura da contagem. */
const COUNT_CHAR_EM = 0.62;

/** Soma por glifo, para mais: vale enquanto a fonte não carregou (GEO-8). */
const estimateWidth: Measure = (text, fontPx, weight) => {
  let em = 0;
  for (const char of text) em += GLYPH_EM[char] ?? GLYPH_DEFAULT_EM;
  return em * fontPx * (weight >= 600 ? HEAVY_WEIGHT_FACTOR : 1) + ESTIMATE_SLACK_PX;
};

function createCanvasMeasure(family: string): Measure | null {
  const context = document.createElement('canvas').getContext('2d');
  if (context === null) return null;
  const cache = new Map<string, number>();
  return (text, fontPx, weight) => {
    const key = `${String(weight)}|${String(fontPx)}|${text}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    context.font = `${String(weight)} ${String(fontPx)}px ${family}`;
    const width = context.measureText(text).width;
    cache.set(key, width);
    return width;
  };
}

/** Devolve a estimativa por glifo e troca pela medida do Canvas quando as faces já carregaram. */
function useTextMeasure(anchor: { readonly current: HTMLElement | null }, sample: string): Measure {
  const [measure, setMeasure] = useState<Measure>(() => estimateWidth);
  useLayoutEffect(() => {
    const node = anchor.current;
    if (node === null || !('fonts' in document)) return undefined;
    // A família sai do estilo computado: é a do Farol, sem nome de fonte escrito aqui.
    const family = getComputedStyle(node).fontFamily;
    const faces = MEASURED_WEIGHTS.map((weight) => `${String(weight)} ${String(FONT_MAX)}px ${family}`);
    let alive = true;
    const adopt = () => {
      // Só confia no Canvas quando as faces exatas já carregaram (GEO-8).
      if (!alive || !faces.every((face) => document.fonts.check(face, sample))) return;
      const measured = createCanvasMeasure(family);
      // O estado é uma função, então a troca vai pela forma de atualização, com o tipo escrito.
      if (measured !== null) setMeasure((current: Measure): Measure => (current === estimateWidth ? measured : current));
    };
    adopt();
    // `load` pede a face e `ready` espera o que estiver em curso: sem os dois, a fonte que chega
    // depois da montagem não refaz o layout e a árvore fica para sempre na estimativa.
    void Promise.all(faces.map((face) => document.fonts.load(face, sample)))
      .then(() => document.fonts.ready)
      .then(adopt, () => undefined);
    return () => {
      alive = false;
    };
  }, [anchor, sample]);
  return measure;
}

interface Token {
  readonly key: string;
  readonly form: string;
}

/** Chave de comparação: sem acento e em minúsculas, para não, nao e Não caírem no mesmo nó. */
function normalizeKey(word: string): string {
  return word.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function tokenize(text: string): Token[] {
  return (text.match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu) ?? []).map((form) => ({ key: normalizeKey(form), form }));
}

interface TrieNode {
  readonly key: string;
  readonly children: Map<string, TrieNode>;
  count: number;
  lost: number;
}

interface Branch {
  readonly id: string;
  readonly label: string;
  /** Ligações que passam pelo nó. */
  readonly count: number;
  /** Dessas, as que tiveram a oportunidade perdida depois. */
  readonly lost: number;
  readonly children: readonly Branch[];
}

interface Tree {
  readonly rootLabel: string;
  /** Ligações cuja frase contém a raiz, e quantas delas foram perdidas. */
  readonly rootCount: number;
  readonly rootLost: number;
  /** Todas as ligações do recorte, com ou sem a raiz. */
  readonly callTotal: number;
  readonly branches: readonly Branch[];
  /** Ramos que a poda tirou, em qualquer nível. */
  readonly omittedBranches: number;
}

/** Filhos do maior para o menor; no empate, a ordem da chave, para o desenho não depender da entrada. */
function byCount(children: Map<string, TrieNode>): TrieNode[] {
  return [...children.values()].sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : 1));
}

function buildTree(phrases: readonly ObjectionOutcome[], rootWord: string): Tree {
  const rootKey = normalizeKey(rootWord);
  const forms = new Map<string, Map<string, number>>();
  const root: TrieNode = { key: rootKey, children: new Map(), count: 0, lost: 0 };
  let callTotal = 0;
  for (const phrase of phrases) {
    const tokens = tokenize(phrase.text);
    callTotal += phrase.calls;
    for (const token of tokens) {
      const byForm = forms.get(token.key) ?? new Map<string, number>();
      byForm.set(token.form, (byForm.get(token.form) ?? 0) + phrase.calls);
      forms.set(token.key, byForm);
    }
    // Só a primeira ocorrência da raiz abre caminho: a contagem do nó fica sendo contagem de ligações.
    const at = tokens.findIndex((token) => token.key === rootKey);
    if (at < 0) continue;
    root.count += phrase.calls;
    root.lost += phrase.lost;
    let node = root;
    for (const token of tokens.slice(at + 1, at + 1 + MAX_DEPTH)) {
      let child = node.children.get(token.key);
      if (child === undefined) {
        child = { key: token.key, children: new Map(), count: 0, lost: 0 };
        node.children.set(token.key, child);
      }
      child.count += phrase.calls;
      child.lost += phrase.lost;
      node = child;
    }
  }

  /** Grafia original mais frequente da chave; no empate, a que já está em minúsculas. */
  const display = (key: string): string => {
    const ranked = [...(forms.get(key) ?? new Map<string, number>())].sort(
      ([formA, countA], [formB, countB]) =>
        countB - countA || Number(formA !== formA.toLowerCase()) - Number(formB !== formB.toLowerCase()),
    );
    return ranked[0]?.[0] ?? key;
  };

  let omittedBranches = 0;
  const grow = (node: TrieNode, path: string): Branch[] => {
    const kept: Branch[] = [];
    for (const child of byCount(node.children)) {
      if (child.count < MIN_COUNT) {
        omittedBranches += 1;
        continue;
      }
      // Cadeia sem bifurcação e sem perda de contagem vira um nó só: o filho único leva todas as
      // ligações do pai, e um conector ali não separaria nada.
      const keys = [child.key];
      let tail = child;
      for (;;) {
        const only = tail.children.size === 1 ? [...tail.children.values()][0] : undefined;
        if (only === undefined || only.count !== tail.count) break;
        keys.push(only.key);
        tail = only;
      }
      const id = `${path}/${keys.join('+')}`;
      kept.push({ id, label: keys.map(display).join(' '), count: child.count, lost: child.lost, children: grow(tail, id) });
    }
    return kept;
  };
  const branches = grow(root, rootKey);

  return {
    rootLabel: forms.has(rootKey) ? display(rootKey) : rootWord,
    rootCount: root.count,
    rootLost: root.lost,
    callTotal,
    branches,
    omittedBranches,
  };
}

/** Todos os rótulos da árvore numa linha: é a amostra de glifos que a checagem de fonte pede. */
function labelsOf(branches: readonly Branch[]): string {
  return branches.map((branch) => `${branch.label} ${labelsOf(branch.children)}`).join(' ');
}

/** Parcela perdida do ramo. Ramo sem ligação não tem parcela, e isso não é zero (EST-1b). */
function lostShare(lost: number, calls: number): number | null {
  return calls > 0 ? lost / calls : null;
}

/**
 * A regra de destaque inteira: folha com parcela perdida acima da metade e com volume, e dessas
 * só as de maior parcela (no empate, a de mais ligações). Devolve os ids das folhas que acendem.
 */
function pickHighlights(branches: readonly Branch[]): ReadonlySet<string> {
  const ranked: { readonly id: string; readonly share: number; readonly count: number }[] = [];
  const walk = (list: readonly Branch[]): void => {
    for (const branch of list) {
      if (branch.children.length > 0) {
        walk(branch.children);
        continue;
      }
      const share = lostShare(branch.lost, branch.count);
      if (share !== null && share > MAJORITY_SHARE && branch.count >= MIN_HIGHLIGHT_VOLUME) {
        ranked.push({ id: branch.id, share, count: branch.count });
      }
    }
  };
  walk(branches);
  ranked.sort((a, b) => b.share - a.share || b.count - a.count);
  return new Set(ranked.slice(0, MAX_HIGHLIGHTS).map((entry) => entry.id));
}

interface Draft {
  readonly id: string;
  readonly label: string;
  /** Caminho escrito da raiz até aqui, para a dica e para a lista equivalente. */
  readonly phrase: string;
  readonly count: number;
  readonly lost: number;
  /** Folha que passou na regra de destaque. */
  readonly highlighted: boolean;
  /** Nó no caminho da raiz até uma folha destacada: o conector que chega nele engrossa. */
  readonly onPath: boolean;
  readonly fontSize: number;
  readonly weight: number;
  readonly width: number;
  /** Altura da faixa que a subárvore ocupa: a própria linha ou a soma das filhas, o que for maior. */
  readonly height: number;
  readonly children: readonly Draft[];
  x: number;
  y: number;
}

interface Link {
  readonly id: string;
  readonly d: string;
  readonly strong: boolean;
}

interface Layout {
  readonly root: Draft;
  readonly nodes: readonly Draft[];
  readonly leaves: readonly Draft[];
  readonly links: readonly Link[];
  readonly width: number;
  readonly height: number;
}

/** Singular e plural escritos por extenso: a contagem nunca sai sem o substantivo (NUM-6). */
function countOf(value: number, one: string, many: string): string {
  return `${formatInt(value)} ${value === 1 ? one : many}`;
}

function formatCalls(value: number): string {
  return countOf(value, 'ligação', 'ligações');
}

function coord(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function buildLayout(tree: Tree, measure: Measure): Layout {
  const highlights = pickHighlights(tree.branches);
  const sketch = (id: string, label: string, phrase: string, count: number, lost: number, branches: readonly Branch[], isRoot: boolean): Draft => {
    // A raiz quadrada parte do zero, para a área da palavra acompanhar a contagem; o piso é o da leitura.
    const fontSize = Math.max(FONT_MIN, Math.round(FONT_MAX * Math.sqrt(count / tree.rootCount)));
    const children = branches.map((branch) =>
      sketch(branch.id, branch.label, `${phrase} ${branch.label}`, branch.count, branch.lost, branch.children, false),
    );
    const highlighted = highlights.has(id);
    const weight = isRoot ? ROOT_WEIGHT : highlighted ? HIGHLIGHT_WEIGHT : WORD_WEIGHT;
    const ownRow = Math.max(ROW_MIN, Math.round(fontSize * ROW_FACTOR));
    const stacked = children.reduce((sum, child) => sum + child.height, 0);
    return {
      id, label, phrase, count, lost, highlighted,
      onPath: highlighted || children.some((child) => child.onPath),
      fontSize, weight, width: measure(label, fontSize, weight), height: Math.max(ownRow, stacked), children, x: 0, y: 0,
    };
  };
  /** Folha no meio da própria linha; pai no meio entre o primeiro e o último filho. */
  const setY = (node: Draft, top: number): void => {
    const stacked = node.children.reduce((sum, child) => sum + child.height, 0);
    let cursor = top + (node.height - stacked) / 2;
    for (const child of node.children) {
      setY(child, cursor);
      cursor += child.height;
    }
    const first = node.children[0];
    const last = node.children[node.children.length - 1];
    node.y = first && last ? (first.y + last.y) / 2 : top + node.height / 2;
  };
  const nodes: Draft[] = [];
  const links: Link[] = [];
  /** X acumulado: a filha começa onde a palavra do pai termina, mais o vão do nível. */
  const setX = (node: Draft, x: number): void => {
    node.x = x;
    nodes.push(node);
    const spread = node.children.reduce((max, child) => Math.max(max, Math.abs(child.y - node.y)), 0);
    const gap = Math.min(GAP_MAX, GAP_MIN + GAP_SPREAD_RATIO * spread);
    const fromX = x + node.width + CONNECTOR_PAD;
    for (const child of node.children) {
      setX(child, x + node.width + gap);
      const toX = child.x - CONNECTOR_PAD;
      const midX = (fromX + toX) / 2;
      // Bézier de tangente horizontal nas duas pontas: sai da palavra do pai e chega à da filha em linha.
      links.push({
        id: child.id,
        d: `M ${coord(fromX)},${coord(node.y)} C ${coord(midX)},${coord(node.y)} ${coord(midX)},${coord(child.y)} ${coord(toX)},${coord(child.y)}`,
        strong: child.onPath,
      });
    }
  };

  const root = sketch('root', tree.rootLabel, tree.rootLabel, tree.rootCount, tree.rootLost, tree.branches, true);
  setY(root, PAD_Y);
  setX(root, PAD_X);
  const leaves = nodes.filter((node) => node !== root && node.children.length === 0);
  const reach = leaves.reduce(
    (max, leaf) =>
      Math.max(max, leaf.x + leaf.width + COUNT_GAP + formatRateWithVolume(leaf.lost, leaf.count).length * COUNT_FONT * COUNT_CHAR_EM),
    root.x + root.width,
  );
  // O conector destacado vai por último, para o traço grosso ficar por cima do fino onde os dois saem do mesmo pai.
  links.sort((a, b) => Number(a.strong) - Number(b.strong));
  // Se o dado pedir mais largura que o corpo, o viewBox cresce e o desenho encolhe inteiro, sem corte.
  return { root, nodes, leaves, links, width: Math.max(VIEW_W, Math.ceil(reach + PAD_X)), height: Math.ceil(root.height + 2 * PAD_Y) };
}

export default function OutcomeWordTree({
  data = defaultData,
  rootWord = defaultRootWord,
  period = defaultPeriod,
  height,
  className,
}: OutcomeWordTreeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tree = useMemo(() => buildTree(data, rootWord), [data, rootWord]);
  const sample = useMemo(() => `${tree.rootLabel} ${labelsOf(tree.branches)}`, [tree]);
  const measure = useTextMeasure(rootRef, sample);
  const layout = useMemo(() => (tree.rootCount > 0 ? buildLayout(tree, measure) : null), [tree, measure]);
  const style = height === undefined ? undefined : { height };

  if (layout === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>{`Nenhuma ligação com ${rootWord} neste recorte: não há ramos para desenhar.`}</span>
      </div>
    );
  }

  const { root, leaves } = layout;
  const span = `${formatMonthShort(period.start)} a ${formatMonthShort(period.end)}`;
  // Na ordem do desenho, de cima para baixo: é nela que a frase e a linha de leitura citam os ramos.
  const lit = leaves.filter((leaf) => leaf.highlighted);

  const summary = [
    `Árvore de palavras depois de ${root.label} em ${formatCalls(root.count)} de ${span}, com a parcela perdida por ramo.`,
    lit.length > 0
      ? `Maioria perdida em ${lit.map((leaf) => `“${leaf.phrase}”, ${formatRateWithVolume(leaf.lost, leaf.count)}`).join(', e em ')}.`
      : `Nenhum ramo tem maioria perdida com pelo menos ${formatCalls(MIN_HIGHLIGHT_VOLUME)}.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('relative flex h-full w-full min-w-0 flex-col', className)} ref={rootRef} role="figure" style={style}>
      {/* Lista equivalente para leitor de tela: um item por ramo, da raiz até a folha, com a parcela.
          Vem primeiro e em linha de 16 px para a pilha de itens, mesmo recortada, caber no corpo. */}
      <ul className="sr-only text-xs leading-4">
        {leaves.map((leaf) => (
          <li key={leaf.id}>
            {`${leaf.phrase}: ${formatRateWithVolume(leaf.lost, leaf.count)} com oportunidade perdida${leaf.highlighted ? ', ramo em destaque' : ''}`}
          </li>
        ))}
      </ul>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {lit.length > 0 ? (
          <>
            Maioria perdida, com volume, em <span className="tabular-nums">{countOf(lit.length, 'ramo', 'ramos')}</span>:{' '}
            {lit.map((leaf, index) => (
              <span key={leaf.id}>
                {index > 0 ? ' e ' : ''}
                <span className="font-semibold text-text-primary">{leaf.phrase}</span>
              </span>
            ))}
            .
          </>
        ) : (
          <>
            Nenhum ramo tem maioria perdida com pelo menos <span className="tabular-nums">{formatCalls(MIN_HIGHLIGHT_VOLUME)}</span>.
          </>
        )}
      </p>
      <svg
        aria-hidden
        className="block h-auto max-w-full shrink-0"
        height={layout.height}
        viewBox={`0 0 ${String(layout.width)} ${String(layout.height)}`}
        width={layout.width}
      >
        {layout.links.map((link) => (
          // O conector é dado (ACE-6): o neutro vai em `--text-muted`, que passa de 3:1 nos dois temas, e
          // o do ramo destacado muda de cor e de espessura, para o destaque não depender só da cor.
          <path
            d={link.d}
            fill="none"
            key={link.id}
            stroke={link.strong ? 'var(--chart-1)' : 'var(--text-muted)'}
            strokeWidth={link.strong ? HIGHLIGHT_STROKE : CONNECTOR_STROKE}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {layout.nodes.map((node) => {
          const isRoot = node === root;
          const rate = formatRateWithVolume(node.lost, node.count);
          return (
            <g key={node.id}>
              {/* A dica acrescenta o que o desenho não escreve: as ligações e a parcela perdida de todo nó, não só da folha. */}
              <title>
                {isRoot
                  ? `${root.label}: ${formatCalls(root.count)} entre as ${formatInt(tree.callTotal)} de ${span}, ${rate} com oportunidade perdida`
                  : `${node.phrase}: ${formatCalls(node.count)}, ${rate} com oportunidade perdida`}
              </title>
              <text
                dominantBaseline="central"
                fill={isRoot ? 'var(--text-primary)' : node.highlighted ? 'var(--chart-1)' : 'var(--text-secondary)'}
                fontSize={node.fontSize}
                fontWeight={node.weight}
                x={node.x}
                y={node.y}
              >
                {node.label}
              </text>
              {!isRoot && node.children.length === 0 ? (
                <text
                  className="font-display"
                  dominantBaseline="central"
                  fill={node.highlighted ? 'var(--chart-1)' : 'var(--text-muted)'}
                  fontSize={COUNT_FONT}
                  fontWeight={node.highlighted ? 600 : 500}
                  x={node.x + node.width + COUNT_GAP}
                  y={node.y}
                >
                  {rate}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 shrink-0 text-[0.6875rem] leading-4 tabular-nums text-text-muted">
        {`Ao fim de cada ramo: parcela das ligações com oportunidade perdida depois. Destaque: mais da metade perdida, com ${formatCalls(MIN_HIGHLIGHT_VOLUME)} ou mais no ramo, em até ${countOf(MAX_HIGHLIGHTS, 'ramo', 'ramos')}.`}
        {/* A contagem que ordena os irmãos não está escrita nos nós do meio: a nota declara a ordem (GEO-12). */}
        {' Ramos irmãos do mais para o menos frequente'}
        {tree.omittedBranches > 0
          ? `; a poda tirou ${countOf(tree.omittedBranches, 'ramo', 'ramos')} com menos de ${formatCalls(MIN_COUNT)}.`
          : '.'}
      </p>
    </div>
  );
}
