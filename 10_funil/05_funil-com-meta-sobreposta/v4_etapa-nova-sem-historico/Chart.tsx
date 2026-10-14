import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, type BarShapeProps } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type EtapaMetaOrigem } from './data';

/**
 * Realizado por etapa contra a meta de cada uma, com duas origens de meta distinguidas por
 * forma: traço sólido quando a meta vem de taxa histórica medida, marcador vazado em losango
 * quando a meta é premissa digitada por não haver medição por trás, caso de etapa nova.
 */
export interface FunnelWithTargetOriginProps {
  readonly data?: readonly EtapaMetaOrigem[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 4, right: 172, bottom: 4, left: 0 } as const;
const NAME_AXIS_WIDTH = 132;
const BAR_MAX = 22;
const BAR_CATEGORY_GAP = '32%';
const VALUE_LABEL_GAP = 10;
const TARGET_OVERSHOOT = 5;
const DIAMOND_HALF = 5;
/** ESP-3, correção 2026-09-18: folga entre a base do losango e o topo da barra, pra barra curta
 * (Comitê de investimento, 8 de 15) não virar mancha única com o marcador vazado. */
const DIAMOND_GAP = 4;
const TEXT_LINE_HEIGHT = 14;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

export default function FunnelWithTargetOrigin({ data = defaultData, height, className }: FunnelWithTargetOriginProps) {
  const animate = useAnimateOnce();
  const rows = data;
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma etapa neste recorte: sem meta nem realizado para comparar.</span>
      </div>
    );
  }

  const domainMax = Math.ceil((Math.max(...rows.map((row) => row.meta)) * 1.08) / 10) * 10;
  const premissa = rows.find((row) => row.origemMeta === 'premissa');

  const summary =
    `Gráfico de barras horizontal com o funil comercial do trimestre contra a meta de cada etapa. ` +
    (premissa
      ? `${premissa.etapa} é nova, sem taxa histórica: a meta é premissa digitada e o atingimento não é calculado.`
      : 'Todas as etapas têm meta medida.');

  const reading = 'Meta por etapa; marcador vazado indica meta sem medição por trás, digitada como premissa.';

  const renderBar = (props: BarShapeProps): ReactElement | null => {
    const row = props.payload as EtapaMetaOrigem | undefined;
    if (!row) return null;
    const x = Number(props.x);
    const y = Number(props.y);
    const width = Number(props.width);
    const barHeight = Number(props.height);
    const bg = props.background;
    const trackX = Number(bg?.x ?? x);
    const trackWidth = Number(bg?.width ?? width);
    const targetX = trackX + trackWidth * Math.min(1, row.meta / domainMax);
    const labelX = trackX + trackWidth + VALUE_LABEL_GAP;
    const midY = y + barHeight / 2;
    const isPremissa = row.origemMeta === 'premissa';
    // Losango sobe pra fora da banda da barra (ESP-3): com a barra curta, o marcador dentro dela
    // vira mancha única; a haste liga o marcador à barra sem sobrepor a área dos dois.
    const diamondY = y - DIAMOND_GAP - DIAMOND_HALF;
    return (
      <g>
        <rect fill="var(--chart-1)" height={barHeight} rx={3} ry={3} width={width} x={x} y={y} />
        {isPremissa ? (
          <g>
            <line stroke="var(--text-primary)" strokeWidth={1.5} x1={targetX} x2={targetX} y1={diamondY + DIAMOND_HALF} y2={midY} />
            <polygon
              fill="none"
              points={`${String(targetX)},${String(diamondY - DIAMOND_HALF)} ${String(targetX + DIAMOND_HALF)},${String(diamondY)} ${String(targetX)},${String(diamondY + DIAMOND_HALF)} ${String(targetX - DIAMOND_HALF)},${String(diamondY)}`}
              stroke="var(--text-primary)"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </g>
        ) : (
          <line stroke="var(--text-primary)" strokeWidth={2} x1={targetX} x2={targetX} y1={y - TARGET_OVERSHOOT} y2={y + barHeight + TARGET_OVERSHOOT} />
        )}
        {isPremissa ? (
          <g>
            <Unplug aria-hidden className="text-text-muted" height={12} width={12} x={labelX} y={midY - 12} />
            <text className="font-sans" dominantBaseline="hanging" fill="var(--text-muted)" fontSize={11} style={HALO} x={labelX + 16} y={midY - 12}>
              {formatUnavailable()}, premissa
            </text>
            {/* NUM-6, correção 2026-09-18: sem atingimento calculável, o par absoluto com o
             * substantivo ainda precisa aparecer, senão o realizado e a meta desta etapa somem. */}
            <text className="font-display" dominantBaseline="hanging" fill="var(--text-primary)" fontSize={11} fontWeight={500} style={HALO} x={labelX + 16} y={midY - 12 + TEXT_LINE_HEIGHT}>
              {formatInt(row.realizado)} de {formatInt(row.meta)} oportunidades
            </text>
          </g>
        ) : (
          <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={500} style={HALO} x={labelX} y={midY}>
            {formatRateWithVolume(row.realizado, row.meta)}
          </text>
        )}
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis {...AXIS_PROPS} dataKey="realizado" domain={[0, domainMax]} hide type="number" />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="etapa"
              interval={0}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Bar background={{ fill: 'var(--surface-sunken)' }} dataKey="realizado" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
