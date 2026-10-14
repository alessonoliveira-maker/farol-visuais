import { TriangleAlert, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, threshold as defaultThreshold, type OriginCoverage } from './data';

/**
 * Tabela de origens com volume, cobertura e CPL qualificado lado a lado. Abaixo do limiar de
 * cobertura o CPL vai para o tom mudo com o aviso, porque o número não sustenta decisão. As
 * piores coberturas ficam no topo; a origem sem declaração fica por último e visível, nunca
 * somada às demais. HTML com Tailwind, sem Recharts.
 */
export interface OriginCoverageTableProps {
  readonly data?: readonly OriginCoverage[];
  readonly threshold?: number;
  readonly className?: string;
}

/** Colunas fixas à direita; a coluna de origem toma o resto e não trunca nome. */
const COLS = 'grid grid-cols-[minmax(0,1fr)_3.5rem_7.5rem_6rem] items-center gap-x-3';

/** Cobertura em fração, ou null quando a origem não tem leads (nunca 0). */
function coverageOf(row: OriginCoverage): number | null {
  return row.leads > 0 ? row.qualified / row.leads : null;
}

/** Piores coberturas primeiro; a origem sem declaração sempre por último. */
function orderRows(rows: readonly OriginCoverage[]): readonly OriginCoverage[] {
  const named = rows.filter((r) => r.undeclared !== true);
  const undeclared = rows.filter((r) => r.undeclared === true);
  named.sort((a, b) => (coverageOf(a) ?? 0) - (coverageOf(b) ?? 0));
  return [...named, ...undeclared];
}

export default function OriginCoverageTable({
  data = defaultData,
  threshold = defaultThreshold,
  className,
}: OriginCoverageTableProps) {
  if (data.length === 0) {
    return (
      <div
        aria-label="Tabela de origens: o recorte não tem origens para mostrar."
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2', className)}
        role="status"
      >
        <Unplug aria-hidden className="size-4 text-text-muted" />
        <p className="text-xs text-text-muted">O recorte não tem origens, então não há cobertura a comparar.</p>
      </div>
    );
  }

  const rows = orderRows(data);
  const cutText = formatPercent(threshold, 0);
  const below = rows.filter((r) => {
    const c = coverageOf(r);
    return c !== null && c < threshold;
  });
  const summary = `Tabela de ${formatInt(rows.length)} origens com volume, cobertura e CPL qualificado: ${formatInt(below.length)} ficaram abaixo do limiar de ${cutText} de cobertura e têm o CPL rebaixado. Piores coberturas no topo; sem origem declarada por último.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-2', className)}
      role="table"
    >
      <p aria-hidden className="text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">
          {formatInt(below.length)} de {formatInt(rows.length)}
        </span>{' '}
        origens abaixo de {cutText} de cobertura.
      </p>

      <div className="flex flex-col" role="rowgroup">
        <div className={cn(COLS, 'h-6 text-xs text-text-muted')} role="row">
          <span role="columnheader">Origem, pior cobertura primeiro</span>
          <span className="text-right" role="columnheader">
            Leads
          </span>
          <span className="text-right" role="columnheader">
            Cobertura
          </span>
          <span className="text-right" role="columnheader">
            CPL qualificado
          </span>
        </div>

        {rows.map((r) => {
          const coverage = coverageOf(r);
          const low = coverage !== null && coverage < threshold;
          return (
            <div className={cn(COLS, 'h-6 text-xs')} key={r.id} role="row">
              <span className="min-w-0 text-text-secondary" role="cell">
                {r.name}
              </span>
              <span className="kpi-number text-right text-text-secondary" role="cell">
                {formatInt(r.leads)}
              </span>
              <span className="flex items-center justify-end gap-2" role="cell">
                <span aria-hidden className="relative h-1.5 w-8 overflow-hidden rounded-full bg-surface-sunken">
                  <span
                    className="absolute inset-y-0 left-0 bg-chart-1"
                    style={{ width: `${String((coverage ?? 0) * 100)}%` }}
                  />
                </span>
                <span className="kpi-number w-9 text-right text-text-primary">
                  {coverage === null ? formatUnavailable() : formatPercent(coverage, 0)}
                </span>
              </span>
              <span
                className={cn(
                  'kpi-number flex items-center justify-end gap-1',
                  low || r.cpl === null ? 'text-text-muted' : 'text-text-primary',
                )}
                role="cell"
              >
                {low ? <TriangleAlert aria-hidden className="size-3 shrink-0 text-warning" /> : null}
                {r.cpl === null ? formatUnavailable() : formatCurrencyCompact(r.cpl)}
              </span>
            </div>
          );
        })}
      </div>

      <p aria-hidden className="text-xs text-text-muted">
        Aviso e tom mudo no CPL das origens abaixo de {cutText} de cobertura.
      </p>
    </div>
  );
}
