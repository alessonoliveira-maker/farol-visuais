import { Filter } from 'lucide-react';
import { Pie, PieChart, ResponsiveContainer, Sector, Tooltip, type PieSectorShapeProps } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyCompact, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MediaInvestmentSlice } from './data';

/**
 * Pizza de raio variável: o ângulo de cada setor é a participação da plataforma no investimento
 * de mídia do mês, e o raio é o CPL (custo por lead) qualificado daquela plataforma, numa escala
 * de raiz quadrada com piso de raio (o ponto delicado do estudo: raio linear no valor infla a
 * área ao quadrado e engana o olho). Anéis tracejados medem o raio; a lista ao lado mede o
 * ângulo; a dica traz as duas métricas por extenso.
 */
export interface RadiusPieMediaProps {
  readonly data?: readonly MediaInvestmentSlice[];
  readonly height?: number;
  readonly className?: string;
}

const PIE_SIZE = 260;
const PIE_CENTER = PIE_SIZE / 2;
const OUTER_MAX = PIE_CENTER - 10;
/** Fração do raio máximo reservada como piso: nenhum setor nasce com raio zero. */
const RADIUS_MIN_RATIO = 0.32;
const START_ANGLE = 90;
const END_ANGLE = -270;
const RADIAN = Math.PI / 180;
/** Anéis de referência do CPL qualificado, em frações do topo da escala (o maior CPL do dado). */
const RING_FRACTIONS = [0.25, 0.5, 1] as const;
/** Um ângulo próprio por anel (convenção do topo, sentido horário) para nenhum rótulo colidir. */
const RING_ANGLES = [90, 36, 8] as const;
/** Slots categóricos na ordem da COR-8 (1, 3, 6): a cor segue o slot do dado, não a posição. */
const SLOT_COLORS = [CHART_SERIES_COLORS[0], CHART_SERIES_COLORS[2], CHART_SERIES_COLORS[5]] as const;
/** Halo na cor do cartão: o rótulo do anel continua legível sobre qualquer fatia que cruzar. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/**
 * Raio em pixels para um valor de CPL, por raiz quadrada, entre o piso e o raio máximo. Zero é
 * incluído no domínio (a raiz de 0 é 0), e o piso garante que a fatia mais barata continue visível.
 */
function radiusForCpl(value: number, cplMax: number): number {
  const rMin = OUTER_MAX * RADIUS_MIN_RATIO;
  if (cplMax <= 0) return rMin;
  const fraction = Math.max(0, value) / cplMax;
  // Área linear no valor: a coroa acima do piso cresce com o valor (GEO-3).
  return Math.sqrt(rMin * rMin + (OUTER_MAX * OUTER_MAX - rMin * rMin) * fraction);
}

/** Ponto a um raio e um ângulo dados, na convenção do Recharts (90° é o topo, sentido horário). */
function pointAtAngle(radius: number, angleDeg: number): { x: number; y: number } {
  const angleRad = -angleDeg * RADIAN;
  return { x: PIE_CENTER + radius * Math.cos(angleRad), y: PIE_CENTER + radius * Math.sin(angleRad) };
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

export default function RadiusPieMedia({ data = defaultData, height, className }: RadiusPieMediaProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum investimento neste recorte: não há plataforma para comparar.</span>
      </div>
    );
  }

  const totalInvestimento = data.reduce((sum, row) => sum + row.investimento, 0);
  const cplMax = data.reduce((max, row) => Math.max(max, row.cplQualificado), 0);
  const ringValues = cplMax > 0 ? RING_FRACTIONS.map((fraction) => cplMax * fraction) : [];
  const percents = integerPercents(data.map((row) => row.investimento));
  const leaderIndex = data.reduce((best, row, index) => (row.investimento > (data[best]?.investimento ?? -1) ? index : best), 0);
  const priciestIndex = data.reduce((worst, row, index) => (row.cplQualificado > (data[worst]?.cplQualificado ?? -1) ? index : worst), 0);
  const leader = data[leaderIndex];
  const priciest = data[priciestIndex];
  const leaderPercent = percents[leaderIndex] ?? 0;
  const priciestPercent = percents[priciestIndex] ?? 0;

  const reading = leader
    ? `Investimento total ${formatCurrencyCompact(totalInvestimento)} no mês; ${leader.name.toLowerCase()} concentra ${formatPercent(leaderPercent / 100, 0)}.`
    : '';

  const summaryIntro = `Gráfico de pizza de raio variável com ${String(data.length)} plataformas de mídia: ângulo mede o investimento, raio mede o CPL qualificado.`;
  const summary =
    leader && priciest
      ? `${summaryIntro} ${leader.name} lidera com ${formatPercent(leaderPercent / 100, 0)}; ${priciest.name.toLowerCase()}, com só ${formatPercent(priciestPercent / 100, 0)}, tem o CPL mais caro, ${formatCurrencyCompact(priciest.cplQualificado)}.`
      : summaryIntro;

  const renderSlice = (props: PieSectorShapeProps) => {
    const row = props.payload as MediaInvestmentSlice | undefined;
    const fill = row ? (SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0]) : CHART_SERIES_COLORS[0];
    const outerRadius = row ? radiusForCpl(row.cplQualificado, cplMax) : OUTER_MAX * RADIUS_MIN_RATIO;
    return (
      <Sector
        cx={props.cx}
        cy={props.cy}
        endAngle={props.endAngle}
        fill={fill}
        innerRadius={0}
        outerRadius={outerRadius}
        startAngle={props.startAngle}
        stroke="var(--surface-raised)"
        strokeWidth={2}
      />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary tabular-nums">
        {reading}
      </p>
      <div className="flex min-h-0 flex-1 items-start gap-6">
        <div className="relative shrink-0" style={{ height: PIE_SIZE, width: PIE_SIZE }}>
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                cx="50%"
                cy="50%"
                data={data}
                dataKey="investimento"
                endAngle={END_ANGLE}
                innerRadius={0}
                isAnimationActive={animate}
                nameKey="name"
                outerRadius={OUTER_MAX}
                shape={renderSlice}
                startAngle={START_ANGLE}
              />
              <Tooltip
                content={(tooltipProps) => {
                  const row = tooltipProps.payload[0]?.payload as MediaInvestmentSlice | undefined;
                  if (!row) return null;
                  const color = SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0];
                  return (
                    <ChartTooltip
                      active={tooltipProps.active}
                      label={row.name}
                      payload={[
                        { color, graphicalItemId: 'investimento', name: 'Investimento', value: row.investimento },
                        { color, graphicalItemId: 'cpl', name: 'CPL qualificado', value: row.cplQualificado },
                      ]}
                      valueFormat="currencyCompact"
                    />
                  );
                }}
                isAnimationActive={false}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Anéis de escala do raio (CPL qualificado): três círculos tracejados em --text-muted,
              cada um com o rótulo em reais num ângulo próprio, para nenhum rótulo colidir com o
              vizinho nem com as fatias por baixo (halo garante a leitura sobre qualquer cor). */}
          <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" viewBox={`0 0 ${String(PIE_SIZE)} ${String(PIE_SIZE)}`}>
            {ringValues.map((ringValue, index) => {
              const angleDeg = RING_ANGLES[index] ?? 90;
              const r = radiusForCpl(ringValue, cplMax);
              const dot = pointAtAngle(r, angleDeg);
              // Rótulo por dentro do próprio anel (r − 10), nunca por fora: o maior anel já
              // toca o raio máximo do desenho, e um rótulo por fora dele sairia da caixa do
              // SVG. O halo garante a leitura sobre a fatia que estiver por baixo.
              const labelPoint = pointAtAngle(Math.max(0, r - 10), angleDeg);
              return (
                <g key={RING_FRACTIONS[index]}>
                  <circle cx={PIE_CENTER} cy={PIE_CENTER} fill="none" r={r} stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1} />
                  <circle cx={dot.x} cy={dot.y} fill="var(--text-muted)" r={2} />
                  <text
                    className="font-display"
                    dominantBaseline="central"
                    fill="var(--text-muted)"
                    fontSize={11}
                    style={HALO}
                    textAnchor="middle"
                    x={labelPoint.x}
                    y={labelPoint.y}
                  >
                    {formatCurrencyCompact(ringValue)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="shrink-0 text-[0.6875rem] text-text-muted">Ângulo: participação no investimento</p>
          <ul className="flex min-w-0 flex-col gap-1.5">
            {data.map((row, index) => (
              <li className="flex items-start gap-1.5 text-xs text-text-secondary" key={row.id}>
                <span aria-hidden className="mt-0.5 size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: SLOT_COLORS[row.slot] ?? CHART_SERIES_COLORS[0] }} />
                <span className="min-w-0 flex-1 leading-snug">{row.name}</span>
                <span className="font-display shrink-0 text-text-primary">{formatPercent((percents[index] ?? 0) / 100, 0)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 shrink-0 border-t border-line-subtle pt-2 text-[0.6875rem] text-text-muted">
            Raio: CPL qualificado. Anéis em {ringValues.map((value) => formatCurrencyCompact(value)).join(', ')}.
          </p>
        </div>
      </div>
    </div>
  );
}
