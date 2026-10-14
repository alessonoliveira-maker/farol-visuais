import { TriangleAlert, Unplug } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatCurrencyCompact, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type DriverNode, type DriverUnit, type Provenance } from './data';

/**
 * Árvore de indicadores com uma premissa sem medição atrás dela: o ticket médio do produto novo tem
 * faixa mais larga que o próprio centro, o resultado herda essa incerteza e o nó que resolveria a
 * premissa aparece como lacuna, de contorno tracejado e sem valor. HTML com Tailwind e conectores em
 * SVG puro com geometria calculada aqui.
 */
export interface PremiseDriverTreeProps {
  readonly data?: DriverNode;
  readonly height?: number;
  readonly className?: string;
}

const CARD_WIDTH = 208;
const COLUMN_STEP = 256;
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
/** Largura do ícone, com o vão até o texto. */
const ICON_WIDTH = 16;
const OPERATOR_SIZE = 24;
/** Acima de 1% de diferença entre o produto ou a soma dos filhos e o valor do pai, o nó não fecha. */
const CLOSURE_TOLERANCE = 0.01;
/** Faixa mais larga que o próprio centro: daqui para cima a premissa manda na incerteza do pai. */
const WIDE_SPREAD = 1;

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

interface ConnectorPath {
  readonly key: string;
  readonly d: string;
  /** Aresta até um nó de lacuna: a relação é hipotética, então o traço também é. */
  readonly dashed: boolean;
}

interface ConnectorGroup {
  readonly key: string;
  /** Ausente quando o pai não tem operador: ali o filho aponta a fonte, não compõe o valor. */
  readonly symbol: string | null;
  readonly badgeX: number;
  readonly badgeY: number;
  readonly paths: readonly ConnectorPath[];
}

/** Linhas que um texto ocupa na largura útil dada, pela largura média de caractere. */
function textLines(text: string, fontSize: number, usable: number): number {
  const ink = text.length * fontSize * CHAR_ADVANCE;
  return Math.max(1, Math.ceil(ink / usable));
}

function expectedFromChildren(node: DriverNode): number | null {
  const kids = node.children;
  if (!node.operator || !kids || kids.length === 0) return null;
  const values: number[] = [];
  for (const kid of kids) {
    const range = kid.range;
    // Filho sem medição não entra na conta, e a conta sem ele não existe: nada de tratar a ausência
    // como fator neutro, que é o zero disfarçado da DAD-2.
    if (range === undefined) return null;
    values.push(range.central);
  }
  return node.operator === 'vezes' ? values.reduce((a, b) => a * b, 1) : values.reduce((a, b) => a + b, 0);
}

/** Validação no preparo: acusa o nó cujo operador não fecha com o valor central dos filhos. */
function closesWithChildren(node: DriverNode): boolean {
  const expected = expectedFromChildren(node);
  const range = node.range;
  if (expected === null || range === undefined) return true;
  if (range.central === 0) return expected === 0;
  return Math.abs(expected - range.central) / Math.abs(range.central) <= CLOSURE_TOLERANCE;
}

/**
 * Espalhamento relativo do nó: a largura da faixa dividida pelo centro. `null` sem faixa e com centro
 * zero, porque ali a razão não existe e zero não é medida (EST-1b).
 */
function relativeSpread(node: DriverNode): number | null {
  const range = node.range;
  if (range === undefined || range.central === 0) return null;
  return (range.p90 - range.p10) / Math.abs(range.central);
}

/** Filho premissa de faixa mais larga que o próprio centro: é dele que o pai herda a incerteza. */
function widePremiseChild(node: DriverNode): DriverNode | null {
  for (const child of node.children ?? []) {
    if (child.provenance !== 'premissa') continue;
    const spread = relativeSpread(child);
    if (spread !== null && spread > WIDE_SPREAD) return child;
  }
  return null;
}

function hasGapNode(node: DriverNode): boolean {
  if (node.provenance === 'lacuna') return true;
  return (node.children ?? []).some(hasGapNode);
}

/** Retomada de um nome no meio da frase: minúscula lê melhor no leitor de tela. */
function lowerFirst(text: string): string {
  return text.slice(0, 1).toLocaleLowerCase('pt-BR') + text.slice(1);
}

/** Avisos do cartão: o operador que não fecha e a incerteza herdada de uma premissa de faixa larga. */
function cardWarnings(node: DriverNode): readonly string[] {
  const out: string[] = [];
  if (!closesWithChildren(node)) out.push('não fecha com os filhos');
  const wide = widePremiseChild(node);
  if (wide !== null) out.push(`herda a incerteza de ${lowerFirst(wide.label)}`);
  return out;
}

/**
 * Altura do cartão somada linha por linha. O mesmo número serve de piso da caixa e de âncora do
 * conector, que é o que impede o traço de entrar acima do centro real quando um rótulo quebra em duas
 * linhas ou quando o cartão ganha a linha do aviso.
 */
function cardHeight(node: DriverNode): number {
  const labelLines = textLines(node.label, LABEL_SIZE, CARD_WIDTH - CARD_PADDING - SEAL_WIDTH);
  const rangeBlock = node.range === undefined ? 0 : ROW_GAP + TRAIL_ROW + ROW_GAP + SMALL_ROW;
  const noteWidth = CARD_WIDTH - CARD_PADDING - ICON_WIDTH;
  const extra = cardWarnings(node)
    .map((text) => ROW_GAP + textLines(text, SMALL_SIZE, noteWidth) * SMALL_ROW)
    .reduce((a, b) => a + b, 0);
  return CARD_PADDING + labelLines * LABEL_LINE + ROW_GAP + VALUE_ROW + rangeBlock + extra + CARD_SLACK;
}

/**
 * Posição de cada nó: a coluna vem da profundidade, a folha empilha na ordem de entrada e o pai fica
 * centrado entre o centro do primeiro e o do último filho, cada um com a sua própria altura.
 */
function layoutTree(node: DriverNode, depth: number, cursor: { next: number }): PositionedNode {
  const height = cardHeight(node);
  const kids = node.children ?? [];
  if (kids.length === 0) {
    const top = cursor.next;
    cursor.next += height + LEAF_GAP;
    return { node, depth, top, height, children: [] };
  }
  const children = kids.map((child) => layoutTree(child, depth + 1, cursor));
  const first = children[0];
  const last = children.at(-1);
  const center = first && last ? (first.top + first.height / 2 + (last.top + last.height / 2)) / 2 : height / 2;
  return { node, depth, top: center - height / 2, height, children };
}

function collectNodes(positioned: PositionedNode): PositionedNode[] {
  return [positioned, ...positioned.children.flatMap(collectNodes)];
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
    return {
      key: child.node.id,
      d: `M ${String(parentRight)} ${String(parentCenterY)} H ${String(midX)} V ${String(childCenterY)} H ${String(childLeft)}`,
      dashed: child.node.provenance === 'lacuna',
    };
  });
  const operator = positioned.node.operator;
  const group: ConnectorGroup = {
    key: positioned.node.id,
    symbol: operator === undefined ? null : operator === 'mais' ? '+' : '×',
    badgeX: midX,
    badgeY: parentCenterY,
    paths,
  };
  return [group, ...positioned.children.flatMap(buildConnectors)];
}

function formatByUnit(unit: DriverUnit, value: number, noun?: string): string {
  if (unit === 'currency') return formatCurrencyCompact(value);
  return noun ? `${formatInt(value)} ${noun}` : formatInt(value);
}

/** Valor central do cartão, ou o rótulo único de ausência quando o nó não tem medição (EST-2). */
function formatCentralValue(node: DriverNode): string {
  const range = node.range;
  return range === undefined ? formatUnavailable() : formatByUnit(node.unit, range.central, node.noun);
}

function markerFraction(range: { readonly p10: number; readonly central: number; readonly p90: number }): number {
  const span = range.p90 - range.p10;
  if (span <= 0) return 0.5;
  return Math.min(1, Math.max(0, (range.central - range.p10) / span));
}

function opWord(operator: DriverNode['operator']): string {
  return operator === 'mais' ? 'mais' : 'vezes';
}

/** Frase acessível calculada do dado: a raiz, a combinação que a gera e a premissa que a alarga. */
function buildSummary(root: DriverNode): string {
  const [childA, childB] = root.children ?? [];
  const head = `Árvore de indicadores. ${root.label} de ${formatCentralValue(root)}`;
  const combine = childA && childB ? `, igual a ${formatCentralValue(childA)} ${opWord(root.operator)} ${formatCentralValue(childB)}` : '';
  const wide = widePremiseChild(root);
  const wideRange = wide === null ? undefined : wide.range;
  const premise =
    wide === null || wideRange === undefined
      ? ''
      : `. O ${lowerFirst(wide.label)} é premissa de faixa larga, de ${formatByUnit(wide.unit, wideRange.p10, wide.noun)} a ${formatByUnit(wide.unit, wideRange.p90, wide.noun)}`;
  const gap = hasGapNode(root) ? ', sem medição' : '';
  return `${head}${combine}${premise}${gap}, e o resultado herda essa incerteza.`;
}

interface DriverCardProps {
  readonly positioned: PositionedNode;
}

/** Cartão de um nó: rótulo e selo de procedência, valor central, faixa como microbarra e avisos. */
function DriverCard({ positioned }: DriverCardProps): ReactElement {
  const { node, depth, top, height } = positioned;
  const range = node.range;
  const missing = range === undefined;
  const warnings = cardWarnings(node);
  return (
    <div
      className={cn(
        'absolute flex flex-col justify-between gap-1 rounded-lg border bg-surface-raised p-3',
        // Contorno de ausência em text-muted, o par que a ACE-8 aprova para isso (5,21:1 e 5,37:1).
        // Vermelho aqui é proibido pela EST-2, e o selo de procedência já diz lacuna.
        missing ? 'border-dashed border-text-muted' : 'border-line-subtle',
      )}
      style={{ left: depth * COLUMN_STEP, minHeight: height, top, width: CARD_WIDTH }}
    >
      <div className="flex min-w-0 shrink-0 items-start justify-between gap-2">
        <p className="min-w-0 text-xs leading-snug font-medium text-text-secondary">{node.label}</p>
        <span className={cn('shrink-0 text-[0.6875rem] font-semibold tracking-wide uppercase', PROVENANCE_CLASS[node.provenance])}>
          {PROVENANCE_LABEL[node.provenance]}
        </span>
      </div>
      <p className={cn('kpi-number flex shrink-0 items-center gap-1 text-sm font-semibold', missing ? 'text-text-muted' : 'text-text-primary')}>
        {missing ? <Unplug aria-hidden className="size-3.5 shrink-0" /> : null}
        {formatCentralValue(node)}
      </p>
      {range === undefined ? null : (
        <div className="flex shrink-0 flex-col gap-1">
          <div aria-hidden className="relative h-1 w-full rounded-full bg-line-strong">
            <span
              className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-1"
              style={{ left: `${String(markerFraction(range) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[0.6875rem] text-text-muted tabular-nums">
            <span>{formatByUnit(node.unit, range.p10)}</span>
            <span>{formatByUnit(node.unit, range.p90, node.noun)}</span>
          </div>
        </div>
      )}
      {warnings.map((text) => (
        <p className="flex items-center gap-1 text-[0.6875rem] leading-snug font-medium text-warning" key={text}>
          <TriangleAlert aria-hidden className="size-3 shrink-0" />
          {text}
        </p>
      ))}
    </div>
  );
}

export default function PremiseDriverTree({ data = defaultData, height, className }: PremiseDriverTreeProps) {
  const root = layoutTree(data, 0, { next: 0 });
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
  const summary = buildSummary(data);

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-3', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <div className="relative" style={{ height: contentHeight, width: contentWidth }}>
        <svg aria-hidden className="absolute inset-0 overflow-visible" height={contentHeight} width={contentWidth}>
          {connectors.flatMap((group) =>
            group.paths.map((path) => (
              <path
                d={path.d}
                fill="none"
                key={`${group.key}-${path.key}`}
                stroke="var(--text-muted)"
                strokeDasharray={path.dashed ? '4 4' : undefined}
                strokeWidth={1.5}
              />
            )),
          )}
          {connectors.map((group) =>
            group.symbol === null ? null : (
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
            ),
          )}
        </svg>
        {nodes.map((positioned) => (
          <DriverCard key={positioned.node.id} positioned={positioned} />
        ))}
      </div>
      <p className="text-[0.6875rem] leading-snug text-text-muted" style={{ width: contentWidth }}>
        A faixa do resultado combina as faixas dos filhos em quadratura, não pela multiplicação dos extremos.
      </p>
    </div>
  );
}
