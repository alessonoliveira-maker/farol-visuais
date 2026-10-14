import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useXAxisScale,
  type BarShapeProps,
  type TooltipContentProps,
} from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, stages as defaultStages, type WonOpportunity } from './data';

/**
 * Jornada alinhada pelo dia zero: todas as oportunidades partem da própria data de criação, e o
 * eixo conta dias desde ela. As linhas ordenam pelo ciclo total, da mais curta à mais longa, e uma
 * linha vertical em cada fim de etapa marca a mediana do dia em que as oportunidades saíram dela.
 */
export interface AlignedJourneyProps {
  /** Oportunidades ganhas; a ordem de entrada não importa, o componente ordena pelo ciclo. */
  readonly data?: readonly WonOpportunity[];
  /** Nomes das etapas, na ordem do funil. */
  readonly stages?: readonly string[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const DAY_MS = 86_400_000;
/** Topo reservado ao rótulo das medianas; esquerda reservada ao primeiro tique, que cai na borda; direita ao último. */
const MARGIN = { top: 20, right: 26, bottom: 2, left: 24 } as const;
const AXIS_HEIGHT = 24;
/** Passo do eixo de dias e o número de passos: a grade fica em 25, 50, 75 e 100 (EIX-4). */
const AXIS_STEP = 25;
/**
 * Cor por identidade de etapa, nos slots categóricos 1, 3, 6 e 5 (COR-8), todos acima de 3:1 contra o
 * cartão nos dois temas. A rampa sequencial não serve: só --seq-5 a --seq-7 passam de 3:1 nos dois
 * temas (TOK-8) e o funil tem quatro etapas. A ordem mora na posição fixa e na legenda escrita; o
 * contorno de cartão separa os vizinhos (COR-5).
 */
const STAGE_COLORS = ['var(--chart-1)', 'var(--chart-3)', 'var(--chart-6)', 'var(--chart-5)'] as const;
const SEGMENT_RADIUS = 1;
const SEGMENT_STROKE = 1;
/** Vão de categoria pequeno de propósito: 40 linhas pedem a barra grossa que o canvas deixar. */
const CATEGORY_GAP = '12%';
/** Camada de rótulo do Recharts (2000): texto por cima de qualquer barra. */
const LABEL_Z = 2000;

type JourneyRow = Readonly<Record<string, number | string>>;

/** Data YYYY-MM-DD em milissegundos UTC. */
function toMs(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

/** Mediana de uma lista; `null` para lista vazia, nunca 0 (EST-1b). */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle];
  const lower = sorted[middle - 1];
  if (upper === undefined) return null;
  return sorted.length % 2 === 1 || lower === undefined ? upper : (lower + upper) / 2;
}

/** Dias de cada etapa: da entrada até a entrada seguinte, e a última até o fechamento. */
function stageDays(item: WonOpportunity): number[] {
  const points = [...item.entries, item.closed].map(toMs);
  return item.entries.map((_, index) => Math.round(((points[index + 1] ?? 0) - (points[index] ?? 0)) / DAY_MS));
}

/** Rótulos das medianas, no topo da área de plotagem, sobre a linha de cada uma. */
function MedianLabels({ medians }: { readonly medians: readonly number[] }) {
  const xScale = useXAxisScale();
  const plot = usePlotArea();
  if (!plot || !xScale) return null;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      {medians.map((value) => {
        const x = xScale(value);
        if (x === undefined) return null;
        return (
          <text
            className="font-display"
            fill="var(--text-primary)"
            fontSize={11}
            fontWeight={600}
            key={value}
            textAnchor="middle"
            x={x}
            y={plot.y - 8}
          >
            {formatDays(Math.round(value))}
          </text>
        );
      })}
    </ZIndexLayer>
  );
}

export default function AlignedJourney({ data = defaultData, stages = defaultStages, height, className }: AlignedJourneyProps) {
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
        <span>Nenhuma oportunidade ganha neste recorte: não há ciclo de venda para alinhar.</span>
      </div>
    );
  }

  const withDays = data.map((item) => {
    const days = stageDays(item);
    return { item, days, total: days.reduce((sum, value) => sum + value, 0) };
  });
  /** O primeiro item do array nasce no alto no BarChart vertical: o ciclo mais curto fica em cima, o mais longo embaixo. */
  const sorted = [...withDays].sort((a, b) => a.total - b.total || a.item.id.localeCompare(b.item.id));
  const byId = new Map(sorted.map((entry) => [entry.item.id, entry]));
  const rows: JourneyRow[] = sorted.map(({ item, days }) => {
    const row: Record<string, number | string> = { id: item.id };
    days.forEach((value, index) => {
      row[`s${String(index)}`] = value;
    });
    return row;
  });

  /** Mediana do dia em que cada etapa termina, contado desde a criação. */
  const exitMedians = stages.map((_, index) =>
    median(sorted.map(({ days }) => days.slice(0, index + 1).reduce((sum, value) => sum + value, 0))),
  );
  const medians = exitMedians.filter((value): value is number => value !== null);
  const stageMedians = stages.map((_, index) => median(sorted.map(({ days }) => days[index] ?? 0)));
  let longest = -1;
  stageMedians.forEach((value, index) => {
    if (value !== null && value > (stageMedians[longest] ?? -1)) longest = index;
  });
  const longestName = stages[longest]?.toLowerCase() ?? '';
  const longestMedian = stageMedians[longest] ?? null;
  const cycleMedian = exitMedians[exitMedians.length - 1] ?? null;
  const maxTotal = Math.max(...sorted.map((entry) => entry.total));
  const axisMax = Math.max(AXIS_STEP, Math.ceil(maxTotal / AXIS_STEP) * AXIS_STEP);
  const ticks = Array.from({ length: axisMax / AXIS_STEP + 1 }, (_, index) => index * AXIS_STEP);

  const summary = [
    `Gráfico de jornada com ${formatInt(sorted.length)} oportunidades ganhas alinhadas pelo dia da criação, ordenadas do ciclo mais curto ao mais longo.`,
    cycleMedian === null ? '' : `O ciclo mediano é de ${formatDays(Math.round(cycleMedian))}.`,
    longestMedian === null ? '' : `A etapa de maior mediana é ${longestName}, com ${formatDays(Math.round(longestMedian))}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderTip = ({ active, label }: TooltipContentProps): ReactElement | null => {
    const entry = byId.get(String(label ?? ''));
    if (!active || !entry) return null;
    return (
      <div
        className="rounded-md border border-line-strong bg-surface-overlay px-3 py-2 text-xs shadow-lg"
        data-slot="chart-tooltip"
      >
        <p className="mb-1 font-medium text-text-primary">
          {entry.item.name}: <span className="kpi-number">{formatDays(entry.total)}</span> de ciclo
        </p>
        <ul className="space-y-0.5">
          {stages.map((stage, index) => (
            <li className="flex items-center gap-3" key={stage}>
              <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ background: STAGE_COLORS[index] }} />
              <span className="text-text-secondary">{stage}</span>
              <span className="kpi-number ml-auto text-text-primary">{formatDays(entry.days[index] ?? 0)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {longestMedian === null || cycleMedian === null ? null : (
        <p aria-hidden className="mb-1 shrink-0 truncate text-xs text-text-secondary">
          Ciclo mediano de <span className="kpi-number font-medium text-text-primary">{formatDays(Math.round(cycleMedian))}</span>; a etapa
          que mais pesa é <span className="font-semibold text-text-primary">{longestName}</span>, com mediana de{' '}
          <span className="kpi-number font-medium text-text-primary">{formatDays(Math.round(longestMedian))}</span>
        </p>
      )}
      <div aria-hidden className="mb-1 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-0.5 text-[0.6875rem] text-text-muted">
        {stages.map((stage, index) => (
          <span className="flex items-center gap-1.5" key={stage}>
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: STAGE_COLORS[index] }} />
            {stage}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 shrink-0" style={{ background: 'var(--text-primary)' }} />
          mediana do dia em que a etapa termina
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, axisMax]}
              height={AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatDays(value)}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              type="number"
            />
            {/* Sem rótulo de linha: com 40 oportunidades o nome não cabe, e a dica lista o nome, o ciclo e as quatro etapas. */}
            <YAxis dataKey="id" hide type="category" />
            <Tooltip content={renderTip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {stages.map((stage, index) => (
              <Bar
                dataKey={`s${String(index)}`}
                isAnimationActive={animate}
                key={stage}
                shape={(bar: BarShapeProps) =>
                  bar.width > 0 ? (
                    <rect
                      fill={STAGE_COLORS[index] ?? STAGE_COLORS[0]}
                      height={bar.height}
                      rx={SEGMENT_RADIUS}
                      stroke="var(--surface-raised)"
                      strokeWidth={SEGMENT_STROKE}
                      width={bar.width}
                      x={bar.x}
                      y={bar.y}
                    />
                  ) : (
                    <g />
                  )
                }
                stackId="journey"
              />
            ))}
            {/* Duas linhas por mediana: o fio claro por baixo é o halo que mantém a linha visível sobre a barra colorida (TOK-10). */}
            {medians.map((value) => [
              <ReferenceLine ifOverflow="extendDomain" key={`halo-${String(value)}`} stroke="var(--surface-raised)" strokeWidth={4} x={value} />,
              <ReferenceLine ifOverflow="extendDomain" key={`line-${String(value)}`} stroke="var(--text-primary)" strokeWidth={1.25} x={value} />,
            ])}
            <MedianLabels medians={medians} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
