import { Filter } from 'lucide-react';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, dimensions as defaultDimensions, highlightId as defaultHighlightId, type Dimension, type SdrProfile } from './data';

/**
 * Um radar pequeno por SDR com a média do time em contorno tracejado, a mesma em todas as
 * miniaturas. O título conta quantos eixos ficam abaixo da média; clicar numa miniatura diz quais.
 */
export interface SdrVersusTeamProps {
  readonly data?: readonly SdrProfile[];
  /** Eixos na ordem do registry, a mesma em todas as miniaturas. */
  readonly dimensions?: readonly Dimension[];
  /** Miniatura que abre selecionada. */
  readonly highlightId?: string;
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
const MEAN_DASH = '3 3';
/** Revestimento do tracejado: o fundo do cartão por baixo da média, para ela não se perder no preenchimento (TOK-4). */
const HALO_COLOR = 'var(--surface-raised)';
const HALO_WIDTH = 4;

/** Média dos valores; lista vazia devolve null, nunca zero. */
function meanOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Junta em frase: "a, b e c". Lista vazia devolve null, nunca texto vazio disfarçado. */
function joinPhrases(items: readonly string[]): string | null {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0] ?? null;
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1] ?? ''}`;
}

/** Direção do eixo `index` na tela: o primeiro no topo, sentido horário (startAngle 90 do Recharts). */
function axisDirection(index: number, count: number): { readonly dx: number; readonly dy: number } {
  const rad = ((90 - (index * 360) / count) * Math.PI) / 180;
  return { dx: Math.cos(rad), dy: -Math.sin(rad) };
}

function signed(diff: number): string {
  return `${diff < 0 ? '−' : diff > 0 ? '+' : ''}${formatInt(Math.abs(diff))}`;
}

interface MiniRow {
  readonly label: string;
  readonly value: number;
  readonly mean: number;
}

interface RankedProfile {
  readonly profile: SdrProfile;
  readonly mean: number | null;
  readonly rows: readonly MiniRow[];
  /** Posição, de 0, dos eixos em que o SDR fica abaixo da média do time. */
  readonly below: readonly number[];
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
  return typeof value === 'object' && value !== null && 'label' in value && 'value' in value && 'mean' in value;
}

interface MiniProps {
  readonly ranked: RankedProfile;
  readonly count: number;
  readonly animate: boolean;
  readonly selected: boolean;
  readonly worst: boolean;
  readonly onToggle: () => void;
}

function MiniRadar({ ranked, count, animate, selected, worst, onToggle }: MiniProps) {
  const { profile, rows, below } = ranked;

  /* Só o número do eixo: o nome mora na legenda comum. */
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

  /* A dica acrescenta o nome do eixo, o valor exato e a distância até a média, que a miniatura não escreve. */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const row: unknown = payload?.[0]?.payload;
    if (!active || !isMiniRow(row)) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{profile.name}</p>
        <p className="text-text-secondary">
          {row.label} <span className="kpi-number ml-2 text-text-primary">{formatInt(row.value)}</span>
        </p>
        <p className="text-text-secondary">
          Média do time <span className="kpi-number ml-2 text-text-primary">{formatInt(row.mean)}</span>
          <span className="kpi-number ml-2 text-text-muted">{signed(row.value - row.mean)}</span>
        </p>
      </div>
    );
  };

  return (
    <button
      aria-pressed={selected}
      className={cn(
        'flex min-h-0 min-w-0 cursor-pointer flex-col rounded-md px-2 py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'border bg-transparent',
        selected ? 'border-line-strong' : 'border-transparent',
      )}
      onClick={onToggle}
      type="button"
    >
      <span className="text-xs leading-tight font-medium text-text-secondary">{profile.name}</span>
      <span className={cn('text-xs leading-tight tabular-nums', worst ? 'font-bold text-text-primary' : 'font-medium text-text-muted')}>
        {formatInt(below.length)} de {formatInt(count)} eixos abaixo da média
      </span>
      <span className="min-h-0 w-full flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadarChart accessibilityLayer={false} data={[...rows]} margin={CHART_MARGIN} outerRadius={OUTER_RADIUS}>
            <PolarGrid gridType="circle" stroke={GRID_COLOR} />
            <PolarAngleAxis axisLine={false} dataKey="label" tick={renderAngleTick} tickLine={false} />
            <PolarRadiusAxis axisLine={false} domain={DOMAIN} tick={false} tickLine={false} ticks={RINGS} />
            <Tooltip content={renderTooltip} cursor={false} filterNull={false} isAnimationActive={false} />
            <Radar activeDot={false} dataKey="value" dot={false} fill={SERIES_COLOR} fillOpacity={FILL_OPACITY} isAnimationActive={animate} stroke={SERIES_COLOR} strokeWidth={2} />
            <Radar activeDot={false} dataKey="mean" dot={false} fill="none" isAnimationActive={animate} legendType="none" stroke={HALO_COLOR} strokeWidth={HALO_WIDTH} />
            <Radar activeDot={false} dataKey="mean" dot={false} fill="none" isAnimationActive={animate} stroke={MUTED_COLOR} strokeDasharray={MEAN_DASH} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </span>
    </button>
  );
}

export default function SdrVersusTeam({ data = defaultData, dimensions = defaultDimensions, highlightId = defaultHighlightId, height, className }: SdrVersusTeamProps) {
  const animate = useAnimateOnce();
  const [selectedId, setSelectedId] = useState<string | null>(highlightId);
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum SDR neste recorte: não há média do time para comparar no trimestre.</span>
      </div>
    );
  }

  /* A média do time sai uma vez por eixo, fora do map das miniaturas, e é a mesma em todas. */
  const teamMean: readonly (number | null)[] = dimensions.map((_, i) => meanOf(data.flatMap((profile) => (profile.scores[i] === undefined ? [] : [profile.scores[i] ?? 0]))));
  const shownMean = teamMean.map((value) => (value === null ? null : Math.round(value)));

  /* Mais eixos abaixo da média primeiro; o empate cai para o menor índice médio e depois para o nome, para a ordem não mudar entre renders. */
  const ranked: readonly RankedProfile[] = data
    .map((profile) => {
      const rows = dimensions.map((dimension, i) => ({ label: dimension.label, value: profile.scores[i] ?? 0, mean: shownMean[i] ?? 0 }));
      const below = rows.flatMap((row, i) => (row.value < row.mean ? [i] : []));
      return { profile, mean: meanOf(profile.scores), rows, below };
    })
    .sort((a, b) => b.below.length - a.below.length || (a.mean ?? 0) - (b.mean ?? 0) || a.profile.name.localeCompare(b.profile.name, 'pt-BR'));

  const worst = ranked[0];
  const none = ranked.filter((item) => item.below.length === 0).length;
  const selected = ranked.find((item) => item.profile.id === selectedId);
  const axisList = selected
    ? joinPhrases(selected.below.map((i) => `${dimensions[i]?.phrase ?? ''} (${formatInt(i + 1)})`))
    : null;
  const rowCount = Math.ceil(ranked.length / GRID_COLUMNS);

  const summary =
    `Grade com ${String(ranked.length)} radares de SDRs, cada um com a média do time em contorno tracejado, ordenados pelo número de eixos abaixo da média.` +
    (worst ? ` ${worst.profile.name} é o pior caso, com ${formatInt(worst.below.length)} de ${formatInt(dimensions.length)} eixos abaixo, e ${formatInt(none)} SDRs não ficam abaixo em nenhum.` : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        {worst ? (
          <>
            Ordenados pelo número de eixos abaixo da média do time, do maior ao menor: <span className="text-text-primary">{worst.profile.name}</span> abre com{' '}
            <span className="tabular-nums text-text-primary">{formatInt(worst.below.length)} de {formatInt(dimensions.length)}</span>.{' '}
          </>
        ) : null}
        {selected && axisList ? (
          <>
            <span className="text-text-primary">{selected.profile.name}</span> fica abaixo da média em {axisList}.
          </>
        ) : selected ? (
          <>
            <span className="text-text-primary">{selected.profile.name}</span> não fica abaixo da média em nenhum eixo.
          </>
        ) : (
          'Clique numa miniatura para ver em quais eixos o SDR fica abaixo.'
        )}
      </p>
      <ul aria-hidden className="m-0 flex shrink-0 list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-xs text-text-secondary">
        {dimensions.map((dimension, i) => (
          <li key={dimension.id}>
            <span className="font-display mr-1 text-text-muted">{formatInt(i + 1)}</span>
            {dimension.label}
          </li>
        ))}
        <li className="flex items-center gap-1 text-text-muted">
          <svg aria-hidden height="10" width="16">
            <rect fill={SERIES_COLOR} fillOpacity={FILL_OPACITY} height="8" stroke={SERIES_COLOR} strokeWidth="1" width="14" x="1" y="1" />
          </svg>
          SDR
          <svg aria-hidden height="10" width="20">
            <line stroke={MUTED_COLOR} strokeDasharray={MEAN_DASH} strokeWidth="1.5" x1="1" x2="19" y1="5" y2="5" />
          </svg>
          média do time
        </li>
        <li className="text-text-muted">Escala de {formatInt(DOMAIN[0])} a {formatInt(DOMAIN[1])}, igual em todas; o anel externo é {formatInt(DOMAIN[1])}.</li>
      </ul>
      <div
        className="grid min-h-0 flex-1 gap-2"
        style={{ gridTemplateColumns: `repeat(${String(GRID_COLUMNS)}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${String(rowCount)}, minmax(0, 1fr))` }}
      >
        {ranked.map((item) => (
          <MiniRadar
            animate={animate}
            count={dimensions.length}
            key={item.profile.id}
            onToggle={() => setSelectedId((current) => (current === item.profile.id ? null : item.profile.id))}
            ranked={item}
            selected={item.profile.id === selectedId}
            worst={item === worst}
          />
        ))}
      </div>
    </div>
  );
}
