import { Fragment, useMemo } from 'react';
import { Filter, Unplug } from 'lucide-react';

import { formatDays, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SalesTeam } from './data';

/**
 * Dias até o fechamento por time comercial, com dois casos limite: um time com um único executivo
 * (sem subtotal redundante) e um time que o filtro esvaziou (recolhido com a frase "nenhuma linha
 * neste recorte", sem sumir da tabela). O subtotal de time e o total geral são a MEDIANA dos dias,
 * não a soma nem a média: um único negócio muito lento distorce a média, a mediana não. O total
 * geral é recalculado só com as linhas visíveis, ignorando o grupo vazio. HTML com Tailwind.
 */
export interface MedianDaysTableProps {
  readonly data?: readonly SalesTeam[];
  readonly height?: number;
  readonly className?: string;
}

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) return sorted[mid] ?? null;
  const lower = sorted[mid - 1];
  const upper = sorted[mid];
  return lower === undefined || upper === undefined ? null : (lower + upper) / 2;
}

export default function MedianDaysTable({ data = defaultData, height, className }: MedianDaysTableProps) {
  const style = height === undefined ? undefined : { height };
  const visibleDays = useMemo(() => data.flatMap((team) => team.executives.map((row) => row.diasParaFechar)), [data]);
  const grandMedian = median(visibleDays);
  const emptyTeams = data.filter((team) => team.executives.length === 0).length;

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum time neste recorte: não há dias até o fechamento para comparar.
      </div>
    );
  }

  const bigTeam = [...data].sort((a, b) => b.executives.length - a.executives.length)[0];
  const bigMedian = bigTeam ? median(bigTeam.executives.map((row) => row.diasParaFechar)) : null;
  const summary = `Tabela agrupada por time comercial com dias até o fechamento, subtotal por mediana: ${String(data.length)} times, ${String(emptyTeams)} vazio, ${String(visibleDays.length)} negócios visíveis. ${bigTeam && bigMedian !== null ? `${bigTeam.name} soma mediana de ${formatDays(bigMedian)}` : 'Um time tem só um executivo'}. Total geral: mediana de ${grandMedian === null ? formatUnavailable() : formatDays(grandMedian)}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <table className="w-full min-w-0 border-collapse text-xs">
        <thead>
          <tr className="border-b border-line-subtle">
            <th className="px-2 py-1.5 text-left text-[0.6875rem] font-medium text-text-muted" scope="col">
              Time / executivo
            </th>
            <th className="px-2 py-1.5 text-right text-[0.6875rem] font-medium text-text-muted" scope="col">
              Dias até o fechamento
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((team, teamIndex) => {
            const teamMedian = team.executives.length > 1 ? median(team.executives.map((row) => row.diasParaFechar)) : null;
            return (
              <Fragment key={team.id}>
                {teamIndex > 0 ? (
                  <tr aria-hidden>
                    <td className="h-2" colSpan={2} />
                  </tr>
                ) : null}
                {team.executives.length === 0 ? (
                  <tr className="bg-surface-overlay/60">
                    <th className="px-2 py-1.5 text-left font-semibold text-text-primary" scope="rowgroup">
                      {team.name}
                    </th>
                    <td className="px-2 py-1.5 text-right text-text-muted italic">
                      <span className="inline-flex items-center gap-1.5">
                        <Filter aria-hidden className="size-3.5" />
                        Nenhuma linha neste recorte
                      </span>
                    </td>
                  </tr>
                ) : (
                  <tr className="bg-surface-overlay/60">
                    <th className="px-2 py-1.5 text-left font-semibold text-text-primary" scope="rowgroup">
                      {team.name}
                    </th>
                    <td
                      className={cn(
                        'px-2 py-1.5 text-right font-display tabular-nums',
                        teamMedian === null ? 'text-[0.6875rem] text-text-muted italic' : 'font-semibold text-text-primary',
                      )}
                    >
                      {teamMedian === null ? 'único negócio, sem subtotal' : `mediana ${formatDays(teamMedian)}`}
                    </td>
                  </tr>
                )}
                {team.executives.map((row) => (
                  <tr key={row.id}>
                    <td className="py-1.5 pr-2 pl-6 text-text-secondary">{row.name}</td>
                    <td className="px-2 py-1.5 text-right font-display text-text-secondary tabular-nums">{formatDays(row.diasParaFechar)}</td>
                  </tr>
                ))}
              </Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-line-strong bg-surface-sunken">
            <td className="px-2 py-1.5 font-semibold text-text-primary">Total geral (linhas visíveis)</td>
            <td className="px-2 py-1.5 text-right font-display font-semibold text-text-primary tabular-nums">
              {grandMedian === null ? (
                <span className="inline-flex items-center gap-1.5 text-text-muted">
                  <Unplug aria-hidden className="size-3.5" />
                  {formatUnavailable()}
                </span>
              ) : (
                `mediana ${formatDays(grandMedian)}`
              )}
            </td>
          </tr>
        </tfoot>
      </table>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        {formatInt(visibleDays.length)} negócios visíveis em {formatInt(data.length)} times, {formatInt(emptyTeams)} vazio no recorte.
      </p>
    </div>
  );
}
