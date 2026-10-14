import { Filter } from 'lucide-react';

import { formatDecimal, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Criterion, type DecisionMatrix } from './data';

/**
 * Matriz de decisão ponderada: desenhos nas linhas, critérios nas colunas com o peso visível,
 * nota e contribuição em cada célula e o total normalizado pela soma dos pesos à direita.
 * Apoia a escolha entre desenhos quando os pesos já foram acordados.
 */
export interface WeightedDecisionMatrixProps {
  readonly data?: DecisionMatrix;
  readonly height?: number;
  readonly className?: string;
}

/** Largura da coluna do nome do desenho, generosa para nome composto (TIP-7). */
const NAME_COLUMN_WIDTH = 150;
/** Largura da coluna de total, fixa para o algarismo tabular alinhar entre as linhas. */
const TOTAL_COLUMN_WIDTH = 64;

function sumWeights(criteria: readonly Criterion[]): number {
  return criteria.reduce((acc, criterion) => acc + criterion.weight, 0);
}

/** Contribuição de uma nota ao total: nota vezes peso, sobre a soma dos pesos. */
function contribution(score: number, weight: number, base: number): number | null {
  return base > 0 ? (score * weight) / base : null;
}

/** Total normalizado; `null` com lista vazia, soma de pesos zero ou nota ausente (nunca zero). */
function weightedTotal(scores: readonly (number | null)[], criteria: readonly Criterion[]): number | null {
  const base = sumWeights(criteria);
  if (base <= 0 || criteria.length === 0) return null;
  let total = 0;
  for (const [index, criterion] of criteria.entries()) {
    const score = scores[index] ?? null;
    if (score === null) return null;
    total += score * criterion.weight;
  }
  return total / base;
}

function signedGap(gap: number): string {
  return `${gap < 0 ? '−' : '+'}${formatDecimal(Math.abs(gap), 2)}`;
}

export default function WeightedDecisionMatrix({ data = defaultData, height, className }: WeightedDecisionMatrixProps) {
  const style = height === undefined ? undefined : { height };
  const { criteria, options, scaleMax } = data;

  if (options.length === 0 || criteria.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0 text-text-muted" />
        <p className="text-xs text-text-muted">Sem desenhos ou critérios neste recorte: não há o que pontuar.</p>
      </div>
    );
  }

  const base = sumWeights(criteria);
  const maxWeight = criteria.reduce((best, criterion) => Math.max(best, criterion.weight), 0);
  const rows = options
    .map((option) => ({ option, total: weightedTotal(option.scores, criteria) }))
    .sort((a, b) => (b.total ?? -1) - (a.total ?? -1));
  const topTotal = rows[0]?.total ?? null;
  const secondTotal = rows[1]?.total ?? null;

  // Líder por critério: maior nota; empate contorna todos; todos empatados, ninguém lidera.
  const leaders = criteria.map((_, index) => {
    const column = options.map((option) => option.scores[index] ?? null);
    const present = column.filter((score): score is number => score !== null);
    const best = present.length > 0 ? Math.max(...present) : null;
    const tied = best === null ? 0 : present.filter((score) => score === best).length;
    return best !== null && tied < present.length ? best : null;
  });

  const summary =
    `Matriz de decisão com ${String(options.length)} desenhos e ${String(criteria.length)} critérios ponderados, ` +
    `total normalizado de 1 a ${String(scaleMax)}. ` +
    (topTotal !== null && rows[0] !== undefined
      ? `${rows[0].option.name} lidera com ${formatDecimal(topTotal, 2)}` +
        (secondTotal !== null && rows[1] !== undefined
          ? `, ${formatDecimal(topTotal - secondTotal, 2)} acima de ${rows[1].option.name}.`
          : '.')
      : 'Nenhum desenho tem total completo.');

  const gridTemplateColumns = `${String(NAME_COLUMN_WIDTH)}px repeat(${String(criteria.length)}, minmax(0, 1fr)) ${String(TOTAL_COLUMN_WIDTH)}px`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="table" style={style}>
      <div className="grid gap-x-1 gap-y-1" role="rowgroup" style={{ gridTemplateColumns }}>
        <div role="row" style={{ display: 'contents' }}>
          <span className="self-end pb-0.5 text-[0.6875rem] font-medium text-text-muted" role="columnheader">
            Desenho
          </span>
          {criteria.map((criterion) => (
            <span className="flex flex-col gap-0.5 px-1" key={criterion.id} role="columnheader">
              <span className="min-h-[1.875rem] text-[0.6875rem] font-medium leading-[0.9375rem] text-text-secondary">{criterion.name}</span>
              <span aria-hidden className="h-1 rounded-sm bg-surface-sunken">
                <span
                  className="block h-1 rounded-sm bg-text-muted"
                  style={{ width: `${String(maxWeight > 0 ? (criterion.weight / maxWeight) * 100 : 0)}%` }}
                />
              </span>
              <span className="kpi-number text-[0.6875rem] text-text-muted">peso {formatPercent(criterion.weight / base, 0)}</span>
            </span>
          ))}
          <span className="self-end pb-0.5 text-right text-[0.6875rem] font-medium text-text-secondary" role="columnheader">
            Total
          </span>
        </div>

        {rows.map(({ option, total }, rowIndex) => (
          <div className="border-t border-line-subtle" key={option.id} role="row" style={{ display: 'contents' }}>
            <span className="flex items-center py-0.5 pr-2 text-[0.6875rem] leading-tight text-text-secondary" role="rowheader">
              <span className={cn(rowIndex === 0 && total !== null && 'font-bold text-text-primary')}>{option.name}</span>
            </span>
            {criteria.map((criterion, index) => {
              const score = option.scores[index] ?? null;
              const part = score === null ? null : contribution(score, criterion.weight, base);
              const isLeader = score !== null && score === leaders[index];
              return (
                <span
                  className={cn(
                    'flex flex-col items-center justify-center rounded py-0.5 leading-tight',
                    isLeader && 'ring-1 ring-inset ring-text-secondary',
                  )}
                  key={criterion.id}
                  role="cell"
                >
                  {score === null || part === null ? (
                    <span className="text-[0.6875rem] text-text-muted">sem nota</span>
                  ) : (
                    <>
                      <span className={cn('font-display text-sm tabular-nums text-text-primary', isLeader ? 'font-semibold' : 'font-medium')}>
                        {formatInt(score)}
                      </span>
                      <span className="font-display text-[0.6875rem] tabular-nums text-text-muted">{formatDecimal(part, 2)}</span>
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
                  <span className={cn('font-display text-sm tabular-nums text-text-primary', rowIndex === 0 ? 'font-bold' : 'font-semibold')}>
                    {formatDecimal(total, 2)}
                  </span>
                  <span className="text-[0.6875rem] text-text-muted">
                    {formatInt(rowIndex + 1)}º de {formatInt(rows.length)}
                  </span>
                </>
              )}
            </span>
          </div>
        ))}
      </div>

      <p aria-hidden className="shrink-0 text-[0.6875rem] leading-snug text-text-muted">
        Na célula: nota de {formatInt(1)} a {formatInt(scaleMax)} e, abaixo, a contribuição (nota × peso ÷ soma dos pesos). Contorno
        marca o líder do critério
        {topTotal !== null && secondTotal !== null ? `; a diferença do 1º para o 2º é ${signedGap(topTotal - secondTotal)}.` : '.'}
      </p>
    </div>
  );
}
