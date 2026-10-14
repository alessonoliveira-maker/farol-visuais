import type { ReactElement } from 'react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, fields, type FieldState, type SourceCoverage } from './data';

/**
 * Matriz de cobertura com três estados: ponto cheio quando o campo chega preenchido, anel vazio
 * quando a fonte coleta mas o campo vem em branco, hachura diagonal quando o campo está fora da
 * coleta da fonte. O rodapé mede o preenchimento só entre as fontes que coletam o campo.
 */
export interface CollectionCoverageMatrixProps {
  readonly data?: readonly SourceCoverage[];
  readonly height?: number;
  readonly className?: string;
}

const CELL_WIDTH = 82;
const ROW_HEIGHT = 44;
const NAME_COLUMN = 150;
const DOT_SIZE = 16;
const HATCH_INSET = 4;
const HATCH_STEP = 7;
const GRID_COLUMNS = `${String(NAME_COLUMN)}px repeat(${String(fields.length)}, ${String(CELL_WIDTH)}px)`;

const STATE_LABEL: Record<FieldState, string> = {
  presente: 'presente',
  vazio: 'vazio na base',
  fora: 'fora da coleta, preenchimento desconhecido',
};

/** Linhas diagonais de 45 graus que cobrem a caixa; o SVG recorta o que passa da borda. */
function hatchLines(width: number, height: number): readonly number[] {
  const offsets: number[] = [];
  for (let offset = -height; offset < width; offset += HATCH_STEP) offsets.push(offset);
  return offsets;
}

function Mark({ state }: { readonly state: FieldState }): ReactElement {
  if (state === 'fora') {
    const width = CELL_WIDTH - 2 * HATCH_INSET;
    const height = ROW_HEIGHT - 2 * HATCH_INSET;
    return (
      <svg aria-hidden className="block rounded-sm" height={height} viewBox={`0 0 ${String(width)} ${String(height)}`} width={width}>
        {hatchLines(width, height).map((offset) => (
          <line key={offset} stroke="var(--text-muted)" strokeWidth={1.5} x1={offset} x2={offset + height} y1={height} y2={0} />
        ))}
      </svg>
    );
  }
  return (
    <span
      aria-hidden
      className={cn('block rounded-full', state === 'presente' ? 'bg-chart-1' : 'border-2 border-text-muted')}
      style={{ height: DOT_SIZE, width: DOT_SIZE }}
    />
  );
}

/** Fontes que coletam o campo e fontes em que ele chega preenchido; `null` quando nenhuma coleta. */
function fieldRate(rows: readonly SourceCoverage[], index: number): { readonly filled: number; readonly collecting: number } | null {
  const collecting = rows.filter((row) => row.states[index] !== 'fora');
  if (collecting.length === 0) return null;
  return { filled: collecting.filter((row) => row.states[index] === 'presente').length, collecting: collecting.length };
}

export default function CollectionCoverageMatrix({ data = defaultData, height, className }: CollectionCoverageMatrixProps): ReactElement {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center text-xs text-text-muted', className)} role="status" style={style}>
        O recorte não tem fontes de lead, então não há cobertura de campos para mostrar.
      </div>
    );
  }

  const outside = data.flatMap((row) => row.states.flatMap((state, index) => (state === 'fora' ? [{ source: row.source, field: fields[index]?.name.toLowerCase() ?? '', index }] : [])));
  const firstOutside = outside[0];

  const summary =
    `Matriz de cobertura: ${String(fields.length)} campos em ${String(data.length)} fontes de lead, com os estados presente, vazio e fora da coleta. ` +
    (firstOutside
      ? `${firstOutside.source} não coleta ${firstOutside.field}, então o preenchimento é desconhecido e a fonte fica fora do percentual do rodapé desse campo.`
      : 'Todas as fontes coletam todos os campos.');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-start gap-6', className)} role="table" style={style}>
      <div className="flex shrink-0 flex-col">
        <div className="grid items-end pb-1.5" role="row" style={{ gridTemplateColumns: GRID_COLUMNS }}>
          <span className="text-xs font-medium text-text-secondary" role="columnheader">
            Fonte
          </span>
          {fields.map((field) => (
            <span className="text-center text-[11px] font-medium text-text-secondary" key={field.id} role="columnheader">
              {field.name}
            </span>
          ))}
        </div>
        <div role="rowgroup">
          {data.map((row) => (
            <div className="grid items-center border-t border-line-subtle" key={row.id} role="row" style={{ gridTemplateColumns: GRID_COLUMNS, height: ROW_HEIGHT }}>
              <span className="pr-2 text-xs font-medium text-text-primary" role="rowheader">
                {row.source}
              </span>
              {fields.map((field, index) => {
                const state = row.states[index] ?? 'fora';
                return (
                  <span
                    aria-label={`${row.source}, ${field.name}: ${STATE_LABEL[state]}`}
                    className="flex items-center justify-center self-stretch"
                    key={field.id}
                    role="cell"
                  >
                    <Mark state={state} />
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <div className="grid items-center border-t border-line-strong pt-1.5" role="row" style={{ gridTemplateColumns: GRID_COLUMNS }}>
          <span className="text-[11px] font-medium text-text-muted" role="rowheader">
            Preenchido entre as fontes que coletam o campo
          </span>
          {fields.map((field, index) => {
            const rate = fieldRate(data, index);
            return (
              <span className="kpi-number text-center text-[11px] leading-tight font-semibold text-text-secondary" key={field.id} role="cell">
                {rate === null ? 'sem coleta' : formatPercent(rate.filled / rate.collecting, 0)}
                {rate === null ? null : <span className="block text-[11px] font-medium text-text-muted">{formatInt(rate.filled)} de {formatInt(rate.collecting)} fontes</span>}
              </span>
            );
          })}
        </div>
      </div>
      <div aria-hidden className="flex min-w-0 flex-1 flex-col gap-3 pt-1">
        <div className="flex flex-col gap-2 text-[11px] text-text-secondary">
          <span className="inline-flex items-center gap-2">
            <Mark state="presente" /> Preenchido
          </span>
          <span className="inline-flex items-center gap-2">
            <Mark state="vazio" /> Coletado, vazio na base
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="block rounded-sm" style={{ height: DOT_SIZE, width: DOT_SIZE }}>
              <svg aria-hidden className="block rounded-sm" height={DOT_SIZE} viewBox="0 0 16 16" width={DOT_SIZE}>
                {hatchLines(DOT_SIZE, DOT_SIZE).map((offset) => (
                  <line key={offset} stroke="var(--text-muted)" strokeWidth={1.5} x1={offset} x2={offset + DOT_SIZE} y1={DOT_SIZE} y2={0} />
                ))}
              </svg>
            </span>{' '}
            Fora da coleta da fonte
          </span>
        </div>
        {firstOutside ? (
          <p className="text-xs leading-snug text-text-secondary">
            <span className="font-semibold text-text-primary">Preenchimento desconhecido.</span> {firstOutside.source} não coleta {firstOutside.field}: campo fora da coleta, não ausente na base. Em {firstOutside.field}, o rodapé mede o preenchimento só entre as {formatInt(fieldRate(data, firstOutside.index)?.collecting ?? 0)} fontes que coletam.
          </p>
        ) : null}
      </div>
    </div>
  );
}
