import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ErrorBar,
  ReferenceLine,
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
import { confidence as defaultConfidence, data as defaultData, type SdrAgendaCount } from './data';

/**
 * Dispersão com barra de erro e linha do time: cada ponto é a taxa de agenda de um SDR, com leads
 * trabalhados no eixo horizontal, e o traço vertical é o intervalo de confiança de Wilson dessa
 * taxa. A pergunta que o desenho responde não é quem tem a maior taxa, é quem tem taxa DIFERENTE
 * da do time, e a resposta está no intervalo: só recebe cor quem tem o intervalo inteiro de um
 * lado da linha. O dado exercita o caso que prova a regra, duas taxas iguais de 13,8% com
 * vereditos opostos, porque o intervalo de quem trabalhou 58 leads cruza a linha e o de quem
 * trabalhou 130 não cruza.
 */
export interface SdrVersusTeamScatterProps {
  readonly data?: readonly SdrAgendaCount[];
  /** O nível de confiança do intervalo, nomeado na tela e usado no cálculo. */
  readonly confidence?: number;
  readonly height?: number;
  readonly className?: string;
}

/** O veredito de cada ponto, e é ele que decide cor, anel e rótulo. */
type Role = 'acima' | 'abaixo' | 'cruza';

interface Point {
  readonly id: string;
  readonly name: string;
  readonly leadsTrabalhados: number;
  readonly agendas: number;
  readonly rate: number;
  readonly lower: number;
  readonly upper: number;
  /** O par de DISTÂNCIAS a partir do ponto, que é o que o `dataKey` do `ErrorBar` espera. */
  readonly errorY: readonly [number, number];
  readonly role: Role;
}

/** A margem direita é reserva do nome da referência, fora das marcas, como a ANO-3 pede. */
const MARGIN = { top: 14, right: 124, bottom: 8, left: 8 } as const;
const DOMAIN_X: readonly [number, number] = [0, 160];
const TICKS_X = [0, 40, 80, 120, 160] as const;
/** O eixo termina em 45%, a primeira linha de grade acima do maior limite superior, 43,3% (EIX-4). */
const DOMAIN_Y: readonly [number, number] = [0, 0.45];
const TICKS_Y = [0, 0.15, 0.3, 0.45] as const;
const Y_AXIS_WIDTH = 48;
/** Serifa curta: o traço precisa de ponta para não virar risco solto, e 5 px já basta. */
const ERROR_BAR_WIDTH = 5;
/** Raio fixado nas duas pontas do `ZAxis`, porque o tamanho do ponto aqui não codifica nada. */
const POINT_RADIUS = 4.5;
const Z_RANGE: readonly [number, number] = [
  Math.PI * POINT_RADIUS * POINT_RADIUS,
  Math.PI * POINT_RADIUS * POINT_RADIUS,
];
/** O anel é o segundo canal do destaque, para a cor não ser a única pista (ACE-2). */
const RING_RADIUS = 8.5;
const REFERENCE_WIDTH = 1.5;
const LABEL_SIZE = 11;
const LABEL_LINE = 12;
const LABEL_GAP = 6;
/** Largura por caractere superestimada de propósito: errar sobrando não quebra nada (GEO-8). */
const LABEL_CHAR_WIDTH = 6.4;
const LABEL_PAD = 3;

/**
 * As cores dos três vereditos, medidas contra `--surface-raised` nos dois temas: `--positive`
 * 7,36:1 no escuro e 5,34:1 no claro, `--negative` 5,50:1 e 6,36:1, `--text-muted` 5,21:1 e
 * 5,37:1. Todas acima dos 3:1 que a ACE-6 cobra do traço, que aqui é dado e não referência.
 */
const ROLE_COLOR: Readonly<Record<Role, string>> = {
  acima: 'var(--positive)',
  abaixo: 'var(--negative)',
  cruza: 'var(--text-muted)',
};

type Anchor = 'start' | 'middle' | 'end';

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/**
 * As 8 candidatas de posição do rótulo, na ordem de preferência: primeiro os lados, que nunca
 * cobrem a barra de erro do próprio ponto, depois topo e base, depois as diagonais.
 */
const LABEL_CANDIDATES: readonly { readonly dx: number; readonly dy: number; readonly anchor: Anchor }[] = [
  { dx: 14, dy: 0, anchor: 'start' },
  { dx: -14, dy: 0, anchor: 'end' },
  { dx: 14, dy: -12, anchor: 'start' },
  { dx: -14, dy: -12, anchor: 'end' },
  { dx: 14, dy: 12, anchor: 'start' },
  { dx: -14, dy: 12, anchor: 'end' },
  { dx: 0, dy: -20, anchor: 'middle' },
  { dx: 0, dy: 26, anchor: 'middle' },
];

/**
 * Intervalo de confiança de Wilson para uma proporção `k/n`, no nível `level`.
 *
 * Devolve os limites ABSOLUTOS; quem chama converte em distância a partir do ponto, porque é isso
 * que o `dataKey` do `ErrorBar` espera. Passar o limite absoluto ali desenha uma barra do tamanho
 * errado sem erro de compilação, e é o ponto delicado do modelo (REC-20).
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

/**
 * A taxa do time, agrupada: soma das agendas sobre soma dos leads, não média das taxas.
 * Devolve `null` sem lead trabalhado, porque taxa sem base é ausência e não zero (EST-1b).
 */
function pooledRate(rows: readonly SdrAgendaCount[]): number | null {
  if (rows.length === 0) return null;
  let leads = 0;
  let agendas = 0;
  for (const row of rows) {
    leads += row.leadsTrabalhados;
    agendas += row.agendas;
  }
  if (leads <= 0) return null;
  return agendas / leads;
}

function overlaps(a: Box, b: Box, pad: number): boolean {
  return a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
}

/**
 * O nome da referência, desenhado na margem reservada à direita do plano.
 *
 * Ele não é `label` da `ReferenceLine` de propósito: o rótulo nativo nasce dentro da área, na
 * altura da própria linha, que é justamente onde a nuvem se acumula quando a taxa do time fica no
 * meio do domínio. Na margem ele não compete com marca nenhuma, em qualquer recorte (REC-4).
 */
function ReferenceName({ teamRate, written }: { readonly teamRate: number; readonly written: string }) {
  const plotArea = usePlotArea();
  const yScale = useYAxisScale();
  if (!plotArea || !yScale) return null;
  const y = yScale(teamRate);
  if (y === undefined) return null;
  const x = plotArea.x + plotArea.width + LABEL_GAP;

  return (
    <text className="font-display" fill="var(--text-muted)" fontSize={LABEL_SIZE} textAnchor="start" x={x} y={y - 3}>
      <tspan fontWeight={600} x={x}>
        taxa do time
      </tspan>
      <tspan dy={LABEL_LINE} x={x}>
        {written}
      </tspan>
    </text>
  );
}

/**
 * Camada de anel e rótulo dos SDRs que se distinguem, desenhada por último para ficar por cima da
 * nuvem e das barras de erro (REC-13).
 *
 * Ela vive dentro do `ScatterChart` porque só ali os hooks de escala respondem, e a anticolisão
 * precisa dos pixels de todos os pontos ao mesmo tempo: o `content` do `LabelList` recebe um
 * rótulo por vez e não sabe onde os vizinhos caíram.
 */
function HighlightLayer({
  points,
  labeled,
}: {
  readonly points: readonly Point[];
  readonly labeled: readonly Point[];
}) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  /** A caixa de cada marca é o ponto MAIS a barra de erro, que é tinta a desviar do mesmo jeito. */
  const marks: Box[] = [];
  for (const point of points) {
    const cx = xScale(point.leadsTrabalhados);
    const topo = yScale(point.upper);
    const base = yScale(point.lower);
    if (cx === undefined || topo === undefined || base === undefined) continue;
    const raio = labeled.includes(point) ? RING_RADIUS : POINT_RADIUS;
    marks.push({ left: cx - raio, top: topo - 2, right: cx + raio, bottom: base + 2 });
  }

  const placed: {
    readonly point: Point;
    readonly cx: number;
    readonly cy: number;
    readonly box: Box;
    readonly anchor: Anchor;
    readonly x: number;
    readonly y: number;
  }[] = [];

  for (const point of labeled) {
    const cx = xScale(point.leadsTrabalhados);
    const cy = yScale(point.rate);
    if (cx === undefined || cy === undefined) continue;
    const valor = formatRateWithVolume(point.agendas, point.leadsTrabalhados);
    const width = Math.max(point.name.length, valor.length) * LABEL_CHAR_WIDTH;
    let melhor: { readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number; readonly faltas: number } | null = null;
    for (const candidate of LABEL_CANDIDATES) {
      const x = cx + candidate.dx;
      const y = cy + candidate.dy;
      const left = candidate.anchor === 'start' ? x : candidate.anchor === 'end' ? x - width : x - width / 2;
      const box: Box = { left, top: y - LABEL_SIZE + 2, right: left + width, bottom: y + LABEL_LINE + 2 };
      const foraDoPlano =
        box.left < plotArea.x + 1 ||
        box.right > plotArea.x + plotArea.width + MARGIN.right - LABEL_GAP ||
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
    placed.push({ point, cx, cy, box: melhor.box, anchor: melhor.anchor, x: melhor.x, y: melhor.y });
  }

  return (
    <g>
      {placed.map((item) => (
        <circle
          cx={item.cx}
          cy={item.cy}
          fill="none"
          key={`anel-${item.point.id}`}
          r={RING_RADIUS}
          stroke={ROLE_COLOR[item.point.role]}
          strokeWidth={1.5}
        />
      ))}
      {placed.map((item) => (
        <text
          className="font-display"
          fill="var(--text-primary)"
          fontSize={LABEL_SIZE}
          key={`rotulo-${item.point.id}`}
          style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
          textAnchor={item.anchor}
          x={item.x}
          y={item.y}
        >
          <tspan fontWeight={600} x={item.x}>
            {item.point.name}
          </tspan>
          <tspan dy={LABEL_LINE} fill="var(--text-secondary)" x={item.x}>
            {formatRateWithVolume(item.point.agendas, item.point.leadsTrabalhados)}
          </tspan>
        </text>
      ))}
    </g>
  );
}

export default function SdrVersusTeamScatter({
  data = defaultData,
  confidence = defaultConfidence,
  height,
  className,
}: SdrVersusTeamScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const teamRate = pooledRate(data);

  if (data.length === 0 || teamRate === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum SDR neste recorte com lead trabalhado no período, então não há taxa do time a comparar.</span>
      </div>
    );
  }

  let totalLeads = 0;
  let totalAgendas = 0;
  const points: Point[] = [];
  /** SDR sem lead trabalhado não tem taxa nem intervalo: sai do plano, mas entra na contagem (DAD-2). */
  let semBase = 0;
  for (const row of data) {
    totalLeads += row.leadsTrabalhados;
    totalAgendas += row.agendas;
    const intervalo = wilson(row.agendas, row.leadsTrabalhados, confidence);
    if (intervalo === null) {
      semBase += 1;
      continue;
    }
    const rate = row.agendas / row.leadsTrabalhados;
    const role: Role = intervalo.upper < teamRate ? 'abaixo' : intervalo.lower > teamRate ? 'acima' : 'cruza';
    points.push({
      id: row.id,
      name: row.name,
      leadsTrabalhados: row.leadsTrabalhados,
      agendas: row.agendas,
      rate,
      lower: intervalo.lower,
      upper: intervalo.upper,
      errorY: [rate - intervalo.lower, intervalo.upper - rate],
      role,
    });
  }

  /** Ordem de pintura pelo papel, não pelo valor: neutro primeiro, destacados por cima (REC-13). */
  const cruzam = points.filter((point) => point.role === 'cruza');
  const abaixo = points.filter((point) => point.role === 'abaixo');
  const acima = points.filter((point) => point.role === 'acima');
  const labeled = [...acima, ...abaixo];

  /** As mesmas chamadas alimentam a frase acessível e o corpo, para as duas lerem igual (DAD-9). */
  const nivelEscrito = formatPercent(confidence, 0);
  const timeEscrito = formatRateWithVolume(totalAgendas, totalLeads);
  const quantosAcima = formatInt(acima.length);
  const quantosAbaixo = formatInt(abaixo.length);
  const quantosCruzam = formatInt(cruzam.length);
  const quantos = formatInt(points.length);
  const semBaseEscrito =
    semBase === 1
      ? '1 SDR sem lead trabalhado no período fica fora do plano'
      : `${formatInt(semBase)} SDRs sem lead trabalhado no período ficam fora do plano`;

  /** Frase da raiz em 228 caracteres com o dado padrão (semBase zero), dentro dos 250 da ACE-1. */
  const summary =
    `Dispersão: taxa de agenda de ${quantos} SDRs por leads trabalhados, com traço no intervalo de ` +
    `${nivelEscrito} de Wilson. Contra a taxa do time, ${timeEscrito}, ${quantosAcima} acima e ` +
    `${quantosAbaixo} abaixo sem cruzar a linha; ${quantosCruzam} cruzam e não se distinguem.` +
    (semBase > 0 ? ` Fora do plano, sem lead: ${formatInt(semBase)}.` : '');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      {
        dataKey: 'rate',
        name: 'Taxa de agenda',
        value: formatRateWithVolume(point.agendas, point.leadsTrabalhados),
      },
      {
        dataKey: 'intervalo',
        name: `Intervalo de ${nivelEscrito}`,
        value: `${formatPercent(point.lower)} a ${formatPercent(point.upper)}`,
      },
      {
        dataKey: 'veredito',
        name: 'Contra o time',
        value: point.role === 'cruza' ? 'não se distingue' : point.role,
      },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 flex shrink-0 items-center gap-2 text-xs tabular-nums text-text-secondary">
        <svg aria-hidden height={14} viewBox="0 0 10 14" width={10}>
          <path d="M1 1.5 H9 M5 1.5 V12.5 M1 12.5 H9" stroke="var(--text-muted)" strokeWidth={1.25} />
        </svg>
        {`cada traço é o intervalo de ${nivelEscrito} de Wilson da taxa; ${formatInt(labeled.length)} de ${quantos} SDRs${semBase > 0 ? ' com lead trabalhado' : ''} se distinguem do time`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              dataKey="leadsTrabalhados"
              domain={[...DOMAIN_X]}
              name="Leads trabalhados"
              tickFormatter={(value: number) => `${formatInt(value)} leads`}
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
              name="Taxa de agenda"
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
            <ReferenceLine
              ifOverflow="extendDomain"
              stroke="var(--line-strong)"
              strokeDasharray="4 4"
              strokeWidth={REFERENCE_WIDTH}
              y={teamRate}
            />
            <Scatter data={cruzam} fill={ROLE_COLOR.cruza} isAnimationActive={animate} name="Não se distingue">
              <ErrorBar
                dataKey="errorY"
                direction="y"
                isAnimationActive={animate}
                stroke={ROLE_COLOR.cruza}
                width={ERROR_BAR_WIDTH}
              />
            </Scatter>
            <Scatter data={abaixo} fill={ROLE_COLOR.abaixo} isAnimationActive={animate} name="Abaixo do time">
              <ErrorBar
                dataKey="errorY"
                direction="y"
                isAnimationActive={animate}
                stroke={ROLE_COLOR.abaixo}
                width={ERROR_BAR_WIDTH}
              />
            </Scatter>
            <Scatter data={acima} fill={ROLE_COLOR.acima} isAnimationActive={animate} name="Acima do time">
              <ErrorBar
                dataKey="errorY"
                direction="y"
                isAnimationActive={animate}
                stroke={ROLE_COLOR.acima}
                width={ERROR_BAR_WIDTH}
              />
            </Scatter>
            <ReferenceName teamRate={teamRate} written={timeEscrito} />
            <HighlightLayer labeled={labeled} points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`cor e nome só em quem tem o intervalo inteiro de um lado da linha; os ${quantosCruzam} em neutro cruzam a taxa do time${semBase > 0 ? `; ${semBaseEscrito}` : ''}`}
      </p>
    </div>
  );
}
