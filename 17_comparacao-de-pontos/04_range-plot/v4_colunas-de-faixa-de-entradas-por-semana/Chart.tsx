import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  usePlotArea,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { dailyCapacity as defaultCapacity, data as defaultData, type WeeklyEntryRange } from './data';

/**
 * Colunas de faixa: uma cápsula vertical por semana, do menor ao maior número de entradas num dia,
 * com a capacidade diária atravessando o gráfico. Semana sem coleta não tem coluna, e a semana de
 * um só dia coletado vira traço com anel. Responde "em que semanas o pico diário passou do que o
 * time absorve".
 */
export interface WeeklyEntryRangeColumnsProps {
  /** Semanas em ordem cronológica: o eixo lê o array da esquerda para a direita. */
  readonly data?: readonly WeeklyEntryRange[];
  /** Capacidade diária de entradas, em leads por dia. */
  readonly capacity?: number;
  /** Altura da raiz em px, para pai sem altura. */
  readonly height?: number;
  readonly className?: string;
}

interface WeekRow extends WeeklyEntryRange {
  /** Largura da faixa; `null` quando a semana não teve coleta. */
  readonly span: number | null;
}

interface ColumnShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: WeekRow;
}

const RANGE_FILL = 'var(--chart-1)';
const MARGIN = { top: 24, right: 8, bottom: 0, left: 0 } as const;
const Y_AXIS_WIDTH = 36;
const X_AXIS_HEIGHT = 26;
/** Um rótulo de semana a cada quatro colunas: a data cheia do tique ocupa o espaço de quatro (EIX-7, TIP-5). */
const LABEL_EVERY = 4;
const BAR_CATEGORY_GAP = '30%';
const BAR_MAX = 16;
const TRACE_HEIGHT = 3;
const TRACE_OVERHANG = 3;
const RING_RADIUS = 6;
const RING_STROKE = 2;
const MISSING_HEIGHT = 24;
const MISSING_WIDTH = 12;
const MISSING_LIFT = 4;
const MAX_GRID_INTERVALS = 4;
const STEP_MULTIPLIERS = [1, 2, 2.5, 5, 10] as const;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

/** Maior valor da lista, ou `null` quando ela é vazia (EST-1b). */
function maxOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
}

/** Domínio e tiques redondos calculados do dado: a grade fecha na primeira linha acima do maior valor. */
function niceScale(maxValue: number): { readonly domainMax: number; readonly ticks: number[] } {
  const rough = maxValue / MAX_GRID_INTERVALS;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = STEP_MULTIPLIERS.map((m) => m * magnitude).find((s) => s >= rough) ?? rough;
  const intervals = Math.ceil(maxValue / step);
  return { domainMax: intervals * step, ticks: Array.from({ length: intervals + 1 }, (_, i) => i * step) };
}

function plural(count: number, one: string, many: string): string {
  return `${formatInt(count)} ${count === 1 ? one : many}`;
}

/**
 * Coluna de faixa desenhada à mão porque a barra empilhada chega retangular. Faixa de altura zero
 * vira traço com anel: o Recharts só chama o `shape` de dimensão zero quando ele existe (REC-11).
 * A semana sem coleta (`null`) é recusada na primeira linha, então ausência nunca se desenha como zero.
 */
function ColumnShape({ x, y, width, height, payload }: ColumnShapeProps): ReactElement | null {
  if (x === undefined || y === undefined || width === undefined || height === undefined) return null;
  // Na pilha o nulo chega ao shape como altura zero na base (medido no render): sem esta guarda a semana sem coleta desenharia o traço com anel no zero.
  if (payload === undefined || payload.min === null) return null;
  if (height === 0) {
    const cx = x + width / 2;
    return (
      <g>
        <rect fill={RANGE_FILL} height={TRACE_HEIGHT} width={width + 2 * TRACE_OVERHANG} x={x - TRACE_OVERHANG} y={y - TRACE_HEIGHT / 2} />
        <circle cx={cx} cy={y} fill="var(--surface-raised)" r={RING_RADIUS} stroke={RANGE_FILL} strokeWidth={RING_STROKE} />
      </g>
    );
  }
  const radius = Math.min(width, height) / 2;
  return <rect fill={RANGE_FILL} height={height} rx={radius} ry={radius} width={width} x={x} y={y} />;
}

interface AnnotationsProps {
  readonly rows: readonly WeekRow[];
  readonly capacity: number;
  readonly domainMax: number;
}

/**
 * Textos que só a geometria da área de plotagem sabe posicionar: a unidade do eixo, o rótulo da
 * capacidade (sobre o começo da série, que fica abaixo dela) e a marca de cada semana sem coleta.
 */
function Annotations({ rows, capacity, domainMax }: AnnotationsProps): ReactElement | null {
  const area = usePlotArea();
  if (area === undefined) return null;
  const slot = area.width / rows.length;
  const base = area.y + area.height;
  const capacityY = base - (capacity / domainMax) * area.height;
  return (
    <g>
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={0} y={area.y - 14}>
        entradas por dia
      </text>
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} x={area.x + 4} y={capacityY - 6}>
        {`capacidade diária: ${formatInt(capacity)} entradas`}
      </text>
      {rows.map((row, i) =>
        row.min === null ? (
          <g key={row.id}>
            <rect
              fill="none"
              height={MISSING_HEIGHT}
              rx={MISSING_WIDTH / 2}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              strokeWidth={RING_STROKE}
              width={MISSING_WIDTH}
              x={area.x + (i + 0.5) * slot - MISSING_WIDTH / 2}
              y={base - MISSING_LIFT - MISSING_HEIGHT}
            />
            <text className="font-sans" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={area.x + (i + 0.5) * slot} y={base - MISSING_LIFT - MISSING_HEIGHT - 6}>
              sem coleta
            </text>
          </g>
        ) : null,
      )}
    </g>
  );
}

export default function WeeklyEntryRangeColumns({ data = defaultData, capacity = defaultCapacity, height, className }: WeeklyEntryRangeColumnsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows: WeekRow[] = data.map((row) => ({ ...row, span: row.min === null || row.max === null ? null : row.max - row.min }));
  const measured = rows.filter((row): row is WeekRow & { readonly max: number; readonly min: number } => row.min !== null && row.max !== null);
  const peak = maxOf(measured.map((row) => row.max));
  const first = rows[0];
  const last = rows[rows.length - 1];

  if (!first || !last || peak === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana com coleta neste recorte: não houve entrada medida no período.</span>
      </div>
    );
  }

  const { domainMax, ticks } = niceScale(Math.max(peak, capacity));
  const over = measured.filter((row) => row.max > capacity).length;
  const missing = rows.length - measured.length;
  const peakWeek = measured.find((row) => row.max === peak);
  const summary = [
    `Gráfico de colunas de faixa com o menor e o maior número de entradas por dia em ${formatInt(rows.length)} semanas, de ${formatDate(first.week)} a ${formatDate(last.week)}.`,
    `${plural(over, 'semana passa', 'semanas passam')} da capacidade diária de ${formatInt(capacity)}, com pico de ${formatInt(peak)}${peakWeek ? ` na semana de ${formatDate(peakWeek.week)}` : ''}.`,
    missing > 0 ? `${plural(missing, 'semana sem coleta', 'semanas sem coleta')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as WeekRow | undefined;
    if (!row) return null;
    const entries = (
      row.min === null || row.max === null
        ? [{ dataKey: 'days', name: 'Coleta', value: 'sem coleta nesta semana' }]
        : [
            { dataKey: 'min', name: 'Menor dia', value: `${formatInt(row.min)} entradas` },
            { dataKey: 'max', name: 'Maior dia', value: `${formatInt(row.max)} entradas` },
            { dataKey: 'capacity', name: 'Contra a capacidade', value: row.max > capacity ? `${formatInt(row.max - capacity)} acima` : 'dentro' },
            { dataKey: 'days', name: 'Dias com coleta', value: `${formatInt(row.days)} de 5` },
          ]
    ) as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={`Semana de ${formatDate(row.week)}`} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-[0.6875rem] text-text-muted">
        Faixa: menor e maior número de entradas num dia de cada semana. Traço com anel: semana com um só dia coletado.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="week"
              height={X_AXIS_HEIGHT}
              interval={LABEL_EVERY - 1}
              tickFormatter={(value: string) => formatDate(value)}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, domainMax]}
              interval={0}
              tickFormatter={(value: number) => formatInt(value)}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {/* Sem extendDomain a linha some no recorte em que o pico não chega à capacidade (REC-1). */}
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--text-muted)" strokeDasharray="4 4" y={capacity} />
            {/* Base invisível: empurra a cápsula até o menor valor sem desenhar nada (REC-8). */}
            <Bar dataKey="min" fill="none" isAnimationActive={false} stackId="range" />
            <Bar dataKey="span" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={ColumnShape} stackId="range" />
            <Annotations capacity={capacity} domainMax={domainMax} rows={rows} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
