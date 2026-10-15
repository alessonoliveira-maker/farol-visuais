import { TrendingUp } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, useChartHeight, useChartWidth } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatMonthLong, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyArcOverGoal } from './data';

/**
 * O mesmo gauge de arco da v1, agora com o realizado passando da meta: o domínio alarga até 1,2
 * vez a meta só para o excedente caber (a meta em si não muda), a meta vira um traço tracejado
 * sobre o próprio arco em vez do fim da escala, e o trecho que passa da meta empilha em cor
 * positiva com o texto do excedente. Sem o domínio alargado o RadialBarChart trava em 100% e o
 * excedente desaparece em silêncio.
 */
export interface MonthlyOverGoalArcProps {
  readonly data?: MonthlyArcOverGoal;
  readonly height?: number;
  readonly className?: string;
}

const ARC_START = 210;
const ARC_END = -30;
const CY_FRACTION = 0.6;
const OUTER_FRACTION = 0.96;
const INNER_FRACTION = 0.64;
const OUTER_RADIUS = `${String(OUTER_FRACTION * 100)}%`;
const INNER_RADIUS = `${String(INNER_FRACTION * 100)}%`;
const TIP_CORNER_RADIUS = 9;
const MIN_SWEEP_DEG = 6;
/** O arco alarga além da meta só para o excedente caber (ver meta.json, notes). */
const DOMAIN_OVER_FACTOR = 1.2;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

function polarPoint(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (-angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

interface MinLabelProps {
  readonly min: number;
}

/** Só o mínimo é escrito na ponta: o fim físico do arco é folga de desenho, não um teto real. */
function MinLabel({ min }: MinLabelProps): ReactElement | null {
  const width = useChartWidth() ?? 0;
  const height = useChartHeight() ?? 0;
  const maxRadius = Math.min(width, height) / 2;
  if (maxRadius <= 0) return null;
  const point = polarPoint(width / 2, height * CY_FRACTION, maxRadius * 1.1, ARC_START);
  return (
    <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={point.x} y={point.y}>
      {formatInt(min)}
    </text>
  );
}

interface MetaTickProps {
  readonly target: number;
  readonly domainMax: number;
}

/** Traço tracejado sobre o próprio arco, na posição real da meta dentro do domínio alargado. */
function MetaTick({ target, domainMax }: MetaTickProps): ReactElement | null {
  const width = useChartWidth() ?? 0;
  const height = useChartHeight() ?? 0;
  const maxRadius = Math.min(width, height) / 2;
  if (maxRadius <= 0 || domainMax <= 0) return null;
  const cx = width / 2;
  const cy = height * CY_FRACTION;
  const outer = maxRadius * OUTER_FRACTION;
  const inner = maxRadius * INNER_FRACTION;
  const angle = ARC_START + (target / domainMax) * (ARC_END - ARC_START);
  const p1 = polarPoint(cx, cy, outer + 5, angle);
  const p2 = polarPoint(cx, cy, inner - 4, angle);
  const label = polarPoint(cx, cy, outer + 20, angle);
  return (
    <g aria-hidden>
      <line stroke="var(--text-muted)" strokeDasharray="3 3" x1={p1.x} x2={p2.x} y1={p1.y} y2={p2.y} />
      <text className="font-display" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={label.x} y={label.y}>
        meta {formatInt(target)}
      </text>
    </g>
  );
}

interface CenterLabelProps {
  readonly value: number;
}

function CenterLabel({ value }: CenterLabelProps): ReactElement | null {
  const width = useChartWidth() ?? 0;
  const height = useChartHeight() ?? 0;
  if (width <= 0 || height <= 0) return null;
  const cx = width / 2;
  const cy = height * CY_FRACTION;
  /** Corpo acompanha o miolo do arco (raio interno ~58% de metade do menor lado), com 4 px de folga. */
  const valueSize = Math.max(14, Math.min(30, Math.min(width, height) * 0.5 * 0.58 * 0.8 - 4));
  return (
    <text className="font-display" fill="var(--text-primary)" fontSize={valueSize} fontWeight={600} textAnchor="middle" x={cx} y={cy + 2}>
      {formatInt(value)}
    </text>
  );
}

export default function MonthlyOverGoalArc({ data = defaultData, height, className }: MonthlyOverGoalArcProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const { label, period, value, target, targetSource } = data;
  const domainMax = target * DOMAIN_OVER_FACTOR;
  const over = value - target;
  const base = Math.min(value, target);
  const excess = Math.max(0, over);
  const sweepDeg = (base / domainMax) * (ARC_START - ARC_END);
  const baseCornerRadius = excess > 0 ? 0 : sweepDeg < MIN_SWEEP_DEG ? 0 : TIP_CORNER_RADIUS;

  const summary = `Gauge de arco com ${label.toLowerCase()} em ${formatMonthLong(period)}: ${formatInt(value)}, contra a meta de ${formatInt(target)}. ${over > 0 ? `Passou a meta em ${formatInt(over)}, ${formatPercent(over / target)} acima.` : 'Ainda não bateu a meta.'} A meta de ${formatInt(target)} foi ${targetSource}. O arco vai a ${formatInt(domainMax)}, ${formatDecimal(DOMAIN_OVER_FACTOR)} vez a meta, só para o excedente caber.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="mb-2 flex shrink-0 flex-col gap-0.5">
        <p aria-hidden className="truncate text-xs text-text-secondary">
          {label}, {formatMonthLong(period)}
        </p>
        {over > 0 ? (
          <p aria-hidden className="flex items-center gap-1 truncate text-xs font-medium text-positive">
            <TrendingUp aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">
              +{formatPercent(over / target)} acima da meta de {formatInt(target)}
            </span>
          </p>
        ) : null}
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadialBarChart
            cy={`${String(CY_FRACTION * 100)}%`}
            data={[{ base, excess }]}
            endAngle={ARC_END}
            innerRadius={INNER_RADIUS}
            outerRadius={OUTER_RADIUS}
            startAngle={ARC_START}
          >
            <PolarAngleAxis domain={[0, domainMax]} tick={false} type="number" />
            <MinLabel min={0} />
            <MetaTick domainMax={domainMax} target={target} />
            <CenterLabel value={value} />
            <RadialBar
              background={{ fill: 'var(--surface-sunken)' }}
              cornerRadius={baseCornerRadius}
              dataKey="base"
              fill="var(--chart-1)"
              isAnimationActive={animate}
              stackId="fechamentos"
            />
            <RadialBar
              cornerRadius={excess > 0 ? TIP_CORNER_RADIUS : 0}
              dataKey="excess"
              fill="var(--positive)"
              isAnimationActive={animate}
              stackId="fechamentos"
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-1 shrink-0 text-center text-[0.6875rem] leading-tight text-text-muted">
        Arco vai a {formatInt(domainMax)}, {formatDecimal(DOMAIN_OVER_FACTOR)} vez a meta, para o excedente caber. Meta de {formatInt(target)}, {targetSource}.
      </p>
    </div>
  );
}
