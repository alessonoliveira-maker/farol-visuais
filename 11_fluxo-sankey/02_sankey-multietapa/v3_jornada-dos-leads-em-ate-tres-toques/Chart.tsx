import { CornerRightDown, Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { ResponsiveContainer, Sankey, type SankeyLinkProps, type SankeyNode, type SankeyNodeProps } from 'recharts';

import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type JourneyData, type JourneyLink, type JourneyNode } from './data';

/**
 * Sankey multietapa da jornada, desenrolada por passo. O nó é o par canal e passo, então o mesmo
 * canal reaparece em passos seguidos sem formar laço, que é a única forma de um Sankey mostrar
 * repetição de contato: ciclo ele não desenha.
 *
 * O QUE ESTA VERSÃO RESOLVE E A v1 NÃO TEM: a ligação que PULA colunas. Os 99 leads que qualificam
 * no 1º toque vão do passo 1 direto ao desfecho, e uma curva comum entre essas duas colunas
 * atravessaria os nós e os rótulos dos passos 2 e 3 por cima, porque ela é desenhada depois deles.
 * Em vez disso, cada ligação que pula é levada para um CORREDOR reservado abaixo do plano (dentro da
 * margem inferior, ver `MARGIN.bottom` e `CORRIDOR`), com uma pista própria por ligação: desce no
 * vão de curva da coluna de origem, corre no corredor por baixo de todas as colunas intermediárias,
 * e sobe no vão de curva da coluna de destino. A largura da faixa é a mesma que o Recharts calculou,
 * então a escala do corredor é a escala do diagrama.
 *
 * O CORREDOR NÃO É PARA TODO SALTO, E A PRIMEIRA MONTAGEM DESTA PEÇA ERROU NISSO: com o desfecho na
 * última coluna, TODA saída antecipada vira salto, e a regra `alvo mais de uma coluna à frente`
 * mandou 203 dos 318 leads para o corredor, que transbordou a margem e escondeu o achado. O dado
 * passou então a trazer um nó de passagem, "Sem 3º toque", para quem sai com UMA coluna de
 * distância; o corredor ficou só com o salto de DUAS colunas, que é o toque único. O critério é de
 * leitura: o nó de passagem mantém a conservação visível dentro da coluna, e o corredor resolve a
 * distância que nenhuma coluna intermediária consegue acomodar.
 *
 * COMO O CORREDOR SABE ONDE COMEÇA: ele precisa da borda de baixo do plano, que só existe depois de
 * o Recharts posicionar os nós. O Recharts desenha as ligações ANTES dos nós (`AllSankeyLinkElements`
 * e depois `AllNodeElements` em `Sankey.js`), então o renderizador de ligação não empilha nada
 * sozinho: ele REGISTRA a ligação que pula num mapa por índice e devolve grupo vazio, e o
 * renderizador do ÚLTIMO nó, quando toda a geometria já é conhecida, desenha o corredor inteiro. O
 * mapa é por índice de propósito, e não lista: se o Recharts reexecutar o passo das ligações sem o
 * componente remontar, cada índice apenas se sobrescreve, e nada duplica.
 *
 * Do layout de coluna, herda da v1 a faixa de rótulo por coluna (`stageLabelBand`) com trecho reto
 * antes de qualquer curva, que é a saída da armadilha REC-18.
 */
export interface SankeyJourneyStepsProps {
  readonly data?: JourneyData;
  readonly height?: number;
  readonly className?: string;
}

/** O tipo do Recharts não conhece `label`, `step` nem `accent`; o nó computado carrega o payload. */
type ComputedNode = SankeyNode & JourneyNode;

interface NodeBox {
  readonly y: number;
  readonly height: number;
}

interface SkipBand {
  readonly sourceDepth: number;
  readonly targetDepth: number;
  readonly sourceY: number;
  readonly targetY: number;
  readonly width: number;
  readonly accent: boolean;
}

const NODE_WIDTH = 12;
/** Vão vertical entre nós da mesma coluna; o rótulo de duas linhas mora nele. */
const NODE_PADDING = 44;
/** Altura reservada no corredor das ligações que pulam colunas; entra em `MARGIN.bottom`. */
const CORRIDOR = 120;
/**
 * `top` de 68 px abre espaço para o rótulo da coluna (uma linha, no topo) mais o rótulo de duas
 * linhas do primeiro nó; `bottom` soma o respiro de 16 px e o corredor.
 */
const MARGIN = { top: 68, right: 16, bottom: 16 + CORRIDOR, left: 16 } as const;
const LABEL_GAP = 8;
const LABEL_TRAILING_GAP = 16;
/**
 * Vão só para a curva. Maior que os 84 px da v1 porque a ligação que pula precisa descer do plano
 * até o corredor dentro deste vão: ela não pode ainda estar descendo quando chega na coluna
 * seguinte, senão cruza os nós dela por cima.
 */
const CURVE_GAP = 120;
/** Estimativa de largura por caractere: nome em Manrope 12 px, contagem em Space Grotesk 11 px. */
const NAME_CHAR_WIDTH = 7.2;
const COUNT_CHAR_WIDTH = 6.6;
const LABEL_LINE_GAP = 14;
const LABEL_NODE_GAP = 8;
/** Linha de base do rótulo de coluna, dentro de `MARGIN.top`. */
const STEP_BASELINE_Y = 18;
/** Vão entre a borda de baixo do plano e a primeira pista do corredor. */
const CORRIDOR_GAP = 12;
/** Vão entre duas pistas do corredor. */
const LANE_GAP = 8;
const ITERATIONS = 32;
const ACCENT_COLOR = 'var(--chart-1)';
const NEUTRAL_COLOR = 'var(--text-muted)';
const SURFACE_COLOR = 'var(--surface-raised)';
/** Contorno de separação entre faixas vizinhas (COR-5): faixa opaca sobre faixa opaca sem ele vira bloco único. */
const RIBBON_OUTLINE = 1.5;

/** Segunda linha do rótulo do nó: contagem com o substantivo e a fatia inteira do total. */
function countLabel(value: number, total: number): string {
  return `${formatInt(value)} leads · ${formatPercent(value / total, 0)}`;
}

/**
 * Valor de cada nó pela soma das ligações que saem dele; nó terminal usa a soma das que chegam.
 * Devolve o array inteiro para a soma percorrer as ligações uma vez só por render.
 */
function buildNodeValues(nodeCount: number, links: readonly JourneyLink[]): number[] {
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

/** Profundidade de cada nó, na regra do `align="left"`: o alvo fica uma coluna depois da origem. */
function computeDepths(nodeCount: number, links: readonly JourneyLink[]): number[] {
  const depths = new Array<number>(nodeCount).fill(0);
  for (let pass = 0; pass < nodeCount; pass += 1) {
    for (const link of links) {
      const candidate = (depths[link.source] ?? 0) + 1;
      if (candidate > (depths[link.target] ?? 0)) depths[link.target] = candidate;
    }
  }
  return depths;
}

/** Largura do maior rótulo de uma coluna, mais os dois vãos que a cercam. */
function stageLabelBand(
  depth: number,
  depths: readonly number[],
  nodes: readonly JourneyNode[],
  values: readonly number[],
  total: number,
): number {
  let widest = 0;
  nodes.forEach((node, index) => {
    if (depths[index] !== depth) return;
    const nameWidth = node.label.length * NAME_CHAR_WIDTH;
    const countWidth = countLabel(values[index] ?? 0, total).length * COUNT_CHAR_WIDTH;
    widest = Math.max(widest, nameWidth, countWidth);
  });
  return LABEL_GAP + widest + LABEL_TRAILING_GAP;
}

/** Borda esquerda de cada coluna, com a faixa de rótulo da coluna anterior embutida no passo. */
function buildColumnX(
  depths: readonly number[],
  nodes: readonly JourneyNode[],
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
 * Contorno da faixa comum, como REGIÃO FECHADA e não como traço grosso, e isto é correção de
 * desenho, não gosto. Um traço muito espesso sobre curva de raio pequeno tem a borda externa
 * projetada para fora do ponto final, e ela invade a faixa de rótulo do nó vizinho: é o resíduo que a
 * v1 registrou como observação, medido lá em cerca de 35 px com faixa de 154 px. Com a faixa
 * desenhada como polígono, cada borda é a própria curva deslocada de meia largura, começa na borda
 * do nó de origem e termina na do destino, e não sobra nada para fora.
 */
function forwardRibbon(
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
  const stubEndX = (columnX[sourceDepth + 1] ?? targetEdgeX) - CURVE_GAP;
  const controlX = (stubEndX + targetEdgeX) / 2;
  const top = `M${String(sourceEdgeX)},${String(sourceY - half)} L${String(stubEndX)},${String(sourceY - half)} C${String(controlX)},${String(sourceY - half)} ${String(controlX)},${String(targetY - half)} ${String(targetEdgeX)},${String(targetY - half)}`;
  const bottom = `L${String(targetEdgeX)},${String(targetY + half)} C${String(controlX)},${String(targetY + half)} ${String(controlX)},${String(sourceY + half)} ${String(stubEndX)},${String(sourceY + half)} L${String(sourceEdgeX)},${String(sourceY + half)} Z`;
  return `${top} ${bottom}`;
}

/**
 * Contorno da faixa que PULA colunas, pelo corredor, também como região fechada. Ela desce dentro do
 * vão de curva da coluna de origem, corre reta no corredor por baixo das colunas intermediárias, e
 * sobe dentro do vão de curva da coluna de destino. Nenhum dos dois trechos de curva encosta numa
 * coluna de nós, e o trecho horizontal está abaixo do plano: por construção a faixa não passa por
 * cima de nó nem de rótulo.
 */
function corridorRibbon(columnX: readonly number[], band: SkipBand, laneY: number): string {
  const half = band.width / 2;
  const sourceEdgeX = (columnX[band.sourceDepth] ?? 0) + NODE_WIDTH;
  const enterX = columnX[band.sourceDepth + 1] ?? sourceEdgeX;
  const stubEndX = enterX - CURVE_GAP;
  const targetEdgeX = columnX[band.targetDepth] ?? enterX;
  const riseX = targetEdgeX - CURVE_GAP;
  const downX = (stubEndX + enterX) / 2;
  const upX = (riseX + targetEdgeX) / 2;
  const sourceTop = band.sourceY - half;
  const sourceBottom = band.sourceY + half;
  const laneTop = laneY - half;
  const laneBottom = laneY + half;
  const targetTop = band.targetY - half;
  const targetBottom = band.targetY + half;
  return [
    `M${String(sourceEdgeX)},${String(sourceTop)}`,
    `L${String(stubEndX)},${String(sourceTop)}`,
    `C${String(downX)},${String(sourceTop)} ${String(downX)},${String(laneTop)} ${String(enterX)},${String(laneTop)}`,
    `L${String(riseX)},${String(laneTop)}`,
    `C${String(upX)},${String(laneTop)} ${String(upX)},${String(targetTop)} ${String(targetEdgeX)},${String(targetTop)}`,
    `L${String(targetEdgeX)},${String(targetBottom)}`,
    `C${String(upX)},${String(targetBottom)} ${String(upX)},${String(laneBottom)} ${String(riseX)},${String(laneBottom)}`,
    `L${String(enterX)},${String(laneBottom)}`,
    `C${String(downX)},${String(laneBottom)} ${String(downX)},${String(sourceBottom)} ${String(stubEndX)},${String(sourceBottom)}`,
    `L${String(sourceEdgeX)},${String(sourceBottom)}`,
    'Z',
  ].join(' ');
}

/**
 * Fábrica da ligação. A que avança uma coluna desenha na hora; a que pula é registrada no mapa e
 * desenhada depois, pelo renderizador do último nó, quando a borda de baixo do plano já é conhecida.
 */
function makeRenderLink(
  columnX: readonly number[],
  pending: Map<number, SkipBand>,
): (props: SankeyLinkProps) => ReactElement {
  return function renderLink({ sourceY, targetY, linkWidth, payload, index }: SankeyLinkProps): ReactElement {
    // O tipo do Recharts não conhece `accent` nem os campos do nó de origem; o payload computado
    // carrega o objeto do `data.ts` inteiro, com os dois nós resolvidos.
    const computed = payload as unknown as JourneyLink & {
      readonly source: ComputedNode;
      readonly target: ComputedNode;
    };
    const source = computed.source;
    const target = computed.target;
    const accent = computed.accent;
    const fill = accent ? ACCENT_COLOR : NEUTRAL_COLOR;
    if (target.depth > source.depth + 1) {
      pending.set(index, {
        accent,
        sourceDepth: source.depth,
        sourceY,
        targetDepth: target.depth,
        targetY,
        width: linkWidth,
      });
      return <g key={`skip-${String(index)}`} />;
    }
    return (
      <path
        d={forwardRibbon(columnX, source.depth, target.depth, sourceY, targetY, linkWidth)}
        fill={fill}
        key={`link-${String(index)}`}
        stroke={SURFACE_COLOR}
        strokeLinejoin="round"
        strokeWidth={RIBBON_OUTLINE}
      />
    );
  };
}

/** Empilha as faixas do corredor, da origem mais alta para a mais baixa, e devolve uma por pista. */
function corridorLanes(pending: Map<number, SkipBand>, planBottom: number): { band: SkipBand; laneY: number }[] {
  const bands = [...pending.values()].sort((left, right) => left.sourceY - right.sourceY);
  const lanes: { band: SkipBand; laneY: number }[] = [];
  let cursor = planBottom + CORRIDOR_GAP;
  for (const band of bands) {
    lanes.push({ band, laneY: cursor + band.width / 2 });
    cursor += band.width + LANE_GAP;
  }
  return lanes;
}

/**
 * Fábrica do nó. Além do retângulo e do rótulo de duas linhas no vão acima dele, faz duas coisas que
 * dependem da ordem de desenho: escreve o rótulo da coluna no primeiro nó de cada profundidade, e no
 * ÚLTIMO nó do array desenha o corredor das ligações que pulam colunas, quando a borda de baixo do
 * plano já pode ser medida nas caixas de todos os nós.
 */
function makeRenderNode(
  columnX: readonly number[],
  total: number,
  headerIndexes: ReadonlySet<number>,
  lastIndex: number,
  boxes: Map<number, NodeBox>,
  pending: Map<number, SkipBand>,
): (props: SankeyNodeProps) => ReactElement {
  return function renderNode({ y, height: nodeHeight, payload, index }: SankeyNodeProps): ReactElement {
    const node = payload as unknown as ComputedNode;
    const cx = columnX[node.depth] ?? 0;
    boxes.set(index, { height: nodeHeight, y });
    const labelX = cx + NODE_WIDTH + LABEL_GAP;
    const weight = node.accent ? 600 : 500;
    // O rótulo mora no vão de padding acima do nó, nunca sobre a altura dele: por conservação a
    // ligação que entra ou sai ocupa exatamente a altura do nó (geometria herdada da v1).
    const countBaselineY = y - LABEL_NODE_GAP;
    const nameBaselineY = countBaselineY - LABEL_LINE_GAP;
    let planBottom = 0;
    for (const box of boxes.values()) {
      const bottom = box.y + box.height;
      if (bottom > planBottom) planBottom = bottom;
    }
    return (
      <g key={`node-${String(index)}`}>
        {headerIndexes.has(index) ? (
          <text
            className="font-sans"
            fill="var(--text-muted)"
            fontSize={11}
            fontWeight={500}
            textAnchor="start"
            x={cx}
            y={STEP_BASELINE_Y}
          >
            {node.step}
          </text>
        ) : null}
        <rect fill={node.accent ? ACCENT_COLOR : NEUTRAL_COLOR} height={nodeHeight} rx={2} width={NODE_WIDTH} x={cx} y={y} />
        {/* Halo pela ROT-7, mesmo com a faixa de rótulo garantindo que nenhuma ligação varia de y
            sob este texto: a regra pede halo em rótulo que possa cruzar marca. */}
        <text style={{ paintOrder: 'stroke', stroke: SURFACE_COLOR, strokeWidth: 4 }} textAnchor="start">
          <tspan
            className="font-sans"
            fill={node.accent ? 'var(--text-primary)' : 'var(--text-secondary)'}
            fontSize={12}
            fontWeight={weight}
            x={labelX}
            y={nameBaselineY}
          >
            {node.label}
          </tspan>
          <tspan
            className="font-display"
            fill="var(--text-muted)"
            fontSize={11}
            fontWeight={weight}
            x={labelX}
            y={countBaselineY}
          >
            {countLabel(Number(node.value), total)}
          </tspan>
        </text>
        {index === lastIndex
          ? corridorLanes(pending, planBottom)
              .sort((left, right) => Number(left.band.accent) - Number(right.band.accent))
              .map((lane, laneIndex) => (
              <path
                d={corridorRibbon(columnX, lane.band, lane.laneY)}
                fill={lane.band.accent ? ACCENT_COLOR : NEUTRAL_COLOR}
                key={`lane-${String(laneIndex)}`}
                stroke={SURFACE_COLOR}
                strokeLinejoin="round"
                strokeWidth={RIBBON_OUTLINE}
              />
            ))
          : null}
      </g>
    );
  };
}

export default function SankeyJourneySteps({ data = defaultData, height, className }: SankeyJourneyStepsProps): ReactElement {
  const style = height === undefined ? undefined : { height };
  const values = buildNodeValues(data.nodes.length, data.links);
  const depths = computeDepths(data.nodes.length, data.links);

  const arrivals = new Set(data.links.map((link) => link.target));
  let total = 0;
  let topLabel = '';
  let topValue = 0;
  data.nodes.forEach((node, index) => {
    if (arrivals.has(index)) return;
    const value = values[index] ?? 0;
    total += value;
    if (value > topValue) {
      topValue = value;
      topLabel = node.label;
    }
  });

  let skipped = 0;
  for (const link of data.links) {
    const from = depths[link.source] ?? 0;
    const to = depths[link.target] ?? 0;
    if (to > from + 1) skipped += link.value;
  }

  if (data.nodes.length === 0 || data.links.length === 0 || total <= 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve lead qualificado com ponto de contato registrado no mês.</span>
      </div>
    );
  }

  const columnX = buildColumnX(depths, data.nodes, values, total);
  const columnCount = columnX.length;
  const headerIndexes = new Set<number>();
  const seenDepths = new Set<number>();
  for (let index = 0; index < data.nodes.length; index += 1) {
    const depth = depths[index] ?? 0;
    if (seenDepths.has(depth)) continue;
    seenDepths.add(depth);
    headerIndexes.add(index);
  }

  const boxes = new Map<number, NodeBox>();
  const pending = new Map<number, SkipBand>();
  const renderLink = makeRenderLink(columnX, pending);
  const renderNode = makeRenderNode(columnX, total, headerIndexes, data.nodes.length - 1, boxes, pending);

  const readingText = `${topLabel} concentra a entrada, ${formatRateWithVolume(topValue, total)}; o 1º toque já qualifica ${formatRateWithVolume(skipped, total)}, sem passar pelos passos do meio.`;
  const summary = `Sankey da jornada de ${formatInt(total)} leads qualificados, desenrolada em ${formatInt(columnCount)} colunas de passo até o desfecho. ${readingText}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{topLabel}</span> concentra a entrada,{' '}
        <span className="kpi-number font-medium text-text-primary">{formatRateWithVolume(topValue, total)}</span>; o 1º
        toque já qualifica{' '}
        <span className="kpi-number font-medium text-text-primary">{formatRateWithVolume(skipped, total)}</span>, sem
        passar pelos passos do meio.
      </p>
      <p aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2 w-5 shrink-0 rounded-sm bg-chart-1" />
          Trecho mais pesado da jornada
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2 w-5 shrink-0 rounded-sm" style={{ backgroundColor: 'var(--text-muted)' }} />
          Demais trechos
        </span>
        <span className="flex items-center gap-2">
          <CornerRightDown aria-hidden className="size-4 shrink-0" />
          Corredor de baixo: quem pula os passos do meio
        </span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <Sankey
            accessibilityLayer={false}
            align="left"
            data={{
              nodes: [...data.nodes],
              // Faixa acesa por último: desenhada sobre as neutras, nunca coberta por elas.
              links: [...data.links].sort((left, right) => Number(left.accent) - Number(right.accent)),
            }}
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
