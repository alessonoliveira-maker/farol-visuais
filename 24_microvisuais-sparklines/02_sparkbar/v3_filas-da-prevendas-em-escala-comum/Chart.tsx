import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QueueTable } from './data';

/**
 * Tabela de filas da pré-vendas com um sparkbar por linha. Todas as células usam a mesma escala
 * (de 0 ao maior valor da tabela), então a altura absoluta se compara entre linhas. A última
 * semana vai escrita à direita; o zero medido de uma semana de recesso é um traço de 1 px na base.
 */
export interface QueueSparkbarTableProps {
  readonly data?: QueueTable;
  readonly className?: string;
}

const CELL_WIDTH = 156;
const CELL_HEIGHT = 28;
const ROW_HEIGHT = 32;
const MARGIN = { top: 2, right: 2, bottom: 1, left: 2 } as const;
const BAR_CATEGORY_GAP = '30%';
/** Largura da coluna: passo (156 − 4) / 13 = 11,7 px; espessura 11,7 × 0,4 = 4,7 px. */
const BAR_MAX = 12;
/** Piso de altura de 1 px: vale cerca de 3,8 entradas na escala de 0 a 96 (25 px úteis), então não achata filas diferentes. */
const MIN_COLUMN_HEIGHT = 1;
const ZERO_MARK_HEIGHT = 1;
/** O traço do zero sai este tanto mais largo que a coluna, de cada lado, para ler como outra forma. */
const ZERO_MARK_OVERHANG = 3;
const COLUMNS = `minmax(0, 1fr) ${String(CELL_WIDTH)}px 3rem`;

interface WeekPoint {
  readonly week: string;
  readonly entries: number;
}

interface ColumnShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: WeekPoint;
}

function sumOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : values.reduce((acc, value) => acc + value, 0);
}

/** Zero medido vira traço cinza de 1 px na base; valor positivo ganha altura mínima de 1 px. */
function renderColumn({ x = 0, y = 0, width = 0, height = 0, payload }: ColumnShapeProps): ReactElement | null {
  if (!payload) return null;
  // O pacote preserva forma própria de dimensão zero (REC-11): sem este shape o zero medido não desenharia.
  if (payload.entries === 0) {
    return <rect fill="var(--text-muted)" height={ZERO_MARK_HEIGHT} width={width + 2 * ZERO_MARK_OVERHANG} x={x - ZERO_MARK_OVERHANG} y={y - ZERO_MARK_HEIGHT} />;
  }
  const size = Math.max(height, MIN_COLUMN_HEIGHT);
  return <rect fill="var(--chart-1)" height={size} rx={1} width={width} x={x} y={y + height - size} />;
}

export default function QueueSparkbarTable({ data = defaultData, className }: QueueSparkbarTableProps) {
  const animate = useAnimateOnce();

  if (data.rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma fila neste recorte: não houve entrada registrada no período.</span>
      </div>
    );
  }

  const rows = data.rows
    .map((row) => ({ row, total: sumOf(row.entries) ?? 0, last: row.entries.at(-1) ?? null }))
    .sort((a, b) => b.total - a.total || a.row.name.localeCompare(b.row.name, 'pt-BR'));
  const tableMax = data.rows.reduce((top, row) => Math.max(top, ...row.entries), 0);
  const weekCount = formatInt(data.weeks.length);
  const leader = rows.at(0);
  const smallest = rows.at(-1);
  const recess = data.recessWeeks.map((week) => formatDate(week)).join(' e ');

  const summary =
    leader && smallest
      ? `Tabela com ${formatInt(rows.length)} filas da pré-vendas e as entradas de ${weekCount} semanas, na mesma escala de 0 a ${formatInt(tableMax)}. ${leader.row.name} lidera, com ${formatInt(leader.total)} entradas; ${smallest.row.name} tem a menor, com ${formatInt(smallest.total)}.`
      : '';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img">
      <div
        aria-hidden
        className="grid items-baseline gap-x-4 text-[0.6875rem] leading-none text-text-muted"
        style={{ gridTemplateColumns: COLUMNS }}
      >
        <span>Fila, da maior para a menor soma</span>
        <span>
          mesma escala, máx. <span className="kpi-number">{formatInt(tableMax)}</span>
        </span>
        <span className="text-right">Última</span>
      </div>

      <ul aria-hidden className="mt-2 min-h-0 flex-1">
        {rows.map(({ row, last }) => {
          const points: WeekPoint[] = data.weeks.map((week, index) => ({ week, entries: row.entries[index] ?? 0 }));
          return (
            <li className="grid items-center gap-x-4" key={row.id} style={{ gridTemplateColumns: COLUMNS, height: ROW_HEIGHT }}>
              <span className="min-w-0 text-xs text-text-secondary">{row.name}</span>
              <div style={{ width: CELL_WIDTH, height: CELL_HEIGHT }}>
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={points} margin={MARGIN}>
                    {/* Domínio comum a todas as filas: do zero ao maior valor da tabela (EIX-9). */}
                    <XAxis dataKey="week" hide />
                    <YAxis domain={[0, tableMax]} hide />
                    <Bar dataKey="entries" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderColumn} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <span className="kpi-number text-right text-xs font-semibold text-text-primary tabular-nums">
                {last === null ? '' : formatInt(last)}
              </span>
            </li>
          );
        })}
      </ul>

      {recess ? (
        <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] leading-none text-text-muted">
          Traço cinza e largo na base: zero medido na semana de recesso de {recess}.
        </p>
      ) : null}
    </div>
  );
}
