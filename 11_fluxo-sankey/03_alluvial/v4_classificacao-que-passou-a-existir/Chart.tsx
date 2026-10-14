import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { categories, columns, data as defaultData, type AlluvialCategory, type AlluvialFlow } from './data';

/**
 * Alluvial com uma categoria que nasce no meio da série. A geometria é a da v1 (empilhamento por
 * soma acumulada na ordem fixa de `categories`, sem relaxamento que reordene nó por tamanho), e o
 * que esta versão resolve é o que fazer com a coluna anterior ao nascimento.
 *
 * O BLOCO ZERADO É O ERRO QUE SE EVITA AQUI. Desenhar Morno com altura zero em junho é desenhar uma
 * categoria que não existia, e um bloco de zero pixel não se lê como "não existia": se lê como
 * "existia e ninguém estava lá", que é outra afirmação. A presença é DECLARADA no `data.ts`, por
 * `firstColumn` e `lastColumn`, e não deduzida de `total > 0`, porque a dedução transformaria todo
 * zero medido em categoria inexistente e a EST-3 manda o contrário para zero medido. Em junho a
 * pilha tem quatro blocos, não cinco, e o vão entre blocos é gasto só onde existe bloco.
 *
 * QUEM RESPONDE POR JUNHO É O BLOCO DE AUSÊNCIA, que é vazado, com contorno `--text-muted` (o par que
 * a tabela da ACE-8 aprova para contorno de ausência, 5,21:1 no escuro e 5,37:1 no claro) e fica por
 * último na pilha, como a COR-4 pede. As faixas que saem dele são neutras, em `--text-muted` cheio, e
 * só ganham cor de categoria quando chegam do outro lado: é a leitura literal de "não tinha
 * classificação e passou a ter". O neutro aqui não é `--line-strong`, que mede 1,79 e 1,83:1 contra o
 * cartão: 388 dos 1.240 leads saem por essas faixas, e uma marca desse tamanho abaixo do piso de 3:1
 * daria a impressão de que falta dado no desenho.
 */
export interface NewCategoryAlluvialProps {
  readonly data?: readonly AlluvialFlow[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * O `viewBox` é o tamanho aproximado da área que o corpo entrega ao SVG (canvas 960 x 440, moldura
 * `card`, menos a linha de leitura e a legenda), para o `preserveAspectRatio="none"` escalar perto de
 * 1 px por unidade nos dois eixos, e o vão declarado ser o vão medido.
 */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 270;
/** A margem de cima guarda o cabeçalho de mês e, na coluna de julho, a anotação do nascimento. */
const MARGIN = { top: 34, right: 150, bottom: 10, left: 150 } as const;
const BLOCK_WIDTH = 16;
/** Vão entre blocos empilhados na mesma coluna: piso de 1,5 px da COR-5, arredondado para cima. */
const BLOCK_GAP = 2;
/** Respiro entre o bloco e o rótulo externo de nome e contagem (ROT-2). */
const LABEL_GAP = 9;
const HEADER_Y = 10;
const ANNOTATION_Y = 25;
/** Contorno de superfície que separa nó de ligação sem mexer no contraste do preenchimento (ACE-5). */
const RIBBON_STROKE = 'var(--surface-raised)';
const RIBBON_STROKE_WIDTH = 1;
/** Neutro da ausência e das faixas que saem dela. Ver a nota do topo do arquivo. */
const NEUTRAL_MARK = 'var(--text-muted)';
/** Espessura do contorno do bloco vazado: sem preenchimento, é o contorno que carrega a marca. */
const HOLLOW_STROKE_WIDTH = 1.5;

type CategoryId = string;

function slotColor(slot: 1 | 3 | 5 | 6): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** Cor cheia da categoria, ou o neutro quando ela é a ausência. */
function categoryColor(category: AlluvialCategory | undefined): string {
  if (!category || category.slot === null) return NEUTRAL_MARK;
  return slotColor(category.slot);
}

function categoryIndex(id: string): number {
  return categories.findIndex((category) => category.id === id);
}

/** A categoria existe nesta coluna? É o que separa ausência de zero medido. */
function existsIn(category: AlluvialCategory, columnIndex: number): boolean {
  return columnIndex >= category.firstColumn && columnIndex <= category.lastColumn;
}

/**
 * Escala vertical em px por lead, ou `null` quando não há população para escalar. Zero desenharia um
 * diagrama de altura zero com cara de diagrama, e a EST-1b manda devolver ausência.
 */
function verticalScale(population: number, usable: number): number | null {
  return population > 0 ? usable / population : null;
}

interface ColumnLayout {
  readonly x: number;
  readonly totalsByCategory: ReadonlyMap<CategoryId, number>;
  readonly topByCategory: ReadonlyMap<CategoryId, number>;
}

/** Totais da coluna: da perspectiva de quem sai (colunas com par seguinte) ou de quem chega (a última). */
function columnTotals(flows: readonly AlluvialFlow[], columnIndex: number, isLast: boolean): Map<CategoryId, number> {
  const totals = new Map<CategoryId, number>();
  for (const category of categories) totals.set(category.id, 0);
  const pairIndex = isLast ? columnIndex - 1 : columnIndex;
  for (const flow of flows) {
    if (flow.fromColumn !== pairIndex) continue;
    const key = isLast ? flow.toCategory : flow.fromCategory;
    totals.set(key, (totals.get(key) ?? 0) + flow.count);
  }
  return totals;
}

/**
 * Um bloco por categoria PRESENTE, empilhado na ordem fixa. A categoria que ainda não nasceu não
 * ocupa altura nem gasta vão: a pilha de junho tem quatro blocos e três vãos.
 */
function layoutColumn(x: number, columnIndex: number, totals: ReadonlyMap<CategoryId, number>, scale: number): ColumnLayout {
  const topByCategory = new Map<CategoryId, number>();
  let cursor = MARGIN.top;
  for (const category of categories) {
    if (!existsIn(category, columnIndex)) continue;
    topByCategory.set(category.id, cursor);
    cursor += (totals.get(category.id) ?? 0) * scale + BLOCK_GAP;
  }
  return { x, totalsByCategory: totals, topByCategory };
}

/** Faixa horizontal entre duas colunas: duas cúbicas com o ponto de controle no meio do vão. */
function ribbonPath(x0: number, top0: number, bottom0: number, x1: number, top1: number, bottom1: number): string {
  const xc = (x0 + x1) / 2;
  return [
    `M ${String(x0)},${String(top0)}`,
    `C ${String(xc)},${String(top0)} ${String(xc)},${String(top1)} ${String(x1)},${String(top1)}`,
    `L ${String(x1)},${String(bottom1)}`,
    `C ${String(xc)},${String(bottom1)} ${String(xc)},${String(bottom0)} ${String(x0)},${String(bottom0)}`,
    'Z',
  ].join(' ');
}

interface RibbonSegment {
  readonly id: string;
  readonly d: string;
  readonly color: string;
}

interface Block {
  readonly id: string;
  readonly x: number;
  readonly top: number;
  readonly height: number;
  readonly category: AlluvialCategory;
}

export default function NewCategoryAlluvial({ data = defaultData, height, className }: NewCategoryAlluvialProps) {
  const columnTotalsList = columns.map((_column, index) => columnTotals(data, index, index === columns.length - 1));
  const population = data.reduce((sum, flow) => (flow.fromColumn === 0 ? sum + flow.count : sum), 0);
  // O orçamento de vãos é o da coluna mais cheia, para as três colunas dividirem a mesma escala.
  const maxBlocks = columns.reduce(
    (most, _column, index) => Math.max(most, categories.filter((category) => existsIn(category, index)).length),
    1,
  );
  const usableHeight = VIEW_HEIGHT - MARGIN.top - MARGIN.bottom - BLOCK_GAP * (maxBlocks - 1);
  const scale = verticalScale(population, usableHeight);

  // Um portão para os dois vazios: recorte sem linhas (EST-1) e recorte com linhas somando zero lead.
  if (scale === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há fluxo de temperatura para desenhar.</span>
      </div>
    );
  }

  const plotWidth = VIEW_WIDTH - MARGIN.left - MARGIN.right - BLOCK_WIDTH;
  const columnStep = columns.length > 1 ? plotWidth / (columns.length - 1) : 0;
  const columnLayouts = columns.map((_column, index) =>
    layoutColumn(MARGIN.left + index * columnStep, index, columnTotalsList[index] ?? new Map<CategoryId, number>(), scale),
  );

  const ribbons: RibbonSegment[] = [];
  for (let pair = 0; pair < columns.length - 1; pair += 1) {
    const sourceLayout = columnLayouts[pair];
    const targetLayout = columnLayouts[pair + 1];
    if (!sourceLayout || !targetLayout) continue;

    const outgoingCursor = new Map<CategoryId, number>();
    const incomingCursor = new Map<CategoryId, number>();
    for (const category of categories) {
      outgoingCursor.set(category.id, sourceLayout.topByCategory.get(category.id) ?? MARGIN.top);
      incomingCursor.set(category.id, targetLayout.topByCategory.get(category.id) ?? MARGIN.top);
    }

    // Um sort só: (origem, destino) na ordem fixa entrega saída por destino E entrada por origem.
    const flowsInPair = data
      .filter((flow) => flow.fromColumn === pair)
      .sort(
        (a, b) =>
          categoryIndex(a.fromCategory) - categoryIndex(b.fromCategory) || categoryIndex(a.toCategory) - categoryIndex(b.toCategory),
      );

    for (const flow of flowsInPair) {
      const segmentHeight = flow.count * scale;
      const sourceTop = outgoingCursor.get(flow.fromCategory) ?? MARGIN.top;
      outgoingCursor.set(flow.fromCategory, sourceTop + segmentHeight);
      const targetTop = incomingCursor.get(flow.toCategory) ?? MARGIN.top;
      incomingCursor.set(flow.toCategory, targetTop + segmentHeight);

      ribbons.push({
        id: `${String(pair)}-${flow.fromCategory}-${flow.toCategory}`,
        d: ribbonPath(
          sourceLayout.x + BLOCK_WIDTH,
          sourceTop,
          sourceTop + segmentHeight,
          targetLayout.x,
          targetTop,
          targetTop + segmentHeight,
        ),
        color: categoryColor(categories.find((category) => category.id === flow.fromCategory)),
      });
    }
  }

  const blocks: Block[] = columnLayouts.flatMap((layout, columnIndex) =>
    categories
      .filter((category) => existsIn(category, columnIndex))
      .map((category) => ({
        id: `${String(layout.x)}-${category.id}`,
        x: layout.x,
        top: layout.topByCategory.get(category.id) ?? MARGIN.top,
        height: (layout.totalsByCategory.get(category.id) ?? 0) * scale,
        category,
      })),
  );

  const firstMonth = columns[0];
  const bornCategory = categories.find((category) => category.firstColumn > 0);
  const bornMonth = bornCategory ? columns[bornCategory.firstColumn] : undefined;
  const absence = categories.find((category) => category.absence);
  const absenceTotal = columnTotalsList[0]?.get(absence?.id ?? '') ?? 0;
  const absenceToBorn = data.reduce(
    (sum, flow) => (flow.fromCategory === absence?.id && flow.toCategory === bornCategory?.id ? sum + flow.count : sum),
    0,
  );

  const summary =
    firstMonth && bornCategory && bornMonth && absence
      ? `Diagrama alluvial da temperatura de ${formatInt(population)} leads em três meses. A categoria ${bornCategory.label} só passa a existir em ${formatMonthShort(bornMonth.month)}, então em ${formatMonthShort(firstMonth.month)} os ${formatInt(absenceTotal)} leads sem classificação ficam num bloco vazado, e ${formatInt(absenceToBorn)} deles chegam a ${bornCategory.label}.`
      : `Diagrama alluvial da temperatura de ${formatInt(population)} leads em três meses, com as categorias na mesma ordem em todas as colunas.`;

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        Nos <span className="tabular-nums font-semibold text-text-primary">{formatInt(population)}</span> leads, os{' '}
        <span className="tabular-nums font-semibold text-text-primary">{formatInt(absenceTotal)}</span> sem classificação em{' '}
        <span className="tabular-nums">{firstMonth ? formatMonthShort(firstMonth.month) : ''}</span> se repartiram em{' '}
        <span className="tabular-nums">{bornMonth ? formatMonthShort(bornMonth.month) : ''}</span>, e{' '}
        <span className="tabular-nums">{formatInt(absenceToBorn)}</span> deles chegaram a{' '}
        <span>{bornCategory?.label ?? ''}</span>.
      </p>
      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        {categories.map((category) => (
          <span className="flex items-center gap-1.5 text-xs text-text-secondary" key={category.id}>
            {category.absence ? (
              <span aria-hidden className="size-2.5 shrink-0 rounded-sm border" style={{ borderColor: 'var(--text-muted)' }} />
            ) : (
              <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: categoryColor(category) }} />
            )}
            {category.label}
          </span>
        ))}
      </div>
      <div className="relative min-h-0 w-full flex-1">
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}
        >
          {ribbons.map((ribbon) => (
            <path d={ribbon.d} fill={ribbon.color} key={ribbon.id} stroke={RIBBON_STROKE} strokeWidth={RIBBON_STROKE_WIDTH} />
          ))}
          {blocks.map((block) => (
            <rect
              fill={block.category.absence ? 'none' : categoryColor(block.category)}
              height={Math.max(block.height, 0)}
              key={block.id}
              rx={1}
              stroke={block.category.absence ? NEUTRAL_MARK : 'none'}
              strokeWidth={block.category.absence ? HOLLOW_STROKE_WIDTH : 0}
              width={BLOCK_WIDTH}
              x={block.x}
              y={block.top}
            />
          ))}
        </svg>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {columns.map((column, index) => {
            const layout = columnLayouts[index];
            if (!layout) return null;
            const leftPercent = ((layout.x + BLOCK_WIDTH / 2) / VIEW_WIDTH) * 100;
            return (
              <span
                className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-medium tabular-nums text-text-secondary"
                key={column.id}
                style={{ left: `${String(leftPercent)}%`, top: `${String((HEADER_Y / VIEW_HEIGHT) * 100)}%` }}
              >
                {formatMonthShort(column.month)}
              </span>
            );
          })}
        </div>
        {/* Anotação única do visual (ANO-1), na coluna em que a categoria nasce: sem ela, o bloco que
            aparece do nada na segunda coluna parece defeito do desenho. */}
        {bornCategory && bornMonth ? (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[0.6875rem] font-medium tabular-nums text-text-muted"
              style={{
                left: `${String((((columnLayouts[bornCategory.firstColumn]?.x ?? MARGIN.left) + BLOCK_WIDTH / 2) / VIEW_WIDTH) * 100)}%`,
                top: `${String((ANNOTATION_Y / VIEW_HEIGHT) * 100)}%`,
              }}
            >
              {bornCategory.label} criado em {formatMonthShort(bornMonth.month)}
            </span>
          </div>
        ) : null}
        {/* Nome e contagem de cada bloco nas colunas de ponta: fora do aria-hidden, porque são
            números que só existem aqui. */}
        <div className="pointer-events-none absolute inset-0">
          {[0, columns.length - 1].map((columnIndex) => {
            const layout = columnLayouts[columnIndex];
            if (!layout) return null;
            const isFirst = columnIndex === 0;
            const anchorX = isFirst ? layout.x - LABEL_GAP : layout.x + BLOCK_WIDTH + LABEL_GAP;
            const xPercent = (anchorX / VIEW_WIDTH) * 100;
            return categories
              .filter((category) => existsIn(category, columnIndex))
              .map((category) => {
                const total = layout.totalsByCategory.get(category.id) ?? 0;
                const top = layout.topByCategory.get(category.id) ?? MARGIN.top;
                const centerPercent = ((top + (total * scale) / 2) / VIEW_HEIGHT) * 100;
                return (
                  <span
                    className={cn(
                      'absolute flex -translate-y-1/2 flex-col leading-tight whitespace-nowrap',
                      isFirst ? 'items-end text-right' : 'items-start text-left',
                    )}
                    key={`${String(columnIndex)}-${category.id}`}
                    style={
                      isFirst
                        ? { right: `${String(100 - xPercent)}%`, top: `${String(centerPercent)}%` }
                        : { left: `${String(xPercent)}%`, top: `${String(centerPercent)}%` }
                    }
                  >
                    <span className="text-xs font-medium text-text-secondary">{category.label}</span>
                    <span className="kpi-number text-[0.6875rem] font-medium text-text-muted">{formatInt(total)} leads</span>
                  </span>
                );
              });
          })}
        </div>
      </div>
    </figure>
  );
}
