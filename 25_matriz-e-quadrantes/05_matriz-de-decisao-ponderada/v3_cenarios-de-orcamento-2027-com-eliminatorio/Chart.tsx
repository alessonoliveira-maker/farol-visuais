import { Ban, Check, Filter, TriangleAlert } from 'lucide-react';

import { formatCurrencyCompact, formatDecimal, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CellValue, type Criterion, type DecisionMatrix, type Provenance } from './data';

/**
 * Matriz de decisão ponderada com requisito eliminatório: o passa e não passa vem antes de
 * qualquer soma, o cenário que falha sai do ranking riscado com o motivo, a medida real vira
 * nota normalizada, o julgamento fica marcado e cada critério leva a procedência do número.
 */
export interface GatedDecisionMatrixProps {
  readonly data?: DecisionMatrix;
  readonly height?: number;
  readonly className?: string;
}

/** Largura da coluna do nome do cenário. */
const NAME_COLUMN_WIDTH = 140;
/** Largura da coluna do requisito eliminatório. */
const GATE_COLUMN_WIDTH = 96;
/** Largura da coluna de receita, que escreve a faixa inteira. */
const RANGE_COLUMN_WIDTH = 112;
/** Largura da coluna de total. */
const TOTAL_COLUMN_WIDTH = 84;
/** A faixa de receita sai em milhões de reais. */
const MILLION = 1_000_000;

const PROVENANCE_CLASS: Record<Provenance, string> = {
  MEDIDO: 'text-prov-medido',
  PREMISSA: 'text-prov-premissa',
  DERIVADO: 'text-prov-derivado',
};

function sumWeights(criteria: readonly Criterion[]): number {
  return criteria.reduce((acc, criterion) => acc + criterion.weight, 0);
}

/** Ponto médio da faixa; o valor pontual é ele mesmo; ausência continua ausência. */
function midpoint(value: CellValue): number | null {
  if (value === null) return null;
  return typeof value === 'number' ? value : (value.low + value.high) / 2;
}

/**
 * Nota de cada cenário em um critério. Julgamento já é a nota; medida e faixa viram nota de 1
 * ao máximo da escala, interpolada entre o pior e o melhor cenário, na direção do critério.
 */
function criterionNotes(criterion: Criterion, index: number, scenarios: DecisionMatrix['scenarios'], scaleMax: number): readonly (number | null)[] {
  const raw = scenarios.map((scenario) => midpoint(scenario.values[index] ?? null));
  if (criterion.kind === 'judgment') return raw;
  const present = raw.filter((value): value is number => value !== null);
  if (present.length === 0) return raw.map(() => null);
  const lowest = Math.min(...present);
  const span = Math.max(...present) - lowest;
  return raw.map((value) => {
    if (value === null) return null;
    if (span === 0) return (1 + scaleMax) / 2;
    const progress = criterion.better === 'higher' ? value - lowest : lowest + span - value;
    return 1 + ((scaleMax - 1) * progress) / span;
  });
}

/** Total normalizado; `null` com lista vazia, soma de pesos zero ou nota ausente (nunca zero). */
function weightedTotal(notes: readonly (number | null)[], criteria: readonly Criterion[]): number | null {
  const base = sumWeights(criteria);
  if (base <= 0 || criteria.length === 0) return null;
  let total = 0;
  for (const [index, criterion] of criteria.entries()) {
    const note = notes[index] ?? null;
    if (note === null) return null;
    total += note * criterion.weight;
  }
  return total / base;
}

function formatMeasure(value: number, unit: Criterion['unit']): string {
  if (unit === 'currency') return formatCurrencyCompact(value);
  if (unit === 'months') return `${formatInt(value)} meses`;
  return formatPercent(value, 1);
}

function formatCell(value: CellValue, unit: Criterion['unit']): string {
  if (value === null) return '';
  if (typeof value === 'number') return unit === null ? formatInt(value) : formatMeasure(value, unit);
  return `R$ ${formatDecimal(value.low / MILLION, 1)} a ${formatDecimal(value.high / MILLION, 1)} mi`;
}

function lower(text: string): string {
  return text.toLowerCase();
}

export default function GatedDecisionMatrix({ data = defaultData, height, className }: GatedDecisionMatrixProps) {
  const style = height === undefined ? undefined : { height };
  const { criteria, scenarios, gate, scaleMax } = data;

  if (scenarios.length === 0 || criteria.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0 text-text-muted" />
        <p className="text-xs text-text-muted">Sem cenários ou critérios neste recorte: não há o que pontuar.</p>
      </div>
    );
  }

  const base = sumWeights(criteria);
  const notesByCriterion = criteria.map((criterion, index) => criterionNotes(criterion, index, scenarios, scaleMax));
  const rows = scenarios.map((scenario, scenarioIndex) => {
    const notes = criteria.map((_, index) => notesByCriterion[index]?.[scenarioIndex] ?? null);
    const status = scenario.demand === null ? 'unknown' : scenario.demand <= gate.limit ? 'pass' : 'fail';
    return { scenario, notes, total: weightedTotal(notes, criteria), status } as const;
  });
  // O eliminatório vem antes da soma: quem passa é ordenado pelo total, quem falha vai para o fim.
  const ranked = rows.filter((row) => row.status === 'pass').sort((a, b) => (b.total ?? -1) - (a.total ?? -1));
  const excluded = rows.filter((row) => row.status !== 'pass');
  const ordered = [...ranked, ...excluded];
  const winner = ranked[0];
  const bestExcluded = [...excluded].sort((a, b) => (b.total ?? -1) - (a.total ?? -1))[0];
  const hasRange = criteria.some((criterion) => criterion.kind === 'range');

  const summary =
    `Matriz de decisão com ${String(scenarios.length)} cenários de orçamento em ${String(criteria.length)} critérios e um requisito eliminatório. ` +
    (winner?.total != null
      ? `${winner.scenario.name} lidera o ranking com ${formatDecimal(winner.total, 2)}. `
      : 'Nenhum cenário passa no requisito. ') +
    (bestExcluded !== undefined
      ? `${bestExcluded.scenario.name} não passa em ${lower(gate.name)} e fica fora do ranking.`
      : 'Todos passam no requisito eliminatório.');

  const gridTemplateColumns = [
    `${String(NAME_COLUMN_WIDTH)}px`,
    `${String(GATE_COLUMN_WIDTH)}px`,
    ...criteria.map((criterion) => (criterion.kind === 'range' ? `${String(RANGE_COLUMN_WIDTH)}px` : 'minmax(0, 1fr)')),
    `${String(TOTAL_COLUMN_WIDTH)}px`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="table" style={style}>
      <div className="grid gap-x-1 gap-y-1" role="rowgroup" style={{ gridTemplateColumns }}>
        <div role="row" style={{ display: 'contents' }}>
          <span className="self-end pb-0.5 text-[0.6875rem] font-medium text-text-muted" role="columnheader">
            Cenário
          </span>
          <span className="flex flex-col gap-0.5 px-1" role="columnheader">
            <span className="min-h-[1.875rem] text-[0.6875rem] font-medium leading-[0.9375rem] text-text-secondary">{gate.name}</span>
            <span className={cn('text-[0.6875rem] font-semibold', PROVENANCE_CLASS[gate.provenance])}>{gate.provenance}</span>
            <span className="kpi-number text-[0.6875rem] text-text-muted">até {formatInt(gate.limit)}</span>
          </span>
          {criteria.map((criterion) => (
            <span className="flex flex-col gap-0.5 px-1" key={criterion.id} role="columnheader">
              <span className="min-h-[1.875rem] text-[0.6875rem] font-medium leading-[0.9375rem] text-text-secondary">{criterion.name}</span>
              <span className={cn('text-[0.6875rem] font-semibold', PROVENANCE_CLASS[criterion.provenance])}>{criterion.provenance}</span>
              <span className="kpi-number text-[0.6875rem] text-text-muted">peso {formatPercent(criterion.weight / base, 0)}</span>
            </span>
          ))}
          <span className="self-end pb-0.5 text-right text-[0.6875rem] font-medium text-text-secondary" role="columnheader">
            Total
          </span>
        </div>

        {ordered.map(({ scenario, notes, total, status }) => {
          const rankIndex = ranked.findIndex((row) => row.scenario.id === scenario.id);
          const isWinner = rankIndex === 0 && total !== null;
          const out = status !== 'pass';
          return (
            <div className="border-t border-line-subtle" key={scenario.id} role="row" style={{ display: 'contents' }}>
              <span className="flex flex-col justify-center py-0.5 pr-2 text-[0.6875rem] leading-tight" role="rowheader">
                <span className={cn(out ? 'text-text-muted line-through' : 'text-text-secondary', isWinner && 'font-bold text-text-primary')}>
                  {scenario.name}
                </span>
                {out ? <span className="text-negative">eliminado antes da soma</span> : null}
              </span>
              <span className="flex flex-col items-center justify-center py-0.5 leading-tight" role="cell">
                <span className={cn('inline-flex items-center gap-1 text-[0.6875rem] font-semibold', out ? 'text-negative' : 'text-positive')}>
                  {out ? <Ban aria-hidden className="size-3" strokeWidth={2.25} /> : <Check aria-hidden className="size-3" strokeWidth={2.5} />}
                  {status === 'unknown' ? 'sem medida' : out ? 'não passa' : 'passa'}
                </span>
                <span className="kpi-number text-[0.6875rem] text-text-muted">
                  {scenario.demand === null ? '' : `${formatInt(scenario.demand)} leads`}
                </span>
              </span>
              {criteria.map((criterion, index) => {
                const value = scenario.values[index] ?? null;
                const note = notes[index] ?? null;
                return (
                  <span
                    className={cn('flex flex-col items-center justify-center py-0.5 leading-tight', out && 'text-text-muted')}
                    key={criterion.id}
                    role="cell"
                  >
                    {note === null ? (
                      <span className="text-[0.6875rem] text-text-muted">sem nota</span>
                    ) : criterion.kind === 'judgment' ? (
                      <>
                        <span className={cn('font-display text-sm font-medium tabular-nums', out ? 'text-text-muted' : 'text-text-primary')}>
                          {formatInt(note)}
                        </span>
                        <span className="text-[0.6875rem] text-text-muted">julgamento</span>
                      </>
                    ) : (
                      <>
                        <span className={cn('font-display text-[0.6875rem] tabular-nums', out ? 'text-text-muted' : 'text-text-primary')}>
                          {formatCell(value, criterion.unit)}
                        </span>
                        <span className="inline-flex items-center gap-1 font-display text-[0.6875rem] tabular-nums text-text-muted">
                          {criterion.kind === 'range' ? <TriangleAlert aria-hidden className="size-3 text-warning" /> : null}
                          nota {formatDecimal(note, 1)}
                        </span>
                      </>
                    )}
                  </span>
                );
              })}
              <span className="flex flex-col items-end justify-center rounded bg-surface-sunken py-0.5 pr-2 leading-tight" role="cell">
                {total === null ? (
                  <span className="text-[0.6875rem] text-text-muted">incompleto</span>
                ) : (
                  <>
                    <span
                      className={cn(
                        'font-display text-sm tabular-nums',
                        out ? 'font-medium text-text-muted line-through' : 'text-text-primary',
                        !out && (isWinner ? 'font-bold' : 'font-semibold'),
                      )}
                    >
                      {formatDecimal(total, 2)}
                    </span>
                    <span className="text-[0.6875rem] text-text-muted">
                      {out ? 'sem ranking' : `${formatInt(rankIndex + 1)}º de ${formatInt(ranked.length)}`}
                    </span>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-snug text-text-muted">
        {bestExcluded?.scenario.demand != null ? (
          <p className="flex items-center gap-1.5">
            <Ban className="size-3 shrink-0 text-negative" strokeWidth={2.25} />
            <span>
              {bestExcluded.scenario.name}: {formatInt(bestExcluded.scenario.demand)} leads por mês, acima de {formatInt(gate.limit)}
            </span>
          </p>
        ) : null}
        {hasRange ? (
          <p className="flex items-center gap-1.5">
            <TriangleAlert className="size-3 shrink-0 text-warning" />
            <span>Nota da receita sobre o ponto médio da faixa; medida normalizada de {formatInt(1)} a {formatInt(scaleMax)} entre os cenários.</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
