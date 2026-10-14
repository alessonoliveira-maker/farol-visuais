import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  usePlotArea,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatDecimal } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ScenarioBridge, type ScenarioItem } from './data';

/** Ponte em faixa que acende o passo de maior amplitude: é ali que medir mais estreita a saída. */
export interface ScenarioWaterfallProps {
  readonly data?: ScenarioBridge;
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 62, right: 8, bottom: 0, left: 8 } as const;
/**
 * ESP-6, série única: corpo ≈ 894 x 265 px (seção 13). Sem eixo de valor (todo valor vem escrito,
 * ROT-2), sobram 894 − 16 = 878 px; 5 colunas dão passo = 175,6 px; barra = min(24, 175,6 × (1 − 2 × 0,32)
 * ≈ 63) = 24 px.
 */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const CATEGORY_AXIS_HEIGHT = 28;
const LABEL_GAP = 6;
const LINE_STEP = 14;
const CAP_HALF = 7;
const BAND_OPACITY = 0.7;
const CORNER = 3;
const ANNOTATION_Y = 12;

interface ScenarioRow extends ScenarioItem {
  readonly start: number;
  readonly end: number;
  readonly envLow: number;
  readonly envHigh: number;
  readonly range: readonly [number, number];
  readonly isLast: boolean;
}

interface ColumnShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: ScenarioRow;
}

interface HighlightProps {
  readonly count: number;
  readonly highlightId: string | null;
  readonly note: string;
}

/** Amplitude do passo: máximo menos mínimo declarados. */
function amplitudeOf(item: ScenarioItem): number {
  return item.high - item.low;
}

/** O passo incerto de maior amplitude; `null` sem passo incerto (EST-1b). Empate fica com o primeiro. */
function widestStep(items: readonly ScenarioItem[]): ScenarioItem | null {
  let best: ScenarioItem | null = null;
  for (const item of items) {
    if (item.kind === 'step' && amplitudeOf(item) > 0 && (best === null || amplitudeOf(item) > amplitudeOf(best))) best = item;
  }
  return best;
}

/** Moeda sem arredondar a faixa: o milhão leva duas casas (R$ 1,56 mi), o resto segue o formatador do eixo. */
function money(value: number): string {
  const absolute = Math.abs(value);
  if (absolute < 1e6) return formatCurrencyAxis(value);
  return `${value < 0 ? '−' : ''}R$ ${formatDecimal(absolute / 1e6, 2)} mi`;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signed(value: number): string {
  if (value === 0) return money(0);
  return `${value > 0 ? '+' : '−'}${money(Math.abs(value))}`;
}

/** Cada passo nasce no esperado acumulado do anterior; base e saída reancoram no zero. */
function buildRows(items: readonly ScenarioItem[]): readonly ScenarioRow[] {
  let running = 0;
  return items.map((item, index) => {
    const isStep = item.kind === 'step';
    const start = isStep ? running : 0;
    const end = isStep ? running + item.expected : item.expected;
    // Os quatro pontos que a coluna toca: o envelope é o menor e o maior deles.
    const lowEdge = isStep ? start + item.low : item.low;
    const highEdge = isStep ? start + item.high : item.high;
    const bodyFrom = isStep ? start : 0;
    const envLow = Math.min(bodyFrom, end, lowEdge, highEdge);
    const envHigh = Math.max(bodyFrom, end, lowEdge, highEdge);
    running = end;
    return { ...item, start, end, envLow, envHigh, range: [envLow, envHigh], isLast: index === items.length - 1 };
  });
}

/** Quanto o esperado da saída erra base mais passos esperados; `null` sem base, passos ou saída. */
function closureGap(items: readonly ScenarioItem[]): number | null {
  const base = items.find((item) => item.kind === 'base');
  const result = items.find((item) => item.kind === 'result');
  const steps = items.filter((item) => item.kind === 'step');
  if (!base || !result || steps.length === 0) return null;
  return result.expected - steps.reduce((acc, item) => acc + item.expected, base.expected);
}

/**
 * O shape desenha tudo da coluna: corpo, intervalo, rótulo e conector. O Bar recebe o envelope
 * [menor, maior] de tudo o que a coluna toca; a escala em px por real sai dele (altura ÷ amplitude),
 * e com ela o shape posiciona esperado, mínimo e máximo. A largura da banda vem de usePlotArea,
 * que só funciona dentro de um componente, não numa função de shape.
 */
function ScenarioColumn({ x = 0, y = 0, width = 0, height = 0, payload, count, highlightId, note }: ColumnShapeProps & HighlightProps): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const span = payload.envHigh - payload.envLow;
  // Amplitude zero: todo valor coincide com o topo e o piso do divisor não desloca nada.
  const unit = Math.abs(height) / Math.max(span, 1e-9);
  const yOf = (value: number): number => top + (payload.envHigh - value) * unit;
  const cx = x + width / 2;
  const band = plot ? plot.width / count : 0;
  const isStep = payload.kind === 'step';
  const isResult = payload.kind === 'result';
  const uncertain = isStep && payload.low !== payload.high;
  const lit = payload.id === highlightId;
  // Destaque em --chart-1 só no passo de maior amplitude; o resto vai em neutro (COR-1).
  const fill = lit ? 'var(--chart-1)' : 'var(--text-secondary)';
  const bodyTop = yOf(Math.max(payload.start, payload.end));
  const bodyBottom = yOf(Math.min(payload.start, payload.end));
  const levelY = yOf(payload.end);
  const capHigh = yOf(payload.start + payload.high);
  const capLow = yOf(payload.start + payload.low);
  const innerFrom = Math.max(capHigh, bodyTop);
  const innerTo = Math.min(capLow, bodyBottom);
  const labelY = top - LABEL_GAP;
  return (
    <g>
      {!payload.isLast && !isResult && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={levelY} y2={levelY} />
      ) : null}
      {isResult ? (
        <>
          <rect fill="var(--text-secondary)" fillOpacity={BAND_OPACITY} height={Math.max(yOf(payload.low) - yOf(payload.high), 2)} rx={CORNER} stroke="var(--text-secondary)" strokeWidth={1.5} width={width} x={x} y={yOf(payload.high)} />
          <line stroke="var(--text-primary)" strokeWidth={2} x1={x - CAP_HALF} x2={x + width + CAP_HALF} y1={levelY} y2={levelY} />
        </>
      ) : (
        <rect fill={fill} height={Math.max(bodyBottom - bodyTop, 2)} rx={CORNER} width={width} x={x} y={bodyTop} />
      )}
      {uncertain ? (
        <g stroke="var(--text-primary)" strokeWidth={2}>
          <line x1={cx} x2={cx} y1={yOf(payload.start + payload.high)} y2={yOf(payload.start + payload.low)} />
          <line x1={cx - CAP_HALF} x2={cx + CAP_HALF} y1={yOf(payload.start + payload.high)} y2={yOf(payload.start + payload.high)} />
          <line x1={cx - CAP_HALF} x2={cx + CAP_HALF} y1={yOf(payload.start + payload.low)} y2={yOf(payload.start + payload.low)} />
        </g>
      ) : null}
      {uncertain ? (
        // TOK-10: o trecho do intervalo que cruza o corpo tem o corpo como fundo; ali o traço troca para a superfície.
        <g stroke="var(--surface-raised)" strokeWidth={2}>
          {capHigh < capLow && innerFrom < innerTo ? <line x1={cx} x2={cx} y1={innerFrom} y2={innerTo} /> : null}
          {capHigh > bodyTop + 1 && capHigh < bodyBottom - 1 ? <line x1={cx - CAP_HALF} x2={cx + CAP_HALF} y1={capHigh} y2={capHigh} /> : null}
          {capLow > bodyTop + 1 && capLow < bodyBottom - 1 ? <line x1={cx - CAP_HALF} x2={cx + CAP_HALF} y1={capLow} y2={capLow} /> : null}
        </g>
      ) : null}
      {isResult ? (
        <>
          <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={labelY - LINE_STEP}>
            esperado
          </text>
          <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={600} textAnchor="middle" x={cx} y={labelY}>
            {money(payload.expected)}
          </text>
          <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor="middle" x={cx} y={yOf(payload.low) + LINE_STEP + 2}>
            de {money(payload.low)}
          </text>
          <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor="middle" x={cx} y={yOf(payload.low) + 2 * LINE_STEP + 2}>
            a {money(payload.high)}
          </text>
        </>
      ) : isStep ? (
        <>
          <text className="font-display" fill={lit ? 'var(--text-primary)' : 'var(--text-secondary)'} fontSize={12} fontWeight={lit ? 700 : 500} textAnchor="middle" x={cx} y={labelY - LINE_STEP}>
            {signed(payload.expected)}
          </text>
          <text className="font-display" fill={lit ? 'var(--text-primary)' : 'var(--text-muted)'} fontSize={11} fontWeight={lit ? 700 : 500} textAnchor="middle" x={cx} y={labelY}>
            amplitude {money(amplitudeOf(payload))}
          </text>
        </>
      ) : (
        <text className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={600} textAnchor="middle" x={cx} y={labelY}>
          {money(payload.expected)}
        </text>
      )}
      {lit ? (
        <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={ANNOTATION_Y}>
          {note}
        </text>
      ) : null}
    </g>
  );
}

export default function ScenarioWaterfall({ data = defaultData, highlightId, height, className }: ScenarioWaterfallProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = buildRows(data.items);
  const base = rows.find((row) => row.kind === 'base');
  const result = rows.find((row) => row.kind === 'result');

  if (!base || !result) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum cenário neste recorte: sem base contratada e saída projetada, não há ponte para desenhar.
      </div>
    );
  }

  const gap = closureGap(data.items);
    const peak = rows.reduce((max, row) => Math.max(max, row.envHigh), 0);
  const widest = widestStep(data.items);
  const litId = highlightId ?? widest?.id ?? null;
  const lit = rows.find((row) => row.id === litId);
  const others = lit ? rows.filter((row) => row.kind === 'step' && row.id !== lit.id).reduce((acc, row) => acc + amplitudeOf(row), 0) : 0;

  const summary = lit
    ? `Gráfico de cascata da receita de ${data.period} em faixa, de ${money(result.low)} a ${money(result.high)}: ${lit.label.toLowerCase()} concentra a incerteza, com amplitude de ${money(amplitudeOf(lit))}.`
    : `Gráfico de cascata da receita de ${data.period} em faixa, de ${money(result.low)} a ${money(result.high)}, esperado ${money(result.expected)}.`;
  const reading = lit
    ? `${lit.label} tem amplitude de ${money(amplitudeOf(lit))}, ${amplitudeOf(lit) > others ? 'mais que' : amplitudeOf(lit) === others ? 'tanto quanto' : 'menos que'} os demais passos somados (${money(others)}): medir esse passo estreita a faixa do total` +
      (gap !== null && gap !== 0 ? `; os passos esperados não fecham em ${signed(gap)}` : '') +
      '.'
    : `Saída de ${money(result.low)} a ${money(result.high)}, sem passo incerto para estreitar.`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as ScenarioRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const first = props.payload[0]!;
    const color = row.kind === 'step' ? (row.expected >= 0 ? 'var(--positive)' : 'var(--negative)') : 'var(--chart-1)';
    const signedExact = (value: number): string => `${value < 0 ? '−' : value > 0 ? '+' : ''}${formatCurrency(Math.abs(value), 0)}`;
    const payload =
      row.kind === 'base'
        ? [{ ...first, color, name: 'Valor certo', value: formatCurrency(row.expected, 0) }]
        : row.kind === 'result'
          ? [
              { ...first, color, name: 'Esperado', value: formatCurrency(row.expected, 0) },
              { ...first, color: 'var(--text-muted)', name: 'Faixa', value: `${formatCurrency(row.low, 0)} a ${formatCurrency(row.high, 0)}` },
            ]
          : [
              { ...first, color, name: 'Esperado', value: signedExact(row.expected) },
              { ...first, color: 'var(--text-muted)', name: 'Intervalo', value: `${signedExact(row.low)} a ${signedExact(row.high)}` },
              { ...first, color: 'var(--text-muted)', name: 'Acumulado esperado', value: formatCurrency(row.end, 0) },
            ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs font-medium text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="label" height={CATEGORY_AXIS_HEIGHT} interval={0} tickMargin={8} />
            <YAxis domain={[0, peak]} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: ColumnShapeProps) => <ScenarioColumn {...props} count={rows.length} highlightId={litId} note="medir este passo estreita a faixa do total" />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Barra: valor esperado. Traço: intervalo declarado do passo. Amplitude: máximo menos mínimo do passo. Faixa: saída.
      </p>
    </div>
  );
}
