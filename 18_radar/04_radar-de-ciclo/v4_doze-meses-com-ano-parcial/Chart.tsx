import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthLong, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { asOf as defaultAsOf, data as defaultData, type MonthMeetings } from './data';

/**
 * Radar de ciclo de 12 meses com o ano em curso: meses fechados em traço cheio, o parcial tracejado
 * e os futuros sem marca, para ler o ciclo sem inventar valor para o que ainda não existe.
 */
export interface MonthlyCycleRadarProps {
  readonly data?: readonly MonthMeetings[];
  /** Data até a qual o mês parcial está contado, no formato `YYYY-MM-DD`. */
  readonly asOf?: string;
  readonly height?: number;
  readonly className?: string;
}

const SERIES_COLOR = 'var(--chart-1)';
const GRID_COLOR = 'var(--line-subtle)';
const HALO_COLOR = 'var(--surface-raised)';
const MUTED_COLOR = 'var(--text-muted)';
/** O ciclo começa no topo e gira no sentido horário: 90 a -270 no Recharts. */
const START_ANGLE = 90;
const END_ANGLE = -270;
const OUTER_RADIUS = '70%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
/** Anéis da grade: de 3 a 5 níveis redondos, o centro é o zero (EIX-4). */
const MAX_LEVELS = 5;
const STEPS = [1, 2, 5, 10, 20, 25, 50, 100];
const SCALE_CLEAR = 6;
const HORIZONTAL_SIN = 0.5;
const VERTICAL_SIN = 0.9;
const LABEL_GAP = 10;
const LINE_HEIGHT = 14;
const SIDE_EPS = 0.3;
const DOT_RADIUS = 4;
const STROKE_WIDTH = 2.5;
/** Trecho do mês parcial tracejado (EIX-10) e raio de ausência pontilhado, para não ler igual. */
const PARTIAL_DASH = '4 4';
const ABSENT_DASH = '1 4';
const ABSENT_TEXT = 'a medir';
const PARTIAL_TEXT = 'parcial';

interface Point {
  readonly x: number;
  readonly y: number;
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

/** O mês de maior valor medido, ou null quando nenhum mês foi medido. */
function peakOf(rows: readonly MonthMeetings[]): { readonly row: MonthMeetings; readonly value: number } | null {
  let best: { readonly row: MonthMeetings; readonly value: number } | null = null;
  for (const row of rows) {
    if (row.value !== null && (best === null || row.value > best.value)) best = { row, value: row.value };
  }
  return best;
}

/** O vão do polígono sem tinta onde os números da escala cabem: o par de eixos de menor alcance e, no
 * empate, o de ângulo mais perto da diagonal, que evita o topo e a horizontal (GEO-15). */
interface ScaleSpot {
  readonly angle: number;
  readonly floor: number;
}

function scaleSpot(values: readonly (number | null)[]): ScaleSpot | null {
  const count = values.length;
  if (count < 3) return null;
  const halfStep = Math.PI / count;
  let best: ScaleSpot | null = null;
  let bestDiagonal = Number.POSITIVE_INFINITY;
  for (let i = 0; i < count; i += 1) {
    const current = values[i] ?? null;
    const next = values[(i + 1) % count] ?? null;
    // Distância do centro à aresta entre dois vértices, medida no meio do vão (bissetriz).
    // GEO-4/ROT-7: vão vizinho de mês ausente leva o raio pontilhado, então a escala não mora nele.
    if (current === null || next === null) continue;
    const reach = current + next <= 0 ? 0 : (2 * current * next * Math.cos(halfStep)) / (current + next);
    const angle = 90 - ((i + 0.5) * 360) / count;
    // GEO-15: vão perto da horizontal põe o último nível na linha do nome do mês vizinho (era o 80 ao lado de "set"); só entram vãos perto do topo ou da base.
    if (Math.abs(Math.sin((angle * Math.PI) / 180)) < VERTICAL_SIN) continue;
    const diagonal =Math.abs(Math.abs(Math.sin((angle * Math.PI) / 180)) - Math.SQRT1_2);
    if (best === null || reach < best.floor || (reach === best.floor && diagonal < bestDiagonal)) {
      best = { angle, floor: reach };
      bestDiagonal = diagonal;
    }
  }
  return best;
}

/** Direção do eixo `index` na tela: o primeiro no topo, sentido horário (startAngle 90 do Recharts). */
function axisDirection(index: number, count: number): { readonly dx: number; readonly dy: number } {
  const rad = ((START_ANGLE + (index * (END_ANGLE - START_ANGLE)) / count) * Math.PI) / 180;
  return { dx: Math.cos(rad), dy: -Math.sin(rad) };
}

/** Quantos meses há em cada situação, para a frase acessível e a nota. */
function countStatus(rows: readonly MonthMeetings[], status: MonthMeetings['status']): number {
  return rows.filter((row) => row.status === status).length;
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

interface StrokeShapeProps {
  readonly points?: readonly Point[];
}

interface TipProps {
  readonly active?: boolean;
  readonly payload?: readonly { readonly payload?: unknown }[];
}

function isMonthMeetings(value: unknown): value is MonthMeetings {
  return typeof value === 'object' && value !== null && 'status' in value && 'month' in value;
}

export default function MonthlyCycleRadar({ data = defaultData, asOf = defaultAsOf, height, className }: MonthlyCycleRadarProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: a pré-vendas não tem meses com agendas medidas no ano.</span>
      </div>
    );
  }

  const peak = peakOf(data);
  const scale = niceScale(peak?.value ?? null);

  if (peak === null || scale === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>{formatUnavailable()}: nenhum mês do ano tem agenda realizada medida.</span>
      </div>
    );
  }

  const spot = scaleSpot(data.map((row) => row.value));
  const closedCount = countStatus(data, 'closed');
  const partialCount = countStatus(data, 'partial');
  const absentCount = countStatus(data, 'absent');
  const partial = data.find((row) => row.status === 'partial');
  const year = data[0]?.month.slice(0, 4) ?? '';
  const partialText = partial?.value === null || partial === undefined ? '' : `${partial.name} soma ${formatInt(partial.value)} até ${formatDate(asOf)}`;

  const summary = `Gráfico de radar com as agendas realizadas por mês em ${year}, em ${formatInt(data.length)} meses com janeiro ao lado de dezembro no topo: ${formatInt(closedCount)} fechados, ${formatInt(partialCount)} parcial e ${formatInt(absentCount)} ausentes. O pico é ${peak.row.name}, com ${formatInt(peak.value)}${partialText ? `; ${partialText}` : ''}.`;
  const readingLine = `Agendas realizadas por mês: pico em ${peak.row.name}, com ${formatInt(peak.value)}.${partial ? ` ${partial.name.slice(0, 1).toUpperCase()}${partial.name.slice(1)} parcial até ${formatDate(asOf)}` : ''}${absentCount > 0 ? `, ${formatInt(absentCount)} meses a medir` : ''}.`;

  /* O rótulo do eixo é posicionado por conta própria: o Text do Recharts ancora o bloco pelo setor e
   * empurra o nome para dentro do polígono nos eixos do topo e da base. O mês sem dado leva "a medir"
   * em --text-muted e um raio pontilhado do centro à borda, para a ausência não ler como zero. */
  const renderAngleTick = (props: AngleTickProps): ReactElement => {
    const { cx = 0, cy = 0, radius = 0, payload } = props;
    const index = payload?.index ?? -1;
    const row = data[index];
    if (!row) return <g />;
    const { dx, dy } = axisDirection(index, data.length);
    const px = cx + (radius + LABEL_GAP) * dx;
    const py = cy + (radius + LABEL_GAP) * dy;
    const anchor = dx > SIDE_EPS ? 'start' : dx < -SIDE_EPS ? 'end' : 'middle';
    const blockHeight = 2 * LINE_HEIGHT;
    const firstY = dy < -SIDE_EPS ? py - blockHeight : dy > SIDE_EPS ? py : py - blockHeight / 2;
    const isAbsent = row.value === null;
    const valueText = row.value === null ? ABSENT_TEXT : row.status === 'partial' ? `${formatInt(row.value)} ${PARTIAL_TEXT}` : formatInt(row.value);
    return (
      <g>
        {isAbsent ? <line stroke={MUTED_COLOR} strokeDasharray={ABSENT_DASH} strokeLinecap="round" strokeWidth={1.5} x1={cx} x2={cx + radius * dx} y1={cy} y2={cy + radius * dy} /> : null}
        <text className="font-sans" dominantBaseline="central" fill={isAbsent ? MUTED_COLOR : 'var(--text-secondary)'} fontSize={11} fontWeight={500} textAnchor={anchor} x={px} y={firstY + 0.5 * LINE_HEIGHT}>
          {row.label}
        </text>
        <text
          className={isAbsent ? 'font-sans' : 'font-display'}
          dominantBaseline="central"
          fill={isAbsent ? MUTED_COLOR : 'var(--text-primary)'}
          fontSize={isAbsent ? 11 : 12}
          fontWeight={isAbsent ? 500 : 600}
          textAnchor={anchor}
          x={px}
          y={firstY + 1.5 * LINE_HEIGHT}
        >
          {valueText}
        </text>
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
      <text className="font-display" dominantBaseline="central" fill={MUTED_COLOR} fontSize={11} fontWeight={500} style={{ paintOrder: 'stroke', stroke: HALO_COLOR, strokeWidth: 4 }} textAnchor={onLeft ? 'end' : 'start'} x={onLeft ? x - 4 : x + 4} y={y}>
        {formatInt(level)}
      </text>
    );
  };

  /* Traço próprio: o polígono padrão do Radar fecha por todos os pontos, e o ponto nulo está no
   * centro (raio zero), o que desenharia uma ponta falsa até lá. Cada par de meses vizinhos medidos
   * vira um trecho, tracejado quando um dos dois é parcial, e a virada dezembro a janeiro só fecha
   * quando os dois existem. */
  const renderStroke = (props: StrokeShapeProps): ReactElement => {
    const { points } = props;
    if (!points) return <g />;
    return (
      <g>
        {data.map((row, i) => {
          const j = (i + 1) % data.length;
          const next = data[j];
          const from = points[i];
          const to = points[j];
          if (!next || !from || !to || row.value === null || next.value === null) return null;
          const dashed = row.status === 'partial' || next.status === 'partial';
          return <line key={row.id} stroke={SERIES_COLOR} strokeDasharray={dashed ? PARTIAL_DASH : undefined} strokeLinecap={dashed ? 'butt' : 'round'} strokeWidth={STROKE_WIDTH} x1={from.x} x2={to.x} y1={from.y} y2={to.y} />;
        })}
      </g>
    );
  };

  /* O mês sem valor chega ao dot com coordenada válida (o centro): sem este corte ele viraria um zero
   * desenhado. O parcial é vazado, e o fechado, cheio. O fillOpacity volta a 1 por herança do Radar. */
  const renderDot = (props: DotProps): ReactElement => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined || !isMonthMeetings(payload) || payload.value === null) return <g />;
    const isPartial = payload.status === 'partial';
    return <circle cx={cx} cy={cy} fill={isPartial ? HALO_COLOR : SERIES_COLOR} fillOpacity={1} r={DOT_RADIUS} stroke={isPartial ? SERIES_COLOR : HALO_COLOR} strokeWidth={isPartial ? 2 : 1.5} />;
  };

  /* A dica acrescenta o que o corpo não escreve: o mês por extenso com o ano e a situação dele. O
   * nulo se diz na própria dica, porque o Tooltip só o entrega com filterNull desligado (DIC-5). */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const row: unknown = payload?.[0]?.payload;
    if (!active || !isMonthMeetings(row)) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{formatMonthLong(row.month)}</p>
        {row.value === null ? (
          <p className="text-text-muted">{ABSENT_TEXT}: o mês ainda não existe no dado</p>
        ) : (
          <p className="text-text-secondary">
            Agendas realizadas <span className="kpi-number ml-2 text-text-primary">{formatInt(row.value)}</span>
            {row.status === 'partial' ? <span className="ml-2 text-text-muted">{`${PARTIAL_TEXT} até ${formatDate(asOf)}`}</span> : null}
          </p>
        )}
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        {readingLine}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart accessibilityLayer={false} data={[...data]} endAngle={END_ANGLE} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS} startAngle={START_ANGLE}>
            <PolarGrid gridType="circle" stroke={GRID_COLOR} />
            <PolarAngleAxis axisLine={false} dataKey="id" tick={renderAngleTick} tickLine={false} />
            <PolarRadiusAxis angle={spot?.angle ?? 0} axisLine={false} domain={[0, scale.max]} tick={renderScaleTick} tickLine={false} ticks={[...scale.levels]} />
            <Tooltip content={renderTooltip} cursor={false} filterNull={false} isAnimationActive={false} />
            <Radar activeDot={false} connectNulls={false} dataKey="value" dot={renderDot} fill="none" isAnimationActive={animate} shape={renderStroke} stroke={SERIES_COLOR} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
