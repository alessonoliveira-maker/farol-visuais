import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyPlatformSpend } from './data';

/**
 * Área 100% do investimento mensal em quatro plataformas fictícias: o Recharts normaliza o
 * desenho com stackOffset="expand", mas o payload continua absoluto, então o percentual de cada
 * camada é calculado aqui. A forma esconde o total investido; por isso o total do último mês
 * fica escrito na linha de leitura, para o leitor não ler queda onde houve só redistribuição.
 */
export interface PlatformShareAreaProps {
  readonly data?: readonly MonthlyPlatformSpend[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 10, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 48;
/** 12 meses: um tique a cada dois para não colar os rótulos (EIX-7 vale até 8 categorias). */
const TICK_INTERVAL = 1;
const PERCENT_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
const LAYER_STROKE = 'var(--surface-raised)';
/** Slots categóricos na ordem 1, 3, 6, 5 da COR-8: uma cor fixa por plataforma, vinda do dado. */
const LAYER_FILL: Record<keyof Omit<MonthlyPlatformSpend, 'month'>, string> = {
  diretoNorte: 'var(--chart-1)',
  buscaSul: 'var(--chart-3)',
  socialLeste: 'var(--chart-6)',
  parceirosOeste: 'var(--chart-5)',
};
const LAYER_LABEL: Record<keyof Omit<MonthlyPlatformSpend, 'month'>, string> = {
  diretoNorte: 'Direto Norte',
  buscaSul: 'Busca Sul',
  socialLeste: 'Social Leste',
  parceirosOeste: 'Parceiros Oeste',
};
const LAYER_KEYS = ['diretoNorte', 'buscaSul', 'socialLeste', 'parceirosOeste'] as const;
/**
 * Texto sobre marca colorida: `--accent-cyan-contrast` inverte com o tema e mede, contra
 * `--chart-1`, `--chart-3`, `--chart-6` e `--chart-5`, de 6,26 a 10,06 no escuro e de 5,39 a 6,18
 * no claro (mesma medição do molde `02_barras-horizontais/04`, que usa o mesmo par). A medição
 * vale só com a camada em opacidade cheia (LAYER_FILL_OPACITY = 1): com fillOpacity 0.9 a faixa
 * clareia contra o cartão e o par cai a 4,36:1 no claro sobre --chart-6, abaixo de AA (ACE-3).
 */
const ON_LAYER_TEXT = 'var(--accent-cyan-contrast)';
/** Camada cheia, sem mistura com o fundo: o texto sobre a marca depende da cor pura (ACE-3). */
const LAYER_FILL_OPACITY = 1;

/** Percentual inteiro que soma 100 pelo maior resto (NUM-2). */
function shareOfHundred(parts: readonly number[]): readonly number[] {
  const total = parts.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return parts.map(() => 0);
  const raw = parts.map((value) => (value / total) * 100);
  const floors = raw.map(Math.floor);
  let remainder = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  const result = [...floors];
  for (const { index } of order) {
    if (remainder <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    remainder -= 1;
  }
  return result;
}

export default function PlatformShareArea({ data = defaultData, height, className }: PlatformShareAreaProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há investimento para compor a participação.</span>
      </div>
    );
  }

  const last = data[data.length - 1];
  const first = data[0];
  const lastValues = last ? LAYER_KEYS.map((key) => last[key]) : LAYER_KEYS.map(() => 0);
  const lastTotal = lastValues.reduce((sum, value) => sum + value, 0);
  const lastShares = shareOfHundred(lastValues);
  const rawFractions = lastValues.map((value) => (lastTotal > 0 ? value / lastTotal : 0));
  let cumulative = 0;
  const midFractions = rawFractions.map((fraction) => {
    const mid = cumulative + fraction / 2;
    cumulative += fraction;
    return mid;
  });
  const leaderIndex = lastShares.reduce((best, share, index) => (share > (lastShares[best] ?? 0) ? index : best), 0);
  const leaderKey = LAYER_KEYS[leaderIndex];
  const leaderShareFirst = first ? shareOfHundred(LAYER_KEYS.map((key) => first[key]))[leaderIndex] : undefined;

  const summary = last
    ? `Área 100% com o investimento mensal em ${formatInt(LAYER_KEYS.length)} plataformas fictícias de mídia paga, ` +
      `de ${formatMonthShort(first?.month ?? last.month)} a ${formatMonthShort(last.month)} de 2026. ` +
      `${leaderKey ? LAYER_LABEL[leaderKey] : ''} lidera em ${formatMonthShort(last.month)} com ${formatPercent((lastShares[leaderIndex] ?? 0) / 100, 0)}` +
      `${leaderShareFirst !== undefined ? `, contra ${formatPercent(leaderShareFirst / 100, 0)} em ${formatMonthShort(first?.month ?? last.month)}` : ''}. ` +
      `Investimento total em ${formatMonthShort(last.month)}: ${formatCurrencyCompact(lastTotal)}.`
    : 'Área 100% do investimento mensal por plataforma.';

  const renderLayerLabel =
    (key: (typeof LAYER_KEYS)[number]) =>
    ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number } }): ReactElement | null => {
      const index = LAYER_KEYS.indexOf(key);
      const share = lastShares[index];
      if (share === undefined || share < 6) return null;
      return (
        <text
          className="font-display"
          dominantBaseline="central"
          fill={ON_LAYER_TEXT}
          fontSize={12}
          fontWeight={500}
          textAnchor="end"
          x={(viewBox?.x ?? 0) - 6}
          y={viewBox?.y ?? 0}
        >
          {`${LAYER_LABEL[key]} ${formatPercent(share / 100, 0)}`}
        </text>
      );
    };

  const reading =
    last && leaderKey
      ? {
          leaderName: LAYER_LABEL[leaderKey],
          leaderShare: formatPercent((lastShares[leaderIndex] ?? 0) / 100, 0),
          month: formatMonthShort(last.month),
          total: formatCurrencyCompact(lastTotal),
        }
      : null;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">{reading.leaderName}</span> lidera com{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.leaderShare}</span> em {reading.month}. Total
          investido: <span className="kpi-number font-medium text-text-primary">{reading.total}</span>
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart data={[...data]} margin={MARGIN} stackOffset="expand">
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              interval={TICK_INTERVAL}
              tickFormatter={formatMonthShort}
              tickMargin={8}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, 1]}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              ticks={[...PERCENT_TICKS]}
              width={VALUE_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="month" valueFormat="currencyCompact" />}
              cursor={{ stroke: 'var(--line-strong)' }}
              isAnimationActive={false}
            />
            {LAYER_KEYS.map((key) => (
              <Area
                dataKey={key}
                fill={LAYER_FILL[key]}
                fillOpacity={LAYER_FILL_OPACITY}
                isAnimationActive={animate}
                key={key}
                name={LAYER_LABEL[key]}
                stackId="investimento"
                stroke={LAYER_STROKE}
                strokeWidth={1.5}
                type="monotone"
              />
            ))}
            {last
              ? LAYER_KEYS.map((key, index) => (
                  <ReferenceDot
                    ifOverflow="extendDomain"
                    key={key}
                    label={renderLayerLabel(key)}
                    r={0}
                    x={last.month}
                    y={midFractions[index] ?? 0}
                  />
                ))
              : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
