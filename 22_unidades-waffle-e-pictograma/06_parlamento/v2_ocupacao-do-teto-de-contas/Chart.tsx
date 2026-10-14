import { Filter } from 'lucide-react';
import { useState, type MouseEvent, type ReactElement } from 'react';

import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, occupiedCaption as defaultCaption, type CeilingGroup, type SeatStatus } from './data';

/**
 * Hemiciclo do teto da carteira: cada ponto é um lugar, e os lugares livres entram no desenho como
 * parte do conjunto. Responde quantos lugares estão ocupados, quantos deles pedem atenção e quanto
 * sobra até o teto, com a forma do ponto (cheio, com contorno, vazado) dizendo o papel sem a cor.
 */
export interface CeilingHemicycleProps {
  readonly data?: readonly CeilingGroup[];
  /** O que o número do centro conta, escrito sob ele ("lugares ocupados"). */
  readonly caption?: string;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox é o corpo medido do canvas card com o caso de uso em duas linhas: escala 1 (GEO-18). */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 225;
const CENTER_X = 226;
const BASELINE_Y = 215;
/** Faixa de tinta dos assentos; o raio de dentro abre o miolo onde o total é escrito. */
const BAND_OUTER = 184;
const BAND_INNER = 70;
/** Vão entre pontos vizinhos, na fileira e entre fileiras (COR-5: pelo menos 1,5 px). */
const SEAT_GAP = 2;
const MAX_ROWS = 12;
/** Abaixo disso o conjunto cabe numa fileira só, com pontos grandes. */
const SINGLE_ROW_BELOW = 10;
const ACTIVE_COLOR = 'var(--chart-1)';
const RISK_COLOR = 'var(--warning)';
/** Lugar livre: contorno em texto neutro (5,21:1 no escuro, 5,37:1 no claro), visível nos dois temas. */
const FREE_COLOR = 'var(--text-muted)';
const FREE_STROKE_WIDTH = 1.5;
/** Em risco: anel de contorno e miolo, separados por um vão na cor do cartão. */
const RISK_RING_RATIO = 0.22;
const RISK_RING_MIN = 1.5;
const RISK_CORE_RATIO = 0.45;
/** Afastamento radial do rótulo: reserva a altura da caixa do texto contra a borda curva (GEO-19). */
const LABEL_GAP = 18;
const LABEL_MARKER = 5;
const LABEL_TEXT_GAP = 6;
/** Passo mínimo entre dois rótulos do mesmo lado, para nunca dividirem a linha (ROT-9). */
const LABEL_STEP = 18;
/** Distância da linha de base ao centro óptico de um texto de 12 px. */
const TEXT_DROP = 4;
const TOTAL_RISE = 22;
const CAPTION_RISE = 6;
const TOOLTIP_OFFSET = 12;
const STATUS_ORDER: Record<SeatStatus, number> = { active: 0, risk: 1, free: 2 };
const SHAPE_WORD: Record<SeatStatus, string> = { active: 'cheio', risk: 'com contorno', free: 'vazado' };

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

interface Hover {
  readonly id: string;
  readonly left: number;
  readonly top: number;
  readonly flipX: boolean;
  readonly flipY: boolean;
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
 * fileiras nasce do teto. Devolve os assentos na ordem angular GLOBAL, da esquerda para a direita:
 * é ela que faz cada grupo sair em cunha, e não em faixa por fileira.
 */
function hemicycle(total: number): { seats: Seat[]; seatRadius: number } {
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
  return { seats, seatRadius: best.seatRadius };
}

/** Lugares do teto e, deles, os ocupados. Lista vazia não tem teto: devolve `null`, nunca zero (EST-1b). */
function tally(groups: readonly CeilingGroup[]): { ceiling: number; occupied: number } | null {
  if (groups.length === 0) return null;
  let ceiling = 0;
  let occupied = 0;
  for (const group of groups) {
    ceiling += group.count;
    if (group.status !== 'free') occupied += group.count;
  }
  return { ceiling, occupied };
}

/** Conta ocupa lugar; a folga se conta em lugares. O substantivo acompanha o número (NUM-6). */
function nounFor(group: CeilingGroup): string {
  if (group.status === 'free') return group.count === 1 ? 'lugar' : 'lugares';
  return group.count === 1 ? 'conta' : 'contas';
}

interface SeatMarkProps {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly status: SeatStatus;
}

/** A forma diz o papel do lugar sem depender da cor: cheio, miolo com contorno ou vazado. */
function SeatMark({ cx, cy, r, status }: SeatMarkProps): ReactElement {
  if (status === 'active') return <circle cx={cx} cy={cy} fill={ACTIVE_COLOR} r={r} />;
  // `pointerEvents="all"` faz o miolo vazio também responder ao cursor; sem ele só o traço abre a dica.
  if (status === 'risk') {
    const ring = Math.max(RISK_RING_MIN, r * RISK_RING_RATIO);
    return (
      <g>
        <circle cx={cx} cy={cy} fill="none" pointerEvents="all" r={r - ring / 2} stroke={RISK_COLOR} strokeWidth={ring} />
        <circle cx={cx} cy={cy} fill={RISK_COLOR} r={r * RISK_CORE_RATIO} />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} fill="none" pointerEvents="all" r={r - FREE_STROKE_WIDTH / 2} stroke={FREE_COLOR} strokeWidth={FREE_STROKE_WIDTH} />;
}

interface Wedge {
  readonly group: CeilingGroup;
  readonly seats: readonly Seat[];
}

interface Callout {
  readonly group: CeilingGroup;
  readonly side: 1 | -1;
  readonly x: number;
  readonly y: number;
}

/**
 * Um rótulo por grupo, na altura do meio da cunha e fora do arco. Dois rótulos do mesmo lado
 * guardam LABEL_STEP entre si (o de cima sobe), e o x sai da altura final, para o texto continuar
 * colado à borda curva. Grupo sem lugar nenhum é rotulado na ponta direita da base, com o zero.
 */
function callouts(wedges: readonly Wedge[]): Callout[] {
  const reach = BAND_OUTER + LABEL_GAP;
  const placed: Callout[] = [];
  for (const side of [-1, 1] as const) {
    const column = wedges
      .map(({ group, seats }) => {
        const first = seats[0];
        const last = seats[seats.length - 1];
        const angle = first && last ? (first.angle + last.angle) / 2 : 0;
        return { group, right: Math.cos(angle) >= 0, y: BASELINE_Y - reach * Math.sin(angle) };
      })
      .filter((item) => item.right === (side === 1))
      .sort((a, b) => b.y - a.y);
    let floorY = Number.POSITIVE_INFINITY;
    for (const item of column) {
      const y = Math.min(item.y, floorY - LABEL_STEP);
      const rise = BASELINE_Y - y;
      floorY = y;
      placed.push({ group: item.group, side, x: CENTER_X + side * Math.sqrt(Math.max(0, reach * reach - rise * rise)), y });
    }
  }
  return placed;
}

export default function CeilingHemicycle({ data = defaultData, caption = defaultCaption, height, className }: CeilingHemicycleProps) {
  const [hover, setHover] = useState<Hover | null>(null);
  // Ordem do arco: ocupados à esquerda (ativas, depois em risco) e a folga na ponta direita.
  const groups = [...data].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  const counted = tally(groups);
  const style = height === undefined ? undefined : { height };

  if (counted === null || counted.ceiling <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lugar neste recorte: sem teto informado, o hemiciclo não tem o que ocupar.</span>
      </div>
    );
  }

  const { ceiling, occupied } = counted;
  const { seats, seatRadius } = hemicycle(ceiling);
  const wedges: Wedge[] = [];
  let cursor = 0;
  for (const group of groups) {
    wedges.push({ group, seats: seats.slice(cursor, cursor + group.count) });
    cursor += group.count;
  }
  const labels = callouts(wedges);
  const hovered = hover ? groups.find((group) => group.id === hover.id) : undefined;
  // A dica segue o cursor em pixels da própria caixa do SVG, então vale em qualquer escala do cartão,
  // e vira para o lado de dentro na metade direita e na metade de baixo, para nunca sair do corpo.
  const follow = (id: string) => (event: MouseEvent<SVGGElement>) => {
    const box = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (!box) return;
    const left = event.clientX - box.left;
    const top = event.clientY - box.top;
    setHover({ id, left, top, flipX: left > box.width / 2, flipY: top > box.height / 2 });
  };

  const summary = [
    `Hemiciclo do teto de ${formatInt(ceiling)} lugares da carteira, um ponto por lugar: ${formatInt(occupied)} ocupados e folga de ${formatInt(ceiling - occupied)}.`,
    ...groups.map((group) => `${group.label}: ${formatInt(group.count)} ${nounFor(group)}, em ponto ${SHAPE_WORD[group.status]}.`),
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('relative h-full w-full min-w-0', className)} role="img" style={style}>
      <svg aria-hidden className="block h-full w-full" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        {wedges.map((wedge) => (
          <g
            key={wedge.group.id}
            onMouseLeave={() => {
              setHover(null);
            }}
            onMouseMove={follow(wedge.group.id)}
          >
            {wedge.seats.map((seat, index) => (
              <SeatMark cx={seat.x} cy={seat.y} key={`seat-${String(index)}`} r={seatRadius} status={wedge.group.status} />
            ))}
          </g>
        ))}

        <text fontSize={14} textAnchor="middle" x={CENTER_X} y={BASELINE_Y - TOTAL_RISE}>
          <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>{`${formatInt(occupied)} `}</tspan>
          <tspan className="font-display" fill="var(--text-secondary)" fontWeight={500}>{`de ${formatInt(ceiling)}`}</tspan>
        </text>
        <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={CENTER_X} y={BASELINE_Y - CAPTION_RISE}>
          {caption}
        </text>

        {labels.map(({ group, side, x, y }) => (
          <g key={group.id}>
            <SeatMark cx={x + side * LABEL_MARKER} cy={y} r={LABEL_MARKER} status={group.status} />
            <text fontSize={12} textAnchor={side === 1 ? 'start' : 'end'} x={x + side * (LABEL_MARKER * 2 + LABEL_TEXT_GAP)} y={y + TEXT_DROP}>
              <tspan fill="var(--text-secondary)" fontWeight={500}>{`${group.label} `}</tspan>
              <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>{`${formatInt(group.count)} `}</tspan>
              <tspan fill="var(--text-secondary)">{nounFor(group)}</tspan>
            </text>
          </g>
        ))}
      </svg>

      {hover && hovered ? (
        <div
          className={cn(
            'pointer-events-none absolute z-10 rounded-md border border-line-subtle bg-surface-overlay px-2.5 py-1.5 text-xs leading-5 whitespace-nowrap text-text-secondary',
            hover.flipX && '-translate-x-full',
            hover.flipY && '-translate-y-full',
          )}
          role="tooltip"
          style={{
            left: hover.left + (hover.flipX ? -TOOLTIP_OFFSET : TOOLTIP_OFFSET),
            top: hover.top + (hover.flipY ? -TOOLTIP_OFFSET : TOOLTIP_OFFSET),
          }}
        >
          <p className="font-medium text-text-primary">{hovered.label}</p>
          <p>
            <span className="font-display text-text-primary">{formatInt(hovered.count)}</span> {nounFor(hovered)}
          </p>
          <p>
            <span className="font-display text-text-primary">{formatRateWithVolume(hovered.count, ceiling)}</span> do teto
          </p>
        </div>
      ) : null}
    </div>
  );
}
