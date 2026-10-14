import { AlertTriangle, ChevronRight, Filter } from 'lucide-react';
import { Fragment, useId, useMemo, useState } from 'react';

import { formatHours, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, DAYS, expandedIds as defaultExpandedIds, HOUR_BINS, type Queue } from './data';

/**
 * Tabela de filas de pré-vendas com linha expansível: o resumo traz volume, SLA e capacidade
 * contra o teto, e o painel abre o mapa de entradas por dia e faixa de horário, em HTML com
 * Tailwind. A escala de cor do mapa é comum a todas as filas, para abrir duas e comparar.
 */
export interface QueueEntriesTableProps {
  readonly data?: readonly Queue[];
  readonly expandedIds?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

/** Cinco degraus com um único par de texto por lado (mesma escolha de 02/01, medida nos dois temas). */
const SEQ_TOKENS = ['var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-6)', 'var(--seq-7)'];
const SEQ_TEXT = ['var(--text-primary)', 'var(--text-primary)', 'var(--text-primary)', 'var(--accent-cyan-contrast)', 'var(--accent-cyan-contrast)'];
const CAPACITY_DOMAIN_MAX = 1.3;

function levelForValue(value: number, min: number, max: number): number {
  const span = max - min || 1;
  const t = (value - min) / span;
  return Math.min(SEQ_TOKENS.length - 1, Math.max(0, Math.round(t * (SEQ_TOKENS.length - 1))));
}

export default function QueueEntriesTable({ data = defaultData, expandedIds = defaultExpandedIds, height, className }: QueueEntriesTableProps) {
  const [openIds, setOpenIds] = useState<readonly string[]>(expandedIds);
  const baseId = useId();
  const style = height === undefined ? undefined : { height };

  const { min, max } = useMemo(() => {
    const flat = data.flatMap((queue) => queue.entries.flatMap((row) => row));
    return { min: flat.length > 0 ? Math.min(...flat) : 0, max: flat.length > 0 ? Math.max(...flat) : 1 };
  }, [data]);

  function toggle(id: string) {
    setOpenIds((current) => (current.includes(id) ? current.filter((openId) => openId !== id) : [...current, id]));
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma fila neste recorte.</span>
      </div>
    );
  }

  const summary = `Tabela com linha expansível de ${String(data.length)} filas de pré-vendas, com volume, SLA e capacidade contra o teto. Abrir uma fila mostra o mapa de entradas por dia e faixa de horário, com escala de cor comum a todas as filas, de ${formatInt(min)} a ${formatInt(max)} entradas.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-md border border-line-subtle">
        <table className="w-full min-w-0 border-collapse text-xs">
          <thead>
            <tr className="border-b border-line-subtle bg-surface-overlay/60">
              <th aria-label="Expandir" className="w-7 px-2 py-1.5" scope="col" />
              <th className="px-2 py-1.5 text-left text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Fila
              </th>
              <th className="px-2 py-1.5 text-right text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Volume/mês
              </th>
              <th className="px-2 py-1.5 text-left text-[0.6875rem] font-medium text-text-secondary" scope="col">
                SLA de 1º contato
              </th>
              <th className="px-2 py-1.5 text-left text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Capacidade contra o teto
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((queue) => {
              const isOpen = openIds.includes(queue.id);
              const panelId = `${baseId}-panel-${queue.id}`;
              const overSla = queue.slaHours > queue.slaTargetHours;
              const overCapacity = queue.capacityPct > 1;
              const barPct = Math.min(queue.capacityPct, CAPACITY_DOMAIN_MAX) / CAPACITY_DOMAIN_MAX * 100;
              const tetoPct = 1 / CAPACITY_DOMAIN_MAX * 100;
              return (
                <Fragment key={queue.id}>
                  <tr className="border-b border-line-subtle/60 last:border-0">
                    <td className="px-2 py-1.5 align-top">
                      <button
                        aria-controls={panelId}
                        aria-expanded={isOpen}
                        className="flex size-5 items-center justify-center rounded text-text-muted hover:text-text-primary"
                        onClick={() => {
                          toggle(queue.id);
                        }}
                        type="button"
                      >
                        <ChevronRight aria-hidden className={cn('size-3.5 transition-transform', isOpen && 'rotate-90')} />
                      </button>
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <span className="block font-medium text-text-primary">{queue.name}</span>
                      <span className="block text-[0.6875rem] text-text-muted">mapa de entradas por dia e horário</span>
                    </td>
                    <td className="px-2 py-1.5 text-right align-top font-display text-text-primary tabular-nums">{formatInt(queue.volumeMonth)}</td>
                    <td className="px-2 py-1.5 align-top">
                      <span className={cn('inline-flex items-center gap-1', overSla ? 'text-negative' : 'text-text-secondary')}>
                        {overSla ? <AlertTriangle aria-hidden className="size-3" /> : null}
                        <span className="font-display tabular-nums">{formatHours(queue.slaHours)}</span>
                        <span className="text-text-muted">{`(meta ${formatHours(queue.slaTargetHours)})`}</span>
                      </span>
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <div className="flex items-center gap-2">
                        <div className="relative h-3 min-w-0 flex-1 rounded-sm bg-surface-sunken">
                          <div className="h-full rounded-sm bg-chart-1" style={{ width: `${String(barPct)}%` }} />
                          <div aria-hidden className="absolute inset-y-0 border-l border-dashed" style={{ borderColor: 'var(--text-muted)', left: `${String(tetoPct)}%` }} />
                        </div>
                        <span className={cn('w-16 shrink-0 text-right font-display tabular-nums', overCapacity ? 'font-semibold text-negative' : 'text-text-secondary')}>
                          {formatPercent(queue.capacityPct, 0)}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr className="border-b border-line-subtle/60 bg-surface-sunken/40 last:border-0">
                      <td className="px-2 py-2" colSpan={5} id={panelId}>
                        <table className="w-full table-fixed text-[11px]" style={{ borderCollapse: 'separate', borderSpacing: 2 }}>
                          <thead>
                            <tr>
                              <th className="w-10 text-left text-[11px] font-medium text-text-muted">Dia</th>
                              {HOUR_BINS.map((bin) => (
                                <th className="text-center text-[11px] font-medium text-text-muted" key={bin}>
                                  {bin}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queue.entries.map((row, dayIndex) => (
                              <tr key={DAYS[dayIndex]}>
                                <th className="text-left align-middle text-[11px] font-medium text-text-secondary" scope="row">
                                  {DAYS[dayIndex]}
                                </th>
                                {row.map((count, hourIndex) => {
                                  const level = levelForValue(count, min, max);
                                  return (
                                    <td
                                      className="rounded-sm p-1 text-center font-display font-medium tabular-nums"
                                      key={HOUR_BINS[hourIndex]}
                                      style={{ backgroundColor: SEQ_TOKENS[level], color: SEQ_TEXT[level] }}
                                    >
                                      {formatInt(count)}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div aria-hidden className="mt-2 flex items-center gap-2 text-[0.6875rem] text-text-muted">
                          <span>{formatInt(min)}</span>
                          <span className="flex overflow-hidden rounded-sm" style={{ gap: 2 }}>
                            {SEQ_TOKENS.map((token) => (
                              <span className="h-3 w-6" key={token} style={{ backgroundColor: token }} />
                            ))}
                          </span>
                          <span>{formatInt(max)}</span>
                          <span>· escala comum a todas as filas</span>
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
