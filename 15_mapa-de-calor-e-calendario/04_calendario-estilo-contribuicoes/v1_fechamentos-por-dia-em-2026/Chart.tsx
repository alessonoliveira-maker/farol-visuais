import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, FIRST_DAY, HOLIDAYS } from './data';

/**
 * Calendário estilo contribuições: o ano inteiro em colunas de semana por linhas de dia da semana.
 * O que ele responde não é "quanto fechamos", que um KPI resolve melhor, e sim "quando fechamos":
 * a concentração de fim de mês, o vazio do fim de semana e os dias úteis que passaram em branco
 * aparecem todos na mesma olhada.
 *
 * O ano está em curso, e isso é dito onde se vê: o degrau tracejado fecha a medição no último dia
 * medido, a legenda nomeia o degrau e o número em destaque leva a data junto. As três datas saem do
 * próprio dado. Sem isso, o vazio à direita do calendário se lê como meses inteiros sem fechamento,
 * e só quem usa leitor de tela recebia o recorte, porque a frase acessível já o calculava.
 *
 * Três cuidados de geometria sustentam a peça. A data anda sempre em UTC, porque misturar fuso faz
 * o dia virar na coluna errada. A semana começa na segunda, como o resto do Farol. E o degrau que
 * separa os meses é calculado do primeiro dia de cada mês, não desenhado por cima: sem ele, abril e
 * maio viram uma mancha só.
 */
export interface YearCalendarProps {
  readonly data?: readonly number[];
  readonly height?: number;
  readonly className?: string;
}

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT_W = 34;
const TOP_H = 18;
const MS_DAY = 86_400_000;

/**
 * Zero é medido e fica fora da rampa: célula neutra com traço em texto de apoio. A rampa usa só os
 * degraus que passam de 3:1 contra o cartão nos dois temas (TOK-8), em três classes com o intervalo
 * escrito na legenda. Feriado é marca própria: neutro com contorno pontilhado.
 */
const ZERO_COLOR = 'var(--surface-sunken)';
const MARK_COLOR = 'var(--text-muted)';
const BUCKETS = [
  { color: CHART_SEQUENTIAL_COLORS[4], range: '1' },
  { color: CHART_SEQUENTIAL_COLORS[5], range: '2 a 3' },
  { color: CHART_SEQUENTIAL_COLORS[6], range: '4 ou mais' },
] as const;
const WEEKDAY_LABELS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'] as const;
const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;

function parse(iso: string): number {
  return Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

/** Segunda é 0, domingo é 6. */
function weekdayOf(time: number): number {
  return (new Date(time).getUTCDay() + 6) % 7;
}

function isoOf(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

function bucketOf(value: number): number {
  if (value <= 0) return -1;
  if (value >= 4) return 2;
  return value >= 2 ? 1 : 0;
}

/** Meia calha antes da coluna: a borda cai no vão, não em cima da célula. */
function edgeX(column: number): number {
  return LEFT_W + column * STEP - GAP / 2;
}
function edgeY(row: number): number {
  return TOP_H + row * STEP - GAP / 2;
}

/**
 * Borda em degrau na posição de um dia, no traçado do calendário do D3: desce pela coluna anterior
 * até o dia da semana em que a virada acontece, dobra e desce o resto. Linha aberta, e não contorno
 * fechado: fechar a região traria uma diagonal cruzando a grade.
 */
function stepPath(column: number, row: number): string {
  if (row === 0) return `M${String(edgeX(column))},${String(edgeY(0))}V${String(edgeY(7))}`;
  return (
    `M${String(edgeX(column + 1))},${String(edgeY(0))}V${String(edgeY(row))}` +
    `H${String(edgeX(column))}V${String(edgeY(7))}`
  );
}

export default function YearCalendar({ data = defaultData, height, className }: YearCalendarProps) {
  const start = parse(FIRST_DAY);
  /** Deslocamento da primeira semana: quantos dias da coluna 0 ficam antes do primeiro dia do ano. */
  const offset = weekdayOf(start);

  const days = data.map((value, index) => {
    const time = start + index * MS_DAY;
    const position = index + offset;
    return {
      value,
      time,
      column: Math.floor(position / 7),
      row: position % 7,
      month: new Date(time).getUTCMonth(),
    };
  });

  const lastDay = days[days.length - 1];
  if (lastDay === undefined) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden size={16} />
        <span>O recorte não tem nenhum dia medido, então não há calendário a desenhar.</span>
      </div>
    );
  }

  const columns = lastDay.column + 1;
  const total = days.reduce((sum, day) => sum + day.value, 0);
  const maxValue = days.reduce((best, day) => (day.value > best ? day.value : best), 0);
  /** Todos os dias no máximo: o empate é do dado, e a ordem do array não escolhe entre eles. */
  const peakDays = maxValue > 0 ? days.filter((day) => day.value === maxValue) : [];
  const isHoliday = (time: number): boolean => HOLIDAYS.includes(isoOf(time));
  const holidayCount = days.filter((day) => isHoliday(day.time)).length;
  const idleWorkdays = days.filter((day) => day.value === 0 && day.row < 5 && !isHoliday(day.time)).length;

  /** Separador em degrau no primeiro dia de cada mês. */
  const monthEdges = MONTH_LABELS.map((label, month) => {
    const first = days.find((day) => day.month === month);
    if (first === undefined) return null;
    return { label, month, path: stepPath(first.column, first.row), labelX: LEFT_W + first.column * STEP };
  }).filter((edge): edge is NonNullable<typeof edge> => edge !== null);

  /**
   * Fim da medição, no mesmo degrau dos meses e em tracejado. O ano não acabou: sem esta borda o
   * calendário simplesmente para no meio de setembro, e o vazio da direita se lê como três meses
   * sem nenhum fechamento. A data sai do próprio dado, como a frase acessível, para o desenho e o
   * texto nunca discordarem sobre onde a medição termina.
   */
  const lastMeasured = days[days.length - 1];
  const measuredUntil = lastMeasured === undefined ? null : formatDate(isoOf(lastMeasured.time));
  const endPosition = days.length + offset;
  const endEdge = lastMeasured === undefined ? null : stepPath(Math.floor(endPosition / 7), endPosition % 7);

  const peakDates = peakDays.map((day) => formatDate(isoOf(day.time))).join(', ');
  const peakText =
    peakDays.length === 0
      ? 'Nenhum dia teve fechamento.'
      : peakDays.length === 1
        ? `O melhor dia é ${peakDates}, com ${formatInt(maxValue)} fechamentos.`
        : `O máximo de ${formatInt(maxValue)} fechamentos aconteceu em ${formatInt(peakDays.length)} dias: ${peakDates}.`;
  const summary =
    measuredUntil === null
      ? 'Calendário do ano sem nenhum dia medido.'
      : `Calendário de ${formatInt(days.length)} dias com ${formatInt(total)} fechamentos no ano até ${measuredUntil}. ` +
        `${peakText} ` +
        `${formatInt(idleWorkdays)} dias úteis terminaram sem nenhum fechamento, fora ${formatInt(holidayCount)} feriados.`;

  const viewWidth = LEFT_W + columns * STEP - GAP;
  const viewHeight = TOP_H + 7 * STEP - GAP;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div className="flex min-h-0 flex-1 items-center gap-5">
        <svg
          aria-hidden
          className="shrink-0"
          height={viewHeight}
          viewBox={`0 0 ${String(viewWidth)} ${String(viewHeight)}`}
          width={viewWidth}
        >
          {monthEdges.map((edge) => (
            <text
              fill="var(--text-muted)"
              fontSize={11}
              key={`label-${String(edge.month)}`}
              textAnchor="start"
              x={edge.labelX}
              y={TOP_H - 6}
            >
              {edge.label}
            </text>
          ))}
          {WEEKDAY_LABELS.map((label, row) =>
            row % 2 === 0 ? (
              <text
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize={11}
                key={label}
                textAnchor="end"
                x={LEFT_W - 8}
                y={TOP_H + row * STEP + CELL / 2}
              >
                {label}
              </text>
            ) : null,
          )}
          {days.map((day) => {
            const bucket = bucketOf(day.value);
            const holiday = isHoliday(day.time);
            const x = LEFT_W + day.column * STEP;
            const y = TOP_H + day.row * STEP;
            return (
              <g key={day.time}>
                <rect
                  fill={bucket < 0 ? ZERO_COLOR : BUCKETS[bucket]?.color}
                  height={CELL}
                  rx={2}
                  stroke={holiday ? MARK_COLOR : 'none'}
                  strokeDasharray={holiday ? '1 2' : undefined}
                  width={CELL}
                  x={x}
                  y={y}
                />
                {bucket < 0 && !holiday ? (
                  <rect fill={MARK_COLOR} height={1.5} width={5} x={x + (CELL - 5) / 2} y={y + (CELL - 1.5) / 2} />
                ) : null}
              </g>
            );
          })}
          {monthEdges.map((edge) => (
            <path
              d={edge.path}
              fill="none"
              key={`edge-${String(edge.month)}`}
              stroke="var(--line-strong)"
              strokeWidth={1}
            />
          ))}
          {endEdge === null ? null : (
            <path d={endEdge} fill="none" stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1} />
          )}
          {peakDays.map((peak) => (
            <rect
              fill="none"
              height={CELL + 4}
              key={`peak-${String(peak.time)}`}
              rx={3}
              stroke="var(--text-primary)"
              strokeWidth={1.5}
              width={CELL + 4}
              x={LEFT_W + peak.column * STEP - 2}
              y={TOP_H + peak.row * STEP - 2}
            />
          ))}
        </svg>

        <dl
          aria-hidden
          className="flex w-44 shrink-0 flex-col gap-1 text-[0.6875rem] leading-4 text-text-muted"
        >
          {/* O recorte anda junto com o número, e não só na frase acessível: o ano está em curso, e
              "374 fechamentos no ano" sozinho promete um ano inteiro que ainda não aconteceu. */}
          <div>
            <dd className="font-display text-xs font-semibold tabular-nums text-text-primary">{formatInt(total)}</dd>
            <dt className="tabular-nums">
              {measuredUntil === null ? 'fechamentos no ano' : `fechamentos até ${measuredUntil}`}
            </dt>
          </div>
          {peakDays.length === 0 ? null : (
            <div>
              <dd className="font-display text-xs font-semibold tabular-nums text-text-primary">
                {peakDays.length === 1 ? formatDate(isoOf(peakDays[0]?.time ?? 0)) : `${formatInt(peakDays.length)} dias`}
              </dd>
              <dt className="tabular-nums">
                {peakDays.length === 1
                  ? `melhor dia, ${formatInt(maxValue)} fechamentos`
                  : `empatados no máximo, ${formatInt(maxValue)} fechamentos cada`}
              </dt>
            </div>
          )}
          <div>
            <dd className="font-display text-xs font-semibold tabular-nums text-text-primary">{formatInt(idleWorkdays)}</dd>
            <dt>dias úteis sem fechar</dt>
          </div>
        </dl>
      </div>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="flex h-3 w-3 items-center justify-center rounded-[2px]"
            style={{ backgroundColor: ZERO_COLOR }}
          >
            <span className="h-px w-1.5" style={{ backgroundColor: MARK_COLOR }} />
          </span>
          <span className="font-display tabular-nums">{formatInt(0)}</span>
          {BUCKETS.map((bucket) => (
            <span className="flex items-center gap-1.5" key={bucket.range}>
              <span className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: bucket.color }} />
              <span className="font-display tabular-nums">{bucket.range}</span>
            </span>
          ))}
          <span>fechamentos no dia</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-[2px]"
            style={{ backgroundColor: ZERO_COLOR, border: `1px dotted ${MARK_COLOR}` }}
          />
          <span>feriado, fora dos dias úteis</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px] border-[1.5px] border-text-primary" />
          <span>dia de máximo</span>
        </span>
        {measuredUntil === null ? null : (
          <span className="tabular-nums">{`tracejado: fim em ${measuredUntil}`}</span>
        )}
      </div>
    </figure>
  );
}
