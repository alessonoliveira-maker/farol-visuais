import { Filter } from 'lucide-react';
import { useId, type ReactElement } from 'react';
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  usePlotArea,
  useXAxisScale,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatDate, formatDecimal } from '@/lib/format';
import { cn } from '@/lib/utils';
import { cutDate as defaultCutDate, data as defaultData, type ForecastItem } from './data';

/** Ponte do realizado até hoje mais o projetado até o fim do período, com divisor na data de corte. */
export interface ForecastBridgeProps {
  readonly data?: readonly ForecastItem[];
  readonly cutDate?: string;
  readonly height?: number;
  readonly className?: string;
}

/**
 * Margem de baixo e de cima reservam o texto que o shape desenha fora da área de plotagem: duas
 * linhas de nome sob a base (EIX-6b) e valor mais a palavra projeção acima do total.
 * ESP-6, série única: corpo ≈ 574 x 225 px (seção 13). Sem eixo de valor (todo valor vem escrito,
 * ROT-2), sobram 574 − 16 = 558 px; 5 colunas dão passo = 111,6 px; barra = min(24, 111,6 × (1 − 2 × 0,32)
 * ≈ 40) = 24 px.
 */
const MARGIN = { top: 34, right: 8, bottom: 40, left: 8 } as const;
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const LABEL_GAP = 6;
const NAME_GAP = 16;
const BASIS_GAP = 30;
const CORNER = 3;
const HATCH_SIZE = 6;
const HATCH_OPACITY = 0.7;

interface ForecastRow extends ForecastItem {
  readonly low: number;
  readonly high: number;
  readonly end: number;
  readonly range: readonly [number, number];
  readonly isLast: boolean;
}

interface StepShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: ForecastRow;
}

/** Moeda curta que mantém duas casas no milhão: R$ 1,84 mi (o compacto do Farol arredonda para R$ 1,8 mi). */
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

/** Cada passo nasce onde o anterior terminou; o total reancora no valor dele. */
function buildRows(items: readonly ForecastItem[]): readonly ForecastRow[] {
  let running = 0;
  return items.map((item, index) => {
    const start = item.kind === 'total' ? 0 : running;
    const end = item.kind === 'total' ? item.value : running + item.value;
    const low = Math.min(start, end);
    const high = Math.max(start, end);
    running = end;
    return { ...item, low, high, end, range: [low, high], isLast: index === items.length - 1 };
  });
}

/** Soma dos passos de um regime; `null` quando não há passo nele. */
function sumBasis(items: readonly ForecastItem[], basis: ForecastItem['basis']): number | null {
  const steps = items.filter((item) => item.kind === 'step' && item.basis === basis);
  if (steps.length === 0) return null;
  return steps.reduce((acc, item) => acc + item.value, 0);
}

/** Quanto a soma dos passos erra o total; `null` sem total ou sem passos. */
function closureGap(items: readonly ForecastItem[]): number | null {
  const total = items.find((item) => item.kind === 'total');
  const steps = items.filter((item) => item.kind === 'step');
  if (!total || steps.length === 0) return null;
  return total.value - steps.reduce((acc, item) => acc + item.value, 0);
}

/** Divisor na fronteira entre a última banda realizada e a primeira projetada (a banda começa nela). */
function CutMarker({ firstProjectedId, text }: { readonly firstProjectedId: string; readonly text: string }): ReactElement | null {
  const plot = usePlotArea();
  const scale = useXAxisScale();
  const edge = scale ? scale(firstProjectedId) : undefined;
  if (!plot || typeof edge !== 'number') return null;
  return (
    <g>
      <line stroke="var(--text-secondary)" strokeDasharray="4 3" strokeWidth={1} x1={edge} x2={edge} y1={plot.y - 14} y2={plot.y + plot.height} />
      <text className="font-sans tabular-nums" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={edge - 6} y={plot.y - 6}>
        {text}
      </text>
    </g>
  );
}

/**
 * O shape desenha tudo da coluna: retângulo, rótulo, nome sob a base e conector até a seguinte. O
 * nome mora aqui porque setembro aparece duas vezes e precisa de uma segunda linha com o regime; a
 * largura da banda e a base da área vêm de usePlotArea, que só funciona dentro de um componente.
 */
function ForecastStep({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  count,
  patternId,
}: StepShapeProps & { readonly count: number; readonly patternId: string }): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  const isTotal = payload.kind === 'total';
  const isProjected = payload.basis === 'projetado';
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const band = plot ? plot.width / count : 0;
  const baseline = plot ? plot.y + plot.height : bottom;
  const cx = x + width / 2;
  const valueY = isTotal ? top - LABEL_GAP - 13 : top - LABEL_GAP;
  return (
    <g>
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={top} y2={top} />
      ) : null}
      <rect
        fill={isProjected ? `url(#${patternId})` : 'var(--chart-1)'}
        height={Math.max(bottom - top, 2)}
        rx={CORNER}
        stroke={isProjected ? 'var(--chart-1)' : 'none'}
        strokeWidth={isProjected ? 1 : 0}
        width={width}
        x={x}
        y={top}
      />
      <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={isTotal ? 700 : 500} textAnchor="middle" x={cx} y={valueY}>
        {isTotal ? money(payload.value) : signedMoney(payload.value)}
      </text>
      {isTotal ? (
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={top - LABEL_GAP}>
          projeção
        </text>
      ) : null}
      <text className="font-sans" fill="var(--text-secondary)" fontSize={11} textAnchor="middle" x={cx} y={baseline + NAME_GAP}>
        {payload.label}
      </text>
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={baseline + BASIS_GAP}>
        {payload.basis}
      </text>
    </g>
  );
}

export default function ForecastBridge({ data = defaultData, cutDate = defaultCutDate, height, className }: ForecastBridgeProps) {
  const animate = useAnimateOnce();
  const patternId = `hachura-${useId().replace(/:/g, '')}`;
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
  const firstProjected = rows.find((row) => row.kind === 'step' && row.basis === 'projetado');
  const realized = sumBasis(data, 'realizado');
  const projected = sumBasis(data, 'projetado');
  const gap = closureGap(data);
  const peak = rows.reduce((max, row) => Math.max(max, row.high), 0);

  const stepText = rows
    .filter((row) => row.kind === 'step')
    .map((row) => `${row.label.toLowerCase()} ${row.basis} ${money(row.value)}`)
    .join(', ');
  const summary =
    `Gráfico de cascata do fechamento projetado da receita, lido em ${formatDate(cutDate)}: ${stepText}` +
    `${total ? `. Total projetado de ${money(total.value)}` : ''}.`;
  const reading =
    realized === null || projected === null
      ? 'Sem separação entre realizado e projetado neste recorte'
      : `${total ? `Projeção de ${money(total.value)}: ` : ''}${money(realized)} realizados e ${money(projected)} a realizar`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as ForecastRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const payload =
      row.kind === 'total'
        ? [{ ...base, color: 'var(--chart-1)', name: 'Valor exato, projeção', value: formatCurrency(row.value, 0) }]
        : [
            { ...base, color: 'var(--chart-1)', name: 'Valor exato', value: formatCurrency(row.value, 0) },
            { ...base, color: 'var(--text-muted)', name: 'Acumulado após o passo', value: formatCurrency(row.end, 0) },
          ];
    return <ChartTooltip active label={`${row.label}, ${row.basis}`} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs font-medium text-text-secondary">
        {reading}
        {gap !== null && gap !== 0 ? `; os passos não fecham em ${signedMoney(gap)}` : ''}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <defs>
              <pattern height={HATCH_SIZE} id={patternId} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width={HATCH_SIZE}>
                <rect fill="var(--surface-raised)" height={HATCH_SIZE} width={HATCH_SIZE} />
                <line stroke="var(--chart-1)" strokeOpacity={HATCH_OPACITY} strokeWidth={1.5} x1={0} x2={0} y1={0} y2={HATCH_SIZE} />
              </pattern>
            </defs>
            <XAxis dataKey="id" hide />
            <YAxis domain={[0, peak]} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <ForecastStep {...props} count={rows.length} patternId={patternId} />}
            />
            {firstProjected ? <CutMarker firstProjectedId={firstProjected.id} text={`realizado até ${formatDate(cutDate)}`} /> : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
