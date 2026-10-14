import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, FIRST_DAY, HOLIDAYS, type SdrActivity } from './data';

/**
 * O mesmo calendário do modelo em tamanho de cartão, repetido seis vezes numa escala só. A pergunta
 * é de rotina: quem registra atividade no começo da semana e quem deixa tudo para a sexta? Seis grades
 * pequenas respondem isso melhor que seis linhas do tempo, porque a semana é justamente o eixo que a
 * série temporal achata.
 *
 * A escala é comum às seis pessoas, calculada sobre o conjunto: grade por grade em escala própria a
 * comparação seria falsa, e cada pessoa pareceria ter a mesma semana cheia.
 *
 * Três estados não são valor, e nenhum deles é zero. Zero medido é traço em `--text-muted`: a pessoa
 * trabalhou e não registrou nada, o que é o caso de todo fim de semana. Férias é célula vazada, porque
 * não havia trabalho a registrar. Feriado é célula pontilhada, pelo mesmo motivo, e ele existe no
 * desenho para que a coluna vazia do dia 13 não se leia como ociosidade de seis pessoas.
 *
 * A faixa mais baixa da rampa não vive só de cor. Dos sete degraus do Farol, só `--seq-5`, `--seq-6` e
 * `--seq-7` medem acima de 3:1 contra o cartão nos dois temas, e a versão precisa de quatro faixas.
 * Então a primeira faixa é `--seq-5` num quadrado menor, dentro da mesma célula: tamanho é a segunda
 * pista, e o contorno ficou reservado para férias e feriado, que já usam esse canal.
 */
export interface SdrMicroGridsProps {
  readonly data?: readonly SdrActivity[];
  readonly height?: number;
  readonly className?: string;
}

const CELL = 10;
const GAP = 2;
const STEP = CELL + GAP;
const SMALL = 6;
const LEFT_W = 28;
const TEXT_W = 96;
const TEXT_GAP = 8;
const BLOCK_GAP = 12;
const PER_ROW = 3;
const LEAD_H = 18;
const LEAD_GAP = 12;
const ROW_GAP = 14;
const LEGEND_GAP = 12;
const LEGEND_H = 16;
const SWATCH = 11;
const ZERO_W = 6;
const ZERO_H = 2;
const BANDS = 4;
const MS_DAY = 86_400_000;
const WEEKDAY_LABELS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'] as const;
const FRIDAY = 4;
const MONDAY = 0;

/** Os três degraus acima de 3:1 nos dois temas. A quarta faixa é o primeiro deles em quadrado menor. */
const BUCKET_COLORS = [
  CHART_SEQUENTIAL_COLORS[4],
  CHART_SEQUENTIAL_COLORS[4],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const NEUTRAL_COLOR = 'var(--text-muted)';

function parse(iso: string): number {
  return Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

/** Segunda é 0, domingo é 6. */
function weekdayOf(time: number): number {
  return (new Date(time).getUTCDay() + 6) % 7;
}

function isoOf(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

/** Soma de lista, `null` quando a lista está vazia: pessoa sem dia medido não soma zero. */
function sumOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

/** Maior valor da lista, `null` quando não há nenhum. É ele que fecha a régua da legenda. */
function maxOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((best, value) => (value > best ? value : best), values[0] ?? 0);
}

/** Parte sobre o todo, `null` sem base: taxa sem denominador medido não existe. */
function shareOf(part: number | null, total: number | null): number | null {
  if (part === null || total === null || total <= 0) return null;
  return part / total;
}

type CellState = 'valor' | 'ferias' | 'feriado';

interface PersonCell {
  readonly day: number;
  readonly column: number;
  readonly row: number;
  readonly state: CellState;
  readonly value: number;
}

interface Person {
  readonly id: string;
  readonly name: string;
  readonly cells: readonly PersonCell[];
  readonly total: number | null;
  readonly friday: number | null;
  readonly monday: number | null;
  readonly fridayShare: number | null;
  readonly mondayShare: number | null;
}

interface Ranked {
  readonly person: Person;
  readonly value: number;
}

/**
 * Geometria de uma pessoa. A coluna 0 é a semana de segunda a domingo que contém o primeiro dia do
 * recorte, e é por isso que agosto de 2026 ocupa seis colunas e não cinco: ele começa num sábado e
 * termina numa segunda, então as semanas que o contêm são seis. Os dias das pontas que caem fora do
 * mês não têm posição no dado e simplesmente não se desenham.
 */
function buildPerson(series: SdrActivity, firstMonday: number): Person {
  const cells = series.counts.map((value, index) => {
    const time = parse(FIRST_DAY) + index * MS_DAY;
    const iso = isoOf(time);
    const state: CellState = HOLIDAYS.includes(iso) ? 'feriado' : series.vacation.includes(iso) ? 'ferias' : 'valor';
    return {
      day: index + 1,
      column: Math.floor((time - firstMonday) / MS_DAY / 7),
      row: weekdayOf(time),
      state,
      value,
    };
  });
  const worked = cells.filter((cell) => cell.state === 'valor');
  const total = sumOf(worked.map((cell) => cell.value));
  const friday = sumOf(worked.filter((cell) => cell.row === FRIDAY).map((cell) => cell.value));
  const monday = sumOf(worked.filter((cell) => cell.row === MONDAY).map((cell) => cell.value));
  return {
    id: series.id,
    name: series.name,
    cells,
    total,
    friday,
    monday,
    fridayShare: shareOf(friday, total),
    mondayShare: shareOf(monday, total),
  };
}

/** Quem lidera por uma medida que pode não existir. Sem ninguém com a medida, devolve `null`. */
function topBy(people: readonly Person[], pick: (person: Person) => number | null): Person | null {
  const ranked: Ranked[] = [];
  for (const person of people) {
    const value = pick(person);
    if (value !== null) ranked.push({ person, value });
  }
  const best = ranked.reduce<Ranked | null>(
    (top, item) => (top === null || item.value > top.value ? item : top),
    null,
  );
  return best === null ? null : best.person;
}

/** Texto de "parte na sexta" ou "parte na segunda", sempre com o volume ao lado da taxa. */
function partText(part: number | null, total: number | null): string {
  return part === null || total === null ? formatUnavailable() : formatRateWithVolume(part, total);
}

function rangeLabel(low: number, high: number): string {
  return low === high ? formatInt(low) : `${formatInt(low)} a ${formatInt(high)}`;
}

export default function SdrMicroGrids({ data = defaultData, height, className }: SdrMicroGridsProps) {
  const firstTime = parse(FIRST_DAY);
  const firstMonday = firstTime - weekdayOf(firstTime) * MS_DAY;
  const people = data.map((series) => buildPerson(series, firstMonday));
  const values = people.flatMap((person) =>
    person.cells.filter((cell) => cell.state === 'valor').map((cell) => cell.value),
  );
  const maxValue = maxOf(values);
  const fridayLeader = topBy(people, (person) => person.fridayShare);
  const mondayLeader = topBy(people, (person) => person.mondayShare);

  if (maxValue === null || fridayLeader === null || mondayLeader === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden size={16} />
        <span>O recorte não tem nenhuma atividade registrada, então não há grade por pessoa a desenhar.</span>
      </div>
    );
  }

  const columns = people.reduce(
    (most, person) => person.cells.reduce((inner, cell) => (cell.column + 1 > inner ? cell.column + 1 : inner), most),
    0,
  );
  const gridW = columns * STEP - GAP;
  const gridH = 7 * STEP - GAP;
  const block = gridW + TEXT_GAP + TEXT_W;
  const blockRows = Math.ceil(people.length / PER_ROW);
  const viewWidth = LEFT_W + PER_ROW * block + (PER_ROW - 1) * BLOCK_GAP;
  const viewHeight = LEAD_H + LEAD_GAP + blockRows * gridH + (blockRows - 1) * ROW_GAP + LEGEND_GAP + LEGEND_H;
  const legendBase = viewHeight - LEGEND_H + 11;
  const blockX = (index: number): number => LEFT_W + (index % PER_ROW) * (block + BLOCK_GAP);
  const blockY = (index: number): number => LEAD_H + LEAD_GAP + Math.floor(index / PER_ROW) * (gridH + ROW_GAP);
  const bandStep = Math.max(1, Math.ceil(maxValue / BANDS));
  const bucketOf = (value: number): number => Math.min(BANDS - 1, Math.ceil(value / bandStep) - 1);
  const bandLabel = (index: number): string =>
    index === BANDS - 1
      ? `${formatInt(bandStep * (BANDS - 1) + 1)} ou mais`
      : rangeLabel(index * bandStep + 1, (index + 1) * bandStep);

  const fridayText = partText(fridayLeader.friday, fridayLeader.total);
  const mondayText = partText(mondayLeader.monday, mondayLeader.total);
  const readOut = `${fridayLeader.name} registra ${fridayText} na sexta, ${mondayLeader.name} ${mondayText} na segunda`;
  const summary =
    `${formatInt(people.length)} grades de calendário com as atividades registradas por dia, na mesma escala. ` +
    `${fridayLeader.name} concentra ${fridayText} na sexta e ${mondayLeader.name} ${mondayText} na segunda. ` +
    `Férias e feriado vão vazados, fora da classe zero.`;

  return (
    <div
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <svg
        aria-hidden
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${String(viewWidth)} ${String(viewHeight)}`}
      >
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={12} x={0} y={13}>
          {readOut}
        </text>

        {people.map((person, index) => (
          <g key={person.id}>
            {index % PER_ROW === 0
              ? WEEKDAY_LABELS.map((label, row) =>
                  row % 2 === 0 ? (
                    <text
                      dominantBaseline="central"
                      fill="var(--text-muted)"
                      fontSize={11}
                      key={label}
                      textAnchor="end"
                      x={LEFT_W - 4}
                      y={blockY(index) + row * STEP + CELL / 2}
                    >
                      {label}
                    </text>
                  ) : null,
                )
              : null}
            {person.cells.map((cell) => {
              const x = blockX(index) + cell.column * STEP;
              const y = blockY(index) + cell.row * STEP;
              const key = `dia-${String(cell.day)}`;
              if (cell.state !== 'valor') {
                return (
                  <rect
                    fill="none"
                    height={CELL}
                    key={key}
                    rx={2}
                    stroke={NEUTRAL_COLOR}
                    strokeDasharray={cell.state === 'feriado' ? '1 2' : undefined}
                    strokeWidth={1}
                    width={CELL}
                    x={x}
                    y={y}
                  />
                );
              }
              if (cell.value === 0) {
                return (
                  <rect
                    fill={NEUTRAL_COLOR}
                    height={ZERO_H}
                    key={key}
                    rx={1}
                    width={ZERO_W}
                    x={x + (CELL - ZERO_W) / 2}
                    y={y + (CELL - ZERO_H) / 2}
                  />
                );
              }
              const bucket = bucketOf(cell.value);
              const size = bucket === 0 ? SMALL : CELL;
              return (
                <rect
                  fill={BUCKET_COLORS[bucket]}
                  height={size}
                  key={key}
                  rx={2}
                  width={size}
                  x={x + (CELL - size) / 2}
                  y={y + (CELL - size) / 2}
                />
              );
            })}
            <text
              fill="var(--text-primary)"
              fontSize={11}
              fontWeight={600}
              x={blockX(index) + gridW + TEXT_GAP}
              y={blockY(index) + 36}
            >
              {person.name}
            </text>
            <text
              className="font-display"
              fill="var(--text-muted)"
              fontSize={11}
              fontWeight={500}
              x={blockX(index) + gridW + TEXT_GAP}
              y={blockY(index) + 52}
            >
              {person.total === null ? formatUnavailable() : `${formatInt(person.total)} atividades`}
            </text>
          </g>
        ))}

        {BUCKET_COLORS.map((color, index) => {
          const size = index === 0 ? SMALL : SWATCH;
          return (
            <g key={`faixa-${String(index)}`}>
              <rect
                fill={color}
                height={size}
                rx={2}
                width={size}
                x={index * 50 + (SWATCH - size) / 2}
                y={legendBase - 9 + (SWATCH - size) / 2}
              />
              <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={index * 50 + 15} y={legendBase}>
                {bandLabel(index)}
              </text>
            </g>
          );
        })}
        <text fill="var(--text-muted)" fontSize={11} x={228} y={legendBase}>
          atividades no dia
        </text>
        <rect fill={NEUTRAL_COLOR} height={ZERO_H} rx={1} width={ZERO_W} x={338} y={legendBase - 5} />
        <text fill="var(--text-muted)" fontSize={11} x={350} y={legendBase}>
          zero medido
        </text>
        <rect fill="none" height={SWATCH} rx={2} stroke={NEUTRAL_COLOR} strokeWidth={1} width={SWATCH} x={430} y={legendBase - 9} />
        <text fill="var(--text-muted)" fontSize={11} x={445} y={legendBase}>
          férias
        </text>
        <rect
          fill="none"
          height={SWATCH}
          rx={2}
          stroke={NEUTRAL_COLOR}
          strokeDasharray="1 2"
          strokeWidth={1}
          width={SWATCH}
          x={496}
          y={legendBase - 9}
        />
        <text fill="var(--text-muted)" fontSize={11} x={511} y={legendBase}>
          feriado
        </text>
      </svg>
    </div>
  );
}
