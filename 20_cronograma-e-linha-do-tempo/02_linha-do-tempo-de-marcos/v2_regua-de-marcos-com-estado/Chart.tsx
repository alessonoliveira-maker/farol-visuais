import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  type LabelProps,
} from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatDays, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, today as defaultToday, type QuarterMilestone } from './data';

/** Régua de marcos do trimestre: atingido, em curso, futuro e atrasado se leem pela forma, e o atraso diz quantos dias. */
export interface MilestoneRulerProps {
  readonly data?: readonly QuarterMilestone[];
  readonly today?: string;
  readonly height?: number;
  readonly className?: string;
}

interface Point extends QuarterMilestone {
  readonly x: number;
  readonly y: number;
  readonly above: boolean;
  /** Dias de atraso: positivo só para marco não atingido com data já vencida. */
  readonly lateDays: number;
}

interface PointShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: Point;
}

const MARGIN = { top: 20, right: 24, bottom: 4, left: 32 } as const;
const MS_PER_DAY = 86_400_000;
const LANE_Y = 0;
const DOMAIN_Y: readonly [number, number] = [-1, 1];
const DIAMOND_AREA = 200;
const MARK_RADIUS = 8;
const CORE_RADIUS = 3.5;
const LINE_HEIGHT = 14;
const FIRST_OFFSET_ABOVE = 15;
const FIRST_OFFSET_BELOW = 24;
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

/** O marco mais atrasado, ou `null` quando nenhum venceu sem ser atingido. */
function mostLate(points: readonly Point[]): Point | null {
  let worst: Point | null = null;
  for (const point of points) {
    if (point.lateDays > 0 && (worst === null || point.lateDays > worst.lateDays)) worst = point;
  }
  return worst;
}

interface Line {
  readonly text: string;
  readonly color: string;
  readonly weight: number;
  readonly display: boolean;
}

/** As três linhas do rótulo, de cima para baixo: nome, data e estado. */
function labelLines(point: Point): Line[] {
  const name: Line = { text: point.name, color: 'var(--text-primary)', weight: 600, display: false };
  const date: Line = {
    text: point.confirmed ? formatDate(point.date) : `(previsto ${formatDate(point.date)})`,
    color: 'var(--text-secondary)',
    weight: 500,
    display: true,
  };
  if (point.lateDays > 0) {
    return [name, date, { text: `${formatDays(point.lateDays)} de atraso`, color: 'var(--negative)', weight: 600, display: false }];
  }
  const stateText = point.state === 'done' ? 'atingido' : point.state === 'current' ? 'em curso' : point.confirmed ? 'a vencer' : 'data a confirmar';
  return [name, date, { text: stateText, color: 'var(--text-muted)', weight: 500, display: false }];
}

export default function MilestoneRuler({ data = defaultData, today = defaultToday, height, className }: MilestoneRulerProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum marco neste trimestre: não há entregas com data registrada para acompanhar.</span>
      </div>
    );
  }

  const todayMs = toMs(today);
  const sorted = [...data].sort((a, b) => toMs(a.date) - toMs(b.date));
  const points: Point[] = sorted.map((item, index) => {
    const x = toMs(item.date);
    const lateDays = item.state !== 'done' && x < todayMs ? Math.round((todayMs - x) / MS_PER_DAY) : 0;
    return { ...item, x, y: LANE_Y, above: index % 2 === 0, lateDays };
  });
  const firstMs = Math.min(todayMs, ...points.map((point) => point.x));
  const lastMs = Math.max(todayMs, ...points.map((point) => point.x));
  const domainX: [number, number] = [monthStart(firstMs, 0), monthStart(lastMs, 1) + 14 * MS_PER_DAY];
  const ticks = monthTicks(domainX[0], domainX[1]);
  const doneCount = points.filter((point) => point.state === 'done').length;
  const currentCount = points.filter((point) => point.state === 'current').length;
  const late = mostLate(points);
  const lateCount = points.filter((point) => point.lateDays > 0).length;

  const reading = late
    ? `${formatInt(doneCount)} de ${formatInt(points.length)} marcos atingidos; “${late.name}” está atrasado há ${formatDays(late.lateDays)}.`
    : `${formatInt(doneCount)} de ${formatInt(points.length)} marcos atingidos e nenhum atrasado em ${formatDate(today)}.`;

  const summary = [
    `Régua com ${formatInt(points.length)} marcos do trimestre em ${formatDate(today)}.`,
    `${formatInt(doneCount)} atingidos, ${formatInt(currentCount)} em curso e ${formatInt(lateCount)} ${lateCount === 1 ? 'atrasado' : 'atrasados'}.`,
    late ? `O maior atraso é de ${formatDays(late.lateDays)}, no marco “${late.name}”.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderPoint = ({ cx, cy, payload }: PointShapeProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || !payload) return null;
    const r = MARK_RADIUS;
    const path = `M${String(cx)},${String(cy - r)} L${String(cx + r)},${String(cy)} L${String(cx)},${String(cy + r)} L${String(cx - r)},${String(cy)} Z`;
    if (payload.lateDays > 0) {
      return (
        <g>
          <path d={path} fill="var(--negative)" stroke="var(--surface-raised)" strokeWidth={1.5} />
          <text className="font-display" fill="var(--surface-raised)" fontSize={11} fontWeight={700} textAnchor="middle" x={cx} y={cy + 4}>
            !
          </text>
        </g>
      );
    }
    if (payload.state === 'done') {
      return <path d={path} fill="var(--chart-1)" stroke="var(--surface-raised)" strokeWidth={1.5} />;
    }
    if (payload.state === 'current') {
      const c = CORE_RADIUS;
      const core = `M${String(cx)},${String(cy - c)} L${String(cx + c)},${String(cy)} L${String(cx)},${String(cy + c)} L${String(cx - c)},${String(cy)} Z`;
      return (
        <g>
          <path d={path} fill="var(--surface-raised)" stroke="var(--chart-1)" strokeWidth={2} />
          <path d={core} fill="var(--chart-1)" />
        </g>
      );
    }
    return <path d={path} fill="var(--surface-raised)" stroke="var(--text-muted)" strokeDasharray={payload.confirmed ? undefined : '3 2'} strokeWidth={2} />;
  };

  const renderLabel = ({ x, y, width, height, index }: LabelProps): ReactElement | null => {
    const point = index === undefined ? undefined : points[index];
    if (x === undefined || y === undefined || !point) return null;
    const lines = labelLines(point);
    const px = Number(x) + Number(width ?? 0) / 2;
    const py = Number(y) + Number(height ?? 0) / 2;
    const top = point.above ? py - FIRST_OFFSET_ABOVE - LINE_HEIGHT * (lines.length - 1) : py + FIRST_OFFSET_BELOW;
    return (
      <g>
        {lines.map((line, i) => (
          <text
            className={line.display ? 'font-display' : 'font-sans'}
            fill={line.color}
            fontSize={11}
            fontWeight={line.weight}
            key={line.text}
            style={HALO}
            textAnchor="middle"
            x={px}
            y={top + LINE_HEIGHT * i}
          >
            {line.text}
          </text>
        ))}
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
            <YAxis dataKey="y" domain={[...DOMAIN_Y]} hide type="number" />
            {/* REC-15: sem ZAxis registrado a marca volta ao tamanho padrão de 64 px². */}
            <ZAxis range={[DIAMOND_AREA, DIAMOND_AREA]} type="number" />
            {/* Trecho a percorrer primeiro e o percorrido depois: quem vem depois no documento é pintado por cima. */}
            <ReferenceLine
              ifOverflow="extendDomain"
              segment={[
                { x: todayMs, y: LANE_Y },
                { x: domainX[1], y: LANE_Y },
              ]}
              stroke="var(--line-strong)"
              strokeWidth={3}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              segment={[
                { x: domainX[0], y: LANE_Y },
                { x: todayMs, y: LANE_Y },
              ]}
              stroke="var(--chart-1)"
              strokeWidth={3}
            />
            {/* REC-1: sem extendDomain a linha de hoje some quando cai fora do domínio. */}
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{ fill: 'var(--text-muted)', fontSize: 11, position: 'top', value: `hoje, ${formatDate(today)}` }}
              stroke="var(--text-muted)"
              strokeDasharray="4 4"
              x={todayMs}
            />
            <Scatter data={points} isAnimationActive={animate} shape={renderPoint}>
              <LabelList content={renderLabel} dataKey="name" />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
