import type { ReactElement } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, useChartHeight, useChartWidth } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type AgendaCanal } from './data';

/**
 * Meia rosca de dois canais com um tique fixo no topo do arco marcando 50% do total: a leitura
 * calculada diz se o outbound já passou da metade, e o número de cada canal vai escrito na ponta
 * do próprio arco, porque a meia volta dobra a distorção do ângulo perto das pontas.
 */
export interface AgendaCanalDonutProps {
  readonly data?: readonly AgendaCanal[];
  readonly height?: number;
  readonly className?: string;
}

/** Slots categóricos na ordem da COR-8: 1 e 3 para duas partes. */
const SLOT_COLORS = [CHART_SERIES_COLORS[0], CHART_SERIES_COLORS[2]] as const;
const CY_FRACTION = 0.82;
const OUTER_FRACTION = 1;
const INNER_FRACTION = 0.7;
const LABEL_GAP = 14;
const RADIAN = Math.PI / 180;
/** Halo obrigatório (ROT-7): o rótulo pode cair perto do tique de 50%, dependendo da divisão do dado. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface SliceLabelProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly midAngle?: number;
  readonly outerRadius?: number;
  readonly index?: number;
}

/** Tique tracejado no topo do arco: ponto fixo de 50% do total, o mesmo em qualquer recorte. */
function HalfTick(): ReactElement {
  const width = useChartWidth() ?? 0;
  const containerHeight = useChartHeight() ?? 0;
  const maxRadius = Math.min(width, containerHeight) / 2;
  const cx = width / 2;
  const cy = containerHeight * CY_FRACTION;
  const outer = maxRadius * OUTER_FRACTION;
  const inner = maxRadius * INNER_FRACTION;
  return (
    <g aria-hidden>
      <line stroke="var(--text-muted)" strokeDasharray="3 3" x1={cx} x2={cx} y1={cy - outer - 4} y2={cy - inner + 2} />
      <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={cy - outer - 8}>
        {formatPercent(0.5, 0)}
      </text>
    </g>
  );
}

export default function AgendaCanalDonut({ data = defaultData, height, className }: AgendaCanalDonutProps) {
  const rows = data;
  const animate = useAnimateOnce();
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const style = height === undefined ? undefined : { height };
  const outbound = rows.find((row) => row.id === 'outbound');
  const outboundShare = outbound && total > 0 ? outbound.value / total : undefined;

  const renderSliceLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 0,
    index = -1,
  }: SliceLabelProps): ReactElement | null => {
    const row = rows[index];
    if (!row || total <= 0) return null;
    const pct = row.value / total;
    const angle = -midAngle * RADIAN;
    const x = cx + (outerRadius + LABEL_GAP) * Math.cos(angle);
    const y = cy + (outerRadius + LABEL_GAP) * Math.sin(angle);
    const cos = Math.cos(angle);
    const anchor = cos > 0.15 ? 'start' : cos < -0.15 ? 'end' : 'middle';
    return (
      <text fontSize={12} style={HALO} textAnchor={anchor} x={x} y={y}>
        <tspan className="font-sans" fill="var(--text-secondary)" fontWeight={500}>
          {row.name}{' '}
        </tspan>
        <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
          {formatInt(row.value)} ({formatPercent(pct, 0)})
        </tspan>
      </text>
    );
  };

  const summary = [
    `Meia rosca com as agendas de dois canais na semana, somando ${formatInt(total)}.`,
    outbound && outboundShare !== undefined
      ? `Outbound responde por ${formatPercent(outboundShare, 0)} do total, com ${formatInt(outbound.value)} agendas.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {outbound && outboundShare !== undefined ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
          Outbound já responde por{' '}
          <span className="kpi-number font-semibold text-text-primary">{formatPercent(outboundShare, 0)}</span> das{' '}
          <span className="kpi-number font-semibold text-text-primary">{formatInt(total)}</span> agendas da semana.
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer={false}>
            <Pie
              cx="50%"
              cy={`${String(CY_FRACTION * 100)}%`}
              data={rows}
              dataKey="value"
              endAngle={0}
              innerRadius={`${String(INNER_FRACTION * 100)}%`}
              isAnimationActive={animate}
              label={renderSliceLabel}
              labelLine={false}
              nameKey="name"
              outerRadius={`${String(OUTER_FRACTION * 100)}%`}
              startAngle={180}
              stroke="var(--surface-raised)"
              strokeWidth={2}
            >
              {rows.map((row, index) => (
                <Cell fill={SLOT_COLORS[index] ?? CHART_SERIES_COLORS[0]} key={row.id} />
              ))}
            </Pie>
            <HalfTick />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
