import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, ReferenceArea, ReferenceLine, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QuarterlyBullet } from './data';

/**
 * Bullet chart horizontal: uma medida, uma meta e uma régua qualitativa de estado, na
 * especificação de Stephen Few. A meta é um traço sólido que cruza a barra; as faixas são
 * fundos planos de um único tom, nomeadas acima da área pintada.
 */
export interface QuarterlyBulletChartProps {
  readonly data?: QuarterlyBullet;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 22, right: 108, bottom: 36, left: 0 } as const;
/** Cerca de um terço da altura típica do corpo nos canvases faixa e card: espessura verificada no preview. */
const BAR_SIZE = 28;
const VALUE_LABEL_GAP = 6;
/** Halo na cor do cartão: todo texto interno vive sobre a faixa qualitativa, nunca sobre o fundo cru. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;
/** Intensidade crescente de um único tom neutro: a mais clara marca a faixa ruim. */
const BAND_OPACITY: Record<string, number> = { Ruim: 0.45, Aceitável: 0.72, Boa: 1 };

interface AreaViewBox {
  readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number; readonly height?: number };
}

export default function QuarterlyBulletChart({ data = defaultData, height, className }: QuarterlyBulletChartProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [{ name: data.label, value: data.value }];
  const domainMax = Math.max(data.bands.at(-1)?.to ?? data.target, data.target) * 1.02;
  const current = data.bands.find((band) => data.value >= band.from && data.value < band.to) ?? data.bands.at(-1);
  const gap = data.target - data.value;

  const summary = [
    `Bullet chart com a receita reconhecida do trimestre, ${formatCurrencyCompact(data.value)}.`,
    current ? `Está na faixa ${current.name.toLowerCase()} da régua de estado.` : '',
    `A meta é ${formatCurrencyCompact(data.target)}${gap > 0 ? `, e faltam ${formatCurrencyCompact(gap)} para alcançá-la` : ', já superada'}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const reading = current
    ? `${current.name}${gap > 0 ? `, a ${formatCurrencyCompact(gap)} da meta` : ', meta já superada'}`
    : '';

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

  /** Linha própria, abaixo da barra e acima do eixo: nunca na mesma altura dos nomes de faixa. */
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
      meta {formatCurrencyCompact(data.target)}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{data.label}</span>: <span className="tabular-nums">{reading}</span>
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
