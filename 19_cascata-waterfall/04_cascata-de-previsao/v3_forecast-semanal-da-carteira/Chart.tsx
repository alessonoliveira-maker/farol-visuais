import { Filter } from 'lucide-react';
import { useId, type ReactElement } from 'react';
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  usePlotArea,
  useYAxisScale,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatDate, formatDecimal, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, weekStart as defaultWeekStart, type ForecastItem } from './data';

/** Ponte entre duas leituras de forecast: passos nomeados e totais divididos em fechado e ponderado. */
export interface ForecastChangeProps {
  readonly data?: readonly ForecastItem[];
  readonly weekStart?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Margem de cima reserva o rótulo de duas linhas do maior passo.
 * ESP-6, série única: canvas largo, corpo ≈ 894 px de largura (seção 13). Sem eixo de valor (todo
 * valor vem escrito, ROT-2), sobram 894 − 16 = 878 px; 6 colunas dão passo = 146 px; barra =
 * min(24, 146 × (1 − 2 × 0,32) ≈ 53) = 24 px.
 */
const MARGIN = { top: 36, right: 8, bottom: 0, left: 8 } as const;
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const CATEGORY_AXIS_HEIGHT = 28;
const LABEL_GAP = 6;
const CORNER = 3;
const HATCH_SIZE = 6;
const HATCH_OPACITY = 0.7;
const ZERO_MARK = 2;

interface ForecastRow extends ForecastItem {
  readonly low: number;
  readonly high: number;
  readonly end: number;
  readonly range: readonly [number, number];
  readonly isLast: boolean;
  readonly isBiggest: boolean;
}

interface StepShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: ForecastRow;
}

/** Moeda curta que mantém duas casas no milhão: R$ 2,17 mi (o compacto do Farol arredonda para uma casa). */
function money(value: number): string {
  const absolute = Math.abs(value);
  if (absolute < 1_000_000) return formatCurrencyAxis(value);
  return `${value < 0 ? '−' : ''}R$ ${formatDecimal(absolute / 1_000_000, 2)} mi`;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signedMoney(value: number): string {
  if (value === 0) return money(0);
  return `${value > 0 ? '+' : '−'}${money(Math.abs(value))}`;
}

/** Id do passo de maior módulo; `null` sem passo. Empate fica com o primeiro. */
function biggestStepId(items: readonly ForecastItem[]): string | null {
  let best: ForecastItem | null = null;
  for (const item of items) {
    if (item.kind === 'step' && (best === null || Math.abs(item.value) > Math.abs(best.value))) best = item;
  }
  return best ? best.id : null;
}

/** Cada passo nasce onde o anterior terminou; o total reancora no valor dele. */
function buildRows(items: readonly ForecastItem[]): readonly ForecastRow[] {
  let running = 0;
  const biggest = biggestStepId(items);
  return items.map((item, index) => {
    const start = item.kind === 'total' ? 0 : running;
    const end = item.kind === 'total' ? item.value : running + item.value;
    const low = Math.min(start, end);
    const high = Math.max(start, end);
    running = end;
    return { ...item, low, high, end, range: [low, high], isLast: index === items.length - 1, isBiggest: item.id === biggest };
  });
}

/** Quanto a soma dos passos erra o fim menos o início; `null` sem início, fim ou passos. */
function closureGap(items: readonly ForecastItem[]): number | null {
  const first = items[0];
  const last = items[items.length - 1];
  const steps = items.filter((item) => item.kind === 'step');
  if (!first || !last || first.kind !== 'total' || last.kind !== 'total' || steps.length === 0) return null;
  return last.value - first.value - steps.reduce((acc, item) => acc + item.value, 0);
}

/**
 * O shape desenha tudo da coluna: retângulo (dividido em fechado e ponderado nos totais), rótulo e
 * conector até a seguinte. O limite entre fechado e ponderado vem da escala do eixo (useYAxisScale).
 */
function ForecastStep({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  count,
  patternId,
}: StepShapeProps & { readonly count: number; readonly patternId: string }): ReactElement | null {
  const plot = usePlotArea();
  const yScale = useYAxisScale();
  if (!payload) return null;
  const isTotal = payload.kind === 'total';
  const isZero = !isTotal && payload.value === 0;
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const band = plot ? plot.width / count : 0;
  const cx = x + width / 2;
  const levelY = !isTotal && payload.value < 0 ? bottom : top;
  const color = isTotal ? 'var(--chart-1)' : payload.value >= 0 ? 'var(--positive)' : 'var(--negative)';
  const closedY = isTotal && payload.closed !== undefined && yScale ? yScale(payload.closed) : undefined;
  const split = typeof closedY === 'number';
  const text = isTotal ? money(payload.value) : signedMoney(payload.value);
  const valueY = payload.isBiggest ? top - LABEL_GAP - 13 : top - LABEL_GAP;
  return (
    <g>
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={levelY} y2={levelY} />
      ) : null}
      {isZero ? (
        <rect fill="var(--text-secondary)" height={ZERO_MARK} width={width} x={x} y={levelY - ZERO_MARK / 2} />
      ) : split ? (
        <g>
          <rect fill={`url(#${patternId})`} height={Math.max(bottom - top, 1)} rx={CORNER} stroke={color} strokeWidth={1} width={width} x={x} y={top} />
          <rect fill={color} height={Math.max(bottom - closedY, 1)} rx={CORNER} width={width} x={x} y={closedY} />
          <line stroke="var(--surface-raised)" strokeWidth={1.5} x1={x} x2={x + width} y1={closedY} y2={closedY} />
        </g>
      ) : (
        <rect fill={color} height={Math.max(bottom - top, 1)} rx={CORNER} width={width} x={x} y={top} />
      )}
      <text
        className="font-display"
        fill={isTotal ? 'var(--text-primary)' : color}
        fontSize={12}
        fontWeight={isTotal || payload.isBiggest ? 700 : 500}
        textAnchor="middle"
        x={cx}
        y={valueY}
      >
        {text}
      </text>
      {payload.isBiggest ? (
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={top - LABEL_GAP}>
          maior passo da semana
        </text>
      ) : null}
    </g>
  );
}

/** Amostra da legenda na forma da marca: sólida, ou hachurada com contorno. */
function Swatch({ color, hatched = false }: { readonly color: string; readonly hatched?: boolean }): ReactElement {
  return (
    <svg aria-hidden className="size-3 shrink-0" viewBox="0 0 12 12">
      <rect fill={hatched ? 'none' : color} height={11} rx={2} stroke={color} strokeWidth={1} width={11} x={0.5} y={0.5} />
      {hatched ? (
        <g stroke={color} strokeOpacity={HATCH_OPACITY} strokeWidth={1}>
          <line x1={2} x2={5} y1={11} y2={0} />
          <line x1={7} x2={10} y1={11} y2={0} />
        </g>
      ) : null}
    </svg>
  );
}

export default function ForecastChange({ data = defaultData, weekStart = defaultWeekStart, height, className }: ForecastChangeProps) {
  const animate = useAnimateOnce();
  const patternId = `hachura-${useId().replace(/:/g, '')}`;
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum passo neste recorte: não há forecast registrado para comparar as duas leituras.</span>
      </div>
    );
  }

  const rows = buildRows(data);
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  const gap = closureGap(data);
  const biggest = rows.find((row) => row.isBiggest);
  const delta = last.value - first.value;
  const peak = rows.reduce((max, row) => Math.max(max, row.high), 0);
  const weighted = last.closed === undefined ? null : last.value - last.closed;

  const stepText = rows
    .filter((row) => row.kind === 'step')
    .map((row) => `${row.label.toLowerCase()} ${signedMoney(row.value)}`)
    .join(', ');
  const summary =
    `Gráfico de cascata do forecast em ${formatDate(weekStart)}: de ${money(first.value)} para ${money(last.value)} ` +
    `(${signedMoney(delta)}). Passos: ${stepText}${biggest && biggest.value < 0 ? `; a maior queda é ${biggest.label.toLowerCase()}` : ''}.`;
  const split = last.closed !== undefined && weighted !== null ? `; ${money(last.closed)} já fechado e ${money(weighted)} ponderado` : '';
  const reading =
    first.value === 0
      ? `Forecast de ${money(last.value)}, sem base medida na leitura anterior`
      : `Forecast de ${money(last.value)}: ${signedMoney(delta)} (${delta >= 0 ? '+' : '−'}${formatPercent(Math.abs(delta) / first.value)}) contra ${money(first.value)} na leitura anterior${split}`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as ForecastRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const color = row.kind === 'total' ? 'var(--chart-1)' : row.value >= 0 ? 'var(--positive)' : 'var(--negative)';
    const payload =
      row.kind === 'total'
        ? [
            { ...base, color, name: 'Valor exato', value: formatCurrency(row.value, 0) },
            ...(row.closed === undefined
              ? []
              : [
                  { ...base, color, name: 'Ganho fechado', value: formatCurrency(row.closed, 0) },
                  { ...base, color: 'var(--text-muted)', name: 'Ponderado', value: formatCurrency(row.value - row.closed, 0) },
                ]),
          ]
        : [
            { ...base, color, name: 'Variação', value: `${row.value < 0 ? '−' : row.value > 0 ? '+' : ''}${formatCurrency(Math.abs(row.value), 0)}` },
            { ...base, color: 'var(--text-muted)', name: 'Acumulado após o passo', value: formatCurrency(row.end, 0) },
          ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        {reading}
        {gap !== null && gap !== 0 ? `; os passos não fecham em ${signedMoney(gap)}` : ''}
      </p>
      <div aria-hidden className="mb-2 mt-1 flex shrink-0 items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <Swatch color="var(--positive)" />
          aumento
        </span>
        <span className="flex items-center gap-1.5">
          <Swatch color="var(--negative)" />
          queda
        </span>
        <span className="flex items-center gap-1.5">
          <Swatch color="var(--chart-1)" />
          total fechado
        </span>
        <span className="flex items-center gap-1.5">
          <Swatch color="var(--chart-1)" hatched />
          total ponderado
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <defs>
              <pattern height={HATCH_SIZE} id={patternId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={HATCH_SIZE}>
                <rect fill="var(--surface-raised)" height={HATCH_SIZE} width={HATCH_SIZE} />
                <line stroke="var(--chart-1)" strokeOpacity={HATCH_OPACITY} strokeWidth={1.5} x1={0} x2={0} y1={0} y2={HATCH_SIZE} />
              </pattern>
            </defs>
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="label" height={CATEGORY_AXIS_HEIGHT} interval={0} tickMargin={8} />
            <YAxis domain={[0, peak]} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <ForecastStep {...props} count={rows.length} patternId={patternId} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
