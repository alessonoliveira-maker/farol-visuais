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
import { formatCurrency, formatCurrencyAxis, formatDecimal, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, reference as defaultReference, type LayerItem, type LayerReference } from './data';

/** Ponte deitada do custo em camadas: passos flutuantes, subtotais ancorados e vão entre blocos. */
export interface LayeredCostBridgeProps {
  readonly data?: readonly LayerItem[];
  readonly reference?: LayerReference;
  readonly height?: number;
  readonly className?: string;
}

/** Margem direita reserva o rótulo "R$ 390 mil" (≈ 66 px em 12 px) depois da ponta mais longa. */
const MARGIN = { top: 4, right: 84, bottom: 4, left: 0 } as const;
/**
 * ESP-6, série única: corpo ≈ 574 x 441 px, menos a linha de leitura (≈ 40 px com duas linhas) e a
 * margem de 8 px, ≈ 390 px; 10 linhas dão banda ≈ 39 px; barra = min(24, 39 × (1 − 2 × 0,3)) ≈ 15,6 px.
 * Eixo de nomes: o preview quebrou "Camada 2, com estrutura" (23 caracteres) em duas linhas mesmo com 164 px;
 * "Camada 2, estrutura" (19) cabe em uma linha com 148 px, conferido no preview.
 */
const BAR_CATEGORY_GAP = '30%';
const BAR_MAX = 24;
const NAME_AXIS_WIDTH = 148;
const LABEL_GAP = 6;
const CORNER = 3;

interface LayerRow extends LayerItem {
  readonly low: number;
  readonly high: number;
  readonly end: number;
  readonly range: readonly [number, number];
  /** Linhas até a próxima barra de verdade: o conector atravessa as espaçadoras. */
  readonly span: number;
  readonly isLast: boolean;
}

interface StepShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: LayerRow;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signedCurrency(value: number): string {
  if (value === 0) return formatCurrencyAxis(0);
  return `${value > 0 ? '+' : '−'}${formatCurrencyAxis(Math.abs(value))}`;
}

/** Passo nasce onde o anterior terminou; subtotal reancora no zero; espaçadora não mexe em nada. */
function buildRows(items: readonly LayerItem[]): readonly LayerRow[] {
  let running = 0;
  return items.map((item, index) => {
    const start = item.kind === 'total' ? 0 : running;
    const end = item.kind === 'total' ? item.value : item.kind === 'gap' ? running : running + item.value;
    const low = item.kind === 'gap' ? 0 : Math.min(start, end);
    const high = item.kind === 'gap' ? 0 : Math.max(start, end);
    running = end;
    let span = 1;
    while (items[index + span]?.kind === 'gap') span += 1;
    return { ...item, low, high, end, range: [low, high], span, isLast: index === items.length - 1 };
  });
}

/** Soma dos desvios entre cada subtotal e o acumulado dos passos antes dele; `null` sem subtotal. */
function subtotalGap(items: readonly LayerItem[]): number | null {
  let running = 0;
  let mismatch = 0;
  let totals = 0;
  for (const item of items) {
    if (item.kind === 'step') running += item.value;
    if (item.kind === 'total') {
      mismatch += Math.abs(item.value - running);
      running = item.value;
      totals += 1;
    }
  }
  return totals === 0 ? null : mismatch;
}

/**
 * O shape desenha a barra, o rótulo na ponta livre e o conector vertical até a próxima barra. A
 * altura da banda vem de usePlotArea (só um componente chama hook, não uma função de shape).
 */
function LayerStep({ x = 0, y = 0, width = 0, height = 0, payload, count }: StepShapeProps & { readonly count: number }): ReactElement | null {
  const plot = usePlotArea();
  if (!payload || payload.kind === 'gap') return null;
  const isTotal = payload.kind === 'total';
  // Recharts pode devolver dimensão com sinal em faixa invertida: normaliza antes da conta.
  const left = Math.min(x, x + width);
  const right = Math.max(x, x + width);
  const thickness = Math.abs(height);
  const top = Math.min(y, y + height);
  const levelX = !isTotal && payload.value < 0 ? left : right;
  const band = plot ? plot.height / count : 0;
  const text = isTotal ? formatCurrencyAxis(payload.value) : signedCurrency(payload.value);
  return (
    <g>
      {!payload.isLast && band > 0 ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={levelX} x2={levelX} y1={top + thickness} y2={top + payload.span * band} />
      ) : null}
      <rect fill={isTotal ? 'var(--chart-1)' : 'var(--text-secondary)'} height={Math.max(thickness, 1)} rx={CORNER} width={Math.max(right - left, 1)} x={left} y={top} />
      <text
        className="font-display"
        fill={isTotal ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={isTotal ? 600 : 500}
        x={right + LABEL_GAP}
        y={top + thickness / 2 + 4}
      >
        {text}
      </text>
    </g>
  );
}

export default function LayeredCostBridge({ data = defaultData, reference = defaultReference, height, className }: LayeredCostBridgeProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = buildRows(data);
  const layers = rows.filter((row) => row.kind === 'total');

  if (layers.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhuma camada neste recorte: não há subtotal de custo registrado para montar a ponte.
      </div>
    );
  }

  const gap = subtotalGap(data);
  const peak = rows.reduce((max, row) => Math.max(max, row.high), 0);
  const labels = new Map(rows.map((row) => [row.id, row.label] as const));
  const multiples = layers.map((layer) => (layer.value > 0 ? `${formatDecimal(reference.returnValue / layer.value, 1)}x` : null));
  // Cada múltiplo leva o nome curto da camada dele ("camada 1"), na ordem do eixo, para a frase valer sozinha.
  const multipleText = layers.map((layer, i) => `${multiples[i] ?? formatUnavailable().toLowerCase()} na ${(layer.label.split(',')[0] ?? layer.label).toLowerCase()}`);
  const multipleList = multipleText.length > 1 ? `${multipleText.slice(0, -1).join(', ')} e ${multipleText[multipleText.length - 1] ?? ''}` : (multipleText[0] ?? '');

  const summary =
    `Gráfico de cascata deitada do custo da área em ${formatMonthShort(reference.period)}: ` +
    `${layers.map((layer) => `${layer.label.toLowerCase()}, ${formatCurrencyAxis(layer.value)}`).join('; ')}. ` +
    `Um retorno de ${formatCurrencyAxis(reference.returnValue)} vale ${multipleList}.`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as LayerRow | undefined;
    if (!props.active || !props.payload || !row || row.kind === 'gap') return null;
    const base = props.payload[0]!;
    const layerIndex = layers.findIndex((layer) => layer.id === row.id);
    const multiple = layerIndex >= 0 ? multiples[layerIndex] : undefined;
    const color = row.kind === 'total' ? 'var(--chart-1)' : 'var(--text-secondary)';
    const payload =
      row.kind === 'total'
        ? [
            { ...base, color, name: 'Acumulado exato', value: formatCurrency(row.value, 0) },
            { ...base, color: 'var(--text-muted)', name: `Retorno de ${formatCurrencyAxis(reference.returnValue)}`, value: multiple ?? formatUnavailable() },
          ]
        : [
            { ...base, color, name: 'Custo do passo', value: formatCurrency(row.value, 0) },
            { ...base, color: 'var(--text-muted)', name: 'Acumulado após o passo', value: formatCurrency(row.end, 0) },
          ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs font-medium text-text-secondary">
        O retorno de {formatCurrencyAxis(reference.returnValue)} vale {multipleList}: declare qual camada entrou na conta
        {gap !== null && gap !== 0 ? `; os subtotais não fecham em ${formatCurrencyAxis(gap)}` : ''}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, peak]} hide type="number" />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="id"
              interval={0}
              tickFormatter={(id: string) => labels.get(id) ?? ''}
              tickMargin={8}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" x={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <LayerStep {...props} count={rows.length} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
