import { Filter } from 'lucide-react';
import {
  CartesianGrid,
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
import { data as defaultData, winsGoal as defaultWinsGoal, type ExecutiveWins } from './data';

/**
 * Plano de oportunidades contra taxa de ganho com curvas de vitórias iguais: como vitórias são o
 * produto dos dois eixos, a meta é uma hipérbole, e o plano mostra quem chega nela e se chega pelo
 * volume ou pela taxa.
 */
export interface WinsIsoCurvesProps {
  readonly data?: readonly ExecutiveWins[];
  /** Meta de vitórias do período, que vira a curva de fronteira. */
  readonly winsGoal?: number;
  readonly height?: number;
  readonly className?: string;
}

interface PlanePoint {
  readonly id: string;
  readonly name: string;
  readonly oportunidades: number;
  readonly ganhas: number;
  readonly taxa: number;
  readonly reach: boolean;
}

interface CurvePoint {
  readonly x: number;
  readonly y: number;
}

type Scale = (value: number) => number | undefined;

/** Topo com o nome do eixo Y e as vitórias de cada curva; direita com o rótulo da meta. */
const MARGIN = { top: 36, right: 76, bottom: 20, left: 8 } as const;
/** Domínio fixo amarrado a constantes: as curvas são recortadas contra estes mesmos números. */
const DOMAIN_X: readonly [number, number] = [0, 100];
const TICKS_X = [0, 25, 50, 75, 100] as const;
const DOMAIN_Y: readonly [number, number] = [0, 0.8];
const TICKS_Y = [0, 0.2, 0.4, 0.6, 0.8] as const;
const Y_AXIS_WIDTH = 48;
const X_AXIS_HEIGHT = 24;
/** Vitórias das curvas de fundo; a da meta vem do dado e é desenhada à parte, um degrau acima. */
const ISO_WINS = [5, 10, 20] as const;
/** Trechos de cada curva. O passo é geométrico no X, então eles se adensam perto do eixo Y. */
const CURVE_STEPS = 48;
/** Fração do volume médio do time que define quem chegou à meta pela taxa. */
const HALF_VOLUME = 0.5;
const GOAL_TINT = 0.1;
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
/** Acima das curvas e abaixo dos pontos (600): o halo corta curva, nunca ponto. */
const LABEL_Z = 450;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

/** Média; lista vazia devolve null e nunca zero (EST-1b). */
function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Hipérbole taxa = vitórias ÷ oportunidades, recortada ao domínio e amostrada em TypeScript com
 * passo GEOMÉTRICO: cada X é o anterior vezes a mesma razão. Com passo igual, os trechos junto do
 * eixo Y, onde a curva despenca, ficariam longos e a curva sairia quebrada justo ali.
 */
function sampleHyperbola(wins: number): readonly CurvePoint[] {
  const [xMin, xMax] = DOMAIN_X;
  const [yMin, yMax] = DOMAIN_Y;
  const start = Math.max(xMin, wins / yMax);
  const end = yMin > 0 ? Math.min(xMax, wins / yMin) : xMax;
  if (!(start > 0) || start >= end) return [];
  const step = (end / start) ** (1 / CURVE_STEPS);
  return Array.from({ length: CURVE_STEPS + 1 }, (_, index) => {
    const x = index === CURVE_STEPS ? end : start * step ** index;
    return { x, y: Math.min(yMax, wins / x) };
  });
}

/** Caminho em pixel a partir das escalas dos eixos, sem refazer a conta do domínio. */
function toPath(curve: readonly CurvePoint[], xScale: Scale, yScale: Scale): string {
  const parts: string[] = [];
  for (const point of curve) {
    const x = xScale(point.x);
    const y = yScale(point.y);
    if (x === undefined || y === undefined) continue;
    parts.push(`${parts.length === 0 ? 'M' : 'L'}${String(Math.round(x * 100) / 100)},${String(Math.round(y * 100) / 100)}`);
  }
  return parts.join(' ');
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
 * Posição dos rótulos calculada aqui, fora do LabelList, que não conhece os vizinhos. A curva desce
 * da esquerda para a direita, então a ordem começa pelos lugares que ela não atravessa: acima à
 * direita, à direita e abaixo à esquerda; depois a esquerda e os outros dois cantos. Sem lugar livre,
 * o nome fica acima à direita, porque rótulo que some deixa executivo sem nome.
 */
function placeLabels(
  items: readonly { readonly id: string; readonly text: string; readonly px: number; readonly py: number }[],
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
    if (chosen) placed.push({ ...chosen, id: item.id, text: item.text });
  }
  return placed;
}

/**
 * As curvas, numa camada dentro do ScatterChart: filho sem zIndex é pintado depois da grade e antes
 * das linhas de referência e dos pontos, que é a ordem que a hierarquia pede. Primeiro a região
 * acima da meta, depois as curvas de fundo e por último a da meta.
 */
function CurveLayer({ goal }: { readonly goal: number }) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!xScale || !yScale) return null;
  const goalCurve = sampleHyperbola(goal);
  /* A região fecha pelo canto de cima à direita: o Z volta ao início pela borda de cima, sem diagonal (GEO-9). */
  const region = goalCurve.length > 0 ? `${toPath([...goalCurve, { x: DOMAIN_X[1], y: DOMAIN_Y[1] }], xScale, yScale)} Z` : '';
  return (
    <g>
      {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a fronteira é a curva opaca da meta, com o valor escrito na ponta */}
      <path d={region} fill="var(--chart-1)" fillOpacity={GOAL_TINT} stroke="none" />
      {ISO_WINS.map((wins) => (
        <path d={toPath(sampleHyperbola(wins), xScale, yScale)} fill="none" key={wins} stroke="var(--line-strong)" strokeWidth={1} />
      ))}
      <path d={toPath(goalCurve, xScale, yScale)} fill="none" stroke="var(--text-muted)" strokeWidth={1.5} />
    </g>
  );
}

/**
 * Onde a anotação fica: à direita dos nomes do grupo de que ela fala, na altura do meio deles, sem
 * passar da borda do plano. Sem grupo não há anotação, e a função devolve null em vez de uma posição.
 */
function placeNote(boxes: readonly LabelBox[], lines: readonly string[], limit: number): { readonly left: number; readonly middle: number } | null {
  const first = boxes[0];
  if (first === undefined) return null;
  let edge = first.left + first.width;
  let top = first.top;
  let bottom = first.top + first.height;
  for (const box of boxes) {
    edge = Math.max(edge, box.left + box.width);
    top = Math.min(top, box.top);
    bottom = Math.max(bottom, box.top + box.height);
  }
  const width = Math.max(1, ...lines.map((line) => line.length)) * LABEL_CHAR_WIDTH;
  return { left: Math.min(edge + 14, limit - width), middle: (top + bottom) / 2 };
}

interface LabelLayerProps {
  readonly points: readonly PlanePoint[];
  readonly goal: number;
  readonly fastIds: ReadonlySet<string>;
  readonly meanVolume: number;
}

/**
 * Todo o texto do plano: nomes dos eixos, vitórias na ponta de cada curva, o rótulo da meta na margem
 * da direita, o nome de quem chega à meta e a anotação do grupo que chega pela taxa, posta ao lado
 * dos nomes desse grupo para não ficar sem dono.
 */
function LabelLayer({ points, goal, fastIds, meanVolume }: LabelLayerProps) {
  const area = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!area || !xScale || !yScale) return null;
  const right = area.x + area.width;
  const bottom = area.y + area.height;
  const goalY = yScale(goal / DOMAIN_X[1]);
  const positions = points.flatMap((point) => {
    const px = xScale(point.oportunidades);
    const py = yScale(point.taxa);
    return px === undefined || py === undefined ? [] : [{ point, px, py }];
  });
  const labels = placeLabels(
    positions.filter((position) => position.point.reach).map((position) => ({ id: position.point.id, text: position.point.name, px: position.px, py: position.py })),
    positions.map((position) => ({
      id: position.point.id,
      left: position.px - POINT_RADIUS - 1,
      top: position.py - POINT_RADIUS - 1,
      width: 2 * POINT_RADIUS + 2,
      height: 2 * POINT_RADIUS + 2,
    })),
    { left: area.x, top: area.y, width: area.width - 2, height: area.height },
  );
  const fastBoxes = labels.filter((box) => fastIds.has(box.id));
  const noteLines = [
    `${formatInt(fastIds.size)} ${fastIds.size === 1 ? 'chega' : 'chegam'} à meta com até metade`,
    `do volume médio (${formatInt(meanVolume)} oportunidades)`,
  ];
  const note = placeNote(fastBoxes, noteLines, right - 2);

  return (
    <g>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={MARGIN.left} y={ROW_TITLE}>
        Taxa de ganho
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="end" x={right} y={bottom + X_AXIS_HEIGHT + 14}>
        Oportunidades trabalhadas
      </text>
      {ISO_WINS.map((wins, index) => {
        const x = xScale(wins / DOMAIN_Y[1]);
        if (x === undefined) return null;
        return (
          <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} key={wins} textAnchor="middle" x={x} y={area.y - 6}>
            {index === ISO_WINS.length - 1 ? `${formatInt(wins)} vitórias` : formatInt(wins)}
          </text>
        );
      })}
      {goalY === undefined ? null : (
        <g>
          <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} fontWeight={600} x={right + 6} y={goalY - 2}>
            {`${formatInt(goal)} vitórias`}
          </text>
          <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={right + 6} y={goalY - 2 + NOTE_LINE}>
            meta
          </text>
        </g>
      )}
      <ZIndexLayer zIndex={LABEL_Z}>
        {labels.map((box) => (
          <text className="font-display" fill="var(--text-primary)" fontSize={TEXT_SIZE} fontWeight={600} key={box.id} style={HALO} x={box.left} y={box.top + LABEL_HEIGHT - 2}>
            {box.text}
          </text>
        ))}
        {note === null
          ? null
          : noteLines.map((line, index) => (
              <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} key={line} style={HALO} x={note.left} y={note.middle - 2 + index * NOTE_LINE}>
                {line}
              </text>
            ))}
      </ZIndexLayer>
    </g>
  );
}

export default function WinsIsoCurves({ data = defaultData, winsGoal = defaultWinsGoal, height, className }: WinsIsoCurvesProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  /* Sem oportunidade trabalhada a taxa não existe: o executivo sai do plano e vai contado no rodapé, nunca em zero. */
  const points: readonly PlanePoint[] = data
    .filter((row) => row.oportunidades > 0)
    .map((row) => ({
      id: row.id,
      name: row.name,
      oportunidades: row.oportunidades,
      ganhas: row.ganhas,
      taxa: row.ganhas / row.oportunidades,
      reach: row.ganhas >= winsGoal,
    }));
  const meanVolume = mean(points.map((point) => point.oportunidades));

  if (meanVolume === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte trabalhou oportunidade, então não há taxa de ganho para pôr no plano.</span>
      </div>
    );
  }

  const reach = points.filter((point) => point.reach);
  const rest = points.filter((point) => !point.reach);
  const fastIds = new Set(reach.filter((point) => point.oportunidades <= meanVolume * HALF_VOLUME).map((point) => point.id));
  const fora = data.length - points.length;

  const summary =
    `Gráfico de dispersão com oportunidades e taxa de ganho de ${formatInt(points.length)} executivos, sobre curvas de vitórias iguais. ` +
    `${formatInt(reach.length)} chegam às ${formatInt(winsGoal)} vitórias da meta, e ${formatInt(fastIds.size)} deles com até metade do volume médio do time, ` +
    `de ${formatInt(meanVolume)} oportunidades.`;
  const footer =
    `Curvas: vitórias = oportunidades × taxa de ganho. ${formatInt(points.length)} de ${formatInt(data.length)} executivos no plano` +
    (fora > 0 ? `; ${formatInt(fora)} sem oportunidade trabalhada ficam fora.` : '.');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as PlanePoint | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'oportunidades', name: 'Oportunidades', value: formatInt(point.oportunidades) },
      { dataKey: 'taxa', name: 'Taxa de ganho', value: formatRateWithVolume(point.ganhas, point.oportunidades) },
      { dataKey: 'ganhas', name: 'Oportunidades × taxa', value: `${formatInt(point.ganhas)} ${point.ganhas === 1 ? 'vitória' : 'vitórias'}` },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="tabular-nums">{formatInt(reach.length)}</span> de <span className="tabular-nums">{formatInt(points.length)}</span> executivos chegam às{' '}
        <span className="tabular-nums">{formatInt(winsGoal)}</span> vitórias da meta do trimestre
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
              tickFormatter={(value: number) => formatInt(value)}
              tickMargin={8}
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
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <CurveLayer goal={winsGoal} />
            <Scatter data={rest} fill="var(--text-muted)" isAnimationActive={animate} name="Abaixo da meta" shape="circle" stroke="var(--surface-raised)" strokeWidth={1} />
            <Scatter data={reach} fill="var(--chart-1)" isAnimationActive={animate} name="Na meta ou acima" shape="circle" stroke="var(--surface-raised)" strokeWidth={1} />
            <LabelLayer fastIds={fastIds} goal={winsGoal} meanVolume={meanVolume} points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {footer}
      </p>
    </div>
  );
}
