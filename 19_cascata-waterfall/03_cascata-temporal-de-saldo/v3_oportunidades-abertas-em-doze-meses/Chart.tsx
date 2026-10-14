import type { ReactElement } from 'react';
import {
  Bar,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, openingMonth as defaultOpeningMonth, openingStock as defaultOpeningStock, type PipelineMonth } from './data';

/** Carteira de oportunidades abertas mês a mês: faixa do movimento líquido e linha do acumulado desde a abertura. */
export interface PipelineWaterfallProps {
  readonly data?: readonly PipelineMonth[];
  readonly openingStock?: number;
  readonly openingMonth?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Margens laterais de 88 px: à esquerda a carteira de abertura, à direita a de fechamento (rótulos de cerca de 72 px mais 8 de respiro). */
const MARGIN = { top: 28, right: 88, bottom: 0, left: 88 } as const;
/**
 * ESP-6, série única, canvas largo: corpo ≈ 894 x 265 px (seção 13). Sem eixo de valor (todo valor
 * vem escrito, ROT-2), sobram 894 − 176 = 718 px; 12 meses dão passo = 59,8 px; barra =
 * min(24, 59,8 × (1 − 2 × 0,32) ≈ 21,5) = 21,5 px.
 */
const BAR_CATEGORY_GAP = '32%';
const BAR_MAX = 24;
const CATEGORY_AXIS_HEIGHT = 28;
const LABEL_GAP = 6;
const END_LABEL_GAP = 12;
const TICK_EVERY = 2;
const ZERO_MARK = 2;
const CORNER = 3;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;

interface PipelineRow extends PipelineMonth {
  readonly net: number;
  readonly acc: number;
  readonly range: readonly [number, number];
  readonly isLast: boolean;
}

interface StepShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: PipelineRow;
}

/** Sinal à mão sobre o valor absoluto (NUM-3): nenhum formatador escreve o `+`. */
function signedInt(value: number): string {
  if (value === 0) return formatInt(0);
  return `${value > 0 ? '+' : '−'}${formatInt(Math.abs(value))}`;
}

/** Cada mês nasce onde o anterior terminou, contado desde a abertura da carteira. */
function buildRows(items: readonly PipelineMonth[]): readonly PipelineRow[] {
  let running = 0;
  return items.map((item, index) => {
    const net = item.entered - item.won - item.lost - item.archived;
    const start = running;
    running += net;
    return { ...item, net, acc: running, range: [Math.min(start, running), Math.max(start, running)], isLast: index === items.length - 1 };
  });
}

/** Média do movimento líquido; `null` sem meses (EST-1b). */
function meanNet(rows: readonly PipelineRow[]): number | null {
  if (rows.length === 0) return null;
  return rows.reduce((acc, row) => acc + row.net, 0) / rows.length;
}

/**
 * O shape desenha a faixa do mês e o rótulo do líquido. O mês de líquido zero vira traço de 2 px com
 * o rótulo 0 (REC-11: o shape é chamado com altura zero, e é ele que não deixa o texto sumir). O
 * último mês escreve também a carteira de fechamento, na margem direita, no nível da Line.
 */
function PipelineStep({ x = 0, y = 0, width = 0, height = 0, payload, closing }: StepShapeProps & { readonly closing: number }): ReactElement | null {
  if (!payload) return null;
  const isZero = payload.net === 0;
  // Recharts devolve altura com sinal em faixa invertida: normaliza antes de qualquer conta.
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  // Sem polaridade declarada (COR-6): carteira maior não é melhor nem pior; o sinal vai no texto, a faixa é neutra.
  const fill = 'var(--line-strong)';
  const levelY = payload.net < 0 ? bottom : top;
  const labelY = payload.net < 0 ? bottom + LABEL_GAP + 9 : top - LABEL_GAP;
  return (
    <g>
      {isZero ? (
        <rect fill="var(--text-secondary)" height={ZERO_MARK} width={width} x={x} y={levelY - ZERO_MARK / 2} />
      ) : (
        <rect fill={fill} height={Math.max(bottom - top, 1)} rx={CORNER} width={width} x={x} y={top} />
      )}
      <text
        className="font-display"
        fill={isZero ? 'var(--text-muted)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={500}
        style={HALO}
        textAnchor="middle"
        x={x + width / 2}
        y={labelY}
      >
        {signedInt(payload.net)}
      </text>
      {payload.isLast ? (
        <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={600} x={x + width + END_LABEL_GAP} y={levelY + 4}>
          {`${formatInt(closing)} abertas`}
        </text>
      ) : null}
    </g>
  );
}

export default function PipelineWaterfall({
  data = defaultData,
  openingStock = defaultOpeningStock,
  openingMonth = defaultOpeningMonth,
  height,
  className,
}: PipelineWaterfallProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center text-xs text-text-muted', className)} role="status" style={style}>
        Nenhum mês neste recorte: não há movimento de oportunidades registrado para montar a cascata.
      </div>
    );
  }

  const rows = buildRows(data);
  const last = rows[rows.length - 1]!;
  const closing = openingStock + last.acc;
  const growing = rows.filter((row) => row.net > 0).length;
  const flat = rows.filter((row) => row.net === 0).length;
  const shrinking = rows.filter((row) => row.net < 0).length;
  const best = rows.reduce((max, row) => (row.net > max.net ? row : max), rows[0]!);
  const mean = meanNet(rows);
  const peak = rows.reduce((max, row) => Math.max(max, row.range[1]), 0);
  const floor = rows.reduce((min, row) => Math.min(min, row.range[0]), 0);
  const ticks = rows.filter((_, index) => index % TICK_EVERY === 0).map((row) => row.month);

  const growth = openingStock > 0 ? ` (${last.acc >= 0 ? '+' : '−'}${formatPercent(Math.abs(last.acc) / openingStock, 0)})` : '';
  const reading =
    `Carteira de ${formatInt(openingStock)} abertas em ${formatMonthShort(openingMonth)} para ${formatInt(closing)} em ${formatMonthShort(last.month)}${growth}: ` +
    `saldo positivo em ${String(growing)} dos ${String(rows.length)} meses` +
    (mean === null ? '' : `, média de ${mean >= 0 ? '+' : '−'}${formatDecimal(Math.abs(mean), 1)} por mês`);
  const summary =
    `Gráfico combinado de faixas e linha da carteira de oportunidades abertas: de ${formatInt(openingStock)} em ${formatMonthShort(openingMonth)} ` +
    `para ${formatInt(closing)} em ${formatMonthShort(last.month)}, em ${String(rows.length)} meses. ${String(growing)} com saldo positivo, ` +
    `${String(flat)} com saldo zero e ${String(shrinking)} negativo; o maior foi ${formatMonthShort(best.month)}, com ${signedInt(best.net)}.`;

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    const row = (props.payload?.[0]?.payload ?? undefined) as PipelineRow | undefined;
    if (!props.active || !props.payload || !row) return null;
    const base = props.payload[0]!;
    const muted = 'var(--text-muted)';
    // O rótulo traz só o líquido; a dica abre a conta (entradas, ganhas, perdidas, arquivadas) e a carteira (DIC-1).
    const payload = [
      { ...base, color: muted, name: 'Entraram', value: `+${formatInt(row.entered)} oportunidades` },
      { ...base, color: muted, name: 'Ganhas', value: `−${formatInt(row.won)} oportunidades` },
      { ...base, color: muted, name: 'Perdidas', value: `−${formatInt(row.lost)} oportunidades` },
      { ...base, color: muted, name: 'Arquivadas, paradas há mais de 30 dias', value: `−${formatInt(row.archived)} oportunidades` },
      { ...base, color: 'var(--line-strong)', name: 'Líquido do mês', value: `${signedInt(row.net)} oportunidades` },
      { ...base, color: 'var(--chart-1)', name: 'Carteira ao fim do mês', value: `${formatInt(openingStock + row.acc)} abertas` },
    ];
    return <ChartTooltip active label={formatMonthShort(row.month)} payload={payload} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs font-medium text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              height={CATEGORY_AXIS_HEIGHT}
              interval={0}
              tickFormatter={formatMonthShort}
              tickMargin={8}
              ticks={ticks}
            />
            <YAxis domain={[floor, peak]} hide />
            <ReferenceLine
              ifOverflow="extendDomain"
              label={{ className: 'font-display', fill: 'var(--text-primary)', fontSize: 12, fontWeight: 600, offset: 8, position: 'left', value: `${formatInt(openingStock)} abertas` }}
              stroke="var(--line-strong)"
              y={0}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar
              dataKey="range"
              isAnimationActive={animate}
              maxBarSize={BAR_MAX}
              shape={(props: StepShapeProps) => <PipelineStep {...props} closing={closing} />}
            />
            <Line dataKey="acc" dot={false} isAnimationActive={animate} stroke="var(--chart-1)" strokeWidth={2} type="linear" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
