import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, platformA as defaultA, platformB as defaultB, type Platform, type PlatformAxis } from './data';

/**
 * Radar comparativo de duas plataformas em índice de 0 a 100: a B preenchida e a A em contorno
 * tracejado, para ler em quais indicadores a B entrega um perfil melhor e onde fica a maior lacuna.
 */
export interface PlatformComparisonRadarProps {
  readonly data?: readonly PlatformAxis[];
  /** A referência, em contorno tracejado. */
  readonly platformA?: Platform;
  /** O foco, preenchido. */
  readonly platformB?: Platform;
  readonly height?: number;
  readonly className?: string;
}

/** A cor vem do slot da categoria no dado, nunca da posição no array (COR-3). */
const SLOT_COLOR: Readonly<Record<number, string>> = { 1: 'var(--chart-1)', 3: 'var(--chart-3)' };
const GRID_COLOR = 'var(--line-subtle)';
const HALO_COLOR = 'var(--surface-raised)';
const DOMAIN: [number, number] = [0, 100];
const LEVELS = [25, 50, 75, 100];
const SCALE_CLEAR = 8;
const HORIZONTAL_SIN = 0.5;
const OUTER_RADIUS = '68%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
const LABEL_GAP = 10;
const LINE_HEIGHT = 14;
const NAME_WRAP_AT = 14;
const SIDE_EPS = 0.3;
const REFERENCE_DASH = '3 3';
/* ACE-5: o mínimo de --chart-3 para a área composta ficar em 3:1 no tema claro é 0,66. */
const FILL_OPACITY = 0.66;
/** Área em 100 (padrão), grade em 150, contorno da referência em 250: a A sobe acima da área da B. */
const GRID_Z_INDEX = 150;
const REFERENCE_Z_INDEX = 250;
const SIDE_COLUMN = 'w-40';

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

/** Eixo de maior distância absoluta entre as duas plataformas, ou null quando a lista é vazia. */
function widestGap(rows: readonly PlatformAxis[]): PlatformAxis | null {
  let best: PlatformAxis | null = null;
  for (const row of rows) {
    if (best === null || Math.abs(row.b - row.a) > Math.abs(best.b - best.a)) best = row;
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

/** O valor original de uma plataforma: custo em reais inteiros, taxa sempre com o volume (DAD-1). */
function rawText(row: PlatformAxis, raw: number, leads: number): string {
  return row.kind === 'cost' ? formatCurrency(raw, 0) : formatRateWithVolume(raw, leads);
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

function isPlatformAxis(value: unknown): value is PlatformAxis {
  return typeof value === 'object' && value !== null && 'kind' in value && 'label' in value && 'aRaw' in value;
}

/** Junta em frase: "a e b" ou "a, b e c". Lista vazia devolve null, nunca texto vazio disfarçado. */
function joinPhrases(items: readonly string[]): string | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0] ?? null;
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1] ?? ''}`;
}

export default function PlatformComparisonRadar({ data = defaultData, platformA = defaultA, platformB = defaultB, height, className }: PlatformComparisonRadarProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const colorA = SLOT_COLOR[platformA.slot] ?? 'var(--chart-1)';
  const colorB = SLOT_COLOR[platformB.slot] ?? 'var(--chart-3)';

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: as plataformas não têm indicadores medidos no mês.</span>
      </div>
    );
  }

  const spot = scaleSpot(data.map((row) => Math.max(row.a, row.b)));
  const widest = widestGap(data);
  const ahead = data.filter((row) => row.b > row.a).length;
  const costList = joinPhrases(data.filter((row) => row.kind === 'cost').map((row) => row.phrase));
  const gapText = widest ? `${widest.phrase}, ${platformA.name} ${formatInt(widest.a)} e ${platformB.name} ${formatInt(widest.b)}` : '';
  const ruleText = costList ? `Índice de ${formatInt(DOMAIN[0])} a ${formatInt(DOMAIN[1])}, maior é melhor. Em ${costList} o custo menor dá o índice maior.` : `Índice de ${formatInt(DOMAIN[0])} a ${formatInt(DOMAIN[1])}, maior é melhor.`;

  const summary = `Gráfico de radar de ${platformB.name} contra ${platformA.name} em ${formatInt(data.length)} indicadores, índice de 0 a 100. ${platformB.name} fica à frente em ${formatInt(ahead)}; a maior lacuna é ${gapText}.`;

  /* O rótulo do eixo é posicionado por conta própria: o Text do Recharts ancora o bloco pelo setor e
   * empurra o nome para dentro do polígono nos eixos do topo e da base. O índice da B vai em
   * destaque e o da A, entre parênteses, em tom discreto. */
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
            {formatInt(row.b)}
          </tspan>
          <tspan fill="var(--text-muted)" fontWeight={500}>
            {` (${formatInt(row.a)})`}
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
    /* GEO-15: perto da horizontal os anéis ficam em linhas coladas (passo menor que o número mais dois
     * recuos), então só o nível de fora é escrito e cada número fica a 4 px do anel dele. */
    if (Math.abs(Math.sin((spot.angle * Math.PI) / 180)) < HORIZONTAL_SIN && level < DOMAIN[1]) return <g />;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} fontWeight={500} style={{ paintOrder: 'stroke', stroke: HALO_COLOR, strokeWidth: 4 }} textAnchor={onLeft ? 'end' : 'start'} x={onLeft ? x - 4 : x + 4} y={y}>
        {formatInt(level)}
      </text>
    );
  };

  /* A dica acrescenta o que o corpo não escreve: o valor original de cada plataforma, em R$ ou em
   * taxa com o volume. */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const row: unknown = payload?.[0]?.payload;
    if (!active || !isPlatformAxis(row)) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{row.label}</p>
        <p className="text-text-secondary">
          {platformA.name} <span className="kpi-number ml-2 text-text-primary">{formatInt(row.a)}</span>{' '}
          <span className="kpi-number text-text-muted">{rawText(row, row.aRaw, platformA.leads)}</span>
        </p>
        <p className="text-text-secondary">
          {platformB.name} <span className="kpi-number ml-2 text-text-primary">{formatInt(row.b)}</span>{' '}
          <span className="kpi-number text-text-muted">{rawText(row, row.bRaw, platformB.leads)}</span>
        </p>
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-center gap-3', className)} role="img" style={style}>
      <div aria-hidden className={cn('flex shrink-0 flex-col gap-3 text-[11px] font-medium text-text-secondary', SIDE_COLUMN)}>
        <p className="m-0">{ruleText}</p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          <li className="flex items-center gap-2">
            <svg className="shrink-0" height="10" width="20">
              <line stroke={colorA} strokeDasharray={REFERENCE_DASH} strokeWidth="2" x1="0" x2="20" y1="5" y2="5" />
            </svg>
            <span>{platformA.name}, entre parênteses</span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="shrink-0" height="10" width="20">
              <rect fill={colorB} fillOpacity={FILL_OPACITY} height="8" stroke={colorB} strokeWidth="1.5" width="18" x="1" y="1" />
            </svg>
            <span>{platformB.name}</span>
          </li>
        </ul>
        <p className="m-0 text-text-primary">
          Maior lacuna: {gapText}.
        </p>
      </div>
      <div className="h-full min-h-0 min-w-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart accessibilityLayer={false} data={[...data]} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS}>
            <PolarGrid gridType="circle" stroke={GRID_COLOR} zIndex={GRID_Z_INDEX} />
            <PolarAngleAxis axisLine={false} dataKey="label" tick={renderAngleTick} tickLine={false} />
            <PolarRadiusAxis angle={spot?.angle ?? 0} axisLine={false} domain={DOMAIN} tick={renderScaleTick} tickLine={false} ticks={LEVELS} />
            <Tooltip content={renderTooltip} cursor={false} isAnimationActive={false} />
            {/* A referência antes do foco no JSX; o zIndex a puxa para cima da área da B. */}
            <Radar dataKey="a" dot={false} fill="none" isAnimationActive={animate} legendType="none" name={platformA.name} stroke={colorA} strokeDasharray={REFERENCE_DASH} strokeWidth={2} zIndex={REFERENCE_Z_INDEX} />
            <Radar
              dataKey="b"
              dot={{ r: 3, fill: colorB, fillOpacity: 1, stroke: HALO_COLOR, strokeWidth: 1 }}
              fill={colorB}
              fillOpacity={FILL_OPACITY}
              isAnimationActive={animate}
              legendType="none"
              name={platformB.name}
              stroke={colorB}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
