import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatCurrencyCompact, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Provenance, type Scenario, type ScenarioRange, type ScenarioShape } from './data';

/**
 * Cartão de KPI com três cenários: a faixa do menor ao maior cenário é o número principal, e uma
 * régua por cenário, na mesma escala de zero ao teto do plano, mostra onde cada um cai. O cenário
 * que virou meta acende em destaque, com forma própria e rótulo em peso 700; a frase calculada
 * diz a distância da meta para os outros cenários.
 */
export interface ScenarioRangeCardProps {
  readonly data?: ScenarioRange;
  readonly className?: string;
}

/** Linha de cenário: altura igual a h-5 e vão igual a space-y-1.5, para SVG e HTML casarem. */
const ROW_HEIGHT = 20;
const ROW_GAP = 6;
/** Largura da régua em unidades livres do viewBox; a altura é a das linhas, em pixels. */
const TRACK_WIDTH = 1000;
const MARKER_SIZE = 12;
const GOAL_MARKER_SIZE = 14;
/** Do centro da marca ao começo do rótulo: meia marca mais o vão de 6 px da 17.7. */
const LABEL_OFFSET = GOAL_MARKER_SIZE / 2 + 6;
/** Caixa do rótulo de valor: o vão mais "R$ 88,8 mi" em peso 700, sem depender de transbordo. */
const LABEL_BOX_WIDTH = 80;
/** A partir de 10% de distância, a casa decimal não muda a decisão (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;
const GOAL_FILL = 'var(--chart-1)';
/** Neutro de dado: só é permitido porque o valor de cada cenário está escrito ao lado da marca. */
const NEUTRAL_FILL = 'var(--line-strong)';
/** Contorno na cor do cartão: separa a marca da faixa e da linha que passa atrás. */
const MARKER_RING = 'var(--surface-raised)';
/** A faixa entre o menor e o maior cenário: poço rebaixado, lido pelo número escrito acima. */
const BAND_FILL = 'var(--surface-sunken)';
const TRACK_STROKE = 'var(--line-subtle)';
/** Halo na cor do cartão: o valor continua legível quando cruza a faixa e a linha (ROT-7). */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

const PROVENANCE_CLASS: Record<Provenance, string> = {
  MEDIDO: 'border-prov-medido/45 text-prov-medido',
  DERIVADO: 'border-prov-derivado/45 text-prov-derivado',
  PREMISSA: 'border-prov-premissa/45 text-prov-premissa',
  LACUNA: 'border-prov-lacuna/45 text-prov-lacuna',
};

interface MeasuredScenario extends Scenario {
  readonly value: number;
}

interface ScenarioRow {
  readonly scenario: Scenario;
  /** Posição de 0 a 1 no domínio de zero ao teto, ou `null` para cenário não calculado. */
  readonly fraction: number | null;
  readonly isGoal: boolean;
  /** Centro da linha em pixels, a partir do topo da área das réguas. */
  readonly centerY: number;
}

interface ScenarioGeometry {
  readonly rows: readonly ScenarioRow[];
  readonly lowest: MeasuredScenario | null;
  readonly highest: MeasuredScenario | null;
  readonly goal: MeasuredScenario | null;
  readonly band: { readonly from: number; readonly to: number } | null;
  readonly height: number;
}

function isMeasured(scenario: Scenario): scenario is MeasuredScenario {
  return scenario.value !== null;
}

function toFraction(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}

/** Geometria pura: cenários do menor ao maior, não calculados por último, e a faixa entre as pontas. */
function scenarioGeometry(range: ScenarioRange): ScenarioGeometry {
  const measured = range.scenarios.filter(isMeasured).sort((a, b) => a.value - b.value);
  const missing = range.scenarios.filter((scenario) => !isMeasured(scenario));
  const ordered: readonly Scenario[] = [...measured, ...missing];
  const lowest = measured.at(0) ?? null;
  const highest = measured.at(-1) ?? null;
  const rows = ordered.map((scenario, index) => ({
    scenario,
    fraction: scenario.value === null ? null : toFraction(scenario.value, range.domain.max),
    isGoal: scenario.id === range.goalId && scenario.value !== null,
    centerY: index * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2,
  }));
  return {
    rows,
    lowest,
    highest,
    goal: measured.find((scenario) => scenario.id === range.goalId) ?? null,
    band: lowest && highest ? { from: toFraction(lowest.value, range.domain.max), to: toFraction(highest.value, range.domain.max) } : null,
    height: Math.max(ordered.length * ROW_HEIGHT + (ordered.length - 1) * ROW_GAP, ROW_HEIGHT),
  };
}

function distance(from: number, to: number): string {
  const fraction = Math.abs(from - to) / to;
  return formatPercent(fraction, fraction >= WHOLE_PERCENT_FROM ? 0 : 1);
}

interface GoalDistance {
  readonly percent: string;
  readonly direction: 'acima' | 'abaixo';
  readonly label: string;
}

interface GoalReading {
  readonly goal: MeasuredScenario;
  readonly distances: readonly GoalDistance[];
}

/** A pergunta da reunião: em qual cenário a meta ficou e a que distância das duas pontas. */
function goalReading(geometry: ScenarioGeometry): GoalReading | null {
  const { goal, lowest, highest } = geometry;
  if (!goal || !lowest || !highest) return null;
  const distances: GoalDistance[] = [];
  if (goal.id !== lowest.id) distances.push({ percent: distance(goal.value, lowest.value), direction: 'acima', label: lowest.label });
  if (goal.id !== highest.id) distances.push({ percent: distance(goal.value, highest.value), direction: 'abaixo', label: highest.label });
  return { goal, distances };
}

function readingSentence(reading: GoalReading | null): string {
  if (!reading) return 'Nenhum cenário calculado virou meta ainda.';
  const head = `Meta no cenário ${reading.goal.label}, ${formatCurrencyCompact(reading.goal.value)}`;
  const parts = reading.distances.map((item) => `${item.percent} ${item.direction} do ${item.label}`);
  return parts.length === 0 ? `${head}, o único calculado.` : `${head}: ${parts.join(' e ')}.`;
}

function percent(fraction: number): string {
  return `${String(fraction * 100)}%`;
}

/** Forma da marca em caixa de 12 unidades; o contorno na cor do cartão faz a separação. */
function shapeOf(shape: ScenarioShape, fill: string): ReactElement {
  const common = { fill, stroke: MARKER_RING, strokeWidth: 1.5 } as const;
  if (shape === 'square') return <rect height={9} width={9} x={1.5} y={1.5} {...common} />;
  if (shape === 'diamond') return <polygon points="6,0.5 11.5,6 6,11.5 0.5,6" {...common} />;
  return <circle cx={6} cy={6} r={4.75} {...common} />;
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

export default function ScenarioRangeCard({ data = defaultData, className }: ScenarioRangeCardProps) {
  const geometry = scenarioGeometry(data);
  const { lowest, highest, band } = geometry;
  const reading = goalReading(geometry);
  const premise = data.premise.trim();
  const rootClass = cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className);

  if (!lowest || !highest || !band) {
    return (
      <article aria-label={`Cartão de KPI em faixa: ${data.label}, sem nenhum cenário calculado.`} className={rootClass} role="group">
        <CardHeader label={data.label} provenance={data.provenance} />
        <div className="flex min-h-0 flex-1 items-center gap-2 text-xs text-text-muted" role="status">
          <Filter aria-hidden className="size-4 shrink-0" />
          <span>Nenhum cenário calculado neste recorte: não há faixa nem meta para mostrar.</span>
        </div>
      </article>
    );
  }

  const summary = [
    `Cartão de KPI em faixa: ${data.label}, de ${formatCurrencyCompact(lowest.value)} no ${lowest.label} a ${formatCurrencyCompact(highest.value)} no ${highest.label}.`,
    readingSentence(reading),
  ].join(' ');

  return (
    <article aria-label={summary} className={rootClass} role="group">
      <CardHeader label={data.label} provenance={data.provenance} />

      <p className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-text-primary">
        <span className="kpi-number text-3xl leading-none font-semibold">{formatCurrencyCompact(lowest.value)}</span>
        <span className="inline-flex items-baseline gap-x-2">
          <span className="text-sm leading-none text-text-muted">a</span>
          <span className="kpi-number text-3xl leading-none font-semibold">{formatCurrencyCompact(highest.value)}</span>
        </span>
      </p>

      <p aria-hidden className="mt-2 text-xs leading-5 text-text-secondary">
        {reading ? (
          <>
            Meta no cenário <span className="font-semibold text-text-primary">{reading.goal.label}</span>
            {reading.distances.length === 0 ? ', o único calculado.' : ': '}
            {reading.distances.map((item, index) => (
              <span key={item.label}>
                {index > 0 ? ' e ' : null}
                <span className="kpi-number font-medium text-text-primary">{item.percent}</span> {item.direction} do {item.label}
              </span>
            ))}
            {reading.distances.length === 0 ? null : '.'}
          </>
        ) : (
          'Nenhum cenário calculado virou meta ainda.'
        )}
      </p>

      <div aria-hidden className="mt-auto flex min-w-0 items-start gap-3 pt-4">
        <ul className="shrink-0 space-y-1.5">
          {geometry.rows.map((row) => (
            <li className="flex h-5 items-center gap-1.5 text-xs leading-none" key={row.scenario.id}>
              <span className={row.isGoal ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}>{row.scenario.label}</span>
              {row.isGoal ? <span className="text-[0.6875rem] text-text-muted">meta</span> : null}
            </li>
          ))}
        </ul>

        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height: geometry.height }}>
            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              preserveAspectRatio="none"
              viewBox={`0 0 ${String(TRACK_WIDTH)} ${String(geometry.height)}`}
            >
              <rect
                fill={BAND_FILL}
                height={geometry.height}
                width={Math.max((band.to - band.from) * TRACK_WIDTH, 1)}
                x={band.from * TRACK_WIDTH}
                y={0}
              />
              {geometry.rows.map((row) => (
                <line
                  key={row.scenario.id}
                  stroke={TRACK_STROKE}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  x1={0}
                  x2={TRACK_WIDTH}
                  y1={row.centerY}
                  y2={row.centerY}
                />
              ))}
            </svg>

            {geometry.rows.map((row) => {
              if (row.fraction === null) {
                return (
                  <span
                    className="absolute left-0 flex h-5 items-center text-[0.6875rem] leading-none text-text-muted"
                    key={`missing-${row.scenario.id}`}
                    style={{ top: row.centerY - ROW_HEIGHT / 2 }}
                  >
                    {formatUnavailable()}
                  </span>
                );
              }
              const size = row.isGoal ? GOAL_MARKER_SIZE : MARKER_SIZE;
              return (
                <svg
                  className="absolute overflow-visible"
                  height={size}
                  key={`marker-${row.scenario.id}`}
                  style={{ left: `calc(${percent(row.fraction)} - ${String(size / 2)}px)`, top: row.centerY - size / 2 }}
                  viewBox="0 0 12 12"
                  width={size}
                >
                  {shapeOf(row.scenario.shape, row.isGoal ? GOAL_FILL : NEUTRAL_FILL)}
                </svg>
              );
            })}
            {geometry.rows.map((row) =>
              row.fraction === null || row.scenario.value === null ? null : (
                <svg
                  className="absolute overflow-visible"
                  height={ROW_HEIGHT}
                  key={`label-${row.scenario.id}`}
                  style={{ left: percent(row.fraction), top: row.centerY - ROW_HEIGHT / 2 }}
                  width={LABEL_BOX_WIDTH}
                >
                  <text
                    className="font-display"
                    dominantBaseline="central"
                    fill={row.isGoal ? 'var(--text-primary)' : 'var(--text-secondary)'}
                    fontSize={12}
                    fontWeight={row.isGoal ? 700 : 500}
                    style={HALO}
                    x={LABEL_OFFSET}
                    y={ROW_HEIGHT / 2}
                  >
                    {formatCurrencyCompact(row.scenario.value)}
                  </text>
                </svg>
              ),
            )}
          </div>
          <div className="mt-1.5 flex justify-between gap-3 text-[0.6875rem] leading-none text-text-muted">
            <span className="kpi-number">{formatCurrencyCompact(0)}</span>
            <span>
              {data.domain.label}: <span className="kpi-number">{formatCurrencyCompact(data.domain.max)}</span>
            </span>
          </div>
        </div>
      </div>

      {premise ? (
        <p className="mt-3 text-xs leading-5 text-text-muted">
          <span className="font-medium text-text-secondary">Premissa:</span> {premise}
        </p>
      ) : null}
    </article>
  );
}
