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
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type FlowKind, type FlowStep } from './data';

/** Cascata de decomposição das entradas até o desfecho: cada saída em degrau, até os ganhos. */
export interface FlowWaterfallProps {
  readonly data?: readonly FlowStep[];
  readonly height?: number;
  readonly className?: string;
}

/** Duas linhas de rótulo (contagem e substantivo) acima da coluna mais alta: 24 de respiro mais uma linha. */
const MARGIN = { top: 40, right: 8, bottom: 4, left: 8 } as const;
/**
 * ESP-6, série única: corpo ≈ 894 x 265 px (seção 13). Sem eixo de nomes (o substantivo vai no
 * rótulo), sobram 894 − 16 = 878 px; 8 colunas dão passo = 109,75 px; barra = min(24, 109,75 × 0,36) = 24 px.
 */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const LABEL_GAP = 6;
const NOUN_LINE = 14;
const MIN_MARK = 2;
const CORNER = 3;
/** Halo na cor do cartão (ROT-7): o rótulo da cauda fica rente ao conector e à linha de base. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface FlowRow extends FlowStep {
  readonly end: number;
  readonly range: readonly [number, number];
  readonly isLast: boolean;
}

interface StepShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: FlowRow;
}

/** Cada saída nasce onde a anterior terminou; a coluna de total reancora no zero. */
function buildRows(items: readonly FlowStep[]): readonly FlowRow[] {
  let running = 0;
  return items.map((item, index) => {
    const start = item.kind === 'total' ? 0 : running;
    const end = item.kind === 'total' ? item.value : running + item.value;
    running = end;
    return { ...item, end, range: [Math.min(start, end), Math.max(start, end)], isLast: index === items.length - 1 };
  });
}

/** Quanto a soma das saídas erra o fim menos o início; `null` sem início, fim ou saídas. */
function closureGap(items: readonly FlowStep[]): number | null {
  const first = items[0];
  const last = items[items.length - 1];
  const steps = items.filter((item) => item.kind !== 'total');
  if (!first || !last || first.kind !== 'total' || last.kind !== 'total' || steps.length === 0) return null;
  return last.value - first.value - steps.reduce((sum, item) => sum + item.value, 0);
}

/** Preenchimento, contorno e cor do texto por tipo: o em andamento é vazado, nunca perda. */
function paintOf(kind: FlowKind): { readonly fill: string; readonly text: string } {
  if (kind === 'total') return { fill: 'var(--chart-1)', text: 'var(--text-primary)' };
  if (kind === 'loss') return { fill: 'var(--negative)', text: 'var(--negative)' };
  if (kind === 'open') return { fill: 'none', text: 'var(--text-secondary)' };
  return { fill: 'var(--text-secondary)', text: 'var(--text-secondary)' };
}

/**
 * O shape desenha tudo da coluna: retângulo, rótulo de duas linhas com a contagem e o substantivo,
 * e o conector. O rótulo mora aqui e não num LabelList porque a cauda estreita (11 de 612) precisa
 * dele fora da marca, e a largura da banda vem de usePlotArea, que só funciona dentro de um componente.
 */
function FlowStepMark({ x = 0, y = 0, width = 0, height = 0, payload, count }: StepShapeProps & { readonly count: number }): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  const isTotal = payload.kind === 'total';
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const levelY = !isTotal && payload.value < 0 ? bottom : top;
  const band = plot ? plot.width / count : 0;
  const centerX = x + width / 2;
  const paint = paintOf(payload.kind);
  return (
    <g>
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={levelY} y2={levelY} />
      ) : null}
      <rect
        fill={paint.fill}
        height={Math.max(bottom - top, MIN_MARK)}
        rx={CORNER}
        stroke={payload.kind === 'open' ? 'var(--text-muted)' : undefined}
        strokeWidth={payload.kind === 'open' ? 1.5 : undefined}
        width={width}
        x={x}
        y={top}
      />
      <text
        className="font-display"
        fill={paint.text}
        fontSize={12}
        fontWeight={isTotal ? 600 : 500}
        style={HALO}
        textAnchor="middle"
        x={centerX}
        y={top - LABEL_GAP - NOUN_LINE}
      >
        {`${payload.value < 0 ? '−' : ''}${formatInt(Math.abs(payload.value))}`}
      </text>
      <text fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="middle" x={centerX} y={top - LABEL_GAP}>
        {payload.label.toLowerCase()}
      </text>
    </g>
  );
}

export default function FlowWaterfall({ data = defaultData, height, className }: FlowWaterfallProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhuma entrada neste recorte: sem oportunidades no período, não há o que decompor até os ganhos.
      </div>
    );
  }

  const rows = buildRows(data);
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  const exits = rows.filter((row) => row.kind !== 'total');
  const biggest = exits.reduce<FlowRow | null>((best, row) => (best === null || row.value < best.value ? row : best), null);
  const open = exits.find((row) => row.kind === 'open');
  const gap = closureGap(data);
  const peak = rows.reduce((max, row) => Math.max(max, row.range[1]), 0);
  const share = (row: FlowRow): string => (first.value === 0 ? '' : formatPercent(Math.abs(row.value) / first.value, 0));

  const biggestText = biggest ? `a maior saída é ${biggest.label.toLowerCase()}, com ${formatInt(Math.abs(biggest.value))}` : '';
  const reading =
    `Das ${formatInt(first.value)} ${first.label.toLowerCase()}, ${formatRateWithVolume(last.value, first.value)} viraram ${last.label.toLowerCase()}` +
    `${biggestText ? `; ${biggestText}` : ''}` +
    `${gap !== null && gap !== 0 ? `; as saídas não fecham em ${formatInt(Math.abs(gap))}` : ''}`;
  const summary =
    `Gráfico de cascata das ${formatInt(first.value)} ${first.label.toLowerCase()} do mês até ${formatInt(last.value)} ${last.label.toLowerCase()}. ` +
    `${biggest ? `A maior saída é ${biggest.label.toLowerCase()}, com ${formatInt(Math.abs(biggest.value))}, ${share(biggest)} das entradas. ` : ''}` +
    `${open ? `${formatInt(Math.abs(open.value))} seguem em andamento.` : ''}`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as FlowRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const color = paintOf(row.kind).fill === 'none' ? 'var(--text-muted)' : paintOf(row.kind).fill;
    const payload =
      row.kind === 'total'
        ? [{ ...base, color, name: 'Contagem exata', value: `${formatInt(row.value)} ${row.label.toLowerCase()}` }]
        : [
            { ...base, color, name: 'Parte das entradas', value: share(row) },
            { ...base, color: 'var(--text-muted)', name: 'Restam após o passo', value: `${formatInt(row.end)} entradas` },
          ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs font-medium text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <XAxis dataKey="id" hide />
            <YAxis allowDecimals={false} domain={[0, peak]} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <FlowStepMark {...props} count={rows.length} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
