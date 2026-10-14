import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, GRID_COLUMNS, GRID_ROWS, leadsWithoutUf as defaultLeadsWithoutUf, UF_GRID, type UfCoverage } from './data';

/**
 * Tile grid map da cobertura de leads por UF, com três estados que nunca se confundem: UF com leads
 * (cor por classe e o número), UF com zero medido (contorno cheio e o 0 escrito) e UF sem dado
 * (hachura, contorno pontilhado e as palavras sem dado). Ao lado, o card dos leads sem UF, que
 * chegam sem UF preenchida, não pertencem a nenhum tile e ficam fora da distribuição.
 */
export interface CoverageTileGridProps {
  readonly data?: readonly UfCoverage[];
  readonly leadsWithoutUf?: number;
  readonly height?: number;
  readonly className?: string;
}

const CLASS_COUNT = 5;
const TILE_RADIUS = 'rounded-[4px]';

/**
 * Cinco classes na rampa sequencial, pulando --seq-4 e --seq-5: nenhum dos dois textos disponíveis
 * alcança 4,5:1 contra eles nos dois temas (TOK-2). O número está em todo tile, então a cor é apoio.
 */
const CLASS_COLORS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const CLASS_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;

/** Hachura de 135 graus: o fundo do tile sem dado. Só reforça; as palavras e o contorno pontilhado dizem o mesmo. */
const HATCH = 'repeating-linear-gradient(135deg, transparent 0, transparent 5px, var(--line-subtle) 5px, var(--line-subtle) 6px)';

/**
 * Limites superiores de cada classe pelos quantis das UFs com leads (a mesma quantidade de UFs em
 * cada classe, salvo empate). Contagem é muito assimétrica: com intervalo igual, uma UF grande
 * deixaria todas as outras na primeira classe. Zero e sem dado ficam fora dos quantis.
 */
function buildUpperBounds(counts: readonly number[]): readonly number[] | null {
  if (counts.length === 0) return null;
  const sorted = [...counts].sort((a, b) => a - b);
  return Array.from({ length: CLASS_COUNT }, (_, index) => {
    const at = Math.max(0, Math.ceil(((index + 1) * sorted.length) / CLASS_COUNT) - 1);
    return sorted[at] ?? 0;
  });
}

function classOf(value: number, upper: readonly number[]): number {
  for (let index = 0; index < CLASS_COUNT; index += 1) {
    const bound = upper[index];
    if (bound !== undefined && value <= bound) return index;
  }
  return CLASS_COUNT - 1;
}

export default function CoverageTileGrid({
  data = defaultData,
  leadsWithoutUf = defaultLeadsWithoutUf,
  height,
  className,
}: CoverageTileGridProps) {
  const positives = data.flatMap((entry) => (entry.leads !== null && entry.leads > 0 ? [entry.leads] : []));
  const upper = buildUpperBounds(positives);

  if (data.length === 0 || upper === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com lead neste recorte: o mapa não tem o que colorir.</span>
      </div>
    );
  }

  const zeroCount = data.filter((entry) => entry.leads === 0).length;
  const missingCount = data.filter((entry) => entry.leads === null).length;
  const mappedTotal = positives.reduce((sum, value) => sum + value, 0);
  const grandTotal = mappedTotal + leadsWithoutUf;
  const withoutShare = grandTotal > 0 ? leadsWithoutUf / grandTotal : null;
  let top: UfCoverage | undefined;
  for (const entry of data) {
    if (entry.leads !== null && (top === undefined || (top.leads ?? 0) < entry.leads)) top = entry;
  }
  const summary =
    `Mapa de tiles com os leads de ${formatInt(data.length)} UFs: ${formatInt(positives.length)} com leads, ${formatInt(zeroCount)} com zero medido e ` +
    `${formatInt(missingCount)} sem dado. ${top?.uf ?? 'Nenhuma UF'} tem mais leads, ${formatInt(top?.leads ?? 0)}. ` +
    `Outros ${formatInt(leadsWithoutUf)} leads${withoutShare === null ? '' : `, ${formatPercent(withoutShare, 0)} do total,`} chegaram sem UF e ficam fora do mapa.`;

  const classLabels = upper.map((bound, index) => {
    const low = index === 0 ? 1 : (upper[index - 1] ?? 0) + 1;
    return bound < low ? formatInt(bound) : `${formatInt(low)} a ${formatInt(bound)}`;
  });

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 gap-4', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div
        aria-hidden
        className="grid min-h-0 min-w-0 flex-1 gap-1"
        style={{
          gridTemplateColumns: `repeat(${String(GRID_COLUMNS)}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${String(GRID_ROWS)}, minmax(0, 1fr))`,
        }}
      >
        {data.map((entry) => {
          const position = UF_GRID[entry.uf];
          const placement = { gridColumn: position.column, gridRow: position.row };
          const base = cn('flex min-h-0 min-w-0 flex-col items-center justify-center gap-0.5 border-[1.5px] leading-none', TILE_RADIUS);
          if (entry.leads === null) {
            return (
              <div
                className={cn(base, 'border-dashed border-text-muted')}
                key={entry.uf}
                style={{ ...placement, backgroundImage: HATCH }}
                title={`${entry.name}: sem dado`}
              >
                <span className="text-xs font-semibold text-text-secondary">{entry.uf}</span>
                <span className="whitespace-nowrap text-[0.6875rem] text-text-secondary">sem dado</span>
              </div>
            );
          }
          if (entry.leads === 0) {
            return (
              <div
                className={cn(base, 'border-text-muted text-text-primary')}
                key={entry.uf}
                style={placement}
                title={`${entry.name}: 0 leads medidos`}
              >
                <span className="text-xs font-semibold">{entry.uf}</span>
                <span className="font-display text-[0.6875rem] tabular-nums">{formatInt(0)}</span>
              </div>
            );
          }
          const bucket = classOf(entry.leads, upper);
          return (
            <div
              className={cn(base, 'border-transparent')}
              key={entry.uf}
              style={{ ...placement, backgroundColor: CLASS_COLORS[bucket], color: CLASS_TEXT[bucket] }}
              title={`${entry.name}: ${formatInt(entry.leads)} leads`}
            >
              <span className="text-xs font-semibold">{entry.uf}</span>
              <span className="font-display text-[0.6875rem] tabular-nums">{formatInt(entry.leads)}</span>
            </div>
          );
        })}
      </div>

      <div aria-hidden className="flex w-40 shrink-0 flex-col justify-between gap-3">
        <div className="flex flex-col gap-0.5 rounded-lg bg-surface-sunken p-3">
          <span className="text-[0.6875rem] leading-4 text-text-muted">Leads sem UF</span>
          <span className="kpi-number text-2xl font-semibold leading-7 text-text-primary">{formatInt(leadsWithoutUf)}</span>
          <span className="text-[0.6875rem] leading-4 text-text-secondary">
            {withoutShare === null
              ? 'Fora da distribuição entre as UFs.'
              : `${formatPercent(withoutShare, 0)} do total de ${formatInt(grandTotal)}, fora da distribuição entre as UFs.`}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-secondary">
          <span className="text-text-muted">Leads por UF, em quintis</span>
          {CLASS_COLORS.map((color, index) => (
            <span className="flex items-center gap-2" key={`class-${String(index)}`}>
              <span className={cn('h-3 w-5 shrink-0', TILE_RADIUS)} style={{ backgroundColor: color }} />
              <span className="tabular-nums">{classLabels[index]}</span>
            </span>
          ))}
          <span className="flex items-center gap-2">
            <span className={cn('h-3 w-5 shrink-0 border-[1.5px] border-text-muted', TILE_RADIUS)} />
            <span className="tabular-nums">{`${formatInt(0)}, medido`}</span>
          </span>
          <span className="flex items-center gap-2">
            <span
              className={cn('h-3 w-5 shrink-0 border-[1.5px] border-dashed border-text-muted', TILE_RADIUS)}
              style={{ backgroundImage: HATCH }}
            />
            <span>sem dado</span>
          </span>
        </div>
      </div>
    </figure>
  );
}
