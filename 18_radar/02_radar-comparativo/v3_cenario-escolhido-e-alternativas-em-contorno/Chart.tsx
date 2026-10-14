import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, scenarios as defaultScenarios, type LeverRow, type Scenarios } from './data';

/**
 * Radar do plano de 2027: o cenário base preenchido e os cenários pessimista e otimista só em
 * contorno, que juntos formam a faixa em que o plano pode cair, em seis alavancas de 0 a 100.
 */
export interface ScenarioRadarProps {
  readonly data?: readonly LeverRow[];
  readonly scenarios?: Scenarios;
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
const OUTER_RADIUS = '68%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
const LABEL_GAP = 10;
const LINE_HEIGHT = 14;
const NAME_WRAP_AT = 14;
const SIDE_EPS = 0.3;
/** Pessimista tracejado e otimista pontilhado: o padrão do traço separa os dois sem depender da cor. */
const LOW_DASH = '6 4';
const HIGH_DASH = '1 4';
/* ACE-5: o mínimo de --chart-1 para a área composta ficar em 3:1 no tema claro é 0,66. */
const FILL_OPACITY = 0.66;
/** Área em 100 (padrão), grade em 150, contornos das alternativas em 250. */
const GRID_Z_INDEX = 150;
const OUTLINE_Z_INDEX = 250;

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

/** Alavanca em que o cenário base fica mais colado ao pessimista, ou null quando a lista é vazia. */
function tightestOverLow(rows: readonly LeverRow[]): LeverRow | null {
  let best: LeverRow | null = null;
  for (const row of rows) {
    if (best === null || row.base - row.low < best.base - best.low) best = row;
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

/** Junta em frase: "a e b" ou "a, b e c". Lista vazia devolve null. */
function joinPhrases(items: readonly string[]): string | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0] ?? null;
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1] ?? ''}`;
}

function isLeverRow(value: unknown): value is LeverRow {
  return typeof value === 'object' && value !== null && 'low' in value && 'high' in value && 'label' in value;
}

export default function ScenarioRadar({ data = defaultData, scenarios = defaultScenarios, height, className }: ScenarioRadarProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const lowColor = SLOT_COLOR[scenarios.low.slot] ?? 'var(--chart-3)';
  const baseColor = SLOT_COLOR[scenarios.base.slot] ?? 'var(--chart-1)';
  const highColor = SLOT_COLOR[scenarios.high.slot] ?? 'var(--chart-6)';
  const low = scenarios.low.name.toLowerCase();

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: o plano não tem alavancas com cenário calculado.</span>
      </div>
    );
  }

  const spot = scaleSpot(data.map((row) => row.high));
  const tightest = tightestOverLow(data);
  const closerToLow = data.filter((row) => row.base - row.low < row.high - row.base).length;
  const tightText = tightest ? `${tightest.phrase}, ${formatInt(tightest.base - tightest.low)} pontos` : '';

  const invertedList = joinPhrases(data.filter((row) => row.inverted === true).map((row) => row.phrase));
  const ruleText = invertedList ? `Índice de ${formatInt(DOMAIN[0])} a ${formatInt(DOMAIN[1])} contra a meta, maior é melhor; em ${invertedList} o menor valor dá o índice maior.` : `Índice de ${formatInt(DOMAIN[0])} a ${formatInt(DOMAIN[1])} contra a meta, maior é melhor.`;
  const invertedSummary = invertedList ? ` Em ${invertedList} o índice é invertido.` : '';

  const summary = `Gráfico de radar do cenário ${scenarios.base.name.toLowerCase()} entre os cenários ${low} e ${scenarios.high.name.toLowerCase()} em ${formatInt(data.length)} alavancas do plano, índice de 0 a 100.${invertedSummary} O ${scenarios.base.name.toLowerCase()} fica mais perto do ${low} em ${formatInt(closerToLow)}; a menor folga é ${tightText}.`;
  const readingLine = `Base mais perto do ${low} em ${formatInt(closerToLow)} de ${formatInt(data.length)} alavancas. Entre ${low} e base, a menor folga é ${tightText}.`;

  /* O rótulo do eixo é posicionado por conta própria: o Text do Recharts ancora o bloco pelo setor e
   * empurra o nome para dentro do polígono nos eixos do topo e da base. O índice do base vai em
   * destaque e a faixa do pessimista ao otimista, entre parênteses, em tom discreto. */
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
    const names = wrapName(row.label);
    const blockHeight = (names.length + 1) * LINE_HEIGHT;
    // sin < 0 é o topo da tela: o bloco cresce para cima; o equador centraliza.
    const firstY = sin < -SIDE_EPS ? py - blockHeight : sin > SIDE_EPS ? py : py - blockHeight / 2;
    return (
      <g>
        {names.map((line, i) => (
          <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} key={line} textAnchor={anchor} x={px} y={firstY + (i + 0.5) * LINE_HEIGHT}>
            {line}
          </text>
        ))}
        <text className="font-display" dominantBaseline="central" fontSize={11} textAnchor={anchor} x={px} y={firstY + (names.length + 0.5) * LINE_HEIGHT}>
          <tspan fill="var(--text-primary)" fontSize={12} fontWeight={600}>
            {formatInt(row.base)}
          </tspan>
          <tspan fill="var(--text-muted)" fontWeight={500}>
            {` (${formatInt(row.low)} a ${formatInt(row.high)})`}
          </tspan>
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
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} fontWeight={500} style={{ paintOrder: 'stroke', stroke: HALO_COLOR, strokeWidth: 4 }} textAnchor={onLeft ? 'end' : 'start'} x={onLeft ? x - 4 : x + 4} y={y}>
        {formatInt(level)}
      </text>
    );
  };

  /* A dica lista os três cenários da alavanca, do otimista ao pessimista: a ordem em que as linhas
   * se empilham de fora para dentro. */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const row: unknown = payload?.[0]?.payload;
    if (!active || !isLeverRow(row)) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{row.label}</p>
        <p className="text-text-secondary">
          {scenarios.high.name} <span className="kpi-number ml-2 text-text-primary">{formatInt(row.high)}</span>
        </p>
        <p className="text-text-secondary">
          {scenarios.base.name} <span className="kpi-number ml-2 font-semibold text-text-primary">{formatInt(row.base)}</span>
        </p>
        <p className="text-text-secondary">
          {scenarios.low.name} <span className="kpi-number ml-2 text-text-primary">{formatInt(row.low)}</span>
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
            <line stroke={lowColor} strokeDasharray={LOW_DASH} strokeWidth="2" x1="0" x2="20" y1="5" y2="5" />
          </svg>
          <span>{scenarios.low.name}</span>
        </li>
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height="10" width="20">
            <rect fill={baseColor} fillOpacity={FILL_OPACITY} height="8" stroke={baseColor} strokeWidth="1.5" width="18" x="1" y="1" />
          </svg>
          <span>{scenarios.base.name}, o escolhido</span>
        </li>
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height="10" width="20">
            <line stroke={highColor} strokeDasharray={HIGH_DASH} strokeLinecap="round" strokeWidth="2" x1="1" x2="19" y1="5" y2="5" />
          </svg>
          <span>{scenarios.high.name}</span>
        </li>
        <li>Base e, entre parênteses, a faixa dos dois. {ruleText}</li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart accessibilityLayer={false} data={[...data]} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS}>
            {/* Sem raios: a linha fina de 2 px do contorno não some sobre a grade no tema escuro. */}
            <PolarGrid gridType="circle" radialLines={false} stroke={GRID_COLOR} zIndex={GRID_Z_INDEX} />
            <PolarAngleAxis axisLine={false} dataKey="label" tick={renderAngleTick} tickLine={false} />
            <PolarRadiusAxis angle={spot?.angle ?? 0} axisLine={false} domain={DOMAIN} tick={renderScaleTick} tickLine={false} ticks={LEVELS} />
            <Tooltip content={renderTooltip} cursor={false} isAnimationActive={false} />
            <Radar dataKey="low" dot={{ r: 3, fill: lowColor, fillOpacity: 1, stroke: HALO_COLOR, strokeWidth: 1 }} fill="none" isAnimationActive={animate} legendType="none" name={scenarios.low.name} stroke={lowColor} strokeDasharray={LOW_DASH} strokeWidth={2} zIndex={OUTLINE_Z_INDEX} />
            <Radar dataKey="high" dot={{ r: 3, fill: highColor, fillOpacity: 1, stroke: HALO_COLOR, strokeWidth: 1 }} fill="none" isAnimationActive={animate} legendType="none" name={scenarios.high.name} stroke={highColor} strokeDasharray={HIGH_DASH} strokeLinecap="round" strokeWidth={2} zIndex={OUTLINE_Z_INDEX} />
            <Radar
              dataKey="base"
              dot={{ r: 3, fill: baseColor, fillOpacity: 1, stroke: HALO_COLOR, strokeWidth: 1 }}
              fill={baseColor}
              fillOpacity={FILL_OPACITY}
              isAnimationActive={animate}
              legendType="none"
              name={scenarios.base.name}
              stroke={baseColor}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
