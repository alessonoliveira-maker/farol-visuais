import { ChevronRight, Filter } from 'lucide-react';
import { Fragment, useId, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatUnavailable } from '@/lib/format';
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
/** Largura que mantém o maior tique ("R$ 300 mil") numa linha só (EIX-6, tabela de larguras). */
const Y_AXIS_WIDTH = 70;
const CHART_MARGIN = { top: 4, right: 8, bottom: 0, left: 0 } as const;

/** Eixo redondo (EIX-4): passo 1, 2 ou 5 vezes uma potência de dez, terminando acima do maior valor. */
function niceAxis(values: readonly number[]): { readonly max: number; readonly ticks: readonly number[] } {
  const peak = Math.max(...values, 0);
  if (peak <= 0) return { max: 1, ticks: [0, 1] };
  const rough = peak / 3;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rough) ?? magnitude;
  const count = Math.ceil(peak / step);
  return { max: count * step, ticks: Array.from({ length: count + 1 }, (_, index) => index * step) };
}

function shares(counts: readonly number[]): readonly number[] | null {
  const total = counts.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return null;
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
        const top = Math.max(...executive.reasons.map((reason) => reason.count));
        const dominantIndexes = percentages === null ? [] : executive.reasons.flatMap((reason, index) => (reason.count === top ? [index] : []));
        return { executive, percentages, dominantIndexes };
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
            {rows.map(({ executive, percentages, dominantIndexes }) => {
              const isOpen = openIds.includes(executive.id);
              const panelId = `${baseId}-panel-${executive.id}`;
              const current = executive.revenueSeries.at(-1);
              const tied = dominantIndexes.length > 1;
              const dominantNames = dominantIndexes.map((index) => executive.reasons[index]?.reason ?? '').join(' e ');
              const dominantShare = percentages?.[dominantIndexes[0] ?? 0] ?? 0;
              const axis = niceAxis(executive.revenueSeries.map((point) => point.value));
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
                      {current ? formatCurrencyCompact(current.value) : formatUnavailable()}
                    </td>
                    <td className="px-2 py-1.5 align-top text-text-secondary">
                      {dominantIndexes.length > 0 ? (
                        <>
                          <span className="block">{dominantNames}</span>
                          <span className="block text-[0.6875rem] text-text-muted">{`${String(dominantShare)}%${tied ? ' cada' : ''} das perdas`}</span>
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
                            {executive.revenueSeries.length === 0 ? (
                              <div className="flex h-full items-center gap-2 text-text-muted" role="status">
                                <Filter aria-hidden className="size-4 shrink-0" />
                                <span>Nenhum mês com receita neste recorte.</span>
                              </div>
                            ) : (
                            <ResponsiveContainer height="100%" width="100%">
                              <LineChart data={[...executive.revenueSeries]} margin={CHART_MARGIN}>
                                <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
                                <XAxis
                                  {...AXIS_PROPS}
                                  axisLine={false}
                                  dataKey="month"
                                  interval={2}
                                  tickFormatter={(value: string) => formatMonthShort(value)}
                                  tickMargin={8}
                                />
                                <YAxis
                                  {...AXIS_PROPS}
                                  axisLine={false}
                                  domain={[0, axis.max]}
                                  interval={0}
                                  tickMargin={8}
                                  ticks={[...axis.ticks]}
                                  tickFormatter={(value: number) => formatCurrencyAxis(value)} width={Y_AXIS_WIDTH} />
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
                            )}
                          </div>
                          <div className="flex flex-col justify-center gap-1.5">
                            {percentages === null ? (
                              <div className="flex items-center gap-2 text-text-muted" role="status">
                                <Filter aria-hidden className="size-4 shrink-0" />
                                <span>sem perdas no período</span>
                              </div>
                            ) : (
                              executive.reasons.map((reason, index) => (
                              <div className="flex items-center gap-2" key={reason.reason}>
                                <div className="h-3 min-w-0 flex-1 rounded-sm bg-surface-sunken">
                                  <div
                                    className={cn('h-full rounded-sm', dominantIndexes.includes(index) ? 'bg-chart-1' : 'bg-line-strong')}
                                    style={{ width: `${String(percentages[index] ?? 0)}%` }}
                                  />
                                </div>
                                <span
                                  className={cn(
                                    'w-40 shrink-0 break-words leading-tight',
                                    dominantIndexes.includes(index) ? 'font-bold text-text-primary' : 'text-text-secondary',
                                  )}
                                >
                                  {reason.reason}
                                </span>
                                <span className="w-9 shrink-0 text-right font-display tabular-nums text-text-secondary">{`${String(percentages[index] ?? 0)}%`}</span>
                              </div>
                              ))
                            )}
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
