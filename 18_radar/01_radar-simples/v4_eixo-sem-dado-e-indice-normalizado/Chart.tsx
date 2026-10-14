import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, subject as defaultSubject, teamSize as defaultTeamSize, type PercentileAxis } from './data';

/**
 * Radar de uma série com eixo sem medição: o traço para nos vizinhos do eixo ausente, o eixo sem
 * dado sai tracejado e com a palavra no rótulo, e o zero medido continua sendo um ponto no centro.
 */
export interface PercentileRadarProps {
  readonly data?: readonly PercentileAxis[];
  /** Quem o perfil descreve, escrito como entra no meio de uma frase. */
  readonly subject?: string;
  /** Quantos executivos formam a base do percentil. */
  readonly teamSize?: number;
  readonly height?: number;
  readonly className?: string;
}

const SERIES_COLOR = 'var(--chart-1)';
const GRID_COLOR = 'var(--line-subtle)';
const HALO_COLOR = 'var(--surface-raised)';
const MUTED_COLOR = 'var(--text-muted)';
const DOMAIN: [number, number] = [0, 100];
const LEVELS = [25, 50, 75, 100];
/** Folga, em pontos de índice, entre a borda do traço e o número da escala. */
const SCALE_CLEAR = 8;
const OUTER_RADIUS = '72%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
const LABEL_GAP = 10;
const LINE_HEIGHT = 14;
const NAME_WRAP_AT = 14;
const DOT_RADIUS = 4;
const SIDE_EPS = 0.3;
const GAP_DASH = '4 4';
const NO_DATA_TEXT = 'sem dado';

interface Point {
  readonly x: number;
  readonly y: number;
}

interface ValuedPoint extends Point {
  readonly value: number | null;
}

/** Quebra o nome em duas linhas no espaço mais perto do meio; nome curto fica numa linha só. */
function wrapName(name: string): readonly string[] {
  if (name.length <= NAME_WRAP_AT) return [name];
  const middle = name.length / 2;
  let cut = -1;
  for (let i = 0; i < name.length; i += 1) {
    if (name[i] === ' ' && (cut < 0 || Math.abs(i - middle) < Math.abs(cut - middle))) cut = i;
  }
  return cut < 0 ? [name] : [name.slice(0, cut), name.slice(cut + 1)];
}

/** Junta em frase: "a, b e c". Lista vazia devolve null, nunca texto vazio disfarçado. */
function joinPhrases(items: readonly string[]): string | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0] ?? null;
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1] ?? ''}`;
}

/** Maior e menor valor medido; lista sem medição devolve null, nunca zero. */
function maxOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
}

function minOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.min(...values);
}

/** Direção do eixo `index` na tela: primeiro eixo no topo, sentido horário (startAngle 90 do Recharts). */
function axisDirection(index: number, count: number): { readonly dx: number; readonly dy: number } {
  const rad = ((90 - (index * 360) / count) * Math.PI) / 180;
  return { dx: Math.cos(rad), dy: -Math.sin(rad) };
}

function anchorFor(dx: number): 'start' | 'end' | 'middle' {
  return dx > SIDE_EPS ? 'start' : dx < -SIDE_EPS ? 'end' : 'middle';
}

/**
 * Trechos contínuos do traço. O Recharts põe o ponto sem valor no centro (raio zero), então a
 * linha padrão desceria até lá; aqui o ciclo é aberto nos nulos e cada trecho para no vizinho.
 * Sem nenhum nulo o ciclo fecha. Com nulos, o último trecho se junta ao primeiro quando os dois
 * encostam na virada do ciclo.
 */
function strokeRuns(points: readonly ValuedPoint[]): { readonly runs: readonly (readonly Point[])[]; readonly closed: boolean } {
  const firstNull = points.findIndex((p) => p.value === null);
  if (firstNull < 0) return { runs: [points], closed: points.length > 2 };
  const runs: Point[][] = [];
  let current: Point[] = [];
  for (let step = 1; step <= points.length; step += 1) {
    const p = points[(firstNull + step) % points.length];
    if (!p) continue;
    if (p.value === null) {
      if (current.length > 0) runs.push(current);
      current = [];
    } else {
      current.push({ x: p.x, y: p.y });
    }
  }
  if (current.length > 0) runs.push(current);
  return { runs, closed: false };
}

/** O vão com menos tinta entre dois eixos: onde os números da escala cabem sem pisar no traço. */
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
    const reach = current === null || next === null || current + next <= 0 ? 0 : (2 * current * next * Math.cos(halfStep)) / (current + next);
    if (best === null || reach < best.floor) best = { angle: 90 - ((i + 0.5) * 360) / count, floor: reach };
  }
  return best;
}

interface TipProps {
  readonly active?: boolean;
  readonly label?: string | number;
  readonly payload?: readonly { readonly payload?: unknown }[];
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
  readonly value?: number | string | null;
}

interface StrokeShapeProps {
  readonly points?: readonly ValuedPoint[];
}

function isPercentileAxis(value: unknown): value is PercentileAxis {
  return typeof value === 'object' && value !== null && 'label' in value && 'rank' in value;
}

export default function PercentileRadar({ data = defaultData, subject = defaultSubject, teamSize = defaultTeamSize, height, className }: PercentileRadarProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: o executivo não tem dimensões no trimestre.</span>
      </div>
    );
  }

  const measured = data.flatMap((row) => (row.value === null ? [] : [row.value]));
  if (measured.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>{formatUnavailable()}: nenhuma dimensão de {subject} foi medida no trimestre.</span>
      </div>
    );
  }

  const spot = scaleSpot(data.map((row) => row.value));
  const top = maxOf(measured);
  const bottom = minOf(measured);
  const strongest = data.find((row) => row.value === top);
  const weakest = data.find((row) => row.value === bottom);
  const missing = joinPhrases(data.filter((row) => row.value === null).map((row) => row.phrase));
  const missingCount = data.length - measured.length;
  const method = `Índice de ${formatInt(DOMAIN[0])} a ${formatInt(DOMAIN[1])} pelo percentil no time.`;

  const summary =
    strongest && weakest
      ? `Gráfico de radar de ${subject} em ${String(data.length)} dimensões, índice de 0 a 100 pelo percentil no time. A mais forte é ${strongest.phrase}, com ${formatInt(strongest.value ?? 0)}; a mais fraca é ${weakest.phrase}, com ${formatInt(weakest.value ?? 0)}.${
          missing ? ` ${missing.slice(0, 1).toUpperCase()}${missing.slice(1)} ${missingCount === 1 ? 'está' : 'estão'} sem dado.` : ''
        }`
      : '';

  /* Nome do eixo e, na última linha, o valor ou a palavra sem dado. O eixo sem medição ganha um
   * traço tracejado do centro à borda: sem ele a ausência seria só uma palavra, e o zero medido
   * (ponto no centro) e a ausência leriam igual de relance. */
  const renderAngleTick = (props: AngleTickProps): ReactElement => {
    const { cx = 0, cy = 0, radius = 0, payload } = props;
    const index = payload?.index ?? -1;
    const row = data[index];
    if (!row) return <g />;
    const { dx, dy } = axisDirection(index, data.length);
    const px = cx + (radius + LABEL_GAP) * dx;
    const py = cy + (radius + LABEL_GAP) * dy;
    const lines = [...wrapName(row.label), row.value === null ? NO_DATA_TEXT : formatInt(row.value)];
    const blockHeight = lines.length * LINE_HEIGHT;
    const firstY = dy < -SIDE_EPS ? py - blockHeight : dy > SIDE_EPS ? py : py - blockHeight / 2;
    return (
      <g>
        {row.value === null ? <line stroke={MUTED_COLOR} strokeDasharray={GAP_DASH} strokeWidth={1.5} x1={cx} x2={cx + radius * dx} y1={cy} y2={cy + radius * dy} /> : null}
        {lines.map((line, i) => {
          const isLast = i === lines.length - 1;
          const isValue = isLast && row.value !== null;
          return (
            <text
              className={isValue ? 'font-display' : 'font-sans'}
              dominantBaseline="central"
              fill={isLast ? (isValue ? 'var(--text-primary)' : MUTED_COLOR) : 'var(--text-secondary)'}
              fontSize={isValue ? 12 : 11}
              fontWeight={isValue ? 600 : 500}
              key={line + String(i)}
              textAnchor={anchorFor(dx)}
              x={px}
              y={firstY + (i + 0.5) * LINE_HEIGHT}
            >
              {line}
            </text>
          );
        })}
      </g>
    );
  };

  /* O tick da escala chega com `transform` de rotação pelo ângulo do eixo; o texto é horizontal
   * por contrato (TIP-5), então só x e y são usados. */
  const renderScaleTick = (props: ScaleTickProps): ReactElement => {
    const { payload } = props;
    const x = Number(props.x ?? 0);
    const y = Number(props.y ?? 0);
    const level = payload?.value ?? 0;
    if (spot === null || level < spot.floor + SCALE_CLEAR) return <g />;
    const onLeft = Math.cos((spot.angle * Math.PI) / 180) < 0;
    return (
      <text className="font-display" dominantBaseline="central" fill={MUTED_COLOR} fontSize={11} fontWeight={500} style={{ paintOrder: 'stroke', stroke: HALO_COLOR, strokeWidth: 4 }} textAnchor={onLeft ? 'end' : 'start'} x={onLeft ? x - 4 : x + 4} y={y}>
        {formatInt(level)}
      </text>
    );
  };

  /* Traço próprio: o polígono padrão do Radar fecha por todos os pontos, e o ponto nulo está no
   * centro (raio zero), o que desenharia uma ponta falsa até lá. */
  const renderStroke = (props: StrokeShapeProps): ReactElement => {
    const { points } = props;
    if (!points) return <g />;
    const { runs, closed } = strokeRuns(points);
    return (
      <g>
        {runs.map((run) => (
          <path d={run.map((p, i) => `${i === 0 ? 'M' : 'L'}${String(p.x)},${String(p.y)}`).join('') + (closed ? 'Z' : '')} fill="none" key={`${String(run[0]?.x)}-${String(run[0]?.y)}`} stroke={SERIES_COLOR} strokeLinejoin="round" strokeWidth={2.5} />
        ))}
      </g>
    );
  };

  /* O ponto sem valor chega ao dot com coordenada válida (o centro): sem este corte ele viraria um
   * zero desenhado. */
  const renderDot = (props: DotProps): ReactElement => {
    const { cx, cy, value } = props;
    if (cx === undefined || cy === undefined || typeof value !== 'number') return <g />;
    return <circle cx={cx} cy={cy} fill={SERIES_COLOR} r={DOT_RADIUS} stroke={HALO_COLOR} strokeWidth={1.5} />;
  };

  /* A dica acrescenta a posição no time, que o corpo não escreve, e diz sem dado onde falta. */
  const renderTooltip = ({ active, label, payload }: TipProps): ReactElement | null => {
    const row: unknown = data.find((item) => item.label === label) ?? payload?.[0]?.payload;
    if (!active || !isPercentileAxis(row)) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{row.label}</p>
        {row.value === null || row.rank === null ? (
          <p className="text-text-muted">{NO_DATA_TEXT}</p>
        ) : (
          <>
            <p className="text-text-secondary">
              Percentil no time <span className="kpi-number ml-2 text-text-primary">{formatInt(row.value)}</span>
            </p>
            <p className="text-text-secondary">
              Posição <span className="kpi-number ml-2 text-text-primary">{`${formatInt(row.rank)}º de ${formatInt(teamSize)}`}</span>
            </p>
          </>
        )}
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        {method}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart accessibilityLayer={false} data={[...data]} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS}>
            <PolarGrid gridType="circle" stroke={GRID_COLOR} />
            <PolarAngleAxis axisLine={false} dataKey="label" tick={renderAngleTick} tickLine={false} />
            <PolarRadiusAxis angle={spot?.angle ?? 0} axisLine={false} domain={DOMAIN} tick={renderScaleTick} tickLine={false} ticks={LEVELS} />
            <Tooltip content={renderTooltip} cursor={false} filterNull={false} isAnimationActive={false} />
            <Radar activeDot={false} connectNulls={false} dataKey="value" dot={renderDot} fill="none" isAnimationActive={animate} shape={renderStroke} stroke={SERIES_COLOR} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
