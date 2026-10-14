import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, WEEKLY_CAP, type WeeklyIntake } from './data';

/**
 * Lollipop vertical das entradas semanais: a haste sobe do zero e o disco marca o total da semana.
 * Uma linha de teto atravessa o desenho; a semana que passa dele ganha disco em vermelho e o
 * excedente escrito, e a semana em curso, parcial, vira disco vazado sobre haste tracejada.
 */
export interface WeeklyIntakeLollipopProps {
  /** Semanas em ordem cronológica; o componente não reordena, porque a ordem é o tempo. */
  readonly data?: readonly WeeklyIntake[];
  /** Teto de entradas por semana; o padrão vem do `data.ts`. */
  readonly cap?: number;
  readonly height?: number;
  readonly className?: string;
}

const BASE_COLOR = 'var(--chart-1)';
const OVER_COLOR = 'var(--negative)';
const CAP_COLOR = 'var(--text-muted)';
const STEM_WIDTH = 2;
const DISC_RADIUS = 5.5;
const RING_WIDTH = 2;
const TOP_PAD = 4;
const EXCESS_LABEL_ROOM = 16;
/** Folga no topo: um raio, mais 4 px, mais a linha do rótulo de excedente, para o disco mais alto nunca cortar. */
const MARGIN = { top: DISC_RADIUS + TOP_PAD + EXCESS_LABEL_ROOM, right: 88, bottom: 0, left: 0 } as const;
const Y_AXIS_WIDTH = 32;
const X_AXIS_HEIGHT = 24;
const Y_STEP = 20;
const BAR_CATEGORY_GAP = '34%';
const PARTIAL_DASH = '3 3';

interface LollipopShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: WeeklyIntake;
}

interface CapLabelProps {
  /** O pacote entrega a caixa da linha: `x`, `y` e `width`; o tipo dele é a união de caixas cartesiana e polar. */
  readonly viewBox?: unknown;
}

/** Teto de domínio em múltiplos de `Y_STEP`, sempre acima do maior valor. */
function domainTop(rows: readonly WeeklyIntake[], cap: number): number {
  const peak = rows.reduce((max, row) => Math.max(max, row.entries), cap);
  return (Math.floor(peak / Y_STEP) + 1) * Y_STEP;
}

/** Dia e mês da segunda-feira, a partir de `formatDate`: "22/06". O ano vai na linha de leitura. */
function weekLabel(week: string): string {
  return formatDate(week).slice(0, 5);
}

/** Semana fechada que passou do teto; a parcial nunca estoura, porque ainda está em curso. */
function exceedsCap(row: WeeklyIntake, cap: number): boolean {
  return row.partialUntil === undefined && row.entries > cap;
}

/**
 * A ponta é o topo do retângulo (`Math.min`), e a base, a borda de baixo. Semana em curso: disco
 * vazado e haste tracejada. Semana acima do teto: disco e haste em `--negative` e o excedente
 * escrito acima do disco, com halo porque o texto pode cruzar a grade (ROT-7).
 */
function makeShape(cap: number) {
  return function LollipopShape({ x, y, width, height, payload }: LollipopShapeProps): ReactElement | null {
    if (x === undefined || y === undefined || width === undefined || height === undefined || payload === undefined) return null;
    const centerX = x + width / 2;
    const tipY = Math.min(y, y + height);
    const baseY = Math.max(y, y + height);
    const partial = payload.partialUntil !== undefined;
    const over = exceedsCap(payload, cap);
    const color = over ? OVER_COLOR : BASE_COLOR;
    return (
      <g>
        <line stroke={color} strokeDasharray={partial ? PARTIAL_DASH : undefined} strokeLinecap="round" strokeWidth={STEM_WIDTH} x1={centerX} x2={centerX} y1={baseY} y2={tipY} />
        <circle
          cx={centerX}
          cy={tipY}
          fill={partial ? 'var(--surface-raised)' : color}
          r={DISC_RADIUS}
          stroke={partial ? color : undefined}
          strokeWidth={partial ? RING_WIDTH : undefined}
        />
        {over ? (
          <text
            className="font-display"
            fill={OVER_COLOR}
            fontSize={12}
            fontWeight={600}
            style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}
            textAnchor="middle"
            x={centerX}
            y={tipY - DISC_RADIUS - TOP_PAD}
          >
            {`+${formatInt(payload.entries - cap)}`}
          </text>
        ) : null}
      </g>
    );
  };
}
export default function WeeklyIntakeLollipop({ data = defaultData, cap = WEEKLY_CAP, height, className }: WeeklyIntakeLollipopProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = data;

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não há entradas medidas para comparar com o teto.</span>
      </div>
    );
  }

  const closed = rows.filter((row) => row.partialUntil === undefined);
  const over = closed.filter((row) => exceedsCap(row, cap));
  const peak = over.reduce<WeeklyIntake | null>((best, row) => (best === null || row.entries > best.entries ? row : best), null);
  const current = rows.find((row) => row.partialUntil !== undefined);
  const top = domainTop(rows, cap);
  const ticks = Array.from({ length: top / Y_STEP + 1 }, (_, index) => index * Y_STEP);
  const peakWeek = peak === null ? null : formatDate(peak.week);

  const summary = [
    `Gráfico de pirulitos com as entradas semanais de ${formatInt(rows.length)} semanas contra o teto de ${formatInt(cap)}.`,
    `${formatInt(over.length)} de ${formatInt(closed.length)} semanas fechadas passaram dele.`,
    peak === null || peakWeek === null ? 'Nenhuma semana fechada passou do teto.' : `A maior foi a de ${peakWeek}, com ${formatInt(peak.entries)}.`,
  ].join(' ');

  const renderCapLabel = (props: CapLabelProps): ReactElement => {
    const box = (props.viewBox ?? {}) as { readonly x?: number; readonly y?: number; readonly width?: number };
    const labelX = (box.x ?? 0) + (box.width ?? 0) + 8;
    const labelY = box.y ?? 0;
    return (
      <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={labelX} y={labelY}>
        <tspan dy="-0.6em" x={labelX}>
          teto medido
        </tspan>
        <tspan dy="1.3em" x={labelX}>
          {`${formatInt(cap)} por semana`}
        </tspan>
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as WeeklyIntake | undefined;
    if (!row) return null;
    const gap = row.entries - cap;
    const gapText = gap === 0 ? 'no teto' : `${gap > 0 ? '+' : '−'}${formatInt(Math.abs(gap))} contra o teto`;
    const entries = [
      { dataKey: 'entries', name: row.partialUntil === undefined ? 'Entradas na semana' : 'Entradas até agora', value: formatInt(row.entries) },
      { dataKey: 'gap', name: 'Distância do teto', value: gapText },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={`Semana de ${formatDate(row.week)}`} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="kpi-number font-semibold text-text-primary">{formatInt(over.length)}</span> de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(closed.length)}</span> semanas fechadas passaram do teto
        {peak === null || peakWeek === null ? null : (
          <>
            ; a maior foi a de <span className="kpi-number font-medium text-text-primary">{peakWeek}</span>, com{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(peak.entries)}</span> entradas
          </>
        )}
      </p>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-4 text-text-secondary">
        <li className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: BASE_COLOR }} />
          Dentro do teto
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: OVER_COLOR }} />
          Acima do teto, com o excedente
        </li>
        {current === undefined || current.partialUntil === undefined ? null : (
          <li className="flex items-center gap-2">
            <span className="box-border size-3 shrink-0 rounded-full border-2 bg-surface-raised" style={{ borderColor: BASE_COLOR }} />
            Semana em curso, parcial até {formatDate(current.partialUntil)}
          </li>
        )}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="week"
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: string) => weekLabel(value)}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis {...AXIS_PROPS} allowDecimals={false} axisLine={false} domain={[0, top]} tickFormatter={(value: number) => formatInt(value)} tickLine={false} tickMargin={8} ticks={ticks} width={Y_AXIS_WIDTH} />
            <ReferenceLine ifOverflow="extendDomain" label={{ content: renderCapLabel }} stroke={CAP_COLOR} strokeWidth={1.5} y={cap} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="entries" isAnimationActive={animate} shape={makeShape(cap)} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
