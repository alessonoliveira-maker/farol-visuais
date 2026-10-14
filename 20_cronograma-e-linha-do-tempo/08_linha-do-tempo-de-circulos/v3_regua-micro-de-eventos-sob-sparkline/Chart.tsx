import { Filter } from 'lucide-react';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import {
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { CURSOR_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type CplPoint, type MediaEvent, type MediaEventKind, type MediaTimelineData } from './data';

/**
 * Régua de eventos sob um sparkline: o mesmo domínio de tempo e a mesma margem nos dois gráficos,
 * então a semana do degrau do CPL e os eventos ficam na mesma vertical. A régua não tem eixo
 * visível, a forma diz o tipo de evento e eventos que caem no mesmo pixel viram uma marca com
 * contador, cuja lista de nomes vai na dica. O desenho situa eventos no tempo e não afirma efeito.
 */
export interface MediaRulerProps {
  readonly data?: MediaTimelineData;
  readonly height?: number;
  readonly className?: string;
}

interface Mark {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  /** Constante lida pelo ZAxis: com range fixo, a área sai exata (REC-31). */
  readonly z: number;
  readonly members: readonly MediaEvent[];
}

const MARGIN = { top: 4, right: 8, bottom: 4, left: 8 } as const;
const MS_PER_DAY = 86_400_000;
const SPARK_HEIGHT = 56;
const RULER_HEIGHT = 28;
/** Largura de referência do primeiro desenho; o `ResizeObserver` troca pela largura medida. */
const NOMINAL_WIDTH = 302;
/** Marcas a menos de 10 px uma da outra se tocam e viram uma só. */
const MERGE_PX = 10;
const SINGLE_AREA = 70;
const GROUP_RADIUS = 8;
const NEAR_DAYS = 14;
const KINDS: readonly { readonly kind: MediaEventKind; readonly label: string; readonly shape: 'circle' | 'triangle' | 'diamond' }[] = [
  { kind: 'verba', label: 'Verba', shape: 'circle' },
  { kind: 'criativo', label: 'Criativo', shape: 'triangle' },
  { kind: 'canal', label: 'Canal', shape: 'diamond' },
];
const SHAPE_PATHS = { circle: '', triangle: '5,0 10,9 0,9', diamond: '5,0 10,5 5,10 0,5' } as const;

function toMs(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Largura medida do elemento, com o valor nominal até a primeira medição. */
function useElementWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(NOMINAL_WIDTH);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    setWidth(node.clientWidth || NOMINAL_WIDTH);
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (next) setWidth(next);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);
  return { ref, width };
}

/** Menor e maior valor da lista, ou `null` quando ela é vazia (EST-1b). */
function extentOf(values: readonly number[]): readonly [number, number] | null {
  const first = values[0];
  if (first === undefined) return null;
  return values.reduce<readonly [number, number]>((acc, value) => [Math.min(acc[0], value), Math.max(acc[1], value)], [first, first]);
}

/** Maior queda entre semanas seguidas, ou `null` com menos de duas semanas (EST-1b). */
function biggestDrop(series: readonly CplPoint[]): { readonly from: number; readonly to: number; readonly week: string } | null {
  let best: { from: number; to: number; week: string } | null = null;
  series.forEach((point, index) => {
    const previous = series[index - 1];
    if (!previous) return;
    const drop = previous.cpl - point.cpl;
    if (drop > 0 && (best === null || drop > best.from - best.to)) best = { from: previous.cpl, to: point.cpl, week: point.week };
  });
  return best;
}

/** Agrupa eventos ordenados por data quando a distância na régua é menor que `MERGE_PX`. */
function groupEvents(events: readonly MediaEvent[], domain: readonly [number, number], plotWidth: number): Mark[] {
  const span = domain[1] - domain[0];
  const pxOf = (ms: number) => (span > 0 ? ((ms - domain[0]) / span) * plotWidth : 0);
  const sorted = [...events].sort((a, b) => toMs(a.date) - toMs(b.date));
  const groups: MediaEvent[][] = [];
  let startPx = Number.NEGATIVE_INFINITY;
  sorted.forEach((event) => {
    const px = pxOf(toMs(event.date));
    const current = groups[groups.length - 1];
    if (current && px - startPx < MERGE_PX) {
      current.push(event);
    } else {
      groups.push([event]);
      startPx = px;
    }
  });
  return groups.map((members) => ({
    id: members.map((member) => member.id).join('+'),
    x: (toMs(members[0]?.date ?? '') + toMs(members[members.length - 1]?.date ?? '')) / 2,
    y: 0,
    z: 1,
    members,
  }));
}

/** Marca de eventos agrupados: círculo maior com o número de eventos dentro. */
function GroupMark({ cx, cy, payload }: { readonly cx?: number; readonly cy?: number; readonly payload?: Mark }): ReactElement | null {
  if (cx === undefined || cy === undefined || !payload) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} fill="var(--chart-1)" r={GROUP_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} />
      <text className="font-display" fill="var(--accent-cyan-contrast)" fontSize={11} fontWeight={600} textAnchor="middle" x={cx} y={cy + 4}>
        {formatInt(payload.members.length)}
      </text>
    </g>
  );
}

/** Amostra do agrupado na forma da marca: círculo de GROUP_RADIUS com o algarismo dentro. */
function GroupSwatch(): ReactElement {
  const size = GROUP_RADIUS * 2 + 3;
  const c = size / 2;
  return (
    <svg aria-hidden className="shrink-0" height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
      <circle cx={c} cy={c} fill="var(--chart-1)" r={GROUP_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} />
      <text className="font-display" fill="var(--accent-cyan-contrast)" fontSize={11} fontWeight={600} textAnchor="middle" x={c} y={c + 4}>
        2
      </text>
    </svg>
  );
}

function Swatch({ shape }: { readonly shape: 'circle' | 'triangle' | 'diamond' }): ReactElement {
  return (
    <svg aria-hidden className="shrink-0" height={12} viewBox="-1 -1 12 12" width={12}>
      {shape === 'circle' ? <circle cx={5} cy={5} fill="var(--chart-1)" r={4} /> : <polygon fill="var(--chart-1)" points={SHAPE_PATHS[shape]} />}
    </svg>
  );
}

export default function MediaRuler({ data = defaultData, height, className }: MediaRulerProps) {
  const animate = useAnimateOnce();
  const { ref, width } = useElementWidth();
  const style = height === undefined ? undefined : { height };
  const { cpl, events } = data;

  if (cpl.length < 3) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>CPL sem série suficiente neste recorte: com poucas semanas medidas não há degrau para situar.</span>
      </div>
    );
  }

  const timeSpan = extentOf([...cpl.map((point) => toMs(point.week)), ...events.map((event) => toMs(event.date))]);
  const valueSpan = extentOf(cpl.map((point) => point.cpl));
  if (!timeSpan || !valueSpan) return null;
  const domainX: [number, number] = [timeSpan[0], timeSpan[1]];
  const pad = (valueSpan[1] - valueSpan[0]) * 0.15;
  const domainY: [number, number] = [valueSpan[0] - pad, valueSpan[1] + pad];
  const last = cpl[cpl.length - 1];
  const marks = groupEvents(events, domainX, width - MARGIN.left - MARGIN.right);
  const drop = biggestDrop(cpl);
  const near = drop ? events.filter((event) => Math.abs(toMs(event.date) - toMs(drop.week)) <= NEAR_DAYS * MS_PER_DAY).length : 0;
  const groupsOnly = marks.filter((mark) => mark.members.length > 1);

  const reading = drop
    ? `Maior queda semanal do CPL: ${formatCurrencyCompact(drop.from)} para ${formatCurrencyCompact(drop.to)} em ${formatDate(drop.week)}. ${formatInt(near)} ${near === 1 ? 'evento' : 'eventos'} a até ${formatInt(NEAR_DAYS)} dias da queda.`
    : 'O CPL não caiu de uma semana para a seguinte neste recorte.';

  const summary = [
    `Sparkline do CPL qualificado em ${formatInt(cpl.length)} semanas, de ${formatDate(toIso(domainX[0]))} a ${formatDate(toIso(domainX[1]))}, com régua de ${formatInt(events.length)} eventos de mídia embaixo.`,
    drop ? `A maior queda semanal vai de ${formatCurrencyCompact(drop.from)} a ${formatCurrencyCompact(drop.to)}, na semana de ${formatDate(drop.week)}.` : '',
    groupsOnly.length > 0 ? `${formatInt(groupsOnly.reduce((sum, mark) => sum + mark.members.length, 0))} eventos caem juntos em ${formatInt(groupsOnly.length)} ${groupsOnly.length === 1 ? 'marca' : 'marcas'}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const mark = props.payload?.[0]?.payload as Mark | undefined;
    if (!mark) return null;
    const entries = mark.members.map((member) => ({ dataKey: member.id, name: formatDate(member.date), value: member.name })) as unknown as ChartTooltipProps['payload'];
    const label = mark.members.length > 1 ? `${formatInt(mark.members.length)} eventos de mídia` : 'Evento de mídia';
    return <ChartTooltip active={props.active} label={label} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  const singles = marks.filter((mark) => mark.members.length === 1);

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} ref={ref} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1" style={{ minHeight: SPARK_HEIGHT }}>
        <ResponsiveContainer height="100%" width="100%">
          <LineChart accessibilityLayer={false} data={[...cpl.map((point) => ({ x: toMs(point.week), cpl: point.cpl }))]} margin={MARGIN}>
            <XAxis dataKey="x" domain={domainX} hide type="number" />
            <YAxis dataKey="cpl" domain={domainY} hide type="number" />
            <Line dataKey="cpl" dot={false} isAnimationActive={animate} stroke="var(--chart-1)" strokeWidth={2} type="linear" />
            {/* REC-1: sem extendDomain o ponto final some quando cai na borda do domínio. */}
            {last ? <ReferenceDot fill="var(--chart-1)" ifOverflow="extendDomain" r={3} stroke="var(--surface-raised)" strokeWidth={1.5} x={toMs(last.week)} y={last.cpl} /> : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="shrink-0" style={{ height: RULER_HEIGHT }}>
        {events.length === 0 ? (
          <p aria-hidden className="flex h-full items-center text-[0.6875rem] text-text-muted">
            Nenhum evento de mídia neste recorte.
          </p>
        ) : (
          <ResponsiveContainer height="100%" width="100%">
            <ScatterChart accessibilityLayer={false} margin={MARGIN}>
              <XAxis dataKey="x" domain={domainX} hide type="number" />
              <YAxis dataKey="y" domain={[-1, 1]} hide type="number" />
              {/* REC-15: sem ZAxis registrado a forma volta aos 64 px²; REC-31: o range é área em px². */}
              <ZAxis dataKey="z" domain={[0, 1]} range={[SINGLE_AREA, SINGLE_AREA]} type="number" />
              <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
              {KINDS.map((item) => (
                <Scatter
                  data={singles.filter((mark) => mark.members[0]?.kind === item.kind)}
                  fill="var(--chart-1)"
                  isAnimationActive={animate}
                  key={item.kind}
                  shape={item.shape}
                  stroke="var(--surface-raised)"
                  strokeWidth={1.5}
                />
              ))}
              {/* REC-31: a forma própria nunca recebe raio nem lê o range; o agrupado desenha o próprio círculo e o contador. */}
              <Scatter data={groupsOnly} isAnimationActive={animate} shape={GroupMark} />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
      <div aria-hidden className="mt-1 flex shrink-0 items-center justify-between text-[0.6875rem] text-text-muted" style={{ paddingLeft: MARGIN.left, paddingRight: MARGIN.right }}>
        <span className="font-display tabular-nums">{formatMonthShort(toIso(domainX[0]))}</span>
        <span className="font-display tabular-nums">{formatMonthShort(toIso(domainX[1]))}</span>
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 items-center gap-3 text-[0.6875rem] text-text-muted" style={{ paddingLeft: MARGIN.left }}>
        {KINDS.map((item) => (
          <span className="flex items-center gap-1" key={item.kind}>
            <Swatch shape={item.shape} />
            {item.label}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <GroupSwatch />
          Agrupados
        </span>
      </div>
    </div>
  );
}
