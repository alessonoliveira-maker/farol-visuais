import { Check, Filter } from 'lucide-react';

import { formatCurrencyCompact, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, GRID_COLUMNS, GRID_ROWS, UF_GRID, type UfRevenue } from './data';

/**
 * Símbolos proporcionais em grade: cada UF é uma célula de 8 por 6 com um círculo centrado, e a grade
 * invisível garante que nenhum círculo invade o vizinho. A meta é o círculo vazado tracejado e o
 * realizado é o cheio, os dois na mesma escala de área; quem bateu a meta leva o visto e o percentual.
 */
export interface GridBubblesProps {
  readonly data?: readonly UfRevenue[];
  readonly height?: number;
  readonly className?: string;
}

const CELL_W = 70;
const CELL_H = 63;
/** Raio do maior círculo (entre meta e realizado de todas as UFs). O diâmetro de 36 px deixa 34 px de vão na célula de 70. */
const R_MAX = 18;
const CIRCLE_Y = 21;
const ABBR_Y = 48;
const NOTE_Y = 62;
const ICON_SIZE = 11;
const GRID_W = GRID_COLUMNS * CELL_W;
const GRID_H = GRID_ROWS * CELL_H;
/** Referências redondas da legenda de tamanho; o último degrau é o máximo observado (ROT-5b). */
const LEGEND_REFERENCES = [1_000_000] as const;

/** Raio de um círculo cuja área é proporcional ao valor. O chamador garante `max` positivo. */
function radiusOf(value: number, max: number): number {
  return R_MAX * Math.sqrt(value / max);
}

/** Realizado sobre meta, ou null quando falta o realizado ou a meta não é positiva. Nunca 0. */
function attainment(row: UfRevenue): number | null {
  if (row.achieved === null || row.target <= 0) return null;
  return row.achieved / row.target;
}

/** Maior valor entre meta e realizado de todas as linhas, ou null se a lista é vazia. */
function maxValue(rows: readonly UfRevenue[]): number | null {
  let max: number | null = null;
  for (const row of rows) {
    const top = Math.max(row.target, row.achieved ?? 0);
    if (max === null || top > max) max = top;
  }
  return max;
}

export default function GridBubbles({ data = defaultData, height, className }: GridBubblesProps) {
  const style = height === undefined ? undefined : { height };
  const max = maxValue(data);

  if (max === null || max <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma UF com meta neste recorte: a grade não tem círculo para comparar.</span>
      </div>
    );
  }

  const rows = data.map((row) => ({ row, ratio: attainment(row) }));
  const hit = rows.filter((item) => item.ratio !== null && item.ratio >= 1);
  const missing = rows.filter((item) => item.ratio === null);
  let best: (typeof rows)[number] | undefined;
  for (const item of hit) {
    if (best === undefined || (item.ratio ?? 0) > (best.ratio ?? 0)) best = item;
  }
  const legendValues = [...LEGEND_REFERENCES.filter((value) => value < max), max];
  const legendBox = Math.ceil(2 * R_MAX) + 2;

  const summary =
    `Mapa de bolhas em grade com a receita realizada contra a meta de ${formatInt(data.length)} UFs. ` +
    `${formatInt(hit.length)} bateram a meta` +
    (best?.row.achieved !== undefined && best.row.achieved !== null
      ? `, com a maior marca em ${best.row.name}: ${formatCurrencyCompact(best.row.achieved)} contra ${formatCurrencyCompact(best.row.target)}`
      : '') +
    `. ${formatInt(missing.length)} sem realizado apurado.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col items-center gap-0.5', className)}
      role="figure"
      style={style}
    >
      <svg aria-hidden className="shrink-0" height={GRID_H} viewBox={`0 0 ${String(GRID_W)} ${String(GRID_H)}`} width={GRID_W}>
        {rows.map(({ row, ratio }) => {
          const position = UF_GRID[row.uf];
          const cx = (position.column - 1) * CELL_W + CELL_W / 2;
          const top = (position.row - 1) * CELL_H;
          const cy = top + CIRCLE_Y;
          const reachedRatio = ratio !== null && ratio >= 1 ? ratio : null;
          const targetR = radiusOf(row.target, max);
          const title =
            row.achieved === null
              ? `${row.name}: meta ${formatCurrencyCompact(row.target)}, realizado ${formatUnavailable()}`
              : `${row.name}: realizado ${formatCurrencyCompact(row.achieved)} contra meta ${formatCurrencyCompact(row.target)}`;
          return (
            <g key={row.uf}>
              <title>{title}</title>
              {/* O anel da meta vai ANTES do cheio e sempre em --text-secondary: o cheio nunca perde área para o traço (GEO-16). Meta batida cabe dentro do cheio e não ganha anel (a borda de 1,5 px vazaria como engrenagem); o visto com o percentual diz isso. */}
              {reachedRatio === null ? (
                <circle cx={cx} cy={cy} fill="none" r={targetR} stroke="var(--text-secondary)" strokeDasharray="3 2" strokeWidth={1.5} />
              ) : null}
              {row.achieved === null ? null : <circle cx={cx} cy={cy} fill="var(--chart-1)" r={radiusOf(row.achieved, max)} />}
              <text fill="var(--text-secondary)" fontSize={11} fontWeight={600} textAnchor="middle" x={cx} y={top + ABBR_Y}>
                {row.uf}
              </text>
              {row.achieved === null ? (
                <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={top + NOTE_Y}>
                  {formatUnavailable()}
                </text>
              ) : null}
              {reachedRatio !== null ? (
                <g>
                  <Check aria-hidden height={ICON_SIZE} stroke="var(--positive)" strokeWidth={3} width={ICON_SIZE} x={cx - 21} y={top + NOTE_Y - 10} />
                  <text className="font-display tabular-nums" fill="var(--positive)" fontSize={11} fontWeight={600} x={cx - 8} y={top + NOTE_Y}>
                    {formatPercent(reachedRatio, 0)}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div aria-hidden className="flex w-full shrink-0 flex-col gap-1 text-[0.6875rem] leading-4 text-text-muted">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5">
            <svg className="shrink-0" height={12} width={12}>
              <circle cx={6} cy={6} fill="var(--chart-1)" r={5} />
            </svg>
            <span className="text-text-secondary">Realizado</span>
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="shrink-0" height={12} width={12}>
              <circle cx={6} cy={6} fill="none" r={5} stroke="var(--text-secondary)" strokeDasharray="3 2" strokeWidth={1.5} />
            </svg>
            <span className="text-text-secondary">Meta (sem anel se batida)</span>
          </span>
          <span className="flex items-center gap-1.5 text-positive">
            <Check aria-hidden className="size-3 shrink-0" strokeWidth={3} />
            <span>{`Bateu: visto e % (${formatInt(hit.length)} de ${formatInt(data.length)})`}</span>
          </span>
          <span className="flex items-end gap-3">
            <span>Área</span>
            {legendValues.map((value) => {
              const r = radiusOf(value, max);
              return (
                <span className="flex items-end gap-1" key={value}>
                  <svg height={legendBox} width={Math.ceil(2 * r) + 2}>
                    <circle cx={r + 1} cy={legendBox - r - 1} fill="var(--chart-1)" r={r} />
                  </svg>
                  <span className="font-display tabular-nums text-text-secondary">{formatCurrencyCompact(value)}</span>
                </span>
              );
            })}
          </span>
        </div>
      </div>
    </figure>
  );
}
