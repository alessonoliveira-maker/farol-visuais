import { Filter, Unplug } from 'lucide-react';

import { seriesColor } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  GRID_COLUMNS,
  GRID_ROWS,
  PRODUCTS,
  QUARTERS,
  UF_GRID,
  type Product,
  type UfRevenue,
} from './data';

/**
 * Tile map com mini barras empilhadas: nas UFs do perímetro, cada tile mostra a receita de cada
 * trimestre repartida em três produtos, com um slot de cor fixo por produto e o total do último
 * trimestre escrito. UF fora do perímetro é só a sigla num tile rebaixado. Cada tile tem escala própria, de 0 ao maior total trimestral da UF.
 */
export interface RevenueTileMapProps {
  readonly data?: readonly UfRevenue[];
  readonly quarters?: readonly string[];
  readonly products?: readonly Product[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 100;
const VIEW_H = 32;
const BASE_Y = 30;
const TOP_Y = 2;
/** Largura da barra dentro do seu quarto da caixa; o resto é o vão entre trimestres. */
const BAR_FILL = 0.68;
/** Altura do contorno tracejado que marca trimestre sem coleta, em unidades da caixa. */
const GAP_MARK_H = 4;
/** Altura mínima de toda parcela maior que zero, em unidades da caixa (cerca de 1,8 px de tela). */
const MIN_SEGMENT = 0.9;
const TILE_RADIUS = 'rounded-[4px]';

/** Total do trimestre. Qualquer produto `null` é trimestre sem coleta completa: devolve `null`, nunca soma como 0. */
function quarterTotal(entry: UfRevenue, products: readonly Product[], quarter: number): number | null {
  const parts = products.map((product) => entry.revenue[product.id][quarter] ?? null);
  if (parts.some((part) => part === null)) return null;
  return parts.reduce<number>((sum, part) => sum + (part ?? 0), 0);
}

function latestTotal(entry: UfRevenue, products: readonly Product[], count: number): number | null {
  return quarterTotal(entry, products, count - 1);
}

function hasAnyData(entry: UfRevenue, products: readonly Product[], count: number): boolean {
  return Array.from({ length: count }).some((_, quarter) => quarterTotal(entry, products, quarter) !== null);
}

export default function RevenueTileMap({
  data = defaultData,
  quarters = QUARTERS,
  products = PRODUCTS,
  height,
  className,
}: RevenueTileMapProps) {
  const count = quarters.length;
  const perimeter = data.filter((entry) => entry.inPerimeter);
  const tileTotals = (entry: UfRevenue): number[] =>
    Array.from({ length: count }).flatMap((_, quarter) => {
      const total = quarterTotal(entry, products, quarter);
      return total === null ? [] : [total];
    });
  const totals = perimeter.flatMap(tileTotals);

  if (perimeter.length === 0 || totals.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF do perímetro com receita medida neste recorte: o mapa não tem o que empilhar.</span>
      </div>
    );
  }

  const firstLabel = quarters[0] ?? '';
  const lastLabel = quarters[count - 1] ?? '';
  const productTotals = products.map((product) => ({
    product,
    sum: perimeter.reduce((acc, entry) => acc + (entry.revenue[product.id][count - 1] ?? 0), 0),
  }));
  const productSplit = productTotals.some((item) => item.sum > 0)
    ? `Em ${lastLabel}: ${[...productTotals].reverse().map((item) => `${item.product.name} ${formatCurrencyCompact(item.sum)}`).join(', ')}. `
    : '';
  const leader = perimeter.reduce<{ entry: UfRevenue; total: number } | undefined>((best, entry) => {
    const total = latestTotal(entry, products, count);
    return total !== null && (best === undefined || total > best.total) ? { entry, total } : best;
  }, undefined);
  const withoutData = perimeter.filter((entry) => !hasAnyData(entry, products, count)).length;
  const summary =
    `Mapa de tiles com a receita por produto, ${firstLabel} a ${lastLabel}, em ${formatInt(perimeter.length)} UFs do perímetro. ` +
    (leader ? `${leader.entry.uf} lidera, com ${formatCurrencyCompact(leader.total)}. ` : '') +
    productSplit +
    (withoutData > 0 ? `${formatInt(withoutData)} UF sem dado.` : '');

  const slotWidth = VIEW_W / count;
  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
        {/* A legenda lista do topo da pilha para a base, na ordem em que o olho desce pela barra. */}
        {[...products].reverse().map((product) => (
          <span className="flex items-center gap-1.5" key={product.id}>
            <span className="size-2.5 rounded-[2px]" style={{ backgroundColor: seriesColor(product.slot - 1) }} />
            {product.name}
          </span>
        ))}
      </div>
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
          const cell = { gridColumn: position.column, gridRow: position.row };
          if (!entry.inPerimeter) {
            return (
              <div
                className={cn('flex min-h-0 min-w-0 items-start bg-surface-sunken px-1.5 py-1', TILE_RADIUS)}
                key={entry.uf}
                style={cell}
                title={`${entry.name}: fora do perímetro`}
              >
                <span className="text-xs leading-4 font-semibold text-text-muted">{entry.uf}</span>
              </div>
            );
          }
          const total = latestTotal(entry, products, count);
          const tileTop = Math.max(...tileTotals(entry), 1);
          const unit = (BASE_Y - TOP_Y) / tileTop;
          const tileClass = cn('flex min-h-0 min-w-0 flex-col gap-0.5 border border-line-subtle px-1.5 py-1', TILE_RADIUS);
          if (!hasAnyData(entry, products, count)) {
            return (
              <div className={tileClass} key={entry.uf} style={cell} title={`${entry.name}: ${formatUnavailable()}`}>
                <span className="text-xs leading-4 font-semibold text-text-secondary">{entry.uf}</span>
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-0.5 text-text-muted">
                  <Unplug aria-hidden className="size-3.5 shrink-0" />
                  <span className="text-[0.6875rem] leading-none">{formatUnavailable()}</span>
                </div>
              </div>
            );
          }
          return (
            <div
              className={tileClass}
              key={entry.uf}
              style={cell}
              title={`${entry.name}: ${total === null ? formatUnavailable() : formatCurrencyCompact(total)} em ${lastLabel}`}
            >
              <div className="flex shrink-0 items-baseline justify-between gap-1 leading-4">
                <span className="text-xs font-semibold text-text-secondary">{entry.uf}</span>
                <span className="font-display text-[0.6875rem] font-semibold whitespace-nowrap text-text-primary tabular-nums">
                  {total === null ? formatUnavailable() : formatCurrencyCompact(total)}
                </span>
              </div>
              <svg aria-hidden className="min-h-0 w-full flex-1" preserveAspectRatio="none" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
                <path d={`M0 ${String(BASE_Y)}H${String(VIEW_W)}`} fill="none" stroke="var(--line-subtle)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                {quarters.map((quarter, index) => {
                  const x = index * slotWidth + (slotWidth * (1 - BAR_FILL)) / 2;
                  const width = slotWidth * BAR_FILL;
                  if (quarterTotal(entry, products, index) === null) {
                    return (
                      <rect
                        fill="none"
                        height={GAP_MARK_H}
                        key={quarter}
                        stroke="var(--text-muted)"
                        strokeDasharray="2 2"
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                        width={width}
                        x={x}
                        y={BASE_Y - GAP_MARK_H}
                      />
                    );
                  }
                  let cursor = BASE_Y;
                  const drawn = products.flatMap((product) => {
                    const value = entry.revenue[product.id][index] ?? 0;
                    return value > 0 ? [{ product, segment: Math.max(value * unit, MIN_SEGMENT) }] : [];
                  });
                  return (
                    <g key={quarter}>
                      {drawn.map(({ product, segment }, position) => {
                        cursor -= segment;
                        return (
                          <g key={product.id}>
                            <rect fill={seriesColor(product.slot - 1)} height={segment} width={width} x={x} y={cursor} />
                            {position < drawn.length - 1 ? (
                              <path
                                d={`M${String(x)} ${String(cursor)}H${String(x + width)}`}
                                fill="none"
                                stroke="var(--surface-raised)"
                                strokeWidth={1}
                                vectorEffect="non-scaling-stroke"
                              />
                            ) : null}
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted tabular-nums">
        <span>{`Valores só do perímetro de ${formatInt(perimeter.length)} UFs; as ${formatInt(data.length - perimeter.length)} UFs só com a sigla ficam fora e não têm receita aqui.`}</span>
        <span>{`${formatInt(count)} trimestres por tile, de ${firstLabel} a ${lastLabel}; cada tile tem a própria escala, de 0 ao seu maior total, então a altura não compara UFs e o número, o total de ${lastLabel}, compara. Tracejado: sem coleta.`}</span>
      </div>
    </figure>
  );
}
