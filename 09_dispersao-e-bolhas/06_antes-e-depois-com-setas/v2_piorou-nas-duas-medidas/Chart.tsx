import { Filter } from 'lucide-react';
import { useId } from 'react';

import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  cplGoodDirection,
  data as defaultData,
  periodAfterLabel,
  periodBeforeLabel,
  qualGoodDirection,
  type ChannelMovement,
  type GoodDirection,
} from './data';

/**
 * Cada canal aparece em dois trimestres e uma seta liga a posição antiga à nova. Só os canais que
 * pioraram nas DUAS medidas ao mesmo tempo recebem cor semântica e nome; os outros ficam em neutro,
 * como contexto da nuvem. O que é piorar não está escrito no componente: sai da polaridade que cada
 * métrica declara no `data.ts`, porque no CPL o bom é cair e na qualificação o bom é subir.
 */
export interface WorsenedChannelArrowsProps {
  readonly data?: readonly ChannelMovement[];
  readonly height?: number;
  readonly className?: string;
}

/**
 * Canvas declarado por número, pela GEO-1: 960 menos 66 px de moldura dá 894 px de corpo, e 420
 * menos 118,5 px de moldura com o caso de uso em uma linha dá 301,5 px. Além do plano o cartão
 * escreve três linhas, a leitura de 12 px, a legenda de 12 px e o rodapé de 11 px que nomeia os
 * dois eixos, o que soma 88 px de altura fora do plano.
 */
const VIEW_W = 894;
const VIEW_H = 301;
const MARGIN = { top: 46, right: 24, bottom: 42, left: 62 } as const;
const DOMAIN_X: readonly [number, number] = [70, 410];
const TICKS_X = [100, 200, 300, 400] as const;
const DOMAIN_Y: readonly [number, number] = [0.05, 0.45];
const TICKS_Y = [0.1, 0.2, 0.3, 0.4] as const;
/** Cor do traço que carrega a relação, e por isso mede 3:1 nos dois temas (ACE-6). */
const WORSE_COLOR = 'var(--negative)';
const CONTEXT_COLOR = 'var(--text-muted)';
/** Recuo da ponta antes do alvo: sem ele o marcador some sob o ponto cheio do destino. */
const ARROW_INSET = 5;
const POINT_RADIUS = 4;
const ARROW_WIDTH_WORSE = 2;
const ARROW_WIDTH_CONTEXT = 1.5;
const READING_LINE_Y = 13;
const LEGEND_Y = 31;
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
/** Meia espessura efetiva da seta mais folga, para testar se a caixa do rótulo cruza o traço. */
const ARROW_BUFFER = 4;
const LEGEND_SWATCH_LEN = 18;
const LEGEND_TEXT_GAP = 8;
const LEGEND_ITEM_GAP = 26;
/** As oito direções candidatas para afastar um rótulo do próprio ponto, nesta ordem. */
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

function scaleX(value: number, width: number): number {
  const [min, max] = DOMAIN_X;
  return MARGIN.left + ((value - min) / (max - min)) * width;
}

function scaleY(value: number, height: number): number {
  const [min, max] = DOMAIN_Y;
  return MARGIN.top + height - ((value - min) / (max - min)) * height;
}

/**
 * Taxa a partir das contagens. Devolve `null` quando não há base, porque sem denominador a taxa
 * não existe e zero seria uma medida inventada (EST-1b).
 */
function rate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return numerator / denominator;
}

/** Piorou nesta métrica, pela polaridade que ela declara, nunca pelo sinal da diferença. */
function worsenedIn(before: number, after: number, direction: GoodDirection): boolean {
  return direction === 'up' ? after < before : after > before;
}

/** Quanto piorou nas duas medidas juntas: cada real de alta do CPL pesa um milésimo de ponto. */
function worsenedScore(cplBefore: number, cplAfter: number, qualBefore: number, qualAfter: number): number {
  return qualBefore - qualAfter + (cplAfter - cplBefore) / 1000;
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
  readonly item: ChannelMovement;
  readonly qualBefore: number;
  readonly qualAfter: number;
  readonly worse: boolean;
  readonly origin: Point;
  readonly target: Point;
  readonly tip: Point;
}

interface LabelPlacement {
  readonly id: string;
  readonly text: string;
  readonly textAnchor: 'start' | 'middle' | 'end';
  readonly textX: number;
  readonly textY: number;
}

/**
 * Anticolisão dos rótulos: cada nome tenta 8 direções em 4 raios crescentes ao redor do próprio
 * ponto de destino e aceita a primeira caixa que não cruza outro rótulo, nenhum ponto e nenhum
 * traço de seta. A resposta a um rótulo perto de traço fino é mover o texto, nunca apagar a marca
 * com halo, que em 2 px de traço cobriria a seta inteira (exceção da marca fina na ROT-7).
 */
function placeLabels(arrows: readonly ArrowGeometry[], plotBounds: Rect): readonly LabelPlacement[] {
  const allPoints = arrows.flatMap((arrow) => [arrow.origin, arrow.target]);
  const placedRects: Rect[] = [];
  const placements: LabelPlacement[] = [];

  for (const arrow of arrows) {
    if (!arrow.worse) continue;
    const text = `${arrow.item.name}, piorou`;
    const textWidth = estimateTextWidth(text);
    let chosen: { rect: Rect; anchor: 'start' | 'middle' | 'end' } | null = null;

    for (const radius of LABEL_RADII) {
      for (const dir of LABEL_DIRECTIONS) {
        const rect = alignRect(arrow.target, dir, radius, textWidth);
        if (!rectWithinBounds(rect, plotBounds)) continue;
        if (placedRects.some((placed) => rectsOverlap(rect, placed, LABEL_GAP))) continue;
        if (allPoints.some((point) => rectContainsPoint(rect, point, POINT_BUFFER))) continue;
        if (arrows.some((other) => segmentHitsRect(other.origin, other.tip, rect, ARROW_BUFFER))) continue;
        chosen = { rect, anchor: dir.anchor };
        break;
      }
      if (chosen) break;
    }

    if (!chosen) continue;
    placedRects.push(chosen.rect);
    const textX =
      chosen.anchor === 'start' ? chosen.rect.x : chosen.anchor === 'end' ? chosen.rect.x + chosen.rect.width : chosen.rect.x + chosen.rect.width / 2;
    placements.push({
      id: arrow.item.id,
      text,
      textAnchor: chosen.anchor,
      textX,
      textY: chosen.rect.y + chosen.rect.height / 2,
    });
  }

  return placements;
}

export default function WorsenedChannelArrows({ data = defaultData, height, className }: WorsenedChannelArrowsProps) {
  const baseId = useId().replace(/:/g, '');
  const worseMarkerId = `arrow-worse-${baseId}`;
  const contextMarkerId = `arrow-context-${baseId}`;
  const style = height === undefined ? undefined : { height };

  const plotWidth = VIEW_W - MARGIN.left - MARGIN.right;
  const plotHeight = VIEW_H - MARGIN.top - MARGIN.bottom;
  const plotBounds: Rect = { x: MARGIN.left, y: MARGIN.top, width: plotWidth, height: plotHeight };

  const arrows: readonly ArrowGeometry[] = data.flatMap((item) => {
    const qualBefore = rate(item.qualifiedBefore, item.leadsBefore);
    const qualAfter = rate(item.qualifiedAfter, item.leadsAfter);
    if (qualBefore === null || qualAfter === null) return [];
    const origin = { x: scaleX(item.cplBefore, plotWidth), y: scaleY(qualBefore, plotHeight) };
    const target = { x: scaleX(item.cplAfter, plotWidth), y: scaleY(qualAfter, plotHeight) };
    const dist = Math.hypot(target.x - origin.x, target.y - origin.y);
    const tip =
      dist > ARROW_INSET
        ? { x: target.x - ((target.x - origin.x) / dist) * ARROW_INSET, y: target.y - ((target.y - origin.y) / dist) * ARROW_INSET }
        : target;
    const worse =
      worsenedIn(item.cplBefore, item.cplAfter, cplGoodDirection) && worsenedIn(qualBefore, qualAfter, qualGoodDirection);
    return [{ item, qualBefore, qualAfter, worse, origin, target, tip }];
  });

  if (arrows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum canal com base de leads nos dois trimestres: não há movimento para desenhar.</span>
      </div>
    );
  }

  const worseArrows = arrows.filter((arrow) => arrow.worse);
  const contextArrows = arrows.filter((arrow) => !arrow.worse);
  const placements = placeLabels(arrows, plotBounds);

  const sortedWorse = [...worseArrows].sort(
    (a, b) =>
      worsenedScore(b.item.cplBefore, b.item.cplAfter, b.qualBefore, b.qualAfter) -
      worsenedScore(a.item.cplBefore, a.item.cplAfter, a.qualBefore, a.qualAfter),
  );
  const worst = sortedWorse[0];

  /** Miolo comum da frase acessível e da linha de leitura: o mesmo número sai com o mesmo formato
   *  para quem ouve e para quem enxerga, inclusive o par de volume da taxa. */
  const worstCore =
    worst === undefined
      ? 'nenhum canal piorou nas duas medidas ao mesmo tempo'
      : `${worst.item.name}, custo por lead de ${formatCurrencyCompact(worst.item.cplBefore)} para ` +
        `${formatCurrencyCompact(worst.item.cplAfter)}, ` +
        `qualificação de ${formatRateWithVolume(worst.item.qualifiedBefore, worst.item.leadsBefore)} para ` +
        `${formatRateWithVolume(worst.item.qualifiedAfter, worst.item.leadsAfter)}`;
  const summary =
    `Dispersão com setas ligando ${formatInt(arrows.length)} canais de ${periodBeforeLabel} a ${periodAfterLabel}. ` +
    `${formatInt(worseArrows.length)} pioraram nas duas medidas; o pior é ${worstCore}.`;
  const readingLine = `Pior nas duas: ${worstCore}`;

  const legendItems: readonly { readonly id: string; readonly text: string; readonly kind: 'ring' | 'dot' | 'line'; readonly color: string }[] = [
    { id: 'antes', text: `${periodBeforeLabel}, antes`, kind: 'ring', color: CONTEXT_COLOR },
    { id: 'depois', text: `${periodAfterLabel}, depois`, kind: 'dot', color: CONTEXT_COLOR },
    {
      id: 'piorou',
      text: `piorou nas duas medidas, ${formatInt(worseArrows.length)} de ${formatInt(arrows.length)}`,
      kind: 'line',
      color: WORSE_COLOR,
    },
    { id: 'contexto', text: 'demais canais, contexto', kind: 'line', color: CONTEXT_COLOR },
  ];
  let legendCursor = MARGIN.left;
  const legend = legendItems.map((item) => {
    const swatchX = legendCursor;
    const textX = swatchX + (item.kind === 'line' ? LEGEND_SWATCH_LEN : POINT_RADIUS * 2) + LEGEND_TEXT_GAP;
    legendCursor = textX + estimateTextWidth(item.text) + LEGEND_ITEM_GAP;
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
        <marker id={worseMarkerId} markerHeight={9} markerUnits="userSpaceOnUse" markerWidth={9} orient="auto" refX={9} refY={4.5} viewBox="0 0 9 9">
          <path d="M0,0 L9,4.5 L0,9 Z" fill={WORSE_COLOR} />
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

      {/* Legenda acima do plano (ROT-4): a forma do anel e do ponto não diz sozinha qual ponta é o
          começo, e a cor da seta precisa dizer o que ela separa. */}
      {legend.map((item) => (
        <g key={item.id}>
          {item.kind === 'ring' ? (
            <circle cx={item.swatchX + POINT_RADIUS} cy={LEGEND_Y - 4} fill="var(--surface-raised)" r={POINT_RADIUS} stroke={item.color} strokeWidth={1.5} />
          ) : null}
          {item.kind === 'dot' ? <circle cx={item.swatchX + POINT_RADIUS} cy={LEGEND_Y - 4} fill={item.color} r={POINT_RADIUS} /> : null}
          {item.kind === 'line' ? (
            <line
              markerEnd={`url(#${item.id === 'piorou' ? worseMarkerId : contextMarkerId})`}
              stroke={item.color}
              strokeWidth={item.id === 'piorou' ? ARROW_WIDTH_WORSE : ARROW_WIDTH_CONTEXT}
              x1={item.swatchX}
              x2={item.swatchX + LEGEND_SWATCH_LEN}
              y1={LEGEND_Y - 4}
              y2={LEGEND_Y - 4}
            />
          ) : null}
          <text
            className="font-sans tabular-nums"
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize={LABEL_FONT_SIZE}
            x={item.textX}
            y={LEGEND_Y - 4}
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

      {/* Contexto primeiro, destaque por cima: o neutro nunca cobre a seta que carrega o achado. */}
      {contextArrows.map((arrow) => (
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
      {worseArrows.map((arrow) => (
        <g key={arrow.item.id}>
          <line
            markerEnd={`url(#${worseMarkerId})`}
            stroke={WORSE_COLOR}
            strokeWidth={ARROW_WIDTH_WORSE}
            x1={arrow.origin.x}
            x2={arrow.tip.x}
            y1={arrow.origin.y}
            y2={arrow.tip.y}
          />
          <circle cx={arrow.origin.x} cy={arrow.origin.y} fill="var(--surface-raised)" r={POINT_RADIUS} stroke={WORSE_COLOR} strokeWidth={ARROW_WIDTH_WORSE} />
          <circle cx={arrow.target.x} cy={arrow.target.y} fill={WORSE_COLOR} r={POINT_RADIUS} />
        </g>
      ))}

      {/* Nome só nos canais que pioraram nas duas, com a palavra piorou escrita: a cor semântica
          nunca é o único canal de leitura (ACE-2). */}
      {placements.map((placement) => (
        <text
          className="font-sans"
          dominantBaseline="central"
          fill={WORSE_COLOR}
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

      {/* Rodapé que nomeia os dois eixos e a unidade de cada um: sem ele o plano não diz o que mede,
          e o tique de contagem ficaria sem substantivo (NUM-6). */}
      <text aria-hidden className="font-sans" fill="var(--text-muted)" fontSize={TICK_FONT_SIZE} x={MARGIN.left} y={MARGIN.top + plotHeight + AXIS_NOTE_DY}>
        Eixo horizontal: custo por lead em reais. Eixo vertical: taxa de qualificação dos leads.
      </text>
    </svg>
  );
}
