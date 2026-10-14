import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  BarStack,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  stages as defaultStages,
  stalledAfterDays,
  type ActiveStageDefinition,
  type ActiveStageKey,
  type StalledPipelineRow,
} from './data';

/**
 * Barras empilhadas horizontais com o segmento parado sempre na base, em cor de aviso, e os
 * estágios em andamento em neutro graduado atrás dele. A ordenação é pelo próprio segmento
 * parado, não pelo total: quem mais precisa de ação nesta semana aparece primeiro.
 */
export interface StalledPipelineBarsProps {
  readonly data?: readonly StalledPipelineRow[];
  readonly stages?: readonly ActiveStageDefinition[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 0, right: 152, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 108;
const VALUE_LABEL_GAP = 6;
const BAR_MAX = 18;
const STACK_ID = 'pipeline';
const STACK_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
const SEGMENT_GAP = 2;
const CURSOR = { fill: 'var(--line-subtle)' } as const;
const STALLED_FILL = 'var(--warning)';
const ACTIVE_FILL = 'var(--line-strong)';
/** Opacidade cresce da base para a ponta: negociação, mais perto de fechar, fica mais sólida. */
const ACTIVE_OPACITY: Record<ActiveStageKey, number> = { discovery: 0.35, proposal: 0.6, negotiation: 0.85 };

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

interface RankedRow extends StalledPipelineRow {
  readonly total: number;
}

function segmentShape(fill: string, opacity: number) {
  return ({ x, y, width, height, stackedBarStart }: BarShapeProps): ReactElement => {
    const gap = x - stackedBarStart > 0.5 ? SEGMENT_GAP : 0;
    const drawnWidth = width - gap;
    if (drawnWidth <= 0 || height <= 0) return <g />;
    return <rect fill={fill} fillOpacity={opacity} height={height} width={drawnWidth} x={x + gap} y={y} />;
  };
}

export default function StalledPipelineBars({
  data = defaultData,
  stages = defaultStages,
  height,
  className,
}: StalledPipelineBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows: RankedRow[] = data
    .map((row) => ({ ...row, total: row.stalled + stages.reduce((sum, stage) => sum + row[stage.key], 0) }))
    .sort((a, b) => b.stalled - a.stalled || a.name.localeCompare(b.name, 'pt-BR'));
  const teamTotal = rows.reduce((sum, row) => sum + row.total, 0);
  const teamStalled = rows.reduce((sum, row) => sum + row.stalled, 0);

  const leader = rows[0];
  if (!leader || teamTotal <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade aberta neste recorte: não há pipeline para separar entre parado e ativo.</span>
      </div>
    );
  }

  const leaderPct = leader.total > 0 ? leader.stalled / leader.total : 0;
  const teamPct = teamTotal > 0 ? teamStalled / teamTotal : 0;

  const summary = `Gráfico de barras empilhadas com o pipeline aberto de ${String(rows.length)} executivos, ordenado pelo valor parado há mais de ${String(stalledAfterDays)} dias. ${leader.name} lidera com ${formatCurrencyCompact(leader.stalled)} parado, ${formatPercent(leaderPct, 0)} do próprio pipeline. No time, ${formatPercent(teamPct, 0)} do pipeline está parado.`;

  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );

  const renderTail = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const pct = row.total > 0 ? row.stalled / row.total : 0;
    const baseX = Number(x) + Number(width) + VALUE_LABEL_GAP;
    const rowY = Number(y) + Number(barHeight) / 2;
    return (
      <text dominantBaseline="central" fontSize={12} x={baseX} y={rowY}>
        <tspan className="font-display" fill="var(--text-secondary)" fontWeight={500}>
          {formatCurrencyCompact(row.total)}
        </tspan>
        <tspan className="font-display" dx={6} fill={row.stalled > 0 ? 'var(--warning)' : 'var(--text-muted)'} fontSize={11} fontWeight={600}>
          {formatPercent(pct, 0)}
        </tspan>
        <tspan className="font-sans" dx={2} fill="var(--text-muted)" fontSize={11}>
          {' parado'}
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{leader.name}</span> lidera em parado, com{' '}
        <span className="kpi-number font-medium text-warning">{formatCurrencyCompact(leader.stalled)}</span>; no time,{' '}
        <span className="kpi-number font-medium text-text-primary">{formatPercent(teamPct, 0)}</span> do pipeline está parado
      </p>
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary" key="stalled">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: STALLED_FILL }} />
          {`Parado há mais de ${String(stalledAfterDays)} dias`}
        </li>
        {stages.map((stage) => (
          <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary" key={stage.key}>
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: ACTIVE_FILL, opacity: ACTIVE_OPACITY[stage.key] }}
            />
            {stage.label}
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="34%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, 'dataMax']} hide type="number" />
            <YAxis axisLine={false} dataKey="name" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip showTotal valueFormat="currencyCompact" />} cursor={CURSOR} isAnimationActive={false} />
            <BarStack radius={STACK_RADIUS} stackId={STACK_ID}>
              <Bar
                dataKey="stalled"
                fill={STALLED_FILL}
                isAnimationActive={animate}
                maxBarSize={BAR_MAX}
                name="Parado"
                shape={segmentShape(STALLED_FILL, 1)}
              />
              {stages.map((stage, index) => (
                <Bar
                  dataKey={stage.key}
                  isAnimationActive={animate}
                  key={stage.key}
                  maxBarSize={BAR_MAX}
                  name={stage.label}
                  shape={segmentShape(ACTIVE_FILL, ACTIVE_OPACITY[stage.key])}
                >
                  {index === stages.length - 1 ? <LabelList content={renderTail} /> : null}
                </Bar>
              ))}
            </BarStack>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
