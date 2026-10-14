import type { ReactElement } from 'react';
import { Unplug } from 'lucide-react';
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

import { AXIS_PROPS, GRID_COLOR } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BIN_WIDTH, data as defaultData, DOMAIN_MAX, type ExecutiveCycle, MIN_SAMPLE } from './data';

/**
 * Pequenos múltiplos de histograma: um painel por executivo, todos na mesma grade, com o mesmo bin
 * e a mesma escala. É a resposta certa quando há de quatro a vinte grupos e sobrepor viraria
 * borrão, e o que ela responde não é "qual executivo é mais rápido", que um ranking já daria, e sim
 * "algum deles tem uma forma de ciclo diferente da dos outros".
 *
 * Cinco decisões carregam a peça.
 *
 * A primeira, e a que mata o modelo quando falha: **o domínio de X e de Y é calculado uma vez, no
 * pai, sobre o conjunto**. Deixar o Recharts calcular por painel dá a cada um a sua própria régua,
 * e a comparação vira ilusão de ótica (EIX-9).
 *
 * A segunda é que **nenhum eixo é escondido com `hide`**. O Recharts só reserva altura e largura
 * para eixo visível, então `hide` devolve esse espaço ao corpo daquele painel e a mesma contagem
 * passa a medir alturas diferentes em painéis diferentes. O eixo fica sempre presente e só o tique
 * some, com `tick={false}`, que zera o texto sem zerar a reserva.
 *
 * A terceira é a régua de comparação atrás de cada painel. Ela é a forma da área inteira
 * **reescalada para o volume daquele executivo**, e não a contagem bruta da área: a contagem bruta
 * é oito vezes maior que a de um painel e estouraria a escala comum. Reescalada, ela responde
 * "se este executivo tivesse a forma da casa, com o volume que ele tem, o desenho seria este".
 *
 * A quarta é a cor dessa régua e o lugar dela na pilha. O estudo pede `--line-subtle`, que mede
 * 1,25:1 contra o cartão e some; e ela não é enfeite, é o segundo termo da comparação, então vale o
 * piso de 3:1 da ACE-6. A régua sai em `--text-muted`, o token de referência da 17.2, acima de 5:1
 * nos dois temas, e fica **atrás** da barra: na frente ela precisaria de revestimento para
 * sobreviver ao cruzar a marca, e um revestimento de 4 px atravessando barras de 10 px num painel
 * de 65 px come quase metade da tinta de cada uma.
 *
 * A quinta é o painel de amostra pequena. Abaixo do piso da amostra ele deixa de desenhar barras:
 * uma barra solitária num painel de 190 px é lida como pico, e três negócios não têm forma. O que
 * ele desenha é um traço por caso, na posição de cada um, com a régua da casa fora, porque ela
 * ficaria abaixo de meio pixel naquele volume.
 */
export interface CycleByExecutiveProps {
  readonly data?: readonly ExecutiveCycle[];
  readonly binWidth?: number;
  readonly domainMax?: number;
  readonly minSample?: number;
  readonly height?: number;
  readonly className?: string;
}

interface Row {
  readonly start: number;
  readonly end: number;
  /** Centro do bin: é nele que a barra se apoia no eixo numérico e o degrau da régua muda de altura. */
  readonly center: number;
  readonly count: number;
  /** A forma da casa no volume deste executivo. Fracionária de propósito: é expectativa, não contagem. */
  readonly reference: number;
}

interface Panel {
  readonly label: string;
  readonly size: number;
  readonly median: number | null;
  readonly rows: readonly Row[];
  /** Os casos individuais, em ordem crescente, quando a amostra é pequena demais para virar forma. */
  readonly cases: readonly number[] | null;
}

/** Coordenadas que o Recharts entrega ao `shape` da faixa de referência, já em pixel do gráfico. */
interface CaseShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
}

const GRID_COLUMNS = 4;
/**
 * A margem de cada painel. `top` de 6 px porque a barra mais alta do conjunto encosta no teto do
 * eixo e sem folga ela fica colada na moldura; o resto é o mínimo, porque em painel de 190 px cada
 * pixel de margem sai da forma. Múltiplos de 2 px (ESP-1).
 */
const PANEL_MARGIN = { top: 6, right: 2, bottom: 0, left: 2 } as const;
/**
 * Reserva de eixo, idêntica nos oito painéis. Declarada por número e não deixada no automático
 * porque é ela que alinha os corpos: o painel sem tique continua reservando o mesmo espaço, e a
 * mesma contagem mede a mesma altura em qualquer célula da grade.
 */
const Y_AXIS_WIDTH = 22;
const X_AXIS_HEIGHT = 16;

const BAR_FILL = 'var(--chart-1)';
const REFERENCE_COLOR = 'var(--text-muted)';
const REFERENCE_WIDTH = 1.5;
const CASE_WIDTH = 2;
const NOTE_FONT = 11;
/** Passos aceitos no eixo de contagem, do mais fino ao mais grosso. */
const Y_STEPS = [2, 5, 10, 20, 25, 50, 100] as const;

/**
 * Teto e passo do eixo de contagem, calculados **sobre o conjunto**. O teto é a primeira linha de
 * grade acima do maior bin de qualquer painel, e o passo é o primeiro da escada que entrega de 3 a
 * 5 intervalos, que é a faixa da EIX-4.
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
 * zero, e o array vai do zero ao teto do domínio, não ao maior valor observado: sem isso o Recharts
 * encostaria os vizinhos e o buraco, que é o achado, desapareceria da leitura.
 */
function binCounts(values: readonly number[], width: number, domainMax: number): number[] {
  const total = Math.ceil(domainMax / width);
  const counts = new Array<number>(total).fill(0);
  for (const value of values) {
    const index = Math.floor(value / width);
    if (index < 0 || index >= total) continue;
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts;
}

/**
 * Mediana por interpolação linear sobre `(n − 1) · p`, a convenção declarada desta família, e
 * **`null` na lista vazia**. Devolver `0` aqui plantaria "mediana 0 dias" no título de um painel
 * sem nenhum negócio fechado, que é medição inventada; com `null` o caso vazio só tem uma saída,
 * que é o rótulo de indisponível. A guarda é `values.length`, a lista que alimenta a conta.
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * 0.5;
  const low = Math.floor(position);
  const high = Math.ceil(position);
  const base = sorted[low] ?? 0;
  if (low === high) return base;
  return base + ((sorted[high] ?? base) - base) * (position - low);
}

export default function CycleByExecutive({
  data = defaultData,
  binWidth = BIN_WIDTH,
  domainMax = DOMAIN_MAX,
  minSample = MIN_SAMPLE,
  height,
  className,
}: CycleByExecutiveProps) {
  const style = height === undefined ? undefined : { height };
  /** A guarda testa a lista que alimenta os painéis, e não uma lista vizinha. */
  const withSample = data.filter((group) => group.values.length > 0);

  if (withSample.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>
          {`Ciclo por executivo ${formatUnavailable().toLowerCase()}: neste recorte nenhum executivo tem oportunidade ganha com ciclo calculável.`}
        </span>
      </div>
    );
  }

  const everyValue = withSample.flatMap((group) => [...group.values]);
  const overall = binCounts(everyValue, binWidth, domainMax);
  const total = everyValue.length;

  const panels: Panel[] = withSample.map((group) => {
    const counts = binCounts(group.values, binWidth, domainMax);
    const share = group.values.length / total;
    return {
      label: group.label,
      size: group.values.length,
      median: median(group.values),
      rows: counts.map((count, index) => ({
        start: index * binWidth,
        end: (index + 1) * binWidth,
        center: index * binWidth + binWidth / 2,
        count,
        reference: (overall[index] ?? 0) * share,
      })),
      cases: group.values.length < minSample ? [...group.values].sort((a, b) => a - b) : null,
    };
  });

  /**
   * A ordem de leitura: mediana crescente entre quem tem forma, e os painéis de amostra pequena
   * depois deles, porque a mediana de três casos não é comparável com a de cinquenta e colocá-la na
   * fila diria que é. Ordenar aqui, e não no dado, é o que deixa a régua explícita.
   */
  const ordered = [
    ...panels.filter((panel) => panel.cases === null).sort((a, b) => (a.median ?? 0) - (b.median ?? 0)),
    ...panels.filter((panel) => panel.cases !== null).sort((a, b) => b.size - a.size),
  ];

  const axis = countAxis(
    panels.reduce(
      (best, panel) => panel.rows.reduce((inner, row) => Math.max(inner, row.count, row.reference), best),
      0,
    ),
  );
  const ticks = Array.from({ length: axis.top / axis.step + 1 }, (_, index) => index * axis.step);
  /** Quatro tiques redondos no eixo de dias, iguais nos oito painéis. */
  const xTicks = [0, domainMax / 3, (domainMax * 2) / 3, domainMax].map((value) => Math.round(value));

  const fastest = ordered[0];
  const slowest = ordered.filter((panel) => panel.cases === null).at(-1);
  const withoutCycle = withSample.reduce((sum, group) => sum + group.withoutCycle, 0);
  const smallPanels = ordered.filter((panel) => panel.cases !== null);

  const summary =
    fastest === undefined || slowest === undefined
      ? `Grade de ${formatInt(ordered.length)} histogramas de ciclo de fechamento, um por executivo, em faixas de ${formatDays(binWidth)} e escala comum.`
      : `Grade de ${formatInt(ordered.length)} histogramas do ciclo de fechamento, um por executivo, em faixas de ${formatDays(binWidth)} e escala comum. ` +
        `${fastest.label} fecha na mediana de ${formatDays(Math.round(fastest.median ?? 0))} e ${slowest.label} em ${formatDays(Math.round(slowest.median ?? 0))}, ` +
        `com a forma espalhada por todo o eixo em vez de concentrada.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      <div aria-hidden className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-1 leading-4">
        {/* O nome do eixo Y vive aqui, e não rotacionado na lateral de cada painel: em oito painéis
            o texto vertical seria oito vezes o mesmo ruído, e é justamente ele que impede ler
            altura como dinheiro. */}
        <span className="text-[0.6875rem] text-text-muted">oportunidades ganhas por faixa de ciclo</span>
        {/* Amostra na forma da marca (ROT-4): um degrau para a régua, porque uma amostra quadrada
            prometeria uma segunda série de barras. */}
        <span className="flex shrink-0 items-center gap-2 text-[0.6875rem] text-text-muted">
          <svg className="shrink-0" height={12} viewBox="0 0 12 12" width={12}>
            <polyline
              fill="none"
              points="0,9 4,9 4,3 8,3 8,7 12,7"
              stroke={REFERENCE_COLOR}
              strokeWidth={REFERENCE_WIDTH}
            />
          </svg>
          a forma da casa, no volume de cada executivo
        </span>
      </div>

      <div aria-hidden className="grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-x-3 gap-y-2">
        {ordered.map((panel, index) => {
          const showY = index % GRID_COLUMNS === 0;
          const showX = index >= ordered.length - GRID_COLUMNS;
          /**
           * Um traço por caso, e a nota que diz que ali se conta caso e não faixa. Sai de um
           * `shape` da faixa de referência que cobre o eixo inteiro, porque é ele que entrega, em
           * pixel, onde a área de plotagem começa e termina: com `x1` em zero e `x2` no teto do
           * domínio, converter dia em pixel é uma regra de três exata.
           */
          const renderCases = ({ x, y, width, height: areaHeight }: CaseShapeProps): ReactElement => {
            const left = Number(x);
            const span = Number(width);
            const top = Number(y);
            const bottom = Number(y) + Number(areaHeight);
            return (
              <g>
                {/* Tracejado, e não sólido. O traço sobe até perto do teto para ser visto num
                    painel de 65 px, e uma marca sólida nessa altura seria lida como barra de
                    contagem alta na escala comum, que é exatamente o contrário do que ela diz. O
                    tracejado não tem leitura de altura: ele marca uma posição no eixo de dias. */}
                {(panel.cases ?? []).map((value) => (
                  <line
                    key={value}
                    stroke={BAR_FILL}
                    strokeDasharray="3 3"
                    strokeWidth={CASE_WIDTH}
                    x1={left + (value / domainMax) * span}
                    x2={left + (value / domainMax) * span}
                    y1={top + NOTE_FONT + 4}
                    y2={bottom}
                  />
                ))}
                <text
                  className="font-display"
                  fill={REFERENCE_COLOR}
                  fontSize={NOTE_FONT}
                  fontWeight={500}
                  textAnchor="start"
                  x={left}
                  y={top + NOTE_FONT}
                >
                  um traço por caso
                </text>
              </g>
            );
          };

          return (
            <div className="flex min-h-0 min-w-0 flex-col" key={panel.label}>
              <p className="shrink-0 truncate text-[0.6875rem] leading-4 tabular-nums text-text-secondary">
                {`${panel.label} · n ${formatInt(panel.size)}`}
              </p>
              <div className="min-h-0 flex-1">
                <ResponsiveContainer height="100%" width="100%">
                  <ComposedChart
                    accessibilityLayer={false}
                    barCategoryGap={0}
                    data={panel.rows}
                    margin={PANEL_MARGIN}
                  >
                    <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                    {/* `tick={false}` e nunca `hide`: o eixo escondido devolveria a reserva ao corpo
                        deste painel e a mesma contagem mediria alturas diferentes na grade. */}
                    <XAxis
                      {...AXIS_PROPS}
                      dataKey="center"
                      domain={[0, domainMax]}
                      height={X_AXIS_HEIGHT}
                      tick={showX ? AXIS_PROPS.tick : false}
                      tickFormatter={(value: number) => formatInt(value)}
                      ticks={xTicks}
                      type="number"
                    />
                    <YAxis
                      {...AXIS_PROPS}
                      allowDecimals={false}
                      domain={[0, axis.top]}
                      /* `interval={0}` porque em 65 px de corpo o Recharts descarta em silêncio
                         metade dos tiques que ele acha que não cabem, e a grade nasce dos tiques:
                         sem isso o painel ficava com duas linhas de grade em vez de quatro, e as
                         duas que sobravam não eram as mesmas em todos os painéis. */
                      interval={0}
                      tick={showY ? AXIS_PROPS.tick : false}
                      tickFormatter={(value: number) => formatInt(value)}
                      ticks={ticks}
                      width={Y_AXIS_WIDTH}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active !== true) return null;
                        const row = payload?.[0]?.payload as Row | undefined;
                        if (row === undefined) return null;
                        return (
                          <div className="rounded border border-line-subtle bg-surface-overlay px-2 py-1 text-xs text-text-primary shadow-lg">
                            <p className="font-display tabular-nums">{`${formatInt(row.start)} a ${formatDays(row.end)}`}</p>
                            <p className="tabular-nums text-text-secondary">
                              {`${panel.label}, ${formatInt(row.count)}`}
                            </p>
                            {panel.cases === null ? (
                              <p className="tabular-nums text-text-muted">
                                {`forma da casa, ${formatInt(Math.round(row.reference))}`}
                              </p>
                            ) : null}
                          </div>
                        );
                      }}
                      cursor={{ fill: 'var(--line-subtle)' }}
                    />
                    {panel.cases === null ? (
                      <Bar
                        dataKey="count"
                        fill={BAR_FILL}
                        isAnimationActive={false}
                        shape={({ x, y, width, height: barHeight }: BarShapeProps) => (
                          /* `shape` declarado também aqui porque o Recharts descarta cedo todo
                             retângulo de dimensão zero, e é o retângulo de contagem zero que
                             mantém a faixa vazia no lugar em vez de encostar os vizinhos. */
                          <rect
                            fill={BAR_FILL}
                            height={Number(barHeight)}
                            width={Number(width)}
                            x={Number(x)}
                            y={Number(y)}
                          />
                        )}
                      />
                    ) : null}
                    {panel.cases === null ? (
                      <>
                        {/* A régua é série de linha, e não uma segunda série de `Bar`: duas séries
                            de barra repartiriam a banda do bin entre si e as barras deixariam de
                            encostar, o que transforma o histograma em gráfico de colunas.
                            `zIndex` 200 a põe atrás da barra, que desenha em 300. Atrás, e não na
                            frente com revestimento: o revestimento de 4 px atravessaria cada barra
                            na horizontal e comeria quase metade da tinta de uma marca de 10 px num
                            painel de 65 px, que é a armadilha do halo que apaga a própria marca.
                            Atrás, a régua aparece exatamente onde o executivo fica abaixo da casa,
                            que é a metade informativa da comparação. */}
                        <Line
                          activeDot={false}
                          dataKey="reference"
                          dot={false}
                          isAnimationActive={false}
                          stroke={REFERENCE_COLOR}
                          strokeWidth={REFERENCE_WIDTH}
                          type="step"
                          zIndex={200}
                        />
                      </>
                    ) : (
                      /* As quatro coordenadas são explícitas, e isso não é zelo: com `x1` e `x2`
                         apenas, o Recharts não devolveu ao `shape` o retângulo em pixel e os
                         traços saíram com coordenada inválida, isto é, o painel inteiro ficou em
                         branco sem erro nenhum. Com `y1` e `y2` declarados o retângulo é calculado
                         e a regra de três de dia para pixel passa a valer. */
                      <ReferenceArea
                        fill="none"
                        ifOverflow="extendDomain"
                        shape={renderCases}
                        x1={0}
                        x2={domainMax}
                        y1={0}
                        y2={axis.top}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`ciclo em dias, faixas de ${formatDays(binWidth)} nos ${formatInt(ordered.length)} painéis`}</span>
        <span className="tabular-nums">{`escala comum de 0 a ${formatInt(axis.top)} oportunidades, calculada sobre o conjunto`}</span>
        {/* A ordem é declarada, como o domínio e a escala: sem esta linha o leitor vê A, B, C, E na
            primeira fileira e supõe ordem alfabética com erro de digitação, em vez de ordenação por
            mediana. Ordem de leitura que não se escreve vira suspeita de defeito. */}
        <span className="tabular-nums">painéis em ordem de mediana crescente, e os abaixo do piso no fim</span>
        <span className="tabular-nums">{`n ${formatInt(total)} ganhas no período`}</span>
        {smallPanels.map((panel) => (
          <span className="tabular-nums" key={panel.label}>
            {`${panel.label}, n ${formatInt(panel.size)} abaixo do piso de ${formatInt(minSample)}: ${panel.cases?.map((value) => formatInt(value)).join(', ') ?? ''} dias, sem forma`}
          </span>
        ))}
        {withoutCycle <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(withoutCycle)} ganhas sem data de criação ficaram fora`}</span>
        )}
      </div>
    </figure>
  );
}
