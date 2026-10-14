import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyClosing } from './data';

/** Coluna fantasma: forecast largo em contorno atrás do fechado, estreito e sólido, na frente. */
export interface ClosingVsForecastProps {
  readonly data?: readonly MonthlyClosing[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas largo (não o preset card): medido no preview, o par de rótulos empilhados de cada mês
 * (forecast em cima, fechado embaixo, este último alongado pelo sufixo "· NN%" nos meses fora da
 * faixa) chega a de 100 a 105 px de largura de tinta; no passo de 84,3 px que o corpo do card
 * daria para 6 meses (ESP-6), o rótulo de um mês invade o do vizinho, que foi o que a medição no
 * preview.svg mostrou e a v1 do modelo já tinha reprovado em outra rodada. Largo dá corpo
 * estimado ≈ 894 × 274 px; passo ≈ (894 − 56 eixo − 12 margem) / 6 ≈ 137,7 px, folga de cerca de
 * 17 px de cada lado do rótulo mais largo (notes documenta o desvio do preset sugerido).
 * Eixo de valor 56 px (rótulo "R$ 700 mil" numa linha só). Margem de topo maior para as duas
 * linhas de rótulo empilhadas.
 */
const MARGIN = { top: 36, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 56;
const BAR_CATEGORY_GAP = '26%';
/** ESP-6: passo ≈ 826 / 6 ≈ 137,7; espessura do fantasma ≈ 137,7 × (1 − 2 × 0,26) ≈ 66,1 px,
 * acima do teto de 24 px em cartão (ESP-2): o teto vence. */
const GHOST_MAX = 24;
const CLOSED_RATIO = 0.6;
const LABEL_GAP = 8;
const TICK_COUNT = 4;
const OFF_TARGET_LOW = 0.9;
const OFF_TARGET_HIGH = 1.1;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface ShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: MonthlyClosing;
}

function niceCeiling(max: number, step: number): number {
  return Math.ceil(max / step) * step;
}

export default function ClosingVsForecast({ data = defaultData, height, className }: ClosingVsForecastProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [...data];
  const ceiling = niceCeiling(Math.max(...rows.map((row) => Math.max(row.forecast, row.closed))), 100_000);
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (ceiling / TICK_COUNT) * i);

  const offTarget = rows
    .map((row) => ({ month: row.month, ratio: row.closed / row.forecast }))
    .filter((row) => row.ratio < OFF_TARGET_LOW || row.ratio > OFF_TARGET_HIGH);
  const bias = rows.reduce((sum, row) => sum + (row.closed - row.forecast) / row.forecast, 0) / rows.length;
  const biasText = `${bias >= 0 ? '+' : '−'}${formatPercent(Math.abs(bias))}`;

  const summary = [
    `Gráfico de colunas com o fechamento contra o forecast em ${formatInt(rows.length)} meses, forecast em contorno atrás do fechado sólido.`,
    `Viés médio ${biasText}.`,
    offTarget.length > 0
      ? `Fora da faixa de 90% a 110%: ${offTarget.map((row) => `${formatMonthShort(row.month)} (${String(Math.round(row.ratio * 100))}%)`).join(', ')}.`
      : 'Nenhum mês fora da faixa de 90% a 110%.',
  ].join(' ');

  const renderColumn = ({ x = 0, y = 0, width = 0, height: barHeight = 0, payload }: ShapeProps): ReactElement | null => {
    if (!payload) return null;
    const { forecast, closed } = payload;
    const closedHeight = forecast > 0 ? (barHeight * closed) / forecast : 0;
    const closedWidth = width * CLOSED_RATIO;
    const closedX = x + (width - closedWidth) / 2;
    const closedY = y + barHeight - closedHeight;
    const ratio = forecast > 0 ? closed / forecast : 0;
    const offRange = ratio < OFF_TARGET_LOW || ratio > OFF_TARGET_HIGH;
    const semantic = ratio > OFF_TARGET_HIGH ? 'var(--positive)' : ratio < OFF_TARGET_LOW ? 'var(--negative)' : 'var(--text-primary)';
    /** As duas linhas de rótulo sempre ficam acima do mais alto dos dois retângulos, nunca dentro da marca estreita do fechado. */
    const outerTop = Math.min(y, closedY);
    return (
      <g>
        <rect fill="none" height={barHeight} rx={3} stroke="var(--line-strong)" strokeWidth={1.5} width={width} x={x} y={y} />
        <rect fill="var(--chart-1)" height={Math.max(closedHeight, 0)} rx={3} width={closedWidth} x={closedX} y={Math.min(closedY, y + barHeight)} />
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={x + width / 2} y={outerTop - LABEL_GAP - 14}>
          {formatCurrencyCompact(forecast)}
        </text>
        <text className="font-display" fill={semantic} fontSize={12} fontWeight={600} style={HALO} textAnchor="middle" x={x + width / 2} y={outerTop - LABEL_GAP}>
          {formatCurrencyCompact(closed)}
          {offRange ? ` · ${String(Math.round(ratio * 100))}%` : ''}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-[2px]" style={{ border: '1px solid var(--line-strong)' }} />
          forecast
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-[2px] bg-chart-1" />
          fechado
        </span>
        <span className="ml-auto">
          viés médio <span className="kpi-number font-medium text-text-primary">{biasText}</span>
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, ceiling]} tickFormatter={formatCurrencyAxis} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Bar dataKey="forecast" isAnimationActive={animate} maxBarSize={GHOST_MAX} shape={renderColumn} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
