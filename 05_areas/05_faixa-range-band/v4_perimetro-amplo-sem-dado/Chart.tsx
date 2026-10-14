import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, LabelList, ReferenceArea, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, gapEnd as defaultGapEnd, gapStart as defaultGapStart, type MarketShareMonthPartial } from './data';

/**
 * Faixa entre perímetro restrito e amplo em que o amplo, dependente de dado de terceiros,
 * ficou sem atualização por três meses. A faixa some nesse intervalo em vez de interpolar até
 * o amplo; o restrito, medido todo mês, continua desenhado como linha própria.
 */
export interface MarketShareGapProps {
  readonly data?: readonly MarketShareMonthPartial[];
  readonly gapStart?: string;
  readonly gapEnd?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 12, right: 88, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 44;
const DOMAIN: readonly [number, number] = [0, 0.24];
const TICKS = [0, 0.06, 0.12, 0.18, 0.24] as const;
const BAND_FILL = 'var(--line-strong)';
const BAND_OPACITY = 0.32;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface BandRow extends MarketShareMonthPartial {
  readonly band: readonly [number, number] | null;
}

export default function MarketShareGap({
  data = defaultData,
  gapStart = defaultGapStart,
  gapEnd = defaultGapEnd,
  height,
  className,
}: MarketShareGapProps) {
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

  const rows: readonly BandRow[] = data.map((row) => ({ ...row, band: row.broad === null ? null : [row.restricted, row.broad] }));
  const lastIndex = rows.length - 1;
  const last = rows[lastIndex]!;
  const gapMonths = rows.filter((row) => row.broad === null).length;

  const summary = [
    `Gráfico de área com a faixa entre perímetro restrito e amplo, de ${formatMonthShort(rows[0]?.month ?? '')} a ${formatMonthShort(last.month)}.`,
    `${String(gapMonths)} meses sem o amplo, de ${formatMonthShort(gapStart)} a ${formatMonthShort(gapEnd)}; o restrito segue medido.`,
    last.broad !== null ? `Em ${formatMonthShort(last.month)}: ${formatPercent(last.restricted, 1)} no restrito e ${formatPercent(last.broad, 1)} no amplo.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const reading = `${String(gapMonths)} meses sem o amplo, faixa omitida em vez de interpolada`;

  const renderRestrictedEnd = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index !== lastIndex) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} style={HALO} textAnchor="start" x={Number(x) + 8} y={Number(y)}>
        {`restrito ${formatPercent(last.restricted, 1)}`}
      </text>
    );
  };

  const renderBroadEnd = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index !== lastIndex) return null;
    const value = rows[index]?.broad;
    if (value === null || value === undefined) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} style={HALO} textAnchor="start" x={Number(x) + 8} y={Number(y)}>
        {`amplo ${formatPercent(value, 1)}`}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">{reading}</p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis axisLine={false} dataKey="month" interval={0} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatMonthShort} tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} domain={[...DOMAIN]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(value: number) => formatPercent(value, 0)} ticks={[...TICKS]} width={VALUE_AXIS_WIDTH} />
            <ReferenceArea
              fill="var(--surface-sunken)"
              fillOpacity={1}
              ifOverflow="visible"
              label={{ value: `amplo ${formatUnavailable()}`, position: 'insideTop', fill: 'var(--text-muted)', fontSize: 11 }}
              x1={gapStart}
              x2={gapEnd}
            />
            <Area connectNulls={false} dataKey="band" fill={BAND_FILL} fillOpacity={BAND_OPACITY} isAnimationActive={animate} stroke="none" />
            <Line connectNulls={false} dataKey="broad" dot={false} isAnimationActive={false} stroke="var(--text-secondary)" strokeWidth={1}>
              <LabelList content={renderBroadEnd} dataKey="broad" />
            </Line>
            <Line dataKey="restricted" dot={false} isAnimationActive={false} stroke="var(--text-secondary)" strokeWidth={1.5}>
              <LabelList content={renderRestrictedEnd} dataKey="restricted" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
