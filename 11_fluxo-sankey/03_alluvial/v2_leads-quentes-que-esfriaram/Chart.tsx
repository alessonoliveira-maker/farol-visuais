import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  categories,
  columns,
  data as defaultData,
  highlight as defaultHighlight,
  type AlluvialCategory,
  type AlluvialFlow,
  type AlluvialTransition,
} from './data';

/**
 * Alluvial de duas colunas com foco declarado: a geometria é a mesma da v1 (blocos empilhados na
 * ordem fixa de `categories`, soma acumulada do dado, nenhum relaxamento que reordene nó por
 * tamanho), e o que muda é quem recebe cor. As transições de `highlight` ficam na cor da categoria
 * de origem; todas as outras faixas viram uma massa neutra.
 *
 * DUAS COLISÕES ENTRE A ESPECIFICAÇÃO DA VERSÃO E O CONTRATO, resolvidas pelo contrato:
 *
 * 1. A especificação pede as faixas fora de foco "a 15%". A ACE-5 mede o que a opacidade faz: ela
 *    compõe a cor da marca com a do cartão, e o resultado precisa continuar acima de 3:1. A 15% de
 *    qualquer cor sobra algo entre 1,0 e 1,2:1, isto é, a faixa deixa de existir na tela. O
 *    apagamento aqui é feito pelo TOKEN, não pela opacidade: `--line-strong` é o neutro que a seção
 *    17.2 nomeia para marca não destacada, e ele entra opaco. Medido contra `--surface-raised`,
 *    1,79:1 no escuro e 1,83:1 no claro, que é o preço conhecido do neutro do Farol e o motivo de a
 *    guarda CONTRASTE-MARCA avisar sobre ele; a alternativa de 15% seria pior e ainda escondida
 *    atrás de um `fillOpacity` que ninguém mede. O que a faixa neutra perde de contraste está
 *    escrito ao lado dela, em número, nos dois rótulos de ponta (isenção da ACE-3).
 *
 * 2. A especificação pede "o nome das categorias em foco em peso 700", e as categorias em foco são
 *    três (Quente na origem, Morno e Frio no destino). A TIP-3 dá peso 700 a no máximo DOIS
 *    elementos, "o nome e o valor do destaque". O 700 fica no nome e na contagem da origem, que é o
 *    sujeito da pergunta; os dois destinos se identificam pela cor cheia da faixa e pela anotação
 *    com a contagem, que é canal de texto e não de cor (ACE-2).
 */
export interface CooledLeadsAlluvialProps {
  readonly data?: readonly AlluvialFlow[];
  /** Transições acesas. Vazio deixa o diagrama inteiro em neutro, que é a leitura honesta de "nada em foco". */
  readonly highlight?: readonly AlluvialTransition[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * O `viewBox` é declarado no tamanho aproximado da área que o corpo do cartão entrega ao SVG
 * (canvas 640 x 380, moldura `card`, menos a linha de leitura e a legenda), e não num número
 * redondo. Com `preserveAspectRatio="none"` isso mantém a escala perto de 1 px por unidade nos dois
 * eixos, e é o que permite tratar BLOCK_GAP e a espessura do contorno como pixels no render. A v1
 * usava um viewBox de 900 x 300 num corpo de 894 x 229,5 e pagava por isso: o vão declarado de 2
 * chegava ao PNG com 1,35 px, abaixo do piso da COR-5.
 */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 190;
const MARGIN = { top: 26, right: 148, bottom: 10, left: 128 } as const;
const BLOCK_WIDTH = 16;
/** Vão entre blocos empilhados na mesma coluna: piso de 1,5 px da COR-5, arredondado para cima. */
const BLOCK_GAP = 2;
/** Respiro entre o bloco e o rótulo externo de nome e contagem (ROT-2). */
const LABEL_GAP = 9;
/** Posição do cabeçalho de mês, dentro da margem superior. */
const HEADER_Y = 9;
/**
 * Contorno de superfície na faixa acesa (ACE-5, correção de 2026-09-19 na v1): separa nó de ligação
 * e ligações vizinhas sem mexer no contraste do preenchimento, que é o que a opacidade faria.
 */
const RIBBON_STROKE = 'var(--surface-raised)';
const RIBBON_STROKE_WIDTH = 1;
/** Neutro de marca não destacada da seção 17.2. Entra opaco: ver a nota 1 do topo do arquivo. */
const NEUTRAL_RIBBON = 'var(--line-strong)';

type CategoryId = string;

function categoryColor(category: AlluvialCategory): string {
  return CHART_SERIES_COLORS[category.slot - 1] ?? 'var(--chart-1)';
}

function categoryIndex(id: string): number {
  return categories.findIndex((category) => category.id === id);
}

function categoryLabel(id: string): string {
  return categories.find((category) => category.id === id)?.label ?? id;
}

/**
 * Escala vertical em px por lead, ou `null` quando não há população para escalar. O `null` não é
 * zelo: escala 0 desenharia um diagrama de altura zero com cara de diagrama, e a EST-1b manda toda
 * conta que resume uma lista devolver ausência em vez de 0.
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
  readonly focused: boolean;
}

interface Block {
  readonly id: string;
  readonly x: number;
  readonly top: number;
  readonly height: number;
  readonly category: AlluvialCategory;
}

/** Junta partes numa frase em português, com "e" antes da última. */
function joinParts(parts: readonly string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1] ?? ''}`;
}

export default function CooledLeadsAlluvial({
  data = defaultData,
  highlight = defaultHighlight,
  height,
  className,
}: CooledLeadsAlluvialProps) {
  const columnTotalsList = columns.map((_column, index) => columnTotals(data, index, index === columns.length - 1));
  const population = data.reduce((sum, flow) => sum + flow.count, 0);
  const usableHeight = VIEW_HEIGHT - MARGIN.top - MARGIN.bottom - BLOCK_GAP * (categories.length - 1);
  const scale = verticalScale(population, usableHeight);

  // Um único portão para os dois vazios que existem aqui: recorte sem linhas (EST-1) e recorte com
  // linhas somando zero lead, que daria a mesma tela sem escala.
  if (scale === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há fluxo de temperatura para desenhar.</span>
      </div>
    );
  }

  const isFocused = (flow: AlluvialFlow): boolean =>
    highlight.some((transition) => transition.fromCategory === flow.fromCategory && transition.toCategory === flow.toCategory);

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

      const sourceCategory = categories.find((category) => category.id === flow.fromCategory);
      const focused = isFocused(flow);
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
        color: focused && sourceCategory ? categoryColor(sourceCategory) : NEUTRAL_RIBBON,
        focused,
      });
    }
  }

  // As acesas entram depois, porque num alluvial de população fechada as faixas se cruzam no meio do
  // vão e a ordem de pintura é a única coisa que decide quem fica por cima.
  const orderedRibbons = [...ribbons.filter((ribbon) => !ribbon.focused), ...ribbons.filter((ribbon) => ribbon.focused)];

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
  // A origem do foco sai da PRIMEIRA transição acesa, e só ela recebe peso 700: ver a nota 2 do topo.
  const focusOriginId = highlight[0]?.fromCategory ?? null;
  const focusTotal = data.reduce((sum, flow) => (flow.fromColumn === 0 && flow.fromCategory === focusOriginId ? sum + flow.count : sum), 0);
  const cooled = data.reduce((sum, flow) => (isFocused(flow) ? sum + flow.count : sum), 0);
  const cooledParts = highlight.map((transition) => {
    const count = data.reduce(
      (sum, flow) =>
        flow.fromCategory === transition.fromCategory && flow.toCategory === transition.toCategory ? sum + flow.count : sum,
      0,
    );
    return `${formatInt(count)} para ${categoryLabel(transition.toCategory)}`;
  });
  /** Contagem da transição acesa que chega a cada categoria, para a anotação do rótulo de destino. */
  const inflowByTarget = new Map<CategoryId, { readonly count: number; readonly from: string }>();
  for (const transition of highlight) {
    const count = data.reduce(
      (sum, flow) =>
        flow.fromCategory === transition.fromCategory && flow.toCategory === transition.toCategory ? sum + flow.count : sum,
      0,
    );
    inflowByTarget.set(transition.toCategory, { count, from: categoryLabel(transition.fromCategory) });
  }

  const focusLabel = focusOriginId === null ? '' : categoryLabel(focusOriginId);
  const summary =
    firstMonth && lastMonth && focusOriginId !== null
      ? `Diagrama alluvial da temperatura de ${formatInt(population)} leads entre ${formatMonthShort(firstMonth.month)} e ${formatMonthShort(lastMonth.month)}, com as saídas de ${focusLabel} em foco: ${formatRateWithVolume(cooled, focusTotal)} esfriaram, ${joinParts(cooledParts)}; as outras faixas ficam em neutro.`
      : `Diagrama alluvial da temperatura de ${formatInt(population)} leads em duas colunas, sem transição em foco: todas as faixas ficam em neutro.`;

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        Dos <span className="tabular-nums font-semibold text-text-primary">{formatInt(focusTotal)}</span> leads na temperatura{' '}
        <span className="font-semibold text-text-primary">{focusLabel}</span> em{' '}
        <span className="tabular-nums">{firstMonth ? formatMonthShort(firstMonth.month) : ''}</span>,{' '}
        <span className="tabular-nums font-semibold text-text-primary">{formatRateWithVolume(cooled, focusTotal)}</span> esfriaram em{' '}
        <span className="tabular-nums">{lastMonth ? formatMonthShort(lastMonth.month) : ''}</span>:{' '}
        <span className="tabular-nums">{joinParts(cooledParts)}</span>.
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
          {orderedRibbons.map((ribbon) => (
            <path
              d={ribbon.d}
              fill={ribbon.color}
              key={ribbon.id}
              stroke={ribbon.focused ? RIBBON_STROKE : 'none'}
              strokeWidth={ribbon.focused ? RIBBON_STROKE_WIDTH : 0}
            />
          ))}
          {blocks.map((block) => (
            <rect
              fill={categoryColor(block.category)}
              height={Math.max(block.height, 0)}
              key={block.id}
              rx={1}
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
        {/* Nome e contagem de cada bloco, mais a anotação de chegada da faixa acesa: fora do
            aria-hidden, porque são números que só existem aqui. */}
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
              const isFocusOrigin = isFirst && category.id === focusOriginId;
              const inflow = isFirst ? undefined : inflowByTarget.get(category.id);
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
                  <span className={cn('text-xs', isFocusOrigin ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                    {category.label}
                  </span>
                  <span
                    className={cn('kpi-number text-[0.6875rem]', isFocusOrigin ? 'font-bold text-text-primary' : 'font-medium text-text-muted')}
                  >
                    {formatInt(total)} leads
                  </span>
                  {inflow === undefined ? null : (
                    <span className="kpi-number text-[0.6875rem] font-medium text-text-muted">
                      {formatInt(inflow.count)} vieram de {inflow.from}
                    </span>
                  )}
                </span>
              );
            });
          })}
        </div>
      </div>
    </figure>
  );
}
