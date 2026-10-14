import { Filter } from 'lucide-react';

import { formatDate, formatDays, formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, focusId as defaultFocusId, type HandoffBoard, type Opportunity, type Stage } from './data';

/**
 * Swimlane de passagem: uma raia por função, na ordem do processo, e cada oportunidade como uma
 * sequência de períodos de posse. A passagem é um losango na fronteira, e a espera entre a saída de
 * uma função e a chegada à seguinte é um traço tracejado com os dias escritos. A oportunidade em
 * foco mantém barra cheia e os dias escritos; as demais ficam em barra fina, na própria cor.
 */
export interface HandoffSwimlaneProps {
  readonly data?: HandoffBoard;
  /** Oportunidade em foco; `null` acende todas. Sem a prop, vale a do dado. */
  readonly focusId?: string | null;
  readonly height?: number;
  readonly className?: string;
}

/** O corpo do canvas `largo` mede 894 px de largura: o viewBox tem a mesma largura e a escala sai 1. */
const VIEW_W = 894;
const LEFT_W = 84;
const PANEL_W = 196;
const HEADER_H = 22;
const LANE_PAD = 5;
const SUB_H = 12;
const SUB_GAP = 2;
const FOCUS_BAR_H = 12;
const DIM_BAR_H = 6;
const LEGEND_GAP = 10;
const LEGEND_H = 14;
const PANEL_ROW_H = 30;
const DIAMOND = 5;
const DAY_MS = 86_400_000;
/** Cor por slot da oportunidade: a cor pertence à oportunidade, não à posição na lista (COR-3). */
const SLOT_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-6)'] as const;

interface LinearScale {
  (value: number): number;
}

/** Escala linear: leva o domínio (dias desde o início da janela) para o intervalo em pixels. */
function timeScale(domain: readonly [number, number], range: readonly [number, number]): LinearScale {
  const span = domain[1] - domain[0];
  return (value) => range[0] + ((value - domain[0]) / span) * (range[1] - range[0]);
}

/** Escala de banda: uma faixa vertical por chave, na ordem recebida, com a largura de cada raia dada de fora. */
function bandScale(keys: readonly string[], heights: readonly number[], origin: number): (key: string) => number {
  return (key) => {
    const index = keys.indexOf(key);
    return origin + heights.slice(0, Math.max(index, 0)).reduce((sum, value) => sum + value, 0);
  };
}

function toMs(iso: string): number {
  return Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

function dayIndex(iso: string, windowStart: string): number {
  return Math.round((toMs(iso) - toMs(windowStart)) / DAY_MS);
}

/** Soma das esperas de uma oportunidade; `null` sem nenhuma passagem, porque zero dia é espera medida. */
function totalWait(waits: readonly number[]): number | null {
  if (waits.length === 0) return null;
  return waits.reduce((sum, value) => sum + value, 0);
}

interface PlacedStage {
  readonly opp: Opportunity;
  readonly stage: Stage;
  readonly laneIndex: number;
  readonly sub: number;
  readonly from: number;
  readonly to: number;
}

/**
 * Empacotamento guloso e determinístico por função: por início e depois por id, cada posse vai para
 * a primeira sub-faixa já livre. A função cresce em vez de sobrepor retângulos.
 */
function packStages(board: HandoffBoard): { readonly placed: readonly PlacedStage[]; readonly subs: readonly number[] } {
  const subs = board.lanes.map(() => 1);
  const placed: PlacedStage[] = [];
  board.lanes.forEach((lane, laneIndex) => {
    const items = board.opportunities
      .flatMap((opp) => opp.stages.filter((stage) => stage.laneId === lane.id).map((stage) => ({ opp, stage })))
      .map((item) => ({ ...item, from: dayIndex(item.stage.from, board.windowStart), to: dayIndex(item.stage.to, board.windowStart) }))
      .sort((a, b) => a.from - b.from || a.opp.id.localeCompare(b.opp.id));
    const lastEnd: number[] = [];
    items.forEach((item) => {
      let sub = lastEnd.findIndex((end) => end < item.from);
      if (sub === -1) sub = lastEnd.length;
      lastEnd[sub] = item.to;
      placed.push({ opp: item.opp, stage: item.stage, laneIndex, sub, from: item.from, to: item.to });
    });
    subs[laneIndex] = Math.max(1, lastEnd.length);
  });
  return { placed, subs };
}

interface Handoff {
  readonly opp: Opportunity;
  readonly from: PlacedStage;
  readonly to: PlacedStage;
  /** Dias inteiros entre a saída e a chegada. */
  readonly wait: number;
}

function handoffsOf(placed: readonly PlacedStage[], opportunities: readonly Opportunity[]): readonly Handoff[] {
  return opportunities.flatMap((opp) => {
    const own = placed.filter((item) => item.opp.id === opp.id).sort((a, b) => a.from - b.from);
    return own.slice(1).map((to, index): Handoff => {
      const from = own[index] ?? to;
      return { opp, from, to, wait: Math.max(0, to.from - (from.to + 1)) };
    });
  });
}

export default function HandoffSwimlane({ data = defaultData, focusId = defaultFocusId, height, className }: HandoffSwimlaneProps) {
  const style = height === undefined ? undefined : { height };

  if (data.lanes.length === 0 || data.opportunities.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center justify-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4" />
        <span>Nenhuma oportunidade no recorte: sem passagem entre funções, não há posse nem espera a mostrar.</span>
      </div>
    );
  }

  const { placed, subs } = packStages(data);
  const laneHeights = subs.map((count) => LANE_PAD * 2 + count * SUB_H + (count - 1) * SUB_GAP);
  const laneTop = bandScale(data.lanes.map((lane) => lane.id), laneHeights, HEADER_H);
  const lanesBottom = HEADER_H + laneHeights.reduce((sum, value) => sum + value, 0);
  const viewH = lanesBottom + LEGEND_GAP + LEGEND_H;
  const legendY = lanesBottom + LEGEND_GAP + LEGEND_H / 2;

  const days = dayIndex(data.windowEnd, data.windowStart) + 1;
  const gridRight = VIEW_W - PANEL_W;
  const dayX = timeScale([0, days], [LEFT_W, gridRight]);
  const colorOf = (opp: Opportunity): string => SLOT_COLORS[opp.slot - 1] ?? 'var(--text-muted)';
  const isFocus = (opp: Opportunity): boolean => focusId === null || opp.id === focusId;
  const centerY = (item: PlacedStage): number => {
    const lane = data.lanes[item.laneIndex];
    return (lane === undefined ? 0 : laneTop(lane.id)) + LANE_PAD + item.sub * (SUB_H + SUB_GAP) + SUB_H / 2;
  };

  const handoffs = handoffsOf(placed, data.opportunities);
  const rows = data.opportunities.map((opp) => {
    const waits = handoffs.filter((handoff) => handoff.opp.id === opp.id).map((handoff) => handoff.wait);
    return { opp, total: totalWait(waits), count: waits.length };
  });
  const longest = rows.reduce<(typeof rows)[number] | undefined>(
    (best, row) => ((row.total ?? -1) > (best?.total ?? -1) ? row : best),
    undefined,
  );

  /** Marcações de tempo: o primeiro dia da janela e cada segunda-feira, com a data escrita. */
  const ticks = Array.from({ length: days }, (_, index) => index).filter(
    (index) => index === 0 || new Date(toMs(data.windowStart) + index * DAY_MS).getUTCDay() === 1,
  );
  const dateOf = (index: number): string => new Date(toMs(data.windowStart) + index * DAY_MS).toISOString().slice(0, 10);

  const summary =
    longest === undefined || longest.total === null
      ? `Passagem de ${formatInt(data.opportunities.length)} oportunidades entre ${formatInt(data.lanes.length)} funções em ${formatMonthShort(data.windowStart)}, sem nenhuma passagem medida.`
      : `Passagem de ${formatInt(data.opportunities.length)} oportunidades entre ${formatInt(data.lanes.length)} funções em ${formatMonthShort(data.windowStart)}. ` +
        `${longest.opp.name} esperou mais: ${formatDays(longest.total)} em ${formatInt(longest.count)} passagens.`;

  const ordered = [...placed].sort((a, b) => Number(isFocus(a.opp)) - Number(isFocus(b.opp)));
  const orderedHandoffs = [...handoffs].sort((a, b) => Number(isFocus(a.opp)) - Number(isFocus(b.opp)));

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 items-center', className)}
      role="img"
      style={style}
    >
      <svg aria-hidden className="h-full w-full" viewBox={`0 0 ${String(VIEW_W)} ${String(viewH)}`}>
        {data.lanes.map((lane, index) => (
          <g key={lane.id}>
            {index % 2 === 0 ? (
              <rect fill="var(--surface-sunken)" height={laneHeights[index] ?? 0} width={gridRight} x={0} y={laneTop(lane.id)} />
            ) : null}
            <text
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={11}
              fontWeight={500}
              x={8}
              y={laneTop(lane.id) + (laneHeights[index] ?? 0) / 2}
            >
              {lane.name}
            </text>
          </g>
        ))}

        {ticks.map((index) => (
          <g key={index}>
            <line stroke="var(--line-subtle)" strokeWidth={1} vectorEffect="non-scaling-stroke" x1={dayX(index)} x2={dayX(index)} y1={HEADER_H - 4} y2={lanesBottom} />
            <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} x={dayX(index) + 3} y={12}>
              {formatDate(dateOf(index)).slice(0, 5)}
            </text>
          </g>
        ))}

        {orderedHandoffs.map((handoff) => {
          const focus = isFocus(handoff.opp);
          const x1 = dayX(handoff.from.to + 1);
          const y1 = centerY(handoff.from);
          const x2 = dayX(handoff.to.from);
          const y2 = centerY(handoff.to);
          const color = colorOf(handoff.opp);
          return (
            <g key={`${handoff.opp.id}-${handoff.to.stage.laneId}`}>
              {handoff.wait > 0 ? (
                <line
                  stroke={color}
                  strokeDasharray="3 3"
                  strokeWidth={focus ? 1.5 : 1}
                  vectorEffect="non-scaling-stroke"
                  x1={x1}
                  x2={x2}
                  y1={y1}
                  y2={y2}
                />
              ) : null}
            </g>
          );
        })}

        {ordered.map((item) => {
          const focus = isFocus(item.opp);
          const barH = focus ? FOCUS_BAR_H : DIM_BAR_H;
          return (
            <rect
              fill={colorOf(item.opp)}
              height={barH}
              key={`${item.opp.id}-${item.stage.laneId}`}
              rx={2}
              stroke="var(--surface-raised)"
              strokeWidth={1}
              width={Math.max(dayX(item.to + 1) - dayX(item.from), 2)}
              x={dayX(item.from)}
              y={centerY(item) - barH / 2}
            >
              <title>{`${item.opp.name}, ${data.lanes[item.laneIndex]?.name ?? ''}: ${formatDate(item.stage.from)} a ${formatDate(item.stage.to)}`}</title>
            </rect>
          );
        })}

        {orderedHandoffs.map((handoff) => {
          const size = isFocus(handoff.opp) ? DIAMOND : DIAMOND - 2;
          const x1 = dayX(handoff.from.to + 1);
          const y1 = centerY(handoff.from);
          return (
            <polygon
              fill={colorOf(handoff.opp)}
              points={`${String(x1)},${String(y1 - size)} ${String(x1 + size)},${String(y1)} ${String(x1)},${String(y1 + size)} ${String(x1 - size)},${String(y1)}`}
              stroke="var(--surface-raised)"
              strokeWidth={1}
              key={`${handoff.opp.id}-${handoff.to.stage.laneId}-losango`}
            />
          );
        })}

        {/* Os dias vão por último: o texto fica por cima das barras, em posição livre de barras (anticolisão). */}
        {orderedHandoffs
          .filter((handoff) => focusId !== null && isFocus(handoff.opp))
          .map((handoff) => {
            const label = formatDays(handoff.wait);
            const w = label.length * 7 + 4;
            const h = 14;
            const ax = dayX(handoff.from.to + 1);
            const ay = centerY(handoff.from);
            const bx = dayX(handoff.to.from);
            const by = centerY(handoff.to);
            /* Candidatos ao longo do tracejado, à direita e à esquerda; vence o primeiro livre de barras. */
            const candidates = [0, 8, -8, 14, -14].flatMap((dy) =>
              [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.1, 0.9].flatMap((t) =>
                [6, -6 - w].map((dx) => ({ x: ax + (bx - ax) * t + dx, y: ay + (by - ay) * t - h / 2 + dy })),
              ),
            );
            const hits = (c: { x: number; y: number }): number =>
              placed.filter((item) => {
                const bh = isFocus(item.opp) ? FOCUS_BAR_H : DIM_BAR_H;
                const top = centerY(item) - bh / 2;
                const left = dayX(item.from);
                const right = Math.max(dayX(item.to + 1), left + 2);
                return c.x < right + 2 && c.x + w > left - 2 && c.y < top + bh + 2 && c.y + h > top - 2;
              }).length;
            const best = candidates.find((c) => hits(c) === 0) ?? candidates.reduce((a, c) => (hits(c) < hits(a) ? c : a), candidates[0] ?? { x: ax, y: ay });
            return (
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill="var(--text-primary)"
                fontSize={11}
                fontWeight={600}
                key={`${handoff.opp.id}-${handoff.to.stage.laneId}-dias`}
                x={best.x}
                y={best.y + h / 2}
              >
                {label}
              </text>
            );
          })}

        <text fill="var(--text-muted)" fontSize={11} x={gridRight + 12} y={14}>
          espera total por oportunidade
        </text>
        {rows.map((row, index) => {
          const y = HEADER_H + 10 + index * PANEL_ROW_H;
          const focus = focusId !== null && row.opp.id === focusId;
          return (
            <g key={row.opp.id}>
              <rect fill={colorOf(row.opp)} height={10} rx={2} width={10} x={gridRight + 12} y={y - 5} />
              <text
                dominantBaseline="central"
                fill={focus ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={11}
                fontWeight={focus ? 700 : 500}
                x={gridRight + 28}
                y={y}
              >
                {row.opp.name}
              </text>
              <text
                className="font-display tabular-nums"
                dominantBaseline="central"
                fill={focus ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize={11}
                fontWeight={focus ? 700 : 500}
                x={gridRight + 28}
                y={y + 15}
              >
                {row.total === null ? formatUnavailable() : formatDays(row.total)}
              </text>
            </g>
          );
        })}

        <polygon
          fill="var(--text-secondary)"
          points={`12,${String(legendY - 5)} 17,${String(legendY)} 12,${String(legendY + 5)} 7,${String(legendY)}`}
        />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={26} y={legendY}>
          passagem entre funções
        </text>
        <line stroke="var(--text-secondary)" strokeDasharray="3 3" strokeWidth={1.5} x1={170} x2={196} y1={legendY} y2={legendY} />
        <text dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={204} y={legendY}>
          espera em dias; a barra cheia é a oportunidade em foco, as finas são as demais.
        </text>
      </svg>
    </div>
  );
}
