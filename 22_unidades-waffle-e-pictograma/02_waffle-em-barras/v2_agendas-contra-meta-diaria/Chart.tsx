import { Filter } from 'lucide-react';
import { useLayoutEffect, useRef, useState, type ReactElement, type RefObject } from 'react';
import {
  Bar,
  BarChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type LabelProps,
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { dailyGoal, data as defaultData, type DayAgendas } from './data';

/**
 * Waffle em colunas contra uma meta: cada célula vale uma agenda e a linha da meta cai na borda da
 * célula 18. O domínio do eixo oculto é a razão entre a altura do gráfico e a altura da célula, e é
 * ela que põe a linha na célula certa. Os dias abaixo da meta acendem e escrevem quanto faltou.
 */
export interface DailyAgendasWaffleProps {
  /** Uma linha por dia útil, na ordem do calendário. */
  readonly data?: readonly DayAgendas[];
  /** Meta diária em agendas por dia útil. */
  readonly goal?: number;
  /** Altura em px quando o pai não tem altura definida. */
  readonly height?: number;
  readonly className?: string;
}

const PER_ROW = 3;
const UNIT = 1;
const CELL_GAP = 2;
const CELL_RADIUS = 2;
/** Fração da banda que sobra de cada lado da coluna: a coluna ocupa 60% da banda. */
const BAND_GAP = 0.2;
const MARGIN = { top: 40, right: 92, bottom: 0, left: 8 } as const;
const X_AXIS_HEIGHT = 28;
const LABEL_LIFT = 10;
const BELOW_FILL = 'var(--chart-1)';
const ON_GOAL_FILL = 'var(--text-muted)';
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 } as const;
const CURSOR = { fill: 'var(--line-subtle)' } as const;

interface Box {
  readonly width: number;
  readonly height: number;
}

interface WaffleRow extends DayAgendas {
  /** Dia por extenso com a data: rótulo da dica e chave do eixo de categoria. */
  readonly long: string;
  /** Agendas que faltaram para a meta; 0 quando o dia bateu ou passou. */
  readonly missing: number;
}

/** Agrega a lista e devolve null para lista vazia (EST-1b). */
function totalOf(rows: readonly DayAgendas[]): number | null {
  if (rows.length === 0) return null;
  return rows.reduce((sum, row) => sum + row.agendas, 0);
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

function WaffleColumns({ rows, goal }: { readonly rows: readonly WaffleRow[]; readonly goal: number }) {
  const animate = useAnimateOnce();
  const [ref, box] = useBox<HTMLDivElement>();
  const tallest = rows.reduce((max, row) => Math.max(max, row.agendas, goal), 0);
  const lines = domainRows(box, rows.length, Math.ceil(tallest / PER_ROW));
  const shortNames = new Map(rows.map((row) => [row.long, row.shortName]));
  const cellOf = (width: number): number => (width - CELL_GAP * (PER_ROW - 1)) / PER_ROW;

  const renderColumn = ({ x, y, width, height, payload }: BarShapeProps): ReactElement => {
    const row = payload as WaffleRow | undefined;
    if (!row) return <g />;
    const cell = cellOf(width);
    const pitch = rowPitch(box, lines, cell);
    const fill = row.missing > 0 ? BELOW_FILL : ON_GOAL_FILL;
    return (
      <g aria-hidden>
        {Array.from({ length: row.agendas }, (_, index) => (
          <rect fill={fill} key={`${row.id}-${String(index)}`} rx={CELL_RADIUS} {...cellRect(index, y + height, x, cell, pitch)} />
        ))}
      </g>
    );
  };

  /** Valor no topo e, nos dias abaixo da meta, a distância escrita logo acima dele. */
  const renderTop = ({ x, y, width, height, value, index }: LabelProps): ReactElement | null => {
    const count = Number(value);
    const row = index === undefined ? undefined : rows[index];
    if (!Number.isFinite(count) || !row) return null;
    const pitch = rowPitch(box, lines, cellOf(Number(width)));
    const top = Number(y) + Number(height) - Math.ceil(count / PER_ROW) * pitch + CELL_GAP / 2;
    const center = Number(x) + Number(width) / 2;
    // A linha da meta fica na borda da célula: o rótulo de falta sobe até ficar acima dela com folga, nunca a cobre.
    const goalY = Number(y) + Number(height) - (goal / PER_ROW) * pitch;
    const rawMissing = top - LABEL_LIFT - 15;
    const missingY = rawMissing > goalY - 8 && rawMissing < goalY + 14 ? goalY - 8 : rawMissing;
    return (
      <g>
        <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={500} style={HALO} textAnchor="middle" x={center} y={top - LABEL_LIFT}>
          {formatInt(count)}
        </text>
        {row.missing > 0 ? (
          <text className="font-sans" fill="var(--text-secondary)" fontSize={11} fontWeight={500} style={HALO} textAnchor="middle" x={center} y={missingY}>
            {`faltaram ${formatInt(row.missing)}`}
          </text>
        ) : null}
      </g>
    );
  };

  const renderGoalLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number } }): ReactElement => (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) + 6} y={viewBox?.y ?? MARGIN.top}>
      {`meta ${formatInt(goal)} por dia`}
    </text>
  );

  return (
    <div className="min-h-0 flex-1" ref={ref}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart accessibilityLayer={false} barCategoryGap={`${String(Math.round(BAND_GAP * 100))}%`} data={rows} margin={MARGIN}>
          {/* Eixo de valor oculto: o domínio é linhas x células por linha, e a altura da célula sai dele. */}
          <YAxis domain={[0, lines * PER_ROW]} hide type="number" />
          <XAxis
            {...AXIS_PROPS}
            axisLine={false}
            dataKey="long"
            height={X_AXIS_HEIGHT}
            interval={0}
            tickFormatter={(value: string) => shortNames.get(value) ?? value}
            tickLine={false}
            tickMargin={8}
          />
          <Tooltip content={<ChartTooltip valueFormat="int" />} cursor={CURSOR} isAnimationActive={false} />
          {/* extendDomain: sem ele a meta some quando passa do maior valor do domínio (REC-1). */}
          <ReferenceLine ifOverflow="extendDomain" label={renderGoalLabel} stroke="var(--text-muted)" strokeDasharray="4 4" y={goal} />
          {/* O shape próprio mantém o Bar desenhando a coluna com altura zero e o índice do rótulo alinhado. */}
          <Bar dataKey="agendas" fill={ON_GOAL_FILL} isAnimationActive={animate} name="Agendas marcadas" shape={renderColumn}>
            <LabelList content={renderTop} dataKey="agendas" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function GoalAgendasWaffle({ data = defaultData, goal = dailyGoal, height, className }: DailyAgendasWaffleProps) {
  const style = height === undefined ? undefined : { height };
  const total = totalOf(data);

  if (total === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum dia útil neste recorte: não há agendas para comparar com a meta.</span>
      </div>
    );
  }

  const rows: WaffleRow[] = data.map((row) => ({
    ...row,
    long: `${row.weekday}, ${formatDate(row.date)}`,
    missing: Math.max(goal - row.agendas, 0),
  }));
  const below = rows.filter((row) => row.missing > 0);
  const missingTotal = below.reduce((sum, row) => sum + row.missing, 0);
  const unitLabel = `${formatInt(UNIT)} ${UNIT === 1 ? 'agenda' : 'agendas'}`;

  const summary =
    `Gráfico de waffle em colunas das agendas por dia útil contra a meta de ${formatInt(goal)} por dia. ` +
    (below.length > 0
      ? `Ficaram abaixo da meta ${joinList(below.map((row) => row.weekday.toLowerCase()))}, com ${formatInt(missingTotal)} agendas a menos no total. `
      : 'Nenhum dia ficou abaixo da meta. ') +
    `A semana soma ${formatInt(total)} agendas.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-5 text-text-secondary">
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-3 shrink-0 rounded-[2px]" style={{ backgroundColor: BELOW_FILL }} />
          abaixo da meta
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="size-3 shrink-0 rounded-[2px]" style={{ backgroundColor: ON_GOAL_FILL }} />
          na meta ou acima
        </li>
        <li className="ml-auto tabular-nums">{`1 célula = ${unitLabel}`}</li>
      </ul>
      <WaffleColumns goal={goal} rows={rows} />
    </div>
  );
}
