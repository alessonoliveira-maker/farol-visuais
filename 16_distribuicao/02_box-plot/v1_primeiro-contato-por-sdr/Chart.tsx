import type { ReactElement } from 'react';
import {
  Bar,
  ComposedChart,
  ErrorBar,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
  type BarShapeProps,
} from 'recharts';

import { AXIS_PROPS } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, DOMAIN_MAX, SLA_MINUTES, WITHOUT_CONTACT, type Contact, type SdrQueue } from './data';

/**
 * Box plot: cinco números por grupo. A caixa vai do primeiro ao terceiro quartil, o traço de dentro
 * é a mediana, os bigodes alcançam o último valor dentro das cercas de Tukey e o que passa delas
 * vira ponto com nome.
 *
 * É o resumo mais compacto da família e também o mais mal lido, então esta peça carrega três coisas
 * que costumam faltar. O `n` de cada fila, porque caixa sem amostra não diz se a forma é sinal ou
 * sorte. O método de quartil escrito no rodapé, porque interpolação linear e dobradiça de Tukey dão
 * caixas diferentes em amostra pequena, e o gerente que confere na planilha conclui que o painel
 * errou. E a frase de leitura, porque a caixa é a metade central dos casos, não a faixa aceitável.
 *
 * O outlier não é sujeira a esconder, e o código do lead nasce no dado justamente para ele abrir uma
 * fila de trabalho. Na tela cabe o código de um, não o dos dezenove: dentro da mesma fila dois pontos
 * vizinhos chegam a 4 px um do outro, e o código mede cerca de 35 px em 11 px de texto, então
 * dezenove rótulos se cobririam em vez de nomear. Escrito fica o do caso mais distante, no rodapé; no
 * Farol o resto sai do drill do ponto, que é onde a peça vira fila mesmo.
 */
export interface FirstContactBoxPlotProps {
  readonly data?: readonly SdrQueue[];
  readonly slaMinutes?: number;
  readonly domainMax?: number;
  readonly withoutContact?: number;
  readonly height?: number;
  readonly className?: string;
}

interface BoxRow {
  readonly id: string;
  readonly name: string;
  readonly n: number;
  readonly q1: number;
  readonly median: number;
  readonly q3: number;
  readonly whiskerLow: number;
  readonly whiskerHigh: number;
  readonly outliers: readonly Contact[];
  readonly aboveSla: number;
}

interface OutlierPoint {
  readonly name: string;
  readonly minutes: number;
  readonly code: string;
}

const MARGIN = { top: 20, right: 18, bottom: 4, left: 4 } as const;
const BOX_FILL = 'var(--line-subtle)';
const BOX_STROKE = 'var(--chart-1)';
const MEDIAN_STROKE = 'var(--chart-1)';
const WHISKER_STROKE = 'var(--text-muted)';
const OUTLIER_FILL = 'var(--negative)';
const CATEGORY_WIDTH = 128;
const BAR_SIZE = 20;
/** Traço mínimo quando o intervalo interquartil é zero: sem ele a caixa some e a mediana junto. */
const MIN_BOX_W = 2;
/** Cerca de Tukey: o bigode para no último valor a esta distância da caixa. */
const FENCE_FACTOR = 1.5;
const MEDIAN_W = 2;

/** Quartil por interpolação linear, a convenção declarada no rodapé. */
function quantile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return 0;
  const position = (sorted.length - 1) * p;
  const base = Math.floor(position);
  const next = sorted[base + 1] ?? sorted[base] ?? 0;
  const value = sorted[base] ?? 0;
  return value + (position - base) * (next - value);
}

/** Os cinco números mais os pontos além das cercas de 1,5 vez o intervalo interquartil. */
function summarize(queue: SdrQueue, slaMinutes: number): BoxRow {
  const sorted = [...queue.contacts].sort((a, b) => a.minutes - b.minutes);
  const values = sorted.map((contact) => contact.minutes);
  const q1 = quantile(values, 0.25);
  const median = quantile(values, 0.5);
  const q3 = quantile(values, 0.75);
  const iqr = q3 - q1;
  const low = q1 - FENCE_FACTOR * iqr;
  const high = q3 + FENCE_FACTOR * iqr;
  const inside = values.filter((value) => value >= low && value <= high);
  return {
    id: queue.id,
    name: queue.name,
    n: sorted.length,
    q1,
    median,
    q3,
    whiskerLow: inside[0] ?? q1,
    whiskerHigh: inside[inside.length - 1] ?? q3,
    outliers: sorted.filter((contact) => contact.minutes < low || contact.minutes > high),
    aboveSla: values.filter((value) => value > slaMinutes).length,
  };
}

export default function FirstContactBoxPlot({
  data = defaultData,
  slaMinutes = SLA_MINUTES,
  domainMax = DOMAIN_MAX,
  withoutContact = WITHOUT_CONTACT,
  height,
  className,
}: FirstContactBoxPlotProps) {
  /** Ordem pela mediana, da fila mais rápida para a mais lenta. Alfabética esconderia o gradiente. */
  const rows = data.map((queue) => summarize(queue, slaMinutes)).sort((a, b) => a.median - b.median);

  const outlierPoints: OutlierPoint[] = rows.flatMap((row) =>
    row.outliers.map((contact) => ({ name: row.name, minutes: contact.minutes, code: contact.id })),
  );

  /** O ponto mais distante da cerca, o único que cabe nomeado na tela. `null` sem nenhum outlier. */
  const farthest = outlierPoints.reduce<OutlierPoint | null>(
    (worst, point) => (worst === null || point.minutes > worst.minutes ? point : worst),
    null,
  );

  const total = rows.reduce((sum, row) => sum + row.n, 0);
  const above = rows.reduce((sum, row) => sum + row.aboveSla, 0);
  const fastest = rows[0];
  const slowest = rows[rows.length - 1];

  /**
   * Caixa, mediana e as duas pontas do bigode desenhadas no mesmo `shape`.
   *
   * O `ErrorBar` do Recharts mede a distância **a partir de Q3**, então a linha de baixo atravessa a
   * caixa inteira por dentro e, num tema escuro, passa por uma segunda mediana. A saída é a caixa
   * opaca desenhada aqui, que cobre o trecho invasor, mais as tampas nas pontas.
   */
  const renderBox = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = rows[Number(index)];
    if (row === undefined) return <g />;
    const left = Number(x);
    const span = Math.max(Number(width), MIN_BOX_W);
    const top = Number(y);
    const boxHeight = Number(barHeight);
    const iqr = row.q3 - row.q1;
    /** Pixels por minuto, lidos da própria caixa: é a escala que o Recharts já resolveu. */
    const scale = iqr > 0 ? Number(width) / iqr : 0;
    const at = (value: number): number => left + (value - row.q1) * scale;
    const capTop = top + boxHeight * 0.25;
    const capBottom = top + boxHeight * 0.75;
    const medianX = left + (iqr > 0 ? ((row.median - row.q1) / iqr) * span : 0);
    return (
      <g>
        {scale > 0 ? (
          <>
            <line
              stroke={WHISKER_STROKE}
              strokeWidth={1}
              x1={at(row.whiskerLow)}
              x2={at(row.whiskerHigh)}
              y1={top + boxHeight / 2}
              y2={top + boxHeight / 2}
            />
            <line stroke={WHISKER_STROKE} strokeWidth={1} x1={at(row.whiskerLow)} x2={at(row.whiskerLow)} y1={capTop} y2={capBottom} />
            <line stroke={WHISKER_STROKE} strokeWidth={1} x1={at(row.whiskerHigh)} x2={at(row.whiskerHigh)} y1={capTop} y2={capBottom} />
          </>
        ) : null}
        <rect fill={BOX_FILL} height={boxHeight} stroke={BOX_STROKE} strokeWidth={1} width={span} x={left} y={top} />
        <rect fill={MEDIAN_STROKE} height={boxHeight} width={MEDIAN_W} x={medianX - MEDIAN_W / 2} y={top} />
      </g>
    );
  };

  const summary =
    fastest === undefined || slowest === undefined
      ? 'Box plot sem nenhuma fila para medir.'
      : `Box plot dos minutos até o primeiro contato em ${formatInt(rows.length)} filas de pré-vendas, com ${formatInt(total)} leads. ` +
        `A mediana vai de ${formatInt(Math.round(fastest.median))} minutos em ${fastest.name} a ${formatInt(Math.round(slowest.median))} em ${slowest.name}. ` +
        `${formatPercent(total === 0 ? 0 : above / total, 1)} dos leads passaram do SLA de ${formatInt(slaMinutes)} minutos.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart data={rows} layout="vertical" margin={MARGIN}>
            <XAxis
              {...AXIS_PROPS}
              domain={[0, domainMax]}
              tickFormatter={(value: number) => formatInt(value)}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              allowDuplicatedCategory={false}
              dataKey="name"
              interval={0}
              tick={(props: { x?: number | string; y?: number | string; payload?: { value?: string } }) => {
                const row = rows.find((item) => item.name === props.payload?.value);
                return (
                  <g transform={`translate(${String(Number(props.x ?? 0))},${String(Number(props.y ?? 0))})`}>
                    {/* Nome e n na mesma linha: em duas linhas o n de uma fila encosta no nome da
                        fila de baixo, e o piso de 11 px não deixa encolher para caber. */}
                    <text
                      className="tabular-nums"
                      dominantBaseline="central"
                      fill="var(--text-secondary)"
                      fontSize={11}
                      textAnchor="end"
                      x={-8}
                    >
                      {row === undefined ? '' : `${row.name} · n ${formatInt(row.n)}`}
                    </text>
                  </g>
                );
              }}
              type="category"
              width={CATEGORY_WIDTH}
            />
            <ReferenceLine
              label={{
                fill: 'var(--text-muted)',
                fontSize: 11,
                position: 'top',
                value: `SLA ${formatInt(slaMinutes)} min`,
              }}
              stroke="var(--line-strong)"
              strokeDasharray="4 3"
              x={slaMinutes}
            />
            <Bar
              barSize={BAR_SIZE}
              dataKey={(row: BoxRow) => [row.q1, row.q3]}
              isAnimationActive={false}
              shape={renderBox}
            >
              {/* Declarado, e não desenhado: o bigode sai do `shape` acima porque a distância do
                  ErrorBar é medida a partir de Q3 e a linha de baixo cruzaria a caixa por dentro. */}
              <ErrorBar
                dataKey={(row: BoxRow) => [row.q3 - row.whiskerLow, row.whiskerHigh - row.q3]}
                stroke="transparent"
                width={0}
              />
            </Bar>
            <Scatter
              data={outlierPoints}
              dataKey="minutes"
              fill={OUTLIER_FILL}
              isAnimationActive={false}
              shape="circle"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`minutos até o primeiro contato, n ${formatInt(total)} leads`}</span>
        <span>quartil por interpolação linear</span>
        {/* A ordem vai escrita: a mediana ordena as filas e não está escrita em lugar nenhum do
            desenho, então sem esta linha os nomes leem como lista arbitrária (GEO-12). */}
        <span>filas ordenadas pela mediana, da mais rápida para a mais lenta</span>
        <span className="tabular-nums">{`caixa: metade central dos casos; bigode até a cerca de ${formatDecimal(FENCE_FACTOR, 1)} vez`}</span>
        {/* O código do lead sai do dado e chega à tela aqui, no caso mais distante: sobre os pontos
            não cabe, porque dois vizinhos da mesma fila ficam a 4 px e o código mede cerca de 35. */}
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full" style={{ backgroundColor: OUTLIER_FILL }} />
          <span className="tabular-nums">
            {farthest === null
              ? `${formatInt(outlierPoints.length)} leads além da cerca`
              : `${formatInt(outlierPoints.length)} leads além da cerca; o mais distante é o ${farthest.code}, com ${formatInt(farthest.minutes)} min`}
          </span>
        </span>
        <span className="tabular-nums">{`${formatPercent(total === 0 ? 0 : above / total, 1)} acima do SLA de ${formatInt(slaMinutes)} min`}</span>
        {withoutContact <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(withoutContact)} leads ainda sem contato ficaram fora`}</span>
        )}
      </div>
    </figure>
  );
}
