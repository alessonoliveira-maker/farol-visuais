import { Filter, Trophy } from 'lucide-react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginWins } from './data';

/**
 * Pictograma isotype: uma fileira por origem, um troféu por vitória, todos do mesmo tamanho. Mais
 * vitórias é mais ícones, nunca ícone maior, e o número exato fecha cada fileira.
 */
export interface WinsPictogramProps {
  readonly data?: readonly OriginWins[];
  readonly className?: string;
}

const UNIT = 1;
const ICON_STROKE = 2.5;
const ICON_COLOR = 'var(--chart-1)';
const NEUTRAL_COLOR = 'var(--text-muted)';

/** Maior total primeiro; a categoria de ausência fica sempre por último, qualquer que seja o total. */
function orderRows(rows: readonly OriginWins[]): OriginWins[] {
  return [...rows].sort((a, b) => Number(a.isUndeclared === true) - Number(b.isUndeclared === true) || b.wins - a.wins);
}

/** Soma das vitórias; `null` para lista vazia, porque 0 vitória de 0 origem não é medida (EST-1b). */
function totalWins(rows: readonly OriginWins[]): number | null {
  if (rows.length === 0) return null;
  return rows.reduce((sum, row) => sum + row.wins, 0);
}

export default function WinsPictogram({ data = defaultData, className }: WinsPictogramProps) {
  const total = totalWins(data);

  if (total === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem com vitória neste semestre: não há fileira para desenhar.</span>
      </div>
    );
  }

  const rows = orderRows(data);
  const leader = rows[0];
  const last = rows[rows.length - 1];
  const summary =
    `Pictograma com ${formatInt(total)} vitórias do semestre em ${formatInt(rows.length)} origens, um troféu por vitória. ` +
    `A origem que lidera é ${leader?.name.toLowerCase() ?? ''}, com ${formatInt(leader?.wins ?? 0)}; ` +
    `${last?.name.toLowerCase() ?? ''} fecha com ${formatInt(last?.wins ?? 0)}.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col justify-between gap-3', className)} role="figure">
      <ul aria-hidden className="m-0 flex list-none flex-col gap-2 p-0">
        {rows.map((row, rowIndex) => {
          const isLeader = rowIndex === 0;
          return (
            <li className="grid min-h-6 grid-cols-[9rem_minmax(0,1fr)_2rem] items-center gap-x-2" key={row.id}>
              <span className={cn('text-xs leading-4', isLeader ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                {row.name}
              </span>
              <span className="flex flex-wrap gap-1">
                {Array.from({ length: row.wins }, (_, iconIndex) => (
                  <Trophy
                    aria-hidden
                    className="size-4 shrink-0"
                    key={`${row.id}-${String(iconIndex)}`}
                    strokeWidth={ICON_STROKE}
                    style={{ color: row.isUndeclared === true ? NEUTRAL_COLOR : ICON_COLOR }}
                  />
                ))}
              </span>
              <span className={cn('font-display text-right text-sm tabular-nums', isLeader ? 'font-bold text-text-primary' : 'font-semibold text-text-secondary')}>
                {formatInt(row.wins)}
              </span>
            </li>
          );
        })}
      </ul>

      <p aria-hidden className="m-0 flex items-center gap-2 text-xs leading-5 text-text-muted">
        <Trophy aria-hidden className="size-4 shrink-0" strokeWidth={ICON_STROKE} style={{ color: ICON_COLOR }} />
        <span className="tabular-nums">
          {formatInt(UNIT)} ícone = {formatInt(UNIT)} vitória
        </span>
        <span className="ml-auto tabular-nums">total de {formatInt(total)} vitórias</span>
      </p>
    </figure>
  );
}
