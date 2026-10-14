import { Filter } from 'lucide-react';
import { useMemo } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  periodLabel,
  unitLabel,
  type LossMotive,
  type LossSubmotive,
} from './data';

/**
 * Icicle lateral de dois níveis desenhado para o caso difícil: nome de submotivo com 45 a 65
 * caracteres dentro de uma faixa cuja altura vem do valor. Três decisões respondem por isso.
 *
 * Primeira, a largura do rótulo é medida, não estimada por caractere médio. `measureInkPx` soma a
 * classe de cada glifo (dígito, maiúscula, minúscula, espaço) e acrescenta os 2 px que cobrem o p99
 * do erro dessa soma contra o motor de fonte do navegador. Uma constante única por caractere erra
 * nos dois sentidos, e o lado que superestima esconde o rótulo sem nenhuma guarda acusar.
 *
 * Segunda, o nome nunca corta. A especificação desta versão pediu truncamento com reticências, e a
 * TIP-7 proíbe reticência em nome de marca desenhada; quando a especificação e o contrato colidem, o
 * contrato vence. O nome quebra por palavra inteira em até três linhas (`wrapLabel`), a faixa só
 * ganha rótulo quando a altura comporta as linhas que saíram mais a linha do valor (`fitLabel`), e o
 * texto completo continua no `title` do SVG e na lista abaixo do desenho (ROT-10).
 *
 * Terceira, valor zero não vira faixa. Numa partição a faixa é o valor, então zero não tem altura a
 * ocupar: o submotivo de valor zero sai da partição e vai para uma lista própria, com o número zero
 * escrito e o motivo da exclusão vindo do dado, nunca inventado aqui. Isso mantém as duas regras que
 * se confundem: zero medido é zero e se escreve (EST-3), e ausência nunca é zero (DAD-2); aqui o
 * zero é medido, e o que faltaria seria a faixa, não o dado.
 *
 * Respiro proporcional (armadilha GEO-16): o vão entre vizinhos é fração do próprio intervalo do nó,
 * nunca um número absoluto, porque vão absoluto é a mesma tinta em toda faixa e a faixa pequena paga
 * tudo. Com fração constante a participação de área de cada retângulo é exatamente a participação do
 * valor dele. O contorno de cada faixa leva a cor do motivo, mais grosso no nível de cima: é ele que
 * liga o submotivo ao ramo sem pintar o preenchimento, que precisa continuar neutro para o texto
 * longo ter par de contraste medido por cima.
 */
export interface LongLabelIcicleProps {
  readonly data?: readonly LossMotive[];
  readonly height?: number;
  readonly className?: string;
}

const VIEW_W = 574;
/** Altura do `viewBox` igual à que o corpo entrega ao `svg`, para a escala sair 1 (ver meta.json). */
const VIEW_H = 520;
const LEVEL_NAMES = ['Motivo', 'Submotivo'] as const;
const COLUMN_GAP = 10;
/** Larguras desiguais: o motivo tem nome curto e cede espaço para o submotivo, que é frase inteira.
 * Soma exata com o vão: 200 + 10 + 364 = 574 = VIEW_W. */
const MOTIVE_COLUMN_W = 200;
const SUBMOTIVE_COLUMN_W = 364;
const SUBMOTIVE_COLUMN_X = MOTIVE_COLUMN_W + COLUMN_GAP;
const HEADER_BASELINE_Y = 12;
const CONTENT_TOP = 20;
/** Fração do intervalo que vira vão, de cada lado (armadilha GEO-16: respiro proporcional). */
const GAP_FRACTION = 0.015;
const NAME_FONT_PX = 12;
const SMALL_FONT_PX = 11;
const TEXT_PAD_X = 8;
const NAME_BASELINE_Y = 18;
const LABEL_LINE_HEIGHT = 14;
/** Altura mínima para uma linha de nome mais a linha do valor, com a descida da última letra. */
const LABEL_MIN_HEIGHT = 36;
/** Três linhas, porque nome de 65 caracteres não cabe em duas na coluna de submotivo. */
const MAX_LABEL_LINES = 3;
const NODE_RADIUS = 3;
const MOTIVE_STROKE_WIDTH = 2;
const SUBMOTIVE_STROKE_WIDTH = 1;

type GlyphClass = 'digit' | 'upper' | 'lower' | 'space' | 'other';

/** Avanço médio por classe de caractere, em em, pela mesma medição da guarda de colisão. */
const MANROPE_EM: Readonly<Record<GlyphClass, number>> = {
  digit: 0.563,
  upper: 0.616,
  lower: 0.526,
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
 * Quebra o nome por palavra inteira até a tinta caber na largura útil da coluna. Palavra sozinha
 * mais larga que a coluna fica na própria linha, porque cortá-la exigiria reticência, que a TIP-7
 * proíbe em nome de marca desenhada.
 */
function wrapLabel(label: string, maxWidth: number): readonly string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of label.split(' ')) {
    const attempt = current === '' ? word : `${current} ${word}`;
    if (current === '' || measureInkPx(attempt, NAME_FONT_PX, MANROPE_EM) <= maxWidth) {
      current = attempt;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}

interface LabelFit {
  readonly lines: readonly string[];
  readonly hasLabel: boolean;
}

function fitLabel(label: string, maxWidth: number, availableHeight: number): LabelFit {
  const lines = wrapLabel(label, maxWidth);
  if (lines.length > MAX_LABEL_LINES) return { lines: [], hasLabel: false };
  const required = LABEL_MIN_HEIGHT + (lines.length - 1) * LABEL_LINE_HEIGHT;
  return { lines, hasLabel: availableHeight >= required };
}

interface PlacedNode {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly level: 0 | 1;
  readonly y0: number;
  readonly y1: number;
  readonly slot: 1 | 2 | 3 | 4 | 5 | 6;
  readonly motiveLabel: string;
  readonly nameLines: readonly string[];
  readonly hasLabel: boolean;
}

interface ExcludedNode {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly motiveLabel: string;
  readonly reason: string;
}

/**
 * Reparte [start, end] pela soma cumulativa dos valores, do maior para o menor, estável pelo id.
 * Soma zero devolve lista vazia, porque sem total não existe partição: não é o mesmo que uma
 * partição de tamanho zero (EST-1b).
 */
function partitionSpan<T extends { readonly id: string; readonly value: number }>(
  nodes: readonly T[],
  start: number,
  end: number,
): readonly { readonly node: T; readonly start: number; readonly end: number }[] {
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

interface Layout {
  readonly motives: readonly PlacedNode[];
  readonly submotives: readonly PlacedNode[];
  readonly excluded: readonly ExcludedNode[];
}

function buildLayout(motives: readonly LossMotive[]): Layout {
  const placedMotives: PlacedNode[] = [];
  const placedSubmotives: PlacedNode[] = [];
  const excluded: ExcludedNode[] = [];
  const motiveWidth = MOTIVE_COLUMN_W - TEXT_PAD_X * 2;
  const submotiveWidth = SUBMOTIVE_COLUMN_W - TEXT_PAD_X * 2;
  for (const step of partitionSpan(motives, CONTENT_TOP, VIEW_H)) {
    const fit = fitLabel(step.node.label, motiveWidth, step.end - step.start);
    placedMotives.push({
      id: step.node.id,
      label: step.node.label,
      value: step.node.value,
      level: 0,
      y0: step.start,
      y1: step.end,
      slot: step.node.slot,
      motiveLabel: step.node.label,
      nameLines: fit.lines,
      hasLabel: fit.hasLabel,
    });
    // Valor zero não tem faixa a ocupar numa partição, então sai do desenho e vai para a lista
    // própria, com o motivo da exclusão que o dado declara.
    const withSpan: LossSubmotive[] = [];
    for (const child of step.node.children) {
      if (child.value > 0) {
        withSpan.push(child);
        continue;
      }
      excluded.push({
        id: child.id,
        label: child.label,
        value: child.value,
        motiveLabel: step.node.label,
        reason: child.excludedReason ?? 'sem motivo declarado no dado',
      });
    }
    for (const sub of partitionSpan(withSpan, step.start, step.end)) {
      const subFit = fitLabel(sub.node.label, submotiveWidth, sub.end - sub.start);
      placedSubmotives.push({
        id: sub.node.id,
        label: sub.node.label,
        value: sub.node.value,
        level: 1,
        y0: sub.start,
        y1: sub.end,
        slot: step.node.slot,
        motiveLabel: step.node.label,
        nameLines: subFit.lines,
        hasLabel: subFit.hasLabel,
      });
    }
  }
  return { motives: placedMotives, submotives: placedSubmotives, excluded };
}

function slotColor(slot: 1 | 2 | 3 | 4 | 5 | 6): string {
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

export default function LongLabelIcicle({ data = defaultData, height, className }: LongLabelIcicleProps) {
  const style = height === undefined ? undefined : { height };
  const total = data.reduce((sum, motive) => sum + motive.value, 0);
  const layout = useMemo(() => buildLayout(data), [data]);

  // Recorte sem motivo, e recorte de total zero, são o mesmo desenho impossível: sem total não há
  // partição, e faixa sem valor seria largura inventada (EST-1, EST-1b).
  if (data.length === 0 || total <= 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma perda neste recorte: não há hierarquia para desenhar.</span>
      </div>
    );
  }

  const leader = [...layout.motives].sort((a, b) => b.value - a.value)[0];
  const leaderShare = leader === undefined ? null : leader.value / total;
  const muted = layout.submotives.filter((node) => !node.hasLabel);
  const mutedWord = muted.length === 1 ? 'submotivo' : 'submotivos';

  const summary =
    leader === undefined || leaderShare === null
      ? `Icicle lateral com ${formatInt(total)} ${unitLabel} de ${periodLabel} e nenhum motivo a repartir.`
      : `Icicle lateral com ${formatInt(total)} ${unitLabel} de ${periodLabel} em ${formatInt(layout.motives.length)} motivos e ${formatInt(layout.submotives.length)} submotivos. ${leader.label} lidera com ${formatInt(leader.value)} ${unitLabel}, ${formatPercent(leaderShare, 0)} do total. ${formatInt(muted.length)} ${mutedWord} sem altura para o rótulo e ${formatInt(layout.excluded.length)} de valor zero, todos nomeados abaixo.`;
  const readingLine =
    leader === undefined || leaderShare === null
      ? ''
      : `${leader.label}: ${formatPercent(leaderShare, 0)} das ${formatInt(total)} ${unitLabel} de ${periodLabel}.`;

  const columns = [
    { x: 0, width: MOTIVE_COLUMN_W, nodes: layout.motives, name: LEVEL_NAMES[0] },
    { x: SUBMOTIVE_COLUMN_X, width: SUBMOTIVE_COLUMN_W, nodes: layout.submotives, name: LEVEL_NAMES[1] },
  ] as const;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="figure" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {readingLine}
      </p>
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {columns.map((column) => (
            <g key={column.name}>
              <text
                className="font-sans"
                fill="var(--text-muted)"
                fontSize={SMALL_FONT_PX}
                x={column.x}
                y={HEADER_BASELINE_Y}
              >
                {column.name}
              </text>
              {column.nodes.map((node) => {
                const inset = (node.y1 - node.y0) * GAP_FRACTION;
                const valueBaselineY = NAME_BASELINE_Y + node.nameLines.length * LABEL_LINE_HEIGHT;
                return (
                  <g key={node.id}>
                    <title>{`${node.motiveLabel}, ${node.label}: ${formatInt(node.value)} ${unitLabel}`}</title>
                    <rect
                      fill="var(--surface-sunken)"
                      height={Math.max(node.y1 - node.y0 - inset * 2, 1)}
                      rx={NODE_RADIUS}
                      stroke={slotColor(node.slot)}
                      strokeWidth={node.level === 0 ? MOTIVE_STROKE_WIDTH : SUBMOTIVE_STROKE_WIDTH}
                      width={column.width}
                      x={column.x}
                      y={node.y0 + inset}
                    />
                    {node.hasLabel
                      ? node.nameLines.map((line, lineIndex) => (
                          <text
                            className="font-sans"
                            fill="var(--text-primary)"
                            fontSize={NAME_FONT_PX}
                            fontWeight={500}
                            key={line}
                            x={column.x + TEXT_PAD_X}
                            y={node.y0 + inset + NAME_BASELINE_Y + lineIndex * LABEL_LINE_HEIGHT}
                          >
                            {line}
                          </text>
                        ))
                      : null}
                    {node.hasLabel ? (
                      <text
                        className="font-display"
                        fill="var(--text-muted)"
                        fontSize={SMALL_FONT_PX}
                        x={column.x + TEXT_PAD_X}
                        y={node.y0 + inset + valueBaselineY}
                      >
                        {`${formatInt(node.value)} ${unitLabel}`}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>
      {muted.length > 0 || layout.excluded.length > 0 ? (
        <div className="mt-2 shrink-0 space-y-1.5 text-[0.6875rem] leading-snug">
          {muted.length > 0 ? (
            <div>
              <p className="mb-0.5 text-text-muted">Sem altura para o rótulo, desenhado sem texto:</p>
              <ul>
                {muted.map((node) => (
                  <li className="grid grid-cols-[1fr_76px] items-baseline gap-x-2" key={node.id}>
                    <span className="min-w-0 text-text-secondary">
                      {node.motiveLabel}, {node.label}
                    </span>
                    <span className="font-display text-right text-text-primary">
                      {formatInt(node.value)} {unitLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {layout.excluded.length > 0 ? (
            <div>
              <p className="mb-0.5 text-text-muted">Fora da partição, porque valor zero não tem faixa a ocupar:</p>
              <ul>
                {layout.excluded.map((node) => (
                  <li className="grid grid-cols-[1fr_76px] items-baseline gap-x-2" key={node.id}>
                    <span className="min-w-0 text-text-secondary">
                      {node.motiveLabel}, {node.label} ({node.reason})
                    </span>
                    <span className="font-display text-right text-text-primary">
                      {formatInt(node.value)} {unitLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
