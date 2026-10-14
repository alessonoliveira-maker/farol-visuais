import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, FIRST_DAY } from './data';

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

const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT_W = 34;
const TOP_H = 18;
const MS_DAY = 86_400_000;

/** Zero é medido e fica no neutro; as 5 faixas de cor começam no primeiro fechamento do dia. */
const ZERO_COLOR = 'var(--surface-sunken)';
const BUCKET_COLORS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
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
  return Math.min(BUCKET_COLORS.length - 1, value - 1);
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

  const columns = days.length > 0 ? (days[days.length - 1]?.column ?? 0) + 1 : 0;
  const total = days.reduce((sum, day) => sum + day.value, 0);
  const peak = days.reduce((best, day) => (best === null || day.value > best.value ? day : best), days[0] ?? null);
  const idleWorkdays = days.filter((day) => day.value === 0 && day.row < 5).length;

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

  const summary =
    peak === null || measuredUntil === null
      ? 'Calendário do ano sem nenhum dia medido.'
      : `Calendário de ${formatInt(days.length)} dias com ${formatInt(total)} fechamentos no ano até ${measuredUntil}. ` +
        `O melhor dia é ${formatDate(isoOf(peak.time))}, com ${formatInt(peak.value)}. ` +
        `${formatInt(idleWorkdays)} dias úteis terminaram sem nenhum fechamento.`;

  const viewWidth = LEFT_W + columns * STEP - GAP;
  const viewHeight = TOP_H + 7 * STEP - GAP;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-3', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div className="flex min-h-0 flex-1 items-center gap-5">
        <svg
          aria-hidden
          className="h-full min-w-0 flex-1"
          preserveAspectRatio="xMidYMid meet"
          viewBox={`0 0 ${String(viewWidth)} ${String(viewHeight)}`}
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
            return (
              <rect
                fill={bucket < 0 ? ZERO_COLOR : BUCKET_COLORS[bucket]}
                height={CELL}
                key={day.time}
                rx={2}
                width={CELL}
                x={LEFT_W + day.column * STEP}
                y={TOP_H + day.row * STEP}
              />
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
          {peak === null ? null : (
            <rect
              fill="none"
              height={CELL + 4}
              rx={3}
              stroke="var(--text-primary)"
              strokeWidth={1.5}
              width={CELL + 4}
              x={LEFT_W + peak.column * STEP - 2}
              y={TOP_H + peak.row * STEP - 2}
            />
          )}
        </svg>

        <dl
          aria-hidden
          className="flex w-44 shrink-0 flex-col gap-1 border-l border-line-subtle pl-4 text-[0.6875rem] leading-4 text-text-muted"
        >
          {/* O recorte anda junto com o número, e não só na frase acessível: o ano está em curso, e
              "374 fechamentos no ano" sozinho promete um ano inteiro que ainda não aconteceu. */}
          <div>
            <dd className="font-display text-xs font-semibold tabular-nums text-text-primary">{formatInt(total)}</dd>
            <dt className="tabular-nums">
              {measuredUntil === null ? 'fechamentos no ano' : `fechamentos até ${measuredUntil}`}
            </dt>
          </div>
          {peak === null ? null : (
            <div>
              <dd className="font-display text-xs font-semibold tabular-nums text-text-primary">
                {formatDate(isoOf(peak.time))}
              </dd>
              <dt className="tabular-nums">{`melhor dia, ${formatInt(peak.value)} fechamentos`}</dt>
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
          <span className="font-display tabular-nums">{formatInt(0)}</span>
          <span className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: ZERO_COLOR }} />
          {BUCKET_COLORS.map((color) => (
            <span className="h-3 w-3 rounded-[2px]" key={color} style={{ backgroundColor: color }} />
          ))}
          <span className="font-display tabular-nums">{`${formatInt(BUCKET_COLORS.length)}+`}</span>
        </span>
        <span>fechamentos no dia</span>
        <span>contorno: melhor dia do ano</span>
        <span>o degrau separa os meses</span>
        {measuredUntil === null ? null : (
          <span className="tabular-nums">{`tracejado: fim da medição em ${measuredUntil}`}</span>
        )}
      </div>
    </figure>
  );
}
