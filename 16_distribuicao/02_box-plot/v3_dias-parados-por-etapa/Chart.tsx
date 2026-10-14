import type { ReactElement } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useYAxisScale,
  type BarShapeProps,
} from 'recharts';

import { AXIS_PROPS, GRID_COLOR } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatDecimal, formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  BEYOND_DOMAIN,
  data as defaultData,
  DOMAIN_MAX,
  STALLED_DAYS,
  WITHOUT_STAGE_DATE,
  type FunnelStage,
} from './data';

/**
 * Box plot de dias parados, uma caixa por etapa do funil, com os casos extremos nomeados.
 *
 * A peça existe para responder onde o funil trava, e por isso ela resolve duas tensões que um box
 * plot de operação sempre encontra.
 *
 * A primeira é o caso distante. Uma oportunidade parada há 412 dias, num eixo que precisa mostrar
 * medianas de 6 a 46 dias, comprimiria as oito caixas em menos de um terço da largura útil. Esticar o
 * eixo até ela é sacrificar a leitura de 1.900 casos por um; cortá-la do dado é apagar justamente a
 * oportunidade que alguém precisa abrir hoje. A saída é o teto fixo com marcador na borda: o caso
 * continua na tela, com o código e o número escritos, e o eixo continua legível.
 *
 * A segunda é o outlier como fila de trabalho. Cada ponto além da cerca é uma oportunidade com nome,
 * e o clique dele devolve o código para quem colar a peça numa página abrir o drill. O código escrito
 * na tela é só o do caso mais distante, e isso é medição e não escolha: trinta e dois códigos de
 * cerca de 60 px cada não cabem numa banda de 38 px de altura, e rótulo que se cobre não nomeia.
 */
export interface StalledDaysBoxPlotProps {
  readonly data?: readonly FunnelStage[];
  readonly stalledDays?: number;
  readonly domainMax?: number;
  readonly withoutStageDate?: number;
  /** Devolve o código da oportunidade clicada, para a página abrir o drill dela. */
  readonly onOutlierSelect?: (code: string) => void;
  readonly height?: number;
  readonly className?: string;
}

/** Os cinco números da caixa. `null` no lugar deste objeto quando a etapa não tem caso a resumir. */
interface BoxFive {
  readonly q1: number;
  readonly median: number;
  readonly q3: number;
  readonly whiskerLow: number;
  readonly whiskerHigh: number;
}

interface StageRow {
  readonly id: string;
  readonly name: string;
  readonly n: number;
  /** `null` quando não há observação. Quartis zerados desenhariam a etapa como se fosse instantânea. */
  readonly box: BoxFive | null;
  readonly stalled: number;
}

interface OutlierPoint {
  readonly name: string;
  readonly days: number;
  readonly code: string;
}

const MARGIN = { top: 22, right: 16, bottom: 4, left: 4 } as const;
const BOX_STROKE = 'var(--chart-1)';
const MEDIAN_FILL = 'var(--chart-1)';
const WHISKER_STROKE = 'var(--text-muted)';
const OUTLIER_FILL = 'var(--negative)';
const Y_AXIS_WIDTH = 168;
const X_TICKS = [0, 45, 90, 135, 180] as const;
/** Vão de 30% por lado: pela ESP-6 sobram 40% da banda para a caixa, e o teto de 20 px a limita. */
const BAR_CATEGORY_GAP = '30%';
const BOX_MAX_H = 20;
/** Traço mínimo quando o intervalo interquartil é zero: sem ele a caixa some e a mediana junto. */
const MIN_BOX_W = 2;
const MEDIAN_W = 2;
/** Cerca de Tukey: o bigode para no último valor a esta distância da caixa. */
const FENCE_FACTOR = 1.5;
const OUTLIER_R = 2.6;
const MARKER_Z = 2;
const MARKER_R = 5;
/** A chamada carrega a relação entre o rótulo e o marcador, então ela é dado e mede 3:1 (ACE-6). */
const MARKER_LEAD_STROKE = 'var(--text-muted)';
/** Respiro entre a ponta do marcador de borda e a tinta do rótulo dele. */
const MARKER_GAP = 14;
/** O rótulo do caso de borda sobe do centro da banda para não cruzar o próprio bigode da etapa. */
const MARKER_LABEL_RISE = 13;
const MARKER_FONT = 11;

/**
 * Quartil por interpolação linear, a convenção declarada no rodapé.
 *
 * Devolve `null` para lista vazia, nunca `0`: a caixa de quartis zerados nasce colada no zero do eixo
 * e se lê como "esta etapa não retém nada", que é o oposto de "esta etapa não tem caso medido".
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

/** Os cinco números da etapa, ou `null` quando ela não tem observação que os sustente. */
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

/**
 * O par de quartis da linha, e `[null, null]` quando ela não tem caixa.
 *
 * A caixa é opcional no tipo do parâmetro de propósito, e isso não é frouxidão: com
 * `allowDuplicatedCategory` desligado o Recharts avalia o `dataKey` do `Bar` **também sobre as linhas
 * do `Scatter`**, que são casos além da cerca e não têm caixa nenhuma. Sem esta guarda o componente
 * quebra ao montar, com "Cannot read properties of undefined", e o render não grava preview algum. A
 * v1 escapou por acaso, porque lá os quartis moram no primeiro nível da linha e a leitura de um campo
 * ausente devolve `undefined` em vez de lançar.
 */
function boxPair(row: { readonly box?: BoxFive | null }): readonly (number | null)[] {
  const box = row.box;
  if (box === undefined || box === null) return [null, null];
  return [box.q1, box.q3];
}

/** Os casos além da cerca de uma etapa, já com o nome dela para o eixo de categoria. */
function outliersOf(stage: FunnelStage, box: BoxFive | null): readonly OutlierPoint[] {
  if (box === null) return [];
  const iqr = box.q3 - box.q1;
  return stage.opportunities
    .filter(
      (item) => item.days < box.q1 - FENCE_FACTOR * iqr || item.days > box.q3 + FENCE_FACTOR * iqr,
    )
    .map((item) => ({ name: stage.name, days: item.days, code: item.id }));
}

interface EdgeCase {
  readonly stageName: string;
  readonly code: string;
  readonly days: number;
}

/**
 * Os casos além do teto do eixo, desenhados na borda em vez de esticarem o domínio.
 *
 * Vive num componente à parte porque a posição depende da escala de categoria e da área de plotagem,
 * e as duas só existem depois que o Recharts resolve o painel. Constante no lugar delas seria chute, e
 * o chute só aparece no PNG.
 */
function EdgeMarkers({
  cases,
  onSelect,
}: {
  readonly cases: readonly EdgeCase[];
  readonly onSelect?: (code: string) => void;
}) {
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (!yScale || !plot || cases.length === 0) return null;

  const tip = plot.x + plot.width;

  return (
    <ZIndexLayer zIndex={MARKER_Z}>
      {cases.map((item) => {
        const center = yScale(item.stageName, { position: 'middle' });
        if (center === undefined) return null;
        const middle = Number(center);
        return (
          <g
            key={item.code}
            onClick={onSelect === undefined ? undefined : () => { onSelect(item.code); }}
            style={onSelect === undefined ? undefined : { cursor: 'pointer' }}
          >
            {/* Seta apontando para fora: o caso não está no eixo, está além dele. */}
            <polygon
              fill={OUTLIER_FILL}
              points={`${String(tip)},${String(middle)} ${String(tip - MARKER_R * 1.6)},${String(middle - MARKER_R)} ${String(tip - MARKER_R * 1.6)},${String(middle + MARKER_R)}`}
            />
            {/* Linha de chamada, e ela é obrigatória e não enfeite: o rótulo sobe do centro da banda
                porque no centro ele cruzaria o bigode da etapa, e o halo de 4 px da ROT-7 apagaria um
                traço de 1 px em vez de deixá-lo ver. Subindo, o rótulo fica a meio caminho entre duas
                etapas e deixa de dizer de quem ele é; a chamada devolve o dono. */}
            <line
              stroke={MARKER_LEAD_STROKE}
              strokeWidth={1}
              x1={tip - MARKER_R * 1.6 - MARKER_GAP + 2}
              x2={tip - MARKER_R * 1.6 - 2}
              y1={middle - MARKER_LABEL_RISE + 3}
              y2={middle}
            />
            <text
              className="font-display"
              fill="var(--text-secondary)"
              fontSize={MARKER_FONT}
              textAnchor="end"
              x={tip - MARKER_R * 1.6 - MARKER_GAP}
              y={middle - MARKER_LABEL_RISE}
            >
              {`${item.code} · ${formatDays(item.days)}`}
            </text>
          </g>
        );
      })}
    </ZIndexLayer>
  );
}

export default function StalledDaysBoxPlot({
  data = defaultData,
  stalledDays = STALLED_DAYS,
  domainMax = DOMAIN_MAX,
  withoutStageDate = WITHOUT_STAGE_DATE,
  onOutlierSelect,
  height,
  className,
}: StalledDaysBoxPlotProps) {
  /**
   * Ordem de funil, do topo para a base, e não por mediana. É a única ordem em que "onde o funil
   * trava" é uma pergunta com resposta: reordenar por mediana responderia a pergunta antes de o
   * leitor olhar, e perderia a informação de que o gargalo está perto do fim.
   */
  const rows: readonly StageRow[] = data.map((stage) => {
    const values = stage.opportunities.map((item) => item.days);
    return {
      id: stage.id,
      name: stage.name,
      n: stage.opportunities.length,
      box: five(values),
      stalled: values.filter((value) => value > stalledDays).length,
    };
  });

  const inFence: readonly OutlierPoint[] = data.flatMap((stage, index) => {
    const row = rows[index];
    return outliersOf(stage, row === undefined ? null : row.box);
  });

  /** Dentro do domínio vai como ponto; além dele vira marcador na borda, com o valor escrito. */
  const plotted = inFence.filter((point) => point.days <= domainMax);

  const edgeCases: readonly EdgeCase[] = BEYOND_DOMAIN.flatMap((item) => {
    const row = rows.find((candidate) => candidate.id === item.stageId);
    if (row === undefined) return [];
    return [{ stageName: row.name, code: item.id, days: item.days }];
  });

  const total = rows.reduce((sum, row) => sum + row.n, 0);
  const stalled = rows.reduce((sum, row) => sum + row.stalled, 0);
  const beyondFence = inFence.length + edgeCases.length;

  /** O caso mais distante, o único que cabe nomeado no desenho. `null` sem nenhum caso além da cerca. */
  const farthest = [...inFence, ...edgeCases.map((item) => ({ code: item.code, days: item.days }))].reduce<
    { readonly code: string; readonly days: number } | null
  >((worst, item) => (worst === null || item.days > worst.days ? item : worst), null);

  const measured = rows.filter((row): row is StageRow & { box: BoxFive } => row.box !== null);
  const quickest = measured.reduce<(StageRow & { box: BoxFive }) | null>(
    (best, row) => (best === null || row.box.median < best.box.median ? row : best),
    null,
  );
  const slowest = measured.reduce<(StageRow & { box: BoxFive }) | null>(
    (worst, row) => (worst === null || row.box.median > worst.box.median ? row : worst),
    null,
  );

  /**
   * Caixa, mediana e os dois trechos de bigode desenhados no mesmo `shape`.
   *
   * O bigode sai em dois trechos, de `whiskerLow` a `q1` e de `q3` a `whiskerHigh`, e nunca numa linha
   * atravessando a caixa: linha contínua por dentro de caixa vazada lê como uma segunda mediana, que é
   * o mesmo defeito do `ErrorBar` do exemplo oficial do Recharts, que mede a distância a partir de Q3.
   */
  const renderBox = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = rows[Number(index)];
    if (row === undefined || row.box === null) return <g />;
    const box = row.box;
    const left = Number(x);
    const top = Number(y);
    const tall = Number(barHeight);
    const middle = top + tall / 2;
    const capTop = middle - tall * 0.25;
    const capBottom = middle + tall * 0.25;
    const iqr = box.q3 - box.q1;

    /* Interquartil zero não tem escala de pixel por dia, e por isso a saída é outra em vez de uma
       escala valendo zero: o zero aqui empilharia bigode e mediana sobre a mesma coluna. */
    if (iqr <= 0) {
      return (
        <g>
          <rect fill="none" height={tall} stroke={BOX_STROKE} strokeWidth={1} width={MIN_BOX_W} x={left} y={top} />
        </g>
      );
    }

    /** Pixels por dia, lidos da própria caixa: é a escala que o Recharts já resolveu. */
    const scale = Number(width) / iqr;
    const at = (value: number): number => left + (value - box.q1) * scale;
    return (
      <g>
        <line stroke={WHISKER_STROKE} strokeWidth={1} x1={at(box.whiskerLow)} x2={left} y1={middle} y2={middle} />
        <line stroke={WHISKER_STROKE} strokeWidth={1} x1={left + Number(width)} x2={at(box.whiskerHigh)} y1={middle} y2={middle} />
        <line stroke={WHISKER_STROKE} strokeWidth={1} x1={at(box.whiskerLow)} x2={at(box.whiskerLow)} y1={capTop} y2={capBottom} />
        <line stroke={WHISKER_STROKE} strokeWidth={1} x1={at(box.whiskerHigh)} x2={at(box.whiskerHigh)} y1={capTop} y2={capBottom} />
        <rect fill="none" height={tall} stroke={BOX_STROKE} strokeWidth={1} width={Number(width)} x={left} y={top} />
        <rect fill={MEDIAN_FILL} height={tall} width={MEDIAN_W} x={at(box.median) - MEDIAN_W / 2} y={top} />
      </g>
    );
  };

  const summary =
    quickest === null || slowest === null
      ? 'Box plot dos dias parados sem nenhuma etapa com caso medido para resumir.'
      : `Box plot dos dias parados em ${formatInt(rows.length)} etapas do funil, com ${formatInt(total)} oportunidades abertas. ` +
        `A mediana vai de ${formatDays(quickest.box.median)} em ${quickest.name} a ${formatDays(slowest.box.median)} em ${slowest.name}. ` +
        `${formatRateWithVolume(stalled, total)} passam do limiar de ${formatDays(stalledDays)}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            {/* Grade só na direção da leitura: o valor corre em X, então a régua é a linha vertical.
                A linha horizontal seria transversal ao eixo de categoria e só sujaria (EIX-3). */}
            <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
            {/* `axisLine={false}` DEPOIS do espalhamento: o AXIS_PROPS traz a linha de eixo ligada, e
                em JSX a última propriedade vence, então a ordem inversa não desligaria nada. */}
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, domainMax]}
              interval={0}
              tickFormatter={(value: number) => formatInt(value)}
              tickMargin={8}
              ticks={[...X_TICKS]}
              type="number"
            />
            {/* `allowDuplicatedCategory` desligado por causa do Scatter: com ele ligado cada caso além
                da cerca abriria uma banda nova e as oito etapas virariam dezenas de linhas invisíveis. */}
            <YAxis
              {...AXIS_PROPS}
              allowDuplicatedCategory={false}
              axisLine={false}
              dataKey="name"
              interval={0}
              tick={(props: { x?: number | string; y?: number | string; payload?: { value?: string } }) => {
                const row = rows.find((item) => item.name === props.payload?.value);
                return (
                  <g transform={`translate(${String(Number(props.x ?? 0))},${String(Number(props.y ?? 0))})`}>
                    {/* Nome e n na mesma linha: em duas linhas o n de uma etapa encosta no nome da
                        etapa de baixo, e o piso de 11 px não deixa encolher para caber (REC-10). */}
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
              width={Y_AXIS_WIDTH}
            />
            {/* `ifOverflow="extendDomain"`: sem ele o limiar some no recorte em que toda etapa o passa,
                que é exatamente o recorte em que alguém precisa vê-lo. */}
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{
                fill: 'var(--text-muted)',
                fontSize: 11,
                position: 'top',
                value: `parada a partir de ${formatDays(stalledDays)}`,
              }}
              stroke="var(--line-strong)"
              strokeDasharray="4 3"
              x={stalledDays}
            />
            <Bar
              dataKey={boxPair}
              isAnimationActive={false}
              maxBarSize={BOX_MAX_H}
              shape={renderBox}
            />
            <Scatter
              data={[...plotted]}
              dataKey="days"
              isAnimationActive={false}
              shape={(props: { cx?: number; cy?: number; payload?: { code?: string } }) => {
                const code = props.payload?.code;
                return (
                  <circle
                    cx={Number(props.cx ?? 0)}
                    cy={Number(props.cy ?? 0)}
                    fill={OUTLIER_FILL}
                    onClick={
                      onOutlierSelect === undefined || code === undefined
                        ? undefined
                        : () => { onOutlierSelect(code); }
                    }
                    r={OUTLIER_R}
                    stroke="var(--surface-raised)"
                    strokeWidth={0.5}
                    style={onOutlierSelect === undefined ? undefined : { cursor: 'pointer' }}
                  />
                );
              }}
            />
            <EdgeMarkers cases={edgeCases} onSelect={onOutlierSelect} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">{`dias parados na etapa atual, n ${formatInt(total)} oportunidades abertas`}</span>
        {/* A ordem vai escrita porque nenhuma marca do desenho a declara: a mediana que o leitor
            compara é um traço, nunca um número, e ordem de funil não é ordem de valor (GEO-12). */}
        <span>quartil por interpolação linear; etapas em ordem de funil</span>
        <span className="tabular-nums">{`caixa: metade central dos casos; bigode até a cerca de ${formatDecimal(FENCE_FACTOR, 1)} vez`}</span>
        <span className="flex items-center gap-1">
          <svg aria-hidden className="shrink-0" height={9} viewBox="0 0 9 9" width={9}>
            <circle cx={4.5} cy={4.5} fill={OUTLIER_FILL} r={3} />
          </svg>
          <span className="tabular-nums">
            {farthest === null
              ? `${formatInt(beyondFence)} oportunidades além da cerca`
              : `${formatInt(beyondFence)} além da cerca; a mais distante é a ${farthest.code}, com ${formatDays(farthest.days)}`}
          </span>
        </span>
        {edgeCases.length === 0 ? null : (
          <span className="flex items-center gap-1">
            <svg aria-hidden className="shrink-0" height={9} viewBox="0 0 9 9" width={9}>
              <polygon fill={OUTLIER_FILL} points="8.5,4.5 1.5,0.5 1.5,8.5" />
            </svg>
            <span className="tabular-nums">
              {`${formatInt(edgeCases.length)} casos passam do teto de ${formatDays(domainMax)} e vão na borda, com o valor escrito`}
            </span>
          </span>
        )}
        <span className="tabular-nums">{`${formatRateWithVolume(stalled, total)} passam do limiar de ${formatDays(stalledDays)}`}</span>
        {withoutStageDate <= 0 ? null : (
          <span className="tabular-nums">{`${formatInt(withoutStageDate)} sem data de etapa ficaram fora`}</span>
        )}
      </div>
    </figure>
  );
}
