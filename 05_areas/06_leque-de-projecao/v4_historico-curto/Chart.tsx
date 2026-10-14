import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, monthsOfHistory as defaultMonthsOfHistory, todayMonth as defaultTodayMonth, type ActiveContractMonth } from './data';

/**
 * Leque de projeção com histórico curto: com menos de 6 meses de real, o horizonte projetado
 * é truncado em 3 meses em vez dos 5 de costume, porque a faixa já abre demais. A borda
 * inferior nunca fica negativa (EIX-1): contrato ativo é uma contagem, e o menor valor possível
 * é zero, mesmo quando o bootstrap bruto projeta menos que isso.
 */
export interface ActiveContractsFanProps {
  readonly data?: readonly ActiveContractMonth[];
  readonly todayMonth?: string;
  readonly monthsOfHistory?: number;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 12, right: 90, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 40;
const DOMAIN: readonly [number, number] = [0, 300];
const TICKS = [0, 100, 200, 300] as const;
const BAND_FILL = 'var(--line-strong)';
const BAND90_OPACITY = 0.16;
const BAND50_OPACITY = 0.3;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface FanRow extends ActiveContractMonth {
  readonly band90: readonly [number, number] | null;
  readonly band50: readonly [number, number] | null;
}

function lastIndexWith(rows: readonly FanRow[], key: 'real' | 'median'): number {
  let found = -1;
  rows.forEach((row, index) => {
    if (row[key] !== null) found = index;
  });
  return found;
}

export default function ActiveContractsFan({
  data = defaultData,
  todayMonth = defaultTodayMonth,
  monthsOfHistory = defaultMonthsOfHistory,
  height,
  className,
}: ActiveContractsFanProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há contrato ativo para projetar.</span>
      </div>
    );
  }

  const rows: readonly FanRow[] = data.map((row) => ({
    ...row,
    band90: row.p05 === null || row.p95 === null ? null : [Math.max(0, row.p05), row.p95],
    band50: row.p25 === null || row.p75 === null ? null : [Math.max(0, row.p25), row.p75],
  }));
  const realEnd = lastIndexWith(rows, 'real');
  const medianEnd = lastIndexWith(rows, 'median');
  const junction = rows[realEnd];
  const last = rows[rows.length - 1]!;
  const bandWidth = last.p95 === null || last.p05 === null ? null : last.p95 - Math.max(0, last.p05);

  const summary =
    junction === undefined || bandWidth === null
      ? 'Gráfico de área com leque de projeção de contratos ativos, sem mês real medido ainda.'
      : `Gráfico de área com leque de projeção de contratos ativos, real medido em ${String(monthsOfHistory)} meses, de ${formatMonthShort(rows[0]?.month ?? '')} a ${formatMonthShort(junction.month)}. Horizonte truncado em 3 meses por causa do histórico curto. Em ${formatMonthShort(last.month)}, a faixa de 90% vai de ${formatInt(Math.max(0, last.p05 ?? 0))} a ${formatInt(last.p95 ?? 0)} contratos, amplitude de ${formatInt(bandWidth)}.`;

  const reading = `Histórico curto: ${String(monthsOfHistory)} meses medidos; horizonte truncado em 3 meses porque o leque já abre demais.`;

  const renderJunctionLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index !== realEnd || junction === undefined) return null;
    return (
      <text className="font-display" dominantBaseline="auto" fill="var(--text-primary)" fontSize={12} fontWeight={600} style={HALO} textAnchor="end" x={Number(x) - 10} y={Number(y) - 10}>
        {`real ${formatInt(junction.real ?? 0)}`}
      </text>
    );
  };

  const renderMedianEnd = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index !== medianEnd) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={600} style={HALO} textAnchor="start" x={Number(x) + 8} y={Number(y)}>
        {`mediana ${formatInt(last.median ?? 0)}`}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis axisLine={false} dataKey="month" interval={0} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatMonthShort} tickLine={false} tickMargin={8} />
            <YAxis axisLine={false} domain={[...DOMAIN]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(value: number) => formatInt(value)} ticks={[...TICKS]} width={VALUE_AXIS_WIDTH} />
            <ReferenceLine
              label={{ value: 'hoje', position: 'insideTopRight', fill: 'var(--text-muted)', fontSize: 11 }}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              x={todayMonth}
            />
            <Area connectNulls={false} dataKey="band90" fill={BAND_FILL} fillOpacity={BAND90_OPACITY} isAnimationActive={animate} stroke="none" />
            <Area connectNulls={false} dataKey="band50" fill={BAND_FILL} fillOpacity={BAND50_OPACITY} isAnimationActive={animate} stroke="none" />
            <Line connectNulls={false} dataKey="real" dot={false} isAnimationActive={false} stroke="var(--chart-1)" strokeWidth={2}>
              <LabelList content={renderJunctionLabel} dataKey="real" />
            </Line>
            <Line connectNulls={false} dataKey="median" dot={false} isAnimationActive={false} stroke="var(--chart-1)" strokeDasharray="4 4" strokeWidth={2}>
              <LabelList content={renderMedianEnd} dataKey="median" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
