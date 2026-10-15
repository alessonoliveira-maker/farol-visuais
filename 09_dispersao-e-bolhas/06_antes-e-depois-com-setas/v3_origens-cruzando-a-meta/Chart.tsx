import { Filter } from 'lucide-react';
import { useId } from 'react';

import { formatInt, formatMonthShort, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, metaQualification, periodAfter, periodBefore, type OriginMovement } from './data';

/**
 * Cada origem aparece em dois meses e uma seta liga a posição antiga à nova. Uma divisória fixa na
 * meta de qualificação, idêntica nos dois meses, separa a faixa crítica do resto do plano: só as
 * setas que CRUZARAM a divisória recebem cor, e o sentido do cruzamento é lido pela própria
 * geometria da seta, não apenas pela cor. O rótulo é escasso de propósito: com 12 origens, nomear
 * todas cobriria o plano, então entram todas as setas que cruzaram a divisória e as acima do percentil 75 de deslocamento.
 */
export interface OriginCrossingArrowsProps {
  readonly data?: readonly OriginMovement[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas declarado por número, pela GEO-1: 960 menos 66 px de recuo dá 894 px de corpo, e 440 menos
 * 118,5 px de moldura com o caso de uso em uma linha dá 321,5 px. Fora do plano o cartão escreve
 * cinco linhas: a leitura de 12 px, duas linhas de legenda de 12 px, a anotação de 11 px com as
 * contagens e o rodapé de 11 px que nomeia os eixos.
 */
const VIEW_W = 894;
const VIEW_H = 321;
const MARGIN = { top: 64, right: 72, bottom: 60, left: 62 } as const;
const DOMAIN_X: readonly [number, number] = [40, 540];
const TICKS_X = [100, 200, 300, 400, 500] as const;
const DOMAIN_Y: readonly [number, number] = [0.05, 0.4];
const TICKS_Y = [0.1, 0.2, 0.3, 0.4] as const;
/** Cor do traço que carrega a relação, e por isso mede 3:1 nos dois temas (ACE-6). */
const ENTERED_COLOR = 'var(--negative)';
const LEFT_COLOR = 'var(--positive)';
const CONTEXT_COLOR = 'var(--text-muted)';
/** Recuo da ponta antes do alvo: sem ele o marcador some sob o ponto cheio do destino. */
const ARROW_INSET = 5;
const POINT_RADIUS = 4;
const ARROW_WIDTH_CROSSED = 2;
const ARROW_WIDTH_CONTEXT = 1.5;
const READING_LINE_Y = 13;
const LEGEND_ROW_1_Y = 31;
const LEGEND_ROW_2_Y = 49;
const TICK_LABEL_DY = 16;
const ANNOTATION_DY = 36;
const AXIS_NOTE_DY = 54;
const LABEL_FONT_SIZE = 12;
const TICK_FONT_SIZE = 11;
/** Fração do deslocamento acima da qual a seta ganha nome. Com 12 origens, 3 ficam nomeadas. */
const LABEL_PERCENTILE = 0.75;
/** Largura média por caractere em 12 px, superestimada de propósito: o anticolisão erra para o lado
 * de sobrar espaço, nunca para o lado de duas caixas se tocarem. */
const CHAR_WIDTH_FACTOR = 0.6;
const LABEL_LINE_HEIGHT = 14;
const LABEL_GAP = 4;
const POINT_BUFFER = 8;
const ARROW_BUFFER = 4;
const LEGEND_SWATCH_LEN = 18;
const LEGEND_TEXT_GAP = 8;
const LEGEND_ITEM_GAP = 26;
const META_LABEL_GAP = 6;
const LABEL_DIRECTIONS: ReadonlyArray<{ readonly dx: number; readonly dy: number; readonly anchor: 'start' | 'middle' | 'end' }> = [
  { dx: 1, dy: 0, anchor: 'start' },
  { dx: 0.72, dy: -0.72, anchor: 'start' },
  { dx: 0, dy: -1, anchor: 'middle' },
  { dx: -0.72, dy: -0.72, anchor: 'end' },
  { dx: -1, dy: 0, anchor: 'end' },
  { dx: -0.72, dy: 0.72, anchor: 'end' },
  { dx: 0, dy: 1, anchor: 'middle' },
  { dx: 0.72, dy: 0.72, anchor: 'start' },
];
const LABEL_RADII = [16, 24, 34, 44] as const;
/** Passos da varredura de reserva, usada quando nenhuma das 32 posições em volta do ponto está livre. */
const SCAN_STEP_X = 8;
const SCAN_STEP_Y = 4;

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

/** Para onde a origem foi em relação à divisória, quando ela cruzou. */
type Crossing = 'entered' | 'left' | 'none';

function scaleX(value: number, width: number): number {
  const [min, max] = DOMAIN_X;
  return MARGIN.left + ((value - min) / (max - min)) * width;
}

function scaleY(value: number, height: number): number {
  const [min, max] = DOMAIN_Y;
  return MARGIN.top + height - ((value - min) / (max - min)) * height;
}

/**
 * Taxa a partir das contagens. Devolve `null` quando não há base, porque sem denominador a taxa não
 * existe e zero seria uma medida inventada (EST-1b).
 */
function rate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return numerator / denominator;
}

/**
 * Percentil por interpolação linear. Devolve `null` para lista vazia, porque percentil de nada não
 * é zero (EST-1b); o `?? 0` dos dois índices existe só para fechar o `noUncheckedIndexedAccess`.
 */
function percentile(values: readonly number[], fraction: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = fraction * (sorted.length - 1);
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const low = sorted[lower] ?? 0;
  const high = sorted[upper] ?? 0;
  return low + (high - low) * (position - lower);
}

/** Cruzou a divisória, e para que lado. Tocar a meta exatamente conta como estar dentro dela. */
function crossingOf(before: number, after: number, target: number): Crossing {
  const beforeBelow = before < target;
  const afterBelow = after < target;
  if (beforeBelow === afterBelow) return 'none';
  return afterBelow ? 'entered' : 'left';
}

function colorOf(crossing: Crossing): string {
  if (crossing === 'entered') return ENTERED_COLOR;
  if (crossing === 'left') return LEFT_COLOR;
  return CONTEXT_COLOR;
}

function estimateTextWidth(text: string): number {
  return text.length * LABEL_FONT_SIZE * CHAR_WIDTH_FACTOR;
}

function alignRect(anchor: Point, dir: (typeof LABEL_DIRECTIONS)[number], radius: number, textWidth: number): Rect {
  const cx = anchor.x + dir.dx * radius;
  const cy = anchor.y + dir.dy * radius;
  const x = dir.anchor === 'start' ? cx : dir.anchor === 'end' ? cx - textWidth : cx - textWidth / 2;
  return { x, y: cy - LABEL_LINE_HEIGHT / 2, width: textWidth, height: LABEL_LINE_HEIGHT };
}

function rectsOverlap(a: Rect, b: Rect, gap: number): boolean {
  return !(a.x + a.width + gap < b.x || b.x + b.width + gap < a.x || a.y + a.height + gap < b.y || b.y + b.height + gap < a.y);
}

function rectContainsPoint(r: Rect, p: Point, buffer: number): boolean {
  return p.x >= r.x - buffer && p.x <= r.x + r.width + buffer && p.y >= r.y - buffer && p.y <= r.y + r.height + buffer;
}

/** Amostra o segmento em 24 passos: mais barato e mais robusto que interseção analítica. */
function segmentHitsRect(p0: Point, p1: Point, rect: Rect, buffer: number): boolean {
  const steps = 24;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const point = { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t };
    if (rectContainsPoint(rect, point, buffer)) return true;
  }
  return false;
}

function rectWithinBounds(rect: Rect, bounds: Rect): boolean {
  return (
    rect.x >= bounds.x && rect.x + rect.width <= bounds.x + bounds.width && rect.y >= bounds.y && rect.y + rect.height <= bounds.y + bounds.height
  );
}

interface ArrowGeometry {
  readonly item: OriginMovement;
  readonly qualBefore: number;
  readonly qualAfter: number;
  readonly crossing: Crossing;
  readonly origin: Point;
  readonly target: Point;
  readonly tip: Point;
  readonly travel: number;
}

interface LabelPlacement {
  readonly id: string;
  readonly text: string;
  readonly color: string;
  readonly textAnchor: 'start' | 'middle' | 'end';
  readonly textX: number;
  readonly textY: number;
  /** Linha de chamada ligando o nome ao ponto, quando ele não coube junto do ponto. */
  readonly leaderFrom: Point | null;
  readonly leaderTo: Point | null;
}

/** Folga mínima entre a caixa de um nome com linha de chamada e qualquer ponto alheio. */
const LEADER_CLEARANCE = 36;

function rectDistance(r: Rect, p: Point): number {
  const dx = Math.max(r.x - p.x, 0, p.x - (r.x + r.width));
  const dy = Math.max(r.y - p.y, 0, p.y - (r.y + r.height));
  return Math.hypot(dx, dy);
}

/** Atribuição (ROT-2, ROT-11): o nome só vale sem linha de chamada se o próprio ponto de destino for o ponto mais próximo da caixa. */
function ownPointIsNearest(rect: Rect, own: Point, others: readonly Point[]): boolean {
  const ownDistance = rectDistance(rect, own);
  return others.every((point) => rectDistance(rect, point) > ownDistance + 1);
}

/**
 * Anticolisão dos rótulos: cada nome tenta 8 direções em 4 raios crescentes ao redor do próprio
 * ponto de destino e aceita a primeira caixa que não cruza outro rótulo, nenhum ponto e nenhum
 * traço de seta. A caixa do rótulo da meta entra ocupada desde o começo. A resposta a um rótulo
 * perto de traço fino é mover o texto, nunca apagar a marca com halo, que em 2 px de traço cobriria
 * a seta inteira (exceção da marca fina na ROT-7).
 */
function placeLabels(arrows: readonly ArrowGeometry[], named: readonly ArrowGeometry[], plotBounds: Rect, reserved: readonly Rect[]): readonly LabelPlacement[] {
  const allPoints = arrows.flatMap((arrow) => [arrow.origin, arrow.target]);
  const placedRects: Rect[] = [...reserved];
  const placements: LabelPlacement[] = [];
  const leaders: Array<readonly [Point, Point]> = [];

  for (const arrow of named) {
    const text = arrow.item.name;
    const textWidth = estimateTextWidth(text);
    let chosen: { rect: Rect; anchor: 'start' | 'middle' | 'end' } | null = null;

    for (const radius of LABEL_RADII) {
      for (const dir of LABEL_DIRECTIONS) {
        const rect = alignRect(arrow.target, dir, radius, textWidth);
        if (!rectWithinBounds(rect, plotBounds)) continue;
        if (placedRects.some((placed) => rectsOverlap(rect, placed, LABEL_GAP))) continue;
        if (allPoints.some((point) => rectContainsPoint(rect, point, POINT_BUFFER))) continue;
        if (arrows.some((other) => segmentHitsRect(other.origin, other.tip, rect, ARROW_BUFFER))) continue;
        if (!ownPointIsNearest(rect, arrow.target, allPoints.filter((point) => point !== arrow.target))) continue;
        chosen = { rect, anchor: dir.anchor };
        break;
      }
      if (chosen) break;
    }

    let leaderTo: Point | null = null;
    if (!chosen) {
      /* Reserva: varre o plano e fica com a caixa livre mais próxima do ponto, ligada a ele por
         linha de chamada. Nome de seta que cruzou nunca some por falta de lugar (ROT-4). */
      let bestDistance = Infinity;
      /* Primeira passada: o ponto próprio é o mais próximo da caixa. Segunda: nenhum ponto alheio a
         menos de LEADER_CLEARANCE da caixa, e a linha de chamada abraça só o próprio ponto (ROT-2, ROT-11). */
      for (const strict of [true, false]) {
      if (chosen) break;
      for (let y = plotBounds.y; y + LABEL_LINE_HEIGHT <= plotBounds.y + plotBounds.height; y += SCAN_STEP_Y) {
        for (let x = plotBounds.x; x + textWidth <= plotBounds.x + plotBounds.width; x += SCAN_STEP_X) {
          const rect: Rect = { x, y, width: textWidth, height: LABEL_LINE_HEIGHT };
          if (placedRects.some((placed) => rectsOverlap(rect, placed, LABEL_GAP))) continue;
          if (allPoints.some((point) => rectContainsPoint(rect, point, POINT_BUFFER))) continue;
          if (arrows.some((other) => segmentHitsRect(other.origin, other.tip, rect, ARROW_BUFFER))) continue;
          const foreign = allPoints.filter((point) => point !== arrow.target);
          if (strict ? !ownPointIsNearest(rect, arrow.target, foreign) : foreign.some((point) => rectDistance(rect, point) < LEADER_CLEARANCE)) continue;
          const nearest = { x: Math.min(Math.max(arrow.target.x, rect.x), rect.x + rect.width), y: Math.min(Math.max(arrow.target.y, rect.y), rect.y + rect.height) };
          const distance = Math.hypot(nearest.x - arrow.target.x, nearest.y - arrow.target.y);
          if (leaders.some(([from, to]) => segmentHitsRect(from, to, rect, ARROW_BUFFER))) continue;
          if (placedRects.some((placed) => segmentHitsRect(arrow.target, nearest, placed, 2))) continue;
          if (allPoints.some((point) => point !== arrow.target && segmentHitsRect(arrow.target, nearest, { x: point.x, y: point.y, width: 0, height: 0 }, POINT_BUFFER))) continue;
          if (distance < bestDistance) {
            bestDistance = distance;
            chosen = { rect, anchor: 'start' };
            leaderTo = nearest;
          }
        }
      }
      }
    }

    if (!chosen) continue;
    if (leaderTo !== null) leaders.push([arrow.target, leaderTo]);
    placedRects.push(chosen.rect);
    const textX =
      chosen.anchor === 'start' ? chosen.rect.x : chosen.anchor === 'end' ? chosen.rect.x + chosen.rect.width : chosen.rect.x + chosen.rect.width / 2;
    placements.push({
      id: arrow.item.id,
      text,
      color: colorOf(arrow.crossing),
      textAnchor: chosen.anchor,
      textX,
      textY: chosen.rect.y + chosen.rect.height / 2,
      leaderTo: leaderTo === null ? null : { x: leaderTo.x, y: leaderTo.y },
      leaderFrom: leaderTo === null ? null : arrow.target,
    });
  }

  return placements;
}

export default function OriginCrossingArrows({ data = defaultData, height, className }: OriginCrossingArrowsProps) {
  const baseId = useId().replace(/:/g, '');
  const enteredMarkerId = `arrow-entered-${baseId}`;
  const leftMarkerId = `arrow-left-${baseId}`;
  const contextMarkerId = `arrow-context-${baseId}`;
  const style = height === undefined ? undefined : { height };

  const plotWidth = VIEW_W - MARGIN.left - MARGIN.right;
  const plotHeight = VIEW_H - MARGIN.top - MARGIN.bottom;
  const plotBounds: Rect = { x: MARGIN.left, y: MARGIN.top, width: plotWidth, height: plotHeight };

  const arrows: readonly ArrowGeometry[] = data.flatMap((item) => {
    const qualBefore = rate(item.qualifiedBefore, item.leadsBefore);
    const qualAfter = rate(item.qualifiedAfter, item.leadsAfter);
    if (qualBefore === null || qualAfter === null) return [];
    const origin = { x: scaleX(item.leadsBefore, plotWidth), y: scaleY(qualBefore, plotHeight) };
    const target = { x: scaleX(item.leadsAfter, plotWidth), y: scaleY(qualAfter, plotHeight) };
    const dist = Math.hypot(target.x - origin.x, target.y - origin.y);
    const tip =
      dist > ARROW_INSET
        ? { x: target.x - ((target.x - origin.x) / dist) * ARROW_INSET, y: target.y - ((target.y - origin.y) / dist) * ARROW_INSET }
        : target;
    return [
      {
        item,
        qualBefore,
        qualAfter,
        crossing: crossingOf(qualBefore, qualAfter, metaQualification),
        origin,
        target,
        tip,
        travel: dist,
      },
    ];
  });

  if (arrows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem com base de leads nos dois meses: não há movimento para desenhar.</span>
      </div>
    );
  }

  const enteredCount = arrows.filter((arrow) => arrow.crossing === 'entered').length;
  const leftCount = arrows.filter((arrow) => arrow.crossing === 'left').length;
  const travelCut = percentile(
    arrows.map((arrow) => arrow.travel),
    LABEL_PERCENTILE,
  );
  const named = travelCut === null ? [] : arrows.filter((arrow) => arrow.crossing !== 'none' || arrow.travel > travelCut);
  const sortedByTravel = [...arrows].sort((a, b) => b.travel - a.travel);
  const mover = sortedByTravel[0];

  const metaY = scaleY(metaQualification, plotHeight);
  const metaLabelText = `meta ${formatPercent(metaQualification, 0)}`;
  const metaLabelRect: Rect = {
    x: MARGIN.left + plotWidth + META_LABEL_GAP,
    y: metaY - LABEL_LINE_HEIGHT / 2,
    width: estimateTextWidth(metaLabelText),
    height: LABEL_LINE_HEIGHT,
  };
  const placements = placeLabels(arrows, named, plotBounds, [metaLabelRect]);

  /** Miolo comum da frase acessível e da linha de leitura: o mesmo número sai com o mesmo formato
   *  para quem ouve e para quem enxerga, inclusive o par de volume da taxa. */
  const moverCore =
    mover === undefined
      ? 'nenhuma origem se moveu entre os dois meses'
      : `${mover.item.name}, de ${formatRateWithVolume(mover.item.qualifiedBefore, mover.item.leadsBefore)} para ` +
        `${formatRateWithVolume(mover.item.qualifiedAfter, mover.item.leadsAfter)}`;
  const summary =
    `Dispersão com setas ligando ${formatInt(arrows.length)} origens de ${formatMonthShort(periodBefore)} a ` +
    `${formatMonthShort(periodAfter)}, por volume e qualificação, meta de ${formatPercent(metaQualification, 0)}. ${formatInt(enteredCount)} entraram e ` +
    `${formatInt(leftCount)} saíram da faixa crítica. Maior deslocamento: ${moverCore}.`;
  const readingLine = `Maior deslocamento: ${moverCore}`;
  const annotation = `${formatInt(enteredCount)} origens entraram e ${formatInt(leftCount)} saíram da faixa crítica`;

  const legendRow1: readonly { readonly id: string; readonly text: string; readonly kind: 'ring' | 'dot' }[] = [
    { id: 'antes', text: `${formatMonthShort(periodBefore)}, antes`, kind: 'ring' },
    { id: 'depois', text: `${formatMonthShort(periodAfter)}, depois`, kind: 'dot' },
  ];
  let cursorRow1 = MARGIN.left;
  const legend1 = legendRow1.map((item) => {
    const swatchX = cursorRow1;
    const textX = swatchX + POINT_RADIUS * 2 + LEGEND_TEXT_GAP;
    cursorRow1 = textX + estimateTextWidth(item.text) + LEGEND_ITEM_GAP;
    return { ...item, swatchX, textX };
  });

  const legendRow2: readonly { readonly id: string; readonly text: string; readonly color: string; readonly marker: string }[] = [
    { id: 'entrou', text: 'entrou na faixa crítica', color: ENTERED_COLOR, marker: enteredMarkerId },
    { id: 'saiu', text: 'saiu da faixa crítica', color: LEFT_COLOR, marker: leftMarkerId },
    { id: 'contexto', text: 'não cruzou a meta', color: CONTEXT_COLOR, marker: contextMarkerId },
  ];
  let cursorRow2 = MARGIN.left;
  const legend2 = legendRow2.map((item) => {
    const swatchX = cursorRow2;
    const textX = swatchX + LEGEND_SWATCH_LEN + LEGEND_TEXT_GAP;
    cursorRow2 = textX + estimateTextWidth(item.text) + LEGEND_ITEM_GAP;
    return { ...item, swatchX, textX };
  });

  return (
    <svg
      aria-label={summary}
      className={cn('h-full w-full min-w-0', className)}
      role="img"
      style={style}
      viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}
    >
      <defs>
        <marker id={enteredMarkerId} markerHeight={9} markerUnits="userSpaceOnUse" markerWidth={9} orient="auto" refX={9} refY={4.5} viewBox="0 0 9 9">
          <path d="M0,0 L9,4.5 L0,9 Z" fill={ENTERED_COLOR} />
        </marker>
        <marker id={leftMarkerId} markerHeight={9} markerUnits="userSpaceOnUse" markerWidth={9} orient="auto" refX={9} refY={4.5} viewBox="0 0 9 9">
          <path d="M0,0 L9,4.5 L0,9 Z" fill={LEFT_COLOR} />
        </marker>
        <marker id={contextMarkerId} markerHeight={9} markerUnits="userSpaceOnUse" markerWidth={9} orient="auto" refX={9} refY={4.5} viewBox="0 0 9 9">
          <path d="M0,0 L9,4.5 L0,9 Z" fill={CONTEXT_COLOR} />
        </marker>
      </defs>

      {/* Linha de leitura (ANO-5): a conclusão calculada do dado. A frase acessível da raiz diz o
          mesmo, e por isso este texto é escondido do leitor de tela. */}
      <text aria-hidden className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={LABEL_FONT_SIZE} x={MARGIN.left} y={READING_LINE_Y}>
        {readingLine}
      </text>

      {/* Legenda acima do plano, em duas linhas (ROT-4): a primeira diz qual ponta é o começo, e a
          segunda o que cada cor de seta separa. */}
      {legend1.map((item) => (
        <g key={item.id}>
          {item.kind === 'ring' ? (
            <circle
              cx={item.swatchX + POINT_RADIUS}
              cy={LEGEND_ROW_1_Y - 4}
              fill="var(--surface-raised)"
              r={POINT_RADIUS}
              stroke={CONTEXT_COLOR}
              strokeWidth={1.5}
            />
          ) : (
            <circle cx={item.swatchX + POINT_RADIUS} cy={LEGEND_ROW_1_Y - 4} fill={CONTEXT_COLOR} r={POINT_RADIUS} />
          )}
          <text
            className="font-sans tabular-nums"
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize={LABEL_FONT_SIZE}
            x={item.textX}
            y={LEGEND_ROW_1_Y - 4}
          >
            {item.text}
          </text>
        </g>
      ))}
      {legend2.map((item) => (
        <g key={item.id}>
          <line
            markerEnd={`url(#${item.marker})`}
            stroke={item.color}
            strokeWidth={item.id === 'contexto' ? ARROW_WIDTH_CONTEXT : ARROW_WIDTH_CROSSED}
            x1={item.swatchX}
            x2={item.swatchX + LEGEND_SWATCH_LEN}
            y1={LEGEND_ROW_2_Y - 4}
            y2={LEGEND_ROW_2_Y - 4}
          />
          <text
            className="font-sans"
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize={LABEL_FONT_SIZE}
            x={item.textX}
            y={LEGEND_ROW_2_Y - 4}
          >
            {item.text}
          </text>
        </g>
      ))}

      {/* Grade nos dois sentidos (EIX-3b): as duas grandezas são quantitativas e lidas por posição,
          então a grade cruzada é a régua do desenho. Sem tique e sem linha de eixo. */}
      {TICKS_X.map((tick) => {
        const x = scaleX(tick, plotWidth);
        return (
          <g key={`grid-x-${String(tick)}`}>
            <line stroke="var(--line-subtle)" x1={x} x2={x} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />
            <text
              className="font-display"
              fill="var(--text-muted)"
              fontSize={TICK_FONT_SIZE}
              textAnchor="middle"
              x={x}
              y={MARGIN.top + plotHeight + TICK_LABEL_DY}
            >
              {formatInt(tick)}
            </text>
          </g>
        );
      })}
      {TICKS_Y.map((tick) => {
        const y = scaleY(tick, plotHeight);
        return (
          <g key={`grid-y-${String(tick)}`}>
            <line stroke="var(--line-subtle)" x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={y} y2={y} />
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={TICK_FONT_SIZE}
              textAnchor="end"
              x={MARGIN.left - 8}
              y={y}
            >
              {formatPercent(tick, 0)}
            </text>
          </g>
        );
      })}

      {/* A divisória da meta, igual nos dois meses. Ela é referência e não dado: tapada, a posição
          das setas continua dizendo quem está abaixo, então vive em --text-muted (papel Referência da 17.2), sempre com o
          número escrito ao lado (TOK-5). */}
      <line stroke="var(--text-muted)" strokeDasharray="6 4" strokeWidth={1.5} x1={MARGIN.left} x2={MARGIN.left + plotWidth} y1={metaY} y2={metaY} />
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-muted)"
        fontSize={TICK_FONT_SIZE}
        x={metaLabelRect.x}
        y={metaY}
      >
        {metaLabelText}
      </text>

      {/* Contexto primeiro, cruzamento por cima: o neutro nunca cobre a seta que carrega o achado. */}
      {arrows
        .filter((arrow) => arrow.crossing === 'none')
        .map((arrow) => (
          <g key={arrow.item.id}>
            <line
              markerEnd={`url(#${contextMarkerId})`}
              stroke={CONTEXT_COLOR}
              strokeWidth={ARROW_WIDTH_CONTEXT}
              x1={arrow.origin.x}
              x2={arrow.tip.x}
              y1={arrow.origin.y}
              y2={arrow.tip.y}
            />
            <circle cx={arrow.origin.x} cy={arrow.origin.y} fill="var(--surface-raised)" r={POINT_RADIUS} stroke={CONTEXT_COLOR} strokeWidth={1.5} />
            <circle cx={arrow.target.x} cy={arrow.target.y} fill={CONTEXT_COLOR} r={POINT_RADIUS} />
          </g>
        ))}
      {arrows
        .filter((arrow) => arrow.crossing !== 'none')
        .map((arrow) => (
          <g key={arrow.item.id}>
            <line
              markerEnd={`url(#${arrow.crossing === 'entered' ? enteredMarkerId : leftMarkerId})`}
              stroke={colorOf(arrow.crossing)}
              strokeWidth={ARROW_WIDTH_CROSSED}
              x1={arrow.origin.x}
              x2={arrow.tip.x}
              y1={arrow.origin.y}
              y2={arrow.tip.y}
            />
            <circle
              cx={arrow.origin.x}
              cy={arrow.origin.y}
              fill="var(--surface-raised)"
              r={POINT_RADIUS}
              stroke={colorOf(arrow.crossing)}
              strokeWidth={ARROW_WIDTH_CROSSED}
            />
            <circle cx={arrow.target.x} cy={arrow.target.y} fill={colorOf(arrow.crossing)} r={POINT_RADIUS} />
          </g>
        ))}

      {/* Nome nas setas que cruzaram a meta (a pergunta é quem cruzou) e nas acima do percentil 75 de deslocamento. */}
      {placements.map((placement) =>
        placement.leaderFrom && placement.leaderTo ? (
          <line
            key={`leader-${placement.id}`}
            stroke="var(--text-muted)"
            strokeDasharray="2 2"
            x1={placement.leaderFrom.x}
            x2={placement.leaderTo.x}
            y1={placement.leaderFrom.y}
            y2={placement.leaderTo.y}
          />
        ) : null,
      )}
      {placements.map((placement) => (
        <text
          className="font-sans"
          dominantBaseline="central"
          fill={placement.color}
          fontSize={LABEL_FONT_SIZE}
          fontWeight={600}
          key={placement.id}
          textAnchor={placement.textAnchor}
          x={placement.textX}
          y={placement.textY}
        >
          {placement.text}
        </text>
      ))}

      {/* Anotação (ANO-1): a contagem de quem entrou e de quem saiu da faixa crítica, que a cor das
          setas mostra uma a uma e nenhuma soma. */}
      <text aria-hidden className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={TICK_FONT_SIZE} x={MARGIN.left} y={MARGIN.top + plotHeight + ANNOTATION_DY}>
        {annotation}
      </text>

      {/* Rodapé que nomeia os dois eixos e a unidade de cada um: sem ele o tique de contagem ficaria
          sem substantivo (NUM-6). */}
      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={TICK_FONT_SIZE} x={MARGIN.left} y={MARGIN.top + plotHeight + AXIS_NOTE_DY}>
        Eixo horizontal: leads recebidos no mês. Eixo vertical: taxa de qualificação desses leads.
      </text>
    </svg>
  );
}
