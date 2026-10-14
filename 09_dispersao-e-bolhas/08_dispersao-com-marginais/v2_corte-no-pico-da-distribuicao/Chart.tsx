import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  usePlotArea,
  type LabelProps,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { corteCpl as defaultCorteCpl, corteTaxa as defaultCorteTaxa, data as defaultData, type CampaignCost } from './data';

/**
 * Quadrante de CPL contra qualificação com as duas distribuições nas bordas. A pergunta desta
 * versão não é onde cada campanha está, é onde a divisória caiu: um corte que atravessa a faixa
 * mais cheia separa campanhas quase idênticas, e a nuvem sozinha não conta isso.
 */
export interface CutOnDistributionPeakProps {
  readonly data?: readonly CampaignCost[];
  /** O corte de CPL do quadrante, em reais por lead. */
  readonly corteCpl?: number;
  /** O corte de qualificação do quadrante, em fração. */
  readonly corteTaxa?: number;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Domínio do CPL (eixo horizontal) e domínio da qualificação (eixo vertical), compartilhados pelo
 * plano e pelo marginal do mesmo lado. Os tiques caem de duas em duas faixas, então toda linha de
 * grade é também uma divisa de faixa, e o eixo termina acima do maior valor do dado (EIX-4).
 */
const CPL_DOMAIN: readonly [number, number] = [0, 200];
const CPL_TICKS = [0, 50, 100, 150, 200] as const;
const CPL_BIN_COUNT = 8;
const TAXA_DOMAIN: readonly [number, number] = [0, 0.4];
const TAXA_TICKS = [0, 0.1, 0.2, 0.3, 0.4] as const;
const TAXA_BIN_COUNT = 8;

/** Margens do plano central; os dois marginais repetem o lado que precisa alinhar ao pixel. */
const MARGIN_LEFT = 8;
const MARGIN_RIGHT = 12;
const MARGIN_TOP = 8;
const MARGIN_BOTTOM = 30;
/**
 * O Recharts soma a largura da `YAxis` e a altura da `XAxis` à margem **só no plano**, porque só
 * ele imprime eixo. Os marginais têm de somar a mesma reserva no lado que precisa alinhar, senão
 * nascem deslocados pela largura do eixo inteiro (REC-16 e EIX-12).
 */
const AXIS_WIDTH = 48;
const AXIS_HEIGHT = 28;

/** Vão de faixa no piso da ESP-2, o mesmo da v1, para as duas versões terem a mesma silhueta. */
const BAR_CATEGORY_GAP = '30%';
const BAR_MAX_SIZE = 24;
/** Sobra acima do maior bin: a faixa mais cheia não encosta no limite do corpo e o número cabe. */
const HIST_AXIS_HEADROOM = 1.5;

const POINT_RADIUS = 4;
const Z_RANGE: readonly [number, number] = [Math.PI * POINT_RADIUS * POINT_RADIUS, Math.PI * POINT_RADIUS * POINT_RADIUS];
const HIST_FILL = 'var(--line-strong)';
const HIST_FILL_DESTAQUE = 'var(--chart-1)';
const HIST_LABEL_FILL = 'var(--text-muted)';
const LABEL_SIZE = 11;
const LABEL_GAP = 4;

interface Bin {
  readonly center: number;
  readonly count: number;
  readonly destaque: boolean;
}

interface Point {
  readonly id: string;
  readonly rotulo: string;
  readonly cpl: number;
  readonly leads: number;
  readonly qualificados: number;
  readonly taxa: number;
}

/**
 * A fração de 0 a 1 que um valor ocupa no domínio, e a **única** conta de posição do arquivo.
 *
 * Ela existe para que plano e marginal não tenham duas contas diferentes de onde um valor cai: a
 * divisória do plano e a divisória da faixa chamam esta mesma função com o mesmo domínio, então
 * elas não podem divergir por descuido de edição.
 */
function fractionOf(value: number, domain: readonly [number, number]): number {
  const [low, high] = domain;
  if (high === low) return 0;
  return (value - low) / (high - low);
}

/**
 * Faixas que **azulejam o domínio inteiro**, e é isso que faz a margem e o plano falarem da mesma
 * escala. O `BarChart` distribui as faixas em passo uniforme sobre a área de plotagem (escala
 * band), e o plano distribui os valores em passo uniforme sobre o mesmo domínio (escala linear):
 * as duas coincidem exatamente quando as faixas têm largura igual e cobrem o domínio sem sobra.
 * Medido na v1: faixa de R$ 100 mil no centro R$ 50 mil cai em 149,17 px nos dois gráficos.
 */
function makeBins(
  values: readonly number[],
  domain: readonly [number, number],
  binCount: number,
  corte: number,
): Bin[] {
  const [low, high] = domain;
  const width = (high - low) / binCount;
  const counts = new Array<number>(binCount).fill(0);
  for (const value of values) {
    const index = Math.min(binCount - 1, Math.max(0, Math.floor((value - low) / width)));
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts.map((count, index) => {
    const binLow = low + width * index;
    return {
      center: binLow + width / 2,
      count,
      destaque: corte >= binLow && corte < binLow + width,
    };
  });
}

/** A faixa mais cheia. Devolve `null` para lista vazia, nunca a primeira faixa (EST-1b). */
function fullestBin(bins: readonly Bin[]): Bin | null {
  let top: Bin | null = null;
  for (const bin of bins) {
    if (top === null || bin.count > top.count) top = bin;
  }
  return top;
}

/**
 * A divisória vertical, desenhada por cima das marcas.
 *
 * Ela não é `ReferenceLine`: os marginais são gráficos independentes, com eixo de categoria em
 * escala band, e ali o `x` de uma `ReferenceLine` não encontra categoria nenhuma e a linha não
 * desenha (REC-24). Com a área de plotagem e a fração do domínio, os três gráficos põem a
 * divisória no mesmo pixel por construção.
 */
function DividerX({ value, domain }: { readonly value: number; readonly domain: readonly [number, number] }) {
  const plotArea = usePlotArea();
  if (!plotArea) return null;
  const x = plotArea.x + plotArea.width * fractionOf(value, domain);
  return (
    <line
      stroke="var(--text-muted)"
      strokeDasharray="4 4"
      x1={x}
      x2={x}
      y1={plotArea.y}
      y2={plotArea.y + plotArea.height}
    />
  );
}

/** A divisória horizontal, pela mesma conta e invertida porque o eixo de valor cresce para cima. */
function DividerY({ value, domain }: { readonly value: number; readonly domain: readonly [number, number] }) {
  const plotArea = usePlotArea();
  if (!plotArea) return null;
  const y = plotArea.y + plotArea.height * (1 - fractionOf(value, domain));
  return (
    <line
      stroke="var(--text-muted)"
      strokeDasharray="4 4"
      x1={plotArea.x}
      x2={plotArea.x + plotArea.width}
      y1={y}
      y2={y}
    />
  );
}

/**
 * A contagem escrita ao lado da faixa. Sem ela `--line-strong` não teria a isenção de contraste da
 * ACE-3, porque mede 1,79:1 no escuro e 1,83:1 no claro contra o cartão.
 *
 * O halo é obrigatório aqui, e não decorativo: a divisória sobe até o topo da faixa e, na faixa que
 * contém o corte, ela passa exatamente por dentro do número. Medido no primeiro render, com a
 * divisória cortando o `14` ao meio (ROT-7).
 */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

function TopCountLabel({ x, y, width, value }: LabelProps): ReactElement | null {
  if (typeof value !== 'number') return null;
  return (
    <text
      className="font-display"
      fill={HIST_LABEL_FILL}
      fontSize={LABEL_SIZE}
      style={HALO}
      textAnchor="middle"
      x={Number(x) + Number(width) / 2}
      y={Number(y) - LABEL_GAP}
    >
      {formatInt(value)}
    </text>
  );
}

/** A mesma contagem, à direita da faixa deitada. */
function RightCountLabel({ x, y, width, height, value }: LabelProps): ReactElement | null {
  if (typeof value !== 'number') return null;
  return (
    <text
      className="font-display"
      dominantBaseline="central"
      fill={HIST_LABEL_FILL}
      fontSize={LABEL_SIZE}
      style={HALO}
      textAnchor="start"
      x={Number(x) + Number(width) + LABEL_GAP}
      y={Number(y) + Number(height) / 2}
    >
      {formatInt(value)}
    </text>
  );
}

export default function CutOnDistributionPeak({
  data = defaultData,
  corteCpl = defaultCorteCpl,
  corteTaxa = defaultCorteTaxa,
  height,
  className,
}: CutOnDistributionPeakProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const points: Point[] = [];
  for (const row of data) {
    if (row.leads <= 0) continue;
    points.push({ ...row, taxa: row.qualificados / row.leads });
  }

  if (points.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha com lead entregue neste recorte: sem volume não existe custo por lead.</span>
      </div>
    );
  }

  const cplBins = makeBins(points.map((point) => point.cpl), CPL_DOMAIN, CPL_BIN_COUNT, corteCpl);
  const taxaBins = makeBins(points.map((point) => point.taxa), TAXA_DOMAIN, TAXA_BIN_COUNT, corteTaxa);
  const maxCplCount = Math.max(1, ...cplBins.map((bin) => bin.count));
  const maxTaxaCount = Math.max(1, ...taxaBins.map((bin) => bin.count));
  const cplBinWidth = (CPL_DOMAIN[1] - CPL_DOMAIN[0]) / CPL_BIN_COUNT;
  const taxaBinWidth = (TAXA_DOMAIN[1] - TAXA_DOMAIN[0]) / TAXA_BIN_COUNT;

  const cplDestaque = cplBins.find((bin) => bin.destaque) ?? null;
  const cplMaisCheia = fullestBin(cplBins);
  const taxaDestaque = taxaBins.find((bin) => bin.destaque) ?? null;
  const taxaMaisCheia = fullestBin(taxaBins);
  const perto = points.filter((point) => Math.abs(point.cpl - corteCpl) <= corteCpl / 10).length;
  const noPico = cplDestaque !== null && cplMaisCheia !== null && cplDestaque.center === cplMaisCheia.center;

  const corteCplTexto = formatCurrencyAxis(corteCpl);
  const corteTaxaTexto = formatPercent(corteTaxa, 0);
  const contagemDestaque = formatInt(cplDestaque?.count ?? 0);
  const faixaDestaque =
    cplDestaque === null
      ? ''
      : `${formatCurrencyAxis(cplDestaque.center - cplBinWidth / 2)} a ${formatCurrencyAxis(cplDestaque.center + cplBinWidth / 2)}`;

  const summary =
    `Dispersão com histogramas marginais: ${formatInt(points.length)} campanhas por custo por lead e qualificação. ` +
    `O corte de ${corteCplTexto} cai ${noPico ? 'na faixa mais cheia' : 'num vale'} do custo, com ${contagemDestaque} campanhas de ${faixaDestaque}, ` +
    `e o corte de ${corteTaxaTexto} cai ${taxaDestaque !== null && taxaMaisCheia !== null && taxaDestaque.center === taxaMaisCheia.center ? 'no pico' : 'num vale'} da qualificação.`;

  const leitura =
    cplDestaque === null
      ? ''
      : `O corte de ${corteCplTexto} ${noPico ? 'atravessa a faixa mais cheia' : 'cai num vale'} do custo: ${contagemDestaque} das ${formatInt(points.length)} campanhas caem nela`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'cpl', name: 'Custo por lead', value: formatCurrency(point.cpl) },
      { dataKey: 'taxa', name: 'Qualificação', value: formatRateWithVolume(point.qualificados, point.leads) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.rotulo} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {leitura}
      </p>
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_84px] grid-rows-[68px_1fr] gap-1">
        <div className="min-w-0">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              accessibilityLayer={false}
              barCategoryGap={BAR_CATEGORY_GAP}
              data={cplBins}
              margin={{ top: MARGIN_TOP, right: MARGIN_RIGHT, bottom: 2, left: MARGIN_LEFT + AXIS_WIDTH }}
            >
              <XAxis dataKey="center" domain={[...CPL_DOMAIN]} hide type="number" />
              <YAxis allowDecimals={false} domain={[0, maxCplCount * HIST_AXIS_HEADROOM]} hide />
              <Bar dataKey="count" isAnimationActive={animate} maxBarSize={BAR_MAX_SIZE} radius={[2, 2, 0, 0]}>
                <LabelList content={TopCountLabel} dataKey="count" />
                {cplBins.map((bin) => (
                  <Cell fill={bin.destaque ? HIST_FILL_DESTAQUE : HIST_FILL} key={bin.center} />
                ))}
              </Bar>
              <DividerX domain={CPL_DOMAIN} value={corteCpl} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div aria-hidden className="flex items-end justify-center pb-2 text-center">
          <div>
            <p className="kpi-number text-sm font-semibold text-text-primary">{formatInt(points.length)}</p>
            <p className="text-[11px] text-text-muted">campanhas</p>
          </div>
        </div>
        <div className="min-w-0">
          <ResponsiveContainer height="100%" width="100%">
            <ScatterChart
              accessibilityLayer={false}
              margin={{ top: MARGIN_TOP, right: MARGIN_RIGHT, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT }}
            >
              <CartesianGrid stroke={GRID_COLOR} />
              <XAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="cpl"
                domain={[...CPL_DOMAIN]}
                height={AXIS_HEIGHT}
                name="Custo por lead"
                tickFormatter={formatCurrencyAxis}
                tickMargin={8}
                ticks={[...CPL_TICKS]}
                type="number"
              />
              <YAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="taxa"
                domain={[...TAXA_DOMAIN]}
                name="Qualificação"
                tickFormatter={(value: number) => formatPercent(value, 0)}
                tickMargin={8}
                ticks={[...TAXA_TICKS]}
                type="number"
                width={AXIS_WIDTH}
              />
              <ZAxis range={[...Z_RANGE]} type="number" />
              <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
              <Scatter data={points} fill="var(--chart-1)" isAnimationActive={animate} shape="circle" />
              <DividerX domain={CPL_DOMAIN} value={corteCpl} />
              <DividerY domain={TAXA_DOMAIN} value={corteTaxa} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              accessibilityLayer={false}
              barCategoryGap={BAR_CATEGORY_GAP}
              data={taxaBins}
              layout="vertical"
              margin={{ top: MARGIN_TOP, right: 4, bottom: MARGIN_BOTTOM + AXIS_HEIGHT, left: 2 }}
            >
              <XAxis allowDecimals={false} domain={[0, maxTaxaCount * HIST_AXIS_HEADROOM]} hide type="number" />
              <YAxis dataKey="center" domain={[...TAXA_DOMAIN]} hide reversed type="number" />
              <Bar dataKey="count" isAnimationActive={animate} maxBarSize={BAR_MAX_SIZE} radius={[0, 2, 2, 0]}>
                <LabelList content={RightCountLabel} dataKey="count" />
                {taxaBins.map((bin) => (
                  <Cell fill={bin.destaque ? HIST_FILL_DESTAQUE : HIST_FILL} key={bin.center} />
                ))}
              </Bar>
              <DividerY domain={TAXA_DOMAIN} value={corteTaxa} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`${formatInt(CPL_BIN_COUNT)} faixas de ${formatCurrencyAxis(cplBinWidth)} no custo e ${formatInt(TAXA_BIN_COUNT)} de ${formatInt(taxaBinWidth * 100)} pontos na qualificação; a faixa acesa contém o corte, ${corteCplTexto} e ${corteTaxaTexto}; ${formatInt(perto)} campanhas ficam a menos de um décimo do corte de custo`}
      </p>
    </div>
  );
}
