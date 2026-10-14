import { Unplug } from 'lucide-react';
import { Fragment, type ReactElement } from 'react';

import { formatUnavailable } from '@/lib/format';
import { formatValue } from '@/components/visuals/valueFormat';
import { cn } from '@/lib/utils';
import { data as defaultData, type DirectorRow, type Provenance, periodLabel } from './data';

/**
 * Quinze métricas da Diretoria agrupadas por área, cada linha com o selo de onde o número vem.
 * A legenda dos quatro selos aparece uma vez, no topo; a linha LACUNA não desenha valor, escreve
 * indisponível e o motivo curto ao lado, sem repetir a palavra LACUNA em nenhuma outra célula.
 */
export interface DirectorScorecardProps {
  readonly data?: readonly DirectorRow[];
  readonly height?: number;
  readonly className?: string;
}

const PROVENANCE_LABEL: Record<Provenance, string> = {
  medido: 'MEDIDO',
  derivado: 'DERIVADO',
  premissa: 'PREMISSA',
  lacuna: 'LACUNA',
};

const PROVENANCE_CLASS: Record<Provenance, string> = {
  medido: 'text-prov-medido',
  derivado: 'text-prov-derivado',
  premissa: 'text-prov-premissa',
  lacuna: 'text-prov-lacuna',
};

interface AreaGroup {
  readonly area: string;
  readonly rows: readonly DirectorRow[];
}

function groupByArea(rows: readonly DirectorRow[]): AreaGroup[] {
  const groups: AreaGroup[] = [];
  for (const row of rows) {
    const last = groups.at(-1);
    if (last && last.area === row.area) {
      groups[groups.length - 1] = { area: last.area, rows: [...last.rows, row] };
    } else {
      groups.push({ area: row.area, rows: [row] });
    }
  }
  return groups;
}

export default function DirectorScorecard({ data = defaultData, height, className }: DirectorScorecardProps): ReactElement {
  const style = height === undefined ? undefined : { height };
  const groups = groupByArea(data);
  const lacunas = data.filter((row) => row.provenance === 'lacuna');
  const counts = data.reduce<Record<Provenance, number>>(
    (acc, row) => ({ ...acc, [row.provenance]: acc[row.provenance] + 1 }),
    { medido: 0, derivado: 0, premissa: 0, lacuna: 0 },
  );

  const summary =
    `Tabela com ${String(data.length)} métricas da Diretoria em ${String(groups.length)} áreas, cada uma com a procedência: ` +
    `${String(counts.medido)} medidas, ${String(counts.derivado)} derivadas, ${String(counts.premissa)} premissas, ` +
    `${String(counts.lacuna)} lacuna${counts.lacuna === 1 ? '' : 's'}. ` +
    (lacunas.length > 0 ? `Lacuna: ${lacunas.map((row) => row.metric).join(', ')}.` : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <p className="mb-2 shrink-0 text-[11px] text-text-muted">
        Procedência do número:{' '}
        <span className={cn('font-semibold', PROVENANCE_CLASS.medido)}>MEDIDO</span> vem direto da
        plataforma de origem; <span className={cn('font-semibold', PROVENANCE_CLASS.derivado)}>DERIVADO</span> é
        calculado a partir de campos medidos; <span className={cn('font-semibold', PROVENANCE_CLASS.premissa)}>PREMISSA</span> é
        parâmetro assumido sem medição; <span className={cn('font-semibold', PROVENANCE_CLASS.lacuna)}>LACUNA</span> não
        foi coletado ainda.
      </p>
      <table className="w-full min-w-0 flex-1 border-collapse">
        <thead>
          <tr>
            <th className="pb-1.5 text-left text-xs font-medium text-text-secondary" scope="col">
              Indicador
            </th>
            <th className="pb-1.5 pl-3 text-right text-xs font-medium text-text-secondary" scope="col">
              {periodLabel}
            </th>
            <th className="pb-1.5 pl-3 text-right text-xs font-medium text-text-secondary" scope="col">
              Procedência
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.area}>
              <tr aria-hidden className="bg-surface-overlay">
                <td className="px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-text-muted uppercase" colSpan={3}>
                  {group.area}
                </td>
              </tr>
              {group.rows.map((row) => (
                <tr className="border-t border-line-subtle" key={row.id}>
                  <th className="py-1 pr-2 pl-1.5 text-left text-xs font-medium text-nowrap text-text-secondary" scope="row">
                    {row.metric}
                  </th>
                  <td className="py-1 pl-3 text-right">
                    {row.value === null || row.unit === null ? (
                      <span className="inline-flex items-center justify-end gap-1 text-xs text-text-muted">
                        <Unplug aria-hidden className="size-3.5 shrink-0" />
                        {formatUnavailable()}
                      </span>
                    ) : (
                      <span className="kpi-number text-xs font-semibold text-text-primary">{formatValue(row.value, row.unit)}</span>
                    )}
                    {row.reason ? <span className="block text-[11px] text-text-muted">{row.reason}</span> : null}
                  </td>
                  <td className={cn('py-1 pr-1.5 pl-3 text-right text-[11px] font-semibold', PROVENANCE_CLASS[row.provenance])}>
                    {PROVENANCE_LABEL[row.provenance]}
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
