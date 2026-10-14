import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, desfechos, origens, portes, type ParallelCategory, type ParallelCombo } from './data';

/**
 * Parallel sets em SVG puro: três eixos (origem, porte, desfecho) são barras finas segmentadas
 * pela mesma população de agendas, sem seta e sem ordem temporal. Faixas entre eixos VIZINHOS
 * mostram como as dimensões se combinam; só a origem, a primeira dimensão, empresta cor às
 * faixas dos dois níveis (origem para porte e porte para desfecho), porque é a única categoria
 * que se mantém identificável ao longo do caminho inteiro. Porte e desfecho ficam em neutro
 * (`--line-strong`), como os nós de destino do 01_sankey-simples.
 *
 * Cada categoria, nos três eixos, ganha uma "raia" de rótulo (nome e contagem) reservada ACIMA
 * do próprio segmento, nunca ao lado: como as faixas só ocupam a extensão vertical dos
 * segmentos, a raia de rótulo nunca tem tinta de faixa passando por ela, em nenhum dos três
 * eixos, mesmo o do meio (que não tem margem livre à esquerda nem à direita).
 */
export interface AgendaParallelSetsProps {
  readonly data?: readonly ParallelCombo[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_WIDTH = 900;
const VIEW_HEIGHT = 300;
const HEADER_Y = 10;
const MARGIN = { top: 34, right: 74, bottom: 10, left: 74 } as const;
const BLOCK_WIDTH = 20;
/** Altura da raia de rótulo (nome + contagem em uma linha, 11 px) reservada antes de cada segmento. */
const LABEL_LANE = 24;
const RIBBON_STROKE = 'var(--surface-raised)';
const RIBBON_STROKE_WIDTH = 1;
const NEUTRAL_FILL = 'var(--line-strong)';

function categoryColor(category: ParallelCategory): string {
  return category.slot === undefined ? NEUTRAL_FILL : (CHART_SERIES_COLORS[category.slot - 1] ?? NEUTRAL_FILL);
}

function categoryIndex(categories: readonly ParallelCategory[], id: string): number {
  return categories.findIndex((category) => category.id === id);
}

function sumByCategory(rows: readonly ParallelCombo[], pick: (row: ParallelCombo) => string): Map<string, number> {
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(pick(row), (totals.get(pick(row)) ?? 0) + row.count);
  return totals;
}

interface ColumnLayout {
  readonly x: number;
  readonly topByCategory: ReadonlyMap<string, number>;
  readonly totalByCategory: ReadonlyMap<string, number>;
}

/** Uma raia de rótulo e um segmento por categoria, empilhados na ordem fixa do eixo. */
function layoutColumn(x: number, categories: readonly ParallelCategory[], totals: ReadonlyMap<string, number>, scale: number): ColumnLayout {
  const topByCategory = new Map<string, number>();
  const totalByCategory = new Map<string, number>();
  let cursor = MARGIN.top;
  for (const category of categories) {
    cursor += LABEL_LANE;
    topByCategory.set(category.id, cursor);
    const total = totals.get(category.id) ?? 0;
    totalByCategory.set(category.id, total);
    cursor += total * scale;
  }
  return { x, topByCategory, totalByCategory };
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

interface Ribbon {
  readonly id: string;
  readonly d: string;
  readonly color: string;
}

interface Segment {
  readonly id: string;
  readonly x: number;
  readonly top: number;
  readonly height: number;
  readonly category: ParallelCategory;
}

export default function AgendaParallelSets({ data = defaultData, height, className }: AgendaParallelSetsProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma agenda neste recorte: não há combinação de origem, porte e desfecho para desenhar.</span>
      </div>
    );
  }

  const grandTotal = data.reduce((sum, row) => sum + row.count, 0);
  const maxCategories = Math.max(origens.length, portes.length, desfechos.length);
  const usableHeight = VIEW_HEIGHT - MARGIN.top - MARGIN.bottom - maxCategories * LABEL_LANE;
  const scale = grandTotal > 0 ? usableHeight / grandTotal : 0;

  const plotWidth = VIEW_WIDTH - MARGIN.left - MARGIN.right - BLOCK_WIDTH;
  const xOrigem = MARGIN.left;
  const xPorte = MARGIN.left + plotWidth / 2;
  const xDesfecho = MARGIN.left + plotWidth;

  const origemLayout = layoutColumn(xOrigem, origens, sumByCategory(data, (row) => row.origem), scale);
  const porteLayout = layoutColumn(xPorte, portes, sumByCategory(data, (row) => row.porte), scale);
  const desfechoLayout = layoutColumn(xDesfecho, desfechos, sumByCategory(data, (row) => row.desfecho), scale);

  function colorOf(list: readonly ParallelCategory[], id: string): string {
    const found = list.find((category) => category.id === id);
    return found ? categoryColor(found) : NEUTRAL_FILL;
  }

  // Camada 1 (origem para porte): flui agregado por par, um único sort em (origem, porte) que
  // entrega ao mesmo tempo a saída da origem ordenada pelo porte e a entrada do porte ordenada
  // pela origem (a mesma técnica do 03_alluvial).
  const layer1Totals = new Map<string, number>();
  for (const row of data) {
    const key = `${row.origem}|${row.porte}`;
    layer1Totals.set(key, (layer1Totals.get(key) ?? 0) + row.count);
  }
  const layer1 = [...layer1Totals.entries()]
    .map(([key, count]) => {
      const [origem = '', porte = ''] = key.split('|');
      return { origem, porte, count };
    })
    .sort((a, b) => categoryIndex(origens, a.origem) - categoryIndex(origens, b.origem) || categoryIndex(portes, a.porte) - categoryIndex(portes, b.porte));

  const origemCursor = new Map(origens.map((category) => [category.id, origemLayout.topByCategory.get(category.id) ?? MARGIN.top]));
  const porteCursorIn = new Map(portes.map((category) => [category.id, porteLayout.topByCategory.get(category.id) ?? MARGIN.top]));
  const ribbons1: Ribbon[] = layer1.map((flow) => {
    const h = flow.count * scale;
    const sourceTop = origemCursor.get(flow.origem) ?? MARGIN.top;
    origemCursor.set(flow.origem, sourceTop + h);
    const targetTop = porteCursorIn.get(flow.porte) ?? MARGIN.top;
    porteCursorIn.set(flow.porte, targetTop + h);
    return {
      id: `l1-${flow.origem}-${flow.porte}`,
      d: ribbonPath(origemLayout.x + BLOCK_WIDTH, sourceTop, sourceTop + h, porteLayout.x, targetTop, targetTop + h),
      color: colorOf(origens, flow.origem),
    };
  });

  // Camada 2 (porte para desfecho): cada linha do dado já é a combinação inteira, então o
  // segundo sort usa (porte, desfecho, origem): agrupa pelo porte, ordena a saída pelo desfecho
  // (o destino) e usa a origem só para desempatar combinações com o mesmo par porte e desfecho,
  // sem perder a cor herdada da primeira dimensão.
  const layer2 = [...data].sort(
    (a, b) =>
      categoryIndex(portes, a.porte) - categoryIndex(portes, b.porte) ||
      categoryIndex(desfechos, a.desfecho) - categoryIndex(desfechos, b.desfecho) ||
      categoryIndex(origens, a.origem) - categoryIndex(origens, b.origem),
  );
  const porteCursorOut = new Map(portes.map((category) => [category.id, porteLayout.topByCategory.get(category.id) ?? MARGIN.top]));
  const desfechoCursor = new Map(desfechos.map((category) => [category.id, desfechoLayout.topByCategory.get(category.id) ?? MARGIN.top]));
  const ribbons2: Ribbon[] = layer2.map((row) => {
    const h = row.count * scale;
    const sourceTop = porteCursorOut.get(row.porte) ?? MARGIN.top;
    porteCursorOut.set(row.porte, sourceTop + h);
    const targetTop = desfechoCursor.get(row.desfecho) ?? MARGIN.top;
    desfechoCursor.set(row.desfecho, targetTop + h);
    return {
      id: `l2-${row.origem}-${row.porte}-${row.desfecho}`,
      d: ribbonPath(porteLayout.x + BLOCK_WIDTH, sourceTop, sourceTop + h, desfechoLayout.x, targetTop, targetTop + h),
      color: colorOf(origens, row.origem),
    };
  });

  function segmentsFor(layout: ColumnLayout, categories: readonly ParallelCategory[]): Segment[] {
    return categories.map((category) => ({
      id: `${layout.x.toFixed(0)}-${category.id}`,
      x: layout.x,
      top: layout.topByCategory.get(category.id) ?? MARGIN.top,
      height: (layout.totalByCategory.get(category.id) ?? 0) * scale,
      category,
    }));
  }
  const segments = [...segmentsFor(origemLayout, origens), ...segmentsFor(porteLayout, portes), ...segmentsFor(desfechoLayout, desfechos)];

  const leaderOrigem = origens.reduce<{ readonly category: ParallelCategory; readonly total: number } | null>((best, category) => {
    const total = origemLayout.totalByCategory.get(category.id) ?? 0;
    return best === null || total > best.total ? { category, total } : best;
  }, null);
  const leaderDesfecho = desfechos.reduce<{ readonly category: ParallelCategory; readonly total: number } | null>((best, category) => {
    const total = desfechoLayout.totalByCategory.get(category.id) ?? 0;
    return best === null || total > best.total ? { category, total } : best;
  }, null);

  const summary = `Parallel sets cruzando origem, porte e desfecho de ${formatInt(grandTotal)} agendas de pré-vendas em 2026-08, com ${String(origens.length)} origens, ${String(portes.length)} portes e ${String(desfechos.length)} desfechos. ${leaderOrigem?.category.label ?? ''} lidera as origens com ${formatInt(leaderOrigem?.total ?? 0)} agendas; ${leaderDesfecho?.category.label ?? ''} é o desfecho mais comum, com ${formatInt(leaderDesfecho?.total ?? 0)}.`;

  const axisHeaders = [
    { id: 'origem', label: 'Origem', x: xOrigem },
    { id: 'porte', label: 'Porte', x: xPorte },
    { id: 'desfecho', label: 'Desfecho', x: xDesfecho },
  ];

  return (
    <figure
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-5 text-text-secondary">
        Nas <span className="tabular-nums font-semibold text-text-primary">{formatInt(grandTotal)}</span> agendas,{' '}
        <span className="font-semibold text-text-primary">{leaderOrigem?.category.label ?? ''}</span> lidera as origens e{' '}
        <span className="font-semibold text-text-primary">{leaderDesfecho?.category.label ?? ''}</span> é o desfecho mais comum, com{' '}
        <span className="tabular-nums">{formatInt(leaderDesfecho?.total ?? 0)}</span> das agendas.
      </p>
      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        {origens.map((category) => (
          <span className="flex items-center gap-1.5 text-xs text-text-secondary" key={category.id}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: categoryColor(category) }} />
            {category.label}
          </span>
        ))}
      </div>
      <div className="relative min-h-0 w-full flex-1">
        <svg aria-hidden className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
          {ribbons1.map((ribbon) => (
            <path d={ribbon.d} fill={ribbon.color} key={ribbon.id} stroke={RIBBON_STROKE} strokeWidth={RIBBON_STROKE_WIDTH} />
          ))}
          {ribbons2.map((ribbon) => (
            <path d={ribbon.d} fill={ribbon.color} key={ribbon.id} stroke={RIBBON_STROKE} strokeWidth={RIBBON_STROKE_WIDTH} />
          ))}
          {segments.map((segment) => (
            <rect fill={categoryColor(segment.category)} height={Math.max(segment.height, 0)} key={segment.id} rx={1} width={BLOCK_WIDTH} x={segment.x} y={segment.top} />
          ))}
        </svg>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {axisHeaders.map((axis) => (
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-text-secondary"
              key={axis.id}
              style={{ left: `${String(((axis.x + BLOCK_WIDTH / 2) / VIEW_WIDTH) * 100)}%`, top: `${String((HEADER_Y / VIEW_HEIGHT) * 100)}%` }}
            >
              {axis.label}
            </span>
          ))}
        </div>
        {/* Nome e contagem de cada segmento, na raia reservada acima dele: informação própria de
            cada categoria, que a frase acessível da raiz não repete uma a uma. */}
        <div className="pointer-events-none absolute inset-0">
          {segments.map((segment) => {
            const count = scale > 0 ? Math.round(segment.height / scale) : 0;
            const leftPercent = ((segment.x + BLOCK_WIDTH / 2) / VIEW_WIDTH) * 100;
            const topPercent = ((segment.top - LABEL_LANE / 2) / VIEW_HEIGHT) * 100;
            return (
              <span
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center whitespace-nowrap leading-tight"
                key={`label-${segment.id}`}
                style={{ left: `${String(leftPercent)}%`, top: `${String(topPercent)}%` }}
              >
                <span className="text-[0.6875rem] font-medium text-text-secondary">
                  {segment.category.label}, <span className="tabular-nums text-text-muted">{formatInt(count)} agendas</span>
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
