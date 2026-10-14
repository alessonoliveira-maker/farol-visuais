import { ArrowDownRight, ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

import { formatDate, formatHours, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ReadingIndicator, type WeeklyReading } from './data';

/**
 * Linha de leitura da semana com seta de tendência: cada indicador da pré-vendas vira um trecho da
 * frase, com a seta inline, o número que a sustenta e a base escrita ao lado. A seta diz o sentido
 * e a cor diz se foi bom; o tamanho dela nunca acompanha a magnitude da mudança.
 */
export interface TrendReadingLineProps {
  readonly data?: WeeklyReading;
  readonly className?: string;
}

/** Tamanho fixo do glifo: `size-3.5` são 14 px, o mesmo para a menor e a maior mudança. */
const ARROW_CLASS = 'size-3.5';
/** A partir de 10% a casa decimal não muda a decisão (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;

type Direction = 'up' | 'down' | 'flat';
type Tone = 'good' | 'bad' | 'neutral';

type Reading =
  | { readonly kind: 'move'; readonly fraction: number; readonly direction: Direction; readonly tone: Tone }
  | { readonly kind: 'no-base' }
  | { readonly kind: 'unavailable' };

const ARROW: Record<Direction, LucideIcon> = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight };
const TONE_CLASS: Record<Tone, string> = {
  good: 'text-positive',
  bad: 'text-negative',
  neutral: 'text-text-secondary',
};
const DIRECTION_WORD: Record<Direction, string> = { up: 'em alta', down: 'em queda', flat: 'estável' };

/** A cor sai da polaridade da métrica, nunca do sentido da seta (COR-6). */
function readingOf(indicator: ReadingIndicator, stableBelow: number): Reading {
  const { current, previous, goodDirection } = indicator;
  if (current === null) return { kind: 'unavailable' };
  if (previous === null || previous === 0) return { kind: 'no-base' };
  const fraction = (current - previous) / Math.abs(previous);
  if (Math.abs(fraction) < stableBelow) return { kind: 'move', fraction, direction: 'flat', tone: 'neutral' };
  const direction: Direction = fraction > 0 ? 'up' : 'down';
  return { kind: 'move', fraction, direction, tone: direction === goodDirection ? 'good' : 'bad' };
}

function valueText(indicator: ReadingIndicator, value: number): string {
  return indicator.unit === 'hours' ? formatHours(value) : formatInt(value);
}

function percentText(fraction: number): string {
  const absolute = Math.abs(fraction);
  return formatPercent(absolute, absolute >= WHOLE_PERCENT_FROM ? 0 : 1);
}

/** Sinal à mão sobre o valor absoluto: `formatPercent` não escreve o `+` (NUM-3). */
function signedPercent(fraction: number): string {
  return `${fraction > 0 ? '+' : fraction < 0 ? '−' : ''}${percentText(fraction)}`;
}

function Item({ indicator, reading }: { indicator: ReadingIndicator; reading: Reading }) {
  const Arrow = reading.kind === 'move' ? ARROW[reading.direction] : null;
  const tone = reading.kind === 'move' ? TONE_CLASS[reading.tone] : 'text-text-muted';
  return (
    <span className="whitespace-nowrap">
      {indicator.label}{' '}
      {/* O glifo mora num contêiner flex: solto na linha de texto, o serializador engorda a linha (GEO-17). */}
      <span className={cn('inline-flex items-baseline gap-1 font-semibold', tone)}>
        {Arrow ? <Arrow aria-hidden className={ARROW_CLASS} strokeWidth={2.5} /> : null}
        <span className="kpi-number text-text-primary">
          {indicator.current === null ? formatUnavailable() : valueText(indicator, indicator.current)}
        </span>
      </span>
      {reading.kind === 'move' && indicator.previous !== null ? (
        <span className="text-xs text-text-muted tabular-nums">
          {' '}
          (<span className={cn('font-semibold', tone)}>{signedPercent(reading.fraction)}</span> contra{' '}
          <span className="kpi-number text-text-secondary">{valueText(indicator, indicator.previous)}</span>)
        </span>
      ) : null}
      {reading.kind === 'no-base' ? <span className="text-xs text-text-muted"> (sem semana anterior medida)</span> : null}
    </span>
  );
}

export default function TrendReadingLine({ data = defaultData, className }: TrendReadingLineProps) {
  const readings = data.indicators.map((indicator) => ({ indicator, reading: readingOf(indicator, data.stableBelow) }));
  const moves = readings.flatMap(({ indicator, reading }) => (reading.kind === 'move' ? [{ indicator, reading }] : []));
  const count = (direction: Direction) => moves.filter(({ reading }) => reading.direction === direction).length;
  const worse = moves.filter(({ reading }) => reading.tone === 'bad');
  const unmeasured = readings.length - moves.length;
  const lowerIsBetter = data.indicators.filter((indicator) => indicator.goodDirection === 'down');

  const summary = [
    `Linha de leitura da ${data.team.toLowerCase()} na semana de ${formatDate(data.weekStart)}: ${formatInt(readings.length)} indicadores`,
    `, ${formatInt(count('up'))} ${DIRECTION_WORD.up}, ${formatInt(count('flat'))} ${count('flat') === 1 ? 'estável' : 'estáveis'} e ${formatInt(count('down'))} ${DIRECTION_WORD.down}`,
    unmeasured > 0 ? `, ${formatInt(unmeasured)} sem semana anterior medida` : '',
    '.',
    ...worse.map(
      ({ indicator, reading }) =>
        ` ${indicator.label.charAt(0).toUpperCase()}${indicator.label.slice(1)}: ${signedPercent(reading.fraction)}, o que é pior.`,
    ),
  ].join('');

  if (data.indicators.length === 0) {
    return (
      <article
        aria-label="Linha de leitura vazia: a semana não tem indicadores para ler."
        className={cn('flex h-full w-full min-w-0 items-center justify-center rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
        role="status"
      >
        <p className="text-xs text-text-muted">Nenhum indicador na semana, então não há leitura a fazer.</p>
      </article>
    );
  }

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 text-xs font-medium text-text-secondary">{data.team}, leitura da semana</p>
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">semana de {formatDate(data.weekStart)}</p>
      </div>

      <p className="mt-3 text-sm leading-7 text-text-secondary">
        {readings.map(({ indicator, reading }, index) => (
          <span key={indicator.id}>
            {index > 0 ? '; ' : ''}
            <Item indicator={indicator} reading={reading} />
          </span>
        ))}
        .
      </p>

      <p className="mt-auto flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] text-text-muted tabular-nums">
        {(['up', 'flat', 'down'] as const).map((direction) => {
          const Arrow = ARROW[direction];
          return (
            <span className="inline-flex items-center gap-1" key={direction}>
              <Arrow aria-hidden className={ARROW_CLASS} strokeWidth={2.5} />
              {direction === 'flat' ? `estável, variação abaixo de ${formatPercent(data.stableBelow, 0)}` : DIRECTION_WORD[direction]}
            </span>
          );
        })}
        {lowerIsBetter.length > 0 ? (
          <span>a cor segue a métrica: {lowerIsBetter.map((indicator) => indicator.label).join(' e ')}, subir é pior</span>
        ) : null}
      </p>
    </article>
  );
}
