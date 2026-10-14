import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  ErrorBar,
  ReferenceArea,
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
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginSample } from './data';

/**
 * Dot plot com intervalo e amostra pequena: o ticket de cada venda ganha é um ponto, a mediana é o
 * marcador e a faixa vai do 1º ao 3º quartil. O resumo só aparece onde o n o sustenta: com menos
 * de 10 negócios não há mediana, com menos de 5 não há faixa, e a origem que não vendeu fica na
 * lista com a frase sem venda no período, porque ausência não é R$ 0.
 */
export interface OriginTicketPlotProps {
  readonly data?: readonly OriginSample[];
  readonly height?: number;
  readonly className?: string;
}

/** Limiares do resumo: abaixo de BAND_MIN_N não há faixa, abaixo de MEDIAN_MIN_N não há mediana. */
const BAND_MIN_N = 5;
const MEDIAN_MIN_N = 10;
const X_DOMAIN: [number, number] = [0, 150_000];
const X_TICKS = [0, 30_000, 60_000, 90_000, 120_000, 150_000];
const MARGIN = { top: 8, right: 28, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 160;
const X_AXIS_HEIGHT = 26;
const ROW_STEP = 34;
/** Largura da nuvem em unidades de linha: 0,6 deixa 0,4 de respiro entre as nuvens vizinhas. */
const JITTER_SPAN = 0.6;
const CASE_RADIUS = 2.5;
/** Opacidade mínima de --text-muted para a marca composta passar de 3:1 nos dois temas (ACE-5). */
const CASE_OPACITY = 0.8;
const DOT_RADIUS = 5;
const SERIF_WIDTH = 6;
const BAND_STROKE_WIDTH = 2;
const LABEL_GAP = 10;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 3 } as const;

interface OriginRow {
  readonly rank: number;
  readonly id: string;
  readonly name: string;
  readonly n: number;
  readonly median: number | null;
  readonly q1: number | null;
  readonly q3: number | null;
  readonly highest: number | null;
  readonly showBand: boolean;
  readonly showMedian: boolean;
  /** Posição do ponto no eixo X: a mediana quando existe, senão a borda esquerda da escala. */
  readonly value: number;
  readonly errorX: readonly [number, number];
}

interface CasePoint {
  readonly rank: number;
  readonly value: number;
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

/** Quantil por interpolação linear sobre lista ordenada; lista vazia devolve null, nunca zero (EST-1b). */
function quantile(sorted: readonly number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const position = (sorted.length - 1) * p;
  const lower = sorted[Math.floor(position)];
  const upper = sorted[Math.ceil(position)];
  if (lower === undefined || upper === undefined) return null;
  return lower + (upper - lower) * (position - Math.floor(position));
}

/** FNV-1a de 32 bits: o mesmo texto dá sempre o mesmo número em [0, 1), em qualquer máquina. */
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

function dealsText(n: number): string {
  return `${formatInt(n)} ${n === 1 ? 'negócio' : 'negócios'}`;
}

/** Mais negócios primeiro: o n é a força da evidência, e a origem sem venda cai por último. */
function buildRows(origins: readonly OriginSample[]): OriginRow[] {
  return origins
    .map((origin) => {
      const sorted = [...origin.deals].sort((a, b) => a - b);
      const n = sorted.length;
      const median = quantile(sorted, 0.5);
      const q1 = quantile(sorted, 0.25);
      const q3 = quantile(sorted, 0.75);
      const band = n >= BAND_MIN_N && median !== null && q1 !== null && q3 !== null ? { median, q1, q3 } : null;
      return {
        id: origin.id,
        name: origin.name,
        n,
        median,
        q1,
        q3,
        highest: sorted[n - 1] ?? null,
        showBand: band !== null,
        showMedian: n >= MEDIAN_MIN_N && median !== null,
        value: median ?? X_DOMAIN[0],
        errorX: band ? ([band.median - band.q1, band.q3 - band.median] as const) : ([0, 0] as const),
      };
    })
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, 'pt-BR'))
    .map((row, rank) => ({ ...row, rank }));
}

function NameTick({ y, row }: NameTickProps & { readonly row: OriginRow | undefined }): ReactElement {
  return (
    <g>
      <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y) - 7}>
        {row?.name ?? ''}
      </text>
      <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} fontWeight={500} x={MARGIN.left} y={Number(y) + 7}>
        {row ? dealsText(row.n) : ''}
      </text>
    </g>
  );
}

function CaseShape({ cx, cy }: ShapeProps<CasePoint>): ReactElement | null {
  if (cx === undefined || cy === undefined) return null;
  return <circle cx={cx} cy={cy} fill="var(--text-muted)" fillOpacity={CASE_OPACITY} r={CASE_RADIUS} />;
}

/**
 * Marcador da mediana (só com n a partir de 10), o texto de exceção ou o valor à direita, e a banda
 * inteira da linha como alvo do cursor. A posição vem da escala do eixo X, porque a forma própria
 * do Scatter só recebe cx e cy (REC-31).
 */
function SummaryShape({ cx, cy, payload }: ShapeProps<OriginRow>): ReactElement | null {
  const area = usePlotArea();
  const scale = useXAxisScale();
  if (cx === undefined || cy === undefined || payload === undefined || area === undefined) return null;
  const hit = <rect fill="none" height={ROW_STEP} pointerEvents="all" width={area.width} x={area.x} y={cy - ROW_STEP / 2} />;
  if (payload.n === 0) {
    return (
      <g>
        {hit}
        <circle cx={area.x + 12} cy={cy} fill="none" r={DOT_RADIUS - 1} stroke="var(--text-muted)" strokeWidth={1.5} />
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={area.x + 24} y={cy}>
          sem venda no período
        </text>
      </g>
    );
  }
  // Fora do resumo, o texto vai depois do caso mais à direita, para não nascer por cima de um ponto.
  const edge = payload.showMedian ? payload.q3 : payload.highest;
  const labelX = (edge === null ? cx : (scale?.(edge) ?? cx)) + SERIF_WIDTH / 2 + LABEL_GAP;
  const showMedian = payload.showMedian && payload.median !== null;
  return (
    <g>
      {hit}
      {showMedian ? <circle cx={cx} cy={cy} fill="var(--chart-1)" r={DOT_RADIUS} stroke="var(--surface-raised)" strokeWidth={1.5} /> : null}
      {showMedian && payload.median !== null ? (
        <text className="font-display" dominantBaseline="central" fill="var(--text-primary)" fontSize={11} fontWeight={600} style={HALO} x={labelX} y={cy}>
          {formatCurrencyCompact(payload.median)}
        </text>
      ) : (
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} style={HALO} x={labelX} y={cy}>
          {payload.showBand ? 'sem mediana' : 'sem faixa'}
        </text>
      )}
    </g>
  );
}

/** A banda é desenhada pelo ErrorBar; a forma do ponto que o carrega não pinta nada. */
function NoShape(): ReactElement {
  return <g />;
}

export default function OriginTicketPlot({ data = defaultData, height, className }: OriginTicketPlotProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = buildRows(data);
  const lead = rows.find((row) => row.showMedian && row.median !== null);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não houve lead ganho no semestre.</span>
      </div>
    );
  }

  const published = rows.filter((row) => row.showMedian).length;
  const small = rows.filter((row) => row.n < BAND_MIN_N).length;
  const empty = rows.filter((row) => row.n === 0).length;
  const summary = [
    `Gráfico de pontos com o ticket das vendas ganhas por ${formatInt(rows.length)} origens, com mediana e faixa entre quartis só onde o n permite.`,
    `A mediana aparece em ${formatInt(published)} origens, e ${formatInt(small)} fecharam menos de ${formatInt(BAND_MIN_N)} negócios.`,
    empty > 0 ? `${formatInt(empty)} não teve venda no período.` : '',
  ]
    .filter((part) => part !== '')
    .join(' ');

  const cases: CasePoint[] = rows.flatMap((row) => {
    const origin = data.find((item) => item.id === row.id);
    return (origin?.deals ?? []).map((ticket, index) => ({
      rank: row.rank + (hash01(`${row.id}-${String(index)}`) - 0.5) * JITTER_SPAN,
      value: ticket,
    }));
  });
  const bands = rows.filter((row) => row.showBand);
  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;
  /** Linhas de zebra: as ímpares, em faixa inteira, atrás da grade (zIndex abaixo dos −100 dela). */
  const zebra = rows.filter((row) => row.rank % 2 === 1);

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as OriginRow | undefined;
    if (!row) return null;
    const money = (value: number | null, reason: string) => (value === null ? reason : formatCurrencyCompact(value));
    const entries = [
      { dataKey: 'n', name: 'Vendas ganhas', value: row.n === 0 ? 'nenhuma: sem venda no período' : dealsText(row.n) },
      {
        dataKey: 'median',
        name: 'Ticket mediano',
        value: row.n === 0 ? `${formatUnavailable()}, não é R$ 0` : money(row.showMedian ? row.median : null, `não calculado: menos de ${formatInt(MEDIAN_MIN_N)} negócios`),
      },
      { dataKey: 'q1', name: '1º quartil', value: money(row.showBand ? row.q1 : null, row.n === 0 ? formatUnavailable() : `não calculado: menos de ${formatInt(BAND_MIN_N)} negócios`) },
      { dataKey: 'q3', name: '3º quartil', value: money(row.showBand ? row.q3 : null, row.n === 0 ? formatUnavailable() : `não calculado: menos de ${formatInt(BAND_MIN_N)} negócios`) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        {lead?.median != null ? (
          <>
            Mediana só em <span className="kpi-number font-medium text-text-primary">{formatInt(published)}</span> de{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(rows.length)}</span> origens:{' '}
            <span className="kpi-number font-medium text-text-primary">{formatInt(small)}</span> fecharam menos de {formatInt(BAND_MIN_N)} negócios
          </>
        ) : (
          <>Nenhuma origem tem negócios suficientes para publicar a mediana</>
        )}
      </p>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={MARGIN}>
            {/* Zebra atrás da grade: o padrão da ReferenceArea (zIndex 100) pintaria sobre as linhas de grade (zIndex −100) e as apagaria. */}
            {zebra.map((row) => (
              <ReferenceArea fill="var(--surface-sunken)" ifOverflow="visible" key={row.id} stroke="none" y1={row.rank - 0.5} y2={row.rank + 0.5} zIndex={-150} />
            ))}
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="value"
              domain={X_DOMAIN}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
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
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            {/* Faixas, depois casos, depois o marcador: o Recharts pinta na ordem dos filhos, e a mediana fica por cima (REC-13). */}
            <Scatter data={bands} isAnimationActive={animate} legendType="none" shape={NoShape} tooltipType="none">
              <ErrorBar dataKey="errorX" direction="x" isAnimationActive={animate} stroke="var(--text-muted)" strokeWidth={BAND_STROKE_WIDTH} width={SERIF_WIDTH} />
            </Scatter>
            <Scatter data={cases} isAnimationActive={false} legendType="none" shape={(props: ShapeProps<CasePoint>) => <CaseShape {...props} />} tooltipType="none" />
            <Scatter data={rows} isAnimationActive={animate} shape={(props: ShapeProps<OriginRow>) => <SummaryShape {...props} />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Menos de {formatInt(MEDIAN_MIN_N)} negócios: sem mediana. Menos de {formatInt(BAND_MIN_N)}: sem faixa, só os casos. Do maior para o menor n.
      </p>
    </div>
  );
}
