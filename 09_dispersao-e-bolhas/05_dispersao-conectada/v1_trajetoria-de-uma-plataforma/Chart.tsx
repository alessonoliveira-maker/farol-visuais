import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PlatformMonth } from './data';

/**
 * Dispersão conectada: os meses de uma única plataforma, ligados na ordem do tempo por
 * segmentos retos. O início sai em anel vazado, o fim em ponto cheio, e só três meses recebem
 * rótulo, o primeiro, o último e a virada, para o texto não abafar a trajetória.
 */
export interface ConnectedScatterTrajectoryProps {
  readonly data?: readonly PlatformMonth[];
  readonly height?: number;
  readonly className?: string;
}

interface Point extends PlatformMonth {
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly isTurn: boolean;
}

const MARGIN = { top: 24, right: 28, bottom: 8, left: 8 } as const;
const DOMAIN_X: readonly [number, number] = [100, 250];
const TICKS_X = [100, 150, 200, 250] as const;
const DOMAIN_Y: readonly [number, number] = [0.1, 0.4];
const TICKS_Y = [0.1, 0.2, 0.3, 0.4] as const;
const Y_AXIS_WIDTH = 44;
const LINE_STROKE = 'var(--chart-1)';
const START_RADIUS = 4;
const MID_RADIUS = 3;
const END_RADIUS = 5;
const LABEL_GAP = 12;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** O mês em que o CPL muda de direção: onde a trajetória vira. Ignora as pontas. */
function findTurnIndex(rows: readonly PlatformMonth[]): number {
  for (let i = 1; i < rows.length - 1; i += 1) {
    const prev = rows[i - 1];
    const curr = rows[i];
    const next = rows[i + 1];
    if (!prev || !curr || !next) continue;
    const before = Math.sign(curr.cpl - prev.cpl);
    const after = Math.sign(next.cpl - curr.cpl);
    if (before !== 0 && after !== 0 && before !== after) return i;
  }
  return -1;
}

interface PointShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: Point;
}

export default function ConnectedScatterTrajectory({ data = defaultData, height, className }: ConnectedScatterTrajectoryProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = [...data].sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0));

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: a plataforma não tem CPL e qualificação registrados.</span>
      </div>
    );
  }

  const turnIndex = findTurnIndex(rows);
  const points: Point[] = rows.map((row, index) => ({
    ...row,
    isFirst: index === 0,
    isLast: index === rows.length - 1,
    isTurn: index === turnIndex,
  }));
  const first = points[0];
  const last = points[points.length - 1];
  const turn = turnIndex >= 0 ? points[turnIndex] : undefined;

  const summary = [
    first && last
      ? `Gráfico de dispersão conectada com CPL e qualificação da plataforma A, de ${formatMonthShort(first.month)} a ${formatMonthShort(last.month)}.`
      : '',
    first ? `Começa em ${formatCurrencyCompact(first.cpl)}.` : '',
    turn ? `Vira em ${formatMonthShort(turn.month)}, no menor CPL.` : '',
    last ? `Termina em ${formatCurrencyCompact(last.cpl)}, com ${formatPercent(last.taxaQualificacao)} de qualificação.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const reading = turn
    ? `CPL cai até ${formatMonthShort(turn.month)} e volta a subir; qualificação faz o movimento espelhado.`
    : 'CPL e qualificação seguem a mesma direção ao longo dos 12 meses.';

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'cpl', name: 'CPL', value: formatCurrencyCompact(point.cpl) },
      { dataKey: 'taxaQualificacao', name: 'Qualificação', value: formatPercent(point.taxaQualificacao) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={formatMonthShort(point.month)} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  const renderPoint = ({ cx, cy, payload }: PointShapeProps): ReactElement | null => {
    if (cx === undefined || cy === undefined || !payload) return null;
    if (payload.isFirst) {
      return <circle cx={cx} cy={cy} fill="var(--surface-raised)" r={START_RADIUS} stroke={LINE_STROKE} strokeWidth={2} />;
    }
    if (payload.isLast) {
      return <circle cx={cx} cy={cy} fill={LINE_STROKE} r={END_RADIUS} />;
    }
    return <circle cx={cx} cy={cy} fill={payload.isTurn ? LINE_STROKE : 'var(--surface-raised)'} r={MID_RADIUS} stroke={LINE_STROKE} strokeWidth={payload.isTurn ? 0 : 1.5} />;
  };

  const renderMonthLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    const point = index === undefined ? undefined : points[index];
    if (x === undefined || y === undefined || !point) return null;
    if (!point.isFirst && !point.isLast && !point.isTurn) return null;
    const py = Number(y);
    const above = point.isTurn ? py - LABEL_GAP - 4 : py - LABEL_GAP;
    return (
      <text className="font-sans" dominantBaseline="auto" fill="var(--text-secondary)" fontSize={11} style={HALO} textAnchor="middle" x={Number(x)} y={above}>
        {formatMonthShort(point.month)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="cpl" domain={DOMAIN_X} name="CPL" tickFormatter={formatCurrencyAxis} tickMargin={8} ticks={[...TICKS_X]} type="number" />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="taxaQualificacao"
              domain={DOMAIN_Y}
              name="Qualificação"
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter
              data={points}
              isAnimationActive={animate}
              line={{ stroke: LINE_STROKE, strokeWidth: 2 }}
              lineJointType="linear"
              lineType="joint"
              shape={renderPoint}
            >
              <LabelList content={renderMonthLabel} dataKey="month" />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
