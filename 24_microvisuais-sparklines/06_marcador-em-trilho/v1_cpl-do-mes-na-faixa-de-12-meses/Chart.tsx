import { Filter, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CplHistory, type CplMonth } from './data';

/**
 * Marcador em trilho: onde o CPL do mês atual cai entre o menor e o maior CPL dos últimos meses,
 * sem meta inventada. O trilho é a faixa conhecida e o marcador é a posição, não uma quantidade
 * crescendo do zero. Os dois limites ficam escritos nas pontas, com o mês de cada extremo.
 */
export interface CplRailMarkerProps {
  readonly data?: CplHistory;
  readonly className?: string;
}

/** Diâmetro do marcador, em px: metade dele centra o marcador sobre o ponto (classe `size-3`). */
const MARKER_RADIUS = 6;
/** Largura reservada ao valor escrito acima do marcador, em px (cabe "R$ 138" em 14 px). */
const VALUE_LABEL_WIDTH = 64;

interface Extreme {
  readonly value: number;
  readonly month: string;
}

/** Menor e maior CPL medidos; `null` sem nenhum mês medido (EST-1b). Empate fica com o mais recente. */
function rangeOf(months: readonly CplMonth[]): { readonly min: Extreme; readonly max: Extreme } | null {
  let min: Extreme | null = null;
  let max: Extreme | null = null;
  for (const { month, cpl } of months) {
    if (cpl === null) continue;
    if (min === null || cpl <= min.value) min = { value: cpl, month };
    if (max === null || cpl >= max.value) max = { value: cpl, month };
  }
  return min !== null && max !== null ? { min, max } : null;
}

/** `left` do valor escrito: centrado no marcador, mas sem passar das pontas do trilho. */
function valueLabelLeft(ratio: number): string {
  return `clamp(0px, calc(${String(ratio * 100)}% - ${String(VALUE_LABEL_WIDTH / 2)}px), calc(100% - ${String(VALUE_LABEL_WIDTH)}px))`;
}

export default function CplRailMarker({ data = defaultData, className }: CplRailMarkerProps) {
  const { label, months } = data;
  const rootClass = cn('flex h-full w-full min-w-0 flex-col justify-center gap-2', className);
  const current = months.at(-1);

  if (current === undefined) {
    return (
      <div aria-label={`${label} sem meses no recorte: não há faixa de comparação para o mês atual.`} className={cn(rootClass, 'items-center')} role="status">
        <p className="inline-flex items-center gap-2 text-xs text-text-muted">
          <Filter aria-hidden className="size-4" />O recorte não tem meses, então não há faixa para posicionar o mês atual.
        </p>
      </div>
    );
  }

  const range = rangeOf(months);
  const monthLabel = formatMonthShort(current.month);
  const windowLabel = `${formatMonthShort(months[0]?.month ?? current.month)} a ${monthLabel}`;

  if (current.cpl === null || range === null || range.max.value <= range.min.value) {
    const reason = current.cpl === null ? `sem ${label} medido em ${monthLabel}` : 'sem variação medida para formar a faixa';
    return (
      <div
        aria-label={`Marcador em trilho do ${label} de ${monthLabel}: ${formatUnavailable()}, ${reason} no período de ${windowLabel}.`}
        className={rootClass}
        role="img"
      >
        <p className="text-xs font-medium text-text-secondary">
          {label} de {monthLabel}
        </p>
        <p className="inline-flex items-center gap-2 text-xs text-text-muted">
          <Unplug aria-hidden className="size-4 shrink-0" />
          <span>
            {formatUnavailable()}: {reason}
          </span>
        </p>
      </div>
    );
  }

  const { min, max } = range;
  const value = current.cpl;
  const ratio = (value - min.value) / (max.value - min.value);
  const percentLabel = formatPercent(ratio, 0);
  const gapToMax = max.value - value;

  const position =
    gapToMax === 0
      ? `no máximo da faixa, igual ao de ${formatMonthShort(max.month)}`
      : `${percentLabel} da faixa, ${formatCurrencyCompact(gapToMax)} abaixo do máximo`;

  const summary = `Marcador em trilho do ${label} de ${monthLabel}: ${formatCurrencyCompact(value)}, na posição ${percentLabel} entre o mínimo de ${formatCurrencyCompact(min.value)} em ${formatMonthShort(min.month)} e o máximo de ${formatCurrencyCompact(max.value)} em ${formatMonthShort(max.month)}. ${gapToMax === 0 ? 'Empata com o máximo' : `Fica ${formatCurrencyCompact(gapToMax)} abaixo do máximo`} dos ${formatInt(months.length)} meses.`;

  return (
    <div aria-label={summary} className={rootClass} role="img">
      <p className="flex items-baseline justify-between gap-3 text-xs">
        <span className="min-w-0 truncate font-medium text-text-secondary">
          {label} de {monthLabel}
        </span>
        <span className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">{windowLabel}</span>
      </p>

      <div aria-hidden className="relative h-5">
        <span
          className="kpi-number absolute top-0 text-center text-sm leading-5 font-semibold text-text-primary"
          style={{ left: valueLabelLeft(ratio), width: VALUE_LABEL_WIDTH }}
        >
          {formatCurrencyCompact(value)}
        </span>
      </div>

      <div aria-hidden className="relative h-3 w-full">
        <div className="absolute inset-x-0 inset-y-0 m-auto h-1.5 rounded-full bg-line-strong" />
        <div className="absolute inset-y-0 left-0 w-px bg-text-muted" />
        <div className="absolute inset-y-0 right-0 w-px bg-text-muted" />
        <div
          className="absolute inset-y-0 my-auto size-3 rounded-full bg-chart-1"
          style={{ left: `calc(${String(ratio * 100)}% - ${String(MARKER_RADIUS)}px)` }}
        />
      </div>

      <p aria-hidden className="flex items-baseline justify-between gap-3 text-[0.6875rem] text-text-muted tabular-nums">
        <span>
          mín. <span className="kpi-number text-text-secondary">{formatCurrencyCompact(min.value)}</span> em {formatMonthShort(min.month)}
        </span>
        <span>
          máx. <span className="kpi-number text-text-secondary">{formatCurrencyCompact(max.value)}</span> em {formatMonthShort(max.month)}
        </span>
      </p>

      <p aria-hidden className="text-xs font-medium text-text-secondary tabular-nums">
        {position}.
      </p>
    </div>
  );
}
