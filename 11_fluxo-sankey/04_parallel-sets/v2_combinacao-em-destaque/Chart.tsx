import { Filter } from 'lucide-react';

import { formatInt, formatMonthShort, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  axes,
  axisOrder as defaultAxisOrder,
  data as defaultData,
  highlight as defaultHighlight,
  period,
  unitPlural,
  type AxisId,
  type ComboHighlight,
  type ParallelAxis,
  type ParallelCategory,
  type ParallelCombo,
} from './data';

/**
 * Parallel sets com UMA combinação acesa: três eixos categóricos da mesma população de agendas e,
 * atravessando os três, a faixa da combinação em foco em `--chart-1`. Todo o resto fica no neutro
 * que a 17.2 reserva para a marca não destacada (`--line-strong`), e os blocos de eixo ficam em
 * `--text-muted`, que mede 5,2:1 no escuro e 5,4:1 no claro contra o cartão.
 *
 * DUAS DECISÕES DE GEOMETRIA, e as duas existem para a conservação do fluxo ficar visível.
 *
 * 1. A faixa é uma REGIÃO FECHADA de duas bordas cúbicas, nunca um traço grosso: traço grosso não
 *    tem borda própria, engorda com a escala e não deixa medir a espessura, que aqui é o dado.
 * 2. Dentro de cada categoria as combinações são empilhadas pela MESMA ordem lexicográfica dos
 *    eixos, de ponta a ponta. Por isso cada combinação é uma fita contínua e de espessura
 *    constante do primeiro ao último eixo: o que entra numa categoria sai dela na mesma altura
 *    relativa, e nada desaparece no meio do caminho. É a diferença em relação à v1, que ordena a
 *    saída de cada eixo pelo segmento de destino e por isso corta a fita ao meio do diagrama.
 *
 * O bloco de eixo recebe, na altura da combinação em foco, uma fatia acesa da mesma espessura da
 * faixa: é ela que costura as duas faixas e prova que as 21 agendas que entram em Grande são as
 * mesmas 21 que saem para Realizada.
 */
export interface FocusedComboParallelSetsProps {
  readonly data?: readonly ParallelCombo[];
  /** A combinação que acende: uma categoria por eixo. */
  readonly highlight?: ComboHighlight;
  /** Ordem inicial de leitura dos eixos. Reordenar por clique é trabalho do Farol. */
  readonly axisOrder?: readonly AxisId[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * O canvas é declarado por número no `meta.json` (960 x 540) e o `viewBox` repete o CORPO medido
 * dessa moldura, 894 x 421,5 px, para a escala do SVG sair 1 e o tamanho de fonte declarado ser o
 * tamanho que a tela mostra. Canvas menor encolheria o texto sem nenhuma guarda perceber.
 */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 421.5;
/** Linha de leitura (12 px), legenda (11 px) e nome dos eixos (11 px), uma por linha de base. */
const READING_BASELINE = 13;
const LEGEND_BASELINE = 32;
const AXIS_NAME_BASELINE = 52;
const AXIS_TOP = 66;
const AXIS_BOTTOM_PAD = 8;
const SIDE_PAD = 2;
const BLOCK_WIDTH = 96;
/**
 * Raia de rótulo reservada ACIMA de cada segmento, com nome numa linha e contagem na seguinte.
 * A raia vive dentro da faixa horizontal do próprio bloco, onde nenhuma fita passa, então o
 * rótulo nunca cruza marca e não precisa de halo.
 */
const LANE = 32;
const LANE_NAME_DY = 20;
const LANE_COUNT_DY = 6;
const LEGEND_SWATCH_WIDTH = 14;
const LEGEND_SWATCH_HEIGHT = 8;
const LEGEND_TEXT_GAP = 20;
const LEGEND_SECOND_X = 150;
const TEXT_SIZE = 11;
const READING_SIZE = 12;

const FOCUS_FILL = 'var(--chart-1)';
/** O neutro da marca não destacada, como a 17.2 manda. Fica abaixo de 3:1 de propósito. */
const CONTEXT_FILL = 'var(--line-strong)';
const BLOCK_FILL = 'var(--text-muted)';
const BLOCK_STROKE = 'var(--surface-raised)';

function categoryOf(combo: ParallelCombo, axis: AxisId): string {
  if (axis === 'origem') return combo.origem;
  if (axis === 'porte') return combo.porte;
  return combo.desfecho;
}

function focusedCategoryOf(focus: ComboHighlight, axis: AxisId): string {
  if (axis === 'origem') return focus.origem;
  if (axis === 'porte') return focus.porte;
  return focus.desfecho;
}

/** Ordem lexicográfica pelos índices de categoria, eixo por eixo, na ordem de leitura. */
function compareCombos(a: ParallelCombo, b: ParallelCombo, ordered: readonly ParallelAxis[]): number {
  for (const axis of ordered) {
    const indexA = axis.categories.findIndex((category) => category.id === categoryOf(a, axis.id));
    const indexB = axis.categories.findIndex((category) => category.id === categoryOf(b, axis.id));
    if (indexA !== indexB) return indexA - indexB;
  }
  return 0;
}

/**
 * Região fechada entre dois eixos: borda de cima da esquerda para a direita, descida na vertical,
 * borda de baixo de volta, e fecha. O ponto de controle das duas cúbicas fica no meio do vão, o
 * que deixa as bordas horizontais junto dos blocos e mantém a raia de rótulo livre de tinta.
 */
function ribbonRegion(x0: number, top0: number, bottom0: number, x1: number, top1: number, bottom1: number): string {
  const middle = (x0 + x1) / 2;
  return [
    `M ${String(x0)},${String(top0)}`,
    `C ${String(middle)},${String(top0)} ${String(middle)},${String(top1)} ${String(x1)},${String(top1)}`,
    `L ${String(x1)},${String(bottom1)}`,
    `C ${String(middle)},${String(bottom1)} ${String(middle)},${String(bottom0)} ${String(x0)},${String(bottom0)}`,
    'Z',
  ].join(' ');
}

interface ComboItem {
  readonly combo: ParallelCombo;
  readonly index: number;
  readonly focused: boolean;
}

interface CategorySlice {
  readonly category: ParallelCategory;
  readonly top: number;
  readonly height: number;
  readonly count: number;
  readonly focused: boolean;
}

interface AxisColumn {
  readonly axis: ParallelAxis;
  readonly x: number;
  readonly slices: readonly CategorySlice[];
  /** Topo da fita de cada combinação dentro da categoria dela, por índice de combinação. */
  readonly comboTop: ReadonlyMap<number, number>;
}

/** Uma coluna: raia de rótulo mais segmento por categoria, e a fita de cada combinação dentro dele. */
function buildColumn(
  axis: ParallelAxis,
  x: number,
  items: readonly ComboItem[],
  scale: number,
  laneBudget: number,
  focus: ComboHighlight,
): AxisColumn {
  const ownLanes = axis.categories.length * LANE;
  // Eixo com menos categorias gasta menos raia, então ele é CENTRADO no vão do eixo mais alto.
  // Sem isso os eixos terminariam em alturas diferentes e a coluna mais curta pareceria menor.
  let cursor = AXIS_TOP + (laneBudget - ownLanes) / 2;
  const slices: CategorySlice[] = [];
  const comboTop = new Map<number, number>();
  const focused = focusedCategoryOf(focus, axis.id);
  for (const category of axis.categories) {
    cursor += LANE;
    const top = cursor;
    let inner = cursor;
    let count = 0;
    for (const item of items) {
      if (categoryOf(item.combo, axis.id) !== category.id) continue;
      comboTop.set(item.index, inner);
      inner += item.combo.count * scale;
      count += item.combo.count;
    }
    slices.push({ category, top, height: count * scale, count, focused: category.id === focused });
    cursor = inner;
  }
  return { axis, x, slices, comboTop };
}

interface Ribbon {
  readonly key: string;
  readonly d: string;
  readonly focused: boolean;
}

export default function FocusedComboParallelSets({
  data = defaultData,
  highlight = defaultHighlight,
  axisOrder = defaultAxisOrder,
  height,
  className,
}: FocusedComboParallelSetsProps) {
  const grandTotal = data.reduce((sum, row) => sum + row.count, 0);

  // EST-1: sem linha nenhuma o diagrama não existe, e o vazio substitui o visual inteiro. A saída
  // é antecipada para nenhuma conta adiante precisar de um ramo que devolva zero (EST-1b).
  if (data.length === 0 || grandTotal <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma agenda neste recorte: não há combinação de origem, porte e desfecho para cruzar.</span>
      </div>
    );
  }

  const ordered = axisOrder
    .map((id) => axes.find((axis) => axis.id === id))
    .filter((axis): axis is ParallelAxis => axis !== undefined);
  const laneBudget = ordered.reduce((most, axis) => Math.max(most, axis.categories.length), 0) * LANE;

  const plotHeight = VIEW_HEIGHT - AXIS_TOP - AXIS_BOTTOM_PAD;
  const scale = (plotHeight - laneBudget) / grandTotal;
  const span = (VIEW_WIDTH - SIDE_PAD * 2 - ordered.length * BLOCK_WIDTH) / Math.max(ordered.length - 1, 1);

  const items: readonly ComboItem[] = [...data]
    .sort((a, b) => compareCombos(a, b, ordered))
    .map((combo, index) => ({
      combo,
      index,
      focused:
        combo.origem === highlight.origem && combo.porte === highlight.porte && combo.desfecho === highlight.desfecho,
    }));

  const columns = ordered.map((axis, index) =>
    buildColumn(axis, SIDE_PAD + index * (BLOCK_WIDTH + span), items, scale, laneBudget, highlight),
  );

  const ribbons: Ribbon[] = [];
  for (let index = 0; index + 1 < columns.length; index += 1) {
    const from = columns[index];
    const to = columns[index + 1];
    if (from === undefined || to === undefined) continue;
    for (const item of items) {
      const topFrom = from.comboTop.get(item.index);
      const topTo = to.comboTop.get(item.index);
      if (topFrom === undefined || topTo === undefined) continue;
      const thickness = item.combo.count * scale;
      ribbons.push({
        key: `ribbon-${String(index)}-${String(item.index)}`,
        d: ribbonRegion(from.x + BLOCK_WIDTH, topFrom, topFrom + thickness, to.x, topTo, topTo + thickness),
        focused: item.focused,
      });
    }
  }

  const focusedItem = items.find((item) => item.focused);
  // Soma com semente, nunca ramo de vazio: combinação ausente do recorte tem contagem medida de
  // zero agendas, e `formatRateWithVolume` imprime o par com a base à vista.
  const focusedCount = items.reduce((sum, item) => (item.focused ? sum + item.combo.count : sum), 0);
  const focusedNames = ordered
    .map((axis) => axis.categories.find((category) => category.id === focusedCategoryOf(highlight, axis.id))?.label ?? '')
    .filter((label) => label.length > 0)
    .join(', ');
  const otherCombos = items.filter((item) => !item.focused).length;
  const otherCount = grandTotal - focusedCount;

  const focusedRate = formatRateWithVolume(focusedCount, grandTotal);
  const readingPrefix = `Nas ${formatInt(grandTotal)} ${unitPlural} de ${formatMonthShort(period)}, `;
  const othersLabel = `outras ${formatInt(otherCombos)} combinações somam ${formatInt(otherCount)} ${unitPlural}`;
  const summary = `Parallel sets de ${formatInt(grandTotal)} ${unitPlural} de pré-vendas em ${formatMonthShort(period)}, com origem, porte e desfecho nos eixos. A combinação em foco, ${focusedNames}, concentra ${focusedRate}; as ${othersLabel}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg
        aria-hidden
        className="h-full w-full"
        viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}
      >
        {/* Contexto primeiro, foco depois: a fita acesa nunca fica coberta por vizinha. */}
        {ribbons
          .filter((ribbon) => !ribbon.focused)
          .map((ribbon) => (
            <path d={ribbon.d} fill={CONTEXT_FILL} key={ribbon.key} />
          ))}
        {ribbons
          .filter((ribbon) => ribbon.focused)
          .map((ribbon) => (
            <path d={ribbon.d} fill={FOCUS_FILL} key={ribbon.key} />
          ))}

        {columns.map((column) =>
          column.slices.map((slice) => (
            <rect
              fill={BLOCK_FILL}
              height={Math.max(slice.height, 0)}
              key={`block-${column.axis.id}-${slice.category.id}`}
              stroke={BLOCK_STROKE}
              strokeWidth={1}
              width={BLOCK_WIDTH}
              x={column.x}
              y={slice.top}
            />
          )),
        )}

        {/* A fatia acesa dentro do bloco costura as duas faixas e mostra a conservação do fluxo. */}
        {focusedItem === undefined
          ? null
          : columns.map((column) => {
              const top = column.comboTop.get(focusedItem.index);
              if (top === undefined) return null;
              return (
                <rect
                  fill={FOCUS_FILL}
                  height={focusedItem.combo.count * scale}
                  key={`focus-${column.axis.id}`}
                  width={BLOCK_WIDTH}
                  x={column.x}
                  y={top}
                />
              );
            })}

        {columns.map((column) => (
          <text
            fill="var(--text-muted)"
            fontSize={TEXT_SIZE}
            key={`axis-${column.axis.id}`}
            textAnchor="middle"
            x={column.x + BLOCK_WIDTH / 2}
            y={AXIS_NAME_BASELINE}
          >
            {column.axis.label}
          </text>
        ))}

        {columns.map((column) =>
          column.slices.map((slice) => {
            const center = column.x + BLOCK_WIDTH / 2;
            const tone = slice.focused ? 'var(--text-primary)' : 'var(--text-muted)';
            return (
              <text
                className={cn('tabular-nums', slice.focused && 'font-semibold')}
                fill={tone}
                fontSize={TEXT_SIZE}
                key={`label-${column.axis.id}-${slice.category.id}`}
                textAnchor="middle"
              >
                <tspan x={center} y={slice.top - LANE_NAME_DY}>
                  {slice.category.label}
                </tspan>
                <tspan x={center} y={slice.top - LANE_COUNT_DY}>
                  {`${formatInt(slice.count)} ${unitPlural}`}
                </tspan>
              </text>
            );
          }),
        )}

        {/* Linha de leitura (ANO-5): a conclusão calculada do dado, com o nome e o valor do foco. */}
        <text fill="var(--text-secondary)" fontSize={READING_SIZE} x={0} y={READING_BASELINE}>
          <tspan className="tabular-nums" fill="var(--text-secondary)">
            {readingPrefix}
          </tspan>
          <tspan className="font-bold" fill="var(--text-primary)">
            {focusedNames}
          </tspan>
          <tspan fill="var(--text-secondary)">{' concentra '}</tspan>
          <tspan className="tabular-nums font-bold" fill="var(--text-primary)">
            {focusedRate}
          </tspan>
          <tspan fill="var(--text-secondary)">{' das agendas marcadas.'}</tspan>
        </text>

        {/* Legenda de duas entradas (ROT-4): a amostra tem a forma da marca, que aqui é uma fita. */}
        <rect
          fill={FOCUS_FILL}
          height={LEGEND_SWATCH_HEIGHT}
          rx={1}
          width={LEGEND_SWATCH_WIDTH}
          x={0}
          y={LEGEND_BASELINE - LEGEND_SWATCH_HEIGHT}
        />
        <text fill="var(--text-secondary)" fontSize={TEXT_SIZE} x={LEGEND_TEXT_GAP} y={LEGEND_BASELINE}>
          combinação em foco
        </text>
        <rect
          fill={CONTEXT_FILL}
          height={LEGEND_SWATCH_HEIGHT}
          rx={1}
          width={LEGEND_SWATCH_WIDTH}
          x={LEGEND_SECOND_X}
          y={LEGEND_BASELINE - LEGEND_SWATCH_HEIGHT}
        />
        <text
          className="tabular-nums"
          fill="var(--text-muted)"
          fontSize={TEXT_SIZE}
          x={LEGEND_SECOND_X + LEGEND_TEXT_GAP}
          y={LEGEND_BASELINE}
        >
          {othersLabel}
        </text>
      </svg>
    </figure>
  );
}
