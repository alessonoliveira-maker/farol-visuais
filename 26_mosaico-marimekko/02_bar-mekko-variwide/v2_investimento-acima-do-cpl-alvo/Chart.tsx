import { Filter } from 'lucide-react';

import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatMonthLong, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, period, target as defaultTarget, type PlatformSpend } from './data';

/**
 * Bar mekko (variwide) contra uma meta: largura é o número de leads, altura é o CPL linear a
 * partir do zero e a área é o investimento. A parte de cada coluna acima do CPL alvo vai em
 * `--chart-1` e a parte até o alvo em `--line-strong`; a área da parte acima, leads vezes o
 * excedente de CPL, é o investimento pago acima do alvo. A geometria sai de `barMekko()`, função
 * pura. A linha do alvo só é desenhada fora das colunas (TOK-10): dentro delas, a fronteira entre
 * as duas cores já é o alvo, e a linha cruzando a marca não teria token que contrastasse com
 * o cartão e com a coluna ao mesmo tempo.
 */
export interface TargetMekkoProps {
  /** Uma linha por plataforma, em qualquer ordem: o componente ordena por CPL decrescente. */
  readonly data?: readonly PlatformSpend[];
  /** CPL alvo em reais por lead. */
  readonly target?: number;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas card (574 px de largura) menos a linha de leitura: o SVG sai em escala 1 (GEO-18). */
const VIEW_W = 574;
const VIEW_H = 201;
const Y_AXIS_W = 44;
/** Margem à direita para o rótulo do alvo, fora das colunas (ANO-3). */
const TARGET_LABEL_W = 56;
const PLOT_TOP = 10;
const COLUMN_GAP = 2;
const MAX_INTERVALS = 4;
const NAME_FONT = 11;
const VALUE_FONT = 11;
const CPL_FONT = 12;
const TARGET_STROKE = 'var(--text-muted)';
const LINE_H = 14;
const AXIS_GAP = 8;
const FOOT_GAP = 4;
const BOTTOM_PAD = 2;
/** Largura por caractere, em em. Superestima de propósito: sobrar espaço não quebra nada (GEO-8). */
const CHAR_EM = 0.58;
const LABEL_PAD = 4;
/** Altura mínima da parte acima do alvo para escrever o excedente dentro dela, em duas linhas de 11 px. */
const NOTE_MIN_HEIGHT = 30;
/** Distância do topo da coluna à linha do alvo abaixo da qual o rótulo do CPL sobe para cima da linha. */
const NEAR_LINE = 18;
const TICK_LEN = 4;
const HIGHLIGHT = 'var(--chart-1)';
const NEUTRAL = 'var(--line-strong)';
/** Texto sobre `--chart-1`: o par medido (ROT-6). */
const ON_HIGHLIGHT = 'var(--accent-cyan-contrast)';
/** Halo da ROT-7 no rótulo acima da coluna, onde a linha de grade o atravessa. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface Column {
  readonly row: PlatformSpend;
  readonly cpl: number;
  readonly x: number;
  readonly w: number;
  readonly y: number;
  readonly h: number;
  readonly cumulative: number;
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Razão ou `null` sem denominador (EST-1b): nunca zero. */
function ratio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

function estimateWidth(text: string, fontPx: number): number {
  return text.length * fontPx * CHAR_EM;
}

/** Tiques de passo bonito (1, 2, 2,5 ou 5 vezes potência de 10), do zero até a primeira linha acima do maior valor. */
function niceTicks(maxValue: number): { readonly ticks: readonly number[]; readonly top: number } | null {
  if (maxValue <= 0) return null;
  const base = Math.floor(Math.log10(maxValue));
  for (let exponent = base - 1; exponent <= base + 1; exponent += 1) {
    for (const mult of [1, 2, 2.5, 5]) {
      const step = mult * 10 ** exponent;
      const count = Math.ceil(maxValue / step - 1e-9);
      if (count >= 2 && count <= MAX_INTERVALS) {
        return { ticks: Array.from({ length: count + 1 }, (_, index) => index * step), top: count * step };
      }
    }
  }
  return null;
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

/**
 * Layout puro do bar mekko: x acumulado pela largura (leads), altura linear a partir do zero.
 * Os vãos saem ANTES da partilha de largura (GEO-16), então largura vezes altura continua
 * exatamente proporcional ao investimento. Toda linha chega com leads positivos.
 */
function barMekko(rows: readonly { readonly row: PlatformSpend; readonly cpl: number }[], plotW: number, plotH: number, top: number): readonly Column[] {
  const usable = plotW - COLUMN_GAP * (rows.length - 1);
  const totalLeads = sum(rows.map((item) => item.row.leads));
  const scale = plotH / top;
  let x = Y_AXIS_W;
  let cumulative = 0;
  return rows.map(({ row, cpl }) => {
    const w = (usable * row.leads) / totalLeads;
    cumulative += row.leads;
    const h = cpl * scale;
    const column = { row, cpl, x, w, y: PLOT_TOP + plotH - h, h, cumulative };
    x += w + COLUMN_GAP;
    return column;
  });
}

export default function TargetMekko({ data = defaultData, target = defaultTarget, height, className }: TargetMekkoProps) {
  const style = height === undefined ? undefined : { height };
  const valid = data
    .flatMap((row) => {
      const cpl = ratio(row.spend, row.leads);
      return cpl === null ? [] : [{ row, cpl }];
    })
    .sort((a, b) => b.cpl - a.cpl);
  const scale = niceTicks(Math.max(target, ...valid.map((item) => item.cpl)));

  if (valid.length === 0 || scale === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma com lead neste recorte: não há CPL para comparar com o alvo nem investimento para pesar.</span>
      </div>
    );
  }

  const plotW = VIEW_W - Y_AXIS_W - TARGET_LABEL_W;
  const plotRight = Y_AXIS_W + plotW;
  const totalLeads = sum(valid.map((item) => item.row.leads));
  const totalSpend = sum(valid.map((item) => item.row.spend));
  const widths = valid.map((item) => ((plotW - COLUMN_GAP * (valid.length - 1)) * item.row.leads) / totalLeads);
  const names = valid.map((item, index) => wrapLabel(item.row.label, (widths[index] ?? 0) - LABEL_PAD) ?? [item.row.label]);
  const nameRows = names.reduce((most, lines) => Math.max(most, lines.length), 1);
  const plotH = VIEW_H - PLOT_TOP - AXIS_GAP - LINE_H * (nameRows + 2) - FOOT_GAP - BOTTOM_PAD;
  const columns = barMekko(valid, plotW, plotH, scale.top);
  const baseY = PLOT_TOP + plotH;
  const rowY = (row: number): number => baseY + AXIS_GAP + LINE_H * (row + 0.5);
  const tickY = (value: number): number => baseY - (value / scale.top) * plotH;
  const targetY = tickY(target);

  // Investimento pago além de leads vezes o alvo: é a área da parte acima do alvo (nunca negativo).
  const excessOf = (column: Column): number => Math.max(0, column.row.spend - target * column.row.leads);
  const totalExcess = sum(columns.map(excessOf));
  const topColumn = columns.reduce<Column | null>((best, column) => (excessOf(column) > (best ? excessOf(best) : 0) ? column : best), null);
  const firstBelow = columns.find((column) => column.cpl <= target);
  const lineStart = firstBelow ? firstBelow.x : plotRight;
  const targetText = formatCurrencyCompact(target);
  const excessText = formatCurrencyCompact(totalExcess);
  const spendText = formatCurrencyCompact(totalSpend);
  const excessShare = formatPercent(totalExcess / totalSpend, 0);
  const monthLong = formatMonthLong(period);
  const summary = `Gráfico bar mekko de ${formatInt(columns.length)} plataformas de mídia paga em ${monthLong}, com leads na largura e CPL na altura. ${excessText} dos ${spendText} investidos foram pagos acima do CPL alvo de ${targetText}${topColumn ? `, sobretudo em ${topColumn.row.label.toLowerCase()}` : ''}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-4 text-text-secondary">
        <span className="kpi-number font-semibold text-text-primary">{excessText}</span> dos{' '}
        <span className="kpi-number font-medium text-text-primary">{spendText}</span> investidos, ou{' '}
        <span className="kpi-number font-medium text-text-primary">{excessShare}</span>, foram pagos acima do CPL alvo de{' '}
        <span className="kpi-number font-medium text-text-primary">{targetText}</span>
      </p>
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="block h-full w-full" preserveAspectRatio="xMinYMin meet" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {scale.ticks.map((tick) => (
            <g key={tick}>
              {tick > 0 ? <line stroke="var(--line-subtle)" strokeWidth={1} x1={Y_AXIS_W} x2={plotRight} y1={tickY(tick)} y2={tickY(tick)} /> : null}
              <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="end" x={Y_AXIS_W - 6} y={tickY(tick)}>
                {formatCurrencyAxis(tick)}
              </text>
            </g>
          ))}
          {columns.map((column, index) => {
            const cplText = formatCurrencyCompact(column.cpl);
            const excess = excessOf(column);
            const aboveH = Math.max(0, column.cpl - target) * (plotH / scale.top);
            const cx = column.x + column.w / 2;
            const lines = names[index] ?? [column.row.label];
            const noteValue = formatCurrencyCompact(excess);
            const noted = column === topColumn && aboveH >= NOTE_MIN_HEIGHT && estimateWidth('acima do alvo', VALUE_FONT) <= column.w - 8;
            // O CPL de quem fica rente abaixo do alvo sobe para cima da linha, para ela não cortar o texto.
            const nearLine = column.cpl <= target && column.y - targetY < NEAR_LINE;
            return (
              <g key={column.row.id}>
                <title>{`${column.row.label}: ${formatInt(column.row.leads)} leads, CPL ${cplText}, investimento ${formatCurrencyCompact(column.row.spend)}, ${excess > 0 ? `${formatCurrencyCompact(excess)} acima do alvo` : 'dentro do alvo'}`}</title>
                <rect fill={NEUTRAL} height={column.h - aboveH} width={column.w} x={column.x} y={column.y + aboveH} />
                {aboveH > 0 ? <rect fill={HIGHLIGHT} height={aboveH} width={column.w} x={column.x} y={column.y} /> : null}
                {noted ? (
                  <>
                    <text className="font-display" dominantBaseline="central" fill={ON_HIGHLIGHT} fontSize={VALUE_FONT} fontWeight={600} textAnchor="middle" x={cx} y={column.y + aboveH / 2 - 7}>
                      {noteValue}
                    </text>
                    <text className="font-sans" dominantBaseline="central" fill={ON_HIGHLIGHT} fontSize={VALUE_FONT} fontWeight={500} textAnchor="middle" x={cx} y={column.y + aboveH / 2 + 7}>
                      acima do alvo
                    </text>
                  </>
                ) : null}
                <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={CPL_FONT} fontWeight={600} style={HALO} textAnchor="middle" x={cx} y={(nearLine ? targetY : column.y) - 9}>
                  {cplText}
                </text>
                {lines.map((line, lineIndex) => (
                  <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={NAME_FONT} fontWeight={500} key={line} textAnchor="middle" x={cx} y={rowY(nameRows - lines.length + lineIndex)}>
                    {line}
                  </text>
                ))}
                <text dominantBaseline="central" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={rowY(nameRows)}>
                  <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>{`${formatInt(column.row.leads)} `}</tspan>
                  <tspan className="font-sans" fill="var(--text-muted)">leads</tspan>
                </text>
              </g>
            );
          })}
          {/* A linha do alvo só existe fora das colunas (TOK-10): dentro delas, a troca de cor já é o alvo. */}
          <line stroke={TARGET_STROKE} strokeWidth={1.5} x1={lineStart} x2={plotRight + 4} y1={targetY} y2={targetY} />
          <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} textAnchor="start" x={plotRight + 8} y={targetY - 7}>
            <tspan className="font-sans">alvo</tspan>
          </text>
          <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={VALUE_FONT} fontWeight={600} textAnchor="start" x={plotRight + 8} y={targetY + 7}>
            {targetText}
          </text>
          <line stroke="var(--line-strong)" strokeWidth={1} x1={Y_AXIS_W} x2={plotRight} y1={baseY} y2={baseY} />
          {columns.map((column) => (
            <line key={column.row.id} stroke="var(--line-strong)" strokeWidth={1} x1={column.x + column.w + COLUMN_GAP / 2} x2={column.x + column.w + COLUMN_GAP / 2} y1={baseY} y2={baseY + TICK_LEN} />
          ))}
          <text dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="start" x={Y_AXIS_W} y={rowY(nameRows + 1) + FOOT_GAP}>
            <tspan className="font-sans">largura leads, altura CPL, área investimento</tspan>
          </text>
          <text dominantBaseline="central" fontSize={VALUE_FONT} textAnchor="end" x={VIEW_W} y={rowY(nameRows + 1) + FOOT_GAP}>
            <tspan className="font-sans" fill="var(--text-muted)">Total do mês: </tspan>
            <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>{`${formatInt(totalLeads)} leads, ${spendText}`}</tspan>
          </text>
        </svg>
      </div>
    </div>
  );
}
