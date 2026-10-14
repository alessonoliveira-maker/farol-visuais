import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { categories, columns, data as defaultData, type AlluvialCategory, type AlluvialFlow } from './data';

/**
 * Alluvial em SVG puro: colunas são meses, blocos empilhados são a temperatura naquele mês, na
 * mesma ordem nas três colunas, e faixas ligam quem manteve ou mudou de categoria entre meses
 * vizinhos. A geometria não usa nenhuma biblioteca de relaxamento (o Sankey do Recharts reordena
 * nó por tamanho): a posição de cada bloco é a soma acumulada do dado, sempre na ordem fixa de
 * `categories`, e por isso o mesmo bloco fica no mesmo lugar em qualquer recorte.
 *
 * Duas regras de empilhamento sustentam a leitura por coorte, e as duas saem do MESMO sort:
 * ordenar as ligações por (categoria de origem, categoria de destino), nessa ordem, entrega ao
 * mesmo tempo as saídas de cada bloco ordenadas pelo destino e as entradas de cada bloco
 * ordenadas pela origem, porque o laço externo do sort já visita as origens em ordem fixa.
 */
export interface TemperatureAlluvialProps {
  readonly data?: readonly AlluvialFlow[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_WIDTH = 900;
const VIEW_HEIGHT = 300;
const MARGIN = { top: 30, right: 190, bottom: 12, left: 190 } as const;
const BLOCK_WIDTH = 18;
/**
 * Vão entre blocos empilhados na mesma coluna (CONTRATO, COR-5: piso de 1,5 px). O
 * `preserveAspectRatio="none"` do canvas largo escala o eixo vertical a cerca de 0,68 px por
 * unidade (medido em 2026-09-17, abaixo do 1,03 px/unidade do eixo horizontal), então a unidade
 * declarada aqui não é o pixel do PNG: 3 unidades é o piso que sobra acima de 1,5 px nesse pior
 * caso medido (3 × 0,68 ≈ 2,04 px); o valor antigo de 2 unidades chegava a cerca de 1,35 px.
 */
const BLOCK_GAP = 3;
/** Respiro entre o bloco e o rótulo externo de nome e contagem (CONTRATO, ROT-2, VALUE_LABEL_GAP). */
const LABEL_GAP = 10;
/** Posição do cabeçalho de mês, dentro da margem superior. */
const HEADER_Y = 10;
/**
 * Contorno de superfície na faixa (CONTRATO ACE-5, emenda 2026-09-19): `fillOpacity` compõe a cor
 * da faixa com a do cartão, e essa composição media de 2,27 a 2,57:1 no tema claro (2,64:1 em
 * chart-5 no escuro), abaixo do piso de 3:1 da ACE-3, sem o valor escrito na faixa que isentaria
 * a régua. A faixa fica em cor cheia (mesmo contraste do bloco, já aprovado) e o contorno de
 * `--surface-raised` é quem separa nó de ligação, sem tocar no contraste do preenchimento.
 */
const RIBBON_STROKE = 'var(--surface-raised)';
const RIBBON_STROKE_WIDTH = 1;

type CategoryId = string;

function categoryColor(category: AlluvialCategory): string {
  return CHART_SERIES_COLORS[category.slot - 1] ?? 'var(--chart-1)';
}

function categoryIndex(id: string): number {
  return categories.findIndex((category) => category.id === id);
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

/** Um bloco por categoria, empilhado na ordem fixa e separado pela BLOCK_GAP. */
function layoutColumn(x: number, totals: ReadonlyMap<CategoryId, number>, scale: number): ColumnLayout {
  const topByCategory = new Map<CategoryId, number>();
  let cursor = MARGIN.top;
  for (const category of categories) {
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

export default function TemperatureAlluvial({ data = defaultData, height, className }: TemperatureAlluvialProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há fluxo de temperatura para desenhar.</span>
      </div>
    );
  }

  const columnTotalsList = columns.map((_column, index) => columnTotals(data, index, index === columns.length - 1));
  const grandTotal = categories.reduce((sum, category) => sum + (columnTotalsList[0]?.get(category.id) ?? 0), 0);
  const usableHeight = VIEW_HEIGHT - MARGIN.top - MARGIN.bottom - BLOCK_GAP * (categories.length - 1);
  const scale = grandTotal > 0 ? usableHeight / grandTotal : 0;

  const plotWidth = VIEW_WIDTH - MARGIN.left - MARGIN.right - BLOCK_WIDTH;
  const columnStep = columns.length > 1 ? plotWidth / (columns.length - 1) : 0;
  const columnLayouts = columns.map((_column, index) =>
    layoutColumn(MARGIN.left + index * columnStep, columnTotalsList[index] ?? new Map<CategoryId, number>(), scale),
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
      .sort((a, b) => categoryIndex(a.fromCategory) - categoryIndex(b.fromCategory) || categoryIndex(a.toCategory) - categoryIndex(b.toCategory));

    for (const flow of flowsInPair) {
      const segmentHeight = flow.count * scale;
      const sourceTop = outgoingCursor.get(flow.fromCategory) ?? MARGIN.top;
      outgoingCursor.set(flow.fromCategory, sourceTop + segmentHeight);
      const targetTop = incomingCursor.get(flow.toCategory) ?? MARGIN.top;
      incomingCursor.set(flow.toCategory, targetTop + segmentHeight);

      const sourceCategory = categories.find((category) => category.id === flow.fromCategory);
      ribbons.push({
        id: `${String(pair)}-${flow.fromCategory}-${flow.toCategory}`,
        d: ribbonPath(sourceLayout.x + BLOCK_WIDTH, sourceTop, sourceTop + segmentHeight, targetLayout.x, targetTop, targetTop + segmentHeight),
        color: sourceCategory ? categoryColor(sourceCategory) : 'var(--line-strong)',
      });
    }
  }

  const blocks: Block[] = columnLayouts.flatMap((layout) =>
    categories.map((category) => ({
      id: `${String(layout.x)}-${category.id}`,
      x: layout.x,
      top: layout.topByCategory.get(category.id) ?? MARGIN.top,
      height: (layout.totalsByCategory.get(category.id) ?? 0) * scale,
      category,
    })),
  );

  const firstMonth = columns[0];
  const lastMonth = columns[columns.length - 1];
  const lastTotals = columnTotalsList[columnTotalsList.length - 1];
  const leader = categories.reduce<AlluvialCategory | null>((best, category) => {
    const value = lastTotals?.get(category.id) ?? 0;
    const bestValue = best ? lastTotals?.get(best.id) ?? 0 : -1;
    return value > bestValue ? category : best;
  }, null);
  const dropoutFirst = columnTotalsList[0]?.get('descartado') ?? 0;
  const dropoutLast = lastTotals?.get('descartado') ?? 0;

  const summary =
    firstMonth && lastMonth
      ? `Diagrama alluvial da temperatura de ${formatInt(grandTotal)} leads entre ${formatMonthShort(firstMonth.month)} e ${formatMonthShort(lastMonth.month)}, em blocos na mesma ordem nos três meses. ${leader?.label ?? ''} segue a maior categoria; Descartado sobe de ${formatInt(dropoutFirst)} para ${formatInt(dropoutLast)} leads.`
      : 'Diagrama alluvial sem meses suficientes para comparar.';

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        Nos <span className="tabular-nums font-semibold text-text-primary">{formatInt(grandTotal)}</span> leads,{' '}
        <span className="font-semibold text-text-primary">{leader?.label ?? ''}</span> segue a maior categoria em{' '}
        <span className="tabular-nums">{lastMonth ? formatMonthShort(lastMonth.month) : ''}</span>;{' '}
        <span className="font-semibold text-text-primary">Descartado</span> sobe de{' '}
        <span className="tabular-nums">{formatInt(dropoutFirst)}</span> para <span className="tabular-nums">{formatInt(dropoutLast)}</span> leads.
      </p>
      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        {categories.map((category) => (
          <span className="flex items-center gap-1.5 text-xs text-text-secondary" key={category.id}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: categoryColor(category) }} />
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
            <rect fill={categoryColor(block.category)} height={Math.max(block.height, 0)} key={block.id} rx={1} width={BLOCK_WIDTH} x={block.x} y={block.top} />
          ))}
        </svg>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {columns.map((column, index) => {
            const layout = columnLayouts[index];
            if (!layout) return null;
            const leftPercent = ((layout.x + BLOCK_WIDTH / 2) / VIEW_WIDTH) * 100;
            const topPercent = (HEADER_Y / VIEW_HEIGHT) * 100;
            return (
              <span
                className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-medium tabular-nums text-text-secondary"
                key={column.id}
                style={{ left: `${String(leftPercent)}%`, top: `${String(topPercent)}%` }}
              >
                {formatMonthShort(column.month)}
              </span>
            );
          })}
        </div>
        {/* Nome e contagem de cada bloco de ponta: fora do aria-hidden, porque é informação que
            só existe aqui (a frase acessível da raiz não repete os oito números). */}
        <div className="pointer-events-none absolute inset-0">
          {[0, columns.length - 1].map((columnIndex) => {
            const layout = columnLayouts[columnIndex];
            if (!layout) return null;
            const isFirst = columnIndex === 0;
            const anchorX = isFirst ? layout.x - LABEL_GAP : layout.x + BLOCK_WIDTH + LABEL_GAP;
            const xPercent = (anchorX / VIEW_WIDTH) * 100;
            return categories.map((category) => {
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
                  style={isFirst ? { right: `${String(100 - xPercent)}%`, top: `${String(centerPercent)}%` } : { left: `${String(xPercent)}%`, top: `${String(centerPercent)}%` }}
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
