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
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, SCALE_CEILING_MINUTES, SLA_MINUTES, type LeadContact } from './data';

/**
 * Dot plot com a distribuição ao fundo: cada lead de agosto é um ponto pequeno atrás da mediana do
 * SDR, deslocado na vertical por um hash do id (nunca por sorteio), para mostrar quantos casos
 * sustentam o resumo sem abrir um box plot. Os casos acima do teto da escala viram uma marca na
 * borda direita, e o teto de SLA é uma referência única para todas as linhas.
 */
export interface FirstContactPlotProps {
  readonly data?: readonly LeadContact[];
  readonly height?: number;
  readonly className?: string;
}

const X_DOMAIN: [number, number] = [0, SCALE_CEILING_MINUTES];
const X_TICKS = [0, 30, 60, 90, 120];
const MARGIN = { top: 20, right: 204, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 230;
const X_AXIS_HEIGHT = 26;
/** Passo da linha: também é a altura da área sensível ao cursor. */
const ROW_STEP = 30;
/** Largura da nuvem em unidades de linha: 0,7 deixa 0,3 de respiro entre as nuvens vizinhas. */
const JITTER_SPAN = 0.7;
const CASE_RADIUS = 1.5;
/** Opacidade mínima de --text-muted para a marca composta passar de 3:1 nos dois temas (ACE-5). */
const CASE_OPACITY = 0.8;
const MEDIAN_RADIUS = 3.5;
const OVERFLOW_HALF = 3;
const RIGHT_GAP = 8;
const OVERFLOW_COLUMN_OFFSET = 92;
const LOCALE = 'pt-BR';

interface SdrRow {
  readonly rank: number;
  readonly name: string;
  readonly leads: number;
  readonly median: number;
  readonly over: number;
}

interface CasePoint {
  readonly id: string;
  readonly rank: number;
  readonly value: number;
  readonly minutes: number;
  readonly over: boolean;
}

interface ShapeProps<T> {
  readonly cx?: number;
  readonly cy?: number;
  readonly payload?: T;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Mediana de uma lista; lista vazia devolve null, nunca zero (EST-1b). */
function median(values: readonly number[]): number | null {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const upper = sorted[mid];
  if (upper === undefined) return null;
  if (sorted.length % 2 === 1) return upper;
  const lower = sorted[mid - 1];
  return lower === undefined ? null : (lower + upper) / 2;
}

/** FNV-1a de 32 bits: o mesmo id dá sempre o mesmo número em [0, 1), em qualquer máquina. */
function hash01(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  }
  /* Finalizador (murmur3): o FNV puro deixa os últimos caracteres do id quase sem efeito nos bits altos. */
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function minutesText(minutes: number): string {
  return `${formatInt(Math.round(minutes))} min`;
}

/** Uma linha por SDR, na ordem da mediana (a pior no alto); empate pelo nome. */
function buildRows(leads: readonly LeadContact[]): SdrRow[] {
  const bySdr = new Map<string, number[]>();
  for (const lead of leads) {
    const list = bySdr.get(lead.sdr);
    if (list) list.push(lead.minutes);
    else bySdr.set(lead.sdr, [lead.minutes]);
  }
  const rows: Omit<SdrRow, 'rank'>[] = [];
  for (const [name, minutes] of bySdr) {
    const mid = median(minutes);
    if (mid === null) continue;
    rows.push({ name, leads: minutes.length, median: mid, over: minutes.filter((m) => m > SCALE_CEILING_MINUTES).length });
  }
  return rows.sort((a, b) => b.median - a.median || a.name.localeCompare(b.name, LOCALE)).map((row, rank) => ({ ...row, rank }));
}

function NameTick({ y, row }: NameTickProps & { readonly row: SdrRow | undefined }): ReactElement {
  return (
    <g>
      <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
        {row?.name ?? ''}
      </text>
      <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} fontWeight={500} textAnchor="end" x={NAME_AXIS_WIDTH - 12} y={Number(y)}>
        {row ? `${formatInt(row.leads)} leads` : ''}
      </text>
    </g>
  );
}

/** Caso individual: ponto de 3 px, ou uma marca na borda direita quando passou do teto da escala. */
function CaseShape({ cx, cy, payload }: ShapeProps<CasePoint>): ReactElement | null {
  if (cx === undefined || cy === undefined || payload === undefined) return null;
  if (payload.over) {
    const d = `M${String(cx - 2 * OVERFLOW_HALF)} ${String(cy - OVERFLOW_HALF)} L${String(cx)} ${String(cy)} L${String(cx - 2 * OVERFLOW_HALF)} ${String(cy + OVERFLOW_HALF)} Z`;
    return <path d={d} fill="var(--text-muted)" fillOpacity={CASE_OPACITY} />;
  }
  return <circle cx={cx} cy={cy} fill="var(--text-muted)" fillOpacity={CASE_OPACITY} r={CASE_RADIUS} />;
}

/** Mediana opaca por cima da nuvem, mais a banda inteira da linha como alvo do cursor e as duas colunas da direita. */
function MedianShape({ cx, cy, payload }: ShapeProps<SdrRow & { readonly value: number }>): ReactElement | null {
  const area = usePlotArea();
  if (cx === undefined || cy === undefined || payload === undefined || area === undefined) return null;
  const columnX = area.x + area.width + RIGHT_GAP;
  return (
    <g>
      <rect fill="none" height={ROW_STEP} pointerEvents="all" width={area.width} x={area.x} y={cy - ROW_STEP / 2} />
      <circle cx={cx} cy={cy} fill="var(--chart-1)" r={MEDIAN_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} />
      <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={11} fontWeight={600} x={columnX} y={cy}>
        {`mediana ${minutesText(payload.median)}`}
      </text>
      <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={columnX + OVERFLOW_COLUMN_OFFSET} y={cy}>
        {`${formatInt(payload.over)} acima da escala`}
      </text>
    </g>
  );
}

export default function FirstContactPlot({ data = defaultData, height, className }: FirstContactPlotProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = buildRows(data);
  const slowest = rows[0];
  const fastest = rows[rows.length - 1];

  if (!slowest || !fastest) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum SDR neste recorte: não houve lead com primeiro contato no período.</span>
      </div>
    );
  }

  const rankOf = new Map(rows.map((row) => [row.name, row.rank]));
  const cases: CasePoint[] = data.flatMap((lead) => {
    const rank = rankOf.get(lead.sdr);
    if (rank === undefined) return [];
    return [
      {
        id: lead.id,
        rank: rank + (hash01(lead.id) - 0.5) * JITTER_SPAN,
        value: Math.min(lead.minutes, SCALE_CEILING_MINUTES),
        minutes: lead.minutes,
        over: lead.minutes > SCALE_CEILING_MINUTES,
      },
    ];
  });
  const medians = rows.map((row) => ({ ...row, value: row.median }));
  const aboveSla = rows.filter((row) => row.median > SLA_MINUTES).length;
  const slaText = minutesText(SLA_MINUTES);
  const summary = [
    `Gráfico de pontos com a mediana de minutos até o primeiro contato de ${formatInt(rows.length)} SDRs, com ${formatInt(data.length)} leads ao fundo e teto de SLA de ${slaText}.`,
    `A mediana passa do teto em ${formatInt(aboveSla)} deles; a maior é de ${slowest.name}, ${minutesText(slowest.median)}, e a menor, de ${fastest.name}, ${minutesText(fastest.median)}.`,
  ].join(' ');

  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;
  /** Linhas de zebra: as ímpares, em faixa inteira, atrás da grade (zIndex abaixo dos −100 dela). */
  const zebra = rows.filter((row) => row.rank % 2 === 1);

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as (SdrRow & { value: number }) | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'median', name: 'Mediana', value: minutesText(row.median) },
      { dataKey: 'leads', name: 'Leads trabalhados', value: `${formatInt(row.leads)} leads` },
      { dataKey: 'over', name: `Acima de ${minutesText(SCALE_CEILING_MINUTES)}`, value: `${formatInt(row.over)} leads` },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Mediana acima do teto de <span className="font-semibold text-text-primary">{slaText}</span> em{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(aboveSla)}</span> de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(rows.length)}</span> SDRs
      </p>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            {/* Zebra atrás da grade: o padrão da ReferenceArea (zIndex 100) pintaria sobre as linhas de grade (zIndex −100) e as apagaria. */}
            {zebra.map((row) => (
              <ReferenceArea fill="var(--surface-sunken)" ifOverflow="visible" key={row.name} stroke="none" y1={row.rank - 0.5} y2={row.rank + 0.5} zIndex={-150} />
            ))}
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="value"
              domain={X_DOMAIN}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => minutesText(value)}
              tickLine={false}
              tickMargin={8}
              ticks={X_TICKS}
              type="number"
            />
            {/* Eixo de linhas numérico: a linha i ocupa de i−0,5 a i+0,5. `reversed` põe a posição 0 no alto (REC-3). */}
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="rank"
              domain={[-0.5, rows.length - 0.5]}
              interval={0}
              reversed
              tick={(props: NameTickProps) => <NameTick {...props} row={rows[Number(props.payload?.value)]} />}
              tickLine={false}
              ticks={rows.map((row) => row.rank)}
              type="number"
              width={NAME_AXIS_WIDTH}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={({ viewBox }: { viewBox?: { x?: number; y?: number } }) => (
                <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x} y={(viewBox?.y ?? 0) - 6}>
                  {`teto de SLA, ${slaText}`}
                </text>
              )}
              stroke="var(--text-muted)"
              strokeDasharray="3 3"
              x={SLA_MINUTES}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {/* Os casos vêm antes na árvore: o Recharts pinta na ordem dos filhos, e a mediana tem de ficar por cima da nuvem (REC-13). */}
            <Scatter data={cases} isAnimationActive={false} legendType="none" shape={(props: ShapeProps<CasePoint>) => <CaseShape {...props} />} tooltipType="none" />
            <Scatter data={medians} isAnimationActive={animate} shape={(props: ShapeProps<SdrRow & { value: number }>) => <MedianShape {...props} />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Pontos pequenos: leads de agosto. Ponto grande: mediana. Acima de {minutesText(SCALE_CEILING_MINUTES)} o caso vira marca na borda.
        Linhas do maior para o menor tempo mediano.
      </p>
    </div>
  );
}
