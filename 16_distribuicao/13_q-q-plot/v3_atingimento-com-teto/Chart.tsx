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
  useYAxisScale,
  XAxis,
  YAxis,
  ZAxis,
  ZIndexLayer,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData } from './data';

/**
 * Q-Q do atingimento de meta contra uma normal ajustada ao miolo dos próprios dados. O sistema de
 * origem registra no máximo 150%, então os melhores executivos formam um patamar horizontal no topo:
 * o desvio ali é do teto, não da forma da distribuição, e o miolo segue a diagonal.
 */
export interface AttainmentQqProps {
  readonly data?: readonly number[];
  readonly height?: number;
  readonly className?: string;
}

interface QqPoint {
  /** Atingimento que a normal ajustada daria nesta posição. */
  readonly x: number;
  /** Atingimento observado. */
  readonly y: number;
  readonly position: number;
  readonly capped: boolean;
}

interface QqRobust {
  readonly points: readonly QqPoint[];
  readonly count: number;
}

/** Teto do sistema de origem, como fração da meta: o que passa dele é registrado como ele. */
const CEILING = 1.5;
/** Abaixo disto o Q-Q é ruído, e o desenho some em favor do aviso. */
const MIN_COUNT = 20;
/** Desvio da normal a partir do intervalo interquartil: o IQR de uma normal vale 1,349 desvios. */
const IQR_PER_SIGMA = 1.349;
const TOP = 2;
const TICKS = [0, 0.5, 1, 1.5, 2] as const;
/**
 * O quadrado só é quadrado se o que o plano perde na largura for igual ao que perde na altura:
 * 52 do eixo Y mais 28 de margem direita (o último tique do eixo X sai meio rótulo para fora do
 * plano) contra 24 de cima, 28 do eixo X e 28 de baixo. Os dois somam 80, e o plano sai com lados
 * iguais em qualquer tamanho do cartão.
 */
const Y_AXIS_WIDTH = 52;
const X_AXIS_HEIGHT = 28;
const MARGIN = { top: 24, right: 28, bottom: 28, left: 0 } as const;
/** Área do símbolo em px² (raio 2,6 no miolo e 4 no teto): o tamanho só separa os dois grupos. */
const BODY_AREA = 22;
const CEILING_AREA = 50;
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
 * Quantil de uma amostra ordenada na probabilidade `p`, interpolado entre as duas observações
 * vizinhas com a mesma posição de plotagem (i + 0,5) / n. Devolve `null` para amostra vazia.
 */
function quantile(sorted: readonly number[], p: number): number | null {
  const count = sorted.length;
  if (count === 0) return null;
  const h = Math.min(Math.max(p * count - 0.5, 0), count - 1);
  const low = Math.floor(h);
  const a = sorted[low];
  const b = sorted[Math.min(low + 1, count - 1)];
  if (a === undefined || b === undefined) return null;
  return a + (h - low) * (b - a);
}

/**
 * Q-Q contra a normal com posição de plotagem (i + 0,5) / n. A normal sai da mediana e do
 * intervalo interquartil, e não da média e do desvio: os casos truncados no teto puxariam a média
 * para baixo e achatariam o desvio, e a diagonal deixaria de valer para o miolo. Devolve `null`
 * com poucos executivos ou sem dispersão, porque aí não há forma para comparar (EST-1b).
 */
function qqNormal(values: readonly number[]): QqRobust | null {
  const sorted = values.filter((value) => Number.isFinite(value) && value >= 0).sort((a, b) => a - b);
  const count = sorted.length;
  if (count < MIN_COUNT) return null;
  const center = quantile(sorted, 0.5);
  const lower = quantile(sorted, 0.25);
  const upper = quantile(sorted, 0.75);
  if (center === null || lower === null || upper === null || upper <= lower) return null;
  const sigma = (upper - lower) / IQR_PER_SIGMA;
  const points: QqPoint[] = sorted.map((y, index) => {
    const position = (index + 0.5) / count;
    return { x: center + sigma * inverseNormal(position), y, position, capped: y >= CEILING };
  });
  return { points, count };
}

interface CeilingNoteProps {
  readonly label: string;
  readonly note: readonly string[];
}

/**
 * Rótulo do teto e nota que atribui o desvio a ele, escritos logo acima da linha de 150%, na faixa
 * entre o teto e o topo do plano: nenhum atingimento passa do teto, então ali não há marca. Não são
 * o `label` da `ReferenceLine` porque o rótulo nativo nasce na altura da linha, em cima dos pontos
 * do patamar (REC-4). Camada 450, por cima da grade, com halo porque as linhas cruzam a grade.
 */
function CeilingNote({ label, note }: CeilingNoteProps): ReactElement | null {
  const plot = usePlotArea();
  const yScale = useYAxisScale();
  if (plot === undefined || yScale === undefined) return null;
  const lineY = yScale(CEILING);
  if (lineY === undefined) return null;
  const lines = [...note, label];
  return (
    <ZIndexLayer zIndex={450}>
      {lines.map((line, index) => (
        <text
          className="font-display"
          fill="var(--text-primary)"
          fontSize={11}
          fontWeight={index === lines.length - 1 ? 700 : 500}
          key={line}
          style={HALO}
          textAnchor="start"
          x={plot.x + NOTE_INSET}
          y={lineY - NOTE_INSET + (index - lines.length + 1) * NOTE_LINE}
        >
          {line}
        </text>
      ))}
    </ZIndexLayer>
  );
}

export default function AttainmentQq({ data = defaultData, height, className }: AttainmentQqProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo com meta neste recorte: não há atingimento para comparar com a normal.</span>
      </div>
    );
  }
  const qq = qqNormal(data);
  if (qq === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>{`Forma do atingimento ${formatUnavailable()}: com menos de ${formatInt(MIN_COUNT)} executivos o Q-Q não distingue forma de acaso.`}</span>
      </div>
    );
  }

  const body = qq.points.filter((point) => !point.capped);
  const capped = qq.points.filter((point) => point.capped);
  const ceilingText = formatPercent(CEILING, 0);
  const summary =
    `Gráfico Q-Q do atingimento de meta de ${formatInt(qq.count)} executivos contra a normal ajustada ao miolo: ` +
    (capped.length === 0
      ? 'nenhum chegou ao teto e os pontos seguem a diagonal.'
      : `o miolo segue a diagonal e ${formatInt(capped.length)} estão no teto de ${ceilingText}, formando uma linha horizontal no topo.`);

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as QqPoint | undefined;
    if (!point) return null;
    const items = [
      { dataKey: 'y', name: 'Atingimento', value: point.capped ? `${formatPercent(point.y, 0)}, no teto` : formatPercent(point.y, 0) },
      { dataKey: 'x', name: 'Esperado pela normal', value: formatPercent(point.x, 0) },
      { dataKey: 'position', name: 'Posição na fila', value: `${formatInt(Math.round(point.position * 100))}º percentil` },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label="Executivo" labelFormat="text" payload={items} valueFormat="text" />;
  };

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <svg height={8} viewBox="0 0 8 8" width={8}>
            <circle cx={4} cy={4} fill="var(--text-muted)" r={3.5} />
          </svg>
          abaixo do teto
        </span>
        {capped.length > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <svg height={10} viewBox="0 0 10 10" width={10}>
              <polygon fill="var(--chart-1)" points="5,0.5 9.5,5 5,9.5 0.5,5" />
            </svg>
            no teto
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-text-muted" />
          normal ajustada
        </span>
        <span className="tabular-nums">{`${formatInt(qq.count)} executivos`}</span>
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
                domain={[0, TOP]}
                height={X_AXIS_HEIGHT}
                interval={0}
                name="Esperado pela normal"
                tickFormatter={(value: number) => formatPercent(value, 0)}
                tickLine={false}
                tickMargin={8}
                ticks={[...TICKS]}
                type="number"
              />
              <YAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="y"
                domain={[0, TOP]}
                interval={0}
                name="Atingimento"
                tickFormatter={(value: number) => formatPercent(value, 0)}
                tickLine={false}
                tickMargin={8}
                ticks={[...TICKS]}
                type="number"
                width={Y_AXIS_WIDTH}
              />
              <ZAxis range={[BODY_AREA, BODY_AREA]} type="number" />
              <ZAxis range={[CEILING_AREA, CEILING_AREA]} type="number" zAxisId="ceiling" />
              <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
              {/* extendDomain: sem ele o segmento que toca a borda do domínio é descartado (REC-1). */}
              <ReferenceLine
                ifOverflow="extendDomain"
                segment={[
                  { x: 0, y: 0 },
                  { x: TOP, y: TOP },
                ]}
                stroke="var(--text-muted)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <ReferenceLine ifOverflow="extendDomain" stroke="var(--text-secondary)" strokeWidth={1.5} y={CEILING} />
              <Scatter data={[...body]} fill="var(--text-muted)" isAnimationActive={animate} shape="circle" />
              <Scatter data={[...capped]} fill="var(--chart-1)" isAnimationActive={animate} shape="diamond" zAxisId="ceiling" />
              <CeilingNote label={`teto do sistema: ${ceilingText}`} note={['o desvio no topo vem do teto,', 'não da forma']} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted">
        <span className="tabular-nums">{`${formatInt(capped.length)} de ${formatInt(qq.count)} executivos estão no teto e ficam fora da leitura de forma`}</span>
        <span>horizontal: atingimento esperado pela normal ajustada; vertical: medido</span>
      </div>
    </figure>
  );
}
