import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZIndexLayer,
  useXAxisScale,
  useYAxisScale,
  type TooltipContentProps,
} from 'recharts';

import { CURSOR_COLOR, AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatDays, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, stages as defaultStages, today as defaultToday, windowStart as defaultWindowStart, type Pursuit } from './data';

/**
 * Diagrama de Marey das oportunidades do trimestre: o eixo X é o calendário, o eixo Y é a etapa, e
 * cada oportunidade é uma linha em degrau que sobe de etapa em etapa. Descida é retorno de etapa e
 * leva marcador com a data da volta; a oportunidade aberta termina em hoje com traço tracejado. A mais
 * rápida e a mais lenta das ganhas ficam em cor, e as demais em cinza.
 */
export interface MareyJourneyProps {
  /** Oportunidades do trimestre, cada uma com os dias em que mudou de etapa. */
  readonly data?: readonly Pursuit[];
  /** Nomes das etapas na ordem do funil; a última é o fechamento ganho. */
  readonly stages?: readonly string[];
  /** Hoje, em YYYY-MM-DD, vindo do dado. */
  readonly today?: string;
  /** Primeiro dia do eixo, em YYYY-MM-DD. */
  readonly windowStart?: string;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const DAY_MS = 86_400_000;
const Y_AXIS_WIDTH = 92;
/** Direita reservada ao rótulo "em aberto", que nasce depois da ponta de hoje. */
const MARGIN = { top: 4, right: 68, bottom: 2, left: 0 } as const;
const AXIS_HEIGHT = 24;
/** Folga acima da última etapa para os rótulos de fim de linha das duas oportunidades em cor. */
const Y_TOP_PADDING = 0.65;
const Y_BOTTOM_PADDING = 0.3;
const FAST_COLOR = 'var(--chart-1)';
const SLOW_COLOR = 'var(--chart-3)';
const NEUTRAL_COLOR = 'var(--text-muted)';
const NEUTRAL_WIDTH = 1.5;
const HIGHLIGHT_WIDTH = 3;
const OPEN_DASH = '4 4';
const MARK_RADIUS = 5;
const LABEL_GAP = 8;
/** Camada de rótulo do Recharts (2000): texto e marcador por cima de qualquer linha. */
const LABEL_Z = 2000;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface Point {
  readonly day: number;
  readonly stage: number;
}

interface Track {
  readonly pursuit: Pursuit;
  readonly points: readonly Point[];
  readonly closed: boolean;
  /** Dias da criação até o ganho; nas abertas, até hoje. */
  readonly elapsed: number;
  readonly returns: readonly Return[];
}

/** Retorno de etapa: o ponto de chegada, a etapa de que a oportunidade saiu e a data da volta. */
interface Return extends Point {
  readonly date: string;
  readonly from: number;
}

/** Degrau vertical de uma mudança de etapa: o dia e as duas etapas que ele liga. */
interface Riser {
  readonly day: number;
  readonly lo: number;
  readonly hi: number;
}

type DayRow = Readonly<Record<string, number | null>>;

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

/** Converte os movimentos em pontos no eixo, acha os retornos e mede o tempo até o ganho ou até hoje. */
function buildTrack(pursuit: Pursuit, startMs: number, todayDay: number, lastStage: number): Track {
  const points = pursuit.moves.map((move) => ({ day: Math.round((toMs(move.date) - startMs) / DAY_MS), stage: move.stage }));
  const last = points[points.length - 1];
  const first = points[0];
  const closed = last?.stage === lastStage;
  const returns = pursuit.moves.flatMap((move, index) => {
    const before = pursuit.moves[index - 1];
    const point = points[index];
    return before && point && move.stage < before.stage ? [{ ...point, date: move.date, from: before.stage }] : [];
  });
  return {
    pursuit,
    points,
    closed,
    elapsed: closed ? (last?.day ?? 0) - (first?.day ?? 0) : todayDay - (first?.day ?? 0),
    returns,
  };
}

/** Etapa em que a oportunidade estava num dia: a do último movimento até ele, ou `null` fora da vida dela. */
function stageAt(track: Track, day: number, todayDay: number): { readonly solid: number | null; readonly tail: number | null } {
  const first = track.points[0];
  const last = track.points[track.points.length - 1];
  if (!first || !last || day < first.day) return { solid: null, tail: null };
  let stage = first.stage;
  for (const point of track.points) {
    if (point.day <= day) stage = point.stage;
  }
  if (day <= last.day) return { solid: stage, tail: track.closed || day < last.day ? null : stage };
  return { solid: null, tail: track.closed || day > todayDay ? null : stage };
}

interface EndLabel {
  readonly day: number;
  readonly stage: number;
  readonly text: string;
  readonly anchor: 'start' | 'end';
}

interface MarkedReturn extends Return {
  readonly color: string;
}

interface MarksProps {
  readonly returns: readonly MarkedReturn[];
  readonly risers: readonly Riser[];
  readonly endLabels: readonly EndLabel[];
  readonly openStages: readonly number[];
  readonly todayDay: number;
}

/** Largura estimada de um caractere do rótulo de retorno (11 px, peso 600). */
const CHAR_WIDTH = 6.4;
const LABEL_CLEARANCE = 3;
const LABEL_NEAR = MARK_RADIUS + 4;
/** A faixa entre níveis tem cerca de 40 px: cabem duas linhas de rótulo, 8 px acima e 8 px abaixo do centro. */
const LABEL_ROWS = [-8, 8] as const;
const LABEL_ROW_GAP = 16;

interface Box {
  readonly left: number;
  readonly right: number;
  readonly dy: number;
}

/**
 * Posição do rótulo de um retorno: no meio da faixa entre dois níveis, onde só passam degraus verticais.
 * Procura, do lado mais perto para o mais longe e dos dois lados, o primeiro x em que a caixa do texto não
 * contém nenhum degrau que cruze a faixa nem toca outro rótulo; o rótulo sai do lugar, o traço fica (GEO-4).
 */
function placeReturnLabel(
  x: number,
  stage: number,
  width: number,
  risers: readonly Riser[],
  riserX: (day: number) => number | undefined,
  taken: readonly Box[],
  bounds: readonly [number, number],
): { readonly start: number; readonly anchor: 'start' | 'end'; readonly dy: number } {
  const blockers = risers
    .filter((riser) => riser.lo <= stage && riser.hi >= stage + 1)
    .flatMap((riser) => {
      const rx = riserX(riser.day);
      return rx === undefined || Math.abs(rx - x) <= MARK_RADIUS ? [] : [rx];
    });
  const free = (left: number, dy: number): boolean =>
    left >= bounds[0] &&
    left + width <= bounds[1] &&
    blockers.every((rx) => rx < left - LABEL_CLEARANCE || rx > left + width + LABEL_CLEARANCE) &&
    taken.every((box) => Math.abs(box.dy - dy) >= LABEL_ROW_GAP || box.right < left - LABEL_CLEARANCE || box.left > left + width + LABEL_CLEARANCE);
  for (let offset = LABEL_NEAR; offset <= 400; offset += 2) {
    for (const dy of LABEL_ROWS) {
      if (free(x + offset, dy)) return { start: x + offset, anchor: 'start', dy };
      if (free(x - offset - width, dy)) return { start: x - offset, anchor: 'end', dy };
    }
  }
  return { start: x + LABEL_NEAR, anchor: 'start', dy: 0 };
}

/** Marcadores e rótulos desenhados pela coordenada do ponto: o `LabelList` da `Line` entrega caixa de tamanho zero (REC-34). */
function Marks({ returns, risers, endLabels, openStages, todayDay }: MarksProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!xScale || !yScale) return null;
  const taken: Box[] = [];
  const left = xScale(0) ?? 0;
  const right = xScale(todayDay) ?? left;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      {[...returns].sort((a, b) => b.day - a.day).map((mark) => {
        const x = xScale(mark.day);
        const yTo = yScale(mark.stage);
        const yFrom = yScale(mark.from);
        if (x === undefined || yTo === undefined || yFrom === undefined) return null;
        /** O anel mora no trecho descendente da própria linha, a meia altura da faixa acima da etapa de chegada, na cor dela. */
        const y = yScale(mark.stage + 0.5) ?? (yTo + yFrom) / 2;
        const text = `volta em ${formatDate(mark.date)}`;
        const width = text.length * CHAR_WIDTH;
        const place = placeReturnLabel(x, mark.stage, width, risers, (day) => xScale(day), taken, [left, right + MARGIN.right - 4]);
        const box: Box =
          place.anchor === 'start'
            ? { left: place.start, right: place.start + width, dy: place.dy }
            : { left: place.start - width, right: place.start, dy: place.dy };
        taken.push(box);
        const far = box.left - x > LABEL_NEAR + 2 || x - box.right > LABEL_NEAR + 2;
        /** Rótulo longe do anel leva linha de chamada pontilhada na mesma faixa, sem tocar traço de dado. */
        return (
          <g key={`return-${String(mark.day)}-${String(mark.stage)}`}>
            {far ? (
              <polyline
                fill="none"
                points={(() => {
                  const dir = box.left > x ? 1 : -1;
                  const end = dir === 1 ? box.left - 3 : box.right + 3;
                  return `${String(x + dir * MARK_RADIUS)},${String(y)} ${String(x + dir * (MARK_RADIUS + 6))},${String(y + place.dy)} ${String(end)},${String(y + place.dy)}`;
                })()}
                stroke="var(--text-muted)"
                strokeDasharray="1 3"
                strokeWidth={1}
              />
            ) : null}
            <circle cx={x} cy={y} fill="var(--surface-raised)" r={MARK_RADIUS} stroke={mark.color} strokeWidth={2} />
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-primary)"
              fontSize={11}
              fontWeight={600}
              textAnchor={place.anchor}
              x={place.start}
              y={y + place.dy}
            >
              {text}
            </text>
          </g>
        );
      })}
      {endLabels.map((label) => {
        const x = xScale(label.day);
        const y = yScale(label.stage);
        if (x === undefined || y === undefined) return null;
        return (
          <text
            className="font-display"
            fill="var(--text-primary)"
            fontSize={11}
            fontWeight={700}
            key={label.text}
            style={HALO}
            textAnchor={label.anchor}
            x={label.anchor === 'start' ? x + LABEL_GAP : x - LABEL_GAP}
            y={y - LABEL_GAP}
          >
            {label.text}
          </text>
        );
      })}
      {openStages.map((stage) => {
        const x = xScale(todayDay);
        const y = yScale(stage);
        if (x === undefined || y === undefined) return null;
        return (
          <text
            className="font-sans"
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize={11}
            fontWeight={500}
            key={`open-${String(stage)}`}
            style={HALO}
            x={x + LABEL_GAP}
            y={y}
          >
            em aberto
          </text>
        );
      })}
    </ZIndexLayer>
  );
}

export default function MareyJourney({
  data = defaultData,
  stages = defaultStages,
  today = defaultToday,
  windowStart = defaultWindowStart,
  height,
  className,
}: MareyJourneyProps) {
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
        <span>Nenhuma oportunidade neste recorte: não há progressão de etapas para desenhar.</span>
      </div>
    );
  }

  const startMs = toMs(windowStart);
  const todayDay = Math.round((toMs(today) - startMs) / DAY_MS);
  const lastStage = stages.length - 1;
  const tracks = data.map((pursuit) => buildTrack(pursuit, startMs, todayDay, lastStage));
  const won = tracks.filter((track) => track.closed);
  const openTracks = tracks.filter((track) => !track.closed);
  const risers: Riser[] = tracks.flatMap((track) =>
    track.points.flatMap((point, index) => {
      const before = track.points[index - 1];
      return before ? [{ day: point.day, lo: Math.min(before.stage, point.stage), hi: Math.max(before.stage, point.stage) }] : [];
    }),
  );
  const withReturn = tracks.filter((track) => track.returns.length > 0).length;
  const fastest = [...won].sort((a, b) => a.elapsed - b.elapsed || a.pursuit.id.localeCompare(b.pursuit.id))[0];
  const slowest = [...won].sort((a, b) => b.elapsed - a.elapsed || a.pursuit.id.localeCompare(b.pursuit.id))[0];
  const colorOf = (track: Track): string =>
    track === fastest ? FAST_COLOR : track === slowest && slowest !== fastest ? SLOW_COLOR : NEUTRAL_COLOR;
  const returnsAll: MarkedReturn[] = tracks.flatMap((track) => track.returns.map((ret) => ({ ...ret, color: colorOf(track) })));
  /** As duas em cor vão por último: quem é pintado por último cobre o vizinho (REC-13). */
  const drawOrder = [...tracks].sort((a, b) => Number(colorOf(a) !== NEUTRAL_COLOR) - Number(colorOf(b) !== NEUTRAL_COLOR));

  const rows: DayRow[] = Array.from({ length: todayDay + 1 }, (_, day) => {
    const row: Record<string, number | null> = { day };
    for (const track of tracks) {
      const { solid, tail } = stageAt(track, day, todayDay);
      row[track.pursuit.id] = solid;
      row[`${track.pursuit.id}-aberta`] = tail;
    }
    return row;
  });

  const endLabels: EndLabel[] = [];
  const fastLast = fastest?.points[fastest.points.length - 1];
  if (fastest && fastLast) {
    endLabels.push({ day: fastLast.day, stage: fastLast.stage, text: `mais rápida, ${formatDays(fastest.elapsed)}`, anchor: 'start' });
  }
  const slowLast = slowest?.points[slowest.points.length - 1];
  if (slowest && slowLast && slowest !== fastest) {
    endLabels.push({ day: slowLast.day, stage: slowLast.stage, text: `mais lenta, ${formatDays(slowest.elapsed)}`, anchor: 'end' });
  }

  const summary = [
    `Gráfico de linhas em degrau com ${formatInt(tracks.length)} oportunidades do trimestre: ${formatInt(won.length)} ganhas e ${formatInt(openTracks.length)} abertas.`,
    fastest && slowest ? `A ganha mais rápida levou ${formatDays(fastest.elapsed)} e a mais lenta, ${formatDays(slowest.elapsed)}.` : '',
    `${formatInt(withReturn)} voltaram de etapa.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderTip = ({ active, payload }: TooltipContentProps): ReactElement | null => {
    const row = payload?.[0]?.payload as DayRow | undefined;
    if (!active || !row) return null;
    const day = row.day ?? 0;
    const present = tracks
      .map((track) => ({ track, stage: stageAt(track, day, todayDay).solid ?? stageAt(track, day, todayDay).tail }))
      .filter((entry): entry is { track: Track; stage: number } => entry.stage !== null)
      .sort((a, b) => b.stage - a.stage || a.track.pursuit.id.localeCompare(b.track.pursuit.id));
    return (
      <div
        className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg"
        data-slot="chart-tooltip"
      >
        <p className="mb-1 font-medium text-text-primary">{formatDate(toIso(startMs + day * DAY_MS))}</p>
        <ul className="space-y-0.5">
          {present.map(({ track, stage }) => (
            <li className="flex items-center gap-3" key={track.pursuit.id}>
              <span className="text-text-secondary">{track.pursuit.name}</span>
              <span className="kpi-number ml-auto text-text-primary">{stages[stage]}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {fastest && slowest ? (
        <p aria-hidden className="mb-1 shrink-0 truncate text-xs text-text-secondary">
          A mais rápida ganhou em <span className="kpi-number font-semibold text-text-primary">{formatDays(fastest.elapsed)}</span> e a mais
          lenta em <span className="kpi-number font-semibold text-text-primary">{formatDays(slowest.elapsed)}</span>;{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(withReturn)}</span> de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(tracks.length)}</span> voltaram de etapa
        </p>
      ) : null}
      <div aria-hidden className="mb-1 flex shrink-0 items-center gap-4 text-[0.6875rem] text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 shrink-0" style={{ background: NEUTRAL_COLOR }} />
          demais oportunidades
        </span>
        <span className="flex items-center gap-1.5">
          <svg height={12} width={12}>
            <circle cx={6} cy={6} fill="var(--surface-raised)" r={4} stroke="var(--text-primary)" strokeWidth={2} />
          </svg>
          retorno de etapa
        </span>
        <span className="flex items-center gap-1.5">
          <svg height={12} width={16}>
            <line stroke={NEUTRAL_COLOR} strokeDasharray={OPEN_DASH} strokeWidth={NEUTRAL_WIDTH} x1={0} x2={16} y1={6} y2={6} />
          </svg>
          aberta até hoje, {formatDate(today)}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="day"
              domain={[0, todayDay]}
              height={AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatMonthShort(toIso(startMs + value * DAY_MS))}
              tickLine={false}
              tickMargin={8}
              ticks={monthTickDays(startMs, startMs + todayDay * DAY_MS)}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              domain={[-Y_BOTTOM_PADDING, lastStage + Y_TOP_PADDING]}
              interval={0}
              tickFormatter={(value: number) => stages[value] ?? ''}
              tickLine={false}
              tickMargin={8}
              ticks={stages.map((_, index) => index)}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <Tooltip content={renderTip} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            {drawOrder.flatMap((track) => {
              const color = colorOf(track);
              const width = color === NEUTRAL_COLOR ? NEUTRAL_WIDTH : HIGHLIGHT_WIDTH;
              const common = { dot: false, isAnimationActive: animate, stroke: color, strokeWidth: width, type: 'stepAfter' } as const;
              const lines = [<Line {...common} activeDot={false} dataKey={track.pursuit.id} key={track.pursuit.id} />];
              if (!track.closed) {
                lines.push(
                  <Line {...common} activeDot={false} dataKey={`${track.pursuit.id}-aberta`} key={`${track.pursuit.id}-aberta`} strokeDasharray={OPEN_DASH} />,
                );
              }
              return lines;
            })}
            <Marks
              endLabels={endLabels}
              openStages={openTracks.flatMap((track) => (track.points[track.points.length - 1] ? [track.points[track.points.length - 1]?.stage ?? 0] : []))}
              returns={returnsAll}
              risers={risers}
              todayDay={todayDay}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
