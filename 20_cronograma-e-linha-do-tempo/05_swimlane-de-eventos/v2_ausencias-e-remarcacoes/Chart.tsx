import { Filter } from 'lucide-react';

import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  WORK_END_HOUR,
  WORK_START_HOUR,
  type AgendaLane,
  type AgendaMeeting,
  type AgendaWeek,
} from './data';

/**
 * Swimlane de ausências: a reunião em que o lead faltou é marca vazada em `--negative`, e a
 * remarcação é um arco fino da data original até a nova, dentro da raia ou até a raia que recebeu
 * a reunião. Ausência sem nova data escreve isso ao lado, em vez de ficar sem arco e sem palavra.
 */
export interface NoShowSwimlaneProps {
  readonly data?: AgendaWeek;
  readonly height?: number;
  readonly className?: string;
}

/** O corpo do canvas `largo` mede 894 px de largura: o viewBox tem a mesma largura e a escala sai 1. */
const VIEW_W = 894;
const LEFT_W = 64;
const RIGHT_W = 84;
const HEADER_H = 34;
const LANE_H = 48;
/** Topo do bloco dentro da raia: acima dele fica a faixa por onde passam os arcos da mesma raia. */
const BLOCK_TOP = 22;
const BLOCK_H = 18;
const ARC_RISE = 14;
const LEGEND_GAP = 12;
const LEGEND_H = 14;
const BLOCK_RADIUS = 2;
const LABEL_W = 62;
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

function fromMinutes(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function weekdayOf(iso: string): string {
  const day = new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)))).getUTCDay();
  return WEEKDAYS[day] ?? '';
}

function shortDay(iso: string): string {
  return `${weekdayOf(iso)} ${formatDate(iso).slice(0, 5)}`;
}

/** Texto de contagem com a palavra no número certo: `0 ausências` é zero medido. */
function absenceCount(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'ausência' : 'ausências'}`;
}

/** Uma reunião posta no desenho: raia, dia, início e fim em minutos, e o que ela é. */
interface Slot {
  readonly meeting: AgendaMeeting;
  readonly laneIndex: number;
  readonly x: number;
  readonly width: number;
  readonly dayEnd: number;
  readonly day: string;
  readonly start: string;
  readonly end: string;
  readonly kind: 'held' | 'no-show' | 'moved';
}

interface Arc {
  readonly id: string;
  readonly path: string;
  readonly endX: number;
  readonly endY: number;
}

/** Arco da mesma raia: sobe do topo do bloco original e desce no topo do novo, por cima das marcas. */
function sameLaneArc(from: Slot, to: Slot, laneTop: number): Arc {
  const y = laneTop + BLOCK_TOP;
  const x1 = from.x + from.width / 2;
  const x2 = to.x + to.width / 2;
  return { id: from.meeting.id, path: `M ${String(x1)} ${String(y)} Q ${String((x1 + x2) / 2)} ${String(y - 2 * ARC_RISE)} ${String(x2)} ${String(y)}`, endX: x2, endY: y };
}

/** Arco entre raias: sai da base do bloco original, corre rente à raia e desce até o topo do destino. */
function crossLaneArc(from: Slot, to: Slot, fromTop: number, toTop: number): Arc {
  const down = toTop > fromTop;
  const y1 = down ? fromTop + BLOCK_TOP + BLOCK_H + 1 : fromTop + BLOCK_TOP - 1;
  const y2 = down ? toTop + BLOCK_TOP - 1 : toTop + BLOCK_TOP + BLOCK_H + 1;
  const x1 = from.x + from.width / 2;
  const x2 = to.x + to.width / 2;
  return { id: from.meeting.id, path: `M ${String(x1)} ${String(y1)} Q ${String(x2)} ${String(y1)} ${String(x2)} ${String(y2)}`, endX: x2, endY: y2 };
}

export default function NoShowSwimlane({ data = defaultData, height, className }: NoShowSwimlaneProps) {
  const style = height === undefined ? undefined : { height };

  if (data.lanes.length === 0 || data.days.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4" />
        <span>Nenhuma raia no recorte: sem SDR na semana, não há reunião nem ausência a mostrar.</span>
      </div>
    );
  }

  const dayScale = bandScale(data.days, [LEFT_W, VIEW_W - RIGHT_W]);
  const minuteScale = timeScale([WORK_START_HOUR * 60, WORK_END_HOUR * 60], [0, dayScale.bandwidth]);
  const gridRight = VIEW_W - RIGHT_W;
  const lanesBottom = HEADER_H + data.lanes.length * LANE_H;
  const viewH = lanesBottom + LEGEND_GAP + LEGEND_H;
  const legendY = lanesBottom + LEGEND_GAP + LEGEND_H / 2;
  const laneTop = (index: number): number => HEADER_H + index * LANE_H;
  const laneName = (id: string): string => data.lanes.find((lane: AgendaLane) => lane.id === id)?.name ?? id;

  const place = (meeting: AgendaMeeting, laneId: string, day: string, start: string, end: string, kind: Slot['kind']): Slot => {
    const x = dayScale.start(day) + minuteScale(toMinutes(start));
    return {
      meeting,
      laneIndex: data.lanes.findIndex((lane) => lane.id === laneId),
      x,
      width: minuteScale(toMinutes(end)) - minuteScale(toMinutes(start)),
      dayEnd: dayScale.start(day) + dayScale.bandwidth,
      day,
      start,
      end,
      kind,
    };
  };

  const slots = data.meetings.flatMap((meeting): Slot[] => {
    const origin = place(meeting, meeting.laneId, meeting.day, meeting.start, meeting.end, meeting.status === 'held' ? 'held' : 'no-show');
    const to = meeting.rescheduledTo;
    if (to === null) return [origin];
    const end = fromMinutes(toMinutes(to.start) + toMinutes(meeting.end) - toMinutes(meeting.start));
    return [origin, place(meeting, to.laneId, to.day, to.start, end, 'moved')];
  });

  const arcs = data.meetings.flatMap((meeting): Arc[] => {
    const from = slots.find((slot) => slot.meeting.id === meeting.id && slot.kind === 'no-show');
    const to = slots.find((slot) => slot.meeting.id === meeting.id && slot.kind === 'moved');
    if (from === undefined || to === undefined || from.laneIndex < 0 || to.laneIndex < 0) return [];
    return [
      from.laneIndex === to.laneIndex
        ? sameLaneArc(from, to, laneTop(from.laneIndex))
        : crossLaneArc(from, to, laneTop(from.laneIndex), laneTop(to.laneIndex)),
    ];
  });

  const lanes = data.lanes.map((lane, index) => ({
    lane,
    index,
    absences: data.meetings.filter((meeting) => meeting.laneId === lane.id && meeting.status === 'no-show').length,
  }));
  const maxAbsences = lanes.reduce((best, entry) => Math.max(best, entry.absences), 0);
  const leaders = lanes.filter((entry) => entry.absences === maxAbsences && maxAbsences > 0);
  const leader = leaders.length === 1 ? leaders[0] : undefined;
  const noShows = data.meetings.filter((meeting) => meeting.status === 'no-show');
  const moved = noShows.filter((meeting) => meeting.rescheduledTo !== null).length;

  const summary =
    noShows.length === 0
      ? `Agenda semanal de ${formatInt(lanes.length)} SDRs com ${formatInt(data.meetings.length)} reuniões e nenhuma ausência de lead no período.`
      : `Agenda semanal de ${formatInt(lanes.length)} SDRs com ${formatInt(noShows.length)} ausências de lead: ${formatInt(moved)} remarcadas e ${formatInt(noShows.length - moved)} sem nova data.` +
        (leader === undefined ? '' : ` ${leader.lane.name} concentra mais ausências: ${formatInt(leader.absences)}.`);

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 items-center', className)}
      role="img"
      style={style}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(viewH)}`}>
        {lanes.map((entry) => {
          const top = laneTop(entry.index);
          const isLeader = leader !== undefined && leader.index === entry.index;
          return (
            <g key={entry.lane.id}>
              {entry.index % 2 === 0 ? <rect fill="var(--surface-sunken)" height={LANE_H} width={VIEW_W} x={0} y={top} /> : null}
              <text
                dominantBaseline="central"
                fill={isLeader ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={11}
                fontWeight={isLeader ? 700 : 500}
                x={8}
                y={top + BLOCK_TOP + BLOCK_H / 2}
              >
                {entry.lane.name}
              </text>
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill={isLeader ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={11}
                fontWeight={isLeader ? 700 : 500}
                textAnchor="end"
                x={VIEW_W - 8}
                y={top + BLOCK_TOP + BLOCK_H / 2}
              >
                {absenceCount(entry.absences)}
              </text>
            </g>
          );
        })}

        {data.days.map((day) => {
          const x0 = dayScale.start(day);
          return (
            <g key={day}>
              <text className="tabular-nums" fill="var(--text-secondary)" fontSize={11} fontWeight={600} textAnchor="middle" x={x0 + dayScale.bandwidth / 2} y={12}>
                {shortDay(day)}
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

        {slots.map((slot) => {
          if (slot.laneIndex < 0) return null;
          const y = laneTop(slot.laneIndex) + BLOCK_TOP;
          const hollow = slot.kind === 'no-show';
          return (
            <rect
              fill={hollow ? 'var(--surface-raised)' : 'var(--chart-1)'}
              height={BLOCK_H}
              key={`${slot.meeting.id}-${slot.kind}`}
              rx={BLOCK_RADIUS}
              stroke={hollow ? 'var(--negative)' : 'var(--surface-raised)'}
              strokeWidth={hollow ? 2 : 1.5}
              width={slot.width}
              x={slot.x}
              y={y}
            >
              <title>{`${laneName(data.lanes[slot.laneIndex]?.id ?? '')}, ${shortDay(slot.day)}, ${slot.start} às ${slot.end}${hollow ? ', ausência do lead' : ''}${slot.kind === 'moved' ? `, remarcada de ${laneName(slot.meeting.laneId)}, ${shortDay(slot.meeting.day)}, ${slot.meeting.start} às ${slot.meeting.end}` : ''}`}</title>
            </rect>
          );
        })}

        {arcs.map((arc) => (
          <g key={arc.id}>
            <path d={arc.path} fill="none" stroke="var(--text-secondary)" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
            <circle cx={arc.endX} cy={arc.endY} fill="var(--text-secondary)" r={2.5} />
          </g>
        ))}

        {slots
          .filter((slot) => slot.kind === 'no-show' && slot.laneIndex >= 0)
          .map((slot) => {
            const to = slot.meeting.rescheduledTo;
            if (to !== null && to.laneId === slot.meeting.laneId) return null;
            const text = to === null ? 'sem nova data' : `para ${laneName(to.laneId)}`;
            const fitsRight = slot.x + slot.width + 6 + LABEL_W <= slot.dayEnd;
            return (
              <text
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={11}
                key={slot.meeting.id}
                textAnchor={fitsRight ? 'start' : 'end'}
                x={fitsRight ? slot.x + slot.width + 6 : slot.x - 6}
                y={laneTop(slot.laneIndex) + BLOCK_TOP + BLOCK_H / 2}
              >
                {text}
              </text>
            );
          })}

        {/* Separadores de dia: o traço não pode engordar quando o cartão escala. */}
        {[...data.days.map((day) => dayScale.start(day)), gridRight].map((x) => (
          <line key={x} stroke="var(--line-strong)" strokeWidth={1} vectorEffect="non-scaling-stroke" x1={x} x2={x} y1={HEADER_H - 4} y2={lanesBottom} />
        ))}

        <rect fill="var(--chart-1)" height={10} rx={BLOCK_RADIUS} width={14} x={8} y={legendY - 5} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={28} y={legendY}>
          reunião marcada
        </text>
        <rect fill="var(--surface-raised)" height={10} rx={BLOCK_RADIUS} stroke="var(--negative)" strokeWidth={2} width={14} x={140} y={legendY - 5} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={160} y={legendY}>
          ausência do lead
        </text>
        <path d={`M 262 ${String(legendY + 3)} Q 270 ${String(legendY - 9)} 278 ${String(legendY + 3)}`} fill="none" stroke="var(--text-secondary)" strokeWidth={1.25} />
        <circle cx={278} cy={legendY + 3} fill="var(--text-secondary)" r={2.5} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={290} y={legendY}>
          remarcação até a nova data; à direita, ausências da semana por SDR.
        </text>
      </svg>
    </div>
  );
}
