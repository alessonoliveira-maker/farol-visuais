import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, Rectangle, ResponsiveContainer, XAxis, YAxis, type BarShapeProps } from 'recharts';

import { CHART_SEQUENTIAL_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, months as defaultMonths, type MonthTriple, type OriginLeads } from './data';

/**
 * Barras agrupadas de três séries por origem, uma por mês: o mês mais recente na cor forte e os
 * dois anteriores na mesma rampa sequencial em tons mais fracos, porque os três meses são uma
 * progressão no tempo, não categorias soltas. Origens ordenadas pelo mês mais recente. Origem sem
 * coleta num mês escreve indisponível no lugar da barra, nunca zero.
 */
export interface OriginLeadsBarsProps {
  readonly data?: readonly OriginLeads[];
  readonly months?: MonthTriple<string>;
  readonly height?: number;
  readonly className?: string;
}

interface Row {
  readonly id: string;
  readonly origin: string;
  readonly leads: MonthTriple<number | null>;
  readonly m0: number;
  readonly m1: number;
  readonly m2: number;
}

interface SeriesSpec {
  readonly key: 'm0' | 'm1' | 'm2';
  readonly monthIndex: 0 | 1 | 2;
  readonly fill: string;
}

const SERIES: readonly SeriesSpec[] = [
  { key: 'm0', monthIndex: 0, fill: CHART_SEQUENTIAL_COLORS[2] },
  { key: 'm1', monthIndex: 1, fill: CHART_SEQUENTIAL_COLORS[4] },
  { key: 'm2', monthIndex: 2, fill: CHART_SEQUENTIAL_COLORS[6] },
];
const MARGIN = { top: 0, right: 30, bottom: 2, left: 0 } as const;
const NAME_AXIS_WIDTH = 150;
const VALUE_LABEL_GAP = 6;
const BAR_GAP = 1;
const BAR_CATEGORY_GAP = '28%';
const BAR_MAX = 12;
const BAR_RADIUS: [number, number, number, number] = [0, 2, 2, 0];

function buildRows(data: readonly OriginLeads[]): Row[] {
  return [...data]
    .map((item) => ({
      id: item.id,
      origin: item.origin,
      leads: item.leads,
      m0: item.leads[0] ?? 0,
      m1: item.leads[1] ?? 0,
      m2: item.leads[2] ?? 0,
    }))
    .sort((a, b) => b.m2 - a.m2 || a.origin.localeCompare(b.origin, 'pt-BR'));
}

function biggestDrop(rows: readonly Row[]): { row: Row; drop: number } | undefined {
  let best: { row: Row; drop: number } | undefined;
  for (const row of rows) {
    const first = row.leads[0];
    if (first === null) continue;
    const drop = first - row.m2;
    if (drop > 0 && (!best || drop > best.drop)) best = { row, drop };
  }
  return best;
}

/** Quantos meses nulos seguidos começam em `index`, incluindo ele. */
function nullRunLength(leads: MonthTriple<number | null>, index: 0 | 1 | 2): number {
  let count = 0;
  for (let i = index; i < leads.length; i += 1) {
    if (leads[i] !== null) break;
    count += 1;
  }
  return count;
}

/** Primeiro mês nulo de uma sequência: o anterior existe e tem valor, ou não existe. */
function isFirstOfNullRun(leads: MonthTriple<number | null>, index: 0 | 1 | 2): boolean {
  return leads[index] === null && (index === 0 || leads[index - 1] !== null);
}

interface NameTickProps {
  readonly y?: number | string;
  readonly index?: number;
}

/**
 * Desenha a barra e o rótulo juntos a partir do `payload` do próprio Recharts, nunca do `index`:
 * o `index` que chega à `LabelList` conta os retângulos desenhados (um valor 0 vira barra de
 * largura zero e alguns temas do Recharts a descartam do array antes de numerar), então uma
 * origem sem coleta empurrava o rótulo de indisponível para a linha seguinte. Ler pela linha do
 * próprio dado elimina o descompasso na causa. Quando dois ou três meses seguidos são nulos, um
 * rótulo por fatia se sobrepõe no espaço estreito de cada série: só a primeira fatia da sequência
 * desenha, um único indisponível centrado no vão das fatias nulas seguidas, e as demais fatias da
 * mesma sequência não desenham nada.
 */
function makeSeriesShape(monthIndex: 0 | 1 | 2, fill: string): (props: BarShapeProps) => ReactElement | null {
  return ({ x, y, width, height: barHeight, payload }: BarShapeProps) => {
    const row = payload as Row | undefined;
    if (!row) return null;
    const raw = row.leads[monthIndex];
    if (raw === null) {
      if (!isFirstOfNullRun(row.leads, monthIndex)) return null;
      const run = nullRunLength(row.leads, monthIndex);
      const spanHeight = Number(barHeight) * run + BAR_GAP * (run - 1);
      const textX = Number(x) + VALUE_LABEL_GAP;
      const textY = Number(y) + spanHeight / 2;
      return (
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={textX} y={textY}>
          {formatUnavailable()}
        </text>
      );
    }
    const textX = Number(x) + Number(width) + VALUE_LABEL_GAP;
    const textY = Number(y) + Number(barHeight) / 2;
    return (
      <g>
        <Rectangle fill={fill} height={Number(barHeight)} radius={BAR_RADIUS} width={Number(width)} x={Number(x)} y={Number(y)} />
        <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} x={textX} y={textY}>
          {formatInt(raw)}
        </text>
      </g>
    );
  };
}

export default function OriginLeadsBars({ data = defaultData, months = defaultMonths, height, className }: OriginLeadsBarsProps) {
  const animate = useAnimateOnce();
  const rows = buildRows(data);
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: não houve lead novo medido no trimestre.</span>
      </div>
    );
  }

  const leader = rows[0];
  const drop = biggestDrop(rows);
  const missing = rows.filter((row) => row.leads[0] === null);

  const summary = [
    `Barras agrupadas com leads por origem em três meses, de ${formatMonthShort(months[0])} a ${formatMonthShort(months[2])}.`,
    leader ? `Lidera ${leader.origin}, com ${formatInt(leader.m2)} leads em ${formatMonthShort(months[2])}.` : '',
    drop ? `Maior queda: ${drop.row.origin}, de ${formatInt(drop.row.leads[0] ?? 0)} para ${formatInt(drop.row.m2)} leads.` : '',
    missing.length > 0 ? `${missing.map((row) => row.origin).join(', ')} sem coleta no início.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderName = ({ y, index = -1 }: NameTickProps): ReactElement => (
    <text
      className="font-sans"
      dominantBaseline="central"
      fill="var(--text-secondary)"
      fontSize={12}
      fontWeight={500}
      x={MARGIN.left}
      y={Number(y)}
    >
      {rows[index]?.origin ?? ''}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-4 text-xs leading-4 text-text-secondary">
        {SERIES.map((series) => (
          <span className="flex items-center gap-2.5" key={series.key}>
            <span className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: series.fill }} />
            {formatMonthShort(months[series.monthIndex])}
          </span>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            accessibilityLayer={false}
            barCategoryGap={BAR_CATEGORY_GAP}
            barGap={BAR_GAP}
            data={rows}
            layout="vertical"
            margin={MARGIN}
          >
            <XAxis domain={[0, 'dataMax']} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="id"
              interval={0}
              tick={renderName}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            {SERIES.map((series) => (
              <Bar
                dataKey={series.key}
                isAnimationActive={animate}
                key={series.key}
                maxBarSize={BAR_MAX}
                shape={makeSeriesShape(series.monthIndex, series.fill)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
