import { useId } from 'react';

import { formatDate, formatDecimal, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, FIRST_DAY, type QueueRow } from './data';

/**
 * Lasagna: uma linha por entidade, uma coluna por dia, cor pelo valor. É o formato para quando há
 * entidades demais para linhas sobrepostas e dias demais para barras, e a pergunta é onde e quando,
 * não quanto exatamente.
 *
 * Aqui a cor não é rampa de magnitude, e sim régua de SLA: as cinco faixas são categorias de
 * serviço (dentro da hora, no dia, no dia seguinte, atrasado, estourado), com a régua declarada na
 * legenda. Isso muda a leitura de "mais escuro é mais" para "vermelho é fora do combinado", que é a
 * pergunta que uma operação de primeiro contato realmente faz.
 *
 * Dia sem nenhuma entrada na fila sai hachurado, nunca pintado: sem lead não há espera a medir, e
 * pintar de verde um dia vazio seria transformar ausência em desempenho.
 */
export interface QueueSlaLasagnaProps {
  readonly data?: readonly QueueRow[];
  readonly height?: number;
  readonly className?: string;
}

const CELL_W = 8;
const CELL_H = 18;
const GAP_Y = 2;
const LEFT_W = 124;
/**
 * Coluna da mediana, à direita das células. Cabe `indisponível` em 11 px, que mede cerca de 59 px:
 * a fila sem nenhum dia medido escreve a ausência aqui, e o número nunca fica por cima da grade.
 */
const VALUE_W = 64;
const TOP_H = 16;
const HATCH_SIZE = 4;
const HATCH_STROKE = 1.5;
const MS_DAY = 86_400_000;

/**
 * Régua de serviço, não rampa de magnitude. O teto de cada faixa está em horas, e o nome de cada
 * uma vai escrito na legenda: cor sozinha não diz o que é "dentro do combinado".
 *
 * As cinco cores saem todas das cores de papel, nenhuma da rampa `--seq-*`. A rampa é feita para
 * receber texto por cima dentro da célula, não para contrastar com o cartão: medidos contra
 * `--surface-raised`, `--seq-3` dá 2,29:1 no escuro e 1,92:1 no claro, enquanto estes cinco ficam
 * entre 5,3:1 e 9,5:1 nos dois temas. Como `até 24 h` é a faixa mais frequente do desenho, com ela
 * na rampa metade das filas quase sumia no tema claro e a peça sugeria falta de dado onde havia
 * desempenho pior. A rampa também inverte entre os temas, então o miolo da escala virava o ponto
 * mais claro dela e a escala deixava de ordenar.
 */
const SLA_BANDS = [
  { limit: 1, label: 'até 1 h', color: 'var(--positive)' },
  { limit: 4, label: 'até 4 h', color: 'var(--chart-1)' },
  { limit: 24, label: 'até 24 h', color: 'var(--chart-3)' },
  { limit: 48, label: 'até 48 h', color: 'var(--warning)' },
  { limit: Number.POSITIVE_INFINITY, label: 'mais de 48 h', color: 'var(--negative)' },
] as const;

function bandOf(hours: number): number {
  for (let index = 0; index < SLA_BANDS.length; index += 1) {
    const band = SLA_BANDS[index];
    if (band !== undefined && hours <= band.limit) return index;
  }
  return SLA_BANDS.length - 1;
}

function parse(iso: string): number {
  return Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

function isoOf(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

/**
 * Mediana, e não média: um dia de 70 h puxa a média de uma fila que passa o mês inteiro em 2 h.
 *
 * Devolve `null` na lista vazia, nunca zero. Zero hora é uma espera plausível, então a fila sem
 * nenhum dia medido no recorte apareceria como a mais rápida de todas, no topo da ordenação, com
 * "0,0 h" escrito ao lado.
 */
function medianOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? null;
  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

interface QueueSummary {
  readonly row: QueueRow;
  /** `null` quando a fila não teve nenhum dia com entrada no recorte. */
  readonly median: number | null;
  readonly measured: readonly number[];
  readonly idle: number;
}

export default function QueueSlaLasagna({ data = defaultData, height, className }: QueueSlaLasagnaProps) {
  const hatchId = `${useId().replace(/:/g, '')}-sla-ausente`;
  const days = data.reduce((longest, row) => Math.max(longest, row.hours.length), 0);
  const start = parse(FIRST_DAY);

  /**
   * Ordem por mediana, da fila mais rápida para a mais lenta: alfabética esconderia o gradiente.
   * Fila sem nenhum dia medido não entra na ordenação por valor e vai para o fim, como manda a
   * regra de ausência por último.
   */
  const rows: readonly QueueSummary[] = [...data]
    .map((row) => {
      const measured = row.hours.filter((value): value is number => value !== null);
      return { row, median: medianOf(measured), measured, idle: row.hours.length - measured.length };
    })
    .sort((a, b) => {
      if (a.median === null || b.median === null) {
        return (a.median === null ? 1 : 0) - (b.median === null ? 1 : 0);
      }
      return a.median - b.median;
    });

  /** Só as filas com mediana medida entram nos extremos da frase acessível. */
  const measuredRows = rows.filter((entry): entry is QueueSummary & { median: number } => entry.median !== null);
  const allMeasured = rows.flatMap((entry) => entry.measured);
  const breached = allMeasured.filter((hours) => hours > 24).length;
  /** Sem dia medido não há taxa: a base é zero, e taxa sem base é ausência, não zero por cento. */
  const breachShare = allMeasured.length === 0 ? null : breached / allMeasured.length;
  const slowest = measuredRows[measuredRows.length - 1];
  const fastest = measuredRows[0];

  const summary =
    slowest === undefined || fastest === undefined || breachShare === null
      ? `Lasagna de SLA com ${formatInt(rows.length)} filas e nenhum dia medido no recorte: a mediana de cada fila fica ${formatUnavailable()}.`
      : `SLA de primeiro contato de ${formatInt(rows.length)} filas em ${formatInt(days)} dias, ordenadas pela mediana. ` +
        `${fastest.row.name} responde em ${formatDecimal(fastest.median, 1)} h e ${slowest.row.name} em ${formatDecimal(slowest.median, 1)} h. ` +
        `${formatPercent(breachShare, 1)} dos dias medidos passaram de 24 h.`;

  const viewWidth = LEFT_W + days * CELL_W + VALUE_W;
  const viewHeight = TOP_H + rows.length * (CELL_H + GAP_Y) - GAP_Y;

  /** Rótulo de tempo só nas viradas de mês, como manda a leitura esparsa de eixo denso. */
  const monthTicks = Array.from({ length: days }, (_, index) => index).filter((index) => {
    const date = new Date(start + index * MS_DAY);
    return date.getUTCDate() === 1;
  });

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div className="flex min-h-0 flex-1 items-center">
        <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(viewWidth)} ${String(viewHeight)}`}>
          <defs>
            <pattern height={HATCH_SIZE} id={hatchId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={HATCH_SIZE}>
              <rect fill="var(--surface-raised)" height={HATCH_SIZE} width={HATCH_SIZE} x={0} y={0} />
              <line stroke="var(--text-muted)" strokeWidth={HATCH_STROKE} x1={0} x2={0} y1={0} y2={HATCH_SIZE} />
            </pattern>
          </defs>

          {monthTicks.map((index) => (
            <text fill="var(--text-muted)" fontSize={11} key={index} textAnchor="middle" x={LEFT_W + index * CELL_W} y={TOP_H - 5}>
              {formatMonthTick(start + index * MS_DAY)}
            </text>
          ))}

          {rows.map((entry, rowIndex) => {
            const y = TOP_H + rowIndex * (CELL_H + GAP_Y);
            return (
              <g key={entry.row.id}>
                <text
                  dominantBaseline="central"
                  fill="var(--text-secondary)"
                  fontSize={11}
                  textAnchor="end"
                  x={LEFT_W - 8}
                  y={y + CELL_H / 2}
                >
                  {entry.row.name}
                </text>
                {entry.row.hours.map((hours, dayIndex) => (
                  <rect
                    fill={hours === null ? `url(#${hatchId})` : SLA_BANDS[bandOf(hours)]?.color}
                    height={CELL_H}
                    key={dayIndex}
                    width={CELL_W}
                    x={LEFT_W + dayIndex * CELL_W}
                    y={y}
                  />
                ))}
                <text
                  className="font-display tabular-nums"
                  dominantBaseline="central"
                  fill="var(--text-secondary)"
                  fontSize={11}
                  textAnchor="end"
                  x={viewWidth}
                  y={y + CELL_H / 2}
                >
                  {entry.median === null ? formatUnavailable() : `${formatDecimal(entry.median, 1)} h`}
                </text>
              </g>
            );
          })}

          {monthTicks.map((index) => (
            <line
              key={`grade-${String(index)}`}
              stroke="var(--surface-raised)"
              strokeWidth={1.5}
              x1={LEFT_W + index * CELL_W}
              x2={LEFT_W + index * CELL_W}
              y1={TOP_H}
              y2={viewHeight}
            />
          ))}
        </svg>
      </div>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        {SLA_BANDS.map((band) => (
          <span className="flex items-center gap-1" key={band.label}>
            <span className="h-3 w-4 rounded-[2px]" style={{ backgroundColor: band.color }} />
            <span className="tabular-nums">{band.label}</span>
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span
            className="h-3 w-4 rounded-[2px]"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--text-muted) 0 1px, var(--surface-raised) 1px 4px)' }}
          />
          <span>dia sem entrada na fila</span>
        </span>
        <span className="tabular-nums">{`coluna da direita: mediana da fila, de ${formatDate(isoOf(start))} em diante`}</span>
      </div>
    </figure>
  );
}

function formatMonthTick(time: number): string {
  const labels = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return labels[new Date(time).getUTCMonth()] ?? '';
}
