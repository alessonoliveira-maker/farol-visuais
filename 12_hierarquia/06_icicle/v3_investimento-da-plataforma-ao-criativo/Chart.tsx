import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  directChildLabel,
  levelNames,
  periodLabel,
  totalLabel,
  type PlatformSpend,
  type SpendNode,
} from './data';

/**
 * Icicle vertical de quatro faixas: total, plataforma, campanha e criativo. A largura de cada
 * retângulo é o valor dele, e cada faixa reparte exatamente o intervalo horizontal do pai, então a
 * faixa de baixo nunca pode somar mais nem menos que a de cima.
 *
 * Cor por plataforma, intensidade decrescente por profundidade. A palavra é intensidade, e não
 * "mais escuro", porque a composição caminha na direção do cartão e o cartão troca de lado entre os
 * temas: no escuro o nível fundo escurece, no claro ele clareia (armadilha GEO-11). A conta é
 * `fillOpacity`, que compõe a cor da marca com a do cartão e por isso é perda de contraste medida
 * (ACE-5): os degraus de 1,00, 0,86 e 0,72 ficam acima da opacidade mínima de cada cor usada aqui
 * (0,66 para `--chart-1` e `--chart-3`, 0,71 para `--chart-6`, 0,72 para `--text-muted`), então
 * nenhuma marca cai abaixo de 3:1 em nenhum dos dois temas. Nenhum texto é escrito sobre essas
 * marcas, o que também fecha a armadilha TOK-6: marca com opacidade não sustenta número por dentro.
 *
 * Rótulo fora da marca, numa pista de texto sob cada faixa. Isso resolve dois problemas de uma vez:
 * o texto fica sobre o cartão, onde os tokens de texto têm par medido, e a altura da faixa deixa de
 * ser o piso do rótulo. Um nível se rotula inteiro ou não se rotula, e quem decide é a faixa mais
 * estreita dele (`fitLevel`): rotular quatro de dezesseis criativos sugeriria que os outros doze não
 * têm nome, quando todos eles estão nomeados na lista abaixo do gráfico (ROT-10).
 *
 * Filho direto no grupo (`withDirectChild`): quando os criativos de uma campanha somam menos que a
 * campanha, a diferença vira um filho calculado, com rótulo próprio e cor neutra, em vez de espaço
 * vazio na faixa. Sem ele o nível de baixo pareceria menor que o de cima, que é uma mentira de
 * partição; com ele a diferença fica nomeada.
 *
 * Respiro proporcional (armadilha GEO-16): o vão entre vizinhos é uma fração do próprio intervalo
 * do nó, nunca um número absoluto de pixels, porque vão absoluto é a mesma tinta em toda célula e a
 * célula pequena paga tudo. Com fração constante a participação de área de cada retângulo é
 * exatamente a participação do valor dele, e a separação vem do contorno na cor do cartão (COR-5).
 */
export interface SpendIcicleProps {
  readonly data?: readonly PlatformSpend[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 894;
/** Pista do nome de cada nível, à esquerda do plano. O nome mais largo, "Plataforma", mede 60,9 px
 * de tinta em Manrope a 11 px pela soma por glifo. */
const GUTTER_W = 64;
const GUTTER_GAP = 8;
const PLANE_X = GUTTER_W + GUTTER_GAP;
const PLANE_W = VIEW_W - PLANE_X;
const MARK_H = 22;
const LANE_LINE_H = 14;
const LANE_FIRST_BASELINE = 12;
const ROW_GAP = 6;
const BOTTOM_PAD = 4;
const MAX_NAME_LINES = 2;
const LANE_PAD_X = 2;
/** Respiro mínimo entre a tinta de um rótulo e a borda do vizinho seguinte (ROT-9). */
const LANE_RESPIRO = 8;
const SMALL_FONT_PX = 11;
const GAP_FRACTION = 0.015;
const NODE_RADIUS = 2;
const NODE_STROKE_WIDTH = 1;
/** Intensidade por profundidade, acima da opacidade mínima de toda cor usada aqui (ver cabeçalho). */
const DEPTH_OPACITY = [1, 1, 0.86, 0.72] as const;

type GlyphClass = 'digit' | 'upper' | 'lower' | 'space' | 'other';

/** Avanço médio por classe de caractere, em em, pela mesma medição da guarda de colisão. */
const MANROPE_EM: Readonly<Record<GlyphClass, number>> = {
  digit: 0.563,
  upper: 0.616,
  lower: 0.526,
  space: 0.216,
  other: 0.55,
};
const GROTESK_EM: Readonly<Record<GlyphClass, number>> = {
  digit: 0.59,
  upper: 0.609,
  lower: 0.541,
  space: 0.216,
  other: 0.55,
};
/** Folga por linha que cobre o p99 do erro da soma por classe contra o motor de fonte. */
const INK_SAFETY_PX = 2;

function glyphClass(char: string): GlyphClass {
  if (char === ' ') return 'space';
  if (char >= '0' && char <= '9') return 'digit';
  const lower = char.toLowerCase();
  const upper = char.toUpperCase();
  if (lower === upper) return 'other';
  return char === upper ? 'upper' : 'lower';
}

/** Tinta de uma linha de texto, em px: soma por classe de glifo mais a folga medida. */
function measureInkPx(text: string, fontPx: number, table: Readonly<Record<GlyphClass, number>>): number {
  let advance = 0;
  for (const char of text) {
    advance += table[glyphClass(char)];
  }
  return advance * fontPx + INK_SAFETY_PX;
}

/**
 * Largura de tinta que sobra para o rótulo de uma faixa, já descontados o vão proporcional, o
 * recuo do texto e o respiro até a faixa vizinha. É a mesma conta na hora de quebrar o nome e na
 * hora de decidir se o nível se rotula, para as duas nunca divergirem: com ela, a tinta de um
 * rótulo termina pelo menos 8 px antes da borda do vizinho, e o par fica fora da faixa de aviso da
 * guarda de colisão, que começa em 4 px.
 */
function laneAvail(x0: number, x1: number): number {
  const width = x1 - x0;
  return width - width * GAP_FRACTION - LANE_PAD_X - LANE_RESPIRO;
}

/** Quebra o nome por palavra inteira até caber na largura medida; reticência é proibida (TIP-7). */
function wrapLabel(label: string, maxWidth: number): readonly string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of label.split(' ')) {
    const attempt = current === '' ? word : `${current} ${word}`;
    if (current === '' || measureInkPx(attempt, SMALL_FONT_PX, MANROPE_EM) <= maxWidth) {
      current = attempt;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}

interface Placed {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly x0: number;
  readonly x1: number;
  readonly depth: number;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6 | null;
  readonly parentLabel: string;
  readonly nameLines: readonly string[];
  readonly valueText: string;
}

/**
 * Acrescenta o filho "direto no grupo" quando os filhos declarados somam menos que o pai. A
 * diferença existe no dado e precisa aparecer: sem ela a faixa de baixo é mais curta que a de cima
 * sem nada explicar. Soma igual ou maior devolve os filhos como estão.
 */
function withDirectChild(node: SpendNode): readonly SpendNode[] {
  const children = node.children ?? [];
  if (children.length === 0) return children;
  const declared = children.reduce((sum, child) => sum + child.value, 0);
  const missing = node.value - declared;
  if (missing <= 0) return children;
  return [...children, { id: `${node.id}-direto`, label: directChildLabel, value: missing }];
}

/**
 * Reparte [start, end] entre os nós pela soma cumulativa, do maior para o menor, estável pelo id.
 * Soma zero devolve lista vazia: sem total não há partição, e isso não é partição de tamanho zero.
 */
function partitionSpan(
  nodes: readonly SpendNode[],
  start: number,
  end: number,
): readonly { readonly node: SpendNode; readonly start: number; readonly end: number }[] {
  const total = nodes.reduce((sum, node) => sum + node.value, 0);
  if (total <= 0) return [];
  const ordered = [...nodes].sort((a, b) => b.value - a.value || a.id.localeCompare(b.id));
  const span = end - start;
  let cursor = start;
  return ordered.map((node) => {
    const begin = cursor;
    cursor += (node.value / total) * span;
    return { node, start: begin, end: cursor };
  });
}

function slotOf(node: SpendNode, inherited: 1 | 2 | 3 | 4 | 5 | 6 | null): 1 | 2 | 3 | 4 | 5 | 6 | null {
  if (node.label === directChildLabel) return null;
  return inherited;
}

/** Percorre a árvore já repartida e devolve uma lista de nós por profundidade. */
function placeLevels(platforms: readonly PlatformSpend[], total: number): readonly Placed[][] {
  const levels: Placed[][] = Array.from({ length: levelNames.length }, () => []);
  const root: SpendNode = { id: 'total', label: totalLabel, value: total, children: platforms };
  const stack: { readonly node: SpendNode; readonly start: number; readonly end: number; readonly depth: number; readonly slot: 1 | 2 | 3 | 4 | 5 | 6 | null; readonly parentLabel: string }[] = [
    { node: root, start: PLANE_X, end: PLANE_X + PLANE_W, depth: 0, slot: null, parentLabel: '' },
  ];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined) break;
    const bucket = levels[current.depth];
    if (bucket === undefined) continue;
    bucket.push({
      id: current.node.id,
      label: current.node.label,
      value: current.node.value,
      x0: current.start,
      x1: current.end,
      depth: current.depth,
      slot: current.slot,
      parentLabel: current.parentLabel,
      nameLines: wrapLabel(current.node.label, laneAvail(current.start, current.end)),
      valueText: formatCurrencyCompact(current.node.value),
    });
    if (current.depth + 1 >= levelNames.length) continue;
    for (const child of partitionSpan(withDirectChild(current.node), current.start, current.end)) {
      const platform = platforms.find((item) => item.id === child.node.id);
      const childSlot =
        current.depth === 0 && platform !== undefined ? platform.slot : slotOf(child.node, current.slot);
      stack.push({
        node: child.node,
        start: child.start,
        end: child.end,
        depth: current.depth + 1,
        slot: childSlot,
        parentLabel: current.node.label,
      });
    }
  }
  return levels.map((bucket) => [...bucket].sort((a, b) => a.x0 - b.x0));
}

/**
 * Um nível se rotula inteiro ou não se rotula. Devolve quantas linhas de nome o nível precisa, ou
 * `null` quando alguma faixa dele não comporta nome ou valor: `null` é ausência de pista, não pista
 * de altura zero, e é a lista de identificação que assume o nível todo (ROT-10).
 */
function fitLevel(nodes: readonly Placed[]): number | null {
  if (nodes.length === 0) return null;
  let lines = 1;
  for (const node of nodes) {
    const avail = laneAvail(node.x0, node.x1);
    const valueInk = measureInkPx(node.valueText, SMALL_FONT_PX, GROTESK_EM);
    if (node.nameLines.length > MAX_NAME_LINES || valueInk > avail) return null;
    if (node.nameLines.length > lines) lines = node.nameLines.length;
  }
  return lines;
}

function slotColor(slot: 1 | 2 | 3 | 4 | 5 | 6 | null): string {
  if (slot === null) return 'var(--text-muted)';
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

interface Row {
  readonly markTop: number;
  readonly laneLines: number | null;
  readonly nodes: readonly Placed[];
  readonly name: string;
}

function buildRows(levels: readonly Placed[][]): readonly Row[] {
  const rows: Row[] = [];
  let top = 0;
  levels.forEach((nodes, depth) => {
    const laneLines = fitLevel(nodes);
    rows.push({ markTop: top, laneLines, nodes, name: levelNames[depth] ?? '' });
    const laneHeight = laneLines === null ? 0 : (laneLines + 1) * LANE_LINE_H;
    top += MARK_H + laneHeight + ROW_GAP;
  });
  return rows;
}

export default function SpendIcicle({ data = defaultData, height, className }: SpendIcicleProps) {
  const style = height === undefined ? undefined : { height };
  const total = data.reduce((sum, platform) => sum + platform.value, 0);
  const levels = useMemo(() => placeLevels(data, total), [data, total]);
  const rows = useMemo(() => buildRows(levels), [levels]);

  // Recorte sem plataforma, e recorte de total zero, são o mesmo desenho impossível: sem total não
  // há partição, e desenhar faixa sem valor seria inventar largura (EST-1, EST-1b).
  if (data.length === 0 || total <= 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum investimento neste recorte: não há hierarquia para repartir.</span>
      </div>
    );
  }

  const lastRow = rows[rows.length - 1];
  const viewH = (lastRow === undefined ? MARK_H : lastRow.markTop + MARK_H) + BOTTOM_PAD;
  const platforms = levels[1] ?? [];
  const campaigns = levels[2] ?? [];
  const creatives = levels[3] ?? [];
  const leader = [...platforms].sort((a, b) => b.value - a.value)[0];
  const leaderShare = leader === undefined ? null : leader.value / total;
  const unlabeled = rows.filter((row) => row.laneLines === null && row.nodes.length > 0);
  const unlabeledNames = unlabeled.map((row) => `${row.name.toLowerCase()}s`).join(' e ');
  const listNote =
    unlabeled.length === 0 ? '.' : `; a faixa de ${unlabeledNames} vai nomeada na lista abaixo.`;

  const summary =
    leader === undefined || leaderShare === null
      ? `Icicle vertical do investimento de ${periodLabel}: ${formatCurrencyCompact(total)} sem plataforma medida para repartir.`
      : `Icicle vertical do investimento de ${periodLabel}: ${formatCurrencyCompact(total)} em ${formatInt(platforms.length)} plataformas, ${formatInt(campaigns.length)} campanhas e ${formatInt(creatives.length)} criativos. ${leader.label} lidera com ${formatCurrencyCompact(leader.value)}, ${formatPercent(leaderShare, 0)} do total${listNote}`;
  const readingLine =
    leader === undefined || leaderShare === null
      ? ''
      : `${leader.label}: ${formatPercent(leaderShare, 0)} do investimento de ${periodLabel}, ${formatCurrencyCompact(leader.value)}.`;

  // Lista de identificação do nível sem pista de rótulo, agrupada pelo pai de cada nó, para o
  // criativo nunca ler como irmão da campanha (ROT-10). Cada grupo é um cabeçalho com o nome da
  // campanha, que já tem valor escrito no desenho, e os filhos recuados com nome e valor.
  const groups = unlabeled.flatMap((row) => {
    const parents: string[] = [];
    for (const node of row.nodes) {
      if (!parents.includes(node.parentLabel)) parents.push(node.parentLabel);
    }
    return parents.map((parentLabel) => ({
      key: `${row.name}-${parentLabel}`,
      parentLabel,
      children: row.nodes.filter((node) => node.parentLabel === parentLabel),
    }));
  });

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {readingLine}
      </p>
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(viewH)}`}>
          {rows.map((row) => (
            <g key={row.name}>
              <text
                className="font-sans"
                fill="var(--text-muted)"
                fontSize={SMALL_FONT_PX}
                x={0}
                y={row.markTop + 15}
              >
                {row.name}
              </text>
              {row.nodes.map((node) => {
                const inset = (node.x1 - node.x0) * GAP_FRACTION;
                const laneX = node.x0 + inset + LANE_PAD_X;
                return (
                  <g key={node.id}>
                    {row.laneLines === null ? (
                      <title>{`${node.parentLabel}, ${node.label}: ${node.valueText}`}</title>
                    ) : null}
                    <rect
                      fill={slotColor(node.slot)}
                      fillOpacity={DEPTH_OPACITY[node.depth] ?? 1}
                      height={MARK_H}
                      rx={NODE_RADIUS}
                      stroke="var(--surface-raised)"
                      strokeWidth={NODE_STROKE_WIDTH}
                      width={Math.max(node.x1 - node.x0 - inset * 2, 1)}
                      x={node.x0 + inset}
                      y={row.markTop}
                    />
                    {row.laneLines === null
                      ? null
                      : node.nameLines.map((line, lineIndex) => (
                          <text
                            className="font-sans"
                            fill="var(--text-secondary)"
                            fontSize={SMALL_FONT_PX}
                            key={line}
                            x={laneX}
                            y={row.markTop + MARK_H + LANE_FIRST_BASELINE + lineIndex * LANE_LINE_H}
                          >
                            {line}
                          </text>
                        ))}
                    {row.laneLines === null ? null : (
                      <text
                        className="font-display"
                        fill="var(--text-primary)"
                        fontSize={SMALL_FONT_PX}
                        x={laneX}
                        y={row.markTop + MARK_H + LANE_FIRST_BASELINE + row.laneLines * LANE_LINE_H}
                      >
                        {node.valueText}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>
      {groups.length > 0 ? (
        <div className="mt-2 shrink-0 text-[0.6875rem] leading-snug">
          <p className="mb-1 text-text-muted">Criativos por campanha, sem rótulo no desenho:</p>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
            {groups.map((group) => (
              <div className="min-w-0" key={group.key}>
                <p className="font-semibold text-text-secondary">{group.parentLabel}</p>
                <ul className="pl-3">
                  {group.children.map((child) => (
                    <li className="grid grid-cols-[1fr_76px] items-baseline gap-x-2" key={child.id}>
                      <span className="min-w-0 text-text-secondary">{child.label}</span>
                      <span className="font-display text-right text-text-primary">{child.valueText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
