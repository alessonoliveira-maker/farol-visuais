import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type TicketRange } from './data';

/**
 * Range plot horizontal: uma cápsula por segmento, do menor ao maior ticket observado, ordenada pela
 * amplitude. Sem cabeça de início nem de fim, só os dois extremos escritos nas pontas. Responde
 * "entre que valores varia o ticket de cada segmento" sem confundir a faixa com um intervalo de
 * confiança.
 */
export interface TicketRangePlotProps {
  /** Segmentos em qualquer ordem: o componente ordena pela amplitude e desempata pelo nome. */
  readonly data?: readonly TicketRange[];
  /** Altura da raiz em px, para pai sem altura. O gráfico em si mede ROW_STEP por segmento. */
  readonly height?: number;
  readonly className?: string;
}

interface RangeRow extends TicketRange {
  /** Largura da faixa, maior menos menor: é o que a barra empilhada sobre a base invisível desenha. */
  readonly span: number;
}

interface CapsuleProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Série única: uma cor só (COR-1). */
const RANGE_FILL = 'var(--chart-1)';
const MARGIN = { top: 4, right: 76, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 168;
const X_AXIS_HEIGHT = 26;
/** Passo fixo por linha: 34 px com vão de 30% dá cápsula de 13,6 px, acima do piso de 12 (ESP-2). */
const ROW_STEP = 34;
const BAR_CATEGORY_GAP = '30%';
const BAR_MAX = 16;
const END_LABEL_GAP = 6;
/** Até 4 intervalos de grade, ou seja, no máximo 5 linhas contando o zero (EIX-4). */
const MAX_GRID_INTERVALS = 4;
const STEP_MULTIPLIERS = [1, 2, 2.5, 5, 10] as const;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;
const LOCALE = 'pt-BR';

/** Maior amplitude primeiro; empate resolvido pelo nome para a ordem não mudar a cada recarga. */
function rankBySpan(rows: readonly TicketRange[]): RangeRow[] {
  return rows
    .map((row) => ({ ...row, span: row.max - row.min }))
    .sort((a, b) => b.span - a.span || a.segment.localeCompare(b.segment, LOCALE));
}

/** Maior valor da lista, ou `null` quando ela é vazia (EST-1b). */
function maxOf(values: readonly number[]): number | null {
  return values.length === 0 ? null : Math.max(...values);
}

/** Domínio e tiques redondos calculados do dado: a grade fecha na primeira linha acima do maior valor. */
function niceScale(maxValue: number): { readonly domainMax: number; readonly ticks: number[] } {
  const rough = maxValue / MAX_GRID_INTERVALS;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = STEP_MULTIPLIERS.map((m) => m * magnitude).find((s) => s >= rough) ?? rough;
  const intervals = Math.ceil(maxValue / step);
  return { domainMax: intervals * step, ticks: Array.from({ length: intervals + 1 }, (_, i) => i * step) };
}

/** Frase da cauda do nome: letra minúscula no meio da oração, sem tocar no resto do texto. */
function inSentence(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1);
}

function NameTick({ y, payload }: NameTickProps): ReactElement {
  return (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );
}

/**
 * A cápsula é desenhada à mão porque a barra empilhada chega retangular. O raio é limitado à
 * metade da menor dimensão: faixa mais curta que a espessura vira meia pastilha, não um losango.
 */
function Capsule({ x, y, width, height }: CapsuleProps): ReactElement | null {
  if (x === undefined || y === undefined || width === undefined || height === undefined) return null;
  const radius = Math.min(height, width) / 2;
  return <rect fill={RANGE_FILL} height={height} rx={radius} ry={radius} width={width} x={x} y={y} />;
}

/** Rótulo da ponta esquerda: o menor ticket, ancorado em `x` e crescendo para a esquerda. */
function MinLabel({ x, y, height, value }: LabelProps): ReactElement | null {
  if (typeof value !== 'number') return null;
  return (
    <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="end" x={Number(x) - END_LABEL_GAP} y={Number(y) + Number(height) / 2}>
      {formatCurrencyCompact(value)}
    </text>
  );
}

/** Rótulo da ponta direita: o maior ticket, ancorado em `x + width` (ROT-2). */
function MaxLabel({ x, y, width, height, value }: LabelProps): ReactElement | null {
  if (typeof value !== 'number') return null;
  return (
    <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} style={HALO} x={Number(x) + Number(width) + END_LABEL_GAP} y={Number(y) + Number(height) / 2}>
      {formatCurrencyCompact(value)}
    </text>
  );
}

export default function TicketRangePlot({ data = defaultData, height, className }: TicketRangePlotProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = rankBySpan(data);
  const widest = rows[0];
  const narrowest = rows[rows.length - 1];
  const ceiling = maxOf(rows.map((row) => row.max));

  if (!widest || !narrowest || ceiling === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum segmento neste recorte: não houve venda ganha no semestre.</span>
      </div>
    );
  }

  const { domainMax, ticks } = niceScale(ceiling);
  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;
  const bounds = (row: RangeRow) => `de ${formatCurrencyCompact(row.min)} a ${formatCurrencyCompact(row.max)}`;
  const summary = [
    `Gráfico de faixas com o menor e o maior ticket das vendas ganhas em ${formatInt(rows.length)} segmentos, ordenado pela amplitude.`,
    `Maior amplitude: ${inSentence(widest.segment)}, ${bounds(widest)}.`,
    rows.length > 1 ? `Menor: ${inSentence(narrowest.segment)}, ${bounds(narrowest)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as RangeRow | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'min', name: 'Menor ticket', value: formatCurrencyCompact(row.min) },
      { dataKey: 'max', name: 'Maior ticket', value: formatCurrencyCompact(row.max) },
      { dataKey: 'span', name: 'Amplitude', value: formatCurrencyCompact(row.span) },
      { dataKey: 'deals', name: 'Vendas ganhas', value: formatInt(row.deals) },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.segment} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        Faixa: mínimo e máximo observados. Ordenado da maior para a menor amplitude.
      </p>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, domainMax]}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatCurrencyAxis(value)}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              type="number"
            />
            {/* O primeiro item do array nasce no alto em BarChart vertical (REC-3), então a maior amplitude vai primeiro. */}
            <YAxis axisLine={false} dataKey="segment" interval={0} tick={NameTick} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {/* Base invisível: empurra a cápsula até o menor valor sem desenhar nada (REC-8). */}
            <Bar dataKey="min" fill="none" isAnimationActive={false} stackId="range" />
            <Bar dataKey="span" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={Capsule} stackId="range">
              <LabelList content={MinLabel} dataKey="min" />
              <LabelList content={MaxLabel} dataKey="max" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
