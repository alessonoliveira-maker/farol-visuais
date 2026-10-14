import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  ComposedChart,
  Rectangle,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useYAxisScale,
  type BarShapeProps,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, previousQuarter as defaultPreviousQuarter, type QuarterRange, type QuarterTarget } from './data';

/**
 * Barra do realizado com marcador de meta: o traço vertical fica na meta de cada pessoa e é mais
 * fino que a barra, o ponto vazado marca o trimestre anterior, e a barra acende na cor de destaque
 * só quando a meta foi batida. Nome e números vão na linha de cima, e a barra ganha a largura toda.
 */
export interface TargetMarkerBarsProps {
  /** Realizado, meta e trimestre anterior por pessoa. A ordem de entrada não importa: o componente ordena. */
  readonly data?: readonly QuarterTarget[];
  /** Trimestre anterior, para a legenda e a base da variação. */
  readonly previousQuarter?: QuarterRange;
  /** Altura em px quando o pai não tem altura definida; abaixo de 34 px por linha o texto encosta na marca. */
  readonly height?: number;
  readonly className?: string;
}

/** Destaque: só quem bateu a meta. */
const REACHED_FILL = 'var(--chart-1)';
/** Neutro de dado para quem ficou abaixo; permitido porque o realizado está escrito sobre a barra. */
const BELOW_FILL = 'var(--line-strong)';
/** Referência: meta e trimestre anterior, os dois em texto neutro e distinguidos pela forma. */
const MARKER_FILL = 'var(--text-muted)';
/** Contorno na cor do cartão em volta do traço, para ele se separar da barra que atravessa. */
const SEPARATOR_FILL = 'var(--surface-raised)';
const MARGIN = { top: 2, right: 2, bottom: 0, left: 0 } as const;
const BAR_HEIGHT = 10;
const BAR_RADIUS = 2;
/** O texto sobe a partir do centro da banda; a marca fica no centro, alinhada ao centro da barra. */
const TEXT_OFFSET = -9;
/** Traço de meta: 2 px de largura contra 10 px de barra, 3 px para fora de cada lado. */
const TICK_WIDTH = 2;
const TICK_HEIGHT = 16;
const TICK_SEPARATOR = 1;
const PREVIOUS_RADIUS = 4;
const PREVIOUS_STROKE_WIDTH = 1.5;
const TEXT_GAP = 8;
/** Colunas da direita: seta, variação e base, alinhadas à direita em larguras fixas. */
const RATE_WIDTH = 44;
const BASE_WIDTH = 118;
const CHANGE_WIDTH = 40;
const ARROW_SIZE = 7;
const ARROW_GAP = 5;
const COLUMNS_WIDTH = RATE_WIDTH + TEXT_GAP + ARROW_SIZE + ARROW_GAP + CHANGE_WIDTH + TEXT_GAP + BASE_WIDTH;
/** Único eixo de categoria: a banda inteira (texto, barra e marcas) fica na mesma linha vertical. */
const ROW_AXIS = 'row';
/** Abaixo de 10% a variação ganha uma casa decimal (NUM-1). */
const ONE_DECIMAL_BELOW = 0.1;
const MINUS = '−';
/** Camada de rótulo do Recharts (2000): texto por cima das marcas. */
const LABEL_Z = 2000;

interface MarkerRow extends QuarterTarget {
  readonly rate: number;
  readonly reached: boolean;
  /** Variação contra o trimestre anterior, como fração; null sem trimestre anterior medido. */
  readonly change: number | null;
}

interface PointShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: { readonly previous?: number | null };
}

function toRows(data: readonly QuarterTarget[]): MarkerRow[] {
  return data
    .map((item) => ({
      ...item,
      rate: item.target > 0 ? item.actual / item.target : 0,
      reached: item.target > 0 && item.actual >= item.target,
      change: item.previous === null || item.previous === 0 ? null : (item.actual - item.previous) / item.previous,
    }))
    .sort((a, b) => b.rate - a.rate || a.name.localeCompare(b.name, 'pt-BR'));
}

/** Variação com sinal à mão sobre o valor absoluto (NUM-3); zero sai sem sinal. */
function formatChange(change: number): string {
  const absolute = Math.abs(change);
  const text = formatPercent(absolute, absolute < ONE_DECIMAL_BELOW ? 1 : 0);
  if (change === 0) return text;
  return `${change > 0 ? '+' : MINUS}${text}`;
}

/** Triângulo de direção centrado em (x, y): o segundo canal da variação, além do sinal e da cor. */
function arrowPath(x: number, y: number, up: boolean): string {
  const half = ARROW_SIZE / 2;
  const tipY = up ? y - half : y + half;
  const baseY = up ? y + half : y - half;
  return `M ${String(x - half)} ${String(baseY)} L ${String(x + half)} ${String(baseY)} L ${String(x)} ${String(tipY)} Z`;
}

function TargetTick({ cx, cy }: PointShapeProps): ReactElement {
  if (cx === undefined || cy === undefined) return <g />;
  const top = cy - TICK_HEIGHT / 2;
  return (
    <g>
      <rect
        fill={SEPARATOR_FILL}
        height={TICK_HEIGHT + TICK_SEPARATOR * 2}
        width={TICK_WIDTH + TICK_SEPARATOR * 2}
        x={cx - TICK_WIDTH / 2 - TICK_SEPARATOR}
        y={top - TICK_SEPARATOR}
      />
      <rect fill={MARKER_FILL} height={TICK_HEIGHT} rx={1} width={TICK_WIDTH} x={cx - TICK_WIDTH / 2} y={top} />
    </g>
  );
}

function PreviousDot({ cx, cy, payload }: PointShapeProps): ReactElement {
  if (cx === undefined || cy === undefined || payload?.previous === null || payload?.previous === undefined) {
    return <g />;
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      fill={SEPARATOR_FILL}
      r={PREVIOUS_RADIUS}
      stroke={MARKER_FILL}
      strokeWidth={PREVIOUS_STROKE_WIDTH}
    />
  );
}

/** A barra em si: destaque só quando a meta foi batida, neutro nos demais (COR-2, valor escrito ao lado). */
function ActualBar(props: BarShapeProps): ReactElement {
  const { x, y, width, height, payload } = props;
  if (x === undefined || y === undefined || width === undefined || height === undefined) return <g />;
  const reached = Boolean((payload as MarkerRow | undefined)?.reached);
  return (
    <Rectangle
      fill={reached ? REACHED_FILL : BELOW_FILL}
      height={height}
      radius={[0, BAR_RADIUS, BAR_RADIUS, 0]}
      width={width}
      x={x}
      y={y}
    />
  );
}

/** Maior valor entre realizado, meta e trimestre anterior: o domínio precisa caber os três. */
function computeDomain(rows: readonly MarkerRow[]): number {
  return Math.max(1, ...rows.flatMap((row) => [row.actual, row.target, row.previous ?? 0]));
}

/** Nome à esquerda e, à direita, percentual atingido, variação com seta e o valor do trimestre anterior. */
function RowLabels({ rows }: { readonly rows: readonly MarkerRow[] }) {
  const yScale = useYAxisScale(ROW_AXIS);
  const plot = usePlotArea();
  if (!yScale || !plot) return null;

  const rightEdge = plot.x + plot.width;
  const baseRight = rightEdge;
  const changeRight = baseRight - BASE_WIDTH - TEXT_GAP;
  const arrowCenterX = changeRight - CHANGE_WIDTH - ARROW_GAP - ARROW_SIZE / 2;
  const rateRight = changeRight - CHANGE_WIDTH - ARROW_GAP - ARROW_SIZE - TEXT_GAP;

  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      {rows.map((row) => {
        const center = yScale(row.id, { position: 'middle' });
        if (center === undefined) return null;
        const textY = center + TEXT_OFFSET;
        return (
          <g key={row.id}>
            <text className="font-sans" fill="var(--text-primary)" fontSize={12} fontWeight={600} x={plot.x} y={textY}>
              {row.name}
            </text>
            <text
              className="font-display"
              fill="var(--text-primary)"
              fontSize={12}
              fontWeight={600}
              textAnchor="end"
              x={rateRight}
              y={textY}
            >
              {formatPercent(row.rate, 0)}
            </text>
            {row.change === null ? (
              <text
                className="font-sans"
                fill="var(--text-muted)"
                fontSize={11}
                textAnchor="end"
                x={baseRight}
                y={textY}
              >
                sem trimestre anterior medido
              </text>
            ) : (
              <>
                <path
                  aria-hidden
                  d={arrowPath(arrowCenterX, textY - 3, row.change > 0)}
                  fill={row.change === 0 ? 'var(--text-muted)' : row.change > 0 ? 'var(--positive)' : 'var(--negative)'}
                />
                <text
                  className="font-display"
                  fill={row.change === 0 ? 'var(--text-muted)' : row.change > 0 ? 'var(--positive)' : 'var(--negative)'}
                  fontSize={11}
                  fontWeight={600}
                  textAnchor="end"
                  x={changeRight}
                  y={textY}
                >
                  {formatChange(row.change)}
                </text>
                <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={baseRight} y={textY}>
                  {`contra ${formatCurrencyCompact(row.previous ?? 0)}`}
                </text>
              </>
            )}
          </g>
        );
      })}
    </ZIndexLayer>
  );
}

export default function TargetMarkerBars({
  data = defaultData,
  previousQuarter = defaultPreviousQuarter,
  height,
  className,
}: TargetMarkerBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = toRows(data);

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não há meta do trimestre para comparar com o realizado.</span>
      </div>
    );
  }

  const domainEdge = computeDomain(rows);
  const reachedCount = rows.filter((row) => row.reached).length;
  const improvedCount = rows.filter((row) => row.change !== null && row.change > 0).length;
  const leader = rows[0];
  const previousRange = `${formatMonthShort(previousQuarter.start)} a ${formatMonthShort(previousQuarter.end)}`;

  const summary = [
    `Gráfico de barras com o realizado de ${formatInt(rows.length)} executivos contra a meta individual do trimestre, do maior ao menor percentual atingido.`,
    leader ? `Lidera ${leader.name}, com ${formatPercent(leader.rate, 0)} da meta.` : '',
    `${formatInt(reachedCount)} de ${formatInt(rows.length)} bateram a meta; ${formatInt(improvedCount)} melhoraram contra o trimestre anterior.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-4 text-[0.6875rem] leading-4 text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="block h-3 w-0.5 shrink-0 rounded-full" style={{ backgroundColor: MARKER_FILL }} />
          meta
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="block size-2 shrink-0 rounded-full border"
            style={{ backgroundColor: SEPARATOR_FILL, borderColor: MARKER_FILL }}
          />
          {`realizado de ${previousRange}`}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="block size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: REACHED_FILL }} />
          meta batida
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart
            accessibilityLayer={false}
            barCategoryGap="32%"
            data={rows}
            layout="vertical"
            margin={{ ...MARGIN, right: MARGIN.right + COLUMNS_WIDTH }}
          >
            <XAxis domain={[0, domainEdge]} hide type="number" />
            <YAxis dataKey="id" hide type="category" yAxisId={ROW_AXIS} />
            <Bar
              barSize={BAR_HEIGHT}
              dataKey="actual"
              isAnimationActive={animate}
              shape={ActualBar}
              yAxisId={ROW_AXIS}
            />
            <Scatter dataKey="target" isAnimationActive={false} shape={TargetTick} yAxisId={ROW_AXIS} />
            <Scatter dataKey="previous" isAnimationActive={false} shape={PreviousDot} yAxisId={ROW_AXIS} />
            <RowLabels rows={rows} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
