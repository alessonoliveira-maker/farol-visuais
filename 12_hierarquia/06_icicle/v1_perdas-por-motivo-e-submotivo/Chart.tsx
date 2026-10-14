import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, totalLabel as defaultTotalLabel, type LossCategory, type LossNode } from './data';

/**
 * Icicle lateral: cada coluna é um nível (categoria, motivo, submotivo) e a extensão vertical de
 * cada retângulo é a soma cumulativa dos valores dos filhos dentro do intervalo do pai. A
 * partição é geometria pura em TypeScript, sem biblioteca de layout; o SVG só desenha o que
 * `buildColumns` calculou. A cor categórica mora só no contorno da categoria (COR-3, COR-8); o
 * preenchimento é sempre `--surface-sunken`, para o texto nunca precisar ficar em cima de uma
 * marca saturada (só `--accent-cyan-contrast` tem par aprovado sobre `--chart-1`, e não sobre os
 * demais categóricos, ROT-6).
 *
 * Nome de nó nunca trunca com reticência (TIP-7): quebra em até duas linhas por palavra inteira
 * (`wrapLabel`), e o nó só desenha nome e valor quando a altura do intervalo comporta as linhas
 * (`fitLabel`). O nó que não cabe fica com a marca colorida, sem texto, e entra na lista de
 * identificação abaixo do gráfico (`buildMutedGroups`), agrupada por categoria e por motivo: todo
 * motivo vira um cabeçalho de bloco (com valor só quando ele mesmo está mudo) e os submotivos sem
 * rótulo ficam sempre recuados por baixo do motivo deles, nunca soltos numa lista plana em que
 * motivo e submotivo leem como irmãos que deveriam somar (ROT-10, precisão de 2026-09-20). Como
 * cada nó é ou rotulado no desenho ou listado abaixo, nunca as duas coisas nem nenhuma, a soma dos
 * valores impressos nas duas formas sempre fecha o total de cada nível.
 */
export interface LossIcicleProps {
  readonly data?: readonly LossCategory[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 574;
/** Canvas por número, bem maior que o preset (meta.json, notes): a lista de identificação abaixo
 * do gráfico é o segundo bloco de conteúdo, não um extra pequeno, e o corpo fixo do render precisa
 * de altura para os dois ao mesmo tempo. Este valor casa com a altura de fato sobrando para o `svg`
 * depois da lista de 2 colunas, no canvas de 1000 px: dar-lhe menos encolhe o desenho (TIP-2,
 * ESP-2), dar-lhe mais só sobra vazio, porque o `<svg>` nunca cresce além do seu `viewBox`. */
const VIEW_H = 585;
const HEADER_H = 20;
const LEVEL_LABELS = ['Categoria', 'Motivo', 'Submotivo'] as const;
const COLUMN_GAP = 10;
/** Larguras assimétricas: a coluna de categoria só precisa caber nomes curtos (o maior é "Sem
 * perfil financeiro"), então cede espaço para motivo e submotivo, cujos nomes são frases inteiras
 * e precisam da largura extra para caber em até duas linhas sem reticência (TIP-7). Soma exata
 * com os dois vãos: 150 + 10 + 202 + 10 + 202 = 574 = VIEW_W. */
const COLUMN_WIDTHS = [150, 202, 202] as const;
/** Vão de 3 px entre vizinhos (CONTRATO, COR-5: pelo menos 1,5 px), 1,5 px de cada lado. */
const ROW_INSET = 1.5;
/** Abaixo disso o retângulo não tem altura para nome (uma linha) e valor; o nó fica sem texto e
 * entra na lista de identificação (ROT-10). Nome quebrado em duas linhas soma mais uma
 * `LABEL_LINE_HEIGHT` a este piso, em `fitLabel`. */
const LABEL_MIN_HEIGHT = 48;
/** Máximo de linhas para o nome: acima disso o nó não ganha rótulo no desenho, mesmo cabendo em
 * altura, porque três linhas mais o valor já não é leitura rápida dentro de uma faixa estreita. */
const MAX_LABEL_LINES = 2;
const NAME_FONT_PX = 12;
const VALUE_FONT_PX = 11;
const TEXT_PAD_X = 8;
const NAME_BASELINE_Y = 17;
/** Distância entre linhas do nome e, depois delas, entre a última linha e o valor. */
const LABEL_LINE_HEIGHT = 14;
/** Estimativa conservadora (superestima) da largura de um caractere em Manrope 500 a 12 px, para
 * decidir a quebra de linha antes de a tinta encostar na borda direita da coluna. Uma por nível,
 * porque cada nível tem sua própria largura de coluna (`COLUMN_WIDTHS`). */
const APPROX_CHAR_WIDTH = 6.6;
const MAX_LABEL_CHARS = COLUMN_WIDTHS.map((width) => Math.max(1, Math.floor((width - TEXT_PAD_X * 2) / APPROX_CHAR_WIDTH)));
/** Posição x de cada coluna, acumulada a partir das larguras e do vão. */
const COLUMN_X: readonly number[] = (() => {
  const xs: number[] = [];
  let cursor = 0;
  for (const width of COLUMN_WIDTHS) {
    xs.push(cursor);
    cursor += width + COLUMN_GAP;
  }
  return xs;
})();
const CATEGORY_RADIUS = 3;
const CATEGORY_STROKE_WIDTH = 2;
const NODE_STROKE_WIDTH = 1;

interface PlacedNode {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly y0: number;
  readonly y1: number;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  /** Categoria ancestral (raiz do ramo): agrupa a lista de identificação por categoria (ROT-10). */
  readonly categoryId: string;
  readonly categoryLabel: string;
  /** Pai imediato: a própria categoria para um motivo, o motivo para um submotivo. A lista de
   * identificação usa este campo para nunca pôr o valor do pai na mesma altura visual dos filhos
   * (ROT-10, "em visual hierárquico a lista carrega o nível"). */
  readonly parentId: string;
  readonly parentLabel: string;
  /** Linhas do nome já quebradas (1 ou 2); vazio quando `hasLabel` é falso. */
  readonly nameLines: readonly string[];
  /** Falso quando o nó não tem altura para o nome (nas linhas que `nameLines` pediria) mais o
   * valor: aí o nó fica só com a marca colorida e o `title`, e entra na lista de identificação. */
  readonly hasLabel: boolean;
}

/**
 * Reparte [y0, y1] entre os nós pela soma cumulativa dos valores, maior para o menor, estável
 * pelo id no empate (filhos ordenados por valor decrescente, estáveis entre filtros). É a mesma
 * conta do x0/x1 do icicle vertical, só que no eixo vertical: a orientação lateral usa a largura
 * fixa da coluna para o nível e a altura livre para o valor.
 */
function partitionSpan<T extends { readonly id: string; readonly value: number }>(
  nodes: readonly T[],
  y0: number,
  y1: number,
): Array<{ readonly node: T; readonly y0: number; readonly y1: number }> {
  const total = nodes.reduce((sum, node) => sum + node.value, 0);
  const ordered = [...nodes].sort((a, b) => b.value - a.value || a.id.localeCompare(b.id));
  const span = y1 - y0;
  let cursor = y0;
  return ordered.map((node) => {
    const nodeHeight = total > 0 ? (node.value / total) * span : 0;
    const ny0 = cursor;
    cursor += nodeHeight;
    return { node, y0: ny0, y1: cursor };
  });
}

/** Quebra o nome em linhas por palavra inteira, nunca por caractere: TIP-7 proíbe reticência em
 * nome de marca desenhada, então a alternativa à truncagem é a quebra. Uma palavra sozinha maior
 * que `maxChars` fica em sua própria linha (rara nesta base; nenhuma passa de `maxChars`). */
function wrapLabel(label: string, maxChars: number): readonly string[] {
  const words = label.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const attempt = current ? `${current} ${word}` : word;
    if (attempt.length <= maxChars || current === '') {
      current = attempt;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface LabelFit {
  readonly lines: readonly string[];
  readonly hasLabel: boolean;
}

/** Decide se o nome cabe no nó: quebra em linhas (`wrapLabel`) e confere se a altura do
 * intervalo comporta essas linhas mais o valor. Mais de `MAX_LABEL_LINES` linhas, ou altura
 * insuficiente para o número de linhas que saiu, e o nó fica sem rótulo no desenho; a marca
 * colorida continua (carrega o valor pela área), o `title` guarda o texto inteiro e a lista de
 * identificação abaixo do gráfico imprime nome e valor (ROT-10; a isenção do neutro de dado da
 * 17.2 fica satisfeita pela lista, não pela dica). */
function fitLabel(label: string, maxChars: number, availableHeight: number): LabelFit {
  const lines = wrapLabel(label, maxChars);
  if (lines.length > MAX_LABEL_LINES) {
    return { lines: [], hasLabel: false };
  }
  const required = LABEL_MIN_HEIGHT + (lines.length - 1) * LABEL_LINE_HEIGHT;
  return { lines, hasLabel: availableHeight >= required };
}

/**
 * Monta as três colunas já posicionadas, com o slot de cor e a categoria ancestral herdados por
 * todos os descendentes do ramo: a cor pertence à categoria, não à posição no ranking (COR-3), e
 * a lista de identificação agrupa por essa mesma categoria.
 */
function buildColumns(
  categories: readonly LossCategory[],
): readonly [readonly PlacedNode[], readonly PlacedNode[], readonly PlacedNode[]] {
  const level0: PlacedNode[] = [];
  const level1: PlacedNode[] = [];
  const level2: PlacedNode[] = [];
  for (const cat of partitionSpan(categories, HEADER_H, VIEW_H)) {
    const catFit = fitLabel(cat.node.label, MAX_LABEL_CHARS[0] ?? 1, cat.y1 - cat.y0);
    level0.push({
      id: cat.node.id,
      label: cat.node.label,
      value: cat.node.value,
      y0: cat.y0,
      y1: cat.y1,
      slot: cat.node.slot,
      categoryId: cat.node.id,
      categoryLabel: cat.node.label,
      parentId: cat.node.id,
      parentLabel: cat.node.label,
      nameLines: catFit.lines,
      hasLabel: catFit.hasLabel,
    });
    const motivos: readonly LossNode[] = cat.node.children ?? [];
    for (const mot of partitionSpan(motivos, cat.y0, cat.y1)) {
      const motFit = fitLabel(mot.node.label, MAX_LABEL_CHARS[1] ?? 1, mot.y1 - mot.y0);
      level1.push({
        id: mot.node.id,
        label: mot.node.label,
        value: mot.node.value,
        y0: mot.y0,
        y1: mot.y1,
        slot: cat.node.slot,
        categoryId: cat.node.id,
        categoryLabel: cat.node.label,
        parentId: cat.node.id,
        parentLabel: cat.node.label,
        nameLines: motFit.lines,
        hasLabel: motFit.hasLabel,
      });
      const submotivos: readonly LossNode[] = mot.node.children ?? [];
      for (const sub of partitionSpan(submotivos, mot.y0, mot.y1)) {
        const subFit = fitLabel(sub.node.label, MAX_LABEL_CHARS[2] ?? 1, sub.y1 - sub.y0);
        level2.push({
          id: sub.node.id,
          label: sub.node.label,
          value: sub.node.value,
          y0: sub.y0,
          y1: sub.y1,
          slot: cat.node.slot,
          categoryId: cat.node.id,
          categoryLabel: cat.node.label,
          parentId: mot.node.id,
          parentLabel: mot.node.label,
          nameLines: subFit.lines,
          hasLabel: subFit.hasLabel,
        });
      }
    }
  }
  return [level0, level1, level2];
}

function slotColor(slot: 1 | 2 | 3 | 4 | 5 | 6): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

/** Uma linha da lista para um nó de nível 2 (submotivo) dentro do bloco do seu motivo mudo. */
interface MutedChildRow {
  readonly id: string;
  readonly label: string;
  readonly value: number;
}

/** Um motivo vira seu próprio bloco na lista sempre que ele mesmo ou algum filho dele fica sem
 * rótulo no desenho. `value` é o valor do motivo só quando o motivo em si está mudo (nesse caso os
 * filhos aqui são TODOS os dele, com ou sem rótulo direto, porque é essa soma completa que prova
 * que o pai mudo é feito exatamente dos filhos, checklist 27); quando o motivo já tem rótulo
 * próprio no desenho, `value` é `null` (o bloco é só um cabeçalho de agrupamento, sem repetir um
 * valor já impresso) e os filhos são só os que ficaram mudos. Em ambos os casos o cabeçalho fica
 * numa linha e os filhos recuados numa lista embaixo, então o valor do pai nunca aparece na mesma
 * altura visual dos filhos (ROT-10, precisão de 2026-09-20). */
interface MutedMotivoBlock {
  readonly id: string;
  readonly label: string;
  readonly value: number | null;
  readonly children: readonly MutedChildRow[];
}

interface MutedCategoryGroup {
  readonly id: string;
  readonly label: string;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly value: number;
  readonly showsOwnValue: boolean;
  readonly motivoBlocks: readonly MutedMotivoBlock[];
}

/**
 * Agrupa por categoria os nós sem rótulo direto no desenho, preservando o nível de cada um
 * (ROT-10, precisão de 2026-09-20): todo motivo vira um cabeçalho de bloco, com valor só quando
 * ele mesmo está mudo, e os submotivos sem rótulo ficam sempre recuados por baixo do motivo deles,
 * nunca soltos numa lista plana em que motivo e submotivo leem como irmãos.
 */
function buildMutedGroups(
  level0: readonly PlacedNode[],
  level1: readonly PlacedNode[],
  level2: readonly PlacedNode[],
): readonly MutedCategoryGroup[] {
  return level0
    .map((cat): MutedCategoryGroup => {
      const motivosOfCat = level1.filter((mot) => mot.categoryId === cat.id);
      const motivoBlocks: readonly MutedMotivoBlock[] = motivosOfCat
        .map((mot) => {
          const isMuted = !mot.hasLabel;
          const childrenOfMot = level2.filter((sub) => sub.parentId === mot.id);
          const children = isMuted ? childrenOfMot : childrenOfMot.filter((sub) => !sub.hasLabel);
          return {
            id: mot.id,
            label: mot.label,
            value: isMuted ? mot.value : null,
            children: children.map((sub) => ({ id: sub.id, label: sub.label, value: sub.value })),
          };
        })
        .filter((block) => block.value !== null || block.children.length > 0);
      return {
        id: cat.id,
        label: cat.label,
        slot: cat.slot,
        value: cat.value,
        showsOwnValue: !cat.hasLabel,
        motivoBlocks,
      };
    })
    .filter((group) => group.showsOwnValue || group.motivoBlocks.length > 0);
}

export default function LossIcicle({ data = defaultData, height, className }: LossIcicleProps) {
  const style = height === undefined ? undefined : { height };
  const [level0, level1, level2] = useMemo(() => buildColumns(data), [data]);

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma perda neste recorte: não há hierarquia para desenhar.</span>
      </div>
    );
  }

  const total = data.reduce((sum, category) => sum + category.value, 0);
  const leader = [...data].sort((a, b) => b.value - a.value)[0];
  const leaderShare = leader && total > 0 ? leader.value / total : 0;

  const summary = leader
    ? `Icicle lateral com ${formatInt(total)} ${defaultTotalLabel}, em ${formatInt(data.length)} categorias, ${formatInt(level1.length)} motivos e ${formatInt(level2.length)} submotivos. ${leader.label} lidera com ${formatInt(leader.value)} perdas, ${formatPercent(leaderShare, 0)} do total.`
    : '';
  const readingLine = leader ? `${leader.label} concentra ${formatPercent(leaderShare, 0)} das perdas de 2026-T3.` : '';

  const columns = [level0, level1, level2] as const;

  // Lista de identificação (ROT-10), agrupada por categoria e com o nível preservado
  // (buildMutedGroups): todo motivo vira um cabeçalho de bloco (com valor só quando ele mesmo está
  // mudo) e os submotivos sem rótulo ficam sempre recuados por baixo do motivo deles.
  const mutedGroups = buildMutedGroups(level0, level1, level2);

  return (
    <div aria-label={summary} className={cn('@container flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {readingLine}
      </p>
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {columns.map((nodes, levelIndex) => {
            const x = COLUMN_X[levelIndex] ?? 0;
            const width = COLUMN_WIDTHS[levelIndex] ?? COLUMN_WIDTHS[0];
            const levelLabel = LEVEL_LABELS[levelIndex] ?? '';
            return (
              <g key={levelLabel || String(levelIndex)}>
                <text className="font-sans" fill="var(--text-muted)" fontSize={VALUE_FONT_PX} x={x} y={HEADER_H - 7}>
                  {levelLabel}
                </text>
                {nodes.map((node) => {
                  const rectHeight = Math.max(node.y1 - node.y0 - ROW_INSET * 2, 0);
                  const valueBaselineY = NAME_BASELINE_Y + node.nameLines.length * LABEL_LINE_HEIGHT;
                  return (
                    <g key={node.id}>
                      <title>{`${node.label}: ${formatInt(node.value)} perdas`}</title>
                      <rect
                        fill="var(--surface-sunken)"
                        height={rectHeight}
                        rx={CATEGORY_RADIUS}
                        stroke={levelIndex === 0 ? slotColor(node.slot) : 'var(--line-subtle)'}
                        strokeWidth={levelIndex === 0 ? CATEGORY_STROKE_WIDTH : NODE_STROKE_WIDTH}
                        width={width}
                        x={x}
                        y={node.y0 + ROW_INSET}
                      />
                      {node.hasLabel ? (
                        <>
                          {node.nameLines.map((line, lineIndex) => (
                            <text
                              className="font-sans"
                              fill="var(--text-primary)"
                              fontSize={NAME_FONT_PX}
                              fontWeight={500}
                              key={line}
                              x={x + TEXT_PAD_X}
                              y={node.y0 + ROW_INSET + NAME_BASELINE_Y + lineIndex * LABEL_LINE_HEIGHT}
                            >
                              {line}
                            </text>
                          ))}
                          <text
                            className="font-display"
                            fill="var(--text-muted)"
                            fontSize={VALUE_FONT_PX}
                            x={x + TEXT_PAD_X}
                            y={node.y0 + ROW_INSET + valueBaselineY}
                          >
                            {formatInt(node.value)} perdas
                          </text>
                        </>
                      ) : null}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      {mutedGroups.length > 0 ? (
        <div className="mt-2 shrink-0">
          <p className="mb-1 text-[0.6875rem] text-text-muted">Sem rótulo no desenho, em perdas:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[0.6875rem] leading-snug">
            {mutedGroups.map((group) => (
              <div className="min-w-0" key={group.id}>
                <div className="mb-0.5 flex items-center gap-1.5 font-semibold text-text-secondary">
                  <span aria-hidden className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: slotColor(group.slot) }} />
                  <span>
                    {group.showsOwnValue ? (
                      <>
                        {group.label}: <span className="font-display text-text-primary">{formatInt(group.value)} perdas</span>
                      </>
                    ) : (
                      group.label
                    )}
                  </span>
                </div>
                <ul className="space-y-1 pl-3.5">
                  {group.motivoBlocks.map((block) => (
                    <li key={block.id}>
                      <div className="grid grid-cols-[1fr_56px] items-baseline gap-x-2 font-medium text-text-secondary">
                        <span className="min-w-0">{block.label}</span>
                        {block.value === null ? null : (
                          <span className="font-display text-right text-text-primary">{formatInt(block.value)} perdas</span>
                        )}
                      </div>
                      <ul className="space-y-0.5 pl-3.5">
                        {block.children.map((child) => (
                          <li className="grid grid-cols-[1fr_56px] items-baseline gap-x-2" key={child.id}>
                            <span className="min-w-0 text-text-secondary">{child.label}</span>
                            <span className="font-display text-right text-text-primary">{formatInt(child.value)} perdas</span>
                          </li>
                        ))}
                      </ul>
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
