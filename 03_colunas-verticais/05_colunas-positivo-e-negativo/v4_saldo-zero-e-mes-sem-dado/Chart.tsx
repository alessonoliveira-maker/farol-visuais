import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyBalanceOrGap } from './data';

/** Coluna por mês, com o zero medido desenhado como traço e o mês sem apuração vazio. */
export interface SignedBalanceWithGapsProps {
  readonly data?: readonly MonthlyBalanceOrGap[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 24, right: 8, bottom: 20, left: 0 } as const;
/**
 * ESP-6, série única: corpo do cartão ≈ 574 x 234 px. Disponível ≈ 574 − 36 (eixo) − 8 (margem) =
 * 530; passo = 530 / 12 meses ≈ 44,2; espessura = passo × (1 − 2 × 0,32) ≈ 44,2 × 0,36 ≈ 15,9 px.
 */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 16;
const VALUE_AXIS_WIDTH = 36;
const VALUE_LABEL_GAP = 6;
const ZERO_MARK_HEIGHT = 2;
const GAP_MARK_HEIGHT = 10;
const DOMAIN_STEP = 10;

interface BarShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: MonthlyBalanceOrGap;
}

function roundOut(value: number, step: number): number {
  const sign = value < 0 ? -1 : 1;
  return sign * Math.ceil(Math.abs(value) / step) * step;
}

function signed(value: number): string {
  if (value === 0) return formatInt(0);
  return `${value > 0 ? '+' : '−'}${formatInt(Math.abs(value))}`;
}

export default function SignedBalanceWithGaps({ data = defaultData, height, className }: SignedBalanceWithGapsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não há saldo de clientes registrado no período.
      </div>
    );
  }

  const measured = data.filter((row): row is { month: string; balance: number } => row.balance !== null);
  const positives = measured.filter((row) => row.balance > 0).length;
  const negatives = measured.filter((row) => row.balance < 0).length;
  const zeroes = measured.filter((row) => row.balance === 0).length;
  const gaps = data.length - measured.length;
  const domainMax = roundOut(Math.max(0, ...measured.map((row) => row.balance)), DOMAIN_STEP);
  const domainMin = roundOut(Math.min(0, ...measured.map((row) => row.balance)), DOMAIN_STEP);

  const summary =
    `Gráfico de colunas positivas e negativas com o saldo mensal de clientes em ${String(data.length)} meses. ` +
    `${String(positives)} meses positivos, ${String(negatives)} negativos, ${String(zeroes)} com saldo exatamente zero e ${String(gaps)} sem apuração.`;

  const renderBar = ({ x = 0, y = 0, width = 0, height: barHeight = 0, payload }: BarShapeProps): ReactElement | null => {
    if (!payload) return null;
    if (payload.balance === null) {
      return <rect fill="none" height={GAP_MARK_HEIGHT} rx={2} stroke="var(--text-muted)" strokeDasharray="2 2" width={width} x={x} y={y - GAP_MARK_HEIGHT / 2} />;
    }
    if (payload.balance === 0) {
      return <rect fill="var(--line-strong)" height={ZERO_MARK_HEIGHT} width={width} x={x} y={y - ZERO_MARK_HEIGHT / 2} />;
    }
    const fill = payload.balance > 0 ? 'var(--positive)' : 'var(--negative)';
    // Recharts devolve `height` com sinal (negativo para baixo do zero): o topo do retângulo é o
    // menor dos dois pixels, nunca `y` puro, senão a barra negativa nasce invertida.
    const top = Math.min(y, y + barHeight);
    return <rect fill={fill} height={Math.max(Math.abs(barHeight), 1)} rx={3} width={width} x={x} y={top} />;
  };

  const renderValue = ({ x, y, width, height: barHeight, value }: LabelProps): ReactElement | null => {
    const cx = Number(x) + Number(width) / 2;
    const num = typeof value === 'number' ? value : null;
    if (num === null) {
      return (
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={Number(y) - VALUE_LABEL_GAP}>
          {formatUnavailable()}
        </text>
      );
    }
    if (num === 0) {
      return (
        <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={500} textAnchor="middle" x={cx} y={Number(y) - VALUE_LABEL_GAP}>
          0
        </text>
      );
    }
    const yNum = Number(y);
    const hNum = Number(barHeight);
    const top = Math.min(yNum, yNum + hNum);
    const bottom = Math.max(yNum, yNum + hNum);
    const above = num > 0;
    return (
      <text
        className="font-display"
        fill={above ? 'var(--positive)' : 'var(--negative)'}
        fontSize={12}
        fontWeight={500}
        textAnchor="middle"
        x={cx}
        y={above ? top - VALUE_LABEL_GAP : bottom + VALUE_LABEL_GAP + 9}
      >
        {signed(num)}
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    if (!props.active || !props.payload) return null;
    const monthKey = typeof props.label === 'string' ? props.label : '';
    const row = data.find((item) => item.month === monthKey);
    const payload = [{ name: 'Saldo', value: row && row.balance !== null ? signed(row.balance) : formatUnavailable(), color: 'var(--chart-1)', graphicalItemId: 'saldo' }];
    return <ChartTooltip active={props.active} label={monthKey} labelFormat="month" payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {String(positives)} meses positivos, {String(negatives)} negativos, {String(zeroes)} zerado e{' '}
        <span className="font-semibold text-text-primary">{String(gaps)} sem apuração</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...data]} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} allowDecimals={false} domain={[domainMin, domainMax]} tickCount={5} tickFormatter={formatInt} width={VALUE_AXIS_WIDTH} />
            <ReferenceLine stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey={(row: MonthlyBalanceOrGap) => row.balance ?? 0} isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar}>
              <LabelList content={renderValue} dataKey={(row: MonthlyBalanceOrGap) => row.balance} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
