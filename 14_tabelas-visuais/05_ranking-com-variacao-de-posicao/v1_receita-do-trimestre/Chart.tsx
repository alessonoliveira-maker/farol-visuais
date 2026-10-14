import { ArrowDown, ArrowUp, Filter, Minus } from 'lucide-react';

import { formatCurrencyCompact, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periodoAnterior, periodoAtual, type RankingRow } from './data';

/**
 * Tabela de ranking por receita reconhecida: cada linha traz a posição atual, a variação de
 * posição contra o trimestre anterior (ícone, número de posições e a posição anterior escritos,
 * nunca só a seta) e a variação do valor com a base nomeada. Rank e valor podem andar em
 * direções diferentes: uma linha pode manter a posição com o valor em queda, e vice versa.
 */
export interface RankingPositionTableProps {
  readonly data?: readonly RankingRow[];
  readonly className?: string;
}

function DirectionIcon({ delta }: { readonly delta: number }) {
  if (delta > 0) return <ArrowUp aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />;
  if (delta < 0) return <ArrowDown aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />;
  return <Minus aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />;
}

export default function RankingPositionTable({ data = defaultData, className }: RankingPositionTableProps) {
  const rows = [...data].sort((a, b) => a.pos - b.pos);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve receita reconhecida no período.</span>
      </div>
    );
  }

  const leader = rows[0];
  if (!leader) return null;
  const biggestJump = rows.reduce((best, row) => {
    const jump = row.posAnterior - row.pos;
    const bestJump = best.posAnterior - best.pos;
    return jump > bestJump ? row : best;
  }, leader);
  const jumpSize = biggestJump.posAnterior - biggestJump.pos;

  const summary = [
    `Tabela de ranking com a receita reconhecida de ${String(rows.length)} executivos em ${periodoAtual}, ordenada da maior para a menor.`,
    `Lidera ${leader.name}, com ${formatCurrencyCompact(leader.value)}.`,
    jumpSize > 0
      ? `Maior salto: ${biggestJump.name} subiu ${String(jumpSize)} posições desde ${periodoAnterior}.`
      : `Nenhum executivo subiu posição desde ${periodoAnterior}.`,
  ].join(' ');

  return (
    <div className={cn('h-full w-full min-w-0 overflow-auto', className)}>
      <table aria-label={summary} className="w-full min-w-[440px] border-collapse text-xs" role="table">
        <thead>
          <tr className="border-b border-line-subtle text-text-muted">
            <th className="w-9 py-2 pr-2 text-left font-medium" scope="col">
              #
            </th>
            <th className="py-2 pr-3 text-left font-medium" scope="col">
              Executivo
            </th>
            <th className="py-2 pr-3 text-left font-medium" scope="col">
              Variação de posição desde <span className="whitespace-nowrap">{periodoAnterior}</span>
            </th>
            <th className="py-2 pr-3 text-right font-medium" scope="col">
              Receita <span className="whitespace-nowrap">{periodoAtual}</span>
            </th>
            <th className="py-2 text-right font-medium" scope="col">
              Variação vs <span className="whitespace-nowrap">{periodoAnterior}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const deltaPos = row.posAnterior - row.pos;
            const deltaValue = row.valueAnterior === 0 ? 0 : (row.value - row.valueAnterior) / row.valueAnterior;
            return (
              <tr className="border-b border-line-subtle last:border-0" key={row.id}>
                <td className="py-2 pr-2 font-display text-text-secondary tabular-nums">{`${String(row.pos)}º`}</td>
                <td className="py-2 pr-3 font-medium text-text-primary">{row.name}</td>
                <td className="py-2 pr-3">
                  <span
                    className={cn('inline-flex items-center gap-1', deltaPos === 0 ? 'text-text-secondary' : 'text-text-primary')}
                  >
                    <DirectionIcon delta={deltaPos} />
                    <span className="font-display tabular-nums">
                      {deltaPos === 0 ? 'manteve' : `${deltaPos > 0 ? 'subiu' : 'caiu'} ${String(Math.abs(deltaPos))}`}
                    </span>
                    <span className="text-text-muted tabular-nums">{`(${String(row.posAnterior)}º → ${String(row.pos)}º)`}</span>
                  </span>
                </td>
                <td className="py-2 pr-3 text-right font-display tabular-nums text-text-primary">{formatCurrencyCompact(row.value)}</td>
                <td className="py-2 text-right">
                  <span
                    className={cn(
                      'font-display tabular-nums',
                      deltaValue > 0 ? 'text-positive' : deltaValue < 0 ? 'text-negative' : 'text-text-secondary',
                    )}
                  >
                    {deltaValue === 0 ? 'estável' : `${deltaValue > 0 ? '+' : '−'}${formatPercent(Math.abs(deltaValue))}`}
                  </span>{' '}
                  <span className="text-text-muted">{`contra ${formatCurrencyCompact(row.valueAnterior)}`}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
