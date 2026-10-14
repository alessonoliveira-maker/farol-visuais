import { CircleSlash, Filter, History } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, type BarShapeProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginSeries } from './data';

/**
 * A mesma grade de pequenos múltiplos com dois casos limite: uma origem com histórico curto (os
 * meses antes da entrada ficam sem coluna nenhuma, marcados como sem histórico) e uma origem com
 * todos os meses zerados (a coluna vira um traço mínimo na base, medido e não ausente). Os dois
 * nunca se confundem: mês sem histórico não desenha nada; mês com zero medido desenha a marca.
 */
export interface OriginHistorySmallMultiplesProps {
  readonly data?: readonly OriginSeries[];
  readonly height?: number;
  readonly className?: string;
}

const GRID_COLS = 3;
const BAR_MAX = 22;
const BAR_CATEGORY_GAP = '32%';
const BAR_FILL = 'var(--line-strong)';
const DOMAIN_STEP = 10;
const ZERO_STUB = 2;
const HEADER_H = 34;

interface PlotRow {
  readonly month: string;
  readonly value: number | null;
  readonly plotValue: number;
}

function measuredTotal(row: OriginSeries): number {
  return row.monthly.reduce((sum, point) => sum + (point.value ?? 0), 0);
}

function niceCeil(value: number, step: number): number {
  return Math.max(step, Math.ceil(value / step) * step);
}

/** Primeiro mês medido, ou -1 se a origem não tem nenhum mês medido ainda. */
function firstMeasuredIndex(row: OriginSeries): number {
  return row.monthly.findIndex((point) => point.value !== null);
}

function isAllZero(row: OriginSeries): boolean {
  const measured = row.monthly.filter((point) => point.value !== null);
  return measured.length > 0 && measured.every((point) => point.value === 0);
}

function renderBar({ x, y, width, height: barHeight, payload }: BarShapeProps): ReactElement | null {
  const row = payload as PlotRow | undefined;
  if (!row || row.value === null) return null;
  if (row.value === 0) {
    return <rect fill={BAR_FILL} height={ZERO_STUB} width={Number(width)} x={Number(x)} y={Number(y) - ZERO_STUB} />;
  }
  return <rect fill={BAR_FILL} height={Number(barHeight)} width={Number(width)} x={Number(x)} y={Number(y)} />;
}

export default function OriginHistorySmallMultiples({ data = defaultData, height, className }: OriginHistorySmallMultiplesProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [...data].sort((a, b) => measuredTotal(b) - measuredTotal(a));

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não houve lead com origem atribuída no período.</span>
      </div>
    );
  }

  const maxValue = Math.max(...rows.flatMap((row) => row.monthly.flatMap((point) => (point.value === null ? [] : [point.value]))));
  const domainMax = niceCeil(maxValue, DOMAIN_STEP);
  const rowCount = Math.max(1, Math.ceil(rows.length / GRID_COLS));
  const bottomRowStart = (rowCount - 1) * GRID_COLS;

  const shortHistory = rows.filter((row) => firstMeasuredIndex(row) > 0);
  const noVolume = rows.filter((row) => isAllZero(row));

  const summary = [
    `Pequenos múltiplos de colunas com leads mensais de ${String(rows.length)} origens, na mesma escala, ordenados pelo total medido.`,
    shortHistory.length > 0
      ? `${shortHistory.map((row) => row.name).join(', ')} tem histórico curto, sem mês medido no início da janela.`
      : '',
    noVolume.length > 0 ? `${noVolume.map((row) => row.name).join(', ')} não teve volume medido no período.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-3">
        {rows.map((row, index) => {
          const showAxis = index >= bottomRowStart;
          const startIndex = firstMeasuredIndex(row);
          const firstMonth = row.monthly[startIndex];
          const beforeMonth = startIndex > 0 ? row.monthly[startIndex - 1] : undefined;
          const flatZero = isAllZero(row);
          const plotRows: PlotRow[] = row.monthly.map((point) => ({ ...point, plotValue: point.value ?? 0 }));
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={row.id}>
              <div className="flex shrink-0 flex-col justify-start gap-0.5" style={{ height: HEADER_H }}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{row.name}</p>
                  <p className="kpi-number shrink-0 text-xs font-medium text-text-muted">{formatInt(measuredTotal(row))}</p>
                </div>
                {beforeMonth && firstMonth ? (
                  <p className="flex items-center gap-1 truncate text-[0.6875rem] text-text-muted">
                    <History aria-hidden className="size-2.5 shrink-0" />
                    <span>sem histórico até {formatMonthShort(beforeMonth.month)}</span>
                  </p>
                ) : flatZero ? (
                  <p className="flex items-center gap-1 truncate text-[0.6875rem] text-text-muted">
                    <CircleSlash aria-hidden className="size-2.5 shrink-0" />
                    <span>sem volume no período</span>
                  </p>
                ) : null}
              </div>
              <div className="mt-1 min-h-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart
                    accessibilityLayer={false}
                    barCategoryGap={BAR_CATEGORY_GAP}
                    data={plotRows}
                    margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
                  >
                    <XAxis
                      axisLine={false}
                      dataKey="month"
                      /* EIX-9: nunca `hide`, o Recharts so reserva altura de eixo pros que nao
                         estao escondidos, o que fazia o corpo dos paineis de cima crescer mais que
                         o dos de baixo na mesma escala. O eixo fica sempre presente e so o tique
                         some (`tick={false}`), que zera o texto sem zerar o espaco reservado. */
                      interval={0}
                      tick={showAxis ? { fill: 'var(--text-muted)', fontSize: 11 } : false}
                      tickFormatter={formatMonthShort}
                      tickLine={false}
                      tickMargin={4}
                    />
                    <YAxis allowDecimals={false} domain={[0, domainMax]} hide />
                    {/* Sem dica (DIC-5): mês sem histórico e mês zerado viram o mesmo plotValue 0, e a
                        dica padrão mostraria "0" para os dois. A distinção mora só na marca, nunca na dica. */}
                    <Bar dataKey="plotValue" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
