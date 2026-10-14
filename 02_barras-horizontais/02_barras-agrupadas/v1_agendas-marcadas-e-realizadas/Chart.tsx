import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, Rectangle, ResponsiveContainer, XAxis, YAxis, type BarShapeProps, type LabelProps } from 'recharts';

import { CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ChannelMeetings } from './data';

/**
 * Barras agrupadas: agendas marcadas e agendas realizadas lado a lado em cada canal de entrada,
 * ordenadas pelas marcadas, que são a série principal. Cor fixa por série, legenda no topo na ordem
 * das barras, valor escrito na ponta de cada uma e uma linha de leitura com o canal que menos realiza.
 */
export interface MeetingsByChannelProps {
  /** Um canal por linha. A ordem de entrada não importa: o componente ordena pelas marcadas. */
  readonly data?: readonly ChannelMeetings[];
  /** Altura em px quando o pai não tem altura definida (no corpo de um VisualCard, por exemplo). */
  readonly height?: number;
  readonly className?: string;
}

type SeriesKey = 'scheduled' | 'held';

interface SeriesSpec {
  readonly key: SeriesKey;
  readonly label: string;
  readonly fill: string;
}

/**
 * Cor fixa por série na ordem de slots do CONTRATO (COR-8): a série principal fica com o slot 1 e a
 * segunda com o slot 3. A ordem desta lista é a ordem das barras no grupo e a ordem da legenda.
 */
const SERIES: readonly SeriesSpec[] = [
  { key: 'scheduled', label: 'Marcadas', fill: CHART_SERIES_COLORS[0] },
  { key: 'held', label: 'Realizadas', fill: CHART_SERIES_COLORS[2] },
];
const MARGIN = { top: 0, right: 36, bottom: 2, left: 0 } as const;
const NAME_AXIS_WIDTH = 152;
const VALUE_LABEL_GAP = 6;
/** Vão dentro do grupo, em px, e vão entre grupos: o grupo se lê junto e os canais se separam. */
const BAR_GAP = 2;
const BAR_CATEGORY_GAP = '30%';
const BAR_MAX = 14;
/**
 * Passo por categoria pela ESP-6, com a conta invertida para a espessura virar promessa e não teto:
 * (BAR_MAX × 2 séries + BAR_GAP × 1 emenda) / (1 − 2 × 0,30) = 75 px, arredondado para 76 (ESP-1).
 * O corpo do gráfico pede ROW_STEP × número de canais; em menos que isso o Recharts afinaria a marca
 * abaixo do BAR_MAX declarado, que foi o defeito medido em 2026-09-18 (marca de 5 px no canvas card).
 * Com os 14 px entregues, as âncoras dos dois rótulos do par ficam a 14 + BAR_GAP = 16 px, o piso da
 * ROT-2.
 */
const ROW_STEP = 76;
const BAR_RADIUS: [number, number, number, number] = [0, 3, 3, 0];

interface NameTickProps {
  readonly y?: number | string;
  readonly index?: number;
  readonly payload?: { readonly value?: unknown };
}

function byScheduled(a: ChannelMeetings, b: ChannelMeetings): number {
  return b.scheduled - a.scheduled || a.channel.localeCompare(b.channel, 'pt-BR');
}

/** O canal com a menor taxa de realização; no empate, o que marcou mais, porque perde mais reuniões. */
function lowestShowRate(rows: readonly ChannelMeetings[]): ChannelMeetings | undefined {
  let worst: ChannelMeetings | undefined;
  for (const row of rows) {
    if (row.scheduled <= 0) continue;
    if (!worst) {
      worst = row;
      continue;
    }
    const rate = row.held / row.scheduled;
    const worstRate = worst.held / worst.scheduled;
    if (rate < worstRate || (rate === worstRate && row.scheduled > worst.scheduled)) worst = row;
  }
  return worst;
}

/** Forma própria da barra: com `shape`, o Recharts mantém a barra de zero e o rótulo escreve 0. */
function renderBar(props: BarShapeProps): ReactElement {
  return <Rectangle fill={props.fill} height={props.height} radius={BAR_RADIUS} width={props.width} x={props.x} y={props.y} />;
}

function renderValue({ x, y, width, height: barHeight, value }: LabelProps): ReactElement | null {
  if (typeof value !== 'number') return null;
  return (
    <text
      className="font-display"
      dominantBaseline="central"
      fill="var(--text-secondary)"
      fontSize={12}
      fontWeight={500}
      x={Number(x) + Number(width) + VALUE_LABEL_GAP}
      y={Number(y) + Number(barHeight) / 2}
    >
      {formatInt(value)}
    </text>
  );
}

export default function MeetingsByChannel({ data = defaultData, height, className }: MeetingsByChannelProps) {
  const animate = useAnimateOnce();
  const rows = [...data].sort(byScheduled);
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum canal neste recorte: a pré-vendas não marcou agenda no período.</span>
      </div>
    );
  }

  const worst = lowestShowRate(rows);
  const totalScheduled = rows.reduce((sum, row) => sum + row.scheduled, 0);
  const totalHeld = rows.reduce((sum, row) => sum + row.held, 0);

  const summary = [
    `Gráfico de barras agrupadas: agendas marcadas e realizadas em ${String(rows.length)} canais de entrada, ordenados pelas marcadas.`,
    worst ? `Menor realização em ${worst.channel}, ${formatRateWithVolume(worst.held, worst.scheduled)}.` : '',
    `No conjunto, ${formatRateWithVolume(totalHeld, totalScheduled)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderName = ({ y, index = -1 }: NameTickProps): ReactElement => {
    const row = rows[index];
    const isWorst = row !== undefined && row.id === worst?.id;
    return (
      <text
        className="font-sans"
        dominantBaseline="central"
        fill={isWorst ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={isWorst ? 600 : 500}
        x={MARGIN.left}
        y={Number(y)}
      >
        {row?.channel ?? ''}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs leading-4">
        {worst ? (
          <p aria-hidden className="min-w-0 truncate text-text-secondary">
            Menor realização: <span className="font-semibold text-text-primary">{worst.channel}</span>,{' '}
            <span className="kpi-number font-medium text-text-primary">{formatPercent(worst.held / worst.scheduled)}</span> (
            <span className="tabular-nums">{formatInt(worst.held)}</span> de <span className="tabular-nums">{formatInt(worst.scheduled)}</span> agendas)
          </p>
        ) : null}
        <ul aria-hidden className="flex shrink-0 items-center gap-4 text-text-secondary">
          {SERIES.map((series) => (
            <li className="flex items-center gap-2.5" key={series.key}>
              <span className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: series.fill }} />
              {series.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="min-h-0 flex-1" style={{ minHeight: rows.length * ROW_STEP }}>
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
                fill={series.fill}
                isAnimationActive={animate}
                key={series.key}
                maxBarSize={BAR_MAX}
                name={series.label}
                shape={renderBar}
              >
                <LabelList content={renderValue} dataKey={series.key} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
