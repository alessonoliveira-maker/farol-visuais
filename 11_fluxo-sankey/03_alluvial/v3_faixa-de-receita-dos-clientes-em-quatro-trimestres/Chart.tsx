import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { categories, columns, data as defaultData, type RevenueBandCategory, type RevenueFlow } from './data';

/**
 * Alluvial de quatro colunas e seis categorias, no teto do modelo: quatro faixas de receita mensal
 * mais as duas que fecham a população, "Ainda não cliente" e "Encerrou". A geometria é a da v1
 * (empilhamento por soma acumulada na ordem fixa de `categories`, sem relaxamento que reordene nó
 * por tamanho); o que esta versão acrescenta é a entrada e a saída da base como categorias de
 * primeira classe, e é isso que faz a altura das quatro colunas fechar em 312 clientes.
 *
 * A RAMPA `--seq-N` QUE A ESPECIFICAÇÃO PEDIA NÃO CABE, e a medição é o motivo. Contra
 * `--surface-raised`, os sete degraus medem 1,14, 1,58, 2,29, 3,38, 4,89, 6,96 e 10,12:1 no tema
 * escuro e 1,21, 1,49, 1,92, 2,60, 3,72, 5,45 e 8,29:1 no claro: só `--seq-5`, `--seq-6` e `--seq-7`
 * passam do piso de 3:1 da ACE-3 nos DOIS temas, ou seja, a rampa do Farol tem três degraus úteis e
 * a versão precisa de quatro. Escrever a contagem DENTRO do bloco também não salva: sobre `--seq-4`
 * o melhor par de texto mede 4,29:1, abaixo do piso de 4,5:1 (é a armadilha TOK-2). Então a ordem
 * das faixas passou a ser carregada pela POSIÇÃO, que é fixa nas quatro colunas e vai da faixa mais
 * alta para a mais baixa, e pelo nome, que é o próprio intervalo em reais; a cor volta a ser
 * identidade de categoria em slot fixo (COR-3 e COR-8), como na v1. Nenhum token categórico do Farol
 * serviria de rampa: eles invertem de luminância entre os dois temas, e é por isso que a rampa
 * sequencial existe.
 *
 * A CONTAGEM FICA AO LADO DO BLOCO, e não dentro dele, pela mesma medição: `--text-primary` sobre as
 * cores categóricas mede de 1,53 a 3,37:1 e a ROT-6 o proíbe. Nas colunas do meio, que não levam
 * rótulo por bloco, o número que decide está no cabeçalho, que diz quantos clientes a base tinha
 * naquele trimestre, e o percentual de cada bloco na coluna vive na dica.
 */
export interface RevenueBandAlluvialProps {
  readonly data?: readonly RevenueFlow[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * O `viewBox` é o tamanho aproximado da área que o corpo entrega ao SVG (canvas 960 x 480, moldura
 * `card`, menos a linha de leitura e a legenda), para o `preserveAspectRatio="none"` escalar perto
 * de 1 px por unidade nos dois eixos. Sem isso o vão declarado não é o vão medido, que foi o que a
 * revisão da v1 encontrou.
 */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 310;
/**
 * A margem de cima guarda duas linhas de cabeçalho: o trimestre e o tamanho da base naquele
 * trimestre. A de baixo guarda meia caixa do rótulo do último bloco da pilha, que é o menor de todos
 * e por isso tem o centro quase no fim do corpo: com 10 px o rótulo de "Encerrou" passava 2,3 px da
 * área do corpo e o render acusava, porque conteúdo fora do corpo não se resolve com `overflow`.
 */
const MARGIN = { top: 34, right: 140, bottom: 20, left: 140 } as const;
const BLOCK_WIDTH = 16;
/** Vão entre blocos empilhados na mesma coluna: piso de 1,5 px da COR-5, arredondado para cima. */
const BLOCK_GAP = 2;
/** Respiro entre o bloco e o rótulo externo de nome e contagem (ROT-2). */
const LABEL_GAP = 9;
/** Topo do cabeçalho de duas linhas, ancorado pelo centro vertical dentro da margem de cima. */
const HEADER_Y = 14;
/** Contorno de superfície que separa nó de ligação sem mexer no contraste do preenchimento (ACE-5). */
const RIBBON_STROKE = 'var(--surface-raised)';
const RIBBON_STROKE_WIDTH = 1;
/**
 * Neutro das duas categorias fora da base. É `--text-muted`, e não `--line-strong`: as faixas que
 * saem de "Ainda não cliente" são a entrada de clientes novos, um movimento que precisa ser visto, e
 * `--line-strong` mede 1,79 e 1,83:1 contra o cartão, abaixo do piso. `--text-muted` mede 5,21 e
 * 5,37:1, e a própria tabela da ACE-8 já o aprova como contorno de ausência.
 */
const NEUTRAL_MARK = 'var(--text-muted)';
/** Espessura do contorno do bloco vazado de "Ainda não cliente": quem ainda não entrou não tem área pintada. */
const HOLLOW_STROKE_WIDTH = 1.5;

type CategoryId = string;

function slotColor(slot: 1 | 3 | 5 | 6): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** Preenchimento do bloco: faixa recebe cor de slot, quem saiu recebe neutro, quem ainda não entrou fica vazado. */
function blockFill(category: RevenueBandCategory): string {
  if (category.role === 'notYet') return 'none';
  return category.slot === null ? NEUTRAL_MARK : slotColor(category.slot);
}

/** Preenchimento da faixa: a cor vem da categoria de ORIGEM, e as duas de fora da base entram em neutro cheio. */
function ribbonFill(category: RevenueBandCategory | undefined): string {
  if (!category || category.slot === null) return NEUTRAL_MARK;
  return slotColor(category.slot);
}

function categoryIndex(id: string): number {
  return categories.findIndex((category) => category.id === id);
}

/**
 * Escala vertical em px por cliente, ou `null` quando não há população para escalar. Zero seria um
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
function columnTotals(flows: readonly RevenueFlow[], columnIndex: number, isLast: boolean): Map<CategoryId, number> {
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

function layoutColumn(x: number, totals: ReadonlyMap<CategoryId, number>, scale: number): ColumnLayout {
  const topByCategory = new Map<CategoryId, number>();
  let cursor = MARGIN.top;
  for (const category of categories) {
    topByCategory.set(category.id, cursor);
    cursor += (totals.get(category.id) ?? 0) * scale + BLOCK_GAP;
  }
  return { x, totalsByCategory: totals, topByCategory };
}

/** Clientes dentro da base: a população menos as duas categorias que existem para fechar a conta. */
function inBase(totals: ReadonlyMap<CategoryId, number>): number {
  let sum = 0;
  for (const category of categories) {
    if (category.role === 'band') sum += totals.get(category.id) ?? 0;
  }
  return sum;
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
  readonly share: number;
  readonly total: number;
  readonly category: RevenueBandCategory;
}

export default function RevenueBandAlluvial({ data = defaultData, height, className }: RevenueBandAlluvialProps) {
  const columnTotalsList = columns.map((_column, index) => columnTotals(data, index, index === columns.length - 1));
  const firstTotals = columnTotalsList[0];
  const population = categories.reduce((sum, category) => sum + (firstTotals?.get(category.id) ?? 0), 0);
  const usableHeight = VIEW_HEIGHT - MARGIN.top - MARGIN.bottom - BLOCK_GAP * (categories.length - 1);
  const scale = verticalScale(population, usableHeight);

  // Um portão para os dois vazios: recorte sem linhas (EST-1) e recorte com linhas somando zero cliente.
  if (scale === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cliente neste recorte: não há troca de faixa de receita para desenhar.</span>
      </div>
    );
  }

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
        color: ribbonFill(categories.find((category) => category.id === flow.fromCategory)),
      });
    }
  }

  const blocks: Block[] = columnLayouts.flatMap((layout) =>
    categories.map((category) => {
      const total = layout.totalsByCategory.get(category.id) ?? 0;
      return {
        id: `${String(layout.x)}-${category.id}`,
        x: layout.x,
        top: layout.topByCategory.get(category.id) ?? MARGIN.top,
        height: total * scale,
        share: total / population,
        total,
        category,
      };
    }),
  );

  const topBand = categories[0];
  const lastTotals = columnTotalsList[columnTotalsList.length - 1];
  const lastColumn = columns[columns.length - 1];
  const churned = categories.find((category) => category.role === 'churned');
  const baseFirst = firstTotals ? inBase(firstTotals) : 0;
  const baseLast = lastTotals ? inBase(lastTotals) : 0;
  const topFirst = firstTotals?.get(topBand?.id ?? '') ?? 0;
  const topLast = lastTotals?.get(topBand?.id ?? '') ?? 0;
  const churnedLast = lastTotals?.get(churned?.id ?? '') ?? 0;

  // A frase cresce com o recorte, e o rótulo da faixa mais alta vem do dado: fica curta de propósito,
  // longe do teto de 250 caracteres da ACE-1, para não estourar num recorte com nomes maiores.
  const summary = `Diagrama alluvial da faixa de receita mensal de ${formatInt(population)} clientes em quatro trimestres, em seis categorias na mesma ordem. A base vai de ${formatInt(baseFirst)} para ${formatInt(baseLast)} clientes, a faixa ${topBand?.label ?? ''} sobe de ${formatInt(topFirst)} para ${formatInt(topLast)}, e ${formatInt(churnedLast)} encerraram.`;

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        Nos <span className="tabular-nums font-semibold text-text-primary">{formatInt(population)}</span> clientes, a base sobe de{' '}
        <span className="tabular-nums">{formatInt(baseFirst)}</span> para{' '}
        <span className="tabular-nums font-semibold text-text-primary">{formatInt(baseLast)}</span> e a faixa{' '}
        <span>{topBand?.label ?? ''}</span> vai de <span className="tabular-nums">{formatInt(topFirst)}</span> para{' '}
        <span className="tabular-nums">{formatInt(topLast)}</span> clientes até{' '}
        <span className="tabular-nums">{lastColumn ? formatMonthShort(lastColumn.month) : ''}</span>.
      </p>
      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        {categories.map((category) => (
          <span className="flex items-center gap-1.5 text-xs text-text-secondary" key={category.id}>
            {category.role === 'notYet' ? (
              <span aria-hidden className="size-2.5 shrink-0 rounded-sm border" style={{ borderColor: 'var(--text-muted)' }} />
            ) : (
              <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: blockFill(category) }} />
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
              fill={blockFill(block.category)}
              height={Math.max(block.height, 0)}
              key={block.id}
              rx={1}
              stroke={block.category.role === 'notYet' ? NEUTRAL_MARK : 'none'}
              strokeWidth={block.category.role === 'notYet' ? HOLLOW_STROKE_WIDTH : 0}
              width={BLOCK_WIDTH}
              x={block.x}
              y={block.top}
            >
              {/* Dica que acrescenta e não substitui (DIC-1): a contagem já está escrita nas colunas de
                  ponta e no cabeçalho; o percentual da coluna só existe aqui. */}
              <title>
                {block.category.label}, {formatInt(block.total)} clientes, {formatPercent(block.share)} da coluna
              </title>
            </rect>
          ))}
        </svg>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {columns.map((column, index) => {
            const layout = columnLayouts[index];
            const totals = columnTotalsList[index];
            if (!layout || !totals) return null;
            const leftPercent = ((layout.x + BLOCK_WIDTH / 2) / VIEW_WIDTH) * 100;
            return (
              <span
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center leading-tight whitespace-nowrap"
                key={column.id}
                style={{ left: `${String(leftPercent)}%`, top: `${String((HEADER_Y / VIEW_HEIGHT) * 100)}%` }}
              >
                <span className="text-xs font-medium tabular-nums text-text-secondary">{formatMonthShort(column.month)}</span>
                <span className="kpi-number text-[0.6875rem] font-medium text-text-muted">{formatInt(inBase(totals))} na base</span>
              </span>
            );
          })}
        </div>
        {/* Nome e contagem de cada bloco nas colunas de ponta: fora do aria-hidden, porque são
            números que só existem aqui. As do meio se identificam pela ordem fixa e pela legenda. */}
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
                  style={
                    isFirst
                      ? { right: `${String(100 - xPercent)}%`, top: `${String(centerPercent)}%` }
                      : { left: `${String(xPercent)}%`, top: `${String(centerPercent)}%` }
                  }
                >
                  <span className="text-xs font-medium text-text-secondary">{category.label}</span>
                  <span className="kpi-number text-[0.6875rem] font-medium text-text-muted">{formatInt(total)} clientes</span>
                </span>
              );
            });
          })}
        </div>
      </div>
    </figure>
  );
}
