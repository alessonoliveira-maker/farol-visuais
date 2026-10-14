import { Check, CircleDashed, CircleDot, Minus, X } from 'lucide-react';
import type { ReactElement } from 'react';

import { cn } from '@/lib/utils';
import { data as defaultData, platforms as defaultPlatforms, type ComparisonRow, type MatrixStatus, type Platform } from './data';

/**
 * Cinco estados que não podem se confundir: cumpre, parcial, não cumpre, não se aplica e sem
 * dado, cada um com forma própria e nunca uma célula vazia. Não se aplica e sem dado saem do
 * denominador da contagem por linha; sem dado também sai do numerador e do cálculo de líder.
 * Empate no líder marca todas as colunas empatadas, sem escolher uma. HTML com Tailwind.
 */
export interface StatusMatrixProps {
  readonly data?: readonly ComparisonRow[];
  readonly platforms?: readonly Platform[];
  readonly height?: number;
  readonly className?: string;
}

const RANK: Record<MatrixStatus, number> = { cumpre: 3, parcial: 2, nao_cumpre: 1, nao_se_aplica: 0, sem_dado: 0 };
const ICON: Record<MatrixStatus, typeof Check> = { cumpre: Check, parcial: CircleDot, nao_cumpre: X, nao_se_aplica: Minus, sem_dado: CircleDashed };
const ICON_CLASS: Record<MatrixStatus, string> = {
  cumpre: 'text-positive',
  parcial: 'text-warning',
  nao_cumpre: 'text-negative',
  nao_se_aplica: 'text-text-muted',
  sem_dado: 'text-text-muted',
};
/**
 * `surface-overlay` é igual a `surface-raised` no tema claro (o chip some contra o cartão), o
 * mesmo defeito já visto em `14/04_scorecard-tabular`. Por isso não se aplica ganha fundo
 * `surface-sunken` (visível nos dois temas) e sem dado ganha contorno `line-strong`: dois
 * tratamentos diferentes, nenhum dependente de um token que empata com o fundo.
 */
const CHIP_CLASS: Record<MatrixStatus, string> = {
  cumpre: '',
  parcial: '',
  nao_cumpre: '',
  nao_se_aplica: 'bg-surface-sunken',
  sem_dado: 'border-line-strong',
};
const LABEL: Record<MatrixStatus, string> = {
  cumpre: 'Cumpre',
  parcial: 'Cumpre em parte',
  nao_cumpre: 'Não cumpre',
  nao_se_aplica: 'Não se aplica',
  sem_dado: 'Sem dado',
};

function isCountable(status: MatrixStatus): boolean {
  return status !== 'nao_se_aplica' && status !== 'sem_dado';
}

export default function StatusMatrix({
  data = defaultData,
  platforms = defaultPlatforms,
  height,
  className,
}: StatusMatrixProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  const semDadoTotal = data.reduce((sum, row) => sum + row.statuses.filter((status) => status === 'sem_dado').length, 0);
  const allTieRow = data.find((row) => row.statuses.every((status) => status === 'cumpre'));
  const narrowestRow = [...data].sort((a, b) => a.statuses.filter(isCountable).length - b.statuses.filter(isCountable).length).at(0);

  const summary =
    `Matriz de status com ${String(data.length)} critérios por ${String(platforms.length)} plataformas fictícias: cumpre, parcial, não cumpre, não se aplica ou sem dado (${String(semDadoTotal)}x, fora da contagem). ` +
    (allTieRow ? `${allTieRow.criterion} empata as ${String(platforms.length)} plataformas. ` : '') +
    (narrowestRow ? `${narrowestRow.criterion} tem menos plataformas aplicáveis.` : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <div className="mb-1.5 flex shrink-0 flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-muted">
        {(['cumpre', 'parcial', 'nao_cumpre', 'nao_se_aplica', 'sem_dado'] as const).map((status) => {
          const Icon = ICON[status];
          return (
            <span className="inline-flex items-center gap-1" key={status}>
              <span className={cn('inline-flex size-4 items-center justify-center rounded-full border border-transparent', CHIP_CLASS[status])}>
                <Icon aria-hidden className={cn('size-3', ICON_CLASS[status])} />
              </span>
              {LABEL[status]}
            </span>
          );
        })}
      </div>
      <table className="w-full min-w-0 flex-1 border-collapse">
        <thead>
          <tr>
            <th className="w-[26%] pb-1.5 text-left text-xs font-medium text-text-secondary" scope="col">
              Critério
            </th>
            {platforms.map((platform) => (
              <th className="px-1 pb-1.5 text-center text-[11px] leading-tight font-medium text-text-secondary" key={platform.id} scope="col">
                {platform.name}
              </th>
            ))}
            <th className="pb-1.5 pl-2 text-right text-xs font-medium text-text-secondary" scope="col">
              Cumprem
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const countable = row.statuses.filter(isCountable);
            const denominator = countable.length;
            const numerator = row.statuses.filter((status) => status === 'cumpre').length;
            const bestRank = Math.max(0, ...row.statuses.map((status) => RANK[status]));
            return (
              <tr className="border-t border-line-subtle" key={row.id}>
                <th className="py-1.5 pr-2 text-left text-xs font-medium text-text-primary" scope="row">
                  {row.criterion}
                </th>
                {row.statuses.map((status, columnIndex) => {
                  const Icon = ICON[status];
                  const isLeader = isCountable(status) && RANK[status] === bestRank && bestRank > 0;
                  const platform = platforms[columnIndex];
                  return (
                    <td className="py-1.5 text-center" key={platform?.id ?? columnIndex}>
                      <span
                        className={cn(
                          'inline-flex size-5 items-center justify-center rounded-full border-2',
                          isLeader ? 'border-text-primary' : 'border-transparent',
                          CHIP_CLASS[status],
                        )}
                      >
                        <Icon aria-hidden className={cn('size-3.5', ICON_CLASS[status])} />
                      </span>
                      <span className="sr-only">
                        {LABEL[status]}
                        {isLeader ? ', líder empatado neste critério' : ''}
                      </span>
                    </td>
                  );
                })}
                <td className="py-1.5 pl-2 text-right">
                  {denominator === 0 ? (
                    <span className="text-[11px] text-text-muted">sem plataforma aplicável</span>
                  ) : (
                    <span className="kpi-number text-xs font-semibold text-text-primary">
                      {String(numerator)} de {String(denominator)}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-1.5 shrink-0 text-[11px] text-text-muted">
        O contorno escuro em volta do ícone marca a plataforma líder no critério da linha; mais de um contorno na mesma linha é empate.
      </p>
    </div>
  );
}
