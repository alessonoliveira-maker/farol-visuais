import { Filter } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginWeek } from './data';

/**
 * Pequenos múltiplos de área: uma origem por painel, todos na mesma escala, para a forma
 * semanal de cada camada aparecer sem que a pilha esconda quem cresce ou encolhe no meio.
 */
export interface OriginSmallMultiplesProps {
  readonly data?: readonly OriginWeek[];
  readonly height?: number;
  readonly className?: string;
}

const GRID_COLUMNS = 4;
const GRID_TARGET_COUNT = 3;
/** Frações do eixo do tempo para os 4 tiques do rodapé, sempre longe das duas bordas. */
const X_TICK_FRACTIONS = [0.14, 0.4, 0.66, 0.92] as const;

function computeNiceTicks(maxValue: number, targetCount = GRID_TARGET_COUNT): readonly number[] {
  if (maxValue <= 0) return [0, 1];
  const roughStep = maxValue / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const topTick = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= topTick + step / 2; value += step) {
    ticks.push(Math.round(value));
  }
  return ticks;
}

interface Panel {
  readonly origin: string;
  readonly total: number;
  readonly rows: readonly OriginWeek[];
}

export default function OriginSmallMultiples({ data = defaultData, height, className }: OriginSmallMultiplesProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não houve lead registrado no período.</span>
      </div>
    );
  }

  const byOrigin = new Map<string, OriginWeek[]>();
  for (const row of data) {
    const list = byOrigin.get(row.origin) ?? [];
    list.push(row);
    byOrigin.set(row.origin, list);
  }

  const panels: Panel[] = [...byOrigin.entries()]
    .map(([origin, rows]) => ({ origin, rows, total: rows.reduce((sum, row) => sum + row.leads, 0) }))
    .sort((a, b) => b.total - a.total);

  const maxValue = Math.max(...data.map((row) => row.leads));
  const ticks = computeNiceTicks(maxValue);
  const domainTop = ticks[ticks.length - 1] ?? maxValue;
  const rowCount = Math.ceil(panels.length / GRID_COLUMNS);
  /** Semanas interiores da série (nunca a primeira nem a última): evita rótulo cortado na borda do painel. */
  const weekTicks = X_TICK_FRACTIONS.map((fraction) => {
    const weeks = panels[0]?.rows ?? [];
    const index = Math.round(fraction * (weeks.length - 1));
    return weeks[index]?.week ?? '';
  });

  const leader = panels[0];
  const summary = [
    `Pequenos múltiplos de área com leads semanais de ${String(panels.length)} origens em 2025, na mesma escala.`,
    leader ? `A maior é ${leader.origin}, com ${formatInt(leader.total)} leads no ano.` : '',
    panels.length > 1 ? `A menor é ${panels[panels.length - 1]?.origin ?? ''}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <div
        className="grid h-full w-full gap-3"
        style={{ gridTemplateColumns: `repeat(${String(GRID_COLUMNS)}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${String(rowCount)}, minmax(0, 1fr))` }}
      >
        {panels.map((panel, index) => {
          const isBottomRow = index >= panels.length - GRID_COLUMNS;
          const isLeftColumn = index % GRID_COLUMNS === 0;
          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={panel.origin}>
              <p aria-hidden className="mb-1 shrink-0 truncate text-[0.6875rem] text-text-secondary">
                <span className="font-medium text-text-primary">{panel.origin}</span> · {formatInt(panel.total)} leads
              </p>
              <div className="min-h-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  <AreaChart accessibilityLayer={false} data={[...panel.rows]} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
                    <XAxis
                      axisLine={false}
                      dataKey="week"
                      hide={!isBottomRow}
                      interval={0}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      tickFormatter={formatMonthShort}
                      tickLine={false}
                      tickMargin={4}
                      ticks={weekTicks}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      domain={[0, domainTop]}
                      hide={!isLeftColumn}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      tickFormatter={formatInt}
                      tickLine={false}
                      ticks={[...ticks]}
                      width={30}
                    />
                    <Area
                      dataKey="leads"
                      dot={false}
                      fill="var(--chart-1)"
                      fillOpacity={0.18}
                      isAnimationActive={false}
                      name="leads"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
