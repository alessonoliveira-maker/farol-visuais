import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useXAxisScale,
  type BarShapeProps,
  type TooltipContentProps,
} from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  today as defaultToday,
  windowEnd as defaultWindowEnd,
  windowStart as defaultWindowStart,
  type Creative,
} from './data';

/**
 * Gantt empacotado: criativos anônimos entram na primeira faixa livre, em ordem de início, e cada
 * faixa vira uma linha. Passou de 7 faixas, o excedente vira uma barra "+N" com a lista na dica.
 * Criativo sem data de fim vai até hoje com a ponta tracejada; sem data de início fica fora do eixo.
 */
export interface PackedCreativesProps {
  /** Criativos com início e fim inclusive. A ordem de entrada não importa: o empacotamento ordena por início e id. */
  readonly data?: readonly Creative[];
  /** Hoje, em YYYY-MM-DD, vindo do dado. */
  readonly today?: string;
  /** Primeiro e último dia do eixo, em YYYY-MM-DD. */
  readonly windowStart?: string;
  readonly windowEnd?: string;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const DAY_MS = 86_400_000;
/** Teto de linhas: 7 faixas de criativos mais a do excedente. */
const MAX_LANES = 7;
const LANE_AXIS_WIDTH = 92;
/** Topo reservado ao rótulo de hoje; direita reservada ao último tique do eixo, que cai na borda. */
const MARGIN = { top: 20, right: 26, bottom: 2, left: 0 } as const;
const AXIS_HEIGHT = 24;
const BAR_FILL = 'var(--chart-1)';
const OVERFLOW_FILL = 'var(--text-muted)';
const BAR_RADIUS = 2;
/** Comprimento da ponta tracejada do criativo em aberto. */
const OPEN_TIP = 24;
const LABEL_GAP = 6;
/** Camada de rótulo do Recharts (2000): texto por cima de qualquer barra. */
const LABEL_Z = 2000;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

/** Criativo com período no eixo, em dias contados do primeiro dia da janela. Fim exclusivo. */
interface Placed {
  readonly id: string;
  readonly name: string;
  readonly from: number;
  readonly to: number;
  /** Sem data de fim: desenhado até hoje. */
  readonly open: boolean;
  readonly start: string;
  readonly end: string | null;
}

interface Lane {
  readonly id: string;
  readonly label: string;
  readonly items: readonly Placed[];
  readonly overflow: boolean;
}

/** Uma linha do gráfico: pares gap/duração por posição, `g0, d0, g1, d1...`, em dias. */
type LaneRow = Readonly<Record<string, number | string>>;

/** Data YYYY-MM-DD em milissegundos UTC. */
function toMs(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Primeiro dia de cada mês dentro do eixo, em dias contados do início dele. */
function monthTickDays(startMs: number, endMs: number): number[] {
  const first = new Date(startMs);
  const year = first.getUTCFullYear();
  let month = first.getUTCMonth();
  let tick = Date.UTC(year, month, 1);
  if (tick < startMs) {
    month += 1;
    tick = Date.UTC(year, month, 1);
  }
  const ticks: number[] = [];
  while (tick <= endMs) {
    ticks.push(Math.round((tick - startMs) / DAY_MS));
    month += 1;
    tick = Date.UTC(year, month, 1);
  }
  return ticks;
}

/**
 * Empacotamento guloso e determinístico: por início e depois por id, cada criativo vai para a
 * primeira faixa que já terminou; sem faixa livre e com o teto cheio, vai para o excedente.
 */
function pack(
  data: readonly Creative[],
  startMs: number,
  todayMs: number,
): { readonly lanes: Lane[]; readonly overflow: Placed[]; readonly undated: Creative[] } {
  const undated = data.filter((item) => item.start === null);
  const placed = data
    .flatMap((item): Placed[] => {
      if (item.start === null) return [];
      const endMs = (item.end === null ? todayMs : toMs(item.end)) + DAY_MS;
      return [
        {
          id: item.id,
          name: item.name,
          from: Math.round((toMs(item.start) - startMs) / DAY_MS),
          to: Math.round((endMs - startMs) / DAY_MS),
          open: item.end === null,
          start: item.start,
          end: item.end,
        },
      ];
    })
    .sort((a, b) => a.from - b.from || a.id.localeCompare(b.id));

  const lists: Placed[][] = [];
  const overflow: Placed[] = [];
  for (const item of placed) {
    const free = lists.find((list) => (list[list.length - 1]?.to ?? 0) <= item.from);
    if (free) free.push(item);
    else if (lists.length < MAX_LANES) lists.push([item]);
    else overflow.push(item);
  }

  const lanes: Lane[] = lists.map((items, index) => ({
    id: `lane-${String(index + 1)}`,
    label: `Faixa ${String(index + 1)}`,
    items,
    overflow: false,
  }));
  return { lanes, overflow, undated };
}

/** Pivota a faixa em pares gap/duração; o excedente vira uma só barra, da primeira à última data. */
function toLaneRow(lane: Lane): LaneRow {
  const row: Record<string, number | string> = { id: lane.id };
  if (lane.overflow) {
    const from = Math.min(...lane.items.map((item) => item.from));
    const to = Math.max(...lane.items.map((item) => item.to));
    row.g0 = from;
    row.d0 = to - from;
    return row;
  }
  let previousEnd = 0;
  lane.items.forEach((item, index) => {
    row[`g${String(index)}`] = item.from - previousEnd;
    row[`d${String(index)}`] = item.to - item.from;
    previousEnd = item.to;
  });
  return row;
}

/** Período de um criativo em texto de tela. */
function periodText(item: Placed): string {
  return item.end === null
    ? `desde ${formatDate(item.start)}, em aberto`
    : `${formatDate(item.start)} a ${formatDate(item.end)}`;
}

/** Um segmento de criativo: barra cheia, ponta tracejada quando está em aberto, ou a barra do excedente. */
function Segment({
  bar,
  lane,
  position,
}: {
  readonly bar: BarShapeProps;
  readonly lane: Lane | undefined;
  readonly position: number;
}): ReactElement | null {
  const { x, y, width, height } = bar;
  if (!lane || width <= 0) return null;
  const center = y + height / 2;

  if (lane.overflow) {
    return <rect fill={OVERFLOW_FILL} height={height} rx={BAR_RADIUS} width={width} x={x} y={y} />;
  }

  const item = lane.items[position];
  if (!item) return null;
  if (!item.open) {
    return <rect fill={BAR_FILL} height={height} rx={BAR_RADIUS} width={width} x={x} y={y} />;
  }
  const tip = Math.min(OPEN_TIP, width);
  return (
    <g>
      {width > tip ? <rect fill={BAR_FILL} height={height} rx={BAR_RADIUS} width={width - tip} x={x} y={y} /> : null}
      <rect
        fill="none"
        height={height - 1.5}
        rx={BAR_RADIUS}
        stroke={BAR_FILL}
        strokeDasharray="3 2"
        strokeWidth={1.5}
        width={Math.max(0, tip - 1.5)}
        x={x + width - tip + 0.75}
        y={y + 0.75}
      />
      <text
        className="font-sans"
        dominantBaseline="central"
        fill="var(--text-secondary)"
        fontSize={11}
        fontWeight={500}
        style={HALO}
        x={x + width + LABEL_GAP}
        y={center}
      >
        em aberto
      </text>
    </g>
  );
}

/** Só o rótulo de hoje: a linha em si é uma ReferenceLine que atravessa todas as faixas. */
function TodayLabel({ todayDay, todayMs }: { readonly todayDay: number; readonly todayMs: number }) {
  const xScale = useXAxisScale();
  const plot = usePlotArea();
  const todayX = xScale?.(todayDay);
  if (!plot || todayX === undefined) return null;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      <text
        className="font-display"
        fill="var(--text-primary)"
        fontSize={11}
        fontWeight={600}
        textAnchor="middle"
        x={todayX}
        y={plot.y - 8}
      >
        {`hoje, ${formatDate(toIso(todayMs))}`}
      </text>
    </ZIndexLayer>
  );
}

const emptyShape = (): ReactElement => <g />;

export default function PackedCreatives({
  data = defaultData,
  today = defaultToday,
  windowStart = defaultWindowStart,
  windowEnd = defaultWindowEnd,
  height,
  className,
}: PackedCreativesProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum criativo neste recorte: não há período no ar para empacotar em faixas.</span>
      </div>
    );
  }

  const startMs = toMs(windowStart);
  const endMs = toMs(windowEnd) + DAY_MS;
  const todayMs = toMs(today);
  const todayDay = Math.round((todayMs - startMs) / DAY_MS);
  const totalDays = Math.round((endMs - startMs) / DAY_MS);
  const { lanes: packed, overflow, undated } = pack(data, startMs, todayMs);
  const lanes: Lane[] =
    overflow.length === 0
      ? packed
      : [...packed, { id: 'lane-extra', label: `+${formatInt(overflow.length)} criativos`, items: overflow, overflow: true }];
  const rows = lanes.map(toLaneRow);
  const positions = Math.max(1, ...packed.map((lane) => lane.items.length));
  const laneById = new Map(lanes.map((lane) => [lane.id, lane]));
  const dated = data.length - undated.length;
  const live = [...packed.flatMap((lane) => lane.items), ...overflow].filter(
    (item) => item.from <= todayDay && item.to > todayDay,
  );
  const openCount = live.filter((item) => item.open).length;
  const todayText = formatDate(today);

  const summary = [
    `Gráfico de Gantt empacotado com ${formatInt(dated)} criativos datados em ${formatInt(packed.length)} faixas${overflow.length > 0 ? ` e ${formatInt(overflow.length)} no excedente` : ''}.`,
    `Em ${todayText} seguem no ar ${formatInt(live.length)}, dos quais ${formatInt(openCount)} sem data de fim.`,
    undated.length > 0 ? `${formatInt(undated.length)} sem data de início ficam fora do eixo.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTip = ({ active, label }: TooltipContentProps): ReactElement | null => {
    const lane = laneById.get(String(label ?? ''));
    if (!active || !lane) return null;
    return (
      <div
        className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg"
        data-slot="chart-tooltip"
      >
        <p className="mb-1 font-medium text-text-primary">{lane.overflow ? `Excedente, ${lane.label}` : lane.label}</p>
        <ul className="space-y-0.5">
          {lane.items.map((item) => (
            <li className="flex items-center gap-3" key={item.id}>
              <span className="text-text-secondary">{item.name}</span>
              <span className="kpi-number ml-auto text-text-primary">{periodText(item)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 shrink-0 truncate text-xs text-text-secondary">
        Em {todayText}, <span className="kpi-number font-semibold text-text-primary">{formatInt(live.length)}</span> de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(dated)}</span> criativos seguem no ar,{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(openCount)}</span> sem data de fim
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="26%" data={rows} layout="vertical" margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, totalDays]}
              height={AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatMonthShort(toIso(startMs + value * DAY_MS))}
              tickLine={false}
              tickMargin={8}
              ticks={monthTickDays(startMs, endMs)}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="id"
              interval={0}
              tickFormatter={(value: string) => laneById.get(value)?.label ?? ''}
              tickLine={false}
              type="category"
              width={LANE_AXIS_WIDTH}
            />
            <Tooltip content={renderTip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {/* Um par de séries por posição na faixa, todas no mesmo stackId; o gap é a série sem marca que empurra o criativo. */}
            {Array.from({ length: positions }, (_, position) => [
              <Bar
                dataKey={`g${String(position)}`}
                fill="none"
                isAnimationActive={false}
                key={`g${String(position)}`}
                shape={emptyShape}
                stackId="lane"
              />,
              <Bar
                dataKey={`d${String(position)}`}
                isAnimationActive={animate}
                key={`d${String(position)}`}
                shape={(bar: BarShapeProps) => (
                  <Segment bar={bar} lane={lanes[bar.originalDataIndex]} position={position} />
                )}
                stackId="lane"
              />,
            ])}
            {/* Duas linhas: o fio claro por baixo é o halo que mantém a linha de hoje visível sobre a barra colorida (TOK-10). */}
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--surface-raised)" strokeWidth={5} x={todayDay} />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--text-primary)" strokeWidth={1.5} x={todayDay} />
            <TodayLabel todayDay={todayDay} todayMs={todayMs} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {undated.length > 0 ? (
        <p aria-hidden className="mt-1 shrink-0 truncate text-xs text-text-muted">
          Sem data de início, fora do eixo: {undated.map((item) => item.name).join(' e ')}
        </p>
      ) : null}
    </div>
  );
}
