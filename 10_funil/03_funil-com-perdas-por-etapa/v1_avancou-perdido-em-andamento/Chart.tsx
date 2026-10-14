import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, BarStack, LabelList, ResponsiveContainer, XAxis, YAxis, type BarShapeProps, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type StageLossRow } from './data';

/**
 * Barra empilhada horizontal por etapa: avançou, perdido e em andamento, sempre na mesma ordem.
 * Cada etapa mostra os três absolutos (entrou, seguiu, saiu) e a taxa de perda nomeia o
 * denominador da própria etapa, nunca o topo do funil: 30% de uma etapa e 30% do topo são
 * números diferentes, e aqui os dois nunca se confundem porque só o primeiro é escrito.
 */
export interface StageLossBarsProps {
  readonly data?: readonly StageLossRow[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 4, right: 158, bottom: 4, left: 0 } as const;
const NAME_AXIS_WIDTH = 96;
const VALUE_LABEL_GAP = 8;
const BAR_MAX = 22;
const STACK_ID = 'etapa';
const STACK_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
const SEGMENT_GAP = 2;
const ADVANCED_FILL = 'var(--positive)';
const LOST_FILL = 'var(--negative)';
const PROGRESS_FILL = 'var(--line-strong)';
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

export default function StageLossBars({ data = defaultData, height, className }: StageLossBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = data;

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma etapa neste recorte: não há funil para mostrar perda por etapa.</span>
      </div>
    );
  }

  const worst = [...rows].sort((a, b) => b.lost / b.entered - a.lost / a.entered)[0];

  const summary = [
    `Gráfico de barras empilhadas com ${String(rows.length)} etapas do funil comercial, cada uma dividida em avançou, perdido e em andamento.`,
    worst ? `Maior taxa de perda: ${worst.stage}, ${formatRateWithVolume(worst.lost, worst.entered)}.` : '',
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
    const tx = Number(x) + Number(width) + VALUE_LABEL_GAP;
    const ty = Number(y) + Number(barHeight) / 2;
    return (
      <text className="font-sans" dominantBaseline="central" x={tx} y={ty}>
        <tspan className="tabular-nums" dy={-LINE_HEIGHT} fill="var(--text-primary)" fontSize={12} fontWeight={600} x={tx}>
          {`${formatInt(row.advanced)} seguiram`}
        </tspan>
        <tspan className="tabular-nums" dy={LINE_HEIGHT} fill="var(--text-primary)" fontSize={12} fontWeight={600} x={tx}>
          {`${formatInt(row.lost)} saíram`}
        </tspan>
        <tspan className="tabular-nums" dy={LINE_HEIGHT} fill="var(--text-muted)" fontSize={11} x={tx}>
          {`perda ${formatRateWithVolume(row.lost, row.entered)}`}
        </tspan>
        <tspan className="tabular-nums" dy={LINE_HEIGHT} fill="var(--text-muted)" fontSize={11} x={tx}>
          {`${formatInt(row.inProgress)} em andamento`}
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {worst ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          Maior taxa de perda: <span className="font-semibold text-text-primary">{worst.stage}</span>, em{' '}
          <span className="kpi-number font-medium text-text-primary">{formatRateWithVolume(worst.lost, worst.entered)}</span>
        </p>
      ) : null}
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: ADVANCED_FILL }} />
          Avançou
        </li>
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: LOST_FILL }} />
          Perdido
        </li>
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
              <Bar dataKey="lost" fill={LOST_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Perdido" shape={segmentShape(LOST_FILL)} />
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
