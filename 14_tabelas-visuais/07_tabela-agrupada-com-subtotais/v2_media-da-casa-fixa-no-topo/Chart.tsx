import { Fragment, useMemo } from 'react';

import { formatPercentPoints, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SalesTeam } from './data';

/**
 * Tabela agrupada por time com a taxa de ganho de cada executivo contra a média da casa, que fica
 * numa linha fixa (position sticky) no topo do contêiner de rolagem, sempre à vista mesmo com mais
 * times do que cabem no cartão. O subtotal de time e a média da casa são MÉDIAS PONDERADAS (soma
 * dos ganhos sobre soma do total), não a média simples dos percentuais de cada linha. O desvio de
 * cada executivo contra a média usa uma barra divergente com o sinal escrito ao lado. HTML com
 * Tailwind; nenhum ancestral da tabela usa overflow hidden, só o próprio contêiner de rolagem.
 */
export interface HouseAverageTableProps {
  readonly data?: readonly SalesTeam[];
  readonly height?: number;
  readonly className?: string;
}

/** Espessura da marca (ESP-2): acima do piso de 12 px em cartão. */
const TRACK_HEIGHT = 12;
/** Teto do contêiner de rolagem: maior que o dado de exemplo, cresce sozinho com mais linhas. */
const SCROLL_MAX_HEIGHT = 420;

type Executive = SalesTeam['executives'][number];

function weightedRate(rows: readonly Executive[]): { wins: number; total: number } {
  return { wins: rows.reduce((sum, row) => sum + row.wins, 0), total: rows.reduce((sum, row) => sum + row.total, 0) };
}

/** Sinal à mão sobre o valor absoluto, com o sinal de menos tipográfico (NUM-3). */
function signedPoints(fraction: number): string {
  return `${fraction >= 0 ? '+' : '−'}${formatPercentPoints(Math.abs(fraction) * 100)} p.p.`;
}

export default function HouseAverageTable({ data = defaultData, height, className }: HouseAverageTableProps) {
  const style = height === undefined ? undefined : { height };
  const teams = useMemo(() => data.map((team) => ({ ...team, subtotal: weightedRate(team.executives) })), [data]);
  const house = useMemo(() => weightedRate(data.flatMap((team) => team.executives)), [data]);
  const houseRate = house.total > 0 ? house.wins / house.total : 0;

  const deviations = useMemo(
    () => data.flatMap((team) => team.executives.map((row) => (row.total > 0 ? row.wins / row.total : 0) - houseRate)),
    [data, houseRate],
  );
  const domainMax = Math.max(1e-9, ...deviations.map((value) => Math.abs(value)));

  const totalExecutives = data.reduce((sum, team) => sum + team.executives.length, 0);
  if (totalExecutives === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum executivo neste recorte: não há taxa de ganho para comparar com a média da casa.
      </div>
    );
  }

  const summary = `Tabela agrupada por time com a taxa de ganho de ${String(totalExecutives)} executivos contra a média da casa, fixa no topo: ${formatRateWithVolume(house.wins, house.total)}. Maior desvio medido: ${signedPoints(domainMax)}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="min-w-0 flex-1 overflow-y-auto rounded-md border border-line-subtle" style={{ maxHeight: SCROLL_MAX_HEIGHT }}>
        <table className="w-full min-w-0 border-collapse text-xs">
          <thead>
            <tr className="border-b border-line-subtle text-[0.6875rem] font-medium text-text-muted">
              <th className="px-2 py-1.5 text-left" scope="col">
                Time / executivo
              </th>
              <th className="px-2 py-1.5 text-left" scope="col">
                Taxa de ganho
              </th>
              <th className="px-2 py-1.5 text-right" scope="col">
                Desvio contra a média
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="sticky top-0 z-10 bg-surface-sunken px-2 py-1.5 font-semibold text-text-primary">Média da casa</td>
              <td className="sticky top-0 z-10 bg-surface-sunken px-2 py-1.5 font-display font-semibold text-text-primary tabular-nums">
                {formatRateWithVolume(house.wins, house.total)}
              </td>
              <td className="sticky top-0 z-10 bg-surface-sunken px-2 py-1.5 text-right text-[0.6875rem] text-text-muted">referência</td>
            </tr>
            {teams.map((team) => (
              <Fragment key={team.id}>
                <tr className="bg-surface-overlay/60">
                  <th className="px-2 py-1.5 text-left font-semibold text-text-primary" scope="rowgroup">
                    {team.name}
                  </th>
                  <td className="px-2 py-1.5 font-display font-semibold text-text-primary tabular-nums">
                    {formatRateWithVolume(team.subtotal.wins, team.subtotal.total)}
                  </td>
                  <td className="px-2 py-1.5" />
                </tr>
                {team.executives.map((row) => {
                  const rate = row.total > 0 ? row.wins / row.total : 0;
                  const deviation = rate - houseRate;
                  const isPositive = deviation >= 0;
                  const spanPct = (Math.abs(deviation) / domainMax) * 50;
                  return (
                    <tr key={row.id}>
                      <td className="py-1.5 pr-2 pl-6 text-text-secondary">{row.name}</td>
                      <td className="px-2 py-1.5 font-display text-text-secondary tabular-nums">{formatRateWithVolume(row.wins, row.total)}</td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="relative min-w-0 flex-1" style={{ height: TRACK_HEIGHT }}>
                            <div className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
                            <div
                              className={cn('absolute inset-y-0 rounded-sm', isPositive ? 'bg-positive' : 'bg-negative')}
                              style={isPositive ? { left: '50%', width: `${String(spanPct)}%` } : { right: '50%', width: `${String(spanPct)}%` }}
                            />
                          </div>
                          <span className={cn('w-24 shrink-0 text-right font-display tabular-nums', isPositive ? 'text-positive' : 'text-negative')}>
                            {signedPoints(deviation)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Desvio de cada executivo contra a média da casa, em pontos percentuais.
      </p>
    </div>
  );
}
