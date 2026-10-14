import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, ZIndexLayer, usePlotArea, useYAxisScale } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveTarget } from './data';

/**
 * Barras sobrepostas: a meta de cada executivo é uma barra larga e clara atrás, e o realizado é
 * uma barra fina e sólida na frente, as duas no centro da mesma banda. Cada linha escreve o
 * percentual atingido, o realizado e a meta em colunas alinhadas à direita.
 */
export interface TargetOverlayBarsProps {
  /** Realizado e meta por executivo. A ordem de entrada não importa: o componente ordena pelo percentual atingido. */
  readonly data?: readonly ExecutiveTarget[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

/** Série principal: o realizado, fino e na frente. */
const ACTUAL_FILL = 'var(--chart-1)';
/** Série de comparação em neutro de dado: permitida porque a meta está escrita na coluna da linha. */
const TARGET_FILL = 'var(--line-strong)';
/** Os dois eixos de categoria recebem a mesma lista; cada Bar fica sozinha no seu e ocupa o centro da banda. */
const ACTUAL_AXIS = 'actual';
const TARGET_AXIS = 'target';
const NAME_AXIS_WIDTH = 116;
const COLUMN_GAP = 12;
const RATE_WIDTH = 40;
const ACTUAL_WIDTH = 92;
const TARGET_WIDTH = 86;
const COLUMNS_WIDTH = COLUMN_GAP + RATE_WIDTH + ACTUAL_WIDTH + TARGET_WIDTH;
const MARGIN = { top: 2, right: COLUMNS_WIDTH, bottom: 2, left: 0 } as const;
/** A meta ocupa a banda; o realizado tem cerca de um terço dela (especificação do bullet graph). */
const TARGET_BAR_SIZE = 16;
const ACTUAL_BAR_SIZE = 6;
/** Camada de rótulo do Recharts (2000): texto por cima de qualquer barra. */
const LABEL_Z = 2000;

interface RateRow extends ExecutiveTarget {
  /** Realizado sobre a meta, como fração (1,08 é 108%). */
  readonly rate: number;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Linhas com o percentual atingido, do maior para o menor; empate desempata pelo nome. */
function toRows(data: readonly ExecutiveTarget[]): RateRow[] {
  return data
    .map((item) => ({ ...item, rate: item.target > 0 ? item.actual / item.target : 0 }))
    .sort((a, b) => b.rate - a.rate || a.name.localeCompare(b.name, 'pt-BR'));
}

/** Colunas de número posicionadas pela escala de categoria: percentual, realizado e meta, alinhados à direita. */
function RowColumns({ rows }: { readonly rows: readonly RateRow[] }) {
  const yScale = useYAxisScale(ACTUAL_AXIS);
  const plot = usePlotArea();
  if (!yScale || !plot) return null;

  const rateRight = plot.x + plot.width + COLUMN_GAP + RATE_WIDTH;
  const actualRight = rateRight + ACTUAL_WIDTH;
  const targetRight = actualRight + TARGET_WIDTH;

  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      {rows.map((row) => {
        const center = yScale(row.id, { position: 'middle' });
        if (center === undefined) return null;
        return (
          <g key={row.id}>
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-primary)"
              fontSize={12}
              fontWeight={600}
              textAnchor="end"
              x={rateRight}
              y={center}
            >
              {formatPercent(row.rate, 0)}
            </text>
            <text
              className="font-display"
              dominantBaseline="central"
              fill="var(--text-secondary)"
              fontSize={12}
              fontWeight={500}
              textAnchor="end"
              x={actualRight}
              y={center}
            >
              {formatCurrencyCompact(row.actual)}
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
              {formatCurrencyCompact(row.target)}
            </text>
          </g>
        );
      })}
    </ZIndexLayer>
  );
}

export default function TargetOverlayBars({ data = defaultData, height, className }: TargetOverlayBarsProps) {
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

  const byId = new Map(rows.map((row) => [row.id, row]));
  const domainEdge = Math.max(1, ...rows.flatMap((row) => [row.actual, row.target]));
  const totalActual = rows.reduce((sum, row) => sum + row.actual, 0);
  const totalTarget = rows.reduce((sum, row) => sum + row.target, 0);
  const teamRate = totalTarget > 0 ? totalActual / totalTarget : 0;
  const reached = rows.filter((row) => row.target > 0 && row.actual >= row.target).length;
  const leader = rows[0];
  const last = rows.length > 1 ? rows[rows.length - 1] : undefined;
  const reachedText = `${formatInt(reached)} de ${formatInt(rows.length)}`;

  const summary = [
    `Gráfico de barras sobrepostas com a receita realizada de ${formatInt(rows.length)} executivos contra a meta do trimestre.`,
    leader ? `Lidera ${leader.name}, com ${formatPercent(leader.rate, 0)} da meta.` : '',
    last ? `Por último, ${last.name}, com ${formatPercent(last.rate, 0)}.` : '',
    `Time em ${formatPercent(teamRate, 0)} da meta somada; ${reachedText} ${reached === 1 ? 'passou' : 'passaram'} da meta.`,
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
        Time em <span className="kpi-number font-semibold text-text-primary">{formatPercent(teamRate, 0)}</span> da meta
        somada, <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(totalActual)}</span> de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatCurrencyCompact(totalTarget)}</span>;{' '}
        <span className="tabular-nums">{reachedText}</span> {reached === 1 ? 'passou' : 'passaram'} da meta
      </p>
      <div aria-hidden className="mb-1 flex shrink-0 items-center text-[0.6875rem] leading-4 text-text-muted">
        <span className="min-w-0 flex-1" />
        <span className="shrink-0 text-right" style={{ width: COLUMN_GAP + RATE_WIDTH }}>
          atingido
        </span>
        <span className="flex shrink-0 items-center justify-end gap-1.5" style={{ width: ACTUAL_WIDTH }}>
          <span className="h-1.5 w-3 shrink-0 rounded-[1px]" style={{ backgroundColor: ACTUAL_FILL }} />
          realizado
        </span>
        <span className="flex shrink-0 items-center justify-end gap-1.5" style={{ width: TARGET_WIDTH }}>
          <span className="size-3 shrink-0 rounded-[2px]" style={{ backgroundColor: TARGET_FILL }} />
          meta
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="34%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, domainEdge]} hide type="number" />
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
            {/* A ordem dos filhos define a pintura: a meta primeiro, atrás; o realizado depois, na frente. */}
            <Bar
              barSize={TARGET_BAR_SIZE}
              dataKey="target"
              fill={TARGET_FILL}
              isAnimationActive={animate}
              radius={[0, 3, 3, 0]}
              yAxisId={TARGET_AXIS}
            />
            <Bar
              barSize={ACTUAL_BAR_SIZE}
              dataKey="actual"
              fill={ACTUAL_FILL}
              isAnimationActive={animate}
              radius={[0, 2, 2, 0]}
              yAxisId={ACTUAL_AXIS}
            />
            <RowColumns rows={rows} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
