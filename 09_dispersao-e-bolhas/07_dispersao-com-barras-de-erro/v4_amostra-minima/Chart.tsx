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
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  confidence as defaultConfidence,
  data as defaultData,
  minimumSample as defaultMinimum,
  type ChannelAgendaCount,
} from './data';

/**
 * Dispersão com barra de erro e piso de amostra: leads no eixo horizontal, taxa de agenda no
 * vertical, e o traço vertical é o intervalo de confiança de Wilson da taxa.
 *
 * O problema que esta versão resolve é o canal de 3 leads. A taxa dele existe, 33,3%, e o intervalo
 * dela vai de cerca de 6% a 79%: desenhar esse traço faria duas coisas ruins de uma vez, daria ao
 * canal a barra mais alta da tela, que o olho lê como importância, e esticaria o domínio do eixo
 * até 90%, apertando os oito canais que de fato têm medida. Então abaixo do piso o ponto fica
 * vazado, perde o traço, ganha a palavra e o volume escritos ao lado, e o INTERVALO dele fica fora
 * da conta do domínio. O que não acontece é o ponto sumir: canal com pouco lead é resultado, e
 * esconder o resultado é pior que mostrar o resultado com ressalva.
 */
export interface MinimumSampleScatterProps {
  readonly data?: readonly ChannelAgendaCount[];
  /** O piso de volume abaixo do qual a taxa não se publica com intervalo. */
  readonly minimumSample?: number;
  /** O nível de confiança do intervalo, nomeado na tela e usado no cálculo. */
  readonly confidence?: number;
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  readonly agendas: number;
  readonly rate: number;
  readonly lower: number;
  readonly upper: number;
  /** Par de DISTÂNCIAS a partir do ponto, que é o que o `dataKey` do `ErrorBar` espera. */
  readonly errorY: readonly [number, number];
  readonly temAmostra: boolean;
}

const MARGIN = { top: 14, right: 36, bottom: 8, left: 8 } as const;
const Y_AXIS_WIDTH = 48;
/** Passo do eixo de taxa, em fração: 15 pontos percentuais dão de 3 a 5 linhas de grade (EIX-4). */
const STEP_Y = 0.15;
/** Passo do eixo de volume, em leads. */
const STEP_X = 100;
/** Serifa curta: o traço precisa de ponta para não virar risco solto, e 5 px já basta. */
const ERROR_BAR_WIDTH = 5;
/** Raio fixado nas duas pontas do `ZAxis`, porque o tamanho do ponto aqui não codifica nada. */
const POINT_RADIUS = 4.5;
const Z_RANGE: readonly [number, number] = [
  Math.PI * POINT_RADIUS * POINT_RADIUS,
  Math.PI * POINT_RADIUS * POINT_RADIUS,
];
/** O ponto vazado é um pouco maior que o cheio para o vazio dentro dele se ver (ACE-2). */
const HOLLOW_RADIUS = 5.5;
const LABEL_SIZE = 11;
const LABEL_LINE = 12;
/** Largura por caractere superestimada de propósito: errar sobrando não quebra nada (GEO-8). */
const LABEL_CHAR_WIDTH = 6.4;
const LABEL_PAD = 3;
/** Casas de arredondamento do tique, para o passo fracionário não trazer resto binário. */
const TICK_PRECISION = 1000;

type Anchor = 'start' | 'middle' | 'end';

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

const LABEL_CANDIDATES: readonly { readonly dx: number; readonly dy: number; readonly anchor: Anchor }[] = [
  { dx: 11, dy: 0, anchor: 'start' },
  { dx: -11, dy: 0, anchor: 'end' },
  { dx: 11, dy: -11, anchor: 'start' },
  { dx: -11, dy: -11, anchor: 'end' },
  { dx: 11, dy: 13, anchor: 'start' },
  { dx: -11, dy: 13, anchor: 'end' },
  { dx: 0, dy: -15, anchor: 'middle' },
  { dx: 0, dy: 21, anchor: 'middle' },
];

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

/** O maior de uma lista; `null` em lista vazia, porque máximo sem base é ausência (EST-1b). */
function maiorValor(values: readonly number[]): number | null {
  const primeiro = values[0];
  if (primeiro === undefined) return null;
  let maior = primeiro;
  for (const value of values) {
    if (value > maior) maior = value;
  }
  return maior;
}

/** O múltiplo de `step` imediatamente acima de `value`, que é onde o eixo termina (EIX-4). */
function tetoNoPasso(value: number, step: number): number {
  const passos = Math.max(1, Math.ceil(value / step));
  return Math.round(passos * step * TICK_PRECISION) / TICK_PRECISION;
}

/** Os tiques de 0 até `teto`, de `step` em `step`, sem resto binário no valor. */
function tiquesAte(teto: number, step: number): readonly number[] {
  const quantos = Math.round(teto / step);
  const saida: number[] = [];
  for (let i = 0; i <= quantos; i += 1) saida.push(Math.round(i * step * TICK_PRECISION) / TICK_PRECISION);
  return saida;
}

function overlaps(a: Box, b: Box, pad: number): boolean {
  return a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
}

/**
 * Camada do anel vazado dos canais sem amostra. O `shape` é obrigatório aqui: sem ele o ponto de 3
 * leads sairia igual ao de 340, e ler igual é mentir. Ele é desenhado dentro do `Scatter` para
 * herdar a posição que o Recharts já calculou.
 */
function HollowPoint({ cx, cy }: { readonly cx?: number; readonly cy?: number }) {
  if (cx === undefined || cy === undefined) return null;
  return <circle cx={cx} cy={cy} fill="none" r={HOLLOW_RADIUS} stroke="var(--text-muted)" strokeWidth={1.5} />;
}

/**
 * Camada dos nomes, em rótulo direto no lugar de legenda (ROT-4), desenhada por último para ficar
 * por cima das barras (REC-13). Quem está abaixo do piso leva uma segunda linha com a palavra e o
 * volume, que é o que a EST-3 pede quando o número medido existe mas não sustenta conclusão.
 */
function NameLayer({ points, aviso }: { readonly points: readonly Point[]; readonly aviso: string }) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  /** A caixa de cada marca é o ponto MAIS a barra de erro, porque é tudo tinta a desviar. */
  const marks: Box[] = [];
  for (const point of points) {
    const cx = xScale(point.leads);
    if (cx === undefined) continue;
    const raio = point.temAmostra ? POINT_RADIUS : HOLLOW_RADIUS;
    const topo = point.temAmostra ? yScale(point.upper) : yScale(point.rate);
    const base = point.temAmostra ? yScale(point.lower) : yScale(point.rate);
    if (topo === undefined || base === undefined) continue;
    marks.push({ left: cx - raio, top: topo - 2, right: cx + raio, bottom: base + 2 });
  }

  const placed: { readonly point: Point; readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number }[] = [];
  /** Os sem amostra primeiro: o rótulo deles é o que a versão existe para mostrar, e carrega duas linhas. */
  const ordem = [...points.filter((point) => !point.temAmostra), ...points.filter((point) => point.temAmostra)];
  for (const point of ordem) {
    const cx = xScale(point.leads);
    const cy = yScale(point.rate);
    if (cx === undefined || cy === undefined) continue;
    const segunda = point.temAmostra ? '' : `${aviso}, ${formatInt(point.leads)} leads`;
    const width = Math.max(point.name.length, segunda.length) * LABEL_CHAR_WIDTH;
    const altura = point.temAmostra ? 2 : LABEL_LINE + 2;
    let melhor: { readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number; readonly faltas: number } | null = null;
    for (const candidate of LABEL_CANDIDATES) {
      const x = cx + candidate.dx;
      const y = cy + candidate.dy;
      const left = candidate.anchor === 'start' ? x : candidate.anchor === 'end' ? x - width : x - width / 2;
      const box: Box = { left, top: y - LABEL_SIZE + 2, right: left + width, bottom: y + altura };
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
          fill={item.point.temAmostra ? 'var(--text-primary)' : 'var(--text-muted)'}
          fontSize={LABEL_SIZE}
          key={`nome-${item.point.id}`}
          style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
          textAnchor={item.anchor}
          x={item.x}
          y={item.y}
        >
          <tspan fontWeight={600} x={item.x}>
            {item.point.name}
          </tspan>
          {item.point.temAmostra ? null : (
            <tspan dy={LABEL_LINE} x={item.x}>
              {`${aviso}, ${formatInt(item.point.leads)} leads`}
            </tspan>
          )}
        </text>
      ))}
    </g>
  );
}

export default function MinimumSampleScatter({
  data = defaultData,
  minimumSample = defaultMinimum,
  confidence = defaultConfidence,
  height,
  className,
}: MinimumSampleScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const aviso = 'amostra insuficiente';

  const points: Point[] = [];
  /** Canal sem lead não tem taxa nem intervalo: sai do plano, mas conta como abaixo do piso (DAD-2). */
  let semLead = 0;
  for (const row of data) {
    const intervalo = wilson(row.agendas, row.leads, confidence);
    if (intervalo === null) {
      semLead += 1;
      continue;
    }
    const rate = row.agendas / row.leads;
    points.push({
      id: row.id,
      name: row.name,
      leads: row.leads,
      agendas: row.agendas,
      rate,
      lower: intervalo.lower,
      upper: intervalo.upper,
      errorY: [rate - intervalo.lower, intervalo.upper - rate],
      temAmostra: row.leads >= minimumSample,
    });
  }

  const medidos = points.filter((point) => point.temAmostra);
  const escassos = points.filter((point) => !point.temAmostra);

  /**
   * O domínio do eixo de taxa sai do limite superior de quem TEM amostra, mais a posição de quem
   * não tem. O intervalo dos escassos fica fora da conta de propósito: é ele que empurraria o teto
   * para 90% e apertaria os oito canais medidos num terço do plano.
   */
  const tetoMedido = maiorValor(medidos.map((point) => point.upper));
  const tetoPonto = maiorValor(points.map((point) => point.rate));
  const tetoIgnorado = maiorValor(points.map((point) => point.upper));

  if (points.length === 0 || tetoPonto === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum canal neste recorte com lead trabalhado no período.</span>
      </div>
    );
  }

  const domainYMax = tetoNoPasso(tetoMedido === null ? tetoPonto : Math.max(tetoMedido, tetoPonto), STEP_Y);
  const ticksY = tiquesAte(domainYMax, STEP_Y);
  const tetoLeads = maiorValor(points.map((point) => point.leads));
  const domainXMax = tetoNoPasso(tetoLeads === null ? STEP_X : tetoLeads, STEP_X);
  const ticksX = tiquesAte(domainXMax, STEP_X);
  const tetoSeContasse = tetoIgnorado === null ? domainYMax : tetoNoPasso(tetoIgnorado, STEP_Y);

  /** As mesmas chamadas alimentam a frase acessível e o corpo, para as duas lerem igual (DAD-9). */
  const nivelEscrito = formatPercent(confidence, 0);
  const pisoEscrito = formatInt(minimumSample);
  const quantos = formatInt(points.length + semLead);
  const quantosEscassos = formatInt(escassos.length + semLead);
  const tetoEscrito = formatPercent(domainYMax, 0);
  const tetoIgnoradoEscrito = formatPercent(tetoSeContasse, 0);
  /** O custo do piso só existe quando o intervalo dos escassos levaria o eixo mais alto (ANO-5, ACE-1). */
  const temCusto = tetoSeContasse > domainYMax;
  const semLeadEscrito = semLead === 1 ? '1 sem lead' : `${formatInt(semLead)} sem lead`;
  const semLeadRodape =
    semLead === 1
      ? '1 canal sem lead no período fica fora do plano'
      : `${formatInt(semLead)} canais sem lead no período ficam fora do plano`;

  /** Frase da raiz em 216 caracteres com o dado padrão (semLead zero), dentro dos 250 da ACE-1. */
  const summary =
    `Dispersão de ${quantos} canais: leads no eixo horizontal, taxa de agenda no vertical, e o traço é o intervalo de ` +
    `${nivelEscrito} de Wilson. ${quantosEscassos} canais abaixo do piso de ${pisoEscrito} leads` +
    (semLead > 0 ? ` (${semLeadEscrito}, fora do plano)` : '') +
    (escassos.length > 0 ? ' saem vazados e sem traço' : '') +
    (temCusto ? `, e o eixo para em ${tetoEscrito} em vez de ${tetoIgnoradoEscrito}` : '') +
    '.';

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      {
        dataKey: 'rate',
        name: 'Taxa de agenda',
        value: formatRateWithVolume(point.agendas, point.leads),
      },
      {
        dataKey: 'intervalo',
        name: point.temAmostra ? `Intervalo de ${nivelEscrito}` : `Intervalo de ${nivelEscrito}, não desenhado`,
        value: `${formatPercent(point.lower)} a ${formatPercent(point.upper)}`,
      },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {`${quantosEscassos} de ${quantos} canais ficam abaixo do piso de ${pisoEscrito} leads` +
          (semLead > 0 ? ` (${semLeadEscrito})` : '') +
          (temCusto
            ? `; sem o intervalo deles o eixo para em ${tetoEscrito} e não em ${tetoIgnoradoEscrito}`
            : escassos.length > 0
              ? '; o intervalo deles não mudaria o eixo'
              : '')}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              dataKey="leads"
              domain={[0, domainXMax]}
              name="Leads"
              tickFormatter={(value: number) => `${formatInt(value)} leads`}
              tickLine={false}
              tickMargin={8}
              ticks={[...ticksX]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="rate"
              domain={[0, domainYMax]}
              name="Taxa de agenda"
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickLine={false}
              tickMargin={8}
              ticks={[...ticksY]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip
              content={renderTooltip}
              cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }}
              isAnimationActive={false}
            />
            <Scatter data={medidos} fill="var(--chart-1)" isAnimationActive={animate} name="Com amostra">
              <ErrorBar
                dataKey="errorY"
                direction="y"
                isAnimationActive={animate}
                stroke="var(--text-muted)"
                width={ERROR_BAR_WIDTH}
              />
            </Scatter>
            <Scatter data={escassos} isAnimationActive={animate} name="Sem amostra" shape={<HollowPoint />} />
            <NameLayer aviso={aviso} points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p
        aria-hidden
        className="mt-2 flex shrink-0 items-center gap-2 text-[0.6875rem] tabular-nums text-text-muted"
      >
        <svg aria-hidden height={14} viewBox="0 0 10 14" width={10}>
          <path d="M1 1.5 H9 M5 1.5 V12.5 M1 12.5 H9" stroke="var(--text-muted)" strokeWidth={1.25} />
        </svg>
        {`cada traço é o intervalo de ${nivelEscrito} de Wilson da taxa; abaixo de ${pisoEscrito} leads o ponto fica ` +
          `vazado, perde o traço e o intervalo dele sai da conta do domínio` +
          (semLead > 0 ? `; ${semLeadRodape}` : '')}
      </p>
    </div>
  );
}
