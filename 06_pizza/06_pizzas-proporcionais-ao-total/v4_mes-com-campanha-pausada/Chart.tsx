import type { CSSProperties, ReactElement } from 'react';
import { Filter, Unplug } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyLeads } from './data';

/**
 * Pizzas proporcionais ao total com um mês pequeno demais para desenhar a composição. A escala é
 * comum ao conjunto e NÃO se reescala por causa do mês pequeno: o raio dele sai da mesma raiz
 * quadrada do volume sobre o maior volume, e é justamente por isso que o diâmetro nasce abaixo de
 * MIN_DIAMETER. O que a constante decide é só se as fatias são desenhadas; abaixo dela a marca vira
 * um ponto neutro com o total escrito ao lado, com a área ainda proporcional. Mês sem fatia nenhuma
 * é outra coisa: ausência de coleta, que escreve formatUnavailable() e não desenha marca (EST-2).
 */
export interface PausedCampaignPiesProps {
  readonly data?: readonly MonthlyLeads[];
  readonly height?: number;
  readonly className?: string;
}

/** Cor por canal, fixa entre os meses, slots 1, 3 e 6 (COR-8). */
const CATEGORY_COLORS = [CHART_SERIES_COLORS[0], CHART_SERIES_COLORS[2], CHART_SERIES_COLORS[5]] as const;
/** Raio da maior pizza do conjunto, em px. */
const RADIUS_MAX = 72;
/**
 * Diâmetro abaixo do qual a composição não se desenha: com 24 px e três fatias, a menor delas não
 * tem arco para um rótulo de 11 px, e fatia sem número não cumpre a ROT-10. A marca continua com o
 * raio da escala comum; só as fatias saem.
 */
const MIN_DIAMETER = 24;
/** Altura do palco de desenho: a maior pizza. Igual em toda coluna, para as bases se alinharem. */
const PLOT_HEIGHT = 2 * RADIUS_MAX;
/** Margem zero no PieChart: o padrão de 5 px por lado descontaria o raio de toda pizza. */
const CHART_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 } as const;
const START_ANGLE = 90;
const END_ANGLE = -270;
const RADIAN = Math.PI / 180;
const LABEL_RADIUS_FRACTION = 0.68;

/** Volume de um mês, somado das próprias fatias. Sem fatia não há volume: null, nunca 0 (EST-1b). */
function monthTotal(month: MonthlyLeads): number | null {
  if (month.slices.length === 0) return null;
  return month.slices.reduce((sum, slice) => sum + slice.value, 0);
}

/**
 * Raio em px pela raiz quadrada do volume sobre o maior volume: é a forma que faz a ÁREA carregar o
 * valor, porque a área cresce com o quadrado do raio (GEO-3). Sem raio mínimo, de propósito: com um
 * piso de raio a área do mês pequeno passaria a mentir, e é por isso que aqui o piso é de DESENHO,
 * na composição, e não de tamanho.
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

interface SliceLabelProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly midAngle?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly index?: number;
}

export default function PausedCampaignPies({ data = defaultData, height, className }: PausedCampaignPiesProps) {
  const animate = useAnimateOnce();
  const rootStyle: CSSProperties | undefined = height === undefined ? undefined : { height };

  const entries = data.map((month) => ({ month, total: monthTotal(month) }));
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
        <span>Nenhum mês com lead neste recorte: sem volume não há área para comparar.</span>
      </div>
    );
  }

  const totalMin = totals.reduce((min, value) => Math.min(min, value), totalMax);
  const ratio = totalMin > 0 ? totalMax / totalMin : null;
  const biggest = entries.reduce<{ month: string; total: number }>(
    (best, entry) => (entry.total !== null && entry.total > best.total ? { month: entry.month.month, total: entry.total } : best),
    { month: '', total: 0 },
  );
  const smallest = entries.reduce<{ month: string; total: number } | null>(
    (worst, entry) => (entry.total !== null && (worst === null || entry.total < worst.total) ? { month: entry.month.month, total: entry.total } : worst),
    null,
  );
  const missing = entries.filter((entry) => entry.total === null).map((entry) => entry.month.month);
  const categoryNames = entries.find((entry) => entry.total !== null)?.month.slices.map((slice) => slice.name) ?? [];

  const summary = `${formatInt(data.length)} pizzas proporcionais ao total com os leads por mês e canal. O maior mês, ${formatMonthShort(biggest.month)}, soma ${formatInt(biggest.total)} leads${smallest === null || ratio === null ? '' : `; ${formatMonthShort(smallest.month)} soma ${formatInt(smallest.total)} leads, ${formatDecimal(ratio, 0)} vezes menos, e sai como ponto sem composição`}${missing.length === 0 ? '' : `; ${missing.map((month) => formatMonthShort(month)).join(' e ')} está ${formatUnavailable()}`}.`;

  return (
    <figure aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={rootStyle}>
      <ul className="mb-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1">
        {categoryNames.map((name, index) => (
          <li className="flex items-center gap-1.5 text-xs text-text-secondary" key={name}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[index] ?? CATEGORY_COLORS[0] }} />
            <span>{name}</span>
          </li>
        ))}
      </ul>

      <div className="flex min-h-0 flex-1 items-end justify-center gap-6">
        {entries.map(({ month, total }) => {
          const radius = total === null ? 0 : radiusForTotal(total, totalMax);
          const diameter = radius * 2;
          const percents = integerPercents(month.slices.map((slice) => slice.value));
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
            <div className="flex min-w-0 flex-col items-center" key={month.monthId}>
              <p className="mb-1 shrink-0 text-xs font-medium text-text-secondary">{formatMonthShort(month.month)}</p>
              <div className="flex shrink-0 items-end justify-center" style={{ height: PLOT_HEIGHT }}>
                {total === null ? null : diameter >= MIN_DIAMETER ? (
                  <div className="shrink-0" style={{ height: diameter, width: diameter }}>
                    <ResponsiveContainer height="100%" width="100%">
                      <PieChart accessibilityLayer={false} margin={CHART_MARGIN}>
                        <Pie
                          cx="50%"
                          cy="50%"
                          data={month.slices}
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
                          {month.slices.map((slice, index) => (
                            <Cell fill={CATEGORY_COLORS[index] ?? CATEGORY_COLORS[0]} key={slice.id} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <svg className="shrink-0" height={diameter} viewBox={`0 0 ${String(diameter)} ${String(diameter)}`} width={diameter}>
                    <circle cx={radius} cy={radius} fill="var(--text-muted)" r={radius} />
                  </svg>
                )}
              </div>
              {total === null ? (
                <p className="mt-1 flex shrink-0 items-center gap-1 text-[0.6875rem] text-text-muted">
                  <Unplug aria-hidden className="size-3.5 shrink-0" />
                  <span>{formatUnavailable()}</span>
                </p>
              ) : (
                <p className="mt-1 shrink-0 text-[0.6875rem] font-medium text-text-primary tabular-nums">{formatInt(total)} leads</p>
              )}
            </div>
          );
        })}
      </div>

      <p aria-hidden className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">
        ponto: volume pequeno demais para a composição
      </p>
    </figure>
  );
}
