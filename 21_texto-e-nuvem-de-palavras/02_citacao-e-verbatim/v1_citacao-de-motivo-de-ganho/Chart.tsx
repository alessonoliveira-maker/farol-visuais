import { Filter } from 'lucide-react';

import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WinQuote } from './data';

/**
 * Citação em destaque de um motivo de ganho: o trecho em corpo de 14 px com fio lateral em
 * --chart-1, a atribuição por perfil fictício e o contador de representatividade. A citação ilustra
 * um padrão já medido em outro visual e não prova frequência, então o contador (1 de 38 respostas
 * parecidas, 23% das respostas de ganho) nunca sai do cartão.
 */
export interface WinQuoteCardProps {
  readonly data?: WinQuote;
  readonly className?: string;
}

/** Parcela das respostas que a citação representa; `null` sem base, nunca zero (EST-1b). */
function shareOf(similar: number, total: number): number | null {
  return total > 0 ? similar / total : null;
}

function periodOf(data: WinQuote): string {
  return `de ${formatMonthShort(data.periodStart)} a ${formatMonthShort(data.periodEnd)}`;
}

function summaryOf(data: WinQuote, share: number | null): string {
  const period = periodOf(data);
  if (data.quote === null || share === null) {
    return `Citação do motivo de ganho ${data.reason} ${period}: nenhuma resposta do motivo pôde ser citada neste recorte.`;
  }
  return `Citação do motivo de ganho mais citado, ${data.reason}, ${period}: representa ${formatInt(1)} de ${formatInt(data.similarCount)} respostas parecidas, ${formatPercent(share, 0)} das ${formatInt(data.totalCount)} respostas de ganho. Dita por ${data.profile}, em ${formatMonthShort(data.answeredOn)}.`;
}

export default function WinQuoteCard({ data = defaultData, className }: WinQuoteCardProps) {
  const share = shareOf(data.similarCount, data.totalCount);

  if (data.quote === null || share === null) {
    return (
      <div
        aria-label={summaryOf(data, share)}
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma resposta de ganho com esse motivo neste recorte: não há frase a citar.</span>
      </div>
    );
  }

  return (
    <figure
      aria-label={summaryOf(data, share)}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col justify-center gap-4', className)}
      role="group"
    >
      <div aria-hidden className="flex flex-col gap-0.5">
        <p className="text-xs font-semibold text-text-secondary">Motivo de ganho mais citado: {data.reason}</p>
        <p className="text-[0.6875rem] text-text-muted">respostas {periodOf(data)}</p>
      </div>

      <blockquote className="m-0 border-s-4 border-chart-1 ps-4 text-sm leading-6 font-medium text-text-primary">
        {data.quote}
      </blockquote>

      <figcaption className="ps-5 text-[0.6875rem] text-text-muted">
        Dita por {data.profile}, em {formatMonthShort(data.answeredOn)}
      </figcaption>

      <div aria-hidden className="flex flex-col gap-2 ps-5">
        <p className="text-xs text-text-secondary">
          <span className="kpi-number font-semibold text-text-primary">{formatInt(1)} de {formatInt(data.similarCount)}</span>{' '}
          respostas parecidas, {formatPercent(share, 0)} das {formatInt(data.totalCount)} respostas de ganho
        </p>
        <div className="h-2 w-full overflow-hidden rounded-sm bg-surface-sunken">
          <div className="h-full bg-chart-1" style={{ width: `${String(share * 100)}%` }} />
        </div>
      </div>
    </figure>
  );
}
