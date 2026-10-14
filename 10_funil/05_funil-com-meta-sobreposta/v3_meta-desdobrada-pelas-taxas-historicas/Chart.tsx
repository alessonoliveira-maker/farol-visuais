import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, type BarShapeProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, metaGanhos, taxasHistoricas, type EtapaDesdobrada } from './data';

/**
 * O que já está em cada etapa do funil contra o necessário para a meta final de ganhos do
 * trimestre, desdobrado para trás pelas taxas históricas de passo. Diferente das demais versões
 * do modelo, a meta aqui nasce do resultado final, não da etapa: o necessário de cada etapa é
 * consequência da meta de ganhos, e o rodapé cita as taxas que a originam.
 */
export interface FunnelWithDerivedTargetProps {
  readonly data?: readonly EtapaDesdobrada[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 4, right: 190, bottom: 4, left: 0 } as const;
const NAME_AXIS_WIDTH = 122;
const BAR_MAX = 24;
const BAR_CATEGORY_GAP = '32%';
const VALUE_LABEL_GAP = 10;
const TARGET_OVERSHOOT = 6;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

function faltaLabel(falta: number): string {
  if (falta <= 0) return 'necessário já coberto nesta etapa';
  if (falta === 1) return 'falta 1 oportunidade';
  return `faltam ${formatInt(falta)} oportunidades`;
}

export default function FunnelWithDerivedTarget({ data = defaultData, height, className }: FunnelWithDerivedTargetProps) {
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
        <span>Nenhuma etapa neste recorte: sem necessário nem funil atual para comparar.</span>
      </div>
    );
  }

  const domainMax = Math.ceil((Math.max(...rows.map((row) => row.necessario)) * 1.08) / 10) * 10;
  const totalFalta = rows.reduce((sum, row) => sum + Math.max(0, row.necessario - row.noFunil), 0);
  const taxasTexto = taxasHistoricas.map((rate) => formatPercent(rate)).join(', ');

  const summary =
    `Gráfico de barras horizontal com o necessário em cada etapa para a meta de ${formatInt(metaGanhos)} ganhos, ` +
    `desdobrado das taxas históricas, contra o que já está no funil. Somadas as etapas, faltam ${formatInt(totalFalta)} oportunidades.`;

  const reading = `Necessário desdobrado da meta final de ${formatInt(metaGanhos)} ganhos; não é meta própria de cada etapa.`;
  const originNote = `Taxas dos últimos 4 trimestres, de Aberta a Ganha: ${taxasTexto}.`;

  const renderBar = (props: BarShapeProps): ReactElement | null => {
    const row = props.payload as EtapaDesdobrada | undefined;
    if (!row) return null;
    const x = Number(props.x);
    const y = Number(props.y);
    const width = Number(props.width);
    const barHeight = Number(props.height);
    const bg = props.background;
    const trackX = Number(bg?.x ?? x);
    const trackWidth = Number(bg?.width ?? width);
    const targetX = trackX + trackWidth * Math.min(1, row.necessario / domainMax);
    const falta = Math.max(0, row.necessario - row.noFunil);
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
        <text className="font-display" dominantBaseline="auto" fill="var(--text-primary)" fontSize={12} fontWeight={500} style={HALO} x={labelX} y={midY - 1}>
          {formatRateWithVolume(row.noFunil, row.necessario)}
        </text>
        <text className="font-sans" dominantBaseline="hanging" fill={falta > 0 ? 'var(--negative)' : 'var(--positive)'} fontSize={11} style={HALO} x={labelX} y={midY + 4}>
          {faltaLabel(falta)}
        </text>
      </g>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 shrink-0 truncate text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis dataKey="noFunil" domain={[0, domainMax]} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="etapa"
              interval={0}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Bar background={{ fill: 'var(--surface-sunken)' }} dataKey="noFunil" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 truncate text-[0.6875rem] text-text-muted">
        {originNote}
      </p>
    </div>
  );
}
