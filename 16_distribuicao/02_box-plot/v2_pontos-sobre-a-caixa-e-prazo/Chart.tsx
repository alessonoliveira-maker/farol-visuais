import type { ReactElement } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
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
import { formatDecimal, formatHours, formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, DEADLINE_HOURS, DOMAIN_MAX, WITHOUT_SCHEDULE, type SdrQueue } from './data';

/**
 * Box plot com todos os pontos por cima: a caixa vazada dá o resumo e a nuvem de pontos devolve o
 * que o resumo apaga.
 *
 * A caixa é vazada, e não opaca, porque aqui ela é o fundo e não o assunto. Numa fila desta amostra
 * a caixa mente por construção: treze leads ficam entre 3 e 9 horas, treze entre 62 e 96, e os cinco
 * números desenham uma caixa larga com a mediana no meio do vazio, onde não existe um único caso. A
 * caixa não está errada, ela é o que é: um resumo de cinco números não distingue um grupo espalhado
 * de dois grupos separados, e só o ponto por cima distingue.
 *
 * O jitter é o preço de mostrar cada caso: sem ele os leads de mesma hora viram um ponto só, e a
 * pilha desaparece justamente onde ela é a informação. Ele sai de um hash do código do lead, nunca
 * de `Math.random`, porque o preview precisa sair igual em qualquer máquina, e a amplitude vem da
 * largura da banda medida em tempo de desenho, para a nuvem nunca invadir a fila vizinha.
 *
 * Duas coisas que o catálogo pedia e a medição mudou, as duas declaradas no `meta.json`. A opacidade
 * de 0,45 sobre a marca cai para 2,96:1 no tema escuro e 2,04:1 no claro contra o cartão, abaixo do
 * piso de 3:1 da ACE-5, então os pontos são opacos e a pilha se separa por contorno na cor da
 * superfície, que é a outra saída que a própria ACE-5 oferece. E o token `--danger` não existe nos
 * tokens do Farol: quem marca o caso fora do prazo é `--negative`.
 */
export interface ScheduleBoxPlotProps {
  readonly data?: readonly SdrQueue[];
  readonly deadlineHours?: number;
  readonly domainMax?: number;
  readonly withoutSchedule?: number;
  readonly height?: number;
  readonly className?: string;
}

/** Os cinco números da caixa. `null` no lugar deste objeto quando a fila não tem lead nenhum. */
interface BoxFive {
  readonly q1: number;
  readonly median: number;
  readonly q3: number;
  readonly whiskerLow: number;
  readonly whiskerHigh: number;
}

interface QueueRow {
  readonly id: string;
  readonly name: string;
  readonly n: number;
  /** `null` quando não há observação para resumir. Caixa de quartis zerados leria como fila instantânea. */
  readonly box: BoxFive | null;
  readonly above: number;
  readonly points: readonly { readonly id: string; readonly hours: number }[];
}

const MARGIN = { top: 22, right: 62, bottom: 4, left: 4 } as const;
const BOX_STROKE = 'var(--chart-1)';
const MEDIAN_FILL = 'var(--chart-1)';
const WHISKER_STROKE = 'var(--text-muted)';
/** Ponto dentro do prazo: neutro de referência, opaco, medido em 5,21:1 e 5,37:1 contra o cartão. */
const POINT_FILL = 'var(--text-muted)';
/** Ponto fora do prazo: opaco, 5,50:1 e 6,36:1. Muda de cor E de forma, porque cor sozinha não basta. */
const LATE_FILL = 'var(--negative)';
const Y_AXIS_WIDTH = 48;
const Y_TICKS = [0, 30, 60, 90, 120] as const;
/** Vão de 35% por lado: pela ESP-6, sobram 30% da banda para a caixa, que o teto de 24 px limita. */
const BAR_CATEGORY_GAP = '35%';
const BOX_MAX_W = 24;
/** Traço mínimo quando o intervalo interquartil é zero: sem ele a caixa some e a mediana junto. */
const MIN_BOX_H = 2;
const MEDIAN_H = 2;
/** Cerca de Tukey: o bigode para no último valor a esta distância da caixa. */
const FENCE_FACTOR = 1.5;
const POINT_R = 2.5;
const LATE_R = 3.4;
/** Fração da banda que a nuvem pode ocupar. O resto garante que ela não encoste na fila vizinha. */
const JITTER_SHARE = 0.62;
const POINT_Z = 2;
const COUNT_FONT = 11;

/**
 * Quartil por interpolação linear, a convenção declarada no rodapé.
 *
 * Devolve `null` para lista vazia, nunca `0`: num box plot o zero de uma agregação desenha a caixa
 * colada no piso do eixo, que se lê como "esta fila responde na hora" em vez de "não houve caso".
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

/** Os cinco números da fila, ou `null` quando ela não tem observação que os sustente. */
function five(values: readonly number[]): BoxFive | null {
  const sorted = [...values].sort((a, b) => a - b);
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

function summarize(queue: SdrQueue, deadlineHours: number): QueueRow {
  const values = queue.leads.map((lead) => lead.hours);
  return {
    id: queue.id,
    name: queue.name,
    n: queue.leads.length,
    box: five(values),
    above: values.filter((value) => value > deadlineHours).length,
    points: queue.leads.map((lead) => ({ id: lead.id, hours: lead.hours })),
  };
}

/**
 * Hash FNV-1a de 32 bits do código do lead.
 *
 * Existe porque o jitter precisa ser aleatório para o olho e fixo para o arquivo: `Math.random`
 * daria uma nuvem diferente a cada render e o `preview.svg` deixaria de ser o retrato do componente.
 */
function hashFnv(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/** Deslocamento em fração de −1 a 1, estável por código de lead. */
function jitterFraction(id: string): number {
  return (hashFnv(id) % 2001) / 1000 - 1;
}

/** Losango, para o caso fora do prazo mudar de forma e não só de cor. */
function diamond(cx: number, cy: number, radius: number): string {
  return `${String(cx)},${String(cy - radius)} ${String(cx + radius)},${String(cy)} ${String(cx)},${String(cy + radius)} ${String(cx - radius)},${String(cy)}`;
}

/**
 * A nuvem de pontos e o `n` de cada fila, posicionados pelas escalas do próprio gráfico.
 *
 * Vive num componente à parte porque a amplitude do jitter depende da largura da banda, e a banda só
 * existe depois que o Recharts resolve a área de plotagem: calculá-la por constante seria chute, e o
 * chute só aparece no PNG, encostando a nuvem de uma fila na da vizinha.
 */
function PointCloud({
  rows,
  deadlineHours,
}: {
  readonly rows: readonly QueueRow[];
  readonly deadlineHours: number;
}) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (!xScale || !yScale || !plot || rows.length === 0) return null;

  const band = plot.width / rows.length;
  const amplitude = Math.max(0, (band * JITTER_SHARE) / 2 - LATE_R);

  return (
    <ZIndexLayer zIndex={POINT_Z}>
      {rows.map((row) => {
        const center = xScale(row.name, { position: 'middle' });
        if (center === undefined) return null;
        return (
          <g key={row.id}>
            {/* O n fica na margem reservada do topo, e não no tique de categoria: no tique ele
                somaria uns 40 px ao nome e os rótulos de filas vizinhas encostariam (ROT-9). */}
            <text
              className="font-display"
              fill="var(--text-muted)"
              fontSize={COUNT_FONT}
              textAnchor="middle"
              x={Number(center)}
              y={plot.y - 8}
            >
              {`n ${formatInt(row.n)}`}
            </text>
            {row.points.map((point) => {
              const cy = yScale(point.hours);
              if (cy === undefined) return null;
              const cx = Number(center) + jitterFraction(point.id) * amplitude;
              const late = point.hours > deadlineHours;
              return late ? (
                <polygon
                  fill={LATE_FILL}
                  key={point.id}
                  points={diamond(cx, Number(cy), LATE_R)}
                  stroke="var(--surface-raised)"
                  strokeWidth={0.5}
                />
              ) : (
                /* Contorno na cor da superfície em vez de opacidade: separa dois pontos colados sem
                   compor a cor da marca com a do cartão, que é o que derrubaria o contraste. */
                <circle
                  cx={cx}
                  cy={Number(cy)}
                  fill={POINT_FILL}
                  key={point.id}
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

export default function ScheduleBoxPlot({
  data = defaultData,
  deadlineHours = DEADLINE_HOURS,
  domainMax = DOMAIN_MAX,
  withoutSchedule = WITHOUT_SCHEDULE,
  height,
  className,
}: ScheduleBoxPlotProps) {
  /**
   * Ordem pela mediana, da fila mais rápida para a mais lenta, da esquerda para a direita. Fila sem
   * caixa não entra na ordenação por valor e vai para o fim, porque ela não tem mediana a comparar.
   */
  const rows = data
    .map((queue) => summarize(queue, deadlineHours))
    .sort((a, b) => {
      if (a.box === null || b.box === null) return (a.box === null ? 1 : 0) - (b.box === null ? 1 : 0);
      return a.box.median - b.box.median;
    });

  const measured = rows.filter((row): row is QueueRow & { box: BoxFive } => row.box !== null);
  const total = rows.reduce((sum, row) => sum + row.n, 0);
  const above = rows.reduce((sum, row) => sum + row.above, 0);
  const fastest = measured[0];
  const slowest = measured[measured.length - 1];

  /**
   * Caixa vazada, mediana e os dois trechos de bigode desenhados no mesmo `shape`.
   *
   * O bigode sai em dois trechos, de `whiskerLow` a `q1` e de `q3` a `whiskerHigh`, e não numa linha
   * só atravessando a caixa. É o que dispensa a caixa opaca da v1: uma linha contínua por dentro de
   * uma caixa vazada leria como uma segunda mediana, e é o mesmo defeito que o `ErrorBar` do exemplo
   * oficial do Recharts produz, porque ele mede a distância a partir de Q3.
   */
  const renderBox = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = rows[Number(index)];
    if (row === undefined || row.box === null) return <g />;
    const box = row.box;
    const left = Number(x);
    const span = Number(width);
    const iqr = box.q3 - box.q1;
    const pixels = Number(barHeight);
    const middle = left + span / 2;
    const capLeft = middle - span * 0.25;
    const capRight = middle + span * 0.25;

    /* Interquartil zero não tem escala de pixel por hora, e por isso a saída é outra em vez de uma
       escala valendo zero: o zero aqui viraria bigode e mediana empilhados na mesma linha. */
    if (iqr <= 0) {
      return (
        <g>
          <rect
            fill="none"
            height={MIN_BOX_H}
            stroke={BOX_STROKE}
            strokeWidth={1}
            width={span}
            x={left}
            y={Number(y) - MIN_BOX_H / 2}
          />
          <rect fill={MEDIAN_FILL} height={MEDIAN_H} width={span} x={left} y={Number(y) - MEDIAN_H / 2} />
        </g>
      );
    }

    /** Pixels por hora, lidos da própria caixa: é a escala que o Recharts já resolveu. */
    const scale = pixels / iqr;
    const at = (value: number): number => Number(y) + (box.q3 - value) * scale;
    return (
      <g>
        <line stroke={WHISKER_STROKE} strokeWidth={1} x1={middle} x2={middle} y1={at(box.whiskerHigh)} y2={Number(y)} />
        <line stroke={WHISKER_STROKE} strokeWidth={1} x1={middle} x2={middle} y1={Number(y) + pixels} y2={at(box.whiskerLow)} />
        <line stroke={WHISKER_STROKE} strokeWidth={1} x1={capLeft} x2={capRight} y1={at(box.whiskerHigh)} y2={at(box.whiskerHigh)} />
        <line stroke={WHISKER_STROKE} strokeWidth={1} x1={capLeft} x2={capRight} y1={at(box.whiskerLow)} y2={at(box.whiskerLow)} />
        <rect fill="none" height={pixels} stroke={BOX_STROKE} strokeWidth={1} width={span} x={left} y={Number(y)} />
        <rect fill={MEDIAN_FILL} height={MEDIAN_H} width={span} x={left} y={at(box.median) - MEDIAN_H / 2} />
      </g>
    );
  };

  const summary =
    fastest === undefined || slowest === undefined
      ? 'Box plot das horas até a agenda sem nenhuma fila com caso medido para resumir.'
      : `Box plot das horas até a agenda em ${formatInt(rows.length)} filas de pré-vendas, com cada um dos ${formatInt(total)} leads como ponto sobre a caixa. ` +
        `A mediana vai de ${formatHours(fastest.box.median)} em ${fastest.name} a ${formatHours(slowest.box.median)} em ${slowest.name}. ` +
        `${formatRateWithVolume(above, total)} passam do prazo de ${formatHours(deadlineHours)}.`;

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
            {/* Grade só na direção da leitura: aqui o valor corre no eixo Y, então a grade é
                horizontal e a transversal sujaria. O eixo de categoria mantém a EIX-3 de pé. */}
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            {/* `axisLine={false}` DEPOIS do espalhamento: o AXIS_PROPS traz a linha de eixo ligada,
                e em JSX a última propriedade vence, então a ordem inversa não desliga nada. */}
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
              tickFormatter={(value: number) => formatHours(value)}
              tickMargin={8}
              ticks={[...Y_TICKS]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            {/* `ifOverflow="extendDomain"`: sem ele a linha do prazo some no recorte em que alguma
                fila passa do teto do eixo, que é exatamente o recorte que interessa. */}
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{
                fill: 'var(--text-muted)',
                fontSize: 11,
                position: 'right',
                value: `prazo ${formatHours(deadlineHours)}`,
              }}
              stroke="var(--line-strong)"
              strokeDasharray="4 3"
              y={deadlineHours}
            />
            <Bar
              dataKey={(row: QueueRow) => (row.box === null ? [null, null] : [row.box.q1, row.box.q3])}
              isAnimationActive={false}
              maxBarSize={BOX_MAX_W}
              shape={renderBox}
            />
            <PointCloud deadlineHours={deadlineHours} rows={rows} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`horas até a agenda, n ${formatInt(total)} leads`}</span>
        <span>quartil por interpolação linear</span>
        {/* A ordem vai escrita: a mediana ordena as filas e não aparece em número no desenho, então
            sem esta linha os nomes leem como lista arbitrária (GEO-12). */}
        <span>filas em ordem de mediana crescente, da esquerda para a direita</span>
        <span className="tabular-nums">{`caixa: metade central dos casos; bigode até a cerca de ${formatDecimal(FENCE_FACTOR, 1)} vez`}</span>
        <span className="flex items-center gap-1">
          <svg aria-hidden className="shrink-0" height={9} viewBox="0 0 9 9" width={9}>
            <circle cx={4.5} cy={4.5} fill={POINT_FILL} r={3} />
          </svg>
          <span>um ponto é um lead dentro do prazo</span>
        </span>
        {/* A amostra vai em SVG, e não num `div` girado por classe: `transform` de rotação em HTML
            não sobrevive ao preview, e o losango chegaria ao arquivo como um quadrado. */}
        <span className="flex items-center gap-1">
          <svg aria-hidden className="shrink-0" height={9} viewBox="0 0 9 9" width={9}>
            <polygon fill={LATE_FILL} points="4.5,0.5 8.5,4.5 4.5,8.5 0.5,4.5" />
          </svg>
          <span className="tabular-nums">{`losango: ${formatRateWithVolume(above, total)} acima do prazo`}</span>
        </span>
        {withoutSchedule <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(withoutSchedule)} leads sem agenda ficaram fora`}</span>
        )}
      </div>
    </figure>
  );
}
