import type { ReactElement } from 'react';
import { Unplug } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BIN_WIDTH, data as defaultData, DOMAIN_MAX, WITHOUT_CYCLE } from './data';

/**
 * Histograma com a estatística anotada: o mesmo ciclo da v1 deste modelo, com mediana, média e a
 * faixa interquartil desenhadas por cima. Esta versão não existe para mostrar a forma; existe para
 * mostrar que a média citada no cartão não é o caso típico.
 *
 * Quatro decisões carregam a peça.
 *
 * A primeira é que **toda estatística nasce `null` na amostra vazia, nunca zero**. A mediana de
 * lista vazia devolvendo `0` é um defeito com nome no acervo: o zero entra como medição e a peça
 * escreve "metade fecha em até 0 dias" num recorte em que ninguém fechou nada. Aqui a guarda de
 * vazio testa `data`, que é **a lista que alimenta a conta**, e não uma lista vizinha; sem amostra,
 * o gráfico é substituído pelo estado de indisponível e nenhuma linha é plantada na origem do eixo.
 *
 * A segunda é o par de canais de cada linha. Mediana é sólida em `--chart-2`, média é tracejada em
 * `--text-muted`: forma e cor mudam juntas, porque cor sozinha não distingue as duas para quem não
 * a vê (ACE-2). Cada linha leva um revestimento na cor da superfície por baixo, senão ela
 * desapareceria dentro das próprias barras justamente onde a distribuição é mais densa.
 *
 * A terceira é que os dois rótulos moram na **margem superior**, fora da área de plotagem. Rótulo
 * de referência dentro da área colide com a primeira faixa alta que aparecer, e a faixa alta deste
 * histograma está exatamente entre a mediana e a média.
 *
 * A quarta é a faixa interquartil. Ela entra em `--line-subtle`, e não em `--surface-raised`, que o
 * estudo prescrevia: no tema claro `--surface-raised` é o mesmo branco do cartão, então a faixa
 * mediria 1,00:1 e simplesmente não existiria. E ela leva o nome dentro do desenho, ancorado à
 * direita, onde a linha da média não o cruza.
 */
export interface CycleMeanVersusMedianProps {
  readonly data?: readonly number[];
  readonly binWidth?: number;
  readonly domainMax?: number;
  readonly withoutCycle?: number;
  readonly height?: number;
  readonly className?: string;
}

interface Bin {
  readonly start: number;
  readonly end: number;
  /** Centro do bin: é nele que a barra se apoia no eixo numérico. */
  readonly center: number;
  readonly count: number;
}

/** As cinco medidas que a peça escreve, calculadas de uma vez só sobre a amostra desenhada. */
interface Stats {
  readonly median: number;
  readonly mean: number;
  readonly p25: number;
  readonly p75: number;
  /** Quantos negócios ficam **abaixo** da média: é o número que mede o quanto ela mente. */
  readonly belowMean: number;
}

/** Coordenadas que o Recharts entrega ao `shape` da faixa de referência, já em pixel do gráfico. */
interface MarkShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
}

/**
 * A margem superior guarda a linha de rótulos das duas estatísticas, e é por isso que ela tem 24 px
 * e não 8: com o rótulo dentro da área de plotagem ele cai sobre a faixa mais cheia, que neste
 * histograma fica entre a mediana e a média. Múltiplos de 2 px (ESP-1).
 */
const MARGIN = { top: 24, right: 8, bottom: 4, left: 4 } as const;
const BAR_FILL = 'var(--chart-1)';
const MEDIAN_COLOR = 'var(--chart-2)';
const MEAN_COLOR = 'var(--text-muted)';
/**
 * A faixa interquartil. `--line-subtle` e não `--surface-sunken`, que era a outra saída que a
 * armadilha 39 oferece: no tema escuro o poço rebaixado é quase preto contra o cartão e a faixa
 * lê como um buraco recortado no gráfico, o oposto do que ela afirma; `--line-subtle` é mais claro
 * que o cartão no escuro e mais escuro no claro, então nos dois temas ela lê como região marcada.
 * E `--surface-raised`, que o estudo prescrevia, é o próprio fundo do cartão: 1,00:1 no claro.
 */
const BAND_FILL = 'var(--line-subtle)';
const BAND_LABEL_COLOR = 'var(--text-secondary)';
/**
 * Marca de base nas faixas vazias de dentro da amostra. A v1 deste modelo usa `--line-strong` aqui,
 * medido em 1,79:1 no escuro e 1,83:1 no claro contra o cartão, ou seja, abaixo do piso de 3:1 da
 * marca. Esta versão usa `--text-muted`, que mede acima de 5:1 nos dois temas: é a mesma saída que
 * as armadilhas 39 e 43 prescrevem para o traço que é a única marca do que ele afirma.
 */
const EMPTY_MARK = 'var(--text-muted)';
const EMPTY_MARK_H = 2;
/** Revestimento da linha de estatística, para ela não se perder dentro da barra (COR-5). */
const CASING_COLOR = 'var(--surface-raised)';
const CASING_WIDTH = 4;
const MARK_WIDTH = 1.5;
const LABEL_FONT = 11;
/** Distância da linha de base do rótulo ao topo da área, e o toco que liga o rótulo à linha. */
const LABEL_LIFT = 7;
const STEM = 5;
/**
 * Abaixo desta distância em pixel os dois rótulos deixam de ser dois e viram um bloco só. Não é a
 * largura do texto: com âncoras divergentes, cada rótulo cresce para longe do outro e eles nunca se
 * tocam. O que 48 px marca é o ponto em que as duas **linhas** ficam tão próximas que dois rótulos
 * separados leem como um borrão e os tocos se cruzam.
 */
const COLLAPSE_PX = 48;
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
  const fallback = Math.max(maxCount, 1);
  return { top: fallback, step: fallback };
}

/**
 * Conta quantas observações caem em cada faixa. O bin vazio **permanece** no array, com contagem
 * zero, e o array vai do zero ao teto do domínio, não ao maior valor observado.
 */
function bin(values: readonly number[], width: number, domainMax: number): Bin[] {
  const total = Math.ceil(domainMax / width);
  const counts = new Array<number>(total).fill(0);
  for (const value of values) {
    const index = Math.floor(value / width);
    if (index < 0 || index >= total) continue;
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts.map((count, index) => ({
    start: index * width,
    end: (index + 1) * width,
    center: index * width + width / 2,
    count,
  }));
}

/**
 * Quantil por **interpolação linear** sobre `(n − 1) · p`, que é a convenção declarada desta
 * família: o mesmo método do box plot do modelo 02, para dois cartões irmãos não discordarem sobre
 * onde está o p75 da mesma amostra.
 */
function quantile(sorted: readonly number[], p: number): number {
  const position = (sorted.length - 1) * p;
  const low = Math.floor(position);
  const high = Math.ceil(position);
  const base = sorted[low] ?? 0;
  if (low === high) return base;
  return base + ((sorted[high] ?? base) - base) * (position - low);
}

/**
 * As medidas da amostra, ou `null` quando não há amostra.
 *
 * O `null` é a decisão, e não um detalhe de implementação. Doze de quinze implementações de mediana
 * do acervo devolvem `0` para lista vazia, e esse zero chega à tela como medição: "metade fecha em
 * até 0 dias" num recorte em que ninguém fechou nada. Devolvendo `null`, o caso vazio só tem uma
 * saída possível, que é o estado de indisponível.
 */
function summarize(values: readonly number[]): Stats | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return {
    median: quantile(sorted, 0.5),
    mean,
    p25: quantile(sorted, 0.25),
    p75: quantile(sorted, 0.75),
    belowMean: values.filter((value) => value < mean).length,
  };
}

export default function CycleMeanVersusMedian({
  data = defaultData,
  binWidth = BIN_WIDTH,
  domainMax = DOMAIN_MAX,
  withoutCycle = WITHOUT_CYCLE,
  height,
  className,
}: CycleMeanVersusMedianProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  /** A guarda testa `data`, a lista que alimenta as duas estatísticas, e não uma lista vizinha. */
  const stats = summarize(data);

  if (stats === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>
          {`Mediana e média ${formatUnavailable().toLowerCase()}: neste recorte nenhuma oportunidade ganha tem ciclo calculável, e sem amostra as duas linhas seriam zero inventado.`}
        </span>
      </div>
    );
  }

  const bins = bin(data, binWidth, domainMax);
  const axis = countAxis(bins.reduce((best, item) => Math.max(best, item.count), 0));
  const ticks = Array.from({ length: axis.top / axis.step + 1 }, (_, index) => index * axis.step);

  /**
   * Primeira e última faixa com caso. A v1 deste modelo marca como buraco toda faixa vazia antes da
   * última com caso, o que inclui as faixas vazias **antes da primeira**: ali não há buraco, há
   * começo de amostra. Guardar as duas pontas é o que separa vão de borda.
   */
  const firstFilled = bins.findIndex((item) => item.count > 0);
  const lastFilled = bins.reduce((last, item, index) => (item.count > 0 ? index : last), -1);
  const hole = bins.find((item, index) => item.count === 0 && index > firstFilled && index < lastFilled);

  const medianDays = Math.round(stats.median);
  const meanDays = Math.round(stats.mean);
  /**
   * As duas marcas ordenadas pela **posição no eixo**, e não pelo papel. A faixa de referência
   * exige `x1` menor que `x2`, e ler a ordem desta lista é o que garante que o rótulo da esquerda
   * cresça para a esquerda em qualquer recorte, inclusive num em que a média fique abaixo da
   * mediana (distribuição de cauda à esquerda, que existe em ciclo de renovação).
   */
  const marks = [
    { at: stats.median, color: MEDIAN_COLOR, dash: undefined, label: `mediana ${formatDays(medianDays)}` },
    { at: stats.mean, color: MEAN_COLOR, dash: '4 3', label: `média ${formatDays(meanDays)}` },
  ].sort((a, b) => a.at - b.at);
  const nearer = marks[0]!;
  const farther = marks[1]!;

  /** O texto que mede o quanto a média mente, calculado uma vez e usado na frase e no corpo. */
  const belowMeanText = formatRateWithVolume(stats.belowMean, data.length);
  const summary =
    `Histograma do ciclo de fechamento de ${formatInt(data.length)} oportunidades ganhas, em faixas de ${formatDays(binWidth)}. ` +
    `A mediana fica em ${formatDays(medianDays)} e a média em ${formatDays(meanDays)}, ` +
    `acima de ${belowMeanText} dos negócios: o típico é a mediana.`;

  /**
   * Barra cheia quando há caso na faixa; traço de base quando a faixa está vazia **dentro** da
   * amostra. A barra de contagem zero não pinta nada, e sem a marca o vão fica indistinguível de
   * recorte do eixo. Fora do intervalo entre a primeira e a última faixa com caso não há marca: ali
   * é borda de amostra, não buraco.
   */
  const renderBin = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const item = bins[Number(index)];
    const left = Number(x);
    const span = Number(width);
    if (item !== undefined && item.count === 0) {
      const inside = Number(index) > firstFilled && Number(index) < lastFilled;
      const baseline = Number(y);
      return inside ? (
        <rect fill={EMPTY_MARK} height={EMPTY_MARK_H} width={span} x={left} y={baseline - EMPTY_MARK_H} />
      ) : (
        <g />
      );
    }
    return <rect fill={BAR_FILL} height={Number(barHeight)} width={span} x={left} y={Number(y)} />;
  };

  /**
   * A faixa interquartil e o nome dela, no mesmo `shape`. O nome vai **dentro** do desenho, e não
   * numa amostra de legenda: a ROT-4 só admite legenda quando o rótulo direto não cabe, e aqui ele
   * cabe.
   *
   * **O rótulo carrega o intervalo, e não só o nome, e isso conserta uma leitura errada medida no
   * PNG.** A faixa fica atrás das barras, que é onde ela deve ficar; o efeito colateral é que entre
   * o p25 e a mediana as barras são altas e cobrem a borda esquerda dela. Sobra visível só o trecho
   * da mediana para a direita, e o desenho sozinho passa a sugerir que a metade dos casos começa na
   * mediana, que é exatamente a conclusão que esta versão existe para desmontar. Com "35 a 120
   * dias" escrito, a leitura deixa de depender de enxergar onde a faixa começa. É a mesma saída do
   * `05_histograma-comparativo/v1`, em que a anotação passou a nomear os grupos em vez de confiar
   * na ordem do desenho.
   *
   * O bloco fica no lado da faixa **mais distante da linha da média**, calculado em pixel a partir
   * do próprio retângulo: em marca de traço fino quem sai do lugar é o rótulo, nunca a marca
   * (ROT-7), e essa regra vale em qualquer recorte, inclusive num em que a média caia à esquerda da
   * mediana. Duas linhas curtas em vez de uma longa, porque uma linha com o nome e o intervalo
   * juntos mede mais que meia faixa e voltaria a cruzar a média.
   *
   * A cor do texto é `--text-secondary` e não `--text-muted`, e isso foi medido: sobre a faixa,
   * `--text-muted` entrega 4,17:1 nos dois temas, abaixo do piso de 4,5:1 da ACE-3, enquanto
   * `--text-secondary` entrega 6,52:1 no escuro e 6,30:1 no claro. Trocar a cor é preferível ao
   * halo da ROT-7 aqui, porque o halo pintaria um borrão da cor do cartão dentro da faixa,
   * justamente sobre a marca que ele deveria deixar ver.
   */
  const renderBand = ({ x, y, width, height: areaHeight }: MarkShapeProps): ReactElement => {
    const left = Number(x);
    const right = Number(x) + Number(width);
    const top = Number(y);
    /** Onde a linha da média cai dentro da faixa, em pixel. O eixo é linear, então é regra de três. */
    const meanAt = left + ((stats.mean - stats.p25) / (stats.p75 - stats.p25)) * (right - left);
    const onRight = meanAt - left < right - meanAt;
    const anchorX = onRight ? right - 6 : left + 6;
    return (
      <g>
        <rect fill={BAND_FILL} height={Number(areaHeight)} width={right - left} x={left} y={top} />
        <text
          className="font-display"
          fill={BAND_LABEL_COLOR}
          fontSize={LABEL_FONT}
          fontWeight={500}
          textAnchor={onRight ? 'end' : 'start'}
          x={anchorX}
          y={top + 14}
        >
          metade dos casos
        </text>
        <text
          className="font-display"
          fill={BAND_LABEL_COLOR}
          fontSize={LABEL_FONT}
          textAnchor={onRight ? 'end' : 'start'}
          x={anchorX}
          y={top + 28}
        >
          {`${formatInt(Math.round(stats.p25))} a ${formatDays(Math.round(stats.p75))}`}
        </text>
      </g>
    );
  };

  /**
   * As duas linhas, os dois tocos e os dois rótulos num desenho só. Sai de um `shape` da faixa de
   * referência porque é ele que entrega, em pixel, onde a mediana e a média caíram e onde a área de
   * plotagem começa e termina; três elementos separados refariam a mesma conta de escala três vezes
   * e qualquer divergência apareceria como rótulo desencontrado da sua linha. O `shape` também pode
   * desenhar dentro da margem sem ser recortado, que é onde o rótulo tem que morar (ANO-3).
   */
  const renderMarks = ({ x, y, width, height: areaHeight }: MarkShapeProps): ReactElement => {
    const left = Number(x);
    const right = Number(x) + Number(width);
    const top = Number(y);
    const bottom = Number(y) + Number(areaHeight);
    const baseline = top - LABEL_LIFT;
    const collapsed = right - left < COLLAPSE_PX;
    return (
      <g>
        {[
          { at: left, mark: nearer },
          { at: right, mark: farther },
        ].map(({ at, mark }) => (
          <g key={mark.label}>
            <line stroke={CASING_COLOR} strokeWidth={CASING_WIDTH} x1={at} x2={at} y1={top} y2={bottom} />
            <line
              stroke={mark.color}
              strokeDasharray={mark.dash}
              strokeWidth={MARK_WIDTH}
              x1={at}
              x2={at}
              y1={top}
              y2={bottom}
            />
            {/* O toco sobe na cor da própria estatística, e não num neutro comum: é ele que liga o
                rótulo da margem à linha de dentro, e com cor neutra o leitor teria que adivinhar
                qual toco pertence a qual rótulo quando os dois ficam próximos. */}
            <line stroke={mark.color} strokeWidth={1} x1={at} x2={at} y1={top - STEM} y2={top} />
          </g>
        ))}
        {collapsed ? (
          /* As duas linhas quase no mesmo pixel: um bloco só, centrado no vão entre elas, com a cor
             de cada estatística dentro do próprio número. Dois rótulos separados aqui leriam como
             um borrão e os dois tocos se cruzariam. */
          <text
            className="font-display"
            fontSize={LABEL_FONT}
            fontWeight={500}
            textAnchor="middle"
            x={(left + right) / 2}
            y={baseline}
          >
            <tspan fill={nearer.color}>{nearer.label}</tspan>
            <tspan fill={MEAN_COLOR}>{' · '}</tspan>
            <tspan fill={farther.color}>{farther.label}</tspan>
          </text>
        ) : (
          /* Âncoras divergentes: o rótulo da esquerda termina antes da sua linha e o da direita
             começa depois da dele, então os dois crescem para longe um do outro e o espaço entre as
             linhas nunca é disputado (ROT-9). */
          <>
            <text
              className="font-display"
              fill={nearer.color}
              fontSize={LABEL_FONT}
              fontWeight={500}
              textAnchor="end"
              x={left - 4}
              y={baseline}
            >
              {nearer.label}
            </text>
            <text
              className="font-display"
              fill={farther.color}
              fontSize={LABEL_FONT}
              fontWeight={500}
              textAnchor="start"
              x={right + 4}
              y={baseline}
            >
              {farther.label}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      {/* Linha de leitura da ANO-5: a conclusão da peça, calculada do dado, na primeira linha que o
          olho encontra. No rodapé ela chegaria depois do desenho, e a mensagem do cartão não pode
          depender de o leitor descer até o fim. */}
      <p aria-hidden className="shrink-0 tabular-nums text-xs leading-4 text-text-secondary">
        {`A média de ${formatDays(meanDays)} fica acima de ${belowMeanText} dos negócios; o típico são os ${formatDays(medianDays)} da mediana.`}
      </p>

      {/* O nome do eixo Y vive aqui, e não rotacionado na lateral: em 11 px o texto vertical é o
          primeiro a ser ignorado, e é justamente ele que impede ler altura como dinheiro. */}
      <span aria-hidden className="shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        oportunidades ganhas
      </span>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={0} data={bins} margin={MARGIN}>
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
                      {`${formatInt(item.count)} ${item.count === 1 ? 'oportunidade' : 'oportunidades'}`}
                    </p>
                  </div>
                );
              }}
              cursor={{ fill: 'var(--line-subtle)' }}
            />
            {/* A faixa interquartil fica atrás das barras: `zIndex` menor que o do `Bar`, que é 300.
                Opaca, e não com a opacidade de 0,5 que o Recharts assume por padrão: opacidade em
                marca é perda de contraste medida, e esta faixa já é o token mais discreto que existe
                (ACE-5). */}
            <ReferenceArea
              fill="none"
              ifOverflow="extendDomain"
              shape={renderBand}
              x1={stats.p25}
              x2={stats.p75}
              zIndex={100}
            />
            <Bar dataKey="count" fill={BAR_FILL} isAnimationActive={animate} shape={renderBin} />
            {/* E a anotação por cima de tudo: `zIndex` acima do `Bar`, senão as duas linhas ficariam
                atrás das barras e sumiriam onde a distribuição é mais densa. */}
            <ReferenceArea
              fill="none"
              ifOverflow="extendDomain"
              shape={renderMarks}
              x1={nearer.at}
              x2={farther.at}
              zIndex={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`ciclo em dias, faixas de ${formatDays(binWidth)}`}</span>
        <span className="tabular-nums">{`n ${formatInt(data.length)} oportunidades ganhas`}</span>
        <span className="tabular-nums">{`faixa típica de ${formatInt(Math.round(stats.p25))} a ${formatDays(Math.round(stats.p75))}`}</span>
        <span className="tabular-nums">{`domínio fixo de 0 a ${formatDays(domainMax)}, da métrica e não da amostra`}</span>
        {hole === undefined ? null : (
          <span className="tabular-nums">{`nenhum negócio fechou entre ${formatInt(hole.start)} e ${formatDays(hole.end)}`}</span>
        )}
        {withoutCycle <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(withoutCycle)} ganhas sem data de criação ficaram fora`}</span>
        )}
      </div>
    </figure>
  );
}
