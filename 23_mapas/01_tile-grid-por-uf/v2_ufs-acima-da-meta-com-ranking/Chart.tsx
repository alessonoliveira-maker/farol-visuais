import { Check, Filter, Unplug } from 'lucide-react';

import { formatInt, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  GRID_COLUMNS,
  GRID_ROWS,
  highlightId as defaultHighlightId,
  QUALIFICATION_TARGET,
  UF_GRID,
  type UfCode,
  type UfLeads,
} from './data';

/**
 * Tile grid map das UFs acima da meta, com o ranking das 10 maiores taxas ao lado. O anel e o visto
 * marcam só as UFs acima da meta; as demais ficam em cinza. A UF em `highlightId` fica acesa nos dois
 * painéis. Abaixo de 560 px o mapa e o ranking se empilham (container query).
 */
export interface TargetTileGridProps {
  readonly data?: readonly UfLeads[];
  readonly target?: number;
  readonly highlightId?: UfCode;
  readonly height?: number;
  readonly className?: string;
}

const RANK_SIZE = 10;
/** Teto do eixo do ranking arredondado para 5 p.p. acima da maior taxa; o eixo sempre parte do zero (EIX-1). */
const SCALE_STEP_PCT = 5;
const ROW_H = 'h-5';
const BAR_H = 'h-3';

interface RatedUf {
  readonly entry: UfLeads;
  readonly rate: number;
}

/** Taxa de qualificação. UF sem lead recebido é ausência, nunca taxa zero. */
function rateOf(entry: UfLeads): number | null {
  if (entry.leads <= 0) return null;
  return entry.qualified / entry.leads;
}

/** Maior taxa primeiro; empate resolvido pelo maior volume, para o corte do ranking não depender da ordem do dado. */
function byRateDesc(a: RatedUf, b: RatedUf): number {
  if (b.rate !== a.rate) return b.rate - a.rate;
  return b.entry.leads - a.entry.leads;
}

export default function TargetTileGrid({
  data = defaultData,
  target = QUALIFICATION_TARGET,
  highlightId = defaultHighlightId,
  height,
  className,
}: TargetTileGridProps) {
  const rated: RatedUf[] = data.flatMap((entry) => {
    const rate = rateOf(entry);
    return rate === null ? [] : [{ entry, rate }];
  });
  const sorted = [...rated].sort(byRateDesc);
  const ranking = sorted.slice(0, RANK_SIZE);
  const top = sorted[0];

  if (top === undefined) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com lead recebido neste recorte: não há taxa para comparar com a meta.</span>
      </div>
    );
  }

  const scaleMax = Math.ceil((Math.max(top.rate, target) * 100) / SCALE_STEP_PCT) * (SCALE_STEP_PCT / 100);
  const aboveCount = rated.filter((item) => item.rate > target).length;
  const unmeasuredCount = data.length - rated.length;
  const highlightPosition = sorted.findIndex((item) => item.entry.uf === highlightId);
  const highlightPhrase =
    highlightPosition === -1
      ? ''
      : ` ${highlightId} está em ${formatInt(highlightPosition + 1)}º de ${formatInt(sorted.length)}.`;
  const summary =
    `Mapa de tiles e ranking das ${formatInt(ranking.length)} maiores taxas de qualificação: ` +
    `${formatInt(aboveCount)} de ${formatInt(rated.length)} UFs medidas passam da meta de ${formatPercent(target, 1)}. ` +
    `Lidera ${top.entry.uf}, com ${formatPercent(top.rate, 1)}.${highlightPhrase}`;

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="m-0 shrink-0 text-xs font-medium leading-4 text-text-secondary">
        {`${formatInt(aboveCount)} de ${formatInt(rated.length)} UFs acima da meta de qualificação de ${formatPercent(target, 1)}`}
      </p>

      <div aria-hidden className="flex min-h-0 flex-1 flex-col gap-4 @[560px]:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div
            className="grid min-h-0 flex-1 gap-1"
            style={{
              gridTemplateColumns: `repeat(${String(GRID_COLUMNS)}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${String(GRID_ROWS)}, minmax(0, 1fr))`,
            }}
          >
            {data.map((entry) => {
              const position = UF_GRID[entry.uf];
              const rate = rateOf(entry);
              const isAbove = rate !== null && rate > target;
              const isHighlight = entry.uf === highlightId;
              return (
                <div
                  className={cn(
                    'flex min-h-0 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[4px] border-2 leading-none',
                    rate === null
                      ? 'border-dashed border-text-muted text-text-secondary'
                      : isHighlight
                        ? 'bg-chart-1'
                        : 'bg-line-strong text-text-primary',
                    rate === null ? '' : isAbove ? 'border-chart-1' : 'border-transparent',
                  )}
                  key={entry.uf}
                  style={{
                    gridColumn: position.column,
                    gridRow: position.row,
                    ...(isHighlight && rate !== null ? { color: 'var(--accent-cyan-contrast)' } : {}),
                  }}
                  title={`${entry.name}: ${rate === null ? formatUnavailable() : formatRateWithVolume(entry.qualified, entry.leads)}`}
                >
                  <span className="flex items-center gap-0.5 text-xs font-semibold">
                    {entry.uf}
                    {isAbove ? <Check aria-hidden className="size-3" strokeWidth={3} /> : null}
                  </span>
                  {rate === null ? (
                    <Unplug aria-hidden className="size-3 text-text-muted" />
                  ) : (
                    <span className="font-display text-[0.6875rem] tabular-nums">{formatPercent(rate, 1)}</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="m-0 shrink-0 text-[0.6875rem] leading-4 text-text-muted">
            Anel e visto: acima da meta. Cinza: na meta ou abaixo.
            {unmeasuredCount > 0
              ? ` Contorno tracejado: ${formatUnavailable()}, sem lead recebido (${formatInt(unmeasuredCount)}).`
              : ''}
          </p>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col @[560px]:w-[42%] @[560px]:shrink-0">
          <div className="relative h-4 shrink-0 text-[0.6875rem] leading-4 text-text-muted">
            <div className="grid h-full grid-cols-[2rem_minmax(0,1fr)_3rem] gap-2">
              <span className="whitespace-nowrap">{`${formatInt(ranking.length)} maiores`}</span>
              <span className="relative">
                <span
                  className="absolute top-0 whitespace-nowrap tabular-nums text-text-secondary"
                  style={{ right: `${String(100 - (target / scaleMax) * 100)}%` }}
                >
                  {`meta ${formatPercent(target, 1)}`}
                </span>
              </span>
            </div>
          </div>
          {ranking.map((item) => {
            const isHighlight = item.entry.uf === highlightId;
            return (
              <div
                className={cn('grid shrink-0 grid-cols-[2rem_minmax(0,1fr)_3rem] items-center gap-2', ROW_H)}
                key={item.entry.uf}
                title={`${item.entry.name}: ${formatRateWithVolume(item.entry.qualified, item.entry.leads)}`}
              >
                <span className={cn('text-xs', isHighlight ? 'font-bold text-text-primary' : 'text-text-secondary')}>{item.entry.uf}</span>
                <span className="relative block h-full">
                  <span
                    className={cn('absolute left-0 top-1/2 -mt-1.5 rounded-r-[2px]', BAR_H, isHighlight ? 'bg-chart-1' : 'bg-line-strong')}
                    style={{ width: `${String((item.rate / scaleMax) * 100)}%` }}
                  />
                  <span
                    className="absolute inset-y-0 w-px bg-text-secondary"
                    style={{ left: `${String((target / scaleMax) * 100)}%` }}
                  />
                </span>
                <span
                  className={cn(
                    'text-right font-display text-xs tabular-nums',
                    isHighlight ? 'font-bold text-text-primary' : 'text-text-secondary',
                  )}
                >
                  {formatPercent(item.rate, 1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
