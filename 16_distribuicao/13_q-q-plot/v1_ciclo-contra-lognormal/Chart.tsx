import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  usePlotArea,
  XAxis,
  YAxis,
  ZAxis,
  ZIndexLayer,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData } from './data';

/**
 * Q-Q plot do ciclo de fechamento contra a lognormal ajustada aos próprios dados: o log do ciclo
 * observado, ordenado, contra o quantil que uma normal de mesma média e desvio daria na mesma
 * posição. Sobre a diagonal, a premissa lognormal do simulador descreve o dado; acima dela, o
 * ciclo real é mais lento do que a premissa prevê.
 */
export interface CycleQqProps {
  readonly data?: readonly number[];
  readonly height?: number;
  readonly className?: string;
}

interface QqPoint {
  /** Log do ciclo que a lognormal ajustada daria nesta posição. */
  readonly x: number;
  /** Log do ciclo observado. */
  readonly y: number;
  readonly position: number;
  readonly tail: boolean;
}

interface QqNormal {
  readonly points: readonly QqPoint[];
  readonly count: number;
}

/** Abaixo disto o Q-Q é ruído, e o desenho some em favor do aviso. */
const MIN_COUNT = 20;
/** Afastamento no log (cerca de 13% em dias) a partir do qual um ponto conta como fora da diagonal. */
const TAIL_GAP = 0.12;
/** Pontos seguidos fora da diagonal, contados do topo, para a cauda existir. */
const TAIL_MIN_POINTS = 3;
/** Degraus de dias dos dois eixos: triplicam a cada passo, que é o que o log enxerga como regular, . */
const DAY_LADDER = [10, 30, 90, 270, 810] as const;
/**
 * O quadrado só é quadrado se o que o plano perde na largura for igual ao que perde na altura:
 * 60 do eixo Y mais 28 de margem direita (o último tique do eixo X sai meio rótulo para fora do
 * plano) contra 32 de cima, 28 do eixo X e 28 de baixo. Os dois somam 88, e o plano sai com lados
 * iguais em qualquer tamanho do cartão.
 */
const Y_AXIS_WIDTH = 60;
const X_AXIS_HEIGHT = 28;
const MARGIN = { top: 32, right: 28, bottom: 28, left: 0 } as const;
/** Área do símbolo em px² (raio 2,6 no miolo e 4 na cauda): o tamanho só separa os dois grupos, nada mais. */
const BODY_AREA = 22;
const TAIL_AREA = 50;
const NOTE_INSET = 10;
const NOTE_LINE = 14;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Inverso da normal padrão pela aproximação racional de Acklam, erro relativo abaixo de 1,2e-9. */
function inverseNormal(p: number): number {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const tail = (q: number): number =>
    (((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) /
    ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1);
  if (p < 0.02425) return tail(Math.sqrt(-2 * Math.log(p)));
  if (p > 1 - 0.02425) return -tail(Math.sqrt(-2 * Math.log(1 - p)));
  const q = p - 0.5;
  const r = q * q;
  return (
    ((((((a[0]! * r + a[1]!) * r + a[2]!) * r + a[3]!) * r + a[4]!) * r + a[5]!) * q) /
    (((((b[0]! * r + b[1]!) * r + b[2]!) * r + b[3]!) * r + b[4]!) * r + 1)
  );
}

/**
 * Q-Q contra a normal sobre o log do ciclo, com posição de plotagem (i + 0,5) / n. Média e desvio
 * saem do próprio log, então a diagonal é y = x e só a forma é testada, nunca o nível. Devolve `null`
 * com poucos negócios ou sem variação, porque aí não há forma para comparar (EST-1b).
 */
function qqNormal(values: readonly number[]): QqNormal | null {
  const logs = values.filter((value) => value > 0).map((value) => Math.log(value)).sort((a, b) => a - b);
  const count = logs.length;
  if (count < MIN_COUNT) return null;
  const mean = logs.reduce((sum, value) => sum + value, 0) / count;
  const variance = logs.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (count - 1);
  if (variance <= 0) return null;
  const sigma = Math.sqrt(variance);
  const points: QqPoint[] = logs.map((y, index) => {
    const position = (index + 0.5) / count;
    return { x: mean + sigma * inverseNormal(position), y, position, tail: false };
  });
  // Cauda: os pontos do topo, seguidos, que ficam acima da diagonal por mais que TAIL_GAP.
  let firstTail = count;
  while (firstTail > 0 && (points[firstTail - 1]?.y ?? 0) - (points[firstTail - 1]?.x ?? 0) > TAIL_GAP) firstTail -= 1;
  const hasTail = count - firstTail >= TAIL_MIN_POINTS;
  return { points: points.map((point, index) => ({ ...point, tail: hasTail && index >= firstTail })), count };
}

/** Degraus de dias que cobrem o plano inteiro, nos dois eixos, com o mesmo domínio. */
function dayTicks(points: readonly QqPoint[]): readonly number[] {
  // Os pontos saem ordenados, e x e y crescem juntos: os extremos estão nas pontas da lista.
  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) return [];
  const lowest = Math.exp(Math.min(first.x, first.y));
  const highest = Math.exp(Math.max(last.x, last.y));
  const from = [...DAY_LADDER].reverse().find((day) => day <= lowest) ?? DAY_LADDER[0];
  const to = DAY_LADDER.find((day) => day >= highest) ?? DAY_LADDER[4];
  return DAY_LADDER.filter((day) => day >= from && day <= to).map((day) => Math.log(day));
}

const logToDays = (value: number): number => Math.round(Math.exp(value));

interface TailNoteProps {
  readonly lines: readonly string[];
}

/**
 * Anotação da cauda no canto superior esquerdo do plano, a única região que o Q-Q deixa vazia:
 * a nuvem sobe da base esquerda ao topo direito, e o canto oposto fica sem marca em qualquer dado.
 * Fica na camada 450 para vir por cima da grade, e as linhas pedem halo porque cruzam a grade.
 */
function TailNote({ lines }: TailNoteProps): ReactElement | null {
  const plot = usePlotArea();
  if (plot === undefined) return null;
  return (
    <ZIndexLayer zIndex={450}>
      {lines.map((line, index) => (
        <text
          className="font-display"
          fill="var(--text-primary)"
          fontSize={11}
          fontWeight={600}
          key={line}
          style={HALO}
          textAnchor="start"
          x={plot.x + NOTE_INSET}
          y={plot.y + NOTE_INSET + 4 + index * NOTE_LINE}
        >
          {line}
        </text>
      ))}
    </ZIndexLayer>
  );
}

export default function CycleQq({ data = defaultData, height, className }: CycleQqProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum negócio ganho neste recorte: não há ciclo para comparar com a lognormal.</span>
      </div>
    );
  }
  const qq = qqNormal(data);
  if (qq === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>{`Forma do ciclo ${formatUnavailable()}: com menos de ${formatInt(MIN_COUNT)} negócios o Q-Q não distingue forma de acaso.`}</span>
      </div>
    );
  }

  const ticks = dayTicks(qq.points);
  const domain: readonly [number, number] = [ticks[0] ?? 0, ticks[ticks.length - 1] ?? 1];
  const body = qq.points.filter((point) => !point.tail);
  const tail = qq.points.filter((point) => point.tail);
  const firstTail = tail[0];
  const noteLines =
    firstTail === undefined
      ? []
      : [`a partir de ${formatDays(logToDays(firstTail.y))},`, 'a cauda passa', 'da lognormal'];
  const summary =
    `Gráfico Q-Q do ciclo de fechamento de ${formatInt(qq.count)} negócios contra a lognormal ajustada aos próprios dados: ` +
    (firstTail === undefined
      ? 'os pontos seguem a diagonal em toda a faixa, sem cauda que a deixe.'
      : `o miolo segue a diagonal e, a partir de ${formatDays(logToDays(firstTail.y))}, ${formatInt(tail.length)} negócios ficam acima dela.`);

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as QqPoint | undefined;
    if (!point) return null;
    const items = [
      { dataKey: 'y', name: 'Ciclo medido', value: formatDays(logToDays(point.y)) },
      { dataKey: 'x', name: 'Esperado pela lognormal', value: formatDays(logToDays(point.x)) },
      { dataKey: 'position', name: 'Posição na fila', value: `${formatInt(Math.round(point.position * 100))}º percentil` },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label="Negócio ganho" labelFormat="text" payload={items} valueFormat="text" />;
  };

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <svg height={8} viewBox="0 0 8 8" width={8}>
            <circle cx={4} cy={4} fill="var(--text-muted)" r={3.5} />
          </svg>
          negócio no miolo
        </span>
        {tail.length > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <svg height={10} viewBox="0 0 10 10" width={10}>
              <polygon fill="var(--chart-1)" points="5,0.5 9.5,5 5,9.5 0.5,5" />
            </svg>
            cauda acima da diagonal
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-text-muted" />
          lognormal ajustada
        </span>
      </div>

      <div className="flex min-h-0 flex-1 justify-center">
        <div aria-hidden className="aspect-square h-full max-w-full">
          <ResponsiveContainer height="100%" width="100%">
            <ScatterChart accessibilityLayer={false} margin={MARGIN}>
              <CartesianGrid stroke={GRID_COLOR} />
              <XAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="x"
                domain={[...domain]}
                height={X_AXIS_HEIGHT}
                interval={0}
                name="Esperado pela lognormal"
                tickFormatter={(value: number) => formatDays(logToDays(value))}
                tickLine={false}
                tickMargin={8}
                ticks={[...ticks]}
                type="number"
              />
              <YAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="y"
                domain={[...domain]}
                interval={0}
                name="Ciclo medido"
                tickFormatter={(value: number) => formatDays(logToDays(value))}
                tickLine={false}
                tickMargin={8}
                ticks={[...ticks]}
                type="number"
                width={Y_AXIS_WIDTH}
              />
              <ZAxis range={[BODY_AREA, BODY_AREA]} type="number" />
              <ZAxis range={[TAIL_AREA, TAIL_AREA]} type="number" zAxisId="tail" />
              <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
              {/* extendDomain: sem ele o segmento que toca a borda do domínio é descartado (REC-1). */}
              <ReferenceLine
                ifOverflow="extendDomain"
                segment={[
                  { x: domain[0], y: domain[0] },
                  { x: domain[1], y: domain[1] },
                ]}
                stroke="var(--text-muted)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <Scatter data={[...body]} fill="var(--text-muted)" isAnimationActive={animate} shape="circle" />
              <Scatter data={[...tail]} zAxisId="tail" fill="var(--chart-1)" isAnimationActive={animate} shape="diamond" />
              <TailNote lines={noteLines} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`${formatInt(qq.count)} negócios; horizontal: ciclo esperado pela lognormal ajustada`}</span>
        <span>vertical: ciclo medido; os dois eixos em dias, escala logarítmica</span>
      </div>
    </figure>
  );
}
