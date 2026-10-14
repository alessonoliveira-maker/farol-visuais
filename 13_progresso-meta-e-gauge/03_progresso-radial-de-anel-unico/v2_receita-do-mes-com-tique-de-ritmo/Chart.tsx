import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, useChartHeight, useChartWidth } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatDecimal, formatMonthLong, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ReceitaDoMes } from './data';

/**
 * Anel único com um tique de ritmo: a receita reconhecida do mês contra a meta, e um traço na
 * fração do mês já decorrida. A diferença entre o percentual cumprido e o ritmo esperado diz se o
 * mês está adiantado ou atrasado, sem que a leitura dependa de comparar dois ângulos.
 */
export interface ReceitaDoMesRadialProps {
  readonly data?: ReceitaDoMes;
  readonly height?: number;
  readonly className?: string;
}

const RING_FILL = 'var(--chart-1)';
const TRACK_FILL = 'var(--surface-sunken)';
const START_ANGLE = 90;
const END_ANGLE = -270;
/** Furo aberto o bastante para o par de valores caber em duas linhas curtas sem cruzar o arco. */
const INNER_FRACTION = 0.82;
const OUTER_FRACTION = 0.94;
/** Margem padrão do PolarChart do Recharts: 5 px nos quatro lados. */
const CHART_MARGIN = 5;

function polarPoint(cx: number, cy: number, radius: number, angleDeg: number): { x: number; y: number } {
  const rad = (-angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

interface RhythmTickProps {
  readonly fraction: number;
}

/** Traço radial na fração do mês decorrida, na posição real do ângulo, calculado por trigonometria. */
function RhythmTick({ fraction }: RhythmTickProps): ReactElement | null {
  const width = useChartWidth() ?? 0;
  const containerHeight = useChartHeight() ?? 0;
  const plotWidth = width - CHART_MARGIN * 2;
  const plotHeight = containerHeight - CHART_MARGIN * 2;
  const maxRadius = Math.min(plotWidth, plotHeight) / 2;
  if (maxRadius <= 0) return null;
  const cx = CHART_MARGIN + plotWidth / 2;
  const cy = CHART_MARGIN + plotHeight / 2;
  const angleDeg = START_ANGLE + fraction * (END_ANGLE - START_ANGLE);
  const inner = polarPoint(cx, cy, maxRadius * INNER_FRACTION - 3, angleDeg);
  const outer = polarPoint(cx, cy, maxRadius * OUTER_FRACTION + 4, angleDeg);
  return (
    <g aria-hidden>
      <line stroke="var(--text-muted)" strokeWidth={2} x1={inner.x} x2={outer.x} y1={inner.y} y2={outer.y} />
    </g>
  );
}

export default function ReceitaDoMesRadial({ data = defaultData, height, className }: ReceitaDoMesRadialProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const meta = Math.max(data.meta, 1);
  const percent = Math.min(data.reconhecida / meta, 1);
  const rows = [{ reconhecida: data.reconhecida }];
  const diffPoints = percent * 100 - data.fracaoDecorrida * 100;
  const ahead = diffPoints >= 0;
  const diffText = `${ahead ? '+' : '−'}${formatDecimal(Math.abs(diffPoints), 1)} p.p.`;
  /**
   * O percentual é escrito uma vez só e reaproveitado no centro do anel e na frase acessível. Antes
   * a frase chamava `formatPercent(percent)`, que traz uma casa decimal, enquanto o centro usava
   * zero casa: no dado fixo a divergência sai em "74%" contra "74,0%", e basta um recorte em que o
   * arredondamento caia para lados diferentes para os dois números deixarem de ser o mesmo. A casa
   * escolhida é a do corpo, que é a que o leitor confere contra a planilha (conserto de 2026-09-28,
   * DAD-5). A diferença de ritmo segue com uma casa porque é outra medida, em pontos percentuais.
   */
  const percentText = formatPercent(percent, 0);

  const summary = [
    `Anel de progresso com a receita reconhecida em ${formatMonthLong(data.month)}: ${formatCurrencyCompact(data.reconhecida)} de ${formatCurrencyCompact(data.meta)}, ${percentText} da meta.`,
    `Com ${formatPercent(data.fracaoDecorrida, 0)} do mês decorrido, o mês está ${ahead ? 'adiantado' : 'atrasado'} em ${diffText} contra o ritmo esperado.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('relative h-full w-full min-w-0', className)} role="img" style={style}>
      <ResponsiveContainer height="100%" width="100%">
        <RadialBarChart
          accessibilityLayer={false}
          data={rows}
          endAngle={END_ANGLE}
          innerRadius={`${String(INNER_FRACTION * 100)}%`}
          outerRadius={`${String(OUTER_FRACTION * 100)}%`}
          startAngle={START_ANGLE}
        >
          <PolarAngleAxis {...AXIS_PROPS} axisLine={false} dataKey="reconhecida" domain={[0, meta]} tick={false} type="number" />
          <RadialBar background={{ fill: TRACK_FILL }} cornerRadius={6} dataKey="reconhecida" fill={RING_FILL} isAnimationActive={animate} minPointSize={0} />
          <RhythmTick fraction={data.fracaoDecorrida} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="kpi-number text-3xl leading-none font-semibold text-text-primary">{percentText}</span>
        {/* Par de valores em duas linhas curtas: uma linha só, "R$ 2,2 mi de R$ 3,0 mi", é mais
         * larga que o furo do anel e cruza o arco dos dois lados. */}
        <span className="kpi-number mt-1.5 text-sm font-semibold text-text-primary">{formatCurrencyCompact(data.reconhecida)}</span>
        <span className="kpi-number text-sm font-semibold text-text-primary">de {formatCurrencyCompact(data.meta)}</span>
        <span className={cn('mt-1 flex items-center gap-0.5 text-[0.6875rem] font-medium', ahead ? 'text-positive' : 'text-negative')}>
          {ahead ? <ArrowUpRight aria-hidden className="size-2.5 shrink-0" /> : <ArrowDownRight aria-hidden className="size-2.5 shrink-0" />}
          {diffText}
        </span>
      </div>
    </div>
  );
}
