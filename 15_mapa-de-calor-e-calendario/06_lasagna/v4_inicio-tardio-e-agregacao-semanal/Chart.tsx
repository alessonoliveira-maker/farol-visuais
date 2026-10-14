import { Filter } from 'lucide-react';
import { useId } from 'react';

import { formatDecimal, formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, DAYS_PER_WEEK, FIRST_DAY, type SdrDays } from './data';

/**
 * Lasagna com início tardio e passo de tempo escolhido por prop: a mesma peça desenha 182 colunas
 * de um dia ou 26 colunas de uma semana, e num cartão é a segunda que se lê.
 *
 * Três ausências diferentes convivem na grade, e a versão existe para separá-las no desenho, não só
 * na prosa. Antes da admissão não há célula nenhuma, porque o SDR não existia e nada foi medido.
 * Depois da admissão, dia sem registro sai hachurado, o que é ausência de instrumento. E zero
 * medido é zero: tem marca desenhada, num neutro fora da rampa, e o número escrito por dentro.
 *
 * A semana da admissão é calculada só sobre os dias em que o SDR já existia, e a agregação divide
 * pelos dias com registro, nunca por sete: dividir por sete faria a primeira semana de quem entrou
 * numa quarta parecer fraca por aritmética, e faria toda semana parecer fraca por causa do fim de
 * semana, que é dia sem registro em todas elas.
 */
export interface LateStartLasagnaProps {
  readonly data?: readonly SdrDays[];
  /** Passo do eixo de tempo. `semana` agrega os dias; `dia` desenha uma coluna por dia. */
  readonly granularity?: 'dia' | 'semana';
  readonly height?: number;
  readonly className?: string;
}

/** Corpo medido do canvas `card` na moldura `card`: 574 x 241,5 px, com o caso de uso em uma linha. */
const VIEW_W = 574;
const VIEW_H = 241;
const LEFT_W = 92;
const TOP_H = 16;
const TICK_BASELINE = 13;
const CELL_H = 20;
const GAP_Y = 2;
const LEGEND_ONE = 186;
const LEGEND_TWO = 204;
const LEGEND_THREE = 222;
const SWATCH_W = 14;
const SWATCH_H = 10;
const SWATCH_GAP = 6;
const SLOT_ONE = 140;
const HATCH_SIZE = 4;
const HATCH_STROKE = 1.5;
const START_MARK_W = 2;
/** A marca do primeiro dia avança o vão da linha, para se ver contra o cartão e não só contra a célula. */
const START_MARK_BLEED = 2;
const ZERO_LABEL_MIN_W = 14;
const SLOT_TWO_B = 140;
const NOTE_X = 270;
const SCALE_NOTE_X = 320;
/**
 * Distância mínima entre dois rótulos de mês, em px.
 *
 * `mar/26` mede cerca de 39 px em 11 px de Manrope, e a janela começa numa segunda-feira de março
 * cuja semana seguinte já é abril: sem este piso os dois rótulos se sobrepõem em 18 px, e dois
 * textos encostados deixam de ser dois.
 */
const MIN_TICK_GAP = 48;
const MS_DAY = 86_400_000;

/**
 * Os três degraus de volume, com o teto em reuniões por dia, mais o neutro do zero medido.
 *
 * São três e não cinco porque a célula não comporta número em toda posição: da rampa sequencial do
 * Farol só `--seq-5`, `--seq-6` e `--seq-7` passam de 3:1 contra o cartão nos dois temas, medidos em
 * 4,89 / 6,96 / 10,12 no escuro e 3,72 / 5,45 / 8,29 no claro. Com quatro degraus a peça afirmaria
 * uma ordem que a cor não sustenta. O zero medido não entra na rampa: ele vai num neutro,
 * `--text-muted`, que mede 5,21:1 e 5,37:1, e leva o número escrito por dentro.
 */
const VOLUME_BANDS = [
  { limit: 1.5, color: 'var(--seq-5)' },
  { limit: 3, color: 'var(--seq-6)' },
  { limit: Number.POSITIVE_INFINITY, color: 'var(--seq-7)' },
] as const;

const ZERO_COLOR = 'var(--text-muted)';

function bandOf(perDay: number): number {
  for (let index = 0; index < VOLUME_BANDS.length; index += 1) {
    const band = VOLUME_BANDS[index];
    if (band !== undefined && perDay <= band.limit) return index;
  }
  return VOLUME_BANDS.length - 1;
}

/** O rótulo de cada degrau, com o teto escrito: é o texto que ordena, e a cor é apoio de varredura. */
function bandLabel(index: number): string {
  const band = VOLUME_BANDS[index];
  const previous = VOLUME_BANDS[index - 1];
  if (band === undefined) return formatUnavailable();
  if (previous === undefined) return `até ${formatDecimal(band.limit, 1)} por dia`;
  if (!Number.isFinite(band.limit)) return `mais de ${formatDecimal(previous.limit, 1)} por dia`;
  return `${formatDecimal(previous.limit, 1)} a ${formatDecimal(band.limit, 1)} por dia`;
}

function parse(iso: string): number {
  return Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

/** O mês de um instante em `YYYY-MM`, para o rótulo de tempo sair por `formatMonthShort`. */
function monthKey(time: number): string {
  const date = new Date(time);
  return `${String(date.getUTCFullYear())}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Média por dia com registro, e `null` quando não houve nenhum: nunca zero.
 *
 * Zero é um valor medido nesta grade, com marca e número próprios, então devolver zero para a lista
 * vazia faria a semana sem registro nenhum aparecer como uma semana de trabalho sem reunião.
 */
function meanOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  let total = 0;
  for (const value of values) total += value;
  return total / values.length;
}

interface Column {
  readonly index: number;
  /** `null` é coluna sem nenhum dia com registro; a coluna antes da admissão não é gerada. */
  readonly perDay: number | null;
  readonly isFirst: boolean;
}

interface SdrLane {
  readonly id: string;
  readonly name: string;
  readonly columns: readonly Column[];
  readonly lateStart: boolean;
}

export default function LateStartLasagna({
  data = defaultData,
  granularity = 'semana',
  height,
  className,
}: LateStartLasagnaProps) {
  const hatchId = `${useId().replace(/:/g, '')}-dia-sem-registro`;
  const days = data.reduce((longest, row) => Math.max(longest, row.meetings.length), 0);
  const step = granularity === 'semana' ? DAYS_PER_WEEK : 1;
  const columnCount = Math.ceil(days / step);
  const windowStart = parse(FIRST_DAY);

  /** Ordem pela data de admissão: é ela que torna o início tardio um degrau legível na grade. */
  const lanes: readonly SdrLane[] = [...data]
    .sort((a, b) => parse(a.admission) - parse(b.admission))
    .map((row) => {
      const admissionDay = Math.round((parse(row.admission) - windowStart) / MS_DAY);
      const firstColumn = Math.floor(Math.max(admissionDay, 0) / step);
      const columns: Column[] = [];
      for (let column = firstColumn; column < columnCount; column += 1) {
        /** Só os dias em que o SDR já existia entram na conta da coluna, inclusive na da admissão. */
        const slice: number[] = [];
        for (let offset = 0; offset < step; offset += 1) {
          const day = column * step + offset;
          if (day >= days || day < admissionDay) continue;
          const value = row.meetings[day];
          if (value !== null && value !== undefined) slice.push(value);
        }
        columns.push({ index: column, perDay: meanOf(slice), isFirst: column === firstColumn });
      }
      return { id: row.id, name: row.name, columns, lateStart: admissionDay > 0 };
    });

  const lateStarts = lanes.filter((lane) => lane.lateStart).length;
  const unrecorded = lanes.reduce(
    (total, lane) => total + lane.columns.filter((column) => column.perDay === null).length,
    0,
  );
  const measuredZero = lanes.reduce(
    (total, lane) => total + lane.columns.filter((column) => column.perDay === 0).length,
    0,
  );

  const scaleNote =
    granularity === 'semana'
      ? `${formatInt(days)} dias em ${formatInt(columnCount)} semanas, média por dia`
      : `${formatInt(days)} dias, um por coluna`;

  const summary =
    lanes.length === 0
      ? `Lasagna de início tardio sem nenhum SDR no recorte: a média por dia de cada um fica ${formatUnavailable()}.`
      : `Mapa de reuniões por dia de ${formatInt(lanes.length)} SDRs, agregado em ${formatInt(columnCount)} colunas de ${formatInt(days)} dias. ` +
        `${formatInt(lateStarts)} entraram no meio da janela e não têm célula antes da admissão. ` +
        `${formatInt(unrecorded)} colunas ficaram sem registro e ${formatInt(measuredZero)} marcam zero medido.`;

  if (lanes.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden height={16} width={16} />
        <span>O recorte não tem SDR nenhum, então não há agenda a agregar.</span>
      </div>
    );
  }

  const columnWidth = (VIEW_W - LEFT_W) / columnCount;

  /** Rótulo de tempo só na virada de mês, e nunca dois a menos de `MIN_TICK_GAP` um do outro. */
  const monthTicks: number[] = [];
  for (let index = 0; index < columnCount; index += 1) {
    const current = new Date(windowStart + index * step * MS_DAY).getUTCMonth();
    const previous = new Date(windowStart + (index - 1) * step * MS_DAY).getUTCMonth();
    if (index !== 0 && current === previous) continue;
    const last = monthTicks[monthTicks.length - 1];
    if (last !== undefined && (index - last) * columnWidth < MIN_TICK_GAP) continue;
    monthTicks.push(index);
  }

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        <defs>
          <pattern height={HATCH_SIZE} id={hatchId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={HATCH_SIZE}>
            <rect fill="var(--surface-raised)" height={HATCH_SIZE} width={HATCH_SIZE} x={0} y={0} />
            <line stroke="var(--text-muted)" strokeWidth={HATCH_STROKE} x1={0} x2={0} y1={0} y2={HATCH_SIZE} />
          </pattern>
        </defs>

        {monthTicks.map((index) => (
          <text
            className="tabular-nums"
            fill="var(--text-muted)"
            fontSize={11}
            key={index}
            textAnchor="start"
            x={LEFT_W + index * columnWidth + 2}
            y={TICK_BASELINE}
          >
            {formatMonthShort(monthKey(windowStart + index * step * MS_DAY))}
          </text>
        ))}

        {lanes.map((lane, rowIndex) => {
          const y = TOP_H + rowIndex * (CELL_H + GAP_Y);
          return (
            <g key={lane.id}>
              <text
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize={11}
                textAnchor="end"
                x={LEFT_W - 8}
                y={y + CELL_H / 2}
              >
                {lane.name}
              </text>
              {lane.columns.map((column) => {
                const x = LEFT_W + column.index * columnWidth;
                const fill =
                  column.perDay === null
                    ? `url(#${hatchId})`
                    : column.perDay === 0
                      ? ZERO_COLOR
                      : VOLUME_BANDS[bandOf(column.perDay)]?.color;
                return (
                  <g key={column.index}>
                    <rect fill={fill} height={CELL_H} width={columnWidth - 1} x={x} y={y} />
                    {column.perDay === 0 && columnWidth > ZERO_LABEL_MIN_W ? (
                      <text
                        className="font-display tabular-nums"
                        dominantBaseline="central"
                        fill="var(--surface-raised)"
                        fontSize={11}
                        textAnchor="middle"
                        x={x + (columnWidth - 1) / 2}
                        y={y + CELL_H / 2}
                      >
                        {formatInt(column.perDay)}
                      </text>
                    ) : null}
                    {column.isFirst ? (
                      <rect
                        fill="var(--text-muted)"
                        height={CELL_H + START_MARK_BLEED * 2}
                        width={START_MARK_W}
                        x={x}
                        y={y - START_MARK_BLEED}
                      />
                    ) : null}
                  </g>
                );
              })}
            </g>
          );
        })}

        {VOLUME_BANDS.map((band, index) => (
          <g key={band.limit}>
            <rect fill={band.color} height={SWATCH_H} rx={2} width={SWATCH_W} x={index * SLOT_ONE} y={LEGEND_ONE - 8} />
            <text
              className="tabular-nums"
              fill="var(--text-muted)"
              fontSize={11}
              x={index * SLOT_ONE + SWATCH_W + SWATCH_GAP}
              y={LEGEND_ONE}
            >
              {bandLabel(index)}
            </text>
          </g>
        ))}
        <rect fill={ZERO_COLOR} height={SWATCH_H} rx={2} width={SWATCH_W} x={SLOT_ONE * 3} y={LEGEND_ONE - 8} />
        <text
          className="tabular-nums"
          fill="var(--text-muted)"
          fontSize={11}
          x={SLOT_ONE * 3 + SWATCH_W + SWATCH_GAP}
          y={LEGEND_ONE}
        >
          zero medido
        </text>

        <rect fill={`url(#${hatchId})`} height={SWATCH_H} rx={2} width={SWATCH_W} x={0} y={LEGEND_TWO - 8} />
        <text fill="var(--text-muted)" fontSize={11} x={SWATCH_W + SWATCH_GAP} y={LEGEND_TWO}>
          sem registro
        </text>
        <rect fill="var(--text-muted)" height={SWATCH_H} width={START_MARK_W} x={SLOT_TWO_B} y={LEGEND_TWO - 8} />
        <text fill="var(--text-muted)" fontSize={11} x={SLOT_TWO_B + 20} y={LEGEND_TWO}>
          primeiro dia
        </text>
        <text fill="var(--text-muted)" fontSize={11} x={NOTE_X} y={LEGEND_TWO}>
          linhas pela ordem de admissão
        </text>

        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={LEGEND_THREE}>
          vazio é antes de existir, hachura é sem registro, 0 é zero
        </text>
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={SCALE_NOTE_X} y={LEGEND_THREE}>
          {scaleNote}
        </text>
      </svg>
    </figure>
  );
}
