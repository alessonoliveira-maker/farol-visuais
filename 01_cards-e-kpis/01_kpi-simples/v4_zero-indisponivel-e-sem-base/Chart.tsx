import { Filter, Minus, TrendingDown, TrendingUp, Unplug, type LucideIcon } from 'lucide-react';

import { formatDate, formatInt, formatMonthLong, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CountNoun, type StateKpi } from './data';

/**
 * Tira de KPIs em estados honestos: zero medido, indisponível, sem base de comparação e mês
 * parcial convivem com a mesma altura e a mesma linha de base do número, cada um dizendo em
 * texto o que o número é e o que ele não é.
 */
export interface KpiStateStripProps {
  readonly data?: readonly StateKpi[];
  readonly className?: string;
}

/** A partir de 10% a casa decimal não muda a decisão (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;
/** Variação abaixo de 0,05% é lida como estável. */
const FLAT_THRESHOLD = 0.0005;
/** Base abaixo de 30 não sustenta percentual: escreve a contagem da base, sem cor semântica. */
const MIN_BASE = 30;

type CardState = 'zero' | 'unavailable' | 'no-base' | 'partial' | 'measured';

const STATE_PHRASE: Record<CardState, string> = {
  zero: 'com zero medido',
  unavailable: formatUnavailable(),
  'no-base': 'sem mês anterior para comparar',
  partial: 'em mês parcial',
  measured: 'medido',
};

function stateOf(kpi: StateKpi): CardState {
  if (kpi.value === null) return 'unavailable';
  if (kpi.value === 0) return 'zero';
  if (kpi.previous?.value === null) return 'no-base';
  return kpi.coverage ? 'partial' : 'measured';
}

function count(value: number, noun: CountNoun): string {
  return `${formatInt(value)} ${value === 1 ? noun.one : noun.many}`;
}

/** Artigo do zero medido concordando em gênero: "nenhuma venda", "nenhum lead". */
function zeroArticle(noun: CountNoun): string {
  return noun.gender === 'f' ? 'nenhuma' : 'nenhum';
}

/** Nome próprio (não `Comparison`) porque `data.ts` já exporta o tipo `Comparison`; o mesmo nome
 * nos dois arquivos confundiria quem cola as duas peças no Farol. */
function ComparisonLine({ kpi }: { readonly kpi: StateKpi }) {
  const { previous, value } = kpi;
  if (!previous || value === null) return null;
  if (previous.value === null) return <>sem mês anterior medido para comparar</>;
  const window = kpi.coverage ? `nos mesmos ${formatInt(kpi.coverage.elapsedDays)} dias de` : 'em';
  const base = `${count(previous.value, kpi.noun)} ${window} ${formatMonthShort(previous.month)}`;
  if (previous.value < MIN_BASE) return <>base de {base}, pequena para percentual</>;
  const fraction = (value - previous.value) / previous.value;
  const flat = Math.abs(fraction) < FLAT_THRESHOLD;
  const improved = kpi.polarity === 'lower-is-better' ? fraction < 0 : fraction > 0;
  const tone = flat || kpi.polarity === 'neutral' ? 'text-text-secondary' : improved ? 'text-positive' : 'text-negative';
  const Icon: LucideIcon = flat ? Minus : fraction > 0 ? TrendingUp : TrendingDown;
  const absolute = Math.abs(fraction);
  return (
    <>
      <span className={cn('inline-flex items-center gap-1 align-[-2px] font-semibold', tone)}>
        <Icon aria-hidden className="size-3.5" strokeWidth={2.25} />
        <span className="kpi-number">
          {flat ? 'estável' : `${fraction > 0 ? '+' : '−'}${formatPercent(absolute, absolute >= WHOLE_PERCENT_FROM ? 0 : 1)}`}
        </span>
      </span>{' '}
      contra {base}
    </>
  );
}

function describeCard(kpi: StateKpi, state: CardState): string {
  const head = `${kpi.label} em ${formatMonthLong(kpi.month)}`;
  if (state === 'unavailable') {
    const last = kpi.unavailable?.lastValid;
    return `${head}: ${formatUnavailable()}, ${kpi.unavailable?.reason ?? 'sem medição'}${last ? `; última medição válida ${count(last.value, kpi.noun)} em ${formatMonthLong(last.month)}` : ''}.`;
  }
  const parts = [`${head}: ${count(kpi.value ?? 0, kpi.noun)}.`];
  if (kpi.coverage) parts.push(`Mês parcial, ${formatInt(kpi.coverage.elapsedDays)} de ${formatInt(kpi.coverage.totalDays)} dias.`);
  if (state === 'zero') parts.push('Zero medido, não ausência de dado.');
  const previous = kpi.previous;
  if (previous?.value === null) parts.push('Sem mês anterior medido para comparar.');
  if (previous && previous.value !== null && kpi.value !== null) {
    const window = kpi.coverage ? ` nos mesmos ${formatInt(kpi.coverage.elapsedDays)} dias de` : ' em';
    const base = `${count(previous.value, kpi.noun)}${window} ${formatMonthLong(previous.month)}`;
    if (previous.value < MIN_BASE) {
      parts.push(`Base de ${base}, pequena para percentual.`);
    } else {
      const fraction = (kpi.value - previous.value) / previous.value;
      const flat = Math.abs(fraction) < FLAT_THRESHOLD;
      parts.push(flat ? `Estável contra ${base}.` : `${fraction < 0 ? 'Queda' : 'Alta'} de ${formatPercent(Math.abs(fraction), 1)} contra ${base}.`);
    }
  }
  return parts.join(' ');
}

function StateCard({ kpi }: { readonly kpi: StateKpi }) {
  const state = stateOf(kpi);
  const last = kpi.unavailable?.lastValid ?? null;
  /** Mês parcial não é um estado à parte (EST-4): existe junto de zero, sem base ou medido, então
   * fica fora do switch de `state` e é escrito em todo cartão que tenha `coverage`. */
  const coverageNote = kpi.coverage ? `mês parcial: ${formatInt(kpi.coverage.elapsedDays)} de ${formatInt(kpi.coverage.totalDays)} dias` : null;

  return (
    <article aria-label={describeCard(kpi, state)} className="flex h-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4" role="group">
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 text-xs font-medium text-text-secondary">{kpi.label}</p>
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">{formatMonthShort(kpi.month)}</p>
      </div>

      <div className="mt-3 flex h-7.5 min-w-0 items-end">
        {kpi.value === null ? (
          <p className="mb-0.5 inline-flex items-center gap-1.5 text-text-muted">
            <Unplug aria-hidden className="size-4" />
            <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
          </p>
        ) : (
          <p className="kpi-number text-3xl leading-none font-semibold text-text-primary">{formatInt(kpi.value)}</p>
        )}
      </div>

      {/* Linha de comparação: sempre neste tamanho e cor, para zero, sem base, parcial e medido
          (item 10 da revisão pedia a mesma peça em linha e tamanho trocados entre cartões).
          Indisponível não compara: mostra o motivo. Zero mostra o que o zero significa, porque
          a comparação numérica de "caiu para zero" já está implícita no próprio número. */}
      <p className="mt-2 min-h-8 text-xs text-text-secondary tabular-nums">
        {state === 'unavailable'
          ? `${kpi.unavailable?.reason ?? 'sem medição no mês'}${kpi.unavailable ? ` em ${formatDate(kpi.unavailable.since)}` : ''}`
          : state === 'zero'
            ? (kpi.zeroMeaning ?? `${zeroArticle(kpi.noun)} ${kpi.noun.one} no mês`)
            : <ComparisonLine kpi={kpi} />}
      </p>

      {/* Linha de mês parcial: sempre nesta posição quando `coverage` existe, para zero, sem
          base e parcial (a mesma peça não troca de linha entre cartões). */}
      <p className="mt-1 text-[0.6875rem] text-text-muted tabular-nums">
        {state === 'unavailable'
          ? last
            ? `última medição válida: ${count(last.value, kpi.noun)} em ${formatMonthShort(last.month)}`
            : 'sem medição válida anterior'
          : coverageNote
            ? state === 'no-base' && kpi.firstMeasuredOn
              ? `${coverageNote}; primeira medição em ${formatDate(kpi.firstMeasuredOn)}`
              : coverageNote
            : state === 'no-base' && kpi.firstMeasuredOn
              ? `primeira medição em ${formatDate(kpi.firstMeasuredOn)}`
              : null}
      </p>
    </article>
  );
}

export default function KpiStateStrip({ data = defaultData, className }: KpiStateStripProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4" />
        <span>Nenhum KPI neste recorte: a tira fica vazia até o filtro devolver métricas.</span>
      </div>
    );
  }

  /** A frase da tira cita todo cartão em mês parcial, não só o que só demonstra isso (ACE-1):
   * zero medido e sem base também carregam `coverage` neste dado. */
  const cardPhrase = (kpi: StateKpi): string => {
    const state = stateOf(kpi);
    const phrase = STATE_PHRASE[state];
    return kpi.coverage && state !== 'partial' ? `${phrase}, em mês parcial` : phrase;
  };
  const summary = `Tira de ${formatInt(data.length)} cartões de KPI com estados distintos: ${data
    .map((kpi) => `${kpi.label.toLowerCase()} ${cardPhrase(kpi)}`)
    .join('; ')}.`;

  return (
    <div aria-label={summary} className={cn('@container flex h-full w-full min-w-0 flex-col justify-center', className)} role="group">
      <div className="grid w-full grid-cols-2 gap-3 @lg:grid-cols-4">
        {data.map((kpi) => (
          <StateCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}
