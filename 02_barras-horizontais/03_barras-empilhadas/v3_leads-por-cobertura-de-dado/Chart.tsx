import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, BarStack, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type BarShapeProps, type LabelProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadCoverageRow } from './data';

/**
 * Barras empilhadas horizontais com a cobertura de dado de contato de cada origem: telefone e
 * e-mail juntos na base (o segmento que mais importa comparar entre origens), até sem contato
 * na ponta, sempre visível. O total e o percentual completo saem escritos ao final da barra.
 */
export interface LeadCoverageBarsProps {
  readonly data?: readonly LeadCoverageRow[];
  readonly height?: number;
  readonly className?: string;
}

interface SegmentDef {
  readonly key: 'phoneAndEmail' | 'emailOnly' | 'phoneOnly';
  readonly label: string;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
}

const SEGMENTS: readonly SegmentDef[] = [
  { key: 'phoneAndEmail', label: 'Telefone e e-mail', slot: 1 },
  { key: 'emailOnly', label: 'Só e-mail', slot: 3 },
  { key: 'phoneOnly', label: 'Só telefone', slot: 6 },
];
const NO_CONTACT_LABEL = 'Sem contato';
const MIN_LABEL_WIDTH = 24;
const MARGIN = { top: 0, right: 148, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 108;
const VALUE_LABEL_GAP = 6;
const BAR_MAX = 26;
const STACK_ID = 'cobertura';
const STACK_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
const SEGMENT_GAP = 2;
const CURSOR = { fill: 'var(--line-subtle)' } as const;
const CONTRAST_ON_CHART_1 = 'var(--accent-cyan-contrast)';

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

interface RankedRow extends LeadCoverageRow {
  readonly total: number;
  readonly completePct: number;
}

function slotColor(slot: SegmentDef['slot']): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

function fillShape(fill: string) {
  return ({ x, y, width, height, stackedBarStart }: BarShapeProps): ReactElement => {
    const gap = x - stackedBarStart > 0.5 ? SEGMENT_GAP : 0;
    const drawnWidth = width - gap;
    if (drawnWidth <= 0 || height <= 0) return <g />;
    return <rect fill={fill} height={height} width={drawnWidth} x={x + gap} y={y} />;
  };
}

/** "Sem contato" é ausência dentro da composição (COR): visível, tom neutro, sem preenchimento. */
function outlineShape({ x, y, width, height, stackedBarStart }: BarShapeProps): ReactElement {
  const gap = x - stackedBarStart > 0.5 ? SEGMENT_GAP : 0;
  const drawnWidth = width - gap;
  if (drawnWidth <= 1 || height <= 1) return <g />;
  return (
    <rect
      fill="none"
      height={height - 1}
      stroke="var(--text-muted)"
      strokeWidth={1}
      width={drawnWidth - 1}
      x={x + gap + 0.5}
      y={y + 0.5}
    />
  );
}

/** Percentual do segmento sobre o total da origem, só quando a largura em pixels comporta o texto. */
function segmentLabel(getValue: (row: RankedRow) => number, rows: readonly RankedRow[], color: string) {
  return ({ x, y, width, height, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    const pixelWidth = Number(width);
    if (!row || pixelWidth < MIN_LABEL_WIDTH || row.total <= 0) return null;
    const pct = getValue(row) / row.total;
    if (pct <= 0) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill={color} fontSize={11} fontWeight={600} textAnchor="middle" x={Number(x) + pixelWidth / 2} y={Number(y) + Number(height) / 2}>
        {formatPercent(pct, 0)}
      </text>
    );
  };
}

export default function LeadCoverageBars({ data = defaultData, height, className }: LeadCoverageBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows: RankedRow[] = data
    .map((row) => {
      const total = row.phoneAndEmail + row.emailOnly + row.phoneOnly + row.noContact;
      return { ...row, total, completePct: total > 0 ? row.phoneAndEmail / total : 0 };
    })
    .sort((a, b) => a.completePct - b.completePct || b.total - a.total);
  const teamTotal = rows.reduce((sum, row) => sum + row.total, 0);
  const teamComplete = rows.reduce((sum, row) => sum + row.phoneAndEmail, 0);

  const worst = rows[0];
  if (!worst || teamTotal <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há cobertura de dado para medir por origem.</span>
      </div>
    );
  }

  const teamPct = teamTotal > 0 ? teamComplete / teamTotal : 0;
  const summary = `Gráfico de barras empilhadas com ${String(teamTotal)} leads de ${String(rows.length)} origens no mês, divididos pela cobertura de telefone e e-mail. ${worst.name} tem a pior cobertura, com ${formatPercent(worst.completePct, 0)} completa. No total, ${formatPercent(teamPct, 0)} dos leads chegam com telefone e e-mail.`;

  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );

  const renderTail = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    return (
      <text dominantBaseline="central" fontSize={12} x={Number(x) + Number(width) + VALUE_LABEL_GAP} y={Number(y) + Number(barHeight) / 2}>
        <tspan className="font-display" fill="var(--text-secondary)" fontWeight={500}>
          {formatInt(row.total)}
        </tspan>
        <tspan className="font-sans" dx={2} fill="var(--text-muted)" fontSize={11}>
          {' leads, '}
        </tspan>
        <tspan className="font-display" fill="var(--text-primary)" fontSize={11} fontWeight={600}>
          {formatPercent(row.completePct, 0)}
        </tspan>
        <tspan className="font-sans" dx={2} fill="var(--text-muted)" fontSize={11}>
          {' completo'}
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{worst.name}</span> tem a pior cobertura:{' '}
        <span className="kpi-number font-medium text-text-primary">{formatPercent(worst.completePct, 0)}</span> completa. No total,{' '}
        <span className="kpi-number font-medium text-text-primary">{formatPercent(teamPct, 0)}</span> chega com telefone e e-mail
      </p>
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        {SEGMENTS.map((segment) => (
          <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary" key={segment.key}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: slotColor(segment.slot) }} />
            {segment.label}
          </li>
        ))}
        <li className="flex items-center gap-2.5 text-xs leading-5 text-text-muted" key="no-contact">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px] border border-line-strong" style={{ borderColor: 'var(--text-muted)' }} />
          {NO_CONTACT_LABEL}
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="30%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, 'dataMax']} hide type="number" />
            <YAxis axisLine={false} dataKey="name" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            <Tooltip content={<ChartTooltip valueFormat="int" />} cursor={CURSOR} isAnimationActive={false} />
            <BarStack radius={STACK_RADIUS} stackId={STACK_ID}>
              {SEGMENTS.map((segment) => (
                <Bar dataKey={segment.key} isAnimationActive={animate} key={segment.key} maxBarSize={BAR_MAX} name={segment.label} shape={fillShape(slotColor(segment.slot))}>
                  {segment.key === 'phoneAndEmail' ? (
                    <LabelList content={segmentLabel((row) => row.phoneAndEmail, rows, CONTRAST_ON_CHART_1)} />
                  ) : null}
                </Bar>
              ))}
              <Bar dataKey="noContact" isAnimationActive={animate} maxBarSize={BAR_MAX} name={NO_CONTACT_LABEL} shape={outlineShape}>
                <LabelList content={segmentLabel((row) => row.noContact, rows, 'var(--text-muted)')} />
                <LabelList content={renderTail} />
              </Bar>
            </BarStack>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
