import { ArrowDown, ArrowUp, Filter, LogOut, Minus } from 'lucide-react';

import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, mesAnterior, mesAtual, saidas as defaultSaidas, type RankingRow, type SaidaRow } from './data';

/**
 * Top 10 de origens por leads qualificados, com entrada nova marcada por selo (nunca tratada
 * como "subiu 999") e saída do topo mostrada em linha à parte, fora da contagem de posições, com
 * a última posição e o último valor conhecidos escritos por extenso.
 */
export interface Top10EntradaSaidaProps {
  readonly data?: readonly RankingRow[];
  readonly saidas?: readonly SaidaRow[];
  readonly className?: string;
}

function DirectionIcon({ delta }: { readonly delta: number }) {
  if (delta > 0) return <ArrowUp aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />;
  if (delta < 0) return <ArrowDown aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />;
  return <Minus aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />;
}

export default function Top10EntradaSaida({ data = defaultData, saidas = defaultSaidas, className }: Top10EntradaSaidaProps) {
  const rows = [...data].sort((a, b) => a.pos - b.pos);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não há origem com leads qualificados no mês.</span>
      </div>
    );
  }

  const leader = rows[0];
  if (!leader) return null;
  const novos = rows.filter((row) => row.posAnterior === null);

  const summary = [
    `Tabela do top ${String(rows.length)} de origens por leads qualificados em ${formatMonthShort(mesAtual)}.`,
    `Lidera ${leader.name}, com ${formatInt(leader.value)} leads.`,
    novos.length > 0 ? `Entraram: ${novos.map((row) => row.name).join(', ')}.` : '',
    saidas.length > 0 ? `${String(saidas.length)} origens saíram desde ${formatMonthShort(mesAnterior)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('h-full w-full min-w-0 overflow-auto', className)}>
      <table aria-label={summary} className="w-full min-w-[460px] border-collapse text-xs" role="table">
        <thead>
          <tr className="border-b border-line-subtle text-text-muted">
            <th className="w-9 py-2 pr-2 text-left font-medium" scope="col">
              #
            </th>
            <th className="py-2 pr-3 text-left font-medium" scope="col">
              Origem
            </th>
            <th className="py-2 pr-3 text-left font-medium" scope="col">
              {`Variação de posição desde ${formatMonthShort(mesAnterior)}`}
            </th>
            <th className="py-2 pr-3 text-right font-medium" scope="col">
              {`Leads qualificados ${formatMonthShort(mesAtual)}`}
            </th>
            <th className="py-2 text-right font-medium" scope="col">
              {`Variação vs ${formatMonthShort(mesAnterior)}`}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isNew = row.posAnterior === null;
            const deltaPos = isNew ? null : row.posAnterior - row.pos;
            const deltaValue =
              row.valueAnterior === null || row.valueAnterior === 0 ? null : (row.value - row.valueAnterior) / row.valueAnterior;
            return (
              <tr className="border-b border-line-subtle last:border-0" key={row.id}>
                <td className="py-2 pr-2 font-display text-text-secondary tabular-nums">{`${String(row.pos)}º`}</td>
                <td className="py-2 pr-3 font-medium whitespace-nowrap text-text-primary">{row.name}</td>
                <td className="py-2 pr-3">
                  {isNew || deltaPos === null ? (
                    <span className="rounded-full border border-line-subtle px-1.5 py-0.5 text-[0.6875rem] font-medium tabular-nums text-info">
                      novo no top 10
                    </span>
                  ) : (
                    <span
                      className={cn('inline-flex items-center gap-1', deltaPos === 0 ? 'text-text-secondary' : 'text-text-primary')}
                    >
                      <DirectionIcon delta={deltaPos} />
                      <span className="font-display tabular-nums">
                        {deltaPos === 0 ? 'manteve' : `${deltaPos > 0 ? 'subiu' : 'caiu'} ${String(Math.abs(deltaPos))}`}
                      </span>
                      <span className="text-text-muted tabular-nums">{`(${String(row.posAnterior)}º → ${String(row.pos)}º)`}</span>
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3 text-right font-display tabular-nums text-text-primary">{formatInt(row.value)}</td>
                <td className="py-2 text-right">
                  {deltaValue === null ? (
                    <span className="text-text-muted">sem posição anterior medida para comparar</span>
                  ) : (
                    <>
                      <span
                        className={cn(
                          'font-display tabular-nums',
                          deltaValue > 0 ? 'text-positive' : deltaValue < 0 ? 'text-negative' : 'text-text-secondary',
                        )}
                      >
                        {deltaValue === 0 ? 'estável' : `${deltaValue > 0 ? '+' : '−'}${formatPercent(Math.abs(deltaValue))}`}
                      </span>{' '}
                      <span className="text-text-muted">{`contra ${formatInt(row.valueAnterior ?? 0)} leads`}</span>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
          {saidas.map((row) => (
            <tr className="border-b border-line-subtle text-text-muted last:border-0" key={row.id}>
              <td className="py-2 pr-2" />
              <td className="py-2 pr-3 whitespace-nowrap">{row.name}</td>
              <td className="py-2 pr-3" colSpan={3}>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <LogOut aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />
                  {`saiu do top 10: era ${String(row.posAnterior)}º com ${formatInt(row.valueAnterior)} leads em ${formatMonthShort(mesAnterior)}`}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
