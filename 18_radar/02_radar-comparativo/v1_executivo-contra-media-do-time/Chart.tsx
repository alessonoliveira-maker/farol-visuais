import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, subject as defaultSubject, teamSize as defaultTeamSize, type ProcessAxis } from './data';

/**
 * Radar comparativo: um executivo preenchido sobre a média do time em tracejado, na mesma escala
 * fixa de 0 a 100, para ler em que dimensões a forma dele se afasta da média e por quantos pontos.
 */
export interface TeamComparisonRadarProps {
  readonly data?: readonly ProcessAxis[];
  /** Quem o perfil descreve, escrito como entra no meio de uma frase. */
  readonly subject?: string;
  /** Quantos executivos formam a média. */
  readonly teamSize?: number;
  readonly height?: number;
  readonly className?: string;
}

const SERIES_COLOR = 'var(--chart-1)';
const REFERENCE_COLOR = 'var(--text-muted)';
const GRID_COLOR = 'var(--line-subtle)';
const HALO_COLOR = 'var(--surface-raised)';
const DOMAIN: [number, number] = [0, 100];
const LEVELS = [25, 50, 75, 100];
const SCALE_CLEAR = 8;
const OUTER_RADIUS = '72%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
const LABEL_GAP = 10;
const LINE_HEIGHT = 14;
const NAME_WRAP_AT = 14;
const SIDE_EPS = 0.3;
const REFERENCE_DASH = '3 3';
/* ACE-5: o mínimo de --chart-1 para a área composta ficar em 3:1 no tema claro é 0,66. */
const FILL_OPACITY = 0.66;
/** Ordem de pintura: área em 100 (padrão), grade em 150, média em 250. A média fica acima da área
 * porque, com 0,66 de preenchimento, o tracejado sob o foco sumiria onde o executivo passa dela. */
const GRID_Z_INDEX = 150;
const REFERENCE_Z_INDEX = 250;

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

/** Diferença com sinal à mão sobre o valor absoluto: "+6" ou "−12" (menos tipográfico). */
function signed(diff: number): string {
  return `${diff > 0 ? '+' : diff < 0 ? '−' : ''}${formatInt(Math.abs(diff))}`;
}

/** Eixo de maior distância absoluta entre o foco e a média, ou null quando a lista é vazia. */
function widestGap(rows: readonly ProcessAxis[]): ProcessAxis | null {
  let best: ProcessAxis | null = null;
  for (const row of rows) {
    if (best === null || Math.abs(row.value - row.reference) > Math.abs(best.value - best.reference)) best = row;
  }
  return best;
}

/** O vão do polígono maior (foco ou média, o que chega mais longe em cada eixo) onde ele chega
 * menos longe: os números da escala vão nesse ângulo e só nos níveis acima de `floor`, porque texto
 * sobre a área não passa o piso de contraste (ROT-7b). */
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

function isProcessAxis(value: unknown): value is ProcessAxis {
  return typeof value === 'object' && value !== null && 'reference' in value && 'label' in value && 'value' in value;
}

export default function TeamComparisonRadar({ data = defaultData, subject = defaultSubject, teamSize = defaultTeamSize, height, className }: TeamComparisonRadarProps) {
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

  const spot = scaleSpot(data.map((row) => Math.max(row.value, row.reference)));
  const widest = widestGap(data);
  const above = data.filter((row) => row.value > row.reference).length;
  const widestText = widest ? `${widest.phrase}, ${signed(widest.value - widest.reference)} pontos` : '';

  const summary = `Gráfico de radar de ${subject} contra a média de ${formatInt(teamSize)} executivos em ${formatInt(data.length)} dimensões, índice de 0 a 100. Fica acima da média em ${formatInt(above)} delas; a maior distância é ${widestText}.`;
  const readingLine = `Acima da média em ${formatInt(above)} de ${formatInt(data.length)} dimensões. Maior distância: ${widestText}.`;

  /* O rótulo do eixo é posicionado por conta própria: o Text do Recharts ancora o bloco pelo setor e
   * empurra o nome para dentro do polígono nos eixos do topo e da base. O valor do foco vai em
   * destaque e o da média, entre parênteses, em tom discreto. */
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
            {formatInt(row.value)}
          </tspan>
          <tspan fill="var(--text-muted)" fontWeight={500}>
            {` (${formatInt(row.reference)})`}
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

  /* A dica acrescenta o que o corpo não escreve: a diferença em pontos, com sinal, em cada dimensão. */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const row: unknown = payload?.[0]?.payload;
    if (!active || !isProcessAxis(row)) return null;
    const diff = row.value - row.reference;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{row.label}</p>
        <p className="text-text-secondary">
          {subject} <span className="kpi-number ml-2 text-text-primary">{formatInt(row.value)}</span>
        </p>
        <p className="text-text-secondary">
          Média do time <span className="kpi-number ml-2 text-text-primary">{formatInt(row.reference)}</span>
        </p>
        <p className="mt-1 border-t border-line-subtle pt-1 text-text-secondary">
          Diferença <span className="kpi-number ml-2 font-semibold text-text-primary">{signed(diff)} pontos</span>
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
            <rect fill={SERIES_COLOR} fillOpacity={FILL_OPACITY} height="8" stroke={SERIES_COLOR} strokeWidth="1.5" width="18" x="1" y="1" />
          </svg>
          <span>{subject}</span>
        </li>
        <li className="flex items-center gap-2">
          <svg className="shrink-0" height="10" width="20">
            <line stroke={REFERENCE_COLOR} strokeDasharray={REFERENCE_DASH} strokeWidth="2" x1="0" x2="20" y1="5" y2="5" />
          </svg>
          <span>Média dos {formatInt(teamSize)} executivos, entre parênteses</span>
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart accessibilityLayer={false} data={[...data]} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS}>
            <PolarGrid gridType="circle" stroke={GRID_COLOR} zIndex={GRID_Z_INDEX} />
            <PolarAngleAxis axisLine={false} dataKey="label" tick={renderAngleTick} tickLine={false} />
            <PolarRadiusAxis angle={spot?.angle ?? 0} axisLine={false} domain={DOMAIN} tick={renderScaleTick} tickLine={false} ticks={LEVELS} />
            <Tooltip content={renderTooltip} cursor={false} isAnimationActive={false} />
            {/* Referência antes do foco no JSX, como o catálogo pede; o zIndex a puxa para cima da área. */}
            <Radar dataKey="reference" dot={false} fill="none" isAnimationActive={animate} legendType="none" stroke={REFERENCE_COLOR} strokeDasharray={REFERENCE_DASH} strokeWidth={2} zIndex={REFERENCE_Z_INDEX} />
            <Radar
              dataKey="value"
              dot={{ r: 3, fill: SERIES_COLOR, fillOpacity: 1, stroke: HALO_COLOR, strokeWidth: 1 }}
              fill={SERIES_COLOR}
              fillOpacity={FILL_OPACITY}
              isAnimationActive={animate}
              legendType="none"
              stroke={SERIES_COLOR}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
