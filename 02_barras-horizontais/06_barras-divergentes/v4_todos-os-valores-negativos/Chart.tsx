import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type BarShapeProps,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  currentWeekStart as defaultCurrentWeekStart,
  data as defaultData,
  previousWeekStart as defaultPreviousWeekStart,
  type QueueAgendas,
} from './data';

/**
 * Barras divergentes com a variação de agendas por fila entre duas semanas. Quando nenhuma fila
 * cresceu, o domínio detecta o sinal único e recolhe o lado positivo vazio: o zero fica na borda
 * direita e a barra espelhada usa a largura inteira do cartão para o lado que existe.
 */
export interface QueueAgendasBarsProps {
  /** Agendas por fila nas duas semanas. A ordem de entrada não importa: o componente ordena. */
  readonly data?: readonly QueueAgendas[];
  /** Início da semana atual, em YYYY-MM-DD. */
  readonly currentWeekStart?: string;
  /** Início da semana de comparação, em YYYY-MM-DD. */
  readonly previousWeekStart?: string;
  readonly height?: number;
  readonly className?: string;
}

const GOOD_FILL = 'var(--positive)';
const BAD_FILL = 'var(--negative)';
const ZERO_STROKE = 'var(--line-strong)';
const NAME_WIDTH = 118;
const LABEL_ROOM = 56;
const COLUMN_WIDTH = 96;
const MARGIN = { top: 22, right: LABEL_ROOM + COLUMN_WIDTH, bottom: 2, left: 0 } as const;
const VALUE_LABEL_GAP = 6;
const HEADER_GAP = 10;
const BAR_MAX = 18;
const BAR_RADIUS = 3;
const LABEL_Z = 2000;
const MINUS = '−';

interface ChangeRow {
  readonly id: string;
  readonly name: string;
  readonly previous: number;
  readonly current: number;
  readonly change: number;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Semana no formato "semana de dd/mm". */
function formatWeek(iso: string): string {
  return `semana de ${formatDate(iso).slice(0, 5)}`;
}

/** Sinal à mão sobre a contagem absoluta (NUM-3); variação nula sai sem sinal e sem barra. */
function formatChange(change: number): string {
  const text = `${formatInt(Math.abs(change))} agendas`;
  if (change === 0) return text;
  return `${change > 0 ? '+' : MINUS}${text}`;
}

/** Linhas com a variação calculada, da fila que menos caiu (ou cresceu) à que mais caiu. */
function toRows(data: readonly QueueAgendas[]): ChangeRow[] {
  const rows = data.map((item) => ({
    id: item.id,
    name: item.queue,
    previous: item.previousWeek,
    current: item.currentWeek,
    change: item.currentWeek - item.previousWeek,
  }));
  return rows.sort((a, b) => b.change - a.change || a.name.localeCompare(b.name, 'pt-BR'));
}

interface RowTextProps {
  readonly rows: readonly ChangeRow[];
  readonly currentLabel: string;
  readonly previousLabel: string;
}

/** Rótulos posicionados pelas escalas do próprio gráfico, fora da ponta livre de cada barra. */
function RowText({ rows, currentLabel, previousLabel }: RowTextProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (!xScale || !yScale || !plot) return null;

  const zeroX = xScale(0) ?? plot.x + plot.width;
  const columnRight = plot.x + plot.width + LABEL_ROOM + COLUMN_WIDTH - 6;
  const headerY = plot.y - HEADER_GAP;

  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      <g fontSize={11}>
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" textAnchor="end" x={columnRight} y={headerY}>
          {currentLabel} contra {previousLabel}
        </text>
      </g>
      {rows.map((row) => {
        const center = yScale(row.id, { position: 'middle' });
        if (center === undefined) return null;
        const tip = xScale(row.change) ?? zeroX;
        const toLeft = row.change < 0;
        return (
          <g key={row.id}>
            <text
              className="font-display"
              dominantBaseline="central"
              fill={row.change === 0 ? 'var(--text-muted)' : row.change > 0 ? GOOD_FILL : BAD_FILL}
              fontSize={12}
              fontWeight={500}
              textAnchor={toLeft ? 'end' : 'start'}
              x={toLeft ? tip - VALUE_LABEL_GAP : tip + VALUE_LABEL_GAP}
              y={center}
            >
              {formatChange(row.change)}
            </text>
            <text dominantBaseline="central" textAnchor="end" x={columnRight} y={center}>
              <tspan className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={500}>
                {formatInt(row.current)}
              </tspan>
              <tspan className="font-sans" fill="var(--text-muted)" fontSize={11}>
                {' de '}
              </tspan>
              <tspan className="font-display" fill="var(--text-muted)" fontSize={11}>
                {formatInt(row.previous)}
              </tspan>
            </text>
          </g>
        );
      })}
    </ZIndexLayer>
  );
}

export default function QueueAgendasBars({
  data = defaultData,
  currentWeekStart = defaultCurrentWeekStart,
  previousWeekStart = defaultPreviousWeekStart,
  height,
  className,
}: QueueAgendasBarsProps) {
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
        <span>Nenhuma fila neste recorte: não houve agenda registrada nas duas semanas.</span>
      </div>
    );
  }

  const currentLabel = formatWeek(currentWeekStart);
  const previousLabel = formatWeek(previousWeekStart);
  const maxAbs = Math.max(0, ...rows.map((row) => Math.abs(row.change)));
  const hasGrowth = rows.some((row) => row.change > 0);
  const hasDrop = rows.some((row) => row.change < 0);
  /** Sinal único: recolhe o lado sem dado do domínio; o zero cai sozinho na borda que sobra. */
  const domainEdge = maxAbs > 0 ? maxAbs : 1;
  const domain: [number, number] = hasDrop && !hasGrowth ? [-domainEdge, 0] : hasGrowth && !hasDrop ? [0, domainEdge] : [-domainEdge, domainEdge];

  const worst = rows[rows.length - 1];
  const best = rows[0];
  const allDropped = hasDrop && !hasGrowth;

  const summary = [
    `Gráfico de barras divergentes com a variação de agendas de ${String(rows.length)} filas entre ${previousLabel} e ${currentLabel}.`,
    allDropped ? 'Nenhuma fila cresceu na semana.' : '',
    worst ? `Maior queda: ${worst.name}, ${formatChange(worst.change)}.` : '',
    best && best.id !== worst?.id && best.change > 0 ? `Maior alta: ${best.name}, ${formatChange(best.change)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const byId = new Map(rows.map((row) => [row.id, row]));
  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={Number(y)}>
      {byId.get(String(payload?.value ?? ''))?.name ?? ''}
    </text>
  );

  /** Raio só na ponta livre; fila sem variação vira largura zero e some sozinha (EST-3, catálogo v4). */
  const renderBar = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = rows[index];
    const barWidth = Number(width ?? 0);
    if (!row || row.change === 0 || barWidth === 0) return <g />;
    const left = Math.min(Number(x ?? 0), Number(x ?? 0) + barWidth);
    const radius: [number, number, number, number] =
      row.change > 0 ? [0, BAR_RADIUS, BAR_RADIUS, 0] : [BAR_RADIUS, 0, 0, BAR_RADIUS];
    return (
      <Rectangle
        fill={row.change > 0 ? GOOD_FILL : BAD_FILL}
        height={Number(barHeight ?? 0)}
        radius={radius}
        width={Math.abs(barWidth)}
        x={left}
        y={Number(y ?? 0)}
      />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {allDropped ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          Nenhuma fila cresceu na semana; maior queda em{' '}
          <span className="font-semibold text-text-primary">{worst?.name}</span>,{' '}
          <span className="kpi-number font-medium text-text-primary">{worst ? formatChange(worst.change) : ''}</span>
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="34%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={domain} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="id"
              interval={0}
              tick={renderName}
              tickLine={false}
              type="category"
              width={NAME_WIDTH + LABEL_ROOM}
            />
            <ReferenceLine ifOverflow="extendDomain" stroke={ZERO_STROKE} strokeWidth={1} x={0} />
            <Bar dataKey="change" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar} />
            <RowText currentLabel={currentLabel} previousLabel={previousLabel} rows={rows} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
