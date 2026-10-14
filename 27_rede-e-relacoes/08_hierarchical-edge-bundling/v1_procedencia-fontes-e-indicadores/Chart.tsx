import { Filter } from 'lucide-react';
import { useMemo, useState } from 'react';

import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Lineage, type LineageGroup } from './data';

/**
 * Feixe hierárquico de arestas (hierarchical edge bundling): as folhas de uma hierarquia ficam num
 * círculo, agrupadas pelo pai, e cada dependência entre duas folhas é uma curva que acompanha o
 * caminho da hierarquia, da folha ao grupo, ao ramo, à raiz e de volta. Responde de quais fontes de
 * dado os indicadores dependem e por onde essa dependência passa: ligações de rota parecida viram um
 * feixe que só se abre nas pontas.
 *
 * A curva (`bundlePath`): os pontos de controle são os ancestrais do caminho, com o ancestral comum
 * incluso (`controlPoints`); a tensão β puxa cada ponto para a reta entre as duas folhas,
 * P' = β·P + (1 − β)·(P0 + t·(Pn − P0)); e a B-spline cúbica uniforme desses pontos é convertida em
 * segmentos de Bézier cúbica, com a primeira e a última folha repetidas para a curva tocar nelas.
 *
 * O texto nunca gira (TIP-5). Para 58 nomes caberem na horizontal, a volta é montada por linhas
 * (`buildLayout`): cada lado do círculo é uma coluna de linhas de mesma altura, uma por folha e uma
 * por nome de grupo, e a folha fica no ponto do círculo que está na altura da linha dela. O ângulo
 * sai da linha, e não de um passo angular igual: perto dos polos as folhas se espaçam mais. A ordem
 * é a do dado, em sentido anti-horário a partir do topo, e o corte entre as duas colunas cai entre
 * dois grupos, onde as colunas ficam mais parecidas em número de linhas.
 *
 * A ligação é o dado, então mede 3:1 (ACE-6): `--text-muted` a 0,76 de opacidade, que dá 3,58:1 no
 * escuro e 3,28:1 no claro; o piso fica em 0,72 (ACE-5). O catálogo pedia `--line-strong` com
 * opacidade baixa, que não chega a 3:1 nem opaco. Com o cursor numa folha, o que entra nela acende
 * em `--chart-1` contínuo e o que sai em `--chart-6` tracejado, com revestimento na cor do cartão.
 *
 * O `viewBox` tem o tamanho do corpo medido do cartão, 750 x 497 px, e a escala do `<svg>` sai 1.
 */
export interface LineageBundleProps {
  readonly data?: Lineage;
  /** Tensão β do feixe: 0 devolve retas, 1 cola a curva no caminho da hierarquia. */
  readonly tension?: number;
  /** Id da folha acesa de início. Sem ele, só o cursor acende uma folha. */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo medido do canvas de 816 x 616 na moldura card, com o caso de uso em uma linha. */
const VIEW_W = 750;
const VIEW_H = 497;
/** O centro fica 3 px à esquerda do meio: o nome mais largo do dado está na coluna da direita. */
const CENTER_X = 372;
const CENTER_Y = 248;
const RADIUS = 226;
/** Ângulo, a partir do equador, da primeira e da última linha de cada coluna. */
const MAX_ROW_DEGREES = 74.5;
/** Raio do nó de grupo e do nó de ramo, em fração do raio das folhas; a raiz fica no centro. */
const GROUP_RADIUS_RATIO = 0.6;
const BRANCH_RADIUS_RATIO = 0.2;
/** Padrão do Farol: abaixo disso o feixe se desfaz em retas, acima tudo vira um feixe só. */
const DEFAULT_TENSION = 0.85;
const NODE_RADIUS = 3;
const NODE_RADIUS_LIT = 4.5;
const ARC_WIDTH = 1.5;
const EDGE_WIDTH = 1;
const EDGE_WIDTH_LIT = 2;
/** Revestimento na cor do cartão: 1 px de cada lado da ligação acesa (TOK-4). */
const EDGE_CASING = 2;
/** Opacidade da ligação em repouso. Piso medido de `--text-muted` para 3:1: 0,72 (ACE-5). */
const DIM_OPACITY = 0.76;
/** A saída é tracejada para o sentido não depender só da cor (ACE-2). */
const OUT_DASH = '5 3';
const LABEL_FONT_PX = 11;
const READING_FONT_PX = 12;
/** Meia altura da caixa do rótulo de 11 px, com a letra que desce (GEO-19). */
const LABEL_HALF_HEIGHT = 6;
/** Folga entre a borda de fora das folhas e o canto do rótulo. */
const LABEL_CLEARANCE = 2;
const LABEL_GAP = 4;
/** Distância entre a folha e o nome a partir da qual os dois ganham uma linha de chamada. */
const LEADER_FROM = 14;
const LEADER_INSET = 3;
const READING_Y = 8;
const FOOTER_Y = VIEW_H - 8;
const LEGEND_SAMPLE_WIDTH = 18;

type Side = 'left' | 'right';

interface Point {
  readonly x: number;
  readonly y: number;
}

interface PlacedLeaf {
  readonly id: string;
  readonly label: string;
  readonly inSentence: string;
  readonly groupId: string;
  readonly branchId: string;
  readonly side: Side;
  /** Altura da linha da folha, em px a partir do centro. */
  readonly dy: number;
  /** Ângulo em graus, anti-horário a partir do topo. */
  readonly theta: number;
  readonly point: Point;
}

interface PlacedGroup {
  readonly id: string;
  readonly label: string;
  readonly side: Side;
  readonly headerDy: number;
  readonly first: number;
  readonly last: number;
  readonly leaves: readonly PlacedLeaf[];
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
  readonly groupNodes: ReadonlyMap<string, Point>;
  readonly branchNodes: ReadonlyMap<string, Point>;
}

interface Branch {
  readonly id: string;
  readonly groups: readonly LineageGroup[];
}

const ROOT: Point = { x: CENTER_X, y: CENTER_Y };

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
function polar(radius: number, theta: number): Point {
  return { x: CENTER_X - radius * Math.sin(toRadians(theta)), y: CENTER_Y - radius * Math.cos(toRadians(theta)) };
}

/**
 * Onde começa o rótulo na altura `dy`: fora da borda das folhas medida no canto da caixa que fica
 * do lado do equador, e não na linha de base, porque é o canto que reentra no círculo (GEO-19).
 */
function labelOffset(dy: number): number {
  const clear = RADIUS + NODE_RADIUS + LABEL_CLEARANCE;
  const corner = Math.max(0, Math.abs(dy) - LABEL_HALF_HEIGHT);
  return Math.sqrt(Math.max(0, clear * clear - corner * corner)) + LABEL_GAP;
}

/**
 * Posiciona as folhas por linha. Os grupos seguem a ordem do dado; o corte entre as colunas é o que
 * deixa as duas com o número de linhas mais parecido, contando uma linha por folha e uma pelo nome
 * do grupo. A coluna da esquerda desce do topo; a da direita continua a volta e sobe, então o nome
 * do grupo fica na linha de cima das folhas dele nos dois lados. Grupo sem folha não entra.
 */
function buildLayout(branches: readonly Branch[]): Layout | null {
  const flat = branches.flatMap((branch) =>
    branch.groups
      .filter((group) => group.leaves.length > 0)
      .map((group) => ({ group, branchId: branch.id, rows: group.leaves.length + 1 })),
  );
  if (flat.length === 0) return null;

  let totalRows = 0;
  for (const entry of flat) totalRows += entry.rows;
  let cut = flat.length;
  let leftRows = totalRows;
  let smallestGap = Number.POSITIVE_INFINITY;
  let running = 0;
  flat.forEach((entry, index) => {
    running += entry.rows;
    const gap = Math.abs(2 * running - totalRows);
    if (gap < smallestGap) {
      smallestGap = gap;
      cut = index + 1;
      leftRows = running;
    }
  });
  const rightRows = totalRows - leftRows;
  const rows = Math.max(leftRows, rightRows);
  // Passo derivado (ESP-6): a altura útil do círculo dividida pelos vãos entre as linhas.
  const pitch = (2 * RADIUS * Math.sin(toRadians(MAX_ROW_DEGREES))) / Math.max(1, rows - 1);
  const top = -((rows - 1) * pitch) / 2;

  const leaves = new Map<string, PlacedLeaf>();
  const groupNodes = new Map<string, Point>();
  const branchSpan = new Map<string, { first: number; last: number }>();
  const groups: PlacedGroup[] = [];
  const placeLeaf = (source: LineageGroup, branchId: string, side: Side, index: number, row: number): PlacedLeaf | null => {
    const leaf = source.leaves[index];
    if (!leaf) return null;
    const dy = top + row * pitch;
    const half = Math.sqrt(Math.max(0, RADIUS * RADIUS - dy * dy));
    const fromTop = (Math.acos(Math.max(-1, Math.min(1, -dy / RADIUS))) * 180) / Math.PI;
    const placed: PlacedLeaf = {
      id: leaf.id,
      label: leaf.label,
      inSentence: leaf.inSentence,
      groupId: source.id,
      branchId,
      side,
      dy,
      theta: side === 'left' ? fromTop : 360 - fromTop,
      point: { x: CENTER_X + (side === 'left' ? -half : half), y: CENTER_Y + dy },
    };
    leaves.set(leaf.id, placed);
    return placed;
  };
  const closeGroup = (source: LineageGroup, branchId: string, side: Side, headerRow: number, placed: readonly PlacedLeaf[]) => {
    const firstLeaf = placed[0];
    const lastLeaf = placed[placed.length - 1];
    if (!firstLeaf || !lastLeaf) return;
    groups.push({ id: source.id, label: source.label, side, headerDy: top + headerRow * pitch, first: firstLeaf.theta, last: lastLeaf.theta, leaves: placed });
    groupNodes.set(source.id, polar(RADIUS * GROUP_RADIUS_RATIO, (firstLeaf.theta + lastLeaf.theta) / 2));
    const span = branchSpan.get(branchId);
    branchSpan.set(branchId, { first: span ? span.first : firstLeaf.theta, last: lastLeaf.theta });
  };

  // Esquerda: de cima para baixo, o nome do grupo e depois as folhas dele.
  let row = (rows - leftRows) / 2;
  for (const entry of flat.slice(0, cut)) {
    const headerRow = row;
    const placed: PlacedLeaf[] = [];
    entry.group.leaves.forEach((_, index) => {
      const leaf = placeLeaf(entry.group, entry.branchId, 'left', index, headerRow + 1 + index);
      if (leaf) placed.push(leaf);
    });
    row += entry.rows;
    closeGroup(entry.group, entry.branchId, 'left', headerRow, placed);
  }
  // Direita: a volta continua de baixo para cima, as folhas primeiro e o nome do grupo acima delas.
  row = (rows - rightRows) / 2 + rightRows - 1;
  for (const entry of flat.slice(cut)) {
    const bottomRow = row;
    const placed: PlacedLeaf[] = [];
    entry.group.leaves.forEach((_, index) => {
      const leaf = placeLeaf(entry.group, entry.branchId, 'right', index, bottomRow - index);
      if (leaf) placed.push(leaf);
    });
    row -= entry.rows;
    closeGroup(entry.group, entry.branchId, 'right', row + 1, placed);
  }

  const branchNodes = new Map<string, Point>();
  for (const [branchId, span] of branchSpan) {
    branchNodes.set(branchId, polar(RADIUS * BRANCH_RADIUS_RATIO, (span.first + span.last) / 2));
  }
  return { leaves, groups, groupNodes, branchNodes };
}

/**
 * Pontos de controle da ligação: os ancestrais do caminho de `a` até `b`, com o ancestral comum
 * incluso. No mesmo grupo o caminho sobe só até o grupo; no mesmo ramo, até o ramo; entre ramos
 * ele passa pela raiz, no centro.
 */
function controlPoints(a: PlacedLeaf, b: PlacedLeaf, layout: Layout): readonly Point[] {
  const groupA = layout.groupNodes.get(a.groupId);
  const groupB = layout.groupNodes.get(b.groupId);
  const branchA = layout.branchNodes.get(a.branchId);
  const branchB = layout.branchNodes.get(b.branchId);
  if (!groupA || !groupB || !branchA || !branchB) return [a.point, b.point];
  if (a.groupId === b.groupId) return [a.point, groupA, b.point];
  if (a.branchId === b.branchId) return [a.point, groupA, branchA, groupB, b.point];
  return [a.point, groupA, branchA, ROOT, branchB, groupB, b.point];
}

/**
 * Função pura da curva, com β como parâmetro: endireita os pontos de controle pela tensão e converte
 * a B-spline cúbica uniforme em segmentos de Bézier cúbica (`C`). Cada trecho usa quatro nós
 * seguidos (a, b, c, e) e vai de (a + 4b + c)/6 a (b + 4c + e)/6, com controles em (2b + c)/3 e
 * (b + 2c)/3.
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

/** Arco do grupo no raio das folhas, da primeira à última, no sentido anti-horário da volta. */
function arcPath(group: PlacedGroup): string | null {
  const from = group.leaves[0];
  const to = group.leaves[group.leaves.length - 1];
  if (!from || !to || from.id === to.id) return null;
  // A flag de arco grande liga acima de 180 graus: sem ela o arco daria a volta pelo lado curto.
  const large = group.last - group.first > 180 ? 1 : 0;
  return `M${fmt(from.point.x)},${fmt(from.point.y)} A${String(RADIUS)},${String(RADIUS)} 0 ${String(large)} 0 ${fmt(to.point.x)},${fmt(to.point.y)}`;
}

/** "1 fonte" no singular, "N fontes" no plural: a contagem nunca sai sem o substantivo (NUM-6). */
function countLabel(value: number, singular: string, plural: string): string {
  return `${formatInt(value)} ${value === 1 ? singular : plural}`;
}

/** "A", "A e B", "A, B e C". */
function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

const SOURCES_ID = 'fontes';
const INDICATORS_ID = 'indicadores';
/** Onde começam as duas amostras da legenda de sentido, que só aparece com uma folha acesa. */
const LEGEND_IN_X = 160;
const LEGEND_OUT_X = 430;

export default function LineageBundle({
  data = defaultData,
  tension = DEFAULT_TENSION,
  highlightId,
  height,
  className,
}: LineageBundleProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const style = height === undefined ? undefined : { height };
  const beta = Math.max(0, Math.min(1, tension));
  const layout = useMemo(
    () =>
      buildLayout([
        { id: SOURCES_ID, groups: data.sources },
        { id: INDICATORS_ID, groups: data.indicators },
      ]),
    [data],
  );
  // Ligação repetida, de uma folha com ela mesma ou com id desconhecido não entra.
  const edges = useMemo(() => {
    if (layout === null) return [];
    const seen = new Set<string>();
    return data.links.flatMap((link): PlacedEdge[] => {
      const from = layout.leaves.get(link.from);
      const to = layout.leaves.get(link.to);
      const id = `${link.from}>${link.to}`;
      if (!from || !to || from.id === to.id || seen.has(id)) return [];
      seen.add(id);
      return [{ id, from, to, d: bundlePath(controlPoints(from, to, layout), beta) }];
    });
  }, [data, layout, beta]);

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
  const sourceGroups = data.sources.filter((group) => group.leaves.length > 0).length;
  const indicatorGroups = data.indicators.filter((group) => group.leaves.length > 0).length;
  const outCount = new Map<string, number>();
  const inCount = new Map<string, number>();
  for (const edge of edges) {
    outCount.set(edge.from.id, (outCount.get(edge.from.id) ?? 0) + 1);
    inCount.set(edge.to.id, (inCount.get(edge.to.id) ?? 0) + 1);
  }
  let topReach = 0;
  for (const leaf of leafList) topReach = Math.max(topReach, outCount.get(leaf.id) ?? 0);
  const leaders = topReach > 0 ? leafList.filter((leaf) => (outCount.get(leaf.id) ?? 0) === topReach) : [];
  const leader = leaders[0];

  const active = layout.leaves.get(hoverId ?? highlightId ?? '') ?? null;
  const inEdges = active ? edges.filter((edge) => edge.to.id === active.id) : [];
  const outEdges = active ? edges.filter((edge) => edge.from.id === active.id) : [];
  const restEdges = active ? edges.filter((edge) => edge.to.id !== active.id && edge.from.id !== active.id) : edges;
  const feeders = new Set(inEdges.map((edge) => edge.from.id));
  const dependents = new Set(outEdges.map((edge) => edge.to.id));
  const tensionText = formatDecimal(beta, 2);

  const summary = [
    `Feixe hierárquico de arestas com ${countLabel(sourceCount, 'fonte de dado', 'fontes de dado')} em ${countLabel(sourceGroups, 'sistema', 'sistemas')} e ${countLabel(indicatorCount, 'indicador', 'indicadores')} em ${countLabel(indicatorGroups, 'dashboard', 'dashboards')}, ligados por ${countLabel(edges.length, 'dependência', 'dependências')}.`,
    leader === undefined
      ? 'Nenhuma fonte alimenta indicador neste recorte.'
      : leaders.length === 1
        ? `A fonte com mais dependentes é ${leader.inSentence}, que alimenta ${countLabel(topReach, 'indicador', 'indicadores')}.`
        : `As fontes com mais dependentes são ${joinNames(leaders.map((leaf) => leaf.inSentence))}, com ${countLabel(topReach, 'indicador', 'indicadores')} cada.`,
  ].join(' ');

  const figure = (value: number) => (
    <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
      {formatInt(value)}
    </tspan>
  );
  const strong = (text: string) => (
    <tspan fill="var(--text-primary)" fontWeight={600}>
      {text}
    </tspan>
  );

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
          {active ? (
            <>
              {strong(active.label)}
              {': '}
              {figure(inEdges.length)}
              {inEdges.length === 1 ? ' entrada e ' : ' entradas e '}
              {figure(outEdges.length)}
              {outEdges.length === 1 ? ' saída.' : ' saídas.'}
            </>
          ) : leader === undefined ? (
            'Nenhuma dependência cadastrada entre as fontes e os indicadores deste recorte.'
          ) : (
            <>
              {strong(joinNames(leaders.map((leaf, index) => (index === 0 ? leaf.label : leaf.inSentence))))}
              {leaders.length === 1 ? ' alimenta ' : ' alimentam '}
              {figure(topReach)}
              {' de '}
              {figure(indicatorCount)}
              {indicatorCount === 1 ? ' indicador' : ' indicadores'}
              {leaders.length === 1 ? ', o maior alcance entre ' : ' cada, o maior alcance entre '}
              {figure(sourceCount)}
              {sourceCount === 1 ? ' fonte de dado.' : ' fontes de dado.'}
            </>
          )}
        </text>

        {/* A ligação é o dado: `--text-muted` a 0,76 mede 3,58:1 e 3,28:1; abaixo de 0,72 cai do piso (ACE-5). */}
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
        {/* Revestimento antes do traço aceso: sem ele a cor se funde com o cinza que ela cruza (TOK-4). */}
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

        {/* O arco diz a que grupo a folha pertence, então é dado e mede 3:1 (ACE-6): `--text-muted`. */}
        {layout.groups.map((group) => {
          const d = arcPath(group);
          return d === null ? null : (
            <path d={d} fill="none" key={`arc-${group.id}`} stroke="var(--text-muted)" strokeWidth={ARC_WIDTH} />
          );
        })}

        {leafList.map((leaf) => {
          const direction = leaf.side === 'left' ? -1 : 1;
          const labelX = CENTER_X + direction * labelOffset(leaf.dy);
          const isActive = leaf.id === active?.id;
          const isFeeder = feeders.has(leaf.id);
          const isDependent = dependents.has(leaf.id);
          const reach =
            leaf.branchId === SOURCES_ID
              ? `alimenta ${countLabel(outCount.get(leaf.id) ?? 0, 'indicador', 'indicadores')}`
              : `depende de ${countLabel(inCount.get(leaf.id) ?? 0, 'fonte', 'fontes')}`;
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
              {/* Dica fora do `<text>`: traz a contagem da folha, que o corpo só escreve para a de
                  maior alcance (DIC-1). */}
              <title>{`${leaf.label}: ${reach}`}</title>
              {/* Perto dos polos o canto do rótulo afasta o nome da folha (GEO-19): a linha de
                  chamada devolve a ligação entre os dois. */}
              {Math.abs(labelX - leaf.point.x) > LEADER_FROM ? (
                <line
                  stroke="var(--text-muted)"
                  strokeWidth={1}
                  x1={round1(leaf.point.x + direction * (NODE_RADIUS + 2))}
                  x2={round1(labelX - direction * LEADER_INSET)}
                  y1={round1(leaf.point.y)}
                  y2={round1(leaf.point.y)}
                />
              ) : null}
              <circle
                cx={round1(leaf.point.x)}
                cy={round1(leaf.point.y)}
                fill={
                  isActive
                    ? 'var(--text-primary)'
                    : isFeeder
                      ? 'var(--chart-1)'
                      : isDependent
                        ? 'var(--chart-6)'
                        : 'var(--text-secondary)'
                }
                r={isActive ? NODE_RADIUS_LIT : NODE_RADIUS}
                stroke="var(--surface-raised)"
                strokeWidth={1}
              />
              <text
                className="font-sans"
                dominantBaseline="central"
                fill={isActive || isFeeder || isDependent ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={LABEL_FONT_PX}
                fontWeight={isActive ? 700 : 500}
                textAnchor={leaf.side === 'left' ? 'end' : 'start'}
                x={round1(labelX)}
                y={round1(leaf.point.y)}
              >
                {leaf.label}
              </text>
            </g>
          );
        })}

        {/* O nome do grupo ocupa uma linha da coluna, acima das folhas dele: o peso e o tom o separam
            de uma folha, e a falta de ponto na volta também. */}
        {layout.groups.map((group) => {
          const direction = group.side === 'left' ? -1 : 1;
          return (
            <text
              className="font-sans"
              dominantBaseline="central"
              fill="var(--text-primary)"
              fontSize={LABEL_FONT_PX}
              fontWeight={600}
              key={`header-${group.id}`}
              textAnchor={group.side === 'left' ? 'end' : 'start'}
              x={round1(CENTER_X + direction * labelOffset(group.headerDy))}
              y={round1(CENTER_Y + group.headerDy)}
            >
              {group.label}
            </text>
          );
        })}

        <text
          className="font-sans"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={LABEL_FONT_PX}
          x={0}
          y={FOOTER_Y}
        >
          {'Tensão do feixe: '}
          <tspan className="font-display" fontWeight={500}>
            {tensionText}
          </tspan>
          {active ? '.' : '. Passe o cursor numa folha para acender o que entra nela e o que sai dela.'}
        </text>
        {active ? (
          <g>
            <line
              stroke="var(--chart-1)"
              strokeLinecap="round"
              strokeWidth={EDGE_WIDTH_LIT}
              x1={LEGEND_IN_X}
              x2={LEGEND_IN_X + LEGEND_SAMPLE_WIDTH}
              y1={FOOTER_Y}
              y2={FOOTER_Y}
            />
            <text
              className="font-sans"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={LABEL_FONT_PX}
              x={LEGEND_IN_X + LEGEND_SAMPLE_WIDTH + LABEL_GAP}
              y={FOOTER_Y}
            >
              entrada: folha de que a acesa depende
            </text>
            <line
              stroke="var(--chart-6)"
              strokeDasharray={OUT_DASH}
              strokeWidth={EDGE_WIDTH_LIT}
              x1={LEGEND_OUT_X}
              x2={LEGEND_OUT_X + LEGEND_SAMPLE_WIDTH}
              y1={FOOTER_Y}
              y2={FOOTER_Y}
            />
            <text
              className="font-sans"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={LABEL_FONT_PX}
              x={LEGEND_OUT_X + LEGEND_SAMPLE_WIDTH + LABEL_GAP}
              y={FOOTER_Y}
            >
              saída: folha que depende da acesa
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}
