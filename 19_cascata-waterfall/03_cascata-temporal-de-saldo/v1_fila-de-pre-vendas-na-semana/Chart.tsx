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
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, weekStart, type QueueStep } from './data';

/** Cascata temporal da fila: cada dia soma entradas e subtrai saídas, em dois passos, entre dois saldos ancorados. */
export interface QueueWaterfallProps {
  readonly data?: readonly QueueStep[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 24, right: 8, bottom: 0, left: 8 } as const;
/**
 * ESP-6, série única, canvas largo: corpo ≈ 894 x 265 px (seção 13). Sem eixo de valor (todo valor
 * vem escrito, ROT-2), sobram 894 − 16 = 878 px; 12 colunas dão passo = 73,2 px; barra =
 * min(24, 73,2 × (1 − 2 × 0,32) ≈ 26,3) = 24 px.
 */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const CATEGORY_AXIS_HEIGHT = 28;
const LABEL_GAP = 6;
const LABEL_BELOW_OFFSET = 12;
const ZERO_MARK = 2;
const CORNER = 3;

interface QueueRow extends QueueStep {
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
  readonly payload?: QueueRow;
}

interface DayTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly index?: number;
  readonly rows: readonly QueueRow[];
}

/** Contagem com o substantivo, no singular quando for um. */
function leads(value: number): string {
  return value === 1 ? '1 lead' : `${formatInt(value)} leads`;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signedInt(value: number): string {
  if (value === 0) return formatInt(0);
  return `${value > 0 ? '+' : '−'}${formatInt(Math.abs(value))}`;
}

/** Soma de uma lista de passos; `null` quando a lista é vazia (EST-1b). */
function sumOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((acc, value) => acc + value, 0);
}

/** Cada passo nasce onde o anterior terminou; total reancora no valor dele. */
function buildRows(items: readonly QueueStep[]): readonly QueueRow[] {
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

/** Cor por papel: total, entrada e saída (fila sem polaridade declarada, COR-6). */
function fillOf(row: QueueStep): string {
  if (row.kind === 'total') return 'var(--chart-1)';
  return row.kind === 'entry' ? 'var(--chart-3)' : 'var(--chart-6)';
}

/**
 * O rótulo do dia agrupa os dois passos: mora no tique do passo de entrada, deslocado meia banda
 * para o centro do par, e o tique da saída não escreve nada. A banda vem de usePlotArea, que só
 * funciona dentro de um componente.
 */
function DayTick({ x: xRaw = 0, y: yRaw = 0, index = 0, rows }: DayTickProps): ReactElement | null {
  const x = Number(xRaw);
  const y = Number(yRaw);
  const plot = usePlotArea();
  const row = rows[index];
  if (!row || row.kind === 'exit') return null;
  const band = plot ? plot.width / rows.length : 0;
  const cx = row.kind === 'entry' ? x + band / 2 : x;
  return (
    <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={cx} y={y + 8}>
      {row.label}
    </text>
  );
}

/**
 * O shape desenha tudo da coluna: retângulo, rótulo e conector até a coluna seguinte. O rótulo mora
 * aqui e não num LabelList porque o zero medido (REC-11) não pode perder o texto.
 */
function QueueStepShape({ x = 0, y = 0, width = 0, height = 0, payload, count }: StepShapeProps & { readonly count: number }): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  const isTotal = payload.kind === 'total';
  const isZero = !isTotal && payload.value === 0;
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const fill = fillOf(payload);
  const falls = payload.value < 0 && !isTotal;
  const levelY = falls ? bottom : top;
  const band = plot ? plot.width / count : 0;
  const text = isTotal ? leads(payload.value) : signedInt(payload.value);
  const textFill = isTotal ? 'var(--text-primary)' : isZero ? 'var(--text-muted)' : fill;
  // A queda escreve na ponta livre, abaixo da barra; o resto escreve acima.
  const labelY = falls ? bottom + LABEL_BELOW_OFFSET + LABEL_GAP / 2 : top - LABEL_GAP;
  return (
    <g>
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={levelY} y2={levelY} />
      ) : null}
      {isZero ? (
        <rect fill="var(--text-secondary)" height={ZERO_MARK} width={width} x={x} y={levelY - ZERO_MARK / 2} />
      ) : (
        <rect fill={fill} height={Math.max(bottom - top, 1)} rx={CORNER} width={width} x={x} y={top} />
      )}
      <text className="font-display" fill={textFill} fontSize={12} fontWeight={isTotal ? 600 : 500} textAnchor="middle" x={x + width / 2} y={labelY}>
        {text}
      </text>
    </g>
  );
}

export default function QueueWaterfall({ data = defaultData, height, className }: QueueWaterfallProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum passo neste recorte: não há movimento de fila registrado para montar a cascata.
      </div>
    );
  }

  const rows = buildRows(data);
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  const entries = sumOf(rows.filter((row) => row.kind === 'entry').map((row) => row.value));
  const exits = sumOf(rows.filter((row) => row.kind === 'exit').map((row) => -row.value));
  const days = new Set(rows.filter((row) => row.kind !== 'total').map((row) => row.label)).size;
  const delta = last.value - first.value;
  const peak = rows.reduce((max, row) => Math.max(max, row.high), 0);

  const summary =
    `Gráfico de cascata da fila de pré-vendas: de ${leads(first.value)} no início para ${leads(last.value)} no fim, ` +
    `variação de ${signedInt(delta)}. ${entries === null ? 'Sem entradas' : `${leads(entries)} entraram`} e ` +
    `${exits === null ? 'sem saídas' : `${leads(exits)} saíram`} em ${String(days)} dias, entradas e saídas em passos separados.`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as QueueRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const color = fillOf(row);
    // O rótulo já traz o total; a dica só entra onde acrescenta número (DIC-1).
    if (row.kind === 'total' && row.id === first.id) return null;
    const payload =
      row.kind === 'total'
        ? [{ ...base, color, name: 'Variação da semana', value: `${signedInt(delta)} leads contra o início` }]
        : [
            { ...base, color, name: row.kind === 'entry' ? 'Entraram' : 'Saíram', value: leads(Math.abs(row.value)) },
            { ...base, color: 'var(--text-muted)', name: 'Fila ao fim do passo', value: leads(row.end) },
          ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs font-medium text-text-secondary">
        Semana de {formatDate(weekStart)}: a fila foi de {leads(first.value)} a {leads(last.value)}; <span className="text-chart-3">entraram {entries === null ? 0 : formatInt(entries)}</span> e{' '}
        <span className="text-chart-6">saíram {exits === null ? 0 : formatInt(exits)}</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="id"
              height={CATEGORY_AXIS_HEIGHT}
              interval={0}
              tick={(props: { x?: number | string; y?: number | string; index?: number }) => <DayTick {...props} rows={rows} />}
              tickMargin={8}
            />
            <YAxis domain={[0, peak]} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <QueueStepShape {...props} count={rows.length} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
