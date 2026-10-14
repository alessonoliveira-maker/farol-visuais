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
import { ceiling as defaultCeiling, data as defaultData, highlightId as defaultHighlightId, weekStart, type CeilingStep } from './data';

/** Cascata temporal da fila contra o teto de capacidade: o passo que explica o estouro é o único aceso. */
export interface CeilingWaterfallProps {
  readonly data?: readonly CeilingStep[];
  readonly ceiling?: number;
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 44, right: 8, bottom: 0, left: 8 } as const;
/**
 * ESP-6, série única, canvas largo: corpo ≈ 894 x 265 px (seção 13); margem de topo de 44 px para o rótulo e a anotação do passo mais alto. Sem eixo de valor (todo valor
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
const ANNOTATION_RISE = 14;
const CEILING_CLEARANCE = 4;
/** Abaixo do zIndex das barras (300): o halo dos rótulos abre o traço do teto. */
const CEILING_Z = 100;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface CeilingRow extends CeilingStep {
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
  readonly payload?: CeilingRow;
}

interface DayTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly index?: number;
  readonly rows: readonly CeilingRow[];
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

/** Cada passo nasce onde o anterior terminou; total reancora no valor dele. */
function buildRows(items: readonly CeilingStep[]): readonly CeilingRow[] {
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

/** Só o passo destacado acende; todo o resto é neutro (COR-1). */
function fillOf(row: CeilingStep, highlightId: string): string {
  return row.id === highlightId ? 'var(--chart-1)' : 'var(--line-strong)';
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
function CeilingStepShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  count,
  highlightId,
  ceiling,
  peak,
}: StepShapeProps & { readonly count: number; readonly highlightId: string; readonly ceiling: number; readonly peak: number }): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  const isTotal = payload.kind === 'total';
  const isZero = !isTotal && payload.value === 0;
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const lit = payload.id === highlightId;
  const fill = fillOf(payload, highlightId);
  const falls = payload.value < 0 && !isTotal;
  const levelY = falls ? bottom : top;
  const band = plot ? plot.width / count : 0;
  const text = isTotal ? leads(payload.value) : signedInt(payload.value);
  const textFill = lit ? 'var(--chart-1)' : isTotal ? 'var(--text-primary)' : 'var(--text-secondary)';
  // A queda escreve na ponta livre, abaixo da barra; o resto escreve acima.
  let labelY = falls ? bottom + LABEL_BELOW_OFFSET + LABEL_GAP / 2 : top - LABEL_GAP;
  // Respiro de 4 px entre o rótulo e o teto tracejado: se a caixa do texto (9 px acima, 3 abaixo da
  // linha de base) chega perto do traço, o rótulo sai do lugar, nunca o teto (ROT-7, REC-13).
  if (plot && peak > 0) {
    const ceilingY = plot.y + plot.height * (1 - ceiling / peak);
    if (ceilingY >= labelY - 9 - CEILING_CLEARANCE && ceilingY <= labelY + 3 + CEILING_CLEARANCE) {
      labelY = falls ? ceilingY + CEILING_CLEARANCE + 9 : ceilingY - CEILING_CLEARANCE - 3;
    }
  }
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
      {/* Halo na cor do cartão: o rótulo pode cruzar o traço do teto (ROT-7). */}
      <text
        className="font-display"
        fill={textFill}
        fontSize={12}
        fontWeight={lit ? 700 : isTotal ? 600 : 500}
        style={HALO}
        textAnchor="middle"
        x={x + width / 2}
        y={labelY}
      >
        {text}
      </text>
      {lit ? (
        <text className="font-display" fill="var(--text-muted)" fontSize={11} fontWeight={600} style={HALO} textAnchor="middle" x={x + width / 2} y={labelY - ANNOTATION_RISE}>
          {`disparo de ${payload.label.toLowerCase()}`}
        </text>
      ) : null}
    </g>
  );
}

/** Fecho de cada dia: o nível em que a fila termina o último passo do dia. */
function dayCloses(rows: readonly CeilingRow[]): readonly { readonly label: string; readonly close: number }[] {
  const closes: { label: string; close: number }[] = [];
  for (const row of rows) {
    if (row.kind === 'total') continue;
    const last = closes[closes.length - 1];
    if (last && last.label === row.label) last.close = row.end;
    else closes.push({ label: row.label, close: row.end });
  }
  return closes;
}

export default function CeilingWaterfall({
  data = defaultData,
  ceiling = defaultCeiling,
  highlightId = defaultHighlightId,
  height,
  className,
}: CeilingWaterfallProps) {
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
  const lit = rows.find((row) => row.id === highlightId);
  const closes = dayCloses(rows);
  const over = closes.find((day) => day.close > ceiling);
  const back = over ? closes.slice(closes.indexOf(over) + 1).find((day) => day.close <= ceiling) : undefined;
  const peak = rows.reduce((max, row) => Math.max(max, row.high, ceiling), 0);

  // O regime vem do fecho de cada dia: o dia em que passou e o primeiro depois dele em que voltou.
  const regime = !over
    ? `Todos os dias fecharam dentro do teto de ${leads(ceiling)}`
    : `A fila passou do teto de ${leads(ceiling)} na ${over.label.toLowerCase()} (${formatInt(over.close)}) ` +
      (back ? `e só fechou abaixo dele na ${back.label.toLowerCase()} (${formatInt(back.close)})` : 'e não voltou a fechar abaixo dele');
  const summary =
    `Gráfico de cascata da fila de pré-vendas, de ${leads(first.value)} para ${leads(last.value)}, contra o teto de ${formatInt(ceiling)}. ${regime}.` +
    (lit ? ` O disparo de ${lit.label.toLowerCase()} trouxe ${leads(Math.abs(lit.value))}.` : '');

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as CeilingRow | undefined;
    if (!props.active || !props.payload || !row || row.kind === 'total') return null;
    const base = props.payload[0]!;
    const gapToCeiling = row.end - ceiling;
    // O rótulo já traz o valor do passo; a dica acrescenta o nível da fila e a distância ao teto (DIC-1).
    const payload = [
      { ...base, color: fillOf(row, highlightId), name: row.kind === 'entry' ? 'Entraram' : 'Saíram', value: leads(Math.abs(row.value)) },
      { ...base, color: 'var(--text-muted)', name: 'Fila ao fim do passo', value: leads(row.end) },
      {
        ...base,
        color: 'var(--text-muted)',
        name: gapToCeiling > 0 ? 'Acima do teto' : 'Folga até o teto',
        value: leads(Math.abs(gapToCeiling)),
      },
    ];
    return <ChartTooltip active label={row.label} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs font-medium text-text-secondary">
        Semana de {formatDate(weekStart)}: {regime}
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
            {/* zIndex explícito abaixo das barras (300): o halo dos rótulos abre o traço onde o rótulo o cruza (ROT-7). */}
            <ReferenceLine
              ifOverflow="extendDomain"
              zIndex={CEILING_Z}
              label={{ className: 'font-display', fill: 'var(--text-muted)', fontSize: 11, position: 'insideBottomLeft', value: `teto de ${leads(ceiling)}` }}
              stroke="var(--text-muted)"
              strokeDasharray="4 4"
              y={ceiling}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <CeilingStepShape {...props} ceiling={ceiling} count={rows.length} highlightId={highlightId} peak={peak} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
