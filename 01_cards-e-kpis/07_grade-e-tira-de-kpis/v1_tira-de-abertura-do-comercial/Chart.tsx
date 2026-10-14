import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import { formatCurrencyCompact, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OpeningMetric, type OpeningStrip } from './data';

/**
 * Tira de abertura do Comercial: três métricas diferentes lado a lado, mesma altura, mesmo
 * período declarado uma vez no cabeçalho e uma linha de variação reservada em todo cartão,
 * preenchida ou não, para a base do número nunca desalinhar. HTML com Tailwind, sem gráfico.
 */
export interface OpeningStripCardProps {
  readonly data?: OpeningStrip;
  readonly height?: number;
  readonly className?: string;
}

/** Variação abaixo disto (0,05%) é lida como estável: nem verde nem vermelho. */
const FLAT_THRESHOLD = 0.0005;
/** A partir de 10% de variação, a casa decimal não muda a decisão. */
const WHOLE_PERCENT_FROM = 0.1;

function formatValue(metric: OpeningMetric): string {
  return metric.kind === 'currency' ? formatCurrencyCompact(metric.value) : `${formatInt(metric.value)} ${metric.unitWord}`;
}

function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  const digits = absolute >= WHOLE_PERCENT_FROM ? 0 : 1;
  const text = formatPercent(absolute, digits);
  /* Zero não tem sinal, e o teste é sobre o texto impresso: `fraction > 0 ? '+' : '−'` sozinho
     mandava o zero para o ramo negativo e imprimia "−0,0%". Hoje a guarda de `isFlat` cobre o
     corpo e a frase acessível, e esta linha fica como convenção da função: quem chamar de um
     terceiro lugar não reintroduz o menos zero. */
  if (text === formatPercent(0, digits)) return text;
  return `${fraction > 0 ? '+' : '−'}${text}`;
}

export default function OpeningStripCard({ data = defaultData, height, className }: OpeningStripCardProps) {
  const periodLabel = formatMonthShort(data.period);
  const previousLabel = formatMonthShort(data.previousPeriod);

  const rows = data.metrics.map((metric) => {
    const delta = metric.previousValue !== 0 ? (metric.value - metric.previousValue) / metric.previousValue : null;
    const isFlat = delta !== null && Math.abs(delta) < FLAT_THRESHOLD;
    const isUp = delta !== null && delta > 0;
    const isGood = delta !== null && !isFlat && (metric.goodDirection === 'up' ? isUp : !isUp);
    return { metric, delta, isFlat, isUp, isGood };
  });

  const summary = [
    `Tira de abertura do Comercial em ${periodLabel}, contra ${previousLabel}.`,
    ...rows.map(
      ({ metric, delta, isFlat, isUp }) =>
        `${metric.label}: ${formatValue(metric)}${
          delta === null
            ? ', sem período anterior medido'
            : /* Estável não leva número: "estável de 0,0%" lê como se 0,0% fosse a quantidade de
                 estabilidade, e o zero não acrescenta nada ao que a palavra já diz. */
              `, ${isFlat ? 'estável' : `${isUp ? 'alta' : 'queda'} de ${signedPercent(delta)}`}`
        }.`,
    ),
  ].join(' ');

  return (
    <section
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <p className="text-[0.6875rem] text-text-muted">
        Período: <span className="kpi-number font-medium text-text-secondary">{periodLabel}</span>
      </p>

      <div className="mt-2 grid min-h-0 flex-1 grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
        {rows.map(({ metric, delta, isFlat, isUp, isGood }) => {
          const DeltaIcon = isFlat ? ArrowRight : isUp ? ArrowUpRight : ArrowDownRight;
          return (
            <div className="flex h-full flex-col rounded-lg border border-line-subtle bg-surface-raised p-4" key={metric.id}>
              <p className="text-xs font-medium text-text-secondary">{metric.label}</p>
              <p className="kpi-number mt-2 text-3xl leading-none font-semibold text-text-primary">{formatValue(metric)}</p>
              <p className="mt-2 flex min-h-4 items-center gap-1.5 text-xs text-text-muted">
                {delta === null ? (
                  <span>sem {previousLabel} medido para comparar</span>
                ) : (
                  <>
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center gap-0.5 font-semibold',
                        isFlat ? 'text-text-secondary' : isGood ? 'text-positive' : 'text-negative',
                      )}
                    >
                      <DeltaIcon aria-hidden className="size-3.5" strokeWidth={2.5} />
                      <span className="kpi-number">{isFlat ? 'estável' : signedPercent(delta)}</span>
                    </span>
                    <span className="min-w-0 truncate">
                      contra <span className="kpi-number text-text-secondary">{formatValue({ ...metric, value: metric.previousValue })}</span> em{' '}
                      {previousLabel}
                    </span>
                  </>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
