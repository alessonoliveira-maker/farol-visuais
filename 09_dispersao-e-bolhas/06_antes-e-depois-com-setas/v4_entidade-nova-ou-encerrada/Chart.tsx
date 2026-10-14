import { Filter } from 'lucide-react';
import { useId } from 'react';

import { formatCurrencyAxis, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periodAfterLabel, periodBeforeLabel, type CampaignMovement, type CampaignPeriod } from './data';

/**
 * Cada campanha aparece em dois trimestres e uma seta liga a posição antiga à nova, mas três casos
 * não têm seta inteira e é justamente isso que esta versão ensina: a campanha sem trimestre anterior
 * não tem de onde partir, a encerrada não tem para onde continuar, e a que se moveu menos que a
 * própria ponta da seta não cabe numa seta. Sem os três explicados na legenda, seta ausente é lida
 * como não mudou, que é a conclusão contrária.
 */
export interface CampaignStateArrowsProps {
  readonly data?: readonly CampaignMovement[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas declarado por número, pela GEO-1: 1040 menos 66 px de recuo dá 974 px de corpo, e 460 menos
 * 118,5 px de moldura com o caso de uso em uma linha dá 341,5 px. Fora do plano o cartão escreve a
 * leitura de 12 px, duas linhas de legenda de 12 px, a fileira reservada de 12 px para o nome sem
 * posição livre, o tique de 11 px e o rodapé de 11 px que nomeia os eixos.
 */
const VIEW_W = 974;
const VIEW_H = 341;
const MARGIN = { top: 82, right: 24, bottom: 42, left: 62 } as const;
const DOMAIN_X: readonly [number, number] = [70, 410];
const TICKS_X = [100, 200, 300, 400] as const;
const DOMAIN_Y: readonly [number, number] = [0.05, 0.4];
const TICKS_Y = [0.1, 0.2, 0.3, 0.4] as const;
/** Cor do traço que carrega a relação, e por isso mede 3:1 nos dois temas (ACE-6). Série única, cor
 *  única: o que distingue os três casos é a forma, nunca a cor (ACE-2). */
const MARK_COLOR = 'var(--chart-1)';
/** Recuo da ponta antes do alvo: sem ele o marcador some sob o ponto cheio do destino. */
const ARROW_INSET = 5;
/**
 * Abaixo deste deslocamento em pixels a seta não se lê: a ponta do marcador tem 9 px e o ponto de
 * destino 8 px de diâmetro, então uma seta de 10 px é só a ponta encostada no ponto. Trocar por anel
 * é mais honesto que desenhar um traço que ninguém consegue seguir.
 */
const SMALL_MOVE_PX = 12;
const POINT_RADIUS = 4;
const ARROW_WIDTH = 1.5;
const SMALL_RING_RADIUS = POINT_RADIUS + 3;
const NEW_RING_RADIUS = POINT_RADIUS + 3;
const END_CROSS_ARM = 5;
const READING_LINE_Y = 13;
const LEGEND_ROW_1_Y = 31;
const LEGEND_ROW_2_Y = 49;
/** Fileira reservada para o nome que não encontra posição livre no plano, com linha de chamada. */
const FALLBACK_ROW_Y = 67;
const TICK_LABEL_DY = 16;
const AXIS_NOTE_DY = 36;
const LABEL_FONT_SIZE = 12;
const TICK_FONT_SIZE = 11;
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

/** Como a entidade se desenha. `arrow` é o caso comum; os outros três são a lição da versão. */
type MarkShape = 'arrow' | 'ended' | 'new' | 'small';

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

function positionOf(period: CampaignPeriod, plotWidth: number, plotHeight: number): Point | null {
  const qualified = rate(period.qualified, period.leads);
  if (qualified === null) return null;
  return { x: scaleX(period.cpl, plotWidth), y: scaleY(qualified, plotHeight) };
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

interface MarkGeometry {
  readonly item: CampaignMovement;
  readonly shape: MarkShape;
  /** Nulo só no caso `new`, que não tem de onde partir. */
  readonly origin: Point | null;
  readonly target: Point;
  readonly tip: Point;
  /** Onde o nome se ancora: o ponto que representa a posição corrente da campanha. */
  readonly anchor: Point;
}

interface LabelPlacement {
  readonly id: string;
  readonly text: string;
  readonly textAnchor: 'start' | 'middle' | 'end';
  readonly textX: number;
  readonly textY: number;
  readonly leaderFrom: Point | null;
  readonly rect: Rect;
}

/**
 * Anticolisão dos rótulos: cada nome tenta 8 direções em 4 raios crescentes ao redor da própria
 * âncora e aceita a primeira caixa que não cruza outro rótulo, nenhum ponto e nenhum traço de seta.
 * Quando as 32 tentativas falham, o nome vira placa na fileira reservada acima do plano, com linha
 * de chamada. Nenhum leva halo: em 1,5 px de traço o halo cobriria a seta inteira, e a resposta é
 * mover o texto, nunca apagar a marca (exceção da marca fina na ROT-7).
 */
function placeLabels(marks: readonly MarkGeometry[], plotBounds: Rect): readonly LabelPlacement[] {
  const allPoints = marks.flatMap((mark) => (mark.origin === null ? [mark.target] : [mark.origin, mark.target]));
  const placedRects: Rect[] = [];
  const placements: LabelPlacement[] = [];
  const overflow: { readonly mark: MarkGeometry; readonly text: string }[] = [];

  for (const mark of marks) {
    const text = mark.shape === 'new' ? `${mark.item.name}, nova` : mark.item.name;
    const textWidth = estimateTextWidth(text);
    let chosen: { rect: Rect; anchor: 'start' | 'middle' | 'end' } | null = null;

    for (const radius of LABEL_RADII) {
      for (const dir of LABEL_DIRECTIONS) {
        const rect = alignRect(mark.anchor, dir, radius, textWidth);
        if (!rectWithinBounds(rect, plotBounds)) continue;
        if (placedRects.some((placed) => rectsOverlap(rect, placed, LABEL_GAP))) continue;
        if (allPoints.some((point) => rectContainsPoint(rect, point, POINT_BUFFER))) continue;
        if (marks.some((other) => (other.origin === null ? false : segmentHitsRect(other.origin, other.tip, rect, ARROW_BUFFER)))) continue;
        chosen = { rect, anchor: dir.anchor };
        break;
      }
      if (chosen) break;
    }

    if (chosen === null) {
      overflow.push({ mark, text });
      continue;
    }
    placedRects.push(chosen.rect);
    const textX =
      chosen.anchor === 'start' ? chosen.rect.x : chosen.anchor === 'end' ? chosen.rect.x + chosen.rect.width : chosen.rect.x + chosen.rect.width / 2;
    placements.push({
      id: mark.item.id,
      text,
      textAnchor: chosen.anchor,
      textX,
      textY: chosen.rect.y + chosen.rect.height / 2,
      leaderFrom: null,
      rect: chosen.rect,
    });
  }

  let cursorX = plotBounds.x;
  for (const pending of overflow) {
    const textWidth = estimateTextWidth(pending.text);
    const x = Math.max(cursorX, pending.mark.anchor.x - textWidth / 2);
    const rect: Rect = { x, y: FALLBACK_ROW_Y - LABEL_LINE_HEIGHT / 2, width: textWidth, height: LABEL_LINE_HEIGHT };
    cursorX = rect.x + rect.width + LABEL_GAP * 3;
    placements.push({
      id: pending.mark.item.id,
      text: pending.text,
      textAnchor: 'start',
      textX: rect.x,
      textY: FALLBACK_ROW_Y,
      leaderFrom: pending.mark.anchor,
      rect,
    });
  }

  return placements;
}

export default function CampaignStateArrows({ data = defaultData, height, className }: CampaignStateArrowsProps) {
  const baseId = useId().replace(/:/g, '');
  const markerId = `arrow-${baseId}`;
  const style = height === undefined ? undefined : { height };

  const plotWidth = VIEW_W - MARGIN.left - MARGIN.right;
  const plotHeight = VIEW_H - MARGIN.top - MARGIN.bottom;
  const plotBounds: Rect = { x: MARGIN.left, y: MARGIN.top, width: plotWidth, height: plotHeight };

  /** O retorno é anotado porque os três ramos devolvem formas diferentes, e sem a anotação o
   *  TypeScript infere a união dos literais em vez do tipo comum. */
  const marks: readonly MarkGeometry[] = data.flatMap((item): readonly MarkGeometry[] => {
    const target = positionOf(item.after, plotWidth, plotHeight);
    if (target === null) return [];
    const origin = item.before === null ? null : positionOf(item.before, plotWidth, plotHeight);
    if (origin === null) {
      return [{ item, shape: 'new', origin: null, target, tip: target, anchor: target }];
    }
    const dist = Math.hypot(target.x - origin.x, target.y - origin.y);
    if (dist < SMALL_MOVE_PX) {
      /** O anel fica no meio do caminho, para nenhum dos dois períodos parecer o único medido. */
      const middle = { x: (origin.x + target.x) / 2, y: (origin.y + target.y) / 2 };
      return [{ item, shape: 'small', origin, target, tip: target, anchor: middle }];
    }
    const tip = { x: target.x - ((target.x - origin.x) / dist) * ARROW_INSET, y: target.y - ((target.y - origin.y) / dist) * ARROW_INSET };
    return [{ item, shape: item.ended ? 'ended' : 'arrow', origin, target, tip, anchor: target }];
  });

  if (marks.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha com base de leads no trimestre corrente: não há posição para desenhar.</span>
      </div>
    );
  }

  const newCount = marks.filter((mark) => mark.shape === 'new').length;
  const endedCount = marks.filter((mark) => mark.shape === 'ended').length;
  const smallCount = marks.filter((mark) => mark.shape === 'small').length;
  const placements = placeLabels(marks, plotBounds);

  const summary =
    `Dispersão com setas ligando ${formatInt(marks.length)} campanhas de ${periodBeforeLabel} a ${periodAfterLabel}, por CPL e qualificação. ` +
    `Seta ausente não é ausência de mudança: ${formatInt(newCount)} campanha é nova, ${formatInt(endedCount)} foi encerrada e termina em x, e ` +
    `${formatInt(smallCount)} quase não se moveu e virou anel.`;
  const readingLine =
    `Seta ausente não é sem mudança: ${formatInt(newCount)} campanha nova, ${formatInt(endedCount)} encerrada e ` +
    `${formatInt(smallCount)} com mudança pequena`;

  const legendRow1: readonly { readonly id: string; readonly text: string; readonly kind: 'ring' | 'dot' }[] = [
    { id: 'antes', text: `${periodBeforeLabel}, antes`, kind: 'ring' },
    { id: 'depois', text: `${periodAfterLabel}, depois`, kind: 'dot' },
  ];
  let cursorRow1 = MARGIN.left;
  const legend1 = legendRow1.map((item) => {
    const swatchX = cursorRow1;
    const textX = swatchX + POINT_RADIUS * 2 + LEGEND_TEXT_GAP;
    cursorRow1 = textX + estimateTextWidth(item.text) + LEGEND_ITEM_GAP;
    return { ...item, swatchX, textX };
  });

  const legendRow2: readonly { readonly id: string; readonly text: string; readonly kind: 'new' | 'ended' | 'small' }[] = [
    { id: 'nova', text: `campanha nova, sem ${periodBeforeLabel}`, kind: 'new' },
    { id: 'encerrada', text: `campanha encerrada no fim do ${periodAfterLabel}`, kind: 'ended' },
    { id: 'pequena', text: 'mudança pequena, sem seta', kind: 'small' },
  ];
  let cursorRow2 = MARGIN.left;
  const legend2 = legendRow2.map((item) => {
    const swatchX = cursorRow2;
    const swatchWidth = item.kind === 'ended' ? LEGEND_SWATCH_LEN : SMALL_RING_RADIUS * 2;
    const textX = swatchX + swatchWidth + LEGEND_TEXT_GAP;
    cursorRow2 = textX + estimateTextWidth(item.text) + LEGEND_ITEM_GAP;
    return { ...item, swatchX, swatchWidth, textX };
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
        <marker id={markerId} markerHeight={9} markerUnits="userSpaceOnUse" markerWidth={9} orient="auto" refX={9} refY={4.5} viewBox="0 0 9 9">
          <path d="M0,0 L9,4.5 L0,9 Z" fill={MARK_COLOR} />
        </marker>
      </defs>

      {/* Linha de leitura (ANO-5): a conclusão calculada do dado, e aqui ela é a própria lição da
          versão. A frase acessível da raiz diz o mesmo, e por isso este texto é escondido. */}
      <text aria-hidden className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={LABEL_FONT_SIZE} x={MARGIN.left} y={READING_LINE_Y}>
        {readingLine}
      </text>

      {/* Legenda acima do plano, em duas linhas (ROT-4): a primeira diz qual ponta é o começo, e a
          segunda explica as três formas sem seta, para seta ausente não virar não mudou. */}
      {legend1.map((item) => (
        <g key={item.id}>
          {item.kind === 'ring' ? (
            <circle cx={item.swatchX + POINT_RADIUS} cy={LEGEND_ROW_1_Y - 4} fill="var(--surface-raised)" r={POINT_RADIUS} stroke={MARK_COLOR} strokeWidth={1.5} />
          ) : (
            <circle cx={item.swatchX + POINT_RADIUS} cy={LEGEND_ROW_1_Y - 4} fill={MARK_COLOR} r={POINT_RADIUS} />
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
          {item.kind === 'new' ? (
            <g>
              <circle
                cx={item.swatchX + SMALL_RING_RADIUS}
                cy={LEGEND_ROW_2_Y - 4}
                fill="none"
                r={NEW_RING_RADIUS}
                stroke={MARK_COLOR}
                strokeDasharray="3 2"
                strokeWidth={1.5}
              />
              <circle cx={item.swatchX + SMALL_RING_RADIUS} cy={LEGEND_ROW_2_Y - 4} fill={MARK_COLOR} r={POINT_RADIUS - 1} />
            </g>
          ) : null}
          {item.kind === 'ended' ? (
            <g>
              <line
                stroke={MARK_COLOR}
                strokeWidth={ARROW_WIDTH}
                x1={item.swatchX}
                x2={item.swatchX + LEGEND_SWATCH_LEN - END_CROSS_ARM}
                y1={LEGEND_ROW_2_Y - 4}
                y2={LEGEND_ROW_2_Y - 4}
              />
              <line
                stroke={MARK_COLOR}
                strokeWidth={1.75}
                x1={item.swatchX + LEGEND_SWATCH_LEN - END_CROSS_ARM * 2}
                x2={item.swatchX + LEGEND_SWATCH_LEN}
                y1={LEGEND_ROW_2_Y - 4 - END_CROSS_ARM}
                y2={LEGEND_ROW_2_Y - 4 + END_CROSS_ARM}
              />
              <line
                stroke={MARK_COLOR}
                strokeWidth={1.75}
                x1={item.swatchX + LEGEND_SWATCH_LEN - END_CROSS_ARM * 2}
                x2={item.swatchX + LEGEND_SWATCH_LEN}
                y1={LEGEND_ROW_2_Y - 4 + END_CROSS_ARM}
                y2={LEGEND_ROW_2_Y - 4 - END_CROSS_ARM}
              />
            </g>
          ) : null}
          {item.kind === 'small' ? (
            <g>
              <circle
                cx={item.swatchX + SMALL_RING_RADIUS}
                cy={LEGEND_ROW_2_Y - 4}
                fill="none"
                r={SMALL_RING_RADIUS}
                stroke={MARK_COLOR}
                strokeWidth={1.5}
              />
              <circle cx={item.swatchX + SMALL_RING_RADIUS} cy={LEGEND_ROW_2_Y - 4} fill={MARK_COLOR} r={POINT_RADIUS - 1} />
            </g>
          ) : null}
          <text
            className="font-sans tabular-nums"
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
              {formatCurrencyAxis(tick)}
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

      {marks.map((mark) => (
        <g key={mark.item.id}>
          {mark.shape === 'arrow' && mark.origin !== null ? (
            <>
              <line
                markerEnd={`url(#${markerId})`}
                stroke={MARK_COLOR}
                strokeWidth={ARROW_WIDTH}
                x1={mark.origin.x}
                x2={mark.tip.x}
                y1={mark.origin.y}
                y2={mark.tip.y}
              />
              <circle cx={mark.origin.x} cy={mark.origin.y} fill="var(--surface-raised)" r={POINT_RADIUS} stroke={MARK_COLOR} strokeWidth={1.5} />
              <circle cx={mark.target.x} cy={mark.target.y} fill={MARK_COLOR} r={POINT_RADIUS} />
            </>
          ) : null}

          {/* Encerrada: a seta vai até o fim sem ponta, e o x no destino diz que ali a série para.
              Um ponto cheio ali diria o contrário, que a campanha segue naquela posição. */}
          {mark.shape === 'ended' && mark.origin !== null ? (
            <>
              <line stroke={MARK_COLOR} strokeWidth={ARROW_WIDTH} x1={mark.origin.x} x2={mark.tip.x} y1={mark.origin.y} y2={mark.tip.y} />
              <circle cx={mark.origin.x} cy={mark.origin.y} fill="var(--surface-raised)" r={POINT_RADIUS} stroke={MARK_COLOR} strokeWidth={1.5} />
              <line
                stroke={MARK_COLOR}
                strokeWidth={2}
                x1={mark.target.x - END_CROSS_ARM}
                x2={mark.target.x + END_CROSS_ARM}
                y1={mark.target.y - END_CROSS_ARM}
                y2={mark.target.y + END_CROSS_ARM}
              />
              <line
                stroke={MARK_COLOR}
                strokeWidth={2}
                x1={mark.target.x - END_CROSS_ARM}
                x2={mark.target.x + END_CROSS_ARM}
                y1={mark.target.y + END_CROSS_ARM}
                y2={mark.target.y - END_CROSS_ARM}
              />
            </>
          ) : null}

          {/* Nova: só a posição corrente, com anel tracejado em volta. Sem seta porque não existe de
              onde partir, e o tracejado é a forma que diz isso sem depender de cor. */}
          {mark.shape === 'new' ? (
            <>
              <circle cx={mark.target.x} cy={mark.target.y} fill="none" r={NEW_RING_RADIUS} stroke={MARK_COLOR} strokeDasharray="3 2" strokeWidth={1.5} />
              <circle cx={mark.target.x} cy={mark.target.y} fill={MARK_COLOR} r={POINT_RADIUS - 1} />
            </>
          ) : null}

          {/* Mudança pequena: anel cheio no meio do caminho. A seta teria menos pixels que a própria
              ponta e leria como dois pontos encostados. */}
          {mark.shape === 'small' ? (
            <>
              <circle cx={mark.anchor.x} cy={mark.anchor.y} fill="none" r={SMALL_RING_RADIUS} stroke={MARK_COLOR} strokeWidth={1.5} />
              <circle cx={mark.anchor.x} cy={mark.anchor.y} fill={MARK_COLOR} r={POINT_RADIUS - 1} />
            </>
          ) : null}
        </g>
      ))}

      {placements.map((placement) => (
        <g key={placement.id}>
          {placement.leaderFrom === null ? null : (
            <line
              stroke="var(--text-muted)"
              strokeDasharray="2 2"
              strokeWidth={1}
              x1={placement.leaderFrom.x}
              x2={placement.rect.x}
              y1={placement.leaderFrom.y}
              y2={placement.rect.y + placement.rect.height / 2}
            />
          )}
          <text
            className="font-sans"
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize={LABEL_FONT_SIZE}
            textAnchor={placement.textAnchor}
            x={placement.textX}
            y={placement.textY}
          >
            {placement.text}
          </text>
        </g>
      ))}

      {/* Rodapé que nomeia os dois eixos e a unidade de cada um: sem ele o plano não diz o que mede. */}
      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={TICK_FONT_SIZE} x={MARGIN.left} y={MARGIN.top + plotHeight + AXIS_NOTE_DY}>
        Eixo horizontal: custo por lead em reais. Eixo vertical: taxa de qualificação dos leads.
      </text>
    </svg>
  );
}
