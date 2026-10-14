import { Filter } from 'lucide-react';

import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  highlightReasonId as defaultHighlightReasonId,
  reasons as defaultReasons,
  type HandoffQueue,
  type ReasonId,
  type ReturnReason,
} from './data';

/**
 * Marimekko divergente: a largura de cada coluna é a participação da fila no total de
 * oportunidades passadas para vendas; acima da linha zero sobe a parte aceita e abaixo descem as
 * devolvidas, com o motivo em destaque encostado na linha e os demais motivos somados numa parte
 * neutra. Cada lado é lido como proporção do total da fila, na mesma escala, então a área de cada
 * ladrilho continua proporcional à contagem. O layout sai de `divergingMarimekko()`, função pura
 * com dois acumuladores por coluna. A fila estreita demais para o próprio rótulo ganha rótulo
 * escalonado com linha conectora e selo de n, e o ladrilho mudo entra na lista de identificação.
 */
export interface HandoffDivergingMarimekkoProps {
  /** Uma linha por fila, em qualquer ordem: o componente ordena por largura decrescente. */
  readonly data?: readonly HandoffQueue[];
  /** Motivos de devolução registrados; o componente separa o destacado e soma os demais. */
  readonly reasons?: readonly ReturnReason[];
  /** Motivo que acende em `--chart-1`. */
  readonly highlightReasonId?: ReasonId;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas 960x540 menos linha de leitura, legenda e lista: o SVG sai em escala 1 (GEO-18). */
const VIEW_W = 894;
const VIEW_H = 345;
/** Coluna do eixo de proporção: cabe "devolvidas" em 11 px mais a margem do tique. */
const Y_AXIS_WIDTH = 72;
const TICK_MARGIN = 8;
const MARGIN_TOP = 8;
/** Vão de 2 px entre colunas e entre partes: é o próprio cartão, `--surface-raised`, que aparece. */
const COLUMN_GAP = 2;
const PART_GAP = 2;
/** Vão em volta da linha zero, 1 px de cada lado: a linha passa por dentro dele, não por cima da marca (TOK-10). */
const ZERO_GAP = 2;
const AXIS_GAP = 8;
const AXIS_LINE = 14;
/** Linha extra do eixo para a coluna estreita demais para o próprio rótulo (GEO-7); cabe o selo de 16 px. */
const TIER_LINE = 18;
const TIER_OFFSET = 6;
/** Respiro entre a última linha do eixo e a primeira linha escalonada, para ela não ler como da coluna vizinha. */
const TIER_GAP = 4;
const AXIS_PAD_BOTTOM = 2;
const BADGE_HEIGHT = 16;
const BADGE_PAD = 6;
const NAME_FONT = 12;
const VALUE_FONT = 11;
const TILE_FONT = 12;
/** Largura por caractere, em em. Superestima de propósito: sobrar espaço não quebra nada (GEO-8). */
const CHAR_EM = 0.56;
/** Rótulo interno só em ladrilho de pelo menos 28 por 18 px: texto de 12 px mais 6 (ESP-2). */
const LABEL_MIN_WIDTH = 28;
const LABEL_MIN_HEIGHT = 18;
const LABEL_PAD = 4;
const NOTE_GAP = 12;
/** Distância mínima entre o centro da anotação e uma linha de grade: meia tinta de 11 px mais respiro. */
const NOTE_CLEAR = 10;
/** As duas pontas do eixo escrevem 100%: cada lado é proporção do total da fila. Sem linha de 50%: os ladrilhos cobrem o plano e ela só apareceria picada nos vãos. */
const TICKS = [1, 0, -1] as const;
const CAPTION_OFFSET = 14;
/** Halo da ROT-7 na anotação, para o caso de ela cair sobre a linha de grade de 100%. */
const NOTE_HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;
/**
 * Aceitas em neutro forte, motivo em destaque em `--chart-1` cheio e demais motivos em
 * `--line-strong` com o valor escrito. Tinta de cada rótulo pelo par medido sobre o preenchimento:
 * 5,21:1, 6,00:1 e 8,13:1 no tema que reprova primeiro.
 */
const PART_STYLE = [
  { id: 'accepted', fill: 'var(--text-muted)', ink: 'var(--surface-raised)' },
  { id: 'highlight', fill: 'var(--chart-1)', ink: 'var(--accent-cyan-contrast)' },
  { id: 'others', fill: 'var(--line-strong)', ink: 'var(--text-primary)' },
] as const;

interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface TileBox {
  readonly x: number;
  readonly w: number;
  readonly y: number;
  readonly h: number;
}

interface Sides {
  readonly up: readonly number[];
  readonly down: readonly number[];
}

interface DivergingLayout {
  /** Pixels por 100% de um lado. */
  readonly unit: number;
  readonly zeroY: number;
  readonly columns: readonly { readonly up: readonly TileBox[]; readonly down: readonly TileBox[] }[];
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Percentuais inteiros que somam 100 pelo maior resto (NUM-2); `null` sem o que dividir (EST-1b). */
function largestRemainder(values: readonly number[]): readonly number[] | null {
  const total = sum(values);
  if (total <= 0) return null;
  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map((value) => Math.floor(value));
  let missing = 100 - sum(floors);
  const bySurplus = raw.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of bySurplus) {
    if (missing <= 0) break;
    floors[index] = (floors[index] ?? 0) + 1;
    missing -= 1;
  }
  return floors;
}

function estimateWidth(text: string, fontPx: number): number {
  return text.length * fontPx * CHAR_EM;
}

/** Nome em até duas linhas por palavra inteira, no corte mais equilibrado (GEO-2); `null` se não couber. */
function wrapLabel(label: string, maxWidth: number): readonly string[] | null {
  if (estimateWidth(label, NAME_FONT) <= maxWidth) return [label];
  const words = label.split(' ');
  let best: readonly string[] | null = null;
  let bestWidth = maxWidth;
  for (let cut = 1; cut < words.length; cut += 1) {
    const first = words.slice(0, cut).join(' ');
    const second = words.slice(cut).join(' ');
    const width = Math.max(estimateWidth(first, NAME_FONT), estimateWidth(second, NAME_FONT));
    if (width <= bestWidth) {
      best = [first, second];
      bestWidth = width;
    }
  }
  return best;
}

/** Largura de cada coluna: os vãos saem antes da partilha, então as larguras guardam a proporção. */
function columnWidths(totals: readonly number[], width: number): readonly number[] {
  const usable = width - COLUMN_GAP * (totals.length - 1);
  const grand = sum(totals);
  return totals.map((value) => (usable * value) / grand);
}

/**
 * Layout puro da variação divergente: dois acumuladores por coluna, um que sobe e outro que desce
 * a partir da linha zero. O domínio é simétrico pelo maior lado, que numa proporção é 100%: os
 * dois lados usam a mesma escala (`unit` px por 100%), então a mesma altura vale a mesma proporção
 * acima e abaixo da linha. Os vãos saem ANTES da partilha (GEO-16) e toda coluna chega com total
 * positivo, então a área de cada ladrilho fica exatamente proporcional à célula.
 */
function divergingMarimekko(columns: readonly Sides[], box: Box): DivergingLayout {
  const upGaps = PART_GAP * Math.max((columns[0]?.up.length ?? 1) - 1, 0);
  const downGaps = PART_GAP * Math.max((columns[0]?.down.length ?? 1) - 1, 0);
  const unit = (box.height - ZERO_GAP - upGaps - downGaps) / 2;
  const zeroY = box.y + upGaps + unit + ZERO_GAP / 2;
  const widths = columnWidths(columns.map((column) => sum(column.up) + sum(column.down)), box.width);
  const placed: { up: TileBox[]; down: TileBox[] }[] = [];
  let x = box.x;
  columns.forEach((column, index) => {
    const w = widths[index] ?? 0;
    const columnTotal = sum(column.up) + sum(column.down);
    const up: TileBox[] = [];
    let edge = zeroY - ZERO_GAP / 2;
    for (const value of column.up) {
      const h = (unit * value) / columnTotal;
      up.push({ x, w, y: edge - h, h });
      edge -= h + PART_GAP;
    }
    const down: TileBox[] = [];
    edge = zeroY + ZERO_GAP / 2;
    for (const value of column.down) {
      const h = (unit * value) / columnTotal;
      down.push({ x, w, y: edge, h });
      edge += h + PART_GAP;
    }
    placed.push({ up, down });
    x += w + COLUMN_GAP;
  });
  return { unit, zeroY, columns: placed };
}

function plural(count: number, one: string, many: string): string {
  return `${formatInt(count)} ${count === 1 ? one : many}`;
}

export default function HandoffDivergingMarimekko({
  data = defaultData,
  reasons = defaultReasons,
  highlightReasonId = defaultHighlightReasonId,
  height,
  className,
}: HandoffDivergingMarimekkoProps) {
  const style = height === undefined ? undefined : { height };
  const highlightLabel = reasons.find((reason) => reason.id === highlightReasonId)?.label ?? 'Motivo em destaque';
  const highlightName = highlightLabel.toLowerCase();
  const otherReasons = reasons.filter((reason) => reason.id !== highlightReasonId);
  // Ordem fixa das partes: aceitas para cima; para baixo, o motivo em destaque encostado na linha e os demais somados.
  const valuesOf = (queue: HandoffQueue): readonly number[] => [
    queue.accepted,
    queue.returned[highlightReasonId],
    sum(otherReasons.map((reason) => queue.returned[reason.id])),
  ];
  const partNames = ['aceitas', highlightName, 'demais motivos'];
  const partLabels = ['Aceitas', `Devolvidas, ${highlightName}`, 'Devolvidas, demais motivos'];
  // Fila que não passou nada não tem largura: sai do desenho e fica declarada na lista de identificação.
  const rows = data.filter((queue) => sum(valuesOf(queue)) > 0).sort((a, b) => sum(valuesOf(b)) - sum(valuesOf(a)));
  const emptyRows = data.filter((queue) => sum(valuesOf(queue)) <= 0);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade passada neste recorte: não há fila para pesar nem devolução para explicar.</span>
      </div>
    );
  }

  const totals = rows.map((queue) => sum(valuesOf(queue)));
  const total = sum(totals);
  const plotWidth = VIEW_W - Y_AXIS_WIDTH;
  const widths = columnWidths(totals, plotWidth);
  const columnPercents = largestRemainder(totals) ?? [];
  const overallCounts = PART_STYLE.map((_, partIndex) => sum(rows.map((queue) => valuesOf(queue)[partIndex] ?? 0)));
  const overallPercents = largestRemainder(overallCounts) ?? [];
  const returnedTotal = total - (overallCounts[0] ?? 0);

  const columns = rows.map((queue, index) => {
    const w = widths[index] ?? 0;
    const count = totals[index] ?? 0;
    const values = valuesOf(queue);
    const percentText = formatPercent((columnPercents[index] ?? 0) / 100, 0);
    // A base do percentual vai escrita só na primeira coluna, que é a mais larga: unidade no primeiro tique.
    const shareSuffix = index === 0 && estimateWidth(`${percentText} do total`, VALUE_FONT) <= w ? 'do total' : '';
    const nameLines = wrapLabel(queue.label, w);
    const fits = nameLines !== null && estimateWidth(`${formatInt(count)} passadas`, VALUE_FONT) <= w;
    return { queue, w, count, values, returned: count - queue.accepted, percentText, shareSuffix, nameLines: fits ? nameLines : null, percents: largestRemainder(values) ?? [] };
  });

  const nameRows = columns.reduce((most, column) => Math.max(most, column.nameLines?.length ?? 1), 1);
  const tiered = columns.filter((column) => column.nameLines === null);
  const tierGap = Math.min(tiered.length, 1) * TIER_GAP;
  const axisHeight = AXIS_GAP + (nameRows + 2) * AXIS_LINE + tierGap + tiered.length * TIER_LINE + AXIS_PAD_BOTTOM;
  const plot: Box = { x: Y_AXIS_WIDTH, y: MARGIN_TOP, width: plotWidth, height: VIEW_H - MARGIN_TOP - axisHeight };
  const layout = divergingMarimekko(columns.map((column) => ({ up: column.values.slice(0, 1), down: column.values.slice(1) })), plot);
  const axisTop = plot.y + plot.height;
  const rowY = (row: number): number => axisTop + AXIS_GAP + AXIS_LINE * (row + 0.5);
  const tierY = (tier: number): number => axisTop + AXIS_GAP + AXIS_LINE * (nameRows + 2) + tierGap + TIER_LINE * (tier + 0.5);
  // O tique ignora o vão entre as duas partes de baixo: a ponta de 100% fica até 2 px acima do fim da pilha.
  const tickY = (fraction: number): number => layout.zeroY - Math.sign(fraction) * (ZERO_GAP / 2 + Math.abs(fraction) * layout.unit);
  const boxesOf = (columnIndex: number): readonly TileBox[] => {
    const placed = layout.columns[columnIndex];
    return placed ? [...placed.up, ...placed.down] : [];
  };
  const bottomOf = (columnIndex: number): number => boxesOf(columnIndex).reduce((edge, tile) => Math.max(edge, tile.y + tile.h), layout.zeroY + ZERO_GAP / 2);
  const centerOf = (columnIndex: number): number => {
    const first = boxesOf(columnIndex)[0];
    return first ? first.x + first.w / 2 : plot.x;
  };

  const cells = columns.flatMap((column, columnIndex) =>
    PART_STYLE.map((part, partIndex) => {
      const tile = boxesOf(columnIndex)[partIndex] ?? { x: 0, w: 0, y: 0, h: 0 };
      const text = formatPercent((column.percents[partIndex] ?? 0) / 100, 0);
      const labeled = tile.h >= LABEL_MIN_HEIGHT && tile.w >= Math.max(LABEL_MIN_WIDTH, estimateWidth(text, TILE_FONT) + LABEL_PAD * 2);
      // A dica abre a parte somada: é o número que o corpo não escreve (DIC-1).
      const detail = part.id === 'others' ? ` (${otherReasons.map((reason) => `${reason.label.toLowerCase()} ${formatInt(column.queue.returned[reason.id])}`).join(', ')})` : '';
      return { key: `${column.queue.id}-${part.id}`, column, part, name: partNames[partIndex] ?? '', tile, value: column.values[partIndex] ?? 0, text, labeled, detail };
    }),
  );
  // Os ladrilhos da coluna escalonada já estão contados no rótulo dela, com o selo de n.
  const muted = cells.filter((cell) => !cell.labeled && cell.column.nameLines !== null);

  const widest = columns[0];
  const highlightOfReturned = returnedTotal > 0 ? formatPercent((overallCounts[1] ?? 0) / returnedTotal, 0) : null;
  const note = widest
    ? { name: `${widest.queue.label}: devolução de `, value: `${formatPercent(widest.returned / widest.count)} (${formatInt(widest.returned)} de ${formatInt(widest.count)})` }
    : null;
  const noteWidth = note ? estimateWidth(note.name + note.value, VALUE_FONT) : 0;
  // A anotação mora no vazio abaixo da pilha da coluna mais larga e desce para não sentar em cima de uma
  // linha de grade (os tiques vêm de cima para baixo); sem espaço ali, sobe para cima da pilha.
  const noteBelow = TICKS.reduce((at, fraction) => (Math.abs(at - tickY(fraction)) < NOTE_CLEAR ? tickY(fraction) + NOTE_CLEAR : at), bottomOf(0) + NOTE_GAP);
  const noteY = noteBelow + VALUE_FONT / 2 <= axisTop ? noteBelow : (boxesOf(0)[0]?.y ?? plot.y) - NOTE_GAP;
  const noteX = Math.min(Math.max(centerOf(0), plot.x + noteWidth / 2), plot.x + plot.width - noteWidth / 2);

  const summary = [
    `Marimekko divergente de ${formatInt(total)} oportunidades de ${formatInt(columns.length)} filas:`,
    `${formatPercent((overallPercents[0] ?? 0) / 100, 0)} aceitas, ${formatPercent((overallPercents[1] ?? 0) / 100, 0)} devolvidas por ${highlightName}${highlightOfReturned ? `, que explica ${highlightOfReturned} das ${formatInt(returnedTotal)} devoluções,` : ''} e ${formatPercent((overallPercents[2] ?? 0) / 100, 0)} por demais motivos.`,
    note && widest ? `Da maior fila, ${widest.queue.label.toLowerCase()}, voltam ${note.value}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {highlightOfReturned ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-4 text-text-secondary">
          <span className="font-semibold text-text-primary">{highlightLabel}</span> explica{' '}
          <span className="kpi-number font-medium text-text-primary">{highlightOfReturned}</span> das{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(returnedTotal)}</span> devoluções
        </p>
      ) : null}
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        {PART_STYLE.map((part, index) => (
          <li className="flex items-center gap-1.5 text-xs leading-4" key={part.id}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: part.fill }} />
            <span className="text-text-secondary">{partLabels[index]}</span>
            <span className="kpi-number font-medium text-text-primary">{formatPercent((overallPercents[index] ?? 0) / 100, 0)}</span>
          </li>
        ))}
        <li className="ml-auto text-xs leading-4 text-text-muted">
          de <span className="kpi-number text-text-secondary">{formatInt(total)}</span> oportunidades passadas
        </li>
      </ul>
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="block h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {TICKS.map((fraction) => (
            <g key={fraction}>
              <line stroke={fraction === 0 ? 'var(--line-strong)' : 'var(--line-subtle)'} strokeWidth={1} x1={plot.x} x2={plot.x + plot.width} y1={tickY(fraction)} y2={tickY(fraction)} />
              <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="end" x={plot.x - TICK_MARGIN} y={tickY(fraction)}>
                {formatPercent(Math.abs(fraction), 0)}
              </text>
            </g>
          ))}
          <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="end" x={plot.x - TICK_MARGIN} y={tickY(1) + CAPTION_OFFSET}>
            aceitas
          </text>
          <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="end" x={plot.x - TICK_MARGIN} y={tickY(-1) - CAPTION_OFFSET}>
            devolvidas
          </text>
          {cells.map((cell) => {
            const { tile } = cell;
            if (tile.h <= 0) return null;
            return (
              <g key={cell.key}>
                <title>{`${cell.column.queue.label}, ${cell.name}: ${formatInt(cell.value)} de ${formatInt(cell.column.count)} passadas${cell.detail}`}</title>
                <rect fill={cell.part.fill} height={tile.h} width={tile.w} x={tile.x} y={tile.y} />
                {cell.labeled ? (
                  <text className="font-display" dominantBaseline="central" fill={cell.part.ink} fontSize={TILE_FONT} fontWeight={500} textAnchor="middle" x={tile.x + tile.w / 2} y={tile.y + tile.h / 2}>
                    {cell.text}
                  </text>
                ) : null}
              </g>
            );
          })}
          {note ? (
            <text dominantBaseline="central" fontSize={VALUE_FONT} style={NOTE_HALO} textAnchor="middle" x={noteX} y={noteY}>
              <tspan className="font-sans" fill="var(--text-muted)">{note.name}</tspan>
              <tspan className="font-display" fill="var(--text-secondary)">{note.value}</tspan>
            </text>
          ) : null}
          {columns.map((column, index) => {
            if (column.nameLines === null) return null;
            const cx = centerOf(index);
            return (
              <g key={column.queue.id}>
                {column.nameLines.map((line, lineIndex) => (
                  <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={NAME_FONT} fontWeight={500} key={line} textAnchor="middle" x={cx} y={rowY(nameRows - (column.nameLines?.length ?? 1) + lineIndex)}>
                    {line}
                  </text>
                ))}
                <text dominantBaseline="central" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={rowY(nameRows)}>
                  <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>{`${formatInt(column.count)} `}</tspan>
                  <tspan className="font-sans" fill="var(--text-muted)">passadas</tspan>
                </text>
                <text dominantBaseline="central" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={rowY(nameRows + 1)}>
                  <tspan className="font-display" fill="var(--text-secondary)">{column.shareSuffix ? `${column.percentText} ` : column.percentText}</tspan>
                  {column.shareSuffix ? <tspan className="font-sans" fill="var(--text-muted)">{column.shareSuffix}</tspan> : null}
                </text>
              </g>
            );
          })}
          {tiered.map((column, tier) => {
            // Coluna estreita fica sempre à direita, pela ordenação: o rótulo escalonado cresce para a esquerda da conectora.
            const columnIndex = columns.indexOf(column);
            const cx = centerOf(columnIndex);
            const y = tierY(tier);
            const badge = `n = ${formatInt(column.count)}`;
            const badgeWidth = estimateWidth(badge, VALUE_FONT) + BADGE_PAD * 2;
            const badgeX = cx - TIER_OFFSET - badgeWidth;
            return (
              <g key={column.queue.id}>
                <line stroke="var(--text-muted)" strokeWidth={1} x1={cx} x2={cx} y1={bottomOf(columnIndex) + 2} y2={y} />
                <rect fill="var(--surface-sunken)" height={BADGE_HEIGHT} rx={3} width={badgeWidth} x={badgeX} y={y - BADGE_HEIGHT / 2} />
                <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} fontWeight={500} textAnchor="middle" x={badgeX + badgeWidth / 2} y={y}>
                  {badge}
                </text>
                <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} textAnchor="end" x={badgeX - TIER_OFFSET} y={y}>
                  <tspan className="font-sans">{`${column.queue.label}: `}</tspan>
                  <tspan className="font-display">{`${plural(column.queue.accepted, 'aceita', 'aceitas')}, ${plural(column.returned, 'devolvida', 'devolvidas')}`}</tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {muted.length > 0 || emptyRows.length > 0 ? (
        <p className="mt-2 shrink-0 text-[0.6875rem] leading-4 text-text-muted">
          Sem rótulo no desenho:{' '}
          {muted.map((cell, index) => (
            <span key={cell.key}>
              {index > 0 ? '; ' : ''}
              {cell.column.queue.label}, {cell.name} <span className="kpi-number text-text-secondary">{cell.text}</span>
            </span>
          ))}
          {emptyRows.map((queue, index) => (
            <span key={queue.id}>
              {muted.length > 0 || index > 0 ? '; ' : ''}
              {queue.label}, sem oportunidades passadas
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
