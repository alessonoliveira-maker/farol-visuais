import { AlertTriangle, Check, X } from 'lucide-react';
import type { ReactElement } from 'react';

import { cn } from '@/lib/utils';
import { criteria as defaultCriteria, data as defaultData, type HandoffCriterion, type OpportunityHandoff } from './data';

/**
 * Checklist de handoff: uma oportunidade por linha, um critério de passagem por coluna, ordenada
 * pela quantidade de pendências, a mais pendente no topo. Contagem por linha e por coluna fecha a
 * leitura; o critério mais descumprido ganha destaque no cabeçalho. HTML com Tailwind.
 */
export interface HandoffChecklistProps {
  readonly data?: readonly OpportunityHandoff[];
  readonly criteria?: readonly HandoffCriterion[];
  readonly height?: number;
  readonly className?: string;
}

function pendingCount(checks: readonly boolean[]): number {
  return checks.filter((check) => !check).length;
}

export default function HandoffChecklist({
  data = defaultData,
  criteria = defaultCriteria,
  height,
  className,
}: HandoffChecklistProps): ReactElement {
  const style = height === undefined ? undefined : { height };
  const total = criteria.length;

  const ordered = [...data].sort((a, b) => pendingCount(b.checks) - pendingCount(a.checks));
  const columnPending = criteria.map((_, columnIndex) => data.filter((row) => !row.checks[columnIndex]).length);
  const worstColumnIndex = columnPending.reduce((worst, count, index) => (count > (columnPending[worst] ?? -1) ? index : worst), 0);
  const worstCriterion = criteria[worstColumnIndex];

  const mostPending = ordered.at(0);

  const summary =
    `Checklist de handoff com ${String(data.length)} oportunidades por ${String(total)} critérios, da mais para a menos pendente. ` +
    (mostPending ? `${mostPending.company} tem ${String(pendingCount(mostPending.checks))} de ${String(total)} pendências. ` : '') +
    (worstCriterion ? `${worstCriterion.name} é o critério mais descumprido, em ${String(columnPending[worstColumnIndex] ?? 0)} de ${String(data.length)}.` : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <div className="mb-1.5 flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
        <span className="inline-flex items-center gap-1">
          <Check aria-hidden className="size-3.5 text-positive" />
          Cumprido
        </span>
        <span className="inline-flex items-center gap-1">
          <X aria-hidden className="size-3.5 text-negative" />
          Pendente
        </span>
      </div>
      <table className="w-full min-w-0 flex-1 border-collapse">
        <thead>
          <tr>
            <th className="pb-1 text-left text-xs font-medium text-text-secondary" scope="col">
              Oportunidade
            </th>
            {criteria.map((criterion, columnIndex) => {
              const isWorst = columnIndex === worstColumnIndex;
              return (
                <th
                  className={cn('px-0.5 pb-1 text-center text-[11px] leading-tight font-medium text-text-secondary', isWorst && 'text-warning')}
                  key={criterion.id}
                  scope="col"
                  title={criterion.name}
                >
                  <span className="inline-flex items-center justify-center gap-0.5">
                    {isWorst ? <AlertTriangle aria-hidden className="size-2.5 shrink-0" /> : null}
                    {criterion.shortLabel}
                  </span>
                  <span className="sr-only">{criterion.name}</span>
                </th>
              );
            })}
            <th className="pb-1 pl-2 text-right text-xs font-medium text-text-secondary" scope="col">
              Pendências
            </th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((row) => {
            const pending = pendingCount(row.checks);
            return (
              <tr className="h-5 border-t border-line-subtle" key={row.id}>
                <th className="pr-2 text-left text-[11px] font-medium text-nowrap text-text-primary" scope="row">
                  {row.company}
                </th>
                {row.checks.map((ok, columnIndex) => {
                  const criterion = criteria[columnIndex];
                  return (
                    <td className="text-center" key={criterion?.id ?? columnIndex}>
                      {ok ? <Check aria-hidden className="mx-auto size-3.5 text-positive" /> : <X aria-hidden className="mx-auto size-3.5 text-negative" />}
                      <span className="sr-only">{ok ? 'Cumprido' : 'Pendente'}</span>
                    </td>
                  );
                })}
                <td className="pl-2 text-right">
                  <span className={cn('kpi-number text-[11px] font-semibold', pending === 0 ? 'text-positive' : 'text-negative')}>
                    {String(pending)} de {String(total)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-line-strong">
            <th className="pt-1 text-left text-[11px] font-medium text-text-muted" scope="row">
              Oportunidades pendentes
            </th>
            {columnPending.map((count, columnIndex) => (
              <td className="pt-1 text-center" key={criteria[columnIndex]?.id ?? columnIndex}>
                <span className="kpi-number text-[11px] font-semibold text-text-secondary">{String(count)}</span>
              </td>
            ))}
            <td className="pt-1" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
