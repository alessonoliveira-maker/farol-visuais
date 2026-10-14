import { Filter } from 'lucide-react';

import { formatDecimal, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Criterion, type DecisionMatrix } from './data';

/**
 * Matriz de decisão ponderada com o total decomposto: a coluna de total é uma barra empilhada
 * em que cada segmento é a contribuição de um critério, na mesma cor do cabeçalho da coluna.
 * Mostra de onde vem a vantagem do vencedor sobre os demais desenhos.
 */
export interface DecomposedDecisionMatrixProps {
  readonly data?: DecisionMatrix;
  readonly height?: number;
  readonly className?: string;
}

/** Largura da coluna do nome do desenho, generosa para nome composto (TIP-7). */
const NAME_COLUMN_WIDTH = 190;
/** Largura da coluna de cada critério. */
const CRITERION_COLUMN_WIDTH = 76;
/** Largura reservada ao total escrito, ao lado da barra. */
const TOTAL_TEXT_WIDTH = 40;
/** Largura reservada à diferença escrita, ao lado do total. */
const GAP_TEXT_WIDTH = 92;

/** Classe estática por slot: o Tailwind só gera classe que aparece inteira no código. */
const SLOT_CLASS: Record<Criterion['slot'], string> = {
  1: 'bg-chart-1',
  2: 'bg-chart-2',
  3: 'bg-chart-3',
  5: 'bg-chart-5',
  6: 'bg-chart-6',
};

function sumWeights(criteria: readonly Criterion[]): number {
  return criteria.reduce((acc, criterion) => acc + criterion.weight, 0);
}

/** Contribuição de cada critério ao total; `null` na posição de nota ausente (nunca zero). */
function contributions(scores: readonly (number | null)[], criteria: readonly Criterion[]): readonly (number | null)[] {
  const base = sumWeights(criteria);
  return criteria.map((criterion, index) => {
    const score = scores[index] ?? null;
    return score === null || base <= 0 ? null : (score * criterion.weight) / base;
  });
}

/** Total normalizado; `null` com nota ausente, soma de pesos zero ou lista vazia. */
function sumParts(parts: readonly (number | null)[]): number | null {
  if (parts.length === 0) return null;
  let total = 0;
  for (const part of parts) {
    if (part === null) return null;
    total += part;
  }
  return total;
}

function signed(value: number): string {
  return `${value < 0 ? '−' : '+'}${formatDecimal(Math.abs(value), 2)}`;
}

function lower(text: string): string {
  return text.toLowerCase();
}

export default function DecomposedDecisionMatrix({ data = defaultData, height, className }: DecomposedDecisionMatrixProps) {
  const style = height === undefined ? undefined : { height };
  const { criteria, options, scaleMax } = data;

  if (options.length === 0 || criteria.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0 text-text-muted" />
        <p className="text-xs text-text-muted">Sem desenhos ou critérios neste recorte: não há total para decompor.</p>
      </div>
    );
  }

  const base = sumWeights(criteria);
  const rows = options
    .map((option) => {
      const parts = contributions(option.scores, criteria);
      return { option, parts, total: sumParts(parts) };
    })
    .sort((a, b) => (b.total ?? -1) - (a.total ?? -1));
  const first = rows[0];
  const second = rows[1];
  const topTotal = first?.total ?? null;
  const secondTotal = second?.total ?? null;
  const lead = topTotal !== null && secondTotal !== null ? topTotal - secondTotal : null;

  // Critério em que o 1º mais abre vantagem sobre o 2º, calculado do dado.
  let bestIndex = -1;
  let bestGap = 0;
  if (first !== undefined && second !== undefined) {
    criteria.forEach((_, index) => {
      const a = first.parts[index] ?? null;
      const b = second.parts[index] ?? null;
      if (a !== null && b !== null && a - b > bestGap) {
        bestGap = a - b;
        bestIndex = index;
      }
    });
  }
  const bestCriterion = bestIndex >= 0 ? criteria[bestIndex] : undefined;

  const summary =
    `Matriz de decisão com ${String(options.length)} desenhos e ${String(criteria.length)} critérios, total em barra empilhada por critério. ` +
    (first !== undefined && topTotal !== null
      ? `${first.option.name} lidera com ${formatDecimal(topTotal, 2)}` +
        (lead !== null && second !== undefined ? `, ${formatDecimal(lead, 2)} acima de ${second.option.name}` : '') +
        (bestCriterion !== undefined ? `, com a maior vantagem em ${lower(bestCriterion.name)}.` : '.')
      : 'Nenhum desenho tem total completo.');

  const gridTemplateColumns = `${String(NAME_COLUMN_WIDTH)}px repeat(${String(criteria.length)}, ${String(CRITERION_COLUMN_WIDTH)}px) minmax(0, 1fr)`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="table" style={style}>
      <div className="grid gap-x-1 gap-y-1" role="rowgroup" style={{ gridTemplateColumns }}>
        <div role="row" style={{ display: 'contents' }}>
          <span className="self-end pb-0.5 text-[0.6875rem] font-medium text-text-muted" role="columnheader">
            Desenho
          </span>
          {criteria.map((criterion) => (
            <span className="flex flex-col gap-0.5 px-1" key={criterion.id} role="columnheader">
              <span aria-hidden className={cn('h-1 rounded-sm', SLOT_CLASS[criterion.slot])} />
              <span className="min-h-[1.875rem] text-[0.6875rem] font-medium leading-[0.9375rem] text-text-secondary">{criterion.name}</span>
              <span className="kpi-number text-[0.6875rem] text-text-muted">peso {formatPercent(criterion.weight / base, 0)}</span>
            </span>
          ))}
          <span className="self-end pb-0.5 pl-3 text-[0.6875rem] font-medium text-text-secondary" role="columnheader">
            Total de {formatInt(0)} a {formatInt(scaleMax)}, por critério
          </span>
        </div>

        {rows.map(({ option, parts, total }, rowIndex) => (
          <div className="border-t border-line-subtle" key={option.id} role="row" style={{ display: 'contents' }}>
            <span className="flex items-center py-0.5 pr-2 text-[0.6875rem] leading-tight text-text-secondary" role="rowheader">
              <span className={cn(rowIndex === 0 && total !== null && 'font-bold text-text-primary')}>{option.name}</span>
            </span>
            {criteria.map((criterion, index) => {
              const score = option.scores[index] ?? null;
              const part = parts[index] ?? null;
              return (
                <span className="flex flex-col items-center justify-center py-0.5 leading-tight" key={criterion.id} role="cell">
                  {score === null || part === null ? (
                    <span className="text-[0.6875rem] text-text-muted">sem nota</span>
                  ) : (
                    <>
                      <span className="font-display text-sm font-medium tabular-nums text-text-primary">{formatInt(score)}</span>
                      <span className="font-display text-[0.6875rem] tabular-nums text-text-muted">{formatDecimal(part, 2)}</span>
                    </>
                  )}
                </span>
              );
            })}
            <span className="flex items-center gap-2 py-0.5 pl-3" role="cell">
              <span className="flex h-3 min-w-0 flex-1 rounded-sm bg-surface-sunken" aria-hidden>
                <span className="flex h-3" style={{ width: `${String(total === null ? 0 : (total / scaleMax) * 100)}%` }}>
                  {parts.map((part, index) => {
                    const criterion = criteria[index];
                    if (part === null || criterion === undefined) return null;
                    return (
                      <span
                        className={cn('h-3 border-surface-raised', SLOT_CLASS[criterion.slot], index > 0 && 'border-l-2')}
                        key={criterion.id}
                        style={{ width: `${String(total === null || total === 0 ? 0 : (part / total) * 100)}%` }}
                      />
                    );
                  })}
                </span>
              </span>
              <span
                className={cn(
                  'font-display text-sm tabular-nums text-text-primary',
                  rowIndex === 0 ? 'font-bold' : 'font-semibold',
                )}
                style={{ width: TOTAL_TEXT_WIDTH, textAlign: 'right' }}
              >
                {total === null ? 'incompleto' : formatDecimal(total, 2)}
              </span>
              <span className="text-[0.6875rem] text-text-muted" style={{ width: GAP_TEXT_WIDTH }}>
                {total === null || topTotal === null
                  ? ''
                  : rowIndex === 0
                    ? lead === null
                      ? ''
                      : `${signed(lead)} sobre o 2º`
                    : `${signed(total - topTotal)} do 1º`}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-snug text-text-muted" aria-hidden>
        {bestCriterion !== undefined && lead !== null ? (
          <p className="flex items-center gap-1.5">
            <span className={cn('size-2 shrink-0 rounded-sm', SLOT_CLASS[bestCriterion.slot])} />
            <span>
              1º: {lower(bestCriterion.name)} <span className="tabular-nums">{signed(bestGap)}</span> de{' '}
              <span className="tabular-nums">{signed(lead)}</span> sobre o 2º
            </span>
          </p>
        ) : null}
        <p>Cada segmento mede nota × peso ÷ soma dos pesos; a barra inteira vai de {formatInt(0)} a {formatInt(scaleMax)}.</p>
      </div>
    </div>
  );
}
