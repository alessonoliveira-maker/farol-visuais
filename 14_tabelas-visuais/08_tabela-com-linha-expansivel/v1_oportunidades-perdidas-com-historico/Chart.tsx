import { ChevronRight, Filter } from 'lucide-react';
import { Fragment, useId, useState } from 'react';

import { formatCurrencyCompact, formatDate, formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, expandedIds as defaultExpandedIds, type LostOpportunity } from './data';

/**
 * Tabela de oportunidades perdidas com linha expansível: o resumo fica na linha e o histórico de
 * etapas percorridas até a perda abre num painel na largura da tabela, só quando pedido. HTML com
 * Tailwind; o painel de uma linha nunca monta o de outra, e o total do rodapé soma sempre todas
 * as linhas, abertas ou não.
 */
export interface LossHistoryTableProps {
  readonly data?: readonly LostOpportunity[];
  /** Ids abertos no primeiro desenho; a partir daí o estado é do próprio componente. */
  readonly expandedIds?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

export default function LossHistoryTable({
  data = defaultData,
  expandedIds = defaultExpandedIds,
  height,
  className,
}: LossHistoryTableProps) {
  const [openIds, setOpenIds] = useState<readonly string[]>(expandedIds);
  const baseId = useId();
  const style = height === undefined ? undefined : { height };

  function toggle(id: string) {
    setOpenIds((current) => (current.includes(id) ? current.filter((openId) => openId !== id) : [...current, id]));
  }

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade perdida neste recorte.</span>
      </div>
    );
  }

  const total = data.reduce((sum, row) => sum + row.value, 0);
  const openCount = data.filter((row) => openIds.includes(row.id)).length;
  const openPhrase =
    openCount === 0
      ? 'Nenhuma linha aberta no momento.'
      : `${String(openCount)} ${openCount === 1 ? 'linha aberta mostra' : 'linhas abertas mostram'} as etapas percorridas até a perda, com data e duração de cada uma.`;

  const summary = `Tabela com linha expansível de ${String(data.length)} oportunidades perdidas em agosto de 2026, somando ${formatCurrencyCompact(total)}. ${openPhrase}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Toque na seta para abrir o histórico de etapas de cada oportunidade.
      </p>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-md border border-line-subtle">
        <table className="w-full min-w-0 border-collapse text-xs">
          <thead>
            <tr className="border-b border-line-subtle bg-surface-overlay/60">
              <th aria-label="Expandir" className="w-7 px-2 py-1" scope="col" />
              <th className="px-2 py-1 text-left text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Empresa
              </th>
              <th className="px-2 py-1 text-left text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Motivo
              </th>
              <th className="px-2 py-1 text-right text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Valor perdido
              </th>
              <th className="px-2 py-1 text-right text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Perdida em
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isOpen = openIds.includes(row.id);
              const panelId = `${baseId}-panel-${row.id}`;
              return (
                <Fragment key={row.id}>
                  <tr className="border-b border-line-subtle/60 last:border-0">
                    <td className="px-2 py-1 align-top">
                      <button
                        aria-controls={panelId}
                        aria-expanded={isOpen}
                        className="flex size-5 items-center justify-center rounded text-text-muted hover:text-text-primary"
                        onClick={() => {
                          toggle(row.id);
                        }}
                        type="button"
                      >
                        <ChevronRight aria-hidden className={cn('size-3.5 transition-transform', isOpen && 'rotate-90')} />
                      </button>
                    </td>
                    <td className="px-2 py-1 align-top text-text-secondary">
                      <span className="block font-medium text-text-primary">{row.company}</span>
                      <span className="block text-[0.6875rem] text-text-muted">{row.owner}</span>
                      <span className="block text-[0.6875rem] text-text-muted">{`${formatInt(row.stages.length)} etapas percorridas`}</span>
                    </td>
                    <td className="px-2 py-1 align-top text-text-secondary">{row.reason}</td>
                    <td className="px-2 py-1 text-right align-top font-display text-text-primary tabular-nums">
                      {formatCurrencyCompact(row.value)}
                    </td>
                    <td className="px-2 py-1 text-right align-top text-text-muted">{formatDate(row.lostAt)}</td>
                  </tr>
                  {isOpen ? (
                    <tr className="border-b border-line-subtle/60 bg-surface-sunken/40 last:border-0">
                      <td className="px-2 py-2" colSpan={5} id={panelId}>
                        <div className="flex flex-wrap items-stretch gap-2">
                          {row.stages.map((stage, index) => (
                            <div
                              className="flex min-w-[104px] flex-col gap-0.5 rounded-md border border-line-subtle bg-surface-raised px-2.5 py-1"
                              key={stage.name}
                            >
                              <span className="text-[0.6875rem] font-medium text-text-secondary">{`${formatInt(index + 1)}. ${stage.name}`}</span>
                              <span className="font-display text-[0.6875rem] text-text-primary tabular-nums">{formatDate(stage.enteredAt)}</span>
                              <span className="text-[0.6875rem] text-text-muted">{`${formatDays(stage.days)} na etapa`}</span>
                            </div>
                          ))}
                          <div className="flex min-w-[104px] flex-col justify-center gap-0.5 rounded-md border border-dashed border-line-strong px-2.5 py-1">
                            <span className="text-[0.6875rem] font-semibold text-text-primary">Perdida</span>
                            <span className="font-display text-[0.6875rem] text-text-primary tabular-nums">{formatDate(row.lostAt)}</span>
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
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Total perdido no período:{' '}
        <span className="font-display font-semibold text-text-primary tabular-nums">{formatCurrencyCompact(total)}</span>
      </p>
    </div>
  );
}
