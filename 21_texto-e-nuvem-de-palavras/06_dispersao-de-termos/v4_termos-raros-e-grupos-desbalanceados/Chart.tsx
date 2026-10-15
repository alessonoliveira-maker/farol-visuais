import { Filter, TriangleAlert } from 'lucide-react';
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
import { formatDecimal, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type GroupedTerms } from './data';

/**
 * Dispersão de termos com grupos desbalanceados: cada eixo é a proporção das anotações do grupo que
 * citam o termo, e não a contagem, para o grupo grande não dominar. Os termos que aparecem uma vez em
 * cada grupo vão num marcador único com a contagem; termo presente num grupo só fica sobre o eixo, e
 * grupo com poucas anotações ganha aviso.
 */
export interface RareTermsScatterProps {
  readonly data?: GroupedTerms;
  readonly height?: number;
  readonly className?: string;
}

type Side = 'telefone' | 'video' | 'comum';

interface Point {
  readonly id: string;
  readonly term: string;
  /** Proporção das anotações de telefone que citam o termo, de 0 a 1. */
  readonly x: number;
  /** Proporção das anotações de vídeo que citam o termo, de 0 a 1. */
  readonly y: number;
  readonly telefone: number;
  readonly video: number;
  readonly side: Side;
  /** Proporção no telefone menos a de vídeo; positivo é mais citado no telefone. */
  readonly diff: number;
}

type Anchor = 'start' | 'middle' | 'end';

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

interface RareMarker {
  readonly x: number;
  readonly y: number;
  readonly count: number;
}

const MARGIN = { top: 12, right: 16, bottom: 12, left: 4 } as const;
const Y_AXIS_WIDTH = 44;
/** Diferença de proporção, em pontos de 0 a 1, a partir da qual o termo conta como típico de um grupo. */
const TYPICAL_DIFF = 0.05;
/** Abaixo disto o grupo é pequeno: uma menção a mais pesa mais de 2 pontos percentuais. */
const SMALL_GROUP = 50;
/** Menções em cada grupo que mandam o termo para o marcador único. */
const RARE_MENTIONS = 1;
/** Quantos termos recebem nome, além do marcador único. */
const LABEL_COUNT = 10;
/** Raio da marca em pixels; o ZAxis recebe a área, que é π r² (REC-31). */
const POINT_RADIUS = 4;
const Z_AREA = Math.PI * POINT_RADIUS * POINT_RADIUS;
const RARE_RADIUS = 8;
const LABEL_SIZE = 11;
/** Largura por caractere superestimada de propósito: errar sobrando não quebra nada (GEO-8). */
const LABEL_CHAR_WIDTH = 6.2;
const LABEL_PAD = 3;
/** O ponto dono precisa ficar mais perto da tinta do nome que qualquer outro ponto, por esta folga em px (ROT-7). */
const OWNER_MARGIN = 2;

const SIDE_COLOR: Readonly<Record<Side, string>> = {
  telefone: 'var(--chart-1)',
  video: 'var(--chart-3)',
  comum: 'var(--text-muted)',
};

/** Candidatas de posição do nome ao redor da marca, da preferida à última. */
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

/** Distância da caixa de tinta do nome ao centro de um ponto; zero se o centro está dentro da caixa. */
function gapToBox(box: Box, cx: number, cy: number): number {
  return Math.hypot(Math.max(box.left - cx, 0, cx - box.right), Math.max(box.top - cy, 0, cy - box.bottom));
}

/** Proporção de anotações do grupo; `null` sem anotação, porque proporção sem base é ausência e não zero. */
function share(mentions: number, annotations: number): number | null {
  if (annotations <= 0) return null;
  return mentions / annotations;
}

function overlaps(a: Box, b: Box, pad: number): boolean {
  return a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
}

/**
 * Camada do marcador único e dos nomes, por cima da nuvem (REC-13). Vive dentro do `ScatterChart`
 * porque só ali os hooks de escala respondem. O marcador único e a contagem dele vêm primeiro; depois
 * os termos mais distantes da diagonal, só onde o nome não cobre marca nem outro nome.
 */
function RareLayer({
  points,
  candidates,
  rare,
}: {
  readonly points: readonly Point[];
  readonly candidates: readonly Point[];
  readonly rare: RareMarker | null;
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
  const rareX = rare ? xScale(rare.x) : undefined;
  const rareY = rare ? yScale(rare.y) : undefined;
  if (rareX !== undefined && rareY !== undefined) {
    centers.push({ id: 'raros', cx: rareX, cy: rareY });
    obstacles.push({ left: rareX - RARE_RADIUS, top: rareY - RARE_RADIUS, right: rareX + RARE_RADIUS, bottom: rareY + RARE_RADIUS });
  }
  for (const point of points) {
    const cx = xScale(point.x);
    const cy = yScale(point.y);
    if (cx === undefined || cy === undefined) continue;
    centers.push({ id: point.id, cx, cy });
    obstacles.push({ left: cx - POINT_RADIUS, top: cy - POINT_RADIUS, right: cx + POINT_RADIUS, bottom: cy + POINT_RADIUS });
  }

  const placed: { readonly key: string; readonly text: string; readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number }[] = [];
  const tryPlace = (key: string, text: string, cx: number, cy: number, gap: number) => {
    const width = text.length * LABEL_CHAR_WIDTH;
    for (const candidate of LABEL_CANDIDATES) {
      const x = cx + candidate.dx + Math.sign(candidate.dx) * gap;
      const y = cy + candidate.dy;
      const boxLeft = candidate.anchor === 'start' ? x : candidate.anchor === 'end' ? x - width : x - width / 2;
      const box: Box = { left: boxLeft, top: y - LABEL_SIZE + 2, right: boxLeft + width, bottom: y + 2 };
      if (box.left < left + 1 || box.right > right - 1 || box.top < top || box.bottom > bottom) continue;
      if (obstacles.some((obstacle) => overlaps(box, obstacle, 1))) continue;
      if (placed.some((other) => overlaps(box, other.box, LABEL_PAD))) continue;
      const own = gapToBox(box, cx, cy);
      if (centers.some((c) => c.id !== key && gapToBox(box, c.cx, c.cy) < own + OWNER_MARGIN)) continue;
      placed.push({ key, text, box, anchor: candidate.anchor, x, y });
      return;
    }
  };

  let labeled = 0;
  for (const point of candidates) {
    if (labeled >= LABEL_COUNT) break;
    const cx = xScale(point.x);
    const cy = yScale(point.y);
    if (cx === undefined || cy === undefined) continue;
    const before = placed.length;
    tryPlace(point.id, point.term, cx, cy, 0);
    if (placed.length > before) labeled += 1;
  }

  return (
    <g>
      {rareX !== undefined && rareY !== undefined ? (
        <circle cx={rareX} cy={rareY} fill="none" r={RARE_RADIUS} stroke="var(--text-secondary)" strokeWidth={1.5} />
      ) : null}
      {placed.map((item) => (
        <text
          fill="var(--text-primary)"
          fontSize={LABEL_SIZE}
          fontWeight={600}
          key={`nome-${item.key}`}
          style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
          textAnchor={item.anchor}
          x={item.x}
          y={item.y}
        >
          {item.text}
        </text>
      ))}
    </g>
  );
}

export default function RareTermsScatter({ data = defaultData, height, className }: RareTermsScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const measured = data.terms.flatMap((row) => {
    const x = share(row.telefone, data.annotationsPhone);
    const y = share(row.video, data.annotationsVideo);
    return x === null || y === null ? [] : [{ row, x, y }];
  });
  const isRare = (row: { readonly telefone: number; readonly video: number }) => row.telefone === RARE_MENTIONS && row.video === RARE_MENTIONS;
  const rareRows = measured.filter((item) => isRare(item.row));
  const firstRare = rareRows[0];
  const rare: RareMarker | null = firstRare ? { x: firstRare.x, y: firstRare.y, count: rareRows.length } : null;

  const points: Point[] = measured
    .filter((item) => !isRare(item.row))
    .map(({ row, x, y }) => {
      const diff = x - y;
      const side: Side = diff >= TYPICAL_DIFF ? 'telefone' : diff <= -TYPICAL_DIFF ? 'video' : 'comum';
      return { id: row.id, term: row.term, x, y, telefone: row.telefone, video: row.video, side, diff };
    });

  if (points.length === 0 && rare === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum termo neste recorte: sem anotações nos dois grupos, não há proporção para comparar.</span>
      </div>
    );
  }

  const candidates = [...points].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff) || (a.term < b.term ? -1 : 1));
  const porLado = (side: Side) => points.filter((point) => point.side === side);
  const maisTelefone = porLado('telefone');
  const maisVideo = porLado('video');
  const comuns = porLado('comum');

  /** Eixo igual nos dois lados, no décimo acima da maior proporção; um tique a cada 10% (EIX-4). */
  const maxShare = Math.max(...points.flatMap((point) => [point.x, point.y]), rare?.x ?? 0, rare?.y ?? 0);
  const shareMax = Math.max(0.1, Math.ceil(maxShare * 10) / 10);
  const shareTicks = Array.from({ length: Math.round(shareMax * 10) + 1 }, (_, step) => step / 10);

  const groups = [
    { name: 'telefone', annotations: data.annotationsPhone },
    { name: 'vídeo', annotations: data.annotationsVideo },
  ];
  const smallGroups = groups.filter((group) => group.annotations > 0 && group.annotations < SMALL_GROUP);
  const warning = smallGroups
    .map((group) => `${group.name} tem ${formatInt(group.annotations)} anotações, menos de ${formatInt(SMALL_GROUP)}; uma menção a mais move o termo ${formatDecimal(100 / group.annotations, 1)} p.p.`)
    .join('. ');

  const totalTerms = points.length + rareRows.length;
  const summary =
    `Gráfico de dispersão de ${formatInt(totalTerms)} termos, com a proporção das anotações de telefone (${formatInt(data.annotationsPhone)}) no eixo horizontal e de vídeo (${formatInt(data.annotationsVideo)}) no vertical. ` +
    (rare ? `${formatInt(rare.count)} termos com uma menção em cada grupo vão num marcador único.` : '') +
    (smallGroups.length > 0 ? ' Há grupo pequeno.' : '');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'telefone', name: 'Telefone', value: formatRateWithVolume(point.telefone, data.annotationsPhone) },
      { dataKey: 'video', name: 'Vídeo', value: formatRateWithVolume(point.video, data.annotationsVideo) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.term} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs tabular-nums text-text-secondary">
        {`${formatInt(maisTelefone.length)} termos mais citados no telefone, ${formatInt(maisVideo.length)} no vídeo e ${formatInt(comuns.length)} sem diferença`}
      </p>
      <p aria-hidden className="mb-1 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`Proporção das anotações do grupo: telefone ${formatInt(data.annotationsPhone)}, vídeo ${formatInt(data.annotationsVideo)}`}
      </p>
      {rare ? (
        <p aria-hidden className="mb-1 flex shrink-0 items-center gap-1.5 text-[0.6875rem] tabular-nums text-text-secondary">
          <span className="inline-block size-3 shrink-0 rounded-full border-2 border-text-secondary" />
          {`Anel: ${formatInt(rare.count)} termos com ${formatInt(RARE_MENTIONS)} menção em cada grupo (${formatPercent(rare.x, 2)} do telefone, ${formatPercent(rare.y, 1)} do vídeo)`}
        </p>
      ) : null}
      <div aria-hidden className="flex shrink-0 items-center justify-between gap-2 pl-12 pr-4 text-[0.6875rem] text-text-muted">
        <span className="flex items-center gap-1 font-semibold text-text-secondary">
          <span className="size-2 rounded-full bg-chart-3" />
          Mais citado no vídeo
        </span>
        <span>Eixo vertical: vídeo</span>
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
              domain={[0, shareMax]}
              name="Telefone"
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickLine={false}
              tickMargin={8}
              ticks={shareTicks}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="y"
              domain={[0, shareMax]}
              name="Vídeo"
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickLine={false}
              tickMargin={8}
              ticks={shareTicks}
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
                { x: shareMax, y: shareMax },
              ]}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <Scatter data={comuns} fill={SIDE_COLOR.comum} isAnimationActive={animate} stroke="var(--surface-raised)" />
            <Scatter data={maisTelefone} fill={SIDE_COLOR.telefone} isAnimationActive={animate} stroke="var(--surface-raised)" />
            <Scatter data={maisVideo} fill={SIDE_COLOR.video} isAnimationActive={animate} stroke="var(--surface-raised)" />
            <RareLayer candidates={candidates} points={points} rare={rare} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="flex shrink-0 items-center justify-between gap-2 pl-12 pr-4 text-[0.6875rem] text-text-muted">
        <span>Eixo horizontal: telefone</span>
        <span className="flex items-center gap-1 font-semibold text-text-secondary">
          <span className="size-2 rounded-full bg-chart-1" />
          Mais citado no telefone
        </span>
      </div>
      {smallGroups.length > 0 ? (
        <p aria-hidden className="mt-2 flex shrink-0 items-start gap-1 text-[0.6875rem] text-text-secondary">
          <TriangleAlert aria-hidden className="mt-px size-3 shrink-0 text-warning" />
          <span>{`Grupo pequeno: ${warning}`}</span>
        </p>
      ) : null}
    </div>
  );
}
