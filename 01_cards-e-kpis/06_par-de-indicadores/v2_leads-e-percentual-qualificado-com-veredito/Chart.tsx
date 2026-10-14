import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import { formatDecimal, formatInt, formatMonthLong, formatMonthShort, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadQualityPair, type MonthlyFunnel, type PairSide } from './data';

/**
 * Par de indicadores com veredito: leads do mês no peso de KPI, percentual qualificado um degrau
 * abaixo, cada variação com a própria polaridade, e uma linha calculada que resolve as cores
 * opostas em texto. O quadrante de 48 px repete o veredito em forma: seta do mês anterior (centro)
 * para o atual, com volume melhor à direita, qualidade melhor para cima e o quadrante das duas
 * melhoras sombreado.
 */
export interface LeadQualityPairCardProps {
  readonly data?: LeadQualityPair;
  readonly className?: string;
}

/** A partir de 10 (por cento ou pontos), a casa decimal não muda a decisão (NUM-1). */
const WHOLE_FROM = 10;
/** Caixa do quadrante, em px: cabe ao lado de duas linhas de texto. */
const GLYPH = 48;
const GLYPH_CENTER = GLYPH / 2;
/** Até onde a ponta da seta chega a partir do centro, com folga para a cabeça não tocar a borda. */
const GLYPH_REACH = 19;
/** Variação de N cortes de estabilidade leva a ponta a N / (N + 2) do alcance: nunca estoura. */
const GLYPH_SOFTNESS = 2;
const ARROW_HEAD_LENGTH = 7;
const ARROW_HEAD_WIDTH = 6;

type Movement = 'better' | 'worse' | 'stable';

/** Os quatro quadrantes e o centro. Estável num eixo cai no quadrante do outro. */
type PairVerdict = 'bothBetter' | 'volumeOverQuality' | 'qualityOverVolume' | 'bothWorse' | 'noRelevantChange';

const MOVEMENT_TONE: Record<Movement, string> = {
  better: 'text-positive',
  worse: 'text-negative',
  stable: 'text-text-secondary',
};

/** A cor sai da polaridade, nunca do sinal do delta (COR-6). */
function movementOf(delta: number, side: PairSide): Movement {
  if (Math.abs(delta) < side.stableBelow) return 'stable';
  return delta > 0 === (side.goodDirection === 'up') ? 'better' : 'worse';
}

/** Leitura do par: função pura, um de cinco vereditos a partir dos dois movimentos. */
function readPair(volume: Movement, quality: Movement): PairVerdict {
  if (volume === 'stable' && quality === 'stable') return 'noRelevantChange';
  if (volume === 'better' && quality === 'worse') return 'volumeOverQuality';
  if (volume === 'worse' && quality === 'better') return 'qualityOverVolume';
  if (volume !== 'worse' && quality !== 'worse') return 'bothBetter';
  return 'bothWorse';
}

function verdictSentence(verdict: PairVerdict, volume: Movement, quality: Movement): string {
  switch (verdict) {
    case 'volumeOverQuality':
      return 'O volume subiu à custa da qualidade.';
    case 'qualityOverVolume':
      return 'A qualidade subiu à custa do volume.';
    case 'bothBetter':
      if (quality === 'stable') return 'O volume subiu sem perder qualidade.';
      return volume === 'stable' ? 'A qualidade subiu sem custo para o volume.' : 'Volume e qualidade melhoraram juntos.';
    case 'bothWorse':
      if (quality === 'stable') return 'O volume caiu sem ganho na qualidade.';
      return volume === 'stable' ? 'A qualidade caiu sem ganho no volume.' : 'Volume e qualidade pioraram juntos.';
    case 'noRelevantChange':
      return 'Sem mudança relevante: as duas variações ficaram dentro do corte.';
  }
}

function rateOf(month: MonthlyFunnel): number | null {
  return month.leads > 0 ? month.qualified / month.leads : null;
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

interface GlyphGeometry {
  /** Segmento do centro até a base da cabeça, ou `null` quando a seta seria curta demais. */
  readonly shaft: { readonly x: number; readonly y: number } | null;
  readonly head: string | null;
  readonly tip: { readonly x: number; readonly y: number };
}

function soften(cuts: number): number {
  return cuts / (Math.abs(cuts) + GLYPH_SOFTNESS);
}

/** Mede cada variação em cortes e orienta pelo "bom": direita e acima são melhores nos dois eixos. */
function glyphGeometry(volumeDelta: number, qualityDelta: number, volume: PairSide, quality: PairSide): GlyphGeometry {
  const volumeCuts = (volumeDelta / volume.stableBelow) * (volume.goodDirection === 'up' ? 1 : -1);
  const qualityCuts = (qualityDelta / quality.stableBelow) * (quality.goodDirection === 'up' ? 1 : -1);
  const tip = { x: GLYPH_CENTER + soften(volumeCuts) * GLYPH_REACH, y: GLYPH_CENTER - soften(qualityCuts) * GLYPH_REACH };
  const dx = tip.x - GLYPH_CENTER;
  const dy = tip.y - GLYPH_CENTER;
  const length = Math.hypot(dx, dy);
  if (length < ARROW_HEAD_LENGTH + 2) return { shaft: null, head: null, tip };
  const ux = dx / length;
  const uy = dy / length;
  const base = { x: tip.x - ux * ARROW_HEAD_LENGTH, y: tip.y - uy * ARROW_HEAD_LENGTH };
  const half = ARROW_HEAD_WIDTH / 2;
  const corners = [tip, { x: base.x - uy * half, y: base.y + ux * half }, { x: base.x + uy * half, y: base.y - ux * half }];
  return { shaft: base, head: corners.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' '), tip };
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

export default function LeadQualityPairCard({ data = defaultData, className }: LeadQualityPairCardProps) {
  const { current, previous } = data;
  const rate = rateOf(current);
  const previousRate = previous ? rateOf(previous) : null;
  const volumeDelta = previous && previous.leads > 0 ? current.leads / previous.leads - 1 : null;
  const qualityDelta = rate !== null && previousRate !== null ? (rate - previousRate) * 100 : null;
  const volumeMove = volumeDelta === null ? null : movementOf(volumeDelta, data.volume);
  const qualityMove = qualityDelta === null ? null : movementOf(qualityDelta, data.quality);
  const verdict = volumeMove !== null && qualityMove !== null ? readPair(volumeMove, qualityMove) : null;
  const sentence =
    verdict !== null && volumeMove !== null && qualityMove !== null
      ? verdictSentence(verdict, volumeMove, qualityMove)
      : 'Sem veredito: falta um mês anterior medido para comparar.';
  const glyph =
    volumeDelta !== null && qualityDelta !== null ? glyphGeometry(volumeDelta, qualityDelta, data.volume, data.quality) : null;

  const summary = [
    `Par de indicadores de ${formatMonthLong(current.month)}: ${formatInt(current.leads)} leads`,
    volumeDelta !== null && previous
      ? `, ${volumeDelta >= 0 ? 'alta' : 'queda'} de ${relativeText(volumeDelta)} contra ${formatInt(previous.leads)}`
      : '',
    rate === null ? '; qualificação sem base.' : `; ${formatRateWithVolume(current.qualified, current.leads)} qualificados`,
    rate !== null && qualityDelta !== null && previousRate !== null
      ? `, ${qualityDelta >= 0 ? 'alta' : 'queda'} de ${pointsText(qualityDelta)} contra ${formatPercent(previousRate)}.`
      : rate === null
        ? ''
        : '.',
    ` ${sentence}`,
  ].join('');

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">{formatMonthShort(current.month)}</p>
      </div>

      <p className="mt-2 flex min-w-0 items-baseline gap-2">
        <span className="kpi-number text-3xl leading-none font-semibold text-text-primary">{formatInt(current.leads)}</span>
        <span className="min-w-0 truncate text-xs text-text-muted">leads no mês</span>
      </p>

      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-text-muted tabular-nums">
        {volumeDelta !== null && volumeMove !== null && previous ? (
          <>
            <Change delta={volumeDelta} movement={volumeMove} text={relativeText(volumeDelta)} />
            <span className="min-w-0 truncate">
              contra <span className="kpi-number text-text-secondary">{formatInt(previous.leads)}</span> em{' '}
              {formatMonthShort(previous.month)}
            </span>
          </>
        ) : (
          <span>sem mês anterior medido para comparar</span>
        )}
      </p>

      <div className="mt-4 min-w-0">
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-xs leading-5">
          <span className="text-text-muted">com</span>
          {rate === null ? (
            <span className="font-semibold text-text-muted">qualificação sem base</span>
          ) : (
            <>
              <span className="kpi-number text-sm leading-none font-semibold text-text-primary">{formatPercent(rate)}</span>
              <span className="text-text-secondary">de leads qualificados</span>
              <span className="text-text-muted tabular-nums">
                ({formatInt(current.qualified)} de {formatInt(current.leads)})
              </span>
            </>
          )}
        </p>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-text-muted tabular-nums">
          {qualityDelta !== null && qualityMove !== null && previous && previousRate !== null ? (
            <>
              <Change delta={qualityDelta} movement={qualityMove} text={pointsText(qualityDelta)} />
              <span className="min-w-0 truncate">
                contra <span className="kpi-number text-text-secondary">{formatPercent(previousRate)}</span>{' '}
                <span className="tabular-nums">
                  ({formatInt(previous.qualified)} de {formatInt(previous.leads)})
                </span>
              </span>
            </>
          ) : (
            <span>sem taxa anterior para comparar</span>
          )}
        </p>
      </div>

      <div aria-hidden className="mt-auto flex min-w-0 items-center gap-3 pt-4">
        {glyph ? (
          <svg className="size-12 shrink-0" viewBox={`0 0 ${String(GLYPH)} ${String(GLYPH)}`}>
            {/* Quadrante em que as duas medidas melhoram: o alvo da seta. */}
            <rect fill="var(--line-subtle)" height={GLYPH_CENTER} width={GLYPH_CENTER} x={GLYPH_CENTER} y={0} />
            <line stroke="var(--line-strong)" strokeWidth={1} x1={0} x2={GLYPH} y1={GLYPH_CENTER} y2={GLYPH_CENTER} />
            <line stroke="var(--line-strong)" strokeWidth={1} x1={GLYPH_CENTER} x2={GLYPH_CENTER} y1={0} y2={GLYPH} />
            {glyph.shaft ? (
              <line
                stroke="var(--chart-1)"
                strokeLinecap="round"
                strokeWidth={2}
                x1={GLYPH_CENTER}
                x2={glyph.shaft.x}
                y1={GLYPH_CENTER}
                y2={glyph.shaft.y}
              />
            ) : null}
            <circle cx={GLYPH_CENTER} cy={GLYPH_CENTER} fill="var(--surface-raised)" r={2.5} stroke="var(--chart-1)" strokeWidth={1.5} />
            {glyph.head ? (
              <polygon fill="var(--chart-1)" points={glyph.head} />
            ) : (
              <circle cx={glyph.tip.x} cy={glyph.tip.y} fill="var(--chart-1)" r={2.5} />
            )}
          </svg>
        ) : null}
        <div className="min-w-0">
          <p className="text-xs leading-4 font-semibold text-text-primary">{sentence}</p>
          {glyph && previous ? (
            <p className="mt-1 text-[0.6875rem] leading-4 text-text-muted tabular-nums">
              de {formatMonthShort(previous.month)} para {formatMonthShort(current.month)}; acima e à direita é melhor
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
