import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  currentPeriodLabel as defaultCurrentLabel,
  previousPeriodLabel as defaultPreviousLabel,
  type FunnelStageComparison,
} from './data';

/**
 * Funil comercial do trimestre atual contra o anterior, em barras agrupadas por etapa e na mesma
 * escala: o trimestre atual em destaque sólido, o anterior no mesmo tom translúcido. O valor
 * absoluto de cada barra fica escrito na ponta, porque a diferença de tamanho entre os dois
 * períodos é parte da leitura.
 */
export interface QuarterFunnelProps {
  readonly data?: readonly FunnelStageComparison[];
  readonly currentPeriodLabel?: string;
  readonly previousPeriodLabel?: string;
  readonly height?: number;
  readonly className?: string;
}

const CURRENT_FILL = 'var(--chart-1)';
const PREVIOUS_FILL = 'var(--chart-1)';
const PREVIOUS_OPACITY = 0.45;
const MARGIN = { top: 20, right: 92, bottom: 8, left: 0 } as const;
const NAME_AXIS_WIDTH = 108;
const VALUE_LABEL_GAP = 6;
/** Teto de espessura por série (ESP-2); o passo abaixo garante o piso mesmo com duas séries. */
const BAR_MAX = 16;
const BAR_CATEGORY_GAP = '32%';
/** Vão entre as duas barras da mesma etapa, declarado à mão (ESP-6): a biblioteca não avisa o padrão de 4 px. */
const BAR_GAP = 3;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

export default function QuarterFunnel({
  data = defaultData,
  currentPeriodLabel = defaultCurrentLabel,
  previousPeriodLabel = defaultPreviousLabel,
  height,
  className,
}: QuarterFunnelProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma etapa neste recorte: não há funil para comparar.</span>
      </div>
    );
  }

  const first = data[0]!;
  const last = data[data.length - 1]!;
  const domainMax = Math.max(first.currentValue, first.previousValue);
  const currentRate = first.currentValue > 0 ? last.currentValue / first.currentValue : 0;
  const previousRate = first.previousValue > 0 ? last.previousValue / first.previousValue : 0;

  const summary =
    `Gráfico de barras horizontais com o funil comercial em duas escalas iguais: ${currentPeriodLabel} contra ` +
    `${previousPeriodLabel}. Abre em ${first.stage} com ${formatInt(first.currentValue)} contra ${formatInt(first.previousValue)} ` +
    `e fecha em ${last.stage} com ${formatInt(last.currentValue)} contra ${formatInt(last.previousValue)}, ` +
    `${formatPercent(currentRate)} contra ${formatPercent(previousRate)} da entrada.`;

  const renderValue = (seriesKind: 'current' | 'previous') =>
    function ValueLabel({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null {
      const row = index === undefined ? undefined : data[index];
      if (!row) return null;
      const value = seriesKind === 'current' ? row.currentValue : row.previousValue;
      return (
        <text
          className="font-display"
          dominantBaseline="central"
          fill={seriesKind === 'current' ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontSize={12}
          fontWeight={seriesKind === 'current' ? 700 : 500}
          style={HALO}
          x={Number(x) + Number(width) + VALUE_LABEL_GAP}
          y={Number(y) + Number(barHeight) / 2}
        >
          {formatInt(value)}
        </text>
      );
    };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: CURRENT_FILL }} />
          {currentPeriodLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: PREVIOUS_FILL, opacity: PREVIOUS_OPACITY }} />
          {previousPeriodLabel}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} barGap={BAR_GAP} data={[...data]} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, domainMax]} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="stage"
              interval={0}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Bar dataKey="currentValue" fill={CURRENT_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 3, 3, 0]}>
              <LabelList content={renderValue('current')} dataKey="currentValue" />
            </Bar>
            <Bar dataKey="previousValue" fill={PREVIOUS_FILL} fillOpacity={PREVIOUS_OPACITY} isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 3, 3, 0]}>
              <LabelList content={renderValue('previous')} dataKey="previousValue" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
