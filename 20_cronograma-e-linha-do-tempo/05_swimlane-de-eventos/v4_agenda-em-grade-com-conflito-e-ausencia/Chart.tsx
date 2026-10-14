import { Filter } from 'lucide-react';
import { useId } from 'react';

import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, WORK_END_HOUR, WORK_START_HOUR, type AgendaColumn, type DayAgenda, type DayMeeting } from './data';

/**
 * Agenda em grade: horas descem pela vertical e cada SDR é uma coluna, com topo e altura calculados
 * por minuto. Reuniões que se cruzam dividem a coluna pelo empacotamento guloso, SDR ausente tem
 * coluna hachurada com a palavra, e reunião fora do expediente estende a grade só neste dia, com
 * aviso escrito. Texto segue horizontal: a grade troca os eixos, não gira nenhum rótulo.
 */
export interface DayGridAgendaProps {
  readonly data?: DayAgenda;
  readonly height?: number;
  readonly className?: string;
}

/** O corpo do canvas `alto` mede 574 px de largura: o viewBox tem a mesma largura e a escala sai 1. */
const VIEW_W = 574;
const LEFT_W = 40;
const HEADER_H = 38;
const HOUR_H = 27;
const FOOTER_LINE_H = 15;
const COLUMN_PAD = 3;
const COLUMN_GAP = 2;
/** Altura mínima de um bloco: 15 minutos medem 6,75 px e não se veriam como marca. */
const MIN_BLOCK_H = 10;
const BLOCK_RADIUS = 2;
const HATCH_SIZE = 4;
const HATCH_STROKE = 1.5;

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

function clockOf(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function weekdayOf(iso: string): string {
  const day = new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)))).getUTCDay();
  return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][day] ?? '';
}

interface PlacedMeeting {
  readonly meeting: DayMeeting;
  /** Coluna interna dentro do grupo que se cruza. */
  readonly sub: number;
  /** Quantas colunas internas o grupo tem. */
  readonly subs: number;
}

/**
 * Empacotamento guloso e determinístico: por início e depois por id, cada reunião vai para a
 * primeira coluna interna livre do grupo de reuniões que se cruzam. Sem cruzamento, o grupo é de uma.
 */
function packMeetings(meetings: readonly DayMeeting[]): readonly PlacedMeeting[] {
  const ordered = [...meetings].sort((a, b) => toMinutes(a.start) - toMinutes(b.start) || a.id.localeCompare(b.id));
  const result: PlacedMeeting[] = [];
  let group: { meeting: DayMeeting; sub: number }[] = [];
  let ends: number[] = [];
  let groupEnd = -1;
  const flush = (): void => {
    group.forEach((item) => result.push({ ...item, subs: ends.length }));
    group = [];
    ends = [];
  };
  ordered.forEach((meeting) => {
    const start = toMinutes(meeting.start);
    if (start >= groupEnd) flush();
    let sub = ends.findIndex((end) => end <= start);
    if (sub === -1) sub = ends.length;
    ends[sub] = toMinutes(meeting.end);
    groupEnd = group.length === 0 ? toMinutes(meeting.end) : Math.max(groupEnd, toMinutes(meeting.end));
    group.push({ meeting, sub });
  });
  flush();
  return result;
}

interface Overlap {
  readonly columnId: string;
  readonly depth: number;
  readonly from: number;
  readonly to: number;
}

/** O trecho de maior sobreposição do dia; `null` quando nenhuma reunião cruza outra. */
function deepestOverlap(meetings: readonly DayMeeting[]): Overlap | null {
  let best: Overlap | null = null;
  const columnIds = [...new Set(meetings.map((meeting) => meeting.columnId))];
  columnIds.forEach((columnId) => {
    const own = meetings.filter((meeting) => meeting.columnId === columnId);
    let depth = 0;
    let from = 0;
    let to = 0;
    for (let minute = 0; minute < 1440; minute += 1) {
      const count = own.filter((meeting) => toMinutes(meeting.start) <= minute && minute < toMinutes(meeting.end)).length;
      if (count > depth) {
        depth = count;
        from = minute;
        to = minute + 1;
      } else if (count === depth && to === minute) {
        to = minute + 1;
      }
    }
    if (depth >= 2 && (best === null || depth > best.depth)) best = { columnId, depth, from, to };
  });
  return best;
}

function countText(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'reunião' : 'reuniões'}`;
}

export default function DayGridAgenda({ data = defaultData, height, className }: DayGridAgendaProps) {
  const hatchId = `${useId().replace(/:/g, '')}-ausente`;
  const style = height === undefined ? undefined : { height };

  if (data.columns.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4" />
        <span>Nenhuma coluna no recorte: sem SDR no dia, não há agenda a mostrar.</span>
      </div>
    );
  }

  const columns: readonly AgendaColumn[] = data.columns;
  const meetings = data.meetings.filter((meeting) => columns.some((column) => column.id === meeting.columnId && !column.absent));
  const starts = meetings.map((meeting) => toMinutes(meeting.start));
  const ends = meetings.map((meeting) => toMinutes(meeting.end));
  const gridStart = Math.min(WORK_START_HOUR, ...starts.map((minute) => Math.floor(minute / 60)));
  const gridEnd = Math.max(WORK_END_HOUR, ...ends.map((minute) => Math.ceil(minute / 60)));
  const hours = gridEnd - gridStart;
  const gridTop = HEADER_H;
  const gridBottom = gridTop + hours * HOUR_H;
  const minuteY = timeScale([gridStart * 60, gridEnd * 60], [gridTop, gridBottom]);
  const columnScale = bandScale(columns.map((column) => column.id), [LEFT_W, VIEW_W]);
  const nameOf = (id: string): string => columns.find((column) => column.id === id)?.name ?? id;
  const outside = meetings.filter((meeting) => toMinutes(meeting.start) < WORK_START_HOUR * 60 || toMinutes(meeting.end) > WORK_END_HOUR * 60);
  const overlap = deepestOverlap(meetings);

  const notes: string[] = [];
  if (overlap !== null) {
    notes.push(`${nameOf(overlap.columnId)} tem ${formatInt(overlap.depth)} reuniões ao mesmo tempo, das ${clockOf(overlap.from)} às ${clockOf(overlap.to)}.`);
  }
  const firstOutside = outside[0];
  if (firstOutside !== undefined) {
    const what =
      outside.length === 1
        ? `a reunião de ${nameOf(firstOutside.columnId)} das ${firstOutside.start} às ${firstOutside.end} cai fora do expediente de ${String(WORK_START_HOUR)}h às ${String(WORK_END_HOUR)}h`
        : `${formatInt(outside.length)} reuniões caem fora do expediente de ${String(WORK_START_HOUR)}h às ${String(WORK_END_HOUR)}h`;
    notes.push(`Grade estendida até ${String(gridEnd)}h só neste dia: ${what}.`);
  }
  const viewH = gridBottom + 10 + (notes.length + 1) * FOOTER_LINE_H;
  const legendY = gridBottom + 10 + notes.length * FOOTER_LINE_H + FOOTER_LINE_H / 2;

  const absentNames = columns.filter((column) => column.absent).map((column) => column.name);
  const emptyNames = columns.filter((column) => !column.absent && !meetings.some((meeting) => meeting.columnId === column.id)).map((column) => column.name);
  const dayLabel = `${weekdayOf(data.day)} ${formatDate(data.day)}`;
  const summary =
    `Agenda em grade de ${dayLabel}, com ${formatInt(meetings.length)} reuniões em ${formatInt(columns.length)} colunas de SDR` +
    (absentNames.length === 0 ? '' : `: ${absentNames.join(', ')} ausente`) +
    (emptyNames.length === 0 ? '' : `, ${emptyNames.join(', ')} com a agenda vazia`) +
    (overlap === null ? '' : `, ${nameOf(overlap.columnId)} com ${formatInt(overlap.depth)} reuniões sobrepostas`) +
    (outside.length === 0 ? '.' : ` e ${countText(outside.length)} fora do expediente.`);

  const hourLines = Array.from({ length: hours + 1 }, (_, index) => gridStart + index);

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 items-center', className)}
      role="img"
      style={style}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(viewH)}`}>
        <defs>
          <pattern height={HATCH_SIZE} id={hatchId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={HATCH_SIZE}>
            <rect fill="var(--surface-raised)" height={HATCH_SIZE} width={HATCH_SIZE} x={0} y={0} />
            <line stroke="var(--text-muted)" strokeWidth={HATCH_STROKE} x1={0} x2={0} y1={0} y2={HATCH_SIZE} />
          </pattern>
        </defs>

        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={12}>
          {dayLabel.slice(0, 9)}
        </text>

        {columns.map((column, index) => {
          const x0 = columnScale.start(column.id);
          const own = meetings.filter((meeting) => meeting.columnId === column.id);
          const isConflict = overlap !== null && overlap.columnId === column.id;
          const midY = gridTop + Math.floor(hours / 2) * HOUR_H + HOUR_H / 2; // meia hora, para o texto não cair em cima de uma linha de hora
          return (
            <g key={column.id}>
              {column.absent ? (
                <rect fill={`url(#${hatchId})`} height={gridBottom - gridTop} width={columnScale.bandwidth} x={x0} y={gridTop} />
              ) : index % 2 === 0 ? (
                <rect fill="var(--surface-sunken)" height={gridBottom - gridTop} width={columnScale.bandwidth} x={x0} y={gridTop} />
              ) : null}
              <text
                fill={isConflict ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={11}
                fontWeight={isConflict ? 700 : 600}
                textAnchor="middle"
                x={x0 + columnScale.bandwidth / 2}
                y={12}
              >
                {column.name}
              </text>
              <text
                className="tabular-nums"
                fill="var(--text-muted)"
                fontSize={11}
                textAnchor="middle"
                x={x0 + columnScale.bandwidth / 2}
                y={27}
              >
                {column.absent ? 'ausente' : countText(own.length)}
              </text>
              {column.absent ? (
                <g>
                  <rect fill="var(--surface-raised)" height={20} rx={BLOCK_RADIUS} width={58} x={x0 + columnScale.bandwidth / 2 - 29} y={midY - 10} />
                  <text dominantBaseline="central" fill="var(--text-primary)" fontSize={11} fontWeight={600} textAnchor="middle" x={x0 + columnScale.bandwidth / 2} y={midY}>
                    ausente
                  </text>
                </g>
              ) : own.length === 0 ? (
                <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={x0 + columnScale.bandwidth / 2} y={midY}>
                  agenda livre
                </text>
              ) : null}
            </g>
          );
        })}

        {hourLines.map((hour) => (
          <g key={hour}>
            <line
              stroke={hour === WORK_END_HOUR && gridEnd > WORK_END_HOUR ? 'var(--line-strong)' : 'var(--line-subtle)'}
              strokeDasharray={hour === WORK_END_HOUR && gridEnd > WORK_END_HOUR ? '4 3' : undefined}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              x1={LEFT_W}
              x2={VIEW_W}
              y1={minuteY(hour * 60)}
              y2={minuteY(hour * 60)}
            />
            <text className="tabular-nums" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={LEFT_W - 6} y={minuteY(hour * 60)}>
              {`${String(hour)}h`}
            </text>
          </g>
        ))}

        {columns.flatMap((column) =>
          packMeetings(meetings.filter((meeting) => meeting.columnId === column.id)).map(({ meeting, sub, subs }) => {
            const inner = columnScale.bandwidth - COLUMN_PAD * 2;
            const width = (inner - (subs - 1) * COLUMN_GAP) / subs;
            const top = minuteY(toMinutes(meeting.start));
            const minutes = toMinutes(meeting.end) - toMinutes(meeting.start);
            const off = toMinutes(meeting.start) < WORK_START_HOUR * 60 || toMinutes(meeting.end) > WORK_END_HOUR * 60;
            return (
              <rect
                fill="var(--chart-1)"
                height={Math.max(minuteY(toMinutes(meeting.end)) - top, MIN_BLOCK_H)}
                key={meeting.id}
                rx={BLOCK_RADIUS}
                stroke={off ? 'var(--warning)' : 'var(--surface-raised)'}
                strokeWidth={off ? 2 : 1.5}
                width={width}
                x={columnScale.start(column.id) + COLUMN_PAD + sub * (width + COLUMN_GAP)}
                y={top}
              >
                <title>{`${column.name}, ${meeting.start} às ${meeting.end} (${formatInt(minutes)} min)`}</title>
              </rect>
            );
          }),
        )}

        {notes.map((note, index) => (
          <text fill="var(--text-secondary)" fontSize={11} key={note} x={8} y={gridBottom + 10 + index * FOOTER_LINE_H + FOOTER_LINE_H / 2} dominantBaseline="central">
            {note}
          </text>
        ))}

        <rect fill="var(--chart-1)" height={10} rx={BLOCK_RADIUS} width={14} x={8} y={legendY - 5} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={28} y={legendY}>
          reunião
        </text>
        <rect fill="var(--chart-1)" height={10} rx={BLOCK_RADIUS} stroke="var(--warning)" strokeWidth={2} width={14} x={92} y={legendY - 5} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={112} y={legendY}>
          fora do expediente
        </text>
        <rect fill={`url(#${hatchId})`} height={10} width={14} x={240} y={legendY - 5} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={260} y={legendY}>
          SDR ausente
        </text>
        <text className="tabular-nums" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={340} y={legendY}>
          bloco curto tem no mínimo 10 px
        </text>
      </svg>
    </div>
  );
}
