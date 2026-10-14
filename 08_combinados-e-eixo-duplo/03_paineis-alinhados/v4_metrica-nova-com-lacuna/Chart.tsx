import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import {
  formatCurrencyAxis,
  formatCurrencyCompact,
  formatMonthShort,
  formatPercent,
  formatRateWithVolume,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type RevenueAndConversionMonth } from './data';

/**
 * Dois painéis alinhados quando a métrica de baixo é mais nova que o calendário do cartão: a
 * receita existe nos doze meses, a taxa de conversão só a partir do mês em que o registro passou
 * a ser feito. Os meses anteriores vão como `null`, sem interpolação e sem zero (EIX-10), e a
 * faixa da ANO-4 escreve a ausência dentro do próprio painel, em vez de deixá-la para a dica,
 * que é o que a DIC-5 cobra de toda série com nulo.
 */
export interface RevenueAndNewMetricPanelsProps {
  readonly data?: readonly RevenueAndConversionMonth[];
  readonly height?: number;
  readonly className?: string;
}

const SYNC_ID = 'receita-e-taxa-de-conversao';
const MARGIN = { top: 8, right: 12, bottom: 0, left: 0 } as const;
/**
 * A mesma largura nos dois eixos, e é ela que alinha as colunas dos dois painéis.
 *
 * O painel de cima pede o rótulo mais largo do cartão (`R$ 1,0 mi`, 47,6 px de tinta em 11 px) e
 * o de baixo o mais estreito (`30%`, 18,4 px). A mesma largura nos dois é o que mantém as bandas
 * de mês na mesma coluna; largura por painel produz o desalinhamento da REC-16.
 *
 * O NÚMERO 64 É MEDIDO, e a conta não é a que parece. O Recharts reserva para a tinta do tique
 * `width` menos o `tickSize` de 6 px menos o `tickMargin` de 8 px, ou seja 14 px, e não só o
 * respiro: com 60 sobravam 46 px para 47,6 px de texto e o rótulo QUEBRAVA em duas linhas, o que
 * cortou o tique do topo contra a borda do painel. É a REC-2, e a régua saiu de quatro medições
 * dos previews deste modelo (58, 60 e 48 px de largura, com tique de 47,3, 47,6 e 33,8 px).
 * A receita também mudou de unidade no caminho, de centenas de milhar para milhões, porque
 * `R$ 500 mil` mede 53,5 px e não cabe em largura nenhuma dentro da faixa de 48 a 64 da EIX-6:
 * é a outra metade da saída da REC-2, em que quem cede é a unidade do rótulo.
 */
const Y_AXIS_WIDTH = 64;
const MAX_BAR_SIZE = 24;
const GRID_STEPS = 4;
/** Teto do `FORCED_TICK_LIMIT` do Farol, que não está na lista de imports da seção 6. */
const CATEGORY_TICK_LIMIT = 8;
const REVENUE_COLOR = 'var(--chart-1)';
const RATE_COLOR = 'var(--chart-3)';

/** Menor número redondo (1, 2 ou 5 vezes uma potência de 10) que não fica abaixo do passo pedido. */
function niceStep(roughStep: number): number {
  if (roughStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(roughStep));
  const magnitude = 10 ** exponent;
  const fraction = roughStep / magnitude;
  const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * magnitude;
}

/** Domínio a partir do zero com no máximo `GRID_STEPS` degraus redondos (EIX-1, EIX-4). */
function buildDomain(maxValue: number): { domainMax: number; ticks: readonly number[] } {
  let step = niceStep(maxValue / GRID_STEPS);
  for (let guard = 0; guard < 12 && Math.ceil(maxValue / step) > GRID_STEPS; guard += 1) {
    step = niceStep(step * 1.5);
  }
  const domainMax = Math.max(step, Math.ceil(maxValue / step) * step);
  const count = Math.round(domainMax / step);
  return { domainMax, ticks: Array.from({ length: count + 1 }, (_, i) => i * step) };
}

/**
 * A taxa do mês, ou `null` quando o mês não tem medição (EST-1b).
 *
 * Denominador ausente e denominador zero devolvem `null`, nunca `0`: taxa zero afirma que
 * ninguém converteu, e aqui o que falta é o instrumento de contagem.
 */
function conversionRate(row: RevenueAndConversionMonth): number | null {
  if (row.ganhos === null || row.oportunidades === null || row.oportunidades <= 0) return null;
  return row.ganhos / row.oportunidades;
}

/** O maior valor de uma lista de números, ou `null` quando a lista está vazia (EST-1b). */
function highest(values: readonly number[]): number | null {
  let found: number | null = null;
  for (const value of values) {
    if (found === null || value > found) found = value;
  }
  return found;
}

interface PanelRow extends RevenueAndConversionMonth {
  readonly taxa: number | null;
}

interface PanelProps {
  readonly rows: readonly PanelRow[];
  readonly title: string;
  readonly dataKey: 'receita' | 'taxa';
  readonly kind: 'bar' | 'line';
  readonly color: string;
  readonly domainMax: number;
  readonly ticks: readonly number[];
  readonly xTicks: readonly string[];
  readonly tickFormat: (value: number) => string;
  readonly showXTicks: boolean;
  readonly animate: boolean;
  /** Primeiro e último mês sem medição, mais o texto da faixa, quando houver lacuna. */
  readonly gap?: { readonly from: string; readonly to: string; readonly label: string };
}

/** Um painel do combinado: título com a unidade no lugar da legenda, e o gráfico de um eixo só. */
function Panel({
  rows,
  title,
  dataKey,
  kind,
  color,
  domainMax,
  ticks,
  xTicks,
  tickFormat,
  showXTicks,
  animate,
  gap,
}: PanelProps): ReactElement {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <p aria-hidden className="mb-1 shrink-0 text-xs font-medium text-text-secondary">
        {title}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart
            accessibilityLayer={false}
            barCategoryGap="34%"
            data={[...rows]}
            margin={MARGIN}
            syncId={SYNC_ID}
          >
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            {/* `tick={false}` e nunca `hide` (saída da REC-17): `hide` devolveria ao plano os 30 px
              reservados ao eixo e o painel de cima ficaria mais alto do que a proporção pedida. */}
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              interval={0}
              tick={showXTicks ? AXIS_PROPS.tick : false}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickMargin={8}
              ticks={[...xTicks]}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, domainMax]}
              interval={0}
              tickFormatter={tickFormat}
              ticks={[...ticks]}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={
                <ChartTooltip labelFormat="month" valueFormat={kind === 'bar' ? 'currencyCompact' : 'percent'} />
              }
              cursor={kind === 'bar' ? { fill: 'var(--line-subtle)' } : { stroke: CURSOR_COLOR }}
              isAnimationActive={false}
            />
            {gap === undefined ? null : (
              <ReferenceArea
                fill="var(--surface-sunken)"
                ifOverflow="extendDomain"
                label={{
                  fill: 'var(--text-muted)',
                  fontSize: 11,
                  position: 'center',
                  value: gap.label,
                }}
                x1={gap.from}
                x2={gap.to}
              />
            )}
            {kind === 'bar' ? (
              <Bar
                dataKey={dataKey}
                fill={color}
                isAnimationActive={animate}
                maxBarSize={MAX_BAR_SIZE}
                name={title}
                radius={[3, 3, 0, 0]}
              />
            ) : (
              <>
                {/* Barra oculta: o painel de linha, sozinho, cairia em escala `point` enquanto o
                  painel de barra usa `band`, e a mesma categoria ficaria em x diferente nos dois
                  (REC-16). `hide` tira a barra do desenho e da dica sem tirar o painel da escala
                  `band`, que é também o que faz a faixa da lacuna cobrir quatro meses inteiros. */}
                <Bar dataKey={dataKey} hide isAnimationActive={false} legendType="none" />
                <Line
                  activeDot={{ r: 4, fill: color }}
                  connectNulls={false}
                  dataKey={dataKey}
                  dot={{ r: 3, fill: color, strokeWidth: 0 }}
                  isAnimationActive={animate}
                  name={title}
                  stroke={color}
                  strokeWidth={2}
                  type="monotone"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function RevenueAndNewMetricPanels({
  data = defaultData,
  height,
  className,
}: RevenueAndNewMetricPanelsProps) {
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
        <span>Nenhum mês neste recorte: não há receita nem taxa de conversão para comparar.</span>
      </div>
    );
  }

  const rows: readonly PanelRow[] = data.map((row) => ({ ...row, taxa: conversionRate(row) }));
  const first = rows[0];
  const last = rows[rows.length - 1];
  // O filtro estreita as TRÊS chaves, e não só a taxa: `conversionRate` só devolve número quando
  // as duas contagens existem, mas quem lê o tipo precisa disso escrito para usar o par da
  // DAD-1 (`formatRateWithVolume`) sem reabrir a checagem de nulo em cada chamada.
  const measured = rows.filter(
    (row): row is PanelRow & { taxa: number; ganhos: number; oportunidades: number } =>
      row.taxa !== null && row.ganhos !== null && row.oportunidades !== null,
  );
  const firstMeasured = measured[0];
  const lastMeasured = measured[measured.length - 1];

  const firstMeasuredIndex = rows.findIndex((row) => row.taxa !== null);
  const beforeMeasured = firstMeasuredIndex > 0 ? rows[firstMeasuredIndex - 1] : undefined;
  const gap =
    first && beforeMeasured
      ? {
          from: first.month,
          to: beforeMeasured.month,
          label: `sem medição até ${formatMonthShort(beforeMeasured.month)}`,
        }
      : undefined;

  const revenueDomain = buildDomain(highest(rows.map((row) => row.receita)) ?? 0);
  const rateDomain = buildDomain(highest(measured.map((row) => row.taxa)) ?? 0);

  const xTicks =
    rows.length <= CATEGORY_TICK_LIMIT
      ? rows.map((row) => row.month)
      : rows.filter((_, index) => index % 2 === 0).map((row) => row.month);

  const rateTitle = firstMeasured
    ? `Taxa de conversão (%), medida desde ${formatMonthShort(firstMeasured.month)}`
    : 'Taxa de conversão (%)';

  // A lacuna não entra nesta linha de propósito: a faixa da ANO-4 já a escreve dentro do painel,
  // e uma terceira oração levaria a leitura a 571 px de tinta numa caixa de 574, que quebra em
  // duas linhas e rouba 16,5 px de desenho (é a GEO-14).
  const reading = [
    first && last
      ? `Receita sobe de ${formatCurrencyCompact(first.receita)} a ${formatCurrencyCompact(last.receita)}`
      : '',
    lastMeasured
      ? `conversão de ${formatRateWithVolume(lastMeasured.ganhos, lastMeasured.oportunidades)} em ${formatMonthShort(lastMeasured.month)}`
      : '',
  ]
    .filter(Boolean)
    .join('; ');

  const summary = [
    first && last
      ? `Dois painéis por mês, de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}, com receita de ${formatCurrencyCompact(first.receita)} a ${formatCurrencyCompact(last.receita)}.`
      : '',
    firstMeasured && lastMeasured
      ? `A taxa de conversão só é medida desde ${formatMonthShort(firstMeasured.month)}, e vai de ${formatRateWithVolume(firstMeasured.ganhos, firstMeasured.oportunidades)} a ${formatRateWithVolume(lastMeasured.ganhos, lastMeasured.oportunidades)}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex min-h-0 flex-[3] flex-col">
          <Panel
            animate={animate}
            color={REVENUE_COLOR}
            dataKey="receita"
            domainMax={revenueDomain.domainMax}
            kind="bar"
            rows={rows}
            showXTicks={false}
            tickFormat={(value: number) => formatCurrencyAxis(value)}
            ticks={revenueDomain.ticks}
            title="Receita fechada (R$)"
            xTicks={xTicks}
          />
        </div>
        <div className="flex min-h-0 flex-[2] flex-col">
          <Panel
            animate={animate}
            color={RATE_COLOR}
            dataKey="taxa"
            domainMax={rateDomain.domainMax}
            gap={gap}
            kind="line"
            rows={rows}
            showXTicks
            tickFormat={(value: number) => formatPercent(value, 0)}
            ticks={rateDomain.ticks}
            title={rateTitle}
            xTicks={xTicks}
          />
        </div>
      </div>
    </div>
  );
}
