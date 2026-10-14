import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, period, type ScheduleRow } from './data';

/**
 * Lollipop horizontal das agendas marcadas por SDR no mês: uma haste fina parte do zero e termina
 * num disco, com a contagem escrita à direita. A linha de cima é quem mais marcou, e a linha de
 * leitura diz quem lidera, por quanto, e que a ordem é do maior para o menor.
 */
export interface ScheduleLollipopProps {
  /** Linhas em qualquer ordem: o componente ordena e desempata pelo nome. */
  readonly data?: readonly ScheduleRow[];
  /** Altura da raiz em px, para pai sem altura. O gráfico em si mede ROW_STEP por linha. */
  readonly height?: number;
  readonly className?: string;
}

/** Série única: uma cor só (COR-1). */
const MARK_COLOR = 'var(--chart-1)';
const MARGIN = { top: 4, right: 100, bottom: 4, left: 0 } as const;
const NAME_AXIS_WIDTH = 148;
const ROW_STEP = 24;
const BAR_CATEGORY_GAP = '34%';
const STEM_WIDTH = 2;
const DISC_RADIUS = 5.5;
const VALUE_LABEL_GAP = 8;
const LOCALE = 'pt-BR';

interface LollipopShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: ScheduleRow;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Maior contagem primeiro; empate pelo nome para a ordem não mudar a cada recarga. */
function rankByCount(rows: readonly ScheduleRow[]): ScheduleRow[] {
  return [...rows].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, LOCALE));
}

/** Soma das agendas; lista vazia devolve `null`, nunca zero (EST-1b). */
function totalOf(rows: readonly ScheduleRow[]): number | null {
  if (rows.length === 0) return null;
  return rows.reduce((sum, row) => sum + row.count, 0);
}

function NameTick({ y, payload }: NameTickProps): ReactElement {
  return (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );
}

/**
 * Haste e disco no mesmo `shape`, para os dois nascerem do mesmo retângulo e nunca desalinharem. A
 * ponta é `x + width` (ROT-2): `width` pode chegar negativo, e o rótulo nunca ancora em `x`.
 */
function LollipopShape({ x, y, width, height, payload }: LollipopShapeProps): ReactElement | null {
  if (x === undefined || y === undefined || width === undefined || height === undefined || payload === undefined) return null;
  const tip = x + width;
  const centerY = y + height / 2;
  return (
    <g>
      <line stroke={MARK_COLOR} strokeLinecap="round" strokeWidth={STEM_WIDTH} x1={x} x2={tip} y1={centerY} y2={centerY} />
      <circle cx={tip} cy={centerY} fill={MARK_COLOR} r={DISC_RADIUS} />
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-secondary)"
        fontSize={12}
        fontWeight={500}
        x={Math.max(x, tip) + DISC_RADIUS + VALUE_LABEL_GAP}
        y={centerY}
      >
        {`${formatInt(payload.count)} agendas`}
      </text>
    </g>
  );
}
export default function ScheduleLollipop({ data = defaultData, height, className }: ScheduleLollipopProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  /** Maior primeiro: com `layout="vertical"` o primeiro item do array nasce no alto (REC-3). */
  const rows = rankByCount(data);
  const leader = rows[0];

  if (!leader) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum SDR neste recorte: não houve agenda marcada no mês.</span>
      </div>
    );
  }

  const runnerUp = rows[1];
  const last = rows[rows.length - 1] ?? leader;
  const total = totalOf(rows);
  const lead = runnerUp === undefined ? null : leader.count - runnerUp.count;
  const month = formatMonthShort(period);
  const summary = [
    `Gráfico de pirulitos com as agendas marcadas por ${formatInt(rows.length)} SDRs em ${month}, do maior para o menor.`,
    `Lidera ${leader.name}, com ${formatInt(leader.count)}.`,
    rows.length > 2 ? `Menor valor: ${last.name}, com ${formatInt(last.count)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const plotHeight = MARGIN.top + MARGIN.bottom + rows.length * ROW_STEP;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as ScheduleRow | undefined;
    if (!row) return null;
    const share = total === null || total === 0 ? null : row.count / total;
    const entries = [
      { dataKey: 'count', name: 'Agendas no mês', value: formatInt(row.count) },
      { dataKey: 'share', name: 'Parte do time', value: share === null ? '' : formatPercent(share) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {month}, do maior para o menor:{' '}
        <span className="font-semibold text-text-primary">{leader.name}</span> lidera com{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(leader.count)}</span> agendas
        {lead === null || runnerUp === undefined ? null : lead === 0 ? (
          <>, empatada com {runnerUp.name}</>
        ) : (
          <>
            , <span className="kpi-number font-medium text-text-primary">{formatInt(lead)}</span> à frente de {runnerUp.name}
          </>
        )}
      </p>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <XAxis dataKey="count" domain={[0, 'dataMax']} hide type="number" />
            <YAxis axisLine={false} dataKey="name" interval={0} tick={NameTick} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            {/* A haste promete a base: o zero é desenhado, e o eixo nunca recorta (EIX-1). */}
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" x={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="count" isAnimationActive={animate} shape={(props: LollipopShapeProps) => <LollipopShape {...props} />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
