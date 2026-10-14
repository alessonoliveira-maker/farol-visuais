import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps, type TooltipContentProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyIntakeMaybe } from './data';

/** Uma coluna por semana, separando a semana sem coleta da semana que mediu zero. */
export interface WeeklyGapColumnsProps {
  readonly data?: readonly WeeklyIntakeMaybe[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 26, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 34;
const BAR_CATEGORY_GAP = '30%';
/**
 * ESP-6, série única: passo = disponível / categorias; espessura = passo × (1 − 2 × 0,30).
 * Corpo do cartão ≈ 574 × 234 px; disponível ≈ 574 − 34 (eixo) − 8 (margem) = 532;
 * passo ≈ 38,0 para 14 semanas; espessura ≈ 38,0 × 0,4 ≈ 15,2 px, acima do piso de 12 px.
 */
const BAR_MAX = 15;
const GAP_MARK_HEIGHT = 10;
const ZERO_MARK_HEIGHT = 2;
const VALUE_LABEL_GAP = 6;

interface BarShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: WeeklyIntakeMaybe;
}

export default function WeeklyGapColumns({ data = defaultData, height, className }: WeeklyGapColumnsProps) {
  const animate = useAnimateOnce();
  const rows = [...data];
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não houve entrada registrada no período.</span>
      </div>
    );
  }

  const medidas = rows.filter((row) => row.entradas !== null);
  const zeradas = rows.filter((row) => row.entradas === 0);
  const semColeta = rows.filter((row) => row.entradas === null);
  const peakIndex = rows.reduce((best, row, i) => ((row.entradas ?? -1) > (rows[best]?.entradas ?? -1) ? i : best), 0);

  const summary = [
    `Gráfico de colunas com entradas semanais em ${formatInt(rows.length)} semanas.`,
    `${formatInt(medidas.length)} semanas medidas, ${formatInt(zeradas.length)} com zero entradas e ${formatInt(semColeta.length)} sem coleta.`,
    semColeta.length > 0 ? `A semana ${semColeta[0]?.week ?? ''} não teve coleta e fica marcada, não zerada.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderBar = ({ x = 0, y = 0, width = 0, height: barHeight = 0, payload }: BarShapeProps): ReactElement | null => {
    if (!payload) return null;
    if (payload.entradas === null) {
      return (
        <rect
          fill="none"
          height={GAP_MARK_HEIGHT}
          rx={2}
          stroke="var(--text-muted)"
          strokeDasharray="2 2"
          width={width}
          x={x}
          y={y + barHeight - GAP_MARK_HEIGHT}
        />
      );
    }
    if (payload.entradas === 0) {
      return <rect fill="var(--chart-1)" height={ZERO_MARK_HEIGHT} rx={1} width={width} x={x} y={y + barHeight - ZERO_MARK_HEIGHT} />;
    }
    return <rect fill="var(--chart-1)" height={barHeight} rx={3} width={width} x={x} y={y} />;
  };

  const renderValue = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    if (index === undefined) return null;
    const row = rows[index];
    if (!row) return null;
    const cx = Number(x) + Number(width) / 2;
    if (row.entradas === null) {
      return (
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={Number(y) - VALUE_LABEL_GAP}>
          {formatUnavailable()}
        </text>
      );
    }
    if (row.entradas === 0 || index === peakIndex) {
      return (
        <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={500} textAnchor="middle" x={cx} y={Number(y) - VALUE_LABEL_GAP}>
          {formatInt(row.entradas)}
        </text>
      );
    }
    return null;
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    if (!props.active || !props.payload) return null;
    const week = typeof props.label === 'string' ? props.label : '';
    const row = rows.find((item) => item.week === week);
    const payload = props.payload.map((entry) => ({
      ...entry,
      name: typeof entry.name === 'string' ? entry.name : String(entry.name ?? ''),
      value: row?.entradas === null ? formatUnavailable() : typeof entry.value === 'number' || typeof entry.value === 'string' ? entry.value : String(entry.value ?? ''),
    }));
    return <ChartTooltip active={props.active} label={week} payload={payload} valueFormat="int" />;
  };

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} margin={MARGIN}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis {...AXIS_PROPS} axisLine={false} dataKey="week" tickLine={false} tickMargin={8} />
          <YAxis {...AXIS_PROPS} allowDecimals={false} axisLine={false} domain={[0, 'dataMax']} tickCount={4} tickFormatter={formatInt} tickLine={false} width={VALUE_AXIS_WIDTH} />
          <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
          <Bar
            dataKey={(row: WeeklyIntakeMaybe) => row.entradas ?? 0}
            isAnimationActive={animate}
            maxBarSize={BAR_MAX}
            minPointSize={(_value, index) => (rows[index]?.entradas === null ? GAP_MARK_HEIGHT : ZERO_MARK_HEIGHT)}
            shape={renderBar}
          >
            <LabelList content={renderValue} dataKey="week" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
