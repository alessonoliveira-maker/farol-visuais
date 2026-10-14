import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  highlightId as defaultHighlightId,
  type OriginGroup,
  type OriginNetwork,
} from './data';

/**
 * Grafo circular: todas as origens no perímetro, agrupadas por tipo, e cada par que divide jornada
 * ligado por dentro com uma curva quadrática de controle no centro (`edgePath`). Responde com quais
 * origens a origem selecionada aparece na mesma jornada, e se isso fica dentro do grupo dela ou
 * atravessa os grupos.
 *
 * A volta é dividida em vagas iguais (`buildLayout`). Cada grupo ocupa uma vaga por origem e mais
 * uma, no meio, para o próprio nome: é assim que o nome do grupo fica fora do círculo, no meio do
 * arco, sem disputar o lugar com o rótulo de uma origem. O arco do grupo passa por baixo dos nós e
 * atravessa a vaga do nome; entre dois grupos ele se interrompe (`GROUP_GAP_STEPS`). Dentro do
 * grupo a ordem é por número de ligações, declarada no rodapé porque o número não vai escrito em
 * cada nó (GEO-12).
 *
 * Texto sempre horizontal (TIP-5): à direita do centro o rótulo começa no nó, à esquerda termina
 * nele, e no polo fica centrado. Depois de posto, o rótulo que encostar em outro é empurrado para
 * longe do equador (`placeLabels`), o que resolve os polos, onde dois rótulos ficam na mesma altura.
 *
 * O foco não usa cor apagada abaixo do piso. A ligação fora de foco é `--text-muted` a 0,76 de
 * opacidade, que mede 3,58:1 no escuro e 3,28:1 no claro; o piso de 3:1 fica em 0,72 (ACE-5). O
 * catálogo pedia `--line-strong` com opacidade baixa, que não alcança 3:1 nem opaco, e a ligação é o
 * dado (ACE-6). A ligação acesa é mais grossa e leva revestimento na cor do cartão por baixo, para
 * não se fundir com as que ela cruza (TOK-4).
 *
 * O `viewBox` tem o tamanho do corpo medido do cartão, 422 x 355 px, e a escala do `<svg>` sai 1.
 */
export interface OriginCircleProps {
  readonly data?: OriginNetwork;
  /** Id da origem acesa. Id que não existe deixa tudo em neutro e a leitura cita a de mais pares. */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo medido do canvas quadrado na moldura card, com o caso de uso em duas linhas. */
const VIEW_W = 422;
const VIEW_H = 355;
const CENTER_X = 211;
const CENTER_Y = 170;
const R_NODE = 108;
const NODE_RADIUS = 4.5;
const NODE_RADIUS_LIT = 6.5;
const LABEL_GAP = 7;
/** Raio da âncora do rótulo: fora do nó, com vão para a caixa de 10 px não reentrar (GEO-19). */
const LABEL_RADIUS = R_NODE + NODE_RADIUS + LABEL_GAP;
/** O meio do primeiro grupo fica no topo, e a volta segue em sentido horário. */
const TOP_DEGREE = -90;
/** Vão entre dois grupos, em vagas: maior que as duas vagas que separam os nós em volta do nome. */
const GROUP_GAP_STEPS = 2.5;
/** Quanto o arco do grupo passa do primeiro e do último nó, em fração de vaga. */
const ARC_OVERHANG_STEPS = 1 / 3;
const ARC_WIDTH = 2;
const TICK_LENGTH = 6;
const EDGE_WIDTH = 1.2;
const EDGE_WIDTH_LIT = 2.5;
/** Revestimento na cor do cartão: 1 px de cada lado da ligação acesa (TOK-4). */
const EDGE_CASING = 2;
/** Opacidade da ligação fora de foco. Piso medido de `--text-muted` para 3:1: 0,72 (ACE-5). */
const DIM_OPACITY = 0.76;
const LABEL_FONT_PX = 11;
const READING_FONT_PX = 12;
/** O nome do grupo é um degrau maior que o da origem: ele divide a coluna de rótulos com elas, e
 * o tamanho, o peso e o tom são o que o separa de um nó sem ponto. */
const GROUP_FONT_PX = 12;
const LABEL_HALF_HEIGHT = 5;
/** Respiro mínimo entre duas caixas de rótulo (ROT-9). */
const LABEL_RESPIRO = 4;
const PUSH_STEP = 2;
const MAX_PUSH_STEPS = 30;
/** Cosseno abaixo do qual o nó está no polo e o rótulo fica centrado: cerca de 2 graus. */
const POLE_EPSILON = 0.035;
/** Quanto o rótulo centrado do polo se afasta além da âncora, em px. */
const POLE_LIFT = 8;
/** Largura média por caractere, em em, só para estimar a caixa do rótulo: sempre para mais. */
const CHAR_WIDTH_FACTOR = 0.6;
const READING_Y = 8;
const LEGEND_ROWS_Y = [316, 331] as const;
const ORDER_Y = 346;
const LEGEND_SAMPLE_WIDTH = 18;
const LEGEND_TEXT_X = 24;
const UNGROUPED: OriginGroup = { id: 'sem-grupo', label: 'Sem grupo', inSentence: 'sem grupo' };

interface Point {
  readonly x: number;
  readonly y: number;
}

/** Quanto do caminho do centro ao meio da corda o controle percorre nos vizinhos (1 = arco raso). */
const CONTROL_PULL = 0.85;

interface PlacedNode {
  readonly id: string;
  readonly label: string;
  readonly inSentence: string;
  readonly groupId: string;
  readonly degree: number;
  readonly angle: number;
  readonly point: Point;
}

interface PlacedGroup {
  readonly group: OriginGroup;
  readonly start: number;
  readonly end: number;
  readonly nameAngle: number;
  readonly nodes: readonly PlacedNode[];
}

interface PlacedEdge {
  readonly id: string;
  readonly a: PlacedNode;
  readonly b: PlacedNode;
}

interface Layout {
  readonly groups: readonly PlacedGroup[];
  readonly nodes: ReadonlyMap<string, PlacedNode>;
  readonly edges: readonly PlacedEdge[];
  readonly step: number;
}

/** Duas casas bastam para coordenada, e o SVG do preview fica menor. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function polar(radius: number, degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  return { x: round2(CENTER_X + radius * Math.cos(radians)), y: round2(CENTER_Y + radius * Math.sin(radians)) };
}

/** Comparação por código de caractere: a mesma ordem em qualquer idioma de navegador (seção 10). */
function compareText(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function pairKey(a: string, b: string): string {
  return a < b ? `${a}__${b}` : `${b}__${a}`;
}

/**
 * Posiciona grupos e nós. A volta tem uma vaga por origem, uma vaga por nome de grupo e o vão entre
 * grupos; o passo sai de 360 dividido pelo total. Par repetido, par de uma origem com ela mesma e
 * par com id desconhecido não contam. Origem com grupo que não está em `groups` não some: vai para
 * um grupo próprio no fim da volta.
 */
function buildLayout(network: OriginNetwork): Layout | null {
  const known = new Set(network.nodes.map((node) => node.id));
  const seen = new Set<string>();
  const degree = new Map<string, number>();
  const validPairs: { readonly a: string; readonly b: string }[] = [];
  for (const pair of network.pairs) {
    const key = pairKey(pair.a, pair.b);
    if (pair.a === pair.b || !known.has(pair.a) || !known.has(pair.b) || seen.has(key)) continue;
    seen.add(key);
    validPairs.push(pair);
    degree.set(pair.a, (degree.get(pair.a) ?? 0) + 1);
    degree.set(pair.b, (degree.get(pair.b) ?? 0) + 1);
  }

  const groupIds = new Set(network.groups.map((group) => group.id));
  const groupOf = (groupId: string): string => (groupIds.has(groupId) ? groupId : UNGROUPED.id);
  const groupList = network.nodes.some((node) => !groupIds.has(node.group))
    ? [...network.groups, UNGROUPED]
    : network.groups;
  // Ordem dentro do grupo: mais ligações primeiro, empate pelo nome.
  const members = groupList
    .map((group) => ({
      group,
      list: network.nodes
        .filter((node) => groupOf(node.group) === group.id)
        .sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0) || compareText(a.label, b.label)),
    }))
    .filter((entry) => entry.list.length > 0);
  const firstEntry = members[0];
  if (!firstEntry) return null;

  let nodeCount = 0;
  for (const entry of members) nodeCount += entry.list.length;
  const step = 360 / (nodeCount + members.length * GROUP_GAP_STEPS);
  let cursor = TOP_DEGREE - (firstEntry.list.length * step) / 2;
  const nodes = new Map<string, PlacedNode>();
  const groups = members.map(({ group, list }) => {
    // A vaga do nome fica no meio: metade dos nós antes dela, metade depois.
    const nameIndex = Math.ceil(list.length / 2);
    const start = cursor;
    const placed = list.map((node, index) => {
      const angle = start + (index < nameIndex ? index : index + 1) * step;
      const placedNode: PlacedNode = {
        id: node.id,
        label: node.label,
        inSentence: node.inSentence,
        groupId: group.id,
        degree: degree.get(node.id) ?? 0,
        angle,
        point: polar(R_NODE, angle),
      };
      nodes.set(node.id, placedNode);
      return placedNode;
    });
    const end = start + list.length * step;
    cursor = end + GROUP_GAP_STEPS * step;
    return { group, start, end, nameAngle: start + nameIndex * step, nodes: placed };
  });

  const edges = validPairs.flatMap((pair) => {
    const a = nodes.get(pair.a);
    const b = nodes.get(pair.b);
    return a && b ? [{ id: pairKey(pair.a, pair.b), a, b }] : [];
  });
  return { groups, nodes, edges, step };
}

/**
 * `M xi,yi Q cx,cy xj,yj`: curva quadrática pelo círculo. O controle parte do centro e vai ao meio da
 * corda do par tanto mais quanto mais próximos os nós estão na volta (k = 0,85 vezes 1 menos a distância angular
 * sobre 180 graus). Assim as ligações do mesmo nó saem em ângulos diferentes e a acesa cruza as
 * baixadas em vez de correr por cima delas (ACE-6). Desvio do catálogo, declarado no `meta.json`.
 */
function edgePath(edge: PlacedEdge): string {
  const raw = Math.abs(edge.a.angle - edge.b.angle) % 360;
  const distance = raw > 180 ? 360 - raw : raw;
  const k = CONTROL_PULL * (1 - distance / 180);
  const mx = (edge.a.point.x + edge.b.point.x) / 2;
  const my = (edge.a.point.y + edge.b.point.y) / 2;
  const cx = CENTER_X + k * (mx - CENTER_X);
  const cy = CENTER_Y + k * (my - CENTER_Y);
  return `M ${String(edge.a.point.x)},${String(edge.a.point.y)} Q ${cx.toFixed(2)},${cy.toFixed(2)} ${String(edge.b.point.x)},${String(edge.b.point.y)}`;
}

/** Arco do grupo no raio dos nós, em sentido horário. A flag de arco grande liga acima de 180 graus. */
function arcPath(from: number, to: number): string {
  const p0 = polar(R_NODE, from);
  const p1 = polar(R_NODE, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${String(p0.x)},${String(p0.y)} A ${String(R_NODE)},${String(R_NODE)} 0 ${String(large)} 1 ${String(p1.x)},${String(p1.y)}`;
}

interface LabelSpec {
  readonly id: string;
  readonly angle: number;
  readonly width: number;
}

interface PlacedLabel {
  readonly x: number;
  readonly y: number;
  readonly anchor: 'start' | 'middle' | 'end';
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

/** Estimativa grosseira da largura do rótulo, só para a caixa de colisão: sempre para mais. */
function estimateWidth(text: string): number {
  return text.length * LABEL_FONT_PX * CHAR_WIDTH_FACTOR;
}

/**
 * Rótulo horizontal em volta do círculo. A âncora fica no raio `LABEL_RADIUS`; a caixa sobe ou desce
 * meia altura conforme o seno, para ficar inteira do lado de fora. Os rótulos entram do equador
 * para os polos, e o que encostar num já posto é empurrado para longe do equador, de 2 em 2 px.
 */
function placeLabels(specs: readonly LabelSpec[]): ReadonlyMap<string, PlacedLabel> {
  const boxes: Box[] = [];
  const placed = new Map<string, PlacedLabel>();
  const sinOf = (degrees: number): number => Math.sin((degrees * Math.PI) / 180);
  const ordered = [...specs].sort(
    (a, b) => Math.abs(sinOf(a.angle)) - Math.abs(sinOf(b.angle)) || compareText(a.id, b.id),
  );
  for (const spec of ordered) {
    const cos = Math.cos((spec.angle * Math.PI) / 180);
    const sin = sinOf(spec.angle);
    const anchor = Math.abs(cos) < POLE_EPSILON ? 'middle' : cos > 0 ? 'start' : 'end';
    const x = CENTER_X + LABEL_RADIUS * cos;
    const left = anchor === 'start' ? x : anchor === 'end' ? x - spec.width : x - spec.width / 2;
    const away = sin >= 0 ? 1 : -1;
    const boxAt = (centerY: number): Box => ({
      left,
      right: left + spec.width,
      top: centerY - LABEL_HALF_HEIGHT,
      bottom: centerY + LABEL_HALF_HEIGHT,
    });
    // No polo o rótulo centrado sobe uma linha, para ficar acima dos vizinhos e não entre eles.
    let y = CENTER_Y + (LABEL_RADIUS + LABEL_HALF_HEIGHT) * sin + (anchor === 'middle' ? away * POLE_LIFT : 0);
    let box = boxAt(y);
    for (let tries = 0; tries < MAX_PUSH_STEPS && boxes.some((other) => tooClose(box, other)); tries += 1) {
      y += away * PUSH_STEP;
      box = boxAt(y);
    }
    boxes.push(box);
    placed.set(spec.id, { x: round2(x), y: round2(y), anchor });
  }
  return placed;
}

/** "1 origem" no singular, "N origens" no plural: a contagem nunca sai sem o substantivo (NUM-6). */
function countLabel(value: number, singular: string, plural: string): string {
  return `${formatInt(value)} ${value === 1 ? singular : plural}`;
}

/** "A", "A e B", "A, B e C". */
function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

function groupLabelId(groupId: string): string {
  return `grupo:${groupId}`;
}

export default function OriginCircle({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: OriginCircleProps) {
  const style = height === undefined ? undefined : { height };
  const layout = useMemo(() => buildLayout(data), [data]);
  const labels = useMemo(() => {
    if (layout === null) return new Map<string, PlacedLabel>();
    return placeLabels([
      ...[...layout.nodes.values()].map((node) => ({
        id: node.id,
        angle: node.angle,
        width: estimateWidth(node.label),
      })),
      ...layout.groups.map((entry) => ({
        id: groupLabelId(entry.group.id),
        angle: entry.nameAngle,
        width: (estimateWidth(entry.group.label) * GROUP_FONT_PX) / LABEL_FONT_PX,
      })),
    ]);
  }, [layout]);

  const nodeList = layout === null ? [] : [...layout.nodes.values()];
  const leader = [...nodeList].sort((a, b) => b.degree - a.degree || compareText(a.label, b.label))[0];

  if (layout === null || leader === undefined) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: sem jornada medida, não há círculo a desenhar.</span>
      </div>
    );
  }

  const highlight = layout.nodes.get(highlightId) ?? null;
  const focus = highlight ?? leader;
  const litEdges = highlight
    ? layout.edges.filter((edge) => edge.a.id === highlight.id || edge.b.id === highlight.id)
    : [];
  const dimEdges = highlight
    ? layout.edges.filter((edge) => edge.a.id !== highlight.id && edge.b.id !== highlight.id)
    : layout.edges;
  const partners = new Set(litEdges.map((edge) => (edge.a.id === highlight?.id ? edge.b.id : edge.a.id)));
  const others = nodeList.length - 1;
  const month = formatMonthShort(data.month);
  const overhang = layout.step * ARC_OVERHANG_STEPS;

  const groupParts = layout.groups
    .map((entry) => ({ entry, count: entry.nodes.filter((node) => partners.has(node.id)).length }))
    .filter((item) => item.count > 0)
    .map((item) => `${formatInt(item.count)} do grupo ${item.entry.group.inSentence}`);
  const summary = [
    `Grafo circular com ${countLabel(nodeList.length, 'origem', 'origens')} em ${countLabel(layout.groups.length, 'grupo', 'grupos')} e ${countLabel(layout.edges.length, 'par que divide', 'pares que dividem')} jornada em ${month}.`,
    highlight
      ? `A origem selecionada, ${highlight.inSentence}, divide jornada com ${formatInt(highlight.degree)} das outras ${formatInt(others)}${groupParts.length > 0 ? `: ${joinNames(groupParts)}` : ''}.`
      : `Nenhuma origem selecionada; ${leader.inSentence} é a que mais divide jornada, com ${formatInt(leader.degree)} das outras ${formatInt(others)}.`,
  ].join(' ');

  // A contagem vai separada do texto para sair em Space Grotesk: em Manrope tabular o "14" abre um
  // vão entre os dois algarismos e lê como dois números.
  const legendRows = highlight
    ? [
        {
          lit: true,
          count: litEdges.length,
          text: ` ${litEdges.length === 1 ? 'ligação' : 'ligações'} de ${highlight.inSentence}`,
        },
        {
          lit: false,
          count: dimEdges.length,
          text: ` ${dimEdges.length === 1 ? 'outra ligação' : 'outras ligações'} entre as origens`,
        },
      ]
    : [
        {
          lit: false,
          count: layout.edges.length,
          text: ` ${layout.edges.length === 1 ? 'ligação' : 'ligações'} entre as origens`,
        },
      ];
  const dimOpacity = highlight ? DIM_OPACITY : 1;

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
          <tspan fill="var(--text-primary)" fontWeight={600}>
            {focus.label}
          </tspan>
          {highlight ? ' divide jornada com ' : ' lidera: divide jornada com '}
          <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
            {formatInt(focus.degree)}
          </tspan>
          {' das '}
          <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
            {formatInt(others)}
          </tspan>
          {' outras origens em '}
          <tspan className="tabular-nums">{month}</tspan>.
        </text>

        {/* O arco diz a que grupo o nó pertence, então é dado e mede 3:1 (ACE-6): `--text-muted`. */}
        {layout.groups.map((entry) => {
          const tickFrom = polar(R_NODE, entry.nameAngle);
          const tickTo = polar(R_NODE + TICK_LENGTH, entry.nameAngle);
          return (
            <g key={`arc-${entry.group.id}`}>
              <path
                d={arcPath(entry.start - overhang, entry.end + overhang)}
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth={ARC_WIDTH}
              />
              <line
                stroke="var(--text-muted)"
                strokeWidth={ARC_WIDTH}
                x1={tickFrom.x}
                x2={tickTo.x}
                y1={tickFrom.y}
                y2={tickTo.y}
              />
            </g>
          );
        })}

        {/* Fora de foco: `--text-muted` a 0,76 mede 3,58:1 e 3,28:1; abaixo de 0,72 cai do piso. */}
        {dimEdges.map((edge) => (
          <path
            d={edgePath(edge)}
            fill="none"
            key={`dim-${edge.id}`}
            stroke="var(--text-muted)"
            strokeOpacity={dimOpacity}
            strokeWidth={EDGE_WIDTH}
          />
        ))}
        {/* Revestimento antes do traço aceso: sem ele o ciano se funde com o cinza que cruza (TOK-4). */}
        {litEdges.map((edge) => (
          <path
            d={edgePath(edge)}
            fill="none"
            key={`casing-${edge.id}`}
            stroke="var(--surface-raised)"
            strokeWidth={EDGE_WIDTH_LIT + EDGE_CASING}
          />
        ))}
        {litEdges.map((edge) => (
          <path
            d={edgePath(edge)}
            fill="none"
            key={`lit-${edge.id}`}
            stroke="var(--chart-1)"
            strokeLinecap="round"
            strokeWidth={EDGE_WIDTH_LIT}
          />
        ))}

        {nodeList.map((node) => {
          const isSelected = node.id === highlight?.id;
          const isLit = isSelected || partners.has(node.id);
          return (
            <g key={`node-${node.id}`}>
              {/* Dica fora do `<text>`: traz o número de ligações do nó, que o corpo só escreve
                  para a origem selecionada (DIC-1). */}
              <title>{`${node.label}: ${countLabel(node.degree, 'ligação', 'ligações')}`}</title>
              <circle
                cx={node.point.x}
                cy={node.point.y}
                fill={isLit ? 'var(--chart-1)' : 'var(--text-secondary)'}
                r={isSelected ? NODE_RADIUS_LIT : NODE_RADIUS}
                stroke="var(--surface-raised)"
                strokeWidth={1}
              />
            </g>
          );
        })}

        {nodeList.map((node) => {
          const label = labels.get(node.id);
          if (!label) return null;
          const isSelected = node.id === highlight?.id;
          const isPartner = partners.has(node.id);
          return (
            <text
              className="font-sans"
              dominantBaseline="central"
              fill={isSelected || isPartner ? 'var(--text-primary)' : 'var(--text-secondary)'}
              fontSize={LABEL_FONT_PX}
              fontWeight={isSelected ? 700 : isPartner ? 600 : 500}
              key={`label-${node.id}`}
              textAnchor={label.anchor}
              x={label.x}
              y={label.y}
            >
              {node.label}
            </text>
          );
        })}
        {layout.groups.map((entry) => {
          const label = labels.get(groupLabelId(entry.group.id));
          if (!label) return null;
          return (
            <text
              className="font-sans"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={GROUP_FONT_PX}
              fontWeight={600}
              key={`group-${entry.group.id}`}
              textAnchor={label.anchor}
              x={label.x}
              y={label.y}
            >
              {entry.group.label}
            </text>
          );
        })}

        {legendRows.map((row, index) => {
          const y = LEGEND_ROWS_Y[index] ?? ORDER_Y;
          return (
            <g key={row.text}>
              <line
                stroke={row.lit ? 'var(--chart-1)' : 'var(--text-muted)'}
                strokeLinecap={row.lit ? 'round' : 'butt'}
                strokeOpacity={row.lit ? 1 : dimOpacity}
                strokeWidth={row.lit ? EDGE_WIDTH_LIT : EDGE_WIDTH}
                x1={0}
                x2={LEGEND_SAMPLE_WIDTH}
                y1={y}
                y2={y}
              />
              <text
                className="font-sans"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={LABEL_FONT_PX}
                x={LEGEND_TEXT_X}
                y={y}
              >
                <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>
                  {formatInt(row.count)}
                </tspan>
                {row.text}
              </text>
            </g>
          );
        })}
        <text
          className="font-sans"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize={LABEL_FONT_PX}
          x={0}
          y={ORDER_Y}
        >
          Ordem em cada grupo: de mais ligações a menos, em sentido horário.
        </text>
      </svg>
    </div>
  );
}
