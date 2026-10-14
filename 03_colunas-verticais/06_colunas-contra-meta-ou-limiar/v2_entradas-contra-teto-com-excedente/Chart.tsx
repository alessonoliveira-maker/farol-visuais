import type { ReactElement } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';

import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, cap as defaultCap, type WeeklyIntake } from './data';

/** Colunas empilhadas: entrada até o teto num segmento, e o excedente acima do teto noutro. */
export interface IntakeVsCapProps {
  readonly data?: readonly WeeklyIntake[];
  readonly cap?: number;
  readonly height?: number;
  readonly className?: string;
}

/** Card ≈ 574 × 234 px de corpo. Eixo de valor 34 px, margem 16/8; disponível ≈ 522 px para 10 semanas. */
const MARGIN = { top: 24, right: 8, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 34;
const BAR_CATEGORY_GAP = '34%';
/** ESP-6: passo ≈ 522 / 10 ≈ 52,2; espessura ≈ 52,2 × (1 − 2 × 0,34) ≈ 16,7 px. */
const BAR_MAX = 17;
const VALUE_LABEL_GAP = 8;

interface Row extends WeeklyIntake {
  readonly within: number;
  readonly over: number;
  readonly overLabel: string;
}

/**
 * O `content` de um `LabelList` não recebe `payload` nem um `index` alinhado a `rows`: o Recharts
 * 3.10 filtra as props do item pelo conjunto de atributos SVG válidos antes de repassar
 * (`svgPropertiesAndEvents`), que descarta `payload`, e a série empilhada só inclui no contexto
 * do `LabelList` as semanas em que o segmento realmente existe, então `index` conta só essas,
 * não a lista inteira (medido no preview: um único "+3" aparecia, com o valor de uma semana e a
 * posição de outra). A saída é um `dataKey` próprio do rótulo (`overLabel`, calculado em
 * `withSplit`): o Recharts lê esse campo do `payload` da própria linha por trás do valor
 * (`getValueByDataKey`), então o texto chega sempre certo para aquele retângulo, sem precisar de
 * índice nem de payload no `content`.
 */
interface OverLabelProps {
  readonly x?: number | string;
  readonly y?: number | string;
  readonly width?: number | string;
  readonly value?: unknown;
}

function withSplit(rows: readonly WeeklyIntake[], cap: number): readonly Row[] {
  return rows.map((row) => {
    const over = Math.max(0, row.intake - cap);
    return { ...row, within: Math.min(row.intake, cap), over, overLabel: over > 0 ? `+${String(over)}` : '' };
  });
}

/** Domínio arredondado para cima em passo de 20, para a grade sair em números redondos (EIX-4). */
function niceCeiling(max: number, step: number): number {
  return Math.ceil(max / step) * step;
}

export default function IntakeVsCap({ data = defaultData, cap = defaultCap, height, className }: IntakeVsCapProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = withSplit(data, cap);
  const overCount = rows.filter((row) => row.over > 0).length;
  const ceiling = niceCeiling(Math.max(cap, ...rows.map((row) => row.intake)), 20);
  const ticks = [0, ceiling / 4, ceiling / 2, (ceiling * 3) / 4, ceiling];

  const summary = [
    `Gráfico de colunas empilhadas com a entrada semanal de oportunidades em ${String(rows.length)} semanas contra o teto de capacidade de ${formatInt(cap)}.`,
    `${String(overCount)} de ${String(rows.length)} semanas estouraram o teto.`,
  ].join(' ');

  const renderOverLabel = ({ x, y, width, value }: OverLabelProps): ReactElement | null => {
    const label = typeof value === 'string' ? value : '';
    if (!label) return null;
    return (
      <text className="font-display" fill="var(--text-primary)" fontSize={12} fontWeight={600} textAnchor="middle" x={Number(x) + Number(width) / 2} y={Number(y) - VALUE_LABEL_GAP}>
        {label}
      </text>
    );
  };

  const renderTooltip = (props: TooltipContentProps): ReactElement | null => {
    if (!props.active || !props.payload) return null;
    const weekKey = typeof props.label === 'string' ? props.label : '';
    const row = rows.find((item) => item.week === weekKey);
    if (!row) return null;
    const withinEntry = props.payload.find((entry) => entry.dataKey === 'within');
    const overEntry = props.payload.find((entry) => entry.dataKey === 'over');
    const payload = [
      ...(withinEntry ? [{ ...withinEntry, name: 'Entradas', value: row.intake, color: 'var(--chart-1)' }] : []),
      ...(overEntry && row.over > 0 ? [{ ...overEntry, name: 'Acima do teto', value: row.over, color: 'var(--negative)' }] : []),
    ];
    return <ChartTooltip active={props.active} label={weekKey} payload={payload} valueFormat="int" />;
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-secondary">
        <span className="kpi-number font-medium text-text-primary">{formatInt(overCount)}</span> de{' '}
        <span className="tabular-nums">{formatInt(rows.length)}</span> semanas acima do teto de{' '}
        <span className="kpi-number font-medium text-text-primary">{formatInt(cap)}</span>
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap={BAR_CATEGORY_GAP} data={[...rows]} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="week" tickMargin={8} />
            <YAxis {...AXIS_PROPS} allowDecimals={false} axisLine={false} domain={[0, ceiling]} tickFormatter={formatInt} ticks={ticks} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--line-subtle)' }} isAnimationActive={false} />
            <Bar dataKey="within" fill="var(--chart-1)" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 0, 0, 0]} stackId="a" />
            <Bar dataKey="over" fill="var(--negative)" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[3, 3, 0, 0]} stackId="a">
              <LabelList content={renderOverLabel} dataKey="overLabel" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
