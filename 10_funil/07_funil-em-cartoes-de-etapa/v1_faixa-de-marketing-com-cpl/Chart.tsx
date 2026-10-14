import { ChevronDown, ChevronRight } from 'lucide-react';

import { formatCurrency, formatCurrencyCompact, formatInt, formatMonthLong, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MediaFunnelKpi } from './data';

/**
 * Funil em cartões de etapa: um KPI por cartão, ligados por um chip de taxa de passo que
 * sempre nomeia o denominador, e uma microbarra decorativa de magnitude contra a primeira
 * etapa. HTML com Tailwind; em cartão estreito os cartões empilham e a seta vira para baixo.
 */
export interface MediaFunnelCardsProps {
  readonly data?: MediaFunnelKpi;
  readonly height?: number;
  readonly className?: string;
}

/** Piso visual da microbarra, em pixels: etapa pequena continua visível sem mentir a proporção. */
const MICROBAR_MIN_PX = 2;

export default function MediaFunnelCards({ data = defaultData, height, className }: MediaFunnelCardsProps) {
  const { stages, investment, costPerStage } = data;
  const first = stages[0];
  const last = stages.at(-1);
  const [, cplQualificado] = costPerStage;

  const summary =
    `Funil em cartões com ${String(stages.length)} etapas de mídia paga em ${formatMonthLong(data.month)}. ` +
    (first && last
      ? `De ${formatInt(first.value)} ${first.unit} a ${formatInt(last.value)} ${last.unit}, ${formatRateWithVolume(last.value, first.value)} de conversão total. `
      : '') +
    (cplQualificado ? `${cplQualificado.label} de ${formatCurrency(cplQualificado.value, 0)}, investimento de ${formatCurrencyCompact(investment)}.` : '');

  return (
    <div
      aria-label={summary}
      className={cn('@container flex h-full w-full min-w-0 flex-col justify-center gap-3', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <div className="flex flex-col gap-2 @sm:flex-row @sm:items-stretch @sm:gap-1.5">
        {stages.map((stage, index) => {
          const nextStage = stages[index + 1];
          const pct = first && first.value > 0 ? (stage.value / first.value) * 100 : 0;
          return (
            <div className="contents" key={stage.id}>
              <div className="min-w-0 flex-1 rounded-lg border border-line-subtle bg-surface-raised p-3">
                <p className="text-xs font-medium text-text-secondary">{stage.label}</p>
                <p className="kpi-number mt-1 text-xl leading-none font-semibold text-text-primary">{formatInt(stage.value)}</p>
                <p className="mt-1 text-[0.6875rem] text-text-muted">{stage.unit}</p>
                <div aria-hidden className="mt-2 h-1 rounded-full bg-surface-sunken">
                  <div className="h-1 rounded-full bg-chart-1" style={{ minWidth: MICROBAR_MIN_PX, width: `${String(pct)}%` }} />
                </div>
              </div>
              {nextStage ? (
                <div className="flex shrink-0 items-center justify-center gap-1 @sm:w-20 @sm:flex-col">
                  <ChevronDown aria-hidden className="size-4 shrink-0 text-text-muted @sm:hidden" />
                  <ChevronRight aria-hidden className="hidden size-4 shrink-0 text-text-muted @sm:block" />
                  <span className="kpi-number text-center text-[0.6875rem] font-semibold text-text-secondary">
                    {formatRateWithVolume(nextStage.value, stage.value)}
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[0.6875rem] text-text-muted">
        <span>
          Investimento <span className="kpi-number font-semibold text-text-secondary">{formatCurrencyCompact(investment)}</span>
        </span>
        {costPerStage.map((cost) => (
          <span key={cost.label}>
            {cost.label} <span className="kpi-number font-semibold text-text-secondary">{formatCurrency(cost.value, 0)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
