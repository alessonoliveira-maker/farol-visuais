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
import { formatCurrency, formatCurrencyAxis, formatDate, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type GoalBridge } from './data';

/** Ponte até a meta: a meta é a coluna cheia, as partes a consomem e o gap restante fecha em zero. */
export interface GoalBridgeWaterfallProps {
  readonly data?: GoalBridge;
  readonly height?: number;
  readonly className?: string;
}

/** Duas linhas de rótulo (valor e participação) acima da coluna da meta: 24 de respiro mais uma linha. */
const MARGIN = { top: 40, right: 8, bottom: 40, left: 8 } as const;
/**
 * ESP-6, série única: corpo ≈ 574 x 225 px (seção 13). Sem eixo de valor (todo valor vem escrito,
 * ROT-2), sobram 574 − 16 = 558 px; 5 colunas dão passo = 111,6 px; barra = min(24, 111,6 × (1 − 2 × 0,32)
 * ≈ 40) = 24 px.
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

interface GoalRow {
  readonly id: string;
  readonly label: string;
  readonly kind: 'goal' | 'part' | 'gap';
  readonly value: number;
  /** Participação inteira na meta, em pontos de 0 a 100 (soma 100 pelo maior resto). */
  readonly share: number;
  /** O que ainda falta para a meta depois desta parte. */
  readonly remaining: number;
  readonly range: readonly [number, number];
  readonly isLast: boolean;
}

interface StepShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: GoalRow;
}

/** Meta menos a soma das partes; `null` sem nenhuma parte, nunca zero (EST-1b). */
function remainingOf(data: GoalBridge): number | null {
  if (data.parts.length === 0) return null;
  return data.goal - data.parts.reduce((sum, part) => sum + part.value, 0);
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

/** A meta ancora no zero; cada parte nasce onde a anterior terminou e desce; o gap fecha até o zero. */
function buildRows(data: GoalBridge, remaining: number): readonly GoalRow[] {
  const gap = Math.max(remaining, 0);
  const shares = data.goal === 0 ? [] : wholeShares([...data.parts.map((part) => part.value), gap], data.goal);
  let level = data.goal;
  const rows: GoalRow[] = [
    { id: 'meta', label: 'Meta do ano', kind: 'goal', value: data.goal, share: 100, remaining: data.goal, range: [0, data.goal], isLast: false },
  ];
  data.parts.forEach((part, index) => {
    const next = level - part.value;
    rows.push({
      ...part,
      kind: 'part',
      share: shares[index] ?? 0,
      remaining: next,
      range: [Math.min(level, next), Math.max(level, next)],
      isLast: false,
    });
    level = next;
  });
  if (gap > 0) {
    rows.push({ id: 'gap', label: 'Gap até a meta', kind: 'gap', value: gap, share: shares[data.parts.length] ?? 0, remaining: gap, range: [0, gap], isLast: false });
  }
  const last = rows[rows.length - 1];
  return rows.map((row) => (row === last ? { ...row, isLast: true } : row));
}

/** Cor da marca por papel: meta em destaque, partes neutras, gap em atenção. */
function colorOf(kind: GoalRow['kind']): string {
  if (kind === 'goal') return 'var(--chart-1)';
  return kind === 'gap' ? 'var(--warning)' : 'var(--text-secondary)';
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
 * O shape desenha tudo da coluna: retângulo, rótulo de duas linhas e conector. O gap leva o sinal
 * − e a palavra falta, para a cor de atenção não ser a única pista (ACE-2). A largura da banda vem
 * de usePlotArea, que só funciona dentro de um componente, não numa função de shape.
 */
function GoalStep({ x = 0, y = 0, width = 0, height = 0, payload, count }: StepShapeProps & { readonly count: number }): ReactElement | null {
  const plot = usePlotArea();
  if (!payload) return null;
  const isGap = payload.kind === 'gap';
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  // Meta e gap seguem do alto da coluna; a parte consome para baixo, e o conector sai da base dela.
  const levelY = payload.kind === 'part' ? bottom : top;
  const band = plot ? plot.width / count : 0;
  const centerX = x + width / 2;
  const share = `${formatPercent(payload.share / 100, 0)}`;
  return (
    <g>
      {!payload.isLast && band > width ? (
        <line stroke="var(--line-strong)" strokeWidth={1} x1={x + width} x2={x + band} y1={levelY} y2={levelY} />
      ) : null}
      <rect fill={colorOf(payload.kind)} height={Math.max(bottom - top, MIN_MARK)} rx={CORNER} width={width} x={x} y={top} />
      <text
        className="font-display"
        fill={payload.kind === 'goal' ? 'var(--text-primary)' : isGap ? 'var(--warning)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={payload.kind === 'goal' || isGap ? 600 : 500}
        textAnchor="middle"
        x={centerX}
        y={top - LABEL_GAP - SHARE_LINE}
      >
        {`${isGap ? '−' : ''}${formatCurrencyAxis(payload.value)}`}
      </text>
      <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={centerX} y={top - LABEL_GAP}>
        {isGap ? `falta · ${share}` : share}
      </text>
      {(plot ? wrapName(payload.label, Math.floor(band / NAME_CHAR_WIDTH)) : []).map((line, index) => (
        <text fill="var(--text-muted)" fontSize={12} key={line} textAnchor="middle" x={centerX} y={(plot ? plot.y + plot.height : 0) + NAME_GAP + index * NAME_LINE}>
          {line}
        </text>
      ))}
    </g>
  );
}

export default function GoalBridgeWaterfall({ data = defaultData, height, className }: GoalBridgeWaterfallProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const remaining = remainingOf(data);

  if (remaining === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhuma parte consome a meta neste recorte: sem realizado, contratado ou pipeline, a ponte não se monta.
      </div>
    );
  }

  const rows = buildRows(data, remaining);
  const parts = rows.filter((row) => row.kind === 'part');
  const gap = rows.find((row) => row.kind === 'gap');
  const lastPart = parts[parts.length - 1];
  const date = formatDate(data.cutoff);
  const goalText = formatCurrencyAxis(data.goal);
  const partList = parts.map((row) => `${row.label.toLowerCase()} ${formatCurrencyAxis(row.value)}`);
  const partText = partList.length > 1 ? `${partList.slice(0, -1).join(', ')} e ${partList[partList.length - 1] ?? ''}` : (partList[0] ?? '');

  const closing = gap
    ? `faltam ${formatCurrencyAxis(gap.value)} contando o ${lastPart?.label.toLowerCase() ?? 'total das partes'}, ${formatPercent(gap.share / 100, 0)} da meta`
    : `meta coberta, com folga de ${formatCurrencyAxis(Math.abs(remaining))}`;
  const reading = `Posição de ${date}: ${closing}`;
  const summary = `Gráfico de cascata da meta anual de ${goalText} em ${date}: ${partText} a consomem. ${gap ? `Faltam ${formatCurrencyAxis(gap.value)}.` : 'A meta está coberta.'}`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as GoalRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const color = colorOf(row.kind);
    const payload =
      row.kind === 'part'
        ? [
            { ...base, color, name: 'Valor exato', value: formatCurrency(row.value, 0) },
            { ...base, color: 'var(--text-muted)', name: 'Ainda falta após a parte', value: formatCurrency(row.remaining, 0) },
          ]
        : [{ ...base, color, name: 'Valor exato', value: formatCurrency(row.value, 0) }];
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
            <YAxis domain={[0, Math.max(data.goal, ...rows.map((row) => row.range[1]))]} hide />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--line-strong)" y={0} />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{ className: 'font-display', fill: 'var(--text-muted)', fontSize: 11, position: 'insideTopRight', value: `meta ${goalText}` }}
              stroke="var(--line-strong)"
              strokeDasharray="4 4"
              y={data.goal}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <GoalStep {...props} count={rows.length} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
