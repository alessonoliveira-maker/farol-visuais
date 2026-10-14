import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, Rectangle, ResponsiveContainer, XAxis, YAxis, type BarShapeProps, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QueueAgendas } from './data';

/**
 * Ranking em barras horizontais de agendas por fila, do maior para o menor. Zero medido escreve 0
 * sem inventar barra; fila sem coleta escreve indisponível, sem barra e sem entrar no ranking; um
 * empate no topo repete a posição 1 e acende as duas filas.
 */
export interface QueueAgendasBarsProps {
  readonly data?: readonly QueueAgendas[];
  readonly height?: number;
  readonly className?: string;
}

interface Row {
  readonly id: string;
  readonly name: string;
  readonly value: number | null;
  readonly plotValue: number;
  readonly rank: number | null;
}

const HIGHLIGHT_FILL = 'var(--chart-1)';
const NEUTRAL_FILL = 'var(--line-strong)';
const MARGIN = { top: 2, right: 108, bottom: 2, left: 0 } as const;
const NAME_AXIS_WIDTH = 232;
const RANK_WIDTH = 20;
const ROW_STEP = 30;
const BAR_CATEGORY_GAP = '36%';
const BAR_MAX = 20;
const BAR_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
const VALUE_LABEL_GAP = 6;
const LOCALE = 'pt-BR';

function plotHeight(count: number): number {
  return MARGIN.top + MARGIN.bottom + count * ROW_STEP;
}

/** Maior primeiro; sem coleta vai por último, visível, nunca somado a outra fila. Empate repete a posição. */
function buildRows(data: readonly QueueAgendas[]): Row[] {
  const sorted = [...data].sort((a, b) => {
    if (a.agendas === null || b.agendas === null) {
      if (a.agendas === b.agendas) return a.name.localeCompare(b.name, LOCALE);
      return a.agendas === null ? 1 : -1;
    }
    return b.agendas - a.agendas || a.name.localeCompare(b.name, LOCALE);
  });
  let rank = 0;
  let previous: number | null = null;
  return sorted.map((item, index) => {
    if (item.agendas !== null && item.agendas !== previous) rank = index + 1;
    if (item.agendas !== null) previous = item.agendas;
    return { id: item.id, name: item.name, value: item.agendas, plotValue: item.agendas ?? 0, rank: item.agendas === null ? null : rank };
  });
}

interface NameTickProps {
  readonly y?: number | string;
  readonly index?: number;
}

export default function QueueAgendasBars({ data = defaultData, height, className }: QueueAgendasBarsProps) {
  const animate = useAnimateOnce();
  const rows = buildRows(data);
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma fila neste recorte: não houve agenda medida na semana.</span>
      </div>
    );
  }

  const leaders = rows.filter((row) => row.rank === 1);
  const unavailable = rows.filter((row) => row.value === null);
  const tie = leaders.length > 1;
  const leadValue = leaders[0]?.value;

  const renderBar = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = rows[index];
    return (
      <Rectangle
        fill={row?.rank === 1 ? HIGHLIGHT_FILL : NEUTRAL_FILL}
        height={Number(barHeight)}
        radius={BAR_RADIUS}
        width={Number(width)}
        x={Number(x)}
        y={Number(y)}
      />
    );
  };

  const renderName = ({ y, index = -1 }: NameTickProps): ReactElement => {
    const row = rows[index];
    const highlight = row?.rank === 1;
    return (
      <text dominantBaseline="central" fontSize={12} y={Number(y)}>
        {row?.rank !== null && row?.rank !== undefined ? (
          <tspan
            className="font-display"
            fill={highlight ? 'var(--chart-1)' : 'var(--text-muted)'}
            fontWeight={highlight ? 700 : 500}
            x={MARGIN.left}
          >
            {row.rank}º
          </tspan>
        ) : null}
        <tspan
          className="font-sans"
          fill={highlight ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontWeight={highlight ? 700 : 500}
          x={MARGIN.left + RANK_WIDTH}
        >
          {row?.name ?? ''}
        </tspan>
      </text>
    );
  };

  const renderValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const highlight = row.rank === 1;
    const textX = Number(x) + Number(width) + VALUE_LABEL_GAP;
    const textY = Number(y) + Number(barHeight) / 2;
    if (row.value === null) {
      return (
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={12} x={textX} y={textY}>
          {formatUnavailable()}
        </text>
      );
    }
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill={highlight ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={highlight ? 700 : 500}
        x={textX}
        y={textY}
      >
        {formatInt(row.value)} agendas
      </text>
    );
  };

  const summary = [
    `Gráfico de barras horizontais com agendas por fila na semana, da maior para a menor.`,
    tie && typeof leadValue === 'number'
      ? `Empate na liderança entre ${leaders.map((row) => row.name).join(' e ')}, com ${formatInt(leadValue)} agendas cada.`
      : leaders[0]
        ? `Lidera ${leaders[0].name}, com ${formatInt(leaders[0].value ?? 0)} agendas.`
        : '',
    unavailable.length > 0 ? `Sem coleta na semana: ${unavailable.map((row) => row.name).join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {tie ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          Empate na liderança: <span className="font-semibold text-text-primary">{leaders.map((row) => row.name).join(' e ')}</span>, com{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(leadValue ?? 0)} agendas</span> cada
        </p>
      ) : null}
      <div className="shrink-0" style={{ height: plotHeight(rows.length) }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis dataKey="plotValue" domain={[0, 'dataMax']} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="id"
              interval={0}
              tick={renderName}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Bar dataKey="plotValue" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar}>
              <LabelList content={renderValue} dataKey="plotValue" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
