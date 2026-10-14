import { ArrowDown, ArrowUp, Filter, Minus } from 'lucide-react';

import { formatDays, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, goodDirection, mesAnterior, mesAtual, type RankingRow } from './data';

/**
 * Ranking de ciclo médio de venda em que menor é melhor: reduzir o ciclo sobe no ranking, e a
 * cor da variação segue essa polaridade, não o sinal do número. Duas posições podem empatar
 * (competição padrão: "4=" repete a posição e a seguinte pula o número saltado).
 */
export interface RankingEmpateProps {
  readonly data?: readonly RankingRow[];
  readonly className?: string;
}

function DirectionIcon({ delta }: { readonly delta: number }) {
  if (delta > 0) return <ArrowUp aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />;
  if (delta < 0) return <ArrowDown aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />;
  return <Minus aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />;
}

export default function RankingEmpate({ data = defaultData, className }: RankingEmpateProps) {
  const rows = [...data].sort((a, b) => a.pos - b.pos);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve ciclo de venda medido no período.</span>
      </div>
    );
  }

  const posCount = new Map<number, number>();
  for (const row of rows) posCount.set(row.pos, (posCount.get(row.pos) ?? 0) + 1);

  const leader = rows[0];
  if (!leader) return null;
  const tied = rows.filter((row) => (posCount.get(row.pos) ?? 0) > 1);
  const biggestDrop = rows.reduce((best, row) => (row.value - row.valueAnterior < best.value - best.valueAnterior ? row : best), leader);

  const summary = [
    `Tabela de ranking do ciclo médio de venda de ${String(rows.length)} executivos em ${formatMonthShort(mesAtual)}; menor é melhor.`,
    `Lidera ${leader.name}, com ${formatDays(leader.value)}.`,
    tied.length > 1 ? `${tied.map((row) => row.name).join(' e ')} empatam.` : '',
    `Maior redução: ${biggestDrop.name}, de ${formatDays(biggestDrop.valueAnterior)} para ${formatDays(biggestDrop.value)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('h-full w-full min-w-0', className)}>
      <p className="mb-2 text-xs text-text-secondary tabular-nums">
        {'Ordenado do menor para o maior ciclo médio de venda: menor é melhor. Empate usa competição padrão, "4=" repete a posição e a próxima pula o número.'}
      </p>
      <div className="min-w-0 overflow-auto">
        <table aria-label={summary} className="w-full min-w-[440px] border-collapse text-xs" role="table">
          <thead>
            <tr className="border-b border-line-subtle text-text-muted">
              <th className="w-11 py-2 pr-2 text-left font-medium" scope="col">#</th>
              <th className="py-2 pr-3 text-left font-medium" scope="col">Executivo</th>
              <th className="py-2 pr-3 text-left font-medium" scope="col">{`Variação de posição desde ${formatMonthShort(mesAnterior)}`}</th>
              <th className="py-2 pr-3 text-right font-medium" scope="col">{`Ciclo ${formatMonthShort(mesAtual)}`}</th>
              <th className="py-2 text-right font-medium" scope="col">{`Variação vs ${formatMonthShort(mesAnterior)}`}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isTied = (posCount.get(row.pos) ?? 0) > 1;
              const deltaPos = row.posAnterior - row.pos;
              const deltaValue = row.value - row.valueAnterior;
              const isGood = goodDirection === 'down' ? deltaValue < 0 : deltaValue > 0;
              const isFlatValue = deltaValue === 0;
              return (
                <tr className="border-b border-line-subtle last:border-0" key={row.id}>
                  <td className="py-2 pr-2 font-display text-text-secondary tabular-nums">{`${String(row.pos)}º${isTied ? '=' : ''}`}</td>
                  <td className="py-2 pr-3 font-medium text-text-primary">{row.name}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={cn('inline-flex items-center gap-1', deltaPos === 0 ? 'text-text-secondary' : 'text-text-primary')}
                    >
                      <DirectionIcon delta={deltaPos} />
                      <span className="font-display tabular-nums">
                        {deltaPos === 0 ? 'manteve' : `${deltaPos > 0 ? 'subiu' : 'caiu'} ${String(Math.abs(deltaPos))}`}
                      </span>
                      <span className="text-text-muted tabular-nums">{`(${String(row.posAnterior)}º → ${String(row.pos)}º${isTied ? '=' : ''})`}</span>
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-right font-display tabular-nums text-text-primary">{formatDays(row.value)}</td>
                  <td className="py-2 text-right">
                    <span
                      className={cn(
                        'font-display tabular-nums',
                        isFlatValue ? 'text-text-secondary' : isGood ? 'text-positive' : 'text-negative',
                      )}
                    >
                      {isFlatValue ? 'estável' : `${deltaValue > 0 ? '+' : '−'}${formatDays(Math.abs(deltaValue))}`}
                    </span>{' '}
                    <span className="text-text-muted">{`contra ${formatDays(row.valueAnterior)}`}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
