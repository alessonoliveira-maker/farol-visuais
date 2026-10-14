import { Cell, Pie, PieChart, ResponsiveContainer, useChartHeight, useChartWidth } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatPercentPoints } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CoverageState, type FunnelCoverageGauge } from './data';

/**
 * Gauge semicircular com o estado da cobertura de dado como palavra no centro, o valor numérico
 * de apoio logo abaixo e uma legenda com os quatro setores e a origem dos limiares. A posição do
 * ponteiro é a leitura menos precisa deste catálogo, por isso a palavra e o número saem sempre
 * escritos: quem olha não deve depender de ler o ângulo.
 */
export interface FunnelCoverageGaugeProps {
  readonly data?: FunnelCoverageGauge;
  readonly height?: number;
  readonly className?: string;
}

const SIDE_PAD = 14;
const TOP_PAD = 22;
/** Espaço reservado abaixo do arco para o estado e o valor de apoio, os dois em HTML absoluto. */
const BOTTOM_TEXT_HEIGHT = 66;
const BAND_RATIO = 0.62;
const NEEDLE_RATIO = 0.86;
const HUB_RADIUS = 6;
const NEEDLE_BASE = 5;
const TICK_GAP = 8;
const NEEDLE_FILL = 'var(--text-primary)';
const NEEDLE_STROKE = { stroke: 'var(--surface-raised)', strokeWidth: 1 } as const;
/** Intensidade crescente de um único tom neutro: a mais clara marca o estado mais crítico. */
const BAND_OPACITY: Record<string, number> = { critico: 0.4, atencao: 0.62, saudavel: 0.82, otimo: 1 };

function polar(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function valueToAngle(value: number, min: number, max: number): number {
  if (max === min) return 180;
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return 180 - t * 180;
}

function anchorFor(x: number, cx: number): 'start' | 'middle' | 'end' {
  if (x > cx + 1) return 'start';
  if (x < cx - 1) return 'end';
  return 'middle';
}

interface DialProps {
  readonly states: readonly CoverageState[];
  readonly min: number;
  readonly max: number;
  readonly value: number;
  readonly animate: boolean;
}

function Dial({ states, min, max, value, animate }: DialProps) {
  const width = useChartWidth();
  const height = useChartHeight();
  if (!width || !height) return null;

  const cx = width / 2;
  const cy = Math.max(TOP_PAD, height - BOTTOM_TEXT_HEIGHT);
  const outerRadius = Math.max(1, Math.min(width / 2 - SIDE_PAD, cy - TOP_PAD));
  const innerRadius = outerRadius * BAND_RATIO;
  const needleLen = outerRadius * NEEDLE_RATIO;
  const angle = valueToAngle(value, min, max);
  const tip = polar(cx, cy, needleLen, angle);
  const baseLeft = polar(cx, cy, NEEDLE_BASE, angle + 90);
  const baseRight = polar(cx, cy, NEEDLE_BASE, angle - 90);
  const ends = [
    { value: min, angle: 180 },
    { value: max, angle: 0 },
  ] as const;

  return (
    <>
      <Pie
        cx={cx}
        cy={cy}
        data={states.map((state) => ({ id: state.id, value: state.to - state.from }))}
        dataKey="value"
        endAngle={0}
        innerRadius={innerRadius}
        isAnimationActive={animate}
        outerRadius={outerRadius}
        startAngle={180}
        stroke="var(--surface-raised)"
        strokeWidth={1.5}
      >
        {states.map((state) => (
          <Cell fill="var(--surface-sunken)" fillOpacity={BAND_OPACITY[state.id] ?? 0.6} key={state.id} />
        ))}
      </Pie>
      <g aria-hidden focusable={false}>
        {ends.map((end) => {
          const point = polar(cx, cy, outerRadius + TICK_GAP, end.angle);
          return (
            <text className="font-display" fill="var(--text-muted)" fontSize={11} key={end.angle} textAnchor={anchorFor(point.x, cx)} x={point.x} y={point.y}>
              {formatPercentPoints(end.value)}
            </text>
          );
        })}
        <polygon
          fill={NEEDLE_FILL}
          points={`${String(baseLeft.x)},${String(baseLeft.y)} ${String(tip.x)},${String(tip.y)} ${String(baseRight.x)},${String(baseRight.y)}`}
          style={NEEDLE_STROKE}
        />
        <circle cx={cx} cy={cy} fill={NEEDLE_FILL} r={HUB_RADIUS} style={NEEDLE_STROKE} />
      </g>
    </>
  );
}

export default function FunnelCoverageGaugeChart({
  data = defaultData,
  height,
  className,
}: FunnelCoverageGaugeProps) {
  const animate = useAnimateOnce();
  const { label, period, min, max, value, states, healthyId, origin } = data;
  const style = height === undefined ? undefined : { height };
  const current = states.find((state) => value >= state.from && value < state.to) ?? states.at(-1);
  const healthy = states.find((state) => state.id === healthyId);
  const gapToHealthy = healthy ? Math.max(0, healthy.from - value) : 0;

  const summary = [
    `Gauge semicircular com o estado da ${label.toLowerCase()}, ${period}.`,
    current ? `O ponteiro aponta ${formatPercentPoints(value)}, no estado ${current.label.toLowerCase()}.` : '',
    healthy && gapToHealthy > 0
      ? `Faltam ${formatPercentPoints(gapToHealthy)} para entrar na faixa ${healthy.label.toLowerCase()}.`
      : `Já está na faixa ${healthy?.label.toLowerCase() ?? ''} ou acima dela.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer={false} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Dial animate={animate} max={max} min={min} states={states} value={value} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-0.5 pb-1 text-center">
          <p className="kpi-number text-3xl leading-none font-semibold text-text-primary">{current?.label ?? 'Sem estado'}</p>
          <p className="kpi-number text-sm font-semibold text-text-primary">{formatPercentPoints(value)}</p>
        </div>
      </div>
      <div aria-hidden className="shrink-0 pt-2">
        <p className="text-center text-xs text-text-secondary">
          {healthy && gapToHealthy > 0 ? (
            <>
              Faltam <span className="kpi-number font-semibold text-text-primary">{formatPercentPoints(gapToHealthy)}</span> para a faixa{' '}
              {healthy.label.toLowerCase()}
            </>
          ) : (
            `Já na faixa ${healthy?.label.toLowerCase() ?? ''} ou acima dela`
          )}
        </p>
        <ul className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-text-secondary">
          {states.map((state) => (
            <li className="flex items-center gap-1.5" key={state.id}>
              <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-surface-sunken" style={{ opacity: BAND_OPACITY[state.id] ?? 0.6 }} />
              <span>
                {state.label}, {formatPercentPoints(state.from)} a {formatPercentPoints(state.to)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-center text-[0.6875rem] text-text-muted">{origin}</p>
      </div>
    </div>
  );
}
