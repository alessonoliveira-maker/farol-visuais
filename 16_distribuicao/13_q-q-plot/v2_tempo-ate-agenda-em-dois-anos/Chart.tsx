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
import { data as defaultData, type TimeToScheduleSamples } from './data';

/**
 * Q-Q de duas amostras: o tempo até a agenda de 2025 no eixo horizontal e o de 2026 no vertical,
 * comparados nos mesmos percentis. Sobre a diagonal, os dois anos têm a mesma distribuição; uma
 * reta paralela à diagonal seria só deslocamento, e o que sobe mais que ela é cauda mais longa.
 */
export interface ScheduleQqProps {
  readonly data?: TimeToScheduleSamples;
  readonly height?: number;
  readonly className?: string;
}

interface QqPoint {
  /** Quantil de 2025, em dias. */
  readonly x: number;
  /** Quantil de 2026, em dias, na mesma probabilidade. */
  readonly y: number;
  readonly position: number;
  readonly tail: boolean;
}

/** Quantos percentis a grade comum tem: menor que o menor ano, para nenhum ficar sem observação. */
const GRID_SIZE = 50;
/** Menos observações que isto em um dos anos, e o Q-Q não distingue forma de acaso. */
const MIN_COUNT = 20;
/** A cauda só conta de aqui para cima, e só se 2026 passar de 2025 por esta fração e por um dia. */
const TAIL_FROM = 0.75;
const TAIL_RATIO = 0.1;
/** Degrau dos dois eixos em dias: com o teto de 2026 perto de 40 dá cinco linhas de grade. */
const DAY_STEP = 10;
/**
 * O quadrado só é quadrado se o que o plano perde na largura for igual ao que perde na altura:
 * 60 do eixo Y mais 28 de margem direita (o último tique do eixo X sai meio rótulo para fora do
 * plano) contra 32 de cima, 28 do eixo X e 28 de baixo. Os dois somam 88, e o plano sai com lados
 * iguais em qualquer tamanho do cartão.
 */
const Y_AXIS_WIDTH = 60;
const X_AXIS_HEIGHT = 28;
const MARGIN = { top: 32, right: 28, bottom: 28, left: 0 } as const;
/** Área do símbolo em px² (raio 2,6 no miolo e 4 na cauda): o tamanho só separa os dois grupos. */
const BODY_AREA = 22;
const TAIL_AREA = 50;
const NOTE_INSET = 10;
const NOTE_LINE = 14;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

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
 * Q-Q de duas amostras numa grade comum de probabilidades. Nunca se emparelha por índice: com 140
 * contra 95 reuniões, a 95ª de um ano e a 95ª do outro estariam em percentis diferentes, e o
 * desenho inventaria uma diferença de forma que é só de tamanho de amostra.
 */
function qqTwoSamples(previous: readonly number[], current: readonly number[]): readonly QqPoint[] | null {
  if (previous.length < MIN_COUNT || current.length < MIN_COUNT) return null;
  const sortedPrevious = [...previous].sort((a, b) => a - b);
  const sortedCurrent = [...current].sort((a, b) => a - b);
  const points: QqPoint[] = [];
  for (let k = 0; k < GRID_SIZE; k += 1) {
    const position = (k + 0.5) / GRID_SIZE;
    const x = quantile(sortedPrevious, position);
    const y = quantile(sortedCurrent, position);
    if (x === null || y === null) continue;
    const tail = position >= TAIL_FROM && y > x * (1 + TAIL_RATIO) && y - x >= 1;
    points.push({ x, y, position, tail });
  }
  return points;
}

/** Quantil do meio de uma amostra, ou `null` sem observação. */
function median(values: readonly number[]): number | null {
  return quantile([...values].sort((a, b) => a - b), 0.5);
}

interface TailNoteProps {
  readonly lines: readonly string[];
}

/**
 * Anotação da cauda no canto inferior direito do plano, a única região que este Q-Q deixa vazia:
 * os pontos sobem da base esquerda ao topo e a cauda de 2026 fica acima da diagonal, então o canto
 * de baixo à direita não recebe marca em dado nenhum. Fica na camada 450, por cima da grade, e as
 * linhas pedem halo porque cruzam a grade.
 */
function TailNote({ lines }: TailNoteProps): ReactElement | null {
  const plot = usePlotArea();
  if (plot === undefined) return null;
  const bottom = plot.y + plot.height - NOTE_INSET - (lines.length - 1) * NOTE_LINE;
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
          textAnchor="end"
          x={plot.x + plot.width - NOTE_INSET}
          y={bottom + index * NOTE_LINE}
        >
          {line}
        </text>
      ))}
    </ZIndexLayer>
  );
}

export default function ScheduleQq({ data = defaultData, height, className }: ScheduleQqProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.previous.length === 0 && data.current.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma reunião agendada neste recorte: não há tempo até a agenda para comparar os anos.</span>
      </div>
    );
  }
  const points = qqTwoSamples(data.previous, data.current);
  const last = points?.[points.length - 1];
  if (points === null || last === undefined) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>{`Forma do tempo até a agenda ${formatUnavailable()}: um dos anos tem menos de ${formatInt(MIN_COUNT)} reuniões, e o Q-Q não distingue forma de acaso.`}</span>
      </div>
    );
  }

  const top = Math.max(DAY_STEP, Math.ceil(Math.max(last.x, last.y) / DAY_STEP) * DAY_STEP);
  const ticks = Array.from({ length: top / DAY_STEP + 1 }, (_, index) => index * DAY_STEP);
  const body = points.filter((point) => !point.tail);
  const tail = points.filter((point) => point.tail);
  const lastPercentile = formatInt(Math.round(last.position * 100));
  const noteLines = last.tail
    ? [`no percentil ${lastPercentile}: ${formatDays(Math.round(last.x))}`, `em 2025, ${formatDays(Math.round(last.y))} em 2026`]
    : [];
  const medianPrevious = median(data.previous);
  const medianCurrent = median(data.current);
  const medians =
    medianPrevious === null || medianCurrent === null
      ? ''
      : ` A mediana foi de ${formatDays(Math.round(medianPrevious))} em 2025 e de ${formatDays(Math.round(medianCurrent))} em 2026.`;
  const summary =
    `Gráfico Q-Q do tempo até a agenda em 2025 (${formatInt(data.previous.length)} reuniões) contra 2026 ` +
    `(${formatInt(data.current.length)}), nos mesmos percentis.${medians} ` +
    (tail.length === 0
      ? 'Os pontos seguem a diagonal em toda a faixa.'
      : `${formatInt(tail.length)} dos ${formatInt(points.length)} percentis ficam acima da diagonal, todos na cauda.`);

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as QqPoint | undefined;
    if (!point) return null;
    const items = [
      { dataKey: 'x', name: '2025', value: formatDays(Math.round(point.x)) },
      { dataKey: 'y', name: '2026', value: formatDays(Math.round(point.y)) },
      { dataKey: 'position', name: 'Percentil', value: `${formatInt(Math.round(point.position * 100))}º` },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label="Tempo até a agenda" labelFormat="text" payload={items} valueFormat="text" />;
  };

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <svg height={8} viewBox="0 0 8 8" width={8}>
            <circle cx={4} cy={4} fill="var(--text-muted)" r={3.5} />
          </svg>
          percentil
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
          os anos iguais
        </span>
        <span className="tabular-nums">{`n 2025: ${formatInt(data.previous.length)} · n 2026: ${formatInt(data.current.length)}`}</span>
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
                domain={[0, top]}
                height={X_AXIS_HEIGHT}
                interval={0}
                name="2025"
                tickFormatter={(value: number) => formatDays(value)}
                tickLine={false}
                tickMargin={8}
                ticks={ticks}
                type="number"
              />
              <YAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="y"
                domain={[0, top]}
                interval={0}
                name="2026"
                tickFormatter={(value: number) => formatDays(value)}
                tickLine={false}
                tickMargin={8}
                ticks={ticks}
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
                  { x: 0, y: 0 },
                  { x: top, y: top },
                ]}
                stroke="var(--text-muted)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <Scatter data={[...body]} fill="var(--text-muted)" isAnimationActive={animate} shape="circle" />
              <Scatter data={[...tail]} fill="var(--chart-1)" isAnimationActive={animate} shape="diamond" zAxisId="tail" />
              <TailNote lines={noteLines} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div aria-hidden className="flex shrink-0 flex-col gap-0.5 text-[0.6875rem] leading-4 text-text-muted">
        <span>horizontal: tempo até a agenda em 2025; vertical: o de 2026 no mesmo percentil</span>
        <span>{`${formatInt(points.length)} percentis de ${formatInt(100 / GRID_SIZE)}% em ${formatInt(100 / GRID_SIZE)}%, interpolados: os anos têm tamanhos diferentes`}</span>
      </div>
    </figure>
  );
}
