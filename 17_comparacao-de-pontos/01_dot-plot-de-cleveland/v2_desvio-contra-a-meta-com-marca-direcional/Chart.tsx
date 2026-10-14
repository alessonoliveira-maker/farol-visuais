import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  useXAxisScale,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QuotaRow } from './data';

/**
 * Dot plot de desvio: a distância de cada executivo até a meta do trimestre, com a meta no zero do
 * eixo. A barra clara conduz o olho do zero até o valor e o traço opaco na ponta é o valor, para
 * quem não conhece o dot plot ler como barra e quem conhece ler como ponto.
 */
export interface QuotaDeviationProps {
  readonly data?: readonly QuotaRow[];
  readonly height?: number;
  readonly className?: string;
}

/** Domínio simétrico fixo, do registry da métrica: a meta fica no meio e o filtro não o move. */
const X_DOMAIN: [number, number] = [-80_000, 80_000];
const X_TICKS = [-80_000, -40_000, 0, 40_000, 80_000];
const MARGIN = { top: 20, right: 44, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 140;
const X_AXIS_HEIGHT = 26;
const ROW_STEP = 26;
const BAR_HEIGHT = 12;
const TIP_HEIGHT = 18;
const TIP_WIDTH = 2;
const VALUE_LABEL_GAP = 8;
/** Piso medido de --positive (0,70) e --negative (0,66) para a marca composta ficar em 3:1 (ACE-5). */
const BAR_FILL_OPACITY = 0.7;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 3 } as const;

interface DeviationRow extends QuotaRow {
  readonly deviation: number;
}

interface DeviationShapeProps {
  readonly y?: number;
  readonly height?: number;
  readonly payload?: DeviationRow;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Maior desvio primeiro; empate pelo nome para a ordem não mudar a cada recarga. */
function rankByDeviation(rows: readonly QuotaRow[]): DeviationRow[] {
  return rows
    .map((row) => ({ ...row, deviation: row.actual - row.target }))
    .sort((a, b) => b.deviation - a.deviation || a.name.localeCompare(b.name, 'pt-BR'));
}

/** Sinal à mão sobre o valor absoluto, com o menos tipográfico (NUM-3). Zero sai sem sinal. */
function signedCurrency(value: number): string {
  if (value === 0) return formatCurrencyCompact(0);
  return `${value < 0 ? '−' : '+'}${formatCurrencyCompact(Math.abs(value))}`;
}

function signedAxis(value: number): string {
  if (value === 0) return formatCurrencyAxis(0);
  return `${value < 0 ? '−' : '+'}${formatCurrencyAxis(Math.abs(value))}`;
}

/** Polaridade da métrica: realizado acima da meta é bom (COR-6). Zero não leva cor semântica. */
function polarityColor(deviation: number): string {
  if (deviation > 0) return 'var(--positive)';
  if (deviation < 0) return 'var(--negative)';
  return 'var(--text-secondary)';
}

function NameTick({ y, payload }: NameTickProps): ReactElement {
  return (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );
}

/**
 * Barra clara do zero ao valor, traço opaco na ponta e o desvio escrito além da ponta livre. As
 * duas posições vêm da escala do eixo e não de `x` e `width`, que chegam com sinal e invertidos
 * nos negativos; o desvio zero também chega aqui, porque a forma própria não descarta a marca de
 * dimensão zero (REC-11).
 */
function DeviationShape({ y, height, payload }: DeviationShapeProps): ReactElement | null {
  const scale = useXAxisScale();
  if (y === undefined || height === undefined || payload === undefined || scale === undefined) return null;
  const zeroX = scale(0);
  const tipX = scale(payload.deviation);
  if (zeroX === undefined || tipX === undefined) return null;
  const centerY = y + height / 2;
  const color = polarityColor(payload.deviation);
  const isNegative = payload.deviation < 0;
  return (
    <g>
      <rect
        fill={color}
        fillOpacity={BAR_FILL_OPACITY}
        height={BAR_HEIGHT}
        width={Math.abs(tipX - zeroX)}
        x={Math.min(zeroX, tipX)}
        y={centerY - BAR_HEIGHT / 2}
      />
      <rect fill={color} height={TIP_HEIGHT} width={TIP_WIDTH} x={tipX - TIP_WIDTH / 2} y={centerY - TIP_HEIGHT / 2} />
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-secondary)"
        fontSize={11}
        fontWeight={500}
        style={HALO}
        textAnchor={isNegative ? 'end' : 'start'}
        x={isNegative ? tipX - VALUE_LABEL_GAP : tipX + VALUE_LABEL_GAP}
        y={centerY}
      >
        {payload.deviation === 0 ? 'na meta' : signedCurrency(payload.deviation)}
      </text>
    </g>
  );
}

export default function QuotaDeviation({ data = defaultData, height, className }: QuotaDeviationProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  /** A ordem do array é a ordem no eixo; o sentido (primeiro item no alto) foi conferido no render do BarChart vertical (REC-3). */
  const rows = rankByDeviation(data);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não há meta do trimestre para comparar.</span>
      </div>
    );
  }

  const below = rows.filter((row) => row.deviation < 0).length;
  const onTarget = rows.filter((row) => row.deviation === 0).length;
  const best = rows[0];
  const worst = rows[rows.length - 1];
  const countText = `${formatInt(below)} de ${formatInt(rows.length)} executivos abaixo da meta do trimestre`;
  const summary = [
    `Gráfico de barras e traços com o desvio do realizado contra a meta de ${formatInt(rows.length)} executivos no trimestre.`,
    `${countText}${onTarget === 0 ? '' : `, ${formatInt(onTarget)} na meta`}.`,
    best && worst ? `Maior folga: ${best.name}, ${signedCurrency(best.deviation)}; maior falta: ${worst.name}, ${signedCurrency(worst.deviation)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as DeviationRow | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'actual', name: 'Realizado', value: formatCurrencyCompact(row.actual) },
      { dataKey: 'target', name: 'Meta', value: formatCurrencyCompact(row.target) },
      { dataKey: 'deviation', name: 'Desvio', value: row.deviation === 0 ? 'na meta' : signedCurrency(row.deviation) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        <span className="kpi-number font-medium text-text-primary">{formatInt(below)}</span> de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(rows.length)}</span> executivos abaixo da meta do trimestre
      </p>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} data={rows} layout="vertical" margin={MARGIN}>
            {/* Zebra atrás da grade: o padrão da ReferenceArea (zIndex 100) pintaria sobre as linhas de grade (zIndex −100) e as apagaria. */}
            {rows.map((row, index) =>
              index % 2 === 1 ? (
                <ReferenceArea fill="var(--surface-sunken)" ifOverflow="visible" key={row.id} stroke="none" y1={row.name} y2={row.name} zIndex={-150} />
              ) : null,
            )}
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="deviation"
              domain={X_DOMAIN}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => signedAxis(value)}
              tickLine={false}
              tickMargin={8}
              ticks={X_TICKS}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="name"
              interval={0}
              tick={NameTick}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={({ viewBox }: { viewBox?: { x?: number; y?: number } }) => (
                <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x} y={(viewBox?.y ?? 0) - 6}>
                  meta do trimestre
                </text>
              )}
              stroke="var(--line-strong)"
              x={0}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="deviation" isAnimationActive={animate} shape={(props: DeviationShapeProps) => <DeviationShape {...props} />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Traço opaco: desvio contra a meta; barra clara: a distância até ela. Da maior folga para a maior falta.
      </p>
    </div>
  );
}
