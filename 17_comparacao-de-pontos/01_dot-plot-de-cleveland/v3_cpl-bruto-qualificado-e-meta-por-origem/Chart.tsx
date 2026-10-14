import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  CartesianGrid,
  ReferenceArea,
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
import { formatCurrency, formatCurrencyAxis, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LeadCostRow } from './data';

/**
 * Dot plot agrupado: três marcadores por origem de lead no mesmo eixo de custo, um círculo para o
 * CPL bruto, um losango para o CPL qualificado e um traço para a meta. Sem conector, porque as
 * três medidas não são antes e depois do mesmo objeto. Menor é melhor, então a coluna à direita
 * escreve o qualificado contra a meta, em verde abaixo e em vermelho acima.
 */
export interface LeadCostDotPlotProps {
  readonly data?: readonly LeadCostRow[];
  readonly height?: number;
  readonly className?: string;
}

type MarkerKind = 'raw' | 'qualified' | 'target';

/** Domínio e tiques do registry da métrica, iguais em todo recorte (EIX-9). */
const X_DOMAIN: [number, number] = [0, 80];
const X_TICKS = [0, 20, 40, 60, 80];
const MARGIN = { top: 20, right: 96, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 164;
const X_AXIS_HEIGHT = 26;
/** Passo da linha, que também é a altura da área sensível ao cursor. */
const ROW_STEP = 28;
const RAW_RADIUS = 7;
const QUALIFIED_HALF_DIAGONAL = 6.5;
const TARGET_WIDTH = 3;
const TARGET_HEIGHT = 20;
const STROKE_GAP = 1.5;
const DELTA_GAP = 10;
const LOCALE = 'pt-BR';

interface CostRow extends LeadCostRow {
  readonly rank: number;
  readonly gap: number;
  readonly versusTarget: number;
}

interface CostPoint {
  readonly x: number;
  readonly y: number;
  readonly row: CostRow;
}

interface MarkerShapeProps {
  readonly cx?: number;
  readonly cy?: number;
  readonly kind: MarkerKind;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/**
 * Maior distância entre bruto e qualificado primeiro, empate pelo nome. A conta é em centavos
 * inteiros para a distância de 13,80 de duas origens não sair diferente por ponto flutuante.
 */
function rankByGap(rows: readonly LeadCostRow[]): CostRow[] {
  return rows
    .map((row) => ({
      ...row,
      rank: 0,
      gap: Math.round(row.qualified * 100 - row.raw * 100) / 100,
      versusTarget: Math.round(row.qualified * 100 - row.target * 100) / 100,
    }))
    .sort((a, b) => b.gap - a.gap || a.origin.localeCompare(b.origin, LOCALE))
    .map((row, rank) => ({ ...row, rank }));
}

/** Menor é melhor: abaixo da meta é positivo, acima é negativo, na meta não leva cor (COR-6). */
function polarityColor(versusTarget: number): string {
  if (versusTarget < 0) return 'var(--positive)';
  if (versusTarget > 0) return 'var(--negative)';
  return 'var(--text-secondary)';
}

/** Sinal à mão sobre o valor absoluto, com o menos tipográfico (NUM-3). */
function signedCost(value: number): string {
  if (value === 0) return 'na meta';
  return `${value < 0 ? '−' : '+'}${formatCurrency(Math.abs(value))}`;
}

function NameTick({ y, label }: NameTickProps & { readonly label: string }): ReactElement {
  return (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {label}
    </text>
  );
}

/**
 * Um dos três marcadores. O traço da meta é o primeiro desenhado e leva a banda inteira da linha
 * como área sensível; os outros dois se desenham por cima dele (a ordem do JSX decide dentro de um
 * mesmo tipo de marca, REC-13) e o losango por último, para o empate com o círculo mostrar os dois.
 */
function MarkerShape({ cx, cy, kind }: MarkerShapeProps): ReactElement | null {
  const area = usePlotArea();
  if (cx === undefined || cy === undefined || area === undefined) return null;
  if (kind === 'target') {
    return (
      <g>
        <rect fill="none" height={ROW_STEP} pointerEvents="all" width={area.width} x={area.x} y={cy - ROW_STEP / 2} />
        <rect fill="var(--text-secondary)" height={TARGET_HEIGHT} width={TARGET_WIDTH} x={cx - TARGET_WIDTH / 2} y={cy - TARGET_HEIGHT / 2} />
      </g>
    );
  }
  if (kind === 'raw') {
    return <circle cx={cx} cy={cy} fill="var(--chart-1)" r={RAW_RADIUS} stroke="var(--surface-raised)" strokeWidth={STROKE_GAP} />;
  }
  const d = QUALIFIED_HALF_DIAGONAL;
  return (
    <polygon
      fill="var(--chart-3)"
      points={`${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}`}
      stroke="var(--surface-raised)"
      strokeWidth={STROKE_GAP}
    />
  );
}

/** Coluna escrita à direita da área de plotagem: o qualificado contra a meta, na cor da polaridade. */
function VersusTargetColumn({ rows }: { readonly rows: readonly CostRow[] }): ReactElement | null {
  const area = usePlotArea();
  if (area === undefined) return null;
  const x = area.x + area.width + DELTA_GAP;
  return (
    <g>
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={x} y={area.y - 6}>
        contra a meta
      </text>
      {rows.map((row) => (
        <text
          className="font-display"
          dominantBaseline="central"
          fill={polarityColor(row.versusTarget)}
          fontSize={11}
          fontWeight={600}
          key={row.id}
          x={x}
          y={area.y + (row.rank + 0.5) * (area.height / rows.length)}
        >
          {signedCost(row.versusTarget)}
        </text>
      ))}
    </g>
  );
}

/** Amostra da legenda na forma exata do marcador do gráfico. */
function LegendSample({ kind }: { readonly kind: MarkerKind }): ReactElement {
  const d = QUALIFIED_HALF_DIAGONAL;
  const size = 2 * d + 2;
  const boxHeight = Math.max(size, TARGET_HEIGHT + 2);
  const mid = size / 2;
  const midY = boxHeight / 2;
  return (
    <svg aria-hidden className="shrink-0" height={boxHeight} width={size}>
      {kind === 'raw' ? <circle cx={mid} cy={midY} fill="var(--chart-1)" r={RAW_RADIUS} /> : null}
      {kind === 'qualified' ? <polygon fill="var(--chart-3)" points={`${mid},${midY - d} ${mid + d},${midY} ${mid},${midY + d} ${mid - d},${midY}`} /> : null}
      {kind === 'target' ? <rect fill="var(--text-secondary)" height={TARGET_HEIGHT} width={TARGET_WIDTH} x={mid - TARGET_WIDTH / 2} y={midY - TARGET_HEIGHT / 2} /> : null}
    </svg>
  );
}

export default function LeadCostDotPlot({ data = defaultData, height, className }: LeadCostDotPlotProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = rankByGap(data);
  const widest = rows[0];

  if (!widest) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não houve lead medido em agosto.</span>
      </div>
    );
  }

  const above = rows.filter((row) => row.versusTarget > 0).length;
  const summary = [
    `Gráfico de pontos com o CPL bruto, o qualificado e a meta de agosto de ${formatInt(rows.length)} origens de lead.`,
    `Maior distância entre bruto e qualificado: ${widest.origin}, ${formatCurrency(widest.gap)}.`,
    `${formatInt(above)} de ${formatInt(rows.length)} com o qualificado acima da meta; menor custo é melhor.`,
  ].join(' ');

  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;
  const names = rows.map((row) => row.origin);
  const zebra = rows.filter((row) => row.rank % 2 === 1);
  const points = (pick: (row: CostRow) => number): CostPoint[] => rows.map((row) => ({ x: pick(row), y: row.rank, row }));

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = (props.payload?.[0]?.payload as CostPoint | undefined)?.row;
    if (!row) return null;
    const verdict = row.versusTarget === 0 ? 'na meta' : `${formatCurrency(Math.abs(row.versusTarget))} ${row.versusTarget < 0 ? 'abaixo, melhor' : 'acima, pior'}`;
    const entries = [
      { dataKey: 'raw', name: 'CPL bruto', value: formatCurrency(row.raw) },
      { dataKey: 'qualified', name: 'CPL qualificado', value: formatCurrency(row.qualified) },
      { dataKey: 'target', name: 'Meta de agosto', value: formatCurrency(row.target) },
      { dataKey: 'gap', name: 'Bruto até qualificado', value: formatCurrency(row.gap) },
      { dataKey: 'verdict', name: 'Qualificado contra a meta', value: verdict },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.origin} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 items-center gap-6 text-xs text-text-secondary">
        <span className="flex items-center gap-2">
          <LegendSample kind="raw" />
          CPL bruto
        </span>
        <span className="flex items-center gap-2">
          <LegendSample kind="qualified" />
          CPL qualificado
        </span>
        <span className="flex items-center gap-2">
          <LegendSample kind="target" />
          Meta de agosto
        </span>
      </div>
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
              dataKey="x"
              domain={X_DOMAIN}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickLine={false}
              tickMargin={8}
              ticks={X_TICKS}
              type="number"
            />
            {/* Eixo de linhas numérico: a linha i ocupa de i−0,5 a i+0,5, e `reversed` põe a posição 0
                no alto, onde mora a maior distância (sentido conferido no render, REC-3). */}
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="y"
              domain={[-0.5, rows.length - 0.5]}
              interval={0}
              reversed
              tick={(props: NameTickProps) => <NameTick {...props} label={names[Number(props.payload?.value)] ?? ''} />}
              tickLine={false}
              ticks={rows.map((row) => row.rank)}
              type="number"
              width={NAME_AXIS_WIDTH}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: CURSOR_COLOR, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Scatter data={points((row) => row.target)} isAnimationActive={animate} name="Meta de agosto" shape={(props: Omit<MarkerShapeProps, 'kind'>) => <MarkerShape {...props} kind="target" />} />
            <Scatter data={points((row) => row.raw)} isAnimationActive={animate} name="CPL bruto" shape={(props: Omit<MarkerShapeProps, 'kind'>) => <MarkerShape {...props} kind="raw" />} />
            <Scatter data={points((row) => row.qualified)} isAnimationActive={animate} name="CPL qualificado" shape={(props: Omit<MarkerShapeProps, 'kind'>) => <MarkerShape {...props} kind="qualified" />} />
            <VersusTargetColumn rows={rows} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Ordenado da maior para a menor distância entre o CPL bruto e o qualificado. Menor custo é melhor.
      </p>
    </div>
  );
}
