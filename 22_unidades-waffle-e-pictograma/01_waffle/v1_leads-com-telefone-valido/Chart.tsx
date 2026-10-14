import { Filter } from 'lucide-react';

import { formatInt, formatMonthLong, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PhoneCoverage } from './data';

/**
 * Waffle de 10 por 10 com uma fração só: cada quadrado vale 1% dos leads do mês. A grade pinta
 * quadrados inteiros, por colunas, de baixo para cima e da esquerda para a direita, e o texto ao lado
 * escreve a taxa exata, então a grade nunca fatia célula nem promete decimal que não desenha.
 */
export interface PhoneWaffleProps {
  readonly data?: PhoneCoverage;
  readonly className?: string;
}

const GRID = 10;
const CELLS = GRID * GRID;
const FILL_COLOR = 'var(--chart-1)';

/** Taxa de 0 a 1; `null` quando não há leads, porque 0 de 0 não é taxa zero (EST-1b). */
function coverageRate(valid: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.min(Math.max(valid / total, 0), 1);
}

/** Posição da célula na ordem de preenchimento: coluna a coluna, e dentro da coluna de baixo para cima. */
function fillOrder(row: number, column: number): number {
  return column * GRID + (GRID - 1 - row);
}

export default function PhoneWaffle({ data = defaultData, className }: PhoneWaffleProps) {
  const rate = coverageRate(data.valid, data.total);

  if (rate === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted tabular-nums', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: a grade não tem o que dividir em 100.</span>
      </div>
    );
  }

  const filled = Math.round(rate * CELLS);
  const month = formatMonthLong(data.month);
  const summary =
    `Gráfico de waffle: ${formatInt(data.valid)} de ${formatInt(data.total)} leads de ${month} chegaram com telefone válido, ` +
    `${formatPercent(rate)}, desenhados como ${formatInt(filled)} de 100 quadrados de 1% cada.`;

  return (
    <figure aria-label={summary} className={cn('@container m-0 flex h-full w-full min-w-0 flex-col gap-4', className)} role="img">
      <div className="flex min-h-0 flex-1 flex-col items-start gap-4 @sm:flex-row @sm:items-center @sm:gap-6">
        {/* grid-rows-10 explícito: sem ele as linhas viram auto e a célula estica com a altura do contêiner. */}
        <div
          aria-hidden
          className="grid aspect-square max-h-full w-full max-w-56 shrink-0 grid-cols-10 grid-rows-10 gap-0.5 @sm:w-1/2"
        >
          {Array.from({ length: CELLS }, (_, index) => {
            const isFilled = fillOrder(Math.floor(index / GRID), index % GRID) < filled;
            return (
              <span
                className={cn('min-h-0 min-w-0 rounded-[2px]', !isFilled && 'bg-surface-sunken border border-line-strong')}
                key={`cell-${String(index)}`}
                style={isFilled ? { backgroundColor: FILL_COLOR } : undefined}
              />
            );
          })}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs leading-5 text-text-muted">Leads de {month}</p>
          <p className="kpi-number text-3xl leading-none font-semibold text-text-primary">{formatPercent(rate)}</p>
          <p className="pt-2 text-xs leading-5 text-text-secondary">
            chegaram com telefone válido: {formatInt(data.valid)} de {formatInt(data.total)} leads
          </p>
        </div>
      </div>

      <ul className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-5 text-text-muted">
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-3 shrink-0 rounded-[2px]" style={{ backgroundColor: FILL_COLOR }} />
          <span>{formatInt(data.valid)} com telefone válido</span>
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-3 shrink-0 rounded-[2px] bg-surface-sunken border border-line-strong" />
          <span>{formatInt(data.total - data.valid)} sem telefone válido</span>
        </li>
        <li className="ml-auto flex items-center gap-4">
          <span className="tabular-nums">1 quadrado = 1%</span>
          <span className="kpi-number text-text-secondary">n = {formatInt(data.total)}</span>
        </li>
      </ul>
    </figure>
  );
}
