import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt, formatMonthLong } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadOrigin } from './data';

/**
 * Lista compacta das origens de lead do mês, da maior para a menor: cada linha é ao mesmo tempo
 * rótulo, barra de fundo proporcional ao maior valor da lista e contagem à direita. Não tem eixo:
 * a barra dá a escala relativa e o número escrito é a leitura precisa.
 */
export interface LeadOriginListProps {
  readonly data?: { readonly month: string; readonly origins: readonly LeadOrigin[] };
  readonly height?: number;
  readonly className?: string;
}

/** Altura de linha fixa: cabe nome e contagem numa fonte de 12 px sem apertar. */
const ROW_HEIGHT = 24;

function rankByCount(rows: readonly LeadOrigin[]): LeadOrigin[] {
  return [...rows].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'));
}

export default function LeadOriginList({ data = defaultData, height, className }: LeadOriginListProps): ReactElement {
  const rows = rankByCount(data.origins);
  const style = height === undefined ? undefined : { height };
  const monthLabel = formatMonthLong(data.month);
  const leader = rows[0];

  if (!leader) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem de lead neste recorte: não há leads para listar em {monthLabel}.</span>
      </div>
    );
  }

  const max = Math.max(...rows.map((row) => row.count));
  const second = rows[1];
  const summary = second
    ? `Lista em barras com as ${String(rows.length)} origens de lead de ${monthLabel}, da maior para a menor. Lidera ${leader.name}, com ${formatInt(leader.count)} leads, ${formatInt(leader.count - second.count)} à frente de ${second.name}.`
    : `Lista em barras com a única origem de lead de ${monthLabel}: ${leader.name}, com ${formatInt(leader.count)} leads.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <div className="flex flex-col gap-1.5">
        {rows.map((origin) => {
          const width = (origin.count / max) * 100;
          return (
            <div className="relative shrink-0" key={origin.id} role="row" style={{ height: ROW_HEIGHT }}>
              <div aria-hidden className="absolute inset-y-0 left-0 rounded-sm bg-chart-1/20" style={{ width: `${String(width)}%` }} />
              <div className="relative flex h-full min-w-0 items-center justify-between gap-3 px-2">
                <span className="min-w-0 text-xs font-medium whitespace-nowrap text-text-secondary" role="rowheader">
                  {origin.name}
                </span>
                <span className="font-display shrink-0 text-xs font-medium text-text-secondary" role="cell">
                  {formatInt(origin.count)} leads
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">Barra proporcional à maior origem da lista.</p>
    </div>
  );
}
