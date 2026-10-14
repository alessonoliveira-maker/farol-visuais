import { Filter, Unplug } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, seatNoun as defaultNoun, type Chamber, type SeatNoun } from './data';

/**
 * O mesmo hemiciclo nos extremos de tamanho: com poucos lugares vira uma fileira só de pontos
 * grandes, acima de 400 troca a unidade do ponto e avisa por escrito, e sem total informado escreve
 * a ausência no lugar do arco. Serve para decidir se um conjunto cabe na forma antes de usá-la.
 */
export interface ExtremeHemicyclesProps {
  readonly data?: readonly Chamber[];
  /** O que cada lugar conta, no singular e no plural ("conta", "contas"). */
  readonly noun?: SeatNoun;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox é o corpo medido do canvas largo com o caso de uso em uma linha: escala 1 (GEO-18). */
const VIEW_WIDTH = 894;
const VIEW_HEIGHT = 281.5;
/** Três painéis de 282 px com 24 px entre eles fecham os 894 px do corpo. */
const PANEL_WIDTH = 282;
const PANEL_GAP = 24;
const BASELINE_Y = 166;
/** Faixa de tinta dos assentos; o raio de dentro abre o miolo onde o total é escrito. */
const BAND_OUTER = 132;
const BAND_INNER = 50;
/** Vão entre pontos vizinhos, na fileira e entre fileiras (COR-5: pelo menos 1,5 px). */
const SEAT_GAP = 2;
const MAX_ROWS = 12;
/** Abaixo disso o conjunto cabe numa fileira só, com pontos grandes. */
const SINGLE_ROW_BELOW = 10;
/** Acima disso os pontos somem no cartão: o ponto sobe de unidade até o desenho voltar a caber. */
const MAX_SEATS = 400;
const UNIT_STEPS = [1, 10, 100, 1000] as const;
/** Assento sem grupo conhecido: ponto vazado em texto neutro (5,21:1 no escuro, 5,37:1 no claro). */
const NEUTRAL_STROKE = 'var(--text-muted)';
const NEUTRAL_STROKE_WIDTH = 1.5;
const TITLE_Y = 13;
const NOTE_DROP = 20;
const LEGEND_FIRST_DROP = 46;
const LEGEND_ROW = 22;
const LEGEND_SWATCH = 5;
const LEGEND_LABEL_INSET = 18;
const LEGEND_COUNT_INSET = 44;
/** Distância da linha de base ao centro óptico de um texto de 12 px. */
const TEXT_DROP = 4;
const TOTAL_RISE = 20;
const CAPTION_RISE = 5;
const ICON_SIZE = 16;
const ABSENT_ICON_RISE = 74;
const ABSENT_WORD_RISE = 40;
const ABSENT_NOTE_RISE = 24;

interface Seat {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly row: number;
}

interface RowFit {
  readonly radii: readonly number[];
  readonly counts: readonly number[];
  readonly seatRadius: number;
}

interface Layout {
  readonly seats: readonly Seat[];
  readonly seatRadius: number;
  readonly rows: number;
}

/** Distribui `amount` em partes inteiras proporcionais aos pesos, pelo maior resto: a soma é exata. */
function largestRemainder(weights: readonly number[], amount: number): number[] {
  let weightSum = 0;
  for (const weight of weights) weightSum += weight;
  if (weightSum <= 0) return weights.map(() => 0);
  const raw = weights.map((weight) => (weight / weightSum) * amount);
  const parts = raw.map(Math.floor);
  let missing = amount;
  for (const part of parts) missing -= part;
  const byRest = raw.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest);
  for (const { index } of byRest) {
    if (missing <= 0) break;
    parts[index] = (parts[index] ?? 0) + 1;
    missing -= 1;
  }
  return parts;
}

/** Menor distância entre centros vizinhos, medida em toda fileira, com cada assento no meio do próprio gomo. */
function tightestChord(radii: readonly number[], counts: readonly number[]): number {
  let tightest = Number.POSITIVE_INFINITY;
  radii.forEach((radius, row) => {
    const count = counts[row] ?? 0;
    if (count > 0) tightest = Math.min(tightest, 2 * radius * Math.sin(Math.PI / (2 * count)));
  });
  return tightest;
}

/** Encaixa os assentos em `rows` fileiras: assentos proporcionais ao raio e ponto limitado pelo vizinho mais próximo. */
function fitRows(seatCount: number, rows: number): RowFit {
  if (rows === 1) {
    // Fileira única encosta na borda de fora: o raio do centro é a borda menos o ponto, e o ponto é
    // meia corda menos meio vão. As duas contas dependem uma da outra e saem resolvidas juntas.
    const sine = Math.sin(Math.PI / (2 * seatCount));
    const free = (BAND_OUTER * sine - SEAT_GAP / 2) / (1 + sine);
    const seatRadius = Math.min(free, (BAND_OUTER - BAND_INNER) / 2);
    return { radii: [BAND_OUTER - seatRadius], counts: [seatCount], seatRadius };
  }
  // As fileiras enchem a faixa: o passo radial é o diâmetro que cabe mais o vão.
  const pitchRadius = (BAND_OUTER - BAND_INNER - SEAT_GAP * (rows - 1)) / (2 * rows);
  const radii = Array.from({ length: rows }, (_, row) => BAND_INNER + pitchRadius + row * (2 * pitchRadius + SEAT_GAP));
  const counts = largestRemainder(radii, seatCount);
  return { radii, counts, seatRadius: Math.min(pitchRadius, (tightestChord(radii, counts) - SEAT_GAP) / 2) };
}

/**
 * Experimenta de 1 a MAX_ROWS fileiras e fica com a que dá o maior ponto: o número de fileiras é
 * calculado do total, nunca escrito no dado. Devolve os assentos na ordem angular GLOBAL, da
 * esquerda para a direita, que é o que faz cada grupo sair em cunha.
 */
function hemicycle(seatCount: number, centerX: number): Layout {
  if (seatCount <= 0) return { seats: [], seatRadius: 0, rows: 0 };
  const maxRows = seatCount < SINGLE_ROW_BELOW ? 1 : MAX_ROWS;
  let best = fitRows(seatCount, 1);
  for (let rows = 2; rows <= maxRows; rows += 1) {
    const candidate = fitRows(seatCount, rows);
    if (candidate.seatRadius > best.seatRadius) best = candidate;
  }
  const seats = best.radii.flatMap((radius, row) => {
    const count = best.counts[row] ?? 0;
    return Array.from({ length: count }, (_, seat): Seat => {
      const angle = Math.PI - ((seat + 0.5) * Math.PI) / count;
      return { x: centerX + radius * Math.cos(angle), y: BASELINE_Y - radius * Math.sin(angle), angle, row };
    });
  });
  seats.sort((a, b) => b.angle - a.angle || a.row - b.row);
  return { seats, seatRadius: best.seatRadius, rows: best.radii.length };
}

/** Quanto vale um ponto: a menor unidade que traz o conjunto para dentro de MAX_SEATS. */
function seatUnit(total: number): number {
  return UNIT_STEPS.find((step) => total / step <= MAX_SEATS) ?? UNIT_STEPS[UNIT_STEPS.length - 1] ?? 1;
}

interface Drawn {
  readonly total: number;
  readonly unit: number;
  readonly layout: Layout;
  /** Índice do grupo dono de cada assento, na ordem angular. */
  readonly owners: readonly number[];
  readonly percents: readonly number[];
}

interface Panel {
  readonly chamber: Chamber;
  readonly centerX: number;
  /** `null` quando a fonte não informou o total: o painel escreve a ausência, nunca um arco vazio. */
  readonly drawn: Drawn | null;
}

function toPanel(chamber: Chamber, index: number): Panel {
  const centerX = index * (PANEL_WIDTH + PANEL_GAP) + PANEL_WIDTH / 2;
  if (chamber.total === null) return { chamber, centerX, drawn: null };
  const unit = seatUnit(chamber.total);
  // Zero medido é zero: nenhum ponto e o número escrito. Acima de zero, pelo menos um ponto.
  const seatCount = chamber.total > 0 ? Math.max(1, Math.round(chamber.total / unit)) : 0;
  const counts = chamber.groups.map((group) => group.count);
  // Os assentos de cada grupo saem pelo maior resto: com a unidade em 10, a soma continua fechando.
  const owners = largestRemainder(counts, seatCount).flatMap((seats, group) => Array.from({ length: seats }, () => group));
  return {
    chamber,
    centerX,
    drawn: { total: chamber.total, unit, layout: hemicycle(seatCount, centerX), owners, percents: largestRemainder(counts, 100) },
  };
}

export default function ExtremeHemicycles({ data = defaultData, noun = defaultNoun, height, className }: ExtremeHemicyclesProps) {
  const style = height === undefined ? undefined : { height };
  const nounFor = (amount: number): string => (amount === 1 ? noun.singular : noun.plural);

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum conjunto neste recorte: não há lugares para desenhar.</span>
      </div>
    );
  }

  const panels = data.map(toPanel);
  const summary = [
    `Hemiciclos de ${formatInt(panels.length)} conjuntos de ${noun.plural}.`,
    ...panels.map(({ chamber, drawn }) =>
      drawn === null
        ? `${chamber.label}: total ${formatUnavailable()}.`
        : `${chamber.label}: ${formatInt(drawn.total)} ${nounFor(drawn.total)} em ${formatInt(drawn.layout.rows)} ${drawn.layout.rows === 1 ? 'fileira' : 'fileiras'}, cada ponto vale ${formatInt(drawn.unit)} ${nounFor(drawn.unit)}.`,
    ),
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <svg aria-hidden className="block h-full w-full" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        {panels.map(({ chamber, centerX, drawn }) => {
          const left = centerX - BAND_OUTER;
          const right = centerX + BAND_OUTER;
          return (
            <g key={chamber.id}>
              <text fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={left} y={TITLE_Y}>
                {chamber.label}
              </text>
              {drawn === null ? (
                <g>
                  <Unplug aria-hidden color="var(--text-muted)" size={ICON_SIZE} x={centerX - ICON_SIZE / 2} y={BASELINE_Y - ABSENT_ICON_RISE} />
                  <text fill="var(--text-muted)" fontSize={12} textAnchor="middle" x={centerX} y={BASELINE_Y - ABSENT_WORD_RISE}>
                    {formatUnavailable()}
                  </text>
                  <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={centerX} y={BASELINE_Y - ABSENT_NOTE_RISE}>
                    {`total de ${noun.plural} não informado`}
                  </text>
                </g>
              ) : (
                <g>
                  {drawn.layout.seats.map((seat, seatIndex) => {
                    const group = chamber.groups[drawn.owners[seatIndex] ?? -1];
                    const key = `seat-${String(seatIndex)}`;
                    if (!group) {
                      const r = drawn.layout.seatRadius - NEUTRAL_STROKE_WIDTH / 2;
                      return <circle cx={seat.x} cy={seat.y} fill="none" key={key} r={r} stroke={NEUTRAL_STROKE} strokeWidth={NEUTRAL_STROKE_WIDTH} />;
                    }
                    const fill = CHART_SERIES_COLORS[group.slot - 1] ?? 'var(--chart-1)';
                    return <circle cx={seat.x} cy={seat.y} fill={fill} key={key} r={drawn.layout.seatRadius} />;
                  })}
                  <text className="font-display" fill="var(--text-primary)" fontSize={14} fontWeight={600} textAnchor="middle" x={centerX} y={BASELINE_Y - TOTAL_RISE}>
                    {formatInt(drawn.total)}
                  </text>
                  <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={centerX} y={BASELINE_Y - CAPTION_RISE}>
                    {nounFor(drawn.total)}
                  </text>
                  {/* O aviso de unidade ganha peso e cor de texto principal quando o ponto deixa de valer um. */}
                  <text
                    fill={drawn.unit === 1 ? 'var(--text-muted)' : 'var(--text-primary)'}
                    fontSize={11}
                    fontWeight={drawn.unit === 1 ? 400 : 600}
                    textAnchor="middle"
                    x={centerX}
                    y={BASELINE_Y + NOTE_DROP}
                  >
                    <tspan>{'cada ponto vale '}</tspan>
                    <tspan className="font-display">{formatInt(drawn.unit)}</tspan>
                    <tspan>{` ${nounFor(drawn.unit)}`}</tspan>
                  </text>
                  {chamber.groups.map((group, groupIndex) => {
                    const y = BASELINE_Y + LEGEND_FIRST_DROP + groupIndex * LEGEND_ROW;
                    return (
                      <g key={group.id}>
                        <circle cx={left + LEGEND_SWATCH} cy={y} fill={CHART_SERIES_COLORS[group.slot - 1] ?? 'var(--chart-1)'} r={LEGEND_SWATCH} />
                        <text fill="var(--text-secondary)" fontSize={12} x={left + LEGEND_LABEL_INSET} y={y + TEXT_DROP}>
                          {group.label}
                        </text>
                        <text className="font-display" fill="var(--text-primary)" fontSize={14} fontWeight={600} textAnchor="end" x={right - LEGEND_COUNT_INSET} y={y + TEXT_DROP + 1}>
                          {formatInt(group.count)}
                        </text>
                        <text className="font-display" fill="var(--text-muted)" fontSize={12} textAnchor="end" x={right} y={y + TEXT_DROP}>
                          {formatPercent((drawn.percents[groupIndex] ?? 0) / 100, 0)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
