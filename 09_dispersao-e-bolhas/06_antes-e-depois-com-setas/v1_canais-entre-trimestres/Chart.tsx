import { Filter } from 'lucide-react';
import { useId } from 'react';

import { formatCurrencyAxis, formatCurrencyCompact, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, periodAfterLabel, periodBeforeLabel, type ChannelMovement } from './data';

/**
 * Cada canal aparece em dois trimestres e uma seta liga a posição antiga à nova. A conversão de
 * dado para pixel é feita aqui, em SVG puro, com os mesmos domínios lineares dos dois eixos; a
 * ponta da seta recua antes do ponto de destino para não sumir sob a marca cheia, e o nome de
 * cada canal é posicionado por um anticolisão calculado em TypeScript, nunca por deslocamento
 * manual por id.
 */
export interface ChannelArrowsProps {
  readonly data?: readonly ChannelMovement[];
  readonly height?: number;
  readonly className?: string;
}

/** Canvas ampliado de card para largo em 2026-09-19: 8 rótulos livres pedem largura, não halo. */
const VIEW_W = 894;
const VIEW_H = 274;
const MARGIN = { top: 36, right: 20, bottom: 56, left: 60 } as const;
const DOMAIN_X: readonly [number, number] = [70, 410];
const TICKS_X = [100, 200, 300, 400] as const;
const DOMAIN_Y: readonly [number, number] = [0.05, 0.45];
const TICKS_Y = [0.1, 0.2, 0.3, 0.4] as const;
/** Recuo da ponta da seta antes do alvo (ponto delicado do modelo): sem ele o marcador some sob o ponto cheio. */
const ARROW_INSET = 5;
const ORIGIN_RADIUS = 4;
const TARGET_RADIUS = 4;
const ARROW_COLOR = 'var(--chart-1)';
const READING_LINE_Y = 13;
/** Fileira reservada para a linha de chamada, entre a linha de leitura e o topo do plano. */
const FALLBACK_ROW_Y = 27;
const LABEL_FONT_SIZE = 12;
/** Largura media por caractere em Manrope 12 px, superestimada de proposito: o anticolisao erra
 * para o lado de sobrar espaco, nunca para o lado de duas caixas se tocarem. */
const CHAR_WIDTH_FACTOR = 0.6;
const LABEL_LINE_HEIGHT = 14;
const LABEL_GAP = 4;
const POINT_BUFFER = 7;
/** Meia espessura efetiva da seta (traco mais folga) usada para testar se a caixa do rotulo cruza a marca. */
const ARROW_BUFFER = 4;
const LEGEND_SWATCH_GAP_X = 118;
const LEGEND_TEXT_GAP = 10;
/** As oito direções candidatas para afastar um rótulo do próprio ponto, testadas nesta ordem. */
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
/** Raios tentados em ordem crescente antes de desistir da vizinhança e usar linha de chamada. */
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

/** Taxa de qualificação derivada das contagens do dado (DAD-1). */
function qualBefore(item: ChannelMovement): number {
  return item.qualifiedBefore / item.leadsBefore;
}

function qualAfter(item: ChannelMovement): number {
  return item.qualifiedAfter / item.leadsAfter;
}

/** Ganho conjunto: cada real de queda no CPL pesa como um milésimo de ponto de qualificação. */
function movementScore(item: ChannelMovement): number {
  return qualAfter(item) - qualBefore(item) + (item.cplBefore - item.cplAfter) / 1000;
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

/** Amostra o segmento em 24 passos: mais barato e mais robusto que interseção analítica reta versus caixa. */
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
    rect.x >= bounds.x &&
    rect.x + rect.width <= bounds.x + bounds.width &&
    rect.y >= bounds.y &&
    rect.y + rect.height <= bounds.y + bounds.height
  );
}

interface ArrowGeometry {
  readonly item: ChannelMovement;
  readonly origin: Point;
  readonly target: Point;
  readonly tip: Point;
}

interface LabelPlacement {
  readonly item: ChannelMovement;
  readonly rect: Rect;
  readonly textAnchor: 'start' | 'middle' | 'end';
  readonly textX: number;
  readonly textY: number;
  readonly leaderFrom: Point | null;
}

/**
 * Anticolisão dos rótulos (ponto delicado do modelo, revisado em 2026-09-19): cada nome tenta 8
 * direções em 4 raios crescentes ao redor do próprio ponto de destino, na ordem de `LABEL_DIRECTIONS`,
 * e aceita a primeira caixa que não cruza nenhum rótulo já colocado, nenhum ponto de origem ou
 * destino de qualquer canal e nenhum traço de seta. Quando as 32 tentativas falham, o rótulo vira
 * uma placa numa fileira reservada acima do plano, com uma linha de chamada até o próprio ponto:
 * a resposta a um rótulo perto de traço fino é mover o texto, nunca apagar a marca com o halo
 * (exceção da marca fina na ROT-7).
 */
function placeLabels(arrows: readonly ArrowGeometry[], plotBounds: Rect): readonly LabelPlacement[] {
  const allPoints = arrows.flatMap((arrow) => [arrow.origin, arrow.target]);
  const placedRects: Rect[] = [];
  const placements: LabelPlacement[] = [];
  const overflow: ArrowGeometry[] = [];

  /* Nomes mais longos escolhem primeiro: o nome que mais precisa de espaço fica no raio menor, e o
     nome curto de um vizinho nunca toma a posição que fazia o longo ser o mais próximo do próprio ponto. */
  const byNameLength = [...arrows].sort((a, b) => b.item.name.length - a.item.name.length);
  for (const arrow of byNameLength) {
    const textWidth = estimateTextWidth(arrow.item.name);
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

    if (chosen) {
      placedRects.push(chosen.rect);
      const textX =
        chosen.anchor === 'start' ? chosen.rect.x : chosen.anchor === 'end' ? chosen.rect.x + chosen.rect.width : chosen.rect.x + chosen.rect.width / 2;
      placements.push({
        item: arrow.item,
        rect: chosen.rect,
        textAnchor: chosen.anchor,
        textX,
        textY: chosen.rect.y + chosen.rect.height / 2,
        leaderFrom: null,
      });
    } else {
      overflow.push(arrow);
    }
  }

  let cursorX = plotBounds.x;
  for (const arrow of overflow) {
    const textWidth = estimateTextWidth(arrow.item.name);
    const x = Math.max(cursorX, arrow.target.x - textWidth / 2);
    const rect: Rect = { x, y: FALLBACK_ROW_Y - LABEL_LINE_HEIGHT / 2, width: textWidth, height: LABEL_LINE_HEIGHT };
    cursorX = rect.x + rect.width + LABEL_GAP * 3;
    placements.push({ item: arrow.item, rect, textAnchor: 'start', textX: rect.x, textY: FALLBACK_ROW_Y, leaderFrom: arrow.target });
  }

  return placements;
}

export default function ChannelArrows({ data = defaultData, height, className }: ChannelArrowsProps) {
  const baseId = useId().replace(/:/g, '');
  const arrowMarkerId = `arrow-${baseId}`;
  const style = height === undefined ? undefined : { height };

  if (data.length === 0 || data.some((item) => item.leadsBefore <= 0 || item.leadsAfter <= 0)) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum canal neste recorte: não há movimento para desenhar entre os dois trimestres.</span>
      </div>
    );
  }

  const plotWidth = VIEW_W - MARGIN.left - MARGIN.right;
  const plotHeight = VIEW_H - MARGIN.top - MARGIN.bottom;
  const plotBounds: Rect = { x: MARGIN.left, y: MARGIN.top, width: plotWidth, height: plotHeight };

  const arrows: readonly ArrowGeometry[] = data.map((item) => {
    const origin = { x: scaleX(item.cplBefore, plotWidth), y: scaleY(qualBefore(item), plotHeight) };
    const target = { x: scaleX(item.cplAfter, plotWidth), y: scaleY(qualAfter(item), plotHeight) };
    const dist = Math.hypot(target.x - origin.x, target.y - origin.y);
    const tip =
      dist > ARROW_INSET
        ? { x: target.x - ((target.x - origin.x) / dist) * ARROW_INSET, y: target.y - ((target.y - origin.y) / dist) * ARROW_INSET }
        : target;
    return { item, origin, target, tip };
  });

  const placements = placeLabels(arrows, plotBounds);

  const leader = [...data].sort((a, b) => movementScore(b) - movementScore(a))[0]!;
  const summary =
    `Gráfico de dispersão com setas ligando ${String(data.length)} canais de aquisição de ${periodBeforeLabel} a ${periodAfterLabel}, ` +
    `por CPL e taxa de qualificação. ${leader.name} teve a maior melhora conjunta: CPL de ${formatCurrencyCompact(leader.cplBefore)} para ` +
    `${formatCurrencyCompact(leader.cplAfter)}, qualificação de ${formatRateWithVolume(leader.qualifiedBefore, leader.leadsBefore, 0)} para ${formatRateWithVolume(leader.qualifiedAfter, leader.leadsAfter, 0)}.`;
  const readingLine =
    `Maior melhora conjunta: ${leader.name}, CPL de ${formatCurrencyCompact(leader.cplBefore)} para ${formatCurrencyCompact(leader.cplAfter)}, ` +
    `qualificação de ${formatRateWithVolume(leader.qualifiedBefore, leader.leadsBefore, 0)} para ${formatRateWithVolume(leader.qualifiedAfter, leader.leadsAfter, 0)}`;

  return (
    <svg aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style} viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
      <defs>
        <marker id={arrowMarkerId} markerHeight={7} markerWidth={7} orient="auto" refX={6} refY={3.5} viewBox="0 0 7 7">
          <path d="M0,0 L7,3.5 L0,7 Z" fill={ARROW_COLOR} />
        </marker>
      </defs>

      {/* Linha de leitura (ANO-5): a conclusão calculada do dado, antes de qualquer marca. A frase
          acessível da raiz já diz o mesmo, por isso aria-hidden. */}
      <text aria-hidden className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={12} x={MARGIN.left} y={READING_LINE_Y}>
        {readingLine}
      </text>

      {/* Grade nos dois sentidos (EIX-3, exceção da família): as duas grandezas são posição. */}
      {TICKS_X.map((tick) => {
        const x = scaleX(tick, plotWidth);
        return (
          <g key={`grid-x-${String(tick)}`}>
            <line stroke="var(--line-subtle)" x1={x} x2={x} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />
            <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={x} y={MARGIN.top + plotHeight + 16}>
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
            <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={MARGIN.left - 8} y={y}>
              {formatPercent(tick, 0)}
            </text>
          </g>
        );
      })}

      {arrows.map((arrow) => (
        <g key={arrow.item.id}>
          <line markerEnd={`url(#${arrowMarkerId})`} stroke={ARROW_COLOR} strokeWidth={1.5} x1={arrow.origin.x} x2={arrow.tip.x} y1={arrow.origin.y} y2={arrow.tip.y} />
          <circle cx={arrow.origin.x} cy={arrow.origin.y} fill="var(--surface-raised)" r={ORIGIN_RADIUS} stroke={ARROW_COLOR} strokeWidth={1.5} />
          <circle cx={arrow.target.x} cy={arrow.target.y} fill={ARROW_COLOR} r={TARGET_RADIUS} />
        </g>
      ))}

      {/* Rótulos por anticolisão (ROT-7, exceção da marca fina): quem sai do lugar é o texto, nunca
          a seta, e por isso nenhum leva halo. */}
      {placements.map((placement) => (
        <g key={placement.item.id}>
          {placement.leaderFrom ? (
            <line
              stroke="var(--line-strong)"
              strokeDasharray="2 2"
              strokeWidth={1}
              x1={placement.leaderFrom.x}
              x2={placement.textAnchor === 'end' ? placement.rect.x + placement.rect.width : placement.rect.x}
              y1={placement.leaderFrom.y}
              y2={placement.rect.y + placement.rect.height / 2}
            />
          ) : null}
          <text
            className="font-sans"
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize={LABEL_FONT_SIZE}
            textAnchor={placement.textAnchor}
            x={placement.textX}
            y={placement.textY}
          >
            {placement.item.name}
          </text>
        </g>
      ))}

      {/* Legenda (ROT-4): o rótulo direto não distingue anel de ponto cheio, então a forma é explicada aqui. */}
      <g transform={`translate(${String(MARGIN.left)}, ${String(VIEW_H - 10)})`}>
        <circle cx={0} cy={-4} fill="var(--surface-raised)" r={ORIGIN_RADIUS} stroke={ARROW_COLOR} strokeWidth={1.5} />
        <text className="font-sans tabular-nums" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} x={LEGEND_TEXT_GAP} y={-4}>
          {periodBeforeLabel}, antes
        </text>
        <circle cx={LEGEND_SWATCH_GAP_X} cy={-4} fill={ARROW_COLOR} r={TARGET_RADIUS} />
        <text
          className="font-sans tabular-nums"
          dominantBaseline="central"
          fill="var(--text-secondary)"
          fontSize={12}
          x={LEGEND_SWATCH_GAP_X + LEGEND_TEXT_GAP}
          y={-4}
        >
          {periodAfterLabel}, depois
        </text>
      </g>
    </svg>
  );
}
