import type { ReactElement } from 'react';
import { Filter } from 'lucide-react';
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
  type BarShapeProps,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BIN_WIDTH, data as defaultData, DOMAIN_MAX, type CycleGroup } from './data';

/**
 * Histograma comparativo: duas distribuições da mesma métrica na mesma régua de bins, para medir o
 * deslocamento entre elas. A pergunta não é a forma de uma carteira, é a distância entre duas.
 *
 * Três decisões carregam a peça, e nenhuma é a que o modelo sugeria de início.
 *
 * A primeira é o par de papéis de desenho. O jeito clássico de sobrepor dois histogramas é duas
 * séries de barra com transparência, e ele quebra duas vezes aqui: duas séries de `Bar` repartem a
 * banda do bin entre si e as barras deixam de encostar, o que transforma o histograma em gráfico de
 * colunas; e `fillOpacity` de 0,55 compõe a cor da marca com a do cartão e derruba o contraste
 * abaixo de 3:1 no tema claro, como a ACE-5 mediu. Então um grupo é barra preenchida e o outro é
 * silhueta em degrau, desenhada como `Line` de tipo `step`, que é uma série de linha e não disputa a
 * banda com a barra. A silhueta nunca esconde a barra e a barra nunca esconde a silhueta.
 *
 * A segunda é que o papel de cada grupo vem da pergunta e não do `n`. A regra herdada mandava
 * ordenar por `n` decrescente para o grupo pequeno ficar por cima; com barra e silhueta a ordem
 * deixa de decidir o que se vê, e fixá-la no papel é mais forte: um filtro que inverta os tamanhos
 * não muda o desenho.
 *
 * A terceira é que a anotação vive na margem superior, reservada para ela, e não dentro da área de
 * plotagem. A conclusão da peça é a distância entre as duas medianas, e ela precisa de um lugar onde
 * nunca colida com marca nenhuma.
 */
export interface CycleComparisonHistogramProps {
  readonly data?: readonly [CycleGroup, CycleGroup];
  readonly binWidth?: number;
  readonly domainMax?: number;
  readonly height?: number;
  readonly className?: string;
}

interface Bin {
  readonly start: number;
  readonly end: number;
  /** Centro do bin: é nele que a barra se apoia no eixo numérico, e é nele que a silhueta apoia o degrau. */
  readonly center: number;
  readonly filledCount: number;
  readonly outlineCount: number;
  /**
   * O mesmo número da silhueta, cortado depois do último bin com caso. A dica continua lendo
   * `outlineCount`, que é a contagem real de toda faixa; este campo existe só para o desenho.
   */
  readonly outlineDraw: number | null;
}

/** Coordenadas que o Recharts entrega ao `shape` da faixa de referência, já em pixel do gráfico. */
interface GapShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
}

/**
 * A margem superior é grande porque a anotação inteira mora nela, em duas alturas: a distância
 * sobre a seta e os dois nomes com suas medianas acima dela. Com a anotação dentro da área de
 * plotagem, o teto do eixo teria que subir de 30 para 40 só para abrir espaço, e o histograma
 * perderia um terço da altura para um vão.
 */
const MARGIN = { top: 38, right: 8, bottom: 4, left: 4 } as const;

const FILLED_COLOR = 'var(--chart-1)';
const OUTLINE_COLOR = 'var(--chart-3)';
/**
 * O revestimento da silhueta, e a razão dele. Medidos os 7 tokens categóricos contra `--chart-1`
 * pela fórmula da WCAG, nenhum chega perto de 3:1 de separação: o melhor é `--chart-8`, com 1,30, e
 * `--chart-3` fica em 1,47 no escuro e 1,03 no claro. As categóricas são calibradas contra o
 * cartão, não umas contra as outras, então trocar de token não resolve a silhueta sumindo por cima
 * da barra. `--surface-raised` resolve: mede 9,50 contra `--chart-1` no escuro e 6,00 no claro. Por
 * isso `--chart-3` fica (é o slot da COR-8 e mede 6,47 e 6,18 contra o cartão, que é o que o faz
 * legível fora das barras) e ganha o contorno da cor da superfície que a COR-5 autoriza.
 */
const OUTLINE_CASING = 'var(--surface-raised)';
/** Marca de base nas faixas vazias dentro da amostra da barra, para o vão ser deliberado e não sumiço. */
const EMPTY_MARK = 'var(--line-strong)';
const EMPTY_MARK_H = 2;
const OUTLINE_WIDTH = 3;
const OUTLINE_CASING_WIDTH = 6;

/**
 * A seta e o texto da distância. `--text-muted` é o token de referência da 17.2 e, por ser token de
 * texto, mede acima de 4,5:1 nos dois temas, então também satisfaz o piso de 3:1 que a ACE-6 pede
 * para traço que carrega relação: aqui a seta é o dado, não enfeite.
 */
const ANNOTATION_COLOR = 'var(--text-muted)';
const ANNOTATION_FONT = 11;
/**
 * Distância da seta ao topo da área de plotagem, e da linha de base do texto de nomes à seta. A seta
 * ficou a 12 px do topo porque a 8 px ela encostava na linha de grade mais alta e passava a parecer
 * parte do gráfico. Os nomes vêm 14 px acima, e não 8: a distância agora é escrita sobre a seta, e
 * com 12 px as duas tintas de 11 px ficariam a 3 px uma da outra. Com 14 px a linha de nomes ocupa
 * de 4 a 15 px do alto do gráfico, dentro da margem de 38 px. Múltiplos de 2 (ESP-1).
 */
const ARROW_LIFT = 12;
const ARROW_HEAD = 5;
const LABEL_GAP = 14;

/** Passos aceitos no eixo de contagem, do mais fino ao mais grosso. */
const Y_STEPS = [2, 5, 10, 20, 25, 50, 100] as const;

/**
 * Teto e passo do eixo de contagem, calculados do dado. O teto é a primeira linha de grade acima do
 * maior bin, e o passo é o primeiro da escada que entrega de 3 a 5 intervalos, que é a faixa da
 * EIX-4 para cartão.
 */
function countAxis(maxCount: number): { top: number; step: number } {
  for (const step of Y_STEPS) {
    const top = Math.ceil(maxCount / step) * step;
    if (top / step >= 3 && top / step <= 5) return { top, step };
  }
  return { top: Math.max(maxCount, 1), step: Math.max(maxCount, 1) };
}

/**
 * Conta as observações dos dois grupos na mesma régua, numa passada só. Bin vazio permanece no array
 * com contagem zero e o array vai do zero ao teto do domínio: se a faixa vazia sumisse, o Recharts
 * encostaria os vizinhos e o buraco desapareceria da leitura.
 */
function bin(filled: readonly number[], outline: readonly number[], width: number, domainMax: number): Bin[] {
  const total = Math.ceil(domainMax / width);
  const count = (values: readonly number[]): number[] => {
    const acc = new Array<number>(total).fill(0);
    for (const value of values) {
      const index = Math.floor(value / width);
      if (index < 0 || index >= total) continue;
      acc[index] = (acc[index] ?? 0) + 1;
    }
    return acc;
  };
  const filledCounts = count(filled);
  const outlineCounts = count(outline);
  /**
   * Onde a amostra da silhueta termina. Depois desse bin a linha para, e não corre rente ao zero até
   * o fim do domínio: ali não há faixa vazia, há fim de amostra, e a mesma distinção vale para a
   * barra, cuja marca de base também só aparece nas faixas vazias de dentro. Linha deitada no zero
   * ao longo de um terço do eixo se lê como série medida em zero, que é outra afirmação.
   */
  const outlineLast = outlineCounts.reduce((last, value, index) => (value > 0 ? index : last), -1);
  return Array.from({ length: total }, (_, index) => ({
    start: index * width,
    end: (index + 1) * width,
    center: index * width + width / 2,
    filledCount: filledCounts[index] ?? 0,
    outlineCount: outlineCounts[index] ?? 0,
    outlineDraw: index <= outlineLast ? (outlineCounts[index] ?? 0) : null,
  }));
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return 0;
  if (sorted.length % 2 === 1) return sorted[middle] ?? 0;
  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

export default function CycleComparisonHistogram({
  data = defaultData,
  binWidth = BIN_WIDTH,
  domainMax = DOMAIN_MAX,
  height,
  className,
}: CycleComparisonHistogramProps) {
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
        <span>Neste recorte um dos dois grupos ficou sem nenhuma oportunidade ganha, e sem os dois não há comparação para desenhar.</span>
      </div>
    );
  }

  const bins = bin(filledGroup.values, outlineGroup.values, binWidth, domainMax);
  const axis = countAxis(bins.reduce((best, item) => Math.max(best, item.filledCount, item.outlineCount), 0));
  const ticks = Array.from({ length: axis.top / axis.step + 1 }, (_, index) => index * axis.step);

  const lastFilled = bins.reduce((last, item, index) => (item.filledCount > 0 ? index : last), -1);

  /**
   * As duas pontas da seta, ordenadas pela posição no eixo e não pela ordem dos grupos. A faixa de
   * referência exige `x1` menor que `x2`, e ler a cor de cada ponta desta lista é o que garante que
   * a marca da esquerda seja sempre a do grupo mais rápido, qualquer que seja o recorte.
   */
  const marks = [
    { value: median(filledGroup.values), color: FILLED_COLOR, label: filledGroup.label },
    { value: median(outlineGroup.values), color: OUTLINE_COLOR, label: outlineGroup.label },
  ].sort((a, b) => a.value - b.value);
  const nearer = marks[0]!;
  const farther = marks[1]!;
  const gap = farther.value - nearer.value;

  /**
   * Barra cheia quando há caso na faixa; traço de base quando a faixa está vazia dentro da amostra.
   * Barra de contagem zero não pinta nada, e sem a marca o vão fica indistinguível de recorte do
   * eixo. Depois do último bin com caso não há marca: ali é o fim da amostra, não buraco.
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

  /**
   * A anotação inteira num desenho só: as duas linhas de mediana, a seta entre elas e o texto da
   * distância. Sai de um `shape` da faixa de referência porque é ele que entrega, em pixel, onde as
   * duas medianas caíram e onde a área de plotagem começa e termina; três elementos separados
   * teriam que refazer a mesma conta três vezes, e qualquer divergência apareceria como seta
   * desencontrada da linha.
   *
   * Cada linha de mediana leva um revestimento na cor da superfície por baixo do tracejado. Sem
   * ele, a mediana do grupo preenchido cruzaria as próprias barras na mesma cor e desapareceria
   * justamente onde a distribuição é mais densa; o revestimento é a separação que a COR-5 autoriza
   * entre vizinhos que não contrastam.
   */
  const renderAnnotation = ({ x, y, width, height: areaHeight }: GapShapeProps): ReactElement => {
    const left = Number(x);
    const right = Number(x) + Number(width);
    const top = Number(y);
    const bottom = Number(y) + Number(areaHeight);
    const arrowY = top - ARROW_LIFT;
    return (
      <g>
        {[
          { at: left, color: nearer.color },
          { at: right, color: farther.color },
        ].map((line) => (
          <g key={line.color}>
            <line stroke="var(--surface-raised)" strokeWidth={4} x1={line.at} x2={line.at} y1={top} y2={bottom} />
            <line stroke={line.color} strokeDasharray="4 4" strokeWidth={1.5} x1={line.at} x2={line.at} y1={top} y2={bottom} />
            <line stroke={ANNOTATION_COLOR} strokeWidth={1} x1={line.at} x2={line.at} y1={arrowY} y2={top} />
          </g>
        ))}
        <line stroke={ANNOTATION_COLOR} strokeWidth={1} x1={left} x2={right} y1={arrowY} y2={arrowY} />
        <polyline
          fill="none"
          points={`${String(left + ARROW_HEAD)},${String(arrowY - ARROW_HEAD)} ${String(left)},${String(arrowY)} ${String(left + ARROW_HEAD)},${String(arrowY + ARROW_HEAD)}`}
          stroke={ANNOTATION_COLOR}
          strokeWidth={1}
        />
        <polyline
          fill="none"
          points={`${String(right - ARROW_HEAD)},${String(arrowY - ARROW_HEAD)} ${String(right)},${String(arrowY)} ${String(right - ARROW_HEAD)},${String(arrowY + ARROW_HEAD)}`}
          stroke={ANNOTATION_COLOR}
          strokeWidth={1}
        />
        {/* A distância vai sobre a própria seta, com halo na cor da superfície (ROT-7), que
            interrompe o traço e transforma a seta numa linha de cota: o número passa a pertencer ao
            vão entre as duas medianas, e não a um ponto do eixo. */}
        <text
          className="font-display"
          dominantBaseline="central"
          fill={ANNOTATION_COLOR}
          fontSize={ANNOTATION_FONT}
          fontWeight={500}
          style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
          textAnchor="middle"
          x={(left + right) / 2}
          y={arrowY}
        >
          {formatDays(gap)}
        </text>
        {/* Cada mediana vem com o nome do grupo e o número na cor do grupo: sem isso o leitor tem que
            adivinhar de quem é cada valor, e a ordem do rótulo, que é a do eixo, contradiz a ordem da
            legenda, que é a dos papéis de desenho. O texto ancora na ponta esquerda da seta e cresce
            para a direita, onde há espaço: centrado, ele passaria da borda esquerda da área. */}
        <text
          className="font-display"
          fill={ANNOTATION_COLOR}
          fontSize={ANNOTATION_FONT}
          fontWeight={500}
          textAnchor="start"
          x={left}
          y={arrowY - LABEL_GAP}
        >
          {`mediana: ${nearer.label.toLowerCase()} `}
          <tspan fill={nearer.color}>{formatInt(nearer.value)}</tspan>
          {`, ${farther.label.toLowerCase()} `}
          <tspan fill={farther.color}>{formatInt(farther.value)}</tspan>
          {' dias'}
        </text>
      </g>
    );
  };

  const summary =
    `Histograma comparativo do ciclo de fechamento de duas carteiras, em faixas de ${formatDays(binWidth)}. ` +
    `${filledGroup.label}, n ${formatInt(filledGroup.values.length)}, tem mediana de ${formatDays(median(filledGroup.values))}, ` +
    `contra ${formatDays(median(outlineGroup.values))} de ${outlineGroup.label.toLowerCase()}, n ${formatInt(outlineGroup.values.length)}: ` +
    `${formatDays(gap)} de diferença.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      {/* O nome do eixo Y à esquerda e a legenda à direita na mesma linha: são as duas coisas que
          precisam ser lidas antes do gráfico, e em cartão de 360 px cada linha extra sai da altura
          da distribuição. O respiro entre os dois textos é o `justify-between` com vão mínimo (ROT-9). */}
      <div aria-hidden className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-1 leading-4">
        <span className="text-[0.6875rem] text-text-muted">oportunidades ganhas</span>
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

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} barCategoryGap={0} data={bins} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              dataKey="center"
              domain={[0, domainMax]}
              interval="preserveStartEnd"
              tickCount={8}
              tickFormatter={(value: number) => formatInt(value)}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              domain={[0, axis.top]}
              tickFormatter={(value: number) => formatInt(value)}
              ticks={ticks}
              width={28}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active !== true) return null;
                const item = payload?.[0]?.payload as Bin | undefined;
                if (item === undefined) return null;
                return (
                  <div className="rounded border border-line-subtle bg-surface-overlay px-2 py-1 text-xs text-text-primary shadow-lg">
                    <p className="font-display tabular-nums">{`${formatInt(item.start)} a ${formatDays(item.end)}`}</p>
                    <p className="tabular-nums text-text-secondary">
                      {`${filledGroup.label}, ${formatInt(item.filledCount)}`}
                    </p>
                    <p className="tabular-nums text-text-secondary">
                      {`${outlineGroup.label}, ${formatInt(item.outlineCount)}`}
                    </p>
                  </div>
                );
              }}
              cursor={{ fill: 'var(--line-subtle)' }}
            />
            {/* Uma série de barra só, e por isso as barras encostam: a banda do bin não é repartida
                com ninguém. A marca da faixa vazia sai do mesmo `shape`, e não de uma segunda série. */}
            <Bar dataKey="filledCount" fill={FILLED_COLOR} isAnimationActive={animate} shape={renderBin} />
            {/* A silhueta do segundo grupo. `type="step"` vira o degrau com a transição no limite do
                bin, que é o contorno do histograma e não uma interpolação entre centros. Sem ponto:
                a marca é a forma, e um ponto por bin daria 30 pontos por cima das barras. */}
            <Line
              activeDot={false}
              connectNulls={false}
              dataKey="outlineDraw"
              dot={false}
              isAnimationActive={animate}
              stroke={OUTLINE_CASING}
              strokeWidth={OUTLINE_CASING_WIDTH}
              type="step"
            />
            <Line
              activeDot={false}
              connectNulls={false}
              dataKey="outlineDraw"
              dot={false}
              isAnimationActive={animate}
              stroke={OUTLINE_COLOR}
              strokeWidth={OUTLINE_WIDTH}
              type="step"
            />
            <ReferenceArea
              fill="none"
              ifOverflow="extendDomain"
              shape={renderAnnotation}
              x1={nearer.value}
              x2={farther.value}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`ciclo em dias, faixas de ${formatDays(binWidth)} para os dois grupos`}</span>
        <span className="tabular-nums">{`domínio fixo de 0 a ${formatDays(domainMax)}, da métrica e não da amostra`}</span>
        {/* A ausência vem nomeada por grupo, e não como um total só: falha de cadastro não é igual
            nas duas carteiras, e o total esconderia de qual delas a amostra saiu mais furada. */}
        <span className="tabular-nums">
          {`${formatInt(filledGroup.withoutCycle + outlineGroup.withoutCycle)} ganhas sem data de criação ficaram fora: ` +
            `${formatInt(filledGroup.withoutCycle)} de ${filledGroup.label.toLowerCase()} e ` +
            `${formatInt(outlineGroup.withoutCycle)} de ${outlineGroup.label.toLowerCase()}`}
        </span>
      </div>
    </figure>
  );
}
