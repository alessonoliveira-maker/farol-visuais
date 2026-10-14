import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, dimensions as defaultDimensions, type Dimension, type SdrProfile } from './data';

/**
 * Um radar pequeno por SDR numa grade de quatro colunas, todos com os mesmos seis eixos, a mesma
 * ordem e o mesmo domínio de 0 a 100. A repetição troca a sobreposição: o olho compara forma
 * contra forma, e o valor exato mora na dica.
 */
export interface SdrRadarGridProps {
  readonly data?: readonly SdrProfile[];
  /** Eixos na ordem do registry, a mesma em todas as miniaturas. */
  readonly dimensions?: readonly Dimension[];
  readonly height?: number;
  readonly className?: string;
}

const SERIES_COLOR = 'var(--chart-1)';
const GRID_COLOR = 'var(--line-subtle)';
const MUTED_COLOR = 'var(--text-muted)';
const DOMAIN: [number, number] = [0, 100];
const RINGS = [50, 100];
const GRID_COLUMNS = 4;
const OUTER_RADIUS = '72%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
/** Distância, em px, do anel externo até o número do eixo. */
const NUMBER_GAP = 11;
/** Preenchimento mínimo da --chart-1 para a área passar de 3:1 no tema claro (ACE-5). */
const FILL_OPACITY = 0.66;

/** Média dos eixos; lista vazia devolve null, nunca zero. */
function meanOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Direção do eixo `index` na tela: o primeiro no topo, sentido horário (startAngle 90 do Recharts). */
function axisDirection(index: number, count: number): { readonly dx: number; readonly dy: number } {
  const rad = ((90 - (index * 360) / count) * Math.PI) / 180;
  return { dx: Math.cos(rad), dy: -Math.sin(rad) };
}

interface MiniRow {
  readonly label: string;
  readonly value: number;
}

interface RankedProfile {
  readonly profile: SdrProfile;
  readonly mean: number | null;
  readonly rows: readonly MiniRow[];
}

interface AngleTickProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly radius?: number;
  readonly payload?: { readonly index?: number };
}

interface TipProps {
  readonly active?: boolean;
  readonly payload?: readonly { readonly payload?: unknown }[];
}

function isMiniRow(value: unknown): value is MiniRow {
  return typeof value === 'object' && value !== null && 'label' in value && 'value' in value;
}

function MiniRadar({ ranked, count, animate }: { readonly ranked: RankedProfile; readonly count: number; readonly animate: boolean }) {
  const { profile, mean, rows } = ranked;

  /* Só o número do eixo: o nome mora na legenda comum, e repeti-lo oito vezes encheria cada miniatura de texto. */
  const renderAngleTick = (props: AngleTickProps): ReactElement => {
    const { cx = 0, cy = 0, radius = 0, payload } = props;
    const index = payload?.index ?? -1;
    if (index < 0) return <g />;
    const { dx, dy } = axisDirection(index, count);
    return (
      <text className="font-display" dominantBaseline="central" fill={MUTED_COLOR} fontSize={11} fontWeight={500} textAnchor="middle" x={cx + (radius + NUMBER_GAP) * dx} y={cy + (radius + NUMBER_GAP) * dy}>
        {formatInt(index + 1)}
      </text>
    );
  };

  /* A dica acrescenta o nome do eixo e o valor exato, que a miniatura não escreve. */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const row: unknown = payload?.[0]?.payload;
    if (!active || !isMiniRow(row)) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{profile.name}</p>
        <p className="text-text-secondary">
          {row.label} <span className="kpi-number ml-2 text-text-primary">{formatInt(row.value)}</span>
        </p>
      </div>
    );
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <div className="flex shrink-0 items-baseline gap-2">
        <span className="text-xs leading-tight font-medium text-text-secondary">{profile.name}</span>
        <span className="kpi-number shrink-0 text-xs font-semibold text-text-primary">{mean === null ? '' : formatInt(Math.round(mean))}</span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart accessibilityLayer={false} data={[...rows]} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS}>
            <PolarGrid gridType="circle" stroke={GRID_COLOR} />
            <PolarAngleAxis axisLine={false} dataKey="label" tick={renderAngleTick} tickLine={false} />
            <PolarRadiusAxis axisLine={false} domain={DOMAIN} tick={false} tickLine={false} ticks={RINGS} />
            <Tooltip content={renderTooltip} cursor={false} filterNull={false} isAnimationActive={false} />
            <Radar activeDot={false} dataKey="value" dot={false} fill={SERIES_COLOR} fillOpacity={FILL_OPACITY} isAnimationActive={animate} stroke={SERIES_COLOR} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function SdrRadarGrid({ data = defaultData, dimensions = defaultDimensions, height, className }: SdrRadarGridProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum SDR neste recorte: não há perfil para comparar no trimestre.</span>
      </div>
    );
  }

  /* Do maior índice médio ao menor; o empate se desfaz pelo nome para a ordem não mudar entre renders. */
  const ranked: readonly RankedProfile[] = data
    .map((profile) => ({
      profile,
      mean: meanOf(profile.scores),
      rows: dimensions.map((dimension, i) => ({ label: dimension.label, value: profile.scores[i] ?? 0 })),
    }))
    .sort((a, b) => (b.mean ?? -1) - (a.mean ?? -1) || a.profile.name.localeCompare(b.profile.name, 'pt-BR'));

  const first = ranked[0];
  const last = ranked[ranked.length - 1];
  const rowCount = Math.ceil(ranked.length / GRID_COLUMNS);
  const rounded = (item: RankedProfile | undefined): string => (item?.mean == null ? '' : formatInt(Math.round(item.mean)));

  const summary =
    `Grade com ${String(ranked.length)} radares de SDRs, um por pessoa, com os mesmos ${String(dimensions.length)} eixos e a mesma escala de ${formatInt(DOMAIN[0])} a ${formatInt(DOMAIN[1])}, ordenados pelo índice médio.` +
    (first && last && first !== last ? ` O maior índice médio é de ${first.profile.name}, com ${rounded(first)}, e o menor é de ${last.profile.name}, com ${rounded(last)}.` : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        Ordenados pelo índice médio, do maior ao menor; o número ao lado do nome é esse índice
        {first && last && first !== last ? (
          <>
            : <span className="kpi-number text-text-primary">{first.profile.name}</span> abre com <span className="kpi-number text-text-primary">{rounded(first)}</span> e{' '}
            <span className="kpi-number text-text-primary">{last.profile.name}</span> fecha com <span className="kpi-number text-text-primary">{rounded(last)}</span>.
          </>
        ) : (
          '.'
        )}
      </p>
      <ul aria-hidden className="m-0 flex shrink-0 list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs text-text-secondary">
        {dimensions.map((dimension, i) => (
          <li key={dimension.id}>
            <span className="font-display mr-1 text-text-muted">{formatInt(i + 1)}</span>
            {dimension.label}
          </li>
        ))}
        <li className="text-text-muted">Escala de {formatInt(DOMAIN[0])} a {formatInt(DOMAIN[1])}, igual em todas; o anel externo é {formatInt(DOMAIN[1])}.</li>
      </ul>
      <div
        className="grid min-h-0 flex-1 gap-3"
        style={{ gridTemplateColumns: `repeat(${String(GRID_COLUMNS)}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${String(rowCount)}, minmax(0, 1fr))` }}
      >
        {ranked.map((item) => (
          <MiniRadar animate={animate} count={dimensions.length} key={item.profile.id} ranked={item} />
        ))}
      </div>
    </div>
  );
}
