import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, dimensions as defaultDimensions, type Dimension, type WorkQueue } from './data';

/**
 * Um radar pequeno por fila de trabalho numa grade de três colunas, todos com os mesmos cinco
 * eixos e a mesma escala. O eixo sem medição interrompe o traço e se escreve como sem dado: a
 * ausência não desce ao centro, onde moraria um zero medido.
 */
export interface QueueRadarGridProps {
  readonly data?: readonly WorkQueue[];
  /** Eixos na ordem do registry, a mesma em todas as miniaturas. */
  readonly dimensions?: readonly Dimension[];
  readonly height?: number;
  readonly className?: string;
}

const SERIES_COLOR = 'var(--chart-1)';
const GRID_COLOR = 'var(--line-subtle)';
const HALO_COLOR = 'var(--surface-raised)';
const MUTED_COLOR = 'var(--text-muted)';
const DOMAIN: [number, number] = [0, 100];
const RINGS = [50, 100];
const GRID_COLUMNS = 3;
const OUTER_RADIUS = '72%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
/** Distância, em px, do anel externo até o número do eixo. */
const NUMBER_GAP = 11;
/** Preenchimento mínimo da --chart-1 para a área passar de 3:1 no tema claro (ACE-5). */
const FILL_OPACITY = 0.66;
const DOT_RADIUS = 3;
const GAP_DASH = '4 4';

interface Point {
  readonly x: number;
  readonly y: number;
}

interface ValuedPoint extends Point {
  readonly value: number | null;
}

/** Direção do eixo `index` na tela: o primeiro no topo, sentido horário (startAngle 90 do Recharts). */
function axisDirection(index: number, count: number): { readonly dx: number; readonly dy: number } {
  const rad = ((90 - (index * 360) / count) * Math.PI) / 180;
  return { dx: Math.cos(rad), dy: -Math.sin(rad) };
}

/** Maior valor da lista; lista vazia devolve null, nunca zero. */
function maxOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
}

/**
 * Trechos contínuos do traço. O Recharts põe o ponto sem valor no centro (raio zero), então o
 * polígono padrão desceria até lá; aqui o ciclo é aberto nos nulos e cada trecho para no vizinho.
 * Sem nenhum nulo o ciclo fecha e leva a área.
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

interface MiniRow {
  readonly label: string;
  readonly value: number | null;
}

interface MiniQueue {
  readonly queue: WorkQueue;
  readonly rows: readonly MiniRow[];
  /** Nome, como entra no meio de uma frase, das dimensões sem medição. */
  readonly missing: readonly string[];
}

interface AngleTickProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly radius?: number;
  readonly payload?: { readonly index?: number };
}

interface DotProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly value?: number | string | null;
}

interface StrokeShapeProps {
  readonly points?: readonly ValuedPoint[];
}

interface TipProps {
  readonly active?: boolean;
  readonly payload?: readonly { readonly payload?: unknown }[];
}

function isMiniRow(value: unknown): value is MiniRow {
  return typeof value === 'object' && value !== null && 'label' in value && 'value' in value;
}

function MiniRadar({ item, count, animate }: { readonly item: MiniQueue; readonly count: number; readonly animate: boolean }) {
  const { queue, rows, missing } = item;

  /* Número do eixo; no eixo sem dado, um traço tracejado do centro à borda. Sem ele a ausência seria só
   * um número a mais, e o zero medido (ponto no centro) e a ausência leriam igual de relance. */
  const renderAngleTick = (props: AngleTickProps): ReactElement => {
    const { cx = 0, cy = 0, radius = 0, payload } = props;
    const index = payload?.index ?? -1;
    const row = rows[index];
    if (!row) return <g />;
    const { dx, dy } = axisDirection(index, count);
    return (
      <g>
        {row.value === null ? <line stroke={MUTED_COLOR} strokeDasharray={GAP_DASH} strokeWidth={1.5} x1={cx} x2={cx + radius * dx} y1={cy} y2={cy + radius * dy} /> : null}
        <text className="font-display" dominantBaseline="central" fill={MUTED_COLOR} fontSize={11} fontWeight={500} textAnchor="middle" x={cx + (radius + NUMBER_GAP) * dx} y={cy + (radius + NUMBER_GAP) * dy}>
          {formatInt(index + 1)}
        </text>
      </g>
    );
  };

  /* Traço próprio: o ponto nulo está no centro (raio zero) e o polígono padrão faria uma ponta falsa até lá. */
  const renderShape = (props: StrokeShapeProps): ReactElement => {
    const { points } = props;
    if (!points) return <g />;
    const { runs, closed } = strokeRuns(points);
    return (
      <g>
        {runs.map((run) => (
          <path
            d={run.map((p, i) => `${i === 0 ? 'M' : 'L'}${String(p.x)},${String(p.y)}`).join('') + (closed ? 'Z' : '')}
            fill={closed ? SERIES_COLOR : 'none'}
            fillOpacity={closed ? FILL_OPACITY : undefined}
            key={`${String(run[0]?.x)}-${String(run[0]?.y)}`}
            stroke={SERIES_COLOR}
            strokeLinejoin="round"
            strokeWidth={2}
          />
        ))}
      </g>
    );
  };

  /* O ponto sem valor chega ao dot com coordenada válida (o centro): sem este corte ele viraria um zero desenhado. */
  const renderDot = (props: DotProps): ReactElement => {
    const { cx, cy, value } = props;
    if (cx === undefined || cy === undefined || typeof value !== 'number') return <g />;
    return <circle cx={cx} cy={cy} fill={SERIES_COLOR} r={DOT_RADIUS} stroke={HALO_COLOR} strokeWidth={1} />;
  };

  /* A dica acrescenta o nome do eixo e o valor exato, e diz sem dado onde falta. */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const row: unknown = payload?.[0]?.payload;
    if (!active || !isMiniRow(row)) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{queue.name}</p>
        <p className="text-text-secondary">
          {row.label}{' '}
          {row.value === null ? <span className="text-text-muted">{formatUnavailable()}</span> : <span className="kpi-number ml-2 text-text-primary">{formatInt(row.value)}</span>}
        </p>
      </div>
    );
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <span className="text-xs leading-tight font-medium text-text-secondary">{queue.name}</span>
      <span className="text-xs leading-tight text-text-muted">
        <span className="kpi-number text-text-primary">{formatInt(queue.entries)}</span> entradas
        {missing.length > 0 ? `, ${missing.join(' e ')} sem dado` : ''}
      </span>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart accessibilityLayer={false} data={[...rows]} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS}>
            <PolarGrid gridType="circle" stroke={GRID_COLOR} />
            <PolarAngleAxis axisLine={false} dataKey="label" tick={renderAngleTick} tickLine={false} />
            <PolarRadiusAxis axisLine={false} domain={DOMAIN} tick={false} tickLine={false} ticks={RINGS} />
            <Tooltip content={renderTooltip} cursor={false} filterNull={false} isAnimationActive={false} />
            <Radar activeDot={false} connectNulls={false} dataKey="value" dot={renderDot} fill="none" isAnimationActive={animate} shape={renderShape} stroke={SERIES_COLOR} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function QueueRadarGrid({ data = defaultData, dimensions = defaultDimensions, height, className }: QueueRadarGridProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma fila neste recorte: não houve entrada na pré-vendas no mês.</span>
      </div>
    );
  }

  /* Da fila com mais entradas para a com menos; o empate se desfaz pelo nome para a ordem não mudar entre renders. */
  const items: readonly MiniQueue[] = data
    .map((queue) => ({
      queue,
      rows: dimensions.map((dimension, i) => ({ label: dimension.label, value: queue.scores[i] ?? null })),
      missing: dimensions.flatMap((dimension, i) => ((queue.scores[i] ?? null) === null ? [dimension.phrase] : [])),
    }))
    .sort((a, b) => b.queue.entries - a.queue.entries || a.queue.name.localeCompare(b.queue.name, 'pt-BR'));

  const biggest = items[0];
  const gapped = items.find((item) => item.missing.length > 0);
  const gapAxis = gapped ? dimensions.findIndex((dimension) => dimension.phrase === gapped.missing[0]) : -1;
  const maxEntries = maxOf(items.map((item) => item.queue.entries));
  const rowCount = Math.ceil(items.length / GRID_COLUMNS);

  const summary =
    `Grade com ${String(items.length)} radares, um por fila de trabalho da pré-vendas, com os mesmos ${String(dimensions.length)} eixos e a mesma escala de ${formatInt(DOMAIN[0])} a ${formatInt(DOMAIN[1])}.` +
    (gapped ? ` A fila de ${gapped.queue.name.toLowerCase()} está sem ${gapped.missing.join(' e ')} medido.` : '') +
    (biggest && maxEntries !== null ? ` A maior fila é ${biggest.queue.name}, com ${formatInt(maxEntries)} entradas.` : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        Ordenadas pelo volume de entradas, da maior à menor fila.
        {gapped && gapAxis >= 0 ? (
          <>
            {' '}
            <span className="text-text-primary">{gapped.queue.name}</span> não tem {gapped.missing.join(' e ')} medido: o eixo{' '}
            <span className="font-display text-text-primary">{formatInt(gapAxis + 1)}</span> fica tracejado e sem ponto.
          </>
        ) : null}
      </p>
      <ul aria-hidden className="m-0 flex shrink-0 list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-xs text-text-secondary">
        {dimensions.map((dimension, i) => (
          <li key={dimension.id}>
            <span className="font-display mr-1 text-text-muted">{formatInt(i + 1)}</span>
            {dimension.label}
          </li>
        ))}
        <li className="flex items-center gap-1 text-text-muted">
          <svg aria-hidden height="10" width="20">
            <line stroke={MUTED_COLOR} strokeDasharray={GAP_DASH} strokeWidth="1.5" x1="1" x2="19" y1="5" y2="5" />
          </svg>
          sem dado
        </li>
        <li className="text-text-muted">
          Escala de {formatInt(DOMAIN[0])} a {formatInt(DOMAIN[1])}, igual em todas; na primeira resposta, {formatInt(DOMAIN[1])} é a mais rápida.
        </li>
      </ul>
      <div
        className="grid min-h-0 flex-1 gap-3"
        style={{ gridTemplateColumns: `repeat(${String(GRID_COLUMNS)}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${String(rowCount)}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <MiniRadar animate={animate} count={dimensions.length} item={item} key={item.queue.id} />
        ))}
      </div>
    </div>
  );
}
