import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatMonthShort, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  products as defaultProducts,
  since as defaultSince,
  type ClientNode,
  type Product,
} from './data';

/**
 * Grafo de rede dirigido por forças: cada cliente é um disco, cada indicação é uma aresta, e a
 * posição sai de uma simulação em que as ligações puxam e os nós se repelem. Serve para ver se as
 * indicações formam grupos e quem os segura.
 *
 * Quatro decisões desta versão, e o motivo de cada uma:
 *
 * 1. O DESENHO É DETERMINÍSTICO (DAD-3). Fruchterman e Reingold com 300 iterações fixas, posição
 *    inicial sorteada por mulberry32 e semente tirada do próprio dado por FNV-1a. A mesma entrada dá
 *    sempre o mesmo desenho, em qualquer máquina e em qualquer dia; nada usa relógio nem sorteio do
 *    navegador, e a conta só usa soma, produto e raiz, que são exatas no padrão de ponto flutuante.
 * 2. TUDO VIVE NUM `<svg>` DO TAMANHO DO CORPO. Linha de leitura, legenda, rótulo e rodapé são
 *    `<text>` no mesmo `viewBox`, que mede o corpo do preset: a escala sai 1 e o texto de 12 px
 *    chega à tela com 12 px (GEO-18).
 * 3. ARESTA É DADO, NÃO PANO DE FUNDO (ACE-6). Apagada a aresta, ninguém sabe quem indicou quem,
 *    então ela vai opaca em `--text-muted`, sem a opacidade de 0,25 que o catálogo sugeria e que
 *    derrubaria o traço abaixo de 3:1 (ACE-5).
 * 4. RÓTULO SAI DO LUGAR, A ARESTA NÃO (GEO-4). Nome só nos nós de grau alto; cada nome procura
 *    posição sem nó e sem aresta por baixo, e nenhum leva halo.
 */
export interface ReferralForceGraphProps {
  readonly data?: readonly ClientNode[];
  readonly products?: readonly Product[];
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
const LEGEND_BASELINE = 34;
/** 17.7: da linha de legenda até o gráfico. */
const PLOT_TOP = 46;
const FOOTER_HEIGHT = 34;
const FOOTER_GAP = 4;
const PLOT_BOTTOM = BODY_HEIGHT - FOOTER_HEIGHT - FOOTER_GAP;
const FOOTER_CENTER = BODY_HEIGHT - FOOTER_HEIGHT / 2;
/** Do centro da faixa até a linha de base do texto de 11 px. */
const NOTE_BASELINE_SHIFT = 4;

/** Raio do cliente de maior receita; os demais saem da raiz quadrada da proporção (GEO-3). */
const RADIUS_MAX = 14;
const NODE_STROKE = 1.5;
const EDGE_STROKE = 1;
/** Só ganha nome o nó com este grau ou mais: o resto fica na dica. */
const LABEL_MIN_DEGREE = 5;
const LABEL_HEIGHT = 12;
const LABEL_BASELINE = 9;
const SAMPLE_RADIUS = 5;
/** 17.7: da amostra até o texto da legenda. */
const SAMPLE_GAP = 10;
const LEGEND_ITEM_GAP = 20;
const KEY_TEXT_GAP = 6;
const KEY_ITEM_GAP = 12;

/** Fruchterman e Reingold: iterações fixas e temperatura inicial como fração da largura. */
const ITERATIONS = 300;
const START_TEMPERATURE = 0.1;
/** Força que segura as ilhas perto do centro; sem ela os componentes soltos fogem para a borda. */
const GRAVITY = 5;
const MIN_DISTANCE_SQUARED = 0.01;
/** Quanto a caixa do desenho pode esticar num eixo além do outro para ocupar o plano. */
const MAX_STRETCH = 1.3;
/** Vão mínimo entre dois discos, e entre um disco e uma aresta de que ele não é ponta. */
const NODE_GAP = 3;
const EDGE_GAP = 4;
const SEPARATE_PASSES = 60;
const SETTLE_ROUNDS = 8;
/**
 * Sal fixo que entra no hash da semente junto com a assinatura do dado. Trocar o sal troca o
 * desenho, nunca o dado: este foi o que deu menos cruzamento de aresta entre os testados.
 */
const SEED_SALT = 'n';

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
  readonly product: string;
  readonly revenue: number;
  readonly degree: number;
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
}

interface Layout {
  readonly nodes: readonly DrawnNode[];
  readonly edges: readonly DrawnEdge[];
  readonly labels: readonly PlacedLabel[];
  /** Componentes conexos: quantos grupos de clientes existem sem ligação entre si. */
  readonly groups: number;
  /** Indicações em que os dois clientes têm o mesmo produto principal. */
  readonly sameProduct: number;
  /** Maior receita do recorte, ou `null` sem cliente (EST-1b). */
  readonly maxRevenue: number | null;
}

/** Maior valor de uma lista. Devolve `null` para lista vazia, nunca zero (EST-1b). */
function maxOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((max, value) => Math.max(max, value), -Infinity);
}

/** Raio pela raiz quadrada da proporção, sem piso: a área sai exatamente proporcional (GEO-3). */
function radiusOf(revenue: number, maxRevenue: number | null): number {
  if (maxRevenue === null || maxRevenue <= 0) return 0;
  return RADIUS_MAX * Math.sqrt(Math.max(revenue, 0) / maxRevenue);
}

/** Conta os componentes conexos por união de conjuntos. */
function countGroups(count: number, links: readonly SimLink[]): number {
  const parent = Array.from({ length: count }, (_, index) => index);
  const find = (index: number): number => {
    let root = index;
    while ((parent[root] ?? root) !== root) root = parent[root] ?? root;
    return root;
  };
  for (const link of links) parent[find(link.source)] = find(link.target);
  const roots = new Set<number>();
  for (let index = 0; index < count; index += 1) roots.add(find(index));
  return roots.size;
}

/** Assinatura textual do dado: é ela que entra no hash da semente e na dependência do `useMemo`. */
function signatureOf(data: readonly ClientNode[]): string {
  return data.map((node) => `${node.id}:${node.product}:${String(node.revenue)}>${node.referred.join(',')}`).join('|');
}

function buildLayout(data: readonly ClientNode[]): Layout {
  const indexOf = new Map(data.map((node, index) => [node.id, index]));
  const links: SimLink[] = [];
  for (const [source, node] of data.entries()) {
    for (const id of node.referred) {
      const target = indexOf.get(id);
      if (target !== undefined && target !== source) links.push({ source, target });
    }
  }
  const degree = data.map(() => 0);
  for (const link of links) {
    degree[link.source] = (degree[link.source] ?? 0) + 1;
    degree[link.target] = (degree[link.target] ?? 0) + 1;
  }
  const maxRevenue = maxOf(data.map((node) => node.revenue));
  const radii = data.map((node) => radiusOf(node.revenue, maxRevenue));

  // Margem para o maior rótulo: o nome centrado num nó da borda ainda cabe inteiro no plano.
  const labelled = data.map((_, index) => index).filter((index) => (degree[index] ?? 0) >= LABEL_MIN_DEGREE);
  const widths = data.map((node) => inkWidth(node.name, TEXT_MAIN));
  const widest = labelled.reduce((max, index) => Math.max(max, widths[index] ?? 0), 0);
  const marginX = Math.max(RADIUS_MAX, widest / 2);
  const plot: Box = { x0: 0, y0: PLOT_TOP, x1: BODY_WIDTH, y1: PLOT_BOTTOM };
  const inner: Box = { x0: marginX, y0: PLOT_TOP + RADIUS_MAX, x1: BODY_WIDTH - marginX, y1: PLOT_BOTTOM - RADIUS_MAX };

  const seed = hashSeed(`${SEED_SALT}|${signatureOf(data)}`);
  const points = simulate(data.length, links, inner.x1 - inner.x0, inner.y1 - inner.y0, seed);
  fitToBox(points, inner);
  settle(points, radii, links, plot);

  const segments: Segment[] = [];
  const edges: DrawnEdge[] = [];
  let sameProduct = 0;
  for (const link of links) {
    const a = points[link.source];
    const b = points[link.target];
    const from = data[link.source];
    const to = data[link.target];
    if (!a || !b || !from || !to) continue;
    segments.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y });
    edges.push({ key: `${from.id}-${to.id}`, ax: a.x, ay: a.y, bx: b.x, by: b.y });
    if (from.product === to.product) sameProduct += 1;
  }
  const requests: LabelRequest[] = [...labelled]
    .sort((a, b) => (degree[b] ?? 0) - (degree[a] ?? 0) || a - b)
    .map((index) => ({ index, width: widths[index] ?? 0, height: LABEL_HEIGHT }));
  const labels = placeLabels(requests, points, radii, segments, plot);

  const nodes: DrawnNode[] = data.map((node, index) => ({
    id: node.id,
    name: node.name,
    product: node.product,
    revenue: node.revenue,
    degree: degree[index] ?? 0,
    x: points[index]?.x ?? 0,
    y: points[index]?.y ?? 0,
    r: radii[index] ?? 0,
  }));
  return { nodes, edges, labels, groups: countGroups(data.length, links), sameProduct, maxRevenue };
}

// Fim da geometria pura: daqui para baixo, texto de tela e React.

function slotColor(slot: number): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** "1 cliente" no singular, "N clientes" no plural: a contagem nunca sai crua (NUM-6). */
function clientsLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'cliente' : 'clientes'}`;
}

function referralsLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'indicação' : 'indicações'}`;
}

function groupsLabel(count: number): string {
  return count === 1 ? 'um grupo só' : `${formatInt(count)} grupos sem ligação entre si`;
}

/**
 * Degraus da régua de área: uma potência de dez abaixo da metade do máximo, para dar escala, e o
 * maior valor OBSERVADO, calculado do dado e nunca escrito à mão (ROT-5b).
 */
function sizeSteps(maxRevenue: number | null): number[] {
  if (maxRevenue === null || maxRevenue <= 0) return [];
  let step = 1;
  while (step * 10 <= maxRevenue / 2) step *= 10;
  return step < maxRevenue ? [step, maxRevenue] : [maxRevenue];
}

export default function ReferralForceGraph({
  data = defaultData,
  products = defaultProducts,
  since = defaultSince,
  height,
  className,
}: ReferralForceGraphProps) {
  // O nome entra na chave do memo, porque a largura do rótulo decide a margem; na semente não entra.
  const signature = `${signatureOf(data)}#${data.map((node) => node.name).join('|')}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- a assinatura textual é a dependência real
  const layout = useMemo(() => buildLayout(data), [signature]);
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum cliente neste recorte: não há rede de indicações para desenhar.</span>
      </div>
    );
  }

  const productOf = new Map(products.map((product) => [product.id as string, product]));
  const total = layout.edges.length;
  const sinceLabel = formatMonthShort(since);
  // Taxa sempre com o volume ao lado (DAD-1); sem indicação nenhuma não existe taxa a escrever.
  const sameRate = total > 0 ? formatRateWithVolume(layout.sameProduct, total) : null;
  const hub = [...layout.nodes].sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id))[0];

  const summary = [
    `Grafo de rede com ${clientsLabel(layout.nodes.length)} e ${referralsLabel(total)} desde ${sinceLabel}, em ${groupsLabel(layout.groups)}.`,
    sameRate === null ? '' : `${sameRate} das indicações ficam dentro do mesmo produto principal.`,
    hub === undefined || hub.degree === 0 ? '' : `Quem mais se liga: ${hub.name}, com ${referralsLabel(hub.degree)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  // Legenda de grupos na ordem do dicionário de produtos, só com o que aparece no recorte.
  const present = new Set(layout.nodes.map((node) => node.product));
  const legend: { readonly product: Product; readonly x: number }[] = [];
  let legendCursor = 0;
  for (const product of products) {
    if (!present.has(product.id)) continue;
    legend.push({ product, x: legendCursor });
    legendCursor += 2 * SAMPLE_RADIUS + SAMPLE_GAP + inkWidth(product.label, TEXT_MAIN) + LEGEND_ITEM_GAP;
  }

  // Régua de área, montada da direita para a esquerda: o último texto termina na borda do corpo.
  const sizeKey: { readonly value: number; readonly text: string; readonly radius: number; readonly cx: number; readonly textEnd: number }[] = [];
  let keyCursor = BODY_WIDTH;
  for (const value of sizeSteps(layout.maxRevenue).reverse()) {
    const text = formatCurrencyCompact(value);
    const radius = radiusOf(value, layout.maxRevenue);
    const cx = keyCursor - inkWidth(text, TEXT_NOTE) - KEY_TEXT_GAP - radius;
    sizeKey.push({ value, text, radius, cx, textEnd: keyCursor });
    keyCursor = cx - radius - KEY_ITEM_GAP;
  }
  const noteBaseline = FOOTER_CENTER + NOTE_BASELINE_SHIFT;

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="figure" style={style}>
      <svg className="h-full w-full" viewBox={`0 0 ${String(BODY_WIDTH)} ${String(BODY_HEIGHT)}`}>
        {/* Linha de leitura (ANO-5): a conclusão, calculada do dado, em uma linha só. */}
        <text aria-hidden className="font-sans" fill="var(--text-secondary)" fontSize={TEXT_MAIN} x={0} y={READING_BASELINE}>
          {sameRate === null ? (
            'Nenhuma indicação registrada entre estes clientes.'
          ) : (
            <>
              <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
                {sameRate}
              </tspan>
              {' das indicações ligam clientes do mesmo produto principal.'}
            </>
          )}
        </text>

        {/* Legenda de grupos: amostra na forma da marca, que aqui é o disco do cliente (ROT-4). */}
        {legend.map(({ product, x }) => (
          <g key={product.id}>
            <circle aria-hidden cx={x + SAMPLE_RADIUS} cy={LEGEND_BASELINE - 4} fill={slotColor(product.slot)} r={SAMPLE_RADIUS} />
            <text className="font-sans" fill="var(--text-secondary)" fontSize={TEXT_MAIN} x={x + 2 * SAMPLE_RADIUS + SAMPLE_GAP} y={LEGEND_BASELINE}>
              {product.label}
            </text>
          </g>
        ))}

        {/* Arestas ANTES dos nós: o disco cobre a ponta da linha, e não o contrário. */}
        {layout.edges.map((edge) => (
          <line key={edge.key} stroke="var(--text-muted)" strokeWidth={EDGE_STROKE} x1={edge.ax} x2={edge.bx} y1={edge.ay} y2={edge.by} />
        ))}

        {/* Contorno na cor da superfície: separa o disco da aresta e do disco vizinho (COR-5). A dica
            acrescenta produto, receita e grau, que o corpo não escreve nó a nó (DIC-1). */}
        {layout.nodes.map((node) => {
          const product = productOf.get(node.product);
          return (
            <circle
              cx={node.x}
              cy={node.y}
              fill={product === undefined ? 'var(--text-muted)' : slotColor(product.slot)}
              key={node.id}
              r={node.r}
              stroke="var(--surface-raised)"
              strokeWidth={NODE_STROKE}
            >
              <title>
                {`${node.name}: ${product?.label ?? node.product}, ${formatCurrencyCompact(node.revenue)} de receita anual, ${referralsLabel(node.degree)}`}
              </title>
            </circle>
          );
        })}

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

        {/* Rodapé: a contagem de nós e de arestas, e a régua que ensina a ler a área do disco. */}
        <text className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={TEXT_NOTE} x={0} y={noteBaseline}>
          {`${clientsLabel(layout.nodes.length)} e ${referralsLabel(total)} desde ${sinceLabel}`}
        </text>
        {sizeKey.length === 0 ? null : (
          <text className="font-sans" fill="var(--text-muted)" fontSize={TEXT_NOTE} textAnchor="end" x={keyCursor + KEY_ITEM_GAP - SAMPLE_GAP} y={noteBaseline}>
            Área do disco: receita anual
          </text>
        )}
        {sizeKey.map((step) => (
          <g key={step.value}>
            <circle aria-hidden cx={step.cx} cy={FOOTER_CENTER} fill="none" r={step.radius} stroke="var(--text-muted)" strokeWidth={1} />
            <text className="font-display" fill="var(--text-muted)" fontSize={TEXT_NOTE} textAnchor="end" x={step.textEnd} y={noteBaseline}>
              {step.text}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
