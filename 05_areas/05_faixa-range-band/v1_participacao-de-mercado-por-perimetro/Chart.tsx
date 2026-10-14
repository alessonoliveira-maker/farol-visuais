import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, LabelList, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MarketShareMonth } from './data';

/**
 * Faixa entre o perímetro restrito e o perímetro amplo de participação de mercado, sem linha
 * central: a saída é sempre o intervalo inteiro, nunca um número só. As bordas nascem
 * normalizadas, mínimo e máximo calculados antes do render, para a faixa nunca inverter caso
 * um perímetro futuro ultrapasse o outro.
 */
export interface MarketShareRangeProps {
  readonly data?: readonly MarketShareMonth[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 12, right: 96, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 44;
const DOMAIN: readonly [number, number] = [0, 0.24];
const TICKS = [0, 0.06, 0.12, 0.18, 0.24] as const;
const BAND_FILL = 'var(--line-strong)';
const BAND_OPACITY = 0.32;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface BandRow extends MarketShareMonth {
  readonly band: readonly [number, number];
}

/** Normaliza a faixa: nunca inverte, mesmo se um mês futuro trouxer o restrito acima do amplo. */
function normalizeBand(a: number, b: number): readonly [number, number] {
  return a <= b ? [a, b] : [b, a];
}

export default function MarketShareRange({ data = defaultData, height, className }: MarketShareRangeProps) {
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

  const rows: readonly BandRow[] = data.map((row) => ({ ...row, band: normalizeBand(row.restricted, row.broad) }));
  const lastIndex = rows.length - 1;
  const last = rows[lastIndex]!;
  const first = rows[0]!;

  const summary = [
    `Gráfico de área com a faixa de participação de mercado em Operações Estruturadas de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}, entre o perímetro restrito e o amplo, sem linha central.`,
    `Em ${formatMonthShort(last.month)}: ${formatPercent(last.restricted, 1)} no perímetro restrito e ${formatPercent(last.broad, 1)} no amplo.`,
  ].join(' ');

  const renderEnd = (text: string) => {
    const Renderer = ({ x, y, index }: LabelProps): ReactElement | null => {
      if (index !== lastIndex) return null;
      return (
        <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="start" x={Number(x) + 10} y={Number(y)}>
          {text}
        </text>
      );
    };
    return Renderer;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-muted">
        Faixa sombreada: do perímetro restrito ao perímetro amplo, sem estimativa central.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={1} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[...DOMAIN]} tickFormatter={(value: number) => formatPercent(value, 0)} ticks={[...TICKS]} width={VALUE_AXIS_WIDTH} />
            <Area dataKey="band" fill={BAND_FILL} fillOpacity={BAND_OPACITY} isAnimationActive={animate} stroke="none" />
            <Line dataKey="broad" dot={false} isAnimationActive={false} stroke="none" strokeWidth={0}>
              <LabelList content={renderEnd(`amplo ${formatPercent(last.broad, 1)}`)} dataKey="broad" />
            </Line>
            <Line dataKey="restricted" dot={false} isAnimationActive={false} stroke="none" strokeWidth={0}>
              <LabelList content={renderEnd(`restrito ${formatPercent(last.restricted, 1)}`)} dataKey="restricted" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
