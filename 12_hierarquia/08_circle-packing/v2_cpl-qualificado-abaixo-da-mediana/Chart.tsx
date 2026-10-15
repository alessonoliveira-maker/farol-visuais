import { Filter } from 'lucide-react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ChannelGroup } from './data';

/**
 * Circle packing de dois níveis com veredito de custo: a área de cada círculo é o volume de leads
 * qualificados da campanha, e a cor dela diz se o CPL qualificado ficou abaixo da mediana do
 * recorte. O contorno agrupa as campanhas por canal.
 *
 * Três decisões desta versão, todas medidas e nenhuma herdada:
 *
 * 1. TUDO É DESENHADO NUM `<svg>` DO TAMANHO DO CORPO. Linha de leitura, legenda, rótulo e lista
 *    de identificação são `<text>` dentro do mesmo `viewBox`, que mede o corpo do preset. Assim a
 *    escala do SVG sai 1 e o tamanho declarado do texto é o tamanho que chega à tela; bloco de
 *    HTML irmão encolheria a caixa do `<svg>` e reintroduziria a escala (ARMADILHAS, GEO-18).
 * 2. O VÃO ENTRE CÍRCULOS É EM PIXEL, NÃO EM UNIDADE DE LAYOUT. O empacotamento roda em unidades
 *    abstratas e só depois é escalado, então um vão fixo em unidade de layout vira vão variável na
 *    tela. Aqui a escala é resolvida em quatro passadas: empacota, mede a caixa, tira a escala,
 *    converte o vão de pixel de volta para unidade de layout e repete. O vão fica em 2 px na tela,
 *    acima do piso de 1,5 px da COR-5, qualquer que seja o total de leads.
 * 3. O RÓTULO INTERNO SÓ EXISTE SE A CAIXA DE TINTA CABE NO CÍRCULO. A largura sai da soma por
 *    glifo (tabela da guarda COLISAO-TEXTO, com dígito tabular a 0,620 em), e o teste é a meia
 *    diagonal da caixa contra o raio: contido, o texto vai vazado na cor da superfície e sem halo
 *    (ROT-7b); não contido, a campanha é nomeada na lista da coluna lateral (ROT-10).
 *
 * O que a área NÃO codifica, e está declarado no `meta.json`: o círculo do canal. O raio dele nasce
 * do espaço que as campanhas ocuparam no empacotamento, não da soma delas, então canal maior na
 * tela não quer dizer canal maior em leads. Quem compara canal é o número escrito na legenda.
 */
export interface CampaignCostPackingProps {
  readonly data?: readonly ChannelGroup[];
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas de 640x480 na moldura `card` com o caso de uso em uma linha. */
const BODY_WIDTH = 574;
const BODY_HEIGHT = 361.5;

const READING_BASELINE = 12;
const LEGEND_BASELINE = 36;
const BAND_TOP = 52;
const SIDE_WIDTH = 170;
/** 17.7: do gráfico até a legenda lateral. */
const SIDE_GAP = 24;
const PLOT_WIDTH = BODY_WIDTH - SIDE_WIDTH - SIDE_GAP;
const PLOT_HEIGHT = BODY_HEIGHT - BAND_TOP;
const SIDE_X = PLOT_WIDTH + SIDE_GAP;

const TEXT_MAIN = 12;
const TEXT_NOTE = 11;
const LINE_MAIN = 16;
const LINE_NOTE = 15;
/** Passo entre as duas linhas do rótulo interno, centradas no centro do círculo. */
const LABEL_LINE_STEP = 14;
/** Folga entre a caixa de tinta do rótulo e a borda do círculo. */
const LABEL_MARGIN = 4;
const SAMPLE_RADIUS = 6;
const ROW_SAMPLE_RADIUS = 4;
const ROW_INDENT = 14;
/** 17.7: da amostra até o texto da legenda. */
const SAMPLE_GAP = 10;
/** 17.7: itens da legenda entre si. */
const LEGEND_STEP = LINE_MAIN + 10;

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
 * Avanço por glifo, em em, na mesma tabela que a guarda COLISAO-TEXTO usa. Existe porque a média
 * por classe erra de 8% a 26% para baixo em string real, e para baixo é o lado que esconde
 * colisão; e porque é a largura do rótulo que decide se ele cabe dentro do círculo.
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
  '8': 0.588, '9': 0.597,
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

/**
 * Largura da tinta de uma linha, em px. `tabular` liga o avanço fixo do dígito, que é o que as
 * classes `font-display` e `tabular-nums` do Farol fazem no navegador.
 */
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

/** Mediana de uma lista. Devolve `null` para lista vazia, nunca zero (EST-1b). */
function medianOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? null;
  const low = sorted[middle - 1] ?? 0;
  const high = sorted[middle] ?? 0;
  return (low + high) / 2;
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
  readonly label: string;
  readonly qualifiedLeads: number;
  readonly costPerLead: number;
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

interface RawGroup {
  readonly id: string;
  readonly label: string;
  readonly slot: number;
  readonly total: number;
  readonly leaves: readonly RawLeaf[];
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

/** Uma passada de empacotamento em unidade de layout, com os vãos já convertidos para essa unidade. */
function packPass(
  groups: readonly ChannelGroup[],
  leafGap: number,
  groupGap: number,
  groupMargin: number,
): readonly RawGroup[] {
  const packed = groups.map((group) => {
    const leaves = [...group.children]
      .filter((leaf) => leaf.qualifiedLeads > 0)
      .sort((a, b) => b.qualifiedLeads - a.qualifiedLeads || a.id.localeCompare(b.id));
    const spots = packCircles(
      leaves.map((leaf) => Math.sqrt(leaf.qualifiedLeads)),
      leafGap,
    );
    const placed = leaves.map((leaf, index) => {
      const spot = spots[index];
      return {
        id: leaf.id,
        label: leaf.label,
        qualifiedLeads: leaf.qualifiedLeads,
        costPerLead: leaf.costPerLead,
        x: spot?.x ?? 0,
        y: spot?.y ?? 0,
        r: spot?.r ?? 0,
      };
    });
    const reach = placed.reduce((far, leaf) => Math.max(far, Math.hypot(leaf.x, leaf.y) + leaf.r), 0);
    const total = group.children.reduce((sum, leaf) => sum + leaf.qualifiedLeads, 0);
    return { group, leaves: placed, total, r: reach + groupMargin };
  });
  const ordered = [...packed].sort((a, b) => b.r - a.r || a.group.id.localeCompare(b.group.id));
  const spots = packCircles(
    ordered.map((entry) => entry.r),
    groupGap,
  );
  return ordered.map((entry, index) => {
    const spot = spots[index];
    return {
      id: entry.group.id,
      label: entry.group.label,
      slot: entry.group.slot,
      total: entry.total,
      leaves: entry.leaves,
      x: spot?.x ?? 0,
      y: spot?.y ?? 0,
      r: entry.r,
    };
  });
}

interface Layout {
  readonly groups: readonly RawGroup[];
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

/**
 * Empacota e resolve a escala em quatro passadas. A primeira roda sem vão, tira uma escala de
 * partida e converte os vãos de pixel para unidade de layout; as seguintes refazem a conta com o
 * vão já convertido. É isso que mantém o vão em pixel constante na tela, qualquer que seja o total.
 * O enquadramento sai da CAIXA do conjunto, não da distância até a origem do empacotamento.
 */
function buildLayout(groups: readonly ChannelGroup[], width: number, height: number): Layout | null {
  let leafGap = 0;
  let groupGap = 0;
  let groupMargin = 0;
  let packed: readonly RawGroup[] = [];
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  for (let pass = 0; pass < SCALE_PASSES; pass += 1) {
    packed = packPass(groups, leafGap, groupGap, groupMargin);
    const drawn = packed.filter((group) => group.leaves.length > 0);
    if (drawn.length === 0) return null;
    const minX = drawn.reduce((low, g) => Math.min(low, g.x - g.r), Number.POSITIVE_INFINITY);
    const maxX = drawn.reduce((high, g) => Math.max(high, g.x + g.r), Number.NEGATIVE_INFINITY);
    const minY = drawn.reduce((low, g) => Math.min(low, g.y - g.r), Number.POSITIVE_INFINITY);
    const maxY = drawn.reduce((high, g) => Math.max(high, g.y + g.r), Number.NEGATIVE_INFINITY);
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

function slotColor(slot: number): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** A contagem nunca sai crua: leva o substantivo, no singular ou no plural (NUM-6). */
function leadsLabel(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'lead' : 'leads'}`;
}

function costLabel(value: number): string {
  return formatCurrencyCompact(value);
}

/** Taxa sempre com o par de volume (DAD-1). */
function shareLabel(part: number, whole: number): string {
  return formatRateWithVolume(part, whole);
}

function countLabel(value: number): string {
  return formatInt(value);
}

interface LabelLine {
  readonly text: string;
  readonly display: boolean;
}

/**
 * O rótulo cabe no círculo quando a meia diagonal da caixa de tinta, mais a folga, não passa do
 * raio. A largura sai da soma por glifo, nunca da média por classe, que erra para baixo e esconde
 * o vazamento; a altura é o número de linhas pelo passo entre elas.
 */
function labelFits(lines: readonly LabelLine[], radius: number): boolean {
  const width = lines.reduce(
    (widest, line) => Math.max(widest, inkWidth(line.text, TEXT_MAIN, line.display, line.display)),
    0,
  );
  const boxHeight = lines.length * LABEL_LINE_STEP;
  return Math.hypot(width / 2, boxHeight / 2) + LABEL_MARGIN <= radius;
}

interface DrawnLeaf {
  readonly id: string;
  readonly label: string;
  readonly qualifiedLeads: number;
  readonly costPerLead: number;
  readonly below: boolean;
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  readonly labelled: boolean;
}

interface DrawnGroup {
  readonly id: string;
  readonly label: string;
  readonly slot: number;
  readonly total: number;
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  readonly leaves: readonly DrawnLeaf[];
}

export default function CampaignCostPacking({
  data = defaultData,
  height,
  className,
}: CampaignCostPackingProps) {
  const style = height === undefined ? undefined : { height };
  const everyLeaf = data.flatMap((group) => group.children);
  const withVolume = everyLeaf.filter((leaf) => leaf.qualifiedLeads > 0);
  const median = medianOf(withVolume.map((leaf) => leaf.costPerLead));
  const layout = buildLayout(data, PLOT_WIDTH - 2 * PLOT_INSET, PLOT_HEIGHT - 2 * PLOT_INSET);

  if (median === null || layout === null) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha com lead qualificado neste recorte: sem volume, não há área a empacotar.</span>
      </div>
    );
  }

  const cutoff = median;
  const groups: readonly DrawnGroup[] = layout.groups
    .filter((group) => group.leaves.length > 0)
    .map((group) => {
      const cx = PLOT_INSET + (group.x + layout.offsetX) * layout.scale;
      const cy = BAND_TOP + PLOT_INSET + (group.y + layout.offsetY) * layout.scale;
      const leaves = group.leaves.map((leaf) => {
        const radius = leaf.r * layout.scale;
        const below = leaf.costPerLead < cutoff;
        const lines: readonly LabelLine[] = [
          { text: leaf.label, display: false },
          { text: costLabel(leaf.costPerLead), display: true },
        ];
        return {
          id: leaf.id,
          label: leaf.label,
          qualifiedLeads: leaf.qualifiedLeads,
          costPerLead: leaf.costPerLead,
          below,
          cx: cx + leaf.x * layout.scale,
          cy: cy + leaf.y * layout.scale,
          radius,
          labelled: labelFits(lines, radius),
        };
      });
      return {
        id: group.id,
        label: group.label,
        slot: group.slot,
        total: group.total,
        cx,
        cy,
        radius: group.r * layout.scale,
        leaves,
      };
    });

  const totalLeads = withVolume.reduce((sum, leaf) => sum + leaf.qualifiedLeads, 0);
  const below = withVolume.filter((leaf) => leaf.costPerLead < cutoff);
  const belowLeads = below.reduce((sum, leaf) => sum + leaf.qualifiedLeads, 0);
  const ranked = [...withVolume].sort(
    (a, b) => b.qualifiedLeads - a.qualifiedLeads || a.id.localeCompare(b.id),
  );
  const biggest = ranked[0];
  const summary = [
    `Empacotamento de círculos: ${countLabel(withVolume.length)} campanhas em ${countLabel(groups.length)} canais, ${leadsLabel(totalLeads)} qualificados.`,
    `${countLabel(below.length)} ficam abaixo da mediana de ${costLabel(cutoff)} de CPL qualificado e trazem ${shareLabel(belowLeads, totalLeads)} dos leads.`,
    biggest === undefined
      ? ''
      : `Maior círculo: ${biggest.label}, ${leadsLabel(biggest.qualifiedLeads)} a ${costLabel(biggest.costPerLead)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const unnamed = new Set(
    groups.flatMap((group) => group.leaves).filter((leaf) => !leaf.labelled).map((leaf) => leaf.id),
  );
  // Cada canal na legenda lateral leva abaixo as campanhas dele sem nome no desenho, e também as de
  // volume zero, que não têm área: as duas classes são invisíveis no desenho pelo mesmo motivo.
  let cursorY = BAND_TOP + 32;
  const sideBlocks = data.map((group) => {
    const y = cursorY;
    const rows = [...group.children]
      .filter((leaf) => unnamed.has(leaf.id) || leaf.qualifiedLeads <= 0)
      .sort((a, b) => b.qualifiedLeads - a.qualifiedLeads || a.id.localeCompare(b.id))
      .map((leaf, index) => ({
        id: leaf.id,
        label: leaf.label,
        qualifiedLeads: leaf.qualifiedLeads,
        costPerLead: leaf.costPerLead,
        below: leaf.qualifiedLeads > 0 && leaf.costPerLead < cutoff,
        y: y + (index + 1) * LINE_NOTE + 3,
      }));
    cursorY = y + LEGEND_STEP + rows.length * LINE_NOTE;
    return {
      id: group.id,
      label: group.label,
      slot: group.slot,
      total: group.children.reduce((sum, leaf) => sum + leaf.qualifiedLeads, 0),
      y,
      rows,
    };
  });
  const countColumnX = SIDE_X + 122;
  const costColumnX = BODY_WIDTH - 4;

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="figure" style={style}>
      <svg className="h-full w-full" viewBox={`0 0 ${String(BODY_WIDTH)} ${String(BODY_HEIGHT)}`}>
        {/* Linha de leitura (ANO-5): a conclusão, calculada do dado, em uma linha só. */}
        <text
          aria-hidden
          className="font-sans tabular-nums"
          fill="var(--text-secondary)"
          fontSize={TEXT_MAIN}
          x={0}
          y={READING_BASELINE}
        >
          {`${countLabel(below.length)} de ${countLabel(withVolume.length)} campanhas abaixo da mediana de ${costLabel(cutoff)} trazem `}
          <tspan className="font-display" fill="var(--text-primary)" fontWeight={600}>
            {shareLabel(belowLeads, totalLeads)}
          </tspan>
          {' dos leads.'}
        </text>

        {/* Legenda do veredito: amostra na forma da marca, que aqui é o disco da campanha. */}
        <circle
          cx={SAMPLE_RADIUS}
          cy={LEGEND_BASELINE - 4}
          fill="var(--positive)"
          r={SAMPLE_RADIUS}
        />
        <text
          className="font-sans tabular-nums"
          fill="var(--text-secondary)"
          fontSize={TEXT_MAIN}
          x={2 * SAMPLE_RADIUS + SAMPLE_GAP}
          y={LEGEND_BASELINE}
        >
          {`CPL abaixo da mediana de ${costLabel(cutoff)}`}
        </text>
        <circle cx={SAMPLE_RADIUS + 236} cy={LEGEND_BASELINE - 4} fill="var(--text-muted)" r={SAMPLE_RADIUS} />
        <text
          className="font-sans"
          fill="var(--text-secondary)"
          fontSize={TEXT_MAIN}
          x={2 * SAMPLE_RADIUS + SAMPLE_GAP + 236}
          y={LEGEND_BASELINE}
        >
          CPL na mediana ou acima
        </text>

        {/* O desenho. O anel é o canal e o disco é a campanha. */}
        {groups.map((group) => (
          <g key={group.id}>
            <circle
              cx={group.cx}
              cy={group.cy}
              fill="none"
              r={group.radius}
              stroke={slotColor(group.slot)}
              strokeWidth={GROUP_STROKE}
              vectorEffect="non-scaling-stroke"
            />
            {group.leaves.map((leaf) => (
              <circle
                cx={leaf.cx}
                cy={leaf.cy}
                fill={leaf.below ? 'var(--positive)' : 'var(--text-muted)'}
                key={leaf.id}
                r={leaf.radius}
              />
            ))}
            {group.leaves
              .filter((leaf) => leaf.labelled)
              .map((leaf) => (
                <text
                  className="font-sans"
                  dominantBaseline="central"
                  fill="var(--surface-raised)"
                  fontSize={TEXT_MAIN}
                  fontWeight={500}
                  key={leaf.id}
                  textAnchor="middle"
                  x={leaf.cx}
                  y={leaf.cy - LABEL_LINE_STEP / 2}
                >
                  <tspan x={leaf.cx}>{leaf.label}</tspan>
                  <tspan className="font-display" dy={LABEL_LINE_STEP} x={leaf.cx}>
                    {costLabel(leaf.costPerLead)}
                  </tspan>
                </text>
              ))}
          </g>
        ))}

        {/* Legenda dos canais e identificação das campanhas sem rótulo (ROT-10): cada campanha fica
            sob o canal dela, com a amostra preenchida do veredito, o volume e o CPL. */}
        <text className="font-sans" fill="var(--text-muted)" fontSize={TEXT_NOTE} x={SIDE_X} y={BAND_TOP + 11}>
          Canal
        </text>
        <text
          className="font-sans"
          fill="var(--text-muted)"
          fontSize={TEXT_NOTE}
          textAnchor="end"
          x={countColumnX}
          y={BAND_TOP + 11}
        >
          leads
        </text>
        <text
          className="font-sans"
          fill="var(--text-muted)"
          fontSize={TEXT_NOTE}
          textAnchor="end"
          x={costColumnX}
          y={BAND_TOP + 11}
        >
          CPL
        </text>
        {sideBlocks.map((block) => (
          <g key={block.id}>
            <circle
              cx={SIDE_X + SAMPLE_RADIUS}
              cy={block.y - 4}
              fill="none"
              r={SAMPLE_RADIUS - 1}
              stroke={slotColor(block.slot)}
              strokeWidth={GROUP_STROKE}
            />
            <text
              className="font-sans"
              fill="var(--text-secondary)"
              fontSize={TEXT_MAIN}
              x={SIDE_X + 2 * SAMPLE_RADIUS + SAMPLE_GAP}
              y={block.y}
            >
              {block.label}
            </text>
            <text
              className="font-display"
              fill="var(--text-primary)"
              fontSize={TEXT_MAIN}
              fontWeight={500}
              textAnchor="end"
              x={countColumnX}
              y={block.y}
            >
              {countLabel(block.total)}
            </text>
            {block.rows.map((row) => (
              <g key={row.id}>
                <circle
                  cx={SIDE_X + ROW_INDENT}
                  cy={row.y - 3.5}
                  fill={row.below ? 'var(--positive)' : 'var(--text-muted)'}
                  r={ROW_SAMPLE_RADIUS}
                />
                <text
                  className="font-sans"
                  fill="var(--text-secondary)"
                  fontSize={TEXT_NOTE}
                  x={SIDE_X + ROW_INDENT + ROW_SAMPLE_RADIUS + 6}
                  y={row.y}
                >
                  {row.label}
                </text>
                <text
                  className="font-display"
                  fill="var(--text-secondary)"
                  fontSize={TEXT_NOTE}
                  textAnchor="end"
                  x={countColumnX}
                  y={row.y}
                >
                  {countLabel(row.qualifiedLeads)}
                </text>
                <text
                  className="font-display"
                  fill="var(--text-secondary)"
                  fontSize={TEXT_NOTE}
                  textAnchor="end"
                  x={costColumnX}
                  y={row.y}
                >
                  {costLabel(row.costPerLead)}
                </text>
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
