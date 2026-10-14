import { TriangleAlert, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CoverageGauge } from './data';

/**
 * Selo de cobertura colado ao CPL qualificado: o número principal, o percentual de leads que têm
 * qualificação, um trilho curto na proporção e o denominador por extenso. Abaixo do limiar
 * declarado o número principal vai para o tom mudo e ganha o aviso; acima dele fica normal.
 * HTML com Tailwind, sem Recharts.
 */
export interface CoverageChipProps {
  readonly data?: CoverageGauge;
  readonly className?: string;
}

/** Trilho de 40 px, em classe fixa para o preenchimento ser proporção exata dela. */
const TRACK_CLASS = 'w-10';

/** Cobertura em fração, ou null quando não há universo para medir (nunca 0). */
function coverageOf(qualified: number, total: number): number | null {
  return total > 0 ? qualified / total : null;
}

export default function CoverageChip({ data = defaultData, className }: CoverageChipProps) {
  const { label, period, cpl, qualified, total, threshold } = data;
  const coverage = coverageOf(qualified, total);
  const cutText = formatPercent(threshold, 0);

  if (coverage === null) {
    return (
      <div
        aria-label={`Selo de cobertura do ${label} de ${period}: sem leads no período, a cobertura não pode ser medida.`}
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2', className)}
        role="status"
      >
        <Unplug aria-hidden className="size-4 text-text-muted" />
        <p className="text-xs text-text-muted">{formatUnavailable()}: o período não tem leads para medir a cobertura.</p>
      </div>
    );
  }

  const reliable = coverage >= threshold;
  const rate = formatRateWithVolume(qualified, total);
  const summary = `Selo de cobertura do ${label} de ${period}: ${formatPercent(coverage, 0)} dos ${String(total)} leads do período têm qualificação, ${reliable ? 'acima' : 'abaixo'} do limiar de ${cutText}. O número principal ${reliable ? 'fica como está' : 'foi rebaixado'}.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-2', className)}
      role="img"
    >
      <p className="text-xs font-medium text-text-secondary">
        {label}, {period}
      </p>

      <div className="flex items-center gap-2">
        <p
          className={cn(
            'kpi-number text-3xl leading-none font-semibold',
            reliable ? 'text-text-primary' : 'text-text-muted',
          )}
        >
          {cpl === null ? formatUnavailable() : formatCurrencyCompact(cpl)}
        </p>
        {reliable ? null : <TriangleAlert aria-hidden className="size-4 shrink-0 text-warning" />}
      </div>

      <div className="flex w-fit items-center gap-2 rounded-full bg-surface-overlay px-2 py-1">
        <span className="kpi-number text-xs font-semibold text-text-primary">{formatPercent(coverage, 0)}</span>
        <span aria-hidden className={cn('relative h-1.5 overflow-hidden rounded-full bg-surface-sunken', TRACK_CLASS)}>
          <span
            className="absolute inset-y-0 left-0 bg-chart-1"
            style={{ width: `${String(coverage * 100)}%` }}
          />
        </span>
        <span className="text-xs text-text-secondary">de cobertura</span>
      </div>

      <p className="text-xs text-text-muted">
        <span className="kpi-number">{rate}</span> dos leads do período têm qualificação.
      </p>
      <p className="text-xs text-text-muted">
        {reliable
          ? `Acima do limiar de ${cutText}: o número vale como está.`
          : `Abaixo do limiar de ${cutText}: leia o número com ressalva.`}
      </p>
    </div>
  );
}
