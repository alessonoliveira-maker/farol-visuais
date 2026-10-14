import { Filter } from 'lucide-react';
import { useId } from 'react';

import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SizeBand } from './data';

/**
 * Spineplot com porte desconhecido e amostra pequena: a largura de cada coluna é o peso da faixa
 * nas oportunidades encerradas e a altura da parte de baixo é a taxa de ganho, com o ganho na
 * base. As faixas conhecidas seguem a ordem natural do porte; o porte desconhecido é uma coluna
 * larga, hachurada, à direita, e fica fora da taxa global. A faixa estreita demais para o próprio
 * rótulo vai para um rótulo escalonado com fio conector, e a de poucos casos leva o selo de
 * amostra pequena. O layout sai de `spine()`, função pura que devolve x, w e a altura das partes.
 */
export interface WinRateGapsProps {
  /** Faixas conhecidas na ordem natural; a coluna de porte desconhecido (`unknown`) vai por último. */
  readonly data?: readonly SizeBand[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas 640x440 (574 x 305) menos o subtítulo e a legenda em uma linha, de 24 px cada. */
const VIEW_W = 574;
const VIEW_H = 257;
/** Margem à direita para o rótulo da taxa global e o nome do desfecho. */
const RIGHT_W = 64;
const LABEL_GAP = 8;
const COLUMN_GAP = 1;
/** Vão maior antes da coluna de porte desconhecido: ela não pertence à ordem do porte. */
const UNKNOWN_GAP = 6;
const PART_GAP = 2;
const HEAD_H = 30;
const HEAD_LINE = 14;
const AXIS_GAP = 6;
const AXIS_LINE = 14;
const AXIS_PAD = 2;
/** Até duas linhas de nome mais a de participação: a altura do eixo não muda com o dado. */
const AXIS_ROWS = 3;
const TIER_GAP = 4;
const TIER_LINE = 16;
const TIER_OFFSET = 6;
const NAME_FONT = 12;
const VALUE_FONT = 11;
const TILE_FONT = 11;
const HATCH_STEP = 6;
/** Largura por caractere, em em. Superestima de propósito: sobrar espaço não quebra nada (GEO-8). */
const CHAR_EM = 0.56;
const LABEL_MIN_WIDTH = 36;
const LABEL_MIN_HEIGHT = 18;
/** Abaixo de 10 casos a taxa carrega o selo de amostra pequena. */
const SMALL_SAMPLE = 10;
const SEAL_PAD = 10;
const SEAL_HEIGHT = 16;
const WON_COLOR = 'var(--chart-1)';
const LOST_COLOR = 'var(--line-strong)';
/** Hachura, contorno e fio conector: `--line-strong` mede 1,8:1 e some como marca (TOK-5). */
const NEUTRAL_STROKE = 'var(--text-muted)';
/** Halo da ROT-7 no rótulo sobre a hachura: sem ele a diagonal corta o algarismo. */
const HATCH_HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface SpineColumn {
  readonly x: number;
  readonly w: number;
  readonly wonY: number;
  readonly wonH: number;
  readonly lostY: number;
  readonly lostH: number;
}

const countOf = (band: SizeBand): number => band.won + band.lost;

/** Percentuais inteiros que somam 100 pelo maior resto (NUM-2); `null` sem o que dividir (EST-1b). */
function largestRemainder(values: readonly number[]): readonly number[] | null {
  const sumAll = values.reduce((acc, value) => acc + value, 0);
  if (sumAll <= 0) return null;
  const raw = values.map((value) => (value / sumAll) * 100);
  const floors = raw.map((value) => Math.floor(value));
  let missing = 100 - floors.reduce((acc, value) => acc + value, 0);
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

/** Taxa de ganho de uma lista de faixas; `null` sem oportunidade encerrada (EST-1b). */
function winRate(bands: readonly SizeBand[]): number | null {
  const total = bands.reduce((sum, band) => sum + countOf(band), 0);
  if (total <= 0) return null;
  return bands.reduce((sum, band) => sum + band.won, 0) / total;
}

/**
 * Layout puro do spineplot: largura pelo total de cada coluna, altura do ganho pela taxa. Os vãos
 * (1 px entre as conhecidas, 6 px antes do porte desconhecido) saem antes da partilha de largura e
 * o vão entre as partes sai antes da partilha de altura, igual em toda coluna, mesmo quando o
 * ganho vale zero (GEO-16).
 */
function spine(bands: readonly SizeBand[], width: number, top: number, heightPx: number): readonly SpineColumn[] {
  const grand = bands.reduce((sum, band) => sum + countOf(band), 0);
  const gaps = bands.reduce((sum, band, index) => (index === 0 ? 0 : sum + (band.unknown ? UNKNOWN_GAP : COLUMN_GAP)), 0);
  const usableH = heightPx - PART_GAP;
  const columns: SpineColumn[] = [];
  let x = 0;
  bands.forEach((band, index) => {
    if (index > 0) x += band.unknown ? UNKNOWN_GAP : COLUMN_GAP;
    const w = ((width - gaps) * countOf(band)) / grand;
    const wonH = (usableH * band.won) / countOf(band);
    columns.push({ x, w, wonH, wonY: top + heightPx - wonH, lostH: usableH - wonH, lostY: top });
    x += w;
  });
  return columns;
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

export default function WinRateGaps({ data = defaultData, height, className }: WinRateGapsProps) {
  const hatchId = useId();
  const style = height === undefined ? undefined : { height };
  const bands = [...data.filter((band) => countOf(band) > 0 && band.unknown !== true), ...data.filter((band) => countOf(band) > 0 && band.unknown === true)];

  if (bands.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade encerrada neste recorte: não há faixa de porte para pesar nem taxa de ganho para calcular.</span>
      </div>
    );
  }

  const total = bands.reduce((sum, band) => sum + countOf(band), 0);
  const shares = largestRemainder(bands.map(countOf)) ?? [];
  const shareOf = (index: number): string => formatPercent((shares[index] ?? 0) / 100, 0);
  const known = bands.filter((band) => band.unknown !== true);
  const overall = winRate(known);
  const plotW = VIEW_W - RIGHT_W;
  const preview = spine(bands, plotW, 0, 1 + PART_GAP);
  const columns = bands.map((band, index) => {
    const w = preview[index]?.w ?? 0;
    const count = countOf(band);
    const lines = splitRate(band.won, count);
    const nameLines = wrapLabel(band.label, w);
    const fits = nameLines !== null && Math.max(1, ...lines.map((line) => estimateWidth(line, VALUE_FONT))) <= w;
    return { band, count, lines, nameLines, tiered: !fits };
  });
  const tierCount = columns.filter((column) => column.tiered).length;
  const tierBlock = Math.min(tierCount, 1) * TIER_GAP + tierCount * TIER_LINE;
  const plotH = VIEW_H - HEAD_H - AXIS_GAP - AXIS_ROWS * AXIS_LINE - tierBlock - AXIS_PAD;
  const plotBottom = HEAD_H + plotH;
  const layout = spine(bands, plotW, HEAD_H, plotH);
  const placed = columns.map((column, index) => {
    const box = layout[index] ?? { x: 0, w: 0, wonY: 0, wonH: 0, lostY: 0, lostH: 0 };
    // Complemento tirado da taxa já arredondada em décimos: ganho e perdido fecham 100,0 (NUM-2).
    const lostText = formatPercent((1000 - Math.round((column.band.won / column.count) * 1000)) / 1000);
    return {
      ...column,
      box,
      lostText,
      share: shareOf(index),
      lostLabeled: !column.tiered && box.lostH >= LABEL_MIN_HEIGHT && box.w >= Math.max(LABEL_MIN_WIDTH, estimateWidth(lostText, TILE_FONT) + 8),
    };
  });
  const tiered = placed.filter((column) => column.tiered);
  const axisY = (row: number): number => plotBottom + AXIS_GAP + AXIS_LINE * (row + 0.5);
  const tierY = (tier: number): number => plotBottom + AXIS_GAP + AXIS_LINE * AXIS_ROWS + TIER_GAP + TIER_LINE * (tier + 0.5);
  const headY = (line: number, count: number): number => HEAD_H - 2 - HEAD_LINE * (count - line) + HEAD_LINE / 2;
  const globalY = overall === null ? null : plotBottom - (plotH - PART_GAP) * overall;
  const coverage = formatPercent(bands.reduce((sum, band, index) => (band.unknown === true ? sum : sum + (shares[index] ?? 0)), 0) / 100, 0);
  const small = known.filter((band) => countOf(band) < SMALL_SAMPLE);
  const summary = [
    `Gráfico spineplot com ${formatInt(total)} oportunidades encerradas, ${coverage} delas com faixa de porte informada.`,
    overall !== null ? `A taxa de ganho com porte informado é de ${formatPercent(overall)}; faixas com menos de ${formatInt(SMALL_SAMPLE)} casos: ${formatInt(small.length)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-4 text-text-secondary">
        <span className="kpi-number font-medium text-text-primary">{coverage}</span> das oportunidades com faixa de porte informada
      </p>
      <ul className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        <li className="flex items-center gap-1.5 text-xs leading-4">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: WON_COLOR }} />
          <span className="text-text-secondary">Ganho</span>
        </li>
        <li className="flex items-center gap-1.5 text-xs leading-4">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px] border border-text-muted" style={{ backgroundColor: LOST_COLOR }} />
          <span className="text-text-secondary">Perdido</span>
        </li>
        <li className="flex items-center gap-1.5 text-xs leading-4">
          <svg aria-hidden className="block shrink-0" height={10} viewBox="0 0 10 10" width={10}>
            <path d="M0.5 0.5 H9.5 V9.5 H0.5 Z M0.5 6 L6 0.5 M4 9.5 L9.5 4" fill="none" stroke={NEUTRAL_STROKE} strokeWidth={1} />
          </svg>
          <span className="text-text-secondary">Porte desconhecido</span>
        </li>
        {overall === null ? null : (
          <li className="flex items-center gap-1.5 text-xs leading-4">
            <svg aria-hidden className="block shrink-0" height={10} viewBox="0 0 12 10" width={12}>
              <line stroke={NEUTRAL_STROKE} strokeDasharray="3 3" strokeWidth={1.5} x1={0} x2={12} y1={5} y2={5} />
            </svg>
            <span className="text-text-secondary">
              Taxa global <span className="kpi-number font-medium text-text-primary">{formatPercent(overall)}</span>, só com porte informado
            </span>
          </li>
        )}
      </ul>
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="block h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          <defs>
            {/* A diagonal é desenhada no próprio padrão, sem patternTransform: giro no preview desliga as guardas de texto. */}
            <pattern height={HATCH_STEP} id={hatchId} patternUnits="userSpaceOnUse" width={HATCH_STEP}>
              <path d={`M-1 1 L1 -1 M0 ${String(HATCH_STEP)} L${String(HATCH_STEP)} 0 M${String(HATCH_STEP - 1)} ${String(HATCH_STEP + 1)} L${String(HATCH_STEP + 1)} ${String(HATCH_STEP - 1)}`} stroke={NEUTRAL_STROKE} strokeWidth={1} />
            </pattern>
          </defs>
          {placed.map((column) => {
            const { box, band } = column;
            const cx = box.x + box.w / 2;
            const unknown = band.unknown === true;
            return (
              <g key={band.id}>
                <title>{`${band.label}: ${formatRateWithVolume(band.won, column.count)} ganhas, ${formatInt(band.lost)} perdidas`}</title>
                {unknown ? (
                  <>
                    {/* Contorno por dentro da caixa: o traço não rouba área do vizinho nem fecha o vão. */}
                    <rect fill={`url(#${hatchId})`} height={Math.max(box.lostH - 1, 0)} stroke={NEUTRAL_STROKE} strokeWidth={1} width={Math.max(box.w - 1, 0)} x={box.x + 0.5} y={box.lostY + 0.5} />
                    {box.wonH > 0 ? <rect fill={`url(#${hatchId})`} height={Math.max(box.wonH - 1, 0)} stroke={NEUTRAL_STROKE} strokeWidth={1} width={Math.max(box.w - 1, 0)} x={box.x + 0.5} y={box.wonY + 0.5} /> : null}
                  </>
                ) : (
                  <>
                    <rect fill={LOST_COLOR} height={box.lostH} width={box.w} x={box.x} y={box.lostY} />
                    {box.wonH > 0 ? <rect fill={WON_COLOR} height={box.wonH} width={box.w} x={box.x} y={box.wonY} /> : null}
                    {/* Zero medido não é ausência: um fio de 2 px de ciano na base, no vão que a parte de ganho deixaria (EST-3). */}
                    {band.won === 0 ? <rect fill={WON_COLOR} height={PART_GAP} width={box.w} x={box.x} y={plotBottom - PART_GAP} /> : null}
                  </>
                )}
                {column.lostLabeled ? (
                  <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={TILE_FONT} fontWeight={500} style={unknown ? HATCH_HALO : undefined} textAnchor="middle" x={cx} y={box.lostY + box.lostH / 2}>
                    {column.lostText}
                  </text>
                ) : null}
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
                {column.tiered ? null : (
                  <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={axisY(column.nameLines?.length ?? 1)}>
                    {column.share}
                  </text>
                )}
              </g>
            );
          })}
          {tiered.map((column, tier) => {
            const { box, band } = column;
            const cx = box.x + box.w / 2;
            const name = `${band.label}, ${column.share} do total: `;
            const value = formatRateWithVolume(band.won, column.count);
            const sealed = column.count < SMALL_SAMPLE;
            const seal = 'amostra pequena';
            const textWidth = estimateWidth(name + value, VALUE_FONT);
            const sealWidth = estimateWidth(seal, VALUE_FONT) + SEAL_PAD;
            const toLeft = cx - TIER_OFFSET - textWidth >= 0;
            const textX = toLeft ? cx - TIER_OFFSET : cx + TIER_OFFSET;
            // O selo cola no fio conector, do lado oposto ao texto: a largura estimada do texto superestima e abriria um vão entre os dois.
            const sealX = toLeft ? cx + TIER_OFFSET : cx - TIER_OFFSET - sealWidth;
            return (
              <g key={`${band.id}-tier`}>
                <line stroke={NEUTRAL_STROKE} strokeWidth={1} x1={cx} x2={cx} y1={plotBottom + 2} y2={tierY(tier)} />
                <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} textAnchor={toLeft ? 'end' : 'start'} x={textX} y={tierY(tier)}>
                  <tspan className="font-sans">{name}</tspan>
                  <tspan className="font-display" fill="var(--text-primary)">{value}</tspan>
                </text>
                {sealed ? (
                  <g>
                    <rect fill="none" height={SEAL_HEIGHT} rx={3} stroke={NEUTRAL_STROKE} strokeWidth={1} width={sealWidth} x={sealX} y={tierY(tier) - SEAL_HEIGHT / 2} />
                    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} fontWeight={600} textAnchor="middle" x={sealX + sealWidth / 2} y={tierY(tier)}>
                      {seal}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
          {globalY !== null && overall !== null ? (
            <g>
              {/* O fio de --surface-raised por baixo separa o tracejado do ciano e do cinza que ele atravessa (TOK-10). */}
              <line stroke="var(--surface-raised)" strokeWidth={4} x1={0} x2={plotW} y1={globalY} y2={globalY} />
              <line stroke={NEUTRAL_STROKE} strokeDasharray="3 3" strokeWidth={1.5} x1={0} x2={plotW} y1={globalY} y2={globalY} />
              <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} x={plotW + LABEL_GAP} y={globalY - 7}>
                global
              </text>
              <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={VALUE_FONT} fontWeight={600} x={plotW + LABEL_GAP} y={globalY + 7}>
                {formatPercent(overall)}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}
