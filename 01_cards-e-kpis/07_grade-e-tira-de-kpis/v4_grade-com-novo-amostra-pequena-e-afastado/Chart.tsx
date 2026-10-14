import { ArrowDownRight, ArrowUpRight, Minus, Unplug } from 'lucide-react';

import { formatDecimal, formatInt, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveRate, type RateGrid } from './data';

/**
 * Grade de scorecards de taxa de conversão por executivo, em ordem alfabética estável, que
 * nunca reordena por valor. Sustenta três casos limite sem sumir nem mentir: executivo novo
 * sem histórico semanal, amostra pequena sem cor semântica, e afastado que permanece na grade.
 * HTML com Tailwind; o micrográfico é SVG puro em geometria própria, domínio fixo de 0 a 1.
 */
export interface RateGridChartProps {
  readonly data?: RateGrid;
  readonly height?: number;
  readonly className?: string;
}

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 32;
const VIEW_PAD = 3;
/** Abaixo disto a taxa individual fica sem cor semântica: amostra pequena não vira tendência. */
const MIN_SAMPLE_FOR_COLOR = 10;
/** Diferença contra a mediana menor que isto é empate técnico: fica neutro, nunca verde nem vermelho. */
const MEDIAN_NEUTRAL_BAND_POINTS = 2;
const MEDIAN_NEUTRAL_BAND = MEDIAN_NEUTRAL_BAND_POINTS / 100;

/**
 * Mediana, ou `null` quando a amostra qualificada está vazia. Devolver `0` imprimiria "mediana
 * qualificada 0%", que é zero medido no lugar de ausência, e ainda daria à faixa neutra um centro
 * falso no zero: nunca trocar por `?? 0` no chamador.
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle] ?? 0;
  const lower = sorted[middle - 1] ?? upper;
  return sorted.length % 2 === 0 ? (upper + lower) / 2 : upper;
}

/** Domínio fixo de 0 a 1 (taxa): quebra o traço em cada trecho `null`, sem interpolar (EIX-10). */
function segments(series: readonly (number | null)[]): string[] {
  const step = VIEW_WIDTH / (series.length - 1);
  const paths: string[] = [];
  let current = '';
  series.forEach((value, index) => {
    if (value === null) {
      if (current) paths.push(current);
      current = '';
      return;
    }
    const x = (index * step).toFixed(2);
    const y = (VIEW_PAD + (1 - value) * (VIEW_HEIGHT - VIEW_PAD * 2)).toFixed(2);
    current += `${current === '' ? 'M' : 'L'}${x} ${y} `;
  });
  if (current) paths.push(current);
  return paths;
}

function statusLabel(status: ExecutiveRate['status']): string {
  return status === 'novo' ? 'novo' : status === 'afastado' ? 'afastado' : '';
}

type RateStatus = 'acima' | 'abaixo' | 'neutro';

/** Empate técnico dentro da faixa neutra da mediana não vira verde nem vermelho (COR-6, ACE-2). */
function rateStatus(rate: number, medianRate: number): RateStatus {
  const diff = rate - medianRate;
  if (Math.abs(diff) < MEDIAN_NEUTRAL_BAND) return 'neutro';
  return diff > 0 ? 'acima' : 'abaixo';
}

export default function RateGridChart({ data = defaultData, height, className }: RateGridChartProps) {
  const rows = [...data.executives].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const withoutHistory = rows.filter((executive) => executive.weeklyRate === null).length;
  const qualifying = rows.filter((executive) => executive.total >= MIN_SAMPLE_FOR_COLOR);
  const medianRate = median(qualifying.map((executive) => executive.won / executive.total));
  const newHires = rows.filter((executive) => executive.status === 'novo').length;
  const onLeave = rows.filter((executive) => executive.status === 'afastado').length;
  const smallSample = rows.filter((executive) => executive.total > 0 && executive.total < MIN_SAMPLE_FOR_COLOR).length;
  const top = qualifying.reduce<{ name: string; rate: number } | null>((best, executive) => {
    const rate = executive.won / executive.total;
    return best === null || rate > best.rate ? { name: executive.name, rate } : best;
  }, null);

  // Frase da raiz: tipo, total, maior e destacados em contagem (ACE-1); o detalhe por
  // executivo fica no cartão (nome completo sem reticência) e na frase de leitura fixa.
  const medianPhrase =
    medianRate === null
      ? `mediana qualificada ${formatUnavailable()}: nenhum executivo com ${formatInt(MIN_SAMPLE_FOR_COLOR)} ou mais oportunidades, então nenhum cartão recebe cor semântica`
      : `mediana qualificada ${formatPercent(medianRate)}`;
  const summary = `Grade de ${String(rows.length)} executivos com a taxa de conversão do ${data.periodLabel}.${
    top === null ? '' : ` Maior taxa: ${top.name}, ${formatPercent(top.rate)};`
  } ${medianPhrase}. ${String(newHires)} novo, ${String(smallSample)} amostra pequena e ${String(onLeave)} afastado seguem na grade${withoutHistory > 0 ? `; ${String(withoutHistory)} sem histórico semanal` : ''}.`;

  return (
    <section
      aria-label={summary}
      className={cn('@container flex h-full w-full min-w-0 flex-col', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <p className="text-[0.6875rem] text-text-muted tabular-nums">
        Ordem alfabética estável, sem reordenar por valor. {data.periodLabel}. Mediana da amostra
        qualificada, {formatInt(MIN_SAMPLE_FOR_COLOR)} ou mais oportunidades:{' '}
        {medianRate === null ? (
          <>
            <span className="inline-flex items-center gap-1 align-[-2px]">
              <Unplug aria-hidden className="size-3" />
              {formatUnavailable()}
            </span>
            , sem executivo na amostra qualificada, então nenhum cartão recebe cor semântica.
          </>
        ) : (
          <>
            {formatPercent(medianRate)}, faixa neutra de {formatDecimal(MEDIAN_NEUTRAL_BAND_POINTS, 0)} p.p. ao redor sem
            cor semântica.
          </>
        )}
      </p>

      <div className="mt-2 grid min-h-0 flex-1 grid-cols-3 items-stretch gap-2 @sm:grid-cols-6">
        {rows.map((executive) => {
          const hasSample = executive.total >= MIN_SAMPLE_FOR_COLOR;
          const rate = executive.total > 0 ? executive.won / executive.total : null;
          /** Sem mediana não há contra o que comparar: o cartão fica neutro em vez de ser medido
           * contra um centro falso no zero, que pintaria a grade inteira de "acima". */
          const status = hasSample && rate !== null && medianRate !== null ? rateStatus(rate, medianRate) : null;
          const label = statusLabel(executive.status);
          return (
            <div className="flex h-full flex-col rounded-lg border border-line-subtle bg-surface-raised p-3" key={executive.id}>
              <div className="flex items-center justify-between gap-1">
                <p className="break-words text-xs leading-tight font-medium text-text-secondary">
                  {executive.name}
                </p>
                {label ? <span className="shrink-0 text-[0.6875rem] text-text-muted">{label}</span> : null}
              </div>

              {executive.total === 0 ? (
                <p className="kpi-number mt-1 text-sm font-semibold text-text-muted">sem oportunidades</p>
              ) : (
                <p
                  className={cn(
                    'kpi-number mt-1 flex items-center gap-1 text-sm font-semibold',
                    status === 'acima' ? 'text-positive' : status === 'abaixo' ? 'text-negative' : 'text-text-primary',
                  )}
                >
                  {status === 'acima' ? (
                    <ArrowUpRight aria-hidden className="h-3 w-3 shrink-0" />
                  ) : status === 'abaixo' ? (
                    <ArrowDownRight aria-hidden className="h-3 w-3 shrink-0" />
                  ) : status === 'neutro' ? (
                    <Minus aria-hidden className="h-3 w-3 shrink-0" />
                  ) : null}
                  {formatRateWithVolume(executive.won, executive.total)}
                </p>
              )}

              <div aria-hidden className="mt-1 min-h-6 flex-1">
                {executive.weeklyRate === null ? (
                  <p className="flex h-full items-center text-[0.6875rem] text-text-muted">sem histórico</p>
                ) : (
                  <svg
                    className="h-full w-full overflow-visible"
                    preserveAspectRatio="none"
                    viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}
                  >
                    {segments(executive.weeklyRate).map((d, index) => (
                      <path
                        d={d}
                        fill="none"
                        key={String(index)}
                        stroke="var(--line-strong)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
