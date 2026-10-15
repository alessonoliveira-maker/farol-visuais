import { AlertTriangle, Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatMonthLong } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CAPACITY, data as defaultData, MONTH, type DayLoad } from './data';

/**
 * Calendário mensal em grade lido contra um teto de capacidade. A pergunta não é quanta agenda o mês
 * teve, é em que dias a pré-vendas marcou mais do que o time de vendas consegue atender: o mês inteiro
 * pode estar dentro da média e ainda assim estourar cinco vezes, e é esse estouro que se paga em
 * reunião remarcada.
 *
 * Por isso a rampa aqui não sai da distribuição, sai do TETO: os três degraus são metade do teto, três
 * quartos dele e o próprio teto. Passando disso a pergunta muda de quanto para se, e a célula sai da
 * rampa: pula para o último degrau e ganha um anel em --warning, o ícone de alerta e o número em peso
 * 700. São três canais além da cor, que é o que a ACE-2 pede.
 *
 * O anel fica separado do preenchimento por 2 px da cor do cartão, e isso é medição e não estética:
 * --warning contra --seq-7 mede 1,21:1 no escuro e 1,44:1 no claro, então um anel encostado no
 * preenchimento desapareceria de um dos lados. Com o vão do cartão os dois lados do anel medem 8,36:1
 * e 5,74:1, acima do piso de 3:1 da WCAG 1.4.11.
 */
export interface CapacityCalendarProps {
  readonly data?: readonly DayLoad[];
  readonly month?: string;
  readonly capacity?: number;
  readonly height?: number;
  readonly className?: string;
}

const WEEKDAY_LABELS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'] as const;
const WEEK_ROWS = 6;
/** Quantos dias acima do teto a frase acessível cita antes de contar o resto. */
const MAX_LISTED = 6;
/** Dia útil que terminou em zero é medição, e fica no poço, fora da rampa. */
const ZERO_FILL = 'var(--surface-sunken)';
/** Três degraus dentro da capacidade. Índice i do array é o token --seq-(i+1). */
const RAMP_FILLS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
] as const;
/** --seq-7, reservado para o que passou do teto: o salto de degrau é o próprio recado. */
const OVER_FILL = CHART_SEQUENTIAL_COLORS[6];
const RAMP_TEXT = 'var(--text-primary)';
const OVER_TEXT = 'var(--accent-cyan-contrast)';
const RING_OVER = 'var(--warning)';
/** Anel da mesma cor do cartão nas células comuns, para o layout não mudar com o destaque. */
const RING_CALM = 'var(--surface-raised)';

/** Degraus derivados do teto: metade, três quartos e o próprio teto. */
function rampEdges(capacity: number): readonly number[] {
  return [Math.floor(capacity / 2), Math.floor((capacity * 3) / 4), capacity];
}

/** 0, 1 e 2 são os degraus dentro da capacidade; 3 é o dia que passou do teto. */
function degreeOf(value: number, edges: readonly number[]): number {
  let degree = 0;
  for (const edge of edges) if (value > edge) degree += 1;
  return degree;
}

/** Segunda é 0, domingo é 6. */
function weekdayOf(month: string, day: number): number {
  const time = Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, day);
  return (new Date(time).getUTCDay() + 6) % 7;
}

type WorkedDay = DayLoad & { readonly agendas: number };

function isWorked(cell: DayLoad): cell is WorkedDay {
  return cell.agendas !== null;
}

/** Média de agendas por dia com expediente. Null em lista vazia, nunca zero (EST-1b). */
function averageOf(days: readonly WorkedDay[]): number | null {
  if (days.length === 0) return null;
  return days.reduce((sum, day) => sum + day.agendas, 0) / days.length;
}

/** O dia mais cheio. Null em lista vazia. */
function peakOf(days: readonly WorkedDay[]): WorkedDay | null {
  return days.reduce<WorkedDay | null>(
    (best, day) => (best === null || day.agendas > best.agendas ? day : best),
    null,
  );
}

export default function CapacityCalendar({
  data = defaultData,
  month = MONTH,
  capacity = CAPACITY,
  height,
  className,
}: CapacityCalendarProps) {
  const edges = rampEdges(capacity);
  const worked = data.filter(isWorked);
  const over = worked.filter((day) => day.agendas > capacity);
  const total = worked.reduce((sum, day) => sum + day.agendas, 0);
  const average = averageOf(worked);
  const peak = peakOf(worked);

  const offset = weekdayOf(month, 1);
  const cells: (DayLoad | null)[] = [...Array.from({ length: offset }, () => null), ...data];
  while (cells.length < WEEK_ROWS * 7) cells.push(null);

  const reading =
    worked.length === 0
      ? `Teto de ${formatInt(capacity)} agendas por dia útil, sem dia útil medido para comparar`
      : `Teto de ${formatInt(capacity)} agendas por dia útil, ` +
        `e ${formatInt(over.length)} dos ${formatInt(worked.length)} passaram dele`;

  /** Dias acima do teto, até MAX_LISTED; o resto vira contagem. */
  const listed = over.slice(0, MAX_LISTED).map((day) => formatInt(day.day));
  const hidden = over.length - listed.length;
  const overWhere =
    over.length === 0
      ? 'nenhum dia útil passou do teto'
      : `${formatInt(over.length)} dos ${formatInt(worked.length)} dias úteis passaram do teto, ` +
        `${over.length === 1 ? 'no dia' : 'nos dias'} ${listed.join(', ')}` +
        `${hidden > 0 ? ` e mais ${formatInt(hidden)}` : ''}`;

  const summary =
    average === null || peak === null
      ? 'Calendário do mês sem nenhum dia com expediente medido.'
      : `Calendário de ${formatMonthLong(month)}, média de ${formatDecimal(average, 1)} agendas por dia útil: ` +
        `${overWhere} (teto de ${formatInt(capacity)} agendas). O pico foi de ` +
        `${formatInt(peak.agendas)} agendas no dia ${formatInt(peak.day)}.`;

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden size={16} />
        <span>O recorte não tem nenhum dia medido, então não há como comparar a agenda com o teto.</span>
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
        {cells.map((cell, index) => {
          if (cell === null) return <div key={`vazio-${String(index)}`} />;
          if (cell.agendas === null) {
            return (
              <div className="rounded p-0.5" key={cell.day} style={{ border: `2px solid ${RING_CALM}` }}>
                <span className="font-display text-[0.6875rem] leading-4 tabular-nums text-text-muted">
                  {formatInt(cell.day)}
                </span>
              </div>
            );
          }
          const degree = degreeOf(cell.agendas, edges);
          const above = degree >= RAMP_FILLS.length;
          const zero = cell.agendas === 0;
          const fill = zero ? ZERO_FILL : above ? OVER_FILL : RAMP_FILLS[degree];
          const ink = zero ? 'var(--text-muted)' : above ? OVER_TEXT : RAMP_TEXT;
          return (
            <div
              className="rounded p-0.5"
              key={cell.day}
              style={{ border: `2px solid ${above ? RING_OVER : RING_CALM}` }}
            >
              <div
                className="flex h-full flex-col justify-between rounded-[2px] px-1 py-0.5"
                style={{ backgroundColor: fill }}
              >
                <span
                  className="font-display text-[0.6875rem] leading-4 tabular-nums"
                  style={{ color: ink }}
                >
                  {formatInt(cell.day)}
                </span>
                <span className="flex items-center gap-0.5 leading-5" style={{ color: ink }}>
                  {above ? <AlertTriangle aria-hidden className="size-3 shrink-0" /> : null}
                  <span
                    className={cn(
                      'font-display text-sm tabular-nums',
                      above ? 'font-bold' : 'font-semibold',
                    )}
                  >
                    {formatInt(cell.agendas)}
                  </span>
                </span>
              </div>
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
          {RAMP_FILLS.map((token, degree) => (
            <span className="flex items-center gap-1" key={token}>
              <span className="h-3 w-4 rounded-[2px]" style={{ backgroundColor: token }} />
              <span className="font-display tabular-nums">
                {`até ${formatInt(edges[degree] ?? capacity)}`}
              </span>
            </span>
          ))}
          <span className="flex items-center gap-1" style={{ color: RING_OVER }}>
            <AlertTriangle aria-hidden className="size-3 shrink-0" />
            <span>acima do teto</span>
          </span>
        </div>
        <div className="flex items-center gap-3 tabular-nums">
          <span>
            {average === null
              ? 'sem dia útil medido para a média'
              : `${formatInt(total)} agendas, média de ${formatDecimal(average, 1)} por dia útil`}
          </span>
          <span>
            {peak === null
              ? 'sem pico medido'
              : `pico de ${formatInt(peak.agendas)} agendas no dia ${formatInt(peak.day)}`}
          </span>
        </div>
      </div>
    </figure>
  );
}
