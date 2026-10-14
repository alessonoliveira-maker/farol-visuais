import { TriangleAlert } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, useChartHeight, useChartWidth } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CapacityBand, type CapacityGauge } from './data';

/**
 * Gauge semicircular de capacidade: entradas medidas contra um teto de atendimento também
 * medido, nunca uma meta a bater. A faixa de estouro carrega um ícone, porque polaridade de
 * capacidade nunca é verde no cheio. A posição do ponteiro é a leitura menos precisa deste
 * catálogo, por isso a folga contra o teto sai sempre escrita por extenso.
 */
export interface CapacityGaugeProps {
  readonly data?: CapacityGauge;
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
/** O traço do teto é mais comprido e mais forte que uma fronteira comum, para não se confundir com ela. */
const CEILING_TICK_GAP = 15;
const ICON_SIZE = 14;
const NEEDLE_FILL = 'var(--text-primary)';
const NEEDLE_STROKE = { stroke: 'var(--surface-raised)', strokeWidth: 1 } as const;
/** Intensidade crescente de um único tom neutro: a mais clara marca a faixa de estouro. */
const BAND_OPACITY: Record<string, number> = { confortavel: 1, atencao: 0.7, estouro: 0.42 };

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
  const tip = polar(cx, cy, needleLen, angle);
  const baseLeft = polar(cx, cy, NEEDLE_BASE, angle + 90);
  const baseRight = polar(cx, cy, NEEDLE_BASE, angle - 90);
  const boundaries = bands.slice(0, -1).map((band) => band.to).filter((boundary) => boundary !== ceiling);
  const ceilingAngle = valueToAngle(ceiling, min, max);
  const overflow = bands.find((band) => band.from === ceiling);
  const overflowMid = overflow ? valueToAngle((overflow.from + overflow.to) / 2, min, max) : null;
  const iconPoint = overflowMid === null ? null : polar(cx, cy, outerRadius + TICK_GAP + ICON_SIZE / 2 + 2, overflowMid);
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
        {iconPoint ? (
          <g transform={`translate(${String(iconPoint.x - ICON_SIZE / 2)}, ${String(iconPoint.y - ICON_SIZE / 2)})`}>
            <TriangleAlert aria-hidden className="text-negative" height={ICON_SIZE} width={ICON_SIZE} />
          </g>
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

export default function CapacityGaugeChart({ data = defaultData, height, className }: CapacityGaugeProps) {
  const animate = useAnimateOnce();
  const { label, period, unit, min, max, value, ceiling, bands } = data;
  const style = height === undefined ? undefined : { height };
  const current = bands.find((band) => value >= band.from && value < band.to) ?? bands.at(-1);
  const slack = ceiling - value;
  const overCeiling = slack < 0;

  const summary = [
    `Gauge semicircular de capacidade com as ${label.toLowerCase()} de ${period}: ${formatInt(value)} ${unit}, na faixa ${current?.label.toLowerCase() ?? ''}.`,
    `O teto medido é de ${formatInt(ceiling)} ${unit}.`,
    overCeiling
      ? `Já passou do teto em ${formatInt(Math.abs(slack))} ${unit}.`
      : `Faltam ${formatInt(slack)} ${unit} para o teto, dentro do arco de ${formatInt(min)} a ${formatInt(max)}.`,
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
          <p className="text-xs font-medium text-text-secondary">{current?.label ?? 'Sem faixa'}</p>
          <p className="kpi-number text-3xl leading-none font-semibold text-text-primary">
            {formatInt(value)} <span className="text-sm font-medium text-text-muted">{unit}</span>
          </p>
          <p className="text-[0.6875rem] text-text-muted">
            {overCeiling ? (
              <>
                <span className="font-semibold text-negative">{formatInt(Math.abs(slack))}</span> acima do teto
              </>
            ) : (
              <>
                faltam <span className="font-semibold text-text-primary">{formatInt(slack)}</span> para o teto
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
