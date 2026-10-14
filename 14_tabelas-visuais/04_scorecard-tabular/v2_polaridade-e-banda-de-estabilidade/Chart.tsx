import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import { formatMonthShort, formatPercent } from '@/lib/format';
import { formatValue } from '@/components/visuals/valueFormat';
import { cn } from '@/lib/utils';
import { currentLabel, data as defaultData, type PolarityRow } from './data';

/**
 * A mesma seta para cima em duas linhas com cor oposta: CPL subindo é vermelho (ruim), taxa de
 * agendamento subindo é verde (bom). Oscilação dentro da banda de 2% vira "estável" em cinza, e
 * o indicador sem polaridade declarada nunca recebe verde nem vermelho.
 */
export interface PolarityScorecardProps {
  readonly data?: readonly PolarityRow[];
  readonly height?: number;
  readonly className?: string;
}

/** Variação com o módulo abaixo disto é ruído de mês, não tendência: nem boa, nem ruim. */
const FLAT_THRESHOLD = 0.02;
/** A partir de 10% a variação sai inteira; abaixo disso, uma casa (NUM-1). */
const WHOLE_PERCENT_FROM = 0.1;

function signedPercent(fraction: number): string {
  const digits = Math.abs(fraction) >= WHOLE_PERCENT_FROM ? 0 : 1;
  return `${fraction > 0 ? '+' : fraction < 0 ? '−' : ''}${formatPercent(Math.abs(fraction), digits)}`;
}

export default function PolarityScorecard({ data = defaultData, height, className }: PolarityScorecardProps) {
  const style = height === undefined ? undefined : { height };
  const summary =
    `Tabela com ${String(data.length)} indicadores de Marketing de ${formatMonthShort(currentLabel)} contra o mês anterior, ` +
    'cada um com a seta de tendência e a cor pela direção que a métrica declara, não pelo sinal do número.';

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
              Variação
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const delta = (row.value - row.previousValue) / row.previousValue;
            const isFlat = Math.abs(delta) < FLAT_THRESHOLD;
            const isUp = delta > 0;
            const DeltaIcon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;
            const isGood = !isFlat && row.goodDirection !== 'neutral' && (row.goodDirection === 'up' ? isUp : !isUp);
            const colorClass = isFlat || row.goodDirection === 'neutral' ? 'text-text-secondary' : isGood ? 'text-positive' : 'text-negative';
            return (
              <tr className="border-t border-line-subtle" key={row.id}>
                <th className="py-1 pr-2 text-left text-xs font-medium text-nowrap text-text-secondary" scope="row">
                  {row.metric}
                </th>
                <td className="kpi-number py-1 pl-3 text-right text-xs font-semibold text-text-primary">
                  {formatValue(row.value, row.unit)}
                </td>
                <td className="py-1 pl-3 text-right">
                  <div className="flex flex-col items-end leading-tight">
                    <span className={cn('kpi-number inline-flex items-center gap-1 text-xs font-semibold', colorClass)}>
                      <DeltaIcon aria-hidden className="size-3.5 shrink-0" strokeWidth={2.5} />
                      {isFlat ? 'estável' : signedPercent(delta)}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      vs {formatValue(row.previousValue, row.unit)} em {formatMonthShort(row.previousLabel)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-1 shrink-0 text-[11px] leading-snug text-text-muted">
        Seta e cor seguem a direção de cada indicador (CPL cai para ser bom; agendamento sobe para
        ser bom). Até <span className="tabular-nums">{formatPercent(FLAT_THRESHOLD, 0)}</span> de
        variação é estável, ruído e não tendência. Investimento em mídia não tem direção: fica
        sempre em cinza.
      </p>
    </div>
  );
}
