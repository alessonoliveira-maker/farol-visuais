import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatDate, formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyInvestmentLeads } from './data';

/**
 * Dispersão do investimento semanal em mídia paga contra os leads qualificados da mesma
 * semana, com uma reta de mínimos quadrados que traduz o retorno marginal. A reta só é
 * desenhada quando a relação passa o piso de R² e de tamanho de amostra.
 */
export interface InvestmentLeadsTrendProps {
  readonly data?: readonly WeeklyInvestmentLeads[];
  readonly height?: number;
  readonly className?: string;
}

interface ChartRow {
  readonly x: number;
  readonly y?: number;
  readonly tendencia?: number;
  readonly week?: string;
  readonly investimentoReais?: number;
  readonly leadsQualificados?: number;
}

interface LinearFit {
  readonly intercepto: number;
  readonly inclinacao: number;
  readonly r2: number;
  readonly n: number;
}

const MARGIN = { top: 40, right: 16, bottom: 8, left: 4 } as const;
const DOMAIN_X: readonly [number, number] = [0, 60_000];
const TICKS_X = [0, 15_000, 30_000, 45_000, 60_000] as const;
const DOMAIN_Y: readonly [number, number] = [0, 60];
const TICKS_Y = [0, 15, 30, 45, 60] as const;
const Y_AXIS_WIDTH = 64;
const POINT_FILL_OPACITY = 0.7;
/** Piso da regra 5 da família: sem R² e n mínimos, a reta some e o rótulo explica o motivo. */
const R2_FLOOR = 0.3;
const N_FLOOR = 10;

/** Mínimos quadrados em TypeScript: inclinação, intercepto e R² de uma nuvem de pontos. */
function minimosQuadrados(pontos: readonly { readonly x: number; readonly y: number }[]): LinearFit | null {
  const n = pontos.length;
  if (n < 2) return null;
  const mx = pontos.reduce((soma, p) => soma + p.x, 0) / n;
  const my = pontos.reduce((soma, p) => soma + p.y, 0) / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const p of pontos) {
    sxx += (p.x - mx) ** 2;
    sxy += (p.x - mx) * (p.y - my);
    syy += (p.y - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  const inclinacao = sxy / sxx;
  return { intercepto: my - inclinacao * mx, inclinacao, r2: (sxy * sxy) / (sxx * syy), n };
}

export default function InvestmentLeadsTrend({ data = defaultData, height, className }: InvestmentLeadsTrendProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não houve investimento medido no período.</span>
      </div>
    );
  }

  const pontos: readonly ChartRow[] = data.map((row) => ({
    x: row.investimentoReais,
    y: row.leadsQualificados,
    week: row.week,
    investimentoReais: row.investimentoReais,
    leadsQualificados: row.leadsQualificados,
  }));
  const fit = minimosQuadrados(pontos.map((p) => ({ x: p.x, y: p.y ?? 0 })));
  const passaPiso = fit !== null && fit.r2 >= R2_FLOOR && fit.n >= N_FLOOR;
  const x0 = Math.min(...pontos.map((p) => p.x));
  const x1 = Math.max(...pontos.map((p) => p.x));
  const reta: readonly ChartRow[] =
    fit && passaPiso ? [x0, x1].map((x) => ({ x, tendencia: fit.intercepto + fit.inclinacao * x })) : [];
  const rows: readonly ChartRow[] = [...pontos, ...reta];

  const inclinacaoPorMil = fit ? fit.inclinacao * 1000 : 0;
  const sinal = inclinacaoPorMil >= 0 ? '+' : '−';
  const conclusao =
    fit && passaPiso
      ? `Cada mil reais a mais de investimento veio com cerca de ${formatDecimal(Math.abs(inclinacaoPorMil), 1)} lead qualificado a mais.`
      : `Sem relação linear detectável entre investimento e leads qualificados (R² ${fit ? formatDecimal(fit.r2, 2) : '0,00'}; n ${String(fit?.n ?? pontos.length)}).`;
  const summary =
    `Gráfico de dispersão com investimento semanal em mídia paga e leads qualificados de ${String(pontos.length)} semanas` +
    `${fit && passaPiso ? ', com reta de tendência' : ''}. ${conclusao}`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const entry = props.payload?.find((item) => item.dataKey === 'y');
    const point = entry?.payload as ChartRow | undefined;
    if (!point || point.week === undefined || point.investimentoReais === undefined || point.leadsQualificados === undefined) return null;
    const items = [
      { dataKey: 'investimentoReais', name: 'Investimento', value: formatCurrencyCompact(point.investimentoReais) },
      { dataKey: 'leadsQualificados', name: 'Leads qualificados', value: formatInt(point.leadsQualificados) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={formatDate(point.week)} labelFormat="text" payload={items} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Cada ponto é uma semana; <span className="tabular-nums">{formatInt(pontos.length)}</span> exibidas
      </p>
      <div className="relative min-h-0 flex-1">
        {fit && passaPiso ? (
          <div
            aria-hidden
            className="pointer-events-none absolute right-1 top-1 max-w-[70%] rounded-md bg-surface-overlay px-2 py-1 text-right"
          >
            <p className="font-display text-xs font-semibold text-text-primary">
              {`${sinal}${formatDecimal(Math.abs(inclinacaoPorMil), 1)} lead por R$ 1 mil`}
            </p>
            <p className="text-[0.6875rem] text-text-muted">{`R² ${formatDecimal(fit.r2, 2)} · n ${String(fit.n)}`}</p>
          </div>
        ) : null}
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              dataKey="x"
              domain={DOMAIN_X}
              name="Investimento"
              tickFormatter={formatCurrencyAxis}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              dataKey="y"
              domain={DOMAIN_Y}
              name="Leads qualificados"
              tickFormatter={(value: number) => `${formatInt(value)} leads`}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {reta.length > 0 ? (
              <Line
                activeDot={false}
                dataKey="tendencia"
                dot={false}
                isAnimationActive={animate}
                legendType="none"
                stroke="var(--text-muted)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            ) : null}
            <Scatter dataKey="y" fill="var(--chart-1)" fillOpacity={POINT_FILL_OPACITY} isAnimationActive={animate} legendType="none" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {!passaPiso ? (
        <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
          {conclusao}
        </p>
      ) : null}
    </div>
  );
}
