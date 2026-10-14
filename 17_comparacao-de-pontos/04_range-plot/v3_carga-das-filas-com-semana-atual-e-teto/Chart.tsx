import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  usePlotArea,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { ChartTooltip, type ChartTooltipProps } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercentFromScale100 } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QueueLoad } from './data';

/**
 * Range plot de carga: uma cápsula por fila com o menor e o maior valor das últimas semanas, em %
 * do teto da própria fila, e um traço forte com a semana atual por cima ou fora dela. O teto de 100%
 * atravessa todas as linhas. Responde "qual fila está acima do que costuma carregar e do teto".
 */
export interface QueueLoadRangePlotProps {
  /** Filas em qualquer ordem: o componente ordena pela carga máxima e desempata pelo nome. */
  readonly data?: readonly QueueLoad[];
  /** Altura da raiz em px, para pai sem altura. O gráfico em si mede ROW_STEP por fila. */
  readonly height?: number;
  readonly className?: string;
}

interface LoadRow extends QueueLoad {
  /** Largura da faixa, maior menos menor: o que a barra empilhada sobre a base invisível desenha. */
  readonly span: number;
}

interface RangeShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: LoadRow;
}

interface NameTickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

const RANGE_FILL = 'var(--chart-1)';
/** Fim mínimo do eixo e passo dos tiques (EIX-9): a semana atual de 172% não achata as outras filas. */
const X_DOMAIN_MIN_END = 150;
const X_TICK_STEP = 50;
const CEILING = 100;
/** Janela da faixa: as últimas 8 semanas fechadas. */
const WEEKS_WINDOW = 8;
const MARGIN = { top: 20, right: 88, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 164;
const X_AXIS_HEIGHT = 26;
/** Passo fixo por linha: 34 px com vão de 30% dá cápsula de 13,6 px, acima do piso de 12 (ESP-2). */
const ROW_STEP = 34;
const BAR_CATEGORY_GAP = '30%';
const BAR_MAX = 16;
/** Traço da semana atual: 2 px de tinta e 1 px de halo de cada lado, mais alto que a cápsula. */
const MARKER_WIDTH = 2;
const MARKER_HALO = 1;
const MARKER_OVERHANG = 4;
const ARROW_LENGTH = 9;
const ARROW_HALF_HEIGHT = 5;
const COLUMN_GAP = 16;
const LOCALE = 'pt-BR';

/** Maior carga máxima primeiro; empate pelo nome para a ordem não mudar a cada recarga. */
function rankByMax(rows: readonly QueueLoad[]): LoadRow[] {
  return rows
    .map((row) => ({ ...row, span: row.max - row.min }))
    .sort((a, b) => b.max - a.max || a.queue.localeCompare(b.queue, LOCALE));
}

/** Onde a semana atual está em relação à faixa e ao teto, em palavras (a dica e a frase usam). */
function situation(row: QueueLoad): string {
  if (row.current > CEILING) return 'acima do teto';
  if (row.current > row.max) return 'acima da faixa, abaixo do teto';
  if (row.current < row.min) return 'abaixo da faixa';
  return 'dentro da faixa';
}

/** Nome no meio da oração: letra minúscula na frente, sem tocar no resto. */
function inSentence(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1);
}

function NameTick({ y, payload }: NameTickProps): ReactElement {
  return (
    <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} x={MARGIN.left} y={Number(y)}>
      {String(payload?.value ?? '')}
    </text>
  );
}

/**
 * Fim do eixo calculado do dado: 150, ou o múltiplo de 50 que cobre a maior faixa. Só a faixa estica o
 * eixo (a semana atual vira seta). O mesmo número vai para o XAxis e para a regra de três dos
 * traços, para o traço cair onde o eixo marca (EIX-9).
 */
function domainEnd(rows: readonly QueueLoad[]): number {
  const top = rows.reduce((best, row) => Math.max(best, row.max, CEILING), 0);
  return Math.max(X_DOMAIN_MIN_END, Math.ceil(top / X_TICK_STEP) * X_TICK_STEP);
}

/** Regra de três do valor em % para o pixel da área de plotagem, travada no fim do eixo. */
function pixelOf(value: number, end: number, area: { readonly x: number; readonly width: number }): number {
  return area.x + (Math.min(value, end) / end) * area.width;
}

/** Traço forte com halo e, quando o valor passa do fim do eixo, a seta de transbordo. */
function CurrentMark({ cx, cy, bar, overflow }: { readonly cx: number; readonly cy: number; readonly bar: number; readonly overflow: boolean }): ReactElement {
  const tall = bar + 2 * MARKER_OVERHANG;
  const halo = MARKER_WIDTH + 2 * MARKER_HALO;
  return (
    <g>
      <rect fill="var(--surface-raised)" height={tall + 2 * MARKER_HALO} width={halo} x={cx - halo / 2} y={cy - tall / 2 - MARKER_HALO} />
      <rect fill="var(--text-primary)" height={tall} width={MARKER_WIDTH} x={cx - MARKER_WIDTH / 2} y={cy - tall / 2} />
      {overflow ? (
        <polygon
          fill="var(--text-primary)"
          points={`${cx + MARKER_WIDTH / 2},${cy - ARROW_HALF_HEIGHT} ${cx + MARKER_WIDTH / 2 + ARROW_LENGTH},${cy} ${cx + MARKER_WIDTH / 2},${cy + ARROW_HALF_HEIGHT}`}
          stroke="var(--surface-raised)"
          strokeWidth={MARKER_HALO}
        />
      ) : null}
    </g>
  );
}

/**
 * Cápsula da faixa mais o traço da semana atual. A barra empilhada só entrega o retângulo da faixa,
 * então o traço sai da regra de três sobre a área de plotagem (e não de x e largura, que quebram
 * quando a faixa tem largura zero).
 */
function RangeShape({ x, y, width, height, payload, end }: RangeShapeProps & { readonly end: number }): ReactElement | null {
  const area = usePlotArea();
  if (x === undefined || y === undefined || width === undefined || height === undefined || payload === undefined || area === undefined) return null;
  const radius = Math.min(height, width) / 2;
  return (
    <g>
      <rect fill={RANGE_FILL} height={height} rx={radius} ry={radius} width={width} x={x} y={y} />
      <CurrentMark bar={height} cx={pixelOf(payload.current, end, area)} cy={y + height / 2} overflow={payload.current > end} />
    </g>
  );
}

/** Rótulo do teto na margem de cima, fora das marcas (REC-4), e a coluna da semana atual à direita. */
function Annotations({ rows, end }: { readonly rows: readonly LoadRow[]; readonly end: number }): ReactElement | null {
  const area = usePlotArea();
  if (area === undefined) return null;
  const columnX = area.x + area.width + COLUMN_GAP;
  const band = area.height / rows.length;
  return (
    <g>
      <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={pixelOf(CEILING, end, area)} y={area.y - 8}>
        {`teto de cada fila, ${formatPercentFromScale100(CEILING, 0)}`}
      </text>
      <text className="font-sans" fill="var(--text-muted)" fontSize={11} x={columnX} y={area.y - 8}>
        semana atual
      </text>
      {rows.map((row, i) => (
        <text
          className="font-display"
          dominantBaseline="central"
          fill={row.current > CEILING ? 'var(--negative)' : 'var(--text-secondary)'}
          fontSize={12}
          fontWeight={row.current > CEILING ? 700 : 500}
          key={row.id}
          x={columnX}
          y={area.y + (i + 0.5) * band}
        >
          {formatPercentFromScale100(row.current, 0)}
        </text>
      ))}
    </g>
  );
}

/** Amostra da legenda na forma exata da marca do gráfico. */
function LegendSample({ kind }: { readonly kind: 'range' | 'current' }): ReactElement {
  const box = 22;
  return (
    <svg aria-hidden className="shrink-0" height={box} width={32}>
      {kind === 'range' ? <rect fill={RANGE_FILL} height={12} rx={6} width={30} x={1} y={5} /> : null}
      {kind === 'current' ? <rect fill="var(--text-primary)" height={20} width={MARKER_WIDTH} x={15} y={1} /> : null}
    </svg>
  );
}

export default function QueueLoadRangePlot({ data = defaultData, height, className }: QueueLoadRangePlotProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = rankByMax(data);
  const first = rows[0];
  const end = domainEnd(rows);
  const ticks = Array.from({ length: end / X_TICK_STEP + 1 }, (_, i) => i * X_TICK_STEP);

  if (!first) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma fila neste recorte: não houve carga medida nas últimas semanas.</span>
      </div>
    );
  }

  const over = rows.filter((row) => row.current > CEILING);
  const worst = over.reduce<LoadRow | null>((best, row) => (best === null || row.current > best.current ? row : best), null);
  const plotHeight = MARGIN.top + MARGIN.bottom + X_AXIS_HEIGHT + rows.length * ROW_STEP;
  const summary = [
    `Gráfico de faixas com a carga semanal de ${formatInt(rows.length)} filas em % do teto, do menor ao maior valor das últimas semanas, com a semana atual marcada.`,
    worst === null
      ? 'Nenhuma fila passa do teto na semana atual.'
      : `${formatInt(over.length)} de ${formatInt(rows.length)} passam do teto; a maior é ${inSentence(worst.queue)}, com ${formatPercentFromScale100(worst.current, 0)}.`,
  ].join(' ');

  const renderTooltip = (props: TooltipContentProps<TooltipValueType, number | string>) => {
    const row = props.payload?.[0]?.payload as LoadRow | undefined;
    if (!row) return null;
    const entries = [
      { dataKey: 'min', name: 'Menor carga', value: formatPercentFromScale100(row.min, 0) },
      { dataKey: 'max', name: 'Maior carga', value: formatPercentFromScale100(row.max, 0) },
      { dataKey: 'current', name: 'Semana atual', value: formatPercentFromScale100(row.current, 0) },
      { dataKey: 'situation', name: 'Situação', value: situation(row) },
      { dataKey: 'weeks', name: 'Semanas medidas', value: `${formatInt(row.weeks)} de ${formatInt(WEEKS_WINDOW)}` },
    ] as unknown as ChartTooltipProps['payload'];
    return <ChartTooltip active={props.active} label={row.queue} labelFormat="text" payload={entries} valueFormat="text" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-1 flex shrink-0 items-center gap-6 text-xs text-text-secondary">
        <span className="flex items-center gap-2">
          <LegendSample kind="range" />
          <span className="tabular-nums">{`Faixa das últimas ${formatInt(WEEKS_WINDOW)} semanas`}</span>
        </span>
        <span className="flex items-center gap-2">
          <LegendSample kind="current" />
          Semana atual
        </span>
      </div>
      <p aria-hidden className="mb-1 shrink-0 text-[0.6875rem] text-text-muted">
        Carga em % do teto de cada fila. Ordenado pela maior carga da faixa, a maior no topo.
      </p>
      <div className="shrink-0" style={{ height: plotHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={rows} layout="vertical" margin={MARGIN}>
            <CartesianGrid horizontal={false} stroke="var(--line-subtle)" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              domain={[0, end]}
              height={X_AXIS_HEIGHT}
              interval={0}
              tickFormatter={(value: number) => formatPercentFromScale100(value, 0)}
              tickLine={false}
              tickMargin={8}
              ticks={ticks}
              type="number"
            />
            {/* O primeiro item do array nasce no alto em BarChart vertical (REC-3), então a maior carga vai primeiro. */}
            <YAxis axisLine={false} dataKey="queue" interval={0} tick={NameTick} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            {/* Sem extendDomain a linha some no recorte em que a carga passa do teto (REC-1). */}
            <ReferenceLine ifOverflow="extendDomain" stroke="var(--text-muted)" strokeDasharray="4 4" x={CEILING} />
            {/* Base invisível: empurra a cápsula até o menor valor sem desenhar nada (REC-8). */}
            <Bar dataKey="min" fill="none" isAnimationActive={false} stackId="range" />
            <Bar dataKey="span" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={(props: RangeShapeProps) => <RangeShape {...props} end={end} />} stackId="range" />
            <Annotations end={end} rows={rows} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
