import type { ReactElement } from 'react';
import { Unplug } from 'lucide-react';
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

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import {
  formatCurrency,
  formatCurrencyAxis,
  formatInt,
  formatRateWithVolume,
  formatUnavailable,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { BIN_WIDTH, data as defaultData, OPEN_FROM, WITHOUT_REVENUE } from './data';

/**
 * Histograma de uma medida em que quase metade dos casos vale exatamente zero. A pergunta que ele
 * responde não é "qual a forma da receita por oportunidade": é "como mostrar a forma **apesar** do
 * zero", porque numa mesma régua o pico do zero achata o resto e vira a única coisa que se vê.
 *
 * Três estados diferentes convivem aqui, e a peça inteira é sobre não deixar que dois leiam igual.
 *
 * **Zero medido.** A oportunidade foi ganha, a receita foi apurada e deu R$ 0. É medição, fica na
 * amostra e desenha marca (EST-3). Ela sai do neutro, `--text-muted`, e não da cor da série: a cor
 * da série diz "faixa de valor", e o zero não é faixa nenhuma, é um átomo. A coluna vem separada
 * das faixas por uma coluna vazia inteira e por uma divisória, e leva o próprio número escrito.
 *
 * **Faixa medida com nenhum caso.** A régua cobre o intervalo, ninguém caiu ali. A barra de
 * contagem zero não pinta nada, então ela ganha um traço de base de 2 px, no mesmo neutro: o vão
 * precisa ser deliberado, senão é indistinguível de recorte do eixo.
 *
 * **Ausência.** A oportunidade não tem o campo de receita apurado. Não é zero, não vira faixa zero
 * e **não tem marca nenhuma no desenho**: sai da amostra e é contada no rodapé com
 * `formatUnavailable()` e o ícone de tomada desligada. É o único dos três estados que não desenha,
 * e é justamente por isso que ele nunca pode ser confundido com o zero, que desenha uma coluna
 * cheia de altura conhecida.
 *
 * A quarta decisão é a mais delicada e está declarada no desenho: **a coluna do zero é truncada**.
 * Com 89 casos contra 28 da faixa mais cheia, um eixo que coubesse os 89 deixaria as faixas de 1 e
 * 2 casos com 1 px de altura, isto é, a forma que o histograma existe para mostrar sumiria. O eixo
 * é dimensionado pelas faixas, a coluna do zero **passa** do teto, é cortada por duas tarjas
 * diagonais na cor do cartão, que é a marca universal de escala interrompida, e o número dela é
 * escrito acima. Passar do teto, e não parar rente à última linha de grade, é parte da correção:
 * parando embaixo dela o olho lê o valor daquela linha. Truncar sem a tarja e sem o número seria
 * mentir; com as duas, é escolher onde a precisão importa.
 */
export interface RevenueWithZeroMassProps {
  readonly data?: readonly number[];
  readonly binWidth?: number;
  readonly openFrom?: number;
  readonly withoutRevenue?: number;
  readonly height?: number;
  readonly className?: string;
}

type RowKind = 'zero' | 'gap' | 'band' | 'open';

interface Row {
  /** Centro da coluna no eixo, em unidades de coluna. É nele que a barra se apoia. */
  readonly center: number;
  readonly kind: RowKind;
  readonly start: number;
  readonly end: number;
  readonly count: number;
  /** O que a barra desenha. Igual à contagem, menos na coluna do zero, que é truncada no teto. */
  readonly draw: number;
}

/**
 * A margem superior guarda o número da coluna truncada, que é escrito fora da área de plotagem
 * porque dentro dela ele cairia sobre a própria tarja de corte. Múltiplos de 2 px (ESP-1).
 */
const MARGIN = { top: 20, right: 8, bottom: 4, left: 4 } as const;
const BAR_FILL = 'var(--chart-1)';
/**
 * O neutro dos estados que são medição mas não são forma: a coluna do zero e o traço da faixa
 * vazia. Um token, um papel. `--text-muted` mede 5,21:1 no escuro e 5,37:1 no claro contra o
 * cartão, acima do piso de 3:1 da marca; `--line-strong`, que seria a escolha intuitiva de neutro,
 * mede 1,79:1 e 1,83:1, ou seja, não se vê.
 */
const NEUTRAL = 'var(--text-muted)';
const EMPTY_MARK_H = 2;
/** A tarja de corte é da cor do cartão: ela não pinta nada, ela tira tinta da coluna. */
const BREAK_COLOR = 'var(--surface-raised)';
const BREAK_WIDTH = 3;
/**
 * Quanto a coluna truncada **passa** do teto da área de plotagem, em pixel. Ela sobe acima da
 * última linha de grade de propósito: terminando embaixo dela, ou rente a ela, o olho lê o valor
 * daquela linha, que é 30, quando o que a coluna conta é 89. Passando do teto, a leitura é a que se
 * quer, isto é, que a coluna sai do gráfico. O `shape` desenha na margem sem ser recortado.
 */
const COLUMN_OVERSHOOT = 3;
const LABEL_FONT = 11;
/** Passos aceitos no eixo de contagem, do mais fino ao mais grosso. */
const Y_STEPS = [2, 5, 10, 20, 25, 50, 100] as const;

/**
 * Teto e passo do eixo de contagem. Ele é calculado **sobre as faixas de valor**, sem a coluna do
 * zero: incluí-la é a decisão que apaga a forma, e é ela que esta versão recusa.
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
 * Monta as colunas do desenho, na ordem em que elas aparecem: a do zero, uma coluna vazia que abre
 * o vão, as faixas de valor e a faixa aberta do fim.
 *
 * A coluna vazia existe porque o eixo **não é uma régua contínua**: ele tem um átomo no zero e uma
 * faixa sem fim no topo. Com o Recharts, largura de barra em eixo numérico é a largura do corpo
 * dividida pelo número de linhas do array, então uma linha que não desenha nada é exatamente o que
 * produz um vão de uma coluna, sem mexer na largura das outras.
 */
function buildRows(values: readonly number[], width: number, openFrom: number): Row[] {
  const bands = Math.ceil(openFrom / width);
  const counts = new Array<number>(bands).fill(0);
  let zero = 0;
  let open = 0;
  for (const value of values) {
    if (value === 0) {
      zero += 1;
      continue;
    }
    if (value >= openFrom) {
      open += 1;
      continue;
    }
    const index = Math.floor(value / width);
    counts[index] = (counts[index] ?? 0) + 1;
  }
  const rows: Row[] = [
    { center: 0.5, kind: 'zero', start: 0, end: 0, count: zero, draw: zero },
    { center: 1.5, kind: 'gap', start: 0, end: 0, count: 0, draw: 0 },
  ];
  counts.forEach((count, index) => {
    rows.push({
      center: index + 2.5,
      kind: 'band',
      start: index * width,
      end: (index + 1) * width,
      count,
      draw: count,
    });
  });
  rows.push({ center: bands + 2.5, kind: 'open', start: openFrom, end: Number.POSITIVE_INFINITY, count: open, draw: open });
  return rows;
}

export default function RevenueWithZeroMass({
  data = defaultData,
  binWidth = BIN_WIDTH,
  openFrom = OPEN_FROM,
  withoutRevenue = WITHOUT_REVENUE,
  height,
  className,
}: RevenueWithZeroMassProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  /** A guarda testa `data`, a lista que alimenta a contagem, e não uma lista vizinha. */
  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>
          {`Receita por oportunidade ${formatUnavailable().toLowerCase()}: neste recorte nenhuma oportunidade ganha teve o campo de receita apurado, e sem apuração não há zero para desenhar.`}
        </span>
      </div>
    );
  }

  const rows = buildRows(data, binWidth, openFrom);
  const bandRows = rows.filter((row) => row.kind === 'band' || row.kind === 'open');
  const axis = countAxis(bandRows.reduce((best, row) => Math.max(best, row.count), 0));
  const ticks = Array.from({ length: axis.top / axis.step + 1 }, (_, index) => index * axis.step);

  const zeroRow = rows[0]!;
  const openRow = rows.at(-1)!;
  /**
   * A coluna do zero e a coluna do vão desenham até o teto do eixo. A do zero porque ela é
   * truncada, e a do vão porque o `shape` só recebe o retângulo da própria marca: com altura zero
   * ele receberia um retângulo de altura zero e a divisória sairia com zero pixel de comprimento.
   * O número verdadeiro continua em `count`, que é o que a dica e o rótulo leem.
   */
  const drawRows = rows.map((row) =>
    row.kind === 'zero' || row.kind === 'gap' ? { ...row, draw: axis.top } : row,
  );

  /**
   * Primeira e última faixa de valor com caso. Só entre elas um vão é buraco; antes da primeira e
   * depois da última é borda de amostra, e marcar borda como buraco afirmaria que a régua mediu
   * onde ela só acabou.
   */
  const firstFilled = bandRows.findIndex((row) => row.count > 0);
  const lastFilled = bandRows.reduce((last, row, index) => (row.count > 0 ? index : last), -1);

  const zeroText = formatRateWithVolume(zeroRow.count, data.length);
  const largest = data.reduce((best, value) => Math.max(best, value), 0);
  /** A faixa de valor mais cheia, para a frase dizer contra o que o pico do zero está sendo medido. */
  const fullestBand = bandRows.reduce<Row | null>(
    (best, row) => (row.kind === 'band' && (best === null || row.count > best.count) ? row : best),
    null,
  );

  const summary =
    `Histograma da receita reconhecida por oportunidade ganha, em faixas de ${formatCurrencyAxis(binWidth)}, com ${formatInt(data.length)} apuradas. ` +
    `${zeroText} fecharam com ${formatCurrency(0, 0)} reconhecido, medido, contra ${formatInt(fullestBand?.count ?? 0)} casos da faixa de valor mais cheia.`;

  /**
   * Uma série só, e tudo o que a peça precisa desenhado dentro do `shape`: a coluna truncada do
   * zero, o vão, as barras das faixas e o traço das faixas vazias. Uma segunda série de `Bar`
   * repartiria a banda entre as duas e as barras deixariam de encostar, que é o que separa
   * histograma de gráfico de colunas.
   */
  const renderColumn = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = drawRows[Number(index)];
    const left = Number(x);
    const span = Number(width);
    const top = Number(y);
    const bottom = Number(y) + Number(barHeight);
    if (row === undefined) return <g />;

    if (row.kind === 'gap') {
      /* A divisória do vão: ela diz onde o átomo acaba e a régua contínua começa. Tracejada e fina,
         porque não é dado, é a costura entre duas coisas que não são a mesma coisa. */
      return (
        <line
          stroke={NEUTRAL}
          strokeDasharray="2 3"
          strokeWidth={1}
          x1={left + span / 2}
          x2={left + span / 2}
          y1={bottom - Number(barHeight)}
          y2={bottom}
        />
      );
    }

    if (row.kind === 'zero') {
      const columnTop = top - COLUMN_OVERSHOOT;
      return (
        <g>
          <rect fill={NEUTRAL} height={bottom - columnTop} width={span} x={left} y={columnTop} />
          {/* Duas tarjas na cor do cartão atravessando a coluna: é a marca universal de escala
              interrompida. Sem ela a coluna afirmaria a altura do teto do eixo, que é 30, quando o
              que ela conta é 89. */}
          <path
            d={`M ${String(left)} ${String(columnTop + 14)} L ${String(left + span)} ${String(columnTop + 6)}`}
            stroke={BREAK_COLOR}
            strokeWidth={BREAK_WIDTH}
          />
          <path
            d={`M ${String(left)} ${String(columnTop + 22)} L ${String(left + span)} ${String(columnTop + 14)}`}
            stroke={BREAK_COLOR}
            strokeWidth={BREAK_WIDTH}
          />
          {/* O número da coluna truncada, na margem de cima: dentro da área ele cairia sobre a
              própria tarja. É ele que devolve a precisão que o corte tirou. */}
          <text
            className="font-display"
            fill={NEUTRAL}
            fontSize={LABEL_FONT}
            fontWeight={500}
            textAnchor="middle"
            x={left + span / 2}
            y={top - 9}
          >
            {formatInt(row.count)}
          </text>
          {/* O tique da coluna do zero é desenhado aqui, e não pelo eixo, porque ela não está na
              régua contínua: o eixo mede reais a partir de R$ 100 mil e esta coluna é um átomo. O
              `shape` pode desenhar fora da área de plotagem, e é por isso que o rótulo cai na
              mesma altura dos tiques do eixo, alinhado com eles. */}
          <text
            className="font-display"
            fill={NEUTRAL}
            fontSize={LABEL_FONT}
            textAnchor="middle"
            x={left + span / 2}
            y={bottom + 14}
          >
            {formatCurrency(0, 0)}
          </text>
        </g>
      );
    }

    const bandIndex = Number(index) - 2;
    if (row.count === 0) {
      const inside = bandIndex > firstFilled && bandIndex < lastFilled;
      return inside ? (
        <rect fill={NEUTRAL} height={EMPTY_MARK_H} width={span} x={left} y={bottom - EMPTY_MARK_H} />
      ) : (
        <g />
      );
    }
    return <rect fill={BAR_FILL} height={Number(barHeight)} width={span} x={left} y={top} />;
  };

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      {/* Linha de leitura da ANO-5: a conclusão calculada do dado, na primeira linha que o olho
          encontra, com a taxa acompanhada do volume que ela mede. */}
      <p aria-hidden className="shrink-0 tabular-nums text-xs leading-4 text-text-secondary">
        {`${zeroText} das ganhas apuradas fecharam com ${formatCurrency(0, 0)} reconhecido, medido.`}
      </p>

      {/* O nome do eixo Y vive aqui, e não rotacionado na lateral. Em painel de produto altura de
          barra é lida como dinheiro por padrão, e nesta peça o eixo de valor é o horizontal: sem o
          nome, o leitor conta reais onde estão contadas oportunidades. */}
      <span aria-hidden className="shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        oportunidades ganhas
      </span>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={0} data={drawRows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            {/* O eixo é numérico em unidades de coluna, e os tiques caem nas **bordas** das faixas,
                não nos centros: a borda é o que o número quer dizer ("R$ 100 mil" é onde a faixa
                começa), e tique no centro rotularia a faixa com um valor que está dentro dela. */}
            <XAxis
              {...AXIS_PROPS}
              dataKey="center"
              domain={[0, rows.length]}
              /* `interval={0}` porque o Recharts descarta em silêncio os tiques que ele julga
                 apertados, e aqui eles cabem: seis rótulos de cerca de 60 px em passos de 72 px.
                 A régua começa em R$ 100 mil e não em R$ 0 porque a coluna do átomo já escreve o
                 seu próprio R$ 0, e dois zeros a 54 px um do outro leriam como o mesmo lugar. */
              interval={0}
              tickFormatter={(value: number) => formatCurrencyAxis((value - 2) * binWidth)}
              ticks={[4, 6, 8, 10, 12, 14]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              domain={[0, axis.top]}
              /* Mesmo motivo do eixo de baixo: sem `interval={0}` o Recharts imprimiu só dois dos
                 quatro tiques num corpo de cerca de 90 px, e a grade, que nasce dos tiques, sumiu
                 junto. */
              interval={0}
              tickFormatter={(value: number) => formatInt(value)}
              ticks={ticks}
              width={28}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active !== true) return null;
                const row = payload?.[0]?.payload as Row | undefined;
                if (row === undefined || row.kind === 'gap') return null;
                const range =
                  row.kind === 'zero'
                    ? `${formatCurrency(0, 0)}, medido`
                    : row.kind === 'open'
                      ? `acima de ${formatCurrencyAxis(row.start)}`
                      : `${formatCurrencyAxis(row.start)} a ${formatCurrencyAxis(row.end)}`;
                return (
                  <div className="rounded border border-line-subtle bg-surface-overlay px-2 py-1 text-xs text-text-primary shadow-lg">
                    <p className="font-display tabular-nums">{range}</p>
                    <p className="tabular-nums text-text-secondary">
                      {`${formatInt(row.count)} ${row.count === 1 ? 'oportunidade' : 'oportunidades'}`}
                    </p>
                  </div>
                );
              }}
              cursor={{ fill: 'var(--line-subtle)' }}
            />
            <Bar dataKey="draw" fill={BAR_FILL} isAnimationActive={animate} shape={renderColumn} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`receita por oportunidade, faixas de ${formatCurrencyAxis(binWidth)} a partir de ${formatCurrency(0, 0)}`}</span>
        <span className="tabular-nums">{`n ${formatInt(data.length)} apuradas`}</span>
        <span className="tabular-nums">
          {`coluna do zero cortada: o eixo é dimensionado pelas faixas de valor`}
        </span>
        <span className="tabular-nums">
          {`faixa aberta: ${formatInt(openRow.count)} acima de ${formatCurrencyAxis(openFrom)}, a maior em ${formatCurrencyAxis(largest)}`}
        </span>
        {withoutRevenue <= 0 ? null : (
          /* A ausência é o único dos três estados sem marca no desenho, e é aqui que ela aparece:
             com o ícone de tomada desligada e o rótulo único da EST-2, nunca como faixa zero. */
          <span className="flex items-center gap-1 tabular-nums">
            <Unplug aria-hidden className="size-3 shrink-0" />
            {`${formatInt(withoutRevenue)} sem o campo apurado, ${formatUnavailable().toLowerCase()}, fora`}
          </span>
        )}
      </div>
    </figure>
  );
}
