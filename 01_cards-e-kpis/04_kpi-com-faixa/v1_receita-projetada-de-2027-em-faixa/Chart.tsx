import { TriangleAlert, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Provenance, type RangeKpi } from './data';

/**
 * Cartão de KPI em faixa: a projeção escrita como intervalo é o número principal, e uma régua em
 * SVG puro mostra a largura da faixa contra um domínio declarado (de zero ao teto do plano), com
 * o ponto central em traço fino e a referência realizada tracejada. Apoia a Diretoria quando
 * publicar o ponto médio viraria compromisso.
 */
export interface RangeKpiCardProps {
  readonly data?: RangeKpi;
  readonly className?: string;
}

/** Caixa da régua: largura em unidades livres, altura igual à altura em pixels (h-5). */
const RULER_WIDTH = 1000;
const RULER_HEIGHT = 20;
const RULER_MID = RULER_HEIGHT / 2;
const BAND_HEIGHT = 10;
const END_TICK = 4;
const NOTCH_WIDTH = 2;
/** Rótulo a menos de 12% de uma ponta alinha pela ponta, para não sair do cartão. */
const EDGE_FRACTION = 0.12;
/** Destaque: a faixa é a mensagem e é a única marca colorida. */
const BAND_FILL = 'var(--chart-1)';
/** O domínio declarado: linha e pontas em referência forte, como o zero de um eixo. */
const TRACK_STROKE = 'var(--line-strong)';
/** O ponto central é um corte na faixa, na cor do cartão: fica mais leve que a faixa. */
const NOTCH_STROKE = 'var(--surface-raised)';
const REFERENCE_STROKE = 'var(--text-muted)';
const REFERENCE_DASH = '3 3';

const PROVENANCE_CLASS: Record<Provenance, string> = {
  MEDIDO: 'border-prov-medido/45 text-prov-medido',
  DERIVADO: 'border-prov-derivado/45 text-prov-derivado',
  PREMISSA: 'border-prov-premissa/45 text-prov-premissa',
  LACUNA: 'border-prov-lacuna/45 text-prov-lacuna',
};

type Anchor = 'start' | 'middle' | 'end';

const ANCHOR_CLASS: Record<Anchor, string> = {
  start: '',
  middle: '-translate-x-1/2',
  end: '-translate-x-full',
};

interface RulerGeometry {
  /** Posições de 0 a 1 no domínio de zero ao teto, presas às pontas. */
  readonly low: number;
  readonly high: number;
  readonly central: number | null;
  readonly reference: number | null;
}

/** Fração de um valor no domínio de zero a `max`, presa entre 0 e 1. */
function toFraction(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}

/** Geometria da régua. O domínio é o declarado no dado, nunca o intervalo da própria faixa. */
function rulerGeometry(kpi: RangeKpi, low: number, high: number): RulerGeometry {
  const max = kpi.domain.max;
  const central = kpi.central;
  return {
    low: toFraction(low, max),
    high: toFraction(high, max),
    central: central !== null && central >= low && central <= high ? toFraction(central, max) : null,
    reference: kpi.reference ? toFraction(kpi.reference.value, max) : null,
  };
}

/**
 * Âncora do rótulo de uma marca. `away` empurra o texto para longe da faixa (a referência fica do
 * lado de fora); perto de uma ponta, o rótulo alinha pela ponta para não sair do cartão.
 */
function anchorFor(fraction: number, away: 'left' | 'right' | null = null): Anchor {
  if (fraction < EDGE_FRACTION) return 'start';
  if (fraction > 1 - EDGE_FRACTION) return 'end';
  if (away === 'left') return 'end';
  if (away === 'right') return 'start';
  return 'middle';
}

function referenceSide(geometry: RulerGeometry): 'left' | 'right' | null {
  if (geometry.reference === null) return null;
  if (geometry.reference < geometry.low) return 'left';
  if (geometry.reference > geometry.high) return 'right';
  return null;
}

function percent(fraction: number): string {
  return `${String(fraction * 100)}%`;
}

/** Onde a faixa fica em relação à referência medida: acima, abaixo ou contendo. */
function referenceReading(low: number, high: number, kpi: RangeKpi): string | null {
  const reference = kpi.reference;
  if (!reference) return null;
  if (low > reference.value) return `a faixa toda supera o ${reference.label}`;
  if (high < reference.value) return `a faixa toda fica abaixo do ${reference.label}`;
  return `o ${reference.label} cai dentro da faixa`;
}

export default function RangeKpiCard({ data = defaultData, className }: RangeKpiCardProps) {
  const { low, high, reference, domain } = data;
  const premise = data.premise.trim();
  const range = low !== null && high !== null && low <= high ? { low, high } : null;
  const geometry = range ? rulerGeometry(data, range.low, range.high) : null;
  const reading = range ? referenceReading(range.low, range.high, data) : null;

  const summary = [
    range
      ? `Cartão de KPI em faixa: ${data.label}, entre ${formatCurrencyCompact(range.low)} e ${formatCurrencyCompact(range.high)}${data.central === null ? '' : `, com centro em ${formatCurrencyCompact(data.central)}`}.`
      : `Cartão de KPI em faixa: ${data.label}, ${formatUnavailable()}.`,
    range && reading && reference ? `${reading.charAt(0).toUpperCase()}${reading.slice(1)}, ${formatCurrencyCompact(reference.value)}.` : '',
    premise ? `Premissa: ${premise}.` : 'Sem premissa declarada.',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <p className="min-w-0 text-xs leading-5 font-medium text-text-secondary">{data.label}</p>
        <span
          className={cn(
            'inline-flex h-5 shrink-0 items-center rounded-full border px-2 font-display text-[0.6875rem] leading-none font-medium tracking-wider',
            PROVENANCE_CLASS[data.provenance],
          )}
        >
          {data.provenance}
        </span>
      </div>

      {range && geometry ? (
        <>
          <p className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-text-primary">
            <span className="kpi-number text-3xl leading-none font-semibold">{formatCurrencyCompact(range.low)}</span>
            <span className="inline-flex items-baseline gap-x-2">
              <span className="text-sm leading-none text-text-muted">a</span>
              <span className="kpi-number text-3xl leading-none font-semibold">{formatCurrencyCompact(range.high)}</span>
            </span>
          </p>

          <p aria-hidden className="mt-2 text-xs leading-5 text-text-secondary">
            {data.central === null ? null : (
              <>
                Centro em <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(data.central)}</span>
                {reading ? '; ' : '.'}
              </>
            )}
            {reading ? `${data.central === null ? `${reading.charAt(0).toUpperCase()}${reading.slice(1)}` : reading}.` : null}
          </p>

          <div aria-hidden className="mt-auto pt-4">
            <div className="relative h-4">
              {reference && geometry.reference !== null ? (
                <span
                  className={cn(
                    'absolute bottom-1 text-[0.6875rem] leading-none whitespace-nowrap text-text-muted',
                    ANCHOR_CLASS[anchorFor(geometry.reference, referenceSide(geometry))],
                  )}
                  style={{ left: percent(geometry.reference) }}
                >
                  {reference.label}: <span className="kpi-number">{formatCurrencyCompact(reference.value)}</span>
                </span>
              ) : null}
              {geometry.central !== null && (geometry.reference === null || referenceSide(geometry) !== null) ? (
                <span
                  className={cn(
                    'absolute bottom-1 text-[0.6875rem] leading-none whitespace-nowrap text-text-muted',
                    ANCHOR_CLASS[anchorFor(geometry.central)],
                  )}
                  style={{ left: percent(geometry.central) }}
                >
                  centro
                </span>
              ) : null}
            </div>
            <svg
              className="block h-5 w-full overflow-visible"
              preserveAspectRatio="none"
              viewBox={`0 0 ${String(RULER_WIDTH)} ${String(RULER_HEIGHT)}`}
            >
              <line stroke={TRACK_STROKE} strokeWidth={1} vectorEffect="non-scaling-stroke" x1={0} x2={RULER_WIDTH} y1={RULER_MID} y2={RULER_MID} />
              {[0, RULER_WIDTH].map((x) => (
                <line
                  key={`end-${String(x)}`}
                  stroke={TRACK_STROKE}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  x1={x}
                  x2={x}
                  y1={RULER_MID - END_TICK}
                  y2={RULER_MID + END_TICK}
                />
              ))}
              <rect
                fill={BAND_FILL}
                height={BAND_HEIGHT}
                width={Math.max((geometry.high - geometry.low) * RULER_WIDTH, 1)}
                x={geometry.low * RULER_WIDTH}
                y={RULER_MID - BAND_HEIGHT / 2}
              />
              {geometry.central === null ? null : (
                <line
                  stroke={NOTCH_STROKE}
                  strokeWidth={NOTCH_WIDTH}
                  vectorEffect="non-scaling-stroke"
                  x1={geometry.central * RULER_WIDTH}
                  x2={geometry.central * RULER_WIDTH}
                  y1={RULER_MID - BAND_HEIGHT / 2}
                  y2={RULER_MID + BAND_HEIGHT / 2}
                />
              )}
              {geometry.reference === null ? null : (
                <line
                  stroke={REFERENCE_STROKE}
                  strokeDasharray={REFERENCE_DASH}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  x1={geometry.reference * RULER_WIDTH}
                  x2={geometry.reference * RULER_WIDTH}
                  y1={0}
                  y2={RULER_HEIGHT}
                />
              )}
            </svg>
            <div className="mt-1.5 flex justify-between gap-3 text-[0.6875rem] leading-none text-text-muted">
              <span className="kpi-number">{formatCurrencyCompact(0)}</span>
              <span>
                {domain.label}: <span className="kpi-number">{formatCurrencyCompact(domain.max)}</span>
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 flex items-center gap-2 text-text-muted">
            <Unplug aria-hidden className="size-5 shrink-0" />
            <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
          </p>
          <p className="mt-2 text-xs leading-5 text-text-muted">A projeção deste cenário não foi calculada; nenhum ponto é publicado no lugar.</p>
        </>
      )}

      {premise ? (
        <p className="mt-3 text-xs leading-5 text-text-muted">
          <span className="font-medium text-text-secondary">Premissa:</span> {premise}
        </p>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-xs leading-5 text-text-secondary">
          <TriangleAlert aria-hidden className="size-3.5 shrink-0 text-warning" />
          Sem premissa declarada: a faixa não deve ser publicada.
        </p>
      )}
    </article>
  );
}
