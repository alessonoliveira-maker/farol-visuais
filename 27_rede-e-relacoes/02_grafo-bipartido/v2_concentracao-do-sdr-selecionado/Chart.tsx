import { Filter } from 'lucide-react';
import { useMemo, useState } from 'react';

import { formatInt, formatPercentFromScale100 } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type GraphLink, type GraphNode, type HandoffGraph } from './data';

/**
 * Grafo bipartido com um nó aceso: as ligações do SDR selecionado sobem para a cor de destaque, as
 * demais baixam, e cada executivo passa a mostrar a parte que recebe dele. Responde se os repasses
 * de um SDR se concentram em poucos executivos. Passar o mouse num nó troca o aceso sem mexer no layout.
 */
export interface SelectedNodeBipartiteGraphProps {
  readonly data?: HandoffGraph;
  /** Id do nó aceso, de qualquer das duas colunas. Id que não existe deixa o grafo inteiro em neutro. */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox repete o corpo medido do cartão, para a escala sair 1 e os 11 px valerem na tela (GEO-18). */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 272;
/**
 * Margem lateral reservada ao rótulo de duas linhas. A esquerda guarda a linha mais larga, "100% (16 de 16)",
 * medida em 86,55 px mais o vão de 8 px do rótulo (94,55), porque o hover num executivo leva o percentual
 * para a coluna da esquerda; 100 deixa folga. A direita guarda o rótulo do executivo.
 */
const MARGIN = { top: 2, right: 96, bottom: 2, left: 100 } as const;
const NODE_WIDTH = 8;
const NODE_MIN_HEIGHT = 12;
/** Passo entre as pontas das ligações dentro do nó: a faixa forte, de 5 px, mais 1 px de vão. */
const SLOT = 6;
/** Altura de tinta do rótulo de duas linhas; a caixa do nó nunca é menor que ela. */
const LABEL_BLOCK = 24;
/** Vão entre caixas: o dobro do vão entre as duas linhas do rótulo (4,9 px), para o olho juntar nome e valor do mesmo nó. */
const BOX_GAP = 10;
/** Piso do vão quando a coluna não cabe: os vãos apertam até aqui antes de o desenho vazar do viewBox. */
const MIN_BOX_GAP = 4;
const LABEL_GAP = 8;
/** Linhas de base do nome (12 px) e do valor (11 px), medidas a partir do centro do nó. */
const NAME_DY = -3;
const VALUE_DY = 11;
const SWEEPS = 8;
/** A linha de leitura soma os dois pares mais fortes do nó aceso; o texto "dois pares" depende deste 2. */
const TOP_PAIRS = 2;
const BANDS = [
  { name: 'fraca', width: 1.5 },
  { name: 'média', width: 3 },
  { name: 'forte', width: 5 },
] as const;
/** Revestimento na cor do cartão por baixo de cada ligação, 1 px de cada lado (TOK-4). */
const CASING = 2;
const FOCUS = 'var(--chart-1)';
/** ACE-6: a ligação é o dado. `--line-strong` mede 1,79:1; `--text-muted` mede 5,21:1 e 5,37:1. */
const LINK_STROKE = 'var(--text-muted)';
/**
 * ACE-5: fora de foco a ligação baixa por opacidade medida, nunca abaixo de 3:1. A 0,76 o
 * `--text-muted` composto mede 3,58:1 no escuro e 3,28:1 no claro contra o cartão (piso em 0,72).
 */
const DIM_OPACITY = 0.76;
const NODE_FILL = 'var(--text-secondary)';
const SURFACE = 'var(--surface-raised)';

function positionOf(order: readonly string[]): Map<string, number> {
  return new Map(order.map((id, index) => [id, index]));
}

function linkKey(link: GraphLink): string {
  return `${link.source}>${link.target}`;
}

/** EST-1b: nó sem vizinho não tem baricentro, e a média devolve null em vez de zero. */
function meanPosition(ids: readonly string[], position: ReadonlyMap<string, number>): number | null {
  if (ids.length === 0) return null;
  return ids.reduce((sum, id) => sum + (position.get(id) ?? 0), 0) / ids.length;
}

/** Ordena uma coluna pela média das posições dos vizinhos na outra; nó sem vizinho vai para o fim. */
function sortByBarycenter(
  order: readonly string[],
  fixed: ReadonlyMap<string, number>,
  neighbors: ReadonlyMap<string, readonly string[]>,
): string[] {
  const previous = positionOf(order);
  const barycenter = new Map(order.map((id) => [id, meanPosition(neighbors.get(id) ?? [], fixed)]));
  return [...order].sort((a, b) => {
    const meanA = barycenter.get(a) ?? null;
    const meanB = barycenter.get(b) ?? null;
    if ((meanA === null) !== (meanB === null)) return meanA === null ? 1 : -1;
    if (meanA !== null && meanB !== null && meanA !== meanB) return meanA - meanB;
    return (previous.get(a) ?? 0) - (previous.get(b) ?? 0);
  });
}

function countCrossings(
  links: readonly GraphLink[],
  sources: ReadonlyMap<string, number>,
  targets: ReadonlyMap<string, number>,
): number {
  let crossings = 0;
  links.forEach((a, index) => {
    links.forEach((b, other) => {
      if (other <= index) return;
      const bySource = (sources.get(a.source) ?? 0) - (sources.get(b.source) ?? 0);
      const byTarget = (targets.get(a.target) ?? 0) - (targets.get(b.target) ?? 0);
      if (bySource * byTarget < 0) crossings += 1;
    });
  });
  return crossings;
}

interface ColumnOrder {
  readonly sources: readonly string[];
  readonly targets: readonly string[];
}

/**
 * Baricentro com várias largadas: cada nó da esquerda abre a coluna uma vez, as duas colunas se
 * reordenam em turnos e fica a ordem de menos cruzamentos. Uma largada só encalha em mínimo local.
 * Espelhar as duas colunas não muda os cruzamentos, então o nó aceso sobe para a metade de cima.
 */
function orderColumns(graph: HandoffGraph, anchorId: string): ColumnOrder {
  const bySource = new Map<string, string[]>();
  const byTarget = new Map<string, string[]>();
  for (const link of graph.links) {
    bySource.set(link.source, [...(bySource.get(link.source) ?? []), link.target]);
    byTarget.set(link.target, [...(byTarget.get(link.target) ?? []), link.source]);
  }
  const sourceIds = graph.sources.nodes.map((node) => node.id);
  const targetIds = graph.targets.nodes.map((node) => node.id);
  let best: { readonly sources: string[]; readonly targets: string[]; readonly crossings: number } | null = null;
  for (let start = 0; start < sourceIds.length; start += 1) {
    let sources = [...sourceIds.slice(start), ...sourceIds.slice(0, start)];
    let targets = targetIds;
    for (let sweep = 0; sweep < SWEEPS; sweep += 1) {
      targets = sortByBarycenter(targets, positionOf(sources), byTarget);
      sources = sortByBarycenter(sources, positionOf(targets), bySource);
      const crossings = countCrossings(graph.links, positionOf(sources), positionOf(targets));
      if (best === null || crossings < best.crossings) best = { sources, targets, crossings };
    }
  }
  const sources = best?.sources ?? sourceIds;
  const targets = best?.targets ?? targetIds;
  const linkedSources = sources.filter((id) => bySource.has(id));
  const linkedTargets = targets.filter((id) => byTarget.has(id));
  const anchorColumn = linkedSources.includes(anchorId) ? linkedSources : linkedTargets;
  if (anchorColumn.indexOf(anchorId) <= (anchorColumn.length - 1) / 2) return { sources, targets };
  return {
    sources: [...linkedSources.reverse(), ...sources.filter((id) => !bySource.has(id))],
    targets: [...linkedTargets.reverse(), ...targets.filter((id) => !byTarget.has(id))],
  };
}

interface NodeBox {
  readonly center: number;
  readonly height: number;
}

/** Empilha as caixas da coluna e reparte a sobra de altura entre os vãos: as duas colunas fecham juntas. */
function layoutColumn(order: readonly string[], degree: ReadonlyMap<string, number>): Map<string, NodeBox> {
  const heights = order.map((id) => Math.max((degree.get(id) ?? 0) * SLOT, NODE_MIN_HEIGHT));
  const boxes = heights.map((nodeHeight) => Math.max(nodeHeight, LABEL_BLOCK));
  const gaps = Math.max(order.length - 1, 0);
  const natural = boxes.reduce((sum, box) => sum + box, 0) + gaps * BOX_GAP;
  const free = VIEW_HEIGHT - MARGIN.top - MARGIN.bottom - natural;
  // Sobra de altura abre os vãos por igual; falta de altura os aperta, até o piso.
  const spread = gaps === 0 ? 0 : Math.max(free / gaps, MIN_BOX_GAP - BOX_GAP);
  let cursor = MARGIN.top + (gaps === 0 ? Math.max(free, 0) / 2 : 0);
  const layout = new Map<string, NodeBox>();
  order.forEach((id, index) => {
    const box = boxes[index] ?? LABEL_BLOCK;
    layout.set(id, { center: cursor + box / 2, height: heights[index] ?? NODE_MIN_HEIGHT });
    cursor += box + BOX_GAP + spread;
  });
  return layout;
}

/** Ponta de cada ligação dentro do nó: as ligações do nó se ordenam pelo centro do vizinho e ganham um passo cada. */
function endpointByLink(
  links: readonly GraphLink[],
  own: 'source' | 'target',
  ownLayout: ReadonlyMap<string, NodeBox>,
  otherLayout: ReadonlyMap<string, NodeBox>,
): Map<string, number> {
  const other = own === 'source' ? 'target' : 'source';
  const grouped = new Map<string, GraphLink[]>();
  for (const link of links) grouped.set(link[own], [...(grouped.get(link[own]) ?? []), link]);
  const endpoints = new Map<string, number>();
  for (const [nodeId, group] of grouped) {
    const center = ownLayout.get(nodeId)?.center ?? 0;
    const sorted = [...group].sort(
      (a, b) => (otherLayout.get(a[other])?.center ?? 0) - (otherLayout.get(b[other])?.center ?? 0),
    );
    sorted.forEach((link, index) => {
      endpoints.set(linkKey(link), center + (index - (sorted.length - 1) / 2) * SLOT);
    });
  }
  return endpoints;
}

/** Bézier horizontal: os dois pontos de controle ficam no meio do vão, cada um na altura da sua ponta. */
function linkPath(x0: number, y0: number, x1: number, y1: number): string {
  const xm = (x0 + x1) / 2;
  return `M ${String(x0)},${String(y0)} C ${String(xm)},${String(y0)} ${String(xm)},${String(y1)} ${String(x1)},${String(y1)}`;
}

interface Band {
  readonly name: string;
  readonly width: number;
  readonly from: number;
  readonly to: number;
}

/** ROT-5b: as três faixas repartem o intervalo de 1 ao maior peso OBSERVADO; faixa sem inteiro dentro sai. */
function buildBands(maxWeight: number): Band[] {
  const cuts = [0, Math.floor(maxWeight / 3), Math.floor((2 * maxWeight) / 3), maxWeight];
  return BANDS.map((band, index) => ({ ...band, from: (cuts[index] ?? 0) + 1, to: cuts[index + 1] ?? maxWeight })).filter(
    (band) => band.from <= band.to,
  );
}

function handoffNoun(count: number): string {
  return count === 1 ? 'repasse' : 'repasses';
}

/** NUM-2: percentuais inteiros que somam 100, pelo maior resto. Total zero não tem parte: devolve null. */
function integerShares(weights: readonly number[]): number[] | null {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return null;
  const exact = weights.map((weight) => (weight * 100) / total);
  const shares = exact.map((value) => Math.floor(value));
  let missing = 100 - shares.reduce((sum, value) => sum + value, 0);
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (const { index } of byRemainder) {
    if (missing <= 0) break;
    shares[index] = (shares[index] ?? 0) + 1;
    missing -= 1;
  }
  return shares;
}

interface GraphModel {
  readonly nodes: ReadonlyMap<string, GraphNode>;
  readonly sourceIds: ReadonlySet<string>;
  readonly totals: ReadonlyMap<string, number>;
  /** Adjacência calculada uma vez, de cada nó para o peso de cada vizinho: o hover consulta, não varre. */
  readonly adjacency: ReadonlyMap<string, ReadonlyMap<string, number>>;
  readonly order: ColumnOrder;
  readonly sourceLayout: ReadonlyMap<string, NodeBox>;
  readonly targetLayout: ReadonlyMap<string, NodeBox>;
  readonly sourceEnds: ReadonlyMap<string, number>;
  readonly targetEnds: ReadonlyMap<string, number>;
  readonly bands: readonly Band[];
}

/** Tudo o que não depende do nó aceso: ordem, posições, pontas, faixas e a adjacência. Sem ligação, null. */
function buildModel(graph: HandoffGraph, anchorId: string): GraphModel | null {
  const maxWeight = graph.links.reduce<number | null>(
    (top, link) => (top === null || link.weight > top ? link.weight : top),
    null,
  );
  if (maxWeight === null) return null;
  const adjacency = new Map<string, Map<string, number>>();
  const totals = new Map<string, number>();
  for (const link of graph.links) {
    const ends = [
      [link.source, link.target],
      [link.target, link.source],
    ] as const;
    for (const [own, other] of ends) {
      adjacency.set(own, (adjacency.get(own) ?? new Map<string, number>()).set(other, link.weight));
      totals.set(own, (totals.get(own) ?? 0) + link.weight);
    }
  }
  const degree = new Map([...adjacency].map(([id, around]) => [id, around.size]));
  const order = orderColumns(graph, anchorId);
  const sourceLayout = layoutColumn(order.sources, degree);
  const targetLayout = layoutColumn(order.targets, degree);
  return {
    nodes: new Map([...graph.sources.nodes, ...graph.targets.nodes].map((node) => [node.id, node])),
    sourceIds: new Set(graph.sources.nodes.map((node) => node.id)),
    totals,
    adjacency,
    order,
    sourceLayout,
    targetLayout,
    sourceEnds: endpointByLink(graph.links, 'source', sourceLayout, targetLayout),
    targetEnds: endpointByLink(graph.links, 'target', targetLayout, sourceLayout),
    bands: buildBands(maxWeight),
  };
}

interface Neighbor {
  readonly id: string;
  readonly weight: number;
  /** Parte inteira do vizinho no total do nó aceso, de 0 a 100. */
  readonly points: number;
}

interface Focus {
  readonly id: string;
  readonly isSource: boolean;
  readonly total: number;
  /** Vizinhos do maior peso para o menor. */
  readonly neighbors: readonly Neighbor[];
  /** Os pares mais fortes do nó, somados: é o número da linha de leitura. */
  readonly top: readonly Neighbor[];
  readonly topWeight: number;
  readonly topPoints: number;
}

/** O nó aceso lido da adjacência, sem varrer as ligações. Nó sem ligação não acende nada: null. */
function focusOf(model: GraphModel, id: string): Focus | null {
  const around = model.adjacency.get(id);
  if (around === undefined) return null;
  const sorted = [...around].sort((a, b) => b[1] - a[1]);
  const shares = integerShares(sorted.map(([, weight]) => weight));
  if (shares === null) return null;
  const neighbors = sorted.map(([neighborId, weight], index) => ({ id: neighborId, weight, points: shares[index] ?? 0 }));
  const top = neighbors.slice(0, TOP_PAIRS);
  return {
    id,
    isSource: model.sourceIds.has(id),
    total: model.totals.get(id) ?? 0,
    neighbors,
    top,
    topWeight: top.reduce((sum, neighbor) => sum + neighbor.weight, 0),
    topPoints: top.reduce((sum, neighbor) => sum + neighbor.points, 0),
  };
}

export default function SelectedNodeBipartiteGraph({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: SelectedNodeBipartiteGraphProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // A ordem e o layout dependem só do dado e do nó selecionado: o hover troca o aceso sem mover nada.
  const model = useMemo(() => buildModel(data, highlightId), [data, highlightId]);
  const style = height === undefined ? undefined : { height };

  if (model === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum repasse neste recorte: nenhum SDR passou agenda a um executivo no período.</span>
      </div>
    );
  }

  const selected = focusOf(model, highlightId);
  const focus = hoveredId === null ? selected : (focusOf(model, hoveredId) ?? selected);
  const shareByNeighbor = new Map((focus?.neighbors ?? []).map((neighbor) => [neighbor.id, neighbor]));
  const focusTotal = focus?.total ?? 0;
  const labelOf = (id: string): string => model.nodes.get(id)?.label ?? id;
  const inSentence = (id: string): string => model.nodes.get(id)?.inSentence ?? id;
  const pairsWord = (count: number): string => (count === 1 ? 'um par' : 'dois pares');
  const sourceX = MARGIN.left;
  const targetX = VIEW_WIDTH - MARGIN.right - NODE_WIDTH;

  // Fora de foco primeiro e aceso por último: o revestimento das ligações acesas abre passagem sobre as demais.
  const drawnLinks = data.links
    .map((link) => ({ link, lit: focus !== null && (link.source === focus.id || link.target === focus.id) }))
    .sort((a, b) => Number(a.lit) - Number(b.lit) || a.link.weight - b.link.weight)
    .map(({ link, lit }) => {
      const key = linkKey(link);
      return {
        key,
        lit,
        d: linkPath(sourceX + NODE_WIDTH, model.sourceEnds.get(key) ?? 0, targetX, model.targetEnds.get(key) ?? 0),
        width: model.bands.find((band) => link.weight <= band.to)?.width ?? BANDS[0].width,
        title: `${labelOf(link.source)} com ${inSentence(link.target)}: ${formatInt(link.weight)} ${handoffNoun(link.weight)}`,
      };
    });

  const drawnNodes = [
    ...model.order.sources.map((id) => ({ id, isSource: true, box: model.sourceLayout.get(id) })),
    ...model.order.targets.map((id) => ({ id, isSource: false, box: model.targetLayout.get(id) })),
  ].map(({ id, isSource, box }) => {
    const x = isSource ? sourceX : targetX;
    const total = model.totals.get(id) ?? 0;
    const share = shareByNeighbor.get(id);
    const isActive = focus?.id === id;
    const sameSide = focus === null || focus.isSource === isSource;
    // Zero medido não some: o nó da outra coluna sem ligação com o aceso escreve 0% e 0 de N.
    const value = sameSide
      ? `${formatInt(total)} ${handoffNoun(total)}`
      : `${formatPercentFromScale100(share?.points ?? 0, 0)} (${formatInt(share?.weight ?? 0)} de ${formatInt(focusTotal)})`;
    const lowered = focus !== null && !isActive && share === undefined;
    return {
      id,
      x,
      value,
      isActive,
      center: box?.center ?? 0,
      height: box?.height ?? NODE_MIN_HEIGHT,
      label: labelOf(id),
      labelX: isSource ? x - LABEL_GAP : x + NODE_WIDTH + LABEL_GAP,
      anchor: isSource ? ('end' as const) : ('start' as const),
      hitX: isSource ? 0 : x,
      hitWidth: isSource ? x + NODE_WIDTH : VIEW_WIDTH - x,
      fill: isActive ? FOCUS : lowered ? LINK_STROKE : NODE_FILL,
      nameFill: isActive ? 'var(--text-primary)' : lowered ? 'var(--text-muted)' : 'var(--text-secondary)',
      valueFill: isActive || share !== undefined ? 'var(--text-primary)' : 'var(--text-muted)',
    };
  });

  // A frase acessível descreve o nó SELECIONADO, que é o estado da página; o hover é passageiro.
  const strongest = selected?.neighbors[0];
  const scope = `Grafo bipartido de repasses de agenda no ${data.period}, com ${formatInt(data.sources.nodes.length)} ${data.sources.plural} e ${formatInt(data.targets.nodes.length)} ${data.targets.plural}`;
  const summary =
    selected === null || strongest === undefined
      ? `${scope}, ligados por ${formatInt(data.links.length)} pares. Nenhum nó está em destaque.`
      : `${scope}. Em destaque, ${inSentence(selected.id)}: ${formatPercentFromScale100(selected.topPoints, 0)} dos repasses (${formatInt(selected.topWeight)} de ${formatInt(selected.total)}) em ${pairsWord(selected.top.length)}. O par mais forte é com ${inSentence(strongest.id)}, ${formatPercentFromScale100(strongest.points, 0)} (${formatInt(strongest.weight)} de ${formatInt(selected.total)}).`;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {focus === null ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
          Nenhum nó em destaque: <span className="tabular-nums">{formatInt(data.links.length)}</span> pares com repasse no período.
        </p>
      ) : (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
          <span className="font-semibold text-text-primary">{labelOf(focus.id)}</span>:{' '}
          <span className="font-semibold tabular-nums text-text-primary">{formatPercentFromScale100(focus.topPoints, 0)}</span> dos
          repasses (<span className="tabular-nums">{formatInt(focus.topWeight)}</span> de{' '}
          <span className="tabular-nums">{formatInt(focus.total)}</span>) em {pairsWord(focus.top.length)}, com{' '}
          {focus.top.map((neighbor) => inSentence(neighbor.id)).join(' e ')}.
        </p>
      )}
      <div className="mb-2 flex shrink-0 items-center gap-x-4 text-[0.6875rem] leading-4 text-text-muted">
        <span>Repasses por par:</span>
        {model.bands.map((band) => (
          <span className="flex items-center gap-1.5" key={band.name}>
            <span aria-hidden className="w-5 shrink-0 rounded-full" style={{ height: band.width, backgroundColor: LINK_STROKE }} />
            <span>
              {band.name},{' '}
              <span className="tabular-nums">
                {band.from === band.to ? formatInt(band.from) : `${formatInt(band.from)} a ${formatInt(band.to)}`}
              </span>
            </span>
          </span>
        ))}
        <span className="ml-auto">{data.period}</span>
      </div>
      <div className="min-h-0 flex-1">
        {/* xMidYMin: sobrando altura no cartão, o grafo fica colado ao que vem acima em vez de centrado, e a escala segue 1. */}
        <svg
          aria-hidden
          className="h-full w-full"
          preserveAspectRatio="xMidYMin meet"
          viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}
        >
          {drawnLinks.map((link) => (
            <g key={link.key}>
              <title>{link.title}</title>
              <path d={link.d} fill="none" stroke={SURFACE} strokeWidth={link.width + CASING} />
              <path
                d={link.d}
                fill="none"
                stroke={link.lit ? FOCUS : LINK_STROKE}
                strokeOpacity={focus !== null && !link.lit ? DIM_OPACITY : undefined}
                strokeWidth={link.width}
              />
            </g>
          ))}
          {drawnNodes.map((node) => (
            <g key={node.id} onMouseEnter={() => setHoveredId(node.id)} onMouseLeave={() => setHoveredId(null)}>
              {/* Área de hover sem pintura: fill none não desenha nada, e pointerEvents all ainda recebe o mouse. */}
              <rect
                fill="none"
                height={Math.max(node.height, LABEL_BLOCK)}
                pointerEvents="all"
                width={node.hitWidth}
                x={node.hitX}
                y={node.center - Math.max(node.height, LABEL_BLOCK) / 2}
              />
              <rect fill={node.fill} height={node.height} rx={2} width={NODE_WIDTH} x={node.x} y={node.center - node.height / 2} />
              <text textAnchor={node.anchor}>
                <tspan className="font-sans" fill={node.nameFill} fontSize={12} fontWeight={node.isActive ? 700 : 500} x={node.labelX} y={node.center + NAME_DY}>
                  {node.label}
                </tspan>
                <tspan className="font-display" fill={node.valueFill} fontSize={11} fontWeight={node.isActive ? 700 : 500} x={node.labelX} y={node.center + VALUE_DY}>
                  {node.value}
                </tspan>
              </text>
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}
