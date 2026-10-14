import { useId } from 'react';
import { Filter } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type QueueGrid, type QueueNode, type Redistribution } from './data';

/**
 * Grafo em grade em SVG puro para redistribuição de leads entre filas: célula com mais de uma fila
 * vira pilha com contagem, as pontas de várias setas na mesma célula se deslocam, a espessura vai
 * em três faixas e o retorno a uma etapa anterior corre por fora da grade. O caminho do nó
 * selecionado acende em `--chart-1` e o resto fica no neutro.
 */
export interface QueueGridGraphProps {
  readonly data?: QueueGrid;
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox repete o corpo do cartão `alto` (574 px) menos a linha de leitura e a legenda, para a escala sair 1 (GEO-18). */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 372;
const STAGE_LABEL_WIDTH = 90;
/** Margem direita reservada ao corredor das setas de retorno. */
const MARGIN_RIGHT = 36;
const CORRIDOR_GAP = 16;
const HEADER_HEIGHT = 22;
const NODE_WIDTH = 92;
const NODE_HEIGHT = 30;
/** Cada fila a mais da pilha aparece como uma folha 4 px mais à direita; a pilha cabe até 3 filas na célula. */
const STACK_STEP = 4;
/** Passo entre as pontas de setas que chegam ou saem da mesma célula. */
const PORT_STEP = 14;
const CORNER = 8;
const ARROW = 9;
/** A pista corre a 62% do vão entre as duas etapas: o número fica acima dela, dentro do vão, e a ponta da seta tem chão. */
const LANE_SHARE = 0.62;
/** Distância do centro do número à pista que ele rotula. */
const LABEL_RISE = 8;
/** Recuo do número de uma seta vertical reta, que o escreve ao lado dela, e largura que ele ocupa. */
const SIDE_GAP = 8;
const SIDE_ROOM = 40;
/** Opacidade do neutro fora do caminho: `--text-muted` composto sobre o cartão mede 3,58:1 no escuro e 3,28:1 no claro (ACE-5). */
const DIM_OPACITY = 0.76;
const BANDS = [
  { name: 'pouco', width: 1.5 },
  { name: 'médio', width: 3 },
  { name: 'muito', width: 5 },
] as const;
/** ACE-6: a seta é o dado. `--line-strong` mede 1,79:1; `--text-muted` mede 5,21:1 e 5,37:1. */
const EDGE_STROKE = 'var(--text-muted)';
const LIT_STROKE = 'var(--chart-1)';
const SURFACE = 'var(--surface-raised)';

interface Placed {
  readonly node: QueueNode;
  readonly cx: number;
  readonly cy: number;
  readonly col: number;
  readonly row: number;
}

interface Cell {
  readonly key: string;
  readonly cx: number;
  readonly cy: number;
  readonly nodes: readonly QueueNode[];
}

interface Geometry {
  readonly cellWidth: number;
  readonly rowHeight: number;
  readonly placed: ReadonlyMap<string, Placed>;
  readonly cells: readonly Cell[];
}

function cellKey(place: Placed): string {
  return `${String(place.col)}|${String(place.row)}`;
}

function buildGeometry(data: QueueGrid): Geometry {
  const cellWidth = (VIEW_WIDTH - STAGE_LABEL_WIDTH - MARGIN_RIGHT) / Math.max(data.columns.length, 1);
  const rowHeight = (VIEW_HEIGHT - HEADER_HEIGHT) / Math.max(data.rows.length, 1);
  const placed = new Map<string, Placed>();
  const grouped = new Map<string, { cx: number; cy: number; nodes: QueueNode[] }>();
  for (const node of data.nodes) {
    const col = data.columns.findIndex((column) => column.id === node.column);
    const row = data.rows.findIndex((stage) => stage.id === node.row);
    if (col < 0 || row < 0) continue;
    const place = {
      node,
      cx: STAGE_LABEL_WIDTH + (col + 0.5) * cellWidth,
      cy: HEADER_HEIGHT + (row + 0.5) * rowHeight,
      col,
      row,
    };
    placed.set(node.id, place);
    const key = cellKey(place);
    grouped.set(key, { cx: place.cx, cy: place.cy, nodes: [...(grouped.get(key)?.nodes ?? []), node] });
  }
  const cells = [...grouped].map(([key, cell]) => ({ key, ...cell }));
  return { cellWidth, rowHeight, placed, cells };
}

function edgeKey(edge: Redistribution): string {
  return `${edge.from}>${edge.to}`;
}

/** Aresta para uma etapa anterior é retorno e corre por fora da grade; as demais descem. */
function isReturn(edge: Redistribution, placed: ReadonlyMap<string, Placed>): boolean {
  return (placed.get(edge.to)?.row ?? 0) < (placed.get(edge.from)?.row ?? 0);
}

/** Ponta de cada seta na célula: as que dividem o mesmo lado se ordenam pelo centro do vizinho e ganham um passo cada. */
function portOffsets(
  edges: readonly Redistribution[],
  placed: ReadonlyMap<string, Placed>,
  side: 'from' | 'to',
): Map<string, number> {
  const other = side === 'from' ? 'to' : 'from';
  const grouped = new Map<string, Redistribution[]>();
  for (const edge of edges) {
    const own = placed.get(edge[side]);
    if (own === undefined || isReturn(edge, placed) || (placed.get(edge.to)?.row ?? 0) === (placed.get(edge.from)?.row ?? 0)) continue;
    grouped.set(cellKey(own), [...(grouped.get(cellKey(own)) ?? []), edge]);
  }
  const offsets = new Map<string, number>();
  for (const group of grouped.values()) {
    const sorted = [...group].sort((a, b) => (placed.get(a[other])?.cx ?? 0) - (placed.get(b[other])?.cx ?? 0));
    sorted.forEach((edge, index) => offsets.set(edgeKey(edge), (index - (sorted.length - 1) / 2) * PORT_STEP));
  }
  return offsets;
}

/**
 * Ortogonal com cantos arredondados: desce da base da célula até a pista da etapa, corre de lado e
 * desce até o topo do destino. Seta na mesma coluna é uma vertical reta.
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

/** Retorno: sai pela direita da célula, sobe pelo corredor fora da grade e entra pela direita do destino, sem cruzar nó. */
function returnPath(sx: number, sy: number, tx: number, ty: number, corridorX: number): string {
  return [
    `M ${String(sx)},${String(sy)}`,
    `H ${String(corridorX - CORNER)}`,
    `Q ${String(corridorX)},${String(sy)} ${String(corridorX)},${String(sy - CORNER)}`,
    `V ${String(ty + CORNER)}`,
    `Q ${String(corridorX)},${String(ty)} ${String(corridorX - CORNER)},${String(ty)}`,
    `H ${String(tx)}`,
  ].join(' ');
}

interface DrawnEdge {
  readonly key: string;
  readonly d: string;
  readonly lit: boolean;
  readonly width: number;
  readonly count: number;
  readonly x: number;
  readonly y: number;
  readonly anchor: 'start' | 'middle' | 'end';
  readonly title: string;
}

interface Band {
  readonly name: string;
  readonly width: number;
  readonly from: number;
  readonly to: number;
}

/** ROT-5b: as três faixas repartem o intervalo de 1 ao maior volume OBSERVADO; faixa sem inteiro dentro sai. */
function buildBands(maxCount: number): Band[] {
  const cuts = [0, Math.floor(maxCount / 3), Math.floor((2 * maxCount) / 3), maxCount];
  return BANDS.map((band, index) => ({ ...band, from: (cuts[index] ?? 0) + 1, to: cuts[index + 1] ?? maxCount })).filter(
    (band) => band.from <= band.to,
  );
}

/** Arestas do caminho do nó: tudo que ele recebe, na ordem inversa, e tudo que ele entrega, adiante. */
function pathEdges(edges: readonly Redistribution[], start: string): Set<string> {
  const keys = new Set<string>();
  for (const forward of [true, false]) {
    const seen = new Set([start]);
    const queue = [start];
    for (let id = queue.pop(); id !== undefined; id = queue.pop()) {
      for (const edge of edges) {
        if ((forward ? edge.from : edge.to) !== id) continue;
        keys.add(edgeKey(edge));
        const next = forward ? edge.to : edge.from;
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
  }
  return keys;
}

function stackExtra(cells: readonly Cell[], place: Placed): number {
  const size = cells.find((cell) => cell.key === cellKey(place))?.nodes.length ?? 1;
  return (Math.min(size, 3) - 1) * STACK_STEP;
}

function buildEdges(data: QueueGrid, geometry: Geometry, lit: ReadonlySet<string>, bands: readonly Band[]): DrawnEdge[] {
  const { placed, rowHeight, cells } = geometry;
  const outs = portOffsets(data.edges, placed, 'from');
  const ins = portOffsets(data.edges, placed, 'to');
  const corridorX = STAGE_LABEL_WIDTH + data.columns.length * geometry.cellWidth + CORRIDOR_GAP;
  const lanes: { readonly row: number; readonly min: number; readonly max: number }[] = [];
  const pending: { readonly edge: Redistribution; readonly a: Placed; readonly b: Placed; readonly x0: number; readonly x1: number }[] = [];
  for (const edge of data.edges) {
    const a = placed.get(edge.from);
    const b = placed.get(edge.to);
    if (a === undefined || b === undefined || a.row === b.row || isReturn(edge, placed)) continue;
    const key = edgeKey(edge);
    // Vertical reta: os dois lados usam a ponta do destino, para a seta não ganhar um desvio de poucos pixels.
    const x1 = b.cx + (ins.get(key) ?? 0);
    const x0 = Math.abs(a.cx - b.cx) < 0.5 ? x1 : a.cx + (outs.get(key) ?? 0);
    if (Math.abs(x1 - x0) >= 0.5) lanes.push({ row: a.row, min: Math.min(x0, x1), max: Math.max(x0, x1) });
    pending.push({ edge, a, b, x0, x1 });
  }
  const widthOf = (count: number): number => bands.find((band) => count <= band.to)?.width ?? BANDS[0].width;
  const drawn: DrawnEdge[] = pending.map(({ edge, a, b, x0, x1 }) => {
    const y0 = a.cy + NODE_HEIGHT / 2;
    const y1 = b.cy - NODE_HEIGHT / 2 - 1;
    const laneY = y0 + (rowHeight - NODE_HEIGHT) * LANE_SHARE;
    const straight = Math.abs(x1 - x0) < 0.5;
    // Vertical reta escreve à direita, salvo quando uma pista da mesma etapa passa por ali.
    const crowded = lanes.some((lane) => lane.row === a.row && lane.min < x0 + SIDE_ROOM && lane.max > x0);
    return {
      key: edgeKey(edge),
      d: downPath(x0, y0, x1, y1, laneY),
      lit: lit.has(edgeKey(edge)),
      width: widthOf(edge.count),
      count: edge.count,
      x: straight ? x0 + (crowded ? -SIDE_GAP : SIDE_GAP) : (x0 + x1) / 2,
      y: straight ? (y0 + y1) / 2 : laneY - LABEL_RISE,
      anchor: straight ? (crowded ? 'end' : 'start') : 'middle',
      title: `${a.node.label} para ${b.node.label}: ${formatInt(edge.count)} ${leadNoun(edge.count)}`,
    };
  });
  for (const edge of data.edges) {
    const a = placed.get(edge.from);
    const b = placed.get(edge.to);
    if (a === undefined || b === undefined || !isReturn(edge, placed)) continue;
    drawn.push({
      key: edgeKey(edge),
      d: returnPath(a.cx + NODE_WIDTH / 2 + stackExtra(cells, a), a.cy, b.cx + NODE_WIDTH / 2 + stackExtra(cells, b) + 1, b.cy, corridorX),
      lit: lit.has(edgeKey(edge)),
      width: widthOf(edge.count),
      count: edge.count,
      x: corridorX - SIDE_GAP,
      y: (a.cy + b.cy) / 2,
      anchor: 'end',
      title: `Retorno de ${a.node.label} para ${b.node.label}: ${formatInt(edge.count)} ${leadNoun(edge.count)}`,
    });
  }
  // As setas do caminho aceso vêm por último e ficam por cima das demais.
  return drawn.sort((x, y) => Number(x.lit) - Number(y.lit));
}

function leadNoun(count: number): string {
  return count === 1 ? 'lead' : 'leads';
}

function passageNoun(count: number): string {
  return count === 1 ? 'passagem' : 'passagens';
}

export default function QueueGridGraph({ data = defaultData, highlightId = defaultHighlightId, height, className }: QueueGridGraphProps) {
  const markerId = useId();
  const style = height === undefined ? undefined : { height };

  if (data.nodes.length === 0 || data.edges.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma redistribuição neste recorte: nenhum lead trocou de fila entre as etapas no período.</span>
      </div>
    );
  }

  const geometry = buildGeometry(data);
  const maxCount = data.edges.reduce((max, edge) => Math.max(max, edge.count), 0);
  const bands = buildBands(maxCount);
  const lit = pathEdges(data.edges, highlightId);
  const edges = buildEdges(data, geometry, lit, bands);
  const selected = data.nodes.find((node) => node.id === highlightId);
  const litSum = data.edges.filter((edge) => lit.has(edgeKey(edge))).reduce((sum, edge) => sum + edge.count, 0);
  const returns = data.edges.filter((edge) => isReturn(edge, geometry.placed)).length;
  const stacks = geometry.cells.filter((cell) => cell.nodes.length > 1).length;
  const pathText =
    selected === undefined ? 'Nenhum caminho aceso.' : ` O caminho aceso parte de ${selected.label.toLowerCase()} e soma ${formatInt(litSum)} ${leadNoun(litSum)} em ${formatInt(lit.size)} ${passageNoun(lit.size)}.`;
  const summary = `Grafo em grade de ${formatInt(data.nodes.length)} filas em ${formatInt(data.columns.length)} origens por ${formatInt(data.rows.length)} etapas, com ${formatInt(data.edges.length)} passagens, ${formatInt(returns)} de retorno, e ${formatInt(stacks)} ${stacks === 1 ? 'pilha' : 'pilhas'}.${pathText}`;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        {selected === undefined ? (
          'Nenhum caminho aceso.'
        ) : (
          <>
            Caminho aceso: <span className="font-semibold text-text-primary">{selected.label}</span>,{' '}
            <span className="tabular-nums">{formatInt(lit.size)}</span> {passageNoun(lit.size)} que somam{' '}
            <span className="font-semibold tabular-nums text-text-primary">{formatInt(litSum)}</span> {leadNoun(litSum)}.
          </>
        )}
      </p>
      <div className="mb-2 flex shrink-0 items-center gap-x-4 text-[0.6875rem] leading-4 text-text-muted">
        <span>Leads por passagem:</span>
        {bands.map((band) => (
          <span className="flex items-center gap-1.5" key={band.name}>
            <span aria-hidden className="w-5 shrink-0 rounded-full" style={{ height: band.width, backgroundColor: EDGE_STROKE }} />
            <span className="tabular-nums">
              {band.from === band.to ? formatInt(band.from) : `${formatInt(band.from)} a ${formatInt(band.to)}`}
            </span>
          </span>
        ))}
        <span className="ml-auto">Seta por fora da grade: retorno</span>
      </div>
      {/* xMidYMin: sobrando altura no cartão, a grade fica colada ao que vem acima e a escala segue 1. */}
      <svg aria-hidden className="min-h-0 w-full flex-1" preserveAspectRatio="xMidYMin meet" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        <defs>
          {[
            { id: `${markerId}-dim`, fill: EDGE_STROKE, opacity: DIM_OPACITY },
            { id: `${markerId}-lit`, fill: LIT_STROKE, opacity: 1 },
          ].map((marker) => (
            <marker id={marker.id} key={marker.id} markerHeight={ARROW} markerUnits="userSpaceOnUse" markerWidth={ARROW} orient="auto" refX={ARROW - 1} refY={ARROW / 2} viewBox={`0 0 ${String(ARROW)} ${String(ARROW)}`}>
              <path d={`M0,0 L${String(ARROW)},${String(ARROW / 2)} L0,${String(ARROW)} Z`} fill={marker.fill} fillOpacity={marker.opacity} />
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
        {edges.map((edge) => (
          <g key={edge.key}>
            <title>{edge.title}</title>
            <path
              d={edge.d}
              fill="none"
              markerEnd={`url(#${markerId}-${edge.lit ? 'lit' : 'dim'})`}
              stroke={edge.lit ? LIT_STROKE : EDGE_STROKE}
              strokeOpacity={edge.lit ? 1 : DIM_OPACITY}
              strokeWidth={edge.width}
            />
          </g>
        ))}
        {geometry.cells.map((cell) => {
          const size = cell.nodes.length;
          const isSelected = cell.nodes.some((node) => node.id === highlightId);
          const x = cell.cx - NODE_WIDTH / 2;
          const y = cell.cy - NODE_HEIGHT / 2;
          return (
            <g key={cell.key}>
              {/* Folhas da pilha por trás, da mais distante para a da frente, 4 px mais à direita cada uma. */}
              {Array.from({ length: Math.min(size, 3) - 1 }, (_, k) => Math.min(size, 3) - 1 - k).map((offset) => (
                <rect fill="var(--surface-sunken)" height={NODE_HEIGHT} key={offset} rx={6} stroke="var(--line-strong)" strokeWidth={1.5} width={NODE_WIDTH} x={x + offset * STACK_STEP} y={y} />
              ))}
              <rect fill="var(--surface-sunken)" height={NODE_HEIGHT} rx={6} stroke={isSelected ? LIT_STROKE : 'var(--line-strong)'} strokeWidth={isSelected ? 2 : 1.5} width={NODE_WIDTH} x={x} y={y} />
              <text className="font-sans" fill="var(--text-primary)" fontSize={12} fontWeight={isSelected || size > 1 ? 700 : 500} textAnchor="middle" x={cell.cx} y={cell.cy + 4}>
                {size > 1 ? `${formatInt(size)} filas` : (cell.nodes[0]?.label ?? '')}
              </text>
            </g>
          );
        })}
        {edges.map((edge) => (
          <text
            className="font-display"
            fill={edge.lit ? LIT_STROKE : 'var(--text-secondary)'}
            fontSize={11}
            fontWeight={600}
            key={edge.key}
            style={{ paintOrder: 'stroke', stroke: SURFACE, strokeWidth: 4 }}
            textAnchor={edge.anchor}
            x={edge.x}
            y={edge.y + 4}
          >
            {formatInt(edge.count)}
          </text>
        ))}
      </svg>
    </figure>
  );
}
