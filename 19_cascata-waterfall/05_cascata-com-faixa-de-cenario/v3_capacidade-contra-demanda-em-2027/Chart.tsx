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
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ScenarioBridge, type ScenarioItem } from './data';

/** Ponte de capacidade com intervalo nos passos e a demanda projetada cruzando a faixa de saída. */
export interface ScenarioWaterfallProps {
  readonly data?: ScenarioBridge;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 47, right: 104, bottom: 0, left: 8 } as const;
/**
 * ESP-6, série única: corpo ≈ 894 x 265 px (seção 13). Sem eixo de valor (todo valor vem escrito,
 * ROT-2) e com 104 px de margem à direita para a nota da demanda, sobram 894 − 112 = 782 px; 5 colunas
 * dão passo = 156 px; barra = min(24, 156 × (1 − 2 × 0,32) ≈ 56) = 24 px.
 */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const CATEGORY_AXIS_HEIGHT = 28;
const LABEL_GAP = 6;
const LINE_STEP = 14;
const CAP_HALF = 7;
const BAND_OPACITY = 0.7;
const CORNER = 3;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface ScenarioRow extends ScenarioItem {
  readonly start: number;
  readonly end: number;
  readonly envLow: number;
  readonly envHigh: number;
  readonly range: readonly [number, number];
  readonly isLast: boolean;
}

interface ColumnExtras {
  readonly count: number;
  readonly demand: number;
  readonly unit: string;
}

interface ColumnShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: ScenarioRow;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signed(value: number): string {
  if (value === 0) return formatInt(0);
  return `${value > 0 ? '+' : '−'}${formatInt(Math.abs(value))}`;
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
 * [menor, maior] de tudo o que a coluna toca; a escala em px por unidade sai dele (altura ÷ amplitude),
 * e com ela o shape posiciona esperado, mínimo, máximo e a demanda. A largura da banda vem de
 * usePlotArea, que só funciona dentro de um componente, não numa função de shape.
 */
function ScenarioColumn({ x = 0, y = 0, width = 0, height = 0, payload, count, demand, unit }: ColumnShapeProps & ColumnExtras): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const span = payload.envHigh - payload.envLow;
  // Amplitude zero: todo valor coincide com o topo e o piso do divisor não desloca nada.
  const unitPx = Math.abs(height) / Math.max(span, 1e-9);
  const yOf = (value: number): number => top + (payload.envHigh - value) * unitPx;
  const cx = x + width / 2;
  const band = plot ? plot.width / count : 0;
  const isStep = payload.kind === 'step';
  const isResult = payload.kind === 'result';
  const uncertain = isStep && payload.low !== payload.high;
  const fill = isStep ? (payload.expected >= 0 ? 'var(--positive)' : 'var(--negative)') : 'var(--chart-1)';
  const bodyTop = yOf(Math.max(payload.start, payload.end));
  const bodyBottom = yOf(Math.min(payload.start, payload.end));
  const levelY = yOf(payload.end);
  const capHigh = yOf(payload.start + payload.high);
  const capLow = yOf(payload.start + payload.low);
  const innerFrom = Math.max(capHigh, bodyTop);
  const innerTo = Math.min(capLow, bodyBottom);
  // O bloco de duas linhas do rótulo não pode ser riscado pela linha da demanda: se ela cai no bloco, o bloco sobe para acima dela.
  const demandY = yOf(demand);
  const clash = !isResult && demandY >= top - LABEL_GAP - LINE_STEP - 10 && demandY <= top - LABEL_GAP + 6;
  const labelY = clash ? demandY - 8 - 3 : top - LABEL_GAP;
  // A demanda corta a faixa: o que fica abaixo dela é capacidade que não alcança a demanda.
  const cut = Math.min(Math.max(demand, payload.low), payload.high);
  const shortfall = payload.low - demand;
  const mid = (yOf(cut) + yOf(payload.low)) / 2;
  return (
    <g>
      {!payload.isLast && !isResult && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={levelY} y2={levelY} />
      ) : null}
      {isResult ? (
        <>
          <rect fill="var(--positive)" fillOpacity={BAND_OPACITY} height={Math.max(yOf(cut) - yOf(payload.high), 0)} stroke="var(--positive)" strokeWidth={1.5} width={width} x={x} y={yOf(payload.high)} />
          <rect fill="var(--negative)" fillOpacity={BAND_OPACITY} height={Math.max(yOf(payload.low) - yOf(cut), 0)} stroke="var(--negative)" strokeWidth={1.5} width={width} x={x} y={yOf(cut)} />
          <line stroke="var(--text-primary)" strokeWidth={2} x1={x - CAP_HALF} x2={x + width + CAP_HALF} y1={levelY} y2={levelY} />
          {shortfall < 0 ? (
            <>
              <line stroke="var(--negative)" strokeWidth={2} x1={x + width + 8} x2={x + width + 8} y1={yOf(cut)} y2={yOf(payload.low)} />
              <text fill="var(--negative)" fontSize={11} fontWeight={600} style={HALO} textAnchor="start" x={x + width + 16} y={mid - 2}>
                abaixo da demanda
              </text>
              <text className="font-display" fill="var(--negative)" fontSize={11} fontWeight={600} style={HALO} textAnchor="start" x={x + width + 16} y={mid + LINE_STEP - 2}>
                até {signed(shortfall)} {unit}
              </text>
            </>
          ) : null}
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
            {formatInt(payload.expected)} {unit}
          </text>
          <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor="middle" x={cx} y={yOf(payload.low) + LINE_STEP + 2}>
            de {formatInt(payload.low)} a {formatInt(payload.high)}
          </text>
          <text className="font-display" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor="middle" x={cx} y={yOf(payload.low) + 2 * LINE_STEP + 2}>
            {unit}
          </text>
        </>
      ) : (
        <>
          <text className="font-display" fill={isStep ? fill : 'var(--text-primary)'} fontSize={12} fontWeight={isStep ? 500 : 600} textAnchor="middle" x={cx} y={labelY - LINE_STEP}>
            {isStep ? signed(payload.expected) : formatInt(payload.expected)}
          </text>
          <text className="font-display" fill="var(--text-muted)" fontSize={11} fontWeight={500} textAnchor="middle" x={cx} y={labelY}>
            {unit}
          </text>
        </>
      )}
    </g>
  );
}

export default function ScenarioWaterfall({ data = defaultData, height, className }: ScenarioWaterfallProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = buildRows(data.items);
  const base = rows.find((row) => row.kind === 'base');
  const result = rows.find((row) => row.kind === 'result');

  if (!base || !result) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum cenário neste recorte: sem capacidade atual e saída projetada, não há ponte para desenhar.
      </div>
    );
  }

  const unit = data.unit;
  const gap = closureGap(data.items);
  const peak = rows.reduce((max, row) => Math.max(max, row.envHigh, data.demand), 0);
  const bandWidth = result.high - result.low;
  // Parte da faixa abaixo da demanda; `null` com faixa sem largura (EST-1b).
  const below = bandWidth > 0 ? Math.min(Math.max((data.demand - result.low) / bandWidth, 0), 1) : null;
  const belowText = below === null ? 'uma faixa sem largura' : `${formatPercent(below, 0)} da faixa`;
  const expectedVsDemand = result.expected - data.demand;
  const names = (basis: ScenarioItem['basis']): string =>
    rows
      .filter((row) => row.basis === basis && row.kind !== 'result')
      .map((row) => row.label.toLowerCase())
      .join(' e ');

  const summary =
    `Gráfico de cascata da capacidade de pré-vendas em ${data.period}: de ${formatInt(base.expected)} ${unit} para uma faixa de ${formatInt(result.low)} a ${formatInt(result.high)}, esperado ${formatInt(result.expected)}. ` +
    `A demanda de ${formatInt(data.demand)} ${unit} cai a ${belowText}.`;
  const reading =
    `Capacidade de ${formatInt(result.low)} a ${formatInt(result.high)} ${unit}, esperado ${formatInt(result.expected)}. ` +
    `A demanda de ${formatInt(data.demand)} ${unit} cai a ${belowText}; ` +
    `o esperado fica ${formatInt(Math.abs(expectedVsDemand))} ${unit} ${expectedVsDemand < 0 ? 'abaixo' : 'acima'} dela` +
    (gap !== null && gap !== 0 ? `; os passos esperados não fecham em ${signed(gap)}` : '') +
    '.';

  const renderDemandLabel = ({ viewBox }: { viewBox?: { x?: number; y?: number } }): ReactElement => (
    <text className="font-sans" fill="var(--text-secondary)" fontSize={11} style={HALO} textAnchor="start" x={(viewBox?.x ?? 0) + 4} y={(viewBox?.y ?? 0) - 6}>
      demanda {formatInt(data.demand)} {unit}
    </text>
  );

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as ScenarioRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const first = props.payload[0]!;
    const color = row.kind === 'step' ? (row.expected >= 0 ? 'var(--positive)' : 'var(--negative)') : 'var(--chart-1)';
    const muted = 'var(--text-muted)';
    const payload =
      row.kind === 'result'
        ? [
            { ...first, color, name: 'Esperado', value: `${formatInt(row.expected)} ${unit}` },
            { ...first, color: muted, name: 'Faixa', value: `${formatInt(row.low)} a ${formatInt(row.high)} ${unit}` },
          ]
        : row.kind === 'base'
          ? [
              { ...first, color, name: 'Valor', value: `${formatInt(row.expected)} ${unit}` },
              { ...first, color: muted, name: 'Origem do número', value: row.basis },
            ]
          : [
              { ...first, color, name: 'Esperado', value: `${signed(row.expected)} ${unit}` },
              { ...first, color: muted, name: 'Intervalo', value: `${signed(row.low)} a ${signed(row.high)} ${unit}` },
              { ...first, color: muted, name: 'Origem do número', value: row.basis },
              { ...first, color: muted, name: 'Acumulado esperado', value: `${formatInt(row.end)} ${unit}` },
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
            {/* zIndex 250: o Recharts pinta por zIndex entre tipos de marca (barra 300), então a linha da demanda passa por baixo das marcas. */}
            <ReferenceLine ifOverflow="extendDomain" label={renderDemandLabel} zIndex={250} stroke="var(--text-muted)" strokeDasharray="3 3" strokeWidth={1.5} y={data.demand} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: ColumnShapeProps) => <ScenarioColumn {...props} count={rows.length} demand={data.demand} unit={unit} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p aria-hidden className="mt-2 shrink-0 text-[0.6875rem] text-text-muted">
        Medido: {names('medido')}. Premissa: {names('premissa')}. Traço: intervalo declarado do passo.
      </p>
    </div>
  );
}
