import { Filter, TriangleAlert } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { formatInt, formatMonthShort, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, period as defaultPeriod, rootWord as defaultRootWord, type FormAnswer } from './data';

/**
 * Árvore de palavras que sabe quando não deve ser árvore. Com a raiz rara, o desenho vira fio e
 * engana pelo tamanho da fonte; então a peça mostra as próprias frases em concordância, alinhadas
 * pela palavra, e avisa a contagem e o mínimo. Apoia a leitura de respostas abertas do marketing
 * quando o termo escolhido quase não aparece.
 *
 * Uma função só decide o que se desenha, pela contagem de ocorrências da raiz (`chooseView`):
 * nenhuma ocorrência dá o estado vazio com `role="status"`; menos de `TREE_MIN_OCCURRENCES` dá a
 * concordância; daí para cima dá a árvore de sufixo. Os três caminhos saem da mesma passada sobre
 * as respostas (`buildTree`), que monta a trie e guarda uma linha de concordância por ocorrência.
 *
 * Na concordância a palavra vai no meio, em `--text-primary` e peso 600, escrita como está na
 * resposta (a chave sem acento e em minúsculas casa Garantia com garantia), o contexto esquerdo
 * encosta nela pela direita e o direito pela esquerda. A janela é de `CONTEXT_WORDS` palavras por
 * lado; o que fica fora vira reticências na ponta de fora, e a resposta inteira vai na dica e na
 * lista equivalente para leitor de tela.
 *
 * Na árvore valem as regras do modelo: poda por `MIN_COUNT`, cadeia sem bifurcação num nó só,
 * tamanho pela raiz quadrada da parcela das ocorrências com piso de `FONT_MIN`, Y pelas folhas com
 * o pai no meio dos filhos e X pela largura medida das palavras.
 *
 * A largura sai do Canvas 2D com a fonte, o peso e o tamanho reais, e só depois que a face carregou
 * (GEO-8); até lá vale a soma por glifo, para mais. O `<svg>` declara largura e altura iguais ao
 * `viewBox`, e a largura é a do corpo do preset card, para a escala sair 1 (GEO-18).
 */
export interface RareRootWordTreeProps {
  readonly data?: readonly FormAnswer[];
  /** Palavra raiz; a comparação é pela chave sem acento e em minúsculas. */
  readonly rootWord?: string;
  /** Primeiro e último mês das respostas, em `YYYY-MM`. */
  readonly period?: { readonly start: string; readonly end: string };
  readonly height?: number;
  readonly className?: string;
}

/** Largura do corpo no preset card com moldura card (640 menos 66): escala 1 (GEO-18). */
const VIEW_W = 574;
const PAD_X = 4;
const PAD_Y = 6;
/** Abaixo disto a árvore vira fio: a peça mostra a concordância no lugar. */
const TREE_MIN_OCCURRENCES = 5;
/** Contagem mínima de ocorrências para um ramo entrar na árvore. */
const MIN_COUNT = 2;
/** Quantas palavras depois da raiz a trie guarda. */
const MAX_DEPTH = 3;
/** Janela da concordância: palavras mostradas de cada lado da raiz. */
const CONTEXT_WORDS = 6;
const KWIC_FONT = 12;
const KWIC_KEY_FONT = 13;
const KWIC_KEY_WEIGHT = 600;
const KWIC_ROW = 28;
const KWIC_GAP = 12;
const FONT_MAX = 36;
const FONT_MIN = 13;
const COUNT_FONT = 11;
const ROOT_WEIGHT = 700;
const WORD_WEIGHT = 500;
const MEASURED_WEIGHTS = [WORD_WEIGHT, KWIC_KEY_WEIGHT, ROOT_WEIGHT] as const;
/** Altura da linha de uma folha: o piso serve a palavra de 13 px, e a maior pede 1,5 vez o corpo. */
const ROW_MIN = 22;
const ROW_FACTOR = 1.5;
/** Vão entre o fim da palavra e o começo das filhas: cresce com o espalhamento vertical delas. */
const GAP_MIN = 32;
const GAP_MAX = 64;
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

/** Chave de comparação: sem acento e em minúsculas, para Garantia e garantia caírem no mesmo nó. */
function normalizeKey(word: string): string {
  return word.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function tokenize(text: string): Token[] {
  return (text.match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu) ?? []).map((form) => ({ key: normalizeKey(form), form }));
}

type View = 'empty' | 'concordance' | 'tree';

/** A mesma função decide o que a peça desenha, só pela contagem de ocorrências da raiz. */
function chooseView(occurrences: number): View {
  if (occurrences <= 0) return 'empty';
  return occurrences < TREE_MIN_OCCURRENCES ? 'concordance' : 'tree';
}

interface TrieNode {
  readonly key: string;
  readonly children: Map<string, TrieNode>;
  count: number;
}

interface Branch {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly children: readonly Branch[];
}

/** Uma ocorrência da raiz, já recortada na janela da concordância. */
interface KwicLine {
  readonly id: string;
  readonly left: string;
  /** A raiz como está escrita nesta resposta. */
  readonly keyword: string;
  readonly right: string;
  /** A resposta inteira, para a dica e para a lista equivalente. */
  readonly full: string;
  /** A janela deixou palavra de fora de algum lado. */
  readonly cut: boolean;
}

interface Tree {
  readonly rootLabel: string;
  /** Respostas que contêm a raiz: uma ocorrência por resposta. */
  readonly rootCount: number;
  /** Todas as respostas do recorte, com ou sem a raiz. */
  readonly answerTotal: number;
  readonly branches: readonly Branch[];
  readonly omittedBranches: number;
  readonly lines: readonly KwicLine[];
}

/** Filhos do maior para o menor; no empate, a ordem da chave, para o desenho não depender da entrada. */
function byCount(children: Map<string, TrieNode>): TrieNode[] {
  return [...children.values()].sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : 1));
}

function buildTree(answers: readonly FormAnswer[], rootWord: string): Tree {
  const rootKey = normalizeKey(rootWord);
  const forms = new Map<string, Map<string, number>>();
  const root: TrieNode = { key: rootKey, children: new Map(), count: 0 };
  const lines: KwicLine[] = [];
  let answerTotal = 0;
  for (const answer of answers) {
    const tokens = tokenize(answer.text);
    answerTotal += answer.count;
    for (const token of tokens) {
      const byForm = forms.get(token.key) ?? new Map<string, number>();
      byForm.set(token.form, (byForm.get(token.form) ?? 0) + answer.count);
      forms.set(token.key, byForm);
    }
    // Só a primeira ocorrência da raiz conta: a contagem do nó fica sendo contagem de respostas.
    const at = tokens.findIndex((token) => token.key === rootKey);
    const hit = tokens[at];
    if (hit === undefined) continue;
    root.count += answer.count;
    let node = root;
    for (const token of tokens.slice(at + 1, at + 1 + MAX_DEPTH)) {
      let child = node.children.get(token.key);
      if (child === undefined) {
        child = { key: token.key, children: new Map(), count: 0 };
        node.children.set(token.key, child);
      }
      child.count += answer.count;
      node = child;
    }
    // A janela corta por palavra inteira, e o corte se marca com reticências na ponta de fora.
    const before = tokens.slice(0, at).map((token) => token.form);
    const after = tokens.slice(at + 1).map((token) => token.form);
    const left = `${before.length > CONTEXT_WORDS ? '… ' : ''}${before.slice(-CONTEXT_WORDS).join(' ')}`;
    const right = `${after.slice(0, CONTEXT_WORDS).join(' ')}${after.length > CONTEXT_WORDS ? ' …' : ''}`;
    // Texto escrito igual em várias respostas dá uma linha por resposta: a concordância lista ocorrências.
    for (let copy = 0; copy < answer.count; copy += 1) {
      lines.push({ id: `${answer.id}-${String(copy)}`, left, keyword: hit.form, right, full: answer.text, cut: before.length > CONTEXT_WORDS || after.length > CONTEXT_WORDS });
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
      // respostas do pai, e um conector ali não separaria nada.
      const keys = [child.key];
      let tail = child;
      for (;;) {
        const only = tail.children.size === 1 ? [...tail.children.values()][0] : undefined;
        if (only === undefined || only.count !== tail.count) break;
        keys.push(only.key);
        tail = only;
      }
      const id = `${path}/${keys.join('+')}`;
      kept.push({ id, label: keys.map(display).join(' '), count: child.count, children: grow(tail, id) });
    }
    return kept;
  };
  const branches = grow(root, rootKey);

  return { rootLabel: forms.has(rootKey) ? display(rootKey) : rootWord, rootCount: root.count, answerTotal, branches, omittedBranches, lines };
}

/** Todos os rótulos da árvore numa linha: é a amostra de glifos que a checagem de fonte pede. */
function labelsOf(branches: readonly Branch[]): string {
  return branches.map((branch) => `${branch.label} ${labelsOf(branch.children)}`).join(' ');
}

interface Draft {
  readonly id: string;
  readonly label: string;
  /** Caminho escrito da raiz até aqui, para a dica e para a lista equivalente. */
  readonly phrase: string;
  readonly count: number;
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
}

interface TreeLayout {
  readonly root: Draft;
  readonly nodes: readonly Draft[];
  readonly leaves: readonly Draft[];
  readonly links: readonly Link[];
  readonly width: number;
  readonly height: number;
}

interface Concordance {
  readonly rows: readonly { readonly line: KwicLine; readonly y: number }[];
  /** Fim do contexto esquerdo, centro da palavra e começo do contexto direito. */
  readonly leftX: number;
  readonly keyX: number;
  readonly rightX: number;
  readonly width: number;
  readonly height: number;
}

/** Singular e plural escritos por extenso: a contagem nunca sai sem o substantivo (NUM-6). */
function countOf(value: number, one: string, many: string): string {
  return `${formatInt(value)} ${value === 1 ? one : many}`;
}

function formatOccurrences(value: number): string {
  return countOf(value, 'ocorrência', 'ocorrências');
}

function coord(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/** A coluna da palavra tem a largura da grafia mais larga, e o bloco inteiro fica centrado no plano. */
function buildConcordance(lines: readonly KwicLine[], measure: Measure): Concordance {
  const widest = (pick: (line: KwicLine) => string, fontPx: number, weight: number): number =>
    lines.reduce((max, line) => Math.max(max, measure(pick(line), fontPx, weight)), 0);
  const leftWidth = widest((line) => line.left, KWIC_FONT, WORD_WEIGHT);
  const keyWidth = widest((line) => line.keyword, KWIC_KEY_FONT, KWIC_KEY_WEIGHT);
  const rightWidth = widest((line) => line.right, KWIC_FONT, WORD_WEIGHT);
  const span = leftWidth + keyWidth + rightWidth + 2 * KWIC_GAP;
  // Se o dado pedir mais largura que o corpo, o viewBox cresce e o desenho encolhe inteiro, sem corte.
  const width = Math.max(VIEW_W, Math.ceil(span + 2 * PAD_X));
  const keyX = (width - span) / 2 + leftWidth + KWIC_GAP + keyWidth / 2;
  return {
    rows: lines.map((line, index) => ({ line, y: PAD_Y + index * KWIC_ROW + KWIC_ROW / 2 })),
    leftX: keyX - keyWidth / 2 - KWIC_GAP,
    keyX,
    rightX: keyX + keyWidth / 2 + KWIC_GAP,
    width,
    height: lines.length * KWIC_ROW + 2 * PAD_Y,
  };
}

function buildTreeLayout(tree: Tree, measure: Measure): TreeLayout {
  const sketch = (id: string, label: string, phrase: string, count: number, branches: readonly Branch[], weight: number): Draft => {
    // A raiz quadrada parte do zero, para a área da palavra acompanhar a contagem; o piso é o da leitura.
    const fontSize = Math.max(FONT_MIN, Math.round(FONT_MAX * Math.sqrt(count / tree.rootCount)));
    const children = branches.map((branch) =>
      sketch(branch.id, branch.label, `${phrase} ${branch.label}`, branch.count, branch.children, WORD_WEIGHT),
    );
    const ownRow = Math.max(ROW_MIN, Math.round(fontSize * ROW_FACTOR));
    const stacked = children.reduce((sum, child) => sum + child.height, 0);
    return { id, label, phrase, count, fontSize, weight, width: measure(label, fontSize, weight), height: Math.max(ownRow, stacked), children, x: 0, y: 0 };
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
      });
    }
  };

  const root = sketch('root', tree.rootLabel, tree.rootLabel, tree.rootCount, tree.branches, ROOT_WEIGHT);
  setY(root, PAD_Y);
  setX(root, PAD_X);
  const leaves = nodes.filter((node) => node !== root && node.children.length === 0);
  const reach = leaves.reduce(
    (max, leaf) => Math.max(max, leaf.x + leaf.width + COUNT_GAP + formatOccurrences(leaf.count).length * COUNT_FONT * COUNT_CHAR_EM),
    root.x + root.width,
  );
  return { root, nodes, leaves, links, width: Math.max(VIEW_W, Math.ceil(reach + PAD_X)), height: Math.ceil(root.height + 2 * PAD_Y) };
}

const ROOT_CLASS = 'relative flex h-full w-full min-w-0 flex-col';
const SVG_CLASS = 'block h-auto max-w-full shrink-0';
const NOTE_CLASS = 'mt-2 shrink-0 text-[0.6875rem] leading-4 tabular-nums text-text-muted';

export default function RareRootWordTree({
  data = defaultData,
  rootWord = defaultRootWord,
  period = defaultPeriod,
  height,
  className,
}: RareRootWordTreeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tree = useMemo(() => buildTree(data, rootWord), [data, rootWord]);
  const view = chooseView(tree.rootCount);
  const sample = useMemo(
    () => `${tree.rootLabel} ${labelsOf(tree.branches)} ${tree.lines.map((line) => `${line.left} ${line.keyword} ${line.right}`).join(' ')}`,
    [tree],
  );
  const measure = useTextMeasure(rootRef, sample);
  const concordance = useMemo(() => (view === 'concordance' ? buildConcordance(tree.lines, measure) : null), [view, tree, measure]);
  const treeLayout = useMemo(() => (view === 'tree' ? buildTreeLayout(tree, measure) : null), [view, tree, measure]);
  const style = height === undefined ? undefined : { height };
  const span = `${formatMonthShort(period.start)} a ${formatMonthShort(period.end)}`;
  const occurrences = formatOccurrences(tree.rootCount);
  const answers = countOf(tree.answerTotal, 'resposta', 'respostas');

  if (view === 'empty') {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>
          {tree.answerTotal > 0
            ? `Nenhuma ocorrência de ${rootWord} em ${answers} de ${span}: não há árvore nem frases para mostrar.`
            : 'Nenhuma resposta de formulário neste recorte: não há frases para mostrar.'}
        </span>
      </div>
    );
  }

  if (concordance !== null) {
    const summary = [
      `Concordância no lugar da árvore de palavras: ${tree.rootLabel} tem ${occurrences} em ${answers} de ${span}, e a árvore pede ${formatInt(TREE_MIN_OCCURRENCES)}.`,
      `As frases aparecem alinhadas pela palavra, com até ${formatInt(CONTEXT_WORDS)} palavras de cada lado.`,
    ].join(' ');
    return (
      <div aria-label={summary} className={cn(ROOT_CLASS, className)} ref={rootRef} role="figure" style={style}>
        {/* Lista equivalente para leitor de tela: a resposta inteira de cada ocorrência, sem o corte da janela. */}
        <ul className="sr-only text-xs leading-4">
          {tree.lines.map((line) => (
            <li key={line.id}>{line.full}</li>
          ))}
        </ul>
        {/* O ícone é item de um contêiner flex, fora do fluxo do texto, para não engordar a linha no preview (GEO-17). */}
        <p aria-hidden className="mb-2 flex shrink-0 items-start gap-2 text-xs text-text-secondary">
          <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0 text-warning" />
          <span>
            <span className="font-semibold text-text-primary">{tree.rootLabel}</span> tem{' '}
            <span className="font-semibold tabular-nums text-text-primary">{occurrences}</span> em{' '}
            <span className="tabular-nums">{answers}</span> de {span}: a árvore pede{' '}
            <span className="font-semibold tabular-nums text-text-primary">{formatInt(TREE_MIN_OCCURRENCES)}</span>. No lugar dela, as
            frases em concordância.
          </span>
        </p>
        <svg
          aria-hidden
          className={SVG_CLASS}
          height={concordance.height}
          viewBox={`0 0 ${String(concordance.width)} ${String(concordance.height)}`}
          width={concordance.width}
        >
          {concordance.rows.map(({ line, y }) => (
            <g key={line.id}>
              {/* A dica só existe onde acrescenta: na linha que a janela cortou, traz a resposta inteira. */}
              {line.cut ? <title>{line.full}</title> : null}
              {line.left === '' ? null : (
                <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={KWIC_FONT} fontWeight={WORD_WEIGHT} textAnchor="end" x={concordance.leftX} y={y}>
                  {line.left}
                </text>
              )}
              <text dominantBaseline="central" fill="var(--text-primary)" fontSize={KWIC_KEY_FONT} fontWeight={KWIC_KEY_WEIGHT} textAnchor="middle" x={concordance.keyX} y={y}>
                {line.keyword}
              </text>
              {line.right === '' ? null : (
                <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={KWIC_FONT} fontWeight={WORD_WEIGHT} textAnchor="start" x={concordance.rightX} y={y}>
                  {line.right}
                </text>
              )}
            </g>
          ))}
        </svg>
        <p className={NOTE_CLASS}>
          {`Com ${formatOccurrences(TREE_MIN_OCCURRENCES)} ou mais, a mesma peça desenha a árvore. As reticências marcam o corte da janela de ${formatInt(CONTEXT_WORDS)} palavras por lado.`}
        </p>
      </div>
    );
  }

  const layout = treeLayout ?? buildTreeLayout(tree, measure);
  const { root, leaves } = layout;
  const leader = root.children[0];
  const leaderRate = leader ? formatRateWithVolume(leader.count, root.count) : '';
  const summary = [
    `Árvore de palavras com o que vem depois de ${root.label}, que tem ${occurrences} em ${answers} de ${span}.`,
    leader ? `A continuação mais comum é “${leader.label}”, em ${leaderRate} delas.` : '',
    `${countOf(leaves.length, 'ramo desenhado', 'ramos desenhados')} e ${formatInt(tree.omittedBranches)} fora pela poda.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn(ROOT_CLASS, className)} ref={rootRef} role="figure" style={style}>
      {/* Lista equivalente para leitor de tela: um item por ramo, da raiz até a folha, com a contagem. */}
      <ul className="sr-only text-xs leading-4">
        {leaves.map((leaf) => (
          <li key={leaf.id}>{`${leaf.phrase}: ${formatOccurrences(leaf.count)}`}</li>
        ))}
      </ul>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{root.label}</span> tem <span className="tabular-nums">{occurrences}</span> em{' '}
        <span className="tabular-nums">{answers}</span> de {span}
        {leader ? (
          <>
            ; a continuação mais comum é <span className="font-semibold text-text-primary">{leader.label}</span>, em{' '}
            <span className="tabular-nums text-text-primary">{leaderRate}</span>
          </>
        ) : null}
        .
      </p>
      <svg aria-hidden className={SVG_CLASS} height={layout.height} viewBox={`0 0 ${String(layout.width)} ${String(layout.height)}`} width={layout.width}>
        {layout.links.map((link) => (
          // O conector é dado (ACE-6): `--text-muted` passa de 3:1 nos dois temas, `--line-strong` não.
          <path d={link.d} fill="none" key={link.id} stroke="var(--text-muted)" strokeWidth={CONNECTOR_STROKE} vectorEffect="non-scaling-stroke" />
        ))}
        {layout.nodes.map((node) => (
          <g key={node.id}>
            {/* A dica acrescenta o que o desenho não escreve: a parcela das ocorrências que passam pelo nó. */}
            <title>{`${node.phrase}: ${formatRateWithVolume(node.count, root.count)} das ocorrências de ${root.label}`}</title>
            <text dominantBaseline="central" fill={node === root ? 'var(--text-primary)' : 'var(--text-secondary)'} fontSize={node.fontSize} fontWeight={node.weight} x={node.x} y={node.y}>
              {node.label}
            </text>
            {node !== root && node.children.length === 0 ? (
              <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={COUNT_FONT} fontWeight={500} x={node.x + node.width + COUNT_GAP} y={node.y}>
                {formatOccurrences(node.count)}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      <p className={NOTE_CLASS}>
        {/* A contagem que ordena os irmãos não está escrita nos nós do meio: a nota declara a ordem (GEO-12). */}
        {`Tamanho da palavra pela raiz quadrada das ocorrências; ramos irmãos do mais para o menos frequente. Com menos de ${formatOccurrences(TREE_MIN_OCCURRENCES)}, a peça troca a árvore pela concordância.`}
        {tree.omittedBranches > 0
          ? ` A poda tirou ${countOf(tree.omittedBranches, 'ramo', 'ramos')} com menos de ${formatOccurrences(MIN_COUNT)}.`
          : ''}
      </p>
    </div>
  );
}
