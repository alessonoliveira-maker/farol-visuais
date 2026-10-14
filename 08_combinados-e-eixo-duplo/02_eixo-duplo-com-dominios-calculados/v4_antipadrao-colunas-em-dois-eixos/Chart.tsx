import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrency, formatCurrencyAxis, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PlatformSpend } from './data';

/**
 * O antipadrão de duas grandezas absolutas em colunas de dois eixos, desenhado ao lado da leitura
 * correta em dois painéis alinhados.
 *
 * O que esta versão ensina é por que a EIX-8 existe. Numa coluna, o leitor compara ALTURA, e com
 * dois eixos a altura de uma série só se compara com a da outra por uma taxa de câmbio que o autor
 * inventou ao escolher o teto de cada eixo. A peça imprime essa taxa, e imprime também o que
 * acontece quando o teto de um dos eixos sobe um único passo: o veredito visual de duas das cinco
 * plataformas se inverte, sem nenhum número do dado mudar. Isso é o oposto de um domínio calculado.
 *
 * A prop `antipattern` existe para a guarda ser executável, e não decorativa: com ela em falso, o
 * componente desenha só a correção e escreve o motivo da recusa no lugar do desenho errado.
 */
export interface DualAxisColumnsAntipatternProps {
  readonly data?: readonly PlatformSpend[];
  /** Falso recusa desenhar as colunas em dois eixos e mostra só a correção em painéis. */
  readonly antipattern?: boolean;
  readonly height?: number;
  readonly className?: string;
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

interface ColumnSeriesSpec {
  readonly name: string;
  readonly axisId: string;
  readonly domainTop: number;
}

interface Scale {
  readonly top: number;
  readonly step: number;
  readonly ticks: readonly number[];
}

const AXIS_MONEY = 'investimento';
const AXIS_LEADS = 'leads';
/** EIX-4: quatro linhas de grade no painel principal e nos dois painéis da correção. */
const TICK_COUNT = 4;
const MONEY_COLOR = 'var(--chart-1)';
const LEAD_COLOR = 'var(--chart-3)';
/**
 * TOK-9, medido de `tokens.css` pela fórmula da WCAG: `--chart-1` contra `--chart-3` mede 1,47:1 no
 * escuro e 1,03:1 no claro, então no tema claro a cor NÃO distingue as duas séries, nem nas colunas
 * nem na amostra da legenda. A paleta está certa, porque luminância pareada entre categóricas é
 * deliberada; o que falta é o segundo canal da ACE-2. Aqui ele é o preenchimento: investimento sai
 * cheio e leads sai vazado no fundo do cartão com o contorno na própria cor da série, nas duas
 * metades do desenho e na legenda. Vazado nesta peça quer dizer "a outra série", nunca "parcial".
 */
const LEAD_FILL = 'var(--surface-raised)';
const LEAD_STROKE_WIDTH = 1.5;
/**
 * ESP-6 na metade do antipadrão, duas séries na banda: cada metade do corpo tem 517 px, os eixos
 * tomam 64 e 48 px, então o plano fica com 405 px; o passo é 405 / 5 = 81,0 px e a espessura é
 * (81,0 × 0,4 − 4) / 2 = 14,2 px, acima do piso de 12 px da ESP-2. Nos painéis da correção, série
 * única em plano de 453 px: o passo é 90,6 px e a espessura bateria em 36,24 px, então quem manda
 * ali é o teto de 24 px da ESP-2.
 */
const BAR_CATEGORY_GAP = '30%';
const BAR_GAP = 4;
const BAR_MAX = 24;
/**
 * EIX-6, e o número veio do PNG e não da conta. A soma glifo a glifo de `R$ 60 mil` dá 46,20 px e
 * com o `tickMargin` de 8 pede 54,2 px, então 56 deveria bastar; o primeiro render saiu com o
 * tique quebrado em duas linhas, `R$ 60` numa e `mil` na outra, que é a REC-2. Como 54,2 está
 * abaixo do teto de 64 px da EIX-6, a correção certa é alargar o eixo até o teto, e não encurtar a
 * unidade do rótulo: acima de 64 é que a largura viraria sinal de unidade errada.
 */
const MONEY_AXIS_WIDTH = 64;
/**
 * EIX-12: os dois painéis da correção só se alinham com a MESMA escala de categoria, a mesma margem
 * e a mesma largura de eixo. Por isso o painel de leads também reserva 64 px, embora `600` peça só
 * 28,4 px: largura diferente desloca a mesma plataforma em pixels diferentes nos dois painéis.
 */
const PANEL_AXIS_WIDTH = MONEY_AXIS_WIDTH;
const LEAD_AXIS_WIDTH = 48;
const TICK_MARGIN = 8;
/** EIX-6b: `tickMargin` de 8 px mais cerca de 15 px de tinta de uma linha de 11 px. */
const X_AXIS_HEIGHT = 24;
const MARGIN = { top: 12, right: 0, bottom: 0, left: 0 } as const;
const PANEL_MARGIN = { top: 10, right: 0, bottom: 0, left: 0 } as const;

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
 * Domínio de zero ao primeiro passo redondo acima do maior valor, com `TICK_COUNT` marcas iguais.
 * É a mesma conta dos outros modelos desta família, e é justamente por ser correta em cada eixo
 * separado que ela não salva o desenho: duas contas certas em unidades diferentes continuam sem
 * produzir uma comparação de alturas.
 */
function buildScale(maxValue: number): Scale {
  const step = niceStep(maxValue / (TICK_COUNT - 1));
  const top = step * (TICK_COUNT - 1);
  return {
    step,
    top,
    ticks: Array.from({ length: TICK_COUNT }, (_, index) => (top * index) / (TICK_COUNT - 1)),
  };
}

/**
 * A guarda da EIX-8, escrita como função pura para poder ser executada e não só citada.
 *
 * Duas séries de COLUNA em `yAxisId` distintos não se comparam entre si, e a guarda devolve o
 * motivo com o número que prova: a taxa de câmbio implícita entre os dois tetos, isto é, quanto de
 * uma grandeza a mesma altura vale na outra. Devolve `null` quando não há o que recusar, com uma
 * série só ou com as duas no mesmo eixo.
 */
function auditDualAxisColumns(series: readonly ColumnSeriesSpec[]): string | null {
  const first = series[0];
  const second = series[1];
  if (first === undefined || second === undefined) return null;
  if (first.axisId === second.axisId) return null;
  if (second.domainTop <= 0) return null;
  const exchange = first.domainTop / second.domainTop;
  return `${first.name} e ${second.name} em eixos distintos: ${formatCurrencyAxis(first.domainTop)} e ${formatInt(second.domainTop)} ocupam a mesma altura, o que empata a leitura em ${formatCurrency(exchange)} por lead.`;
}

/** Quantas plataformas o desenho faz PARECER eficientes, dado o par de tetos escolhido. */
function seemEfficient(
  rows: readonly PlatformSpend[],
  moneyTop: number,
  leadTop: number,
): number | null {
  if (rows.length === 0 || moneyTop <= 0 || leadTop <= 0) return null;
  return rows.filter((row) => row.leads / leadTop > row.investment / moneyTop).length;
}

export default function DualAxisColumnsAntipattern({
  data = defaultData,
  antipattern = true,
  height,
  className,
}: DualAxisColumnsAntipatternProps) {
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
        <span>Nenhuma plataforma neste recorte: não há investimento nem lead para comparar.</span>
      </div>
    );
  }

  const rows = [...data];
  const maxInvestment = rows.reduce((max, row) => Math.max(max, row.investment), 0);
  const maxLeads = rows.reduce((max, row) => Math.max(max, row.leads), 0);
  const money = buildScale(maxInvestment);
  const leads = buildScale(maxLeads);
  /** O teto alternativo é o passo seguinte do próprio eixo, não um número escolhido a dedo. */
  const alternateLeadTop = leads.top + leads.step;
  const refusal = auditDualAxisColumns([
    { name: 'Investimento', axisId: AXIS_MONEY, domainTop: money.top },
    { name: 'Leads', axisId: AXIS_LEADS, domainTop: leads.top },
  ]);
  const efficientNow = seemEfficient(rows, money.top, leads.top);
  const efficientThen = seemEfficient(rows, money.top, alternateLeadTop);
  const leader = rows.reduce<PlatformSpend | null>(
    (best, row) => (best === null || row.investment > best.investment ? row : best),
    null,
  );

  const summary =
    leader === null
      ? 'Gráfico com o antipadrão de colunas em dois eixos e a correção em painéis alinhados, sem plataforma no recorte.'
      : `Gráfico com o antipadrão de colunas de investimento e de leads em dois eixos, ao lado da correção em dois painéis alinhados, para ${formatInt(rows.length)} plataformas. ${leader.platform} lidera o investimento com ${formatCurrencyAxis(leader.investment)} e ${formatInt(leader.leads)} leads.`;

  const renderTooltip = (tooltipProps: TooltipContentProps): ReactElement | null => {
    const platform = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row =
      platform === undefined ? undefined : rows.find((candidate) => candidate.platform === platform);
    if (!tooltipProps.active || !row) return null;
    const entries: readonly TooltipEntry[] = [
      {
        color: MONEY_COLOR,
        dataKey: 'investment',
        graphicalItemId: 'investment',
        name: 'Investimento',
        value: formatCurrency(row.investment),
      },
      {
        color: LEAD_COLOR,
        dataKey: 'leads',
        graphicalItemId: 'leads',
        name: 'Leads',
        value: formatInt(row.leads),
      },
      {
        color: 'var(--text-muted)',
        dataKey: 'cost',
        graphicalItemId: 'cost',
        name: 'Custo por lead',
        value: row.leads > 0 ? formatCurrency(row.investment / row.leads) : formatUnavailable(),
      },
    ];
    return (
      <ChartTooltip
        active={tooltipProps.active}
        label={platform}
        payload={entries}
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
            style={{ backgroundColor: MONEY_COLOR }}
          />
          Investimento em reais
        </li>
        <li className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-[2px] border"
            style={{ backgroundColor: LEAD_FILL, borderColor: LEAD_COLOR }}
          />
          Leads em contagem
        </li>
      </ul>
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        <span className="font-semibold text-text-primary">
          Duas colunas em eixos distintos não comparam nada
        </span>
        : quem parece eficiente muda com o teto que o autor escolher para cada eixo
      </p>
      <div className="flex min-h-0 flex-1 gap-5">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <p aria-hidden className="mb-1.5 shrink-0 text-[11px] leading-4 text-negative">
            {antipattern ? 'Antipadrão: colunas em dois eixos' : 'Antipadrão recusado pela guarda'}
          </p>
          {antipattern ? (
            <div className="min-h-0 flex-1">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart
                  accessibilityLayer={false}
                  barCategoryGap={BAR_CATEGORY_GAP}
                  barGap={BAR_GAP}
                  data={rows}
                  margin={MARGIN}
                >
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} yAxisId={AXIS_MONEY} />
                  <XAxis
                    {...AXIS_PROPS}
                    axisLine={false}
                    dataKey="platform"
                    height={X_AXIS_HEIGHT}
                    interval={0}
                    tickMargin={TICK_MARGIN}
                  />
                  <YAxis
                    {...AXIS_PROPS}
                    allowDataOverflow
                    axisLine={false}
                    domain={[0, money.top]}
                    niceTicks="none"
                    tick={{ fill: MONEY_COLOR, fontSize: 11 }}
                    tickFormatter={(value: number) => formatCurrencyAxis(value)}
                    tickMargin={TICK_MARGIN}
                    ticks={[...money.ticks]}
                    width={MONEY_AXIS_WIDTH}
                    yAxisId={AXIS_MONEY}
                  />
                  <YAxis
                    {...AXIS_PROPS}
                    allowDataOverflow
                    axisLine={false}
                    domain={[0, leads.top]}
                    niceTicks="none"
                    orientation="right"
                    tick={{ fill: LEAD_COLOR, fontSize: 11 }}
                    tickFormatter={(value: number) => formatInt(value)}
                    tickMargin={TICK_MARGIN}
                    ticks={[...leads.ticks]}
                    width={LEAD_AXIS_WIDTH}
                    yAxisId={AXIS_LEADS}
                  />
                  <Tooltip
                    content={renderTooltip}
                    cursor={{ fill: 'var(--line-subtle)' }}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="investment"
                    fill={MONEY_COLOR}
                    isAnimationActive={animate}
                    maxBarSize={BAR_MAX}
                    name="Investimento"
                    radius={[3, 3, 0, 0]}
                    yAxisId={AXIS_MONEY}
                  />
                  <Bar
                    dataKey="leads"
                    fill={LEAD_FILL}
                    isAnimationActive={animate}
                    maxBarSize={BAR_MAX}
                    name="Leads"
                    radius={[3, 3, 0, 0]}
                    stroke={LEAD_COLOR}
                    strokeWidth={LEAD_STROKE_WIDTH}
                    yAxisId={AXIS_LEADS}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 items-start text-[11px] leading-4 text-text-muted">
              <span>{refusal}</span>
            </div>
          )}
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <p aria-hidden className="mb-1.5 shrink-0 text-[11px] leading-4 text-text-secondary">
            Correção: um painel por métrica
          </p>
          <div className="flex min-h-0 flex-1 flex-col gap-2.5">
            <div className="min-h-0 flex-1">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart
                  accessibilityLayer={false}
                  barCategoryGap={BAR_CATEGORY_GAP}
                  data={rows}
                  margin={PANEL_MARGIN}
                >
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis
                    {...AXIS_PROPS}
                    axisLine={false}
                    dataKey="platform"
                    height={X_AXIS_HEIGHT}
                    interval={0}
                    tick={false}
                    tickMargin={TICK_MARGIN}
                  />
                  <YAxis
                    {...AXIS_PROPS}
                    allowDataOverflow
                    axisLine={false}
                    domain={[0, money.top]}
                    niceTicks="none"
                    tick={{ fill: MONEY_COLOR, fontSize: 11 }}
                    tickFormatter={(value: number) => formatCurrencyAxis(value)}
                    tickMargin={TICK_MARGIN}
                    ticks={[...money.ticks]}
                    width={PANEL_AXIS_WIDTH}
                  />
                  <Tooltip
                    content={renderTooltip}
                    cursor={{ fill: 'var(--line-subtle)' }}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="investment"
                    fill={MONEY_COLOR}
                    isAnimationActive={animate}
                    maxBarSize={BAR_MAX}
                    name="Investimento"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="min-h-0 flex-1">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart
                  accessibilityLayer={false}
                  barCategoryGap={BAR_CATEGORY_GAP}
                  data={rows}
                  margin={PANEL_MARGIN}
                >
                  <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                  <XAxis
                    {...AXIS_PROPS}
                    axisLine={false}
                    dataKey="platform"
                    height={X_AXIS_HEIGHT}
                    interval={0}
                    tickMargin={TICK_MARGIN}
                  />
                  <YAxis
                    {...AXIS_PROPS}
                    allowDataOverflow
                    axisLine={false}
                    domain={[0, leads.top]}
                    niceTicks="none"
                    tick={{ fill: LEAD_COLOR, fontSize: 11 }}
                    tickFormatter={(value: number) => formatInt(value)}
                    tickMargin={TICK_MARGIN}
                    ticks={[...leads.ticks]}
                    width={PANEL_AXIS_WIDTH}
                  />
                  <Tooltip
                    content={renderTooltip}
                    cursor={{ fill: 'var(--line-subtle)' }}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="leads"
                    fill={LEAD_FILL}
                    isAnimationActive={animate}
                    maxBarSize={BAR_MAX}
                    name="Leads"
                    radius={[3, 3, 0, 0]}
                    stroke={LEAD_COLOR}
                    strokeWidth={LEAD_STROKE_WIDTH}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      {refusal === null ? null : (
        <p aria-hidden className="mt-1.5 shrink-0 text-[11px] leading-4 text-text-muted">
          Guarda de eixo duplo: {refusal}
        </p>
      )}
      {efficientNow === null || efficientThen === null ? null : (
        <p aria-hidden className="mt-0.5 shrink-0 text-[11px] leading-4 text-warning">
          Essa taxa é escolha do autor, não do dado: com o teto de leads no passo seguinte,{' '}
          <span className="tabular-nums">{formatInt(alternateLeadTop)}</span>, o empate cai para{' '}
          <span className="tabular-nums">{formatCurrency(money.top / alternateLeadTop)}</span> por
          lead, e as que parecem eficientes vão de{' '}
          <span className="tabular-nums">{formatInt(efficientNow)}</span> para{' '}
          <span className="tabular-nums">{formatInt(efficientThen)}</span> das{' '}
          <span className="tabular-nums">{formatInt(rows.length)}</span>, sem nenhum número mudar.
        </p>
      )}
      <p aria-hidden className="mt-0.5 shrink-0 text-[11px] leading-4 text-text-muted">
        Na correção, cada métrica tem o seu painel e o seu eixo, com a mesma ordem de plataformas e o
        mesmo eixo de categoria; a altura só se compara dentro de um painel.
      </p>
    </div>
  );
}
