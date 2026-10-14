import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ReferenceArea,
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
import { formatDecimal, formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginMonths } from './data';

/**
 * Matriz 2x2 de variação entre dois meses: volume de leads no eixo horizontal e taxa de qualificação
 * no vertical, os dois centrados no zero. A região de ação é a de volume que subiu e taxa que caiu.
 */
export interface OriginShiftQuadrantsProps {
  readonly data?: readonly OriginMonths[];
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly name: string;
  /** Posição no plano: igual à variação real, ou presa à borda quando passa do teto. */
  readonly x: number;
  readonly y: number;
  readonly volume: number;
  readonly pontos: number;
  readonly fora: boolean;
  readonly leadsAnterior: number;
  readonly qualificadosAnterior: number;
  readonly leadsAtual: number;
  readonly qualificadosAtual: number;
}

type Region = 'escalar' | 'volume' | 'revisar' | 'reavaliar';

const MARGIN = { top: 36, right: 96, bottom: 20, left: 8 } as const;
/** Base mínima de leads nos dois meses: abaixo dela a taxa oscila demais para classificar. */
const MIN_LEADS = 30;
/** Teto do volume no plano, em fração: acima dele a origem é presa na borda e marcada. */
const VOLUME_CAP = 1;
/** Degraus de domínio, do menor ao maior: o domínio simétrico é o primeiro que cobre o maior módulo. */
const VOLUME_STEPS = [0.2, 0.4, 0.5, 0.8, 1] as const;
/** Folga do domínio sobre o maior módulo, para a marca extrema não nascer em cima da borda. */
const DOMAIN_HEADROOM = 1.1;
const POINTS_STEPS = [2, 4, 6, 8, 10, 16, 20] as const;
const Y_AXIS_WIDTH = 56;
const X_AXIS_HEIGHT = 24;
const POINT_RADIUS = 4;
const Z_RANGE: readonly [number, number] = [Math.PI * POINT_RADIUS * POINT_RADIUS, Math.PI * POINT_RADIUS * POINT_RADIUS];
const ACTION_TINT = 0.07;
const OTHER_TINT = 0.04;
const TEXT_SIZE = 11;
const LABEL_HEIGHT = 12;
const LABEL_CHAR_WIDTH = 6.2;
const POINT_GAP = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

const REGION_TITLE: Record<Region, string> = {
  escalar: 'Escalar',
  volume: 'Recuperar volume',
  revisar: 'Revisar a qualificação',
  reavaliar: 'Reavaliar o investimento',
};

/** Sinal escrito à mão sobre o valor absoluto: nenhum formatador escreve o `+` (NUM-3). */
function signed(value: number, text: string): string {
  return `${value >= 0 ? '+' : '−'}${text}`;
}

/** Menor degrau que cobre o valor; o último degrau vale como teto. */
function niceStep(value: number, steps: readonly number[]): number {
  return steps.find((step) => step >= value) ?? steps[steps.length - 1] ?? value;
}

function regionOf(point: Point): Region {
  if (point.volume >= 0) return point.pontos >= 0 ? 'escalar' : 'revisar';
  return point.pontos >= 0 ? 'volume' : 'reavaliar';
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
  readonly focus: boolean;
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
}

/**
 * Posição dos rótulos calculada aqui, fora do LabelList, que não conhece os vizinhos. Cada nome tenta
 * a altura do próprio ponto, no lado direito e no esquerdo, depois acima e abaixo dele, depois mais linhas
 * de distância, sem tocar outro ponto, outro rótulo, a linha de corte nem um título de região. Quem está fora da
 * escala escolhe primeiro, porque o valor real dele só existe no rótulo; os demais, do nome mais longo
 * para o mais curto, porque o longo é o que tem menos onde caber.
 */
function placeLabels(
  items: readonly { readonly id: string; readonly text: string; readonly px: number; readonly py: number; readonly focus: boolean; readonly first: boolean }[],
  bounds: { readonly left: number; readonly right: number; readonly top: number; readonly bottom: number },
  fixed: readonly Rect[],
): readonly LabelBox[] {
  const marks: readonly (Rect & { readonly id: string })[] = items.map((item) => ({
    id: item.id,
    left: item.px - POINT_RADIUS - 1,
    top: item.py - POINT_RADIUS - 1,
    width: 2 * POINT_RADIUS + 2,
    height: 2 * POINT_RADIUS + 2,
  }));
  const placed: LabelBox[] = [];
  for (const item of [...items].sort((a, b) => Number(b.first) - Number(a.first) || b.text.length - a.text.length || a.py - b.py)) {
    const width = item.text.length * LABEL_CHAR_WIDTH;
    const lefts = [item.px + POINT_GAP, item.px - POINT_GAP - width];
    const blockers: readonly Rect[] = [...fixed, ...marks.filter((mark) => mark.id !== item.id), ...placed];
    const above = item.py - POINT_RADIUS - 2 - LABEL_HEIGHT;
    const below = item.py + POINT_RADIUS + 2;
    const spots: { readonly left: number; readonly top: number }[] = [];
    for (const step of [0, -1, 1, -2, 2, -3, 3, -4, 4]) {
      for (const left of lefts) spots.push({ left, top: item.py - LABEL_HEIGHT / 2 + step * LABEL_HEIGHT });
      if (step === 0) {
        /** Acima ou abaixo do próprio ponto, encostado nele: o dono continua óbvio quando os lados estão tomados. */
        for (const top of [above, below]) spots.push({ left: item.px - width, top }, { left: item.px, top }, { left: item.px - width / 2, top });
      }
    }
    const spot = spots.find((candidate) => {
      const rect = { left: candidate.left, top: candidate.top, width, height: LABEL_HEIGHT };
      const inside =
        rect.left >= bounds.left && rect.left + width <= bounds.right && rect.top >= bounds.top && rect.top + LABEL_HEIGHT <= bounds.bottom;
      return inside && !blockers.some((blocker) => overlaps(rect, blocker));
    });
    /** Sem lugar livre o nome não é desenhado: rótulo sobreposto ou longe do ponto não tem dono (a dica traz o nome). */
    if (spot === undefined) continue;
    const chosen: LabelBox = { left: spot.left, top: spot.top, width, height: LABEL_HEIGHT, id: item.id, text: item.text, focus: item.focus };
    placed.push(chosen);
  }
  return placed;
}

interface PlaneLayerProps {
  readonly points: readonly Point[];
  readonly counts: Record<Region, number>;
}

/**
 * Texto do plano numa camada só, dentro do ScatterChart (usa usePlotArea e as escalas): títulos de
 * ação nos cantos externos, rótulo direto da região de ação e das origens presas na borda, nomes dos
 * cortes e dos eixos. O `label` nativo da ReferenceLine cairia dentro da área, sobre a nuvem (REC-4).
 */
function PlaneLayer({ points, counts }: PlaneLayerProps) {
  const area = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!area || !xScale || !yScale) return null;
  const cx = xScale(0);
  const cy = yScale(0);
  if (cx === undefined || cy === undefined) return null;

  const right = area.x + area.width;
  const bottom = area.y + area.height;
  const corners: readonly { readonly region: Region; readonly x: number; readonly y: number; readonly anchor: 'start' | 'end' }[] = [
    { region: 'volume', x: area.x + 8, y: area.y + 16, anchor: 'start' },
    { region: 'escalar', x: right - 8, y: area.y + 16, anchor: 'end' },
    { region: 'reavaliar', x: area.x + 8, y: bottom - 20, anchor: 'start' },
    { region: 'revisar', x: right - 8, y: bottom - 20, anchor: 'end' },
  ];
  /** Os títulos de região entram como obstáculo: rótulo de ponto nunca pousa embaixo deles. */
  const titleBoxes: readonly Rect[] = corners.map((corner) => {
    const width = Math.max(REGION_TITLE[corner.region].length * 7, 72);
    return { left: corner.anchor === 'start' ? corner.x : corner.x - width, top: corner.y - 12, width, height: 30 };
  });
  const labels = placeLabels(
    points.flatMap((point) => {
      const px = xScale(point.x);
      const py = yScale(point.y);
      if (px === undefined || py === undefined) return [];
      const focus = regionOf(point) === 'revisar';
      if (!focus && !point.fora) return [];
      const text = point.fora ? `${point.name} ${signed(point.volume, `${formatInt(Math.abs(point.volume) * 100)}%`)}` : point.name;
      return [{ id: point.id, text, px, py, focus, first: point.fora }];
    }),
    { left: area.x, right, top: area.y, bottom },
    [{ left: cx - 1, top: area.y, width: 2, height: area.height }, ...titleBoxes],
  );

  return (
    <g>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={MARGIN.left} y={12}>
        Taxa de qualificação, variação em p.p.
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="end" x={right} y={bottom + X_AXIS_HEIGHT + 14}>
        Volume de leads, variação em %
      </text>
      <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} textAnchor="middle" x={cx} y={area.y - 8}>
        corte em 0%: o volume de agosto
      </text>
      <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} x={right + 6} y={cy - 2}>
        corte em 0 p.p.
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={right + 6} y={cy + 12}>
        taxa de agosto
      </text>
      {corners.map((corner) => (
        <g key={corner.region}>
          <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={600} style={HALO} textAnchor={corner.anchor} x={corner.x} y={corner.y}>
            {REGION_TITLE[corner.region]}
          </text>
          <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} style={HALO} textAnchor={corner.anchor} x={corner.x} y={corner.y + 15}>
            {`${formatInt(counts[corner.region])} ${counts[corner.region] === 1 ? 'origem' : 'origens'}`}
          </text>
        </g>
      ))}
      {labels.map((box) => (
        <text
          className="font-display"
          fill={box.focus ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontSize={TEXT_SIZE}
          fontWeight={box.focus ? 600 : 500}
          key={box.id}
          style={HALO}
          x={box.left}
          y={box.top + LABEL_HEIGHT - 2}
        >
          {box.text}
        </text>
      ))}
    </g>
  );
}

export default function OriginShiftQuadrants({ data = defaultData, height, className }: OriginShiftQuadrantsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const raw: Point[] = [];
  let abaixoBase = 0;
  let novas = 0;
  for (const row of data) {
    if (row.leadsAnterior <= 0 || row.qualificadosAnterior === null) {
      novas += 1;
    } else if (row.leadsAnterior < MIN_LEADS || row.leadsAtual < MIN_LEADS) {
      abaixoBase += 1;
    } else {
      const volume = row.leadsAtual / row.leadsAnterior - 1;
      const pontos = (row.qualificadosAtual / row.leadsAtual - row.qualificadosAnterior / row.leadsAnterior) * 100;
      raw.push({
        id: row.id,
        name: row.name,
        x: volume,
        y: pontos,
        volume,
        pontos,
        fora: false,
        leadsAnterior: row.leadsAnterior,
        qualificadosAnterior: row.qualificadosAnterior,
        leadsAtual: row.leadsAtual,
        qualificadosAtual: row.qualificadosAtual,
      });
    }
  }

  if (raw.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>{`Nenhuma origem neste recorte tem ${formatInt(MIN_LEADS)} leads nos dois meses, então não há variação para classificar.`}</span>
      </div>
    );
  }

  /** Domínio simétrico: o maior módulo entre as origens dentro do teto, arredondado para cima por degrau fixo. */
  const withinCap = raw.filter((point) => Math.abs(point.volume) <= VOLUME_CAP);
  const xMax = niceStep(Math.max(0, ...withinCap.map((point) => Math.abs(point.volume))) * DOMAIN_HEADROOM, VOLUME_STEPS);
  const yMax = niceStep(Math.max(0, ...raw.map((point) => Math.abs(point.pontos))) * DOMAIN_HEADROOM, POINTS_STEPS);
  const points: Point[] = raw.map((point) =>
    Math.abs(point.volume) > VOLUME_CAP ? { ...point, x: Math.sign(point.volume) * xMax, fora: true } : point,
  );

  const counts: Record<Region, number> = { escalar: 0, volume: 0, revisar: 0, reavaliar: 0 };
  for (const point of points) counts[regionOf(point)] += 1;
  const focus = points.filter((point) => regionOf(point) === 'revisar' && !point.fora);
  const rest = points.filter((point) => regionOf(point) !== 'revisar' && !point.fora);
  const borda = points.filter((point) => point.fora);
  const foraDoPlano = data.length - points.length;
  const tetoTexto = signed(VOLUME_CAP, `${formatInt(VOLUME_CAP * 100)}%`);

  const summary =
    `Gráfico de dispersão com a variação de volume e de qualificação de ${formatInt(points.length)} origens de lead, de agosto para setembro, ` +
    `cortado no zero. ${formatInt(counts.revisar)} cresceram em volume e perderam qualificação. ` +
    `${formatInt(foraDoPlano)} ficam fora por base abaixo de ${formatInt(MIN_LEADS)} leads ou por serem novas.`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      {
        dataKey: 'volume',
        name: 'Volume',
        value: `${formatInt(point.leadsAnterior)} para ${formatInt(point.leadsAtual)} leads (${signed(point.volume, `${formatInt(Math.abs(point.volume) * 100)}%`)})`,
      },
      { dataKey: 'anterior', name: 'Taxa em agosto', value: formatRateWithVolume(point.qualificadosAnterior, point.leadsAnterior) },
      { dataKey: 'atual', name: 'Taxa em setembro', value: formatRateWithVolume(point.qualificadosAtual, point.leadsAtual) },
      { dataKey: 'pontos', name: 'Variação', value: `${signed(point.pontos, formatDecimal(Math.abs(point.pontos), 1))} p.p.` },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="tabular-nums">{formatInt(counts.revisar)}</span> de <span className="tabular-nums">{formatInt(points.length)}</span> origens
        cresceram em volume e perderam qualificação
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="x"
              domain={[-xMax, xMax]}
              height={X_AXIS_HEIGHT}
              name="Volume"
              tickFormatter={(value: number) => (value === 0 ? '0%' : signed(value, `${formatInt(Math.abs(value) * 100)}%`))}
              tickMargin={8}
              ticks={[-xMax, -xMax / 2, 0, xMax / 2, xMax]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="y"
              domain={[-yMax, yMax]}
              name="Qualificação"
              tickFormatter={(value: number) => (value === 0 ? '0 p.p.' : signed(value, `${formatInt(Math.abs(value))} p.p.`))}
              tickMargin={8}
              ticks={[-yMax, -yMax / 2, 0, yMax / 2, yMax]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {/* As áreas leem o domínio calculado acima, o mesmo dos eixos: com dataMax o filtro encolheria o fundo em silêncio (ifOverflow discard). */}
            {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
            <ReferenceArea fill="var(--text-muted)" fillOpacity={OTHER_TINT} ifOverflow="extendDomain" stroke="none" x1={-xMax} x2={0} y1={0} y2={yMax} />
            {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
            <ReferenceArea fill="var(--text-muted)" fillOpacity={OTHER_TINT} ifOverflow="extendDomain" stroke="none" x1={0} x2={xMax} y1={0} y2={yMax} />
            {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
            <ReferenceArea fill="var(--text-muted)" fillOpacity={OTHER_TINT} ifOverflow="extendDomain" stroke="none" x1={-xMax} x2={0} y1={-yMax} y2={0} />
            {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
            <ReferenceArea fill="var(--chart-1)" fillOpacity={ACTION_TINT} ifOverflow="extendDomain" stroke="none" x1={0} x2={xMax} y1={-yMax} y2={0} />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" strokeWidth={1.5} x={0} />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" strokeWidth={1.5} y={0} />
            <Scatter data={rest} fill="var(--text-muted)" isAnimationActive={animate} name="Fora da região de ação" shape="circle" />
            <Scatter data={focus} fill="var(--chart-1)" isAnimationActive={animate} name="Região de ação" shape="circle" />
            <Scatter data={borda} fill="var(--chart-1)" isAnimationActive={animate} name="Acima do teto" shape="triangle" />
            <PlaneLayer counts={counts} points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {`${formatInt(points.length)} de ${formatInt(data.length)} no plano; fora: ${formatInt(abaixoBase)} abaixo de ${formatInt(MIN_LEADS)} leads, ${formatInt(novas)} origem nova. Triângulo: acima do teto de ${tetoTexto}`}
      </p>
    </div>
  );
}
