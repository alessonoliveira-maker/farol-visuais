import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  type LabelProps,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatDecimal, formatHours, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadContactTime } from './data';

/**
 * Dispersão com marginais e o eixo do tempo em escala logarítmica. Com 2.000 leads a nuvem satura e
 * deixa de informar: o que se vê é uma mancha, e a moda da massa desaparece dentro dela. O marginal
 * é quem devolve a forma, e ele só vale se contar a mesma distribuição que a mancha ao lado.
 */
export interface LogTimeWithMarginalsProps {
  readonly data?: readonly LeadContactTime[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Domínio do tempo, em minutos, de 1 minuto a 7 dias. Positivo nas duas pontas porque escala
 * logarítmica não tem posição para o zero. Os tiques são unidades humanas escolhidas à mão, e não o
 * passo que o eixo escolheria sozinho na unidade crua (REC-21).
 */
const TEMPO_DOMAIN: readonly [number, number] = [1, 10_080];
const TEMPO_TICKS = [1, 10, 60, 1440, 10_080] as const;
/**
 * Faixas de RAZÃO constante, e não de largura constante: é isso que faz o marginal falar a mesma
 * escala do plano. Em escala logarítmica o passo uniforme de pixel é passo uniforme de razão, então
 * 14 faixas de razão igual azulejam o domínio sem sobra e o passo band do `BarChart` cai exatamente
 * sobre o centro geométrico de cada faixa no plano. Faixa de largura fixa em minutos alinharia no
 * começo do eixo e erraria por centenas de pixels no fim.
 */
const TEMPO_BIN_COUNT = 14;
/**
 * Domínio das tentativas deslocado em meia unidade nas duas pontas, de propósito: as faixas do
 * marginal têm largura de uma tentativa e ficam CENTRADAS no inteiro, então o domínio tem de
 * começar em 0,5 para o centro da primeira faixa cair em 1. Com domínio de 1 a 10 o centro da faixa
 * cairia em 1,5 e o ponto de uma tentativa nasceria meia faixa fora do lugar.
 */
const TENTATIVA_DOMAIN: readonly [number, number] = [0.5, 10.5];
const TENTATIVA_TICKS = [2, 4, 6, 8, 10] as const;
const TENTATIVA_BIN_COUNT = 10;

/** Margens do plano central; os dois marginais repetem o lado que precisa alinhar ao pixel. */
const MARGIN_LEFT = 8;
const MARGIN_RIGHT = 12;
const MARGIN_TOP = 8;
const MARGIN_BOTTOM = 30;
/** A reserva que o Recharts soma à margem só no plano, porque só ele imprime eixo (REC-16). */
const AXIS_WIDTH = 48;
const AXIS_HEIGHT = 28;

const BAR_CATEGORY_GAP = '30%';
const BAR_MAX_SIZE = 24;
const HIST_AXIS_HEADROOM = 1.5;

/**
 * Raio de 1,5 px para 2.000 marcas, fixado nas duas pontas do `ZAxis` porque o tamanho aqui não
 * codifica nada; sem as duas pontas iguais o raio varia sozinho (REC-15).
 */
const POINT_RADIUS = 1.5;
const Z_RANGE: readonly [number, number] = [Math.PI * POINT_RADIUS * POINT_RADIUS, Math.PI * POINT_RADIUS * POINT_RADIUS];
/**
 * Opacidade de 0,70, e não os 0,25 que a especificação da versão pedia. Medido contra o cartão:
 * `--chart-1` opaco dá 9,50:1 no escuro e 6,00:1 no claro; a 0,70 cai para 5,30:1 e 3,25:1, ainda
 * acima do piso de 3:1 da ACE-5; a 0,25 desaba para 1,77:1 e 1,46:1, e a marca deixa de existir no
 * tema claro. Quem revela a densidade aqui é o marginal, que é o assunto do modelo, não a tinta.
 */
const POINT_FILL_OPACITY = 0.7;
const HIST_FILL = 'var(--line-strong)';
const HIST_LABEL_FILL = 'var(--text-muted)';
const LABEL_SIZE = 11;
const LABEL_GAP = 4;

interface Bin {
  readonly center: number;
  readonly low: number;
  readonly high: number;
  readonly count: number;
}

interface Point {
  readonly minutos: number;
  readonly tentativas: number;
  /** Valor constante só para o ZAxis ter dataKey; sem ele o range não chega ao Scatter. */
  readonly z: number;
}

/** A razão entre duas divisas vizinhas das faixas de tempo, calculada do domínio e da contagem. */
function tempoRatio(domain: readonly [number, number], binCount: number): number {
  return (domain[1] / domain[0]) ** (1 / binCount);
}

/**
 * Faixas de razão constante sobre o domínio logarítmico. A divisa `i` é `d0 × razão^i` e o centro é
 * `d0 × razão^(i+0,5)`, que é a média GEOMÉTRICA da faixa, o único ponto que cai no meio dela em
 * pixel. Média aritmética cairia à direita do meio e o marginal desalinharia do plano.
 */
function makeLogBins(values: readonly number[], domain: readonly [number, number], binCount: number): Bin[] {
  const ratio = tempoRatio(domain, binCount);
  const counts = new Array<number>(binCount).fill(0);
  const logRatio = Math.log(ratio);
  for (const value of values) {
    const index = Math.min(binCount - 1, Math.max(0, Math.floor(Math.log(value / domain[0]) / logRatio)));
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts.map((count, index) => ({
    low: domain[0] * ratio ** index,
    high: domain[0] * ratio ** (index + 1),
    center: domain[0] * ratio ** (index + 0.5),
    count,
  }));
}

/** Faixas de largura constante, centradas no inteiro, para a contagem de tentativas. */
function makeLinearBins(values: readonly number[], domain: readonly [number, number], binCount: number): Bin[] {
  const width = (domain[1] - domain[0]) / binCount;
  const counts = new Array<number>(binCount).fill(0);
  for (const value of values) {
    const index = Math.min(binCount - 1, Math.max(0, Math.floor((value - domain[0]) / width)));
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts.map((count, index) => {
    const low = domain[0] + width * index;
    return { low, high: low + width, center: low + width / 2, count };
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

/** Tique em unidade humana: minuto até 1 h, hora até 1 dia, dia acima disso. */
function formatMinutes(minutos: number): string {
  if (minutos < 60) return `${formatInt(minutos)} min`;
  if (minutos < 1440) return formatHours(minutos / 60);
  return formatDays(minutos / 1440);
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

export default function LogTimeWithMarginals({ data = defaultData, height, className }: LogTimeWithMarginalsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const points: Point[] = [];
  for (const [minutos, tentativas] of data) {
    if (minutos <= 0) continue;
    points.push({ minutos, tentativas, z: 1 });
  }

  if (points.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead com horário de primeiro contato neste recorte: sem tempo medido não há posição no eixo.</span>
      </div>
    );
  }

  const tempoBins = makeLogBins(points.map((point) => point.minutos), TEMPO_DOMAIN, TEMPO_BIN_COUNT);
  const tentativaBins = makeLinearBins(points.map((point) => point.tentativas), TENTATIVA_DOMAIN, TENTATIVA_BIN_COUNT);
  const maxTempoCount = Math.max(1, ...tempoBins.map((bin) => bin.count));
  const maxTentativaCount = Math.max(1, ...tentativaBins.map((bin) => bin.count));
  const tempoTopo = fullestBin(tempoBins);
  const tentativaTopo = fullestBin(tentativaBins);

  const faixaTopo = tempoTopo === null ? '' : `${formatMinutes(tempoTopo.low)} a ${formatMinutes(tempoTopo.high)}`;
  const modaTentativas = tentativaTopo === null ? '' : formatInt(Math.round(tentativaTopo.center));
  const razaoTexto = formatDecimal(tempoRatio(TEMPO_DOMAIN, TEMPO_BIN_COUNT), 1);

  const summary =
    `Dispersão com marginais e tempo em escala logarítmica: ${formatInt(points.length)} leads por minutos até o primeiro contato e tentativas até a agenda. ` +
    `A faixa mais cheia é ${faixaTopo}, com ${formatInt(tempoTopo?.count ?? 0)} leads, e a moda das tentativas é ${modaTentativas}.`;

  const leitura =
    tempoTopo === null
      ? ''
      : `A massa se concentra na faixa de ${faixaTopo}: ${formatInt(tempoTopo.count)} dos ${formatInt(points.length)} leads`;

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
              data={tempoBins}
              margin={{ top: MARGIN_TOP, right: MARGIN_RIGHT, bottom: 2, left: MARGIN_LEFT + AXIS_WIDTH }}
            >
              <XAxis dataKey="center" domain={[...TEMPO_DOMAIN]} hide scale="log" type="number" />
              <YAxis allowDecimals={false} domain={[0, maxTempoCount * HIST_AXIS_HEADROOM]} hide />
              <Bar dataKey="count" fill={HIST_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX_SIZE} radius={[2, 2, 0, 0]}>
                <LabelList content={TopCountLabel} dataKey="count" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div aria-hidden className="flex items-end justify-center pb-2 text-center">
          <div>
            <p className="kpi-number text-sm font-semibold text-text-primary">{formatInt(points.length)}</p>
            <p className="text-[11px] text-text-muted">leads</p>
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
                dataKey="minutos"
                domain={[...TEMPO_DOMAIN]}
                height={AXIS_HEIGHT}
                name="Tempo até o contato"
                scale="log"
                tickFormatter={formatMinutes}
                tickMargin={8}
                ticks={[...TEMPO_TICKS]}
                type="number"
              />
              <YAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="tentativas"
                domain={[...TENTATIVA_DOMAIN]}
                name="Tentativas"
                tickFormatter={(value: number) => formatInt(value)}
                tickMargin={8}
                ticks={[...TENTATIVA_TICKS]}
                type="number"
                width={AXIS_WIDTH}
              />
              <ZAxis dataKey="z" range={[...Z_RANGE]} type="number" />
              <Scatter
                data={points}
                fill="var(--chart-1)"
                fillOpacity={POINT_FILL_OPACITY}
                isAnimationActive={animate}
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              accessibilityLayer={false}
              barCategoryGap={BAR_CATEGORY_GAP}
              data={tentativaBins}
              layout="vertical"
              margin={{ top: MARGIN_TOP, right: 4, bottom: MARGIN_BOTTOM + AXIS_HEIGHT, left: 2 }}
            >
              <XAxis allowDecimals={false} domain={[0, maxTentativaCount * HIST_AXIS_HEADROOM]} hide type="number" />
              <YAxis dataKey="center" domain={[...TENTATIVA_DOMAIN]} hide reversed type="number" />
              <Bar dataKey="count" fill={HIST_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX_SIZE} radius={[0, 2, 2, 0]}>
                <LabelList content={RightCountLabel} dataKey="count" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`${formatInt(TEMPO_BIN_COUNT)} faixas de razão ${razaoTexto} vezes no tempo, de ${formatMinutes(TEMPO_DOMAIN[0])} a ${formatMinutes(TEMPO_DOMAIN[1])}, porque a escala é logarítmica, e ${formatInt(TENTATIVA_BIN_COUNT)} faixas de uma tentativa`}
      </p>
    </div>
  );
}
