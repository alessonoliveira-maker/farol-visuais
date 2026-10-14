import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { formatInt, formatMonthShort, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, since as defaultSince, type ClientNode } from './data';

/**
 * Grafo de rede dirigido por forças com os isolados fora da simulação: quem tem indicação entra no
 * desenho por forças, e quem não indicou nem foi indicado vai para uma faixa própria, em grade.
 * Serve para ver quantos clientes estão fora da rede e quem são, sem espalhá-los pela borda.
 *
 * Cinco decisões desta versão, e o motivo de cada uma:
 *
 * 1. O DESENHO É DETERMINÍSTICO (DAD-3). Fruchterman e Reingold com 300 iterações fixas, posição
 *    inicial sorteada por mulberry32 e semente tirada do próprio dado por FNV-1a.
 * 2. TUDO VIVE NUM `<svg>` DO TAMANHO DO CORPO, com escala 1 (GEO-18).
 * 3. ISOLADO NÃO ENTRA NA SIMULAÇÃO. Sem aresta que o puxe, a repulsão o joga para a borda e ele
 *    vira moldura do desenho. Aqui ele sai antes da conta e vai para a faixa de baixo, com título,
 *    contagem e nome; a marca dele é vazada, e a do cliente ligado é cheia (ACE-2).
 * 4. CADA COMPONENTE TEM A SUA CÉLULA. O maior fica com a esquerda e os pequenos vão em grade à
 *    direita, separados por espaço e nunca por moldura (ESP-5). A escala de cada célula tem teto,
 *    para um par sozinho não se esticar até encher a célula inteira.
 * 5. A LISTA DE LIGAÇÕES É ACESSÍVEL. As arestas formam uma lista (`role="list"`) e cada uma diz
 *    quem indicou quem, que é a alternativa ao desenho para quem não o vê.
 */
export interface IsolatedClientsGraphProps {
  readonly data?: readonly ClientNode[];
  /** Mês em que o registro começa, em `YYYY-MM`. */
  readonly since?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do preset `alto` (640x560) na moldura `card` com o caso de uso em duas linhas. */
const BODY_WIDTH = 574;
const BODY_HEIGHT = 425;

const TEXT_MAIN = 12;
const TEXT_NOTE = 11;
const READING_BASELINE = 12;
const CAPTION_BASELINE = 34;
/** 17.7: da linha de título da rede até o gráfico. */
const PLOT_TOP = 44;

const NODE_RADIUS = 5;
const NODE_STROKE = 1.5;
/** Contorno do nó isolado: vazado, para ausência de ligação não se ler como nó da rede. */
const HOLLOW_STROKE = 1.5;
const EDGE_STROKE = 1;
/** Só ganha nome o nó ligado com este grau ou mais; o resto fica na dica. */
const LABEL_MIN_DEGREE = 4;
const LABEL_HEIGHT = 12;
const LABEL_BASELINE = 9;

/** Faixa dos isolados: altura do título, vão até a grade, passo de linha e vão até a rede. */
const STRIP_TITLE_HEIGHT = 16;
const STRIP_TITLE_GAP = 6;
const STRIP_ROW = 16;
const STRIP_GAP = 16;
/** 17.7: da amostra até o texto. */
const SAMPLE_GAP = 10;
const COLUMN_GAP = 16;
/** Do centro da linha da grade até a linha de base do nome de 12 px. */
const ROW_BASELINE_SHIFT = 4;

/** Vão entre o componente principal e a grade dos pequenos, e respiro de cada célula. */
const COMPONENT_GAP = 28;
const CELL_PAD = 12;
/** Fatia da largura que o maior componente pode ocupar quando existem outros. */
const MAIN_SHARE_MIN = 0.5;
const MAIN_SHARE_MAX = 0.72;
/** A partir de quantos componentes pequenos a grade lateral ganha a segunda coluna. */
const SIDE_TWO_COLUMNS_FROM = 4;
/** Teto do comprimento médio de aresta depois do encaixe na célula. */
const EDGE_TARGET = 40;

/** Fruchterman e Reingold: iterações fixas e temperatura inicial como fração da largura. */
const ITERATIONS = 300;
const START_TEMPERATURE = 0.1;
/** Força que segura o componente perto do centro da célula dele. */
const GRAVITY = 5;
const MIN_DISTANCE_SQUARED = 0.01;
/** Quanto a caixa do desenho pode esticar num eixo além do outro para ocupar a célula. */
const MAX_STRETCH = 1.3;
/** Vão mínimo entre dois discos, e entre um disco e uma aresta de que ele não é ponta. */
const NODE_GAP = 6;
const EDGE_GAP = 4;
const SEPARATE_PASSES = 60;
const SETTLE_ROUNDS = 8;
/**
 * Sal fixo que entra no hash da semente junto com a assinatura do dado. Trocar o sal troca o
 * desenho, nunca o dado: este foi o que deu menos cruzamento de aresta entre os testados.
 */
const SEED_SALT = 'i';

/**
 * Avanço por glifo de Manrope, em em, na mesma tabela que a guarda COLISAO-TEXTO usa. A média por
 * classe erra de 8% a 26% para baixo em string real, e é a largura do maior nome que decide
 * quantas colunas a faixa dos isolados tem.
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
/** O peso 600 alarga a linha em cerca de 4% sobre a tabela, que é do peso regular. */
const BOLD_FACTOR = 1.04;

/** Largura da tinta de uma linha, em px, com dígito tabular. */
function inkWidth(text: string, size: number): number {
  let em = 0;
  for (const glyph of text) {
    if (glyph >= '0' && glyph <= '9') {
      em += ADVANCE_TABULAR_DIGIT;
      continue;
    }
    em += ADVANCE[glyph] ?? ADVANCE_FALLBACK;
  }
  return em * size + INK_SLACK;
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

/**
 * Leva a caixa dos centros para dentro de `box`, com esticamento limitado por eixo e escala
 * limitada por `maxScale`, que é o que impede o componente pequeno de encher a célula.
 */
function fitToBox(points: readonly Point[], box: Box, maxScale: number): void {
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
  const uniform = Math.min(fullX, fullY, maxScale);
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

interface LabelRequest {
  readonly index: number;
  readonly width: number;
  readonly height: number;
}

interface PlacedLabel {
  readonly index: number;
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
      best = { index: request.index, box, anchor, x, leader };
    }
    if (best) placed.push(best);
  }
  return placed;
}

interface DrawnNode {
  readonly id: string;
  readonly name: string;
  /** Indicações feitas e recebidas. */
  readonly made: number;
  readonly received: number;
  readonly x: number;
  readonly y: number;
}

interface DrawnEdge {
  readonly key: string;
  readonly ax: number;
  readonly ay: number;
  readonly bx: number;
  readonly by: number;
  /** A ligação por extenso, origem e destino: é o item da lista acessível. */
  readonly label: string;
}

interface StripItem {
  readonly id: string;
  readonly name: string;
  readonly cx: number;
  readonly cy: number;
}

interface Layout {
  /** Só os clientes ligados; o isolado não é nó do desenho por forças. */
  readonly nodes: readonly DrawnNode[];
  readonly edges: readonly DrawnEdge[];
  /** `index` do rótulo aponta para `nodes`. */
  readonly labels: readonly PlacedLabel[];
  readonly strip: readonly StripItem[];
  readonly stripTop: number;
  /** Componentes conexos com dois clientes ou mais, e o tamanho do maior. */
  readonly groups: number;
  readonly largest: number;
}

/** Assinatura textual do dado: é ela que entra no hash da semente e na dependência do `useMemo`. */
function signatureOf(data: readonly ClientNode[]): string {
  return data.map((node) => `${node.id}:${node.name}>${node.referred.join(',')}`).join('|');
}

/** Componentes conexos por busca em largura, na ordem do dado; o maior vem primeiro. */
function componentsOf(count: number, links: readonly SimLink[]): number[][] {
  const neighbours: number[][] = Array.from({ length: count }, () => []);
  for (const link of links) {
    neighbours[link.source]?.push(link.target);
    neighbours[link.target]?.push(link.source);
  }
  const seen = new Set<number>();
  const groups: number[][] = [];
  for (let start = 0; start < count; start += 1) {
    if (seen.has(start)) continue;
    const group = [start];
    seen.add(start);
    for (let cursor = 0; cursor < group.length; cursor += 1) {
      for (const next of neighbours[group[cursor] ?? -1] ?? []) {
        if (seen.has(next)) continue;
        seen.add(next);
        group.push(next);
      }
    }
    groups.push(group);
  }
  return groups.sort((a, b) => b.length - a.length || (a[0] ?? 0) - (b[0] ?? 0));
}

function buildLayout(data: readonly ClientNode[]): Layout {
  const indexOf = new Map(data.map((node, index) => [node.id, index]));
  const allLinks: SimLink[] = [];
  const made = data.map(() => 0);
  const received = data.map(() => 0);
  for (const [source, node] of data.entries()) {
    for (const id of node.referred) {
      const target = indexOf.get(id);
      if (target === undefined || target === source) continue;
      allLinks.push({ source, target });
      made[source] = (made[source] ?? 0) + 1;
      received[target] = (received[target] ?? 0) + 1;
    }
  }
  const components = componentsOf(data.length, allLinks);
  const groups = components.filter((group) => group.length > 1);

  // Faixa dos isolados: fora da simulação, em grade, com as colunas tiradas do maior nome.
  const loners = components
    .filter((group) => group.length === 1)
    .map((group) => data[group[0] ?? -1])
    .filter((node): node is ClientNode => node !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id));
  const widestName = loners.reduce((max, node) => Math.max(max, inkWidth(node.name, TEXT_MAIN)), 0);
  const columnWidth = 2 * NODE_RADIUS + SAMPLE_GAP + widestName;
  const columns = Math.max(1, Math.floor((BODY_WIDTH + COLUMN_GAP) / (columnWidth + COLUMN_GAP)));
  const columnStep = (BODY_WIDTH + COLUMN_GAP) / columns;
  const rows = Math.ceil(loners.length / columns);
  const stripTop = loners.length === 0 ? BODY_HEIGHT : BODY_HEIGHT - (STRIP_TITLE_HEIGHT + STRIP_TITLE_GAP + rows * STRIP_ROW);
  const plotBottom = loners.length === 0 ? BODY_HEIGHT : stripTop - STRIP_GAP;
  const strip: StripItem[] = loners.map((node, order) => ({
    id: node.id,
    name: node.name,
    cx: (order % columns) * columnStep + NODE_RADIUS,
    cy: stripTop + STRIP_TITLE_HEIGHT + STRIP_TITLE_GAP + Math.floor(order / columns) * STRIP_ROW + STRIP_ROW / 2,
  }));

  // Células: o maior componente à esquerda, os pequenos em grade à direita, separados por espaço.
  const linkedCount = groups.reduce((sum, group) => sum + group.length, 0);
  const main = groups[0] ?? [];
  const small = groups.slice(1);
  const share = Math.min(MAIN_SHARE_MAX, Math.max(MAIN_SHARE_MIN, main.length / Math.max(linkedCount, 1)));
  const mainWidth = small.length === 0 ? BODY_WIDTH : (BODY_WIDTH - COMPONENT_GAP) * share;
  const sideX = mainWidth + COMPONENT_GAP;
  const sideColumns = small.length >= SIDE_TWO_COLUMNS_FROM ? 2 : 1;
  const sideRows = Math.max(1, Math.ceil(small.length / sideColumns));
  const cellWidth = (BODY_WIDTH - sideX) / sideColumns;
  const cellHeight = (plotBottom - PLOT_TOP) / sideRows;
  const cells: Box[] = [{ x0: 0, y0: PLOT_TOP, x1: mainWidth, y1: plotBottom }];
  for (const [order] of small.entries()) {
    const x0 = sideX + (order % sideColumns) * cellWidth;
    const y0 = PLOT_TOP + Math.floor(order / sideColumns) * cellHeight;
    cells.push({ x0, y0, x1: x0 + cellWidth, y1: y0 + cellHeight });
  }

  // `linked` guarda os índices do dado que entram no desenho; daqui em diante tudo é posição nela.
  const linked = groups.flat().sort((a, b) => a - b);
  const positionOf = new Map(linked.map((index, position) => [index, position]));
  const points: Point[] = linked.map(() => ({ x: 0, y: 0 }));
  const radii = linked.map(() => NODE_RADIUS);
  const seed = hashSeed(`${SEED_SALT}|${signatureOf(data)}`);
  for (const [order, group] of groups.entries()) {
    const cell = cells[order];
    if (!cell) continue;
    const local = new Map(group.map((index, position) => [index, position]));
    const own: SimLink[] = [];
    for (const link of allLinks) {
      const source = local.get(link.source);
      const target = local.get(link.target);
      if (source !== undefined && target !== undefined) own.push({ source, target });
    }
    const inner: Box = { x0: cell.x0 + CELL_PAD, y0: cell.y0 + CELL_PAD, x1: cell.x1 - CELL_PAD, y1: cell.y1 - CELL_PAD };
    const placed = simulate(group.length, own, inner.x1 - inner.x0, inner.y1 - inner.y0, seed + order);
    let lengthSum = 0;
    for (const link of own) {
      const a = placed[link.source];
      const b = placed[link.target];
      if (a && b) lengthSum += Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    }
    const meanLength = own.length === 0 ? 1 : lengthSum / own.length;
    fitToBox(placed, inner, EDGE_TARGET / Math.max(meanLength, 1));
    settle(placed, group.map(() => NODE_RADIUS), own, cell);
    for (const [position, index] of group.entries()) {
      const target = points[positionOf.get(index) ?? -1];
      const source = placed[position];
      if (!target || !source) continue;
      target.x = source.x;
      target.y = source.y;
    }
  }

  const segments: Segment[] = [];
  const edges: DrawnEdge[] = [];
  for (const link of allLinks) {
    const a = points[positionOf.get(link.source) ?? -1];
    const b = points[positionOf.get(link.target) ?? -1];
    const from = data[link.source];
    const to = data[link.target];
    if (!a || !b || !from || !to) continue;
    segments.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y });
    edges.push({ key: `${from.id}-${to.id}`, ax: a.x, ay: a.y, bx: b.x, by: b.y, label: `${from.name} indicou ${to.name}` });
  }
  const nodes: DrawnNode[] = [];
  for (const [position, index] of linked.entries()) {
    const node = data[index];
    const point = points[position];
    if (!node || !point) continue;
    nodes.push({ id: node.id, name: node.name, made: made[index] ?? 0, received: received[index] ?? 0, x: point.x, y: point.y });
  }
  const degreeOf = (position: number): number => (nodes[position]?.made ?? 0) + (nodes[position]?.received ?? 0);
  const requests: LabelRequest[] = nodes
    .map((_, position) => position)
    .filter((position) => degreeOf(position) >= LABEL_MIN_DEGREE)
    .sort((a, b) => degreeOf(b) - degreeOf(a) || a - b)
    .map((position) => ({ index: position, width: inkWidth(nodes[position]?.name ?? '', TEXT_MAIN), height: LABEL_HEIGHT }));
  const labels = placeLabels(requests, points, radii, segments, { x0: 0, y0: PLOT_TOP, x1: BODY_WIDTH, y1: plotBottom });
  return { nodes, edges, labels, strip, stripTop, groups: groups.length, largest: main.length };
}

// Fim da geometria pura: daqui para baixo, texto de tela e React.

/** "1 cliente" no singular, "N clientes" no plural: a contagem nunca sai crua (NUM-6). */
function clientsLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'cliente' : 'clientes'}`;
}

function referralsLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'indicação' : 'indicações'}`;
}

function groupsLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'grupo' : 'grupos'}`;
}

export default function IsolatedClientsGraph({ data = defaultData, since = defaultSince, height, className }: IsolatedClientsGraphProps) {
  const signature = signatureOf(data);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- a assinatura textual é a dependência real
  const layout = useMemo(() => buildLayout(data), [signature]);
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cliente neste recorte: não há rede nem cliente isolado para mostrar.</span>
      </div>
    );
  }

  const total = data.length;
  const linked = layout.nodes.length;
  const isolated = layout.strip.length;
  const sinceLabel = formatMonthShort(since);
  // Taxa sempre com o volume ao lado (DAD-1).
  const isolatedRate = formatRateWithVolume(isolated, total);
  const stripTitle = `${clientsLabel(isolated)} sem ligação`;
  const networkCaption =
    linked === 0
      ? 'Nenhum cliente ligado por indicação'
      : `${clientsLabel(linked)} ligados por ${referralsLabel(layout.edges.length)}, em ${groupsLabel(layout.groups)}`;

  const summary = [
    `Grafo de rede com ${clientsLabel(total)} desde ${sinceLabel}: ${networkCaption.charAt(0).toLowerCase()}${networkCaption.slice(1)},`,
    isolated === 0
      ? 'e nenhum fora da rede.'
      : `e ${isolatedRate} sem nenhuma indicação feita ou recebida, alinhados em faixa à parte.`,
    linked === 0 ? '' : `O maior grupo reúne ${clientsLabel(layout.largest)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="figure" style={style}>
      <svg className="h-full w-full" viewBox={`0 0 ${String(BODY_WIDTH)} ${String(BODY_HEIGHT)}`}>
        {/* Linha de leitura (ANO-5): a conclusão, calculada do dado, em uma linha só. */}
        <text aria-hidden className="font-sans" fill="var(--text-secondary)" fontSize={TEXT_MAIN} x={0} y={READING_BASELINE}>
          {isolated === 0 ? (
            `Todos os ${clientsLabel(total)} têm pelo menos uma indicação feita ou recebida desde ${sinceLabel}.`
          ) : (
            <>
              <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
                {isolatedRate}
              </tspan>
              {` dos clientes não indicaram nem foram indicados desde ${sinceLabel}.`}
            </>
          )}
        </text>

        {/* Título da rede, par do título da faixa: os dois blocos se nomeiam do mesmo jeito. */}
        <text className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={TEXT_MAIN} fontWeight={500} x={0} y={CAPTION_BASELINE}>
          {networkCaption}
        </text>

        {/* Lista acessível de ligações: cada aresta é um item que diz origem e destino. */}
        <g aria-label="Indicações: quem indicou e quem foi indicado" role="list">
          {layout.edges.map((edge) => (
            <line
              aria-label={edge.label}
              key={edge.key}
              role="listitem"
              stroke="var(--text-muted)"
              strokeWidth={EDGE_STROKE}
              x1={edge.ax}
              x2={edge.bx}
              y1={edge.ay}
              y2={edge.by}
            />
          ))}
        </g>

        {/* Cliente ligado: disco cheio. A dica acrescenta o que o corpo não escreve nó a nó. */}
        {layout.nodes.map((node) => (
          <circle cx={node.x} cy={node.y} fill="var(--chart-1)" key={node.id} r={NODE_RADIUS} stroke="var(--surface-raised)" strokeWidth={NODE_STROKE}>
            <title>{`${node.name}: indicou ${clientsLabel(node.made)} e foi indicado por ${clientsLabel(node.received)}`}</title>
          </circle>
        ))}

        {/* Rótulo sem halo: em aresta fina o halo apagaria a marca, então quem se afasta é o texto,
            e afastado ele ganha linha de chamada pontilhada (GEO-4). */}
        {layout.labels.map((label) => {
          const node = layout.nodes[label.index];
          if (node === undefined) return null;
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
                fill="var(--text-secondary)"
                fontSize={TEXT_MAIN}
                fontWeight={500}
                textAnchor={label.anchor}
                x={label.x}
                y={label.box.y0 + LABEL_BASELINE}
              >
                {node.name}
              </text>
            </g>
          );
        })}

        {/* Faixa dos isolados: título com a contagem e uma grade de nós vazados com o nome ao lado.
            O contorno fica todo dentro do raio do nó ligado, para os dois terem o mesmo tamanho.
            Aqui não há dica: o nome já está escrito, e ela só o repetiria (DIC-1). */}
        {layout.strip.length === 0 ? null : (
          <>
            <text className="font-sans tabular-nums" fill="var(--text-primary)" fontSize={TEXT_MAIN} fontWeight={600} x={0} y={layout.stripTop + TEXT_MAIN}>
              {stripTitle}
            </text>
            <text className="font-sans" fill="var(--text-muted)" fontSize={TEXT_NOTE} x={inkWidth(stripTitle, TEXT_MAIN) * BOLD_FACTOR + SAMPLE_GAP} y={layout.stripTop + TEXT_MAIN}>
              fora da simulação, em ordem alfabética
            </text>
          </>
        )}
        {layout.strip.map((item) => (
          <g key={item.id}>
            <circle aria-hidden cx={item.cx} cy={item.cy} fill="none" r={NODE_RADIUS - HOLLOW_STROKE / 2} stroke="var(--text-muted)" strokeWidth={HOLLOW_STROKE} />
            <text className="font-sans" fill="var(--text-secondary)" fontSize={TEXT_MAIN} x={item.cx + NODE_RADIUS + SAMPLE_GAP} y={item.cy + ROW_BASELINE_SHIFT}>
              {item.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
