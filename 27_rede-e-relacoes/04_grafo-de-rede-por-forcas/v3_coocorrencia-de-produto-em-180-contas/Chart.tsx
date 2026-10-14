import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  asOf as defaultAsOf,
  data as defaultData,
  products as defaultProducts,
  type AccountNode,
  type Product,
} from './data';

/**
 * Grafo de rede dirigido por forças sobre coocorrência de produto: cada conta é um disco, e duas
 * contas se ligam quando têm produtos em comum. Serve para ver que comunidades de contas aparecem
 * e quais contas fazem a ponte entre elas, com o que ficou de fora escrito.
 *
 * Cinco decisões desta versão, e o motivo de cada uma:
 *
 * 1. O FILTRO VEM ANTES DA SIMULAÇÃO. Ligação com menos de `MIN_SHARED` produtos em comum não
 *    puxa nó nenhum e não é desenhada: só é contada, e a contagem vai escrita no painel. Filtrar
 *    depois deixaria a ligação fraca moldar o desenho sem aparecer nele.
 * 2. O CUSTO É QUADRÁTICO E ESTÁ MEDIDO. São `n (n - 1) / 2` pares por iteração: com 180 contas,
 *    16.110 pares e 4,8 milhões de avaliações de repulsão nas 300 iterações. Por isso o layout
 *    roda uma vez, dentro de `useMemo`, e só de novo quando o conteúdo do dado muda.
 * 3. O DESENHO É DETERMINÍSTICO (DAD-3): iterações fixas, mulberry32 e semente tirada do dado.
 * 4. RÓTULO SÓ NAS PONTES, E SEM ARESTA POR BAIXO (GEO-4). O nome procura vão livre ao redor do
 *    nó em raios crescentes; se não acha, vai para uma pista reservada no topo ou na base do
 *    plano, onde nenhuma aresta passa, com linha de chamada. Nenhum rótulo leva halo.
 * 5. O PAINEL LATERAL CARREGA LEGENDA E TOTAIS, para o grafo ficar com o espaço útil inteiro.
 */
export interface ProductCooccurrenceGraphProps {
  readonly data?: readonly AccountNode[];
  readonly products?: readonly Product[];
  /** Mês da posição de carteira lida, em `YYYY-MM`. */
  readonly asOf?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do preset `largo` (960x400) na moldura `card` com o caso de uso em uma linha. */
const BODY_WIDTH = 894;
const BODY_HEIGHT = 281.5;

const TEXT_VALUE = 14;
const TEXT_MAIN = 12;
const TEXT_NOTE = 11;
const READING_BASELINE = 12;
/** 17.7: da linha de leitura até o gráfico. */
const PLOT_TOP = 24;
const PLOT_BOTTOM = BODY_HEIGHT;
const PANEL_WIDTH = 214;
/** 17.7: do gráfico até a legenda lateral. */
const PANEL_GAP = 24;
const PLOT_WIDTH = BODY_WIDTH - PANEL_WIDTH - PANEL_GAP;
const PANEL_X = BODY_WIDTH - PANEL_WIDTH;

/** Painel: linha de base do cabeçalho, centro da primeira linha da legenda e passos. */
const PANEL_HEADER_BASELINE = 11;
const LEGEND_FIRST_CENTER = 30;
/** 17.7: texto de 12 px mais 10 px entre itens da legenda. */
const LEGEND_STEP = 22;
const SAMPLE_RADIUS = 5;
/** 17.7: da amostra até o texto da legenda. */
const SAMPLE_GAP = 10;
/** Do centro da linha até a linha de base do texto de 12 px e do número de 14 px. */
const MAIN_BASELINE_SHIFT = 4;
const VALUE_BASELINE_SHIFT = 5;
const TOTALS_GAP = 26;
const TOTALS_STEP = 18;
const KEY_STEP = 16;
const KEY_LINE = 16;
const KEY_LINE_GAP = 4;

/** Só entra no desenho a ligação com este número de produtos em comum, ou mais. */
const MIN_SHARED = 2;
/** Ponte: conta com este número de ligações, ou mais, para um mesmo grupo que não é o dela. */
const BRIDGE_MIN_LINKS = 2;
const NODE_RADIUS = 3.5;
const NODE_STROKE = 1;
const RING_OFFSET = 3;
const RING_STROKE = 1.5;
/** Espessura da aresta de peso mínimo e quanto ela engrossa a cada produto em comum a mais. */
const EDGE_STROKE = 1;
const EDGE_STROKE_STEP = 0.5;
const LABEL_HEIGHT = 12;
const LABEL_BASELINE = 9;
/** Pista reservada no topo e na base do plano: nó nenhum entra nela, então aresta nenhuma passa. */
const LANE_HEIGHT = 15;

/** Fruchterman e Reingold: iterações fixas e temperatura inicial como fração da largura. */
const ITERATIONS = 300;
const START_TEMPERATURE = 0.1;
/** Força que segura as comunidades perto do centro; mais fraca aqui, para abrir vão entre elas. */
const GRAVITY = 3;
const MIN_DISTANCE_SQUARED = 0.01;
/** Quanto a caixa do desenho pode esticar num eixo além do outro para ocupar o plano. */
const MAX_STRETCH = 1.3;
/** Vão mínimo entre dois discos, e entre um disco e uma aresta de que ele não é ponta. */
const NODE_GAP = 2;
const EDGE_GAP = 2;
const SEPARATE_PASSES = 60;
const SETTLE_ROUNDS = 8;
/**
 * Sal fixo que entra no hash da semente junto com a assinatura do dado. Trocar o sal troca o
 * desenho, nunca o dado: este foi o que deu a menor soma de linhas de chamada entre os testados.
 */
const SEED_SALT = 'k';

/**
 * Avanço por glifo de Manrope, em em, na mesma tabela que a guarda COLISAO-TEXTO usa. A média por
 * classe erra de 8% a 26% para baixo em string real, e é a largura do rótulo que decide o vão.
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
const LABEL_REACHES: readonly number[] = [0, 8, 16, 26, 38, 52, 68];
/** Deslocamentos horizontais que o rótulo tenta dentro da pista reservada. */
const LANE_SHIFTS: readonly number[] = [0, -24, 24, -48, 48, -80, 80];
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
 * rótulo tenta oito direções em afastamentos crescentes ao redor do próprio nó e, depois, as
 * pistas reservadas fora do plano (`lanes`, o y do topo de cada pista), onde nenhuma aresta passa.
 * Fica com a posição de menor custo: não toca nó, não toca rótulo já posto e não tem aresta por
 * baixo. Afastado, ganha linha de chamada. Nenhum rótulo leva halo, que apagaria a aresta.
 */
function placeLabels(
  requests: readonly LabelRequest[],
  points: readonly Point[],
  radii: readonly number[],
  segments: readonly Segment[],
  bounds: Box,
  lanes: readonly number[],
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
    for (const lane of lanes) {
      for (const shift of LANE_SHIFTS) {
        const x0 = Math.min(bounds.x1 - width, Math.max(bounds.x0, point.x - width / 2 + shift));
        candidates.push([x0, lane, 'middle', Math.abs(lane + height / 2 - point.y)]);
      }
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
  /** Ligações desenhadas que chegam a esta conta. */
  readonly degree: number;
  readonly bridge: boolean;
  readonly x: number;
  readonly y: number;
}

interface DrawnEdge {
  readonly key: string;
  readonly ax: number;
  readonly ay: number;
  readonly bx: number;
  readonly by: number;
  readonly shared: number;
}

interface Layout {
  readonly nodes: readonly DrawnNode[];
  readonly edges: readonly DrawnEdge[];
  readonly labels: readonly PlacedLabel[];
  /** Ligações abaixo do peso mínimo: fora da simulação e fora do desenho, só contadas. */
  readonly hidden: number;
  /** Ligações desenhadas entre contas do mesmo produto dominante. */
  readonly inside: number;
  /** Maior número de produtos em comum observado numa ligação desenhada, ou `null` sem ligação. */
  readonly maxShared: number | null;
}

/** Maior valor de uma lista. Devolve `null` para lista vazia, nunca zero (EST-1b). */
function maxOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((max, value) => Math.max(max, value), -Infinity);
}

/** Assinatura textual do dado: é ela que entra no hash da semente e na dependência do `useMemo`. */
function signatureOf(data: readonly AccountNode[]): string {
  return data
    .map((node) => `${node.id}:${node.name}:${node.product}>${node.links.map((link) => `${link.to}=${String(link.shared)}`).join(',')}`)
    .join('|');
}

function buildLayout(data: readonly AccountNode[]): Layout {
  const indexOf = new Map(data.map((node, index) => [node.id, index]));
  const links: SimLink[] = [];
  const weights: number[] = [];
  let hidden = 0;
  // Filtro de peso mínimo ANTES da simulação: a ligação fraca não puxa nó nenhum, só é contada.
  for (const [source, node] of data.entries()) {
    for (const link of node.links) {
      const target = indexOf.get(link.to);
      if (target === undefined || target === source) continue;
      if (link.shared < MIN_SHARED) {
        hidden += 1;
        continue;
      }
      links.push({ source, target });
      weights.push(link.shared);
    }
  }
  const degree = data.map(() => 0);
  const outside: Map<string, number>[] = data.map(() => new Map<string, number>());
  let inside = 0;
  for (const link of links) {
    degree[link.source] = (degree[link.source] ?? 0) + 1;
    degree[link.target] = (degree[link.target] ?? 0) + 1;
    const a = data[link.source];
    const b = data[link.target];
    if (!a || !b) continue;
    if (a.product === b.product) {
      inside += 1;
      continue;
    }
    outside[link.source]?.set(b.product, (outside[link.source]?.get(b.product) ?? 0) + 1);
    outside[link.target]?.set(a.product, (outside[link.target]?.get(a.product) ?? 0) + 1);
  }
  // Ponte: a conta com ligações bastantes para um mesmo grupo que não é o dela.
  const bridge = data.map((_, index) => [...(outside[index]?.values() ?? [])].some((count) => count >= BRIDGE_MIN_LINKS));

  // O raio que ocupa espaço inclui o anel da ponte: é ele que afasta vizinho, aresta e rótulo.
  const outer = data.map((_, index) => NODE_RADIUS + (bridge[index] ? RING_OFFSET + RING_STROKE / 2 : 0));
  const reachY = LANE_HEIGHT + NODE_RADIUS + RING_OFFSET + RING_STROKE;
  const plot: Box = { x0: 0, y0: PLOT_TOP, x1: PLOT_WIDTH, y1: PLOT_BOTTOM };
  const field: Box = { x0: 0, y0: PLOT_TOP + LANE_HEIGHT, x1: PLOT_WIDTH, y1: PLOT_BOTTOM - LANE_HEIGHT };
  const marginX = NODE_RADIUS + RING_OFFSET + RING_STROKE;
  const inner: Box = { x0: marginX, y0: PLOT_TOP + reachY, x1: PLOT_WIDTH - marginX, y1: PLOT_BOTTOM - reachY };

  const seed = hashSeed(`${SEED_SALT}|${signatureOf(data)}`);
  const points = simulate(data.length, links, inner.x1 - inner.x0, inner.y1 - inner.y0, seed);
  fitToBox(points, inner);
  settle(points, outer, links, field);

  const segments: Segment[] = [];
  const edges: DrawnEdge[] = [];
  for (const [order, link] of links.entries()) {
    const a = points[link.source];
    const b = points[link.target];
    const from = data[link.source];
    const to = data[link.target];
    if (!a || !b || !from || !to) continue;
    segments.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y });
    edges.push({ key: `${from.id}-${to.id}`, ax: a.x, ay: a.y, bx: b.x, by: b.y, shared: weights[order] ?? MIN_SHARED });
  }
  const requests: LabelRequest[] = data
    .map((_, index) => index)
    .filter((index) => bridge[index])
    .sort((a, b) => (degree[b] ?? 0) - (degree[a] ?? 0) || a - b)
    .map((index) => ({ index, width: inkWidth(data[index]?.name ?? '', TEXT_MAIN) * BOLD_FACTOR, height: LABEL_HEIGHT }));
  const lanes = [PLOT_TOP + 1, PLOT_BOTTOM - LABEL_HEIGHT - 1];
  const labels = placeLabels(requests, points, outer, segments, plot, lanes);

  const nodes: DrawnNode[] = data.map((node, index) => ({
    id: node.id,
    name: node.name,
    product: node.product,
    degree: degree[index] ?? 0,
    bridge: bridge[index] ?? false,
    x: points[index]?.x ?? 0,
    y: points[index]?.y ?? 0,
  }));
  return { nodes, edges, labels, hidden, inside, maxShared: maxOf(weights) };
}

// Fim da geometria pura: daqui para baixo, texto de tela e React.

function slotColor(slot: number): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** "1 conta" no singular, "N contas" no plural: a contagem nunca sai crua (NUM-6). */
function accountsLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'conta' : 'contas'}`;
}

function linksLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'ligação' : 'ligações'}`;
}

function productsLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'produto' : 'produtos'}`;
}

function edgeWidth(shared: number): number {
  return EDGE_STROKE + Math.max(shared - MIN_SHARED, 0) * EDGE_STROKE_STEP;
}

interface LegendRow {
  readonly key: string;
  readonly label: string;
  readonly color: string;
  readonly count: number;
}

export default function ProductCooccurrenceGraph({
  data = defaultData,
  products = defaultProducts,
  asOf = defaultAsOf,
  height,
  className,
}: ProductCooccurrenceGraphProps) {
  const signature = signatureOf(data);
  // O layout custa `n (n - 1) / 2` pares por iteração: roda uma vez e só refaz se o dado mudar.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- a assinatura textual é a dependência real
  const layout = useMemo(() => buildLayout(data), [signature]);
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma conta neste recorte: não há coocorrência de produto para desenhar.</span>
      </div>
    );
  }

  const productOf = new Map(products.map((product) => [product.id as string, product]));
  const colorOf = (productId: string): string => {
    const slot = productOf.get(productId)?.slot ?? null;
    return slot === null ? 'var(--text-muted)' : slotColor(slot);
  };
  const countOf = new Map<string, number>();
  for (const node of layout.nodes) countOf.set(node.product, (countOf.get(node.product) ?? 0) + 1);

  // Legenda: cada produto com slot na ordem do dicionário; o que não tem slot soma em Outros, com
  // a contagem de produtos no rótulo e a de contas na coluna (COR-4).
  const legend: LegendRow[] = [];
  for (const product of products) {
    const count = countOf.get(product.id) ?? 0;
    if (product.slot === null || count === 0) continue;
    legend.push({ key: product.id, label: product.label, color: slotColor(product.slot), count });
  }
  const others = [...countOf.entries()].filter(([productId]) => (productOf.get(productId)?.slot ?? null) === null);
  if (others.length > 0) {
    legend.push({
      key: 'outros',
      label: `Outros (${productsLabel(others.length)})`,
      color: 'var(--text-muted)',
      count: others.reduce((sum, [, count]) => sum + count, 0),
    });
  }

  const drawn = layout.edges.length;
  const bridges = layout.nodes.filter((node) => node.bridge).length;
  const asOfLabel = formatMonthShort(asOf);
  // Taxa sempre com o volume ao lado (DAD-1); sem ligação desenhada não existe taxa a escrever.
  const insideRate = drawn > 0 ? formatRateWithVolume(layout.inside, drawn) : null;

  const summary = [
    `Grafo de rede com ${accountsLabel(layout.nodes.length)} e ${linksLabel(drawn)} de ${productsLabel(MIN_SHARED)} ou mais em comum em ${asOfLabel};`,
    `${linksLabel(layout.hidden)} mais fracas ficaram ocultas.`,
    insideRate === null ? '' : `${insideRate} ficam dentro do mesmo produto dominante, e ${accountsLabel(bridges)} fazem a ponte entre grupos.`,
  ]
    .filter(Boolean)
    .join(' ');

  const totals: readonly (readonly [label: string, value: string])[] = [
    ['Contas no desenho', formatInt(layout.nodes.length)],
    [`Ligações com ${formatInt(MIN_SHARED)} ou mais produtos`, formatInt(drawn)],
    [`Ligações ocultas, com menos de ${formatInt(MIN_SHARED)}`, formatInt(layout.hidden)],
    ['Pontes entre grupos', formatInt(bridges)],
  ];
  const totalsFirst = LEGEND_FIRST_CENTER + (legend.length - 1) * LEGEND_STEP + TOTALS_GAP;
  const keyFirst = totalsFirst + (totals.length - 1) * TOTALS_STEP + TOTALS_STEP;
  const ringCenter = PANEL_X + NODE_RADIUS + RING_OFFSET;

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="figure" style={style}>
      <svg className="h-full w-full" viewBox={`0 0 ${String(BODY_WIDTH)} ${String(BODY_HEIGHT)}`}>
        {/* Linha de leitura (ANO-5): a conclusão, calculada do dado, em uma linha só. */}
        <text aria-hidden className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={TEXT_MAIN} x={0} y={READING_BASELINE}>
          {insideRate === null ? (
            `Nenhum par de contas tem ${productsLabel(MIN_SHARED)} ou mais em comum.`
          ) : (
            <>
              <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
                {insideRate}
              </tspan>
              {` das ligações desenhadas ficam dentro do mesmo produto dominante; ${accountsLabel(bridges)} fazem a ponte.`}
            </>
          )}
        </text>

        {/* Arestas ANTES dos nós, opacas em `--text-muted` (ACE-6); a espessura é o peso. */}
        {layout.edges.map((edge) => (
          <line key={edge.key} stroke="var(--text-muted)" strokeWidth={edgeWidth(edge.shared)} x1={edge.ax} x2={edge.bx} y1={edge.ay} y2={edge.by} />
        ))}

        {/* A dica acrescenta nome, produto e grau, que o corpo só escreve para as pontes (DIC-1). */}
        {layout.nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} fill={colorOf(node.product)} r={NODE_RADIUS} stroke="var(--surface-raised)" strokeWidth={NODE_STROKE}>
              <title>{`${node.name}: ${productOf.get(node.product)?.label ?? node.product}, ${linksLabel(node.degree)} no desenho`}</title>
            </circle>
            {node.bridge ? (
              <circle aria-hidden cx={node.x} cy={node.y} fill="none" r={NODE_RADIUS + RING_OFFSET} stroke="var(--text-primary)" strokeWidth={RING_STROKE} />
            ) : null}
          </g>
        ))}

        {/* Nome só nas pontes, sem halo e sem aresta por baixo (GEO-4). */}
        {layout.labels.map((label) => {
          const node = layout.nodes[label.index];
          if (node === undefined) return null;
          return (
            <g key={node.id}>
              {label.leader === null ? null : (
                <line
                  stroke="var(--text-primary)"
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
                fill="var(--text-primary)"
                fontSize={TEXT_MAIN}
                fontWeight={600}
                textAnchor={label.anchor}
                x={label.x}
                y={label.box.y0 + LABEL_BASELINE}
              >
                {node.name}
              </text>
            </g>
          );
        })}

        {/* Painel lateral: legenda com a contagem em coluna à direita (ROT-5), depois os totais. */}
        <text className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={TEXT_NOTE} x={PANEL_X} y={PANEL_HEADER_BASELINE}>
          {`Produto dominante em ${asOfLabel}`}
        </text>
        <text className="font-sans" fill="var(--text-muted)" fontSize={TEXT_NOTE} textAnchor="end" x={BODY_WIDTH} y={PANEL_HEADER_BASELINE}>
          contas
        </text>
        {legend.map((row, order) => {
          const center = LEGEND_FIRST_CENTER + order * LEGEND_STEP;
          return (
            <g key={row.key}>
              <circle aria-hidden cx={PANEL_X + SAMPLE_RADIUS} cy={center} fill={row.color} r={SAMPLE_RADIUS} />
              <text className="font-sans tabular-nums" fill="var(--text-secondary)" fontSize={TEXT_MAIN} x={PANEL_X + 2 * SAMPLE_RADIUS + SAMPLE_GAP} y={center + MAIN_BASELINE_SHIFT}>
                {row.label}
              </text>
              <text className="font-display" fill="var(--text-primary)" fontSize={TEXT_VALUE} fontWeight={600} textAnchor="end" x={BODY_WIDTH} y={center + VALUE_BASELINE_SHIFT}>
                {formatInt(row.count)}
              </text>
            </g>
          );
        })}
        {totals.map(([label, value], order) => (
          <g key={label}>
            <text className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={TEXT_NOTE} x={PANEL_X} y={totalsFirst + order * TOTALS_STEP}>
              {label}
            </text>
            <text className="font-display" fill="var(--text-primary)" fontSize={TEXT_MAIN} fontWeight={500} textAnchor="end" x={BODY_WIDTH} y={totalsFirst + order * TOTALS_STEP}>
              {value}
            </text>
          </g>
        ))}

        {/* Chaves do que a legenda de cor não diz: o anel da ponte e a espessura da aresta, com o
            último degrau no maior peso OBSERVADO (ROT-5b). */}
        <circle aria-hidden cx={ringCenter} cy={keyFirst - MAIN_BASELINE_SHIFT} fill="var(--text-muted)" r={NODE_RADIUS} />
        <circle aria-hidden cx={ringCenter} cy={keyFirst - MAIN_BASELINE_SHIFT} fill="none" r={NODE_RADIUS + RING_OFFSET} stroke="var(--text-primary)" strokeWidth={RING_STROKE} />
        <text className="font-sans" fill="var(--text-muted)" fontSize={TEXT_NOTE} x={PANEL_X + 2 * (NODE_RADIUS + RING_OFFSET) + SAMPLE_GAP} y={keyFirst}>
          ponte: liga dois grupos e leva o nome
        </text>
        {layout.maxShared === null ? null : (
          <>
            <line stroke="var(--text-muted)" strokeWidth={edgeWidth(MIN_SHARED)} x1={PANEL_X} x2={PANEL_X + KEY_LINE} y1={keyFirst + KEY_STEP - MAIN_BASELINE_SHIFT} y2={keyFirst + KEY_STEP - MAIN_BASELINE_SHIFT} />
            <line
              stroke="var(--text-muted)"
              strokeWidth={edgeWidth(layout.maxShared)}
              x1={PANEL_X + KEY_LINE + KEY_LINE_GAP}
              x2={PANEL_X + 2 * KEY_LINE + KEY_LINE_GAP}
              y1={keyFirst + KEY_STEP - MAIN_BASELINE_SHIFT}
              y2={keyFirst + KEY_STEP - MAIN_BASELINE_SHIFT}
            />
            <text className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={TEXT_NOTE} x={PANEL_X + 2 * KEY_LINE + KEY_LINE_GAP + SAMPLE_GAP} y={keyFirst + KEY_STEP}>
              {`de ${formatInt(MIN_SHARED)} a ${productsLabel(layout.maxShared)} em comum`}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
