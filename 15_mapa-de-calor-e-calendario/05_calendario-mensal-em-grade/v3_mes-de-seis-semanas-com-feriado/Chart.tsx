import { CalendarClock, Filter, Flag } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatDays, formatDecimal, formatInt, formatMonthLong } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, MEASURED_THROUGH, MONTH, type DayAgenda } from './data';

/**
 * Calendário mensal em grade de um mês que ocupa as SEIS semanas, com o mês ainda em curso. A grade
 * inteira é gerada em TypeScript a partir do deslocamento do dia 1: nov/26 cai num domingo, então a
 * primeira linha começa com seis dias de out/26 e a última termina com seis de dez/26, e forçar cinco
 * linhas perderia um dia do mês.
 *
 * O desenho separa cinco estados que um gráfico de linha funde em ponto ou em buraco: dia com agenda,
 * dia útil que terminou em zero, que é medição e sai escrito 0, feriado, que é dia sem expediente e
 * fica fora de toda média, fim de semana, que também não tem expediente, e dia que ainda não
 * aconteceu, marcado por ícone de relógio e sem número nenhum. Confundir feriado com dia vazio é o
 * erro que esta versão existe para evitar.
 *
 * A rampa tem TRÊS degraus, e a razão é medida, não estética: o anel do dia corrente é --chart-1, e
 * ele mede 8,30:1, 6,02:1 e 4,14:1 contra --seq-1, --seq-2 e --seq-3 no pior tema, mas apenas 1,36:1
 * contra --seq-6. Um quarto degrau apagaria o anel exatamente no dia que a peça quer apontar. Os
 * cortes são os TERCIS dos dias com agenda, não fatias iguais do máximo, e o teto de cada degrau vem
 * escrito na legenda, porque corte por tercil não se adivinha olhando a cor.
 */
export interface PartialMonthCalendarProps {
  readonly data?: readonly DayAgenda[];
  readonly month?: string;
  readonly measuredThrough?: string;
  readonly height?: number;
  readonly className?: string;
}

const WEEKDAY_LABELS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'] as const;
const WEEK_ROWS = 6;
const ZERO_FILL = 'var(--surface-sunken)';
/** Três degraus por tercil. Índice i do array é o token --seq-(i+1). */
const RAMP_FILLS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
] as const;
const RAMP_TEXT = 'var(--text-primary)';
const RING_TODAY = 'var(--chart-1)';
/** Anel da cor do cartão nas células comuns, para o destaque não mudar o layout. */
const RING_CALM = 'var(--surface-raised)';
const NEUTRAL_INK = 'var(--text-muted)';

type CellKind = 'fora' | 'feriado' | 'semExpediente' | 'futuro' | 'zero' | 'medido';

interface GridCell {
  readonly key: string;
  readonly label: number;
  readonly kind: CellKind;
  readonly agendas: number | null;
}

/** Segunda é 0, domingo é 6. */
function weekdayOf(month: string, day: number): number {
  const time = Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, day);
  return (new Date(time).getUTCDay() + 6) % 7;
}

function daysInMonth(month: string): number {
  const time = Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0);
  return new Date(time).getUTCDate();
}

function shiftMonth(month: string, delta: number): string {
  const time = Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + delta, 1);
  const date = new Date(time);
  const label = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${String(date.getUTCFullYear())}-${label}`;
}

function kindOf(cell: DayAgenda, month: string, measuredDay: number): CellKind {
  if (cell.holiday === true) return 'feriado';
  if (weekdayOf(month, cell.day) >= 5) return 'semExpediente';
  if (cell.day > measuredDay) return 'futuro';
  if (cell.agendas === null) return 'semExpediente';
  return cell.agendas === 0 ? 'zero' : 'medido';
}

/** A grade das seis semanas, com as pontas do mês anterior e do seguinte esmaecidas. */
function buildGrid(
  month: string,
  days: readonly DayAgenda[],
  measuredDay: number,
): readonly GridCell[] {
  const offset = weekdayOf(month, 1);
  const before = daysInMonth(shiftMonth(month, -1));
  const cells: GridCell[] = [];
  for (let slot = 0; slot < offset; slot += 1) {
    const label = before - offset + slot + 1;
    cells.push({ key: `antes-${String(label)}`, label, kind: 'fora', agendas: null });
  }
  for (const cell of days) {
    cells.push({
      key: `dia-${String(cell.day)}`,
      label: cell.day,
      kind: kindOf(cell, month, measuredDay),
      agendas: cell.agendas,
    });
  }
  let next = 1;
  while (cells.length < WEEK_ROWS * 7) {
    cells.push({ key: `depois-${String(next)}`, label: next, kind: 'fora', agendas: null });
    next += 1;
  }
  return cells;
}

type MeasuredCell = GridCell & { readonly agendas: number };

function isMeasured(cell: GridCell): cell is MeasuredCell {
  return (cell.kind === 'medido' || cell.kind === 'zero') && cell.agendas !== null;
}

/** Tercis dos dias com agenda. Null quando não há base, nunca zero (EST-1b). */
function tercileEdges(values: readonly number[]): readonly number[] | null {
  if (values.length < 3) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length / 3) - 1];
  const high = sorted[Math.floor((sorted.length * 2) / 3) - 1];
  if (low === undefined || high === undefined) return null;
  return [low, high];
}

function degreeOf(value: number, edges: readonly number[]): number {
  let degree = 0;
  for (const edge of edges) if (value > edge) degree += 1;
  return Math.min(RAMP_FILLS.length - 1, degree);
}

/** Média por dia útil com expediente. Null em lista vazia. */
function averageOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** O dia mais cheio. Null em lista vazia. */
function peakOf(cells: readonly MeasuredCell[]): MeasuredCell | null {
  return cells.reduce<MeasuredCell | null>(
    (best, cell) => (best === null || cell.agendas > best.agendas ? cell : best),
    null,
  );
}

/** Dias úteis sem agenda, com a concordância do singular. */
function idleLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'dia útil' : 'dias úteis'} sem agenda`;
}

export default function PartialMonthCalendar({
  data = defaultData,
  month = MONTH,
  measuredThrough = MEASURED_THROUGH,
  height,
  className,
}: PartialMonthCalendarProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden size={16} />
        <span>O recorte não tem nenhum dia medido, então não há calendário de agendas a desenhar.</span>
      </div>
    );
  }

  const today = Number(measuredThrough.slice(8, 10));
  const cells = buildGrid(month, data, today);
  const active = cells.filter(isMeasured);
  const values = active.map((cell) => cell.agendas);
  const edges = tercileEdges(values.filter((value) => value > 0));
  const total = values.reduce((sum, value) => sum + value, 0);
  const average = averageOf(values);
  const peak = peakOf(active);
  const idle = active.filter((cell) => cell.agendas === 0).length;
  const pending = cells.filter((cell) => cell.kind === 'futuro').length;
  const holidayCount = cells.filter((cell) => cell.kind === 'feriado').length;
  const weekCount = Math.ceil((weekdayOf(month, 1) + daysInMonth(month)) / 7);
  /** Teto de cada degrau: os dois tercis e o MAIOR valor observado (ROT-5b). */
  const ceilings: readonly (number | null)[] =
    edges === null || peak === null ? [null, null, null] : [edges[0] ?? null, edges[1] ?? null, peak.agendas];

  const reading =
    `Parcial até ${formatDate(measuredThrough)}: ${formatInt(total)} agendas ` +
    `em ${formatInt(active.length)} dias úteis medidos`;

  const summary =
    average === null || peak === null
      ? 'Calendário do mês sem nenhum dia útil medido.'
      : `Calendário de ${formatMonthLong(month)} em ${formatInt(weekCount)} semanas, parcial até ` +
        `${formatDate(measuredThrough)}: ${formatInt(total)} agendas, média de ` +
        `${formatDecimal(average, 1)} por dia útil. Pico de ${formatInt(peak.agendas)} no dia ` +
        `${formatInt(peak.label)}; ${idleLabel(idle)}` +
        `${holidayCount === 0 ? '' : holidayCount === 1 ? '; 1 feriado saiu da média' : `; ${formatInt(holidayCount)} feriados saíram da média`}` +
        `; ${pending === 1 ? '1 dia será medido' : `${formatDays(pending)} serão medidos`}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="shrink-0 text-xs font-medium leading-[18px] text-text-secondary">
        {reading}
      </p>

      <div
        aria-hidden
        className="grid shrink-0 grid-cols-7 gap-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        {WEEKDAY_LABELS.map((label) => (
          <span className="text-center" key={label}>
            {label}
          </span>
        ))}
      </div>

      <div aria-hidden className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1">
        {cells.map((cell) => {
          const isToday = cell.kind !== 'fora' && cell.label === today;
          const filled = cell.kind === 'medido' || cell.kind === 'zero';
          const degree = cell.agendas === null || edges === null ? 0 : degreeOf(cell.agendas, edges);
          const fill =
            cell.kind === 'zero' || edges === null
              ? ZERO_FILL
              : cell.kind === 'medido'
                ? RAMP_FILLS[degree]
                : undefined;
          const ink = cell.kind === 'medido' && edges !== null ? RAMP_TEXT : NEUTRAL_INK;
          return (
            <div
              className={cn(
                'flex flex-col justify-between rounded border-2 px-1 py-0.5',
                cell.kind === 'feriado' ? 'border-dashed' : null,
              )}
              key={cell.key}
              style={{
                backgroundColor: filled ? fill : undefined,
                borderColor: isToday
                  ? RING_TODAY
                  : cell.kind === 'feriado'
                    ? NEUTRAL_INK
                    : RING_CALM,
              }}
            >
              <span
                className={cn(
                  'font-display text-[0.6875rem] leading-4 tabular-nums',
                  cell.kind === 'semExpediente' ? 'text-text-secondary' : null,
                )}
                style={
                  cell.kind === 'semExpediente' ? undefined : { color: filled ? ink : NEUTRAL_INK }
                }
              >
                {formatInt(cell.label)}
              </span>
              {cell.kind === 'feriado' ? (
                <span
                  className="flex items-center gap-1 text-[0.6875rem] leading-5"
                  style={{ color: NEUTRAL_INK }}
                >
                  <Flag aria-hidden className="size-3 shrink-0" />
                  <span>feriado</span>
                </span>
              ) : null}
              {cell.kind === 'futuro' ? (
                <span className="flex items-center leading-5" style={{ color: NEUTRAL_INK }}>
                  <CalendarClock aria-hidden className="size-3 shrink-0" />
                </span>
              ) : null}
              {filled && cell.agendas !== null ? (
                <span
                  className={cn(
                    'font-display text-sm leading-5 tabular-nums',
                    isToday ? 'font-bold' : 'font-semibold',
                  )}
                  style={{ color: ink }}
                >
                  {formatInt(cell.agendas)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div aria-hidden className="shrink-0 space-y-0.5 text-[0.6875rem] leading-4 text-text-muted">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="h-3 w-4 rounded-[2px]" style={{ backgroundColor: ZERO_FILL }} />
            <span className="font-display tabular-nums">{formatInt(0)}</span>
          </span>
          {RAMP_FILLS.map((token, index) => {
            const ceiling = ceilings[index];
            return (
              <span className="flex items-center gap-1" key={token}>
                <span className="h-3 w-4 rounded-[2px]" style={{ backgroundColor: token }} />
                <span className="font-display tabular-nums">
                  {ceiling === null || ceiling === undefined
                    ? 'sem base'
                    : `até ${formatInt(ceiling)}`}
                </span>
              </span>
            );
          })}
          <span className="flex items-center gap-1">
            <span
              className="h-3 w-4 rounded-[2px] border-2"
              style={{ borderColor: RING_TODAY }}
            />
            <span>hoje</span>
          </span>
          <span className="flex items-center gap-1">
            <span
              className="h-3 w-4 rounded-[2px] border-2 border-dashed"
              style={{ borderColor: NEUTRAL_INK }}
            />
            <span>feriado</span>
          </span>
        </div>
        <div className="flex items-center gap-3 tabular-nums">
          <span>
            {average === null
              ? 'sem dia útil medido para a média'
              : `média de ${formatDecimal(average, 1)} por dia útil`}
          </span>
          <span>{idleLabel(idle)}</span>
          <span className="flex items-center gap-1">
            <CalendarClock aria-hidden className="size-3 shrink-0" />
            <span>{`${formatDays(pending)} a medir`}</span>
          </span>
        </div>
      </div>
    </figure>
  );
}
