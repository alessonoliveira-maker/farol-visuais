import { ChevronRight, Filter } from 'lucide-react';
import { Fragment, useId, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, expandedIds as defaultExpandedIds, type ExecutiveDetail } from './data';

/**
 * Tabela de executivos com linha expansível: o resumo traz a receita do mês e o motivo de perda
 * que mais pesa, e o painel abre a série de 12 meses em linha (Recharts) mais a barra de motivos
 * em HTML, com o motivo dominante destacado. O painel só monta quando a linha abre.
 */
export interface ExecutiveLossPanelTableProps {
  readonly data?: readonly ExecutiveDetail[];
  readonly expandedIds?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

const PANEL_HEIGHT = 128;
const Y_AXIS_WIDTH = 56;

function shares(counts: readonly number[]): readonly number[] {
  const total = counts.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return counts.map(() => 0);
  const raw = counts.map((value) => (value / total) * 100);
  const floors = raw.map(Math.floor);
  let remainder = 100 - floors.reduce((sum, value) => sum + value, 0);
  const remainders = raw.map((value, index) => value - (floors[index] ?? 0));
  const order = [...raw.keys()].sort((a, b) => (remainders[b] ?? 0) - (remainders[a] ?? 0));
  const result = [...floors];
  for (const index of order) {
    if (remainder <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    remainder -= 1;
  }
  return result;
}

export default function ExecutiveLossPanelTable({
  data = defaultData,
  expandedIds = defaultExpandedIds,
  height,
  className,
}: ExecutiveLossPanelTableProps) {
  const [openIds, setOpenIds] = useState<readonly string[]>(expandedIds);
  const animate = useAnimateOnce();
  const baseId = useId();
  const style = height === undefined ? undefined : { height };

  const rows = useMemo(
    () =>
      data.map((executive) => {
        const percentages = shares(executive.reasons.map((reason) => reason.count));
        const dominantIndex = executive.reasons.reduce(
          (best, reason, index) => (reason.count > (executive.reasons[best]?.count ?? -1) ? index : best),
          0,
        );
        return { executive, percentages, dominantIndex };
      }),
    [data],
  );

  function toggle(id: string) {
    setOpenIds((current) => (current.includes(id) ? current.filter((openId) => openId !== id) : [...current, id]));
  }

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte.</span>
      </div>
    );
  }

  const summary = `Tabela com linha expansível de ${String(rows.length)} executivos, com a receita do mês e o motivo de perda dominante. Abrir uma linha mostra a série de receita dos últimos 12 meses e a distribuição completa dos motivos de perda.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-md border border-line-subtle">
        <table className="w-full min-w-0 border-collapse text-xs">
          <thead>
            <tr className="border-b border-line-subtle bg-surface-overlay/60">
              <th aria-label="Expandir" className="w-7 px-2 py-1.5" scope="col" />
              <th className="px-2 py-1.5 text-left text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Executivo
              </th>
              <th className="px-2 py-1.5 text-right text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Receita do mês
              </th>
              <th className="px-2 py-1.5 text-left text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Motivo principal de perda
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ executive, percentages, dominantIndex }) => {
              const isOpen = openIds.includes(executive.id);
              const panelId = `${baseId}-panel-${executive.id}`;
              const current = executive.revenueSeries.at(-1);
              const dominant = executive.reasons[dominantIndex];
              const dominantShare = percentages[dominantIndex] ?? 0;
              return (
                <Fragment key={executive.id}>
                  <tr className="border-b border-line-subtle/60 last:border-0">
                    <td className="px-2 py-1.5 align-top">
                      <button
                        aria-controls={panelId}
                        aria-expanded={isOpen}
                        className="flex size-5 items-center justify-center rounded text-text-muted hover:text-text-primary"
                        onClick={() => {
                          toggle(executive.id);
                        }}
                        type="button"
                      >
                        <ChevronRight aria-hidden className={cn('size-3.5 transition-transform', isOpen && 'rotate-90')} />
                      </button>
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <span className="block font-medium text-text-primary">{executive.name}</span>
                      <span className="block text-[0.6875rem] text-text-muted">receita mensal e motivos de perda</span>
                    </td>
                    <td className="px-2 py-1.5 text-right align-top font-display text-text-primary tabular-nums">
                      {current ? formatCurrencyCompact(current.value) : '—'}
                    </td>
                    <td className="px-2 py-1.5 align-top text-text-secondary">
                      {dominant ? (
                        <>
                          <span className="block">{dominant.reason}</span>
                          <span className="block text-[0.6875rem] text-text-muted">{`${String(dominantShare)}% das perdas`}</span>
                        </>
                      ) : (
                        <span className="text-text-muted">sem perdas no período</span>
                      )}
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr className="border-b border-line-subtle/60 bg-surface-sunken/40 last:border-0">
                      <td className="px-2 py-2" colSpan={4} id={panelId}>
                        <div className="grid grid-cols-2 gap-4">
                          <div style={{ height: PANEL_HEIGHT }}>
                            <ResponsiveContainer height="100%" width="100%">
                              <LineChart data={[...executive.revenueSeries]} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                                <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
                                <XAxis
                                  {...AXIS_PROPS}
                                  dataKey="month"
                                  interval={2}
                                  tickFormatter={(value: string) => formatMonthShort(value)}
                                  tickMargin={8}
                                />
                                <YAxis {...AXIS_PROPS} domain={[0, 'dataMax']} tickFormatter={(value: number) => formatCurrencyAxis(value)} width={Y_AXIS_WIDTH} />
                                <Line
                                  dataKey="value"
                                  dot={false}
                                  isAnimationActive={animate}
                                  stroke="var(--chart-1)"
                                  strokeWidth={2}
                                  type="monotone"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex flex-col justify-center gap-1.5">
                            {executive.reasons.map((reason, index) => (
                              <div className="flex items-center gap-2" key={reason.reason}>
                                <div className="h-3 min-w-0 flex-1 rounded-sm bg-surface-sunken">
                                  <div
                                    className={cn('h-full rounded-sm', index === dominantIndex ? 'bg-chart-1' : 'bg-line-strong')}
                                    style={{ width: `${String(percentages[index] ?? 0)}%` }}
                                  />
                                </div>
                                <span
                                  className={cn(
                                    'w-40 shrink-0 truncate',
                                    index === dominantIndex ? 'font-semibold text-text-primary' : 'text-text-secondary',
                                  )}
                                >
                                  {reason.reason}
                                </span>
                                <span className="w-9 shrink-0 text-right font-display tabular-nums text-text-secondary">{`${String(percentages[index] ?? 0)}%`}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
