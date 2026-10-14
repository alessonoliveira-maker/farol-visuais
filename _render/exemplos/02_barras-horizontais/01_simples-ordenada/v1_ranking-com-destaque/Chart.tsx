import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis, type LabelProps } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, highlightId as defaultHighlightId, type ExecutiveRevenue } from './data';

/**
 * Ranking em barras horizontais, do maior para o menor: uma barra acesa na cor de destaque, as
 * demais em neutro, o valor escrito na ponta de cada uma e a média do time como linha de
 * referência. Uma linha de leitura calculada do dado diz a posição e a distância para o líder.
 */
export interface RankingBarsProps {
  /** Linhas do ranking. A ordem de entrada não importa: o componente ordena. */
  readonly data?: readonly ExecutiveRevenue[];
  /** Id da barra em destaque; as demais ficam em neutro. */
  readonly highlightId?: string;
  /** Altura em px quando o pai não tem altura definida (no corpo de um VisualCard, por exemplo). */
  readonly height?: number;
  readonly className?: string;
}

/** Destaque: a única cor do visual. */
const HIGHLIGHT_FILL = 'var(--chart-1)';
/** Neutro de dado: recua, e só é permitido porque o valor está escrito na ponta de cada barra. */
const NEUTRAL_FILL = 'var(--line-strong)';
const REFERENCE_STROKE = 'var(--text-muted)';
const MARGIN = { top: 18, right: 84, bottom: 0, left: 0 } as const;
const NAME_AXIS_WIDTH = 100;
const RANK_WIDTH = 20;
const VALUE_LABEL_GAP = 6;
const BAR_MAX = 16;
/** Abaixo das barras (300) e acima da grade: a média fica atrás da marca e o rótulo de valor (2000) segue por cima. */
const REFERENCE_Z = 250;
/** Halo na cor do cartão: o rótulo continua legível quando a linha de referência passa atrás dele. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface NameTickProps {
  readonly y?: number | string;
  readonly index?: number;
  readonly payload?: { readonly value?: unknown };
}

interface ReferenceLabelProps {
  readonly viewBox?: { readonly x?: number; readonly y?: number };
}

export default function RankingBars({
  data = defaultData,
  highlightId = defaultHighlightId,
  height,
  className,
}: RankingBarsProps) {
  const animate = useAnimateOnce();
  const rows = [...data].sort((a, b) => b.revenue - a.revenue);
  const style = height === undefined ? undefined : { height };

  if (rows.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve receita nova fechada no período.</span>
      </div>
    );
  }

  const leader = rows[0];
  const highlightIndex = rows.findIndex((row) => row.id === highlightId);
  const highlighted = rows[highlightIndex];
  const average = rows.reduce((sum, row) => sum + row.revenue, 0) / rows.length;

  const reading = (() => {
    if (!highlighted || !leader) return null;
    const position = `${String(highlightIndex + 1)}º de ${String(rows.length)}`;
    if (highlightIndex === 0) return { name: highlighted.name, position, gap: null };
    return { name: highlighted.name, position, gap: formatCurrencyCompact(leader.revenue - highlighted.revenue) };
  })();

  const summary = [
    `Gráfico de barras com a receita nova de ${String(rows.length)} executivos, do maior para o menor.`,
    leader ? `Lidera ${leader.name}, com ${formatCurrencyCompact(leader.revenue)}.` : '',
    highlighted && reading
      ? `${highlighted.name} está em ${reading.position}, com ${formatCurrencyCompact(highlighted.revenue)}${reading.gap ? `, a ${reading.gap} do primeiro lugar` : ''}.`
      : '',
    `Média do time: ${formatCurrencyCompact(average)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const renderName = ({ y, index = -1, payload }: NameTickProps): ReactElement => {
    const isHighlight = index === highlightIndex;
    return (
      <text dominantBaseline="central" fontSize={12} y={Number(y)}>
        <tspan
          className="font-display"
          fill={isHighlight ? 'var(--chart-1)' : 'var(--text-muted)'}
          fontWeight={isHighlight ? 700 : 500}
          x={MARGIN.left}
        >
          {String(index + 1)}
        </tspan>
        <tspan
          className="font-sans"
          fill={isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)'}
          fontWeight={isHighlight ? 700 : 500}
          x={MARGIN.left + RANK_WIDTH}
        >
          {String(payload?.value ?? '')}
        </tspan>
      </text>
    );
  };

  const renderValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    if (!row) return null;
    const isHighlight = index === highlightIndex;
    return (
      <text
        className="font-display"
        dominantBaseline="central"
        fill={isHighlight ? 'var(--text-primary)' : 'var(--text-secondary)'}
        fontSize={12}
        fontWeight={isHighlight ? 700 : 500}
        style={HALO}
        x={Number(x) + Number(width) + VALUE_LABEL_GAP}
        y={Number(y) + Number(barHeight) / 2}
      >
        {formatCurrencyCompact(row.revenue)}
      </text>
    );
  };

  const renderReferenceLabel = ({ viewBox }: ReferenceLabelProps): ReactElement => (
    <text fill="var(--text-muted)" fontSize={11} textAnchor="middle" x={viewBox?.x ?? 0} y={(viewBox?.y ?? 0) - 7}>
      <tspan className="font-sans">média </tspan>
      <tspan className="font-display">{formatCurrencyCompact(average)}</tspan>
    </text>
  );

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      {reading ? (
        <p aria-hidden className="mb-2 shrink-0 truncate text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">{reading.name}</span> em{' '}
          <span className="tabular-nums">{reading.position}</span>
          {reading.gap ? (
            <>
              , a <span className="kpi-number font-medium text-text-primary">{reading.gap}</span> do primeiro lugar
            </>
          ) : (
            ', na liderança'
          )}
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="34%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis domain={[0, 'dataMax']} hide type="number" />
            <YAxis
              axisLine={false}
              dataKey="name"
              interval={0}
              tick={renderName}
              tickLine={false}
              type="category"
              width={NAME_AXIS_WIDTH}
            />
            <Bar dataKey="revenue" isAnimationActive={animate} maxBarSize={BAR_MAX} radius={[0, 3, 3, 0]}>
              {rows.map((row) => (
                <Cell fill={row.id === highlightId ? HIGHLIGHT_FILL : NEUTRAL_FILL} key={row.id} />
              ))}
              <LabelList content={renderValue} dataKey="revenue" />
            </Bar>
            <ReferenceLine
              ifOverflow="extendDomain"
              label={renderReferenceLabel}
              stroke={REFERENCE_STROKE}
              strokeDasharray="3 3"
              strokeWidth={1}
              x={average}
              zIndex={REFERENCE_Z}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
