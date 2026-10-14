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
import { formatCurrencyCompact, formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type TitleWord, type TitleWordSet } from './data';

/**
 * Dispersão de termos em escala log: cada ponto é uma palavra de título de criativo, posicionada pelo
 * número de anúncios de CPL abaixo da mediana (horizontal) e acima dela (vertical), cada contagem com 1
 * somado para o zero caber no log. Só as palavras com o mínimo de anúncios entram, e só as de maior
 * distinção ganham nome, escolhidas por colisão em TypeScript.
 */
export interface TitleWordScatterProps {
  readonly data?: TitleWordSet;
  readonly height?: number;
  readonly className?: string;
}

type Side = 'abaixo' | 'acima' | 'comum';

interface Point {
  readonly id: string;
  readonly term: string;
  /** Anúncios de CPL abaixo da mediana, mais 1. */
  readonly x: number;
  /** Anúncios de CPL acima da mediana, mais 1. */
  readonly y: number;
  readonly abaixo: number;
  readonly acima: number;
  readonly cplQualificado: number | null;
  readonly side: Side;
  /** Distinção: diferença de contagem sobre a raiz da soma; positivo é típico de CPL abaixo. */
  readonly score: number;
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
/** Frequência mínima, em anúncios, aplicada antes de desenhar. */
const MIN_ADS = 3;
/** Distinção a partir da qual a palavra conta como típica de um grupo. */
const TYPICAL_SCORE = 2;
/** Quantas palavras recebem nome, no máximo; o que não couber sem colidir fica sem nome. */
const LABEL_COUNT = 20;
/** Raio da marca em pixels; o ZAxis recebe a área, que é π r² (REC-31). */
const POINT_RADIUS = 3;
const Z_AREA = Math.PI * POINT_RADIUS * POINT_RADIUS;
/** Opacidade acima do piso de 0,72 do --text-muted e de 0,71 das categóricas (ACE-5); revela marcas empilhadas. */
const POINT_FILL_OPACITY = 0.8;
const LABEL_SIZE = 11;
/** Largura por caractere superestimada de propósito: errar sobrando não quebra nada (GEO-8). */
const LABEL_CHAR_WIDTH = 6.2;
const LABEL_PAD = 3;
/** O ponto dono precisa ficar mais perto da tinta do nome que qualquer outro ponto, por esta folga em px (ROT-7). */
const OWNER_MARGIN = 2;
/** Soma à contagem de anúncios para o zero caber na escala log. */
const LOG_OFFSET = 1;
const LOG_TICKS = [1, 3, 10, 30, 100, 300, 1000] as const;

const SIDE_COLOR: Readonly<Record<Side, string>> = {
  abaixo: 'var(--chart-1)',
  acima: 'var(--chart-3)',
  comum: 'var(--text-muted)',
};

/** Candidatas de posição do nome ao redor do ponto, da preferida à última. */
const LABEL_CANDIDATES: readonly { readonly dx: number; readonly dy: number; readonly anchor: Anchor }[] = [
  { dx: 7, dy: 4, anchor: 'start' },
  { dx: -7, dy: 4, anchor: 'end' },
  { dx: 0, dy: -8, anchor: 'middle' },
  { dx: 0, dy: 16, anchor: 'middle' },
  { dx: 6, dy: -6, anchor: 'start' },
  { dx: -6, dy: -6, anchor: 'end' },
  { dx: 6, dy: 14, anchor: 'start' },
  { dx: -6, dy: 14, anchor: 'end' },
];

/** Distância da caixa de tinta do nome ao centro de um ponto; zero se o centro está dentro da caixa. */
function gapToBox(box: Box, cx: number, cy: number): number {
  return Math.hypot(Math.max(box.left - cx, 0, cx - box.right), Math.max(box.top - cy, 0, cy - box.bottom));
}

function overlaps(a: Box, b: Box, pad: number): boolean {
  return a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
}

/** Distinção da palavra entre os dois grupos; `null` sem nenhum anúncio, porque não há o que comparar. */
function distinction(abaixo: number, acima: number): number | null {
  const total = abaixo + acima;
  if (total <= 0) return null;
  return (abaixo - acima) / Math.sqrt(total);
}

/**
 * Camada de nomes, desenhada por último para ficar por cima da nuvem (REC-13). Vive dentro do
 * `ScatterChart` porque só ali os hooks de escala respondem. Guloso: percorre as palavras da maior
 * distinção para a menor e só aceita a posição que não cobre marca nem outro nome.
 */
function WordLayer({ points, candidates }: { readonly points: readonly Point[]; readonly candidates: readonly Point[] }) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  const left = plotArea.x;
  const right = plotArea.x + plotArea.width;
  const top = plotArea.y;
  const bottom = plotArea.y + plotArea.height;

  const marks: Box[] = [];
  const centers: { readonly id: string; readonly cx: number; readonly cy: number }[] = [];
  for (const point of points) {
    const cx = xScale(point.x);
    const cy = yScale(point.y);
    if (cx === undefined || cy === undefined) continue;
    centers.push({ id: point.id, cx, cy });
    marks.push({ left: cx - POINT_RADIUS, top: cy - POINT_RADIUS, right: cx + POINT_RADIUS, bottom: cy + POINT_RADIUS });
  }

  const placed: { readonly point: Point; readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number }[] = [];
  for (const point of candidates) {
    if (placed.length >= LABEL_COUNT) break;
    const cx = xScale(point.x);
    const cy = yScale(point.y);
    if (cx === undefined || cy === undefined) continue;
    const width = point.term.length * LABEL_CHAR_WIDTH;
    for (const candidate of LABEL_CANDIDATES) {
      const x = cx + candidate.dx;
      const y = cy + candidate.dy;
      const boxLeft = candidate.anchor === 'start' ? x : candidate.anchor === 'end' ? x - width : x - width / 2;
      const box: Box = { left: boxLeft, top: y - LABEL_SIZE + 2, right: boxLeft + width, bottom: y + 2 };
      if (box.left < left + 1 || box.right > right - 1 || box.top < top || box.bottom > bottom) continue;
      if (marks.some((mark) => overlaps(box, mark, 1))) continue;
      if (placed.some((other) => overlaps(box, other.box, LABEL_PAD))) continue;
      const own = gapToBox(box, cx, cy);
      if (centers.some((c) => c.id !== point.id && gapToBox(box, c.cx, c.cy) < own + OWNER_MARGIN)) continue;
      placed.push({ point, box, anchor: candidate.anchor, x, y });
      break;
    }
  }

  return (
    <g>
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

export default function TitleWordScatter({ data = defaultData, height, className }: TitleWordScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const kept: readonly TitleWord[] = data.words.filter((word) => word.abaixo + word.acima >= MIN_ADS);
  const droppedCount = data.words.length - kept.length;

  if (kept.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>{`Nenhuma palavra com ${formatInt(MIN_ADS)} anúncios ou mais neste recorte: sem frequência mínima, não há o que comparar.`}</span>
      </div>
    );
  }

  const points: Point[] = kept.map((word) => {
    const score = distinction(word.abaixo, word.acima) ?? 0;
    const side: Side = score >= TYPICAL_SCORE ? 'abaixo' : score <= -TYPICAL_SCORE ? 'acima' : 'comum';
    return {
      id: word.id,
      term: word.term,
      x: word.abaixo + LOG_OFFSET,
      y: word.acima + LOG_OFFSET,
      abaixo: word.abaixo,
      acima: word.acima,
      cplQualificado: word.cplQualificado,
      side,
      score,
    };
  });
  const candidates = points
    .filter((point) => point.side !== 'comum')
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score) || (a.term < b.term ? -1 : 1));
  const porLado = (side: Side) => points.filter((point) => point.side === side);
  const tipicasAbaixo = porLado('abaixo');
  const tipicasAcima = porLado('acima');
  const comuns = porLado('comum');
  const top = candidates[0];

  /** O eixo termina no primeiro tique (1, 3, 10, 30...) que alcança a maior contagem somada de 1 (EIX-4). */
  const maxValue = Math.max(...points.map((point) => Math.max(point.x, point.y)));
  const logMax = LOG_TICKS.find((tick) => tick >= maxValue) ?? 1000;
  const logTicks = LOG_TICKS.filter((tick) => tick <= logMax);
  const month = formatMonthShort(data.month);

  const summary =
    `Gráfico de dispersão de ${formatInt(points.length)} palavras de títulos de criativos de ${month}, com anúncios de CPL abaixo da mediana no eixo horizontal e acima no vertical, em escala log. ` +
    `${formatInt(tipicasAbaixo.length)} típicas de CPL abaixo e ${formatInt(tipicasAcima.length)} de acima` +
    (top ? `; a mais distinta é ${top.term}.` : '.');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'abaixo', name: 'CPL abaixo da mediana', value: `${formatInt(point.abaixo)} anúncios` },
      { dataKey: 'acima', name: 'CPL acima da mediana', value: `${formatInt(point.acima)} anúncios` },
      {
        dataKey: 'cplQualificado',
        name: 'CPL qualificado médio',
        value: point.cplQualificado === null ? formatUnavailable() : formatCurrencyCompact(point.cplQualificado),
      },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.term} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs tabular-nums text-text-secondary">
        {`${formatInt(tipicasAbaixo.length)} palavras típicas de CPL abaixo da mediana de ${month}, ${formatInt(tipicasAcima.length)} de acima e ${formatInt(comuns.length)} sem diferença`}
      </p>
      <p aria-hidden className="mb-1 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`Escala log, com ${formatInt(LOG_OFFSET)} somado à contagem de anúncios de cada palavra`}
      </p>
      <div aria-hidden className="flex shrink-0 items-center justify-between gap-2 pl-11 pr-4 text-[0.6875rem] text-text-muted">
        <span className="flex items-center gap-1 font-semibold text-text-secondary">
          <span className="size-2 rounded-full bg-chart-3" />
          Típico de CPL acima
        </span>
        <span>{`Eixo vertical: anúncios de CPL acima (${formatInt(data.adsAbove)})`}</span>
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
              domain={[1, logMax]}
              name="CPL abaixo da mediana"
              scale="log"
              tickFormatter={(value: number) => formatInt(value)}
              tickLine={false}
              tickMargin={8}
              ticks={logTicks}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="y"
              domain={[1, logMax]}
              name="CPL acima da mediana"
              scale="log"
              tickFormatter={(value: number) => formatInt(value)}
              tickLine={false}
              tickMargin={8}
              ticks={logTicks}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[Z_AREA, Z_AREA]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {/* ifOverflow extendDomain: sem ele a diagonal sumiria se o domínio encolhesse (REC-1). */}
            <ReferenceLine
              ifOverflow="extendDomain"
              segment={[
                { x: 1, y: 1 },
                { x: logMax, y: logMax },
              ]}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <Scatter data={comuns} fill={SIDE_COLOR.comum} fillOpacity={POINT_FILL_OPACITY} isAnimationActive={animate} />
            <Scatter data={tipicasAbaixo} fill={SIDE_COLOR.abaixo} fillOpacity={POINT_FILL_OPACITY} isAnimationActive={animate} />
            <Scatter data={tipicasAcima} fill={SIDE_COLOR.acima} fillOpacity={POINT_FILL_OPACITY} isAnimationActive={animate} />
            <WordLayer candidates={candidates} points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="flex shrink-0 items-center justify-between gap-2 pl-11 pr-4 text-[0.6875rem] text-text-muted">
        <span>{`Eixo horizontal: anúncios de CPL abaixo (${formatInt(data.adsBelow)})`}</span>
        <span className="flex items-center gap-1 font-semibold text-text-secondary">
          <span className="size-2 rounded-full bg-chart-1" />
          Típico de CPL abaixo
        </span>
      </div>
      <p aria-hidden className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">
        {`Mínimo de ${formatInt(MIN_ADS)} anúncios por palavra${droppedCount > 0 ? `; ${formatInt(droppedCount)} abaixo disso ficaram de fora` : ''}. Nome só nas palavras típicas de um grupo, da maior distinção para a menor, e só onde o ponto da palavra é o mais próximo do nome; palavra empilhada em outra fica sem nome.`}
      </p>
    </div>
  );
}
