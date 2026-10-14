import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  ComposedChart,
  LabelList,
  Line,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { formatInt, formatPercent, formatPercentPoints } from '@/lib/format';
import { cn } from '@/lib/utils';
import { cutPercent as defaultCutPercent, data as defaultData, type LossReason } from './data';

/**
 * Pareto com o corte da regra de 80% desenhado: as colunas até o motivo em que o acumulado cruza
 * o corte ficam acesas, as de depois recuam para o neutro, e uma linha de referência no eixo do
 * acumulado marca onde está o corte, com o rótulo numa margem reservada à esquerda, fora das
 * marcas. O corte é calculado do dado, nunca fixado em índice: muda o recorte, muda quantas
 * colunas acendem. O eixo das colunas vai de zero ao total, então a fração de altura de cada
 * coluna é a mesma fração do eixo direito, e a primeira coluna toca o primeiro ponto da linha.
 */
export interface LossParetoCutProps {
  readonly data?: readonly LossReason[];
  /** Percentual acumulado do corte. Padrão 80, a regra de Pareto. */
  readonly cutPercent?: number;
  readonly height?: number;
  readonly className?: string;
}

interface ParetoRow extends LossReason {
  readonly acumPct: number;
  readonly sharePct: number;
  /** Até o corte: acende e ganha peso no rótulo, não só cor (COR-2, ACE-2). */
  readonly inCut: boolean;
}

interface ParetoModel {
  readonly rows: readonly ParetoRow[];
  readonly total: number;
  readonly cutCount: number;
  readonly cutAcum: number;
  readonly leaderName: string;
  readonly leaderCount: number;
}

interface AxisTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly index?: number;
  readonly payload?: { readonly value?: unknown };
}

interface ReferenceLabelProps {
  readonly viewBox?: { readonly x?: number; readonly y?: number };
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

/**
 * A esquerda reserva a faixa do rótulo do corte. A soma por glifo de "corte 80%" em 11 px dá
 * 49,8 px, mais 2 px de margem do medidor e o respiro de 8: com 58 px o render cortou a primeira
 * letra, e 68 px deixam 6 px de folga. Reserva de margem se superestima, porque o erro só aparece
 * depois do render.
 */
const MARGIN = { top: 34, right: 8, bottom: 0, left: 68 } as const;
const PCT_AXIS_WIDTH = 40;
const MAX_BAR_SIZE = 24;
const BAR_CATEGORY_GAP = '34%';
const BAR_RADIUS = [3, 3, 0, 0] as const;
/** Respiro do rótulo de contagem até o topo da coluna (17.7). */
const VALUE_LABEL_GAP = 6;
/** Respiro do rótulo do último ponto da linha até o ponto em si. */
const ACUM_LABEL_GAP = 10;
/** Respiro do rótulo do corte até a borda esquerda do plano. */
const CUT_LABEL_GAP = 8;
const CUT_FILL = 'var(--chart-1)';
/** Neutro de dado depois do corte: só é permitido porque o valor está escrito em toda coluna. */
const AFTER_CUT_FILL = 'var(--line-strong)';
const LINE_STROKE = 'var(--chart-3)';
const CUT_STROKE = 'var(--text-muted)';
const PCT_TICKS = [0, 20, 40, 60, 80, 100] as const;
/** Halo na cor do cartão: o rótulo continua legível quando cruza a coluna ou a própria linha. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/**
 * Ordena por quantidade decrescente com desempate estável por nome, mantém "Outros" no fim,
 * acumula sobre os valores brutos e marca as linhas até o corte. Devolve `null` para recorte sem
 * linha ou sem perda medida, em vez de zero (EST-1b): quem chama desenha o estado vazio.
 */
function buildPareto(input: readonly LossReason[], cut: number): ParetoModel | null {
  if (input.length === 0) return null;
  const named = input
    .filter((item) => !item.isOther)
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason, 'pt-BR'));
  const ordered = [...named, ...input.filter((item) => item.isOther)];
  const total = ordered.reduce((sum, item) => sum + item.count, 0);
  if (total <= 0) return null;

  let acumCount = 0;
  const partial = ordered.map((item) => {
    acumCount += item.count;
    return { ...item, acumPct: (acumCount / total) * 100, sharePct: item.count / total };
  });

  // O corte é o primeiro motivo cujo acumulado alcança a marca: a contagem sai do dado, não de
  // um índice escrito à mão, e o laço evita ler o array por índice.
  let cutCount = 0;
  let cutAcum = 0;
  for (const row of partial) {
    if (cutAcum >= cut) break;
    cutCount += 1;
    cutAcum = row.acumPct;
  }

  const rows = partial.map((row, index) => ({ ...row, inCut: index < cutCount }));
  const leader = partial[0];
  return {
    rows,
    total,
    cutCount,
    cutAcum,
    leaderName: leader === undefined ? '' : leader.reason,
    leaderCount: leader === undefined ? total : leader.count,
  };
}

/** As duas linhas da dica de um motivo: quantidade com a fatia do total, e o acumulado até ali. */
function buildTooltipEntries(row: ParetoRow): readonly TooltipEntry[] {
  return [
    {
      color: row.inCut ? CUT_FILL : AFTER_CUT_FILL,
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

export default function LossParetoCut({
  data = defaultData,
  cutPercent = defaultCutPercent,
  height,
  className,
}: LossParetoCutProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const model = buildPareto(data, cutPercent);

  if (model === null) {
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

  const { rows, total, cutCount, cutAcum, leaderName, leaderCount } = model;

  const summary =
    `Gráfico de colunas com ${formatInt(rows.length)} motivos de perda em ordem decrescente e linha do percentual ` +
    `acumulado. ${formatInt(cutCount)} motivos cruzam o corte de ${formatPercentPoints(cutPercent, 0)} e somam ` +
    `${formatPercentPoints(cutAcum)} das ${formatInt(total)} perdas do trimestre, liderados por ${leaderName}, ` +
    `com ${formatInt(leaderCount)} perdas.`;

  const reading = `${formatInt(cutCount)} motivos somam ${formatPercentPoints(cutAcum)} das ${formatInt(total)} perdas`;

  const renderBar = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = rows[index];
    return (
      <Rectangle
        fill={row?.inCut === true ? CUT_FILL : AFTER_CUT_FILL}
        height={Number(barHeight)}
        radius={[...BAR_RADIUS]}
        width={Number(width)}
        x={Number(x)}
        y={Number(y)}
      />
    );
  };

  // Peso 700 fica no nome e no valor do motivo líder, os dois elementos que a TIP-3 admite; o
  // resto do grupo do corte carrega 600 contra 400, que é o segundo canal do destaque.
  const renderName = ({ x, y, index = -1, payload }: AxisTickProps): ReactElement => {
    const row = rows[index];
    const inCut = row?.inCut === true;
    return (
      <text
        className="font-sans"
        dominantBaseline="hanging"
        fill={inCut ? 'var(--text-secondary)' : 'var(--text-muted)'}
        fontSize={11}
        fontWeight={index === 0 ? 700 : inCut ? 600 : 400}
        textAnchor="middle"
        x={Number(x)}
        y={Number(y)}
      >
        {String(payload?.value ?? '')}
      </text>
    );
  };

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
        <tspan
          className="font-display"
          fill={row.inCut ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontSize={12}
          fontWeight={index === 0 ? 700 : row.inCut ? 600 : 500}
        >
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
        fontWeight={500}
        style={HALO}
        textAnchor="end"
        x={Number(x)}
        y={Number(y) - ACUM_LABEL_GAP}
      >
        Acumulado {formatPercentPoints(row.acumPct)}
      </text>
    );
  };

  /** O rótulo do corte mora na margem esquerda reservada, nunca dentro do plano (REC-4, ANO-3). */
  const renderCutLabel = ({ viewBox }: ReferenceLabelProps): ReactElement => (
    <text
      dominantBaseline="central"
      fill={CUT_STROKE}
      fontSize={11}
      textAnchor="end"
      x={(viewBox?.x ?? 0) - CUT_LABEL_GAP}
      y={viewBox?.y ?? 0}
    >
      <tspan className="font-sans">corte </tspan>
      <tspan className="font-display">{formatPercentPoints(cutPercent, 0)}</tspan>
    </text>
  );

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
          <ComposedChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="reason"
              interval={0}
              tick={renderName}
              tickMargin={8}
            />
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
              isAnimationActive={animate}
              maxBarSize={MAX_BAR_SIZE}
              name="Perdas"
              shape={renderBar}
              yAxisId="qtd"
            >
              <LabelList content={renderCountLabel} dataKey="count" />
            </Bar>
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderCutLabel}
              stroke={CUT_STROKE}
              strokeDasharray="3 3"
              strokeWidth={1}
              y={cutPercent}
              yAxisId="pct"
            />
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
