import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PortfolioGraph, type Product } from './data';

/**
 * Grafo bipartido de carteira: contas à esquerda, produtos à direita e uma ligação por produto que
 * a conta tem, na cor do produto. A altura de cada nó é o número de ligações dele, e as pontas se
 * repartem ao longo dessa altura. Responde quais produtos cada conta tem e quais andam juntos.
 */
export interface PortfolioBipartiteGraphProps {
  readonly data?: PortfolioGraph;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox repete o corpo medido do cartão, para a escala sair 1 e os 11 px valerem na tela (GEO-18). */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 372;
const HEADER_BASELINE = 10;
/** A margem de cima guarda o cabeçalho das colunas; as laterais, o código da conta e o nome do produto. */
const MARGIN = { top: 22, right: 140, bottom: 2, left: 36 } as const;
const NODE_WIDTH = 8;
/** Altura do nó por ligação e passo entre as pontas: a ligação de 2 px mais 2 px de vão. */
const SLOT = 4;
const LINK_WIDTH = 2;
/** Revestimento na cor do cartão por baixo de cada ligação, meio pixel de cada lado (TOK-4): com 1 px a ligação de 2 px parecia tracejada. */
const CASING = 1;
const ACCOUNT_GAP = 2;
const PRODUCT_GAP = 4;
/** Altura de tinta do rótulo de duas linhas do produto; a caixa do nó de produto nunca é menor que ela. */
const LABEL_BLOCK = 24;
const LABEL_GAP = 8;
/** A conta ganha nome escrito a partir deste número de produtos; abaixo dele o nome fica na dica. */
const LABEL_MIN_DEGREE = 3;
/** Linhas de base medidas a partir do centro do nó: código da conta, nome do produto e contagem. */
const CODE_DY = 3.5;
const NAME_DY = -3;
const VALUE_DY = 11;
const SWEEPS = 8;
const NODE_FILL = 'var(--text-secondary)';
/** O agrupado "Outros" não tem slot: fica em neutro com 3:1 medido, 5,21:1 e 5,37:1 (ACE-6). */
const NEUTRAL = 'var(--text-muted)';
const SURFACE = 'var(--surface-raised)';

interface Link {
  readonly source: string;
  readonly target: string;
}

function positionOf(order: readonly string[]): Map<string, number> {
  return new Map(order.map((id, index) => [id, index]));
}

function linkKey(link: Link): string {
  return `${link.source}>${link.target}`;
}

/** COR-3: a cor é do produto, lida do slot do dado, nunca da posição na coluna. */
function productColor(product: Product | undefined): string {
  return product?.slot === undefined ? NEUTRAL : (CHART_SERIES_COLORS[product.slot - 1] ?? NEUTRAL);
}

function countNoun(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

function listNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
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

function countCrossings(links: readonly Link[], sources: ReadonlyMap<string, number>, targets: ReadonlyMap<string, number>): number {
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
 * Baricentro com várias largadas: cada conta abre a coluna uma vez, as duas colunas se reordenam em
 * turnos e fica a ordem de menos cruzamentos. Uma largada só encalha em mínimo local. Espelhar as
 * duas colunas não muda os cruzamentos, então a âncora sobe para a metade de cima.
 */
function orderColumns(
  sourceIds: readonly string[],
  targetIds: readonly string[],
  links: readonly Link[],
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
  const sources = best?.sources ?? [...sourceIds];
  const targets = best?.targets ?? [...targetIds];
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

/**
 * Empilha as caixas da coluna e reparte a sobra de altura entre os vãos: as duas colunas fecham
 * juntas. A altura do nó é o número de ligações vezes o passo; `minBox` guarda o rótulo de duas linhas.
 */
function layoutColumn(
  order: readonly string[],
  degree: ReadonlyMap<string, number>,
  minBox: number,
  gap: number,
): Map<string, NodeBox> {
  const heights = order.map((id) => Math.max(degree.get(id) ?? 0, 1) * SLOT);
  const boxes = heights.map((nodeHeight) => Math.max(nodeHeight, minBox));
  const gaps = Math.max(order.length - 1, 0);
  const natural = boxes.reduce((sum, box) => sum + box, 0) + gaps * gap;
  const free = Math.max(VIEW_HEIGHT - MARGIN.top - MARGIN.bottom - natural, 0);
  const spread = gaps === 0 ? 0 : free / gaps;
  let cursor = MARGIN.top + (gaps === 0 ? free / 2 : 0);
  const layout = new Map<string, NodeBox>();
  order.forEach((id, index) => {
    const box = boxes[index] ?? minBox;
    layout.set(id, { center: cursor + box / 2, height: heights[index] ?? SLOT });
    cursor += box + gap + spread;
  });
  return layout;
}

/** Ponta de cada ligação dentro do nó: as ligações do nó se ordenam pelo centro do vizinho e ganham um passo cada. */
function endpointByLink(
  links: readonly Link[],
  own: 'source' | 'target',
  ownLayout: ReadonlyMap<string, NodeBox>,
  otherLayout: ReadonlyMap<string, NodeBox>,
): Map<string, number> {
  const other = own === 'source' ? 'target' : 'source';
  const grouped = new Map<string, Link[]>();
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

interface ProductPair {
  readonly first: string;
  readonly second: string;
  readonly count: number;
}

/** O par de produtos presente em mais contas. O agrupado fica fora, porque não é um produto. Sem par, null. */
function mostFrequentPair(graph: PortfolioGraph): ProductPair | null {
  const named = graph.products.filter((product) => product.slot !== undefined).map((product) => product.id);
  const counts = new Map<string, ProductPair>();
  for (const account of graph.accounts) {
    const owned = named.filter((id) => account.products.includes(id));
    owned.forEach((first, index) => {
      for (const second of owned.slice(index + 1)) {
        const key = `${first}+${second}`;
        counts.set(key, { first, second, count: (counts.get(key)?.count ?? 0) + 1 });
      }
    });
  }
  let best: ProductPair | null = null;
  for (const pair of counts.values()) {
    if (best === null || pair.count > best.count) best = pair;
  }
  return best;
}

interface PortfolioModel {
  readonly links: readonly Link[];
  readonly degree: ReadonlyMap<string, number>;
  readonly order: ColumnOrder;
  readonly accountLayout: ReadonlyMap<string, NodeBox>;
  readonly productLayout: ReadonlyMap<string, NodeBox>;
  readonly accountEnds: ReadonlyMap<string, number>;
  readonly productEnds: ReadonlyMap<string, number>;
  readonly topProduct: Product | null;
}

/** Ordem, posições e pontas, calculadas uma vez por dado. Sem nenhuma ligação, null. */
function buildModel(graph: PortfolioGraph): PortfolioModel | null {
  const known = new Set(graph.products.map((product) => product.id));
  const links = graph.accounts.flatMap((account) =>
    account.products.filter((id) => known.has(id)).map((id) => ({ source: account.id, target: id })),
  );
  if (links.length === 0) return null;
  const degree = new Map<string, number>();
  for (const link of links) {
    for (const id of [link.source, link.target]) degree.set(id, (degree.get(id) ?? 0) + 1);
  }
  const topProduct = graph.products.reduce<Product | null>(
    (top, product) => (top === null || (degree.get(product.id) ?? 0) > (degree.get(top.id) ?? 0) ? product : top),
    null,
  );
  const order = orderColumns(
    graph.accounts.map((account) => account.id),
    graph.products.map((product) => product.id),
    links,
    topProduct?.id ?? '',
  );
  const accountLayout = layoutColumn(order.sources, degree, SLOT, ACCOUNT_GAP);
  const productLayout = layoutColumn(order.targets, degree, LABEL_BLOCK, PRODUCT_GAP);
  return {
    links,
    degree,
    order,
    accountLayout,
    productLayout,
    topProduct,
    accountEnds: endpointByLink(links, 'source', accountLayout, productLayout),
    productEnds: endpointByLink(links, 'target', productLayout, accountLayout),
  };
}

export default function PortfolioBipartiteGraph({ data = defaultData, height, className }: PortfolioBipartiteGraphProps) {
  // 24 largadas de baricentro sobre 58 ligações: a conta roda uma vez por dado, não a cada render.
  const model = useMemo(() => buildModel(data), [data]);
  const style = height === undefined ? undefined : { height };

  if (model === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma carteira neste recorte: nenhuma conta do corte tem produto ativo para ligar.</span>
      </div>
    );
  }

  const products = new Map(data.products.map((product) => [product.id, product]));
  const accounts = new Map(data.accounts.map((account) => [account.id, account]));
  const accountCount = data.accounts.length;
  const accountX = MARGIN.left;
  const productX = VIEW_WIDTH - MARGIN.right - NODE_WIDTH;
  const degreeOf = (id: string): number => model.degree.get(id) ?? 0;

  // O produto mais presente primeiro: os menores são desenhados por último e ficam por cima no cruzamento.
  const drawnLinks = [...model.links]
    .sort((a, b) => degreeOf(b.target) - degreeOf(a.target))
    .map((link) => {
      const key = linkKey(link);
      return {
        key,
        d: linkPath(accountX + NODE_WIDTH, model.accountEnds.get(key) ?? 0, productX, model.productEnds.get(key) ?? 0),
        color: productColor(products.get(link.target)),
      };
    });

  const drawnAccounts = model.order.sources.map((id) => {
    const account = accounts.get(id);
    const box = model.accountLayout.get(id);
    const owned = data.products.filter((product) => account?.products.includes(product.id) ?? false);
    const label = account?.label ?? id;
    return {
      id,
      label,
      center: box?.center ?? 0,
      height: box?.height ?? SLOT,
      isLabeled: degreeOf(id) >= LABEL_MIN_DEGREE,
      // A dica acrescenta o que o corpo não escreve: a receita do corte e a lista de produtos da conta.
      title: `${label}, receita anual de ${formatCurrencyCompact(account?.revenue ?? 0)}: ${formatInt(owned.length)} ${countNoun(owned.length, 'produto', 'produtos')} (${listNames(owned.map((product) => product.inSentence))})`,
    };
  });

  const drawnProducts = model.order.targets.map((id) => {
    const product = products.get(id);
    const box = model.productLayout.get(id);
    const count = degreeOf(id);
    const label = product?.label ?? id;
    return {
      id,
      label,
      count,
      center: box?.center ?? 0,
      height: box?.height ?? SLOT,
      color: productColor(product),
      title: `${label}: ${formatInt(count)} de ${formatInt(accountCount)} contas`,
    };
  });

  const pair = mostFrequentPair(data);
  const pairNames = pair === null ? '' : `${products.get(pair.first)?.inSentence ?? pair.first} com ${products.get(pair.second)?.inSentence ?? pair.second}`;
  const topName = model.topProduct?.inSentence ?? '';
  const topCount = degreeOf(model.topProduct?.id ?? '');
  const summary = `Grafo bipartido de carteira com ${formatInt(accountCount)} contas, ${formatInt(data.products.length)} nós de produto e ${formatInt(model.links.length)} ligações. ${
    pair === null
      ? `O produto mais presente é ${topName}, em ${formatInt(topCount)} das ${formatInt(accountCount)} contas.`
      : `O par de produtos mais frequente é ${pairNames}, em ${formatInt(pair.count)} das ${formatInt(accountCount)} contas.`
  }${data.omittedAccounts > 0 ? ` Outras ${formatInt(data.omittedAccounts)} contas ficaram fora pelo corte de receita.` : ''}`;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {pair === null ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
          Produto mais presente: <span className="font-semibold text-text-primary">{topName}</span>, em{' '}
          <span className="font-semibold tabular-nums text-text-primary">{formatInt(topCount)}</span> das{' '}
          <span className="tabular-nums">{formatInt(accountCount)}</span> contas.
        </p>
      ) : (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
          Par mais frequente: <span className="font-semibold text-text-primary">{pairNames}</span>, em{' '}
          <span className="font-semibold tabular-nums text-text-primary">{formatInt(pair.count)}</span> das{' '}
          <span className="tabular-nums">{formatInt(accountCount)}</span> contas.
        </p>
      )}
      <div className="min-h-0 flex-1">
        {/* xMidYMin: sobrando altura no cartão, o grafo fica colado ao que vem acima em vez de centrado, e a escala segue 1. */}
        <svg
          aria-hidden
          className="h-full w-full"
          preserveAspectRatio="xMidYMin meet"
          viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}
        >
          <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={0} y={HEADER_BASELINE}>
            Contas, com nome escrito a partir de <tspan className="font-display">{formatInt(LABEL_MIN_DEGREE)}</tspan> produtos (as
            demais, na dica)
          </text>
          <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={productX + NODE_WIDTH + LABEL_GAP} y={HEADER_BASELINE}>
            Produtos
          </text>
          {drawnLinks.map((link) => (
            <g key={link.key}>
              <path d={link.d} fill="none" stroke={SURFACE} strokeWidth={LINK_WIDTH + CASING} />
              <path d={link.d} fill="none" stroke={link.color} strokeWidth={LINK_WIDTH} />
            </g>
          ))}
          {drawnAccounts.map((account) => (
            <g key={account.id}>
              <title>{account.title}</title>
              {/* Área da dica sem pintura: fill none não desenha nada, e pointerEvents all ainda recebe o mouse. */}
              <rect
                fill="none"
                height={account.height + ACCOUNT_GAP}
                pointerEvents="all"
                width={accountX + NODE_WIDTH}
                x={0}
                y={account.center - (account.height + ACCOUNT_GAP) / 2}
              />
              <rect fill={NODE_FILL} height={account.height} rx={1} width={NODE_WIDTH} x={accountX} y={account.center - account.height / 2} />
              {account.isLabeled ? (
                <text
                  className="font-display"
                  fill="var(--text-secondary)"
                  fontSize={11}
                  fontWeight={500}
                  textAnchor="end"
                  x={accountX - LABEL_GAP}
                  y={account.center + CODE_DY}
                >
                  {account.label}
                </text>
              ) : null}
            </g>
          ))}
          {drawnProducts.map((product) => (
            <g key={product.id}>
              <title>{product.title}</title>
              <rect fill={product.color} height={product.height} rx={2} width={NODE_WIDTH} x={productX} y={product.center - product.height / 2} />
              <text>
                <tspan className="font-sans" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={productX + NODE_WIDTH + LABEL_GAP} y={product.center + NAME_DY}>
                  {product.label}
                </tspan>
                <tspan className="font-display" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={productX + NODE_WIDTH + LABEL_GAP} y={product.center + VALUE_DY}>
                  {`${formatInt(product.count)} ${countNoun(product.count, 'conta', 'contas')}`}
                </tspan>
              </text>
            </g>
          ))}
        </svg>
      </div>
      {data.omittedAccounts > 0 ? (
        <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] leading-4 tabular-nums text-text-muted">
          {`Mais ${formatInt(data.omittedAccounts)} contas ficaram fora pelo corte de receita: o grafo traz as ${formatInt(accountCount)} de maior receita.`}
        </p>
      ) : null}
    </figure>
  );
}
