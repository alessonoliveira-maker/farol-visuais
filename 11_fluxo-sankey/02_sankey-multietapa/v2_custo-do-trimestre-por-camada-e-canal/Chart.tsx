import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { ResponsiveContainer, Sankey, type SankeyLinkProps, type SankeyNode, type SankeyNodeProps } from 'recharts';

import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CostFlowData, type CostFlowLink, type CostFlowNode } from './data';

/**
 * Sankey multietapa de demonstrativo: o custo do trimestre sai de três camadas, converge em cinco
 * canais e termina em dois desfechos de atribuição. Três coisas separam esta versão da v1, que
 * desenha um funil de contagem:
 *
 * 1. A ligação carrega a cor da CAMADA DE ORIGEM, não do destino, porque a pergunta é de que
 *    camada vem o custo de cada canal. Depois do canal as camadas estão somadas e não há como
 *    devolver a atribuição, então dali para a frente a ligação é neutra: a cor para de afirmar
 *    origem no exato ponto em que o dado para de sustentá-la.
 * 2. Cada nó de origem escreve a própria camada no rótulo (`layerLabel`), porque somar retorno de
 *    camadas diferentes é a forma mais rápida de publicar um ROI que não existe.
 * 3. O desfecho sem retorno é nó VAZADO, além de nomeado: a ausência de ganho atribuído tem forma
 *    própria e não depende da cor para ser lida (ACE-2).
 *
 * Do layout de coluna, herda da v1 a faixa de rótulo por coluna (`stageLabelBand`) com trecho reto
 * antes de qualquer curva, que é a saída da armadilha REC-18.
 */
export interface SankeyCostLayersProps {
  readonly data?: CostFlowData;
  readonly height?: number;
  readonly className?: string;
}

/** O tipo do Recharts não conhece `role` nem `layerLabel`; o nó computado carrega o payload de origem. */
type ComputedNode = SankeyNode & CostFlowNode;

const NODE_WIDTH = 12;
/** Vão vertical entre nós da mesma coluna; o rótulo de duas linhas mora nele (ver `makeRenderNode`). */
const NODE_PADDING = 44;
/** `left` e `right` não posicionam nada: o x de cada coluna vem de `buildColumnX`. */
const MARGIN = { top: 44, right: 16, bottom: 16, left: 16 } as const;
const LABEL_GAP = 8;
/** Vão entre o fim do texto do rótulo e o início da curva de Bézier (ver `stageLabelBand`). */
const LABEL_TRAILING_GAP = 16;
/** Vão só para a curva, depois que a ligação já venceu a faixa de rótulo da própria coluna. */
const CURVE_GAP = 84;
/** Estimativa de largura por caractere: nome em Manrope 12 px, valor em Space Grotesk 11 px. */
const NAME_CHAR_WIDTH = 7.2;
const VALUE_CHAR_WIDTH = 6.6;
/** Distância entre as duas linhas do rótulo (nome e valor). */
const LABEL_LINE_GAP = 14;
/** Vão entre a linha de baixo do rótulo e o topo do nó. */
const LABEL_NODE_GAP = 8;
const ITERATIONS = 32;
const OUTLINE_WIDTH = 2;
const NEUTRAL_COLOR = 'var(--text-muted)';
const SURFACE_COLOR = 'var(--surface-raised)';
/**
 * Mapa fixo de camada para slot de cor (COR-3: a cor pertence à categoria, nunca à posição no
 * array). A ordem de slot é a da COR-8, 1, 3 e 6, para nenhuma das três camadas cair no hex que
 * `--chart-2` e `--chart-4` repartem com `--warning` e `--positive`.
 */
const LAYER_COLORS: Readonly<Record<string, string>> = {
  'Camada 1': 'var(--chart-1)',
  'Camada 2': 'var(--chart-3)',
  'Camada 3': 'var(--chart-6)',
};

function layerColor(node: CostFlowNode): string {
  if (node.layerLabel === null) return NEUTRAL_COLOR;
  return LAYER_COLORS[node.layerLabel] ?? NEUTRAL_COLOR;
}

/**
 * Segunda linha do rótulo: a camada (quando o nó é origem), o valor compacto e a fatia inteira do
 * total, tudo na mesma linha. A camada fica encostada no valor de propósito: é ali que alguém somaria
 * dois retornos de camadas diferentes sem perceber.
 */
function valueLabel(node: CostFlowNode, value: number, total: number): string {
  const money = `${formatCurrencyCompact(value)} · ${formatPercent(value / total, 0)}`;
  if (node.layerLabel === null) return money;
  return `${node.layerLabel} · ${money}`;
}

/**
 * Valor de cada nó pela soma das ligações que saem dele; nó terminal (sem saída) usa a soma das que
 * chegam. Devolve o array inteiro de uma vez, em vez de uma função por nó, para a soma percorrer as
 * ligações uma única vez por render.
 */
function buildNodeValues(nodeCount: number, links: readonly CostFlowLink[]): number[] {
  const incoming = new Array<number>(nodeCount).fill(0);
  const outgoing = new Array<number>(nodeCount).fill(0);
  for (const link of links) {
    incoming[link.target] = (incoming[link.target] ?? 0) + link.value;
    outgoing[link.source] = (outgoing[link.source] ?? 0) + link.value;
  }
  return incoming.map((entered, index) => {
    const left = outgoing[index] ?? 0;
    return left > 0 ? left : entered;
  });
}

/**
 * Profundidade de cada nó, na mesma regra do `align="left"` do Recharts: a raiz fica em 0 e todo
 * alvo fica uma coluna depois da origem. Calculada aqui, antes de o Recharts desenhar, porque a
 * faixa de rótulo de cada coluna precisa existir antes de qualquer nó ser posicionado.
 */
function computeDepths(nodeCount: number, links: readonly CostFlowLink[]): number[] {
  const depths = new Array<number>(nodeCount).fill(0);
  for (let pass = 0; pass < nodeCount; pass += 1) {
    for (const link of links) {
      const candidate = (depths[link.source] ?? 0) + 1;
      if (candidate > (depths[link.target] ?? 0)) depths[link.target] = candidate;
    }
  }
  return depths;
}

/** Largura do maior rótulo de uma coluna (nome ou valor), mais os dois vãos que a cercam. */
function stageLabelBand(
  depth: number,
  depths: readonly number[],
  nodes: readonly CostFlowNode[],
  values: readonly number[],
  total: number,
): number {
  let widest = 0;
  nodes.forEach((node, index) => {
    if (depths[index] !== depth) return;
    const nameWidth = node.name.length * NAME_CHAR_WIDTH;
    const valueWidth = valueLabel(node, values[index] ?? 0, total).length * VALUE_CHAR_WIDTH;
    widest = Math.max(widest, nameWidth, valueWidth);
  });
  return LABEL_GAP + widest + LABEL_TRAILING_GAP;
}

/**
 * Borda esquerda de cada coluna, com a faixa de rótulo da coluna anterior embutida no passo. O fim
 * do trecho reto de uma ligação que sai da coluna `d` é sempre `columnX[d + 1] − CURVE_GAP`.
 */
function buildColumnX(
  depths: readonly number[],
  nodes: readonly CostFlowNode[],
  values: readonly number[],
  total: number,
): number[] {
  const maxDepth = depths.reduce((deepest, depth) => (depth > deepest ? depth : deepest), 0);
  const columnX: number[] = [MARGIN.left];
  for (let depth = 0; depth < maxDepth; depth += 1) {
    const previous = columnX[depth] ?? MARGIN.left;
    columnX.push(previous + NODE_WIDTH + stageLabelBand(depth, depths, nodes, values, total) + CURVE_GAP);
  }
  return columnX;
}

/**
 * Fábrica do nó. O desfecho sem retorno sai VAZADO (preenchido com a cor do cartão e contornado em
 * `--text-muted`), que é o segundo canal da ACE-2: a ausência de ganho atribuído se reconhece pela
 * forma, não só pelo nome. Os demais nós são sólidos, na cor da camada quando são origem e em
 * neutro quando já somam camadas diferentes.
 */
function makeRenderNode(
  columnX: readonly number[],
  total: number,
): (props: SankeyNodeProps) => ReactElement {
  return function renderNode({ y, height: nodeHeight, payload, index }: SankeyNodeProps): ReactElement {
    const node = payload as unknown as ComputedNode;
    const cx = columnX[node.depth] ?? 0;
    const hollow = node.role === 'unattributed';
    const labelX = cx + NODE_WIDTH + LABEL_GAP;
    const weight = hollow ? 700 : 500;
    // O rótulo mora no vão de padding acima do nó, nunca sobre a altura dele: por conservação, a
    // ligação que entra ou sai ocupa exatamente a altura do nó, então rótulo centralizado no nó cai
    // sempre sobre alguma faixa. É a mesma geometria da v1.
    const valueBaselineY = y - LABEL_NODE_GAP;
    const nameBaselineY = valueBaselineY - LABEL_LINE_GAP;
    return (
      <g key={`node-${String(index)}`}>
        <rect
          fill={hollow ? SURFACE_COLOR : layerColor(node)}
          height={nodeHeight}
          rx={2}
          stroke={hollow ? NEUTRAL_COLOR : undefined}
          strokeWidth={hollow ? OUTLINE_WIDTH : undefined}
          width={NODE_WIDTH}
          x={cx}
          y={y}
        />
        {/* Halo pela ROT-7: a faixa de rótulo já garante que nenhuma ligação varia de y sob este
            texto, e o halo segue obrigatório pela regra mesmo assim. */}
        <text style={{ paintOrder: 'stroke', stroke: SURFACE_COLOR, strokeWidth: 4 }} textAnchor="start">
          <tspan
            className="font-sans"
            fill={hollow ? 'var(--text-primary)' : 'var(--text-secondary)'}
            fontSize={12}
            fontWeight={weight}
            x={labelX}
            y={nameBaselineY}
          >
            {node.name}
          </tspan>
          <tspan
            className="font-display"
            fill="var(--text-muted)"
            fontSize={11}
            fontWeight={weight}
            x={labelX}
            y={valueBaselineY}
          >
            {valueLabel(node, Number(node.value), total)}
          </tspan>
        </text>
      </g>
    );
  };
}

/**
 * Contorno da faixa, como REGIÃO FECHADA e não como traço grosso, e isto é correção de desenho, não
 * gosto. Um traço de 130 px de espessura sobre uma curva de raio pequeno tem a borda externa
 * projetada para fora do ponto final, e ela invade a faixa de rótulo do nó vizinho: é o resíduo que a
 * v1 registrou como observação, medido lá em cerca de 35 px com faixa de 154 px. Com a faixa
 * desenhada como polígono (borda de cima, borda de baixo, fecha), cada borda é a própria curva
 * deslocada de meia largura, começa exatamente na borda do nó de origem e termina exatamente na do
 * destino, e não sobra nada para fora.
 */
function ribbonPath(
  columnX: readonly number[],
  sourceDepth: number,
  targetDepth: number,
  sourceY: number,
  targetY: number,
  width: number,
): string {
  const half = width / 2;
  const sourceEdgeX = (columnX[sourceDepth] ?? 0) + NODE_WIDTH;
  const targetEdgeX = columnX[targetDepth] ?? 0;
  // Trecho reto (mesmo y do nó de origem) até vencer a faixa de rótulo da própria coluna; só depois
  // dela existe curva. Nenhuma ligação varia de y dentro da faixa, então nenhum rótulo da coluna cai
  // sobre uma ligação ali (saída da armadilha REC-18).
  const stubEndX = (columnX[sourceDepth + 1] ?? targetEdgeX) - CURVE_GAP;
  const controlX = (stubEndX + targetEdgeX) / 2;
  const top = `M${String(sourceEdgeX)},${String(sourceY - half)} L${String(stubEndX)},${String(sourceY - half)} C${String(controlX)},${String(sourceY - half)} ${String(controlX)},${String(targetY - half)} ${String(targetEdgeX)},${String(targetY - half)}`;
  const bottom = `L${String(targetEdgeX)},${String(targetY + half)} C${String(controlX)},${String(targetY + half)} ${String(controlX)},${String(sourceY + half)} ${String(stubEndX)},${String(sourceY + half)} L${String(sourceEdgeX)},${String(sourceY + half)} Z`;
  return `${top} ${bottom}`;
}

/**
 * Fábrica da ligação. A cor vem da CAMADA DE ORIGEM enquanto a origem é uma camada; depois do canal
 * as camadas estão somadas e a ligação fica neutra, porque nada no dado sustenta devolver a
 * atribuição por camada dali para a frente.
 *
 * A faixa que termina no desfecho sem retorno sai VAZADA, com o mesmo miolo da cor do cartão que o
 * nó dela: é o segundo canal da ACE-2 para a segunda etapa, que de outro modo seria um bloco neutro
 * único, e de quebra dá a separação de vizinhos que a COR-5 pede entre faixas coladas da mesma cor.
 */
function makeRenderLink(columnX: readonly number[]): (props: SankeyLinkProps) => ReactElement {
  return function renderLink({ sourceY, targetY, linkWidth, payload, index }: SankeyLinkProps): ReactElement {
    const source = payload.source as unknown as ComputedNode;
    const target = payload.target as unknown as ComputedNode;
    const color = layerColor(source);
    const hollow = target.role === 'unattributed';
    const path = ribbonPath(columnX, source.depth, target.depth, sourceY, targetY, linkWidth);
    return (
      <path
        d={path}
        fill={hollow ? SURFACE_COLOR : color}
        key={`link-${String(index)}`}
        stroke={hollow ? color : 'none'}
        strokeWidth={hollow ? OUTLINE_WIDTH : undefined}
      />
    );
  };
}

export default function SankeyCostLayers({ data = defaultData, height, className }: SankeyCostLayersProps): ReactElement {
  const style = height === undefined ? undefined : { height };
  const values = buildNodeValues(data.nodes.length, data.links);

  let total = 0;
  let layerCount = 0;
  let channelCount = 0;
  let outcomeCount = 0;
  let unattributed = 0;
  data.nodes.forEach((node, index) => {
    const value = values[index] ?? 0;
    if (node.role === 'layer') {
      total += value;
      layerCount += 1;
    }
    if (node.role === 'channel') channelCount += 1;
    if (node.role === 'attributed' || node.role === 'unattributed') outcomeCount += 1;
    if (node.role === 'unattributed') unattributed += value;
  });

  if (data.nodes.length === 0 || data.links.length === 0 || total <= 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve custo com camada e canal registrados no período.</span>
      </div>
    );
  }

  const depths = computeDepths(data.nodes.length, data.links);
  const columnX = buildColumnX(depths, data.nodes, values, total);
  const renderNode = makeRenderNode(columnX, total);
  const renderLink = makeRenderLink(columnX);

  const unattributedShare = unattributed / total;
  const readingText = `${formatCurrencyCompact(unattributed)} do custo (${formatPercent(unattributedShare, 0)}) saem por canais sem nenhum ganho atribuído; uma unidade só aqui: reais do trimestre.`;
  const summary = `Sankey do custo de ${formatCurrencyCompact(total)} do trimestre, repartido de ${formatInt(layerCount)} camadas em ${formatInt(channelCount)} canais e ${formatInt(outcomeCount)} desfechos. ${readingText}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(unattributed)}</span> do custo
        (<span className="kpi-number font-medium text-text-primary">{formatPercent(unattributedShare, 0)}</span>) saem
        por canais sem nenhum ganho atribuído; uma unidade só aqui: reais do trimestre.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <Sankey
            accessibilityLayer={false}
            align="left"
            data={{ nodes: [...data.nodes], links: [...data.links] }}
            iterations={ITERATIONS}
            link={renderLink}
            margin={MARGIN}
            node={renderNode}
            nodePadding={NODE_PADDING}
            nodeWidth={NODE_WIDTH}
            sort={false}
          />
        </ResponsiveContainer>
      </div>
    </div>
  );
}
