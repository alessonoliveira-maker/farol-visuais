import { Fragment, useMemo } from 'react';

import { formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Executive, type SalesTeam } from './data';

/**
 * Tabela agrupada por time comercial: cada time soma o pipeline aberto e os fechamentos do
 * trimestre por SOMA, as linhas filhas ficam recuadas e ordenadas por pipeline dentro do próprio
 * grupo, e a barra inline usa uma escala calculada só sobre as linhas filhas, nunca sobre o
 * subtotal, que é sempre maior que qualquer executivo isolado. Grupos se separam por espaço, sem
 * borda interna. HTML com Tailwind.
 */
export interface GroupedPipelineTableProps {
  readonly data?: readonly SalesTeam[];
  readonly height?: number;
  readonly className?: string;
}

/** Espessura da marca (ESP-2): acima do piso de 12 px em cartão, sem rótulo dentro da barra. */
const TRACK_HEIGHT = 14;
/** Largura fixa da coluna de valor, para o algarismo tabular alinhar entre as linhas. */
const VALUE_COLUMN_WIDTH = 100;

function sortByPipelineDesc(rows: readonly Executive[]): Executive[] {
  return [...rows].sort((a, b) => b.pipeline - a.pipeline);
}

export default function GroupedPipelineTable({ data = defaultData, height, className }: GroupedPipelineTableProps) {
  const style = height === undefined ? undefined : { height };

  const teams = useMemo(
    () =>
      data.map((team) => {
        const executives = sortByPipelineDesc(team.executives);
        const pipelineSubtotal = executives.reduce((sum, row) => sum + row.pipeline, 0);
        const fechamentosSubtotal = executives.reduce((sum, row) => sum + row.fechamentos, 0);
        return { ...team, executives, pipelineSubtotal, fechamentosSubtotal };
      }),
    [data],
  );
  // Domínio calculado só sobre as linhas filhas: o subtotal, sempre maior, fica de fora.
  const domainMax = useMemo(() => Math.max(0, ...teams.flatMap((team) => team.executives.map((row) => row.pipeline))), [teams]);

  if (teams.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum time neste recorte: não há pipeline aberto para comparar.
      </div>
    );
  }

  const totalExecutives = teams.reduce((sum, team) => sum + team.executives.length, 0);
  const leader = [...teams].sort((a, b) => b.pipelineSubtotal - a.pipelineSubtotal)[0];
  const summary = leader
    ? `Tabela agrupada por time comercial com subtotal por soma de pipeline aberto e fechamentos de 2026 T3: ${String(teams.length)} times, ${String(totalExecutives)} executivos. ${leader.name} lidera o subtotal com ${formatCurrencyCompact(leader.pipelineSubtotal)} de pipeline e ${formatInt(leader.fechamentosSubtotal)} fechamentos.`
    : 'Tabela sem times neste recorte.';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <table className="w-full min-w-0 border-collapse text-xs">
        <thead>
          <tr className="border-b border-line-subtle">
            <th className="px-2 py-1.5 text-left text-[0.6875rem] font-medium text-text-muted" scope="col">
              Time / executivo
            </th>
            <th className="px-2 py-1.5 text-left text-[0.6875rem] font-medium text-text-muted" scope="col">
              Pipeline aberto
            </th>
            <th className="px-2 py-1.5 text-right text-[0.6875rem] font-medium text-text-muted" scope="col">
              Fechamentos T3
            </th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, teamIndex) => (
            <Fragment key={team.id}>
              {teamIndex > 0 ? (
                <tr aria-hidden>
                  <td className="h-2" colSpan={3} />
                </tr>
              ) : null}
              <tr className="bg-surface-overlay/60">
                <th className="px-2 py-1.5 text-left font-semibold text-text-primary" scope="rowgroup">
                  {team.name}
                </th>
                <td className="kpi-number px-2 py-1.5 text-left font-semibold text-text-primary tabular-nums">
                  {formatCurrencyCompact(team.pipelineSubtotal)}
                </td>
                <td className="kpi-number px-2 py-1.5 text-right font-semibold text-text-primary tabular-nums">
                  {formatInt(team.fechamentosSubtotal)}
                </td>
              </tr>
              {team.executives.map((row) => {
                const pct = domainMax > 0 ? (row.pipeline / domainMax) * 100 : 0;
                return (
                  <tr key={row.id}>
                    <td className="py-1.5 pr-2 pl-6 text-text-secondary">{row.name}</td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="relative min-w-0 flex-1 rounded-full bg-surface-sunken" style={{ height: TRACK_HEIGHT }}>
                          <div className="h-full rounded-full bg-chart-1" style={{ width: `${String(pct)}%` }} />
                        </div>
                        <span
                          className="shrink-0 text-right font-display text-text-secondary tabular-nums"
                          style={{ width: VALUE_COLUMN_WIDTH }}
                        >
                          {formatCurrencyCompact(row.pipeline)}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-right font-display text-text-secondary tabular-nums">{formatInt(row.fechamentos)}</td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        {formatInt(totalExecutives)} executivos em {formatInt(teams.length)} times. Fundo realçado marca o subtotal do time.
      </p>
    </div>
  );
}
