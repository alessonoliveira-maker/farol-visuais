import { Filter } from 'lucide-react';

import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PorteBand } from './data';

/**
 * Spineplot: a largura de cada coluna é o peso da faixa de porte nas oportunidades encerradas e a
 * altura da parte de baixo é a taxa de ganho dentro dela, com o ganho na base, que é a única
 * parte com linha de base comum entre colunas. A área de cada ladrilho é proporcional à contagem
 * da célula. O layout sai de `spine()`, função pura que devolve x, w e a altura de cada parte;
 * o SVG só desenha. A taxa vai escrita sobre cada coluna com o volume (DAD-1) e o desfecho é
 * nomeado à direita, no lugar de legenda. A faixa sem rótulo cabendo vai para a lista abaixo.
 */
export interface WinRateSpineProps {
  /** Uma linha por faixa de porte, já na ordem natural: o componente não reordena. */
  readonly data?: readonly PorteBand[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas 640x360 (574 x 225 com o caso de uso em duas linhas) menos a linha de leitura de 24 px. */
const VIEW_W = 574;
const VIEW_H = 201;
/** Margem à direita para o nome do desfecho ao lado da última coluna. */
const RIGHT_W = 64;
const LABEL_GAP = 8;
/** Vão de 1 px entre colunas e de 2 px entre as partes: é o próprio cartão que aparece. */
const COLUMN_GAP = 1;
const PART_GAP = 2;
const HEAD_H = 30;
const HEAD_LINE = 14;
const AXIS_GAP = 6;
const AXIS_LINE = 14;
const AXIS_PAD = 2;
/** Até duas linhas de nome mais a de participação: a altura do eixo não muda com o dado. */
const AXIS_ROWS = 3;
const NAME_FONT = 12;
const VALUE_FONT = 11;
const TILE_FONT = 11;
/** Largura por caractere, em em. Superestima de propósito: sobrar espaço não quebra nada (GEO-8). */
const CHAR_EM = 0.56;
const LABEL_MIN_WIDTH = 36;
const LABEL_MIN_HEIGHT = 18;
const WON_COLOR = 'var(--chart-1)';
const LOST_COLOR = 'var(--line-strong)';

interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface SpineColumn {
  readonly x: number;
  readonly w: number;
  readonly wonY: number;
  readonly wonH: number;
  readonly lostY: number;
  readonly lostH: number;
}

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
function winRate(bands: readonly PorteBand[]): number | null {
  const total = bands.reduce((sum, band) => sum + band.won + band.lost, 0);
  if (total <= 0) return null;
  return bands.reduce((sum, band) => sum + band.won, 0) / total;
}

/**
 * Layout puro do spineplot: largura pelo total de cada coluna, altura do ganho pela taxa. O vão
 * entre colunas sai antes da partilha de largura e o vão entre as partes sai antes da partilha de
 * altura, igual em toda coluna, mesmo quando uma parte vale zero (GEO-16).
 */
function spine(bands: readonly PorteBand[], box: Box): readonly SpineColumn[] {
  const grand = bands.reduce((sum, band) => sum + band.won + band.lost, 0);
  const usableW = box.width - COLUMN_GAP * (bands.length - 1);
  const usableH = box.height - PART_GAP;
  const columns: SpineColumn[] = [];
  let x = box.x;
  for (const band of bands) {
    const total = band.won + band.lost;
    const w = (usableW * total) / grand;
    const wonH = (usableH * band.won) / total;
    columns.push({ x, w, wonH, wonY: box.y + box.height - wonH, lostH: usableH - wonH, lostY: box.y });
    x += w + COLUMN_GAP;
  }
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

export default function WinRateSpine({ data = defaultData, height, className }: WinRateSpineProps) {
  const style = height === undefined ? undefined : { height };
  const bands = data.filter((band) => band.won + band.lost > 0);

  if (bands.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade encerrada neste recorte: não há faixa de porte para pesar nem taxa de ganho para calcular.</span>
      </div>
    );
  }

  const total = bands.reduce((sum, band) => sum + band.won + band.lost, 0);
  const overall = winRate(bands);
  const plot: Box = { x: 0, y: HEAD_H, width: VIEW_W - RIGHT_W, height: VIEW_H - HEAD_H - AXIS_GAP - AXIS_ROWS * AXIS_LINE - AXIS_PAD };
  const layout = spine(bands, plot);
  const shares = largestRemainder(bands.map((band) => band.won + band.lost));
  const columns = bands.map((band, index) => {
    const box = layout[index] ?? { x: 0, w: 0, wonY: 0, wonH: 0, lostY: 0, lostH: 0 };
    const count = band.won + band.lost;
    const rate = band.won / count;
    const lines = splitRate(band.won, count);
    const lostText = formatPercent(1 - rate);
    return {
      band,
      box,
      count,
      rate,
      lines,
      share: shares === null ? '' : formatPercent((shares[index] ?? 0) / 100, 0),
      nameLines: wrapLabel(band.label, box.w),
      fitsRate: Math.max(1, ...lines.map((line) => estimateWidth(line, VALUE_FONT))) <= box.w,
      lostText,
      lostLabeled: box.lostH >= LABEL_MIN_HEIGHT && box.w >= Math.max(LABEL_MIN_WIDTH, estimateWidth(lostText, TILE_FONT) + 8),
    };
  });
  const silent = columns.filter((column) => !column.fitsRate);
  const ranked = [...columns].sort((a, b) => a.rate - b.rate);
  const low = ranked[0];
  const high = ranked[ranked.length - 1];
  const last = columns[columns.length - 1];
  const reading = low && high ? { low, high } : null;
  const summary = [
    `Gráfico spineplot com ${formatInt(total)} oportunidades encerradas em ${formatInt(columns.length)} faixas de porte.`,
    reading && overall !== null
      ? `A taxa de ganho vai de ${formatPercent(reading.low.rate)} na faixa ${reading.low.band.label.toLowerCase()} a ${formatPercent(reading.high.rate)} na faixa ${reading.high.band.label.toLowerCase()}, contra ${formatPercent(overall)} no total.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');
  const axisY = (row: number): number => plot.y + plot.height + AXIS_GAP + AXIS_LINE * (row + 0.5);
  const headY = (line: number, lines: number): number => HEAD_H - 2 - HEAD_LINE * (lines - line) + HEAD_LINE / 2;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-4 text-text-secondary">
          Ganho vai de <span className="kpi-number font-medium text-text-primary">{formatPercent(reading.low.rate)}</span> em {reading.low.band.label.toLowerCase()} a{' '}
          <span className="kpi-number font-medium text-text-primary">{formatPercent(reading.high.rate)}</span> em {reading.high.band.label.toLowerCase()}; a largura pesa as {formatInt(total)} oportunidades
        </p>
      ) : null}
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="block h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {columns.map((column) => {
            const { box } = column;
            const cx = box.x + box.w / 2;
            return (
              <g key={column.band.id}>
                <title>{`${column.band.label}: ${formatRateWithVolume(column.band.won, column.count)} ganhas, ${formatInt(column.band.lost)} perdidas`}</title>
                {box.lostH > 0 ? <rect fill={LOST_COLOR} height={box.lostH} width={box.w} x={box.x} y={box.lostY} /> : null}
                {box.wonH > 0 ? <rect fill={WON_COLOR} height={box.wonH} width={box.w} x={box.x} y={box.wonY} /> : null}
                {column.lostLabeled ? (
                  <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={TILE_FONT} fontWeight={500} textAnchor="middle" x={cx} y={box.lostY + box.lostH / 2}>
                    {column.lostText}
                  </text>
                ) : null}
                {column.fitsRate
                  ? column.lines.map((line, lineIndex) => (
                      <text className="font-display" dominantBaseline="central" fill={lineIndex === 0 ? 'var(--text-primary)' : 'var(--text-secondary)'} fontSize={VALUE_FONT} fontWeight={lineIndex === 0 ? 600 : 500} key={line} textAnchor="middle" x={cx} y={headY(lineIndex, column.lines.length)}>
                        {line}
                      </text>
                    ))
                  : null}
                {(column.nameLines ?? [column.band.label]).map((line, lineIndex) => (
                  <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={NAME_FONT} fontWeight={500} key={line} textAnchor="middle" x={cx} y={axisY(lineIndex)}>
                    {line}
                  </text>
                ))}
                <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={axisY(column.nameLines?.length ?? 1)}>
                  {column.share}
                </text>
              </g>
            );
          })}
          {last ? (
            <g>
              <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={NAME_FONT} fontWeight={500} x={plot.width + LABEL_GAP} y={last.box.lostY + last.box.lostH / 2}>
                Perdido
              </text>
              <text className="font-sans" dominantBaseline="central" fill="var(--text-primary)" fontSize={NAME_FONT} fontWeight={600} x={plot.width + LABEL_GAP} y={last.box.wonY + last.box.wonH / 2}>
                Ganho
              </text>
            </g>
          ) : null}
        </svg>
      </div>
      {silent.length > 0 ? (
        <p className="mt-2 shrink-0 text-[0.6875rem] leading-4 text-text-muted">
          Sem rótulo no desenho:{' '}
          {silent.map((column, index) => (
            <span key={column.band.id}>
              {index > 0 ? '; ' : ''}
              {column.band.label.toLowerCase()} <span className="kpi-number text-text-secondary">{formatRateWithVolume(column.band.won, column.count)}</span>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
