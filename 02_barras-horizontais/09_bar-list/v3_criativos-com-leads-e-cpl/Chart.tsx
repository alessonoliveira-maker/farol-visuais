import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Creative } from './data';

/**
 * Lista de criativos por leads qualificados no mês, da maior para a menor: barra principal com
 * nome, contagem e percentual do total, e uma segunda barra fina abaixo com o custo por lead
 * qualificado (CPL) relativo entre os criativos. O criativo pausado sai em neutro com etiqueta.
 */
export interface CreativeListProps {
  readonly data?: readonly Creative[];
  readonly height?: number;
  readonly className?: string;
}

const MAIN_BAR_HEIGHT = 22;
const CPL_ROW_HEIGHT = 11;
const ROW_GAP_INNER = 2;

function rankByLeads(rows: readonly Creative[]): Creative[] {
  return [...rows].sort((a, b) => b.qualifiedLeads - a.qualifiedLeads || a.name.localeCompare(b.name, 'pt-BR'));
}

/** Percentual inteiro por linha, somando exatamente 100 pelo método do maior resto (NUM-2). */
function allocatePercent(values: readonly number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map((value) => Math.floor(value));
  const used = floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  const result = [...floors];
  let remaining = 100 - used;
  for (let i = 0; i < order.length && remaining > 0; i += 1) {
    const item = order[i];
    if (!item) continue;
    result[item.index] = (result[item.index] ?? 0) + 1;
    remaining -= 1;
  }
  return result;
}

export default function CreativeList({ data = defaultData, height, className }: CreativeListProps): ReactElement {
  const rows = rankByLeads(data);
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum criativo neste recorte: não houve lead qualificado no período.</span>
      </div>
    );
  }

  const maxLeads = Math.max(...rows.map((row) => row.qualifiedLeads));
  const maxCpl = Math.max(...rows.map((row) => row.cpl));
  const shares = allocatePercent(rows.map((row) => row.qualifiedLeads));
  const leader = rows[0];
  const pausedCount = rows.filter((row) => row.paused).length;

  const summary = leader
    ? `Lista em barras com ${String(rows.length)} criativos por leads qualificados no mês, da maior para a menor, com o custo por lead numa segunda barra abaixo de cada um. Lidera ${leader.name}, com ${formatInt(leader.qualifiedLeads)} leads. ${String(pausedCount)} criativo${pausedCount === 1 ? '' : 's'} pausado${pausedCount === 1 ? '' : 's'} no período.`
    : '';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <div className="flex flex-col gap-2">
        {rows.map((creative, index) => {
          const share = shares[index] ?? 0;
          const leadsWidth = (creative.qualifiedLeads / maxLeads) * 100;
          const cplWidth = (creative.cpl / maxCpl) * 100;
          const mainBarClass = creative.paused ? 'bg-text-muted/15' : 'bg-chart-1/18';
          // Valor e percentual em text-secondary (ACE-3/ACE-8): text-muted sobre a barra mede abaixo de 4,5:1; a hierarquia sai do peso.
          const textClass = 'text-text-secondary';
          // Nome sempre em text-secondary: sobre a própria barra do criativo pausado, text-muted
          // mede 4,23:1 no escuro e 4,42:1 no claro, abaixo do piso 4,5:1 da ACE-3 (17.10).
          const nameClass = 'text-text-secondary';
          return (
            <div className="flex flex-col" key={creative.id} role="row" style={{ gap: ROW_GAP_INNER }}>
              <div className="relative shrink-0" style={{ minHeight: MAIN_BAR_HEIGHT }}>
                <div aria-hidden className={cn('absolute inset-y-0 left-0 rounded-sm', mainBarClass)} style={{ width: `${String(leadsWidth)}%` }} />
                <div className="relative flex min-h-[22px] min-w-0 items-center justify-between gap-3 px-2 py-0.5">
                  <span className={cn('flex min-w-0 items-center gap-1.5 text-xs font-medium', nameClass)} role="rowheader">
                    <span className="min-w-0 flex-1 whitespace-normal">{creative.name}</span>
                    {creative.paused ? (
                      <span className="shrink-0 rounded-sm bg-surface-overlay px-1 py-0.5 text-[0.6875rem] font-medium text-text-muted">
                        pausado
                      </span>
                    ) : null}
                  </span>
                  <span className={cn('font-display shrink-0 text-xs font-medium', textClass)} role="cell">
                    {formatInt(creative.qualifiedLeads)} qualificados <span className="font-normal">({formatPercent(share / 100, 0)})</span>
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 px-2" role="cell" style={{ height: CPL_ROW_HEIGHT }}>
                <div aria-hidden className="relative h-1.5 flex-1 rounded-sm bg-surface-sunken">
                  <div className="absolute inset-y-0 left-0 rounded-sm bg-text-muted/50" style={{ width: `${String(cplWidth)}%` }} />
                </div>
                <span className="font-display shrink-0 text-[0.6875rem] text-text-muted">{formatCurrencyCompact(creative.cpl)} CPL</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 shrink-0 text-[0.6875rem] text-text-muted">
        Barra principal proporcional ao maior número de leads da lista; a barra fina de CPL é
        proporcional ao maior CPL da lista, e nela a barra maior é o CPL pior, sentido invertido da
        barra principal.
      </p>
    </div>
  );
}
