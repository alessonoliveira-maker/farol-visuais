import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  ZIndexLayer,
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
import { data as defaultData, frontierWins as defaultFrontierWins, winsGoal as defaultWinsGoal, type ExecutiveWins } from './data';

/**
 * Plano de oportunidades contra taxa de ganho em escala log nos dois eixos, onde cada curva de
 * vitórias iguais vira uma reta: mostra quem passou da zona da meta, quem está nela e quem não tem
 * vitória nenhuma, que o log não desenha e por isso ganha uma faixa própria abaixo do plano.
 */
export interface WinsLogPlaneProps {
  readonly data?: readonly ExecutiveWins[];
  /** Meta de vitórias do período, que vira a reta de fronteira. */
  readonly winsGoal?: number;
  /** Largura da zona em torno da meta, em vitórias, para cima e para baixo. */
  readonly frontierWins?: number;
  readonly height?: number;
  readonly className?: string;
}

type Status = 'reach' | 'frontier' | 'below';

interface PlanePoint {
  readonly id: string;
  readonly name: string;
  readonly oportunidades: number;
  readonly ganhas: number;
  readonly taxa: number;
  readonly status: Status;
}

interface IsoSegment {
  readonly wins: number;
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

/** Faixa de taxa zero entre o plano e os tiques do eixo X: o vão, e a altura dela. */
const STRIP_GAP = 6;
const STRIP_HEIGHT = 24;
/**
 * Fora dos 8 px da EIX-5 de propósito: o Recharts soma 6 px de tickSize ao tickMargin mesmo com
 * tickLine desligado, e o tique precisa descer até depois da faixa de taxa zero, que usa o mesmo eixo.
 */
const X_TICK_MARGIN = STRIP_GAP + STRIP_HEIGHT;
const X_AXIS_HEIGHT = X_TICK_MARGIN + 16;
/** Topo com o nome do eixo Y; direita com as vitórias na ponta de cada reta. */
const MARGIN = { top: 24, right: 80, bottom: 20, left: 8 } as const;
/** Domínio log fixo, sem zero, com as pontas declaradas à mão; as retas são recortadas contra ele. */
const DOMAIN_X: readonly [number, number] = [8, 250];
const DOMAIN_Y: readonly [number, number] = [0.01, 1];
/** Tiques log em valores redondos escritos à mão: o passo automático devolveria potências quebradas. */
const TICKS_X = [10, 20, 50, 100, 200] as const;
const TICKS_Y = [0.01, 0.03, 0.1, 0.3, 1] as const;
const Y_AXIS_WIDTH = 44;
/** Vitórias das retas de fundo: com a meta de 12, cada reta dobra a anterior e o vão entre elas é igual. */
const ISO_WINS = [3, 6, 24] as const;
const ZONE_TINT = 0.18;
const POINT_RADIUS = 4.5;
const Z_RANGE: readonly [number, number] = [Math.PI * POINT_RADIUS * POINT_RADIUS, Math.PI * POINT_RADIUS * POINT_RADIUS];
const ROW_TITLE = 12;
const TEXT_SIZE = 11;
const LABEL_HEIGHT = 12;
const LABEL_CHAR_WIDTH = 6.2;
const POINT_GAP = 8;
const CORNER_GAP = 4;
/** Passo entre duas linhas de texto empilhadas: com 14 px a tinta de uma fica a mais de 4 px da outra. */
const NOTE_LINE = 14;
/** Acima das retas (400) e abaixo dos pontos (600): o halo corta reta, nunca ponto. */
const LABEL_Z = 450;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

function winsText(wins: number): string {
  return `${formatInt(wins)} ${wins === 1 ? 'vitória' : 'vitórias'}`;
}

function statusOf(ganhas: number, goal: number, frontier: number): Status {
  if (Math.abs(ganhas - goal) <= frontier) return 'frontier';
  return ganhas > goal ? 'reach' : 'below';
}

/**
 * Curva taxa = vitórias ÷ oportunidades recortada ao domínio, em TypeScript. Em escala log nos dois
 * eixos ela é uma reta, então bastam os dois extremos: entra pelo topo ou pela esquerda e sai pela
 * direita ou por baixo. Os dois ficam DENTRO do domínio, porque a ReferenceLine com segment descarta
 * a reta inteira se uma ponta passar da borda (REC-1).
 */
function clipHyperbola(wins: number): IsoSegment | null {
  const [xMin, xMax] = DOMAIN_X;
  const [yMin, yMax] = DOMAIN_Y;
  if (!(wins > 0)) return null;
  const x0 = Math.max(xMin, wins / yMax);
  const x1 = Math.min(xMax, wins / yMin);
  if (x0 >= x1) return null;
  return { wins, x0, y0: Math.min(yMax, wins / x0), x1, y1: Math.max(yMin, wins / x1) };
}

/** Ponto oco: executivo dentro da zona da meta. Forma própria porque a cor sozinha não distingue (ACE-2). */
function renderHollow(props: { readonly cx?: number; readonly cy?: number }) {
  if (props.cx === undefined || props.cy === undefined) return <g />;
  return <circle cx={props.cx} cy={props.cy} fill="var(--surface-raised)" r={POINT_RADIUS} stroke="var(--text-muted)" strokeWidth={1.5} />;
}

interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

interface LabelBox extends Rect {
  readonly id: string;
  readonly text: string;
  readonly strong: boolean;
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
}

function inside(rect: Rect, bounds: Rect): boolean {
  return (
    rect.left >= bounds.left &&
    rect.left + rect.width <= bounds.left + bounds.width &&
    rect.top >= bounds.top &&
    rect.top + rect.height <= bounds.top + bounds.height
  );
}

/**
 * Posição dos rótulos calculada aqui, fora do LabelList, que não conhece os vizinhos. As retas descem
 * da esquerda para a direita, então a ordem começa pelos lugares que elas não atravessam: acima à
 * direita, à direita e abaixo à esquerda; depois a esquerda e os outros dois cantos. Sem lugar livre,
 * o nome fica acima à direita, porque rótulo que some deixa executivo sem nome.
 */
function placeLabels(
  items: readonly { readonly id: string; readonly text: string; readonly px: number; readonly py: number; readonly strong: boolean }[],
  marks: readonly (Rect & { readonly id: string })[],
  bounds: Rect,
): readonly LabelBox[] {
  const placed: LabelBox[] = [];
  for (const item of [...items].sort((a, b) => a.py - b.py)) {
    const width = item.text.length * LABEL_CHAR_WIDTH;
    const size = { width, height: LABEL_HEIGHT };
    const above = item.py - POINT_RADIUS - LABEL_HEIGHT;
    const below = item.py + POINT_RADIUS;
    const middle = item.py - LABEL_HEIGHT / 2;
    const east = item.px + CORNER_GAP;
    const west = item.px - CORNER_GAP - width;
    const candidates: readonly Rect[] = [
      { left: east, top: above, ...size },
      { left: item.px + POINT_GAP, top: middle, ...size },
      { left: west, top: below, ...size },
      { left: item.px - POINT_GAP - width, top: middle, ...size },
      { left: west, top: above, ...size },
      { left: east, top: below, ...size },
    ];
    const blockers: readonly Rect[] = [...marks.filter((mark) => mark.id !== item.id), ...placed];
    const chosen = candidates.find((rect) => inside(rect, bounds) && !blockers.some((blocker) => overlaps(rect, blocker))) ?? candidates[0];
    if (chosen) placed.push({ ...chosen, id: item.id, text: item.text, strong: item.strong });
  }
  return placed;
}

interface ZeroRow {
  readonly id: string;
  readonly name: string;
  readonly oportunidades: number;
}

interface ZoneLayerProps {
  readonly goal: number;
  readonly frontier: number;
  readonly zeros: readonly ZeroRow[];
}

/**
 * A zona da meta e a faixa de taxa zero, numa camada dentro do ScatterChart: filho sem zIndex é
 * pintado depois da grade e antes das retas e dos pontos. A zona é o espaço entre a reta de meta
 * menos a fronteira e a de meta mais a fronteira. A faixa fica ABAIXO do plano e usa o mesmo eixo X:
 * zero vitória é zero medido, e zero não tem posição numa escala log, então não vai para o eixo.
 */
function ZoneLayer({ goal, frontier, zeros }: ZoneLayerProps) {
  const area = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!area || !xScale || !yScale) return null;
  const lower = clipHyperbola(goal - frontier);
  const upper = clipHyperbola(goal + frontier);
  /* Se as duas retas saem por bordas diferentes, o canto do domínio entra no contorno, e o fecho segue a borda (GEO-9). */
  const corners =
    lower && upper
      ? [
          { x: lower.x0, y: lower.y0 },
          { x: lower.x1, y: lower.y1 },
          ...(lower.x1 !== upper.x1 && lower.y1 !== upper.y1 ? [{ x: DOMAIN_X[1], y: DOMAIN_Y[0] }] : []),
          { x: upper.x1, y: upper.y1 },
          { x: upper.x0, y: upper.y0 },
          ...(lower.x0 !== upper.x0 && lower.y0 !== upper.y0 ? [{ x: DOMAIN_X[0], y: DOMAIN_Y[1] }] : []),
        ]
      : [];
  const zone = corners
    .flatMap((corner) => {
      const x = xScale(corner.x);
      const y = yScale(corner.y);
      return x === undefined || y === undefined ? [] : [`${String(Math.round(x * 100) / 100)},${String(Math.round(y * 100) / 100)}`];
    })
    .join(' ');
  const right = area.x + area.width;
  const stripTop = area.y + area.height + STRIP_GAP;
  const stripMiddle = stripTop + STRIP_HEIGHT / 2;

  return (
    <g>
      {/* check-ok: OPACIDADE-MARCA zona de fronteira, não marca de dado: a reta da meta no meio dela é opaca, com o valor na ponta */}
      <polygon fill="var(--text-muted)" fillOpacity={ZONE_TINT} points={zone} stroke="none" />
      <rect fill="var(--surface-sunken)" height={STRIP_HEIGHT} width={area.width} x={area.x} y={stripTop} />
      {TICKS_X.map((tick) => {
        const x = xScale(tick);
        return x === undefined ? null : <line key={tick} stroke="var(--line-subtle)" x1={x} x2={x} y1={stripTop} y2={stripTop + STRIP_HEIGHT} />;
      })}
      {/* O tique do Recharts fica 14 px à esquerda do plano (6 de tickSize mais 8 de tickMargin): o zero da faixa alinha com ele. */}
      <text className="tabular-nums" fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="end" x={area.x - 14} y={stripMiddle + 4}>
        {formatPercent(0, 0)}
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={right + 6} y={stripMiddle + 4}>
        {winsText(0)}
      </text>
      {zeros.map((row) => {
        const x = xScale(row.oportunidades);
        if (x === undefined) return null;
        return (
          <g key={row.id}>
            <circle cx={x} cy={stripMiddle} fill="var(--text-muted)" r={POINT_RADIUS} />
            <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} fontWeight={500} x={x + POINT_GAP} y={stripMiddle + 4}>
              {row.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

interface LabelLayerProps {
  readonly points: readonly PlanePoint[];
  readonly isoLines: readonly IsoSegment[];
  readonly goalLine: IsoSegment | null;
  readonly frontier: number;
}

/**
 * Todo o texto do plano: nomes dos eixos, as vitórias na ponta de cada reta, na margem da direita,
 * e o nome de quem passou da zona da meta ou está dentro dela.
 */
function LabelLayer({ points, isoLines, goalLine, frontier }: LabelLayerProps) {
  const area = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!area || !xScale || !yScale) return null;
  const right = area.x + area.width;
  const bottom = area.y + area.height;
  const goalY = goalLine === null ? undefined : yScale(goalLine.y1);
  const positions = points.flatMap((point) => {
    const px = xScale(point.oportunidades);
    const py = yScale(point.taxa);
    return px === undefined || py === undefined ? [] : [{ point, px, py }];
  });
  const labels = placeLabels(
    positions
      .filter((position) => position.point.status !== 'below')
      .map((position) => ({ id: position.point.id, text: position.point.name, px: position.px, py: position.py, strong: position.point.status === 'reach' })),
    positions.map((position) => ({
      id: position.point.id,
      left: position.px - POINT_RADIUS - 1,
      top: position.py - POINT_RADIUS - 1,
      width: 2 * POINT_RADIUS + 2,
      height: 2 * POINT_RADIUS + 2,
    })),
    { left: area.x, top: area.y, width: area.width - 2, height: area.height },
  );

  return (
    <g>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={MARGIN.left} y={ROW_TITLE}>
        Taxa de ganho, em escala log
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="end" x={right} y={bottom + X_AXIS_HEIGHT + 14}>
        Oportunidades trabalhadas, em escala log
      </text>
      {isoLines.map((line) => {
        const y = yScale(line.y1);
        return y === undefined ? null : (
          <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} key={line.wins} x={right + 6} y={y + 4}>
            {winsText(line.wins)}
          </text>
        );
      })}
      {goalLine === null || goalY === undefined ? null : (
        <g>
          <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} fontWeight={600} x={right + 6} y={goalY - 2}>
            {winsText(goalLine.wins)}
          </text>
          <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={right + 6} y={goalY - 2 + NOTE_LINE}>
            {`meta ± ${formatInt(frontier)}`}
          </text>
        </g>
      )}
      <ZIndexLayer zIndex={LABEL_Z}>
        {labels.map((box) => (
          <text
            className="font-display"
            fill={box.strong ? 'var(--text-primary)' : 'var(--text-secondary)'}
            fontSize={TEXT_SIZE}
            fontWeight={box.strong ? 600 : 500}
            key={box.id}
            style={HALO}
            x={box.left}
            y={box.top + LABEL_HEIGHT - 2}
          >
            {box.text}
          </text>
        ))}
      </ZIndexLayer>
    </g>
  );
}

export default function WinsLogPlane({
  data = defaultData,
  winsGoal = defaultWinsGoal,
  frontierWins = defaultFrontierWins,
  height,
  className,
}: WinsLogPlaneProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  /* Três destinos: com vitória vai ao plano; zero vitória vai à faixa de taxa zero; sem oportunidade a taxa não existe e vai só ao rodapé. */
  const worked = data.filter((row) => row.oportunidades > 0);
  const points: readonly PlanePoint[] = worked
    .filter((row) => row.ganhas > 0)
    .map((row) => ({
      id: row.id,
      name: row.name,
      oportunidades: row.oportunidades,
      ganhas: row.ganhas,
      taxa: row.ganhas / row.oportunidades,
      status: statusOf(row.ganhas, winsGoal, frontierWins),
    }));
  const zeros: readonly ZeroRow[] = worked.filter((row) => row.ganhas <= 0).map((row) => ({ id: row.id, name: row.name, oportunidades: row.oportunidades }));

  if (worked.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte trabalhou oportunidade, então não há taxa de ganho para pôr no plano.</span>
      </div>
    );
  }

  const reach = points.filter((point) => point.status === 'reach');
  const frontier = points.filter((point) => point.status === 'frontier');
  const below = points.filter((point) => point.status === 'below');
  const fora = data.length - worked.length;
  const isoLines = ISO_WINS.flatMap((wins) => {
    const line = clipHyperbola(wins);
    return line ? [line] : [];
  });
  const goalLine = clipHyperbola(winsGoal);
  const zone = `${formatInt(frontierWins)} ${frontierWins === 1 ? 'vitória' : 'vitórias'}`;

  const summary =
    `Gráfico de dispersão em escala log com oportunidades e taxa de ganho de ${formatInt(worked.length)} executivos, sobre retas de vitórias iguais. ` +
    `${formatInt(reach.length)} passam da zona da meta de ${winsText(winsGoal)}, ${formatInt(frontier.length)} estão nela e ` +
    `${formatInt(zeros.length)} não têm vitória, numa faixa à parte.`;
  const footer =
    `${formatInt(points.length)} de ${formatInt(data.length)} executivos no plano` +
    (zeros.length > 0 ? `; ${formatInt(zeros.length)} sem vitória ficam na faixa de taxa zero, que a escala log não desenha` : '') +
    (fora > 0 ? `; ${formatInt(fora)} sem oportunidade trabalhada ficam fora` : '') +
    '.';

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as PlanePoint | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'oportunidades', name: 'Oportunidades', value: formatInt(point.oportunidades) },
      { dataKey: 'taxa', name: 'Taxa de ganho', value: formatRateWithVolume(point.ganhas, point.oportunidades) },
      { dataKey: 'ganhas', name: 'Oportunidades × taxa', value: winsText(point.ganhas) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs tabular-nums text-text-secondary">
        {`${formatInt(reach.length)} de ${formatInt(worked.length)} executivos passam da zona da meta; ${formatInt(frontier.length)} estão nela, a até ${zone} das ${formatInt(winsGoal)}`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            {/* Nos dois eixos: axisLine depois do spread do AXIS_PROPS, que vem ligado (REC-30), e interval 0 para o eixo não descartar tique e levar a grade junto (REC-29). */}
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="oportunidades"
              domain={[...DOMAIN_X]}
              height={X_AXIS_HEIGHT}
              interval={0}
              name="Oportunidades"
              scale="log"
              tickFormatter={(value: number) => formatInt(value)}
              tickMargin={X_TICK_MARGIN}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="taxa"
              domain={[...DOMAIN_Y]}
              interval={0}
              name="Taxa de ganho"
              scale="log"
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <ZoneLayer frontier={frontierWins} goal={winsGoal} zeros={zeros} />
            {/* Retas de fundo primeiro e a da meta depois: entre linhas de referência, a ordem dos filhos é a ordem de pintura. */}
            {isoLines.map((line) => (
              <ReferenceLine
                ifOverflow="extendDomain"
                key={line.wins}
                segment={[
                  { x: line.x0, y: line.y0 },
                  { x: line.x1, y: line.y1 },
                ]}
                stroke="var(--line-strong)"
                strokeWidth={1}
              />
            ))}
            {goalLine === null ? null : (
              <ReferenceLine
                ifOverflow="extendDomain"
                segment={[
                  { x: goalLine.x0, y: goalLine.y0 },
                  { x: goalLine.x1, y: goalLine.y1 },
                ]}
                stroke="var(--text-muted)"
                strokeWidth={1.5}
              />
            )}
            <Scatter data={below} fill="var(--text-muted)" isAnimationActive={animate} name="Abaixo da zona" shape="circle" stroke="var(--surface-raised)" strokeWidth={1} />
            <Scatter data={frontier} isAnimationActive={animate} name="Na zona da meta" shape={renderHollow} />
            <Scatter data={reach} fill="var(--chart-1)" isAnimationActive={animate} name="Acima da zona" shape="circle" stroke="var(--surface-raised)" strokeWidth={1} />
            <LabelLayer frontier={frontierWins} goalLine={goalLine} isoLines={isoLines} points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Na escala log dos dois eixos, vitórias iguais viram reta, e todas as retas são paralelas.
      </p>
      <p aria-hidden className="shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {footer}
      </p>
    </div>
  );
}
