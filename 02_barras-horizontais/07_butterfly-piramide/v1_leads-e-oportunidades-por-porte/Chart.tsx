import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  LabelList,
  ReferenceLine,
  Rectangle,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useXAxisScale,
  type BarShapeProps,
  type LabelProps,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SizeBandFunnel } from './data';

/**
 * Butterfly com leads e oportunidades abertos no trimestre, espelhados sobre a mesma faixa de
 * porte: leads negados no seletor crescem para a esquerda, oportunidades para a direita, os dois
 * lados na mesma escala simétrica e o sinal nunca aparece em texto (Math.abs no tique e no rótulo).
 */
export interface SizeBandButterflyProps {
  readonly data?: readonly SizeBandFunnel[];
  readonly height?: number;
  readonly className?: string;
}

const LEADS_FILL = 'var(--chart-1)';
const OPPORTUNITIES_FILL = 'var(--chart-3)';
const ZERO_STROKE = 'var(--line-strong)';
const NAME_WIDTH = 116;
const MARGIN = { top: 26, right: 8, bottom: 4, left: 34 } as const;
const BAR_MAX = 20;
const VALUE_LABEL_GAP = 6;
const LABEL_Z = 2000;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface Row {
  readonly id: string;
  readonly band: string;
  readonly leadsNeg: number;
  readonly leads: number;
  readonly opportunities: number;
}

interface TickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** A menor faixa fica embaixo: o array chega crescente e o Recharts lista a primeira linha no topo. */
function toRows(data: readonly SizeBandFunnel[]): Row[] {
  return [...data].reverse().map((item) => ({
    id: item.id,
    band: item.band,
    leadsNeg: -item.leads,
    leads: item.leads,
    opportunities: item.opportunities,
  }));
}

interface SideTitlesProps {
  readonly leadsTotal: number;
  readonly opportunitiesTotal: number;
}

/** Título de cada lado, centrado no bloco pela escala do próprio eixo (CONTRATO, seção 5). */
function SideTitles({ leadsTotal, opportunitiesTotal }: SideTitlesProps) {
  const xScale = useXAxisScale();
  const plot = usePlotArea();
  if (!xScale || !plot) return null;
  const zeroX = xScale(0) ?? plot.x + plot.width / 2;
  const y = plot.y - 12;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      <text className="font-sans tabular-nums" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={600} textAnchor="middle" x={(plot.x + zeroX) / 2} y={y}>
        Leads ({formatInt(leadsTotal)})
      </text>
      <text className="font-sans tabular-nums" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={600} textAnchor="middle" x={(zeroX + plot.x + plot.width) / 2} y={y}>
        Oportunidades ({formatInt(opportunitiesTotal)})
      </text>
    </ZIndexLayer>
  );
}

export default function SizeBandButterfly({ data = defaultData, height, className }: SizeBandButterflyProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = toRows(data);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma faixa neste recorte: não houve lead nem oportunidade no trimestre.</span>
      </div>
    );
  }

  const leadsTotal = rows.reduce((sum, row) => sum + row.leads, 0);
  const opportunitiesTotal = rows.reduce((sum, row) => sum + row.opportunities, 0);
  const domainEdge = Math.max(1, ...rows.map((row) => Math.max(row.leads, row.opportunities)));
  const topLeads = [...rows].sort((a, b) => b.leads - a.leads)[0];
  const topOpportunities = [...rows].sort((a, b) => b.opportunities - a.opportunities)[0];

  const summary = [
    `Gráfico butterfly com leads à esquerda e oportunidades à direita, em ${String(rows.length)} faixas de porte da conta.`,
    topLeads ? `Mais leads na faixa ${topLeads.band}, ${formatInt(topLeads.leads)}.` : '',
    topOpportunities ? `Mais oportunidades na faixa ${topOpportunities.band}, ${formatInt(topOpportunities.opportunities)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const byIndex = (index: number | undefined): Row | undefined => (index === undefined ? undefined : rows[index]);
  const byId = new Map(rows.map((row) => [row.id, row]));

  const renderName = ({ y, payload }: TickProps): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} textAnchor="middle" x={NAME_WIDTH / 2} y={Number(y)}>
      {byId.get(String(payload?.value ?? ''))?.band ?? ''}
    </text>
  );

  const renderLeftBar = ({ x, y, width, height: barHeight }: BarShapeProps): ReactElement => (
    <Rectangle fill={LEADS_FILL} height={Number(barHeight ?? 0)} radius={[3, 0, 0, 3]} width={Number(width ?? 0)} x={Number(x ?? 0)} y={Number(y ?? 0)} />
  );

  const renderRightBar = ({ x, y, width, height: barHeight }: BarShapeProps): ReactElement => (
    <Rectangle fill={OPPORTUNITIES_FILL} height={Number(barHeight ?? 0)} radius={[0, 3, 3, 0]} width={Number(width ?? 0)} x={Number(x ?? 0)} y={Number(y ?? 0)} />
  );

  const renderLeftValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = byIndex(index);
    if (!row) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="end" x={Number(x) + Number(width) - VALUE_LABEL_GAP} y={Number(y) + Number(barHeight) / 2}>
        {formatInt(row.leads)}
      </text>
    );
  };

  const renderRightValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = byIndex(index);
    if (!row) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} x={Number(x) + Number(width) + VALUE_LABEL_GAP} y={Number(y) + Number(barHeight) / 2}>
        {formatInt(row.opportunities)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart accessibilityLayer={false} barCategoryGap="34%" data={rows} layout="vertical" margin={MARGIN}>
          <XAxis allowDecimals={false} domain={[-domainEdge, domainEdge]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(value: number) => formatInt(Math.abs(value))} tickLine={false} axisLine={false} ticks={[-domainEdge, 0, domainEdge]} type="number" />
          <YAxis axisLine={false} dataKey="id" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_WIDTH} />
          <ReferenceLine ifOverflow="extendDomain" stroke={ZERO_STROKE} strokeWidth={1} x={0} />
          <Bar dataKey="leadsNeg" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderLeftBar} stackId="leads">
            <LabelList content={renderLeftValue} dataKey="leadsNeg" />
          </Bar>
          <Bar dataKey="opportunities" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderRightBar} stackId="opportunities">
            <LabelList content={renderRightValue} dataKey="opportunities" />
          </Bar>
          <SideTitles leadsTotal={leadsTotal} opportunitiesTotal={opportunitiesTotal} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
