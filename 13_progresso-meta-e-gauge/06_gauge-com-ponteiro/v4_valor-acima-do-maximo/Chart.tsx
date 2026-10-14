import { Cell, Pie, PieChart, ResponsiveContainer, useChartHeight, useChartWidth } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CapacityBand, type OverflowCapacityGauge } from './data';

/**
 * Gauge semicircular com o ponteiro travado no fim do arco: o domínio fica fixo em 0 a 320
 * mesmo quando o valor real passa disso, porque esticar a escala em silêncio esconderia o
 * estouro. Uma marca de transbordo na ponta e o valor real escrito por extenso avisam o que o
 * ângulo sozinho não consegue: o ponteiro é a leitura menos precisa deste catálogo.
 */
export interface OverflowCapacityGaugeProps {
  readonly data?: OverflowCapacityGauge;
  readonly height?: number;
  readonly className?: string;
}

const SIDE_PAD = 14;
const TOP_PAD = 22;
const BOTTOM_TEXT_HEIGHT = 78;
const BAND_RATIO = 0.62;
const NEEDLE_RATIO = 0.86;
const HUB_RADIUS = 6;
const NEEDLE_BASE = 5;
const TICK_GAP = 8;
const CEILING_TICK_GAP = 15;
/**
 * Marca de transbordo: pequena seta encaixada logo depois da ponta do ponteiro, medida a partir
 * do próprio comprimento do ponteiro (nunca do raio externo), para nunca colidir com o rótulo do
 * máximo, que mora mais para fora, na borda do arco.
 */
const OVERFLOW_TIP_EXTRA = 12;
const OVERFLOW_BASE_PULLBACK = 5;
const OVERFLOW_HALF_ANGLE = 8;
const NEEDLE_FILL = 'var(--text-primary)';
const NEEDLE_STROKE = { stroke: 'var(--surface-raised)', strokeWidth: 1 } as const;
const BAND_OPACITY: Record<string, number> = { confortavel: 1, atencao: 0.7, estouro: 0.42 };

function polar(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

/** Ângulo do ponteiro a partir do valor: trava em 0 e em 180, nunca esticando nem dando volta. */
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
  readonly bands: readonly CapacityBand[];
  readonly min: number;
  readonly max: number;
  readonly value: number;
  readonly ceiling: number;
  readonly animate: boolean;
}

function Dial({ bands, min, max, value, ceiling, animate }: DialProps) {
  const width = useChartWidth();
  const height = useChartHeight();
  if (!width || !height) return null;

  const cx = width / 2;
  const cy = Math.max(TOP_PAD, height - BOTTOM_TEXT_HEIGHT);
  const outerRadius = Math.max(1, Math.min(width / 2 - SIDE_PAD, cy - TOP_PAD));
  const innerRadius = outerRadius * BAND_RATIO;
  const needleLen = outerRadius * NEEDLE_RATIO;
  const angle = valueToAngle(value, min, max);
  const isOverMax = value > max;
  const tip = polar(cx, cy, needleLen, angle);
  const baseLeft = polar(cx, cy, NEEDLE_BASE, angle + 90);
  const baseRight = polar(cx, cy, NEEDLE_BASE, angle - 90);
  const boundaries = bands
    .slice(0, -1)
    .map((band) => band.to)
    .filter((boundary) => boundary !== ceiling);
  const ceilingAngle = valueToAngle(ceiling, min, max);
  const ends = [
    { value: min, angle: 180 },
    { value: max, angle: 0 },
  ] as const;
  const overflowApex = polar(cx, cy, needleLen + OVERFLOW_TIP_EXTRA, angle);
  const overflowLeft = polar(cx, cy, needleLen - OVERFLOW_BASE_PULLBACK, angle + OVERFLOW_HALF_ANGLE);
  const overflowRight = polar(cx, cy, needleLen - OVERFLOW_BASE_PULLBACK, angle - OVERFLOW_HALF_ANGLE);

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
          return <line key={boundary} stroke="var(--surface-raised)" strokeWidth={1.5} x1={inner.x} x2={outer.x} y1={inner.y} y2={outer.y} />;
        })}
        {(() => {
          const inner = polar(cx, cy, innerRadius, ceilingAngle);
          const outer = polar(cx, cy, outerRadius + CEILING_TICK_GAP * 0.5, ceilingAngle);
          const labelPoint = polar(cx, cy, outerRadius + CEILING_TICK_GAP, ceilingAngle);
          return (
            <g>
              <line stroke="var(--text-secondary)" strokeWidth={2} x1={inner.x} x2={outer.x} y1={inner.y} y2={outer.y} />
              <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={600} textAnchor={anchorFor(labelPoint.x, cx)} x={labelPoint.x} y={labelPoint.y}>
                teto {formatInt(ceiling)}
              </text>
            </g>
          );
        })()}
        {ends.map((end) => {
          const point = polar(cx, cy, outerRadius + TICK_GAP, end.angle);
          return (
            <text className="font-display" fill="var(--text-muted)" fontSize={11} key={end.angle} textAnchor={anchorFor(point.x, cx)} x={point.x} y={point.y}>
              {formatInt(end.value)}
            </text>
          );
        })}
        {isOverMax ? (
          <polygon
            fill="var(--negative)"
            points={`${String(overflowLeft.x)},${String(overflowLeft.y)} ${String(overflowApex.x)},${String(overflowApex.y)} ${String(overflowRight.x)},${String(overflowRight.y)}`}
          />
        ) : null}
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

export default function OverflowCapacityGaugeChart({ data = defaultData, height, className }: OverflowCapacityGaugeProps) {
  const animate = useAnimateOnce();
  const { label, period, unit, min, max, value, ceiling, bands } = data;
  const style = height === undefined ? undefined : { height };
  const over = value - max;
  const overCeiling = value - ceiling;

  const summary = [
    `Gauge semicircular com as ${label.toLowerCase()} de ${period}: ${formatInt(value)} ${unit}, valor real.`,
    `O ponteiro trava no máximo de um arco de ${formatInt(min)} a ${formatInt(max)}, sem esticar o domínio.`,
    `O valor está ${formatInt(over)} acima do máximo e ${formatInt(overCeiling)} acima do teto de ${formatInt(ceiling)}.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer={false} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Dial animate={animate} bands={bands} ceiling={ceiling} max={max} min={min} value={value} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-0.5 pb-1 text-center">
          <p className="text-xs font-medium text-negative">Acima do máximo do arco</p>
          <p className="kpi-number text-3xl leading-none font-semibold text-text-primary">
            {formatInt(value)} <span className="text-sm font-medium text-text-muted">{unit}</span>
          </p>
          <p className="text-[0.6875rem] text-text-muted">
            <span className="font-semibold text-negative">{formatInt(over)}</span> acima do máximo de {formatInt(max)}
          </p>
        </div>
      </div>
    </div>
  );
}
