import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CampaignGroup } from './data';

/**
 * Circle packing de dois níveis: um círculo por campanha contém um círculo por criativo, com
 * área (nunca raio bruto) proporcional aos leads. A geometria é toda calculada aqui, em SVG puro:
 *
 * 1. O raio de cada criativo vem da raiz quadrada dos leads (`Math.sqrt`), porque a área do
 *    círculo cresce com o quadrado do raio; raio proporcional ao valor bruto faria um criativo
 *    com o dobro dos leads parecer com 4 vezes mais área (catálogo 12.8, Ponto delicado).
 * 2. Os criativos de uma campanha são empacotados em espiral (`packCircles`): ordenados por raio
 *    decrescente, cada círculo novo caminha a partir do centro em ângulo e raio crescentes até
 *    achar uma posição sem colisão com nenhum já posicionado.
 * 3. O raio da campanha nasce dos filhos já posicionados: a maior distância do centro até a borda
 *    externa de um criativo, mais uma margem (`GROUP_MARGIN`), nunca escolhido à mão.
 * 4. O mesmo `packCircles` empacota as 4 campanhas entre si, um nível acima, e o raio do conjunto
 *    todo (usado para escalar o layout até o canvas) nasce da mesma conta.
 *
 * O layout roda em unidades abstratas (raio 1 = 1 lead de distância) e só no fim é escalado para
 * o `viewBox` em pixels, para caber inteiro qualquer que seja o total de leads do dado.
 * `useMemo` depende de uma assinatura textual do dado (`signature`), não do array em si, para o
 * layout permanecer determinístico mesmo se o componente pai recriar o array a cada render.
 */
export interface CampaignCirclePackingProps {
  readonly data?: readonly CampaignGroup[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW = 400;
/** Respiro entre o círculo mais externo e a borda do viewBox (ESP-3). */
const VIEWBOX_PADDING = 10;
/** Vão mínimo entre dois criativos vizinhos da mesma campanha (COR-5: vizinhos que não
 * contrastam entre si, mesma cor de categoria, precisam de separação visível). */
const LEAF_GAP = 0.6;
/** Vão mínimo entre duas campanhas vizinhas. */
const GROUP_GAP = 1.4;
/** Margem entre o criativo mais distante do centro e a borda do círculo da campanha. */
const GROUP_MARGIN = 1.5;
/** Margem entre a campanha mais distante do centro e a borda do conjunto inteiro. */
const OUTER_MARGIN = 1.2;
const GROUP_STROKE_WIDTH = 2;
const MAX_SPIRAL_STEPS = 400;
const SPIRAL_ANGLE_STEP = 0.32;
const SPIRAL_RADIUS_STEP = 0.16;

function slotColor(slot: number): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** "1 lead" no singular, "N leads" no plural: a contagem nunca sai crua (NUM-6). */
function formatLeads(value: number): string {
  return `${formatInt(value)} ${value === 1 ? 'lead' : 'leads'}`;
}

interface Circle {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

/**
 * Empacotamento em espiral (catálogo 12.8): `radii` já vem ordenado do maior para o menor. O
 * primeiro círculo fica no centro; cada círculo seguinte caminha em espiral (ângulo e raio
 * crescentes a cada passo) a partir do centro até achar uma posição cuja distância a TODOS os
 * círculos já posicionados seja de pelo menos a soma dos dois raios mais o vão (`gap`).
 */
function packCircles(radii: readonly number[], gap: number): Circle[] {
  const placed: Circle[] = [];
  for (const r of radii) {
    if (placed.length === 0) {
      placed.push({ x: 0, y: 0, r });
      continue;
    }
    let theta = 0;
    let radius = 0;
    let point = { x: 0, y: 0 };
    for (let step = 0; step < MAX_SPIRAL_STEPS; step += 1) {
      point = { x: radius * Math.cos(theta), y: radius * Math.sin(theta) };
      const collides = placed.some((p) => Math.hypot(point.x - p.x, point.y - p.y) < p.r + r + gap);
      if (!collides) break;
      theta += SPIRAL_ANGLE_STEP;
      radius += SPIRAL_RADIUS_STEP;
    }
    placed.push({ x: point.x, y: point.y, r });
  }
  return placed;
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
  readonly slot: number;
  readonly total: number;
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly leaves: readonly PackedLeaf[];
}

interface Layout {
  readonly groups: readonly PackedGroup[];
  readonly totalLeads: number;
}

/** Assinatura textual do dado (id e leads de cada nó): entra na dependência do `useMemo` para o
 * layout recalcular só quando o CONTEÚDO muda, mesmo que o array seja recriado a cada render. */
function signatureOf(groups: readonly CampaignGroup[]): string {
  return groups.map((g) => `${g.id}:${g.children.map((c) => `${c.id}=${String(c.leads)}`).join(',')}`).join('|');
}

function buildLayout(groups: readonly CampaignGroup[]): Layout {
  const raw = groups.map((group) => {
    const leaves = [...group.children].sort((a, b) => b.leads - a.leads || a.id.localeCompare(b.id));
    const radii = leaves.map((leaf) => Math.sqrt(leaf.leads));
    const positions = packCircles(radii, LEAF_GAP);
    const packedLeaves = leaves.map((leaf, index) => {
      const pos = positions[index] ?? { x: 0, y: 0, r: radii[index] ?? 0 };
      return { id: leaf.id, label: leaf.label, leads: leaf.leads, x: pos.x, y: pos.y, r: pos.r };
    });
    // Raio do pai (Ponto 3): a maior distância do centro até a borda de um filho, mais margem.
    const farthest = packedLeaves.reduce((max, leaf) => Math.max(max, Math.hypot(leaf.x, leaf.y) + leaf.r), 0);
    const total = leaves.reduce((sum, leaf) => sum + leaf.leads, 0);
    return { id: group.id, label: group.label, slot: group.slot, total, leaves: packedLeaves, r: farthest + GROUP_MARGIN };
  });

  const ordered = [...raw].sort((a, b) => b.r - a.r || a.id.localeCompare(b.id));
  const groupPositions = packCircles(
    ordered.map((g) => g.r),
    GROUP_GAP,
  );
  const placed = ordered.map((group, index) => ({ ...group, ...(groupPositions[index] ?? { x: 0, y: 0, r: group.r }) }));

  const bounding = placed.reduce((max, group) => Math.max(max, Math.hypot(group.x, group.y) + group.r), 0) + OUTER_MARGIN;
  const scale = bounding > 0 ? (VIEW / 2 - VIEWBOX_PADDING) / bounding : 1;
  const center = VIEW / 2;

  const scaledGroups: PackedGroup[] = placed.map((group) => {
    const gx = center + group.x * scale;
    const gy = center + group.y * scale;
    const gr = group.r * scale;
    const leaves: PackedLeaf[] = group.leaves.map((leaf) => ({
      id: leaf.id,
      label: leaf.label,
      leads: leaf.leads,
      x: gx + leaf.x * scale,
      y: gy + leaf.y * scale,
      r: leaf.r * scale,
    }));
    return { id: group.id, label: group.label, slot: group.slot, total: group.total, x: gx, y: gy, r: gr, leaves };
  });

  const totalLeads = scaledGroups.reduce((sum, group) => sum + group.total, 0);
  return { groups: scaledGroups, totalLeads };
}

export default function CampaignCirclePacking({ data = defaultData, height, className }: CampaignCirclePackingProps) {
  const signature = signatureOf(data);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- a assinatura textual é a dependência real
  const layout = useMemo(() => buildLayout(data), [signature]);
  const style = height === undefined ? undefined : { height };

  if (layout.groups.length === 0 || layout.totalLeads === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há o que agrupar em círculos.</span>
      </div>
    );
  }

  const leaderGroup = [...layout.groups].sort((a, b) => b.total - a.total)[0];
  const leaderShare = leaderGroup ? leaderGroup.total / layout.totalLeads : 0;
  const allLeaves = layout.groups.flatMap((group) => group.leaves.map((leaf) => ({ leaf, groupLabel: group.label })));
  const leaderLeafEntry = [...allLeaves].sort((a, b) => b.leaf.leads - a.leaf.leads)[0];

  const summary = [
    `Circle packing com ${formatLeads(layout.totalLeads)} de ${String(layout.groups.length)} campanhas.`,
    leaderGroup ? `${leaderGroup.label} lidera com ${formatPercent(leaderShare, 0)}.` : '',
    leaderLeafEntry ? `Maior criativo: ${leaderLeafEntry.leaf.label}, ${formatLeads(leaderLeafEntry.leaf.leads)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Identificação de todo criativo (ROT-10): o círculo de um criativo nunca é grande o bastante
  // para nome e leads juntos com este dado (o rótulo direto exigiria texto sobre uma cor
  // categórica que não é `--chart-1`, sem par aprovado na tabela 17.10), então a lista cobre 100%
  // dos criativos, agrupada por campanha e sempre recuada por baixo do nome dela: o valor da
  // campanha já está na legenda logo acima e nunca se repete na mesma altura visual dos criativos
  // (precisão de 2026-09-20).
  const identificationGroups = layout.groups
    .filter((group) => group.leaves.length > 0)
    .map((group) => ({ id: group.id, label: group.label, leaves: group.leaves }));

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {leaderGroup ? (
          <>
            <span className="font-semibold text-text-primary">{leaderGroup.label}</span> concentra{' '}
            <span className="kpi-number font-medium text-text-primary">{formatPercent(leaderShare, 0)}</span> dos leads, a
            maior entre as <span className="tabular-nums">{formatInt(layout.groups.length)}</span> campanhas.
          </>
        ) : null}
      </p>
      <div className="min-h-0 flex-1">
        <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW)} ${String(VIEW)}`}>
          {layout.groups.map((group) => (
            <g key={group.id}>
              <circle
                cx={group.x}
                cy={group.y}
                fill="none"
                r={group.r}
                stroke={slotColor(group.slot)}
                strokeWidth={GROUP_STROKE_WIDTH}
              />
              {group.leaves.map((leaf) => (
                <circle cx={leaf.x} cy={leaf.y} fill={slotColor(group.slot)} key={leaf.id} r={leaf.r} />
              ))}
            </g>
          ))}
        </svg>
      </div>
      {/* Legenda das campanhas: o círculo externo não leva texto (evita rótulo flutuante sobre os
          criativos), então toda campanha ganha identificação aqui, por amostra na cor do contorno,
          nome e total de leads (ROT-10). */}
      <ul className="mt-2 flex shrink-0 flex-wrap gap-x-4 gap-y-1">
        {layout.groups.map((group) => (
          <li className="flex min-w-0 items-center gap-1.5 text-[0.6875rem] text-text-secondary" key={group.id}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-full border-2" style={{ borderColor: slotColor(group.slot) }} />
            <span className="min-w-0">{group.label}</span>
            <span className="font-display text-text-primary">{formatLeads(group.total)}</span>
          </li>
        ))}
      </ul>
      {identificationGroups.length > 0 ? (
        <ul className="mt-1.5 shrink-0 space-y-1">
          {identificationGroups.map((group) => (
            <li key={group.id}>
              <span className="text-[0.6875rem] font-medium text-text-secondary">{group.label}</span>
              <ul className="flex flex-wrap gap-x-3 gap-y-0.5 pl-3.5">
                {group.leaves.map((leaf) => (
                  <li className="flex items-center gap-1 text-[0.6875rem] text-text-muted" key={leaf.id}>
                    <span>{leaf.label}</span>
                    <span className="font-display text-text-secondary">{formatLeads(leaf.leads)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
