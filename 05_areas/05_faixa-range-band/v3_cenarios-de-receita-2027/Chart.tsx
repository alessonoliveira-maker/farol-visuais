import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, target as defaultTarget, type RevenueScenarioMonth } from './data';

/**
 * Faixa entre quatro cenários discretos de receita acumulada para 2027: a faixa ampla vai de
 * pessimista a otimista, e uma faixa mais estreita, desenhada por cima, vai de conservador a
 * moderado. As quatro linhas de cenário nascem rotuladas pelo nome, nunca por uma
 * probabilidade que os dados fixos do modelo de planejamento não sustentam.
 */
export interface RevenueScenarioBandProps {
  readonly data?: readonly RevenueScenarioMonth[];
  readonly target?: number;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 26, right: 138, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 56;
const DOMAIN: readonly [number, number] = [0, 12_000_000];
const TICKS = [0, 3_000_000, 6_000_000, 9_000_000, 12_000_000] as const;
const WIDE_FILL = 'var(--line-strong)';
const WIDE_OPACITY = 0.16;
const NARROW_OPACITY = 0.3;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface BandRow extends RevenueScenarioMonth {
  readonly wide: readonly [number, number];
  readonly narrow: readonly [number, number];
}

interface ViewBoxProps {
  readonly viewBox?: { readonly x?: number; readonly width?: number };
}

export default function RevenueScenarioBand({ data = defaultData, target = defaultTarget, height, className }: RevenueScenarioBandProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há cenário de receita projetado.</span>
      </div>
    );
  }

  const rows: readonly BandRow[] = data.map((row) => ({ ...row, wide: [row.pessimista, row.otimista], narrow: [row.conservador, row.moderado] }));
  const lastIndex = rows.length - 1;
  const last = rows[lastIndex]!;
  const hitsIndex = rows.findIndex((row) => row.otimista >= target);
  const hitsMonth = hitsIndex === -1 ? null : rows[hitsIndex];

  const summary = [
    `Gráfico de área com a faixa de receita acumulada de 2027 entre quatro cenários discretos.`,
    `Em ${formatMonthShort(last.month)}: de ${formatCurrencyCompact(last.pessimista)} a ${formatCurrencyCompact(last.otimista)}; moderado ${formatCurrencyCompact(last.moderado)}, abaixo da meta de ${formatCurrencyCompact(target)}.`,
    hitsMonth ? `Só o otimista supera a meta, em ${formatMonthShort(hitsMonth.month)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderEnd = (text: string, color: string) => {
    const Renderer = ({ x, y, index }: LabelProps): ReactElement | null => {
      if (index !== lastIndex) return null;
      return (
        <text className="font-display" dominantBaseline="central" fill={color} fontSize={11} fontWeight={500} style={HALO} textAnchor="start" x={Number(x) + 8} y={Number(y)}>
          {text}
        </text>
      );
    };
    return Renderer;
  };

  const renderTargetLabel = ({ viewBox }: ViewBoxProps): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0)} y={MARGIN.top - 12}>
      meta <tspan className="font-display">{formatCurrencyCompact(target)}</tspan>
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Faixa entre <span className="kpi-number font-semibold text-text-primary">{formatCurrencyCompact(last.pessimista)}</span> e{' '}
        <span className="kpi-number font-semibold text-text-primary">{formatCurrencyCompact(last.otimista)}</span> até {formatMonthShort(last.month)}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis axisLine={false} dataKey="month" interval={1} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatMonthShort} tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} domain={[...DOMAIN]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatCurrencyAxis} ticks={[...TICKS]} width={VALUE_AXIS_WIDTH} />
            <ReferenceLine ifOverflow="extendDomain" label={renderTargetLabel} stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1} y={target} />
            <Area dataKey="wide" fill={WIDE_FILL} fillOpacity={WIDE_OPACITY} isAnimationActive={animate} stroke="none" />
            <Area dataKey="narrow" fill={WIDE_FILL} fillOpacity={NARROW_OPACITY} isAnimationActive={animate} stroke="none" />
            <Line dataKey="otimista" dot={false} isAnimationActive={false} stroke="var(--text-muted)" strokeWidth={1}>
              <LabelList content={renderEnd(`otimista ${formatCurrencyCompact(last.otimista)}`, 'var(--text-muted)')} dataKey="otimista" />
            </Line>
            <Line dataKey="moderado" dot={false} isAnimationActive={false} stroke="var(--text-secondary)" strokeWidth={1}>
              <LabelList content={renderEnd(`moderado ${formatCurrencyCompact(last.moderado)}`, 'var(--text-secondary)')} dataKey="moderado" />
            </Line>
            <Line dataKey="conservador" dot={false} isAnimationActive={false} stroke="var(--text-secondary)" strokeWidth={1}>
              <LabelList content={renderEnd(`conservador ${formatCurrencyCompact(last.conservador)}`, 'var(--text-secondary)')} dataKey="conservador" />
            </Line>
            <Line dataKey="pessimista" dot={false} isAnimationActive={false} stroke="var(--text-muted)" strokeWidth={1}>
              <LabelList content={renderEnd(`pessimista ${formatCurrencyCompact(last.pessimista)}`, 'var(--text-muted)')} dataKey="pessimista" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
