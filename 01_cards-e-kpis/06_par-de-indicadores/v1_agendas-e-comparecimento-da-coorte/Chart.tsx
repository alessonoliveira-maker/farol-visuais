import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import { formatDate, formatDecimal, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CohortWeek, type PairSide, type SchedulingPair } from './data';

/**
 * Par de indicadores da coorte semanal: agendas marcadas (efeito) no peso de KPI e o
 * comparecimento dessas mesmas agendas (contraefeito) um degrau abaixo, ligados por um conector
 * escrito. Cada variação tem a própria polaridade e a própria base, e o denominador do
 * comparecimento é o número de agendas do cartão, porque a coorte é a mesma.
 */
export interface SchedulingPairCardProps {
  readonly data?: SchedulingPair;
  readonly className?: string;
}

/** A partir de 10 (por cento ou pontos), a casa decimal não muda a decisão (NUM-1). */
const WHOLE_FROM = 10;

type Movement = 'better' | 'worse' | 'stable';

const MOVEMENT_TONE: Record<Movement, string> = {
  better: 'text-positive',
  worse: 'text-negative',
  stable: 'text-text-secondary',
};

/** A cor sai da polaridade da medida, nunca do sinal do delta (COR-6). */
function movementOf(delta: number, side: PairSide): Movement {
  if (Math.abs(delta) < side.stableBelow) return 'stable';
  return delta > 0 === (side.goodDirection === 'up') ? 'better' : 'worse';
}

function rateOf(week: CohortWeek): number | null {
  return week.scheduled > 0 ? week.attended / week.scheduled : null;
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

function agendas(count: number): string {
  return count === 1 ? 'agenda' : 'agendas';
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

export default function SchedulingPairCard({ data = defaultData, className }: SchedulingPairCardProps) {
  const { current, previous } = data;
  const rate = rateOf(current);
  const previousRate = previous ? rateOf(previous) : null;
  const volumeDelta = previous && previous.scheduled > 0 ? current.scheduled / previous.scheduled - 1 : null;
  const pointsDelta = rate !== null && previousRate !== null ? (rate - previousRate) * 100 : null;
  const volumeMove = volumeDelta === null ? null : movementOf(volumeDelta, data.scheduling);
  const attendanceMove = pointsDelta === null ? null : movementOf(pointsDelta, data.attendance);
  // O conector nomeia a relação: vira "mas com" quando o volume melhorou à custa do comparecimento.
  const connector = volumeMove === 'better' && attendanceMove === 'worse' ? 'mas com' : 'com';

  const summary = [
    `Par de indicadores da semana de ${formatDate(current.weekStart)}: ${formatInt(current.scheduled)} ${agendas(current.scheduled)} marcadas`,
    volumeDelta !== null && previous
      ? `, ${volumeDelta >= 0 ? 'alta' : 'queda'} de ${relativeText(volumeDelta)} contra ${formatInt(previous.scheduled)} na semana anterior`
      : ', sem semana anterior medida',
    rate === null
      ? '; comparecimento sem base.'
      : `; ${connector} ${formatRateWithVolume(current.attended, current.scheduled)} de comparecimento`,
    rate !== null && pointsDelta !== null && previousRate !== null
      ? `, ${pointsDelta >= 0 ? 'alta' : 'queda'} de ${pointsText(pointsDelta)} contra ${formatPercent(previousRate)}.`
      : rate === null
        ? ''
        : '.',
  ].join('');

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">semana de {formatDate(current.weekStart)}</p>
      </div>

      <p className="mt-2 flex min-w-0 items-baseline gap-2">
        <span className="kpi-number text-3xl leading-none font-semibold text-text-primary">{formatInt(current.scheduled)}</span>
        <span className="min-w-0 truncate text-xs text-text-muted">{agendas(current.scheduled)} marcadas</span>
      </p>

      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
        {volumeDelta !== null && volumeMove !== null && previous ? (
          <>
            <Change delta={volumeDelta} movement={volumeMove} text={relativeText(volumeDelta)} />
            <span className="min-w-0 truncate">
              contra <span className="kpi-number text-text-secondary">{formatInt(previous.scheduled)}</span> na semana anterior
            </span>
          </>
        ) : (
          <span>sem semana anterior medida para comparar</span>
        )}
      </p>

      <div className="mt-4 min-w-0">
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-xs leading-5">
          <span className="text-text-muted">{connector}</span>
          {rate === null ? (
            <span className="font-semibold text-text-muted">comparecimento sem base</span>
          ) : (
            <>
              <span className="kpi-number text-sm leading-none font-semibold text-text-primary">{formatPercent(rate)}</span>
              <span className="text-text-secondary">de comparecimento</span>
              <span className="text-text-muted tabular-nums">
                ({formatInt(current.attended)} de {formatInt(current.scheduled)} {agendas(current.scheduled)})
              </span>
            </>
          )}
        </p>

        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
          {pointsDelta !== null && attendanceMove !== null && previous && previousRate !== null ? (
            <>
              <Change delta={pointsDelta} movement={attendanceMove} text={pointsText(pointsDelta)} />
              <span className="min-w-0 truncate">
                contra <span className="kpi-number text-text-secondary">{formatPercent(previousRate)}</span>{' '}
                <span className="tabular-nums">
                  ({formatInt(previous.attended)} de {formatInt(previous.scheduled)})
                </span>
              </span>
            </>
          ) : (
            <span>sem coorte anterior fechada para comparar</span>
          )}
        </p>
      </div>
    </article>
  );
}
