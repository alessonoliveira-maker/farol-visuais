import { Filter } from 'lucide-react';

import { formatDecimal, formatHours, formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, slaHours as defaultSlaHours, type ContactBand } from './data';

/**
 * Spinograma: o x contínuo (horas até o primeiro contato) é cortado em faixas de limites
 * declarados; a largura de cada coluna é o peso da faixa nos leads contatados e a altura da parte
 * de baixo é a taxa de qualificação dentro dela, com os qualificados na base, que é a única parte
 * com linha de base comum entre colunas. O layout sai de `spine()`, função pura. A faixa dentro do
 * SLA ganha fundo de poço e rótulo, a taxa global atravessa o gráfico em tracejado e a última
 * faixa leva a distância até ela em pontos percentuais.
 */
export interface QualificationSpineProps {
  /** Uma linha por faixa de horas, na ordem do tempo: o componente não reordena. */
  readonly data?: readonly ContactBand[];
  /** Prazo de primeiro contato do painel, em horas: as faixas que terminam nele ficam dentro do SLA. */
  readonly slaHours?: number;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas 640x400 (574 x 265) menos a linha de leitura e a legenda, de 24 px cada. */
const VIEW_W = 574;
const VIEW_H = 217;
/** Margem à direita para o rótulo da taxa global e a anotação da última faixa. */
const RIGHT_W = 88;
const NOTE_GAP = 8;
/** Vão de 1 px entre colunas e de 2 px entre as partes: é o próprio cartão que aparece. */
const COLUMN_GAP = 1;
const PART_GAP = 2;
const HEAD_H = 30;
const HEAD_LINE = 14;
const AXIS_GAP = 6;
const AXIS_LINE = 14;
const AXIS_PAD = 2;
/** Até duas linhas de nome, a de participação e a do SLA: a altura do eixo não muda com o dado. */
const AXIS_ROWS = 4;
const NAME_FONT = 12;
const VALUE_FONT = 11;
const TILE_FONT = 11;
/** Largura por caractere, em em. Superestima de propósito: sobrar espaço não quebra nada (GEO-8). */
const CHAR_EM = 0.56;
const LABEL_MIN_WIDTH = 36;
const LABEL_MIN_HEIGHT = 18;
const QUALIFIED_COLOR = 'var(--chart-1)';
const OTHER_COLOR = 'var(--line-strong)';
const SLA_FILL = 'var(--surface-sunken)';

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

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function countOf(band: ContactBand): number {
  return band.qualified + band.notQualified;
}

/** Taxa de qualificação de uma lista de faixas; `null` sem lead contatado (EST-1b). */
function qualificationRate(bands: readonly ContactBand[]): number | null {
  const total = sum(bands.map(countOf));
  if (total <= 0) return null;
  return sum(bands.map((band) => band.qualified)) / total;
}

/** Limites escritos no eixo: `até 1 h`, `1 a 4 h`, `acima de 24 h`. */
function bandLabel(band: ContactBand): string {
  if (band.to === null) return `acima de ${formatHours(band.from)}`;
  if (band.from <= 0) return `até ${formatHours(band.to)}`;
  return `${formatInt(band.from)} a ${formatHours(band.to)}`;
}

/**
 * Layout puro do spinograma: largura pelo total de cada coluna, altura dos qualificados pela taxa.
 * O vão entre colunas sai antes da partilha de largura e o vão entre as partes sai antes da
 * partilha de altura, igual em toda coluna, mesmo quando uma parte vale zero (GEO-16).
 */
function spine(bands: readonly ContactBand[], box: Box): readonly SpineColumn[] {
  const grand = sum(bands.map(countOf));
  const usableW = box.width - COLUMN_GAP * (bands.length - 1);
  const usableH = box.height - PART_GAP;
  const columns: SpineColumn[] = [];
  let x = box.x;
  for (const band of bands) {
    const w = (usableW * countOf(band)) / grand;
    const wonH = (usableH * band.qualified) / countOf(band);
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

export default function QualificationSpine({ data = defaultData, slaHours = defaultSlaHours, height, className }: QualificationSpineProps) {
  const style = height === undefined ? undefined : { height };
  const bands = data.filter((band) => countOf(band) > 0);

  if (bands.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead contatado neste recorte: não há faixa de tempo para pesar nem taxa de qualificação para calcular.</span>
      </div>
    );
  }

  const total = sum(bands.map(countOf));
  const overall = qualificationRate(bands);
  const plot: Box = { x: 0, y: HEAD_H, width: VIEW_W - RIGHT_W, height: VIEW_H - HEAD_H - AXIS_GAP - AXIS_ROWS * AXIS_LINE - AXIS_PAD };
  const layout = spine(bands, plot);
  const shares = largestRemainder(bands.map((band) => countOf(band)));
  const columns = bands.map((band, index) => {
    const box = layout[index] ?? { x: 0, w: 0, wonY: 0, wonH: 0, lostY: 0, lostH: 0 };
    const count = countOf(band);
    const lines = splitRate(band.qualified, count);
    const lostText = formatPercent(band.notQualified / count);
    return {
      band,
      box,
      count,
      rate: band.qualified / count,
      lines,
      label: bandLabel(band),
      inSla: band.to !== null && band.to <= slaHours,
      share: shares === null ? '' : formatPercent((shares[index] ?? 0) / 100, 0),
      nameLines: wrapLabel(bandLabel(band), box.w),
      fitsRate: Math.max(1, ...lines.map((line) => estimateWidth(line, VALUE_FONT))) <= box.w,
      lostText,
      lostLabeled: box.lostH >= LABEL_MIN_HEIGHT && box.w >= Math.max(LABEL_MIN_WIDTH, estimateWidth(lostText, TILE_FONT) + 8),
    };
  });
  const silent = columns.filter((column) => !column.fitsRate);
  const slaColumns = columns.filter((column) => column.inSla);
  const slaFirst = slaColumns[0];
  const slaLast = slaColumns[slaColumns.length - 1];
  const first = columns[0];
  const last = columns[columns.length - 1];
  const plotBottom = plot.y + plot.height;
  const axisY = (row: number): number => plotBottom + AXIS_GAP + AXIS_LINE * (row + 0.5);
  const headY = (line: number, lines: number): number => HEAD_H - 2 - HEAD_LINE * (lines - line) + HEAD_LINE / 2;
  const globalY = overall === null ? null : plotBottom - (plot.height - PART_GAP) * overall;
  const deltaPoints = last && overall !== null ? (last.rate - overall) * 100 : null;
  const deltaText = deltaPoints === null ? '' : `${deltaPoints < 0 ? '−' : '+'}${formatDecimal(Math.abs(deltaPoints), 1)} p.p.`;
  const lowerY = last && globalY !== null ? Math.max(globalY, last.box.wonY) : plotBottom;
  const summary = [
    `Gráfico spinograma com ${formatInt(total)} leads contatados em ${formatInt(columns.length)} faixas de tempo até o primeiro contato.`,
    first && last && overall !== null
      ? `Qualificam ${formatPercent(first.rate)} ${first.label} e ${formatPercent(last.rate)} ${last.label}, contra ${formatPercent(overall)} no total.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {first && last ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-4 text-text-secondary">
          Leads contatados {first.label} qualificam <span className="kpi-number font-medium text-text-primary">{formatPercent(first.rate)}</span>; {last.label},{' '}
          <span className="kpi-number font-medium text-text-primary">{formatPercent(last.rate)}</span>
        </p>
      ) : null}
      <ul className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        <li className="flex items-center gap-1.5 text-xs leading-4">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: QUALIFIED_COLOR }} />
          <span className="text-text-secondary">Qualificado</span>
          <span className="kpi-number font-medium text-text-primary">{overall === null ? '' : formatPercent(overall)}</span>
        </li>
        <li className="flex items-center gap-1.5 text-xs leading-4">
          <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: OTHER_COLOR }} />
          <span className="text-text-secondary">Não qualificado</span>
          <span className="kpi-number font-medium text-text-primary">{overall === null ? '' : formatPercent(1 - overall)}</span>
        </li>
        <li className="ml-auto text-xs leading-4 text-text-muted">
          de <span className="kpi-number text-text-secondary">{formatInt(total)}</span> leads
        </li>
      </ul>
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="block h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {slaFirst && slaLast ? <rect fill={SLA_FILL} height={VIEW_H} width={slaLast.box.x + slaLast.box.w - slaFirst.box.x + COLUMN_GAP} x={slaFirst.box.x} y={0} /> : null}
          {columns.map((column) => {
            const { box } = column;
            const cx = box.x + box.w / 2;
            return (
              <g key={column.band.id}>
                <title>{`Contato ${column.label}: ${formatRateWithVolume(column.band.qualified, column.count)} qualificados, ${formatInt(column.band.notQualified)} não qualificados`}</title>
                {box.lostH > 0 ? <rect fill={OTHER_COLOR} height={box.lostH} width={box.w} x={box.x} y={box.lostY} /> : null}
                {box.wonH > 0 ? <rect fill={QUALIFIED_COLOR} height={box.wonH} width={box.w} x={box.x} y={box.wonY} /> : null}
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
                {(column.nameLines ?? [column.label]).map((line, lineIndex) => (
                  <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={NAME_FONT} fontWeight={500} key={line} textAnchor="middle" x={cx} y={axisY(lineIndex)}>
                    {line}
                  </text>
                ))}
                <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={axisY(column.nameLines?.length ?? 1)}>
                  {column.share}
                </text>
                {column.inSla ? (
                  <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} fontWeight={600} textAnchor="middle" x={cx} y={axisY((column.nameLines?.length ?? 1) + 1)}>
                    dentro do SLA
                  </text>
                ) : null}
              </g>
            );
          })}
          {globalY !== null && overall !== null ? (
            <g>
              {/* O fio de --surface-raised por baixo separa o tracejado do ciano e do cinza que ele atravessa (TOK-10). */}
              <line stroke="var(--surface-raised)" strokeWidth={4} x1={0} x2={plot.width} y1={globalY} y2={globalY} />
              <line stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1.5} x1={0} x2={plot.width} y1={globalY} y2={globalY} />
              <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} x={plot.width + NOTE_GAP} y={globalY - 22}>
                taxa global
              </text>
              <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={VALUE_FONT} fontWeight={600} x={plot.width + NOTE_GAP} y={globalY - 8}>
                {formatPercent(overall)}
              </text>
            </g>
          ) : null}
          {last && globalY !== null && deltaPoints !== null ? (
            <g>
              <line stroke="var(--text-muted)" strokeWidth={1} x1={plot.width + 3} x2={plot.width + 3} y1={globalY} y2={last.box.wonY} />
              <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={NAME_FONT} fontWeight={600} x={plot.width + NOTE_GAP} y={lowerY + 10}>
                {deltaText}
              </text>
              <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} x={plot.width + NOTE_GAP} y={lowerY + 24}>
                da taxa global
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
              {column.label} <span className="kpi-number text-text-secondary">{formatRateWithVolume(column.band.qualified, column.count)}</span>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
