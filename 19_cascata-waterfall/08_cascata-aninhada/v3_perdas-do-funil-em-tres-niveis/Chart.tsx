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
import { ChevronRight, Folder } from 'lucide-react';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, initialPath as defaultPath, selectPath, type LossNode, type LossTree } from './data';

/** Cascata aninhada das perdas: o caminho é estado, cada nível tem escala própria e o rótulo guarda a parte do total. */
export interface NestedLossBridgeProps {
  readonly data?: LossTree;
  /** Ids a descer a partir da raiz no primeiro desenho. */
  readonly initialPath?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * ESP-6, série única: corpo ≈ 574 x 441 px (card, `alto`), menos a migalha (≈ 28 px), a linha de
 * leitura (≈ 20 px) e a margem de 8 px, ≈ 385 px de gráfico. Até seis colunas em 574 − 16 = 558 px
 * dão passo ≥ 93 px; barra = min(24, 93 × (1 − 2 × 0,32) ≈ 33) = 24 px. O eixo de nomes ganha duas
 * linhas (44 px) porque "Sem classificação" quebra em 93 px. A margem de cima guarda a etiqueta "abre".
 */
const MARGIN = { top: 40, right: 8, bottom: 0, left: 8 } as const;
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const CATEGORY_AXIS_HEIGHT = 44;
/** Largura do tique menor que a banda (93 px): sem ela o Recharts não quebra o nome e ele invade o vizinho. */
const TICK_WIDTH = 84;
const LABEL_GAP = 6;
const CORNER = 3;
const TAG_TOP = 36;
const TAG_BELOW = 44;
const REST_LABEL = 'Sem classificação';

interface Row {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly kind: 'step' | 'rest' | 'total';
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

interface StepExtras {
  readonly count: number;
  readonly shares: Shares;
  readonly onOpen: (id: string) => void;
}

/** Parte de um todo; `null` quando o todo não é positivo (EST-1b). */
function share(part: number, whole: number): number | null {
  return whole > 0 ? part / whole : null;
}

/** Inteiros por id (parte do total da raiz): maior resto em cada nível, com alvo no inteiro do pai (NUM-2). */
type Shares = ReadonlyMap<string, number>;

function allocate(quotas: readonly number[], target: number): readonly number[] {
  const floors = quotas.map((q) => Math.floor(q));
  let left = target - floors.reduce((sum, n) => sum + n, 0);
  const order = quotas.map((q, i) => ({ i, r: q - Math.floor(q) })).sort((a, b) => b.r - a.r || a.i - b.i);
  for (const { i } of order) {
    if (left <= 0) break;
    floors[i] = (floors[i] ?? 0) + 1;
    left -= 1;
  }
  return floors;
}

function buildShares(root: LossNode): Shares {
  const map = new Map<string, number>();
  if (root.value <= 0) return map;
  map.set(root.id, 100);
  const walk = (node: LossNode): void => {
    const children = node.children ?? [];
    if (children.length === 0) return;
    const sum = children.reduce((acc, child) => acc + child.value, 0);
    const whole = Math.max(node.value, sum);
    const parts = [...children.map((child) => ({ id: child.id, value: child.value })), ...(whole > sum ? [{ id: `${node.id}-rest`, value: whole - sum }] : [])];
    const target = map.get(node.id) ?? 0;
    const given = allocate(parts.map((part) => (part.value / whole) * target), target);
    parts.forEach((part, index) => map.set(part.id, given[index] ?? 0));
    children.forEach(walk);
  };
  walk(root);
  return map;
}

/** Texto do rótulo: a contagem e, entre parênteses, o inteiro da parte do total da raiz. */
function countLabel(value: number, id: string, shares: Shares): string {
  const pct = shares.get(id);
  return pct === undefined ? formatInt(value) : `${formatInt(value)} (${formatPercent(pct / 100, 0)})`;
}

/** Quanto os filhos erram o valor do pai (pai menos soma); `null` sem filhos. */
function childGap(node: LossNode): number | null {
  const children = node.children ?? [];
  if (children.length === 0) return null;
  return node.value - children.reduce((sum, child) => sum + child.value, 0);
}

/** Passos do nível, a parte sem classificação logo antes do total, e o total do nó ancorado no zero. */
function buildLevel(node: LossNode): readonly Row[] {
  const gap = childGap(node);
  const items = [
    ...(node.children ?? []).map((child) => ({ id: child.id, label: child.label, value: child.value, kind: 'step' as const, hasChildren: (child.children?.length ?? 0) > 0 })),
    ...(gap !== null && gap > 0 ? [{ id: `${node.id}-rest`, label: REST_LABEL, value: gap, kind: 'rest' as const, hasChildren: false }] : []),
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
 * O shape desenha a coluna, o rótulo, o conector e a etiqueta "abre" dos passos com filhos. A largura
 * da banda vem de usePlotArea, que só funciona dentro de um componente e não numa função de shape. O
 * clique e o foco de teclado ficam no grupo, com uma área transparente que cobre a banda.
 */
function Step({ x = 0, y = 0, width = 0, height = 0, payload, count, shares, onOpen }: StepShapeProps & StepExtras): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  // Recharts pode devolver altura com sinal: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const thickness = Math.max(Math.abs(height), 2);
  const isTotal = payload.kind === 'total';
  const isRest = payload.kind === 'rest';
  const band = plot ? plot.width / count : 0;
  const center = x + width / 2;
  const tagY = plot ? plot.y - TAG_TOP : 0;
  const open = (): void => onOpen(payload.id);
  const onKeyDown = (event: KeyboardEvent<SVGGElement>): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    open();
  };
  return (
    <g
      aria-label={payload.hasChildren ? `Abrir ${payload.label}, ${countLabel(payload.value, payload.id, shares)}` : undefined}
      className={payload.hasChildren ? 'cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary' : undefined}
      onClick={payload.hasChildren ? open : undefined}
      onKeyDown={payload.hasChildren ? onKeyDown : undefined}
      role={payload.hasChildren ? 'button' : undefined}
      tabIndex={payload.hasChildren ? 0 : undefined}
    >
      {payload.hasChildren && plot ? (
        <g>
          <rect fill="none" height={plot.height + TAG_TOP + TAG_BELOW} pointerEvents="all" width={band} x={center - band / 2} y={tagY} />
          <Folder aria-hidden color="var(--text-muted)" height={12} width={12} x={center - 17} y={tagY + 5} />
          <text className="font-display" fill="var(--text-muted)" fontSize={11} fontWeight={600} x={center - 1} y={tagY + 15}>
            abre
          </text>
        </g>
      ) : null}
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
        fontWeight={isTotal ? 600 : 500}
        textAnchor="middle"
        x={center}
        y={top - LABEL_GAP}
      >
        {countLabel(payload.value, payload.id, shares)}
      </text>
    </g>
  );
}

interface LevelChartProps {
  readonly rows: readonly Row[];
  readonly wholeLabel: string;
  readonly grand: number;
  readonly shares: Shares;
  readonly onOpen: (id: string) => void;
}

/** O painel do nível corrente: o domínio sai do próprio nível, e o rótulo guarda a parte do total. */
function LevelChart({ rows, wholeLabel, grand, shares, onOpen }: LevelChartProps): ReactElement {
  const animate = useAnimateOnce();
  const peak = rows.reduce((max, row) => Math.max(max, row.high), 0);
  const level = rows[rows.length - 1]?.value ?? 0;
  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as Row | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const ofLevel = share(row.value, level);
    const ofGrand = share(row.value, grand);
    const payload = [
      { ...base, color: row.kind === 'total' ? 'var(--chart-1)' : 'var(--text-secondary)', name: 'Perdas', value: `${formatInt(row.value)} perdas` },
      ...(row.kind === 'total' || ofLevel === null ? [] : [{ ...base, color: 'var(--text-muted)', name: `Parte de ${wholeLabel}`, value: formatPercent(ofLevel, 0) }]),
      ...(ofGrand === null ? [] : [{ ...base, color: 'var(--text-muted)', name: 'Parte do total do trimestre', value: formatPercent(ofGrand, 1) }]),
    ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };
  return (
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
          shape={(props: StepShapeProps) => <Step {...props} count={rows.length} onOpen={onOpen} shares={shares} />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function NestedLossBridge({ data = defaultData, initialPath = defaultPath, height, className }: NestedLossBridgeProps) {
  const [path, setPath] = useState<readonly string[]>(initialPath);
  const style = height === undefined ? undefined : { height };
  const root = data.root;

  if (!root.children || root.children.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhuma perda neste recorte: não há motivo registrado para montar a cascata.
      </div>
    );
  }

  const found = selectPath(root, path);
  const last = found[found.length - 1];
  // Nó sem filhos não tem ponte para mostrar: o nível corrente é o do pai.
  const trail = last && (last.children?.length ?? 0) === 0 && found.length > 1 ? found.slice(0, -1) : found;
  const node = trail[trail.length - 1] ?? root;
  const shares = buildShares(root);
  const rows = buildLevel(node);
  const ids = trail.slice(1).map((item) => item.id);
  const period = data.period;
  const partText = rows.filter((row) => row.kind !== 'total').map((row) => `${row.label.toLowerCase()} ${formatInt(row.value)}`).join(', ');
  const nodeShare = shares.get(node.id);
  const summary =
    `Gráfico de cascata aninhada das perdas em ${period}, no nível ${node.label.toLowerCase()}: ${formatInt(node.value)} de ${formatInt(root.value)} perdas` +
    `${nodeShare === undefined ? '' : `, ${formatPercent(nodeShare / 100, 0)} do total`}, em ${partText}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <nav aria-label="Caminho da cascata" className="mb-1 flex shrink-0 flex-wrap items-center gap-0.5 text-xs">
        {trail.map((item, index) => {
          const isCurrent = index === trail.length - 1;
          return (
            <span className="flex items-center gap-0.5" key={item.id}>
              {index > 0 ? <ChevronRight aria-hidden className="size-3 text-text-muted" /> : null}
              <button
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'rounded-sm px-1 py-0.5 tabular-nums outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  isCurrent ? 'cursor-default font-semibold text-text-primary' : 'cursor-pointer font-medium text-chart-1 hover:underline',
                )}
                disabled={isCurrent}
                onClick={() => setPath(ids.slice(0, index))}
                type="button"
              >
                {item.label} {countLabel(item.value, item.id, shares)}
              </button>
            </span>
          );
        })}
      </nav>
      <p aria-hidden className="tabular-nums mb-1 shrink-0 text-xs font-medium text-text-secondary">
        {`Escala deste nível: 0 a ${formatInt(node.value)} perdas. Percentual sobre as ${formatInt(root.value)} de ${period}`}
      </p>
      <div className="min-h-0 flex-1">
        <LevelChart grand={root.value} shares={shares} onOpen={(id) => setPath([...ids, id])} rows={rows} wholeLabel={node.label.toLowerCase()} />
      </div>
    </div>
  );
}
