import { Filter, Unplug } from 'lucide-react';

import { formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type GraphLink, type GraphNode, type HandoffGraph } from './data';

/**
 * Grafo bipartido que mantém na coluna o nó sem ligação: o executivo medido que não recebeu nada
 * vira contorno vazado com "0 repasses" escrito, e o SDR sem medição comparável vira o ícone de
 * indisponível. Responde quem ficou de fora dos repasses, sem confundir zero com ausência de dado.
 */
export interface IsolatedNodeBipartiteGraphProps {
  readonly data?: HandoffGraph;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox repete o corpo medido do cartão, para a escala sair 1 e os 11 px valerem na tela (GEO-18). */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 274;
/** Margem lateral reservada ao rótulo de duas linhas, nome e total, fora do nó. */
const MARGIN = { top: 2, right: 84, bottom: 2, left: 76 } as const;
const NODE_WIDTH = 8;
const NODE_MIN_HEIGHT = 12;
/** Nó de zero medido: mais alto que o mínimo, para o contorno vazado se ver no tamanho do cartão. */
const EMPTY_NODE_HEIGHT = 18;
const EMPTY_STROKE_WIDTH = 1.5;
const ICON_SIZE = 14;
/** Passo entre as pontas das ligações dentro do nó: a faixa forte, de 5 px, mais 1 px de vão. */
const SLOT = 6;
/** Altura de tinta do rótulo de duas linhas; a caixa do nó nunca é menor que ela. */
const LABEL_BLOCK = 24;
/** Vão entre caixas: o dobro do vão entre as duas linhas do rótulo (4,9 px), para o olho juntar nome e valor do mesmo nó. */
const BOX_GAP = 10;
/** Piso do vão quando a coluna não cabe: os vãos apertam até aqui antes de o desenho vazar do viewBox. */
const MIN_BOX_GAP = 4;
/** Vão a mais antes do primeiro nó sem ligação, para o grupo do fim da coluna se ler à parte. */
const ISOLATED_GAP = 8;
const LABEL_GAP = 8;
/** Linhas de base do nome (12 px) e do total (11 px), medidas a partir do centro do nó. */
const NAME_DY = -3;
const VALUE_DY = 11;
const SWEEPS = 8;
const BANDS = [
  { name: 'fraca', width: 1.5 },
  { name: 'média', width: 3 },
  { name: 'forte', width: 5 },
] as const;
/** Revestimento na cor do cartão por baixo de cada ligação, 1 px de cada lado (TOK-4). */
const CASING = 2;
/** ACE-6: a ligação é o dado. `--line-strong` mede 1,79:1; `--text-muted` mede 5,21:1 e 5,37:1. */
const LINK_STROKE = 'var(--text-muted)';
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

/** Ordena uma coluna pela média das posições dos vizinhos na outra. Grau zero não entra na média e vai para o fim. */
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
  /** Nós com ligação, na ordem do baricentro. Os sem ligação entram depois, no componente. */
  readonly sources: readonly string[];
  readonly targets: readonly string[];
}

/**
 * Baricentro com várias largadas: cada nó da esquerda abre a coluna uma vez, as duas colunas se
 * reordenam em turnos e fica a ordem de menos cruzamentos. Uma largada só encalha em mínimo local.
 * Espelhar as duas colunas não muda os cruzamentos, então a âncora sobe para a metade de cima.
 */
function orderColumns(
  sourceIds: readonly string[],
  targetIds: readonly string[],
  links: readonly GraphLink[],
  anchorId: string,
): ColumnOrder {
  const bySource = new Map<string, string[]>();
  const byTarget = new Map<string, string[]>();
  for (const link of links) {
    bySource.set(link.source, [...(bySource.get(link.source) ?? []), link.target]);
    byTarget.set(link.target, [...(byTarget.get(link.target) ?? []), link.source]);
  }
  let best: { readonly sources: string[]; readonly targets: string[]; readonly crossings: number } | null = null;
  for (let start = 0; start < sourceIds.length; start += 1) {
    let sources = [...sourceIds.slice(start), ...sourceIds.slice(0, start)];
    let targets = [...targetIds];
    for (let sweep = 0; sweep < SWEEPS; sweep += 1) {
      targets = sortByBarycenter(targets, positionOf(sources), byTarget);
      sources = sortByBarycenter(sources, positionOf(targets), bySource);
      const crossings = countCrossings(links, positionOf(sources), positionOf(targets));
      if (best === null || crossings < best.crossings) best = { sources, targets, crossings };
    }
  }
  const sources = (best?.sources ?? [...sourceIds]).filter((id) => bySource.has(id));
  const targets = (best?.targets ?? [...targetIds]).filter((id) => byTarget.has(id));
  const anchorColumn = sources.includes(anchorId) ? sources : targets;
  if (anchorColumn.indexOf(anchorId) <= (anchorColumn.length - 1) / 2) return { sources, targets };
  return { sources: [...sources].reverse(), targets: [...targets].reverse() };
}

interface NodeBox {
  readonly center: number;
  readonly height: number;
}

/**
 * Empilha as caixas da coluna e reparte a sobra de altura entre os vãos: as duas colunas fecham
 * juntas. O primeiro nó sem ligação ganha um vão a mais, que separa o grupo do fim da coluna.
 */
function layoutColumn(
  order: readonly string[],
  heightOf: (id: string) => number,
  isolated: ReadonlySet<string>,
): Map<string, NodeBox> {
  const heights = order.map(heightOf);
  const boxes = heights.map((nodeHeight) => Math.max(nodeHeight, LABEL_BLOCK));
  const gaps = Math.max(order.length - 1, 0);
  const firstIsolated = order.findIndex((id) => isolated.has(id));
  const breakGap = firstIsolated > 0 ? ISOLATED_GAP : 0;
  const natural = boxes.reduce((sum, box) => sum + box, 0) + gaps * BOX_GAP + breakGap;
  const free = VIEW_HEIGHT - MARGIN.top - MARGIN.bottom - natural;
  // Sobra de altura abre os vãos por igual; falta de altura os aperta, até o piso.
  const spread = gaps === 0 ? 0 : Math.max(free / gaps, MIN_BOX_GAP - BOX_GAP);
  let cursor = MARGIN.top + (gaps === 0 ? Math.max(free, 0) / 2 : 0);
  const layout = new Map<string, NodeBox>();
  order.forEach((id, index) => {
    if (index === firstIsolated) cursor += breakGap;
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

function listNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

function isUnmeasured(node: GraphNode): boolean {
  return node.unmeasuredReason !== undefined;
}

export default function IsolatedNodeBipartiteGraph({ data = defaultData, height, className }: IsolatedNodeBipartiteGraphProps) {
  const style = height === undefined ? undefined : { height };
  const allNodes = [...data.sources.nodes, ...data.targets.nodes];
  const unmeasured = allNodes.filter(isUnmeasured);
  const unmeasuredIds = new Set(unmeasured.map((node) => node.id));
  // Nó sem medição comparável não tem ligação desenhada, mesmo que o dado traga alguma: é ausência, não volume baixo.
  const links = data.links.filter((link) => !unmeasuredIds.has(link.source) && !unmeasuredIds.has(link.target));
  const strongest = links.reduce<GraphLink | null>((top, link) => (top === null || link.weight > top.weight ? link : top), null);

  if (strongest === null) {
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

  const nodes = new Map(allNodes.map((node) => [node.id, node]));
  const degree = new Map<string, number>();
  const totals = new Map<string, number>();
  for (const link of links) {
    for (const id of [link.source, link.target]) {
      degree.set(id, (degree.get(id) ?? 0) + 1);
      totals.set(id, (totals.get(id) ?? 0) + link.weight);
    }
  }
  const grandTotal = links.reduce((sum, link) => sum + link.weight, 0);
  // Zero medido: o nó foi medido o período inteiro e não tem ligação. É outra coisa que a ausência.
  const zeros = allNodes.filter((node) => !degree.has(node.id) && !isUnmeasured(node));
  const zeroIds = new Set(zeros.map((node) => node.id));

  const linked = orderColumns(
    data.sources.nodes.map((node) => node.id),
    data.targets.nodes.map((node) => node.id),
    links,
    strongest.source,
  );
  // Por último na coluna: primeiro o zero medido, depois a ausência.
  const arrange = (column: readonly GraphNode[], linkedIds: readonly string[]): string[] => [
    ...linkedIds,
    ...column.filter((node) => zeroIds.has(node.id)).map((node) => node.id),
    ...column.filter(isUnmeasured).map((node) => node.id),
  ];
  const sourceOrder = arrange(data.sources.nodes, linked.sources);
  const targetOrder = arrange(data.targets.nodes, linked.targets);
  const isolated = new Set([...zeroIds, ...unmeasuredIds]);
  const heightOf = (id: string): number => {
    if (unmeasuredIds.has(id)) return ICON_SIZE;
    if (zeroIds.has(id)) return EMPTY_NODE_HEIGHT;
    return Math.max((degree.get(id) ?? 0) * SLOT, NODE_MIN_HEIGHT);
  };
  const sourceLayout = layoutColumn(sourceOrder, heightOf, isolated);
  const targetLayout = layoutColumn(targetOrder, heightOf, isolated);
  const sourceEnds = endpointByLink(links, 'source', sourceLayout, targetLayout);
  const targetEnds = endpointByLink(links, 'target', targetLayout, sourceLayout);
  const bands = buildBands(strongest.weight);
  const sourceX = MARGIN.left;
  const targetX = VIEW_WIDTH - MARGIN.right - NODE_WIDTH;
  // TIP-3: peso 700 só no nome e no valor de UM destaque; com mais de um nó de zero, os dois baixam para 600.
  const zeroWeight = zeros.length === 1 ? 700 : 600;

  // As finas primeiro: a forte é desenhada por último, e o revestimento dela abre passagem sobre as outras.
  const drawnLinks = [...links]
    .sort((a, b) => a.weight - b.weight)
    .map((link) => {
      const key = linkKey(link);
      const from = nodes.get(link.source)?.label ?? link.source;
      const to = nodes.get(link.target)?.inSentence ?? link.target;
      return {
        key,
        d: linkPath(sourceX + NODE_WIDTH, sourceEnds.get(key) ?? 0, targetX, targetEnds.get(key) ?? 0),
        width: bands.find((band) => link.weight <= band.to)?.width ?? BANDS[0].width,
        title: `${from} com ${to}: ${formatInt(link.weight)} ${handoffNoun(link.weight)}`,
      };
    });

  const drawnNodes = [
    ...sourceOrder.map((id) => ({ id, isSource: true, box: sourceLayout.get(id) })),
    ...targetOrder.map((id) => ({ id, isSource: false, box: targetLayout.get(id) })),
  ].map(({ id, isSource, box }) => {
    const x = isSource ? sourceX : targetX;
    const total = totals.get(id) ?? 0;
    const kind = unmeasuredIds.has(id) ? ('unmeasured' as const) : zeroIds.has(id) ? ('zero' as const) : ('linked' as const);
    return {
      id,
      x,
      kind,
      center: box?.center ?? 0,
      height: box?.height ?? NODE_MIN_HEIGHT,
      label: nodes.get(id)?.label ?? id,
      // EST-2 e EST-3: a ausência escreve indisponível; o zero medido escreve 0, com o substantivo.
      value: kind === 'unmeasured' ? formatUnavailable() : `${formatInt(total)} ${handoffNoun(total)}`,
      labelX: isSource ? x - LABEL_GAP : x + NODE_WIDTH + LABEL_GAP,
      anchor: isSource ? ('end' as const) : ('start' as const),
    };
  });

  const footerParts = [data.sources, data.targets].flatMap((column) => {
    const zeroCount = column.nodes.filter((node) => zeroIds.has(node.id)).length;
    const absent = column.nodes.filter(isUnmeasured);
    const reasons = listNames([...new Set(absent.map((node) => node.unmeasuredReason ?? ''))]);
    const size = formatInt(column.nodes.length);
    return [
      ...(zeroCount === 0 ? [] : [`${formatInt(zeroCount)} de ${size} ${column.plural}, com ${formatInt(0)} repasses`]),
      ...(absent.length === 0 ? [] : [`${formatInt(absent.length)} de ${size} ${column.plural}, ${formatUnavailable()} por ${reasons}`]),
    ];
  });
  const unmeasuredReasons = listNames([...new Set(unmeasured.map((node) => node.unmeasuredReason ?? ''))]);
  const absentParts = [
    ...(zeros.length === 0 ? [] : [`${listNames(zeros.map((node) => node.inSentence))}, com ${formatInt(0)} repasses medidos`]),
    ...(unmeasured.length === 0 ? [] : [`${listNames(unmeasured.map((node) => node.inSentence))}, ${formatUnavailable()} por ${unmeasuredReasons}`]),
  ];
  const pairText = `${nodes.get(strongest.source)?.inSentence ?? strongest.source} com ${nodes.get(strongest.target)?.inSentence ?? strongest.target}`;
  const summary = `Grafo bipartido de repasses de agenda no ${data.period}, com ${formatInt(links.length)} pares e ${formatInt(grandTotal)} repasses entre ${formatInt(data.sources.nodes.length)} ${data.sources.plural} e ${formatInt(data.targets.nodes.length)} ${data.targets.plural}. ${absentParts.length === 0 ? 'Todo nó tem ao menos uma ligação.' : `Sem ligação: ${absentParts.join('; ')}.`}`;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {zeros.length === 0 ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
          Par mais forte: <span className="font-semibold text-text-primary">{pairText}</span>,{' '}
          <span className="font-semibold tabular-nums text-text-primary">{formatInt(strongest.weight)}</span> dos{' '}
          <span className="tabular-nums">{formatInt(grandTotal)}</span> repasses.
        </p>
      ) : (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
          <span className="font-semibold text-text-primary">
            {listNames(zeros.map((node, index) => (index === 0 ? node.label : node.inSentence)))}
          </span>{' '}
          {zeros.length === 1 ? 'fechou' : 'fecharam'} o período com{' '}
          <span className="font-semibold tabular-nums text-text-primary">{formatInt(0)}</span> dos{' '}
          <span className="tabular-nums">{formatInt(grandTotal)}</span> repasses medidos.
        </p>
      )}
      <div className="mb-2 flex shrink-0 items-center gap-x-4 text-[0.6875rem] leading-4 text-text-muted">
        <span>Repasses por par:</span>
        {bands.map((band) => (
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
              <path d={link.d} fill="none" stroke={LINK_STROKE} strokeWidth={link.width} />
            </g>
          ))}
          {drawnNodes.map((node) => (
            <g key={node.id}>
              {node.kind === 'linked' ? (
                <rect fill={NODE_FILL} height={node.height} rx={2} width={NODE_WIDTH} x={node.x} y={node.center - node.height / 2} />
              ) : null}
              {/* Zero medido: contorno sem preenchimento, recuado em meio traço para caber na largura do nó. */}
              {node.kind === 'zero' ? (
                <rect
                  fill="none"
                  height={node.height - EMPTY_STROKE_WIDTH}
                  rx={2}
                  stroke="var(--text-muted)"
                  strokeWidth={EMPTY_STROKE_WIDTH}
                  width={NODE_WIDTH - EMPTY_STROKE_WIDTH}
                  x={node.x + EMPTY_STROKE_WIDTH / 2}
                  y={node.center - node.height / 2 + EMPTY_STROKE_WIDTH / 2}
                />
              ) : null}
              {/* Ausência: o ícone de indisponível no lugar do nó, forma diferente do contorno do zero (EST-2). */}
              {node.kind === 'unmeasured' ? (
                <Unplug
                  aria-hidden
                  color="var(--text-muted)"
                  size={ICON_SIZE}
                  x={node.x + NODE_WIDTH / 2 - ICON_SIZE / 2}
                  y={node.center - ICON_SIZE / 2}
                />
              ) : null}
              <text textAnchor={node.anchor}>
                <tspan
                  className="font-sans"
                  fill={node.kind === 'zero' ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={12}
                  fontWeight={node.kind === 'zero' ? zeroWeight : 500}
                  x={node.labelX}
                  y={node.center + NAME_DY}
                >
                  {node.label}
                </tspan>
                <tspan
                  className="font-display"
                  fill={node.kind === 'zero' ? 'var(--text-primary)' : 'var(--text-muted)'}
                  fontSize={11}
                  fontWeight={node.kind === 'zero' ? zeroWeight : 500}
                  x={node.labelX}
                  y={node.center + VALUE_DY}
                >
                  {node.value}
                </tspan>
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] leading-4 tabular-nums text-text-muted">
        {footerParts.length === 0 ? 'Sem ligação: nenhum nó nas duas colunas.' : `Sem ligação: ${footerParts.join('; ')}.`}
      </p>
    </figure>
  );
}
