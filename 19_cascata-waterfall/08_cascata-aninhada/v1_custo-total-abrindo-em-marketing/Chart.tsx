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
import { ArrowDown, FolderOpen } from 'lucide-react';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CostNode, type CostTree } from './data';

/** Cascata aninhada: o custo total em cima, o passo aberto embaixo, e o filho soma o pai. */
export interface NestedCostBridgeProps {
  readonly data?: CostTree;
  readonly height?: number;
  readonly className?: string;
}

/**
 * ESP-6, série única: corpo ≈ 574 x 441 px (card, `alto`), menos a linha de leitura com a faixa de
 * proporção (≈ 44 px) e a ponte entre os níveis (≈ 24 px), ≈ 365 px; dois painéis de ≈ 182 px.
 * Cinco colunas em 574 − 16 = 558 px dão passo ≈ 112 px; barra = min(24, 112 × (1 − 2 × 0,32)) = 24 px.
 * A margem de cima do painel emoldurado reserva 36 px: a etiqueta "abre" e o rótulo de valor.
 */
const MARGIN_FRAMED = { top: 40, right: 8, bottom: 0, left: 8 } as const;
const MARGIN_PLAIN = { top: 24, right: 8, bottom: 0, left: 8 } as const;
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const CATEGORY_AXIS_HEIGHT = 28;
const LABEL_GAP = 6;
const CORNER = 3;
const FRAME_ABOVE = 36;
const FRAME_BELOW = 28;
const FRAME_INSET = 4;

interface Row {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly kind: 'step' | 'total';
  readonly hasChildren: boolean;
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

/** Quanto os filhos erram o valor do pai (pai menos soma); `null` sem filhos (EST-1b). */
function childGap(node: CostNode): number | null {
  const children = node.children ?? [];
  if (children.length === 0) return null;
  return node.value - children.reduce((sum, child) => sum + child.value, 0);
}

/** Parte de um todo; `null` quando o todo não é positivo. */
function share(part: number, whole: number): number | null {
  return whole > 0 ? part / whole : null;
}

/** Passos nascem do zero e se empilham; a última coluna é o total do próprio nó, ancorado no zero. */
function buildLevel(node: CostNode): readonly Row[] {
  const items = [
    ...(node.children ?? []).map((child) => ({
      id: child.id,
      label: child.label,
      value: child.value,
      kind: 'step' as const,
      hasChildren: (child.children?.length ?? 0) > 0,
    })),
    { id: node.id, label: node.label, value: node.value, kind: 'total' as const, hasChildren: false },
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
 * O shape desenha a coluna, o rótulo, o conector e, no passo aberto, a moldura com a etiqueta. A
 * largura da banda vem de usePlotArea, que só funciona dentro de um componente e não numa função de shape.
 */
function Step({ x = 0, y = 0, width = 0, height = 0, payload, count, openId }: StepShapeProps & { readonly count: number; readonly openId?: string }): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  // Recharts pode devolver altura com sinal: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const thickness = Math.abs(height);
  const isTotal = payload.kind === 'total';
  const band = plot ? plot.width / count : 0;
  const center = x + width / 2;
  const isOpen = openId === payload.id;
  return (
    <g>
      {isOpen && plot ? (
        <g>
          <rect
            fill="none"
            height={plot.height + FRAME_ABOVE + FRAME_BELOW}
            rx={CORNER}
            stroke="var(--chart-1)"
            strokeWidth={1.5}
            width={band - 2 * FRAME_INSET}
            x={center - band / 2 + FRAME_INSET}
            y={plot.y - FRAME_ABOVE}
          />
          <FolderOpen aria-hidden color="var(--chart-1)" height={12} width={12} x={center - band / 2 + FRAME_INSET + 6} y={plot.y - FRAME_ABOVE + 5} />
          <text className="font-display" fill="var(--chart-1)" fontSize={11} fontWeight={600} x={center - band / 2 + FRAME_INSET + 22} y={plot.y - FRAME_ABOVE + 15}>
            abre
          </text>
        </g>
      ) : null}
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={top} y2={top} />
      ) : null}
      <rect fill={isTotal ? 'var(--chart-1)' : 'var(--text-secondary)'} height={Math.max(thickness, 1)} rx={CORNER} width={width} x={x} y={top} />
      <text
        className="font-display"
        fill={isTotal ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={isTotal ? 600 : 500}
        textAnchor="middle"
        x={center}
        y={top - LABEL_GAP}
      >
        {formatCurrencyAxis(payload.value)}
      </text>
    </g>
  );
}

interface LevelChartProps {
  readonly rows: readonly Row[];
  readonly whole: number;
  readonly wholeLabel: string;
  readonly openId?: string;
}

/** Um painel de cascata: o mesmo desenho e a mesma convenção de cor nos dois níveis. */
function LevelChart({ rows, whole, wholeLabel, openId }: LevelChartProps): ReactElement {
  const animate = useAnimateOnce();
  const peak = rows.reduce((max, row) => Math.max(max, row.high), 0);
  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as Row | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const part = share(row.value, whole);
    const payload = [
      { ...base, color: row.kind === 'total' ? 'var(--chart-1)' : 'var(--text-secondary)', name: 'Valor exato', value: formatCurrency(row.value, 0) },
      ...(part === null ? [] : [{ ...base, color: 'var(--text-muted)', name: `Parte de ${wholeLabel}`, value: formatPercent(part, 0) }]),
    ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };
  return (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={openId ? MARGIN_FRAMED : MARGIN_PLAIN}>
        <XAxis {...AXIS_PROPS} axisLine={false} dataKey="label" height={CATEGORY_AXIS_HEIGHT} interval={0} tickMargin={8} />
        <YAxis domain={[0, peak]} hide />
        <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
        <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
        <Bar
          dataKey="range"
          isAnimationActive={animate}
          maxBarSize={BAR_MAX}
          shape={(props: StepShapeProps) => <Step {...props} count={rows.length} openId={openId} />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function NestedCostBridge({ data = defaultData, height, className }: NestedCostBridgeProps) {
  const style = height === undefined ? undefined : { height };
  const root = data.root;
  const open = root.children?.find((child) => child.id === data.openId);

  if (!root.children || root.children.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum passo neste recorte: não há custo registrado para montar a cascata.
      </div>
    );
  }

  const rootRows = buildLevel(root);
  const openRows = open ? buildLevel(open) : [];
  const openShare = open ? share(open.value, root.value) : null;
  const rootGap = childGap(root);
  const openGap = open ? childGap(open) : null;
  const period = formatMonthShort(data.period);
  const parts = open?.children ?? [];

  const partText = parts.map((child) => `${child.label.toLowerCase()} ${formatCurrencyAxis(child.value)}`).join(', ');
  const summary =
    `Gráfico de cascata aninhada do custo em ${period}: ${root.label.toLowerCase()} de ${formatCurrencyAxis(root.value)}. ` +
    (open && openShare !== null ? `O passo ${open.label.toLowerCase()}, ${formatPercent(openShare, 0)} do total, abre em ${partText}.` : '');
  const mismatch = [rootGap, openGap].some((gap) => gap !== null && gap !== 0);

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 shrink-0">
        <p className="text-xs font-medium text-text-secondary">
          {open && openShare !== null
            ? `${open.label} é ${formatPercent(openShare, 0)} do custo total de ${formatCurrencyAxis(root.value)} em ${period}`
            : `Custo total de ${formatCurrencyAxis(root.value)} em ${period}`}
          {mismatch ? '; os filhos não fecham o pai' : ''}
        </p>
        {openShare !== null ? (
          <div className="mt-1 h-1.5 w-full rounded-sm border border-line-subtle bg-surface-sunken">
            <div className="h-full rounded-sm bg-chart-1" style={{ width: `${String(Math.round(openShare * 100))}%` }} />
          </div>
        ) : null}
      </div>
      <div className="min-h-0 flex-1">
        <LevelChart openId={open?.id} rows={rootRows} whole={root.value} wholeLabel={root.label.toLowerCase()} />
      </div>
      {open ? (
        <>
          <p aria-hidden className="tabular-nums mt-1 flex shrink-0 items-center gap-1.5 text-xs font-medium text-chart-1">
            <ArrowDown aria-hidden className="size-3" />
            {`${open.label} abre em ${formatInt(parts.length)} partes que somam ${formatCurrencyAxis(open.value)}`}
          </p>
          <div className="min-h-0 flex-1">
            <LevelChart rows={openRows} whole={root.value} wholeLabel={root.label.toLowerCase()} />
          </div>
        </>
      ) : null}
    </div>
  );
}
