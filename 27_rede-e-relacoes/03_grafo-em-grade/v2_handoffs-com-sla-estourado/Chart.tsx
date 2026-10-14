import { useId } from 'react';
import { Clock, Filter } from 'lucide-react';

import { formatInt, formatMonthLong, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type GridNode, type SlaEdge, type SlaGrid } from './data';

/**
 * Grafo em grade em SVG puro com o prazo à vista: a seta de uma passagem que estourou o SLA acima
 * do limite sai em `--negative`, com um relógio e o percentual sobre o total da passagem escritos
 * junto dela. Responde em quais passagens do processo o prazo acordado estourou, e em quantos casos.
 */
export interface SlaGridGraphProps {
  readonly data?: SlaGrid;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox repete o corpo do cartão `largo` (894 px) menos a linha de leitura, para a escala sair 1 (GEO-18). */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 234;
const STAGE_LABEL_WIDTH = 104;
const MARGIN_RIGHT = 6;
const HEADER_HEIGHT = 22;
const NODE_WIDTH = 150;
const NODE_HEIGHT = 26;
/** Passo entre as pontas de arestas que chegam ou saem do mesmo lado de um nó. */
const PORT_STEP = 14;
const CORNER = 8;
const ARROW = 7;
/** A pista corre a 62% do vão entre as duas etapas: o número fica acima dela, dentro do vão, e a ponta da seta tem chão. */
const LANE_SHARE = 0.62;
/** Distância do centro do número à pista que ele rotula. */
const LABEL_RISE = 8;
/** Linha de base de um texto de 11 px centrado na âncora vertical. */
const LABEL_BASELINE = 4;
/** Largura média de um algarismo de 11 px em Space Grotesk, para o fundo do rótulo. */
const CHAR_WIDTH = 6.2;
const ICON_SIZE = 12;
const ICON_GAP = 4;
const EDGE_WIDTH = 1.5;
const ALERT_WIDTH = 2.25;
/** ACE-6: a seta é o dado. `--line-strong` mede 1,79:1; `--text-muted` mede 5,21:1 e 5,37:1. */
const EDGE_STROKE = 'var(--text-muted)';
const ALERT_STROKE = 'var(--negative)';
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

function buildGeometry(data: SlaGrid): Geometry {
  const cellWidth = (VIEW_WIDTH - STAGE_LABEL_WIDTH - MARGIN_RIGHT) / Math.max(data.columns.length, 1);
  const rowHeight = (VIEW_HEIGHT - HEADER_HEIGHT) / Math.max(data.rows.length, 1);
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

function edgeKey(edge: SlaEdge): string {
  return `${edge.from}>${edge.to}`;
}

/** EST-1b: passagem sem volume não tem taxa, e a parcela devolve null em vez de zero. */
function lateShare(edge: SlaEdge): number | null {
  return edge.count > 0 ? edge.late / edge.count : null;
}

/** Ponta de cada aresta dentro do nó: as que dividem o mesmo lado se ordenam pelo centro do vizinho e ganham um passo cada. */
function portOffsets(
  edges: readonly SlaEdge[],
  placed: ReadonlyMap<string, Placed>,
  side: 'from' | 'to',
): Map<string, number> {
  const other = side === 'from' ? 'to' : 'from';
  const grouped = new Map<string, SlaEdge[]>();
  for (const edge of edges) grouped.set(edge[side], [...(grouped.get(edge[side]) ?? []), edge]);
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
  readonly alert: boolean;
  readonly text: string;
  readonly x: number;
  readonly y: number;
  /** Vertical reta escreve o rótulo ao lado da seta; a que dobra escreve sobre a pista. */
  readonly beside: 'left' | 'right' | null;
  readonly title: string;
}

function buildEdges(data: SlaGrid, geometry: Geometry): DrawnEdge[] {
  const { placed, rowHeight } = geometry;
  const outs = portOffsets(data.edges, placed, 'from');
  const ins = portOffsets(data.edges, placed, 'to');
  const lanes: { readonly row: number; readonly max: number }[] = [];
  const drawn: (DrawnEdge & { readonly row: number; readonly x0: number })[] = [];
  for (const edge of data.edges) {
    const a = placed.get(edge.from);
    const b = placed.get(edge.to);
    const share = lateShare(edge);
    if (a === undefined || b === undefined || share === null || b.row <= a.row) continue;
    const key = edgeKey(edge);
    // Vertical reta: os dois lados usam a ponta do destino, para a aresta não ganhar um desvio de poucos pixels.
    const x1 = b.cx + (ins.get(key) ?? 0);
    const x0 = Math.abs(a.cx - b.cx) < 0.5 ? x1 : a.cx + (outs.get(key) ?? 0);
    const y0 = a.cy + NODE_HEIGHT / 2;
    const y1 = b.cy - NODE_HEIGHT / 2 - 1;
    const laneY = y0 + (rowHeight - NODE_HEIGHT) * LANE_SHARE;
    const straight = Math.abs(x1 - x0) < 0.5;
    if (!straight) lanes.push({ row: a.row, max: Math.max(x0, x1) });
    const text = formatRateWithVolume(edge.late, edge.count, 0);
    drawn.push({
      key,
      d: downPath(x0, y0, x1, y1, laneY),
      alert: share > data.alertShare,
      text,
      x: straight ? x0 : (x0 + x1) / 2,
      y: straight ? (y0 + y1) / 2 : laneY - LABEL_RISE,
      beside: straight ? 'right' : null,
      title: `${a.node.label} para ${b.node.label}: ${text}`,
      row: a.row,
      x0,
    });
  }
  // Vertical reta escreve à direita, salvo quando outra seta da mesma pista corre para a direita dela.
  return drawn
    .map((edge) => {
      const crowded = lanes.some((lane) => lane.row === edge.row && lane.max > edge.x0 + 1);
      return edge.beside === null ? edge : { ...edge, beside: crowded ? ('left' as const) : ('right' as const) };
    })
    .sort((a, b) => Number(a.alert) - Number(b.alert));
}

export default function SlaGridGraph({ data = defaultData, height, className }: SlaGridGraphProps) {
  const markerId = useId();
  const style = height === undefined ? undefined : { height };
  const geometry = buildGeometry(data);
  const edges = buildEdges(data, geometry);

  if (data.nodes.length === 0 || edges.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma passagem com SLA neste recorte: o processo não registrou passagem entre funções no mês.</span>
      </div>
    );
  }

  const worst = data.edges.reduce<SlaEdge | null>((best, edge) => {
    const share = lateShare(edge);
    const bestShare = best === null ? null : lateShare(best);
    return share !== null && (bestShare === null || share > bestShare) ? edge : best;
  }, null);
  const columnOf = (nodeId: string): string => {
    const node = geometry.placed.get(nodeId)?.node;
    return data.columns.find((column) => column.id === node?.column)?.label ?? nodeId;
  };
  const alerts = edges.filter((edge) => edge.alert).length;
  const month = formatMonthLong(data.period);
  const worstPair = worst === null ? '' : `${columnOf(worst.from)} para ${columnOf(worst.to)}`;
  const worstRate = worst === null ? '' : formatRateWithVolume(worst.late, worst.count, 0);
  const summary = `Grafo em grade com o prazo de ${formatInt(edges.length)} passagens em ${month}: ${formatInt(alerts)} estouraram o SLA em mais de ${formatPercent(data.alertShare, 0)}. A maior é de ${worstPair.toLowerCase()}, com ${worstRate}.`;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        Maior estouro: <span className="font-semibold text-text-primary">{worstPair}</span>,{' '}
        <span className="font-semibold tabular-nums text-negative">{worstRate}</span> em {month}.
        <span className="ml-4 inline-flex items-center gap-1 text-[0.6875rem] text-text-muted">
          <Clock aria-hidden className="size-3 text-negative" />
          {`SLA estourado em mais de ${formatPercent(data.alertShare, 0)} da passagem`}
        </span>
      </p>
      {/* xMidYMin: sobrando altura no cartão, a grade fica colada ao que vem acima e a escala segue 1. */}
      <svg aria-hidden className="min-h-0 w-full flex-1" preserveAspectRatio="xMidYMin meet" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        <defs>
          {[
            { id: `${markerId}-muted`, fill: EDGE_STROKE },
            { id: `${markerId}-alert`, fill: ALERT_STROKE },
          ].map((marker) => (
            <marker id={marker.id} key={marker.id} markerHeight={ARROW} markerUnits="userSpaceOnUse" markerWidth={ARROW} orient="auto" refX={ARROW - 1} refY={ARROW / 2} viewBox={`0 0 ${String(ARROW)} ${String(ARROW)}`}>
              <path d={`M0,0 L${String(ARROW)},${String(ARROW / 2)} L0,${String(ARROW)} Z`} fill={marker.fill} />
            </marker>
          ))}
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
        {/* As setas em alerta vêm por último (buildEdges as ordena), e o revestimento delas não esconde as demais. */}
        {edges.map((edge) => (
          <g key={edge.key}>
            <title>{edge.title}</title>
            <path
              d={edge.d}
              fill="none"
              markerEnd={`url(#${markerId}-${edge.alert ? 'alert' : 'muted'})`}
              stroke={edge.alert ? ALERT_STROKE : EDGE_STROKE}
              strokeWidth={edge.alert ? ALERT_WIDTH : EDGE_WIDTH}
            />
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
        {edges.map((edge) => {
          const iconSlot = edge.alert ? ICON_SIZE + ICON_GAP : 0;
          const width = iconSlot + edge.text.length * CHAR_WIDTH;
          const left = edge.beside === null ? edge.x - width / 2 : edge.beside === 'right' ? edge.x + 8 : edge.x - 8 - width;
          return (
            <g key={edge.key}>
              {edge.alert ? <Clock aria-hidden color={ALERT_STROKE} height={ICON_SIZE} strokeWidth={2.25} width={ICON_SIZE} x={left} y={edge.y - ICON_SIZE / 2} /> : null}
              <text
                className="font-display"
                fill={edge.alert ? 'var(--negative)' : 'var(--text-primary)'}
                fontSize={11}
                fontWeight={600}
                style={{ paintOrder: 'stroke', stroke: SURFACE, strokeWidth: 3 }}
                x={left + iconSlot}
                y={edge.y + LABEL_BASELINE}
              >
                {edge.text}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
