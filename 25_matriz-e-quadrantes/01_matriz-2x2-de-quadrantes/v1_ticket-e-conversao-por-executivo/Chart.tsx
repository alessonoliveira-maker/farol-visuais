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
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveQuarter } from './data';

/**
 * Matriz 2x2 de executivos pelo ticket médio e pela conversão do trimestre, cortada nas medianas
 * do próprio time: mostra em que região cada um caiu e que ação a região pede.
 */
export interface ExecutiveQuadrantsProps {
  readonly data?: readonly ExecutiveQuarter[];
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly name: string;
  readonly ticket: number;
  readonly conversao: number;
  readonly ganhas: number;
  readonly oportunidades: number;
}

type Region = 'acao' | 'ticket' | 'conversao' | 'atencao';

/** Topo com o título do eixo Y e o rótulo do corte; direita com o rótulo do corte horizontal. */
const MARGIN = { top: 36, right: 88, bottom: 20, left: 8 } as const;
/** Domínio fixo amarrado a constantes: a ReferenceArea e o desconflito leem estes mesmos números. */
const DOMAIN_X: readonly [number, number] = [20_000, 100_000];
const TICKS_X = [20_000, 40_000, 60_000, 80_000, 100_000] as const;
const DOMAIN_Y: readonly [number, number] = [0, 0.4];
const TICKS_Y = [0, 0.1, 0.2, 0.3, 0.4] as const;
const Y_AXIS_WIDTH = 48;
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
  acao: 'Replicar o que fazem',
  ticket: 'Subir o ticket',
  conversao: 'Rever a qualificação',
  atencao: 'Acompanhar de perto',
};

/** Mediana; lista vazia devolve null e nunca zero (EST-1b). */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const upper = sorted[mid];
  const lower = sorted[mid - 1];
  if (upper === undefined) return null;
  return sorted.length % 2 === 1 || lower === undefined ? upper : (lower + upper) / 2;
}

function regionOf(point: Point, cutX: number, cutY: number): Region {
  if (point.ticket > cutX) return point.conversao > cutY ? 'acao' : 'conversao';
  return point.conversao > cutY ? 'ticket' : 'atencao';
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
 * o lado direito do ponto e depois o esquerdo, sem tocar outro ponto, outro rótulo nem a linha de corte;
 * só quando os dois lados batem é que ele desce até a primeira altura livre, do ponto mais alto para o
 * mais baixo, e ainda assim junto do próprio ponto.
 */
function placeLabels(
  items: readonly { readonly id: string; readonly text: string; readonly px: number; readonly py: number; readonly focus: boolean }[],
  bounds: { readonly left: number; readonly right: number },
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
  for (const item of [...items].sort((a, b) => a.py - b.py)) {
    const width = item.text.length * LABEL_CHAR_WIDTH;
    const lefts = [item.px + POINT_GAP, item.px - POINT_GAP - width];
    const blockers: readonly Rect[] = [...fixed, ...marks.filter((mark) => mark.id !== item.id), ...placed];
    const top = item.py - LABEL_HEIGHT / 2;
    let chosen: LabelBox | null = null;
    for (const left of lefts) {
      const rect = { left, top, width, height: LABEL_HEIGHT };
      if (left >= bounds.left && left + width <= bounds.right && !blockers.some((blocker) => overlaps(rect, blocker))) {
        chosen = { ...rect, id: item.id, text: item.text, focus: item.focus };
        break;
      }
    }
    if (chosen === null) {
      const left = item.px + POINT_GAP + width <= bounds.right ? lefts[0] ?? item.px : lefts[1] ?? item.px;
      let shifted = top;
      while (placed.some((box) => overlaps({ left, top: shifted, width, height: LABEL_HEIGHT }, box))) shifted += LABEL_HEIGHT;
      chosen = { left, top: shifted, width, height: LABEL_HEIGHT, id: item.id, text: item.text, focus: item.focus };
    }
    placed.push(chosen);
  }
  return placed;
}

interface PlaneLayerProps {
  readonly points: readonly Point[];
  readonly cutX: number;
  readonly cutY: number;
  readonly counts: Record<Region, number>;
  readonly regions: ReadonlyMap<string, Region>;
}

/**
 * Tudo o que é texto no plano, numa camada só dentro do ScatterChart (depende de usePlotArea e das
 * escalas): títulos de região nos cantos externos, rótulos diretos, nomes dos cortes e dos eixos.
 * O `label` nativo da ReferenceLine nasce dentro da área, onde a nuvem se acumula (REC-4).
 */
function PlaneLayer({ points, cutX, cutY, counts, regions }: PlaneLayerProps) {
  const area = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!area || !xScale || !yScale) return null;
  const cx = xScale(cutX);
  const cy = yScale(cutY);
  if (cx === undefined || cy === undefined) return null;

  const right = area.x + area.width;
  const bottom = area.y + area.height;
  const labels = placeLabels(
    points.flatMap((point) => {
      const px = xScale(point.ticket);
      const py = yScale(point.conversao);
      if (px === undefined || py === undefined) return [];
      return [{ id: point.id, text: point.name, px, py, focus: regions.get(point.id) === 'acao' }];
    }),
    { left: area.x, right: right - 2 },
    [{ left: cx - 1, top: area.y, width: 2, height: area.height }],
  );
  const corners: readonly { readonly region: Region; readonly x: number; readonly y: number; readonly anchor: 'start' | 'end' }[] = [
    { region: 'ticket', x: area.x + 8, y: area.y + 16, anchor: 'start' },
    { region: 'acao', x: right - 8, y: area.y + 16, anchor: 'end' },
    { region: 'atencao', x: area.x + 8, y: bottom - 20, anchor: 'start' },
    { region: 'conversao', x: right - 8, y: bottom - 20, anchor: 'end' },
  ];

  return (
    <g>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={MARGIN.left} y={12}>
        Conversão: ganhas sobre oportunidades
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="end" x={right} y={bottom + X_AXIS_HEIGHT + 14}>
        Ticket médio das vendas ganhas
      </text>
      <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} textAnchor="middle" x={cx} y={area.y - 8}>
        {`mediana do time ${formatCurrencyCompact(cutX)} · MEDIDO`}
      </text>
      <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} x={right + 6} y={cy - 2}>
        {`mediana ${formatPercent(cutY)}`}
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={right + 6} y={cy + 12}>
        MEDIDO
      </text>
      {corners.map((corner) => (
        <g key={corner.region}>
          <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={600} style={HALO} textAnchor={corner.anchor} x={corner.x} y={corner.y}>
            {REGION_TITLE[corner.region]}
          </text>
          <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} style={HALO} textAnchor={corner.anchor} x={corner.x} y={corner.y + 15}>
            {`${formatInt(counts[corner.region])} ${counts[corner.region] === 1 ? 'executivo' : 'executivos'}`}
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

export default function ExecutiveQuadrants({ data = defaultData, height, className }: ExecutiveQuadrantsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const points: Point[] = [];
  let semTicket = 0;
  let semConversao = 0;
  for (const row of data) {
    if (row.ticketReais === null) {
      semTicket += 1;
    } else if (row.oportunidades <= 0) {
      semConversao += 1;
    } else {
      points.push({
        id: row.id,
        name: row.name,
        ticket: row.ticketReais,
        conversao: row.ganhas / row.oportunidades,
        ganhas: row.ganhas,
        oportunidades: row.oportunidades,
      });
    }
  }
  const cutX = median(points.map((point) => point.ticket));
  const cutY = median(points.map((point) => point.conversao));

  if (cutX === null || cutY === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte tem ticket e conversão medidos, então não há corte para classificar.</span>
      </div>
    );
  }

  const regions = new Map<string, Region>(points.map((point) => [point.id, regionOf(point, cutX, cutY)]));
  const counts: Record<Region, number> = { acao: 0, ticket: 0, conversao: 0, atencao: 0 };
  for (const region of regions.values()) counts[region] += 1;
  const focus = points.filter((point) => regions.get(point.id) === 'acao');
  const rest = points.filter((point) => regions.get(point.id) !== 'acao');
  const fora = data.length - points.length;

  const summary =
    `Gráfico de dispersão com ticket médio e conversão de ${formatInt(points.length)} executivos, cortado nas medianas do time, ` +
    `${formatCurrencyCompact(cutX)} e ${formatPercent(cutY)}. ${formatInt(counts.acao)} ficam acima dos dois cortes e ` +
    `${formatInt(counts.atencao)} abaixo dos dois. ${formatInt(fora)} ficam fora por dado ausente.`;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'ticket', name: 'Ticket médio', value: formatCurrencyCompact(point.ticket) },
      { dataKey: 'conversao', name: 'Conversão', value: formatRateWithVolume(point.ganhas, point.oportunidades) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  const [x0, x1] = DOMAIN_X;
  const [y0, y1] = DOMAIN_Y;
  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="tabular-nums">{formatInt(counts.acao)}</span> de <span className="tabular-nums">{formatInt(points.length)}</span> executivos
        ficam acima da mediana nos dois eixos
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="ticket"
              domain={[...DOMAIN_X]}
              height={X_AXIS_HEIGHT}
              name="Ticket médio"
              tickFormatter={formatCurrencyAxis}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="conversao"
              domain={[...DOMAIN_Y]}
              name="Conversão"
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {/* As áreas leem as constantes do domínio: com dataMax o filtro encolheria o fundo em silêncio (ifOverflow discard). */}
            {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
            <ReferenceArea fill="var(--text-muted)" fillOpacity={OTHER_TINT} ifOverflow="extendDomain" stroke="none" x1={x0} x2={cutX} y1={y0} y2={cutY} />
            {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
            <ReferenceArea fill="var(--text-muted)" fillOpacity={OTHER_TINT} ifOverflow="extendDomain" stroke="none" x1={x0} x2={cutX} y1={cutY} y2={y1} />
            {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
            <ReferenceArea fill="var(--text-muted)" fillOpacity={OTHER_TINT} ifOverflow="extendDomain" stroke="none" x1={cutX} x2={x1} y1={y0} y2={cutY} />
            {/* check-ok: OPACIDADE-MARCA fundo de região, não marca de dado: a região também é nomeada em texto e os cortes são linhas opacas */}
            <ReferenceArea fill="var(--chart-1)" fillOpacity={ACTION_TINT} ifOverflow="extendDomain" stroke="none" x1={cutX} x2={x1} y1={cutY} y2={y1} />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" strokeWidth={1.5} x={cutX} />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" strokeWidth={1.5} y={cutY} />
            <Scatter data={rest} fill="var(--text-muted)" isAnimationActive={animate} name="Fora da região de ação" shape="circle" />
            <Scatter data={focus} fill="var(--chart-1)" isAnimationActive={animate} name="Região de ação" shape="circle" />
            <PlaneLayer counts={counts} cutX={cutX} cutY={cutY} points={points} regions={regions} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {fora === 0
          ? `${formatInt(points.length)} de ${formatInt(data.length)} executivos no plano`
          : `${formatInt(points.length)} de ${formatInt(data.length)} no plano; fora: ${formatInt(semTicket)} sem venda fechada, ${formatInt(semConversao)} sem oportunidade trabalhada`}
      </p>
    </div>
  );
}
