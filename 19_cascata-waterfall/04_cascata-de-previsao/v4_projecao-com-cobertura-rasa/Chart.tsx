import { Filter } from 'lucide-react';
import { useId, type ReactElement } from 'react';
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  usePlotArea,
  useYAxisScale,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatDecimal, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { coverage as defaultCoverage, data as defaultData, type Coverage, type ForecastItem } from './data';

/** Ponte da projeção com dois graus de hachura: o que tem data de fechamento e o que é estimativa sem data. */
export interface ShallowCoverageForecastProps {
  readonly data?: readonly ForecastItem[];
  readonly coverage?: Coverage;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Margem de baixo reserva as duas linhas de nome sob a base (EIX-6b); a de cima, o rótulo do total.
 * ESP-6, série única: corpo ≈ 574 x 225 px (seção 13). Sem eixo de valor (ROT-2), sobram
 * 574 − 16 = 558 px; 4 colunas dão passo = 139,5 px; barra = min(24, 139,5 × (1 − 2 × 0,32)
 * ≈ 50) = 24 px.
 */
const MARGIN = { top: 24, right: 8, bottom: 40, left: 8 } as const;
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const LABEL_GAP = 6;
const NAME_GAP = 16;
const BASIS_GAP = 30;
const CORNER = 3;
const HATCH_FINE = 6;
const HATCH_WIDE = 12;
const HATCH_OPACITY = 0.7;
const DASH = '3 2';

type Basis = ForecastItem['basis'];

interface Segment {
  readonly basis: Basis;
  readonly from: number;
  readonly to: number;
}

interface ForecastRow extends ForecastItem {
  readonly low: number;
  readonly high: number;
  readonly end: number;
  readonly range: readonly [number, number];
  readonly isLast: boolean;
  readonly segments: readonly Segment[];
}

interface StepShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: ForecastRow;
}

const BASIS_TEXT: Record<Basis, string> = {
  realizado: 'realizado',
  datado: 'com data',
  estimado: 'sem data',
};
/** Segunda linha sob a coluna: o nome da coluna já diz o grau, então o realizado diz de onde vem. */
const SUB_TEXT: Record<Basis, string> = {
  realizado: 'já medido',
  datado: 'com data',
  estimado: 'sem data',
};

/** Moeda curta: abaixo do milhão o eixo do Farol já escreve R$ 214 mil; acima, duas casas no milhão. */
function money(value: number): string {
  const absolute = Math.abs(value);
  if (absolute < 1_000_000) return formatCurrencyAxis(value);
  return `${value < 0 ? '−' : ''}R$ ${formatDecimal(absolute / 1_000_000, 2)} mi`;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signedMoney(value: number): string {
  if (value === 0) return money(0);
  return `${value > 0 ? '+' : '−'}${money(Math.abs(value))}`;
}

/** Cada passo nasce onde o anterior terminou; o total reancora no valor dele e empilha os passos. */
function buildRows(items: readonly ForecastItem[]): readonly ForecastRow[] {
  const steps: Segment[] = [];
  let running = 0;
  for (const item of items) {
    if (item.kind === 'step') {
      steps.push({ basis: item.basis, from: running, to: running + item.value });
      running += item.value;
    }
  }
  running = 0;
  return items.map((item, index) => {
    const start = item.kind === 'total' ? 0 : running;
    const end = item.kind === 'total' ? item.value : running + item.value;
    const low = Math.min(start, end);
    const high = Math.max(start, end);
    running = end;
    const segments: readonly Segment[] = item.kind === 'total' ? steps : [{ basis: item.basis, from: start, to: end }];
    return { ...item, low, high, end, range: [low, high], isLast: index === items.length - 1, segments };
  });
}

/** Quanto a soma dos passos erra o total; `null` sem total ou sem passos. */
function closureGap(items: readonly ForecastItem[]): number | null {
  const total = items.find((item) => item.kind === 'total');
  const steps = items.filter((item) => item.kind === 'step');
  if (!total || steps.length === 0) return null;
  return total.value - steps.reduce((acc, item) => acc + item.value, 0);
}

/** Soma dos passos de um grau de confiança; `null` quando não há passo nele. */
function sumBasis(items: readonly ForecastItem[], basis: Basis): number | null {
  const steps = items.filter((item) => item.kind === 'step' && item.basis === basis);
  if (steps.length === 0) return null;
  return steps.reduce((acc, item) => acc + item.value, 0);
}

/** Os dois padrões de hachura: fino para o que tem data, largo para o que é estimativa sem data. */
function HatchDefs({ fineId, wideId }: { readonly fineId: string; readonly wideId: string }): ReactElement {
  return (
    <defs>
      <pattern height={HATCH_FINE} id={fineId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={HATCH_FINE}>
        <rect fill="var(--surface-raised)" height={HATCH_FINE} width={HATCH_FINE} />
        <line stroke="var(--chart-1)" strokeOpacity={HATCH_OPACITY} strokeWidth={1.5} x1={0} x2={0} y1={0} y2={HATCH_FINE} />
      </pattern>
      <pattern height={HATCH_WIDE} id={wideId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={HATCH_WIDE}>
        <rect fill="var(--surface-raised)" height={HATCH_WIDE} width={HATCH_WIDE} />
        <line stroke="var(--chart-1)" strokeOpacity={HATCH_OPACITY} strokeWidth={1.5} x1={0} x2={0} y1={0} y2={HATCH_WIDE} />
      </pattern>
    </defs>
  );
}

/**
 * O shape desenha tudo da coluna: retângulo (empilhado nos três graus no total), rótulo, nome sob a
 * base e conector até a seguinte. Os limites do empilhado vêm da escala do eixo (useYAxisScale).
 */
function ForecastStep({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  count,
  fineId,
  wideId,
}: StepShapeProps & { readonly count: number; readonly fineId: string; readonly wideId: string }): ReactElement | null {
  const plot = usePlotArea();
  const yScale = useYAxisScale();
  if (!payload) return null;
  const isTotal = payload.kind === 'total';
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const band = plot ? plot.width / count : 0;
  const baseline = plot ? plot.y + plot.height : bottom;
  const cx = x + width / 2;
  const parts = payload.segments.map((segment) => {
    const upper = yScale ? yScale(segment.to) : undefined;
    const lower = yScale ? yScale(segment.from) : undefined;
    const partTop = typeof upper === 'number' ? Math.min(upper, lower ?? upper) : top;
    const partBottom = typeof lower === 'number' ? Math.max(lower, upper ?? lower) : bottom;
    return { ...segment, partTop, partBottom };
  });
  return (
    <g>
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={top} y2={top} />
      ) : null}
      {parts.map((part) => (
        <rect
          key={`${part.basis}-${String(part.from)}`}
          fill={part.basis === 'realizado' ? 'var(--chart-1)' : `url(#${part.basis === 'datado' ? fineId : wideId})`}
          height={Math.max(part.partBottom - part.partTop, 1)}
          rx={CORNER}
          stroke={part.basis === 'realizado' ? 'none' : 'var(--chart-1)'}
          strokeDasharray={part.basis === 'estimado' ? DASH : undefined}
          strokeWidth={part.basis === 'realizado' ? 0 : 1}
          width={width}
          x={x}
          y={part.partTop}
        />
      ))}
      <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={isTotal ? 700 : 500} textAnchor="middle" x={cx} y={top - LABEL_GAP}>
        {isTotal ? money(payload.value) : signedMoney(payload.value)}
      </text>
      <text className="font-sans" fill="var(--text-secondary)" fontSize={11} textAnchor="middle" x={cx} y={baseline + NAME_GAP}>
        {payload.label}
      </text>
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={baseline + BASIS_GAP}>
        {isTotal ? 'com estimado' : SUB_TEXT[payload.basis]}
      </text>
    </g>
  );
}

/** Amostra da legenda na forma da marca: sólida, hachura fina ou hachura larga tracejada. */
function Swatch({ kind }: { readonly kind: Basis }): ReactElement {
  const step = kind === 'estimado' ? 5 : 2.5;
  return (
    <svg aria-hidden className="size-3 shrink-0" viewBox="0 0 12 12">
      <rect
        fill={kind === 'realizado' ? 'var(--chart-1)' : 'none'}
        height={11}
        rx={2}
        stroke="var(--chart-1)"
        strokeDasharray={kind === 'estimado' ? DASH : undefined}
        strokeWidth={1}
        width={11}
        x={0.5}
        y={0.5}
      />
      {kind === 'realizado' ? null : (
        <g stroke="var(--chart-1)" strokeOpacity={HATCH_OPACITY} strokeWidth={1}>
          {[2, 2 + step, 2 + step * 2].filter((start) => start <= 9).map((start) => (
            <line key={start} x1={start} x2={start + 3} y1={11} y2={0} />
          ))}
        </g>
      )}
    </svg>
  );
}

export default function ShallowCoverageForecast({ data = defaultData, coverage = defaultCoverage, height, className }: ShallowCoverageForecastProps) {
  const animate = useAnimateOnce();
  const uid = useId().replace(/:/g, '');
  const fineId = `hachura-fina-${uid}`;
  const wideId = `hachura-larga-${uid}`;
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum passo neste recorte: não há receita realizada nem projetada para montar o fechamento.</span>
      </div>
    );
  }

  const rows = buildRows(data);
  const total = rows.find((row) => row.kind === 'total');
  const gap = closureGap(data);
  const estimated = sumBasis(data, 'estimado');
  const peak = rows.reduce((max, row) => Math.max(max, row.high), 0);

  const stepText = rows
    .filter((row) => row.kind === 'step')
    .map((row) => `${row.label.toLowerCase()} ${BASIS_TEXT[row.basis]} ${money(row.value)}`)
    .join(', ');
  const rate = coverage.open > 0 ? formatRateWithVolume(coverage.withDate, coverage.open) : null;
  const summary =
    `Gráfico de cascata da projeção do mês: ${stepText}${total ? `, total de ${money(total.value)}` : ''}. ` +
    `${rate ? `Só ${rate} das oportunidades abertas têm data de fechamento.` : 'Não há oportunidades abertas para medir a cobertura.'}`;
  const reading = rate
    ? `Projeção sobre ${rate} das oportunidades abertas${estimated !== null ? `; ${money(estimated)} estimados ficam sem data` : ''}`
    : 'Sem oportunidades abertas para medir a cobertura da data de fechamento';

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as ForecastRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const payload =
      row.kind === 'total'
        ? row.segments.map((segment) => ({
            ...base,
            color: 'var(--chart-1)',
            name: `${BASIS_TEXT[segment.basis]}`,
            value: formatCurrency(segment.to - segment.from, 0),
          }))
        : [
            { ...base, color: 'var(--chart-1)', name: 'Valor exato', value: formatCurrency(row.value, 0) },
            { ...base, color: 'var(--text-muted)', name: 'Acumulado após o passo', value: formatCurrency(row.end, 0) },
          ];
    return <ChartTooltip active label={row.kind === 'total' ? 'Total por grau de confiança' : `${row.label}, ${BASIS_TEXT[row.basis]}`} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="shrink-0 text-xs font-medium text-text-secondary">
        {reading}
        {gap !== null && gap !== 0 ? `; os passos não fecham em ${signedMoney(gap)}` : ''}
      </p>
      <div aria-hidden className="mb-2 mt-1 flex shrink-0 items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <Swatch kind="realizado" />
          realizado
        </span>
        <span className="flex items-center gap-1.5">
          <Swatch kind="datado" />
          projetado com data
        </span>
        <span className="flex items-center gap-1.5">
          <Swatch kind="estimado" />
          estimado sem data
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <HatchDefs fineId={fineId} wideId={wideId} />
            <XAxis dataKey="id" hide />
            <YAxis domain={[0, peak]} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <ForecastStep {...props} count={rows.length} fineId={fineId} wideId={wideId} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
