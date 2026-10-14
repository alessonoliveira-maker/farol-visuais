import { Filter } from 'lucide-react';
import { useId } from 'react';

import { formatDecimal, formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  CAPACITY_HOURS_PER_DAY,
  CURRENT_WEEK_ELAPSED_DAYS,
  data as defaultData,
  type SdrWeeks,
  WEEK_ONE,
  WORKDAYS_PER_WEEK,
} from './data';

/**
 * Lasagna semanal com escala divergente: uma linha por SDR, uma coluna por semana, e a cor
 * medindo a distância até a capacidade da agenda, não a magnitude bruta de horas.
 *
 * O centro da escala é 100% da capacidade, e é isso que a torna divergente: para baixo do centro
 * a cor esfria (folga), para cima aquece (sobrecarga), e o degrau do meio é o neutro de quem está
 * na capacidade. Os tokens do Farol não têm rampa divergente, então os dois braços são
 * emprestados de duas cores de papel opostas, cada braço com dois degraus, tudo numa função de
 * cor só: no dia em que existir `--div-*` troca o corpo dela e mais nada.
 *
 * Semana acima de 100% leva contorno além da cor, porque cor sozinha não é canal suficiente e
 * porque o teto é uma régua contratada, não um gradiente. A semana em curso é incompleta e sai
 * com moldura tracejada: a ocupação dela é calculada sobre os dias já decorridos, para poder ser
 * comparada, e ela fica fora da média escrita à direita.
 */
export interface SdrOccupancyLasagnaProps {
  readonly data?: readonly SdrWeeks[];
  readonly height?: number;
  readonly className?: string;
}

/** Corpo medido do canvas `largo` na moldura `card`: 894 x 281,5 px, com o caso de uso em uma linha. */
const VIEW_W = 894;
const VIEW_H = 281;
const LEFT_W = 92;
const VALUE_W = 46;
const TOP_H = 16;
const CELL_H = 20;
const GAP_Y = 4;
const TICK_BASELINE = 12;
const LEGEND_ONE = 250;
const LEGEND_TWO = 268;
const SWATCH_W = 14;
const SWATCH_H = 10;
const SWATCH_GAP = 6;
const SLOT_ONE = 150;
const SLOT_TWO_B = 180;
const SLOT_TWO_C = 380;
const NOTE_X = 560;
const OVER_STROKE = 1.5;
const HATCH_SIZE = 4;
const HATCH_STROKE = 1.5;
const MS_DAY = 86_400_000;
const FULL = 1;
const OVER = 1;

/**
 * A escala divergente, centrada em 100% da capacidade, com o teto de cada degrau em fração.
 *
 * Os dois braços saem de `--chart-1` e de `--negative`, e o centro de `--text-muted`, que o
 * contrato nomeia como categoria neutra. A opacidade de 0,70 do degrau interno de cada braço está
 * acima do mínimo medido das duas cores (0,66 para as duas), então a marca composta continua sobre
 * o piso de 3:1 nos dois temas: `--chart-1` a 0,70 mede 5,30:1 no escuro e 3,25:1 no claro, e
 * `--negative` a 0,70 mede 3,28:1 e 3,67:1. Nenhum degrau vem da rampa `--seq-*`: ali os dois
 * degraus mais baixos não alcançam 3:1 contra o cartão em tema nenhum.
 */
const OCCUPANCY_BANDS = [
  { limit: 0.7, color: 'var(--chart-1)', alpha: FULL, over: false },
  { limit: 0.9, color: 'var(--chart-1)', alpha: 0.7, over: false },
  { limit: 1, color: 'var(--text-muted)', alpha: FULL, over: false },
  { limit: 1.15, color: 'var(--negative)', alpha: 0.7, over: true },
  { limit: Number.POSITIVE_INFINITY, color: 'var(--negative)', alpha: FULL, over: true },
] as const;

function bandOf(occupancy: number): number {
  for (let index = 0; index < OCCUPANCY_BANDS.length; index += 1) {
    const band = OCCUPANCY_BANDS[index];
    if (band !== undefined && occupancy <= band.limit) return index;
  }
  return OCCUPANCY_BANDS.length - 1;
}

/** O rótulo de cada degrau, com o teto escrito: a cor é apoio e quem ordena é o texto. */
function bandLabel(index: number): string {
  const band = OCCUPANCY_BANDS[index];
  const previous = OCCUPANCY_BANDS[index - 1];
  if (band === undefined) return formatUnavailable();
  if (previous === undefined) return `até ${formatPercent(band.limit, 0)}`;
  if (!Number.isFinite(band.limit)) return `mais de ${formatPercent(previous.limit, 0)}`;
  return `${formatPercent(previous.limit, 0)} a ${formatPercent(band.limit, 0)}`;
}

/**
 * Média das semanas medidas, e `null` na lista vazia, nunca zero.
 *
 * Zero por cento de ocupação é um valor plausível, então o SDR sem nenhuma semana registrada
 * apareceria no fim da ordem como o mais folgado de todos, em vez de aparecer sem medida.
 */
function meanOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  let total = 0;
  for (const value of values) total += value;
  return total / values.length;
}

function parse(iso: string): number {
  return Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

/** O mês de um instante em `YYYY-MM`, para o rótulo de tempo sair por `formatMonthShort`. */
function monthKey(time: number): string {
  const date = new Date(time);
  return `${String(date.getUTCFullYear())}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

interface WeekCell {
  readonly index: number;
  /** `null` quando a semana não tem agenda registrada. */
  readonly occupancy: number | null;
}

interface SdrSummary {
  readonly row: SdrWeeks;
  readonly cells: readonly WeekCell[];
  /** Média das semanas fechadas e medidas; `null` quando nenhuma foi medida. */
  readonly mean: number | null;
  readonly overWeeks: number;
}

export default function SdrOccupancyLasagna({ data = defaultData, height, className }: SdrOccupancyLasagnaProps) {
  const hatchId = `${useId().replace(/:/g, '')}-semana-sem-agenda`;
  const weeks = data.reduce((longest, row) => Math.max(longest, row.booked.length), 0);
  const start = parse(WEEK_ONE);
  const currentIndex = weeks - 1;

  const capacityOf = (index: number): number =>
    CAPACITY_HOURS_PER_DAY * (index === currentIndex ? CURRENT_WEEK_ELAPSED_DAYS : WORKDAYS_PER_WEEK);

  /** Ordem pela ocupação média, a maior no topo: alfabética esconderia quem está sobrecarregado. */
  const rows: readonly SdrSummary[] = [...data]
    .map((row) => {
      const cells = row.booked.map((booked, index) => ({
        index,
        occupancy: booked === null ? null : booked / capacityOf(index),
      }));
      const closed = cells
        .filter((cell) => cell.index !== currentIndex)
        .map((cell) => cell.occupancy)
        .filter((value): value is number => value !== null);
      return {
        row,
        cells,
        mean: meanOf(closed),
        overWeeks: closed.filter((value) => value > OVER).length,
      };
    })
    .sort((a, b) => {
      if (a.mean === null || b.mean === null) return (a.mean === null ? 1 : 0) - (b.mean === null ? 1 : 0);
      return b.mean - a.mean;
    });

  const measuredRows = rows.filter((entry): entry is SdrSummary & { mean: number } => entry.mean !== null);
  const busiest = measuredRows[0];
  const calmest = measuredRows[measuredRows.length - 1];
  const chronic = measuredRows.filter((entry) => entry.mean > OVER).length;
  const touched = rows.filter((entry) => entry.overWeeks > 0).length;

  const summary =
    busiest === undefined || calmest === undefined
      ? `Lasagna de ocupação com ${formatInt(rows.length)} SDRs e nenhuma semana registrada: a ocupação média de cada um fica ${formatUnavailable()}.`
      : `Mapa de ocupação semanal de ${formatInt(rows.length)} SDRs em ${formatInt(currentIndex)} semanas fechadas, do mais ocupado para o menos. ` +
        `${busiest.row.name} ocupa ${formatPercent(busiest.mean, 0)} da capacidade e ${calmest.row.name} ocupa ${formatPercent(calmest.mean, 0)}. ` +
        `${formatInt(chronic)} passam de 100% na média e ${formatInt(touched)} tiveram semana acima do teto.`;

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden height={16} width={16} />
        <span>O recorte não tem SDR nenhum, então não há semana de agenda a comparar.</span>
      </div>
    );
  }

  const columnWidth = (VIEW_W - LEFT_W - VALUE_W) / weeks;
  const gridBottom = TOP_H + rows.length * (CELL_H + GAP_Y) - GAP_Y;

  /** Rótulo de tempo só na virada de mês: 26 colunas não cabem 26 rótulos. */
  const monthTicks = Array.from({ length: weeks }, (_, index) => index).filter((index) => {
    if (index === 0) return true;
    const current = new Date(start + index * 7 * MS_DAY).getUTCMonth();
    const previous = new Date(start + (index - 1) * 7 * MS_DAY).getUTCMonth();
    return current !== previous;
  });

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <defs>
          <pattern height={HATCH_SIZE} id={hatchId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={HATCH_SIZE}>
            <rect fill="var(--surface-raised)" height={HATCH_SIZE} width={HATCH_SIZE} x={0} y={0} />
            <line stroke="var(--text-muted)" strokeWidth={HATCH_STROKE} x1={0} x2={0} y1={0} y2={HATCH_SIZE} />
          </pattern>
        </defs>

        {monthTicks.map((index) => (
          <text
            className="tabular-nums"
            fill="var(--text-muted)"
            fontSize={11}
            key={index}
            textAnchor="start"
            x={LEFT_W + index * columnWidth + 2}
            y={TICK_BASELINE}
          >
            {formatMonthShort(monthKey(start + index * 7 * MS_DAY))}
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
              {entry.cells.map((cell) => {
                const band = cell.occupancy === null ? undefined : OCCUPANCY_BANDS[bandOf(cell.occupancy)];
                const x = LEFT_W + cell.index * columnWidth;
                return (
                  <g key={cell.index}>
                    <rect
                      fill={band === undefined ? `url(#${hatchId})` : band.color}
                      fillOpacity={band === undefined ? FULL : band.alpha}
                      height={CELL_H}
                      width={columnWidth - 1}
                      x={x}
                      y={y}
                    />
                    {band !== undefined && band.over ? (
                      <rect
                        fill="none"
                        height={CELL_H - OVER_STROKE}
                        stroke="var(--warning)"
                        strokeWidth={OVER_STROKE}
                        width={columnWidth - 1 - OVER_STROKE}
                        x={x + OVER_STROKE / 2}
                        y={y + OVER_STROKE / 2}
                      />
                    ) : null}
                  </g>
                );
              })}
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={11}
                textAnchor="end"
                x={VIEW_W}
                y={y + CELL_H / 2}
              >
                {entry.mean === null ? formatUnavailable() : formatPercent(entry.mean, 0)}
              </text>
            </g>
          );
        })}

        <rect
          fill="none"
          height={gridBottom - TOP_H + 4}
          stroke="var(--text-muted)"
          strokeDasharray="3 3"
          width={columnWidth - 1 + 4}
          x={LEFT_W + currentIndex * columnWidth - 2}
          y={TOP_H - 2}
        />

        {OCCUPANCY_BANDS.map((band, index) => (
          <g key={band.limit}>
            <rect
              fill={band.color}
              fillOpacity={band.alpha}
              height={SWATCH_H}
              rx={2}
              width={SWATCH_W}
              x={index * SLOT_ONE}
              y={LEGEND_ONE - 8}
            />
            <text
              className="tabular-nums"
              fill="var(--text-muted)"
              fontSize={11}
              x={index * SLOT_ONE + SWATCH_W + SWATCH_GAP}
              y={LEGEND_ONE}
            >
              {bandLabel(index)}
            </text>
          </g>
        ))}

        <rect fill={`url(#${hatchId})`} height={SWATCH_H} rx={2} width={SWATCH_W} x={0} y={LEGEND_TWO - 8} />
        <text fill="var(--text-muted)" fontSize={11} x={SWATCH_W + SWATCH_GAP} y={LEGEND_TWO}>
          semana sem agenda
        </text>

        <rect
          fill="none"
          height={SWATCH_H}
          rx={2}
          stroke="var(--text-muted)"
          strokeDasharray="3 3"
          width={SWATCH_W}
          x={SLOT_TWO_B}
          y={LEGEND_TWO - 8}
        />
        <text fill="var(--text-muted)" fontSize={11} x={SLOT_TWO_B + SWATCH_W + SWATCH_GAP} y={LEGEND_TWO}>
          semana em curso, parcial
        </text>

        <rect
          fill="var(--negative)"
          fillOpacity={0.7}
          height={SWATCH_H}
          stroke="var(--warning)"
          strokeWidth={OVER_STROKE}
          width={SWATCH_W}
          x={SLOT_TWO_C}
          y={LEGEND_TWO - 8}
        />
        <text fill="var(--text-muted)" fontSize={11} x={SLOT_TWO_C + SWATCH_W + SWATCH_GAP} y={LEGEND_TWO}>
          acima da capacidade
        </text>

        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={NOTE_X} y={LEGEND_TWO}>
          {`teto de ${formatDecimal(CAPACITY_HOURS_PER_DAY * WORKDAYS_PER_WEEK, 0)} h; à direita, a média que ordena`}
        </text>
      </svg>
    </figure>
  );
}
