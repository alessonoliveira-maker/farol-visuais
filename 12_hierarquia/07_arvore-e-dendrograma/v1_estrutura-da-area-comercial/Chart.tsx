import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OrgNode } from './data';

/**
 * Árvore lateral (tidy tree): a raiz fica à esquerda e cada profundidade ocupa uma coluna fixa
 * (`COLUMN_X`). A posição vertical de uma folha vem da ordem de entrada no `data.ts`
 * (`leafIndex`, de cima para baixo); a de um pai é a média da posição dos filhos, calculada de
 * baixo para cima na mesma recursão que monta o layout (`buildLayout`). A cor categórica vem do
 * `slot` que cada grupo declara no `data.ts` (mapa fixo de categoria para slot, nunca a posição
 * no array) e desce por herança até a folha: a raiz nunca compete por slot de cor porque
 * representa o todo, não uma categoria (COR-3, COR-8).
 * A aresta é a curva do catálogo, `M x0,y0 C x0,ym x1,ym x1,y1`, com o ponto médio vertical como
 * controle dos dois lados: isso desenha um S suave entre pai e filho sem biblioteca de layout.
 * A aresta é o próprio dado (ACE-6: apagar o traço apaga quem é filho de quem), então sua cor
 * vem do `slot` do filho que ela liga (`slotColor`), a mesma paleta categórica dos nós, e não do
 * neutro de referência `--line-strong` (que mede só 1,79:1 e 1,83:1, abaixo do piso de 3:1 da
 * WCAG 1.4.11 sem isenção de valor escrito na própria linha).
 *
 * O headcount de todo nó que não é folha nasce da soma dos filhos, calculada aqui
 * (`buildLayout`), nunca digitado duas vezes no `data.ts`: o número ao lado de "Comercial" fecha
 * sempre com a soma das funções daquele grupo, sem checagem manual.
 *
 * Anticolisão de rótulo em dois estágios (`findLabelPlacement`, ROT-7). Perto da raiz e de todo
 * nó cujos filhos nascem com pouca diferença de posição vertical, as arestas cobrem quase toda a
 * faixa vertical logo na saída do nó (a curva toca `y0` em `t=0`), e nenhum deslocamento vertical
 * sozinho escapa de todas ao mesmo tempo: fugir de uma empurra o rótulo para dentro de outra. Por
 * isso o primeiro estágio tenta só deslocar verticalmente no afastamento padrão do rótulo; falhando
 * em todos os candidatos, o segundo estágio afasta o rótulo mais para a direita (onde as arestas já
 * divergiram para os próprios destinos) e repete a busca vertical nesse novo afastamento. A posição
 * escolhida é sempre uma que a busca mediu livre de todas as arestas na faixa horizontal que o texto
 * ocupa, nunca um valor escolhido sem checar; o nó ganha uma linha de chamada até o rótulo deslocado.
 */
export interface OrgTreeProps {
  readonly data?: readonly OrgNode[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 894;
/** Corpo do preset "largo" (960x400) com moldura card: cerca de 894x274 (seção 13). */
const VIEW_H = 274;
const MARGIN = { top: 16, bottom: 16, left: 14, right: 20 } as const;
/** Uma coluna por profundidade: raiz, grupo, função. O rótulo não é uma caixa fechada, é texto
 * correndo à direita do nó (sem truncar, TIP-7). As colunas usam a largura do canvas "largo"
 * até a `MARGIN.right`, com espaço para o nome mais longo desta base ("Analista de Performance
 * de Mídia") mais a contagem depois da última coluna. */
const COLUMN_X = [MARGIN.left, 260, 560] as const;
const NODE_RADIUS = [6, 5, 4] as const;
const EDGE_STROKE_WIDTH = 1.5;
const LABEL_GAP = 10;
const NAME_FONT_PX = 12;
const COUNT_FONT_PX = 11;
/** Metade da altura de uma linha de rótulo, para a checagem de colisão (ROT-7 marca fina):
 * a aresta é um traço de `EDGE_STROKE_WIDTH` (1,5 px), fino demais para o halo da 17.4 (que só
 * cabe em marca de 18 px ou mais sem apagá-la); aqui quem sai do lugar é o rótulo, não a aresta.
 * 7, não 6: as duas linhas do rótulo (nome e contagem) distam 14 px uma da outra, e uma faixa de
 * checagem de ±6 deixava 2 px sem cobertura entre elas; ±7 cobre a régua inteira sem sobra. */
const LABEL_LINE_HALF_HEIGHT = 7;
/** Deslocamentos verticais tentados nessa ordem pelo anticolisão (`findLabelPlacement`): primeiro
 * sem deslocar, depois alternando para cima e para baixo em passos crescentes, até o dobro do
 * afastamento que a raiz precisou medir para escapar das três arestas que saem dela. */
const LABEL_OFFSET_CANDIDATES = [
  0, -10, 10, -20, 20, -30, 30, -40, 40, -50, 50, -60, 60,
] as const;
/**
 * Afastamento horizontal extra tentado quando nenhum deslocamento vertical do estágio anterior
 * resolve (ROT-7, segundo estágio): cada valor empurra o rótulo mais para perto da coluna
 * seguinte, dando tempo para as arestas convergentes se separarem. Medido para a raiz desta
 * versão (três arestas saindo do mesmo ponto): 100 px de afastamento extra ainda deixa a faixa do
 * texto antes da coluna de grupo (`COLUMN_X[1]`), com folga.
 */
const LABEL_GAP_ESCALATIONS = [0, 40, 70, 100] as const;
/** Largura média por caractere usada só para estimar até onde o texto do rótulo se estende
 * (checagem geométrica de colisão, não pintura): grosseira de propósito, sempre para mais. */
const CHAR_WIDTH_FACTOR = 0.64;

function slotColor(slot: number | null): string {
  if (slot === null) return 'var(--line-strong)';
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** "1 pessoa" no singular, "N pessoas" no plural: a contagem nunca sai crua (NUM-6). */
function formatHeadcount(value: number): string {
  return `${formatInt(value)} ${value === 1 ? 'pessoa' : 'pessoas'}`;
}

interface PositionedNode {
  readonly id: string;
  readonly label: string;
  readonly depth: number;
  readonly x: number;
  readonly y: number;
  readonly headcount: number;
  readonly slot: number | null;
  /** Tem aresta de saída: é o próprio nó cujo rótulo pode ser cruzado por elas (ROT-7). */
  readonly hasChildren: boolean;
}

interface Edge {
  readonly id: string;
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
  /** Slot do filho que a aresta liga: a aresta é o dado (ACE-6) e herda a cor categórica de quem
   * ela leva a, nunca o neutro de referência. */
  readonly slot: number | null;
}

interface Layout {
  readonly nodesByDepth: readonly (readonly PositionedNode[])[];
  readonly edges: readonly Edge[];
  readonly root: PositionedNode | null;
}

function countLeaves(node: OrgNode): number {
  const children = node.children ?? [];
  if (children.length === 0) return 1;
  return children.reduce((sum, child) => sum + countLeaves(child), 0);
}

/**
 * Monta o layout inteiro numa só recursão pós-ordem: primeiro posiciona os filhos (que, se forem
 * folhas, ganham a próxima linha da ordem de entrada), depois tira a média deles para a posição
 * do próprio nó, e só então registra as arestas para os filhos, porque a curva precisa das duas
 * pontas já resolvidas.
 */
function buildLayout(root: OrgNode): Layout {
  const totalLeaves = countLeaves(root);
  const span = totalLeaves > 1 ? (VIEW_H - MARGIN.top - MARGIN.bottom) / (totalLeaves - 1) : 0;
  const nodesByDepth: PositionedNode[][] = [];
  const edges: Edge[] = [];
  let leafIndex = 0;

  function place(node: OrgNode, depth: number, slot: number | null): PositionedNode {
    const x = COLUMN_X[Math.min(depth, COLUMN_X.length - 1)] ?? 0;
    const children = node.children ?? [];
    let y: number;
    let headcount: number;
    if (children.length === 0) {
      y = MARGIN.top + leafIndex * span;
      leafIndex += 1;
      headcount = node.headcount ?? 0;
    } else {
      // Slot por categoria (COR-3): o grupo traz o próprio `slot` do `data.ts`; função e raiz
      // herdam o slot já resolvido do pai. Nunca `SLOT_ORDER[index]`, que coloriria por posição.
      const placed = children.map((child) => place(child, depth + 1, slot ?? child.slot ?? 1));
      y = placed.reduce((sum, child) => sum + child.y, 0) / placed.length;
      headcount = placed.reduce((sum, child) => sum + child.headcount, 0);
      for (const child of placed) {
        edges.push({
          id: `edge-${node.id}-${child.id}`,
          x0: x,
          y0: y,
          x1: child.x,
          y1: child.y,
          slot: child.slot,
        });
      }
    }
    const positioned: PositionedNode = {
      id: node.id,
      label: node.label,
      depth,
      x,
      y,
      headcount,
      slot,
      hasChildren: children.length > 0,
    };
    (nodesByDepth[depth] ??= []).push(positioned);
    return positioned;
  }

  const rootNode = place(root, 0, null);
  return { nodesByDepth, edges, root: rootNode };
}

/** `M x0,y0 C x0,ym x1,ym x1,y1`: curva em S com o ponto médio vertical como controle dos dois
 * lados, no formato que o catálogo (12/07) descreve para a aresta. */
function edgePath(edge: Edge): string {
  const ym = (edge.y0 + edge.y1) / 2;
  return `M ${String(edge.x0)},${String(edge.y0)} C ${String(edge.x0)},${String(ym)} ${String(edge.x1)},${String(ym)} ${String(edge.x1)},${String(edge.y1)}`;
}

function cubicAt(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u ** 3 * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t ** 3 * p3;
}

/**
 * Y da curva `edgePath` num X dado, por busca binária sobre `t` (o X da curva é monótono entre
 * as duas colunas, então a busca converge). Devolve `null` fora do intervalo horizontal da
 * aresta. Usada só para a checagem geométrica do anticolisão, nunca para desenhar.
 */
function edgeYAtX(edge: Edge, targetX: number): number | null {
  const { x0, y0, x1, y1 } = edge;
  const min = Math.min(x0, x1);
  const max = Math.max(x0, x1);
  if (targetX < min || targetX > max) return null;
  const ym = (y0 + y1) / 2;
  const rising = x1 >= x0;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    const xMid = cubicAt(x0, x0, x1, x1, mid);
    if (xMid < targetX === rising) lo = mid;
    else hi = mid;
  }
  return cubicAt(y0, ym, ym, y1, (lo + hi) / 2);
}

/** Estimativa grosseira de largura de texto (checagem geométrica, não pintura): sempre para
 * mais, então nunca deixa passar uma colisão real por subestimar o comprimento do rótulo. */
function estimateTextWidth(text: string, fontPx: number): number {
  return text.length * fontPx * CHAR_WIDTH_FACTOR;
}

interface LabelPlacement {
  /** Deslocamento vertical do rótulo contra o centro do nó. */
  readonly dy: number;
  /** Afastamento horizontal extra somado ao `LABEL_GAP` padrão. */
  readonly extraGap: number;
}

/** Retângulo ocupado por um rótulo já posicionado (as duas linhas juntas), para o próximo rótulo
 * não pousar em cima de um vizinho (ROT-9: dois textos não dividem espaço sem respiro). */
interface LabelBox {
  readonly xStart: number;
  readonly xEnd: number;
  readonly yTop: number;
  readonly yBottom: number;
}

function boxesOverlap(a: LabelBox, b: LabelBox): boolean {
  return a.xStart < b.xEnd && b.xStart < a.xEnd && a.yTop < b.yBottom && b.yTop < a.yBottom;
}

/** Meia altura aproximada de uma linha de texto de 12 px, para a checagem de canvas: uma posição
 * "livre de aresta" que sai da moldura do corpo não é livre, é cortada (o corpo tem `overflow`
 * escondido). Fugir por cima costuma achar "livre" perto do topo do SVG porque não há aresta ali,
 * só o próprio limite do desenho: a checagem de colisão sozinha não pega isso. */
const TEXT_ROW_HALF_HEIGHT = 6;
/** Respiro mínimo entre a tinta do texto e a borda do corpo (a moldura do preview soma a própria
 * margem por fora; este respiro é só contra o `viewBox` interno do SVG do Chart). */
const CANVAS_TEXT_PADDING = 2;

/**
 * Testa se um rótulo centrado em `(anchorX, node.y + dy)` cruza alguma aresta do desenho, na
 * faixa horizontal de `anchorX` até `anchorX + width` (checagem geométrica sobre a curva real,
 * `edgeYAtX`, não sobre o preview fixo: vale para qualquer recorte plausível do dado, como a
 * ROT-7 exige), sai da área visível do corpo, OU cai em cima de um rótulo já posicionado
 * (`placedBoxes`, ROT-9: fugir da própria aresta não pode pousar em cima do vizinho). Testa contra
 * TODAS as arestas do layout, não só as vizinhas do nó, porque a aresta de um irmão distante pode
 * cruzar o mesmo ponto do plano.
 */
function labelCollides(
  anchorX: number,
  dy: number,
  width: number,
  node: PositionedNode,
  edges: readonly Edge[],
  placedBoxes: readonly LabelBox[],
): boolean {
  const nameY = node.y - 7 + dy;
  const countY = node.y + 7 + dy;
  const top = Math.min(nameY, countY) - TEXT_ROW_HALF_HEIGHT;
  const bottom = Math.max(nameY, countY) + TEXT_ROW_HALF_HEIGHT;
  if (top < CANVAS_TEXT_PADDING || bottom > VIEW_H - CANVAS_TEXT_PADDING) return true;

  const box: LabelBox = { xStart: anchorX, xEnd: anchorX + width, yTop: top, yBottom: bottom };
  if (placedBoxes.some((placed) => boxesOverlap(box, placed))) return true;

  const SAMPLES = 8;
  const sampleXs = Array.from({ length: SAMPLES + 1 }, (_, i) => anchorX + (i / SAMPLES) * width);
  return edges.some((edge) =>
    sampleXs.some((x) => {
      const y = edgeYAtX(edge, x);
      if (y === null) return false;
      return Math.abs(y - nameY) < LABEL_LINE_HALF_HEIGHT || Math.abs(y - countY) < LABEL_LINE_HALF_HEIGHT;
    }),
  );
}

/**
 * Anticolisão do rótulo de um nó com aresta de saída, em dois estágios (ROT-7, exceção da marca
 * fina: a aresta mede só 1,5 px, fina demais para o halo, então quem sai do lugar é o rótulo).
 *
 * Estágio 1: no afastamento padrão do rótulo, tenta cada deslocamento vertical de
 * `LABEL_OFFSET_CANDIDATES`, nessa ordem, e usa o primeiro em que nem a linha do nome nem a da
 * contagem cruzam nenhuma aresta na faixa horizontal que o texto ocupa. Resolve o caso comum (um
 * nó cujas próprias arestas não convergem para perto da posição dele).
 *
 * Estágio 2, só quando o primeiro falha em todos os candidatos: escala `LABEL_GAP_ESCALATIONS` e
 * repete a mesma busca vertical em cada afastamento maior. É o caso da raiz e de todo nó cujos
 * filhos nascem perto da própria posição vertical dele: as arestas cobrem quase toda a faixa
 * vertical logo na saída (a curva toca `y0` em `t=0`), e nenhum deslocamento vertical no
 * afastamento padrão escapa de todas ao mesmo tempo; afastar o rótulo dá tempo para as arestas
 * divergirem para os próprios destinos antes de o texto começar. A posição devolvida é sempre uma
 * que a busca mediu livre de aresta, dentro da área visível do corpo (`labelCollides` também
 * rejeita a posição que escapa do `viewBox`; sem isso, fugir de uma aresta por cima do desenho
 * "acha" livre perto do topo do SVG só porque não há aresta ali, e o texto sai cortado pela
 * moldura) E livre de todo rótulo já posicionado (`placedBoxes`, processados nó a nó na ordem de
 * profundidade: a raiz primeiro, que é quem mais precisa do espaço, e cada rótulo seguinte já
 * enxerga onde os anteriores pousaram). Se mesmo assim nenhuma combinação limpar (não ocorre com o
 * dado fixo desta versão, conferido no render dos dois temas), fica no maior par tentado.
 */
function findLabelPlacement(
  node: PositionedNode,
  edges: readonly Edge[],
  placedBoxes: readonly LabelBox[],
): { readonly placement: LabelPlacement; readonly box: LabelBox } {
  const radius = NODE_RADIUS[node.depth] ?? 4;
  const width = Math.max(
    estimateTextWidth(node.label, NAME_FONT_PX),
    estimateTextWidth(formatHeadcount(node.headcount), COUNT_FONT_PX),
  );

  const boxFor = (anchorX: number, dy: number): LabelBox => {
    const nameY = node.y - 7 + dy;
    const countY = node.y + 7 + dy;
    return {
      xStart: anchorX,
      xEnd: anchorX + width,
      yTop: Math.min(nameY, countY) - TEXT_ROW_HALF_HEIGHT,
      yBottom: Math.max(nameY, countY) + TEXT_ROW_HALF_HEIGHT,
    };
  };

  for (const extraGap of LABEL_GAP_ESCALATIONS) {
    const anchorX = node.x + radius + LABEL_GAP + extraGap;
    for (const dy of LABEL_OFFSET_CANDIDATES) {
      if (!labelCollides(anchorX, dy, width, node, edges, placedBoxes)) {
        return { placement: { dy, extraGap }, box: boxFor(anchorX, dy) };
      }
    }
  }
  const lastGap = LABEL_GAP_ESCALATIONS[LABEL_GAP_ESCALATIONS.length - 1] ?? 0;
  const lastOffset = LABEL_OFFSET_CANDIDATES[LABEL_OFFSET_CANDIDATES.length - 1] ?? 0;
  const anchorX = node.x + radius + LABEL_GAP + lastGap;
  return { placement: { dy: lastOffset, extraGap: lastGap }, box: boxFor(anchorX, lastOffset) };
}

export default function OrgTree({ data = defaultData, height, className }: OrgTreeProps) {
  const style = height === undefined ? undefined : { height };
  const rootInput = data[0];
  const layout = useMemo(() => (rootInput ? buildLayout(rootInput) : null), [rootInput]);
  /** Só nó com filho tem aresta saindo do próprio ponto onde o rótulo nasce (ROT-7). Processados
   * na ordem de profundidade (raiz, depois grupos) para cada rótulo já enxergar os anteriores. */
  const labelPlacements = useMemo(() => {
    const placements = new Map<string, LabelPlacement>();
    if (!layout) return placements;
    const boxes: LabelBox[] = [];
    for (const nodes of layout.nodesByDepth) {
      for (const node of nodes) {
        if (!node.hasChildren) continue;
        const { placement, box } = findLabelPlacement(node, layout.edges, boxes);
        placements.set(node.id, placement);
        boxes.push(box);
      }
    }
    return placements;
  }, [layout]);

  if (!rootInput || !layout?.root) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma estrutura neste recorte: não há hierarquia para desenhar.</span>
      </div>
    );
  }

  const groups = layout.nodesByDepth[1] ?? [];
  const leaves = layout.nodesByDepth[2] ?? [];
  const leaderGroup = [...groups].sort((a, b) => b.headcount - a.headcount)[0];
  const leaderLeaf = [...leaves].sort((a, b) => b.headcount - a.headcount)[0];
  const leaderShare = leaderGroup && layout.root.headcount > 0 ? leaderGroup.headcount / layout.root.headcount : 0;

  const summary = [
    `Árvore lateral com a estrutura de ${layout.root.label}, ${formatHeadcount(layout.root.headcount)} em ${formatInt(groups.length)} grupos e ${formatInt(leaves.length)} funções.`,
    leaderGroup ? `${leaderGroup.label} é o maior grupo, com ${formatHeadcount(leaderGroup.headcount)}.` : '',
    leaderLeaf ? `${leaderLeaf.label} é a maior função, com ${formatHeadcount(leaderLeaf.headcount)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {leaderGroup ? (
          <>
            <span className="font-semibold text-text-primary">{leaderGroup.label}</span> concentra{' '}
            <span className="kpi-number font-medium text-text-primary">{formatPercent(leaderShare, 0)}</span>{' '}
            das pessoas da área, a maior entre os <span className="tabular-nums">{formatInt(groups.length)}</span>{' '}
            grupos.
          </>
        ) : null}
      </p>
      <div className="flex min-h-0 flex-1 justify-center">
        <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {layout.edges.map((edge) => (
            // A aresta é o dado (ACE-6): cor categórica do filho que ela liga, nunca o neutro de
            // referência `--line-strong` (1,79:1 e 1,83:1, abaixo do piso de 3:1 sem valor escrito
            // na própria linha).
            <path
              d={edgePath(edge)}
              fill="none"
              key={edge.id}
              stroke={slotColor(edge.slot)}
              strokeWidth={EDGE_STROKE_WIDTH}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {layout.nodesByDepth.map((nodes, depth) =>
            nodes.map((node) => {
              const radius = NODE_RADIUS[depth] ?? 4;
              const placement = labelPlacements.get(node.id);
              const dy = placement?.dy ?? 0;
              const extraGap = placement?.extraGap ?? 0;
              const labelX = node.x + radius + LABEL_GAP + extraGap;
              return (
                <g key={node.id}>
                  {dy !== 0 || extraGap !== 0 ? (
                    // Linha de chamada até o rótulo deslocado: também carrega relação (a quem o
                    // rótulo pertence), por isso o tom mais forte que o de grade (ACE-6).
                    <line
                      stroke="var(--text-muted)"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                      x1={node.x + radius}
                      x2={labelX - 2}
                      y1={node.y}
                      y2={node.y + dy}
                    />
                  ) : null}
                  <circle cx={node.x} cy={node.y} fill={slotColor(node.slot)} r={radius} />
                  <text
                    className="font-sans"
                    dominantBaseline="central"
                    fill={depth === 2 ? 'var(--text-secondary)' : 'var(--text-primary)'}
                    fontSize={NAME_FONT_PX}
                    fontWeight={depth === 2 ? 500 : 600}
                    x={labelX}
                    y={node.y - 7 + dy}
                  >
                    {node.label}
                  </text>
                  <text
                    className="font-display"
                    dominantBaseline="central"
                    fill="var(--text-muted)"
                    fontSize={COUNT_FONT_PX}
                    fontWeight={500}
                    x={labelX}
                    y={node.y + 7 + dy}
                  >
                    {formatHeadcount(node.headcount)}
                  </text>
                </g>
              );
            }),
          )}
        </svg>
      </div>
    </div>
  );
}
