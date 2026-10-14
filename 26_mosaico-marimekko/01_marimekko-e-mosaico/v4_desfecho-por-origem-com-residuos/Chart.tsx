import { ArrowLeftRight, Filter } from 'lucide-react';
import { useId, useState } from 'react';

import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  outcomes as defaultOutcomes,
  variables as defaultVariables,
  type MosaicVariables,
  type OriginOutcomes,
  type Outcome,
} from './data';

/**
 * Mosaico de duas variáveis com resíduos: a primeira variável divide a largura e a segunda divide
 * a altura dentro de cada grupo, então a área de cada ladrilho é a contagem da combinação. A cor
 * não é categoria: é o resíduo de Pearson contra a independência, isto é, quanto a combinação
 * acontece mais ou menos do que aconteceria se origem e desfecho não tivessem relação. Resíduo não
 * é bom nem ruim, por isso `--chart-1` contra neutro e nunca `--positive` contra `--negative`.
 * Esperado abaixo de 5 fica sem cor, hachurado, e a contagem zero vira linha marcada: nenhuma das
 * duas some. O botão inverte qual variável divide primeiro, e o subtítulo sempre diz a ordem.
 */
export interface OutcomeResidualMosaicProps {
  /** Uma linha por categoria da primeira variável, com a contagem por desfecho. */
  readonly data?: readonly OriginOutcomes[];
  /** Categorias da segunda variável, na ordem da pilha, da base para o topo. */
  readonly outcomes?: readonly Outcome[];
  /** Nome das duas variáveis, para o subtítulo que declara a ordem da divisão. */
  readonly variables?: MosaicVariables;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas 640x584 menos subtítulo, linha de leitura, legenda e lista: escala 1 (GEO-18). */
const VIEW_W = 574;
const VIEW_H = 296;
/** Folga do topo para a linha de contagem zero, que pode cair na borda de cima do plano. */
const MARGIN_TOP = 4;
/** Folga à direita para o marcador da contagem zero na última coluna. */
const PLOT_RIGHT = 8;
/** Mosaico estatístico: vão maior entre grupos (6 px) que entre partes (2 px). */
const GROUP_GAP = 6;
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
/** Rótulo de uma linha pede 18 px de altura (texto de 12 px mais 6, ESP-2); o de duas linhas, 34. */
const LABEL_MIN_HEIGHT = 18;
const STACK_MIN_HEIGHT = 34;
const STACK_LINE = 14;
const LABEL_PAD = 6;
const HATCH_STEP = 6;
/** Limiares do resíduo de Pearson: 2 é o corte usual de desvio notável e 4 o de desvio forte. */
const LIMIT_MILD = 2;
const LIMIT_STRONG = 4;
/** Abaixo de 5 esperadas o resíduo não se sustenta: a célula fica sem cor (amostra insuficiente). */
const MIN_EXPECTED = 5;
/** Hachura, contorno da amostra insuficiente e linha do zero: `--line-strong` some como marca (TOK-5). */
const NEUTRAL_STROKE = 'var(--text-muted)';
const ZERO_DOT = 2.5;
/** Halo da ROT-7 no rótulo que fica por cima da hachura: sem ele a diagonal corta o algarismo. */
const HATCH_HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

type Band = 'strongBelow' | 'below' | 'near' | 'above' | 'strongAbove';

/**
 * Não existe rampa divergente nos tokens (TOK-3), então a escala é `--chart-1` contra neutro e a
 * intensidade mora na forma, não na opacidade: contorno entre 2 e 4, preenchimento cheio acima de
 * 4. Do lado de baixo, `--line-strong` cheio e `--text-muted` cheio; perto de zero, poço com
 * contorno fino. Tinta de cada rótulo pelo par medido sobre o preenchimento, nos dois temas.
 */
const BAND_STYLE: Record<Band, { readonly fill: string; readonly stroke: string | null; readonly strokeWidth: number; readonly ink: string }> = {
  strongBelow: { fill: 'var(--text-muted)', stroke: null, strokeWidth: 0, ink: 'var(--surface-raised)' },
  below: { fill: 'var(--line-strong)', stroke: null, strokeWidth: 0, ink: 'var(--text-primary)' },
  near: { fill: 'var(--surface-sunken)', stroke: 'var(--line-strong)', strokeWidth: 1, ink: 'var(--text-primary)' },
  above: { fill: 'var(--surface-sunken)', stroke: 'var(--chart-1)', strokeWidth: 2, ink: 'var(--text-primary)' },
  strongAbove: { fill: 'var(--chart-1)', stroke: null, strokeWidth: 0, ink: 'var(--accent-cyan-contrast)' },
};
/** Ordem da legenda, do menos ao mais que o esperado, com o limiar que separa cada par de vizinhos. */
const BAND_ORDER: readonly Band[] = ['strongBelow', 'below', 'near', 'above', 'strongAbove'];
const BAND_LIMITS = [-LIMIT_STRONG, -LIMIT_MILD, LIMIT_MILD, LIMIT_STRONG] as const;

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

interface Pearson {
  readonly expected: number;
  readonly residual: number;
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
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

function lowerFirst(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1);
}

/** Sinal à mão sobre o valor absoluto (NUM-3): o formatador não escreve o `+`. */
function signed(value: number, digits: number): string {
  return `${value < 0 ? '−' : '+'}${formatDecimal(Math.abs(value), digits)}`;
}

/**
 * Resíduo de Pearson da célula contra a independência: observado menos esperado, dividido pela
 * raiz do esperado, com esperado = total do grupo × total da parte ÷ total geral. `null` quando
 * não há esperado para comparar (EST-1b): ausência não vira resíduo zero.
 */
function pearson(observed: number, groupTotal: number, partTotal: number, grand: number): Pearson | null {
  if (grand <= 0) return null;
  const expected = (groupTotal * partTotal) / grand;
  if (expected <= 0) return null;
  return { expected, residual: (observed - expected) / Math.sqrt(expected) };
}

/** `null` é amostra insuficiente: esperado abaixo de 5, onde o resíduo não se lê. */
function bandOf(stat: Pearson | null): Band | null {
  if (stat === null || stat.expected < MIN_EXPECTED) return null;
  if (stat.residual >= LIMIT_STRONG) return 'strongAbove';
  if (stat.residual >= LIMIT_MILD) return 'above';
  if (stat.residual <= -LIMIT_STRONG) return 'strongBelow';
  if (stat.residual <= -LIMIT_MILD) return 'below';
  return 'near';
}

/** Largura de cada grupo: os vãos saem antes da partilha, então as larguras guardam a proporção. */
function columnWidths(totals: readonly number[], width: number): readonly number[] {
  const usable = width - GROUP_GAP * (totals.length - 1);
  const grand = sum(totals);
  return totals.map((value) => (usable * value) / grand);
}

/**
 * Layout puro do mosaico de duas variáveis, o mesmo do marimekko 100% com vão maior entre grupos:
 * recebe uma lista de contagens por grupo, da base para o topo, e devolve x, w, y e h de cada
 * ladrilho. Todo grupo chega com total positivo. Os vãos saem ANTES da partilha (GEO-16): a altura
 * útil desconta um vão por parte, igual em todo grupo, mesmo quando a parte vale zero, então a
 * área de cada ladrilho fica exatamente proporcional à contagem. A parte zero sai com h = 0, na
 * posição dela na pilha, e é ali que o desenho risca a linha marcada.
 */
function mosaic(groups: readonly (readonly number[])[], box: Box): readonly (readonly TileBox[])[] {
  const widths = columnWidths(groups.map(sum), box.width);
  const placed: TileBox[][] = [];
  let x = box.x;
  groups.forEach((values, index) => {
    const w = widths[index] ?? 0;
    const groupTotal = sum(values);
    const usableHeight = box.height - PART_GAP * (values.length - 1);
    const tiles: TileBox[] = [];
    let bottom = box.y + box.height;
    for (const value of values) {
      const h = (usableHeight * value) / groupTotal;
      tiles.push({ x, w, y: bottom - h, h });
      bottom -= h + PART_GAP;
    }
    placed.push(tiles);
    x += w + GROUP_GAP;
  });
  return placed;
}

interface Group {
  readonly id: string;
  readonly label: string;
  readonly values: readonly number[];
}

export default function OutcomeResidualMosaic({
  data = defaultData,
  outcomes = defaultOutcomes,
  variables = defaultVariables,
  height,
  className,
}: OutcomeResidualMosaicProps) {
  const hatchId = useId();
  const [swapped, setSwapped] = useState(false);
  const style = height === undefined ? undefined : { height };
  // A mesma tabela nos dois sentidos: quem divide primeiro vira grupo (largura) e a outra variável vira parte (altura).
  const byRow: readonly Group[] = data.map((row) => ({ id: row.id, label: row.label, values: outcomes.map((outcome) => row.counts[outcome.id]) }));
  const byOutcome: readonly Group[] = outcomes.map((outcome) => ({ id: outcome.id, label: outcome.label, values: data.map((row) => row.counts[outcome.id]) }));
  const allGroups = swapped ? byOutcome : byRow;
  const parts = swapped ? byRow : byOutcome;
  const firstName = swapped ? variables.outcomes : variables.rows;
  const secondName = swapped ? variables.rows : variables.outcomes;
  // Grupo sem contagem não tem largura: sai do desenho e fica declarado na lista de identificação.
  const groups = allGroups.filter((group) => sum(group.values) > 0).sort((a, b) => sum(b.values) - sum(a.values));
  const emptyGroups = allGroups.filter((group) => sum(group.values) <= 0);

  if (groups.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade neste recorte: sem contagem não há combinação para comparar com o esperado.</span>
      </div>
    );
  }

  const groupTotals = groups.map((group) => sum(group.values));
  const grand = sum(groupTotals);
  const partTotals = parts.map((_, partIndex) => sum(groups.map((group) => group.values[partIndex] ?? 0)));
  const plotWidth = VIEW_W - PLOT_RIGHT;
  const widths = columnWidths(groupTotals, plotWidth);

  const columns = groups.map((group, index) => {
    const w = widths[index] ?? 0;
    const count = groupTotals[index] ?? 0;
    const plainSize = `n = ${formatInt(count)}`;
    const nounSize = `${plainSize} oportunidades`;
    // O substantivo da unidade vai no eixo da primeira coluna quando cabe (NUM-6).
    const sizeText = index === 0 && estimateWidth(nounSize, VALUE_FONT) <= w ? nounSize : plainSize;
    const nameLines = wrapLabel(group.label, w);
    const fits = nameLines !== null && estimateWidth(sizeText, VALUE_FONT) <= w;
    return { group, w, count, sizeText, nameLines: fits ? nameLines : null };
  });

  const nameRows = columns.reduce((most, column) => Math.max(most, column.nameLines?.length ?? 1), 1);
  const tiered = columns.filter((column) => column.nameLines === null);
  const tierGap = Math.min(tiered.length, 1) * TIER_GAP;
  const axisHeight = AXIS_GAP + (nameRows + 1) * AXIS_LINE + tierGap + tiered.length * TIER_LINE + AXIS_PAD_BOTTOM;
  const plot: Box = { x: 0, y: MARGIN_TOP, width: plotWidth, height: VIEW_H - MARGIN_TOP - axisHeight };
  const tiles = mosaic(groups.map((group) => group.values), plot);
  const axisTop = plot.y + plot.height;
  const rowY = (row: number): number => axisTop + AXIS_GAP + AXIS_LINE * (row + 0.5);
  const tierY = (tier: number): number => axisTop + AXIS_GAP + AXIS_LINE * (nameRows + 1) + tierGap + TIER_LINE * (tier + 0.5);

  const cells = columns.flatMap((column, columnIndex) =>
    parts.map((part, partIndex) => {
      const tile = tiles[columnIndex]?.[partIndex] ?? { x: 0, w: 0, y: 0, h: 0 };
      const observed = column.group.values[partIndex] ?? 0;
      const stat = pearson(observed, column.count, partTotals[partIndex] ?? 0, grand);
      const band = bandOf(stat);
      const countText = formatInt(observed);
      const inlineWidth = estimateWidth(`${part.label} ${countText}`, TILE_FONT) + LABEL_PAD * 2;
      // O número do resíduo só acompanha quem foge do esperado: é o segundo canal da cor (ACE-2).
      const residualText = stat !== null && band !== null && band !== 'near' ? signed(stat.residual, 1) : '';
      const stackWidth = estimateWidth(part.label, TILE_FONT) + LABEL_PAD * 2;
      const mode = tile.h >= LABEL_MIN_HEIGHT && tile.w >= inlineWidth ? 'inline' : tile.h >= STACK_MIN_HEIGHT && tile.w >= stackWidth ? 'stacked' : 'mute';
      const showResidual = mode === 'inline' && residualText !== '' && tile.w >= inlineWidth + estimateWidth(residualText, VALUE_FONT) + LABEL_PAD;
      return { key: `${column.group.id}-${part.id}`, column, part, tile, observed, stat, band, countText, residualText, mode, showResidual };
    }),
  );
  const mutedGroups = columns
    .map((column) => ({ column, items: cells.filter((cell) => cell.column === column && cell.mode === 'mute') }))
    .filter((group) => group.items.length > 0);

  const judged = cells.flatMap((cell) => (cell.stat !== null && cell.band !== null ? [{ cell, stat: cell.stat, band: cell.band }] : []));
  const extreme = [...judged].sort((a, b) => Math.abs(b.stat.residual) - Math.abs(a.stat.residual))[0];
  const notable = judged.filter((item) => item.band !== 'near').length;
  const insufficient = cells.length - judged.length;
  const reading = extreme
    ? {
        group: lowerFirst(extreme.cell.column.group.label),
        part: lowerFirst(extreme.cell.part.label),
        observed: `${extreme.cell.countText} oportunidades`,
        expected: formatDecimal(extreme.stat.expected, 1),
        residual: signed(extreme.stat.residual, 1),
      }
    : null;

  const flagged = judged.filter((item) => item.band !== 'near' && item.cell.mode !== 'mute' && !item.cell.showResidual);
  const summary = [
    `Mosaico de ${formatInt(grand)} oportunidades por ${firstName} e ${secondName}, com cor pelo resíduo de Pearson.`,
    reading ? `Maior desvio: ${reading.group} com ${reading.part}, ${reading.observed} contra ${reading.expected} esperadas (resíduo ${reading.residual}).` : '',
    `${formatInt(notable)} de ${formatInt(cells.length)} combinações fogem do esperado${insufficient > 0 ? `; ${formatInt(insufficient)} sem amostra` : ''}.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-xs leading-4 text-text-secondary">
          Divisão: primeiro por <span className="font-semibold text-text-primary">{firstName}</span> (largura), depois por{' '}
          <span className="font-semibold text-text-primary">{secondName}</span> (altura)
        </p>
        <button
          aria-pressed={swapped}
          className={cn(
            'flex items-center gap-1 rounded-md bg-surface-sunken px-2 py-1 text-[0.6875rem] leading-4 outline-none focus-visible:ring-2 focus-visible:ring-chart-1',
            swapped ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary',
          )}
          onClick={() => {
            setSwapped((current) => !current);
          }}
          type="button"
        >
          <ArrowLeftRight aria-hidden className="size-3 shrink-0" />
          Inverter variáveis
        </button>
      </div>
      {reading ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-4 text-text-secondary">
          Maior desvio: <span className="font-semibold text-text-primary">{reading.group}</span> com {reading.part},{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.observed}</span> contra{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.expected}</span> esperadas (resíduo{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.residual}</span>)
        </p>
      ) : null}
      <div className="mb-3 flex shrink-0 flex-col gap-1 text-[0.6875rem] leading-4 text-text-muted">
        <div className="flex flex-wrap items-center gap-x-1.5">
          <span className="text-text-secondary">Resíduo de Pearson:</span>
          <span>menos que o esperado</span>
          {BAND_ORDER.map((band, index) => {
            const look = BAND_STYLE[band];
            const limit = BAND_LIMITS[index];
            return (
              <span className="flex items-center gap-1.5" key={band}>
                {/* Amostra na forma da marca: cheio, contorno ou poço, como o ladrilho. */}
                <span
                  aria-hidden
                  className="block h-2.5 w-3.5 shrink-0"
                  style={{ backgroundColor: look.fill, border: look.stroke === null ? undefined : `${String(look.strokeWidth)}px solid ${look.stroke}` }}
                />
                {limit === undefined ? null : <span className="kpi-number text-text-secondary">{signed(limit, 0)}</span>}
              </span>
            );
          })}
          <span>mais que o esperado</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4">
          <span className="flex items-center gap-1.5">
            <svg aria-hidden className="block shrink-0" height={10} viewBox="0 0 14 10" width={14}>
              <path d="M0.5 0.5 H13.5 V9.5 H0.5 Z M0.5 7 L7 0.5 M4 9.5 L13 0.5 M10 9.5 L13.5 6" fill="none" stroke={NEUTRAL_STROKE} strokeWidth={1} />
            </svg>
            <span>
              esperado abaixo de <span className="kpi-number">{formatInt(MIN_EXPECTED)}</span>: amostra insuficiente, sem cor
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <svg aria-hidden className="block shrink-0" height={10} viewBox="0 0 20 10" width={20}>
              <line stroke={NEUTRAL_STROKE} strokeWidth={1} x1={0} x2={14} y1={5} y2={5} />
              <circle cx={17} cy={5} fill={NEUTRAL_STROKE} r={ZERO_DOT} />
            </svg>
            <span>contagem zero observada</span>
          </span>
        </div>
      </div>
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
            const groupLabel = cell.column.group.label;
            const tip =
              cell.stat === null
                ? `${groupLabel}, ${lowerFirst(cell.part.label)}: ${cell.countText} observadas`
                : `${groupLabel}, ${lowerFirst(cell.part.label)}: ${cell.countText} observadas, ${formatDecimal(cell.stat.expected, 1)} esperadas, ${cell.band === null ? 'amostra insuficiente' : `resíduo ${signed(cell.stat.residual, 1)}`}`;
            if (tile.h <= 0) {
              // Zero observado não some: linha de 1 px na posição da parte, com o ponto no vão entre grupos.
              return (
                <g key={cell.key}>
                  <title>{tip}</title>
                  <line stroke={NEUTRAL_STROKE} strokeWidth={1} x1={tile.x} x2={tile.x + tile.w} y1={tile.y} y2={tile.y} />
                  <circle cx={tile.x + tile.w + GROUP_GAP / 2} cy={tile.y} fill={NEUTRAL_STROKE} r={ZERO_DOT} />
                </g>
              );
            }
            const look = cell.band === null ? null : BAND_STYLE[cell.band];
            // Contorno por dentro da caixa: o traço não rouba área do vizinho nem fecha o vão.
            const inset = look === null ? 0.5 : look.strokeWidth / 2;
            const ink = look === null ? 'var(--text-primary)' : look.ink;
            const halo = look === null ? HATCH_HALO : undefined;
            const middle = tile.y + tile.h / 2;
            return (
              <g key={cell.key}>
                <title>{tip}</title>
                <rect
                  fill={look === null ? `url(#${hatchId})` : look.fill}
                  height={Math.max(tile.h - inset * 2, 0)}
                  stroke={look === null ? NEUTRAL_STROKE : (look.stroke ?? undefined)}
                  strokeWidth={look === null ? 1 : look.strokeWidth}
                  width={Math.max(tile.w - inset * 2, 0)}
                  x={tile.x + inset}
                  y={tile.y + inset}
                />
                {cell.mode === 'inline' ? (
                  <text dominantBaseline="central" fill={ink} fontSize={TILE_FONT} style={halo} x={tile.x + LABEL_PAD} y={middle}>
                    <tspan className="font-sans" fontWeight={500}>{`${cell.part.label} `}</tspan>
                    <tspan className="font-display" fontWeight={600}>{cell.countText}</tspan>
                  </text>
                ) : null}
                {cell.mode === 'stacked' ? (
                  <>
                    <text className="font-sans" dominantBaseline="central" fill={ink} fontSize={TILE_FONT} fontWeight={500} style={halo} x={tile.x + LABEL_PAD} y={middle - STACK_LINE / 2}>
                      {cell.part.label}
                    </text>
                    <text className="font-display" dominantBaseline="central" fill={ink} fontSize={TILE_FONT} fontWeight={600} style={halo} x={tile.x + LABEL_PAD} y={middle + STACK_LINE / 2}>
                      {cell.countText}
                    </text>
                  </>
                ) : null}
                {cell.showResidual ? (
                  <text className="font-display" dominantBaseline="central" fill={ink} fontSize={VALUE_FONT} textAnchor="end" x={tile.x + tile.w - LABEL_PAD} y={middle}>
                    {cell.residualText}
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
              <g key={column.group.id}>
                {column.nameLines.map((line, lineIndex) => (
                  <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={NAME_FONT} fontWeight={500} key={line} textAnchor="middle" x={cx} y={rowY(nameRows - (column.nameLines?.length ?? 1) + lineIndex)}>
                    {line}
                  </text>
                ))}
                <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={rowY(nameRows)}>
                  {column.sizeText}
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
              <g key={column.group.id}>
                <line stroke={NEUTRAL_STROKE} strokeWidth={1} x1={cx} x2={cx} y1={axisTop + 2} y2={tierY(tier)} />
                <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} textAnchor="end" x={cx - TIER_OFFSET} y={tierY(tier)}>
                  <tspan className="font-sans">{`${column.group.label}: `}</tspan>
                  <tspan className="font-display">{column.sizeText}</tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {flagged.length > 0 ? (
        <p className="mt-2 shrink-0 text-[0.6875rem] leading-4 text-text-muted">
          Resíduo fora de ±{formatInt(LIMIT_MILD)} sem número no ladrilho:{' '}
          {flagged.map((item, index) => (
            <span key={item.cell.key}>
              {index > 0 ? '; ' : ''}
              {item.cell.column.group.label}, {lowerFirst(item.cell.part.label)}{' '}
              <span className="kpi-number text-text-secondary">{signed(item.stat.residual, 1)}</span>
            </span>
          ))}
        </p>
      ) : null}
      {mutedGroups.length > 0 || emptyGroups.length > 0 ? (
        <p className="mt-2 shrink-0 text-[0.6875rem] leading-4 text-text-muted">
          Sem rótulo no desenho:{' '}
          {mutedGroups.map((group, groupIndex) => (
            <span key={group.column.group.id}>
              {groupIndex > 0 ? '; ' : ''}
              {group.column.group.label}:{' '}
              {group.items.map((cell, index) => (
                <span key={cell.key}>
                  {index > 0 ? ', ' : ''}
                  {lowerFirst(cell.part.label)} <span className="kpi-number text-text-secondary">{cell.countText}</span>
                  {cell.band === null ? ' (amostra insuficiente)' : ''}
                  {cell.residualText === '' ? null : (
                    <>
                      {' '}
                      (resíduo <span className="kpi-number text-text-secondary">{cell.residualText}</span>)
                    </>
                  )}
                </span>
              ))}
            </span>
          ))}
          {emptyGroups.map((group, index) => (
            <span key={group.id}>
              {mutedGroups.length > 0 || index > 0 ? '; ' : ''}
              {group.label}, sem oportunidades
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
