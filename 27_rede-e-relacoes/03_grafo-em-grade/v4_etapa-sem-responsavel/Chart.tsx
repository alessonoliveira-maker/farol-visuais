import { useId } from 'react';
import { Filter } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OwnershipGrid, type Passage } from './data';

/**
 * Grafo em grade em SVG puro que mostra a ausência: a célula esperada que ninguém assumiu sai com
 * contorno tracejado e o texto "sem responsável definido", e a seta que chega nela não sai dela.
 * A célula vazia e contínua é outra coisa: a função não atua naquela etapa. Responde em qual etapa
 * do handoff não há dono, e quanto do processo passa por ali.
 */
export interface OwnershipGridGraphProps {
  readonly data?: OwnershipGrid;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox repete o corpo medido do cartão `card` (574 px), para a escala sair 1 e os 11 px valerem na tela (GEO-18). */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 222;
const STAGE_LABEL_WIDTH = 90;
const MARGIN_RIGHT = 6;
const HEADER_HEIGHT = 22;
/** Duas linhas de rodapé: a contagem e a legenda das duas células vazias. */
const FOOTER_HEIGHT = 34;
const NODE_WIDTH = 108;
const NODE_HEIGHT = 22;
/** Respiro entre o contorno tracejado e as linhas da grade. */
const GAP_INSET = 3;
const CORNER = 8;
const ARROW = 7;
const EDGE_WIDTH = 1.5;
/** ACE-6: a seta é o dado. `--line-strong` mede 1,79:1; `--text-muted` mede 5,21:1 e 5,37:1. */
const EDGE_STROKE = 'var(--text-muted)';
const SURFACE = 'var(--surface-raised)';
/** Traço 3 3 da célula sem dono e da seta que chega nela. */
const DASH = '3 3';

interface Place {
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly top: number;
  readonly left: number;
  readonly label: string;
  readonly owned: boolean;
}

interface Geometry {
  readonly cellWidth: number;
  readonly rowHeight: number;
  readonly places: ReadonlyMap<string, Place>;
}

function buildGeometry(data: OwnershipGrid): Geometry {
  const cellWidth = (VIEW_WIDTH - STAGE_LABEL_WIDTH - MARGIN_RIGHT) / Math.max(data.columns.length, 1);
  const rowHeight = (VIEW_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT) / Math.max(data.rows.length, 1);
  const places = new Map<string, Place>();
  const entries = [
    ...data.nodes.map((node) => ({ ...node, owned: true })),
    ...data.gaps.map((gap) => ({ ...gap, label: '', owned: false })),
  ];
  for (const entry of entries) {
    const col = data.columns.findIndex((column) => column.id === entry.column);
    const row = data.rows.findIndex((stage) => stage.id === entry.row);
    if (col < 0 || row < 0) continue;
    const left = STAGE_LABEL_WIDTH + col * cellWidth;
    const top = HEADER_HEIGHT + row * rowHeight;
    places.set(entry.id, { id: entry.id, cx: left + cellWidth / 2, cy: top + rowHeight / 2, top, left, label: entry.label, owned: entry.owned });
  }
  return { cellWidth, rowHeight, places };
}

/**
 * Sai pela direita do nó, corre até a coluna do destino e desce até o topo dele, com o canto
 * arredondado. Não há pista entre linhas, então o número cabe sobre o trecho horizontal.
 */
function sidePath(sx: number, sy: number, tx: number, ty: number): string {
  const r = Math.max(Math.min(CORNER, tx - sx, ty - sy), 0);
  return [
    `M ${String(sx)},${String(sy)}`,
    `H ${String(tx - r)}`,
    `Q ${String(tx)},${String(sy)} ${String(tx)},${String(sy + r)}`,
    `V ${String(ty)}`,
  ].join(' ');
}

interface DrawnEdge {
  readonly key: string;
  readonly d: string;
  readonly toGap: boolean;
  readonly count: number;
  readonly x: number;
  readonly y: number;
  readonly title: string;
}

function buildEdges(edges: readonly Passage[], geometry: Geometry): DrawnEdge[] {
  const drawn: DrawnEdge[] = [];
  for (const edge of edges) {
    const a = geometry.places.get(edge.from);
    const b = geometry.places.get(edge.to);
    if (a === undefined || b === undefined || b.top <= a.top || b.cx <= a.cx) continue;
    const sx = a.cx + NODE_WIDTH / 2;
    const ty = (b.owned ? b.cy - NODE_HEIGHT / 2 : b.top + GAP_INSET) - 1;
    const where = b.owned ? b.label : 'célula sem responsável';
    drawn.push({
      key: `${edge.from}>${edge.to}`,
      d: sidePath(sx, a.cy, b.cx, ty),
      toGap: !b.owned,
      count: edge.count,
      x: (sx + b.cx) / 2,
      y: a.cy - 8,
      title: `${a.label} para ${where}: ${formatInt(edge.count)} ${passageNoun(edge.count)}`,
    });
  }
  return drawn;
}

function passageNoun(count: number): string {
  return count === 1 ? 'oportunidade' : 'oportunidades';
}

export default function OwnershipGridGraph({ data = defaultData, height, className }: OwnershipGridGraphProps) {
  const markerId = useId();
  const style = height === undefined ? undefined : { height };

  if (data.nodes.length === 0 && data.gaps.length === 0) {
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
  const edges = buildEdges(data.edges, geometry);
  const cells = data.columns.length * data.rows.length;
  const gapCount = data.gaps.length;
  const reaching = data.edges
    .filter((edge) => data.gaps.some((gap) => gap.id === edge.to))
    .reduce((sum, edge) => sum + edge.count, 0);
  const firstGap = data.gaps[0];
  const gapRow = data.rows.find((row) => row.id === firstGap?.row)?.label.toLowerCase() ?? '';
  const gapColumn = data.columns.find((column) => column.id === firstGap?.column)?.label.toLowerCase() ?? '';
  const where = firstGap === undefined ? '' : ` A etapa de ${gapRow}, na função ${gapColumn}, recebe ${formatInt(reaching)} ${passageNoun(reaching)} e não tem dono.`;
  const countText = `${formatInt(gapCount)} de ${formatInt(cells)} células sem responsável definido`;
  const summary = `Grafo em grade de ${formatInt(data.nodes.length)} nós em ${formatInt(data.columns.length)} funções por ${formatInt(data.rows.length)} etapas no ${data.period}: ${countText}.${where}`;
  const legendY = VIEW_HEIGHT - 4;

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
        {/* Célula sem dono: contorno tracejado e texto escrito, para a ausência não passar por célula que não se aplica. */}
        {data.gaps.map((gap) => {
          const place = geometry.places.get(gap.id);
          if (place === undefined) return null;
          return (
            <g key={gap.id}>
              <rect fill="none" height={geometry.rowHeight - 2 * GAP_INSET} rx={4} stroke="var(--text-muted)" strokeDasharray={DASH} strokeWidth={1.5} width={geometry.cellWidth - 8} x={place.left + 4} y={place.top + GAP_INSET} />
              <text className="font-sans" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor="middle">
                <tspan x={place.cx} y={place.cy - 1.5}>
                  Sem responsável
                </tspan>
                <tspan x={place.cx} y={place.cy + 10.5}>
                  definido
                </tspan>
              </text>
            </g>
          );
        })}
        {edges.map((edge) => (
          <g key={edge.key}>
            <title>{edge.title}</title>
            <path d={edge.d} fill="none" markerEnd={`url(#${markerId})`} stroke={EDGE_STROKE} strokeDasharray={edge.toGap ? DASH : undefined} strokeWidth={EDGE_WIDTH} />
          </g>
        ))}
        {data.nodes.map((node) => {
          const place = geometry.places.get(node.id);
          if (place === undefined) return null;
          return (
            <g key={node.id}>
              <rect fill="var(--surface-sunken)" height={NODE_HEIGHT} rx={6} stroke="var(--line-strong)" strokeWidth={1.5} width={NODE_WIDTH} x={place.cx - NODE_WIDTH / 2} y={place.cy - NODE_HEIGHT / 2} />
              <text className="font-sans" fill="var(--text-primary)" fontSize={12} fontWeight={500} textAnchor="middle" x={place.cx} y={place.cy + 4}>
                {node.label}
              </text>
            </g>
          );
        })}
        {/* Halo na cor do cartão: o número fica legível onde cruza a grade (ROT-7). */}
        {edges.map((edge) => (
          <text
            className="font-display"
            fill="var(--text-primary)"
            fontSize={11}
            fontWeight={600}
            key={edge.key}
            style={{ paintOrder: 'stroke', stroke: SURFACE, strokeWidth: 4 }}
            textAnchor="middle"
            x={edge.x}
            y={edge.y + 4}
          >
            {formatInt(edge.count)}
          </text>
        ))}
        <text className="font-sans" fill="var(--text-primary)" fontSize={12} fontWeight={700} x={0} y={legendY - 14}>
          {countText}
        </text>
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={VIEW_WIDTH} y={legendY - 14}>
          {`Oportunidades nas setas, ${data.period}`}
        </text>
        <rect fill="none" height={8} rx={2} stroke="var(--text-muted)" strokeDasharray={DASH} strokeWidth={1.5} width={14} x={0} y={legendY - 8} />
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={20} y={legendY}>
          Etapa esperada sem dono
        </text>
        <rect fill="none" height={8} rx={2} stroke="var(--line-subtle)" width={14} x={162} y={legendY - 8} />
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={182} y={legendY}>
          Função que não atua na etapa
        </text>
      </svg>
    </figure>
  );
}
