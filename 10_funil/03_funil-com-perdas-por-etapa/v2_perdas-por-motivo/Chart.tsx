import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, BarStack, LabelList, ResponsiveContainer, XAxis, YAxis, type BarShapeProps, type LabelProps } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, motives as defaultMotives, type MotiveDefinition, type MotiveKey, type StageMotiveRow } from './data';

/**
 * Barra empilhada horizontal por etapa: avançou, os cinco motivos de perda em cores categóricas
 * fixas e em andamento por último, sempre na mesma ordem. Cada etapa nomeia o motivo que mais
 * perdeu e a fração que ele representa dentro do próprio perdido da etapa, nunca do topo.
 */
export interface StageMotiveBarsProps {
  readonly data?: readonly StageMotiveRow[];
  readonly motives?: readonly MotiveDefinition[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 4, right: 190, bottom: 4, left: 0 } as const;
const NAME_AXIS_WIDTH = 96;
const VALUE_LABEL_GAP = 8;
const BAR_MAX = 22;
const STACK_ID = 'etapa';
const STACK_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
const SEGMENT_GAP = 1.5;
const ADVANCED_FILL = 'var(--positive)';
const PROGRESS_FILL = 'var(--line-strong)';
const LINE_HEIGHT = 15;

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

function motiveColor(motive: MotiveDefinition): string {
  return CHART_SERIES_COLORS[motive.slot - 1] ?? 'var(--chart-1)';
}

function segmentShape(fill: string) {
  return ({ x, y, width, height, stackedBarStart }: BarShapeProps): ReactElement => {
    const gap = x - stackedBarStart > 0.5 ? SEGMENT_GAP : 0;
    const drawnWidth = width - gap;
    if (drawnWidth <= 0 || height <= 0) return <g />;
    return <rect fill={fill} height={height} width={drawnWidth} x={x + gap} y={y} />;
  };
}

export default function StageMotiveBars({ data = defaultData, motives = defaultMotives, height, className }: StageMotiveBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = data;
  const keys = motives.map((motive) => motive.key);

  if (rows.length === 0 || motives.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma etapa ou nenhum motivo neste recorte: não há o que quebrar por causa da perda.</span>
      </div>
    );
  }

  const lostOf = (row: StageMotiveRow): number => keys.reduce((sum, key) => sum + row[key], 0);
  const topMotiveOf = (row: StageMotiveRow): { readonly motive: MotiveDefinition; readonly value: number } | null =>
    [...motives].map((motive) => ({ motive, value: row[motive.key] })).sort((a, b) => b.value - a.value)[0] ?? null;

  const headline = [...rows]
    .map((row) => ({ row, lost: lostOf(row), top: topMotiveOf(row) }))
    .filter((entry): entry is { row: StageMotiveRow; lost: number; top: { motive: MotiveDefinition; value: number } } => entry.top !== null)
    .sort((a, b) => b.top.value / b.lost - a.top.value / a.lost)[0];

  const summary = [
    `Gráfico de barras empilhadas com ${String(rows.length)} etapas do funil comercial, cada perdido quebrado em ${String(motives.length)} motivos.`,
    headline
      ? `Em ${headline.row.stage}, o motivo líder é ${headline.top.motive.label}, com ${formatRateWithVolume(headline.top.value, headline.lost)}.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text dominantBaseline="central" x={MARGIN.left} y={Number(y)}>
      <tspan className="font-sans" dy={-6} fill="var(--text-primary)" fontSize={12} fontWeight={600} x={MARGIN.left}>
        {String(payload?.value ?? '')}
      </tspan>
      <tspan className="font-sans tabular-nums" dy={15} fill="var(--text-muted)" fontSize={11} x={MARGIN.left}>
        {`${formatInt(rows.find((r) => r.stage === payload?.value)?.entered ?? 0)} entraram`}
      </tspan>
    </text>
  );

  const renderBreakdown = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const lost = lostOf(row);
    const top = topMotiveOf(row);
    const tx = Number(x) + Number(width) + VALUE_LABEL_GAP;
    const ty = Number(y) + Number(barHeight) / 2;
    return (
      <text className="font-sans" dominantBaseline="central" x={tx} y={ty}>
        <tspan className="tabular-nums" dy={-LINE_HEIGHT} fill="var(--text-primary)" fontSize={12} fontWeight={600} x={tx}>
          {`${formatInt(row.advanced)} seguiram, ${formatInt(lost)} perdidos`}
        </tspan>
        {top ? (
          <tspan className="tabular-nums" dy={LINE_HEIGHT} fill="var(--text-muted)" fontSize={11} x={tx}>
            {`${top.motive.label}: ${formatRateWithVolume(top.value, lost)}`}
          </tspan>
        ) : null}
        <tspan className="tabular-nums" dy={LINE_HEIGHT} fill="var(--text-muted)" fontSize={11} x={tx}>
          {`${formatInt(row.inProgress)} em andamento`}
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: ADVANCED_FILL }} />
          Avançou
        </li>
        {motives.map((motive) => (
          <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary" key={motive.key}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: motiveColor(motive) }} />
            {motive.label}
          </li>
        ))}
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: PROGRESS_FILL }} />
          Em andamento
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="30%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis dataKey="entered" domain={[0, 'dataMax']} hide type="number" />
            <YAxis axisLine={false} dataKey="stage" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            <BarStack radius={STACK_RADIUS} stackId={STACK_ID}>
              <Bar dataKey="advanced" fill={ADVANCED_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Avançou" shape={segmentShape(ADVANCED_FILL)} />
              {motives.map((motive) => (
                <Bar
                  dataKey={motive.key as MotiveKey}
                  fill={motiveColor(motive)}
                  isAnimationActive={animate}
                  key={motive.key}
                  maxBarSize={BAR_MAX}
                  name={motive.label}
                  shape={segmentShape(motiveColor(motive))}
                />
              ))}
              <Bar dataKey="inProgress" fill={PROGRESS_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Em andamento" shape={segmentShape(PROGRESS_FILL)}>
                <LabelList content={renderBreakdown} />
              </Bar>
            </BarStack>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
