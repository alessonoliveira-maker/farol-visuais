import { TriangleAlert } from 'lucide-react';
import type { ReactElement } from 'react';

import { formatCurrencyCompact, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, monthsInYear as defaultMonths, type DriverNode, type DriverUnit, type Provenance } from './data';

/**
 * Árvore de indicadores de cinco níveis que desce da receita até a capacidade da Pré-vendas. O nó que
 * declara teto compara a demanda mensal do cenário com ele e acende quando passa; os ramos laterais
 * saem recolhidos, sem microbarra, que é o que paga a altura dos cinco níveis. HTML com Tailwind e
 * conectores em SVG puro com geometria calculada aqui.
 */
export interface CapacityDriverTreeProps {
  readonly data?: DriverNode;
  /** Divisor que leva a meta anual ao ritmo mensal com que a operação é dimensionada. */
  readonly monthsInYear?: number;
  readonly height?: number;
  readonly className?: string;
}

const CARD_WIDTH = 208;
/** Passo de coluna apertado, porque são cinco colunas: sobram 32 px de vão para o selo do operador. */
const COLUMN_STEP = 240;
/** Vão vertical entre duas folhas vizinhas. Múltiplo de 4 px (ESP-1, distância de grupo). */
const LEAF_GAP = 16;
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

type NoteTone = 'muted' | 'negative';

const NOTE_CLASS: Record<NoteTone, string> = {
  muted: 'text-text-muted',
  negative: 'font-medium text-negative',
};

interface CardNote {
  readonly text: string;
  readonly tone: NoteTone;
  readonly icon: boolean;
}

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

/** Leitura de capacidade: a demanda mensal que o cenário pede e como ela se compara ao teto. */
interface CapacityReading {
  readonly nodeId: string;
  readonly noun: string | null;
  readonly label: string;
  readonly annual: number;
  readonly perMonth: number;
  readonly ceiling: number;
  readonly ratio: number;
  readonly over: boolean;
}

/** Linhas que um texto ocupa na largura útil dada, pela largura média de caractere. */
function textLines(text: string, fontSize: number, usable: number): number {
  const ink = text.length * fontSize * CHAR_ADVANCE;
  return Math.max(1, Math.ceil(ink / usable));
}

function flatten(node: DriverNode): DriverNode[] {
  return [node, ...(node.children ?? []).flatMap(flatten)];
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
 * O nó que declara teto, com a demanda mensal do cenário. Devolve `null` quando nenhum nó declara
 * teto ou quando o divisor não é positivo: comparação sem base não se publica (EST-4).
 */
function readCapacity(root: DriverNode, months: number): CapacityReading | null {
  if (months <= 0) return null;
  for (const node of flatten(root)) {
    const ceiling = node.monthlyCeiling;
    if (ceiling === undefined || ceiling <= 0) continue;
    const perMonth = node.range.central / months;
    return {
      nodeId: node.id,
      noun: node.noun ?? null,
      label: node.label,
      annual: node.range.central,
      perMonth,
      ceiling,
      ratio: perMonth / ceiling,
      over: perMonth > ceiling,
    };
  }
  return null;
}

/** Linhas extras do cartão, na ordem em que são desenhadas. Cada uma conta na altura do cartão. */
function cardNotes(node: DriverNode, capacity: CapacityReading | null): readonly CardNote[] {
  const out: CardNote[] = [];
  if (capacity !== null && capacity.nodeId === node.id) {
    const noun = capacity.noun === null ? '' : ` ${capacity.noun}`;
    out.push({ text: `${formatInt(capacity.perMonth)}${noun} por mês`, tone: 'muted', icon: false });
    out.push({
      text: `${formatPercent(capacity.ratio, 0)} do teto de ${formatInt(capacity.ceiling)} por mês`,
      tone: capacity.over ? 'negative' : 'muted',
      icon: capacity.over,
    });
  }
  if (!closesWithChildren(node)) out.push({ text: 'não fecha com os filhos', tone: 'negative', icon: true });
  return out;
}

/**
 * Altura do cartão somada linha por linha. O mesmo número serve de piso da caixa e de âncora do
 * conector, que é o que impede o traço de entrar acima do centro real quando um rótulo quebra em duas
 * linhas ou quando o cartão ganha as linhas da leitura de capacidade.
 */
function cardHeight(node: DriverNode, capacity: CapacityReading | null): number {
  const labelLines = textLines(node.label, LABEL_SIZE, CARD_WIDTH - CARD_PADDING - SEAL_WIDTH);
  const rangeBlock = node.collapsed ? ROW_GAP + SMALL_ROW : ROW_GAP + TRAIL_ROW + ROW_GAP + SMALL_ROW;
  const noteWidth = CARD_WIDTH - CARD_PADDING - ICON_WIDTH;
  const extra = cardNotes(node, capacity)
    .map((note) => ROW_GAP + textLines(note.text, SMALL_SIZE, noteWidth) * SMALL_ROW)
    .reduce((a, b) => a + b, 0);
  return CARD_PADDING + labelLines * LABEL_LINE + ROW_GAP + VALUE_ROW + rangeBlock + extra + CARD_SLACK;
}

/**
 * Posição de cada nó: a coluna vem da profundidade, a folha empilha na ordem de entrada e o pai fica
 * centrado entre o centro do primeiro e o do último filho, cada um com a sua própria altura.
 */
function layoutTree(node: DriverNode, depth: number, cursor: { next: number }, capacity: CapacityReading | null): PositionedNode {
  const height = cardHeight(node, capacity);
  const kids = node.children ?? [];
  if (kids.length === 0) {
    const top = cursor.next;
    cursor.next += height + LEAF_GAP;
    return { node, depth, top, height, children: [] };
  }
  const children = kids.map((child) => layoutTree(child, depth + 1, cursor, capacity));
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

function opWord(operator: DriverNode['operator']): string {
  return operator === 'mais' ? 'mais' : 'vezes';
}

/** Retomada de um nome no meio da frase: minúscula lê melhor no leitor de tela. */
function lowerFirst(text: string): string {
  return text.slice(0, 1).toLocaleLowerCase('pt-BR') + text.slice(1);
}

/** Frase acessível calculada do dado: a raiz, a demanda que ela impõe e a comparação com o teto. */
function buildSummary(root: DriverNode, capacity: CapacityReading | null): string {
  const head = `Árvore de indicadores em cinco níveis. ${root.label} de ${formatByUnit(root.unit, root.range.central, root.noun)}`;
  if (capacity === null) {
    const [childA, childB] = root.children ?? [];
    const combine =
      childA && childB
        ? `, igual a ${formatByUnit(childA.unit, childA.range.central, childA.noun)} ${opWord(root.operator)} ${formatByUnit(childB.unit, childB.range.central, childB.noun)}`
        : '';
    return `${head}${combine}.`;
  }
  const demand = ` exige ${formatInt(capacity.annual)} ${lowerFirst(capacity.label)} no ano, ou ${formatInt(capacity.perMonth)} por mês`;
  const verdict = `; o teto de ${formatInt(capacity.ceiling)} por mês fica em ${formatPercent(capacity.ratio, 0)}, ${capacity.over ? 'acima da capacidade' : 'dentro da capacidade'}`;
  return `${head}${demand}${verdict}.`;
}

interface DriverCardProps {
  readonly positioned: PositionedNode;
  readonly notes: readonly CardNote[];
}

/** Cartão de um nó: rótulo e selo de procedência, valor central, faixa e as linhas de leitura. */
function DriverCard({ positioned, notes }: DriverCardProps): ReactElement {
  const { node, depth, top, height } = positioned;
  const fraction = markerFraction(node.range);
  const lowEnd = formatByUnit(node.unit, node.range.p10);
  const highEnd = formatByUnit(node.unit, node.range.p90, node.noun);
  return (
    <div
      className="absolute flex flex-col justify-between gap-1 rounded-lg border border-line-subtle bg-surface-raised p-3"
      style={{ left: depth * COLUMN_STEP, minHeight: height, top, width: CARD_WIDTH }}
    >
      <div className="flex min-w-0 shrink-0 items-start justify-between gap-2">
        <p className="min-w-0 text-xs leading-snug font-medium text-text-secondary">{node.label}</p>
        <span className={cn('shrink-0 text-[0.6875rem] font-semibold tracking-wide uppercase', PROVENANCE_CLASS[node.provenance])}>
          {PROVENANCE_LABEL[node.provenance]}
        </span>
      </div>
      <p className="kpi-number shrink-0 text-sm font-semibold text-text-primary">{formatCentralValue(node)}</p>
      {node.collapsed ? (
        <p className="shrink-0 text-[0.6875rem] text-text-muted tabular-nums">{`${lowEnd} a ${highEnd}`}</p>
      ) : (
        <div className="flex shrink-0 flex-col gap-1">
          <div aria-hidden className="relative h-1 w-full rounded-full bg-line-strong">
            <span
              className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-1"
              style={{ left: `${String(fraction * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[0.6875rem] text-text-muted tabular-nums">
            <span>{lowEnd}</span>
            <span>{highEnd}</span>
          </div>
        </div>
      )}
      {notes.map((note) => (
        <p className={cn('flex items-center gap-1 text-[0.6875rem] leading-snug', NOTE_CLASS[note.tone])} key={note.text}>
          {note.icon ? <TriangleAlert aria-hidden className="size-3 shrink-0" /> : null}
          {note.text}
        </p>
      ))}
    </div>
  );
}

export default function CapacityDriverTree({
  data = defaultData,
  monthsInYear = defaultMonths,
  height,
  className,
}: CapacityDriverTreeProps) {
  const capacity = readCapacity(data, monthsInYear);
  const root = layoutTree(data, 0, { next: 0 }, capacity);
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
  const summary = buildSummary(data, capacity);

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
          <DriverCard key={positioned.node.id} notes={cardNotes(positioned.node, capacity)} positioned={positioned} />
        ))}
      </div>
      <p className="text-[0.6875rem] leading-snug text-text-muted" style={{ width: contentWidth }}>
        O teto de entradas por mês da Pré-vendas é fictício e serve de referência de capacidade; acima dele o cenário não cabe na operação.
      </p>
    </div>
  );
}
