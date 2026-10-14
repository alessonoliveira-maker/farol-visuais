import type { ReactElement } from 'react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { CHART_SEQUENTIAL_COLORS, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type PipelineStageValue } from './data';

/**
 * Rosca de composição em ordem de etapa (não de valor), com o total em duas linhas no centro:
 * valor compacto e contagem de oportunidades. Cor sequencial porque a etapa é ordenada.
 */
export interface PipelineDonutProps {
  readonly data?: readonly PipelineStageValue[];
  readonly height?: number;
  readonly className?: string;
}

const INNER_RADIUS = '62%';
const OUTER_RADIUS = '80%';
/** Etapa ordenada usa a rampa sequencial, do 4 ao 7 para não repetir os tons frios do início da escala. */
const STAGE_COLORS = CHART_SEQUENTIAL_COLORS.slice(3);

interface CenterLabelProps {
  /** `x`/`y` nunca são lidos: existem só para o Label não cair no branch cartesiano da
   * checagem de tipo fraco do Recharts (`ViewBox` é `Cartesian | Polar`, e um tipo só com
   * campos opcionais precisa de ao menos uma propriedade em comum com cada lado da união). */
  readonly viewBox?: { readonly cx?: number; readonly cy?: number; readonly x?: number; readonly y?: number };
}

/** Percentual inteiro que soma 100 pelo maior resto (NUM-2). */
function integerShares(values: readonly number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((value) => (value / total) * 100);
  const floors = raw.map((share) => Math.floor(share));
  let remainder = 100 - floors.reduce((sum, share) => sum + share, 0);
  const order = raw
    .map((share, index) => ({ index, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction);
  const result = [...floors];
  for (const { index } of order) {
    if (remainder <= 0) break;
    result[index] = (result[index] ?? 0) + 1;
    remainder -= 1;
  }
  return result;
}

export default function PipelineDonut({ data = defaultData, height, className }: PipelineDonutProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <span>Nenhuma linha neste recorte: não há oportunidade aberta no período.</span>
      </div>
    );
  }

  const totalValue = data.reduce((sum, row) => sum + row.value, 0);
  const totalDeals = data.reduce((sum, row) => sum + row.deals, 0);
  const shares = integerShares(data.map((row) => row.value));
  const biggest = [...data].sort((a, b) => b.value - a.value)[0];

  const summary = [
    `Gráfico de rosca com a carteira aberta em ${String(data.length)} etapas do funil, somando ${formatCurrencyCompact(totalValue)} em ${formatInt(totalDeals)} oportunidades.`,
    biggest ? `A maior parte está em ${biggest.label}.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderCenter = ({ viewBox }: CenterLabelProps): ReactElement | null => {
    if (viewBox?.cx === undefined || viewBox.cy === undefined) return null;
    return (
      <text textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
        <tspan className="font-display" dy="-0.4em" fill="var(--text-primary)" fontSize={14} fontWeight={600} x={viewBox.cx}>
          {formatCurrencyCompact(totalValue)}
        </tspan>
        <tspan className="font-sans" dy="1.5em" fill="var(--text-muted)" fontSize={11} x={viewBox.cx}>
          {formatInt(totalDeals)} oportunidades
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 items-center gap-6', className)} role="img" style={style}>
      <div className="aspect-square h-full max-h-full shrink-0">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer={false} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              cx="50%"
              cy="50%"
              data={data}
              dataKey="value"
              endAngle={-270}
              innerRadius={INNER_RADIUS}
              isAnimationActive={animate}
              nameKey="label"
              outerRadius={OUTER_RADIUS}
              startAngle={90}
              stroke="var(--surface-raised)"
              strokeWidth={2}
            >
              {data.map((row, index) => (
                <Cell fill={STAGE_COLORS[index % STAGE_COLORS.length] ?? 'var(--seq-4)'} key={row.id} />
              ))}
              {/* Sem `position="center"` (ver v1 da 01_rosca-com-total-central): quebraria o Label. */}
              <Label content={renderCenter} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5">
        {data.map((row, index) => (
          <li className="flex items-center gap-2.5 text-xs" key={row.id}>
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: STAGE_COLORS[index % STAGE_COLORS.length] ?? 'var(--seq-4)' }}
            />
            <span className="min-w-0 flex-1 truncate text-text-secondary">{row.label}</span>
            <span className="kpi-number w-16 shrink-0 text-right text-text-primary">{formatCurrencyCompact(row.value)}</span>
            <span className="kpi-number w-8 shrink-0 text-right text-text-secondary">{formatInt(row.deals)}</span>
            <span className="kpi-number w-10 shrink-0 text-right text-text-muted">{formatPercent((shares[index] ?? 0) / 100, 0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
