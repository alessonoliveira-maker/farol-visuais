import { ArrowDownRight, ArrowRight, ArrowUpRight, Equal, Filter, Scale, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';

import {
  formatCurrencyCompact,
  formatDays,
  formatDecimal,
  formatHours,
  formatInt,
  formatMonthShort,
  formatPercent,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type IndicatorPair, type Measure, type Ratio, type Term } from './data';

/**
 * Faixa de pares de indicadores: um cartão por par, cada um com a coorte declarada, o efeito no
 * peso de KPI, o contraefeito um degrau abaixo e o veredito calculado. As medidas mudam de
 * unidade (contagem, reais, horas, dias, fração e razão) e de polaridade; a cor e o verbo do
 * veredito seguem o sentido do bom de cada uma, nunca o sinal do delta.
 */
export interface IndicatorPairStripProps {
  readonly data?: readonly IndicatorPair[];
  readonly className?: string;
}

/** A partir de 10 (por cento ou pontos), a casa decimal não muda a decisão (NUM-1). */
const WHOLE_FROM = 10;

type Movement = 'better' | 'worse' | 'stable';

/** Os quatro quadrantes e o centro. Estável num lado cai no quadrante do outro. */
type PairVerdict = 'bothBetter' | 'effectOverCounter' | 'counterOverEffect' | 'bothWorse' | 'noRelevantChange';

const MOVEMENT_TONE: Record<Movement, string> = {
  better: 'text-positive',
  worse: 'text-negative',
  stable: 'text-text-secondary',
};

/** Ícone neutro por veredito: a forma é o segundo canal, a cor fica com as variações. */
const VERDICT_ICON: Record<PairVerdict, LucideIcon> = {
  bothBetter: TrendingUp,
  effectOverCounter: Scale,
  counterOverEffect: Scale,
  bothWorse: TrendingDown,
  noRelevantChange: Equal,
};

interface Reading {
  readonly measure: Measure;
  readonly value: number | null;
  readonly previousValue: number | null;
  /** Fração nas medidas relativas, pontos percentuais em share e rate; `null` sem base. */
  readonly delta: number | null;
  readonly movement: Movement | null;
}

function ratioValue(ratio: Ratio): number | null {
  return ratio.denominator > 0 ? ratio.numerator / ratio.denominator : null;
}

/** Taxa e fração média variam em pontos percentuais; valor, tempo e contagem variam em %. */
function usesPoints(measure: Measure): boolean {
  return measure.kind === 'rate' || measure.kind === 'share';
}

function movementOf(delta: number, measure: Measure): Movement {
  if (Math.abs(delta) < measure.stableBelow) return 'stable';
  return delta > 0 === (measure.goodDirection === 'up') ? 'better' : 'worse';
}

function readingOf(measure: Measure): Reading {
  const value = measure.kind === 'rate' ? ratioValue(measure.current) : measure.current;
  const previousValue = measure.kind === 'rate' ? ratioValue(measure.previous) : measure.previous;
  let delta: number | null = null;
  if (value !== null && previousValue !== null) {
    if (usesPoints(measure)) delta = (value - previousValue) * 100;
    else if (previousValue !== 0) delta = value / previousValue - 1;
  }
  return { measure, value, previousValue, delta, movement: delta === null ? null : movementOf(delta, measure) };
}

/** Leitura do par: função pura, um de cinco vereditos a partir dos dois movimentos. */
function readPair(effect: Movement, counter: Movement): PairVerdict {
  if (effect === 'stable' && counter === 'stable') return 'noRelevantChange';
  if (effect === 'better' && counter === 'worse') return 'effectOverCounter';
  if (effect === 'worse' && counter === 'better') return 'counterOverEffect';
  if (effect !== 'worse' && counter !== 'worse') return 'bothBetter';
  return 'bothWorse';
}

function subjectOf(term: Term): string {
  return `${term.article === 'o' ? 'O' : 'A'} ${term.noun}`;
}

function objectOf(term: Term): string {
  return `${term.article} ${term.noun}`;
}

/** "à custa do desconto médio", "sem ganho na idade média": preposição contraída com o artigo. */
function contracted(preposition: 'de' | 'em', term: Term): string {
  return `${preposition === 'de' ? 'd' : 'n'}${term.article} ${term.noun}`;
}

/** O verbo segue o movimento do número: tempo que cai melhorou, desconto que sobe piorou. */
function verbOf(delta: number): string {
  return delta > 0 ? 'subiu' : 'caiu';
}

interface Side {
  readonly term: Term;
  readonly delta: number;
  readonly movement: Movement;
}

function verdictSentence(verdict: PairVerdict, effect: Side, counter: Side): string {
  const e = `${subjectOf(effect.term)} ${verbOf(effect.delta)}`;
  const c = `${subjectOf(counter.term)} ${verbOf(counter.delta)}`;
  const both = `${e} e ${objectOf(counter.term)} ${verbOf(counter.delta)}`;
  switch (verdict) {
    case 'effectOverCounter':
      return `${e} à custa ${contracted('de', counter.term)}.`;
    case 'counterOverEffect':
      return `${c} à custa ${contracted('de', effect.term)}.`;
    case 'bothBetter':
      if (counter.movement === 'stable') return `${e} sem piorar ${objectOf(counter.term)}.`;
      return effect.movement === 'stable' ? `${c} sem custo para ${objectOf(effect.term)}.` : `${both}: melhora nas duas.`;
    case 'bothWorse':
      if (counter.movement === 'stable') return `${e} sem ganho ${contracted('em', counter.term)}.`;
      return effect.movement === 'stable' ? `${c} sem ganho ${contracted('em', effect.term)}.` : `${both}: piora nas duas.`;
    case 'noRelevantChange':
      return 'Sem mudança relevante: as duas variações ficaram dentro do corte.';
  }
}

/** Sinal à mão sobre o valor absoluto, com o menos tipográfico U+2212 (NUM-3). */
function withSign(value: number, text: string): string {
  if (value > 0) return `+${text}`;
  return value < 0 ? `−${text}` : text;
}

function formatMeasure(measure: Measure, value: number): string {
  switch (measure.kind) {
    case 'count':
      return formatInt(value);
    case 'currency':
      return formatCurrencyCompact(value);
    case 'hours':
      return formatHours(value);
    case 'days':
      return formatDays(value);
    case 'share':
    case 'rate':
      return formatPercent(value);
  }
}

function deltaText(measure: Measure, delta: number): string {
  const absolute = Math.abs(delta);
  if (usesPoints(measure)) return `${formatDecimal(absolute, absolute >= WHOLE_FROM ? 0 : 1)} p.p.`;
  return formatPercent(absolute, absolute * 100 >= WHOLE_FROM ? 0 : 1);
}

function captionOf(measure: Measure, value: number | null): string {
  return measure.kind === 'count' && value === 1 && measure.captionOne ? measure.captionOne : measure.caption;
}

/** O par de volume da taxa, atual ou anterior: "(61 de 72)". */
function volumeOf(ratio: Ratio): string {
  return `(${formatInt(ratio.numerator)} de ${formatInt(ratio.denominator)})`;
}

const SUMMARY_GROUP: Record<PairVerdict, string> = {
  bothBetter: 'com melhora sem custo',
  effectOverCounter: 'com ganho à custa do outro lado',
  counterOverEffect: 'com ganho à custa do outro lado',
  bothWorse: 'com piora nas duas medidas',
  noRelevantChange: 'sem mudança relevante',
};

interface PairReading {
  readonly pair: IndicatorPair;
  readonly effect: Reading;
  readonly counter: Reading;
  readonly verdict: PairVerdict | null;
  readonly sentence: string;
}

function readIndicatorPair(pair: IndicatorPair): PairReading {
  const effect = readingOf(pair.effect);
  const counter = readingOf(pair.counter);
  if (effect.delta === null || effect.movement === null || counter.delta === null || counter.movement === null) {
    return { pair, effect, counter, verdict: null, sentence: 'Sem veredito: um dos lados não tem base de comparação.' };
  }
  const effectSide = { term: pair.effect.term, delta: effect.delta, movement: effect.movement };
  const counterSide = { term: pair.counter.term, delta: counter.delta, movement: counter.movement };
  const verdict = readPair(effect.movement, counter.movement);
  return { pair, effect, counter, verdict, sentence: verdictSentence(verdict, effectSide, counterSide) };
}

function describe(reading: Reading): string {
  const { measure, value, delta } = reading;
  if (value === null) return `${measure.term.noun} sem base`;
  const volume = measure.kind === 'rate' ? ` ${volumeOf(measure.current)}` : '';
  const change = delta === null ? '' : `, ${delta >= 0 ? 'alta' : 'queda'} de ${deltaText(measure, delta)}`;
  return `${formatMeasure(measure, value)}${volume} ${captionOf(measure, value)}${change}`;
}

function ChangeLine({ reading, previousMonth, className }: { reading: Reading; previousMonth: string; className: string }) {
  const { measure, delta, movement, previousValue } = reading;
  const Icon = movement === 'stable' ? ArrowRight : delta !== null && delta > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <p className={cn('flex min-w-0 items-center gap-1.5 text-xs text-text-muted tabular-nums', className)}>
      {delta !== null && movement !== null && previousValue !== null ? (
        <>
          <span className={cn('inline-flex shrink-0 items-center gap-0.5 font-semibold', MOVEMENT_TONE[movement])}>
            <Icon aria-hidden className="size-3.5" strokeWidth={2.5} />
            <span className="kpi-number">{withSign(delta, deltaText(measure, delta))}</span>
          </span>
          <span className="min-w-0 truncate">
            contra <span className="kpi-number text-text-secondary">{formatMeasure(measure, previousValue)}</span>
            {measure.kind === 'rate' ? <span className="tabular-nums"> {volumeOf(measure.previous)}</span> : null} em{' '}
            {formatMonthShort(previousMonth)}
          </span>
        </>
      ) : (
        <span>sem {formatMonthShort(previousMonth)} medido para comparar</span>
      )}
    </p>
  );
}

function PairCard({ reading }: { reading: PairReading }) {
  const { pair, effect, counter, verdict, sentence } = reading;
  const month = formatMonthShort(pair.month);
  const VerdictIcon = verdict === null ? Equal : VERDICT_ICON[verdict];
  const summary = `Par ${pair.label}, ${pair.cohort} ${month}: ${describe(effect)}; com ${describe(counter)}. ${sentence}`;

  return (
    <article
      aria-label={summary}
      className="flex h-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4"
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{pair.label}</p>
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">
          {pair.cohort} {month}
        </p>
      </div>

      <p className="mt-2 flex min-w-0 items-baseline gap-2">
        {effect.value === null ? (
          <span className="font-display text-xl leading-none text-text-muted">sem base</span>
        ) : (
          <span className="kpi-number text-3xl leading-none font-semibold text-text-primary">{formatMeasure(pair.effect, effect.value)}</span>
        )}
        <span className="min-w-0 truncate text-xs text-text-muted">{captionOf(pair.effect, effect.value)}</span>
      </p>
      <ChangeLine className="mt-2" previousMonth={pair.previousMonth} reading={effect} />

      <div className="mt-4 min-w-0">
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-xs leading-5">
          <span className="text-text-muted">com</span>
          {counter.value === null ? (
            <span className="font-semibold text-text-muted">{pair.counter.term.noun} sem base</span>
          ) : (
            <>
              <span className="kpi-number text-sm leading-none font-semibold text-text-primary">
                {formatMeasure(pair.counter, counter.value)}
              </span>
              <span className="text-text-secondary">{pair.counter.caption}</span>
              {pair.counter.kind === 'rate' ? (
                <span className="text-text-muted tabular-nums">{volumeOf(pair.counter.current)}</span>
              ) : null}
            </>
          )}
        </p>
        <ChangeLine className="mt-1" previousMonth={pair.previousMonth} reading={counter} />
      </div>

      <div aria-hidden className="mt-auto flex min-w-0 items-start gap-2 pt-4">
        <VerdictIcon className="mt-px size-3.5 shrink-0 text-text-secondary" strokeWidth={2.25} />
        <p className="min-h-8 min-w-0 text-xs leading-4 font-semibold text-text-primary tabular-nums">{sentence}</p>
      </div>
    </article>
  );
}

export default function IndicatorPairStrip({ data = defaultData, className }: IndicatorPairStripProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum par declarado neste recorte: não há volume nem qualidade para ler.</span>
      </div>
    );
  }

  const readings = data.map(readIndicatorPair);
  const groups = new Map<string, number>();
  for (const reading of readings) {
    const key = reading.verdict === null ? 'sem base para veredito' : SUMMARY_GROUP[reading.verdict];
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  const first = data[0];
  const summary = [
    `Faixa com ${formatInt(data.length)} ${data.length === 1 ? 'par' : 'pares'} de indicadores`,
    first ? ` de ${formatMonthShort(first.month)}: ` : ': ',
    [...groups].map(([text, count]) => `${formatInt(count)} ${text}`).join(', '),
    '. Cada cartão escreve os dois números, as bases e o veredito.',
  ].join('');

  return (
    <section aria-label={summary} className={cn('@container h-full w-full min-w-0', className)} role="group">
      <div className="grid h-full grid-cols-1 gap-4 @4xl:auto-cols-fr @4xl:grid-flow-col">
        {readings.map((reading) => (
          <PairCard key={reading.pair.id} reading={reading} />
        ))}
      </div>
    </section>
  );
}
