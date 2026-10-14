import type { ReactElement } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, useChartHeight, useChartWidth } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type AgendaResultado } from './data';

/**
 * Meia rosca com o total das agendas do mês escrito sobre a base e o resultado de cada categoria
 * escrito na ponta do próprio arco (nome, contagem e percentual inteiro): a meia volta dobra a
 * distorção do ângulo perto do zero e dos 180 graus, então o número escrito é quem carrega a
 * leitura, nunca só o comprimento do arco.
 */
export interface AgendaResultadoDonutProps {
  readonly data?: readonly AgendaResultado[];
  readonly height?: number;
  readonly className?: string;
}

/** Slots categóricos na ordem da COR-8: 1, 3 e 6 para até três partes. */
const SLOT_COLORS = [CHART_SERIES_COLORS[0], CHART_SERIES_COLORS[2], CHART_SERIES_COLORS[5]] as const;
const CY_FRACTION = 0.82;
const OUTER_FRACTION = 1;
const INNER_FRACTION = 0.7;
const CY = `${String(CY_FRACTION * 100)}%`;
const OUTER_RADIUS = `${String(OUTER_FRACTION * 100)}%`;
const INNER_RADIUS = `${String(INNER_FRACTION * 100)}%`;
/** Margem padrão do PieChart (seção "PolarChart" do Recharts): 5 px nos quatro lados. */
const CHART_MARGIN = 5;
const LABEL_GAP = 14;
const RADIAN = Math.PI / 180;

/**
 * Recharts resolve o `viewBox` do `<Label position="center">` pelo contexto cartesiano, não pelo
 * polar da própria `Pie` (limitação da biblioteca): sem isso o centro sai em (0,0). Este hook
 * recalcula o cx/cy com a mesma fórmula que a `Pie` usa por dentro, então só funciona chamado de
 * dentro da árvore do `PieChart` (nunca no componente raiz, que fica fora do contexto).
 */
function useDonutCenter() {
  const width = useChartWidth() ?? 0;
  const containerHeight = useChartHeight() ?? 0;
  const plotWidth = width - CHART_MARGIN * 2;
  const plotHeight = containerHeight - CHART_MARGIN * 2;
  return {
    cx: CHART_MARGIN + plotWidth / 2,
    cy: CHART_MARGIN + CY_FRACTION * plotHeight,
  };
}

interface CenterLabelProps {
  readonly total: number;
}

/** Total escrito sobre a base do arco: filho da Pie, para herdar o contexto do PieChart. */
function CenterLabel({ total }: CenterLabelProps): ReactElement {
  const { cx, cy } = useDonutCenter();
  return (
    <g aria-hidden>
      <text className="font-display" fill="var(--text-primary)" fontSize={20} fontWeight={600} textAnchor="middle" x={cx} y={cy - 20}>
        {formatInt(total)}
      </text>
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={cy - 4}>
        agendas do mês
      </text>
    </g>
  );
}

/** Percentual inteiro pelo maior resto, sempre somando 100 (NUM-2). */
function integerPercents(values: readonly number[]): readonly number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map((value) => Math.floor(value));
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  const result = [...floors];
  let missing = 100 - floors.reduce((sum, value) => sum + value, 0);
  for (const { index } of order) {
    if (missing <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    missing -= 1;
  }
  return result;
}

interface SliceLabelProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly midAngle?: number;
  readonly outerRadius?: number;
  readonly index?: number;
}

export default function AgendaResultadoDonut({ data = defaultData, height, className }: AgendaResultadoDonutProps) {
  const rows = data;
  const animate = useAnimateOnce();
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const percents = integerPercents(rows.map((row) => row.value));
  const style = height === undefined ? undefined : { height };

  const renderSliceLabel = ({
    cx = 0,
    cy = 0,
    midAngle = 0,
    outerRadius = 0,
    index = -1,
  }: SliceLabelProps): ReactElement | null => {
    const row = rows[index];
    const pct = percents[index];
    if (!row || pct === undefined) return null;
    const angle = -midAngle * RADIAN;
    const x = cx + (outerRadius + LABEL_GAP) * Math.cos(angle);
    const y = cy + (outerRadius + LABEL_GAP) * Math.sin(angle);
    const cos = Math.cos(angle);
    const anchor = cos > 0.15 ? 'start' : cos < -0.15 ? 'end' : 'middle';
    return (
      <text fontSize={12} textAnchor={anchor} x={x} y={y}>
        <tspan className="font-sans" fill="var(--text-secondary)" fontWeight={500}>
          {row.name}{' '}
        </tspan>
        <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
          {formatInt(row.value)} ({formatPercent(pct / 100, 0)})
        </tspan>
      </text>
    );
  };

  const leaderIndex = rows.reduce((best, row, index) => (row.value > (rows[best]?.value ?? -1) ? index : best), 0);
  const leader = rows[leaderIndex];
  const leaderPct = percents[leaderIndex];
  const summary = [
    `Meia rosca com o resultado de ${String(rows.length)} categorias somando ${formatInt(total)} agendas do mês.`,
    leader && leaderPct !== undefined
      ? `${leader.name} lidera com ${formatInt(leader.value)} agendas, ${formatPercent(leaderPct / 100, 0)} do total.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <ResponsiveContainer height="100%" width="100%">
        <PieChart accessibilityLayer={false}>
          <Pie
            cx="50%"
            cy={CY}
            data={rows}
            dataKey="value"
            endAngle={0}
            innerRadius={INNER_RADIUS}
            isAnimationActive={animate}
            label={renderSliceLabel}
            labelLine={false}
            nameKey="name"
            outerRadius={OUTER_RADIUS}
            startAngle={180}
            stroke="var(--surface-raised)"
            strokeWidth={2}
          >
            {rows.map((row, index) => (
              <Cell fill={SLOT_COLORS[index] ?? CHART_SERIES_COLORS[0]} key={row.id} />
            ))}
            <CenterLabel total={total} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
