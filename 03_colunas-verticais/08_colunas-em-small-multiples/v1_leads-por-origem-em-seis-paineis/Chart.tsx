import { Filter } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginSeries } from './data';

/**
 * Pequenos múltiplos de colunas: um BarChart mínimo por origem, na mesma escala, para comparar a
 * forma de cada série (pico, queda, estabilidade) sem amontoar seis séries no mesmo eixo. Sem
 * rótulo por coluna, porque em painel deste tamanho o número por barra colide com o vizinho; o
 * total do período fica uma vez no cabeçalho do painel e o valor exato mora na dica ao passar o
 * mouse. Eixo de meses só na última linha da grade.
 */
export interface OriginSmallMultiplesProps {
  readonly data?: readonly OriginSeries[];
  readonly height?: number;
  readonly className?: string;
}

const GRID_COLS = 3;
const BAR_MAX = 22;
const BAR_CATEGORY_GAP = '32%';
const BAR_FILL = 'var(--line-strong)';
const DOMAIN_STEP = 10;

function total(row: OriginSeries): number {
  return row.monthly.reduce((sum, point) => sum + point.value, 0);
}

function niceCeil(value: number, step: number): number {
  return Math.max(step, Math.ceil(value / step) * step);
}

export default function OriginSmallMultiples({ data = defaultData, height, className }: OriginSmallMultiplesProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [...data].sort((a, b) => total(b) - total(a));

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não houve lead com origem atribuída no período.</span>
      </div>
    );
  }

  const maxValue = Math.max(...rows.flatMap((row) => row.monthly.map((point) => point.value)));
  const domainMax = niceCeil(maxValue, DOMAIN_STEP);
  const rowCount = Math.max(1, Math.ceil(rows.length / GRID_COLS));
  const bottomRowStart = (rowCount - 1) * GRID_COLS;
  const leader = rows[0];
  const last = rows[rows.length - 1];

  const summary = [
    `Pequenos múltiplos de colunas com leads mensais de ${String(rows.length)} origens, na mesma escala, ordenados pelo total do período.`,
    leader ? `${leader.name} lidera com ${formatInt(total(leader))} leads.` : '',
    last && last.id !== leader?.id ? `${last.name} é a menor, com ${formatInt(total(last))}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-3">
        {rows.map((row, index) => {
          const showAxis = index >= bottomRowStart;
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={row.id}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{row.name}</p>
                <p className="kpi-number shrink-0 text-xs font-medium text-text-muted">{formatInt(total(row))}</p>
              </div>
              <div className="mt-1 min-h-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart
                    accessibilityLayer={false}
                    barCategoryGap={BAR_CATEGORY_GAP}
                    data={[...row.monthly]}
                    margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
                  >
                    <XAxis
                      axisLine={false}
                      dataKey="month"
                      /* EIX-9: nunca `hide`, o Recharts so reserva altura de eixo pros que nao
                         estao escondidos, o que fazia o corpo dos paineis de cima crescer mais que
                         o dos de baixo na mesma escala. O eixo fica sempre presente e so o tique
                         some (`tick={false}`), que zera o texto sem zerar o espaco reservado. */
                      interval={0}
                      tick={showAxis ? { fill: 'var(--text-muted)', fontSize: 11 } : false}
                      tickFormatter={formatMonthShort}
                      tickLine={false}
                      tickMargin={4}
                    />
                    <YAxis allowDecimals={false} domain={[0, domainMax]} hide />
                    <Tooltip
                      content={<ChartTooltip labelFormat="month" valueFormat="int" />}
                      cursor={{ fill: 'var(--line-subtle)' }}
                      isAnimationActive={false}
                    />
                    <Bar dataKey="value" fill={BAR_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
