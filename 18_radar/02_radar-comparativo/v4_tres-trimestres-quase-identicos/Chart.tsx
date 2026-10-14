import { Filter } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Bar, BarChart, LabelList, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, quarters as defaultQuarters, type QueueAxis, type Quarter } from './data';

/**
 * Radar de três trimestres quase idênticos: os contornos se emaranham, então a linha de leitura
 * declara a diferença máxima, a legenda dá foco a um trimestre e o botão troca para barras
 * agrupadas na mesma ordem de eixos.
 */
export interface QuarterRadarProps {
  readonly data?: readonly QueueAxis[];
  readonly quarters?: readonly [Quarter, Quarter, Quarter];
  readonly height?: number;
  readonly className?: string;
}

/** A cor vem do slot da categoria no dado, nunca da posição no array (COR-3). */
const SLOT_COLOR: Readonly<Record<number, string>> = { 1: 'var(--chart-1)', 3: 'var(--chart-3)', 6: 'var(--chart-6)' };
const GRID_COLOR = 'var(--line-subtle)';
const HALO_COLOR = 'var(--surface-raised)';
const DOMAIN: [number, number] = [0, 100];
const LEVELS = [25, 50, 75, 100];
const SCALE_CLEAR = 8;
const OUTER_RADIUS = '74%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
const LABEL_GAP = 10;
const LINE_HEIGHT = 14;
const NAME_WRAP_AT = 14;
const SIDE_EPS = 0.3;
/** Traço por trimestre, para a série se distinguir sem depender só da cor; o raio do ponto cresce
 * para o trimestre mais antigo, e quando as linhas coincidem os pontos ficam concêntricos. */
const DASHES = ['1 4', '6 4', undefined] as const;
const DOT_RADII = [5.5, 4, 2.5] as const;
const STROKE_WIDTHS = [2, 2, 2.5] as const;
/** Opacidade da marca fora de foco: só estado de interação, só na marca, nunca no texto (ACE-4). */
const DIMMED_OPACITY = 0.25;
const GRID_Z_INDEX = 150;
const SERIES_Z_INDEX = 250;
/** Barras: o vão entre categorias é de 10%, e não os 30% da ESP-2, porque com 3 barras por categoria o vão de 30% deixa cada barra com 5 px e o piso é 12 (ESPESSURA-MARCA). */
const BAR_CATEGORY_GAP = '10%';
const BAR_MAX_SIZE = 20;
/** Vão entre as três barras de uma categoria, em pixels. */
const BAR_GAP = 2;
const NAME_AXIS_WIDTH = 128;
const BAR_MARGIN = { top: 4, right: 32, bottom: 4, left: 0 };

type View = 'radar' | 'bars';

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

function maxOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
}

function minOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.min(...values);
}

/** Distância entre o maior e o menor trimestre do eixo, ou null quando o eixo não tem valor. */
function spread(row: QueueAxis): number | null {
  const top = maxOf(row.values);
  const bottom = minOf(row.values);
  return top === null || bottom === null ? null : top - bottom;
}

/** Eixo de maior diferença entre trimestres, ou null quando a lista é vazia. */
function widestSpread(rows: readonly QueueAxis[]): QueueAxis | null {
  let best: QueueAxis | null = null;
  let bestSpread = -1;
  for (const row of rows) {
    const current = spread(row) ?? -1;
    if (current > bestSpread) {
      best = row;
      bestSpread = current;
    }
  }
  return best;
}

/** O vão do polígono maior onde ele chega menos longe: os números da escala vão nesse ângulo e só
 * nos níveis acima de `floor`, porque texto sobre a área não passa o piso de contraste (ROT-7b). */
interface ScaleSpot {
  readonly angle: number;
  readonly floor: number;
}

function scaleSpot(values: readonly number[]): ScaleSpot | null {
  const count = values.length;
  if (count < 3) return null;
  const halfStep = Math.PI / count;
  let best: ScaleSpot | null = null;
  for (let i = 0; i < count; i += 1) {
    const current = values[i] ?? 0;
    const next = values[(i + 1) % count] ?? 0;
    // Distância do centro à aresta entre dois vértices, medida no meio do vão (bissetriz).
    const reach = current + next <= 0 ? 0 : (2 * current * next * Math.cos(halfStep)) / (current + next);
    if (best === null || reach < best.floor) best = { angle: 90 - ((i + 0.5) * 360) / count, floor: reach };
  }
  return best;
}

/** Agrupa os trimestres que têm o mesmo valor no eixo, do maior valor para o menor. */
function coincidences(row: QueueAxis, names: readonly string[]): readonly { readonly value: number; readonly names: readonly string[] }[] {
  const groups: { value: number; names: string[] }[] = [];
  row.values.forEach((value, i) => {
    const name = names[i] ?? '';
    const found = groups.find((group) => group.value === value);
    if (found) found.names.push(name);
    else groups.push({ value, names: [name] });
  });
  return groups.sort((a, b) => b.value - a.value);
}

function joinNames(items: readonly string[]): string {
  if (items.length < 2) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1] ?? ''}`;
}

interface AngleTickProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly radius?: number;
  readonly payload?: { readonly coordinate?: number; readonly index?: number };
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

function isFlatRow(value: unknown): value is { readonly index: number } {
  return typeof value === 'object' && value !== null && 'index' in value && typeof value.index === 'number';
}

interface DotProps {
  readonly cx?: number;
  readonly cy?: number;
}

export default function QuarterRadar({ data = defaultData, quarters = defaultQuarters, height, className }: QuarterRadarProps) {
  const animate = useAnimateOnce();
  const [view, setView] = useState<View>('radar');
  const [focus, setFocus] = useState<number | null>(null);
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: a fila de inbound não tem eixos medidos nos trimestres.</span>
      </div>
    );
  }

  const names = quarters.map((quarter) => quarter.name);
  const colors = quarters.map((quarter) => SLOT_COLOR[quarter.slot] ?? 'var(--chart-1)');
  const rows = data.map((row, index) => ({ index, label: row.label, q0: row.values[0], q1: row.values[1], q2: row.values[2] }));
  const spot = scaleSpot(data.map((row) => maxOf(row.values) ?? 0));
  const widest = widestSpread(data);
  const widestPoints = widest ? spread(widest) : null;
  const allEqual = data.filter((row) => spread(row) === 0).length;
  const dim = (i: number): number => (focus === null || focus === i ? 1 : DIMMED_OPACITY);

  const summary = `${view === 'radar' ? 'Gráfico de radar' : 'Gráfico de barras agrupadas'} do perfil da fila de inbound em ${formatInt(data.length)} eixos nos trimestres ${joinNames(names)}, índice de 0 a 100. A diferença máxima entre trimestres é de ${formatInt(widestPoints ?? 0)} pontos, em ${widest?.phrase ?? ''}.`;
  const readingLine = `Diferença máxima entre trimestres: ${formatInt(widestPoints ?? 0)} pontos, em ${widest?.phrase ?? ''}. Os três coincidem em ${formatInt(allEqual)} de ${formatInt(data.length)} eixos.`;

  /* O rótulo do eixo é posicionado por conta própria: o Text do Recharts ancora o bloco pelo setor e
   * empurra o nome para dentro do polígono nos eixos do topo e da base. */
  const renderAngleTick = (props: AngleTickProps): ReactElement => {
    const { cx = 0, cy = 0, radius = 0, payload } = props;
    const row = payload?.index === undefined ? undefined : data[payload.index];
    const angle = payload?.coordinate ?? 0;
    if (!row) return <g />;
    const rad = (-angle * Math.PI) / 180;
    const px = cx + (radius + LABEL_GAP) * Math.cos(rad);
    const py = cy + (radius + LABEL_GAP) * Math.sin(rad);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const anchor = cos > SIDE_EPS ? 'start' : cos < -SIDE_EPS ? 'end' : 'middle';
    const lines = wrapName(row.label);
    const blockHeight = lines.length * LINE_HEIGHT;
    // sin < 0 é o topo da tela: o bloco cresce para cima; o equador centraliza.
    const firstY = sin < -SIDE_EPS ? py - blockHeight : sin > SIDE_EPS ? py : py - blockHeight / 2;
    return (
      <g>
        {lines.map((line, i) => (
          <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} key={line} textAnchor={anchor} x={px} y={firstY + (i + 0.5) * LINE_HEIGHT}>
            {line}
          </text>
        ))}
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
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} fontWeight={500} style={{ paintOrder: 'stroke', stroke: HALO_COLOR, strokeWidth: 4 }} textAnchor={onLeft ? 'end' : 'start'} x={onLeft ? x - 4 : x + 4} y={y}>
        {formatInt(level)}
      </text>
    );
  };

  /* O ponto de cada trimestre tem raio próprio e leva a opacidade do foco só na marca. */
  const dotFor = (i: number) =>
    function renderDot({ cx, cy }: DotProps): ReactElement {
      if (cx === undefined || cy === undefined) return <g />;
      return <circle cx={cx} cy={cy} fill={colors[i]} fillOpacity={dim(i)} r={DOT_RADII[i] ?? 3} stroke={HALO_COLOR} strokeOpacity={dim(i)} strokeWidth={1} />;
    };

  /* A dica lista os trimestres que coincidem no eixo na mesma linha, do maior valor para o menor. */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const flat: unknown = payload?.[0]?.payload;
    const row = isFlatRow(flat) ? data[flat.index] : undefined;
    if (!active || !row) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{row.label}</p>
        {coincidences(row, names).map((group) => (
          <p className="text-text-secondary" key={group.names.join('|')}>
            {joinNames(group.names)} <span className="kpi-number ml-2 text-text-primary">{formatInt(group.value)}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="group" style={style}>
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        {readingLine}
      </p>
      <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1">
        <ul className="m-0 flex list-none flex-wrap items-center gap-x-1 p-0">
          {quarters.map((quarter, i) => (
            <li key={quarter.name}>
              <button
                className={cn('flex items-center gap-2 rounded-md px-2 py-1 text-[11px] text-text-secondary', focus === i ? 'bg-surface-sunken font-semibold text-text-primary' : 'font-medium')}
                onBlur={() => {
                  setFocus(null);
                }}
                onFocus={() => {
                  setFocus(i);
                }}
                onMouseEnter={() => {
                  setFocus(i);
                }}
                onMouseLeave={() => {
                  setFocus(null);
                }}
                type="button"
              >
                <svg aria-hidden className="shrink-0" height="10" width="20">
                  {view === 'radar' ? (
                    <line stroke={colors[i]} strokeDasharray={DASHES[i]} strokeLinecap="round" strokeWidth="2" x1="1" x2="19" y1="5" y2="5" />
                  ) : (
                    <rect fill={colors[i]} height="8" width="14" x="3" y="1" />
                  )}
                </svg>
                <span>{quarter.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          aria-pressed={view === 'bars'}
          className={cn('ml-auto rounded-md px-2 py-1 text-[11px] font-medium', view === 'bars' ? 'bg-surface-sunken text-text-primary' : 'text-text-secondary')}
          onClick={() => {
            setView(view === 'bars' ? 'radar' : 'bars');
          }}
          type="button"
        >
          Ver como barras
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          {view === 'radar' ? (
            <RadarChart accessibilityLayer={false} data={rows} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS}>
              <PolarGrid gridType="circle" stroke={GRID_COLOR} zIndex={GRID_Z_INDEX} />
              <PolarAngleAxis axisLine={false} dataKey="label" tick={renderAngleTick} tickLine={false} />
              <PolarRadiusAxis angle={spot?.angle ?? 0} axisLine={false} domain={DOMAIN} tick={renderScaleTick} tickLine={false} ticks={LEVELS} />
              <Tooltip content={renderTooltip} cursor={false} isAnimationActive={false} />
              <Radar dataKey="q0" dot={dotFor(0)} fill="none" isAnimationActive={animate} legendType="none" name={names[0]} stroke={colors[0]} strokeDasharray={DASHES[0]} strokeLinecap="round" strokeOpacity={dim(0)} strokeWidth={STROKE_WIDTHS[0]} zIndex={SERIES_Z_INDEX} />
              <Radar dataKey="q1" dot={dotFor(1)} fill="none" isAnimationActive={animate} legendType="none" name={names[1]} stroke={colors[1]} strokeDasharray={DASHES[1]} strokeOpacity={dim(1)} strokeWidth={STROKE_WIDTHS[1]} zIndex={SERIES_Z_INDEX} />
              <Radar dataKey="q2" dot={dotFor(2)} fill="none" isAnimationActive={animate} legendType="none" name={names[2]} stroke={colors[2]} strokeOpacity={dim(2)} strokeWidth={STROKE_WIDTHS[2]} zIndex={SERIES_Z_INDEX} />
            </RadarChart>
          ) : (
            <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} barGap={BAR_GAP} data={rows} layout="vertical" margin={BAR_MARGIN}>
              <XAxis domain={DOMAIN} hide type="number" />
              <YAxis {...AXIS_PROPS} axisLine={false} dataKey="label" interval={0} tickLine={false} tickMargin={8} type="category" width={NAME_AXIS_WIDTH} />
              <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
              {(['q0', 'q1', 'q2'] as const).map((key, i) => (
                <Bar dataKey={key} fill={colors[i]} fillOpacity={dim(i)} isAnimationActive={animate} key={key} maxBarSize={BAR_MAX_SIZE} name={names[i]}>
                  <LabelList className="font-display" dataKey={key} fill="var(--text-secondary)" fontSize={11} formatter={(value: unknown) => formatInt(Number(value))} position="right" />
                </Bar>
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
