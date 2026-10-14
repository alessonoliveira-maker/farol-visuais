import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  BarStack,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
  type TooltipPayloadEntry,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, stages as defaultStages, type PipelineRow, type StageDefinition, type StageKey } from './data';

/**
 * Barras empilhadas horizontais: o comprimento é o pipeline aberto de cada executivo e os
 * segmentos dizem em que estágio ele está. O total vai escrito na ponta, os executivos saem
 * ordenados pelo total e a ordem dos estágios é a mesma na pilha, na legenda e na dica.
 *
 * Os estágios usam slots categóricos (1, 3, 6, 5) e não a rampa sequencial: `--seq-4` mede
 * 2,6:1 contra o cartão claro, e aqui o valor de cada segmento não vai escrito.
 */
export interface StagePipelineBarsProps {
  /** Uma linha por executivo; a ordem de entrada não importa, o componente ordena pelo total. */
  readonly data?: readonly PipelineRow[];
  /** Estágios da base para a ponta, com o slot de cor fixo de cada um. */
  readonly stages?: readonly StageDefinition[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 0, right: 88, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 108;
const VALUE_LABEL_GAP = 6;
const BAR_MAX = 18;
const STACK_ID = 'pipeline';
/** Raio só nos cantos da ponta: o BarStack aplica ao contorno da pilha inteira, nunca entre segmentos. */
const STACK_RADIUS: [number, number, number, number] = [0, 3, 3, 0];
/** Vão entre segmentos vizinhos (COR-5), aberto no início de cada segmento que não encosta no zero. */
const SEGMENT_GAP = 2;
const CURSOR = { fill: 'var(--line-subtle)' } as const;

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

interface RankedRow extends PipelineRow {
  readonly total: number;
}

function totalOf(row: PipelineRow, keys: readonly StageKey[]): number {
  return keys.reduce((sum, key) => sum + row[key], 0);
}

function stageColor(stage: StageDefinition): string {
  return CHART_SERIES_COLORS[stage.slot - 1] ?? 'var(--chart-1)';
}

/**
 * Segmento com o vão na frente. A base encosta no zero e a ponta termina no total exato, então o
 * rótulo da ponta mede certo. Um `shape` próprio também impede o Recharts de descartar o segmento
 * zerado, o que mantém o `index` do LabelList alinhado com a linha.
 */
function segmentShape(fill: string) {
  return ({ x, y, width, height, stackedBarStart }: BarShapeProps): ReactElement => {
    const gap = x - stackedBarStart > 0.5 ? SEGMENT_GAP : 0;
    const drawnWidth = width - gap;
    if (drawnWidth <= 0 || height <= 0) return <g />;
    return <rect fill={fill} height={height} width={drawnWidth} x={x + gap} y={y} />;
  };
}

export default function StagePipelineBars({ data = defaultData, stages = defaultStages, height, className }: StagePipelineBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const keys = stages.map((stage) => stage.key);
  const rows: RankedRow[] = data
    .map((row) => ({ ...row, total: totalOf(row, keys) }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'pt-BR'));
  const teamTotal = rows.reduce((sum, row) => sum + row.total, 0);

  if (rows.length === 0 || teamTotal <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade aberta neste recorte: não há pipeline para dividir por estágio.</span>
      </div>
    );
  }

  const leader = rows[0];
  const largestStage = stages
    .map((stage) => ({ stage, value: rows.reduce((sum, row) => sum + row[stage.key], 0) }))
    .sort((a, b) => b.value - a.value)[0];
  const lastStage = stages[stages.length - 1];
  const stageOrder = new Map<string, number>(keys.map((key, index) => [key, index]));
  const sortByStage = (item: TooltipPayloadEntry): number => stageOrder.get(String(item.dataKey)) ?? 0;

  const reading =
    leader && largestStage
      ? {
          leader: leader.name,
          leaderTotal: formatCurrencyCompact(leader.total),
          stage: largestStage.stage.label,
          share: formatPercent(largestStage.value / teamTotal, 0),
          team: formatCurrencyCompact(teamTotal),
        }
      : null;

  const summary = [
    `Gráfico de barras empilhadas com o pipeline aberto de ${String(rows.length)} executivos, dividido em ${String(stages.length)} estágios e ordenado pelo total.`,
    reading ? `Lidera ${reading.leader}, com ${reading.leaderTotal}.` : '',
    reading ? `${reading.stage} concentra ${reading.share} dos ${reading.team} do time.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );

  const renderTotal = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-secondary)"
        fontSize={12}
        fontWeight={500}
        x={Number(x) + Number(width) + VALUE_LABEL_GAP}
        y={Number(y) + Number(barHeight) / 2}
      >
        {formatCurrencyCompact(row.total)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">{reading.leader}</span> lidera com{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.leaderTotal}</span>; {reading.stage} concentra{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.share}</span> dos{' '}
          <span className="kpi-number font-medium text-text-primary">{reading.team}</span> do time
        </p>
      ) : null}
      <ul className="mb-3 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        {stages.map((stage) => (
          <li className="flex items-center gap-2.5 text-xs leading-5 text-text-secondary" key={stage.key}>
            <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: stageColor(stage) }} />
            {stage.label}
          </li>
        ))}
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="34%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, 'dataMax']} hide type="number" />
            <YAxis axisLine={false} dataKey="name" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            <Tooltip
              content={<ChartTooltip showTotal valueFormat="currencyCompact" />}
              cursor={CURSOR}
              isAnimationActive={false}
              itemSorter={sortByStage}
            />
            <BarStack radius={STACK_RADIUS} stackId={STACK_ID}>
              {stages.map((stage) => (
                <Bar
                  dataKey={stage.key}
                  fill={stageColor(stage)}
                  isAnimationActive={animate}
                  key={stage.key}
                  maxBarSize={BAR_MAX}
                  name={stage.label}
                  shape={segmentShape(stageColor(stage))}
                >
                  {stage.key === lastStage?.key ? <LabelList content={renderTotal} /> : null}
                </Bar>
              ))}
            </BarStack>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
