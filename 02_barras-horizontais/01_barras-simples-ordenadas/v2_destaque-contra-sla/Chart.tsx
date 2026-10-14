import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  LabelList,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatHours, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, slaHours as defaultSlaHours, type FirstContactTime } from './data';

/**
 * Ranking em barras horizontais do tempo até o primeiro contato por SDR, do pior para o melhor.
 * Quem passa do SLA fica em cor de alerta com sinal, palavra e valor escrito; uma linha vertical
 * tracejada marca o próprio limite. A cor por item vem de um `shape` com `Rectangle`, nunca de `Cell`.
 */
export interface FirstContactBarsProps {
  readonly data?: readonly FirstContactTime[];
  readonly slaHours?: number;
  readonly height?: number;
  readonly className?: string;
}

const ALERT_FILL = 'var(--negative)';
const NEUTRAL_FILL = 'var(--line-strong)';
const REFERENCE_STROKE = 'var(--text-muted)';
const MARGIN = { top: 22, right: 152, bottom: 2, left: 0 } as const;
const NAME_AXIS_WIDTH = 140;
const ROW_STEP = 26;
const BAR_CATEGORY_GAP = '34%';
const BAR_MAX = 16;
const BAR_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
const VALUE_LABEL_GAP = 6;
const LOCALE = 'pt-BR';
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

interface ReferenceLabelProps {
  readonly viewBox?: { readonly x?: number; readonly y?: number };
}

/** Pior para o melhor: quem demora mais primeiro; empate resolvido pelo nome. */
function rankByHours(rows: readonly FirstContactTime[]): FirstContactTime[] {
  return [...rows].sort((a, b) => b.hours - a.hours || a.name.localeCompare(b.name, LOCALE));
}

function plotHeight(count: number): number {
  return MARGIN.top + MARGIN.bottom + count * ROW_STEP;
}

function NameTick({ y, payload }: NameTickProps): ReactElement {
  return (
    <text
      className="font-sans"
      dominantBaseline="central"
      fill="var(--text-secondary)"
      fontSize={12}
      fontWeight={500}
      x={MARGIN.left}
      y={Number(y)}
    >
      {String(payload?.value ?? '')}
    </text>
  );
}

export default function FirstContactBars({
  data = defaultData,
  slaHours = defaultSlaHours,
  height,
  className,
}: FirstContactBarsProps) {
  const animate = useAnimateOnce();
  const rows = rankByHours(data);
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum SDR neste recorte: não houve lead com primeiro contato registrado no período.</span>
      </div>
    );
  }

  const overSla = rows.filter((row) => row.hours > slaHours);
  const worst = rows[0];
  const best = rows[rows.length - 1] ?? worst;

  const renderBar = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = rows[index];
    const fill = row && row.hours > slaHours ? ALERT_FILL : NEUTRAL_FILL;
    return (
      <Rectangle
        fill={fill}
        height={Number(barHeight)}
        radius={BAR_RADIUS}
        width={Number(width)}
        x={Number(x)}
        y={Number(y)}
      />
    );
  };

  const renderValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const over = row.hours > slaHours;
    const text = over ? `+${formatHours(row.hours - slaHours)} acima do SLA` : formatHours(row.hours);
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill={over ? 'var(--negative)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={500}
        style={HALO}
        x={Number(x) + Number(width) + VALUE_LABEL_GAP}
        y={Number(y) + Number(barHeight) / 2}
      >
        {text}
      </text>
    );
  };

  const renderSlaLabel = ({ viewBox }: ReferenceLabelProps): ReactElement => (
    <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x ?? 0} y={(viewBox?.y ?? 0) - 7}>
      <tspan className="font-sans">SLA </tspan>
      <tspan className="font-display">{formatHours(slaHours)}</tspan>
    </text>
  );

  const summary = [
    `Gráfico de barras horizontais com o tempo até o primeiro contato de ${String(rows.length)} SDRs, do pior para o melhor.`,
    `${String(overSla.length)} de ${String(rows.length)} passam do SLA de ${formatHours(slaHours)}.`,
    worst ? `Pior tempo: ${worst.name}, ${formatHours(worst.hours)}.` : '',
    best && best.id !== worst?.id ? `Melhor tempo: ${best.name}, ${formatHours(best.hours)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="font-semibold text-text-primary tabular-nums">
          {formatInt(overSla.length)} de {formatInt(rows.length)}
        </span>{' '}
        SDRs passam do SLA de <span className="kpi-number font-medium text-text-primary">{formatHours(slaHours)}</span>
        {worst ? (
          <>
            ; pior tempo é <span className="font-semibold text-text-primary">{worst.name}</span>, com{' '}
            <span className="kpi-number font-medium text-text-primary">{formatHours(worst.hours)}</span>
          </>
        ) : null}
      </p>
      <div className="shrink-0" style={{ height: plotHeight(rows.length) }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis dataKey="hours" domain={[0, 'dataMax']} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="name"
              interval={0}
              tick={NameTick}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderSlaLabel}
              stroke={REFERENCE_STROKE}
              strokeDasharray="3 3"
              strokeWidth={1}
              x={slaHours}
            />
            <Bar dataKey="hours" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar}>
              <LabelList content={renderValue} dataKey="hours" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
