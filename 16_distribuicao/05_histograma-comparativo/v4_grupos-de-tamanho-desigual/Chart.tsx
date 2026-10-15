import type { ReactElement } from 'react';
import { Filter } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BIN_COUNT, BIN_WIDTH, data as defaultData, type ChannelGroup } from './data';

/**
 * Histograma comparativo de dois grupos de tamanho muito desigual, 640 leads contra 38. A pergunta é
 * o ritmo de cada canal, não o volume, e é o tamanho que torna a peça difícil: com contagem no eixo o
 * canal de 38 leads vira uma linha rente ao zero e a comparação passa a ser entre volumes.
 *
 * Quatro decisões carregam a peça.
 *
 * A primeira é a escala. O eixo vertical traz **percentual dentro do próprio canal**, e o nome do eixo
 * diz isso, porque uma divisão silenciosa é a forma mais fácil de trocar a pergunta sem avisar. O
 * alternador para contagem absoluta existe na prop `scale`, e a escolha aparece escrita no eixo nos
 * dois casos: quem cola a peça decide se a pergunta da página é ritmo ou volume.
 *
 * A segunda é o n bruto de cada canal na legenda. Percentual dentro do grupo faz 1 de 38 valer 2,6% e
 * 1 de 640 valer 0,2%, e sem o denominador escrito a silhueta do canal pequeno pareceria tão firme
 * quanto a do grande. O rodapé escreve quanto um único lead vale no canal menor.
 *
 * A terceira é o par de papéis de desenho, e ele é o mesmo da v1 por medição, não por hábito: duas
 * séries de `Bar` repartem a banda da faixa e as barras deixam de encostar, e opacidade para sobrepor
 * as duas derruba o contraste abaixo do piso de 3:1. Então o canal grande é barra preenchida de série
 * única e o pequeno é silhueta em degrau, um `Line` de tipo `step`, que não disputa a banda com a
 * barra. O que separa as duas marcas é a **forma**, área contra contorno, mais o revestimento na cor
 * do cartão por baixo do traço: entre si `--chart-1` e `--chart-3` medem 1,47:1 no tema escuro e
 * 1,03:1 no claro, então trocar de token não faria a silhueta aparecer sobre a barra.
 *
 * A quarta é que o papel vem do tamanho declarado no dado, não do `n` do recorte: o canal pequeno é
 * sempre a silhueta, desenhada por cima, e um filtro que inverta os tamanhos não muda a aparência da
 * peça.
 */
export interface UnequalChannelHistogramProps {
  readonly data?: readonly [ChannelGroup, ChannelGroup];
  readonly binWidth?: number;
  readonly binCount?: number;
  /** `share` é percentual dentro do próprio canal; `count` é contagem bruta. A escolha vai escrita no eixo. */
  readonly scale?: 'share' | 'count';
  readonly height?: number;
  readonly className?: string;
}

interface Bin {
  readonly start: number;
  /** Teto da faixa, ou `null` na última, que é aberta. */
  readonly end: number | null;
  /** Centro da faixa: é nele que a barra se apoia no eixo numérico e o degrau troca de patamar. */
  readonly center: number;
  readonly filledCount: number;
  readonly outlineCount: number;
  /** O valor da barra já na escala escolhida. */
  readonly filledValue: number;
  /** O valor da silhueta já na escala escolhida. */
  readonly outlineValue: number;
  /**
   * O mesmo número da silhueta, cortado depois da última faixa com caso. A dica continua lendo
   * `outlineCount`, que é a contagem real de toda faixa; este campo existe só para o desenho, porque
   * linha deitada no zero ao longo de um terço do eixo se lê como série medida em zero.
   */
  readonly outlineDraw: number | null;
}

const MARGIN = { top: 8, right: 8, bottom: 0, left: 0 } as const;
/** Tinta de `40%` em Manrope de 11 px mede 18,4 px; com a sobrecarga de eixo de cerca de 18 px a
 * conta fecha em 38 px, dentro do teto de 64 da EIX-6. */
const Y_AXIS_WIDTH = 40;
/** EIX-6b: `tickMargin` de 8 mais cerca de 15 px de tinta de um rótulo de 11 px, nunca menos de 23. */
const X_AXIS_HEIGHT = 26;

const FILLED_COLOR = 'var(--chart-1)';
const OUTLINE_COLOR = 'var(--chart-3)';
/**
 * O revestimento da silhueta. Medidos os tokens categóricos contra `--chart-1`, nenhum chega perto de
 * 3:1 de separação, porque eles são calibrados contra o cartão e não uns contra os outros:
 * `--chart-3` fica em 1,47:1 no escuro e 1,03:1 no claro. `--surface-raised` resolve, com 9,50:1 e
 * 6,00:1 contra `--chart-1`, e é o contorno na cor da superfície que a COR-5 autoriza.
 */
const OUTLINE_CASING = 'var(--surface-raised)';
const OUTLINE_WIDTH = 3;
const OUTLINE_CASING_WIDTH = 6;
/** Marca de base nas faixas vazias dentro da amostra da barra, para o vão ser deliberado e não sumiço. */
const EMPTY_MARK = 'var(--line-strong)';
const EMPTY_MARK_H = 2;

/** Passos do eixo de percentual, em fração, do mais fino ao mais grosso. */
const SHARE_STEPS = [0.02, 0.05, 0.1, 0.2, 0.25] as const;
/** Passos do eixo de contagem, do mais fino ao mais grosso. */
const COUNT_STEPS = [5, 10, 20, 25, 50, 100, 200] as const;

/**
 * Teto e passo do eixo, calculados do dado. O teto é a primeira linha de grade acima do maior valor
 * desenhado, e o passo é o primeiro da escada que entrega de 3 a 5 intervalos, que é a faixa da EIX-4
 * para cartão. A escada muda com a escala porque percentual e contagem não têm o mesmo intervalo
 * redondo.
 */
function valueAxis(maxValue: number, steps: readonly number[]): { top: number; step: number } {
  for (const step of steps) {
    const top = Math.ceil(maxValue / step) * step;
    if (top / step >= 3 && top / step <= 5) return { top, step };
  }
  return { top: Math.max(maxValue, 1), step: Math.max(maxValue, 1) };
}

/**
 * A participação de uma parte no total. Devolve `null` quando não há total, nunca `0`: sem
 * denominador não existe taxa, e é o chamador que escreve a ausência (EST-1b).
 */
function share(part: number, whole: number): number | null {
  if (whole <= 0) return null;
  return part / whole;
}

/**
 * O maior valor desenhado do recorte. Devolve `null` para lista vazia, nunca `0`: sem faixa nenhuma
 * não existe máximo, e um zero aqui viraria um eixo de zero a zero com cara de medida (EST-1b).
 */
function tallestValue(bins: readonly Bin[]): number | null {
  if (bins.length === 0) return null;
  return bins.reduce((best, item) => Math.max(best, item.filledValue, item.outlineValue), 0);
}

/**
 * A faixa em que a silhueta tem o maior valor. Devolve `null` para lista vazia, e não a primeira
 * faixa com zero, que é outra afirmação.
 */
function peakBin(bins: readonly Bin[]): Bin | null {
  if (bins.length === 0) return null;
  let best: Bin | null = null;
  for (const item of bins) {
    if (best === null || item.outlineCount > best.outlineCount) best = item;
  }
  return best;
}

/**
 * Conta as observações dos dois canais na mesma régua, numa passada só, e converte para a escala
 * escolhida. A última faixa é aberta: o índice é preso no teto, então a cauda entra na faixa de cima
 * em vez de sair da amostra em silêncio. Faixa sem nenhum caso permanece na lista com valor zero,
 * porque se ela sumisse o Recharts encostaria as vizinhas e o buraco desapareceria da leitura.
 */
function toBins(
  filled: readonly number[],
  outline: readonly number[],
  width: number,
  count: number,
  scale: 'share' | 'count',
): Bin[] {
  const tally = (values: readonly number[]): number[] => {
    const acc = new Array<number>(count).fill(0);
    for (const value of values) {
      const index = Math.min(Math.floor(value / width), count - 1);
      if (index < 0) continue;
      acc[index] = (acc[index] ?? 0) + 1;
    }
    return acc;
  };
  const filledCounts = tally(filled);
  const outlineCounts = tally(outline);
  const outlineLast = outlineCounts.reduce((last, value, index) => (value > 0 ? index : last), -1);
  /**
   * Na escala percentual o denominador é o **próprio canal**, e é isso que torna a comparação de
   * formas honesta entre um canal de 640 e um de 38. Divisão pelo total dos dois juntos responderia
   * outra pergunta, a de volume, que é a escala `count`.
   */
  const toScale = (part: number, whole: number): number => {
    if (scale === 'count') return part;
    /* O denominador é testado aqui e garantido pelo chamador, que devolve o estado de vazio antes de
       chegar a este ponto: canal sem lead nenhum não tem forma a desenhar, e não uma forma de zeros. */
    return whole <= 0 ? part : part / whole;
  };
  return Array.from({ length: count }, (_, index) => {
    const filledCount = filledCounts[index] ?? 0;
    const outlineCount = outlineCounts[index] ?? 0;
    return {
      start: index * width,
      end: index === count - 1 ? null : (index + 1) * width,
      center: index * width + width / 2,
      filledCount,
      outlineCount,
      filledValue: toScale(filledCount, filled.length),
      outlineValue: toScale(outlineCount, outline.length),
      outlineDraw: index <= outlineLast ? toScale(outlineCount, outline.length) : null,
    };
  });
}

export default function UnequalChannelHistogram({
  data = defaultData,
  binWidth = BIN_WIDTH,
  binCount = BIN_COUNT,
  scale = 'share',
  height,
  className,
}: UnequalChannelHistogramProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const [filledGroup, outlineGroup] = data;

  if (filledGroup.values.length === 0 || outlineGroup.values.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>
          Neste recorte um dos dois canais ficou sem nenhum lead agendado, e percentual dentro do canal
          precisa de um denominador em cada um.
        </span>
      </div>
    );
  }

  const bins = toBins(filledGroup.values, outlineGroup.values, binWidth, binCount, scale);
  const tallest = tallestValue(bins);
  const axis = valueAxis(tallest === null ? 1 : tallest, scale === 'share' ? SHARE_STEPS : COUNT_STEPS);
  const ticks = Array.from({ length: Math.round(axis.top / axis.step) + 1 }, (_, index) => index * axis.step);
  const lastFilled = bins.reduce((last, item, index) => (item.filledCount > 0 ? index : last), -1);

  const axisName = scale === 'share' ? 'percentual dentro do próprio canal' : 'leads agendados';
  const printValue = (value: number): string =>
    scale === 'share' ? formatPercent(value) : formatInt(value);
  const printTick = (value: number): string =>
    scale === 'share' ? formatPercent(value, 0) : formatInt(value);

  const bandName = (item: Bin): string =>
    item.end === null ? `${formatDays(item.start)} ou mais` : `${formatInt(item.start)} a ${formatDays(item.end)}`;

  const peak = peakBin(bins);
  const peakOutline = peak === null ? null : share(peak.outlineCount, outlineGroup.values.length);
  const peakFilled = peak === null ? null : share(peak.filledCount, filledGroup.values.length);
  /** Quanto um único lead do canal menor vale na escala em uso. Sem denominador não há fração, e aí a
   * linha do rodapé não é escrita, em vez de sair com um zero que ninguém mediu. */
  const oneLeadShare = share(1, outlineGroup.values.length);

  /**
   * Barra cheia quando há caso na faixa; traço de base quando a faixa está vazia dentro da amostra.
   * Barra de valor zero não pinta nada, e sem a marca o vão fica indistinguível de recorte do eixo.
   * Depois da última faixa com caso não há marca: ali é fim de amostra, não buraco.
   */
  const renderBin = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const item = bins[Number(index)];
    const left = Number(x);
    const span = Number(width);
    if (item !== undefined && item.filledCount === 0) {
      const inside = Number(index) < lastFilled;
      const baseline = Number(y);
      return inside ? (
        <rect fill={EMPTY_MARK} height={EMPTY_MARK_H} width={span} x={left} y={baseline - EMPTY_MARK_H} />
      ) : (
        <g />
      );
    }
    return <rect fill={FILLED_COLOR} height={Number(barHeight)} width={span} x={left} y={Number(y)} />;
  };

  const reading =
    peak === null || peakOutline === null || peakFilled === null
      ? 'nenhuma faixa com lead agendado neste recorte'
      : `na faixa de ${bandName(peak)} ${outlineGroup.label.toLowerCase()} é ${formatRateWithVolume(peak.outlineCount, outlineGroup.values.length)} contra ${formatPercent(peakFilled)} de ${filledGroup.label.toLowerCase()}`;

  const summary =
    `Histograma comparativo ${scale === 'share' ? 'em percentual do próprio canal' : 'em contagem de leads'}, ${formatInt(filledGroup.values.length)} leads de ` +
    `${filledGroup.label.toLowerCase()} contra ${formatInt(outlineGroup.values.length)} de ${outlineGroup.label.toLowerCase()}, ` +
    `em faixas de ${formatDays(binWidth)}. ` +
    (peak === null || peakOutline === null || peakFilled === null
      ? 'Nenhuma faixa deste recorte tem lead agendado.'
      : `${outlineGroup.label} chega a ${formatPercent(peakOutline)} na faixa de ${bandName(peak)}, contra ${formatPercent(peakFilled)} do outro.`);

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      {/* O nome do eixo à esquerda e a legenda à direita, na mesma linha. O nome do eixo é onde a
          escolha da escala fica escrita: trocar contagem por percentual sem dizer no eixo seria
          trocar a pergunta da peça sem avisar. */}
      <div aria-hidden className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-1 leading-4">
        <span className="text-[0.6875rem] text-text-muted">{axisName}</span>
        <ul className="flex shrink-0 items-center gap-4 text-xs text-text-secondary">
          <li className="flex items-center gap-2">
            {/* Amostra na forma da marca (ROT-4): quadrado cheio para a barra. */}
            <span className="size-3 shrink-0 rounded-[2px]" style={{ backgroundColor: FILLED_COLOR }} />
            <span className="tabular-nums">{`${filledGroup.label}, n ${formatInt(filledGroup.values.length)}`}</span>
          </li>
          <li className="flex items-center gap-2">
            {/* E um degrau para a silhueta, porque uma amostra quadrada prometeria barra preenchida. */}
            <svg className="shrink-0" height={12} viewBox="0 0 12 12" width={12}>
              <polyline
                fill="none"
                points="0,9 4,9 4,3 8,3 8,7 12,7"
                stroke={OUTLINE_COLOR}
                strokeWidth={OUTLINE_WIDTH}
              />
            </svg>
            <span className="tabular-nums">{`${outlineGroup.label}, n ${formatInt(outlineGroup.values.length)}`}</span>
          </li>
        </ul>
      </div>

      {/* Linha de leitura da ANO-5: a conclusão calculada do dado, em uma linha. */}
      <p aria-hidden className="shrink-0 text-xs leading-4 text-text-secondary tabular-nums">
        {reading}
      </p>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} barCategoryGap={0} data={bins} margin={MARGIN}>
            {/* A grade corre no sentido da leitura, e aqui o valor está no eixo Y: quem serve de régua
                é a linha horizontal, então `vertical={false}`. A barra nasce no zero e se lê por
                extensão, então a exceção da EIX-3b não vale, mesmo com os dois eixos numéricos. */}
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="center"
              domain={[0, binWidth * binCount]}
              height={X_AXIS_HEIGHT}
              interval="preserveStartEnd"
              tickCount={6}
              tickFormatter={(value: number) => formatInt(value)}
              tickLine={false}
              tickMargin={8}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, axis.top]}
              tickFormatter={printTick}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={(props) => {
                const item = props.payload?.[0]?.payload as Bin | undefined;
                return (
                  <ChartTooltip
                    active={props.active}
                    label={item === undefined ? undefined : bandName(item)}
                    labelFormat="text"
                    /* A dica traz a contagem bruta de cada canal junto do percentual, porque é o par
                       que sustenta a leitura: 2 de 38 e 2 de 640 têm o mesmo numerador e não querem
                       dizer a mesma coisa. A lista chega na ordem de desenho, barra e depois
                       silhueta, que é a ordem visual (DIC-4), e o revestimento fica fora dela por
                       `tooltipType="none"`, senão a silhueta apareceria duas vezes. A lista é
                       remontada campo a campo, e não espalhada: o `formatter` que o Recharts põe em
                       cada entrada é tipado mais largo do que o `ChartTooltip` aceita, e espalhar a
                       entrada inteira não compila. */
                    payload={props.payload?.map((entry) => ({
                      color: entry.color,
                      dataKey: entry.dataKey,
                      graphicalItemId: entry.graphicalItemId,
                      value: Number(entry.value),
                      name:
                        item === undefined
                          ? entry.name
                          : `${String(entry.name)}, ${formatInt(
                              entry.dataKey === 'filledValue' ? item.filledCount : item.outlineCount,
                            )} de ${formatInt(
                              entry.dataKey === 'filledValue'
                                ? filledGroup.values.length
                                : outlineGroup.values.length,
                            )}`,
                    }))}
                    valueFormat={scale === 'share' ? 'percent' : 'int'}
                  />
                );
              }}
              cursor={{ fill: 'var(--line-subtle)' }}
              isAnimationActive={false}
            />
            {/* Uma série de barra só, e por isso as barras encostam: a banda da faixa não é repartida
                com ninguém. A marca da faixa vazia sai do mesmo `shape`, e não de uma segunda série. */}
            <Bar
              dataKey="filledValue"
              fill={FILLED_COLOR}
              isAnimationActive={animate}
              name={filledGroup.label}
              shape={renderBin}
            />
            {/* A silhueta do canal pequeno, desenhada por cima. `type="step"` põe a transição no
                limite da faixa, que é o contorno do histograma e não uma interpolação entre centros.
                O revestimento vem primeiro, por baixo do traço, e é ele que separa a silhueta da
                barra onde as duas se cruzam. */}
            <Line
              activeDot={false}
              connectNulls={false}
              dataKey="outlineDraw"
              dot={false}
              isAnimationActive={animate}
              stroke={OUTLINE_CASING}
              strokeWidth={OUTLINE_CASING_WIDTH}
              tooltipType="none"
              type="step"
            />
            <Line
              activeDot={false}
              connectNulls={false}
              dataKey="outlineDraw"
              dot={false}
              isAnimationActive={animate}
              name={outlineGroup.label}
              stroke={OUTLINE_COLOR}
              strokeWidth={OUTLINE_WIDTH}
              type="step"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`tempo até a agenda em dias, faixas de ${formatDays(binWidth)}`}</span>
        <span className="tabular-nums">{`a última faixa é aberta, ${formatDays(binWidth * (binCount - 1))} ou mais`}</span>
        {/* Quanto vale um único lead no canal menor. É a informação que o percentual dentro do grupo
            esconde por construção, e sem ela a silhueta de 38 leads parece tão firme quanto a de 640. */}
        {oneLeadShare === null || scale === 'count' ? null : (
          <span className="tabular-nums">
            {`cada lead de ${outlineGroup.label.toLowerCase()} vale ${printValue(oneLeadShare)} do canal`}
          </span>
        )}
        {/* A ausência vem nomeada por canal, e não como um total só: duas ausências num canal de 38
            pesam o que quarenta pesam num de 640. */}
        <span className="tabular-nums">
          {`sem data de agenda: ${formatInt(filledGroup.withoutSchedule)} de ${filledGroup.label.toLowerCase()}, ${formatInt(outlineGroup.withoutSchedule)} de ${outlineGroup.label.toLowerCase()}`}
        </span>
      </div>
    </figure>
  );
}
