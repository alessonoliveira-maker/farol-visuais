import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, goal as defaultGoal, type MonthlyRevenue } from './data';

/** Colunas de receita reconhecida por mês, acesas quando batem a meta, com a meta em linha tracejada. */
export interface RevenueVsGoalProps {
  readonly data?: readonly MonthlyRevenue[];
  readonly goal?: number;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Card ≈ 574 × 234 px de corpo. Eixo de valor 56 px (rótulo "R$ 700 mil" precisa da largura
 * inteira numa linha só, senão o Recharts quebra o tique em três); margem 12/24; disponível
 * ≈ 506 px para 6 meses, poucos o bastante para o valor caber em cima de cada coluna sem colidir
 * com o vizinho (CONTRATO ROT-2, respiro mínimo entre âncoras).
 */
const MARGIN = { top: 24, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 56;
const BAR_CATEGORY_GAP = '30%';
/** ESP-6: passo ≈ 506 / 6 ≈ 84,3; espessura ≈ 84,3 × (1 − 2 × 0,30) ≈ 33,7 px, acima do teto de
 * 24 px em cartão (ESP-2): o teto vence, a coluna respira mais do que a fórmula pediria. */
const BAR_MAX = 24;
const VALUE_LABEL_GAP = 8;
const TICK_COUNT = 4;
const HIGHLIGHT_FILL = 'var(--chart-1)';
const NEUTRAL_FILL = 'var(--line-strong)';
const REFERENCE_STROKE = 'var(--text-muted)';
/**
 * O rótulo da meta fica preso à faixa reservada no topo do corpo (ANO-3), nunca à altura da
 * própria linha: com a meta perto do valor de um mês, sobretudo o último, a altura da linha cai
 * em cima do rótulo daquela coluna e as duas legendas colidem. Fixo acima da grade mais alta,
 * o rótulo nunca compete com o valor de nenhuma coluna, qualquer que seja o mês mais próximo da
 * meta.
 */
const GOAL_LABEL_Y = MARGIN.top - 10;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Domínio arredondado para cima na centena de mil mais próxima, para a grade sair em passo redondo. */
function niceCeiling(max: number): number {
  const step = 100_000;
  return Math.ceil(max / step) * step;
}

export default function RevenueVsGoal({ data = defaultData, goal = defaultGoal, height, className }: RevenueVsGoalProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [...data];
  const aboveCount = rows.filter((row) => row.revenue >= goal).length;
  const ceiling = niceCeiling(Math.max(goal, ...rows.map((row) => row.revenue)));
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (ceiling / TICK_COUNT) * i);

  const summary = [
    `Gráfico de colunas com a receita reconhecida em ${String(rows.length)} meses contra a meta mensal de ${formatCurrencyCompact(goal)}.`,
    `${String(aboveCount)} de ${String(rows.length)} meses bateram a meta.`,
    rows.length > 0 ? `Último mês, ${formatMonthShort(rows[rows.length - 1]!.month)}, com ${formatCurrencyCompact(rows[rows.length - 1]!.revenue)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderValue = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const above = row.revenue >= goal;
    return (
      <text
        className="font-display"
        dominantBaseline="auto"
        fill={above ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={above ? 600 : 500}
        style={HALO}
        textAnchor="middle"
        x={Number(x) + Number(width) / 2}
        y={Number(y) - VALUE_LABEL_GAP}
      >
        {formatCurrencyCompact(row.revenue)}
      </text>
    );
  };

  const renderGoalLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly width?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="end" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0)} y={GOAL_LABEL_Y}>
      meta <tspan className="font-display">{formatCurrencyCompact(goal)}</tspan>
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="kpi-number font-medium text-text-primary">{formatInt(aboveCount)}</span> de{' '}
        <span className="tabular-nums">{formatInt(rows.length)}</span> meses bateram a meta
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, ceiling]} tickFormatter={formatCurrencyAxis} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Bar dataKey="revenue" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[3, 3, 0, 0]}>
              {rows.map((row) => (
                <Cell fill={row.revenue >= goal ? HIGHLIGHT_FILL : NEUTRAL_FILL} key={row.month} />
              ))}
              <LabelList content={renderValue} dataKey="revenue" />
            </Bar>
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderGoalLabel}
              stroke={REFERENCE_STROKE}
              strokeDasharray="3 3"
              strokeWidth={1}
              y={goal}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
