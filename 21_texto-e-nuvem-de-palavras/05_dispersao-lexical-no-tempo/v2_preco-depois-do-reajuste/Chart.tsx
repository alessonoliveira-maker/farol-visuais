import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  usePlotArea,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatDays, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LexicalDispersion } from './data';

/**
 * Dispersão lexical com um evento datado: uma faixa por termo, um traço vertical por dia com
 * menção e uma linha de referência na data do reajuste. Só a faixa do termo em destaque usa
 * --chart-1, as outras ficam neutras, e a contagem de menções antes e depois do evento vem escrita
 * à direita de cada faixa. As duas janelas têm a mesma duração. Dois traços no mesmo dia se somam
 * como duas camadas translúcidas: a opacidade de N menções é 1 - (1 - base)^N.
 */
export interface TermDispersionProps {
  readonly data?: LexicalDispersion;
  readonly height?: number;
  readonly className?: string;
}

/** O topo reserva a linha do rótulo do evento, fora das faixas (REC-4); a direita reserva a coluna da contagem. */
const MARGIN = { top: 26, right: 148, bottom: 4, left: 8 } as const;
const Y_AXIS_WIDTH = 124;
const X_AXIS_HEIGHT = 24;
/** Fração da banda que o traço ocupa, para duas faixas vizinhas nunca se encostarem. */
const MARK_BAND_SHARE = 0.7;
const MARK_MIN_HEIGHT = 6;
const MARK_STROKE_WIDTH = 1;
const HIGHLIGHT_STROKE_WIDTH = 1.5;
/** Opacidade de uma menção: acima do piso de 0,72 de --text-muted e de 0,66 de --chart-1 (ACE-5, 3:1 no claro). */
const MARK_BASE_OPACITY = 0.75;
/** Largura do alvo invisível da dica: um traço de 1 px sozinho não se acerta com o cursor. */
const HIT_WIDTH = 6;
const TICK_FONT_SIZE = 12;

interface MentionRow {
  readonly id: string;
  readonly term: string;
  readonly x: number;
  readonly date: string;
  readonly count: number;
  readonly highlight: boolean;
}

interface MarkProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: MentionRow;
}

interface TickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly payload?: { readonly value?: string | number };
}

/** Dias desde 1970-01-01 de uma data `YYYY-MM-DD`: o número que o eixo de tempo entende. */
function dayNumber(iso: string): number {
  return Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))) / 86_400_000;
}

/** Primeiro dia de cada mês entre as duas datas, na ordem. */
function monthStarts(start: string, end: string): readonly string[] {
  const starts: string[] = [];
  let year = Number(start.slice(0, 4));
  let month = Number(start.slice(5, 7));
  for (;;) {
    const iso = `${String(year)}-${String(month).padStart(2, '0')}-01`;
    if (iso > end) break;
    if (iso >= start) starts.push(iso);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return starts;
}

function pluralMentions(count: number): string {
  return `${formatInt(count)} ${count === 1 ? 'menção' : 'menções'}`;
}

/** Traço vertical com a altura da banda. A altura vem da área de plotagem dividida pelo número de faixas. */
function Mark({ cx, cy, payload, bands }: MarkProps & { readonly bands: number }) {
  const area = usePlotArea();
  if (cx === undefined || cy === undefined || !payload || !area) return null;
  const band = area.height / bands;
  const half = Math.max(MARK_MIN_HEIGHT, band * MARK_BAND_SHARE) / 2;
  const opacity = 1 - (1 - MARK_BASE_OPACITY) ** payload.count;
  /* O neutro é --text-muted, e não --line-strong: o contraste de --line-strong é 1,79:1 e some como traço (TOK-5). */
  const color = payload.highlight ? 'var(--chart-1)' : 'var(--text-muted)';
  return (
    <g>
      {/* Alvo invisível da dica: fill none com pointerEvents all, porque fillOpacity 0 numa cor de dado reprova a ACE-5. */}
      <rect fill="none" pointerEvents="all" height={band} width={HIT_WIDTH} x={cx - HIT_WIDTH / 2} y={cy - band / 2} />
      <line stroke={color} strokeOpacity={opacity} strokeWidth={payload.highlight ? HIGHLIGHT_STROKE_WIDTH : MARK_STROKE_WIDTH} x1={cx} x2={cx} y1={cy - half} y2={cy + half} />
    </g>
  );
}

function TermTick({ x, y, payload, highlighted }: TickProps & { readonly highlighted: boolean }) {
  if (x === undefined || y === undefined) return null;
  return (
    <text
      dominantBaseline="central"
      fill={highlighted ? 'var(--text-primary)' : 'var(--text-secondary)'}
      fontSize={TICK_FONT_SIZE}
      fontWeight={highlighted ? 700 : 400}
      textAnchor="end"
      x={Number(x) - 8}
      y={y}
    >
      {String(payload?.value ?? '')}
    </text>
  );
}

interface CountLine {
  readonly term: string;
  readonly text: string;
  readonly highlighted: boolean;
}

/**
 * Contagem escrita à direita de cada faixa, em Space Grotesk com algarismo tabular (TIP-1). É um
 * filho do gráfico que lê a área de plotagem, e não um segundo YAxis: um eixo à direita sem série
 * ligada a ele não desenha tique nenhum, e a contagem sumia em silêncio. A ordem de `lines` é a do
 * domínio do eixo de categoria, de cima para baixo.
 */
function CountColumn({ lines }: { readonly lines: readonly CountLine[] }) {
  const area = usePlotArea();
  if (!area || lines.length === 0) return null;
  const band = area.height / lines.length;
  return (
    <g>
      {lines.map((line, index) => (
        <text
          className="font-display"
          dominantBaseline="central"
          fill={line.highlighted ? 'var(--text-primary)' : 'var(--text-muted)'}
          fontSize={TICK_FONT_SIZE}
          fontWeight={line.highlighted ? 700 : 500}
          key={line.term}
          x={area.x + area.width + 12}
          y={area.y + band * (index + 0.5)}
        >
          {line.text}
        </text>
      ))}
    </g>
  );
}

/** Data `YYYY-MM-DD` do dia anterior ao número de dia dado, sem relógio: só aritmética sobre a data do dado. */
function isoOfDay(day: number): string {
  return new Date(day * 86_400_000).toISOString().slice(0, 10);
}

export default function TermDispersion({ data = defaultData, height, className }: TermDispersionProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const eventDay = dayNumber(data.eventDate);

  const series = data.series.map((item) => {
    const mentions = item.mentions.map((mention) => ({ ...mention, day: dayNumber(mention.date) }));
    const sumOf = (list: typeof mentions) => list.reduce((sum, mention) => sum + mention.count, 0);
    const before = sumOf(mentions.filter((mention) => mention.day < eventDay));
    const after = sumOf(mentions.filter((mention) => mention.day >= eventDay));
    return { ...item, before, after, total: before + after, highlight: item.id === data.highlightId };
  });
  const totalMentions = series.reduce((sum, item) => sum + item.total, 0);

  if (totalMentions === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma menção neste recorte: não há termo com data para desenhar.</span>
      </div>
    );
  }

  /* O termo em destaque vai para o alto, que é a primeira linha que o olho encontra, e os outros
     seguem por total. A ordem das faixas é a da primeira aparição de cada termo nas linhas do
     Scatter, e o primeiro vai para a BASE (REC-3); o `domain` do YAxis de categoria não reordena,
     observado neste componente. Por isso as linhas entram do último para o primeiro do ranking. */
  const ranked = [...series].sort((a, b) => Number(b.highlight) - Number(a.highlight) || b.total - a.total);
  const byTerm = new Map(ranked.map((item) => [item.term, item] as const));
  const rows: MentionRow[] = [...ranked].reverse().flatMap((item) =>
    item.mentions.map((mention) => ({ id: `${item.id}-${mention.date}`, term: item.term, x: dayNumber(mention.date) + 0.5, date: mention.date, count: mention.count, highlight: item.highlight })),
  );
  const monthIsoByTick = new Map(monthStarts(data.start, data.end).map((iso) => [dayNumber(iso), iso] as const));
  const ticks = [...monthIsoByTick.keys()];
  const focus = ranked.find((item) => item.highlight);
  const beforeDays = eventDay - dayNumber(data.start);
  const afterDays = dayNumber(data.end) - eventDay + 1;

  const summary = [
    `Dispersão lexical de ${formatInt(series.length)} termos de perda de ${formatDate(data.start)} a ${formatDate(data.end)}, com o reajuste de taxa em ${formatDate(data.eventDate)}.`,
    focus ? `O termo ${focus.term} teve ${pluralMentions(focus.before)} antes e ${pluralMentions(focus.after)} depois, ${beforeDays === afterDays ? 'em janelas de mesma duração' : `em janelas de ${formatDays(beforeDays)} e ${formatDays(afterDays)}`}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as MentionRow | undefined;
    if (!row) return null;
    const entries = [{ dataKey: 'count', name: row.term, value: pluralMentions(row.count) }] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={formatDate(row.date)} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  const countText = (term: string): string => {
    const item = byTerm.get(term);
    return item ? `${formatInt(item.before)} antes, ${formatInt(item.after)} depois` : '';
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="x"
              domain={[dayNumber(data.start), dayNumber(data.end) + 1]}
              height={X_AXIS_HEIGHT}
              interval={0}
              name="Data"
              tickFormatter={(value: number) => formatMonthShort(monthIsoByTick.get(value) ?? data.start)}
              tickMargin={8}
              ticks={ticks}
              type="number"
            />
            {/* allowDuplicatedCategory={false}: sem isso cada linha do Scatter abre uma banda nova (REC-14). */}
            <YAxis
              {...AXIS_PROPS}
              allowDuplicatedCategory={false}
              axisLine={false}
              dataKey="term"
              interval={0}
              name="Termo"
              tick={(props: TickProps) => <TermTick {...props} highlighted={byTerm.get(String(props.payload?.value ?? ''))?.highlight === true} />}
              type="category"
              width={Y_AXIS_WIDTH}
            />
            <CountColumn lines={ranked.map((item) => ({ term: item.term, text: countText(item.term), highlighted: item.highlight }))} />
            {/* extendDomain: a referência fica visível mesmo que o evento caia fora do recorte (REC-1). */}
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{ value: `${data.eventLabel}, ${formatDate(data.eventDate)}`, position: 'top', offset: 6, fill: 'var(--text-secondary)', fontSize: 11 }}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              x={eventDay}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={rows} isAnimationActive={animate} shape={(props: MarkProps) => <Mark {...props} bands={ranked.length} />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-1 shrink-0 font-display text-[0.6875rem] tabular-nums text-text-muted">
        {`Antes: ${formatDate(data.start)} a ${formatDate(isoOfDay(eventDay - 1))}, ${formatDays(beforeDays)}. Depois: ${formatDate(data.eventDate)} a ${formatDate(data.end)}, ${formatDays(afterDays)}.`}
      </p>
      <p aria-hidden className="shrink-0 text-[0.6875rem] text-text-muted">
        Contagem em menções; cada traço é um dia com menção, e o traço mais forte tem mais de uma menção no dia
      </p>
    </div>
  );
}
