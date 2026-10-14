import type { ReactElement } from 'react';

import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, fields, type OriginCoverage } from './data';

/**
 * Matriz de cobertura binária: origens de lead nas linhas, campos nas colunas, ponto cheio quando
 * a origem entrega o campo e anel vazio quando não entrega. Percentual de preenchimento no rodapé
 * de cada coluna e linhas ordenadas pelo total de campos presentes. HTML com CSS Grid, sem Recharts.
 */
export interface FieldCoverageMatrixProps {
  readonly data?: readonly OriginCoverage[];
  readonly height?: number;
  readonly className?: string;
}

const CELL_MIN_HEIGHT = 44;
const NAME_COLUMN = '150px';
const COUNT_COLUMN = '56px';
const DOT_SIZE = 16;
const GRID_COLUMNS = `${NAME_COLUMN} repeat(${String(fields.length)}, minmax(0, 1fr)) ${COUNT_COLUMN}`;

function presentCount(row: OriginCoverage): number {
  return row.present.filter(Boolean).length;
}

/** Fração de origens que entregam o campo; `null` quando não há origem para medir (EST-1b). */
function columnRate(rows: readonly OriginCoverage[], index: number): number | null {
  if (rows.length === 0) return null;
  return rows.filter((row) => row.present[index] === true).length / rows.length;
}

function Mark({ present }: { readonly present: boolean }): ReactElement {
  return (
    <span
      aria-hidden
      className={cn('block rounded-full', present ? 'bg-chart-1' : 'border-2 border-text-muted')}
      style={{ height: DOT_SIZE, width: DOT_SIZE }}
    />
  );
}

export default function FieldCoverageMatrix({ data = defaultData, height, className }: FieldCoverageMatrixProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center text-xs text-text-muted', className)} role="status" style={style}>
        O recorte não tem origens de lead, então não há cobertura de campos para mostrar.
      </div>
    );
  }

  const ranked = [...data].sort((a, b) => presentCount(b) - presentCount(a));
  const total = fields.length;
  const rates = fields.map((_, index) => columnRate(data, index));
  const weakest = rates.reduce<number>((worst, rate, index) => ((rate ?? 1) < (rates[worst] ?? 1) ? index : worst), 0);
  const weakestField = fields[weakest];
  const leader = ranked[0];
  const last = ranked.at(-1);

  const summary =
    `Matriz de cobertura: ${String(total)} campos em ${String(data.length)} origens de lead, ordenadas pelo total de campos presentes. ` +
    (leader ? `${leader.origin} entrega ${String(presentCount(leader))} de ${String(total)}` : '') +
    (last && last.id !== leader?.id ? `; ${last.origin} entrega ${String(presentCount(last))}` : '') +
    (weakestField ? `. O campo menos entregue é ${weakestField.name.toLowerCase()}, presente em ${String(data.filter((row) => row.present[weakest] === true).length)} de ${String(data.length)} origens.` : '.');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 items-center justify-between gap-3 text-[11px] text-text-muted">
        <span>Origens ordenadas pelo total de campos presentes</span>
        <span className="inline-flex shrink-0 items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <Mark present /> Entrega
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mark present={false} /> Não entrega
          </span>
        </span>
      </div>
      <div className="grid shrink-0 items-end pb-1.5" role="row" style={{ gridTemplateColumns: GRID_COLUMNS }}>
        <span className="text-xs font-medium text-text-secondary" role="columnheader">
          Origem
        </span>
        {fields.map((field) => (
          <span className="text-center text-[11px] font-medium text-text-secondary" key={field.id} role="columnheader">
            {field.name}
          </span>
        ))}
        <span className="text-right text-[11px] font-medium text-text-secondary" role="columnheader">
          Campos
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col" role="rowgroup">
        {ranked.map((row) => (
          <div className="grid items-center border-t border-line-subtle" key={row.id} role="row" style={{ gridTemplateColumns: GRID_COLUMNS, minHeight: CELL_MIN_HEIGHT }}>
            <span className="pr-2 text-xs leading-tight font-medium text-text-primary" role="rowheader">
              {row.origin}
            </span>
            {fields.map((field, index) => {
              const isPresent = row.present[index] === true;
              return (
                <span
                  aria-label={`${row.origin}, ${field.name}: ${isPresent ? 'presente' : 'ausente'}`}
                  className="flex items-center justify-center self-stretch"
                  key={field.id}
                  role="cell"
                >
                  <Mark present={isPresent} />
                </span>
              );
            })}
            <span className="kpi-number text-right text-xs font-semibold text-text-primary" role="cell">
              {formatInt(presentCount(row))} de {formatInt(total)}
            </span>
          </div>
        ))}
      </div>
      <div className="grid shrink-0 items-center border-t border-line-strong pt-1.5" role="row" style={{ gridTemplateColumns: GRID_COLUMNS }}>
        <span className="text-[11px] font-medium text-text-muted" role="rowheader">
          Origens que entregam
        </span>
        {rates.map((rate, index) => (
          <span className="kpi-number text-center text-[11px] font-semibold text-text-secondary" key={fields[index]?.id ?? index} role="cell">
            {rate === null ? '' : formatRateWithVolume(Math.round(rate * data.length), data.length, 0)}
          </span>
        ))}
        <span role="cell" />
      </div>
    </div>
  );
}
