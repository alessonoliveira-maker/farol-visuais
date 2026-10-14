import { Filter } from 'lucide-react';
import { Area, CartesianGrid, ComposedChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyOriginSmall } from './data';

/**
 * Área 100% da origem de lead semanal com duas semanas de total zero. O Recharts normaliza o
 * desenho por stackOffset="expand", que divide pelo total: com total zero isso é divisão por
 * zero, então a semana vira lacuna (valores null, curva quebrada) antes do render, nunca uma
 * faixa cheia inventada nem um 0% que a semana não tem. Cada semana zero leva uma ReferenceArea
 * nomeando o motivo, e a nota abaixo do gráfico conta quantas semanas ficaram sem base.
 */
export interface OriginShareWithGapsProps {
  readonly data?: readonly WeeklyOriginSmall[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 10, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 48;
const PERCENT_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
const LAYER_STROKE = 'var(--surface-raised)';
const GAP_FILL = 'var(--surface-sunken)';
/** Slots categóricos na ordem 1, 3, 6 da COR-8. */
const ORIGIN_FILL: Record<'indicacao' | 'conteudo' | 'evento', string> = {
  indicacao: 'var(--chart-1)',
  conteudo: 'var(--chart-3)',
  evento: 'var(--chart-6)',
};
const ORIGIN_LABEL: Record<'indicacao' | 'conteudo' | 'evento', string> = {
  indicacao: 'Indicação',
  conteudo: 'Conteúdo',
  evento: 'Evento',
};
const ORIGIN_KEYS = ['indicacao', 'conteudo', 'evento'] as const;

interface PlotRow {
  readonly week: string;
  readonly indicacao: number | null;
  readonly conteudo: number | null;
  readonly evento: number | null;
}

function totalOf(row: WeeklyOriginSmall): number {
  return row.indicacao + row.conteudo + row.evento;
}

/** Semana de total zero vira lacuna: os três valores somem, e a curva quebra em vez de dividir por zero. */
function toPlotRow(row: WeeklyOriginSmall): PlotRow {
  if (totalOf(row) > 0) return row;
  return { week: row.week, indicacao: null, conteudo: null, evento: null };
}

/** Uma semana por mês novo, para o eixo de tempo não colar os 16 tiques semanais (TIP-5). */
function monthlyTicks(rows: readonly WeeklyOriginSmall[]): readonly string[] {
  const ticks: string[] = [];
  let lastMonth = '';
  for (const row of rows) {
    const month = row.week.slice(0, 7);
    if (month !== lastMonth) {
      ticks.push(row.week);
      lastMonth = month;
    }
  }
  return ticks;
}

/**
 * Vão da marcação de lacuna. Eixo categórico: x1 igual a x2 não desenha nenhum retângulo, então a
 * marcação usa a semana anterior e a seguinte como bordas, cobrindo dois passos do eixo em vez de
 * um; o texto "sem lead" no centro do vão diz qual das duas é a semana sem base.
 */
function gapBounds(rows: readonly WeeklyOriginSmall[], index: number): { readonly x1: string; readonly x2: string } {
  const week = rows[index]?.week ?? '';
  const previous = rows[index - 1]?.week ?? week;
  const next = rows[index + 1]?.week ?? week;
  return { x1: previous, x2: next };
}

export default function OriginShareWithGaps({ data = defaultData, height, className }: OriginShareWithGapsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não há origem de lead para compor.</span>
      </div>
    );
  }

  const rows = [...data];
  const plotRows = rows.map(toPlotRow);
  const ticks = monthlyTicks(rows);
  const gapWeeks = rows.filter((row) => totalOf(row) === 0);
  const measured = rows.filter((row) => totalOf(row) > 0);
  const last = measured[measured.length - 1];
  const lastTotal = last ? totalOf(last) : 0;
  const lastShares = last
    ? ORIGIN_KEYS.map((key) => Math.round((last[key] / lastTotal) * 100))
    : ORIGIN_KEYS.map(() => 0);

  const summary =
    last && rows[0]
      ? `Área 100% com a origem de lead semanal de ${formatMonthShort(rows[0].week)} a ${formatMonthShort(rows[rows.length - 1]?.week ?? last.week)} de 2026. ` +
        `${formatInt(gapWeeks.length)} semanas tiveram total zero e ficaram sem base de composição. ` +
        `Na última semana com lead, ${formatMonthShort(last.week)}: ${ORIGIN_KEYS.map((key, index) => `${ORIGIN_LABEL[key]} ${formatPercent((lastShares[index] ?? 0) / 100, 0)}`).join(', ')}, com ${formatInt(lastTotal)} leads no total.`
      : 'Área 100% da origem de lead semanal, com semanas de total zero marcadas como lacuna.';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {gapWeeks.length > 0 && last ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          <span className="kpi-number font-medium text-text-primary">{formatInt(gapWeeks.length)}</span> semanas sem nenhum
          lead. Total em {formatMonthShort(last.week)}:{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(lastTotal)}</span> leads
        </p>
      ) : null}
      <ul className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        {[...ORIGIN_KEYS].reverse().map((key) => (
          <li className="flex items-center gap-1.5 text-xs leading-4" key={key}>
            <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: ORIGIN_FILL[key] }} />
            <span className="text-text-secondary">{ORIGIN_LABEL[key]}</span>
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart data={plotRows} margin={MARGIN} stackOffset="expand">
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="week"
              tickFormatter={formatMonthShort}
              tickMargin={8}
              ticks={[...ticks]}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, 1]}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              ticks={[...PERCENT_TICKS]}
              width={VALUE_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="month" valueFormat="int" />}
              cursor={{ stroke: 'var(--line-strong)' }}
              isAnimationActive={false}
            />
            {gapWeeks.map((week) => {
              const bounds = gapBounds(rows, rows.indexOf(week));
              return (
                <ReferenceArea
                  fill={GAP_FILL}
                  ifOverflow="visible"
                  key={week.week}
                  label={{ value: 'sem lead', position: 'insideTop', fill: 'var(--text-muted)', fontSize: 11 }}
                  stroke="none"
                  x1={bounds.x1}
                  x2={bounds.x2}
                />
              );
            })}
            {ORIGIN_KEYS.map((key) => (
              <Area
                connectNulls={false}
                dataKey={key}
                fill={ORIGIN_FILL[key]}
                fillOpacity={0.9}
                isAnimationActive={animate}
                key={key}
                name={ORIGIN_LABEL[key]}
                stackId="origem"
                stroke={LAYER_STROKE}
                strokeWidth={1.5}
                type="monotone"
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
