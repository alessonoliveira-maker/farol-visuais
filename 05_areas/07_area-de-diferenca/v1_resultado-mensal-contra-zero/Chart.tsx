import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, XAxis, YAxis, useChartHeight, useYAxisScale } from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyResult } from './data';

/**
 * Área de diferença contra o zero: o resultado mensal real pinta uma cor onde fica acima do
 * zero e outra onde fica abaixo, com o corte de cor calculado na altura exata do zero já
 * renderizado, nunca no ponto de dado mais próximo. O sinal nunca depende só da cor: o saldo do
 * período e a contagem de meses de cada lado aparecem escritos, com legenda nomeando as cores.
 */
export interface MonthlyResultDifferenceProps {
  readonly data?: readonly MonthlyResult[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 12, right: 12, bottom: 0, left: 0 } as const;
const Y_AXIS_WIDTH = 80;
const GRID_TARGET_COUNT = 4;
// Mínima da tabela do dossiê (ACE-5): --positive 0,70 (claro) e --negative 0,66 (escuro); 0,70 cobre as duas. Contorno segue opaco.
const FILL_OPACITY = 0.7;
const STROKE_WIDTH = 2;

interface ValueTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly payload?: { readonly value?: number };
}

/** Tique em uma linha só: o `<Text>` padrão do Recharts quebra "R$ -50 mil" em duas linhas e
 * desloca o grupo inteiro para a esquerda do corpo. */
function renderValueTick({ x = 0, y = 0, payload }: ValueTickProps): ReactElement {
  return (
    <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={Number(x)} y={Number(y)}>
      {formatCurrencyAxis(payload?.value ?? 0)}
    </text>
  );
}

/** De 3 a 5 linhas de grade (EIX-4), com o zero sempre caindo exatamente numa delas. */
function computeSignedTicks(
  values: readonly number[],
  targetCount = GRID_TARGET_COUNT,
): { readonly ticks: readonly number[]; readonly domain: readonly [number, number] } {
  const maxValue = Math.max(0, ...values);
  const minValue = Math.min(0, ...values);
  const range = maxValue - minValue || 1;
  const roughStep = range / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = niceNormalized * magnitude;
  const topTick = Math.ceil(maxValue / step) * step;
  const bottomTick = Math.floor(minValue / step) * step;
  const ticks: number[] = [];
  for (let value = bottomTick; value <= topTick + step / 2; value += step) ticks.push(Math.round(value));
  return { ticks, domain: [bottomTick, topTick] };
}

/**
 * Corte duro de cor na altura exata do zero, medida no eixo já renderizado via `useYAxisScale`
 * e `useChartHeight` (não na proporção entre o maior e o menor valor do dado): com
 * `gradientUnits="userSpaceOnUse"` o degradê desaparece e sobram duas cores sólidas, positiva
 * acima e negativa abaixo, qualquer que seja a escala.
 */
function ZeroSplitDefs({ id }: { readonly id: string }): ReactElement | null {
  const yScale = useYAxisScale();
  const chartHeight = useChartHeight();
  if (!yScale || chartHeight === undefined || chartHeight <= 0) return null;
  const zeroPixel = yScale(0);
  if (zeroPixel === undefined) return null;
  const offset = Math.min(1, Math.max(0, zeroPixel / chartHeight));
  return (
    <defs>
      <linearGradient gradientUnits="userSpaceOnUse" id={id} x1={0} x2={0} y1={0} y2={chartHeight}>
        <stop offset={offset} stopColor="var(--positive)" />
        <stop offset={offset} stopColor="var(--negative)" />
      </linearGradient>
    </defs>
  );
}

export default function MonthlyResultDifference({ data = defaultData, height, className }: MonthlyResultDifferenceProps) {
  const animate = useAnimateOnce();
  const gradientId = useId();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há resultado mensal para comparar com o zero.</span>
      </div>
    );
  }

  const values = data.map((row) => row.result);
  const { ticks, domain } = computeSignedTicks(values);
  const total = values.reduce((sum, value) => sum + value, 0);
  const positiveCount = values.filter((value) => value > 0).length;
  const negativeCount = values.filter((value) => value < 0).length;
  const sign = total >= 0 ? '+' : '−';

  const summary = [
    `Gráfico de área com o resultado operacional de ${String(data.length)} meses, pintado de uma cor onde fica acima do zero e de outra onde fica abaixo.`,
    `${String(positiveCount)} meses positivos e ${String(negativeCount)} negativos.`,
    `Saldo do período: ${sign}${formatCurrencyCompact(Math.abs(total))}.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: 'var(--positive)' }} />
          Positivo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: 'var(--negative)' }} />
          Negativo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 border-t" style={{ borderColor: 'var(--line-strong)' }} />
          Referência: zero
        </span>
        <span className="kpi-number ml-auto font-medium text-text-primary">
          saldo {sign}
          {formatCurrencyCompact(Math.abs(total))}
        </span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart accessibilityLayer={false} data={[...data]} margin={MARGIN}>
            <ZeroSplitDefs id={gradientId} />
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" interval={1} tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis axisLine={false} domain={[...domain]} tick={renderValueTick} tickLine={false} ticks={[...ticks]} width={Y_AXIS_WIDTH} />
            <ReferenceLine stroke="var(--line-strong)" y={0} />
            <Area
              baseValue={0}
              dataKey="result"
              fill={`url(#${gradientId})`}
              fillOpacity={FILL_OPACITY}
              isAnimationActive={animate}
              stroke={`url(#${gradientId})`}
              strokeWidth={STROKE_WIDTH}
              type="linear"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
