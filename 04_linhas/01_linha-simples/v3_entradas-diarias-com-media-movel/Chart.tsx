import { Filter } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import {
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps,
  type LabelProps,
} from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type DailyLeads } from './data';

/** Entradas diárias com o bruto neutro por baixo e a média móvel de 7 dias em destaque. */
export interface DailyLeadsTrendProps {
  readonly data?: readonly DailyLeads[];
  readonly height?: number;
  readonly className?: string;
}

const WINDOW = 7;
const MARGIN = { top: 20, right: 88, bottom: 4, left: 0 } as const;
const VALUE_AXIS_WIDTH = 40;
const BRUSH_HEIGHT = 22;
const VISIBLE_DAYS = 60;
/** Metade do respiro vertical mínimo entre os dois rótulos de fim de linha (ROT-3), quando os dois
 *  valores terminam próximos: 8 px de cada lado somam os 16 px de âncora da 17.4 (E3). */
const LABEL_STACK_OFFSET = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface TrendPoint extends DailyLeads {
  readonly movingAverage: number | null;
}

/** Média móvel de janela `WINDOW`, alinhada à direita: só existe a partir do dia `WINDOW`. */
function withMovingAverage(rows: readonly DailyLeads[]): readonly TrendPoint[] {
  return rows.map((row, index) => {
    if (index < WINDOW - 1) return { ...row, movingAverage: null };
    const windowSlice = rows.slice(index - WINDOW + 1, index + 1);
    const sum = windowSlice.reduce((total, point) => total + point.leads, 0);
    return { ...row, movingAverage: Math.round((sum / WINDOW) * 10) / 10 };
  });
}

function niceCeiling(max: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(max, 1)));
  const residual = max / magnitude;
  const step = residual <= 2 ? 0.5 : residual <= 5 ? 1 : 2;
  return Math.ceil(max / (step * magnitude)) * step * magnitude;
}

export default function DailyLeadsTrend({ data = defaultData, height, className }: DailyLeadsTrendProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = withMovingAverage(data);
  const [range, setRange] = useState(() => ({
    start: Math.max(0, rows.length - VISIBLE_DAYS),
    end: Math.max(0, rows.length - 1),
  }));

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum dia neste recorte: não houve entradas para desenhar a série.</span>
      </div>
    );
  }

  const visible = rows.slice(range.start, range.end + 1);
  const visibleValues = visible.flatMap((row) => [row.leads, row.movingAverage ?? row.leads]);
  const ceiling = niceCeiling(Math.max(1, ...visibleValues));
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;

  /**
   * O `Brush` reindexa: `dot`/`LabelList` de cada `Line` recebem `index` relativo à fatia visível
   * em tela (0-based), não ao array de 180 dias passado em `data`. Calcular sobre `rows` fazia o
   * índice do último ponto (179) nunca bater com nenhum índice renderizado (0 a 59) e o rótulo e o
   * ponto finais da média móvel não apareciam em nenhum recorte do Brush.
   */
  const visibleLastIndex = visible.length - 1;
  const visibleLastRow = visible[visibleLastIndex];
  const visibleLastAverageIndex = visible.reduce((found, row, index) => (row.movingAverage !== null ? index : found), -1);
  const visibleLastAverage = visibleLastAverageIndex >= 0 ? visible[visibleLastAverageIndex] : undefined;

  /**
   * Os dois rótulos de fim de linha (ROT-3) podem terminar a poucos pixels um do outro quando o
   * bruto e a média móvel convergem; empurrar cada um para o lado oposto do outro garante o
   * respiro mínimo mesmo quando os dois valores estão pertinho.
   */
  const brutoAboveAverage =
    visibleLastRow !== undefined && visibleLastAverage?.movingAverage !== undefined && visibleLastAverage.movingAverage !== null
      ? visibleLastRow.leads >= visibleLastAverage.movingAverage
      : true;
  const brutoLabelOffset = brutoAboveAverage ? -LABEL_STACK_OFFSET : LABEL_STACK_OFFSET;
  const averageLabelOffset = brutoAboveAverage ? LABEL_STACK_OFFSET : -LABEL_STACK_OFFSET;

  const summary = [
    `Gráfico de linha com as entradas diárias de leads de ${formatDate(first.date)} a ${formatDate(last.date)}, ${String(rows.length)} dias.`,
    visibleLastAverage?.movingAverage !== undefined && visibleLastAverage?.movingAverage !== null
      ? `A média móvel de 7 dias fechou em ${formatInt(Math.round(visibleLastAverage.movingAverage))} leads por dia.`
      : '',
    'O traço fino é o bruto de cada dia e a linha acesa é a média que suaviza o ruído.',
  ]
    .filter(Boolean)
    .join(' ');

  const renderBrutoDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null =>
    index === visibleLastIndex && cx !== undefined && cy !== undefined ? (
      <circle cx={cx} cy={cy} fill="var(--line-strong)" key="bruto-end" r={3.5} stroke="var(--surface-raised)" strokeWidth={1.5} />
    ) : null;

  /**
   * O bruto usa `--line-strong` (neutro de dado, 17.2), que só vale com o valor escrito junto da
   * marca: por isso o rótulo do fim traz "bruto" e o número, não só o marcador.
   */
  const renderBrutoLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index !== visibleLastIndex || !visibleLastRow) return null;
    return (
      <text dominantBaseline="central" style={HALO} x={Number(x) + 10} y={Number(y) + brutoLabelOffset}>
        <tspan className="font-sans" fill="var(--text-secondary)" fontSize={11}>
          bruto{' '}
        </tspan>
        <tspan className="font-display" fill="var(--text-secondary)" fontSize={12}>
          {formatInt(visibleLastRow.leads)}
        </tspan>
      </text>
    );
  };

  const renderAverageDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null =>
    index === visibleLastAverageIndex && cx !== undefined && cy !== undefined ? (
      <circle cx={cx} cy={cy} fill="var(--chart-1)" key="avg-end" r={4} stroke="var(--surface-raised)" strokeWidth={1.5} />
    ) : null;

  const renderAverageLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index !== visibleLastAverageIndex || visibleLastAverage?.movingAverage === undefined || visibleLastAverage.movingAverage === null) return null;
    return (
      <text dominantBaseline="central" style={HALO} x={Number(x) + 10} y={Number(y) + averageLabelOffset}>
        <tspan className="font-sans" fill="var(--text-secondary)" fontSize={11}>
          méd. 7d{' '}
        </tspan>
        <tspan className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={700}>
          {formatInt(Math.round(visibleLastAverage.movingAverage))}
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <ResponsiveContainer height="100%" width="100%">
        <ComposedChart accessibilityLayer={false} data={rows} margin={MARGIN}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis {...AXIS_PROPS} axisLine={false} dataKey="date" minTickGap={56} tickFormatter={formatMonthShort} tickMargin={8} />
          <YAxis
            {...AXIS_PROPS}
            allowDecimals={false}
            axisLine={false}
            domain={[0, ceiling]}
            tickFormatter={(value: number) => formatInt(Math.round(value))}
            width={VALUE_AXIS_WIDTH}
          />
          <Tooltip content={<ChartTooltip labelFormat="date" valueFormat="int" />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
          <Line dataKey="leads" dot={renderBrutoDot} isAnimationActive={animate} name="bruto" stroke="var(--line-strong)" strokeWidth={1} type="linear">
            <LabelList content={renderBrutoLabel} dataKey="leads" />
          </Line>
          <Line
            connectNulls={false}
            dataKey="movingAverage"
            dot={renderAverageDot}
            isAnimationActive={animate}
            name="média móvel"
            stroke="var(--chart-1)"
            strokeWidth={2}
            type="monotone"
          >
            <LabelList content={renderAverageLabel} dataKey="movingAverage" />
          </Line>
          <Brush
            dataKey="date"
            endIndex={range.end}
            fill="var(--surface-sunken)"
            height={BRUSH_HEIGHT}
            onChange={(next) => {
              if (next.startIndex === undefined || next.endIndex === undefined) return;
              setRange({ start: next.startIndex, end: next.endIndex });
            }}
            startIndex={range.start}
            stroke="var(--line-strong)"
            tickFormatter={formatMonthShort}
            travellerWidth={8}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
