import { Filter } from 'lucide-react';
import { Area, ComposedChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyRevenueVsTarget } from './data';

/**
 * Área de diferença contra uma meta que varia mês a mês: duas faixas, uma acima e outra abaixo
 * da meta, com o ponto exato de cruzamento inserido por interpolação para a cor nunca pintar o
 * lado errado entre dois meses. A receita real e a meta são nomeadas por legenda, junto da área
 * acima e abaixo: nada aqui depende só do matiz para dizer quem está por cima.
 */
export interface MonthlyRevenueDifferenceProps {
  readonly data?: readonly MonthlyRevenueVsTarget[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 12, right: 12, bottom: 0, left: 0 } as const;
const Y_AXIS_WIDTH = 80;
const GRID_TARGET_COUNT = 4;
const BAND_OPACITY = 0.32;

interface Band {
  readonly x: number;
  readonly revenue: number;
  readonly target: number;
  readonly bandAbove: readonly [number, number];
  readonly bandBelow: readonly [number, number];
}

function toBands(revenue: number, target: number): Pick<Band, 'bandAbove' | 'bandBelow'> {
  return { bandAbove: [target, Math.max(revenue, target)], bandBelow: [Math.min(revenue, target), target] };
}

/**
 * Insere o ponto exato de cruzamento por interpolação linear entre dois meses de sinal
 * trocado, para a faixa nunca pintar um triângulo do lado errado (Ponto delicado do modelo).
 */
function expandWithCrossings(rows: readonly MonthlyRevenueVsTarget[]): readonly Band[] {
  const expanded: Band[] = [];
  rows.forEach((row, index) => {
    expanded.push({ x: index, revenue: row.revenue, target: row.target, ...toBands(row.revenue, row.target) });
    const next = rows[index + 1];
    if (!next) return;
    const diffHere = row.revenue - row.target;
    const diffNext = next.revenue - next.target;
    if ((diffHere > 0) === (diffNext > 0) || diffHere === diffNext) return;
    const fraction = diffHere / (diffHere - diffNext);
    const value = row.revenue + fraction * (next.revenue - row.revenue);
    expanded.push({ x: index + fraction, revenue: value, target: value, ...toBands(value, value) });
  });
  return expanded;
}

/** 3 a 5 linhas de grade a partir do zero (EIX-1, EIX-4). */
function computeTicks(maxValue: number, targetCount = GRID_TARGET_COUNT): readonly number[] {
  const roughStep = maxValue / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const topTick = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= topTick + step / 2; value += step) ticks.push(Math.round(value));
  return ticks;
}

export default function MonthlyRevenueDifference({ data = defaultData, height, className }: MonthlyRevenueDifferenceProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita para comparar com a meta.</span>
      </div>
    );
  }

  const rows = expandWithCrossings(data);
  const ticks = computeTicks(Math.max(...data.map((row) => Math.max(row.revenue, row.target))));
  const domainTop = ticks[ticks.length - 1] ?? 0;
  const total = data.reduce((sum, row) => sum + (row.revenue - row.target), 0);
  const sign = total >= 0 ? '+' : '−';

  let lastBelowIndex = -1;
  data.forEach((row, index) => {
    if (row.revenue < row.target) lastBelowIndex = index;
  });
  const regime =
    lastBelowIndex === -1
      ? 'Receita acima da meta o período inteiro.'
      : lastBelowIndex === data.length - 1
        ? 'Receita abaixo da meta até o fim do período.'
        : `Receita abaixo da meta até ${formatMonthShort(data[lastBelowIndex]!.month)}, acima da meta dali em diante.`;

  const summary = [
    `Gráfico de área com receita e meta mensal variável de ${formatInt(data.length)} meses, com a diferença pintada de uma cor acima da meta e outra abaixo.`,
    regime,
    `Saldo acumulado: ${sign}${formatCurrencyCompact(Math.abs(total))}.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 flex-col gap-1 text-xs text-text-secondary">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 rounded-full" style={{ backgroundColor: 'var(--chart-1)' }} />
            Receita real
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 border-t border-dashed" style={{ borderColor: 'var(--text-muted)' }} />
            Meta
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: 'var(--positive)' }} />
            Acima da meta
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: 'var(--negative)' }} />
            Abaixo da meta
          </span>
          <span className="kpi-number ml-auto font-medium text-text-primary">
            saldo {sign}
            {formatCurrencyCompact(Math.abs(total))}
          </span>
        </p>
        <p className="truncate">{regime}</p>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="x"
              domain={[0, data.length - 1]}
              interval={1}
              tickFormatter={(value: number) => formatMonthShort(data[value]?.month ?? '')}
              tickMargin={8}
              ticks={data.map((_, index) => index)}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, domainTop]}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              ticks={[...ticks]}
              width={Y_AXIS_WIDTH}
            />
            <Area connectNulls={false} dataKey="bandAbove" fill="var(--positive)" fillOpacity={BAND_OPACITY} isAnimationActive={animate} stroke="none" type="linear" />
            <Area connectNulls={false} dataKey="bandBelow" fill="var(--negative)" fillOpacity={BAND_OPACITY} isAnimationActive={animate} stroke="none" type="linear" />
            <Line dataKey="target" dot={false} isAnimationActive={false} stroke="var(--text-muted)" strokeDasharray="4 4" type="linear" />
            <Line dataKey="revenue" dot={false} isAnimationActive={false} stroke="var(--chart-1)" strokeWidth={2} type="linear" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
