import { Filter } from 'lucide-react';

import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, period, type OriginRevenue } from './data';

/**
 * Bar mekko (variwide): a largura de cada coluna é o número de vitórias da origem, a altura é o
 * ticket médio numa escala linear a partir do zero e a área (vitórias vezes ticket) é a receita.
 * A geometria sai de `barMekko()`, função pura; o SVG só desenha. Colunas por ticket decrescente,
 * a mais alta em `--chart-1` e as demais em neutro (COR-1). A coluna larga leva a receita dentro
 * e o nome embaixo; a coluna fina demais para o próprio texto é puxada para cima, com linha guia
 * e o nome junto, sem que dois rótulos se sobreponham. A linha do ticket médio geral só passa por
 * fora das colunas mais altas que ela (TOK-10).
 */
export interface TicketMekkoProps {
  /** Uma linha por origem, em qualquer ordem: o componente ordena por ticket decrescente. */
  readonly data?: readonly OriginRevenue[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas largo (894 px de largura) menos a linha de leitura: o SVG sai em escala 1 (GEO-18). */
const VIEW_W = 894;
const VIEW_H = 257;
const Y_AXIS_W = 62;
/** Margem à direita para o rótulo do ticket médio, fora das colunas (ANO-3). */
const AVG_LABEL_W = 84;
/** Espaço acima da plotagem para o rótulo puxado da coluna mais alta. */
const PLOT_TOP = 34;
const COLUMN_GAP = 2;
const MAX_INTERVALS = 5;
const NAME_FONT = 11;
const VALUE_FONT = 11;
const REVENUE_FONT = 12;
const LINE_H = 14;
const AXIS_GAP = 8;
const FOOT_GAP = 4;
const BOTTOM_PAD = 2;
/** Largura por caractere, em em. Superestima de propósito: sobrar espaço não quebra nada (GEO-8). */
const CHAR_EM = 0.58;
const LABEL_PAD = 4;
/** Respiro entre dois rótulos puxados que se sobrepõem na horizontal (ROT-9). */
const CALLOUT_GAP = 4;
const CALLOUT_LINE = 14;
const CALLOUT_RISE = 8;
const TICK_LEN = 4;
const HIGHLIGHT = 'var(--chart-1)';
const NEUTRAL = 'var(--line-strong)';
/** Texto sobre `--chart-1` e sobre `--line-strong`: os pares medidos (ROT-6). */
const ON_HIGHLIGHT = 'var(--accent-cyan-contrast)';
const ON_NEUTRAL = 'var(--text-primary)';
const GUIDE_STROKE = 'var(--text-muted)';
/** Uma coluna é "de poucas vitórias" quando pesa menos que isso na largura; só ela leva a anotação. */
const FEW_WINS_SHARE = 0.05;

interface Column {
  readonly row: OriginRevenue;
  readonly ticket: number;
  readonly x: number;
  readonly w: number;
  readonly y: number;
  readonly h: number;
}

interface Callout {
  readonly column: Column;
  readonly lines: readonly { readonly text: string; readonly value: boolean }[];
  readonly x: number;
  /** Centro da primeira linha do rótulo. */
  readonly y: number;
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
 * Layout puro do bar mekko: x acumulado pela largura (vitórias), altura linear a partir do zero.
 * Os vãos saem ANTES da partilha de largura (GEO-16), então largura vezes altura continua
 * exatamente proporcional à receita. Toda linha chega com vitórias positivas.
 */
function barMekko(rows: readonly { readonly row: OriginRevenue; readonly ticket: number }[], plotW: number, plotH: number, top: number): readonly Column[] {
  const usable = plotW - COLUMN_GAP * (rows.length - 1);
  const totalWins = sum(rows.map((item) => item.row.wins));
  const scale = plotH / top;
  let x = Y_AXIS_W;
  return rows.map(({ row, ticket }) => {
    const w = (usable * row.wins) / totalWins;
    const h = ticket * scale;
    const column = { row, ticket, x, w, y: PLOT_TOP + plotH - h, h };
    x += w + COLUMN_GAP;
    return column;
  });
}

/**
 * Rótulos puxados para cima, da direita para a esquerda: cada um nasce logo acima do topo da
 * própria coluna e sobe de degrau em degrau enquanto encosta, na horizontal, num rótulo já
 * colocado. A direita é mais baixa (ordem por ticket), então o rótulo da esquerda sobe por cima
 * e a linha guia dele nunca cruza o texto do vizinho.
 */
function placeCallouts(items: readonly { readonly column: Column; readonly lines: Callout['lines'] }[]): readonly Callout[] {
  const placed: Callout[] = [];
  const widthOf = (lines: Callout['lines']): number => Math.max(0, ...lines.map((line) => estimateWidth(line.text, VALUE_FONT)));
  for (const item of [...items].reverse()) {
    const x = item.column.x + item.column.w / 2 + CALLOUT_GAP;
    const span = item.lines.length * CALLOUT_LINE;
    const right = x + widthOf(item.lines);
    // O centro da última linha fica CALLOUT_RISE acima do topo da coluna; o bloco sobe para cima dele.
    let y = item.column.y - CALLOUT_RISE - (item.lines.length - 1) * CALLOUT_LINE;
    for (const other of placed) {
      const otherRight = other.x + widthOf(other.lines);
      const overlapsX = x < otherRight + CALLOUT_GAP && other.x < right + CALLOUT_GAP;
      const otherSpan = other.lines.length * CALLOUT_LINE;
      const overlapsY = y - CALLOUT_LINE / 2 < other.y - CALLOUT_LINE / 2 + otherSpan + CALLOUT_GAP && other.y - CALLOUT_LINE / 2 < y - CALLOUT_LINE / 2 + span + CALLOUT_GAP;
      if (overlapsX && overlapsY) y = other.y - CALLOUT_LINE / 2 - CALLOUT_GAP - span + CALLOUT_LINE / 2;
    }
    placed.push({ column: item.column, lines: item.lines, x, y });
  }
  return placed;
}

/** Halo da ROT-7 no rótulo que fica acima da coluna, onde a grade o atravessa. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;
/** Altura mínima da coluna para escrever a receita dentro dela (texto de 12 px mais 6, ESP-2). */
const INSIDE_MIN_HEIGHT = 18;

export default function TicketMekko({ data = defaultData, height, className }: TicketMekkoProps) {
  const style = height === undefined ? undefined : { height };
  const valid = data
    .flatMap((row) => {
      const ticket = ratio(row.revenue, row.wins);
      return ticket === null ? [] : [{ row, ticket }];
    })
    .sort((a, b) => b.ticket - a.ticket);
  const scale = niceTicks(Math.max(0, ...valid.map((item) => item.ticket)));

  if (valid.length === 0 || scale === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem com vitória neste recorte: não há ticket médio para calcular nem receita para pesar.</span>
      </div>
    );
  }

  const plotW = VIEW_W - Y_AXIS_W - AVG_LABEL_W;
  const plotRight = Y_AXIS_W + plotW;
  const totalWins = sum(valid.map((item) => item.row.wins));
  const totalRevenue = sum(valid.map((item) => item.row.revenue));
  const averageTicket = totalRevenue / totalWins;
  const widths = valid.map((item) => ((plotW - COLUMN_GAP * (valid.length - 1)) * item.row.wins) / totalWins);
  // Coluna que não comporta a receita escrita vira rótulo puxado para cima, com o nome junto.
  const isPulled = (index: number): boolean => (widths[index] ?? 0) < estimateWidth(formatCurrencyCompact(valid[index]?.row.revenue ?? 0), REVENUE_FONT) + LABEL_PAD * 2;
  const names = valid.map((item, index) => (isPulled(index) ? null : (wrapLabel(item.row.label, (widths[index] ?? 0) - LABEL_PAD) ?? [item.row.label])));
  const nameRows = names.reduce((most, lines) => Math.max(most, lines?.length ?? 1), 1);
  const plotH = VIEW_H - PLOT_TOP - AXIS_GAP - LINE_H * (nameRows + 2) - FOOT_GAP - BOTTOM_PAD;
  const columns = barMekko(valid, plotW, plotH, scale.top);
  const baseY = PLOT_TOP + plotH;
  const rowY = (row: number): number => baseY + AXIS_GAP + LINE_H * (row + 0.5);
  const tickY = (value: number): number => baseY - (value / scale.top) * plotH;
  const averageY = tickY(averageTicket);

  const tallest = columns[0];
  const fewWins = tallest !== undefined && tallest.row.wins / totalWins < FEW_WINS_SHARE;
  const biggest = columns.reduce<Column | null>((best, column) => (best === null || column.row.revenue > best.row.revenue ? column : best), null);
  const callouts = placeCallouts(
    columns.flatMap((column, index) => {
      if (!isPulled(index)) return [];
      const lines = [
        { text: column.row.label, value: false },
        { text: `${formatCurrencyCompact(column.row.revenue)} em ${formatInt(column.row.wins)} vitórias`, value: true },
        ...(fewWins && column === tallest ? [{ text: `ticket alto, ${formatCurrencyCompact(column.ticket)}`, value: false }] : []),
      ];
      return [{ column, lines }];
    }),
  );
  const firstBelow = columns.find((column) => column.ticket <= averageTicket);
  const lineStart = firstBelow ? firstBelow.x : plotRight;
  const averageText = formatCurrencyCompact(averageTicket);
  const totalText = formatCurrencyCompact(totalRevenue);
  const range = `de ${formatMonthShort(period.from)} a ${formatMonthShort(period.to)}`;
  const summary =
    tallest && biggest
      ? `Gráfico bar mekko de ${formatInt(columns.length)} origens de lead, ${range}, com vitórias na largura e ticket médio na altura. ${biggest.row.label} reúne a maior receita, ${formatCurrencyCompact(biggest.row.revenue)}; ${tallest.row.label} tem o maior ticket, ${formatCurrencyCompact(tallest.ticket)}, em ${formatInt(tallest.row.wins)} vitórias.`
      : '';

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {tallest && biggest ? (
        <p aria-hidden className="mb-2 shrink-0 text-xs leading-4 text-text-secondary">
          <span className="font-semibold text-text-primary">{biggest.row.label}</span> sustenta a maior receita,{' '}
          <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(biggest.row.revenue)}</span>, no volume de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(biggest.row.wins)}</span> vitórias; {tallest.row.label.toLowerCase()} tem o maior ticket,{' '}
          <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(tallest.ticket)}</span>, em{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(tallest.row.wins)}</span> vitórias
        </p>
      ) : null}
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
            const isTallest = column === tallest;
            const revenueText = formatCurrencyCompact(column.row.revenue);
            const cx = column.x + column.w / 2;
            const lines = names[index];
            const inside = !isPulled(index) && column.h >= INSIDE_MIN_HEIGHT;
            // Acima da coluna, o rótulo sobe para cima da linha do ticket médio quando ela passa rente ao topo.
            const aboveY = Math.min(column.y, averageY) - 9;
            return (
              <g key={column.row.id}>
                <title>{`${column.row.label}: ${formatInt(column.row.wins)} vitórias, ticket médio ${formatCurrencyCompact(column.ticket)}, receita ${revenueText}`}</title>
                <rect fill={isTallest ? HIGHLIGHT : NEUTRAL} height={column.h} width={column.w} x={column.x} y={column.y} />
                {isPulled(index) ? null : (
                  <text className="font-display" dominantBaseline="central" fill={inside ? (isTallest ? ON_HIGHLIGHT : ON_NEUTRAL) : 'var(--text-primary)'} fontSize={REVENUE_FONT} fontWeight={600} style={inside ? undefined : HALO} textAnchor="middle" x={cx} y={inside ? column.y + 11 : aboveY}>
                    {revenueText}
                  </text>
                )}
                {lines?.map((line, lineIndex) => (
                  <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={NAME_FONT} fontWeight={500} key={line} textAnchor="middle" x={cx} y={rowY(nameRows - lines.length + lineIndex)}>
                    {line}
                  </text>
                ))}
                {lines ? (
                  <text dominantBaseline="central" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={rowY(nameRows)}>
                    <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>{`${formatInt(column.row.wins)} `}</tspan>
                    <tspan className="font-sans" fill="var(--text-muted)">vitórias</tspan>
                  </text>
                ) : null}
              </g>
            );
          })}
          {callouts.map((callout) => {
            const cx = callout.column.x + callout.column.w / 2;
            return (
              <g key={callout.column.row.id}>
                <line stroke={GUIDE_STROKE} strokeWidth={1} x1={cx} x2={cx} y1={callout.column.y} y2={callout.y - CALLOUT_LINE / 2} />
                {callout.lines.map((line, lineIndex) => (
                  <text className={line.value ? 'font-display' : 'font-sans'} dominantBaseline="central" fill={line.value ? 'var(--text-primary)' : 'var(--text-secondary)'} fontSize={VALUE_FONT} fontWeight={line.value ? 600 : 500} key={line.text} style={HALO} textAnchor="start" x={callout.x} y={callout.y + lineIndex * CALLOUT_LINE}>
                    {line.text}
                  </text>
                ))}
              </g>
            );
          })}
          {/* A linha do ticket médio só existe fora das colunas mais altas que ela (TOK-10). */}
          <line stroke={GUIDE_STROKE} strokeDasharray="3 3" strokeWidth={1.5} x1={lineStart} x2={plotRight + 4} y1={averageY} y2={averageY} />
          <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={VALUE_FONT} textAnchor="start" x={plotRight + 8} y={averageY - 7}>
            <tspan className="font-sans">ticket médio</tspan>
          </text>
          <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={VALUE_FONT} fontWeight={600} textAnchor="start" x={plotRight + 8} y={averageY + 7}>
            {averageText}
          </text>
          <line stroke="var(--line-strong)" strokeWidth={1} x1={Y_AXIS_W} x2={plotRight} y1={baseY} y2={baseY} />
          {columns.map((column) => (
            <line key={column.row.id} stroke="var(--line-strong)" strokeWidth={1} x1={column.x + column.w + COLUMN_GAP / 2} x2={column.x + column.w + COLUMN_GAP / 2} y1={baseY} y2={baseY + TICK_LEN} />
          ))}
          <text dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="start" x={Y_AXIS_W} y={rowY(nameRows + 1) + FOOT_GAP}>
            <tspan className="font-sans">largura vitórias, altura ticket médio, área receita</tspan>
          </text>
          <text dominantBaseline="central" fontSize={VALUE_FONT} textAnchor="end" x={VIEW_W} y={rowY(nameRows + 1) + FOOT_GAP}>
            <tspan className="font-sans" fill="var(--text-muted)">Total: </tspan>
            <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>{`${formatInt(totalWins)} vitórias, ${totalText}`}</tspan>
          </text>
        </svg>
      </div>
    </div>
  );
}
