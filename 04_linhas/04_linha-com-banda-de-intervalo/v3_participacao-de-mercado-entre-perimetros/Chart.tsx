import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type LabelProps,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, perimeterRevisionMonth as defaultRevisionMonth, type MarketShareMonth } from './data';

/**
 * Participação de mercado estimada, com a estimativa central por cima de uma faixa entre o
 * perímetro restrito e o perímetro amplo. A saída é sempre a faixa inteira, nunca um número só:
 * o rótulo final nomeia os dois lados por nome, não só "faixa".
 */
export interface MarketShareBandProps {
  readonly data?: readonly MarketShareMonth[];
  readonly revisionMonth?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 24, right: 92, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 44;
const DOMAIN: readonly [number, number] = [0.02, 0.1];
const TICKS = [0.02, 0.04, 0.06, 0.08, 0.1] as const;
const BAND_FILL = 'var(--line-strong)';
const BAND_OPACITY = 0.32;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface BandRow extends MarketShareMonth {
  readonly band: readonly [number, number];
}

export default function MarketShareBand({
  data = defaultData,
  revisionMonth = defaultRevisionMonth,
  height,
  className,
}: MarketShareBandProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há participação de mercado para estimar.</span>
      </div>
    );
  }

  const rows: readonly BandRow[] = data.map((row) => ({ ...row, band: [row.restrictedShare, row.broadShare] }));
  const lastIndex = rows.length - 1;
  const last = rows[lastIndex]!;
  const first = rows[0]!;

  const summary = [
    `Gráfico de linha com a participação de mercado estimada de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}, sempre entre dois perímetros.`,
    `Em ${formatMonthShort(last.month)}: ${formatPercent(last.estimateShare, 1)} na estimativa central, entre ${formatPercent(last.restrictedShare, 1)} no restrito e ${formatPercent(last.broadShare, 1)} no amplo, patamar maior desde a revisão de perímetro em ${formatMonthShort(revisionMonth)}.`,
  ].join(' ');

  const renderRevisionLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x ?? 0} y={12}>
      revisão de perímetro
    </text>
  );

  const renderEnd = (text: string, color: string, weight: number) => {
    const Renderer = ({ x, y, index }: LabelProps): ReactElement | null => {
      if (index !== lastIndex) return null;
      return (
        <text className="font-display" dominantBaseline="central" fill={color} fontSize={12} fontWeight={weight} style={HALO} textAnchor="start" x={Number(x) + 10} y={Number(y)}>
          {text}
        </text>
      );
    };
    return Renderer;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-muted">
        Faixa sombreada: do perímetro restrito ao perímetro amplo.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={DOMAIN} tickFormatter={(value: number) => formatPercent(value, 0)} ticks={[...TICKS]} width={VALUE_AXIS_WIDTH} />
            <ReferenceLine ifOverflow="extendDomain" label={renderRevisionLabel} stroke="var(--line-strong)" strokeDasharray="3 3" strokeWidth={1} x={revisionMonth} />
            <Area dataKey="band" fill={BAND_FILL} fillOpacity={BAND_OPACITY} isAnimationActive={animate} stroke="none" />
            <Line dataKey="broadShare" dot={false} isAnimationActive={false} stroke="none" strokeWidth={0}>
              <LabelList content={renderEnd(`amplo ${formatPercent(last.broadShare, 1)}`, 'var(--text-secondary)', 500)} dataKey="broadShare" />
            </Line>
            <Line dataKey="restrictedShare" dot={false} isAnimationActive={false} stroke="none" strokeWidth={0}>
              <LabelList content={renderEnd(`restrito ${formatPercent(last.restrictedShare, 1)}`, 'var(--text-secondary)', 500)} dataKey="restrictedShare" />
            </Line>
            <Line activeDot={{ r: 4 }} dataKey="estimateShare" dot={false} isAnimationActive={animate} stroke="var(--chart-1)" strokeWidth={2} type="linear">
              <LabelList content={renderEnd(formatPercent(last.estimateShare, 1), 'var(--text-primary)', 700)} dataKey="estimateShare" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
