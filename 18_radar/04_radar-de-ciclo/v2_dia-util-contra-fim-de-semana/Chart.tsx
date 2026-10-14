import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatMonthLong, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, month as defaultMonth, weekdayCount as defaultWeekdays, weekendCount as defaultWeekends, type HourRegime } from './data';

/**
 * Radar de ciclo de dois regimes: a média de entradas de lead por hora no dia útil, preenchida, contra
 * a do fim de semana, em contorno, para ler se a demanda de fim de semana tem outro relógio.
 */
export interface RegimeCycleRadarProps {
  readonly data?: readonly HourRegime[];
  /** Mês do dado, no formato `YYYY-MM`. */
  readonly month?: string;
  /** Dias úteis do mês: a base da média do dia útil. */
  readonly weekdayCount?: number;
  /** Dias de fim de semana do mês: a base da média do fim de semana. */
  readonly weekendCount?: number;
  readonly height?: number;
  readonly className?: string;
}

/** A cor vem do regime, nunca da posição no array (COR-3): dia útil em 1, fim de semana em 3. */
const WEEKDAY_COLOR = 'var(--chart-1)';
const WEEKEND_COLOR = 'var(--chart-3)';
const GRID_COLOR = 'var(--line-subtle)';
const HALO_COLOR = 'var(--surface-raised)';
const TICK_COLOR = 'var(--line-strong)';
/** O ciclo começa no topo e gira no sentido horário: 90 a -270 no Recharts. */
const START_ANGLE = 90;
const END_ANGLE = -270;
const OUTER_RADIUS = '78%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
/** Só os quartos do ciclo levam rótulo: 0h, 6h, 12h e 18h. */
const QUARTER_HOURS = 6;
/** Anéis da grade: de 3 a 5 níveis redondos, o centro é o zero (EIX-4). */
const MAX_LEVELS = 5;
const STEPS = [0.5, 1, 2, 5, 10, 20, 50, 100];
const SCALE_CLEAR = 0.5;
const HORIZONTAL_SIN = 0.5;
const MARK_QUARTER = 6;
const MARK_HOUR = 3;
const LABEL_GAP = 12;
const SIDE_EPS = 0.3;
/** Altura de cada linha da anotação e respiro entre o fim do eixo e o texto, em pixels. */
const NOTE_LINE = 14;
const NOTE_GAP = 18;
const NOTE_DOT_RADIUS = 3.5;
/* ACE-5: o mínimo de --chart-1 para a área composta ficar em 3:1 no tema claro é 0,66. A grade sobe
 * acima da área (zIndex) para continuar visível por baixo do preenchimento. */
const FILL_OPACITY = 0.66;
/** Área em 100 (padrão), grade em 150, contorno do fim de semana em 250: ele sobe acima da área. */
const GRID_Z_INDEX = 150;
const WEEKEND_Z_INDEX = 250;
/** Revestimento (5,5 px) em 200 e contorno do dia útil em 225: ficam entre a área e o contorno do fim de semana. */
const COATING_WIDTH = 5.5;
const COATING_Z_INDEX = 200;
const WEEKDAY_LINE_Z_INDEX = 225;

interface CycleRow extends HourRegime {
  /** Média de entradas por hora nos dias úteis, ou null quando o mês não tem dia útil. */
  readonly weekday: number | null;
  /** Média de entradas por hora nos fins de semana, ou null quando o mês não tem nenhum. */
  readonly weekend: number | null;
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

/** A linha de maior média da série, ou null quando nenhuma hora tem média medida. */
function peakOf(rows: readonly CycleRow[], key: 'weekday' | 'weekend'): { readonly row: CycleRow; readonly value: number } | null {
  let best: { readonly row: CycleRow; readonly value: number } | null = null;
  for (const row of rows) {
    const value = row[key];
    if (value !== null && (best === null || value > best.value)) best = { row, value };
  }
  return best;
}

/** A primeira hora, contada a partir do pico do dia útil, em que o fim de semana passa o dia útil. */
function takeoverIndex(rows: readonly CycleRow[], fromIndex: number): number | null {
  for (let step = 1; step <= rows.length; step += 1) {
    const index = (fromIndex + step) % rows.length;
    const row = rows[index];
    if (row && row.weekday !== null && row.weekend !== null && row.weekend > row.weekday) return index;
  }
  return null;
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

/** Direção do eixo `index` na tela: o primeiro no topo, sentido horário (startAngle 90 do Recharts). */
function axisDirection(index: number, count: number): { readonly dx: number; readonly dy: number } {
  const rad = ((START_ANGLE + (index * (END_ANGLE - START_ANGLE)) / count) * Math.PI) / 180;
  return { dx: Math.cos(rad), dy: -Math.sin(rad) };
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

interface TipProps {
  readonly active?: boolean;
  readonly payload?: readonly { readonly payload?: unknown }[];
}

function isCycleRow(value: unknown): value is CycleRow {
  return typeof value === 'object' && value !== null && 'hour' in value && 'weekdayTotal' in value;
}

export default function RegimeCycleRadar({ data = defaultData, month = defaultMonth, weekdayCount = defaultWeekdays, weekendCount = defaultWeekends, height, className }: RegimeCycleRadarProps) {
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

  const rows: readonly CycleRow[] = data.map((row) => ({
    ...row,
    weekday: weekdayCount > 0 ? row.weekdayTotal / weekdayCount : null,
    weekend: weekendCount > 0 ? row.weekendTotal / weekendCount : null,
  }));
  const weekdayPeak = peakOf(rows, 'weekday');
  const weekendPeak = peakOf(rows, 'weekend');
  const scale = niceScale(weekdayPeak === null && weekendPeak === null ? null : Math.max(weekdayPeak?.value ?? 0, weekendPeak?.value ?? 0));

  if (weekdayPeak === null || weekendPeak === null || scale === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>Sem entrada medida: o mês não registrou entrada de lead nos dois regimes para comparar.</span>
      </div>
    );
  }

  const spot = scaleSpot(rows.map((row) => Math.max(row.weekday ?? 0, row.weekend ?? 0)));
  const takeover = takeoverIndex(rows, rows.indexOf(weekdayPeak.row));
  const takeoverRow = takeover === null ? undefined : rows[takeover];
  const peakText = `dia útil tem pico às ${hourText(weekdayPeak.row.hour)}, com ${formatDecimal(weekdayPeak.value, 1)}; o fim de semana, às ${hourText(weekendPeak.row.hour)}, com ${formatDecimal(weekendPeak.value, 1)}`;

  const summary = `Gráfico de radar com a média de entradas de lead por hora em ${formatMonthLong(month)}, dia útil contra fim de semana. O ${peakText}${takeoverRow ? ` e passa o dia útil a partir das ${hourText(takeoverRow.hour)}` : ''}.`;
  const readingLine = `Médias de entradas por hora: o ${peakText}.`;

  /* O rótulo do eixo é posicionado por conta própria: o Text do Recharts ancora o bloco pelo setor e
   * empurra o nome para dentro do polígono nos eixos do topo e da base. Toda hora ganha um tique na
   * borda do anel, só os quartos escrevem a hora, e a anotação do fim de semana mora no tique da hora
   * em que ele passa o dia útil, porque só o tique conhece o centro e o raio do desenho. */
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
    const isNote = index === takeover && row.weekend !== null;
    const noteLines = isNote && row.weekend !== null ? ['Fim de semana', `começa às ${hourText(row.hour)}`, `${formatDecimal(row.weekend, 1)} por hora`] : [];
    const noteEnd = radius + NOTE_GAP;
    const noteX = cx + noteEnd * dx;
    const noteY = cy + noteEnd * dy;
    const noteTop = dy < -SIDE_EPS ? noteY - noteLines.length * NOTE_LINE : dy > SIDE_EPS ? noteY : noteY - (noteLines.length * NOTE_LINE) / 2;
    const pointRadius = row.weekend === null ? 0 : (radius * row.weekend) / scale.max;
    return (
      <g>
        <line stroke={TICK_COLOR} strokeWidth={1} x1={cx + radius * dx} x2={cx + markEnd * dx} y1={cy + radius * dy} y2={cy + markEnd * dy} />
        {isQuarter ? (
          <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={600} textAnchor={anchor} x={px} y={py + dy * 7}>
            {hourText(row.hour)}
          </text>
        ) : null}
        {isNote ? (
          <g>
            <line stroke={WEEKEND_COLOR} strokeWidth={1.5} x1={cx + pointRadius * dx} x2={noteX} y1={cy + pointRadius * dy} y2={noteY} />
            <circle cx={cx + pointRadius * dx} cy={cy + pointRadius * dy} fill={WEEKEND_COLOR} r={NOTE_DOT_RADIUS} stroke={HALO_COLOR} strokeWidth={1.5} />
            {noteLines.map((line, i) => (
              <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} key={line} textAnchor={anchor} x={noteX + dx * 4} y={noteTop + (i + 0.5) * NOTE_LINE}>
                {line}
              </text>
            ))}
          </g>
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

  /* A dica acrescenta o que o corpo não escreve: a média de cada regime na hora e o total que a
   * produz, porque os dois regimes têm número de dias diferente. */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const row: unknown = payload?.[0]?.payload;
    if (!active || !isCycleRow(row)) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{hourText(row.hour)}</p>
        <p className="text-text-secondary">
          Dia útil <span className="kpi-number ml-2 text-text-primary">{row.weekday === null ? formatUnavailable() : `${formatDecimal(row.weekday, 1)} por hora`}</span>{' '}
          <span className="kpi-number text-text-muted">{`${formatInt(row.weekdayTotal)} em ${formatInt(weekdayCount)} dias`}</span>
        </p>
        <p className="text-text-secondary">
          Fim de semana <span className="kpi-number ml-2 text-text-primary">{row.weekend === null ? formatUnavailable() : `${formatDecimal(row.weekend, 1)} por hora`}</span>{' '}
          <span className="kpi-number text-text-muted">{`${formatInt(row.weekendTotal)} em ${formatInt(weekendCount)} dias`}</span>
        </p>
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        {readingLine}
      </p>
      <ul aria-hidden className="m-0 flex shrink-0 list-none items-center gap-4 p-0 text-[11px] font-medium text-text-secondary">
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height="10" width="20">
            <rect fill={WEEKDAY_COLOR} fillOpacity={FILL_OPACITY} height="8" stroke={WEEKDAY_COLOR} strokeWidth="1.5" width="18" x="1" y="1" />
          </svg>
          <span>Dia útil</span>
        </li>
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height="10" width="20">
            <line stroke={WEEKEND_COLOR} strokeWidth="2.5" x1="0" x2="20" y1="5" y2="5" />
          </svg>
          <span>Fim de semana</span>
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart accessibilityLayer={false} data={[...rows]} endAngle={END_ANGLE} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS} startAngle={START_ANGLE}>
            <PolarGrid gridType="circle" radialLines={false} stroke={GRID_COLOR} zIndex={GRID_Z_INDEX} />
            <PolarAngleAxis axisLine={false} dataKey="id" tick={renderAngleTick} tickLine={false} />
            <PolarRadiusAxis angle={spot?.angle ?? 0} axisLine={false} domain={[0, scale.max]} tick={renderScaleTick} tickLine={false} ticks={[...scale.levels]} />
            <Tooltip content={renderTooltip} cursor={false} isAnimationActive={false} />
            {/* O dia útil antes do fim de semana no JSX; o zIndex puxa o contorno para cima da área. */}
            <Radar dataKey="weekday" dot={false} fill={WEEKDAY_COLOR} fillOpacity={FILL_OPACITY} isAnimationActive={animate} name="Dia útil" stroke={WEEKDAY_COLOR} strokeWidth={2} />
            {/* ACE-3/COR-5: revestimento na cor da superfície por baixo do contorno do fim de semana; o contorno do dia útil volta por cima do revestimento para não ser partido nos cruzamentos. */}
            <Radar dataKey="weekend" dot={false} fill="none" isAnimationActive={animate} legendType="none" name="Revestimento" stroke={HALO_COLOR} strokeWidth={COATING_WIDTH} tooltipType="none" zIndex={COATING_Z_INDEX} />
            <Radar dataKey="weekday" dot={false} fill="none" isAnimationActive={animate} legendType="none" name="Contorno do dia útil" stroke={WEEKDAY_COLOR} strokeWidth={2} tooltipType="none" zIndex={WEEKDAY_LINE_Z_INDEX} />
            <Radar dataKey="weekend" dot={false} fill="none" isAnimationActive={animate} name="Fim de semana" stroke={WEEKEND_COLOR} strokeWidth={2.5} zIndex={WEEKEND_Z_INDEX} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
