import { ArrowDown, Filter } from 'lucide-react';
import { useMemo } from 'react';

import { formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveRevenue } from './data';

/**
 * Tabela com barra inline por linha: a receita reconhecida de cada executivo, com o número
 * exato fora da barra e o traço da média do time comum ao trilho de todas as linhas. HTML com
 * Tailwind; o domínio da coluna é calculado uma vez sobre o recorte inteiro, nunca por linha.
 */
export interface RevenueBarTableProps {
  readonly data?: readonly ExecutiveRevenue[];
  readonly height?: number;
  readonly className?: string;
}

/** Espessura da marca (ESP-2): acima do piso de 12 px em cartão, sem rótulo dentro da barra. */
const TRACK_HEIGHT = 14;
/** Largura fixa da coluna de valor, para o algarismo tabular alinhar entre as linhas. */
const VALUE_COLUMN_WIDTH = 92;

function sortDesc(rows: readonly ExecutiveRevenue[]): ExecutiveRevenue[] {
  return [...rows].sort((a, b) => b.revenue - a.revenue);
}

export default function RevenueBarTable({ data = defaultData, height, className }: RevenueBarTableProps) {
  const rows = useMemo(() => sortDesc(data), [data]);
  const style = height === undefined ? undefined : { height };

  // Domínio calculado uma vez sobre o recorte inteiro (todas as linhas), nunca por linha.
  // Os hooks vêm antes de qualquer retorno condicional (react-hooks/rules-of-hooks); com o
  // recorte vazio o cálculo dá NaN/−Infinity sem lançar, e o resultado nem chega a ser usado.
  const { average, domainMax } = useMemo(() => {
    const max = Math.max(...rows.map((row) => row.revenue));
    const mean = rows.reduce((sum, row) => sum + row.revenue, 0) / rows.length;
    return { average: mean, domainMax: max };
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não há receita reconhecida para comparar.</span>
      </div>
    );
  }

  const averagePct = domainMax > 0 ? (average / domainMax) * 100 : 0;
  const leader = rows[0];
  const last = rows[rows.length - 1];

  const summary =
    leader && last
      ? `Tabela com barras inline da receita reconhecida de ${String(rows.length)} executivos no trimestre, ordenada da maior para a menor. ${leader.name} lidera com ${formatCurrencyCompact(leader.revenue)}; ${last.name} fecha a lista com ${formatCurrencyCompact(last.revenue)}. Média do time: ${formatCurrencyCompact(average)}.`
      : 'Tabela sem executivos neste recorte.';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-line-subtle">
        <table className="w-full min-w-0 border-collapse text-xs">
          <thead>
            <tr className="border-b border-line-subtle bg-surface-overlay/60">
              <th className="w-8 px-2 py-1.5 text-left align-bottom text-[0.6875rem] font-medium text-text-muted" scope="col">
                #
              </th>
              <th className="px-2 py-1.5 text-left align-bottom text-[0.6875rem] font-medium text-text-secondary" scope="col">
                Executivo
              </th>
              <th aria-sort="descending" className="px-2 py-1.5 text-left align-bottom" scope="col">
                <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-text-secondary">
                  Receita reconhecida
                  <ArrowDown aria-hidden className="size-3" />
                </span>
                <span aria-hidden className="mt-0.5 block text-[0.6875rem] font-normal text-text-muted">
                  média {formatCurrencyCompact(average)}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const pct = domainMax > 0 ? (row.revenue / domainMax) * 100 : 0;
              const isLeader = index === 0;
              return (
                <tr className="border-b border-line-subtle/60 last:border-0" key={row.id}>
                  <td className="px-2 py-1.5 align-middle font-display text-text-muted tabular-nums">{`${formatInt(index + 1)}º`}</td>
                  <td className={cn('px-2 py-1.5 align-middle text-text-secondary', isLeader && 'font-semibold text-text-primary')}>{row.name}</td>
                  <td className="px-2 py-1.5 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="relative min-w-0 flex-1 rounded-full bg-surface-sunken" style={{ height: TRACK_HEIGHT }}>
                        <div className="h-full rounded-full bg-chart-1" style={{ width: `${String(pct)}%` }} />
                        <div
                          aria-hidden
                          className="absolute inset-y-0 border-l border-dashed"
                          style={{ borderColor: 'var(--text-primary)', boxShadow: '0 0 0 1px var(--surface-raised)', left: `${String(averagePct)}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          'shrink-0 text-right font-display tabular-nums',
                          isLeader ? 'font-semibold text-text-primary' : 'text-text-secondary',
                        )}
                        style={{ width: VALUE_COLUMN_WIDTH }}
                      >
                        {formatCurrencyCompact(row.revenue)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        {formatInt(rows.length)} executivos. Traço tracejado no trilho marca a média do time.
      </p>
    </div>
  );
}
