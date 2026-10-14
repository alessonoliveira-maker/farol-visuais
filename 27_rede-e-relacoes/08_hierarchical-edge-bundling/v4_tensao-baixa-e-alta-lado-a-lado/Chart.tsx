import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  tensions as defaultTensions,
  type Lineage,
  type LineageGroup,
  type LineageLink,
} from './data';

/**
 * Dois feixes hierárquicos de arestas lado a lado, com as mesmas folhas, as mesmas dependências e só
 * a tensão β diferente. Responde por que a tensão é uma escolha declarada: perto de 0 cada curva
 * volta a ser quase uma reta e a rota comum some; perto de 1 todas se juntam no caminho da
 * hierarquia e a ligação individual some. Nenhum dos dois extremos serve sozinho, e por isso o
 * padrão do Farol fica entre eles, com o controle exposto.
 *
 * O cálculo da curva é uma função pura com β como parâmetro (`bundlePath`): ela endireita os pontos
 * de controle, que são os ancestrais do caminho (`controlPoints`), e converte a B-spline cúbica
 * uniforme em Bézier cúbica. Os dois painéis chamam a mesma função com o mesmo layout
 * (`buildLayout`), deslocado para o centro de cada um, então o que muda de um para o outro é só β
 * (EIX-9: mesma escala nos pequenos múltiplos).
 *
 * A ligação é o dado, então mede 3:1 (ACE-6): `--text-muted` a 0,76 de opacidade, que dá 3,58:1 no
 * escuro e 3,28:1 no claro; o piso fica em 0,72 (ACE-5). O texto nunca gira (TIP-5): cada painel
 * nomeia os dois ramos na horizontal, junto do arco de fora que os abraça. O `viewBox` tem o
 * tamanho do corpo medido do cartão, 894 x 281 px, e a escala do `<svg>` sai 1.
 */
export interface TensionComparisonProps {
  readonly data?: Lineage;
  /** Tensões β a comparar, uma por painel, da esquerda para a direita. Vale de 0 a 1. */
  readonly tensions?: readonly number[];
  readonly height?: number;
  readonly className?: string;
}

/** Corpo medido do canvas largo na moldura card, com o caso de uso em uma linha. */
const VIEW_W = 894;
const VIEW_H = 281;
const PANEL_CENTER_Y = 160;
const RADIUS = 92;
/** Acima de três painéis o raio não cabe com os nomes dos ramos ao lado. */
const MAX_PANELS = 3;
/** Raio do nó de grupo e do nó de ramo, em fração do raio das folhas; a raiz fica no centro. */
const GROUP_RADIUS_RATIO = 0.6;
const BRANCH_RADIUS_RATIO = 0.2;
/** Vão entre dois grupos do mesmo ramo e entre dois ramos, em vagas de folha. */
const GROUP_GAP_STEPS = 1.5;
const BRANCH_GAP_STEPS = 3;
/** Quanto o arco passa da primeira e da última folha, em fração de vaga. */
const ARC_OVERHANG_STEPS = 0.35;
/** Padrão do Farol, escrito no rodapé: entre os dois extremos que os painéis mostram. */
const DEFAULT_TENSION = 0.85;
/** Limiares da frase de cada painel: até aqui a curva é quase reta, daqui em diante é um feixe só. */
const LOW_TENSION = 0.5;
const HIGH_TENSION = 0.9;
const NODE_RADIUS = 2.2;
const ARC_WIDTH = 1.5;
/** O arco do ramo corre por fora das folhas, a esta distância do raio delas. */
const BRANCH_ARC_OFFSET = 7;
const EDGE_WIDTH = 1;
/** Opacidade da ligação. Piso medido de `--text-muted` para 3:1: 0,72 (ACE-5). */
const DIM_OPACITY = 0.76;
const LABEL_FONT_PX = 11;
const READING_FONT_PX = 12;
/** Meia altura da caixa do rótulo de 11 px, com a letra que desce (GEO-19). */
const LABEL_HALF_HEIGHT = 6;
const LABEL_GAP = 4;
/** Raio livre em volta do arco do ramo, e quanto o nome se afasta dele no ângulo do ramo. */
const LABEL_CLEAR_RADIUS = RADIUS + BRANCH_ARC_OFFSET + 2;
const LABEL_RADIUS_OFFSET = BRANCH_ARC_OFFSET + 12;
const READING_Y = 8;
const PANEL_TITLE_Y = 32;
const PANEL_CAPTION_Y = 48;
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

interface Panel {
  readonly key: string;
  readonly beta: number;
  /** Borda esquerda do painel, onde o título dele começa. */
  readonly left: number;
  readonly frame: Frame;
  readonly layout: Layout;
  readonly edges: readonly PlacedEdge[];
}

/** O que a tensão faz com o feixe, numa frase por regime: como legenda do painel e na frase acessível. */
function regimeOf(beta: number): { readonly caption: string; readonly inSentence: string } {
  if (beta <= LOW_TENSION) {
    return { caption: 'tensão baixa: as curvas voltam a ser quase retas', inSentence: 'as curvas voltam a ser quase retas' };
  }
  if (beta >= HIGH_TENSION) {
    return { caption: 'tensão alta: tudo passa por um feixe só no centro', inSentence: 'tudo passa por um feixe só no centro' };
  }
  return { caption: 'tensão média: o feixe se abre só nas pontas', inSentence: 'o feixe se abre só nas pontas' };
}

export default function TensionComparison({
  data = defaultData,
  tensions = defaultTensions,
  height,
  className,
}: TensionComparisonProps) {
  const style = height === undefined ? undefined : { height };
  // Um painel por tensão, todos com o mesmo raio e o mesmo layout: só β muda (EIX-9).
  const panels = useMemo(() => {
    const list = (tensions.length > 0 ? tensions : [DEFAULT_TENSION]).slice(0, MAX_PANELS);
    const panelWidth = VIEW_W / Math.max(1, list.length);
    return list.flatMap((value, index): Panel[] => {
      const beta = Math.max(0, Math.min(1, value));
      const frame = { cx: panelWidth * (index + 0.5), cy: PANEL_CENTER_Y, radius: RADIUS };
      const layout = buildLayout(
        [
          { id: SOURCES_ID, groups: data.sources },
          { id: INDICATORS_ID, groups: data.indicators },
        ],
        frame,
      );
      if (layout === null) return [];
      return [
        {
          key: `painel-${String(index)}`,
          beta,
          left: panelWidth * index,
          frame,
          layout,
          edges: buildEdges(data.links, layout, frame, beta),
        },
      ];
    });
  }, [data, tensions]);

  const firstPanel = panels[0];
  if (!firstPanel) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma fonte nem indicador neste recorte: sem procedência cadastrada, não há feixe a comparar.</span>
      </div>
    );
  }

  const leafList = [...firstPanel.layout.leaves.values()];
  const sourceCount = leafList.filter((leaf) => leaf.branchId === SOURCES_ID).length;
  const indicatorCount = leafList.length - sourceCount;
  const edgeCount = firstPanel.edges.length;
  const defaultText = formatDecimal(DEFAULT_TENSION, 2);

  const summary = [
    `Feixes hierárquicos de arestas em ${countLabel(panels.length, 'painel', 'painéis lado a lado')}, com as mesmas ${countLabel(leafList.length, 'folha', 'folhas')} e ${countLabel(edgeCount, 'dependência', 'dependências')}:`,
    `${panels.map((panel) => `com tensão ${formatDecimal(panel.beta, 2)}, ${regimeOf(panel.beta).inSentence}`).join('; ')}.`,
    `O padrão do Farol é ${defaultText}.`,
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
          {edgeCount === 1 ? 'A mesma dependência, uma só, entre ' : 'As mesmas '}
          {edgeCount === 1 ? null : figure(edgeCount)}
          {edgeCount === 1 ? null : ' dependências entre '}
          {figure(sourceCount)}
          {sourceCount === 1 ? ' fonte de dado e ' : ' fontes de dado e '}
          {figure(indicatorCount)}
          {indicatorCount === 1 ? ' indicador' : ' indicadores'}
          {panels.length === 1 ? ', numa tensão só.' : ': de um painel para o outro, só a tensão do feixe muda.'}
        </text>

        {panels.map((panel) => {
          const overhang = panel.layout.step * ARC_OVERHANG_STEPS;
          const regime = regimeOf(panel.beta);
          return (
            <g key={panel.key}>
              <text
                className="font-sans"
                dominantBaseline="central"
                fill="var(--text-primary)"
                fontSize={READING_FONT_PX}
                fontWeight={600}
                x={panel.left}
                y={PANEL_TITLE_Y}
              >
                {'β = '}
                <tspan className="font-display">{formatDecimal(panel.beta, 2)}</tspan>
              </text>
              <text {...textProps} fill="var(--text-muted)" x={panel.left} y={PANEL_CAPTION_Y}>
                {regime.caption}
              </text>

              {/* A ligação é o dado: `--text-muted` a 0,76 mede 3,58:1 e 3,28:1; abaixo de 0,72 cai
                  do piso (ACE-5). */}
              {panel.edges.map((edge) => (
                <path
                  d={edge.d}
                  fill="none"
                  key={edge.id}
                  stroke="var(--text-muted)"
                  strokeOpacity={DIM_OPACITY}
                  strokeWidth={EDGE_WIDTH}
                />
              ))}
              {/* Os arcos dizem a que grupo e a que ramo a folha pertence: são dado e medem 3:1 (ACE-6). */}
              {panel.layout.groups.map((group) => (
                <path
                  d={arcPath(panel.frame, RADIUS, group.first - overhang, group.last + overhang)}
                  fill="none"
                  key={`arc-${group.id}`}
                  stroke="var(--text-muted)"
                  strokeWidth={ARC_WIDTH}
                />
              ))}
              {panel.layout.branches.map((branch) => (
                <path
                  d={arcPath(panel.frame, RADIUS + BRANCH_ARC_OFFSET, branch.first - overhang, branch.last + overhang)}
                  fill="none"
                  key={`branch-${branch.id}`}
                  stroke="var(--text-muted)"
                  strokeWidth={ARC_WIDTH}
                />
              ))}
              {[...panel.layout.leaves.values()].map((leaf) => (
                <circle
                  cx={round1(leaf.point.x)}
                  cy={round1(leaf.point.y)}
                  fill="var(--text-secondary)"
                  key={`leaf-${leaf.id}`}
                  r={NODE_RADIUS}
                  stroke="var(--surface-raised)"
                  strokeWidth={1}
                />
              ))}
              {panel.layout.branches.map((branch) => {
                const middle = (branch.first + branch.last) / 2;
                const direction = Math.sin(toRadians(middle)) > 0 ? -1 : 1;
                const dy = -(RADIUS + LABEL_RADIUS_OFFSET) * Math.cos(toRadians(middle));
                const isSources = branch.id === SOURCES_ID;
                const count = isSources ? sourceCount : indicatorCount;
                return (
                  <text
                    {...textProps}
                    fill="var(--text-secondary)"
                    key={`label-${branch.id}`}
                    textAnchor={direction === -1 ? 'end' : 'start'}
                    x={round1(panel.frame.cx + direction * labelOffset(LABEL_CLEAR_RADIUS, dy))}
                    y={round1(panel.frame.cy + dy)}
                  >
                    <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>
                      {formatInt(count)}
                    </tspan>
                    {isSources
                      ? count === 1
                        ? ' fonte de dado'
                        : ' fontes de dado'
                      : count === 1
                        ? ' indicador'
                        : ' indicadores'}
                  </text>
                );
              })}
            </g>
          );
        })}

        <text {...textProps} fill="var(--text-muted)" x={0} y={FOOTER_Y}>
          {'Padrão do Farol: β = '}
          <tspan className="font-display" fontWeight={500}>
            {defaultText}
          </tspan>
          , com o controle de tensão exposto a quem usa o painel.
        </text>
      </svg>
    </div>
  );
}
