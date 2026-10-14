import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  ErrorBar,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  usePlotArea,
  useXAxisScale,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SegmentCycle } from './data';

/**
 * Dot plot com intervalo: o ponto é a mediana do ciclo de venda de cada segmento e a faixa vai do
 * primeiro ao terceiro quartil. As linhas seguem a mediana, do ciclo mais longo ao mais curto, e o
 * número de negócios que sustenta cada resumo fica escrito sob o nome do segmento.
 */
export interface CycleIntervalPlotProps {
  readonly data?: readonly SegmentCycle[];
  readonly height?: number;
  readonly className?: string;
}

/** Domínio e tiques fixos: o intervalo não muda com o filtro (EIX-9). */
const X_DOMAIN: [number, number] = [0, 100];
const X_TICKS = [0, 25, 50, 75, 100];
const MARGIN = { top: 12, right: 28, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 160;
const X_AXIS_HEIGHT = 26;
/** Passo da linha: também é a altura da área sensível ao cursor. */
const ROW_STEP = 34;
const DOT_RADIUS = 5;
const SERIF_WIDTH = 6;
const BAND_STROKE_WIDTH = 2;
const VALUE_LABEL_GAP = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 3 } as const;
const LOCALE = 'pt-BR';

interface CycleRow extends SegmentCycle {
  readonly rank: number;
  /** Distâncias a partir da mediana: é isso que o ErrorBar espera, e não os limites absolutos. */
  readonly errorX: readonly [number, number];
}

interface MarkerShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: CycleRow;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Mediana maior primeiro; empate resolvido pelo nome para a ordem não mudar a cada recarga. */
function rankByMedian(rows: readonly SegmentCycle[]): CycleRow[] {
  return [...rows]
    .sort((a, b) => b.median - a.median || a.name.localeCompare(b.name, LOCALE))
    .map((row, rank) => ({ ...row, rank, errorX: [row.median - row.q1, row.q3 - row.median] }));
}

/** Nome de categoria dentro de uma oração entra em minúscula; nome de pessoa não passa por aqui. */
function inSentence(name: string): string {
  return name.toLocaleLowerCase(LOCALE);
}

function NameTick({ y, label, sub }: NameTickProps & { readonly label: string; readonly sub: string }): ReactElement {
  return (
    <g>
      <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y) - 7}>
        {label}
      </text>
      <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={MARGIN.left} y={Number(y) + 7}>
        {sub}
      </text>
    </g>
  );
}

/**
 * Ponto da mediana, valor escrito à direita da serifa do 3º quartil e a banda inteira da linha como
 * alvo do cursor. A posição da serifa vem da escala do eixo X, porque a forma própria do Scatter só
 * recebe cx e cy (REC-31).
 */
function MarkerShape({ cx, cy, payload }: MarkerShapeProps): ReactElement | null {
  const area = usePlotArea();
  const scale = useXAxisScale();
  if (cx === undefined || cy === undefined || payload === undefined || area === undefined) return null;
  const upperX = scale?.(payload.q3) ?? cx;
  return (
    <g>
      <rect fill="none" height={ROW_STEP} pointerEvents="all" width={area.width} x={area.x} y={cy - ROW_STEP / 2} />
      <circle cx={cx} cy={cy} fill="var(--chart-1)" r={DOT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} />
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-primary)"
        fontSize={11}
        fontWeight={600}
        style={HALO}
        x={upperX + SERIF_WIDTH / 2 + VALUE_LABEL_GAP}
        y={cy}
      >
        {formatDays(payload.median)}
      </text>
    </g>
  );
}

/** A banda é desenhada pelo ErrorBar; a forma do ponto que o carrega não pinta nada. */
function NoShape(): ReactElement {
  return <g />;
}

export default function CycleIntervalPlot({ data = defaultData, height, className }: CycleIntervalPlotProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = rankByMedian(data);
  const longest = rows[0];
  const shortest = rows[rows.length - 1];

  if (!longest || !shortest) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum segmento neste recorte: não houve negócio ganho no período.</span>
      </div>
    );
  }

  const summary = [
    `Gráfico de pontos com a mediana do ciclo de venda de ${formatInt(rows.length)} segmentos, com faixa entre o primeiro e o terceiro quartil.`,
    `O ciclo mais longo é de ${inSentence(longest.name)}, ${formatDays(longest.median)} (de ${formatDays(longest.q1)} a ${formatDays(longest.q3)}); o mais curto, de ${inSentence(shortest.name)}, ${formatDays(shortest.median)}.`,
  ].join(' ');

  const dealsText = (row: CycleRow) => `${formatInt(row.deals)} negócios`;
  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;
  /** Linhas de zebra: as ímpares, em faixa inteira, atrás da grade (zIndex abaixo dos −100 dela). */
  const zebra = rows.filter((row) => row.rank % 2 === 1);

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as CycleRow | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'median', name: 'Mediana', value: formatDays(row.median) },
      { dataKey: 'q1', name: '1º quartil', value: formatDays(row.q1) },
      { dataKey: 'q3', name: '3º quartil', value: formatDays(row.q3) },
      { dataKey: 'deals', name: 'Negócios ganhos', value: dealsText(row) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Ponto na <span className="font-semibold text-text-primary">mediana</span>, faixa entre o 1º e o 3º quartil, do ciclo mais longo ao mais curto
      </p>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            {/* Zebra atrás da grade: o padrão da ReferenceArea (zIndex 100) pintaria sobre as linhas de grade (zIndex −100) e as apagaria. */}
            {zebra.map((row) => (
              <ReferenceArea fill="var(--surface-sunken)" ifOverflow="visible" key={row.id} stroke="none" y1={row.rank - 0.5} y2={row.rank + 0.5} zIndex={-150} />
            ))}
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="median"
              domain={X_DOMAIN}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatDays(value)}
              tickLine={false}
              tickMargin={8}
              ticks={X_TICKS}
              type="number"
            />
            {/* Eixo de linhas numérico: a linha i ocupa de i−0,5 a i+0,5. `reversed` põe a posição 0 no alto (REC-3). */}
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="rank"
              domain={[-0.5, rows.length - 0.5]}
              interval={0}
              reversed
              tick={(props: NameTickProps) => {
                const row = rows[Number(props.payload?.value)];
                return <NameTick {...props} label={row?.name ?? ''} sub={row ? dealsText(row) : ''} />;
              }}
              tickLine={false}
              ticks={rows.map((row) => row.rank)}
              type="number"
              width={NAME_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {/* Banda primeiro na árvore: o ponto da mediana, pintado depois, fica por cima da linha (REC-13). */}
            <Scatter data={rows} isAnimationActive={animate} legendType="none" shape={NoShape} tooltipType="none">
              <ErrorBar dataKey="errorX" direction="x" isAnimationActive={animate} stroke="var(--text-muted)" strokeWidth={BAND_STROKE_WIDTH} width={SERIF_WIDTH} />
            </Scatter>
            <Scatter data={rows} isAnimationActive={animate} shape={(props: MarkerShapeProps) => <MarkerShape {...props} />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
