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
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import {
  formatDate,
  formatInt,
  formatMonthShort,
  formatPercent,
  formatRateWithVolume,
  formatUnavailable,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WeeklyBooking } from './data';

/**
 * Colunas com as agendas de cada semana, no eixo esquerdo, e linha com a taxa de comparecimento, no
 * eixo direito, em 26 semanas.
 *
 * A decisão de encoding desta versão, e o que ela ensina: os dois domínios são calculados, e o do
 * eixo da taxa não é escolha nenhuma. Uma taxa tem TETO NATURAL de 100%, então o eixo direito vai
 * de zero a cem por cento sempre, em qualquer recorte; o eixo esquerdo termina no primeiro passo
 * redondo acima do maior valor de agendas; e as marcas dos dois são as mesmas frações do próprio
 * domínio, então elas coincidem na tela e uma grade só serve aos dois. Sobra uma única escolha de
 * autor, o teto das agendas, e ela está escrita no rodapé da peça. É o máximo de honestidade que um
 * eixo duplo alcança, e mesmo assim o rodapé precisa dizer que o encontro das duas marcas não
 * significa nada, porque as escalas continuam independentes.
 */
export interface WeeklyBookingAttendanceProps {
  readonly data?: readonly WeeklyBooking[];
  readonly height?: number;
  readonly className?: string;
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

interface WeekRow extends WeeklyBooking {
  /** Taxa de comparecimento da semana, ou `null` sem denominador e com dado inválido. */
  readonly rate: number | null;
  /** Mais comparecimentos que agendas: erro de dado na origem, não taxa acima do teto. */
  readonly invalid: boolean;
}

const AXIS_QTY = 'agendas';
const AXIS_RATE = 'comparecimento';
/** Teto natural de uma taxa, em fração. Não é escolha de desenho: é o limite da própria medida. */
const RATE_CEILING = 1;
/** EIX-4: cinco linhas de grade num plano de 187,5 px, o mesmo número nos dois eixos. */
const TICK_COUNT = 5;
const QTY_COLOR = 'var(--chart-1)';
const RATE_COLOR = 'var(--chart-3)';
/**
 * TOK-10, medido de `tokens.css` pela fórmula da WCAG: nenhum token do Farol alcança 3:1 contra o
 * cartão E contra uma marca de dado ao mesmo tempo, porque precisaria contrastar com dois fundos de
 * luminância oposta. `--chart-3` contra `--chart-1` mede 1,47:1 no escuro e 1,03:1 no claro, isto
 * é, no tema claro a linha DESAPARECE dentro da coluna que ela atravessa. A saída da TOK-10 não é
 * procurar outra cor, é dar à linha um segundo fundo próprio: o revestimento na cor do cartão, que
 * mede 9,50:1 no escuro e 6,00:1 no claro contra a coluna.
 */
const RATE_UNDERLAY = 'var(--surface-raised)';
const RATE_WIDTH = 2.25;
const RATE_UNDERLAY_WIDTH = 6;
/** Semana com dado inválido: coluna vazada no fundo do cartão, com o contorno na cor da série. */
const INVALID_FILL = 'var(--surface-raised)';
const INVALID_STROKE_WIDTH = 1.5;
const INVALID_DASH = '3 2';
/**
 * ESP-6, série única na banda e portanto sem `barGap`: o corpo tem 934 px, os dois eixos tomam
 * 48 px cada um, então o plano fica com 838 px; o passo é 838 / 26 = 32,23 px e a espessura é
 * 32,23 × (1 − 2 × 0,30) = 12,89 px, acima do piso de 12 px da ESP-2 e abaixo do teto de 24.
 */
const BAR_CATEGORY_GAP = '30%';
const BAR_MAX = 24;
/** EST-3: o zero MEDIDO desenha a marca. Sem isto o Recharts descarta o retângulo (REC-11). */
const BAR_MIN_POINT = 2;
const MARGIN = { top: 12, right: 0, bottom: 0, left: 0 } as const;
/** EIX-6: o tique mais longo é `100%`, que soma 27,74 px glifo a glifo, mais 8 de respiro. */
const Y_AXIS_WIDTH = 48;
const TICK_MARGIN = 8;
/** EIX-6b: `tickMargin` de 8 px mais cerca de 15 px de tinta de uma linha de 11 px. */
const X_AXIS_HEIGHT = 24;
const VALUE_LABEL_GAP = 8;
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;

/** Mais comparecimentos que agendas é impossível: erro de dado, e não taxa acima do teto. */
function isInvalid(row: WeeklyBooking): boolean {
  return row.booked > 0 && row.attended > row.booked;
}

/**
 * Taxa de comparecimento da semana. `null`, e nunca zero, nos dois casos em que ela não existe:
 * semana sem nenhuma agenda, porque falta denominador, e semana com dado inválido, porque o
 * numerador não cabe no denominador (EST-1b).
 */
function attendanceRate(row: WeeklyBooking): number | null {
  if (row.booked <= 0) return null;
  if (isInvalid(row)) return null;
  return row.attended / row.booked;
}

/** Menor passo redondo (1, 2 ou 5 vezes uma potência de 10) que não fica abaixo do passo pedido. */
function niceStep(roughStep: number): number {
  if (roughStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(roughStep));
  const magnitude = 10 ** exponent;
  const fraction = roughStep / magnitude;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * magnitude;
}

/**
 * As marcas de um eixo como frações IGUAIS do próprio domínio, sempre `TICK_COUNT` delas.
 *
 * É esta função, chamada pelos dois eixos com o mesmo `TICK_COUNT`, que faz as marcas coincidirem
 * na tela: se os dois domínios nascem em zero e são partidos no mesmo número de pedaços iguais, a
 * enésima marca de um cai no mesmo pixel da enésima marca do outro, e uma grade só vale para os
 * dois. Sem isso cada eixo arredonda por conta própria e a grade passa a mentir para um deles.
 */
function equalFractionTicks(domainTop: number): readonly number[] {
  return Array.from(
    { length: TICK_COUNT },
    (_, index) => (domainTop * index) / (TICK_COUNT - 1),
  );
}

/** As duas linhas da dica de uma semana, na ordem visual: a coluna primeiro, a linha depois. */
function buildTooltipEntries(row: WeekRow): readonly TooltipEntry[] {
  return [
    {
      color: row.invalid ? INVALID_FILL : QTY_COLOR,
      dataKey: 'booked',
      graphicalItemId: 'booked',
      name: 'Agendas na semana',
      value: formatInt(row.booked),
    },
    {
      color: RATE_COLOR,
      dataKey: 'rate',
      graphicalItemId: 'rate',
      name: 'Comparecimento',
      value:
        row.rate === null
          ? `${formatUnavailable()}: ${formatInt(row.attended)} de ${formatInt(row.booked)}`
          : formatRateWithVolume(row.attended, row.booked),
    },
  ];
}

/** Um tique por mês presente no dado, ancorado na primeira semana daquele mês (REC-21, TIP-5). */
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

export default function WeeklyBookingAttendance({
  data = defaultData,
  height,
  className,
}: WeeklyBookingAttendanceProps) {
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
        <span>Nenhuma semana neste recorte: não há agenda para comparar com o comparecimento.</span>
      </div>
    );
  }

  const rows: readonly WeekRow[] = data.map((row) => ({
    ...row,
    invalid: isInvalid(row),
    rate: attendanceRate(row),
  }));
  const maxBooked = rows.reduce((max, row) => Math.max(max, row.booked), 0);
  const qtyStep = niceStep(maxBooked / (TICK_COUNT - 1));
  const qtyTop = qtyStep * (TICK_COUNT - 1);
  const qtyTicks = equalFractionTicks(qtyTop);
  const rateTicks = equalFractionTicks(RATE_CEILING);
  const xTicks = monthAnchorTicks(rows);

  const measured = rows.filter((row): row is WeekRow & { rate: number } => row.rate !== null);
  const fullest = measured.reduce<(WeekRow & { rate: number }) | null>(
    (worst, row) => (worst === null || row.booked > worst.booked ? row : worst),
    null,
  );
  const emptiest = measured.reduce<(WeekRow & { rate: number }) | null>(
    (best, row) => (best === null || row.booked < best.booked ? row : best),
    null,
  );
  const minBooked = rows.reduce((min, row) => Math.min(min, row.booked), maxBooked);
  const gaps = rows.length - measured.length;
  const noBooking = rows.find((row) => row.booked === 0);
  const invalidWeek = rows.find((row) => row.invalid);

  const summary =
    fullest === null || emptiest === null
      ? `Gráfico combinado com colunas de agendas em ${formatInt(rows.length)} semanas e nenhuma semana com comparecimento medido para desenhar a linha da taxa.`
      : `Gráfico combinado com colunas de agendas e linha de comparecimento em ${formatInt(rows.length)} semanas. As agendas foram de ${formatInt(minBooked)} a ${formatInt(maxBooked)}, e o comparecimento caiu de ${formatPercent(emptiest.rate, 1)} na semana mais vazia para ${formatPercent(fullest.rate, 1)} na mais cheia. ${formatInt(gaps)} semanas ficam sem taxa.`;

  /** EST-3: o zero medido escreve zero, para a coluna de 2 px não passar por ausência. */
  const renderZeroLabel = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row || row.booked !== 0) return null;
    return (
      <text
        className="font-display"
        dominantBaseline="auto"
        fill="var(--text-primary)"
        fontSize={11}
        fontWeight={700}
        style={HALO}
        textAnchor="middle"
        x={Number(x) + Number(width) / 2}
        y={Number(y) - VALUE_LABEL_GAP}
      >
        {formatInt(row.booked)}
      </text>
    );
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
            style={{ backgroundColor: QTY_COLOR }}
          />
          Agendas na semana
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-[2px] border border-dashed"
            style={{ backgroundColor: INVALID_FILL, borderColor: QTY_COLOR }}
          />
          Semana com dado inválido
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-0.5 w-3.5 shrink-0 rounded-full"
            style={{ backgroundColor: RATE_COLOR }}
          />
          Comparecimento
        </li>
      </ul>
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        {fullest === null || emptiest === null ? (
          <>Sem semana com comparecimento medido neste recorte</>
        ) : (
          <>
            <span className="font-semibold text-text-primary">
              {fullest.rate < emptiest.rate
                ? 'O comparecimento cai nas semanas cheias'
                : 'O comparecimento não cai nas semanas cheias'}
            </span>
            : <span className="kpi-number font-medium text-text-primary">{formatPercent(fullest.rate, 1)}</span>{' '}
            na semana de{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(fullest.booked)}</span>{' '}
            agendas contra{' '}
            <span className="kpi-number font-medium text-text-primary">{formatPercent(emptiest.rate, 1)}</span>{' '}
            na de <span className="kpi-number font-medium text-text-primary">{formatInt(emptiest.booked)}</span>
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
            <CartesianGrid stroke={GRID_COLOR} vertical={false} yAxisId={AXIS_QTY} />
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
              allowDataOverflow
              axisLine={false}
              domain={[0, qtyTop]}
              niceTicks="none"
              tick={{ fill: QTY_COLOR, fontSize: 11 }}
              tickFormatter={(value: number) => formatInt(value)}
              tickMargin={TICK_MARGIN}
              ticks={[...qtyTicks]}
              width={Y_AXIS_WIDTH}
              yAxisId={AXIS_QTY}
            />
            <YAxis
              {...AXIS_PROPS}
              allowDataOverflow
              axisLine={false}
              domain={[0, RATE_CEILING]}
              niceTicks="none"
              orientation="right"
              tick={{ fill: RATE_COLOR, fontSize: 11 }}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickMargin={TICK_MARGIN}
              ticks={[...rateTicks]}
              width={Y_AXIS_WIDTH}
              yAxisId={AXIS_RATE}
            />
            <Tooltip
              content={renderTooltip}
              cursor={{ fill: 'var(--line-subtle)' }}
              isAnimationActive={false}
            />
            <Bar
              dataKey="booked"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              minPointSize={BAR_MIN_POINT}
              name="Agendas na semana"
              radius={[3, 3, 0, 0]}
              yAxisId={AXIS_QTY}
            >
              {rows.map((row) => (
                <Cell
                  fill={row.invalid ? INVALID_FILL : QTY_COLOR}
                  key={row.week}
                  stroke={row.invalid ? QTY_COLOR : undefined}
                  strokeDasharray={row.invalid ? INVALID_DASH : undefined}
                  strokeWidth={row.invalid ? INVALID_STROKE_WIDTH : 0}
                />
              ))}
              <LabelList content={renderZeroLabel} dataKey="booked" />
            </Bar>
            <Line
              connectNulls={false}
              dataKey="rate"
              dot={false}
              isAnimationActive={animate}
              legendType="none"
              stroke={RATE_UNDERLAY}
              strokeWidth={RATE_UNDERLAY_WIDTH}
              type="linear"
              yAxisId={AXIS_RATE}
            />
            <Line
              connectNulls={false}
              dataKey="rate"
              dot={{ r: 2.5, fill: RATE_COLOR, strokeWidth: 0 }}
              isAnimationActive={animate}
              name="Comparecimento"
              stroke={RATE_COLOR}
              strokeWidth={RATE_WIDTH}
              type="linear"
              yAxisId={AXIS_RATE}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-1.5 shrink-0 text-[11px] leading-4 text-text-muted">
        Eixos calculados: agendas de <span className="tabular-nums">{formatInt(0)}</span> a{' '}
        <span className="tabular-nums">{formatInt(qtyTop)}</span> em passo de{' '}
        <span className="tabular-nums">{formatInt(qtyStep)}</span>, do maior valor{' '}
        <span className="tabular-nums">{formatInt(maxBooked)}</span>; comparecimento de{' '}
        <span className="tabular-nums">{formatPercent(0, 0)}</span> a{' '}
        <span className="tabular-nums">{formatPercent(RATE_CEILING, 0)}</span>, o teto natural da
        taxa. <span className="tabular-nums">{formatInt(TICK_COUNT)}</span> marcas nos dois eixos.
      </p>
      <p aria-hidden className="mt-0.5 shrink-0 text-[11px] leading-4 text-text-muted">
        As escalas são independentes: onde a linha encosta nas colunas não há relação a ler.
      </p>
      {noBooking === undefined && invalidWeek === undefined ? null : (
        <p aria-hidden className="mt-0.5 shrink-0 text-[11px] leading-4 text-warning">
          Sem taxa em <span className="tabular-nums">{formatInt(gaps)}</span> das{' '}
          <span className="tabular-nums">{formatInt(rows.length)}</span> semanas
          {noBooking === undefined ? null : (
            <>
              : a de <span className="tabular-nums">{formatDate(noBooking.week)}</span> não teve
              nenhuma agenda
            </>
          )}
          {invalidWeek === undefined ? null : (
            <>
              , e a de <span className="tabular-nums">{formatDate(invalidWeek.week)}</span> registrou{' '}
              <span className="tabular-nums">{formatInt(invalidWeek.attended)}</span> comparecimentos
              em <span className="tabular-nums">{formatInt(invalidWeek.booked)}</span> agendas, que é
              dado inválido e não medição
            </>
          )}
          .
        </p>
      )}
    </div>
  );
}
