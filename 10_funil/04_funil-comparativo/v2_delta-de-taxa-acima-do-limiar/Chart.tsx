import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatPercent, formatPercentPoints } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  currentPeriodLabel as defaultCurrentLabel,
  previousPeriodLabel as defaultPreviousLabel,
  type FunnelStageComparison,
} from './data';

/**
 * Taxa de passo de cada transição do funil comercial, trimestre atual contra anterior, em barras
 * agrupadas na mesma escala de 0 a 100%. A transição em que a variação passa do limiar ganha uma
 * seta triangular, o sinal e os dois valores que a compõem; as demais mostram só a taxa.
 */
export interface RateDeltaFunnelProps {
  readonly data?: readonly FunnelStageComparison[];
  readonly currentPeriodLabel?: string;
  readonly previousPeriodLabel?: string;
  /** Variação mínima, em pontos percentuais, para ganhar seta e cor semântica. */
  readonly thresholdPoints?: number;
  readonly height?: number;
  readonly className?: string;
}

interface Transition {
  readonly id: string;
  readonly label: string;
  readonly currentRate: number;
  readonly previousRate: number;
  readonly currentPercent: number;
  readonly previousPercent: number;
  readonly deltaPoints: number;
}

const CURRENT_FILL = 'var(--chart-1)';
const PREVIOUS_OPACITY = 0.45;
const MARGIN = { top: 20, right: 216, bottom: 8, left: 0 } as const;
const NAME_AXIS_WIDTH = 172;
const VALUE_LABEL_GAP = 6;
/** Distância da base da barra anterior até a linha de delta, para nunca colidir com o rótulo dela (ROT-9). */
const DELTA_ROW_GAP = 14;
const BAR_MAX = 16;
const BAR_CATEGORY_GAP = '32%';
const BAR_GAP = 3;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

function buildTransitions(rows: readonly FunnelStageComparison[]): readonly Transition[] {
  const out: Transition[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    const prev = rows[i - 1]!;
    const stage = rows[i]!;
    const currentRate = prev.currentValue > 0 ? stage.currentValue / prev.currentValue : 0;
    const previousRate = prev.previousValue > 0 ? stage.previousValue / prev.previousValue : 0;
    out.push({
      id: stage.id,
      label: `${prev.stage} para ${stage.stage}`,
      currentRate,
      previousRate,
      currentPercent: currentRate * 100,
      previousPercent: previousRate * 100,
      deltaPoints: currentRate * 100 - previousRate * 100,
    });
  }
  return out;
}

function trianglePoints(x: number, y: number, up: boolean): string {
  return up ? `${x},${y - 4} ${x - 4},${y + 3} ${x + 4},${y + 3}` : `${x},${y + 4} ${x - 4},${y - 3} ${x + 4},${y - 3}`;
}

export default function RateDeltaFunnel({
  data = defaultData,
  currentPeriodLabel = defaultCurrentLabel,
  previousPeriodLabel = defaultPreviousLabel,
  thresholdPoints = 5,
  height,
  className,
}: RateDeltaFunnelProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const transitions = buildTransitions(data);

  if (transitions.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Funil precisa de ao menos duas etapas para calcular taxa de passo.</span>
      </div>
    );
  }

  const worst = transitions.reduce((acc, t) => (Math.abs(t.deltaPoints) > Math.abs(acc.deltaPoints) ? t : acc), transitions[0]!);
  const worstExceeds = Math.abs(worst.deltaPoints) >= thresholdPoints;
  const summary = worstExceeds
    ? `Gráfico de barras comparando a taxa de passo de ${currentPeriodLabel} com ${previousPeriodLabel} em ${String(transitions.length)} transições. Só ${worst.label.toLowerCase()} varia acima de ${formatPercentPoints(thresholdPoints)}: de ${formatPercent(worst.previousRate)} para ${formatPercent(worst.currentRate)}.`
    : `Gráfico de barras comparando a taxa de passo de ${currentPeriodLabel} com ${previousPeriodLabel} em ${String(transitions.length)} transições, nenhuma acima de ${formatPercentPoints(thresholdPoints)}.`;

  const renderCurrent = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const t = index === undefined ? undefined : transitions[index];
    if (!t) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={HALO} x={Number(x) + Number(width) + VALUE_LABEL_GAP} y={Number(y) + Number(barHeight) / 2}>
        {formatPercent(t.currentRate)}
      </text>
    );
  };

  /** Barra anterior: taxa quando a variação fica abaixo do limiar; abaixo da barra, a linha de delta quando passa dele (nunca os dois, para não colidir). */
  const renderPrevious = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const t = index === undefined ? undefined : transitions[index];
    if (!t) return null;
    const exceeds = Math.abs(t.deltaPoints) >= thresholdPoints;
    if (!exceeds) {
      return (
        <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} style={HALO} x={Number(x) + Number(width) + VALUE_LABEL_GAP} y={Number(y) + Number(barHeight) / 2}>
          {formatPercent(t.previousRate)}
        </text>
      );
    }
    const semantic = t.deltaPoints >= 0 ? 'var(--positive)' : 'var(--negative)';
    const sign = t.deltaPoints >= 0 ? '+' : '−';
    const rowY = Number(y) + Number(barHeight) + DELTA_ROW_GAP;
    const rowX = Number(x);
    return (
      <g>
        <polygon fill={semantic} points={trianglePoints(rowX + 4, rowY, t.deltaPoints >= 0)} />
        <text className="font-sans" dominantBaseline="central" fill={semantic} fontSize={11} x={rowX + 12} y={rowY}>
          {sign}
          {formatPercentPoints(Math.abs(t.deltaPoints))} p.p. (de {formatPercent(t.previousRate)} para {formatPercent(t.currentRate)})
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: CURRENT_FILL }} />
          {currentPeriodLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: CURRENT_FILL, opacity: PREVIOUS_OPACITY }} />
          {previousPeriodLabel}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} barGap={BAR_GAP} data={[...transitions]} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, 100]} hide type="number" />
            <YAxis axisLine={false} dataKey="label" interval={0} tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            <Bar dataKey="currentPercent" fill={CURRENT_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 3, 3, 0]}>
              <LabelList content={renderCurrent} dataKey="currentPercent" />
            </Bar>
            <Bar dataKey="previousPercent" fill={CURRENT_FILL} fillOpacity={PREVIOUS_OPACITY} isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 3, 3, 0]}>
              <LabelList content={renderPrevious} dataKey="previousPercent" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
