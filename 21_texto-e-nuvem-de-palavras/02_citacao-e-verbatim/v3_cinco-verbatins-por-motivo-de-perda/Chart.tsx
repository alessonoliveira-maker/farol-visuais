import { Filter } from 'lucide-react';
import { useState } from 'react';

import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LossReason, type LossReasons, type LossVerbatim } from './data';

/**
 * Seletor dos maiores motivos de perda e, abaixo, até cinco verbatins do motivo escolhido. Cada
 * verbatim leva a parcela das respostas do motivo que ele representa e a lista sai ordenada por
 * essa parcela, da maior para a menor. A citação ilustra o motivo já medido em outro visual: a
 * contagem do motivo e a parcela ficam sempre ao lado dela.
 */
export interface LossVerbatimsProps {
  readonly data?: LossReasons;
  readonly className?: string;
}

/** Teto de verbatins por motivo: acima disso o leitor para de ler. */
const MAX_VERBATIMS = 5;

/** Parcela de uma frase dentro do motivo; `null` sem base, nunca zero (EST-1b). */
function shareOf(similar: number, total: number): number | null {
  return total > 0 ? similar / total : null;
}

/** Ordena pela parcela decrescente; no empate, o mês mais recente vem antes. */
function rankVerbatims(reason: LossReason): readonly LossVerbatim[] {
  return [...reason.verbatims]
    .sort((a, b) => b.similarCount - a.similarCount || b.month.localeCompare(a.month))
    .slice(0, MAX_VERBATIMS);
}

function periodOf(data: LossReasons): string {
  return `de ${formatMonthShort(data.periodStart)} a ${formatMonthShort(data.periodEnd)}`;
}

function summaryOf(data: LossReasons, reason: LossReason, shown: readonly LossVerbatim[]): string {
  const share = shareOf(reason.responseCount, data.totalResponses);
  const head = `Verbatins dos maiores motivos de perda ${periodOf(data)}. Motivo aberto: ${reason.label}, com ${formatInt(reason.responseCount)} de ${formatInt(data.totalResponses)} respostas${share === null ? '' : `, ${formatPercent(share, 0)}`}.`;
  return shown.length === 0
    ? `${head} Nenhum verbatim registrado para esse motivo.`
    : `${head} ${formatInt(shown.length)} verbatins, ordenados pela parcela de cada um.`;
}

export default function LossVerbatimList({ data = defaultData, className }: LossVerbatimsProps) {
  const [selectedId, setSelectedId] = useState(data.selectedId);
  const reason = data.reasons.find((r) => r.id === selectedId) ?? data.reasons[0];

  if (reason === undefined) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum motivo de perda neste recorte: não há verbatins a mostrar.</span>
      </div>
    );
  }

  const shown = rankVerbatims(reason);
  const reasonShare = shareOf(reason.responseCount, data.totalResponses);

  return (
    <div
      aria-label={summaryOf(data, reason, shown)}
      className={cn('flex h-full w-full min-w-0 flex-col gap-3', className)}
      role="group"
    >
      <div className="flex flex-wrap gap-2" role="tablist">
        {data.reasons.map((item) => {
          const active = item.id === reason.id;
          return (
            <button
              aria-selected={active}
              className={cn(
                'flex items-baseline gap-1.5 rounded-md px-2.5 py-1.5 text-xs outline-offset-2 focus-visible:outline-2 focus-visible:outline-chart-1',
                active ? 'bg-surface-sunken font-semibold text-text-primary' : 'font-medium text-text-secondary',
              )}
              key={item.id}
              onClick={() => {
                setSelectedId(item.id);
              }}
              role="tab"
              type="button"
            >
              {item.chip}
              <span className="kpi-number text-[0.6875rem] font-medium text-text-muted">{formatInt(item.responseCount)}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-text-secondary" role="tabpanel">
        <span className="font-semibold text-text-primary">{reason.chip}</span>: {formatInt(reason.responseCount)} das{' '}
        {formatInt(data.totalResponses)} respostas de perda
        {reasonShare === null ? '' : `, ${formatPercent(reasonShare, 0)}`}. Verbatins ordenados pela parcela.
      </p>

      {shown.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-text-muted" role="status">
          <Filter aria-hidden className="size-4 shrink-0" />
          <span>Nenhum verbatim registrado para esse motivo: não há frase a citar, e nenhuma foi inventada.</span>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {shown.map((verbatim) => {
            const share = shareOf(verbatim.similarCount, reason.responseCount);
            return (
              <li className="flex min-w-0 gap-3 border-s-2 border-chart-1 ps-3" key={verbatim.id}>
                <div className="w-14 shrink-0">
                  <p className="kpi-number m-0 text-sm leading-5 font-semibold text-text-primary">
                    {share === null ? '' : formatPercent(share, 0)}
                  </p>
                  <p className="m-0 text-[0.6875rem] leading-4 text-text-muted">do motivo</p>
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-sm leading-5 text-text-primary">{verbatim.text}</p>
                  <p className="m-0 text-[0.6875rem] leading-4 text-text-muted">
                    {verbatim.outcome}, {formatMonthShort(verbatim.month)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
