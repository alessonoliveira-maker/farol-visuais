import { Filter } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type OriginSeries } from './data';

/**
 * A mesma grade de pequenos múltiplos com uma origem em foco: o painel selecionado ganha a cor de
 * destaque e o nome em peso maior, os outros cinco seguem em neutro na mesma escala. O cursor anda
 * junto nos seis painéis (syncId), então passar o mouse em qualquer coluna abre a dica no mesmo mês
 * de todos.
 */
export interface OriginFocusSmallMultiplesProps {
  readonly data?: readonly OriginSeries[];
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

const GRID_COLS = 3;
const BAR_MAX = 22;
const BAR_CATEGORY_GAP = '32%';
const HIGHLIGHT_FILL = 'var(--chart-1)';
const NEUTRAL_FILL = 'var(--line-strong)';
const DOMAIN_STEP = 10;
const SYNC_ID = 'origin-focus';

function total(row: OriginSeries): number {
  return row.monthly.reduce((sum, point) => sum + point.value, 0);
}

function niceCeil(value: number, step: number): number {
  return Math.max(step, Math.ceil(value / step) * step);
}

export default function OriginFocusSmallMultiples({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: OriginFocusSmallMultiplesProps) {
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
  const focused = rows.find((row) => row.id === highlightId);
  const focusRank = focused ? rows.findIndex((row) => row.id === highlightId) + 1 : null;

  const summary = [
    `Pequenos múltiplos de colunas com leads mensais de ${String(rows.length)} origens, na mesma escala.`,
    focused && focusRank
      ? `${focused.name} está em foco, ${String(focusRank)}º de ${String(rows.length)} no total do período, com ${formatInt(total(focused))} leads.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-3">
        {rows.map((row, index) => {
          const showAxis = index >= bottomRowStart;
          const isFocus = row.id === highlightId;
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={row.id}>
              <div className="flex items-baseline justify-between gap-2">
                <p
                  className={cn(
                    'min-w-0 truncate text-xs',
                    isFocus ? 'font-bold text-text-primary' : 'font-medium text-text-secondary',
                  )}
                >
                  {row.name}
                </p>
                <p
                  className={cn(
                    'kpi-number shrink-0 text-xs',
                    isFocus ? 'font-bold text-text-primary' : 'font-medium text-text-muted',
                  )}
                >
                  {formatInt(total(row))}
                </p>
              </div>
              <div className="mt-1 min-h-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart
                    accessibilityLayer={false}
                    barCategoryGap={BAR_CATEGORY_GAP}
                    data={[...row.monthly]}
                    margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
                    syncId={SYNC_ID}
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
                    <Bar
                      dataKey="value"
                      fill={isFocus ? HIGHLIGHT_FILL : NEUTRAL_FILL}
                      isAnimationActive={animate}
                      maxBarSize={BAR_MAX}
                      radius={[2, 2, 0, 0]}
                    />
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
