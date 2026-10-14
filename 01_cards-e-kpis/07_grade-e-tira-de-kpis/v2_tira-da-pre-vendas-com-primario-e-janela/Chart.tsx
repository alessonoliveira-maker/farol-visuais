import { useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import { formatDate, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PreSalesStrip, type StripMetricSeries } from './data';

/**
 * Tira da pré-vendas com um cartão primário maior (a sparkline define por onde a leitura
 * começa) e um seletor de janela único, no cabeçalho, que reescreve a âncora do delta e a
 * granularidade da tira toda. HTML com Tailwind; a sparkline é SVG com geometria calculada aqui.
 */
export interface PreSalesStripCardProps {
  readonly data?: PreSalesStrip;
  readonly height?: number;
  readonly className?: string;
}

const WINDOWS = [7, 30, 90] as const;
type WindowDays = (typeof WINDOWS)[number];

const SPARK_WIDTH = 200;
const SPARK_HEIGHT = 40;
const FLAT_THRESHOLD = 0.0005;
const WHOLE_PERCENT_FROM = 0.1;

function windowTotals(metric: StripMetricSeries, window: WindowDays): { current: number; previous: number } {
  const current = metric.series.slice(90 - window).reduce((sum, value) => sum + value, 0);
  const previous =
    window === 90 ? metric.previousTotal90 : metric.series.slice(90 - window * 2, 90 - window).reduce((sum, value) => sum + value, 0);
  return { current, previous };
}

const WEEK_DAYS = 7;
const SPARK_WEEKS = 12;

/** No zoom de 90 dias a sparkline agrega em 12 semanas cheias de 7 dias, alinhadas pelo fim
 * (a caixa mais recente termina em `referenceDate`); os 6 dias mais antigos ficam fora do traço.
 * Nas janelas menores fica diária. */
function sparkSeries(metric: StripMetricSeries, window: WindowDays): readonly number[] {
  if (window < 90) return metric.series.slice(90 - window);
  const weeks: number[] = [];
  for (let week = 0; week < SPARK_WEEKS; week += 1) {
    const end = metric.series.length - (SPARK_WEEKS - 1 - week) * WEEK_DAYS;
    weeks.push(metric.series.slice(end - WEEK_DAYS, end).reduce((sum, value) => sum + value, 0));
  }
  return weeks;
}

function sparkPath(series: readonly number[]): string {
  if (series.length < 2) return '';
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const step = SPARK_WIDTH / (series.length - 1);
  return series
    .map((value, index) => {
      const x = (index * step).toFixed(2);
      const y = (2 + (1 - (value - min) / span) * (SPARK_HEIGHT - 4)).toFixed(2);
      return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');
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

export default function PreSalesStripCard({ data = defaultData, height, className }: PreSalesStripCardProps) {
  const [window, setWindow] = useState<WindowDays>(30);
  const primary = data.metrics.find((metric) => metric.id === data.primaryId) ?? data.metrics[0];
  const secondary = data.metrics.filter((metric) => metric.id !== data.primaryId);

  const rows = data.metrics.map((metric) => {
    const { current, previous } = windowTotals(metric, window);
    const delta = previous !== 0 ? (current - previous) / previous : null;
    const isFlat = delta !== null && Math.abs(delta) < FLAT_THRESHOLD;
    const isUp = delta !== null && delta > 0;
    const isGood = delta !== null && !isFlat && (metric.goodDirection === 'up' ? isUp : !isUp);
    return { metric, current, delta, isFlat, isUp, isGood };
  });

  const summary = [
    `Tira da pré-vendas até ${formatDate(data.referenceDate)}, janela de ${String(window)} dias contra os ${String(window)} dias anteriores.`,
    ...rows.map(
      ({ metric, current, delta, isFlat, isUp }) =>
        // Estável não leva número: "estável de 0,0%" lê como se 0,0% fosse a quantidade de
        // estabilidade, e o zero não acrescenta nada ao que a palavra já diz.
        `${metric.label}: ${formatInt(current)} ${metric.unitWord}${delta === null ? '' : `, ${isFlat ? 'estável' : `${isUp ? 'alta' : 'queda'} de ${signedPercent(delta)}`}`}.`,
    ),
  ].join(' ');

  const primaryRow = rows.find((row) => row.metric.id === primary?.id);
  /** A série que a sparkline do primário desenha: diária nas janelas curtas, semanal em 90 dias.
   * A nota de granularidade conta as caixas daqui, em vez de repetir o número à mão. */
  const primarySpark = primary ? sparkSeries(primary, window) : [];

  return (
    <section
      aria-label={summary}
      className={cn('@container flex h-full w-full min-w-0 flex-col', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.6875rem] text-text-muted">
          até <span className="kpi-number font-medium text-text-secondary">{formatDate(data.referenceDate)}</span>, dia corrente fora da conta
        </p>
        <div aria-label="Janela de comparação" className="flex shrink-0 gap-1" role="radiogroup">
          {WINDOWS.map((option) => (
            <button
              aria-checked={option === window}
              className={cn(
                'shrink-0 rounded-md px-2 py-0.5 text-[0.6875rem] font-medium whitespace-nowrap',
                option === window ? 'bg-surface-overlay text-text-primary' : 'text-text-muted',
              )}
              key={option}
              onClick={() => {
                setWindow(option);
              }}
              role="radio"
              type="button"
            >
              {formatInt(option)} dias
            </button>
          ))}
        </div>
      </div>

      <div className="mt-1.5 grid min-h-0 flex-1 grid-cols-1 items-stretch gap-3 @sm:grid-cols-4">
        {primary && primaryRow ? (
          <div className="flex h-full min-h-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-3 @sm:col-span-2">
            <p className="shrink-0 text-xs font-medium text-text-secondary">{primary.label}</p>
            <p className="kpi-number mt-1 shrink-0 text-3xl leading-none font-semibold text-text-primary">
              {formatInt(primaryRow.current)} <span className="text-sm font-normal text-text-muted">{primary.unitWord}</span>
            </p>
            <DeltaLine
              isFlat={primaryRow.isFlat}
              isGood={primaryRow.isGood}
              isUp={primaryRow.isUp}
              delta={primaryRow.delta}
              window={window}
            />
            <div aria-hidden className="mt-2 min-h-6 flex-1">
              <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${String(SPARK_WIDTH)} ${String(SPARK_HEIGHT)}`}>
                <path
                  d={sparkPath(primarySpark)}
                  fill="none"
                  stroke="var(--chart-1)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            {window === 90 ? (
              <p className="mt-0.5 shrink-0 text-[0.6875rem] text-text-muted tabular-nums">
                agregado por semana, {formatInt(primarySpark.length)} semanas cheias de 7 dias
              </p>
            ) : null}
          </div>
        ) : null}

        {secondary.map((metric) => {
          const row = rows.find((item) => item.metric.id === metric.id);
          if (!row) return null;
          const DeltaIcon = row.isFlat ? ArrowRight : row.isUp ? ArrowUpRight : ArrowDownRight;
          return (
            <div className="flex h-full flex-col justify-between rounded-lg border border-line-subtle bg-surface-raised p-3" key={metric.id}>
              <p className="text-xs font-medium text-text-secondary">{metric.label}</p>
              <div>
                <p className="kpi-number text-xl leading-none font-semibold text-text-primary">
                  {formatInt(row.current)} <span className="text-xs font-normal text-text-muted">{metric.unitWord}</span>
                </p>
                <p className="mt-2 flex items-center gap-1 text-[0.6875rem] text-text-muted">
                  {row.delta === null ? (
                    'sem período anterior medido'
                  ) : (
                    <span className={cn('inline-flex items-center gap-0.5 font-semibold', row.isFlat ? 'text-text-secondary' : row.isGood ? 'text-positive' : 'text-negative')}>
                      <DeltaIcon aria-hidden className="size-3" strokeWidth={2.5} />
                      <span className="kpi-number">{row.isFlat ? 'estável' : signedPercent(row.delta)}</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

interface DeltaLineProps {
  readonly delta: number | null;
  readonly isFlat: boolean;
  readonly isUp: boolean;
  readonly isGood: boolean;
  readonly window: WindowDays;
}

function DeltaLine({ delta, isFlat, isUp, isGood, window }: DeltaLineProps) {
  const DeltaIcon = isFlat ? ArrowRight : isUp ? ArrowUpRight : ArrowDownRight;
  return (
    <p className="mt-1 flex min-h-4 shrink-0 items-center gap-1.5 text-xs text-text-muted">
      {delta === null ? (
        <span>sem janela anterior medida para comparar</span>
      ) : (
        <>
          <span className={cn('inline-flex items-center gap-0.5 font-semibold', isFlat ? 'text-text-secondary' : isGood ? 'text-positive' : 'text-negative')}>
            <DeltaIcon aria-hidden className="size-3.5" strokeWidth={2.5} />
            <span className="kpi-number">{isFlat ? 'estável' : signedPercent(delta)}</span>
          </span>
          <span>contra os {formatInt(window)} dias anteriores</span>
        </>
      )}
    </p>
  );
}
