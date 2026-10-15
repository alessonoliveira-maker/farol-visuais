import { TriangleAlert } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatCurrencyCompact, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, ratePoint as defaultRatePoint, type DriverNode, type DriverUnit, type Provenance } from './data';

/**
 * Árvore de indicadores lida pela sensibilidade: o mesmo cenário da v1, com a alavanca de maior
 * espalhamento relativo acesa e o quanto vale um ponto dela escrito no próprio cartão. HTML com
 * Tailwind; os conectores são SVG puro com geometria calculada aqui.
 */
export interface SensitiveDriverTreeProps {
  readonly data?: DriverNode;
  /** Degrau de leitura da alavanca em taxa, em fração. Um ponto é 0,01. */
  readonly ratePoint?: number;
  readonly height?: number;
  readonly className?: string;
}

const CARD_WIDTH = 208;
const COLUMN_STEP = 288;
/** Vão vertical entre duas folhas vizinhas. Múltiplo de 4 px (ESP-1, distância de grupo). */
const LEAF_GAP = 24;
/** Respiro acima e abaixo do conteúdo do cartão, os dois lados do `p-3`. */
const CARD_PADDING = 24;
/** O `gap-1` entre as linhas do cartão. */
const ROW_GAP = 4;
const LABEL_SIZE = 12;
const LABEL_LINE = 17;
const VALUE_ROW = 20;
const TRAIL_ROW = 4;
const SMALL_SIZE = 11;
const SMALL_ROW = 15;
/** Folga do piso de altura, para o arredondamento da tinta não encostar na borda de baixo. */
const CARD_SLACK = 4;
/**
 * Largura média de caractere em em. É a mesma régua com que o `check` estima a tinta de um rótulo, e
 * está aqui porque a altura do cartão precisa saber, ANTES do navegador, em quantas linhas cada texto
 * cabe: é esse número que ancora o conector no centro real do cartão.
 */
const CHAR_ADVANCE = 0.52;
/** Largura reservada ao selo de procedência, com o vão da linha do rótulo. */
const SEAL_WIDTH = 68;
/** Largura do ícone de aviso, com o vão até o texto. */
const ICON_WIDTH = 16;
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
  readonly height: number;
  readonly children: readonly PositionedNode[];
}

interface ConnectorGroup {
  readonly key: string;
  readonly symbol: string;
  readonly badgeX: number;
  readonly badgeY: number;
  readonly paths: readonly string[];
}

/** Linhas que um texto ocupa na largura útil dada, pela largura média de caractere. */
function textLines(text: string, fontSize: number, usable: number): number {
  const ink = text.length * fontSize * CHAR_ADVANCE;
  return Math.max(1, Math.ceil(ink / usable));
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

/**
 * Altura do cartão somada linha por linha. O mesmo número serve de piso da caixa e de âncora do
 * conector, que é o que impede o traço de entrar acima do centro real quando um rótulo quebra em duas
 * linhas ou quando o cartão ganha a linha da anotação.
 */
function cardHeight(node: DriverNode, annotation: string | null): number {
  const labelLines = textLines(node.label, LABEL_SIZE, CARD_WIDTH - CARD_PADDING - SEAL_WIDTH);
  const rangeBlock = ROW_GAP + TRAIL_ROW + ROW_GAP + SMALL_ROW;
  const noteWidth = CARD_WIDTH - CARD_PADDING - ICON_WIDTH;
  const notes = annotation === null ? [] : [annotation];
  const warnings = closesWithChildren(node) ? [] : ['não fecha com os filhos'];
  const extra = [...notes, ...warnings]
    .map((text) => ROW_GAP + textLines(text, SMALL_SIZE, noteWidth) * SMALL_ROW)
    .reduce((a, b) => a + b, 0);
  return CARD_PADDING + labelLines * LABEL_LINE + ROW_GAP + VALUE_ROW + rangeBlock + extra + CARD_SLACK;
}

/**
 * Posição de cada nó: a coluna vem da profundidade, a folha empilha na ordem de entrada e o pai fica
 * centrado entre o centro do primeiro e o do último filho, cada um com a sua própria altura.
 */
function layoutTree(node: DriverNode, depth: number, cursor: { next: number }, leverId: string | null, annotation: string | null): PositionedNode {
  const own = node.id === leverId ? annotation : null;
  const height = cardHeight(node, own);
  const kids = node.children ?? [];
  if (kids.length === 0) {
    const top = cursor.next;
    cursor.next += height + LEAF_GAP;
    return { node, depth, top, height, children: [] };
  }
  const children = kids.map((child) => layoutTree(child, depth + 1, cursor, leverId, annotation));
  const first = children[0];
  const last = children.at(-1);
  const center = first && last ? (first.top + first.height / 2 + (last.top + last.height / 2)) / 2 : height / 2;
  return { node, depth, top: center - height / 2, height, children };
}

function collectNodes(positioned: PositionedNode): PositionedNode[] {
  return [positioned, ...positioned.children.flatMap(collectNodes)];
}

function collectLeaves(node: DriverNode): DriverNode[] {
  const kids = node.children ?? [];
  return kids.length === 0 ? [node] : kids.flatMap(collectLeaves);
}

/** Conector em elbow: sai da borda direita do pai, dobra no meio do vão, entra pela esquerda do filho. */
function buildConnectors(positioned: PositionedNode): ConnectorGroup[] {
  if (positioned.children.length === 0) return [];
  const parentRight = positioned.depth * COLUMN_STEP + CARD_WIDTH;
  const parentCenterY = positioned.top + positioned.height / 2;
  const childLeft = (positioned.depth + 1) * COLUMN_STEP;
  const midX = parentRight + (childLeft - parentRight) / 2;
  const paths = positioned.children.map((child) => {
    const childCenterY = child.top + child.height / 2;
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

/**
 * Espalhamento relativo do nó: a largura da faixa dividida pelo centro. `null` quando o centro é
 * zero, porque ali a razão não existe e zero não é medida (EST-1b).
 */
function relativeSpread(node: DriverNode): number | null {
  const { p10, central, p90 } = node.range;
  if (central === 0) return null;
  return (p90 - p10) / Math.abs(central);
}

/** A folha de maior espalhamento relativo, que num produto é a que mais move o resultado. */
function mostSensitiveLeaf(root: DriverNode): DriverNode | null {
  let best: DriverNode | null = null;
  let bestSpread: number | null = null;
  for (const leaf of collectLeaves(root)) {
    const spread = relativeSpread(leaf);
    if (spread === null) continue;
    if (bestSpread === null || spread > bestSpread) {
      best = leaf;
      bestSpread = spread;
    }
  }
  return best;
}

/** Toda a cadeia é produto? Numa soma o ponto de uma taxa não propaga por regra de três. */
function allOperatorsAreProduct(node: DriverNode): boolean {
  if (node.operator === 'mais') return false;
  return (node.children ?? []).every(allOperatorsAreProduct);
}

/**
 * Quanto um ponto da alavanca vale no resultado. Só existe em cadeia de produto e só em alavanca de
 * taxa, onde o ponto é a unidade natural; fora disso devolve `null` e a anotação não é escrita.
 */
function valuePerPoint(root: DriverNode, lever: DriverNode, point: number): number | null {
  if (lever.unit !== 'percent' || !allOperatorsAreProduct(root)) return null;
  const central = centralValue(lever);
  if (central === 0) return null;
  return centralValue(root) * (point / central);
}

function opWord(operator: DriverNode['operator']): string {
  return operator === 'mais' ? 'mais' : 'vezes';
}

/** Retomada de um nome no meio da frase: minúscula lê melhor no leitor de tela. */
function lowerFirst(text: string): string {
  return text.slice(0, 1).toLocaleLowerCase('pt-BR') + text.slice(1);
}

/** Frase acessível calculada do dado: a raiz, a combinação que a gera e a conclusão de sensibilidade. */
function buildSummary(root: DriverNode, lever: DriverNode | null, annotation: string | null): string {
  const [childA, childB] = root.children ?? [];
  const head = `Árvore de indicadores. ${root.label} de ${formatByUnit(root.unit, root.range.central, root.noun)}`;
  const combine =
    childA && childB
      ? `, igual a ${formatByUnit(childA.unit, childA.range.central, childA.noun)} ${opWord(root.operator)} ${formatByUnit(childB.unit, childB.range.central, childB.noun)}`
      : '';
  const sensitivity =
    lever === null
      ? ''
      : `. A alavanca de faixa relativa mais larga é ${lowerFirst(lever.label)}${annotation === null ? '' : `: ${annotation}`}`;
  return `${head}${combine}${sensitivity}.`;
}

interface DriverCardProps {
  readonly positioned: PositionedNode;
  readonly highlight: boolean;
  readonly annotation: string | null;
}

/** Cartão de um nó: rótulo e selo de procedência, valor central, faixa como microbarra e anotação. */
function DriverCard({ positioned, highlight, annotation }: DriverCardProps): ReactElement {
  const { node, depth, top, height } = positioned;
  const fraction = markerFraction(node.range);
  const warn = !closesWithChildren(node);
  return (
    <div
      className={cn(
        'absolute flex flex-col justify-between gap-1 rounded-lg border bg-surface-raised p-3',
        highlight ? 'border-chart-1' : 'border-line-subtle',
      )}
      style={{ left: depth * COLUMN_STEP, minHeight: height, top, width: CARD_WIDTH }}
    >
      <div className="flex min-w-0 shrink-0 items-start justify-between gap-2">
        <p className={cn('min-w-0 text-xs leading-snug text-text-secondary', highlight ? 'font-semibold' : 'font-medium')}>{node.label}</p>
        <span className={cn('shrink-0 text-[0.6875rem] font-semibold tracking-wide uppercase', PROVENANCE_CLASS[node.provenance])}>
          {PROVENANCE_LABEL[node.provenance]}
        </span>
      </div>
      <p className={cn('kpi-number shrink-0 text-sm font-semibold', highlight ? 'text-chart-1' : 'text-text-primary')}>
        {formatCentralValue(node)}
      </p>
      <div className="flex shrink-0 flex-col gap-1">
        <div aria-hidden className="relative h-1 w-full rounded-full bg-line-strong">
          <span
            className={cn(
              'absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full',
              highlight ? 'bg-chart-1' : 'bg-text-muted',
            )}
            style={{ left: `${String(fraction * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[0.6875rem] text-text-muted tabular-nums">
          <span>{formatByUnit(node.unit, node.range.p10)}</span>
          <span>{formatByUnit(node.unit, node.range.p90, node.noun)}</span>
        </div>
      </div>
      {annotation === null ? null : <p className="text-[0.6875rem] leading-snug text-text-muted">{annotation}</p>}
      {warn ? (
        <p className="flex items-center gap-1 text-[0.6875rem] leading-snug font-medium text-warning">
          <TriangleAlert aria-hidden className="size-3 shrink-0" />
          não fecha com os filhos
        </p>
      ) : null}
    </div>
  );
}

export default function SensitiveDriverTree({
  data = defaultData,
  ratePoint = defaultRatePoint,
  height,
  className,
}: SensitiveDriverTreeProps) {
  const lever = mostSensitiveLeaf(data);
  const gainPerPoint = lever === null ? null : valuePerPoint(data, lever, ratePoint);
  const annotation = gainPerPoint === null ? null : `cada ponto vale ${formatCurrencyCompact(gainPerPoint)}`;
  const leverId = lever === null ? null : lever.id;

  const root = layoutTree(data, 0, { next: 0 }, leverId, annotation);
  const nodes = collectNodes(root);
  // Semente do extremo: a própria raiz, que existe sempre. Assim a extensão do desenho nunca sai de
  // uma lista possivelmente vazia, que devolveria -Infinity em vez de medida (EST-1b).
  let contentWidth = CARD_WIDTH;
  let contentHeight = root.top + root.height;
  for (const item of nodes) {
    contentWidth = Math.max(contentWidth, item.depth * COLUMN_STEP + CARD_WIDTH);
    contentHeight = Math.max(contentHeight, item.top + item.height);
  }
  const connectors = buildConnectors(root);
  const summary = buildSummary(data, lever, annotation);

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-3', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <div className="relative" style={{ height: contentHeight, width: contentWidth }}>
        <svg aria-hidden className="absolute inset-0 overflow-visible" height={contentHeight} width={contentWidth}>
          {connectors.map((group) => (
            <path d={group.paths.join(' ')} fill="none" key={group.key} stroke="var(--text-muted)" strokeWidth={1.5} />
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
          <DriverCard
            annotation={positioned.node.id === leverId ? annotation : null}
            highlight={positioned.node.id === leverId}
            key={positioned.node.id}
            positioned={positioned}
          />
        ))}
      </div>
      <p className="text-[0.6875rem] leading-snug text-text-muted" style={{ width: contentWidth }}>
        A faixa de um nó com operador combina as faixas dos filhos em quadratura, não pela multiplicação dos extremos.
      </p>
    </div>
  );
}
