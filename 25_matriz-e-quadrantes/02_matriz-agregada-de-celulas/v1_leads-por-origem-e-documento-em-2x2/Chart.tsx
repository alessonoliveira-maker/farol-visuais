import { ArrowRight, ArrowUp, CircleAlert, Filter, Unplug } from 'lucide-react';
import { useState } from 'react';

import { formatInt, formatMonthLong, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, month as defaultMonth, type LeadBox } from './data';

/**
 * Matriz agregada 2x2: leads do mês cruzados por origem identificada e documento válido. Cada caixa
 * é um botão que filtra o painel, escreve a contagem, o nome da região e a participação no total.
 * As quatro caixas têm o mesmo tamanho de propósito: a área não mede o volume, o número mede.
 */
export interface LeadsOriginDocumentMatrixProps {
  readonly data?: readonly LeadBox[];
  /** Mês do recorte, `YYYY-MM`. */
  readonly month?: string;
  /** Id da caixa filtrada na abertura; `null` é sem filtro. */
  readonly selectedId?: string | null;
  readonly height?: number;
  readonly className?: string;
}

const LABEL_W = 92;
const AXIS_GAP = 8;

/** Participação inteira que soma 100, pelo maior resto (NUM-2). Caixa sem medida fica de fora. */
function sharesOf(values: readonly (number | null)[]): readonly (number | null)[] {
  const total = values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  if (total <= 0) return values.map(() => null);
  const parts = values.map((value, index) => {
    const exact = ((value ?? 0) / total) * 100;
    return { index, floor: Math.floor(exact), rest: exact - Math.floor(exact), measured: value !== null };
  });
  let missing = 100 - parts.reduce((sum, part) => sum + part.floor, 0);
  const byRest = parts.filter((part) => part.measured).sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const part of byRest) {
    if (missing <= 0) break;
    part.floor += 1;
    missing -= 1;
  }
  return parts.map((part) => (part.measured ? part.floor : null));
}

export default function LeadsOriginDocumentMatrix({
  data = defaultData,
  month = defaultMonth,
  selectedId = null,
  height,
  className,
}: LeadsOriginDocumentMatrixProps) {
  const [selected, setSelected] = useState<string | null>(selectedId);

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: a matriz não tem o que contar.</span>
      </div>
    );
  }

  const shares = sharesOf(data.map((box) => box.leads));
  const total = data.reduce((sum, box) => sum + (box.leads ?? 0), 0);
  const shareById = new Map(data.map((box, index) => [box.id, shares[index] ?? null]));
  const find = (hasOrigin: boolean, hasDocument: boolean) =>
    data.find((box) => box.hasOrigin === hasOrigin && box.hasDocument === hasDocument);
  const best = find(true, true);
  const worst = find(false, false);
  const selectedBox = data.find((box) => box.id === selected);

  const cells: readonly (LeadBox | undefined)[] = [find(true, false), find(true, true), find(false, false), find(false, true)];

  const bestShare = best ? shareById.get(best.id) : null;
  const worstShare = worst ? shareById.get(worst.id) : null;
  const complete = bestShare != null && worstShare != null && worst?.leads != null;
  const readLine = complete
    ? `${formatPercent(bestShare / 100, 0)} dos leads têm origem e documento; ${formatPercent(worstShare / 100, 0)} não têm nenhum dos dois.`
    : 'Há caixas sem medição neste mês.';
  const summary =
    `Matriz de dois por dois com ${formatInt(total)} leads de ${formatMonthLong(month)}, cruzando origem identificada e documento válido. ` +
    (complete
      ? `${formatPercent(bestShare / 100, 0)} têm os dois e ${formatPercent(worstShare / 100, 0)} não têm nenhum, ${formatInt(worst.leads)} leads.`
      : 'Há caixas sem medição.');

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        {readLine}
      </p>

      <div
        className="grid min-h-0 flex-1"
        style={{ gridTemplateColumns: `${String(LABEL_W)}px 1fr`, gridTemplateRows: 'auto auto 1fr', columnGap: AXIS_GAP }}
      >
        <div className="flex items-start gap-1 text-[11px] font-medium text-text-muted">
          <ArrowUp aria-hidden className="mt-px size-3 shrink-0" />
          <span>Origem identificada</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
          <span>Documento válido</span>
          <ArrowRight aria-hidden className="size-3 shrink-0" />
        </div>

        <div />
        <div className="grid grid-cols-2 gap-px px-px pb-1 text-center text-[11px] text-text-secondary">
          <span>Não</span>
          <span>Sim</span>
        </div>

        <div className="grid grid-rows-2 gap-px py-px text-right text-[11px] text-text-secondary">
          <span className="flex items-center justify-end">Sim</span>
          <span className="flex items-center justify-end">Não</span>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-px bg-line-subtle p-px">
          {cells.map((box, index) => {
            if (box === undefined) return <div className="bg-surface-sunken" key={`vazia-${String(index)}`} />;
            const share = shareById.get(box.id) ?? null;
            const isBest = box === best;
            const isWorst = box === worst;
            const isSelected = box.id === selected;
            const label =
              box.leads === null
                ? `${box.label}: sem medição neste mês`
                : `${box.label}: ${formatInt(box.leads)} leads, ${formatPercent((share ?? 0) / 100, 0)} do total`;
            return (
              <button
                aria-label={label}
                aria-pressed={isSelected}
                className={cn(
                  'flex flex-col justify-center gap-0.5 bg-surface-sunken px-3 py-1.5 text-left',
                  isBest && 'ring-1 ring-inset ring-chart-1',
                  isWorst && 'ring-2 ring-inset ring-chart-3',
                  isSelected && 'ring-2 ring-inset ring-text-primary',
                )}
                key={box.id}
                onClick={() => setSelected(isSelected ? null : box.id)}
                type="button"
              >
                {box.leads === null ? (
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Unplug aria-hidden className="size-4 shrink-0" />
                    {formatUnavailable()}
                  </span>
                ) : (
                  <span className="flex items-baseline gap-2">
                    <span className={cn('kpi-number text-xl text-text-primary', isBest ? 'font-bold' : 'font-semibold')}>
                      {formatInt(box.leads)}
                    </span>
                    <span className="font-display text-[11px] tabular-nums text-text-muted">
                      {formatPercent((share ?? 0) / 100, 0)}
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-text-secondary">
                  {isWorst ? <CircleAlert aria-hidden className="size-3 shrink-0 text-chart-3" /> : null}
                  {box.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p aria-hidden className="shrink-0 text-[11px] text-text-muted">
        {selectedBox !== undefined && selectedBox.leads !== null
          ? `Filtro: ${selectedBox.label.toLowerCase()}, ${formatInt(selectedBox.leads)} leads. Clique de novo para limpar.`
          : 'Clique numa caixa para filtrar o painel. Caixas iguais: o tamanho não mede o volume.'}
      </p>
    </figure>
  );
}
