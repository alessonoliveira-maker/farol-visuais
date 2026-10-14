import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  ReferenceArea,
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
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, SLA_CEILING, type SlaRow } from './data';

/**
 * Pequenos múltiplos de dot plot: um painel por semana, com os mesmos 8 SDRs nas linhas, o mesmo
 * domínio em minutos e o teto de SLA na mesma posição em todos. SDR sem lead na semana aparece como
 * anel vazado fora da escala, nunca como zero; a semana inteira sem lead mantém o painel na grade.
 */
export interface SlaPanelsProps {
  readonly data?: readonly SlaRow[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 8, right: 20, bottom: 0, left: 14 } as const;
const NAME_COLUMN_WIDTH = 104;
const X_AXIS_HEIGHT = 24;
const ROW_STEP = 21;
const TITLE_HEIGHT = 16;
const DOT_RADIUS = 4.5;
const RING_RADIUS = 4;
/** O anel mora 8 px à esquerda do zero da escala: fora do domínio, nunca legível como 0 min. */
const RING_OFFSET = 8;
const NO_LEAD_TEXT_GAP = 6;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 3 } as const;

interface SlaPoint {
  readonly x: number;
  readonly y: number;
  readonly row: SlaRow;
}

interface PointShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: SlaPoint;
}

interface PanelProps {
  readonly week: string;
  readonly rows: readonly SlaRow[];
  readonly sdrs: readonly string[];
  readonly domainMax: number;
  readonly animate: boolean;
}

/** Maior valor de uma lista; lista vazia devolve null, nunca zero (EST-1b). */
function maxOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
}

/** Domínio calculado uma vez sobre o conjunto inteiro e arredondado ao múltiplo do teto (EIX-9). */
function sharedDomainMax(rows: readonly SlaRow[]): number {
  const measured = rows.flatMap((row) => (row.minutes === null ? [] : [row.minutes]));
  const top = maxOf(measured);
  return Math.max(2, Math.ceil(Math.max(top ?? 0, SLA_CEILING) / SLA_CEILING)) * SLA_CEILING;
}

function minutesText(minutes: number): string {
  return `${formatInt(minutes)} min`;
}

/** Banda inteira da linha como área sensível, sem pintura (`pointerEvents="all"`). */
function HitBand({ cy }: { readonly cy: number }): ReactElement | null {
  const area = usePlotArea();
  if (area === undefined) return null;
  return <rect fill="none" height={ROW_STEP} pointerEvents="all" width={area.width} x={area.x} y={cy - ROW_STEP / 2} />;
}

function MeasuredShape({ cx, cy, payload }: PointShapeProps): ReactElement | null {
  if (cx === undefined || cy === undefined || payload === undefined || payload.row.minutes === null) return null;
  const over = payload.row.minutes > SLA_CEILING;
  return (
    <g>
      <HitBand cy={cy} />
      <circle cx={cx} cy={cy} fill={over ? 'var(--negative)' : 'var(--chart-1)'} r={DOT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} />
    </g>
  );
}

/** Anel vazado de SDR sem lead; o texto por linha só entra quando o painel não é de semana vazia. */
function NoLeadShape({ cx, cy, showText }: PointShapeProps & { readonly showText: boolean }): ReactElement | null {
  if (cx === undefined || cy === undefined) return null;
  return (
    <g>
      <HitBand cy={cy} />
      <circle cx={cx - RING_OFFSET} cy={cy} fill="none" r={RING_RADIUS} stroke="var(--text-muted)" strokeWidth={1.5} />
      {showText ? (
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} style={HALO} x={cx + NO_LEAD_TEXT_GAP} y={cy}>
          sem lead
        </text>
      ) : null}
    </g>
  );
}

/** Nota do painel de semana vazia, centrada na área de plotagem. */
function EmptyWeekNote(): ReactElement | null {
  const area = usePlotArea();
  if (area === undefined) return null;
  return (
    <text
      className="font-sans"
      dominantBaseline="central"
      fill="var(--text-secondary)"
      fontSize={11}
      fontWeight={500}
      style={HALO}
      textAnchor="middle"
      x={area.x + area.width / 2}
      y={area.y + area.height / 2}
    >
      {/* Duas linhas: a frase inteira numa só passa da largura do painel de seis colunas. */}
      <tspan dy="-0.6em" x={area.x + area.width / 2}>
        sem lead
      </tspan>
      <tspan dy="1.2em" x={area.x + area.width / 2}>
        na semana
      </tspan>
    </text>
  );
}

function WeekPanel({ week, rows, sdrs, domainMax, animate }: PanelProps): ReactElement {
  const measured: SlaPoint[] = [];
  const noLead: SlaPoint[] = [];
  rows.forEach((row) => {
    const y = sdrs.indexOf(row.sdr);
    if (row.minutes === null) noLead.push({ x: 0, y, row });
    else measured.push({ x: row.minutes, y, row });
  });
  const emptyWeek = measured.length === 0;
  const ticks = Array.from({ length: domainMax / SLA_CEILING + 1 }, (_, index) => index * SLA_CEILING);

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = (props.payload?.[0]?.payload as SlaPoint | undefined)?.row;
    if (!row) return null;
    const over = row.minutes === null ? 0 : row.minutes - SLA_CEILING;
    const entries = [
      { dataKey: 'week', name: 'Semana de', value: formatDate(row.week) },
      { dataKey: 'minutes', name: 'Primeiro contato', value: row.minutes === null ? 'sem lead na semana' : minutesText(row.minutes) },
      ...(row.minutes === null
        ? []
        : [{ dataKey: 'ceiling', name: 'Contra o teto', value: over === 0 ? 'no teto' : `${minutesText(Math.abs(over))} ${over > 0 ? 'acima' : 'abaixo'}` }]),
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.sdr} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div className="min-w-0">
      <p className="kpi-number text-[0.6875rem] text-text-muted" style={{ height: TITLE_HEIGHT, paddingLeft: MARGIN.left }}>
        {formatDate(week)}
      </p>
      <div style={{ height: MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + sdrs.length * ROW_STEP }}>
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            {/* Zebra atrás da grade: o padrão da ReferenceArea (zIndex 100) pintaria sobre as linhas de grade (zIndex −100) e as apagaria. */}
            {sdrs.map((sdr, index) =>
              index % 2 === 1 ? <ReferenceArea fill="var(--surface-sunken)" ifOverflow="visible" key={sdr} stroke="none" y1={index - 0.5} y2={index + 0.5} zIndex={-150} /> : null,
            )}
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="x"
              domain={[0, domainMax]}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => (value === domainMax ? minutesText(value) : formatInt(value))}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              type="number"
            />
            {/* Eixo de linhas escondido e igual nos seis painéis: `reversed` põe o primeiro SDR no alto. */}
            <YAxis dataKey="y" domain={[-0.5, sdrs.length - 0.5]} hide reversed type="number" />
            {/* zIndex abaixo dos pontos e dos textos: o halo de "sem lead" e "na semana" cobre o tracejado. */}
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--text-muted)" strokeDasharray="3 3" x={SLA_CEILING} zIndex={-50} />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={noLead} isAnimationActive={animate} shape={(props: PointShapeProps) => <NoLeadShape {...props} showText={!emptyWeek} />} />
            <Scatter data={measured} isAnimationActive={animate} shape={(props: PointShapeProps) => <MeasuredShape {...props} />} />
            {emptyWeek ? <EmptyWeekNote /> : null}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LegendSwatch({ kind }: { readonly kind: 'dot' | 'over' | 'ring' | 'ceiling' }): ReactElement {
  return (
    <svg aria-hidden className="shrink-0" height={12} width={16}>
      {kind === 'dot' ? <circle cx={8} cy={6} fill="var(--chart-1)" r={DOT_RADIUS} /> : null}
      {kind === 'over' ? <circle cx={8} cy={6} fill="var(--negative)" r={DOT_RADIUS} /> : null}
      {kind === 'ring' ? <circle cx={8} cy={6} fill="none" r={RING_RADIUS} stroke="var(--text-muted)" strokeWidth={1.5} /> : null}
      {kind === 'ceiling' ? <line stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1} x1={0} x2={16} y1={6} y2={6} /> : null}
    </svg>
  );
}

export default function SlaPanels({ data = defaultData, height, className }: SlaPanelsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum SDR neste recorte: não há semana com primeiro contato para comparar.</span>
      </div>
    );
  }

  const weeks = [...new Set(data.map((row) => row.week))].sort();
  const sdrs = [...new Set(data.map((row) => row.sdr))];
  const domainMax = sharedDomainMax(data);
  const measuredRows = data.filter((row) => row.minutes !== null);
  const overRows = measuredRows.filter((row) => (row.minutes ?? 0) > SLA_CEILING);
  const worst = [...overRows].sort((a, b) => (b.minutes ?? 0) - (a.minutes ?? 0))[0];
  const emptyWeeks = weeks.filter((week) => data.filter((row) => row.week === week).every((row) => row.minutes === null));

  const readingLine =
    worst === undefined
      ? `Nenhuma das ${formatInt(measuredRows.length)} medições passou do teto de ${minutesText(SLA_CEILING)}`
      : `${formatInt(overRows.length)} de ${formatInt(measuredRows.length)} medições passaram do teto de ${minutesText(SLA_CEILING)}; a pior foi ${worst.sdr}, com ${minutesText(worst.minutes ?? 0)}, na semana de ${formatDate(worst.week)}`;
  const summary = [
    `Gráfico de pontos, um painel por semana, com o primeiro contato de ${formatInt(sdrs.length)} SDRs.`,
    `${readingLine}.`,
    emptyWeeks.length === 0 ? '' : `Sem lead em nenhum SDR na semana de ${emptyWeeks.map((week) => formatDate(week)).join(', ')}.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {readingLine}
      </p>
      <div className="grid shrink-0" style={{ gridTemplateColumns: `${NAME_COLUMN_WIDTH}px repeat(${weeks.length}, minmax(0, 1fr))` }}>
        <div>
          <div style={{ height: TITLE_HEIGHT }} />
          <div style={{ paddingTop: MARGIN.top }}>
            {sdrs.map((sdr) => (
              <p className="flex items-center whitespace-nowrap text-xs font-medium text-text-secondary" key={sdr} style={{ height: ROW_STEP }}>
                {sdr}
              </p>
            ))}
          </div>
        </div>
        {weeks.map((week) => (
          <WeekPanel animate={animate} domainMax={domainMax} key={week} rows={data.filter((row) => row.week === week)} sdrs={sdrs} week={week} />
        ))}
      </div>
      <div aria-hidden className="mt-2 flex shrink-0 items-center gap-5 text-[0.6875rem] text-text-muted">
        <span className="flex items-center gap-1.5">
          <LegendSwatch kind="dot" />
          minutos até o primeiro contato
        </span>
        <span className="flex items-center gap-1.5">
          <LegendSwatch kind="over" />
          acima do teto
        </span>
        <span className="flex items-center gap-1.5">
          <LegendSwatch kind="ring" />
          sem lead na semana
        </span>
        <span className="flex items-center gap-1.5">
          <LegendSwatch kind="ceiling" />
          teto de SLA, {minutesText(SLA_CEILING)}
        </span>
      </div>
    </div>
  );
}
