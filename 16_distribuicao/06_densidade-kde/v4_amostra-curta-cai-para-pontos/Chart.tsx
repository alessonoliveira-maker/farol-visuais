import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatCurrencyAxis, formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SegmentTickets } from './data';

/**
 * Densidade que recusa amostra curta. Com 30 negócios ou mais o grupo ganha curva; de 5 a 29, a
 * curva inventaria forma, e o grupo vira pontos individuais na mesma régua; abaixo de 5, nem
 * pontos: só os valores escritos. A régua de reais é uma só para todos, e a banda das curvas é a
 * mesma, de modo que a curva grande e o ponto solto se leem na mesma escala.
 */
export interface ShortSampleDensityProps {
  readonly data?: readonly SegmentTickets[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 574;
const NAME_X = 0;
const COUNT_X = 98;
const PLOT_X = 110;
const PLOT_W = 424;
const GRID_SIZE = 120;
/** Piso da curva: abaixo de 30 observações a forma é inventada. */
const MIN_CURVE_SAMPLE = 30;
/** Piso do ponto: abaixo de 5 observações nem a nuvem de pontos diz nada além dos valores. */
const MIN_POINT_SAMPLE = 5;
const MIN_SAMPLE = 2;
const CURVE_H = 38;
const POINT_H = 24;
const TEXT_H = 18;
const ROW_GAP = 4;
const AXIS_H = 20;
const DOT_R = 3;
const CURVE_FILL_OPACITY = 0.18;
const X_TICK_TARGET = 5;

type Kind = 'curve' | 'points' | 'text';

interface Row {
  readonly item: SegmentTickets;
  readonly kind: Kind;
}

function kindOf(count: number): Kind {
  if (count >= MIN_CURVE_SAMPLE) return 'curve';
  return count >= MIN_POINT_SAMPLE ? 'points' : 'text';
}

function rowHeight(kind: Kind): number {
  return kind === 'curve' ? CURVE_H : kind === 'points' ? POINT_H : TEXT_H;
}

/** Quantil por interpolação linear, ou `null` quando não há amostra. */
function quantile(sorted: readonly number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const position = (sorted.length - 1) * p;
  const lower = Math.floor(position);
  const low = sorted[lower] ?? 0;
  const high = sorted[Math.min(lower + 1, sorted.length - 1)] ?? low;
  return low + (high - low) * (position - lower);
}

/** Banda de Silverman sobre a amostra reunida dos grupos que ganham curva. */
function silverman(values: readonly number[]): number | null {
  if (values.length < MIN_SAMPLE) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const deviation = Math.sqrt(sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (sorted.length - 1));
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqrSpread = q1 === null || q3 === null ? 0 : (q3 - q1) / 1.34;
  const spread = iqrSpread > 0 ? Math.min(deviation, iqrSpread) : deviation;
  return spread > 0 ? 0.9 * spread * sorted.length ** -0.2 : null;
}

function kernel(values: readonly number[], x: number, bandwidth: number): number {
  const sum = values.reduce((total, value) => total + Math.exp(-0.5 * ((x - value) / bandwidth) ** 2), 0);
  return sum / (values.length * bandwidth * Math.sqrt(2 * Math.PI));
}

/** Passo de 1, 2 ou 5 vezes a potência de 10, para tiques em intervalo redondo. */
function niceStep(range: number): number {
  const rough = range / X_TICK_TARGET;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  return (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;
}

export default function ShortSampleDensity({ data = defaultData, height, className }: ShortSampleDensityProps) {
  const style = height === undefined ? undefined : { height };
  const rows: Row[] = data.filter((item) => item.values.length > 0).map((item) => ({ item, kind: kindOf(item.values.length) }));
  const allValues = rows.flatMap((row) => [...row.item.values]);
  const curveValues = rows.filter((row) => row.kind === 'curve').flatMap((row) => [...row.item.values]);
  const bandwidth = silverman(curveValues);

  if (rows.length === 0 || allValues.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum negócio ganho neste recorte: sem amostra não há valor para desenhar.</span>
      </div>
    );
  }

  const step = niceStep(Math.max(...allValues));
  const domainMax = Math.ceil(Math.max(...allValues) / step) * step;
  const px = (value: number): number => PLOT_X + (value / domainMax) * PLOT_W;
  const ticks = Array.from({ length: Math.round(domainMax / step) + 1 }, (_, index) => index * step);

  /** Altura de densidade comum a todas as curvas: cada uma tem área 1, então as alturas se comparam. */
  const curves = rows.flatMap((row) => {
    if (row.kind !== 'curve' || bandwidth === null || row.item.values.length === 0) return [];
    const low = Math.max(0, Math.min(...row.item.values));
    const high = Math.max(...row.item.values);
    const grid = Array.from({ length: GRID_SIZE }, (_, index) => {
      const x = low + ((high - low) * index) / (GRID_SIZE - 1);
      return { x, density: kernel(row.item.values, x, bandwidth) };
    });
    return [{ id: row.item.id, grid }];
  });
  const topDensity = Math.max(0, ...curves.flatMap((curve) => curve.grid.map((point) => point.density)));

  const curveRows = rows.filter((row) => row.kind === 'curve');
  const pointRows = rows.filter((row) => row.kind === 'points');
  const textRows = rows.filter((row) => row.kind === 'text');
  const countsText = (list: readonly Row[]): string => list.map((row) => `n ${formatInt(row.item.values.length)}`).join(' e ');
  const reading = `${formatInt(curveRows.length)} de ${formatInt(rows.length)} grupos têm amostra para curva; os outros ${formatInt(pointRows.length + textRows.length)} ficam em pontos ou em valores.`;
  const summary =
    `Densidade do ticket de ${formatInt(allValues.length)} negócios ganhos em ${formatInt(rows.length)} segmentos, na mesma régua em reais. ` +
    `${formatInt(curveRows.length)} grupos têm curva, ${formatInt(pointRows.length)} aparecem em pontos individuais e ${formatInt(textRows.length)} só em valores.`;

  /** Topo de cada linha: soma das alturas das anteriores, cada uma com o seu vão. */
  const tops = rows.map((_, index) =>
    rows.slice(0, index).reduce((acc, previous) => acc + rowHeight(previous.kind) + ROW_GAP, 0),
  );
  const bodyH = rows.reduce((acc, row) => acc + rowHeight(row.kind) + ROW_GAP, 0);
  const viewH = bodyH + AXIS_H;

  const renderRow = (row: Row, index: number): ReactElement => {
    const top = tops[index] ?? 0;
    const h = rowHeight(row.kind);
    const base = top + h - 2;
    const mid = top + h / 2;
    const sorted = [...row.item.values].sort((a, b) => a - b);
    const curve = curves.find((entry) => entry.id === row.item.id);
    let mark: ReactElement | null = null;

    if (row.kind === 'curve' && curve !== undefined && topDensity > 0) {
      const points = curve.grid.map((point) => `${px(point.x).toFixed(2)} ${(base - (point.density / topDensity) * (h - 6)).toFixed(2)}`);
      const first = curve.grid[0];
      const last = curve.grid[curve.grid.length - 1];
      const line = `M ${points.join(' L ')}`;
      mark = (
        <>
          {/* check-ok: OPACIDADE-MARCA o contorno de 2 px é opaco e carrega a marca; o preenchimento de 0,18 só apoia a área, como em 05_areas/01_area-simples/v1 */}
          <path d={`${line} L ${px(last?.x ?? 0).toFixed(2)} ${String(base)} L ${px(first?.x ?? 0).toFixed(2)} ${String(base)} Z`} fill="var(--chart-1)" fillOpacity={CURVE_FILL_OPACITY} />
          <path d={line} fill="none" stroke="var(--chart-1)" strokeLinejoin="round" strokeWidth={2} />
        </>
      );
    } else if (row.kind === 'points') {
      /** Pontos que colidem sobem para a faixa seguinte, dentro da altura da linha: nenhum fica escondido. */
      const laneEnds: number[] = [];
      const lanes = sorted.map((value) => {
        const x = px(value);
        const free = laneEnds.findIndex((end) => x - end >= DOT_R * 2 + 1);
        const lane = free === -1 ? laneEnds.length : free;
        laneEnds[lane] = x;
        return lane;
      });
      const laneCount = Math.max(1, laneEnds.length);
      const laneStep = laneCount > 1 ? Math.min(DOT_R * 2 + 1, (h - DOT_R * 2 - 2) / (laneCount - 1)) : 0;
      mark = (
        <>
          {sorted.map((value, pointIndex) => (
            <circle
              cx={px(value)}
              cy={mid + ((lanes[pointIndex] ?? 0) - (laneCount - 1) / 2) * laneStep}
              fill="var(--chart-1)"
              key={`${String(pointIndex)}-${String(value)}`}
              r={DOT_R}
              stroke="var(--surface-raised)"
              strokeWidth={1}
            />
          ))}
        </>
      );
    } else if (row.kind === 'text') {
      mark = (
        <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} x={PLOT_X} y={mid}>
          {sorted.map((value) => formatCurrencyCompact(value)).join(', ')}
        </text>
      );
    }

    return (
      <g key={row.item.id}>
        <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} x={NAME_X} y={mid}>
          {row.item.name}
        </text>
        <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={COUNT_X} y={mid}>
          {`n ${formatInt(row.item.values.length)}`}
        </text>
        {row.kind === 'text' ? null : (
          <line stroke="var(--line-subtle)" strokeWidth={1} x1={PLOT_X} x2={PLOT_X + PLOT_W} y1={base} y2={base} />
        )}
        {mark}
      </g>
    );
  };

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      <p aria-hidden className="m-0 shrink-0 text-xs font-medium text-text-secondary">
        {reading}
      </p>

      <svg
        aria-hidden
        className="min-h-0 w-full flex-1"
        preserveAspectRatio="xMidYMin meet"
        viewBox={`0 0 ${String(VIEW_W)} ${String(viewH)}`}
      >
        {rows.map(renderRow)}
        <line stroke="var(--line-strong)" strokeWidth={1} x1={PLOT_X} x2={PLOT_X + PLOT_W} y1={bodyH} y2={bodyH} />
        {ticks.map((tick) => (
          <text className="font-display" fill="var(--text-muted)" fontSize={11} key={tick} textAnchor="middle" x={px(tick)} y={bodyH + 15}>
            {formatCurrencyAxis(tick)}
          </text>
        ))}
      </svg>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        {bandwidth === null || curveRows.length === 0 ? null : (
          <span className="tabular-nums">{`curvas: banda comum ${formatCurrencyCompact(bandwidth)}`}</span>
        )}
        {pointRows.length === 0 ? null : (
          <span className="tabular-nums">{`${countsText(pointRows)}: pontos individuais, sem curva`}</span>
        )}
        {textRows.length === 0 ? null : <span className="tabular-nums">{`${countsText(textRows)}: só os valores`}</span>}
      </div>
    </figure>
  );
}
