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
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatDate, formatDecimal, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  cutDate as defaultCutDate,
  data as defaultData,
  plan as defaultPlan,
  projectionOrigin as defaultOrigin,
  type ForecastItem,
} from './data';

/** Projeção do período contra o plano: ponte realizado mais projetado, traço de plano e a distância dele. */
export interface PlanForecastProps {
  readonly data?: readonly ForecastItem[];
  readonly cutDate?: string;
  readonly plan?: number;
  readonly projectionOrigin?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Margem de cima reserva valor mais a palavra projeção acima do total, que sobe acima do traço de
 * plano; a de baixo, duas linhas de nome (EIX-6b); a da direita, a legenda do plano em duas linhas.
 * ESP-6, série única: corpo ≈ 574 x 225 px (seção 13). Sem eixo de valor (ROT-2), sobram
 * 574 − 8 − 72 = 494 px; 4 colunas dão passo = 123,5 px; barra = min(24, 123,5 × 0,36 ≈ 44) = 24 px.
 */
const MARGIN = { top: 34, right: 72, bottom: 40, left: 8 } as const;
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const LABEL_GAP = 6;
const NAME_GAP = 16;
const BASIS_GAP = 30;
const CORNER = 3;
const HATCH_SIZE = 6;
const HATCH_OPACITY = 0.7;
const ZERO_MARK = 2;
/** Distância máxima, em px, entre o topo da coluna e o plano em que o rótulo precisa subir acima do traço. */
const LABEL_CLEARANCE = 20;

interface PlanRow {
  readonly id: string;
  readonly label: string;
  readonly sub: string;
  readonly kind: 'step' | 'total' | 'gap';
  readonly basis: 'realizado' | 'projetado';
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
  readonly payload?: PlanRow;
}

/** Moeda curta que mantém duas casas no milhão: R$ 1,84 mi (o compacto do Farol arredonda para R$ 1,8 mi). */
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

/** Distância do plano: total menos plano; `null` sem total. Negativa quer dizer abaixo do plano. */
function planGap(items: readonly ForecastItem[], plan: number): number | null {
  const total = items.find((item) => item.kind === 'total');
  return total ? total.value - plan : null;
}

/** Colunas da ponte e, ao fim, a distância do plano como faixa entre o total e o plano. */
function buildRows(items: readonly ForecastItem[], plan: number, cutText: string): readonly PlanRow[] {
  let running = 0;
  const base: PlanRow[] = items.map((item) => {
    const start = item.kind === 'total' ? 0 : running;
    const end = item.kind === 'total' ? item.value : running + item.value;
    running = end;
    const sub = item.kind === 'total' ? 'fim do período' : item.basis === 'realizado' ? `até ${cutText}` : 'a partir do corte';
    return {
      id: item.id,
      label: item.label,
      sub,
      kind: item.kind,
      basis: item.basis,
      value: item.value,
      low: Math.min(start, end),
      high: Math.max(start, end),
      end,
      range: [Math.min(start, end), Math.max(start, end)],
      isLast: false,
    };
  });
  const gap = planGap(items, plan);
  const total = items.find((item) => item.kind === 'total');
  if (gap !== null && total) {
    base.push({
      id: 'distancia',
      label: 'Distância do plano',
      sub: 'contra o plano',
      kind: 'gap',
      basis: 'projetado',
      value: gap,
      low: Math.min(total.value, plan),
      high: Math.max(total.value, plan),
      end: plan,
      range: [Math.min(total.value, plan), Math.max(total.value, plan)],
      isLast: false,
    });
  }
  return base.map((row, index) => ({ ...row, isLast: index === base.length - 1 }));
}

/**
 * O shape desenha tudo da coluna: retângulo, rótulo, nome sob a base e conector até a seguinte. A
 * escala do eixo (useYAxisScale) diz onde o plano caiu, para o rótulo do total subir acima do traço.
 */
function PlanStep({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  count,
  patternId,
  plan,
}: StepShapeProps & { readonly count: number; readonly patternId: string; readonly plan: number }): ReactElement | null {
  const plot = usePlotArea();
  const yScale = useYAxisScale();
  if (!payload) return null;
  const isTotal = payload.kind === 'total';
  const isGap = payload.kind === 'gap';
  const isProjected = payload.basis === 'projetado' && !isGap;
  const isZero = isGap && payload.value === 0;
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const band = plot ? plot.width / count : 0;
  const baseline = plot ? plot.y + plot.height : bottom;
  const cx = x + width / 2;
  const planY = yScale ? yScale(plan) : undefined;
  // Coluna a poucos pixels do plano (o total e o passo projetado): sem subir, o traço de referência riscaria o rótulo.
  const labelTop = typeof planY === 'number' && top - planY < LABEL_CLEARANCE ? Math.min(top, planY) : top;
  const gapColor = payload.value < 0 ? 'var(--negative)' : 'var(--positive)';
  const fill = isGap ? gapColor : isProjected ? `url(#${patternId})` : 'var(--chart-1)';
  const valueY = isTotal ? labelTop - LABEL_GAP - 13 : labelTop - LABEL_GAP;
  const connectorY = isGap ? bottom : top;
  return (
    <g>
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={connectorY} y2={connectorY} />
      ) : null}
      {isZero ? (
        <rect fill="var(--text-secondary)" height={ZERO_MARK} width={width} x={x} y={top - ZERO_MARK / 2} />
      ) : (
        <rect
          fill={fill}
          height={Math.max(bottom - top, ZERO_MARK)}
          rx={CORNER}
          stroke={isProjected ? 'var(--chart-1)' : 'none'}
          strokeWidth={isProjected ? 1 : 0}
          width={width}
          x={x}
          y={top}
        />
      )}
      <text
        className="font-display"
        fill={isGap ? gapColor : 'var(--text-primary)'}
        fontSize={12}
        fontWeight={isTotal ? 700 : 500}
        textAnchor="middle"
        x={cx}
        y={valueY}
      >
        {isTotal ? money(payload.value) : signedMoney(payload.value)}
      </text>
      {isTotal ? (
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={labelTop - LABEL_GAP}>
          projeção
        </text>
      ) : null}
      <text className="font-sans" fill="var(--text-secondary)" fontSize={11} textAnchor="middle" x={cx} y={baseline + NAME_GAP}>
        {payload.label}
      </text>
      <text className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={baseline + BASIS_GAP}>
        {payload.sub}
      </text>
    </g>
  );
}

export default function PlanForecast({
  data = defaultData,
  cutDate = defaultCutDate,
  plan = defaultPlan,
  projectionOrigin = defaultOrigin,
  height,
  className,
}: PlanForecastProps) {
  const animate = useAnimateOnce();
  const patternId = `hachura-${useId().replace(/:/g, '')}`;
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum passo neste recorte: não há receita realizada nem projetada para comparar com o plano.</span>
      </div>
    );
  }

  const rows = buildRows(data, plan, formatDate(cutDate));
  const total = rows.find((row) => row.kind === 'total');
  const gap = planGap(data, plan);
  const peak = Math.max(plan, ...rows.map((row) => row.high));

  const stepText = rows
    .filter((row) => row.kind === 'step')
    .map((row) => `${row.label.toLowerCase()} ${money(row.value)}`)
    .join(', ');
  const summary =
    `Gráfico de cascata da projeção contra o plano, lido em ${formatDate(cutDate)}: ${stepText}` +
    `${total ? `, total projetado de ${money(total.value)}` : ''}, plano de ${money(plan)}` +
    `${gap !== null ? `, distância de ${signedMoney(gap)}` : ''}.`;
  const reading =
    gap === null || !total || plan === 0
      ? `Sem total projetado para comparar com o plano de ${money(plan)}`
      : `Projeção de ${money(total.value)}: ${signedMoney(gap)} (${gap >= 0 ? '+' : '−'}${formatPercent(Math.abs(gap) / plan)}) contra plano de ${money(plan)}`;

  const renderPlanLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number } }): ReactElement => {
    const lx = (viewBox?.x ?? 0) + (viewBox?.width ?? 0) + 6;
    const ly = viewBox?.y ?? 0;
    return (
      <g>
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={lx} y={ly - 2}>
          plano
        </text>
        <text className="font-display" fill="var(--text-muted)" fontSize={11} x={lx} y={ly + 11}>
          {money(plan)}
        </text>
      </g>
    );
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as PlanRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const sign = row.value < 0 ? '−' : '+';
    const payload =
      row.kind === 'gap'
        ? [
            { ...base, color: row.value < 0 ? 'var(--negative)' : 'var(--positive)', name: 'Distância do plano', value: `${sign}${formatCurrency(Math.abs(row.value), 0)}` },
            { ...base, color: 'var(--text-muted)', name: 'Plano', value: formatCurrency(plan, 0) },
          ]
        : row.kind === 'total'
          ? [{ ...base, color: 'var(--chart-1)', name: 'Valor exato, projeção', value: formatCurrency(row.value, 0) }]
          : [
              { ...base, color: 'var(--chart-1)', name: 'Valor exato', value: formatCurrency(row.value, 0) },
              { ...base, color: 'var(--text-muted)', name: 'Acumulado após o passo', value: formatCurrency(row.end, 0) },
            ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        {reading}
      </p>
      <p aria-hidden className="mb-2 shrink-0 text-[11px] text-text-muted tabular-nums">
        projeção: {projectionOrigin}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <defs>
              <pattern height={HATCH_SIZE} id={patternId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={HATCH_SIZE}>
                <rect fill="var(--surface-raised)" height={HATCH_SIZE} width={HATCH_SIZE} />
                <line stroke="var(--chart-1)" strokeOpacity={HATCH_OPACITY} strokeWidth={1.5} x1={0} x2={0} y1={0} y2={HATCH_SIZE} />
              </pattern>
            </defs>
            <XAxis dataKey="id" hide />
            <YAxis domain={[0, peak]} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <PlanStep {...props} count={rows.length} patternId={patternId} plan={plan} />}
            />
            <ReferenceLine ifOverflow="extendDomain" label={renderPlanLabel} stroke="var(--text-secondary)" strokeDasharray="4 3" y={plan} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
