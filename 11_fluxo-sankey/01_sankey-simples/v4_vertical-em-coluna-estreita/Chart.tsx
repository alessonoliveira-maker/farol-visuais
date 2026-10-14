import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type FlowLink, type FlowNode, type VerticalFlowData } from './data';

/**
 * Sankey VERTICAL: as origens ocupam uma fileira no topo, os desfechos uma fileira na base, e a
 * LARGURA da faixa é o valor. O Sankey do Recharts não tem orientação (a prop não existe em
 * `recharts 3.10.1`), então a geometria é calculada aqui, em funções puras, e o desenho sai em
 * SVG do próprio arquivo. Girar o diagrama horizontal com `transform` giraria o texto junto, o
 * que a TIP-5 proíbe: por isso não há nenhum `transform` neste SVG.
 *
 * DUAS CONSEQUÊNCIAS DA COLUNA ESTREITA, e as duas são de leitura, não de gosto.
 *
 * 1. O nome do nó não cabe na largura do nó. Em vez de reticência, que a TIP-7 proíbe em marca
 *    desenhada, o nome quebra em até DUAS linhas por palavra inteira, no corte mais equilibrado
 *    que caiba (é a saída que a GEO-2 registra). A largura vem da tabela de avanço por classe de
 *    caractere medida no acervo, não de uma constante herdada.
 *
 * 2. Na base, dois desfechos valem 18 e 14 agendas, isto é, 26 px e 20 px de nó: nenhum rótulo
 *    cabe ali, nem quebrado. Os rótulos vão para até DUAS fileiras, escolhidas por uma varredura
 *    de colisão da esquerda para a direita, e cada um recebe uma linha de chamada vertical dentro
 *    do próprio nó (ROT-11), porque rótulo deslocado sem chamada perde o dono.
 *
 * DESLOCAMENTO DAS FAIXAS NO NÓ. Dentro de cada nó de origem as saídas são ordenadas pela
 * POSIÇÃO HORIZONTAL do destino, e dentro de cada nó de desfecho as entradas pela posição da
 * origem. É o que evita que as faixas se cruzem sem necessidade, e um `sort` só por índice de nó
 * entrega as duas coisas, porque a ordem do array já é a ordem da esquerda para a direita.
 */
export interface VerticalSankeyProps {
  readonly data?: VerticalFlowData;
  readonly height?: number;
  readonly className?: string;
}

/**
 * O `viewBox` é o tamanho da área que o corpo do cartão entrega ao SVG (canvas 480 x 480 na
 * moldura `card`, menos a linha de leitura e o respiro dela), e não um número redondo. Com
 * `preserveAspectRatio="none"` a escala fica em 1 px por unidade nos dois eixos, e é isso que
 * permite tratar o vão entre nós e a espessura do contorno como pixels do PNG.
 */
const VIEW_WIDTH = 422;
const VIEW_HEIGHT = 344;
/** Alto reservado para o rótulo do topo (até 3 linhas) e para as duas fileiras da base. */
const MARGIN = { top: 46, right: 14, bottom: 86, left: 14 } as const;
const NODE_HEIGHT = 12;
/** Vão entre nós vizinhos da mesma fileira: piso de 1,5 px da COR-5, com folga. */
const NODE_GAP = 10;
const LABEL_GAP = 6;
const LABEL_LINE_HEIGHT = 13;
const LABEL_SIZE = 11;
/** Alto de um bloco de rótulo cheio: até duas linhas de nome mais a linha da contagem. */
const LABEL_BLOCK_HEIGHT = 3 * LABEL_LINE_HEIGHT;
/** Respiro mínimo entre dois blocos de rótulo na mesma fileira (ROT-9 pede 4 px de tinta). */
const LABEL_CLEARANCE = 8;
/** Respiro entre a linha de chamada e a tinta do rótulo vizinho, com folga sobre a estimativa. */
const LEADER_CLEARANCE = 10;
const LEADER_INSET = 3;
const NEUTRAL_FILL = 'var(--text-muted)';
const EDGE_STROKE = 'var(--surface-raised)';
const EDGE_STROKE_WIDTH = 1;
/** Linha de chamada do rótulo deslocado. Carrega relação, então mede 3:1 (ACE-6). */
const LEADER_STROKE = 'var(--text-muted)';

/**
 * Avanço médio por classe de caractere em Manrope e em Space Grotesk, em em, medido no acervo
 * pela mesma função que a guarda COLISAO-TEXTO usa. Serve para decidir se o nome cabe na largura
 * do nó. Subestimar é o lado seguro aqui: o rótulo é desenhado e a COLISAO-TEXTO acusa o encontro
 * de tinta no render, enquanto superestimar esconderia texto, e isso nenhuma guarda pega.
 */
const EM_BY_CLASS = {
  manrope: { upper: 0.616, lower: 0.526, digit: 0.563, space: 0.216, other: 0.55 },
  grotesk: { upper: 0.609, lower: 0.541, digit: 0.59, space: 0.216, other: 0.55 },
} as const;

type FontFamily = keyof typeof EM_BY_CLASS;

function charEm(character: string, family: FontFamily): number {
  const table = EM_BY_CLASS[family];
  if (character === ' ') return table.space;
  if (character >= '0' && character <= '9') return table.digit;
  if (character !== character.toLowerCase()) return table.upper;
  if (character !== character.toUpperCase()) return table.lower;
  return table.other;
}

function textWidth(text: string, size: number, family: FontFamily): number {
  return [...text].reduce((sum, character) => sum + charEm(character, family) * size, 0);
}

/**
 * Até duas linhas, quebradas por PALAVRA INTEIRA, no corte que deixa a linha mais larga o menor
 * possível. Uma linha só quando ela já cabe. Quando nenhum corte cabe, vale o corte mais estreito
 * em vez da linha única, porque duas linhas nunca são mais largas que uma e o rótulo de marca
 * desenhada não some por reticência (TIP-7). Palavra única que não cabe volta inteira: o que
 * transborda é problema de canvas, não de texto.
 */
function wrapToTwoLines(text: string, maxWidth: number, size: number, family: FontFamily): readonly string[] {
  if (textWidth(text, size, family) <= maxWidth) return [text];
  const words = text.split(' ');
  if (words.length < 2) return [text];
  let best: readonly string[] = [text];
  let bestWidest = textWidth(text, size, family);
  for (let cut = 1; cut < words.length; cut += 1) {
    const first = words.slice(0, cut).join(' ');
    const second = words.slice(cut).join(' ');
    const widest = Math.max(textWidth(first, size, family), textWidth(second, size, family));
    if (widest < bestWidest) {
      best = [first, second];
      bestWidest = widest;
    }
  }
  return best;
}

/**
 * Escala horizontal em px por agenda, ou `null` quando não há população para escalar. O `null`
 * não é zelo: escala 0 desenharia um diagrama de largura zero com cara de diagrama, e a EST-1b
 * manda toda conta que resume uma lista devolver ausência em vez de 0.
 */
function horizontalScale(population: number, usableTop: number, usableBottom: number): number | null {
  return population > 0 ? Math.min(usableTop, usableBottom) / population : null;
}

/** Soma das agendas de uma lista de ligações. Semente 0 é a definição de soma vazia, não ausência. */
function totalOf(links: readonly FlowLink[]): number {
  return links.reduce((sum, link) => sum + link.value, 0);
}

/** Fração de um valor sobre a base, ou `null` quando a base não existe. Nunca 0. */
function shareOf(part: number, base: number): number | null {
  return base > 0 ? part / base : null;
}

function nodeFill(node: FlowNode | undefined): string {
  if (node === undefined || node.slot === undefined) return NEUTRAL_FILL;
  return CHART_SERIES_COLORS[node.slot - 1] ?? NEUTRAL_FILL;
}

interface NodeBox {
  readonly index: number;
  readonly name: string;
  readonly x: number;
  readonly width: number;
  readonly total: number;
}

/** Uma fileira de nós, encostada à esquerda, com o vão fixo entre vizinhos. */
function layoutRow(
  indexes: readonly number[],
  nodes: readonly FlowNode[],
  totals: ReadonlyMap<number, number>,
  scale: number,
  startX: number,
): readonly NodeBox[] {
  const boxes: NodeBox[] = [];
  let cursor = startX;
  for (const index of indexes) {
    const total = totals.get(index) ?? 0;
    const width = total * scale;
    boxes.push({ index, name: nodes[index]?.name ?? '', x: cursor, width, total });
    cursor += width + NODE_GAP;
  }
  return boxes;
}

interface LabelBlock {
  readonly key: string;
  readonly lines: readonly string[];
  readonly countLine: string;
  /** Centro do TEXTO, já preso dentro do viewBox. */
  readonly centerX: number;
  /** X da linha de chamada, dentro do nó, mesmo se o texto foi preso ou deslocado. */
  readonly leaderX: number;
  readonly row: number;
}

/**
 * Bloco de rótulo por nó: nome quebrado contra a largura do próprio nó, fileira escolhida por
 * varredura de colisão da esquerda para a direita, e centro preso dentro do viewBox para que
 * rótulo de nó de ponta não saia pela borda do cartão.
 */
function layoutLabels(boxes: readonly NodeBox[]): readonly LabelBlock[] {
  const blocks: LabelBlock[] = [];
  const rightEdgeByRow: number[] = [];
  /** Posições x das linhas de chamada que descem pela fileira 0: obstáculo com 4 px de tinta (17.7). */
  const leaderXs: number[] = [];
  for (const box of boxes) {
    const lines = wrapToTwoLines(box.name, box.width, LABEL_SIZE, 'manrope');
    const countLine = `${formatInt(box.total)} agendas`;
    // A semente é a largura da contagem, então a conta nunca parte de uma lista vazia.
    const width = lines.reduce(
      (widest, line) => Math.max(widest, textWidth(line, LABEL_SIZE, 'manrope')),
      textWidth(countLine, LABEL_SIZE, 'grotesk'),
    );
    const nodeCenterX = box.x + box.width / 2;
    const centerX = Math.min(Math.max(nodeCenterX, width / 2 + 2), VIEW_WIDTH - width / 2 - 2);
    // A chamada nasce perto da borda esquerda do nó, para liberar a fileira 0 à direita dela.
    const leaderX = box.x + Math.min(LEADER_INSET, box.width / 2);
    let left = centerX - width / 2;
    let row = 0;
    while (row < 1 && left < (rightEdgeByRow[row] ?? Number.NEGATIVE_INFINITY) + LABEL_CLEARANCE) row += 1;
    // Bloco da fileira 0 que cairia sobre uma chamada já descida: o texto sai do lugar, a chamada
    // não. A folga cobre a diferença entre a largura estimada e a tinta real (cerca de 10%).
    let finalCenterX = centerX;
    if (row === 0) {
      for (const leaderX of leaderXs) {
        const minLeft = leaderX + LEADER_CLEARANCE;
        if (left < minLeft && left + width > leaderX - LEADER_CLEARANCE) {
          finalCenterX += minLeft - left;
          left = minLeft;
        }
      }
    }
    if (row === 1) leaderXs.push(leaderX);
    rightEdgeByRow[row] = left + width;
    blocks.push({ key: `label-${String(box.index)}`, lines, countLine, centerX: finalCenterX, leaderX, row });
  }
  return blocks;
}

/** Faixa vertical entre duas fileiras: duas cúbicas com os pontos de controle na meia altura. */
function ribbonPath(leftTop: number, rightTop: number, yTop: number, leftBottom: number, rightBottom: number, yBottom: number): string {
  const yc = (yTop + yBottom) / 2;
  return [
    `M ${String(leftTop)},${String(yTop)}`,
    `C ${String(leftTop)},${String(yc)} ${String(leftBottom)},${String(yc)} ${String(leftBottom)},${String(yBottom)}`,
    `L ${String(rightBottom)},${String(yBottom)}`,
    `C ${String(rightBottom)},${String(yc)} ${String(rightTop)},${String(yc)} ${String(rightTop)},${String(yTop)}`,
    'Z',
  ].join(' ');
}

export default function VerticalSankey({ data = defaultData, height, className }: VerticalSankeyProps) {
  const style = height === undefined ? undefined : { height };

  const originIndexes = data.nodes.map((node, index) => ({ node, index })).filter((entry) => entry.node.kind === 'origin');
  const outcomeIndexes = data.nodes.map((node, index) => ({ node, index })).filter((entry) => entry.node.kind === 'outcome');
  const population = totalOf(data.links);
  const usableTop = VIEW_WIDTH - MARGIN.left - MARGIN.right - Math.max(originIndexes.length - 1, 0) * NODE_GAP;
  const usableBottom = VIEW_WIDTH - MARGIN.left - MARGIN.right - Math.max(outcomeIndexes.length - 1, 0) * NODE_GAP;
  const scale = horizontalScale(population, usableTop, usableBottom);

  // Um portão só para os dois vazios que existem aqui: recorte sem linhas (EST-1) e recorte com
  // linhas somando zero agenda, que daria a mesma tela sem escala.
  if (data.links.length === 0 || scale === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve agenda marcada com origem e desfecho registrados no período.</span>
      </div>
    );
  }

  const outTotals = new Map<number, number>();
  const inTotals = new Map<number, number>();
  for (const link of data.links) {
    outTotals.set(link.source, (outTotals.get(link.source) ?? 0) + link.value);
    inTotals.set(link.target, (inTotals.get(link.target) ?? 0) + link.value);
  }

  const topBoxes = layoutRow(originIndexes.map((entry) => entry.index), data.nodes, outTotals, scale, MARGIN.left);
  const bottomBoxes = layoutRow(outcomeIndexes.map((entry) => entry.index), data.nodes, inTotals, scale, MARGIN.left);
  const topY = MARGIN.top;
  const bottomY = VIEW_HEIGHT - MARGIN.bottom - NODE_HEIGHT;
  const ribbonTopY = topY + NODE_HEIGHT;

  // Um sort só, por (origem, destino) na ordem do array, entrega saída ordenada pelo destino E
  // entrada ordenada pela origem, porque a ordem do array é a ordem da esquerda para a direita.
  const ordered = [...data.links].sort((a, b) => a.source - b.source || a.target - b.target);
  const outCursor = new Map<number, number>();
  const inCursor = new Map<number, number>();
  for (const box of topBoxes) outCursor.set(box.index, box.x);
  for (const box of bottomBoxes) inCursor.set(box.index, box.x);

  const laidOut = ordered.map((link) => {
    const span = link.value * scale;
    const leftTop = outCursor.get(link.source) ?? MARGIN.left;
    outCursor.set(link.source, leftTop + span);
    const leftBottom = inCursor.get(link.target) ?? MARGIN.left;
    inCursor.set(link.target, leftBottom + span);
    return {
      key: `ribbon-${String(link.source)}-${String(link.target)}`,
      span,
      d: ribbonPath(leftTop, leftTop + span, ribbonTopY, leftBottom, leftBottom + span, bottomY),
      fill: nodeFill(data.nodes[link.source]),
    };
  });

  // Pintura das maiores para as menores (REC-13): a faixa fina fica por cima e segue legível de
  // ponta a ponta. A geometria acima já foi fixada pela ordem (origem, destino).
  const ribbons = [...laidOut].sort((a, b) => b.span - a.span);

  const topLabels = layoutLabels(topBoxes);
  const bottomLabels = layoutLabels(bottomBoxes);

  const topOutcome = bottomBoxes.reduce<NodeBox | null>((best, box) => (best === null || box.total > best.total ? box : best), null);
  const topShare = topOutcome === null ? null : shareOf(topOutcome.total, population);

  const summary =
    topOutcome === null || topShare === null
      ? `Sankey vertical do desfecho de ${formatInt(population)} agendas marcadas, com as origens no topo e os desfechos na base, e a largura de cada faixa proporcional ao volume.`
      : `Sankey vertical do desfecho de ${formatInt(population)} agendas marcadas: ${String(topBoxes.length)} origens no topo e ${String(bottomBoxes.length)} desfechos na base, com a largura da faixa proporcional ao volume. O desfecho mais comum é ${topOutcome.name}, com ${formatInt(topOutcome.total)} agendas, ou ${formatPercent(topShare, 0)} do total.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 h-5 shrink-0 text-xs text-text-secondary">
        {topOutcome === null || topShare === null ? (
          <span>Sem desfecho medido neste recorte.</span>
        ) : (
          <span>
            Das <span className="kpi-number font-medium text-text-primary">{formatInt(population)}</span> agendas marcadas,{' '}
            <span className="kpi-number font-semibold text-text-primary">{formatInt(topOutcome.total)}</span> (
            <span className="kpi-number font-semibold text-text-primary">{formatPercent(topShare, 0)}</span>) terminaram em{' '}
            {topOutcome.name}.
          </span>
        )}
      </p>
      <div className="min-h-0 w-full flex-1">
        <svg
          className="h-full w-full"
          preserveAspectRatio="none"
          viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}
        >
          {ribbons.map((ribbon) => (
            <path d={ribbon.d} fill={ribbon.fill} key={ribbon.key} stroke={EDGE_STROKE} strokeWidth={EDGE_STROKE_WIDTH} />
          ))}
          {[...topBoxes, ...bottomBoxes].map((box) => (
            <rect
              fill={nodeFill(data.nodes[box.index])}
              height={NODE_HEIGHT}
              key={`node-${String(box.index)}`}
              rx={1}
              width={box.width}
              x={box.x}
              y={data.nodes[box.index]?.kind === 'origin' ? topY : bottomY}
            />
          ))}
          {topLabels.map((block) => {
            // O bloco do topo cresce para CIMA a partir do vão acima do nó: a última linha é a
            // contagem, encostada no nó, e o nome fica acima dela. A margem superior guarda UMA
            // fileira de três linhas; dado que peça uma segunda fileira aqui pede canvas mais alto.
            const lastCenter = topY - LABEL_GAP - LABEL_SIZE / 2 - block.row * (LABEL_BLOCK_HEIGHT + LABEL_GAP);
            const lines = [...block.lines, block.countLine];
            const firstCenter = lastCenter - (lines.length - 1) * LABEL_LINE_HEIGHT;
            return (
              <text dominantBaseline="central" key={block.key} textAnchor="middle" x={block.centerX} y={firstCenter}>
                {lines.map((line, position) => (
                  <tspan
                    className={position === lines.length - 1 ? 'font-display' : 'font-sans'}
                    dy={position === 0 ? 0 : LABEL_LINE_HEIGHT}
                    fill={position === lines.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)'}
                    fontSize={LABEL_SIZE}
                    fontWeight={position === lines.length - 1 ? 400 : 500}
                    key={line}
                    x={block.centerX}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            );
          })}
          {bottomLabels.map((block) => {
            const rowTop = bottomY + NODE_HEIGHT + LABEL_GAP + block.row * (LABEL_BLOCK_HEIGHT + LABEL_GAP);
            const firstCenter = rowTop + LABEL_SIZE / 2;
            const lines = [...block.lines, block.countLine];
            return (
              <g key={block.key}>
                {/* Linha de chamada: nasce dentro do próprio nó e para no rótulo (ROT-11). */}
                <line
                  stroke={LEADER_STROKE}
                  strokeWidth={1}
                  x1={block.leaderX}
                  x2={block.leaderX}
                  y1={bottomY + NODE_HEIGHT}
                  y2={rowTop}
                />
                <text dominantBaseline="central" textAnchor="middle" x={block.centerX} y={firstCenter}>
                  {lines.map((line, position) => (
                    <tspan
                      className={position === lines.length - 1 ? 'font-display' : 'font-sans'}
                      dy={position === 0 ? 0 : LABEL_LINE_HEIGHT}
                      fill={position === lines.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)'}
                      fontSize={LABEL_SIZE}
                      fontWeight={position === lines.length - 1 ? 400 : 500}
                      key={line}
                      x={block.centerX}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
