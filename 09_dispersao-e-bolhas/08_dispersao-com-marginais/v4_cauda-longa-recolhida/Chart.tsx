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
  XAxis,
  YAxis,
  ZAxis,
  usePlotArea,
  type LabelProps,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WonOpportunityCycle } from './data';

/**
 * Dispersão com marginais e a cauda longa do ciclo recolhida no P99. Sem recolher, cinco
 * oportunidades de ciclo enorme esticam o domínio para quase mil dias e as outras 515 se amassam no
 * primeiro quinto do eixo: o plano fica correto e ilegível ao mesmo tempo. Recolher não é esconder,
 * então as cinco continuam desenhadas, com o valor escrito, numa faixa reservada fora do domínio.
 */
export interface LongTailClampedProps {
  readonly data?: readonly WonOpportunityCycle[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Largura de faixa das duas medidas, em dias e em reais. Elas são as ÚNICAS constantes de escala
 * deste arquivo: o domínio e os tiques saem do dado, porque a régua aqui é o P99 e não um teto
 * escrito à mão, e constante de teto envelheceria no primeiro recorte diferente.
 */
const CICLO_BIN_WIDTH = 25;
const TICKET_BIN_WIDTH = 50_000;
/** O tique cai de duas em duas faixas, então o domínio é arredondado ao dobro da largura da faixa:
 * assim toda linha de grade é divisa de faixa e o eixo termina na primeira acima do maior valor
 * considerado (EIX-4), sem tique fora do passo. */
const TICK_EVERY_BINS = 2;
/** O percentil que decide o recolhimento. */
const CLAMP_PERCENTILE = 0.99;

/** Margens do plano central; os dois marginais repetem o lado que precisa alinhar ao pixel. */
const MARGIN_LEFT = 8;
/**
 * A margem direita é RESERVA, não sobra: é nela que as oportunidades recolhidas vivem, fora do
 * domínio e por isso fora do plano, com o valor real escrito ao lado. O marginal do topo repete a
 * mesma reserva, senão a última faixa dele deixaria de terminar onde o plano termina (REC-16).
 */
const MARGIN_RIGHT = 72;
const MARGIN_TOP = 8;
const MARGIN_BOTTOM = 30;
/**
 * Acima da faixa de 48 a 64 da EIX-6, e por medição: com 52 o tique `R$ 400 mil` não coube e
 * quebrou em duas linhas no primeiro render, que é o sintoma da REC-2. A régua da 14.1 manda a
 * constante de acabamento ceder quando o desvio aparece no render, e aqui apareceu.
 */
const AXIS_WIDTH = 72;
const AXIS_HEIGHT = 28;

const BAR_CATEGORY_GAP = '30%';
const BAR_MAX_SIZE = 24;
const HIST_AXIS_HEADROOM = 1.5;

const POINT_RADIUS = 3;
const Z_RANGE: readonly [number, number] = [Math.PI * POINT_RADIUS * POINT_RADIUS, Math.PI * POINT_RADIUS * POINT_RADIUS];
const HIST_FILL = 'var(--line-strong)';
/** A cor da cauda, a mesma na última faixa do marginal e no marcador da borda, para o leitor ligar
 * as duas sem legenda de cor: `--chart-5` mede 5,90:1 no escuro e 6,25:1 no claro. */
const TAIL_FILL = 'var(--chart-5)';
const HIST_LABEL_FILL = 'var(--text-muted)';
const LABEL_SIZE = 11;
const LABEL_GAP = 4;
/** Geometria do marcador da borda: meia altura, largura e o respiro até o valor escrito. */
const CLAMP_MARK_HALF = 5;
const CLAMP_MARK_WIDTH = 9;
const CLAMP_MARK_OFFSET = 6;
const CLAMP_LABEL_GAP = 6;

interface Bin {
  readonly center: number;
  readonly low: number;
  readonly high: number;
  readonly count: number;
  readonly cauda: boolean;
}

interface Point {
  readonly ciclo: number;
  readonly ticket: number;
}

/** A fração de 0 a 1 que um valor ocupa no domínio: a única conta de posição do arquivo, chamada
 * pelo plano e pela faixa reservada, para as duas não divergirem por descuido de edição. */
function fractionOf(value: number, domain: readonly [number, number]): number {
  const [low, high] = domain;
  if (high === low) return 0;
  return (value - low) / (high - low);
}

/**
 * Percentil por interpolação linear entre as duas posições vizinhas. Devolve `null` para lista
 * vazia, nunca `0`: percentil de nada não é ciclo zero, é ausência de leitura, e um `0` aqui faria
 * o domínio nascer colapsado e o desenho inteiro mentir (EST-1b).
 */
function percentile(values: readonly number[], fraction: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = fraction * (sorted.length - 1);
  const lowIndex = Math.floor(position);
  const low = sorted[lowIndex];
  if (low === undefined) return null;
  const high = sorted[lowIndex + 1];
  if (high === undefined) return low;
  return low + (high - low) * (position - lowIndex);
}

/** O maior valor da lista. Devolve `null` para lista vazia, nunca `0` nem infinito (EST-1b). */
function maxOf(values: readonly number[]): number | null {
  let top: number | null = null;
  for (const value of values) {
    if (top === null || value > top) top = value;
  }
  return top;
}

/** O teto do domínio: o menor múltiplo de duas faixas que cobre o valor de corte. */
function domainTopFor(value: number, binWidth: number): number {
  const step = binWidth * TICK_EVERY_BINS;
  return Math.max(step, Math.ceil(value / step) * step);
}

/** Os tiques, de duas em duas faixas, de zero ao teto do domínio. */
function ticksFor(domainTop: number, binWidth: number): number[] {
  const step = binWidth * TICK_EVERY_BINS;
  const ticks: number[] = [];
  for (let value = 0; value <= domainTop + step / 2; value += step) ticks.push(value);
  return ticks;
}

/**
 * Faixas de largura igual que azulejam o domínio inteiro, o que é o que faz o marginal falar a mesma
 * escala do plano: o `BarChart` distribui as faixas em passo uniforme de pixel (escala band) e o
 * plano distribui os valores em passo uniforme de domínio (escala linear), e as duas coincidem
 * exatamente sob essa condição. A ÚLTIMA faixa é aberta à direita quando `clamp` é verdadeiro: ela
 * conta tudo acima da própria divisa de entrada, inclusive o que passou do domínio.
 */
function makeBins(
  values: readonly number[],
  domainTop: number,
  binWidth: number,
  clamp: boolean,
): Bin[] {
  const binCount = Math.round(domainTop / binWidth);
  const counts = new Array<number>(binCount).fill(0);
  for (const value of values) {
    const index = Math.min(binCount - 1, Math.max(0, Math.floor(value / binWidth)));
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts.map((count, index) => {
    const low = binWidth * index;
    const ultima = index === binCount - 1;
    return {
      low,
      high: low + binWidth,
      center: low + binWidth / 2,
      count,
      cauda: clamp && ultima,
    };
  });
}

/**
 * As oportunidades recolhidas, na faixa reservada à direita do plano.
 *
 * Elas não entram no `Scatter`: ponto fora do domínio seria desenhado fora da área ou recortado, e
 * nos dois casos o desenho passaria a mentir sobre onde ele acaba. Aqui a marca é outra forma, na
 * cor da cauda, com o ciclo real escrito ao lado, porque recolher é comprimir a posição, não apagar
 * o número. O halo é o da ROT-7, porque o valor escrito encosta na borda do plano.
 */
function ClampedEdgeLayer({
  recolhidas,
  ticketDomain,
}: {
  readonly recolhidas: readonly Point[];
  readonly ticketDomain: readonly [number, number];
}) {
  const plotArea = usePlotArea();
  if (!plotArea || recolhidas.length === 0) return null;
  const baseX = plotArea.x + plotArea.width + CLAMP_MARK_OFFSET;

  return (
    <g>
      {recolhidas.map((ponto) => {
        const y = plotArea.y + plotArea.height * (1 - fractionOf(ponto.ticket, ticketDomain));
        return (
          <g key={`${String(ponto.ciclo)}:${String(ponto.ticket)}`}>
            <path
              d={`M${String(baseX)},${String(y - CLAMP_MARK_HALF)} L${String(baseX + CLAMP_MARK_WIDTH)},${String(y)} L${String(baseX)},${String(y + CLAMP_MARK_HALF)} Z`}
              fill={TAIL_FILL}
            />
            <text
              className="font-display"
              dominantBaseline="central"
              fill={TAIL_FILL}
              fontSize={LABEL_SIZE}
              style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
              textAnchor="start"
              x={baseX + CLAMP_MARK_WIDTH + CLAMP_LABEL_GAP}
              y={y}
            >
              {formatDays(ponto.ciclo)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** A contagem escrita acima da faixa, que é o que dá a `--line-strong` a isenção da ACE-3. */
function TopCountLabel({ x, y, width, value }: LabelProps): ReactElement | null {
  if (typeof value !== 'number') return null;
  return (
    <text
      className="font-display"
      fill={HIST_LABEL_FILL}
      fontSize={LABEL_SIZE}
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
      textAnchor="start"
      x={Number(x) + Number(width) + LABEL_GAP}
      y={Number(y) + Number(height) / 2}
    >
      {formatInt(value)}
    </text>
  );
}

export default function LongTailClamped({ data = defaultData, height, className }: LongTailClampedProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const todas: Point[] = data.map(([ciclo, ticket]) => ({ ciclo, ticket }));
  const corte = percentile(todas.map((ponto) => ponto.ciclo), CLAMP_PERCENTILE);
  const ticketMaximo = maxOf(todas.map((ponto) => ponto.ticket));

  if (corte === null || ticketMaximo === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade ganha neste recorte: sem ciclo medido não existe percentil para recolher.</span>
      </div>
    );
  }

  const cicloTop = domainTopFor(corte, CICLO_BIN_WIDTH);
  const ticketTop = domainTopFor(ticketMaximo, TICKET_BIN_WIDTH);
  const cicloDomain: readonly [number, number] = [0, cicloTop];
  const ticketDomain: readonly [number, number] = [0, ticketTop];

  const noPlano = todas.filter((ponto) => ponto.ciclo <= cicloTop);
  const recolhidas = todas
    .filter((ponto) => ponto.ciclo > cicloTop)
    .slice()
    .sort((a, b) => a.ticket - b.ticket);

  const cicloBins = makeBins(todas.map((ponto) => ponto.ciclo), cicloTop, CICLO_BIN_WIDTH, true);
  const ticketBins = makeBins(todas.map((ponto) => ponto.ticket), ticketTop, TICKET_BIN_WIDTH, false);
  const maxCicloCount = Math.max(1, ...cicloBins.map((bin) => bin.count));
  const maxTicketCount = Math.max(1, ...ticketBins.map((bin) => bin.count));
  /** A divisa de entrada da última faixa, derivada do domínio, e a contagem dela medida do dado:
   * assim nem a divisa nem o número dependem de acesso por índice com queda para zero. */
  const ultimaDivisa = cicloTop - CICLO_BIN_WIDTH;
  const contagemDaCauda = todas.filter((ponto) => ponto.ciclo >= ultimaDivisa).length;

  const corteTexto = formatDays(cicloTop);
  const p99Texto = formatDays(Math.round(corte));

  const summary =
    `Dispersão com histogramas marginais: ${formatInt(todas.length)} oportunidades ganhas por ciclo e ticket. ` +
    `O P99 do ciclo é ${p99Texto}, então ${formatInt(recolhidas.length)} oportunidades acima de ${corteTexto} vão recolhidas na borda e a última faixa conta ${formatInt(contagemDaCauda)}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul
        aria-hidden
        className="mb-2 flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 text-xs tabular-nums text-text-secondary"
      >
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height={10} viewBox="0 0 10 10" width={10}>
            <circle cx={5} cy={5} fill="var(--chart-1)" r={3} />
          </svg>
          <span>{`No plano, até ${corteTexto}`}</span>
          <span className="text-text-muted">{`${formatInt(noPlano.length)} oportunidades`}</span>
        </li>
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height={10} viewBox="0 0 10 10" width={10}>
            <polygon fill={TAIL_FILL} points="1,0.5 9,5 1,9.5" />
          </svg>
          <span>Recolhidas na borda</span>
          <span className="text-text-muted">{`${formatInt(recolhidas.length)} oportunidades`}</span>
        </li>
      </ul>
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_84px] grid-rows-[68px_1fr] gap-1">
        <div className="min-w-0">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              accessibilityLayer={false}
              barCategoryGap={BAR_CATEGORY_GAP}
              data={cicloBins}
              margin={{ top: MARGIN_TOP, right: MARGIN_RIGHT, bottom: 2, left: MARGIN_LEFT + AXIS_WIDTH }}
            >
              <XAxis dataKey="center" domain={[...cicloDomain]} hide type="number" />
              <YAxis allowDecimals={false} domain={[0, maxCicloCount * HIST_AXIS_HEADROOM]} hide />
              <Bar dataKey="count" isAnimationActive={animate} maxBarSize={BAR_MAX_SIZE} radius={[2, 2, 0, 0]}>
                <LabelList content={TopCountLabel} dataKey="count" />
                {cicloBins.map((bin) => (
                  <Cell fill={bin.cauda ? TAIL_FILL : HIST_FILL} key={bin.center} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div aria-hidden className="flex items-end justify-center pb-2 text-center">
          <div>
            <p className="kpi-number text-sm font-semibold text-text-primary">{formatInt(todas.length)}</p>
            <p className="text-[11px] text-text-muted">oportunidades</p>
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
                dataKey="ciclo"
                domain={[...cicloDomain]}
                height={AXIS_HEIGHT}
                name="Ciclo"
                tickFormatter={(value: number) => formatDays(value)}
                tickMargin={8}
                ticks={ticksFor(cicloTop, CICLO_BIN_WIDTH)}
                type="number"
              />
              <YAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="ticket"
                domain={[...ticketDomain]}
                name="Ticket"
                tickFormatter={formatCurrencyAxis}
                tickMargin={8}
                ticks={ticksFor(ticketTop, TICKET_BIN_WIDTH)}
                type="number"
                width={AXIS_WIDTH}
              />
              <ZAxis range={[...Z_RANGE]} type="number" />
              <Scatter data={noPlano} fill="var(--chart-1)" isAnimationActive={animate} shape="circle" />
              <ClampedEdgeLayer recolhidas={recolhidas} ticketDomain={ticketDomain} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              accessibilityLayer={false}
              barCategoryGap={BAR_CATEGORY_GAP}
              data={ticketBins}
              layout="vertical"
              margin={{ top: MARGIN_TOP, right: 4, bottom: MARGIN_BOTTOM + AXIS_HEIGHT, left: 2 }}
            >
              <XAxis allowDecimals={false} domain={[0, maxTicketCount * HIST_AXIS_HEADROOM]} hide type="number" />
              <YAxis dataKey="center" domain={[...ticketDomain]} hide reversed type="number" />
              <Bar dataKey="count" fill={HIST_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX_SIZE} radius={[0, 2, 2, 0]}>
                <LabelList content={RightCountLabel} dataKey="count" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`Faixas de ${formatDays(CICLO_BIN_WIDTH)} no ciclo e de ${formatCurrencyAxis(TICKET_BIN_WIDTH)} no ticket; a última faixa do ciclo é aberta e conta ${formatDays(ultimaDivisa)} ou mais, porque o P99 é ${p99Texto} e o domínio para em ${corteTexto}`}
      </p>
    </div>
  );
}
