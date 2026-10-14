import { Filter, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  LabelList,
  ReferenceLine,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type BarShapeProps,
  type LabelProps,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SizeBandVolume } from './data';

/**
 * Butterfly que detecta quando os dois lados têm ordens de grandeza muito diferentes (razão
 * acima de 20 entre os totais) e troca para percentual do próprio total, com a escala independente
 * declarada na linha de leitura; a dica de cada barra continua mostrando a contagem absoluta.
 */
export interface SizeBandIndependentProps {
  readonly data?: readonly SizeBandVolume[];
  readonly height?: number;
  readonly className?: string;
}

const LEADS_FILL = 'var(--chart-1)';
const OPPORTUNITIES_FILL = 'var(--chart-3)';
const ZERO_STROKE = 'var(--line-strong)';
const NAME_WIDTH = 116;
const MARGIN = { top: 26, right: 40, bottom: 4, left: 50 } as const;
const BAR_MAX = 20;
const VALUE_GAP = 6;
const LABEL_Z = 2000;
/** Acima desta razão entre os totais, a escala comum apaga o lado pequeno (README, V4). */
const INDEPENDENT_RATIO = 20;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;
const ICON_SIZE = 12;
const ICON_TEXT_GAP = 4;

interface Row {
  readonly id: string;
  readonly band: string;
  readonly leadsRaw: number | null;
  readonly oppRaw: number | null;
  readonly leftValue: number | null;
  readonly rightValue: number | null;
}

interface TickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

interface BandTooltipEntry {
  readonly payload?: unknown;
}

interface BandTooltipProps {
  readonly active?: boolean;
  readonly payload?: readonly BandTooltipEntry[];
}

function sum(values: readonly (number | null)[]): number {
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

function toRows(data: readonly SizeBandVolume[], independent: boolean, leadsTotal: number, oppTotal: number): Row[] {
  return [...data].reverse().map((item) => ({
    id: item.id,
    band: item.band,
    leadsRaw: item.leads,
    oppRaw: item.opportunities,
    leftValue: item.leads === null ? null : -(independent ? item.leads / leadsTotal : item.leads),
    rightValue: item.opportunities === null ? null : independent ? item.opportunities / oppTotal : item.opportunities,
  }));
}

interface OverlayProps {
  readonly rows: readonly Row[];
  readonly leadsTotal: number;
  readonly oppTotal: number;
}

/** Título de cada lado e a marca de "indisponível" nas faixas sem observação (EST-2). */
function Overlay({ rows, leadsTotal, oppTotal }: OverlayProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (!xScale || !yScale || !plot) return null;
  const zeroX = xScale(0) ?? plot.x + plot.width / 2;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      <text className="font-sans tabular-nums" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={600} textAnchor="middle" x={(plot.x + zeroX) / 2} y={plot.y - 12}>
        Leads ({formatInt(leadsTotal)})
      </text>
      <text className="font-sans tabular-nums" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={600} textAnchor="middle" x={(zeroX + plot.x + plot.width) / 2} y={plot.y - 12}>
        Oportunidades ({formatInt(oppTotal)})
      </text>
      {rows.map((row) => {
        const center = yScale(row.id, { position: 'middle' });
        if (center === undefined) return null;
        return (
          <g key={row.id}>
            {row.leftValue === null ? (
              <>
                <Unplug aria-hidden className="text-text-muted" height={ICON_SIZE} width={ICON_SIZE} x={zeroX - VALUE_GAP - ICON_SIZE} y={center - ICON_SIZE / 2} />
                <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={zeroX - VALUE_GAP - ICON_SIZE - ICON_TEXT_GAP} y={center}>
                  {formatUnavailable()}
                </text>
              </>
            ) : null}
            {row.rightValue === null ? (
              <>
                <Unplug aria-hidden className="text-text-muted" height={ICON_SIZE} width={ICON_SIZE} x={zeroX + VALUE_GAP} y={center - ICON_SIZE / 2} />
                <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={zeroX + VALUE_GAP + ICON_SIZE + ICON_TEXT_GAP} y={center}>
                  {formatUnavailable()}
                </text>
              </>
            ) : null}
          </g>
        );
      })}
    </ZIndexLayer>
  );
}

export default function SizeBandIndependent({ data = defaultData, height, className }: SizeBandIndependentProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma faixa neste recorte: não houve lead nem oportunidade no período.</span>
      </div>
    );
  }

  const leadsTotal = sum(data.map((item) => item.leads));
  const oppTotal = sum(data.map((item) => item.opportunities));
  const ratio = leadsTotal > 0 && oppTotal > 0 ? Math.max(leadsTotal / oppTotal, oppTotal / leadsTotal) : 1;
  const independent = ratio > INDEPENDENT_RATIO;
  const rows = toRows(data, independent, leadsTotal, oppTotal);
  const byId = new Map(rows.map((row) => [row.id, row]));
  const domainEdge = Math.max(0.01, ...rows.flatMap((row) => [row.leftValue === null ? 0 : Math.abs(row.leftValue), row.rightValue === null ? 0 : row.rightValue]));

  const summary = [
    `Gráfico butterfly com leads à esquerda e oportunidades à direita, em ${String(rows.length)} faixas de porte da conta.`,
    independent
      ? `Escalas independentes: razão acima de ${String(INDEPENDENT_RATIO)} vezes, cada lado em percentual do próprio total.`
      : '',
    `Total de leads ${formatInt(leadsTotal)}; total de oportunidades ${formatInt(oppTotal)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const byIndex = (index: number | undefined): Row | undefined => (index === undefined ? undefined : rows[index]);

  const renderName = ({ y, payload }: TickProps): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} textAnchor="middle" x={NAME_WIDTH / 2} y={Number(y)}>
      {byId.get(String(payload?.value ?? ''))?.band ?? ''}
    </text>
  );

  const renderLeftBar = ({ x, y, width, height: barHeight }: BarShapeProps): ReactElement | null => {
    if (!Number.isFinite(Number(width)) || Number(width) === 0) return null;
    return <Rectangle fill={LEADS_FILL} height={Number(barHeight ?? 0)} radius={[3, 0, 0, 3]} width={Number(width ?? 0)} x={Number(x ?? 0)} y={Number(y ?? 0)} />;
  };

  const renderRightBar = ({ x, y, width, height: barHeight }: BarShapeProps): ReactElement | null => {
    if (!Number.isFinite(Number(width)) || Number(width) === 0) return null;
    return <Rectangle fill={OPPORTUNITIES_FILL} height={Number(barHeight ?? 0)} radius={[0, 3, 3, 0]} width={Number(width ?? 0)} x={Number(x ?? 0)} y={Number(y ?? 0)} />;
  };

  const renderLeftValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = byIndex(index);
    if (!row || row.leadsRaw === null) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="end" x={Number(x) + Number(width) - VALUE_GAP} y={Number(y) + Number(barHeight) / 2}>
        {independent ? formatPercent(row.leadsRaw / leadsTotal, 0) : formatInt(row.leadsRaw)}
      </text>
    );
  };

  const renderRightValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = byIndex(index);
    if (!row || row.oppRaw === null) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} x={Number(x) + Number(width) + VALUE_GAP} y={Number(y) + Number(barHeight) / 2}>
        {independent ? formatPercent(row.oppRaw / oppTotal, 0) : formatInt(row.oppRaw)}
      </text>
    );
  };

  const renderTooltip = ({ active, payload }: BandTooltipProps): ReactElement | null => {
    if (!active || !payload || payload.length === 0) return null;
    const row = payload[0]?.payload as Row | undefined;
    if (!row) return null;
    const entries: NonNullable<ChartTooltipProps['payload']>[number][] = [];
    if (row.leadsRaw !== null) {
      entries.push({
        color: LEADS_FILL,
        dataKey: 'leftValue',
        graphicalItemId: 'leftValue',
        name: 'Leads',
        value: formatInt(row.leadsRaw),
      });
    }
    if (row.oppRaw !== null) {
      entries.push({
        color: OPPORTUNITIES_FILL,
        dataKey: 'rightValue',
        graphicalItemId: 'rightValue',
        name: 'Oportunidades',
        value: formatInt(row.oppRaw),
      });
    }
    return <ChartTooltip active label={row.band} payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {independent ? (
        <p aria-hidden className="mb-1 shrink-0 text-[11px] text-text-muted">
          Escalas independentes: cada lado em percentual do próprio total, a diferença de ordem de grandeza é grande demais para uma escala comum.
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="34%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis allowDecimals={false} domain={[-domainEdge, domainEdge]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v: number) => (independent ? formatPercent(Math.abs(v), 0) : formatInt(Math.abs(v)))} tickLine={false} axisLine={false} ticks={[-domainEdge, 0, domainEdge]} type="number" />
            <YAxis axisLine={false} dataKey="id" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_WIDTH} />
            <ReferenceLine ifOverflow="extendDomain" stroke={ZERO_STROKE} strokeWidth={1} x={0} />
            <Bar dataKey="leftValue" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderLeftBar} stackId="leads">
              <LabelList content={renderLeftValue} dataKey="leftValue" />
            </Bar>
            <Bar dataKey="rightValue" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderRightBar} stackId="opportunities">
              <LabelList content={renderRightValue} dataKey="rightValue" />
            </Bar>
            <Overlay leadsTotal={leadsTotal} oppTotal={oppTotal} rows={rows} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
