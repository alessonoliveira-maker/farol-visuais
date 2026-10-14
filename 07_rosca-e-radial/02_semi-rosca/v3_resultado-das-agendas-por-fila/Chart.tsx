import type { ReactElement } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, useChartHeight, useChartWidth } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, resultadoOrder, type FilaAgendas } from './data';

/**
 * Três semicírculos do mesmo diâmetro, um por fila, com a mesma cor de resultado nas três e o
 * total de agendas escrito no centro de cada arco. A fila com poucas agendas troca a contagem
 * pela taxa com volume, porque um percentual sozinho sobre poucos casos engana.
 */
export interface ResultadoPorFilaProps {
  readonly data?: readonly FilaAgendas[];
  readonly height?: number;
  readonly className?: string;
}

/** Slots categóricos na ordem da COR-8: 1, 3 e 6, fixos por id em todas as filas. */
const SLOT_COLORS = [CHART_SERIES_COLORS[0], CHART_SERIES_COLORS[2], CHART_SERIES_COLORS[5]] as const;
const CY_FRACTION = 0.9;
const CY = `${String(CY_FRACTION * 100)}%`;
const OUTER_RADIUS = '100%';
const INNER_RADIUS = '68%';
const LABEL_GAP = 10;
const RADIAN = Math.PI / 180;
/** Abaixo disso o percentual sozinho engana: o rótulo vira taxa com volume. */
const SMALL_VOLUME_THRESHOLD = 20;
/** Margem padrão do PieChart (Recharts): 5 px nos quatro lados. */
const CHART_MARGIN = 5;

function colorFor(id: string): string {
  const index = resultadoOrder.indexOf(id);
  return SLOT_COLORS[index] ?? CHART_SERIES_COLORS[0];
}

/** Percentual inteiro pelo maior resto, sempre somando 100 (NUM-2), calculado por fila. */
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

/**
 * Recharts resolve o `viewBox` do `<Label position="center">` pelo contexto cartesiano, não pelo
 * polar da própria `Pie` (limitação da biblioteca): sem isso o centro sai em (0,0). Este hook
 * recalcula o cx/cy com a mesma fórmula que a `Pie` usa por dentro; só funciona chamado de dentro
 * da árvore de cada `PieChart`.
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
    <text aria-hidden className="font-display" fill="var(--text-primary)" fontSize={16} fontWeight={600} textAnchor="middle" x={cx} y={cy - 6}>
      {formatInt(total)}
    </text>
  );
}

interface SliceLabelProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly midAngle?: number;
  readonly outerRadius?: number;
  readonly index?: number;
}

interface FilaArcProps {
  readonly fila: FilaAgendas;
  readonly animate: boolean;
}

function FilaArc({ fila, animate }: FilaArcProps): ReactElement {
  const total = fila.resultados.reduce((sum, item) => sum + item.value, 0);
  const smallVolume = total > 0 && total < SMALL_VOLUME_THRESHOLD;
  const percents = integerPercents(fila.resultados.map((item) => item.value));

  const renderSliceLabel = ({ cx = 0, cy = 0, midAngle = 0, outerRadius = 0, index = -1 }: SliceLabelProps): ReactElement | null => {
    const item = fila.resultados[index];
    const pct = percents[index];
    if (!item || pct === undefined) return null;
    const angle = -midAngle * RADIAN;
    const x = cx + (outerRadius + LABEL_GAP) * Math.cos(angle);
    const y = cy + (outerRadius + LABEL_GAP) * Math.sin(angle);
    const cos = Math.cos(angle);
    const anchor = cos > 0.15 ? 'start' : cos < -0.15 ? 'end' : 'middle';
    const text = smallVolume ? formatRateWithVolume(item.value, total) : `${formatInt(item.value)} (${formatPercent(pct / 100, 0)})`;
    return (
      <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor={anchor} x={x} y={y}>
        {text}
      </text>
    );
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col items-center">
      <div className="min-h-0 w-full flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer={false}>
            <Pie
              cx="50%"
              cy={CY}
              data={fila.resultados}
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
              {fila.resultados.map((item) => (
                <Cell fill={colorFor(item.id)} key={item.id} />
              ))}
              <CenterLabel total={total} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 shrink-0 text-xs font-medium text-text-secondary">{fila.name}</p>
    </div>
  );
}

export default function ResultadoPorFila({ data = defaultData, height, className }: ResultadoPorFilaProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const legend = data[0]?.resultados ?? [];

  const rates = data.map((fila) => {
    const total = fila.resultados.reduce((sum, item) => sum + item.value, 0);
    const semComparecimento = fila.resultados.find((item) => item.id === 'nao-compareceu');
    const rate = semComparecimento && total > 0 ? semComparecimento.value / total : 0;
    return { fila, rate, semComparecimento, total };
  });
  const worst = rates.reduce<(typeof rates)[number] | undefined>(
    (best, row) => (best === undefined || row.rate > best.rate ? row : best),
    undefined,
  );

  const summary = [
    `Três semicírculos com o resultado das agendas de ${String(data.length)} filas na semana.`,
    worst?.semComparecimento
      ? `${worst.fila.name} tem a maior taxa de não comparecimento, ${formatRateWithVolume(worst.semComparecimento.value, worst.total)}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <div className="mb-2 flex shrink-0 items-center justify-center gap-4">
        {legend.map((item) => (
          <span className="flex items-center gap-1.5 text-xs text-text-secondary" key={item.id}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorFor(item.id) }} />
            {item.name}
          </span>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 items-stretch gap-4">
        {data.map((fila) => (
          <FilaArc animate={animate} fila={fila} key={fila.id} />
        ))}
      </div>
    </div>
  );
}
