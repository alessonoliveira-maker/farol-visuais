import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type DotItemDotProps } from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyCompact, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyFunnelRaw } from './data';

/**
 * Investimento, leads e agendas em índice base 100, cada série a partir do seu primeiro mês
 * medido. Índice calculado em TypeScript (valor sobre a base vezes 100); o rótulo final escreve
 * o índice e o valor absoluto lado a lado, e a dica reforça só o índice, que é o que a
 * ReferenceLine em 100 lê.
 */
export interface FunnelIndexProps {
  readonly data?: readonly MonthlyFunnelRaw[];
  readonly height?: number;
  readonly className?: string;
}

const SERIES = [
  { key: 'investimento', name: 'Investimento', color: 'var(--chart-1)', noun: null },
  { key: 'leads', name: 'Leads', color: 'var(--chart-3)', noun: 'leads' },
  { key: 'agendas', name: 'Agendas', color: 'var(--chart-6)', noun: 'agendas' },
] as const;

const DOMAIN: readonly [number, number] = [80, 200];
const DOMAIN_TICKS = [80, 120, 160, 200] as const;
const MARGIN = { top: 20, right: 185, bottom: 0, left: 0 } as const;
const VALUE_LABEL_GAP = 8;
const MIN_LABEL_GAP = (DOMAIN[1] - DOMAIN[0]) * 0.07;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

/** Índice sobre o primeiro valor não nulo da série; o resto vira null até lá chegar. */
function toIndex(raw: readonly (number | null)[]): (number | null)[] {
  const baseIndex = raw.findIndex((v) => v !== null);
  const base = baseIndex === -1 ? null : raw[baseIndex];
  return raw.map((v) => (v === null || !base ? null : (v / base) * 100));
}

function absoluteText(series: (typeof SERIES)[number], value: number): string {
  return series.noun ? `${formatInt(value)} ${series.noun}` : formatCurrencyCompact(value);
}

export default function FunnelIndex({ data = defaultData, height, className }: FunnelIndexProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não há série para indexar.
      </div>
    );
  }

  type SeriesKey = (typeof SERIES)[number]['key'];
  const indexByKey: Record<SeriesKey, readonly (number | null)[]> = {
    investimento: toIndex(data.map((row) => row.investimento)),
    leads: toIndex(data.map((row) => row.leads)),
    agendas: toIndex(data.map((row) => row.agendas)),
  };
  const lastIndex = data.length - 1;
  const rows = data.map((row, i) => ({
    month: row.month,
    investimentoIndex: indexByKey.investimento[i] ?? null,
    leadsIndex: indexByKey.leads[i] ?? null,
    agendasIndex: indexByKey.agendas[i] ?? null,
  }));

  const endValues = SERIES.map((s) => ({ key: s.key, value: indexByKey[s.key][lastIndex] ?? DOMAIN[0] }));
  const sortedEnds = [...endValues].sort((a, b) => a.value - b.value);
  const nudged = new Map<string, number>();
  let floor = -Infinity;
  for (const entry of sortedEnds) {
    const y = Math.max(entry.value, floor);
    nudged.set(entry.key, y);
    floor = y + MIN_LABEL_GAP;
  }
  const labeledRows = rows.map((row, i) => ({
    ...row,
    investimentoLabelY: i === lastIndex ? (nudged.get('investimento') ?? null) : null,
    leadsLabelY: i === lastIndex ? (nudged.get('leads') ?? null) : null,
    agendasLabelY: i === lastIndex ? (nudged.get('agendas') ?? null) : null,
  }));

  const leadsBaseIndex = data.findIndex((row) => row.leads !== null);
  const leadsBaseMonth = data[leadsBaseIndex]?.month;
  const last = data[lastIndex];

  const summary = last
    ? `Gráfico de linhas com investimento, leads e agendas em índice base 100 desde ${formatMonthShort(data[0]?.month ?? last.month)}. Em ${formatMonthShort(last.month)} investimento chega a ${formatInt(Math.round(indexByKey.investimento?.[lastIndex] ?? 100))}, leads a ${formatInt(Math.round(indexByKey.leads?.[lastIndex] ?? 100))} e agendas a ${formatInt(Math.round(indexByKey.agendas?.[lastIndex] ?? 100))}.`
    : 'Gráfico de linhas com índice base 100, sem meses para calcular.';

  const renderLabel = (series: (typeof SERIES)[number]) => {
    return ({ cx, cy }: DotItemDotProps) => {
      if (cx === undefined || cy === undefined || !last) return null;
      const raw = last[series.key];
      const indexValue = indexByKey[series.key]?.[lastIndex];
      if (raw === null || indexValue === undefined || indexValue === null) return null;
      return (
        <g key={series.key}>
          <circle cx={cx} cy={cy} fill={series.color} r={3} />
          <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} x={cx + VALUE_LABEL_GAP} y={cy}>
            <tspan className="font-sans">{series.name} </tspan>
            {formatInt(Math.round(indexValue))}
            <tspan className="font-sans" fill="var(--text-muted)" fontSize={11}>
              {' '}
              · {absoluteText(series, raw)}
            </tspan>
          </text>
        </g>
      );
    };
  };

  const renderBaseLabel = ({ viewBox }: { viewBox?: { x?: number; y?: number; width?: number } }) => (
    <text
      className="font-sans"
      fill="var(--text-muted)"
      fontSize={11}
      style={HALO}
      textAnchor="end"
      x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0)}
      y={(viewBox?.y ?? 0) - 7}
    >
      <tspan className="font-sans">índice </tspan>
      <tspan className="font-display">{formatInt(100)}</tspan>
      <tspan className="font-sans"> na base de cada série</tspan>
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={labeledRows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={0} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={DOMAIN} tickFormatter={formatInt} tickMargin={8} ticks={[...DOMAIN_TICKS]} width={40} />
            <Tooltip
              content={<ChartTooltip valueFormat="int" />}
              cursor={{ stroke: CURSOR_COLOR }}
              isAnimationActive={false}
              itemSorter={(item) => -(Number(item.value) || 0)}
            />
            <ReferenceLine ifOverflow="extendDomain" label={renderBaseLabel} stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1} y={100} />
            <Line activeDot={{ r: 4 }} connectNulls={false} dataKey="investimentoIndex" dot={false} isAnimationActive={animate} name="Investimento" stroke="var(--chart-1)" strokeWidth={2} type="linear" />
            <Line activeDot={{ r: 4 }} connectNulls={false} dataKey="leadsIndex" dot={false} isAnimationActive={animate} name="Leads" stroke="var(--chart-3)" strokeWidth={2} type="linear" />
            <Line activeDot={{ r: 4 }} connectNulls={false} dataKey="agendasIndex" dot={false} isAnimationActive={animate} name="Agendas" stroke="var(--chart-6)" strokeWidth={2} type="linear" />
            {SERIES.map((s) => (
              <Line activeDot={false} connectNulls={false} dataKey={`${s.key}LabelY`} dot={renderLabel(s)} isAnimationActive={false} key={`${s.key}-label`} legendType="none" stroke="none" />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {leadsBaseMonth && data[0] ? (
        <p className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
          Leads não tem {formatMonthShort(data[0].month)} medido: o índice dessa série começa em{' '}
          <span className="tabular-nums">{formatMonthShort(leadsBaseMonth)}</span>, que vale{' '}
          <span className="tabular-nums">{formatInt(100)}</span>.
        </p>
      ) : null}
    </div>
  );
}
