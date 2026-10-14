import { Filter } from 'lucide-react';

import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatMonthLong, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, period, type PlatformSpend } from './data';

/**
 * Bar mekko (variwide) com os três casos em que o CPL não existe como altura. A largura é o
 * número de leads, a altura é o CPL linear a partir do zero e a área é o investimento. Plataforma
 * com investimento e zero lead tem CPL indefinido: não vira coluna nem divisão por zero, e sai
 * como marcador na zona à direita, fora da escala de altura. Custo não coletado (`null`) é uma
 * vaga tracejada com a palavra de `formatUnavailable()`; custo zero medido é coluna de altura
 * nula, desenhada como faixa sólida com o R$ 0 escrito. O domínio do eixo Y sai só dos CPL
 * definidos. A geometria sai de `barMekko()`, função pura; o SVG só desenha.
 */
export interface UnleadMekkoProps {
  /** Uma linha por plataforma, em qualquer ordem: o componente classifica e ordena por CPL decrescente. */
  readonly data?: readonly PlatformSpend[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Corpo do canvas 720x360 (654 px de largura) menos a linha de leitura: o SVG sai em escala 1 (GEO-18). */
const VIEW_W = 654;
const VIEW_H = 217;
const Y_AXIS_W = 44;
/** Zona à direita das plataformas sem lead, separada da escala por um divisor. */
const ZONE_W = 100;
const ZONE_GAP = 10;
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
const TICK_LEN = 4;
/** Altura da faixa que desenha o zero medido e da vaga tracejada do custo não coletado. */
const ZERO_MARK_H = 3;
const SLOT_H = 36;
const MARKER_SIZE = 7;
const ZONE_ROW = 44;
const HIGHLIGHT = 'var(--chart-1)';
const NEUTRAL = 'var(--line-strong)';
const MUTED_STROKE = 'var(--text-muted)';
/** Halo da ROT-7 no rótulo que fica acima da coluna, onde a grade o atravessa. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

/** Coluna com CPL definido (`cpl` pode ser 0) ou vaga de custo não coletado (`cpl` nulo). */
interface Slot {
  readonly row: PlatformSpend;
  readonly cpl: number | null;
  readonly x: number;
  readonly w: number;
  readonly y: number;
  readonly h: number;
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
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
 * Os vãos saem ANTES da partilha de largura (GEO-16). Toda linha chega com leads positivos; a
 * vaga de custo não coletado ocupa a largura dela e não tem altura (`h` zero, `cpl` nulo).
 */
function barMekko(rows: readonly { readonly row: PlatformSpend; readonly cpl: number | null }[], plotW: number, plotH: number, top: number): readonly Slot[] {
  const usable = plotW - COLUMN_GAP * (rows.length - 1);
  const totalLeads = sum(rows.map((item) => item.row.leads));
  const scale = plotH / top;
  let x = Y_AXIS_W;
  return rows.map(({ row, cpl }) => {
    const w = (usable * row.leads) / totalLeads;
    const h = (cpl ?? 0) * scale;
    const slot = { row, cpl, x, w, y: PLOT_TOP + plotH - h, h };
    x += w + COLUMN_GAP;
    return slot;
  });
}

export default function UnleadMekko({ data = defaultData, height, className }: UnleadMekkoProps) {
  const style = height === undefined ? undefined : { height };
  const withLeads = data.filter((row) => row.leads > 0);
  // Só o CPL definido entra no ranking e no domínio do eixo Y: sem lead não há divisão, sem custo não há CPL.
  const measured = withLeads
    .flatMap((row) => (row.spend === null ? [] : [{ row, cpl: row.spend / row.leads }]))
    .sort((a, b) => b.cpl - a.cpl);
  const unavailable = withLeads.flatMap((row) => (row.spend === null ? [{ row, cpl: null }] : []));
  const noLead = data.filter((row) => row.leads <= 0);
  const scale = niceTicks(Math.max(0, ...measured.map((item) => item.cpl)));

  if (withLeads.length === 0 || scale === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma plataforma com lead e custo neste recorte: não há CPL para desenhar nem investimento para pesar.</span>
      </div>
    );
  }

  const hasZone = noLead.length > 0;
  const zoneX = VIEW_W - ZONE_W;
  const plotW = VIEW_W - Y_AXIS_W - (hasZone ? ZONE_W + ZONE_GAP : 0);
  const plotRight = Y_AXIS_W + plotW;
  const items = [...measured, ...unavailable];
  const totalLeads = sum(items.map((item) => item.row.leads));
  const widths = items.map((item) => ((plotW - COLUMN_GAP * (items.length - 1)) * item.row.leads) / totalLeads);
  const names = items.map((item, index) => wrapLabel(item.row.label, (widths[index] ?? 0) - LABEL_PAD) ?? [item.row.label]);
  const nameRows = names.reduce((most, lines) => Math.max(most, lines.length), 1);
  const plotH = VIEW_H - PLOT_TOP - AXIS_GAP - LINE_H * (nameRows + 2) - FOOT_GAP - BOTTOM_PAD;
  const slots = barMekko(items, plotW, plotH, scale.top);
  const baseY = PLOT_TOP + plotH;
  const rowY = (row: number): number => baseY + AXIS_GAP + LINE_H * (row + 0.5);
  const tickY = (value: number): number => baseY - (value / scale.top) * plotH;

  const leader = slots.find((slot) => slot.cpl !== null && slot.cpl > 0);
  const firstNoLead = noLead[0];
  const firstUnavailable = unavailable[0];
  const sentences = [
    firstNoLead ? `${firstNoLead.label} ${firstNoLead.spend === null ? 'não tem custo coletado nem lead' : `gastou ${formatCurrencyCompact(firstNoLead.spend)} sem gerar lead`}` : '',
    firstUnavailable ? `${firstUnavailable.row.label.toLowerCase()} não tem custo coletado` : '',
  ].filter(Boolean);
  const reading = sentences.length > 0 ? sentences.join('; ') : leader ? `${leader.row.label} tem o maior CPL, ${formatCurrencyCompact(leader.cpl ?? 0)}` : '';
  const summary = `Gráfico bar mekko de ${formatInt(data.length)} plataformas de mídia paga em ${formatMonthLong(period)}, com leads na largura e CPL na altura. ${reading.charAt(0).toUpperCase()}${reading.slice(1)}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs leading-4 text-text-secondary">
        {firstNoLead ? (
          <>
            <span className="font-semibold text-text-primary">{firstNoLead.label}</span>{' '}
            {firstNoLead.spend === null ? (
              'não tem custo coletado nem lead'
            ) : (
              <>
                gastou <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(firstNoLead.spend)}</span> sem gerar lead
              </>
            )}
          </>
        ) : leader ? (
          <>
            <span className="font-semibold text-text-primary">{leader.row.label}</span> tem o maior CPL,{' '}
            <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(leader.cpl ?? 0)}</span>
          </>
        ) : null}
        {firstUnavailable ? <>; {firstUnavailable.row.label.toLowerCase()} não tem custo coletado</> : null}
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
          {slots.map((slot, index) => {
            const cx = slot.x + slot.w / 2;
            const lines = names[index] ?? [slot.row.label];
            const isLeader = slot === leader;
            return (
              <g key={slot.row.id}>
                {slot.cpl === null ? (
                  <>
                    <title>{`${slot.row.label}: ${formatInt(slot.row.leads)} leads, custo não coletado, CPL indefinido`}</title>
                    {/* Vaga tracejada e oca: a largura é dos leads, a altura não existe porque o custo não foi coletado. */}
                    <rect fill="none" height={SLOT_H} stroke={MUTED_STROKE} strokeDasharray="3 3" strokeWidth={1} width={Math.max(slot.w - 1, 0)} x={slot.x + 0.5} y={baseY - SLOT_H} />
                    <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={baseY - SLOT_H / 2 - 7}>
                      custo
                    </text>
                    <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={baseY - SLOT_H / 2 + 7}>
                      {formatUnavailable().toLowerCase()}
                    </text>
                  </>
                ) : (
                  <>
                    <title>{`${slot.row.label}: ${formatInt(slot.row.leads)} leads, CPL ${formatCurrencyCompact(slot.cpl)}, investimento ${formatCurrencyCompact(slot.row.spend ?? 0)}`}</title>
                    {/* Zero medido: coluna de altura nula vira faixa sólida, para não ler como a vaga oca de custo não coletado. */}
                    <rect fill={slot.cpl > 0 ? (isLeader ? HIGHLIGHT : NEUTRAL) : 'var(--text-secondary)'} height={slot.cpl > 0 ? slot.h : ZERO_MARK_H} width={slot.w} x={slot.x} y={slot.cpl > 0 ? slot.y : baseY - ZERO_MARK_H} />
                    <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={CPL_FONT} fontWeight={600} style={HALO} textAnchor="middle" x={cx} y={(slot.cpl > 0 ? slot.y : baseY - ZERO_MARK_H) - 9}>
                      {formatCurrencyCompact(slot.cpl)}
                    </text>
                  </>
                )}
                {lines.map((line, lineIndex) => (
                  <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={NAME_FONT} fontWeight={500} key={line} textAnchor="middle" x={cx} y={rowY(nameRows - lines.length + lineIndex)}>
                    {line}
                  </text>
                ))}
                <text dominantBaseline="central" fontSize={VALUE_FONT} textAnchor="middle" x={cx} y={rowY(nameRows)}>
                  <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>{`${formatInt(slot.row.leads)} `}</tspan>
                  <tspan className="font-sans" fill="var(--text-muted)">leads</tspan>
                </text>
              </g>
            );
          })}
          <line stroke="var(--line-strong)" strokeWidth={1} x1={Y_AXIS_W} x2={plotRight} y1={baseY} y2={baseY} />
          {slots.map((slot) => (
            <line key={slot.row.id} stroke="var(--line-strong)" strokeWidth={1} x1={slot.x + slot.w + COLUMN_GAP / 2} x2={slot.x + slot.w + COLUMN_GAP / 2} y1={baseY} y2={baseY + TICK_LEN} />
          ))}
          {hasZone ? (
            <g>
              {/* Divisor e base tracejada: a zona está fora da escala de altura, e o desenho diz isso. */}
              <line stroke="var(--line-subtle)" strokeWidth={1} x1={zoneX - ZONE_GAP / 2} x2={zoneX - ZONE_GAP / 2} y1={PLOT_TOP} y2={baseY + TICK_LEN} />
              <line stroke="var(--line-strong)" strokeDasharray="3 3" strokeWidth={1} x1={zoneX} x2={VIEW_W} y1={baseY} y2={baseY} />
              {noLead.map((row, index) => {
                const cx = zoneX + ZONE_W / 2;
                const markerY = baseY - MARKER_SIZE - 2 - index * ZONE_ROW;
                const spendText = row.spend === null ? formatUnavailable().toLowerCase() : formatCurrencyCompact(row.spend);
                return (
                  <g key={row.id}>
                    <title>{`${row.label}: ${row.spend === null ? 'custo não coletado' : `investimento ${formatCurrencyCompact(row.spend)}`}, sem lead no mês, CPL indefinido`}</title>
                    <path d={`M${String(cx)} ${String(markerY - MARKER_SIZE)} L${String(cx + MARKER_SIZE)} ${String(markerY)} L${String(cx)} ${String(markerY + MARKER_SIZE)} L${String(cx - MARKER_SIZE)} ${String(markerY)} Z`} fill="var(--negative)" />
                    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={NAME_FONT} fontWeight={500} textAnchor="middle" x={cx} y={markerY - MARKER_SIZE - 40}>
                      {row.label}
                    </text>
                    <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={CPL_FONT} fontWeight={600} textAnchor="middle" x={cx} y={markerY - MARKER_SIZE - 26}>
                      {spendText}
                    </text>
                    <text className="font-sans" dominantBaseline="central" fill="var(--text-primary)" fontSize={VALUE_FONT} fontWeight={500} textAnchor="middle" x={cx} y={markerY - MARKER_SIZE - 12}>
                      sem lead
                    </text>
                  </g>
                );
              })}
            </g>
          ) : null}
          <text dominantBaseline="central" fill="var(--text-muted)" fontSize={VALUE_FONT} textAnchor="start" x={Y_AXIS_W} y={rowY(nameRows + 1) + FOOT_GAP}>
            <tspan className="font-sans">largura leads, altura CPL, área investimento</tspan>
          </text>
          <text dominantBaseline="central" fontSize={VALUE_FONT} textAnchor="end" x={VIEW_W} y={rowY(nameRows + 1) + FOOT_GAP}>
            <tspan className="font-sans" fill="var(--text-muted)">Total do mês: </tspan>
            <tspan className="font-display" fill="var(--text-primary)" fontWeight={500}>{`${formatInt(totalLeads)} leads`}</tspan>
          </text>
        </svg>
      </div>
    </div>
  );
}
