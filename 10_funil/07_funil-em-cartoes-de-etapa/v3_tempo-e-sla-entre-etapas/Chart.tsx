import { formatDecimal, formatHours, formatInt, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type DurationUnit, type PreSalesTimingFunnel } from './data';

/**
 * Cartões de etapa da pré-vendas ligados por um conector que carrega o tempo de passagem: a
 * mediana, o p90 e o SLA, mais a contagem de quem já passou contra quem ainda está na etapa
 * de origem, para o leitor não confundir tempo censurado com tempo medido. HTML com Tailwind
 * e um traço de SVG mínimo desenhado à mão no conector.
 */
export interface PreSalesTimingCardsProps {
  readonly data?: PreSalesTimingFunnel;
  readonly height?: number;
  readonly className?: string;
}

const MICROBAR_MIN_PX = 2;

function toHours(value: number, unit: DurationUnit): number {
  if (unit === 'min') return value / 60;
  if (unit === 'dias') return value * 24;
  return value;
}

function durationLabel(value: number | null, unit: DurationUnit): string {
  if (value === null) return formatUnavailable();
  if (unit === 'min') return `${formatInt(value)} min`;
  if (unit === 'dias') return `${formatDecimal(value, 1)} dias`;
  return formatHours(value);
}

export default function PreSalesTimingCards({ data = defaultData, height, className }: PreSalesTimingCardsProps) {
  const { stages, passages } = data;
  const first = stages[0];

  const breaches = passages.filter(
    (passage) => passage.slaHours !== null && passage.p90Value !== null && passage.p90Unit !== null && toHours(passage.p90Value, passage.p90Unit) > passage.slaHours,
  );
  const worst = breaches[0];
  const worstFrom = worst ? stages.find((stage) => stage.id === worst.fromId) : undefined;
  const worstTo = worst ? stages.find((stage) => stage.id === worst.toId) : undefined;

  const summary =
    `Funil em cartões com o tempo de passagem entre ${String(stages.length)} etapas da pré-vendas, semana ${data.week}. ` +
    (worst && worstFrom && worstTo
      ? `P90 de ${durationLabel(worst.p90Value, worst.p90Unit ?? 'h')} de ${worstFrom.label} para ${worstTo.label} estoura o SLA de ${worst.slaLabel}, mediana ${durationLabel(worst.medianValue, worst.medianUnit)} dentro do prazo.`
      : 'Nenhuma passagem medida estoura o SLA no p90.');

  return (
    <div
      aria-label={summary}
      className={cn('@container flex h-full w-full min-w-0 flex-col justify-center', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <div className="flex flex-col gap-2 @sm:flex-row @sm:items-start @sm:gap-2">
        {stages.map((stage) => {
          const passage = passages.find((item) => item.fromId === stage.id);
          const pct = first && first.value > 0 ? (stage.value / first.value) * 100 : 0;
          const breach = Boolean(
            passage && passage.slaHours !== null && passage.p90Value !== null && passage.p90Unit !== null && toHours(passage.p90Value, passage.p90Unit) > passage.slaHours,
          );
          return (
            <div className="contents" key={stage.id}>
              <div className="min-w-0 flex-1 rounded-lg border border-line-subtle bg-surface-raised p-3">
                <p className="text-xs font-medium text-text-secondary">{stage.label}</p>
                <p className="kpi-number mt-1 text-xl leading-none font-semibold text-text-primary">{formatInt(stage.value)}</p>
                <p className="mt-1 text-[0.6875rem] text-text-muted">oportunidades</p>
                <div aria-hidden className="mt-2 h-1 rounded-full bg-surface-sunken">
                  <div className="h-1 rounded-full bg-chart-1" style={{ minWidth: MICROBAR_MIN_PX, width: `${String(pct)}%` }} />
                </div>
              </div>
              {passage ? (
                <div className="flex shrink-0 flex-col items-center gap-1 @sm:w-32">
                  <svg aria-hidden className="size-4 shrink-0 text-text-muted @sm:hidden" fill="none" viewBox="0 0 24 24">
                    <path d="M12 2 V18" stroke="currentColor" strokeLinecap="round" strokeWidth={2} />
                    <path d="M6 14 L12 20 L18 14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                  <svg aria-hidden className="hidden size-4 shrink-0 text-text-muted @sm:block" fill="none" viewBox="0 0 24 24">
                    <path d="M2 12 H18" stroke="currentColor" strokeLinecap="round" strokeWidth={2} />
                    <path d="M10 6 L18 12 L10 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                  <span className="kpi-number text-center text-[0.6875rem] font-semibold text-text-secondary">
                    {formatRateWithVolume(passage.passed, stage.value)}
                  </span>
                  <span className="text-center text-[0.6875rem] text-text-muted">{formatInt(passage.stillHere)} ainda na etapa</span>
                  <span className="kpi-number text-center text-[0.6875rem] text-text-secondary">mediana {durationLabel(passage.medianValue, passage.medianUnit)}</span>
                  {passage.p90Value !== null && passage.p90Unit !== null ? (
                    <span className={cn('kpi-number text-center text-[0.6875rem] font-semibold', breach ? 'text-negative' : 'text-text-muted')}>
                      p90 {durationLabel(passage.p90Value, passage.p90Unit)}
                      {breach ? ` fora do SLA de ${passage.slaLabel}` : ` dentro do SLA de ${passage.slaLabel}`}
                    </span>
                  ) : (
                    <span className="text-center text-[0.6875rem] text-text-muted">{passage.slaLabel}</span>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
