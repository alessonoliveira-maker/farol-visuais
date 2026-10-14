import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  type LabelProps,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatDays, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, today as defaultToday, type PlanMilestone } from './data';

/** Linha do tempo de marcos do plano: cada marco na data exata, rótulo alternado acima e abaixo do eixo, linha de hoje. */
export interface MilestoneTimelineProps {
  readonly data?: readonly PlanMilestone[];
  readonly today?: string;
  readonly height?: number;
  readonly className?: string;
}

interface Point extends PlanMilestone {
  readonly x: number;
  readonly y: number;
  readonly above: boolean;
}

const MARGIN = { top: 20, right: 24, bottom: 4, left: 32 } as const;
const MS_PER_DAY = 86_400_000;
const LANE_Y = 0;
const DOMAIN_Y: readonly [number, number] = [-1, 1];
const DIAMOND_AREA = 110;
const NAME_OFFSET_ABOVE = 30;
const DATE_OFFSET_ABOVE = 15;
const NAME_OFFSET_BELOW = 22;
const DATE_OFFSET_BELOW = 37;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Milissegundos UTC de uma data `YYYY-MM-DD`, sem `Date` sem argumento. */
function toMs(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** Primeiro dia do mês, em milissegundos UTC, deslocado por `shift` meses. */
function monthStart(ms: number, shift: number): number {
  const date = new Date(ms);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + shift, 1);
}

/** Primeiro dia de cada mês que cabe no domínio, em milissegundos UTC. */
function monthTicks(from: number, to: number): number[] {
  const ticks: number[] = [];
  let cursor = monthStart(from, 0);
  while (cursor <= to) {
    if (cursor >= from) ticks.push(cursor);
    cursor = monthStart(cursor, 1);
  }
  return ticks;
}

/** Primeiro marco depois de hoje, ou `null` quando o plano já acabou. */
function nextAfter(points: readonly Point[], todayMs: number): Point | null {
  return points.find((point) => point.x > todayMs) ?? null;
}

export default function MilestoneTimeline({ data = defaultData, today = defaultToday, height, className }: MilestoneTimelineProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum marco neste recorte: o plano não tem datas registradas para o período.</span>
      </div>
    );
  }

  const todayMs = toMs(today);
  const sorted = [...data].sort((a, b) => toMs(a.date) - toMs(b.date));
  // Alternar acima e abaixo pela ordem de data: marcos vizinhos nunca dividem o mesmo lado.
  const points: Point[] = sorted.map((item, index) => ({ ...item, x: toMs(item.date), y: LANE_Y, above: index % 2 === 0 }));
  const firstMs = Math.min(todayMs, ...points.map((point) => point.x));
  const lastMs = Math.max(todayMs, ...points.map((point) => point.x));
  const first = points[0];
  const last = points[points.length - 1];
  const domainX: [number, number] = [monthStart(firstMs, 0), monthStart(lastMs, 1) + 14 * MS_PER_DAY];
  const ticks = monthTicks(domainX[0], domainX[1]);
  const passed = points.filter((point) => point.x <= todayMs).length;
  const next = nextAfter(points, todayMs);
  const daysToNext = next ? Math.round((next.x - todayMs) / MS_PER_DAY) : null;

  const reading =
    next && daysToNext !== null
      ? `${formatInt(passed)} de ${formatInt(points.length)} marcos já passaram; o próximo, “${next.name}”, cai em ${formatDate(next.date)}, daqui a ${formatDays(daysToNext)}.`
      : `Os ${formatInt(points.length)} marcos do plano já passaram; o último foi em ${last ? formatDate(last.date) : ''}.`;

  const summary = [
    first && last ? `Linha do tempo com ${formatInt(points.length)} marcos do plano, de ${formatDate(first.date)} a ${formatDate(last.date)}.` : '',
    `${formatInt(passed)} já passaram em ${formatDate(today)}.`,
    next ? `O próximo marco é “${next.name}”, em ${formatDate(next.date)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const delta = Math.round((point.x - todayMs) / MS_PER_DAY);
    const when = delta === 0 ? 'hoje' : delta > 0 ? `faltam ${formatDays(delta)}` : `passou há ${formatDays(-delta)}`;
    const entries = [
      { dataKey: 'date', name: 'Data', value: formatDate(point.date) },
      { dataKey: 'delta', name: 'Contra hoje', value: when },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  const renderLabel = ({ x, y, width, height, index }: LabelProps): ReactElement | null => {
    const point = index === undefined ? undefined : points[index];
    if (x === undefined || y === undefined || !point) return null;
    const px = Number(x) + Number(width ?? 0) / 2;
    const py = Number(y) + Number(height ?? 0) / 2;
    const nameY = point.above ? py - NAME_OFFSET_ABOVE : py + NAME_OFFSET_BELOW;
    const dateY = point.above ? py - DATE_OFFSET_ABOVE : py + DATE_OFFSET_BELOW;
    return (
      <g>
        <text className="font-sans" fill="var(--text-primary)" fontSize={11} fontWeight={600} style={HALO} textAnchor="middle" x={px} y={nameY}>
          {point.name}
        </text>
        <text className="font-display" fill="var(--text-secondary)" fontSize={11} style={HALO} textAnchor="middle" x={px} y={dateY}>
          {formatDate(point.date)}
        </text>
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
            {/* REC-15: sem ZAxis registrado o diamante volta ao tamanho padrão de 64 px². */}
            <ZAxis range={[DIAMOND_AREA, DIAMOND_AREA]} type="number" />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={LANE_Y} />
            {/* REC-1: sem extendDomain a linha de hoje some quando cai fora do domínio. */}
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{ fill: 'var(--text-muted)', fontSize: 11, position: 'top', value: `hoje, ${formatDate(today)}` }}
              stroke="var(--text-muted)"
              strokeDasharray="4 4"
              x={todayMs}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={points} fill="var(--chart-1)" isAnimationActive={animate} shape="diamond" stroke="var(--surface-raised)" strokeWidth={1.5}>
              <LabelList content={renderLabel} dataKey="name" />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
