import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  usePlotArea,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LossParent } from './data';

/** Cascata de um passo aberto cujos filhos não somam o pai: a parte sem motivo vira passo próprio. */
export interface UnclassifiedBridgeProps {
  readonly data?: LossParent;
  readonly height?: number;
  readonly className?: string;
}

/**
 * ESP-6, série única: corpo ≈ 574 x 225 px (card, leitura em duas linhas), menos a leitura (≈ 40 px)
 * e a margem de 8 px, ≈ 177 px de gráfico; 6 colunas em 574 − 16 = 558 px dão passo = 93 px;
 * barra = min(24, 93 × (1 − 2 × 0,32) ≈ 33) = 24 px. O eixo de nomes ganha duas linhas (44 px)
 * porque "Sem motivo registrado" e "Perdas na proposta" quebram em 93 px.
 */
const MARGIN = { top: 24, right: 8, bottom: 0, left: 8 } as const;
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const CATEGORY_AXIS_HEIGHT = 44;
/** Largura do tique menor que a banda (93 px): sem ela o Recharts não quebra o nome e ele invade o vizinho. */
const TICK_WIDTH = 84;
const LABEL_GAP = 6;
const CORNER = 3;
const REST_LABEL = 'Sem motivo registrado';

interface Row {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly kind: 'step' | 'rest' | 'total';
  readonly low: number;
  readonly high: number;
  readonly range: readonly [number, number];
  readonly isLast: boolean;
}

interface StepShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: Row;
}

/** Parte de um todo; `null` quando o todo não é positivo (EST-1b). */
function share(part: number, whole: number): number | null {
  return whole > 0 ? part / whole : null;
}

/** Quanto o pai tem a mais que a soma dos filhos; `null` sem filhos, `0` quando fecha. */
function unclassified(parent: LossParent): number | null {
  if (parent.parts.length === 0) return null;
  return parent.value - parent.parts.reduce((sum, part) => sum + part.value, 0);
}

/** Texto do rótulo: a contagem e, entre parênteses, a parte das perdas do pai. */
function countLabel(value: number, whole: number): string {
  const part = share(value, whole);
  return part === null ? formatInt(value) : `${formatInt(value)} (${formatPercent(part, 0)})`;
}

/** Motivos em ordem do dado, a parte sem motivo por último entre os passos, e o pai ancorado no zero. */
function buildRows(parent: LossParent): readonly Row[] {
  const rest = unclassified(parent);
  const items = [
    ...parent.parts.map((part) => ({ id: part.id, label: part.label, value: part.value, kind: 'step' as const })),
    ...(rest !== null && rest > 0 ? [{ id: 'sem-motivo', label: REST_LABEL, value: rest, kind: 'rest' as const }] : []),
    { id: 'pai', label: parent.label, value: parent.value, kind: 'total' as const },
  ];
  let running = 0;
  return items.map((item, index) => {
    const low = item.kind === 'total' ? 0 : running;
    const high = item.kind === 'total' ? item.value : running + item.value;
    running = high;
    return { ...item, low, high, range: [low, high], isLast: index === items.length - 1 };
  });
}

/**
 * O shape desenha a coluna, o rótulo e o conector. A parte sem motivo é contorno tracejado, sem
 * preenchimento: ausência não tem a cor de nenhum motivo. A largura da banda vem de usePlotArea, que
 * só funciona dentro de um componente e não numa função de shape.
 */
function Step({ x = 0, y = 0, width = 0, height = 0, payload, count, whole }: StepShapeProps & { readonly count: number; readonly whole: number }): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  // Recharts pode devolver altura com sinal: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const thickness = Math.max(Math.abs(height), 2);
  const isTotal = payload.kind === 'total';
  const isRest = payload.kind === 'rest';
  const band = plot ? plot.width / count : 0;
  return (
    <g>
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={top} y2={top} />
      ) : null}
      {isRest ? (
        <rect fill="none" height={thickness} rx={CORNER} stroke="var(--text-muted)" strokeDasharray="4 3" strokeWidth={1.5} width={width} x={x} y={top} />
      ) : (
        <rect fill={isTotal ? 'var(--chart-1)' : 'var(--text-secondary)'} height={thickness} rx={CORNER} width={width} x={x} y={top} />
      )}
      <text
        className="font-display"
        fill={isTotal ? 'var(--text-primary)' : isRest ? 'var(--text-muted)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={isTotal || isRest ? 600 : 500}
        textAnchor="middle"
        x={x + width / 2}
        y={top - LABEL_GAP}
      >
        {isTotal ? formatInt(payload.value) : countLabel(payload.value, whole)}
      </text>
    </g>
  );
}

export default function UnclassifiedBridge({ data = defaultData, height, className }: UnclassifiedBridgeProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.parts.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum motivo neste recorte: não há perda registrada na proposta para montar a cascata.
      </div>
    );
  }

  const rows = buildRows(data);
  const rest = unclassified(data);
  const restShare = rest === null ? null : share(rest, data.value);
  const peak = rows.reduce((max, row) => Math.max(max, row.high), 0);
  const motives = data.parts.map((part) => `${part.label.toLowerCase()} ${formatInt(part.value)}`).join(', ');
  const restText =
    rest === null || rest === 0
      ? ' Os motivos fecham o total.'
      : rest > 0
        ? ` ${formatInt(rest)} perdas${restShare === null ? '' : ` (${formatPercent(restShare, 0)})`} não têm motivo registrado e ficam em um passo próprio.`
        : ` Os motivos passam do total em ${formatInt(Math.abs(rest))} perdas.`;
  const summary = `Gráfico de cascata das ${formatInt(data.value)} perdas na proposta em ${data.period}: ${motives}.${restText}`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as Row | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const part = share(row.value, data.value);
    const payload = [
      { ...base, color: row.kind === 'total' ? 'var(--chart-1)' : row.kind === 'rest' ? 'var(--text-muted)' : 'var(--text-secondary)', name: 'Perdas', value: `${formatInt(row.value)} perdas` },
      ...(row.kind === 'total' || part === null ? [] : [{ ...base, color: 'var(--text-muted)', name: 'Parte das perdas na proposta', value: formatPercent(part, 1) }]),
    ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="tabular-nums mb-2 shrink-0 text-xs font-medium text-text-secondary">
        {rest !== null && rest > 0
          ? `${formatInt(rest)} perdas${restShare === null ? '' : ` (${formatPercent(restShare, 0)})`} sem motivo registrado ficam num passo próprio, sem redistribuir entre os motivos`
          : rest !== null && rest < 0
            ? `Os motivos passam das ${formatInt(data.value)} perdas em ${formatInt(Math.abs(rest))}`
            : `Os motivos fecham as ${formatInt(data.value)} perdas na proposta`}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <XAxis {...AXIS_PROPS} axisLine={false} tick={{ ...AXIS_PROPS.tick, width: TICK_WIDTH }} dataKey="label" height={CATEGORY_AXIS_HEIGHT} interval={0} tickMargin={8} />
            <YAxis domain={[0, peak]} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <Step {...props} count={rows.length} whole={data.value} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
