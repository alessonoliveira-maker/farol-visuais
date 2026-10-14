import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, ReferenceArea, ReferenceLine, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatDate, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyCplBullet } from './data';

/**
 * Bullet chart de custo com polaridade invertida: a faixa boa fica perto do zero e a ruim longe
 * dele, porque menor CPL é melhor. A meta é o teto aceitável, um traço sólido sobre a barra.
 */
export interface MonthlyCplChartProps {
  readonly data?: MonthlyCplBullet;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 22, right: 96, bottom: 36, left: 0 } as const;
const BAR_SIZE = 28;
const VALUE_LABEL_GAP = 6;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;
const BAND_OPACITY: Record<string, number> = { Boa: 0.45, Aceitável: 0.72, Ruim: 1 };

interface AreaViewBox {
  readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number; readonly height?: number };
}

export default function MonthlyCplChart({ data = defaultData, height, className }: MonthlyCplChartProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [{ name: data.label, value: data.value }];
  const domainMax = Math.max(data.bands.at(-1)?.to ?? data.value, data.value) * 1.02;
  const current = data.bands.find((band) => data.value >= band.from && data.value < band.to) ?? data.bands.at(-1);
  const change = data.value - data.previousValue;
  const worse = change > 0;

  const summary = [
    `Bullet chart com o CPL de mídia paga em ${formatMonthShort(data.month)}, ${formatCurrencyCompact(data.value)} por lead.`,
    current ? `Está na faixa ${current.name.toLowerCase()} da régua de custo, em que menor é melhor.` : '',
    `Teto aceitável de ${formatCurrencyCompact(data.target)}.`,
    `${worse ? 'Subiu' : 'Caiu'} ${formatCurrencyCompact(Math.abs(change))} contra ${formatCurrencyCompact(data.previousValue)} do mês anterior.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderBandLabel = (name: string) => ({ viewBox }: AreaViewBox): ReactElement => (
    <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) / 2} y={(viewBox?.y ?? 0) - 6}>
      {name}
    </text>
  );

  const renderValue = ({ x, y, width, height: barHeight }: LabelProps): ReactElement | null => (
    <text
      className="font-display"
      dominantBaseline="central"
      fill="var(--text-primary)"
      fontSize={12}
      fontWeight={700}
      style={HALO}
      x={Number(x) + Number(width) + VALUE_LABEL_GAP}
      y={Number(y) + Number(barHeight) / 2}
    >
      {formatCurrencyCompact(data.value)}
    </text>
  );

  const renderTarget = ({ viewBox }: AreaViewBox): ReactElement => (
    <text
      className="font-display"
      fill="var(--text-secondary)"
      fontSize={11}
      style={HALO}
      textAnchor="middle"
      x={viewBox?.x ?? 0}
      y={(viewBox?.y ?? 0) + (viewBox?.height ?? 0) + 14}
    >
      teto {formatCurrencyCompact(data.target)}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{data.label}</span>, {formatMonthShort(data.month)}{' '}
        {worse ? (
          <TrendingUp aria-hidden className="inline-block size-3.5 align-[-2px] text-negative" />
        ) : (
          <TrendingDown aria-hidden className="inline-block size-3.5 align-[-2px] text-positive" />
        )}{' '}
        <span className={cn('kpi-number font-medium', worse ? 'text-negative' : 'text-positive')}>
          {worse ? '+' : '−'}
          {formatCurrencyCompact(Math.abs(change))}
        </span>{' '}
        contra {formatCurrencyCompact(data.previousValue)} em {formatMonthShort(data.previousMonth)},{' '}
        <span className="text-text-muted">régua da revisão de {formatDate(data.policyDate)}</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis
              axisLine={false}
              domain={[0, domainMax]}
              height={18}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickLine={false}
              type="number"
            />
            <YAxis dataKey="name" hide type="category" />
            {data.bands.map((band) => (
              <ReferenceArea
                fill="var(--surface-sunken)"
                fillOpacity={BAND_OPACITY[band.name] ?? 0.3}
                ifOverflow="extendDomain"
                key={band.name}
                label={renderBandLabel(band.name)}
                stroke="none"
                x1={band.from}
                x2={band.to}
              />
            ))}
            <Bar dataKey="value" fill="var(--chart-1)" isAnimationActive={animate} maxBarSize={BAR_SIZE} radius={[0, 3, 3, 0]}>
              <LabelList content={renderValue} dataKey="value" />
            </Bar>
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderTarget}
              stroke="var(--text-primary)"
              strokeWidth={3}
              x={data.target}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
