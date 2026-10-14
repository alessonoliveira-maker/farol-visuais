import { ChevronDown, ChevronRight, Filter } from 'lucide-react';
import { useMemo, useState } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OrgUnit } from './data';

/**
 * Árvore lateral desbalanceada: uma coordenação com 14 funções e outra com 2 no mesmo cartão.
 *
 * O afastamento entre subárvores vizinhas é pelo CONTORNO, na ideia de Reingold e Tilford: cada
 * subárvore devolve, por profundidade, a linha mais alta e a mais baixa que ela ocupa
 * (`top` e `bottom`), e a vizinha desce só o quanto o encontro dos dois contornos pedir
 * (`requiredShift`), nunca a soma das folhas. A diferença é medida nesta peça: empilhar por folha
 * poria a Comercial 32 px abaixo da Pré-vendas recolhida, e o contorno a põe a 16 px, porque o nó
 * dela mora no meio das próprias folhas e a coluna da Pré-vendas recolhida está vazia ali.
 *
 * Duas coisas seguram a altura, e as duas são a mesma regra vista de ângulos diferentes: a
 * profundidade máxima visível é fixa (`MAX_DEPTH`), e o número de filhos desenhados por nó tem
 * teto (`MAX_VISIBLE_CHILDREN`). O que fica fora vira contagem escrita: o selo do botão no ramo
 * recolhido, o selo à direita no nó cortado pela profundidade, e uma linha própria de folhas
 * ocultas quando o teto de filhos corta.
 *
 * O rótulo de nó com filho fica ACIMA do nó, não ao lado: a aresta em elbow sai do nó na
 * horizontal e passaria por dentro do rótulo colocado à direita, que é o defeito que a v1 deste
 * modelo teve de resolver por anticolisão. Aqui a geometria resolve antes: o corredor horizontal
 * de cada aresta corre na linha do nó, 19 px abaixo do rótulo, e o corredor vertical corre em
 * `MID_X`, entre o fim do bloco de rótulo e o início da coluna seguinte.
 *
 * O SVG declara `width` e `height` em pixel e não tem `viewBox`, então não escala e o texto chega
 * à tela com o tamanho declarado; os botões são HTML por cima, na mesma coordenada, porque `<svg>`
 * não aceita `<button>` e o estado precisa ser alcançável por teclado.
 */
export interface CollapsedSubtreeProps {
  readonly data?: OrgUnit;
  readonly height?: number;
  readonly className?: string;
}

/** Largura do corpo medido do canvas 640x360 na moldura card, com o caso de uso em uma linha. */
const BODY_W = 574;
const COLUMN_X = [10, 150, 356] as const;
/** Corredor vertical da aresta, por profundidade: entre o bloco de rótulo e a coluna seguinte. */
const MID_X = [130, 345] as const;
const BUTTON_X = 246;
const ROW_STEP = 32;
/**
 * Distância do rótulo de nó com filho até a linha do nó, acima dele. O rótulo também anda os
 * mesmos 14 px da coluna que o de folha: colado na vertical do próprio nó, ele nascia a 2 px do
 * ponto do irmão de cima, que fica 32 px acima, e o ponto lia como marcador do rótulo errado.
 */
const LABEL_ABOVE = 16;
const LEAF_LABEL_DX = 14;
const NODE_RADIUS = [6, 5, 4] as const;
const EDGE_WIDTH = 1.5;
const LABEL_FONT_PX = 12;
const SELO_FONT_PX = 11;
/** Meia altura da tinta de uma linha de rótulo de 12 px, com folga, para o enquadramento. */
const ROW_HALF = 8;
/** Meia altura do botão de 14 px de linha com respiro vertical. */
const BUTTON_HALF = 9;
/** Profundidade máxima visível: raiz, coordenação, função. O que vem depois sai como contagem. */
const MAX_DEPTH = 2;
/** Teto de filhos desenhados por nó; o excedente vira uma linha de folhas ocultas. */
const MAX_VISIBLE_CHILDREN = 6;

type NodeKind = 'root' | 'branch' | 'capped' | 'leaf' | 'more';

interface Placed {
  readonly id: string;
  readonly label: string;
  readonly depth: number;
  readonly y: number;
  readonly slot: number | null;
  readonly kind: NodeKind;
  readonly open: boolean;
  readonly childCount: number;
  readonly hiddenCount: number;
}

interface PlacedEdge {
  readonly id: string;
  readonly depth: number;
  readonly fromY: number;
  readonly toY: number;
  readonly slot: number | null;
}

interface Sub {
  readonly nodes: readonly Placed[];
  readonly edges: readonly PlacedEdge[];
  readonly top: ReadonlyMap<number, number>;
  readonly bottom: ReadonlyMap<number, number>;
  readonly rootY: number;
}

function slotColor(slot: number | null): string {
  if (slot === null) return 'var(--text-muted)';
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

function childrenOf(unit: OrgUnit): readonly OrgUnit[] {
  return unit.children ?? [];
}

/** Descendentes de um nó, em qualquer profundidade. Zero descendente é zero medido (EST-3). */
function countDescendants(unit: OrgUnit): number {
  return childrenOf(unit).reduce((sum, child) => sum + 1 + countDescendants(child), 0);
}

function collectExpanded(unit: OrgUnit): ReadonlySet<string> {
  const ids = new Set<string>();
  const walk = (node: OrgUnit): void => {
    if (node.expanded === true) ids.add(node.id);
    for (const child of childrenOf(node)) walk(child);
  };
  walk(unit);
  return ids;
}

/**
 * Quanto a próxima subárvore precisa descer para o contorno dela não encostar no contorno já
 * ocupado, profundidade por profundidade. Profundidade que só uma das duas ocupa não restringe
 * nada, porque ali as colunas não se cruzam: é isso que aproxima o irmão estreito do irmão largo.
 */
function requiredShift(bottom: ReadonlyMap<number, number>, top: ReadonlyMap<number, number>): number {
  let shift = 0;
  for (const [depth, topY] of top) {
    const bottomY = bottom.get(depth);
    if (bottomY === undefined) continue;
    shift = Math.max(shift, bottomY + ROW_STEP - topY);
  }
  return shift;
}

function layoutUnit(
  unit: OrgUnit,
  depth: number,
  slot: number | null,
  expanded: ReadonlySet<string>,
): Sub {
  const kids = childrenOf(unit);
  const canOpen = kids.length > 0 && depth < MAX_DEPTH;
  const isOpen = canOpen && expanded.has(unit.id);

  if (!isOpen) {
    const kind: NodeKind =
      depth === 0 ? 'root' : kids.length === 0 ? 'leaf' : depth >= MAX_DEPTH ? 'capped' : 'branch';
    const placed: Placed = {
      id: unit.id,
      label: unit.label,
      depth,
      y: 0,
      slot,
      kind,
      open: false,
      childCount: kids.length,
      hiddenCount: countDescendants(unit),
    };
    return {
      nodes: [placed],
      edges: [],
      top: new Map([[depth, 0]]),
      bottom: new Map([[depth, 0]]),
      rootY: 0,
    };
  }

  const visible = kids.slice(0, MAX_VISIBLE_CHILDREN);
  const hiddenChildren = kids.length - visible.length;
  const nodes: Placed[] = [];
  const edges: PlacedEdge[] = [];
  const top = new Map<number, number>();
  const bottom = new Map<number, number>();
  const childAnchors: { readonly id: string; readonly y: number }[] = [];

  const absorb = (sub: Sub, anchorId: string): void => {
    const shift = requiredShift(bottom, sub.top);
    for (const node of sub.nodes) nodes.push({ ...node, y: node.y + shift });
    for (const edge of sub.edges) {
      edges.push({ ...edge, fromY: edge.fromY + shift, toY: edge.toY + shift });
    }
    for (const [childDepth, value] of sub.top) {
      const current = top.get(childDepth);
      top.set(childDepth, current === undefined ? value + shift : Math.min(current, value + shift));
    }
    for (const [childDepth, value] of sub.bottom) {
      const current = bottom.get(childDepth);
      bottom.set(childDepth, current === undefined ? value + shift : Math.max(current, value + shift));
    }
    childAnchors.push({ id: anchorId, y: sub.rootY + shift });
  };

  for (const child of visible) {
    absorb(layoutUnit(child, depth + 1, slot ?? child.slot ?? 1, expanded), child.id);
  }

  if (hiddenChildren > 0) {
    const moreId = `${unit.id}-more`;
    absorb(
      {
        nodes: [
          {
            id: moreId,
            label: '',
            depth: depth + 1,
            y: 0,
            slot,
            kind: 'more',
            open: false,
            childCount: 0,
            hiddenCount: hiddenChildren,
          },
        ],
        edges: [],
        top: new Map([[depth + 1, 0]]),
        bottom: new Map([[depth + 1, 0]]),
        rootY: 0,
      },
      moreId,
    );
  }

  const firstAnchor = childAnchors.at(0);
  const lastAnchor = childAnchors.at(-1);
  const y = firstAnchor && lastAnchor ? (firstAnchor.y + lastAnchor.y) / 2 : 0;

  nodes.push({
    id: unit.id,
    label: unit.label,
    depth,
    y,
    slot,
    kind: depth === 0 ? 'root' : 'branch',
    open: true,
    childCount: kids.length,
    hiddenCount: 0,
  });
  const ownTop = top.get(depth);
  top.set(depth, ownTop === undefined ? y : Math.min(ownTop, y));
  const ownBottom = bottom.get(depth);
  bottom.set(depth, ownBottom === undefined ? y : Math.max(ownBottom, y));

  for (const anchor of childAnchors) {
    edges.push({ id: `edge-${anchor.id}`, depth, fromY: y, toY: anchor.y, slot });
  }

  return { nodes, edges, top, bottom, rootY: y };
}

/** Tinta mais alta e mais baixa que o nó ocupa, para enquadrar o desenho sem cortar rótulo. */
function topEdge(node: Placed): number {
  if (node.depth < MAX_DEPTH) return node.y - LABEL_ABOVE - BUTTON_HALF;
  return node.y - ROW_HALF;
}

function bottomEdge(node: Placed): number {
  return node.y + ROW_HALF;
}

function boundsOf(nodes: readonly Placed[]): { readonly min: number; readonly max: number } | null {
  if (nodes.length === 0) return null;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const node of nodes) {
    min = Math.min(min, topEdge(node));
    max = Math.max(max, bottomEdge(node));
  }
  return { min, max };
}

/** "1 função" no singular, "N funções" no plural (NUM-6). */
function formatRoles(value: number): string {
  return `${formatInt(value)} ${value === 1 ? 'função' : 'funções'}`;
}

/** "1 coordenação" no singular, "N coordenações" no plural (NUM-6). */
function formatBranches(value: number): string {
  return `${formatInt(value)} ${value === 1 ? 'coordenação' : 'coordenações'}`;
}

function joinLabels(labels: readonly string[]): string {
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0] ?? '';
  return `${labels.slice(0, -1).join(', ')} e ${labels.at(-1) ?? ''}`;
}

/** O ramo com mais filhos declarados, que é o que a versão existe para caber. */
function widestBranch(nodes: readonly Placed[]): Placed | null {
  const branches = nodes.filter((node) => node.depth === 1);
  if (branches.length === 0) return null;
  return [...branches].sort((a, b) => b.childCount - a.childCount)[0] ?? null;
}

export default function CollapsedSubtree({ data = defaultData, height, className }: CollapsedSubtreeProps) {
  const style = height === undefined ? undefined : { height };
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => collectExpanded(data));
  const layout = useMemo(() => layoutUnit(data, 0, null, expandedIds), [data, expandedIds]);
  const bounds = boundsOf(layout.nodes);

  const toggle = (id: string): void => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (childrenOf(data).length === 0 || bounds === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma coordenação neste recorte: sem ramo declarado, não há subárvore a recolher.</span>
      </div>
    );
  }

  const offset = 1 - bounds.min;
  const contentHeight = bounds.max - bounds.min + 2;
  const widest = widestBranch(layout.nodes);
  const openLabels = layout.nodes
    .filter((node) => node.depth === 1 && node.open)
    .map((node) => node.label);
  const drawnRoles = layout.nodes.filter(
    (node) => node.depth === MAX_DEPTH && node.kind !== 'more',
  ).length;
  const cappedHidden = layout.nodes
    .filter((node) => node.kind === 'capped')
    .reduce((sum, node) => sum + node.hiddenCount, 0);
  const branchCount = layout.nodes.filter((node) => node.depth === 1).length;

  const summary = [
    `Árvore lateral com ${formatBranches(branchCount)} da ${data.label}.`,
    widest === null
      ? ''
      : `${widest.label} concentra ${formatRoles(widest.childCount)} e chega ${widest.open ? 'aberta' : 'recolhida'}.`,
    openLabels.length === 0
      ? 'Nenhum ramo aberto neste estado.'
      : `${joinLabels(openLabels)} ficam abertas, com ${formatRoles(drawnRoles)} desenhadas e ${formatInt(cappedHidden)} ocultas pelo limite de profundidade.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-3', className)}
      role="group"
      style={style}
    >
      <p aria-hidden className="w-full shrink-0 text-xs leading-4 text-text-secondary">
        {widest === null ? null : (
          <>
            <span className="font-semibold text-text-primary">{widest.label}</span>
            {' concentra '}
            <span className="tabular-nums text-text-primary">{formatRoles(widest.childCount)}</span>
            {widest.open
              ? ' e chega aberta, ocupando o cartão inteiro.'
              : ' e chega recolhida, e as vizinhas abrem sem sobreposição.'}
          </>
        )}
      </p>
      <div className="relative shrink-0" style={{ height: contentHeight, width: BODY_W }}>
        <svg aria-hidden className="absolute inset-0" height={contentHeight} width={BODY_W}>
          {layout.edges.map((edge) => {
            const fromX = (COLUMN_X[edge.depth] ?? 0) + (NODE_RADIUS[edge.depth] ?? 4);
            const midX = MID_X[edge.depth] ?? 0;
            const toX = (COLUMN_X[edge.depth + 1] ?? 0) - (NODE_RADIUS[edge.depth + 1] ?? 4);
            const fromY = edge.fromY + offset;
            const toY = edge.toY + offset;
            return (
              // A aresta carrega a relação, então leva cor de dado e não o neutro de referência
              // `--line-strong`, que mede 1,79:1 e 1,83:1 contra o cartão (ACE-6).
              <path
                d={`M ${String(fromX)} ${String(fromY)} H ${String(midX)} V ${String(toY)} H ${String(toX)}`}
                fill="none"
                key={edge.id}
                stroke={slotColor(edge.slot)}
                strokeWidth={EDGE_WIDTH}
              />
            );
          })}
          {layout.nodes.map((node) => {
            const x = COLUMN_X[node.depth] ?? 0;
            const y = node.y + offset;
            const radius = NODE_RADIUS[node.depth] ?? 4;
            const isAbove = node.depth < MAX_DEPTH;
            return (
              <g key={node.id}>
                {node.kind === 'more' ? (
                  // Forma vazada para o que não está desenhado (ACE-2: ausência com forma e palavra).
                  <circle
                    cx={x}
                    cy={y}
                    fill="none"
                    r={radius}
                    stroke={slotColor(node.slot)}
                    strokeWidth={1.4}
                  />
                ) : (
                  <circle cx={x} cy={y} fill={slotColor(node.slot)} r={radius} />
                )}
                {node.kind === 'more' ? (
                  <text
                    className="font-sans"
                    dominantBaseline="central"
                    fill="var(--text-muted)"
                    fontSize={SELO_FONT_PX}
                    x={x + LEAF_LABEL_DX}
                    y={y}
                  >
                    {`${formatRoles(node.hiddenCount)} ocultas`}
                  </text>
                ) : (
                  <text
                    className="font-sans"
                    dominantBaseline="central"
                    fill={isAbove ? 'var(--text-primary)' : 'var(--text-secondary)'}
                    fontSize={LABEL_FONT_PX}
                    fontWeight={isAbove ? 600 : 500}
                    x={x + LEAF_LABEL_DX}
                    y={isAbove ? y - LABEL_ABOVE : y}
                  >
                    {node.label}
                    {node.kind === 'capped' ? (
                      <tspan dx={10} fill="var(--text-muted)" fontSize={SELO_FONT_PX} fontWeight={500}>
                        {`${formatInt(node.hiddenCount)} ocultas`}
                      </tspan>
                    ) : null}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {layout.nodes
          .filter((node) => node.kind === 'branch')
          .map((node) => (
            <button
              aria-expanded={node.open}
              aria-label={`${node.open ? 'Recolher' : 'Expandir'} ${node.label}, ${formatRoles(node.childCount)}`}
              className="absolute flex items-center gap-1 rounded-md border border-line-subtle bg-surface-sunken px-1.5 text-[0.6875rem] leading-[16px] text-text-secondary"
              key={`toggle-${node.id}`}
              onClick={() => {
                toggle(node.id);
              }}
              style={{ left: BUTTON_X, top: node.y + offset - LABEL_ABOVE - BUTTON_HALF }}
              type="button"
            >
              {node.open ? (
                <ChevronDown aria-hidden className="size-3 shrink-0" />
              ) : (
                <ChevronRight aria-hidden className="size-3 shrink-0" />
              )}
              <span className="tabular-nums">{formatRoles(node.childCount)}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
