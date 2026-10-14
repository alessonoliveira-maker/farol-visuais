import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, months, type PlatformLeads } from './data';

/**
 * Lollipop agrupado dos leads de julho e agosto por plataforma: dois pirulitos por plataforma, a
 * haste sobe do zero e o disco marca a contagem. Zero medido é só o disco sobre a base; plataforma
 * sem veiculação não desenha haste nem disco e leva a marca em texto, e a nota no rodapé conta os dois.
 */
export interface PlatformLeadsLollipopProps {
  /** Plataformas na ordem em que aparecem; `null` em um mês é sem veiculação, e `0` é zero medido. */
  readonly data?: readonly PlatformLeads[];
  readonly height?: number;
  readonly className?: string;
}

type Month = 'july' | 'august';

const BASE_COLOR = 'var(--chart-3)';
const CURRENT_COLOR = 'var(--chart-1)';
const STEM_WIDTH = 2;
const DISC_RADIUS = 5.5;
const VALUE_GAP = 6;
const MARGIN = { top: 26, right: 8, bottom: 0, left: 8 } as const;
const X_AXIS_HEIGHT = 32;
const X_TICK_MARGIN = 12;
const BAR_CATEGORY_GAP = '30%';
/** Folga entre os dois pirulitos de uma plataforma, menor que a folga entre plataformas (REC-19). */
const BAR_GAP = 4;
const ABSENT_LINE_STEP = 13;

interface LollipopShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: PlatformLeads;
}

/** Soma de leads de um mês, só das plataformas veiculadas; sem nenhuma veiculada devolve `null` (EST-1b). */
function totalOf(rows: readonly PlatformLeads[], month: Month): number | null {
  const present = rows.map((row) => row[month]).filter((value): value is number => value !== null);
  if (present.length === 0) return null;
  return present.reduce((sum, value) => sum + value, 0);
}

/** Nomes das plataformas em que o mês é `null` ou zero, na ordem do dado. */
function namesWhere(rows: readonly PlatformLeads[], month: Month, test: (value: number | null) => boolean): string[] {
  return rows.filter((row) => test(row[month])).map((row) => row.name);
}

function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1] ?? ''}`;
}

/**
 * Geometria do `Bar`: o valor `null` não chega ao `shape` (o pacote descarta antes), então a série
 * entrega 0 no lugar dele só para o retângulo de dimensão zero existir, e a forma própria devolve
 * o texto no lugar do disco lendo o `null` do payload (REC-11). O texto parte da borda esquerda da fatia e cresce para a folga entre plataformas, onde há espaço; centrado, ele cobriria a haste do mês vizinho.
 */
function slotValue(value: number | null): number {
  return value ?? 0;
}

function makeShape(month: Month, color: string) {
  return function LollipopShape({ x, y, width, height, payload }: LollipopShapeProps): ReactElement | null {
    if (x === undefined || y === undefined || width === undefined || height === undefined || payload === undefined) return null;
    const value = payload[month];
    const centerX = x + width / 2;
    const tipY = Math.min(y, y + height);
    const baseY = Math.max(y, y + height);
    if (value === null) {
      return (
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} fontWeight={500} textAnchor="start" x={x} y={baseY - ABSENT_LINE_STEP - VALUE_GAP}>
          <tspan x={x}>sem</tspan>
          <tspan dy={ABSENT_LINE_STEP} x={x}>
            veiculação
          </tspan>
        </text>
      );
    }
    return (
      <g>
        {value > 0 ? <line stroke={color} strokeLinecap="round" strokeWidth={STEM_WIDTH} x1={centerX} x2={centerX} y1={baseY} y2={tipY} /> : null}
        <circle cx={centerX} cy={tipY} fill={color} r={DISC_RADIUS} />
        <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={500} textAnchor="middle" x={centerX} y={tipY - DISC_RADIUS - VALUE_GAP}>
          {formatInt(value)}
        </text>
      </g>
    );
  };
}

export default function PlatformLeadsLollipop({ data = defaultData, height, className }: PlatformLeadsLollipopProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = data;
  const baseLabel = formatMonthShort(months.base);
  const currentLabel = formatMonthShort(months.current);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma neste recorte: não há leads medidos nos dois meses.</span>
      </div>
    );
  }

  const leader = rows.reduce<PlatformLeads | null>((best, row) => (row.august !== null && (best === null || best.august === null || row.august > best.august) ? row : best), null);
  const leaderValue = leader?.august ?? null;
  const leaderChange = leader === null || leaderValue === null || leader.july === null ? null : leaderValue - leader.july;
  const absent = namesWhere(rows, 'august', (value) => value === null);
  const zero = namesWhere(rows, 'august', (value) => value === 0);
  const total = totalOf(rows, 'august');

  const changeText = (change: number): string => {
    if (change === 0) return `igual a ${baseLabel}`;
    return `${formatInt(Math.abs(change))} ${change > 0 ? 'a mais' : 'a menos'} que em ${baseLabel}`;
  };
  const noteParts = [
    absent.length > 0 ? `${joinNames(absent)}: sem veiculação em ${currentLabel}, sem haste nem disco.` : '',
    zero.length > 0 ? `${joinNames(zero)}: zero lead medido em ${currentLabel}, só o disco sobre a base.` : '',
  ].filter(Boolean);

  const summary = [
    `Gráfico de pirulitos agrupado com os leads de ${formatInt(rows.length)} plataformas em ${baseLabel} e ${currentLabel}.`,
    leader === null || leaderValue === null ? 'Nenhuma plataforma foi veiculada no segundo mês.' : `Lidera ${leader.name}, com ${formatInt(leaderValue)} em ${currentLabel}.`,
    absent.length > 0 ? `${joinNames(absent)}: sem veiculação em ${currentLabel}.` : '',
    zero.length > 0 ? `${joinNames(zero)}: zero lead medido.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as PlatformLeads | undefined;
    if (!row) return null;
    const describe = (value: number | null) => (value === null ? 'sem veiculação' : `${formatInt(value)} leads`);
    const change = row.july === null || row.august === null ? null : row.august - row.july;
    const percent = change === null || row.july === null || row.july === 0 ? null : Math.abs(change) / row.july;
    const sign = change === null || change === 0 ? '' : change < 0 ? '−' : '+';
    const entries = [
      { dataKey: 'july', name: baseLabel, value: describe(row.july) },
      { dataKey: 'august', name: currentLabel, value: describe(row.august) },
      {
        dataKey: 'change',
        name: 'Variação',
        value:
          change === null
            ? 'sem base para comparar'
            : `${sign}${formatInt(Math.abs(change))} leads${percent === null ? '' : ` (${sign}${formatPercent(percent, percent >= 0.1 ? 0 : 1)})`}`,
      },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {leader === null || leaderValue === null ? (
          <>Nenhuma plataforma foi veiculada em {currentLabel}</>
        ) : (
          <>
            <span className="font-semibold text-text-primary">{leader.name}</span> lidera em {currentLabel} com{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(leaderValue)}</span> leads
            {leaderChange === null ? null : <>, {changeText(leaderChange)}</>}
            {total === null ? null : <>; total de {formatInt(total)} nas veiculadas</>}
          </>
        )}
      </p>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-4 text-text-secondary">
        <li className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: BASE_COLOR }} />
          {baseLabel}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: CURRENT_COLOR }} />
          {currentLabel}
        </li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} barGap={BAR_GAP} data={rows} margin={MARGIN}>
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="name" height={X_AXIS_HEIGHT} interval={0} tickLine={false} tickMargin={X_TICK_MARGIN} />
            <YAxis domain={[0, 'dataMax']} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey={(row: PlatformLeads) => slotValue(row.july)} isAnimationActive={animate} shape={makeShape('july', BASE_COLOR)} />
            <Bar dataKey={(row: PlatformLeads) => slotValue(row.august)} isAnimationActive={animate} shape={makeShape('august', CURRENT_COLOR)} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {noteParts.length === 0 ? null : (
        <p aria-hidden className="mt-2 shrink-0 text-[11px] leading-4 text-text-muted">
          {noteParts.join(' ')}
        </p>
      )}
    </div>
  );
}
