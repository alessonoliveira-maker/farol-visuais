import { Filter, Unplug } from 'lucide-react';

import { formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, GRID_COLUMNS, GRID_ROWS, MONTHS, UF_GRID, type UfAppointmentSeries } from './data';

/**
 * Tile map com mini gráfico por UF, cada um na PRÓPRIA escala (de 0 ao máximo da UF). Mostra a forma da
 * série mesmo onde o volume é centenas de vezes menor que o da maior UF; o preço é que a altura não
 * compara UFs, e por isso cada tile traz o selo de escala própria e o máximo escrito.
 */
export interface OwnScaleTileMapProps {
  readonly data?: readonly UfAppointmentSeries[];
  readonly months?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 100;
const VIEW_H = 32;
const PAD_X = 2;
const PAD_Y = 3;
const TILE_RADIUS = 'rounded-[4px]';

function xAt(index: number, count: number): number {
  return count <= 1 ? VIEW_W / 2 : PAD_X + (index / (count - 1)) * (VIEW_W - 2 * PAD_X);
}

function yAt(value: number, top: number): number {
  return PAD_Y + (1 - value / top) * (VIEW_H - 2 * PAD_Y);
}

/** Caminho da linha. Mês `null` fecha o trecho e abre outro, sem interpolar nem cair a zero. */
function linePath(values: readonly (number | null)[], top: number): string {
  let path = '';
  let open = false;
  values.forEach((value, index) => {
    if (value === null) {
      open = false;
      return;
    }
    path += `${open ? 'L' : 'M'}${xAt(index, values.length).toFixed(2)} ${yAt(value, top).toFixed(2)}`;
    open = true;
  });
  return path;
}

/** Meses medidos sem vizinho medido dos dois lados: o caminho não os desenha, então viram bolinha. */
function isolatedIndexes(values: readonly (number | null)[]): readonly number[] {
  return values.flatMap((value, index) =>
    value !== null && (values[index - 1] ?? null) === null && (values[index + 1] ?? null) === null ? [index] : [],
  );
}

/** Máximo medido da série, com o índice do mês. Sem nenhum mês medido devolve `null`, nunca 0. */
function peakOf(values: readonly (number | null)[]): { readonly value: number; readonly index: number } | null {
  let best: { value: number; index: number } | null = null;
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value !== null && value !== undefined && (best === null || value > best.value)) best = { value, index };
  }
  return best;
}

export default function OwnScaleTileMap({ data = defaultData, months = MONTHS, height, className }: OwnScaleTileMapProps) {
  const peaks = data.map((entry) => ({ entry, peak: peakOf(entry.appointments) }));
  const measured = peaks.flatMap((item) => (item.peak === null ? [] : [{ entry: item.entry, peak: item.peak }]));

  if (measured.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com agenda medida neste recorte: o mapa não tem o que desenhar.</span>
      </div>
    );
  }

  const firstMonth = months[0];
  const lastMonth = months[months.length - 1];
  const firstLabel = firstMonth === undefined ? '' : formatMonthShort(firstMonth);
  const lastLabel = lastMonth === undefined ? '' : formatMonthShort(lastMonth);
  const biggest = measured.reduce((best, item) => (item.peak.value > best.peak.value ? item : best));
  const smallest = measured.reduce((best, item) => (item.peak.value < best.peak.value ? item : best));
  const withoutData = data.length - measured.length;
  const summary =
    `Mapa de tiles com a série mensal de agendas de ${formatInt(data.length)} UFs, de ${firstLabel} a ${lastLabel}, cada uma na própria escala, sem comparar alturas. ` +
    `O maior máximo é de ${biggest.entry.uf}, com ${formatInt(biggest.peak.value)}; o menor, de ${smallest.entry.uf}, com ${formatInt(smallest.peak.value)}. ` +
    (withoutData > 0 ? `${formatInt(withoutData)} UF sem nenhum mês medido.` : 'Todas as UFs têm mês medido.');

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="m-0 shrink-0 text-xs font-medium text-text-secondary">
        Cada tile tem a própria escala: compare a forma, não a altura entre UFs.
      </p>
      <div
        aria-hidden
        className="grid min-h-0 flex-1 gap-1"
        style={{
          gridTemplateColumns: `repeat(${String(GRID_COLUMNS)}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${String(GRID_ROWS)}, minmax(0, 1fr))`,
        }}
      >
        {peaks.map(({ entry, peak }) => {
          const position = UF_GRID[entry.uf];
          const peakMonth = peak === null ? undefined : months[peak.index];
          return (
            <div
              className={cn('flex min-h-0 min-w-0 flex-col gap-0.5 bg-surface-sunken px-2 py-1', TILE_RADIUS)}
              key={entry.uf}
              style={{ gridColumn: position.column, gridRow: position.row }}
              title={
                peak === null
                  ? `${entry.name}: ${formatUnavailable()}`
                  : `${entry.name}: máximo de ${formatInt(peak.value)} agendas em ${peakMonth === undefined ? '' : formatMonthShort(peakMonth)}`
              }
            >
              <div className="flex shrink-0 items-baseline justify-between gap-1 leading-4">
                <span className="text-xs font-semibold text-text-secondary">{entry.uf}</span>
                {peak === null ? null : (
                  <span className="font-display text-[0.6875rem] whitespace-nowrap text-text-primary tabular-nums">
                    {`máximo ${formatInt(peak.value)}`}
                  </span>
                )}
              </div>
              {peak === null ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-0.5 text-text-muted">
                  <Unplug aria-hidden className="size-3.5 shrink-0" />
                  <span className="text-[0.6875rem] leading-none">{formatUnavailable()}</span>
                </div>
              ) : (
                <>
                  <div className="relative min-h-0 flex-1">
                  <svg aria-hidden className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
                    <path d={`M0 ${String(VIEW_H - PAD_Y)}H${String(VIEW_W)}`} fill="none" stroke="var(--line-subtle)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                    <path
                      d={linePath(entry.appointments, peak.value)}
                      fill="none"
                      stroke="var(--chart-1)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  {/* A bolinha é HTML porque o SVG esticado deformaria o círculo e o ponto isolado sumiria. */}
                  {isolatedIndexes(entry.appointments).map((index) => {
                    const value = entry.appointments[index] ?? 0;
                    return (
                      <span
                        className="absolute -mt-1 -ml-1 size-2 rounded-full bg-chart-1"
                        key={`solo-${months[index] ?? String(index)}`}
                        style={{
                          left: `${String((xAt(index, entry.appointments.length) / VIEW_W) * 100)}%`,
                          top: `${String((yAt(value, peak.value) / VIEW_H) * 100)}%`,
                        }}
                      />
                    );
                  })}
                  </div>
                  <span className="w-fit shrink-0 rounded-[2px] bg-surface-overlay px-1 text-[0.6875rem] leading-4 text-text-secondary">
                    escala própria
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted tabular-nums">
        <span>{`Agendas por mês, de ${firstLabel} a ${lastLabel}. Cada linha vai de 0 ao máximo escrito no próprio tile.`}</span>
        <span>Linha interrompida: mês sem medição. Ponto solto: um mês medido entre meses sem medição.</span>
      </div>
    </figure>
  );
}
