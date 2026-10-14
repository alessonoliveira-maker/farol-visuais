import { Filter } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ReferenceDot, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatHours, formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BIN_WIDTH, data as defaultData, OPEN_FROM, THRESHOLDS } from './data';

/**
 * Histograma acumulado: a mesma escada da ECDF, desenhada em barras de largura fixa em vez de
 * degrau contínuo. Cada coluna é a soma de tudo o que veio antes dela, então a altura de uma coluna
 * já responde "quanto da fila caberia neste limiar" sem ninguém somar barras de cabeça, que é
 * exatamente o trabalho que o histograma simples empurra para o leitor.
 *
 * O preço de escolher barra em vez de degrau é a largura do bin, que a ECDF não tem: bin de 5
 * minutos afirma que dentro de cinco minutos não interessa onde o caso caiu. Em troca, a leitura de
 * um limiar fica na altura de uma coluna, que é mais direta que a de um ponto na escada.
 *
 * Duas coisas que a monotonicidade exige, e que erram calado quando faltam. Os bins saem
 * **ordenados e completos**, os vazios inclusive: bin faltando faz a escada descer no meio, e
 * escada que desce não é acumulada nenhuma, é erro de montagem lido como dado. E a **faixa aberta**
 * do fim existe para a soma fechar em cem por cento; sem ela a última coluna para abaixo do topo e
 * o leitor sai procurando o resto da fila.
 *
 * O sentido da soma é parâmetro, e ele vive escrito na tela. A mesma peça somada ao contrário
 * responde "quanto da fila ainda espera neste tempo ou mais", com as mesmas colunas de cabeça para
 * baixo, e nada no desenho denunciaria a troca.
 */

/** 1 soma da esquerda para a direita e lê "até"; menos 1 soma ao contrário e lê "ou mais". */
export type CumulativeSense = 1 | -1;

export interface CumulativeQueueProps {
  readonly data?: readonly number[];
  readonly binWidth?: number;
  readonly openFrom?: number;
  readonly thresholds?: readonly number[];
  readonly sense?: CumulativeSense;
  readonly height?: number;
  readonly className?: string;
}

interface Bin {
  /** Centro da coluna, em unidades de bin. É nele que a barra se apoia. */
  readonly center: number;
  readonly start: number;
  /** Fim do bin em minutos, ou `null` na faixa aberta, que não tem fim. */
  readonly end: number | null;
  readonly count: number;
  /** Soma acumulada até aqui, no sentido pedido, como fração da fila. */
  readonly share: number;
}

interface Reading {
  readonly minutes: number;
  readonly center: number;
  readonly share: number | null;
  readonly text: string;
}

const MARGIN = { top: 10, right: 8, bottom: 0, left: 0 } as const;
const BAR_FILL = 'var(--chart-1)';
/**
 * A marca do limiar é escura contra o cartão (14,53:1 no escuro e 17,96:1 no claro) e ganha um anel
 * da cor do cartão para se separar da coluna por baixo, que é a COR-5. Sem o anel ela mediria
 * 1,53:1 e 2,99:1 contra `--chart-1` e a metade de baixo do ponto desapareceria dentro da barra.
 */
const MARK_FILL = 'var(--text-primary)';
const MARK_RING = 'var(--surface-raised)';
const MARK_RADIUS = 3.5;
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
/** Passo dos tiques de apoio do eixo, em minutos, entre os limiares. */
const TICK_STEP = 30;
const Y_AXIS_WIDTH = 48;
/** EIX-6b: `tickMargin` de 8 mais cerca de 15 px de tinta de um rótulo de 11 px. */
const X_AXIS_HEIGHT = 26;
/**
 * Teto da ESP-2 em cartão. A banda deste canvas entrega cerca de 19 px com os 25 bins publicados,
 * abaixo do teto, então a constante declara a intenção e não muda o desenho.
 */
const BAR_MAX = 24;

/** Rótulo de um tempo: minuto até uma hora, hora acima disso, sempre por formatador. */
function timeLabel(minutes: number): string {
  return minutes < 60 ? `${formatInt(minutes)} min` : formatHours(minutes / 60);
}

/**
 * Contagem por bin e a soma acumulada no sentido pedido, com a faixa aberta como último bin.
 *
 * A fatia de cada valor sai de `Math.ceil`, e não de `Math.floor`, porque o limiar pertence ao bin
 * que termina nele: com bin de 5 minutos, o lead atendido em 5 minutos está dentro do SLA de 5
 * minutos, e `floor` o jogaria para a faixa seguinte, fazendo a leitura do limiar ficar um bin
 * atrasada.
 */
function buildBins(
  values: readonly number[],
  width: number,
  openFrom: number,
  sense: CumulativeSense,
): Bin[] {
  if (values.length === 0) return [];
  const closed = Math.ceil(openFrom / width);
  const counts = new Array<number>(closed + 1).fill(0);
  for (const value of values) {
    const slot = value > openFrom ? closed : Math.max(Math.ceil(value / width) - 1, 0);
    counts[slot] = (counts[slot] ?? 0) + 1;
  }
  const total = values.length;
  const running: number[] = [];
  let sum = 0;
  for (const count of counts) {
    sum += count;
    running.push(sum);
  }
  return counts.map((count, index) => {
    const upTo = running[index] ?? total;
    const before = index === 0 ? 0 : (running[index - 1] ?? total);
    return {
      center: index + 0.5,
      start: index * width,
      end: index === closed ? null : (index + 1) * width,
      count,
      share: (sense === 1 ? upTo : total - before) / total,
    };
  });
}

/**
 * Altura da acumulada no limiar, ou `null` sem nenhum caso na fila.
 *
 * A guarda testa `values`, que é **a lista que alimenta a conta**, e não o array de bins: o array de
 * bins nasce com uma linha por faixa mesmo sem observação nenhuma, então uma guarda apoiada nele
 * nunca dispararia e o percentual sairia zero, isto é, um limiar reprovado onde não houve medição.
 */
function shareAtThreshold(
  values: readonly number[],
  minutes: number,
  sense: CumulativeSense,
): number | null {
  if (values.length === 0) return null;
  const hits = values.filter((value) => (sense === 1 ? value <= minutes : value >= minutes)).length;
  return hits / values.length;
}

/**
 * O maior tempo medido, ou `null` na fila vazia. `Math.max` espalhado sobre lista vazia devolve
 * menos infinito, que não é zero mas também não é medida, e chega ao rodapé como número.
 */
function longestWait(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((most, value) => (value > most ? value : most), values[0] ?? 0);
}

export default function CumulativeQueue({
  data = defaultData,
  binWidth = BIN_WIDTH,
  openFrom = OPEN_FROM,
  thresholds = THRESHOLDS,
  sense = 1,
  height,
  className,
}: CumulativeQueueProps) {
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
        <span>
          {`Fila de primeiro contato ${formatUnavailable().toLowerCase()}: este recorte não tem nenhum lead, e soma acumulada sem base não tem percentual para somar.`}
        </span>
      </div>
    );
  }

  const bins = buildBins(data, binWidth, openFrom, sense);
  const senseVerb = sense === 1 ? 'em até' : 'em';
  const senseTail = sense === 1 ? '' : ' ou mais';
  const readings: Reading[] = thresholds.map((minutes) => {
    const share = shareAtThreshold(data, minutes, sense);
    return {
      minutes,
      /* O ponto marca a coluna que **termina** no limiar, e é ela que carrega a leitura. */
      center: Math.max(Math.ceil(minutes / binWidth) - 0.5, 0.5),
      share,
      text:
        share === null
          ? `${formatUnavailable()} ${senseVerb} ${timeLabel(minutes)}${senseTail}`
          : `${formatPercent(share, 0)} ${senseVerb} ${timeLabel(minutes)}${senseTail}`,
    };
  });
  const longest = longestWait(data);
  const beyond = data.filter((value) => value > openFrom).length;

  /* Tiques derivados dos próprios limiares mais um passo de apoio, e não de uma lista fixa: com o
     passo automático o eixo saltava de bin em bin e nenhuma marca caía nos três limiares. */
  const tickMinutes = [
    ...new Set([0, ...thresholds, ...Array.from({ length: Math.floor(openFrom / TICK_STEP) }, (_, index) => (index + 1) * TICK_STEP)]),
  ]
    .filter((minutes) => minutes <= openFrom)
    .sort((left, right) => left - right);

  const summary =
    `Histograma acumulado do tempo até o primeiro contato de ${formatInt(data.length)} leads, em faixas de ${formatInt(binWidth)} minutos. ` +
    `${readings.map((reading) => reading.text).join('; ')}. ` +
    `O caso mais demorado esperou ${longest === null ? formatUnavailable() : formatInt(longest)} minutos.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      {/* O sentido da soma vive escrito, não subentendido: as mesmas colunas de cabeça para baixo
          responderiam "ou mais", e nada no desenho denunciaria a troca. */}
      <span aria-hidden className="shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        {sense === 1 ? 'fila já atendida até o tempo do eixo' : 'fila ainda na espera no tempo do eixo ou mais'}
      </span>

      <div className="flex min-h-0 flex-1 items-stretch gap-3">
        <div aria-hidden className="min-h-0 min-w-0 flex-1">
          <ResponsiveContainer height="100%" width="100%">
            {/* Uma série só, com o vão de categoria em zero: o histograma pede barras encostadas,
                porque o eixo é contínuo e o vão diria "categorias separadas". Uma segunda série
                repartiria a banda e as barras deixariam de encostar. */}
            <BarChart accessibilityLayer={false} barCategoryGap={0} data={bins} margin={MARGIN}>
              {/* Grade nos dois sentidos: os dois eixos são quantitativos e a leitura é de posição
                  nos dois, tempo no horizontal e fração acumulada no vertical. */}
              <CartesianGrid stroke={GRID_COLOR} />
              <XAxis
                {...AXIS_PROPS}
                axisLine={false}
                dataKey="center"
                domain={[0, bins.length]}
                height={X_AXIS_HEIGHT}
                /* `interval={0}` porque o eixo descarta em silêncio o tique que ele julga apertado,
                   e a grade herda o descarte junto. */
                interval={0}
                tickFormatter={(value: number) => formatInt(value * binWidth)}
                tickMargin={8}
                ticks={tickMinutes.map((minutes) => minutes / binWidth)}
                type="number"
              />
              <YAxis
                {...AXIS_PROPS}
                axisLine={false}
                domain={[0, 1]}
                tickFormatter={(value: number) => formatPercent(value, 0)}
                tickMargin={8}
                ticks={[...Y_TICKS]}
                width={Y_AXIS_WIDTH}
              />
              {/* As marcas dos limiares vêm depois da barra para ficarem por cima dela. Guia
                  vertical atravessando as colunas foi descartada por medição: nenhum token do Farol
                  se vê ao mesmo tempo sobre a coluna e sobre o cartão. */}
              {readings.map((reading) =>
                reading.share === null ? null : (
                  <ReferenceDot
                    fill={MARK_FILL}
                    ifOverflow="extendDomain"
                    key={reading.minutes}
                    r={MARK_RADIUS}
                    stroke={MARK_RING}
                    strokeWidth={1.5}
                    x={reading.center}
                    y={reading.share}
                  />
                ),
              )}
              <Bar dataKey="share" fill={BAR_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Os três rótulos empilhados, fora do plano. Dentro dele não há lugar: a acumulada preenche
            tudo o que está abaixo dela, e o que sobra livre é o canto de cima à esquerda, estreito
            demais para três linhas de texto. */}
        <div aria-hidden className="flex w-36 shrink-0 flex-col justify-center gap-1 text-right">
          <span className="text-[0.6875rem] leading-4 text-text-muted">
            {sense === 1 ? 'da fila atendida' : 'da fila ainda na espera'}
          </span>
          {readings.map((reading) => (
            <span
              className="text-xs font-medium leading-5 tabular-nums text-text-primary"
              key={reading.minutes}
            >
              {reading.text}
            </span>
          ))}
        </div>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">
          {`minutos até o primeiro contato, faixas de ${timeLabel(binWidth)}, n ${formatInt(data.length)} leads`}
        </span>
        <span className="tabular-nums">
          {`a última coluna é a faixa aberta acima de ${timeLabel(openFrom)} e fecha a soma em ${formatPercent(1, 0)}`}
        </span>
        {beyond <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(beyond)} leads caíram nela`}</span>
        )}
      </div>
    </figure>
  );
}
