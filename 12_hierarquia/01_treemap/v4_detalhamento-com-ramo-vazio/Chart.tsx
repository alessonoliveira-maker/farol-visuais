import { ArrowLeft, Filter } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { ResponsiveContainer, Treemap, type TreemapNode } from 'recharts';

import { formatCurrencyCompact, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  filterSignature as defaultFilterSignature,
  initialPath as defaultInitialPath,
  period as defaultPeriod,
  type InvestmentNode,
} from './data';

/**
 * Treemap de um nível por vez, com trilha de navegação sempre visível: plataforma, campanha e
 * criativo. A área do pai fecha com a dos filhos por construção, porque o valor de um nó com
 * filhos é sempre a soma deles e nunca um total declarado à parte; onde não há filhos, o valor
 * declarado do ramo permanece e a peça diz que ele não se divide, que é o caso da campanha
 * registrada sem criativo. O caminho inicial vem do `data.ts` e a assinatura do filtro entra como
 * `key` do corpo, para o caminho aberto não sobreviver a um recorte em que o ramo deixou de existir.
 */
export interface InvestmentDrilldownProps {
  readonly data?: readonly InvestmentNode[];
  /** Caminho aberto na montagem, por id, do nível mais alto para o mais fundo. */
  readonly initialPath?: readonly string[];
  /** Assinatura do recorte da página: muda, e o corpo remonta do caminho inicial. */
  readonly filterSignature?: string;
  /** Mês do recorte em `YYYY-MM`; o texto de tela sai de `formatMonthShort`. */
  readonly period?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Cor única do visual: o treemap deste modelo tem uma série só (COR-1). */
const CELL_FILL = 'var(--chart-1)';
/** Texto sobre a célula: o par aprovado da ROT-6 (10,06:1 no escuro, 6,00:1 no claro). */
const CELL_TEXT = 'var(--accent-cyan-contrast)';
/** Cor do que se pode clicar, na trilha e no voltar: 9,50:1 e 6,00:1 contra o cartão. */
const ACTION_COLOR = 'var(--chart-1)';

const MIN_LABEL_WIDTH = 64;
const MIN_LABEL_HEIGHT = 36;
const CELL_PADDING = 8;
const CELL_RADIUS = 4;
const CELL_GAP = 2;
/**
 * Largura por caractere a 12 px, superestimada de propósito: rótulo que transborda a célula cai
 * sobre a vizinha e nenhuma guarda mede texto contra retângulo, enquanto rótulo escondido é
 * coberto pela lista de identificação abaixo do gráfico.
 */
const NAME_CHAR_WIDTH = 6.6;
const VALUE_CHAR_WIDTH = 7.2;
const LABEL_LINE_HEIGHT = 16;
const FIRST_LINE_OFFSET = 18;
const LAST_LINE_MARGIN = 2;
const MAX_NAME_LINES = 2;
/** Nome do topo da trilha: o nível em que nenhum ramo está aberto. */
const ROOT_LABEL = 'Todas as plataformas';

/** Total de um nó: a soma dos filhos quando existem, e o valor declarado quando não existem. */
function nodeTotal(node: InvestmentNode): number | null {
  const children = node.children;
  if (children !== undefined && children.length > 0) {
    return sumTotals(children);
  }
  return node.investment ?? null;
}

/** Soma dos totais de uma lista de nós. `null` em lista vazia ou sem nenhum valor (EST-1b). */
function sumTotals(nodes: readonly InvestmentNode[]): number | null {
  let sum: number | null = null;
  for (const node of nodes) {
    const value = nodeTotal(node);
    if (value === null) {
      continue;
    }
    sum = sum === null ? value : sum + value;
  }
  return sum;
}

/** Participação de uma parte no todo. `null` quando não há todo a dividir. */
function shareOf(part: number, whole: number | null): number | null {
  if (whole === null || whole === 0) {
    return null;
  }
  return part / whole;
}

interface ResolvedPath {
  /** Caminho válido, podado no primeiro id que não existe mais na árvore. */
  readonly path: readonly string[];
  /** Um nó por nível descido, na ordem do caminho. */
  readonly nodes: readonly InvestmentNode[];
  /** Filhos do nível aberto. `null` quando o nó é folha e não tem a chave `children`. */
  readonly children: readonly InvestmentNode[] | null;
}

/**
 * Desce a árvore pelo caminho e para no primeiro id ausente. A poda existe porque o caminho é
 * estado e a árvore é dado: um recorte novo pode apagar o ramo aberto, e ler um nó inexistente
 * derrubaria o componente.
 */
function resolvePath(roots: readonly InvestmentNode[], path: readonly string[]): ResolvedPath {
  const nodes: InvestmentNode[] = [];
  const valid: string[] = [];
  let level: readonly InvestmentNode[] | null = roots;
  for (const id of path) {
    if (level === null) {
      break;
    }
    const found: InvestmentNode | undefined = level.find((node) => node.id === id);
    if (found === undefined) {
      break;
    }
    nodes.push(found);
    valid.push(id);
    level = found.children ?? null;
  }
  return { path: valid, nodes, children: level };
}

interface LevelCell {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  /** Nó com filhos pode ser aberto; folha não. */
  readonly openable: boolean;
  readonly [key: string]: unknown;
}

/** Células do nível aberto, já com o valor derivado e sem o que não cabe em área. */
function levelCells(nodes: readonly InvestmentNode[]): readonly LevelCell[] {
  const cells: LevelCell[] = [];
  for (const node of nodes) {
    const value = nodeTotal(node);
    if (value === null || value <= 0) {
      continue;
    }
    cells.push({ id: node.id, name: node.name, value, openable: node.children !== undefined });
  }
  return cells;
}

function fitsWidth(text: string, width: number, charWidth: number): boolean {
  return text.length * charWidth <= width - CELL_PADDING * 2;
}

function requiredHeight(lineCount: number): number {
  return FIRST_LINE_OFFSET + (lineCount - 1) * LABEL_LINE_HEIGHT + LAST_LINE_MARGIN;
}

/**
 * O nome é a identidade da célula e nunca sai cortado por reticência (TIP-7): quebra em duas
 * linhas por palavra inteira, e quando nem isso cabe devolve `null` para a célula ficar muda,
 * porque a seção 5 proíbe contar com `overflow` para esconder o que vaza.
 */
function wrapName(name: string, width: number): readonly string[] | null {
  if (fitsWidth(name, width, NAME_CHAR_WIDTH)) {
    return [name];
  }
  const words = name.split(' ');
  if (words.length < MAX_NAME_LINES) {
    return null;
  }
  let best: { lines: readonly [string, string]; balance: number } | null = null;
  for (let index = 1; index < words.length; index++) {
    const first = words.slice(0, index).join(' ');
    const second = words.slice(index).join(' ');
    if (fitsWidth(first, width, NAME_CHAR_WIDTH) && fitsWidth(second, width, NAME_CHAR_WIDTH)) {
      const balance = Math.abs(first.length - second.length);
      if (best === null || balance < best.balance) {
        best = { lines: [first, second], balance };
      }
    }
  }
  return best === null ? null : best.lines;
}

/** Nome e valor são avaliados como par (ROT-10): a célula ou mostra os dois ou fica muda. */
function measureCellText(
  name: string,
  valueText: string,
  width: number,
  cellHeight: number,
): readonly string[] | null {
  if (width < MIN_LABEL_WIDTH || cellHeight < MIN_LABEL_HEIGHT) {
    return null;
  }
  if (!fitsWidth(valueText, width, VALUE_CHAR_WIDTH)) {
    return null;
  }
  const nameLines = wrapName(name, width);
  if (nameLines === null) {
    return null;
  }
  const lines = [...nameLines, valueText];
  return cellHeight < requiredHeight(lines.length) ? null : lines;
}

interface DrilldownBodyProps {
  readonly data: readonly InvestmentNode[];
  readonly initialPath: readonly string[];
  readonly period: string;
  readonly height: number | undefined;
  readonly className: string | undefined;
}

function DrilldownBody({ data, initialPath, period, height, className }: DrilldownBodyProps): ReactElement {
  const [path, setPath] = useState<readonly string[]>(initialPath);
  const periodText = formatMonthShort(period);
  const style = height === undefined ? undefined : { height };
  const rootTotal = sumTotals(data);
  const resolved = resolvePath(data, path);
  const current = resolved.nodes.at(-1);
  const parentNodes = resolved.nodes.slice(0, -1);
  const parent = parentNodes.at(-1);
  const siblings = parent === undefined ? data : (parent.children ?? data);
  const cells = levelCells(resolved.children ?? []);
  const currentTotal = current === undefined ? rootTotal : nodeTotal(current);
  const currentShare = currentTotal === null ? null : shareOf(currentTotal, rootTotal);

  const rootTotalText = rootTotal === null ? '' : formatCurrencyCompact(rootTotal);
  const currentTotalText = currentTotal === null ? '' : formatCurrencyCompact(currentTotal);
  const currentShareText = currentShare === null ? '' : formatPercent(currentShare, 0);
  const trailLabels = [ROOT_LABEL, ...resolved.nodes.map((node) => node.name)];

  if (data.length === 0 || rootTotal === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma com investimento neste recorte: não houve verba para dividir na área.</span>
      </div>
    );
  }

  const header =
    current === undefined
      ? `Investimento de ${periodText}: ${rootTotalText} em ${formatInt(data.length)} plataformas.`
      : `${current.name}: ${currentShareText} do investimento de ${periodText}, ${currentTotalText}.`;

  const summary =
    current === undefined
      ? `Treemap do investimento de ${periodText} por plataforma, com detalhamento nível a nível: a área é proporcional ao valor e o total do recorte é ${rootTotalText}, dividido em ${formatInt(cells.length)} plataformas.`
      : `Treemap do investimento de ${periodText} com detalhamento nível a nível. O ramo aberto é ${trailLabels.slice(1).join(', depois ')}, que pesa ${currentShareText} de ${rootTotalText}${
          cells.length === 0
            ? `; não há criativo registrado, então os ${currentTotalText} dele não se dividem.`
            : `, dividido em ${formatInt(cells.length)} partes.`
        }`;

  function openChild(id: string): void {
    setPath([...resolved.path, id]);
  }

  function goToLevel(level: number): void {
    setPath(resolved.path.slice(0, level));
  }

  function renderCell({ x, y, width, height: cellHeight, depth, name, value }: TreemapNode): ReactElement {
    if (depth === 0) {
      // Fundo do canvas inteiro: é o que aparece no vão que CELL_GAP abre entre as células.
      return <rect fill="var(--surface-raised)" height={cellHeight} rx={CELL_RADIUS} width={width} x={x} y={y} />;
    }
    const lines = measureCellText(name, formatCurrencyCompact(value), width, cellHeight);
    const lastIndex = lines === null ? -1 : lines.length - 1;
    return (
      <g>
        <rect fill={CELL_FILL} height={cellHeight} rx={CELL_RADIUS} width={width} x={x} y={y} />
        {lines?.map((line, index) => (
          <text
            className={index === lastIndex ? 'font-display' : 'font-sans'}
            fill={CELL_TEXT}
            fontSize={12}
            fontWeight={index === lastIndex ? 600 : 500}
            key={`${name}-${String(index)}`}
            x={x + CELL_PADDING}
            y={y + FIRST_LINE_OFFSET + index * LABEL_LINE_HEIGHT}
          >
            {line}
          </text>
        ))}
      </g>
    );
  }

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      {/* Trilha sempre visível: o nível aberto é texto, os de cima são botões de volta. */}
      <nav className="mb-1 flex shrink-0 flex-wrap items-center gap-1 text-[0.6875rem]">
        {trailLabels.map((label, level) =>
          level === trailLabels.length - 1 ? (
            <span className="font-semibold text-text-primary" key={`${String(level)}-${label}`}>
              {label}
            </span>
          ) : (
            <span className="flex items-center gap-1" key={`${String(level)}-${label}`}>
              <button
                className="underline-offset-2 hover:underline"
                onClick={() => {
                  goToLevel(level);
                }}
                style={{ color: ACTION_COLOR }}
                type="button"
              >
                {label}
              </button>
              <span aria-hidden className="text-text-muted">
                ›
              </span>
            </span>
          ),
        )}
      </nav>
      <p className="mb-2 shrink-0 text-xs text-text-secondary">{header}</p>
      {cells.length === 0 ? (
        /* Ramo registrado e sem nada dentro: o estado vazio substitui o gráfico, em vez de um
           retângulo único que faria o nível parecer ter uma parte só (EST-1). */
        <div
          className="flex min-h-0 flex-1 flex-col items-start justify-center gap-2 text-xs text-text-muted"
          role="status"
        >
          <span className="flex items-start gap-2">
            <Filter aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              {`Nenhum criativo registrado nesta campanha: os ${currentTotalText} dela não se dividem neste nível.`}
            </span>
          </span>
          <button
            className="flex items-center gap-1 underline-offset-2 hover:underline"
            onClick={() => {
              goToLevel(resolved.path.length - 1);
            }}
            style={{ color: ACTION_COLOR }}
            type="button"
          >
            <ArrowLeft aria-hidden className="size-3" />
            {`Voltar para ${parent?.name ?? ROOT_LABEL}`}
          </button>
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <ResponsiveContainer height="100%" width="100%">
            <Treemap
              aspectRatio={1}
              content={renderCell}
              data={cells}
              dataKey="value"
              isAnimationActive={false}
              nameKey="name"
              nodeGap={CELL_GAP}
            />
          </ResponsiveContainer>
        </div>
      )}
      {/* Com gráfico, é a identificação de toda parte do nível (ROT-10) e o caminho para descer.
          Sem gráfico, são os ramos vizinhos, o único caminho de saída além do voltar. */}
      <ul className="mt-2 grid shrink-0 grid-cols-3 gap-x-4 gap-y-1">
        {(cells.length === 0 ? levelCells(siblings) : cells).map((cell) => (
          <li
            className={cn(
              'flex min-w-0 items-center gap-1.5 text-[0.6875rem]',
              cell.id === current?.id && 'font-semibold',
            )}
            key={cell.id}
          >
            <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: CELL_FILL }} />
            {cell.openable && cell.id !== current?.id ? (
              <button
                className="min-w-0 text-left underline-offset-2 hover:underline"
                onClick={() => {
                  openChild(cell.id);
                }}
                style={{ color: ACTION_COLOR }}
                type="button"
              >
                {cell.name}
              </button>
            ) : (
              <span className="min-w-0 text-text-secondary">{cell.name}</span>
            )}
            <span className="ml-auto shrink-0 font-display text-text-primary">
              {formatCurrencyCompact(cell.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function InvestmentDrilldownTreemap({
  data = defaultData,
  initialPath = defaultInitialPath,
  filterSignature = defaultFilterSignature,
  period = defaultPeriod,
  height,
  className,
}: InvestmentDrilldownProps) {
  /* A assinatura do recorte é a `key` do corpo: quando o filtro da página muda, o corpo remonta e
     o caminho aberto volta ao inicial, em vez de apontar para um ramo que deixou de existir. */
  return (
    <DrilldownBody
      className={className}
      data={data}
      height={height}
      initialPath={initialPath}
      key={filterSignature}
      period={period}
    />
  );
}
