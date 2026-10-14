import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  XAxis,
  YAxis,
  ZIndexLayer,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type RevenueComparison } from './data';

/**
 * Duas curvas de Lorenz no mesmo quadrado: o ano anterior em neutro e o atual em destaque, só o
 * atual sombreado. A leitura vem dos 10% maiores de cada ano, escritos na ordem da legenda.
 */
export interface LorenzComparisonProps {
  readonly data?: RevenueComparison;
  readonly height?: number;
  readonly className?: string;
}

interface Lorenz {
  /** Receita acumulada em cada posição i de n, de 0 a n, já como fração do total. */
  readonly shares: readonly number[];
  readonly gini: number;
  readonly count: number;
}

interface ComparisonRow {
  readonly x: number;
  readonly previous: number;
  readonly current: number;
  readonly equal: number;
  /** Faixa entre a curva atual e a diagonal, no formato [base, topo] que a `Area` em par lê. */
  readonly band: readonly [number, number];
}

/** Fração dos maiores clientes que a frase de leitura compara entre os dois anos. */
const TOP_FRACTION = 0.1;
/** Passos do eixo comum às duas curvas: cada ano tem um n, e a comparação precisa de uma grade só. */
const GRID_STEPS = 100;
/**
 * Camadas do Recharts 3: a `Area` nasce na camada 100, acima da grade e abaixo das linhas, e o que um
 * componente próprio desenha sem camada cai abaixo da `Area`. A sombra vai para baixo da grade e a
 * leitura para a camada 450, acima das linhas, senão a sombra apaga a barra e os pontos.
 */
const SHADE_LAYER = -150;
const READING_LAYER = 450;
const TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
/**
 * O quadrado só é quadrado se o que o plano perde na largura for igual ao que perde na altura:
 * 44 do eixo Y mais 8 de margem direita, contra 12 de margem de cima, 26 do eixo X e 14 de margem
 * de baixo. Os dois somam 52.
 */
const Y_AXIS_WIDTH = 44;
const X_AXIS_HEIGHT = 26;
const MARGIN = { top: 12, right: 8, bottom: 14, left: 0 } as const;
const CURRENT_STROKE = 'var(--chart-1)';
/** O ano anterior é contexto, não destaque: neutro que passa de 3:1 nos dois temas. */
const PREVIOUS_STROKE = 'var(--text-muted)';
const EQUALITY_STROKE = 'var(--line-strong)';
/** Poço opaco: opacidade em `--chart-1` não passa de 3:1 (ACE-5), e o contorno da curva já carrega a marca. */
const BAND_FILL = 'var(--surface-sunken)';
const TEXT_INSET = 6;
const LINE_HEIGHT = 14;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/**
 * Lorenz com ordenação crescente e Gini pela soma dos trapézios sob a curva: G = 1 − 2A. Devolve
 * `null` sem cliente ou sem receita nenhuma, porque a fração do total não existe com total zero.
 */
function lorenz(values: readonly number[]): Lorenz | null {
  const sorted = values.filter((value) => value >= 0).sort((a, b) => a - b);
  const total = sorted.reduce((sum, value) => sum + value, 0);
  if (sorted.length === 0 || total <= 0) return null;
  const shares: number[] = [0];
  let running = 0;
  let area = 0;
  sorted.forEach((value) => {
    running += value;
    const share = running / total;
    area += ((shares[shares.length - 1] ?? 0) + share) / 2 / sorted.length;
    shares.push(share);
  });
  return { shares, gini: 1 - 2 * area, count: sorted.length };
}

/** Altura da curva em `x`, por interpolação linear entre os dois clientes vizinhos. */
function shareAt(curve: Lorenz, x: number): number {
  const position = x * curve.count;
  const index = Math.min(Math.floor(position), curve.count);
  const lower = curve.shares[index] ?? 1;
  const upper = curve.shares[index + 1] ?? lower;
  return lower + (upper - lower) * (position - index);
}

function buildRows(previous: Lorenz, current: Lorenz): readonly ComparisonRow[] {
  return Array.from({ length: GRID_STEPS + 1 }, (_, step) => {
    const x = step / GRID_STEPS;
    const currentShare = shareAt(current, x);
    return { x, previous: shareAt(previous, x), current: currentShare, equal: x, band: [currentShare, x] as const };
  });
}

interface ReadingProps {
  readonly x: number;
  readonly previous: number;
  readonly current: number;
  readonly lines: readonly [string, string];
}

/**
 * Pontos nas duas curvas, barra entre eles e as duas frases, desenhados pelas escalas do próprio
 * gráfico. A barra mede, no eixo vertical, a distância entre os dois anos nos maiores clientes. Vai na
 * camada 450 para ficar por cima da área e das linhas.
 */
function Reading({ x, previous, current, lines }: ReadingProps): ReactElement | null {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (xScale === undefined || yScale === undefined || plot === undefined) return null;
  const px = xScale(x);
  const previousY = yScale(previous);
  const currentY = yScale(current);
  if (px === undefined || previousY === undefined || currentY === undefined) return null;
  return (
    <ZIndexLayer zIndex={READING_LAYER}>
      <line stroke="var(--text-primary)" strokeLinecap="round" strokeWidth={2} x1={px} x2={px} y1={previousY} y2={currentY} />
      <circle cx={px} cy={previousY} fill={PREVIOUS_STROKE} r={4} stroke="var(--surface-raised)" strokeWidth={1.5} />
      <circle cx={px} cy={currentY} fill={CURRENT_STROKE} r={4} stroke="var(--surface-raised)" strokeWidth={1.5} />
      {lines.map((line, index) => (
        <text
          className="tabular-nums"
          dominantBaseline="central"
          fill="var(--text-primary)"
          fontSize={12}
          fontWeight={600}
          key={line}
          style={HALO}
          textAnchor="start"
          x={plot.x + TEXT_INSET}
          y={plot.y + 10 + index * LINE_HEIGHT}
        >
          {line}
        </text>
      ))}
    </ZIndexLayer>
  );
}

/** Variação em pontos percentuais entre dois percentuais já arredondados, com sinal tipográfico. */
function signedPoints(from: number, to: number): string {
  const delta = Math.round(to * 100) - Math.round(from * 100);
  return `${delta < 0 ? '−' : '+'}${formatDecimal(Math.abs(delta), 0)} p.p.`;
}

export default function RevenueLorenzComparison({ data = defaultData, height, className }: LorenzComparisonProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const { previous: previousYear, current: currentYear } = data;

  if (previousYear.revenues.length === 0 && currentYear.revenues.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cliente neste recorte: não há receita para comparar entre os dois anos.</span>
      </div>
    );
  }
  const previousCurve = lorenz(previousYear.revenues);
  const currentCurve = lorenz(currentYear.revenues);
  if (previousCurve === null || currentCurve === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>{`Comparação ${formatUnavailable()}: um dos anos não tem receita medida, e sem base a variação não é publicada.`}</span>
      </div>
    );
  }

  const markX = 1 - TOP_FRACTION;
  const previousTop = 1 - shareAt(previousCurve, markX);
  const currentTop = 1 - shareAt(currentCurve, markX);
  const topText = formatPercent(TOP_FRACTION, 0);
  const lines = [
    `${topText} maiores: ${formatPercent(previousTop, 0)} em ${previousYear.label},`,
    `${formatPercent(currentTop, 0)} em ${currentYear.label} (${signedPoints(previousTop, currentTop)})`,
  ] as const;
  const summary =
    `Curvas de Lorenz da receita por cliente em ${previousYear.label} e ${currentYear.label}: ` +
    `os ${topText} maiores respondiam por ${formatPercent(previousTop, 0)} e passam a ${formatPercent(currentTop, 0)} do total, ` +
    `com Gini de ${formatDecimal(previousCurve.gini, 2)} para ${formatDecimal(currentCurve.gini, 2)}.`;
  const rows = buildRows(previousCurve, currentCurve);

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      <div aria-hidden className="flex shrink-0 flex-col gap-1 text-[0.6875rem] leading-4 text-text-secondary">
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <span className="h-0.5 w-4 bg-text-muted" />
          {`${previousYear.label}: Gini ${formatDecimal(previousCurve.gini, 2)}, ${formatInt(previousCurve.count)} clientes`}
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <span className="h-0.5 w-4 bg-chart-1" />
          {`${currentYear.label}: Gini ${formatDecimal(currentCurve.gini, 2)}, ${formatInt(currentCurve.count)} clientes`}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 justify-center">
        <div aria-hidden className="aspect-square h-full max-w-full">
          <ResponsiveContainer height="100%" width="100%">
            <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
              <CartesianGrid stroke={GRID_COLOR} />
              <XAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="x"
                domain={[0, 1]}
                height={X_AXIS_HEIGHT}
                tickFormatter={(value: number) => formatPercent(value, 0)}
                tickLine={false}
                tickMargin={8}
                ticks={[...TICKS]}
                type="number"
              />
              <YAxis
                {...AXIS_PROPS}
                axisLine={false}
                domain={[0, 1]}
                tickFormatter={(value: number) => formatPercent(value, 0)}
                tickLine={false}
                tickMargin={8}
                ticks={[...TICKS]}
                width={Y_AXIS_WIDTH}
              />
              <Area dataKey="band" fill={BAND_FILL} fillOpacity={1} isAnimationActive={false} stroke="none" type="linear" zIndex={SHADE_LAYER} />
              <Line dataKey="equal" dot={false} isAnimationActive={false} stroke={EQUALITY_STROKE} strokeDasharray="4 3" strokeWidth={1.5} type="linear" />
              <Line dataKey="previous" dot={false} isAnimationActive={animate} stroke={PREVIOUS_STROKE} strokeWidth={2} type="linear" />
              <Line dataKey="current" dot={false} isAnimationActive={animate} stroke={CURRENT_STROKE} strokeWidth={2} type="linear" />
              <Reading current={1 - currentTop} lines={lines} previous={1 - previousTop} x={markX} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted">
        <span>eixo horizontal: clientes do menor para o maior; vertical: receita acumulada</span>
        <span>tracejado: igualdade perfeita; sombra: a distância dela até a curva de {currentYear.label}</span>
      </div>
    </figure>
  );
}
