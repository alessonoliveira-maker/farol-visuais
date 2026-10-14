import { Filter } from 'lucide-react';

import { formatDate, formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, WORK_END_HOUR, WORK_START_HOUR, type AgendaWeek, type Meeting } from './data';

/**
 * Swimlane da semana: uma raia por SDR, um dia por coluna, só o expediente desenhado. Reuniões que
 * se cruzam na mesma raia vão para sub-faixas, e a raia cresce em vez de sobrepor retângulos. A
 * escala de tempo e a de banda são funções do arquivo, sem biblioteca de escala.
 */
export interface WeekAgendaSwimlaneProps {
  readonly data?: AgendaWeek;
  readonly height?: number;
  readonly className?: string;
}

/** O corpo do canvas `largo` mede 894 px de largura: o viewBox tem a mesma largura e a escala sai 1. */
const VIEW_W = 894;
const LEFT_W = 64;
const RIGHT_W = 64;
const HEADER_H = 34;
const LANE_PAD = 5;
const SUB_H = 20;
const SUB_GAP = 2;
const LEGEND_GAP = 12;
const LEGEND_H = 14;
const BLOCK_RADIUS = 2;
const LONG_MINUTES = 45;
const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'] as const;
const HOUR_TICKS = [9, 12, 15] as const;

interface LinearScale {
  (value: number): number;
}

/** Escala linear: leva o domínio de tempo (minutos) para o intervalo em pixels. */
function timeScale(domain: readonly [number, number], range: readonly [number, number]): LinearScale {
  const span = domain[1] - domain[0];
  return (value) => range[0] + ((value - domain[0]) / span) * (range[1] - range[0]);
}

interface BandScale {
  readonly start: (key: string) => number;
  readonly bandwidth: number;
}

/** Escala de banda: uma faixa de largura igual por chave, na ordem recebida. */
function bandScale(keys: readonly string[], range: readonly [number, number]): BandScale {
  const bandwidth = (range[1] - range[0]) / Math.max(keys.length, 1);
  return { start: (key) => range[0] + keys.indexOf(key) * bandwidth, bandwidth };
}

function toMinutes(clock: string): number {
  return Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3, 5));
}

function weekdayOf(iso: string): string {
  const day = new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)))).getUTCDay();
  return WEEKDAYS[day] ?? '';
}

function minutesOf(meeting: Meeting): number {
  return toMinutes(meeting.end) - toMinutes(meeting.start);
}

/** Soma de horas; `null` na lista vazia, porque zero hora é uma agenda medida e vazio é outra coisa. */
function totalHours(meetings: readonly Meeting[]): number | null {
  if (meetings.length === 0) return null;
  return meetings.reduce((sum, meeting) => sum + minutesOf(meeting), 0) / 60;
}

interface Placed {
  readonly meeting: Meeting;
  readonly sub: number;
}

/**
 * Empacotamento guloso e determinístico: por dia, início e id, cada reunião vai para a primeira
 * sub-faixa já livre da raia. A contagem de sub-faixas é a da pior hora da semana.
 */
function packLane(meetings: readonly Meeting[]): { readonly placed: readonly Placed[]; readonly subs: number } {
  const ordered = [...meetings].sort(
    (a, b) => a.day.localeCompare(b.day) || toMinutes(a.start) - toMinutes(b.start) || a.id.localeCompare(b.id),
  );
  const ends: { day: string; end: number }[] = [];
  const placed = ordered.map((meeting): Placed => {
    const start = toMinutes(meeting.start);
    let sub = ends.findIndex((slot) => slot.day !== meeting.day || slot.end <= start);
    if (sub === -1) {
      sub = ends.length;
      ends.push({ day: meeting.day, end: 0 });
    }
    ends[sub] = { day: meeting.day, end: toMinutes(meeting.end) };
    return { meeting, sub };
  });
  return { placed, subs: Math.max(1, ends.length) };
}

type LaneEntry = {
  readonly lane: { readonly id: string; readonly name: string };
  readonly top: number;
  readonly placed: readonly Placed[];
};

/** Retângulos das reuniões: o contorno na cor do cartão separa vizinhas coladas (COR-5). */
function meetingBlocks(lanes: readonly LaneEntry[], dayScale: BandScale, minuteScale: LinearScale) {
  return lanes.flatMap((entry) =>
    entry.placed.map(({ meeting, sub }) => {
      const x = dayScale.start(meeting.day) + minuteScale(toMinutes(meeting.start));
      const width = minuteScale(toMinutes(meeting.end)) - minuteScale(toMinutes(meeting.start));
      return (
        <rect
          fill={minutesOf(meeting) >= LONG_MINUTES ? 'var(--chart-3)' : 'var(--chart-1)'}
          height={SUB_H}
          key={meeting.id}
          rx={BLOCK_RADIUS}
          stroke="var(--surface-raised)"
          strokeWidth={1.5}
          width={width}
          x={x}
          y={entry.top + LANE_PAD + sub * (SUB_H + SUB_GAP)}
        >
          <title>{`${entry.lane.name}, ${formatDate(meeting.day)}, ${meeting.start} às ${meeting.end} (${formatInt(minutesOf(meeting))} min)`}</title>
        </rect>
      );
    }),
  );
}

export default function WeekAgendaSwimlane({ data = defaultData, height, className }: WeekAgendaSwimlaneProps) {
  const style = height === undefined ? undefined : { height };

  if (data.lanes.length === 0 || data.days.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4" />
        <span>Nenhuma raia no recorte: sem SDR na semana, não há agenda a mostrar.</span>
      </div>
    );
  }

  const dayScale = bandScale(data.days, [LEFT_W, VIEW_W - RIGHT_W]);
  const minuteScale = timeScale([WORK_START_HOUR * 60, WORK_END_HOUR * 60], [0, dayScale.bandwidth]);
  const gridRight = VIEW_W - RIGHT_W;

  let cursorY = HEADER_H;
  const lanes = data.lanes.map((lane, index) => {
    const meetings = data.meetings.filter((meeting) => meeting.laneId === lane.id);
    const { placed, subs } = packLane(meetings);
    const laneH = LANE_PAD * 2 + subs * SUB_H + (subs - 1) * SUB_GAP;
    const top = cursorY;
    cursorY += laneH;
    return { lane, index, placed, laneH, top, hours: totalHours(meetings), count: meetings.length };
  });
  const lanesBottom = cursorY;
  const viewH = lanesBottom + LEGEND_GAP + LEGEND_H;
  const legendY = lanesBottom + LEGEND_GAP + LEGEND_H / 2;

  const busiest = lanes.reduce<(typeof lanes)[number] | undefined>(
    (best, entry) => ((entry.hours ?? 0) > (best?.hours ?? 0) ? entry : best),
    undefined,
  );
  const firstDay = data.days[0] ?? '';
  const lastDay = data.days[data.days.length - 1] ?? '';
  const summary =
    busiest === undefined || busiest.hours === null
      ? `Agenda semanal de ${formatInt(lanes.length)} raias entre ${formatDate(firstDay)} e ${formatDate(lastDay)}, sem nenhuma reunião marcada no período.`
      : `Agenda semanal de ${formatInt(lanes.length)} SDRs entre ${formatDate(firstDay)} e ${formatDate(lastDay)}, com ${formatInt(data.meetings.length)} reuniões. ` +
        `${busiest.lane.name} tem mais horas agendadas: ${formatDecimal(busiest.hours, 1)} h em ${formatInt(busiest.count)} reuniões.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 items-center', className)}
      role="img"
      style={style}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(viewH)}`}>
        {lanes.map((entry) => (
          <g key={entry.lane.id}>
            {entry.index % 2 === 0 ? (
              <rect fill="var(--surface-sunken)" height={entry.laneH} width={VIEW_W} x={0} y={entry.top} />
            ) : null}
            <text
              dominantBaseline="central"
              fill={entry === busiest ? 'var(--text-primary)' : 'var(--text-secondary)'}
              fontSize={11}
              fontWeight={entry === busiest ? 700 : 500}
              x={8}
              y={entry.top + entry.laneH / 2}
            >
              {entry.lane.name}
            </text>
            <text
              className="font-display tabular-nums"
              dominantBaseline="central"
              fill={entry === busiest ? 'var(--text-primary)' : 'var(--text-secondary)'}
              fontSize={11}
              fontWeight={entry === busiest ? 700 : 500}
              textAnchor="end"
              x={VIEW_W - 8}
              y={entry.top + entry.laneH / 2}
            >
              {entry.hours === null ? '0 reuniões' : `${formatDecimal(entry.hours, 1)} h`}
            </text>
          </g>
        ))}

        {data.days.map((day) => {
          const x0 = dayScale.start(day);
          return (
            <g key={day}>
              <text className="tabular-nums" fill="var(--text-secondary)" fontSize={11} fontWeight={600} textAnchor="middle" x={x0 + dayScale.bandwidth / 2} y={12}>
                {`${weekdayOf(day)} ${formatDate(day).slice(0, 5)}`}
              </text>
              {HOUR_TICKS.map((hour) => (
                <text
                  className="tabular-nums"
                  fill="var(--text-muted)"
                  fontSize={11}
                  key={hour}
                  textAnchor={hour === WORK_START_HOUR ? 'start' : 'middle'}
                  x={x0 + minuteScale(hour * 60) + (hour === WORK_START_HOUR ? 3 : 0)}
                  y={27}
                >
                  {`${String(hour)}h`}
                </text>
              ))}
            </g>
          );
        })}

        {meetingBlocks(lanes, dayScale, minuteScale)}

        {/* Separadores de dia: o traço não pode engordar quando o cartão escala. */}
        {[...data.days.map((day) => dayScale.start(day)), gridRight].map((x) => (
          <line
            key={x}
            stroke="var(--line-strong)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            x1={x}
            x2={x}
            y1={HEADER_H - 4}
            y2={lanesBottom}
          />
        ))}

        <rect fill="var(--chart-1)" height={10} rx={BLOCK_RADIUS} width={14} x={8} y={legendY - 5} />
        <text className="tabular-nums" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={28} y={legendY}>
          até 30 min
        </text>
        <rect fill="var(--chart-3)" height={10} rx={BLOCK_RADIUS} width={14} x={104} y={legendY - 5} />
        <text className="tabular-nums" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={124} y={legendY}>
          60 min
        </text>
        <text className="tabular-nums" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={196} y={legendY}>
          Expediente de 9h às 18h; reuniões que se cruzam ficam em sub-faixas da mesma raia; à direita, horas agendadas na semana.
        </text>
      </svg>
    </div>
  );
}
