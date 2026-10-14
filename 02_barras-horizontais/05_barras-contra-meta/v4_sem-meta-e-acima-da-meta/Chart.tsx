import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  Rectangle,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useYAxisScale,
  type BarShapeProps,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveTargetGap } from './data';

/**
 * Barras sobrepostas em escala absoluta com três casos limite: sem meta cadastrada, realizado
 * muito acima da própria meta (escala cortada em 150% da maior meta, com marca de quebra na
 * ponta) e um estorno que deixa o realizado negativo, escrito sem desenhar barra.
 */
export interface TargetGapBarsProps {
  readonly data?: readonly ExecutiveTargetGap[];
  readonly height?: number;
  readonly className?: string;
}

/** Medida principal: o realizado, sempre na mesma cor (COR 1, série única). */
const ACTUAL_FILL = 'var(--chart-1)';
/** Referência neutra; permitida porque a meta está escrita na coluna da linha. */
const TARGET_FILL = 'var(--line-strong)';
const BREAK_STROKE = 'var(--text-muted)';
const MINUS = '−';
const TARGET_AXIS = 'target';
const ACTUAL_AXIS = 'actual';
const NAME_AXIS_WIDTH = 108;
const COLUMN_GAP = 10;
const STATUS_WIDTH = 96;
const VALUE_WIDTH = 74;
/** Coluna da meta: identifica a barra larga e clara por escrito (ROT-2, isenção da ACE-3). */
const TARGET_WIDTH = 82;
const COLUMNS_WIDTH = COLUMN_GAP * 3 + STATUS_WIDTH + VALUE_WIDTH + TARGET_WIDTH;
const MARGIN = { top: 2, right: COLUMNS_WIDTH, bottom: 2, left: 0 } as const;
const TARGET_BAR_SIZE = 16;
const ACTUAL_BAR_SIZE = 6;
/** A escala visível vai até 150% da maior meta: acima disso a barra é cortada com marca. */
const SCALE_CUT = 1.5;
const BREAK_SIZE = 5;
const LABEL_Z = 2000;

interface GapRow extends ExecutiveTargetGap {
  readonly hasTarget: boolean;
  readonly isNegative: boolean;
  readonly rate: number | null;
  readonly overflow: boolean;
  readonly displayActual: number;
  readonly displayTarget: number;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Maior meta do grupo vezes 1,5: quem passa disso é cortado, com marca de quebra. */
function computeDomainMax(data: readonly ExecutiveTargetGap[]): number {
  const targets = data.map((row) => row.target).filter((target): target is number => target !== null);
  return Math.max(1, ...targets) * SCALE_CUT;
}

function toRows(data: readonly ExecutiveTargetGap[]): GapRow[] {
  const domainMax = computeDomainMax(data);
  return data
    .map((item) => {
      const hasTarget = item.target !== null && item.target > 0;
      const isNegative = item.actual < 0;
      const rate = hasTarget && !isNegative ? item.actual / (item.target ?? 1) : null;
      const rawActual = isNegative ? 0 : item.actual;
      return {
        ...item,
        hasTarget,
        isNegative,
        rate,
        overflow: rawActual > domainMax,
        displayActual: Math.min(rawActual, domainMax),
        displayTarget: hasTarget ? Math.min(item.target ?? 0, domainMax) : 0,
      };
    })
    .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1) || a.name.localeCompare(b.name, 'pt-BR'));
}

/** Duas marcas diagonais na cor neutra: a barra continua além da escala visível. */
function BreakMark({ x, y, height }: { readonly x: number; readonly y: number; readonly height: number }): ReactElement {
  const midY = y + height / 2;
  return (
    <g stroke={BREAK_STROKE} strokeWidth={1.5}>
      <line x1={x - 2} x2={x + 2} y1={midY - BREAK_SIZE} y2={midY - BREAK_SIZE + 3} />
      <line x1={x - 2} x2={x + 2} y1={midY + BREAK_SIZE - 3} y2={midY + BREAK_SIZE} />
    </g>
  );
}

/** Meta larga e clara atrás; nada quando o executivo não tem meta cadastrada. */
function TargetBar(props: BarShapeProps): ReactElement {
  const { x, y, width, height, payload } = props;
  const row = payload as GapRow | undefined;
  if (x === undefined || y === undefined || width === undefined || height === undefined || !row?.hasTarget) {
    return <g />;
  }
  return <Rectangle fill={TARGET_FILL} height={height} radius={[0, 3, 3, 0]} width={width} x={x} y={y} />;
}

/** Realizado fino na frente; nada num estorno negativo, e marca de quebra acima de 150%. */
function ActualBar(props: BarShapeProps): ReactElement {
  const { x, y, width, height, payload } = props;
  const row = payload as GapRow | undefined;
  if (x === undefined || y === undefined || width === undefined || height === undefined || !row || row.isNegative) {
    return <g />;
  }
  return (
    <g>
      <Rectangle fill={ACTUAL_FILL} height={height} radius={[0, 2, 2, 0]} width={width} x={x} y={y} />
      {row.overflow ? <BreakMark height={height} x={x + width} y={y} /> : null}
    </g>
  );
}

/** Status, valor realizado e meta, alinhados à direita da banda. */
function RowColumns({ rows }: { readonly rows: readonly GapRow[] }) {
  const yScale = useYAxisScale(ACTUAL_AXIS);
  const plot = usePlotArea();
  if (!yScale || !plot) return null;
  const statusRight = plot.x + plot.width + COLUMN_GAP + STATUS_WIDTH;
  const valueRight = statusRight + COLUMN_GAP + VALUE_WIDTH;
  const targetRight = valueRight + COLUMN_GAP + TARGET_WIDTH;

  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      {rows.map((row) => {
        const center = yScale(row.id, { position: 'middle' });
        if (center === undefined) return null;
        const status = row.isNegative
          ? 'estorno'
          : !row.hasTarget
            ? 'sem meta definida'
            : row.rate !== null && row.rate > 1
              ? `+${formatPercent(row.rate - 1, 0)} acima`
              : formatPercent(row.rate ?? 0, 0);
        const statusColor = row.isNegative ? 'var(--negative)' : !row.hasTarget ? 'var(--text-muted)' : 'var(--text-primary)';
        const valueText = row.isNegative
          ? `${MINUS}${formatCurrencyCompact(Math.abs(row.actual))}`
          : formatCurrencyCompact(row.actual);
        return (
          <g key={row.id}>
            <text
              className="font-display"
              dominantBaseline="central"
              fill={statusColor}
              fontSize={11}
              fontWeight={600}
              textAnchor="end"
              x={statusRight}
              y={center}
            >
              {status}
            </text>
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={12}
              fontWeight={500}
              textAnchor="end"
              x={valueRight}
              y={center}
            >
              {valueText}
            </text>
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-muted)"
              fontSize={11}
              fontWeight={500}
              textAnchor="end"
              x={targetRight}
              y={center}
            >
              {row.hasTarget ? formatCurrencyCompact(row.target ?? 0) : ''}
            </text>
          </g>
        );
      })}
    </ZIndexLayer>
  );
}

export default function TargetGapBars({ data = defaultData, height, className }: TargetGapBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = toRows(data);

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não há meta do trimestre para comparar com o realizado.</span>
      </div>
    );
  }

  const domainMax = computeDomainMax(data);
  const byId = new Map(rows.map((row) => [row.id, row]));
  const withoutTarget = rows.filter((row) => !row.hasTarget && !row.isNegative).length;
  const overflowing = rows.filter((row) => row.overflow).length;
  const negativeCount = rows.filter((row) => row.isNegative).length;
  const leader = rows.find((row) => row.rate !== null);

  const summary = [
    `Gráfico de barras sobrepostas com a receita realizada de ${String(rows.length)} executivos contra a meta do trimestre.`,
    leader?.rate !== null && leader
      ? `Lidera ${leader.name}, com ${formatPercent(leader.rate ?? 0, 0)} da meta${leader.overflow ? ', escala cortada em 150% da maior meta' : ''}.`
      : '',
    withoutTarget > 0 ? `${String(withoutTarget)} sem meta cadastrada.` : '',
    negativeCount > 0 ? `${String(negativeCount)} com estorno no período, realizado negativo.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text
      className="font-sans"
      dominantBaseline="central"
      fill="var(--text-secondary)"
      fontSize={12}
      fontWeight={500}
      x={MARGIN.left}
      y={Number(y)}
    >
      {byId.get(String(payload?.value ?? ''))?.name ?? ''}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
        {overflowing > 0 ? (
          <>
            Escala cortada em <span className="tabular-nums">150%</span> da maior meta;{' '}
            <span className="kpi-number font-medium text-text-primary">{String(overflowing)}</span> passa da marca
          </>
        ) : (
          'Meta do trimestre por executivo, com realizado sobreposto'
        )}
      </p>
      <div aria-hidden className="mb-1 flex shrink-0 items-center text-[0.6875rem] leading-4 text-text-muted">
        <span className="min-w-0 flex-1" />
        <span className="shrink-0 text-right" style={{ width: STATUS_WIDTH }}>
          % da meta
        </span>
        <span
          className="flex shrink-0 items-center justify-end gap-1.5"
          style={{ marginLeft: COLUMN_GAP, width: VALUE_WIDTH }}
        >
          <span className="h-1.5 w-3 shrink-0 rounded-[1px]" style={{ backgroundColor: ACTUAL_FILL }} />
          realizado
        </span>
        <span
          className="flex shrink-0 items-center justify-end gap-1.5"
          style={{ marginLeft: COLUMN_GAP, width: TARGET_WIDTH }}
        >
          <span className="size-3 shrink-0 rounded-[2px]" style={{ backgroundColor: TARGET_FILL }} />
          meta
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="34%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, domainMax]} hide type="number" />
            <YAxis dataKey="id" hide type="category" yAxisId={TARGET_AXIS} />
            <YAxis
              axisLine={false}
              dataKey="id"
              interval={0}
              tick={renderName}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
              yAxisId={ACTUAL_AXIS}
            />
            {/* Ordem dos filhos: a meta primeiro, atrás; o realizado depois, na frente. */}
            <Bar
              barSize={TARGET_BAR_SIZE}
              dataKey="displayTarget"
              isAnimationActive={animate}
              shape={TargetBar}
              yAxisId={TARGET_AXIS}
            />
            <Bar
              barSize={ACTUAL_BAR_SIZE}
              dataKey="displayActual"
              isAnimationActive={animate}
              shape={ActualBar}
              yAxisId={ACTUAL_AXIS}
            />
            <RowColumns rows={rows} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
