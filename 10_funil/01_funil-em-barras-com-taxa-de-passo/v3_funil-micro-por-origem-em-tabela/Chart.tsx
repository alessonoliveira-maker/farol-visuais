import { Filter } from 'lucide-react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginFunnelRow } from './data';

/**
 * Uma linha por origem, um funil minúsculo por linha: quatro colunas ancoradas no zero, escaladas
 * contra a própria entrada da linha. A célula escreve a taxa do passo anterior; a taxa contra o
 * topo mora só na dica, para não competir com o número que já está na célula.
 */
export interface OriginFunnelTableProps {
  readonly data?: readonly OriginFunnelRow[];
  readonly className?: string;
  readonly height?: number;
}

type ColumnKey = 'entradas' | 'contatadas' | 'qualificadas' | 'agendadas';
const COLUMNS: readonly { readonly key: ColumnKey; readonly label: string }[] = [
  { key: 'entradas', label: 'Entradas' },
  { key: 'contatadas', label: 'Contatadas' },
  { key: 'qualificadas', label: 'Qualificadas' },
  { key: 'agendadas', label: 'Agendadas' },
];
/** Trilho vertical de cada célula, em px: alto o bastante para a coluna minúscula não sumir. */
const BAR_TRACK = 14;
const BAR_WIDTH = 8;

export default function OriginFunnelTable({ data = defaultData, className, height }: OriginFunnelTableProps) {
  const rows = [...data].sort((a, b) => b.entradas - a.entradas);
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não houve entrada de lead no período.</span>
      </div>
    );
  }

  const leader = rows.reduce((acc, row) => (row.agendadas > acc.agendadas ? row : acc), rows[0]!);
  const reativacao = rows.find((row) => row.id === 'reativacao-de-base');

  const summary =
    `Tabela com o funil de pré-vendas de agosto de 2026 por origem de lead, ${String(rows.length)} origens em quatro etapas. ` +
    `${leader.origin} lidera com ${formatInt(leader.agendadas)} agendadas.` +
    (reativacao
      ? ` ${reativacao.origin}: ${formatInt(reativacao.qualificadas)} qualificadas passam ${formatInt(reativacao.contatadas)} contatadas, maior de propósito.`
      : '');

  return (
    <table aria-label={summary} className={cn('h-full w-full min-w-0 border-collapse', className)} role="table" style={style}>
      <thead>
        <tr>
          <th className="w-40 pb-2 text-left align-bottom text-xs font-medium text-text-secondary" scope="col">
            Origem
          </th>
          {COLUMNS.map((col, i) => (
            <th className="pb-2 text-center align-bottom" key={col.key} scope="col">
              <span className="block text-xs font-medium text-text-secondary">{col.label}</span>
              <span className="block text-[11px] font-normal text-text-muted">{i === 0 ? 'topo' : 'do passo'}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr className="border-t border-line-subtle" key={row.id}>
            <th className="py-1.5 pr-2 text-left text-xs font-medium text-nowrap text-text-secondary" scope="row">
              {row.origin}
            </th>
            {COLUMNS.map((col, i) => {
              const value = row[col.key];
              const prevKey = COLUMNS[i - 1]?.key;
              const prevValue = prevKey ? row[prevKey] : undefined;
              const stepRate = prevValue !== undefined && prevValue > 0 ? value / prevValue : null;
              const topRate = row.entradas > 0 ? value / row.entradas : 0;
              const barPct = row.entradas > 0 ? Math.min(100, (value / row.entradas) * 100) : 0;
              return (
                <td className="py-1.5 text-center" key={col.key} title={`${formatPercent(topRate)} da entrada (topo)`}>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-end justify-center" style={{ height: BAR_TRACK }}>
                      <span
                        aria-hidden
                        className="rounded-t-[1px]"
                        style={{ backgroundColor: 'var(--chart-1)', height: Math.max(1, (barPct / 100) * BAR_TRACK), width: BAR_WIDTH }}
                      />
                    </div>
                    <span className="kpi-number text-xs font-semibold text-text-primary">{formatInt(value)}</span>
                    <span className="text-[11px] text-text-muted">{stepRate === null ? ' ' : formatPercent(stepRate)}</span>
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
