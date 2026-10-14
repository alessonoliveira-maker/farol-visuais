import { Filter, Unplug } from 'lucide-react';

import { formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CoverageCell, type CoverageData } from './data';

/**
 * Matriz de nove waffles com a mesma grade, a mesma unidade e o mesmo tamanho de célula: cada waffle
 * mostra quantos leads chegaram com origem declarada numa plataforma e num mês. A grade é de 5 por 5,
 * então 1 quadrado vale 4% e 9 waffles somam 225 div, abaixo do teto de cerca de 400. O número
 * escrito é a taxa exata; só o pior grupo acende em cor, e os demais ficam em neutro.
 */
export interface CoverageWafflesProps {
  readonly data?: CoverageData;
  readonly className?: string;
}

const GRID = 5;
const CELLS = GRID * GRID;
/** Cada quadrado vale 100 / 25 = 4 pontos percentuais. */
const CELL_VALUE = 100 / CELLS;
/** Abaixo deste n a fração não é publicada: 22 leads movem a taxa em 4,5 pontos por lead. */
const MIN_SAMPLE = 30;
const WORST_COLOR = 'var(--chart-1)';
const NEUTRAL_COLOR = 'var(--text-muted)';
const WAFFLE_SIZE = 'size-[72px]';

type Reading =
  | { readonly kind: 'ok'; readonly rate: number; readonly total: number; readonly declared: number }
  | { readonly kind: 'small'; readonly total: number }
  | { readonly kind: 'missing' };

/** Taxa de 0 a 1; `null` sem leads, porque 0 de 0 não é taxa zero (EST-1b). */
function coverageRate(declared: number, total: number): number | null {
  return total > 0 ? Math.min(Math.max(declared / total, 0), 1) : null;
}

function readCell(cell: CoverageCell | undefined): Reading {
  if (cell === undefined || cell.total === null || cell.declared === null) return { kind: 'missing' };
  const rate = coverageRate(cell.declared, cell.total);
  if (rate === null) return { kind: 'missing' };
  if (cell.total < MIN_SAMPLE) return { kind: 'small', total: cell.total };
  return { kind: 'ok', rate, total: cell.total, declared: cell.declared };
}

/** Posição na ordem de preenchimento: coluna a coluna, e dentro da coluna de baixo para cima. */
function fillOrder(row: number, column: number): number {
  return column * GRID + (GRID - 1 - row);
}

function MiniWaffle({ reading, isWorst }: { readonly reading: Reading; readonly isWorst: boolean }) {
  const filled = reading.kind === 'ok' ? Math.round((reading.rate * 100) / CELL_VALUE) : 0;
  const stateClass =
    reading.kind === 'missing'
      ? 'border border-dashed border-line-strong'
      : reading.kind === 'small'
        ? 'border border-line-strong'
        : 'border border-line-strong bg-surface-sunken';
  return (
    // grid-rows-5 explícito: sem ele as linhas viram auto e a célula estica com a altura do contêiner.
    <div aria-hidden className={cn('grid shrink-0 grid-cols-5 grid-rows-5 gap-0.5', WAFFLE_SIZE)}>
      {Array.from({ length: CELLS }, (_, index) => {
        const isFilled = fillOrder(Math.floor(index / GRID), index % GRID) < filled;
        return (
          <span
            className={cn('min-h-0 min-w-0 rounded-[2px]', !isFilled && stateClass)}
            key={`cell-${String(index)}`}
            style={isFilled ? { backgroundColor: isWorst ? WORST_COLOR : NEUTRAL_COLOR } : undefined}
          />
        );
      })}
    </div>
  );
}

export default function CoverageWaffles({ data = defaultData, className }: CoverageWafflesProps) {
  const find = (platformId: string, month: string) => data.cells.find((c) => c.platformId === platformId && c.month === month);
  if (data.platforms.length === 0 || data.months.length === 0 || data.cells.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há plataforma nem mês para comparar.</span>
      </div>
    );
  }

  const readings = data.platforms.flatMap((p) => data.months.map((month) => ({ platform: p, month, reading: readCell(find(p.id, month)) })));
  const measured = readings.flatMap((r) => (r.reading.kind === 'ok' ? [{ ...r, reading: r.reading }] : []));
  const worst = measured.reduce<(typeof measured)[number] | null>((low, r) => (low === null || r.reading.rate < low.reading.rate ? r : low), null);
  const small = readings.filter((r) => r.reading.kind === 'small');
  const missing = readings.filter((r) => r.reading.kind === 'missing');
  const first = data.months[0];
  const last = data.months[data.months.length - 1];
  const range = first !== undefined && last !== undefined ? `${formatMonthShort(first)} a ${formatMonthShort(last)}` : '';
  const named = (r: (typeof readings)[number]) => `${r.platform.label.toLowerCase()} em ${formatMonthShort(r.month)}`;
  const summary =
    `Matriz de ${formatInt(readings.length)} waffles com a origem declarada por plataforma e mês, de ${range}. ` +
    (worst ? `O pior grupo é ${named(worst)}, com ${formatPercent(worst.reading.rate)} (${formatInt(worst.reading.declared)} de ${formatInt(worst.reading.total)}). ` : '') +
    (small.length > 0 ? `Amostra pequena em ${small.map(named).join(', ')}. ` : '') +
    (missing.length > 0 ? `Sem coleta em ${missing.map(named).join(', ')}.` : '');

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-3', className)} role="img">
      <div className="grid min-h-0 flex-1 grid-cols-[5.5rem_repeat(3,minmax(0,1fr))] content-start gap-x-3 gap-y-2">
        <span />
        {data.months.map((month) => (
          <span className="text-xs leading-5 font-semibold text-text-secondary" key={month}>
            {formatMonthShort(month)}
          </span>
        ))}
        {data.platforms.map((platform) => (
          <div className="contents" key={platform.id}>
            <span className="pt-1 text-xs leading-5 font-medium text-text-secondary">{platform.label}</span>
            {data.months.map((month) => {
              const reading = readCell(find(platform.id, month));
              const isWorst = worst !== null && worst.platform.id === platform.id && worst.month === month;
              return (
                <div className="flex min-w-0 flex-col items-start gap-1" key={month}>
                  <div className="min-h-[2.25rem] min-w-0 leading-4">
                    {reading.kind === 'ok' ? (
                      <p className={cn('kpi-number text-sm leading-5', isWorst ? 'font-bold text-text-primary' : 'font-semibold text-text-secondary')}>{formatPercent(reading.rate)}</p>
                    ) : null}
                    {reading.kind === 'small' ? (
                      <p className="inline-block rounded-[3px] border border-line-strong px-1 text-[0.6875rem] leading-[1.125rem] text-text-secondary">amostra pequena</p>
                    ) : null}
                    {reading.kind === 'missing' ? (
                      <p className="flex items-center gap-1 text-text-muted">
                        <Unplug aria-hidden className="size-3.5 shrink-0" />
                        <span className="text-xs leading-5">{formatUnavailable()}</span>
                      </p>
                    ) : null}
                    <p className="kpi-number text-[0.6875rem] leading-4 text-text-muted">{reading.kind === 'missing' ? 'sem coleta' : `n = ${formatInt(reading.total)}${isWorst ? ', pior grupo' : ''}`}</p>
                  </div>
                  <MiniWaffle isWorst={isWorst} reading={reading} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="text-[0.6875rem] leading-4 text-text-muted tabular-nums">
        1 quadrado = {formatInt(CELL_VALUE)}% dos leads do grupo. Em cor e em peso maior, o pior grupo, também nomeado ao lado do n; selo abaixo de n = {formatInt(MIN_SAMPLE)}.
      </p>
    </figure>
  );
}
