import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type Campaign } from './data';

/**
 * Lista de campanhas por leads no mês, da maior para a menor, com o nome de cada campanha como
 * link para o detalhe e a campanha em foco no painel destacada na cor de marca; as demais ficam
 * em neutro, todas com a contagem escrita.
 */
export interface CampaignListProps {
  readonly data?: readonly Campaign[];
  /** Campanha em foco no painel; estado externo, não guardado em nenhuma linha. */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Nome acima disto quebra em duas linhas no card de 640 px; a linha ganha altura maior. */
const LONG_NAME_THRESHOLD = 34;
const ROW_HEIGHT_ONE_LINE = 22;
const ROW_HEIGHT_TWO_LINES = 38;

function rankByLeads(rows: readonly Campaign[]): Campaign[] {
  return [...rows].sort((a, b) => b.leads - a.leads || a.name.localeCompare(b.name, 'pt-BR'));
}

export default function CampaignList({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: CampaignListProps): ReactElement {
  const rows = rankByLeads(data);
  const style = height === undefined ? undefined : { height };
  const leader = rows[0];

  if (!leader) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte: não houve lead gerado no período.</span>
      </div>
    );
  }

  const max = Math.max(...rows.map((row) => row.leads));
  const focused = rows.find((row) => row.id === highlightId);
  const summary = focused
    ? `Lista em barras com ${String(rows.length)} campanhas por leads no mês, da maior para a menor. Lidera ${leader.name}, com ${formatInt(leader.leads)} leads. Em foco: ${focused.name}, com ${formatInt(focused.leads)} leads.`
    : `Lista em barras com ${String(rows.length)} campanhas por leads no mês, da maior para a menor. Lidera ${leader.name}, com ${formatInt(leader.leads)} leads.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <div className="flex flex-col gap-1">
        {rows.map((campaign) => {
          const isFocused = campaign.id === highlightId;
          const width = (campaign.leads / max) * 100;
          const rowHeight = campaign.name.length > LONG_NAME_THRESHOLD ? ROW_HEIGHT_TWO_LINES : ROW_HEIGHT_ONE_LINE;
          return (
            <div className="relative shrink-0" key={campaign.id} role="row" style={{ height: rowHeight }}>
              <div
                aria-hidden
                className={cn('absolute inset-y-0 left-0 rounded-sm', isFocused ? 'bg-chart-1/25' : 'bg-line-strong/15')}
                style={{ width: `${String(width)}%` }}
              />
              <div className="relative flex h-full min-w-0 items-center justify-between gap-3 px-2">
                <a
                  className={cn(
                    'min-w-0 flex-1 rounded-sm text-xs underline-offset-2 hover:underline focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    isFocused ? 'font-bold text-text-primary' : 'font-medium text-text-secondary',
                  )}
                  href={`#${campaign.id}`}
                  style={{ outlineColor: 'var(--chart-1)' }}
                >
                  {campaign.name}
                </a>
                <span
                  className={cn(
                    'font-display shrink-0 text-xs',
                    isFocused ? 'font-bold text-text-primary' : 'font-medium text-text-secondary',
                  )}
                >
                  {formatInt(campaign.leads)} leads
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
