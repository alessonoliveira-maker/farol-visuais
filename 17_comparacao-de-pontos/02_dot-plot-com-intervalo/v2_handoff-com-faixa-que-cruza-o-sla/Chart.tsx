import { Filter, TriangleAlert } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  ErrorBar,
  ReferenceArea,
  ReferenceLine,
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
import { formatDays, formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, SLA_DAYS, type HandoffAcceptance } from './data';

/**
 * Dot plot com intervalo contra um teto: o ponto é a mediana do tempo de aceite do handoff de cada
 * executivo e a faixa vai do primeiro ao terceiro quartil. Quando a faixa atravessa o SLA, o
 * resultado não permite concluir se a pessoa cumpre o prazo, e a linha ganha a cor de atenção e o
 * ícone de alerta, que não dependem só da cor.
 */
export interface HandoffSlaPlotProps {
  readonly data?: readonly HandoffAcceptance[];
  readonly height?: number;
  readonly className?: string;
}

/** Domínio e tiques fixos, em dias: o SLA tem de caber sempre no eixo (EIX-9). */
const X_DOMAIN: [number, number] = [0, 5];
const X_TICKS = [0, 1, 2, 3, 4, 5];
const MARGIN = { top: 20, right: 28, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 156;
const X_AXIS_HEIGHT = 26;
/** Passo da linha: também é a altura da área sensível ao cursor. */
const ROW_STEP = 24;
const DOT_RADIUS = 5;
const SERIF_WIDTH = 6;
const BAND_STROKE_WIDTH = 2;
const VALUE_LABEL_GAP = 8;
const ICON_SIZE = 12;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 3 } as const;
const LOCALE = 'pt-BR';

interface HandoffRow extends HandoffAcceptance {
  readonly rank: number;
  readonly crosses: boolean;
  /** Distâncias a partir da mediana: é isso que o ErrorBar espera, e não os limites absolutos. */
  readonly errorX: readonly [number, number];
}

interface MarkerShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: HandoffRow;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Mediana maior primeiro: quem pode estourar o SLA fica no alto. Empate pelo nome. */
function rankByMedian(rows: readonly HandoffAcceptance[]): HandoffRow[] {
  return [...rows]
    .sort((a, b) => b.median - a.median || a.name.localeCompare(b.name, LOCALE))
    .map((row, rank) => ({
      ...row,
      rank,
      crosses: row.q1 <= SLA_DAYS && row.q3 >= SLA_DAYS,
      errorX: [row.median - row.q1, row.q3 - row.median],
    }));
}

/** Dias com uma casa: o SLA de 2 dias se decide em décimos, e formatDays arredondaria para inteiro. */
function daysText(days: number): string {
  return `${formatDecimal(days, 1)} dias`;
}

function NameTick({ y, label }: NameTickProps & { readonly label: string }): ReactElement {
  return (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {label}
    </text>
  );
}

/** Triângulo de alerta em SVG puro, o mesmo desenho do ícone da linha de leitura. */
function AlertGlyph({ x, y }: { readonly x: number; readonly y: number }): ReactElement {
  const half = ICON_SIZE / 2;
  return (
    <g fill="none" stroke="var(--warning)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} transform={`translate(${String(x)} ${String(y)})`}>
      <path d={`M0 ${String(-half)} L${String(half)} ${String(half - 1)} L${String(-half)} ${String(half - 1)} Z`} />
      <path d="M0 -2 L0 1.5 M0 3.5 L0 3.6" />
    </g>
  );
}

/**
 * Ponto da mediana, valor escrito à direita da serifa do 3º quartil (com o ícone quando a faixa
 * cruza o SLA) e a banda inteira da linha como alvo do cursor. A serifa vem da escala do eixo X,
 * porque a forma própria do Scatter só recebe cx e cy (REC-31).
 */
function MarkerShape({ cx, cy, payload }: MarkerShapeProps): ReactElement | null {
  const area = usePlotArea();
  const scale = useXAxisScale();
  if (cx === undefined || cy === undefined || payload === undefined || area === undefined) return null;
  const labelX = (scale?.(payload.q3) ?? cx) + SERIF_WIDTH / 2 + VALUE_LABEL_GAP;
  const textX = payload.crosses ? labelX + ICON_SIZE + 4 : labelX;
  return (
    <g>
      <rect fill="none" height={ROW_STEP} pointerEvents="all" width={area.width} x={area.x} y={cy - ROW_STEP / 2} />
      <circle cx={cx} cy={cy} fill={payload.crosses ? 'var(--warning)' : 'var(--chart-1)'} r={DOT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} />
      {payload.crosses ? <AlertGlyph x={labelX + ICON_SIZE / 2} y={cy} /> : null}
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={11} fontWeight={600} style={HALO} x={textX} y={cy}>
        {daysText(payload.median)}
      </text>
    </g>
  );
}

/** A banda é desenhada pelo ErrorBar; a forma do ponto que o carrega não pinta nada. */
function NoShape(): ReactElement {
  return <g />;
}

export default function HandoffSlaPlot({ data = defaultData, height, className }: HandoffSlaPlotProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = rankByMedian(data);
  const top = rows[0];
  const bottom = rows[rows.length - 1];

  if (!top || !bottom) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não houve handoff aceito no período.</span>
      </div>
    );
  }

  const crossing = rows.filter((row) => row.crosses);
  const clear = rows.filter((row) => !row.crosses);
  const slaText = formatDays(SLA_DAYS);
  const summary = [
    `Gráfico de pontos com a mediana de aceite do handoff de ${formatInt(rows.length)} executivos, faixa entre quartis e SLA de ${slaText}.`,
    `A faixa cruza o SLA em ${formatInt(crossing.length)} deles: resultado não conclusivo.`,
    `A maior mediana é de ${top.name}, ${daysText(top.median)}; a menor, de ${bottom.name}, ${daysText(bottom.median)}.`,
  ].join(' ');

  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;
  /** Linhas de zebra: as ímpares, em faixa inteira, atrás da grade (zIndex abaixo dos −100 dela). */
  const zebra = rows.filter((row) => row.rank % 2 === 1);

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as HandoffRow | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'median', name: 'Mediana', value: daysText(row.median) },
      { dataKey: 'q1', name: '1º quartil', value: daysText(row.q1) },
      { dataKey: 'q3', name: '3º quartil', value: daysText(row.q3) },
      { dataKey: 'sla', name: `Contra o SLA de ${slaText}`, value: row.crosses ? 'faixa cruza o SLA' : 'faixa abaixo do SLA' },
      { dataKey: 'handoffs', name: 'Handoffs medidos', value: `${formatInt(row.handoffs)} handoffs` },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs text-text-secondary">
        Ordenado pela mediana, do maior para o menor tempo. Ponto na <span className="font-semibold text-text-primary">mediana</span>, faixa entre quartis
      </p>
      <p aria-hidden className="mb-2 mt-1 flex shrink-0 items-center gap-1.5 text-xs text-text-secondary">
        <TriangleAlert aria-hidden className="size-3 shrink-0 text-warning" />
        <span>
          <span className="kpi-number font-medium text-text-primary">{formatInt(crossing.length)}</span> de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(rows.length)}</span> faixas cruzam o SLA: resultado não conclusivo
        </span>
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
              tick={(props: NameTickProps) => <NameTick {...props} label={rows[Number(props.payload?.value)]?.name ?? ''} />}
              tickLine={false}
              ticks={rows.map((row) => row.rank)}
              type="number"
              width={NAME_AXIS_WIDTH}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={({ viewBox }: { viewBox?: { x?: number; y?: number } }) => (
                <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x} y={(viewBox?.y ?? 0) - 6}>
                  {`SLA de ${slaText}`}
                </text>
              )}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              x={SLA_DAYS}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {/* Bandas primeiro na árvore: o ponto da mediana, pintado depois, fica por cima da linha (REC-13). Duas séries porque o ErrorBar tem uma cor só. */}
            <Scatter data={clear} isAnimationActive={animate} legendType="none" shape={NoShape} tooltipType="none">
              <ErrorBar dataKey="errorX" direction="x" isAnimationActive={animate} stroke="var(--text-muted)" strokeWidth={BAND_STROKE_WIDTH} width={SERIF_WIDTH} />
            </Scatter>
            <Scatter data={crossing} isAnimationActive={animate} legendType="none" shape={NoShape} tooltipType="none">
              <ErrorBar dataKey="errorX" direction="x" isAnimationActive={animate} stroke="var(--warning)" strokeWidth={BAND_STROKE_WIDTH} width={SERIF_WIDTH} />
            </Scatter>
            <Scatter data={rows} isAnimationActive={animate} shape={(props: MarkerShapeProps) => <MarkerShape {...props} />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
