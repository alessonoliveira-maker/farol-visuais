import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type BarShapeProps,
} from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatDays, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  freezeEnd as defaultFreezeEnd,
  freezeStart as defaultFreezeStart,
  platformLabels,
  platformSlots,
  today as defaultToday,
  windowEnd as defaultWindowEnd,
  windowStart as defaultWindowStart,
  type Campaign,
} from './data';

/**
 * Gantt de campanhas: uma linha por campanha, uma barra do primeiro ao último dia no ar, a cor
 * fixa pela plataforma e o nome dela escrito ao lado da barra. A linha de hoje e a janela de
 * congelamento são anotações no eixo do tempo.
 */
export interface CampaignCalendarProps {
  /** Campanhas com início e fim inclusive. A ordem de entrada não importa: o componente ordena pelo início. */
  readonly data?: readonly Campaign[];
  /** Hoje, em YYYY-MM-DD, vindo do dado. */
  readonly today?: string;
  /** Primeiro e último dia do eixo, em YYYY-MM-DD. */
  readonly windowStart?: string;
  readonly windowEnd?: string;
  /** Janela de congelamento, do primeiro ao último dia. */
  readonly freezeStart?: string;
  readonly freezeEnd?: string;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const DAY_MS = 86_400_000;
const NAME_AXIS_WIDTH = 176;
/** Topo reservado às duas anotações; direita reservada ao último tique do eixo, que cai na borda. */
const MARGIN = { top: 22, right: 26, bottom: 2, left: 0 } as const;
const AXIS_HEIGHT = 24;
const BAR_RADIUS = 3;
const BAR_MAX = 20;
/** Largura média de um caractere de 11 px na interface, para decidir de que lado da barra o rótulo cabe. */
const CHAR_WIDTH = 6.4;
const LABEL_GAP = 6;
/** Camada de rótulo do Recharts (2000): texto por cima de qualquer barra. */
const LABEL_Z = 2000;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface Row extends Campaign {
  readonly startMs: number;
  /** Fim exclusivo: o último dia no ar ocupa o dia inteiro. */
  readonly endMs: number;
  readonly range: readonly [number, number];
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Data YYYY-MM-DD em milissegundos UTC. */
function toMs(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Primeiro dia de cada mês dentro do eixo, gerado aqui para o tique cair sempre no dia 1. */
function monthTicks(startMs: number, endMs: number): number[] {
  const first = new Date(startMs);
  const year = first.getUTCFullYear();
  let month = first.getUTCMonth();
  let tick = Date.UTC(year, month, 1);
  if (tick < startMs) {
    month += 1;
    tick = Date.UTC(year, month, 1);
  }
  const ticks: number[] = [];
  while (tick <= endMs) {
    ticks.push(tick);
    month += 1;
    tick = Date.UTC(year, month, 1);
  }
  return ticks;
}

/** Linhas pelo início; empate pelo fim e depois pelo nome. */
function toRows(data: readonly Campaign[]): Row[] {
  return data
    .map((item) => {
      const startMs = toMs(item.start);
      const endMs = toMs(item.end) + DAY_MS;
      return { ...item, startMs, endMs, range: [startMs, endMs] as const };
    })
    .sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs || a.name.localeCompare(b.name, 'pt-BR'));
}

/** Maior número de campanhas no ar ao mesmo tempo; `null` quando não há campanha. */
function peakOverlap(rows: readonly Row[]): number | null {
  if (rows.length === 0) return null;
  // Simultaneidade: quem está no ar no instante de cada início (e não os vizinhos de cada linha).
  return Math.max(...rows.map((row) => rows.filter((other) => other.startMs <= row.startMs && other.endMs > row.startMs).length));
}

/** O check só reconhece token escrito por inteiro, então o slot vira cor por tabela e não por montagem de texto. */
const SLOT_FILLS: Readonly<Record<number, string>> = {
  1: 'var(--chart-1)',
  2: 'var(--chart-2)',
  3: 'var(--chart-3)',
  4: 'var(--chart-4)',
  5: 'var(--chart-5)',
  6: 'var(--chart-6)',
};

function slotFill(platform: Campaign['platform']): string {
  return SLOT_FILLS[platformSlots[platform]] ?? 'var(--line-strong)';
}

function daysOf(row: Row): number {
  return Math.round((row.endMs - row.startMs) / DAY_MS);
}

/** Rótulo direto de cada barra e as duas anotações do topo, todos pela escala do próprio gráfico. */
function Overlay({
  rows,
  todayMs,
  freezeFromMs,
  freezeToMs,
}: {
  readonly rows: readonly Row[];
  readonly todayMs: number;
  readonly freezeFromMs: number;
  readonly freezeToMs: number;
}) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (!xScale || !yScale || !plot) return null;

  const todayX = xScale(todayMs);
  const freezeFrom = xScale(freezeFromMs);
  const freezeTo = xScale(freezeToMs);
  const plotRight = plot.x + plot.width;
  const topY = plot.y - 8;

  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      {todayX === undefined ? null : (
        <text
          className="font-display"
          fill="var(--text-primary)"
          fontSize={11}
          fontWeight={600}
          textAnchor="middle"
          x={todayX}
          y={topY}
        >
          {`hoje, ${formatDate(toIso(todayMs))}`}
        </text>
      )}
      {freezeFrom === undefined || freezeTo === undefined ? null : (
        <text
          className="font-sans"
          fill="var(--text-muted)"
          fontSize={11}
          fontWeight={500}
          textAnchor="middle"
          x={(freezeFrom + freezeTo) / 2}
          y={topY}
        >
          congelamento
        </text>
      )}
      {rows.map((row) => {
        const center = yScale(row.id, { position: 'middle' });
        const startX = xScale(row.startMs);
        const endX = xScale(row.endMs);
        if (center === undefined || startX === undefined || endX === undefined) return null;
        const text = `${platformLabels[row.platform]}, ${formatDays(daysOf(row))}`;
        const textW = text.length * CHAR_WIDTH;
        // Marca fina nunca cede ao halo: o rótulo que cruzaria a linha de hoje começa depois dela.
        const rightX0 = endX + LABEL_GAP;
        const crossesToday = todayX !== undefined && rightX0 < todayX + LABEL_GAP && rightX0 + textW > todayX - LABEL_GAP;
        const rightX = crossesToday && todayX !== undefined ? todayX + LABEL_GAP * 2 : rightX0;
        const fitsRight = rightX + textW <= plotRight;
        return (
          <text
            className="font-sans"
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize={11}
            fontWeight={500}
            key={row.id}
            style={HALO}
            textAnchor={fitsRight ? 'start' : 'end'}
            x={fitsRight ? rightX : startX - LABEL_GAP}
            y={center}
          >
            {text}
          </text>
        );
      })}
    </ZIndexLayer>
  );
}

export default function CampaignCalendar({
  data = defaultData,
  today = defaultToday,
  windowStart = defaultWindowStart,
  windowEnd = defaultWindowEnd,
  freezeStart = defaultFreezeStart,
  freezeEnd = defaultFreezeEnd,
  height,
  className,
}: CampaignCalendarProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = toRows(data);

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma campanha neste recorte: não há período no ar para desenhar no calendário.</span>
      </div>
    );
  }

  const startMs = toMs(windowStart);
  const endMs = toMs(windowEnd) + DAY_MS;
  const todayMs = toMs(today);
  const freezeFromMs = toMs(freezeStart);
  const freezeToMs = toMs(freezeEnd) + DAY_MS;
  const ticks = monthTicks(startMs, endMs);
  const byId = new Map(rows.map((row) => [row.id, row]));

  const live = rows.filter((row) => row.startMs <= todayMs && todayMs < row.endMs).length;
  const peak = peakOverlap(rows) ?? 0;
  const longest = rows.reduce((best, row) => (daysOf(row) > daysOf(best) ? row : best), rows[0] ?? ({} as Row));
  const todayText = formatDate(today);

  const summary = [
    `Gráfico de Gantt com ${formatInt(rows.length)} campanhas de ${formatDate(windowStart)} a ${formatDate(windowEnd)}, coloridas pela plataforma.`,
    `Em ${todayText} estão no ar ${formatInt(live)} e, no pico, ${formatInt(peak)} correm em paralelo.`,
    `A mais longa é ${longest.name}, com ${formatDays(daysOf(longest))}.`,
  ].join(' ');

  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text
      className="font-sans"
      dominantBaseline="central"
      fill="var(--text-secondary)"
      fontSize={12}
      fontWeight={500}
      x={MARGIN.left}
      y={Number(y)}
    >
      {byId.get(String(payload?.value ?? ''))?.name ?? ''}
    </text>
  );

  const renderBar = ({ x, y, width, height: barHeight, originalDataIndex }: BarShapeProps): ReactElement | null => {
    const row = rows[originalDataIndex];
    if (!row) return null;
    return (
      <Rectangle
        fill={slotFill(row.platform)}
        height={Number(barHeight)}
        radius={BAR_RADIUS}
        width={Number(width)}
        x={Number(x)}
        y={Number(y)}
      />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        Em {todayText}, <span className="kpi-number font-semibold text-text-primary">{formatInt(live)}</span> de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(rows.length)}</span> campanhas estão no
        ar; no pico, <span className="kpi-number font-medium text-text-primary">{formatInt(peak)}</span> correm em
        paralelo
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="28%" data={rows} layout="vertical" margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[startMs, endMs]}
              height={AXIS_HEIGHT}
              tickFormatter={(value: number) => formatMonthShort(toIso(value))}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="id"
              interval={0}
              tick={renderName}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            {/* Faixa de período em --surface-sunken e não em --surface-overlay, que no claro é o branco do cartão (ANO-4). */}
            <ReferenceArea fill="var(--surface-sunken)" ifOverflow="extendDomain" x1={freezeFromMs} x2={freezeToMs} />
            <Bar dataKey="range" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderBar} />
            {/* Duas linhas: o fio claro por baixo é o halo que deixa a linha de hoje visível sobre a barra colorida (TOK-10). */}
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--surface-raised)" strokeWidth={5} x={todayMs} />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--text-primary)" strokeWidth={1.5} x={todayMs} />
            <Overlay freezeFromMs={freezeFromMs} freezeToMs={freezeToMs} rows={rows} todayMs={todayMs} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
