import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type MonthlyPlatformInvestment } from './data';

/**
 * Investimento mensal em quatro plataformas de mídia, uma em destaque contra as demais em
 * neutro. A protagonista é desenhada por último (fica por cima nos cruzamentos), com halo no
 * rótulo; as neutras escrevem o próprio valor, que é a isenção de contraste do neutro de dado.
 */
export type PlatformKey = keyof Omit<MonthlyPlatformInvestment, 'month'>;

export interface PlatformHighlightProps {
  readonly data?: readonly MonthlyPlatformInvestment[];
  readonly highlightId?: PlatformKey;
  readonly height?: number;
  readonly className?: string;
}

const SERIES = [
  { key: 'buscaPaga', name: 'Busca paga' },
  { key: 'redeSocial', name: 'Rede social' },
  { key: 'redeProfissional', name: 'Rede profissional' },
  { key: 'programatica', name: 'Programática' },
] as const satisfies readonly { key: PlatformKey; name: string }[];

const DOMAIN: readonly [number, number] = [0, 80_000];
const DOMAIN_TICKS = [0, 20_000, 40_000, 60_000, 80_000] as const;
const MARGIN = { top: 16, right: 190, bottom: 0, left: 0 } as const;
const VALUE_LABEL_GAP = 8;
/** Mesma conta da ROT-2 usada em v1: ~7% da amplitude do eixo separa dois rótulos de ponta. */
const MIN_LABEL_GAP = (DOMAIN[1] - DOMAIN[0]) * 0.07;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

function spreadEndValues(entries: readonly { key: PlatformKey; value: number }[]): Map<PlatformKey, number> {
  const sorted = [...entries].sort((a, b) => a.value - b.value);
  const out = new Map<PlatformKey, number>();
  let floor = -Infinity;
  for (const entry of sorted) {
    const y = Math.max(entry.value, floor);
    out.set(entry.key, y);
    floor = y + MIN_LABEL_GAP;
  }
  return out;
}

export default function PlatformHighlight({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: PlatformHighlightProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const first = data[0];
  const last = data[data.length - 1];

  if (!first || !last) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não há investimento para comparar entre plataformas.
      </div>
    );
  }

  const lastIndex = data.length - 1;
  const nudged = spreadEndValues(SERIES.map((s) => ({ key: s.key, value: last[s.key] })));
  const rows = data.map((row, index) => {
    const labels: Record<string, number | null> = {};
    for (const s of SERIES) labels[`${s.key}LabelY`] = index === lastIndex ? (nudged.get(s.key) ?? null) : null;
    return { ...row, ...labels };
  });

  const highlight = SERIES.find((s) => s.key === highlightId) ?? SERIES[2];
  const growth = (last[highlight.key] - first[highlight.key]) / first[highlight.key];
  const ordered = [...SERIES.filter((s) => s.key !== highlight.key), highlight];

  const summary = `Gráfico de linhas com o investimento mensal em ${String(SERIES.length)} plataformas de mídia paga, de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}. ${highlight.name} lidera o crescimento, de ${formatCurrencyCompact(first[highlight.key])} para ${formatCurrencyCompact(last[highlight.key])}, +${formatPercent(growth, 0)}.`;

  const renderLabel = (series: { key: PlatformKey; name: string }, isHighlight: boolean) => {
    return ({ cx, cy }: DotItemDotProps) => {
      if (cx === undefined || cy === undefined) return null;
      const value = last[series.key];
      return (
        <text
          className="font-display"
          dominantBaseline="central"
          fill={isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontSize={12}
          fontWeight={isHighlight ? 700 : 500}
          key={series.key}
          style={HALO}
          x={cx + VALUE_LABEL_GAP}
          y={cy}
        >
          <tspan className="font-sans" fontWeight={isHighlight ? 700 : 500}>
            {series.name}{' '}
          </tspan>
          {formatCurrencyCompact(value)}
        </text>
      );
    };
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{highlight.name}</span> cresceu{' '}
        <span className="kpi-number font-medium text-text-primary">+{formatPercent(growth, 0)}</span> desde {formatMonthShort(first.month)}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={DOMAIN} tickFormatter={formatCurrencyAxis} tickMargin={8} ticks={[...DOMAIN_TICKS]} width={64} />
            <Tooltip
              content={<ChartTooltip valueFormat="currencyCompact" />}
              cursor={{ stroke: CURSOR_COLOR }}
              isAnimationActive={false}
              itemSorter={(item) => -(Number(item.value) || 0)}
            />
            {ordered.map((s) => (
              <Line
                activeDot={{ r: 4 }}
                dataKey={s.key}
                dot={false}
                isAnimationActive={animate}
                key={s.key}
                name={s.name}
                stroke={s.key === highlight.key ? 'var(--chart-1)' : 'var(--line-strong)'}
                strokeWidth={s.key === highlight.key ? 2.5 : 1}
                type="linear"
              />
            ))}
            {ordered.map((s) => (
              <Line
                activeDot={false}
                dataKey={`${s.key}LabelY`}
                dot={renderLabel(s, s.key === highlight.key)}
                isAnimationActive={false}
                key={`${s.key}-label`}
                legendType="none"
                stroke="none"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
