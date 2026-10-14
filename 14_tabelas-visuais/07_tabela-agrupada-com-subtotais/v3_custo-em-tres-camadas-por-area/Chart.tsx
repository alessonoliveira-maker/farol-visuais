import { Fragment, useMemo } from 'react';

import { formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CostArea } from './data';

/**
 * Custo em três camadas por área, com cabeçalho duplo (o bloco "Camadas de custo" sobre as três
 * colunas de valor), subtotal por área e total geral fixo no rodapé (position sticky). Subtotal e
 * total geral são SOMA: cada subtotal soma as linhas do grupo e o total geral soma os subtotais,
 * em cada camada e na coluna de total. Nenhuma camada tem cor semântica: custo não tem bom nem
 * ruim aqui, só camada. HTML com Tailwind.
 */
export interface LayeredCostTableProps {
  readonly data?: readonly CostArea[];
  readonly height?: number;
  readonly className?: string;
}

/** Rótulo de cada bloco de custo: nome da camada, não um número medido. */
const LAYER_LABELS = ['Camada 1', 'Camada 2', 'Camada 3'] as const;
/** Nota fixa do rodapé: os números do dado (contagem, áreas) vêm por formatInt ao lado. */
const LAYER_FOOTNOTE = 'Camada 1, 2 e 3 de 2026, em reais.';

function rowTotal(row: { camada1: number; camada2: number; camada3: number }): number {
  return row.camada1 + row.camada2 + row.camada3;
}

interface LayeredCost {
  readonly camada1: number;
  readonly camada2: number;
  readonly camada3: number;
}

function sumCenters(rows: readonly LayeredCost[]): LayeredCost {
  return {
    camada1: rows.reduce((sum, row) => sum + row.camada1, 0),
    camada2: rows.reduce((sum, row) => sum + row.camada2, 0),
    camada3: rows.reduce((sum, row) => sum + row.camada3, 0),
  };
}

export default function LayeredCostTable({ data = defaultData, height, className }: LayeredCostTableProps) {
  const style = height === undefined ? undefined : { height };
  const areas = useMemo(() => data.map((area) => ({ ...area, subtotal: sumCenters(area.centers) })), [data]);
  const grandTotal = useMemo(() => sumCenters(areas.map((area) => area.subtotal)), [areas]);
  const totalCenters = areas.reduce((sum, area) => sum + area.centers.length, 0);

  if (areas.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhuma área neste recorte: não há custo para comparar por camada.
      </div>
    );
  }

  const summary = `Tabela agrupada por área com custo de 2026 em três camadas, subtotal por área e total geral por soma: ${String(areas.length)} áreas, ${String(totalCenters)} centros de custo. Total geral ${formatCurrencyCompact(rowTotal(grandTotal))}, sendo ${formatCurrencyCompact(grandTotal.camada1)} na camada 1.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="min-w-0 flex-1 overflow-y-auto rounded-md border border-line-subtle" style={{ maxHeight: 380 }}>
        <table className="w-full min-w-0 border-collapse text-xs">
          <thead>
            <tr className="border-b border-line-subtle text-[0.6875rem] font-medium text-text-muted">
              <th className="px-2 py-1.5 text-left" rowSpan={2} scope="col">
                Área / centro de custo
              </th>
              <th className="px-2 py-1 text-center" colSpan={3} scope="colgroup">
                Camadas de custo
              </th>
              <th className="px-2 py-1.5 text-right" rowSpan={2} scope="col">
                Total
              </th>
            </tr>
            <tr className="border-b border-line-subtle text-[0.6875rem] font-medium text-text-muted">
              <th className="px-2 py-1 text-right" scope="col">
                {LAYER_LABELS[0]}
              </th>
              <th className="px-2 py-1 text-right" scope="col">
                {LAYER_LABELS[1]}
              </th>
              <th className="px-2 py-1 text-right" scope="col">
                {LAYER_LABELS[2]}
              </th>
            </tr>
          </thead>
          <tbody>
            {areas.map((area, areaIndex) => (
              <Fragment key={area.id}>
                {areaIndex > 0 ? (
                  <tr aria-hidden>
                    <td className="h-1.5" colSpan={5} />
                  </tr>
                ) : null}
                {area.centers.map((row) => (
                  <tr key={row.id}>
                    <td className="py-1 pr-2 pl-6 text-text-secondary">{row.name}</td>
                    <td className="px-2 py-1 text-right font-display text-text-secondary tabular-nums">{formatCurrencyCompact(row.camada1)}</td>
                    <td className="px-2 py-1 text-right font-display text-text-secondary tabular-nums">{formatCurrencyCompact(row.camada2)}</td>
                    <td className="px-2 py-1 text-right font-display text-text-secondary tabular-nums">{formatCurrencyCompact(row.camada3)}</td>
                    <td className="px-2 py-1 text-right font-display text-text-secondary tabular-nums">{formatCurrencyCompact(rowTotal(row))}</td>
                  </tr>
                ))}
                <tr className="bg-surface-overlay/60">
                  <th className="px-2 py-1.5 text-left font-semibold text-text-primary" scope="rowgroup">
                    {area.name}
                  </th>
                  <td className="px-2 py-1.5 text-right font-display font-semibold text-text-primary tabular-nums">
                    {formatCurrencyCompact(area.subtotal.camada1)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-display font-semibold text-text-primary tabular-nums">
                    {formatCurrencyCompact(area.subtotal.camada2)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-display font-semibold text-text-primary tabular-nums">
                    {formatCurrencyCompact(area.subtotal.camada3)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-display font-semibold text-text-primary tabular-nums">
                    {formatCurrencyCompact(rowTotal(area.subtotal))}
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-line-strong bg-surface-sunken">
              <td className="sticky bottom-0 z-10 bg-surface-sunken px-2 py-1.5 font-semibold text-text-primary">Total geral</td>
              <td className="sticky bottom-0 z-10 bg-surface-sunken px-2 py-1.5 text-right font-display font-semibold text-text-primary tabular-nums">
                {formatCurrencyCompact(grandTotal.camada1)}
              </td>
              <td className="sticky bottom-0 z-10 bg-surface-sunken px-2 py-1.5 text-right font-display font-semibold text-text-primary tabular-nums">
                {formatCurrencyCompact(grandTotal.camada2)}
              </td>
              <td className="sticky bottom-0 z-10 bg-surface-sunken px-2 py-1.5 text-right font-display font-semibold text-text-primary tabular-nums">
                {formatCurrencyCompact(grandTotal.camada3)}
              </td>
              <td className="sticky bottom-0 z-10 bg-surface-sunken px-2 py-1.5 text-right font-display font-semibold text-text-primary tabular-nums">
                {formatCurrencyCompact(rowTotal(grandTotal))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        {formatInt(totalCenters)} centros de custo em {formatInt(areas.length)} áreas. {LAYER_FOOTNOTE}
      </p>
    </div>
  );
}
