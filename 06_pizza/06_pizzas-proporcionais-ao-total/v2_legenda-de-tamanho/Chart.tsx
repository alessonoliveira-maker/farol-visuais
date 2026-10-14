import type { CSSProperties, ReactElement } from 'react';
import { Filter } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatDecimal, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QuarterRevenue, type ServiceSlice } from './data';

/**
 * Pizzas proporcionais ao total com uma régua de tamanho ao lado: dois círculos de referência,
 * vazados, desenhados pela MESMA função de raio das pizzas, para o olho ter contra o que conferir
 * a área. O degrau de cima da régua é o maior total observado no recorte, calculado do dado
 * (ROT-5b), e o de baixo é um quarto dele; a área da pizza é proporcional ao total porque o raio
 * sai da raiz quadrada do total sobre o maior total, e o total escrito sob cada pizza é que manda,
 * porque a área o olho subestima.
 */
export interface RevenueScalePiesProps {
  readonly data?: readonly QuarterRevenue[];
  readonly height?: number;
  readonly className?: string;
}

/** Cor por linha de serviço, fixa entre os trimestres, slots 1, 3 e 6 (COR-8). */
const CATEGORY_COLORS = [CHART_SERIES_COLORS[0], CHART_SERIES_COLORS[2], CHART_SERIES_COLORS[5]] as const;
/** Raio da maior pizza e da maior referência da régua, em px. */
const RADIUS_MAX = 92;
/** Margem zero no PieChart: o padrão de 5 px por lado descontaria o raio de toda pizza. */
const CHART_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 } as const;
const START_ANGLE = 90;
const END_ANGLE = -270;
const RADIAN = Math.PI / 180;
const LABEL_RADIUS_FRACTION = 0.68;
/** Degrau de baixo da régua: fração do maior total observado, nunca um valor escrito à mão. */
const SCALE_STEP_FRACTION = 0.25;
const SCALE_STROKE = 1.5;
const SCALE_LABEL_GAP = 4;
/**
 * A âncora do rótulo da régua fica ACIMA do topo do círculo, e o afastamento se reserva contra a
 * CAIXA da tinta, não contra a linha de base: sem descontar a descida o canto de baixo reentra na
 * borda curva (GEO-19). Descida medida do texto de 11 px, arredondada para cima.
 */
const LABEL_DESCENT = 3;
/** Respiro no topo do SVG da régua para a caixa do rótulo do maior círculo caber inteira. */
const SCALE_TOP_RESERVE = 18;

/** Total de um trimestre, somado das próprias fatias. Sem fatia não há total: null, nunca 0 (EST-1b). */
function quarterTotal(quarter: QuarterRevenue): number | null {
  if (quarter.slices.length === 0) return null;
  return quarter.slices.reduce((sum, slice) => sum + slice.value, 0);
}

/**
 * Raio em px pela raiz quadrada do total sobre o maior total: é a forma que faz a ÁREA carregar o
 * valor, porque a área cresce com o quadrado do raio (GEO-3). Sem raio mínimo, de propósito: um
 * piso de raio exigiria interpolar os quadrados, e a forma que o catálogo prescreve para isso
 * ("entre rMin e rMax") desenha área maior do que o valor.
 */
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

/** Nome da maior fatia de um trimestre, ou null quando o trimestre não tem fatia. */
function leadingSliceName(quarter: QuarterRevenue): string | null {
  let best: ServiceSlice | null = null;
  for (const slice of quarter.slices) {
    if (best === null || slice.value > best.value) best = slice;
  }
  return best === null ? null : best.name;
}

/** Linha de serviço que lidera em TODOS os trimestres, ou null quando a liderança troca. */
function constantLeader(quarters: readonly QuarterRevenue[]): string | null {
  const names = quarters.map((quarter) => leadingSliceName(quarter));
  const first = names[0];
  if (first === undefined || first === null) return null;
  return names.every((name) => name === first) ? first : null;
}

interface SliceLabelProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly midAngle?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly index?: number;
}

export default function RevenueScalePies({ data = defaultData, height, className }: RevenueScalePiesProps) {
  const animate = useAnimateOnce();
  const rootStyle: CSSProperties | undefined = height === undefined ? undefined : { height };

  const entries = data.map((quarter) => ({ quarter, total: quarterTotal(quarter) }));
  const totals = entries.flatMap((entry) => (entry.total === null ? [] : [entry.total]));
  const totalMax = totals.reduce((max, value) => Math.max(max, value), 0);

  if (totals.length === 0 || totalMax <= 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={rootStyle}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum trimestre com receita neste recorte: sem total não há área para comparar.</span>
      </div>
    );
  }

  const totalMin = totals.reduce((min, value) => Math.min(min, value), totalMax);
  const ratio = totalMin > 0 ? totalMax / totalMin : null;
  const biggest = entries.reduce<{ label: string; total: number }>(
    (best, entry) =>
      entry.total !== null && entry.total > best.total ? { label: entry.quarter.quarterLabel, total: entry.total } : best,
    { label: '', total: 0 },
  );
  const leader = constantLeader(data);
  const categoryNames = entries[0]?.quarter.slices.map((slice) => slice.name) ?? [];

  const stepTotal = totalMax * SCALE_STEP_FRACTION;
  const scaleRings = [
    { id: 'topo', radius: RADIUS_MAX, total: totalMax },
    { id: 'degrau', radius: radiusForTotal(stepTotal, totalMax), total: stepTotal },
  ] as const;
  const scaleWidth = 2 * RADIUS_MAX;
  const scaleHeight = 2 * RADIUS_MAX + SCALE_TOP_RESERVE;

  const summary = `${formatInt(data.length)} pizzas proporcionais ao total com a receita reconhecida por trimestre e linha de serviço. O maior trimestre, ${biggest.label}, soma ${formatCurrencyCompact(totalMax)}, ${ratio === null ? 'sem base para comparar' : `${formatDecimal(ratio, 1)} vezes o menor`}${leader === null ? '' : `; ${leader} lidera em todos`}.`;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={rootStyle}>
      <div className="mb-2 flex shrink-0 flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {categoryNames.map((name, index) => (
            <li className="flex items-center gap-1.5 text-xs text-text-secondary" key={name}>
              <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[index] ?? CATEGORY_COLORS[0] }} />
              <span>{name}</span>
            </li>
          ))}
        </ul>
        <p className="text-[0.6875rem] text-text-muted">área aproximada; o total escrito é que manda</p>
      </div>

      <div className="flex min-h-0 flex-1 items-end justify-center gap-4">
        <div className="mr-4 flex shrink-0 flex-col items-center">
          <svg className="shrink-0" height={scaleHeight} viewBox={`0 0 ${scaleWidth} ${scaleHeight}`} width={scaleWidth}>
            {scaleRings.map((ring) => (
              <g key={ring.id}>
                <circle
                  cx={RADIUS_MAX}
                  cy={scaleHeight - ring.radius}
                  fill="none"
                  r={Math.max(0, ring.radius - SCALE_STROKE / 2)}
                  stroke="var(--text-muted)"
                  strokeWidth={SCALE_STROKE}
                />
                <text
                  className="font-display"
                  fill="var(--text-muted)"
                  fontSize={11}
                  fontWeight={500}
                  textAnchor="middle"
                  x={RADIUS_MAX}
                  y={scaleHeight - 2 * ring.radius - SCALE_LABEL_GAP - LABEL_DESCENT}
                >
                  {formatCurrencyCompact(ring.total)}
                </text>
              </g>
            ))}
          </svg>
          <p className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">escala de área</p>
        </div>

        {entries.map(({ quarter, total }) => {
          if (total === null) return null;
          const radius = radiusForTotal(total, totalMax);
          const diameter = radius * 2;
          const percents = integerPercents(quarter.slices.map((slice) => slice.value));
          const renderLabel = ({
            cx = 0,
            cy = 0,
            midAngle = 0,
            innerRadius = 0,
            outerRadius: sliceOuter = 0,
            index = -1,
          }: SliceLabelProps): ReactElement | null => {
            const pct = percents[index];
            if (pct === undefined) return null;
            const labelRadius = innerRadius + (sliceOuter - innerRadius) * LABEL_RADIUS_FRACTION;
            const angle = -midAngle * RADIAN;
            return (
              <text
                className="font-display"
                dominantBaseline="central"
                fill="var(--surface-raised)"
                fontSize={11}
                fontWeight={600}
                textAnchor="middle"
                x={cx + labelRadius * Math.cos(angle)}
                y={cy + labelRadius * Math.sin(angle)}
              >
                {formatPercent(pct / 100, 0)}
              </text>
            );
          };
          return (
            <div className="flex min-w-0 flex-col items-center" key={quarter.quarterId}>
              <p className="mb-1 shrink-0 text-xs font-medium text-text-secondary">{quarter.quarterLabel}</p>
              <div className="shrink-0" style={{ height: diameter, width: diameter }}>
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart accessibilityLayer={false} margin={CHART_MARGIN}>
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
                      outerRadius={radius}
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
              <p className="mt-1 shrink-0 text-[0.6875rem] font-medium text-text-primary tabular-nums">
                {formatCurrencyCompact(total)}
              </p>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
