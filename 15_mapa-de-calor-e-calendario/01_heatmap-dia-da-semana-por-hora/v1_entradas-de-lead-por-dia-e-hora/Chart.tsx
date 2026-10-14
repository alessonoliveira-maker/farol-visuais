import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatHours } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  DAY_LABELS,
  DAY_ORDER,
  HOURS,
  windowCaption as defaultCaption,
  type LeadHourCell,
  type WeekDay,
} from './data';

/**
 * Heatmap de dia da semana por hora: SVG puro com a geometria calculada aqui (Recharts não tem
 * heatmap). A cor da célula é a média de entradas naquela janela, em 5 faixas sequenciais, e toda
 * célula escreve o valor (ACE-2: cor nunca é o único canal).
 *
 * As faixas usam `--seq-1` a `--seq-3` e `--seq-6` a `--seq-7`, pulando `--seq-4` e `--seq-5` de
 * propósito: medido contra os dois textos disponíveis (`--text-primary`, `--accent-cyan-contrast`)
 * nos dois temas, nenhum dos dois alcança 4,5:1 nessas duas faixas do meio ao mesmo tempo no
 * escuro e no claro (o melhor caso mede 4,29:1 no escuro), então elas ficam fora da escala em vez
 * de entrar com texto ilegível.
 */
export interface LeadHeatmapProps {
  readonly data?: readonly LeadHourCell[];
  /** O que a célula mede, impresso na legenda ("leads por ocorrência do dia..."). */
  readonly caption?: string;
  readonly height?: number;
  readonly className?: string;
}

const CELL_W = 52;
const CELL_H = 27;
const GAP = 1.5;
const LEFT_W = 60;
const TOP_H = 20;
const LABEL_STEP_HOURS = 2;
/** As 3 faixas baixas leem com texto escuro do cartão; as 2 faixas altas, com o texto sobre acento. */
const BUCKET_COLORS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const TEXT_COLORS = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;
const BUCKET_COUNT = BUCKET_COLORS.length;

function bucketOf(value: number, max: number): number {
  if (max <= 0) return 0;
  const step = Math.floor((value / max) * BUCKET_COUNT);
  return Math.min(BUCKET_COUNT - 1, Math.max(0, step));
}

function stepX(hourIndex: number): number {
  return LEFT_W + hourIndex * (CELL_W + GAP);
}

function stepY(dayIndex: number): number {
  return TOP_H + dayIndex * (CELL_H + GAP);
}

export default function LeadHeatmap({ data = defaultData, caption = defaultCaption, height, className }: LeadHeatmapProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma entrada neste recorte: a grade não tem o que colorir.</span>
      </div>
    );
  }

  const byKey = new Map<string, number>();
  for (const cell of data) byKey.set(`${cell.day}-${String(cell.hour)}`, cell.value);

  const values = data.map((cell) => cell.value);
  const max = Math.max(...values);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;

  let peak = data[0];
  for (const cell of data) if (peak === undefined || cell.value > peak.value) peak = cell;
  if (!peak) return null;

  const dayAverages = DAY_ORDER.map((day) => {
    const rowValues = data.filter((cell) => cell.day === day).map((cell) => cell.value);
    const rowAverage = rowValues.length === 0 ? 0 : rowValues.reduce((sum, value) => sum + value, 0) / rowValues.length;
    return { day, rowAverage };
  });
  let lowestDay = dayAverages[0] ?? { day: peak.day, rowAverage: average };
  for (const entry of dayAverages) if (entry.rowAverage < lowestDay.rowAverage) lowestDay = entry;

  const viewWidth = LEFT_W + HOURS.length * (CELL_W + GAP) - GAP;
  const viewHeight = TOP_H + DAY_ORDER.length * (CELL_H + GAP) - GAP;

  const summary =
    `Mapa de calor com ${caption}, em ${String(data.length)} células entre 8h e 20h. ` +
    `Pico ${DAY_LABELS[peak.day]} às ${formatHours(peak.hour)}, ${formatDecimal(peak.value, 1)}. ` +
    `Menor volume aos ${DAY_LABELS[lowestDay.day]}s, média de ${formatDecimal(lowestDay.rowAverage, 1)}. ` +
    `Média geral de ${formatDecimal(average, 1)}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="tabular-nums shrink-0 text-xs leading-4 text-text-secondary">
        Pico <span className="font-display font-semibold text-text-primary">{DAY_LABELS[peak.day]}</span> às{' '}
        {formatHours(peak.hour)}, {formatDecimal(peak.value, 1)} leads por ocorrência do dia, contra a média geral de{' '}
        {formatDecimal(average, 1)} leads por ocorrência do dia.
      </p>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <svg aria-hidden className="h-full max-w-full" viewBox={`0 0 ${String(viewWidth)} ${String(viewHeight)}`}>
          {HOURS.map((hour, hourIndex) =>
            hour % LABEL_STEP_HOURS === 0 ? (
              <text
                className="font-display tabular-nums"
                fill="var(--text-muted)"
                fontSize={11}
                key={`hour-${String(hour)}`}
                textAnchor="middle"
                x={stepX(hourIndex) + CELL_W / 2}
                y={TOP_H - 6}
              >
                {formatHours(hour)}
              </text>
            ) : null,
          )}
          {DAY_ORDER.map((day, dayIndex) => (
            <text
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={12}
              key={day}
              textAnchor="end"
              x={LEFT_W - 8}
              y={stepY(dayIndex) + CELL_H / 2}
            >
              {DAY_LABELS[day]}
            </text>
          ))}
          {DAY_ORDER.flatMap((day: WeekDay, dayIndex) =>
            HOURS.map((hour, hourIndex) => {
              const value = byKey.get(`${day}-${String(hour)}`) ?? 0;
              const bucket = bucketOf(value, max);
              const x = stepX(hourIndex);
              const y = stepY(dayIndex);
              return (
                <g key={`${day}-${String(hour)}`}>
                  <rect fill={BUCKET_COLORS[bucket]} height={CELL_H} rx={2} width={CELL_W} x={x} y={y} />
                  <text
                    className="font-display tabular-nums"
                    dominantBaseline="central"
                    fill={TEXT_COLORS[bucket] ?? 'var(--text-primary)'}
                    fontSize={11}
                    textAnchor="middle"
                    x={x + CELL_W / 2}
                    y={y + CELL_H / 2}
                  >
                    {formatDecimal(value, 1)}
                  </text>
                </g>
              );
            }),
          )}
        </svg>
      </div>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-2 text-[0.6875rem] leading-4 text-text-muted">
        <span className="font-display tabular-nums text-text-secondary">{formatDecimal(0, 1)}</span>
        <div className="flex items-center gap-0.5">
          {BUCKET_COLORS.map((color, index) => (
            <span className="h-3 w-5 rounded-[2px] first:rounded-l-full last:rounded-r-full" key={`scale-${String(index)}`} style={{ backgroundColor: color }} />
          ))}
        </div>
        <span className="font-display tabular-nums text-text-secondary">{formatDecimal(max, 1)}</span>
        <span>{caption}</span>
      </div>
    </figure>
  );
}
