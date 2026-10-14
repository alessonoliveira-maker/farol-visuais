import { Filter } from 'lucide-react';
import { useId, type ReactElement } from 'react';
import { Bar, BarChart, BarStack, LabelList, ResponsiveContainer, XAxis, YAxis, type BarShapeProps, type LabelProps } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type StageUnknownLossRow } from './data';

/**
 * Barra empilhada horizontal por etapa, com o perdido dividido em três motivos conhecidos e um
 * segmento hachurado "sem motivo registrado": lacuna de cadastro, nunca um motivo real, sempre
 * separada e com a fração nomeada sobre o próprio perdido da etapa.
 */
export interface StageUnknownLossBarsProps {
  readonly data?: readonly StageUnknownLossRow[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 4, right: 182, bottom: 4, left: 0 } as const;
const NAME_AXIS_WIDTH = 96;
const VALUE_LABEL_GAP = 8;
const BAR_MAX = 22;
const STACK_ID = 'etapa';
const STACK_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
const SEGMENT_GAP = 1.5;
const ADVANCED_FILL = 'var(--positive)';
const PROGRESS_FILL = 'var(--line-strong)';
const NO_PROFILE_FILL = CHART_SERIES_COLORS[0] ?? 'var(--chart-1)';
const TIMING_FILL = CHART_SERIES_COLORS[2] ?? 'var(--chart-3)';
const COMPETITION_FILL = CHART_SERIES_COLORS[5] ?? 'var(--chart-6)';
const LINE_HEIGHT = 15;

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

function segmentShape(fill: string) {
  return ({ x, y, width, height, stackedBarStart }: BarShapeProps): ReactElement => {
    const gap = x - stackedBarStart > 0.5 ? SEGMENT_GAP : 0;
    const drawnWidth = width - gap;
    if (drawnWidth <= 0 || height <= 0) return <g />;
    return <rect fill={fill} height={height} width={drawnWidth} x={x + gap} y={y} />;
  };
}

export default function StageUnknownLossBars({ data = defaultData, height, className }: StageUnknownLossBarsProps) {
  const animate = useAnimateOnce();
  const patternId = useId();
  const style = height === undefined ? undefined : { height };
  const rows = data;

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma etapa neste recorte: não há perda para separar por cobertura de motivo.</span>
      </div>
    );
  }

  const lostOf = (row: StageUnknownLossRow): number => row.noProfile + row.timing + row.competition + row.noReason;
  const totalLost = rows.reduce((sum, row) => sum + lostOf(row), 0);
  const totalNoReason = rows.reduce((sum, row) => sum + row.noReason, 0);

  const summary = [
    `Gráfico de barras empilhadas com ${String(rows.length)} etapas do funil comercial, o perdido de cada uma dividido entre motivo conhecido e sem motivo registrado.`,
    `No total, ${formatRateWithVolume(totalNoReason, totalLost)} das perdas não têm motivo registrado.`,
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
    const tx = Number(x) + Number(width) + VALUE_LABEL_GAP;
    const ty = Number(y) + Number(barHeight) / 2;
    return (
      <text className="font-sans" dominantBaseline="central" x={tx} y={ty}>
        <tspan className="tabular-nums" dy={-LINE_HEIGHT} fill="var(--text-primary)" fontSize={12} fontWeight={600} x={tx}>
          {`${formatInt(row.advanced)} seguiram, ${formatInt(lost)} perdidos`}
        </tspan>
        <tspan className="tabular-nums" dy={LINE_HEIGHT} fill="var(--text-muted)" fontSize={11} x={tx}>
          {`sem motivo ${formatRateWithVolume(row.noReason, lost)}`}
        </tspan>
        <tspan className="tabular-nums" dy={LINE_HEIGHT} fill="var(--text-muted)" fontSize={11} x={tx}>
          {`${formatInt(row.inProgress)} em andamento`}
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        Sem motivo registrado:{' '}
        <span className="kpi-number font-medium text-text-primary">{formatRateWithVolume(totalNoReason, totalLost)}</span> das perdas do
        trimestre
      </p>
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: ADVANCED_FILL }} />
          Avançou
        </li>
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: NO_PROFILE_FILL }} />
          Sem perfil
        </li>
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: TIMING_FILL }} />
          Timing
        </li>
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: COMPETITION_FILL }} />
          Concorrência
        </li>
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary">
          <svg aria-hidden className="size-2.5 shrink-0 rounded-[2px]" viewBox="0 0 10 10">
            <rect fill="var(--surface-raised)" height={10} width={10} />
            <rect fill={`url(#${patternId}-legend)`} height={10} width={10} />
          </svg>
          Sem motivo registrado
          <svg aria-hidden height={0} width={0}>
            <defs>
              <pattern height={4} id={`${patternId}-legend`} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={4}>
                <line stroke="var(--line-strong)" strokeWidth={1.4} x1={0} x2={0} y1={0} y2={4} />
              </pattern>
            </defs>
          </svg>
        </li>
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: PROGRESS_FILL }} />
          Em andamento
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="30%" data={rows} layout="vertical" margin={MARGIN}>
            <defs>
              <pattern height={4} id={patternId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={4}>
                <rect fill="var(--surface-raised)" height={4} width={4} />
                <line stroke="var(--line-strong)" strokeWidth={1.4} x1={0} x2={0} y1={0} y2={4} />
              </pattern>
            </defs>
            <XAxis dataKey="entered" domain={[0, 'dataMax']} hide type="number" />
            <YAxis axisLine={false} dataKey="stage" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            <BarStack radius={STACK_RADIUS} stackId={STACK_ID}>
              <Bar dataKey="advanced" fill={ADVANCED_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Avançou" shape={segmentShape(ADVANCED_FILL)} />
              <Bar dataKey="noProfile" fill={NO_PROFILE_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Sem perfil" shape={segmentShape(NO_PROFILE_FILL)} />
              <Bar dataKey="timing" fill={TIMING_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Timing" shape={segmentShape(TIMING_FILL)} />
              <Bar dataKey="competition" fill={COMPETITION_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Concorrência" shape={segmentShape(COMPETITION_FILL)} />
              <Bar dataKey="noReason" fill={`url(#${patternId})`} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Sem motivo registrado" shape={segmentShape(`url(#${patternId})`)} />
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
