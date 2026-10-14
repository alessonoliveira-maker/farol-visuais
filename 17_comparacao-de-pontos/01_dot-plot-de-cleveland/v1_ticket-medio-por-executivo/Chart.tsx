import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  usePlotArea,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveTicket } from './data';

/**
 * Dot plot de Cleveland: um ponto por executivo sobre um eixo de valor comum, com as linhas em
 * ordem decrescente de ticket médio e a mediana do time como referência. A escala começa em
 * R$ 120 mil e não no zero, porque o leitor julga a posição do ponto e não um comprimento.
 */
export interface TicketDotPlotProps {
  readonly data?: readonly ExecutiveTicket[];
  readonly height?: number;
  readonly className?: string;
}

/** Domínio e tiques vêm do registry da métrica e não mudam com o filtro (EIX-9). */
const X_DOMAIN: [number, number] = [120_000, 360_000];
const X_TICKS = [120_000, 180_000, 240_000, 300_000, 360_000];
const MARGIN = { top: 20, right: 56, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 140;
const X_AXIS_HEIGHT = 26;
/** Passo da linha: também é a altura da área sensível ao cursor. */
const ROW_STEP = 24;
const DOT_RADIUS = 5;
const VALUE_LABEL_GAP = 8;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 3 } as const;
const LOCALE = 'pt-BR';

interface TicketRow extends ExecutiveTicket {
  readonly rank: number;
}

interface DotShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: TicketRow;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Maior ticket primeiro; empate resolvido pelo nome para a ordem não mudar a cada recarga. */
function rankByTicket(rows: readonly ExecutiveTicket[]): TicketRow[] {
  return [...rows]
    .sort((a, b) => b.ticket - a.ticket || a.name.localeCompare(b.name, LOCALE))
    .map((row, rank) => ({ ...row, rank }));
}

/** Mediana de uma lista; lista vazia devolve null, nunca zero (EST-1b). */
function median(values: readonly number[]): number | null {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const upper = sorted[mid];
  if (upper === undefined) return null;
  if (sorted.length % 2 === 1) return upper;
  const lower = sorted[mid - 1];
  return lower === undefined ? null : (lower + upper) / 2;
}

/** Sinal à mão sobre o valor absoluto, com o menos tipográfico (NUM-3). */
function signedCurrency(value: number): string {
  return `${value < 0 ? '−' : '+'}${formatCurrencyCompact(Math.abs(value))}`;
}

function NameTick({ y, label }: NameTickProps & { readonly label: string }): ReactElement {
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
      {label}
    </text>
  );
}

/**
 * Ponto, valor escrito e a banda inteira da linha como alvo do cursor. O retângulo sem pintura
 * recebe o mouse por `pointerEvents="all"`; a largura vem da área de plotagem, que a forma própria
 * do Scatter não recebe (REC-31: ela só ganha cx, cy e a linha do dado).
 */
function DotShape({ cx, cy, payload }: DotShapeProps): ReactElement | null {
  const area = usePlotArea();
  if (cx === undefined || cy === undefined || payload === undefined || area === undefined) return null;
  return (
    <g>
      <rect fill="none" height={ROW_STEP} pointerEvents="all" width={area.width} x={area.x} y={cy - ROW_STEP / 2} />
      <circle cx={cx} cy={cy} fill="var(--chart-1)" r={DOT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} />
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-secondary)"
        fontSize={11}
        fontWeight={500}
        style={HALO}
        x={cx + DOT_RADIUS + VALUE_LABEL_GAP}
        y={cy}
      >
        {formatCurrencyCompact(payload.ticket)}
      </text>
    </g>
  );
}

export default function TicketDotPlot({ data = defaultData, height, className }: TicketDotPlotProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = rankByTicket(data);
  const leader = rows[0];
  const last = rows[rows.length - 1];
  const teamMedian = median(rows.map((row) => row.ticket));

  if (!leader || !last || teamMedian === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não houve ticket médio medido no trimestre.</span>
      </div>
    );
  }

  const medianText = formatCurrencyCompact(teamMedian);
  const gap = leader.ticket - teamMedian;
  const summary = [
    `Gráfico de pontos com o ticket médio de ${formatInt(rows.length)} executivos no trimestre, do maior para o menor.`,
    `Lidera ${leader.name}, com ${formatCurrencyCompact(leader.ticket)}; o menor é ${last.name}, com ${formatCurrencyCompact(last.ticket)}.`,
    `Mediana do time: ${medianText}. A escala começa em ${formatCurrencyAxis(X_DOMAIN[0])}.`,
  ].join(' ');

  const names = rows.map((row) => row.name);
  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;
  /** Linhas de zebra: as ímpares, em faixa inteira, atrás da grade (zIndex abaixo dos −100 dela). */
  const zebra = rows.filter((row) => row.rank % 2 === 1);

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as TicketRow | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'ticket', name: 'Ticket médio', value: formatCurrencyCompact(row.ticket) },
      { dataKey: 'deals', name: 'Negócios fechados', value: `${formatInt(row.deals)} negócios` },
      { dataKey: 'gap', name: 'Contra a mediana', value: signedCurrency(row.ticket - teamMedian) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="font-semibold text-text-primary">{leader.name}</span> lidera com{' '}
        <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(leader.ticket)}</span>,{' '}
        <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(gap)}</span> acima da mediana do time
      </p>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            {/* Zebra atrás da grade: o padrão da ReferenceArea (zIndex 100) pintaria sobre as linhas de grade (zIndex −100) e as apagaria. */}
            {zebra.map((row) => (
              <ReferenceArea fill="var(--surface-sunken)" ifOverflow="visible" key={row.id} stroke="none" y1={row.rank - 0.5} y2={row.rank + 0.5} zIndex={-150} />
            ))}
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="ticket"
              domain={X_DOMAIN}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickLine={false}
              tickMargin={8}
              ticks={X_TICKS}
              type="number"
            />
            {/* Eixo de linhas numérico: a linha i ocupa de i−0,5 a i+0,5. `reversed` põe a posição 0
                no alto, que é onde mora o maior ticket (sentido conferido no render, REC-3). */}
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="rank"
              domain={[-0.5, rows.length - 0.5]}
              interval={0}
              reversed
              tick={(props: NameTickProps) => <NameTick {...props} label={names[Number(props.payload?.value)] ?? ''} />}
              tickLine={false}
              ticks={rows.map((row) => row.rank)}
              type="number"
              width={NAME_AXIS_WIDTH}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={({ viewBox }: { viewBox?: { x?: number; y?: number } }) => (
                <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x} y={(viewBox?.y ?? 0) - 6}>
                  {`mediana ${medianText}`}
                </text>
              )}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              x={teamMedian}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={rows} isAnimationActive={animate} shape={(props: DotShapeProps) => <DotShape {...props} />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Ordenado do maior para o menor ticket médio. A escala começa em {formatCurrencyAxis(X_DOMAIN[0])}, não no zero.
      </p>
    </div>
  );
}
