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
import { formatCurrency, formatCurrencyAxis, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyBudgetBalance } from './data';

/** Saldo da verba mês a mês: cada mês soma o que sobrou ou gastou a mais, e o acumulado pode cruzar o zero. */
export interface BudgetWaterfallProps {
  readonly data?: readonly MonthlyBudgetBalance[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 24, right: 8, bottom: 0, left: 8 } as const;
/**
 * ESP-6, série única, canvas card: corpo ≈ 574 x 241,5 px (seção 13). Sem eixo de valor (todo valor
 * vem escrito, ROT-2), sobram 574 − 16 = 558 px; 7 colunas (6 meses e o saldo final) dão passo =
 * 79,7 px; barra = min(24, 79,7 × (1 − 2 × 0,32) ≈ 28,7) = 24 px.
 */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const CATEGORY_AXIS_HEIGHT = 28;
const LABEL_GAP = 6;
const LABEL_BELOW_OFFSET = 12;
/** Vão extra embaixo do menor acumulado, em fração do intervalo, para o rótulo do passo que desce. */
const DOMAIN_FLOOR_PAD = 0.18;
const ZERO_MARK = 2;
const CORNER = 3;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface BudgetRow {
  readonly id: string;
  readonly label: string;
  readonly kind: 'total' | 'step';
  readonly value: number;
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
  readonly payload?: BudgetRow;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signedCurrency(value: number): string {
  if (value === 0) return formatCurrencyAxis(0);
  return `${value > 0 ? '+' : '−'}${formatCurrencyAxis(Math.abs(value))}`;
}

/** Cada mês nasce onde o anterior terminou; o saldo final é uma coluna ancorada no zero. */
function buildRows(items: readonly MonthlyBudgetBalance[]): readonly BudgetRow[] {
  let running = 0;
  const steps: BudgetRow[] = items.map((item) => {
    const start = running;
    running += item.balance;
    return {
      id: item.month,
      label: formatMonthShort(item.month),
      kind: 'step',
      value: item.balance,
      low: Math.min(start, running),
      high: Math.max(start, running),
      end: running,
      range: [Math.min(start, running), Math.max(start, running)],
      isLast: false,
    };
  });
  const total: BudgetRow = {
    id: 'saldo',
    label: 'Saldo final',
    kind: 'total',
    value: running,
    low: Math.min(0, running),
    high: Math.max(0, running),
    end: running,
    range: [Math.min(0, running), Math.max(0, running)],
    isLast: true,
  };
  return [...steps, total];
}

/**
 * O shape desenha tudo da coluna: retângulo, rótulo e conector até a coluna seguinte. O rótulo mora
 * aqui e não num LabelList porque o zero medido (REC-11) não pode perder o texto, e a largura da
 * banda vem de usePlotArea, que só funciona dentro de um componente.
 */
function BudgetStep({ x = 0, y = 0, width = 0, height = 0, payload, count }: StepShapeProps & { readonly count: number }): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  const isTotal = payload.kind === 'total';
  const isZero = !isTotal && payload.value === 0;
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  // O passo termina na borda de baixo quando desce: o conector sai dali e o rótulo vai para a ponta livre.
  const falls = payload.end === payload.low && payload.low !== payload.high;
  const levelY = falls ? bottom : top;
  const fill = isTotal ? 'var(--chart-1)' : payload.value > 0 ? 'var(--positive)' : 'var(--negative)';
  const textFill = isTotal ? 'var(--text-primary)' : isZero ? 'var(--text-muted)' : fill;
  const text = isTotal ? formatCurrencyAxis(payload.value) : signedCurrency(payload.value);
  const labelY = falls ? bottom + LABEL_BELOW_OFFSET + LABEL_GAP / 2 : top - LABEL_GAP;
  const band = plot ? plot.width / count : 0;
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
      <text className="font-display" fill={textFill} fontSize={12} fontWeight={isTotal ? 600 : 500} style={HALO} textAnchor="middle" x={x + width / 2} y={labelY}>
        {text}
      </text>
    </g>
  );
}

export default function BudgetWaterfall({ data = defaultData, height, className }: BudgetWaterfallProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não há saldo de verba registrado para montar a cascata.
      </div>
    );
  }

  const rows = buildRows(data);
  const steps = rows.filter((row) => row.kind === 'step');
  const final = rows[rows.length - 1]!;
  const firstStep = steps[0]!;
  const worst = steps.reduce((min, row) => (row.end < min.end ? row : min), firstStep);
  // O mês em que o acumulado passa de zero ou mais para abaixo de zero.
  const crossing = steps.find((row, index) => row.end < 0 && (index === 0 ? 0 : steps[index - 1]!.end) >= 0);
  const after = crossing ? steps.slice(steps.indexOf(crossing)) : [];
  const stayedNegative = after.length > 0 && after.every((row) => row.end < 0);
  // Domínio sobre os extremos do acumulado (não dos passos), com vão embaixo para o rótulo que desce.
  const ends = steps.map((row) => row.end);
  const hi = Math.max(0, ...ends);
  const lo = Math.min(0, ...ends);
  const floor = lo - (hi - lo) * DOMAIN_FLOOR_PAD;

  const crossText = crossing ? `cruzou o zero em ${crossing.label}` : worst.end >= 0 ? 'ficou sempre acima de zero' : 'começou abaixo de zero';
  const reading = `Saldo ${crossText} e fechou em ${formatCurrencyAxis(final.value)}; o pior foi ${formatCurrencyAxis(worst.end)} em ${worst.label}`;
  const summary =
    `Gráfico de cascata do saldo da verba de mídia em ${String(steps.length)} meses, de ${firstStep.label} a ${steps[steps.length - 1]!.label}: ` +
    `o saldo acumulado ${crossText}${stayedNegative ? ' e ficou negativo até o fim' : ''}, ` +
    `chegou a ${formatCurrencyAxis(worst.end)} em ${worst.label} e fechou em ${formatCurrencyAxis(final.value)}.`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as BudgetRow | undefined;
    // O rótulo do saldo final já diz tudo o que a dica diria (DIC-1).
    if (!props.active || !props.payload || !row || row.kind === 'total') return null;
    const base = props.payload[0]!;
    const sign = row.value < 0 ? '−' : row.value > 0 ? '+' : '';
    const payload = [
      { ...base, color: row.value >= 0 ? 'var(--positive)' : 'var(--negative)', name: 'Liberado menos investido', value: `${sign}${formatCurrency(Math.abs(row.value), 0)}` },
      { ...base, color: 'var(--text-muted)', name: 'Saldo acumulado', value: formatCurrency(row.end, 0) },
    ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs font-medium text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="label" height={CATEGORY_AXIS_HEIGHT} interval={0} tickMargin={8} />
            <YAxis domain={[floor, hi]} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <BudgetStep {...props} count={rows.length} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
