import { Filter, Flag } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatDecimal, formatInt, formatMonthLong } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, MONTH, type DayCell } from './data';

/**
 * Calendário mensal em grade: o mês desenhado como calendário de parede, sete colunas e seis linhas
 * reservadas. Não compete com a série temporal, que mede tendência melhor; o que ele entrega é a
 * leitura operacional, a de quem olha a própria semana. Por isso o dia do mês fica escrito no canto,
 * como numa agenda, e a contagem no centro.
 *
 * O desenho carrega três estados que o gráfico de linha funde num ponto só: dia com movimento, dia
 * útil que terminou em zero, que é medição, e dia sem expediente, que sai da média e é marcado por
 * ícone. A regra é a do contrato: cor diz magnitude, e ausência nunca é a cor mais fraca da rampa.
 *
 * Seis linhas são reservadas mesmo quando o mês ocupa cinco, para que trocar de mês no filtro não
 * empurre o resto da página para cima e para baixo.
 */
export interface MonthCalendarProps {
  readonly data?: readonly DayCell[];
  readonly month?: string;
  readonly height?: number;
  readonly className?: string;
}

const WEEKDAY_LABELS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'] as const;
const WEEK_ROWS = 6;
/** Zero fica no neutro, fora da rampa; as faixas de cor começam na primeira reunião do dia. */
const ZERO_COLOR = 'var(--surface-sunken)';
const BUCKET_COLORS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const BUCKET_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
/** Limite superior de cada faixa, em reuniões no dia. */
const BUCKET_EDGES = [4, 8, 12, 16] as const;

function bucketOf(value: number): number {
  let bucket = 0;
  for (const edge of BUCKET_EDGES) if (value > edge) bucket += 1;
  return Math.min(BUCKET_COLORS.length - 1, bucket);
}

/** Segunda é 0, domingo é 6. */
function weekdayOf(month: string, day: number): number {
  const time = Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, day);
  return (new Date(time).getUTCDay() + 6) % 7;
}

function daysInMonth(month: string): number {
  return new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate();
}

/** Dia do mês anterior que cai na posição `slot` da primeira linha. */
function previousMonthDays(month: string): number {
  const time = Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 2, 1);
  return daysInMonth(new Date(time).toISOString().slice(0, 7));
}

/** Média por dia útil. Null em lista vazia, nunca zero (EST-1b). */
function averageOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

type GridSlot = { readonly kind: 'dia'; readonly cell: DayCell } | { readonly kind: 'fora'; readonly label: number };

export default function MonthCalendar({ data = defaultData, month = MONTH, height, className }: MonthCalendarProps) {
  const first = data[0];
  const offset = first === undefined ? 0 : weekdayOf(month, first.day);
  const before = previousMonthDays(month);
  const cells: GridSlot[] = [
    ...Array.from({ length: offset }, (_, slot): GridSlot => ({ kind: 'fora', label: before - offset + slot + 1 })),
    ...data.map((cell): GridSlot => ({ kind: 'dia', cell })),
  ];
  for (let next = 1; cells.length < WEEK_ROWS * 7; next += 1) cells.push({ kind: 'fora', label: next });

  const worked = data.filter((cell): cell is DayCell & { meetings: number } => cell.meetings !== null);
  const total = worked.reduce((sum, cell) => sum + cell.meetings, 0);
  const workdays = worked.filter((cell) => weekdayOf(month, cell.day) < 5);
  const average = averageOf(workdays.map((cell) => cell.meetings));
  const busiest = worked.reduce<(DayCell & { meetings: number }) | null>(
    (best, cell) => (best === null || cell.meetings > best.meetings ? cell : best),
    null,
  );
  const idle = workdays.filter((cell) => cell.meetings === 0).length;
  const holidays = data.filter((cell) => cell.meetings === null);

  const summary =
    busiest === null
      ? 'Calendário do mês sem nenhum dia medido.'
      : `Calendário de ${formatMonthLong(month)} com ${formatInt(total)} reuniões realizadas, ` +
        (average === null ? 'sem dia útil medido para a média. ' : `média de ${formatDecimal(average, 1)} por dia útil. `) +
        `O dia mais cheio é ${formatInt(busiest.day)}, com ${formatInt(busiest.meetings)} reuniões. ` +
        `${formatDays(holidays.length)} sem expediente ${holidays.length === 1 ? 'ficou' : 'ficaram'} fora da média.`;

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden size={16} />
        <span>O recorte não tem nenhum dia medido, então não há calendário de reuniões a desenhar.</span>
      </div>
    );
  }

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden className="grid shrink-0 grid-cols-7 gap-1 text-[0.6875rem] leading-4 text-text-muted">
        {WEEKDAY_LABELS.map((label) => (
          <span className="text-center" key={label}>
            {label}
          </span>
        ))}
      </div>

      <div aria-hidden className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1">
        {cells.map((slot) => {
          if (slot.kind === 'fora') {
            return (
              <div className="flex flex-col justify-between p-1" key={`fora-${String(slot.label)}-${String(slot.kind)}`}>
                <span className="font-display text-[0.6875rem] leading-4 tabular-nums text-text-muted">
                  {formatInt(slot.label)}
                </span>
              </div>
            );
          }
          const cell = slot.cell;
          if (cell.meetings === null) {
            return (
              <div
                className="flex flex-col justify-between rounded border border-dashed border-text-muted p-1"
                key={cell.day}
              >
                <span className="font-display text-[0.6875rem] leading-4 tabular-nums text-text-muted">
                  {formatInt(cell.day)}
                </span>
                <span className="flex items-center gap-1 text-[0.6875rem] leading-4 text-text-muted">
                  <Flag aria-hidden className="size-3 shrink-0" />
                  <span>feriado</span>
                </span>
              </div>
            );
          }
          const zero = cell.meetings === 0;
          const bucket = bucketOf(cell.meetings);
          const color = zero ? 'var(--text-muted)' : BUCKET_TEXT[bucket];
          return (
            <div
              className="flex flex-col justify-between rounded p-1"
              key={cell.day}
              style={{ backgroundColor: zero ? ZERO_COLOR : BUCKET_COLORS[bucket] }}
            >
              <span className="font-display text-[0.6875rem] leading-4 tabular-nums" style={{ color }}>
                {formatInt(cell.day)}
              </span>
              <span className="font-display text-sm font-semibold tabular-nums" style={{ color }}>
                {formatInt(cell.meetings)}
              </span>
            </div>
          );
        })}
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="flex items-center gap-1">
          <span className="font-display tabular-nums">{formatInt(0)}</span>
          <span className="h-3 w-4 rounded-[2px]" style={{ backgroundColor: ZERO_COLOR }} />
          {BUCKET_COLORS.map((token) => (
            <span className="h-3 w-4 rounded-[2px]" key={token} style={{ backgroundColor: token }} />
          ))}
          <span className="font-display tabular-nums">{`${formatInt((BUCKET_EDGES[BUCKET_EDGES.length - 1] ?? 0) + 1)}+`}</span>
        </span>
        <span>reuniões realizadas</span>
        <span className="tabular-nums">{average === null
            ? `${formatInt(total)} no mês, sem dia útil medido para a média`
            : `${formatInt(total)} no mês, média de ${formatDecimal(average, 1)} por dia útil`}</span>
        <span className="tabular-nums">{`${formatInt(idle)} ${idle === 1 ? 'dia útil sem reunião' : 'dias úteis sem reunião'}`}</span>
      </div>
    </figure>
  );
}
