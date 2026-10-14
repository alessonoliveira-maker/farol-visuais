import { Filter, TriangleAlert, Unplug } from 'lucide-react';

import { formatHours, formatInt, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type StageDurations } from './data';

/**
 * Tira de KPIs de distribuição resumida: um cartão por etapa da esteira com a mediana como número,
 * o p90 ao lado e uma régua com a metade central (p25 a p75), o corte da mediana, o ponto do p90 e
 * o SLA tracejado. As réguas dividem a mesma escala, de zero ao maior p99 arredondado, para que a
 * cauda de uma etapa se compare com a das outras e com o SLA de cada uma.
 */
export interface PipelineTimesStripProps {
  readonly data?: readonly StageDurations[];
  readonly className?: string;
}

/** Método declarado dos quantis: tipo 7 de Hyndman e Fan, o padrão do R e do NumPy. */
const QUANTILE_METHOD = 'interpolação linear (tipo 7)';
/** Abaixo disto o p90 é praticamente o maior valor e oscila a cada caso novo: sai do cartão. */
const MIN_SAMPLE_FOR_P90 = 30;
/** O teto da escala comum: o maior p99 entre as etapas, arredondado para cima em meios dias. */
const CEILING_PROBABILITY = 0.99;
const CEILING_STEP_HOURS = 12;
/** A partir de 10 h a casa decimal não muda a decisão. */
const WHOLE_HOURS_FROM = 10;
/** Régua em unidades livres na largura (viewBox não uniforme) e em pixels na altura. */
const RULER_WIDTH = 1000;
const RULER_HEIGHT = 20;
const RULER_MID = RULER_HEIGHT / 2;
const IQR_HEIGHT = 8;
/** Largura mínima da faixa, em fração da régua, para uma metade central estreita não sumir. */
const MIN_IQR_FRACTION = 0.004;
const END_TICK = 4;
const NOTCH_WIDTH = 2;
const WHISKER_WIDTH = 1.5;
const P90_RADIUS = 4;
const RING_WIDTH = 1.5;
/** Rótulo a menos de 12% de uma ponta alinha pela ponta, para não sair do cartão. */
const EDGE_FRACTION = 0.12;
/** Uma série só (a mesma estatística em todas as etapas): uma cor só, a de destaque. */
const MARK_FILL = 'var(--chart-1)';
/** O domínio declarado: linha e pontas em referência forte, como o zero de um eixo. */
const TRACK_STROKE = 'var(--line-strong)';
/** Corte da mediana, contorno do p90 e halo do SLA: a cor do cartão, que separa sem tinta nova. */
const CARD_SURFACE = 'var(--surface-raised)';
const SLA_STROKE = 'var(--text-muted)';
const SLA_DASH = '3 3';

type Anchor = 'start' | 'middle' | 'end';

const ANCHOR_CLASS: Record<Anchor, string> = {
  start: '',
  middle: '-translate-x-1/2',
  end: '-translate-x-full',
};

interface StageSummary {
  readonly count: number;
  readonly p25: number;
  readonly median: number;
  readonly p75: number;
  /** `null` quando a amostra é menor que o mínimo para percentil alto. */
  readonly p90: number | null;
  readonly p99: number;
  /** Casos concluídos dentro do SLA, ou `null` quando a etapa não tem SLA escrito. */
  readonly withinSla: number | null;
}

interface StageRow {
  readonly stage: StageDurations;
  readonly summary: StageSummary | null;
}

/** Quantil de uma lista já ordenada, por interpolação linear entre as posições vizinhas (tipo 7). */
function quantile(sorted: readonly number[], probability: number): number | null {
  if (sorted.length === 0) return null;
  const position = (sorted.length - 1) * probability;
  const lower = sorted[Math.floor(position)];
  const upper = sorted[Math.ceil(position)];
  if (lower === undefined || upper === undefined) return null;
  return lower + (upper - lower) * (position - Math.floor(position));
}

function summarizeStage(stage: StageDurations): StageSummary | null {
  const sorted = stage.durationsHours.filter((value) => Number.isFinite(value) && value >= 0).sort((a, b) => a - b);
  const p25 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const p75 = quantile(sorted, 0.75);
  const p90 = quantile(sorted, 0.9);
  const p99 = quantile(sorted, CEILING_PROBABILITY);
  if (p25 === null || median === null || p75 === null || p90 === null || p99 === null) return null;
  const sla = stage.slaHours;
  return {
    count: sorted.length,
    p25,
    median,
    p75,
    p90: sorted.length >= MIN_SAMPLE_FOR_P90 ? p90 : null,
    p99,
    withinSla: sla === null ? null : sorted.filter((value) => value <= sla).length,
  };
}

/** Teto comum declarado: o maior p99 arredondado para cima; nunca o mínimo e o máximo de cada etapa. */
function commonCeiling(summaries: readonly StageSummary[]): number {
  const highest = Math.max(...summaries.map((summary) => summary.p99), CEILING_STEP_HOURS);
  return Math.ceil(highest / CEILING_STEP_HOURS) * CEILING_STEP_HOURS;
}

function hoursLabel(hours: number): string {
  return formatHours(hours >= WHOLE_HOURS_FROM ? Math.round(hours) : Math.round(hours * 10) / 10);
}

function toFraction(value: number, ceiling: number): number {
  return Math.min(1, Math.max(0, value / ceiling));
}

function anchorFor(fraction: number): Anchor {
  if (fraction < EDGE_FRACTION) return 'start';
  if (fraction > 1 - EDGE_FRACTION) return 'end';
  return 'middle';
}

function pct(fraction: number): string {
  return `${String(Math.round(fraction * 100_000) / 1000)}%`;
}

interface StageGeometry {
  readonly p25Fraction: number;
  readonly p75Fraction: number;
  readonly medianFraction: number;
  readonly p90Fraction: number | null;
  readonly slaFraction: number | null;
}

/** Geometria de uma etapa contra o teto comum; a faixa central nunca fica fina demais para ver. */
function stageGeometry(summary: StageSummary, slaHours: number | null, ceiling: number): StageGeometry {
  const p25Fraction = toFraction(summary.p25, ceiling);
  const p75Fraction = toFraction(summary.p75, ceiling);
  return {
    p25Fraction,
    p75Fraction: Math.max(p75Fraction, p25Fraction + MIN_IQR_FRACTION),
    medianFraction: toFraction(summary.median, ceiling),
    p90Fraction: summary.p90 === null ? null : toFraction(summary.p90, ceiling),
    slaFraction: slaHours === null ? null : toFraction(slaHours, ceiling),
  };
}

/** Track em viewBox não uniforme: só linhas e um retângulo, nada que distorça sendo esticado. */
function StageRuler({ geometry }: { readonly geometry: StageGeometry }) {
  const { p25Fraction, p75Fraction, medianFraction, slaFraction } = geometry;
  return (
    <svg className="block h-5 w-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${String(RULER_WIDTH)} ${String(RULER_HEIGHT)}`}>
      <line stroke={TRACK_STROKE} strokeWidth={1} vectorEffect="non-scaling-stroke" x1={0} x2={RULER_WIDTH} y1={RULER_MID} y2={RULER_MID} />
      {[0, RULER_WIDTH].map((x) => (
        <line key={`end-${String(x)}`} stroke={TRACK_STROKE} strokeWidth={1} vectorEffect="non-scaling-stroke" x1={x} x2={x} y1={RULER_MID - END_TICK} y2={RULER_MID + END_TICK} />
      ))}
      <rect
        fill={TRACK_STROKE}
        height={IQR_HEIGHT}
        width={Math.max((p75Fraction - p25Fraction) * RULER_WIDTH, 1)}
        x={p25Fraction * RULER_WIDTH}
        y={RULER_MID - IQR_HEIGHT / 2}
      />
      {[p25Fraction, p75Fraction].map((fraction) => (
        <line
          key={`whisker-${String(fraction)}`}
          stroke={TRACK_STROKE}
          strokeWidth={WHISKER_WIDTH}
          vectorEffect="non-scaling-stroke"
          x1={fraction * RULER_WIDTH}
          x2={fraction * RULER_WIDTH}
          y1={RULER_MID - IQR_HEIGHT}
          y2={RULER_MID + IQR_HEIGHT}
        />
      ))}
      <line
        stroke={CARD_SURFACE}
        strokeWidth={NOTCH_WIDTH}
        vectorEffect="non-scaling-stroke"
        x1={medianFraction * RULER_WIDTH}
        x2={medianFraction * RULER_WIDTH}
        y1={RULER_MID - IQR_HEIGHT / 2}
        y2={RULER_MID + IQR_HEIGHT / 2}
      />
      {slaFraction === null ? null : (
        <line
          stroke={SLA_STROKE}
          strokeDasharray={SLA_DASH}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          x1={slaFraction * RULER_WIDTH}
          x2={slaFraction * RULER_WIDTH}
          y1={0}
          y2={RULER_HEIGHT}
        />
      )}
    </svg>
  );
}

/** Marcador do p90 num SVG quadrado à parte, fora do viewBox esticado, para o círculo não virar elipse. */
function P90Marker({ fraction }: { readonly fraction: number }) {
  const box = (P90_RADIUS + RING_WIDTH) * 2;
  return (
    <svg
      className="absolute overflow-visible"
      height={box}
      style={{ left: `calc(${pct(fraction)} - ${String(box / 2)}px)`, top: RULER_MID - box / 2 }}
      viewBox={`0 0 ${String(box)} ${String(box)}`}
      width={box}
    >
      <circle cx={box / 2} cy={box / 2} fill={MARK_FILL} r={P90_RADIUS} stroke={CARD_SURFACE} strokeWidth={RING_WIDTH} />
    </svg>
  );
}

interface StageCardProps {
  readonly stage: StageDurations;
  readonly summary: StageSummary | null;
  readonly ceiling: number;
  readonly ceilingLabel: string;
}

/** Um cartão por etapa: mediana como número, p90 como apoio, régua com IQR, SLA e cauda. */
function StageCard({ stage, summary, ceiling, ceilingLabel }: StageCardProps) {
  if (summary === null) {
    return (
      <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-line-subtle bg-surface-raised p-3">
        <p className="min-w-0 text-xs leading-5 font-medium text-text-secondary">{stage.label}</p>
        <p className="mt-2 flex items-center gap-2 text-text-muted">
          <Unplug aria-hidden className="size-5 shrink-0" />
          <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
        </p>
        <p className="mt-2 text-xs leading-5 text-text-muted">Nenhum caso concluído desta etapa neste recorte.</p>
      </div>
    );
  }

  const geometry = stageGeometry(summary, stage.slaHours, ceiling);
  const compliance = stage.slaHours === null || summary.withinSla === null ? null : formatRateWithVolume(summary.withinSla, summary.count);

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-lg border border-line-subtle bg-surface-raised p-3">
      <p className="min-w-0 text-xs leading-5 font-medium text-text-secondary">{stage.label}</p>
      <p className="mt-0.5 text-[0.6875rem] leading-none text-text-muted">
        n = <span className="kpi-number">{formatInt(summary.count)}</span> {stage.sampleNoun}
      </p>

      <p className="mt-2 flex items-baseline gap-x-1.5 text-text-primary">
        <span className="kpi-number text-3xl leading-none font-semibold">{hoursLabel(summary.median)}</span>
        <span className="text-[0.6875rem] leading-none text-text-muted">mediana</span>
      </p>

      <p className="mt-1 flex items-center gap-1.5 text-xs leading-5 text-text-secondary">
        <span>p90</span>
        {summary.p90 === null ? (
          <>
            <TriangleAlert aria-hidden className="size-3.5 shrink-0 text-warning" />
            <span className="text-text-muted">amostra pequena, sem p90</span>
          </>
        ) : (
          <span className="kpi-number font-medium text-text-primary">{hoursLabel(summary.p90)}</span>
        )}
      </p>

      <p className="mt-1 text-[0.6875rem] leading-none text-text-muted">
        faixa p25 a p75 <span className="kpi-number">{hoursLabel(summary.p25)}</span> a <span className="kpi-number">{hoursLabel(summary.p75)}</span>
      </p>

      <div className="mt-auto pt-2">
        <div className="relative h-4">
          {stage.slaHours === null || geometry.slaFraction === null ? null : (
            <span
              className={cn(
                'absolute bottom-0 text-[0.6875rem] leading-none whitespace-nowrap text-text-muted',
                ANCHOR_CLASS[anchorFor(geometry.slaFraction)],
              )}
              style={{ left: pct(geometry.slaFraction) }}
            >
              SLA <span className="kpi-number">{hoursLabel(stage.slaHours)}</span>
            </span>
          )}
        </div>
        <div className="relative h-5">
          <StageRuler geometry={geometry} />
          {geometry.p90Fraction === null ? null : <P90Marker fraction={geometry.p90Fraction} />}
        </div>
        <div className="mt-1 flex justify-between gap-2 text-[0.6875rem] leading-none text-text-muted">
          <span className="kpi-number">{hoursLabel(0)}</span>
          <span className="kpi-number">{ceilingLabel}</span>
        </div>
        {compliance === null ? null : (
          <p className="mt-0.5 text-[0.6875rem] leading-none text-text-muted">
            dentro do SLA: <span className="kpi-number">{compliance}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function hasSummary(row: StageRow): row is StageRow & { readonly summary: StageSummary } {
  return row.summary !== null;
}

export default function PipelineTimesStrip({ data = defaultData, className }: PipelineTimesStripProps) {
  const rows = data.map((stage) => ({ stage, summary: summarizeStage(stage) }));
  const rootClass = cn('flex h-full w-full min-w-0 flex-col gap-3', className);

  if (rows.length === 0) {
    return (
      <section
        aria-label="Tira de cartões de KPI com tempos de etapa da esteira: recorte sem nenhuma etapa configurada."
        className={rootClass}
        role="group"
      >
        <div className="flex min-h-0 flex-1 items-center gap-2 text-xs text-text-muted" role="status">
          <Filter aria-hidden className="size-4 shrink-0" />
          <span>Nenhuma etapa neste recorte: não há tempos para comparar.</span>
        </div>
      </section>
    );
  }

  const measuredRows = rows.filter(hasSummary);
  const fallbackSummary: StageSummary = { count: 0, p25: 0, median: 0, p75: 0, p90: null, p99: CEILING_STEP_HOURS, withinSla: null };
  const ceiling = commonCeiling(measuredRows.length > 0 ? measuredRows.map((row) => row.summary) : [fallbackSummary]);
  const ceilingLabel = hoursLabel(ceiling);
  const slowest = measuredRows.reduce<(typeof measuredRows)[number] | null>(
    (acc, row) => (acc === null || row.summary.median > acc.summary.median ? row : acc),
    null,
  );

  const summary =
    slowest === null
      ? `Tira de ${String(rows.length)} cartões de KPI com tempos de etapa da esteira: nenhuma tem observações registradas neste recorte.`
      : `Tira de ${String(rows.length)} cartões com o tempo de cada etapa da esteira em mediana e p90, na mesma escala até ${ceilingLabel}; a mais lenta é ${slowest.stage.label}, com mediana de ${hoursLabel(slowest.summary.median)}.`;

  return (
    <section aria-label={summary} className={rootClass} role="group">
      <div className="grid min-w-0 flex-1 grid-cols-3 gap-4">
        {rows.map((row) => (
          <StageCard ceiling={ceiling} ceilingLabel={ceilingLabel} key={row.stage.id} stage={row.stage} summary={row.summary} />
        ))}
      </div>
      <p className="text-[0.6875rem] leading-none text-text-muted">
        Escala comum de {hoursLabel(0)} a {ceilingLabel} (maior p99 arredondado); quantis por {QUANTILE_METHOD}.
      </p>
    </section>
  );
}
