import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
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

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  today as defaultToday,
  windowEnd as defaultWindowEnd,
  windowStart as defaultWindowStart,
  type Initiative,
} from './data';

/**
 * Gantt de progresso contra a linha de base: o trilho cinza é o período planejado, o
 * preenchimento vai até o percentual concluído e o trecho vermelho depois do trilho é o atraso.
 * Cada linha escreve o concluído, o esperado até hoje e os dias de atraso em colunas.
 */
export interface BaselineProgressProps {
  /** Iniciativas com plano e realizado. A ordem de entrada não importa: o componente ordena pelo início planejado. */
  readonly data?: readonly Initiative[];
  /** Hoje, em YYYY-MM-DD, vindo do dado. */
  readonly today?: string;
  /** Primeiro e último dia do eixo, em YYYY-MM-DD. */
  readonly windowStart?: string;
  readonly windowEnd?: string;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const DAY_MS = 86_400_000;
const NAME_AXIS_WIDTH = 150;
const COLUMN_GAP = 12;
const DONE_WIDTH = 36;
const EXPECTED_WIDTH = 56;
const DELAY_WIDTH = 56;
const COLUMNS_WIDTH = COLUMN_GAP + DONE_WIDTH + EXPECTED_WIDTH + DELAY_WIDTH;
/** Topo reservado ao rótulo de hoje. */
const MARGIN = { top: 20, right: COLUMNS_WIDTH, bottom: 2, left: 0 } as const;
const AXIS_HEIGHT = 24;
const BAR_RADIUS = 2;
const BAR_MAX = 16;
const LABEL_GAP = 6;
const TRACK_FILL = 'var(--surface-sunken)';
/** O trilho é fundo rebaixado com contorno: o contorno é que o separa do cartão nos dois temas (TOK-1). */
const TRACK_STROKE = 'var(--line-strong)';
const DONE_FILL = 'var(--chart-1)';
const LATE_FILL = 'var(--negative)';
/** Camada de rótulo do Recharts (2000): texto por cima de qualquer barra. */
const LABEL_Z = 2000;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface Row extends Initiative {
  /** Linha com plano registrado. */
  readonly planned: boolean;
  /** Extremos da barra desenhada: o planejado, ou o realizado quando não há plano. Fim exclusivo. */
  readonly range: readonly [number, number];
  readonly planEndMs: number;
  /** Dias depois do fim planejado, até a entrega ou até hoje; 0 quando no prazo; `null` sem plano. */
  readonly delay: number | null;
  /** Fração do período planejado que já devia estar feita hoje; `null` sem plano. */
  readonly expected: number | null;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Data YYYY-MM-DD em milissegundos UTC. */
function toMs(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Primeiro dia de cada mês dentro do eixo, gerado aqui para o tique cair sempre no dia 1. */
function monthTicks(startMs: number, endMs: number): number[] {
  const first = new Date(startMs);
  const year = first.getUTCFullYear();
  let month = first.getUTCMonth();
  let tick = Date.UTC(year, month, 1);
  if (tick < startMs) {
    month += 1;
    tick = Date.UTC(year, month, 1);
  }
  const ticks: number[] = [];
  while (tick <= endMs) {
    ticks.push(tick);
    month += 1;
    tick = Date.UTC(year, month, 1);
  }
  return ticks;
}

/** Linhas com plano pelo início planejado; as sem plano vão por último, como ausência declarada. */
function toRows(data: readonly Initiative[], todayMs: number): Row[] {
  return data
    .map((item): Row => {
      if (item.planStart === null || item.planEnd === null) {
        const from = item.actualStart === null ? todayMs : toMs(item.actualStart);
        const to = item.actualEnd === null ? todayMs + DAY_MS : toMs(item.actualEnd) + DAY_MS;
        return { ...item, planned: false, range: [from, to], planEndMs: to, delay: null, expected: null };
      }
      const startMs = toMs(item.planStart);
      const planEndMs = toMs(item.planEnd) + DAY_MS;
      const reachedMs = item.actualEnd === null ? todayMs + DAY_MS : toMs(item.actualEnd) + DAY_MS;
      const late = Math.max(0, Math.round((reachedMs - planEndMs) / DAY_MS));
      const expected = Math.min(1, Math.max(0, (todayMs - startMs) / (planEndMs - startMs)));
      return { ...item, planned: true, range: [startMs, planEndMs], planEndMs, delay: late, expected };
    })
    .sort((a, b) => {
      if (a.planned !== b.planned) return a.planned ? -1 : 1;
      return a.range[0] - b.range[0] || a.name.localeCompare(b.name, 'pt-BR');
    });
}

/** Maior atraso entre as linhas com plano, em dias; `null` quando nenhuma atrasou. */
function worstDelay(rows: readonly Row[]): Row | null {
  const late = rows.filter((row) => (row.delay ?? 0) > 0);
  if (late.length === 0) return null;
  return late.reduce((worst, row) => ((row.delay ?? 0) > (worst.delay ?? 0) ? row : worst));
}

interface PlanShapeProps {
  readonly bar: BarShapeProps;
  readonly rows: readonly Row[];
  readonly todayMs: number;
}

/**
 * Trilho do planejado, preenchimento até o percentual e trecho de atraso. O fim real vem em
 * data e vira pixel pela escala do eixo, porque o retângulo que o Recharts entrega só cobre o plano.
 */
function PlanShape({ bar, rows, todayMs }: PlanShapeProps): ReactElement | null {
  const xScale = useXAxisScale();
  const row = rows[bar.originalDataIndex];
  if (!row || !xScale) return null;
  const { x, y, width, height } = bar;

  if (!row.planned) {
    return (
      <rect
        fill="none"
        height={height - 1.5}
        rx={BAR_RADIUS}
        stroke={DONE_FILL}
        strokeDasharray="4 3"
        strokeWidth={1.5}
        width={Math.max(0, width - 1.5)}
        x={x + 0.75}
        y={y + 0.75}
      />
    );
  }

  const doneWidth = width * (row.percent ?? 0);
  const reachedMs = row.actualEnd === null ? todayMs + DAY_MS : toMs(row.actualEnd) + DAY_MS;
  const reachedX = xScale(reachedMs);
  const lateWidth = reachedX === undefined || (row.delay ?? 0) <= 0 ? 0 : reachedX - (x + width);

  return (
    <g>
      <rect fill={TRACK_FILL} height={height} rx={BAR_RADIUS} stroke={TRACK_STROKE} strokeWidth={1} width={width} x={x} y={y} />
      {doneWidth > 0 ? <rect fill={DONE_FILL} height={height} rx={BAR_RADIUS} width={doneWidth} x={x} y={y} /> : null}
      {lateWidth > 0 && row.actualEnd !== null ? (
        <rect fill={LATE_FILL} height={height} rx={BAR_RADIUS} width={lateWidth} x={x + width} y={y} />
      ) : null}
      {lateWidth > 0 && row.actualEnd === null ? (
        <rect
          fill="none"
          height={height - 1.5}
          rx={BAR_RADIUS}
          stroke={LATE_FILL}
          strokeDasharray="4 3"
          strokeWidth={1.5}
          width={Math.max(0, lateWidth - 1.5)}
          x={x + width + 0.75}
          y={y + 0.75}
        />
      ) : null}
    </g>
  );
}

/** As três colunas de número, o rótulo de hoje e o aviso das linhas sem plano. */
function Overlay({ rows, todayMs }: { readonly rows: readonly Row[]; readonly todayMs: number }) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (!xScale || !yScale || !plot) return null;

  const doneRight = plot.x + plot.width + COLUMN_GAP + DONE_WIDTH;
  const expectedRight = doneRight + EXPECTED_WIDTH;
  const delayRight = expectedRight + DELAY_WIDTH;
  const todayX = xScale(todayMs);

  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      {todayX === undefined ? null : (
        <text
          className="font-display"
          fill="var(--text-primary)"
          fontSize={11}
          fontWeight={600}
          textAnchor="middle"
          x={todayX}
          y={plot.y - 8}
        >
          {`hoje, ${formatDate(toIso(todayMs))}`}
        </text>
      )}
      {rows.map((row) => {
        const center = yScale(row.id, { position: 'middle' });
        if (center === undefined) return null;
        if (!row.planned) {
          const endX = xScale(row.range[1]);
          if (endX === undefined) return null;
          return (
            <text
              className="font-sans"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={11}
              fontWeight={500}
              key={row.id}
              style={HALO}
              x={endX + LABEL_GAP}
              y={center}
            >
              sem plano
            </text>
          );
        }
        const late = (row.delay ?? 0) > 0;
        return (
          <g key={row.id}>
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-primary)"
              fontSize={12}
              fontWeight={600}
              textAnchor="end"
              x={doneRight}
              y={center}
            >
              {row.percent === null ? formatUnavailable() : formatPercent(row.percent, 0)}
            </text>
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={12}
              fontWeight={500}
              textAnchor="end"
              x={expectedRight}
              y={center}
            >
              {row.expected === null ? '' : formatPercent(row.expected, 0)}
            </text>
            <text
              className="font-display"
              dominantBaseline="central"
              fill={late ? 'var(--negative)' : 'var(--text-muted)'}
              fontSize={12}
              fontWeight={late ? 600 : 500}
              textAnchor="end"
              x={delayRight}
              y={center}
            >
              {late ? `+${formatInt(row.delay ?? 0)} d` : 'no prazo'}
            </text>
          </g>
        );
      })}
    </ZIndexLayer>
  );
}

export default function BaselineProgress({
  data = defaultData,
  today = defaultToday,
  windowStart = defaultWindowStart,
  windowEnd = defaultWindowEnd,
  height,
  className,
}: BaselineProgressProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const todayMs = toMs(today);
  const rows = toRows(data, todayMs);

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma iniciativa neste recorte: não há plano nem realizado para comparar.</span>
      </div>
    );
  }

  const startMs = toMs(windowStart);
  const endMs = toMs(windowEnd) + DAY_MS;
  const byId = new Map(rows.map((row) => [row.id, row]));
  const planned = rows.filter((row) => row.planned);
  const lateRows = planned.filter((row) => (row.delay ?? 0) > 0);
  const worst = worstDelay(rows);
  const unplanned = rows.length - planned.length;
  const todayText = formatDate(today);
  const planText = `${formatInt(lateRows.length)} de ${formatInt(planned.length)}`;

  const summary = [
    `Gráfico de Gantt com ${formatInt(rows.length)} iniciativas de 2027 contra a linha de base, em ${todayText}.`,
    `${planText} com plano passaram da data planejada.`,
    worst ? `O maior atraso é de ${worst.name}, com ${formatInt(worst.delay ?? 0)} dias.` : 'Nenhuma passou da data planejada.',
    unplanned > 0 ? `${formatInt(unplanned)} sem plano registrado, só com o realizado.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text
      className="font-sans"
      dominantBaseline="central"
      fill="var(--text-secondary)"
      fontSize={12}
      fontWeight={500}
      x={MARGIN.left}
      y={Number(y)}
    >
      {byId.get(String(payload?.value ?? ''))?.name ?? ''}
    </text>
  );

  const renderPlan = (bar: BarShapeProps): ReactElement => <PlanShape bar={bar} rows={rows} todayMs={todayMs} />;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 shrink-0 truncate text-xs text-text-secondary">
        Em {todayText}, <span className="kpi-number font-semibold text-text-primary">{planText}</span> iniciativas com
        plano passaram da data
        {worst ? (
          <>
          , a pior com <span className="kpi-number font-medium text-negative">{`+${formatInt(worst.delay ?? 0)} d`}</span>
          </>
        ) : null}
      </p>
      <div aria-hidden className="mb-1 flex shrink-0 items-center text-[0.6875rem] leading-4 text-text-muted">
        <span className="flex min-w-0 flex-1 items-center gap-3 pl-1">
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-3 shrink-0 rounded-[1px] border"
              style={{ backgroundColor: TRACK_FILL, borderColor: TRACK_STROKE }}
            />
            planejado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 shrink-0 rounded-[1px]" style={{ backgroundColor: DONE_FILL }} />
            concluído
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3 shrink-0 rounded-[1px]" style={{ backgroundColor: LATE_FILL }} />
            depois da data
          </span>
        </span>
        <span className="shrink-0 text-right" style={{ width: COLUMN_GAP + DONE_WIDTH }}>
          feito
        </span>
        <span className="shrink-0 text-right" style={{ width: EXPECTED_WIDTH }}>
          esperado
        </span>
        <span className="shrink-0 text-right" style={{ width: DELAY_WIDTH }}>
          atraso
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="24%" data={rows} layout="vertical" margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[startMs, endMs]}
              height={AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatMonthShort(toIso(value))}
              tickLine={false}
              tickMargin={8}
              ticks={monthTicks(startMs, endMs)}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="id"
              interval={0}
              tick={renderName}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Bar dataKey="range" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderPlan} />
            {/* Duas linhas: o fio claro por baixo é o halo que mantém a linha de hoje visível sobre a barra colorida (TOK-10). */}
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--surface-raised)" strokeWidth={5} x={todayMs} />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--text-primary)" strokeWidth={1.5} x={todayMs} />
            <Overlay rows={rows} todayMs={todayMs} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
