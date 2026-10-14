import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, GRID_COLUMNS, GRID_ROWS, UF_GRID, type UfLeads } from './data';

/**
 * Tile grid map por UF: cada UF é um tile do mesmo tamanho numa grade que lembra o mapa do Brasil,
 * com a sigla e a taxa de qualificação escritas dentro. O peso visual é igual para as 27 UFs, o que
 * tira o viés de área do coroplético. A cor é só apoio de varredura: o número está em todo tile.
 */
export interface QualificationTileGridProps {
  readonly data?: readonly UfLeads[];
  readonly height?: number;
  readonly className?: string;
}

const CLASS_COUNT = 5;
/** Abaixo deste volume a taxa é escrita, mas o tile ganha contorno pontilhado: o número está, a confiança não. */
const THIN_SAMPLE = 50;
const TILE_RADIUS = 'rounded-[4px]';

/**
 * Cinco classes na rampa sequencial, pulando --seq-4 e --seq-5: nenhum dos dois textos disponíveis
 * alcança 4,5:1 contra eles nos dois temas (TOK-2). É a mesma escala da matriz categórica do 15/02.
 */
const CLASS_COLORS = [
  CHART_SEQUENTIAL_COLORS[0],
  CHART_SEQUENTIAL_COLORS[1],
  CHART_SEQUENTIAL_COLORS[2],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
/** As 3 classes baixas leem com o texto do cartão; as 2 altas, com o texto sobre acento (ROT-6). */
const CLASS_TEXT = [
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--text-primary)',
  'var(--accent-cyan-contrast)',
  'var(--accent-cyan-contrast)',
] as const;

/** Taxa de qualificação. UF sem lead recebido é ausência, nunca taxa zero. */
function rateOf(entry: UfLeads): number | null {
  if (entry.leads <= 0) return null;
  return entry.qualified / entry.leads;
}

/**
 * Quebras de intervalo igual em pontos percentuais inteiros, do piso da menor taxa ao teto da maior.
 * O passo é arredondado para cima, então o último limite pode passar um pouco da maior taxa.
 */
function buildEdges(rates: readonly number[]): readonly number[] | null {
  if (rates.length === 0) return null;
  const lowPct = Math.floor(Math.min(...rates) * 100);
  const highPct = Math.ceil(Math.max(...rates) * 100);
  const stepPct = Math.max(1, Math.ceil((highPct - lowPct) / CLASS_COUNT));
  return Array.from({ length: CLASS_COUNT + 1 }, (_, index) => (lowPct + index * stepPct) / 100);
}

/** Classe de 0 a 4: cada limite inferior inclui o valor, e a última classe fecha em cima. */
function classOf(rate: number, edges: readonly number[]): number {
  let bucket = 0;
  for (let index = 1; index < CLASS_COUNT; index += 1) {
    const edge = edges[index];
    if (edge !== undefined && rate >= edge) bucket = index;
  }
  return bucket;
}

export default function QualificationTileGrid({ data = defaultData, height, className }: QualificationTileGridProps) {
  const rated = data.flatMap((entry) => {
    const rate = rateOf(entry);
    return rate === null ? [] : [{ entry, rate }];
  });
  const edges = buildEdges(rated.map((item) => item.rate));

  if (edges === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com lead recebido neste recorte: o mapa não tem o que colorir.</span>
      </div>
    );
  }

  let top = rated[0];
  let bottom = rated[0];
  for (const item of rated) {
    if (top === undefined || item.rate > top.rate) top = item;
    if (bottom === undefined || item.rate < bottom.rate) bottom = item;
  }
  const summary =
    top && bottom
      ? `Mapa de tiles com a taxa de qualificação de leads em ${formatInt(data.length)} UFs, com peso igual para cada uma. ` +
        `Lidera ${top.entry.uf}, com ${formatPercent(top.rate, 1)}; a menor é ${bottom.entry.uf}, com ${formatPercent(bottom.rate, 1)}, ` +
        `${formatDecimal((top.rate - bottom.rate) * 100, 1)} p.p. abaixo.`
      : 'Mapa de tiles de qualificação sem UF para comparar.';

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
          const rate = rateOf(entry);
          const bucket = rate === null ? 0 : classOf(rate, edges);
          const isThin = entry.leads < THIN_SAMPLE;
          return (
            <div
              className={cn(
                'flex min-h-0 min-w-0 flex-col items-center justify-center gap-0.5 border-[1.5px] leading-none',
                TILE_RADIUS,
                isThin ? 'border-dashed border-text-muted' : 'border-transparent',
              )}
              key={entry.uf}
              style={{
                gridColumn: position.column,
                gridRow: position.row,
                ...(rate === null ? {} : { backgroundColor: CLASS_COLORS[bucket], color: CLASS_TEXT[bucket] }),
              }}
              title={`${entry.name}: ${rate === null ? formatUnavailable() : formatRateWithVolume(entry.qualified, entry.leads)}`}
            >
              <span className={cn('text-xs font-semibold', rate === null && 'text-text-muted')}>{entry.uf}</span>
              {rate === null ? null : <span className="font-display text-[0.6875rem] tabular-nums">{formatPercent(rate, 1)}</span>}
            </div>
          );
        })}
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-1 text-[0.6875rem] leading-4 text-text-muted">
        <div className="flex items-start gap-1">
          {CLASS_COLORS.map((color, index) => (
            <div className="flex min-w-0 flex-1 flex-col gap-1" key={`class-${String(index)}`}>
              <span className="h-2 rounded-[2px]" style={{ backgroundColor: color }} />
              <span className="tabular-nums text-text-secondary">
                {`${formatPercent(edges[index] ?? 0, 0)} a ${formatPercent(edges[index + 1] ?? 0, 0)}`}
              </span>
            </div>
          ))}
        </div>
        <span>{`Leads qualificados sobre recebidos. Contorno pontilhado: menos de ${formatInt(THIN_SAMPLE)} leads.`}</span>
      </div>
    </figure>
  );
}
