import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import {
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
import { formatCurrencyCompact, formatDecimal, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, SPEND_THRESHOLD } from './data';

/**
 * Curva de Lorenz do investimento de mídia por campanha, com a faixa das maiores campanhas que
 * alcançam o limiar de gasto marcada no quadrado e traduzida em texto ao lado. A faixa abre a lista
 * dessas campanhas pelo callback `onOpenList`, que recebe quantas são.
 */
export interface MediaSpendLorenzProps {
  readonly data?: readonly number[];
  /** Fração do investimento que a marcação procura, entre 0 e 1. */
  readonly threshold?: number;
  /** Chamado pela faixa e pelo botão com a quantidade de campanhas que concentram o gasto. */
  readonly onOpenList?: (campaignCount: number) => void;
  readonly height?: number;
  readonly className?: string;
}

interface Lorenz {
  /** Investimento acumulado em cada posição i de n, de 0 a n, já como fração do total. */
  readonly shares: readonly number[];
  readonly total: number;
  readonly gini: number;
  readonly count: number;
}

interface CurveRow {
  readonly x: number;
  readonly curve: number;
  readonly equal: number;
}

/**
 * Erro vertical máximo, em fração, que a simplificação da curva aceita contra o dado cheio: 0,2 p.p.
 * é menos de meio pixel no plano deste cartão, e a nota do rodapé escreve este mesmo número.
 */
const RENDER_TOLERANCE = 0.002;
/**
 * Camadas do Recharts 3: o que um componente próprio desenha sem camada cai abaixo da grade e das
 * linhas. A faixa vai para baixo da grade (a grade segue legível por cima dela) e o ponto e o texto
 * para a camada 450, acima das linhas.
 */
const SHADE_LAYER = -150;
const READING_LAYER = 450;
const TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
/**
 * O quadrado só é quadrado se o que o plano perde na largura for igual ao que perde na altura:
 * 44 do eixo Y mais 16 de margem direita (cabe o tique de 100% inteiro), contra 12 de margem de cima,
 * 26 do eixo X e 22 de margem de baixo. Os dois somam 60.
 */
const Y_AXIS_WIDTH = 44;
const X_AXIS_HEIGHT = 26;
const MARGIN = { top: 12, right: 16, bottom: 22, left: 0 } as const;
const CURVE_STROKE = 'var(--chart-1)';
const EQUALITY_STROKE = 'var(--line-strong)';
/** Poço opaco para a faixa das maiores campanhas: ANO-4 manda `--surface-sunken`, nunca `--surface-overlay`. */
const BAND_FILL = 'var(--surface-sunken)';
const TEXT_INSET = 6;
const LINE_HEIGHT = 14;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/**
 * Lorenz com ordenação crescente e Gini pela soma dos trapézios sob a curva: G = 1 − 2A. Devolve
 * `null` sem campanha ou sem investimento nenhum, porque a fração do total não existe com total zero.
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
  return { shares, total, gini: 1 - 2 * area, count: sorted.length };
}

/** Menor quantidade de campanhas, das maiores, cuja soma alcança `threshold` do total; `null` sem curva. */
function concentrationCount(curve: Lorenz | null, threshold: number): number | null {
  if (curve === null) return null;
  for (let count = 1; count <= curve.count; count += 1) {
    if (1 - (curve.shares[curve.count - count] ?? 0) >= threshold) return count;
  }
  return null;
}

/**
 * Reamostra os vértices do dado cheio por Ramer, Douglas e Peucker, só na vertical: mantém o vértice
 * mais afastado da corda enquanto o afastamento passar de `RENDER_TOLERANCE`. Grade uniforme não
 * serve aqui, porque a cauda das maiores campanhas sobe quase em vertical e uma corda de 1% de
 * largura errava 15 p.p. nela. O vértice da marcação entra sempre, para o ponto cair na curva.
 */
function simplify(curve: Lorenz, forcedIndex: number): readonly CurveRow[] {
  const kept = new Set([0, forcedIndex, curve.count]);
  const pending: Array<readonly [number, number]> = [
    [0, forcedIndex],
    [forcedIndex, curve.count],
  ];
  for (let range = pending.pop(); range !== undefined; range = pending.pop()) {
    const [from, to] = range;
    const base = curve.shares[from] ?? 0;
    const slope = ((curve.shares[to] ?? 0) - base) / Math.max(to - from, 1);
    let worstIndex = -1;
    let worst = RENDER_TOLERANCE;
    for (let index = from + 1; index < to; index += 1) {
      const gap = Math.abs((curve.shares[index] ?? 0) - (base + slope * (index - from)));
      if (gap > worst) {
        worst = gap;
        worstIndex = index;
      }
    }
    if (worstIndex >= 0) {
      kept.add(worstIndex);
      pending.push([from, worstIndex], [worstIndex, to]);
    }
  }
  return [...kept]
    .sort((a, b) => a - b)
    .map((index) => ({ x: index / curve.count, curve: curve.shares[index] ?? 0, equal: index / curve.count }));
}

interface BandProps {
  readonly from: number;
  readonly onOpen: () => void;
}

/**
 * Faixa das maiores campanhas, clicável, na camada de baixo: a grade e a curva atravessam a faixa por
 * cima. O botão do painel faz a mesma ação para teclado e leitor de tela, e por isso a faixa é só
 * atalho de ponteiro.
 */
function ConcentrationBand({ from, onOpen }: BandProps): ReactElement | null {
  const xScale = useXAxisScale();
  const plot = usePlotArea();
  if (xScale === undefined || plot === undefined) return null;
  const left = xScale(from);
  const right = xScale(1);
  if (left === undefined || right === undefined) return null;
  return (
    <ZIndexLayer zIndex={SHADE_LAYER}>
      <rect className="cursor-pointer" fill={BAND_FILL} height={plot.height} onClick={onOpen} width={right - left} x={left} y={plot.y} />
    </ZIndexLayer>
  );
}

interface MarkProps {
  readonly x: number;
  readonly y: number;
  readonly lines: readonly [string, string];
}

/** Ponto da curva onde a faixa começa e a tradução em duas linhas, no canto livre acima da diagonal. */
function ConcentrationMark({ x, y, lines }: MarkProps): ReactElement | null {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (xScale === undefined || yScale === undefined || plot === undefined) return null;
  const px = xScale(x);
  const py = yScale(y);
  if (px === undefined || py === undefined) return null;
  return (
    <ZIndexLayer zIndex={READING_LAYER}>
      <circle cx={px} cy={py} fill={CURVE_STROKE} r={4} stroke="var(--surface-raised)" strokeWidth={1.5} />
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

export default function MediaSpendLorenz({
  data = defaultData,
  threshold = SPEND_THRESHOLD,
  onOpenList,
  height,
  className,
}: MediaSpendLorenzProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const curve = lorenz(data);

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte: não há investimento para distribuir entre elas.</span>
      </div>
    );
  }
  const count = concentrationCount(curve, threshold);
  if (curve === null || count === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>{`Concentração ${formatUnavailable()}: nenhuma das ${formatInt(data.length)} campanhas tem investimento no período.`}</span>
      </div>
    );
  }

  const fraction = count / curve.count;
  const markX = 1 - fraction;
  const markY = curve.shares[curve.count - count] ?? 0;
  const bandSpend = curve.total * (1 - markY);
  const rows = simplify(curve, curve.count - count);
  const fractionText = formatPercent(fraction, 0);
  const thresholdText = formatPercent(threshold, 0);
  const summary =
    `Curva de Lorenz do investimento de mídia entre ${formatInt(curve.count)} campanhas: ` +
    `${formatInt(count)} campanhas, ${fractionText} do total, consomem ${thresholdText} ou mais do investimento, ` +
    `e o Gini é ${formatDecimal(curve.gini, 2)}.`;
  const open = (): void => onOpenList?.(count);

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 items-stretch gap-4', className)}
      role="figure"
      style={style}
    >
      <div aria-hidden className="aspect-square h-full shrink-0">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="x"
              domain={[0, 1]}
              height={X_AXIS_HEIGHT}
              interval={0}
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
            <ConcentrationBand from={markX} onOpen={open} />
            <Line dataKey="equal" dot={false} isAnimationActive={false} stroke={EQUALITY_STROKE} strokeDasharray="4 3" strokeWidth={1.5} type="linear" />
            <Line dataKey="curve" dot={false} isAnimationActive={animate} stroke={CURVE_STROKE} strokeWidth={2} type="linear" />
            <ConcentrationMark lines={[`${fractionText} das campanhas`, `gastam ${thresholdText} ou mais`]} x={markX} y={markY} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between text-xs leading-4 text-text-secondary">
        <div className="flex flex-col gap-1">
          <span className="kpi-number text-3xl text-text-primary">{fractionText}</span>
          <span className="text-text-primary">{`das campanhas consomem pelo menos ${thresholdText} do investimento de mídia`}</span>
          <span className="tabular-nums">{`${formatInt(count)} campanhas somam ${formatCurrencyCompact(bandSpend)} de ${formatCurrencyCompact(curve.total)}`}</span>
        </div>
        <button
          className="w-fit rounded bg-surface-sunken px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-line-subtle focus-visible:outline-2 focus-visible:outline-chart-1"
          onClick={open}
          type="button"
        >
          {`Abrir as ${formatInt(count)} campanhas da faixa`}
        </button>
        <div aria-hidden className="flex flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-chart-1" />
            <span className="tabular-nums">{`curva de Lorenz, Gini ${formatDecimal(curve.gini, 2)}`}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-line-strong" />
            igualdade perfeita
          </span>
          <span className="tabular-nums">{`${formatInt(curve.count)} campanhas, curva em ${formatInt(rows.length)} pontos, erro até ${formatDecimal(RENDER_TOLERANCE * 100, 1)} p.p.`}</span>
        </div>
      </div>
    </figure>
  );
}
