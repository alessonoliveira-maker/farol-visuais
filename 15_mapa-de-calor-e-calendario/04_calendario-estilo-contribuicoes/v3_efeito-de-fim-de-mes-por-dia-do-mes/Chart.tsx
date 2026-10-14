import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthShort, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthDeals } from './data';

/**
 * O mesmo ano do calendário de contribuições, virado: mês na linha, dia do mês na coluna. A troca de
 * eixo troca a pergunta. O calendário por dia da semana mostra ritmo de semana; este mostra ritmo de
 * mês, e é ele que prova ou desmente a suspeita da coordenação de que o fechamento se acumula nos
 * últimos dias úteis.
 *
 * A grade tem 12 linhas por 31 colunas, e o dia inexistente não é zero nem cinza: não se desenha. O
 * comprimento da lista de cada mês é a máscara, então fevereiro para em 28 células e abril em 30. O
 * mesmo vale para o que ainda não aconteceu: setembro para no dia 14, e outubro, novembro e dezembro
 * ficam com a linha vazia e a palavra da ausência escrita na coluna da direita, nunca com uma taxa
 * calculada sobre mês incompleto.
 *
 * A rampa usa só os três degraus que medem acima de 3:1 contra o cartão nos dois temas, `--seq-5`,
 * `--seq-6` e `--seq-7`. Os quatro primeiros degraus do Farol não alcançam o piso da WCAG 1.4.11, e
 * usá-los aqui deixaria a faixa mais baixa invisível num dos temas. Zero medido sai da rampa e vira
 * traço em `--text-muted`, que se vê nos dois temas: o dia trabalhou e não fechou, e isso é resultado.
 *
 * A janela dos últimos cinco dias úteis vai contornada em cada linha, e a parte do mês que cai nela
 * vai escrita com o volume ao lado, porque taxa sem volume não se publica.
 */
export interface MonthDayMatrixProps {
  readonly data?: readonly MonthDeals[];
  readonly height?: number;
  readonly className?: string;
}

const CELL = 19;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT_W = 46;
const RIGHT_W = 104;
const RIGHT_GAP = 12;
const LEAD_H = 18;
const LEAD_GAP = 12;
const HEAD_H = 16;
const LEGEND_GAP = 12;
const LEGEND_H = 16;
const DAYS_MAX = 31;
const SWATCH = 11;
const ZERO_W = 9;
const ZERO_H = 2;
const WINDOW_DAYS = 5;
const DAY_TICKS = [1, 5, 10, 15, 20, 25, 31] as const;

/** Só os três degraus que passam de 3:1 nos dois temas. O quarto degrau do Farol já não passa. */
const BUCKET_COLORS = [
  CHART_SEQUENTIAL_COLORS[4],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const WEEKEND_COLOR = 'var(--surface-sunken)';
const NEUTRAL_COLOR = 'var(--text-muted)';
const WINDOW_COLOR = 'var(--text-primary)';

/** Segunda é 0, domingo é 6. Sábado e domingo são 5 e 6, e é por isso que o teste é `>= 5`. */
function weekdayOf(year: number, month: number, day: number): number {
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
}

/** Quantos dias o mês tem de verdade: o dia 0 do mês seguinte é o último do mês pedido. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Soma de lista, `null` quando a lista está vazia: mês sem medição não soma zero. */
function sumOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

/** Maior valor da lista, `null` quando não há nenhum. É ele que fecha a régua da legenda. */
function maxOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((best, value) => (value > best ? value : best), values[0] ?? 0);
}

interface DayCell {
  readonly day: number;
  readonly value: number;
  readonly weekend: boolean;
}

interface MonthRow {
  readonly key: string;
  readonly label: string;
  readonly length: number;
  readonly cells: readonly DayCell[];
  readonly complete: boolean;
  readonly windowStart: number | null;
  readonly windowSum: number | null;
  readonly total: number | null;
}

/**
 * Uma linha da matriz. Dia útil aqui é dia de segunda a sexta; feriado que caia na janela dos últimos
 * cinco entra nela e aparece como zero medido, o que é a leitura certa: o dia estava no calendário
 * comercial e não fechou nada.
 */
function buildRow(series: MonthDeals): MonthRow {
  const year = Number(series.month.slice(0, 4));
  const month = Number(series.month.slice(5, 7));
  const length = daysInMonth(year, month);
  const cells = series.days.map((value, index) => ({
    day: index + 1,
    value,
    weekend: weekdayOf(year, month, index + 1) >= 5,
  }));
  const business = Array.from({ length }, (_, index) => index + 1).filter(
    (day) => weekdayOf(year, month, day) < 5,
  );
  const lastFive = business.slice(-WINDOW_DAYS);
  const complete = series.days.length === length;
  return {
    key: series.month,
    label: formatMonthShort(series.month),
    length,
    cells,
    complete,
    windowStart: complete ? lastFive[0] ?? null : null,
    windowSum: complete ? sumOf(cells.filter((cell) => lastFive.includes(cell.day)).map((cell) => cell.value)) : null,
    total: sumOf(cells.map((cell) => cell.value)),
  };
}

function rangeLabel(low: number, high: number): string {
  return low === high ? formatInt(low) : `${formatInt(low)} a ${formatInt(high)}`;
}

/** Traço curto de zero medido: o dia trabalhou e não fechou, e isso não é ausência de dado. */
function zeroMark(x: number, y: number): { readonly x: number; readonly y: number } {
  return { x: x + (CELL - ZERO_W) / 2, y: y + (CELL - ZERO_H) / 2 };
}

export default function MonthDayMatrix({ data = defaultData, height, className }: MonthDayMatrixProps) {
  const rows = data.map(buildRow);
  const values = rows.flatMap((row) => row.cells.map((cell) => cell.value));
  const maxValue = maxOf(values);

  if (maxValue === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden size={16} />
        <span>O recorte não tem nenhum dia medido, então não há matriz de mês por dia a desenhar.</span>
      </div>
    );
  }

  const closed = rows.filter((row) => row.complete);
  const windowTotal = sumOf(closed.map((row) => row.windowSum).filter((value): value is number => value !== null));
  const closedTotal = sumOf(closed.map((row) => row.total).filter((value): value is number => value !== null));
  const share =
    windowTotal === null || closedTotal === null ? formatUnavailable() : formatRateWithVolume(windowTotal, closedTotal);
  const measured = rows.filter((row) => row.cells.length > 0);
  const lastRow = measured[measured.length - 1];
  const lastDay = lastRow === undefined ? null : `${lastRow.key}-${String(lastRow.cells.length).padStart(2, '0')}`;
  const year = rows[0]?.key.slice(0, 4) ?? '';

  const low = Math.ceil(maxValue / 3);
  const high = Math.ceil((maxValue * 2) / 3);
  const bucketOf = (value: number): number => (value <= low ? 0 : value <= high ? 1 : 2);
  const bucketLabels = [rangeLabel(1, low), rangeLabel(low + 1, high), `${formatInt(high + 1)} ou mais`] as const;

  const gridTop = LEAD_H + LEAD_GAP + HEAD_H;
  const viewWidth = LEFT_W + DAYS_MAX * STEP - GAP + RIGHT_GAP + RIGHT_W;
  const viewHeight = gridTop + rows.length * STEP - GAP + LEGEND_GAP + LEGEND_H;
  const rightX = viewWidth - RIGHT_W;
  const legendBase = viewHeight - LEGEND_H + 11;
  const rowTop = (index: number): number => gridTop + index * STEP;
  const dayX = (day: number): number => LEFT_W + (day - 1) * STEP;
  const readOut = `nos ${formatInt(closed.length)} meses fechados de ${year}, os últimos ${formatInt(WINDOW_DAYS)} dias úteis levam ${share}`;

  const summary =
    `Matriz de ${formatInt(rows.length)} meses por dia do mês com os fechamentos de ${year}. ` +
    `Nos ${formatInt(closed.length)} meses fechados, os últimos ${formatInt(WINDOW_DAYS)} dias úteis levam ${share}. ` +
    `${lastDay === null ? 'Nenhum dia foi medido.' : `A medição para em ${formatDate(lastDay)}, e os meses seguintes ficam sem base para comparar.`}`;

  return (
    <div
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <svg
        aria-hidden
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${String(viewWidth)} ${String(viewHeight)}`}
      >
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={12} x={0} y={13}>
          {readOut}
        </text>
        {DAY_TICKS.map((day) => (
          <text
            className="font-display"
            fill="var(--text-muted)"
            fontSize={11}
            key={`dia-${String(day)}`}
            textAnchor="middle"
            x={dayX(day) + CELL / 2}
            y={LEAD_H + LEAD_GAP + 11}
          >
            {formatInt(day)}
          </text>
        ))}
        <text fill="var(--text-muted)" fontSize={11} x={rightX} y={LEAD_H + LEAD_GAP + 11}>
          parte do mês
        </text>

        {rows.map((row, index) => (
          <g key={row.key}>
            <text
              className="tabular-nums"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              textAnchor="end"
              x={LEFT_W - 8}
              y={rowTop(index) + CELL / 2}
            >
              {row.label}
            </text>
            {row.cells
              .filter((cell) => cell.weekend)
              .map((cell) => (
                <rect
                  fill={WEEKEND_COLOR}
                  height={STEP}
                  key={`fds-${String(cell.day)}`}
                  width={STEP}
                  x={dayX(cell.day) - GAP / 2}
                  y={rowTop(index) - GAP / 2}
                />
              ))}
            {row.cells.map((cell) =>
              cell.value === 0 ? (
                <rect
                  fill={NEUTRAL_COLOR}
                  height={ZERO_H}
                  key={`dia-${String(cell.day)}`}
                  rx={1}
                  width={ZERO_W}
                  x={zeroMark(dayX(cell.day), rowTop(index)).x}
                  y={zeroMark(dayX(cell.day), rowTop(index)).y}
                />
              ) : (
                <rect
                  fill={BUCKET_COLORS[bucketOf(cell.value)]}
                  height={CELL}
                  key={`dia-${String(cell.day)}`}
                  rx={3}
                  width={CELL}
                  x={dayX(cell.day)}
                  y={rowTop(index)}
                />
              ),
            )}
            {row.windowStart === null ? null : (
              <rect
                fill="none"
                height={CELL + 2}
                rx={4}
                stroke={WINDOW_COLOR}
                strokeWidth={1}
                width={dayX(row.length) + CELL + 2 - dayX(row.windowStart)}
                x={dayX(row.windowStart) - 1}
                y={rowTop(index) - 1}
              />
            )}
            <text
              className="font-display"
              dominantBaseline="central"
              fill={row.complete ? 'var(--text-primary)' : 'var(--text-muted)'}
              fontSize={11}
              x={rightX}
              y={rowTop(index) + CELL / 2}
            >
              {row.windowSum === null || row.total === null
                ? formatUnavailable()
                : formatRateWithVolume(row.windowSum, row.total)}
            </text>
          </g>
        ))}

        {BUCKET_COLORS.map((color, index) => (
          <g key={color}>
            <rect fill={color} height={SWATCH} rx={2} width={SWATCH} x={index * 56} y={legendBase - 9} />
            <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={index * 56 + 15} y={legendBase}>
              {bucketLabels[index]}
            </text>
          </g>
        ))}
        <text fill="var(--text-muted)" fontSize={11} x={200} y={legendBase}>
          fechamentos no dia
        </text>
        <rect fill={NEUTRAL_COLOR} height={ZERO_H} rx={1} width={ZERO_W} x={318} y={legendBase - 5} />
        <text fill="var(--text-muted)" fontSize={11} x={333} y={legendBase}>
          zero medido
        </text>
        <rect fill={WEEKEND_COLOR} height={SWATCH} width={SWATCH} x={412} y={legendBase - 9} />
        <text fill="var(--text-muted)" fontSize={11} x={427} y={legendBase}>
          fim de semana
        </text>
        <rect fill="none" height={SWATCH} rx={3} stroke={WINDOW_COLOR} strokeWidth={1} width={SWATCH} x={517} y={legendBase - 9} />
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={532} y={legendBase}>
          {`últimos ${formatInt(WINDOW_DAYS)} dias úteis do mês`}
        </text>
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={694} y={legendBase}>
          {lastDay === null ? formatUnavailable() : `medido até ${formatDate(lastDay)}`}
        </text>
      </svg>
    </div>
  );
}
