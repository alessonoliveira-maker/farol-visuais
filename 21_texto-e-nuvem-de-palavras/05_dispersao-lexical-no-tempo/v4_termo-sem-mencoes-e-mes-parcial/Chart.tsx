import { Filter, Unplug } from 'lucide-react';
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  usePlotArea,
  useXAxisScale,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LexicalDispersion } from './data';

/**
 * Dispersão lexical de termos de formulário com três casos difíceis: um termo sem nenhuma menção
 * mantém a faixa e escreve "sem menções" (zero medido), uma semana sem coleta vira um quadro
 * tracejado com a palavra "indisponível" (ausência, que não é zero), e o mês corrente fica num
 * poço rebaixado com a nota "parcial até" a data de corte. Dois traços no mesmo dia se somam como
 * duas camadas translúcidas: a opacidade de N menções é 1 - (1 - base)^N.
 */
export interface FormTermDispersionProps {
  readonly data?: LexicalDispersion;
  readonly height?: number;
  readonly className?: string;
}

/** O topo reserva a linha das duas notas de período, fora das faixas (REC-4). */
const MARGIN = { top: 22, right: 96, bottom: 4, left: 8 } as const;
const Y_AXIS_WIDTH = 96;
const X_AXIS_HEIGHT = 24;
/** Fração da banda que o traço ocupa, para duas faixas vizinhas nunca se encostarem. */
const MARK_BAND_SHARE = 0.7;
const MARK_MIN_HEIGHT = 6;
const MARK_STROKE_WIDTH = 1;
/** Opacidade de uma menção: acima do piso de 0,66 de --chart-1 (ACE-5, 3:1 no tema claro). */
const MARK_BASE_OPACITY = 0.75;
/** Largura do alvo invisível da dica: um traço de 1 px sozinho não se acerta com o cursor. */
const HIT_WIDTH = 6;
const TICK_FONT_SIZE = 12;
const NOTE_FONT_SIZE = 11;

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

interface BandLine {
  readonly term: string;
  readonly total: number;
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

/** Traço vertical com a altura da banda. A linha de placeholder do termo sem menção (contagem 0) não desenha traço. */
function Mark({ cx, cy, payload, bands }: MarkProps & { readonly bands: number }) {
  const area = usePlotArea();
  if (cx === undefined || cy === undefined || !payload || !area || payload.count === 0) return null;
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

/**
 * Total à direita de cada faixa: "sem menções" no zero medido. É filho do gráfico e lê a área de
 * plotagem, porque um segundo YAxis sem série ligada não desenha tique. A ordem de `lines` é a
 * das faixas, de cima para baixo.
 */
function BandColumn({ lines }: { readonly lines: readonly BandLine[] }) {
  const area = usePlotArea();
  if (!area || lines.length === 0) return null;
  const band = area.height / lines.length;
  return (
    <g>
      {lines.map((line, index) => {
        const y = area.y + band * (index + 0.5);
        return (
          <g key={line.term}>
            <text
              className="font-display"
              dominantBaseline="central"
              fill={line.total === 0 ? 'var(--text-secondary)' : 'var(--text-muted)'}
              fontSize={NOTE_FONT_SIZE}
              fontWeight={500}
              x={area.x + area.width + 8}
              y={y}
            >
              {line.total === 0 ? 'sem menções' : pluralMentions(line.total)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** As duas notas de período, escritas na margem reservada acima da área de plotagem. */
function PeriodNotes({ gaps, end, asOf, partial }: { readonly gaps: readonly { readonly from: number; readonly to: number }[]; readonly end: number; readonly asOf: string; readonly partial: boolean }) {
  const area = usePlotArea();
  const scale = useXAxisScale();
  if (!area || !scale) return null;
  const monthEnd = scale(end + 1);
  if (monthEnd === undefined) return null;
  return (
    <g>
      {gaps.map((gap) => {
        const center = scale((gap.from + gap.to + 1) / 2);
        if (center === undefined) return null;
        return (
          <text dominantBaseline="auto" fill="var(--text-secondary)" fontSize={NOTE_FONT_SIZE} key={gap.from} textAnchor="middle" x={center} y={area.y - 6}>
            {formatUnavailable()}
          </text>
        );
      })}
      {partial ? (
        <text className="font-display" dominantBaseline="auto" fill="var(--text-secondary)" fontSize={NOTE_FONT_SIZE} textAnchor="end" x={monthEnd} y={area.y - 6}>
          {`parcial até ${formatDate(asOf)}`}
        </text>
      ) : null}
    </g>
  );
}

export default function FormTermDispersion({ data = defaultData, height, className }: FormTermDispersionProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const series = data.series.map((item) => ({ ...item, total: item.mentions.reduce((sum, mention) => sum + mention.count, 0) }));
  const totalMentions = series.reduce((sum, item) => sum + item.total, 0);

  if (totalMentions === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma menção neste recorte: não há termo com data para desenhar, e o desenho não distinguiria zero de coleta parada.</span>
      </div>
    );
  }

  /* Mais citado no alto e o termo sem menção por último. A ordem das faixas é a da primeira aparição
     de cada termo nas linhas do Scatter, e o primeiro vai para a BASE (REC-3, observado neste
     componente), por isso as linhas entram do último para o primeiro do ranking. O termo sem menção
     entra com uma linha de contagem 0 no começo do eixo: sem ela o eixo de categoria não abre a faixa. */
  const ranked = [...series].sort((a, b) => b.total - a.total);
  const startDay = dayNumber(data.start);
  const rows: MentionRow[] = [...ranked].reverse().flatMap((item) =>
    item.mentions.length === 0
      ? [{ id: `${item.id}-vazio`, term: item.term, x: startDay, date: data.start, count: 0 }]
      : item.mentions.map((mention) => ({ id: `${item.id}-${mention.date}`, term: item.term, x: dayNumber(mention.date) + 0.5, date: mention.date, count: mention.count })),
  );
  const monthIsoByTick = new Map(monthStarts(data.start, data.end).map((iso) => [dayNumber(iso), iso] as const));
  const ticks = [...monthIsoByTick.keys()];
  const monthStart = monthStarts(data.start, data.end).filter((iso) => iso <= data.asOf).pop() ?? data.start;
  const gaps = data.gaps;
  const partial = data.asOf < data.end;
  const gapPhrase = `${formatInt(gaps.length)} ${gaps.length === 1 ? 'período' : 'períodos'}`;
  const leader = ranked[0];
  const emptyTerms = ranked.filter((item) => item.total === 0).map((item) => item.term);

  const summary = [
    `Dispersão lexical de ${formatInt(series.length)} termos de formulário de ${formatDate(data.start)} a ${formatDate(data.end)}, com ${formatInt(totalMentions)} menções até ${formatDate(data.asOf)}.`,
    leader ? `O termo ${leader.term} lidera, com ${pluralMentions(leader.total)}.` : '',
    emptyTerms.length === 0 ? '' : `Sem menções: ${emptyTerms.join(', ')}.`,
    gaps.length === 0
      ? ''
      : `Sem coleta em ${gapPhrase}: ${gaps.map((gap) => `${formatDate(gap.from)} a ${formatDate(gap.to)}`).join(', ')}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as MentionRow | undefined;
    if (!row || row.count === 0) return null;
    const entries = [{ dataKey: 'count', name: row.term, value: pluralMentions(row.count) }] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={formatDate(row.date)} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            {/* Mês corrente: poço rebaixado, nunca --surface-overlay, que no claro é o branco do cartão (ANO-4). */}
            {partial ? <ReferenceArea fill="var(--surface-sunken)" fillOpacity={1} ifOverflow="extendDomain" x1={dayNumber(monthStart)} x2={dayNumber(data.end) + 1} /> : null}
            {gaps.map((gap) => (
              <ReferenceArea fill="none" ifOverflow="extendDomain" key={gap.from} stroke="var(--text-muted)" strokeDasharray="4 4" x1={dayNumber(gap.from)} x2={dayNumber(gap.to) + 1} />
            ))}
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="x"
              domain={[startDay, dayNumber(data.end) + 1]}
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
            {/* Trilho de cada faixa, depois das ReferenceArea para o poço do mês corrente não cobri-lo. Existe para a
                faixa do termo sem menção não virar só um espaço: o zero medido leva o trilho em --text-muted. */}
            {ranked.map((item) => (
              <ReferenceLine ifOverflow="extendDomain" key={item.id} stroke={item.total === 0 ? 'var(--text-muted)' : 'var(--line-subtle)'} y={item.term} />
            ))}
            <BandColumn lines={ranked.map((item) => ({ term: item.term, total: item.total }))} />
            <PeriodNotes asOf={data.asOf} end={dayNumber(data.end)} gaps={gaps.map((gap) => ({ from: dayNumber(gap.from), to: dayNumber(gap.to) }))} partial={partial} />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={rows} isAnimationActive={animate} shape={(props: MarkProps) => <Mark {...props} bands={ranked.length} />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {gaps.length > 0 ? (
        <p aria-hidden className="mt-1 flex shrink-0 items-center gap-1.5 text-[0.6875rem] text-text-muted">
          <Unplug aria-hidden className="size-3 shrink-0" />
          {`Quadro tracejado: período sem coleta, ${formatUnavailable()} e diferente de zero`}
        </p>
      ) : null}
    </div>
  );
}
