import { Filter, Info } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  ComposedChart,
  LabelList,
  Line,
  Rectangle,
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
import {
  data as defaultData,
  tailCount as defaultTailCount,
  tailLosses as defaultTailLosses,
  type LossReason,
} from './data';

/**
 * Pareto de cauda longa: os motivos de maior volume nomeados um a um, a cauda somada numa coluna
 * final que traz a contagem de motivos agrupados no próprio rótulo do eixo, e a linha do
 * percentual acumulado sobre o total inteiro, cauda inclusa. A coluna minúscula continua visível
 * por `minPointSize`, e o desenho troca de forma sozinho nos dois recortes em que o pareto deixa
 * de informar: abaixo de 4 motivos vira colunas simples com aviso escrito, e sem nenhuma perda
 * medida o gráfico sai inteiro, no lugar de desenhar eixo vazio.
 */
export interface LossParetoTailProps {
  readonly data?: readonly LossReason[];
  /** Quantos motivos ficaram fora da lista nomeada e entram somados na coluna final. */
  readonly tailCount?: number;
  /** Perdas somadas da cauda, no mesmo recorte. */
  readonly tailLosses?: number;
  readonly height?: number;
  readonly className?: string;
}

interface ParetoRow {
  readonly id: string;
  readonly reason: string;
  readonly count: number;
  readonly acumPct: number;
  readonly sharePct: number;
  /** Segunda linha do rótulo do eixo, só na coluna da cauda: a contagem de motivos agrupados. */
  readonly note?: string;
  readonly isTail: boolean;
}

interface ParetoModel {
  readonly rows: readonly ParetoRow[];
  readonly total: number;
  readonly maxCount: number;
  readonly namedCount: number;
  readonly namedAcum: number;
  readonly leaderName: string;
  readonly leaderCount: number;
}

interface AxisTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly index?: number;
  readonly payload?: { readonly value?: unknown };
}

type TooltipEntry = NonNullable<ChartTooltipProps['payload']>[number];

const MARGIN = { top: 34, right: 8, bottom: 0, left: 56 } as const;
/** Rótulo da primeira coluna: vão até a borda esquerda da coluna e descida a partir do topo. */
const FIRST_LABEL_GAP = 6;
const FIRST_LABEL_DROP = 12;
const PCT_AXIS_WIDTH = 40;
/**
 * Duas linhas de 11 px no tique da cauda, e o eixo reserva 48 px, não os 8 do `tickMargin` mais os
 * 22 da tinta: medido no render, com 38 px a caixa dos tiques terminava 3 px abaixo da área do
 * corpo, porque o grupo de tiques nasce abaixo da âncora do eixo e o eixo é ancorado pela altura
 * declarada. Quem manda aqui é a consequência no preview, não a conta do texto (EIX-6b, 14.1).
 */
const NAME_AXIS_HEIGHT = 48;
const MAX_BAR_SIZE = 24;
const BAR_CATEGORY_GAP = '34%';
const BAR_RADIUS = [3, 3, 0, 0] as const;
/** Piso de altura da coluna, em px: a categoria de 2 perdas em 308 desenharia 1,2 px. */
const MIN_POINT_SIZE = 3;
/** Abaixo disto o acumulado não informa e o visual troca de forma. */
const MIN_PARETO_ROWS = 4;
const VALUE_LABEL_GAP = 6;
const ACUM_LABEL_GAP = 10;
const BAR_FILL = 'var(--chart-1)';
/** Neutro da cauda agregada: permitido porque o valor está escrito em cima da coluna. */
const TAIL_FILL = 'var(--line-strong)';
const LINE_STROKE = 'var(--chart-3)';
const PCT_TICKS = [0, 20, 40, 60, 80, 100] as const;
/** Halo na cor do cartão: o rótulo continua legível quando cruza a coluna ou a própria linha. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

function lossLabel(count: number): string {
  return count === 1 ? 'perda' : 'perdas';
}

/**
 * Ordena os motivos nomeados por quantidade decrescente com desempate estável por nome, põe a
 * cauda somada no fim e acumula sobre os valores brutos. Devolve `null` quando o recorte não tem
 * linha ou não tem perda medida (EST-1b), em vez de devolver zero para quem chama.
 */
function buildPareto(input: readonly LossReason[], tail: number, tailReasons: number): ParetoModel | null {
  if (input.length === 0 && tail <= 0) return null;
  const named = [...input].sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason, 'pt-BR'));
  const total = named.reduce((sum, item) => sum + item.count, 0) + tail;
  if (total <= 0) return null;

  let acumCount = 0;
  const namedRows = named.map((item) => {
    acumCount += item.count;
    return {
      id: item.id,
      reason: item.reason,
      count: item.count,
      acumPct: (acumCount / total) * 100,
      sharePct: item.count / total,
      isTail: false,
    };
  });
  const namedAcum = (acumCount / total) * 100;

  const rows =
    tail > 0
      ? [
          ...namedRows,
          {
            id: 'cauda',
            reason: 'Outros',
            count: tail,
            acumPct: 100,
            sharePct: tail / total,
            note: `${formatInt(tailReasons)} motivos`,
            isTail: true,
          },
        ]
      : namedRows;

  const leader = namedRows[0];
  return {
    rows,
    total,
    // Semente 1, e não 0: o domínio de coluna simples nunca pode nascer degenerado, e aqui já se
    // sabe que existe linha, porque o caminho sem linha e sem total saiu como `null` acima.
    maxCount: rows.reduce((best, row) => (row.count > best ? row.count : best), 1),
    namedCount: namedRows.length,
    namedAcum,
    leaderName: leader === undefined ? 'Outros' : leader.reason,
    leaderCount: leader === undefined ? tail : leader.count,
  };
}

/** As duas linhas da dica de um motivo: quantidade com a fatia do total, e o acumulado até ali. */
function buildTooltipEntries(row: ParetoRow, simple: boolean): readonly TooltipEntry[] {
  const first: TooltipEntry = {
    color: row.isTail ? TAIL_FILL : BAR_FILL,
    dataKey: 'count',
    graphicalItemId: 'count',
    name: 'Perdas',
    value: `${formatInt(row.count)} (${formatPercent(row.sharePct)} do total)`,
  };
  if (simple) return [first];
  return [
    first,
    {
      color: LINE_STROKE,
      dataKey: 'acumPct',
      graphicalItemId: 'acumPct',
      name: 'Acumulado',
      value: formatPercentPoints(row.acumPct),
    },
  ];
}

export default function LossParetoTail({
  data = defaultData,
  tailCount = defaultTailCount,
  tailLosses = defaultTailLosses,
  height,
  className,
}: LossParetoTailProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const model = buildPareto(data, tailLosses, tailCount);

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

  const { rows, total, maxCount, namedCount, namedAcum, leaderName, leaderCount } = model;
  // Com menos de 4 colunas a curva acumulada só repete o que as colunas já dizem, então ela sai
  // e o eixo das colunas passa a ir de zero ao maior valor, que é a escala de coluna simples.
  const simple = rows.length < MIN_PARETO_ROWS;

  const summary = simple
    ? `Gráfico de colunas simples com ${formatInt(rows.length)} motivos de perda em ordem decrescente, sem curva ` +
      `acumulada, porque abaixo de ${formatInt(MIN_PARETO_ROWS)} motivos ela não informa. Lidera ${leaderName}, ` +
      `com ${formatInt(leaderCount)} de ${formatInt(total)} perdas do trimestre.`
    : `Gráfico de colunas com os ${formatInt(namedCount)} motivos de perda de maior volume no trimestre, mais a ` +
      `cauda somada, e linha do percentual acumulado. Lidera ${leaderName}, com ${formatInt(leaderCount)} de ` +
      `${formatInt(total)} perdas; os nomeados somam ${formatPercentPoints(namedAcum)}.`;

  const reading = simple
    ? `${formatInt(rows.length)} motivos no recorte, ${formatInt(total)} perdas no total`
    : `${formatInt(namedCount)} motivos nomeados somam ${formatPercentPoints(namedAcum)} das ${formatInt(total)} perdas`;

  const renderBar = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement => {
    const row = rows[index];
    return (
      <Rectangle
        fill={row?.isTail === true ? TAIL_FILL : BAR_FILL}
        height={Number(barHeight)}
        radius={[...BAR_RADIUS]}
        width={Number(width)}
        x={Number(x)}
        y={Number(y)}
      />
    );
  };

  /** O tique da cauda ganha uma segunda linha com a contagem de motivos agrupados (COR-4). */
  const renderName = ({ x, y, index = -1, payload }: AxisTickProps): ReactElement => {
    const row = rows[index];
    return (
      <text
        className="font-sans"
        dominantBaseline="hanging"
        fill="var(--text-muted)"
        fontSize={11}
        textAnchor="middle"
        y={Number(y)}
      >
        <tspan x={Number(x)}>{String(payload?.value ?? '')}</tspan>
        {row?.note === undefined ? null : (
          <tspan dy="1.25em" x={Number(x)}>
            {row.note}
          </tspan>
        )}
      </text>
    );
  };

  const renderCountLabel = ({ x, y, width, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    // A primeira coluna toca o primeiro ponto da linha, que sobe para a direita: o rótulo dela
    // sai do traço e vai para a esquerda da coluna, junto ao topo (ROT-7).
    const first = index === 0;
    return (
      <text
        style={HALO}
        textAnchor={first ? 'end' : 'middle'}
        x={first ? Number(x) - FIRST_LABEL_GAP : Number(x) + Number(width) / 2}
        y={first ? Number(y) + FIRST_LABEL_DROP : Number(y) - VALUE_LABEL_GAP}
      >
        <tspan className="font-display" fill="var(--text-secondary)" fontSize={12} fontWeight={500}>
          {formatInt(row.count)}
        </tspan>
        <tspan className="font-sans" fill="var(--text-muted)" fontSize={12} fontWeight={400}>
          {` ${lossLabel(row.count)}`}
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

  const renderTooltip = (tooltipProps: TooltipContentProps): ReactElement | null => {
    const reason = typeof tooltipProps.label === 'string' ? tooltipProps.label : undefined;
    const row = reason === undefined ? undefined : rows.find((candidate) => candidate.reason === reason);
    if (!tooltipProps.active || !row) return null;
    return (
      <ChartTooltip
        active={tooltipProps.active}
        label={reason}
        payload={buildTooltipEntries(row, simple)}
        valueFormat="text"
      />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {reading}
      </p>
      {simple ? (
        <p aria-hidden className="mb-2 flex shrink-0 items-center gap-1.5 text-[0.6875rem] text-text-muted">
          <Info aria-hidden className="size-3.5 shrink-0" />
          <span>Poucos motivos no recorte: a curva acumulada sai, e ficam as colunas simples.</span>
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="reason"
              height={NAME_AXIS_HEIGHT}
              interval={0}
              tick={renderName}
              tickMargin={8}
            />
            <YAxis domain={[0, simple ? maxCount : total]} hide yAxisId="qtd" />
            {simple ? null : (
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
            )}
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
              minPointSize={MIN_POINT_SIZE}
              name="Perdas"
              shape={renderBar}
              yAxisId="qtd"
            >
              <LabelList content={renderCountLabel} dataKey="count" />
            </Bar>
            {simple ? null : (
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
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
