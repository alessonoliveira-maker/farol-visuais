import { TriangleAlert, Unplug } from 'lucide-react';

import { formatDays, formatDecimal, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CycleSample, type LimitCases, type Provenance, type ReturnRange } from './data';

/**
 * Dois casos limite do KPI em faixa lado a lado: uma projeção de retorno que cruza zero, com sinal
 * tipográfico no limite negativo e o zero marcado na régua; e um tempo de ciclo com amostra pequena
 * (n = 14), em que o p90 é suprimido e as oportunidades ainda abertas ficam fora da conta.
 */
export interface LimitCasesCardProps {
  readonly data?: LimitCases;
  readonly className?: string;
}

/** Abaixo disto o p90 oscila a cada caso novo e sai do cartão (mesmo corte do modelo 04, v3). */
const MIN_SAMPLE_FOR_P90 = 30;
/** Régua em unidades livres na largura (viewBox não uniforme) e em pixels na altura. */
const RULER_WIDTH = 1000;
const RULER_HEIGHT = 20;
const RULER_MID = RULER_HEIGHT / 2;
const BAND_HEIGHT = 10;
const END_TICK = 4;
/** Tique do zero: mais alto que o das pontas, para a marca do empate se destacar sozinha. */
const ZERO_TICK = 7;
/** O empate da métrica: retorno igual ao investido. É o mesmo número que a régua marca e que o
 * rótulo escreve, por isso mora numa constante só. */
const ZERO_MARK = 0;
const NOTCH_WIDTH = 2;
const MARKER_SIZE = 9;
const MARKER_RING_WIDTH = 1.5;
/** Rótulo a menos de 12% de uma ponta alinha pela ponta, para não sair do cartão. */
const EDGE_FRACTION = 0.12;
/** Destaque: a faixa e o marcador de mediana são a única marca colorida de cada cartão. */
const BAND_FILL = 'var(--chart-1)';
const MARK_FILL = 'var(--chart-1)';
/** O domínio declarado: linha, pontas e zero em referência forte. */
const TRACK_STROKE = 'var(--line-strong)';
/** Corte central e contorno do marcador: cor do cartão, separa sem tinta nova. */
const NOTCH_STROKE = 'var(--surface-raised)';
const MARKER_RING = 'var(--surface-raised)';

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

function anchorFor(fraction: number, away: 'left' | 'right' | null = null): Anchor {
  if (fraction < EDGE_FRACTION) return 'start';
  if (fraction > 1 - EDGE_FRACTION) return 'end';
  if (away === 'left') return 'end';
  if (away === 'right') return 'start';
  return 'middle';
}

/**
 * Lado de `point` em relação a `other`, só quando os dois ficam perto o bastante para os rótulos
 * colidirem; cada ponto empurra o próprio rótulo para o lado em que já está, afastando-o do outro.
 */
const MIN_LABEL_GAP = 0.18;
function sideRelativeTo(point: number, other: number): 'left' | 'right' | null {
  if (Math.abs(point - other) >= MIN_LABEL_GAP) return null;
  return point > other ? 'right' : 'left';
}

function pct(fraction: number): string {
  return `${String(fraction * 100)}%`;
}

/** Fração de um valor num domínio que pode conter negativos, presa entre 0 e 1. */
function toFraction(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/** Múltiplo do investido, com sinal tipográfico: −0,3x, 1,4x. */
function formatMultiple(value: number): string {
  const sign = value < 0 ? '−' : '';
  return `${sign}${formatDecimal(Math.abs(value), 1)}x`;
}

/** Mediana de uma amostra sem ordem garantida; `null` para amostra vazia. */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor((sorted.length - 1) / 2);
  const lower = sorted[mid];
  if (sorted.length % 2 === 1) return lower ?? null;
  const upper = sorted[mid + 1];
  return lower === undefined || upper === undefined ? null : (lower + upper) / 2;
}

function CardHeader({ label, provenance }: { readonly label: string; readonly provenance: Provenance }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <p className="min-w-0 text-xs leading-5 font-medium text-text-secondary">{label}</p>
      <span
        className={cn(
          'inline-flex h-5 shrink-0 items-center rounded-full border px-2 font-display text-[0.6875rem] leading-none font-medium tracking-wider',
          PROVENANCE_CLASS[provenance],
        )}
      >
        {provenance}
      </span>
    </div>
  );
}

/** Faixa assimétrica que pode cruzar zero: o domínio contém o zero, nunca é a própria faixa. */
function ReturnRangeCard({ range }: { readonly range: ReturnRange }) {
  const { low, high, central, domain } = range;
  const hasRange = low !== null && high !== null && low <= high;
  const zeroFraction = toFraction(ZERO_MARK, domain.min, domain.max);
  const lowFraction = low === null ? null : toFraction(low, domain.min, domain.max);
  const highFraction = high === null ? null : toFraction(high, domain.min, domain.max);
  const centralFraction = central === null ? null : toFraction(central, domain.min, domain.max);
  const crossesZero = hasRange && low !== null && high !== null && low < 0 && high > 0;

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-line-subtle bg-surface-raised p-3">
      <CardHeader label={range.label} provenance={range.provenance} />

      {hasRange && low !== null && high !== null ? (
        <>
          <p className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-text-primary">
            <span className="kpi-number text-3xl leading-none font-semibold">{formatMultiple(low)}</span>
            <span className="inline-flex items-baseline gap-x-2">
              <span className="text-sm leading-none text-text-muted">a</span>
              <span className="kpi-number text-3xl leading-none font-semibold">{formatMultiple(high)}</span>
            </span>
          </p>
          <p aria-hidden className="mt-2 text-xs leading-5 text-text-secondary">
            {crossesZero ? 'O cenário admite resultado negativo: a faixa cruza o empate em zero.' : 'A faixa toda fica do mesmo lado do empate em zero.'}
          </p>
        </>
      ) : (
        <p className="mt-2 flex items-center gap-2 text-text-muted">
          <Unplug aria-hidden className="size-5 shrink-0" />
          <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
        </p>
      )}

      <div aria-hidden className="mt-auto pt-3">
        <div className="relative h-4">
          <span
            className={cn(
              'absolute bottom-0 text-[0.6875rem] leading-none whitespace-nowrap text-text-muted',
              ANCHOR_CLASS[anchorFor(zeroFraction, centralFraction === null ? null : sideRelativeTo(zeroFraction, centralFraction))],
            )}
            style={{ left: pct(zeroFraction) }}
          >
            <span className="kpi-number">{formatInt(ZERO_MARK)}</span>, empate
          </span>
          {central === null || centralFraction === null ? null : (
            <span
              className={cn(
                'absolute bottom-0 text-[0.6875rem] leading-none whitespace-nowrap text-text-muted',
                ANCHOR_CLASS[anchorFor(centralFraction, sideRelativeTo(centralFraction, zeroFraction))],
              )}
              style={{ left: pct(centralFraction) }}
            >
              centro <span className="kpi-number">{formatMultiple(central)}</span>
            </span>
          )}
        </div>
        <svg className="block h-5 w-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${String(RULER_WIDTH)} ${String(RULER_HEIGHT)}`}>
          <line stroke={TRACK_STROKE} strokeWidth={1} vectorEffect="non-scaling-stroke" x1={0} x2={RULER_WIDTH} y1={RULER_MID} y2={RULER_MID} />
          {[0, RULER_WIDTH].map((x) => (
            <line key={`end-${String(x)}`} stroke={TRACK_STROKE} strokeWidth={1} vectorEffect="non-scaling-stroke" x1={x} x2={x} y1={RULER_MID - END_TICK} y2={RULER_MID + END_TICK} />
          ))}
          <line
            stroke={TRACK_STROKE}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            x1={zeroFraction * RULER_WIDTH}
            x2={zeroFraction * RULER_WIDTH}
            y1={RULER_MID - ZERO_TICK}
            y2={RULER_MID + ZERO_TICK}
          />
          {lowFraction === null || highFraction === null ? null : (
            <rect
              fill={BAND_FILL}
              height={BAND_HEIGHT}
              width={Math.max((highFraction - lowFraction) * RULER_WIDTH, 1)}
              x={lowFraction * RULER_WIDTH}
              y={RULER_MID - BAND_HEIGHT / 2}
            />
          )}
          {centralFraction === null ? null : (
            <line
              stroke={NOTCH_STROKE}
              strokeWidth={NOTCH_WIDTH}
              vectorEffect="non-scaling-stroke"
              x1={centralFraction * RULER_WIDTH}
              x2={centralFraction * RULER_WIDTH}
              y1={RULER_MID - BAND_HEIGHT / 2}
              y2={RULER_MID + BAND_HEIGHT / 2}
            />
          )}
        </svg>
        <div className="mt-1.5 flex justify-between gap-3 text-[0.6875rem] leading-none text-text-muted">
          <span className="kpi-number">{formatMultiple(domain.min)}</span>
          <span className="kpi-number">{formatMultiple(domain.max)}</span>
        </div>
      </div>

      {range.premise ? (
        <p className="mt-2 text-xs leading-5 text-text-muted">
          <span className="font-medium text-text-secondary">Premissa:</span> {range.premise}
        </p>
      ) : null}
    </div>
  );
}

/** Amostra pequena: o p90 sai do cartão e as oportunidades abertas ficam declaradas fora da conta. */
function CycleSampleCard({ cycle }: { readonly cycle: CycleSample }) {
  const sampleSize = cycle.durationsDays.length;
  const value = median(cycle.durationsDays);
  const fraction = value === null ? null : toFraction(value, 0, cycle.ceilingDays);
  const suppressP90 = sampleSize < MIN_SAMPLE_FOR_P90;
  const markerBox = MARKER_SIZE + MARKER_RING_WIDTH * 2;

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-line-subtle bg-surface-raised p-3">
      <CardHeader label={cycle.label} provenance={cycle.provenance} />

      <p className="mt-0.5 text-[0.6875rem] leading-none text-text-muted">
        n = <span className="kpi-number">{formatInt(sampleSize)}</span> casos encerrados
      </p>

      {value === null ? (
        <p className="mt-2 flex items-center gap-2 text-text-muted">
          <Unplug aria-hidden className="size-5 shrink-0" />
          <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
        </p>
      ) : (
        <p className="mt-2 flex items-baseline gap-x-1.5 text-text-primary">
          <span className="kpi-number text-3xl leading-none font-semibold">{formatDays(Math.round(value))}</span>
          <span className="text-[0.6875rem] leading-none text-text-muted">mediana</span>
        </p>
      )}

      <p className="mt-1 flex items-center gap-1.5 text-xs leading-5 text-text-secondary">
        <TriangleAlert aria-hidden className="size-3.5 shrink-0 text-warning" />
        {suppressP90 ? `Amostra pequena (n = ${String(sampleSize)}): p90 não publicado.` : 'Amostra suficiente para publicar o p90.'}
      </p>

      <div aria-hidden className="mt-auto pt-3">
        <div className="relative h-5">
          <svg className="block h-5 w-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${String(RULER_WIDTH)} ${String(RULER_HEIGHT)}`}>
            <line stroke={TRACK_STROKE} strokeWidth={1} vectorEffect="non-scaling-stroke" x1={0} x2={RULER_WIDTH} y1={RULER_MID} y2={RULER_MID} />
            {[0, RULER_WIDTH].map((x) => (
              <line key={`end-${String(x)}`} stroke={TRACK_STROKE} strokeWidth={1} vectorEffect="non-scaling-stroke" x1={x} x2={x} y1={RULER_MID - END_TICK} y2={RULER_MID + END_TICK} />
            ))}
          </svg>
          {fraction === null ? null : (
            <svg
              className="absolute overflow-visible"
              height={markerBox}
              style={{ left: `calc(${pct(fraction)} - ${String(markerBox / 2)}px)`, top: RULER_MID - markerBox / 2 }}
              viewBox={`0 0 ${String(markerBox)} ${String(markerBox)}`}
              width={markerBox}
            >
              <circle cx={markerBox / 2} cy={markerBox / 2} fill={MARK_FILL} r={MARKER_SIZE / 2} stroke={MARKER_RING} strokeWidth={MARKER_RING_WIDTH} />
            </svg>
          )}
        </div>
        <div className="mt-1.5 flex justify-between gap-3 text-[0.6875rem] leading-none text-text-muted">
          <span className="kpi-number">{formatDays(0)}</span>
          <span className="kpi-number">{formatDays(cycle.ceilingDays)}</span>
        </div>
      </div>

      <p className="mt-2 text-xs leading-5 text-text-muted">
        <span className="kpi-number font-medium text-text-secondary">{formatInt(cycle.openCount)}</span> oportunidades seguem abertas: fora da conta, sem desfecho.
      </p>
    </div>
  );
}

export default function LimitCasesCard({ data = defaultData, className }: LimitCasesCardProps) {
  const { returnRange, cycle } = data;
  const sampleSize = cycle.durationsDays.length;
  const medianValue = median(cycle.durationsDays);
  const hasRange = returnRange.low !== null && returnRange.high !== null && returnRange.low <= returnRange.high;

  const summary = [
    hasRange && returnRange.low !== null && returnRange.high !== null
      ? `Dois casos limite de KPI em faixa: ${returnRange.label} entre ${formatMultiple(returnRange.low)} e ${formatMultiple(returnRange.high)}${
          returnRange.central === null ? '' : `, centro ${formatMultiple(returnRange.central)}`
        }${returnRange.low < 0 && returnRange.high > 0 ? ', cruzando zero' : ''}`
      : `Dois casos limite de KPI em faixa: ${returnRange.label}, ${formatUnavailable()}`,
    medianValue === null
      ? `e ${cycle.label}, ${formatUnavailable()}.`
      : `e ${cycle.label}, com mediana de ${formatDays(Math.round(medianValue))} em só ${String(sampleSize)} casos${
          sampleSize < MIN_SAMPLE_FOR_P90 ? ', p90 não calculado por amostra pequena' : ''
        }.`,
  ].join(', ');

  return (
    <section aria-label={summary} className={cn('grid h-full w-full min-w-0 grid-cols-2 gap-4', className)} role="group">
      <ReturnRangeCard range={returnRange} />
      <CycleSampleCard cycle={cycle} />
    </section>
  );
}
