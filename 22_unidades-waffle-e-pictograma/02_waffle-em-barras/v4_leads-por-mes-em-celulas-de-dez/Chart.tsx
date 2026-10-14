import { Filter, Unplug } from 'lucide-react';
import { useLayoutEffect, useRef, useState, type ReactElement, type RefObject } from 'react';
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
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthLong, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthLeads } from './data';

/**
 * Waffle em colunas de leads por mês. A célula vale 1 lead e sobe para 10 quando algum mês passa
 * de 300, para a coluna continuar contável. A última célula é parcial na largura, o valor exato vai
 * escrito no topo, o mês sem coleta é um contorno tracejado e o zero medido é só a base.
 */
export interface LeadsWaffleProps {
  /** Um mês por linha, na ordem do calendário; `leads` nulo é mês sem coleta. */
  readonly data?: readonly MonthLeads[];
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const PER_ROW = 4;
const CELL_GAP = 2;
const CELL_RADIUS = 2;
/** Maior mês acima disto troca a unidade da célula de 1 para UNIT_LARGE leads. */
const LARGE_THRESHOLD = 300;
const UNIT_LARGE = 10;
/** Fração da banda que sobra de cada lado da coluna: a coluna ocupa 60% da banda. */
const BAND_GAP = 0.2;
const MARGIN = { top: 24, right: 8, bottom: 0, left: 8 } as const;
const X_AXIS_HEIGHT = 28;
const LABEL_LIFT = 10;
const BASE_RULE = 2;
/** O mês sem coleta ocupa duas linhas de células, para o contorno e o ícone caberem. */
const ABSENT_LINES = 2;
const ICON_SIZE = 14;
const FILL = 'var(--chart-1)';
const NEUTRAL = 'var(--text-muted)';
const CURSOR = { fill: 'var(--line-subtle)' } as const;

interface Box {
  readonly width: number;
  readonly height: number;
}

interface LeadsRow {
  readonly id: string;
  readonly month: string;
  readonly leads: number | null;
  /** Células do mês, em unidades de célula e com fração; 0 para zero medido e para mês sem coleta. */
  readonly cells: number;
}

/** Soma os meses medidos e devolve null quando nenhum foi medido (EST-1b). */
function totalOf(rows: readonly MonthLeads[]): number | null {
  const measured = rows.flatMap((row) => (row.leads === null ? [] : [row.leads]));
  return measured.length === 0 ? null : measured.reduce((sum, value) => sum + value, 0);
}

/** Leads por célula: sobe para dez quando algum mês passa de 300. */
function unitFor(rows: readonly MonthLeads[]): number {
  const peak = rows.reduce((max, row) => Math.max(max, row.leads ?? 0), 0);
  return peak > LARGE_THRESHOLD ? UNIT_LARGE : 1;
}

/** Junta nomes em português: "a, b e c". */
function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1] ?? ''}`;
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
function cellRect(index: number, baseY: number, x: number, cell: number, pitch: number, share = 1) {
  const line = Math.floor(index / PER_ROW);
  const column = index % PER_ROW;
  return {
    x: x + column * (cell + CELL_GAP),
    y: baseY - (line + 1) * pitch + CELL_GAP / 2,
    width: cell * share,
    height: pitch - CELL_GAP,
  };
}

/** Células inteiras e fração da última, sem o ruído de ponto flutuante: 34,7 vira 34 e 0,7. */
function splitCells(cells: number): { readonly full: number; readonly rest: number } {
  const full = Math.floor(cells + 1e-9);
  return { full, rest: Math.max(cells - full, 0) < 1e-9 ? 0 : cells - full };
}

function WaffleColumns({ rows, unit }: { readonly rows: readonly LeadsRow[]; readonly unit: number }) {
  const animate = useAnimateOnce();
  const [ref, box] = useBox<HTMLDivElement>();
  const tallest = rows.reduce((max, row) => Math.max(max, Math.ceil(row.cells - 1e-9)), 0);
  const lines = domainRows(box, rows.length, Math.max(Math.ceil(tallest / PER_ROW), ABSENT_LINES));
  const cellOf = (width: number): number => (width - CELL_GAP * (PER_ROW - 1)) / PER_ROW;

  const renderColumn = ({ x, y, width, height, payload }: BarShapeProps): ReactElement => {
    const row = payload as LeadsRow | undefined;
    if (!row) return <g />;
    const cell = cellOf(width);
    const pitch = rowPitch(box, lines, cell);
    const baseY = y + height;
    if (row.leads === null) {
      const boxHeight = ABSENT_LINES * pitch - CELL_GAP;
      const top = baseY - ABSENT_LINES * pitch + CELL_GAP / 2;
      return (
        <g aria-hidden>
          <rect fill="none" height={boxHeight} rx={CELL_RADIUS} stroke={NEUTRAL} strokeDasharray="4 3" strokeWidth={1.5} width={width} x={x} y={top} />
          <Unplug color={NEUTRAL} height={ICON_SIZE} width={ICON_SIZE} x={x + (width - ICON_SIZE) / 2} y={top + (boxHeight - ICON_SIZE) / 2} />
        </g>
      );
    }
    if (row.leads === 0) return <rect aria-hidden fill={NEUTRAL} height={BASE_RULE} width={width} x={x} y={baseY - BASE_RULE} />;
    const { full, rest } = splitCells(row.cells);
    return (
      <g aria-hidden>
        {Array.from({ length: full + (rest > 0 ? 1 : 0) }, (_, index) => (
          <rect fill={FILL} key={`${row.id}-${String(index)}`} rx={CELL_RADIUS} {...cellRect(index, baseY, x, cell, pitch, index < full ? 1 : rest)} />
        ))}
      </g>
    );
  };

  /** Valor exato no topo, lido de `leads`: o arredondamento das células não entra na conta. */
  const renderTop = ({ x, y, width, height, value }: LabelProps): ReactElement | null => {
    const pitch = rowPitch(box, lines, cellOf(Number(width)));
    const base = Number(y) + Number(height);
    const center = Number(x) + Number(width) / 2;
    if (value === null || value === undefined || value === '') {
      return (
        <text className="font-sans" fill="var(--text-muted)" fontSize={11} fontWeight={500} textAnchor="middle" x={center} y={base - ABSENT_LINES * pitch - LABEL_LIFT / 2}>
          {formatUnavailable()}
        </text>
      );
    }
    const leads = Number(value);
    if (!Number.isFinite(leads)) return null;
    const top = leads === 0 ? base : base - Math.ceil(Math.ceil(leads / unit - 1e-9) / PER_ROW) * pitch + CELL_GAP / 2;
    return (
      <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={500} textAnchor="middle" x={center} y={top - LABEL_LIFT}>
        {formatInt(leads)}
      </text>
    );
  };

  /** A dica traz as células desenhadas, que o rótulo do topo não escreve. */
  const renderTip = (props: TooltipContentProps): ReactElement => {
    const row = rows.find((item) => item.month === String(props.label));
    // O Recharts exige campos internos (graphicalItemId) que a dica não lê; o ChartTooltip só usa nome, valor e cor.
    const payload = (row
      ? [
          { dataKey: 'leads', name: 'Leads', color: FILL, value: row.leads ?? formatUnavailable() },
          ...(row.leads ? [{ dataKey: 'cells', name: 'Células desenhadas', color: FILL, value: Math.ceil(row.cells - 1e-9) }] : []),
        ]
      : []) as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={props.label} labelFormat="month" payload={payload} valueFormat="int" />;
  };

  return (
    <div className="min-h-0 flex-1" ref={ref}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart accessibilityLayer={false} barCategoryGap={`${String(Math.round(BAND_GAP * 100))}%`} data={rows} margin={MARGIN}>
          {/* Eixo de valor oculto: o domínio é linhas x células por linha, e a altura da célula sai dele. */}
          <YAxis domain={[0, lines * PER_ROW]} hide type="number" />
          <XAxis
            {...AXIS_PROPS}
            axisLine={false}
            dataKey="month"
            height={X_AXIS_HEIGHT}
            interval={0}
            tickFormatter={formatMonthShort}
            tickLine={false}
            tickMargin={8}
          />
          <Tooltip content={renderTip} cursor={CURSOR} isAnimationActive={false} />
          {/* O shape próprio mantém o Bar desenhando o mês de zero e o de sem coleta, que chegam com altura zero. */}
          <Bar dataKey="cells" fill={FILL} isAnimationActive={animate} name="Células" shape={renderColumn}>
            <LabelList content={renderTop} dataKey="leads" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function LeadsWaffle({ data = defaultData, height, className }: LeadsWaffleProps) {
  const style = height === undefined ? undefined : { height };
  const total = totalOf(data);

  if (total === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês com coleta neste recorte: não há leads para contar em células.</span>
      </div>
    );
  }

  const unit = unitFor(data);
  const rows: LeadsRow[] = data.map((item) => ({ ...item, cells: (item.leads ?? 0) / unit }));
  const best = data.reduce<MonthLeads | null>((top, item) => (item.leads !== null && (top === null || item.leads > (top.leads ?? 0)) ? item : top), null);
  const absent = data.filter((item) => item.leads === null).map((item) => formatMonthLong(item.month));
  const zero = data.filter((item) => item.leads === 0).map((item) => formatMonthLong(item.month));
  const hasPartial = rows.some((row) => splitCells(row.cells).rest > 0);
  const unitLabel = `${formatInt(unit)} ${unit === 1 ? 'lead' : 'leads'}`;

  const summary =
    `Gráfico de waffle em colunas com os leads de ${formatInt(data.length)} meses, em células de ${unitLabel}. ` +
    (best ? `O maior mês é ${formatMonthLong(best.month)}, com ${formatInt(best.leads ?? 0)}.` : '') +
    (absent.length > 0 ? ` Sem coleta em ${joinList(absent)}.` : '') +
    (zero.length > 0 ? ` Zero medido em ${joinList(zero)}.` : '') +
    ` Soma medida: ${formatInt(total)} leads.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-5 text-text-secondary">
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-3 shrink-0 rounded-[2px]" style={{ backgroundColor: FILL }} />
          <span className="tabular-nums">{`1 célula = ${unitLabel}`}</span>
        </li>
        {hasPartial ? (
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-3 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: FILL }} />
            célula final parcial
          </li>
        ) : null}
        {absent.length > 0 ? (
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 shrink-0 rounded-[2px] border border-dashed" style={{ borderColor: NEUTRAL }} />
            sem coleta
          </li>
        ) : null}
      </ul>
      <WaffleColumns rows={rows} unit={unit} />
    </div>
  );
}
