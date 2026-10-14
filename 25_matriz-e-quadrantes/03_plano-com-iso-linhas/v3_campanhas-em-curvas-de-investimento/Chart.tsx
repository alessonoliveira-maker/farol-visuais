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
import { formatCurrency, formatCurrencyAxis, formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  bandInvestment as defaultBandInvestment,
  bandTolerance as defaultBandTolerance,
  data as defaultData,
  type CampaignQuarter,
} from './data';

/**
 * Plano de leads contra custo por lead com curvas de mesmo investimento: como o investimento é o
 * produto dos dois eixos, campanhas na mesma curva custaram o mesmo, e o plano mostra quanto volume
 * de lead cada uma entregou por esse mesmo dinheiro.
 */
export interface CampaignIsoInvestmentProps {
  readonly data?: readonly CampaignQuarter[];
  /** Investimento da curva que recebe a faixa de tolerância, em reais. */
  readonly bandInvestment?: number;
  /** Tolerância da faixa, em fração do investimento da curva. */
  readonly bandTolerance?: number;
  readonly height?: number;
  readonly className?: string;
}

interface PlanePoint {
  readonly id: string;
  readonly name: string;
  readonly leads: number;
  readonly investimento: number;
  readonly cpl: number;
  readonly inBand: boolean;
}

interface CurvePoint {
  readonly x: number;
  readonly y: number;
}

type Scale = (value: number) => number | undefined;

/** Topo com o nome do eixo Y; direita com o investimento na ponta de cada curva. */
const MARGIN = { top: 24, right: 84, bottom: 20, left: 8 } as const;
/** Domínio fixo amarrado a constantes: as curvas e a faixa são recortadas contra estes mesmos números. */
const DOMAIN_X: readonly [number, number] = [0, 1000];
const TICKS_X = [0, 250, 500, 750, 1000] as const;
const DOMAIN_Y: readonly [number, number] = [0, 120];
const TICKS_Y = [0, 30, 60, 90, 120] as const;
/** O tique `R$ 120` mede perto de 38 px e o Recharts ainda soma 14 de tickSize e tickMargin: com menos ele quebra em duas linhas (REC-2). */
const Y_AXIS_WIDTH = 60;
const X_AXIS_HEIGHT = 24;
/** Investimento de cada curva, em reais. */
const ISO_INVESTMENTS = [5_000, 20_000, 50_000] as const;
/** Trechos de cada curva, em passo geométrico no X: adensam onde a curva despenca, junto do eixo Y. */
const CURVE_STEPS = 48;
const BAND_TINT = 0.18;
const POINT_RADIUS = 4;
const Z_RANGE: readonly [number, number] = [Math.PI * POINT_RADIUS * POINT_RADIUS, Math.PI * POINT_RADIUS * POINT_RADIUS];
const ROW_TITLE = 12;
const TEXT_SIZE = 11;
const LABEL_HEIGHT = 12;
const LABEL_CHAR_WIDTH = 6.2;
const POINT_GAP = 8;
const CORNER_GAP = 4;
/** Acima das curvas e abaixo dos pontos (600): o halo corta curva, nunca ponto. */
const LABEL_Z = 450;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

/** Menor e maior valor; lista vazia devolve null e nunca zero (EST-1b). */
function extent(values: readonly number[]): readonly [number, number] | null {
  if (values.length === 0) return null;
  return [Math.min(...values), Math.max(...values)];
}

/**
 * Hipérbole custo por lead = investimento ÷ leads, recortada ao domínio do plano e amostrada em
 * TypeScript com passo geométrico no X. Começa onde a curva cruza o topo do domínio e termina na
 * borda da direita, então nenhum trecho passa da moldura.
 */
function sampleHyperbola(investment: number): readonly CurvePoint[] {
  const [xMin, xMax] = DOMAIN_X;
  const [yMin, yMax] = DOMAIN_Y;
  const start = Math.max(xMin, investment / yMax);
  const end = yMin > 0 ? Math.min(xMax, investment / yMin) : xMax;
  if (!(start > 0) || start >= end) return [];
  const step = (end / start) ** (1 / CURVE_STEPS);
  return Array.from({ length: CURVE_STEPS + 1 }, (_, index) => {
    const x = index === CURVE_STEPS ? end : start * step ** index;
    return { x, y: Math.min(yMax, investment / x) };
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

/** Dentro da tolerância em torno de um investimento: é o que o plano chama de custar o mesmo. */
function isNear(investimento: number, target: number, tolerance: number): boolean {
  return Math.abs(investimento - target) <= tolerance * target;
}

/** Ponto oco: campanha dentro da faixa. Forma própria porque a cor sozinha não distingue (ACE-2). */
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
  /** Lado do ponto em que o nome fica: a oeste o texto é ancorado pelo fim, para a tinta terminar junto do ponto. */
  readonly anchor: 'start' | 'end';
}

/** Distância do centro de um ponto até a caixa; zero se estiver dentro. */
function distanceToRect(rect: Rect, cx: number, cy: number): number {
  const dx = Math.max(rect.left - cx, 0, cx - (rect.left + rect.width));
  const dy = Math.max(rect.top - cy, 0, cy - (rect.top + rect.height));
  return Math.hypot(dx, dy);
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
 * o nome fica acima à direita, porque rótulo que some deixa campanha sem nome.
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
    const candidates: readonly (Rect & { readonly anchor: 'start' | 'end' })[] = [
      { left: east, top: above, anchor: 'start', ...size },
      { left: item.px + POINT_GAP, top: middle, anchor: 'start', ...size },
      { left: west, top: below, anchor: 'end', ...size },
      { left: item.px - POINT_GAP - width, top: middle, anchor: 'end', ...size },
      { left: west, top: above, anchor: 'end', ...size },
      { left: east, top: below, anchor: 'start', ...size },
    ];
    const others = marks.filter((mark) => mark.id !== item.id);
    const blockers: readonly Rect[] = [...others, ...placed];
    /* O nome só vale onde o ponto próprio é o mais perto: com 42 de 48 pontos sem nome, ponto alheio mais perto leria o nome no ponto errado (DIC-1). */
    const ownIsNearest = (rect: Rect): boolean => {
      const ownDistance = distanceToRect(rect, item.px, item.py);
      return others.every((mark) => distanceToRect(rect, mark.left + mark.width / 2, mark.top + mark.height / 2) >= ownDistance);
    };
    const free = candidates.filter((rect) => inside(rect, bounds) && !blockers.some((blocker) => overlaps(rect, blocker)));
    const chosen = free.find(ownIsNearest) ?? free[0] ?? candidates[0];
    if (chosen) placed.push({ ...chosen, id: item.id, text: item.text });
  }
  return placed;
}

interface CurveLayerProps {
  readonly bandInvestment: number;
  readonly bandTolerance: number;
}

/**
 * As curvas e a faixa, numa camada dentro do ScatterChart: filho sem zIndex é pintado depois da grade
 * e antes dos pontos. A faixa é o espaço entre duas hipérboles, a de investimento menos a tolerância
 * e a de investimento mais a tolerância, e fecha pelas bordas do plano, sem diagonal (GEO-9).
 */
function CurveLayer({ bandInvestment, bandTolerance }: CurveLayerProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!xScale || !yScale) return null;
  const upper = sampleHyperbola(bandInvestment * (1 + bandTolerance));
  const lower = sampleHyperbola(bandInvestment * (1 - bandTolerance));
  const band = upper.length > 0 && lower.length > 0 ? `${toPath([...upper, ...[...lower].reverse()], xScale, yScale)} Z` : '';
  return (
    <g>
      {/* check-ok: OPACIDADE-MARCA faixa de tolerância, não marca de dado: é nomeada na legenda e a curva do meio dela é opaca, com o valor na ponta */}
      <path d={band} fill="var(--text-muted)" fillOpacity={BAND_TINT} stroke="none" />
      {ISO_INVESTMENTS.map((investment) => (
        <path
          d={toPath(sampleHyperbola(investment), xScale, yScale)}
          fill="none"
          key={investment}
          stroke={investment === bandInvestment ? 'var(--text-muted)' : 'var(--line-strong)'}
          strokeWidth={investment === bandInvestment ? 1.5 : 1}
        />
      ))}
    </g>
  );
}

interface LabelLayerProps {
  readonly points: readonly PlanePoint[];
  readonly labeledIds: ReadonlySet<string>;
}

/**
 * Todo o texto do plano: nomes dos eixos, o investimento na ponta de cada curva, na margem da
 * direita, e o nome das campanhas dos dois extremos de cada curva, a de menos e a de mais leads.
 */
function LabelLayer({ points, labeledIds }: LabelLayerProps) {
  const area = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!area || !xScale || !yScale) return null;
  const right = area.x + area.width;
  const bottom = area.y + area.height;
  const positions = points.flatMap((point) => {
    const px = xScale(point.leads);
    const py = yScale(point.cpl);
    return px === undefined || py === undefined ? [] : [{ point, px, py }];
  });
  const labels = placeLabels(
    positions.filter((position) => labeledIds.has(position.point.id)).map((position) => ({ id: position.point.id, text: position.point.name, px: position.px, py: position.py })),
    positions.map((position) => ({
      id: position.point.id,
      left: position.px - POINT_RADIUS - 1,
      top: position.py - POINT_RADIUS - 1,
      width: 2 * POINT_RADIUS + 2,
      height: 2 * POINT_RADIUS + 2,
    })),
    { left: area.x, top: area.y, width: area.width - 2, height: area.height },
  );
  const curveEnds = ISO_INVESTMENTS.flatMap((investment) => {
    const y = yScale(investment / DOMAIN_X[1]);
    return y === undefined ? [] : [{ investment, y }];
  });
  /* A palavra que nomeia os valores fica logo acima da ponta mais alta; sem curva no plano, não há o que nomear. */
  const highestEnd = curveEnds.reduce<number | null>((top, end) => (top === null ? end.y : Math.min(top, end.y)), null);

  return (
    <g>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={MARGIN.left} y={ROW_TITLE}>
        Custo por lead: investimento dividido por leads
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} textAnchor="end" x={right} y={bottom + X_AXIS_HEIGHT + 14}>
        Leads gerados
      </text>
      {highestEnd === null ? null : (
        <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={right + 6} y={highestEnd - 10}>
          investimento
        </text>
      )}
      {curveEnds.map((end) => (
        <text className="font-display" fill="var(--text-secondary)" fontSize={TEXT_SIZE} fontWeight={600} key={end.investment} x={right + 6} y={end.y + 4}>
          {formatCurrencyAxis(end.investment)}
        </text>
      ))}
      <ZIndexLayer zIndex={LABEL_Z}>
        {labels.map((box) => (
          <text className="font-display" fill="var(--text-primary)" fontSize={TEXT_SIZE} fontWeight={600} key={box.id} style={HALO} textAnchor={box.anchor} x={box.anchor === 'end' ? box.left + box.width : box.left} y={box.top + LABEL_HEIGHT - 2}>
            {box.text}
          </text>
        ))}
      </ZIndexLayer>
    </g>
  );
}

export default function CampaignIsoInvestment({
  data = defaultData,
  bandInvestment = defaultBandInvestment,
  bandTolerance = defaultBandTolerance,
  height,
  className,
}: CampaignIsoInvestmentProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  /* Sem lead o custo por lead não existe: a campanha sai do plano e vai contada no rodapé, nunca em zero (DAD-2). */
  const points: readonly PlanePoint[] = data
    .filter((row) => row.leads > 0)
    .map((row) => ({
      id: row.id,
      name: row.name,
      leads: row.leads,
      investimento: row.investimentoReais,
      cpl: row.investimentoReais / row.leads,
      inBand: isNear(row.investimentoReais, bandInvestment, bandTolerance),
    }));
  const semLead = data.filter((row) => row.leads <= 0);

  if (points.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte gerou lead, então não há custo por lead para pôr no plano.</span>
      </div>
    );
  }

  const banded = points.filter((point) => point.inBand);
  const others = points.filter((point) => !point.inBand);
  const bandLeads = extent(banded.map((point) => point.leads));
  /* Rótulo só nos dois extremos de cada curva: a campanha de menos leads e a de mais leads entre as que custaram aquilo. */
  const labeledIds = new Set<string>();
  for (const investment of ISO_INVESTMENTS) {
    const near = points.filter((point) => isNear(point.investimento, investment, bandTolerance)).sort((a, b) => a.leads - b.leads);
    const fewest = near[0];
    const most = near[near.length - 1];
    if (fewest && most && fewest.id !== most.id) {
      labeledIds.add(fewest.id);
      labeledIds.add(most.id);
    }
  }

  const target = formatCurrencyAxis(bandInvestment);
  const tolerance = formatPercent(bandTolerance, 0);
  const reading =
    bandLeads === null
      ? `Nenhuma das ${formatInt(points.length)} campanhas custou perto de ${target} neste recorte`
      : `${formatInt(banded.length)} das ${formatInt(points.length)} campanhas custam perto de ${target} e entregam de ${formatInt(bandLeads[0])} a ${formatInt(bandLeads[1])} leads`;
  const summary =
    `Gráfico de dispersão com leads e custo por lead de ${formatInt(points.length)} campanhas, sobre curvas de mesmo investimento. ${reading}. ` +
    `${formatInt(semLead.length)} campanhas sem lead ficam fora do plano.`;
  const footer =
    `${formatInt(points.length)} de ${formatInt(data.length)} campanhas no plano` +
    (semLead.length > 0
      ? `; ${formatInt(semLead.length)} sem lead ficam fora, porque sem lead não existe custo por lead (${formatCurrencyCompact(semLead.reduce((sum, row) => sum + row.investimentoReais, 0))} investidos nelas).`
      : '.');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as PlanePoint | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'leads', name: 'Leads', value: formatInt(point.leads) },
      { dataKey: 'cpl', name: 'Custo por lead', value: formatCurrency(point.cpl) },
      { dataKey: 'investimento', name: 'Investimento', value: formatCurrencyCompact(point.investimento) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs tabular-nums text-text-secondary">
        {reading}
      </p>
      {/* Legenda (ROT-4): o que é cada ponto, com amostra na forma da marca, e a unidade de cada eixo. */}
      <div aria-hidden className="mb-2 mt-1 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] tabular-nums text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
          campanha
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full border-[1.5px]" style={{ borderColor: 'var(--text-muted)' }} />
          {`campanha na faixa de ${tolerance} em torno de ${target}`}
        </span>
        <span>horizontal: leads gerados, em contagem</span>
        <span>vertical: custo por lead, em reais</span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            {/* Nos dois eixos: axisLine depois do spread do AXIS_PROPS, que vem ligado (REC-30), e interval 0 para o eixo não descartar tique e levar a grade junto (REC-29). */}
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="leads"
              domain={[...DOMAIN_X]}
              height={X_AXIS_HEIGHT}
              interval={0}
              name="Leads"
              tickFormatter={(value: number) => formatInt(value)}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="cpl"
              domain={[...DOMAIN_Y]}
              interval={0}
              name="Custo por lead"
              tickFormatter={formatCurrencyAxis}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <ZAxis range={[...Z_RANGE]} type="number" />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <CurveLayer bandInvestment={bandInvestment} bandTolerance={bandTolerance} />
            <Scatter data={others} fill="var(--text-muted)" isAnimationActive={animate} name="Campanhas" shape="circle" stroke="var(--surface-raised)" strokeWidth={1} />
            <Scatter data={banded} isAnimationActive={animate} name="Campanhas na faixa" shape={renderHollow} />
            <LabelLayer labeledIds={labeledIds} points={points} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] tabular-nums text-text-muted">
        {footer}
      </p>
    </div>
  );
}
