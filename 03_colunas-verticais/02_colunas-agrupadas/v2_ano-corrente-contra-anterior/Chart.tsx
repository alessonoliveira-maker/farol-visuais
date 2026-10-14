import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type YearOverYearRevenue } from './data';

/**
 * Colunas agrupadas: receita reconhecida de 2026 contra o mesmo mês de 2025, ano anterior em
 * neutro e ano corrente em destaque, com a maior distância do ano na linha de leitura e os meses
 * de 2026 ainda não fechados sem coluna.
 */
export interface YearOverYearColumnsProps {
  /** Um mês por linha, com o mesmo mês de 2025 e de 2026. A ordem de entrada não importa. */
  readonly data?: readonly YearOverYearRevenue[];
  /** Altura em px quando o pai não tem altura definida (no corpo de um VisualCard, por exemplo). */
  readonly height?: number;
  readonly className?: string;
}

/** Neutro de dado: só é permitido porque o valor fica escrito no mês de referência (ACE-3). */
const PREVIOUS_FILL = 'var(--line-strong)';
const CURRENT_FILL = 'var(--chart-1)';
/** Duas linhas no rótulo direto (valor e ano, ROT-4) pedem mais respiro acima da coluna mais alta. */
const MARGIN = { top: 38, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 56;
/** Só duas séries na banda: vão curto dentro do grupo, largo entre meses (ESP-6). */
const BAR_GAP = 1;
const BAR_CATEGORY_GAP = '30%';
/**
 * Passo pela ESP-6: corpo do cartão largo ~= 894 x 274 px; disponível ~= 894 − 56 (eixo de
 * moeda) − 8 (margem) = 830 px para 12 meses, passo ~= 69,2 px. Com BAR_GAP de 1 px e
 * BAR_CATEGORY_GAP no piso de 30% (o vão mínimo, que maximiza a espessura): espessura =
 * (69,2 × 0,40 − 1) / 2 ~= 13,3 px, acima do piso de 12 px da ESP-2. Conferido no preview.svg.
 */
const BAR_MAX = 13;
const BAR_RADIUS: [number, number, number, number] = [3, 3, 0, 0];
const GRID_TICKS = 4;

function byMonth(a: YearOverYearRevenue, b: YearOverYearRevenue): number {
  return a.month.localeCompare(b.month);
}

/** O mês fechado com a maior distância entre os dois anos. */
function biggestGap(rows: readonly YearOverYearRevenue[]): YearOverYearRevenue | undefined {
  let best: YearOverYearRevenue | undefined;
  let bestGap = -Infinity;
  for (const row of rows) {
    if (row.currentYear === null) continue;
    const gap = row.currentYear - row.previousYear;
    if (gap > bestGap) {
      bestGap = gap;
      best = row;
    }
  }
  return best;
}

/** Achata a última linha com valor para o token neutro, para escrever o valor junto dela. */
function lastOf(rows: readonly YearOverYearRevenue[], key: 'previousYear' | 'currentYear'): YearOverYearRevenue | undefined {
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const row = rows[i];
    if (row && row[key] !== null) return row;
  }
  return undefined;
}

export default function YearOverYearColumns({ data = defaultData, height, className }: YearOverYearColumnsProps) {
  const animate = useAnimateOnce();
  const rows = [...data].sort(byMonth);
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita reconhecida para comparar.</span>
      </div>
    );
  }

  const gapRow = biggestGap(rows);
  const openCount = rows.filter((row) => row.currentYear === null).length;
  const lastPreviousRow = lastOf(rows, 'previousYear');
  const lastCurrentRow = lastOf(rows, 'currentYear');

  const reading =
    gapRow && gapRow.currentYear !== null && gapRow.previousYear > 0
      ? {
          month: formatMonthShort(gapRow.month),
          pct: formatPercent((gapRow.currentYear - gapRow.previousYear) / gapRow.previousYear),
          base: formatCurrencyCompact(gapRow.previousYear),
        }
      : null;

  const summary = [
    `Gráfico de colunas agrupadas com a receita reconhecida de 2026 contra 2025 em ${String(rows.length)} meses.`,
    reading ? `Maior avanço em ${reading.month}: +${reading.pct} contra ${reading.base} de 2025.` : '',
    openCount > 0 && lastCurrentRow ? `2026 apurado até ${formatMonthShort(lastCurrentRow.month)}, sem coluna nos ${String(openCount)} meses seguintes.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  /** Nomeia o ano no próprio rótulo: sem isso, um valor isolado sobre a coluna neutra (dezembro,
   * sem par de 2026 ao lado) lê como se fosse do ano corrente, porque o eixo só mostra o mês. */
  const renderPreviousLabel = ({ x, y, width, value, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row || row.month !== lastPreviousRow?.month || typeof value !== 'number') return null;
    const cx = Number(x) + Number(width) / 2;
    return (
      <g className="font-display" textAnchor="middle">
        <text fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={cx} y={Number(y) - 18}>
          {formatCurrencyCompact(value)}
        </text>
        <text fill="var(--text-muted)" fontSize={11} x={cx} y={Number(y) - 6}>
          2025
        </text>
      </g>
    );
  };

  const renderCurrentLabel = ({ x, y, width, value, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row || row.month !== lastCurrentRow?.month || typeof value !== 'number') return null;
    const cx = Number(x) + Number(width) / 2;
    return (
      <g className="font-display" textAnchor="middle">
        <text fill="var(--text-primary)" fontSize={12} fontWeight={700} x={cx} y={Number(y) - 18}>
          {formatCurrencyCompact(value)}
        </text>
        <text fill="var(--text-muted)" fontSize={11} x={cx} y={Number(y) - 6}>
          2026
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
        <li className="flex items-center gap-2.5">
          <span className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: PREVIOUS_FILL }} />
          2025
        </li>
        <li className="flex items-center gap-2.5">
          <span className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: CURRENT_FILL }} />
          2026
        </li>
        {openCount > 0 && lastCurrentRow ? (
          <li className="text-text-muted">2026 apurado até {formatMonthShort(lastCurrentRow.month)}</li>
        ) : null}
      </ul>
      {reading ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          Maior avanço em <span className="font-semibold text-text-primary">{reading.month}</span>:{' '}
          <span className="kpi-number font-medium text-positive">+{reading.pct}</span> contra{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.base}</span> de 2025
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} barGap={BAR_GAP} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              interval={0}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickLine={false}
            />
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              tickCount={GRID_TICKS}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickLine={false}
              width={VALUE_AXIS_WIDTH}
            />
            <Tooltip content={<ChartTooltip valueFormat="currencyCompact" />} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="previousYear" fill={PREVIOUS_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="2025" radius={BAR_RADIUS}>
              <LabelList content={renderPreviousLabel} dataKey="previousYear" />
            </Bar>
            <Bar dataKey="currentYear" fill={CURRENT_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="2026" radius={BAR_RADIUS}>
              <LabelList content={renderCurrentLabel} dataKey="currentYear" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
