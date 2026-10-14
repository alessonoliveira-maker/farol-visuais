import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, useChartHeight, useChartWidth } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { capacitySource as defaultCapacitySource, data as defaultData, type QueueArcStatus } from './data';

/**
 * Três gauges de arco lado a lado, com o mesmo arco e o mesmo domínio: a escala comum existe só
 * para o mesmo tanto de arco vazio significar a mesma coisa em qualquer cartão, nunca para comparar
 * ângulo entre filas (regra da família). Zero medido desenha a marca e escreve 0; sem coleta troca
 * o trilho sólido por contorno tracejado e o número por formatUnavailable(), nunca 0%.
 */
export interface QueueArcPanelProps {
  readonly data?: readonly QueueArcStatus[];
  readonly capacitySource?: string;
  readonly height?: number;
  readonly className?: string;
}

const ARC_START = 210;
const ARC_END = -30;
const CY_FRACTION = 0.58;
const OUTER_RADIUS = '90%';
const INNER_RADIUS = '62%';
const TIP_CORNER_RADIUS = 8;
const MIN_SWEEP_DEG = 6;

interface CenterProps {
  readonly value: number | null;
}

/** Número centrado quando há medição; ícone Unplug quando a fila não foi coletada no dia. */
function Center({ value }: CenterProps): ReactElement | null {
  const width = useChartWidth() ?? 0;
  const height = useChartHeight() ?? 0;
  if (width <= 0 || height <= 0) return null;
  const cx = width / 2;
  const cy = height * CY_FRACTION;
  if (value === null) {
    return (
      <g aria-hidden>
        <Unplug color="var(--text-muted)" height={16} width={16} x={cx - 8} y={cy - 18} />
      </g>
    );
  }
  return (
    <text className="font-display" fill="var(--text-primary)" fontSize={20} fontWeight={600} textAnchor="middle" x={cx} y={cy - 4}>
      {formatInt(value)}
    </text>
  );
}

interface QueueGaugeProps {
  readonly item: QueueArcStatus;
  readonly domainMax: number;
  readonly animate: boolean;
}

function QueueGauge({ item, domainMax, animate }: QueueGaugeProps): ReactElement {
  const collected = item.value !== null;
  const value = item.value ?? 0;
  const ratio = domainMax > 0 ? value / domainMax : 0;
  const sweepDeg = ratio * (ARC_START - ARC_END);
  const cornerRadius = !collected || sweepDeg < MIN_SWEEP_DEG ? 0 : TIP_CORNER_RADIUS;
  const background = collected
    ? { fill: 'var(--surface-sunken)' }
    : { fill: 'none', stroke: 'var(--line-strong)', strokeDasharray: '4 4', strokeWidth: 1.5 };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col items-center">
      <p className="mb-1 w-full shrink-0 truncate text-center text-[0.6875rem] text-text-muted">{item.label}</p>
      <div className="min-h-0 w-full flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadialBarChart
            cy={`${String(CY_FRACTION * 100)}%`}
            data={[{ value: collected ? value : 0 }]}
            endAngle={ARC_END}
            innerRadius={INNER_RADIUS}
            outerRadius={OUTER_RADIUS}
            startAngle={ARC_START}
          >
            <PolarAngleAxis domain={[0, domainMax]} tick={false} type="number" />
            <Center value={item.value} />
            <RadialBar
              background={background}
              cornerRadius={cornerRadius}
              dataKey="value"
              fill={collected ? 'var(--chart-1)' : 'var(--surface-raised)'}
              isAnimationActive={animate}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 shrink-0 truncate text-center text-[0.6875rem] text-text-muted">
        {collected ? formatRateWithVolume(value, item.capacity) : formatUnavailable()}
      </p>
    </div>
  );
}

export default function QueueArcPanel({
  data = defaultData,
  capacitySource = defaultCapacitySource,
  height,
  className,
}: QueueArcPanelProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma fila neste recorte.</span>
      </div>
    );
  }

  const domainMax = Math.max(...data.map((item) => item.capacity));
  const parts = data.map((item) =>
    item.value === null
      ? `${item.label} sem coleta`
      : `${item.label} com ${formatInt(item.value)} de ${formatInt(item.capacity)}`,
  );

  const summary = `Painel de ${String(data.length)} gauges de arco na mesma escala de ${formatInt(domainMax)} por fila: ${parts.join(', ')}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="flex min-h-0 flex-1 gap-4">
        {data.map((item) => (
          <QueueGauge animate={animate} domainMax={domainMax} item={item} key={item.id} />
        ))}
      </div>
      <p aria-hidden className="mt-1 shrink-0 truncate text-center text-[0.6875rem] text-text-muted">
        Escala comum: {capacitySource}.
      </p>
    </div>
  );
}
