import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LossTerm } from './data';

/**
 * Termos citados nos motivos de perda, contados por documento, da maior para a menor, com os
 * termos de cauda longa somados numa única linha final, fora da ordenação. O termo sem
 * classificação sai sem preenchimento, só com contorno, porque não tem categoria de motivo.
 */
export interface LossTermListProps {
  readonly data?: { readonly terms: readonly LossTerm[]; readonly tailCount: number; readonly tailDocumentCount: number };
  readonly height?: number;
  readonly className?: string;
}

/** Termo acima disto quebra em duas linhas no card `alto`; a linha ganha altura maior. */
const LONG_TERM_THRESHOLD = 60;
const ROW_HEIGHT_ONE_LINE = 28;
const ROW_HEIGHT_TWO_LINES = 46;

function rankByCount(rows: readonly LossTerm[]): LossTerm[] {
  return [...rows].sort((a, b) => b.documentCount - a.documentCount || a.term.localeCompare(b.term, 'pt-BR'));
}

export default function LossTermList({ data = defaultData, height, className }: LossTermListProps): ReactElement {
  const rows = rankByCount(data.terms);
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
        <span>Nenhum termo neste recorte: não houve motivo de perda registrado no período.</span>
      </div>
    );
  }

  // A cauda agregada fica fora do domínio das barras (checklist 1 e 25): sem posição no ranking,
  // ela não tem lugar comparável na escala e por isso não entra no `max` da normalização.
  const max = Math.max(...rows.map((row) => row.documentCount));
  const summary = `Lista em barras com ${String(rows.length)} termos citados em motivos de perda, contados por documento, da maior para a menor, mais uma linha final com os ${String(data.tailCount)} termos de cauda. Termo mais citado: ${leader.term}, em ${formatInt(leader.documentCount)} documentos.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <div className="flex flex-col gap-2">
        {rows.map((row) => {
          const width = (row.documentCount / max) * 100;
          const rowHeight = row.term.length > LONG_TERM_THRESHOLD ? ROW_HEIGHT_TWO_LINES : ROW_HEIGHT_ONE_LINE;
          return (
            <div className="relative shrink-0" key={row.id} role="row" style={{ height: rowHeight }}>
              {row.unclassified ? (
                <div
                  aria-hidden
                  className="absolute inset-y-0 left-0 rounded-sm border border-dashed border-text-muted"
                  style={{ width: `${String(width)}%` }}
                />
              ) : (
                <div aria-hidden className="absolute inset-y-0 left-0 rounded-sm bg-chart-1/18" style={{ width: `${String(width)}%` }} />
              )}
              <div className="relative flex h-full min-w-0 items-center justify-between gap-3 px-2">
                <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-text-secondary">
                  <span className="min-w-0 flex-1 whitespace-normal">{row.term}</span>
                  {row.unclassified ? (
                    <span className="shrink-0 text-[0.6875rem] font-medium text-text-muted">sem classificação</span>
                  ) : null}
                </span>
                <span className="font-display shrink-0 text-xs font-medium text-text-secondary">
                  {formatInt(row.documentCount)} documentos
                </span>
              </div>
            </div>
          );
        })}
        <div className="mt-2 flex min-w-0 shrink-0 items-center justify-between gap-3 px-2" role="row" style={{ height: ROW_HEIGHT_ONE_LINE }}>
          <span className="min-w-0 text-xs font-medium text-text-muted">
            Outros <span className="tabular-nums">{String(data.tailCount)}</span> termos
          </span>
          <span className="font-display shrink-0 text-xs font-medium text-text-muted">
            {formatInt(data.tailDocumentCount)} documentos
          </span>
        </div>
      </div>
      <p className="mt-3 shrink-0 text-[0.6875rem] text-text-muted">
        Contagem por documento que cita o termo, não por ocorrência; a barra mede contra o maior
        termo classificado da lista, e a linha de cauda agregada fica fora dessa escala.
      </p>
    </div>
  );
}
