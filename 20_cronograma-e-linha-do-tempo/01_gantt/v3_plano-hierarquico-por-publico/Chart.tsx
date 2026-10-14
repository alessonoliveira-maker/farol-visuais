import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useXAxisScale,
  type BarShapeProps,
} from 'recharts';

import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  today as defaultToday,
  windowEnd as defaultWindowEnd,
  windowStart as defaultWindowStart,
  type PlanNode,
  type Status,
} from './data';

/**
 * Gantt hierárquico: público, iniciativa e entrega achatados em linhas, com o nome indentado e as
 * colunas de dono e status no próprio rótulo do eixo. Público e iniciativa mostram a envoltória
 * das entregas em barra fina; a entrega mostra o período em barra cheia, na cor do status.
 */
export interface PlanByAudienceProps {
  /** Nós em ordem de árvore, com o pai antes dos filhos. A ordem de entrada é a ordem das linhas. */
  readonly data?: readonly PlanNode[];
  /** Hoje, em YYYY-MM-DD, vindo do dado. */
  readonly today?: string;
  /** Primeiro e último dia do eixo, em YYYY-MM-DD. */
  readonly windowStart?: string;
  readonly windowEnd?: string;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const DAY_MS = 86_400_000;
/** Colunas do rótulo do eixo, da esquerda para a direita: nome com indentação, dono, status. */
const NAME_COLUMN = 168;
const OWNER_COLUMN = 64;
const STATUS_COLUMN = 80;
const NAME_AXIS_WIDTH = NAME_COLUMN + OWNER_COLUMN + STATUS_COLUMN;
const INDENT = 12;
const ICON_RADIUS = 5;
/** Topo reservado ao rótulo de hoje; direita reservada ao último tique do eixo, que cai na borda. */
const MARGIN = { top: 20, right: 26, bottom: 2, left: 0 } as const;
const AXIS_HEIGHT = 24;
/** Espessura por nível: a entrega é a marca cheia, e o agrupamento é uma faixa fina. */
const TASK_THICKNESS = 12;
const GROUP_THICKNESS = 5;
const GROUP_FILL = 'var(--text-muted)';
const ICON_CHECK = 'var(--surface-raised)';
/** Camada de rótulo do Recharts (2000): texto por cima de qualquer barra. */
const LABEL_Z = 2000;

const STATUS: Readonly<Record<Status, { readonly label: string; readonly fill: string }>> = {
  done: { label: 'Concluída', fill: 'var(--chart-3)' },
  active: { label: 'Em curso', fill: 'var(--chart-1)' },
  planned: { label: 'Planejada', fill: 'var(--surface-sunken)' },
  late: { label: 'Em atraso', fill: 'var(--negative)' },
};

interface Row extends PlanNode {
  /** 0 público, 1 iniciativa, 2 entrega. */
  readonly level: number;
  /** Extremos da barra, fim exclusivo; a envoltória dos filhos nos níveis de agrupamento; `null` sem entrega. */
  readonly range: readonly [number, number] | null;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Data YYYY-MM-DD em milissegundos UTC. */
function toMs(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Primeiro dia de cada trimestre dentro do eixo: o tique e a grade vertical caem sempre no dia 1. */
function quarterTicks(startMs: number, endMs: number): number[] {
  const year = new Date(startMs).getUTCFullYear();
  const ticks: number[] = [];
  for (let month = 0; month <= 48; month += 3) {
    const tick = Date.UTC(year, month, 1);
    if (tick >= startMs && tick <= endMs) ticks.push(tick);
  }
  return ticks;
}

/** Achata a árvore em linhas: nível pela cadeia de pais, envoltória de min(início) e max(fim) das entregas filhas. */
function toRows(nodes: readonly PlanNode[]): Row[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const depthOf = (node: PlanNode): number => {
    const parent = node.parentId === null ? undefined : byId.get(node.parentId);
    return parent ? depthOf(parent) + 1 : 0;
  };
  const leafRange = (node: PlanNode): readonly [number, number][] => {
    const children = nodes.filter((child) => child.parentId === node.id);
    if (children.length > 0) return children.flatMap(leafRange);
    if (node.start === undefined || node.end === undefined) return [];
    return [[toMs(node.start), toMs(node.end) + DAY_MS]];
  };
  return nodes.map((node) => {
    const spans = leafRange(node);
    const range =
      spans.length === 0
        ? null
        : ([Math.min(...spans.map((span) => span[0])), Math.max(...spans.map((span) => span[1]))] as const);
    return { ...node, level: depthOf(node), range };
  });
}

/** Quantas entregas há em cada status; só conta quem tem status. */
function countByStatus(rows: readonly Row[]): Readonly<Record<Status, number>> {
  const counts: Record<Status, number> = { done: 0, active: 0, planned: 0, late: 0 };
  for (const row of rows) {
    if (row.status !== undefined) counts[row.status] += 1;
  }
  return counts;
}

/** Ícone do status na forma de cada um, para a cor nunca ser a única pista: marca, meia marca, anel e triângulo. */
function StatusIcon({ status, cx, cy }: { readonly status: Status; readonly cx: number; readonly cy: number }) {
  const fill = STATUS[status].fill;
  const r = ICON_RADIUS;
  if (status === 'done') {
    return (
      <g>
        <circle cx={cx} cy={cy} fill={fill} r={r} />
        <path d={`M${String(cx - 2.6)} ${String(cy)} L${String(cx - 0.8)} ${String(cy + 1.9)} L${String(cx + 2.7)} ${String(cy - 2)}`} fill="none" stroke={ICON_CHECK} strokeWidth={1.5} />
      </g>
    );
  }
  if (status === 'active') {
    return (
      <g>
        <circle cx={cx} cy={cy} fill="none" r={r - 0.75} stroke={fill} strokeWidth={1.5} />
        <path d={`M${String(cx)} ${String(cy - r + 1.5)} A${String(r - 1.5)} ${String(r - 1.5)} 0 0 1 ${String(cx)} ${String(cy + r - 1.5)} Z`} fill={fill} />
      </g>
    );
  }
  if (status === 'late') {
    return <polygon fill={fill} points={`${String(cx)},${String(cy - r)} ${String(cx + r)},${String(cy + r - 1)} ${String(cx - r)},${String(cy + r - 1)}`} />;
  }
  return <circle cx={cx} cy={cy} fill="none" r={r - 0.75} stroke="var(--text-muted)" strokeWidth={1.5} />;
}

/** Só o rótulo de hoje: a linha em si é uma ReferenceLine que atravessa as linhas dos três níveis. */
function TodayLabel({ todayMs }: { readonly todayMs: number }) {
  const xScale = useXAxisScale();
  const plot = usePlotArea();
  const todayX = xScale?.(todayMs);
  if (!plot || todayX === undefined) return null;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      <text
        className="font-display"
        fill="var(--text-primary)"
        fontSize={11}
        fontWeight={600}
        textAnchor="middle"
        x={todayX}
        y={plot.y - 8}
      >
        {`hoje, ${formatDate(toIso(todayMs))}`}
      </text>
    </ZIndexLayer>
  );
}

export default function PlanByAudience({
  data = defaultData,
  today = defaultToday,
  windowStart = defaultWindowStart,
  windowEnd = defaultWindowEnd,
  height,
  className,
}: PlanByAudienceProps) {
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
        <span>Nenhuma entrega neste recorte: não há iniciativa com datas para desenhar no plano.</span>
      </div>
    );
  }

  const startMs = toMs(windowStart);
  const endMs = toMs(windowEnd) + DAY_MS;
  const todayMs = toMs(today);
  const byId = new Map(rows.map((row) => [row.id, row]));
  const tasks = rows.filter((row) => row.status !== undefined);
  const counts = countByStatus(rows);
  const audiences = rows.filter((row) => row.level === 0).length;
  const initiatives = rows.filter((row) => row.level === 1).length;
  const todayText = formatDate(today);
  const lateText = `${formatInt(counts.late)} de ${formatInt(tasks.length)}`;

  const summary = [
    `Gráfico de Gantt hierárquico de 2027 com ${formatInt(audiences)} públicos, ${formatInt(initiatives)} iniciativas e ${formatInt(tasks.length)} entregas.`,
    `Em ${todayText}, ${formatInt(counts.done)} concluídas, ${formatInt(counts.active)} em curso, ${formatInt(counts.planned)} planejadas e ${formatInt(counts.late)} em atraso.`,
    'Cada entrega traz dono e status escritos, e a linha de hoje atravessa os três níveis.',
  ].join(' ');

  const renderTick = ({ y, payload }: NameTickProps): ReactElement => {
    const row = byId.get(String(payload?.value ?? ''));
    const cy = Number(y);
    if (!row) return <g />;
    const status = row.status === undefined ? undefined : STATUS[row.status];
    return (
      <g>
        <text
          className="font-sans"
          dominantBaseline="central"
          fill={row.level === 2 ? 'var(--text-secondary)' : 'var(--text-primary)'}
          fontSize={12}
          fontWeight={row.level === 0 ? 600 : 500}
          x={MARGIN.left + row.level * INDENT}
          y={cy}
        >
          {row.name}
        </text>
        {row.owner === undefined ? null : (
          <text
            className="font-sans"
            dominantBaseline="central"
            fill="var(--text-muted)"
            fontSize={11}
            fontWeight={500}
            x={NAME_COLUMN}
            y={cy}
          >
            {row.owner}
          </text>
        )}
        {row.status === undefined || status === undefined ? null : (
          <>
            <StatusIcon cx={NAME_COLUMN + OWNER_COLUMN + ICON_RADIUS} cy={cy} status={row.status} />
            <text
              className="font-sans"
              dominantBaseline="central"
              fill={row.status === 'late' ? 'var(--negative)' : 'var(--text-secondary)'}
              fontSize={11}
              fontWeight={row.status === 'late' ? 600 : 500}
              x={NAME_COLUMN + OWNER_COLUMN + ICON_RADIUS * 2 + 6}
              y={cy}
            >
              {status.label}
            </text>
          </>
        )}
      </g>
    );
  };

  const renderBar = ({ x, y, width, height: barHeight, originalDataIndex }: BarShapeProps): ReactElement | null => {
    const row = rows[originalDataIndex];
    if (!row) return null;
    const thickness = row.status === undefined ? GROUP_THICKNESS : TASK_THICKNESS;
    const fill = row.status === undefined ? GROUP_FILL : STATUS[row.status].fill;
    return (
      <rect
        fill={fill}
        height={thickness}
        rx={row.status === undefined ? 1 : 3}
        stroke={row.status === 'planned' ? 'var(--text-muted)' : undefined}
        strokeWidth={row.status === 'planned' ? 1 : undefined}
        width={Number(width)}
        x={Number(x)}
        y={Number(y) + (Number(barHeight) - thickness) / 2}
      />
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 shrink-0 truncate text-xs text-text-secondary">
        Em {todayText}, <span className="kpi-number font-semibold text-text-primary">{lateText}</span> entregas em
        atraso, {formatInt(counts.done)} concluídas e {formatInt(counts.active)} em curso
      </p>
      <div aria-hidden className="mb-1 flex shrink-0 items-center text-[0.6875rem] leading-4 text-text-muted">
        <span className="shrink-0" style={{ width: NAME_COLUMN }}>
          público, iniciativa e entrega
        </span>
        <span className="shrink-0" style={{ width: OWNER_COLUMN }}>
          dono
        </span>
        <span className="shrink-0" style={{ width: STATUS_COLUMN }}>
          status
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="20%" data={rows} layout="vertical" margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[startMs, endMs]}
              height={AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatMonthShort(toIso(value))}
              tickLine={false}
              tickMargin={8}
              ticks={quarterTicks(startMs, endMs)}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="id"
              interval={0}
              tick={renderTick}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Bar dataKey="range" isAnimationActive={animate} shape={renderBar} />
            {/* Duas linhas: o fio claro por baixo é o halo que mantém a linha de hoje visível sobre a barra colorida (TOK-10). */}
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--surface-raised)" strokeWidth={5} x={todayMs} />
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--text-primary)" strokeWidth={1.5} x={todayMs} />
            <TodayLabel todayMs={todayMs} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
