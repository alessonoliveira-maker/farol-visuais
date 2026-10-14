import { Filter } from 'lucide-react';
import { Fragment, type KeyboardEvent, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periodLabel as defaultPeriodLabel, rootWord as defaultRootWord, type LossNote } from './data';

/**
 * Árvore de palavras dupla: a raiz fica no centro, o que se escreve antes dela abre para a
 * esquerda e o que se escreve depois abre para a direita. Apoia a leitura dos motivos de perda do
 * comercial, mostrando de onde a frase chega à palavra e para onde ela segue.
 *
 * São duas tries sobre as mesmas anotações (`buildTree`): a de sufixo guarda as `MAX_DEPTH`
 * palavras depois da raiz e a de prefixo guarda as `MAX_DEPTH` de antes, lidas de trás para a
 * frente, de modo que o primeiro nível de cada lado é a palavra vizinha da raiz. A chave de
 * comparação é a palavra sem acento e em minúsculas (preço, preco e Preço caem no mesmo nó) e o
 * que se escreve é a grafia original mais frequente. A poda tira o filho abaixo de `MIN_COUNT` e
 * o contador do rodapé soma o que saiu dos dois lados. Cadeia sem bifurcação vira um nó só,
 * escrito na ordem de leitura (achou o).
 *
 * Cada palavra desenhada é um botão: clicar nela, ou ativá-la pelo teclado, refaz as duas tries
 * com ela como raiz (`picked`), e o botão de voltar devolve a raiz inicial. O nó de várias
 * palavras é um `<text>` só, com um `<tspan>` por palavra, para o navegador espaçar a frase.
 *
 * O tamanho da palavra é a marca: `FONT_MAX` vezes a raiz quadrada da parcela das anotações da
 * raiz que passam pelo nó, com piso de `FONT_MIN`. Y vem das folhas de cada lado, com o pai no
 * meio dos filhos, e os dois lados se alinham pela raiz. X é a soma das larguras medidas, da
 * borda da raiz para fora, e o desenho inteiro fica centrado no plano.
 *
 * A largura sai do Canvas 2D com a fonte, o peso e o tamanho reais, e só depois que a face carregou
 * (GEO-8); até lá vale a soma por glifo, para mais. O `<svg>` declara largura e altura iguais ao
 * `viewBox`, e a largura é a do corpo do preset largo, para a escala sair 1 (GEO-18). O conector
 * diz qual palavra segue qual, então é dado e vai em `--text-muted`, que passa de 3:1 nos dois
 * temas, e não em `--line-strong` (ACE-6).
 */
export interface DoubleWordTreeProps {
  readonly data?: readonly LossNote[];
  /** Palavra raiz inicial; a comparação é pela chave sem acento e em minúsculas. */
  readonly rootWord?: string;
  /** Período das anotações, já como texto de tela. */
  readonly periodLabel?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Largura do corpo no preset largo com moldura card (960 menos 66): escala 1 (GEO-18). */
const VIEW_W = 894;
const PAD_X = 4;
const PAD_Y = 6;
/** Contagem mínima de anotações para um ramo entrar na árvore. */
const MIN_COUNT = 8;
/** Quantas palavras de cada lado da raiz as tries guardam. */
const MAX_DEPTH = 3;
const FONT_MAX = 36;
const FONT_MIN = 12;
const COUNT_FONT = 11;
const ROOT_WEIGHT = 700;
const WORD_WEIGHT = 500;
const MEASURED_WEIGHTS = [WORD_WEIGHT, ROOT_WEIGHT] as const;
/** Altura da linha de uma folha: o piso serve a palavra de 12 px, e a maior pede 1,5 vez o corpo. */
const ROW_MIN = 20;
const ROW_FACTOR = 1.5;
/** Vão entre a palavra e as filhas, para fora da raiz: cresce com o espalhamento vertical delas. */
const GAP_MIN = 28;
const GAP_MAX = 60;
const GAP_SPREAD_RATIO = 0.22;
const CONNECTOR_PAD = 5;
const CONNECTOR_STROKE = 1.5;
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

/** Chave de comparação: sem acento e em minúsculas, para preço, preco e Preço caírem no mesmo nó. */
function normalizeKey(word: string): string {
  return word.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function tokenize(text: string): Token[] {
  return (text.match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu) ?? []).map((form) => ({ key: normalizeKey(form), form }));
}

type Side = 'before' | 'after';

interface TrieNode {
  readonly key: string;
  readonly children: Map<string, TrieNode>;
  count: number;
}

interface WordRef {
  readonly key: string;
  readonly form: string;
}

interface Branch {
  readonly id: string;
  /** As palavras do nó, na ordem de leitura. */
  readonly words: readonly WordRef[];
  readonly count: number;
  readonly children: readonly Branch[];
}

interface SideTree {
  readonly branches: readonly Branch[];
  /** Ramos que a poda tirou deste lado, em qualquer nível, e as anotações que eles levavam. */
  readonly omittedBranches: number;
  readonly omittedNotes: number;
  /** Anotações em que a raiz não tem palavra deste lado: ela abre ou fecha o texto. */
  readonly atEdge: number;
}

interface Tree {
  readonly rootLabel: string;
  /** Grafias da raiz que a chave juntou, da mais para a menos frequente. */
  readonly rootForms: readonly (readonly [string, number])[];
  /** Anotações que contêm a raiz. */
  readonly rootCount: number;
  /** Todas as anotações do recorte, com ou sem a raiz. */
  readonly noteTotal: number;
  readonly before: SideTree;
  readonly after: SideTree;
}

/** Filhos do maior para o menor; no empate, a ordem da chave, para o desenho não depender da entrada. */
function byCount(children: Map<string, TrieNode>): TrieNode[] {
  return [...children.values()].sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : 1));
}

function insert(root: TrieNode, keys: readonly string[], weight: number): void {
  let node = root;
  for (const key of keys) {
    let child = node.children.get(key);
    if (child === undefined) {
      child = { key, children: new Map(), count: 0 };
      node.children.set(key, child);
    }
    child.count += weight;
    node = child;
  }
}

function buildTree(notes: readonly LossNote[], rootKey: string, fallbackLabel: string): Tree {
  const forms = new Map<string, Map<string, number>>();
  const tries: Record<Side, TrieNode> = {
    before: { key: rootKey, children: new Map(), count: 0 },
    after: { key: rootKey, children: new Map(), count: 0 },
  };
  let noteTotal = 0;
  let rootCount = 0;
  for (const note of notes) {
    const tokens = tokenize(note.text);
    noteTotal += note.count;
    for (const token of tokens) {
      const byForm = forms.get(token.key) ?? new Map<string, number>();
      byForm.set(token.form, (byForm.get(token.form) ?? 0) + note.count);
      forms.set(token.key, byForm);
    }
    // Só a primeira ocorrência da raiz abre caminho: a contagem do nó fica sendo contagem de anotações.
    const at = tokens.findIndex((token) => token.key === rootKey);
    if (at < 0) continue;
    rootCount += note.count;
    insert(tries.after, tokens.slice(at + 1, at + 1 + MAX_DEPTH).map((token) => token.key), note.count);
    // O prefixo entra de trás para a frente: o primeiro nível é a palavra colada na raiz.
    insert(tries.before, tokens.slice(Math.max(0, at - MAX_DEPTH), at).reverse().map((token) => token.key), note.count);
  }

  /** Grafias originais da chave, da mais frequente para a menos; no empate, a que já está em minúsculas. */
  const rankForms = (key: string): (readonly [string, number])[] =>
    [...(forms.get(key) ?? new Map<string, number>())].sort(
      ([formA, countA], [formB, countB]) =>
        countB - countA || Number(formA !== formA.toLowerCase()) - Number(formB !== formB.toLowerCase()),
    );
  const display = (key: string): string => rankForms(key)[0]?.[0] ?? key;

  const prune = (side: Side): SideTree => {
    let omittedBranches = 0;
    let omittedNotes = 0;
    const grow = (node: TrieNode, path: string): Branch[] => {
      const kept: Branch[] = [];
      for (const child of byCount(node.children)) {
        if (child.count < MIN_COUNT) {
          omittedBranches += 1;
          omittedNotes += child.count;
          continue;
        }
        // Cadeia sem bifurcação e sem perda de contagem vira um nó só: o filho único leva todas as
        // anotações do pai, e um conector ali não separaria nada.
        const keys = [child.key];
        let tail = child;
        for (;;) {
          const only = tail.children.size === 1 ? [...tail.children.values()][0] : undefined;
          if (only === undefined || only.count !== tail.count) break;
          keys.push(only.key);
          tail = only;
        }
        const id = `${path}/${keys.join('+')}`;
        const words = keys.map((key) => ({ key, form: display(key) }));
        // No prefixo a cadeia foi colhida da raiz para fora: a ordem de leitura é a inversa.
        kept.push({ id, words: side === 'before' ? words.reverse() : words, count: child.count, children: grow(tail, id) });
      }
      return kept;
    };
    const branches = grow(tries[side], `${side}:${rootKey}`);
    const withNeighbor = [...tries[side].children.values()].reduce((sum, child) => sum + child.count, 0);
    return { branches, omittedBranches, omittedNotes, atEdge: rootCount - withNeighbor };
  };

  return {
    rootLabel: forms.has(rootKey) ? display(rootKey) : fallbackLabel,
    rootForms: rankForms(rootKey),
    rootCount,
    noteTotal,
    before: prune('before'),
    after: prune('after'),
  };
}

/** Todos os rótulos da árvore numa linha: é a amostra de glifos que a checagem de fonte pede. */
function labelsOf(branches: readonly Branch[]): string {
  return branches.map((branch) => `${branch.words.map((word) => word.form).join(' ')} ${labelsOf(branch.children)}`).join(' ');
}

interface Draft {
  readonly id: string;
  readonly side: Side;
  readonly words: readonly WordRef[];
  readonly label: string;
  /** Frase escrita na ordem de leitura, com a raiz, para a dica e para a lista equivalente. */
  readonly phrase: string;
  readonly count: number;
  readonly fontSize: number;
  readonly width: number;
  /** Altura da faixa que a subárvore ocupa: a própria linha ou a soma das filhas, o que for maior. */
  readonly height: number;
  readonly children: readonly Draft[];
  /** Borda esquerda da tinta do nó. */
  x: number;
  y: number;
}

interface Link {
  readonly id: string;
  readonly d: string;
}

interface Layout {
  readonly rootX: number;
  readonly rootY: number;
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

function formatNotes(value: number): string {
  return countOf(value, 'anotação', 'anotações');
}

function coord(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function sumHeights(nodes: readonly Draft[]): number {
  return nodes.reduce((sum, node) => sum + node.height, 0);
}

function buildLayout(tree: Tree, measure: Measure): Layout {
  const sketch = (branch: Branch, side: Side, parentPhrase: string): Draft => {
    const label = branch.words.map((word) => word.form).join(' ');
    const phrase = side === 'after' ? `${parentPhrase} ${label}` : `${label} ${parentPhrase}`;
    // A raiz quadrada parte do zero, para a área da palavra acompanhar a contagem; o piso é o da leitura.
    const fontSize = Math.max(FONT_MIN, Math.round(FONT_MAX * Math.sqrt(branch.count / tree.rootCount)));
    const width = measure(label, fontSize, WORD_WEIGHT);
    const children = branch.children.map((child) => sketch(child, side, phrase));
    const ownRow = Math.max(ROW_MIN, Math.round(fontSize * ROW_FACTOR));
    return { id: branch.id, side, words: branch.words, label, phrase, count: branch.count, fontSize, width, height: Math.max(ownRow, sumHeights(children)), children, x: 0, y: 0 };
  };
  /** Folha no meio da própria linha; pai no meio entre o primeiro e o último filho. */
  const setY = (node: Draft, top: number): void => {
    stack(node.children, top + (node.height - sumHeights(node.children)) / 2);
    const first = node.children[0];
    const last = node.children[node.children.length - 1];
    node.y = first && last ? (first.y + last.y) / 2 : top + node.height / 2;
  };
  const stack = (nodes: readonly Draft[], top: number): void => {
    let cursor = top;
    for (const node of nodes) {
      setY(node, cursor);
      cursor += node.height;
    }
  };

  const rootWidth = measure(tree.rootLabel, FONT_MAX, ROOT_WEIGHT);
  const rootRow = Math.round(FONT_MAX * ROW_FACTOR);
  // Cada lado empilha as próprias folhas; o eixo do lado é o meio entre o primeiro e o último ramo.
  const sides = (['before', 'after'] as const).map((side) => {
    const children = tree[side].branches.map((branch) => sketch(branch, side, tree.rootLabel));
    const height = Math.max(rootRow, sumHeights(children));
    const inset = (height - sumHeights(children)) / 2;
    stack(children, inset);
    const first = children[0];
    const last = children[children.length - 1];
    return { side, children, height, inset, axis: first && last ? (first.y + last.y) / 2 : height / 2 };
  });
  // Os dois lados se alinham pela raiz: o de eixo mais alto desce até o eixo do outro.
  const axis = sides.reduce((max, entry) => Math.max(max, entry.axis), 0);
  const rootY = PAD_Y + axis;
  for (const entry of sides) stack(entry.children, PAD_Y + axis - entry.axis + entry.inset);
  const height = Math.ceil(sides.reduce((max, entry) => Math.max(max, PAD_Y + axis - entry.axis + entry.height), 0) + PAD_Y);

  /** X da raiz para fora: `dir` é +1 no sufixo e −1 no prefixo. Devolve o que foi posto e o alcance. */
  const place = (centerX: number) => {
    const nodes: Draft[] = [];
    const links: Link[] = [];
    let minX = centerX - rootWidth / 2;
    let maxX = centerX + rootWidth / 2;
    const walk = (children: readonly Draft[], parentEdge: number, parentY: number, dir: 1 | -1): void => {
      const spread = children.reduce((max, child) => Math.max(max, Math.abs(child.y - parentY)), 0);
      const gap = Math.min(GAP_MAX, GAP_MIN + GAP_SPREAD_RATIO * spread);
      const fromX = parentEdge + dir * CONNECTOR_PAD;
      for (const child of children) {
        const near = parentEdge + dir * gap;
        const far = near + dir * child.width;
        child.x = Math.min(near, far);
        nodes.push(child);
        const toX = near - dir * CONNECTOR_PAD;
        const midX = (fromX + toX) / 2;
        // Bézier de tangente horizontal nas duas pontas: sai da palavra do pai e chega à da filha em linha.
        links.push({
          id: child.id,
          d: `M ${coord(fromX)},${coord(parentY)} C ${coord(midX)},${coord(parentY)} ${coord(midX)},${coord(child.y)} ${coord(toX)},${coord(child.y)}`,
        });
        // A folha reserva também a largura da contagem escrita na ponta de fora.
        const tip = child.children.length > 0 ? far : far + dir * (COUNT_GAP + formatNotes(child.count).length * COUNT_FONT * COUNT_CHAR_EM);
        minX = Math.min(minX, near, tip);
        maxX = Math.max(maxX, near, tip);
        walk(child.children, far, child.y, dir);
      }
    };
    for (const entry of sides) {
      const dir = entry.side === 'after' ? 1 : -1;
      walk(entry.children, centerX + (dir * rootWidth) / 2, rootY, dir);
    }
    return { nodes, links, minX, maxX };
  };
  // Primeira passada com a raiz em zero só para medir o alcance; a segunda centra o desenho no plano.
  // Se o dado pedir mais largura que o corpo, o viewBox cresce e o desenho encolhe inteiro, sem corte.
  const probe = place(0);
  const span = probe.maxX - probe.minX;
  const width = Math.max(VIEW_W, Math.ceil(span + 2 * PAD_X));
  const rootX = (width - span) / 2 - probe.minX;
  const { nodes, links } = place(rootX);
  return { rootX, rootY, nodes, leaves: nodes.filter((node) => node.children.length === 0), links, width, height };
}

export default function DoubleWordTree({
  data = defaultData,
  rootWord = defaultRootWord,
  periodLabel = defaultPeriodLabel,
  height,
  className,
}: DoubleWordTreeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  /** Chave da palavra que o clique pôs no lugar da raiz; `null` é a raiz inicial. */
  const [picked, setPicked] = useState<string | null>(null);
  const initialKey = normalizeKey(rootWord);
  const activeKey = picked ?? initialKey;
  const tree = useMemo(() => buildTree(data, activeKey, rootWord), [data, activeKey, rootWord]);
  const sample = useMemo(() => `${tree.rootLabel} ${labelsOf(tree.before.branches)} ${labelsOf(tree.after.branches)}`, [tree]);
  const measure = useTextMeasure(rootRef, sample);
  const layout = useMemo(() => (tree.rootCount > 0 ? buildLayout(tree, measure) : null), [tree, measure]);
  const style = height === undefined ? undefined : { height };

  if (layout === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>{`Nenhuma anotação com ${rootWord} neste recorte: não há ramos para desenhar.`}</span>
      </div>
    );
  }

  const reroot = (key: string) => setPicked(key === initialKey ? null : key);
  const onWordKey = (event: KeyboardEvent<SVGTSpanElement>, key: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    reroot(key);
  };

  const beforeLeader = tree.before.branches[0];
  const afterLeader = tree.after.branches[0];
  const labelOf = (branch: Branch): string => branch.words.map((word) => word.form).join(' ');
  const rootRate = formatRateWithVolume(tree.rootCount, tree.noteTotal);
  const omittedBranches = tree.before.omittedBranches + tree.after.omittedBranches;
  const omittedNotes = tree.before.omittedNotes + tree.after.omittedNotes;

  const summary = [
    `Árvore de palavras dupla com raiz ${tree.rootLabel}, presente em ${rootRate} das anotações de perda de ${periodLabel}.`,
    beforeLeader ? `Antes dela o mais comum é “${labelOf(beforeLeader)}”, com ${formatNotes(beforeLeader.count)}.` : '',
    afterLeader ? `Depois, “${labelOf(afterLeader)}”, com ${formatNotes(afterLeader.count)}.` : '',
    omittedBranches > 0 ? `A poda tirou ${countOf(omittedBranches, 'ramo', 'ramos')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('relative flex h-full w-full min-w-0 flex-col', className)} ref={rootRef} role="figure" style={style}>
      {/* Lista equivalente para leitor de tela: um item por ramo, na ordem de leitura, com a contagem.
          Vem primeiro e em linha de 16 px para a pilha de itens, mesmo recortada, caber no corpo. */}
      <ul className="sr-only text-xs leading-4">
        {layout.leaves.map((leaf) => (
          <li key={leaf.id}>{`${leaf.phrase}: ${formatNotes(leaf.count)}`}</li>
        ))}
      </ul>
      <div className="mb-2 flex shrink-0 items-baseline gap-3 text-xs">
        <p aria-hidden className="min-w-0 text-text-secondary">
          <span className="font-semibold text-text-primary">{tree.rootLabel}</span>
          {tree.rootForms.length > 1 ? (
            <>
              , em <span className="tabular-nums">{countOf(tree.rootForms.length, 'grafia', 'grafias')}</span> somadas,
            </>
          ) : null}{' '}
          aparece em <span className="tabular-nums text-text-primary">{rootRate}</span> das anotações de {periodLabel}
          {beforeLeader ? (
            <>
              ; antes da raiz o mais comum é <span className="font-semibold text-text-primary">{labelOf(beforeLeader)}</span>
            </>
          ) : null}
          {afterLeader ? (
            <>
              ; depois, <span className="font-semibold text-text-primary">{labelOf(afterLeader)}</span>
            </>
          ) : null}
          .
        </p>
        {picked === null ? null : (
          <button className="shrink-0 cursor-pointer font-medium text-text-primary underline underline-offset-2" onClick={() => setPicked(null)} type="button">
            Voltar para {rootWord}
          </button>
        )}
      </div>
      <svg
        aria-label="Palavras da árvore: ative uma delas para usá-la como raiz"
        className="block h-auto max-w-full shrink-0"
        height={layout.height}
        role="group"
        viewBox={`0 0 ${String(layout.width)} ${String(layout.height)}`}
        width={layout.width}
      >
        {layout.links.map((link) => (
          // O conector é dado (ACE-6): `--text-muted` passa de 3:1 nos dois temas, `--line-strong` não.
          <path aria-hidden d={link.d} fill="none" key={link.id} stroke="var(--text-muted)" strokeWidth={CONNECTOR_STROKE} vectorEffect="non-scaling-stroke" />
        ))}
        <g>
          {/* A dica da raiz mostra o que a chave sem acento e em minúsculas juntou e em quantas
              anotações a raiz abre ou fecha o texto, que é o que falta para os ramos somarem o total. */}
          <title>
            {`${tree.rootLabel}: ${formatNotes(tree.rootCount)}. Grafias somadas: ${tree.rootForms.map(([form, count]) => `${form} ${formatInt(count)}`).join(', ')}. Abre o texto em ${formatInt(tree.before.atEdge)} e fecha em ${formatInt(tree.after.atEdge)}.`}
          </title>
          <text dominantBaseline="central" fill="var(--text-primary)" fontSize={FONT_MAX} fontWeight={ROOT_WEIGHT} textAnchor="middle" x={layout.rootX} y={layout.rootY}>
            {tree.rootLabel}
          </text>
        </g>
        {layout.nodes.map((node) => (
          <g key={node.id}>
            {/* A dica acrescenta o que o desenho não escreve: a parcela das anotações da raiz que passam pelo nó. */}
            <title>{`${node.phrase}: ${formatRateWithVolume(node.count, tree.rootCount)} das anotações com ${tree.rootLabel}`}</title>
            {/* Um `<text>` por nó, com um `<tspan>` por palavra: o navegador espaça a frase, e cada
                palavra continua sendo um botão que o clique ou a tecla ativam. */}
            <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={node.fontSize} fontWeight={WORD_WEIGHT} x={node.x} y={node.y}>
              {node.words.map((word, index) => (
                <Fragment key={`${word.key}-${String(index)}`}>
                  {index > 0 ? ' ' : null}
                  <tspan
                    aria-label={`Usar ${word.form} como raiz`}
                    className="cursor-pointer hover:underline focus-visible:underline"
                    onClick={() => reroot(word.key)}
                    onKeyDown={(event) => onWordKey(event, word.key)}
                    role="button"
                    tabIndex={0}
                  >
                    {word.form}
                  </tspan>
                </Fragment>
              ))}
            </text>
            {node.children.length === 0 ? (
              <text
                aria-hidden
                className="font-display"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize={COUNT_FONT}
                fontWeight={500}
                textAnchor={node.side === 'after' ? 'start' : 'end'}
                x={node.side === 'after' ? node.x + node.width + COUNT_GAP : node.x - COUNT_GAP}
                y={node.y}
              >
                {formatNotes(node.count)}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      <p className="mt-2 shrink-0 text-[0.6875rem] leading-4 tabular-nums text-text-muted">
        {/* A contagem que ordena os irmãos não está escrita nos nós do meio: a nota declara a ordem (GEO-12). */}
        {'Clique numa palavra para usá-la como raiz. Ramos irmãos do mais para o menos frequente'}
        {omittedBranches > 0
          ? `; a poda tirou ${countOf(omittedBranches, 'ramo', 'ramos')} com menos de ${formatNotes(MIN_COUNT)}, ${formatNotes(omittedNotes)} ao todo.`
          : '.'}
      </p>
    </div>
  );
}
