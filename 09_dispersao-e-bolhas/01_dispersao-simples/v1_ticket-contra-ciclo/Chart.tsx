import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WonOpportunity } from './data';

/**
 * Dispersão simples: cada ponto é uma oportunidade ganha, posicionada pelo ticket em reais no
 * eixo horizontal e pelo ciclo de venda em dias no eixo vertical. A forma da nuvem diz se ticket
 * maior anda junto de ciclo maior; oportunidade sem os dois valores sai do plano e vai ao rodapé.
 */
export interface WonOpportunityScatterProps {
  readonly data?: readonly WonOpportunity[];
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly name: string;
  readonly ticketValor: number;
  readonly cicloDias: number;
}

const MARGIN = { top: 12, right: 20, bottom: 8, left: 8 } as const;
const DOMAIN_X: readonly [number, number] = [0, 400_000];
const TICKS_X = [0, 100_000, 200_000, 300_000, 400_000] as const;
const DOMAIN_Y: readonly [number, number] = [0, 180];
const TICKS_Y = [0, 45, 90, 135, 180] as const;
const Y_AXIS_WIDTH = 56;
/** Abaixo de 1: revela os dois pontos empilhados em (R$ 128 mil, 42 dias). */
const POINT_FILL_OPACITY = 0.7;

export default function WonOpportunityScatter({ data = defaultData, height, className }: WonOpportunityScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const points: Point[] = data
    .filter((row): row is WonOpportunity & { ticketValor: number; cicloDias: number } => row.ticketValor !== null && row.cicloDias !== null)
    .map((row) => ({ id: row.id, name: row.name, ticketValor: row.ticketValor, cicloDias: row.cicloDias }));
  const missingCount = data.length - points.length;

  if (points.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade neste recorte com ticket e ciclo registrados.</span>
      </div>
    );
  }

  const ticketValues = points.map((point) => point.ticketValor);
  const cicloValues = points.map((point) => point.cicloDias);
  const minTicket = Math.min(...ticketValues);
  const maxTicket = Math.max(...ticketValues);
  const minCiclo = Math.min(...cicloValues);
  const maxCiclo = Math.max(...cicloValues);

  const summary =
    `Gráfico de dispersão com ${String(points.length)} oportunidades ganhas, ticket no eixo horizontal ` +
    'e ciclo em dias no eixo vertical. ' +
    `Ticket de ${formatCurrencyCompact(minTicket)} a ${formatCurrencyCompact(maxTicket)}; ciclo de ${formatInt(minCiclo)} a ${formatInt(maxCiclo)} dias.` +
    (missingCount > 0 ? ` ${String(missingCount)} sem ticket ou ciclo registrado não aparecem.` : '');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'ticketValor', name: 'Ticket', value: formatCurrencyCompact(point.ticketValor) },
      { dataKey: 'cicloDias', name: 'Ciclo', value: formatDays(point.cicloDias) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Cada ponto é uma oportunidade ganha; <span className="tabular-nums">{formatInt(points.length)}</span> exibidas
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis {...AXIS_PROPS} dataKey="ticketValor" domain={DOMAIN_X} name="Ticket" tickFormatter={formatCurrencyAxis} tickMargin={8} ticks={[...TICKS_X]} type="number" />
            <YAxis {...AXIS_PROPS} dataKey="cicloDias" domain={DOMAIN_Y} name="Ciclo" tickFormatter={(value: number) => `${formatInt(value)} d`} tickMargin={8} ticks={[...TICKS_Y]} type="number" width={Y_AXIS_WIDTH} />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={points} fill="var(--chart-1)" fillOpacity={POINT_FILL_OPACITY} isAnimationActive={animate} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {missingCount > 0 ? (
        <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
          {`${String(missingCount)} sem ticket ou ciclo registrado não aparecem`}
        </p>
      ) : null}
    </div>
  );
}
