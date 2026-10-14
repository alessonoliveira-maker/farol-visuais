import { ChevronRight, Filter, Unplug } from 'lucide-react';
import { Fragment, useEffect, useId, useRef, useState } from 'react';

import { formatCurrencyCompact, formatDate, formatDays, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, expandedIds as defaultExpandedIds, type LostOpportunity } from './data';

/**
 * Tabela de oportunidades perdidas com várias linhas abertas ao mesmo tempo, e os três formatos
 * de painel: histórico completo, sem histórico neste recorte (vazio) e histórico indisponível.
 * O foco vai do botão para o painel ao abrir, e volta ao botão ao fechar.
 */
export interface LossHistoryStatesTableProps {
  readonly data?: readonly LostOpportunity[];
  readonly expandedIds?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

type PendingFocus = { readonly id: string; readonly target: 'panel' | 'button' };

export default function LossHistoryStatesTable({
  data = defaultData,
  expandedIds = defaultExpandedIds,
  height,
  className,
}: LossHistoryStatesTableProps) {
  const [openIds, setOpenIds] = useState<readonly string[]>(expandedIds);
  const [pendingFocus, setPendingFocus] = useState<PendingFocus | null>(null);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const panelRefs = useRef(new Map<string, HTMLDivElement | null>());
  const baseId = useId();
  const style = height === undefined ? undefined : { height };

  useEffect(() => {
    if (!pendingFocus) return;
    const map = pendingFocus.target === 'panel' ? panelRefs.current : buttonRefs.current;
    map.get(pendingFocus.id)?.focus();
    setPendingFocus(null);
  }, [pendingFocus]);

  function toggle(id: string) {
    setOpenIds((current) => {
      const isOpen = current.includes(id);
      setPendingFocus({ id, target: isOpen ? 'button' : 'panel' });
      return isOpen ? current.filter((openId) => openId !== id) : [...current, id];
    });
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade perdida neste recorte.</span>
      </div>
    );
  }

  const openCount = data.filter((row) => openIds.includes(row.id)).length;
  const summary = `Tabela com linha expansível de ${formatInt(data.length)} oportunidades perdidas, ${formatInt(openCount)} de ${formatInt(data.length)} abertas ao mesmo tempo. Os painéis abertos mostram histórico completo, ausência de histórico neste recorte e falha ao carregar o histórico, cada um com texto próprio.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">{`${formatInt(openCount)} de ${formatInt(data.length)} linhas abertas`}</p>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-md border border-line-subtle">
        <table className="w-full min-w-0 border-collapse text-xs">
          <thead>
            <tr className="border-b border-line-subtle bg-surface-overlay/60">
              <th aria-label="Expandir" className="w-7 px-2 py-1.5" scope="col" />
              <th className="px-2 py-1.5 text-left text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Empresa
              </th>
              <th className="px-2 py-1.5 text-left text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Motivo
              </th>
              <th className="px-2 py-1.5 text-right text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Valor perdido
              </th>
              <th className="px-2 py-1.5 text-right text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Perdida em
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isOpen = openIds.includes(row.id);
              const panelId = `${baseId}-panel-${row.id}`;
              const hint =
                row.detail.kind === 'historico'
                  ? `${formatInt(row.detail.stages.length)} etapas percorridas`
                  : row.detail.kind === 'vazio'
                    ? `sem histórico: ${row.detail.reason}`
                    : 'falha ao carregar o histórico';
              return (
                <Fragment key={row.id}>
                  <tr className="border-b border-line-subtle/60 last:border-0">
                    <td className="px-2 py-1.5 align-top">
                      <button
                        aria-controls={panelId}
                        aria-expanded={isOpen}
                        className="flex size-5 items-center justify-center rounded text-text-muted hover:text-text-primary"
                        onClick={() => {
                          toggle(row.id);
                        }}
                        ref={(element) => {
                          buttonRefs.current.set(row.id, element);
                        }}
                        type="button"
                      >
                        <ChevronRight aria-hidden className={cn('size-3.5 transition-transform', isOpen && 'rotate-90')} />
                      </button>
                    </td>
                    <td className="px-2 py-1.5 align-top text-text-secondary">
                      <span className="block font-medium text-text-primary">{row.company}</span>
                      <span className="block text-[0.6875rem] text-text-muted">{row.owner}</span>
                      <span className="block text-[0.6875rem] text-text-muted">{hint}</span>
                    </td>
                    <td className="px-2 py-1.5 align-top text-text-secondary">{row.reason}</td>
                    <td className="px-2 py-1.5 text-right align-top font-display text-text-primary tabular-nums">
                      {formatCurrencyCompact(row.value)}
                    </td>
                    <td className="px-2 py-1.5 text-right align-top text-text-muted">{formatDate(row.lostAt)}</td>
                  </tr>
                  {isOpen ? (
                    <tr className="border-b border-line-subtle/60 bg-surface-sunken/40 last:border-0">
                      <td className="px-2 py-2" colSpan={5} id={panelId}>
                        <div
                          ref={(element) => {
                            panelRefs.current.set(row.id, element);
                          }}
                          tabIndex={-1}
                        >
                          {row.detail.kind === 'historico' ? (
                            <div className="flex flex-wrap items-stretch gap-2">
                              {row.detail.stages.map((stage, index) => (
                                <div
                                  className="flex min-w-[104px] flex-col gap-0.5 rounded-md border border-line-subtle bg-surface-raised px-2.5 py-1.5"
                                  key={stage.name}
                                >
                                  <span className="text-[0.6875rem] font-medium text-text-secondary">{`${formatInt(index + 1)}. ${stage.name}`}</span>
                                  <span className="font-display text-[0.6875rem] text-text-primary tabular-nums">{formatDate(stage.enteredAt)}</span>
                                  <span className="text-[0.6875rem] text-text-muted">{`${formatDays(stage.days)} na etapa`}</span>
                                </div>
                              ))}
                            </div>
                          ) : row.detail.kind === 'vazio' ? (
                            <div className="flex items-center gap-2 text-text-muted" role="status">
                              <Filter aria-hidden className="size-4 shrink-0" />
                              <span>Sem histórico neste recorte: a oportunidade entrou fora da janela de dados carregada.</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-text-muted">
                              <Unplug aria-hidden className="size-4 shrink-0" />
                              <span>{`Histórico ${formatUnavailable()}: falha ao carregar as etapas desta oportunidade.`}</span>
                            </div>
                          )}
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
