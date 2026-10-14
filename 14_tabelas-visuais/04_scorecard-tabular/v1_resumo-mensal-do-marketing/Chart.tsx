import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import { formatMonthShort, formatPercent } from '@/lib/format';
import { formatValue } from '@/components/visuals/valueFormat';
import { cn } from '@/lib/utils';
import { currentLabel, data as defaultData, type ScorecardRow } from './data';

/**
 * Uma linha por indicador de Marketing: valor do mês, meta, atingimento (pela direção que a
 * métrica precisa seguir) e variação contra o mês anterior, com seta de tendência e a cor pela
 * polaridade declarada em cada linha, nunca pelo sinal do número.
 */
export interface MarketingScorecardProps {
  readonly data?: readonly ScorecardRow[];
  readonly height?: number;
  readonly className?: string;
}

/** A partir de 10% a variação sai inteira; abaixo disso, uma casa (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;
/** O ponto de corte do atingimento: meta batida na direção certa. */
const FULL_ACHIEVEMENT = 1;

function signedPercent(fraction: number): string {
  const digits = Math.abs(fraction) >= WHOLE_PERCENT_FROM ? 0 : 1;
  return `${fraction > 0 ? '+' : fraction < 0 ? '−' : ''}${formatPercent(Math.abs(fraction), digits)}`;
}

/**
 * Atingimento pela direção da métrica: quem precisa subir divide valor por meta; quem precisa
 * cair divide meta por valor, então ficar abaixo do teto também mede acima de 100%. Sem
 * polaridade (investimento), o número é só o quanto do orçamento foi usado, sem juízo de bom.
 */
function achievement(row: ScorecardRow): number | null {
  if (row.target === null || row.target === 0) return null;
  if (row.goodDirection === 'down') return row.target / row.value;
  return row.value / row.target;
}

function isAchievementGood(row: ScorecardRow, ratio: number | null): boolean | null {
  if (ratio === null || row.goodDirection === 'neutral') return null;
  return ratio >= FULL_ACHIEVEMENT;
}

export default function MarketingScorecard({ data = defaultData, height, className }: MarketingScorecardProps) {
  const style = height === undefined ? undefined : { height };
  const risky = data.filter((row) => {
    const ratio = achievement(row);
    return isAchievementGood(row, ratio) === false;
  });

  const summary =
    `Tabela com ${String(data.length)} indicadores de Marketing de ${formatMonthShort(currentLabel)}, ` +
    `cada um com valor, meta, atingimento e variação contra o mês anterior. ` +
    (risky.length > 0
      ? `${String(risky.length)} indicador${risky.length === 1 ? '' : 'es'} abaixo da meta: ${risky.map((row) => row.metric).join(', ')}.`
      : 'Todos os indicadores dentro ou acima da meta.');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <table className="w-full min-w-0 border-collapse">
        <thead>
          <tr>
            <th className="pb-1.5 text-left text-xs font-medium text-text-secondary" scope="col">
              Indicador
            </th>
            <th className="pb-1.5 pl-3 text-right text-xs font-medium text-text-secondary" scope="col">
              {formatMonthShort(currentLabel)}
            </th>
            <th className="pb-1.5 pl-3 text-right text-xs font-medium text-text-secondary" scope="col">
              Meta
            </th>
            <th className="pb-1.5 pl-3 text-right text-xs font-medium text-text-secondary" scope="col">
              Atingimento
            </th>
            <th className="pb-1.5 pl-3 text-right text-xs font-medium text-text-secondary" scope="col">
              Variação
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const ratio = achievement(row);
            const good = isAchievementGood(row, ratio);
            const delta =
              row.previousValue !== null && row.previousValue !== 0 ? (row.value - row.previousValue) / row.previousValue : null;
            const isUp = delta !== null && delta > 0;
            const DeltaIcon = delta === null || delta === 0 ? Minus : isUp ? TrendingUp : TrendingDown;
            const deltaGood: boolean | null =
              delta === null || row.goodDirection === 'neutral' ? null : row.goodDirection === 'up' ? isUp : !isUp;
            return (
              <tr className="border-t border-line-subtle" key={row.id}>
                <th className="py-1 pr-2 text-left text-xs font-medium text-nowrap text-text-secondary" scope="row">
                  {row.metric}
                </th>
                <td className="kpi-number py-1 pl-3 text-right text-xs font-semibold text-text-primary">
                  {formatValue(row.value, row.unit)}
                </td>
                <td className="kpi-number py-1 pl-3 text-right text-xs text-text-muted">
                  {row.target === null ? '—' : formatValue(row.target, row.unit)}
                </td>
                <td
                  className={cn(
                    'kpi-number py-1 pl-3 text-right text-xs font-semibold',
                    good === null ? 'text-text-secondary' : good ? 'text-positive' : 'text-negative',
                  )}
                >
                  {ratio === null ? '—' : formatPercent(ratio, 0)}
                </td>
                <td className="py-1 pl-3 text-right">
                  {delta === null ? (
                    <span className="text-[11px] text-text-muted">sem mês anterior</span>
                  ) : (
                    <div className="flex flex-col items-end leading-tight">
                      <span
                        className={cn(
                          'kpi-number inline-flex items-center gap-1 text-xs font-semibold',
                          deltaGood === null ? 'text-text-secondary' : deltaGood ? 'text-positive' : 'text-negative',
                        )}
                      >
                        <DeltaIcon aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />
                        {signedPercent(delta)}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        vs {row.previousValue === null ? '—' : formatValue(row.previousValue, row.unit)} em{' '}
                        {formatMonthShort(row.previousLabel)}
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-0.5 shrink-0 text-[11px] leading-snug text-text-muted">
        Atingimento segue a direção: quem sobe divide valor por meta, quem desce (CPL) divide meta
        por valor, e por isso passam de{' '}
        <span className="tabular-nums">{formatPercent(FULL_ACHIEVEMENT, 0)}</span> na direção
        certa. Investimento não tem direção: o número é só o orçamento usado.
      </p>
    </div>
  );
}
