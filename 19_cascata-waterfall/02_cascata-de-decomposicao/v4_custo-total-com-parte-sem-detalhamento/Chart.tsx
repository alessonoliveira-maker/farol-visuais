import { useId, type ReactElement } from 'react';
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
import { formatCurrency, formatCurrencyAxis, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type DetailedCost } from './data';

/** Cascata de decomposição do custo total: linhas detalhadas, a parte sem detalhamento marcada à parte e o total. */
export interface DetailedCostWaterfallProps {
  readonly data?: DetailedCost;
  readonly height?: number;
  readonly className?: string;
}

/** Duas linhas de rótulo (valor e participação) acima da coluna mais alta: 24 de respiro mais uma linha. */
const MARGIN = { top: 40, right: 8, bottom: 40, left: 8 } as const;
/**
 * ESP-6, série única: corpo ≈ 574 x 225 px (seção 13). Sem eixo de valor (todo valor vem escrito,
 * ROT-2), sobram 574 − 16 = 558 px; 7 colunas dão passo = 79,7 px; barra = min(24, 79,7 × (1 − 2 × 0,32)
 * ≈ 28,7) = 24 px.
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

interface DetailRow {
  readonly id: string;
  readonly label: string;
  readonly kind: 'line' | 'undetailed' | 'total';
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
  readonly payload?: DetailRow;
}

/** Total menos a soma das linhas detalhadas; `null` sem nenhuma linha, nunca zero (EST-1b). */
function undetailedOf(data: DetailedCost): number | null {
  if (data.lines.length === 0) return null;
  return data.total - data.lines.reduce((sum, line) => sum + line.value, 0);
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

/** Linhas sobem do zero; a lacuna (se houver) é a última parte; o total reancora no zero. */
function buildRows(data: DetailedCost, undetailed: number): readonly DetailRow[] {
  const gap = Math.max(undetailed, 0);
  const shares = data.total === 0 ? [] : wholeShares([...data.lines.map((line) => line.value), gap], data.total);
  let running = 0;
  const rows: DetailRow[] = data.lines.map((line, index) => {
    const start = running;
    running += line.value;
    return { ...line, kind: 'line', share: shares[index] ?? 0, end: running, range: [start, running], isLast: false };
  });
  if (gap > 0) {
    rows.push({ id: 'sem-detalhamento', label: 'Sem detalhamento', kind: 'undetailed', value: gap, share: shares[data.lines.length] ?? 0, end: running + gap, range: [running, running + gap], isLast: false });
  }
  rows.push({ id: 'total', label: 'Total medido', kind: 'total', value: data.total, share: 100, end: data.total, range: [0, data.total], isLast: true });
  return rows;
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
 * O shape desenha tudo da coluna: retângulo (hachurado na lacuna), rótulo de duas linhas e conector.
 * A lacuna leva contorno --text-muted e a palavra no rótulo: ausência nunca é só uma cor (ACE-2).
 * A largura da banda vem de usePlotArea, que só funciona dentro de um componente, não numa função de shape.
 */
function DetailStep({ x = 0, y = 0, width = 0, height = 0, payload, count }: StepShapeProps & { readonly count: number }): ReactElement | null {
  const plot = usePlotArea();
  const patternId = `hachura-${useId().replace(/:/g, '')}`;
  if (!payload) return null;
  const isGap = payload.kind === 'undetailed';
  const isTotal = payload.kind === 'total';
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const band = plot ? plot.width / count : 0;
  const centerX = x + width / 2;
  return (
    <g>
      {isGap ? (
        <defs>
          <pattern height={6} id={patternId} patternUnits="userSpaceOnUse" width={6}>
            <path d="M-1 1 L1 -1 M0 6 L6 0 M5 7 L7 5" stroke="var(--text-muted)" strokeWidth={1.5} />
          </pattern>
        </defs>
      ) : null}
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={top} y2={top} />
      ) : null}
      <rect
        fill={isGap ? `url(#${patternId})` : isTotal ? 'var(--chart-1)' : 'var(--text-secondary)'}
        height={Math.max(bottom - top, MIN_MARK)}
        rx={CORNER}
        stroke={isGap ? 'var(--text-muted)' : undefined}
        strokeWidth={isGap ? 1.5 : undefined}
        width={width}
        x={x}
        y={top}
      />
      <text
        className="font-display"
        fill={isTotal ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={isTotal ? 600 : 500}
        textAnchor="middle"
        x={centerX}
        y={top - LABEL_GAP - SHARE_LINE}
      >
        {formatCurrencyAxis(payload.value)}
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={centerX} y={top - LABEL_GAP}>
        {isGap ? `${formatPercent(payload.share / 100, 0)} do total` : formatPercent(payload.share / 100, 0)}
      </text>
      {(plot ? wrapName(payload.label, Math.floor(band / NAME_CHAR_WIDTH)) : []).map((line, index) => (
        <text fill="var(--text-muted)" fontSize={12} key={line} textAnchor="middle" x={centerX} y={(plot ? plot.y + plot.height : 0) + NAME_GAP + index * NAME_LINE}>
          {line}
        </text>
      ))}
    </g>
  );
}

export default function DetailedCostWaterfall({ data = defaultData, height, className }: DetailedCostWaterfallProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const undetailed = undetailedOf(data);

  if (undetailed === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhuma linha detalhada neste recorte: sem linhas devolvidas, o custo total não se decompõe.
      </div>
    );
  }

  const rows = buildRows(data, undetailed);
  const gap = rows.find((row) => row.kind === 'undetailed');
  const month = formatMonthShort(data.period);
  const totalText = formatCurrencyAxis(data.total);
  const biggest = rows.filter((row) => row.kind === 'line').reduce<DetailRow | null>((best, row) => (best === null || row.value > best.value ? row : best), null);
  const missing = `${formatInt(data.missingLines)} ${data.missingLines === 1 ? 'linha sem retorno' : 'linhas sem retorno'}`;

  const gapText = gap
    ? `${formatCurrencyAxis(gap.value)} (${formatPercent(gap.share / 100, 0)}) sem detalhamento, em ${missing}`
    : undetailed < 0
      ? `as linhas somam ${formatCurrencyAxis(Math.abs(undetailed))} a mais que o total`
      : 'todo o total tem linha detalhada';
  const reading = `Custo total de ${totalText} em ${month}; ${gapText}`;
  const summary =
    `Gráfico de cascata do custo total medido de ${month}: ${totalText}, com ${String(data.lines.length)} linhas detalhadas. ` +
    `${biggest ? `A maior é ${biggest.label.toLowerCase()}, ${formatCurrencyAxis(biggest.value)}. ` : ''}` +
    `${gap ? `${formatCurrencyAxis(gap.value)} ficam sem detalhamento, ${formatPercent(gap.share / 100, 0)} do total.` : ''}`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as DetailRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const color = row.kind === 'total' ? 'var(--chart-1)' : row.kind === 'undetailed' ? 'var(--text-muted)' : 'var(--text-secondary)';
    const payload =
      row.kind === 'undetailed'
        ? [
            { ...base, color, name: 'Valor exato', value: formatCurrency(row.value, 0) },
            { ...base, color: 'var(--text-muted)', name: 'Linhas sem retorno', value: formatInt(data.missingLines) },
          ]
        : row.kind === 'total'
          ? [
              { ...base, color, name: 'Valor exato', value: formatCurrency(row.value, 0) },
              { ...base, color: 'var(--text-muted)', name: 'Com linha detalhada', value: formatCurrency(row.value - Math.max(undetailed, 0), 0) },
            ]
          : [
              { ...base, color, name: 'Valor exato', value: formatCurrency(row.value, 0) },
              { ...base, color: 'var(--text-muted)', name: 'Detalhado até aqui', value: formatCurrency(row.end, 0) },
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
            <YAxis domain={[0, Math.max(data.total, ...rows.map((row) => row.range[1]))]} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <DetailStep {...props} count={rows.length} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
