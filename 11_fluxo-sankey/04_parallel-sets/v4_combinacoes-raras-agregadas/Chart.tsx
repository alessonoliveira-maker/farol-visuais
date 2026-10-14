import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  axes,
  axisOrder as defaultAxisOrder,
  data as defaultData,
  period,
  unitPlural,
  type AxisId,
  type ParallelAxis,
  type ParallelCategory,
  type ParallelCombo,
} from './data';

/**
 * Parallel sets com LIMIAR: toda combinação abaixo de `MIN_COMBO_COUNT` agendas sai da sua
 * categoria e entra numa categoria própria, "Outras combinações", que existe nos três eixos e vem
 * sempre por último, no neutro da 17.2.
 *
 * POR QUE AGREGAR. Com 248 agendas em 28 combinações, as menores desenham fitas de menos de 2 px:
 * viram fio de cabelo, somem sob o contorno de separação e, pior, sugerem um padrão que uma ou duas
 * agendas não sustentam. Agregar tira o fio de cabelo do desenho sem tirar as agendas da conta.
 *
 * O QUE SAI E O QUE FICA, e esta é a parte que não pode ser calada. As agendas agregadas continuam
 * nas 248: elas trocam de categoria, não desaparecem. Por isso a faixa agregada é desenhada, tem a
 * contagem escrita no rótulo como qualquer outra categoria, e as seis combinações que entraram nela
 * vão listadas uma a uma no rodapé, com nome e contagem. Sem a lista, "outras" seria só um lugar
 * onde o dado some.
 *
 * O LIMIAR É CONSTANTE DO COMPONENTE, não do dado: o `data.ts` entrega as 28 combinações cruas e o
 * mesmo dado serve para desenhar sem agregação nenhuma. Se o corte viesse pronto no dado, ninguém
 * saberia qual foi o corte.
 */
export interface RareComboParallelSetsProps {
  readonly data?: readonly ParallelCombo[];
  /** Ordem inicial de leitura dos eixos. Reordenar por clique é trabalho do Farol. */
  readonly axisOrder?: readonly AxisId[];
  readonly height?: number;
  readonly className?: string;
}

/** Abaixo disto a combinação não sustenta padrão e entra na categoria agregada. */
const MIN_COMBO_COUNT = 5;
const AGGREGATE_ID = 'outras';
const AGGREGATE_LABEL = 'Outras combinações';
/** A mesma categoria no meio de frase, sem maiúscula, para a linha de leitura. */
const AGGREGATE_LABEL_INLINE = 'outras combinações';

/**
 * Canvas declarado por número no `meta.json` (960 x 640) e `viewBox` igual ao CORPO medido dessa
 * moldura, 894 x 521,5 px, para a escala do SVG sair 1: 11 px declarados são 11 px na tela.
 */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 521.5;
const READING_BASELINE = 13;
const NOTE_BASELINE = 32;
const AXIS_NAME_BASELINE = 52;
const AXIS_TOP = 66;
/** O diagrama termina aqui para o rodapé com a lista das agregadas caber embaixo. */
const AXIS_BOTTOM = 462;
const FOOTER_NOTE_BASELINE = 481.5;
const FOOTER_ROW_STEP = 16;
const FOOTER_COLUMNS = 3;
const SIDE_PAD = 2;
/** Mais largo que nas irmãs, porque o rótulo "Outras combinações" mede 103,8 px de tinta. */
const BLOCK_WIDTH = 112;
const LANE = 32;
const LANE_NAME_DY = 20;
const LANE_COUNT_DY = 6;
const TEXT_SIZE = 11;
const READING_SIZE = 12;

/** Neutro da 17.2 para a categoria agregada, nos três eixos e nas fitas dela. */
const AGGREGATE_FILL = 'var(--line-strong)';
const BLOCK_FILL = 'var(--text-muted)';
/** COR-5: contorno na cor da superfície separa fitas vizinhas da mesma origem. */
const RIBBON_STROKE = 'var(--surface-raised)';
const RIBBON_STROKE_WIDTH = 1;

function categoryOf(combo: ParallelCombo, axis: AxisId): string {
  if (axis === 'origem') return combo.origem;
  if (axis === 'porte') return combo.porte;
  return combo.desfecho;
}

function slotColor(category: ParallelCategory | undefined): string {
  if (category?.slot === undefined) return BLOCK_FILL;
  return CHART_SERIES_COLORS[category.slot - 1] ?? BLOCK_FILL;
}

/** Agregada em neutro; origem na cor do slot dela; porte e desfecho em neutro de bloco. */
function blockFill(axisId: AxisId, category: ParallelCategory): string {
  if (category.id === AGGREGATE_ID) return AGGREGATE_FILL;
  if (axisId !== 'origem') return BLOCK_FILL;
  return slotColor(category);
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

/** Região fechada de duas bordas cúbicas. Traço grosso não tem borda, e a borda aqui é o dado. */
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
  readonly fill: string;
}

interface CategorySlice {
  readonly category: ParallelCategory;
  readonly top: number;
  readonly height: number;
  readonly count: number;
}

interface AxisColumn {
  readonly axis: ParallelAxis;
  readonly x: number;
  readonly slices: readonly CategorySlice[];
  readonly comboTop: ReadonlyMap<number, number>;
}

function buildColumn(
  axis: ParallelAxis,
  x: number,
  items: readonly ComboItem[],
  scale: number,
  laneBudget: number,
): AxisColumn {
  const ownLanes = axis.categories.length * LANE;
  // Eixo com menos categorias é CENTRADO no vão do eixo mais alto, para os três ocuparem a mesma
  // extensão vertical e nenhum parecer maior do que é.
  let cursor = AXIS_TOP + (laneBudget - ownLanes) / 2;
  const slices: CategorySlice[] = [];
  const comboTop = new Map<number, number>();
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
    slices.push({ category, top, height: count * scale, count });
    cursor = inner;
  }
  return { axis, x, slices, comboTop };
}

interface Ribbon {
  readonly key: string;
  readonly d: string;
  readonly fill: string;
}

export default function RareComboParallelSets({
  data = defaultData,
  axisOrder = defaultAxisOrder,
  height,
  className,
}: RareComboParallelSetsProps) {
  const grandTotal = data.reduce((sum, row) => sum + row.count, 0);

  if (data.length === 0 || grandTotal <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma agenda neste recorte: não há combinação de origem, porte e desfecho para cruzar.</span>
      </div>
    );
  }

  // O corte. As raras trocam de categoria, nunca saem da soma: `kept` mais a agregada é sempre o
  // total de entrada.
  const rare = data.filter((row) => row.count < MIN_COMBO_COUNT);
  const kept = data.filter((row) => row.count >= MIN_COMBO_COUNT);
  const rareTotal = rare.reduce((sum, row) => sum + row.count, 0);
  const aggregated: ParallelCombo = {
    origem: AGGREGATE_ID,
    porte: AGGREGATE_ID,
    desfecho: AGGREGATE_ID,
    count: rareTotal,
  };
  const shown: readonly ParallelCombo[] = rare.length === 0 ? kept : [...kept, aggregated];
  const aggregateCategory: ParallelCategory = { id: AGGREGATE_ID, label: AGGREGATE_LABEL };

  const ordered = axisOrder
    .map((id) => axes.find((axis) => axis.id === id))
    .filter((axis): axis is ParallelAxis => axis !== undefined)
    .map((axis) =>
      rare.length === 0 ? axis : { ...axis, categories: [...axis.categories, aggregateCategory] },
    );
  const laneBudget = ordered.reduce((most, axis) => Math.max(most, axis.categories.length), 0) * LANE;

  const plotHeight = AXIS_BOTTOM - AXIS_TOP;
  const scale = (plotHeight - laneBudget) / grandTotal;
  const span = (VIEW_WIDTH - SIDE_PAD * 2 - ordered.length * BLOCK_WIDTH) / Math.max(ordered.length - 1, 1);
  const originAxis = ordered.find((axis) => axis.id === 'origem');

  const items: readonly ComboItem[] = [...shown]
    .sort((a, b) => compareCombos(a, b, ordered))
    .map((combo, index) => ({
      combo,
      index,
      fill:
        combo.origem === AGGREGATE_ID
          ? AGGREGATE_FILL
          : slotColor(originAxis?.categories.find((category) => category.id === combo.origem)),
    }));

  const columns = ordered.map((axis, index) =>
    buildColumn(axis, SIDE_PAD + index * (BLOCK_WIDTH + span), items, scale, laneBudget),
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
        fill: item.fill,
      });
    }
  }

  // A lista das agregadas, uma a uma, com nome e contagem: é a alternativa tabular da faixa.
  const rareLines = [...rare]
    .sort((a, b) => b.count - a.count || compareCombos(a, b, ordered))
    .map((row, index) => {
      const names = ordered
        .map((axis) => axis.categories.find((category) => category.id === categoryOf(row, axis.id))?.label ?? '')
        .filter((label) => label.length > 0)
        .join(' · ');
      return {
        key: `rare-${String(index)}`,
        text: `${names}, ${formatInt(row.count)} ${unitPlural}`,
        column: index % FOOTER_COLUMNS,
        row: Math.floor(index / FOOTER_COLUMNS),
      };
    });

  const thresholdLabel = `${formatInt(MIN_COMBO_COUNT)} ${unitPlural}`;
  const aggregateLabel = `${formatInt(rareTotal)} ${unitPlural}`;
  const readingPrefix = `Das ${formatInt(data.length)} combinações das ${formatInt(grandTotal)} ${unitPlural} de ${formatMonthShort(period)}, ${formatInt(rare.length)} ficam abaixo de ${thresholdLabel} e viram `;
  const summary = `Parallel sets de ${formatInt(grandTotal)} ${unitPlural} de pré-vendas em ${formatMonthShort(period)}, com origem, porte e desfecho nos eixos. Das ${formatInt(data.length)} combinações, ${formatInt(rare.length)} ficam abaixo de ${thresholdLabel} e foram agregadas em outras combinações, com ${aggregateLabel}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        {ribbons.map((ribbon) => (
          <path d={ribbon.d} fill={ribbon.fill} key={ribbon.key} stroke={RIBBON_STROKE} strokeWidth={RIBBON_STROKE_WIDTH} />
        ))}

        {columns.map((column) =>
          column.slices.map((slice) => (
            <rect
              fill={blockFill(column.axis.id, slice.category)}
              height={Math.max(slice.height, 0)}
              key={`block-${column.axis.id}-${slice.category.id}`}
              stroke={RIBBON_STROKE}
              strokeWidth={RIBBON_STROKE_WIDTH}
              width={BLOCK_WIDTH}
              x={column.x}
              y={slice.top}
            />
          )),
        )}

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
            const isAggregate = slice.category.id === AGGREGATE_ID;
            return (
              <text
                className={cn('tabular-nums', isAggregate && 'font-semibold')}
                fill={isAggregate ? 'var(--text-primary)' : 'var(--text-muted)'}
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

        {/* Linha de leitura (ANO-5): o corte, quantas combinações ele pegou e quanto elas pesam. */}
        <text fill="var(--text-secondary)" fontSize={READING_SIZE} x={0} y={READING_BASELINE}>
          <tspan className="tabular-nums" fill="var(--text-secondary)">
            {readingPrefix}
          </tspan>
          <tspan className="font-bold" fill="var(--text-primary)">
            {AGGREGATE_LABEL_INLINE}
          </tspan>
          <tspan fill="var(--text-secondary)">{', com '}</tspan>
          <tspan className="tabular-nums font-bold" fill="var(--text-primary)">
            {aggregateLabel}
          </tspan>
          <tspan fill="var(--text-secondary)">{'.'}</tspan>
        </text>

        {/* Anotação (ANO-2): o limiar, escrito, porque ele é escolha e não propriedade do dado. */}
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={0} y={NOTE_BASELINE}>
          {`limiar: ${thresholdLabel} por combinação`}
        </text>

        {/* Alternativa tabular: as agregadas, uma a uma, com nome e contagem. */}
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={TEXT_SIZE} x={0} y={FOOTER_NOTE_BASELINE}>
          {`as ${formatInt(rare.length)} combinações agregadas, uma a uma`}
        </text>
        {rareLines.map((line) => (
          <text
            className="tabular-nums"
            fill="var(--text-secondary)"
            fontSize={TEXT_SIZE}
            key={line.key}
            x={(line.column * (VIEW_WIDTH - SIDE_PAD * 2)) / FOOTER_COLUMNS}
            y={FOOTER_NOTE_BASELINE + FOOTER_ROW_STEP * (line.row + 1)}
          >
            {line.text}
          </text>
        ))}
      </svg>
    </figure>
  );
}
