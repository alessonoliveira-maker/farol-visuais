import { Filter } from 'lucide-react';
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
} from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type DayAgendas } from './data';

/**
 * Waffle em colunas: a altura de cada dia segue comparável como numa coluna comum, mas feita de
 * células que valem uma agenda cada. O número escrito no topo é o valor exato, e o eixo de valor
 * fica oculto porque o domínio é a razão entre a altura do gráfico e a altura da célula.
 */
export interface DailyAgendasWaffleProps {
  /** Uma linha por dia útil, na ordem do calendário. */
  readonly data?: readonly DayAgendas[];
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
const MARGIN = { top: 24, right: 8, bottom: 0, left: 8 } as const;
const X_AXIS_HEIGHT = 28;
const LABEL_LIFT = 10;
const FILL = 'var(--chart-1)';
const CURSOR = { fill: 'var(--line-subtle)' } as const;

interface Box {
  readonly width: number;
  readonly height: number;
}

interface WaffleRow extends DayAgendas {
  /** Dia por extenso com a data: rótulo da dica e chave do eixo de categoria. */
  readonly long: string;
}

/** Agrega a lista e devolve null para lista vazia (EST-1b). */
function totalOf(rows: readonly DayAgendas[]): number | null {
  if (rows.length === 0) return null;
  return rows.reduce((sum, row) => sum + row.agendas, 0);
}

function extremeOf(rows: readonly DayAgendas[], sign: 1 | -1): DayAgendas | null {
  return rows.reduce<DayAgendas | null>((best, row) => (best === null || (row.agendas - best.agendas) * sign > 0 ? row : best), null);
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

function WaffleColumns({ rows }: { readonly rows: readonly WaffleRow[] }) {
  const animate = useAnimateOnce();
  const [ref, box] = useBox<HTMLDivElement>();
  const tallest = rows.reduce((max, row) => Math.max(max, row.agendas), 0);
  const lines = domainRows(box, rows.length, Math.ceil(tallest / PER_ROW));
  const shortNames = new Map(rows.map((row) => [row.long, row.shortName]));
  const cellOf = (width: number): number => (width - CELL_GAP * (PER_ROW - 1)) / PER_ROW;

  const renderColumn = ({ x, y, width, height, payload }: BarShapeProps): ReactElement => {
    const row = payload as WaffleRow | undefined;
    if (!row) return <g />;
    const cell = cellOf(width);
    const pitch = rowPitch(box, lines, cell);
    return (
      <g aria-hidden>
        {Array.from({ length: row.agendas }, (_, index) => (
          <rect fill={FILL} key={`${row.id}-${String(index)}`} rx={CELL_RADIUS} {...cellRect(index, y + height, x, cell, pitch)} />
        ))}
      </g>
    );
  };

  const renderTop = ({ x, y, width, height, value }: LabelProps): ReactElement | null => {
    const count = Number(value);
    if (!Number.isFinite(count)) return null;
    const pitch = rowPitch(box, lines, cellOf(Number(width)));
    const top = Number(y) + Number(height) - Math.ceil(count / PER_ROW) * pitch + CELL_GAP / 2;
    return (
      <text
        className="font-display"
        fill="var(--text-primary)"
        fontSize={12}
        fontWeight={500}
        textAnchor="middle"
        x={Number(x) + Number(width) / 2}
        y={top - LABEL_LIFT}
      >
        {formatInt(count)}
      </text>
    );
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
            dataKey="long"
            height={X_AXIS_HEIGHT}
            interval={0}
            tickFormatter={(value: string) => shortNames.get(value) ?? value}
            tickLine={false}
            tickMargin={8}
          />
          <Tooltip content={<ChartTooltip valueFormat="int" />} cursor={CURSOR} isAnimationActive={false} />
          {/* O shape próprio mantém o Bar desenhando a coluna com altura zero e o índice do rótulo alinhado. */}
          <Bar dataKey="agendas" fill={FILL} isAnimationActive={animate} name="Agendas marcadas" shape={renderColumn}>
            <LabelList content={renderTop} dataKey="agendas" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DailyAgendasWaffle({ data = defaultData, height, className }: DailyAgendasWaffleProps) {
  const style = height === undefined ? undefined : { height };
  const total = totalOf(data);

  if (total === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum dia útil neste recorte: não há agendas para contar.</span>
      </div>
    );
  }

  const rows: WaffleRow[] = data.map((row) => ({ ...row, long: `${row.weekday}, ${formatDate(row.date)}` }));
  const peak = extremeOf(data, 1);
  const low = extremeOf(data, -1);
  const unitLabel = `${formatInt(UNIT)} ${UNIT === 1 ? 'agenda' : 'agendas'}`;
  const first = data[0];
  const last = data[data.length - 1];

  const summary = [
    `Gráfico de waffle em colunas com ${formatInt(total)} agendas marcadas em ${formatInt(data.length)} dias úteis`,
    first && last ? `, de ${formatDate(first.date)} a ${formatDate(last.date)}.` : '.',
    peak ? ` O maior dia é ${peak.weekday.toLowerCase()}, com ${formatInt(peak.agendas)}` : '',
    low ? `; o menor, ${low.weekday.toLowerCase()}, com ${formatInt(low.agendas)}.` : '.',
    ` Cada célula vale ${unitLabel}.`,
  ].join('');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="mb-2 flex shrink-0 items-center gap-2 text-xs leading-5 text-text-secondary">
        <span aria-hidden className="size-3 shrink-0 rounded-[2px]" style={{ backgroundColor: FILL }} />
        <span className="tabular-nums">{`1 célula = ${unitLabel}`}</span>
        <span className="ml-auto tabular-nums text-text-muted">semana: {formatInt(total)} agendas</span>
      </div>
      <WaffleColumns rows={rows} />
    </div>
  );
}
