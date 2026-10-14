import { Filter } from 'lucide-react';
import { useId, useMemo } from 'react';

import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, since as defaultSince, type ClientNode } from './data';

/**
 * Grafo de rede dirigido por forças, com seta: cada cliente é um disco e cada indicação é uma seta
 * que sai de quem indicou e aponta para quem foi indicado. Serve para ver quem são os três que
 * mais indicam e quem cada um trouxe.
 *
 * Cinco decisões desta versão, e o motivo de cada uma:
 *
 * 1. O DESENHO É DETERMINÍSTICO (DAD-3). Fruchterman e Reingold com 300 iterações fixas, posição
 *    inicial sorteada por mulberry32 e semente tirada do próprio dado por FNV-1a.
 * 2. TUDO VIVE NUM `<svg>` DO TAMANHO DO CORPO, com escala 1 (GEO-18).
 * 3. O DESTAQUE NÃO MORA SÓ NA COR (TOK-9). `--chart-1` contra `--text-muted` mede 1,82:1 no
 *    escuro e 1,12:1 no claro, então os três que mais indicam também são maiores e têm nome e
 *    número escritos; a vizinhança acesa também ganha anel, traço mais grosso e nome.
 * 4. O NEUTRO É `--text-muted`, NÃO `--line-strong`. O catálogo pedia `--line-strong` nos demais
 *    nós, que mede 1,79:1 contra o cartão e some como marca (TOK-5); disco e aresta são dado e
 *    precisam de 3:1 (ACE-6).
 * 5. PESO 700 SÓ NO CLIENTE EM FOCO (TIP-3): nome e número dele. Os outros dois dos três vão em
 *    600, porque três nomes em 700 passariam do teto de dois elementos.
 */
export interface TopReferrersGraphProps {
  readonly data?: readonly ClientNode[];
  /** Id do cliente cuja vizinhança acende; `null` desenha a rede sem foco. */
  readonly highlightId?: string | null;
  /** Mês em que o registro começa, em `YYYY-MM`. */
  readonly since?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do preset `quadrado` (480x480) na moldura `card` com o caso de uso em duas linhas. */
const BODY_WIDTH = 422;
const BODY_HEIGHT = 355.5;

const TEXT_MAIN = 12;
const TEXT_NOTE = 11;
const READING_BASELINE = 12;
const LEGEND_BASELINE = 32;
/** 17.7: da linha de legenda até o gráfico. */
const PLOT_TOP = 44;
const PLOT_BOTTOM = BODY_HEIGHT;

const NODE_RADIUS = 5;
/** Raio dos que mais indicam: o tamanho é o segundo canal do destaque, não uma medida. */
const TOP_RADIUS = 8;
const TOP_COUNT = 3;
const NODE_STROKE = 1.5;
/** Anel da vizinhança acesa: distância do disco e espessura. */
const RING_OFFSET = 3;
const RING_STROKE = 1.5;
const EDGE_STROKE = 1;
const EDGE_STROKE_LIT = 2;
/** Tamanho da ponta da seta, comum e acesa. */
const ARROW = 6;
const ARROW_LIT = 8;
/** Folga entre a ponta da seta e a borda do nó de destino. */
const ARROW_GAP = 1.5;
/** Quanto a ponta da seta cobre o fim da linha, para a linha não aparecer além da ponta. */
const ARROW_OVERLAP = 1;
/** Só ganha nome o nó com este grau ou mais; o resto fica na dica. */
const LABEL_MIN_DEGREE = 5;
const LABEL_HEIGHT = 12;
const LABEL_BASELINE = 9;
/** Passo entre o nome e o número de indicados no rótulo de duas linhas. */
const LABEL_LINE_STEP = 14;
const NOTE_HEIGHT = 11;
const NOTE_BASELINE = 8.5;
const SAMPLE_GAP = 10;
const LEGEND_ITEM_GAP = 20;
const ARROW_SAMPLE = 18;

/** Fruchterman e Reingold: iterações fixas e temperatura inicial como fração da largura. */
const ITERATIONS = 300;
const START_TEMPERATURE = 0.1;
/** Força que segura as árvores soltas perto do centro; sem ela elas fogem para a borda. */
const GRAVITY = 5;
const MIN_DISTANCE_SQUARED = 0.01;
/** Quanto a caixa do desenho pode esticar num eixo além do outro para ocupar o plano. */
const MAX_STRETCH = 1.3;
/** Vão mínimo entre dois discos, e entre um disco e uma seta de que ele não é ponta. */
const NODE_GAP = 6;
const EDGE_GAP = 4;
const SEPARATE_PASSES = 60;
const SETTLE_ROUNDS = 8;
/**
 * Sal fixo que entra no hash da semente junto com a assinatura do dado. Trocar o sal troca o
 * desenho, nunca o dado: este foi o que deixou os rótulos sem seta por baixo entre os testados.
 */
const SEED_SALT = 'j';

/**
 * Avanço por glifo de Manrope, em em, na mesma tabela que a guarda COLISAO-TEXTO usa. A média por
 * classe erra de 8% a 26% para baixo em string real, e é a largura do rótulo que decide a margem.
 */
const ADVANCE: Readonly<Record<string, number>> = {
  ' ': 0.216, $: 0.589, '%': 0.891, '(': 0.437, ')': 0.437, '+': 0.52, ',': 0.2, '-': 0.433,
  '.': 0.228, '/': 0.367, '=': 0.721, A: 0.693, B: 0.641, C: 0.728, D: 0.641, E: 0.58, F: 0.462,
  G: 0.694, H: 0.732, I: 0.316, J: 0.524, K: 0.569, L: 0.513, M: 0.834, N: 0.705, O: 0.795,
  P: 0.612, Q: 0.639, R: 0.617, S: 0.611, T: 0.576, V: 0.577, W: 0.76, a: 0.567, b: 0.632,
  c: 0.526, d: 0.599, e: 0.593, f: 0.382, g: 0.579, h: 0.587, i: 0.257, j: 0.227, k: 0.667,
  l: 0.243, m: 0.822, n: 0.607, o: 0.605, p: 0.58, q: 0.543, r: 0.351, s: 0.53, t: 0.394,
  u: 0.623, v: 0.457, w: 0.625, x: 0.464, y: 0.702, z: 0.516, 'É': 0.562, 'á': 0.558, 'â': 0.497,
  'ã': 0.58, 'ç': 0.536, 'é': 0.574, 'ê': 0.618, 'í': 0.217, 'ó': 0.641, 'õ': 0.525, 'ú': 0.603,
};
const ADVANCE_FALLBACK = 0.55;
/** Sob `tabular-nums` todo dígito mede o mesmo, nas duas famílias e em todos os pesos. */
const ADVANCE_TABULAR_DIGIT = 0.62;
/** Folga por linha que cobre o p99 do erro da tabela. */
const INK_SLACK = 2;
/** O peso 600 ou 700 alarga a linha em cerca de 4% sobre a tabela, que é do peso regular. */
const BOLD_FACTOR = 1.04;

/** Largura da tinta de uma linha, em px, com dígito tabular. */
function inkWidth(text: string, size: number, bold = false): number {
  let em = 0;
  for (const glyph of text) {
    if (glyph >= '0' && glyph <= '9') {
      em += ADVANCE_TABULAR_DIGIT;
      continue;
    }
    em += ADVANCE[glyph] ?? ADVANCE_FALLBACK;
  }
  return em * size * (bold ? BOLD_FACTOR : 1) + INK_SLACK;
}

interface Point {
  x: number;
  y: number;
}

interface SimLink {
  readonly source: number;
  readonly target: number;
}

interface Box {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

interface Segment {
  readonly ax: number;
  readonly ay: number;
  readonly bx: number;
  readonly by: number;
}

/** mulberry32: gerador de 32 bits com estado próprio, sem relógio e sem sorteio do navegador. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a de 32 bits: a semente nasce do conteúdo do dado, então dado igual dá desenho igual. */
function hashSeed(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Fruchterman e Reingold. `k` é a distância ideal, raiz da área por nó; todo par se repele com
 * `k² / d`, toda aresta puxa com `d² / k`, e o passo de cada nó é limitado por uma temperatura
 * que cai em linha reta até zero. A gravidade é mais forte no eixo curto, para o conjunto assentar
 * no formato do plano em vez de num disco. O custo é quadrático: `n (n - 1) / 2` pares por passo.
 */
function simulate(count: number, links: readonly SimLink[], width: number, height: number, seed: number): Point[] {
  const random = mulberry32(seed);
  const points: Point[] = [];
  for (let i = 0; i < count; i += 1) points.push({ x: random() * width, y: random() * height });
  if (count < 2) return points.map(() => ({ x: width / 2, y: height / 2 }));
  const k = Math.sqrt((width * height) / count);
  const kSquared = k * k;
  const gravityX = (GRAVITY * height) / (width + height);
  const gravityY = (GRAVITY * width) / (width + height);
  const moves: Point[] = points.map(() => ({ x: 0, y: 0 }));
  for (let step = 0; step < ITERATIONS; step += 1) {
    const temperature = START_TEMPERATURE * width * (1 - step / ITERATIONS);
    for (let i = 0; i < count; i += 1) {
      const point = points[i];
      const move = moves[i];
      if (!point || !move) continue;
      move.x = (width / 2 - point.x) * gravityX;
      move.y = (height / 2 - point.y) * gravityY;
    }
    for (let i = 0; i < count; i += 1) {
      const a = points[i];
      const moveA = moves[i];
      if (!a || !moveA) continue;
      for (let j = i + 1; j < count; j += 1) {
        const b = points[j];
        const moveB = moves[j];
        if (!b || !moveB) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const factor = kSquared / Math.max(dx * dx + dy * dy, MIN_DISTANCE_SQUARED);
        moveA.x += dx * factor;
        moveA.y += dy * factor;
        moveB.x -= dx * factor;
        moveB.y -= dy * factor;
      }
    }
    for (const link of links) {
      const a = points[link.source];
      const b = points[link.target];
      const moveA = moves[link.source];
      const moveB = moves[link.target];
      if (!a || !b || !moveA || !moveB) continue;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const factor = Math.sqrt(dx * dx + dy * dy) / k;
      moveA.x -= dx * factor;
      moveA.y -= dy * factor;
      moveB.x += dx * factor;
      moveB.y += dy * factor;
    }
    for (let i = 0; i < count; i += 1) {
      const point = points[i];
      const move = moves[i];
      if (!point || !move) continue;
      const length = Math.sqrt(move.x * move.x + move.y * move.y);
      if (length === 0) continue;
      const limited = Math.min(length, temperature) / length;
      point.x += move.x * limited;
      point.y += move.y * limited;
    }
  }
  return points;
}

/** Leva a caixa dos centros para dentro de `box`, com esticamento limitado por eixo. */
function fitToBox(points: readonly Point[], box: Box): void {
  if (points.length === 0) return;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }
  const fullX = (box.x1 - box.x0) / Math.max(maxX - minX, 1);
  const fullY = (box.y1 - box.y0) / Math.max(maxY - minY, 1);
  const uniform = Math.min(fullX, fullY);
  const scaleX = Math.min(fullX, uniform * MAX_STRETCH);
  const scaleY = Math.min(fullY, uniform * MAX_STRETCH);
  for (const point of points) {
    point.x = (box.x0 + box.x1) / 2 + (point.x - (minX + maxX) / 2) * scaleX;
    point.y = (box.y0 + box.y1) / 2 + (point.y - (minY + maxY) / 2) * scaleY;
  }
}

/** Afasta discos que se tocam: cada par é empurrado pela metade da invasão, e ninguém sai de `box`. */
function separate(points: readonly Point[], radii: readonly number[], box: Box): void {
  for (let pass = 0; pass < SEPARATE_PASSES; pass += 1) {
    let moved = false;
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i];
      if (!a) continue;
      for (let j = i + 1; j < points.length; j += 1) {
        const b = points[j];
        if (!b) continue;
        const reach = (radii[i] ?? 0) + (radii[j] ?? 0) + NODE_GAP;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= reach) continue;
        const push = (reach - distance) / 2;
        const ux = distance === 0 ? 1 : dx / distance;
        const uy = distance === 0 ? 0 : dy / distance;
        a.x += ux * push;
        a.y += uy * push;
        b.x -= ux * push;
        b.y -= uy * push;
        moved = true;
      }
    }
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      const radius = radii[i] ?? 0;
      if (!point) continue;
      point.x = Math.min(box.x1 - radius, Math.max(box.x0 + radius, point.x));
      point.y = Math.min(box.y1 - radius, Math.max(box.y0 + radius, point.y));
    }
    if (!moved) break;
  }
}

/**
 * Tira nó de cima de aresta alheia: o disco que encosta numa aresta de que não é ponta sai pela
 * normal até abrir `EDGE_GAP`. Pousado na aresta, ele se lê como elo de uma cadeia que não existe.
 */
function clearEdges(points: readonly Point[], radii: readonly number[], links: readonly SimLink[]): boolean {
  let moved = false;
  for (const link of links) {
    const a = points[link.source];
    const b = points[link.target];
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0) continue;
    const length = Math.sqrt(lengthSquared);
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      if (!point || i === link.source || i === link.target) continue;
      const along = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared;
      if (along <= 0 || along >= 1) continue;
      const side = ((point.x - a.x) * dy - (point.y - a.y) * dx) / length;
      const reach = (radii[i] ?? 0) + EDGE_GAP;
      if (Math.abs(side) >= reach) continue;
      const push = (reach - Math.abs(side)) * (side < 0 ? -1 : 1);
      point.x += (dy / length) * push;
      point.y -= (dx / length) * push;
      moved = true;
    }
  }
  return moved;
}

/** Alterna as duas limpezas até nada mais se mexer, com teto fixo de rodadas. */
function settle(points: readonly Point[], radii: readonly number[], links: readonly SimLink[], box: Box): void {
  separate(points, radii, box);
  for (let round = 0; round < SETTLE_ROUNDS; round += 1) {
    if (!clearEdges(points, radii, links)) break;
    separate(points, radii, box);
  }
}

function boxesTouch(a: Box, b: Box, gap: number): boolean {
  return a.x0 < b.x1 + gap && b.x0 < a.x1 + gap && a.y0 < b.y1 + gap && b.y0 < a.y1 + gap;
}

function discTouchesBox(point: Point, radius: number, box: Box): boolean {
  const dx = point.x - Math.min(box.x1, Math.max(box.x0, point.x));
  const dy = point.y - Math.min(box.y1, Math.max(box.y0, point.y));
  return dx * dx + dy * dy < radius * radius;
}

/** Distância da borda do disco até a caixa; zero quando encosta. */
function gapToBox(point: Point, radius: number, box: Box): number {
  const dx = point.x - Math.min(box.x1, Math.max(box.x0, point.x));
  const dy = point.y - Math.min(box.y1, Math.max(box.y0, point.y));
  return Math.max(Math.sqrt(dx * dx + dy * dy) - radius, 0);
}

/** Liang e Barsky: o segmento passa por dentro da caixa? */
function segmentCrossesBox(segment: Segment, box: Box): boolean {
  let enter = 0;
  let leave = 1;
  const dx = segment.bx - segment.ax;
  const dy = segment.by - segment.ay;
  const sides: readonly (readonly [number, number])[] = [
    [-dx, segment.ax - box.x0],
    [dx, box.x1 - segment.ax],
    [-dy, segment.ay - box.y0],
    [dy, box.y1 - segment.ay],
  ];
  for (const [p, q] of sides) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const ratio = q / p;
    if (p < 0) enter = Math.max(enter, ratio);
    else leave = Math.min(leave, ratio);
    if (enter > leave) return false;
  }
  return true;
}

function distanceToSegment(point: Point, segment: Segment): number {
  const dx = segment.bx - segment.ax;
  const dy = segment.by - segment.ay;
  const lengthSquared = dx * dx + dy * dy;
  const along = lengthSquared === 0 ? 0 : ((point.x - segment.ax) * dx + (point.y - segment.ay) * dy) / lengthSquared;
  const t = Math.min(1, Math.max(0, along));
  const px = segment.ax + dx * t - point.x;
  const py = segment.ay + dy * t - point.y;
  return Math.sqrt(px * px + py * py);
}

function turn(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

function segmentsCross(a: Segment, b: Segment): boolean {
  const first = turn(a.ax, a.ay, a.bx, a.by, b.ax, b.ay) * turn(a.ax, a.ay, a.bx, a.by, b.bx, b.by);
  const second = turn(b.ax, b.ay, b.bx, b.by, a.ax, a.ay) * turn(b.ax, b.ay, b.bx, b.by, a.bx, a.by);
  return first < 0 && second < 0;
}

/**
 * `top`: nome e número de indicados, em duas linhas. `plain`: só o nome, em 12 px. `note`: nome
 * de vizinho aceso, em 11 px, que só entra se achar lugar limpo.
 */
type LabelKind = 'top' | 'plain' | 'note';

interface LabelRequest {
  readonly index: number;
  readonly kind: LabelKind;
  readonly width: number;
  readonly height: number;
  /** Rótulo obrigatório fica na melhor posição que houver; o opcional só entra em posição limpa. */
  readonly required: boolean;
}

interface PlacedLabel {
  readonly index: number;
  readonly kind: LabelKind;
  readonly box: Box;
  readonly anchor: 'start' | 'middle' | 'end';
  readonly x: number;
  /** Linha de chamada do nó até o rótulo, quando o rótulo precisou se afastar. */
  readonly leader: Segment | null;
}

const LABEL_GAP = 3;
const LABEL_CLEARANCE = 6;
const NODE_CLEARANCE = 2;
/** Afastamentos que o rótulo tenta ao redor do próprio nó, do mais perto ao mais longe. */
const LABEL_REACHES: readonly number[] = [0, 6, 12, 20, 30, 42, 56];
/** Afastamento a partir do qual o rótulo ganha linha de chamada. */
const LEADER_MIN_REACH = 6;
const LEADER_GAP = 2;
/** Custos da anticolisão, do pior para o mais leve. */
const COST_LABEL = 1000;
const COST_NODE = 100;
const COST_EDGE_UNDER_TEXT = 20;
const COST_LEADER_OVER_NODE = 12;
const COST_LEADER_OVER_EDGE = 0.5;
const COST_PER_PIXEL = 1 / 48;
/** Rótulo sem linha de chamada e mais perto de um nó alheio que do próprio: lê-se como nome do outro. */
const COST_AMBIGUOUS = 8;
const AMBIGUITY_MARGIN = 2;

type Candidate = readonly [x0: number, y0: number, anchor: 'start' | 'middle' | 'end', reach: number];

/**
 * Anticolisão de rótulo (GEO-4): em marca fina quem sai do lugar é o texto, nunca a marca. Cada
 * rótulo tenta oito direções em afastamentos crescentes ao redor do próprio nó e fica com a
 * posição de menor custo: não toca nó, não toca rótulo já posto e não tem aresta por baixo.
 * Afastado, ganha linha de chamada. Nenhum rótulo leva halo, que apagaria a aresta.
 */
function placeLabels(
  requests: readonly LabelRequest[],
  points: readonly Point[],
  radii: readonly number[],
  segments: readonly Segment[],
  bounds: Box,
): PlacedLabel[] {
  const placed: PlacedLabel[] = [];
  for (const request of requests) {
    const point = points[request.index];
    if (!point) continue;
    const radius = radii[request.index] ?? 0;
    const { width, height } = request;
    const candidates: Candidate[] = [];
    for (const reach of LABEL_REACHES) {
      const offset = radius + LABEL_GAP + reach;
      const diagonal = offset * 0.71;
      candidates.push(
        [point.x - width / 2, point.y + offset, 'middle', reach],
        [point.x - width / 2, point.y - offset - height, 'middle', reach],
        [point.x + offset, point.y - height / 2, 'start', reach],
        [point.x - offset - width, point.y - height / 2, 'end', reach],
        [point.x + diagonal, point.y + diagonal, 'start', reach],
        [point.x + diagonal, point.y - diagonal - height, 'start', reach],
        [point.x - diagonal - width, point.y + diagonal, 'end', reach],
        [point.x - diagonal - width, point.y - diagonal - height, 'end', reach],
      );
    }
    let best: PlacedLabel | null = null;
    let bestCost = Infinity;
    for (const [x0, y0, anchor, reach] of candidates) {
      const box: Box = { x0, y0, x1: x0 + width, y1: y0 + height };
      if (box.x0 < bounds.x0 || box.x1 > bounds.x1 || box.y0 < bounds.y0 || box.y1 > bounds.y1) continue;
      let cost = reach * COST_PER_PIXEL;
      for (let i = 0; i < points.length; i += 1) {
        const other = points[i];
        if (other && discTouchesBox(other, (radii[i] ?? 0) + NODE_CLEARANCE, box)) cost += COST_NODE;
      }
      for (const segment of segments) if (segmentCrossesBox(segment, box)) cost += COST_EDGE_UNDER_TEXT;
      const nearX = Math.min(box.x1, Math.max(box.x0, point.x));
      const nearY = Math.min(box.y1, Math.max(box.y0, point.y));
      const dx = nearX - point.x;
      const dy = nearY - point.y;
      const span = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const leader: Segment | null =
        reach < LEADER_MIN_REACH
          ? null
          : {
              ax: point.x + (dx / span) * (radius + 1),
              ay: point.y + (dy / span) * (radius + 1),
              bx: nearX - (dx / span) * LEADER_GAP,
              by: nearY - (dy / span) * LEADER_GAP,
            };
      if (leader === null) {
        const ownGap = gapToBox(point, radius, box);
        for (let i = 0; i < points.length; i += 1) {
          const other = points[i];
          if (!other || i === request.index) continue;
          if (gapToBox(other, radii[i] ?? 0, box) >= ownGap + AMBIGUITY_MARGIN) continue;
          cost += COST_AMBIGUOUS;
          break;
        }
      }
      for (const label of placed) {
        if (boxesTouch(box, label.box, LABEL_CLEARANCE)) cost += COST_LABEL;
        if (leader && segmentCrossesBox(leader, label.box)) cost += COST_LABEL;
        if (label.leader && segmentCrossesBox(label.leader, box)) cost += COST_LABEL;
        if (leader && label.leader && segmentsCross(leader, label.leader)) cost += COST_NODE;
      }
      if (leader) {
        for (let i = 0; i < points.length; i += 1) {
          const other = points[i];
          if (!other || i === request.index) continue;
          if (distanceToSegment(other, leader) < (radii[i] ?? 0) + NODE_CLEARANCE) cost += COST_LEADER_OVER_NODE;
        }
        for (const segment of segments) if (segmentsCross(leader, segment)) cost += COST_LEADER_OVER_EDGE;
      }
      if (cost >= bestCost) continue;
      bestCost = cost;
      const x = anchor === 'middle' ? x0 + width / 2 : anchor === 'start' ? x0 : x0 + width;
      best = { index: request.index, kind: request.kind, box, anchor, x, leader };
    }
    if (best && (request.required || bestCost < COST_EDGE_UNDER_TEXT)) placed.push(best);
  }
  return placed;
}

interface DrawnNode {
  readonly id: string;
  readonly name: string;
  /** Indicações feitas e recebidas. */
  readonly made: number;
  readonly received: number;
  /** Nome de quem indicou este cliente, ou `null` se ele entrou sem indicação. */
  readonly referrer: string | null;
  readonly top: boolean;
  readonly focus: boolean;
  readonly lit: boolean;
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

interface DrawnEdge {
  readonly key: string;
  readonly ax: number;
  readonly ay: number;
  readonly bx: number;
  readonly by: number;
  readonly lit: boolean;
}

interface Layout {
  readonly nodes: readonly DrawnNode[];
  readonly edges: readonly DrawnEdge[];
  readonly labels: readonly PlacedLabel[];
  /** Os que mais indicam, do maior para o menor, com empate decidido pelo id. */
  readonly top: readonly DrawnNode[];
  readonly focus: DrawnNode | null;
}

/** Assinatura textual do dado: é ela que entra no hash da semente e na dependência do `useMemo`. */
function signatureOf(data: readonly ClientNode[]): string {
  return data.map((node) => `${node.id}>${node.referred.join(',')}`).join('|');
}

/**
 * `valueText` escreve o número de indicados do rótulo: entra por parâmetro para a geometria medir
 * a mesma string que a tela imprime, sem depender do formatador.
 */
function buildLayout(data: readonly ClientNode[], highlightId: string | undefined, valueText: (count: number) => string): Layout {
  const indexOf = new Map(data.map((node, index) => [node.id, index]));
  const links: SimLink[] = [];
  // Adjacência em Map de Set: a vizinhança de um nó sai direto, sem varrer as arestas a cada foco.
  const adjacency = new Map<string, Set<string>>(data.map((node) => [node.id, new Set<string>()]));
  const made = data.map(() => 0);
  const received = data.map(() => 0);
  const referrer: (string | null)[] = data.map(() => null);
  for (const [source, node] of data.entries()) {
    for (const id of node.referred) {
      const target = indexOf.get(id);
      if (target === undefined || target === source) continue;
      links.push({ source, target });
      adjacency.get(node.id)?.add(id);
      adjacency.get(id)?.add(node.id);
      made[source] = (made[source] ?? 0) + 1;
      received[target] = (received[target] ?? 0) + 1;
      referrer[target] = referrer[target] ?? node.name;
    }
  }
  const ranked = data
    .map((node, index) => ({ id: node.id, index, made: made[index] ?? 0 }))
    .filter((entry) => entry.made > 0)
    .sort((a, b) => b.made - a.made || a.id.localeCompare(b.id))
    .slice(0, TOP_COUNT);
  const topSet = new Set(ranked.map((entry) => entry.index));
  const focusIndex = highlightId === undefined ? undefined : indexOf.get(highlightId);
  const neighbours = highlightId === undefined ? undefined : adjacency.get(highlightId);
  const isLit = (index: number): boolean => neighbours?.has(data[index]?.id ?? '') ?? false;
  const hasRing = (index: number): boolean => index === focusIndex || isLit(index);

  const radii = data.map((_, index) => (topSet.has(index) ? TOP_RADIUS : NODE_RADIUS));
  // O raio que ocupa espaço inclui o anel: é ele que afasta seta e rótulo de quem está aceso.
  const outer = radii.map((radius, index) => radius + (hasRing(index) ? RING_OFFSET + RING_STROKE / 2 : 0));
  // Na limpeza o espaço do anel é reservado para TODOS os nós, acesos ou não: assim a posição não
  // depende do foco, e trocar o `highlightId` acende outra vizinhança sem mexer no desenho.
  const reserved = radii.map((radius) => radius + RING_OFFSET + RING_STROKE / 2);

  const requests: LabelRequest[] = [];
  const queued = new Set<number>();
  const queue = (index: number, kind: LabelKind, required: boolean): void => {
    const node = data[index];
    if (!node || queued.has(index)) return;
    queued.add(index);
    if (kind === 'top') {
      const width = Math.max(inkWidth(node.name, TEXT_MAIN, true), inkWidth(valueText(made[index] ?? 0), TEXT_MAIN, true));
      requests.push({ index, kind, width, height: LABEL_HEIGHT + LABEL_LINE_STEP, required });
    } else if (kind === 'plain') {
      requests.push({ index, kind, width: inkWidth(node.name, TEXT_MAIN, true), height: LABEL_HEIGHT, required });
    } else {
      requests.push({ index, kind, width: inkWidth(node.name, TEXT_NOTE), height: NOTE_HEIGHT, required });
    }
  };
  for (const entry of ranked) queue(entry.index, 'top', true);
  for (const [index] of data.entries()) {
    if ((made[index] ?? 0) + (received[index] ?? 0) >= LABEL_MIN_DEGREE) queue(index, 'plain', true);
  }
  // Margem para o maior rótulo que NÃO depende do foco: centrado num nó da borda, ele ainda cabe
  // no plano, e a caixa da simulação continua a mesma quando o foco troca.
  const widest = requests.reduce((max, request) => Math.max(max, request.width), 0);
  if (focusIndex !== undefined) queue(focusIndex, 'plain', true);
  for (const [index] of data.entries()) if (isLit(index)) queue(index, 'note', false);

  const marginX = Math.max(TOP_RADIUS, widest / 2);
  const marginY = TOP_RADIUS + RING_OFFSET + RING_STROKE;
  const plot: Box = { x0: 0, y0: PLOT_TOP, x1: BODY_WIDTH, y1: PLOT_BOTTOM };
  const inner: Box = { x0: marginX, y0: PLOT_TOP + marginY, x1: BODY_WIDTH - marginX, y1: PLOT_BOTTOM - marginY };

  const seed = hashSeed(`${SEED_SALT}|${signatureOf(data)}`);
  const points = simulate(data.length, links, inner.x1 - inner.x0, inner.y1 - inner.y0, seed);
  fitToBox(points, inner);
  settle(points, reserved, links, plot);

  const segments: Segment[] = [];
  const edges: DrawnEdge[] = [];
  for (const link of links) {
    const a = points[link.source];
    const b = points[link.target];
    const from = data[link.source];
    const to = data[link.target];
    if (!a || !b || !from || !to) continue;
    segments.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y });
    const lit = from.id === highlightId || to.id === highlightId;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    // Recuo pelo raio do nó de destino: a ponta da seta para na borda do disco (ou do anel), não no
    // centro, e a linha acaba antes, para a ponta cobrir o fim dela.
    const start = outer[link.source] ?? 0;
    const stop = (outer[link.target] ?? 0) + ARROW_GAP + (lit ? ARROW_LIT : ARROW) - ARROW_OVERLAP;
    const visible = Math.max(length - start - stop, 0.01);
    const ux = dx / length;
    const uy = dy / length;
    edges.push({
      key: `${from.id}-${to.id}`,
      ax: a.x + ux * start,
      ay: a.y + uy * start,
      bx: a.x + ux * (start + visible),
      by: a.y + uy * (start + visible),
      lit,
    });
  }
  const labels = placeLabels(requests, points, outer, segments, plot);

  const nodes: DrawnNode[] = data.map((node, index) => ({
    id: node.id,
    name: node.name,
    made: made[index] ?? 0,
    received: received[index] ?? 0,
    referrer: referrer[index] ?? null,
    top: topSet.has(index),
    focus: index === focusIndex,
    lit: isLit(index),
    x: points[index]?.x ?? 0,
    y: points[index]?.y ?? 0,
    r: radii[index] ?? 0,
  }));
  const top = ranked.map((entry) => nodes[entry.index]).filter((node): node is DrawnNode => node !== undefined);
  return { nodes, edges, labels, top, focus: focusIndex === undefined ? null : (nodes[focusIndex] ?? null) };
}

// Fim da geometria pura: daqui para baixo, texto de tela e React.

/** "1 cliente" no singular, "N clientes" no plural: a contagem nunca sai crua (NUM-6). */
function clientsLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'cliente' : 'clientes'}`;
}

function referralsLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'indicação' : 'indicações'}`;
}

function indicatedLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'indicado' : 'indicados'}`;
}

function linksLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'ligação direta' : 'ligações diretas'}`;
}

/** "a, b e c": a enumeração da frase na mesma ordem em que os nós foram classificados. */
function joinList(parts: readonly string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1] ?? ''}`;
}

export default function TopReferrersGraph({
  data = defaultData,
  highlightId = defaultHighlightId,
  since = defaultSince,
  height,
  className,
}: TopReferrersGraphProps) {
  const baseId = useId().replace(/:/g, '');
  const arrowId = `arrow-${baseId}`;
  const arrowLitId = `arrow-lit-${baseId}`;
  const focusId = highlightId ?? undefined;
  // O foco e os nomes entram na chave do memo, porque mudam anel e largura de rótulo; na semente
  // só entra a assinatura das ligações, então a simulação é a mesma com qualquer foco.
  const signature = `${focusId ?? ''}|${signatureOf(data)}#${data.map((node) => node.name).join('|')}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- a assinatura textual é a dependência real
  const layout = useMemo(() => buildLayout(data, focusId, indicatedLabel), [signature]);
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cliente neste recorte: não há indicação para desenhar.</span>
      </div>
    );
  }

  const total = layout.edges.length;
  const topMade = layout.top.reduce((sum, node) => sum + node.made, 0);
  const sinceLabel = formatMonthShort(since);
  const focus = layout.focus;
  const topSentence =
    layout.top.length === 0
      ? ''
      : `Os ${formatInt(layout.top.length)} que mais indicam fizeram ${formatInt(topMade)} das ${referralsLabel(total)}: ${joinList(
          layout.top.map((node) => `${node.name} ${formatInt(node.made)}`),
        )}.`;

  const summary = [
    `Grafo de rede dirigido com ${clientsLabel(layout.nodes.length)} e ${referralsLabel(total)} desde ${sinceLabel}.`,
    topSentence,
    focus === null ? '' : `Em foco, ${focus.name}, com ${linksLabel(focus.made + focus.received)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const arrowText = 'aponta para quem foi indicado';
  const ringSampleX = ARROW_SAMPLE + SAMPLE_GAP + inkWidth(arrowText, TEXT_MAIN) + LEGEND_ITEM_GAP;
  const sampleY = LEGEND_BASELINE - 4;

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="figure" style={style}>
      <svg className="h-full w-full" viewBox={`0 0 ${String(BODY_WIDTH)} ${String(BODY_HEIGHT)}`}>
        {/* Setas por marker: `orient="auto"` gira a ponta na direção da aresta, e o id vem do useId. */}
        <defs>
          <marker id={arrowId} markerHeight={ARROW} markerUnits="userSpaceOnUse" markerWidth={ARROW} orient="auto" refX={ARROW_OVERLAP} refY={ARROW / 2}>
            <path d={`M0,0 L${String(ARROW)},${String(ARROW / 2)} L0,${String(ARROW)} Z`} fill="var(--text-muted)" />
          </marker>
          <marker id={arrowLitId} markerHeight={ARROW_LIT} markerUnits="userSpaceOnUse" markerWidth={ARROW_LIT} orient="auto" refX={ARROW_OVERLAP} refY={ARROW_LIT / 2}>
            <path d={`M0,0 L${String(ARROW_LIT)},${String(ARROW_LIT / 2)} L0,${String(ARROW_LIT)} Z`} fill="var(--chart-1)" />
          </marker>
        </defs>

        {/* Linha de leitura (ANO-5): a conclusão, calculada do dado, em uma linha só. */}
        <text aria-hidden className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={TEXT_MAIN} x={0} y={READING_BASELINE}>
          {layout.top.length === 0 ? (
            'Nenhuma indicação registrada entre estes clientes.'
          ) : (
            <>
              {`Os ${formatInt(layout.top.length)} que mais indicam fizeram `}
              <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
                {`${formatInt(topMade)} das ${referralsLabel(total)}`}
              </tspan>
              {` desde ${sinceLabel}.`}
            </>
          )}
        </text>

        {/* Legenda do que o rótulo direto não diz: o sentido da seta e o que o anel marca. */}
        <line markerEnd={`url(#${arrowId})`} stroke="var(--text-muted)" strokeWidth={EDGE_STROKE} x1={0} x2={ARROW_SAMPLE - ARROW + ARROW_OVERLAP} y1={sampleY} y2={sampleY} />
        <text className="font-sans" fill="var(--text-secondary)" fontSize={TEXT_MAIN} x={ARROW_SAMPLE + SAMPLE_GAP} y={LEGEND_BASELINE}>
          {arrowText}
        </text>
        {focus === null ? null : (
          <>
            <circle aria-hidden cx={ringSampleX + NODE_RADIUS + RING_OFFSET} cy={sampleY} fill="var(--text-muted)" r={NODE_RADIUS} />
            <circle aria-hidden cx={ringSampleX + NODE_RADIUS + RING_OFFSET} cy={sampleY} fill="none" r={NODE_RADIUS + RING_OFFSET} stroke="var(--chart-1)" strokeWidth={RING_STROKE} />
            <text className="font-sans" fill="var(--text-secondary)" fontSize={TEXT_MAIN} x={ringSampleX + 2 * (NODE_RADIUS + RING_OFFSET) + SAMPLE_GAP} y={LEGEND_BASELINE}>
              {`ligado a ${focus.name}`}
            </text>
          </>
        )}

        {/* Setas ANTES dos nós. A acesa é mais grossa além de ciano: a cor sozinha não a separa da
            neutra no tema claro (TOK-9). */}
        {layout.edges.map((edge) => (
          <line
            key={edge.key}
            markerEnd={`url(#${edge.lit ? arrowLitId : arrowId})`}
            stroke={edge.lit ? 'var(--chart-1)' : 'var(--text-muted)'}
            strokeWidth={edge.lit ? EDGE_STROKE_LIT : EDGE_STROKE}
            x1={edge.ax}
            x2={edge.bx}
            y1={edge.ay}
            y2={edge.by}
          />
        ))}

        {/* A dica acrescenta o que o corpo não escreve nó a nó: quantos indicou e quem o indicou. */}
        {layout.nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              fill={node.top ? 'var(--chart-1)' : 'var(--text-muted)'}
              r={node.r}
              stroke="var(--surface-raised)"
              strokeWidth={NODE_STROKE}
            >
              <title>
                {`${node.name}: ${indicatedLabel(node.made)}, ${node.referrer === null ? 'entrou sem indicação' : `veio por indicação de ${node.referrer}`}`}
              </title>
            </circle>
            {node.focus || node.lit ? (
              <circle aria-hidden cx={node.x} cy={node.y} fill="none" r={node.r + RING_OFFSET} stroke="var(--chart-1)" strokeWidth={RING_STROKE} />
            ) : null}
          </g>
        ))}

        {/* Rótulo sem halo (GEO-4). Peso 700 só no nome e no número do cliente em foco (TIP-3). */}
        {layout.labels.map((label) => {
          const node = layout.nodes[label.index];
          if (node === undefined) return null;
          const note = label.kind === 'note';
          return (
            <g key={node.id}>
              {label.leader === null ? null : (
                <line
                  stroke="var(--text-secondary)"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                  x1={label.leader.ax}
                  x2={label.leader.bx}
                  y1={label.leader.ay}
                  y2={label.leader.by}
                />
              )}
              <text
                className="font-sans"
                fill={note ? 'var(--text-muted)' : node.top || node.focus ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={note ? TEXT_NOTE : TEXT_MAIN}
                fontWeight={note ? 400 : node.focus ? 700 : node.top ? 600 : 500}
                textAnchor={label.anchor}
                x={label.x}
                y={label.box.y0 + (note ? NOTE_BASELINE : LABEL_BASELINE)}
              >
                {node.name}
              </text>
              {label.kind === 'top' ? (
                <text
                  className="font-display"
                  fill={node.focus ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={TEXT_MAIN}
                  fontWeight={node.focus ? 700 : 500}
                  textAnchor={label.anchor}
                  x={label.x}
                  y={label.box.y0 + LABEL_BASELINE + LABEL_LINE_STEP}
                >
                  {indicatedLabel(node.made)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
