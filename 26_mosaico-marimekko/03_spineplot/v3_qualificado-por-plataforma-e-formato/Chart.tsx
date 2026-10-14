import { Filter } from 'lucide-react';

import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type FormatCell, type PlatformGroup } from './data';

/**
 * Double decker: duas variáveis explicativas aninhadas na largura, plataforma e formato do
 * criativo, e o desfecho na altura. A largura de cada coluna é o peso da combinação nos leads e a
 * altura da parte de baixo é a taxa de qualificação, com os qualificados na base, a única parte
 * com linha de base comum entre colunas. O layout recursivo sai de `layoutColumns()`, função
 * pura: vão de 4 px entre plataformas e de 1 px entre formatos. A coluna acima da taxa global
 * acende em --chart-1, e a combinação sem veiculação é uma linha fina com rótulo escalonado.
 */
export interface QualifiedDeckerProps {
  /** Uma plataforma por item, com os formatos dela na ordem do eixo: o componente não reordena. */
  readonly data?: readonly PlatformGroup[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas largo 960x400 (894 x 265) menos a linha de leitura e a legenda, de 24 px cada. */
const VIEW_W = 894;
const VIEW_H = 217;
/** Margem à direita para o rótulo da taxa global. */
const RIGHT_W = 80;
const NOTE_GAP = 8;
const GROUP_GAP = 4;
const COLUMN_GAP = 1;
const PART_GAP = 2;
/** Linha fina da combinação sem veiculação: fora da partilha, porque área proporcional a zero é nada. */
const ZERO_W = 2;
/** Coluna abaixo de 4 px não tem como ser lida: vira Outros formatos da própria plataforma. */
const MIN_COL_W = 4;
/** Amostra mínima de leads para uma combinação entrar como a melhor. */
const MIN_BEST_LEADS = 30;
const HEAD_H = 30;
const HEAD_LINE = 14;
const AXIS_GAP = 6;
const AXIS_LINE = 14;
const AXIS_PAD = 2;
/** Até duas linhas do nome do formato e a da plataforma. */
const AXIS_ROWS = 3;
const TIER_GAP = 4;
const TIER_LINE = 16;
const TIER_OFFSET = 6;
const NAME_FONT = 12;
const VALUE_FONT = 11;
/** Largura por caractere, em em. Superestima de propósito: sobrar espaço não quebra nada (GEO-8). */
const CHAR_EM = 0.56;
const ABOVE_COLOR = 'var(--chart-1)';
const BELOW_COLOR = 'var(--line-strong)';
const REST_COLOR = 'var(--surface-sunken)';
const MARK_COLOR = 'var(--text-muted)';

interface Cell {
  readonly id: string;
  readonly format: string;
  readonly qualified: number;
  readonly total: number;
  readonly aired: boolean;
}

interface Group {
  readonly id: string;
  readonly label: string;
  readonly cells: readonly Cell[];
}

interface Placed {
  readonly group: number;
  readonly cell: number;
  readonly x: number;
  readonly w: number;
}

function estimateWidth(text: string, fontPx: number): number {
  return text.length * fontPx * CHAR_EM;
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function toCell(cell: FormatCell): Cell {
  return { id: cell.id, format: cell.format, qualified: cell.qualified, total: cell.qualified + cell.notQualified, aired: cell.aired };
}

const hasWidth = (cell: Cell): boolean => cell.aired && cell.total > 0;

/** Taxa de qualificação de uma lista de células; `null` sem lead (EST-1b). */
function qualificationRate(cells: readonly Cell[]): number | null {
  const total = sum(cells.map((cell) => cell.total));
  if (total <= 0) return null;
  return sum(cells.map((cell) => cell.qualified)) / total;
}

/** Largura útil depois dos vãos e das linhas finas: o que a partilha por leads divide. */
function usableWidth(groups: readonly Group[], width: number): number {
  const cells = groups.flatMap((group) => group.cells);
  return width - GROUP_GAP * (groups.length - 1) - COLUMN_GAP * (cells.length - groups.length) - ZERO_W * cells.filter((cell) => !hasWidth(cell)).length;
}

/** Em cada plataforma, as colunas abaixo de 4 px viram uma só, Outros formatos, calculada antes do layout. */
function mergeThin(raw: readonly PlatformGroup[], width: number): readonly Group[] {
  const groups: Group[] = raw.map((group) => ({ id: group.id, label: group.label, cells: group.formats.map(toCell) }));
  const grand = sum(groups.flatMap((group) => group.cells.map((cell) => cell.total)));
  const usable = usableWidth(groups, width);
  return groups.map((group) => {
    const thin = group.cells.filter((cell) => hasWidth(cell) && (usable * cell.total) / grand < MIN_COL_W);
    if (thin.length < 2) return group;
    const merged: Cell = { id: `${group.id}-outros`, format: 'Outros formatos', qualified: sum(thin.map((cell) => cell.qualified)), total: sum(thin.map((cell) => cell.total)), aired: true };
    return { ...group, cells: [...group.cells.filter((cell) => !thin.includes(cell)), merged] };
  });
}

/**
 * Layout recursivo puro: plataformas na largura, formatos dentro de cada uma. Os vãos saem antes da
 * partilha (GEO-16), então a largura de cada coluna é exatamente proporcional aos leads dela.
 */
function layoutColumns(groups: readonly Group[], width: number): readonly Placed[] {
  const grand = sum(groups.flatMap((group) => group.cells.filter(hasWidth).map((cell) => cell.total)));
  const usable = usableWidth(groups, width);
  const placed: Placed[] = [];
  let x = 0;
  groups.forEach((group, groupIndex) => {
    group.cells.forEach((cell, cellIndex) => {
      const w = hasWidth(cell) ? (usable * cell.total) / grand : ZERO_W;
      placed.push({ group: groupIndex, cell: cellIndex, x, w });
      x += w + COLUMN_GAP;
    });
    x += GROUP_GAP - COLUMN_GAP;
  });
  return placed;
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

/** `formatRateWithVolume` imprime `25,0% (7 de 28)`; a taxa e o volume ficam em duas linhas da mesma etiqueta. */
function splitRate(won: number, total: number): readonly string[] {
  const text = formatRateWithVolume(won, total);
  const cut = text.indexOf(' (');
  return cut < 0 ? [text] : [text.slice(0, cut), text.slice(cut + 1)];
}

export default function QualifiedDecker({ data = defaultData, height, className }: QualifiedDeckerProps) {
  const style = height === undefined ? undefined : { height };
  const plotW = VIEW_W - RIGHT_W;
  const groups = mergeThin(data, plotW).filter((group) => group.cells.length > 0);
  const allCells = groups.flatMap((group) => group.cells);

  if (!allCells.some(hasWidth)) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead veiculado neste recorte: não há combinação de plataforma e formato para pesar nem taxa para calcular.</span>
      </div>
    );
  }

  const total = sum(allCells.map((cell) => cell.total));
  const overall = qualificationRate(allCells);
  const placed = layoutColumns(groups, plotW);
  const withLeads = allCells.filter(hasWidth);
  const aboveLeads = sum(withLeads.filter((cell) => overall !== null && cell.qualified / cell.total > overall).map((cell) => cell.qualified));
  const belowLeads = sum(withLeads.map((cell) => cell.qualified)) - aboveLeads;
  const restLeads = sum(withLeads.map((cell) => cell.total - cell.qualified));
  const columns = placed.map((slot) => {
    const group = groups[slot.group];
    const cell = group?.cells[slot.cell];
    const lines = cell ? splitRate(cell.qualified, cell.total) : [];
    const nameLines = cell ? wrapLabel(cell.format, slot.w) : null;
    const fits = cell !== undefined && hasWidth(cell) && nameLines !== null && Math.max(1, ...lines.map((line) => estimateWidth(line, VALUE_FONT))) <= slot.w;
    return { slot, group, cell, lines, nameLines, tiered: !fits };
  });
  const tiered = columns.filter((column) => column.tiered);
  const tierBlock = Math.min(tiered.length, 1) * TIER_GAP + tiered.length * TIER_LINE;
  const plotH = VIEW_H - HEAD_H - AXIS_GAP - AXIS_ROWS * AXIS_LINE - tierBlock - AXIS_PAD;
  const plotBottom = HEAD_H + plotH;
  const usableH = plotH - PART_GAP;
  const axisY = (row: number): number => plotBottom + AXIS_GAP + AXIS_LINE * (row + 0.5);
  const tierY = (tier: number): number => plotBottom + AXIS_GAP + AXIS_LINE * AXIS_ROWS + TIER_GAP + TIER_LINE * (tier + 0.5);
  /** Fio da plataforma logo abaixo das duas linhas possíveis do nome do formato, para o fio não riscar a segunda linha. */
  const platformY = plotBottom + AXIS_GAP + 2 * AXIS_LINE + 2;
  const headY = (line: number, count: number): number => HEAD_H - 2 - HEAD_LINE * (count - line) + HEAD_LINE / 2;
  const globalY = overall === null ? null : plotBottom - usableH * overall;
  const eligible = columns.filter((column) => column.cell !== undefined && hasWidth(column.cell) && column.cell.total >= MIN_BEST_LEADS);
  const best = [...eligible].sort((a, b) => (b.cell ? b.cell.qualified / b.cell.total : 0) - (a.cell ? a.cell.qualified / a.cell.total : 0))[0];
  const bestText = best?.cell && best.group ? `${best.cell.format.toLowerCase()} em ${best.group.label.toLowerCase()}` : '';
  const summary = [
    `Gráfico double decker com ${formatInt(total)} leads em ${formatInt(groups.length)} plataformas e ${formatInt(columns.length)} colunas de formato.`,
    best?.cell && overall !== null ? `A maior taxa de qualificação é de ${bestText}, com ${formatPercent(best.cell.qualified / best.cell.total)}, contra ${formatPercent(overall)} no total.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {best?.cell && overall !== null ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-4 text-text-secondary">
          Maior taxa: <span className="font-semibold text-text-primary">{bestText}</span>, <span className="kpi-number font-medium text-text-primary">{formatRateWithVolume(best.cell.qualified, best.cell.total)}</span>, contra{' '}
          <span className="kpi-number font-medium text-text-primary">{formatPercent(overall)}</span> no total
        </p>
      ) : null}
      <ul className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        {[
          { label: 'Qualificado acima da taxa global', color: ABOVE_COLOR, leads: aboveLeads },
          { label: 'Qualificado abaixo da taxa global', color: BELOW_COLOR, leads: belowLeads },
          { label: 'Não qualificado', color: REST_COLOR, leads: restLeads },
        ].map((item) => (
          <li className="flex items-center gap-1.5 text-xs leading-4" key={item.label}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-[2px] border border-line-subtle" style={{ backgroundColor: item.color }} />
            <span className="text-text-secondary">
              {item.label} <span className="kpi-number font-medium text-text-primary">{formatInt(item.leads)}</span>
            </span>
          </li>
        ))}
        <li className="ml-auto text-xs leading-4 text-text-muted">
          de <span className="kpi-number text-text-secondary">{formatInt(total)}</span> leads
        </li>
      </ul>
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="block h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {columns.map((column) => {
            const { slot, cell, group } = column;
            if (!cell || !group) return null;
            const cx = slot.x + slot.w / 2;
            const key = `${group.id}-${cell.id}`;
            if (!hasWidth(cell)) {
              return (
                <g key={key}>
                  <title>{`${group.label}, ${cell.format.toLowerCase()}: ${cell.aired ? 'sem lead' : 'sem anúncio'} no período`}</title>
                  <rect fill={MARK_COLOR} height={plotH} width={slot.w} x={slot.x} y={HEAD_H} />
                </g>
              );
            }
            const wonH = (usableH * cell.qualified) / cell.total;
            const above = overall !== null && cell.qualified / cell.total > overall;
            return (
              <g key={key}>
                <title>{`${group.label}, ${cell.format.toLowerCase()}: ${formatRateWithVolume(cell.qualified, cell.total)} qualificados`}</title>
                <rect fill={REST_COLOR} height={usableH - wonH} width={slot.w} x={slot.x} y={HEAD_H} />
                {wonH > 0 ? <rect fill={above ? ABOVE_COLOR : BELOW_COLOR} height={wonH} width={slot.w} x={slot.x} y={plotBottom - wonH} /> : null}
                {column.tiered
                  ? null
                  : column.lines.map((line, lineIndex) => (
                      <text className="font-display" dominantBaseline="central" fill={lineIndex === 0 ? 'var(--text-primary)' : 'var(--text-secondary)'} fontSize={VALUE_FONT} fontWeight={lineIndex === 0 ? 600 : 500} key={line} textAnchor="middle" x={cx} y={headY(lineIndex, column.lines.length)}>
                        {line}
                      </text>
                    ))}
                {column.tiered
                  ? null
                  : (column.nameLines ?? []).map((line, lineIndex) => (
                      <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={NAME_FONT} fontWeight={500} key={line} textAnchor="middle" x={cx} y={axisY(lineIndex)}>
                        {line}
                      </text>
                    ))}
              </g>
            );
          })}
          {groups.map((group, groupIndex) => {
            const slots = placed.filter((slot) => slot.group === groupIndex);
            const first = slots[0];
            const last = slots[slots.length - 1];
            if (!first || !last) return null;
            const left = first.x;
            const right = last.x + last.w;
            return (
              <g key={group.id}>
                <line stroke={MARK_COLOR} strokeWidth={1} x1={left} x2={right} y1={platformY} y2={platformY} />
                <text className="font-sans" dominantBaseline="central" fill="var(--text-primary)" fontSize={NAME_FONT} fontWeight={600} textAnchor="middle" x={(left + right) / 2} y={platformY + 9}>
                  {group.label}
                </text>
              </g>
            );
          })}
          {tiered.map((column, tier) => {
            const { slot, cell } = column;
            if (!cell) return null;
            const cx = slot.x + slot.w / 2;
            const name = `${cell.format}: `;
            const value = hasWidth(cell) ? formatRateWithVolume(cell.qualified, cell.total) : cell.aired ? 'sem lead' : 'sem anúncio';
            const toLeft = cx - TIER_OFFSET - estimateWidth(name + value, VALUE_FONT) >= 0;
            return (
              <g key={`${slot.group}-${cell.id}-tier`}>
                <line stroke={MARK_COLOR} strokeWidth={1} x1={cx} x2={cx} y1={plotBottom + 2} y2={tierY(tier)} />
                <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} textAnchor={toLeft ? 'end' : 'start'} x={toLeft ? cx - TIER_OFFSET : cx + TIER_OFFSET} y={tierY(tier)}>
                  <tspan className="font-sans">{name}</tspan>
                  <tspan className="font-display" fill="var(--text-primary)">{value}</tspan>
                </text>
              </g>
            );
          })}
          {globalY !== null && overall !== null ? (
            <g>
              {/* O fio de --surface-raised por baixo separa o tracejado do ciano e do cinza que ele atravessa (TOK-10). */}
              <line stroke="var(--surface-raised)" strokeWidth={4} x1={0} x2={plotW} y1={globalY} y2={globalY} />
              <line stroke={MARK_COLOR} strokeDasharray="3 3" strokeWidth={1.5} x1={0} x2={plotW} y1={globalY} y2={globalY} />
              <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} x={plotW + NOTE_GAP} y={globalY - 7}>
                taxa global
              </text>
              <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={VALUE_FONT} fontWeight={600} x={plotW + NOTE_GAP} y={globalY + 7}>
                {formatPercent(overall)}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}
