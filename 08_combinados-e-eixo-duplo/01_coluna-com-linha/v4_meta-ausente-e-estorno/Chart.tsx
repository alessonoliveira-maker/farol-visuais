import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZIndexLayer,
  useXAxisScale,
  useYAxisScale,
  type DotItemDotProps,
  type TooltipContentProps,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import {
  formatCurrencyAxis,
  formatCurrencyCompact,
  formatInt,
  formatMonthShort,
  formatUnavailable,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyRevenueWithGaps } from './data';

/**
 * Colunas com a receita reconhecida de cada mês e uma linha com a meta do mesmo mês, no mesmo eixo
 * y. Onde a meta não foi cadastrada a linha se interrompe, em vez de atravessar o vazio; onde o
 * estorno passou do reconhecido a coluna desce do zero, em vez de sumir.
 */
export interface RevenueWithMissingTargetProps {
  readonly data?: readonly MonthlyRevenueWithGaps[];
  readonly height?: number;
  readonly className?: string;
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

/** Teto de faixas de grade da EIX-4: com o negativo, os dois lados do zero somam no mesmo teto. */
const MAX_GRID_BANDS = 4;
const MARGIN = { top: 16, right: 10, bottom: 0, left: 0 } as const;
/**
 * Acima da faixa de 48 a 64 px da EIX-6, e o desvio tem consequência medida no render: o tique mais
 * longo deste domínio é `−R$ 200 mil` (U+2212 antes do símbolo, como o formatador devolve), e o
 * Recharts o quebra em duas linhas (`−R$ 200` e `mil`) com 80 px ou menos, que é a REC-2. O menor
 * eixo em uma linha no render do catálogo é 81 px (EIX-6, emenda de 2026-10-02); 82 dá 1 px de folga.
 */
const Y_AXIS_WIDTH = 82;
const TICK_MARGIN = 8;
/** EIX-6b: `tickMargin` de 8 px mais cerca de 15 px de tinta de uma linha de 11 px. */
const X_AXIS_HEIGHT = 24;
const BAR_CATEGORY_GAP = '30%';
/**
 * ESP-6, série única na banda e portanto sem `barGap`: passo = 484 / 12 = 40,3 px e espessura
 * = 40,3 × (1 − 2 × 0,30) = 16,1 px, acima do piso de 12 px da ESP-2 e abaixo do teto de 24 px.
 */
const BAR_MAX = 24;
const BAR_FILL = 'var(--chart-1)';
/** COR-6: receita que cai é o ruim da métrica, então o mês do estorno sai em semântico. */
const REVERSAL_FILL = 'var(--negative)';
const TARGET_STROKE = 'var(--chart-3)';
/**
 * TOK-4, TOK-9 e TOK-10: `--chart-3` mede 1,47:1 no escuro e 1,03:1 no claro contra `--chart-1`, então
 * a linha da meta não pode contar com a cor para se separar da coluna. Segunda saída da TOK-10: a
 * linha passa por trás das colunas, sem revestimento, porque a guia é limiar e a coluna é o dado.
 * Coluna que passa da meta cobre a linha; a que fica abaixo a deixa visível por cima do topo.
 */
const TARGET_Z = 250;
const TARGET_WIDTH = 2.25;
/** Respiro entre a nota de meta ausente e o topo da coluna mais alta do vão. */
const GAP_NOTE_LIFT = 10;
/** Camada de rótulo do Recharts: o texto fica por cima de qualquer coluna. */
const LABEL_Z = 2000;
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;

/**
 * Domínio que inclui o negativo sem perder tique redondo: procura o menor passo redondo (1, 2 ou 5
 * vezes uma potência de 10) em que as faixas dos dois lados do zero, somadas, caibam no teto da
 * EIX-4. O zero é sempre um dos tiques, porque os dois lados são múltiplos inteiros do passo.
 */
function buildSignedDomain(
  minValue: number,
  maxValue: number,
): { domain: readonly [number, number]; ticks: readonly number[] } {
  const spread = Math.max(Math.abs(minValue), Math.abs(maxValue), 1);
  const firstExponent = Math.floor(Math.log10(spread)) - 3;
  for (let exponent = firstExponent; exponent <= firstExponent + 8; exponent += 1) {
    for (const factor of [1, 2, 5]) {
      const step = factor * 10 ** exponent;
      const below = Math.ceil(Math.max(0, -minValue) / step);
      const above = Math.ceil(Math.max(0, maxValue) / step);
      if (below + above > MAX_GRID_BANDS) continue;
      const domainMin = -below * step;
      return {
        domain: [domainMin, above * step],
        ticks: Array.from({ length: below + above + 1 }, (_, index) => domainMin + index * step),
      };
    }
  }
  return { domain: [minValue, maxValue], ticks: [minValue, maxValue] };
}

/** Valor com o sinal de menos tipográfico da NUM-3, sobre o valor absoluto: o formatador de moeda compacta não o aplica ao negativo. */
function signedCurrency(value: number): string {
  return value < 0 ? `−${formatCurrencyCompact(Math.abs(value))}` : formatCurrencyCompact(value);
}

/** Meses em texto de tela, com "e" antes do último. */
function joinMonths(months: readonly string[]): string {
  const labels = months.map((month) => formatMonthShort(month));
  const last = labels[labels.length - 1];
  if (labels.length <= 1 || last === undefined) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} e ${last}`;
}

/** As três linhas da dica de um mês: realizado, meta e a diferença, na ordem visual (DIC-4). */
function buildTooltipEntries(row: MonthlyRevenueWithGaps): readonly TooltipEntry[] {
  const target = row.target;
  return [
    {
      color: row.revenue < 0 ? REVERSAL_FILL : BAR_FILL,
      dataKey: 'revenue',
      graphicalItemId: 'revenue',
      name: 'Receita reconhecida',
      value: signedCurrency(row.revenue),
    },
    {
      color: TARGET_STROKE,
      dataKey: 'target',
      graphicalItemId: 'target',
      name: 'Meta do mês',
      value: target === null ? formatUnavailable() : formatCurrencyCompact(target),
    },
    {
      color: target === null ? 'var(--text-muted)' : row.revenue >= target ? 'var(--positive)' : 'var(--negative)',
      dataKey: 'gap',
      graphicalItemId: 'gap',
      name: 'Diferença',
      value:
        target === null
          ? formatUnavailable()
          : `${row.revenue >= target ? '+' : '−'}${formatCurrencyCompact(Math.abs(row.revenue - target))}`,
    },
  ];
}

/**
 * A nota do vão da meta, escrita acima da coluna mais alta dos meses sem meta, para nunca cruzar
 * marca nenhuma (ROT-7). Ela existe porque o vão da linha, sozinho, não diz se a meta não foi
 * batida ou não foi cadastrada (DIC-5: o nulo não pode viver só na dica).
 */
function MissingTargetNote({
  months,
  ceilingValue,
}: {
  readonly months: readonly string[];
  readonly ceilingValue: number;
}): ReactElement | null {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (xScale === undefined || yScale === undefined || months.length === 0) return null;
  const centers: number[] = [];
  for (const month of months) {
    const center = xScale(month, { position: 'middle' });
    if (center !== undefined) centers.push(center);
  }
  if (centers.length === 0) return null;
  const x = centers.reduce((sum, center) => sum + center, 0) / centers.length;
  const top = yScale(ceilingValue);
  if (top === undefined) return null;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      <text
        className="font-sans"
        fill="var(--text-muted)"
        fontSize={11}
        style={HALO}
        textAnchor="middle"
        x={x}
        y={top - GAP_NOTE_LIFT}
      >
        sem meta
      </text>
    </ZIndexLayer>
  );
}

export default function RevenueWithMissingTarget({
  data = defaultData,
  height,
  className,
}: RevenueWithMissingTargetProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const first = data[0];

  if (first === undefined) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há receita reconhecida nem meta para comparar.</span>
      </div>
    );
  }

  const maxValue = data.reduce(
    (max, row) => (row.target === null ? Math.max(max, row.revenue) : Math.max(max, row.revenue, row.target)),
    first.revenue,
  );
  const minValue = data.reduce(
    (min, row) => (row.target === null ? Math.min(min, row.revenue) : Math.min(min, row.revenue, row.target)),
    first.revenue,
  );
  const { domain, ticks } = buildSignedDomain(minValue, maxValue);
  const xTicks = data.filter((_, index) => index % 2 === 0).map((row) => row.month);

  const missing = data.filter((row) => row.target === null);
  const missingMonths = missing.map((row) => row.month);
  const firstMissing = missing[0];
  /** Topo do vão: a mais alta das colunas sem meta, ou nulo quando não há vão nenhum (EST-1b). */
  const missingCeiling =
    firstMissing === undefined
      ? null
      : missing.reduce((max, row) => Math.max(max, row.revenue), firstMissing.revenue);
  const reversal = data.reduce<MonthlyRevenueWithGaps | null>(
    (worst, row) => (row.revenue < 0 && (worst === null || row.revenue < worst.revenue) ? row : worst),
    null,
  );

  const summary = [
    `Gráfico de colunas com a receita reconhecida de ${formatInt(data.length)} meses e linha com a meta mensal.`,
    reversal === null
      ? ''
      : `Um estorno deixa ${formatMonthShort(reversal.month)} em ${signedCurrency(reversal.revenue)}.`,
    missingMonths.length === 0
      ? ''
      : `Os meses de ${joinMonths(missingMonths)} não têm meta cadastrada, e a linha fica interrompida ali.`,
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Ponto só onde a linha não forma traço: valor sem vizinho com valor, que sem isso sumiria. Nos
   * demais pontos o marcador cairia por cima da coluna que a linha atravessa por trás (TOK-10).
   */
  const renderIsolatedDot = ({ cx, cy, index }: DotItemDotProps): ReactElement | null => {
    const before = index > 0 ? data[index - 1]?.target : null;
    const after = data[index + 1]?.target;
    if (cx === undefined || cy === undefined) return null;
    if ((before ?? null) !== null || (after ?? null) !== null) return null;
    return <circle cx={cx} cy={cy} fill={TARGET_STROKE} key={`isolated-${index}`} r={3} />;
  };

  const renderTooltip = (tooltipProps: TooltipContentProps): ReactElement | null => {
    const month = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = month === undefined ? undefined : data.find((candidate) => candidate.month === month);
    if (!tooltipProps.active || !row) return null;
    return (
      <ChartTooltip
        active={tooltipProps.active}
        label={month}
        labelFormat="month"
        payload={buildTooltipEntries(row)}
        valueFormat="currencyCompact"
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
          Receita reconhecida
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: REVERSAL_FILL }}
          />
          Mês negativo por estorno
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-0.5 w-3.5 shrink-0 rounded-full"
            style={{ backgroundColor: TARGET_STROKE }}
          />
          Meta do mês
        </li>
      </ul>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {reversal === null ? null : (
          <>
            <span className="font-semibold text-text-primary">Estorno</span> deixa{' '}
            {formatMonthShort(reversal.month)} em{' '}
            <span className="kpi-number font-medium text-text-primary">
              {signedCurrency(reversal.revenue)}
            </span>
          </>
        )}
        {missingMonths.length === 0 ? null : (
          <>
            {reversal === null ? null : '; '}
            {joinMonths(missingMonths)} sem meta cadastrada
          </>
        )}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart
            accessibilityLayer={false}
            barCategoryGap={BAR_CATEGORY_GAP}
            data={[...data]}
            margin={MARGIN}
          >
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickMargin={TICK_MARGIN}
              ticks={xTicks}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[...domain]}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
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
              dataKey="target"
              dot={renderIsolatedDot}
              isAnimationActive={animate}
              name="Meta do mês"
              stroke={TARGET_STROKE}
              strokeWidth={TARGET_WIDTH}
              type="linear"
              zIndex={TARGET_Z}
            />
            <Bar dataKey="revenue" isAnimationActive={animate} maxBarSize={BAR_MAX} name="Receita reconhecida">
              {data.map((row) => (
                <Cell fill={row.revenue < 0 ? REVERSAL_FILL : BAR_FILL} key={row.month} />
              ))}
            </Bar>
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            {missingCeiling === null ? null : (
              <MissingTargetNote ceilingValue={missingCeiling} months={missingMonths} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
