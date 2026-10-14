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
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyClientBalance } from './data';

/** Uma coluna por mês, para cima quando o saldo é positivo e para baixo quando é negativo. */
export interface SignedBalanceColumnsProps {
  readonly data?: readonly MonthlyClientBalance[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 24, right: 8, bottom: 20, left: 0 } as const;
/**
 * ESP-6, série única (a mesma coluna nunca soma duas séries lado a lado, só cresce para um dos
 * lados): corpo do cartão ≈ 574 x 234 px (seção 13). Disponível ≈ 574 − 36 (eixo) − 8 (margem) =
 * 530; passo = 530 / 12 meses ≈ 44,2; espessura = passo × (1 − 2 × 0,32) ≈ 44,2 × 0,36 ≈ 15,9 px,
 * arredondada para baixo por segurança de respiro. Medido no preview.svg, não só declarado aqui.
 */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 16;
const VALUE_AXIS_WIDTH = 36;
const VALUE_LABEL_GAP = 6;
const DOMAIN_STEP = 20;

interface BarShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: MonthlyClientBalance;
}

/** Sinal à mão sobre o valor absoluto: NUM-3. `formatInt` de negativo devolve hífen. */
function signed(value: number): string {
  if (value === 0) return formatInt(0);
  return `${value > 0 ? '+' : '−'}${formatInt(Math.abs(value))}`;
}

/** Arredonda para fora no múltiplo de `step`: o domínio termina na primeira linha de grade além
 * do maior valor de cada lado (EIX-4), sem depender do domínio padrão `[0, 'auto']` do Recharts,
 * que cortaria o lado negativo. */
function roundOut(value: number, step: number): number {
  const sign = value < 0 ? -1 : 1;
  return sign * Math.ceil(Math.abs(value) / step) * step;
}

export default function SignedBalanceColumns({ data = defaultData, height, className }: SignedBalanceColumnsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não há saldo de clientes registrado no período.
      </div>
    );
  }

  const best = data.reduce((max, row) => (row.balance > max.balance ? row : max), data[0]!);
  const worst = data.reduce((min, row) => (row.balance < min.balance ? row : min), data[0]!);
  const positives = data.filter((row) => row.balance > 0).length;
  const negatives = data.filter((row) => row.balance < 0).length;
  const domainMax = roundOut(Math.max(0, ...data.map((row) => row.balance)), DOMAIN_STEP);
  const domainMin = roundOut(Math.min(0, ...data.map((row) => row.balance)), DOMAIN_STEP);

  const summary =
    `Gráfico de colunas positivas e negativas com o saldo mensal de clientes, novos menos perdidos, ` +
    `em ${String(data.length)} meses. ${String(positives)} meses tiveram saldo positivo e ${String(negatives)} negativo. ` +
    `O melhor mês foi ${formatMonthShort(best.month)}, com ${signed(best.balance)}; o pior foi ${formatMonthShort(worst.month)}, com ${signed(worst.balance)}.`;

  const renderBar = ({ x = 0, y = 0, width = 0, height: barHeight = 0, payload }: BarShapeProps): ReactElement | null => {
    if (!payload) return null;
    const fill = payload.balance >= 0 ? 'var(--positive)' : 'var(--negative)';
    // Recharts devolve `height` com sinal (negativo para baixo do zero): o topo do retângulo é o
    // menor dos dois pixels, nunca `y` puro, senão a barra negativa nasce invertida.
    const top = Math.min(y, y + barHeight);
    return <rect fill={fill} height={Math.max(Math.abs(barHeight), 1)} rx={3} width={width} x={x} y={top} />;
  };

  const renderValue = ({ x, y, width, height: barHeight, value }: LabelProps): ReactElement | null => {
    const num = typeof value === 'number' ? value : Number(value ?? 0);
    const cx = Number(x) + Number(width) / 2;
    const yNum = Number(y);
    const hNum = Number(barHeight);
    const top = Math.min(yNum, yNum + hNum);
    const bottom = Math.max(yNum, yNum + hNum);
    const above = num >= 0;
    const ty = above ? top - VALUE_LABEL_GAP : bottom + VALUE_LABEL_GAP + 9;
    return (
      <text
        className="font-display"
        fill={above ? 'var(--positive)' : 'var(--negative)'}
        fontSize={12}
        fontWeight={500}
        textAnchor="middle"
        x={cx}
        y={ty}
      >
        {signed(num)}
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    if (!props.active || !props.payload) return null;
    const payload = props.payload.map((entry) => ({
      ...entry,
      name: 'Saldo',
      value: typeof entry.value === 'number' ? signed(entry.value) : String(entry.value ?? ''),
    }));
    return <ChartTooltip active={props.active} label={typeof props.label === 'string' ? props.label : ''} labelFormat="month" payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Melhor mês <span className="font-semibold text-positive">{formatMonthShort(best.month)}</span>, {signed(best.balance)}; pior mês{' '}
        <span className="font-semibold text-negative">{formatMonthShort(worst.month)}</span>, {signed(worst.balance)}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...data]} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} allowDecimals={false} domain={[domainMin, domainMax]} tickCount={4} tickFormatter={formatInt} width={VALUE_AXIS_WIDTH} />
            <ReferenceLine stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="balance" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar}>
              <LabelList content={renderValue} dataKey="balance" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
