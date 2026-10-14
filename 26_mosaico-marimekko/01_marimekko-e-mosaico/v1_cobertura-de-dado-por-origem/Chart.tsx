import { Filter } from 'lucide-react';
import { useId } from 'react';

import { CHART_SERIES_COLORS } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, parts as defaultParts, type CoveragePart, type OriginCoverage } from './data';

/**
 * Marimekko 100%: a largura de cada coluna é a participação da origem no total de leads e a
 * altura se divide pela cobertura do dado dentro dela, com o dado completo na base, que é a única
 * parte com linha de base comum entre colunas. A área de cada ladrilho é proporcional à contagem
 * da célula. O layout sai de `marimekko()`, função pura que devolve x, w, y e h de cada ladrilho;
 * o SVG só desenha. Nome, total e participação de cada coluna ficam no eixo, fora do ladrilho, e
 * o percentual interno só aparece onde cabe: o ladrilho mudo entra na lista de identificação
 * abaixo do gráfico (ROT-10), porque a dica não existe no papel nem no leitor de tela.
 */
export interface CoverageMarimekkoProps {
  /** Uma linha por origem, em qualquer ordem: o componente ordena por largura decrescente. */
  readonly data?: readonly OriginCoverage[];
  /** Partes na ordem da pilha, da base para o topo; a ausência vai por último. */
  readonly parts?: readonly CoveragePart[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas 640x480 menos linha de leitura, legenda e lista: o SVG sai em escala 1 (GEO-18). */
const VIEW_W = 574;
const VIEW_H = 269;
/** Vão de 2 px entre colunas e entre partes: é o próprio cartão, `--surface-raised`, que aparece. */
const COLUMN_GAP = 2;
const PART_GAP = 2;
const AXIS_GAP = 8;
const AXIS_LINE = 14;
/** Linha extra do eixo para a coluna estreita demais para o próprio rótulo (GEO-7). */
const TIER_LINE = 16;
const TIER_OFFSET = 6;
/** Respiro entre a última linha do eixo e a primeira linha escalonada, para ela não ler como da coluna vizinha. */
const TIER_GAP = 4;
const AXIS_PAD_BOTTOM = 2;
const NAME_FONT = 12;
const VALUE_FONT = 11;
const TILE_FONT = 12;
/** Largura por caractere, em em. Superestima de propósito: sobrar espaço não quebra nada (GEO-8). */
const CHAR_EM = 0.56;
/**
 * Rótulo interno só em ladrilho de pelo menos 28 por 18 px. O catálogo pedia 16 px de altura; o
 * piso da ESP-2 para texto de 12 px dentro da marca é 18 (texto mais 6), e é ele que vale.
 */
const LABEL_MIN_WIDTH = 28;
const LABEL_MIN_HEIGHT = 18;
const LABEL_PAD = 4;
const HATCH_STEP = 6;
/** Hachura e contorno da ausência: `--line-strong` mede 1,8:1 e some como marca (TOK-5). */
const NEUTRAL_STROKE = 'var(--text-muted)';
/** Par medido sobre `--chart-1` e `--chart-3` nos dois temas (ROT-6). */
const ON_COLOR_TEXT = 'var(--accent-cyan-contrast)';
/** Halo da ROT-7 no rótulo que fica por cima da hachura: sem ele a diagonal corta o algarismo. */
const HATCH_HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;
/** Ordem de atribuição quando a parte não traz slot (COR-8). */
const SLOT_ORDER = [1, 3, 6, 5, 2, 4] as const;

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
 * Layout puro do marimekko 100%: recebe uma lista de valores por coluna, da base para o topo, e
 * devolve x, w, y e h de cada ladrilho. Toda coluna chega com total positivo. Os vãos saem ANTES
 * da partilha (GEO-16): a altura útil desconta um vão por parte, igual em toda coluna, mesmo
 * quando a parte vale zero, então a área de cada ladrilho fica exatamente proporcional à célula.
 */
function marimekko(columns: readonly (readonly number[])[], box: Box): readonly (readonly TileBox[])[] {
  const widths = columnWidths(columns.map(sum), box.width);
  const placed: TileBox[][] = [];
  let x = box.x;
  columns.forEach((values, index) => {
    const w = widths[index] ?? 0;
    const columnTotal = sum(values);
    const usableHeight = box.height - PART_GAP * (values.length - 1);
    const tiles: TileBox[] = [];
    let bottom = box.y + box.height;
    for (const value of values) {
      const h = (usableHeight * value) / columnTotal;
      tiles.push({ x, w, y: bottom - h, h });
      bottom -= h + PART_GAP;
    }
    placed.push(tiles);
    x += w + COLUMN_GAP;
  });
  return placed;
}

function slotColor(part: CoveragePart, fallbackIndex: number): string {
  const slot = part.slot ?? SLOT_ORDER[Math.min(fallbackIndex, SLOT_ORDER.length - 1)] ?? 1;
  return CHART_SERIES_COLORS[slot - 1] ?? 'var(--chart-1)';
}

export default function CoverageMarimekko({ data = defaultData, parts = defaultParts, height, className }: CoverageMarimekkoProps) {
  const hatchId = useId();
  const style = height === undefined ? undefined : { height };
  const countsOf = (row: OriginCoverage): readonly number[] => parts.map((part) => row.counts[part.id]);
  // Origem sem lead não tem largura: sai do desenho e fica declarada na lista de identificação.
  const rows = data.filter((row) => sum(countsOf(row)) > 0).sort((a, b) => sum(countsOf(b)) - sum(countsOf(a)));
  const emptyRows = data.filter((row) => sum(countsOf(row)) <= 0);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead neste recorte: não há origem para pesar nem cobertura de dado para dividir.</span>
      </div>
    );
  }

  const totals = rows.map((row) => sum(countsOf(row)));
  const total = sum(totals);
  const widths = columnWidths(totals, VIEW_W);
  const columnPercents = largestRemainder(totals) ?? [];
  const overallPercents = largestRemainder(parts.map((part) => sum(rows.map((row) => row.counts[part.id])))) ?? [];
  const colors = parts.map((part, index) => (part.neutral ? null : slotColor(part, index)));

  const columns = rows.map((row, index) => {
    const w = widths[index] ?? 0;
    const count = totals[index] ?? 0;
    const percentText = formatPercent((columnPercents[index] ?? 0) / 100, 0);
    // A base do percentual vai escrita só na primeira coluna, que é a mais larga: unidade no primeiro tique.
    const shareSuffix = index === 0 && estimateWidth(`${percentText} do total`, VALUE_FONT) <= w ? 'do total' : '';
    const nameLines = wrapLabel(row.label, w);
    const fits = nameLines !== null && estimateWidth(`${formatInt(count)} leads`, VALUE_FONT) <= w;
    return { row, w, count, percentText, shareSuffix, nameLines: fits ? nameLines : null, percents: largestRemainder(countsOf(row)) ?? [] };
  });

  const nameRows = columns.reduce((most, column) => Math.max(most, column.nameLines?.length ?? 1), 1);
  const tiered = columns.filter((column) => column.nameLines === null);
  const tierGap = Math.min(tiered.length, 1) * TIER_GAP;
  const axisHeight = AXIS_GAP + (nameRows + 2) * AXIS_LINE + tierGap + tiered.length * TIER_LINE + AXIS_PAD_BOTTOM;
  const plot: Box = { x: 0, y: 0, width: VIEW_W, height: VIEW_H - axisHeight };
  const tiles = marimekko(rows.map(countsOf), plot);
  const rowY = (row: number): number => plot.height + AXIS_GAP + AXIS_LINE * (row + 0.5);
  const tierY = (tier: number): number => plot.height + AXIS_GAP + AXIS_LINE * (nameRows + 2) + tierGap + TIER_LINE * (tier + 0.5);

  const cells = columns.flatMap((column, columnIndex) =>
    parts.map((part, partIndex) => {
      const tile = tiles[columnIndex]?.[partIndex] ?? { x: 0, w: 0, y: 0, h: 0 };
      const text = formatPercent((column.percents[partIndex] ?? 0) / 100, 0);
      const labeled = tile.h >= LABEL_MIN_HEIGHT && tile.w >= Math.max(LABEL_MIN_WIDTH, estimateWidth(text, TILE_FONT) + LABEL_PAD * 2);
      return { key: `${column.row.id}-${part.id}`, column, part, color: colors[partIndex] ?? null, tile, value: column.row.counts[part.id], text, labeled };
    }),
  );
  const muted = cells.filter((cell) => !cell.labeled);

  const widest = columns[0];
  const basePart = parts[0];
  const best = [...columns].sort((a, b) => (b.percents[0] ?? 0) - (a.percents[0] ?? 0))[0];
  const reading =
    widest && basePart
      ? {
          name: widest.row.label,
          share: widest.percentText,
          base: formatPercent((widest.percents[0] ?? 0) / 100, 0),
          baseName: basePart.label.toLowerCase(),
          overall: formatPercent((overallPercents[0] ?? 0) / 100, 0),
        }
      : null;

  const summary = [
    `Gráfico marimekko com ${formatInt(total)} leads de ${formatInt(columns.length)} origens, divididos pela cobertura do dado.`,
    reading ? `${reading.name} traz ${reading.share} dos leads e ${reading.base} deles têm ${reading.baseName}, contra ${reading.overall} no total.` : '',
    best && reading ? `A melhor cobertura é de ${best.row.label.toLowerCase()}, com ${formatPercent((best.percents[0] ?? 0) / 100, 0)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-4 text-text-secondary">
          <span className="font-semibold text-text-primary">{reading.name}</span> traz{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.share}</span> dos leads e{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.base}</span> deles têm {reading.baseName}, contra{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.overall}</span> no total
        </p>
      ) : null}
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        {parts.map((part, index) => {
          const color = colors[index] ?? null;
          return (
            <li className="flex items-center gap-1.5 text-xs leading-4" key={part.id}>
              {color === null ? (
                <svg aria-hidden className="block shrink-0" height={10} viewBox="0 0 10 10" width={10}>
                  <path d="M0.5 0.5 H9.5 V9.5 H0.5 Z M0.5 6 L6 0.5 M4 9.5 L9.5 4" fill="none" stroke={NEUTRAL_STROKE} strokeWidth={1} />
                </svg>
              ) : (
                <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />
              )}
              <span className="text-text-secondary">{part.label}</span>
              <span className="kpi-number font-medium text-text-primary">{formatPercent((overallPercents[index] ?? 0) / 100, 0)}</span>
            </li>
          );
        })}
        <li className="ml-auto text-xs leading-4 text-text-muted">
          de <span className="kpi-number text-text-secondary">{formatInt(total)}</span> leads
        </li>
      </ul>
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="block h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          <defs>
            {/* A diagonal é desenhada no próprio padrão, sem patternTransform: giro no preview desliga as guardas de texto. */}
            <pattern height={HATCH_STEP} id={hatchId} patternUnits="userSpaceOnUse" width={HATCH_STEP}>
              <path d={`M-1 1 L1 -1 M0 ${String(HATCH_STEP)} L${String(HATCH_STEP)} 0 M${String(HATCH_STEP - 1)} ${String(HATCH_STEP + 1)} L${String(HATCH_STEP + 1)} ${String(HATCH_STEP - 1)}`} stroke={NEUTRAL_STROKE} strokeWidth={1} />
            </pattern>
          </defs>
          {cells.map((cell) => {
            const { tile } = cell;
            if (tile.h <= 0) return null;
            return (
              <g key={cell.key}>
                <title>{`${cell.column.row.label}, ${cell.part.label.toLowerCase()}: ${formatInt(cell.value)} de ${formatInt(cell.column.count)} leads`}</title>
                {cell.color === null ? (
                  // Contorno por dentro da caixa: o traço não rouba área do vizinho nem fecha o vão.
                  <rect fill={`url(#${hatchId})`} height={Math.max(tile.h - 1, 0)} stroke={NEUTRAL_STROKE} strokeWidth={1} width={Math.max(tile.w - 1, 0)} x={tile.x + 0.5} y={tile.y + 0.5} />
                ) : (
                  <rect fill={cell.color} height={tile.h} width={tile.w} x={tile.x} y={tile.y} />
                )}
                {cell.labeled ? (
                  <text
                    className="font-display"
                    dominantBaseline="central"
                    fill={cell.color === null ? 'var(--text-primary)' : ON_COLOR_TEXT}
                    fontSize={TILE_FONT}
                    fontWeight={500}
                    style={cell.color === null ? HATCH_HALO : undefined}
                    textAnchor="middle"
                    x={tile.x + tile.w / 2}
                    y={tile.y + tile.h / 2}
                  >
                    {cell.text}
                  </text>
                ) : null}
              </g>
            );
          })}
          {columns.map((column, index) => {
            const base = tiles[index]?.[0];
            if (!base || column.nameLines === null) return null;
            const cx = base.x + base.w / 2;
            return (
              <g key={column.row.id}>
                {column.nameLines.map((line, lineIndex) => (
                  <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={NAME_FONT} fontWeight={500} key={line} textAnchor="middle" x={cx} y={rowY(nameRows - (column.nameLines?.length ?? 1) + lineIndex)}>
                    {line}
                  </text>
                ))}
                <text dominantBaseline="central" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={rowY(nameRows)}>
                  <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>{`${formatInt(column.count)} `}</tspan>
                  <tspan className="font-sans" fill="var(--text-muted)">leads</tspan>
                </text>
                <text dominantBaseline="central" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={rowY(nameRows + 1)}>
                  <tspan className="font-display" fill="var(--text-secondary)">{column.shareSuffix ? `${column.percentText} ` : column.percentText}</tspan>
                  {column.shareSuffix ? <tspan className="font-sans" fill="var(--text-muted)">{column.shareSuffix}</tspan> : null}
                </text>
              </g>
            );
          })}
          {tiered.map((column, tier) => {
            const base = tiles[columns.indexOf(column)]?.[0];
            if (!base) return null;
            const cx = base.x + base.w / 2;
            const name = `${column.row.label}: `;
            const value = `${formatInt(column.count)} leads, ${column.percentText}`;
            // O rótulo escalonado fica à esquerda da linha conectora; só vira para a direita se não couber.
            const toLeft = cx - TIER_OFFSET - estimateWidth(name + value, VALUE_FONT) >= 0;
            return (
              <g key={column.row.id}>
                <line stroke={NEUTRAL_STROKE} strokeWidth={1} x1={cx} x2={cx} y1={plot.height + 2} y2={tierY(tier)} />
                <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} textAnchor={toLeft ? 'end' : 'start'} x={toLeft ? cx - TIER_OFFSET : cx + TIER_OFFSET} y={tierY(tier)}>
                  <tspan className="font-sans">{name}</tspan>
                  <tspan className="font-display">{value}</tspan>
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
              {cell.column.row.label}, {cell.part.label.toLowerCase()} <span className="kpi-number text-text-secondary">{cell.text}</span>
            </span>
          ))}
          {emptyRows.map((row, index) => (
            <span key={row.id}>
              {muted.length > 0 || index > 0 ? '; ' : ''}
              {row.label}, sem leads no período
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
