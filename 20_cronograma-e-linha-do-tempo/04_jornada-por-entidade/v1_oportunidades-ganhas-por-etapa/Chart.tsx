import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
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
  windowEnd as defaultWindowEnd,
  windowStart as defaultWindowStart,
  type WonOpportunity,
} from './data';

/**
 * Jornada por entidade: uma linha por oportunidade ganha, com um segmento por etapa na ordem do
 * funil. O comprimento do segmento é o tempo na etapa; o losango no fim é o fechamento ganho. As
 * linhas seguem a data de criação, da mais antiga para a mais nova, e a mesma etapa longa repetida
 * em muitas linhas é o gargalo.
 */
export interface WonJourneyProps {
  /** Oportunidades ganhas; a ordem de entrada não importa, o componente ordena pela criação. */
  readonly data?: readonly WonOpportunity[];
  /** Nomes das etapas, na ordem do funil. */
  readonly stages?: readonly string[];
  /** Primeiro e último dia do eixo, em YYYY-MM-DD. */
  readonly windowStart?: string;
  readonly windowEnd?: string;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const DAY_MS = 86_400_000;
const NAME_AXIS_WIDTH = 124;
/** Direita reservada ao losango do último dia e ao último tique, que caem na borda. */
const MARGIN = { top: 4, right: 20, bottom: 2, left: 0 } as const;
const AXIS_HEIGHT = 24;
/**
 * Cor por identidade de etapa, nos slots categóricos 1, 3, 6 e 5 (COR-8), todos acima de 3:1 contra o
 * cartão nos dois temas. A rampa sequencial não serve: só --seq-5 a --seq-7 passam de 3:1 nos dois
 * temas (TOK-8) e o funil tem quatro etapas. A ordem mora na posição fixa e na legenda escrita; o
 * contorno de cartão separa os vizinhos (COR-5).
 */
const STAGE_COLORS = ['var(--chart-1)', 'var(--chart-3)', 'var(--chart-6)', 'var(--chart-5)'] as const;
const WON_FILL = 'var(--positive)';
const SEGMENT_RADIUS = 2;
const SEGMENT_STROKE = 1.5;
/** Meia diagonal do losango de fechamento. */
const DIAMOND = 5;
/** Vão de categoria de 24%: a barra ocupa 52% da banda e chega a 12 px com 15 linhas no canvas alto (ESP-2). */
const CATEGORY_GAP = '24%';

/** Uma linha do gráfico: dias contados do primeiro dia do eixo, `g` até a criação e `s0..s3` por etapa. */
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

/** Mediana de uma lista; `null` para lista vazia, nunca 0 (EST-1b). */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle];
  const lower = sorted[middle - 1];
  if (upper === undefined) return null;
  return sorted.length % 2 === 1 || lower === undefined ? upper : (lower + upper) / 2;
}

/** Dias de cada etapa: da entrada até a entrada seguinte, e a última até o fechamento. */
function stageDays(item: WonOpportunity): number[] {
  const points = [...item.entries, item.closed].map(toMs);
  return item.entries.map((_, index) => Math.round(((points[index + 1] ?? 0) - (points[index] ?? 0)) / DAY_MS));
}

/** Um segmento de etapa; o da última etapa leva o losango do fechamento ganho na ponta. */
function Segment({
  bar,
  last,
  stage,
}: {
  readonly bar: BarShapeProps;
  readonly last: boolean;
  readonly stage: number;
}): ReactElement | null {
  const { x, y, width, height } = bar;
  if (width <= 0) return null;
  const tipX = x + width;
  const center = y + height / 2;
  return (
    <g>
      <rect
        fill={STAGE_COLORS[stage] ?? STAGE_COLORS[0]}
        height={height}
        rx={SEGMENT_RADIUS}
        stroke="var(--surface-raised)"
        strokeWidth={SEGMENT_STROKE}
        width={width}
        x={x}
        y={y}
      />
      {last ? (
        <polygon
          fill={WON_FILL}
          points={`${String(tipX)},${String(center - DIAMOND)} ${String(tipX + DIAMOND)},${String(center)} ${String(tipX)},${String(center + DIAMOND)} ${String(tipX - DIAMOND)},${String(center)}`}
          stroke="var(--surface-raised)"
          strokeWidth={1}
        />
      ) : null}
    </g>
  );
}

const emptyShape = (): ReactElement => <g />;

export default function WonJourney({
  data = defaultData,
  stages = defaultStages,
  windowStart = defaultWindowStart,
  windowEnd = defaultWindowEnd,
  height,
  className,
}: WonJourneyProps) {
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
        <span>Nenhuma oportunidade ganha neste recorte: não há jornada de etapas para desenhar.</span>
      </div>
    );
  }

  const startMs = toMs(windowStart);
  const endMs = toMs(windowEnd) + DAY_MS;
  const totalDays = Math.round((endMs - startMs) / DAY_MS);
  /** O primeiro item do array nasce no alto no BarChart vertical, então a mais antiga fica em cima. */
  const items = [...data].sort((a, b) => a.entries[0].localeCompare(b.entries[0]) || a.id.localeCompare(b.id));
  const daysById = new Map(items.map((item) => [item.id, stageDays(item)]));
  const itemById = new Map(items.map((item) => [item.id, item]));
  const rows: JourneyRow[] = items.map((item) => {
    const row: Record<string, number | string> = {
      id: item.id,
      g: Math.round((toMs(item.entries[0]) - startMs) / DAY_MS),
    };
    (daysById.get(item.id) ?? []).forEach((days, index) => {
      row[`s${String(index)}`] = days;
    });
    return row;
  });

  const stageMedians = stages.map((_, index) => median(items.map((item) => daysById.get(item.id)?.[index] ?? 0)));
  const cycleMedian = median(items.map((item) => (daysById.get(item.id) ?? []).reduce((sum, days) => sum + days, 0)));
  let longest = -1;
  stageMedians.forEach((value, index) => {
    if (value !== null && value > (stageMedians[longest] ?? -1)) longest = index;
  });
  const longestName = stages[longest]?.toLowerCase() ?? '';
  const longestMedian = stageMedians[longest] ?? null;

  const summary = [
    `Gráfico de jornada com ${formatInt(items.length)} oportunidades ganhas, uma linha por oportunidade e um segmento por etapa.`,
    cycleMedian === null ? '' : `O ciclo mediano é de ${formatDays(cycleMedian)}.`,
    longestMedian === null ? '' : `A etapa de maior mediana é ${longestName}, com ${formatDays(longestMedian)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderTip = ({ active, label }: TooltipContentProps): ReactElement | null => {
    const item = itemById.get(String(label ?? ''));
    const days = daysById.get(String(label ?? ''));
    if (!active || !item || !days) return null;
    const points = [...item.entries, item.closed];
    return (
      <div
        className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg"
        data-slot="chart-tooltip"
      >
        <p className="mb-1 font-medium text-text-primary">{item.name}</p>
        <ul className="space-y-0.5">
          {stages.map((stage, index) => (
            <li className="flex items-center gap-3" key={stage}>
              <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ background: STAGE_COLORS[index] }} />
              <span className="text-text-secondary">{stage}</span>
              <span className="kpi-number ml-auto text-text-primary">
                {formatDays(days[index] ?? 0)}, {formatDate(points[index] ?? item.closed)} a {formatDate(points[index + 1] ?? item.closed)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {longestMedian === null || cycleMedian === null ? null : (
        <p aria-hidden className="mb-1 shrink-0 truncate text-xs text-text-secondary">
          Ciclo mediano de <span className="kpi-number font-medium text-text-primary">{formatDays(cycleMedian)}</span>; a etapa mais
          longa é <span className="font-semibold text-text-primary">{longestName}</span>, com mediana de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatDays(longestMedian)}</span>
        </p>
      )}
      <div aria-hidden className="mb-1 flex shrink-0 items-center gap-4 text-[0.6875rem] text-text-muted">
        {stages.map((stage, index) => (
          <span className="flex items-center gap-1.5" key={stage}>
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: STAGE_COLORS[index] }} />
            {stage}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <svg height={12} width={12}>
            <polygon fill={WON_FILL} points="6,1 11,6 6,11 1,6" />
          </svg>
          Ganha
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
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
              tickFormatter={(value: string) => itemById.get(value)?.name ?? ''}
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
                shape={(bar: BarShapeProps) => <Segment bar={bar} last={index === stages.length - 1} stage={index} />}
                stackId="journey"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
