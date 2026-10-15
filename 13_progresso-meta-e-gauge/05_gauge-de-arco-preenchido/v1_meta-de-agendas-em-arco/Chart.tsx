import type { ReactElement } from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, useChartHeight, useChartWidth } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthLong, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyArcGoal } from './data';

/**
 * Gauge sem ponteiro: um arco de 240 graus cresce sobre um arco de fundo completo até a meta, que
 * é o próprio fim da escala. O PolarAngleAxis numérico com domain explícito é obrigatório; sem ele
 * o RadialBarChart normaliza a maior barra do conjunto e o valor vira arco cheio em silêncio.
 * Mínimo e máximo ficam escritos nas pontas, e a origem da meta é dita por extenso abaixo do arco:
 * sem essa frase o número no fim da escala não significa nada além de "cheio".
 */
export interface MonthlyGoalArcProps {
  readonly data?: MonthlyArcGoal;
  readonly height?: number;
  readonly className?: string;
}

const ARC_START = 210;
const ARC_END = -30;
const CY_FRACTION = 0.6;
const OUTER_RADIUS = '96%';
const INNER_RADIUS = '58%';
const TIP_CORNER_RADIUS = 9;
/** Abaixo desta varredura em graus a ponta arredondada mentiria dado quase inexistente; kit zera. */
const MIN_SWEEP_DEG = 6;
const END_LABEL_RADIUS_FACTOR = 1.1;

/** Mesma trigonometria que o RadialBarChart usa por dentro (polarToCartesian do Recharts). */
function polarPoint(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (-angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

interface EndLabelsProps {
  readonly min: number;
  readonly max: number;
}

/** Mínimo e máximo do domínio, escritos nas duas pontas do arco. */
function EndLabels({ min, max }: EndLabelsProps): ReactElement | null {
  const width = useChartWidth() ?? 0;
  const height = useChartHeight() ?? 0;
  const maxRadius = Math.min(width, height) / 2;
  if (maxRadius <= 0) return null;
  const cx = width / 2;
  const cy = height * CY_FRACTION;
  const r = maxRadius * END_LABEL_RADIUS_FACTOR;
  const start = polarPoint(cx, cy, r, ARC_START);
  const end = polarPoint(cx, cy, r, ARC_END);
  return (
    <g aria-hidden className="font-display" fill="var(--text-muted)" fontSize={11}>
      <text textAnchor="middle" x={start.x} y={start.y}>
        {formatInt(min)}
      </text>
      <text textAnchor="middle" x={end.x} y={end.y}>
        {formatInt(max)}
      </text>
    </g>
  );
}

interface CenterLabelProps {
  readonly value: number;
  readonly target: number;
}

/** Número grande centrado no arco, filho do gráfico para herdar o contexto polar. */
function CenterLabel({ value, target }: CenterLabelProps): ReactElement | null {
  const width = useChartWidth() ?? 0;
  const height = useChartHeight() ?? 0;
  if (width <= 0 || height <= 0) return null;
  const cx = width / 2;
  const cy = height * CY_FRACTION;
  /** Tinta a mais de 4 px da borda interna da banda (raio ~28% da altura); três algarismos descem de corpo. */
  const valueSize = formatInt(value).length > 2 ? 20 : 26;
  return (
    <g aria-hidden>
      <text className="font-display" fill="var(--text-primary)" fontSize={valueSize} fontWeight={600} textAnchor="middle" x={cx} y={cy - 1}>
        {formatInt(value)}
      </text>
      <text className="font-sans" fill="var(--text-muted)" fontSize={12} textAnchor="middle" x={cx} y={cy + 16}>
        de {formatInt(target)}
      </text>
    </g>
  );
}

export default function MonthlyGoalArc({ data = defaultData, height, className }: MonthlyGoalArcProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const { label, period, value, target, targetSource } = data;
  const ratio = target > 0 ? Math.min(1, value / target) : 0;
  const sweepDeg = ratio * (ARC_START - ARC_END);
  const cornerRadius = sweepDeg < MIN_SWEEP_DEG ? 0 : TIP_CORNER_RADIUS;
  const missing = Math.max(0, target - value);

  const summary = `Gauge de arco com ${label.toLowerCase()} em ${formatMonthLong(period)}: ${formatInt(value)} de ${formatInt(target)}, ${formatPercent(ratio)} da meta. Faltam ${formatInt(missing)} para completar. A meta de ${formatInt(target)} foi ${targetSource}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {label}, <span className="font-display font-semibold text-text-primary">{formatPercent(ratio)}</span> da meta de{' '}
        {formatMonthLong(period)}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadialBarChart
            cy={`${String(CY_FRACTION * 100)}%`}
            data={[{ value }]}
            endAngle={ARC_END}
            innerRadius={INNER_RADIUS}
            outerRadius={OUTER_RADIUS}
            startAngle={ARC_START}
          >
            <PolarAngleAxis domain={[0, target]} tick={false} type="number" />
            <EndLabels max={target} min={0} />
            <RadialBar
              background={{ fill: 'var(--surface-sunken)' }}
              cornerRadius={cornerRadius}
              dataKey="value"
              fill="var(--chart-1)"
              isAnimationActive={animate}
            />
            <CenterLabel target={target} value={value} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-1 shrink-0 truncate text-center text-[0.6875rem] text-text-muted">
        Meta de {formatInt(target)} agendas, {targetSource}.
      </p>
    </div>
  );
}
