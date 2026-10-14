import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, type BarShapeProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, limiarDentro, limiarPerto, type EtapaMeta } from './data';

/**
 * Realizado por etapa da semana da pré-vendas contra a meta semanal de cada etapa, com a barra
 * colorida pela faixa de atingimento: dentro da meta, perto dela ou abaixo. A meta é da própria
 * etapa dentro da semana, nunca a meta do resultado final de handoff aceito.
 */
export interface FunnelWithTargetBandProps {
  readonly data?: readonly EtapaMeta[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 4, right: 172, bottom: 4, left: 0 } as const;
const NAME_AXIS_WIDTH = 118;
const BAR_MAX = 22;
const BAR_CATEGORY_GAP = '32%';
const VALUE_LABEL_GAP = 10;
const TARGET_OVERSHOOT = 5;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

function bandFill(rate: number, limiarDentroValue: number, limiarPertoValue: number): string {
  if (rate >= limiarDentroValue) return 'var(--positive)';
  if (rate >= limiarPertoValue) return 'var(--warning)';
  return 'var(--negative)';
}

function bandLabel(rate: number, limiarDentroValue: number, limiarPertoValue: number): string {
  if (rate >= limiarDentroValue) return 'dentro da meta';
  if (rate >= limiarPertoValue) return 'perto da meta';
  return 'abaixo da meta';
}

export default function FunnelWithTargetBand({ data = defaultData, height, className }: FunnelWithTargetBandProps) {
  const animate = useAnimateOnce();
  const rows = data;
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma etapa neste recorte: sem meta nem realizado para comparar.</span>
      </div>
    );
  }

  const domainMax = Math.ceil((Math.max(...rows.map((row) => row.meta)) * 1.08) / 10) * 10;
  const withRate = rows.map((row) => ({ ...row, rate: row.meta > 0 ? row.realizado / row.meta : 0 }));
  const belowCount = withRate.filter((row) => row.rate < limiarPerto).length;
  const worst = withRate.reduce((acc, row) => (row.rate < acc.rate ? row : acc), withRate[0]!);

  const summary =
    `Gráfico de barras horizontal com o funil da pré-vendas na semana contra a meta de cada etapa, ` +
    `colorido pela faixa de atingimento. ${String(belowCount)} de ${String(rows.length)} etapas ficam abaixo de ` +
    `${formatPercent(limiarPerto)} da própria meta; a mais distante é ${worst.etapa}, com ${formatInt(worst.realizado)} de ${formatInt(worst.meta)}.`;

  const reading = 'Meta por etapa, dentro da semana; não é a meta do resultado final de handoff aceito.';

  const renderBar = (props: BarShapeProps): ReactElement | null => {
    const row = props.payload as EtapaMeta | undefined;
    if (!row) return null;
    const x = Number(props.x);
    const y = Number(props.y);
    const width = Number(props.width);
    const barHeight = Number(props.height);
    const bg = props.background;
    const trackX = Number(bg?.x ?? x);
    const trackWidth = Number(bg?.width ?? width);
    const targetX = trackX + trackWidth * Math.min(1, row.meta / domainMax);
    const rate = row.meta > 0 ? row.realizado / row.meta : 0;
    const labelX = trackX + trackWidth + VALUE_LABEL_GAP;
    const midY = y + barHeight / 2;
    return (
      <g>
        <rect fill={bandFill(rate, limiarDentro, limiarPerto)} height={barHeight} rx={3} ry={3} width={width} x={x} y={y} />
        <line stroke="var(--text-primary)" strokeWidth={2} x1={targetX} x2={targetX} y1={y - TARGET_OVERSHOOT} y2={y + barHeight + TARGET_OVERSHOOT} />
        <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={500} style={HALO} x={labelX} y={midY}>
          {formatRateWithVolume(row.realizado, row.meta)}
        </text>
      </g>
    );
  };

  const legendItems = [
    { fill: 'var(--positive)', label: `${bandLabel(1, limiarDentro, limiarPerto)}, ${formatPercent(limiarDentro)} ou mais` },
    { fill: 'var(--warning)', label: `${bandLabel(limiarPerto, limiarDentro, limiarPerto)}, ${formatPercent(limiarPerto)} a ${formatPercent(0.99)}` },
    { fill: 'var(--negative)', label: `${bandLabel(0, limiarDentro, limiarPerto)}, abaixo de ${formatPercent(limiarPerto)}` },
  ];

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {reading}
      </p>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        {legendItems.map((item) => (
          <li className="flex items-center gap-2.5" key={item.label}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: item.fill }} />
            {item.label}
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis dataKey="realizado" domain={[0, domainMax]} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="etapa"
              interval={0}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Bar background={{ fill: 'var(--surface-sunken)' }} dataKey="realizado" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
