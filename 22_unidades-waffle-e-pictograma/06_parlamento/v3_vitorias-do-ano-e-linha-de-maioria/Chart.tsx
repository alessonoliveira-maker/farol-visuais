import { Filter } from 'lucide-react';

import { seriesColor } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { coalitionIds as defaultCoalitionIds, data as defaultData, totalCaption as defaultCaption, type OriginWins } from './data';

/**
 * Hemiciclo das vitórias do ano por origem, com a linha do meio: cada ponto é uma vitória, e as
 * origens da anotação entram primeiro, pela esquerda, para a soma delas ser lida contra a metade.
 * Responde quais origens juntas passam da metade das vitórias.
 */
export interface MajorityHemicycleProps {
  readonly data?: readonly OriginWins[];
  /** Origens somadas pela anotação, na ordem em que entram no arco. */
  readonly coalitionIds?: readonly string[];
  /** O que o total conta, escrito sob o número do centro e nas frases ("vitórias no ano"). */
  readonly caption?: string;
  readonly height?: number;
  readonly className?: string;
}

/** O viewBox é o corpo medido do canvas card com o caso de uso em uma linha: escala 1 (GEO-18). */
const VIEW_WIDTH = 574;
const VIEW_HEIGHT = 241.5;
const CENTER_X = 168;
const BASELINE_Y = 230;
/** Faixa de tinta dos assentos; o raio de dentro abre o miolo onde o total é escrito. */
const BAND_OUTER = 160;
const BAND_INNER = 62;
/** Vão entre pontos vizinhos, na fileira e entre fileiras (COR-5: pelo menos 1,5 px). */
const SEAT_GAP = 2;
/** Corredor do meio, somado ao vão: é por ele que a linha da metade atravessa a faixa sem cortar ponto (TOK-10). */
const AISLE = 3;
const MAX_ROWS = 12;
/** Abaixo disso o conjunto cabe numa fileira só, com pontos grandes. */
const SINGLE_ROW_BELOW = 10;
/** Ausência: ponto vazado com contorno em texto neutro (5,21:1 no escuro, 5,37:1 no claro). */
const NEUTRAL_STROKE = 'var(--text-muted)';
const NEUTRAL_STROKE_WIDTH = 1.5;
/** Slots na ordem da COR-8 para a origem que não traz o seu: 2 e 4 por último. */
const SLOT_ORDER = [1, 3, 6, 5, 2, 4] as const;
/** Linha da metade, colchete e chamada carregam relação, então o traço mede 3:1 contra o cartão (ACE-6). */
const GUIDE_COLOR = 'var(--text-muted)';
const GUIDE_WIDTH = 1.5;
const LINE_DASH = '4 3';
const LINE_INNER_REACH = 8;
const LINE_OUTER_REACH = 16;
const LINE_LABEL_GAP = 6;
const BRACKET_GAP = 8;
const BRACKET_TICK = 5;
const READING_Y = 14;
const LEADER_TOP = 21;
/** A chamada desce à esquerda do rótulo da linha da metade, que ocupa o topo do arco. */
const LEADER_MAX_X = CENTER_X - 84;
const LEGEND_X = 350;
const LEGEND_LABEL_X = 368;
const LEGEND_COUNT_X = 536;
const LEGEND_PERCENT_X = 572;
const LEGEND_ROW = 24;
const LEGEND_LAST_Y = 222;
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

/**
 * Assentos por fileira proporcionais ao raio, contados em PARES: toda fileira sai par e deixa o
 * corredor do meio livre. Com total ímpar, o assento que sobra vai para o meio da fileira de fora,
 * e é exatamente ele que faz a maioria.
 */
function seatsPerRow(total: number, radii: readonly number[]): number[] {
  const counts = largestRemainder(radii, Math.floor(total / 2)).map((pairs) => pairs * 2);
  const outer = counts.length - 1;
  if (total % 2 === 1) counts[outer] = (counts[outer] ?? 0) + 1;
  return counts;
}

/** Passo angular entre vizinhos: a fileira par reparte cada metade fora do corredor; a ímpar, o arco inteiro. */
function rowStep(count: number, radius: number): number {
  if (count % 2 === 1) return Math.PI / count;
  return (Math.PI / 2 - AISLE / (2 * radius)) / (count / 2);
}

/** Ângulos da fileira, da esquerda (pi) para a direita (zero), cada assento no meio do próprio gomo. */
function rowAngles(count: number, radius: number): number[] {
  const step = rowStep(count, radius);
  if (count % 2 === 1) return Array.from({ length: count }, (_, seat) => Math.PI - (seat + 0.5) * step);
  const left = Array.from({ length: count / 2 }, (_, seat) => Math.PI - (seat + 0.5) * step);
  return [...left, ...left.map((angle) => Math.PI - angle).reverse()];
}

/** Menor distância entre centros vizinhos, medida em toda fileira (o arredondamento pode apertar qualquer uma). */
function tightestChord(radii: readonly number[], counts: readonly number[]): number {
  let tightest = Number.POSITIVE_INFINITY;
  radii.forEach((radius, row) => {
    const count = counts[row] ?? 0;
    if (count > 0) tightest = Math.min(tightest, 2 * radius * Math.sin(rowStep(count, radius) / 2));
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
    const pitchRadius = Math.min(free, (BAND_OUTER - BAND_INNER) / 2);
    const radii = [BAND_OUTER - pitchRadius];
    return { radii, counts: [total], seatRadius: Math.min(pitchRadius, (tightestChord(radii, [total]) - SEAT_GAP) / 2) };
  }
  // As fileiras enchem a faixa: o passo radial é o diâmetro que cabe mais o vão.
  const pitchRadius = (BAND_OUTER - BAND_INNER - SEAT_GAP * (rows - 1)) / (2 * rows);
  const radii = Array.from({ length: rows }, (_, row) => BAND_INNER + pitchRadius + row * (2 * pitchRadius + SEAT_GAP));
  const counts = seatsPerRow(total, radii);
  return { radii, counts, seatRadius: Math.min(pitchRadius, (tightestChord(radii, counts) - SEAT_GAP) / 2) };
}

interface Hemicycle {
  readonly seats: readonly Seat[];
  readonly seatRadius: number;
  /** Até que raio a linha da metade sobe: passa da faixa, ou para sob o assento do meio quando o total é ímpar. */
  readonly lineReach: number;
}

/**
 * Experimenta de 1 a MAX_ROWS fileiras e fica com a que dá o maior ponto, de modo que o número de
 * fileiras nasce do total. Devolve os assentos na ordem angular GLOBAL, da esquerda para a direita:
 * é ela que faz cada origem sair em cunha e põe exatamente a metade dos assentos de cada lado do corredor.
 */
function hemicycle(total: number): Hemicycle {
  const maxRows = total < SINGLE_ROW_BELOW ? 1 : MAX_ROWS;
  let best = fitRows(total, 1);
  for (let rows = 2; rows <= maxRows; rows += 1) {
    const candidate = fitRows(total, rows);
    if (candidate.seatRadius > best.seatRadius) best = candidate;
  }
  const seats = best.radii.flatMap((radius, row) =>
    rowAngles(best.counts[row] ?? 0, radius).map(
      (angle): Seat => ({ x: CENTER_X + radius * Math.cos(angle), y: BASELINE_Y - radius * Math.sin(angle), angle, row }),
    ),
  );
  seats.sort((a, b) => b.angle - a.angle || a.row - b.row);
  const outerRadius = best.radii[best.radii.length - 1] ?? BAND_OUTER;
  const lineReach = total % 2 === 1 ? outerRadius - best.seatRadius - SEAT_GAP : BAND_OUTER + LINE_OUTER_REACH;
  return { seats, seatRadius: best.seatRadius, lineReach };
}

/** Soma das contagens. Lista vazia não tem total: devolve `null`, nunca zero (EST-1b). */
function sumCounts(groups: readonly OriginWins[]): number | null {
  if (groups.length === 0) return null;
  return groups.reduce((sum, group) => sum + group.count, 0);
}

/** O rótulo do dado nasce com maiúscula; no meio da frase ele entra em minúscula. */
function inSentence(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1);
}

/** A metade do total, que só tem casa decimal quando o total é ímpar. */
function halfText(total: number): string {
  return total % 2 === 0 ? formatInt(total / 2) : formatDecimal(total / 2, 1);
}

/** Onde a soma fica contra a metade: a frase afirma o regime que o dado mostra, nos dois sentidos. */
function regimeText(sum: number, total: number, plural: boolean): string {
  if (sum * 2 > total) return plural ? 'passam da metade' : 'passa da metade';
  if (sum * 2 === total) return plural ? 'ficam na metade exata' : 'fica na metade exata';
  return plural ? 'ficam abaixo da metade' : 'fica abaixo da metade';
}

function polar(radius: number, angle: number): { x: number; y: number } {
  return { x: CENTER_X + radius * Math.cos(angle), y: BASELINE_Y - radius * Math.sin(angle) };
}

/** Coordenada com duas casas, para o atributo `d` não carregar ruído de ponto flutuante. */
function px(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/** Colchete por fora do arco, da ponta esquerda até `endAngle`: abraça só os assentos somados (ROT-11). */
function bracketPath(endAngle: number): string {
  const radius = BAND_OUTER + BRACKET_GAP;
  const startTick = polar(radius - BRACKET_TICK, Math.PI);
  const start = polar(radius, Math.PI);
  const end = polar(radius, endAngle);
  const endTick = polar(radius - BRACKET_TICK, endAngle);
  return [
    `M ${px(startTick.x)} ${px(startTick.y)} L ${px(start.x)} ${px(start.y)}`,
    `A ${px(radius)} ${px(radius)} 0 0 1 ${px(end.x)} ${px(end.y)}`,
    `L ${px(endTick.x)} ${px(endTick.y)}`,
  ].join(' ');
}

export default function MajorityHemicycle({
  data = defaultData,
  coalitionIds = defaultCoalitionIds,
  caption = defaultCaption,
  height,
  className,
}: MajorityHemicycleProps) {
  // Ordem do arco e da legenda: as origens somadas primeiro, as demais na ordem do dado e a ausência por último.
  const coalition = coalitionIds.flatMap((id) => data.filter((group) => group.id === id && !group.neutral));
  const others = data.filter((group) => !coalition.includes(group));
  const groups = [...coalition, ...others.filter((group) => !group.neutral), ...others.filter((group) => group.neutral)];
  const total = sumCounts(groups);
  const style = height === undefined ? undefined : { height };

  if (total === null || total <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma vitória neste recorte: sem assentos, não há metade a disputar.</span>
      </div>
    );
  }

  const { seats, seatRadius, lineReach } = hemicycle(total);
  const owners = groups.flatMap((group, index) => Array.from({ length: group.count }, () => index));
  const colors = groups.map((group) => {
    if (group.neutral) return null;
    // A cor sai do slot da ORIGEM, o mesmo do painel inteiro; sem slot, vale a ordem de entrada do dado (COR-3).
    const slot = group.slot ?? SLOT_ORDER[Math.min(data.indexOf(group), SLOT_ORDER.length - 1)] ?? 1;
    return seriesColor(slot - 1);
  });
  const percents = largestRemainder(groups.map((group) => group.count), 100);
  const plural = coalition.length > 1;
  const coalitionSum = sumCounts(coalition);
  const lastIn = coalitionSum === null ? undefined : seats[coalitionSum - 1];
  const firstOut = coalitionSum === null ? undefined : seats[coalitionSum];
  // O colchete termina a meio caminho entre o último assento somado e o primeiro de fora.
  const bracketEnd = lastIn ? (firstOut ? (lastIn.angle + firstOut.angle) / 2 : 0) : null;
  const bracketRadius = BAND_OUTER + BRACKET_GAP;
  // A chamada desce do texto até o meio do colchete, sem nunca passar para baixo do rótulo da linha.
  const leaderX = bracketEnd === null ? null : Math.min(polar(bracketRadius, (Math.PI + bracketEnd) / 2).x, LEADER_MAX_X);
  const leaderBottom = leaderX === null ? null : BASELINE_Y - Math.sqrt(bracketRadius ** 2 - (leaderX - CENTER_X) ** 2);
  const firstLegendY = LEGEND_LAST_Y - (groups.length - 1) * LEGEND_ROW;

  const tail = groups.slice(coalition.length);
  const named = coalition.map((group, index) => `${index === 0 ? group.label : inSentence(group.label)} (${formatInt(group.count)})`);
  const namedText = named.length > 1 ? `${named.slice(0, -1).join(', ')} e ${named[named.length - 1] ?? ''}` : (named[0] ?? '');
  const summary = [
    `Hemiciclo de ${formatInt(total)} ${caption} por origem, com linha na metade (${halfText(total)}).`,
    coalitionSum === null
      ? ''
      : `${namedText} ${plural ? 'somam' : 'soma'} ${formatInt(coalitionSum)} e ${regimeText(coalitionSum, total, plural)}.`,
    tail.length > 0 ? `Depois: ${tail.map((group) => `${inSentence(group.label)} ${formatInt(group.count)}`).join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <svg aria-hidden className="block h-full w-full" viewBox={`0 0 ${String(VIEW_WIDTH)} ${String(VIEW_HEIGHT)}`}>
        {coalitionSum === null ? null : (
          <text fill="var(--text-secondary)" fontSize={12} x={0} y={READING_Y}>
            {coalition.map((group, index) => (
              <tspan key={group.id}>
                {index === 0 ? null : <tspan>{index === coalition.length - 1 ? ' e ' : ', '}</tspan>}
                <tspan fill="var(--text-primary)" fontWeight={600}>{`${index === 0 ? group.label : inSentence(group.label)} `}</tspan>
                <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>{`(${formatInt(group.count)})`}</tspan>
              </tspan>
            ))}
            <tspan>{plural ? ' somam ' : ' soma '}</tspan>
            <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>{formatInt(coalitionSum)}</tspan>
            <tspan>{' de '}</tspan>
            <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>{formatInt(total)}</tspan>
            <tspan>{` ${caption} e ${regimeText(coalitionSum, total, plural)}.`}</tspan>
          </text>
        )}

        {/* A linha passa pelo corredor do meio: metade dos assentos fica de cada lado dela. */}
        <line
          stroke={GUIDE_COLOR}
          strokeDasharray={LINE_DASH}
          strokeWidth={GUIDE_WIDTH}
          x1={CENTER_X}
          x2={CENTER_X}
          y1={BASELINE_Y - lineReach}
          y2={BASELINE_Y - (BAND_INNER - LINE_INNER_REACH)}
        />
        <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={CENTER_X} y={BASELINE_Y - (BAND_OUTER + LINE_OUTER_REACH) - LINE_LABEL_GAP}>
          <tspan>{'metade das vitórias: '}</tspan>
          <tspan className="font-display">{halfText(total)}</tspan>
        </text>

        {seats.map((seat, index) => {
          const color = colors[owners[index] ?? 0] ?? null;
          const key = `seat-${String(index)}`;
          if (color === null) {
            const r = seatRadius - NEUTRAL_STROKE_WIDTH / 2;
            return <circle cx={seat.x} cy={seat.y} fill="none" key={key} r={r} stroke={NEUTRAL_STROKE} strokeWidth={NEUTRAL_STROKE_WIDTH} />;
          }
          return <circle cx={seat.x} cy={seat.y} fill={color} key={key} r={seatRadius} />;
        })}

        {bracketEnd === null || leaderX === null || leaderBottom === null ? null : (
          <g fill="none" stroke={GUIDE_COLOR} strokeWidth={GUIDE_WIDTH}>
            <path d={bracketPath(bracketEnd)} />
            <line x1={leaderX} x2={leaderX} y1={LEADER_TOP} y2={leaderBottom} />
          </g>
        )}

        <text className="font-display" fill="var(--text-primary)" fontSize={14} fontWeight={600} textAnchor="middle" x={CENTER_X} y={BASELINE_Y - TOTAL_RISE}>
          {formatInt(total)}
        </text>
        <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={CENTER_X} y={BASELINE_Y - CAPTION_RISE}>
          {caption}
        </text>

        <text fill="var(--text-muted)" fontSize={11} x={LEGEND_X} y={firstLegendY - LEGEND_NOTE_RISE}>
          cada ponto é uma vitória
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
