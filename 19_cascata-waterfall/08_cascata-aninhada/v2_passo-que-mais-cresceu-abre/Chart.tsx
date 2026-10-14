import { useState, type KeyboardEvent, type ReactElement } from 'react';
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
import { ArrowDown, Folder, FolderOpen } from 'lucide-react';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CostChangeTree, type CostNode } from './data';

/** Cascata aninhada da variação do custo: o passo que mais cresceu abre, e clicar noutro passo troca o filho. */
export interface NestedCostChangeProps {
  readonly data?: CostChangeTree;
  readonly height?: number;
  readonly className?: string;
}

/**
 * ESP-6, série única: corpo ≈ 574 x 425 px (card, `alto`, leitura em duas linhas), menos a leitura
 * (≈ 40 px) e a ponte entre os níveis (≈ 24 px), ≈ 345 px; dois painéis de ≈ 172 px. Cinco colunas em
 * 574 − 16 = 558 px dão passo ≈ 112 px; barra = min(24, 112 × (1 − 2 × 0,32)) = 24 px.
 * A margem de cima do painel do pai reserva 36 px para a etiqueta "abre" e o rótulo de valor.
 */
const MARGIN_PARENT = { top: 40, right: 8, bottom: 0, left: 8 } as const;
const MARGIN_CHILD = { top: 24, right: 8, bottom: 0, left: 8 } as const;
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
  /** Variação do nó: atual menos a base, com sinal. */
  readonly value: number;
  readonly base: number;
  readonly current: number;
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

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signedCurrency(value: number): string {
  if (value === 0) return formatCurrencyAxis(0);
  return `${value > 0 ? '+' : '−'}${formatCurrencyAxis(Math.abs(value))}`;
}

function signedPercent(fraction: number): string {
  return `${fraction >= 0 ? '+' : '−'}${formatPercent(Math.abs(fraction), 0)}`;
}

function change(node: CostNode): number {
  return node.current - node.base;
}

/** Variação sobre a base; `null` sem base positiva, porque dividir por zero não é taxa (EST-1b). */
function changeRate(node: CostNode): number | null {
  return node.base > 0 ? change(node) / node.base : null;
}

/** Quanto os filhos erram a variação do pai; `null` sem filhos. */
function childGap(node: CostNode): number | null {
  const children = node.children ?? [];
  if (children.length === 0) return null;
  return change(node) - children.reduce((sum, child) => sum + change(child), 0);
}

/** Filho com a maior variação absoluta e que tem filhos próprios; `undefined` quando nenhum abre. */
function biggestMover(node: CostNode): CostNode | undefined {
  const openable = (node.children ?? []).filter((child) => (child.children?.length ?? 0) > 0);
  return openable.reduce<CostNode | undefined>((best, child) => (best === undefined || Math.abs(change(child)) > Math.abs(change(best)) ? child : best), undefined);
}

/** Passos flutuam sobre o acumulado; a última coluna é a variação do próprio nó, ancorada no zero. */
function buildLevel(node: CostNode, sorted: boolean, totalLabel: string): readonly Row[] {
  const children = [...(node.children ?? [])];
  if (sorted) children.sort((a, b) => change(b) - change(a));
  const items = [
    ...children.map((child) => ({ id: child.id, label: child.label, value: change(child), base: child.base, current: child.current, kind: 'step' as const, hasChildren: (child.children?.length ?? 0) > 0 })),
    { id: node.id, label: totalLabel, value: change(node), base: node.base, current: node.current, kind: 'total' as const, hasChildren: false },
  ];
  let running = 0;
  return items.map((item, index) => {
    const start = item.kind === 'total' ? 0 : running;
    const end = item.kind === 'total' ? item.value : running + item.value;
    running = end;
    return { ...item, low: Math.min(start, end), high: Math.max(start, end), range: [Math.min(start, end), Math.max(start, end)], isLast: index === items.length - 1 };
  });
}

/** Cor por polaridade (COR-6): custo que sobe é o ruim, custo que cai é o bom; total em destaque. */
function stepColor(row: Row): string {
  if (row.kind === 'total') return 'var(--chart-1)';
  if (row.value === 0) return 'var(--text-secondary)';
  return row.value > 0 ? 'var(--negative)' : 'var(--positive)';
}

interface StepExtras {
  readonly count: number;
  readonly openId?: string;
  readonly onOpen?: (id: string) => void;
}

/**
 * O shape desenha a coluna, o rótulo, o conector e, no passo que abre, a etiqueta e a moldura. A
 * largura da banda vem de usePlotArea, que só funciona dentro de um componente e não numa função de
 * shape. O clique e o foco de teclado ficam no grupo, com uma área transparente que cobre a banda.
 */
function Step({ x = 0, y = 0, width = 0, height = 0, payload, count, openId, onOpen }: StepShapeProps & StepExtras): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  // Recharts pode devolver altura com sinal: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const isTotal = payload.kind === 'total';
  const band = plot ? plot.width / count : 0;
  const center = x + width / 2;
  const isOpen = openId === payload.id;
  const canOpen = payload.hasChildren && onOpen !== undefined;
  const levelY = !isTotal && payload.value < 0 ? bottom : top;
  const fill = stepColor(payload);
  const tagX = center - band / 2 + FRAME_INSET + 6;
  const tagY = plot ? plot.y - FRAME_ABOVE : 0;
  const open = (): void => onOpen?.(payload.id);
  const onKeyDown = (event: KeyboardEvent<SVGGElement>): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    open();
  };
  return (
    <g
      aria-label={canOpen ? `Abrir ${payload.label}, variação de ${signedCurrency(payload.value)}` : undefined}
      aria-pressed={canOpen ? isOpen : undefined}
      className={canOpen ? 'cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary' : undefined}
      onClick={canOpen ? open : undefined}
      onKeyDown={canOpen ? onKeyDown : undefined}
      role={canOpen ? 'button' : undefined}
      tabIndex={canOpen ? 0 : undefined}
    >
      {canOpen && plot ? (
        <rect fill="none" height={plot.height + FRAME_ABOVE + FRAME_BELOW} pointerEvents="all" width={band} x={center - band / 2} y={tagY} />
      ) : null}
      {isOpen && plot ? (
        <rect
          fill="none"
          height={plot.height + FRAME_ABOVE + FRAME_BELOW}
          rx={CORNER}
          stroke="var(--chart-1)"
          strokeWidth={1.5}
          width={band - 2 * FRAME_INSET}
          x={center - band / 2 + FRAME_INSET}
          y={tagY}
        />
      ) : null}
      {canOpen && plot ? (
        <g>
          {isOpen ? (
            <FolderOpen aria-hidden color="var(--chart-1)" height={12} width={12} x={tagX} y={tagY + 5} />
          ) : (
            <Folder aria-hidden color="var(--text-muted)" height={12} width={12} x={tagX} y={tagY + 5} />
          )}
          <text className="font-display" fill={isOpen ? 'var(--chart-1)' : 'var(--text-muted)'} fontSize={11} fontWeight={600} x={tagX + 16} y={tagY + 15}>
            abre
          </text>
        </g>
      ) : null}
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={levelY} y2={levelY} />
      ) : null}
      <rect fill={fill} height={Math.max(bottom - top, 2)} rx={CORNER} width={width} x={x} y={top} />
      <text className="font-display" fill={isTotal ? 'var(--text-primary)' : fill} fontSize={12} fontWeight={isTotal || isOpen ? 700 : 500} textAnchor="middle" x={center} y={top - LABEL_GAP}>
        {signedCurrency(payload.value)}
      </text>
    </g>
  );
}

interface LevelChartProps extends Omit<StepExtras, 'count'> {
  readonly rows: readonly Row[];
  readonly basePeriod: string;
  readonly isParent: boolean;
}

/** Um painel de cascata: o mesmo desenho e a mesma convenção de cor nos dois níveis. */
function LevelChart({ rows, basePeriod, isParent, openId, onOpen }: LevelChartProps): ReactElement {
  const animate = useAnimateOnce();
  const peak = rows.reduce((max, row) => Math.max(max, row.high), 0);
  const floor = rows.reduce((min, row) => Math.min(min, row.low), 0);
  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as Row | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const payload = [
      { ...base, color: stepColor(row), name: 'Variação', value: `${row.value < 0 ? '−' : row.value > 0 ? '+' : ''}${formatCurrency(Math.abs(row.value), 0)}` },
      { ...base, color: 'var(--text-muted)', name: `Base em ${basePeriod}`, value: formatCurrency(row.base, 0) },
      { ...base, color: 'var(--text-muted)', name: 'Valor atual', value: formatCurrency(row.current, 0) },
    ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };
  return (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={isParent ? MARGIN_PARENT : MARGIN_CHILD}>
        <XAxis {...AXIS_PROPS} axisLine={false} dataKey="label" height={CATEGORY_AXIS_HEIGHT} interval={0} tickMargin={8} />
        <YAxis domain={[floor, peak]} hide />
        <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
        <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
        <Bar
          dataKey="range"
          isAnimationActive={animate}
          maxBarSize={BAR_MAX}
          shape={(props: StepShapeProps) => <Step {...props} count={rows.length} onOpen={onOpen} openId={openId} />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function NestedCostChange({ data = defaultData, height, className }: NestedCostChangeProps) {
  const [chosenId, setChosenId] = useState<string | undefined>(undefined);
  const style = height === undefined ? undefined : { height };
  const root = data.root;

  if (!root.children || root.children.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum passo neste recorte: não há custo registrado para montar a cascata.
      </div>
    );
  }

  const fallback = biggestMover(root);
  const open = root.children.find((child) => child.id === chosenId && (child.children?.length ?? 0) > 0) ?? fallback;
  const rootRows = buildLevel(root, false, 'Variação total');
  const openRows = open ? buildLevel(open, true, open.label) : [];
  const basePeriod = formatMonthShort(data.basePeriod);
  const period = formatMonthShort(data.period);
  const openRate = open ? changeRate(open) : null;
  const lead = open ? openRows[0] : undefined;
  const leadNode = open?.children?.find((child) => child.id === lead?.id);
  const mismatch = [childGap(root), open ? childGap(open) : null].some((gap) => gap !== null && gap !== 0);

  const partText = openRows.filter((row) => row.kind === 'step').map((row) => `${row.label.toLowerCase()} ${signedCurrency(row.value)}`).join(', ');
  const summary =
    `Gráfico de cascata aninhada da variação do custo de ${basePeriod} para ${period}: de ${formatCurrencyAxis(root.base)} para ${formatCurrencyAxis(root.current)}.` +
    (open ? ` O passo ${open.label.toLowerCase()}, ${signedCurrency(change(open))}, abre em ${partText}.` : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <p aria-hidden className="tabular-nums mb-2 shrink-0 text-xs font-medium text-text-secondary">
        {open
          ? `${open.label} ${signedCurrency(change(open))}${openRate === null ? ` sem base medida em ${basePeriod}` : ` (${signedPercent(openRate)}) contra ${formatCurrencyAxis(open.base)} em ${basePeriod}`}`
          : `Custo ${signedCurrency(change(root))} contra ${formatCurrencyAxis(root.base)} em ${basePeriod}`}
        {mismatch ? '; os filhos não fecham o pai' : ''}
      </p>
      <div className="min-h-0 flex-1">
        <LevelChart basePeriod={basePeriod} isParent onOpen={setChosenId} openId={open?.id} rows={rootRows} />
      </div>
      {open && lead && leadNode ? (
        <>
          <p aria-hidden className="tabular-nums mt-1 flex shrink-0 items-center gap-1.5 text-xs font-medium text-chart-1">
            <ArrowDown aria-hidden className="size-3" />
            {`${lead.label} lidera em ${open.label.toLowerCase()}: ${signedCurrency(lead.value)} contra ${formatCurrencyAxis(leadNode.base)} em ${basePeriod}`}
          </p>
          <div className="min-h-0 flex-1">
            <LevelChart basePeriod={basePeriod} isParent={false} rows={openRows} />
          </div>
        </>
      ) : null}
    </div>
  );
}
