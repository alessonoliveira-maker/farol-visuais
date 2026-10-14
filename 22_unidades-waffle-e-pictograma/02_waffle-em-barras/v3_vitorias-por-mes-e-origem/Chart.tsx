import { Filter } from 'lucide-react';
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactElement, type RefObject } from 'react';
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
  type TooltipContentProps,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { useAnimateOnce, seriesColor } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt, formatMonthLong, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, origins as defaultOrigins, type MonthWins, type OriginDefinition } from './data';

/**
 * Waffle em colunas por origem: cada célula é uma oportunidade ganha, empilhada na ordem fixa das
 * origens, da base ao topo. A célula é um botão que abre a oportunidade, o total do mês vai escrito
 * no topo e o mês em curso se declara parcial no próprio rótulo do eixo.
 */
export interface WinsByOriginWaffleProps {
  /** Um mês por linha, na ordem do calendário, com as vitórias na ordem de preenchimento. */
  readonly data?: readonly MonthWins[];
  /** Origens da base para o topo, com o slot de cor fixo de cada uma. */
  readonly origins?: readonly OriginDefinition[];
  /** Chamada ao ativar uma célula, com o id da oportunidade. */
  readonly onOpenOpportunity?: (opportunityId: string) => void;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const PER_ROW = 3;
const CELL_GAP = 2;
const CELL_RADIUS = 2;
/** Fração da banda que sobra de cada lado da coluna: a coluna ocupa 60% da banda. */
const BAND_GAP = 0.2;
const MARGIN = { top: 24, right: 8, bottom: 0, left: 8 } as const;
/** Duas linhas de rótulo: o mês e, no mês em curso, a palavra parcial. */
const X_AXIS_HEIGHT = 44;
const LABEL_LIFT = 10;
const BASE_RULE = 2;
const ABSENT_STROKE = 1.5;
const NEUTRAL = 'var(--text-muted)';
const CURSOR = { fill: 'var(--line-subtle)' } as const;

interface Box {
  readonly width: number;
  readonly height: number;
}

interface MonthRow {
  readonly month: string;
  readonly partial: boolean;
  readonly until?: string;
  readonly total: number;
  readonly wins: readonly { readonly id: string; readonly origin: string }[];
}

function originColor(origin: OriginDefinition | undefined): string {
  return origin?.slot ? seriesColor(origin.slot - 1) : NEUTRAL;
}

/** Mede o corpo do gráfico, porque o domínio do eixo oculto depende da altura em px. */
function useBox<T extends HTMLElement>(): readonly [RefObject<T>, Box | null] {
  const ref = useRef<T>(null);
  const [box, setBox] = useState<Box | null>(null);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const read = (): void => {
      const rect = node.getBoundingClientRect();
      setBox((prev) => (prev && prev.width === rect.width && prev.height === rect.height ? prev : { width: rect.width, height: rect.height }));
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, box];
}

/** Altura em px do corpo do gráfico sem a margem e sem o eixo de categoria. */
function plotHeight(box: Box): number {
  return box.height - MARGIN.top - MARGIN.bottom - X_AXIS_HEIGHT;
}

/** Linhas do domínio: as que cabem no corpo com a célula quase quadrada, nunca menos que as da maior coluna. */
function domainRows(box: Box | null, columns: number, neededRows: number): number {
  if (!box) return neededRows + 1;
  const bar = ((box.width - MARGIN.left - MARGIN.right) / columns) * (1 - 2 * BAND_GAP);
  const cell = (bar - CELL_GAP * (PER_ROW - 1)) / PER_ROW;
  return Math.max(neededRows, Math.floor(plotHeight(box) / (cell + CELL_GAP)));
}

/** Passo vertical de uma linha de células, em px: o corpo dividido pelas linhas do domínio. */
function rowPitch(box: Box | null, rows: number, cell: number): number {
  return box ? plotHeight(box) / rows : cell + CELL_GAP;
}

/** Célula `index` da coluna: preenche a linha de baixo para cima, da esquerda para a direita. */
function cellRect(index: number, baseY: number, x: number, cell: number, pitch: number) {
  const line = Math.floor(index / PER_ROW);
  const column = index % PER_ROW;
  return {
    x: x + column * (cell + CELL_GAP),
    y: baseY - (line + 1) * pitch + CELL_GAP / 2,
    width: cell,
    height: pitch - CELL_GAP,
  };
}

/** Ausência é célula vazada: o contorno entra pela metade do traço para não passar da célula. */
function hollow(rect: ReturnType<typeof cellRect>, absent: boolean) {
  if (!absent) return rect;
  const inset = ABSENT_STROKE / 2;
  return { x: rect.x + inset, y: rect.y + inset, width: rect.width - ABSENT_STROKE, height: rect.height - ABSENT_STROKE };
}

interface MonthTickProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

interface ColumnsProps {
  readonly rows: readonly MonthRow[];
  readonly origins: readonly OriginDefinition[];
  readonly onOpenOpportunity: ((opportunityId: string) => void) | undefined;
}

function WaffleColumns({ rows, origins, onOpenOpportunity }: ColumnsProps) {
  const animate = useAnimateOnce();
  const [ref, box] = useBox<HTMLDivElement>();
  const tallest = rows.reduce((max, row) => Math.max(max, row.total), 0);
  const lines = domainRows(box, rows.length, Math.ceil(tallest / PER_ROW));
  const byKey = new Map(origins.map((origin) => [origin.key, origin]));
  const partialMonths = new Map(rows.filter((row) => row.partial).map((row) => [row.month, row.until ?? ''] as const));
  const cellOf = (width: number): number => (width - CELL_GAP * (PER_ROW - 1)) / PER_ROW;

  const renderColumn = ({ x, y, width, height, payload }: BarShapeProps): ReactElement => {
    const row = payload as MonthRow | undefined;
    if (!row) return <g />;
    const cell = cellOf(width);
    const pitch = rowPitch(box, lines, cell);
    const baseY = y + height;
    // Zero medido desenha só a base: uma régua fina na largura da coluna, e o 0 vai escrito no topo.
    if (row.total === 0) return <rect aria-hidden fill={NEUTRAL} height={BASE_RULE} width={width} x={x} y={baseY - BASE_RULE} />;
    return (
      <g>
        {row.wins.map((win, index) => {
          const origin = byKey.get(win.origin as OriginDefinition['key']);
          const open = (): void => onOpenOpportunity?.(win.id);
          const onKey = (event: KeyboardEvent<SVGRectElement>): void => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              open();
            }
          };
          return (
            <rect
              aria-label={`Abrir a oportunidade ${win.id}, origem ${(origin?.label ?? '').toLowerCase()}, ${formatMonthShort(row.month)}`}
              className={onOpenOpportunity ? 'cursor-pointer' : undefined}
              fill={origin?.slot ? originColor(origin) : 'none'}
              key={win.id}
              onClick={open}
              onKeyDown={onKey}
              role="button"
              rx={CELL_RADIUS}
              stroke={origin?.slot ? undefined : NEUTRAL}
              strokeWidth={origin?.slot ? undefined : ABSENT_STROKE}
              tabIndex={0}
              {...hollow(cellRect(index, baseY, x, cell, pitch), !origin?.slot)}
            />
          );
        })}
      </g>
    );
  };

  const renderTop = ({ x, y, width, height, value }: LabelProps): ReactElement | null => {
    const count = Number(value);
    if (!Number.isFinite(count)) return null;
    const pitch = rowPitch(box, lines, cellOf(Number(width)));
    const base = Number(y) + Number(height);
    const top = count === 0 ? base : base - Math.ceil(count / PER_ROW) * pitch + CELL_GAP / 2;
    return (
      <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={500} textAnchor="middle" x={Number(x) + Number(width) / 2} y={top - LABEL_LIFT}>
        {formatInt(count)}
      </text>
    );
  };

  const renderMonthTick = ({ x, y, payload }: MonthTickProps): ReactElement => {
    const month = String(payload?.value ?? '');
    const until = partialMonths.get(month);
    const partial = until !== undefined;
    return (
      <g>
        <text className="font-sans tabular-nums" dominantBaseline="hanging" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={Number(x)} y={Number(y)}>
          {formatMonthShort(month)}
        </text>
        {partial ? (
          <text className="font-sans" dominantBaseline="hanging" fill="var(--text-secondary)" fontSize={11} fontWeight={600} textAnchor="middle" x={Number(x)} y={Number(y) + 14}>
            {until ? `parcial até ${formatDate(until).slice(0, 5)}` : 'parcial'}
          </text>
        ) : null}
      </g>
    );
  };

  /** A dica traz a contagem por origem do mês, que o desenho não escreve. */
  const renderTip = (props: TooltipContentProps): ReactElement => {
    const row = rows.find((item) => item.month === String(props.label));
    // O Recharts exige campos internos (graphicalItemId) que a dica não lê; o ChartTooltip só usa nome, valor e cor.
    const payload = (row
      ? origins
          .map((origin) => ({
            dataKey: origin.key,
            name: origin.label,
            color: originColor(origin),
            value: row.wins.filter((win) => win.origin === origin.key).length,
          }))
          .filter((entry) => entry.value > 0)
      : []) as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={props.label} labelFormat="month" payload={payload} showTotal valueFormat="int" />;
  };

  return (
    <div className="min-h-0 flex-1" ref={ref}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart accessibilityLayer={false} barCategoryGap={`${String(Math.round(BAND_GAP * 100))}%`} data={rows} margin={MARGIN}>
          {/* Eixo de valor oculto: o domínio é linhas x células por linha, e a altura da célula sai dele. */}
          <YAxis domain={[0, lines * PER_ROW]} hide type="number" />
          <XAxis axisLine={false} dataKey="month" height={X_AXIS_HEIGHT} interval={0} tick={renderMonthTick} tickLine={false} tickMargin={8} />
          <Tooltip content={renderTip} cursor={CURSOR} isAnimationActive={false} />
          {/* O shape próprio mantém o Bar desenhando o mês de zero vitória e o índice do rótulo alinhado. */}
          <Bar dataKey="total" fill={NEUTRAL} isAnimationActive={animate} name="Vitórias" shape={renderColumn}>
            <LabelList content={renderTop} dataKey="total" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function WinsByOriginWaffle({
  data = defaultData,
  origins = defaultOrigins,
  onOpenOpportunity,
  height,
  className,
}: WinsByOriginWaffleProps) {
  const style = height === undefined ? undefined : { height };
  const order = new Map<string, number>(origins.map((origin, index) => [origin.key, index]));
  const rows: MonthRow[] = data.map((item) => ({
    month: item.month,
    partial: item.partialUntil !== undefined,
    until: item.partialUntil,
    total: item.wins.length,
    wins: [...item.wins].sort((a, b) => (order.get(a.origin) ?? 0) - (order.get(b.origin) ?? 0)),
  }));

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: não há vitórias para contar por origem.</span>
      </div>
    );
  }

  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const perOrigin = origins.map((origin) => ({ origin, count: rows.reduce((sum, row) => sum + row.wins.filter((win) => win.origin === origin.key).length, 0) }));
  const bestMonth = rows.reduce((best, row) => (row.total > best.total ? row : best), rows[0] ?? { month: '', partial: false, total: 0, wins: [] });
  const bestOrigin = perOrigin.reduce((best, item) => (item.count > best.count ? item : best), perOrigin[0] ?? { origin: undefined, count: 0 });
  const partial = data.find((item) => item.partialUntil !== undefined);

  const summary =
    `Gráfico de waffle em colunas com ${formatInt(total)} oportunidades ganhas em ${formatInt(rows.length)} meses, por origem. ` +
    `O maior mês é ${formatMonthLong(bestMonth.month)}, com ${formatInt(bestMonth.total)}; a maior origem é ${(bestOrigin.origin?.label ?? '').toLowerCase()}, com ${formatInt(bestOrigin.count)}.` +
    (partial?.partialUntil ? ` ${capitalize(formatMonthLong(partial.month))} é parcial, até ${formatDate(partial.partialUntil)}.` : '');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <ul className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-5 text-text-secondary">
        <li className="text-text-muted">da base ao topo</li>
        {perOrigin.map(({ origin, count }) => (
          <li className="flex items-center gap-2" key={origin.key}>
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-[2px]"
              style={origin.slot ? { backgroundColor: originColor(origin) } : { boxShadow: `inset 0 0 0 ${String(ABSENT_STROKE)}px ${NEUTRAL}` }}
            />
            {origin.label}
            <span className="kpi-number text-text-muted">{formatInt(count)}</span>
          </li>
        ))}
        <li className="ml-auto tabular-nums text-text-muted">{`1 célula = ${formatInt(1)} vitória`}</li>
      </ul>
      <WaffleColumns onOpenOpportunity={onOpenOpportunity} origins={origins} rows={rows} />
    </div>
  );
}
