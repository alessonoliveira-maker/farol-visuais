import { Filter } from 'lucide-react';
import {
  CartesianGrid,
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
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LexicalDispersion } from './data';

/**
 * Dispersão lexical no tempo: uma faixa por termo e um traço vertical por dia com menção, na
 * posição da data. Lê-se quando o termo começou, quando adensou e quando sumiu, todos no mesmo
 * eixo de tempo. O traço é translúcido, e dois traços no mesmo dia se somam como se fossem dois
 * traços empilhados: a opacidade de N menções é 1 - (1 - base)^N.
 */
export interface TermDispersionProps {
  readonly data?: LexicalDispersion;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 8, right: 16, bottom: 4, left: 8 } as const;
const Y_AXIS_WIDTH = 124;
const X_AXIS_HEIGHT = 24;
/** Fração da banda que o traço ocupa, para duas faixas vizinhas nunca se encostarem. */
const MARK_BAND_SHARE = 0.7;
const MARK_MIN_HEIGHT = 6;
const MARK_STROKE_WIDTH = 1;
/** Opacidade de uma menção: acima do piso de 0,66 de --chart-1 (ACE-5), que no claro mede 3:1. */
const MARK_BASE_OPACITY = 0.72;
/** Largura do alvo invisível da dica: um traço de 1 px sozinho não se acerta com o cursor. */
const HIT_WIDTH = 6;
const TICK_FONT_SIZE = 12;

interface MentionRow {
  readonly id: string;
  readonly term: string;
  readonly x: number;
  readonly date: string;
  readonly count: number;
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
  return (
    <g>
      {/* Alvo invisível da dica: fill none com pointerEvents all, porque fillOpacity 0 numa cor de dado reprova a ACE-5. */}
      <rect fill="none" pointerEvents="all" height={band} width={HIT_WIDTH} x={cx - HIT_WIDTH / 2} y={cy - band / 2} />
      <line stroke="var(--chart-1)" strokeOpacity={opacity} strokeWidth={MARK_STROKE_WIDTH} x1={cx} x2={cx} y1={cy - half} y2={cy + half} />
    </g>
  );
}

function TermTick({ x, y, payload }: TickProps) {
  if (x === undefined || y === undefined) return null;
  return (
    <text dominantBaseline="central" fill="var(--text-secondary)" fontSize={TICK_FONT_SIZE} textAnchor="end" x={Number(x) - 8} y={y}>
      {String(payload?.value ?? '')}
    </text>
  );
}

export default function TermDispersion({ data = defaultData, height, className }: TermDispersionProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const series = data.series.map((item) => ({
    ...item,
    total: item.mentions.reduce((sum, mention) => sum + mention.count, 0),
  }));
  const totalMentions = series.reduce((sum, item) => sum + item.total, 0);

  if (totalMentions === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma menção neste recorte: não há termo com data para desenhar.</span>
      </div>
    );
  }

  /* Termo com mais menções no alto. A ordem das faixas é a da primeira aparição de cada termo nas
     linhas do Scatter, e o primeiro vai para a BASE (REC-3); o `domain` do YAxis de categoria não
     reordena, observado neste componente. Por isso as linhas entram do menos citado ao mais citado. */
  const ranked = [...series].sort((a, b) => b.total - a.total);
  const rows: MentionRow[] = [...ranked].reverse().flatMap((item) =>
    item.mentions.map((mention) => ({ id: `${item.id}-${mention.date}`, term: item.term, x: dayNumber(mention.date), date: mention.date, count: mention.count })),
  );
  const monthIsoByTick = new Map(monthStarts(data.start, data.end).map((iso) => [dayNumber(iso), iso] as const));
  const ticks = [...monthIsoByTick.keys()];
  const leader = ranked[0];
  const quietest = [...ranked].reverse().find((item) => item.total > 0);
  const daysWithMention = new Set(rows.map((row) => row.date)).size;

  const summary = [
    `Dispersão lexical de ${formatInt(series.length)} termos de perda de ${formatDate(data.start)} a ${formatDate(data.end)}, com ${formatInt(totalMentions)} menções em ${formatInt(daysWithMention)} dias.`,
    leader ? `O termo ${leader.term} lidera, com ${pluralMentions(leader.total)}.` : '',
    quietest ? `O termo ${quietest.term} é o mais raro, com ${pluralMentions(quietest.total)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as MentionRow | undefined;
    if (!row) return null;
    const entries = [{ dataKey: 'count', name: row.term, value: pluralMentions(row.count) }] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={formatDate(row.date)} labelFormat="text" payload={entries} valueFormat="text" />;
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
              domain={[dayNumber(data.start), dayNumber(data.end)]}
              height={X_AXIS_HEIGHT}
              interval={0}
              name="Data"
              tickFormatter={(value: number) => formatMonthShort(monthIsoByTick.get(value) ?? data.start)}
              tickMargin={8}
              ticks={ticks}
              type="number"
            />
            {/* allowDuplicatedCategory={false}: sem isso cada linha do Scatter abre uma banda nova (REC-14). */}
            <YAxis {...AXIS_PROPS} allowDuplicatedCategory={false} axisLine={false} dataKey="term" interval={0} name="Termo" tick={TermTick} type="category" width={Y_AXIS_WIDTH} />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={rows} isAnimationActive={animate} shape={(props: MarkProps) => <Mark {...props} bands={ranked.length} />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-1 shrink-0 text-[0.6875rem] text-text-muted">
        Cada traço é um dia com menção; traço mais forte, mais de uma menção no dia
      </p>
    </div>
  );
}
