import { Filter } from 'lucide-react';

import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatMonthLong, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, period, type PlatformSpend } from './data';

/**
 * Bar mekko (variwide): a largura de cada coluna é o número de leads da plataforma, a altura é o
 * CPL numa escala linear que começa em zero, e a área (leads vezes CPL) é o investimento do mês.
 * A geometria sai de `barMekko()`, função pura; o SVG só desenha. Colunas por CPL decrescente, com
 * a de CPL mais alto em destaque e as demais em neutro (COR-1). Nome e leads ficam abaixo da
 * coluna e o CPL com o investimento ficam no topo dela, dentro quando cabe e acima quando não.
 */
export interface CplMekkoProps {
  /** Uma linha por plataforma, em qualquer ordem: o componente ordena por CPL decrescente. */
  readonly data?: readonly PlatformSpend[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas card (574 px de largura) menos a linha de leitura: o SVG sai em escala 1 (GEO-18). */
const VIEW_W = 574;
const VIEW_H = 201;
const Y_AXIS_W = 44;
const PLOT_TOP = 10;
const COLUMN_GAP = 2;
const MAX_INTERVALS = 4;
const NAME_FONT = 11;
const VALUE_FONT = 11;
const CPL_FONT = 12;
const LINE_H = 14;
const AXIS_GAP = 8;
const FOOT_GAP = 4;
const BOTTOM_PAD = 2;
/** Largura por caractere, em em. Superestima de propósito: sobrar espaço não quebra nada (GEO-8). */
const CHAR_EM = 0.58;
const LABEL_PAD = 4;
/** Altura da coluna para caber duas linhas de rótulo dentro dela (texto de 12 e de 11 px mais folga). */
const INSIDE_MIN_HEIGHT = 36;
const TICK_LEN = 4;
const HIGHLIGHT = 'var(--chart-1)';
const NEUTRAL = 'var(--line-strong)';
/** Texto sobre `--chart-1` e sobre `--line-strong`: os pares medidos (ROT-6). */
const ON_HIGHLIGHT = 'var(--accent-cyan-contrast)';
const ON_NEUTRAL = 'var(--text-primary)';
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

export default function CplMekko({ data = defaultData, height, className }: CplMekkoProps) {
  const style = height === undefined ? undefined : { height };
  const valid = data
    .flatMap((row) => {
      const cpl = ratio(row.spend, row.leads);
      return cpl === null ? [] : [{ row, cpl }];
    })
    .sort((a, b) => b.cpl - a.cpl);
  const scale = niceTicks(Math.max(0, ...valid.map((item) => item.cpl)));

  if (valid.length === 0 || scale === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma com lead neste recorte: não há CPL para calcular nem investimento para pesar.</span>
      </div>
    );
  }

  const plotW = VIEW_W - Y_AXIS_W;
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

  const leader = columns[0];
  const leaderShare = leader ? formatPercent(leader.row.spend / totalSpend, 0) : '';
  const monthLong = formatMonthLong(period);
  const summary = leader
    ? `Gráfico bar mekko de ${formatInt(columns.length)} plataformas de mídia paga em ${monthLong}, com leads na largura e CPL na altura. ${leader.row.label} tem o maior CPL, ${formatCurrencyCompact(leader.cpl)}, e concentra ${leaderShare} dos ${formatCurrencyCompact(totalSpend)} investidos.`
    : '';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {leader ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-4 text-text-secondary">
          <span className="font-semibold text-text-primary">{leader.row.label}</span> tem o maior CPL,{' '}
          <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(leader.cpl)}</span>, e concentra{' '}
          <span className="kpi-number font-medium text-text-primary">{leaderShare}</span> do investimento de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(totalSpend)}</span>
        </p>
      ) : null}
      <div className="min-h-0 w-full flex-1">
        <svg aria-hidden className="block h-full w-full" preserveAspectRatio="xMinYMin meet" viewBox={`0 0 ${String(VIEW_W)} ${String(VIEW_H)}`}>
          {scale.ticks.map((tick) => (
            <g key={tick}>
              {tick > 0 ? <line stroke="var(--line-subtle)" strokeWidth={1} x1={Y_AXIS_W} x2={VIEW_W} y1={tickY(tick)} y2={tickY(tick)} /> : null}
              <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="end" x={Y_AXIS_W - 6} y={tickY(tick)}>
                {formatCurrencyAxis(tick)}
              </text>
            </g>
          ))}
          {columns.map((column, index) => {
            const isLeader = index === 0;
            const cplText = formatCurrencyCompact(column.cpl);
            const spendText = formatCurrencyCompact(column.row.spend);
            const inside = column.h >= INSIDE_MIN_HEIGHT;
            const tint = isLeader ? ON_HIGHLIGHT : ON_NEUTRAL;
            const cx = column.x + column.w / 2;
            const lines = names[index] ?? [column.row.label];
            const share = formatPercent(column.row.spend / totalSpend, 0);
            return (
              <g key={column.row.id}>
                <title>{`${column.row.label}: ${formatInt(column.row.leads)} leads, CPL ${cplText}, investimento ${spendText}, ${share} do total`}</title>
                <rect fill={isLeader ? HIGHLIGHT : NEUTRAL} height={column.h} width={column.w} x={column.x} y={column.y} />
                <text className="font-display" dominantBaseline="central" fill={inside ? tint : 'var(--text-primary)'} fontSize={CPL_FONT} fontWeight={600} style={inside ? undefined : HALO} textAnchor="middle" x={cx} y={inside ? column.y + 12 : column.y - 24}>
                  {cplText}
                </text>
                <text className="font-display" dominantBaseline="central" fill={inside ? tint : 'var(--text-secondary)'} fontSize={VALUE_FONT} fontWeight={500} style={inside ? undefined : HALO} textAnchor="middle" x={cx} y={inside ? column.y + 26 : column.y - 9}>
                  {spendText}
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
          {/* Linha de base no zero e um tique por fronteira de coluna: o eixo X é o acumulado de leads. */}
          <line stroke="var(--line-strong)" strokeWidth={1} x1={Y_AXIS_W} x2={VIEW_W} y1={baseY} y2={baseY} />
          {columns.map((column) => (
            <line key={column.row.id} stroke="var(--line-strong)" strokeWidth={1} x1={column.x + column.w + COLUMN_GAP / 2} x2={column.x + column.w + COLUMN_GAP / 2} y1={baseY} y2={baseY + TICK_LEN} />
          ))}
          <text dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="start" x={Y_AXIS_W} y={rowY(nameRows + 1) + FOOT_GAP}>
            <tspan className="font-sans">largura leads, altura CPL, área investimento</tspan>
          </text>
          <text dominantBaseline="central" fontSize={VALUE_FONT} textAnchor="end" x={VIEW_W} y={rowY(nameRows + 1) + FOOT_GAP}>
            <tspan className="font-sans" fill="var(--text-muted)">Total do mês: </tspan>
            <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>{`${formatInt(totalLeads)} leads, ${formatCurrencyCompact(totalSpend)}`}</tspan>
          </text>
        </svg>
      </div>
    </div>
  );
}
