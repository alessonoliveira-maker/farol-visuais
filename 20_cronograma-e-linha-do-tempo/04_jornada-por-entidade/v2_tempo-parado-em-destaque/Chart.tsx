import { Filter } from 'lucide-react';
import { useId, type ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type TooltipContentProps,
} from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatDays, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  stages as defaultStages,
  stallDays as defaultStallDays,
  today as defaultToday,
  windowEnd as defaultWindowEnd,
  windowStart as defaultWindowStart,
  type OpenOpportunity,
} from './data';

/**
 * Jornada das oportunidades abertas com o tempo parado em destaque: o segmento que passou do limite
 * de dias na etapa leva hachura e o rótulo "parada N d" escrito, e todos os outros caem para o cinza
 * neutro. A última etapa de cada oportunidade vai até hoje, vindo do dado, com a ponta tracejada.
 */
export interface StalledJourneyProps {
  /** Oportunidades abertas; a ordem de entrada não importa, o componente ordena pela pior parada. */
  readonly data?: readonly OpenOpportunity[];
  readonly stages?: readonly string[];
  /** Dias numa etapa acima dos quais ela conta como parada. */
  readonly stallDays?: number;
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
const NAME_AXIS_WIDTH = 124;
/** Direita reservada ao rótulo "etapa, parada N d", que nasce depois da ponta de hoje. */
const MARGIN = { top: 4, right: 156, bottom: 2, left: 0 } as const;
const AXIS_HEIGHT = 24;
/** Neutro de quem não está parado: poço rebaixado com contorno de texto apagado, porque --line-strong como área mede 1,79:1 contra o cartão. */
const NEUTRAL_FILL = 'var(--surface-sunken)';
const NEUTRAL_STROKE = 'var(--text-muted)';
const STALL_COLOR = 'var(--negative)';
const SEGMENT_RADIUS = 2;
const SEGMENT_STROKE = 1.5;
/** Comprimento da ponta tracejada da etapa em aberto. */
const OPEN_TIP = 14;
const LABEL_GAP = 8;
/** Lado do ladrilho da hachura e espessura do traço dela. */
const HATCH_SIZE = 6;
const HATCH_STROKE = 2;
const CATEGORY_GAP = '24%';

/** Etapa de uma oportunidade, em dias contados do primeiro dia do eixo. Fim exclusivo. */
interface Span {
  readonly from: number;
  readonly to: number;
  readonly days: number;
  readonly stalled: boolean;
  readonly open: boolean;
}

interface Journey {
  readonly item: OpenOpportunity;
  readonly spans: readonly Span[];
  /** Índice da etapa parada mais longa, ou -1 quando nenhuma passou do limite. */
  readonly worst: number;
}

type JourneyRow = Readonly<Record<string, number | string>>;

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

/** Etapas de uma oportunidade: cada uma vai até a entrada seguinte, e a última até hoje. */
function buildJourney(item: OpenOpportunity, startMs: number, todayMs: number, stallDays: number): Journey {
  const points = [...item.entries.map(toMs), todayMs];
  const spans = item.entries.map((_, index): Span => {
    const from = Math.round(((points[index] ?? todayMs) - startMs) / DAY_MS);
    const to = Math.round(((points[index + 1] ?? todayMs) - startMs) / DAY_MS);
    return { from, to, days: to - from, stalled: to - from > stallDays, open: index === item.entries.length - 1 };
  });
  let worst = -1;
  spans.forEach((span, index) => {
    if (span.stalled && span.days > (spans[worst]?.days ?? 0)) worst = index;
  });
  return { item, spans, worst };
}

/** Ladrilho da hachura: fundo de cartão e uma diagonal de dois traços que fecham nas bordas do ladrilho. */
function HatchPattern({ id }: { readonly id: string }): ReactElement {
  const size = String(HATCH_SIZE);
  return (
    <pattern height={HATCH_SIZE} id={id} patternUnits="userSpaceOnUse" width={HATCH_SIZE}>
      <rect fill="var(--surface-raised)" height={HATCH_SIZE} width={HATCH_SIZE} />
      <path
        d={`M0 ${size} L${size} 0 M-1 1 L1 -1 M${String(HATCH_SIZE - 1)} ${String(HATCH_SIZE + 1)} L${String(HATCH_SIZE + 1)} ${String(HATCH_SIZE - 1)}`}
        stroke={STALL_COLOR}
        strokeWidth={HATCH_STROKE}
      />
    </pattern>
  );
}

/** Um segmento de etapa: hachura vermelha quando parada, cinza quando não, ponta tracejada na etapa aberta. */
function Segment({
  bar,
  journey,
  stage,
  patternId,
  stages,
  todayDay,
}: {
  readonly bar: BarShapeProps;
  readonly journey: Journey | undefined;
  readonly stage: number;
  readonly patternId: string;
  readonly stages: readonly string[];
  readonly todayDay: number;
}): ReactElement | null {
  const { x, y, width, height } = bar;
  const span = journey?.spans[stage];
  if (!journey || !span || width <= 0) return null;
  const color = span.stalled ? STALL_COLOR : NEUTRAL_STROKE;
  const tip = span.open ? Math.min(OPEN_TIP, width) : 0;
  const bodyWidth = width - tip;
  const center = y + height / 2;
  /** A conta de pixel por dia sai da própria barra: o rótulo cai depois da ponta de hoje, mesmo em etapa do meio. */
  const labelX = x + width + (todayDay - span.to) * (width / span.days) + LABEL_GAP;
  return (
    <g>
      {bodyWidth > 0 ? (
        <rect
          fill={span.stalled ? `url(#${patternId})` : NEUTRAL_FILL}
          height={height}
          rx={SEGMENT_RADIUS}
          stroke={color}
          strokeWidth={SEGMENT_STROKE}
          width={bodyWidth}
          x={x}
          y={y}
        />
      ) : null}
      {tip > 0 ? (
        <rect
          fill="none"
          height={height - SEGMENT_STROKE}
          rx={SEGMENT_RADIUS}
          stroke={color}
          strokeDasharray="3 2"
          strokeWidth={SEGMENT_STROKE}
          width={Math.max(0, tip - SEGMENT_STROKE)}
          x={x + bodyWidth + SEGMENT_STROKE / 2}
          y={y + SEGMENT_STROKE / 2}
        />
      ) : null}
      {stage === journey.worst ? (
        <text
          className="font-display"
          dominantBaseline="central"
          fill={STALL_COLOR}
          fontSize={11}
          fontWeight={600}
          x={labelX}
          y={center}
        >
          {`${stages[stage] ?? ''}, parada ${formatInt(span.days)} d`}
        </text>
      ) : null}
    </g>
  );
}

const emptyShape = (): ReactElement => <g />;

export default function StalledJourney({
  data = defaultData,
  stages = defaultStages,
  stallDays = defaultStallDays,
  today = defaultToday,
  windowStart = defaultWindowStart,
  windowEnd = defaultWindowEnd,
  height,
  className,
}: StalledJourneyProps) {
  const animate = useAnimateOnce();
  const patternId = `hatch-${useId().replace(/:/g, '')}`;
  const legendPatternId = `${patternId}-legenda`;
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade aberta neste recorte: não há etapa para medir o tempo parado.</span>
      </div>
    );
  }

  const startMs = toMs(windowStart);
  const endMs = toMs(windowEnd) + DAY_MS;
  const todayMs = toMs(today);
  const todayDay = Math.round((todayMs - startMs) / DAY_MS);
  const totalDays = Math.round((endMs - startMs) / DAY_MS);
  /** O primeiro item do array nasce no alto no BarChart vertical: a pior parada fica em cima, e a mensagem é a primeira linha. */
  const journeys = data
    .map((item) => buildJourney(item, startMs, todayMs, stallDays))
    .sort(
      (a, b) =>
        (b.spans[b.worst]?.days ?? 0) - (a.spans[a.worst]?.days ?? 0) ||
        (a.item.entries[0] ?? '').localeCompare(b.item.entries[0] ?? '') ||
        a.item.id.localeCompare(b.item.id),
    );
  const journeyById = new Map(journeys.map((journey) => [journey.item.id, journey]));
  const rows: JourneyRow[] = journeys.map((journey) => {
    const row: Record<string, number | string> = { id: journey.item.id, g: journey.spans[0]?.from ?? 0 };
    journey.spans.forEach((span, index) => {
      row[`s${String(index)}`] = span.days;
    });
    return row;
  });

  const stalledJourneys = journeys.filter((journey) => journey.worst >= 0);
  const top = stalledJourneys[0];
  const topSpan = top?.spans[top.worst];
  const topStage = top ? (stages[top.worst] ?? '').toLowerCase() : '';

  const summary = [
    `Gráfico de jornada com ${formatInt(journeys.length)} oportunidades abertas, uma linha por oportunidade e um segmento por etapa.`,
    `${formatInt(stalledJourneys.length)} passaram de ${formatDays(stallDays)} em alguma etapa.`,
    topSpan ? `A maior parada é em ${topStage}, com ${formatDays(topSpan.days)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTip = ({ active, label }: TooltipContentProps): ReactElement | null => {
    const journey = journeyById.get(String(label ?? ''));
    if (!active || !journey) return null;
    const points = [...journey.item.entries, today];
    return (
      <div
        className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg"
        data-slot="chart-tooltip"
      >
        <p className="mb-1 font-medium text-text-primary">{journey.item.name}</p>
        <ul className="space-y-0.5">
          {journey.spans.map((span, index) => (
            <li className="flex items-center gap-3" key={stages[index] ?? String(index)}>
              <span className={cn('text-text-secondary', span.stalled && 'font-semibold text-negative')}>{stages[index]}</span>
              <span className="kpi-number ml-auto text-text-primary">
                {formatDays(span.days)}, {formatDate(points[index] ?? today)} a {span.open ? 'hoje' : formatDate(points[index + 1] ?? today)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 shrink-0 truncate text-xs text-text-secondary">
        <span className="kpi-number font-semibold text-text-primary">{formatInt(stalledJourneys.length)}</span> de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(journeys.length)}</span> oportunidades abertas passaram de{' '}
        {formatDays(stallDays)} em alguma etapa
        {topSpan ? (
          <>
            ; a maior parada é em <span className="font-semibold text-text-primary">{topStage}</span>
          </>
        ) : null}
      </p>
      <div aria-hidden className="mb-1 flex shrink-0 items-center gap-4 text-[0.6875rem] text-text-muted">
        <span className="flex items-center gap-1.5">
          <svg height={12} width={16}>
            <defs>
              <HatchPattern id={legendPatternId} />
            </defs>
            <rect fill={`url(#${legendPatternId})`} height={11} rx={SEGMENT_RADIUS} stroke={STALL_COLOR} strokeWidth={1} width={15} x={0.5} y={0.5} />
          </svg>
          mais de {formatDays(stallDays)} na etapa
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 shrink-0 rounded-sm" style={{ background: NEUTRAL_FILL, border: `1.5px solid ${NEUTRAL_STROKE}` }} />
          dentro do prazo
        </span>
        <span className="flex items-center gap-1.5">
          <svg height={12} width={16}>
            <rect fill="none" height={10} rx={SEGMENT_RADIUS} stroke={NEUTRAL_STROKE} strokeDasharray="3 2" strokeWidth={1.5} width={14} x={1} y={1} />
          </svg>
          etapa aberta até hoje, {formatDate(today)}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <defs>
              <HatchPattern id={patternId} />
            </defs>
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
              tickFormatter={(value: string) => journeyById.get(value)?.item.name ?? ''}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Tooltip content={renderTip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {/* A série `g` não desenha: é o vão da criação até o início do eixo, e empurra a pilha para a data certa. */}
            <Bar dataKey="g" fill="none" isAnimationActive={false} shape={emptyShape} stackId="journey" />
            {stages.map((stage, index) => (
              <Bar
                dataKey={`s${String(index)}`}
                isAnimationActive={animate}
                key={stage}
                shape={(bar: BarShapeProps) => (
                  <Segment
                    bar={bar}
                    journey={journeys[bar.originalDataIndex]}
                    patternId={patternId}
                    stage={index}
                    stages={stages}
                    todayDay={todayDay}
                  />
                )}
                stackId="journey"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
