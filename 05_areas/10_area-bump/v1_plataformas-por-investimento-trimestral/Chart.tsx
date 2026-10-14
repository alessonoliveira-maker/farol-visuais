import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periods as defaultPeriods, type PlatformSeries } from './data';

/**
 * Area bump em SVG puro: a posição vertical é o ranking do período e a espessura da faixa é
 * proporcional ao investimento, na mesma escala em todos os períodos. Leia primeiro a posição
 * (quem lidera); a espessura é a leitura secundária (quanto). As faixas se ligam por curvas
 * cúbicas horizontais, com a coluna de cada período centrada verticalmente porque o total varia
 * de período a período (regra declarada, não calculada por acidente).
 */
export interface PlatformInvestmentBumpProps {
  readonly data?: readonly PlatformSeries[];
  readonly periods?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 894;
const VIEW_H = 282;
/** Margens largas: cabem "1º Marketplace de vídeo" à esquerda e "Marketplace de vídeo R$ 190,0 mil" à direita. */
const MARGIN = { top: 28, right: 232, bottom: 28, left: 172 } as const;
/** Vão entre faixas: maior que o piso da ESP-7.7 para os rótulos de início e fim não colidirem (ROT-9). */
const ROW_GAP = 12;
const MAX_THICKNESS = 28;
const ZERO_THICKNESS = 2;
const STUB_WIDTH = 12;
const RIBBON_STROKE = 'var(--surface-raised)';

interface Band {
  readonly top: number;
  readonly bottom: number;
  readonly value: number;
  readonly rank: number;
}

function rankIds(series: readonly PlatformSeries[], t: number, previous: readonly string[]): string[] {
  const previousRank = new Map(previous.map((id, index) => [id, index]));
  return series
    .filter((s) => (s.values[t] ?? null) !== null)
    .map((s) => ({ id: s.id, value: s.values[t] as number }))
    .sort((a, b) => b.value - a.value || (previousRank.get(a.id) ?? 0) - (previousRank.get(b.id) ?? 0))
    .map((item) => item.id);
}

/** Uma coluna por período: espessura pela escala comum, coluna centrada na altura do corpo. */
function buildColumns(series: readonly PlatformSeries[], periodCount: number, scale: number, bodyTop: number, bodyHeight: number) {
  let previous = series.map((s) => s.id);
  const columns: Map<string, Band>[] = [];
  for (let t = 0; t < periodCount; t += 1) {
    const order = rankIds(series, t, previous);
    if (order.length > 0) previous = order;
    const thickness = order.map((id) => {
      const value = series.find((s) => s.id === id)?.values[t] ?? 0;
      return value === 0 ? ZERO_THICKNESS : Math.max(value, 0) * scale;
    });
    const columnHeight = thickness.reduce((sum, h) => sum + h, 0) + ROW_GAP * Math.max(order.length - 1, 0);
    let y = bodyTop + (bodyHeight - columnHeight) / 2;
    const column = new Map<string, Band>();
    order.forEach((id, rank) => {
      const h = thickness[rank] ?? ZERO_THICKNESS;
      const value = series.find((s) => s.id === id)?.values[t] ?? 0;
      column.set(id, { top: y, bottom: y + h, value, rank });
      y += h + ROW_GAP;
    });
    columns.push(column);
  }
  return columns;
}

function ribbonPath(x0: number, x1: number, a: Band, b: Band): string {
  const mx = (x0 + x1) / 2;
  return `M${x0} ${a.top} C${mx} ${a.top} ${mx} ${b.top} ${x1} ${b.top} L${x1} ${b.bottom} C${mx} ${b.bottom} ${mx} ${a.bottom} ${x0} ${a.bottom} Z`;
}

function stubPath(x: number, band: Band): string {
  return `M${x - STUB_WIDTH / 2} ${band.top} L${x + STUB_WIDTH / 2} ${band.top} L${x + STUB_WIDTH / 2} ${band.bottom} L${x - STUB_WIDTH / 2} ${band.bottom} Z`;
}

export default function PlatformInvestmentBump({
  data = defaultData,
  periods = defaultPeriods,
  height,
  className,
}: PlatformInvestmentBumpProps) {
  const periodCount = Math.min(data.reduce((max, s) => Math.max(max, s.values.length), 0), periods.length);

  if (data.length === 0 || periodCount === 0) {
    return (
      <div
        aria-label="Sem plataformas para desenhar o ranking neste recorte."
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte: não há ranking para desenhar.</span>
      </div>
    );
  }

  const bodyTop = MARGIN.top;
  const bodyHeight = VIEW_H - MARGIN.top - MARGIN.bottom;
  const maxValue = data.reduce((max: number, s) => s.values.reduce((m: number, v) => Math.max(m, v ?? 0), max), 0);
  const scale = maxValue > 0 ? MAX_THICKNESS / maxValue : 0;
  const columns = buildColumns(data, periodCount, scale, bodyTop, bodyHeight);
  const plotWidth = VIEW_W - MARGIN.left - MARGIN.right;
  const xAt = (t: number) => MARGIN.left + (periodCount <= 1 ? 0 : (plotWidth * t) / (periodCount - 1));

  const covered = new Set<string>();
  const ribbons: { id: string; d: string; color: string }[] = [];
  for (let t = 0; t < periodCount - 1; t += 1) {
    for (const series of data) {
      const a = columns[t]?.get(series.id);
      const b = columns[t + 1]?.get(series.id);
      if (!a || !b) continue;
      ribbons.push({ id: series.id, d: ribbonPath(xAt(t), xAt(t + 1), a, b), color: CHART_SERIES_COLORS[series.slot - 1] ?? 'var(--chart-1)' });
      covered.add(`${String(t)}-${series.id}`);
      covered.add(`${String(t + 1)}-${series.id}`);
    }
  }
  const stubs: { id: string; d: string; color: string }[] = [];
  for (let t = 0; t < periodCount; t += 1) {
    for (const series of data) {
      const band = columns[t]?.get(series.id);
      if (!band || covered.has(`${String(t)}-${series.id}`)) continue;
      stubs.push({ id: series.id, d: stubPath(xAt(t), band), color: CHART_SERIES_COLORS[series.slot - 1] ?? 'var(--chart-1)' });
    }
  }

  const first = columns[0];
  const last = columns[periodCount - 1];
  const leaderFirst = data.find((s) => (first?.get(s.id)?.rank ?? -1) === 0);
  const leaderLast = data.find((s) => (last?.get(s.id)?.rank ?? -1) === 0);
  const summary = [
    `Area bump com o investimento trimestral de ${String(data.length)} plataformas fictícias, em ${String(periodCount)} trimestres.`,
    leaderFirst ? `Líder no ${periods[0] ?? '1º período'}: ${leaderFirst.label}.` : '',
    leaderLast ? `Líder no ${periods[periodCount - 1] ?? 'último período'}: ${leaderLast.label}, ${formatCurrencyCompact(last?.get(leaderLast.id)?.value ?? 0)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={height === undefined ? undefined : { height }}>
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {/* Linha de leitura (ANO-5): declara as duas codificações antes de qualquer marca. */}
        <text className="font-sans" fill="var(--text-muted)" fontSize={12} x={MARGIN.left} y={16}>
          Posição vertical é o ranking do trimestre; espessura da faixa é o investimento
        </text>
        {ribbons.map((ribbon, index) => (
          <path d={ribbon.d} fill={ribbon.color} key={`ribbon-${ribbon.id}-${String(index)}`} stroke={RIBBON_STROKE} strokeWidth={1.5} />
        ))}
        {stubs.map((stub, index) => (
          <path d={stub.d} fill={stub.color} key={`stub-${stub.id}-${String(index)}`} stroke={RIBBON_STROKE} strokeWidth={1.5} />
        ))}
        {data.map((series) => {
          const start = first?.get(series.id);
          const end = last?.get(series.id);
          return (
            <g key={`label-${series.id}`}>
              {start ? (
                <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} textAnchor="end" x={MARGIN.left - 10} y={(start.top + start.bottom) / 2}>
                  <tspan className="font-display">{formatInt(start.rank + 1)}º</tspan> {series.label}
                </text>
              ) : null}
              {end ? (
                <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} textAnchor="start" x={VIEW_W - MARGIN.right + 10} y={(end.top + end.bottom) / 2}>
                  {series.label} <tspan className="font-display">{formatCurrencyCompact(end.value)}</tspan>
                </text>
              ) : null}
            </g>
          );
        })}
        {periods.slice(0, periodCount).map((label, index) => (
          <text className="font-sans" dominantBaseline="hanging" fill="var(--text-muted)" fontSize={11} key={`tick-${label}`} textAnchor="middle" x={xAt(index)} y={VIEW_H - MARGIN.bottom + 6}>
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
