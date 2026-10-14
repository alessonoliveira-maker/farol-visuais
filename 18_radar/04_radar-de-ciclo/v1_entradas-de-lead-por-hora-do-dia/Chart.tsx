import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatMonthLong, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, daysInMonth as defaultDays, month as defaultMonth, type HourEntry } from './data';

/**
 * Radar de ciclo de 24 eixos: a média de entradas de lead por hora do dia, com 0h no topo e sentido
 * horário, para ler em que horas a demanda chega e quanto dela cai fora do expediente.
 */
export interface HourlyCycleRadarProps {
  readonly data?: readonly HourEntry[];
  /** Mês do dado, no formato `YYYY-MM`. */
  readonly month?: string;
  /** Dias do mês: a base da média por hora. */
  readonly daysInMonth?: number;
  readonly height?: number;
  readonly className?: string;
}

const SERIES_COLOR = 'var(--chart-1)';
const GRID_COLOR = 'var(--line-subtle)';
const HALO_COLOR = 'var(--surface-raised)';
const TICK_COLOR = 'var(--line-strong)';
/** O ciclo começa no topo e gira no sentido horário: 90 a -270 no Recharts. */
const START_ANGLE = 90;
const END_ANGLE = -270;
const OUTER_RADIUS = '82%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
/** Só os quartos do ciclo levam rótulo: 0h, 6h, 12h e 18h. */
const QUARTER_HOURS = 6;
/** Expediente da pré-vendas, das 8h às 18h: a fronteira da frase de leitura. */
const OFFICE_START = 8;
const OFFICE_END = 18;
/** Anéis da grade: de 3 a 5 níveis redondos, o centro é o zero (EIX-4). */
const MAX_LEVELS = 5;
const STEPS = [0.5, 1, 2, 5, 10, 20, 50, 100];
const SCALE_CLEAR = 0.5;
const HORIZONTAL_SIN = 0.5;
const MARK_QUARTER = 6;
const MARK_HOUR = 3;
const LABEL_GAP = 12;
const SIDE_EPS = 0.3;
const PEAK_DOT_RADIUS = 5;
/* ACE-5: o mínimo de --chart-1 para a área composta ficar em 3:1 no tema claro é 0,66. A grade sobe
 * acima da área (zIndex) para continuar visível por baixo do preenchimento. */
const FILL_OPACITY = 0.66;
const GRID_Z_INDEX = 150;

interface CycleRow extends HourEntry {
  /** Média de entradas por hora no mês, ou null quando o mês não tem dias. */
  readonly value: number | null;
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

function levelText(level: number): string {
  return Number.isInteger(level) ? formatInt(level) : formatDecimal(level, 1);
}

function hourText(hour: number): string {
  return `${formatInt(hour)}h`;
}

/** A linha de maior valor, ou null quando não há nenhuma medida. */
function peakOf(rows: readonly CycleRow[]): CycleRow | null {
  let best: CycleRow | null = null;
  for (const row of rows) {
    if (row.value !== null && (best === null || row.value > (best.value ?? 0))) best = row;
  }
  return best;
}

/** Parcela das entradas que cai fora do expediente, ou null quando o mês não teve entrada. */
function outsideShare(rows: readonly HourEntry[]): number | null {
  const all = rows.reduce((sum, row) => sum + row.total, 0);
  if (all <= 0) return null;
  const outside = rows.filter((row) => row.hour < OFFICE_START || row.hour >= OFFICE_END).reduce((sum, row) => sum + row.total, 0);
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
    const reach = current === null || next === null || current + next <= 0 ? 0 : (2 * current * next * Math.cos(halfStep)) / (current + next);
    if (best === null || reach < best.floor) best = { angle: 90 - ((i + 0.5) * 360) / count, floor: reach };
  }
  return best;
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

function isCycleRow(value: unknown): value is CycleRow {
  return typeof value === 'object' && value !== null && 'hour' in value && 'total' in value;
}

/** Direção do eixo `index` na tela: o primeiro no topo, sentido horário (startAngle 90 do Recharts). */
function axisDirection(index: number, count: number): { readonly dx: number; readonly dy: number } {
  const rad = ((START_ANGLE + (index * (END_ANGLE - START_ANGLE)) / count) * Math.PI) / 180;
  return { dx: Math.cos(rad), dy: -Math.sin(rad) };
}

export default function HourlyCycleRadar({ data = defaultData, month = defaultMonth, daysInMonth = defaultDays, height, className }: HourlyCycleRadarProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: a pré-vendas não tem entradas de lead medidas no mês.</span>
      </div>
    );
  }

  const rows: readonly CycleRow[] = data.map((row) => ({ ...row, value: daysInMonth > 0 ? row.total / daysInMonth : null }));
  const peak = peakOf(rows);
  const peakValue = peak?.value ?? null;
  const scale = niceScale(peakValue);

  if (peak === null || peakValue === null || scale === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>Sem entrada medida: o mês não registrou nenhuma entrada de lead por hora.</span>
      </div>
    );
  }

  const spot = scaleSpot(rows.map((row) => row.value));
  const share = outsideShare(data);
  const officeText = `${hourText(OFFICE_START)} às ${hourText(OFFICE_END)}`;
  const shareText = share === null ? '' : `${formatPercent(share, 0)} das entradas caem fora das ${officeText}`;
  const peakText = `pico às ${hourText(peak.hour)}, com ${formatDecimal(peakValue, 1)} entradas`;

  const summary = `Gráfico de radar com a média de entradas de lead por hora do dia em ${formatMonthLong(month)}, em ${formatInt(data.length)} horas com a 0h no topo. O ${peakText} por hora${shareText ? `; ${shareText}` : ''}.`;
  const readingLine = `Entradas por hora em média: ${peakText}.${shareText ? ` ${shareText}.` : ''}`;

  /* O rótulo do eixo é posicionado por conta própria: o Text do Recharts ancora o bloco pelo setor e
   * empurra o nome para dentro do polígono nos eixos do topo e da base. Toda hora ganha um tique na
   * borda do anel, e só os quartos do ciclo escrevem a hora. */
  const renderAngleTick = (props: AngleTickProps): ReactElement => {
    const { cx = 0, cy = 0, radius = 0, payload } = props;
    const index = payload?.index ?? -1;
    const row = data[index];
    if (!row) return <g />;
    const { dx, dy } = axisDirection(index, data.length);
    const isQuarter = row.hour % QUARTER_HOURS === 0;
    const markEnd = radius + (isQuarter ? MARK_QUARTER : MARK_HOUR);
    const px = cx + (radius + LABEL_GAP) * dx;
    const py = cy + (radius + LABEL_GAP) * dy;
    const anchor = dx > SIDE_EPS ? 'start' : dx < -SIDE_EPS ? 'end' : 'middle';
    return (
      <g>
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
        {levelText(level)}
      </text>
    );
  };

  /* Só o pico leva ponto: as outras 23 horas ficam no contorno, e o ponto maior marca o que a linha
   * de leitura cita. O fillOpacity do ponto volta a 1, porque herdaria o da área. */
  const renderDot = (props: DotProps): ReactElement => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined || !isCycleRow(payload) || payload.id !== peak.id) return <g />;
    return <circle cx={cx} cy={cy} fill={SERIES_COLOR} fillOpacity={1} r={PEAK_DOT_RADIUS} stroke={HALO_COLOR} strokeWidth={1.5} />;
  };

  /* A dica acrescenta o que o corpo não escreve: a média da hora com a unidade e o total do mês. */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const row: unknown = payload?.[0]?.payload;
    if (!active || !isCycleRow(row)) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{hourText(row.hour)}</p>
        <p className="text-text-secondary">
          Média <span className="kpi-number ml-2 text-text-primary">{row.value === null ? formatUnavailable() : `${formatDecimal(row.value, 1)} entradas por hora`}</span>
        </p>
        <p className="text-text-secondary">
          No mês <span className="kpi-number ml-2 text-text-primary">{`${formatInt(row.total)} entradas em ${formatInt(daysInMonth)} dias`}</span>
        </p>
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
          <RadarChart accessibilityLayer={false} data={[...rows]} endAngle={END_ANGLE} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS} startAngle={START_ANGLE}>
            <PolarGrid gridType="circle" radialLines={false} stroke={GRID_COLOR} zIndex={GRID_Z_INDEX} />
            <PolarAngleAxis axisLine={false} dataKey="id" tick={renderAngleTick} tickLine={false} />
            <PolarRadiusAxis angle={spot?.angle ?? 0} axisLine={false} domain={[0, scale.max]} tick={renderScaleTick} tickLine={false} ticks={[...scale.levels]} />
            <Tooltip content={renderTooltip} cursor={false} isAnimationActive={false} />
            <Radar
              activeDot={{ r: 4, fill: SERIES_COLOR, fillOpacity: 1, stroke: HALO_COLOR, strokeWidth: 1.5 }}
              dataKey="value"
              dot={renderDot}
              fill={SERIES_COLOR}
              fillOpacity={FILL_OPACITY}
              isAnimationActive={animate}
              stroke={SERIES_COLOR}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
