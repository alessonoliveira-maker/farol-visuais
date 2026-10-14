import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useYAxisScale,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatCurrencyCompact, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, weekStart as defaultWeekStart, type PipelineMovement } from './data';

/**
 * Barras divergentes empilhadas por sinal: entradas e avanços somam para a direita, perdas e
 * desqualificações somam para a esquerda, e um `ReferenceDot` marca onde cai o saldo líquido de
 * cada executivo na mesma escala do eixo. O olho lê primeiro de que lado pende o saldo.
 */
export interface PipelineMovementBarsProps {
  /** Movimentação por executivo na semana. A ordem de entrada não importa: o componente ordena pelo saldo. */
  readonly data?: readonly PipelineMovement[];
  /** Início da semana medida, em YYYY-MM-DD. */
  readonly weekStart?: string;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const INFLOW_FILL = 'var(--chart-1)';
const ADVANCED_FILL = 'var(--chart-3)';
const LOST_FILL = 'var(--chart-6)';
const DISQUALIFIED_FILL = 'var(--chart-5)';
const SEGMENT_STROKE = 'var(--surface-raised)';
const ZERO_STROKE = 'var(--line-strong)';
const NAME_WIDTH = 96;
const COLUMN_WIDTH = 112;
const MARGIN = { top: 22, right: COLUMN_WIDTH, bottom: 2, left: 0 } as const;
const BAR_MAX = 16;
const MARKER_RADIUS = 4;
const LABEL_Z = 2000;
const STACK_ID = 'movement';
const STACK_ORDER: Record<string, number> = { disqualified: 0, lost: 1, inflow: 2, advanced: 3 };
const MINUS = '−';

interface MovementRow {
  readonly id: string;
  readonly name: string;
  readonly inflow: number;
  readonly advanced: number;
  readonly lost: number;
  readonly disqualified: number;
  readonly net: number;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Linhas com o saldo já somado, do melhor ao pior (README, "do maior ganho à maior perda"). */
function toRows(data: readonly PipelineMovement[]): MovementRow[] {
  const rows = data.map((item) => ({
    id: item.id,
    name: item.name,
    inflow: item.inflow,
    advanced: item.advanced,
    lost: item.lost,
    disqualified: item.disqualified,
    net: item.inflow + item.advanced + item.lost + item.disqualified,
  }));
  return rows.sort((a, b) => b.net - a.net || a.name.localeCompare(b.name, 'pt-BR'));
}

/** Saldo com sinal à mão sobre o valor absoluto (NUM-3); zero sai sem sinal. */
function formatSigned(value: number): string {
  const text = formatCurrencyCompact(Math.abs(value));
  if (value === 0) return text;
  return `${value > 0 ? '+' : MINUS}${text}`;
}

/**
 * Cor do saldo. Saldo exatamente zero é **medição**, não ganho: quem entrou e quem saiu se
 * anularam. O ramo `net >= 0` mandava o zero para `--positive` e pintava de verde uma semana que
 * não somou nada, então o zero sai do par verde/vermelho e vai para o neutro (CONTRATO 17.2), do
 * mesmo jeito que `formatSigned` já o deixava sem sinal. Nunca voltar a `>=`.
 */
function netTone(net: number): string {
  if (net === 0) return 'var(--text-muted)';
  return net > 0 ? 'var(--positive)' : 'var(--negative)';
}

const LEGEND_ITEMS = [
  { key: 'disqualified', label: 'Desqualificações', fill: DISQUALIFIED_FILL },
  { key: 'lost', label: 'Perdas', fill: LOST_FILL },
  { key: 'inflow', label: 'Entradas', fill: INFLOW_FILL },
  { key: 'advanced', label: 'Avanços', fill: ADVANCED_FILL },
] as const;

interface NetColumnProps {
  readonly rows: readonly MovementRow[];
}

/** Coluna do saldo posicionada pela escala de categoria do próprio gráfico (CONTRATO, seção 5). */
function NetColumn({ rows }: NetColumnProps) {
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (!yScale || !plot) return null;
  const columnRight = plot.x + plot.width + COLUMN_WIDTH - 6;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={columnRight} y={plot.y - 10}>
        saldo
      </text>
      {rows.map((row) => {
        const center = yScale(row.id, { position: 'middle' });
        if (center === undefined) return null;
        return (
          <text
            className="font-display"
            dominantBaseline="central"
            fill={netTone(row.net)}
            fontSize={12}
            fontWeight={600}
            key={row.id}
            textAnchor="end"
            x={columnRight}
            y={center}
          >
            {formatSigned(row.net)}
          </text>
        );
      })}
    </ZIndexLayer>
  );
}

export default function PipelineMovementBars({
  data = defaultData,
  weekStart = defaultWeekStart,
  height,
  className,
}: PipelineMovementBarsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = toRows(data);
  const byId = new Map(rows.map((row) => [row.id, row]));

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum executivo neste recorte: não houve movimentação de pipeline na semana.</span>
      </div>
    );
  }

  const positiveTotals = rows.map((row) => row.inflow + row.advanced);
  const negativeTotals = rows.map((row) => Math.abs(row.lost + row.disqualified));
  const domainEdge = Math.max(1, ...positiveTotals, ...negativeTotals);
  const best = rows[0];
  const worst = rows[rows.length - 1];
  const weekLabel = formatDate(weekStart);

  const summary = [
    `Gráfico de barras divergentes empilhadas com a movimentação do pipeline de ${String(rows.length)} executivos na semana de ${weekLabel}.`,
    best ? `Melhor saldo: ${best.name}, ${formatSigned(best.net)}.` : '',
    worst && worst.id !== best?.id ? `Pior saldo: ${worst.name}, ${formatSigned(worst.net)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderName = ({ y, payload }: NameTickProps): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={0} y={Number(y)}>
      {byId.get(String(payload?.value ?? ''))?.name ?? ''}
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {best && worst && best.id !== worst.id ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          Melhor saldo <span className="font-semibold text-text-primary">{best.name}</span>,{' '}
          <span className="kpi-number font-medium text-text-primary">{formatSigned(best.net)}</span>; pior saldo{' '}
          <span className="font-semibold text-text-primary">{worst.name}</span>,{' '}
          <span className="kpi-number font-medium text-text-primary">{formatSigned(worst.net)}</span>
        </p>
      ) : null}
      <div aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        {LEGEND_ITEMS.map((item) => (
          <div className="flex items-center gap-2.5" key={item.key}>
            <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: item.fill }} />
            <span className="text-xs text-text-secondary">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="34%" data={rows} layout="vertical" margin={MARGIN} stackOffset="sign">
            <XAxis domain={[-domainEdge, domainEdge]} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="id"
              interval={0}
              tick={renderName}
              tickLine={false}
              type="category"
              width={NAME_WIDTH}
            />
            <ReferenceLine ifOverflow="extendDomain" stroke={ZERO_STROKE} strokeWidth={1} x={0} />
            <Bar dataKey="inflow" fill={INFLOW_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Entradas" stackId={STACK_ID} stroke={SEGMENT_STROKE} strokeWidth={1} />
            <Bar dataKey="advanced" fill={ADVANCED_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Avanços" radius={[0, 3, 3, 0]} stackId={STACK_ID} stroke={SEGMENT_STROKE} strokeWidth={1} />
            <Bar dataKey="lost" fill={LOST_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Perdas" stackId={STACK_ID} stroke={SEGMENT_STROKE} strokeWidth={1} />
            <Bar dataKey="disqualified" fill={DISQUALIFIED_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Desqualificações" radius={[3, 0, 0, 3]} stackId={STACK_ID} stroke={SEGMENT_STROKE} strokeWidth={1} />
            {rows.map((row) => (
              <ReferenceDot
                fill={netTone(row.net)}
                ifOverflow="extendDomain"
                key={row.id}
                r={MARKER_RADIUS}
                stroke="var(--surface-raised)"
                strokeWidth={2}
                x={row.net}
                y={row.id}
              />
            ))}
            <NetColumn rows={rows} />
            <Tooltip
              content={<ChartTooltip showTotal valueFormat="currencyCompact" />}
              cursor={{ fill: 'var(--line-subtle)' }}
              isAnimationActive={false}
              itemSorter={(item: { readonly dataKey?: unknown }) => STACK_ORDER[String(item.dataKey)] ?? 99}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
