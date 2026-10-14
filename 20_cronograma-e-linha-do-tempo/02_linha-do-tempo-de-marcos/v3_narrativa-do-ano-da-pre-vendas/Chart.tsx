import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  useChartWidth,
  usePlotArea,
  useXAxisScale,
} from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthShort, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type AgendaCount, type PreSalesEvent } from './data';

/** Linha do tempo narrativa: cartões de título e frase alternando acima e abaixo do eixo, em escala real de tempo. */
export interface NarrativeTimelineProps {
  readonly data?: readonly PreSalesEvent[];
  readonly height?: number;
  readonly className?: string;
}

interface Point extends PreSalesEvent {
  readonly x: number;
  readonly y: number;
  readonly above: boolean;
}

interface PointShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: Point;
}

const MARGIN = { top: 8, right: 16, bottom: 4, left: 56 } as const;
const MS_PER_DAY = 86_400_000;
const LANE_Y = 0;
const DOMAIN_Y: readonly [number, number] = [-1, 1];
const DOT_AREA = 80;
const CARD_WIDTH = 200;
const CARD_PAD = 10;
const CARD_RADIUS = 6;
const LINE_HEIGHT = 14;
const WRAP_CHARS = 28;
const CONNECTOR = 14;
const EDGE = 4;
const CARD_GAP = 8;

function toMs(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

function monthStart(ms: number, shift: number): number {
  const date = new Date(ms);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + shift, 1);
}

function monthTicks(from: number, to: number): number[] {
  const ticks: number[] = [];
  let cursor = monthStart(from, 0);
  while (cursor <= to) {
    if (cursor >= from) ticks.push(cursor);
    cursor = monthStart(cursor, 1);
  }
  return ticks;
}

/** Quebra o texto em linhas de no máximo `max` caracteres, sempre entre palavras. */
function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(' ')) {
    const candidate = current === '' ? word : `${current} ${word}`;
    if (candidate.length > max && current !== '') {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}

/** Taxa de agenda de um período (reuniões por contato), ou `null` sem contatos. */
function agendaRate(count: AgendaCount): number | null {
  return count.contacts > 0 ? count.meetings / count.contacts : null;
}

/** Variação relativa da taxa de um evento, ou `null` quando ele não traz o par antes e depois. */
function rateShift(event: PreSalesEvent): number | null {
  if (event.before === undefined || event.after === undefined) return null;
  const before = agendaRate(event.before);
  const after = agendaRate(event.after);
  if (before === null || after === null || before === 0) return null;
  return after / before - 1;
}

/** Taxa com volume na mesma linha, ou o rótulo de indisponível. */
function rateText(count: AgendaCount): string {
  return formatRateWithVolume(count.meetings, count.contacts);
}

/** Início de cada cartão: o natural centrado no ponto, empurrado para manter `CARD_GAP` do vizinho do mesmo lado. */
function cardLefts(points: readonly Point[], xs: readonly number[], chartWidth: number): number[] {
  const lefts = xs.map((px) => Math.min(Math.max(px - CARD_WIDTH / 2, EDGE), chartWidth - CARD_WIDTH - EDGE));
  for (const above of [true, false]) {
    const idx = points.map((p, i) => (p.above === above ? i : -1)).filter((i) => i >= 0);
    for (let k = 1; k < idx.length; k += 1) {
      const i = idx[k] ?? 0;
      const prev = lefts[idx[k - 1] ?? 0] ?? 0;
      lefts[i] = Math.max(lefts[i] ?? 0, prev + CARD_WIDTH + CARD_GAP);
    }
    for (let k = idx.length - 1; k >= 0; k -= 1) {
      const i = idx[k] ?? 0;
      const limit = k === idx.length - 1 ? chartWidth - CARD_WIDTH - EDGE : (lefts[idx[k + 1] ?? 0] ?? 0) - CARD_WIDTH - CARD_GAP;
      lefts[i] = Math.min(lefts[i] ?? 0, limit);
    }
  }
  return lefts;
}

/** O evento que mais mexeu na taxa, em valor absoluto, ou `null` se nenhum traz o par. */
function biggestShift(points: readonly Point[]): Point | null {
  let best: Point | null = null;
  let bestAbs = 0;
  for (const point of points) {
    const shift = rateShift(point);
    if (shift !== null && Math.abs(shift) > bestAbs) {
      best = point;
      bestAbs = Math.abs(shift);
    }
  }
  return best;
}

/** Variação com sinal à mão sobre o valor absoluto, e o sinal de menos tipográfico. */
function signedPercent(shift: number): string {
  return `${shift < 0 ? '−' : '+'}${formatPercent(Math.abs(shift), 0)}`;
}

interface CardsProps {
  readonly points: readonly Point[];
  readonly highlightId: string | null;
}

/** Cartões e conectores, posicionados pela escala do eixo X e pela área de plotagem. */
function Cards({ points, highlightId }: CardsProps): ReactElement | null {
  const scale = useXAxisScale();
  const area = usePlotArea();
  const chartWidth = useChartWidth();
  if (!scale || !area || chartWidth === undefined) return null;
  const laneY = area.y + area.height / 2;
  const xs = points.map((point) => Number(scale(point.x)));
  const lefts = cardLefts(points, xs, chartWidth);
  return (
    <g>
      {points.map((point, index) => {
        const px = xs[index] ?? 0;
        const highlighted = point.id === highlightId;
        const shift = rateShift(point);
        const baseRate = point.before ? agendaRate(point.before) : null;
        const body = wrap(point.sentence, WRAP_CHARS);
        const rows = 2 + body.length + (highlighted && shift !== null && baseRate !== null ? 1 : 0);
        const cardHeight = CARD_PAD * 2 + LINE_HEIGHT * rows - 2;
        const left = lefts[index] ?? EDGE;
        const top = point.above ? laneY - CONNECTOR - cardHeight : laneY + CONNECTOR;
        const edgeY = point.above ? top + cardHeight : top;
        const textLeft = left + CARD_PAD;
        const firstBaseline = top + CARD_PAD + 10;
        return (
          <g key={point.id}>
            <line stroke="var(--text-muted)" strokeWidth={1} x1={px} x2={px} y1={laneY} y2={edgeY} />
            <rect
              fill="var(--surface-sunken)"
              height={cardHeight}
              rx={CARD_RADIUS}
              stroke={highlighted ? 'var(--chart-1)' : 'none'}
              strokeWidth={2}
              width={CARD_WIDTH}
              x={left}
              y={top}
            />
            <text className="font-sans" fill="var(--text-primary)" fontSize={12} fontWeight={highlighted ? 700 : 600} x={textLeft} y={firstBaseline}>
              {point.title}
            </text>
            <text className="font-display" fill="var(--text-muted)" fontSize={11} x={textLeft} y={firstBaseline + LINE_HEIGHT}>
              {formatDate(point.date)}
            </text>
            {body.map((line, i) => (
              <text className="font-sans" fill="var(--text-secondary)" fontSize={11} key={line} x={textLeft} y={firstBaseline + LINE_HEIGHT * (2 + i)}>
                {line}
              </text>
            ))}
            {highlighted && shift !== null && baseRate !== null ? (
              <text className="font-display" fill="var(--text-primary)" fontSize={11} fontWeight={700} x={textLeft} y={firstBaseline + LINE_HEIGHT * (2 + body.length)}>
                {`agenda ${signedPercent(shift)} contra ${formatPercent(baseRate)}`}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

export default function NarrativeTimeline({ data = defaultData, height, className }: NarrativeTimelineProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum evento neste recorte: a pré-vendas não registrou mudanças no período.</span>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => toMs(a.date) - toMs(b.date));
  const points: Point[] = sorted.map((item, index) => ({ ...item, x: toMs(item.date), y: LANE_Y, above: index % 2 === 0 }));
  const first = points[0];
  const last = points[points.length - 1];
  const firstMs = first ? first.x : 0;
  const lastMs = last ? last.x : 0;
  const domainX: [number, number] = [monthStart(firstMs, 0), monthStart(lastMs, 1) + 14 * MS_PER_DAY];
  const ticks = monthTicks(domainX[0], domainX[1]);
  const focus = biggestShift(points);
  const focusShift = focus ? rateShift(focus) : null;

  const reading =
    focus && focus.before && focus.after && focusShift !== null
      ? `Taxa de agenda (reuniões por contato) de ${rateText(focus.before)} para ${rateText(focus.after)} com “${focus.title}”, em ${formatDate(focus.date)}.`
      : 'Nenhum evento traz a taxa de agenda antes e depois; os cartões seguem em escala real de tempo.';

  const summary = [
    first && last ? `Linha do tempo com ${formatInt(points.length)} eventos da pré-vendas, de ${formatDate(first.date)} a ${formatDate(last.date)}.` : '',
    focus && focus.before && focus.after && focusShift !== null
      ? `A taxa de agenda foi de ${rateText(focus.before)} para ${rateText(focus.after)}, ${signedPercent(focusShift)}, com o evento “${focus.title}”, em ${formatDate(focus.date)}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderDot = ({ cx, cy, payload }: PointShapeProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || !payload) return null;
    const highlighted = focus !== null && payload.id === focus.id;
    return (
      <circle cx={cx} cy={cy} fill="var(--chart-1)" r={highlighted ? 6 : 4.5} stroke="var(--surface-raised)" strokeWidth={1.5} />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="x"
              domain={domainX}
              tickFormatter={(value: number) => formatMonthShort(new Date(value).toISOString().slice(0, 10))}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              type="number"
            />
            <YAxis dataKey="y" domain={[...DOMAIN_Y]} hide type="number" />
            {/* REC-15: sem ZAxis registrado o ponto volta ao tamanho padrão de 64 px². */}
            <ZAxis range={[DOT_AREA, DOT_AREA]} type="number" />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={LANE_Y} />
            <Scatter data={points} isAnimationActive={animate} shape={renderDot} />
            <Cards highlightId={focus ? focus.id : null} points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
