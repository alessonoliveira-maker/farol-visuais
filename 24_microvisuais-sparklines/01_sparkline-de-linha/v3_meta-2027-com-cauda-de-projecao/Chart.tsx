import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronUp, Filter } from 'lucide-react';
import { Area, ComposedChart, Line, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type GoalProjection, type RevenueLine } from './data';

/**
 * Seis sparklines de receita lado a lado: realizado cheio até hoje, projeção natural tracejada
 * com faixa de cenário, e a trajetória necessária para a meta de 2027 em cinza tracejado.
 * Escala comum dentro de cada cartão e própria entre cartões, declarada no rodapé.
 */
export interface GoalProjectionGridProps {
  readonly data?: GoalProjection;
  readonly className?: string;
}

const MARGIN = { top: 4, right: 4, bottom: 2, left: 4 } as const;
/** O cenário alto é recortado em 20% acima do maior valor do próprio cartão. */
const CAP_FACTOR = 1.2;
/** Folga do domínio abaixo do menor valor, como fração da amplitude. */
const DOMAIN_PAD = 0.06;
/** Diferença abaixo disto (0,05%) entre projeção e meta é lida como empate. */
const FLAT_THRESHOLD = 0.0005;
const WHOLE_PERCENT_FROM = 0.1;

interface Row {
  readonly month: string;
  readonly actual: number | null;
  readonly forecast: number | null;
  readonly required: number | null;
  readonly band: readonly [number, number] | null;
}

interface CardModel {
  readonly line: RevenueLine;
  readonly rows: readonly Row[];
  readonly domain: readonly [number, number];
  readonly clipped: boolean;
  readonly delta: number | null;
}

function monthIndex(month: string): number {
  return Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;
}

function monthAt(startMonth: string, offset: number): string {
  const index = monthIndex(startMonth) + offset;
  return `${String(Math.floor(index / 12))}-${String((index % 12) + 1).padStart(2, '0')}`;
}

function signedPercent(fraction: number): string {
  const absolute = Math.abs(fraction);
  const digits = absolute >= WHOLE_PERCENT_FROM ? 0 : 1;
  // Sinal de menos tipográfico (U+2212), não hífen.
  return `${fraction > 0 ? '+' : '−'}${formatPercent(absolute, digits)}`;
}

function buildCard(line: RevenueLine, startMonth: string, endMonth: string): CardModel | null {
  const total = monthIndex(endMonth) - monthIndex(startMonth) + 1;
  const last = line.actual.at(-1);
  if (last === undefined || line.actual.length >= total) return null;
  const junction = line.actual.length - 1;
  const steps = total - 1 - junction;
  const cap = Math.max(...line.actual, line.projectedEnd, line.goal) * CAP_FACTOR;
  let clipped = false;
  const rows: Row[] = [];
  for (let i = 0; i < total; i += 1) {
    const month = monthAt(startMonth, i);
    const actual = line.actual[i] ?? null;
    if (i < junction) {
      rows.push({ month, actual, forecast: null, required: null, band: null });
      continue;
    }
    const t = (i - junction) / steps;
    const forecast = last + (line.projectedEnd - last) * t;
    const high = forecast * (1 + line.highSpread * t);
    if (high > cap) clipped = true;
    rows.push({
      month,
      actual,
      forecast,
      required: last + (line.goal - last) * t,
      // Ponto de junção (t = 0): faixa de largura zero, para o cenário nascer no último realizado.
      band: [forecast * (1 - line.lowSpread * t), Math.min(high, cap)],
    });
  }
  const lows = rows.flatMap((row) => [row.actual, row.band?.[0] ?? null, row.required].flatMap((value) => (value === null ? [] : [value])));
  const floor = lows.reduce((bottom, value) => Math.min(bottom, value), cap);
  const pad = (cap - floor) * DOMAIN_PAD;
  const delta = line.goal === 0 ? null : (line.projectedEnd - line.goal) / line.goal;
  return { line, rows, domain: [floor - pad, cap], clipped, delta };
}

function Card({ card, todayMonth, animate }: { readonly card: CardModel; readonly todayMonth: string; readonly animate: boolean }) {
  const { line, rows, domain, clipped, delta } = card;
  const isFlat = delta !== null && Math.abs(delta) < FLAT_THRESHOLD;
  const isBelow = delta !== null && delta < 0;
  const StatusIcon = isFlat ? ArrowRight : isBelow ? ArrowDownRight : ArrowUpRight;
  const statusColor = isFlat ? 'text-text-secondary' : isBelow ? 'text-negative' : 'text-positive';

  return (
    <div className="flex min-h-0 min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-3">
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">{line.name}</p>
        <span className={cn('inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold', statusColor)}>
          <StatusIcon aria-hidden className="size-3.5" strokeWidth={2.5} />
          <span className="kpi-number">{delta === null ? '' : isFlat ? 'na meta' : `${signedPercent(delta)} da meta`}</span>
        </span>
      </div>
      <div className="relative mt-1 min-h-8 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={[...rows]} margin={MARGIN}>
            <XAxis dataKey="month" hide />
            <YAxis domain={[...domain]} hide />
            <Area
              connectNulls={false}
              dataKey="band"
              fill="var(--surface-sunken)"
              fillOpacity={1}
              isAnimationActive={animate}
              stroke="none"
              type="linear"
            />
            {/* ifOverflow extendDomain: sem ele o pacote descarta a referência que cai fora do domínio (REC-1). */}
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" strokeWidth={1} x={todayMonth} />
            <Line
              connectNulls={false}
              dataKey="required"
              dot={false}
              isAnimationActive={animate}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              type="linear"
            />
            <Line
              connectNulls={false}
              dataKey="forecast"
              dot={false}
              isAnimationActive={animate}
              stroke="var(--chart-1)"
              strokeDasharray="4 3"
              strokeWidth={2}
              type="linear"
            />
            <Line connectNulls={false} dataKey="actual" dot={false} isAnimationActive={animate} stroke="var(--chart-1)" strokeWidth={2} type="monotone" />
          </ComposedChart>
        </ResponsiveContainer>
        {/* Depois do gráfico no documento: a seta pinta por cima da faixa e mantém o contraste do texto. */}
        {clipped ? <ChevronUp aria-hidden className="pointer-events-none absolute top-0 right-0 size-4 text-text-secondary" strokeWidth={2.5} /> : null}
      </div>
      <p className="mt-1 truncate text-[0.6875rem] leading-none text-text-muted tabular-nums">
        projeção {formatCurrencyCompact(line.projectedEnd)}, meta {formatCurrencyCompact(line.goal)}
      </p>
    </div>
  );
}

export default function GoalProjectionGrid({ data = defaultData, className }: GoalProjectionGridProps) {
  const animate = useAnimateOnce();
  const cards = data.lines.flatMap((line) => {
    const card = buildCard(line, data.startMonth, data.endMonth);
    return card === null ? [] : [card];
  });

  if (cards.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha de receita com realizado e meta neste recorte: sem trajetória para desenhar.</span>
      </div>
    );
  }

  const first = cards[0];
  const todayMonth = first ? (first.rows.find((row) => row.actual !== null && row.forecast !== null)?.month ?? data.startMonth) : data.startMonth;
  const below = cards.filter((card) => card.delta !== null && card.delta < -FLAT_THRESHOLD);
  const endLabel = formatMonthShort(data.endMonth);
  const headline = `${formatInt(below.length)} de ${formatInt(cards.length)} linhas projetam abaixo da trajetória para a meta de ${endLabel}`;
  const summary = `${String(cards.length)} miniaturas de receita mensal com realizado até ${formatMonthShort(todayMonth)} e projeção até ${endLabel}. ${headline}: ${below.map((card) => card.line.name.toLowerCase()).join(', ')}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="group">
      <p aria-hidden className="text-xs font-medium text-text-secondary">
        {headline}
      </p>
      <div aria-hidden className="grid min-h-0 flex-1 grid-cols-3 gap-2">
        {cards.map((card) => (
          <Card animate={animate} card={card} key={card.line.id} todayMonth={todayMonth} />
        ))}
      </div>
      <p aria-hidden className="text-[0.6875rem] leading-snug text-text-muted tabular-nums">
        Faixa de fundo: cenário baixo a alto, não intervalo estatístico. Tracejado cinza: trajetória necessária. Linha vertical: hoje,{' '}
        {formatMonthShort(todayMonth)}. Seta no topo: cenário alto recortado em {formatPercent(CAP_FACTOR - 1, 0)} acima do maior valor. Escala própria em cada cartão.
      </p>
    </div>
  );
}
