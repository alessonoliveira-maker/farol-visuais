import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { campaignWindow as defaultCampaignWindow, data as defaultData, type WeeklyLeads } from './data';

/** Uma coluna por semana, com a janela em que uma campanha esteve no ar marcada no fundo. */
export interface CampaignColumnsProps {
  readonly data?: readonly WeeklyLeads[];
  readonly campaignWindow?: { readonly startWeek: string; readonly endWeek: string };
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 40, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 32;
const BAR_CATEGORY_GAP = '30%';
/**
 * ESP-6, série única: passo = disponível / categorias; espessura = passo × 0,4.
 * Corpo do cartão ≈ 574 px; disponível ≈ 574 − 32 (eixo) − 8 (margem) = 534; passo ≈ 33,4 para
 * 16 semanas; espessura ≈ 13,4 px. maxBarSize fecha nesse valor, acima do piso de 12 px.
 */
const BAR_MAX = 13;

export default function CampaignColumns({
  data = defaultData,
  campaignWindow = defaultCampaignWindow,
  height,
  className,
}: CampaignColumnsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não houve entrada de leads registrada no período.</span>
      </div>
    );
  }

  const byWeek = new Map(data.map((row) => [row.week, row]));
  const startIndex = data.findIndex((row) => row.week === campaignWindow.startWeek);
  const endIndex = data.findIndex((row) => row.week === campaignWindow.endWeek);
  const inWindow = startIndex >= 0 && endIndex >= startIndex ? data.slice(startIndex, endIndex + 1) : [];
  const windowTotal = inWindow.reduce((sum, row) => sum + row.leads, 0);
  const start = byWeek.get(campaignWindow.startWeek);

  const summary = [
    `Gráfico de colunas com leads semanais em ${formatInt(data.length)} semanas.`,
    start
      ? `Uma campanha ficou no ar de ${campaignWindow.startWeek}, com início em ${formatDate(start.weekStart)}, até ${campaignWindow.endWeek}.`
      : '',
    inWindow.length > 0 ? `Nessa janela entraram ${formatInt(windowTotal)} leads.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderWindowLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly width?: number; readonly y?: number } }): ReactElement => (
    <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) / 2} y={(viewBox?.y ?? 0) - 26}>
      <tspan className="font-sans">campanha no ar, </tspan>
      <tspan className="font-display">{formatInt(windowTotal)}</tspan>
      <tspan className="font-sans"> leads</tspan>
    </text>
  );

  const renderStartLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number } }): ReactElement => (
    <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x ?? 0} y={(viewBox?.y ?? 0) - 8}>
      <tspan className="font-sans">início </tspan>
      <tspan className="font-display">{start ? formatDate(start.weekStart) : ''}</tspan>
    </text>
  );

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    if (!props.active || !props.payload) return null;
    const week = typeof props.label === 'string' ? props.label : '';
    const row = byWeek.get(week);
    const label = row ? `${week}, semana de ${formatDate(row.weekStart)}` : week;
    const payload = props.payload.map((entry) => ({
      ...entry,
      name: typeof entry.name === 'string' ? entry.name : String(entry.name ?? ''),
      value: typeof entry.value === 'number' || typeof entry.value === 'string' ? entry.value : String(entry.value ?? ''),
    }));
    return <ChartTooltip active={props.active} label={label} payload={payload} valueFormat="int" />;
  };

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...data]} margin={MARGIN}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          {inWindow.length > 0 ? (
            <ReferenceArea
              fill="var(--surface-sunken)"
              ifOverflow="visible"
              label={renderWindowLabel}
              x1={campaignWindow.startWeek}
              x2={campaignWindow.endWeek}
            />
          ) : null}
          {start ? (
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderStartLabel}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              x={campaignWindow.startWeek}
            />
          ) : null}
          <XAxis {...AXIS_PROPS} axisLine={false} dataKey="week" interval={1} tickMargin={8} />
          <YAxis {...AXIS_PROPS} allowDecimals={false} axisLine={false} domain={[0, 'dataMax']} tickCount={4} tickFormatter={formatInt} width={VALUE_AXIS_WIDTH} />
          <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
          <Bar dataKey="leads" fill="var(--chart-1)" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
