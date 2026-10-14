import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  ComposedChart,
  Line,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatPercent, formatPercentPoints } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type LossReason } from './data';

/**
 * Colunas com a quantidade de oportunidades perdidas por motivo, em ordem decrescente, e uma
 * linha com o percentual acumulado do total. O eixo do acumulado é derivado do eixo das colunas:
 * o domínio das colunas vai de zero ao total geral, então a fração de altura de cada coluna
 * coincide com a fração do acumulado no eixo direito, sem escala arbitrária entre os dois.
 * "Outros" fecha a lista sempre, mesmo quando maior que a última categoria nomeada.
 */
export interface LossParetoProps {
  readonly data?: readonly LossReason[];
  readonly height?: number;
  readonly className?: string;
}

interface ParetoRow extends LossReason {
  readonly acumPct: number;
  readonly sharePct: number;
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

const MARGIN = { top: 34, right: 8, bottom: 0, left: 8 } as const;
const PCT_AXIS_WIDTH = 40;
const MAX_BAR_SIZE = 28;
/** Respiro do rótulo de contagem até o topo da coluna (17.7). */
const VALUE_LABEL_GAP = 6;
/** Respiro do rótulo do último ponto da linha até o ponto em si. */
const ACUM_LABEL_GAP = 10;
const BAR_FILL = 'var(--chart-1)';
const LINE_STROKE = 'var(--chart-3)';
const PCT_TICKS = [0, 20, 40, 60, 80, 100] as const;
/** Halo na cor do cartão: o rótulo continua legível quando cruza a coluna ou a própria linha. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/**
 * Ordena por quantidade decrescente com desempate estável por nome, agrupa "Outros" sempre no
 * fim (mesmo quando maior que a última categoria nomeada) e acumula sobre os valores brutos,
 * arredondando só na exibição de cada rótulo.
 */
function buildParetoRows(input: readonly LossReason[]): { rows: readonly ParetoRow[]; total: number } {
  const named = input
    .filter((item) => !item.isOther)
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason, 'pt-BR'));
  const others = input.filter((item) => item.isOther);
  const ordered = [...named, ...others];
  const total = ordered.reduce((sum, item) => sum + item.count, 0);

  let acumCount = 0;
  const rows = ordered.map((item) => {
    acumCount += item.count;
    return {
      ...item,
      acumPct: total === 0 ? 0 : (acumCount / total) * 100,
      sharePct: total === 0 ? 0 : item.count / total,
    };
  });
  return { rows, total };
}

/** As duas linhas da dica de um motivo: quantidade com a fatia do total, e o acumulado até ali. */
function buildTooltipEntries(row: ParetoRow): readonly TooltipEntry[] {
  return [
    {
      color: BAR_FILL,
      dataKey: 'count',
      graphicalItemId: 'count',
      name: 'Perdas',
      value: `${formatInt(row.count)} (${formatPercent(row.sharePct)} do total)`,
    },
    {
      color: LINE_STROKE,
      dataKey: 'acumPct',
      graphicalItemId: 'acumPct',
      name: 'Acumulado',
      value: formatPercentPoints(row.acumPct),
    },
  ];
}

export default function LossPareto({ data = defaultData, height, className }: LossParetoProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve oportunidade perdida no período.</span>
      </div>
    );
  }

  const { rows, total } = buildParetoRows(data);
  const leader = rows[0];
  const top = rows.slice(0, Math.min(3, rows.length));
  const topNames = top.map((row) => row.reason).join(', ');
  const topAcum = top[top.length - 1]?.acumPct ?? 0;

  const summary = [
    `Gráfico de colunas com ${String(rows.length)} motivos de perda no trimestre, em ordem decrescente, e linha com o percentual acumulado.`,
    leader ? `Lidera ${leader.reason}, com ${formatInt(leader.count)} perdas.` : '',
    `Os ${String(top.length)} primeiros motivos, ${topNames}, somam ${formatPercentPoints(topAcum)} das ${formatInt(total)} perdas do trimestre.`,
  ]
    .filter(Boolean)
    .join(' ');

  const reading = `${String(top.length)} motivos, ${topNames}, somam ${formatPercentPoints(topAcum)} das perdas do trimestre`;

  const renderCountLabel = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    return (
      <text
        style={HALO}
        textAnchor="middle"
        x={Number(x) + Number(width) / 2}
        y={Number(y) - VALUE_LABEL_GAP}
      >
        <tspan className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={500}>
          {formatInt(row.count)}
        </tspan>
        <tspan className="font-sans" fill="var(--text-muted)" fontSize={12} fontWeight={400}>
          {' '}
          perdas
        </tspan>
      </text>
    );
  };

  const renderAcumLabel = ({ x, y, index }: LabelProps): ReactElement | null => {
    if (index === undefined || index !== rows.length - 1) return null;
    const row = rows[index];
    if (!row) return null;
    return (
      <text
        className="font-display"
        fill={LINE_STROKE}
        fontSize={12}
        fontWeight={700}
        style={HALO}
        textAnchor="end"
        x={Number(x)}
        y={Number(y) - ACUM_LABEL_GAP}
      >
        Acumulado {formatPercentPoints(row.acumPct)}
      </text>
    );
  };

  const renderTooltip = (tooltipProps: TooltipContentProps): ReactElement | null => {
    const reason = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = reason === undefined ? undefined : rows.find((candidate) => candidate.reason === reason);
    if (!tooltipProps.active || !row) return null;
    return (
      <ChartTooltip active={tooltipProps.active} label={reason} payload={buildTooltipEntries(row)} valueFormat="text" />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {reading}
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} barCategoryGap="34%" data={[...rows]} margin={MARGIN}>
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="reason" interval={0} tickMargin={8} />
            <YAxis domain={[0, total]} hide yAxisId="qtd" />
            <YAxis
              axisLine={false}
              domain={[0, 100]}
              orientation="right"
              tick={{ fill: LINE_STROKE, fontSize: 11 }}
              tickFormatter={(value: number) => formatPercentPoints(value, 0)}
              tickLine={false}
              tickMargin={8}
              ticks={[...PCT_TICKS]}
              width={PCT_AXIS_WIDTH}
              yAxisId="pct"
            />
            <Tooltip
              content={renderTooltip}
              cursor={{ fill: 'var(--line-subtle)' }}
              isAnimationActive={false}
              itemSorter={(item) => (item.dataKey === 'count' ? 0 : 1)}
            />
            <Bar
              dataKey="count"
              fill={BAR_FILL}
              isAnimationActive={animate}
              maxBarSize={MAX_BAR_SIZE}
              name="Perdas"
              radius={[3, 3, 0, 0]}
              yAxisId="qtd"
            >
              <LabelList content={renderCountLabel} dataKey="count" />
            </Bar>
            <Line
              activeDot={{ r: 4, fill: LINE_STROKE }}
              dataKey="acumPct"
              dot={{ r: 3, fill: LINE_STROKE, strokeWidth: 0 }}
              isAnimationActive={animate}
              name="Acumulado"
              stroke={LINE_STROKE}
              strokeWidth={2}
              type="linear"
              yAxisId="pct"
            >
              <LabelList content={renderAcumLabel} dataKey="acumPct" />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
