import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, totalCaption as defaultCaption, type SegmentGroup } from './data';

/**
 * Hemiciclo da carteira: cada ponto é uma conta, em fileiras concêntricas de um semicírculo, e os
 * segmentos entram pela ordem angular de todos os assentos, da esquerda para a direita. Responde
 * quem ocupa quanto de um conjunto com número fixo de lugares, com o total no centro da base.
 */
export interface PortfolioHemicycleProps {
  readonly data?: readonly SegmentGroup[];
  /** O que o total conta, escrito sob o número do centro e nas frases ("contas na carteira"). */
  readonly caption?: string;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox é o corpo medido do canvas card com o caso de uso em uma linha: escala 1 (GEO-18). */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 241.5;
const CENTER_X = 160;
const BASELINE_Y = 228;
/** Faixa de tinta dos assentos; o raio de dentro abre o miolo onde o total é escrito. */
const BAND_OUTER = 158;
const BAND_INNER = 60;
/** Vão entre pontos vizinhos, na fileira e entre fileiras (COR-5: pelo menos 1,5 px). */
const SEAT_GAP = 2;
const MAX_ROWS = 12;
/** Abaixo disso o conjunto cabe numa fileira só, com pontos grandes. */
const SINGLE_ROW_BELOW = 10;
/** Ausência: ponto vazado com contorno em texto neutro (5,21:1 no escuro, 5,37:1 no claro). */
const NEUTRAL_STROKE = 'var(--text-muted)';
const NEUTRAL_STROKE_WIDTH = 1.5;
/** Slots na ordem da COR-8 para o segmento que não traz o seu: 2 e 4 por último. */
const SLOT_ORDER = [1, 3, 6, 5, 2, 4] as const;
const READING_Y = 14;
const LEGEND_X = 340;
const LEGEND_LABEL_X = 358;
const LEGEND_COUNT_X = 532;
const LEGEND_PERCENT_X = 572;
const LEGEND_ROW = 24;
const LEGEND_LAST_Y = 220;
const LEGEND_SWATCH = 5;
const LEGEND_NOTE_RISE = 20;
/** Distância da linha de base ao centro óptico de um texto de 12 px. */
const TEXT_DROP = 4;
const TOTAL_RISE = 20;
const CAPTION_RISE = 5;

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

/** Encaixa o total em `rows` fileiras: assentos proporcionais ao raio e ponto limitado pelo vizinho mais próximo. */
function fitRows(total: number, rows: number): RowFit {
  if (rows === 1) {
    // Fileira única encosta na borda de fora: o raio do centro é a borda menos o ponto, e o ponto é
    // meia corda menos meio vão. As duas contas dependem uma da outra e saem resolvidas juntas.
    const sine = Math.sin(Math.PI / (2 * total));
    const free = (BAND_OUTER * sine - SEAT_GAP / 2) / (1 + sine);
    const seatRadius = Math.min(free, (BAND_OUTER - BAND_INNER) / 2);
    return { radii: [BAND_OUTER - seatRadius], counts: [total], seatRadius };
  }
  // As fileiras enchem a faixa: o passo radial é o diâmetro que cabe mais o vão.
  const pitchRadius = (BAND_OUTER - BAND_INNER - SEAT_GAP * (rows - 1)) / (2 * rows);
  const radii = Array.from({ length: rows }, (_, row) => BAND_INNER + pitchRadius + row * (2 * pitchRadius + SEAT_GAP));
  // Assentos por fileira proporcionais ao raio: o passo ao longo do arco sai quase igual em todas.
  const counts = largestRemainder(radii, total);
  return { radii, counts, seatRadius: Math.min(pitchRadius, (tightestChord(radii, counts) - SEAT_GAP) / 2) };
}

/**
 * Experimenta de 1 a MAX_ROWS fileiras e fica com a que dá o maior ponto, de modo que o número de
 * fileiras nasce do total. Devolve os assentos na ordem angular GLOBAL, da esquerda para a direita:
 * é ela que faz cada grupo sair em cunha, e não em faixa por fileira.
 */
function hemicycle(total: number): { seats: Seat[]; seatRadius: number; rows: number } {
  const maxRows = total < SINGLE_ROW_BELOW ? 1 : MAX_ROWS;
  let best = fitRows(total, 1);
  for (let rows = 2; rows <= maxRows; rows += 1) {
    const candidate = fitRows(total, rows);
    if (candidate.seatRadius > best.seatRadius) best = candidate;
  }
  const seats = best.radii.flatMap((radius, row) => {
    const count = best.counts[row] ?? 0;
    return Array.from({ length: count }, (_, seat): Seat => {
      const angle = Math.PI - ((seat + 0.5) * Math.PI) / count;
      return { x: CENTER_X + radius * Math.cos(angle), y: BASELINE_Y - radius * Math.sin(angle), angle, row };
    });
  });
  seats.sort((a, b) => b.angle - a.angle || a.row - b.row);
  return { seats, seatRadius: best.seatRadius, rows: best.radii.length };
}

function slotColor(group: SegmentGroup, fallbackIndex: number): string {
  // Sem slot, vale a ordem de ENTRADA do dado, nunca a do ranking: trocar a carteira não troca a cor.
  const slot = group.slot ?? SLOT_ORDER[Math.min(fallbackIndex, SLOT_ORDER.length - 1)] ?? 1;
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** Soma das contagens. Lista vazia não tem total: devolve `null`, nunca zero (EST-1b). */
function sumCounts(groups: readonly SegmentGroup[]): number | null {
  if (groups.length === 0) return null;
  return groups.reduce((sum, group) => sum + group.count, 0);
}

/** O rótulo do dado nasce com maiúscula; no meio da frase ele entra em minúscula. */
function inSentence(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1);
}

export default function PortfolioHemicycle({ data = defaultData, caption = defaultCaption, height, className }: PortfolioHemicycleProps) {
  // Ordem do arco e da legenda: do maior para o menor, com a ausência sempre por último.
  const groups = [...data].sort((a, b) => Number(a.neutral ?? false) - Number(b.neutral ?? false) || b.count - a.count);
  const total = sumCounts(groups);
  const style = height === undefined ? undefined : { height };

  if (total === null || total <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma conta neste recorte: o hemiciclo não tem lugares para dividir.</span>
      </div>
    );
  }

  const { seats, seatRadius } = hemicycle(total);
  const owners = groups.flatMap((group, index) => Array.from({ length: group.count }, () => index));
  const colors = groups.map((group) => (group.neutral ? null : slotColor(group, data.indexOf(group))));
  const percents = largestRemainder(groups.map((group) => group.count), 100);
  const leader = groups.find((group) => !group.neutral) ?? groups[0];
  const leaderPercent = leader ? percents[groups.indexOf(leader)] : undefined;
  const missing = groups.find((group) => group.neutral && group.count > 0 && group !== leader);
  const others = groups.filter((group) => group !== leader);
  const firstLegendY = LEGEND_LAST_Y - (groups.length - 1) * LEGEND_ROW;

  const summary = [
    `Hemiciclo de ${formatInt(total)} ${caption}, um ponto por conta.`,
    leader && leaderPercent !== undefined
      ? `${leader.label} lidera com ${formatInt(leader.count)}, ${formatPercent(leaderPercent / 100, 0)} do total.`
      : '',
    others.length > 0 ? `Depois: ${others.map((group) => `${inSentence(group.label)} ${formatInt(group.count)}`).join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <svg aria-hidden className="block h-full w-full" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        {leader ? (
          <text fill="var(--text-secondary)" fontSize={12} x={0} y={READING_Y}>
            <tspan fill="var(--text-primary)" fontWeight={600}>{`${leader.label} `}</tspan>
            <tspan>{'concentra '}</tspan>
            <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>{`${formatInt(leader.count)} `}</tspan>
            <tspan>{'de '}</tspan>
            <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>{`${formatInt(total)} `}</tspan>
            <tspan>{caption}</tspan>
            {missing ? (
              <>
                <tspan>{'; '}</tspan>
                <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>{`${formatInt(missing.count)} `}</tspan>
                <tspan>{`${missing.count === 1 ? 'segue' : 'seguem'} ${inSentence(missing.label)}`}</tspan>
              </>
            ) : null}
            <tspan>.</tspan>
          </text>
        ) : null}

        {seats.map((seat, index) => {
          const color = colors[owners[index] ?? 0] ?? null;
          const key = `seat-${String(index)}`;
          if (color === null) {
            const r = seatRadius - NEUTRAL_STROKE_WIDTH / 2;
            return <circle cx={seat.x} cy={seat.y} fill="none" key={key} r={r} stroke={NEUTRAL_STROKE} strokeWidth={NEUTRAL_STROKE_WIDTH} />;
          }
          return <circle cx={seat.x} cy={seat.y} fill={color} key={key} r={seatRadius} />;
        })}

        <text className="font-display" fill="var(--text-primary)" fontSize={14} fontWeight={600} textAnchor="middle" x={CENTER_X} y={BASELINE_Y - TOTAL_RISE}>
          {formatInt(total)}
        </text>
        <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={CENTER_X} y={BASELINE_Y - CAPTION_RISE}>
          {caption}
        </text>

        <text fill="var(--text-muted)" fontSize={11} x={LEGEND_X} y={firstLegendY - LEGEND_NOTE_RISE}>
          cada ponto é uma conta
        </text>
        {groups.map((group, index) => {
          const y = firstLegendY + index * LEGEND_ROW;
          const color = colors[index] ?? null;
          return (
            <g key={group.id}>
              {color === null ? (
                <circle
                  cx={LEGEND_X + LEGEND_SWATCH}
                  cy={y}
                  fill="none"
                  r={LEGEND_SWATCH - NEUTRAL_STROKE_WIDTH / 2}
                  stroke={NEUTRAL_STROKE}
                  strokeWidth={NEUTRAL_STROKE_WIDTH}
                />
              ) : (
                <circle cx={LEGEND_X + LEGEND_SWATCH} cy={y} fill={color} r={LEGEND_SWATCH} />
              )}
              <text fill={group.neutral ? 'var(--text-muted)' : 'var(--text-secondary)'} fontSize={12} x={LEGEND_LABEL_X} y={y + TEXT_DROP}>
                {group.label}
              </text>
              <text className="font-display" fill="var(--text-primary)" fontSize={14} fontWeight={600} textAnchor="end" x={LEGEND_COUNT_X} y={y + TEXT_DROP + 1}>
                {formatInt(group.count)}
              </text>
              <text className="font-display" fill="var(--text-muted)" fontSize={12} textAnchor="end" x={LEGEND_PERCENT_X} y={y + TEXT_DROP}>
                {formatPercent((percents[index] ?? 0) / 100, 0)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
