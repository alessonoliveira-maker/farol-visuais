import { Filter, Unplug } from 'lucide-react';
import { useMemo } from 'react';

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
 * Feixe hierárquico de arestas com uma fonte selecionada: as folhas da procedência ficam num
 * círculo, agrupadas pelo sistema ou pelo dashboard, e cada dependência é uma curva que acompanha o
 * caminho da hierarquia. Responde o que para se a fonte selecionada falhar: as dependências dela
 * acendem em `--negative`, os indicadores atingidos entram numa lista ao lado, agrupados por
 * dashboard, e a contagem vai escrita na linha de leitura.
 *
 * A curva (`bundlePath`) é a do modelo: ancestrais do caminho como pontos de controle
 * (`controlPoints`), tensão β e B-spline cúbica uniforme convertida em Bézier cúbica.
 *
 * O alerta não depende só da cor (ACE-2): a ligação acesa é mais grossa e leva revestimento na cor
 * do cartão (TOK-4), a folha atingida cresce, o nome da fonte vai em peso 700 com o ícone `Unplug`
 * ao lado, e os atingidos estão escritos na lista. As demais ligações continuam sendo dado, então
 * medem 3:1 (ACE-6): `--text-muted` a 0,76 de opacidade, que dá 3,58:1 no escuro e 3,28:1 no claro;
 * o piso fica em 0,72 (ACE-5). O catálogo pedia 0,2 de opacidade, que apaga a forma em vez de
 * mantê-la.
 *
 * Texto sempre horizontal (TIP-5): o nome do grupo fica fora do círculo, junto do arco dele
 * (`placeLabels`). O `viewBox` tem o tamanho do corpo medido do cartão, 894 x 281 px, e a escala do
 * `<svg>` sai 1.
 */
export interface SourceImpactBundleProps {
  readonly data?: Lineage;
  /** Id da fonte selecionada. Id que não existe deixa tudo em neutro e a lista dá lugar a um aviso. */
  readonly highlightId?: string;
  /** Tensão β do feixe: 0 devolve retas, 1 cola a curva no caminho da hierarquia. */
  readonly tension?: number;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo medido do canvas largo na moldura card, com o caso de uso em uma linha. */
const VIEW_W = 894;
const VIEW_H = 281;
const FRAME = { cx: 246, cy: 146, radius: 100 } as const;
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
const NODE_RADIUS = 2.2;
const NODE_RADIUS_HIT = 3.4;
const NODE_RADIUS_SELECTED = 5;
const ARC_WIDTH = 1.5;
const EDGE_WIDTH = 1;
const EDGE_WIDTH_LIT = 2;
/** Revestimento na cor do cartão: 1 px de cada lado da ligação acesa (TOK-4). */
const EDGE_CASING = 2;
/** Opacidade da ligação fora de foco. Piso medido de `--text-muted` para 3:1: 0,72 (ACE-5). */
const DIM_OPACITY = 0.76;
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
const ICON_SIZE = 14;
const ICON_GAP = 4;
const READING_Y = 8;
/** Lista lateral: duas colunas à direita do círculo. */
const LIST_X = 506;
const LIST_COLUMN_WIDTH = 184;
const LIST_COLUMN_GAP = 16;
const LIST_TITLE_Y = 34;
const LIST_FIRST_ROW_Y = 56;
const LIST_ROW_PITCH = 15;
const LIST_GROUP_GAP = 8;
const LIST_DOT_RADIUS = 3;
const LIST_INDENT = 12;
const LEGEND_ROWS_Y = [246, 261] as const;
const LEGEND_SAMPLE_WIDTH = 18;
const LEGEND_TEXT_X = LIST_X + 24;
const FOOTER_Y = 273;
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

interface ImpactBlock {
  readonly group: PlacedGroup;
  readonly hit: readonly PlacedLeaf[];
  readonly column: number;
  readonly y: number;
}

/**
 * Lista lateral: um bloco por dashboard, do mais atingido ao menos, com o empate na ordem do dado.
 * Cada bloco ocupa a linha do nome e uma linha por indicador atingido; dashboard sem nenhum não
 * some, fica com a linha que diz isso. Os blocos enchem a primeira coluna até a metade das linhas e
 * seguem na segunda.
 */
function buildBlocks(groups: readonly PlacedGroup[], dependents: ReadonlySet<string>): ImpactBlock[] {
  const ranked = groups
    .map((group) => ({ group, hit: group.leaves.filter((leaf) => dependents.has(leaf.id)) }))
    .sort((a, b) => b.hit.length - a.hit.length);
  const linesOf = (hit: readonly PlacedLeaf[]): number => 1 + Math.max(1, hit.length);
  let totalLines = 0;
  for (const entry of ranked) totalLines += linesOf(entry.hit);
  const nextY = [LIST_FIRST_ROW_Y, LIST_FIRST_ROW_Y];
  let used = 0;
  return ranked.map((entry) => {
    const lines = linesOf(entry.hit);
    const column = 2 * used + lines <= totalLines ? 0 : 1;
    used += lines;
    const y = nextY[column] ?? LIST_FIRST_ROW_Y;
    nextY[column] = y + lines * LIST_ROW_PITCH + LIST_GROUP_GAP;
    return { group: entry.group, hit: entry.hit, column, y };
  });
}

function groupLabelId(groupId: string): string {
  return `grupo:${groupId}`;
}

function leafLabelId(leafId: string): string {
  return `folha:${leafId}`;
}

export default function SourceImpactBundle({
  data = defaultData,
  highlightId = defaultHighlightId,
  tension = DEFAULT_TENSION,
  height,
  className,
}: SourceImpactBundleProps) {
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
  const highlight = layout?.leaves.get(highlightId) ?? null;
  const labels = useMemo(() => {
    if (layout === null) return new Map<string, PlacedLabel>();
    const specs: LabelSpec[] = layout.groups.map((group) => ({
      id: groupLabelId(group.id),
      theta: (group.first + group.last) / 2,
      width: estimateWidth(group.label),
      priority: 0,
    }));
    // A fonte selecionada entra antes: o nome dela fica junto da folha e os grupos se ajeitam.
    if (highlight) {
      specs.push({
        id: leafLabelId(highlight.id),
        theta: highlight.theta,
        width: estimateWidth(highlight.label) + ICON_SIZE + ICON_GAP,
        priority: 1,
      });
    }
    return placeLabels(specs, FRAME, LABEL_CLEAR_RADIUS);
  }, [layout, highlight]);

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
  const sourceCount = leafList.filter((leaf) => leaf.branchId === SOURCES_ID).length;
  const indicatorCount = leafList.length - sourceCount;
  const outCount = new Map<string, number>();
  const inCount = new Map<string, number>();
  for (const edge of edges) {
    outCount.set(edge.from.id, (outCount.get(edge.from.id) ?? 0) + 1);
    inCount.set(edge.to.id, (inCount.get(edge.to.id) ?? 0) + 1);
  }
  const litEdges = highlight ? edges.filter((edge) => edge.from.id === highlight.id) : [];
  const dimEdges = highlight ? edges.filter((edge) => edge.from.id !== highlight.id) : edges;
  const dependents = new Set(litEdges.map((edge) => edge.to.id));
  const blocks = highlight
    ? buildBlocks(
        layout.groups.filter((group) => group.branchId === INDICATORS_ID),
        dependents,
      )
    : [];
  const worst = blocks[0];
  const hitCount = dependents.size;
  const overhang = layout.step * ARC_OVERHANG_STEPS;
  const selectedLabel = highlight ? labels.get(leafLabelId(highlight.id)) : undefined;

  const summary = [
    `Feixe hierárquico de arestas com ${countLabel(sourceCount, 'fonte de dado', 'fontes de dado')} e ${countLabel(indicatorCount, 'indicador', 'indicadores')}, ligados por ${countLabel(edges.length, 'dependência', 'dependências')}.`,
    highlight
      ? `${formatInt(hitCount)} de ${countLabel(indicatorCount, 'indicador', 'indicadores')} ${hitCount === 1 ? 'depende' : 'dependem'} de ${highlight.inSentence} e ${hitCount === 1 ? 'para' : 'param'} se a fonte falhar${worst && worst.hit.length > 0 ? `; o mais atingido é o ${worst.group.inSentence}, com ${formatInt(worst.hit.length)}` : ''}.`
      : 'Nenhuma fonte está selecionada, e nenhuma dependência aparece em destaque.',
  ].join(' ');

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
          {highlight ? (
            <>
              {figure(hitCount)}
              {' de '}
              {figure(indicatorCount)}
              {indicatorCount === 1 ? ' indicador ' : ' indicadores '}
              {hitCount === 1 ? 'depende de ' : 'dependem de '}
              <tspan fill="var(--text-primary)" fontWeight={600}>
                {highlight.label}
              </tspan>
              {hitCount === 1 ? ' e para se a fonte falhar.' : ' e param se a fonte falhar.'}
            </>
          ) : (
            'Nenhuma fonte selecionada: sem ela, o feixe mostra só a forma da procedência.'
          )}
        </text>

        {/* Fora de foco a ligação continua sendo dado: `--text-muted` a 0,76 mede 3,58:1 e 3,28:1;
            abaixo de 0,72 cai do piso (ACE-5). */}
        {dimEdges.map((edge) => (
          <path
            d={edge.d}
            fill="none"
            key={`dim-${edge.id}`}
            stroke="var(--text-muted)"
            strokeOpacity={DIM_OPACITY}
            strokeWidth={EDGE_WIDTH}
          />
        ))}
        {/* Revestimento antes do traço aceso: sem ele o vermelho se funde com o cinza que cruza (TOK-4). */}
        {litEdges.map((edge) => (
          <path
            d={edge.d}
            fill="none"
            key={`casing-${edge.id}`}
            stroke="var(--surface-raised)"
            strokeWidth={EDGE_WIDTH_LIT + EDGE_CASING}
          />
        ))}
        {litEdges.map((edge) => (
          <path
            d={edge.d}
            fill="none"
            key={`lit-${edge.id}`}
            stroke="var(--negative)"
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
          const isSelected = leaf.id === highlight?.id;
          const isHit = dependents.has(leaf.id);
          const reach =
            leaf.branchId === SOURCES_ID
              ? `alimenta ${countLabel(outCount.get(leaf.id) ?? 0, 'indicador', 'indicadores')}`
              : `depende de ${countLabel(inCount.get(leaf.id) ?? 0, 'fonte', 'fontes')}`;
          return (
            <g key={`leaf-${leaf.id}`}>
              {/* Dica: o nome e a contagem de cada folha, que o corpo só escreve para a selecionada (DIC-1). */}
              <title>{`${leaf.label}: ${reach}`}</title>
              <circle
                cx={round1(leaf.point.x)}
                cy={round1(leaf.point.y)}
                fill={isSelected || isHit ? 'var(--negative)' : 'var(--text-secondary)'}
                r={isSelected ? NODE_RADIUS_SELECTED : isHit ? NODE_RADIUS_HIT : NODE_RADIUS}
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
        {highlight && selectedLabel ? (
          <g>
            {/* O ícone fica entre a folha e o nome: a posição dele não depende da largura do texto. */}
            <Unplug
              aria-hidden
              color="var(--negative)"
              height={ICON_SIZE}
              width={ICON_SIZE}
              x={selectedLabel.direction === -1 ? selectedLabel.x - ICON_SIZE : selectedLabel.x}
              y={selectedLabel.y - ICON_SIZE / 2}
            />
            <text
              {...textProps}
              fill="var(--text-primary)"
              fontWeight={700}
              textAnchor={selectedLabel.direction === -1 ? 'end' : 'start'}
              x={selectedLabel.x + selectedLabel.direction * (ICON_SIZE + ICON_GAP)}
              y={selectedLabel.y}
            >
              {highlight.label}
            </text>
          </g>
        ) : null}

        <text {...textProps} fill="var(--text-muted)" x={LIST_X} y={LIST_TITLE_Y}>
          {highlight
            ? 'Indicadores que param, do dashboard mais atingido ao menos'
            : 'Selecione uma fonte para listar os indicadores que dependem dela.'}
        </text>
        {blocks.map((block) => {
          const x = LIST_X + block.column * (LIST_COLUMN_WIDTH + LIST_COLUMN_GAP);
          return (
            <g key={`block-${block.group.id}`}>
              <text {...textProps} fill="var(--text-primary)" fontWeight={600} x={x} y={block.y}>
                {block.group.label}
              </text>
              <text {...textProps} fill="var(--text-secondary)" textAnchor="end" x={x + LIST_COLUMN_WIDTH} y={block.y}>
                <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
                  {formatInt(block.hit.length)}
                </tspan>
                {' de '}
                <tspan className="font-display" fontWeight={500}>
                  {formatInt(block.group.leaves.length)}
                </tspan>
              </text>
              {block.hit.length === 0 ? (
                <text {...textProps} fill="var(--text-muted)" x={x + LIST_INDENT} y={block.y + LIST_ROW_PITCH}>
                  nenhum indicador atingido
                </text>
              ) : (
                block.hit.map((leaf, index) => (
                  <g key={`hit-${leaf.id}`}>
                    <circle
                      cx={x + LIST_DOT_RADIUS}
                      cy={block.y + (index + 1) * LIST_ROW_PITCH}
                      fill="var(--negative)"
                      r={LIST_DOT_RADIUS}
                    />
                    <text
                      {...textProps}
                      fill="var(--text-secondary)"
                      x={x + LIST_INDENT}
                      y={block.y + (index + 1) * LIST_ROW_PITCH}
                    >
                      {leaf.label}
                    </text>
                  </g>
                ))
              )}
            </g>
          );
        })}

        {/* Legenda ao lado do desenho (ROT-4), com a contagem na frente do texto. */}
        {highlight ? (
          <g>
            <line
              stroke="var(--negative)"
              strokeLinecap="round"
              strokeWidth={EDGE_WIDTH_LIT}
              x1={LIST_X}
              x2={LIST_X + LEGEND_SAMPLE_WIDTH}
              y1={LEGEND_ROWS_Y[0]}
              y2={LEGEND_ROWS_Y[0]}
            />
            <text {...textProps} fill="var(--text-secondary)" x={LEGEND_TEXT_X} y={LEGEND_ROWS_Y[0]}>
              <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>
                {formatInt(litEdges.length)}
              </tspan>
              {litEdges.length === 1 ? ' dependência de ' : ' dependências de '}
              {highlight.inSentence}
            </text>
          </g>
        ) : null}
        <line
          stroke="var(--text-muted)"
          strokeOpacity={DIM_OPACITY}
          strokeWidth={EDGE_WIDTH}
          x1={LIST_X}
          x2={LIST_X + LEGEND_SAMPLE_WIDTH}
          y1={LEGEND_ROWS_Y[1]}
          y2={LEGEND_ROWS_Y[1]}
        />
        <text {...textProps} fill="var(--text-secondary)" x={LEGEND_TEXT_X} y={LEGEND_ROWS_Y[1]}>
          <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>
            {formatInt(dimEdges.length)}
          </tspan>
          {highlight
            ? dimEdges.length === 1
              ? ' dependência de outra fonte'
              : ' dependências das outras fontes'
            : dimEdges.length === 1
              ? ' dependência entre fontes e indicadores'
              : ' dependências entre fontes e indicadores'}
        </text>

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
