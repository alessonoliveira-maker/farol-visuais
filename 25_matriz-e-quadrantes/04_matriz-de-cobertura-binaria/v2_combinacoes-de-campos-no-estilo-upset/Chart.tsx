import type { ReactElement } from 'react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, fields, type FieldCombination } from './data';

/**
 * Combinações de campos no estilo UpSet: cada linha é um conjunto exato de campos preenchidos,
 * com pontos ligados por um traço, barra de leads à direita e barra de leads por campo no topo.
 * As maiores combinações aparecem e o resto soma em "demais combinações". HTML com CSS Grid.
 */
export interface FieldCombinationsProps {
  readonly data?: readonly FieldCombination[];
  readonly height?: number;
  readonly className?: string;
}

const CELL_WIDTH = 64;
const ROW_HEIGHT = 30;
const TOP_BAR_MAX = 34;
const SIDE_BAR_MAX = 96;
const DOT_SIZE = 14;
const ABSENT_DOT_SIZE = 4;
const LINK_THICKNESS = 2;
const VISIBLE_COMBINATIONS = 9;
const GRID_COLUMNS = `repeat(${String(fields.length)}, ${String(CELL_WIDTH)}px) minmax(0, 1fr)`;

interface Combination {
  readonly key: string;
  readonly present: readonly boolean[];
  readonly leads: number;
}

/** Chave canônica: ids dos campos na ordem de `fields`, então a ordem do dado não cria duplicata. */
function buildCombinations(rows: readonly FieldCombination[]): readonly Combination[] {
  const merged = new Map<string, number>();
  for (const row of rows) {
    const key = fields
      .filter((field) => row.fieldIds.includes(field.id))
      .map((field) => field.id)
      .join('+');
    merged.set(key, (merged.get(key) ?? 0) + row.leads);
  }
  return [...merged.entries()]
    .map(([key, leads]) => ({ key, leads, present: fields.map((field) => key.split('+').includes(field.id)) }))
    .sort((a, b) => b.leads - a.leads);
}

function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names.at(-1) ?? ''}`;
}

function comboNames(present: readonly boolean[]): readonly string[] {
  return fields.filter((_, index) => present[index] === true).map((field) => field.name.toLowerCase());
}

export default function FieldCombinations({ data = defaultData, height, className }: FieldCombinationsProps): ReactElement {
  const style = height === undefined ? undefined : { height };
  const combinations = buildCombinations(data);

  if (combinations.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center justify-center text-xs text-text-muted', className)} role="status" style={style}>
        O recorte não tem leads, então não há combinações de campos para contar.
      </div>
    );
  }

  const totalLeads = combinations.reduce((sum, combo) => sum + combo.leads, 0);
  const shown = combinations.slice(0, VISIBLE_COMBINATIONS);
  const rest = combinations.slice(VISIBLE_COMBINATIONS);
  const restLeads = rest.reduce((sum, combo) => sum + combo.leads, 0);
  const sideMax = Math.max(...shown.map((combo) => combo.leads), restLeads);
  const fieldLeads = fields.map((_, index) =>
    combinations.filter((combo) => combo.present[index] === true).reduce((sum, combo) => sum + combo.leads, 0),
  );
  const topMax = Math.max(...fieldLeads, 1);
  const leader = shown[0];
  const leaderNames = leader ? joinNames(comboNames(leader.present)) : '';
  const leaderShare = leader && totalLeads > 0 ? leader.leads / totalLeads : null;

  const summary =
    `Matriz de combinações de campos preenchidos em ${formatInt(totalLeads)} leads, com as ${String(shown.length)} maiores combinações e ${String(rest.length)} agrupadas em demais. ` +
    (leader ? `A maior combinação é ${leaderNames}, com ${formatInt(leader.leads)} leads.` : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="table" style={style}>
      {leader && leaderShare !== null ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs font-medium text-text-secondary">
          A maior combinação é só {leaderNames}: {formatInt(leader.leads)} leads, {formatPercent(leaderShare, 0)} do total.
        </p>
      ) : null}
      <div aria-hidden className="grid shrink-0 items-end" style={{ gridTemplateColumns: GRID_COLUMNS }}>
        {fieldLeads.map((leads, index) => (
          <div className="flex flex-col items-center justify-end gap-1" key={fields[index]?.id ?? index}>
            <span className="kpi-number text-[11px] font-semibold text-text-secondary">{formatInt(leads)}</span>
            <span className="block w-4 bg-chart-1" style={{ height: Math.max(2, (leads / topMax) * TOP_BAR_MAX) }} />
          </div>
        ))}
        <span className="pl-3 text-[11px] text-text-muted">Leads por campo</span>
      </div>
      <div className="grid shrink-0 border-b border-line-strong pt-1 pb-1.5" role="row" style={{ gridTemplateColumns: GRID_COLUMNS }}>
        {fields.map((field) => (
          <span className="text-center text-[11px] font-medium text-text-secondary" key={field.id} role="columnheader">
            {field.name}
          </span>
        ))}
        <span className="pl-3 text-[11px] font-medium text-text-secondary" role="columnheader">
          Leads na combinação
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col" role="rowgroup">
        {shown.map((combo, rowIndex) => {
          const first = combo.present.indexOf(true);
          const last = combo.present.lastIndexOf(true);
          return (
            <div
              aria-label={`${joinNames(comboNames(combo.present))}: ${formatInt(combo.leads)} leads`}
              className="relative grid items-center border-b border-line-subtle"
              key={combo.key}
              role="row"
              style={{ gridTemplateColumns: GRID_COLUMNS, height: ROW_HEIGHT }}
            >
              {last > first ? (
                <span
                  aria-hidden
                  className="absolute rounded-full bg-chart-1"
                  style={{ height: LINK_THICKNESS, left: CELL_WIDTH * (first + 0.5), top: (ROW_HEIGHT - LINK_THICKNESS) / 2, width: CELL_WIDTH * (last - first) }}
                />
              ) : null}
              {combo.present.map((isPresent, index) => (
                <span aria-hidden className="relative flex items-center justify-center" key={fields[index]?.id ?? index} role="cell">
                  <span className={cn('block rounded-full', isPresent ? 'bg-chart-1' : 'bg-text-muted')} style={{ height: isPresent ? DOT_SIZE : ABSENT_DOT_SIZE, width: isPresent ? DOT_SIZE : ABSENT_DOT_SIZE }} />
                </span>
              ))}
              <span className="flex items-center gap-2 pl-3" role="cell">
                <span className="block h-3 bg-chart-1" style={{ width: Math.max(2, (combo.leads / sideMax) * SIDE_BAR_MAX) }} />
                <span className={cn('kpi-number text-[11px] text-text-secondary', rowIndex === 0 ? 'font-bold' : 'font-semibold')}>{formatInt(combo.leads)}</span>
              </span>
            </div>
          );
        })}
        {rest.length > 0 ? (
          <div className="grid items-center border-b border-line-subtle" role="row" style={{ gridTemplateColumns: GRID_COLUMNS, height: ROW_HEIGHT }}>
            <span className="col-span-6 text-[11px] text-text-muted" role="cell">
              Demais {formatInt(rest.length)} combinações, de até {formatInt(rest[0]?.leads ?? 0)} leads cada
            </span>
            <span className="flex items-center gap-2 pl-3" role="cell">
              <span className="block h-3 bg-text-muted" style={{ width: Math.max(2, (restLeads / sideMax) * SIDE_BAR_MAX) }} />
              <span className="kpi-number text-[11px] font-semibold text-text-secondary">{formatInt(restLeads)}</span>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
