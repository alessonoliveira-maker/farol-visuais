import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  usePlotArea,
  useXAxisScale,
  XAxis,
  YAxis,
  ZIndexLayer,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData } from './data';

/**
 * Curva de Lorenz com estornos e clientes sem receita. Saldo negativo fica fora da conta e é
 * contado em nota; receita zero fica, e a curva corre rente ao eixo até a fração de clientes sem
 * receita. Com poucos clientes a curva vira pontos e o Gini não é publicado.
 */
export interface RefundAwareLorenzProps {
  readonly data?: readonly number[];
  readonly height?: number;
  readonly className?: string;
}

interface LorenzPoint {
  readonly x: number;
  readonly curve: number;
  readonly equal: number;
}

interface Lorenz {
  readonly points: readonly LorenzPoint[];
  readonly gini: number;
  readonly count: number;
}

/** Abaixo disto a curva é degrau grosso e o Gini fica enviesado: pontos no lugar da linha, sem Gini. */
const MIN_ENTITIES = 20;
/**
 * Camadas do Recharts 3: o que um componente próprio desenha sem camada cai abaixo da grade e das
 * linhas. A faixa vai para baixo da grade (a grade segue legível por cima dela) e o texto para a
 * camada 450, acima das linhas.
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
const CURVE_STROKE = 'var(--chart-1)';
const EQUALITY_STROKE = 'var(--line-strong)';
/** Poço opaco para a faixa dos clientes sem receita: ANO-4 manda `--surface-sunken`. */
const BAND_FILL = 'var(--surface-sunken)';
const TEXT_INSET = 6;
const LINE_HEIGHT = 14;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/**
 * Lorenz com ordenação crescente e Gini pela soma dos trapézios sob a curva: G = 1 − 2A. Devolve
 * `null` sem cliente ou sem receita nenhuma, porque a fração do total não existe com total zero.
 * Zero entra na conta: é cliente medido, e a curva fica rente ao eixo enquanto ele dura.
 */
function lorenz(values: readonly number[]): Lorenz | null {
  const sorted = values.filter((value) => value >= 0).sort((a, b) => a - b);
  const total = sorted.reduce((sum, value) => sum + value, 0);
  if (sorted.length === 0 || total <= 0) return null;
  const points: LorenzPoint[] = [{ x: 0, curve: 0, equal: 0 }];
  let running = 0;
  let area = 0;
  let previous = 0;
  sorted.forEach((value, index) => {
    running += value;
    const share = running / total;
    const x = (index + 1) / sorted.length;
    area += (previous + share) / 2 / sorted.length;
    previous = share;
    points.push({ x, curve: share, equal: x });
  });
  return { points, gini: 1 - 2 * area, count: sorted.length };
}

interface ZeroBandProps {
  readonly to: number;
  readonly lines: readonly [string, string];
}

/**
 * Faixa dos clientes sem receita e as duas linhas que a nomeiam: a faixa na camada de baixo, o texto
 * na de cima, e a curva rente ao eixo corre entre as duas.
 */
function ZeroBand({ to, lines }: ZeroBandProps): ReactElement | null {
  const xScale = useXAxisScale();
  const plot = usePlotArea();
  if (xScale === undefined || plot === undefined) return null;
  const left = xScale(0);
  const right = xScale(to);
  if (left === undefined || right === undefined) return null;
  return (
    <>
      <ZIndexLayer zIndex={SHADE_LAYER}>
        <rect fill={BAND_FILL} height={plot.height} width={right - left} x={left} y={plot.y} />
      </ZIndexLayer>
      <ZIndexLayer zIndex={READING_LAYER}>
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
          x={left + TEXT_INSET}
          y={plot.y + 10 + index * LINE_HEIGHT}
        >
          {line}
        </text>
      ))}
      </ZIndexLayer>
    </>
  );
}

export default function RefundAwareLorenz({ data = defaultData, height, className }: RefundAwareLorenzProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cliente neste recorte: não há receita para distribuir entre eles.</span>
      </div>
    );
  }
  const refunds = data.filter((value) => value < 0).length;
  const zeros = data.filter((value) => value === 0).length;
  const curve = lorenz(data);
  if (curve === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>{`Concentração ${formatUnavailable()}: nenhum dos ${formatInt(data.length)} clientes tem receita positiva no período.`}</span>
      </div>
    );
  }

  const sparse = curve.count < MIN_ENTITIES;
  const zeroShare = zeros / curve.count;
  const withoutZeros = lorenz(data.filter((value) => value > 0));
  const giniText = sparse ? 'Gini não publicado' : `Gini ${formatDecimal(curve.gini, 2)}`;
  const zeroText = formatPercent(zeroShare, 0);
  const summary =
    `Curva de Lorenz da receita de ${formatInt(curve.count)} clientes: ${formatInt(zeros)} sem receita, ${zeroText} do total, ` +
    `ficam na conta e ${formatInt(refunds)} estornos ficam fora. ` +
    (sparse ? 'Com tão poucos clientes o Gini não é publicado.' : `O Gini é ${formatDecimal(curve.gini, 2)}.`);

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-secondary"
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-chart-1" />
          {sparse ? 'cada cliente' : 'curva de Lorenz'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-line-strong" />
          igualdade perfeita
        </span>
        <span className="tabular-nums">{`${giniText} · ${formatInt(curve.count)} clientes`}</span>
      </div>

      <div className="flex min-h-0 flex-1 justify-center">
        <div aria-hidden className="aspect-square h-full max-w-full">
          <ResponsiveContainer height="100%" width="100%">
            <ComposedChart accessibilityLayer={false} data={[...curve.points]} margin={MARGIN}>
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
              {zeros > 0 ? <ZeroBand lines={[`${formatInt(zeros)} clientes`, 'sem receita']} to={zeroShare} /> : null}
              <Line dataKey="equal" dot={false} isAnimationActive={false} stroke={EQUALITY_STROKE} strokeDasharray="4 3" strokeWidth={1.5} type="linear" />
              {/* Com poucos clientes a linha esconderia o degrau grosso: só os pontos, e o Gini sai da legenda. */}
              <Line
                dataKey="curve"
                dot={sparse ? { fill: CURVE_STROKE, r: 3.5, stroke: 'var(--surface-raised)', strokeWidth: 1.5 } : false}
                isAnimationActive={animate}
                stroke={sparse ? 'none' : CURVE_STROKE}
                strokeWidth={2}
                type="linear"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`${formatInt(refunds)} estornos ficaram fora da conta`}</span>
        <span className="tabular-nums">{`${formatInt(zeros)} clientes sem receita mantidos: a curva corre rente ao eixo até ${zeroText}`}</span>
        {withoutZeros === null || sparse ? null : (
          <span className="tabular-nums">{`sem os zeros o Gini seria ${formatDecimal(withoutZeros.gini, 2)}, e não ${formatDecimal(curve.gini, 2)}: esconderia a desigualdade`}</span>
        )}
      </div>
    </figure>
  );
}
