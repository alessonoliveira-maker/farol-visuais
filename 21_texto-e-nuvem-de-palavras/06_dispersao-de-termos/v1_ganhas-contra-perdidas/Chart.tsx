import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type TermCount } from './data';

/**
 * Dispersão de termos (scattertext) em rank: cada ponto é um termo, posicionado pela posição dele na
 * lista de frequência das ganhas (horizontal) e das perdidas (vertical). Quem se afasta da diagonal é
 * típico de um grupo; só os termos mais distantes ganham nome, escolhidos por colisão em TypeScript.
 */
export interface TermScatterProps {
  readonly data?: readonly TermCount[];
  readonly height?: number;
  readonly className?: string;
}

type Side = 'ganhas' | 'perdidas' | 'comum';

interface Point {
  readonly id: string;
  readonly term: string;
  /** Posição na lista de frequência das ganhas; 1 é o termo mais citado. */
  readonly x: number;
  /** Posição na lista de frequência das perdidas. */
  readonly y: number;
  readonly ganhas: number;
  readonly perdidas: number;
  readonly side: Side;
  /** Distância até a diagonal em posições; positivo é típico de ganhas. */
  readonly gap: number;
}

type Anchor = 'start' | 'middle' | 'end';

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

const MARGIN = { top: 12, right: 16, bottom: 8, left: 4 } as const;
const Y_AXIS_WIDTH = 40;
/** Diferença de posição a partir da qual o termo conta como típico de um grupo. */
const TYPICAL_GAP = 15;
/** Quantos termos recebem nome, no máximo; o que não couber sem colidir fica sem nome. */
const LABEL_COUNT = 15;
/** Raio da marca em pixels; o ZAxis recebe a área, que é π r² (REC-31). */
const POINT_RADIUS = 4;
const Z_AREA = Math.PI * POINT_RADIUS * POINT_RADIUS;
const LABEL_SIZE = 11;
/** Largura por caractere superestimada de propósito: errar sobrando não quebra nada (GEO-8). */
const LABEL_CHAR_WIDTH = 6.2;
const LABEL_PAD = 3;
/** O ponto dono precisa ficar mais perto da tinta do nome que qualquer outro ponto, por esta folga em px (ROT-7). */
const OWNER_MARGIN = 2;
/** Folga entre a linha de chamada e a marca de outro termo. */
const LEADER_CLEARANCE = POINT_RADIUS + 1;

const SIDE_COLOR: Readonly<Record<Side, string>> = {
  ganhas: 'var(--chart-1)',
  perdidas: 'var(--chart-3)',
  comum: 'var(--text-muted)',
};

/** Candidatas de posição do rótulo ao redor do ponto, da preferida à última. */
const LABEL_CANDIDATES: readonly { readonly dx: number; readonly dy: number; readonly anchor: Anchor }[] = [
  { dx: 8, dy: 4, anchor: 'start' },
  { dx: -8, dy: 4, anchor: 'end' },
  { dx: 0, dy: -9, anchor: 'middle' },
  { dx: 0, dy: 17, anchor: 'middle' },
  { dx: 7, dy: -6, anchor: 'start' },
  { dx: -7, dy: -6, anchor: 'end' },
  { dx: 7, dy: 14, anchor: 'start' },
  { dx: -7, dy: 14, anchor: 'end' },
];

/** Vagas distantes, só para o primeiro termo de cada lado, sempre com linha de chamada até o ponto dono. */
const FAR_OFFSETS: readonly { readonly dx: number; readonly dy: number }[] = [24, 40, 56, 72, 88, 104, 120].flatMap((dx) =>
  [4, -12, 20, -28, 36, 52, 68, 84].flatMap((dy) => [
    { dx, dy },
    { dx: -dx, dy },
  ]),
);

/** Distância da caixa de tinta do nome ao centro de um ponto; zero se o centro está dentro da caixa. */
function gapToBox(box: Box, cx: number, cy: number): number {
  return Math.hypot(Math.max(box.left - cx, 0, cx - box.right), Math.max(box.top - cy, 0, cy - box.bottom));
}

/** Posição de cada valor na lista decrescente; empate recebe a posição média do bloco empatado. */
function midRanks(values: readonly number[]): number[] {
  const order = values.map((value, index) => ({ value, index })).sort((a, b) => b.value - a.value);
  const ranks = new Array<number>(values.length).fill(0);
  let start = 0;
  while (start < order.length) {
    let end = start;
    while (end + 1 < order.length && order[end + 1]?.value === order[start]?.value) end += 1;
    const mid = (start + end) / 2 + 1;
    for (let k = start; k <= end; k += 1) {
      const entry = order[k];
      if (entry) ranks[entry.index] = mid;
    }
    start = end + 1;
  }
  return ranks;
}

function overlaps(a: Box, b: Box, pad: number): boolean {
  return a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
}

function ordinal(rank: number): string {
  return `${formatInt(Math.round(rank))}º`;
}

/**
 * Camada de nomes, desenhada por último para ficar por cima da nuvem (REC-13). Vive dentro
 * do `ScatterChart` porque só ali os hooks de escala respondem, e a colisão precisa dos pixels de todos
 * os pontos ao mesmo tempo. Guloso: percorre os candidatos do mais distante da diagonal para o menos e
 * só aceita a posição que não cobre marca nem outro nome; sem posição livre, o termo fica sem nome.
 */
function TermLayer({
  points,
  candidates,
  must,
}: {
  readonly points: readonly Point[];
  readonly candidates: readonly Point[];
  readonly must: readonly Point[];
}) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  const left = plotArea.x;
  const right = plotArea.x + plotArea.width;
  const top = plotArea.y;
  const bottom = plotArea.y + plotArea.height;

  const obstacles: Box[] = [];
  const centers: { readonly id: string; readonly cx: number; readonly cy: number }[] = [];
  for (const point of points) {
    const cx = xScale(point.x);
    const cy = yScale(point.y);
    if (cx === undefined || cy === undefined) continue;
    centers.push({ id: point.id, cx, cy });
    obstacles.push({ left: cx - POINT_RADIUS, top: cy - POINT_RADIUS, right: cx + POINT_RADIUS, bottom: cy + POINT_RADIUS });
  }

  const placed: { readonly point: Point; readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number; readonly leader: { readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number } | null }[] = [];
  for (const point of candidates) {
    if (placed.length >= LABEL_COUNT) break;
    const cx = xScale(point.x);
    const cy = yScale(point.y);
    if (cx === undefined || cy === undefined) continue;
    const width = point.term.length * LABEL_CHAR_WIDTH;
    let named = false;
    for (const candidate of LABEL_CANDIDATES) {
      const x = cx + candidate.dx;
      const y = cy + candidate.dy;
      const boxLeft = candidate.anchor === 'start' ? x : candidate.anchor === 'end' ? x - width : x - width / 2;
      const box: Box = { left: boxLeft, top: y - LABEL_SIZE + 2, right: boxLeft + width, bottom: y + 2 };
      const foraDoPlano = box.left < left + 1 || box.right > right - 1 || box.top < top || box.bottom > bottom;
      if (foraDoPlano) continue;
      if (obstacles.some((obstacle) => overlaps(box, obstacle, 1))) continue;
      if (placed.some((other) => overlaps(box, other.box, LABEL_PAD))) continue;
      const own = gapToBox(box, cx, cy);
      if (centers.some((c) => c.id !== point.id && gapToBox(box, c.cx, c.cy) < own + OWNER_MARGIN)) continue;
      placed.push({ point, box, anchor: candidate.anchor, x, y, leader: null });
      named = true;
      break;
    }
    if (named || !must.some((m) => m.id === point.id)) continue;
    for (const far of FAR_OFFSETS) {
      const x = cx + far.dx;
      const y = cy + far.dy;
      const anchor: Anchor = far.dx > 0 ? 'start' : 'end';
      const boxLeft = anchor === 'start' ? x : x - width;
      const box: Box = { left: boxLeft, top: y - LABEL_SIZE + 2, right: boxLeft + width, bottom: y + 2 };
      if (box.left < left + 1 || box.right > right - 1 || box.top < top || box.bottom > bottom) continue;
      if (obstacles.some((obstacle) => overlaps(box, obstacle, 1))) continue;
      if (placed.some((other) => overlaps(box, other.box, LABEL_PAD))) continue;
      const nx = Math.min(Math.max(cx, box.left), box.right);
      const ny = Math.min(Math.max(cy, box.top), box.bottom);
      const length = Math.hypot(nx - cx, ny - cy);
      if (length <= POINT_RADIUS + 3) continue;
      let crosses = false;
      for (let t = POINT_RADIUS + 1; t < length && !crosses; t += 2) {
        const px = cx + ((nx - cx) * t) / length;
        const py = cy + ((ny - cy) * t) / length;
        crosses =
          centers.some((c) => c.id !== point.id && Math.hypot(px - c.cx, py - c.cy) < LEADER_CLEARANCE) ||
          placed.some((other) => px > other.box.left - 1 && px < other.box.right + 1 && py > other.box.top - 1 && py < other.box.bottom + 1);
      }
      if (crosses) continue;
      const k = (length - 1.5) / length;
      const k0 = (POINT_RADIUS + 1) / length;
      placed.push({ point, box, anchor, x, y, leader: { x1: cx + (nx - cx) * k0, y1: cy + (ny - cy) * k0, x2: cx + (nx - cx) * k, y2: cy + (ny - cy) * k } });
      break;
    }
  }

  return (
    <g>
      {placed.map((item) =>
        item.leader ? (
          <line key={`chamada-${item.point.id}`} stroke="var(--text-muted)" strokeWidth={1} x1={item.leader.x1} x2={item.leader.x2} y1={item.leader.y1} y2={item.leader.y2} />
        ) : null,
      )}
      {placed.map((item) => (
        <text
          fill="var(--text-primary)"
          fontSize={LABEL_SIZE}
          fontWeight={600}
          key={`nome-${item.point.id}`}
          style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
          textAnchor={item.anchor}
          x={item.x}
          y={item.y}
        >
          {item.point.term}
        </text>
      ))}
    </g>
  );
}

export default function TermScatter({ data = defaultData, height, className }: TermScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum termo neste recorte: sem anotações de ganhas e de perdidas, não há o que comparar.</span>
      </div>
    );
  }

  const rankGanhas = midRanks(data.map((row) => row.ganhas));
  const rankPerdidas = midRanks(data.map((row) => row.perdidas));
  const points: Point[] = data.map((row, index) => {
    const x = rankGanhas[index] ?? data.length;
    const y = rankPerdidas[index] ?? data.length;
    const gap = y - x;
    const side: Side = gap >= TYPICAL_GAP ? 'ganhas' : gap <= -TYPICAL_GAP ? 'perdidas' : 'comum';
    return { id: row.id, term: row.term, x, y, ganhas: row.ganhas, perdidas: row.perdidas, side, gap };
  });
  const candidates = [...points].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap) || (a.term < b.term ? -1 : 1));
  const porLado = (side: Side) => points.filter((point) => point.side === side);
  const tipicosGanhas = porLado('ganhas');
  const tipicosPerdidas = porLado('perdidas');
  const comuns = porLado('comum');
  const topGanhas = candidates.find((point) => point.gap > 0);
  const topPerdidas = candidates.find((point) => point.gap < 0);
  const must = [topGanhas, topPerdidas].filter((point): point is Point => point !== undefined);

  /** Eixo igual nos dois lados, no múltiplo de 25 acima da lista; quatro linhas de grade (EIX-4). */
  const rankMax = Math.ceil(data.length / 25) * 25;
  const rankTicks = [1, 2, 3, 4].map((step) => (step * rankMax) / 4);

  const summary =
    `Gráfico de dispersão de ${formatInt(points.length)} termos, com a posição de cada um entre as ganhas no eixo horizontal e entre as perdidas no vertical. ` +
    `${formatInt(tipicosGanhas.length)} são típicos de ganhas e ${formatInt(tipicosPerdidas.length)} de perdidas` +
    (topGanhas && topPerdidas ? `; os mais distantes da diagonal são ${topGanhas.term} e ${topPerdidas.term}.` : '.');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'ganhas', name: 'Ganhas', value: `${ordinal(point.x)}, ${formatInt(point.ganhas)} anotações` },
      { dataKey: 'perdidas', name: 'Perdidas', value: `${ordinal(point.y)}, ${formatInt(point.perdidas)} anotações` },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.term} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 shrink-0 text-xs tabular-nums text-text-secondary">
        {`${formatInt(tipicosGanhas.length)} termos típicos de ganhas, ${formatInt(tipicosPerdidas.length)} de perdidas e ${formatInt(comuns.length)} comuns aos dois`}
      </p>
      <div aria-hidden className="flex shrink-0 items-center justify-between gap-2 pl-11 pr-4 text-[0.6875rem] text-text-muted">
        <span className="flex items-center gap-1 font-semibold text-text-secondary">
          <span className="size-2 rounded-full bg-chart-1" />
          Típico de ganhas
        </span>
        <span>Eixo vertical: posição entre as perdidas</span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            {/* axisLine={false} depois do espalhamento: o AXIS_PROPS liga a linha de eixo e a ordem decide (REC-30). */}
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="x"
              domain={[0, rankMax]}
              name="Ganhas"
              tickFormatter={(value: number) => ordinal(value)}
              tickLine={false}
              tickMargin={8}
              ticks={rankTicks}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="y"
              domain={[0, rankMax]}
              name="Perdidas"
              tickFormatter={(value: number) => ordinal(value)}
              tickLine={false}
              tickMargin={8}
              ticks={rankTicks}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[Z_AREA, Z_AREA]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {/* ifOverflow extendDomain: sem ele a diagonal sumiria se o domínio encolhesse (REC-1). */}
            <ReferenceLine
              ifOverflow="extendDomain"
              segment={[
                { x: 0, y: 0 },
                { x: rankMax, y: rankMax },
              ]}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <Scatter data={comuns} fill={SIDE_COLOR.comum} isAnimationActive={animate} stroke="var(--surface-raised)" />
            <Scatter data={tipicosGanhas} fill={SIDE_COLOR.ganhas} isAnimationActive={animate} stroke="var(--surface-raised)" />
            <Scatter data={tipicosPerdidas} fill={SIDE_COLOR.perdidas} isAnimationActive={animate} stroke="var(--surface-raised)" />
            <TermLayer candidates={candidates} must={must} points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="flex shrink-0 items-center justify-between gap-2 pl-11 pr-4 text-[0.6875rem] text-text-muted">
        <span>Eixo horizontal: posição entre as ganhas</span>
        <span className="flex items-center gap-1 font-semibold text-text-secondary">
          <span className="size-2 rounded-full bg-chart-3" />
          Típico de perdidas
        </span>
      </div>
      <p aria-hidden className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">
        {`1º é o mais citado; diagonal: mesma posição nos dois; típico: ${formatInt(TYPICAL_GAP)} posições de diferença. O nome sai onde cabe, só quando o ponto dele é o mais próximo; o mais distante de cada lado leva linha de chamada se preciso.`}
      </p>
    </div>
  );
}
