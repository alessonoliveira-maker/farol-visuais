import { ArrowUpRight, Filter } from 'lucide-react';
import { useId } from 'react';

import { formatCurrencyCompact, formatMonthLong, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyGoal } from './data';

/**
 * Tira de cartões de meta que não dançam: os três casos em que a régua costuma mentir, lado a lado
 * e com a mesma geometria. Acima da meta, o preenchimento para na meta e o excedente ocupa uma zona
 * reservada (o trilho vai a 125%, então a meta cai sempre em 80% da largura), em hachura e com o
 * texto "18% acima". Zero sem dia útil fechado é trilho vazio sem cor de alerta. Sem meta, o trilho
 * fica vazado e a frase diz por quê, sem dividir por zero. Réguas em SVG com geometria em percentual.
 */
export interface GoalEdgeStripProps {
  readonly data?: readonly MonthlyGoal[];
  readonly className?: string;
}

const RULER_HEIGHT = 20;
const TRACK_HEIGHT = 8;
const TRACK_Y = (RULER_HEIGHT - TRACK_HEIGHT) / 2;
/** Zona de excesso reservada depois da meta: o trilho termina em 125% da meta. */
const EXCESS_ROOM = 0.25;
const TRACK_MAX = 1 + EXCESS_ROOM;
const MARK_WIDTH = 2;
const HALO_WIDTH = 5;
const HATCH_SIZE = 4;
const HATCH_STROKE = 1.5;
/** Excedente inteiro a partir de 10%; abaixo disso, uma casa (NUM-1). */
const WHOLE_FROM = 0.1;
/** Abaixo da meta o percentual inteiro para em 99%. */
const LAST_WHOLE_BELOW_GOAL = 0.99;
/** Meia largura do rótulo "meta R$ 180,0 mil", em px: o centro segue a marca sem o texto passar da ponta do trilho. */
const GOAL_LABEL_HALF = 52;

type Reading = { readonly kind: 'no-goal' } | { readonly kind: 'goal'; readonly goal: number; readonly share: number };

function readGoal({ realized, goal }: MonthlyGoal): Reading {
  return goal === null || goal <= 0 ? { kind: 'no-goal' } : { kind: 'goal', goal, share: realized / goal };
}

function clampShare(share: number): number {
  return Math.min(Math.max(share, 0), TRACK_MAX);
}

/** Regra de três do trilho: fração da meta sobre o topo de 125%, em percentual da largura. */
function at(share: number): string {
  return `${String((clampShare(share) / TRACK_MAX) * 100)}%`;
}

function span(from: number, to: number): string {
  return `${String(((clampShare(to) - clampShare(from)) / TRACK_MAX) * 100)}%`;
}

function goalLabelLeft(): string {
  return `min(${at(1)}, calc(100% + -${String(GOAL_LABEL_HALF)}px))`;
}

function shareLabel(share: number): string {
  const whole = Math.round(share * 100) / 100;
  return formatPercent(share < 1 ? Math.min(whole, LAST_WHOLE_BELOW_GOAL) : whole, 0);
}

function excessLabel(share: number): string {
  const excess = share - 1;
  return formatPercent(excess, excess >= WHOLE_FROM ? 0 : 1);
}

function cardPhrase(card: MonthlyGoal): string {
  const reading = readGoal(card);
  const month = formatMonthLong(card.month);
  if (reading.kind === 'no-goal') return `${card.owner} fez ${formatCurrencyCompact(card.realized)} em ${month} sem meta definida`;
  if (card.businessDaysElapsed <= 0) return `${card.owner} abre ${month} com ${formatCurrencyCompact(card.realized)} e sem ritmo medido`;
  const verb = card.businessDaysElapsed >= card.businessDaysTotal ? 'fechou' : 'está em';
  return `${card.owner} ${verb} ${month} com ${shareLabel(reading.share)} da meta de ${formatCurrencyCompact(reading.goal)}`;
}

function GoalCard({ card, hatchId }: { readonly card: MonthlyGoal; readonly hatchId: string }) {
  const reading = readGoal(card);

  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4">
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">
          {card.metric} de {formatMonthShort(card.month)}
        </p>
        <p className="shrink-0 text-xs text-text-muted">{card.owner}</p>
      </div>
      <p className="kpi-number mt-2 text-3xl leading-none font-semibold text-text-primary">{formatCurrencyCompact(card.realized)}</p>

      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
        {reading.kind === 'no-goal' ? (
          <span className="min-w-0 truncate">sem meta definida: nada a julgar</span>
        ) : reading.share >= 1 ? (
          <>
            <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-positive">
              <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={2.5} />
              <span className="kpi-number">{excessLabel(reading.share)} acima</span>
            </span>
            <span className="min-w-0 truncate">
              da meta de <span className="kpi-number text-text-secondary">{formatCurrencyCompact(reading.goal)}</span>
            </span>
          </>
        ) : card.businessDaysElapsed <= 0 ? (
          <span className="min-w-0 truncate">sem ritmo medido: nenhum dia útil fechado</span>
        ) : (
          <span className="min-w-0 truncate">
            faltam <span className="kpi-number text-text-secondary">{formatCurrencyCompact(reading.goal - card.realized)}</span> para a meta
          </span>
        )}
      </p>

      <div aria-hidden className="mt-auto pt-3">
        <div className="relative h-3 text-[0.6875rem] leading-3 text-text-muted">
          {reading.kind === 'goal' ? (
            <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap" style={{ left: goalLabelLeft() }}>
              meta {formatCurrencyCompact(reading.goal)}
            </span>
          ) : null}
        </div>
        {reading.kind === 'goal' ? (
          <svg className="mt-1 block w-full overflow-visible" height={RULER_HEIGHT}>
            <defs>
              <pattern height={HATCH_SIZE} id={hatchId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={HATCH_SIZE}>
                <line stroke="var(--chart-1)" strokeWidth={HATCH_STROKE} x1={0} x2={0} y1={0} y2={HATCH_SIZE} />
              </pattern>
            </defs>
            <rect fill="var(--surface-sunken)" height={TRACK_HEIGHT} rx={TRACK_HEIGHT / 2} width="100%" x={0} y={TRACK_Y} />
            {reading.share > 0 ? (
              <rect fill="var(--chart-1)" height={TRACK_HEIGHT} rx={TRACK_HEIGHT / 2} width={at(Math.min(reading.share, 1))} x={0} y={TRACK_Y} />
            ) : null}
            {reading.share > 1 ? (
              <rect
                fill={`url(#${hatchId})`}
                height={TRACK_HEIGHT - 1}
                stroke="var(--chart-1)"
                strokeWidth={1}
                width={span(1, reading.share)}
                x={at(1)}
                y={TRACK_Y + 0.5}
              />
            ) : null}
            <line stroke="var(--surface-raised)" strokeWidth={HALO_WIDTH} x1={at(1)} x2={at(1)} y1={0} y2={RULER_HEIGHT} />
            <line stroke="var(--text-muted)" strokeWidth={MARK_WIDTH} x1={at(1)} x2={at(1)} y1={0} y2={RULER_HEIGHT} />
          </svg>
        ) : (
          // Sem meta: trilho vazado em contorno tracejado (papel de ausência), na mesma caixa de 20 px da régua.
          <div className="mt-1 flex items-center" style={{ height: RULER_HEIGHT }}>
            <div className="w-full rounded-full border border-dashed border-text-muted" style={{ height: TRACK_HEIGHT }} />
          </div>
        )}
      </div>

      <div className="mt-2 flex min-w-0 items-baseline justify-between gap-3 text-xs text-text-muted">
        {reading.kind === 'goal' ? (
          <>
            <span className="min-w-0 truncate">
              <span className="kpi-number text-text-secondary">{formatCurrencyCompact(card.realized)}</span> de{' '}
              <span className="kpi-number text-text-secondary">{formatCurrencyCompact(reading.goal)}</span>
            </span>
            <span className="kpi-number shrink-0 text-sm leading-none font-semibold text-text-primary">{shareLabel(reading.share)}</span>
          </>
        ) : (
          <span className="min-w-0 truncate">régua neutra, sem percentual</span>
        )}
      </div>
    </article>
  );
}

export default function GoalEdgeStrip({ data = defaultData, className }: GoalEdgeStripProps) {
  const baseId = useId().replace(/:/g, '');

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não há meta para mostrar.</span>
      </div>
    );
  }

  const summary = `Tira de ${String(data.length)} cartões de meta na mesma régua. ${data.map(cardPhrase).join('; ')}.`;

  return (
    <div aria-label={summary} className={cn('@container h-full w-full min-w-0 tabular-nums', className)} role="group">
      <div className="grid h-full grid-cols-1 gap-4 @2xl:grid-cols-3">
        {data.map((card) => (
          <GoalCard card={card} hatchId={`${baseId}-${card.id}`} key={card.id} />
        ))}
      </div>
    </div>
  );
}
