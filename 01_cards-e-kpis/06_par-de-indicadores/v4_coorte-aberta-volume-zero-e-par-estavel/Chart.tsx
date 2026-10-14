import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CircleSlash,
  Clock3,
  Equal,
  Filter,
  Hourglass,
  Scale,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

import { formatDate, formatDecimal, formatInt, formatMonthShort, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CohortCount, type CohortPair, type GoodDirection, type Term } from './data';

/**
 * Faixa de pares lidos em coorte, com o estado decidido antes do desenho. Coorte aberta: a taxa
 * sai marcada parcial, sem variação e sem veredito. Volume zero: o número é 0 e a taxa é "sem
 * base", nunca 0% nem NaN. Variações dentro do corte: o valor continua escrito, sem cor semântica,
 * e o veredito diz que nada mudou de verdade, citando o corte.
 */
export interface CohortPairStripProps {
  readonly data?: readonly CohortPair[];
  readonly className?: string;
}

/** A partir de 10 (por cento ou pontos), a casa decimal não muda a decisão (NUM-1). */
const WHOLE_FROM = 10;

type Movement = 'better' | 'worse' | 'stable';

/** Os quatro quadrantes e o centro. Estável num lado cai no quadrante do outro. */
type PairVerdict = 'bothBetter' | 'volumeOverRate' | 'rateOverVolume' | 'bothWorse' | 'noRelevantChange';

/** Sem volume não há taxa; coorte aberta não tem veredito; sem anterior não há comparação. */
type PairState =
  | { readonly kind: 'noBase' }
  | { readonly kind: 'open'; readonly closesOn: string }
  | { readonly kind: 'noPrevious' }
  | { readonly kind: 'read'; readonly verdict: PairVerdict };

const MOVEMENT_TONE: Record<Movement, string> = {
  better: 'text-positive',
  worse: 'text-negative',
  stable: 'text-text-secondary',
};

const VERDICT_ICON: Record<PairVerdict, LucideIcon> = {
  bothBetter: TrendingUp,
  volumeOverRate: Scale,
  rateOverVolume: Scale,
  bothWorse: TrendingDown,
  noRelevantChange: Equal,
};

const STATE_ICON: Record<Exclude<PairState['kind'], 'read'>, LucideIcon> = {
  noBase: CircleSlash,
  open: Hourglass,
  noPrevious: Equal,
};

interface PairReading {
  readonly pair: CohortPair;
  readonly rate: number | null;
  readonly previousRate: number | null;
  readonly volumeDelta: number | null;
  readonly volumeMove: Movement | null;
  /** Em pontos percentuais; `null` com a coorte aberta, porque parcial contra fechada não compara. */
  readonly rateDelta: number | null;
  readonly rateMove: Movement | null;
  readonly state: PairState;
}

function movementOf(delta: number, goodDirection: GoodDirection, stableBelow: number): Movement {
  if (Math.abs(delta) < stableBelow) return 'stable';
  return delta > 0 === (goodDirection === 'up') ? 'better' : 'worse';
}

/** Leitura do par: função pura, um de cinco vereditos a partir dos dois movimentos. */
function readPair(volume: Movement, rate: Movement): PairVerdict {
  if (volume === 'stable' && rate === 'stable') return 'noRelevantChange';
  if (volume === 'better' && rate === 'worse') return 'volumeOverRate';
  if (volume === 'worse' && rate === 'better') return 'rateOverVolume';
  if (volume !== 'worse' && rate !== 'worse') return 'bothBetter';
  return 'bothWorse';
}

function rateOf(count: CohortCount): number | null {
  return count.volume > 0 ? count.converted / count.volume : null;
}

function readCohortPair(pair: CohortPair): PairReading {
  const { current, previous } = pair;
  const rate = rateOf(current);
  const previousRate = previous ? rateOf(previous) : null;
  const volumeDelta = previous && previous.volume > 0 ? current.volume / previous.volume - 1 : null;
  const volumeMove = volumeDelta === null ? null : movementOf(volumeDelta, pair.volumeGoodDirection, pair.volumeStableBelow);
  const rateDelta = pair.closesOn === null && rate !== null && previousRate !== null ? (rate - previousRate) * 100 : null;
  const rateMove = rateDelta === null ? null : movementOf(rateDelta, pair.rateGoodDirection, pair.rateStableBelow);
  const base = { pair, rate, previousRate, volumeDelta, volumeMove, rateDelta, rateMove };
  if (rate === null) return { ...base, state: { kind: 'noBase' } };
  if (pair.closesOn !== null) return { ...base, state: { kind: 'open', closesOn: pair.closesOn } };
  if (volumeMove === null || rateMove === null) return { ...base, state: { kind: 'noPrevious' } };
  return { ...base, state: { kind: 'read', verdict: readPair(volumeMove, rateMove) } };
}

/** Sinal à mão sobre o valor absoluto, com o menos tipográfico U+2212 (NUM-3). */
function withSign(value: number, text: string): string {
  if (value > 0) return `+${text}`;
  return value < 0 ? `−${text}` : text;
}

function relativeText(fraction: number): string {
  const absolute = Math.abs(fraction);
  return formatPercent(absolute, absolute * 100 >= WHOLE_FROM ? 0 : 1);
}

function pointsText(points: number): string {
  const absolute = Math.abs(points);
  return `${formatDecimal(absolute, absolute >= WHOLE_FROM ? 0 : 1)} p.p.`;
}

function subjectOf(term: Term): string {
  return `${term.article === 'o' ? 'O' : 'A'} ${term.noun}`;
}

function objectOf(term: Term): string {
  return `${term.article} ${term.noun}`;
}

function periodLabel(pair: CohortPair): string {
  return pair.grain === 'week' ? `semana de ${formatDate(pair.current.period)}` : formatMonthShort(pair.current.period);
}

function previousLabel(pair: CohortPair, previous: CohortCount): string {
  return pair.grain === 'week' ? 'na semana anterior' : `em ${formatMonthShort(previous.period)}`;
}

function closedLabel(pair: CohortPair, previous: CohortCount): string {
  return pair.grain === 'week' ? 'a semana anterior fechou em' : `${formatMonthShort(previous.period)} fechou em`;
}

function volumeCaption(pair: CohortPair, volume: number): string {
  return volume === 1 ? pair.volumeCaptionOne : pair.volumeCaption;
}

const READ_SUMMARY: Record<PairVerdict, string> = {
  bothBetter: 'com melhora sem custo',
  volumeOverRate: 'com ganho de volume à custa da taxa',
  rateOverVolume: 'com ganho de taxa à custa do volume',
  bothWorse: 'com piora nas duas medidas',
  noRelevantChange: 'sem mudança relevante',
};

/** A linha reservada do veredito: o veredito lido, ou o motivo de não haver um. */
function slotSentence(reading: PairReading): string {
  const { pair, state, volumeDelta, rateDelta, volumeMove, rateMove } = reading;
  if (state.kind === 'noBase') return `Veredito sem base: sem volume, ${objectOf(pair.rateTerm)} não tem o que medir.`;
  if (state.kind === 'open') return `Veredito suspenso até a coorte fechar em ${formatDate(state.closesOn)}.`;
  if (state.kind === 'noPrevious' || volumeDelta === null || rateDelta === null || volumeMove === null || rateMove === null) {
    return 'Sem veredito: falta um período anterior fechado para comparar.';
  }
  const volume = `${subjectOf(pair.volumeTerm)} ${volumeDelta > 0 ? 'subiu' : 'caiu'}`;
  const rate = `${subjectOf(pair.rateTerm)} ${rateDelta > 0 ? 'subiu' : 'caiu'}`;
  const both = `${volume} e ${objectOf(pair.rateTerm)} ${rateDelta > 0 ? 'subiu' : 'caiu'}`;
  switch (state.verdict) {
    case 'volumeOverRate':
      return `${volume} à custa d${pair.rateTerm.article} ${pair.rateTerm.noun}.`;
    case 'rateOverVolume':
      return `${rate} à custa d${pair.volumeTerm.article} ${pair.volumeTerm.noun}.`;
    case 'bothBetter':
      if (rateMove === 'stable') return `${volume} sem piorar ${objectOf(pair.rateTerm)}.`;
      return volumeMove === 'stable' ? `${rate} sem custo para ${objectOf(pair.volumeTerm)}.` : `${both}: melhora nas duas.`;
    case 'bothWorse':
      if (rateMove === 'stable') return `${volume} sem ganho n${pair.rateTerm.article} ${pair.rateTerm.noun}.`;
      return volumeMove === 'stable' ? `${rate} sem ganho n${pair.volumeTerm.article} ${pair.volumeTerm.noun}.` : `${both}: piora nas duas.`;
    case 'noRelevantChange':
      return `Sem mudança relevante: as duas variações ficaram dentro do corte, ${formatPercent(pair.volumeStableBelow, 0)} no volume e ${pointsText(pair.rateStableBelow)} na taxa.`;
  }
}

function summaryPart(reading: PairReading): string {
  const { pair, state } = reading;
  switch (state.kind) {
    case 'open':
      return `${pair.label} com coorte aberta até ${formatDate(state.closesOn)}`;
    case 'noBase':
      return `${pair.label} sem volume e com a taxa sem base`;
    case 'noPrevious':
      return `${pair.label} sem período anterior`;
    case 'read':
      return `${pair.label} ${READ_SUMMARY[state.verdict]}`;
  }
}

function cardSummary(reading: PairReading, sentence: string): string {
  const { pair, rate, volumeDelta, rateDelta, state } = reading;
  const change = volumeDelta === null ? '' : `, ${volumeDelta >= 0 ? 'alta' : 'queda'} de ${relativeText(volumeDelta)}`;
  const rateChange = state.kind === 'open' ? ', parcial' : rateDelta === null ? '' : `, ${rateDelta >= 0 ? 'alta' : 'queda'} de ${pointsText(rateDelta)}`;
  const rateText =
    rate === null
      ? `${pair.rateTerm.noun} sem base`
      : `${formatRateWithVolume(pair.current.converted, pair.current.volume)} ${pair.rateCaption}${rateChange}`;
  return `Par ${pair.label}, ${periodLabel(pair)}: ${formatInt(pair.current.volume)} ${volumeCaption(pair, pair.current.volume)}${change}; com ${rateText}. ${sentence}`;
}

function Change({ delta, text, movement }: { delta: number; text: string; movement: Movement }) {
  const Icon = movement === 'stable' ? ArrowRight : delta > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-0.5 font-semibold', MOVEMENT_TONE[movement])}>
      <Icon aria-hidden className="size-3.5" strokeWidth={2.5} />
      <span className="kpi-number">{withSign(delta, text)}</span>
    </span>
  );
}

function PairCard({ reading }: { reading: PairReading }) {
  const { pair, rate, previousRate, volumeDelta, volumeMove, rateDelta, rateMove, state } = reading;
  const { current, previous } = pair;
  const sentence = slotSentence(reading);
  const SlotIcon = state.kind === 'read' ? VERDICT_ICON[state.verdict] : STATE_ICON[state.kind];

  return (
    <article
      aria-label={cardSummary(reading, sentence)}
      className="flex h-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4"
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{pair.label}</p>
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">{periodLabel(pair)}</p>
      </div>

      <p className="mt-2 flex min-w-0 items-baseline gap-2">
        <span className="kpi-number text-3xl leading-none font-semibold text-text-primary">{formatInt(current.volume)}</span>
        <span className="min-w-0 truncate text-xs text-text-muted">{volumeCaption(pair, current.volume)}</span>
      </p>

      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-text-muted tabular-nums">
        {volumeDelta !== null && volumeMove !== null && previous ? (
          <>
            <Change delta={volumeDelta} movement={volumeMove} text={relativeText(volumeDelta)} />
            <span className="min-w-0 truncate">
              contra <span className="kpi-number text-text-secondary">{formatInt(previous.volume)}</span> {previousLabel(pair, previous)}
            </span>
          </>
        ) : (
          <span>sem período anterior medido para comparar</span>
        )}
      </p>

      <div className="mt-4 min-w-0">
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-xs leading-5">
          <span className="text-text-muted">com</span>
          {rate === null ? (
            <span className="font-semibold text-text-secondary">{pair.rateTerm.noun} sem base</span>
          ) : (
            <>
              <span
                className={cn(
                  'kpi-number text-sm leading-none font-semibold',
                  state.kind === 'open' ? 'text-text-secondary' : 'text-text-primary',
                )}
              >
                {formatPercent(rate)}
              </span>
              <span className="text-text-secondary">{pair.rateCaption}</span>
              <span className="text-text-muted tabular-nums">
                ({formatInt(current.converted)} de {formatInt(current.volume)})
              </span>
            </>
          )}
        </p>

        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-text-muted tabular-nums">
          {state.kind === 'noBase' ? (
            <span className="min-w-0 truncate">
              nada a dividir
              {previous && previousRate !== null ? (
                <>
                  ; {previousLabel(pair, previous)} foi{' '}
                  <span className="kpi-number text-text-secondary">{formatPercent(previousRate)}</span>{' '}
                  <span className="tabular-nums">
                    ({formatInt(previous.converted)} de {formatInt(previous.volume)})
                  </span>
                </>
              ) : null}
            </span>
          ) : state.kind === 'open' ? (
            <>
              <Clock3 aria-hidden className="size-3.5 shrink-0 text-text-secondary" strokeWidth={2.25} />
              <span className="shrink-0 font-semibold text-text-secondary">{previous && previousRate !== null ? 'parcial;' : 'parcial'}</span>
              {previous && previousRate !== null ? (
                <span className="min-w-0 truncate">
                  {closedLabel(pair, previous)} <span className="kpi-number text-text-secondary">{formatPercent(previousRate)}</span>
                </span>
              ) : null}
            </>
          ) : rateDelta !== null && rateMove !== null && previous && previousRate !== null ? (
            <>
              <Change delta={rateDelta} movement={rateMove} text={pointsText(rateDelta)} />
              <span className="min-w-0 truncate">
                contra <span className="kpi-number text-text-secondary">{formatPercent(previousRate)}</span>{' '}
                <span className="tabular-nums">
                  ({formatInt(previous.converted)} de {formatInt(previous.volume)})
                </span>{' '}
                {previousLabel(pair, previous)}
              </span>
            </>
          ) : (
            <span>sem período anterior fechado para comparar</span>
          )}
        </p>
      </div>

      <div aria-hidden className="mt-auto flex min-w-0 items-start gap-2 pt-4">
        <SlotIcon className="mt-px size-3.5 shrink-0 text-text-secondary" strokeWidth={2.25} />
        <p
          className={cn(
            'min-h-8 min-w-0 text-xs leading-4 tabular-nums',
            state.kind === 'read' ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary',
          )}
        >
          {sentence}
        </p>
      </div>
    </article>
  );
}

export default function CohortPairStrip({ data = defaultData, className }: CohortPairStripProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum par declarado neste recorte: não há volume nem qualidade para ler.</span>
      </div>
    );
  }

  const readings = data.map(readCohortPair);
  const summary = `Faixa com ${formatInt(data.length)} ${data.length === 1 ? 'par' : 'pares'} de indicadores: ${readings.map(summaryPart).join('; ')}.`;

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
