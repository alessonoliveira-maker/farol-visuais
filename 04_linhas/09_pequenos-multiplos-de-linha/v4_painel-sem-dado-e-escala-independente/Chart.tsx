import { Filter } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginMonthly } from './data';

/**
 * Um LineChart por origem, cada um com a própria escala de valor: a pergunta é a forma da curva
 * de cada origem, não o nível absoluto entre elas, e por isso a escala comum do modelo 09 fica de
 * fora aqui de propósito, com o texto abaixo do cabeçalho dizendo o teto de cada painel. A origem
 * sem nenhuma coleta no período vira um bloco de estado vazio no próprio painel, não a peça
 * inteira, e o mesmo array de meses (com nulo) mantém o cursor sincronizado por índice.
 */
export interface OriginMonthlySmallMultiplesProps {
  readonly data?: readonly OriginMonthly[];
  readonly height?: number;
  readonly className?: string;
}

const COLS = 4;
/**
 * Uma só margem para todo painel: o XAxis fica sempre presente (nunca `hide`), só a rotulagem
 * muda entre linhas, então a altura reservada para o eixo é igual em cima e embaixo.
 */
const MARGIN = { top: 4, right: 8, bottom: 4, left: 0 } as const;
const Y_AXIS_WIDTH = 40;
/** Sincroniza o cursor entre os 8 painéis pelo índice do array, que carrega `null` no mês sem coleta. */
const SYNC_ID = 'origens-escala-independente';
/** Arredonda o teto do eixo de cada painel para a dezena acima do maior valor da própria origem. */
const ROUND_STEP = 10;

export default function OriginMonthlySmallMultiples({
  data = defaultData,
  height,
  className,
}: OriginMonthlySmallMultiplesProps) {
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
        <span>Nenhuma origem neste recorte: não houve leads no período.</span>
      </div>
    );
  }

  const months = data[0]?.points.map((point) => point.month) ?? [];
  const tickMonths = months.length > 0 ? [months[0] ?? '', months[months.length - 1] ?? ''] : [];
  const withStats = data.map((origin) => {
    const values = origin.points.map((point) => point.value).filter((value): value is number => value !== null);
    const domainMax = values.length > 0 ? Math.ceil((Math.max(...values) * 1.05) / ROUND_STEP) * ROUND_STEP : 0;
    return { origin, values, domainMax, last: origin.points[origin.points.length - 1] };
  });
  const ranked = [...withStats].sort((a, b) => b.domainMax - a.domainMax);
  const missing = ranked.find((row) => row.values.length === 0);

  const summary =
    `Grade com ${String(data.length)} gráficos de linha, um por origem de lead, de ${months[0] ?? ''} a ${months[months.length - 1] ?? ''}, cada um com a própria escala de valor porque o assunto é a forma da curva.` +
    (missing ? ` ${missing.origin.name} não tem nenhum lead coletado no período.` : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Escala própria por painel: o teto abaixo do nome é o maior valor da própria origem, não um teto comum.
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-3">
        {ranked.map(({ origin, values, domainMax, last }, index) => {
          const isBottomRow = index >= ranked.length - COLS;
          const hasData = values.length > 0;
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={origin.id}>
              <div className="mb-0.5 flex shrink-0 items-baseline justify-between gap-2">
                <span className="truncate text-xs leading-tight font-medium text-text-secondary">{origin.name}</span>
                <span className="kpi-number shrink-0 text-xs font-semibold text-text-primary">
                  {hasData && last?.value !== null && last?.value !== undefined ? formatInt(last.value) : ''}
                </span>
              </div>
              <div className="mb-1 shrink-0 text-[0.6875rem] text-text-muted">
                {hasData ? `escala 0 a ${formatInt(domainMax)}` : 'sem coleta no período'}
              </div>
              <div className="min-h-0 flex-1">
                {hasData ? (
                  <ResponsiveContainer height="100%" width="100%">
                    <LineChart
                      accessibilityLayer={false}
                      data={[...origin.points]}
                      margin={MARGIN}
                      syncId={SYNC_ID}
                    >
                      <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
                      <XAxis
                        axisLine={false}
                        dataKey="month"
                        tick={isBottomRow ? { fill: 'var(--text-muted)', fontSize: 11 } : false}
                        tickFormatter={(value: string) => formatMonthShort(value)}
                        tickLine={false}
                        tickMargin={8}
                        ticks={tickMonths}
                      />
                      <YAxis
                        axisLine={false}
                        domain={[0, domainMax]}
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                        tickFormatter={(value: number) => formatInt(value)}
                        tickLine={false}
                        ticks={[0, domainMax]}
                        width={Y_AXIS_WIDTH}
                      />
                      <Tooltip
                        content={<ChartTooltip labelFormat="month" valueFormat="int" />}
                        cursor={{ stroke: 'var(--line-strong)' }}
                        isAnimationActive={false}
                      />
                      <Line
                        connectNulls={false}
                        dataKey="value"
                        dot={false}
                        isAnimationActive={animate}
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        type="linear"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    className="flex h-full w-full items-center gap-1.5 text-[0.6875rem] text-text-muted"
                    role="status"
                  >
                    <Filter aria-hidden className="size-3.5 shrink-0" />
                    <span>Sem coleta neste canal.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
