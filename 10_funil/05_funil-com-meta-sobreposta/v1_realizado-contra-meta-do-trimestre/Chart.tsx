import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, type BarShapeProps } from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, dataCorte, fracaoDecorrida, type EtapaMeta } from './data';

/**
 * Realizado por etapa do funil comercial contra a meta de cada etapa: a barra é o realizado, o
 * traço vertical é a meta na mesma escala, e o par percentual e absoluto de atingimento fecha a
 * linha. A meta aqui é da própria etapa, nunca a meta do resultado final da última etapa.
 */
export interface FunnelWithTargetProps {
  readonly data?: readonly EtapaMeta[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 4, right: 172, bottom: 4, left: 0 } as const;
const NAME_AXIS_WIDTH = 108;
const BAR_MAX = 22;
const BAR_CATEGORY_GAP = '32%';
const VALUE_LABEL_GAP = 10;
const TARGET_OVERSHOOT = 5;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

export default function FunnelWithTarget({ data = defaultData, height, className }: FunnelWithTargetProps) {
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
  const farthest = withRate.reduce((acc, row) => (row.rate < acc.rate ? row : acc), withRate[0]!);

  const summary =
    `Gráfico de barras horizontal com o funil comercial do trimestre contra a meta de cada etapa, ` +
    `realizado até ${formatDate(dataCorte)}, com ${formatPercent(fracaoDecorrida)} do trimestre decorrido. ` +
    `A etapa mais distante da meta é ${farthest.etapa}, com ${formatInt(farthest.realizado)} de ${formatInt(farthest.meta)}, ${formatPercent(farthest.rate)} da meta da etapa.`;

  const reading = 'Meta por etapa, calculada da taxa histórica dela; não é a meta do resultado final.';
  /** ANO-2, correção 2026-09-18: a fração decorrida só vivia no aria-label; falta base pra ler o corte. */
  const corte = `Corte ${formatDate(dataCorte)}, ${formatPercent(fracaoDecorrida)} do trimestre decorrido`;

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
    const labelX = trackX + trackWidth + VALUE_LABEL_GAP;
    const midY = y + barHeight / 2;
    return (
      <g>
        <rect fill="var(--chart-1)" height={barHeight} rx={3} ry={3} width={width} x={x} y={y} />
        <line
          stroke="var(--text-primary)"
          strokeWidth={2}
          x1={targetX}
          x2={targetX}
          y1={y - TARGET_OVERSHOOT}
          y2={y + barHeight + TARGET_OVERSHOOT}
        />
        <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={12} fontWeight={500} style={HALO} x={labelX} y={midY}>
          {formatRateWithVolume(row.realizado, row.meta)}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 truncate text-xs text-text-secondary">
        {reading}
      </p>
      <p aria-hidden className="mb-2 shrink-0 truncate text-[11px] text-text-muted">
        {corte}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis {...AXIS_PROPS} dataKey="realizado" domain={[0, domainMax]} hide type="number" />
            <YAxis
              {...AXIS_PROPS}
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
