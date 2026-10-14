import { Filter, TrendingDown, TrendingUp, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Polarity, type RevenueMonth, type RevenueTrend } from './data';

/**
 * KPI em texto corrido: a receita do mês, a variação contra o mês anterior e a tendência dos
 * últimos meses numa só frase, com a sparkline inline na altura do texto (dataword). Responde
 * "quanto entrou, isso é bom e para onde vai?" sem trocar de cartão.
 */
export interface RevenueSentenceProps {
  readonly data?: RevenueTrend;
  readonly className?: string;
}

/** Variação abaixo de 0,05% é lida como estável: nem verde nem vermelho. */
const STABLE_CUT = 0.0005;
/** A partir de 10% a casa decimal não muda a decisão (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;
/** Menos de 3 pontos medidos não viram linha (EIX-11): a frase fica sem o dataword. */
const SPARK_MIN_POINTS = 3;
/** Caixa da sparkline em unidades do viewBox: 10 de altura é 1em, 60 de largura é 6em. */
const SPARK_W = 60;
const SPARK_H = 10;
const SPARK_PAD = 2;
const SPARK_DOT_R = 1.6;

type Tone = 'good' | 'bad' | 'neutral';
const TONE_CLASS: Record<Tone, string> = { good: 'text-positive', bad: 'text-negative', neutral: 'text-text-secondary' };

interface SparkShape {
  /** Um caminho por trecho contínuo: valor ausente quebra a linha, nunca vira zero (EIX-10). */
  readonly paths: readonly string[];
  readonly last: { readonly x: number; readonly y: number } | null;
}

/** Geometria pura: escala do mínimo ao máximo medido, sem área (EIX-2). */
function sparkShape(months: readonly RevenueMonth[]): SparkShape | null {
  const measured = months.flatMap((m) => (m.value === null ? [] : [m.value]));
  if (measured.length < SPARK_MIN_POINTS) return null;
  const seed = measured[0] ?? 0;
  const low = measured.reduce((a, b) => (b < a ? b : a), seed);
  const span = measured.reduce((a, b) => (b > a ? b : a), seed) - low;
  const step = (SPARK_W - 2 * SPARK_PAD) / Math.max(1, months.length - 1);
  const paths: string[] = [];
  let open = '';
  let last: SparkShape['last'] = null;
  months.forEach((m, i) => {
    if (m.value === null) {
      if (open) paths.push(open);
      open = '';
      last = null;
      return;
    }
    const x = SPARK_PAD + i * step;
    const y = span === 0 ? SPARK_H / 2 : SPARK_PAD + (1 - (m.value - low) / span) * (SPARK_H - 2 * SPARK_PAD);
    open += `${open ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
    last = { x, y };
  });
  if (open) paths.push(open);
  return { paths, last };
}

type Variation =
  | { readonly kind: 'variance'; readonly fraction: number; readonly baseValue: number; readonly tone: Tone }
  | { readonly kind: 'zero-base' }
  | { readonly kind: 'no-previous' };

/** A cor sai da polaridade da métrica, nunca do sinal da variação (COR-6). */
function compare(current: number, previous: number | null, polarity: Polarity): Variation {
  if (previous === null) return { kind: 'no-previous' };
  if (previous === 0) return { kind: 'zero-base' };
  const fraction = (current - previous) / Math.abs(previous);
  const improved = polarity === 'higher-is-better' ? fraction > 0 : fraction < 0;
  const tone: Tone = polarity === 'neutral' || Math.abs(fraction) < STABLE_CUT ? 'neutral' : improved ? 'good' : 'bad';
  return { kind: 'variance', fraction, baseValue: previous, tone };
}

/** Sinal à mão sobre o valor absoluto: `formatPercent` devolveria o sinal sem o `+` (NUM-3). */
function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  return `${fraction > 0 ? '+' : '−'}${formatPercent(absolute, absolute >= WHOLE_PERCENT_FROM ? 0 : 1)}`;
}

export default function RevenueSentence({ data = defaultData, className }: RevenueSentenceProps) {
  const { months, polarity } = data;
  const current = months[months.length - 1];
  const previous = months[months.length - 2];

  if (!current || !previous) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita para contar em uma frase.</span>
      </div>
    );
  }

  const monthText = formatMonthShort(current.month);
  const baseMonth = formatMonthShort(previous.month);
  const spark = sparkShape(months);
  const variation = current.value === null ? null : compare(current.value, previous.value, polarity);
  const valueText = current.value === null ? null : formatCurrencyCompact(current.value);
  const signed = variation?.kind === 'variance' ? signedPercent(variation.fraction) : null;
  const baseText = variation?.kind === 'variance' ? formatCurrencyCompact(variation.baseValue) : null;
  const flat = variation?.kind === 'variance' && Math.abs(variation.fraction) < STABLE_CUT;
  const DeltaIcon = variation?.kind === 'variance' ? (flat ? null : variation.fraction > 0 ? TrendingUp : TrendingDown) : null;

  const comparisonSpoken =
    variation?.kind === 'variance'
      ? `${flat ? 'Estável' : variation.fraction > 0 ? 'Alta' : 'Queda'} de ${signed ?? ''} contra ${baseText ?? ''} em ${baseMonth}.`
      : variation?.kind === 'zero-base'
        ? `Sem base de comparação: ${baseMonth} teve ${formatCurrencyCompact(0)}.`
        : variation?.kind === 'no-previous'
          ? `Sem ${baseMonth} medido para comparar.`
          : '';
  const summary =
    valueText === null
      ? `Receita reconhecida em ${monthText}: ${formatUnavailable()}, sem fechamento carregado no mês.`
      : `Receita reconhecida em ${monthText}: ${valueText}. ${comparisonSpoken} A tendência de ${formatInt(months.length)} meses está na frase.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-3', className)} role="group">
      <p aria-hidden className="text-2xl leading-10 text-text-secondary">
        {valueText === null ? (
          <span className="inline-flex items-center gap-2 text-text-muted">
            <Unplug className="size-[0.8em]" />
            <span className="font-display">{formatUnavailable()}</span>
          </span>
        ) : (
          <>
            Em {monthText} foram reconhecidos <span className="kpi-number font-semibold text-text-primary">{valueText}</span>
          </>
        )}
        {variation?.kind === 'variance' && signed !== null ? (
          <>
            {', '}
            <span className={cn('inline-flex items-center gap-1 font-semibold', TONE_CLASS[variation.tone])}>
              {DeltaIcon ? <DeltaIcon className="size-[0.7em]" strokeWidth={2.25} /> : null}
              <span className="kpi-number">{signed}</span>
            </span>{' '}
            contra <span className="kpi-number font-semibold text-text-primary">{baseText}</span> em {baseMonth}
          </>
        ) : null}
        {variation?.kind === 'zero-base' ? `, sem base de comparação em ${baseMonth}` : null}
        {variation?.kind === 'no-previous' ? `, sem ${baseMonth} medido para comparar` : null}
        {spark ? (
          <>
            {', com a tendência dos '}
            <span className="tabular-nums">{formatInt(months.length)}</span>
            {' meses '}
            {/* O glifo mora num contêiner flex: solto na linha de texto, o preview engorda a linha (GEO-17). */}
            <span className="inline-flex items-center align-middle">
              <svg aria-hidden className="h-[1em] w-[6em] overflow-visible" viewBox={`0 0 ${String(SPARK_W)} ${String(SPARK_H)}`}>
                {spark.paths.map((d) => (
                  <path d={d} fill="none" key={d} stroke="var(--text-muted)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                ))}
                {spark.last ? <circle cx={spark.last.x} cy={spark.last.y} fill="var(--text-primary)" r={SPARK_DOT_R} /> : null}
              </svg>
            </span>
          </>
        ) : null}
        .
      </p>
      <p aria-hidden className="text-[0.6875rem] text-text-muted">
        Receita reconhecida por mês, de {formatMonthShort(months[0]?.month ?? current.month)} a {monthText}, sem eixo; o ponto é {monthText}.
      </p>
    </div>
  );
}
