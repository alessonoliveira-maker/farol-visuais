import type { ReactElement } from 'react';
import { Filter } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BAND_COUNT, BAND_WIDTH, data as defaultData, type OutcomeGroup } from './data';

/**
 * Histograma comparativo no arranjo espelhado: as duas distribuições costas com costas na mesma
 * régua de faixas, uma para cada lado do zero. A pergunta não é a forma de um desfecho, é a faixa em
 * que um passa o outro.
 *
 * Três decisões carregam a peça.
 *
 * A primeira resolve na raiz o defeito que a v1 teve de contornar. Duas séries de `Bar` repartem a
 * banda da faixa entre si e as barras deixam de encostar, o que troca o histograma por um gráfico de
 * colunas; e opacidade para sobrepor as duas derruba o contraste abaixo do piso de 3:1. Aqui as duas
 * séries dividem o **mesmo `stackId`**, então ocupam uma posição de pilha só e cada barra fica com a
 * banda inteira. O que separa os dois grupos é a **posição**, não a cor nem a transparência: um lado
 * do zero para cada desfecho. Isso importa porque as duas cores medem 1,34:1 no tema escuro e 1,19:1
 * no claro **entre si**, e nenhum par de tokens do Farol separa marca de marca por luminância.
 *
 * A segunda é o `stackOffset="sign"`. Sem ele o Recharts empilha o valor negativo **em cima** do
 * positivo já desenhado em vez de descer do zero, e a pirâmide sai com os dois lados do mesmo lado.
 *
 * A terceira é que o sinal existe só na geometria. O lado esquerdo é negativo para desenhar à
 * esquerda, e `Math.abs` no tique, na dica e na conclusão garante que nenhum sinal de menos chegue à
 * tela: perder 22 oportunidades não é uma contagem negativa.
 */
export interface TicketOutcomePyramidProps {
  readonly data?: readonly [OutcomeGroup, OutcomeGroup];
  readonly bandWidth?: number;
  readonly bandCount?: number;
  readonly height?: number;
  readonly className?: string;
}

interface Band {
  /** Piso da faixa, em reais. É a chave de identificação e a base do rótulo. */
  readonly floor: number;
  /** Teto da faixa, em reais, ou `null` na última, que é aberta. */
  readonly ceiling: number | null;
  /** Rótulo do eixo de categoria: só o número em milhares, pela REC-2. A unidade vai no rodapé. */
  readonly axisLabel: string;
  /** Contagem do lado direito, positiva. */
  readonly won: number;
  /** Contagem do lado esquerdo, **negativa**, porque é o sinal que põe a barra à esquerda do zero. */
  readonly lost: number;
}

/** Coordenadas que o Recharts entrega ao `shape` da faixa de referência, já em pixel do gráfico. */
interface AreaShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
}

/**
 * A margem superior abriga os dois nomes de lado, que são rótulo direto e não legenda: com a
 * pirâmide, o lado já identifica o grupo, então nomear cada metade no alto do plano diz mais do que
 * uma legenda com amostra de cor, e economiza a linha que a legenda custaria.
 */
const MARGIN = { top: 20, right: 8, bottom: 0, left: 0 } as const;

/** Largura do eixo de categoria. Tinta de `175` em Manrope de 11 px mede 18,6 px; com a sobrecarga
 * de eixo de cerca de 18 px a conta fecha em 37 px, dentro do teto de 64 da EIX-6. O rótulo com a
 * unidade, `R$ 175 mil`, mede 58,7 px de tinta e pediria 77 px: passou do teto, então quem encurta é
 * o rótulo e não o eixo que alarga, que é a REC-2. */
const Y_AXIS_WIDTH = 40;
/** EIX-6b: `tickMargin` de 8 mais cerca de 15 px de tinta de um rótulo de 11 px, nunca menos de 23. */
const X_AXIS_HEIGHT = 26;

/** O `FORCED_TICK_LIMIT` do Farol repetido como constante local, porque o nome não é importável. */
const FORCED_TICK_LIMIT = 8;

const LOST_COLOR = 'var(--negative)';
const WON_COLOR = 'var(--positive)';
/**
 * A faixa da virada. `--surface-sunken` e não `--surface-overlay`: no tema claro o overlay é o mesmo
 * branco do cartão e mede 1,00:1 contra ele, então a faixa simplesmente não existiria na tela. O
 * catálogo pedia `--surface-raised` aqui, que é a **própria cor do cartão** e teria o mesmo desfecho.
 */
const CROSS_FILL = 'var(--surface-sunken)';
const CROSS_LABEL_COLOR = 'var(--text-secondary)';
/** Marca de contagem zero, no tom que a 17.2 reserva para "sem dado" em composição. */
const ZERO_MARK = 'var(--line-strong)';
const ZERO_MARK_W = 2;
const LABEL_FONT = 11;
/** Distância da linha de nomes ao topo do plano, em múltiplo de 2 px (ESP-1). */
const SIDE_LABEL_LIFT = 6;

/** Passos aceitos no eixo de contagem, do mais fino ao mais grosso. */
const X_STEPS = [1, 2, 5, 10, 12, 20, 25, 50, 100] as const;

/**
 * Teto e passo do eixo de contagem, calculados sobre o maior lado e depois iguais para os dois. O
 * domínio simétrico é o que faz a pirâmide comparável: régua por lado transformaria uma diferença de
 * volume em diferença de forma. O passo escolhido é o primeiro da escada que entrega 1 ou 2
 * intervalos por lado, isto é 3 ou 5 linhas de grade no total, que é a faixa da EIX-4 para cartão.
 */
function symmetricAxis(maxSide: number): { top: number; step: number } {
  for (const step of X_STEPS) {
    const top = Math.ceil(maxSide / step) * step;
    if (top / step <= 2) return { top, step };
  }
  return { top: Math.max(maxSide, 1), step: Math.max(maxSide, 1) };
}

/**
 * O maior lado de todas as faixas. Devolve `null` para lista vazia, nunca `0`: sem faixa nenhuma não
 * existe máximo, e um zero aqui viraria um domínio de zero a zero com cara de medida (EST-1b).
 */
function widestSide(bands: readonly Band[]): number | null {
  if (bands.length === 0) return null;
  return bands.reduce((best, band) => Math.max(best, band.won, Math.abs(band.lost)), 0);
}

/**
 * A primeira faixa, do menor ticket para o maior, em que as ganhas passam as perdidas. Devolve
 * `null` quando não existe nenhuma, que é resposta diferente de "é a faixa zero" (EST-1b): recorte
 * em que o time perde em toda faixa é um achado, não um vazio.
 */
function crossoverIndex(bands: readonly Band[]): number | null {
  if (bands.length === 0) return null;
  const found = bands.findIndex((band) => band.won > Math.abs(band.lost));
  return found === -1 ? null : found;
}

/**
 * Conta as observações dos dois desfechos na mesma régua, numa passada só. A última faixa é aberta:
 * o índice é preso no teto, então a cauda entra na faixa de cima em vez de sair da amostra em
 * silêncio. Faixa sem nenhum caso permanece na lista com contagem zero, porque se ela sumisse o
 * Recharts encostaria as vizinhas e o buraco desapareceria da leitura.
 */
function toBands(
  lost: readonly number[],
  won: readonly number[],
  width: number,
  count: number,
): Band[] {
  const tally = (values: readonly number[]): number[] => {
    const acc = new Array<number>(count).fill(0);
    for (const value of values) {
      const index = Math.min(Math.floor(value / width), count - 1);
      if (index < 0) continue;
      acc[index] = (acc[index] ?? 0) + 1;
    }
    return acc;
  };
  const lostCounts = tally(lost);
  const wonCounts = tally(won);
  return Array.from({ length: count }, (_, index) => {
    const floor = index * width;
    return {
      floor,
      ceiling: index === count - 1 ? null : floor + width,
      axisLabel: formatInt(floor / 1000),
      won: wonCounts[index] ?? 0,
      lost: -(lostCounts[index] ?? 0),
    };
  });
}

export default function TicketOutcomePyramid({
  data = defaultData,
  bandWidth = BAND_WIDTH,
  bandCount = BAND_COUNT,
  height,
  className,
}: TicketOutcomePyramidProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const [lostGroup, wonGroup] = data;

  if (lostGroup.values.length === 0 || wonGroup.values.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>
          Neste recorte um dos dois desfechos ficou sem nenhuma oportunidade, e a pirâmide precisa dos
          dois lados para dizer alguma coisa.
        </span>
      </div>
    );
  }

  const bands = toBands(lostGroup.values, wonGroup.values, bandWidth, bandCount);
  const widest = widestSide(bands);
  const axis = symmetricAxis(widest === null ? 1 : widest);
  const ticks = [-axis.top, -axis.step, 0, axis.step, axis.top].filter(
    (value, index, all) => all.indexOf(value) === index,
  );

  const crossAt = crossoverIndex(bands);
  const crossBand = crossAt === null ? undefined : bands[crossAt];

  /**
   * A faixa da virada, os nomes de cada lado e a marca de contagem zero, num desenho só. Sai de um
   * `shape` da faixa de referência porque é ele que entrega, em pixel, onde o plano começa e termina;
   * e como o domínio é simétrico, o zero cai exatamente no meio da largura, o que dispensa ler a
   * escala do eixo. A faixa de referência desenha **por baixo** das barras (a pilha de z do Recharts
   * põe `ReferenceArea` em 100 e `Bar` em 300), que é o que faz o fundo ser fundo.
   *
   * A ordem das faixas no eixo de categoria é de baixo para cima: o primeiro item da lista fica na
   * base, então a faixa de índice `i` é contada a partir do rodapé do plano. É a ordem natural do
   * ticket e não um descuido de ordenação.
   */
  const renderBackdrop = ({ x, y, width, height: areaHeight }: AreaShapeProps): ReactElement => {
    const left = Number(x);
    const top = Number(y);
    const span = Number(width);
    const tall = Number(areaHeight);
    const bandHeight = tall / bands.length;
    const zeroX = left + span / 2;
    return (
      <g>
        {crossAt === null ? null : (
          <rect
            fill={CROSS_FILL}
            height={bandHeight}
            width={span}
            x={left}
            y={top + tall - (crossAt + 1) * bandHeight}
          />
        )}
        {bands.map((band, index) => {
          const center = top + tall - (index + 0.5) * bandHeight;
          const markHeight = bandHeight * 0.5;
          return (
            <g key={band.floor}>
              {/* Contagem zero desenha uma marca de 2 px encostada no zero, de cada lado que
                  precisar: barra de altura nenhuma não pinta nada, e sem a marca a faixa sem caso
                  ficaria indistinguível de faixa fora da régua. */}
              {band.lost === 0 ? (
                <rect
                  fill={ZERO_MARK}
                  height={markHeight}
                  width={ZERO_MARK_W}
                  x={zeroX - ZERO_MARK_W}
                  y={center - markHeight / 2}
                />
              ) : null}
              {band.won === 0 ? (
                <rect
                  fill={ZERO_MARK}
                  height={markHeight}
                  width={ZERO_MARK_W}
                  x={zeroX}
                  y={center - markHeight / 2}
                />
              ) : null}
            </g>
          );
        })}
        {/* Os dois nomes de lado, cada um na cor do seu desfecho e ancorado na ponta do seu lado, com
            o substantivo junto da contagem (NUM-6). Eles ficam na margem superior, acima de qualquer
            barra, então não há tinta a cruzar e não é caso de halo. */}
        <text
          className="font-display"
          fill={LOST_COLOR}
          fontSize={LABEL_FONT}
          fontWeight={600}
          textAnchor="start"
          x={left}
          y={top - SIDE_LABEL_LIFT}
        >
          {`${lostGroup.label.toLowerCase()}, ${formatInt(lostGroup.values.length)} oportunidades`}
        </text>
        <text
          className="font-display"
          fill={WON_COLOR}
          fontSize={LABEL_FONT}
          fontWeight={600}
          textAnchor="end"
          x={left + span}
          y={top - SIDE_LABEL_LIFT}
        >
          {`${wonGroup.label.toLowerCase()}, ${formatInt(wonGroup.values.length)} oportunidades`}
        </text>
        {/* O nome da faixa destacada, na própria faixa, que é o texto que a ANO-4 exige junto de toda
            faixa de referência. Vai na ponta direita, onde a barra das ganhas não chega, e mede
            9,56:1 no tema escuro e 6,73:1 no claro contra o fundo rebaixado. */}
        {crossAt === null ? null : (
          <text
            className="font-display"
            dominantBaseline="central"
            fill={CROSS_LABEL_COLOR}
            fontSize={LABEL_FONT}
            textAnchor="end"
            x={left + span - 4}
            y={top + tall - (crossAt + 0.5) * bandHeight}
          >
            a virada
          </text>
        )}
      </g>
    );
  };

  const bandName = (band: Band): string =>
    band.ceiling === null
      ? `${formatCurrencyAxis(band.floor)} ou mais`
      : `${formatCurrencyAxis(band.floor)} a ${formatCurrencyAxis(band.ceiling)}`;

  const reading =
    crossBand === undefined
      ? 'nenhuma faixa de ticket em que as ganhas passam as perdidas neste recorte'
      : `a virada é na faixa de ${bandName(crossBand)}: ${formatInt(crossBand.won)} ganhas contra ${formatInt(Math.abs(crossBand.lost))} perdidas`;

  const summary =
    `Histograma comparativo espelhado do ticket, ${formatInt(wonGroup.values.length)} ganhas contra ` +
    `${formatInt(lostGroup.values.length)} perdidas em faixas de ${formatCurrencyAxis(bandWidth)}. ` +
    (crossBand === undefined
      ? 'As perdidas são maioria em toda faixa da régua.'
      : `Até ${formatCurrencyAxis(crossBand.floor)} as perdidas são maioria; dali para cima as ganhas passam, ` +
        `${formatInt(crossBand.won)} contra ${formatInt(Math.abs(crossBand.lost))}, e seguem à frente.`);

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      {/* Linha de leitura da ANO-5: a conclusão calculada do dado, no topo do corpo, em uma linha. */}
      <p aria-hidden className="shrink-0 text-xs leading-4 text-text-secondary tabular-nums">
        {reading}
      </p>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            accessibilityLayer={false}
            barCategoryGap={0}
            data={bands}
            layout="vertical"
            margin={MARGIN}
            stackOffset="sign"
          >
            {/* A grade corre no sentido da leitura, e aqui o valor está no eixo X: quem serve de
                régua é a linha vertical, então `horizontal={false}`. O `vertical={false}` do caso de
                coluna deixaria a grade atravessada. A marca nasce no zero e se lê por extensão, então
                a exceção da EIX-3b não se aplica e a grade fica num sentido só. */}
            <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
            <XAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              domain={[-axis.top, axis.top]}
              height={X_AXIS_HEIGHT}
              tickFormatter={(value: number) => formatInt(Math.abs(value))}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="axisLabel"
              interval={bands.length <= FORCED_TICK_LIMIT ? 0 : 'preserveStartEnd'}
              /* Num eixo de categoria deitado o Recharts põe o PRIMEIRO item no alto, e a régua de
                 ticket desceria: a distribuição sairia larga em cima e estreita embaixo, que é a
                 silhueta de um funil e não de uma distribuição. `reversed` devolve o eixo ao sentido
                 de um histograma girado, com a grandeza crescendo para cima. */
              reversed
              tickLine={false}
              tickMargin={8}
              type="category"
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={(props) => {
                const row = props.payload?.[0]?.payload as Band | undefined;
                return (
                  <ChartTooltip
                    active={props.active}
                    label={row === undefined ? undefined : bandName(row)}
                    labelFormat="text"
                    /* A dica recebe a lista já em valor absoluto e já na ordem da pilha, da esquerda
                       para a direita, então não há sinal de menos a mostrar nem ordenação alfabética
                       a desfazer (DIC-4). A lista é remontada campo a campo, e não espalhada: o
                       `formatter` que o Recharts põe em cada entrada é tipado mais largo do que o
                       `ChartTooltip` aceita, e espalhar a entrada inteira não compila. */
                    payload={props.payload?.map((entry) => ({
                      color: entry.color,
                      dataKey: entry.dataKey,
                      graphicalItemId: entry.graphicalItemId,
                      name: entry.name,
                      value: Math.abs(Number(entry.value)),
                    }))}
                    valueFormat="int"
                  />
                );
              }}
              cursor={{ fill: 'var(--line-subtle)' }}
              isAnimationActive={false}
            />
            <ReferenceArea
              fill="none"
              ifOverflow="extendDomain"
              shape={renderBackdrop}
              x1={-axis.top}
              x2={axis.top}
            />
            {/* O zero do eixo, que a EIX-5 pede sempre que há valor negativo. */}
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" x={0} />
            {/* Os dois lados no MESMO `stackId`, e é isso que dá a banda inteira a cada barra: com
                duas séries independentes o Recharts dividiria a banda em duas e as faixas deixariam
                de encostar, que é a diferença entre histograma e gráfico de colunas. */}
            <Bar
              dataKey="lost"
              fill={LOST_COLOR}
              isAnimationActive={animate}
              name={lostGroup.label}
              stackId="ticket"
            />
            <Bar
              dataKey="won"
              fill={WON_COLOR}
              isAnimationActive={animate}
              name={wonGroup.label}
              stackId="ticket"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">
          {`ticket em R$ mil no eixo, pelo piso de faixas de ${formatCurrencyAxis(bandWidth)}; a última é ${formatCurrencyAxis((bandCount - 1) * bandWidth)} ou mais`}
        </span>
        <span className="tabular-nums">
          {`régua de ${formatInt(axis.top)} oportunidades de cada lado, simétrica e fixada sobre o maior lado`}
        </span>
        {/* A ausência vem nomeada por grupo, e não como um total só: falha de cadastro não é igual
            nos dois desfechos, e o total esconderia de qual lado a amostra saiu mais furada. */}
        <span className="tabular-nums">
          {`${formatInt(wonGroup.withoutTicket)} ganhas e ${formatInt(lostGroup.withoutTicket)} perdidas sem valor registrado ficaram fora`}
        </span>
      </div>
    </figure>
  );
}
