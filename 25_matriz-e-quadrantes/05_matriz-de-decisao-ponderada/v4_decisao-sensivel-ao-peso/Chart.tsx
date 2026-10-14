import { ArrowLeftRight, Check, Filter, TriangleAlert } from 'lucide-react';

import { formatDecimal, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Criterion, type DecisionMatrix, type Scenario } from './data';

/**
 * Matriz de decisão ponderada com prova de sensibilidade: cada peso varia para menos e para mais,
 * a soma é refeita e a tabela diz quem vence em cada variação. Quando o vencedor muda, o selo
 * de decisão sensível ao peso toma o lugar da coroa. Nota ausente nunca vale zero.
 */
export interface SensitiveDecisionMatrixProps {
  readonly data?: DecisionMatrix;
  readonly height?: number;
  readonly className?: string;
}

/** Largura da coluna do nome do cenário, com espaço para o selo em duas linhas. */
const NAME_COLUMN_WIDTH = 172;
/** Largura da coluna de total. */
const TOTAL_COLUMN_WIDTH = 92;
/** Diferença abaixo da qual dois totais são empate. */
const TIE_EPSILON = 1e-9;

interface Flip {
  readonly criterionIndex: number;
  readonly direction: 1 | -1;
  /** Índice do cenário que vence na variação; `null` quando a variação empata o topo. */
  readonly winnerIndex: number | null;
}

/**
 * Total normalizado pelos pesos das notas presentes; `null` sem nenhuma nota ou sem peso.
 * Nota ausente sai da soma e da base: nunca entra como zero.
 */
function weightedTotal(scores: readonly (number | null)[], weights: readonly number[]): number | null {
  let sum = 0;
  let base = 0;
  scores.forEach((score, index) => {
    const weight = weights[index] ?? 0;
    if (score === null) return;
    sum += score * weight;
    base += weight;
  });
  return base > 0 ? sum / base : null;
}

/** Índice do vencedor; `null` sem totais ou com empate no topo. */
function winnerIndex(scenarios: readonly Scenario[], weights: readonly number[]): number | null {
  const totals = scenarios.map((scenario) => weightedTotal(scenario.scores, weights));
  let best: number | null = null;
  let bestIndex: number | null = null;
  let tied = false;
  totals.forEach((total, index) => {
    if (total === null) return;
    if (best === null || total > best + TIE_EPSILON) {
      best = total;
      bestIndex = index;
      tied = false;
    } else if (Math.abs(total - best) <= TIE_EPSILON) {
      tied = true;
    }
  });
  return tied ? null : bestIndex;
}

/** Varia um peso por vez em `shift` para menos e para mais e guarda as variações que trocam o vencedor. */
function sensitivity(scenarios: readonly Scenario[], criteria: readonly Criterion[], shift: number): readonly Flip[] {
  const base = criteria.map((criterion) => criterion.weight);
  const baseWinner = winnerIndex(scenarios, base);
  const flips: Flip[] = [];
  criteria.forEach((_, criterionIndex) => {
    for (const direction of [-1, 1] as const) {
      const weights = base.map((weight, index) => (index === criterionIndex ? weight * (1 + direction * shift) : weight));
      const winner = winnerIndex(scenarios, weights);
      if (winner !== baseWinner) flips.push({ criterionIndex, direction, winnerIndex: winner });
    }
  });
  return flips;
}

function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

function lower(text: string): string {
  return text.toLowerCase();
}

export default function SensitiveDecisionMatrix({ data = defaultData, height, className }: SensitiveDecisionMatrixProps) {
  const style = height === undefined ? undefined : { height };
  const { criteria, scenarios, scaleMax, weightShift } = data;

  if (scenarios.length === 0 || criteria.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0 text-text-muted" />
        <p className="text-xs text-text-muted">Sem cenários ou critérios neste recorte: não há decisão para testar.</p>
      </div>
    );
  }

  const weights = criteria.map((criterion) => criterion.weight);
  const base = weights.reduce((acc, weight) => acc + weight, 0);
  const rows = scenarios
    .map((scenario, index) => ({
      scenario,
      index,
      total: weightedTotal(scenario.scores, weights),
      missing: scenario.scores.flatMap((score, scoreIndex) => (score === null ? [scoreIndex] : [])),
    }))
    .sort((a, b) => (b.total ?? -1) - (a.total ?? -1));
  const winnerIdx = winnerIndex(scenarios, weights);
  const winner = winnerIdx === null ? undefined : scenarios[winnerIdx];
  const winnerTotal = rows.find((row) => row.index === winnerIdx)?.total ?? null;
  const flips = sensitivity(scenarios, criteria, weightShift);
  const sensitiveNames = [...new Set(flips.map((flip) => criteria[flip.criterionIndex]?.short ?? ''))];
  const firstFlip = flips[0];
  const flipCriterion = firstFlip === undefined ? undefined : criteria[firstFlip.criterionIndex];
  const flipWinner = firstFlip?.winnerIndex == null ? undefined : scenarios[firstFlip.winnerIndex];
  const incomplete = rows.find((row) => row.missing.length > 0);
  const shiftText = formatPercent(weightShift, 0);

  const summary =
    `Matriz de decisão com ${String(scenarios.length)} cenários e ${String(criteria.length)} critérios ponderados. ` +
    (winner === undefined
      ? 'Há empate no topo. '
      : `${winner.name} lidera com ${formatDecimal(winnerTotal ?? 0, 2)}. `) +
    (flips.length > 0
      ? `A decisão é sensível ao peso de ${joinNames(sensitiveNames)}` +
        (flipWinner !== undefined && flipCriterion !== undefined && firstFlip !== undefined
          ? `: com ${lower(flipCriterion.name)} ${formatPercent(weightShift, 0)} ${firstFlip.direction > 0 ? 'maior' : 'menor'}, ${flipWinner.name} vence. `
          : '. ')
      : `O vencedor se mantém com qualquer peso variando ${formatPercent(weightShift, 0)}. `) +
    (incomplete !== undefined ? `${incomplete.scenario.name} tem total incompleto.` : '');

  const gridTemplateColumns = `${String(NAME_COLUMN_WIDTH)}px repeat(${String(criteria.length)}, minmax(0, 1fr)) ${String(TOTAL_COLUMN_WIDTH)}px`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="table" style={style}>
      <div className="grid gap-x-1 gap-y-1" role="rowgroup" style={{ gridTemplateColumns }}>
        <div role="row" style={{ display: 'contents' }}>
          <span className="self-end pb-0.5 text-[0.6875rem] font-medium text-text-muted" role="columnheader">
            Cenário
          </span>
          {criteria.map((criterion, index) => (
            <span className="flex flex-col gap-0.5 px-1" key={criterion.id} role="columnheader">
              <span className="text-[0.6875rem] font-medium leading-[0.9375rem] text-text-secondary">{criterion.name}</span>
              <span className="kpi-number inline-flex items-center gap-1 text-[0.6875rem] text-text-muted">
                peso {formatPercent((weights[index] ?? 0) / base, 0)}
              </span>
            </span>
          ))}
          <span className="self-end pb-0.5 text-right text-[0.6875rem] font-medium text-text-secondary" role="columnheader">
            Total de {formatInt(1)} a {formatInt(scaleMax)}
          </span>
        </div>

        <div className="rounded bg-surface-sunken" role="row" style={{ display: 'contents' }}>
          <span className="flex items-center rounded-l bg-surface-sunken py-1 pl-1 pr-2 text-[0.6875rem] leading-tight text-text-secondary" role="rowheader">
            Variando cada peso {shiftText}, vence
          </span>
          {criteria.map((criterion, index) => (
            <span className="flex flex-col justify-center gap-0.5 bg-surface-sunken px-1 py-1 text-[0.6875rem] leading-tight" key={criterion.id} role="cell">
              {([-1, 1] as const).map((direction) => {
                const flip = flips.find((item) => item.criterionIndex === index && item.direction === direction);
                const flipName = flip === undefined ? undefined : flip.winnerIndex === null ? 'empate' : scenarios[flip.winnerIndex]?.name;
                const sign = direction > 0 ? '+' : '−';
                return flip === undefined || flipName === undefined ? (
                  <span className="text-text-muted" key={direction}>
                    {sign}
                    {shiftText}: mantém
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-warning" key={direction}>
                    <ArrowLeftRight aria-hidden className="size-3 shrink-0" strokeWidth={2.25} />
                    {sign}
                    {shiftText}: {flipName}
                  </span>
                );
              })}
            </span>
          ))}
          <span className="rounded-r bg-surface-sunken" role="cell" />
        </div>

        {rows.map(({ scenario, index: scenarioIndex, total, missing }, rowIndex) => {
          const isWinner = scenarioIndex === winnerIdx;
          return (
            <div className="border-t border-line-subtle" key={scenario.id} role="row" style={{ display: 'contents' }}>
              <span className="flex flex-col justify-center py-0.5 pr-2 text-[0.6875rem] leading-tight" role="rowheader">
                <span className={cn('text-text-secondary', isWinner && 'font-bold text-text-primary')}>{scenario.name}</span>
                {isWinner ? (
                  flips.length > 0 ? (
                    <span className="inline-flex items-start gap-1 font-semibold text-warning">
                      <TriangleAlert aria-hidden className="mt-px size-3 shrink-0" strokeWidth={2.25} />
                      Decisão sensível ao peso de {joinNames(sensitiveNames)}
                    </span>
                  ) : (
                    <span className="inline-flex items-start gap-1 text-text-muted">
                      <Check aria-hidden className="mt-px size-3 shrink-0 text-positive" strokeWidth={2.5} />
                      Vence com qualquer peso variando {shiftText}
                    </span>
                  )
                ) : null}
              </span>
              {criteria.map((criterion, index) => {
                const score = scenario.scores[index] ?? null;
                return (
                  <span className="flex items-center justify-center py-0.5" key={criterion.id} role="cell">
                    {score === null ? (
                      <span className="rounded border border-dashed border-text-muted px-1.5 py-0.5 text-[0.6875rem] text-text-muted">sem nota</span>
                    ) : (
                      <span className="font-display text-sm font-medium tabular-nums text-text-primary">{formatInt(score)}</span>
                    )}
                  </span>
                );
              })}
              <span className="flex flex-col items-end justify-center rounded bg-surface-sunken py-0.5 pr-2 leading-tight" role="cell">
                {total === null ? (
                  <span className="text-[0.6875rem] text-text-muted">sem total</span>
                ) : (
                  <>
                    <span className={cn('font-display text-sm tabular-nums text-text-primary', isWinner ? 'font-bold' : 'font-semibold')}>
                      {formatDecimal(total, 2)}
                    </span>
                    <span className={cn('text-[0.6875rem]', missing.length > 0 ? 'font-semibold text-warning' : 'text-text-muted')}>
                      {missing.length > 0 ? 'incompleto' : `${formatInt(rowIndex + 1)}º de ${formatInt(rows.length)}`}
                    </span>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-snug text-text-muted">
        {incomplete !== undefined ? (
          <p>
            {incomplete.scenario.name}: total incompleto, só{' '}
            {formatPercent(
              incomplete.scenario.scores.reduce<number>((acc, score, index) => (score === null ? acc : acc + (weights[index] ?? 0)), 0) / base,
              0,
            )}{' '}
            dos pesos.
          </p>
        ) : null}
      </div>
    </div>
  );
}
