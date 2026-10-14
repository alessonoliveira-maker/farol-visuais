import { Filter, Unplug } from 'lucide-react';

import { formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, GRID_COLUMNS, GRID_ROWS, MONTHS, UF_GRID, type UfLeadsSeries } from './data';

/**
 * Tile map com mini gráfico por UF: a grade de UFs do tile grid, e dentro de cada tile a linha mensal de
 * leads, na MESMA escala para as 27 UFs. A comparação entre UFs é honesta; o preço é que as UFs pequenas
 * ficam rentes à base, e por isso o número do último mês está escrito em cada tile.
 */
export interface LeadsTileMapProps {
  readonly data?: readonly UfLeadsSeries[];
  readonly months?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

/** Caixa de desenho de cada mini gráfico; o SVG estica para o tile, por isso o traço é non-scaling-stroke. */
const VIEW_W = 100;
const VIEW_H = 32;
const PAD_X = 2;
const PAD_Y = 3;
/** O teto da escala compartilhada sobe para o múltiplo redondo de 500 acima do maior valor medido. */
const DOMAIN_STEP = 500;
const TILE_RADIUS = 'rounded-[4px]';

function xAt(index: number, count: number): number {
  return count <= 1 ? VIEW_W / 2 : PAD_X + (index / (count - 1)) * (VIEW_W - 2 * PAD_X);
}

function yAt(value: number, top: number): number {
  return PAD_Y + (1 - value / top) * (VIEW_H - 2 * PAD_Y);
}

/**
 * Caminho da linha. Mês `null` fecha o trecho e abre outro, sem interpolar nem cair a zero. Um ponto
 * isolado vira um segmento de comprimento mínimo, que o `strokeLinecap` redondo desenha como bolinha.
 */
function linePath(values: readonly (number | null)[], top: number): string {
  let path = '';
  let open = false;
  values.forEach((value, index) => {
    if (value === null) {
      open = false;
      return;
    }
    const x = xAt(index, values.length);
    const y = yAt(value, top);
    const next = values[index + 1];
    const isIsolated = !open && (next === null || next === undefined);
    path += `${open ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
    if (isIsolated) path += `L${(x + 0.01).toFixed(2)} ${y.toFixed(2)}`;
    open = true;
  });
  return path;
}

function lastMeasured(values: readonly (number | null)[]): number | null {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (value !== null && value !== undefined) return value;
  }
  return null;
}

function maxMeasured(values: readonly (number | null)[]): number | null {
  const measured = values.flatMap((value) => (value === null ? [] : [value]));
  return measured.length === 0 ? null : Math.max(...measured);
}

export default function LeadsTileMap({ data = defaultData, months = MONTHS, height, className }: LeadsTileMapProps) {
  const peaks = data.flatMap((entry) => {
    const peak = maxMeasured(entry.leads);
    return peak === null ? [] : [peak];
  });
  const highest = peaks.length === 0 ? null : Math.max(...peaks);

  if (highest === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com lead medido neste recorte: o mapa não tem o que desenhar.</span>
      </div>
    );
  }

  const top = Math.max(DOMAIN_STEP, Math.ceil(highest / DOMAIN_STEP) * DOMAIN_STEP);
  const firstMonth = months[0];
  const lastMonth = months[months.length - 1];
  const lastLabel = lastMonth === undefined ? '' : formatMonthShort(lastMonth);
  const firstLabel = firstMonth === undefined ? '' : formatMonthShort(firstMonth);

  const lastValues = data.flatMap((entry) => {
    const value = lastMeasured(entry.leads);
    return value === null ? [] : [{ entry, value }];
  });
  const leader = lastValues.reduce<(typeof lastValues)[number] | undefined>(
    (best, item) => (best === undefined || item.value > best.value ? item : best),
    undefined,
  );
  const withoutData = data.filter((entry) => lastMeasured(entry.leads) === null).length;
  const summary =
    `Mapa de tiles com a série mensal de leads de ${formatInt(data.length)} UFs, de ${firstLabel} a ${lastLabel}, ` +
    `todas na mesma escala de 0 a ${formatInt(top)}. ` +
    (leader ? `Lidera ${leader.entry.uf}, com ${formatInt(leader.value)} leads no último mês. ` : '') +
    (withoutData > 0 ? `${formatInt(withoutData)} UF sem dado medido.` : 'Todas as UFs têm dado.');

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div
        aria-hidden
        className="grid min-h-0 flex-1 gap-1"
        style={{
          gridTemplateColumns: `repeat(${String(GRID_COLUMNS)}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${String(GRID_ROWS)}, minmax(0, 1fr))`,
        }}
      >
        {data.map((entry) => {
          const position = UF_GRID[entry.uf];
          const current = lastMeasured(entry.leads);
          const first = entry.leads.find((value) => value !== null) ?? null;
          return (
            <div
              className={cn('flex min-h-0 min-w-0 flex-col gap-0.5 bg-surface-sunken px-1.5 py-1', TILE_RADIUS)}
              key={entry.uf}
              style={{ gridColumn: position.column, gridRow: position.row }}
              title={
                current === null || first === null
                  ? `${entry.name}: ${formatUnavailable()}`
                  : `${entry.name}: ${formatInt(first)} leads em ${firstLabel}, ${formatInt(current)} em ${lastLabel}`
              }
            >
              <div className="flex shrink-0 items-baseline justify-between gap-1 leading-4">
                <span className="text-xs font-semibold text-text-secondary">{entry.uf}</span>
                {current === null ? null : (
                  <span className="font-display text-[0.6875rem] text-text-primary tabular-nums">{formatInt(current)}</span>
                )}
              </div>
              {current === null ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-0.5 text-text-muted">
                  <Unplug aria-hidden className="size-3.5 shrink-0" />
                  <span className="text-[0.6875rem] leading-none">{formatUnavailable()}</span>
                </div>
              ) : (
                <div className="relative min-h-0 flex-1">
                  <svg aria-hidden className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
                    <path d={`M0 ${String(VIEW_H - PAD_Y)}H${String(VIEW_W)}`} fill="none" stroke="var(--line-subtle)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                    <path
                      d={linePath(entry.leads, top)}
                      fill="none"
                      stroke="var(--chart-1)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  {/* O anel é HTML porque o SVG estica e deformaria o círculo; marca o zero medido, que o traço rente à base não distingue. */}
                  {entry.leads.map((value, index) =>
                    value === 0 ? (
                      <span
                        className="absolute -mt-1 -ml-1 size-2 rounded-full border-[1.5px] border-chart-1 bg-surface-sunken"
                        key={`zero-${months[index] ?? String(index)}`}
                        style={{
                          left: `${String((xAt(index, entry.leads.length) / VIEW_W) * 100)}%`,
                          top: `${String((yAt(0, top) / VIEW_H) * 100)}%`,
                        }}
                      />
                    ) : null,
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted tabular-nums">
        <span>
          {`Mesma escala nas ${formatInt(data.length)} UFs: de 0 a ${formatInt(top)} leads por mês, de ${firstLabel} a ${lastLabel}. O número é o de ${lastLabel}.`}
        </span>
        <span>Anel vazado: mês medido com zero lead. Linha interrompida: mês sem coleta.</span>
      </div>
    </figure>
  );
}
