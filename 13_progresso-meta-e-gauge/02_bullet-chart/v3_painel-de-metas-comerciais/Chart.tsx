import { TriangleAlert } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, LabelList, ReferenceArea, ReferenceLine, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatValue, type ValueFormat } from '@/components/visuals/valueFormat';
import { cn } from '@/lib/utils';
import { data as defaultData, type CommercialGoalsPanel, type MetricUnit } from './data';

/**
 * Painel de bullets alinhados: uma linha por métrica, todas normalizadas em percentual da
 * própria meta para compartilharem a mesma escala, com faixas comuns atravessando o painel
 * inteiro e o valor absoluto de cada métrica escrito na unidade original ao fim da linha.
 */
export interface CommercialGoalsPanelChartProps {
  readonly data?: CommercialGoalsPanel;
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 20, right: 92, bottom: 8, left: 0 } as const;
const NAME_AXIS_WIDTH = 176;
/** Cinco linhas no canvas card (corpo de ~234 px): passo de 46,8 px, gap de 34% dá 15,5 px de barra. */
const BAR_SIZE = 16;
const VALUE_LABEL_GAP = 6;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;
const UNIT_FORMAT: Record<MetricUnit, ValueFormat> = { currency: 'currencyCompact', count: 'int', rate: 'percent' };

interface AreaViewBox {
  readonly viewBox?: { readonly x?: number; readonly y?: number; readonly width?: number };
}

interface NameTickProps {
  readonly y?: number | string;
  readonly index?: number;
}

export default function CommercialGoalsPanelChart({ data = defaultData, height, className }: CommercialGoalsPanelChartProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const rows = data.metrics.map((metric) => ({ ...metric, percent: (metric.value / metric.target) * 100 }));
  const domainMax = Math.max(130, ...rows.map((row) => row.percent)) * 1.02;
  const belowCount = rows.filter((row) => row.percent < data.acceptableFrom).length;

  const summary = [
    `Painel de bullet chart com ${String(rows.length)} metas comerciais do trimestre, cada uma em percentual da própria meta.`,
    `Faixa aceitável entre ${String(data.acceptableFrom)}% e ${String(data.acceptableTo)}% da meta.`,
    belowCount > 0
      ? `${String(belowCount)} ${belowCount === 1 ? 'meta está' : 'metas estão'} abaixo dela, entre elas ${rows.find((row) => row.percent < data.acceptableFrom)?.label ?? ''}.`
      : 'Nenhuma meta está abaixo dela.',
  ].join(' ');

  const renderBandLabel = (name: string) => ({ viewBox }: AreaViewBox): ReactElement => (
    <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={(viewBox?.x ?? 0) + (viewBox?.width ?? 0) / 2} y={(viewBox?.y ?? 0) - 6}>
      {name}
    </text>
  );

  const renderName = ({ y, index = -1 }: NameTickProps): ReactElement => {
    const row = rows[index];
    const below = row !== undefined && row.percent < data.acceptableFrom;
    return (
      <g transform={`translate(0, ${String(Number(y))})`}>
        {below ? <TriangleAlert aria-hidden className="text-negative" height={12} width={12} x={0} y={-6} /> : null}
        <text
          className="font-sans"
          dominantBaseline="central"
          fill={below ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontSize={12}
          fontWeight={below ? 700 : 500}
          x={below ? 16 : 0}
        >
          {row?.label ?? ''}
        </text>
      </g>
    );
  };

  const renderValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill="var(--text-primary)"
        fontSize={12}
        fontWeight={500}
        style={HALO}
        x={Number(x) + Number(width) + VALUE_LABEL_GAP}
        y={Number(y) + Number(barHeight) / 2}
      >
        {formatValue(row.value, UNIT_FORMAT[row.unit])}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart accessibilityLayer={false} barCategoryGap="34%" data={rows} layout="vertical" margin={MARGIN}>
          <XAxis domain={[0, domainMax]} hide type="number" />
          <YAxis axisLine={false} dataKey="label" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_AXIS_WIDTH} />
          <ReferenceArea
            fill="var(--surface-sunken)"
            fillOpacity={0.45}
            key="abaixo"
            label={renderBandLabel('Abaixo')}
            stroke="none"
            x1={0}
            x2={data.acceptableFrom}
          />
          <ReferenceArea
            fill="var(--surface-sunken)"
            fillOpacity={0.72}
            key="aceitavel"
            label={renderBandLabel('Aceitável')}
            stroke="none"
            x1={data.acceptableFrom}
            x2={data.acceptableTo}
          />
          <ReferenceArea
            fill="var(--surface-sunken)"
            fillOpacity={1}
            ifOverflow="extendDomain"
            key="acima"
            label={renderBandLabel('Acima')}
            stroke="none"
            x1={data.acceptableTo}
            x2={domainMax}
          />
          <Bar dataKey="percent" fill="var(--chart-1)" isAnimationActive={animate} maxBarSize={BAR_SIZE} radius={[0, 3, 3, 0]}>
            <LabelList content={renderValue} dataKey="percent" />
          </Bar>
          <ReferenceLine stroke="var(--text-primary)" strokeWidth={2} x={100} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
