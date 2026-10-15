import { CircleSlash, Filter } from 'lucide-react';

import { formatDate, formatDays, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  MONTH,
  RECESS_END,
  RECESS_START,
  TODAY,
  WINDOW_END,
  WINDOW_START,
  type Milestone,
  type MilestoneKind,
} from './data';

/**
 * Calendário mensal em grade usado como régua de prazo, e não como mapa de calor: a célula carrega
 * EVENTO, então não há rampa sequencial nenhuma nesta versão. A cor do chip diz a natureza do marco, que
 * é categoria e vem de mapa fixo (COR-3), e o teto de dois chips por dia existe porque a terceira linha
 * de texto não caberia na célula sem apertar todas as outras.
 *
 * O que esta versão resolve e as irmãs não é o PERÍODO que atravessa semanas. A janela de leitura
 * conclusiva começa em 14/12/2026 e termina em 13/01/2027, isto é fora do mês desenhado, então ela sai
 * como uma barra por semana e só a ponta REAL ganha canto arredondado: o início, na terceira linha. As
 * pontas que só existem porque a semana acabou ficam retas, e é isso que diz ao leitor que o período
 * continua. A ponta final não aparece na tela em nenhum lugar, e a legenda escreve a data dela.
 *
 * O mês foi conferido contra o calendário de verdade: dez/26 começa numa terça e termina numa quinta,
 * então as semanas de segunda a domingo que o contêm são CINCO, e esta versão desenha cinco linhas em
 * vez das seis reservadas do modelo. A troca está declarada na nota do meta.json.
 */
export interface MilestoneCalendarProps {
  readonly data?: readonly Milestone[];
  readonly month?: string;
  readonly today?: string;
  readonly windowStart?: string;
  readonly windowEnd?: string;
  readonly height?: number;
  readonly className?: string;
}

const WEEKDAY_LABELS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'] as const;
/** Teto de chips por célula. Passando disso a célula escreve quantos sobraram. */
const CHIP_LIMIT = 2;
/** Mapa fixo de natureza para slot de cor, 3, 6 e 5: o slot 1 fica só para o anel de hoje. */
const KIND_FILLS: Record<MilestoneKind, string> = {
  prazo: 'var(--chart-3)',
  comite: 'var(--chart-6)',
  externo: 'var(--chart-5)',
};
const KIND_LABELS: Record<MilestoneKind, string> = {
  prazo: 'prazo interno',
  comite: 'comitê',
  externo: 'compromisso externo',
};
const KIND_ORDER: readonly MilestoneKind[] = ['prazo', 'comite', 'externo'];
/** Texto vazado na cor da superfície: acompanha o cartão nos dois temas, e sem halo (ROT-7b). */
const CHIP_INK = 'var(--surface-raised)';
/** Faixa de período é o poço, nunca --surface-overlay, que no claro é o branco do cartão (ANO-4). */
const BAND_FILL = 'var(--surface-sunken)';
const BAND_INK = 'var(--text-secondary)';
const RING_TODAY = 'var(--chart-1)';
/** Anel da cor do cartão nas células comuns, para o destaque não mudar o layout. */
const RING_CALM = 'var(--surface-raised)';
const NEUTRAL_INK = 'var(--text-muted)';
const MONTH_INK = 'var(--text-primary)';
const WEEKEND_INK = 'var(--text-secondary)';

interface DayBox {
  readonly iso: string;
  readonly day: number;
  readonly inMonth: boolean;
  readonly weekend: boolean;
  readonly recess: boolean;
  readonly today: boolean;
  readonly items: readonly Milestone[];
}

interface BandSegment {
  /** Coluna inicial da grade, em base 1. */
  readonly start: number;
  readonly span: number;
  /** Verdadeiro quando a barra já vinha da semana anterior, e por isso a ponta fica reta. */
  readonly openStart: boolean;
  readonly openEnd: boolean;
}

function isoShift(iso: string, delta: number): string {
  const time = Date.UTC(
    Number(iso.slice(0, 4)),
    Number(iso.slice(5, 7)) - 1,
    Number(iso.slice(8, 10)) + delta,
  );
  const date = new Date(time);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${String(date.getUTCFullYear())}-${month}-${day}`;
}

/** Segunda é 0, domingo é 6. */
function weekdayOf(iso: string): number {
  const time = Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
  return (new Date(time).getUTCDay() + 6) % 7;
}

function daysInMonth(month: string): number {
  const time = Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0);
  return new Date(time).getUTCDate();
}

/** As semanas de segunda a domingo que contêm o mês. Cinco em dez/26, seis em nov/26. */
function buildWeeks(
  month: string,
  items: readonly Milestone[],
  today: string,
): readonly (readonly DayBox[])[] {
  const first = `${month}-01`;
  const offset = weekdayOf(first);
  const length = daysInMonth(month);
  const slots = Math.ceil((offset + length) / 7) * 7;
  const weeks: DayBox[][] = [];
  for (let slot = 0; slot < slots; slot += 1) {
    const iso = isoShift(first, slot - offset);
    const box: DayBox = {
      iso,
      day: Number(iso.slice(8, 10)),
      inMonth: iso.slice(0, 7) === month,
      weekend: weekdayOf(iso) >= 5,
      recess: iso >= RECESS_START && iso <= RECESS_END,
      today: iso === today,
      items: items.filter((item) => item.date === iso),
    };
    const row = weeks[weeks.length - 1];
    if (slot % 7 === 0 || row === undefined) weeks.push([box]);
    else row.push(box);
  }
  return weeks;
}

/** A barra da semana, ou null quando a janela não toca nenhum dia dela. */
function segmentOf(week: readonly DayBox[], from: string, to: string): BandSegment | null {
  let first = -1;
  let last = -1;
  for (let index = 0; index < week.length; index += 1) {
    const box = week[index];
    if (box === undefined) continue;
    if (box.iso >= from && box.iso <= to) {
      if (first < 0) first = index;
      last = index;
    }
  }
  const firstBox = week[first];
  const lastBox = week[last];
  if (first < 0 || firstBox === undefined || lastBox === undefined) return null;
  return {
    start: first + 1,
    span: last - first + 1,
    openStart: firstBox.iso !== from,
    openEnd: lastBox.iso !== to,
  };
}

/** O dia mais cheio de marcos. Null em lista vazia, nunca zero (EST-1b). */
function marcos(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'marco' : 'marcos'}`;
}

/** Dias corridos entre duas datas ISO, contando as duas pontas. */
function spanDays(from: string, to: string): number {
  const toTime = (iso: string): number =>
    Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
  return Math.round((toTime(to) - toTime(from)) / 86_400_000) + 1;
}

function busiestOf(boxes: readonly DayBox[]): DayBox | null {
  return boxes.reduce<DayBox | null>(
    (best, box) => (best === null || box.items.length > best.items.length ? box : best),
    null,
  );
}

export default function MilestoneCalendar({
  data = defaultData,
  month = MONTH,
  today = TODAY,
  windowStart = WINDOW_START,
  windowEnd = WINDOW_END,
  height,
  className,
}: MilestoneCalendarProps) {
  const weeks = buildWeeks(month, data, today);
  const segments = weeks.map((week) => segmentOf(week, windowStart, windowEnd));
  const boxes: DayBox[] = [];
  for (const week of weeks) for (const box of week) boxes.push(box);
  const marked = boxes.filter((box) => box.inMonth && box.items.length > 0);
  const inWindow = data.filter((item) => item.date >= windowStart && item.date <= windowEnd).length;
  const busiest = busiestOf(marked);

  const reading =
    `${formatInt(data.length)} marcos em ${formatMonthShort(month)}, ` +
    `e ${formatInt(inWindow)} caem na janela que abre em ${formatDate(windowStart)}`;

  const outside = windowEnd > `${month}-${String(daysInMonth(month)).padStart(2, '0')}`;
  const summary =
    busiest === null
      ? 'Calendário de marcos do mês sem nenhum marco registrado.'
      : `Calendário de marcos com ${marcos(data.length)} em ${formatDays(marked.length)} de ` +
        `${formatMonthShort(month)}, mais cheio no dia ${formatInt(busiest.day)}, com ` +
        `${marcos(busiest.items.length)}. A janela de leitura abre em ${formatDate(windowStart)}, ` +
        `dura ${formatDays(spanDays(windowStart, windowEnd))} e termina em ${formatDate(windowEnd)}` +
        `${outside ? ', fora do mês' : ''}.`;

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden size={16} />
        <span>O recorte não tem nenhum marco registrado, então não há calendário de prazos a desenhar.</span>
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

      <div aria-hidden className="flex min-h-0 flex-1 flex-col gap-1.5">
        {weeks.map((week, index) => {
          const segment = segments[index] ?? null;
          const firstBox = week[0];
          return (
            <div className="flex min-h-0 flex-1 flex-col gap-0.5" key={firstBox?.iso ?? String(index)}>
              <div className="grid h-4 shrink-0 grid-cols-7 gap-1">
                {segment === null ? null : (
                  <div
                    className="flex items-center"
                    style={{
                      backgroundColor: BAND_FILL,
                      borderBottomLeftRadius: segment.openStart ? 0 : 8,
                      borderBottomRightRadius: segment.openEnd ? 0 : 8,
                      borderTopLeftRadius: segment.openStart ? 0 : 8,
                      borderTopRightRadius: segment.openEnd ? 0 : 8,
                      gridColumn: `${String(segment.start)} / span ${String(segment.span)}`,
                    }}
                  >
                    {segment.openStart ? null : (
                      <span className="px-1 text-[0.6875rem] leading-4" style={{ color: BAND_INK }}>
                        janela de leitura conclusiva
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-7 gap-1">
                {week.map((box) => {
                  const shown = box.items.slice(0, CHIP_LIMIT);
                  const extra = box.items.length - shown.length;
                  const dayInk = !box.inMonth ? NEUTRAL_INK : box.weekend ? WEEKEND_INK : MONTH_INK;
                  return (
                    <div
                      className="flex min-h-0 flex-col gap-0.5 rounded border-2 px-1 py-0.5"
                      key={box.iso}
                      style={{
                        backgroundColor: box.recess ? BAND_FILL : undefined,
                        borderColor: box.today ? RING_TODAY : RING_CALM,
                      }}
                    >
                      <div className="flex shrink-0 items-baseline justify-between text-[0.6875rem] leading-4">
                        <span
                          className={cn(
                            'font-display tabular-nums',
                            box.today ? 'font-bold' : null,
                          )}
                          style={{ color: dayInk }}
                        >
                          {formatInt(box.day)}
                        </span>
                        {extra > 0 ? (
                          <span className="font-display tabular-nums" style={{ color: NEUTRAL_INK }}>
                            {`+${formatInt(extra)}`}
                          </span>
                        ) : null}
                      </div>
                      {box.recess ? (
                        <span
                          className="flex shrink-0 items-center gap-1 text-[0.6875rem] leading-4"
                          style={{ color: NEUTRAL_INK }}
                        >
                          <CircleSlash aria-hidden className="size-3 shrink-0" />
                          <span>recesso</span>
                        </span>
                      ) : null}
                      {shown.map((item) => (
                        <span
                          className="block shrink-0 rounded-[3px] px-1 text-[0.6875rem] leading-4"
                          key={item.id}
                          style={{ backgroundColor: KIND_FILLS[item.kind], color: CHIP_INK }}
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div aria-hidden className="shrink-0 space-y-0.5 text-[0.6875rem] leading-4 text-text-muted">
        <div className="flex items-center gap-3">
          {KIND_ORDER.map((kind) => (
            <span className="flex items-center gap-1" key={kind}>
              <span className="h-3 w-4 rounded-[3px]" style={{ backgroundColor: KIND_FILLS[kind] }} />
              <span>{KIND_LABELS[kind]}</span>
            </span>
          ))}
          <span>
            {`acima de ${formatInt(CHIP_LIMIT)} marcos no dia, o resto vai contado no canto`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-3 w-6 rounded-full" style={{ backgroundColor: BAND_FILL }} />
            <span>{`janela de leitura conclusiva, termina em ${formatDate(windowEnd)}`}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-4 rounded-[2px] border-2" style={{ borderColor: RING_TODAY }} />
            <span>{`hoje, ${formatDate(today)}`}</span>
          </span>
          <span className="flex items-center gap-1">
            <CircleSlash aria-hidden className="size-3 shrink-0" />
            <span>recesso da casa, sem marco</span>
          </span>
        </div>
      </div>
    </figure>
  );
}
