import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyMediaSpend } from './data';

/**
 * Dois painéis alinhados no mesmo eixo x: investimento mensal em mídia paga em cima, em
 * colunas, e o CPL qualificado embaixo, em linha. Cada painel tem o seu próprio eixo y,
 * sem eixo duplo (EIX-8), e os dois giram juntos por `syncId`: passar o mouse move o
 * cursor e a dica nos dois ao mesmo tempo.
 */
export interface InvestmentAndCplPanelsProps {
  readonly data?: readonly MonthlyMediaSpend[];
  readonly height?: number;
  readonly className?: string;
}

const SYNC_ID = 'investimento-cpl-qualificado';
const MARGIN = { top: 6, right: 12, bottom: 0, left: 0 } as const;
const Y_AXIS_WIDTH = 58;
const MAX_BAR_SIZE = 26;
const GRID_STEPS = 4;
/** Teto local do achado A8 (FORCED_TICK_LIMIT do Farol): acima disso o eixo volta a descartar tique. */
const CATEGORY_TICK_LIMIT = 8;
const INVEST_COLOR = 'var(--chart-1)';
const CPL_COLOR = 'var(--chart-3)';

/** Menor número redondo (1, 2 ou 5 vezes uma potência de 10) que não fica abaixo do passo pedido. */
function niceStep(roughStep: number): number {
  if (roughStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(roughStep));
  const magnitude = 10 ** exponent;
  const fraction = roughStep / magnitude;
  const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * magnitude;
}

/** Domínio a partir do zero, com 4 a 5 linhas de grade redondas acima do maior valor (EIX-1, EIX-4). */
function buildDomain(maxValue: number): { domainMax: number; ticks: readonly number[] } {
  const step = niceStep(maxValue / GRID_STEPS);
  const domainMax = Math.max(step, Math.ceil(maxValue / step) * step);
  const count = Math.round(domainMax / step);
  return { domainMax, ticks: Array.from({ length: count + 1 }, (_, i) => i * step) };
}

interface PanelProps {
  readonly rows: readonly MonthlyMediaSpend[];
  readonly title: string;
  readonly dataKey: 'investimento' | 'cplQualificado';
  readonly kind: 'bar' | 'line';
  readonly color: string;
  readonly domainMax: number;
  readonly ticks: readonly number[];
  readonly xTicks: readonly string[];
  readonly showXAxis: boolean;
  readonly animate: boolean;
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
  showXAxis,
  animate,
}: PanelProps): ReactElement {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <p aria-hidden className="mb-1 shrink-0 text-xs font-medium text-text-secondary">
        {title}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} barCategoryGap="34%" data={[...rows]} margin={MARGIN} syncId={SYNC_ID}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              hide={!showXAxis}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickMargin={8}
              ticks={[...xTicks]}
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, domainMax]}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              ticks={[...ticks]}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={<ChartTooltip labelFormat="month" valueFormat="currencyCompact" />}
              cursor={kind === 'bar' ? { fill: 'var(--line-subtle)' } : { stroke: 'var(--line-strong)' }}
              isAnimationActive={false}
            />
            {kind === 'bar' ? (
              <Bar dataKey={dataKey} fill={color} isAnimationActive={animate} maxBarSize={MAX_BAR_SIZE} name={title} radius={[3, 3, 0, 0]} />
            ) : (
              <>
                {/* Barra oculta (EIX-8): o painel de linha, sozinho, cairia em escala
                  `point`, enquanto o painel de barra usa `band`; a mesma categoria ficava em
                  x diferente nos dois painéis. `hide` tira a barra do desenho e da dica
                  (Recharts filtra `entry.hide === true` do payload), mas o item continua
                  registrado como tipo `bar`, que é o que decide a escala do eixo. */}
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

export default function InvestmentAndCplPanels({
  data = defaultData,
  height,
  className,
}: InvestmentAndCplPanelsProps) {
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
        <span>Nenhum mês neste recorte: não há investimento nem CPL qualificado para comparar.</span>
      </div>
    );
  }

  const rows = data;
  const first = rows[0];
  const last = rows[rows.length - 1];
  const withCpl = rows.filter((row): row is MonthlyMediaSpend & { cplQualificado: number } => row.cplQualificado !== null);
  const semLead = rows.filter((row) => row.cplQualificado === null);

  const investMax = rows.reduce((max, row) => Math.max(max, row.investimento), 0);
  const investDomain = buildDomain(investMax);
  const cplMax = withCpl.reduce((max, row) => Math.max(max, row.cplQualificado), 0);
  const cplDomain = buildDomain(cplMax);

  const xTicks =
    rows.length <= CATEGORY_TICK_LIMIT ? rows.map((row) => row.month) : rows.filter((_, index) => index % 2 === 0).map((row) => row.month);

  const growth = first && last && first.investimento > 0 ? (last.investimento - first.investimento) / first.investimento : null;
  const cplMin = withCpl.reduce((min, row) => Math.min(min, row.cplQualificado), Number.POSITIVE_INFINITY);

  const reading = [
    growth !== null ? `Investimento ${growth >= 0 ? 'subiu' : 'caiu'} ${formatPercent(Math.abs(growth), 0)} no ano` : '',
    withCpl.length > 0 ? `CPL qualificado foi de ${formatCurrencyCompact(cplMin)} a ${formatCurrencyCompact(cplMax)}` : '',
    semLead.length > 0 ? `sem lead em ${semLead.map((row) => formatMonthShort(row.month)).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('; ');

  const summary = [
    `Dois painéis por mês, com investimento em mídia paga e CPL qualificado, de ${first ? formatMonthShort(first.month) : ''} a ${last ? formatMonthShort(last.month) : ''}.`,
    first && last ? `O investimento subiu de ${formatCurrencyCompact(first.investimento)} para ${formatCurrencyCompact(last.investimento)}.` : '',
    withCpl.length > 0
      ? `O CPL qualificado foi de ${formatCurrencyCompact(cplMin)} a ${formatCurrencyCompact(cplMax)}${semLead.length > 0 ? `, sem lead qualificado em ${semLead.map((row) => formatMonthShort(row.month)).join(', ')}` : ''}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {reading}
      </p>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex min-h-0 flex-[3] flex-col">
          <Panel
            animate={animate}
            color={INVEST_COLOR}
            dataKey="investimento"
            domainMax={investDomain.domainMax}
            kind="bar"
            rows={rows}
            showXAxis={false}
            ticks={investDomain.ticks}
            title="Investimento em mídia paga (R$)"
            xTicks={xTicks}
          />
        </div>
        <div className="flex min-h-0 flex-[2] flex-col">
          <Panel
            animate={animate}
            color={CPL_COLOR}
            dataKey="cplQualificado"
            domainMax={cplDomain.domainMax}
            kind="line"
            rows={rows}
            showXAxis
            ticks={cplDomain.ticks}
            title="CPL qualificado (R$ por lead)"
            xTicks={xTicks}
          />
        </div>
      </div>
    </div>
  );
}
