import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
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
  useChartWidth,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { audiences, data as defaultData, today as defaultToday, type Audience, type YearMilestone } from './data';

/** Marcos do ano em faixas por público, na mesma escala de tempo, com a semana lotada agrupada e os sem data à direita. */
export interface AudienceTimelineProps {
  readonly data?: readonly YearMilestone[];
  readonly today?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Um losango no eixo: um marco, ou vários que dividem o mesmo pixel. */
interface Point {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly audience: Audience;
  readonly members: readonly (YearMilestone & { readonly date: string })[];
}

interface PointShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: Point;
}

const MARGIN = { top: 20, right: 140, bottom: 4, left: 8 } as const;
const Y_AXIS_WIDTH = 80;
const MS_PER_DAY = 86_400_000;
const MERGE_DAYS = 5;
const DOMAIN_Y: readonly [number, number] = [-0.3, 3.9];
const LEVELS = 3;
const LEVEL_STEP = 14;
const LABEL_GAP = 8;
const GUIDE_GAP = 4;
const CHAR_WIDTH = 5.9;
const MARK_RADIUS = 6;
const CLUSTER_RADIUS = 11;
const DIAMOND_AREA = 150;
const PENDING_COLUMN_GAP = 16;
const PENDING_WRAP = 17;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

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

/** Marcos de uma faixa, ordenados por data, com os que ficam a até `MERGE_DAYS` dias agrupados. */
function groupLane(items: readonly (YearMilestone & { readonly date: string })[], lane: number): Point[] {
  const sorted = [...items].sort((a, b) => toMs(a.date) - toMs(b.date));
  const groups: (YearMilestone & { readonly date: string })[][] = [];
  for (const item of sorted) {
    const current = groups[groups.length - 1];
    const lastItem = current ? current[current.length - 1] : undefined;
    if (current && lastItem && toMs(item.date) - toMs(lastItem.date) <= MERGE_DAYS * MS_PER_DAY) current.push(item);
    else groups.push([item]);
  }
  return groups.map((members) => {
    const head = members[0];
    const tail = members[members.length - 1];
    const from = head ? toMs(head.date) : 0;
    const to = tail ? toMs(tail.date) : 0;
    return { id: members.map((m) => m.id).join('+'), x: (from + to) / 2, y: lane, audience: head?.audience ?? 'diretoria', members };
  });
}

/** A janela de 7 dias com mais marcos datados, ou `null` quando nenhum marco tem data. */
function busiestWeek(dated: readonly (YearMilestone & { readonly date: string })[]): { readonly start: string; readonly count: number } | null {
  let best: { start: string; count: number } | null = null;
  for (const item of dated) {
    const start = toMs(item.date);
    const count = dated.filter((other) => toMs(other.date) >= start && toMs(other.date) < start + 7 * MS_PER_DAY).length;
    if (best === null || count > best.count) best = { start: item.date, count };
  }
  return best;
}

/** Rótulo de um losango: o nome do marco, ou a contagem quando são vários. */
function pointLabel(point: Point): string {
  const only = point.members[0];
  return point.members.length === 1 && only ? only.name : `${formatInt(point.members.length)} marcos`;
}

interface Placed {
  readonly point: Point;
  readonly text: string;
  readonly left: number;
  readonly right: number;
  readonly anchor: 'start' | 'end';
  readonly level: number;
  readonly guideX: number;
}

/** Escada de três alturas por faixa: cada rótulo toma a primeira altura livre; sem vaga, o vizinho que bloqueia é realocado (busca com retrocesso), nunca o marco fica sem nome. */
function placeLabels(points: readonly Point[], toPx: (ms: number) => number, plotRight: number): Placed[] {
  const ordered = [...points].sort((a, b) => a.y - b.y || a.x - b.x);
  const clashes = (placed: readonly Placed[], point: Point, left: number, right: number, level: number, px: number): boolean =>
    placed.some((p) => {
      if (p.point.y !== point.y) return false;
      if (p.level === level) return left < p.right + LABEL_GAP && right > p.left - LABEL_GAP;
      // A linha guia de um rótulo alto atravessa as alturas de baixo: nenhum texto pode ficar no caminho dela.
      if (p.level > level) return p.guideX > left - GUIDE_GAP && p.guideX < right + GUIDE_GAP;
      return px > p.left - GUIDE_GAP && px < p.right + GUIDE_GAP;
    });
  const solve = (index: number, placed: Placed[]): Placed[] | null => {
    const point = ordered[index];
    if (!point) return placed;
    const text = pointLabel(point);
    const width = text.length * CHAR_WIDTH;
    const px = toPx(point.x);
    const preferred: 'start' | 'end' = px + width > plotRight ? 'end' : 'start';
    const anchors: readonly ('start' | 'end')[] = preferred === 'end' ? ['end'] : ['start', 'end'];
    for (let level = 1; level <= LEVELS; level += 1) {
      for (const anchor of anchors) {
        const left = anchor === 'start' ? px : px - width;
        const right = anchor === 'start' ? px + width : px;
        if (clashes(placed, point, left, right, level, px)) continue;
        const found = solve(index + 1, [...placed, { point, text, left, right, anchor, level, guideX: px }]);
        if (found) return found;
      }
    }
    return null;
  };
  return solve(0, []) ?? [];
}

interface PendingItem {
  readonly id: string;
  readonly name: string;
  readonly lane: number;
}

interface LayerProps {
  readonly points: readonly Point[];
  readonly pending: readonly PendingItem[];
}

/** Rótulos em escada, linhas guia e a coluna "a definir", posicionados pelas escalas dos dois eixos. */
function Layer({ points, pending }: LayerProps): ReactElement | null {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const area = usePlotArea();
  const chartWidth = useChartWidth();
  if (!xScale || !yScale || !area || chartWidth === undefined) return null;
  const plotRight = area.x + area.width;
  const placed = placeLabels(points, (ms) => Number(xScale(ms)), plotRight);
  const columnLeft = plotRight + PENDING_COLUMN_GAP;
  return (
    <g>
      {placed.map(({ point, text, anchor, level }) => {
        const px = Number(xScale(point.x));
        const py = Number(yScale(point.y));
        const baseline = py - 11 - (level - 1) * LEVEL_STEP;
        const radius = point.members.length > 1 ? CLUSTER_RADIUS : MARK_RADIUS;
        return (
          <g key={point.id}>
            <line stroke="var(--text-muted)" strokeWidth={1} x1={px} x2={px} y1={py - radius} y2={baseline} />
            <text
              className="font-sans"
              fill="var(--text-secondary)"
              fontSize={11}
              fontWeight={point.members.length > 1 ? 600 : 500}
              style={HALO}
              textAnchor={anchor}
              x={anchor === 'start' ? px + 4 : px - 4}
              y={baseline}
            >
              {text}
            </text>
          </g>
        );
      })}
      <text className="font-sans" fill="var(--text-secondary)" fontSize={11} fontWeight={600} x={columnLeft} y={area.y + 10}>
        a definir
      </text>
      {pending.map((item) => {
        const py = Number(yScale(audiences.length - 1 - item.lane));
        const lines = wrap(item.name, PENDING_WRAP);
        const r = MARK_RADIUS;
        const cx = columnLeft + r;
        return (
          <g key={item.id}>
            <path
              d={`M${String(cx)},${String(py - r)} L${String(cx + r)},${String(py)} L${String(cx)},${String(py + r)} L${String(cx - r)},${String(py)} Z`}
              fill="var(--surface-raised)"
              stroke="var(--text-muted)"
              strokeDasharray="3 2"
              strokeWidth={2}
            />
            {lines.map((line, i) => (
              <text className="font-sans" fill="var(--text-secondary)" fontSize={11} key={line} x={cx + r + 6} y={py + 4 + (i - (lines.length - 1) / 2) * 14}>
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
}

export default function AudienceTimeline({ data = defaultData, today = defaultToday, height, className }: AudienceTimelineProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum marco neste recorte: nenhum público tem entregas planejadas para o ano.</span>
      </div>
    );
  }

  const dated = data.filter((item): item is YearMilestone & { readonly date: string } => item.date !== null);
  const undated = data.filter((item) => item.date === null);
  const points = audiences.flatMap((audience, index) =>
    groupLane(
      dated.filter((item) => item.audience === audience.id),
      audiences.length - 1 - index,
    ),
  );
  const pending: PendingItem[] = undated.map((item) => ({ id: item.id, name: item.name, lane: audiences.findIndex((a) => a.id === item.audience) }));
  const todayMs = toMs(today);
  const firstMs = dated.reduce((min, item) => Math.min(min, toMs(item.date)), todayMs);
  const lastMs = dated.reduce((max, item) => Math.max(max, toMs(item.date)), todayMs);
  const domainX: [number, number] = [monthStart(firstMs, 0), monthStart(lastMs, 1)];
  const ticks = monthTicks(domainX[0], domainX[1]);
  const week = busiestWeek(dated);
  const laneTicks = audiences.map((_, index) => audiences.length - 1 - index);

  const pendingText = undated.length === 0 ? 'nenhum marco sem data' : `${formatInt(undated.length)} sem data definida`;
  const reading = week
    ? `Semana mais cheia: ${formatInt(week.count)} marcos a partir de ${formatDate(week.start)}; ${pendingText}.`
    : `Nenhum marco tem data; ${pendingText}.`;
  const summary = [
    `Linha do tempo com ${formatInt(data.length)} marcos de ${formatInt(audiences.length)} públicos em ${formatDate(today)}.`,
    week ? `A semana de ${formatDate(week.start)} concentra ${formatInt(week.count)} marcos.` : '',
    `${formatInt(undated.length)} aguardam data e ficam fora do eixo.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const audienceLabel = audiences.find((a) => a.id === point.audience)?.label ?? '';
    const entries = point.members.map((member) => ({ dataKey: member.id, name: member.name, value: formatDate(member.date) })) as unknown as ChartTooltipProps['payload'];
    const label = point.members.length > 1 ? `${formatInt(point.members.length)} marcos, ${audienceLabel}` : audienceLabel;
    return <ChartTooltip active={props.active} label={label} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  const renderPoint = ({ cx, cy, payload }: PointShapeProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || !payload) return null;
    const many = payload.members.length > 1;
    const r = many ? CLUSTER_RADIUS : MARK_RADIUS;
    const path = `M${String(cx)},${String(cy - r)} L${String(cx + r)},${String(cy)} L${String(cx)},${String(cy + r)} L${String(cx - r)},${String(cy)} Z`;
    return (
      <g>
        <path d={path} fill="var(--chart-1)" stroke="var(--surface-raised)" strokeWidth={1.5} />
        {many ? (
          <text className="font-display" fill="var(--surface-raised)" fontSize={11} fontWeight={600} textAnchor="middle" x={cx} y={cy + 4}>
            {formatInt(payload.members.length)}
          </text>
        ) : null}
      </g>
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
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="y"
              domain={[...DOMAIN_Y]}
              tickFormatter={(value: number) => audiences[audiences.length - 1 - value]?.label ?? ''}
              tickLine={false}
              tickMargin={8}
              ticks={laneTicks}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            {/* REC-15: sem ZAxis registrado o losango volta ao tamanho padrão de 64 px². */}
            <ZAxis range={[DIAMOND_AREA, DIAMOND_AREA]} type="number" />
            {laneTicks.map((lane) => (
              <ReferenceLine ifOverflow="extendDomain" key={lane} stroke="var(--line-strong)" strokeWidth={1} y={lane} />
            ))}
            {/* REC-1: sem extendDomain a linha de hoje some quando cai fora do domínio. */}
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{ fill: 'var(--text-muted)', fontSize: 11, position: 'top', value: `hoje, ${formatDate(today)}` }}
              stroke="var(--text-muted)"
              strokeDasharray="4 4"
              x={todayMs}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={points} isAnimationActive={animate} shape={renderPoint} />
            <Layer pending={pending} points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
