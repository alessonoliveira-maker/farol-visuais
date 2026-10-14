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
import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrency, formatCurrencyAxis, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MarginalCost } from './data';

/** Cascata de decomposição: o custo é construído do zero, parte a parte, até uma única coluna de total. */
export interface MarginalCostWaterfallProps {
  readonly data?: MarginalCost;
  readonly height?: number;
  readonly className?: string;
}

/** Duas linhas de rótulo (valor e participação) acima da coluna mais alta: 24 de respiro mais uma linha. */
const MARGIN = { top: 40, right: 8, bottom: 40, left: 8 } as const;
/**
 * ESP-6, série única: corpo ≈ 574 x 225 px (seção 13). Sem eixo de valor (todo valor vem escrito,
 * ROT-2), sobram 574 − 16 = 558 px; 6 colunas dão passo = 93 px; barra = min(24, 93 × (1 − 2 × 0,32)
 * ≈ 33,5) = 24 px.
 */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
/**
 * Nomes desenhados pelo próprio shape, em até duas linhas, sob a linha de base: o tique do Recharts
 * não quebra o nome e os vizinhos se tocam (REC-2, REC-10). Média de 6,4 px por caractere em 12 px.
 */
const NAME_CHAR_WIDTH = 6.4;
const NAME_LINE = 14;
const NAME_GAP = 16;
const LABEL_GAP = 6;
const SHARE_LINE = 14;
const MIN_MARK = 2;
const CORNER = 3;

interface CostRow {
  readonly id: string;
  readonly label: string;
  readonly kind: 'part' | 'total';
  readonly value: number;
  /** Participação inteira no total, em pontos de 0 a 100 (soma 100 pelo maior resto). */
  readonly share: number;
  readonly end: number;
  readonly range: readonly [number, number];
  readonly isLast: boolean;
}

interface StepShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: CostRow;
}

/** Soma das partes; `null` para lista vazia, nunca zero (EST-1b). */
function totalOf(data: MarginalCost): number | null {
  if (data.parts.length === 0) return null;
  return data.parts.reduce((sum, part) => sum + part.value, 0);
}

/** NUM-2: percentuais inteiros que somam 100, pelo maior resto. Exige total diferente de zero. */
function wholeShares(values: readonly number[], total: number): readonly number[] {
  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map((value) => Math.floor(value));
  const missing = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = raw.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest);
  const bonus = new Set(order.slice(0, Math.max(missing, 0)).map((entry) => entry.index));
  return floors.map((value, index) => value + (bonus.has(index) ? 1 : 0));
}

/** Cada parte nasce onde a anterior terminou; a coluna de total reancora no zero com a soma. */
function buildRows(data: MarginalCost, total: number): readonly CostRow[] {
  const shares = total === 0 ? data.parts.map(() => 0) : wholeShares(data.parts.map((part) => part.value), total);
  let running = 0;
  const rows: CostRow[] = data.parts.map((part, index) => {
    const start = running;
    running += part.value;
    return {
      ...part,
      kind: 'part',
      share: shares[index] ?? 0,
      end: running,
      range: [Math.min(start, running), Math.max(start, running)],
      isLast: false,
    };
  });
  rows.push({ id: 'total', label: 'Custo marginal', kind: 'total', value: total, share: total === 0 ? 0 : 100, end: total, range: [Math.min(0, total), Math.max(0, total)], isLast: true });
  return rows;
}

/** Percentual com sinal à mão sobre o valor absoluto (NUM-3). */
function signedShare(share: number): string {
  return `${share < 0 ? '−' : ''}${formatPercent(Math.abs(share) / 100, 0)}`;
}

/** Quebra o nome em palavras inteiras, no máximo `maxChars` por linha; palavra maior que isso fica sozinha. */
function wrapName(label: string, maxChars: number): readonly string[] {
  const lines: string[] = [];
  for (const word of label.split(' ')) {
    const current = lines[lines.length - 1];
    if (current !== undefined && current.length + 1 + word.length <= maxChars) lines[lines.length - 1] = `${current} ${word}`;
    else lines.push(word);
  }
  return lines;
}

/**
 * O shape desenha tudo da coluna: retângulo, rótulo de duas linhas e conector até a coluna seguinte.
 * O rótulo mora aqui e não num LabelList porque o zero medido (REC-11) não pode perder o texto, e a
 * largura da banda vem de usePlotArea, que só funciona dentro de um componente.
 */
function CostStep({ x = 0, y = 0, width = 0, height = 0, payload, count }: StepShapeProps & { readonly count: number }): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  const isTotal = payload.kind === 'total';
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const fill = isTotal ? 'var(--chart-1)' : payload.value < 0 ? 'var(--positive)' : 'var(--text-secondary)';
  const levelY = !isTotal && payload.value < 0 ? bottom : top;
  const band = plot ? plot.width / count : 0;
  const centerX = x + width / 2;
  return (
    <g>
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={levelY} y2={levelY} />
      ) : null}
      <rect fill={fill} height={Math.max(bottom - top, MIN_MARK)} rx={CORNER} width={width} x={x} y={top} />
      <text
        className="font-display"
        fill={isTotal ? 'var(--text-primary)' : payload.value < 0 ? 'var(--positive)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={isTotal ? 600 : 500}
        textAnchor="middle"
        x={centerX}
        y={top - LABEL_GAP - SHARE_LINE}
      >
        {formatCurrencyAxis(payload.value)}
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={centerX} y={top - LABEL_GAP}>
        {signedShare(payload.share)}
      </text>
      {(plot ? wrapName(payload.label, Math.floor(band / NAME_CHAR_WIDTH)) : []).map((line, index) => (
        <text fill="var(--text-muted)" fontSize={12} key={line} textAnchor="middle" x={centerX} y={(plot ? plot.y + plot.height : 0) + NAME_GAP + index * NAME_LINE}>
          {line}
        </text>
      ))}
    </g>
  );
}

export default function MarginalCostWaterfall({ data = defaultData, height, className }: MarginalCostWaterfallProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const total = totalOf(data);

  if (total === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhuma parte de custo neste recorte: sem linhas lançadas, o custo marginal não se constrói.
      </div>
    );
  }

  const rows = buildRows(data, total);
  const parts = rows.filter((row) => row.kind === 'part');
  const lows = rows.map((row) => row.range[0]);
  const highs = rows.map((row) => row.range[1]);
  const domain: [number, number] = [Math.min(0, ...lows), Math.max(0, ...highs)];
  const biggest = parts.reduce<CostRow | null>((best, row) => (best === null || row.value > best.value ? row : best), null);
  const discount = parts.find((row) => row.value < 0);
  const month = formatMonthShort(data.period);

  const biggestText = biggest ? `${biggest.label.toLowerCase()} responde por ${signedShare(biggest.share)}` : '';
  const discountText = discount ? `${discount.label.toLowerCase()} tira ${formatCurrencyAxis(Math.abs(discount.value))}` : '';
  const reading = `${formatCurrencyAxis(total)} de custo em ${month}: ${[biggestText, discountText].filter((text) => text !== '').join(', e o ')}`;
  const summary =
    `Gráfico de cascata do custo marginal de ${month}: ${String(parts.length)} partes constroem ${formatCurrencyAxis(total)}. ` +
    `${biggest ? `A maior é ${biggest.label.toLowerCase()}, ${formatCurrencyAxis(biggest.value)}, ${signedShare(biggest.share)} do total. ` : ''}` +
    `${discount ? `${discount.label} reduz ${formatCurrencyAxis(Math.abs(discount.value))}.` : ''}`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as CostRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const color = row.kind === 'total' ? 'var(--chart-1)' : row.value < 0 ? 'var(--positive)' : 'var(--text-secondary)';
    const payload =
      row.kind === 'total'
        ? [{ ...base, color, name: 'Valor exato', value: formatCurrency(row.value, 0) }]
        : [
            { ...base, color, name: 'Valor exato', value: formatCurrency(row.value, 0) },
            { ...base, color: 'var(--text-muted)', name: 'Acumulado após a parte', value: formatCurrency(row.end, 0) },
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
            <XAxis dataKey="id" hide />
            <YAxis domain={domain} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <CostStep {...props} count={rows.length} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
