import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, subject as defaultSubject, type QualityAxis } from './data';

/**
 * Radar de uma série: perfil de qualidade de uma origem de lead em índice de 0 a 100, com o nome
 * e o valor escritos em cada eixo, para ler onde a origem é forte e onde perde o lead.
 */
export interface QualityRadarProps {
  readonly data?: readonly QualityAxis[];
  /** Nome da origem, escrito como entra no meio de uma frase. */
  readonly subject?: string;
  readonly height?: number;
  readonly className?: string;
}

const SERIES_COLOR = 'var(--chart-1)';
const GRID_COLOR = 'var(--line-subtle)';
const HALO_COLOR = 'var(--surface-raised)';
const DOMAIN: [number, number] = [0, 100];
/** Anéis da grade: quatro níveis, o centro é o zero. */
const LEVELS = [25, 50, 75, 100];
/** Folga, em pontos de índice, entre a borda do polígono e o número da escala. */
const SCALE_CLEAR = 8;
const OUTER_RADIUS = '72%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
/** Respiro entre o fim do eixo e o rótulo, e altura de cada linha do rótulo, em pixels. */
const LABEL_GAP = 10;
const LINE_HEIGHT = 14;
const NAME_WRAP_AT = 14;
/* ACE-5: o mínimo de --chart-1 para a área composta ficar em 3:1 no tema claro é 0,66. A grade sobe
 * acima da área (zIndex) para continuar visível por baixo do preenchimento. */
const FILL_OPACITY = 0.66;
const GRID_Z_INDEX = 150;
const SIDE_EPS = 0.3;

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

/** Maior valor da lista, ou null quando ela é vazia (a ausência é do tipo, não do `if`). */
function maxOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
}

function minOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.min(...values);
}

/** O ponto vazio do polígono: o vão entre dois eixos onde ele chega menos longe. Os números da escala
 * vão nesse ângulo e só nos níveis acima de `floor`, porque texto sobre a área não passa o piso de
 * contraste (ROT-7b) e o halo não resolve texto sobre marca. Valor ausente conta como zero. */
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
  readonly payload?: { readonly coordinate?: number; readonly index?: number };
}

interface ScaleTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly payload?: { readonly value?: number };
}

export default function QualityRadar({ data = defaultData, subject = defaultSubject, height, className }: QualityRadarProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: a origem não tem leads medidos no período.</span>
      </div>
    );
  }

  const values = data.map((row) => row.value);
  const spot = scaleSpot(values);
  const top = maxOf(values);
  const bottom = minOf(values);
  const strongest = data.find((row) => row.value === top);
  const weakest = data.find((row) => row.value === bottom);

  const summary =
    strongest && weakest
      ? `Gráfico de radar com o perfil de qualidade da origem ${subject} em ${String(data.length)} dimensões, índice de 0 a 100. A mais forte é ${strongest.label.toLowerCase()}, com ${formatInt(strongest.value)}; a mais fraca é ${weakest.label.toLowerCase()}, com ${formatInt(weakest.value)}.`
      : '';

  /* O rótulo do eixo é posicionado por conta própria: o Text do Recharts ancora o bloco pelo
   * setor e empurra o nome para dentro do polígono nos eixos do topo e da base. */
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
    const lines = [...wrapName(row.label), formatInt(row.value)];
    const blockHeight = lines.length * LINE_HEIGHT;
    // sin < 0 é o topo da tela: o bloco cresce para cima; o equador centraliza.
    const firstY = sin < -SIDE_EPS ? py - blockHeight : sin > SIDE_EPS ? py : py - blockHeight / 2;
    return (
      <g>
        {lines.map((line, i) => {
          const isValue = i === lines.length - 1;
          return (
            <text
              className={isValue ? 'font-display' : 'font-sans'}
              dominantBaseline="central"
              fill={isValue ? 'var(--text-primary)' : 'var(--text-secondary)'}
              fontSize={isValue ? 12 : 11}
              fontWeight={isValue ? 600 : 500}
              key={line + String(i)}
              textAnchor={anchor}
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

  /* A escala nasce rotacionada pelo ângulo do eixo (transform no tick); o texto é horizontal por
   * contrato (TIP-5), então só x e y são usados e o transform é descartado. */
  const renderScaleTick = (props: ScaleTickProps): ReactElement => {
    const { payload } = props;
    const x = Number(props.x ?? 0);
    const y = Number(props.y ?? 0);
    const level = payload?.value ?? 0;
    if (spot === null || level < spot.floor + SCALE_CLEAR) return <g />;
    const onLeft = Math.cos((spot.angle * Math.PI) / 180) < 0;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-muted)"
        fontSize={11}
        fontWeight={500}
        style={{ paintOrder: 'stroke', stroke: HALO_COLOR, strokeWidth: 4 }}
        textAnchor={onLeft ? 'end' : 'start'}
        x={onLeft ? x - 4 : x + 4}
        y={y}
      >
        {formatInt(level)}
      </text>
    );
  };

  const readingLine =
    strongest && weakest
      ? `Índice de ${formatInt(DOMAIN[0])} a ${formatInt(DOMAIN[1])}. Mais forte: ${strongest.label.toLowerCase()}, ${formatInt(strongest.value)}. Mais fraca: ${weakest.label.toLowerCase()}, ${formatInt(weakest.value)}.`
      : '';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="img" style={style}>
      {strongest && weakest ? (
        <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
          {readingLine}
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart accessibilityLayer={false} data={[...data]} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS}>
            <PolarGrid gridType="circle" stroke={GRID_COLOR} zIndex={GRID_Z_INDEX} />
            <PolarAngleAxis axisLine={false} dataKey="label" tick={renderAngleTick} tickLine={false} />
            <PolarRadiusAxis angle={spot?.angle ?? 0} axisLine={false} domain={DOMAIN} tick={renderScaleTick} tickLine={false} ticks={LEVELS} />
            <Radar
              dataKey="value"
              dot={{ r: 3, fill: SERIES_COLOR, stroke: HALO_COLOR, strokeWidth: 1 }}
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
