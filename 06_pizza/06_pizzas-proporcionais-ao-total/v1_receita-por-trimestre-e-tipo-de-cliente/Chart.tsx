import type { CSSProperties, ReactElement } from 'react';
import { Filter } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatDecimal, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QuarterlyRevenue } from './data';

/**
 * Pizzas proporcionais ao total: cada pizza é um trimestre e a área do círculo, não o raio, é
 * proporcional à receita reconhecida daquele trimestre, pela raiz quadrada do total sobre o maior
 * total do recorte (o ponto delicado do estudo: raio linear no valor infla a diferença ao
 * quadrado e engana o olho). As fatias mostram a composição por tipo de cliente, na mesma cor
 * entre os trimestres, e o total fica escrito sob cada pizza porque a área sozinha o olho
 * subestima.
 */
export interface ProportionalRevenuePiesProps {
  readonly data?: readonly QuarterlyRevenue[];
  readonly height?: number;
  readonly className?: string;
}

/** Cor por tipo de cliente, fixa entre os trimestres, slots 1, 3 e 6 (COR-8). */
const CATEGORY_COLORS = [CHART_SERIES_COLORS[0], CHART_SERIES_COLORS[2], CHART_SERIES_COLORS[5]] as const;
/** Raio da maior pizza do conjunto; as demais escalam por baixo dele pela raiz do total. */
const RADIUS_MAX = 80;
const START_ANGLE = 90;
const END_ANGLE = -270;
const RADIAN = Math.PI / 180;
const LABEL_RADIUS_FRACTION = 0.66;
/** Halo na cor do cartão: o percentual precisa de contraste sobre qualquer uma das três cores. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 3 } as const;

/** Soma das fatias de um trimestre: fonte única do total, nunca um campo separado a repetir. */
function quarterTotal(quarter: QuarterlyRevenue): number {
  return quarter.slices.reduce((sum, slice) => sum + slice.value, 0);
}

/** Raio em pixels pela raiz quadrada do total sobre o maior total do recorte (área proporcional). */
function radiusForTotal(total: number, totalMax: number): number {
  if (totalMax <= 0) return 0;
  return RADIUS_MAX * Math.sqrt(Math.max(0, total) / totalMax);
}

/** Percentual inteiro pelo maior resto, sempre somando 100 por pizza (NUM-2). */
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
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly index?: number;
}

export default function ProportionalRevenuePies({ data = defaultData, height, className }: ProportionalRevenuePiesProps) {
  const animate = useAnimateOnce();
  const rootStyle: CSSProperties | undefined = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={rootStyle}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum trimestre neste recorte: não há receita reconhecida para comparar.</span>
      </div>
    );
  }

  const totalMax = data.reduce((max, quarter) => Math.max(max, quarterTotal(quarter)), 0);
  const first = data[0];
  const last = data[data.length - 1];
  const firstTotal = first ? quarterTotal(first) : 0;
  const lastTotal = last ? quarterTotal(last) : 0;
  const ratio = firstTotal > 0 ? lastTotal / firstTotal : null;
  const categoryNames = first?.slices.map((slice) => slice.name) ?? [];

  const summary =
    first && last
      ? `Quatro pizzas proporcionais ao total com a receita reconhecida por trimestre e tipo de cliente. A área cresce de ${formatCurrencyCompact(firstTotal)} no ${first.quarterLabel} para ${formatCurrencyCompact(lastTotal)} no ${last.quarterLabel}${ratio !== null ? `, ${formatDecimal(ratio, 1)} vezes mais` : ''}; renovação lidera em todo trimestre.`
      : 'Pizzas proporcionais ao total sem trimestre para mostrar.';

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={rootStyle}>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1">
        {categoryNames.map((name, index) => (
          <li className="flex items-center gap-1.5 text-xs text-text-secondary" key={name}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[index] ?? CATEGORY_COLORS[0] }} />
            <span>{name}</span>
          </li>
        ))}
      </ul>
      <div className="flex min-h-0 flex-1 items-end justify-center gap-6">
        {data.map((quarter) => {
          const total = quarterTotal(quarter);
          const diameter = radiusForTotal(total, totalMax) * 2;
          const percents = integerPercents(quarter.slices.map((slice) => slice.value));
          const renderLabel = ({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius: sliceOuter = 0, index = -1 }: SliceLabelProps): ReactElement | null => {
            const pct = percents[index];
            if (pct === undefined) return null;
            const radius = innerRadius + (sliceOuter - innerRadius) * LABEL_RADIUS_FRACTION;
            const angle = -midAngle * RADIAN;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            return (
              <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={11} fontWeight={500} style={HALO} textAnchor="middle" x={x} y={y}>
                {formatPercent(pct / 100, 0)}
              </text>
            );
          };
          return (
            <div className="flex min-w-0 flex-col items-center" key={quarter.quarterId}>
              <p className="mb-1 shrink-0 text-xs font-medium text-text-secondary">{quarter.quarterLabel}</p>
              <div className="shrink-0" style={{ height: diameter, width: diameter }}>
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart accessibilityLayer={false}>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={quarter.slices}
                      dataKey="value"
                      endAngle={END_ANGLE}
                      isAnimationActive={animate}
                      label={renderLabel}
                      labelLine={false}
                      nameKey="name"
                      outerRadius="100%"
                      startAngle={START_ANGLE}
                      stroke="var(--surface-raised)"
                      strokeWidth={2}
                    >
                      {quarter.slices.map((slice, index) => (
                        <Cell fill={CATEGORY_COLORS[index] ?? CATEGORY_COLORS[0]} key={slice.id} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-1 shrink-0 text-[0.6875rem] font-medium text-text-primary tabular-nums">{formatCurrencyCompact(total)}</p>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
