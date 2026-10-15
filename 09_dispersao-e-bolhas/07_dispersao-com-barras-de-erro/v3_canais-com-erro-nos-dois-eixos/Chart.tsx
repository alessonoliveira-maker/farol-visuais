import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ErrorBar,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { confidence as defaultConfidence, data as defaultData, type ChannelEstimate } from './data';

/**
 * Dispersão com incerteza nos DOIS eixos: cada ponto é um canal, posicionado pelo CPL médio do mês
 * no horizontal e pela taxa de qualificação no vertical, e cada eixo carrega a sua barra.
 *
 * As duas barras não são a mesma coisa, e é isso que a versão existe para ensinar. A horizontal é
 * um desvio padrão amostral do CPL entre as semanas, então mede oscilação de preço observada. A
 * vertical é o intervalo de confiança de Wilson da taxa, então mede o que a amostra não sabe. Uma
 * cresce quando o preço balança, a outra cresce quando o volume é pequeno, e um canal pode ter uma
 * larga e a outra estreita. Por isso as duas vão NOMEADAS no rodapé e na frase acessível: barra sem
 * nome convida o leitor a concluir o que quiser, que é a mesma classe de defeito da GEO-12.
 */
export interface ChannelTwoAxisErrorScatterProps {
  readonly data?: readonly ChannelEstimate[];
  /** O nível de confiança do intervalo vertical, nomeado na tela e usado no cálculo. */
  readonly confidence?: number;
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly name: string;
  readonly cplMedio: number;
  readonly cplDesvio: number;
  readonly semanas: number;
  readonly leads: number;
  readonly qualificados: number;
  readonly rate: number;
  readonly lower: number;
  readonly upper: number;
  /** Par de DISTÂNCIAS a partir do ponto, simétrico: o desvio vale para os dois lados. */
  readonly errorX: readonly [number, number];
  /** Par de DISTÂNCIAS a partir do ponto, assimétrico: Wilson não é simétrico perto dos extremos. */
  readonly errorY: readonly [number, number];
}

const MARGIN = { top: 14, right: 36, bottom: 8, left: 8 } as const;
/** O eixo termina em R$ 280, a primeira linha de grade acima do maior CPL mais desvio, R$ 266. */
const DOMAIN_X: readonly [number, number] = [0, 280];
const TICKS_X = [0, 70, 140, 210, 280] as const;
/** O eixo termina em 60%, a primeira linha de grade acima do maior limite superior, 58,8% (EIX-4). */
const DOMAIN_Y: readonly [number, number] = [0, 0.6];
const TICKS_Y = [0, 0.15, 0.3, 0.45, 0.6] as const;
const Y_AXIS_WIDTH = 48;
/** Serifa curta: o traço precisa de ponta para não virar risco solto, e 5 px já basta. */
const ERROR_BAR_WIDTH = 5;
/** Raio fixado nas duas pontas do `ZAxis`, porque o tamanho do ponto aqui não codifica nada. */
const POINT_RADIUS = 4.5;
const Z_RANGE: readonly [number, number] = [
  Math.PI * POINT_RADIUS * POINT_RADIUS,
  Math.PI * POINT_RADIUS * POINT_RADIUS,
];
const LABEL_SIZE = 11;
/** Largura por caractere superestimada de propósito: errar sobrando não quebra nada (GEO-8). */
const LABEL_CHAR_WIDTH = 6.4;
const LABEL_PAD = 3;
/** Mínimo de semanas para haver desvio amostral; com uma só não existe dispersão a medir. */
const MIN_SEMANAS = 2;

type Anchor = 'start' | 'middle' | 'end';

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/**
 * As 6 candidatas de posição do nome, na ordem de preferência. Aqui as diagonais vêm ANTES do topo
 * e da base, ao contrário da `09/01/v2`: com barra nos dois eixos, a cruz de tinta em volta do
 * ponto ocupa os quatro sentidos retos, e a diagonal é o único lugar livre por desenho.
 */
const LABEL_CANDIDATES: readonly { readonly dx: number; readonly dy: number; readonly anchor: Anchor }[] = [
  { dx: 10, dy: -8, anchor: 'start' },
  { dx: -10, dy: -8, anchor: 'end' },
  { dx: 10, dy: 15, anchor: 'start' },
  { dx: -10, dy: 15, anchor: 'end' },
  { dx: 0, dy: -14, anchor: 'middle' },
  { dx: 0, dy: 20, anchor: 'middle' },
];

/** Média aritmética; `null` em lista vazia, porque média sem base é ausência e não zero (EST-1b). */
function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  let soma = 0;
  for (const value of values) soma += value;
  return soma / values.length;
}

/**
 * Desvio padrão AMOSTRAL, com `n − 1` no denominador, porque as semanas do mês são uma amostra do
 * comportamento do canal e não a população inteira. `null` com menos de duas semanas.
 */
function sampleStdDev(values: readonly number[]): number | null {
  if (values.length < MIN_SEMANAS) return null;
  const media = mean(values);
  if (media === null) return null;
  let soma = 0;
  for (const value of values) soma += (value - media) ** 2;
  return Math.sqrt(soma / (values.length - 1));
}

/**
 * Intervalo de confiança de Wilson para uma proporção `k/n`, no nível `level`.
 *
 * Devolve os limites ABSOLUTOS; quem chama converte em distância a partir do ponto, porque é isso
 * que o `dataKey` do `ErrorBar` espera. Passar o limite ali desenha uma barra do tamanho errado sem
 * erro de compilação, e é o ponto delicado do modelo (REC-20).
 */
function wilson(k: number, n: number, level: number): { readonly lower: number; readonly upper: number } | null {
  if (n <= 0) return null;
  const z = zScore(level);
  const z2 = z * z;
  const p = k / n;
  const center = (p + z2 / (2 * n)) / (1 + z2 / n);
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / (1 + z2 / n);
  return { lower: Math.max(0, center - half), upper: Math.min(1, center + half) };
}

/** O z de duas caudas dos níveis que o cartão usa; fora deles, o de 95%, que é o rótulo padrão. */
function zScore(level: number): number {
  if (level >= 0.99) return 2.576;
  if (level >= 0.95) return 1.96;
  return 1.645;
}

function overlaps(a: Box, b: Box, pad: number): boolean {
  return a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
}

/**
 * Camada dos nomes dos canais, em rótulo direto no lugar de legenda (ROT-4), desenhada por último
 * para ficar por cima das barras (REC-13).
 *
 * A caixa de cada marca é a CRUZ inteira, ponto mais as duas barras, porque é tudo tinta a desviar.
 * Sem os hooks de escala a posição seria chute, e o chute só aparece no PNG.
 */
function ChannelNameLayer({ points }: { readonly points: readonly Point[] }) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  const marks: Box[] = [];
  for (const point of points) {
    const esquerda = xScale(Math.max(DOMAIN_X[0], point.cplMedio - point.cplDesvio));
    const direita = xScale(Math.min(DOMAIN_X[1], point.cplMedio + point.cplDesvio));
    const topo = yScale(point.upper);
    const base = yScale(point.lower);
    if (esquerda === undefined || direita === undefined || topo === undefined || base === undefined) continue;
    marks.push({ left: esquerda - 2, top: topo - 2, right: direita + 2, bottom: base + 2 });
  }

  const placed: { readonly point: Point; readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number }[] = [];
  for (const point of points) {
    const cx = xScale(point.cplMedio);
    const cy = yScale(point.rate);
    if (cx === undefined || cy === undefined) continue;
    const width = point.name.length * LABEL_CHAR_WIDTH;
    let melhor: { readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number; readonly faltas: number } | null = null;
    for (const candidate of LABEL_CANDIDATES) {
      const x = cx + candidate.dx;
      const y = cy + candidate.dy;
      const left = candidate.anchor === 'start' ? x : candidate.anchor === 'end' ? x - width : x - width / 2;
      const box: Box = { left, top: y - LABEL_SIZE + 2, right: left + width, bottom: y + 2 };
      const foraDoPlano =
        box.left < plotArea.x + 1 ||
        box.right > plotArea.x + plotArea.width + MARGIN.right - LABEL_PAD ||
        box.top < plotArea.y ||
        box.bottom > plotArea.y + plotArea.height;
      const faltas =
        (foraDoPlano ? 100 : 0) +
        marks.filter((mark) => overlaps(box, mark, 1)).length +
        placed.filter((outro) => overlaps(box, outro.box, LABEL_PAD)).length;
      if (faltas === 0) {
        melhor = { box, anchor: candidate.anchor, x, y, faltas };
        break;
      }
      if (melhor === null || faltas < melhor.faltas) melhor = { box, anchor: candidate.anchor, x, y, faltas };
    }
    if (melhor === null) continue;
    placed.push({ point, box: melhor.box, anchor: melhor.anchor, x: melhor.x, y: melhor.y });
  }

  return (
    <g>
      {placed.map((item) => (
        <text
          className="font-display"
          fill="var(--text-primary)"
          fontSize={LABEL_SIZE}
          fontWeight={600}
          key={`nome-${item.point.id}`}
          style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
          textAnchor={item.anchor}
          x={item.x}
          y={item.y}
        >
          {item.point.name}
        </text>
      ))}
    </g>
  );
}

export default function ChannelTwoAxisErrorScatter({
  data = defaultData,
  confidence = defaultConfidence,
  height,
  className,
}: ChannelTwoAxisErrorScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const points: Point[] = [];
  let semSerie = 0;
  for (const row of data) {
    const media = mean(row.cplSemanal);
    const desvio = sampleStdDev(row.cplSemanal);
    const intervalo = wilson(row.qualificados, row.leads, confidence);
    if (media === null || desvio === null || intervalo === null) {
      semSerie += 1;
      continue;
    }
    const rate = row.qualificados / row.leads;
    points.push({
      id: row.id,
      name: row.name,
      cplMedio: media,
      cplDesvio: desvio,
      semanas: row.cplSemanal.length,
      leads: row.leads,
      qualificados: row.qualificados,
      rate,
      lower: intervalo.lower,
      upper: intervalo.upper,
      errorX: [desvio, desvio],
      errorY: [rate - intervalo.lower, intervalo.upper - rate],
    });
  }

  if (points.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum canal neste recorte com duas semanas de custo apurado e lead contado.</span>
      </div>
    );
  }

  let maisBarato = points[0];
  let melhorTaxa = points[0];
  if (maisBarato === undefined || melhorTaxa === undefined) return null;
  for (const point of points) {
    if (point.cplMedio < maisBarato.cplMedio) maisBarato = point;
    if (point.rate > melhorTaxa.rate) melhorTaxa = point;
  }
  /** As semanas do canal mais barato servem de rótulo da série; o dado é mensal e uniforme. */
  const semanas = maisBarato.semanas;

  /** As mesmas chamadas alimentam a frase acessível e o corpo, para as duas lerem igual (DAD-9). */
  const nivelEscrito = formatPercent(confidence, 0);
  const semanasEscrito = formatInt(semanas);
  const baratoNome = maisBarato.name;
  const baratoCpl = formatCurrencyAxis(maisBarato.cplMedio);
  const melhorNome = melhorTaxa.name;
  const melhorTaxaEscrita = formatRateWithVolume(melhorTaxa.qualificados, melhorTaxa.leads);
  const quantos = formatInt(points.length);
  const baratoTaxaEscrita = formatRateWithVolume(maisBarato.qualificados, maisBarato.leads);
  /** Veredito calculado do dado e dos limites de Wilson: só afirma diferença quando os intervalos se separam (ANO-5). */
  const mesmoCanal = maisBarato.id === melhorTaxa.id;
  const veredito =
    maisBarato.upper < melhorTaxa.lower
      ? 'mais barato não é mais qualificado'
      : `a taxa do mais barato e a da melhor não se distinguem no intervalo de ${nivelEscrito}`;

  /** Frase da raiz em 229 caracteres com o dado padrão, dentro dos 250 da ACE-1 e do aviso de 235. */
  const summary =
    `Dispersão de ${quantos} canais: CPL médio no eixo horizontal com um desvio padrão entre as ${semanasEscrito} ` +
    `semanas, taxa de qualificação no vertical com intervalo de ${nivelEscrito} de Wilson. ` +
    `Mais barato é ${baratoNome}, ${baratoCpl}; melhor taxa é ${melhorNome}, ${melhorTaxaEscrita}.`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      {
        dataKey: 'cplMedio',
        name: 'CPL médio',
        value: `${formatCurrencyAxis(point.cplMedio)} ± ${formatCurrencyAxis(point.cplDesvio)}`,
      },
      {
        dataKey: 'rate',
        name: 'Qualificação',
        value: formatRateWithVolume(point.qualificados, point.leads),
      },
      {
        dataKey: 'intervalo',
        name: `Intervalo de ${nivelEscrito}`,
        value: `${formatPercent(point.lower)} a ${formatPercent(point.upper)}`,
      },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {mesmoCanal
          ? `o mais barato é também o de melhor taxa: ${baratoNome} a ${baratoCpl} com ${melhorTaxaEscrita}`
          : `${veredito}: ${baratoNome} a ${baratoCpl} com ${baratoTaxaEscrita}, contra ${melhorNome} a ` +
            `${formatCurrencyAxis(melhorTaxa.cplMedio)} com ${melhorTaxaEscrita}`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="cplMedio"
              domain={[...DOMAIN_X]}
              name="CPL médio"
              tickFormatter={formatCurrencyAxis}
              tickLine={false}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="rate"
              domain={[...DOMAIN_Y]}
              name="Qualificação"
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickLine={false}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip
              content={renderTooltip}
              cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }}
              isAnimationActive={false}
            />
            <Scatter data={points} fill="var(--chart-1)" isAnimationActive={animate} name="Canais">
              <ErrorBar
                dataKey="errorX"
                direction="x"
                isAnimationActive={animate}
                stroke="var(--text-muted)"
                width={ERROR_BAR_WIDTH}
              />
              <ErrorBar
                dataKey="errorY"
                direction="y"
                isAnimationActive={animate}
                stroke="var(--text-muted)"
                width={ERROR_BAR_WIDTH}
              />
            </Scatter>
            <ChannelNameLayer points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div
        aria-hidden
        className="mt-2 flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1 text-[0.6875rem] tabular-nums text-text-muted"
      >
        <span className="flex items-center gap-2">
          <svg aria-hidden height={10} viewBox="0 0 22 10" width={22}>
            <path d="M1.5 1 V9 M1.5 5 H20.5 M20.5 1 V9" stroke="var(--text-muted)" strokeWidth={1.25} />
          </svg>
          {`horizontal: um desvio padrão do CPL entre as ${semanasEscrito} semanas do mês`}
        </span>
        <span className="flex items-center gap-2">
          <svg aria-hidden height={16} viewBox="0 0 10 16" width={10}>
            <path d="M1 1.5 H9 M5 1.5 V14.5 M1 14.5 H9" stroke="var(--text-muted)" strokeWidth={1.25} />
          </svg>
          {`vertical: intervalo de ${nivelEscrito} de Wilson da taxa de qualificação`}
        </span>
        {semSerie > 0 ? <span>{`${formatInt(semSerie)} canais sem custo semanal apurado ficam fora do plano`}</span> : null}
      </div>
    </div>
  );
}
