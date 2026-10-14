import { TriangleAlert } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatCurrencyCompact, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type DriverNode, type DriverUnit, type Provenance } from './data';

/**
 * Árvore de indicadores (driver tree): um resultado decomposto em alavancas por soma ou produto,
 * em cartões ligados por conectores ortogonais. HTML com Tailwind; os conectores são SVG puro com
 * geometria calculada aqui, a partir da profundidade e do número de folhas de cada ramo.
 */
export interface DriverTreeProps {
  readonly data?: DriverNode;
  readonly height?: number;
  readonly className?: string;
}

const CARD_WIDTH = 208;
/**
 * Piso de altura, não teto: soma o rótulo em até duas linhas (33 px), o valor (20 px), a
 * microbarra (24,5 px) e dois vãos de 4 px, com folga (85,5 de 88 px úteis). O cartão usa
 * `minHeight`, não `height`, então o aviso "não fecha com os filhos" ganha uma quarta linha
 * (mais um vão de 4 px) crescendo o próprio cartão em vez de transbordar por cima dele.
 */
const CARD_HEIGHT = 112;
const ROW_STEP = 136;
const COLUMN_STEP = 288;
const OPERATOR_SIZE = 24;
/** Acima de 1% de diferença entre o produto ou a soma dos filhos e o valor do pai, o nó não fecha. */
const CLOSURE_TOLERANCE = 0.01;

const PROVENANCE_LABEL: Record<Provenance, string> = {
  medido: 'medido',
  premissa: 'premissa',
  derivado: 'derivado',
  lacuna: 'lacuna',
};

const PROVENANCE_CLASS: Record<Provenance, string> = {
  medido: 'text-prov-medido',
  premissa: 'text-prov-premissa',
  derivado: 'text-prov-derivado',
  lacuna: 'text-prov-lacuna',
};

interface PositionedNode {
  readonly node: DriverNode;
  readonly depth: number;
  readonly top: number;
  readonly children: readonly PositionedNode[];
}

interface ConnectorGroup {
  readonly key: string;
  readonly symbol: string;
  readonly badgeX: number;
  readonly badgeY: number;
  readonly paths: readonly string[];
}

/** Posição de cada nó: profundidade pela coluna, e o pai centrado entre o primeiro e o último filho. */
function layoutTree(node: DriverNode, depth: number, cursor: { next: number }): PositionedNode {
  const kids = node.children ?? [];
  if (kids.length === 0) {
    const top = cursor.next * ROW_STEP;
    cursor.next += 1;
    return { node, depth, top, children: [] };
  }
  const children = kids.map((child) => layoutTree(child, depth + 1, cursor));
  const first = children[0];
  const last = children.at(-1);
  const top = first && last ? (first.top + last.top) / 2 : 0;
  return { node, depth, top, children };
}

function collectNodes(positioned: PositionedNode): PositionedNode[] {
  return [positioned, ...positioned.children.flatMap(collectNodes)];
}

/** Conector em elbow: sai da borda direita do pai, dobra no meio do vão, entra pela esquerda do filho. */
function buildConnectors(positioned: PositionedNode): ConnectorGroup[] {
  if (positioned.children.length === 0) return [];
  const parentRight = positioned.depth * COLUMN_STEP + CARD_WIDTH;
  const parentCenterY = positioned.top + CARD_HEIGHT / 2;
  const childLeft = (positioned.depth + 1) * COLUMN_STEP;
  const midX = parentRight + (childLeft - parentRight) / 2;
  const paths = positioned.children.map((child) => {
    const childCenterY = child.top + CARD_HEIGHT / 2;
    return `M ${String(parentRight)} ${String(parentCenterY)} H ${String(midX)} V ${String(childCenterY)} H ${String(childLeft)}`;
  });
  const group: ConnectorGroup = {
    key: positioned.node.id,
    symbol: positioned.node.operator === 'mais' ? '+' : '×',
    badgeX: midX,
    badgeY: parentCenterY,
    paths,
  };
  return [group, ...positioned.children.flatMap(buildConnectors)];
}

function centralValue(node: DriverNode): number {
  return node.range.central;
}

function expectedFromChildren(node: DriverNode): number | null {
  const kids = node.children;
  if (!node.operator || !kids || kids.length === 0) return null;
  const values = kids.map(centralValue);
  return node.operator === 'vezes' ? values.reduce((a, b) => a * b, 1) : values.reduce((a, b) => a + b, 0);
}

/** Validação no preparo: acusa o nó cujo operador não fecha com o valor central dos filhos. */
function closesWithChildren(node: DriverNode): boolean {
  const expected = expectedFromChildren(node);
  if (expected === null) return true;
  const central = centralValue(node);
  if (central === 0) return expected === 0;
  return Math.abs(expected - central) / Math.abs(central) <= CLOSURE_TOLERANCE;
}

function formatByUnit(unit: DriverUnit, value: number, noun?: string): string {
  if (unit === 'currency') return formatCurrencyCompact(value);
  if (unit === 'percent') return formatPercent(value, 1);
  return noun ? `${formatInt(value)} ${noun}` : formatInt(value);
}

/** Valor central do cartão: taxa de conversão leva o par volume (NUM-1), o resto cai no formato da unidade. */
function formatCentralValue(node: DriverNode): string {
  if (node.unit === 'percent' && node.rateVolume) {
    return formatRateWithVolume(node.rateVolume.numerator, node.rateVolume.denominator, 1);
  }
  return formatByUnit(node.unit, node.range.central, node.noun);
}

function markerFraction(range: DriverNode['range']): number {
  const span = range.p90 - range.p10;
  if (span <= 0) return 0.5;
  return Math.min(1, Math.max(0, (range.central - range.p10) / span));
}

function opWord(operator: DriverNode['operator']): string {
  return operator === 'mais' ? 'mais' : 'vezes';
}

/** Frase acessível calculada do dado: a raiz, a combinação que a gera e o ramo que ainda se decompõe. */
function buildSummary(root: DriverNode): string {
  const [childA, childB] = root.children ?? [];
  const rootPart = `Árvore de indicadores. ${root.label} de ${formatByUnit(root.unit, root.range.central, root.noun)}`;
  const combinePart =
    childA && childB
      ? `, igual a ${formatByUnit(childA.unit, childA.range.central, childA.noun)} ${opWord(root.operator)} ${formatByUnit(childB.unit, childB.range.central, childB.noun)}`
      : '';
  const branch = (root.children ?? []).find((child) => (child.children ?? []).length > 0);
  const [grandA, grandB] = branch?.children ?? [];
  const branchPart =
    branch && grandA && grandB
      ? `; ${branch.label} vem de ${formatByUnit(grandA.unit, grandA.range.central, grandA.noun)} ${opWord(branch.operator)} ${formatByUnit(grandB.unit, grandB.range.central, grandB.noun)}`
      : '';
  return `${rootPart}${combinePart}${branchPart}.`;
}

interface DriverCardProps {
  readonly positioned: PositionedNode;
}

/** Cartão de um nó: rótulo e selo de procedência, valor central, e a faixa como microbarra. */
function DriverCard({ positioned }: DriverCardProps): ReactElement {
  const { node, depth, top } = positioned;
  const fraction = markerFraction(node.range);
  const warn = !closesWithChildren(node);
  return (
    <div
      className="absolute flex flex-col justify-between gap-1 rounded-lg border border-line-subtle bg-surface-raised p-3"
      style={{ minHeight: CARD_HEIGHT, left: depth * COLUMN_STEP, top, width: CARD_WIDTH }}
    >
      <div className="flex min-w-0 shrink-0 items-start justify-between gap-2">
        <p className="min-w-0 text-xs leading-snug font-medium text-text-secondary">{node.label}</p>
        <span
          className={cn('shrink-0 text-[0.6875rem] font-semibold tracking-wide uppercase', PROVENANCE_CLASS[node.provenance])}
        >
          {PROVENANCE_LABEL[node.provenance]}
        </span>
      </div>
      <p className="kpi-number shrink-0 text-sm font-semibold text-text-primary">{formatCentralValue(node)}</p>
      <div className="flex shrink-0 flex-col gap-1">
        <div aria-hidden className="relative h-1 w-full rounded-full bg-line-strong">
          <span
            className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-1"
            style={{ left: `${String(fraction * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[0.6875rem] text-text-muted tabular-nums">
          <span>{formatByUnit(node.unit, node.range.p10, node.noun)}</span>
          <span>{formatByUnit(node.unit, node.range.p90, node.noun)}</span>
        </div>
      </div>
      {warn ? (
        <p className="flex items-center gap-1 text-[0.6875rem] font-medium text-warning">
          <TriangleAlert aria-hidden className="size-3" />
          não fecha com os filhos
        </p>
      ) : null}
    </div>
  );
}

export default function DriverTree({ data = defaultData, height, className }: DriverTreeProps) {
  const root = layoutTree(data, 0, { next: 0 });
  const nodes = collectNodes(root);
  const connectors = buildConnectors(root);
  const maxDepth = Math.max(...nodes.map((item) => item.depth));
  const maxTop = Math.max(...nodes.map((item) => item.top));
  const contentWidth = maxDepth * COLUMN_STEP + CARD_WIDTH;
  const contentHeight = maxTop + CARD_HEIGHT;
  const summary = buildSummary(data);

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 items-center justify-center', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <div className="relative" style={{ height: contentHeight, width: contentWidth }}>
        <svg aria-hidden className="absolute inset-0 overflow-visible" height={contentHeight} width={contentWidth}>
          {connectors.map((group) => (
            <path d={group.paths.join(' ')} fill="none" key={group.key} stroke="var(--line-strong)" strokeWidth={1.5} />
          ))}
          {connectors.map((group) => (
            <g key={`badge-${group.key}`}>
              <circle
                cx={group.badgeX}
                cy={group.badgeY}
                fill="var(--surface-overlay)"
                r={OPERATOR_SIZE / 2}
                stroke="var(--line-subtle)"
                strokeWidth={1}
              />
              <text
                className="font-display"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={12}
                textAnchor="middle"
                x={group.badgeX}
                y={group.badgeY}
              >
                {group.symbol}
              </text>
            </g>
          ))}
        </svg>
        {nodes.map((positioned) => (
          <DriverCard key={positioned.node.id} positioned={positioned} />
        ))}
      </div>
    </div>
  );
}
