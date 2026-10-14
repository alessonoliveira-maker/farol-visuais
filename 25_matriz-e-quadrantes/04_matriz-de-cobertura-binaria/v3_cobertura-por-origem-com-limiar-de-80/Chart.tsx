import { TriangleAlert } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, fields, threshold, type OriginFill } from './data';

/**
 * Matriz de cobertura com limiar: o percentual preenchido de cada campo por origem de lead, com
 * ponto cheio só quando a taxa chega ao piso declarado e anel vazio abaixo dele. Origem abaixo do
 * piso em campo crítico gera um aviso que o cartão de CPL herda. HTML com CSS Grid, sem Recharts.
 */
export interface ThresholdCoverageMatrixProps {
  readonly data?: readonly OriginFill[];
  readonly height?: number;
  readonly className?: string;
}

const ROW_HEIGHT = 44;
const NAME_COLUMN = '190px';
const DOT_SIZE = 14;
const GRID_COLUMNS = `${NAME_COLUMN} repeat(${String(fields.length)}, minmax(0, 1fr))`;

/** Média ponderada pelo volume da origem; `null` sem leads (EST-1b). */
function weightedRate(rows: readonly OriginFill[], index: number): number | null {
  const leads = rows.reduce((sum, row) => sum + row.leads, 0);
  if (leads === 0) return null;
  return rows.reduce((sum, row) => sum + row.leads * (row.rates[index] ?? 0), 0) / leads;
}

function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names.at(-1) ?? ''}`;
}

export default function ThresholdCoverageMatrix({ data = defaultData, height, className }: ThresholdCoverageMatrixProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center text-xs text-text-muted', className)} role="status" style={style}>
        O recorte não tem origens de lead, então não há cobertura para julgar contra o piso.
      </div>
    );
  }

  const thresholdText = formatPercent(threshold, 0);
  const flagged = data.filter((row) => fields.some((field, index) => field.critical && (row.rates[index] ?? 0) < threshold));
  const criticalNames = fields.filter((field) => field.critical).map((field) => field.name.toLowerCase());
  const flaggedNames = flagged.map((row) => row.origin);
  const passing = data.reduce((sum, row) => sum + row.rates.filter((rate) => rate >= threshold).length, 0);
  const cells = data.length * fields.length;

  const summary =
    `Matriz de cobertura com ${String(fields.length)} campos em ${String(data.length)} origens de lead, com ponto cheio só acima do piso de ${thresholdText}. ` +
    `${String(passing)} de ${String(cells)} células passam do piso. ` +
    (flagged.length > 0 ? `Em ${joinNames(criticalNames)}, campo obrigatório, ${String(flagged.length)} origens ficam abaixo do piso.` : 'Nenhuma origem fica abaixo do piso em campo obrigatório.');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <p className="mb-2 shrink-0 text-[11px] text-text-muted">
        Ponto cheio a partir de {thresholdText} dos leads da origem com o campo preenchido. Piso{' '}
        <span className="font-semibold text-prov-premissa">PREMISSA</span>, não medido.
      </p>
      <div className="grid shrink-0 items-end pb-1.5" role="row" style={{ gridTemplateColumns: GRID_COLUMNS }}>
        <span className="text-xs font-medium text-text-secondary" role="columnheader">
          Origem
        </span>
        {fields.map((field) => (
          <span className={cn('text-center text-[11px]', field.critical ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')} key={field.id} role="columnheader">
            {field.name}
            {field.critical ? <span className="block text-[11px] font-medium text-text-muted">obrigatório</span> : null}
          </span>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col" role="rowgroup">
        {data.map((row) => (
          <div className="grid items-center border-t border-line-subtle" key={row.id} role="row" style={{ gridTemplateColumns: GRID_COLUMNS, height: ROW_HEIGHT }}>
            <span className="pr-2 text-xs leading-tight font-medium text-text-primary" role="rowheader">
              {row.origin}
              <span className="kpi-number block text-[11px] font-medium text-text-muted">{formatInt(row.leads)} leads</span>
            </span>
            {fields.map((field, index) => {
              const rate = row.rates[index] ?? 0;
              const passes = rate >= threshold;
              const alarm = field.critical && !passes;
              return (
                <span
                  aria-label={`${row.origin}, ${field.name}: ${formatPercent(rate, 0)} preenchido, ${passes ? 'acima' : 'abaixo'} do piso de ${thresholdText}`}
                  className={cn('flex items-center justify-center gap-1.5 self-stretch', field.critical && 'bg-surface-sunken')}
                  key={field.id}
                  role="cell"
                >
                  <span
                    aria-hidden
                    className={cn('block rounded-full', passes ? 'bg-chart-1' : alarm ? 'border-2 border-warning' : 'border-2 border-text-muted')}
                    style={{ height: DOT_SIZE, width: DOT_SIZE }}
                  />
                  <span className={cn('kpi-number w-9 text-xs', alarm ? 'font-bold text-text-primary' : 'font-semibold text-text-secondary')}>{formatPercent(rate, 0)}</span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div className="grid shrink-0 items-center border-t border-line-strong py-1.5" role="row" style={{ gridTemplateColumns: GRID_COLUMNS }}>
        <span className="text-[11px] font-medium text-text-muted" role="rowheader">
          Média ponderada
        </span>
        {fields.map((field, index) => {
          const rate = weightedRate(data, index);
          return (
            <span className="kpi-number text-center text-[11px] font-semibold text-text-secondary" key={field.id} role="cell">
              {rate === null ? '' : formatPercent(rate, 0)}
            </span>
          );
        })}
      </div>
      {flagged.length > 0 ? (
        <p className="mt-1 flex shrink-0 items-start gap-2 text-[11px] leading-snug text-text-secondary">
          <TriangleAlert aria-hidden className="mt-px size-3.5 shrink-0 text-warning" />
          <span>
            Aviso para o CPL: {joinNames(flaggedNames)} ficam abaixo de {thresholdText} em {joinNames(criticalNames)}, campo obrigatório. Cobertura baixa em campo obrigatório é sintoma de coleta, e o CPL qualificado dessas origens herda o aviso.
          </span>
        </p>
      ) : null}
    </div>
  );
}
