import { Filter } from 'lucide-react';
import { Area, ComposedChart, Line, ReferenceArea, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyInflowVsTarget } from './data';

/**
 * Área de diferença contra uma meta variável, com cruzamentos frequentes e meses sem meta
 * definida: os pontos de cruzamento entram por interpolação para a cor nunca pintar o lado
 * errado, e o mês sem meta quebra a área em vez de repetir a última meta conhecida. Real e
 * meta são nomeados por legenda, junto da área acima e abaixo do sinal.
 */
export interface MonthlyInflowDifferenceProps {
  readonly data?: readonly MonthlyInflowVsTarget[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 12, right: 12, bottom: 0, left: 0 } as const;
const Y_AXIS_WIDTH = 80;
const GRID_TARGET_COUNT = 4;
const BAND_OPACITY = 0.32;
const GAP_HALF_STEP = 0.5;

interface Band {
  readonly x: number;
  readonly inflow: number;
  readonly target: number | null;
  readonly bandAbove: readonly [number, number] | null;
  readonly bandBelow: readonly [number, number] | null;
}

function toBands(inflow: number, target: number): Pick<Band, 'bandAbove' | 'bandBelow'> {
  return { bandAbove: [target, Math.max(inflow, target)], bandBelow: [Math.min(inflow, target), target] };
}

/**
 * Insere o cruzamento exato entre dois meses de meta definida e sinal trocado (Ponto delicado),
 * e não interpola através de um mês com meta ausente: ali a faixa simplesmente não existe.
 */
function expandWithCrossings(rows: readonly MonthlyInflowVsTarget[]): readonly Band[] {
  const expanded: Band[] = [];
  rows.forEach((row, index) => {
    const bands = row.target === null ? { bandAbove: null, bandBelow: null } : toBands(row.inflow, row.target);
    expanded.push({ x: index, inflow: row.inflow, target: row.target, ...bands });
    const next = rows[index + 1];
    if (!next || row.target === null || next.target === null) return;
    const diffHere = row.inflow - row.target;
    const diffNext = next.inflow - next.target;
    if ((diffHere > 0) === (diffNext > 0) || diffHere === diffNext) return;
    const fraction = diffHere / (diffHere - diffNext);
    const value = row.inflow + fraction * (next.inflow - row.inflow);
    expanded.push({ x: index + fraction, inflow: value, target: value, ...toBands(value, value) });
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

export default function MonthlyInflowDifference({ data = defaultData, height, className }: MonthlyInflowDifferenceProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há captação para comparar com a meta.</span>
      </div>
    );
  }

  const rows = expandWithCrossings(data);
  const crossingCount = rows.filter((row) => !Number.isInteger(row.x)).length;
  const gapIndexes = data.reduce<number[]>((acc, row, index) => (row.target === null ? [...acc, index] : acc), []);
  const gapNames = gapIndexes.map((index) => formatMonthShort(data[index]!.month)).join(' e ');
  const ticks = computeTicks(Math.max(...data.map((row) => Math.max(row.inflow, row.target ?? 0))));
  const domainTop = ticks[ticks.length - 1] ?? 0;

  const definedRows = data.filter((row): row is { month: string; inflow: number; target: number } => row.target !== null);
  const aboveCount = definedRows.filter((row) => row.inflow > row.target).length;
  const belowCount = definedRows.filter((row) => row.inflow < row.target).length;
  const total = definedRows.reduce((sum, row) => sum + (row.inflow - row.target), 0);
  const sign = total >= 0 ? '+' : '−';

  const summary = [
    `Gráfico de área com captação líquida mensal contra a meta, que não foi definida em ${gapNames || 'nenhum mês'}.`,
    `A diferença cruza de lado ${String(crossingCount)} vezes ao longo do ano.`,
    `Nos meses com meta: ${String(aboveCount)} acima e ${String(belowCount)} abaixo, saldo ${sign}${formatCurrencyCompact(Math.abs(total))}.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 flex-col gap-1 text-xs text-text-secondary">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 rounded-full" style={{ backgroundColor: 'var(--chart-1)' }} />
            Captação real
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
        <p className="truncate">
          Meta não definida em {gapNames || 'nenhum mês'}; nos demais, {formatInt(aboveCount)} meses acima e{' '}
          {formatInt(belowCount)} abaixo.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="x"
              domain={[0, data.length - 1]}
              interval={0}
              tickFormatter={(value: number) => formatMonthShort(data[value]?.month ?? '')}
              tickMargin={8}
              ticks={data.map((_, index) => index).filter((index) => index % 2 === 0)}
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
            {gapIndexes.length > 0 ? (
              <ReferenceArea
                fill="var(--surface-sunken)"
                ifOverflow="extendDomain"
                x1={(gapIndexes[0] ?? 0) - GAP_HALF_STEP}
                x2={(gapIndexes[gapIndexes.length - 1] ?? 0) + GAP_HALF_STEP}
              />
            ) : null}
            <Area connectNulls={false} dataKey="bandAbove" fill="var(--positive)" fillOpacity={BAND_OPACITY} isAnimationActive={false} stroke="none" type="linear" />
            <Area connectNulls={false} dataKey="bandBelow" fill="var(--negative)" fillOpacity={BAND_OPACITY} isAnimationActive={false} stroke="none" type="linear" />
            <Line connectNulls={false} dataKey="target" dot={false} isAnimationActive={false} stroke="var(--text-muted)" strokeDasharray="4 4" type="linear" />
            <Line dataKey="inflow" dot={false} isAnimationActive={false} stroke="var(--chart-1)" strokeWidth={2} type="linear" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
