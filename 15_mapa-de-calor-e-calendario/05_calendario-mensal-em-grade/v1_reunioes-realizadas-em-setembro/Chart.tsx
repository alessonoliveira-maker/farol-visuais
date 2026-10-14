import { Flag } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatMonthLong } from '@/lib/format';
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

export default function MonthCalendar({ data = defaultData, month = MONTH, height, className }: MonthCalendarProps) {
  const first = data[0];
  const offset = first === undefined ? 0 : weekdayOf(month, first.day);
  const cells: (DayCell | null)[] = [...Array.from({ length: offset }, () => null), ...data];
  while (cells.length < WEEK_ROWS * 7) cells.push(null);

  const worked = data.filter((cell): cell is DayCell & { meetings: number } => cell.meetings !== null);
  const total = worked.reduce((sum, cell) => sum + cell.meetings, 0);
  const workdays = worked.filter((cell) => weekdayOf(month, cell.day) < 5);
  const average = workdays.length === 0 ? 0 : workdays.reduce((sum, cell) => sum + cell.meetings, 0) / workdays.length;
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
        `média de ${formatDecimal(average, 1)} por dia útil. ` +
        `O dia mais cheio é ${formatInt(busiest.day)}, com ${formatInt(busiest.meetings)} reuniões. ` +
        `${formatInt(holidays.length)} dia sem expediente ficou fora da média.`;

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
        {cells.map((cell, index) => {
          if (cell === null) return <div key={`vazio-${String(index)}`} />;
          if (cell.meetings === null) {
            return (
              <div
                className="flex flex-col justify-between rounded border border-dashed border-line-strong p-1"
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
        <span className="tabular-nums">{`${formatInt(total)} no mês, média de ${formatDecimal(average, 1)} por dia útil`}</span>
        <span className="tabular-nums">{`${formatInt(idle)} dias úteis sem reunião`}</span>
      </div>
    </figure>
  );
}
