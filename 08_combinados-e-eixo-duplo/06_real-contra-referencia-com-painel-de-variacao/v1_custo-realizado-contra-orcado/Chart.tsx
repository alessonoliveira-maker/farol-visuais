import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, CartesianGrid, Cell, ComposedChart, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyCostVsBudget } from './data';

/**
 * Dois painéis alinhados pelo mesmo eixo x e pelo mesmo `syncId`: em cima, o custo realizado
 * de cada mês de 2026 em barra sólida e o orçado em barra vazada, no mesmo eixo y; embaixo, a
 * variação do realizado contra o orçado, com escala própria e cor pela polaridade da métrica
 * (nunca pelo sinal), mais o zero marcado por `ReferenceLine`.
 */
export interface MonthlyCostVsBudgetPanelsProps {
  readonly data?: readonly MonthlyCostVsBudget[];
  /** Polaridade da métrica: custo é "menorMelhor". Decide a cor da variação, nunca o sinal dela. */
  readonly polarity?: CostPolarity;
  readonly height?: number;
  readonly className?: string;
}

/** "menorMelhor": estourar o orçado é ruim. "maiorMelhor": ficar abaixo do orçado é ruim. */
export type CostPolarity = 'maiorMelhor' | 'menorMelhor';

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

const SYNC_ID = 'custo-realizado-contra-orcado';
const MAIN_MARGIN = { top: 20, right: 12, bottom: 8, left: 0 } as const;
const VARIANCE_MARGIN = { top: 20, right: 12, bottom: 0, left: 0 } as const;
/** TENSÃO DECLARADA da EIX-6: 84 px e não os 48 a 64 do teto, porque −R$ 300 mil (61,79 px de tinta) só fica em uma linha a partir de 81 px. */
const Y_AXIS_WIDTH = 84;
const GRID_STEPS = 4;
const CATEGORY_TICK_LIMIT = 8;
const REALIZADO_FILL = 'var(--chart-1)';
/** O orçado usa a mesma cor do realizado, só vazado e tracejado: mede o mesmo 5,90:1 do
 * preenchimento (17.10), sem precisar da isenção de valor escrito que `--line-strong` pediria. */
const ORCADO_STROKE = 'var(--chart-1)';
const VALUE_LABEL_GAP = 6;
/**
 * Painel principal como coluna fantasma (ESP-6, ESP-2), não mais duas séries lado a lado. Uma única
 * `Bar` por mês, no dado do orçado, ocupa a banda inteira vazada e tracejada; o `shape` customizado
 * (`renderMainColumn`) soma o realizado sólido por cima, mais estreito e centrado, escalado pela
 * mesma razão que liga o orçado à sua própria altura, então o realizado sobe acima do contorno
 * quando estoura o orçado, sem precisar de uma segunda série.
 * Com uma série só por banda a conta da ESP-6 não desconta `barGap`: canvas de 740 px de largura
 * dá passo ≈ 50,3 px para 12 meses, fantasma ≈ 50,3 × (1 − 2 × 0,30) ≈ 20,1 px e realizado central
 * (`MAIN_SOLID_RATIO` 0,65) ≈ 13,1 px, os dois acima do piso de 12 px em cartão da ESP-2. A versão
 * anterior desenhava as duas séries lado a lado na mesma banda; com `barGap` de 3 px a espessura
 * efetiva media 5 px, abaixo do piso, e o contorno tracejado virava pontilhado quase idêntico ao
 * preenchimento sólido, porque as duas tintas dividiam a mesma marca minúscula.
 */
const MAIN_BAR_CATEGORY_GAP = '30%';
const MAIN_MAX_BAR_SIZE = 22;
const MAIN_SOLID_RATIO = 0.65;
const VARIANCE_BAR_CATEGORY_GAP = '34%';
const VARIANCE_MAX_BAR_SIZE = 18;
/** Altura mínima da barra de variação: sem isso, um desvio de poucos reais não desenha marca (ESP-6, nota do estudo). */
const MIN_POINT_SIZE = 3;
/**
 * Afastamento extra em índice ímpar (ROT-9): com 12 meses e rótulo de até 12 caracteres, dois
 * desvios pequenos em meses vizinhos nascem a menos de 1 px um do outro na mesma altura. Alternar
 * o afastamento pela paridade do índice separa qualquer par vizinho, porque um dos dois sempre
 * recebe o extra.
 */
const STAGGER_EXTRA = 14;
/** Halo na cor do cartão: o rótulo de variação continua legível ao cruzar a ReferenceLine do zero. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface Row extends MonthlyCostVsBudget {
  readonly variacao: number;
}

interface MainShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  /**
   * Retângulo do plano inteiro que o Recharts entrega junto de cada barra (`BarRectangleItem`).
   * É daqui que sai o pixel por real, porque a banda sozinha não serve de escala quando o orçado
   * do mês é zero.
   */
  readonly background?: { readonly height?: number };
  readonly payload?: Row;
}

/**
 * Desenha a coluna fantasma do painel principal a partir do payload do mês: `x`, `y`, `width` e
 * `height` vêm da geometria da série `orcado` (a banda inteira); o retângulo vazado e tracejado
 * usa essa geometria direto, e o realizado sólido nasce mais estreito (`MAIN_SOLID_RATIO`),
 * centrado na mesma banda.
 *
 * A altura do realizado sai da escala do eixo, `plano / domínio`, e **não** da razão
 * `realizado / orçado`: a razão anulava a altura em todo mês de orçado zero e apagava da tela um
 * realizado que existe (conserto de 2026-09-25). Nos meses de orçado positivo as duas contas dão o
 * mesmo pixel, porque a banda é `orçado / domínio × plano`: o desenho aprovado não muda.
 */
function renderMainColumn(domainMax: number) {
  return function MainColumn({ x = 0, y = 0, width = 0, height: bandHeight = 0, background, payload }: MainShapeProps): ReactElement | null {
    if (!payload) return null;
    const { realizado, orcado } = payload;
    const solidWidth = width * MAIN_SOLID_RATIO;
    const solidX = x + (width - solidWidth) / 2;
    const plotHeight = background?.height ?? 0;
    /** Sem o retângulo do plano, cai na razão antiga: é o único caminho em que ela ainda vale. */
    const solidHeight =
      plotHeight > 0 && domainMax > 0
        ? (plotHeight * realizado) / domainMax
        : orcado > 0
          ? (bandHeight * realizado) / orcado
          : 0;
    /** `y + bandHeight` é o pixel do zero mesmo com banda de altura zero: a base não se perde. */
    const baseline = y + bandHeight;
    const solidY = baseline - solidHeight;
    return (
      <g>
        <rect fill="none" height={bandHeight} rx={3} stroke={ORCADO_STROKE} strokeDasharray="3 3" strokeWidth={1.5} width={width} x={x} y={y} />
        <rect fill={REALIZADO_FILL} height={Math.max(solidHeight, 0)} rx={3} width={solidWidth} x={solidX} y={Math.min(solidY, baseline)} />
      </g>
    );
  };
}

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

/** Domínio simétrico em torno do zero, com duas linhas de grade redondas de cada lado (EIX-4). */
function buildSymmetricDomain(maxAbsValue: number): { domainMax: number; ticks: readonly number[] } {
  const step = niceStep(maxAbsValue / 2);
  const domainMax = Math.max(step, Math.ceil(maxAbsValue / step) * step);
  return { domainMax, ticks: [-domainMax, -step, 0, step, domainMax] };
}

function buildRows(rows: readonly MonthlyCostVsBudget[]): readonly Row[] {
  return rows.map((row) => ({ ...row, variacao: row.realizado - row.orcado }));
}

/** A polaridade decide o que é ruim, nunca o sinal da variação sozinho (COR-6). */
function isBad(variacao: number, polarity: CostPolarity): boolean {
  if (variacao === 0) return false;
  return polarity === 'menorMelhor' ? variacao > 0 : variacao < 0;
}

function signed(value: number): string {
  return `${value >= 0 ? '+' : '−'}${formatCurrencyCompact(Math.abs(value))}`;
}

/**
 * Duas linhas de dica para o painel principal, montadas à mão porque a coluna fantasma usa uma
 * única `Bar` (série `orcado`): o payload automático do Recharts não traria o realizado.
 */
function buildMainTooltipEntries(row: Row): readonly TooltipEntry[] {
  return [
    { color: REALIZADO_FILL, dataKey: 'realizado', graphicalItemId: 'realizado', name: 'Custo realizado', value: row.realizado },
    { color: ORCADO_STROKE, dataKey: 'orcado', graphicalItemId: 'orcado', name: 'Orçado', value: row.orcado },
  ];
}

/** Uma linha de dica só, com o sinal tipográfico (NUM-3): o formatador padrão usa hífen. */
function buildVarianceTooltipEntry(row: Row, polarity: CostPolarity): readonly TooltipEntry[] {
  const bad = isBad(row.variacao, polarity);
  return [
    {
      color: row.variacao === 0 ? 'var(--line-strong)' : bad ? 'var(--negative)' : 'var(--positive)',
      dataKey: 'variacao',
      graphicalItemId: 'variacao',
      name: 'Variação',
      value: signed(row.variacao),
    },
  ];
}

export default function MonthlyCostVsBudgetPanels({
  data = defaultData,
  polarity = 'menorMelhor',
  height,
  className,
}: MonthlyCostVsBudgetPanelsProps) {
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
        <span>Nenhum mês neste recorte: não há custo realizado nem orçado para comparar.</span>
      </div>
    );
  }

  const rows = buildRows(data);
  const mainMax = rows.reduce((max, row) => Math.max(max, row.realizado, row.orcado), 0);
  const mainDomain = buildDomain(mainMax);
  const varianceMax = rows.reduce((max, row) => Math.max(max, Math.abs(row.variacao)), 0);
  const varianceDomain = buildSymmetricDomain(varianceMax);
  const xTicks =
    rows.length <= CATEGORY_TICK_LIMIT ? rows.map((row) => row.month) : rows.filter((_, index) => index % 2 === 0).map((row) => row.month);

  const over = rows.filter((row) => isBad(row.variacao, polarity));
  const worst = rows.reduce<Row | null>((acc, row) => {
    if (!isBad(row.variacao, polarity)) return acc;
    return acc === null || Math.abs(row.variacao) > Math.abs(acc.variacao) ? row : acc;
  }, null);

  const reading = worst
    ? `${String(over.length)} de ${String(rows.length)} meses estouraram o orçado; maior desvio em ${formatMonthShort(worst.month)}, ${formatCurrencyCompact(Math.abs(worst.variacao))} acima`
    : `Nenhum dos ${String(rows.length)} meses estourou o orçado`;

  const summary = [
    `Dois painéis com o custo mensal de ${String(rows.length)} meses de 2026: realizado contra orçado em cima, variação embaixo.`,
    `${String(over.length)} de ${String(rows.length)} meses ficaram acima do orçado.`,
    worst
      ? `O maior desvio foi em ${formatMonthShort(worst.month)}, ${formatCurrencyCompact(Math.abs(worst.variacao))} acima do orçado de ${formatCurrencyCompact(worst.orcado)}.`
      : `Todos os meses ficaram dentro do orçado de ${String(rows.length)} meses.`,
  ].join(' ');

  const renderVarianceLabel = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    if (index === undefined) return null;
    const row = rows[index];
    if (!row) return null;
    const bad = isBad(row.variacao, polarity);
    const fill = row.variacao === 0 ? 'var(--text-secondary)' : bad ? 'var(--negative)' : 'var(--positive)';
    const isPositive = row.variacao >= 0;
    /** O primeiro rótulo nasce na borda esquerda da coluna: centrado, o texto invadiria os tiques do eixo (84 px de eixo, mas o rótulo mede mais que a coluna). */
    const stagger = index % 2 === 1 ? STAGGER_EXTRA : 0;
    const labelY = isPositive ? Number(y) - VALUE_LABEL_GAP - stagger : Number(y) + Number(barHeight) + VALUE_LABEL_GAP + stagger;
    return (
      <text
        className="font-display"
        dominantBaseline={isPositive ? 'auto' : 'hanging'}
        fill={fill}
        fontSize={11}
        fontWeight={500}
        style={HALO}
        textAnchor={index === 0 ? 'start' : 'middle'}
        x={index === 0 ? Number(x) : Number(x) + Number(width) / 2}
        y={labelY}
      >
        {signed(row.variacao)}
      </text>
    );
  };

  const renderMainTooltip = (tooltipProps: { active?: boolean; label?: string | number }): ReactElement | null => {
    const month = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = month === undefined ? undefined : rows.find((candidate) => candidate.month === month);
    if (!tooltipProps.active || !row) return null;
    return (
      <ChartTooltip active={tooltipProps.active} label={month} labelFormat="month" payload={buildMainTooltipEntries(row)} valueFormat="currencyCompact" />
    );
  };

  const renderVarianceTooltip = (tooltipProps: { active?: boolean; label?: string | number }): ReactElement | null => {
    const month = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = month === undefined ? undefined : rows.find((candidate) => candidate.month === month);
    if (!tooltipProps.active || !row) return null;
    return (
      <ChartTooltip active={tooltipProps.active} label={month} labelFormat="month" payload={buildVarianceTooltipEntry(row, polarity)} />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {/* Sem `truncate`: a frase termina no maior desvio, e cortar pelo fim em cartão estreito
          apagava justamente o número que ela existe para dizer. Em cartão largo cabe numa linha e o
          desenho é o mesmo; em cartão estreito ela quebra e rouba altura do plano, que é o preço
          certo (convenção de 53 versões do acervo, entre elas `09_dispersao-e-bolhas/01_...`). */}
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex min-h-0 flex-[2] flex-col">
          <div className="mb-1 flex shrink-0 items-center justify-between gap-3">
            <p aria-hidden className="min-w-0 truncate text-xs font-medium text-text-secondary">
              Custo mensal (R$)
            </p>
            <ul aria-hidden className="flex shrink-0 items-center gap-4 text-xs text-text-secondary">
              <li className="flex items-center gap-2.5">
                <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: REALIZADO_FILL }} />
                Custo realizado
              </li>
              <li className="flex items-center gap-2.5">
                <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ border: `1.5px dashed ${ORCADO_STROKE}` }} />
                Orçado
              </li>
            </ul>
          </div>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer height="100%" width="100%">
              <ComposedChart accessibilityLayer={false} barCategoryGap={MAIN_BAR_CATEGORY_GAP} data={[...rows]} margin={MAIN_MARGIN} syncId={SYNC_ID}>
                <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
                <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" hide ticks={[...xTicks]} />
                <YAxis
                  {...AXIS_PROPS}
                  axisLine={false}
                  domain={[0, mainDomain.domainMax]}
                  tickFormatter={(value: number) => formatCurrencyAxis(value)}
                  ticks={[...mainDomain.ticks]}
                  interval={0}
                  width={Y_AXIS_WIDTH}
                />
                <Tooltip content={renderMainTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
                <Bar dataKey="orcado" isAnimationActive={animate} maxBarSize={MAIN_MAX_BAR_SIZE} shape={renderMainColumn(mainDomain.domainMax)} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex min-h-0 flex-[1] flex-col">
          <p aria-hidden className="mb-1 shrink-0 text-xs font-medium text-text-secondary">
            Variação contra o orçado (R$, escala própria)
          </p>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer height="100%" width="100%">
              <ComposedChart accessibilityLayer={false} barCategoryGap={VARIANCE_BAR_CATEGORY_GAP} data={[...rows]} margin={VARIANCE_MARGIN} syncId={SYNC_ID}>
                <XAxis
                  {...AXIS_PROPS}
                  axisLine={false}
                  dataKey="month"
                  tickFormatter={(value: string) => formatMonthShort(value)}
                  tickMargin={8}
                  ticks={[...xTicks]}
                />
                <YAxis
                  {...AXIS_PROPS}
                  axisLine={false}
                  domain={[-varianceDomain.domainMax, varianceDomain.domainMax]}
                  tickFormatter={(value: number) => formatCurrencyAxis(value)}
                  ticks={[...varianceDomain.ticks]}
                  interval={0}
                  width={Y_AXIS_WIDTH}
                />
                <Tooltip content={renderVarianceTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
                <ReferenceLine stroke="var(--line-strong)" strokeWidth={1} y={0} />
                <Bar dataKey="variacao" isAnimationActive={animate} maxBarSize={VARIANCE_MAX_BAR_SIZE} minPointSize={MIN_POINT_SIZE} name="Variação" radius={[2, 2, 2, 2]}>
                  {rows.map((row) => (
                    <Cell fill={row.variacao === 0 ? 'var(--line-strong)' : isBad(row.variacao, polarity) ? 'var(--negative)' : 'var(--positive)'} key={row.month} />
                  ))}
                  <LabelList content={renderVarianceLabel} dataKey="variacao" />
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
