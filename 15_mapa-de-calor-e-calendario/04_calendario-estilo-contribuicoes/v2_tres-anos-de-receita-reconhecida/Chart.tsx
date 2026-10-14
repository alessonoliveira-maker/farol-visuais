import { Filter } from 'lucide-react';

import { CHART_SEQUENTIAL_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type YearRecognizedRevenue } from './data';

/**
 * Três anos de receita reconhecida por dia, um calendário por ano, empilhados na mesma escala.
 * A pergunta é de repetição: a concentração de dezembro é padrão da casa ou foi um ano isolado? Um
 * calendário por ano em escala própria responderia errado, porque cada ano ficaria com o próprio
 * dezembro escuro; por isso o domínio da rampa é calculado sobre os três anos juntos, e a comparação
 * entre faixas passa a ser leitura direta de cor.
 *
 * Três decisões sustentam a peça, e as três são de honestidade do dado.
 *
 * Zero é medido: fim de semana e feriado não reconhecem receita, e a célula fica no poço, fora da
 * rampa. Falha de carga é outra coisa: são os dias em que a extração não rodou, e eles vão hachurados
 * porque pintá-los de zero afirmaria que nada foi reconhecido, o que ninguém sabe.
 *
 * A rampa tem quatro degraus e o mais claro não alcança 3:1 contra o cartão em nenhum dos dois temas
 * (mede 3,38:1 no escuro e 2,60:1 no claro). Então ele não vive só de cor: leva contorno de 1 px em
 * `--text-muted`, que mede 5,21:1 e 5,37:1, e a célula existe na tela mesmo quando o preenchimento
 * dela quase não se distingue do cartão.
 *
 * Os cortes da rampa são os quartis dos dias com valor, e a legenda escreve o teto de cada degrau,
 * porque cor por quartil não é cor linear e quem lê precisa saber disso.
 *
 * O total de cada ano e o total de dezembro vão escritos ao lado da faixa. A rampa ordena, o número
 * decide: quem quer saber quanto dezembro pesa lê o valor, não o tom.
 */
export interface ThreeYearCalendarProps {
  readonly data?: readonly YearRecognizedRevenue[];
  readonly height?: number;
  readonly className?: string;
}

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT_W = 30;
const RIGHT_W = 104;
const RIGHT_GAP = 12;
const HEAD_H = 16;
const BAND_H = 7 * STEP - GAP;
const BAND_GAP = 14;
const LEGEND_GAP = 12;
const LEGEND_H = 16;
const SWATCH = 11;
const MS_DAY = 86_400_000;

/** Rampa de quatro degraus. O primeiro é o que não alcança 3:1 e por isso leva contorno. */
const BUCKET_COLORS = [
  CHART_SEQUENTIAL_COLORS[3],
  CHART_SEQUENTIAL_COLORS[4],
  CHART_SEQUENTIAL_COLORS[5],
  CHART_SEQUENTIAL_COLORS[6],
] as const;
const ZERO_COLOR = 'var(--surface-sunken)';
const OUTLINE_COLOR = 'var(--text-muted)';
const WEEKDAY_LABELS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'] as const;
const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;

function parse(iso: string): number {
  return Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

/** Segunda é 0, domingo é 6, como no resto do Farol. */
function weekdayOf(time: number): number {
  return (new Date(time).getUTCDay() + 6) % 7;
}

/** Soma de lista, `null` quando não há nenhum valor conhecido: ausência não é zero. */
function sumOf(values: readonly (number | null)[]): number | null {
  const known = values.filter((value): value is number => value !== null);
  if (known.length === 0) return null;
  return known.reduce((sum, value) => sum + value, 0);
}

/** Maior valor da lista, `null` quando não há nenhum. É ele que fecha a régua da legenda. */
function maxOf(values: readonly (number | null)[]): number | null {
  const known = values.filter((value): value is number => value !== null);
  if (known.length === 0) return null;
  return known.reduce((best, value) => (value > best ? value : best), known[0] ?? 0);
}

/**
 * Quantil da lista, `null` quando ela está vazia. Quartil é agregação, então nunca devolve 0.
 *
 * Os cortes da rampa são os quartis dos dias com valor, e não quatro fatias iguais do máximo, porque
 * a distribuição é torta: o maior dia do triênio vale quase quatro vezes o dia comum, e em faixas
 * lineares 90% dos dias caíam no primeiro degrau. O desenho ficava liso e justamente dezembro, que é
 * a pergunta da peça, sumia. Com o corte por quartil cada degrau leva um quarto dos dias com valor, e
 * a legenda escreve o teto de cada um, que é o que impede a leitura de achar que a cor é linear.
 */
function quantileOf(values: readonly number[], fraction: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((one, other) => one - other);
  const index = Math.min(sorted.length - 1, Math.floor(fraction * sorted.length));
  return sorted[index] ?? null;
}

/** Parte sobre o todo, `null` sem base medida: taxa sem denominador não existe. */
function shareOf(part: number | null, total: number | null): number | null {
  if (part === null || total === null || total <= 0) return null;
  return part / total;
}

/** Meia calha antes da coluna: a borda do mês cai no vão, nunca em cima da célula. */
function edgeX(column: number): number {
  return LEFT_W + column * STEP - GAP / 2;
}

/**
 * Borda em degrau na posição de um dia, no traçado do calendário do D3: desce pela coluna seguinte
 * até o dia da semana em que o mês vira, dobra para a esquerda e desce o resto. Linha aberta, e não
 * contorno fechado, porque fechar a região traria uma diagonal cruzando a grade.
 */
function stepPath(bandY: number, column: number, row: number): string {
  const top = bandY - GAP / 2;
  const bottom = bandY + 7 * STEP - GAP / 2;
  const turn = bandY + row * STEP - GAP / 2;
  if (row === 0) return `M${String(edgeX(column))},${String(top)}V${String(bottom)}`;
  return (
    `M${String(edgeX(column + 1))},${String(top)}V${String(turn)}` +
    `H${String(edgeX(column))}V${String(bottom)}`
  );
}

interface BandCell {
  readonly column: number;
  readonly row: number;
  readonly month: number;
  readonly value: number | null;
}

interface Band {
  readonly label: string;
  readonly monthKey: string;
  readonly columns: number;
  readonly cells: readonly BandCell[];
  readonly edges: readonly BandCell[];
  readonly total: number | null;
  readonly december: number | null;
  readonly share: number | null;
}

/** Geometria de um ano: posição de cada dia, virada de cada mês e os dois agregados escritos. */
function buildBand(series: YearRecognizedRevenue): Band {
  const start = parse(series.firstDay);
  const offset = weekdayOf(start);
  const cells = series.values.map((value, index) => {
    const position = index + offset;
    return {
      column: Math.floor(position / 7),
      row: position % 7,
      month: new Date(start + index * MS_DAY).getUTCMonth(),
      value,
    };
  });
  const edges = MONTH_LABELS.map((_, month) => cells.find((cell) => cell.month === month)).filter(
    (cell): cell is BandCell => cell !== undefined,
  );
  const year = series.firstDay.slice(0, 4);
  const total = sumOf(series.values);
  const december = sumOf(cells.filter((cell) => cell.month === 11).map((cell) => cell.value));
  return {
    label: year,
    monthKey: `${year}-12`,
    columns: cells.reduce((most, cell) => (cell.column + 1 > most ? cell.column + 1 : most), 0),
    cells,
    edges,
    total,
    december,
    share: shareOf(december, total),
  };
}

function monthName(month: number): string {
  return MONTH_LABELS[month] ?? '';
}

/**
 * Hachura de falha de carga desenhada à mão, três diagonais dentro da própria célula. Não é padrão
 * de preenchimento por dois motivos: `pattern` vive em `defs`, que não é pintado, e o serializador do
 * preview copia cor do estilo computado, então a cor do padrão sairia sem resolver.
 */
function hatchPath(x: number, y: number): string {
  const half = CELL / 2;
  return (
    `M${String(x)},${String(y + CELL)}L${String(x + CELL)},${String(y)}` +
    `M${String(x)},${String(y + half)}L${String(x + half)},${String(y)}` +
    `M${String(x + half)},${String(y + CELL)}L${String(x + CELL)},${String(y + half)}`
  );
}

export default function ThreeYearCalendar({ data = defaultData, height, className }: ThreeYearCalendarProps) {
  const bands = data.map(buildBand);
  const values = data.flatMap((series) => series.values);
  const maxValue = maxOf(values);
  const positives = values.filter((value): value is number => value !== null && value > 0);
  const firstCut = quantileOf(positives, 0.25);
  const secondCut = quantileOf(positives, 0.5);
  const thirdCut = quantileOf(positives, 0.75);
  const gaps = values.filter((value) => value === null).length;
  const last = bands[bands.length - 1];

  if (maxValue === null || last === undefined || firstCut === null || secondCut === null || thirdCut === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden size={16} />
        <span>O recorte não tem nenhum dia de receita reconhecida, então não há calendário a desenhar.</span>
      </div>
    );
  }

  const first = bands[0] ?? last;
  const columns = bands.reduce((most, band) => (band.columns > most ? band.columns : most), 0);
  const viewWidth = LEFT_W + columns * STEP - GAP + RIGHT_GAP + RIGHT_W;
  const viewHeight = HEAD_H + bands.length * (BAND_H + BAND_GAP) - BAND_GAP + LEGEND_GAP + LEGEND_H;
  const rightX = viewWidth - RIGHT_W;
  const legendBase = viewHeight - LEGEND_H + 11;
  const bandTop = (index: number): number => HEAD_H + index * (BAND_H + BAND_GAP);
  const cuts = [firstCut, secondCut, thirdCut, maxValue] as const;
  const bucketOf = (value: number): number =>
    value <= firstCut ? 0 : value <= secondCut ? 1 : value <= thirdCut ? 2 : 3;

  const summary =
    last.total === null || last.december === null
      ? 'Calendário de três anos sem nenhum dia de receita reconhecida.'
      : `Calendário de ${formatInt(bands.length)} anos de receita reconhecida por dia, na mesma escala. ` +
        `Em ${last.label} a casa reconhece ${formatCurrencyCompact(last.total)}, e ${formatMonthShort(last.monthKey)} sozinho leva ${formatCurrencyCompact(last.december)}. ` +
        `${formatInt(gaps)} dias de falha de carga vão hachurados, distintos de dia com zero.`;

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
        {first.edges.map((edge) => (
          <text
            fill="var(--text-muted)"
            fontSize={11}
            key={`mes-${String(edge.month)}`}
            textAnchor="start"
            x={LEFT_W + edge.column * STEP}
            y={HEAD_H - 5}
          >
            {monthName(edge.month)}
          </text>
        ))}
        <text fill="var(--text-muted)" fontSize={11} textAnchor="start" x={rightX} y={HEAD_H - 5}>
          receita no ano
        </text>

        {bands.map((band, index) => (
          <g key={band.label}>
            {WEEKDAY_LABELS.map((label, row) =>
              row % 2 === 0 ? (
                <text
                  dominantBaseline="central"
                  fill="var(--text-muted)"
                  fontSize={11}
                  key={label}
                  textAnchor="end"
                  x={LEFT_W - 8}
                  y={bandTop(index) + row * STEP + CELL / 2}
                >
                  {label}
                </text>
              ) : null,
            )}
            {band.cells.map((cell, day) => {
              const x = LEFT_W + cell.column * STEP;
              const y = bandTop(index) + cell.row * STEP;
              if (cell.value === null) {
                return (
                  <g key={`dia-${String(day)}`}>
                    <rect fill="none" height={CELL} rx={2} stroke={OUTLINE_COLOR} strokeWidth={1} width={CELL} x={x} y={y} />
                    <path d={hatchPath(x, y)} fill="none" stroke={OUTLINE_COLOR} strokeWidth={0.75} />
                  </g>
                );
              }
              const bucket = cell.value <= 0 ? -1 : bucketOf(cell.value);
              return (
                <rect
                  fill={bucket < 0 ? ZERO_COLOR : BUCKET_COLORS[bucket]}
                  height={CELL}
                  key={`dia-${String(day)}`}
                  rx={2}
                  stroke={bucket === 0 ? OUTLINE_COLOR : 'none'}
                  strokeWidth={1}
                  width={CELL}
                  x={x}
                  y={y}
                />
              );
            })}
            {band.edges.map((edge) => (
              <path
                d={stepPath(bandTop(index), edge.column, edge.row)}
                fill="none"
                key={`borda-${String(edge.month)}`}
                stroke="var(--line-strong)"
                strokeWidth={1}
              />
            ))}
            <text
              className="font-display"
              fill="var(--text-primary)"
              fontSize={11}
              fontWeight={600}
              x={rightX}
              y={bandTop(index) + 30}
            >
              {band.label}
            </text>
            <text
              className="font-display"
              fill="var(--text-primary)"
              fontSize={11}
              fontWeight={600}
              x={rightX}
              y={bandTop(index) + 44}
            >
              {band.total === null ? formatUnavailable() : formatCurrencyCompact(band.total)}
            </text>
            <text className="font-display" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={rightX} y={bandTop(index) + 58}>
              {`${formatMonthShort(band.monthKey)}: ${band.december === null ? formatUnavailable() : formatCurrencyCompact(band.december)}`}
            </text>
            <text className="font-display" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={rightX} y={bandTop(index) + 72}>
              {band.share === null ? formatUnavailable() : `${formatPercent(band.share)} do ano`}
            </text>
          </g>
        ))}

        <text className="font-display" fill="var(--text-muted)" fontSize={11} x={0} y={legendBase}>
          {formatCurrencyCompact(0)}
        </text>
        {BUCKET_COLORS.map((color, index) => (
          <g key={color}>
            <rect
              fill={color}
              height={SWATCH}
              rx={2}
              stroke={index === 0 ? OUTLINE_COLOR : 'none'}
              strokeWidth={1}
              width={SWATCH}
              x={28 + index * 85}
              y={legendBase - 9}
            />
            <text className="font-display" fill="var(--text-muted)" fontSize={11} x={43 + index * 85} y={legendBase}>
              {formatCurrencyCompact(cuts[index] ?? maxValue)}
            </text>
          </g>
        ))}
        <text fill="var(--text-muted)" fontSize={11} x={380} y={legendBase}>
          receita reconhecida no dia, por quartil
        </text>
        <rect fill={ZERO_COLOR} height={SWATCH} rx={2} width={SWATCH} x={624} y={legendBase - 9} />
        <text fill="var(--text-muted)" fontSize={11} x={639} y={legendBase}>
          nada reconhecido
        </text>
        <rect fill="none" height={SWATCH} rx={2} stroke={OUTLINE_COLOR} strokeWidth={1} width={SWATCH} x={750} y={legendBase - 9} />
        <path d={hatchPath(750, legendBase - 9)} fill="none" stroke={OUTLINE_COLOR} strokeWidth={0.75} />
        <text fill="var(--text-muted)" fontSize={11} x={765} y={legendBase}>
          falha de carga
        </text>
      </svg>
    </div>
  );
}
