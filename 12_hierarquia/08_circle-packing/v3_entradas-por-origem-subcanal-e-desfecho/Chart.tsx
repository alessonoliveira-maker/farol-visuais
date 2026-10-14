import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, outcomes, type OriginGroup, type OutcomeKind } from './data';

/**
 * Circle packing de três níveis: origem, subcanal e desfecho. A raiz fica FORA do desenho, porque
 * um círculo em volta de tudo só consome raio e não diz nada: o que importa é como as origens se
 * comparam entre si, e para isso elas precisam do maior raio que o corpo comporta.
 *
 * O que cada canal de tinta carrega, um por informação:
 *
 * 1. ÁREA é o volume de entradas da folha, com raio pela raiz quadrada do valor e sem raio mínimo,
 *    então a área sai exatamente proporcional ao valor (GEO-3). O círculo do subcanal e o da origem
 *    NÃO codificam área: o raio deles nasce do espaço que os filhos ocuparam no empacotamento.
 *    Quem compara subcanal é a tabela de baixo, e a legenda de área avisa que o tamanho é aproximado.
 * 2. PREENCHIMENTO da folha é o desfecho, em cor semântica com polaridade (COR-6).
 * 3. CONTORNO do grupo é a origem, na cor categórica fixa do `slot` (COR-3). O contorno da origem
 *    tem 2 px e o do subcanal 1 px, para os dois níveis não lerem como um só.
 * 4. RÓTULO NO ARCO SUPERIOR nomeia o grupo, ancorado por fora e com a folga reservada contra a
 *    ALTURA DA CAIXA de tinta, nunca contra a linha de base: numa borda curva a âncora aparentemente
 *    fora da marca reentra pelo canto de baixo (GEO-19). Cada rótulo é testado contra todo disco e
 *    todo anel do desenho, acima e abaixo do círculo, e quando nenhuma das duas posições fica limpa
 *    o grupo é nomeado só na tabela. O rótulo da origem sai na própria cor dela, o que economiza uma
 *    legenda: nome e cor chegam juntos.
 *
 * Tudo é desenhado num `<svg>` do tamanho do corpo, para a escala sair 1 e o tamanho declarado do
 * texto ser o que chega à tela (GEO-18).
 */
export interface OriginOutcomePackingProps {
  readonly data?: readonly OriginGroup[];
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas de 640x500 na moldura `card` com o caso de uso em uma linha. */
const BODY_WIDTH = 574;
const BODY_HEIGHT = 381.5;

const READING_BASELINE = 12;
const BAND_TOP = 28;
const SIDE_WIDTH = 230;
/** 17.7: do gráfico até a legenda lateral. */
const SIDE_GAP = 24;
const PLOT_WIDTH = BODY_WIDTH - SIDE_WIDTH - SIDE_GAP;
const PLOT_HEIGHT = 245.5;
const SIDE_X = PLOT_WIDTH + SIDE_GAP;
const TABLE_BASELINE = BAND_TOP + PLOT_HEIGHT + 23;

const TEXT_MAIN = 12;
const TEXT_NOTE = 11;
const LINE_MAIN = 16;
const LINE_NOTE = 15;
const LABEL_MARGIN = 4;
const SAMPLE_RADIUS = 6;
/** 17.7: da amostra até o texto da legenda. */
const SAMPLE_GAP = 10;
/** 17.7: itens da legenda entre si. */
const LEGEND_STEP = LINE_MAIN + 10;
/** Faixa reservada no topo do desenho para o rótulo do grupo mais alto. */
const ARC_BAND = 20;
/**
 * Folga de posicionamento do rótulo de arco. É MAIOR que a folga do teste de limpeza de propósito:
 * com as duas iguais, a caixa nasce exatamente sobre a fronteira e o teste, que é estrito, recusa
 * toda posição por diferença de ponto flutuante. Foi o que apagou os dois rótulos de origem na
 * primeira medição desta peça.
 */
const ARC_CLEARANCE = LABEL_MARGIN + 2;
/** Vão mínimo entre dois degraus da régua de área, para os rótulos deles não lerem como um só. */
const RULER_MIN_GAP = 14;

const LEAF_GAP_PX = 2;
const SUB_GAP_PX = 5;
const ORIGIN_GAP_PX = 8;
const SUB_MARGIN_PX = 4;
/**
 * Margem entre o subcanal mais distante e o anel da origem. Ela é larga de propósito: é nessa faixa
 * que o rótulo de arco do subcanal cabe sem cruzar o anel do pai nem encostar num disco.
 */
const ORIGIN_MARGIN_PX = 18;
const ORIGIN_STROKE = 2;
const SUB_STROKE = 1;
const PLOT_INSET = 2;
const SCALE_PASSES = 4;
/** Quantos aneis a varredura tenta antes de desistir de achar posicao livre. */
const MAX_RINGS = 400;
/** Passo do anel e do arco, como fração do MENOR raio do conjunto que está sendo empacotado. */
const RING_STEP_FRACTION = 0.3;

/** Métrica vertical da caixa de tinta, por tamanho de fonte, para reservar folga pela CAIXA. */
const INK_ASCENT = 0.74;
const INK_DESCENT = 0.26;

/**
 * Avanço por glifo, em em, na mesma tabela que a guarda COLISAO-TEXTO usa. A média por classe erra
 * de 8% a 26% para baixo em string real, e para baixo é o lado que esconde colisão.
 */
const ADVANCE_SANS: Readonly<Record<string, number>> = {
  ' ': 0.216, $: 0.589, '%': 0.891, '(': 0.437, ')': 0.437, '+': 0.52, ',': 0.2, '-': 0.433,
  '.': 0.228, '/': 0.367, '=': 0.721, A: 0.693, B: 0.641, C: 0.728, D: 0.641, E: 0.58, F: 0.462,
  G: 0.694, H: 0.732, I: 0.316, J: 0.524, K: 0.569, L: 0.513, M: 0.834, N: 0.705, O: 0.795,
  P: 0.612, Q: 0.639, R: 0.617, S: 0.611, T: 0.576, V: 0.577, W: 0.76, a: 0.567, b: 0.632,
  c: 0.526, d: 0.599, e: 0.593, f: 0.382, g: 0.579, h: 0.587, i: 0.257, j: 0.227, k: 0.667,
  l: 0.243, m: 0.822, n: 0.607, o: 0.605, p: 0.58, q: 0.543, r: 0.351, s: 0.53, t: 0.394,
  u: 0.623, v: 0.457, w: 0.625, x: 0.464, y: 0.702, z: 0.516, 'É': 0.562, 'á': 0.558, 'â': 0.497,
  'ã': 0.58, 'ç': 0.536, 'é': 0.574, 'ê': 0.618, 'í': 0.217, 'ó': 0.641, 'õ': 0.525, 'ú': 0.603,
  '0': 0.613, '1': 0.405, '2': 0.576, '3': 0.561, '4': 0.593, '5': 0.579, '6': 0.627, '7': 0.486,
  '8': 0.588, '9': 0.597, '›': 0.55,
};

const ADVANCE_DISPLAY: Readonly<Record<string, number>> = {
  ' ': 0.302, $: 0.599, '%': 0.762, '+': 0.616, ',': 0.267, '/': 0.403, A: 0.557, L: 0.557,
  R: 0.599, S: 0.557, T: 0.556, a: 0.605, c: 0.607, d: 0.624, e: 0.563, f: 0.505, g: 0.618,
  h: 0.563, i: 0.52, l: 0.268, m: 0.52, n: 0.615, o: 0.591, p: 0.588, r: 0.448, s: 0.464,
  t: 0.506, '·': 0.186, 'º': 0.446, '−': 0.621,
};

const ADVANCE_FALLBACK = 0.55;
/** Sob `tabular-nums` todo dígito mede o mesmo, nas duas famílias e em todos os pesos. */
const ADVANCE_TABULAR_DIGIT = 0.62;
/** Folga por linha que cobre o p99 do erro da tabela nas duas famílias. */
const INK_SLACK = 2;

function inkWidth(text: string, size: number, display: boolean, tabular: boolean): number {
  let em = 0;
  for (const glyph of text) {
    if (tabular && glyph >= '0' && glyph <= '9') {
      em += ADVANCE_TABULAR_DIGIT;
      continue;
    }
    const own = display ? ADVANCE_DISPLAY[glyph] : ADVANCE_SANS[glyph];
    em += own ?? ADVANCE_SANS[glyph] ?? ADVANCE_FALLBACK;
  }
  return em * size + INK_SLACK;
}

interface Spot {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

/**
 * Empacotamento por varredura de anel: `radii` já vem do maior para o menor, o primeiro círculo
 * fica no centro e cada seguinte varre o anel INTEIRO antes de o anel crescer. Varrer o anel todo
 * é o que entrega um conjunto compacto e redondo; a espiral que cresce o raio a cada passo aceita a
 * primeira posição livre de um arco curto e empilha os círculos numa direção só, o que mede uma
 * caixa alta e estreita e derruba a escala do desenho inteiro. No fim o conjunto é recentrado na
 * própria caixa, para o raio do pai não pagar o deslocamento do primeiro círculo.
 */
function packCircles(radii: readonly number[], gap: number): readonly Spot[] {
  const placed: Spot[] = [];
  const smallest = radii.reduce((low, r) => Math.min(low, r), radii[0] ?? 1);
  const step = Math.max(smallest * RING_STEP_FRACTION, 1e-6);
  for (const r of radii) {
    if (placed.length === 0) {
      placed.push({ x: 0, y: 0, r });
      continue;
    }
    let spotX = 0;
    let spotY = 0;
    let found = false;
    for (let ring = 1; ring <= MAX_RINGS && !found; ring += 1) {
      const reach = ring * step;
      const slots = Math.max(8, Math.ceil((2 * Math.PI * reach) / step));
      for (let slot = 0; slot < slots; slot += 1) {
        const angle = (2 * Math.PI * slot) / slots;
        const x = reach * Math.cos(angle);
        const y = reach * Math.sin(angle);
        if (placed.some((p) => Math.hypot(x - p.x, y - p.y) < p.r + r + gap)) continue;
        spotX = x;
        spotY = y;
        found = true;
        break;
      }
    }
    placed.push({ x: spotX, y: spotY, r });
  }
  const minX = placed.reduce((low, p) => Math.min(low, p.x - p.r), Number.POSITIVE_INFINITY);
  const maxX = placed.reduce((high, p) => Math.max(high, p.x + p.r), Number.NEGATIVE_INFINITY);
  const minY = placed.reduce((low, p) => Math.min(low, p.y - p.r), Number.POSITIVE_INFINITY);
  const maxY = placed.reduce((high, p) => Math.max(high, p.y + p.r), Number.NEGATIVE_INFINITY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return placed.map((p) => ({ x: p.x - centerX, y: p.y - centerY, r: p.r }));
}

interface RawLeaf {
  readonly id: string;
  readonly kind: OutcomeKind;
  readonly entries: number;
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

interface RawSub {
  readonly id: string;
  readonly label: string;
  readonly total: number;
  readonly leaves: readonly RawLeaf[];
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

interface RawOrigin {
  readonly id: string;
  readonly label: string;
  readonly slot: number;
  readonly total: number;
  readonly subs: readonly RawSub[];
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

/** Uma passada dos três níveis em unidade de layout, com os vãos já convertidos para essa unidade. */
function packPass(
  groups: readonly OriginGroup[],
  leafGap: number,
  subGap: number,
  originGap: number,
  subMargin: number,
  originMargin: number,
): readonly RawOrigin[] {
  const origins = groups
    .map((origin) => {
      const built = origin.children
        .map((sub) => {
          const leaves = [...sub.children]
            .filter((leaf) => leaf.entries > 0)
            .sort((a, b) => b.entries - a.entries || a.id.localeCompare(b.id));
          const spots = packCircles(
            leaves.map((leaf) => Math.sqrt(leaf.entries)),
            leafGap,
          );
          const placed: RawLeaf[] = leaves.map((leaf, index) => {
            const spot = spots[index];
            return {
              id: leaf.id,
              kind: leaf.kind,
              entries: leaf.entries,
              x: spot?.x ?? 0,
              y: spot?.y ?? 0,
              r: spot?.r ?? 0,
            };
          });
          const reach = placed.reduce((far, leaf) => Math.max(far, Math.hypot(leaf.x, leaf.y) + leaf.r), 0);
          const total = sub.children.reduce((sum, leaf) => sum + leaf.entries, 0);
          return { id: sub.id, label: sub.label, total, leaves: placed, r: reach + subMargin };
        })
        .filter((sub) => sub.leaves.length > 0);
      const ordered = [...built].sort((a, b) => b.r - a.r || a.id.localeCompare(b.id));
      const subSpots = packCircles(
        ordered.map((sub) => sub.r),
        subGap,
      );
      const subs: RawSub[] = ordered.map((sub, index) => {
        const spot = subSpots[index];
        return { ...sub, x: spot?.x ?? 0, y: spot?.y ?? 0 };
      });
      const reach = subs.reduce((far, sub) => Math.max(far, Math.hypot(sub.x, sub.y) + sub.r), 0);
      const total = origin.children
        .flatMap((sub) => sub.children)
        .reduce((sum, leaf) => sum + leaf.entries, 0);
      return {
        id: origin.id,
        label: origin.label,
        slot: origin.slot,
        total,
        subs,
        r: reach + originMargin,
      };
    })
    .filter((origin) => origin.subs.length > 0);
  const ordered = [...origins].sort((a, b) => b.r - a.r || a.id.localeCompare(b.id));
  const spots = packCircles(
    ordered.map((origin) => origin.r),
    originGap,
  );
  return ordered.map((origin, index) => {
    const spot = spots[index];
    return { ...origin, x: spot?.x ?? 0, y: spot?.y ?? 0 };
  });
}

interface Layout {
  readonly origins: readonly RawOrigin[];
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

/**
 * Empacota os três níveis e resolve a escala em quatro passadas, para o vão entre círculos ficar
 * em pixel constante na tela e não em unidade de layout, que varia com o total. O enquadramento
 * sai da CAIXA do conjunto, não da distância até a origem do empacotamento.
 */
function buildLayout(groups: readonly OriginGroup[], width: number, height: number): Layout | null {
  let leafGap = 0;
  let subGap = 0;
  let originGap = 0;
  let subMargin = 0;
  let originMargin = 0;
  let packed: readonly RawOrigin[] = [];
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  for (let pass = 0; pass < SCALE_PASSES; pass += 1) {
    packed = packPass(groups, leafGap, subGap, originGap, subMargin, originMargin);
    if (packed.length === 0) return null;
    const minX = packed.reduce((low, o) => Math.min(low, o.x - o.r), Number.POSITIVE_INFINITY);
    const maxX = packed.reduce((high, o) => Math.max(high, o.x + o.r), Number.NEGATIVE_INFINITY);
    const minY = packed.reduce((low, o) => Math.min(low, o.y - o.r), Number.POSITIVE_INFINITY);
    const maxY = packed.reduce((high, o) => Math.max(high, o.y + o.r), Number.NEGATIVE_INFINITY);
    const spanX = Math.max(maxX - minX, 1e-6);
    const spanY = Math.max(maxY - minY, 1e-6);
    scale = Math.min(width / spanX, height / spanY);
    offsetX = -minX + (width / scale - spanX) / 2;
    offsetY = -minY + (height / scale - spanY) / 2;
    leafGap = LEAF_GAP_PX / scale;
    subGap = SUB_GAP_PX / scale;
    originGap = ORIGIN_GAP_PX / scale;
    subMargin = SUB_MARGIN_PX / scale;
    originMargin = ORIGIN_MARGIN_PX / scale;
  }
  return { origins: packed, scale, offsetX, offsetY };
}

const OUTCOME_FILL: Readonly<Record<OutcomeKind, string>> = {
  convertida: 'var(--positive)',
  aberta: 'var(--warning)',
  descartada: 'var(--negative)',
};

/** Degraus redondos da régua de área, todos abaixo do máximo; o último degrau é o máximo do dado. */
const LEGEND_REFERENCES = [10, 40] as const;

function legendValues(maxEntries: number): readonly number[] {
  return [...LEGEND_REFERENCES.filter((value) => value < maxEntries), maxEntries];
}

interface RulerStep {
  readonly value: number;
  readonly radius: number;
}

/**
 * Tira da régua o degrau cujo círculo encosta no anterior: dois círculos quase iguais leem como um
 * só e os rótulos deles se encontram. O maior valor do recorte nunca sai, porque é ele que dá
 * referência à maior marca da tela (ROT-5b).
 */
function thinRuler(steps: readonly RulerStep[]): readonly RulerStep[] {
  const ordered = [...steps].sort((a, b) => b.radius - a.radius);
  const kept: RulerStep[] = [];
  for (const step of ordered) {
    const last = kept[kept.length - 1];
    if (last === undefined || 2 * (last.radius - step.radius) >= RULER_MIN_GAP) kept.push(step);
  }
  return kept;
}

function slotColor(slot: number): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

function entriesLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'entrada' : 'entradas'}`;
}

function countLabel(value: number): string {
  return formatInt(value);
}

/** Taxa sempre com o par de volume (DAD-1). */
function shareLabel(part: number, whole: number): string {
  return formatRateWithVolume(part, whole);
}

interface InkBox {
  readonly x0: number;
  readonly x1: number;
  readonly y0: number;
  readonly y1: number;
}

/** A caixa de tinta de um texto centrado, medida pela ALTURA dela e não pela linha de base. */
function inkBoxCentered(text: string, size: number, cx: number, baseline: number): InkBox {
  const half = inkWidth(text, size, false, true) / 2;
  return {
    x0: cx - half,
    x1: cx + half,
    y0: baseline - size * INK_ASCENT,
    y1: baseline + size * INK_DESCENT,
  };
}

interface Disc {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

function nearestDistance(box: InkBox, disc: Disc): number {
  const dx = Math.max(box.x0 - disc.x, 0, disc.x - box.x1);
  const dy = Math.max(box.y0 - disc.y, 0, disc.y - box.y1);
  return Math.hypot(dx, dy);
}

function farthestDistance(box: InkBox, disc: Disc): number {
  const dx = Math.max(Math.abs(box.x0 - disc.x), Math.abs(box.x1 - disc.x));
  const dy = Math.max(Math.abs(box.y0 - disc.y), Math.abs(box.y1 - disc.y));
  return Math.hypot(dx, dy);
}

/**
 * A caixa está limpa quando não toca nenhum disco preenchido e não ATRAVESSA nenhum anel: contra o
 * anel valem as duas saídas, inteiramente dentro ou inteiramente fora, porque texto que cruza um
 * traço fino perde a marca por baixo dele (GEO-4) e nenhuma cor de halo resolve isso.
 */
function boxIsClear(box: InkBox, discs: readonly Disc[], rings: readonly Disc[]): boolean {
  if (box.x0 < 0 || box.x1 > PLOT_WIDTH || box.y0 < BAND_TOP || box.y1 > BAND_TOP + PLOT_HEIGHT) {
    return false;
  }
  if (discs.some((disc) => nearestDistance(box, disc) < disc.r + LABEL_MARGIN)) return false;
  return rings.every((ring) => {
    const near = nearestDistance(box, ring);
    const far = farthestDistance(box, ring);
    return far < ring.r - LABEL_MARGIN || near > ring.r + LABEL_MARGIN;
  });
}

/**
 * Tenta três posições, nesta ordem: por dentro do arco superior do próprio círculo, por fora do
 * arco superior e por fora do arco inferior. A folga sai da ALTURA da caixa e não da linha de base:
 * por fora, acima, quem precisa livrar a borda é o canto de baixo; por fora, abaixo, o canto de
 * cima; por dentro, os quatro cantos precisam ficar dentro do anel e longe de todo disco.
 */
function placeArcLabel(
  text: string,
  size: number,
  circle: Disc,
  discs: readonly Disc[],
  rings: readonly Disc[],
): number | null {
  const inside = circle.y - circle.r + ARC_CLEARANCE + size * INK_ASCENT;
  if (boxIsClear(inkBoxCentered(text, size, circle.x, inside), discs, rings)) return inside;
  const above = circle.y - circle.r - ARC_CLEARANCE - size * INK_DESCENT;
  if (boxIsClear(inkBoxCentered(text, size, circle.x, above), discs, rings)) return above;
  const below = circle.y + circle.r + ARC_CLEARANCE + size * INK_ASCENT;
  if (boxIsClear(inkBoxCentered(text, size, circle.x, below), discs, rings)) return below;
  return null;
}

/**
 * O número cabe dentro do disco quando a meia diagonal da caixa de tinta, mais a folga, não passa
 * do raio. Contido, o texto vai vazado na cor da superfície e sem halo (ROT-7b).
 */
function fitsInCircle(text: string, size: number, radius: number): boolean {
  const half = inkWidth(text, size, true, true) / 2;
  return Math.hypot(half, size / 2) + LABEL_MARGIN <= radius;
}

const TABLE_COLUMN_STEP = 80;

/** A coluna de cada desfecho na tabela, contada da direita, com a de total na borda. */
function tableColumnX(index: number): number {
  return BODY_WIDTH - 4 - (outcomes.length - index) * TABLE_COLUMN_STEP;
}

interface DrawnLeaf {
  readonly id: string;
  readonly kind: OutcomeKind;
  readonly entries: number;
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
}

interface DrawnSub {
  readonly id: string;
  readonly label: string;
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  readonly leaves: readonly DrawnLeaf[];
}

interface DrawnOrigin {
  readonly id: string;
  readonly label: string;
  readonly slot: number;
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  readonly subs: readonly DrawnSub[];
}

export default function OriginOutcomePacking({
  data = defaultData,
  height,
  className,
}: OriginOutcomePackingProps) {
  const style = height === undefined ? undefined : { height };
  const everySub = data.flatMap((origin) => origin.children);
  const everyLeaf = everySub.flatMap((sub) => sub.children);
  const total = everyLeaf.reduce((sum, leaf) => sum + leaf.entries, 0);
  const outcomeTotals = outcomes.map((outcome) => ({
    kind: outcome.kind,
    label: outcome.label,
    total: everyLeaf
      .filter((leaf) => leaf.kind === outcome.kind)
      .reduce((sum, leaf) => sum + leaf.entries, 0),
  }));
  const lead = outcomeTotals.reduce<{ kind: OutcomeKind; label: string; total: number } | null>(
    (best, current) => (best === null || current.total > best.total ? current : best),
    null,
  );
  const flat = data.flatMap((origin) =>
    origin.children.flatMap((sub) => sub.children.map((leaf) => ({ leaf, subLabel: sub.label }))),
  );
  const biggest = flat.reduce<{ leaf: { readonly kind: OutcomeKind; readonly entries: number }; subLabel: string } | null>(
    (best, current) => (best === null || current.leaf.entries > best.leaf.entries ? current : best),
    null,
  );
  const layout = buildLayout(
    data,
    PLOT_WIDTH - 2 * PLOT_INSET,
    PLOT_HEIGHT - ARC_BAND - 2 * PLOT_INSET,
  );

  if (lead === null || biggest === null || total === 0 || layout === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma entrada neste recorte: sem volume, não há área a empacotar em círculos.</span>
      </div>
    );
  }

  const topY = BAND_TOP + ARC_BAND + PLOT_INSET;
  const origins: readonly DrawnOrigin[] = layout.origins.map((origin) => {
    const cx = PLOT_INSET + (origin.x + layout.offsetX) * layout.scale;
    const cy = topY + (origin.y + layout.offsetY) * layout.scale;
    return {
      id: origin.id,
      label: origin.label,
      slot: origin.slot,
      cx,
      cy,
      radius: origin.r * layout.scale,
      subs: origin.subs.map((sub) => {
        const subX = cx + sub.x * layout.scale;
        const subY = cy + sub.y * layout.scale;
        return {
          id: sub.id,
          label: sub.label,
          cx: subX,
          cy: subY,
          radius: sub.r * layout.scale,
          leaves: sub.leaves.map((leaf) => ({
            id: leaf.id,
            kind: leaf.kind,
            entries: leaf.entries,
            cx: subX + leaf.x * layout.scale,
            cy: subY + leaf.y * layout.scale,
            radius: leaf.r * layout.scale,
          })),
        };
      }),
    };
  });

  const discs: readonly Disc[] = origins.flatMap((origin) =>
    origin.subs.flatMap((sub) => sub.leaves.map((leaf) => ({ x: leaf.cx, y: leaf.cy, r: leaf.radius }))),
  );
  const rings: readonly Disc[] = [
    ...origins.map((origin) => ({ x: origin.cx, y: origin.cy, r: origin.radius })),
    ...origins.flatMap((origin) => origin.subs.map((sub) => ({ x: sub.cx, y: sub.cy, r: sub.radius }))),
  ];

  const originLabels = origins.map((origin) => ({
    id: origin.id,
    label: origin.label,
    slot: origin.slot,
    cx: origin.cx,
    baseline: placeArcLabel(
      origin.label,
      TEXT_NOTE,
      { x: origin.cx, y: origin.cy, r: origin.radius },
      discs,
      rings,
    ),
  }));
  const subLabels = origins.flatMap((origin) =>
    origin.subs.map((sub) => ({
      id: sub.id,
      label: sub.label,
      cx: sub.cx,
      baseline: placeArcLabel(
        sub.label,
        TEXT_NOTE,
        { x: sub.cx, y: sub.cy, r: sub.radius },
        discs,
        rings,
      ),
    })),
  );

  const tableRows = data.flatMap((origin) =>
    origin.children.map((sub) => ({
      id: sub.id,
      label: `${origin.label} › ${sub.label}`,
      counts: outcomes.map((outcome) =>
        sub.children
          .filter((leaf) => leaf.kind === outcome.kind)
          .reduce((sum, leaf) => sum + leaf.entries, 0),
      ),
      total: sub.children.reduce((sum, leaf) => sum + leaf.entries, 0),
    })),
  );
  const dominated = everySub.filter((sub) => {
    const top = sub.children.reduce<{ readonly kind: OutcomeKind; readonly entries: number } | null>(
      (best, current) => (best === null || current.entries > best.entries ? current : best),
      null,
    );
    return top !== null && top.kind === lead.kind;
  }).length;

  const biggestOutcome = outcomes.find((outcome) => outcome.kind === biggest.leaf.kind);
  const summary = [
    `Empacotamento de círculos em três níveis, raiz fora do desenho: ${countLabel(origins.length)} origens, ${countLabel(everySub.length)} subcanais, ${entriesLabel(total)}.`,
    `${lead.label} lidera ${countLabel(dominated)} de ${countLabel(everySub.length)} subcanais e ${shareLabel(lead.total, total)} das entradas.`,
    `Maior círculo: ${biggest.subLabel}, ${biggestOutcome?.label ?? ''}, ${entriesLabel(biggest.leaf.entries)}.`,
  ].join(' ');

  const rulerSteps = thinRuler(
    legendValues(biggest.leaf.entries).map((value) => ({
      value,
      radius: Math.sqrt(value) * layout.scale,
    })),
  );
  const rulerMax = rulerSteps.reduce((widest, step) => Math.max(widest, step.radius), 0);
  const legendTop = BAND_TOP + 11;
  const rulerCaption = legendTop + 21 + outcomes.length * LEGEND_STEP;
  // A régua encosta logo abaixo da nota, e não no fundo da faixa: solta no meio do vazio ela lê
  // como um desenho à parte em vez de como a chave de leitura dos círculos.
  const rulerBottom = rulerCaption + 2 * LINE_NOTE + 16 + 2 * rulerMax;
  const valueColumnX = BODY_WIDTH - 4;

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="figure" style={style}>
      <svg className="h-full w-full" viewBox={`0 0 ${String(BODY_WIDTH)} ${String(BODY_HEIGHT)}`}>
        {/* Linha de leitura (ANO-5): a conclusao, calculada do dado. */}
        <text
          aria-hidden
          className="font-sans tabular-nums"
          fill="var(--text-secondary)"
          fontSize={TEXT_MAIN}
          x={0}
          y={READING_BASELINE}
        >
          {`${lead.label} lidera ${countLabel(dominated)} de ${countLabel(everySub.length)} subcanais e `}
          <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
            {shareLabel(lead.total, total)}
          </tspan>
          {' das entradas.'}
        </text>

        {origins.map((origin) => (
          <g key={origin.id}>
            <circle
              cx={origin.cx}
              cy={origin.cy}
              fill="none"
              r={origin.radius}
              stroke={slotColor(origin.slot)}
              strokeWidth={ORIGIN_STROKE}
              vectorEffect="non-scaling-stroke"
            />
            {origin.subs.map((sub) => (
              <g key={sub.id}>
                <circle
                  cx={sub.cx}
                  cy={sub.cy}
                  fill="none"
                  r={sub.radius}
                  stroke={slotColor(origin.slot)}
                  strokeWidth={SUB_STROKE}
                  vectorEffect="non-scaling-stroke"
                />
                {sub.leaves.map((leaf) => (
                  <circle cx={leaf.cx} cy={leaf.cy} fill={OUTCOME_FILL[leaf.kind]} key={leaf.id} r={leaf.radius} />
                ))}
                {sub.leaves
                  .filter((leaf) => fitsInCircle(countLabel(leaf.entries), TEXT_MAIN, leaf.radius))
                  .map((leaf) => (
                    <text
                      className="font-display"
                      dominantBaseline="central"
                      fill="var(--surface-raised)"
                      fontSize={TEXT_MAIN}
                      fontWeight={500}
                      key={leaf.id}
                      textAnchor="middle"
                      x={leaf.cx}
                      y={leaf.cy}
                    >
                      {countLabel(leaf.entries)}
                    </text>
                  ))}
              </g>
            ))}
          </g>
        ))}

        {/* Rotulo de grupo no arco, quando a caixa de tinta fica limpa. */}
        {subLabels
          .filter((entry) => entry.baseline !== null)
          .map((entry) => (
            <text
              className="font-sans"
              fill="var(--text-secondary)"
              fontSize={TEXT_NOTE}
              key={entry.id}
              textAnchor="middle"
              x={entry.cx}
              y={entry.baseline ?? 0}
            >
              {entry.label}
            </text>
          ))}
        {originLabels
          .filter((entry) => entry.baseline !== null)
          .map((entry) => (
            <text
              className="font-sans"
              fill={slotColor(entry.slot)}
              fontSize={TEXT_NOTE}
              fontWeight={600}
              key={entry.id}
              textAnchor="middle"
              x={entry.cx}
              y={entry.baseline ?? 0}
            >
              {entry.label}
            </text>
          ))}

        {/* Legenda de desfecho, ao lado do grafico, com amostra na forma da marca. */}
        <text className="font-sans" fill="var(--text-muted)" fontSize={TEXT_NOTE} x={SIDE_X} y={legendTop}>
          Entradas por desfecho
        </text>
        {outcomeTotals.map((outcome, index) => (
          <g key={outcome.kind}>
            <circle
              cx={SIDE_X + SAMPLE_RADIUS}
              cy={legendTop + 17 + index * LEGEND_STEP}
              fill={OUTCOME_FILL[outcome.kind]}
              r={SAMPLE_RADIUS}
            />
            <text
              className="font-sans"
              fill="var(--text-secondary)"
              fontSize={TEXT_MAIN}
              x={SIDE_X + 2 * SAMPLE_RADIUS + SAMPLE_GAP}
              y={legendTop + 21 + index * LEGEND_STEP}
            >
              {outcome.label}
            </text>
            <text
              className="font-display"
              fill="var(--text-primary)"
              fontSize={TEXT_MAIN}
              fontWeight={500}
              textAnchor="end"
              x={valueColumnX}
              y={legendTop + 21 + index * LEGEND_STEP}
            >
              {countLabel(outcome.total)}
            </text>
          </g>
        ))}

        {/* Regua de area: o ultimo degrau e o maior valor do recorte, nunca constante (ROT-5b). */}
        <text className="font-sans" fill="var(--text-muted)" fontSize={TEXT_NOTE} x={SIDE_X} y={rulerCaption}>
          Régua de área, em entradas
        </text>
        <text
          className="font-sans"
          fill="var(--text-muted)"
          fontSize={TEXT_NOTE}
          x={SIDE_X}
          y={rulerCaption + LINE_NOTE}
        >
          O tamanho é aproximado: a leitura
        </text>
        <text
          className="font-sans"
          fill="var(--text-muted)"
          fontSize={TEXT_NOTE}
          x={SIDE_X}
          y={rulerCaption + 2 * LINE_NOTE}
        >
          exata sai do número escrito.
        </text>
        {rulerSteps.map((step) => (
          <circle
            cx={SIDE_X + rulerMax}
            cy={rulerBottom - step.radius}
            fill="none"
            key={step.value}
            r={step.radius}
            stroke="var(--text-muted)"
            strokeWidth={SUB_STROKE}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {rulerSteps.map((step) => (
          <text
            className="font-display"
            dominantBaseline="central"
            fill="var(--text-muted)"
            fontSize={TEXT_NOTE}
            key={step.value}
            x={SIDE_X + 2 * rulerMax + 8}
            y={rulerBottom - 2 * step.radius}
          >
            {countLabel(step.value)}
          </text>
        ))}

        {/* Identificacao por nivel (ROT-10): cada linha diz pai e filho, e as colunas dao o desfecho. */}
        {outcomes.map((outcome, index) => (
          <text
            className="font-sans"
            fill="var(--text-muted)"
            fontSize={TEXT_NOTE}
            key={outcome.kind}
            textAnchor="end"
            x={tableColumnX(index)}
            y={TABLE_BASELINE}
          >
            {outcome.label}
          </text>
        ))}
        <text
          className="font-sans"
          fill="var(--text-muted)"
          fontSize={TEXT_NOTE}
          textAnchor="end"
          x={valueColumnX}
          y={TABLE_BASELINE}
        >
          Entradas
        </text>
        {tableRows.map((row, rowIndex) => (
          <g key={row.id}>
            <text
              className="font-sans"
              fill="var(--text-secondary)"
              fontSize={TEXT_NOTE}
              x={0}
              y={TABLE_BASELINE + (rowIndex + 1) * LINE_NOTE}
            >
              {row.label}
            </text>
            {row.counts.map((count, index) => (
              <text
                className="font-display"
                fill="var(--text-secondary)"
                fontSize={TEXT_NOTE}
                key={outcomes[index]?.kind ?? String(index)}
                textAnchor="end"
                x={tableColumnX(index)}
                y={TABLE_BASELINE + (rowIndex + 1) * LINE_NOTE}
              >
                {countLabel(count)}
              </text>
            ))}
            <text
              className="font-display"
              fill="var(--text-primary)"
              fontSize={TEXT_NOTE}
              fontWeight={500}
              textAnchor="end"
              x={valueColumnX}
              y={TABLE_BASELINE + (rowIndex + 1) * LINE_NOTE}
            >
              {countLabel(row.total)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
