import { Minus, TrendingDown, TrendingUp, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatDate, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PacedGoal } from './data';

/**
 * Cartão de KPI com ritmo até a meta: o realizado, um trilho em SVG com dois marcadores que se
 * distinguem sem cor (meta em traço cheio, ritmo esperado em tracejado curto) e o veredito escrito,
 * "atrás do ritmo por R$ 74,0 mil". O ritmo é a fração de dias úteis fechados; a projeção linear sai
 * com a etiqueta DERIVADO e declarada como piso, porque receita concentra no fim do período.
 */
export interface PacedGoalCardProps {
  readonly data?: PacedGoal;
  readonly className?: string;
}

/** Distância do ritmo esperado lida como "no ritmo", em fração da meta (2% de R$ 600 mil são R$ 12 mil). */
const PACE_TOLERANCE = 0.02;
/** Régua: 20 px de altura, trilho de 8 px centrado, marcadores que passam do trilho. */
const RULER_HEIGHT = 20;
const TRACK_HEIGHT = 8;
const TRACK_Y = (RULER_HEIGHT - TRACK_HEIGHT) / 2;
const MARK_WIDTH = 2;
/** O ritmo é mais curto que a meta (2 px em cada ponta) e tracejado: forma diferente, não só cor. */
const PACE_INSET = 2;
const PACE_DASH = '3 2';
/** Contorno na cor do cartão atrás do marcador, para ele cortar o preenchimento em vez de sumir nele. */
const HALO_WIDTH = 5;
/** Meia largura do rótulo do ritmo, em px: o centro segue o marcador sem o texto passar das pontas do trilho. */
const PACE_LABEL_HALF = 80;
/** Abaixo da meta o percentual inteiro para em 99%. */
const LAST_WHOLE_BELOW_GOAL = 0.99;

type Verdict = 'no-pace' | 'goal-met' | 'on-pace' | 'ahead' | 'behind';

interface PaceReading {
  readonly realized: number;
  readonly goal: number;
  readonly doneShare: number;
  /** Fração do período decorrida, ou `null` antes do primeiro dia útil fechado (sem divisão por zero). */
  readonly elapsedShare: number | null;
  readonly expected: number | null;
  readonly projection: number | null;
  readonly verdict: Verdict;
}

/** Regra de três do ritmo: esperado = meta x dias decorridos / dias do período; projeção = realizado / fração. */
function paceReading({ realized, goal, businessDaysElapsed, businessDaysTotal }: PacedGoal): PaceReading | null {
  if (realized === null || goal === null || goal <= 0 || businessDaysTotal <= 0) return null;
  const elapsedShare = businessDaysElapsed > 0 ? Math.min(businessDaysElapsed / businessDaysTotal, 1) : null;
  const expected = elapsedShare === null ? null : goal * elapsedShare;
  const projection = elapsedShare === null ? null : realized / elapsedShare;
  let verdict: Verdict = 'no-pace';
  if (realized >= goal) verdict = 'goal-met';
  else if (expected !== null) {
    const gap = realized - expected;
    verdict = Math.abs(gap) <= goal * PACE_TOLERANCE ? 'on-pace' : gap > 0 ? 'ahead' : 'behind';
  }
  return { realized, goal, doneShare: realized / goal, elapsedShare, expected, projection, verdict };
}

function shareLabel(share: number): string {
  const whole = Math.round(share * 100) / 100;
  return formatPercent(share < 1 ? Math.min(whole, LAST_WHOLE_BELOW_GOAL) : whole, 0);
}

function pct(share: number): string {
  return `${String(Math.min(Math.max(share, 0), 1) * 100)}%`;
}

/** Centro do rótulo do ritmo: segue o marcador; o rótulo da meta mora sob a ponta do trilho e nunca disputa espaço. */
function paceLabelLeft(share: number): string {
  return `clamp(${String(PACE_LABEL_HALF)}px, ${pct(share)}, calc(100% + -${String(PACE_LABEL_HALF)}px))`;
}

function summaryOf(data: PacedGoal, reading: PaceReading | null): string {
  const head = `Cartão de KPI com ritmo até a meta. ${data.label}`;
  if (reading === null) {
    return data.realized === null
      ? `${head}: realizado ${formatUnavailable()} por falta de coleta, então não há ritmo nem projeção para mostrar.`
      : `${head}: ${formatCurrencyCompact(data.realized)} sem meta declarada, então não há ritmo nem veredito para calcular.`;
  }
  const done = `${formatCurrencyCompact(reading.realized)}, ${shareLabel(reading.doneShare)} da meta de ${formatCurrencyCompact(reading.goal)}`;
  const days = `com ${formatInt(data.businessDaysElapsed)} de ${formatInt(data.businessDaysTotal)} dias úteis`;
  const { expected, projection } = reading;
  if (expected === null || projection === null) return `${head}: ${done}. Nenhum dia útil fechado: sem ritmo medido e sem projeção.`;
  const gap = formatCurrencyCompact(Math.abs(reading.realized - expected));
  const verdict = {
    'goal-met': `Meta batida com ${formatCurrencyCompact(reading.realized - reading.goal)} acima`,
    'on-pace': `No ritmo esperado de ${formatCurrencyCompact(expected)}`,
    ahead: `À frente do ritmo esperado de ${formatCurrencyCompact(expected)} por ${gap}`,
    behind: `Atrás do ritmo esperado de ${formatCurrencyCompact(expected)} por ${gap}`,
    'no-pace': 'Sem ritmo medido',
  }[reading.verdict];
  return `${head}: ${done} ${days}. ${verdict}; projeção linear de ${formatCurrencyCompact(projection)}, lida como piso.`;
}

export default function PacedGoalCard({ data = defaultData, className }: PacedGoalCardProps) {
  const reading = paceReading(data);
  const summary = summaryOf(data, reading);
  const expected = reading?.expected ?? null;
  const tone = reading?.verdict === 'behind' ? 'text-negative' : reading?.verdict === 'on-pace' ? 'text-text-secondary' : 'text-positive';
  const VerdictIcon = reading?.verdict === 'behind' ? TrendingDown : reading?.verdict === 'on-pace' ? Minus : TrendingUp;

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4 tabular-nums', className)}
      role="group"
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{data.label}</p>
        <p className="shrink-0 text-xs text-text-muted">até {formatDate(data.asOf)}</p>
      </div>

      {data.realized === null ? (
        <p className="mt-2 flex items-center gap-2 text-text-muted">
          <Unplug aria-hidden className="size-5 shrink-0" />
          <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
        </p>
      ) : (
        <p className="kpi-number mt-2 text-3xl leading-none font-semibold text-text-primary">{formatCurrencyCompact(data.realized)}</p>
      )}

      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
        {reading !== null && reading.verdict !== 'no-pace' && expected !== null ? (
          <>
            <span className={cn('inline-flex shrink-0 items-center gap-0.5 font-semibold', tone)}>
              <VerdictIcon aria-hidden className="size-3.5" strokeWidth={2.5} />
              {reading.verdict === 'goal-met' ? (
                <span className="kpi-number">{formatCurrencyCompact(reading.realized - reading.goal)} acima</span>
              ) : reading.verdict === 'on-pace' ? (
                <span>no ritmo</span>
              ) : (
                <span className="kpi-number">
                  {formatCurrencyCompact(Math.abs(reading.realized - expected))} {reading.verdict === 'behind' ? 'atrás' : 'à frente'}
                </span>
              )}
            </span>
            <span className="min-w-0 truncate">
              {reading.verdict === 'goal-met' ? 'da meta de ' : reading.verdict === 'on-pace' ? 'esperado de ' : 'do ritmo de '}
              <span className="kpi-number text-text-secondary">{formatCurrencyCompact(reading.verdict === 'goal-met' ? reading.goal : expected)}</span>
            </span>
          </>
        ) : (
          <span className="min-w-0 truncate">
            {reading !== null ? 'sem ritmo medido: nenhum dia útil fechado' : data.realized === null ? 'sem coleta no período' : 'sem meta declarada para o período'}
          </span>
        )}
      </p>
      {reading !== null ? (
        <div className="mt-auto pt-3">
          <div aria-hidden className="relative h-3 text-[0.6875rem] leading-3 text-text-muted">
            {reading.elapsedShare !== null ? (
              <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap" style={{ left: paceLabelLeft(reading.elapsedShare) }}>
                ritmo: {formatInt(data.businessDaysElapsed)} de {formatInt(data.businessDaysTotal)} dias úteis
              </span>
            ) : (
              <span className="absolute top-0 left-0 whitespace-nowrap">0 de {formatInt(data.businessDaysTotal)} dias úteis fechados</span>
            )}
          </div>
          <svg aria-hidden className="mt-1 block w-full overflow-visible" height={RULER_HEIGHT}>
            <rect fill="var(--surface-sunken)" height={TRACK_HEIGHT} rx={TRACK_HEIGHT / 2} width="100%" x={0} y={TRACK_Y} />
            {reading.doneShare > 0 ? (
              <rect fill="var(--chart-1)" height={TRACK_HEIGHT} rx={TRACK_HEIGHT / 2} width={pct(reading.doneShare)} x={0} y={TRACK_Y} />
            ) : null}
            {reading.elapsedShare !== null ? (
              <g>
                <line
                  stroke="var(--surface-raised)"
                  strokeWidth={HALO_WIDTH}
                  x1={pct(reading.elapsedShare)}
                  x2={pct(reading.elapsedShare)}
                  y1={PACE_INSET}
                  y2={RULER_HEIGHT - PACE_INSET}
                />
                <line
                  stroke="var(--text-muted)"
                  strokeDasharray={PACE_DASH}
                  strokeWidth={MARK_WIDTH}
                  x1={pct(reading.elapsedShare)}
                  x2={pct(reading.elapsedShare)}
                  y1={PACE_INSET}
                  y2={RULER_HEIGHT - PACE_INSET}
                />
              </g>
            ) : null}
            <line stroke="var(--surface-raised)" strokeWidth={HALO_WIDTH} x1="100%" x2="100%" y1={0} y2={RULER_HEIGHT} />
            <line stroke="var(--text-muted)" strokeWidth={MARK_WIDTH} x1="100%" x2="100%" y1={0} y2={RULER_HEIGHT} />
          </svg>

          <div className="mt-2 flex min-w-0 items-baseline justify-between gap-3 text-xs text-text-muted">
            <span className="min-w-0 truncate">
              <span className="kpi-number text-sm leading-none font-semibold text-text-primary">{shareLabel(reading.doneShare)}</span> da meta
            </span>
            {/* Rótulo da marca da meta, sob a ponta do trilho, com nome e valor. */}
            <span className="shrink-0">
              meta <span className="kpi-number text-text-secondary">{formatCurrencyCompact(reading.goal)}</span>
            </span>
          </div>

          <p className="mt-2 flex min-w-0 items-start gap-2 text-xs text-text-muted">
            {reading.projection !== null ? (
              <>
                <span className="shrink-0 rounded-full border border-prov-derivado px-1.5 font-display text-[0.6875rem] leading-4 font-medium tracking-wider text-prov-derivado">
                  DERIVADO
                </span>
                <span className="min-w-0 leading-4">
                  projeção linear, lida como piso: <span className="kpi-number text-text-secondary">{formatCurrencyCompact(reading.projection)}</span>,{' '}
                  {shareLabel(reading.projection / reading.goal)} da meta
                </span>
              </>
            ) : (
              <span className="leading-4">sem projeção antes do primeiro dia útil fechado</span>
            )}
          </p>
        </div>
      ) : (
        <div className="mt-auto pt-3">
          <div aria-hidden className="h-2 w-full rounded-full border border-dashed border-text-muted" />
          <p className="mt-2 text-xs text-text-muted">
            {data.realized === null ? 'ritmo e projeção indisponíveis sem o realizado' : 'régua neutra: sem meta, nada a julgar'}
          </p>
        </div>
      )}
    </article>
  );
}
