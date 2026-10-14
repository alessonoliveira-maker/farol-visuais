import type { ReactElement } from 'react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { seriesColor, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact, formatMonthShort, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MediaChannelSpend } from './data';

/**
 * Rosca de composição com o total no centro: até 6 categorias e o valor do todo, sem repetir o
 * total no título do cartão. A ordem das fatias é decrescente a partir das 12 horas.
 */
export interface MediaSpendDonutProps {
  readonly data?: readonly MediaChannelSpend[];
  readonly height?: number;
  readonly className?: string;
}

/** `innerRadius`/`outerRadius` da 06 e da seção "Decisões transversais" da 07: anel nem fino nem pizza. */
const INNER_RADIUS = '62%';
const OUTER_RADIUS = '80%';

interface CenterLabelProps {
  /** `x`/`y` nunca são lidos: existem só para o Label não cair no branch cartesiano da
   * checagem de tipo fraco do Recharts (`ViewBox` é `Cartesian | Polar`, e um tipo só com
   * campos opcionais precisa de ao menos uma propriedade em comum com cada lado da união). */
  readonly viewBox?: { readonly cx?: number; readonly cy?: number; readonly x?: number; readonly y?: number };
}

/** Percentual inteiro que soma 100 pelo maior resto (NUM-2): arredondar cada fatia isolada erra a soma. */
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

export default function MediaSpendDonut({ data = defaultData, height, className }: MediaSpendDonutProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <span>Nenhuma linha neste recorte: não houve investimento de mídia no período.</span>
      </div>
    );
  }

  const rows = [...data].sort((a, b) => b.value - a.value);
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const shares = integerShares(rows.map((row) => row.value));
  const leader = rows[0];

  const summary = [
    `Gráfico de rosca com o investimento de mídia de ${String(rows.length)} canais em 2026-08, somando ${formatCurrencyCompact(total)}.`,
    leader ? `Maior canal: ${leader.label}, com ${formatPercent((shares[0] ?? 0) / 100, 0)} do total.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderCenter = ({ viewBox }: CenterLabelProps): ReactElement | null => {
    if (viewBox?.cx === undefined || viewBox.cy === undefined) return null;
    return (
      <text textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
        <tspan className="font-display" dy="-0.3em" fill="var(--text-primary)" fontSize={14} fontWeight={600} x={viewBox.cx}>
          {formatCurrencyCompact(total)}
        </tspan>
        <tspan className="font-sans" dy="1.5em" fill="var(--text-muted)" fontSize={11} x={viewBox.cx}>
          investido em <tspan className="font-display tabular-nums">{formatMonthShort('2026-08')}</tspan>
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
              data={rows}
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
              {rows.map((row) => (
                <Cell fill={seriesColor(row.colorIndex)} key={row.id} />
              ))}
              {/* Sem `position="center"`: nesta versão do Recharts, "center" força o Label a ler o
              viewBox cartesiano, que o Pie não fornece, e o Label sai nulo. Sem a prop, ele lê o
              viewBox polar (cx, cy) que o Pie já publica via contexto. */}
              <Label content={renderCenter} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5">
        {rows.map((row, index) => (
          <li className="flex items-center gap-2.5 text-xs" key={row.id}>
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: seriesColor(row.colorIndex) }}
            />
            <span className="min-w-0 flex-1 truncate text-text-secondary">{row.label}</span>
            <span className="kpi-number w-16 shrink-0 text-right text-text-primary">{formatCurrencyCompact(row.value)}</span>
            <span className="kpi-number w-10 shrink-0 text-right text-text-muted">{formatPercent((shares[index] ?? 0) / 100, 0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
