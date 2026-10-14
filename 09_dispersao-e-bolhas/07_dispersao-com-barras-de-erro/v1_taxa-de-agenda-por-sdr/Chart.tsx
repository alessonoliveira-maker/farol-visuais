import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ErrorBar,
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
import { CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SdrAgendaCount } from './data';

/**
 * Dispersão com barra de erro: cada ponto é a taxa de agenda de um SDR no mês, com leads
 * trabalhados no eixo horizontal e a taxa no vertical. O traço em cada ponto é o intervalo de
 * 95% de confiança pelo método de Wilson, calculado a partir da contagem, não uma faixa
 * declarada à mão: quem trabalhou poucos leads carrega um intervalo largo, e a diferença entre
 * dois SDRs só é real quando os intervalos não se sobrepõem.
 */
export interface SdrAgendaScatterProps {
  readonly data?: readonly SdrAgendaCount[];
  readonly height?: number;
  readonly className?: string;
}

interface Point {
  readonly id: string;
  readonly name: string;
  readonly leadsTrabalhados: number;
  readonly agendas: number;
  readonly rate: number;
  readonly lower: number;
  readonly upper: number;
  readonly errorY: readonly [number, number];
}

const MARGIN = { top: 12, right: 20, bottom: 8, left: 8 } as const;
const DOMAIN_X: readonly [number, number] = [0, 100];
const TICKS_X = [0, 25, 50, 75, 100] as const;
const DOMAIN_Y: readonly [number, number] = [0, 0.45];
const TICKS_Y = [0, 0.15, 0.3, 0.45] as const;
const Y_AXIS_WIDTH = 40;
/** Serifa curta: o padrão da biblioteca (5 px) já é discreto, mantido explícito. */
const ERROR_BAR_WIDTH = 5;
const AXIS_TICK = { fill: 'var(--text-muted)', fontSize: 11 } as const;

/**
 * Intervalo de 95% de confiança de Wilson para uma proporção `k/n`.
 * Devolve os limites absolutos; quem chama converte em distância a partir do ponto, porque é
 * isso que o `dataKey` do `ErrorBar` espera (ponto delicado do modelo).
 */
function wilson95(k: number, n: number): { readonly lower: number; readonly upper: number } {
  const z = 1.96;
  const z2 = z * z;
  const p = k / n;
  const center = (p + z2 / (2 * n)) / (1 + z2 / n);
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / (1 + z2 / n);
  return { lower: center - half, upper: center + half };
}

export default function SdrAgendaScatter({ data = defaultData, height, className }: SdrAgendaScatterProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum SDR neste recorte com leads trabalhados no período.</span>
      </div>
    );
  }

  const points: Point[] = data.map((row) => {
    const rate = row.agendas / row.leadsTrabalhados;
    const { lower, upper } = wilson95(row.agendas, row.leadsTrabalhados);
    return {
      id: row.id,
      name: row.name,
      leadsTrabalhados: row.leadsTrabalhados,
      agendas: row.agendas,
      rate,
      lower,
      upper,
      errorY: [rate - lower, upper - rate],
    };
  });

  let leader = points[0];
  if (!leader) return null;
  for (const point of points) {
    if (point.rate > leader.rate) leader = point;
  }

  const summary =
    `Gráfico de dispersão: taxa de agenda de ${String(points.length)} SDRs por leads trabalhados, ` +
    'com intervalo de 95% de Wilson. ' +
    `Lidera ${leader.name}, ${formatRateWithVolume(leader.agendas, leader.leadsTrabalhados)}. ` +
    'Intervalos mais largos vêm de quem trabalhou menos leads.';

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const point = props.payload?.[0]?.payload as Point | undefined;
    if (!point) return null;
    const entries = [
      { dataKey: 'rate', name: 'Taxa de agenda', value: formatRateWithVolume(point.agendas, point.leadsTrabalhados) },
      { dataKey: 'interval', name: 'Intervalo de 95%', value: `${formatPercent(point.lower)} a ${formatPercent(point.upper)}` },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={point.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Cada traço é o intervalo de <span className="font-display font-medium text-text-primary">95%</span> de
        confiança pelo método de Wilson
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" />
            <XAxis
              axisLine={false}
              dataKey="leadsTrabalhados"
              domain={DOMAIN_X}
              name="Leads trabalhados"
              tick={AXIS_TICK}
              tickFormatter={(value: number) => `${formatInt(value)} leads`}
              tickLine={false}
              tickMargin={8}
              ticks={[...TICKS_X]}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="rate"
              domain={DOMAIN_Y}
              name="Taxa de agenda"
              tick={AXIS_TICK}
              tickFormatter={(value: number) => formatPercent(value, 0)}
              tickLine={false}
              tickMargin={8}
              ticks={[...TICKS_Y]}
              type="number"
              width={Y_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={points} fill="var(--chart-1)" isAnimationActive={animate}>
              <ErrorBar dataKey="errorY" direction="y" isAnimationActive={animate} stroke="var(--text-muted)" width={ERROR_BAR_WIDTH} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
