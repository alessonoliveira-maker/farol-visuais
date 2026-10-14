import { Filter } from 'lucide-react';

import { formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CreativeNode } from './data';

/**
 * Circle packing com as três saídas que o modelo precisa ter e que o dado bonito esconde.
 *
 * 1. PROFUNDIDADE 1 NÃO É HIERARQUIA. Sem grupo, o empacotamento vira bolhas soltas: a leitura de
 *    agrupamento não existe e sobra a de área, que é das mais imprecisas. A guarda mede a
 *    profundidade da árvore e, com 1, troca a forma por barras horizontais ordenadas, com o aviso
 *    escrito no topo. Trocar a forma é honesto; desenhar bolhas soltas e chamar de hierarquia não.
 * 2. ZERO NÃO TEM ÁREA. Criativo sem lead não pode ser desenhado, porque área zero é círculo
 *    invisível, e sumir por impossibilidade geométrica é igual a sumir por descuido para quem lê.
 *    Então ele sai do desenho e entra numa lista com marcador vazado, o valor escrito e o motivo
 *    (ROT-10, última precisão). Zero medido continua sendo zero e aparece escrito (EST-3).
 * 3. NENHUMA FOLHA POSITIVA É ESTADO VAZIO. Aí não há o que desenhar em forma nenhuma, e o bloco de
 *    estado substitui o visual inteiro (EST-1).
 *
 * O aviso do item 1 não é enfeite de acabamento: ele muda o que a peça afirma. Sem ele, quem vê as
 * barras acha que o modelo é de barras, e quem cola o componente no Farol não descobre que o
 * desenho mudou de forma por causa do recorte.
 */
export interface CreativePackingProps {
  readonly data?: readonly CreativeNode[];
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas `card` (640x360) na moldura `card` com o caso de uso em uma linha. */
const BODY_WIDTH = 574;
const BODY_HEIGHT = 241.5;

const READING_BASELINE = 12;
/** 18 px depois da linha de leitura: 11,75 px de tinta deixam 6,25 px de respiro (ROT-9). */
const NOTICE_BASELINE = 30;
const ROWS_TOP = 42;
/** Passo por faixa. Com 40% de barra sobre o passo, a marca fica em 12 px (ESP-2). */
const ROW_STEP = 30;
const BAR_THICKNESS = 12;
/** 17.7: do rótulo de valor até a ponta da barra. */
const VALUE_LABEL_GAP = 6;
const NAME_GAP = 12;

const TEXT_MAIN = 12;
const TEXT_NOTE = 11;
const LINE_NOTE = 15;
const MARKER_RADIUS = 4;
const MARKER_STROKE = 1.5;
const MARKER_GAP = 6;
const ITEM_GAP = 14;
const LABEL_MARGIN = 4;
/** Largura reservada na linha de chips para a contagem do que não couber nela. */
const REMAINDER_ROOM = 120;

const LEAF_GAP_PX = 2;
const GROUP_GAP_PX = 6;
const GROUP_MARGIN_PX = 5;
const GROUP_STROKE = 2;
const PLOT_INSET = 2;
const SCALE_PASSES = 4;
/** Quantos aneis a varredura tenta antes de desistir de achar posicao livre. */
const MAX_RINGS = 400;
/** Passo do anel e do arco, como fração do MENOR raio do conjunto que está sendo empacotado. */
const RING_STEP_FRACTION = 0.3;

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

/** A contagem nunca sai crua: leva o substantivo (NUM-6). */
function leadsLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'lead' : 'leads'}`;
}

function countLabel(value: number): string {
  return formatInt(value);
}

/** Taxa sempre com o par de volume (DAD-1). */
function shareLabel(part: number, whole: number): string {
  return formatRateWithVolume(part, whole);
}

/**
 * Profundidade da árvore: 1 quando nenhum nó tem filho, que é o recorte sem hierarquia. Nó com
 * filho conta um nível a mais, e a conta desce pela árvore inteira.
 */
function depthOf(nodes: readonly CreativeNode[]): number {
  return nodes.reduce((deepest, node) => {
    const children = node.children ?? [];
    return Math.max(deepest, children.length === 0 ? 1 : 1 + depthOf(children));
  }, 0);
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

interface PackedLeaf {
  readonly id: string;
  readonly label: string;
  readonly leads: number;
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

interface PackedGroup {
  readonly id: string;
  readonly label: string;
  readonly leaves: readonly PackedLeaf[];
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

function packPass(
  nodes: readonly CreativeNode[],
  leafGap: number,
  groupGap: number,
  groupMargin: number,
): readonly PackedGroup[] {
  const built = nodes
    .map((node) => {
      const leaves = [...(node.children ?? [])]
        .filter((leaf) => leaf.leads > 0)
        .sort((a, b) => b.leads - a.leads || a.id.localeCompare(b.id));
      const spots = packCircles(
        leaves.map((leaf) => Math.sqrt(leaf.leads)),
        leafGap,
      );
      const placed: PackedLeaf[] = leaves.map((leaf, index) => {
        const spot = spots[index];
        return {
          id: leaf.id,
          label: leaf.label,
          leads: leaf.leads,
          x: spot?.x ?? 0,
          y: spot?.y ?? 0,
          r: spot?.r ?? 0,
        };
      });
      const reach = placed.reduce((far, leaf) => Math.max(far, Math.hypot(leaf.x, leaf.y) + leaf.r), 0);
      return { id: node.id, label: node.label, leaves: placed, r: reach + groupMargin };
    })
    .filter((group) => group.leaves.length > 0);
  const ordered = [...built].sort((a, b) => b.r - a.r || a.id.localeCompare(b.id));
  const spots = packCircles(
    ordered.map((group) => group.r),
    groupGap,
  );
  return ordered.map((group, index) => {
    const spot = spots[index];
    return { ...group, x: spot?.x ?? 0, y: spot?.y ?? 0 };
  });
}

interface Layout {
  readonly groups: readonly PackedGroup[];
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

/** Empacota e resolve a escala em quatro passadas, para o vão ficar em pixel constante na tela. */
function buildLayout(nodes: readonly CreativeNode[], width: number, height: number): Layout | null {
  let leafGap = 0;
  let groupGap = 0;
  let groupMargin = 0;
  let packed: readonly PackedGroup[] = [];
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  for (let pass = 0; pass < SCALE_PASSES; pass += 1) {
    packed = packPass(nodes, leafGap, groupGap, groupMargin);
    if (packed.length === 0) return null;
    const minX = packed.reduce((low, g) => Math.min(low, g.x - g.r), Number.POSITIVE_INFINITY);
    const maxX = packed.reduce((high, g) => Math.max(high, g.x + g.r), Number.NEGATIVE_INFINITY);
    const minY = packed.reduce((low, g) => Math.min(low, g.y - g.r), Number.POSITIVE_INFINITY);
    const maxY = packed.reduce((high, g) => Math.max(high, g.y + g.r), Number.NEGATIVE_INFINITY);
    const spanX = Math.max(maxX - minX, 1e-6);
    const spanY = Math.max(maxY - minY, 1e-6);
    scale = Math.min(width / spanX, height / spanY);
    offsetX = -minX + (width / scale - spanX) / 2;
    offsetY = -minY + (height / scale - spanY) / 2;
    leafGap = LEAF_GAP_PX / scale;
    groupGap = GROUP_GAP_PX / scale;
    groupMargin = GROUP_MARGIN_PX / scale;
  }
  return { groups: packed, scale, offsetX, offsetY };
}

/** O número cabe dentro do disco quando a meia diagonal da caixa de tinta não passa do raio. */
function fitsInCircle(text: string, size: number, radius: number): boolean {
  const half = inkWidth(text, size, true, true) / 2;
  return Math.hypot(half, size / 2) + LABEL_MARGIN <= radius;
}

interface ChipItem {
  readonly id: string;
  readonly label: string;
  readonly leads: number;
}

interface PlacedChip extends ChipItem {
  readonly x: number;
}

/**
 * Enfileira os chips de identificação numa linha só, medindo cada um pela soma de glifos. O que
 * não couber sai contado, em vez de ser desenhado fora do corpo e desaparecer sem aviso (GEO-1).
 */
function layoutChips(items: readonly ChipItem[], limit: number): {
  readonly chips: readonly PlacedChip[];
  readonly leftOut: number;
} {
  const chips: PlacedChip[] = [];
  let cursor = 0;
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (item === undefined) continue;
    const width =
      2 * MARKER_RADIUS +
      MARKER_GAP +
      inkWidth(`${item.label}, ${leadsLabel(item.leads)}`, TEXT_NOTE, false, true);
    if (cursor + width > limit) return { chips, leftOut: items.length - index };
    chips.push({ ...item, x: cursor });
    cursor += width + ITEM_GAP;
  }
  return { chips, leftOut: 0 };
}

export default function CreativePacking({ data = defaultData, height, className }: CreativePackingProps) {
  const style = height === undefined ? undefined : { height };
  const flat = depthOf(data) < 2 ? data : data.flatMap((node) => node.children ?? []);
  const withVolume = flat.filter((node) => node.leads > 0);
  const zeros = flat.filter((node) => node.leads <= 0);

  if (withVolume.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum criativo com lead neste recorte: sem valor positivo, não há área nem barra a desenhar.</span>
      </div>
    );
  }

  const flatRecorte = depthOf(data) < 2;
  const total = withVolume.reduce((sum, node) => sum + node.leads, 0);
  const ranked = [...withVolume].sort((a, b) => b.leads - a.leads || a.id.localeCompare(b.id));
  const leader = ranked[0];
  const topValue = ranked.reduce((most, node) => Math.max(most, node.leads), 0);

  const summary = [
    flatRecorte
      ? `Barras no lugar do empacotamento: o recorte de 2026-08 não tem grupo, e ${countLabel(withVolume.length)} criativos entram por volume.`
      : `Empacotamento de círculos com ${countLabel(withVolume.length)} criativos agrupados.`,
    leader === undefined ? '' : `${leader.label} lidera com ${shareLabel(leader.leads, total)}.`,
    zeros.length === 0 ? '' : `${countLabel(zeros.length)} criativos sem lead ficam fora do desenho.`,
  ]
    .filter(Boolean)
    .join(' ');

  const nameWidth = ranked.reduce(
    (widest, node) => Math.max(widest, inkWidth(node.label, TEXT_MAIN, false, false)),
    0,
  );
  const trackX = nameWidth + NAME_GAP;
  const valueWidth = ranked.reduce(
    (widest, node) => Math.max(widest, inkWidth(leadsLabel(node.leads), TEXT_MAIN, true, true)),
    0,
  );
  const trackWidth = BODY_WIDTH - trackX - VALUE_LABEL_GAP - valueWidth;
  const rowsBottom = ROWS_TOP + ranked.length * ROW_STEP;
  const chipsCaption = rowsBottom + 23;
  const chipsBaseline = chipsCaption + LINE_NOTE;

  const layout = flatRecorte
    ? null
    : buildLayout(data, BODY_WIDTH - 2 * PLOT_INSET, rowsBottom - ROWS_TOP - 2 * PLOT_INSET);
  const circles =
    layout === null
      ? []
      : layout.groups.map((group) => {
          const cx = PLOT_INSET + (group.x + layout.offsetX) * layout.scale;
          const cy = ROWS_TOP + PLOT_INSET + (group.y + layout.offsetY) * layout.scale;
          return {
            id: group.id,
            cx,
            cy,
            radius: group.r * layout.scale,
            leaves: group.leaves.map((leaf) => ({
              id: leaf.id,
              label: leaf.label,
              leads: leaf.leads,
              cx: cx + leaf.x * layout.scale,
              cy: cy + leaf.y * layout.scale,
              radius: leaf.r * layout.scale,
            })),
          };
        });

  // A lista de identificação junta duas classes de nó invisível: o zero, que não tem área, e a
  // folha cujo círculo é pequeno demais para o número caber por dentro (ROT-10).
  const chipItems: readonly ChipItem[] = [
    ...zeros.map((node) => ({ id: node.id, label: node.label, leads: node.leads })),
    ...circles
      .flatMap((group) => group.leaves)
      .filter((leaf) => !fitsInCircle(countLabel(leaf.leads), TEXT_MAIN, leaf.radius))
      .map((leaf) => ({ id: leaf.id, label: leaf.label, leads: leaf.leads })),
  ];
  const firstPass = layoutChips(chipItems, BODY_WIDTH);
  const chipLine =
    firstPass.leftOut === 0 ? firstPass : layoutChips(chipItems, BODY_WIDTH - REMAINDER_ROOM);

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
          {leader === undefined ? '' : `${leader.label} lidera com `}
          <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
            {leader === undefined ? '' : shareLabel(leader.leads, total)}
          </tspan>
          {' dos leads.'}
        </text>

        {/* O aviso da troca de forma. Ele muda o que a peca afirma, e por isso e escrito. */}
        {flatRecorte ? (
          <text
            className="font-sans"
            fill="var(--warning)"
            fontSize={TEXT_MAIN}
            x={0}
            y={NOTICE_BASELINE}
          >
            Recorte sem grupo: sem hierarquia, o desenho vira barras ordenadas por volume.
          </text>
        ) : null}

        {/* Barras horizontais: nome ao lado e valor na ponta livre, sem eixo e sem grade (ROT-2). */}
        {flatRecorte
          ? ranked.map((node, index) => {
              const center = ROWS_TOP + index * ROW_STEP + ROW_STEP / 2;
              const length = (node.leads / topValue) * trackWidth;
              return (
                <g key={node.id}>
                  <text
                    className="font-sans"
                    dominantBaseline="central"
                    fill="var(--text-secondary)"
                    fontSize={TEXT_MAIN}
                    x={0}
                    y={center}
                  >
                    {node.label}
                  </text>
                  <rect
                    fill="var(--chart-1)"
                    height={BAR_THICKNESS}
                    rx={2}
                    width={length}
                    x={trackX}
                    y={center - BAR_THICKNESS / 2}
                  />
                  <text
                    className="font-display"
                    dominantBaseline="central"
                    fill="var(--text-primary)"
                    fontSize={TEXT_MAIN}
                    fontWeight={500}
                    x={trackX + length + VALUE_LABEL_GAP}
                    y={center}
                  >
                    {leadsLabel(node.leads)}
                  </text>
                </g>
              );
            })
          : circles.map((group) => (
              <g key={group.id}>
                <circle
                  cx={group.cx}
                  cy={group.cy}
                  fill="none"
                  r={group.radius}
                  stroke="var(--chart-1)"
                  strokeWidth={GROUP_STROKE}
                  vectorEffect="non-scaling-stroke"
                />
                {group.leaves.map((leaf) => (
                  <circle cx={leaf.cx} cy={leaf.cy} fill="var(--chart-1)" key={leaf.id} r={leaf.radius} />
                ))}
                {group.leaves
                  .filter((leaf) => fitsInCircle(countLabel(leaf.leads), TEXT_MAIN, leaf.radius))
                  .map((leaf) => (
                    <text
                      className="font-display"
                      dominantBaseline="central"
                      fill="var(--accent-cyan-contrast)"
                      fontSize={TEXT_MAIN}
                      fontWeight={500}
                      key={leaf.id}
                      textAnchor="middle"
                      x={leaf.cx}
                      y={leaf.cy}
                    >
                      {countLabel(leaf.leads)}
                    </text>
                  ))}
              </g>
            ))}

        {/* Identificacao do que nao esta no desenho: marcador vazado, nome, valor e o motivo. */}
        {chipLine.chips.length > 0 ? (
          <>
            <text
              className="font-sans tabular-nums"
              fill="var(--text-muted)"
              fontSize={TEXT_NOTE}
              x={0}
              y={chipsCaption}
            >
              {flatRecorte
                ? 'Sem lead em 2026-08, fora do desenho porque zero não tem área'
                : 'Sem lead, ou com círculo pequeno demais para o número caber dentro'}
            </text>
            {chipLine.chips.map((chip) => (
              <g key={chip.id}>
                <circle
                  cx={chip.x + MARKER_RADIUS}
                  cy={chipsBaseline - MARKER_RADIUS}
                  fill="none"
                  r={MARKER_RADIUS}
                  stroke="var(--text-muted)"
                  strokeWidth={MARKER_STROKE}
                />
                <text
                  className="font-sans tabular-nums"
                  fill="var(--text-secondary)"
                  fontSize={TEXT_NOTE}
                  x={chip.x + 2 * MARKER_RADIUS + MARKER_GAP}
                  y={chipsBaseline}
                >
                  {`${chip.label}, ${leadsLabel(chip.leads)}`}
                </text>
              </g>
            ))}
            {chipLine.leftOut > 0 ? (
              <text
                className="font-sans tabular-nums"
                fill="var(--text-muted)"
                fontSize={TEXT_NOTE}
                textAnchor="end"
                x={BODY_WIDTH - 4}
                y={chipsBaseline}
              >
                {`e mais ${countLabel(chipLine.leftOut)} fora do desenho`}
              </text>
            ) : null}
          </>
        ) : null}
      </svg>
    </div>
  );
}
