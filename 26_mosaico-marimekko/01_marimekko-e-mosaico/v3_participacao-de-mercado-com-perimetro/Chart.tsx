import { ChevronDown, ChevronRight, Filter } from 'lucide-react';
import { useState } from 'react';

import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  perimeter as defaultPerimeter,
  players as defaultPlayers,
  type MarketColumn,
  type MarketView,
  type Perimeter,
  type Player,
} from './data';

/**
 * Marimekko de participação de mercado: a largura de cada coluna é o peso do segmento no perímetro
 * declarado e a altura se divide pela fatia de cada competidor, com a nossa na base, que é a única
 * parte com linha de base comum entre colunas. Participação de mercado só existe contra um
 * perímetro, então ele vai escrito no subtítulo, com a procedência do total. O seletor troca a
 * coluna de segmento para região sem mexer na ordem das partes. O SVG é decorativo para o leitor
 * de tela: quem carrega os números é a frase da raiz e a tabela cruzada equivalente em `details`.
 */
export interface MarketShareMarimekkoProps {
  /** Visões do mesmo perímetro; a primeira abre e as demais entram no seletor. */
  readonly data?: readonly MarketView[];
  /** Competidores na ordem da pilha, da base para o topo; o primeiro é o destacado. */
  readonly players?: readonly Player[];
  /** Fonte e procedência do total do mercado. */
  readonly perimeter?: Perimeter;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas 960x500 menos subtítulo, legenda, lista e tabela fechada: escala 1 (GEO-18). */
const VIEW_W = 894;
const VIEW_H = 273;
const MARGIN_TOP = 2;
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
/** Rótulo interno só em ladrilho de pelo menos 28 por 18 px: texto de 12 px mais 6 (ESP-2). */
const LABEL_MIN_WIDTH = 28;
const LABEL_MIN_HEIGHT = 18;
const LABEL_PAD = 4;
/**
 * A cor é da posição na lista de competidores, que é fixa: o primeiro em `--chart-1` e os demais
 * em três neutros que se separam nos dois temas (cheio forte, cheio fraco e poço com contorno).
 * O poço não é hachura: hachura neste modelo quer dizer dado ausente. Tinta pelo par medido.
 */
const PLAYER_STYLE = [
  { fill: 'var(--chart-1)', ink: 'var(--accent-cyan-contrast)', outline: false },
  { fill: 'var(--text-muted)', ink: 'var(--surface-raised)', outline: false },
  { fill: 'var(--line-strong)', ink: 'var(--text-primary)', outline: false },
  { fill: 'var(--surface-sunken)', ink: 'var(--text-secondary)', outline: true },
] as const;
const OUTLINE_STROKE = 'var(--line-strong)';
/** Procedência do total do perímetro: é de um número de dentro do gráfico, não do cartão (ANO-6). */
const PROVENANCE = {
  medido: { label: 'MEDIDO', tone: 'text-prov-medido' },
  premissa: { label: 'PREMISSA', tone: 'text-prov-premissa' },
} as const;

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

/** Só a inicial baixa: "Concorrente A" no meio da frase vira "concorrente A", e a letra dele fica. */
function lowerFirst(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1);
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
 * da partilha (GEO-16): a altura útil desconta um vão por parte, igual em toda coluna, então a
 * área de cada ladrilho fica exatamente proporcional à célula, inclusive na coluna de poucos pixels.
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

export default function MarketShareMarimekko({
  data = defaultData,
  players = defaultPlayers,
  perimeter = defaultPerimeter,
  height,
  className,
}: MarketShareMarimekkoProps) {
  const [viewId, setViewId] = useState<string | null>(null);
  const [tableOpen, setTableOpen] = useState(false);
  const style = height === undefined ? undefined : { height };
  const view = data.find((option) => option.id === viewId) ?? data[0];
  const valuesOf = (column: MarketColumn): readonly number[] => players.map((player) => column.revenue[player.id]);
  // Coluna sem receita não tem largura: sai do desenho e fica declarada na lista de identificação.
  const rows = (view?.columns ?? []).filter((column) => sum(valuesOf(column)) > 0).sort((a, b) => sum(valuesOf(b)) - sum(valuesOf(a)));
  const emptyRows = (view?.columns ?? []).filter((column) => sum(valuesOf(column)) <= 0);

  if (!view || rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma receita neste recorte: sem perímetro declarado não há participação de mercado para mostrar.</span>
      </div>
    );
  }

  const totals = rows.map((column) => sum(valuesOf(column)));
  const total = sum(totals);
  const widths = columnWidths(totals, VIEW_W);
  const overallPercents = largestRemainder(players.map((player) => sum(rows.map((column) => column.revenue[player.id])))) ?? [];
  const provenance = PROVENANCE[perimeter.provenance];
  const inSentence = (label: string): string => (view.properNames ? label : lowerFirst(label));
  const styleOf = (index: number) => PLAYER_STYLE[Math.min(index, PLAYER_STYLE.length - 1)] ?? PLAYER_STYLE[0];

  const columns = rows.map((row, index) => {
    const w = widths[index] ?? 0;
    const count = totals[index] ?? 0;
    // Uma casa na participação da coluna: com percentual inteiro o segmento de 0,5% leria 0% ou 1%.
    const shareText = formatPercent(count / total);
    // A base do percentual vai escrita só na primeira coluna, que é a mais larga: unidade no primeiro tique.
    const shareSuffix = index === 0 && estimateWidth(`${shareText} do perímetro`, VALUE_FONT) <= w ? 'do perímetro' : '';
    const totalText = formatCurrencyCompact(count);
    const nameLines = wrapLabel(row.label, w);
    const fits = nameLines !== null && estimateWidth(totalText, VALUE_FONT) <= w;
    return { row, w, count, shareText, shareSuffix, totalText, nameLines: fits ? nameLines : null, percents: largestRemainder(valuesOf(row)) ?? [] };
  });

  const nameRows = columns.reduce((most, column) => Math.max(most, column.nameLines?.length ?? 1), 1);
  const tiered = columns.filter((column) => column.nameLines === null);
  const tierGap = Math.min(tiered.length, 1) * TIER_GAP;
  const axisHeight = AXIS_GAP + (nameRows + 2) * AXIS_LINE + tierGap + tiered.length * TIER_LINE + AXIS_PAD_BOTTOM;
  const plot: Box = { x: 0, y: MARGIN_TOP, width: VIEW_W, height: VIEW_H - MARGIN_TOP - axisHeight };
  const tiles = marimekko(rows.map(valuesOf), plot);
  const axisTop = plot.y + plot.height;
  const rowY = (row: number): number => axisTop + AXIS_GAP + AXIS_LINE * (row + 0.5);
  const tierY = (tier: number): number => axisTop + AXIS_GAP + AXIS_LINE * (nameRows + 2) + tierGap + TIER_LINE * (tier + 0.5);

  const cells = columns.flatMap((column, columnIndex) =>
    players.map((player, playerIndex) => {
      const tile = tiles[columnIndex]?.[playerIndex] ?? { x: 0, w: 0, y: 0, h: 0 };
      const text = formatPercent((column.percents[playerIndex] ?? 0) / 100, 0);
      const labeled = tile.h >= LABEL_MIN_HEIGHT && tile.w >= Math.max(LABEL_MIN_WIDTH, estimateWidth(text, TILE_FONT) + LABEL_PAD * 2);
      // O destaque não mora só na cor (TOK-9): o ladrilho da parte destacada leva o nome junto do percentual quando cabe.
      const named = labeled && playerIndex === 0 && tile.w >= estimateWidth(`${player.label} ${text}`, TILE_FONT) + LABEL_PAD * 2;
      return { key: `${column.row.id}-${player.id}`, column, player, look: styleOf(playerIndex), tile, value: column.row.revenue[player.id], text, labeled, named };
    }),
  );
  const mutedGroups = columns
    .map((column) => ({ column, items: cells.filter((cell) => cell.column === column && !cell.labeled) }))
    .filter((group) => group.items.length > 0);

  const ours = players[0];
  const byOurs = [...columns].sort((a, b) => (a.percents[0] ?? 0) - (b.percents[0] ?? 0));
  const lowest = byOurs[0];
  const highest = byOurs[byOurs.length - 1];
  const widest = columns[0];
  const perimeterText = formatCurrencyCompact(total);

  const summary = [
    `Marimekko de participação de mercado em ${formatInt(columns.length)} ${view.plural}, perímetro de ${perimeterText} (${provenance.label.toLowerCase()}).`,
    ours && lowest && highest
      ? `${ours.label}: ${formatPercent((overallPercents[0] ?? 0) / 100, 0)} do perímetro, de ${formatPercent((lowest.percents[0] ?? 0) / 100, 0)} em ${inSentence(lowest.row.label)} a ${formatPercent((highest.percents[0] ?? 0) / 100, 0)} em ${inSentence(highest.row.label)}.`
      : '',
    widest ? `O maior peso é de ${inSentence(widest.row.label)}, com ${widest.shareText}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-xs leading-4 text-text-secondary">
          Perímetro de <span className="kpi-number font-medium text-text-primary">{perimeterText}</span>{' '}
          <span className={cn('text-[0.6875rem] font-semibold tracking-wide', provenance.tone)}>{provenance.label}</span> em{' '}
          <span className="kpi-number">{formatInt(columns.length)}</span> {view.plural}, {perimeter.source}
        </p>
        {data.length > 1 ? (
          <div className="flex items-center gap-2">
            <span className="text-[0.6875rem] leading-4 text-text-muted">Colunas por</span>
            <div className="flex gap-0.5 rounded-md bg-surface-sunken p-0.5">
              {data.map((option) => (
                <button
                  aria-pressed={option.id === view.id}
                  className={cn(
                    'rounded px-2 py-0.5 text-[0.6875rem] leading-4 outline-none focus-visible:ring-2 focus-visible:ring-chart-1',
                    option.id === view.id ? 'bg-surface-raised font-semibold text-text-primary' : 'font-medium text-text-secondary',
                  )}
                  key={option.id}
                  onClick={() => {
                    setViewId(option.id);
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        {players.map((player, index) => (
          <li className="flex items-center gap-1.5 text-xs leading-4" key={player.id}>
            <span aria-hidden className={cn('size-2.5 shrink-0 rounded-[2px]', styleOf(index).outline && 'border border-line-strong')} style={{ backgroundColor: styleOf(index).fill }} />
            {/* O destaque não mora só na cor (COR-2): o nome da parte destacada pesa mais na legenda e no ladrilho. */}
            <span className={index === 0 ? 'font-semibold text-text-primary' : 'text-text-secondary'}>{player.label}</span>
            <span className="kpi-number font-medium text-text-primary">{formatPercent((overallPercents[index] ?? 0) / 100, 0)}</span>
          </li>
        ))}
        <li className="ml-auto text-xs leading-4 text-text-muted">fatia no perímetro inteiro</li>
      </ul>
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="block h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {cells.map((cell) => {
            const { tile, look } = cell;
            if (tile.h <= 0) return null;
            return (
              <g key={cell.key}>
                <title>{`${cell.column.row.label}, ${lowerFirst(cell.player.label)}: ${formatCurrencyCompact(cell.value)} de ${cell.column.totalText}`}</title>
                {look.outline ? (
                  // Contorno por dentro da caixa: o traço não rouba área do vizinho nem fecha o vão.
                  <rect fill={look.fill} height={Math.max(tile.h - 1, 0)} stroke={OUTLINE_STROKE} strokeWidth={1} width={Math.max(tile.w - 1, 0)} x={tile.x + 0.5} y={tile.y + 0.5} />
                ) : (
                  <rect fill={look.fill} height={tile.h} width={tile.w} x={tile.x} y={tile.y} />
                )}
                {cell.labeled ? (
                  <text dominantBaseline="central" fill={look.ink} fontSize={TILE_FONT} fontWeight={cell.player === ours ? 600 : 500} textAnchor="middle" x={tile.x + tile.w / 2} y={tile.y + tile.h / 2}>
                    {cell.named ? <tspan className="font-sans">{`${cell.player.label} `}</tspan> : null}
                    <tspan className="font-display">{cell.text}</tspan>
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
                <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={VALUE_FONT} fontWeight={500} textAnchor="middle" x={cx} y={rowY(nameRows)}>
                  {column.totalText}
                </text>
                <text dominantBaseline="central" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={rowY(nameRows + 1)}>
                  <tspan className="font-display" fill="var(--text-secondary)">{column.shareSuffix ? `${column.shareText} ` : column.shareText}</tspan>
                  {column.shareSuffix ? <tspan className="font-sans" fill="var(--text-muted)">{column.shareSuffix}</tspan> : null}
                </text>
              </g>
            );
          })}
          {tiered.map((column, tier) => {
            // Coluna estreita fica sempre à direita, pela ordenação: o rótulo escalonado cresce para a esquerda da conectora.
            const base = tiles[columns.indexOf(column)]?.[0];
            if (!base) return null;
            const cx = base.x + base.w / 2;
            return (
              <g key={column.row.id}>
                <line stroke="var(--text-muted)" strokeWidth={1} x1={cx} x2={cx} y1={axisTop + 2} y2={tierY(tier)} />
                <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} textAnchor="end" x={cx - TIER_OFFSET} y={tierY(tier)}>
                  <tspan className="font-sans">{`${column.row.label}: `}</tspan>
                  <tspan className="font-display">{`${column.totalText}, ${column.shareText} do perímetro`}</tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {mutedGroups.length > 0 || emptyRows.length > 0 ? (
        <p className="mt-2 shrink-0 text-[0.6875rem] leading-4 text-text-muted">
          Sem rótulo no desenho:{' '}
          {mutedGroups.map((group, groupIndex) => (
            <span key={group.column.row.id}>
              {groupIndex > 0 ? '; ' : ''}
              {group.column.row.label}:{' '}
              {group.items.map((cell, index) => (
                <span key={cell.key}>
                  {index > 0 ? ', ' : ''}
                  {lowerFirst(cell.player.label)} <span className="kpi-number text-text-secondary">{cell.text}</span>
                </span>
              ))}
            </span>
          ))}
          {emptyRows.map((column, index) => (
            <span key={column.id}>
              {mutedGroups.length > 0 || index > 0 ? '; ' : ''}
              {column.label}, sem receita no perímetro
            </span>
          ))}
        </p>
      ) : null}
      {/* A tabela só entra na árvore com o details aberto: fechada, ela não ocupa altura nem conta no corpo do cartão. */}
      <details
        className="mt-2 shrink-0"
        onToggle={(event) => {
          setTableOpen(event.currentTarget.open);
        }}
      >
        <summary className="flex cursor-pointer list-none items-center gap-1 text-[0.6875rem] leading-4 text-text-muted outline-none focus-visible:ring-2 focus-visible:ring-chart-1 [&::-webkit-details-marker]:hidden">
          {tableOpen ? <ChevronDown aria-hidden className="size-3 shrink-0" /> : <ChevronRight aria-hidden className="size-3 shrink-0" />}
          Tabela cruzada equivalente
        </summary>
        {tableOpen ? (
          <table className="mt-1 w-full text-[0.6875rem] leading-5 text-text-secondary">
            <caption className="sr-only">Receita por competidor em cada coluna, com a fatia dentro dela, e o peso da coluna no perímetro</caption>
            <thead>
              <tr className="text-text-muted">
                <th className="text-left font-medium" scope="col">
                  {view.label}
                </th>
                {players.map((player) => (
                  <th className="text-right font-medium" key={player.id} scope="col">
                    {player.label}
                  </th>
                ))}
                <th className="text-right font-medium" scope="col">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {columns.map((column) => (
                <tr key={column.row.id}>
                  <th className="text-left font-medium text-text-primary" scope="row">
                    {column.row.label}
                  </th>
                  {players.map((player, index) => (
                    <td className="kpi-number text-right" key={player.id}>
                      {formatCurrencyCompact(column.row.revenue[player.id])} ({formatPercent((column.percents[index] ?? 0) / 100, 0)})
                    </td>
                  ))}
                  <td className="kpi-number text-right text-text-primary">
                    {column.totalText} ({column.shareText})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </details>
    </div>
  );
}
