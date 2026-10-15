import { Filter } from 'lucide-react';
import { useMemo, useState, type KeyboardEvent } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  periodLabel,
  rootLabel,
  unitLabel,
  zoomedPath as defaultZoomedPath,
  type LossCategory,
  type LossNode,
} from './data';

/**
 * Icicle lateral com um ramo ampliado: o ramo escolhido é reescalado para a altura inteira do
 * desenho e os ancestrais dele ficam como faixa fina de contexto no topo, cada uma com a
 * participação daquele nível no todo. O ramo aberto vem do `data.ts` (`zoomedPath`), porque estado
 * de interação não chega ao `preview.svg` (CONTRATO, seção 13) e o retrato precisa abrir ampliado.
 *
 * Por que a faixa de contexto é horizontal e o conteúdo é vertical: o texto nunca gira (TIP-5), e
 * uma coluna fina de icicle lateral não tem largura para um nome deitado. Então a trilha de
 * ancestrais usa o eixo horizontal para o valor (uma faixa por nível, largura proporcional e
 * posição no intervalo do pai, exatamente a conta do icicle vertical) e o conteúdo ampliado usa o
 * eixo vertical, com uma coluna por nível. As duas metades são a mesma partição em eixos diferentes,
 * e a trilha escreve o próprio percentual justamente para a mudança de eixo não pedir comparação de
 * comprimento entre elas.
 *
 * Respiro proporcional, e é medição, não gosto (armadilha GEO-16): o vão entre vizinhos é uma
 * fração do próprio intervalo do nó (`GAP_FRACTION`), nunca um número absoluto de pixels. Vão
 * absoluto sai da mesma conta em toda faixa, então a faixa pequena paga o vão inteiro e a
 * participação de área deixa de ser a participação do valor. Com fração constante, `altura
 * desenhada = (1 − 2k) × intervalo` em todos os nós, e a participação de área de cada retângulo é
 * exatamente a participação do valor dele, por construção. A separação visível vem daí mais o
 * contorno de 1 px (COR-5).
 *
 * Largura de rótulo por soma de glifo, não por caractere médio: `measureInkPx` soma a classe de
 * cada caractere (dígito, maiúscula, minúscula, espaço) e acrescenta os 2 px de folga que cobrem o
 * p99 do erro medido. Constante única por caractere erra nos dois sentidos, e o lado que
 * superestima esconde o rótulo sem nenhuma guarda acusar.
 *
 * Interação, e o que ela não substitui: clique num ancestral da trilha volta para aquele nível, e a
 * tecla Escape volta à raiz, com o foco na raiz do visual. Nada de essencial depende disso, porque
 * todo nó desenhado já carrega nome e valor no desenho parado (ROT-10), e o que não couber vai para
 * a lista abaixo do gráfico.
 */
export interface BranchIcicleProps {
  readonly data?: readonly LossCategory[];
  /** Caminho do ramo a abrir, de fora para dentro. Vazio desenha a raiz inteira. */
  readonly zoomedPath?: readonly string[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 574;
/** Altura do `viewBox` por estado, sempre igual à altura que o corpo de fato entrega ao `svg`, para
 * a escala sair 1 e o texto de 12 px chegar à tela com 12 px. Canvas 640x1000 na moldura `card` dá
 * corpo de 574 x 881,5 px (cabeçalho de uma linha); a linha de leitura come 24 px e sobram 857,5.
 * Na raiz, 20 de 25 nós não cabem em rótulo e a lista de identificação (2 colunas, nível preservado)
 * toma cerca de 255 px, então o desenho tem 600; ampliado não há lista e o desenho usa os 857. O
 * `svg` nunca cresce além do `viewBox`, então dar mais só deixa vazio e dar menos encolhe o texto. */
const VIEW_H_ROOT = 600;
const VIEW_H_ZOOM = 857;
const ROOT_COLUMN_WIDTHS = [150, 202, 202] as const;
const LEVEL_NAMES = ['Categoria', 'Motivo', 'Submotivo'] as const;
const TRAIL_BAND_H = 20;
const TRAIL_GAP = 6;
/** Recuo do topo do conteúdo depois da última faixa da trilha; a linha do nome da coluna fica 8 px
 * acima do primeiro retângulo. */
const TRAIL_TO_CONTENT = 22;
const TRAIL_STEP = TRAIL_BAND_H + TRAIL_GAP;
const COLUMN_GAP = 10;
/** Fração do intervalo que vira vão, de cada lado (armadilha GEO-16: respiro proporcional). */
const GAP_FRACTION = 0.015;
/** Altura mínima para nome de uma linha mais o valor embaixo. Cada linha extra de nome soma uma
 * `LABEL_LINE_HEIGHT` a este piso, em `fitLabel`. */
const LABEL_MIN_HEIGHT = 48;
const MAX_LABEL_LINES = 2;
const NAME_FONT_PX = 12;
const SMALL_FONT_PX = 11;
const TEXT_PAD_X = 8;
const NAME_BASELINE_Y = 18;
const LABEL_LINE_HEIGHT = 14;
const NODE_RADIUS = 3;
const NODE_STROKE_WIDTH = 1;
const BRANCH_STROKE_WIDTH = 2;
/** Respiro mínimo entre a tinta do texto da trilha e a borda seguinte (ROT-9). */
const TEXT_RESPIRO = 8;

type GlyphClass = 'digit' | 'upper' | 'lower' | 'space' | 'other';

/** Avanço médio por classe de caractere, em em, medido a 11 px pela mesma função da guarda de
 * colisão. Manrope é a fonte de texto; Space Grotesk é a de número. */
const MANROPE_EM: Readonly<Record<GlyphClass, number>> = {
  digit: 0.563,
  upper: 0.616,
  lower: 0.526,
  space: 0.216,
  other: 0.55,
};
const GROTESK_EM: Readonly<Record<GlyphClass, number>> = {
  digit: 0.59,
  upper: 0.609,
  lower: 0.541,
  space: 0.216,
  other: 0.55,
};
/** Folga por linha que cobre o p99 do erro da soma por classe contra o motor de fonte. */
const INK_SAFETY_PX = 2;

function glyphClass(char: string): GlyphClass {
  if (char === ' ') return 'space';
  if (char >= '0' && char <= '9') return 'digit';
  const lower = char.toLowerCase();
  const upper = char.toUpperCase();
  if (lower === upper) return 'other';
  return char === upper ? 'upper' : 'lower';
}

/** Tinta de uma linha de texto, em px: soma por classe de glifo mais a folga medida. */
function measureInkPx(text: string, fontPx: number, table: Readonly<Record<GlyphClass, number>>): number {
  let advance = 0;
  for (const char of text) {
    advance += table[glyphClass(char)];
  }
  return advance * fontPx + INK_SAFETY_PX;
}

interface Placed<T> {
  readonly node: T;
  readonly start: number;
  readonly end: number;
}

/**
 * Reparte o intervalo [start, end] entre os nós pela soma cumulativa dos valores, do maior para o
 * menor, com empate estável pelo id. Serve para os dois eixos: a trilha chama com x, o conteúdo
 * chama com y. Soma zero devolve lista vazia, porque sem total não existe partição, e isso não é
 * a mesma coisa que uma partição de tamanho zero (EST-1b).
 */
function partitionSpan<T extends { readonly id: string; readonly value: number }>(
  nodes: readonly T[],
  start: number,
  end: number,
): readonly Placed<T>[] {
  const total = nodes.reduce((sum, node) => sum + node.value, 0);
  if (total <= 0) return [];
  const ordered = [...nodes].sort((a, b) => b.value - a.value || a.id.localeCompare(b.id));
  const span = end - start;
  let cursor = start;
  return ordered.map((node) => {
    const begin = cursor;
    cursor += (node.value / total) * span;
    return { node, start: begin, end: cursor };
  });
}

/** Quebra o nome por palavra inteira até caber na largura medida. Reticência é proibida em nome de
 * marca desenhada (TIP-7), então a alternativa à truncagem é a quebra. */
function wrapLabel(label: string, maxWidth: number, fontPx: number): readonly string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of label.split(' ')) {
    const attempt = current === '' ? word : `${current} ${word}`;
    if (current === '' || measureInkPx(attempt, fontPx, MANROPE_EM) <= maxWidth) {
      current = attempt;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}

interface LabelFit {
  readonly lines: readonly string[];
  readonly hasLabel: boolean;
}

function fitLabel(label: string, maxWidth: number, availableHeight: number): LabelFit {
  const lines = wrapLabel(label, maxWidth, NAME_FONT_PX);
  if (lines.length > MAX_LABEL_LINES) return { lines: [], hasLabel: false };
  const required = LABEL_MIN_HEIGHT + (lines.length - 1) * LABEL_LINE_HEIGHT;
  return { lines, hasLabel: availableHeight >= required };
}

interface TrailBand {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly x0: number;
  readonly x1: number;
  readonly isRoot: boolean;
  readonly isCurrent: boolean;
}

interface Zoom {
  readonly trail: readonly TrailBand[];
  readonly forest: readonly LossNode[];
  readonly startLevel: number;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly branchLabel: string;
  readonly branchValue: number;
}

/**
 * Resolve o caminho pedido em trilha de ancestrais mais o subconjunto a desenhar. O caminho é
 * seguido nó a nó, e cada passo reparte o intervalo horizontal do pai para achar onde aquele
 * ancestral cai dentro do todo: é por isso que a faixa de contexto mostra posição, e não só
 * tamanho. Caminho que não resolve, ou que desce até o último nível nomeado, para onde deu.
 */
function resolveZoom(
  categories: readonly LossCategory[],
  path: readonly string[],
  total: number,
): Zoom {
  const trail: TrailBand[] = [
    { id: '', label: rootLabel, value: total, x0: 0, x1: VIEW_W, isRoot: true, isCurrent: path.length === 0 },
  ];
  let forest: readonly LossNode[] = categories;
  let slot: 1 | 2 | 3 | 4 | 5 | 6 = 1;
  let branchLabel = rootLabel;
  let branchValue = total;
  let x0 = 0;
  let x1 = VIEW_W;
  let depth = 0;
  for (const wanted of path) {
    if (depth >= LEVEL_NAMES.length - 1) break;
    const step = partitionSpan(forest, x0, x1).find((placed) => placed.node.id === wanted);
    if (step === undefined) break;
    if (depth === 0) {
      const category = categories.find((item) => item.id === wanted);
      if (category !== undefined) slot = category.slot;
    }
    x0 = step.start;
    x1 = step.end;
    branchLabel = step.node.label;
    branchValue = step.node.value;
    forest = step.node.children ?? [];
    depth += 1;
    trail.push({
      id: step.node.id,
      label: step.node.label,
      value: step.node.value,
      x0,
      x1,
      isRoot: false,
      isCurrent: true,
    });
  }
  const fixed = trail.map((band, index) => ({ ...band, isCurrent: index === trail.length - 1 }));
  return { trail: fixed, forest, startLevel: depth, slot, branchLabel, branchValue };
}

interface Column {
  readonly x: number;
  readonly width: number;
}

function buildColumns(levels: number): readonly Column[] {
  const columns: Column[] = [];
  if (levels === ROOT_COLUMN_WIDTHS.length) {
    let x = 0;
    for (const width of ROOT_COLUMN_WIDTHS) {
      columns.push({ x, width });
      x += width + COLUMN_GAP;
    }
    return columns;
  }
  const width = (VIEW_W - (levels - 1) * COLUMN_GAP) / levels;
  for (let index = 0; index < levels; index += 1) {
    columns.push({ x: index * (width + COLUMN_GAP), width });
  }
  return columns;
}

interface PlacedNode {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly level: number;
  readonly y0: number;
  readonly y1: number;
  readonly parentId: string;
  readonly parentLabel: string;
  readonly nameLines: readonly string[];
  readonly hasLabel: boolean;
}

function placeSubtree(
  nodes: readonly LossNode[],
  top: number,
  bottom: number,
  level: number,
  columns: readonly Column[],
  parentId: string,
  parentLabel: string,
  out: PlacedNode[][],
): void {
  const column = columns[level];
  const bucket = out[level];
  if (column === undefined || bucket === undefined) return;
  const maxWidth = column.width - TEXT_PAD_X * 2;
  for (const placed of partitionSpan(nodes, top, bottom)) {
    const fit = fitLabel(placed.node.label, maxWidth, placed.end - placed.start);
    bucket.push({
      id: placed.node.id,
      label: placed.node.label,
      value: placed.node.value,
      level,
      y0: placed.start,
      y1: placed.end,
      parentId,
      parentLabel,
      nameLines: fit.lines,
      hasLabel: fit.hasLabel,
    });
    placeSubtree(placed.node.children ?? [], placed.start, placed.end, level + 1, columns, placed.node.id, placed.node.label, out);
  }
}

interface MutedBlock {
  readonly id: string;
  readonly label: string;
  /** Valor do próprio nó só quando ele está mudo; com rótulo no desenho, `null`. */
  readonly value: number | null;
  readonly children: readonly PlacedNode[];
}

/** Lista de identificação com o nível preservado (ROT-10): cada nó do nível de cima vira um bloco, e
 * os filhos mudos ficam recuados por baixo dele, nunca soltos ao lado como se fossem irmãos. */
function buildMutedBlocks(parents: readonly PlacedNode[], children: readonly PlacedNode[]): readonly MutedBlock[] {
  return parents
    .map((parent): MutedBlock => {
      const own = children.filter((child) => child.parentId === parent.id);
      return {
        id: parent.id,
        label: parent.label,
        value: parent.hasLabel ? null : parent.value,
        children: parent.hasLabel ? own.filter((child) => !child.hasLabel) : own,
      };
    })
    .filter((block) => block.value !== null || block.children.length > 0);
}

interface MutedGroup {
  readonly id: string;
  readonly label: string;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly value: number | null;
  readonly blocks: readonly MutedBlock[];
}

function slotColor(slot: 1 | 2 | 3 | 4 | 5 | 6): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

export default function BranchIcicle({
  data = defaultData,
  zoomedPath = defaultZoomedPath,
  height,
  className,
}: BranchIcicleProps) {
  const [path, setPath] = useState<readonly string[]>(zoomedPath);
  const style = height === undefined ? undefined : { height };

  const total = data.reduce((sum, category) => sum + category.value, 0);
  const zoom = useMemo(() => resolveZoom(data, path, total), [data, path, total]);
  const levels = LEVEL_NAMES.length - zoom.startLevel;
  const viewH = zoom.startLevel === 0 ? VIEW_H_ROOT : VIEW_H_ZOOM;
  const contentTop = zoom.trail.length * TRAIL_STEP + TRAIL_TO_CONTENT;
  const columns = useMemo(() => buildColumns(levels), [levels]);
  const placed = useMemo(() => {
    const out: PlacedNode[][] = Array.from({ length: levels }, () => []);
    placeSubtree(zoom.forest, contentTop, viewH, 0, columns, '', zoom.branchLabel, out);
    return out;
  }, [columns, contentTop, levels, viewH, zoom.branchLabel, zoom.forest]);

  // Recorte sem linha nenhuma, e recorte cujo total é zero, são o mesmo desenho impossível: sem
  // total não há partição, e forçar uma seria desenhar faixa onde não há valor (EST-1, EST-1b).
  if (data.length === 0 || total <= 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma perda neste recorte: não há hierarquia para ampliar.</span>
      </div>
    );
  }

  const branchShare = zoom.branchValue / total;
  const level1 = placed[0] ?? [];
  const level2 = placed[1] ?? [];
  const leader = [...level1].sort((a, b) => b.value - a.value)[0];
  // Só existe líder quando a partição devolveu nós, e ela só devolve com total positivo: por isso a
  // divisão abaixo não precisa de teto, e o ramo sem líder devolve `null`, nunca zero (EST-1b).
  const leaderShare = leader === undefined ? null : leader.value / zoom.branchValue;
    const categorySlot = (id: string): 1 | 2 | 3 | 4 | 5 | 6 => data.find((item) => item.id === id)?.slot ?? zoom.slot;
  const mutedGroups: readonly MutedGroup[] =
    zoom.startLevel === 0
      ? level1.map((category) => ({
          id: category.id,
          label: category.label,
          slot: categorySlot(category.id),
          value: category.hasLabel ? null : category.value,
          blocks: buildMutedBlocks(
            level2.filter((motive) => motive.parentId === category.id),
            placed[2] ?? [],
          ),
        }))
      : [
          {
            id: zoom.branchLabel,
            label: zoom.branchLabel,
            slot: zoom.slot,
            value: null,
            blocks: buildMutedBlocks(level1, level2),
          },
        ];
  const visibleGroups = mutedGroups.filter((group) => group.value !== null || group.blocks.length > 0);

  const scope = zoom.startLevel === 0 ? 'na raiz' : `no ramo ${zoom.branchLabel}`;
  const firstLevelName = (LEVEL_NAMES[zoom.startLevel] ?? 'nível').toLowerCase();
  const secondLevelName = (LEVEL_NAMES[zoom.startLevel + 1] ?? 'nível').toLowerCase();
  const summary =
    leader === undefined || leaderShare === null
      ? `Icicle lateral ${scope} sem nenhum nível aberto, com ${formatInt(zoom.branchValue)} ${unitLabel} de ${periodLabel} e nada a repartir.`
      : `Icicle lateral ampliado ${scope}: ${formatInt(zoom.branchValue)} das ${formatInt(total)} ${unitLabel} de ${periodLabel}, ${formatPercent(branchShare, 1)} do total, em ${formatInt(level1.length)} ${firstLevelName}s e ${formatInt(level2.length)} ${secondLevelName}s. ${leader.label} lidera com ${formatInt(leader.value)} ${unitLabel}, ${formatPercent(leaderShare, 0)} do ramo.`;
  const readingLine =
    leader === undefined || leaderShare === null
      ? ''
      : `${leader.label}: ${formatPercent(leaderShare, 0)} das ${formatInt(zoom.branchValue)} ${unitLabel} do ramo.`;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && path.length > 0) setPath([]);
  };

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      onKeyDown={handleKeyDown}
      role="figure"
      style={style}
      tabIndex={0}
    >
      {/* Linha de leitura (ANO-5), medida para caber numa linha sem reticência: 62 caracteres de
          Manrope a 12 px somam 366 px de tinta contra os 574 px do corpo. Sem `truncate`, porque a
          cauda da frase carrega o número, e é justamente essa a cauda que a TIP-7 proíbe cortar. */}
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {readingLine}
      </p>
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(viewH)}`}>
          {zoom.trail.map((band, index) => {
            const bandWidth = band.x1 - band.x0;
            const nameInk = measureInkPx(band.label, SMALL_FONT_PX, MANROPE_EM);
            const nameFits = nameInk + TEXT_PAD_X * 2 <= bandWidth;
            const shareText = band.isRoot
              ? `${formatInt(band.value)} ${unitLabel}`
              : `${formatRateWithVolume(band.value, total)} das ${unitLabel}`;
            const shareInk = measureInkPx(shareText, SMALL_FONT_PX, GROTESK_EM);
            const shareX = band.x1 + TEXT_RESPIRO;
            const shareOutsideFits = !band.isRoot && shareX + shareInk <= VIEW_W;
            const y = index * (TRAIL_BAND_H + TRAIL_GAP);
            const inset = bandWidth * GAP_FRACTION;
            return (
              <g
                className={band.isCurrent ? undefined : 'cursor-pointer'}
                key={band.id === '' ? 'raiz' : band.id}
                onClick={
                  band.isCurrent
                    ? undefined
                    : () => {
                        setPath(band.isRoot ? [] : path.slice(0, index));
                      }
                }
              >
                <title>{`${band.label}: ${formatInt(band.value)} ${unitLabel}`}</title>
                <rect
                  fill="var(--surface-sunken)"
                  height={TRAIL_BAND_H}
                  rx={NODE_RADIUS}
                  stroke={band.isRoot ? 'var(--line-subtle)' : slotColor(zoom.slot)}
                  strokeWidth={band.isRoot ? NODE_STROKE_WIDTH : BRANCH_STROKE_WIDTH}
                  width={Math.max(bandWidth - inset * 2, 1)}
                  x={band.x0 + inset}
                  y={y}
                />
                {nameFits ? (
                  <text
                    className="font-sans"
                    fill="var(--text-primary)"
                    fontSize={SMALL_FONT_PX}
                    fontWeight={band.isCurrent ? 600 : 500}
                    x={band.x0 + inset + TEXT_PAD_X}
                    y={y + 14}
                  >
                    {band.label}
                  </text>
                ) : null}
                {band.isRoot ? (
                  <text
                    className="font-display"
                    fill="var(--text-muted)"
                    fontSize={SMALL_FONT_PX}
                    textAnchor="end"
                    x={VIEW_W - inset - TEXT_PAD_X}
                    y={y + 14}
                  >
                    {shareText}
                  </text>
                ) : null}
                {shareOutsideFits ? (
                  <text
                    className="font-display"
                    fill="var(--text-muted)"
                    fontSize={SMALL_FONT_PX}
                    x={shareX}
                    y={y + 14}
                  >
                    {shareText}
                  </text>
                ) : null}
              </g>
            );
          })}
          {columns.map((column, levelIndex) => {
            const nodes = placed[levelIndex] ?? [];
            const levelName = LEVEL_NAMES[zoom.startLevel + levelIndex] ?? '';
            return (
              <g key={levelName === '' ? String(levelIndex) : levelName}>
                <text
                  className="font-sans"
                  fill="var(--text-muted)"
                  fontSize={SMALL_FONT_PX}
                  x={column.x}
                  y={contentTop - 8}
                >
                  {levelName}
                </text>
                {nodes.map((node) => {
                  const inset = (node.y1 - node.y0) * GAP_FRACTION;
                  const valueBaselineY = NAME_BASELINE_Y + node.nameLines.length * LABEL_LINE_HEIGHT;
                  return (
                    <g key={node.id}>
                      {node.hasLabel ? null : <title>{`${node.label}: ${formatInt(node.value)} ${unitLabel}`}</title>}
                      <rect
                        fill="var(--surface-sunken)"
                        height={Math.max(node.y1 - node.y0 - inset * 2, 1)}
                        rx={NODE_RADIUS}
                        stroke={levelIndex === 0 ? slotColor(zoom.startLevel === 0 ? categorySlot(node.id) : zoom.slot) : 'var(--line-subtle)'}
                        strokeWidth={levelIndex === 0 ? BRANCH_STROKE_WIDTH : NODE_STROKE_WIDTH}
                        width={column.width}
                        x={column.x}
                        y={node.y0 + inset}
                      />
                      {node.hasLabel
                        ? node.nameLines.map((line, lineIndex) => (
                            <text
                              className="font-sans"
                              fill="var(--text-primary)"
                              fontSize={NAME_FONT_PX}
                              fontWeight={500}
                              key={line}
                              x={column.x + TEXT_PAD_X}
                              y={node.y0 + inset + NAME_BASELINE_Y + lineIndex * LABEL_LINE_HEIGHT}
                            >
                              {line}
                            </text>
                          ))
                        : null}
                      {node.hasLabel ? (
                        <text
                          className="font-display"
                          fill="var(--text-muted)"
                          fontSize={SMALL_FONT_PX}
                          x={column.x + TEXT_PAD_X}
                          y={node.y0 + inset + valueBaselineY}
                        >
                          {`${formatInt(node.value)} ${unitLabel}`}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      {visibleGroups.length > 0 ? (
        <div className="mt-2 shrink-0">
          <p className="mb-1 text-[0.6875rem] text-text-muted">Sem rótulo no desenho, em {unitLabel}:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[0.6875rem] leading-snug">
            {visibleGroups.map((group) => (
              <div className="min-w-0" key={group.id}>
                <div className="mb-0.5 flex items-center gap-1.5 font-semibold text-text-secondary">
                  <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: slotColor(group.slot) }} />
                  <span>
                    {group.value === null ? (
                      group.label
                    ) : (
                      <>
                        {group.label}:{' '}
                        <span className="font-display text-text-primary">
                          {formatInt(group.value)} {unitLabel}
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <ul className="space-y-1 pl-3.5">
                  {group.blocks.map((block) => (
                    <li key={block.id}>
                      <div className="grid grid-cols-[1fr_64px] items-baseline gap-x-2 font-medium text-text-secondary">
                        <span className="min-w-0">{block.label}</span>
                        {block.value === null ? null : (
                          <span className="font-display text-right text-text-primary">
                            {formatInt(block.value)} {unitLabel}
                          </span>
                        )}
                      </div>
                      <ul className="space-y-0.5 pl-3.5">
                        {block.children.map((child) => (
                          <li className="grid grid-cols-[1fr_64px] items-baseline gap-x-2" key={child.id}>
                            <span className="min-w-0 text-text-secondary">{child.label}</span>
                            <span className="font-display text-right text-text-primary">
                              {formatInt(child.value)} {unitLabel}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
