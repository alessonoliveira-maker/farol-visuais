import { Filter, Info } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, dimensions as defaultDimensions, type Dimension, type LeadSource } from './data';

/**
 * Radar pequeno por origem de lead, com teto de miniaturas. Acima do teto a grade mostra as origens
 * de maior volume, e um aviso diz quantas ficaram fora e qual visual serve ao recorte inteiro.
 */
export interface SourceRadarGridProps {
  readonly data?: readonly LeadSource[];
  /** Eixos na ordem do registry, a mesma em todas as miniaturas. */
  readonly dimensions?: readonly Dimension[];
  readonly height?: number;
  readonly className?: string;
}

/** Acima disto a miniatura fica pequena demais para ler o perfil (12 em seis colunas de cerca de 140 px). */
const MAX_MINIATURES = 12;
const GRID_COLUMNS = 6;
const SERIES_COLOR = 'var(--chart-1)';
const GRID_COLOR = 'var(--line-subtle)';
const MUTED_COLOR = 'var(--text-muted)';
const DOMAIN: [number, number] = [0, 100];
const RINGS = [50, 100];
const OUTER_RADIUS = '70%';
const CHART_MARGIN = { top: 4, right: 4, bottom: 4, left: 4 };
/** Distância, em px, do anel externo até o número do eixo. */
const NUMBER_GAP = 11;
/** Preenchimento mínimo da --chart-1 para a área passar de 3:1 no tema claro (ACE-5). */
const FILL_OPACITY = 0.66;

/** Soma dos valores; lista vazia devolve null, nunca zero. */
function sumOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0);
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

function MiniRadar({ source, dimensions, animate }: { readonly source: LeadSource; readonly dimensions: readonly Dimension[]; readonly animate: boolean }) {
  const count = dimensions.length;
  const rows: readonly MiniRow[] = dimensions.map((dimension, i) => ({ label: dimension.label, value: source.scores[i] ?? 0 }));

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

  /* A dica acrescenta o nome do eixo e o valor exato, que a miniatura não escreve. */
  const renderTooltip = ({ active, payload }: TipProps): ReactElement | null => {
    const row: unknown = payload?.[0]?.payload;
    if (!active || !isMiniRow(row)) return null;
    return (
      <div className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg" data-slot="chart-tooltip">
        <p className="mb-1 font-medium text-text-primary">{source.name}</p>
        <p className="text-text-secondary">
          {row.label} <span className="kpi-number ml-2 text-text-primary">{formatInt(row.value)}</span>
        </p>
      </div>
    );
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-col">
      <span className="text-xs leading-tight font-medium text-text-secondary">{source.name}</span>
      <span className="text-xs leading-tight text-text-muted">
        <span className="kpi-number text-text-primary">{formatInt(source.leads)}</span> leads
      </span>
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

export default function SourceRadarGrid({ data = defaultData, dimensions = defaultDimensions, height, className }: SourceRadarGridProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não entrou lead no mês.</span>
      </div>
    );
  }

  /* Das origens com mais leads para as com menos; o empate se desfaz pelo nome para a ordem não mudar entre renders. */
  const ordered = [...data].sort((a, b) => b.leads - a.leads || a.name.localeCompare(b.name, 'pt-BR'));
  const shown = ordered.slice(0, MAX_MINIATURES);
  const hidden = ordered.slice(MAX_MINIATURES);
  const hiddenLeads = sumOf(hidden.map((source) => source.leads));
  const first = shown[0];
  const rowCount = Math.ceil(shown.length / GRID_COLUMNS);

  const summary =
    hidden.length > 0
      ? `Recorte com ${String(data.length)} origens de lead, acima do teto de ${String(MAX_MINIATURES)} miniaturas: a grade mostra as ${String(shown.length)} com mais leads, com os mesmos ${String(dimensions.length)} eixos e escala de ${formatInt(DOMAIN[0])} a ${formatInt(DOMAIN[1])}, e deixa ${String(hidden.length)} de fora.`
      : `Grade com ${String(shown.length)} radares de origens de lead, com os mesmos ${String(dimensions.length)} eixos e a mesma escala de ${formatInt(DOMAIN[0])} a ${formatInt(DOMAIN[1])}.${first ? ` A maior origem é ${first.name}, com ${formatInt(first.leads)} leads.` : ''}`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="group" style={style}>
      {hidden.length > 0 ? (
        <p className="flex shrink-0 items-start gap-2 text-xs font-medium text-text-secondary" role="status">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-text-muted" />
          <span>
            O recorte traz <span className="kpi-number text-text-primary">{formatInt(data.length)}</span> origens e a grade tem teto de{' '}
            <span className="kpi-number text-text-primary">{formatInt(MAX_MINIATURES)}</span> miniaturas. Aparecem as {formatInt(shown.length)} com mais leads; as outras{' '}
            <span className="kpi-number text-text-primary">{formatInt(hidden.length)}</span>
            {hiddenLeads === null ? '' : <>, com <span className="kpi-number text-text-primary">{formatInt(hiddenLeads)}</span> leads,</>} ficam fora. Para comparar o recorte inteiro, use a
            tabela com heatmap nas células, modelo <span className="kpi-number">14/02</span>.
          </span>
        </p>
      ) : null}
      <div aria-hidden className="flex min-h-0 flex-1 flex-col gap-2">
        <ul className="m-0 flex shrink-0 list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-xs text-text-secondary">
          {dimensions.map((dimension, i) => (
            <li key={dimension.id}>
              <span className="font-display mr-1 text-text-muted">{formatInt(i + 1)}</span>
              {dimension.label}
            </li>
          ))}
          <li className="text-text-muted">
            Ordenadas pelo volume de leads; escala de {formatInt(DOMAIN[0])} a {formatInt(DOMAIN[1])}, igual em todas, e o anel externo é {formatInt(DOMAIN[1])}.
          </li>
        </ul>
        <div
          className="grid min-h-0 flex-1 gap-3"
          style={{ gridTemplateColumns: `repeat(${String(GRID_COLUMNS)}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${String(rowCount)}, minmax(0, 1fr))` }}
        >
          {shown.map((source) => (
            <MiniRadar animate={animate} dimensions={dimensions} key={source.id} source={source} />
          ))}
        </div>
      </div>
    </div>
  );
}
