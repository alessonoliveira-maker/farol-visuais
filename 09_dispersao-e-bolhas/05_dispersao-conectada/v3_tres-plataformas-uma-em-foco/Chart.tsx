import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
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
import { formatCurrencyAxis, formatInt, formatMonthShort, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type PlatformMonth } from './data';

/**
 * Três trajetórias no mesmo plano, uma acesa. O modelo avisa que mais de duas entidades viram
 * espaguete, e o foco é justamente a saída disso: o leitor segue uma linha de cada vez e as outras
 * duas continuam ali só como régua de comparação, sem rótulo de mês e sem cor.
 */
export interface FocusedTrajectoriesProps {
  readonly data?: readonly PlatformMonth[];
  /** A trajetória acesa; as demais saem em traço fino neutro. */
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly platformId: string;
  readonly name: string;
  readonly month: string;
  readonly cpl: number;
  readonly taxa: number;
  readonly leads: number;
  readonly qualificados: number;
  readonly focus: boolean;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly isTurn: boolean;
}

interface Trajectory {
  readonly platformId: string;
  readonly name: string;
  readonly focus: boolean;
  readonly points: readonly Point[];
}

const MARGIN = { top: 22, right: 28, bottom: 8, left: 8 } as const;
/** CPL observado de R$ 112 a R$ 196; passo de 30 fecha em 5 linhas de grade redondas (EIX-4). */
const DOMAIN_X: readonly [number, number] = [100, 220];
const TICKS_X = [100, 130, 160, 190, 220] as const;
/** Qualificação observada de 8,1% a 33,0%; passo de 10 pontos, 4 linhas de grade. */
const DOMAIN_Y: readonly [number, number] = [0.05, 0.35];
const TICKS_Y = [0.05, 0.15, 0.25, 0.35] as const;
const Y_AXIS_WIDTH = 48;
/**
 * O traço CARREGA a relação nas três trajetórias, inclusive nas de contexto: apagado ele, ninguém
 * sabe qual mês virou qual em nenhuma delas. Pela ACE-6 isso o torna dado e cobra 3:1 contra o
 * cartão, e é por isso que o neutro aqui é `--text-muted` (5,21:1 no escuro, 5,37:1 no claro) e não
 * `--line-strong` (1,79:1 e 1,83:1), que é o neutro que a tabela 17.2 indicaria. A acesa sai em
 * `--chart-1` (9,50:1 e 6,00:1).
 */
const FOCUS_STROKE = 'var(--chart-1)';
const CONTEXT_STROKE = 'var(--text-muted)';
const FOCUS_WIDTH = 2.5;
const CONTEXT_WIDTH = 1.25;
const FOCUS_START_RADIUS = 4.5;
const FOCUS_MID_RADIUS = 3;
const FOCUS_END_RADIUS = 5;
const FOCUS_TURN_RING = 9;
const CONTEXT_START_RADIUS = 3.5;
const CONTEXT_MID_RADIUS = 2.2;
const CONTEXT_END_RADIUS = 4;
const LABEL_SIZE = 11;
/** Largura por caractere superestimada de propósito: errar sobrando não quebra nada (GEO-8). */
const LABEL_CHAR_WIDTH = 6.4;
const LABEL_PAD = 3;
const LABEL_GAP = 8;
const HALO = {
  paintOrder: 'stroke',
  stroke: 'var(--surface-raised)',
  strokeLinejoin: 'round',
  strokeWidth: 4,
} as const;
/** Raio fixado pelas duas pontas do `ZAxis`, porque o tamanho do ponto aqui não codifica nada. */
const Z_RANGE: readonly [number, number] = [
  Math.PI * FOCUS_MID_RADIUS * FOCUS_MID_RADIUS,
  Math.PI * FOCUS_MID_RADIUS * FOCUS_MID_RADIUS,
];

type Anchor = 'start' | 'middle' | 'end';

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** CPL do mês. Sem lead captado não existe custo por lead: é ausência, nunca zero (EST-1b). */
function costPerLead(investimento: number, leads: number): number | null {
  if (leads <= 0) return null;
  return investimento / leads;
}

/** Taxa de qualificação do mês. Sem lead captado a taxa não existe (EST-1b). */
function qualificationRate(qualificados: number, leads: number): number | null {
  if (leads <= 0) return null;
  return qualificados / leads;
}

/** O mês em que a qualificação muda de direção. Devolve -1 quando a série não vira. */
function findTurnIndex(rows: readonly { readonly taxa: number }[]): number {
  for (let index = 1; index < rows.length - 1; index += 1) {
    const prev = rows[index - 1];
    const curr = rows[index];
    const next = rows[index + 1];
    if (!prev || !curr || !next) continue;
    const antes = Math.sign(curr.taxa - prev.taxa);
    const depois = Math.sign(next.taxa - curr.taxa);
    if (antes !== 0 && depois !== 0 && antes !== depois) return index;
  }
  return -1;
}

function overlaps(a: Box, b: Box, pad: number): boolean {
  return a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;
}

/**
 * As trajetórias, um `<line>` por par de meses vizinhos, em camada própria em vez do `line` do
 * `Scatter`: as de contexto e a acesa têm espessura e cor diferentes, e a ordem de pintura precisa
 * ser o papel e não a ordem do dado, com a acesa por último (REC-13). As escalas do Recharts só
 * respondem dentro do gráfico, por isso a camada vive como filha do `ScatterChart`.
 */
function TrajectoryLines({ trajectories }: { readonly trajectories: readonly Trajectory[] }) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!xScale || !yScale) return null;

  return (
    <g>
      {trajectories.map((trajectory) =>
        trajectory.points.slice(0, -1).map((from, index) => {
          const to = trajectory.points[index + 1];
          if (!to) return null;
          const x1 = xScale(from.cpl);
          const y1 = yScale(from.taxa);
          const x2 = xScale(to.cpl);
          const y2 = yScale(to.taxa);
          if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return null;
          return (
            <line
              key={`${from.id}-${to.id}`}
              stroke={trajectory.focus ? FOCUS_STROKE : CONTEXT_STROKE}
              strokeLinecap="round"
              strokeWidth={trajectory.focus ? FOCUS_WIDTH : CONTEXT_WIDTH}
              x1={x1}
              x2={x2}
              y1={y1}
              y2={y2}
            />
          );
        }),
      )}
    </g>
  );
}

interface LabelRequest {
  readonly key: string;
  readonly text: string;
  readonly cpl: number;
  readonly taxa: number;
  readonly fill: string;
  readonly weight: number;
}

/**
 * Nome de cada trajetória na sua ponta final e o mês da acesa nas pontas e na virada, colocados por
 * anticolisão: cada rótulo tenta oito posições em volta da sua âncora e fica na primeira que não
 * encosta em marca nem em rótulo já posto, sempre dentro do plano. Um deslocamento fixo bastaria
 * hoje e quebraria no primeiro recorte com outra forma de trajetória.
 */
function LabelLayer({
  requests,
  marks,
}: {
  readonly requests: readonly LabelRequest[];
  readonly marks: readonly { readonly cpl: number; readonly taxa: number; readonly radius: number }[];
}) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;

  const markBoxes: Box[] = [];
  for (const mark of marks) {
    const cx = xScale(mark.cpl);
    const cy = yScale(mark.taxa);
    if (cx === undefined || cy === undefined) continue;
    markBoxes.push({ left: cx - mark.radius, top: cy - mark.radius, right: cx + mark.radius, bottom: cy + mark.radius });
  }

  const candidates: readonly { readonly dx: number; readonly dy: number; readonly anchor: Anchor }[] = [
    { dx: LABEL_GAP + 4, dy: 4, anchor: 'start' },
    { dx: -LABEL_GAP - 4, dy: 4, anchor: 'end' },
    { dx: 0, dy: -LABEL_GAP - 5, anchor: 'middle' },
    { dx: 0, dy: LABEL_GAP + LABEL_SIZE, anchor: 'middle' },
    { dx: LABEL_GAP, dy: -LABEL_GAP - 2, anchor: 'start' },
    { dx: -LABEL_GAP, dy: -LABEL_GAP - 2, anchor: 'end' },
    { dx: LABEL_GAP, dy: LABEL_GAP + LABEL_SIZE, anchor: 'start' },
    { dx: -LABEL_GAP, dy: LABEL_GAP + LABEL_SIZE, anchor: 'end' },
  ];

  const placed: { readonly request: LabelRequest; readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number }[] = [];
  for (const request of requests) {
    const cx = xScale(request.cpl);
    const cy = yScale(request.taxa);
    if (cx === undefined || cy === undefined) continue;
    const width = request.text.length * LABEL_CHAR_WIDTH;
    let melhor: { readonly box: Box; readonly anchor: Anchor; readonly x: number; readonly y: number; readonly faltas: number } | null = null;
    for (const candidate of candidates) {
      const x = cx + candidate.dx;
      const y = cy + candidate.dy;
      const left = candidate.anchor === 'start' ? x : candidate.anchor === 'end' ? x - width : x - width / 2;
      const box: Box = { left, top: y - LABEL_SIZE + 2, right: left + width, bottom: y + 2 };
      const foraDoPlano =
        box.left < plotArea.x + 1 ||
        box.right > plotArea.x + plotArea.width + MARGIN.right - 8 ||
        box.top < plotArea.y - LABEL_SIZE ||
        box.bottom > plotArea.y + plotArea.height;
      const faltas =
        (foraDoPlano ? 100 : 0) +
        markBoxes.filter((mark) => overlaps(box, mark, 1)).length +
        placed.filter((outro) => overlaps(box, outro.box, LABEL_PAD)).length;
      if (faltas === 0) {
        melhor = { box, anchor: candidate.anchor, x, y, faltas };
        break;
      }
      if (melhor === null || faltas < melhor.faltas) melhor = { box, anchor: candidate.anchor, x, y, faltas };
    }
    if (melhor === null) continue;
    placed.push({ request, box: melhor.box, anchor: melhor.anchor, x: melhor.x, y: melhor.y });
  }

  return (
    <g>
      {placed.map((item) => (
        <text
          className="font-display"
          fill={item.request.fill}
          fontSize={LABEL_SIZE}
          fontWeight={item.request.weight}
          key={item.request.key}
          style={HALO}
          textAnchor={item.anchor}
          x={item.x}
          y={item.y}
        >
          {item.request.text}
        </text>
      ))}
    </g>
  );
}

interface PointShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: Point;
}

/** Ponto da trajetória acesa: anel vazado na partida, ponto cheio na chegada, anel na virada. */
function renderFocusPoint({ cx, cy, payload }: PointShapeProps): ReactElement | null {
  if (cx === undefined || cy === undefined || !payload) return null;
  if (payload.isFirst) {
    return <circle cx={cx} cy={cy} fill="var(--surface-raised)" r={FOCUS_START_RADIUS} stroke={FOCUS_STROKE} strokeWidth={2} />;
  }
  if (payload.isLast) {
    return <circle cx={cx} cy={cy} fill={FOCUS_STROKE} r={FOCUS_END_RADIUS} />;
  }
  if (payload.isTurn) {
    return (
      <g>
        <circle cx={cx} cy={cy} fill="none" r={FOCUS_TURN_RING} stroke={FOCUS_STROKE} strokeWidth={1.5} />
        <circle cx={cx} cy={cy} fill={FOCUS_STROKE} r={FOCUS_END_RADIUS} />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} fill="var(--surface-raised)" r={FOCUS_MID_RADIUS} stroke={FOCUS_STROKE} strokeWidth={1.5} />;
}

/** Ponto de contexto: a mesma gramática de partida e chegada, em neutro e menor. */
function renderContextPoint({ cx, cy, payload }: PointShapeProps): ReactElement | null {
  if (cx === undefined || cy === undefined || !payload) return null;
  if (payload.isFirst) {
    return <circle cx={cx} cy={cy} fill="var(--surface-raised)" r={CONTEXT_START_RADIUS} stroke={CONTEXT_STROKE} strokeWidth={1.25} />;
  }
  if (payload.isLast) {
    return <circle cx={cx} cy={cy} fill={CONTEXT_STROKE} r={CONTEXT_END_RADIUS} />;
  }
  return <circle cx={cx} cy={cy} fill={CONTEXT_STROKE} r={CONTEXT_MID_RADIUS} />;
}

export default function FocusedTrajectories({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: FocusedTrajectoriesProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const porPlataforma = new Map<string, { readonly name: string; readonly rows: { cpl: number; taxa: number; row: PlatformMonth }[] }>();
  let semLead = 0;
  for (const row of [...data].sort((a, b) => a.month.localeCompare(b.month))) {
    const cpl = costPerLead(row.investimento, row.leads);
    const taxa = qualificationRate(row.qualificados, row.leads);
    if (cpl === null || taxa === null) {
      semLead += 1;
      continue;
    }
    const grupo = porPlataforma.get(row.platformId) ?? { name: row.name, rows: [] };
    grupo.rows.push({ cpl, taxa, row });
    porPlataforma.set(row.platformId, grupo);
  }

  const trajectories: Trajectory[] = [];
  for (const [platformId, grupo] of porPlataforma) {
    const focus = platformId === highlightId;
    const turnIndex = findTurnIndex(grupo.rows);
    const points: Point[] = grupo.rows.map((item, index) => ({
      id: item.row.id,
      platformId,
      name: grupo.name,
      month: item.row.month,
      cpl: item.cpl,
      taxa: item.taxa,
      leads: item.row.leads,
      qualificados: item.row.qualificados,
      focus,
      isFirst: index === 0,
      isLast: index === grupo.rows.length - 1,
      isTurn: focus && index === turnIndex,
    }));
    trajectories.push({ platformId, name: grupo.name, focus, points });
  }

  if (trajectories.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte com lead captado: sem lead não existe CPL nem qualificação.</span>
      </div>
    );
  }

  /** A ordem de pintura é o papel: contexto primeiro, acesa por último (REC-13). */
  const contexto = trajectories.filter((trajectory) => !trajectory.focus);
  const acesa = trajectories.find((trajectory) => trajectory.focus);
  const ordenadas = acesa === undefined ? contexto : [...contexto, acesa];
  const pontosContexto = contexto.flatMap((trajectory) => trajectory.points);
  const pontosAcesos = acesa === undefined ? [] : [...acesa.points];

  const focusFirst = acesa?.points[0];
  const focusLast = acesa === undefined ? undefined : acesa.points[acesa.points.length - 1];
  const focusTurn = acesa?.points.find((point) => point.isTurn);

  /** As mesmas chamadas alimentam a frase acessível, a linha de leitura e os rótulos (DAD-9). */
  const nomeAceso = acesa === undefined ? '' : acesa.name;
  const mesPartida = focusFirst === undefined ? '' : formatMonthShort(focusFirst.month);
  const mesChegada = focusLast === undefined ? '' : formatMonthShort(focusLast.month);
  const mesVirada = focusTurn === undefined ? '' : formatMonthShort(focusTurn.month);
  const cplPartida = focusFirst === undefined ? '' : formatCurrencyAxis(focusFirst.cpl);
  const cplChegada = focusLast === undefined ? '' : formatCurrencyAxis(focusLast.cpl);
  const taxaVirada = focusTurn === undefined ? '' : formatRateWithVolume(focusTurn.qualificados, focusTurn.leads);
  const taxaChegada = focusLast === undefined ? '' : formatRateWithVolume(focusLast.qualificados, focusLast.leads);

  /**
   * A frase fica entre 100 e 250 caracteres da ACE-1 e abaixo do aviso de 235: medida com o dado
   * padrão, sai em 229 caracteres. Ela descreve a trajetória em FOCO, que é o que a versão afirma;
   * as de contexto entram pelo número, porque só elas dão sentido ao foco.
   */
  const summary =
    `Dispersão conectada de ${formatInt(trajectories.length)} plataformas, CPL no eixo horizontal e qualificação no vertical, com ${nomeAceso} em foco. ` +
    (focusFirst === undefined || focusLast === undefined
      ? ''
      : `Nela o CPL vai de ${cplPartida} a ${cplChegada}` +
        (focusTurn === undefined
          ? ` e a qualificação chega a ${taxaChegada} em ${mesChegada}.`
          : `, a qualificação topa em ${taxaVirada} em ${mesVirada} e recua a ${taxaChegada}.`));

  const reading =
    focusFirst === undefined || focusLast === undefined
      ? `${nomeAceso} em foco; as outras duas ficam em traço neutro`
      : `${nomeAceso}: CPL de ${cplPartida} a ${cplChegada}` +
        (focusTurn === undefined ? '' : `, com a qualificação no topo em ${mesVirada}`);

  const requests: LabelRequest[] = [];
  if (acesa !== undefined && focusFirst !== undefined) {
    requests.push({
      key: 'aceso-nome',
      text: `${nomeAceso}, ${mesPartida}`,
      cpl: focusFirst.cpl,
      taxa: focusFirst.taxa,
      fill: 'var(--text-primary)',
      weight: 700,
    });
  }
  if (focusTurn !== undefined) {
    requests.push({ key: 'aceso-virada', text: mesVirada, cpl: focusTurn.cpl, taxa: focusTurn.taxa, fill: 'var(--text-secondary)', weight: 500 });
  }
  if (focusLast !== undefined) {
    requests.push({ key: 'aceso-chegada', text: mesChegada, cpl: focusLast.cpl, taxa: focusLast.taxa, fill: 'var(--text-secondary)', weight: 500 });
  }
  for (const trajectory of contexto) {
    const fim = trajectory.points[trajectory.points.length - 1];
    if (!fim) continue;
    requests.push({ key: `contexto-${trajectory.platformId}`, text: trajectory.name, cpl: fim.cpl, taxa: fim.taxa, fill: 'var(--text-muted)', weight: 500 });
  }

  const marks = [
    ...pontosContexto.map((point) => ({ cpl: point.cpl, taxa: point.taxa, radius: CONTEXT_END_RADIUS })),
    ...pontosAcesos.map((point) => ({ cpl: point.cpl, taxa: point.taxa, radius: point.isTurn ? FOCUS_TURN_RING : FOCUS_END_RADIUS })),
  ];

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'cpl', name: 'CPL', value: formatCurrencyAxis(point.cpl) },
      { dataKey: 'taxa', name: 'Qualificação', value: formatRateWithVolume(point.qualificados, point.leads) },
    ] as unknown as ChartTooltipProps['payload'];
    return (
      <ChartTooltip
        active={props.active}
        label={`${point.name}, ${formatMonthShort(point.month)}`}
        labelFormat="text"
        payload={entries}
        valueFormat="text"
      />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="cpl"
              domain={[...DOMAIN_X]}
              name="CPL"
              tickFormatter={formatCurrencyAxis}
              tickLine={false}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="taxa"
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
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <TrajectoryLines trajectories={ordenadas} />
            <Scatter data={pontosContexto} isAnimationActive={animate} name="Contexto" shape={renderContextPoint} />
            <Scatter data={pontosAcesos} isAnimationActive={animate} name={nomeAceso} shape={renderFocusPoint} />
            <LabelLayer marks={marks} requests={requests} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        As outras trajetórias ficam em traço fino neutro, sem rótulo de mês
        {semLead > 0 ? '; meses sem lead captado ficam fora do plano' : ''}
      </p>
    </div>
  );
}
