import { Filter } from 'lucide-react';

import { formatDays, formatInt, formatMonthShort, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, FIRST_DAY, LAST_DAY, type OpportunityMoves } from './data';

/**
 * Lasagna densa: 200 linhas por 120 colunas, cor pelos dias parados, e dias seguidos na mesma
 * faixa fundidos num retângulo só. A grade nominal tem 24 mil células; o que vai para o SVG são
 * alguns milhares de trechos, porque uma oportunidade que ficou três semanas parada é um trecho, e
 * não 21 células iguais lado a lado.
 *
 * A cor mede dias sem movimento, reiniciando a cada movimento, em cinco faixas com o teto escrito
 * na legenda. Os tetos são régua de operação, não corte linear sobre o máximo: em contagem diária
 * a rampa linear joga quase tudo no primeiro degrau e a peça deixa de separar nada.
 *
 * A oportunidade criada no meio do recorte não tem célula antes da data de criação, e a fronteira
 * entre o que não existia e o que está apenas andando é desenhada, porque o degrau mais claro da
 * rampa não alcança 3:1 contra o cartão em tema nenhum: sem a fronteira, faixa clara e vazio se
 * leriam igual. O primeiro degrau também sai mais fino que os outros, para a diferença não morar
 * só na cor.
 */
export interface StalledOpportunitiesLasagnaProps {
  readonly data?: readonly OpportunityMoves[];
  readonly height?: number;
  readonly className?: string;
}

/** Corpo medido do canvas 640 x 720 na moldura `card`: 574 x 601,5 px, com o caso de uso em uma linha. */
const VIEW_W = 574;
const VIEW_H = 601;
const LEFT_W = 30;
const RIGHT_PAD = 14;
const TOP_H = 16;
const TICK_BASELINE = 13;
const PLOT_H = 506;
const LABEL_EVERY = 25;
const LEGEND_ONE = 550;
const LEGEND_TWO = 568;
const LEGEND_THREE = 586;
const SWATCH_W = 14;
const SWATCH_H = 10;
const SWATCH_GAP = 6;
const SLOT_ONE = 110;
const LOW_BAND_SCALE = 0.46;
const STUCK_DAYS = 30;
const MS_DAY = 86_400_000;

/**
 * As cinco faixas de dias parados, com o teto de cada uma em dias.
 *
 * A cor sai da rampa sequencial escrita por extenso, `var(--seq-3)` a `var(--seq-7)`, e nunca por
 * índice de `CHART_SEQUENTIAL_COLORS`: a posição `i` daquele array vale `--seq-(i+1)`, então
 * indexar pelo grau lido numa tabela de contraste pinta um degrau abaixo do que se mediu.
 *
 * Medidos contra `--surface-raised`, os cinco degraus dão 2,29 / 3,38 / 4,89 / 6,96 / 10,12 no tema
 * escuro e 1,92 / 2,60 / 3,72 / 5,45 / 8,29 no claro. Os dois primeiros não alcançam o piso de 3:1
 * da WCAG 1.4.11, e é por isso que a ordem não mora só na cor: quem a carrega é a posição fixa na
 * legenda, o teto escrito de cada degrau, a fronteira de criação desenhada e a espessura menor do
 * primeiro degrau.
 */
const STALL_BANDS = [
  { limit: 2, color: 'var(--seq-3)' },
  { limit: 7, color: 'var(--seq-4)' },
  { limit: 14, color: 'var(--seq-5)' },
  { limit: 29, color: 'var(--seq-6)' },
  { limit: Number.POSITIVE_INFINITY, color: 'var(--seq-7)' },
] as const;

function bandOf(stalledDays: number): number {
  for (let index = 0; index < STALL_BANDS.length; index += 1) {
    const band = STALL_BANDS[index];
    if (band !== undefined && stalledDays <= band.limit) return index;
  }
  return STALL_BANDS.length - 1;
}

/** O rótulo de cada degrau, com o teto escrito em dias: é o texto que ordena, não o degrau de cor. */
function bandLabel(index: number): string {
  const band = STALL_BANDS[index];
  const previous = STALL_BANDS[index - 1];
  if (band === undefined) return formatUnavailable();
  if (previous === undefined) return `até ${formatDays(band.limit)}`;
  if (!Number.isFinite(band.limit)) return `mais de ${formatDays(previous.limit)}`;
  return `${formatInt(previous.limit + 1)} a ${formatDays(band.limit)}`;
}

function parse(iso: string): number {
  return Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

/** O mês de um instante em `YYYY-MM`, para o rótulo de tempo sair por `formatMonthShort`. */
function monthKey(time: number): string {
  const date = new Date(time);
  return `${String(date.getUTCFullYear())}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Parte de um total, e `null` quando não há total: taxa sem base é ausência, não zero por cento. */
function shareOf(part: number, total: number): number | null {
  if (total <= 0) return null;
  return part / total;
}

interface Run {
  readonly band: number;
  readonly from: number;
  readonly length: number;
}

interface OpportunityLane {
  readonly id: string;
  /** Primeiro dia da janela em que a oportunidade já existia. */
  readonly firstDay: number;
  readonly runs: readonly Run[];
  /** Dias parados no último dia da janela. */
  readonly stalledToday: number;
  readonly bornInside: boolean;
}

/** Trechos de dias seguidos na mesma faixa, que é o que faz 24 mil células virarem poucos milhares. */
function laneOf(row: OpportunityMoves, days: number, windowStart: number): OpportunityLane {
  const created = Math.round((parse(row.created) - windowStart) / MS_DAY);
  const firstDay = Math.max(created, 0);
  const moveDays = new Set<number>();
  // Referência inicial: o último movimento anterior à janela; sem ele, a criação.
  let reference = created;
  for (const iso of row.moves) {
    const index = Math.round((parse(iso) - windowStart) / MS_DAY);
    if (index < 0) reference = Math.max(reference, index);
    else if (index < days) moveDays.add(index);
  }

  const runs: Run[] = [];
  let current = -1;
  let from = firstDay;
  for (let day = firstDay; day < days; day += 1) {
    if (moveDays.has(day)) reference = day;
    const band = bandOf(day - reference);
    if (band !== current) {
      if (current >= 0) runs.push({ band: current, from, length: day - from });
      current = band;
      from = day;
    }
  }
  if (current >= 0) runs.push({ band: current, from, length: days - from });

  return {
    id: row.id,
    firstDay,
    runs,
    stalledToday: days - 1 - reference,
    bornInside: created > 0,
  };
}

export default function StalledOpportunitiesLasagna({
  data = defaultData,
  height,
  className,
}: StalledOpportunitiesLasagnaProps) {
  const windowStart = parse(FIRST_DAY);
  const days = Math.round((parse(LAST_DAY) - windowStart) / MS_DAY) + 1;

  /** Ordem pela data de criação: é ela que transforma a fronteira do vazio numa escada legível. */
  const lanes: readonly OpportunityLane[] = [...data]
    .sort((a, b) => parse(a.created) - parse(b.created))
    .map((row) => laneOf(row, days, windowStart));

  const stuck = lanes.filter((lane) => lane.stalledToday >= STUCK_DAYS).length;
  const bornInside = lanes.filter((lane) => lane.bornInside).length;
  let painted = 0;
  let lowest = 0;
  for (const lane of lanes) {
    for (const run of lane.runs) {
      painted += run.length;
      if (run.band === 0) lowest += run.length;
    }
  }
  const lowestShare = shareOf(lowest, painted);

  const summary =
    lowestShare === null
      ? `Lasagna de ${formatInt(lanes.length)} oportunidades abertas sem nenhum dia medido no recorte: os dias parados de cada uma ficam ${formatUnavailable()}.`
      : `Lasagna de ${formatInt(lanes.length)} oportunidades abertas em ${formatInt(days)} dias, ordenadas pela criação. ` +
        `${formatInt(stuck)} estão paradas há ${formatDays(STUCK_DAYS)} ou mais e ${formatInt(bornInside)} nasceram dentro do recorte, sem célula antes. ` +
        `${formatPercent(lowestShare, 0)} dos dias caem no primeiro degrau, ${bandLabel(0)}.`;

  if (lanes.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden height={16} width={16} />
        <span>O recorte não tem oportunidade aberta, então não há dia parado a contar.</span>
      </div>
    );
  }

  const dayWidth = (VIEW_W - LEFT_W - RIGHT_PAD) / days;
  const rowHeight = PLOT_H / lanes.length;
  const plotBottom = TOP_H + PLOT_H;
  const todayX = LEFT_W + days * dayWidth;

  /** Rótulo de tempo só na virada de mês: 120 colunas de 4 px não cabem 120 rótulos. */
  const monthTicks = Array.from({ length: days }, (_, index) => index).filter((index) => {
    if (index === 0) return true;
    return new Date(windowStart + index * MS_DAY).getUTCDate() === 1;
  });

  /** A escada que separa o que ainda não existia do que está apenas andando. */
  let frontier = '';
  lanes.forEach((lane, index) => {
    const x = LEFT_W + lane.firstDay * dayWidth;
    const y = TOP_H + index * rowHeight;
    frontier += `${index === 0 ? 'M' : ' L'} ${String(x)} ${String(y)} L ${String(x)} ${String(y + rowHeight)}`;
  });

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 h-full w-full min-w-0', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
        {monthTicks.map((index) => (
          <text
            className="tabular-nums"
            fill="var(--text-muted)"
            fontSize={11}
            key={index}
            textAnchor="start"
            x={LEFT_W + index * dayWidth + 2}
            y={TICK_BASELINE}
          >
            {formatMonthShort(monthKey(windowStart + index * MS_DAY))}
          </text>
        ))}

        {lanes.map((lane, index) => {
          const y = TOP_H + index * rowHeight;
          return (
            <g key={lane.id}>
              {lane.runs.map((run) => {
                const low = run.band === 0;
                const bandHeight = low ? rowHeight * LOW_BAND_SCALE : rowHeight;
                return (
                  <rect
                    fill={STALL_BANDS[run.band]?.color}
                    height={bandHeight}
                    key={run.from}
                    width={run.length * dayWidth}
                    x={LEFT_W + run.from * dayWidth}
                    y={y + (rowHeight - bandHeight) / 2}
                  />
                );
              })}
            </g>
          );
        })}

        {lanes.map((lane, index) =>
          (index + 1) % LABEL_EVERY === 0 ? (
            <text
              className="tabular-nums"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              key={`ordem-${lane.id}`}
              textAnchor="end"
              x={LEFT_W - 4}
              y={TOP_H + index * rowHeight + rowHeight / 2}
            >
              {formatInt(index + 1)}
            </text>
          ) : null,
        )}

        {monthTicks.map((index) => (
          <line
            key={`virada-${String(index)}`}
            stroke="var(--surface-raised)"
            strokeWidth={1.5}
            x1={LEFT_W + index * dayWidth}
            x2={LEFT_W + index * dayWidth}
            y1={TOP_H}
            y2={plotBottom}
          />
        ))}

        <path d={frontier} fill="none" stroke="var(--text-muted)" strokeWidth={1} />

        <line stroke="var(--line-strong)" strokeWidth={1.5} x1={todayX} x2={todayX} y1={TOP_H} y2={plotBottom} />
        <text
          className="tabular-nums"
          fill="var(--text-muted)"
          fontSize={11}
          textAnchor="end"
          x={todayX}
          y={TICK_BASELINE}
        >
          hoje
        </text>

        {STALL_BANDS.map((band, index) => (
          <g key={band.limit}>
            <rect
              fill={band.color}
              height={SWATCH_H}
              rx={2}
              width={SWATCH_W}
              x={index * SLOT_ONE}
              y={LEGEND_ONE - 8}
            />
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

        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={LEGEND_TWO}>
          vazio: ainda não existia
        </text>
        <line stroke="var(--line-strong)" strokeWidth={1.5} x1={168} x2={168} y1={LEGEND_TWO - 9} y2={LEGEND_TWO + 1} />
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={180} y={LEGEND_TWO}>
          linha à direita: hoje
        </text>
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={320} y={LEGEND_TWO}>
          {`${formatInt(stuck)} paradas há ${formatDays(STUCK_DAYS)} ou mais`}
        </text>

        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={0} y={LEGEND_THREE}>
          à esquerda, a posição na ordem de criação
        </text>
        <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={250} y={LEGEND_THREE}>
          tetos por régua de operação, não por corte no máximo
        </text>
      </svg>
    </figure>
  );
}
