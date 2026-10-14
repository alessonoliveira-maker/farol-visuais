import { useId } from 'react';
import { Filter } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type GridEdge, type GridNode, type HandoffGrid } from './data';

/**
 * Grafo em grade em SVG puro: funções nas colunas, etapas nas linhas e uma seta ortogonal de cantos
 * arredondados por passagem, com a contagem escrita no meio. O centro de cada célula sai de
 * constantes de geometria, então grade, nós e setas moram no mesmo viewBox. Responde quem passa
 * a oportunidade para quem, e em que etapa.
 */
export interface HandoffGridGraphProps {
  readonly data?: HandoffGrid;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox repete o corpo medido do cartão `largo` (894 px), para a escala sair 1 e os 11 px valerem na tela (GEO-18). */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 262;
const STAGE_LABEL_WIDTH = 104;
const MARGIN_RIGHT = 6;
const HEADER_HEIGHT = 22;
/** Rodapé com a unidade e o período da contagem. */
const FOOTER_HEIGHT = 20;
const NODE_WIDTH = 150;
const NODE_HEIGHT = 28;
/** Passo entre as pontas de arestas que chegam ou saem do mesmo lado de um nó. */
const PORT_STEP = 14;
const CORNER = 8;
const ARROW = 7;
/** A pista corre a 62% do vão entre as duas etapas: o número fica acima dela, dentro do vão, e a ponta da seta tem chão. */
const LANE_SHARE = 0.62;
/** Distância do centro do número à pista que ele rotula. */
const LABEL_RISE = 8;
/** Recuo do número de uma seta vertical reta, que o escreve ao lado dela. */
const SIDE_GAP = 8;
/** Linha de base de um texto de 11 px centrado na âncora vertical. */
const LABEL_BASELINE = 4;
const EDGE_WIDTH = 1.5;
/** ACE-6: a seta é o dado. `--line-strong` mede 1,79:1; `--text-muted` mede 5,21:1 e 5,37:1. */
const EDGE_STROKE = 'var(--text-muted)';
const SURFACE = 'var(--surface-raised)';

interface Placed {
  readonly node: GridNode;
  readonly cx: number;
  readonly cy: number;
  readonly row: number;
}

interface Geometry {
  readonly cellWidth: number;
  readonly rowHeight: number;
  readonly placed: ReadonlyMap<string, Placed>;
}

function buildGeometry(data: HandoffGrid): Geometry {
  const cellWidth = (VIEW_WIDTH - STAGE_LABEL_WIDTH - MARGIN_RIGHT) / Math.max(data.columns.length, 1);
  const rowHeight = (VIEW_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT) / Math.max(data.rows.length, 1);
  const placed = new Map<string, Placed>();
  for (const node of data.nodes) {
    const col = data.columns.findIndex((column) => column.id === node.column);
    const row = data.rows.findIndex((stage) => stage.id === node.row);
    if (col < 0 || row < 0) continue;
    placed.set(node.id, {
      node,
      cx: STAGE_LABEL_WIDTH + (col + 0.5) * cellWidth,
      cy: HEADER_HEIGHT + (row + 0.5) * rowHeight,
      row,
    });
  }
  return { cellWidth, rowHeight, placed };
}

function edgeKey(edge: GridEdge): string {
  return `${edge.from}>${edge.to}`;
}

/** Aresta entre etapas diferentes sai pela base do nó e entra pelo topo; na mesma etapa corre de lado. */
function isLateral(edge: GridEdge, placed: ReadonlyMap<string, Placed>): boolean {
  return placed.get(edge.from)?.row === placed.get(edge.to)?.row;
}

/** Ponta de cada aresta dentro do nó: as que dividem o mesmo lado se ordenam pelo centro do vizinho e ganham um passo cada. */
function portOffsets(
  edges: readonly GridEdge[],
  placed: ReadonlyMap<string, Placed>,
  side: 'from' | 'to',
): Map<string, number> {
  const other = side === 'from' ? 'to' : 'from';
  const grouped = new Map<string, GridEdge[]>();
  for (const edge of edges) {
    if (isLateral(edge, placed)) continue;
    grouped.set(edge[side], [...(grouped.get(edge[side]) ?? []), edge]);
  }
  const offsets = new Map<string, number>();
  for (const group of grouped.values()) {
    const sorted = [...group].sort((a, b) => (placed.get(a[other])?.cx ?? 0) - (placed.get(b[other])?.cx ?? 0));
    sorted.forEach((edge, index) => offsets.set(edgeKey(edge), (index - (sorted.length - 1) / 2) * PORT_STEP));
  }
  return offsets;
}

/**
 * Ortogonal com cantos arredondados: desce da base do nó até a pista da etapa, corre de lado e
 * desce até o topo do destino. Aresta na mesma coluna é uma vertical reta.
 */
function downPath(x0: number, y0: number, x1: number, y1: number, laneY: number): string {
  if (Math.abs(x1 - x0) < 0.5) return `M ${String(x0)},${String(y0)} V ${String(y1)}`;
  const dir = x1 > x0 ? 1 : -1;
  const r = Math.max(Math.min(CORNER, Math.abs(x1 - x0) / 2, laneY - y0 - 1, y1 - laneY - 1), 0);
  return [
    `M ${String(x0)},${String(y0)}`,
    `V ${String(laneY - r)}`,
    `Q ${String(x0)},${String(laneY)} ${String(x0 + dir * r)},${String(laneY)}`,
    `H ${String(x1 - dir * r)}`,
    `Q ${String(x1)},${String(laneY)} ${String(x1)},${String(laneY + r)}`,
    `V ${String(y1)}`,
  ].join(' ');
}

interface DrawnEdge {
  readonly key: string;
  readonly d: string;
  readonly labelX: number;
  readonly labelY: number;
  /** Seta vertical reta: o número fica ao lado dela, sem cobrir a ponta. */
  readonly beside: boolean;
  readonly count: number;
  readonly title: string;
}

function buildEdges(data: HandoffGrid, geometry: Geometry): DrawnEdge[] {
  const { placed, rowHeight } = geometry;
  const outs = portOffsets(data.edges, placed, 'from');
  const ins = portOffsets(data.edges, placed, 'to');
  const drawn: DrawnEdge[] = [];
  for (const edge of data.edges) {
    const a = placed.get(edge.from);
    const b = placed.get(edge.to);
    if (a === undefined || b === undefined) continue;
    const key = edgeKey(edge);
    const title = `${a.node.label} para ${b.node.label}: ${formatInt(edge.count)}`;
    if (isLateral(edge, placed)) {
      const dir = b.cx > a.cx ? 1 : -1;
      const x0 = a.cx + (dir * NODE_WIDTH) / 2;
      const x1 = b.cx - (dir * NODE_WIDTH) / 2 - dir;
      drawn.push({ key, d: `M ${String(x0)},${String(a.cy)} H ${String(x1)}`, labelX: (x0 + x1) / 2, labelY: a.cy - 8, beside: false, count: edge.count, title });
      continue;
    }
    // Vertical reta: os dois lados usam a ponta do destino, para a aresta não ganhar um desvio de poucos pixels.
    const x1 = b.cx + (ins.get(key) ?? 0);
    const x0 = Math.abs(a.cx - b.cx) < 0.5 ? x1 : a.cx + (outs.get(key) ?? 0);
    const y0 = a.cy + NODE_HEIGHT / 2;
    const y1 = b.cy - NODE_HEIGHT / 2 - 1;
    const laneY = y0 + (rowHeight - NODE_HEIGHT) * LANE_SHARE;
    const straight = Math.abs(x1 - x0) < 0.5;
    drawn.push({ key, d: downPath(x0, y0, x1, y1, laneY), labelX: straight ? x0 + SIDE_GAP : (x0 + x1) / 2, labelY: straight ? (y0 + y1) / 2 : laneY - LABEL_RISE, beside: straight, count: edge.count, title });
  }
  return drawn;
}

function passageNoun(count: number): string {
  return count === 1 ? 'oportunidade' : 'oportunidades';
}

export default function HandoffGridGraph({ data = defaultData, height, className }: HandoffGridGraphProps) {
  const markerId = useId();
  const style = height === undefined ? undefined : { height };

  if (data.nodes.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma função com papel neste recorte: o processo não tem etapa preenchida no período.</span>
      </div>
    );
  }

  const geometry = buildGeometry(data);
  const edges = buildEdges(data, geometry);
  const total = data.edges.reduce((sum, edge) => sum + edge.count, 0);
  const top = data.edges.reduce<GridEdge | null>((best, edge) => (best === null || edge.count > best.count ? edge : best), null);
  const topFrom = top === null ? undefined : geometry.placed.get(top.from)?.node;
  const topTo = top === null ? undefined : geometry.placed.get(top.to)?.node;
  const topText =
    top === null || topFrom === undefined || topTo === undefined
      ? ''
      : ` A maior vai de ${topFrom.label.toLowerCase()} para ${topTo.label.toLowerCase()}, com ${formatInt(top.count)}.`;
  const summary = `Grafo em grade de ${formatInt(data.nodes.length)} nós, ${formatInt(data.columns.length)} funções por ${formatInt(data.rows.length)} etapas no ${data.period}, ligados por ${formatInt(data.edges.length)} passagens que somam ${formatInt(total)} ${passageNoun(total)}.${topText}`;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {/* xMidYMin: sobrando altura no cartão, a grade fica colada ao topo e a escala segue 1. */}
      <svg aria-hidden className="h-full w-full" preserveAspectRatio="xMidYMin meet" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        <defs>
          <marker id={markerId} markerHeight={ARROW} markerUnits="userSpaceOnUse" markerWidth={ARROW} orient="auto" refX={ARROW - 1} refY={ARROW / 2} viewBox={`0 0 ${String(ARROW)} ${String(ARROW)}`}>
            <path d={`M0,0 L${String(ARROW)},${String(ARROW / 2)} L0,${String(ARROW)} Z`} fill={EDGE_STROKE} />
          </marker>
        </defs>
        {data.rows.map((row, r) => {
          const y = HEADER_HEIGHT + r * geometry.rowHeight;
          return (
            <g key={row.id}>
              <text className="font-sans" fill="var(--text-secondary)" fontSize={12} fontWeight={600} x={0} y={y + geometry.rowHeight / 2 + 4}>
                {row.label}
              </text>
              {data.columns.map((column, c) => (
                <rect fill="none" height={geometry.rowHeight} key={column.id} stroke="var(--line-subtle)" width={geometry.cellWidth} x={STAGE_LABEL_WIDTH + c * geometry.cellWidth} y={y} />
              ))}
            </g>
          );
        })}
        {data.columns.map((column, c) => (
          <text className="font-sans" fill="var(--text-secondary)" fontSize={12} fontWeight={600} key={column.id} textAnchor="middle" x={STAGE_LABEL_WIDTH + (c + 0.5) * geometry.cellWidth} y={HEADER_HEIGHT - 8}>
            {column.label}
          </text>
        ))}
        {edges.map((edge) => (
          <g key={edge.key}>
            <title>{edge.title}</title>
            <path d={edge.d} fill="none" markerEnd={`url(#${markerId})`} stroke={EDGE_STROKE} strokeWidth={EDGE_WIDTH} />
          </g>
        ))}
        {[...geometry.placed.values()].map(({ node, cx, cy }) => (
          <g key={node.id}>
            <rect fill="var(--surface-sunken)" height={NODE_HEIGHT} rx={6} stroke="var(--line-strong)" strokeWidth={1.5} width={NODE_WIDTH} x={cx - NODE_WIDTH / 2} y={cy - NODE_HEIGHT / 2} />
            <text className="font-sans" fill="var(--text-primary)" fontSize={12} fontWeight={500} textAnchor="middle" x={cx} y={cy + 4}>
              {node.label}
            </text>
          </g>
        ))}
        {/* Halo na cor do cartão: o número fica legível onde cruza a seta (ROT-7). */}
        {edges.map((edge) => (
          <text
            className="font-display"
            fill="var(--text-primary)"
            fontSize={11}
            fontWeight={600}
            key={edge.key}
            style={{ paintOrder: 'stroke', stroke: SURFACE, strokeWidth: 4 }}
            textAnchor={edge.beside ? 'start' : 'middle'}
            x={edge.labelX}
            y={edge.labelY + LABEL_BASELINE}
          >
            {formatInt(edge.count)}
          </text>
        ))}
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={0} y={VIEW_HEIGHT - 6}>
          {`Passagens de oportunidade, ${data.period}`}
        </text>
      </svg>
    </figure>
  );
}
