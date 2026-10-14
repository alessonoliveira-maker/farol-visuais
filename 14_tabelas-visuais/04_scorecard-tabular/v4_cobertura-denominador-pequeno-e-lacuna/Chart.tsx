import { TriangleAlert, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periodLabel, type CoverageRow } from './data';

/**
 * Cobertura de telefone e cargo por origem, cada uma com a barra de 0 a 100% ao lado do
 * percentual, mais a taxa de agendamento sem barra (é conversão, não cobertura de campo).
 * Sempre percentual e fração lado a lado: abaixo de 10 leads a fração vem em destaque e o
 * percentual em apoio, porque a base é pequena demais para o percentual sozinho não enganar.
 * Cidade é lacuna inteira, a mesma em toda origem, e por isso o motivo mora só no cabeçalho da
 * coluna.
 */
export interface CoverageTableProps {
  readonly data?: readonly CoverageRow[];
  readonly height?: number;
  readonly className?: string;
}

/** Abaixo deste volume, a fração vem em destaque e o percentual em apoio (NUM caso limite). */
const N_MIN = 10;
/** Abaixo desta cobertura, a célula fica muted com ícone: alerta, não erro. */
const LOW_COVERAGE = 0.5;
/** Trilho da barra de cobertura: piso de espessura de marca em cartão (ESP-2), nunca menos. */
const BAR_HEIGHT = 12;
const BAR_WIDTH = 40;

/**
 * `flagLow` também decide a barra: só faz sentido para cobertura de campo (telefone, cargo).
 * Abaixo do piso, o dado pode faltar por problema de coleta, e o aviso é sobre a confiança do
 * número. Numa taxa de conversão (agendamento) um valor baixo é o KPI de verdade, não um
 * problema de coleta, então a coluna de agendamento nunca leva barra nem aviso, só o destaque de
 * fração do denominador pequeno.
 */
function RatePair({
  numerator,
  denominator,
  flagLow = true,
}: {
  readonly numerator: number;
  readonly denominator: number;
  readonly flagLow?: boolean;
}): ReactElement {
  if (denominator <= 0) {
    return <span className="text-xs text-text-muted">{formatUnavailable()}</span>;
  }
  const fraction = `${formatInt(numerator)} de ${formatInt(denominator)}`;
  const coverage = numerator / denominator;
  const percent = formatPercent(coverage, 0);
  const low = flagLow && coverage < LOW_COVERAGE;
  const small = denominator < N_MIN;
  const mainClass = cn('kpi-number text-xs font-semibold', low ? 'text-text-muted' : 'text-text-primary');
  const barPct = Math.min(Math.max(coverage, 0), 1) * 100;
  return (
    <span className="inline-flex items-center justify-end gap-2">
      {flagLow ? (
        <span
          aria-hidden
          className="relative shrink-0 overflow-hidden rounded-full border border-line-subtle bg-surface-sunken"
          style={{ height: BAR_HEIGHT, width: BAR_WIDTH }}
        >
          <span className="absolute inset-y-0 left-0 rounded-full bg-chart-1" style={{ width: `${String(barPct)}%` }} />
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1">
        {low ? <TriangleAlert aria-hidden className="size-3.5 shrink-0 text-text-muted" /> : null}
        <span className={mainClass}>{small ? fraction : percent}</span>
        <span className="text-[11px] text-text-muted">({small ? percent : fraction})</span>
      </span>
    </span>
  );
}

export default function CoverageTable({ data = defaultData, height, className }: CoverageTableProps): ReactElement {
  const style = height === undefined ? undefined : { height };
  const smallRows = data.filter((row) => row.volume < N_MIN);
  const lowPhoneRows = data.filter((row) => row.phoneCovered / row.volume < LOW_COVERAGE);

  const summary =
    `Tabela de cobertura de telefone, cargo, cidade e agendamento em ${String(data.length)} origens de lead de ${formatMonthShort(periodLabel)}. ` +
    (smallRows.length > 0 ? `${String(smallRows.length)} com menos de ${String(N_MIN)} leads, em fração. ` : '') +
    (lowPhoneRows.length > 0 ? `${String(lowPhoneRows.length)} com telefone abaixo de ${formatPercent(LOW_COVERAGE, 0)}.` : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <p className="mb-1 shrink-0 text-[11px] text-text-muted">Leads captados em {formatMonthShort(periodLabel)}, por origem.</p>
      <table className="w-full min-w-0 flex-1 border-collapse">
        <thead>
          <tr>
            <th className="pb-1.5 text-left text-xs font-medium text-text-secondary" scope="col">
              Origem
            </th>
            <th className="pb-1.5 pl-3 text-right text-xs font-medium text-text-secondary" scope="col">
              Leads
            </th>
            <th className="pb-1.5 pl-3 text-right text-xs font-medium text-text-secondary" scope="col">
              Telefone
            </th>
            <th className="pb-1.5 pl-3 text-right text-xs font-medium text-text-secondary" scope="col">
              Cargo
            </th>
            <th className="pb-1.5 pl-3 text-right text-xs font-medium text-text-secondary" scope="col">
              <span className="inline-flex items-center justify-end gap-1">
                <Unplug aria-hidden className="size-3 shrink-0" />
                Cidade
              </span>
            </th>
            <th className="pb-1.5 pl-3 text-right text-xs font-medium text-text-secondary" scope="col">
              Agendamento
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr className="border-t border-line-subtle" key={row.id}>
              <th className="py-1 pr-2 text-left text-xs font-medium text-nowrap text-text-secondary" scope="row">
                {row.origin}
              </th>
              <td className="kpi-number py-1 pl-3 text-right text-xs font-semibold text-text-primary">{formatInt(row.volume)}</td>
              <td className="py-1 pl-3 text-right">
                <RatePair denominator={row.volume} numerator={row.phoneCovered} />
              </td>
              <td className="py-1 pl-3 text-right">
                <RatePair denominator={row.volume} numerator={row.roleCovered} />
              </td>
              <td className="py-1 pl-3 text-right">
                <span className="inline-flex items-center justify-end gap-1 text-xs text-text-muted">
                  <Unplug aria-hidden className="size-3.5 shrink-0" />
                  {formatUnavailable()}
                </span>
              </td>
              <td className="py-1 pl-3 text-right">
                <RatePair denominator={row.volume} flagLow={false} numerator={row.agendas} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-0.5 shrink-0 text-[11px] leading-snug text-text-muted">
        Barra e percentual de telefone e cargo vão de{' '}
        <span className="tabular-nums">{formatPercent(0, 0)}</span> a{' '}
        <span className="tabular-nums">{formatPercent(1, 0)}</span>. Abaixo de{' '}
        <span className="tabular-nums">{formatInt(N_MIN)}</span> leads a fração vem em destaque;
        abaixo de <span className="tabular-nums">{formatPercent(LOW_COVERAGE, 0)}</span> de
        cobertura, o texto fica cinza com aviso. Agendamento não leva barra nem aviso: taxa baixa
        é o KPI, não falha de coleta. Cidade é lacuna em toda origem: motivo declarado aqui, não
        em cada célula.
      </p>
    </div>
  );
}
