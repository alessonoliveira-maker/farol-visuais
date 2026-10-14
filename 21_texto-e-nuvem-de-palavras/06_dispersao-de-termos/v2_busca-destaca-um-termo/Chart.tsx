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
import { data as defaultData, searchedTerm as defaultSearchedTerm, type Concordance, type TermCount } from './data';

/**
 * Dispersão de termos com busca: o termo buscado acende em --chart-1 com anel e nome em peso 700, o
 * resto da nuvem fica em cinza, e as frases do termo aparecem abaixo em concordância curta. Termo
 * que não existe no recorte escreve isso e deixa a nuvem toda em cinza, sem destaque.
 */
export interface TermSearchScatterProps {
  readonly data?: readonly TermCount[];
  /** O termo a destacar; a busca ignora maiúscula e acento. */
  readonly searchedTerm?: string;
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly term: string;
  /** Posição na lista de frequência das ganhas; 1 é o termo mais citado. */
  readonly x: number;
  /** Posição na lista de frequência das perdidas. */
  readonly y: number;
  readonly ganhas: number;
  readonly perdidas: number;
  readonly frases: readonly Concordance[];
}

type Anchor = 'start' | 'middle' | 'end';

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

const MARGIN = { top: 8, right: 16, bottom: 8, left: 4 } as const;
const Y_AXIS_WIDTH = 40;
/** Diferença de posição a partir da qual o termo conta como típico de um grupo. */
const TYPICAL_GAP = 15;
/** Raio da marca em pixels; o ZAxis recebe a área, que é π r² (REC-31). */
const POINT_RADIUS = 4;
const Z_AREA = Math.PI * POINT_RADIUS * POINT_RADIUS;
const RING_RADIUS = 9;
const LABEL_SIZE = 11;
/** Largura por caractere superestimada de propósito, e maior no peso 700 (GEO-8). */
const LABEL_CHAR_WIDTH = 6.8;
const LABEL_PAD = 3;
const MARK_NEUTRAL = 'var(--text-muted)';
const MARK_FOUND = 'var(--chart-1)';

/** Candidatas de posição do nome ao redor do anel, da preferida à última. */
const LABEL_CANDIDATES: readonly { readonly dx: number; readonly dy: number; readonly anchor: Anchor }[] = [
  { dx: 13, dy: 4, anchor: 'start' },
  { dx: -13, dy: 4, anchor: 'end' },
  { dx: 0, dy: -14, anchor: 'middle' },
  { dx: 0, dy: 22, anchor: 'middle' },
  { dx: 11, dy: -10, anchor: 'start' },
  { dx: -11, dy: -10, anchor: 'end' },
  { dx: 11, dy: 19, anchor: 'start' },
  { dx: -11, dy: 19, anchor: 'end' },
];

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

/** Minúscula e sem acento, para a busca achar "Prazo" e "prazo" e "decisão" por "decisao". */
function normalizeTerm(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function overlaps(a: Box, b: Box, pad: number): boolean {
  return a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
}

function ordinal(rank: number): string {
  return `${formatInt(Math.round(rank))}º`;
}

/**
 * Anel e nome do termo buscado, por cima da nuvem (REC-13). Vive dentro do `ScatterChart` porque só
 * ali os hooks de escala respondem. O nome tenta as 8 posições ao redor do anel e fica com a primeira
 * que não cobre marca; se nenhuma serve, fica com a que cobre menos, porque este é o único nome que
 * a peça não pode perder.
 */
function FoundLayer({ points, found }: { readonly points: readonly Point[]; readonly found: Point }) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  const cx = xScale(found.x);
  const cy = yScale(found.y);
  if (cx === undefined || cy === undefined) return null;

  const marks: Box[] = [];
  for (const point of points) {
    if (point.id === found.id) continue;
    const px = xScale(point.x);
    const py = yScale(point.y);
    if (px === undefined || py === undefined) continue;
    marks.push({ left: px - POINT_RADIUS, top: py - POINT_RADIUS, right: px + POINT_RADIUS, bottom: py + POINT_RADIUS });
  }

  const width = found.term.length * LABEL_CHAR_WIDTH;
  let best: { readonly anchor: Anchor; readonly x: number; readonly y: number; readonly faults: number } | null = null;
  for (const candidate of LABEL_CANDIDATES) {
    const x = cx + candidate.dx;
    const y = cy + candidate.dy;
    const boxLeft = candidate.anchor === 'start' ? x : candidate.anchor === 'end' ? x - width : x - width / 2;
    const box: Box = { left: boxLeft, top: y - LABEL_SIZE + 2, right: boxLeft + width, bottom: y + 2 };
    const outside = box.left < plotArea.x + 1 || box.right > plotArea.x + plotArea.width - 1 || box.top < plotArea.y || box.bottom > plotArea.y + plotArea.height;
    const faults = (outside ? 100 : 0) + marks.filter((mark) => overlaps(box, mark, LABEL_PAD)).length;
    if (best === null || faults < best.faults) best = { anchor: candidate.anchor, x, y, faults };
    if (faults === 0) break;
  }

  return (
    <g>
      <circle cx={cx} cy={cy} fill="none" r={RING_RADIUS} stroke={MARK_FOUND} strokeWidth={1.5} />
      {best ? (
        <text
          fill="var(--text-primary)"
          fontSize={LABEL_SIZE}
          fontWeight={700}
          style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
          textAnchor={best.anchor}
          x={best.x}
          y={best.y}
        >
          {found.term}
        </text>
      ) : null}
    </g>
  );
}

export default function TermSearchScatter({
  data = defaultData,
  searchedTerm = defaultSearchedTerm,
  height,
  className,
}: TermSearchScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum termo neste recorte: sem anotações de ganhas e de perdidas, não há o que buscar.</span>
      </div>
    );
  }

  const rankGanhas = midRanks(data.map((row) => row.ganhas));
  const rankPerdidas = midRanks(data.map((row) => row.perdidas));
  const points: Point[] = data.map((row, index) => ({
    id: row.id,
    term: row.term,
    x: rankGanhas[index] ?? data.length,
    y: rankPerdidas[index] ?? data.length,
    ganhas: row.ganhas,
    perdidas: row.perdidas,
    frases: row.frases ?? [],
  }));

  const query = normalizeTerm(searchedTerm);
  const found = query === '' ? undefined : points.find((point) => normalizeTerm(point.term) === query);
  const rest = points.filter((point) => point.id !== found?.id);

  /** Eixo igual nos dois lados, no múltiplo de 25 acima da lista; quatro linhas de grade (EIX-4). */
  const rankMax = Math.ceil(data.length / 25) * 25;
  const rankTicks = [1, 2, 3, 4].map((step) => (step * rankMax) / 4);

  const gap = found ? found.y - found.x : 0;
  const tendency = gap >= TYPICAL_GAP ? 'típico de ganhas' : gap <= -TYPICAL_GAP ? 'típico de perdidas' : 'posição parecida nos dois grupos';
  const readingLine = found
    ? `Termo ${found.term}: ${ordinal(found.x)} entre as ganhas e ${ordinal(found.y)} entre as perdidas; ${tendency}`
    : query === ''
      ? `Nenhum termo buscado; ${formatInt(points.length)} termos em cinza`
      : `Termo não encontrado no recorte: ${searchedTerm.trim()}`;

  const summary =
    `Gráfico de dispersão de ${formatInt(points.length)} termos, com a posição de cada um entre as ganhas no eixo horizontal e entre as perdidas no vertical. ` +
    (found
      ? `O termo buscado, ${found.term}, está em ${ordinal(found.x)} entre as ganhas e em ${ordinal(found.y)} entre as perdidas.`
      : query === ''
        ? 'Nenhum termo foi buscado.'
        : `O termo buscado, ${searchedTerm.trim()}, não foi encontrado no recorte.`);

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
        {readingLine}
      </p>
      <div aria-hidden className="flex shrink-0 items-center justify-between gap-2 pl-11 pr-4 text-[0.6875rem] text-text-muted">
        <span className="font-semibold text-text-secondary">Típico de ganhas</span>
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
            <Scatter data={rest} fill={MARK_NEUTRAL} isAnimationActive={animate} stroke="var(--surface-raised)" />
            {found ? <Scatter data={[found]} fill={MARK_FOUND} isAnimationActive={animate} stroke="var(--surface-raised)" /> : null}
            {found ? <FoundLayer found={found} points={points} /> : null}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="flex shrink-0 items-center justify-between gap-2 pl-11 pr-4 text-[0.6875rem] text-text-muted">
        <span>Eixo horizontal: posição entre as ganhas, 1º é o mais citado</span>
        <span className="font-semibold text-text-secondary">Típico de perdidas</span>
      </div>
      {found ? (
        <div aria-hidden className="mt-2 shrink-0">
          <p className="mb-1 text-[0.6875rem] text-text-muted">{`Frases com ${found.term}`}</p>
          {found.frases.length === 0 ? (
            <p className="text-xs text-text-secondary">Sem frases registradas para este termo.</p>
          ) : (
            <ul className="space-y-1 text-xs text-text-secondary">
              {found.frases.map((frase) => (
                <li className="flex gap-2" key={`${frase.grupo}-${frase.antes}`}>
                  <span className="w-14 shrink-0 text-text-muted">{frase.grupo === 'ganhas' ? 'Ganha' : 'Perdida'}</span>
                  <span>
                    {`…${frase.antes} `}
                    <span className="font-semibold text-text-primary">{found.term}</span>
                    {` ${frase.depois}…`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
