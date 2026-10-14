import { Check, CircleDashed, X } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, goals, type AreaGoals, type GoalStatus } from './data';

/**
 * Matriz de status: uma área por linha, uma meta por coluna, um símbolo de cumprimento em cada
 * cruzamento (cumpriu, parcial, não cumpriu), nunca só a cor. Contagem de metas cumpridas por
 * área na última coluna e por meta no rodapé. HTML com Tailwind, sem Recharts.
 */
export interface GoalStatusMatrixProps {
  readonly data?: readonly AreaGoals[];
  readonly height?: number;
  readonly className?: string;
}

const STATUS_ICON: Record<GoalStatus, typeof Check> = {
  cumpriu: Check,
  parcial: CircleDashed,
  nao_cumpriu: X,
};

const STATUS_CLASS: Record<GoalStatus, string> = {
  cumpriu: 'text-positive',
  parcial: 'text-warning',
  nao_cumpriu: 'text-negative',
};

const STATUS_LABEL: Record<GoalStatus, string> = {
  cumpriu: 'Cumpriu',
  parcial: 'Cumpriu em parte',
  nao_cumpriu: 'Não cumpriu',
};

function metCount(statuses: readonly GoalStatus[]): number {
  return statuses.filter((status) => status === 'cumpriu').length;
}

export default function GoalStatusMatrix({ data = defaultData, height, className }: GoalStatusMatrixProps): ReactElement {
  const style = height === undefined ? undefined : { height };
  const total = goals.length;
  const columnCounts = goals.map((_, columnIndex) => data.filter((row) => row.statuses[columnIndex] === 'cumpriu').length);
  const weakestIndex = columnCounts.reduce((worst, count, index) => (count < (columnCounts[worst] ?? Infinity) ? index : worst), 0);
  const weakestGoal = goals[weakestIndex];

  const ranked = [...data].sort((a, b) => metCount(b.statuses) - metCount(a.statuses));
  const leader = ranked.at(0);
  const laggard = ranked.at(-1);

  const summary =
    `Matriz de status com o cumprimento de ${String(total)} metas de 2026 por ${String(data.length)} áreas. ` +
    (leader ? `${leader.area} cumpriu ${String(metCount(leader.statuses))} de ${String(total)}` : '') +
    (laggard && laggard.id !== leader?.id ? `; ${laggard.area} cumpriu só ${String(metCount(laggard.statuses))} de ${String(total)}` : '') +
    (weakestGoal ? `. A meta mais frágil é ${weakestGoal.name}, cumprida por ${String(columnCounts[weakestIndex] ?? 0)} de ${String(data.length)} áreas.` : '.');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <div className="mb-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
        {(['cumpriu', 'parcial', 'nao_cumpriu'] as const).map((status) => {
          const Icon = STATUS_ICON[status];
          return (
            <span className="inline-flex items-center gap-1" key={status}>
              <Icon aria-hidden className={cn('size-3.5', STATUS_CLASS[status])} />
              {STATUS_LABEL[status]}
            </span>
          );
        })}
      </div>
      <table className="w-full min-w-0 flex-1 border-collapse">
        <thead>
          <tr>
            <th className="pb-1.5 text-left text-xs font-medium text-text-secondary" scope="col">
              Área
            </th>
            {goals.map((goal) => (
              <th className="w-[13%] px-1 pb-1.5 text-center text-[11px] leading-tight font-medium text-text-secondary" key={goal.id} scope="col">
                {goal.name}
              </th>
            ))}
            <th className="pb-1.5 pl-2 text-right text-xs font-medium text-text-secondary" scope="col">
              Cumpridas
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr className="border-t border-line-subtle" key={row.id}>
              <th className="py-1 pr-2 text-left text-xs font-medium text-text-primary" scope="row">
                {row.area}
              </th>
              {row.statuses.map((status, columnIndex) => {
                const Icon = STATUS_ICON[status];
                const goal = goals[columnIndex];
                return (
                  <td className="py-1 text-center" key={goal?.id ?? columnIndex}>
                    <Icon aria-hidden className={cn('mx-auto size-3.5', STATUS_CLASS[status])} />
                    <span className="sr-only">{STATUS_LABEL[status]}</span>
                  </td>
                );
              })}
              <td className="py-1 pl-2 text-right">
                <span className="kpi-number text-xs font-semibold text-text-primary">
                  {String(metCount(row.statuses))} de {String(total)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-line-strong">
            <th className="pt-1.5 text-left text-[11px] font-medium text-text-muted" scope="row">
              Áreas que cumpriram
            </th>
            {columnCounts.map((count, columnIndex) => (
              <td className="pt-1.5 text-center" key={goals[columnIndex]?.id ?? columnIndex}>
                <span className="kpi-number text-[11px] font-semibold text-text-secondary">
                  {formatInt(count)}/{formatInt(data.length)}
                </span>
              </td>
            ))}
            <td className="pt-1.5" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
