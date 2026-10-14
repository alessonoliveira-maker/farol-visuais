import { Filter } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { currentMonth as defaultCurrentMonth, data as defaultData, previousMonth as defaultPreviousMonth, type OriginRing } from './data';

/**
 * Dois anéis concêntricos com o mesmo conjunto de origens em dois meses: interno atenuado para o
 * mês anterior, externo em cor cheia para o mês atual. O anel externo ocupa mais área que o
 * interno para a mesma fração (efeito polar); por isso o percentual de cada mês vai sempre
 * escrito na legenda, nunca só na área do arco.
 */
export interface TwoPeriodDonutProps {
  readonly data?: readonly OriginRing[];
  readonly previousMonth?: string;
  readonly currentMonth?: string;
  readonly height?: number;
  readonly className?: string;
}

const START_ANGLE = 90;
const END_ANGLE = -270;
/** Miolo alargado (ACE-3): o hole em 30% deixava pouca margem para o rótulo central sem cruzar o
 * anel interno; em 38% o texto cabe com folga nos dois temas. */
const INNER_RADIUS_PREVIOUS = '38%';
const OUTER_RADIUS_PREVIOUS = '54%';
const INNER_RADIUS_CURRENT = '62%';
const OUTER_RADIUS_CURRENT = '82%';
const RING_STROKE = 'var(--surface-raised)';
/** Atenuação do anel interno: mesma cor da categoria, menos opaca (a cor pertence à categoria, COR-3). */
const PREVIOUS_OPACITY = 0.45;

function colorOf(slot: number): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** Percentual inteiro por categoria somando sempre 100, pelo método do maior resto (NUM-2). */
function toIntegerPercents(values: readonly number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map(Math.floor);
  let missing = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest);
  const result = [...floors];
  for (const { index } of order) {
    if (missing <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    missing -= 1;
  }
  return result;
}

export default function TwoPeriodDonut({
  data = defaultData,
  previousMonth = defaultPreviousMonth,
  currentMonth = defaultCurrentMonth,
  height,
  className,
}: TwoPeriodDonutProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [...data].sort((a, b) => b.current - a.current);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não há composição para comparar.</span>
      </div>
    );
  }

  const currentTotal = rows.reduce((sum, row) => sum + row.current, 0);
  const currentPercents = toIntegerPercents(rows.map((row) => row.current));
  const previousPercents = toIntegerPercents(rows.map((row) => row.previous));
  const leader = rows[0];

  const summary = `Gráfico de dois anéis concêntricos com a origem dos leads em ${formatMonthShort(previousMonth)}, no anel interno, e em ${formatMonthShort(currentMonth)}, no anel externo. ${leader ? `${leader.name} lidera com ${formatPercent((currentPercents[0] ?? 0) / 100, 0)} em ${formatMonthShort(currentMonth)}, ante ${formatPercent((previousPercents[0] ?? 0) / 100, 0)} em ${formatMonthShort(previousMonth)}` : 'Sem líder definido'}; os percentuais de cada mês estão na legenda.`;

  return (
    <figure aria-label={summary} className={cn('@container m-0 h-full w-full min-w-0', className)} role="figure" style={style}>
      <div className="flex h-full min-h-0 flex-col gap-4 @sm:flex-row @sm:items-center @sm:gap-7">
        <div aria-hidden className="relative aspect-square h-full max-h-full w-full max-w-56 shrink-0 @sm:h-full @sm:w-auto @sm:max-w-none">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                cx="50%"
                cy="50%"
                data={rows.map((row) => ({ name: row.name, value: row.previous }))}
                dataKey="value"
                endAngle={END_ANGLE}
                innerRadius={INNER_RADIUS_PREVIOUS}
                isAnimationActive={animate}
                nameKey="name"
                outerRadius={OUTER_RADIUS_PREVIOUS}
                startAngle={START_ANGLE}
                stroke={RING_STROKE}
                strokeWidth={2}
              >
                {rows.map((row) => (
                  <Cell fill={colorOf(row.slot)} fillOpacity={PREVIOUS_OPACITY} key={row.id} />
                ))}
              </Pie>
              <Pie
                cx="50%"
                cy="50%"
                data={rows.map((row) => ({ name: row.name, value: row.current }))}
                dataKey="value"
                endAngle={END_ANGLE}
                innerRadius={INNER_RADIUS_CURRENT}
                isAnimationActive={animate}
                nameKey="name"
                outerRadius={OUTER_RADIUS_CURRENT}
                startAngle={START_ANGLE}
                stroke={RING_STROKE}
                strokeWidth={2}
              >
                {rows.map((row) => (
                  <Cell fill={colorOf(row.slot)} key={row.id} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="kpi-number text-sm leading-none font-semibold text-text-primary">{formatInt(currentTotal)}</span>
            <span className="text-[11px] text-text-muted">leads no mês</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p aria-hidden className="mb-2 text-[11px] text-text-muted">
            Anel interno: {formatMonthShort(previousMonth)} · anel externo: {formatMonthShort(currentMonth)}
          </p>
          <ul className="space-y-2.5">
            {rows.map((row, index) => (
              <li className="flex min-w-0 items-center gap-2.5 leading-5" key={row.id}>
                <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: colorOf(row.slot) }} />
                <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">{row.name}</span>
                <span className="kpi-number w-10 shrink-0 text-right text-xs text-text-muted">
                  {formatPercent((previousPercents[index] ?? 0) / 100, 0)}
                </span>
                <span className="kpi-number w-10 shrink-0 text-right text-sm font-semibold text-text-primary">
                  {formatPercent((currentPercents[index] ?? 0) / 100, 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </figure>
  );
}
