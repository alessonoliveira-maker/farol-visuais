import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, ZIndexLayer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthLong, formatPercent, formatPercentFromScale100, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, month as defaultMonth, officeEnd as defaultOfficeEnd, officeStart as defaultOfficeStart, type SlaHour } from './data';

/**
 * Radar de ciclo da taxa de primeira resposta fora do SLA por hora do dia, com o setor do expediente
 * sob a grade, para ler se os estouros se concentram fora do expediente ou também acontecem dentro.
 */
export interface SlaCycleRadarProps {
  readonly data?: readonly SlaHour[];
  /** Mês do dado, no formato `YYYY-MM`. */
  readonly month?: string;
  /** Primeira hora do expediente, inclusive. */
  readonly officeStart?: number;
  /** Hora em que o expediente acaba, exclusive. */
  readonly officeEnd?: number;
  readonly height?: number;
  readonly className?: string;
}

const SERIES_COLOR = 'var(--chart-1)';
const GRID_COLOR = 'var(--line-subtle)';
const HALO_COLOR = 'var(--surface-raised)';
const TICK_COLOR = 'var(--line-strong)';
const OFFICE_COLOR = 'var(--surface-sunken)';
/** O ciclo começa no topo e gira no sentido horário: 90 a -270 no Recharts. */
const START_ANGLE = 90;
const END_ANGLE = -270;
const HOURS_PER_DAY = 24;
const OUTER_RADIUS = '82%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
/** Só os quartos do ciclo levam rótulo: 0h, 6h, 12h e 18h. */
const QUARTER_HOURS = 6;
/** Anéis da grade: de 3 a 5 níveis redondos, o centro é o zero (EIX-4). */
const MAX_LEVELS = 5;
const STEPS = [1, 2, 5, 10, 20, 25, 50, 100];
const SCALE_CLEAR = 4;
const HORIZONTAL_SIN = 0.5;
const MARK_QUARTER = 6;
const MARK_HOUR = 3;
const LABEL_GAP = 12;
const SIDE_EPS = 0.3;
const DOT_RADIUS = 4;
/* ACE-5: a área composta de --chart-1 precisa de 3:1 também sobre o setor do expediente
 * (--surface-sunken) no tema claro; sobre o cartão bastava 0,66, e sobre o setor 0,66 mede 2,76:1.
 * Com 0,72 a conta sobre os pixels dá cerca de 3,07:1 contra o setor. */
const FILL_OPACITY = 0.72;
const MUTED_COLOR = 'var(--text-muted)';
/** Raio de ausência pontilhado: a hora sem resposta não tem vértice, só este raio e a palavra. */
const ABSENT_DASH = '1 4';
const STROKE_WIDTH = 2;

interface Point {
  readonly x: number;
  readonly y: number;
}

interface ShapeProps {
  readonly points?: readonly Point[];
}
/** Ordem de camadas, de baixo para cima: setor em -200, área do Radar em 100, grade em 150. O polar não
 * tem ReferenceArea, então o setor é desenhado por nós e precisa ficar abaixo de todos. */
const OFFICE_Z_INDEX = -200;
const GRID_Z_INDEX = 150;

interface SlaRow extends SlaHour {
  /** Percentual de respostas fora do SLA na hora (escala de 0 a 100), ou null sem resposta na hora. */
  readonly rate: number | null;
}

interface Scale {
  readonly max: number;
  readonly levels: readonly number[];
}

/** O primeiro nível redondo acima do pico, com no máximo cinco anéis. Pico ausente devolve null. */
function niceScale(peak: number | null): Scale | null {
  if (peak === null || peak <= 0) return null;
  for (const step of STEPS) {
    const max = (Math.floor(peak / step) + 1) * step;
    const count = Math.round(max / step);
    if (count <= MAX_LEVELS) return { max, levels: Array.from({ length: count }, (_, i) => (i + 1) * step) };
  }
  return null;
}

function hourText(hour: number): string {
  return `${formatInt(hour)}h`;
}

/** A hora de maior taxa, ou null quando nenhuma hora teve resposta. */
function peakOf(rows: readonly SlaRow[]): SlaRow | null {
  let best: SlaRow | null = null;
  for (const row of rows) {
    if (row.rate !== null && (best === null || row.rate > (best.rate ?? 0))) best = row;
  }
  return best;
}

/** Parcela dos estouros que cai fora do expediente, ou null quando o mês não teve estouro. */
function outsideShare(rows: readonly SlaHour[], start: number, end: number): number | null {
  const all = rows.reduce((sum, row) => sum + row.breaches, 0);
  if (all <= 0) return null;
  const outside = rows.filter((row) => row.hour < start || row.hour >= end).reduce((sum, row) => sum + row.breaches, 0);
  return outside / all;
}

/** O vão do polígono onde ele chega menos longe: os números da escala vão nesse ângulo e só nos
 * níveis acima de `floor`, porque texto sobre a área não passa o piso de contraste (ROT-7b). */
interface ScaleSpot {
  readonly angle: number;
  readonly floor: number;
}

function scaleSpot(values: readonly (number | null)[]): ScaleSpot | null {
  const count = values.length;
  if (count < 3) return null;
  const halfStep = Math.PI / count;
  let best: ScaleSpot | null = null;
  for (let i = 0; i < count; i += 1) {
    const current = values[i] ?? null;
    const next = values[(i + 1) % count] ?? null;
    // Distância do centro à aresta entre dois vértices, medida no meio do vão (bissetriz).
    // GEO-4: vão vizinho de hora ausente leva o raio pontilhado, então a escala não mora nele.
    if (current === null || next === null) continue;
    const reach = current + next <= 0 ? 0 : (2 * current * next * Math.cos(halfStep)) / (current + next);
    if (best === null || reach < best.floor) best = { angle: 90 - ((i + 0.5) * 360) / count, floor: reach };
  }
  return best;
}

/** Direção da posição `index` de `count` na tela: a primeira no topo, sentido horário. */
function axisDirection(index: number, count: number): { readonly dx: number; readonly dy: number } {
  const rad = ((START_ANGLE + (index * (END_ANGLE - START_ANGLE)) / count) * Math.PI) / 180;
  return { dx: Math.cos(rad), dy: -Math.sin(rad) };
}

/** O setor do expediente como caminho: do centro à hora de abertura, arco no sentido horário até a
 * hora de fechamento e volta ao centro. Cobre menos de meio ciclo, então o arco nunca é o grande. */
function officeSectorPath(cx: number, cy: number, radius: number, start: number, end: number): string {
  const from = axisDirection(start, HOURS_PER_DAY);
  const to = axisDirection(end, HOURS_PER_DAY);
  const large = end - start > HOURS_PER_DAY / 2 ? 1 : 0;
  return `M${String(cx)},${String(cy)} L${String(cx + radius * from.dx)},${String(cy + radius * from.dy)} A${String(radius)},${String(radius)} 0 ${String(large)} 1 ${String(cx + radius * to.dx)},${String(cy + radius * to.dy)} Z`;
}

interface AngleTickProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly radius?: number;
  readonly payload?: { readonly index?: number };
}

interface ScaleTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly payload?: { readonly value?: number };
}

interface DotProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: unknown;
}

interface TipProps {
  readonly active?: boolean;
  readonly payload?: readonly { readonly payload?: unknown }[];
}

function isSlaRow(value: unknown): value is SlaRow {
  return typeof value === 'object' && value !== null && 'hour' in value && 'breaches' in value;
}

export default function SlaCycleRadar({ data = defaultData, month = defaultMonth, officeStart = defaultOfficeStart, officeEnd = defaultOfficeEnd, height, className }: SlaCycleRadarProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: a pré-vendas não tem primeiras respostas medidas no mês.</span>
      </div>
    );
  }

  const rows: readonly SlaRow[] = data.map((row) => ({ ...row, rate: row.total > 0 ? (row.breaches / row.total) * 100 : null }));
  const peak = peakOf(rows);
  const scale = niceScale(peak?.rate ?? null);

  if (peak === null || scale === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>Sem estouro medido: o mês não registrou resposta fora do SLA em nenhuma hora.</span>
      </div>
    );
  }

  const spot = scaleSpot(rows.map((row) => row.rate));
  const absentHours = rows.filter((row) => row.rate === null).map((row) => hourText(row.hour));
  const hasZero = rows.some((row) => row.rate === 0);
  const share = outsideShare(data, officeStart, officeEnd);
  const windowText = `${hourText(officeEnd)} e ${hourText(officeStart)}`;
  const shareText = share === null ? '' : `${formatPercent(share, 0)} dos estouros entre ${windowText}`;
  const officeText = `das ${hourText(officeStart)} às ${hourText(officeEnd)}`;

  const summary = `Gráfico de radar com o percentual de primeiras respostas fora do SLA por hora do dia em ${formatMonthLong(month)}, com o expediente ${officeText} marcado. ${shareText ? `${shareText}; ` : ''}a maior taxa é ${formatRateWithVolume(peak.breaches, peak.total)}, às ${hourText(peak.hour)}.${absentHours.length > 0 ? ` Sem resposta às ${absentHours.join(', ')}.` : ''}`;
  const readingLine = `Primeiras respostas fora do SLA por hora: ${shareText || 'nenhum estouro no mês'}.`;

  /* O rótulo do eixo é posicionado por conta própria: o Text do Recharts ancora o bloco pelo setor e
   * empurra o nome para dentro do polígono nos eixos do topo e da base. Toda hora ganha um tique na
   * borda do anel e só os quartos escrevem a hora. O tique da primeira hora também desenha o setor do
   * expediente, porque só o tique conhece o centro e o raio do desenho. */
  const renderAngleTick = (props: AngleTickProps): ReactElement => {
    const { cx = 0, cy = 0, radius = 0, payload } = props;
    const index = payload?.index ?? -1;
    const row = rows[index];
    if (!row) return <g />;
    const { dx, dy } = axisDirection(index, rows.length);
    const isQuarter = row.hour % QUARTER_HOURS === 0;
    const markEnd = radius + (isQuarter ? MARK_QUARTER : MARK_HOUR);
    const px = cx + (radius + LABEL_GAP) * dx;
    const py = cy + (radius + LABEL_GAP) * dy;
    const anchor = dx > SIDE_EPS ? 'start' : dx < -SIDE_EPS ? 'end' : 'middle';
    return (
      <g>
        {row.rate === null ? <line stroke={MUTED_COLOR} strokeDasharray={ABSENT_DASH} strokeLinecap="round" strokeWidth={1.5} x1={cx} x2={cx + radius * dx} y1={cy} y2={cy + radius * dy} /> : null}
        {index === 0 ? (
          /* O polar não tem ReferenceArea: o setor entra numa camada abaixo da grade e da área. */
          <ZIndexLayer zIndex={OFFICE_Z_INDEX}>
            <path d={officeSectorPath(cx, cy, radius, officeStart, officeEnd)} fill={OFFICE_COLOR} />
          </ZIndexLayer>
        ) : null}
        <line stroke={TICK_COLOR} strokeWidth={1} x1={cx + radius * dx} x2={cx + markEnd * dx} y1={cy + radius * dy} y2={cy + markEnd * dy} />
        {isQuarter ? (
          <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={600} textAnchor={anchor} x={px} y={py + dy * 7}>
            {hourText(row.hour)}
          </text>
        ) : null}
      </g>
    );
  };

  /* A escala nasce rotacionada pelo ângulo do eixo (transform no tick); o texto é horizontal por
   * contrato (TIP-5), então só x e y são usados e o transform é descartado. */
  const renderScaleTick = (props: ScaleTickProps): ReactElement => {
    const x = Number(props.x ?? 0);
    const y = Number(props.y ?? 0);
    const level = props.payload?.value ?? 0;
    if (spot === null || level < spot.floor + SCALE_CLEAR) return <g />;
    const onLeft = Math.cos((spot.angle * Math.PI) / 180) < 0;
    /* GEO-15: perto da horizontal os anéis ficam em linhas coladas, então só o nível de fora é escrito. */
    if (Math.abs(Math.sin((spot.angle * Math.PI) / 180)) < HORIZONTAL_SIN && level < scale.max) return <g />;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} fontWeight={500} style={{ paintOrder: 'stroke', stroke: HALO_COLOR, strokeWidth: 4 }} textAnchor={onLeft ? 'end' : 'start'} x={onLeft ? x - 4 : x + 4} y={y}>
        {formatPercentFromScale100(level, 0)}
      </text>
    );
  };

  /* Forma própria da série: o polígono padrão do Radar põe o ponto nulo no centro (raio zero), igual a
   * um zero medido. Aqui cada trecho de horas medidas seguidas vira uma fatia presa ao centro, e o
   * contorno só liga duas horas vizinhas medidas: a hora sem resposta não tem vértice nem aresta. */
  const renderShape = (props: ShapeProps): ReactElement => {
    const { points } = props;
    if (!points || points.length !== rows.length) return <g />;
    const count = rows.length;
    const start = rows.findIndex((row) => row.rate === null);
    const segments: string[] = [];
    if (start < 0) {
      segments.push(`M${points.map((p) => `${String(p.x)},${String(p.y)}`).join(' L')} Z`);
    } else {
      const center = points[start];
      let run: Point[] = [];
      for (let step = 1; step <= count; step += 1) {
        const i = (start + step) % count;
        const p = points[i];
        if (!p) continue;
        if (rows[i]?.rate === null) {
          if (run.length > 0 && center) segments.push(`M${String(center.x)},${String(center.y)} L${run.map((q) => `${String(q.x)},${String(q.y)}`).join(' L')} Z`);
          run = [];
        } else run.push(p);
      }
    }
    return (
      <g>
        <path d={segments.join(' ')} fill={SERIES_COLOR} fillOpacity={FILL_OPACITY} stroke="none" />
        {rows.map((row, i) => {
          const j = (i + 1) % count;
          const next = rows[j];
          const from = points[i];
          const to = points[j];
          if (!next || !from || !to || row.rate === null || next.rate === null) return null;
          return <line key={row.id} stroke={SERIES_COLOR} strokeLinecap="round" strokeWidth={STROKE_WIDTH} x1={from.x} x2={to.x} y1={from.y} y2={to.y} />;
        })}
      </g>
    );
  };

  /* Dez horas do expediente ficam juntas perto do centro, e um ponto em cada uma viraria um monte.
   * Só duas marcas levam ponto: a hora de maior taxa, cheia, e a hora de zero medido, vazada no
   * centro. A hora sem resposta não leva ponto (o dot recebe o centro dela): leva o raio pontilhado.
   * O fillOpacity do ponto volta a 1, porque herdaria o da área. */
  const renderDot = (props: DotProps): ReactElement => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined || !isSlaRow(payload) || payload.rate === null) return <g />;
    if (payload.id === peak.id) return <circle cx={cx} cy={cy} fill={SERIES_COLOR} fillOpacity={1} r={DOT_RADIUS} stroke={HALO_COLOR} strokeWidth={1.5} />;
    if (payload.rate === 0) return <circle cx={cx} cy={cy} fill={HALO_COLOR} fillOpacity={1} r={DOT_RADIUS} stroke={SERIES_COLOR} strokeWidth={2} />;
    return <g />;
  };

  /* A dica acrescenta o que o corpo não escreve: a taxa da hora com o volume, porque hora de pouca
   * resposta oscila muito, e se a hora está dentro ou fora do expediente. */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const row: unknown = payload?.[0]?.payload;
    if (!active || !isSlaRow(row)) return null;
    const inside = row.hour >= officeStart && row.hour < officeEnd;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{`${hourText(row.hour)}, ${inside ? 'dentro' : 'fora'} do expediente`}</p>
        <p className="text-text-secondary">
          Fora do SLA <span className="kpi-number ml-2 text-text-primary">{row.total > 0 ? formatRateWithVolume(row.breaches, row.total) : `${formatUnavailable()}, sem resposta na hora`}</span>
        </p>
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        {readingLine}
      </p>
      <ul aria-hidden className="m-0 flex shrink-0 list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-[11px] font-medium text-text-secondary">
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height="10" width="20">
            <rect fill={OFFICE_COLOR} height="10" stroke={TICK_COLOR} strokeWidth="1" width="20" x="0" y="0" />
          </svg>
          <span>{`Setor do expediente, ${officeText}`}</span>
        </li>
        {absentHours.length > 0 ? (
          <li className="flex items-center gap-2">
            <svg className="shrink-0" height="10" width="20">
              <line stroke={MUTED_COLOR} strokeDasharray={ABSENT_DASH} strokeLinecap="round" strokeWidth="1.5" x1="1" x2="19" y1="5" y2="5" />
            </svg>
            <span>Sem resposta na hora</span>
          </li>
        ) : null}
        {hasZero ? (
          <li className="flex items-center gap-2">
            <svg className="shrink-0" height="10" width="10">
              <circle cx="5" cy="5" fill={HALO_COLOR} r="3.5" stroke={SERIES_COLOR} strokeWidth="2" />
            </svg>
            <span>Zero medido</span>
          </li>
        ) : null}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart accessibilityLayer={false} data={[...rows]} endAngle={END_ANGLE} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS} startAngle={START_ANGLE}>
            <PolarGrid gridType="circle" radialLines={false} stroke={GRID_COLOR} zIndex={GRID_Z_INDEX} />
            <PolarAngleAxis axisLine={false} dataKey="id" tick={renderAngleTick} tickLine={false} />
            <PolarRadiusAxis angle={spot?.angle ?? 0} axisLine={false} domain={[0, scale.max]} tick={renderScaleTick} tickLine={false} ticks={[...scale.levels]} />
            <Tooltip content={renderTooltip} cursor={false} filterNull={false} isAnimationActive={false} />
            <Radar activeDot={false} connectNulls={false} dataKey="rate" dot={renderDot} fill={SERIES_COLOR} fillOpacity={FILL_OPACITY} isAnimationActive={animate} shape={renderShape} stroke={SERIES_COLOR} strokeWidth={STROKE_WIDTH} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
