import { Filter } from 'lucide-react';
import { useMemo, useState } from 'react';

import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  highlightId as defaultHighlightId,
  type Lineage,
  type LineageGroup,
  type LineageLink,
} from './data';

/**
 * Feixe hierárquico de arestas com a dependência interna em destaque: um indicador que usa outro
 * indicador do mesmo dashboard sobe só até o pai comum, o grupo, e a curva dele sai curta, colada ao
 * perímetro, onde some no meio dos feixes que atravessam o círculo. Responde quantas dessas
 * dependências cada dashboard tem e onde elas estão.
 *
 * A curva (`bundlePath`) é a do modelo: ancestrais do caminho como pontos de controle
 * (`controlPoints`), tensão β e B-spline cúbica uniforme convertida em Bézier cúbica. No mesmo grupo
 * o caminho tem três pontos (folha, grupo, folha); entre dashboards, cinco; entre fonte e indicador,
 * sete, com a raiz no meio.
 *
 * Três papéis de ligação por cima do feixe neutro, que é desenhado primeiro. O que entra e o que sai da folha
 * selecionada vai em duas cores e dois traços, para o sentido não depender só da cor (ACE-2):
 * entrada em `--chart-1` contínuo, saída em `--chart-6` tracejado. A ligação interna das demais
 * folhas vai em `--chart-3` e é desenhada por último, para não ficar sob os feixes. As três levam
 * revestimento na cor do cartão (TOK-4). O resto é `--text-muted` a 0,76 de opacidade, que mede
 * 3,58:1 no escuro e 3,28:1 no claro; o piso fica em 0,72 (ACE-5).
 *
 * Texto sempre horizontal (TIP-5): o nome do grupo fica fora do círculo, junto do arco dele
 * (`placeLabels`). O `viewBox` tem o tamanho do corpo medido do cartão, 574 x 425 px, e a escala do
 * `<svg>` sai 1.
 */
export interface InternalDependencyBundleProps {
  readonly data?: Lineage;
  /** Id da folha selecionada. Id que não existe deixa só as internas em destaque. */
  readonly highlightId?: string;
  /** Tensão β do feixe: 0 devolve retas, 1 cola a curva no caminho da hierarquia. */
  readonly tension?: number;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo medido do canvas alto na moldura card, com o caso de uso em duas linhas. */
const VIEW_W = 574;
const VIEW_H = 425;
const FRAME = { cx: 287, cy: 262, radius: 126 } as const;
/** Raio do nó de grupo e do nó de ramo, em fração do raio das folhas; a raiz fica no centro. */
const GROUP_RADIUS_RATIO = 0.6;
const BRANCH_RADIUS_RATIO = 0.2;
/** Vão entre dois grupos do mesmo ramo e entre dois ramos, em vagas de folha. */
const GROUP_GAP_STEPS = 1.5;
const BRANCH_GAP_STEPS = 3;
/** Quanto o arco do grupo passa da primeira e da última folha, em fração de vaga. */
const ARC_OVERHANG_STEPS = 0.35;
/** Padrão do Farol: abaixo disso o feixe se desfaz em retas, acima tudo vira um feixe só. */
const DEFAULT_TENSION = 0.85;
const NODE_RADIUS = 2.4;
const NODE_RADIUS_PARTNER = 3.4;
const NODE_RADIUS_SELECTED = 5;
const ARC_WIDTH = 1.5;
const EDGE_WIDTH = 1;
const EDGE_WIDTH_LIT = 2;
/** Revestimento na cor do cartão: 1 px de cada lado da ligação colorida (TOK-4). */
const EDGE_CASING = 2;
/** Opacidade da ligação fora de foco. Piso medido de `--text-muted` para 3:1: 0,72 (ACE-5). */
const DIM_OPACITY = 0.76;
/** A saída é tracejada para o sentido não depender só da cor (ACE-2). */
const OUT_DASH = '5 3';
const LABEL_FONT_PX = 11;
const READING_FONT_PX = 12;
/** Meia altura da caixa do rótulo de 11 px, com a letra que desce (GEO-19). */
const LABEL_HALF_HEIGHT = 6;
const LABEL_GAP = 4;
/** Raio livre em volta das folhas: a maior delas, a selecionada, mais 2 px. */
const LABEL_CLEAR_RADIUS = FRAME.radius + NODE_RADIUS_SELECTED + 2;
/** Quanto o rótulo se afasta do raio das folhas, medido no ângulo dele. */
const LABEL_RADIUS_OFFSET = 14;
/** Respiro mínimo entre duas caixas de rótulo (ROT-9). */
const LABEL_RESPIRO = 4;
const PUSH_STEP = 2;
const MAX_PUSH_TRIES = 40;
/** Largura média por caractere, em em, só para estimar a caixa do rótulo: sempre para mais. */
const CHAR_WIDTH_FACTOR = 0.6;
const READING_Y = 8;
/** Bloco acima do círculo: a legenda de sentido à esquerda e a contagem por dashboard à direita. */
const BLOCK_TOP_Y = 32;
const BLOCK_ROW_PITCH = 15;
const LEGEND_SAMPLE_WIDTH = 18;
const LEGEND_TEXT_X = 24;
const TABLE_X = 344;
const TABLE_VALUE_X = VIEW_W - 2;
const FOOTER_Y = VIEW_H - 8;
const SOURCES_ID = 'fontes';
const INDICATORS_ID = 'indicadores';

interface Point {
  readonly x: number;
  readonly y: number;
}

/** Centro e raio das folhas de uma volta. */
interface Frame {
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
}

interface PlacedLeaf {
  readonly id: string;
  readonly label: string;
  readonly inSentence: string;
  readonly groupId: string;
  readonly branchId: string;
  /** Ângulo em graus, anti-horário a partir do topo. */
  readonly theta: number;
  readonly point: Point;
}

interface PlacedGroup {
  readonly id: string;
  readonly label: string;
  readonly inSentence: string;
  readonly branchId: string;
  readonly first: number;
  readonly last: number;
  readonly leaves: readonly PlacedLeaf[];
}

interface PlacedBranch {
  readonly id: string;
  readonly first: number;
  readonly last: number;
}

interface PlacedEdge {
  readonly id: string;
  readonly from: PlacedLeaf;
  readonly to: PlacedLeaf;
  readonly d: string;
}

interface Layout {
  readonly leaves: ReadonlyMap<string, PlacedLeaf>;
  readonly groups: readonly PlacedGroup[];
  readonly branches: readonly PlacedBranch[];
  readonly groupNodes: ReadonlyMap<string, Point>;
  readonly branchNodes: ReadonlyMap<string, Point>;
  /** Passo angular entre duas folhas vizinhas do mesmo grupo, em graus. */
  readonly step: number;
}

interface Branch {
  readonly id: string;
  readonly groups: readonly LineageGroup[];
}

/** Uma casa basta para coordenada, e o SVG do preview fica menor. */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function fmt(value: number): string {
  return String(round1(value));
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Ângulo anti-horário a partir do topo: 90 graus é a esquerda, 270 é a direita. */
function polar(frame: Frame, radius: number, theta: number): Point {
  return { x: frame.cx - radius * Math.sin(toRadians(theta)), y: frame.cy - radius * Math.cos(toRadians(theta)) };
}

/**
 * Layout radial de dendrograma. A volta tem uma vaga por folha, um vão entre dois grupos do mesmo
 * ramo e um vão maior entre dois ramos, o do topo incluso; o passo sai de 360 dividido pelo total.
 * A ordem é a do dado, em sentido anti-horário a partir do topo. O nó do grupo fica no meio angular
 * das folhas dele, num raio menor; o do ramo, no meio dos grupos dele, mais perto do centro; a raiz
 * é o centro. Grupo sem folha não entra.
 */
function buildLayout(source: readonly Branch[], frame: Frame): Layout | null {
  const filled = source
    .map((branch) => ({ id: branch.id, groups: branch.groups.filter((group) => group.leaves.length > 0) }))
    .filter((branch) => branch.groups.length > 0);
  if (filled.length === 0) return null;
  let leafCount = 0;
  let groupCount = 0;
  for (const branch of filled) {
    groupCount += branch.groups.length;
    for (const group of branch.groups) leafCount += group.leaves.length;
  }
  const slots = leafCount + (groupCount - filled.length) * GROUP_GAP_STEPS + filled.length * BRANCH_GAP_STEPS;
  const step = 360 / slots;

  const leaves = new Map<string, PlacedLeaf>();
  const groupNodes = new Map<string, Point>();
  const branchNodes = new Map<string, Point>();
  const groups: PlacedGroup[] = [];
  const branches: PlacedBranch[] = [];
  // O vão do topo fica metade de cada lado: a primeira folha começa meio vão depois do topo.
  let cursor = ((BRANCH_GAP_STEPS - 1) / 2) * step;
  for (const branch of filled) {
    const branchFirst = cursor + step;
    for (const [groupIndex, group] of branch.groups.entries()) {
      if (groupIndex > 0) cursor += GROUP_GAP_STEPS * step;
      const first = cursor + step;
      const placed: PlacedLeaf[] = [];
      for (const leaf of group.leaves) {
        cursor += step;
        const item: PlacedLeaf = {
          id: leaf.id,
          label: leaf.label,
          inSentence: leaf.inSentence,
          groupId: group.id,
          branchId: branch.id,
          theta: cursor,
          point: polar(frame, frame.radius, cursor),
        };
        leaves.set(leaf.id, item);
        placed.push(item);
      }
      groups.push({ id: group.id, label: group.label, inSentence: group.inSentence, branchId: branch.id, first, last: cursor, leaves: placed });
      groupNodes.set(group.id, polar(frame, frame.radius * GROUP_RADIUS_RATIO, (first + cursor) / 2));
    }
    branches.push({ id: branch.id, first: branchFirst, last: cursor });
    branchNodes.set(branch.id, polar(frame, frame.radius * BRANCH_RADIUS_RATIO, (branchFirst + cursor) / 2));
    cursor += BRANCH_GAP_STEPS * step;
  }
  return { leaves, groups, branches, groupNodes, branchNodes, step };
}

/**
 * Pontos de controle da ligação: os ancestrais do caminho de `a` até `b`, com o ancestral comum
 * incluso. No mesmo grupo o caminho sobe só até o grupo; no mesmo ramo, até o ramo; entre ramos
 * ele passa pela raiz, no centro.
 */
function controlPoints(a: PlacedLeaf, b: PlacedLeaf, layout: Layout, frame: Frame): readonly Point[] {
  const groupA = layout.groupNodes.get(a.groupId);
  const groupB = layout.groupNodes.get(b.groupId);
  const branchA = layout.branchNodes.get(a.branchId);
  const branchB = layout.branchNodes.get(b.branchId);
  if (!groupA || !groupB || !branchA || !branchB) return [a.point, b.point];
  if (a.groupId === b.groupId) return [a.point, groupA, b.point];
  if (a.branchId === b.branchId) return [a.point, groupA, branchA, groupB, b.point];
  return [a.point, groupA, branchA, { x: frame.cx, y: frame.cy }, branchB, groupB, b.point];
}

/**
 * Função pura da curva, com β como parâmetro: endireita os pontos de controle pela tensão,
 * P' = β·P + (1 − β)·(P0 + t·(Pn − P0)), e converte a B-spline cúbica uniforme em segmentos de
 * Bézier cúbica (`C`). Cada trecho usa quatro nós seguidos (a, b, c, e) e vai de (a + 4b + c)/6 a
 * (b + 4c + e)/6, com controles em (2b + c)/3 e (b + 2c)/3.
 */
function bundlePath(points: readonly Point[], tension: number): string {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last || points.length < 2) return '';
  const steps = points.length - 1;
  const eased = points.map((point, index) => {
    const t = index / steps;
    return {
      x: tension * point.x + (1 - tension) * (first.x + t * (last.x - first.x)),
      y: tension * point.y + (1 - tension) * (first.y + t * (last.y - first.y)),
    };
  });
  // As pontas entram três vezes na lista de nós: sem isso a B-spline não chega até a folha.
  const knots = [first, first, ...eased, last, last];
  let d = `M${fmt(first.x)},${fmt(first.y)}`;
  for (let index = 0; index + 3 < knots.length; index += 1) {
    const b = knots[index + 1];
    const c = knots[index + 2];
    const e = knots[index + 3];
    if (!b || !c || !e) continue;
    d += `C${fmt((2 * b.x + c.x) / 3)},${fmt((2 * b.y + c.y) / 3)} ${fmt((b.x + 2 * c.x) / 3)},${fmt((b.y + 2 * c.y) / 3)} ${fmt((b.x + 4 * c.x + e.x) / 6)},${fmt((b.y + 4 * c.y + e.y) / 6)}`;
  }
  return d;
}

/** Uma curva por ligação. Ligação repetida, de uma folha com ela mesma ou com id desconhecido não entra. */
function buildEdges(links: readonly LineageLink[], layout: Layout, frame: Frame, tension: number): PlacedEdge[] {
  const seen = new Set<string>();
  return links.flatMap((link): PlacedEdge[] => {
    const from = layout.leaves.get(link.from);
    const to = layout.leaves.get(link.to);
    const id = `${link.from}>${link.to}`;
    if (!from || !to || from.id === to.id || seen.has(id)) return [];
    seen.add(id);
    return [{ id, from, to, d: bundlePath(controlPoints(from, to, layout, frame), tension) }];
  });
}

/** Arco de `first` a `last` graus no raio dado, no sentido anti-horário da volta. */
function arcPath(frame: Frame, radius: number, first: number, last: number): string {
  const from = polar(frame, radius, first);
  const to = polar(frame, radius, last);
  // A flag de arco grande liga acima de 180 graus: sem ela o arco daria a volta pelo lado curto.
  const large = last - first > 180 ? 1 : 0;
  return `M${fmt(from.x)},${fmt(from.y)} A${String(radius)},${String(radius)} 0 ${String(large)} 0 ${fmt(to.x)},${fmt(to.y)}`;
}

/**
 * Onde começa um rótulo horizontal na altura `dy`: fora do raio `clear` medido no canto da caixa
 * que fica do lado do equador, e não na linha de base, porque é o canto que reentra no círculo
 * (GEO-19).
 */
function labelOffset(clear: number, dy: number): number {
  const corner = Math.max(0, Math.abs(dy) - LABEL_HALF_HEIGHT);
  return Math.sqrt(Math.max(0, clear * clear - corner * corner)) + LABEL_GAP;
}

/** "1 fonte" no singular, "N fontes" no plural: a contagem nunca sai sem o substantivo (NUM-6). */
function countLabel(value: number, singular: string, plural: string): string {
  return `${formatInt(value)} ${value === 1 ? singular : plural}`;
}

interface LabelSpec {
  readonly id: string;
  readonly theta: number;
  /** Largura estimada da caixa, com o que vai colado no nome (o ícone, na folha selecionada). */
  readonly width: number;
  /** Quem entra primeiro: a folha selecionada antes dos grupos. */
  readonly priority: number;
}

interface PlacedLabel {
  readonly x: number;
  readonly y: number;
  /** -1 quando o rótulo cresce para a esquerda, 1 quando cresce para a direita. */
  readonly direction: -1 | 1;
}

interface Box {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

function tooClose(a: Box, b: Box): boolean {
  return (
    a.left < b.right + LABEL_RESPIRO &&
    b.left < a.right + LABEL_RESPIRO &&
    a.top < b.bottom + LABEL_RESPIRO &&
    b.top < a.bottom + LABEL_RESPIRO
  );
}

/** Comparação por código de caractere: a mesma ordem em qualquer idioma de navegador (seção 10). */
function compareText(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** Estimativa grosseira da largura do rótulo, só para a caixa de colisão: sempre para mais. */
function estimateWidth(text: string): number {
  return text.length * LABEL_FONT_PX * CHAR_WIDTH_FACTOR;
}

/**
 * Rótulo horizontal em volta do círculo (TIP-5): à esquerda do centro ele termina na volta, à
 * direita começa nela. A altura nasce do ângulo, no raio do rótulo; a posição horizontal sai do
 * canto da caixa (`labelOffset`). Quem encosta num rótulo já posto procura a vaga livre mais
 * próxima, um passo para longe do equador, um passo para perto, e assim por diante: o nome do grupo
 * fica junto do arco dele, em vez de subir para cima do arco do vizinho.
 */
function placeLabels(specs: readonly LabelSpec[], frame: Frame, clear: number): ReadonlyMap<string, PlacedLabel> {
  const boxes: Box[] = [];
  const placed = new Map<string, PlacedLabel>();
  const ordered = [...specs].sort(
    (a, b) =>
      b.priority - a.priority ||
      Math.abs(Math.cos(toRadians(a.theta))) - Math.abs(Math.cos(toRadians(b.theta))) ||
      compareText(a.id, b.id),
  );
  for (const spec of ordered) {
    const direction = Math.sin(toRadians(spec.theta)) > 0 ? -1 : 1;
    const away = Math.cos(toRadians(spec.theta)) >= 0 ? -1 : 1;
    const base = -(frame.radius + LABEL_RADIUS_OFFSET) * Math.cos(toRadians(spec.theta));
    const anchorAt = (dy: number): number => frame.cx + direction * labelOffset(clear, dy);
    const boxAt = (dy: number): Box => {
      const x = anchorAt(dy);
      const left = direction === -1 ? x - spec.width : x;
      return { left, right: left + spec.width, top: frame.cy + dy - LABEL_HALF_HEIGHT, bottom: frame.cy + dy + LABEL_HALF_HEIGHT };
    };
    let dy = base;
    let box = boxAt(dy);
    for (let tries = 1; tries <= MAX_PUSH_TRIES; tries += 1) {
      const current = box;
      if (!boxes.some((other) => tooClose(current, other))) break;
      dy = base + (tries % 2 === 1 ? away : -away) * Math.ceil(tries / 2) * PUSH_STEP;
      box = boxAt(dy);
    }
    boxes.push(box);
    placed.set(spec.id, { x: round1(anchorAt(dy)), y: round1(frame.cy + dy), direction });
  }
  return placed;
}

/** "A", "A e B", "A, B e C". */
function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

function groupLabelId(groupId: string): string {
  return `grupo:${groupId}`;
}

function leafLabelId(leafId: string): string {
  return `folha:${leafId}`;
}

interface LegendRow {
  readonly id: string;
  readonly color: string;
  readonly width: number;
  readonly dash?: string;
  readonly opacity?: number;
  readonly count: number | null;
  readonly text: string;
}

export default function InternalDependencyBundle({
  data = defaultData,
  highlightId = defaultHighlightId,
  tension = DEFAULT_TENSION,
  height,
  className,
}: InternalDependencyBundleProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const style = height === undefined ? undefined : { height };
  const beta = Math.max(0, Math.min(1, tension));
  const layout = useMemo(
    () =>
      buildLayout(
        [
          { id: SOURCES_ID, groups: data.sources },
          { id: INDICATORS_ID, groups: data.indicators },
        ],
        FRAME,
      ),
    [data],
  );
  const edges = useMemo(
    () => (layout === null ? [] : buildEdges(data.links, layout, FRAME, beta)),
    [data, layout, beta],
  );
  const selected = layout?.leaves.get(hoverId ?? highlightId) ?? null;
  const labels = useMemo(() => {
    if (layout === null) return new Map<string, PlacedLabel>();
    const specs: LabelSpec[] = layout.groups.map((group) => ({
      id: groupLabelId(group.id),
      theta: (group.first + group.last) / 2,
      width: estimateWidth(group.label),
      priority: 0,
    }));
    // A folha selecionada entra antes: o nome dela fica junto da folha e os grupos se ajeitam.
    if (selected) {
      specs.push({ id: leafLabelId(selected.id), theta: selected.theta, width: estimateWidth(selected.label), priority: 1 });
    }
    return placeLabels(specs, FRAME, LABEL_CLEAR_RADIUS);
  }, [layout, selected]);

  if (layout === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma fonte nem indicador neste recorte: sem procedência cadastrada, não há feixe a desenhar.</span>
      </div>
    );
  }

  const leafList = [...layout.leaves.values()];
  const outCount = new Map<string, number>();
  const inCount = new Map<string, number>();
  const internalByGroup = new Map<string, number>();
  for (const edge of edges) {
    outCount.set(edge.from.id, (outCount.get(edge.from.id) ?? 0) + 1);
    inCount.set(edge.to.id, (inCount.get(edge.to.id) ?? 0) + 1);
    if (edge.from.groupId === edge.to.groupId) {
      internalByGroup.set(edge.from.groupId, (internalByGroup.get(edge.from.groupId) ?? 0) + 1);
    }
  }
  // Precedência: o que toca a folha selecionada sai na cor do sentido; a interna das demais, em
  // `--chart-3`; o resto fica neutro. No dado padrão os três conjuntos não se cruzam.
  const inEdges = selected ? edges.filter((edge) => edge.to.id === selected.id) : [];
  const outEdges = selected ? edges.filter((edge) => edge.from.id === selected.id) : [];
  const freeEdges = selected
    ? edges.filter((edge) => edge.to.id !== selected.id && edge.from.id !== selected.id)
    : edges;
  const internalEdges = freeEdges.filter((edge) => edge.from.groupId === edge.to.groupId);
  const restEdges = freeEdges.filter((edge) => edge.from.groupId !== edge.to.groupId);
  const feeders = new Set(inEdges.map((edge) => edge.from.id));
  const dependents = new Set(outEdges.map((edge) => edge.to.id));

  // Contagem por dashboard, do que tem mais internas ao que tem menos; zero medido fica escrito.
  const tableRows = layout.groups
    .filter((group) => group.branchId === INDICATORS_ID)
    .map((group) => ({ group, count: internalByGroup.get(group.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);
  let internalTotal = 0;
  for (const count of internalByGroup.values()) internalTotal += count;
  const topCount = tableRows[0]?.count ?? 0;
  const tops = topCount > 0 ? tableRows.filter((row) => row.count === topCount) : [];
  const topSentence =
    tops.length === 0
      ? ''
      : tops.length === 1
        ? `o ${tops[0]?.group.inSentence ?? ''} tem mais, com ${formatInt(topCount)}`
        : `${joinNames(tops.map((row) => row.group.inSentence))} empatam, com ${formatInt(topCount)} cada`;
  const overhang = layout.step * ARC_OVERHANG_STEPS;
  const selectedLabel = selected ? labels.get(leafLabelId(selected.id)) : undefined;

  const summary = [
    `Feixe hierárquico de arestas com ${countLabel(leafList.length, 'folha', 'folhas')} e ${countLabel(edges.length, 'dependência', 'dependências')}.`,
    internalTotal === 0
      ? 'Nenhuma dependência fica dentro do mesmo dashboard.'
      : `${countLabel(internalTotal, 'dependência fica', 'dependências ficam')} dentro do mesmo dashboard, e ${topSentence}.`,
    selected
      ? `A folha selecionada, ${selected.inSentence}, tem ${countLabel(inEdges.length, 'entrada', 'entradas')} e ${countLabel(outEdges.length, 'saída', 'saídas')}.`
      : 'Nenhuma folha está selecionada.',
  ].join(' ');

  const legendRows: LegendRow[] = [
    ...(selected
      ? [
          {
            id: 'entrada',
            color: 'var(--chart-1)',
            width: EDGE_WIDTH_LIT,
            count: inEdges.length,
            text: `${inEdges.length === 1 ? ' entrada' : ' entradas'}: de que ${selected.inSentence} depende`,
          },
          {
            id: 'saida',
            color: 'var(--chart-6)',
            width: EDGE_WIDTH_LIT,
            dash: OUT_DASH,
            count: outEdges.length,
            text: `${outEdges.length === 1 ? ' saída' : ' saídas'}: quem depende de ${selected.inSentence}`,
          },
        ]
      : []),
    { id: 'interna', color: 'var(--chart-3)', width: EDGE_WIDTH_LIT, count: null, text: 'interna: dentro do mesmo dashboard' },
    { id: 'demais', color: 'var(--text-muted)', width: EDGE_WIDTH, opacity: DIM_OPACITY, count: null, text: 'demais dependências, entre grupos' },
  ];

  const figure = (value: number) => (
    <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
      {formatInt(value)}
    </tspan>
  );
  const textProps = { className: 'font-sans', dominantBaseline: 'central', fontSize: LABEL_FONT_PX } as const;

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <text
          className="font-sans"
          dominantBaseline="central"
          fill="var(--text-secondary)"
          fontSize={READING_FONT_PX}
          x={0}
          y={READING_Y}
        >
          {internalTotal === 0 ? (
            'Nenhuma dependência fica dentro do mesmo dashboard neste recorte.'
          ) : (
            <>
              {figure(internalTotal)}
              {internalTotal === 1 ? ' dependência fica' : ' dependências ficam'}
              {' dentro do mesmo dashboard; '}
              {tops.length === 1 ? 'o ' : ''}
              <tspan fill="var(--text-primary)" fontWeight={600}>
                {joinNames(tops.map((row) => row.group.inSentence))}
              </tspan>
              {tops.length === 1 ? ' tem mais, com ' : ' empatam, com '}
              {figure(topCount)}
              {tops.length === 1 ? '.' : ' cada.'}
            </>
          )}
        </text>

        {/* Legenda acima do desenho (ROT-4): os dois sentidos da folha selecionada, a interna e o feixe neutro. */}
        {legendRows.map((row, index) => {
          const y = BLOCK_TOP_Y + index * BLOCK_ROW_PITCH;
          return (
            <g key={`legend-${row.id}`}>
              <line
                stroke={row.color}
                strokeDasharray={row.dash}
                strokeOpacity={row.opacity}
                strokeWidth={row.width}
                x1={0}
                x2={LEGEND_SAMPLE_WIDTH}
                y1={y}
                y2={y}
              />
              <text {...textProps} fill="var(--text-secondary)" x={LEGEND_TEXT_X} y={y}>
                {row.count === null ? null : (
                  <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>
                    {formatInt(row.count)}
                  </tspan>
                )}
                {row.text}
              </text>
            </g>
          );
        })}

        {/* Contagem por dashboard: nome à esquerda, número à direita em coluna (TIP-6). */}
        <text {...textProps} fill="var(--text-muted)" x={TABLE_X} y={BLOCK_TOP_Y}>
          Dependências internas por dashboard
        </text>
        {tableRows.map((row, index) => {
          const y = BLOCK_TOP_Y + (index + 1) * BLOCK_ROW_PITCH + 2;
          return (
            <g key={`row-${row.group.id}`}>
              <text {...textProps} fill="var(--text-secondary)" x={TABLE_X} y={y}>
                {row.group.label}
              </text>
              <text
                {...textProps}
                className="font-display"
                fill="var(--text-primary)"
                fontWeight={500}
                textAnchor="end"
                x={TABLE_VALUE_X}
                y={y}
              >
                {formatInt(row.count)}
              </text>
            </g>
          );
        })}

        {/* Fora de foco a ligação continua sendo dado: `--text-muted` a 0,76 mede 3,58:1 e 3,28:1;
            abaixo de 0,72 cai do piso (ACE-5). */}
        {restEdges.map((edge) => (
          <path
            d={edge.d}
            fill="none"
            key={`rest-${edge.id}`}
            stroke="var(--text-muted)"
            strokeOpacity={DIM_OPACITY}
            strokeWidth={EDGE_WIDTH}
          />
        ))}
        {/* Revestimento antes de cada traço colorido: sem ele a cor se funde com o cinza que ela cruza (TOK-4). */}
        {[...inEdges, ...outEdges].map((edge) => (
          <path
            d={edge.d}
            fill="none"
            key={`casing-${edge.id}`}
            stroke="var(--surface-raised)"
            strokeWidth={EDGE_WIDTH_LIT + EDGE_CASING}
          />
        ))}
        {inEdges.map((edge) => (
          <path
            d={edge.d}
            fill="none"
            key={`in-${edge.id}`}
            stroke="var(--chart-1)"
            strokeLinecap="round"
            strokeWidth={EDGE_WIDTH_LIT}
          />
        ))}
        {outEdges.map((edge) => (
          <path
            d={edge.d}
            fill="none"
            key={`out-${edge.id}`}
            stroke="var(--chart-6)"
            strokeDasharray={OUT_DASH}
            strokeWidth={EDGE_WIDTH_LIT}
          />
        ))}
        {/* A interna vem por último: a curva curta junto do perímetro não pode ficar sob os feixes. */}
        {internalEdges.map((edge) => (
          <path
            d={edge.d}
            fill="none"
            key={`internal-casing-${edge.id}`}
            stroke="var(--surface-raised)"
            strokeWidth={EDGE_WIDTH_LIT + EDGE_CASING}
          />
        ))}
        {internalEdges.map((edge) => (
          <path
            d={edge.d}
            fill="none"
            key={`internal-${edge.id}`}
            stroke="var(--chart-3)"
            strokeLinecap="round"
            strokeWidth={EDGE_WIDTH_LIT}
          />
        ))}

        {/* O arco diz a que grupo a folha pertence, então é dado e mede 3:1 (ACE-6): `--text-muted`. */}
        {layout.groups.map((group) => (
          <path
            d={arcPath(FRAME, FRAME.radius, group.first - overhang, group.last + overhang)}
            fill="none"
            key={`arc-${group.id}`}
            stroke="var(--text-muted)"
            strokeWidth={ARC_WIDTH}
          />
        ))}

        {leafList.map((leaf) => {
          const isSelected = leaf.id === selected?.id;
          const isFeeder = feeders.has(leaf.id);
          const isDependent = dependents.has(leaf.id);
          return (
            <g
              key={`leaf-${leaf.id}`}
              onMouseEnter={() => {
                setHoverId(leaf.id);
              }}
              onMouseLeave={() => {
                setHoverId(null);
              }}
            >
              {/* Dica: o nome e as duas contagens de cada folha, que o corpo só escreve para a
                  selecionada (DIC-1). */}
              <title>{`${leaf.label}: ${countLabel(inCount.get(leaf.id) ?? 0, 'entrada', 'entradas')} e ${countLabel(outCount.get(leaf.id) ?? 0, 'saída', 'saídas')}`}</title>
              <circle
                cx={round1(leaf.point.x)}
                cy={round1(leaf.point.y)}
                fill={
                  isSelected
                    ? 'var(--text-primary)'
                    : isFeeder
                      ? 'var(--chart-1)'
                      : isDependent
                        ? 'var(--chart-6)'
                        : 'var(--text-secondary)'
                }
                r={isSelected ? NODE_RADIUS_SELECTED : isFeeder || isDependent ? NODE_RADIUS_PARTNER : NODE_RADIUS}
                stroke="var(--surface-raised)"
                strokeWidth={1}
              />
            </g>
          );
        })}

        {layout.groups.map((group) => {
          const label = labels.get(groupLabelId(group.id));
          if (!label) return null;
          return (
            <text
              {...textProps}
              fill="var(--text-secondary)"
              fontWeight={500}
              key={`group-${group.id}`}
              textAnchor={label.direction === -1 ? 'end' : 'start'}
              x={label.x}
              y={label.y}
            >
              {group.label}
            </text>
          );
        })}
        {selected && selectedLabel ? (
          <text
            {...textProps}
            fill="var(--text-primary)"
            fontWeight={700}
            textAnchor={selectedLabel.direction === -1 ? 'end' : 'start'}
            x={selectedLabel.x}
            y={selectedLabel.y}
          >
            {selected.label}
          </text>
        ) : null}

        <text {...textProps} fill="var(--text-muted)" x={0} y={FOOTER_Y}>
          {'Tensão do feixe: '}
          <tspan className="font-display" fontWeight={500}>
            {formatDecimal(beta, 2)}
          </tspan>
          .
        </text>
      </svg>
    </div>
  );
}
