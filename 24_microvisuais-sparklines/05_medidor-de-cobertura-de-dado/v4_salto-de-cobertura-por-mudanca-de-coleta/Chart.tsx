import { Unplug } from 'lucide-react';

import {
  formatDate,
  formatDecimal,
  formatInt,
  formatMonthShort,
  formatPercent,
  formatUnavailable,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CoverageMonth, type CoverageSeries } from './data';

/**
 * Cobertura mensal do telefone em colunas de div com base no zero, e a anotação da mudança de
 * coleta sobre a coluna do salto. O rodapé ensina a ler: degrau brusco é coleta, rampa lenta é
 * comportamento. O selo atual traz o denominador do mês e a variação em pontos percentuais
 * contra o mês anterior. HTML com Tailwind, sem Recharts.
 */
export interface CoverageStepChartProps {
  readonly data?: CoverageSeries;
  readonly className?: string;
}

/** Altura da zona das colunas: 100% de cobertura ocupa toda ela. */
const PLOT_HEIGHT = 96;
/** Largura da coluna dentro da célula do mês. */
const BAR_WIDTH = 24;
/** Altura reservada ao rótulo de valor acima da coluna. */
const LABEL_HEIGHT = 16;

/** Cobertura em fração, ou null quando o mês não teve leads (nunca 0). */
function coverageOf(m: CoverageMonth): number | null {
  return m.total > 0 ? m.covered / m.total : null;
}

export default function CoverageStepChart({ data = defaultData, className }: CoverageStepChartProps) {
  const { months, collectionChange } = data;
  const last = months[months.length - 1];

  if (last === undefined) {
    return (
      <div
        aria-label="Cobertura mensal do telefone: a série não tem meses para mostrar."
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2', className)}
        role="status"
      >
        <Unplug aria-hidden className="size-4 text-text-muted" />
        <p className="text-xs text-text-muted">A série não tem meses, então não há cobertura a mostrar.</p>
      </div>
    );
  }

  const previous = months[months.length - 2];
  const changeMonth = collectionChange.slice(0, 7);
  const lastCoverage = coverageOf(last);
  const previousCoverage = previous === undefined ? null : coverageOf(previous);
  const firstCoverage = coverageOf(months[0] ?? last);
  const changeIndex = months.findIndex((m) => m.month === changeMonth);
  const beforeChange = changeIndex > 0 ? coverageOf(months[changeIndex - 1] ?? last) : null;
  const atChange = changeIndex >= 0 ? coverageOf(months[changeIndex] ?? last) : null;

  const delta =
    lastCoverage !== null && previousCoverage !== null ? (lastCoverage - previousCoverage) * 100 : null;
  const deltaText =
    delta === null || previous === undefined || previousCoverage === null
      ? 'sem mês anterior medido para comparar'
      : `${delta < 0 ? '−' : '+'}${formatDecimal(Math.abs(delta), 1)} p.p. contra ${formatPercent(previousCoverage, 0)} em ${formatMonthShort(previous.month)}`;

  const jumpText =
    beforeChange !== null && atChange !== null
      ? `de ${formatPercent(beforeChange, 0)} para ${formatPercent(atChange, 0)}`
      : `de ${formatPercent(firstCoverage ?? 0, 0)} a ${formatPercent(lastCoverage ?? 0, 0)}`;

  const summary = `Colunas de cobertura mensal do telefone, ${formatMonthShort(months[0]?.month ?? last.month)} a ${formatMonthShort(last.month)}: salto ${jumpText} na mudança de coleta de ${formatDate(collectionChange)}. Meses anteriores sem recálculo retroativo. Último mês em ${lastCoverage === null ? formatUnavailable() : formatPercent(lastCoverage, 0)}.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-2', className)}
      role="img"
    >
      <div className="flex items-center gap-3">
        <p className="kpi-number text-2xl leading-none font-semibold text-text-primary">
          {lastCoverage === null ? formatUnavailable() : formatPercent(lastCoverage, 0)}
        </p>
        <div className="flex min-w-0 flex-col">
          <p className="text-xs text-text-secondary">
            <span className="kpi-number">{formatInt(last.covered)} de {formatInt(last.total)}</span> leads de{' '}
            {formatMonthShort(last.month)} têm telefone válido
          </p>
          <p className="text-xs text-text-muted">{deltaText}</p>
        </div>
      </div>

      <div aria-hidden className="grid grid-flow-col auto-cols-fr">
        {months.map((m) => {
          const c = coverageOf(m);
          const isChange = m.month === changeMonth;
          return (
            <div className="relative flex flex-col items-center" key={m.month}>
              <div className="relative w-full" style={{ height: PLOT_HEIGHT }}>
                {c === null ? null : (
                  <>
                    <div
                      className="absolute left-1/2 -translate-x-1/2 bg-chart-1"
                      style={{ bottom: 0, height: `${String(c * 100)}%`, width: BAR_WIDTH }}
                    />
                    <p
                      className={cn(
                        'kpi-number absolute left-0 w-full text-center text-xs text-text-secondary',
                        isChange ? 'font-bold text-text-primary' : null,
                      )}
                      style={{ bottom: `calc(${String(c * 100)}% + 2px)`, height: LABEL_HEIGHT, lineHeight: `${String(LABEL_HEIGHT)}px` }}
                    >
                      {formatPercent(c, 0)}
                    </p>
                  </>
                )}
                {isChange ? (
                  <>
                    <div className="absolute inset-y-0 left-0 border-l border-dashed border-text-muted" />
                    <p className="absolute top-0 right-full mr-2 text-right text-xs whitespace-nowrap text-text-muted">
                      mudança de coleta, {formatDate(collectionChange)}
                    </p>
                  </>
                ) : null}
              </div>
              <p className="mt-1 h-4 w-full border-t border-line-strong pt-1 text-center text-xs leading-none text-text-muted">
                {formatMonthShort(m.month)}
              </p>
            </div>
          );
        })}
      </div>

      <p aria-hidden className="text-xs text-text-muted">
        Degrau brusco de um mês para o outro lê como mudança de coleta; rampa lenta lê como mudança de
        comportamento. Meses anteriores à mudança não foram recalculados.
      </p>
    </div>
  );
}
