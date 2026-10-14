import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type DotItemDotProps,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import {
  formatDate,
  formatDecimal,
  formatInt,
  formatMonthShort,
  formatUnavailable,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { asOf as defaultAsOf, data as defaultData, type WeeklyClosing } from './data';

/**
 * Colunas com os fechamentos de cada semana e uma linha com a média das quatro semanas
 * terminadas na própria semana (ela inclui), as duas em contagem de oportunidades no mesmo eixo y. A semana corrente aparece
 * vazada e fica fora da média: comparar semana parcial com semana cheia inventaria uma queda.
 */
export interface WeeklyClosingsMovingAverageProps {
  readonly data?: readonly WeeklyClosing[];
  /** Último dia computado na semana parcial, em YYYY-MM-DD. */
  readonly asOf?: string;
  readonly height?: number;
  readonly className?: string;
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

interface WeekRow {
  /** Segunda-feira da semana do calendário, em YYYY-MM-DD. */
  readonly week: string;
  /** Fechamentos da semana, ou `null` quando a semana não tem linha no dado: lacuna, nunca zero. */
  readonly closings: number | null;
  readonly partial: boolean;
  /** Média das 4 semanas completas terminadas nesta, ou `null` quando a janela tem lacuna ou parcial. */
  readonly average: number | null;
}

type CalendarWeek = Omit<WeekRow, 'average'>;

/** Semanas da janela da média móvel. */
const MOVING_WINDOW = 4;
const GRID_STEPS = 4;
const MARGIN = { top: 30, right: 10, bottom: 0, left: 0 } as const;
/** EIX-6: contagem cabe no piso da faixa, porque o tique mais longo tem dois algarismos. */
const Y_AXIS_WIDTH = 48;
const TICK_MARGIN = 8;
/** EIX-6b: `tickMargin` de 8 px mais cerca de 15 px de tinta de uma linha de 11 px. */
const X_AXIS_HEIGHT = 24;
const BAR_CATEGORY_GAP = '30%';
/**
 * ESP-6, série única na banda e portanto sem `barGap`: passo = 516 / 12 = 43,0 px e espessura
 * = 43,0 × (1 − 2 × 0,30) = 17,2 px, acima do piso de 12 px da ESP-2 e abaixo do teto de 24 px.
 */
const BAR_MAX = 24;
const BAR_FILL = 'var(--chart-1)';
/** Semana parcial: marca vazada no fundo do cartão, com o contorno na cor da série. */
const PARTIAL_FILL = 'var(--surface-raised)';
const PARTIAL_STROKE_WIDTH = 1.5;
const PARTIAL_DASH = '3 2';
const AVERAGE_STROKE = 'var(--chart-3)';
/**
 * TOK-4, TOK-9 e TOK-10: `--chart-3` mede 1,47:1 no escuro e 1,03:1 no claro contra `--chart-1`, então
 * a linha não pode contar com a cor para se separar da coluna. Segunda saída da TOK-10, sem
 * revestimento: a linha passa por trás das colunas (abaixo do `zIndex` 300 da barra), e o topo de
 * coluna nenhum fica coberto. Coluna acima da média cobre a linha; coluna abaixo a deixa por cima.
 */
const AVERAGE_Z = 250;
const AVERAGE_WIDTH = 2.25;
const VALUE_LABEL_GAP = 8;
/** Marca de semana sem dado: duas linhas de 11 px sobre a base, com 6 px de respiro. */
const MISSING_LINE_HEIGHT = 13;
const MISSING_LIFT = 6;
/** Faixa reservada no topo do corpo: a nota de parcial nunca compete com o valor de uma coluna (REC-4). */
const NOTE_Y = MARGIN.top - 16;
/** Camada de rótulo do Recharts: o texto fica por cima de qualquer coluna. */
const LABEL_Z = 2000;
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;

/** Menor número redondo (1, 2 ou 5 vezes uma potência de 10) que não fica abaixo do passo pedido. */
function niceStep(roughStep: number): number {
  if (roughStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(roughStep));
  const magnitude = 10 ** exponent;
  const fraction = roughStep / magnitude;
  const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * magnitude;
}

/** Domínio a partir do zero, terminando na primeira linha de grade redonda acima do maior valor (EIX-1, EIX-4). */
function buildDomain(maxValue: number): { domainMax: number; ticks: readonly number[] } {
  const step = niceStep(maxValue / GRID_STEPS);
  const domainMax = Math.ceil(maxValue / step) * step;
  const count = Math.round(domainMax / step);
  return { domainMax, ticks: Array.from({ length: count + 1 }, (_, index) => index * step) };
}

const DAY_MS = 86_400_000;

function toUtc(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function toIso(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

/** Segunda-feira da semana que contém a data, por aritmética sobre a data do dado, sem relógio. */
function mondayOf(iso: string): number {
  const time = toUtc(iso);
  const weekday = new Date(time).getUTCDay();
  return time - ((weekday + 6) % 7) * DAY_MS;
}

/**
 * Calendário semanal completo, da primeira à última segunda-feira do dado, de 7 em 7 dias. Semana
 * que o calendário tem e o dado não traz entra com `closings: null` (lacuna declarada, EST-1b e
 * EST-2), e não como zero: só a página sabe se ausência é zero medido, e ela então passa o zero.
 */
function buildCalendar(rows: readonly WeeklyClosing[]): readonly CalendarWeek[] {
  const byWeek = new Map<number, WeeklyClosing>();
  for (const row of rows) byWeek.set(mondayOf(row.week), row);
  const times = [...byWeek.keys()];
  if (times.length === 0) return [];
  const first = Math.min(...times);
  const last = Math.max(...times);
  const calendar: CalendarWeek[] = [];
  for (let time = first; time <= last; time += 7 * DAY_MS) {
    const row = byWeek.get(time);
    calendar.push({
      week: toIso(time),
      closings: row === undefined ? null : row.closings,
      partial: row?.partial ?? false,
    });
  }
  return calendar;
}

/**
 * Média das 4 semanas de calendário terminadas na semana do índice, a própria incluída, calculada
 * sobre a janela recebida em `data` e não sobre um histórico que a página não passou.
 *
 * Devolve `null`, e nunca zero, quando a janela do recorte não tem as 4 semanas, quando uma delas
 * é lacuna do calendário ou quando uma está parcial (EST-1b): média de semana incompleta ou
 * ausente puxa o ritmo para baixo sem medir nada.
 */
function movingAverage(rows: readonly CalendarWeek[], index: number): number | null {
  const window = rows.slice(Math.max(0, index - MOVING_WINDOW + 1), index + 1);
  if (window.length < MOVING_WINDOW) return null;
  let total = 0;
  for (const row of window) {
    if (row.partial || row.closings === null) return null;
    total += row.closings;
  }
  return total / window.length;
}

/** Um tique por mês presente no dado, ancorado na primeira semana daquele mês (REC-21). */
function monthAnchorTicks(rows: readonly WeekRow[]): readonly string[] {
  const seen = new Set<string>();
  const ticks: string[] = [];
  for (const row of rows) {
    const month = row.week.slice(0, 7);
    if (seen.has(month)) continue;
    seen.add(month);
    ticks.push(row.week);
  }
  return ticks;
}

/** As duas linhas da dica de uma semana, na ordem visual: a coluna primeiro, a linha depois (DIC-4). */
function buildTooltipEntries(row: WeekRow): readonly TooltipEntry[] {
  return [
    {
      color: row.closings === null ? 'var(--text-muted)' : BAR_FILL,
      dataKey: 'closings',
      graphicalItemId: 'closings',
      name: row.partial ? 'Fechamentos na semana parcial' : 'Fechamentos na semana',
      value: row.closings === null ? formatUnavailable() : row.closings,
    },
    {
      color: AVERAGE_STROKE,
      dataKey: 'average',
      graphicalItemId: 'average',
      name: 'Média de 4 semanas',
      value: row.average === null ? formatUnavailable() : formatDecimal(row.average, 1),
    },
  ];
}

/** A nota de parcial, presa à faixa reservada no topo do corpo e alinhada à direita do plano. */
function PartialNote({ until }: { readonly until: string }): ReactElement | null {
  const plot = usePlotArea();
  if (!plot) return null;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      <text
        className="font-sans"
        fill="var(--text-muted)"
        fontSize={11}
        style={HALO}
        textAnchor="end"
        x={plot.x + plot.width}
        y={NOTE_Y}
      >
        parcial até <tspan className="font-display">{formatDate(until)}</tspan>
      </text>
    </ZIndexLayer>
  );
}

/**
 * Marca escrita no lugar de cada semana sem dado, sobre a linha de base, para o desenho parado
 * dizer que a coluna falta por falta de dado e não por valor zero (DIC-5, EIX-10).
 */
function MissingWeekMarks({ weeks }: { readonly weeks: readonly string[] }): ReactElement | null {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (xScale === undefined || yScale === undefined) return null;
  const base = yScale(0);
  if (base === undefined) return null;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      {weeks.map((week) => {
        const center = xScale(week, { position: 'middle' });
        if (center === undefined) return null;
        return (
          <text
            className="font-sans"
            fill="var(--text-muted)"
            fontSize={11}
            key={week}
            style={HALO}
            textAnchor="middle"
          >
            <tspan x={center} y={base - MISSING_LINE_HEIGHT - MISSING_LIFT}>
              sem
            </tspan>
            <tspan x={center} y={base - MISSING_LIFT}>
              dado
            </tspan>
          </text>
        );
      })}
    </ZIndexLayer>
  );
}

export default function WeeklyClosingsMovingAverage({
  data = defaultData,
  asOf = defaultAsOf,
  height,
  className,
}: WeeklyClosingsMovingAverageProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não há fechamento para comparar com a média móvel.</span>
      </div>
    );
  }

  const calendar = buildCalendar(data);
  const rows: readonly WeekRow[] = calendar.map((row, index) => ({
    ...row,
    average: movingAverage(calendar, index),
  }));
  const maxClosings = rows.reduce((max, row) => Math.max(max, row.closings ?? 0), 0);
  const missingWeeks = rows.filter((row) => row.closings === null).map((row) => row.week);
  const maxAverage = rows.reduce(
    (max, row) => (row.average === null ? max : Math.max(max, row.average)),
    0,
  );
  const { domainMax, ticks } = buildDomain(Math.max(maxClosings, maxAverage));
  const xTicks = monthAnchorTicks(rows);

  const complete = rows.filter((row) => !row.partial && row.closings !== null);
  const lastComplete = complete[complete.length - 1];
  const partial = rows.find((row) => row.partial);

  const pace =
    lastComplete === undefined || lastComplete.average === null
      ? null
      : {
          week: lastComplete.week,
          closings: lastComplete.closings ?? 0,
          average: lastComplete.average,
          above: (lastComplete.closings ?? 0) >= lastComplete.average,
        };

  const summary = [
    `Colunas com os fechamentos de ${formatInt(rows.length)} semanas e linha com a média móvel de ${formatInt(MOVING_WINDOW)} semanas.`,
    pace === null
      ? 'Sem quatro semanas completas para a média.'
      : `Última semana completa, ${formatDate(pace.week)}: ${formatInt(pace.closings)} contra média de ${formatDecimal(pace.average, 1)}.`,
    partial === undefined ? '' : `${formatDate(partial.week)} parcial, fora da média.`,
    missingWeeks.length === 0
      ? ''
      : `Sem dado em ${missingWeeks.map((week) => formatDate(week)).join(', ')}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderPartialValue = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row || !row.partial || row.closings === null) return null;
    return (
      <text
        className="font-display"
        dominantBaseline="auto"
        fill="var(--text-primary)"
        fontSize={12}
        fontWeight={700}
        style={HALO}
        textAnchor="middle"
        x={Number(x) + Number(width) / 2}
        y={Number(y) - VALUE_LABEL_GAP}
      >
        {formatInt(row.closings)}
      </text>
    );
  };

  /**
   * Ponto só onde a linha não forma traço: valor sem vizinho com valor, que sem isso sumiria. Nos
   * demais pontos o marcador cairia por cima da coluna que a linha atravessa por trás (TOK-10).
   */
  const renderIsolatedDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    const before = index > 0 ? rows[index - 1]?.average : null;
    const after = rows[index + 1]?.average;
    if (cx === undefined || cy === undefined) return null;
    if ((before ?? null) !== null || (after ?? null) !== null) return null;
    return <circle cx={cx} cy={cy} fill={AVERAGE_STROKE} key={`isolated-${index}`} r={3} />;
  };

  const renderTooltip = (tooltipProps: TooltipContentProps): ReactElement | null => {
    const week = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = week === undefined ? undefined : rows.find((candidate) => candidate.week === week);
    if (!tooltipProps.active || !row) return null;
    return (
      <ChartTooltip
        active={tooltipProps.active}
        label={week}
        labelFormat="date"
        payload={buildTooltipEntries(row)}
        valueFormat="int"
      />
    );
  };

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="img"
      style={style}
    >
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-5 text-text-secondary">
        <li className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: BAR_FILL }}
          />
          Fechamentos na semana
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-[2px] border"
            style={{ backgroundColor: PARTIAL_FILL, borderColor: BAR_FILL }}
          />
          Semana parcial
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-0.5 w-3.5 shrink-0 rounded-full"
            style={{ backgroundColor: AVERAGE_STROKE }}
          />
          Média de {formatInt(MOVING_WINDOW)} semanas
        </li>
      </ul>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {pace === null ? (
          <>Sem {formatInt(MOVING_WINDOW)} semanas completas no recorte para medir o ritmo</>
        ) : (
          <>
            <span className="font-semibold text-text-primary">
              {pace.above ? 'Acima do ritmo' : 'Abaixo do ritmo'}
            </span>
            : <span className="kpi-number font-medium text-text-primary">{formatInt(pace.closings)}</span>{' '}
            fechamentos na semana de {formatDate(pace.week)} contra média de{' '}
            <span className="kpi-number font-medium text-text-primary">
              {formatDecimal(pace.average, 1)}
            </span>{' '}
            por semana
          </>
        )}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart
            accessibilityLayer={false}
            barCategoryGap={BAR_CATEGORY_GAP}
            data={[...rows]}
            margin={MARGIN}
          >
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="week"
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickMargin={TICK_MARGIN}
              ticks={[...xTicks]}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, domainMax]}
              tickFormatter={(value: number) => formatInt(value)}
              tickMargin={TICK_MARGIN}
              ticks={[...ticks]}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={renderTooltip}
              cursor={{ fill: 'var(--line-subtle)' }}
              isAnimationActive={false}
            />
            <Line
              connectNulls={false}
              dataKey="average"
              dot={renderIsolatedDot}
              isAnimationActive={animate}
              name="Média de 4 semanas"
              stroke={AVERAGE_STROKE}
              strokeWidth={AVERAGE_WIDTH}
              type="linear"
              zIndex={AVERAGE_Z}
            />
            <Bar
              dataKey="closings"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              name="Fechamentos na semana"
              radius={[3, 3, 0, 0]}
            >
              {rows.map((row) => (
                <Cell
                  fill={row.partial ? PARTIAL_FILL : BAR_FILL}
                  key={row.week}
                  strokeDasharray={row.partial ? PARTIAL_DASH : undefined}
                  strokeWidth={row.partial ? PARTIAL_STROKE_WIDTH : 0}
                  stroke={row.partial ? BAR_FILL : undefined}
                />
              ))}
              <LabelList content={renderPartialValue} dataKey="closings" />
            </Bar>
            {partial === undefined ? null : <PartialNote until={asOf} />}
            {missingWeeks.length === 0 ? null : <MissingWeekMarks weeks={missingWeeks} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
