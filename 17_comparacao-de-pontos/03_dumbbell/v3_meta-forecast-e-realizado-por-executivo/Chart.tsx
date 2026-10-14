import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps, type TooltipValueType } from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QuotaTriple } from './data';

/**
 * Dumbbell de três marcadores: meta (losango), forecast (triângulo) e realizado (círculo, o maior)
 * numa faixa por executivo, e ao lado a tabela com os três valores e o delta do realizado contra
 * a meta. A ordem é a distância entre realizado e meta, do maior déficit ao maior superávit.
 */
export interface QuotaTripletsProps {
  readonly data?: readonly QuotaTriple[];
  readonly height?: number;
  readonly className?: string;
}

/** Domínio fixo em reais: a mesma posição vale a mesma receita em qualquer recorte. */
const X_DOMAIN: [number, number] = [120_000, 360_000];
const X_TICKS = [120_000, 180_000, 240_000, 300_000, 360_000];
const MARGIN = { top: 16, right: 0, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 136;
const X_AXIS_HEIGHT = 24;
const ROW_STEP = 15;
const COLUMN_WIDTH = 84;
/** Folga à direita das quatro colunas: o tique do eixo Y começa deslocado da borda do eixo, e sem ela o delta sai cortado. */
const TABLE_WIDTH = COLUMN_WIDTH * 4 + 24;
const CONNECTOR_WIDTH = 2;
/** Tamanhos crescentes da meta ao realizado: o losango é o menor, o círculo o maior. */
const DIAMOND_HALF = 4;
const TRIANGLE_HALF = 5;
const CIRCLE_RADIUS = 6;
const MARKER_OUTLINE = 1.5;
const TARGET_COLOR = 'var(--text-secondary)';
const FORECAST_COLOR = 'var(--chart-3)';
const ACTUAL_COLOR = 'var(--chart-1)';
const CONNECTOR_COLOR = 'var(--text-muted)';

interface TripletShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: QuotaTriple;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly index?: number;
  readonly payload?: { readonly value?: unknown };
}

interface TableTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly index?: number;
}

/** A faixa de cada linha: menor e maior dos três valores. Quem é cada marcador vem do payload. */
function bandOf(row: QuotaTriple): [number, number] {
  return [Math.min(row.target, row.forecast, row.actual), Math.max(row.target, row.forecast, row.actual)];
}

function gapToTarget(row: QuotaTriple): number {
  return row.actual - row.target;
}

/** Do maior déficit ao maior superávit; empate pelo nome para a ordem ser estável. */
function rankByGap(rows: readonly QuotaTriple[]): QuotaTriple[] {
  return [...rows].sort((a, b) => gapToTarget(a) - gapToTarget(b) || a.name.localeCompare(b.name, 'pt-BR'));
}

/** Sinal à mão sobre o valor absoluto, com o menos tipográfico (NUM-3). Zero sai sem sinal. */
function signedCurrency(value: number): string {
  if (value === 0) return formatCurrencyCompact(0);
  return `${value < 0 ? '−' : '+'}${formatCurrencyCompact(Math.abs(value))}`;
}

/** Realizado acima da meta é bom (COR-6); exatamente na meta fica neutro. */
function gapColor(value: number): string {
  if (value > 0) return 'var(--positive)';
  if (value < 0) return 'var(--negative)';
  return 'var(--text-secondary)';
}

function NameTick({ y, payload }: NameTickProps): ReactElement {
  return (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );
}

/**
 * Regra de três: a faixa chega com `x` e `width` do menor ao maior valor, e cada marcador cai em
 * `x + (valor − menor) / (maior − menor) × width`. Com os três iguais a faixa tem largura zero e a
 * divisão é pulada: vira um marcador só, e a forma própria o recebe porque não descarta a marca de
 * dimensão zero (REC-11). O de maior tamanho vai por baixo, para o menor nunca ficar coberto.
 */
function TripletShape({ x, y, width, height, payload }: TripletShapeProps): ReactElement | null {
  if (x === undefined || y === undefined || width === undefined || height === undefined || payload === undefined) return null;
  const left = Math.min(x, x + width);
  const span = Math.abs(width);
  const [low, high] = bandOf(payload);
  const place = (value: number): number => (high === low ? left : left + ((value - low) / (high - low)) * span);
  const centerY = y + height / 2;
  const targetX = place(payload.target);
  const forecastX = place(payload.forecast);
  const actualX = place(payload.actual);
  const allEqual = high === low;
  return (
    <g>
      {allEqual ? null : <line stroke={CONNECTOR_COLOR} strokeLinecap="round" strokeWidth={CONNECTOR_WIDTH} x1={left} x2={left + span} y1={centerY} y2={centerY} />}
      <circle cx={actualX} cy={centerY} fill={ACTUAL_COLOR} r={CIRCLE_RADIUS} stroke="var(--surface-raised)" strokeWidth={MARKER_OUTLINE} />
      {allEqual ? null : (
        <>
          <path
            d={`M${String(forecastX)},${String(centerY - TRIANGLE_HALF)} L${String(forecastX + TRIANGLE_HALF)},${String(centerY + TRIANGLE_HALF - 1)} L${String(forecastX - TRIANGLE_HALF)},${String(centerY + TRIANGLE_HALF - 1)} Z`}
            fill={FORECAST_COLOR}
            stroke="var(--surface-raised)"
            strokeLinejoin="round"
            strokeWidth={MARKER_OUTLINE}
          />
          <path
            d={`M${String(targetX)},${String(centerY - DIAMOND_HALF)} L${String(targetX + DIAMOND_HALF)},${String(centerY)} L${String(targetX)},${String(centerY + DIAMOND_HALF)} L${String(targetX - DIAMOND_HALF)},${String(centerY)} Z`}
            fill={TARGET_COLOR}
            stroke="var(--surface-raised)"
            strokeWidth={MARKER_OUTLINE}
          />
        </>
      )}
    </g>
  );
}

function LegendShape({ kind }: { readonly kind: 'target' | 'forecast' | 'actual' }): ReactElement {
  return (
    <svg aria-hidden className="size-3 shrink-0" viewBox="0 0 12 12">
      {kind === 'target' ? <path d="M6,2 L10,6 L6,10 L2,6 Z" fill={TARGET_COLOR} /> : null}
      {kind === 'forecast' ? <path d="M6,1 L11,10 L1,10 Z" fill={FORECAST_COLOR} /> : null}
      {kind === 'actual' ? <circle cx={6} cy={6} fill={ACTUAL_COLOR} r={6} /> : null}
    </svg>
  );
}

export default function QuotaTriplets({ data = defaultData, height, className }: QuotaTripletsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  /** A ordem do array é a ordem no eixo; o primeiro item fica no alto, conferido no render (REC-3). */
  const rows = rankByGap(data);

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não há meta do trimestre para comparar.</span>
      </div>
    );
  }

  const below = rows.filter((row) => gapToTarget(row) < 0).length;
  const worst = rows[0];
  const best = rows[rows.length - 1];
  const summary = [
    `Gráfico de halteres com meta, forecast e realizado de ${formatInt(rows.length)} executivos no trimestre, mais uma tabela com os três valores.`,
    `${formatInt(below)} de ${formatInt(rows.length)} ficaram abaixo da meta.`,
    worst && best ? `Maior déficit: ${worst.name}, ${signedCurrency(gapToTarget(worst))}; maior superávit: ${best.name}, ${signedCurrency(gapToTarget(best))}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;

  const renderTable = ({ x, y, index = -1 }: TableTickProps): ReactElement | null => {
    const row = rows[index];
    if (row === undefined) return null;
    const left = Number(x);
    const centerY = Number(y);
    const columns = [
      { key: 'target', text: formatCurrencyCompact(row.target), fill: 'var(--text-secondary)', weight: 500 },
      { key: 'forecast', text: formatCurrencyCompact(row.forecast), fill: 'var(--text-secondary)', weight: 500 },
      { key: 'actual', text: formatCurrencyCompact(row.actual), fill: 'var(--text-primary)', weight: 600 },
      { key: 'gap', text: signedCurrency(gapToTarget(row)), fill: gapColor(gapToTarget(row)), weight: 600 },
    ];
    const headers = ['Meta', 'Forecast', 'Realizado', 'Delta'];
    return (
      <g>
        {index === 0
          ? headers.map((header, column) => (
              <text
                className="font-sans"
                dominantBaseline="central"
                fill="var(--text-muted)"
                fontSize={11}
                fontWeight={500}
                key={header}
                textAnchor="end"
                x={left + COLUMN_WIDTH * (column + 1)}
                y={centerY - ROW_STEP}
              >
                {header}
              </text>
            ))
          : null}
        {columns.map((column, position) => (
          <text
            className="font-display"
            dominantBaseline="central"
            fill={column.fill}
            fontSize={11}
            fontWeight={column.weight}
            key={column.key}
            textAnchor="end"
            x={left + COLUMN_WIDTH * (position + 1)}
            y={centerY}
          >
            {column.text}
          </text>
        ))}
      </g>
    );
  };

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as QuotaTriple | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'target', name: 'Meta', value: formatCurrencyCompact(row.target) },
      { dataKey: 'forecast', name: 'Forecast', value: formatCurrencyCompact(row.forecast) },
      { dataKey: 'actual', name: 'Realizado', value: formatCurrencyCompact(row.actual) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.name} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="mb-1.5 flex shrink-0 items-center justify-between gap-6 text-xs leading-4 text-text-secondary">
        <p aria-hidden className="min-w-0 truncate">
          <span className="kpi-number font-medium text-text-primary">{formatInt(below)}</span> de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatInt(rows.length)}</span> abaixo da meta. Ordem: realizado menos meta, do menor para o maior
        </p>
        <ul aria-hidden className="flex shrink-0 items-center gap-4">
          <li className="flex items-center gap-2">
            <LegendShape kind="target" />
            Meta
          </li>
          <li className="flex items-center gap-2">
            <LegendShape kind="forecast" />
            Forecast
          </li>
          <li className="flex items-center gap-2">
            <LegendShape kind="actual" />
            Realizado
          </li>
        </ul>
      </div>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} data={rows} layout="vertical" margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={X_DOMAIN}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
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
              yAxisId="names"
            />
            {/* Segundo eixo Y só para a tabela: ele reparte a mesma banda de cada linha, e por isso as colunas não desalinham do haltere. */}
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="name"
              interval={0}
              orientation="right"
              tick={renderTable}
              tickLine={false}
              type="category"
              width={TABLE_WIDTH}
              yAxisId="table"
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey={bandOf} isAnimationActive={animate} shape={(props: TripletShapeProps) => <TripletShape {...props} />} yAxisId="names" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
