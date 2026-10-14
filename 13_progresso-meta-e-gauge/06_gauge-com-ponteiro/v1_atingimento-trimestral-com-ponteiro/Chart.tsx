import { Cell, Pie, PieChart, ResponsiveContainer, useChartHeight, useChartWidth } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatPercentPoints } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type AttainmentBand, type QuarterlyAttainmentGauge } from './data';

/**
 * Gauge semicircular com ponteiro: arco de 180 graus com faixas por intensidade de um único tom
 * e um ponteiro cujo ângulo sai do valor por interpolação linear, nunca do meio de uma faixa.
 * A posição do ponteiro é a leitura menos precisa deste catálogo (erro angular grande, quem olha
 * arredonda para a faixa mais próxima), por isso mínimo, máximo e o valor saem sempre escritos.
 */
export interface QuarterlyAttainmentGaugeProps {
  readonly data?: QuarterlyAttainmentGauge;
  readonly height?: number;
  readonly className?: string;
}

const SIDE_PAD = 14;
const TOP_PAD = 22;
/** Espaço reservado abaixo do arco para a faixa atual e o valor grande, os dois em HTML absoluto. */
const BOTTOM_TEXT_HEIGHT = 76;
/** Espessura da faixa: pouco mais de um terço do raio externo. */
const BAND_RATIO = 0.62;
const NEEDLE_RATIO = 0.86;
const HUB_RADIUS = 6;
const NEEDLE_BASE = 5;
const TICK_GAP = 8;
/** Ponteiro e disco de base: cor única, contorno na cor do cartão para não sumir sobre faixa clara. */
const NEEDLE_FILL = 'var(--text-primary)';
const NEEDLE_STROKE = { stroke: 'var(--surface-raised)', strokeWidth: 1 } as const;
/** Intensidade crescente de um único tom neutro: a mais clara marca a faixa mais distante da meta. */
const BAND_OPACITY: Record<string, number> = { baixo: 0.45, rota: 0.72, acima: 1 };

/** Ponto polar com o mesmo sentido do PieChart: 180 graus é a ponta esquerda, 0 é a direita. */
function polar(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

/** Ângulo do ponteiro a partir do valor, contínuo dentro do arco e travado nas pontas (0 a 180). */
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
  readonly bands: readonly AttainmentBand[];
  readonly min: number;
  readonly max: number;
  readonly value: number;
  readonly animate: boolean;
}

/**
 * Arco e ponteiro em geometria própria, lidos de useChartWidth/useChartHeight para que cx, cy e
 * raio sejam os mesmos números usados pelo Pie das faixas e pelo ponteiro desenhado à mão.
 */
function Dial({ bands, min, max, value, animate }: DialProps) {
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
  const boundaries = bands.slice(0, -1).map((band) => band.to);
  const ends = [
    { value: min, angle: 180 },
    { value: max, angle: 0 },
  ] as const;

  return (
    <>
      <Pie
        cx={cx}
        cy={cy}
        data={bands.map((band) => ({ id: band.id, value: band.to - band.from }))}
        dataKey="value"
        endAngle={0}
        innerRadius={innerRadius}
        isAnimationActive={animate}
        outerRadius={outerRadius}
        startAngle={180}
        stroke="var(--surface-raised)"
        strokeWidth={1.5}
      >
        {bands.map((band) => (
          <Cell fill="var(--surface-sunken)" fillOpacity={BAND_OPACITY[band.id] ?? 0.6} key={band.id} />
        ))}
      </Pie>
      <g aria-hidden focusable={false}>
        {boundaries.map((boundary) => {
          const boundaryAngle = valueToAngle(boundary, min, max);
          const inner = polar(cx, cy, outerRadius, boundaryAngle);
          const outer = polar(cx, cy, outerRadius + TICK_GAP * 0.4, boundaryAngle);
          const labelPoint = polar(cx, cy, outerRadius + TICK_GAP, boundaryAngle);
          return (
            <g key={boundary}>
              <line stroke="var(--surface-raised)" strokeWidth={1.5} x1={inner.x} x2={outer.x} y1={inner.y} y2={outer.y} />
              <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor={anchorFor(labelPoint.x, cx)} x={labelPoint.x} y={labelPoint.y}>
                {formatPercentPoints(boundary)}
              </text>
            </g>
          );
        })}
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

export default function QuarterlyAttainmentGaugeChart({
  data = defaultData,
  height,
  className,
}: QuarterlyAttainmentGaugeProps) {
  const animate = useAnimateOnce();
  const { label, period, min, max, value, bands } = data;
  const style = height === undefined ? undefined : { height };
  const current = bands.find((band) => value >= band.from && value < band.to) ?? bands.at(-1);

  const summary = [
    `Gauge semicircular com o ${label.toLowerCase()} de ${period}.`,
    `O ponteiro aponta ${formatPercentPoints(value)}, entre o mínimo de ${formatPercentPoints(min)} e o máximo de ${formatPercentPoints(max)}.`,
    current ? `Está na faixa ${current.label.toLowerCase()}, de ${formatPercentPoints(current.from)} a ${formatPercentPoints(current.to)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer={false} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Dial animate={animate} bands={bands} max={max} min={min} value={value} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-0.5 pb-1 text-center">
          <p className="text-xs font-medium text-text-secondary">{current?.label ?? 'Sem faixa'}</p>
          <p className="kpi-number text-3xl leading-none font-semibold text-text-primary">{formatPercentPoints(value)}</p>
          <p className="text-[0.6875rem] text-text-muted">
            {label}, {period}
          </p>
        </div>
      </div>
    </div>
  );
}
