import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type BarShapeProps,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, DOMAIN_MAX, MIN_BOX_N, WITHOUT_QUALIFIED, type MediaKind } from './data';

/**
 * Box plot entalhado, com a largura de cada caixa proporcional à raiz da amostra.
 *
 * As duas coisas que o desenho acrescenta respondem à mesma pergunta: a diferença entre estas
 * medianas é grande o bastante para decidir onde cortar verba, ou é tamanho de amostra?
 *
 * A largura responde à primeira metade. Caixa larga é grupo com muitas campanhas, caixa estreita é
 * grupo com poucas, e a raiz da amostra é a escala certa porque a incerteza da mediana cai com a raiz
 * de `n`, não com `n`. O entalhe responde à segunda: ele é 1,58 vez o interquartil sobre a raiz de `n`,
 * e a leitura é de comparação, não de valor. Entalhes que não se cruzam indicam medianas diferentes.
 *
 * Duas situações de borda estão no dado de propósito, porque as duas produzem desenho errado quando
 * ninguém as trata. Numa delas o entalhe é maior que a própria caixa, o que desenharia um losango
 * invertido saindo pelos lados dela; a caixa é cortada nos quartis e o entalhe passa a tracejado, com
 * o aviso de amostra pequena. Na outra o grupo tem quatro campanhas, e quartil sobre quatro casos
 * descreve a amostra inteira como se fosse a metade central: ali não há caixa, só os quatro pontos.
 *
 * Um desvio da especificação do catálogo, declarado no `meta.json`: a largura pela raiz pura levaria a
 * caixa do grupo de nove campanhas a 10,4 px, abaixo do piso de 12 px da ESP-2, então a raiz vale até
 * o piso e para ali. A legenda de largura escreve o `n` dos dois extremos observados, nunca uma
 * constante, e o maior deles sai do dado antes de qualquer filtro.
 */
export interface NotchedCplBoxPlotProps {
  readonly data?: readonly MediaKind[];
  readonly domainMax?: number;
  readonly minBoxN?: number;
  readonly withoutQualified?: number;
  readonly height?: number;
  readonly className?: string;
}

/** Os cinco números da caixa. `null` no lugar deste objeto quando não há amostra que os sustente. */
interface BoxFive {
  readonly q1: number;
  readonly median: number;
  readonly q3: number;
  readonly whiskerLow: number;
  readonly whiskerHigh: number;
}

interface KindRow {
  readonly id: string;
  readonly name: string;
  readonly n: number;
  /** `null` quando a amostra é menor que o piso. Quartil sobre quatro casos não é metade central. */
  readonly box: BoxFive | null;
  /** Mediana da amostra, mesmo sem caixa, para a ordenação e para a frase. `null` sem amostra. */
  readonly median: number | null;
  readonly values: readonly number[];
  /** Meia amplitude do entalhe, em reais. `null` quando não há caixa a entalhar. */
  readonly notch: number | null;
  /** Verdadeiro quando o entalhe passa de um dos quartis e precisa ser cortado. */
  readonly notchClipped: boolean;
  /** Valores além das cercas de Tukey, desenhados como pontos na banda do grupo. Vazio sem caixa. */
  readonly beyond: readonly number[];
}

const MARGIN = { top: 22, right: 12, bottom: 4, left: 4 } as const;
const BOX_STROKE = 'var(--chart-1)';
const MEDIAN_FILL = 'var(--chart-1)';
const WHISKER_STROKE = 'var(--text-muted)';
const POINT_FILL = 'var(--text-muted)';
const Y_AXIS_WIDTH = 60;
const Y_TICKS = [0, 140, 280, 420, 560] as const;
/** Vão de 35% por lado: pela ESP-6 sobram 30% da banda, e o teto de 24 px da ESP-2 limita o resto. */
const BAR_CATEGORY_GAP = '35%';
const BOX_MAX_W = 24;
/** Piso de espessura da ESP-2 em cartão. A raiz da amostra encolhe a caixa até aqui e para. */
const BOX_MIN_W = 12;
const MEDIAN_H = 2;
/** Constante clássica do entalhe: 1,58 vez o interquartil sobre a raiz da amostra. */
const NOTCH_FACTOR = 1.58;
/** Fração da largura que sobra na cintura do entalhe. */
const NOTCH_WAIST = 0.55;
/** Cerca de Tukey: o bigode para no último valor a esta distância da caixa. */
const FENCE_FACTOR = 1.5;
const POINT_R = 2.6;
const ANNOTATION_Z = 2;
const COUNT_FONT = 11;
const LEGEND_BOX_H = 9;
const LEGEND_GAP = 4;

/**
 * Quartil por interpolação linear, a convenção declarada no rodapé.
 *
 * Devolve `null` para lista vazia, nunca `0`: caixa de quartis zerados nasce colada no zero do eixo e
 * se lê como o tipo de mídia mais barato da grade, num recorte em que nada foi medido.
 */
function quantile(sorted: readonly number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const position = (sorted.length - 1) * p;
  const base = Math.floor(position);
  const value = sorted[base];
  if (value === undefined) return null;
  const next = sorted[base + 1];
  if (next === undefined) return value;
  return value + (position - base) * (next - value);
}

/** Os cinco números do grupo, ou `null` quando ele não tem observação que os sustente. */
function five(sorted: readonly number[]): BoxFive | null {
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  if (q1 === null || median === null || q3 === null) return null;
  const iqr = q3 - q1;
  const inside = sorted.filter((value) => value >= q1 - FENCE_FACTOR * iqr && value <= q3 + FENCE_FACTOR * iqr);
  const low = inside[0];
  const high = inside[inside.length - 1];
  return {
    q1,
    median,
    q3,
    whiskerLow: low === undefined ? q1 : low,
    whiskerHigh: high === undefined ? q3 : high,
  };
}

function summarize(kind: MediaKind, minBoxN: number): KindRow {
  const sorted = kind.campaigns.map((campaign) => campaign.cpl).sort((a, b) => a - b);
  const median = quantile(sorted, 0.5);
  const box = sorted.length < minBoxN ? null : five(sorted);
  const notch = box === null ? null : (NOTCH_FACTOR * (box.q3 - box.q1)) / Math.sqrt(sorted.length);
  return {
    id: kind.id,
    name: kind.name,
    n: sorted.length,
    box,
    median,
    values: sorted,
    beyond:
      box === null
        ? []
        : sorted.filter(
            (value) =>
              value < box.q1 - FENCE_FACTOR * (box.q3 - box.q1) || value > box.q3 + FENCE_FACTOR * (box.q3 - box.q1),
          ),
    notch,
    notchClipped:
      box === null || notch === null
        ? false
        : box.median + notch > box.q3 || box.median - notch < box.q1,
  };
}

/**
 * Largura da caixa em pixels, pela raiz da amostra contra a maior amostra observada.
 *
 * A raiz é a escala honesta porque a incerteza da mediana cai com a raiz de `n`. O piso existe porque a
 * ESP-2 mede a espessura no desenho e não admite exceção por falta de amostra: abaixo de 12 px a caixa
 * deixa de ser legível, e quem cede é a régua de tamanho, não o piso.
 */
function widthFor(n: number, nMax: number): number {
  if (nMax <= 0) return BOX_MIN_W;
  return Math.max(BOX_MIN_W, BOX_MAX_W * Math.sqrt(n / nMax));
}

/**
 * O `n` de cada grupo e os pontos do grupo sem caixa, posicionados pelas escalas do próprio gráfico.
 *
 * Vive à parte porque as duas coisas precisam da escala de categoria e da área de plotagem, que só
 * existem depois que o Recharts resolve o painel: constante no lugar delas seria chute, e o chute só
 * aparece no PNG, com o ponto fora da banda a que pertence.
 */
function GroupAnnotations({ rows }: { readonly rows: readonly KindRow[] }) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (!xScale || !yScale || !plot) return null;

  return (
    <ZIndexLayer zIndex={ANNOTATION_Z}>
      {rows.map((row) => {
        const center = xScale(row.name, { position: 'middle' });
        if (center === undefined) return null;
        const middle = Number(center);
        return (
          <g key={row.id}>
            {/* O n fica na margem reservada do topo, e não no tique de categoria: no tique ele somaria
                cerca de 40 px ao nome e os rótulos de grupos vizinhos passariam a encostar (ROT-9). */}
            <text
              className="font-display"
              fill="var(--text-muted)"
              fontSize={COUNT_FONT}
              textAnchor="middle"
              x={middle}
              y={plot.y - 8}
            >
              {`n ${formatInt(row.n)}`}
            </text>
            {/* Grupo sem caixa: cada campanha como ponto, e nada mais. Caixa sobre quatro casos
                afirmaria uma metade central que é praticamente a amostra inteira. */}
            {(row.box !== null ? row.beyond : row.values).map((value, index) => {
                  const cy = yScale(value);
                  if (cy === undefined) return null;
                  return (
                    <circle
                      cx={middle}
                      cy={Number(cy)}
                      fill={POINT_FILL}
                      key={`${row.id}-${String(index)}`}
                      r={POINT_R}
                      stroke="var(--surface-raised)"
                      strokeWidth={0.5}
                    />
                  );
                })}
          </g>
        );
      })}
    </ZIndexLayer>
  );
}

export default function NotchedCplBoxPlot({
  data = defaultData,
  domainMax = DOMAIN_MAX,
  minBoxN = MIN_BOX_N,
  withoutQualified = WITHOUT_QUALIFIED,
  height,
  className,
}: NotchedCplBoxPlotProps) {
  /**
   * A maior amostra sai de TODOS os grupos que chegaram, antes de qualquer filtro de piso. Calculada
   * só sobre os que ganham caixa, a régua de largura mudaria de significado a cada recorte, e a caixa
   * mais larga da tela passaria a valer um número diferente sem nada na tela avisando.
   */
  const nMax = data.reduce((most, kind) => (kind.campaigns.length > most ? kind.campaigns.length : most), 0);

  /**
   * Ordem por mediana crescente, da esquerda para a direita. Grupo sem mediana medida vai para o fim,
   * porque ele não tem valor a comparar, e não porque seja o mais caro.
   */
  const rows = data
    .map((kind) => summarize(kind, minBoxN))
    .sort((a, b) => {
      if (a.median === null || b.median === null) {
        return (a.median === null ? 1 : 0) - (b.median === null ? 1 : 0);
      }
      return a.median - b.median;
    });

  const withBox = rows.filter((row): row is KindRow & { box: BoxFive; notch: number } => row.box !== null && row.notch !== null);
  const measured = rows.filter((row): row is KindRow & { median: number } => row.median !== null);
  const total = rows.reduce((sum, row) => sum + row.n, 0);
  const cheapest = measured.reduce<(KindRow & { median: number }) | null>(
    (best, row) => (best === null || row.median < best.median ? row : best),
    null,
  );
  const priciest = measured.reduce<(KindRow & { median: number }) | null>(
    (worst, row) => (worst === null || row.median > worst.median ? row : worst),
    null,
  );
  const withoutBox = rows.filter((row) => row.box === null);
  const clipped = rows.filter((row) => row.notchClipped);
  const beyondCount = rows.reduce((sum, row) => sum + row.beyond.length, 0);

  /** O menor e o maior `n` com caixa, que são os dois degraus da régua de largura. Nunca constante. */
  const nSmallest = withBox.reduce<number | null>(
    (least, row) => (least === null || row.n < least ? row.n : least),
    null,
  );

  /**
   * Caixa entalhada em dez vértices, mediana e os dois trechos de bigode, no mesmo `shape`.
   *
   * A largura vem daqui e não do `maxBarSize`, porque ela muda por grupo: o Recharts entrega a banda
   * já descontada do vão e a caixa é recentrada dentro dela. O bigode sai em dois trechos, de
   * `whiskerLow` a `q1` e de `q3` a `whiskerHigh`, e nunca numa linha atravessando a caixa: linha
   * contínua por dentro lê como uma segunda mediana, que é o defeito do `ErrorBar` do exemplo oficial
   * do Recharts, que mede a distância a partir de Q3.
   */
  const renderBox = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = rows[Number(index)];
    if (row === undefined || row.box === null || row.notch === null) return <g />;
    const box = row.box;
    const iqr = box.q3 - box.q1;
    const pixels = Number(barHeight);

    /* Interquartil zero não tem escala de real por pixel, e por isso a saída é outra em vez de uma
       escala valendo zero: o zero aqui empilharia bigode, entalhe e mediana na mesma linha. */
    if (iqr <= 0) {
      return (
        <g>
          <rect
            fill="none"
            height={MEDIAN_H}
            stroke={BOX_STROKE}
            strokeWidth={1}
            width={widthFor(row.n, nMax)}
            x={Number(x) + Number(width) / 2 - widthFor(row.n, nMax) / 2}
            y={Number(y) - MEDIAN_H / 2}
          />
        </g>
      );
    }

    const span = widthFor(row.n, nMax);
    const middle = Number(x) + Number(width) / 2;
    const left = middle - span / 2;
    const right = middle + span / 2;
    const inset = (span * (1 - NOTCH_WAIST)) / 2;
    /** Pixels por real, lidos da própria caixa: é a escala que o Recharts já resolveu. */
    const scale = pixels / iqr;
    const at = (value: number): number => Number(y) + (box.q3 - value) * scale;
    /* Entalhe cortado nos quartis quando a amostra é pequena: sem o corte os dez vértices desenham um
       losango invertido saindo pelos lados da caixa, que não é um entalhe, é um erro de desenho. */
    const high = Math.min(box.q3, box.median + row.notch);
    const low = Math.max(box.q1, box.median - row.notch);
    const yHigh = at(high);
    const yLow = at(low);
    const yMedian = at(box.median);
    const capLeft = middle - span * 0.25;
    const capRight = middle + span * 0.25;
    const notched = [
      `${String(left)},${String(Number(y))}`,
      `${String(right)},${String(Number(y))}`,
      `${String(right)},${String(yHigh)}`,
      `${String(right - inset)},${String(yMedian)}`,
      `${String(right)},${String(yLow)}`,
      `${String(right)},${String(Number(y) + pixels)}`,
      `${String(left)},${String(Number(y) + pixels)}`,
      `${String(left)},${String(yLow)}`,
      `${String(left + inset)},${String(yMedian)}`,
      `${String(left)},${String(yHigh)}`,
    ].join(' ');
    return (
      <g>
        <line stroke={WHISKER_STROKE} strokeWidth={1} x1={middle} x2={middle} y1={at(box.whiskerHigh)} y2={Number(y)} />
        <line stroke={WHISKER_STROKE} strokeWidth={1} x1={middle} x2={middle} y1={Number(y) + pixels} y2={at(box.whiskerLow)} />
        <line stroke={WHISKER_STROKE} strokeWidth={1} x1={capLeft} x2={capRight} y1={at(box.whiskerHigh)} y2={at(box.whiskerHigh)} />
        <line stroke={WHISKER_STROKE} strokeWidth={1} x1={capLeft} x2={capRight} y1={at(box.whiskerLow)} y2={at(box.whiskerLow)} />
        <polygon
          fill="none"
          points={notched}
          stroke={BOX_STROKE}
          strokeDasharray={row.notchClipped ? '3 2' : undefined}
          strokeWidth={1}
        />
        <rect
          fill={MEDIAN_FILL}
          height={MEDIAN_H}
          width={span * NOTCH_WAIST}
          x={middle - (span * NOTCH_WAIST) / 2}
          y={yMedian - MEDIAN_H / 2}
        />
      </g>
    );
  };

  /* Recorte sem nenhuma campanha: o visual inteiro sai e entra a frase de estado. Eixo e grade de um
     gráfico vazio leem como distribuição colada no zero, que é ausência vestida de medição. */
  if (rows.length === 0 || total === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-2 text-center', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="text-text-muted" size={16} />
        <p className="text-xs text-text-muted">
          Nenhuma campanha no recorte, então não há amostra para resumir nem mediana para comparar.
        </p>
      </div>
    );
  }

  const summary =
    cheapest === null || priciest === null
      ? 'Box plot entalhado do custo por lead qualificado sem nenhum tipo de mídia com amostra medida.'
      : `Box plot entalhado do custo por lead qualificado em ${formatInt(rows.length)} tipos de mídia, com ${formatInt(total)} campanhas e a largura da caixa pela raiz da amostra. ` +
        `A mediana vai de ${formatCurrencyAxis(cheapest.median)} em ${cheapest.name} a ${formatCurrencyAxis(priciest.median)} em ${priciest.name}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart barCategoryGap={BAR_CATEGORY_GAP} data={rows} margin={MARGIN}>
            {/* Grade só na direção da leitura: o valor corre em Y, então a régua é a linha horizontal,
                e a vertical seria transversal ao eixo de categoria (EIX-3). */}
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            {/* `axisLine={false}` DEPOIS do espalhamento: o AXIS_PROPS traz a linha de eixo ligada, e
                em JSX a última propriedade vence, então a ordem inversa não desligaria nada. */}
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="name"
              interval={0}
              tickMargin={8}
              type="category"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, domainMax]}
              interval={0}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickMargin={8}
              ticks={[...Y_TICKS]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <Bar
              dataKey={(row: KindRow) => (row.box === null ? [null, null] : [row.box.q1, row.box.q3])}
              isAnimationActive={false}
              maxBarSize={BOX_MAX_W}
              shape={renderBox}
            />
            <GroupAnnotations rows={rows} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`custo por lead qualificado, n ${formatInt(total)} campanhas do trimestre`}</span>
        {/* A ordem vai escrita porque nada no desenho a declara: a mediana que ordena é um traço,
            nunca um número, então sem esta linha os nomes leem como lista arbitrária (GEO-12). */}
        <span>quartil por interpolação linear; tipos em ordem de mediana crescente</span>
        <span className="tabular-nums">{`caixa: metade central dos casos; bigode até a cerca de ${formatDecimal(FENCE_FACTOR, 1)} vez`}</span>
        {/* A régua de largura termina no maior n observado, calculado do dado: constante escrita à mão
            envelhece no primeiro recorte e deixa a caixa mais larga da tela sem referência (ROT-5b). */}
        {nSmallest === null ? null : (
          <span className="flex items-center gap-1">
            {/* Os dois degraus da régua, e o último é o maior n OBSERVADO: régua que para antes do
                dado deixa a caixa mais larga da tela sem referência de tamanho. */}
            <svg
              aria-hidden
              className="shrink-0"
              height={LEGEND_BOX_H}
              viewBox={`0 0 ${String(widthFor(nSmallest, nMax) + BOX_MAX_W + LEGEND_GAP + 2)} ${String(LEGEND_BOX_H)}`}
              width={widthFor(nSmallest, nMax) + BOX_MAX_W + LEGEND_GAP + 2}
            >
              <rect
                fill="none"
                height={LEGEND_BOX_H - 2}
                stroke={BOX_STROKE}
                width={widthFor(nSmallest, nMax)}
                x={1}
                y={1}
              />
              <rect
                fill="none"
                height={LEGEND_BOX_H - 2}
                stroke={BOX_STROKE}
                width={widthFor(nMax, nMax)}
                x={widthFor(nSmallest, nMax) + LEGEND_GAP}
                y={1}
              />
            </svg>
            <span className="tabular-nums">
              {`largura da caixa: raiz da amostra, de n ${formatInt(nSmallest)} a n ${formatInt(nMax)}`}
            </span>
          </span>
        )}
        <span className="tabular-nums">
          {`entalhe de ${formatDecimal(NOTCH_FACTOR, 2)} vez o interquartil sobre a raiz de n: entalhes que não se cruzam indicam medianas diferentes`}
        </span>
        {clipped.length === 0 ? null : (
          <span>{`entalhe tracejado: amostra pequena para ele caber na caixa, e por isso cortado nos quartis`}</span>
        )}
        {beyondCount === 0 ? null : (
          <span className="tabular-nums">
            {`${formatInt(beyondCount)} ${beyondCount === 1 ? 'campanha ficou além da cerca e aparece' : 'campanhas ficaram além da cerca e aparecem'} como ponto`}
          </span>
        )}
        {withoutBox.length === 0 ? null : (
          <span className="tabular-nums">
            {`abaixo de ${formatInt(minBoxN)} campanhas não há caixa: ${withoutBox.map((row) => row.name.toLowerCase()).join(', ')} entra só com os pontos`}
          </span>
        )}
        {withoutQualified <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(withoutQualified)} campanhas sem lead qualificado ficaram fora`}</span>
        )}
      </div>
    </figure>
  );
}
