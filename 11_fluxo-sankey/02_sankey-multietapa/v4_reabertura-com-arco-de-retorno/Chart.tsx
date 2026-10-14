import { Filter, RotateCcw, Undo2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { ResponsiveContainer, Sankey, type SankeyLinkProps, type SankeyNode, type SankeyNodeProps } from 'recharts';

import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ReopenData, type ReopenLink, type ReopenNode } from './data';

/**
 * Sankey multietapa com as duas ligações que o layout acíclico não aceita: a que VOLTA uma etapa e a
 * que fecha laço na PRÓPRIA etapa. O dado traz as três espécies juntas e o componente as separa por
 * BUSCA EM PROFUNDIDADE, antes de qualquer desenho:
 *
 * 1. `classifyLinks` percorre o grafo a partir de cada raiz e marca como retorno toda ligação cujo
 *    alvo está na pilha da busca, isto é, que fecha ciclo; `source` igual a `target` é laço.
 * 2. Só as ligações PARA A FRENTE vão ao Recharts, então a profundidade, a escala e o layout são de
 *    um grafo acíclico, e nada do Recharts precisa saber que existe ciclo.
 * 3. O retorno é desenhado à mão, como ARCO acima das colunas, com a MESMA largura que o Recharts
 *    daria à faixa (valor vezes a escala do diagrama), para o arco não mentir sobre o volume.
 * 4. O laço na própria etapa NÃO ganha arco: um arco que sai e volta no mesmo nó não codifica nada,
 *    porque não atravessa distância nenhuma. Ele vira CONTADOR escrito no rótulo do nó.
 *
 * COMO O ARCO SABE ONDE PASSAR: ele precisa da borda de cima dos dois nós que liga, e essas só
 * existem depois de o Recharts posicionar os nós. O Recharts desenha as ligações ANTES dos nós
 * (`AllSankeyLinkElements` e depois `AllNodeElements`, em `Sankey.js`), e os nós na ordem do array,
 * então o renderizador de nó registra a caixa de cada um num mapa por índice e o ÚLTIMO nó desenha o
 * arco, quando todas as caixas já são conhecidas. O mapa é por índice, e não lista, para que uma
 * reexecução do passo de desenho apenas se sobrescreva em vez de duplicar.
 *
 * Do layout de coluna, herda da v1 a faixa de rótulo por coluna (`stageLabelBand`) com trecho reto
 * antes de qualquer curva, que é a saída da armadilha REC-18.
 */
export interface SankeyReopenArcProps {
  readonly data?: ReopenData;
  readonly height?: number;
  readonly className?: string;
}

/** O tipo do Recharts não conhece `role`; o nó computado carrega o payload de origem. */
type ComputedNode = SankeyNode & ReopenNode;

type LinkKind = 'forward' | 'return' | 'self';

interface NodeBox {
  readonly y: number;
  readonly height: number;
}

interface ReturnArc {
  readonly source: number;
  readonly target: number;
  readonly value: number;
}

const NODE_WIDTH = 12;
/**
 * Vão vertical entre nós da mesma coluna: 58 px porque o rótulo pode ter TRÊS linhas, nome, contagem
 * e o contador de laço, e não duas como na v1. O mesmo valor reserva o rótulo do primeiro nó de cada
 * coluna dentro de `MARGIN.top`.
 */
const NODE_PADDING = 58;
/**
 * Altura reservada para o arco de retorno, ACIMA das colunas, somada em `MARGIN.top` antes do espaço
 * de rótulo. Passar o arco por baixo seria o instinto, e foi a primeira montagem desta peça: mas os
 * dois nós que ele liga são o de CAMINHO de cada coluna, isto é o nó de CIMA, e por baixo o arco teria
 * de subir atravessando os nós de perda e os rótulos deles. Por cima ele sobe e desce em espaço vazio,
 * à esquerda do rótulo, que começa depois do nó.
 */
const ARC_LANE = 56;
const MARGIN = { top: ARC_LANE + NODE_PADDING, right: 16, bottom: 16, left: 16 } as const;
const LABEL_GAP = 8;
const LABEL_TRAILING_GAP = 16;
const CURVE_GAP = 84;
/** Estimativa de largura por caractere: nome em Manrope 12 px, contagem em Space Grotesk 11 px. */
const NAME_CHAR_WIDTH = 7.2;
const COUNT_CHAR_WIDTH = 6.6;
const LABEL_LINE_GAP = 14;
const LABEL_NODE_GAP = 8;
/** Vão entre a borda de cima do plano e o eixo do arco de retorno. */
const ARC_GAP = 14;
/** Folga de cada lado da base da ponta, para ela ficar mais larga que a faixa, e a altura dela. */
const ARROW_PAD = 4;
const ARROW_RISE = 10;
const ITERATIONS = 32;
const PATH_COLOR = 'var(--chart-1)';
const RETURN_COLOR = 'var(--chart-3)';
const NEUTRAL_COLOR = 'var(--text-muted)';
const SURFACE_COLOR = 'var(--surface-raised)';

function countLabel(value: number): string {
  return `${formatInt(value)} oportunidades`;
}

function redoneLabel(value: number): string {
  return `${formatInt(value)} refeitas na etapa`;
}

/**
 * Separa as ligações por espécie, por busca em profundidade a partir de cada raiz. Marca retorno a
 * ligação cujo alvo está NA PILHA da busca, que é a definição de aresta que fecha ciclo; laço é
 * `source` igual a `target`. A varredura começa no nó de índice 0 e segue a ordem do array, então a
 * classificação é determinística: num par de ligações que se enfrentam, quem é retorno é sempre a
 * que a busca encontra por último.
 */
function classifyLinks(nodeCount: number, links: readonly ReopenLink[]): LinkKind[] {
  const UNSEEN = 0;
  const ON_STACK = 1;
  const DONE = 2;
  const kinds: LinkKind[] = links.map((link) => (link.source === link.target ? 'self' : 'forward'));
  const outgoing: number[][] = [];
  for (let node = 0; node < nodeCount; node += 1) outgoing.push([]);
  links.forEach((link, index) => {
    if (link.source !== link.target) outgoing[link.source]?.push(index);
  });
  const state = new Array<number>(nodeCount).fill(UNSEEN);
  const visit = (node: number): void => {
    state[node] = ON_STACK;
    for (const index of outgoing[node] ?? []) {
      const link = links[index];
      if (link === undefined) continue;
      if (state[link.target] === ON_STACK) {
        kinds[index] = 'return';
        continue;
      }
      if (state[link.target] === UNSEEN) visit(link.target);
    }
    state[node] = DONE;
  };
  for (let node = 0; node < nodeCount; node += 1) {
    if (state[node] === UNSEEN) visit(node);
  }
  return kinds;
}

/** Valor de cada nó pelas ligações que saem; nó terminal usa as que chegam. Só ligações para a frente. */
function buildNodeValues(nodeCount: number, links: readonly ReopenLink[]): number[] {
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

/** Profundidade de cada nó, na regra do `align="left"`; só faz sentido sobre o grafo acíclico. */
function computeDepths(nodeCount: number, links: readonly ReopenLink[]): number[] {
  const depths = new Array<number>(nodeCount).fill(0);
  for (let pass = 0; pass < nodeCount; pass += 1) {
    for (const link of links) {
      const candidate = (depths[link.source] ?? 0) + 1;
      if (candidate > (depths[link.target] ?? 0)) depths[link.target] = candidate;
    }
  }
  return depths;
}

/** Largura do maior rótulo de uma coluna, contando a terceira linha do contador de laço. */
function stageLabelBand(
  depth: number,
  depths: readonly number[],
  nodes: readonly ReopenNode[],
  values: readonly number[],
  loops: ReadonlyMap<number, number>,
): number {
  let widest = 0;
  nodes.forEach((node, index) => {
    if (depths[index] !== depth) return;
    const nameWidth = node.name.length * NAME_CHAR_WIDTH;
    const countWidth = countLabel(values[index] ?? 0).length * COUNT_CHAR_WIDTH;
    widest = Math.max(widest, nameWidth, countWidth);
    const loop = loops.get(index);
    if (loop !== undefined) widest = Math.max(widest, redoneLabel(loop).length * COUNT_CHAR_WIDTH);
  });
  return LABEL_GAP + widest + LABEL_TRAILING_GAP;
}

/** Borda esquerda de cada coluna, com a faixa de rótulo da coluna anterior embutida no passo. */
function buildColumnX(
  depths: readonly number[],
  nodes: readonly ReopenNode[],
  values: readonly number[],
  loops: ReadonlyMap<number, number>,
): number[] {
  const maxDepth = depths.reduce((deepest, depth) => (depth > deepest ? depth : deepest), 0);
  const columnX: number[] = [MARGIN.left];
  for (let depth = 0; depth < maxDepth; depth += 1) {
    const previous = columnX[depth] ?? MARGIN.left;
    columnX.push(previous + NODE_WIDTH + stageLabelBand(depth, depths, nodes, values, loops) + CURVE_GAP);
  }
  return columnX;
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
  // dela existe curva, que é a saída da armadilha REC-18.
  const stubEndX = (columnX[sourceDepth + 1] ?? targetEdgeX) - CURVE_GAP;
  const controlX = (stubEndX + targetEdgeX) / 2;
  const top = `M${String(sourceEdgeX)},${String(sourceY - half)} L${String(stubEndX)},${String(sourceY - half)} C${String(controlX)},${String(sourceY - half)} ${String(controlX)},${String(targetY - half)} ${String(targetEdgeX)},${String(targetY - half)}`;
  const bottom = `L${String(targetEdgeX)},${String(targetY + half)} C${String(controlX)},${String(targetY + half)} ${String(controlX)},${String(sourceY + half)} ${String(stubEndX)},${String(sourceY + half)} L${String(sourceEdgeX)},${String(sourceY + half)} Z`;
  return `${top} ${bottom}`;
}

/** Ligação comum, para a frente: faixa preenchida da borda de um nó à borda do seguinte. */
function makeRenderLink(columnX: readonly number[]): (props: SankeyLinkProps) => ReactElement {
  return function renderLink({ sourceY, targetY, linkWidth, payload, index }: SankeyLinkProps): ReactElement {
    const source = payload.source as unknown as ComputedNode;
    const target = payload.target as unknown as ComputedNode;
    const fill = target.role === 'path' ? PATH_COLOR : NEUTRAL_COLOR;
    const path = ribbonPath(columnX, source.depth, target.depth, sourceY, targetY, linkWidth);
    return <path d={path} fill={fill} key={`link-${String(index)}`} stroke="none" />;
  };
}

/**
 * Arco de retorno: sai da borda de CIMA do nó de origem, passa acima das colunas e desce na borda de
 * cima do nó de destino, com a ponta marcando o sentido. Os dois trechos verticais correm no meio da
 * largura do nó, à esquerda de onde o rótulo começa, então não cruzam texto. A largura sai de
 * `scale`, que é a mesma escala de valor para pixel que o Recharts usou nas faixas, medida na caixa
 * de um nó desenhado: sem isso o arco teria espessura arbitrária e o diagrama passaria a ter duas
 * réguas de largura.
 */
function renderReturnArc(
  arc: ReturnArc,
  depths: readonly number[],
  boxes: ReadonlyMap<number, NodeBox>,
  columnX: readonly number[],
  planTop: number,
  scale: number,
  key: string,
): ReactElement | null {
  const sourceBox = boxes.get(arc.source);
  const targetBox = boxes.get(arc.target);
  if (sourceBox === undefined || targetBox === undefined) return null;
  const width = arc.value * scale;
  if (width <= 0) return null;
  const sourceX = (columnX[depths[arc.source] ?? 0] ?? 0) + NODE_WIDTH / 2;
  const targetX = (columnX[depths[arc.target] ?? 0] ?? 0) + NODE_WIDTH / 2;
  const sourceY = sourceBox.y;
  const targetY = targetBox.y;
  const laneY = planTop - NODE_PADDING - ARC_GAP - width / 2;
  const tipY = targetY - ARROW_RISE;
  const half = width / 2 + ARROW_PAD;
  const curve = `M${String(sourceX)},${String(sourceY)} C${String(sourceX)},${String(laneY)} ${String(targetX)},${String(laneY)} ${String(targetX)},${String(tipY)}`;
  const arrow = `M${String(targetX - half)},${String(tipY)} L${String(targetX + half)},${String(tipY)} L${String(targetX)},${String(targetY)} Z`;
  return (
    <g key={key}>
      <path d={curve} fill="none" stroke={RETURN_COLOR} strokeWidth={width} />
      <path d={arrow} fill={RETURN_COLOR} />
    </g>
  );
}

/**
 * Fábrica do nó. O rótulo tem duas linhas, nome e contagem, e uma terceira quando o nó tem laço na
 * própria etapa: o contador de repetições, que substitui o arco. No último nó do array, quando todas
 * as caixas já estão no mapa, desenha os arcos de retorno.
 */
function makeRenderNode(
  columnX: readonly number[],
  depths: readonly number[],
  loops: ReadonlyMap<number, number>,
  arcs: readonly ReturnArc[],
  values: readonly number[],
  finalIndex: number,
  lastIndex: number,
  boxes: Map<number, NodeBox>,
): (props: SankeyNodeProps) => ReactElement {
  return function renderNode({ y, height: nodeHeight, payload, index }: SankeyNodeProps): ReactElement {
    const node = payload as unknown as ComputedNode;
    const cx = columnX[node.depth] ?? 0;
    boxes.set(index, { height: nodeHeight, y });
    const isFinal = index === finalIndex;
    const labelX = cx + NODE_WIDTH + LABEL_GAP;
    const weight = isFinal ? 700 : 500;
    const loop = loops.get(index);
    // O rótulo mora no vão acima do nó, nunca sobre a altura dele: por conservação a ligação que
    // entra ou sai ocupa exatamente a altura do nó (geometria herdada da v1). Com laço, a pilha de
    // linhas cresce para cima, então a terceira linha é a mais baixa das três.
    const loopBaselineY = y - LABEL_NODE_GAP;
    const countBaselineY = loop === undefined ? loopBaselineY : loopBaselineY - LABEL_LINE_GAP;
    const nameBaselineY = countBaselineY - LABEL_LINE_GAP;
    let planTop = Number.POSITIVE_INFINITY;
    let scale = 0;
    for (const [boxIndex, box] of boxes) {
      if (box.y < planTop) planTop = box.y;
      const boxValue = values[boxIndex] ?? 0;
      if (boxValue > 0 && scale === 0) scale = box.height / boxValue;
    }
    return (
      <g key={`node-${String(index)}`}>
        <rect
          fill={node.role === 'path' ? PATH_COLOR : NEUTRAL_COLOR}
          height={nodeHeight}
          rx={2}
          width={NODE_WIDTH}
          x={cx}
          y={y}
        />
        {/* Halo pela ROT-7: a faixa de rótulo já impede que uma ligação varie de y sob este texto, e
            a regra pede halo em rótulo que possa cruzar marca mesmo assim. */}
        <text style={{ paintOrder: 'stroke', stroke: SURFACE_COLOR, strokeWidth: 4 }} textAnchor="start">
          <tspan
            className="font-sans"
            fill={isFinal ? 'var(--text-primary)' : 'var(--text-secondary)'}
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
            y={countBaselineY}
          >
            {countLabel(Number(node.value))}
          </tspan>
          {loop === undefined ? null : (
            <tspan className="font-display" fill={RETURN_COLOR} fontSize={11} fontWeight={500} x={labelX} y={loopBaselineY}>
              {redoneLabel(loop)}
            </tspan>
          )}
        </text>
        {index === lastIndex
          ? arcs.map((arc, arcIndex) =>
              renderReturnArc(arc, depths, boxes, columnX, planTop, scale, `arc-${String(arcIndex)}`),
            )
          : null}
      </g>
    );
  };
}

export default function SankeyReopenArc({ data = defaultData, height, className }: SankeyReopenArcProps): ReactElement {
  const style = height === undefined ? undefined : { height };
  const kinds = classifyLinks(data.nodes.length, data.links);

  const forward: ReopenLink[] = [];
  const arcs: ReturnArc[] = [];
  const loops = new Map<number, number>();
  data.links.forEach((link, index) => {
    const kind = kinds[index] ?? 'forward';
    if (kind === 'forward') forward.push(link);
    if (kind === 'return') arcs.push({ source: link.source, target: link.target, value: link.value });
    if (kind === 'self') loops.set(link.source, (loops.get(link.source) ?? 0) + link.value);
  });

  const values = buildNodeValues(data.nodes.length, forward);
  const depths = computeDepths(data.nodes.length, forward);

  const arrivals = new Set(forward.map((link) => link.target));
  const departures = new Set(forward.map((link) => link.source));
  let entries = 0;
  let won = 0;
  let reopened = 0;
  let redone = 0;
  let finalIndex = -1;
  let finalName = '';
  data.nodes.forEach((node, index) => {
    const value = values[index] ?? 0;
    if (node.role !== 'path') return;
    if (!arrivals.has(index)) entries += value;
    if (departures.has(index)) return;
    won += value;
    finalIndex = index;
    finalName = node.name;
  });
  for (const arc of arcs) reopened += arc.value;
  for (const loop of loops.values()) redone += loop;

  if (data.nodes.length === 0 || forward.length === 0 || entries <= 0) {
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

  const columnX = buildColumnX(depths, data.nodes, values, loops);
  const boxes = new Map<number, NodeBox>();
  const renderLink = makeRenderLink(columnX);
  const renderNode = makeRenderNode(columnX, depths, loops, arcs, values, finalIndex, data.nodes.length - 1, boxes);

  const readingText = `${finalName} fecha ${formatRateWithVolume(won, entries)}; ${formatInt(reopened)} reabertas e ${formatInt(redone)} refeitas são passagens a mais, não oportunidades novas.`;
  const summary = `Sankey de ${formatInt(entries)} oportunidades do trimestre com perdas por etapa, um arco de retorno e um contador de repetição. ${readingText}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{finalName}</span> fecha{' '}
        <span className="kpi-number font-medium text-text-primary">{formatRateWithVolume(won, entries)}</span>;{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(reopened)}</span> reabertas e{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(redone)}</span> refeitas são passagens a
        mais, não oportunidades novas.
      </p>
      <p aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
        <span className="flex items-center gap-2">
          <Undo2 aria-hidden className="size-4 shrink-0" style={{ color: 'var(--chart-3)' }} />
          Arco de cima: oportunidade reaberta, que volta uma etapa
        </span>
        <span className="flex items-center gap-2">
          <RotateCcw aria-hidden className="size-4 shrink-0" style={{ color: 'var(--chart-3)' }} />
          Contador no nó: proposta refeita na própria etapa, sem arco
        </span>
        <span>O total conta oportunidades distintas, nunca passagens</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <Sankey
            accessibilityLayer={false}
            align="left"
            data={{ nodes: [...data.nodes], links: forward }}
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
