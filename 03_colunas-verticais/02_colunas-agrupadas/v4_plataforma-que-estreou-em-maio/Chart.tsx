import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis, type LabelProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, CHART_SERIES_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, debutMonth as defaultDebutMonth, type MonthlyLeadsTwoPlatforms } from './data';

/**
 * Colunas agrupadas: leads mensais de duas plataformas, uma delas com estreia no meio da janela.
 * Os meses antes da estreia não desenham coluna (null), e o zero medido depois da estreia
 * continua desenhado e escrito, para as duas ausências nunca se confundirem.
 */
export interface LeadsWithDebutProps {
  /** Um mês por linha. A ordem de entrada não importa: o componente ordena. */
  readonly data?: readonly MonthlyLeadsTwoPlatforms[];
  /** Mês (YYYY-MM) em que a plataforma nova estreou. */
  readonly debutMonth?: string;
  /** Altura em px quando o pai não tem altura definida (no corpo de um VisualCard, por exemplo). */
  readonly height?: number;
  readonly className?: string;
}

const ESTABLISHED_FILL = CHART_SERIES_COLORS[0];
const NEWCOMER_FILL = CHART_SERIES_COLORS[2];
const MARGIN = { top: 8, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 36;
/** Duas séries na banda: vão explícito entre as duas colunas (ESP-6). */
const BAR_GAP = 2;
const BAR_CATEGORY_GAP = '30%';
/**
 * Passo pela ESP-6: corpo do cartão ~= 574 x 234 px; disponível ~= 574 − 36 (eixo de contagem) −
 * 8 (margem) = 530 px para 6 meses, passo ~= 88,3 px. Com BAR_GAP de 2 px e BAR_CATEGORY_GAP no
 * piso de 30%: espessura = (88,3 × 0,40 − 2) / 2 ~= 16,7 px, acima do piso de 12 px da ESP-2. A
 * espessura das duas séries não muda nos meses em que a recém-chegada ainda não existe: o
 * maxBarSize é o mesmo dos dois Bar, então a coluna estabelecida nunca engorda para preencher o
 * vão. Conferido no preview.svg, não só na constante declarada.
 */
const BAR_MAX = 16;
const BAR_RADIUS: [number, number, number, number] = [3, 3, 0, 0];
const GRID_TICKS = 4;
/** Altura visível do traço de zero medido: menor que uma coluna, maior que sumir (EST-3). */
const ZERO_MARK_HEIGHT = 2;

interface BarShapeProps {
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly payload?: MonthlyLeadsTwoPlatforms;
}

function byMonth(a: MonthlyLeadsTwoPlatforms, b: MonthlyLeadsTwoPlatforms): number {
  return a.month.localeCompare(b.month);
}

export default function LeadsWithDebut({
  data = defaultData,
  debutMonth = defaultDebutMonth,
  height,
  className,
}: LeadsWithDebutProps) {
  const animate = useAnimateOnce();
  const rows = [...data].sort(byMonth);
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum mês neste recorte: nenhuma plataforma trouxe lead no período.</span>
      </div>
    );
  }

  const beforeDebut = rows.filter((row) => row.newcomer === null).length;
  const zeroAfterDebut = rows.filter((row) => row.newcomer === 0).length;

  const summary = [
    `Gráfico de colunas agrupadas com leads de duas plataformas em ${String(rows.length)} meses.`,
    `Vídeo online estreou em ${formatMonthShort(debutMonth)}, sem operar nos ${String(beforeDebut)} meses antes.`,
    zeroAfterDebut > 0 ? `Depois disso, ${String(zeroAfterDebut)} mês com zero leads medidos, diferente de sem operação.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderZeroLabel = ({ x, y, width, value, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row || value !== 0) return null;
    return (
      <text className="font-display" fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={Number(x) + Number(width) / 2} y={Number(y) - 6}>
        0
      </text>
    );
  };

  /**
   * Forma própria da coluna nova: o Recharts descarta cedo qualquer retângulo de altura zero
   * (comentário "Filter out 0-dimension rectangles" em cartesian/Bar.js), então sem esta forma o
   * mês de zero medido não chegava a desenhar nem a alimentar a LabelList acima. `shape` marca a
   * série como forma customizada e o retângulo de zero passa a existir; o mês anterior à estreia
   * segue null e nunca entra na lista de retângulos, com ou sem forma própria.
   */
  const renderNewcomerBar = ({ x = 0, y = 0, width = 0, height: barHeight = 0, payload }: BarShapeProps): ReactElement | null => {
    if (!payload || payload.newcomer === null) return null;
    if (payload.newcomer === 0) {
      return <Rectangle fill={NEWCOMER_FILL} height={ZERO_MARK_HEIGHT} radius={1} width={width} x={x} y={y + barHeight - ZERO_MARK_HEIGHT} />;
    }
    return <Rectangle fill={NEWCOMER_FILL} height={barHeight} radius={BAR_RADIUS} width={width} x={x} y={y} />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <ul aria-hidden className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
        <li className="flex items-center gap-2.5">
          <span className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: ESTABLISHED_FILL }} />
          Rede social
        </li>
        <li className="flex items-center gap-2.5">
          <span className="size-3 shrink-0 rounded-[3px]" style={{ backgroundColor: NEWCOMER_FILL }} />
          Vídeo online
        </li>
        <li className="text-text-muted">Vídeo online entra em {formatMonthShort(debutMonth)}</li>
      </ul>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} barGap={BAR_GAP} data={rows} margin={MARGIN}>
            <CartesianGrid stroke="var(--line-subtle)" vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="month"
              interval={0}
              tickFormatter={(value: string) => formatMonthShort(value)}
              tickLine={false}
            />
            <YAxis
              {...AXIS_PROPS}
              allowDecimals={false}
              axisLine={false}
              tickCount={GRID_TICKS}
              tickFormatter={(value: number) => formatInt(value)}
              tickLine={false}
              width={VALUE_AXIS_WIDTH}
            />
            <Tooltip content={<ChartTooltip valueFormat="int" />} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="established" fill={ESTABLISHED_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Rede social" radius={BAR_RADIUS} />
            <Bar dataKey="newcomer" fill={NEWCOMER_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX} name="Vídeo online" shape={renderNewcomerBar}>
              <LabelList content={renderZeroLabel} dataKey="newcomer" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
