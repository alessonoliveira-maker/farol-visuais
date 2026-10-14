import { Filter } from 'lucide-react';

import { formatInt, formatMonthShort, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  axes,
  axisOrder as defaultAxisOrder,
  colorAxis,
  colorCategory,
  data as defaultData,
  period,
  stackOrder,
  successCategory,
  unitPlural,
  type AxisId,
  type ParallelAxis,
  type ParallelCategory,
  type ParallelCombo,
} from './data';

/**
 * Parallel sets em QUATRO eixos, o teto do modelo, com a ausência de dado como categoria visível.
 *
 * A ORDEM DOS EIXOS É A TESE. Em parallel sets só eixos VIZINHOS se comparam direto, então telefone
 * fica colado em desfecho: é ali que a pergunta mora. Cargo entra entre origem e telefone, onde
 * mostra que as duas lacunas de cadastro andam juntas. Trocar a ordem não muda o dado, muda a
 * comparação que o desenho oferece, e por isso ela é dado do `data.ts`, não capricho de layout.
 *
 * A AUSÊNCIA NÃO É BURACO NEM ZERO. "Sem telefone" e "Cargo ausente" são segmentos como os outros,
 * com contagem escrita, desenhados VAZADOS com contorno `--text-muted` e sempre no fim do eixo. O
 * segundo canal da ACE-2 é a forma vazada mais a palavra, nunca a cor sozinha.
 *
 * A COR VEM DO EIXO DE TELEFONE, não da primeira dimensão: `--chart-1` para quem tem telefone e o
 * neutro da 17.2, `--line-strong`, para quem não tem. Assim a fita carrega a comparação do começo
 * ao fim, e a espessura dela no eixo de desfecho é a resposta.
 *
 * Cada combinação é uma fita CONTÍNUA de espessura constante, porque dentro de cada categoria as
 * combinações se empilham sempre pela mesma ordem: o que entra numa categoria sai dela inteiro, e
 * nada se perde entre um eixo e o seguinte.
 *
 * ESSA ORDEM DE EMPILHAMENTO É DECLARADA NO DADO (`stackOrder`) e não é a ordem dos eixos. Ela põe
 * telefone na frente, então em todos os quatro eixos os leads com telefone ficam por cima e os sem
 * telefone por baixo, e o diagrama se lê em duas bandas. Empilhando pela ordem dos eixos, as fitas
 * se cruzavam exatamente no vão entre telefone e desfecho, que é onde a pergunta mora.
 */
export interface CoverageParallelSetsProps {
  readonly data?: readonly ParallelCombo[];
  /** Ordem inicial de leitura dos eixos. Reordenar por clique é trabalho do Farol. */
  readonly axisOrder?: readonly AxisId[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas declarado por número no `meta.json` (960 x 560) e `viewBox` igual ao CORPO medido dessa
 * moldura, 894 x 441,5 px, para a escala do SVG sair 1: texto declarado em 11 px é 11 px na tela.
 */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 441.5;
const READING_BASELINE = 13;
const LEGEND_BASELINE = 32;
const AXIS_NAME_BASELINE = 52;
const AXIS_TOP = 66;
const AXIS_BOTTOM_PAD = 8;
const SIDE_PAD = 2;
const BLOCK_WIDTH = 96;
/** Raia de rótulo acima de cada segmento: nome numa linha, contagem na seguinte, as duas em 11 px. */
const LANE = 32;
const LANE_NAME_DY = 20;
const LANE_COUNT_DY = 6;
const LEGEND_SWATCH_WIDTH = 14;
const LEGEND_SWATCH_HEIGHT = 8;
const LEGEND_TEXT_GAP = 20;
const LEGEND_STEP = 168;
const TEXT_SIZE = 11;
const READING_SIZE = 12;

const WITH_DATA_FILL = 'var(--chart-1)';
/** O neutro da marca não destacada da 17.2, aqui no papel de "lead sem telefone". */
const MISSING_FILL = 'var(--line-strong)';
const BLOCK_FILL = 'var(--text-muted)';
const BLOCK_STROKE = 'var(--surface-raised)';
/** Contorno do segmento de ausência: vazado, sem preenchimento, em 5,2:1 no escuro e 5,4:1 no claro. */
const ABSENCE_STROKE = 'var(--text-muted)';
const ABSENCE_STROKE_WIDTH = 1.5;

function categoryOf(combo: ParallelCombo, axis: AxisId): string {
  if (axis === 'origem') return combo.origem;
  if (axis === 'cargo') return combo.cargo;
  if (axis === 'telefone') return combo.telefone;
  return combo.desfecho;
}

/**
 * Ordem lexicográfica pelos índices de categoria, seguindo a ordem de EMPILHAMENTO declarada no
 * dado, não a ordem de leitura dos eixos. É a mesma ordem em todos os eixos, e é isso que deixa
 * cada combinação virar uma fita contínua de espessura constante de ponta a ponta.
 */
function compareCombos(a: ParallelCombo, b: ParallelCombo, byAxis: ReadonlyMap<AxisId, ParallelAxis>): number {
  for (const axisId of stackOrder) {
    const axis = byAxis.get(axisId);
    if (axis === undefined) continue;
    const indexA = axis.categories.findIndex((category) => category.id === categoryOf(a, axisId));
    const indexB = axis.categories.findIndex((category) => category.id === categoryOf(b, axisId));
    if (indexA !== indexB) return indexA - indexB;
  }
  return 0;
}

/**
 * Região fechada entre dois eixos: borda de cima, descida vertical, borda de baixo e fecha. Traço
 * grosso não serve aqui, porque a espessura da fita É o dado e traço não tem borda para medir.
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
  readonly hasData: boolean;
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
  // Eixo com menos categorias gasta menos raia e é CENTRADO no vão do eixo mais alto, para os
  // quatro eixos ocuparem a mesma extensão vertical e nenhum parecer maior do que é.
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
  readonly hasData: boolean;
}

export default function CoverageParallelSets({
  data = defaultData,
  axisOrder = defaultAxisOrder,
  height,
  className,
}: CoverageParallelSetsProps) {
  const grandTotal = data.reduce((sum, row) => sum + row.count, 0);

  if (data.length === 0 || grandTotal <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há cobertura de cadastro nem desfecho para cruzar.</span>
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

  const byAxis = new Map(axes.map((axis) => [axis.id, axis]));
  const items: readonly ComboItem[] = [...data]
    .sort((a, b) => compareCombos(a, b, byAxis))
    .map((combo, index) => ({ combo, index, hasData: combo.telefone === colorCategory }));

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
        hasData: item.hasData,
      });
    }
  }

  // Somas com semente, nunca ramo de vazio: a base de cada taxa vai escrita junto pela
  // formatRateWithVolume, que devolve o rótulo de indisponível quando a base é zero.
  const withPhoneTotal = data.reduce((sum, row) => (row.telefone === colorCategory ? sum + row.count : sum), 0);
  const withPhoneOk = data.reduce(
    (sum, row) => (row.telefone === colorCategory && row.desfecho === successCategory ? sum + row.count : sum),
    0,
  );
  const withoutPhoneTotal = data.reduce((sum, row) => (row.telefone === colorCategory ? sum : sum + row.count), 0);
  const withoutPhoneOk = data.reduce(
    (sum, row) => (row.telefone !== colorCategory && row.desfecho === successCategory ? sum + row.count : sum),
    0,
  );

  const rateWithPhone = formatRateWithVolume(withPhoneOk, withPhoneTotal);
  const rateWithoutPhone = formatRateWithVolume(withoutPhoneOk, withoutPhoneTotal);
  const readingPrefix = `Nos ${formatInt(grandTotal)} ${unitPlural} de ${formatMonthShort(period)}, com telefone a qualificação é `;
  const summary = `Parallel sets de ${formatInt(grandTotal)} ${unitPlural} de marketing em ${formatMonthShort(period)}, com origem, cargo, telefone e desfecho nos eixos e a ausência como categoria vazada. Com telefone a qualificação é ${rateWithPhone}; sem telefone, ${rateWithoutPhone}.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        {/* Sem telefone primeiro: a fita acesa fica por cima e o olho segue a comparação. */}
        {ribbons
          .filter((ribbon) => !ribbon.hasData)
          .map((ribbon) => (
            <path d={ribbon.d} fill={MISSING_FILL} key={ribbon.key} />
          ))}
        {ribbons
          .filter((ribbon) => ribbon.hasData)
          .map((ribbon) => (
            <path d={ribbon.d} fill={WITH_DATA_FILL} key={ribbon.key} />
          ))}

        {columns.map((column) =>
          column.slices.map((slice) =>
            slice.category.absence === true ? (
              <rect
                fill="none"
                height={Math.max(slice.height - ABSENCE_STROKE_WIDTH, 0)}
                key={`block-${column.axis.id}-${slice.category.id}`}
                stroke={ABSENCE_STROKE}
                strokeWidth={ABSENCE_STROKE_WIDTH}
                width={BLOCK_WIDTH - ABSENCE_STROKE_WIDTH}
                x={column.x + ABSENCE_STROKE_WIDTH / 2}
                y={slice.top + ABSENCE_STROKE_WIDTH / 2}
              />
            ) : (
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
            ),
          ),
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
            const isColorAxis = column.axis.id === colorAxis;
            return (
              <text
                className={cn('tabular-nums', isColorAxis && 'font-semibold')}
                fill={isColorAxis ? 'var(--text-primary)' : 'var(--text-muted)'}
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

        {/* Linha de leitura (ANO-5): a comparação que a ordem dos eixos tornou possível. */}
        <text fill="var(--text-secondary)" fontSize={READING_SIZE} x={0} y={READING_BASELINE}>
          <tspan className="tabular-nums" fill="var(--text-secondary)">
            {readingPrefix}
          </tspan>
          <tspan className="tabular-nums font-bold" fill="var(--text-primary)">
            {rateWithPhone}
          </tspan>
          <tspan fill="var(--text-secondary)">{'; sem telefone, '}</tspan>
          <tspan className="tabular-nums font-bold" fill="var(--text-primary)">
            {rateWithoutPhone}
          </tspan>
          <tspan fill="var(--text-secondary)">{'.'}</tspan>
        </text>

        {/* Legenda de três entradas (ROT-4), a última com a amostra vazada da categoria de ausência. */}
        <rect fill={WITH_DATA_FILL} height={LEGEND_SWATCH_HEIGHT} rx={1} width={LEGEND_SWATCH_WIDTH} x={0} y={LEGEND_BASELINE - LEGEND_SWATCH_HEIGHT} />
        <text fill="var(--text-secondary)" fontSize={TEXT_SIZE} x={LEGEND_TEXT_GAP} y={LEGEND_BASELINE}>
          lead com telefone
        </text>
        <rect
          fill={MISSING_FILL}
          height={LEGEND_SWATCH_HEIGHT}
          rx={1}
          width={LEGEND_SWATCH_WIDTH}
          x={LEGEND_STEP}
          y={LEGEND_BASELINE - LEGEND_SWATCH_HEIGHT}
        />
        <text fill="var(--text-secondary)" fontSize={TEXT_SIZE} x={LEGEND_STEP + LEGEND_TEXT_GAP} y={LEGEND_BASELINE}>
          lead sem telefone
        </text>
        <rect
          fill="none"
          height={LEGEND_SWATCH_HEIGHT - ABSENCE_STROKE_WIDTH}
          stroke={ABSENCE_STROKE}
          strokeWidth={ABSENCE_STROKE_WIDTH}
          width={LEGEND_SWATCH_WIDTH - ABSENCE_STROKE_WIDTH}
          x={LEGEND_STEP * 2 + ABSENCE_STROKE_WIDTH / 2}
          y={LEGEND_BASELINE - LEGEND_SWATCH_HEIGHT + ABSENCE_STROKE_WIDTH / 2}
        />
        <text fill="var(--text-secondary)" fontSize={TEXT_SIZE} x={LEGEND_STEP * 2 + LEGEND_TEXT_GAP} y={LEGEND_BASELINE}>
          categoria de ausência de cadastro
        </text>
      </svg>
    </figure>
  );
}
