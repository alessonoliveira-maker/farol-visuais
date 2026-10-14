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
import { data as defaultData } from './data';

/**
 * Curva de Lorenz: clientes do menor para o maior no eixo horizontal, receita acumulada no
 * vertical. A diagonal é a carteira em que todos pagam o mesmo; a área entre ela e a curva é a
 * concentração, resumida no Gini. A frase de leitura traduz a curva em quanto vem de poucos.
 */
export interface RevenueLorenzProps {
  readonly data?: readonly number[];
  readonly height?: number;
  readonly className?: string;
}

interface LorenzPoint {
  readonly x: number;
  readonly curve: number;
  readonly equal: number;
  /** Faixa entre a curva e a diagonal, no formato [base, topo] que a `Area` em par lê. */
  readonly band: readonly [number, number];
}

interface Lorenz {
  readonly points: readonly LorenzPoint[];
  readonly gini: number;
  readonly count: number;
}

/** Marcação central da peça: a fração dos maiores clientes que a frase de leitura traduz. */
const TOP_FRACTION = 0.1;
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
 * de baixo. Os dois somam 52, e o plano sai com lados iguais em qualquer tamanho do cartão.
 */
const Y_AXIS_WIDTH = 44;
const X_AXIS_HEIGHT = 26;
const MARGIN = { top: 12, right: 8, bottom: 14, left: 0 } as const;
const CURVE_STROKE = 'var(--chart-1)';
const EQUALITY_STROKE = 'var(--line-strong)';
/** Poço opaco para a concentração: opacidade em `--chart-1` não passa de 3:1 (ACE-5), e o contorno da curva já carrega a marca. */
const BAND_FILL = 'var(--surface-sunken)';
/** Respiro entre o rótulo e a barra de leitura dos maiores clientes. */
const LABEL_GAP = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/**
 * Lorenz com ordenação crescente e Gini pela soma dos trapézios sob a curva: G = 1 − 2A. Devolve
 * `null` sem cliente ou sem receita nenhuma, porque a fração do total não existe com total zero.
 */
function lorenz(values: readonly number[]): Lorenz | null {
  const sorted = values.filter((value) => value >= 0).sort((a, b) => a - b);
  const total = sorted.reduce((sum, value) => sum + value, 0);
  if (sorted.length === 0 || total <= 0) return null;
  const points: LorenzPoint[] = [{ x: 0, curve: 0, equal: 0, band: [0, 0] }];
  let running = 0;
  let area = 0;
  let previous = 0;
  sorted.forEach((value, index) => {
    running += value;
    const share = running / total;
    const x = (index + 1) / sorted.length;
    area += ((previous + share) / 2) / sorted.length;
    previous = share;
    points.push({ x, curve: share, equal: x, band: [share, x] });
  });
  return { points, gini: 1 - 2 * area, count: sorted.length };
}

/** Parte do total dos `fraction` maiores, lida na curva, ou `null` sem curva. */
function topShare(curve: Lorenz | null, fraction: number): { readonly at: LorenzPoint; readonly share: number } | null {
  if (curve === null) return null;
  const at = curve.points[Math.round((1 - fraction) * curve.count)];
  return at === undefined ? null : { at, share: 1 - at.curve };
}

interface ReadingProps {
  readonly at: LorenzPoint;
  readonly text: string;
}

/**
 * Barra, ponto e frase dos maiores clientes, desenhados pelas escalas do próprio gráfico: a barra
 * sobe do ponto da curva até 100% e mede, no eixo vertical, a parte que cabe aos maiores. Vai na
 * camada 450 para ficar por cima da área e das linhas.
 */
function Reading({ at, text }: ReadingProps): ReactElement | null {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (xScale === undefined || yScale === undefined || plot === undefined) return null;
  const px = xScale(at.x);
  const pointY = yScale(at.curve);
  const topY = yScale(1);
  if (px === undefined || pointY === undefined || topY === undefined) return null;
  return (
    <ZIndexLayer zIndex={READING_LAYER}>
      <line stroke="var(--text-primary)" strokeLinecap="round" strokeWidth={2} x1={px} x2={px} y1={pointY} y2={topY} />
      <circle cx={px} cy={pointY} fill={CURVE_STROKE} r={4} stroke="var(--surface-raised)" strokeWidth={1.5} />
      <text
        className="tabular-nums"
        dominantBaseline="central"
        fill="var(--text-primary)"
        fontSize={12}
        fontWeight={600}
        style={HALO}
        textAnchor="end"
        x={px - LABEL_GAP}
        y={plot.y + 10}
      >
        {text}
      </text>
    </ZIndexLayer>
  );
}

export default function RevenueLorenz({ data = defaultData, height, className }: RevenueLorenzProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const curve = lorenz(data);

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cliente neste recorte: não há receita para distribuir entre eles.</span>
      </div>
    );
  }
  const top = topShare(curve, TOP_FRACTION);
  if (curve === null || top === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>{`Concentração ${formatUnavailable()}: nenhum dos ${formatInt(data.length)} clientes tem receita no período.`}</span>
      </div>
    );
  }

  const reading = `${formatPercent(TOP_FRACTION, 0)} dos clientes, ${formatPercent(top.share, 0)} da receita`;
  const summary =
    `Curva de Lorenz da receita reconhecida do ano entre ${formatInt(curve.count)} clientes: ` +
    `os ${formatPercent(TOP_FRACTION, 0)} maiores respondem por ${formatPercent(top.share, 0)} do total, ` +
    `e o Gini é ${formatDecimal(curve.gini, 2)}, em que zero seria igualdade perfeita.`;

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
          curva de Lorenz
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-line-strong" />
          igualdade perfeita
        </span>
        <span className="tabular-nums">{`Gini ${formatDecimal(curve.gini, 2)} · ${formatInt(curve.count)} clientes`}</span>
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
              <Area dataKey="band" fill={BAND_FILL} fillOpacity={1} isAnimationActive={false} stroke="none" type="linear" zIndex={SHADE_LAYER} />
              <Line dataKey="equal" dot={false} isAnimationActive={false} stroke={EQUALITY_STROKE} strokeDasharray="4 3" strokeWidth={1.5} type="linear" />
              <Line dataKey="curve" dot={false} isAnimationActive={animate} stroke={CURVE_STROKE} strokeWidth={2} type="linear" />
              <Reading at={top.at} text={reading} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted">
        <span>eixo horizontal: clientes do menor para o maior, em % acumulado</span>
        <span>eixo vertical: receita acumulada; a área sombreada é a distância até a igualdade</span>
      </div>
    </figure>
  );
}
