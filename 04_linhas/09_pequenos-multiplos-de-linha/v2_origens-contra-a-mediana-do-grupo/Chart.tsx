import { Filter } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginWeekly } from './data';

/**
 * Um LineChart por origem, todos com o mesmo eixo x e o mesmo syncId, contra uma segunda linha
 * tracejada com a mediana semanal do grupo inteiro. A escala de valor é comum às seis origens,
 * porque a pergunta é de nível (acima ou abaixo da mediana), e escala por painel esconderia
 * justamente essa comparação.
 */
export interface OriginWeeklySmallMultiplesProps {
  readonly data?: readonly OriginWeekly[];
  readonly height?: number;
  readonly className?: string;
}

const COLS = 3;
/**
 * Uma só margem para todo painel: o XAxis fica sempre presente (nunca `hide`), só a rotulagem
 * muda entre linhas, então a altura reservada para o eixo é igual em cima e embaixo.
 */
const MARGIN = { top: 4, right: 8, bottom: 4, left: 0 } as const;
const Y_AXIS_WIDTH = 32;
const SYNC_ID = 'leads-por-origem';
/** Arredonda o teto do eixo comum para a dezena acima do maior valor do conjunto. */
const ROUND_STEP = 10;

/**
 * Mediana da semana, ou `null` quando nenhuma origem tem valor naquela semana.
 *
 * Zero é uma contagem de leads plausível, então a mediana zerada de uma lista vazia desce a linha
 * tracejada até a base do painel e afirma que o grupo inteiro fez zero lead, quando o que houve foi
 * semana sem medição. Devolvendo `null`, a referência some naquele ponto, que é o que a EIX-10 pede.
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) return sorted[mid] ?? null;
  return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

export default function OriginWeeklySmallMultiples({
  data = defaultData,
  height,
  className,
}: OriginWeeklySmallMultiplesProps) {
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

  const weeks = data[0]?.points.map((point) => point.week) ?? [];
  /**
   * A mediana é indexada pela semana, não pela posição do ponto no painel: origens com listas de
   * tamanhos diferentes casariam a semana de uma com a mediana de outra.
   */
  const medianByWeek = new Map<string, number | null>(
    weeks.map((week) => [
      week,
      median(data.flatMap((origin) => origin.points.find((point) => point.week === week)?.value ?? [])),
    ]),
  );
  const weeksWithoutMedian = weeks.filter((week) => (medianByWeek.get(week) ?? null) === null);
  const allValues = [
    ...data.flatMap((origin) => origin.points.map((point) => point.value)),
    ...[...medianByWeek.values()].filter((value): value is number => value !== null),
  ];
  const rawMax = allValues.length > 0 ? Math.max(...allValues) : 0;
  const domainMax = Math.ceil((rawMax * 1.05) / ROUND_STEP) * ROUND_STEP;
  const yTicks = [0, domainMax];
  const tickWeeks = weeks.length > 0 ? [weeks[0] ?? '', weeks[weeks.length - 1] ?? ''] : [];

  const withLast = data.map((origin) => ({ origin, last: origin.points[origin.points.length - 1] }));
  const ranked = [...withLast].sort((a, b) => (b.last?.value ?? 0) - (a.last?.value ?? 0));
  const leader = ranked[0];
  const lastWeek = weeks[weeks.length - 1];

  const summary =
    `Grade com ${String(data.length)} gráficos de linha de leads semanais por origem, de ${weeks[0] ?? ''} a ${lastWeek ?? ''}, cada um contra a mediana tracejada do grupo, na mesma escala de 0 a ${formatInt(domainMax)} leads.` +
    (leader?.last ? ` ${leader.origin.name} lidera na última semana, com ${formatInt(leader.last.value)} leads.` : '') +
    (weeksWithoutMedian.length === 0
      ? ''
      : ` Em ${formatInt(weeksWithoutMedian.length)} semanas nenhuma origem foi medida e a mediana fica ${formatUnavailable()}.`);

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
        <span>
          Painéis ordenados do maior para o menor volume em {lastWeek ? formatDate(lastWeek) : ''}, escala comum de{' '}
          <span className="kpi-number font-medium text-text-primary">0</span> a{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(domainMax)}</span>.
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-0 w-4 border-t-2" style={{ borderColor: 'var(--chart-1)' }} />
          origem
          <span
            aria-hidden
            className="h-0 w-4 border-t-2 border-dashed"
            style={{ borderColor: 'var(--line-strong)' }}
          />
          mediana do grupo
        </span>
        {/* A quebra da linha tracejada é discreta por natureza; só esta nota diz que ali houve
            semana sem nenhuma origem medida, e não mediana rente ao zero. */}
        {weeksWithoutMedian.length === 0 ? null : (
          <span className="tabular-nums text-text-muted">
            {`mediana ${formatUnavailable()} em ${formatInt(weeksWithoutMedian.length)} ${weeksWithoutMedian.length === 1 ? 'semana' : 'semanas'} sem origem medida`}
          </span>
        )}
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-3">
        {ranked.map(({ origin, last }, index) => {
          const isBottomRow = index >= ranked.length - COLS;
          const panelData = origin.points.map((point) => ({
            week: point.week,
            value: point.value,
            median: medianByWeek.get(point.week) ?? null,
          }));
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={origin.id}>
              <div className="mb-1 flex shrink-0 items-baseline justify-between gap-2">
                <span className="truncate text-xs leading-tight font-medium text-text-secondary">{origin.name}</span>
                <span className="kpi-number shrink-0 text-xs font-semibold text-text-primary">
                  {last ? formatInt(last.value) : ''}
                </span>
              </div>
              <div className="min-h-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart
                    accessibilityLayer={false}
                    data={panelData}
                    margin={MARGIN}
                    syncId={SYNC_ID}
                  >
                    <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
                    <XAxis
                      axisLine={false}
                      dataKey="week"
                      tick={isBottomRow ? { fill: 'var(--text-muted)', fontSize: 11 } : false}
                      tickFormatter={(value: string) => formatDate(value)}
                      tickLine={false}
                      tickMargin={8}
                      ticks={tickWeeks}
                    />
                    <YAxis
                      axisLine={false}
                      domain={[0, domainMax]}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      tickFormatter={(value: number) => formatInt(value)}
                      tickLine={false}
                      ticks={yTicks}
                      width={Y_AXIS_WIDTH}
                    />
                    <Tooltip
                      content={<ChartTooltip labelFormat="date" valueFormat="int" />}
                      cursor={{ stroke: CURSOR_COLOR }}
                      isAnimationActive={false}
                    />
                    {/* `connectNulls` desligado: semana sem nenhuma origem medida quebra a linha da
                        mediana, em vez de ligar os dois lados por cima do vazio (EIX-10). */}
                    <Line
                      connectNulls={false}
                      dataKey="median"
                      dot={false}
                      isAnimationActive={false}
                      stroke="var(--line-strong)"
                      strokeDasharray="4 4"
                      strokeWidth={1}
                      type="linear"
                    />
                    <Line
                      activeDot={{ r: 4 }}
                      dataKey="value"
                      dot={false}
                      isAnimationActive={animate}
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      type="linear"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
