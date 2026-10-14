import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  usePlotArea,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type BridgeItem } from './data';

/** Ponte entre dois valores: colunas de início e fim ancoradas, passos flutuantes entre elas. */
export interface BridgeWaterfallProps {
  readonly data?: readonly BridgeItem[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 24, right: 8, bottom: 0, left: 8 } as const;
/**
 * ESP-6, série única: corpo ≈ 574 x 225 px (seção 13). Sem eixo de valor (todo valor vem escrito,
 * ROT-2), sobram 574 − 16 = 558 px; 6 colunas dão passo = 93 px; barra = min(24, 93 × (1 − 2 × 0,32)
 * ≈ 33,5) = 24 px.
 */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const CATEGORY_AXIS_HEIGHT = 28;
const LABEL_GAP = 6;
const ZERO_MARK = 2;
const CORNER = 3;

interface BridgeRow extends BridgeItem {
  readonly low: number;
  readonly high: number;
  readonly end: number;
  readonly range: readonly [number, number];
  readonly isLast: boolean;
}

interface StepShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: BridgeRow;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signedCompact(value: number): string {
  if (value === 0) return formatCurrencyAxis(0);
  return `${value > 0 ? '+' : '−'}${formatCurrencyAxis(Math.abs(value))}`;
}

/** Cada passo nasce onde o anterior terminou; total reancora no valor dele. */
function buildRows(items: readonly BridgeItem[]): readonly BridgeRow[] {
  let running = 0;
  return items.map((item, index) => {
    const start = item.kind === 'total' ? 0 : running;
    const end = item.kind === 'total' ? item.value : running + item.value;
    const low = Math.min(start, end);
    const high = Math.max(start, end);
    running = end;
    return { ...item, low, high, end, range: [low, high], isLast: index === items.length - 1 };
  });
}

/** Quanto a soma dos passos erra o fim menos o início; `null` sem início, fim ou passos. */
function closureGap(items: readonly BridgeItem[]): number | null {
  const first = items[0];
  const last = items[items.length - 1];
  const steps = items.filter((item) => item.kind === 'step');
  if (!first || !last || first.kind !== 'total' || last.kind !== 'total' || steps.length === 0) return null;
  const sum = steps.reduce((acc, item) => acc + item.value, 0);
  return last.value - first.value - sum;
}

/**
 * O shape desenha tudo da coluna: retângulo, rótulo e conector até a coluna seguinte. O rótulo mora
 * aqui e não num LabelList porque o zero medido (REC-11) não pode perder o texto, e a largura da
 * banda vem de usePlotArea, que só funciona dentro de um componente, não numa função de shape.
 */
function BridgeStep({ x = 0, y = 0, width = 0, height = 0, payload, count }: StepShapeProps & { readonly count: number }): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  const isTotal = payload.kind === 'total';
  const isZero = !isTotal && payload.value === 0;
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const fill = isTotal ? 'var(--chart-1)' : payload.value >= 0 ? 'var(--positive)' : 'var(--negative)';
  const levelY = !isTotal && payload.value < 0 ? bottom : top;
  const band = plot ? plot.width / count : 0;
  const text = isTotal ? formatCurrencyAxis(payload.value) : signedCompact(payload.value);
  const textFill = isTotal ? 'var(--text-primary)' : isZero ? 'var(--text-muted)' : fill;
  return (
    <g>
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={levelY} y2={levelY} />
      ) : null}
      {isZero ? (
        <rect fill="var(--text-secondary)" height={ZERO_MARK} width={width} x={x} y={levelY - ZERO_MARK / 2} />
      ) : (
        <rect fill={fill} height={Math.max(bottom - top, 1)} rx={CORNER} width={width} x={x} y={top} />
      )}
      <text className="font-display" fill={textFill} fontSize={12} fontWeight={isTotal ? 600 : 500} textAnchor="middle" x={x + width / 2} y={top - LABEL_GAP}>
        {text}
      </text>
    </g>
  );
}

export default function BridgeWaterfall({ data = defaultData, height, className }: BridgeWaterfallProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum passo neste recorte: não há receita registrada para montar a ponte.
      </div>
    );
  }

  const rows = buildRows(data);
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  const gap = closureGap(data);
  const steps = rows.filter((row) => row.kind === 'step');
  const delta = last.value - first.value;
  const peak = rows.reduce((max, row) => Math.max(max, row.high), 0);

  const stepText = steps.map((row) => `${row.label.toLowerCase()} ${signedCompact(row.value)}`).join(', ');
  const summary =
    `Gráfico de cascata da receita reconhecida: de ${formatCurrencyAxis(first.value)} em ${first.label} ` +
    `para ${formatCurrencyAxis(last.value)} em ${last.label}, variação de ${signedCompact(delta)}. Passos: ${stepText}.`;
  const reading =
    first.value === 0
      ? `${signedCompact(delta)} sem base medida em ${first.label}`
      : `${signedCompact(delta)} (${delta >= 0 ? '+' : '−'}${formatPercent(Math.abs(delta) / first.value, 0)}) contra ${formatCurrencyAxis(first.value)} em ${first.label}`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as BridgeRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const color = row.kind === 'total' ? 'var(--chart-1)' : row.value >= 0 ? 'var(--positive)' : 'var(--negative)';
    const payload =
      row.kind === 'total'
        ? [{ ...base, color, name: 'Valor exato', value: formatCurrency(row.value, 0) }]
        : [
            { ...base, color, name: 'Variação', value: `${row.value < 0 ? '−' : row.value > 0 ? '+' : ''}${formatCurrency(Math.abs(row.value), 0)}` },
            { ...base, color: 'var(--text-muted)', name: 'Acumulado após o passo', value: formatCurrency(row.end, 0) },
          ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs font-medium text-text-secondary">
        Receita {reading}
        {gap !== null && gap !== 0 ? `; os passos não fecham em ${signedCompact(gap)}` : ''}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="label" height={CATEGORY_AXIS_HEIGHT} interval={0} tickMargin={8} />
            <YAxis domain={[0, peak]} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <BridgeStep {...props} count={rows.length} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
