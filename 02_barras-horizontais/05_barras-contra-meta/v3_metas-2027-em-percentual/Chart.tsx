import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useYAxisScale,
  type BarShapeProps,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { formatValue } from '@/components/visuals/valueFormat';
import { cn } from '@/lib/utils';
import { data as defaultData, type DirectorMetric } from './data';

/**
 * Seis indicadores de unidades diferentes lidos numa escala só: cada barra é o percentual da
 * própria meta, sobre uma faixa de fundo em três tons que muda de sentido no custo, em que menos
 * é melhor. Um traço vertical único marca 100% para todos.
 */
export interface DirectorMetricsProps {
  readonly data?: readonly DirectorMetric[];
  readonly height?: number;
  readonly className?: string;
}

const MEASURE_FILL = 'var(--chart-1)';
const BAND_LOW = 'var(--seq-1)';
const BAND_MID = 'var(--seq-2)';
const BAND_HIGH = 'var(--seq-3)';
const TARGET_LINE = 'var(--text-muted)';
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;
const DOMAIN_MAX = 1.4;
/** Fronteiras das três faixas, em fração da meta; a ordem inverte por goodDirection. */
const BAND_EDGE_LOW = 0.7;
const BAND_EDGE_MID_UP = 1;
const BAND_EDGE_MID_DOWN = 1.2;
const METRIC_AXIS = 'metric';
const NAME_AXIS_WIDTH = 210;
const RATE_WIDTH = 40;
const VALUE_WIDTH = 76;
const COLUMN_GAP = 10;
const COLUMNS_WIDTH = COLUMN_GAP * 2 + RATE_WIDTH + VALUE_WIDTH;
const MARGIN = { top: 6, right: COLUMNS_WIDTH, bottom: 0, left: 0 } as const;
const TRACK_HEIGHT = 14;
const BAR_HEIGHT = 8;
const LABEL_Z = 2000;

interface RateRow extends DirectorMetric {
  readonly rate: number;
  readonly displayRate: number;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

function toRows(data: readonly DirectorMetric[]): RateRow[] {
  return data
    .map((item) => {
      const rate = item.target > 0 ? item.actual / item.target : 0;
      return { ...item, rate, displayRate: Math.min(rate, DOMAIN_MAX) };
    })
    .sort((a, b) => b.rate - a.rate || a.name.localeCompare(b.name, 'pt-BR'));
}

/** Três retângulos em tons de um só matiz; a ordem inverte quando menos é melhor (custo). */
function QualityTrack(props: BarShapeProps): ReactElement {
  const { x, y, width, height, payload } = props;
  if (x === undefined || y === undefined || width === undefined || height === undefined) return <g />;
  const row = payload as RateRow | undefined;
  const inverted = row?.goodDirection === 'down';
  const midEdge = inverted ? BAND_EDGE_MID_DOWN : BAND_EDGE_MID_UP;
  const lowEdge = inverted ? BAND_EDGE_MID_UP : BAND_EDGE_LOW;
  const stops = inverted
    ? [
        { from: 0, to: lowEdge, fill: BAND_HIGH },
        { from: lowEdge, to: midEdge, fill: BAND_MID },
        { from: midEdge, to: DOMAIN_MAX, fill: BAND_LOW },
      ]
    : [
        { from: 0, to: lowEdge, fill: BAND_LOW },
        { from: lowEdge, to: midEdge, fill: BAND_MID },
        { from: midEdge, to: DOMAIN_MAX, fill: BAND_HIGH },
      ];
  const trackY = y + (height - TRACK_HEIGHT) / 2;
  return (
    <g>
      {stops.map((stop) => (
        <rect
          fill={stop.fill}
          height={TRACK_HEIGHT}
          key={stop.fill + String(stop.from)}
          rx={2}
          width={((stop.to - stop.from) / DOMAIN_MAX) * width}
          x={x + (stop.from / DOMAIN_MAX) * width}
          y={trackY}
        />
      ))}
    </g>
  );
}

/** Percentual atingido e valor original na unidade própria, alinhados à direita da faixa. */
function RowValues({ rows }: { readonly rows: readonly RateRow[] }) {
  const yScale = useYAxisScale(METRIC_AXIS);
  const plot = usePlotArea();
  if (!yScale || !plot) return null;
  const rateRight = plot.x + plot.width + COLUMN_GAP + RATE_WIDTH;
  const valueRight = rateRight + COLUMN_GAP + VALUE_WIDTH;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      {rows.map((row) => {
        const center = yScale(row.id, { position: 'middle' });
        if (center === undefined) return null;
        return (
          <g key={row.id}>
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-primary)"
              fontSize={12}
              fontWeight={600}
              style={HALO}
              textAnchor="end"
              x={rateRight}
              y={center}
            >
              {formatPercent(row.rate, 0)}
            </text>
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={11}
              fontWeight={500}
              textAnchor="end"
              x={valueRight}
              y={center}
            >
              {formatValue(row.actual, row.format)}
            </text>
          </g>
        );
      })}
    </ZIndexLayer>
  );
}

export default function DirectorMetrics({ data = defaultData, height, className }: DirectorMetricsProps) {
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
        <span>Nenhum indicador neste recorte: não há meta 2027 para comparar com o realizado.</span>
      </div>
    );
  }

  const byId = new Map(rows.map((row) => [row.id, row]));
  const reached = rows.filter((row) => (row.goodDirection === 'down' ? row.rate <= 1 : row.rate >= 1)).length;

  const summary = [
    `Gráfico de barras com ${formatInt(rows.length)} indicadores da meta 2027, cada um em percentual da própria meta.`,
    `${formatInt(reached)} de ${formatInt(rows.length)} estão dentro da meta.`,
    'As faixas de fundo marcam atenção, perto da meta e meta batida, invertidas no custo por reunião, em que menos é melhor.',
  ].join(' ');

  const renderName = ({ y, payload }: NameTickProps): ReactElement => {
    const row = byId.get(String(payload?.value ?? ''));
    return (
      <text dominantBaseline="central" y={Number(y)}>
        <tspan className="font-sans" fill="var(--text-primary)" fontSize={12} fontWeight={600} x={0}>
          {row?.name ?? ''}
        </tspan>
        <tspan className="font-sans" dx={6} fill="var(--text-muted)" fontSize={11}>
          {row ? `(${row.perimeter})` : ''}
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="kpi-number font-semibold text-text-primary">{formatInt(reached)}</span> de{' '}
        <span className="tabular-nums">{formatInt(rows.length)}</span> indicadores dentro da meta; faixas invertidas no
        custo por reunião
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="38%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, DOMAIN_MAX]} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="id"
              interval={0}
              tick={renderName}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
              yAxisId={METRIC_AXIS}
            />
            <Bar
              background={QualityTrack}
              barSize={BAR_HEIGHT}
              dataKey="displayRate"
              fill={MEASURE_FILL}
              isAnimationActive={animate}
              radius={[0, 2, 2, 0]}
              yAxisId={METRIC_AXIS}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{ value: 'meta', fill: 'var(--text-muted)', fontSize: 11, position: 'insideTopRight' }}
              stroke={TARGET_LINE}
              strokeDasharray="3 3"
              x={1}
            />
            <RowValues rows={rows} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
