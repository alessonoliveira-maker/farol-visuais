import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, goodDirection, type SlaRow } from './data';

/**
 * Dumbbell do SLA de primeiro contato: cada SDR é uma linha com duas cabeças, a da semana passada
 * vazada e a da atual cheia, ligadas por um conector colorido pela polaridade. A linha de cima é
 * quem mais piorou, e o delta com sinal fica escrito na ponta livre.
 */
export interface SlaDumbbellProps {
  readonly data?: readonly SlaRow[];
  readonly height?: number;
  readonly className?: string;
}

/** Domínio fixo em minutos: a mesma posição vale o mesmo SLA em qualquer recorte. */
const X_DOMAIN: [number, number] = [0, 60];
const X_TICKS = [0, 15, 30, 45, 60];
const MARGIN = { top: 4, right: 64, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 150;
const X_AXIS_HEIGHT = 24;
const ROW_STEP = 18;
const HEAD_RADIUS = 5;
const HEAD_STROKE = 2;
const ZERO_RING_EXTRA = 2;
const CONNECTOR_WIDTH = 3;
const VALUE_LABEL_GAP = 8;
const HEAD_BEFORE_COLOR = 'var(--chart-3)';
const HEAD_AFTER_COLOR = 'var(--chart-1)';

interface SlaShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: SlaRow;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** A faixa de cada linha: menor e maior, nessa ordem, sempre. Quem é o antes não está aqui. */
function bandOf(row: SlaRow): [number, number] {
  return [Math.min(row.previous, row.current), Math.max(row.previous, row.current)];
}

/** Maior piora primeiro; empate pelo nome para a ordem não mudar a cada recarga. */
function rankByWorsening(rows: readonly SlaRow[]): SlaRow[] {
  return [...rows].sort((a, b) => b.current - b.previous - (a.current - a.previous) || a.name.localeCompare(b.name, 'pt-BR'));
}

/** Cor do conector pela polaridade: com `down` como bom, cair é positivo. Sem mudança, neutro. */
function connectorColor(delta: number): string {
  if (delta === 0) return 'var(--text-secondary)';
  const isGood = goodDirection === 'down' ? delta < 0 : delta > 0;
  return isGood ? 'var(--positive)' : 'var(--negative)';
}

/** Sinal à mão sobre o valor absoluto, com o menos tipográfico (NUM-3). Zero é escrito, não omitido. */
function signedMinutes(delta: number): string {
  if (delta === 0) return 'sem mudança';
  return `${delta < 0 ? '−' : '+'}${formatInt(Math.abs(delta))} min`;
}

function NameTick({ y, payload }: NameTickProps): ReactElement {
  return (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );
}

/**
 * A faixa chega como [menor, maior] e `x`/`width` seguem isso, então a cabeça inicial é a ponta
 * esquerda só quando a semana passada foi a menor: o sentido sai do payload (REC-5), nunca da
 * posição. A linha de variação zero também chega aqui, porque a forma própria não descarta a marca
 * de largura zero (REC-11), e as duas cabeças se sobrepõem no mesmo ponto.
 */
function DumbbellShape({ x, y, width, height, payload }: SlaShapeProps): ReactElement | null {
  if (x === undefined || y === undefined || width === undefined || height === undefined || payload === undefined) return null;
  const left = Math.min(x, x + width);
  const right = Math.max(x, x + width);
  const beforeX = payload.previous <= payload.current ? left : right;
  const afterX = payload.previous <= payload.current ? right : left;
  const centerY = y + height / 2;
  const delta = payload.current - payload.previous;
  const labelX = right + HEAD_RADIUS + VALUE_LABEL_GAP;
  return (
    <g>
      <line stroke={connectorColor(delta)} strokeLinecap="round" strokeWidth={CONNECTOR_WIDTH} x1={beforeX} x2={afterX} y1={centerY} y2={centerY} />
      {/* Variação zero: a cabeça cheia cobriria a vazada, então o anel cresce e a semana igual continua visível. */}
      <circle
        cx={beforeX}
        cy={centerY}
        fill="var(--surface-raised)"
        r={delta === 0 ? HEAD_RADIUS + ZERO_RING_EXTRA : HEAD_RADIUS}
        stroke={HEAD_BEFORE_COLOR}
        strokeWidth={HEAD_STROKE}
      />
      <circle cx={afterX} cy={centerY} fill={HEAD_AFTER_COLOR} r={HEAD_RADIUS} />
      <text
        className="font-display"
        dominantBaseline="central"
        fill={delta === 0 ? 'var(--text-secondary)' : connectorColor(delta)}
        fontSize={12}
        fontWeight={600}
        x={labelX}
        y={centerY}
      >
        {signedMinutes(delta)}
      </text>
    </g>
  );
}

export default function SlaDumbbell({ data = defaultData, height, className }: SlaDumbbellProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  /** A ordem do array é a ordem no eixo; o primeiro item fica no alto, conferido no render (REC-3). */
  const rows = rankByWorsening(data);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum SDR neste recorte: não há SLA medido nas duas semanas para comparar.</span>
      </div>
    );
  }

  const worst = rows[0];
  const worstDelta = worst === undefined ? 0 : worst.current - worst.previous;
  const improved = rows.filter((row) => row.current < row.previous).length;
  const summary = [
    `Gráfico de halteres com o SLA de primeiro contato de ${formatInt(rows.length)} SDRs, da semana passada para a atual, em minutos.`,
    `${formatInt(improved)} de ${formatInt(rows.length)} melhoraram.`,
    worst && worstDelta > 0
      ? `Maior piora: ${worst.name}, de ${formatInt(worst.previous)} para ${formatInt(worst.current)} min.`
      : 'Nenhum SDR piorou.',
  ].join(' ');

  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as SlaRow | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'previous', name: 'Semana passada', value: `${formatInt(row.previous)} min` },
      { dataKey: 'current', name: 'Semana atual', value: `${formatInt(row.current)} min` },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {worst && worstDelta > 0 ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          Maior piora: <span className="font-semibold text-text-primary">{worst.name}</span>, de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(worst.previous)}</span> para{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(worst.current)}</span> min
        </p>
      ) : (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          Nenhum SDR piorou da semana passada para a atual
        </p>
      )}
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-4 text-text-secondary">
        <li className="flex items-center gap-2">
          <span className="box-border size-3 shrink-0 rounded-full border-2 bg-surface-raised" style={{ borderColor: HEAD_BEFORE_COLOR }} />
          Semana passada
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: HEAD_AFTER_COLOR }} />
          Semana atual
        </li>
        <li className="flex items-center gap-2">
          <span className="h-[3px] w-4 shrink-0 rounded-full bg-positive" />
          Caiu, melhor
        </li>
        <li className="flex items-center gap-2">
          <span className="h-[3px] w-4 shrink-0 rounded-full bg-negative" />
          Subiu, pior
        </li>
      </ul>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} data={rows} layout="vertical" margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={X_DOMAIN}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => `${formatInt(value)} min`}
              tickLine={false}
              tickMargin={8}
              ticks={X_TICKS}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="name"
              interval={0}
              tick={NameTick}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey={bandOf} isAnimationActive={animate} shape={(props: SlaShapeProps) => <DumbbellShape {...props} />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
