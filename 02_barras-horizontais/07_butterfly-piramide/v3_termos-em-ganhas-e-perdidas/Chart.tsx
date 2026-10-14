import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  LabelList,
  ReferenceLine,
  Rectangle,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ZIndexLayer,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  type BarShapeProps,
  type LabelProps,
} from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, groups as defaultGroups, type GroupSizes, type TermMentions } from './data';

/**
 * Pirâmide de termos: percentual de anotações de ganhas à direita, de perdidas à esquerda,
 * ordenada pela diferença em pontos percentuais entre os dois grupos. Diferença acima de 10 p.p.
 * sai em cor cheia, o resto translúcido; termo ausente num lado marca um traço e escreve 0%,
 * nunca some da lista.
 */
export interface TermPyramidProps {
  readonly data?: readonly TermMentions[];
  readonly groups?: GroupSizes;
  readonly height?: number;
  readonly className?: string;
}

const WON_FILL = 'var(--chart-1)';
const LOST_FILL = 'var(--chart-3)';
const ZERO_STROKE = 'var(--line-strong)';
const NAME_WIDTH = 152;
const MARGIN = { top: 26, right: 44, bottom: 4, left: 0 } as const;
const BAR_MAX = 14;
const VALUE_GAP = 6;
const LABEL_Z = 2000;
/** Abaixo desta diferença o termo não separa os grupos: a marca recua para translúcido (COR-9). */
const STRONG_DIFF_POINTS = 10;
const WEAK_OPACITY = 0.45;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

interface Row {
  readonly id: string;
  readonly term: string;
  readonly won: number;
  readonly lost: number;
  readonly wonPct: number;
  readonly lostPct: number;
  readonly leftValue: number;
  readonly rightValue: number;
  readonly diffPoints: number;
  readonly strong: boolean;
}

interface TickProps {
  readonly y?: number | string;
  readonly payload?: { readonly value?: unknown };
}

/** Ordenado pela diferença: maior favorecimento das ganhas no topo, das perdidas na base. */
function toRows(data: readonly TermMentions[], groups: GroupSizes): Row[] {
  const rows = data.map((item) => {
    const wonPct = groups.won > 0 ? item.won / groups.won : 0;
    const lostPct = groups.lost > 0 ? item.lost / groups.lost : 0;
    const diffPoints = (wonPct - lostPct) * 100;
    return {
      id: item.id,
      term: item.term,
      won: item.won,
      lost: item.lost,
      wonPct,
      lostPct,
      leftValue: -lostPct,
      rightValue: wonPct,
      diffPoints,
      strong: Math.abs(diffPoints) > STRONG_DIFF_POINTS,
    };
  });
  return rows.sort((a, b) => b.diffPoints - a.diffPoints || a.term.localeCompare(b.term, 'pt-BR'));
}

interface OverlayProps {
  readonly rows: readonly Row[];
  readonly wonTotal: number;
  readonly lostTotal: number;
}

/** Título de cada lado com o n do grupo, e a marca de termo ausente que o Bar não desenha. */
function Overlay({ rows, wonTotal, lostTotal }: OverlayProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  if (!xScale || !yScale || !plot) return null;
  const zeroX = xScale(0) ?? plot.x + plot.width / 2;
  return (
    <ZIndexLayer zIndex={LABEL_Z}>
      <text className="font-sans tabular-nums" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={600} textAnchor="middle" x={(plot.x + zeroX) / 2} y={plot.y - 12}>
        Perdidas ({formatInt(lostTotal)})
      </text>
      <text className="font-sans tabular-nums" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={600} textAnchor="middle" x={(zeroX + plot.x + plot.width) / 2} y={plot.y - 12}>
        Ganhas ({formatInt(wonTotal)})
      </text>
      {rows.map((row) => {
        const center = yScale(row.id, { position: 'middle' });
        if (center === undefined) return null;
        return (
          <g key={row.id}>
            {row.lost === 0 ? (
              <>
                <line stroke="var(--text-muted)" x1={zeroX - 5} x2={zeroX - 5} y1={center - 5} y2={center + 5} />
                <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={zeroX - VALUE_GAP - 10} y={center}>
                  0%
                </text>
              </>
            ) : null}
            {row.won === 0 ? (
              <>
                <line stroke="var(--text-muted)" x1={zeroX + 5} x2={zeroX + 5} y1={center - 5} y2={center + 5} />
                <text className="font-display" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} x={zeroX + VALUE_GAP + 10} y={center}>
                  0%
                </text>
              </>
            ) : null}
          </g>
        );
      })}
    </ZIndexLayer>
  );
}

export default function TermPyramid({ data = defaultData, groups = defaultGroups, height, className }: TermPyramidProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0 || groups.won <= 0 || groups.lost <= 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum termo neste recorte: faltam anotações de ganhas ou de perdidas para calcular o percentual.</span>
      </div>
    );
  }

  const rows = toRows(data, groups);
  const domainEdge = Math.max(0.05, ...rows.map((row) => Math.max(Math.abs(row.leftValue), row.rightValue)));
  const topWon = rows[0];
  const topLost = rows[rows.length - 1];

  const summary = [
    `Gráfico pirâmide com ${String(rows.length)} termos, ordenados da diferença entre ganhas e perdidas.`,
    topWon && topLost
      ? `"${topWon.term}" lidera as ganhas (${formatPercent(topWon.wonPct)}); "${topLost.term}" lidera as perdidas (${formatPercent(topLost.lostPct)}).`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const byIndex = (index: number | undefined): Row | undefined => (index === undefined ? undefined : rows[index]);

  const renderName = ({ y, payload }: TickProps): ReactElement => {
    const row = rows.find((item) => item.id === String(payload?.value ?? ''));
    return (
      <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={500} textAnchor="middle" x={NAME_WIDTH / 2} y={Number(y)}>
        {row?.term ?? ''}
      </text>
    );
  };

  const renderLeftBar = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement | null => {
    const row = byIndex(index);
    if (!row) return null;
    return <Rectangle fill={LOST_FILL} fillOpacity={row.strong ? 1 : WEAK_OPACITY} height={Number(barHeight ?? 0)} radius={[3, 0, 0, 3]} width={Number(width ?? 0)} x={Number(x ?? 0)} y={Number(y ?? 0)} />;
  };

  const renderRightBar = ({ x, y, width, height: barHeight, index }: BarShapeProps): ReactElement | null => {
    const row = byIndex(index);
    if (!row) return null;
    return <Rectangle fill={WON_FILL} fillOpacity={row.strong ? 1 : WEAK_OPACITY} height={Number(barHeight ?? 0)} radius={[0, 3, 3, 0]} width={Number(width ?? 0)} x={Number(x ?? 0)} y={Number(y ?? 0)} />;
  };

  const renderLeftValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = byIndex(index);
    if (!row || row.lost === 0) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={row.strong ? 700 : 500} style={HALO} textAnchor="end" x={Number(x) + Number(width) - VALUE_GAP} y={Number(y) + Number(barHeight) / 2}>
        {formatPercent(row.lostPct, 0)}
      </text>
    );
  };

  const renderRightValue = ({ x, y, width, height: barHeight, index }: LabelProps): ReactElement | null => {
    const row = byIndex(index);
    if (!row || row.won === 0) return null;
    return (
      <text className="font-display" dominantBaseline="central" fill="var(--text-secondary)" fontSize={12} fontWeight={row.strong ? 700 : 500} style={HALO} x={Number(x) + Number(width) + VALUE_GAP} y={Number(y) + Number(barHeight) / 2}>
        {formatPercent(row.wonPct, 0)}
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-1 shrink-0 text-[11px] text-text-muted">
        Ordenados pela diferença entre grupos: "{topWon?.term ?? ''}" lidera as ganhas, "{topLost?.term ?? ''}" lidera as perdidas.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer={false} barCategoryGap="26%" data={rows} layout="vertical" margin={MARGIN}>
            <XAxis allowDecimals={false} domain={[-domainEdge, domainEdge]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v: number) => formatPercent(Math.abs(v), 0)} tickLine={false} axisLine={false} ticks={[-domainEdge, 0, domainEdge]} type="number" />
            <YAxis axisLine={false} dataKey="id" interval={0} tick={renderName} tickLine={false} type="category" width={NAME_WIDTH} />
            <ReferenceLine ifOverflow="extendDomain" stroke={ZERO_STROKE} strokeWidth={1} x={0} />
            <Bar dataKey="leftValue" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderLeftBar} stackId="lost">
              <LabelList content={renderLeftValue} dataKey="leftValue" />
            </Bar>
            <Bar dataKey="rightValue" isAnimationActive={animate} maxBarSize={BAR_MAX} shape={renderRightBar} stackId="won">
              <LabelList content={renderRightValue} dataKey="rightValue" />
            </Bar>
            <Overlay lostTotal={groups.lost} rows={rows} wonTotal={groups.won} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
