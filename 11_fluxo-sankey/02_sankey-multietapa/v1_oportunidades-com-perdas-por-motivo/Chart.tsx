import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { ResponsiveContainer, Sankey, type SankeyLinkProps, type SankeyNode, type SankeyNodeProps } from 'recharts';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type StageFlowData, type StageFlowLink, type StageFlowNode } from './data';

/**
 * Sankey multietapa: da oportunidade Aberta ao Ganha, com a saída de cada etapa dividida entre
 * avançar, perder por motivo e ficar em andamento. `align="left"` mantém a perda logo depois da
 * etapa onde ela acontece, em vez de empurrar tudo para a última coluna.
 *
 * Layout de coluna customizado (correção de 2026-09-20, ROT-7 marca fina). Cada coluna reserva
 * uma FAIXA DE RÓTULO própria, do tamanho do maior rótulo daquela etapa (`stageLabelBand`), antes
 * de qualquer ligação poder abrir leque rumo à etapa seguinte: a ligação sai do nó por um trecho
 * reto (mesmo y do nó, sem variação) que atravessa essa faixa inteira, e só depois dela existe a
 * curva de Bézier (`makeRenderLink`). Como nenhuma ligação varia de y dentro da faixa de rótulo,
 * o texto de um nó nunca cai sobre a ligação de um vizinho da mesma coluna, que era exatamente a
 * causa das duas reprovações anteriores: o nó de caminho de cada coluna (Diagnóstico, Proposta,
 * Negociação) espalha suas ligações por toda a altura da coluna a caminho da etapa seguinte, e
 * essa faixa cruzava o rótulo dos nós de perda vizinhos, mais abaixo na mesma coluna.
 */
export interface SankeyStageLossProps {
  readonly data?: StageFlowData;
  readonly height?: number;
  readonly className?: string;
}

/** O tipo do Recharts não conhece o campo `role`; o nó computado carrega o payload de origem. */
type ComputedNode = SankeyNode & StageFlowNode;

const NODE_WIDTH = 12;
/** Vão vertical fixo entre nós da mesma coluna; o rótulo de duas linhas mora nele (ver `makeRenderNode`). */
const NODE_PADDING = 44;
/**
 * `left`/`right` não desenham mais nada: o layout de coluna é todo customizado (`buildColumnX`) e
 * ignora o x que o Recharts computaria a partir da margem. Só `top` e `bottom` seguem em uso, para
 * a escala de valor para altura e para o vão acima do primeiro nó de cada coluna, onde mora o
 * rótulo dele (`NODE_PADDING` reserva o mesmo vão entre os demais nós).
 */
const MARGIN = { top: 44, right: 16, bottom: 16, left: 16 } as const;
const LABEL_GAP = 8;
/** Vão entre o fim do texto do rótulo e o início da curva de Bézier (ver `stageLabelBand`). */
const LABEL_TRAILING_GAP = 16;
/** Vão só para a curva, depois que a ligação já venceu a faixa de rótulo da própria coluna. */
const CURVE_GAP = 84;
/** Estimativa de largura por caractere, com folga proposital: nome em Manrope 12 px, contagem em Space Grotesk 11 px. */
const NAME_CHAR_WIDTH = 7.2;
const COUNT_CHAR_WIDTH = 6.6;
/** Distância entre as duas linhas do rótulo (nome e contagem). */
const LABEL_LINE_GAP = 14;
/** Vão entre a linha de baixo do rótulo (a contagem) e o topo do nó. */
const LABEL_NODE_GAP = 8;
const ITERATIONS = 32;
const PATH_COLOR = 'var(--chart-1)';
const NEUTRAL_COLOR = 'var(--text-muted)';

function countLabel(value: number): string {
  return `${formatInt(value)} oportunidades`;
}

/** Valor do nó pela soma das ligações que saem dele; nó terminal (sem saída) usa a soma das que chegam. */
function nodeValue(index: number, links: readonly StageFlowLink[]): number {
  let incoming = 0;
  let outgoing = 0;
  for (const link of links) {
    if (link.target === index) incoming += link.value;
    if (link.source === index) outgoing += link.value;
  }
  return outgoing > 0 ? outgoing : incoming;
}

/**
 * Profundidade de cada nó, na mesma regra do `align="left"` do Recharts: a raiz fica em 0, e todo
 * alvo fica uma coluna depois da origem. Calculada à parte, antes do Recharts desenhar, porque a
 * faixa de rótulo de cada coluna precisa existir antes de qualquer nó ser posicionado.
 */
function computeDepths(nodeCount: number, links: readonly StageFlowLink[]): number[] {
  const depths = new Array<number>(nodeCount).fill(0);
  for (let pass = 0; pass < nodeCount; pass += 1) {
    for (const link of links) {
      const candidate = (depths[link.source] ?? 0) + 1;
      if (candidate > (depths[link.target] ?? 0)) depths[link.target] = candidate;
    }
  }
  return depths;
}

/** Largura do maior rótulo (nome ou contagem) entre os nós de uma coluna, mais os dois vãos que a cercam. */
function stageLabelBand(depth: number, depths: readonly number[], data: StageFlowData): number {
  let maxWidth = 0;
  data.nodes.forEach((node, index) => {
    if (depths[index] !== depth) return;
    const nameWidth = node.name.length * NAME_CHAR_WIDTH;
    const countWidth = countLabel(nodeValue(index, data.links)).length * COUNT_CHAR_WIDTH;
    maxWidth = Math.max(maxWidth, nameWidth, countWidth);
  });
  return LABEL_GAP + maxWidth + LABEL_TRAILING_GAP;
}

/**
 * Borda esquerda de cada coluna, com a faixa de rótulo da coluna anterior já embutida no passo:
 * `columnX[d + 1] = columnX[d] + NODE_WIDTH + stageLabelBand(d) + CURVE_GAP`. O fim do trecho reto
 * de uma ligação que sai da coluna `d` é sempre `columnX[d + 1] - CURVE_GAP` (ver `makeRenderLink`).
 */
function buildColumnX(depths: readonly number[], data: StageFlowData): number[] {
  const maxDepth = depths.length === 0 ? 0 : Math.max(...depths);
  const columnX: number[] = [MARGIN.left];
  for (let depth = 0; depth < maxDepth; depth += 1) {
    const previous = columnX[depth] ?? MARGIN.left;
    columnX.push(previous + NODE_WIDTH + stageLabelBand(depth, depths, data) + CURVE_GAP);
  }
  return columnX;
}

/** Fábrica: o desenho do nó depende da coluna customizada (`columnX`), calculada por versão do dado. */
function makeRenderNode(columnX: readonly number[]): (props: SankeyNodeProps) => ReactElement {
  return function renderNode({ y, height: nodeHeight, payload, index }: SankeyNodeProps): ReactElement {
    const node = payload as unknown as ComputedNode;
    const cx = columnX[node.depth] ?? 0;
    const isGanha = node.name === 'Ganha';
    const fill = node.role === 'path' ? PATH_COLOR : NEUTRAL_COLOR;
    const labelX = cx + NODE_WIDTH + LABEL_GAP;
    const weight = isGanha ? 700 : 500;
    // O rótulo mora no vão de padding acima do nó, nunca sobre a altura dele: é ali, colado no
    // próprio nó, que a ligação que sai ou entra ocupa a coluna de ponta a ponta (a largura da
    // faixa é sempre igual à altura do nó, por conservação). Um rótulo centralizado na altura do
    // nó cai sobre essa faixa; um rótulo no vão de cima não, porque o vão não carrega ligação
    // nenhuma nesse ponto. Vale para todo nó, inclusive o primeiro de cada coluna, que sempre é o
    // de caminho (`sort={false}`): para ele, o vão acima é a margem superior (`MARGIN.top`).
    const countBaselineY = y - LABEL_NODE_GAP;
    const nameBaselineY = countBaselineY - LABEL_LINE_GAP;
    return (
      <g key={`node-${String(index)}`}>
        <rect fill={fill} height={nodeHeight} rx={2} width={NODE_WIDTH} x={cx} y={y} />
        {/* Halo pela ROT-7: a faixa de rótulo (`stageLabelBand`) já garante que nenhuma ligação
            varia de y sob este texto, mas o halo segue obrigatório pela regra mesmo assim. */}
        <text style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }} textAnchor="start">
          <tspan
            className="font-sans"
            fill={isGanha ? 'var(--text-primary)' : 'var(--text-secondary)'}
            fontSize={12}
            fontWeight={weight}
            x={labelX}
            y={nameBaselineY}
          >
            {node.name}
          </tspan>
          <tspan className="font-display" fill="var(--text-muted)" fontSize={11} fontWeight={weight} x={labelX} y={countBaselineY}>
            {countLabel(Number(node.value))}
          </tspan>
        </text>
      </g>
    );
  };
}

/** Fábrica: a ligação também depende de `columnX`, e do fim do trecho reto de cada coluna. */
function makeRenderLink(columnX: readonly number[]): (props: SankeyLinkProps) => ReactElement {
  return function renderLink({ sourceY, targetY, linkWidth, payload, index }: SankeyLinkProps): ReactElement {
    const source = payload.source as unknown as ComputedNode;
    const target = payload.target as unknown as ComputedNode;
    const stroke = target.role === 'path' ? PATH_COLOR : NEUTRAL_COLOR;
    const sourceEdgeX = (columnX[source.depth] ?? 0) + NODE_WIDTH;
    const targetEdgeX = columnX[target.depth] ?? 0;
    // A ligação sai reta (mesmo y do nó de origem) até vencer a faixa de rótulo da própria
    // coluna: `columnX[depth + 1] - CURVE_GAP` é exatamente onde essa faixa termina (ver
    // `buildColumnX`). Só depois desse ponto a curva de Bézier existe. Por construção, nenhuma
    // ligação varia de y enquanto atravessa a faixa de rótulo, então nenhum rótulo da coluna,
    // nem o da própria origem nem o de um vizinho mais abaixo, pode cair sobre uma ligação ali.
    const stubEndX = (columnX[source.depth + 1] ?? targetEdgeX) - CURVE_GAP;
    const controlX = (stubEndX + targetEdgeX) / 2;
    const half = linkWidth / 2;
    const top = `M${String(sourceEdgeX)},${String(sourceY - half)} L${String(stubEndX)},${String(sourceY - half)} C${String(controlX)},${String(sourceY - half)} ${String(controlX)},${String(targetY - half)} ${String(targetEdgeX)},${String(targetY - half)}`;
    const bottom = `L${String(targetEdgeX)},${String(targetY + half)} C${String(controlX)},${String(targetY + half)} ${String(controlX)},${String(sourceY + half)} ${String(stubEndX)},${String(sourceY + half)} L${String(sourceEdgeX)},${String(sourceY + half)} Z`;
    // Região fechada, não traço grosso: a borda externa de um traço largo transborda o nó de destino.
    return <path d={`${top} ${bottom}`} fill={stroke} key={`link-${String(index)}`} stroke="none" />;
  };
}

export default function SankeyStageLoss({ data = defaultData, height, className }: SankeyStageLossProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  if (data.nodes.length === 0 || data.links.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve oportunidade com etapa e desfecho registrados no período.</span>
      </div>
    );
  }

  const depths = computeDepths(data.nodes.length, data.links);
  const columnX = buildColumnX(depths, data);
  const renderNode = makeRenderNode(columnX);
  const renderLink = makeRenderLink(columnX);

  const incomingTargets = new Set(data.links.map((link) => link.target));
  const outgoingSources = new Set(data.links.map((link) => link.source));
  const rootIndex = data.nodes.findIndex((node, index) => node.role === 'path' && !incomingTargets.has(index));
  const finalIndex = data.nodes.findIndex((node, index) => node.role === 'path' && !outgoingSources.has(index));

  const totalEntries = data.links.filter((link) => link.source === rootIndex).reduce((sum, link) => sum + link.value, 0);
  const totalWon = data.links.filter((link) => link.target === finalIndex).reduce((sum, link) => sum + link.value, 0);

  const lossTotals = new Map<string, number>();
  for (const link of data.links) {
    const targetNode = data.nodes[link.target];
    if (targetNode !== undefined && targetNode.role === 'loss') {
      lossTotals.set(targetNode.name, (lossTotals.get(targetNode.name) ?? 0) + link.value);
    }
  }
  let topLoss: { readonly name: string; readonly value: number } | undefined;
  for (const [name, value] of lossTotals) {
    if (topLoss === undefined || value > topLoss.value) topLoss = { name, value };
  }

  const winShare = totalEntries === 0 ? 0 : totalWon / totalEntries;
  const topLossLabel = topLoss === undefined ? '' : topLoss.name.replace('Perdida: ', '');
  const topLossValue = topLoss?.value ?? 0;

  const readingText =
    topLoss === undefined
      ? ''
      : `${formatInt(totalWon)} de ${formatInt(totalEntries)} oportunidades (${formatPercent(winShare, 0)}) chegam a Ganha; ${topLossLabel} lidera as perdas, com ${formatInt(topLossValue)} saídas no trimestre.`;

  const summary = `Sankey multietapa com ${formatInt(totalEntries)} oportunidades comerciais do trimestre por etapa, com perdas por motivo e oportunidades em andamento saindo de cada uma. ${readingText}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {topLoss === undefined ? null : (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          <span className="kpi-number font-medium text-text-primary">{formatInt(totalWon)}</span> de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(totalEntries)}</span> oportunidades (
          <span className="kpi-number font-medium text-text-primary">{formatPercent(winShare, 0)}</span>) chegam a Ganha;{' '}
          <span className="font-semibold text-text-primary">{topLossLabel}</span> lidera as perdas, com{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(topLossValue)}</span> saídas.
        </p>
      )}
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
