import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, subject as defaultSubject, teamSize as defaultTeamSize, type ProcessAxis } from './data';

/**
 * Radar de um executivo sobre a faixa do time: a coroa entre o mínimo e o máximo de cada dimensão
 * é o contexto, a linha do executivo vai por cima e as dimensões fora da faixa saem vazadas e com
 * o valor escrito.
 */
export interface TeamBandRadarProps {
  readonly data?: readonly ProcessAxis[];
  /** Quem o perfil descreve, escrito como entra no meio de uma frase. */
  readonly subject?: string;
  /** Quantos executivos formam a faixa. */
  readonly teamSize?: number;
  readonly height?: number;
  readonly className?: string;
}

const SERIES_COLOR = 'var(--chart-1)';
/* A coroa em --line-strong mede 1,79:1 contra o cartão: o contorno em --text-muted (5,2:1) é o que a
 * faz ser vista, e a faixa de valores vai escrita na dica e na legenda. */
const BAND_COLOR = 'var(--line-strong)';
const BAND_EDGE_COLOR = 'var(--text-muted)';
const GRID_COLOR = 'var(--line-subtle)';
const HALO_COLOR = 'var(--surface-raised)';
const DOMAIN: [number, number] = [0, 100];
const LEVELS = [25, 50, 75, 100];
const OUTER_RADIUS = '74%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
const LABEL_GAP = 10;
const LINE_HEIGHT = 13;
const NAME_WRAP_AT = 14;
const VALUE_OFFSET = 13;
const DOT_RADIUS = 3.5;
const DOT_RADIUS_OUTSIDE = 5;
const SIDE_EPS = 0.3;
/** A grade sobe acima da coroa (zIndex 100 da área) para continuar visível por dentro dela; a
 * linha do executivo sobe acima da grade para a grade não riscar a série. */
const GRID_Z_INDEX = 150;
const SERIES_Z_INDEX = 250;

interface Point {
  readonly x: number;
  readonly y: number;
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

function isOutside(row: ProcessAxis): boolean {
  return row.value < row.min || row.value > row.max;
}

/** Direção do eixo `index` na tela: primeiro eixo no topo, sentido horário (startAngle 90 do Recharts). */
function axisDirection(index: number, count: number): { readonly dx: number; readonly dy: number } {
  const rad = ((90 - (index * 360) / count) * Math.PI) / 180;
  return { dx: Math.cos(rad), dy: -Math.sin(rad) };
}

function anchorFor(dx: number): 'start' | 'end' | 'middle' {
  return dx > SIDE_EPS ? 'start' : dx < -SIDE_EPS ? 'end' : 'middle';
}

function ring(points: readonly Point[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${String(p.x)},${String(p.y)}`).join('') + 'Z';
}

interface TipProps {
  readonly active?: boolean;
  readonly payload?: readonly { readonly payload?: unknown }[];
}

interface AngleTickProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly radius?: number;
  readonly payload?: { readonly index?: number };
}

interface Vertex {
  readonly x: number;
  readonly y: number;
  readonly index: number;
  readonly value: number;
}

/** O rótulo do Radar tipa as props como as de texto; x, y, index e value chegam em tempo de execução,
 * então a leitura valida campo a campo antes de usar. */
function readVertex(props: object): Vertex | null {
  const { x, y, index, value } = props as Record<string, unknown>;
  if (typeof x !== 'number' || typeof y !== 'number' || typeof index !== 'number' || typeof value !== 'number') return null;
  return { x, y, index, value };
}

interface DotProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly index?: number;
}

interface BandProps {
  readonly points?: readonly Point[];
  readonly baseLinePoints?: readonly Point[];
}

function isProcessAxis(value: unknown): value is ProcessAxis {
  return typeof value === 'object' && value !== null && 'min' in value && 'max' in value && 'label' in value;
}

export default function TeamBandRadar({ data = defaultData, subject = defaultSubject, teamSize = defaultTeamSize, height, className }: TeamBandRadarProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: o time não tem dimensões medidas no trimestre.</span>
      </div>
    );
  }

  const rows = data.map((row) => ({ ...row, range: [row.min, row.max] }));
  const scaleNote = `Índice de ${formatInt(DOMAIN[0])} a ${formatInt(DOMAIN[1])}, anéis de ${formatInt(LEVELS[0] ?? 0)} em ${formatInt(LEVELS[0] ?? 0)}`;
  const outside = data.filter(isOutside);
  const outsideList = joinPhrases(outside.map((row) => row.phrase));
  const summary = `Gráfico de radar de ${subject} em ${String(data.length)} dimensões, índice de 0 a 100, sobre a faixa de ${formatInt(teamSize)} executivos do time. ${
    outsideList ? `Sai da faixa em ${outsideList}.` : 'Fica dentro da faixa em todas as dimensões.'
  }`;

  /* Tick próprio com tspan: o nome longo quebra em duas linhas e o bloco cresce para fora do eixo. */
  const renderAngleTick = (props: AngleTickProps): ReactElement => {
    const { cx = 0, cy = 0, radius = 0, payload } = props;
    const index = payload?.index ?? -1;
    const row = data[index];
    if (!row) return <g />;
    const { dx, dy } = axisDirection(index, data.length);
    const px = cx + (radius + LABEL_GAP) * dx;
    const py = cy + (radius + LABEL_GAP) * dy;
    const lines = wrapName(row.label);
    const blockHeight = lines.length * LINE_HEIGHT;
    const firstY = dy < -SIDE_EPS ? py - blockHeight : dy > SIDE_EPS ? py : py - blockHeight / 2;
    return (
      <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor={anchorFor(dx)} x={px} y={firstY + LINE_HEIGHT / 2}>
        {lines.map((line, i) => (
          <tspan dy={i === 0 ? 0 : LINE_HEIGHT} key={line} x={px}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  /* A coroa é um path só com fill-rule evenodd: contorno externo (máximo) e interno (mínimo) viram
   * o anel, e o miolo fica vazado. Pintar o mínimo com a cor do cartão taparia a grade. */
  const renderBand = (props: BandProps): ReactElement => {
    const { points, baseLinePoints } = props;
    if (!points || !baseLinePoints) return <g />;
    return <path d={`${ring(points)}${ring(baseLinePoints)}`} fill={BAND_COLOR} fillRule="evenodd" stroke={BAND_EDGE_COLOR} strokeWidth={1} />;
  };

  const renderDot = (props: DotProps): ReactElement => {
    const { cx, cy, index } = props;
    const row = index === undefined ? undefined : data[index];
    if (cx === undefined || cy === undefined || !row) return <g />;
    // Fora da faixa: vazado (cor do cartão por dentro). Dentro: cheio.
    return isOutside(row) ? (
      <circle cx={cx} cy={cy} fill={HALO_COLOR} r={DOT_RADIUS_OUTSIDE} stroke={SERIES_COLOR} strokeWidth={2} />
    ) : (
      <circle cx={cx} cy={cy} fill={SERIES_COLOR} r={DOT_RADIUS} stroke={HALO_COLOR} strokeWidth={1.5} />
    );
  };

  /* O LabelList do Radar entrega caixa de tamanho zero (REC-34): o valor sai pela coordenada do
   * vértice, empurrado para fora ao longo do eixo, e só nas dimensões fora da faixa. */
  const renderVertexLabel = (props: object): ReactElement => {
    const vertex = readVertex(props);
    const row = vertex === null ? undefined : data[vertex.index];
    if (vertex === null || !row || !isOutside(row)) return <g />;
    const { x, y, index, value } = vertex;
    const { dx, dy } = axisDirection(index, data.length);
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={700} style={{ paintOrder: 'stroke', stroke: HALO_COLOR, strokeWidth: 4 }} textAnchor={anchorFor(dx)} x={x + dx * VALUE_OFFSET} y={y + dy * VALUE_OFFSET}>
        {formatInt(value)}
      </text>
    );
  };

  /* A dica acrescenta o que o corpo não escreve: o valor de toda dimensão e a faixa do time. */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const row: unknown = payload?.[0]?.payload;
    if (!active || !isProcessAxis(row)) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{row.label}</p>
        <p className="text-text-secondary">
          {subject} <span className="kpi-number ml-2 text-text-primary">{formatInt(row.value)}</span>
        </p>
        <p className="text-text-secondary">
          Faixa do time{' '}
          <span className="kpi-number ml-2 text-text-primary">
            {formatInt(row.min)} a {formatInt(row.max)}
          </span>
        </p>
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-center gap-3', className)} role="img" style={style}>
      <ul aria-hidden className="m-0 flex w-36 shrink-0 list-none flex-col gap-3 p-0 text-[11px] font-medium text-text-secondary">
        <li>{scaleNote}</li>
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height="10" width="20">
            <line stroke={SERIES_COLOR} strokeWidth="2" x1="0" x2="20" y1="5" y2="5" />
            <circle cx="10" cy="5" fill={SERIES_COLOR} r="3.5" />
          </svg>
          <span>{subject}</span>
        </li>
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height="10" width="20">
            <circle cx="10" cy="5" fill={HALO_COLOR} r="4" stroke={SERIES_COLOR} strokeWidth="2" />
          </svg>
          <span>Fora da faixa, com valor</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 inline-block h-3 w-5 shrink-0" style={{ backgroundColor: BAND_COLOR, border: `1px solid ${BAND_EDGE_COLOR}` }} />
          <span>Faixa do time, mínimo a máximo de {formatInt(teamSize)} executivos</span>
        </li>
      </ul>
      <div className="h-full min-h-0 min-w-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart accessibilityLayer={false} data={rows} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS}>
            <PolarGrid stroke={GRID_COLOR} zIndex={GRID_Z_INDEX} />
            <PolarAngleAxis axisLine={false} dataKey="label" tick={renderAngleTick} tickLine={false} />
            {/* Sem números sobre o gráfico: a coroa cobre a maior parte da escala e texto sobre ela não passa o piso (ROT-7b). A escala vai escrita na legenda. */}
            <PolarRadiusAxis axisLine={false} domain={DOMAIN} tick={false} tickLine={false} ticks={LEVELS} />
            <Tooltip content={renderTooltip} cursor={false} isAnimationActive={false} />
            <Radar dataKey="range" isAnimationActive={false} legendType="none" shape={renderBand} stroke="none" tooltipType="none" />
            <Radar dataKey="value" dot={renderDot} fill="none" isAnimationActive={animate} label={renderVertexLabel} stroke={SERIES_COLOR} strokeWidth={2.5} zIndex={SERIES_Z_INDEX} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
