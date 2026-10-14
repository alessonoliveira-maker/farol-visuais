import type { ReactElement } from 'react';
import { Filter, Layers } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt, formatPercent, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BIN_COUNT, BIN_WIDTH, data as defaultData, type OriginGroup, type OriginTone } from './data';

/**
 * Histograma comparativo no arranjo empilhado: a mesma régua de faixas, e cada faixa repartida pelas
 * origens que a compõem. A pergunta é de volume, não de forma: de que origem é feito o negócio de
 * cada faixa de ciclo, e quanto a origem em foco pesa dentro dela.
 *
 * Quatro decisões carregam a peça.
 *
 * A primeira é o `stackId` único. Séries de `Bar` independentes repartiriam a banda da faixa entre si
 * e as barras deixariam de encostar, o que troca o histograma por um gráfico de colunas agrupadas;
 * com o mesmo `stackId` a banda inteira é de uma pilha só, e as faixas continuam contíguas como a
 * régua contínua exige.
 *
 * A segunda é que a ordem da pilha vem do dado e é fixa. O Recharts empilha na ordem dos filhos
 * declarados e não reordena por faixa, então a ordem é uma decisão de desenho, tomada uma vez: o
 * maior grupo na base, onde a camada tem linha comum, e a origem em foco por cima.
 *
 * A terceira é a cor. Uma origem em foco recebe cor de papel (`--chart-1`, 9,50:1 no tema escuro e
 * 6,00:1 no claro contra o cartão) e as outras duas ficam em neutro, porque três cores disputando a
 * mesma pilha respondem outra pergunta. O neutro do Farol para marca não destacada é `--text-muted`
 * (5,21:1 e 5,37:1) e `--line-strong` (1,79:1 e 1,83:1); o segundo fica abaixo do piso de 3:1 de
 * marca, e o que autoriza usá-lo é a isenção da ACE-3, o valor escrito junto da marca, que aqui é a
 * legenda com contagem e participação de cada origem. Entre si os dois neutros medem 2,92:1 e
 * 2,93:1, então quem separa as camadas coladas é o contorno na cor da superfície da COR-5, nunca a
 * diferença de tom nem opacidade.
 *
 * A quarta é a recusa. Acima de quatro origens o empilhamento deixa de ser legível, e a peça diz isso
 * no lugar do gráfico em vez de desenhar uma pilha que ninguém consegue ler.
 */
export interface StackedOriginHistogramProps {
  readonly data?: readonly OriginGroup[];
  readonly binWidth?: number;
  readonly binCount?: number;
  readonly height?: number;
  readonly className?: string;
}

interface BandRow {
  readonly start: number;
  /** Teto da faixa, ou `null` na última, que é aberta. */
  readonly end: number | null;
  /** Centro da faixa: é nele que a barra se apoia no eixo numérico. */
  readonly center: number;
  readonly total: number;
  /** Contagem por origem, na mesma ordem da lista de origens. */
  readonly counts: readonly number[];
}

/** O teto de origens que a pilha aceita. Acima dele a peça recusa e indica pequenos múltiplos. */
const MAX_STACKED = 4;
/** O `FORCED_TICK_LIMIT` do Farol repetido como constante local, porque o nome não é importável. */
const FORCED_TICK_LIMIT = 8;

const MARGIN = { top: 8, right: 8, bottom: 0, left: 0 } as const;
/** Tinta de `60` em Manrope de 11 px mede 12,4 px; com a sobrecarga de eixo de cerca de 18 px a conta
 * fecha em 31 px, dentro do teto de 64 da EIX-6. */
const Y_AXIS_WIDTH = 32;
/** EIX-6b: `tickMargin` de 8 mais cerca de 15 px de tinta de um rótulo de 11 px, nunca menos de 23. */
const X_AXIS_HEIGHT = 26;

/** Mapa fixo de papel para token, vindo do dado e não da posição na lista (COR-3). */
const TONE_FILL: Readonly<Record<OriginTone, string>> = {
  focus: 'var(--chart-1)',
  support: 'var(--text-muted)',
  supportSoft: 'var(--line-strong)',
};
/** O contorno que separa camadas coladas, na cor do cartão, como a COR-5 autoriza. */
const LAYER_EDGE = 'var(--surface-raised)';
const LAYER_EDGE_WIDTH = 1;

/** Passos aceitos no eixo de contagem, do mais fino ao mais grosso. */
const Y_STEPS = [2, 5, 10, 20, 25, 50, 100] as const;

/**
 * Teto e passo do eixo de contagem. O teto é a primeira linha de grade acima da faixa mais cheia, e o
 * passo é o primeiro da escada que entrega de 3 a 5 intervalos, que é a faixa da EIX-4 para cartão.
 */
function countAxis(maxTotal: number): { top: number; step: number } {
  for (const step of Y_STEPS) {
    const top = Math.ceil(maxTotal / step) * step;
    if (top / step >= 3 && top / step <= 5) return { top, step };
  }
  return { top: Math.max(maxTotal, 1), step: Math.max(maxTotal, 1) };
}

/**
 * A faixa mais cheia do recorte. Devolve `null` para lista vazia, nunca `0`: sem faixa nenhuma não
 * existe máximo, e um zero aqui viraria um eixo de zero a zero com cara de medida (EST-1b).
 */
function fullestBand(rows: readonly BandRow[]): number | null {
  if (rows.length === 0) return null;
  return rows.reduce((best, row) => Math.max(best, row.total), 0);
}

/**
 * A participação de uma parte no total. Devolve `null` quando não há total, nunca `0`: sem base não
 * existe taxa, e o chamador escreve a ausência em vez de imprimir uma participação inventada
 * (EST-1b, e a EST-2 para o que aparece na tela).
 */
function share(part: number, whole: number): number | null {
  if (whole <= 0) return null;
  return part / whole;
}

/**
 * A faixa em que a origem em foco tem a maior participação, entre as faixas com pelo menos uma
 * observação. Devolve `null` quando não há nenhuma: participação de uma faixa vazia não é zero, é
 * inexistente, e a diferença é o que a EST-1b cobra.
 */
function peakShareBand(rows: readonly BandRow[], focus: number): BandRow | null {
  const withVolume = rows.filter((row) => row.total > 0);
  if (withVolume.length === 0) return null;
  let best: BandRow | null = null;
  let bestShare = -1;
  for (const row of withVolume) {
    const share = (row.counts[focus] ?? 0) / row.total;
    if (share > bestShare) {
      bestShare = share;
      best = row;
    }
  }
  return best;
}

/**
 * Conta as observações de todas as origens na mesma régua, numa passada só. A última faixa é aberta:
 * o índice é preso no teto, então a cauda entra na faixa de cima em vez de sair da amostra em
 * silêncio. Faixa sem nenhum caso permanece na lista com contagem zero, porque se ela sumisse o
 * Recharts encostaria as vizinhas e o buraco desapareceria da leitura.
 */
function toBands(
  groups: readonly OriginGroup[],
  width: number,
  count: number,
): BandRow[] {
  const perGroup = groups.map((group) => {
    const acc = new Array<number>(count).fill(0);
    for (const value of group.values) {
      const index = Math.min(Math.floor(value / width), count - 1);
      if (index < 0) continue;
      acc[index] = (acc[index] ?? 0) + 1;
    }
    return acc;
  });
  return Array.from({ length: count }, (_, index) => {
    const counts = perGroup.map((acc) => acc[index] ?? 0);
    return {
      start: index * width,
      end: index === count - 1 ? null : (index + 1) * width,
      center: index * width + width / 2,
      total: counts.reduce((sum, value) => sum + value, 0),
      counts,
    };
  });
}

export default function StackedOriginHistogram({
  data = defaultData,
  binWidth = BIN_WIDTH,
  binCount = BIN_COUNT,
  height,
  className,
}: StackedOriginHistogramProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0 || data.every((group) => group.values.length === 0)) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Neste recorte não sobrou nenhuma origem com negócio ganho, e sem origem não há pilha a repartir.</span>
      </div>
    );
  }

  /**
   * A recusa, e ela é parte da peça. Da quinta origem em diante a pilha empilha camadas finas que
   * ninguém consegue comparar, e a leitura correta passa a ser um cartão por origem na mesma escala.
   * Desenhar a pilha de todo jeito seria oferecer uma comparação que o desenho não sustenta.
   */
  if (data.length > MAX_STACKED) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Layers aria-hidden className="size-4 shrink-0" />
        <span>
          {`${formatInt(data.length)} origens não se empilham na mesma faixa: da quinta camada em diante a comparação ` +
            'deixa de ser legível. A leitura deste recorte é um histograma por origem, em pequenos múltiplos na mesma escala.'}
        </span>
      </div>
    );
  }

  const rows = toBands(data, binWidth, binCount);
  const fullest = fullestBand(rows);
  const axis = countAxis(fullest === null ? 1 : fullest);
  const ticks = Array.from({ length: axis.top / axis.step + 1 }, (_, index) => index * axis.step);

  const focusIndex = data.findIndex((group) => group.tone === 'focus');
  const focusGroup = focusIndex === -1 ? undefined : data[focusIndex];
  const peak = focusIndex === -1 ? null : peakShareBand(rows, focusIndex);
  const peakCount = peak === null ? null : (peak.counts[focusIndex] ?? 0);

  /**
   * Uma camada da pilha, com a separação da COR-5 desenhada **só no topo do segmento**. O caminho
   * óbvio seria `stroke` no `<Bar>`, e ele contorna os quatro lados: os dois lados verticais abrem um
   * vão de 2 px entre faixas vizinhas, e vão entre faixas afirma categoria separada, que é
   * exatamente o que um histograma não pode dizer. Medido no primeiro render desta versão. O traço
   * de 1 px na cor do cartão separa a camada da que está por cima, que é onde a separação faz falta:
   * entre `--text-muted` e `--line-strong` a razão é 2,92:1 no escuro e 2,93:1 no claro.
   */
  const renderLayer =
    (fill: string) =>
    ({ x, y, width, height: barHeight }: BarShapeProps): ReactElement => {
      const tall = Number(barHeight);
      const left = Number(x);
      const top = Number(y);
      const span = Number(width);
      if (tall <= 0) return <g />;
      return (
        <g>
          <rect fill={fill} height={tall} width={span} x={left} y={top} />
          <rect fill={LAYER_EDGE} height={LAYER_EDGE_WIDTH} width={span} x={left} y={top} />
        </g>
      );
    };

  const bandName = (row: BandRow): string =>
    row.end === null ? `${formatDays(row.start)} ou mais` : `${formatInt(row.start)} a ${formatDays(row.end)}`;

  /** A legenda é lida na ordem visual da pilha, de cima para baixo, que é o contrário da ordem de
   * desenho (ROT-4). Cada item traz a contagem e a participação da origem no total, que é o valor
   * escrito junto da marca de que a ACE-3 depende para isentar o neutro fraco. */
  const totalAll = rows.reduce((sum, row) => sum + row.total, 0);
  const legend = data
    .map((group, index) => {
      const count = rows.reduce((sum, row) => sum + (row.counts[index] ?? 0), 0);
      const slice = share(count, totalAll);
      return {
        key: group.id,
        fill: TONE_FILL[group.tone],
        text:
          slice === null
            ? `${group.label}, ${formatUnavailable()}`
            : `${group.label}, ${formatInt(count)}, ${formatPercent(slice)}`,
      };
    })
    .reverse();

  const reading =
    peak === null || peakCount === null || focusGroup === undefined
      ? 'nenhuma faixa com volume neste recorte, então não há participação a medir'
      : `${focusGroup.label.toLowerCase()} pesa ${formatRateWithVolume(peakCount, peak.total)} na faixa de ${bandName(peak)}, a maior participação da régua`;

  const summary =
    `Histograma empilhado do ciclo de fechamento de ${formatInt(totalAll)} negócios por origem, em faixas de ${formatDays(binWidth)}. ` +
    (peak === null || peakCount === null || focusGroup === undefined
      ? 'Nenhuma faixa deste recorte tem volume.'
      : `${focusGroup.label} pesa ${formatRateWithVolume(peakCount, peak.total)} na faixa de ${bandName(peak)}, que é a maior participação da régua.`);

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      {/* A legenda sozinha nesta linha, e o nome do eixo de contagem foi para o rodapé: com a
          legenda de três origens a linha já mede cerca de 506 px dos 574 do corpo, e o nome do eixo
          empurraria tudo para uma segunda linha, que sairia da altura da distribuição. */}
      <div aria-hidden className="flex shrink-0 flex-wrap items-center justify-end gap-x-6 gap-y-1 leading-4">
        <ul className="flex shrink-0 items-center gap-4 text-xs text-text-secondary">
          {legend.map((item) => (
            <li className="flex items-center gap-2" key={item.key}>
              {/* Amostra na forma da marca (ROT-4): quadrado cheio, porque a marca é área cheia. */}
              <span className="size-3 shrink-0 rounded-[2px]" style={{ backgroundColor: item.fill }} />
              <span className="tabular-nums">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Linha de leitura da ANO-5: a conclusão calculada do dado, em uma linha. */}
      <p aria-hidden className="shrink-0 text-xs leading-4 text-text-secondary tabular-nums">
        {reading}
      </p>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={0} data={rows} margin={MARGIN}>
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
              interval={binCount <= FORCED_TICK_LIMIT ? 0 : 'preserveStartEnd'}
              tickCount={7}
              tickFormatter={(value: number) => formatInt(value)}
              tickLine={false}
              tickMargin={8}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              domain={[0, axis.top]}
              tickFormatter={(value: number) => formatInt(value)}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip
              content={(props) => {
                const row = props.payload?.[0]?.payload as BandRow | undefined;
                return (
                  <ChartTooltip
                    active={props.active}
                    label={row === undefined ? undefined : bandName(row)}
                    labelFormat="text"
                    /* Cada linha da dica leva a participação da origem na faixa junto do nome, porque
                       o ChartTooltip imprime um formato só por dica: contagem no valor, participação
                       no nome. A ordem é a da pilha, e o total da faixa fecha a dica. A lista é
                       remontada campo a campo, e não espalhada: o `formatter` que o Recharts põe em
                       cada entrada é tipado mais largo do que o `ChartTooltip` aceita, e espalhar a
                       entrada inteira não compila. */
                    payload={props.payload?.map((entry) => ({
                      color: entry.color,
                      dataKey: entry.dataKey,
                      graphicalItemId: entry.graphicalItemId,
                      name:
                        row === undefined || row.total === 0
                          ? entry.name
                          : `${String(entry.name)}, ${formatPercent(Number(entry.value) / row.total)} da faixa`,
                      value: Number(entry.value),
                    }))}
                    showTotal
                    valueFormat="int"
                  />
                );
              }}
              cursor={{ fill: 'var(--line-subtle)' }}
              isAnimationActive={false}
            />
            {/* Um `stackId` só para todas as origens, e é isso que dá a banda inteira à pilha: séries
                independentes dividiriam a banda e as faixas deixariam de encostar. A separação entre
                camadas coladas sai do `shape`, no topo de cada segmento, e não de um contorno. */}
            {data.map((group, index) => (
              <Bar
                dataKey={(row: BandRow) => row.counts[index] ?? 0}
                fill={TONE_FILL[group.tone]}
                isAnimationActive={animate}
                key={group.id}
                name={group.label}
                shape={renderLayer(TONE_FILL[group.tone])}
                stackId="cycle"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">contagem de negócios ganhos no eixo vertical</span>
        <span className="tabular-nums">{`ciclo em dias, faixas de ${formatDays(binWidth)} para todas as origens`}</span>
        <span className="tabular-nums">{`domínio fixo de 0 a ${formatDays(binWidth * binCount)}, da métrica`}</span>
        <span className="tabular-nums">{`a última faixa é aberta, ${formatDays(binWidth * (binCount - 1))} ou mais`}</span>
        {/* A ausência vem nomeada por origem, e não como um total só: falha de cadastro não é igual
            entre canais, e o total esconderia de qual deles a amostra saiu mais furada. */}
        <span className="tabular-nums">
          {`sem data de criação e fora da amostra: ${data
            .map((group) => `${formatInt(group.withoutCycle)} de ${group.label.toLowerCase()}`)
            .join(', ')}`}
        </span>
      </div>
    </figure>
  );
}
