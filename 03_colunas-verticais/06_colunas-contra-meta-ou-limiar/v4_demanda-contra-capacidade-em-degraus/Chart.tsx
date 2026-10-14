import type { ReactElement } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyDemand } from './data';

/** Colunas de demanda projetada, dentro e acima da capacidade, com a capacidade em degraus por cima. */
export interface DemandVsCapacityProps {
  readonly data?: readonly MonthlyDemand[];
  readonly height?: number;
  readonly className?: string;
}

/** Largo ≈ 960 × 400 px, corpo estimado ≈ 894 × 274 px de corpo. Eixo de valor 40 px, margem 12/24. */
const MARGIN = { top: 24, right: 12, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 40;
const BAR_CATEGORY_GAP = '30%';
/** ESP-6: passo ≈ 842 / 12 ≈ 70,2; espessura ≈ 70,2 × (1 − 2 × 0,30) ≈ 28,1 px. */
const BAR_MAX = 28;
const VALUE_LABEL_GAP = 8;
const TICK_COUNT = 4;
/** Domínio aproximado do que 2 px representam nesta geometria, para a nota de altura ampliada na dica. */
const TINY_EXCESS_THRESHOLD = 6;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface Row extends MonthlyDemand {
  readonly within: number;
  readonly over: number;
  readonly overLabel: string;
}

/**
 * O `content` de um `LabelList` não recebe `payload` nem um `index` alinhado a `rows`: o Recharts
 * 3.10 filtra as props do item pelo conjunto de atributos SVG válidos antes de repassar
 * (`svgPropertiesAndEvents`), que descarta `payload`, e a série empilhada só inclui no contexto
 * do `LabelList` os meses em que o segmento realmente existe, então `index` conta só esses, não a
 * lista inteira (medido no preview: nenhum "+N" nem "sem capacidade" chegava a aparecer, ou
 * aparecia com o texto de um mês na posição de outro). A saída é um `dataKey` próprio do rótulo
 * (`overLabel`, calculado em `withSplit`): o Recharts lê esse campo do `payload` da própria linha
 * por trás do valor (`getValueByDataKey`), então o texto certo chega para aquele retângulo, sem
 * precisar de índice nem de payload no `content`.
 */
interface OverLabelProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly width?: number | string;
  readonly value?: unknown;
}

function withSplit(rows: readonly MonthlyDemand[]): readonly Row[] {
  return rows.map((row) => {
    const over = Math.max(0, row.demand - row.capacity);
    const overLabel = over <= 0 ? '' : row.capacity === 0 ? 'sem capacidade' : `+${String(over)}`;
    return { ...row, within: Math.min(row.demand, row.capacity), over, overLabel };
  });
}

function niceCeiling(max: number, step: number): number {
  return Math.ceil(max / step) * step;
}

export default function DemandVsCapacity({ data = defaultData, height, className }: DemandVsCapacityProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = withSplit(data);
  const ceiling = niceCeiling(Math.max(...rows.map((row) => Math.max(row.demand, row.capacity))), 100);
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (ceiling / TICK_COUNT) * i);

  const noCapacity = rows.filter((row) => row.capacity === 0);
  const overCapacity = rows.filter((row) => row.capacity > 0 && row.over > 0);

  const summary = [
    `Gráfico de colunas com a demanda projetada de oportunidades em ${String(rows.length)} meses de 2027, contra a capacidade medida em degraus.`,
    `${String(overCapacity.length)} de ${String(rows.length - noCapacity.length)} meses com capacidade instalada passaram do teto.`,
    noCapacity.length > 0 ? `${noCapacity.map((row) => formatMonthShort(row.month)).join(', ')} sem capacidade instalada.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * O Recharts, numa série empilhada, chama `minPointSize` com `value[1]` do par `[base, topo]`
   * que o `stackId` monta para aquele retângulo (`computeBarRectangles`, `BarUtils.js`), não com
   * o valor da própria série `over`: para o segmento de cima da pilha isso é o topo acumulado
   * (`within + over`), positivo em todo mês com demanda, inclusive nos que não passam do teto.
   * Filtrar por `value > 0` como antes media esse topo e não o excedente, então fev, mai, jul,
   * set e nov, todos com `over = 0`, recebiam a mesma tampa de 2 px de um excedente real como o
   * de jun (+1), tornando teto e excedente mínimo indistinguíveis (medido no preview: 10 das 12
   * colunas com vermelho no topo, contra os 5 meses que a linha de leitura conta). A correção
   * lê o `over` do próprio `row` pelo `index`, que no Recharts é a posição em `displayedData` e
   * aqui é a mesma de `rows`, e só aplica a tampa quando o excedente em si é maior que zero.
   */
  const minPointSizeForOver = (_value: number | null | undefined, index: number): number => (rows[index] !== undefined && rows[index].over > 0 ? 2 : 0);

  const renderOverLabel = ({ x, y, width, value }: OverLabelProps): ReactElement | null => {
    const label = typeof value === 'string' ? value : '';
    if (!label) return null;
    const noCapacity = label === 'sem capacidade';
    return (
      <text className="font-display" fill="var(--text-primary)" fontSize={noCapacity ? 11 : 12} fontWeight={600} style={HALO} textAnchor="middle" x={Number(x) + Number(width) / 2} y={Number(y) - VALUE_LABEL_GAP}>
        {label}
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    if (!props.active || !props.payload) return null;
    const monthKey = typeof props.label === 'string' ? props.label : '';
    const row = rows.find((item) => item.month === monthKey);
    if (!row) return null;
    const tiny = row.over > 0 && row.over < TINY_EXCESS_THRESHOLD;
    const withinEntry = props.payload.find((entry) => entry.dataKey === 'within');
    const capacityEntry = props.payload.find((entry) => entry.dataKey === 'capacity');
    const overEntry = props.payload.find((entry) => entry.dataKey === 'over');
    const payload = [
      ...(withinEntry ? [{ ...withinEntry, name: 'Demanda', value: row.demand, color: 'var(--chart-1)' }] : []),
      ...(capacityEntry ? [{ ...capacityEntry, name: 'Capacidade', value: row.capacity, color: 'var(--text-muted)' }] : []),
      ...(overEntry && row.over > 0
        ? [{ ...overEntry, name: tiny ? 'Excedente (altura ampliada para leitura)' : 'Excedente', value: row.over, color: 'var(--negative)' }]
        : []),
    ];
    return <ChartTooltip active={props.active} label={monthKey} labelFormat="month" payload={payload} valueFormat="int" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <div aria-hidden className="mb-2 flex shrink-0 items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-3" style={{ backgroundColor: 'var(--text-muted)' }} />
          capacidade medida
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[2px] bg-chart-1" />
          demanda projetada
        </span>
        <span className="ml-auto">
          <span className="kpi-number font-medium text-text-primary">{formatInt(overCapacity.length)}</span> meses acima do teto
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="month" tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, ceiling]} tickFormatter={formatInt} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="within" fill="var(--chart-1)" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 0, 0, 0]} stackId="a" />
            <Bar dataKey="over" fill="var(--negative)" isAnimationActive={animate} maxBarSize={BAR_MAX} minPointSize={minPointSizeForOver} radius={[3, 3, 0, 0]} stackId="a">
              <LabelList content={renderOverLabel} dataKey="overLabel" />
            </Bar>
            <Line dataKey="capacity" dot={{ r: 3, fill: 'var(--text-muted)', strokeWidth: 0 }} isAnimationActive={animate} stroke="var(--text-muted)" strokeWidth={2} type="stepAfter" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
