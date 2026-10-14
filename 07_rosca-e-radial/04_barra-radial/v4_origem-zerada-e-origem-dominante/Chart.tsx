import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type OriginLeads } from './data';

/**
 * Barra radial de uma cor só com um caso limite do formato: uma origem sem nenhum lead no mês
 * e outra quase 8 vezes maior que a segunda. A origem zerada desenha só o trilho e escreve 0; a
 * dominante reduz as demais a lascas, o limite que o README do modelo documenta.
 */
export interface OriginLeadsRadialProps {
  readonly data?: readonly OriginLeads[];
  readonly height?: number;
  readonly className?: string;
}

const BAR_FILL = 'var(--chart-1)';
const TRACK_FILL = 'var(--surface-sunken)';
const START_ANGLE = 90;
const END_ANGLE = -180;
const LABEL_GAP_PX = 6;
/** Explícito e não o padrão da biblioteca: um minPointSize > 0 desenharia arco falso na origem
 * com 0 leads, que precisa ficar só com o trilho por trás. */
const MIN_POINT_SIZE = 0;

/**
 * O `label` do RadialBar tipa `viewBox` como o formato cartesiano (x, y, width, height): o
 * formato polar real, que o Recharts entrega em tempo de execução, não tem nome em comum com
 * aquele tipo e o TypeScript recusa a interseção. `unknown` sai da checagem e a leitura abaixo
 * valida campo a campo antes de usar.
 */
interface RadialLabelProps {
  readonly viewBox?: unknown;
  readonly index?: number;
}

interface PolarViewBox {
  readonly cx: number;
  readonly cy: number;
  readonly innerRadius: number;
  readonly outerRadius: number;
  readonly startAngle: number;
  readonly endAngle: number;
}

function readPolarViewBox(viewBox: unknown): PolarViewBox | null {
  if (typeof viewBox !== 'object' || viewBox === null) return null;
  const v = viewBox as Record<string, unknown>;
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle } = v;
  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof innerRadius !== 'number' ||
    typeof outerRadius !== 'number' ||
    typeof startAngle !== 'number' ||
    typeof endAngle !== 'number'
  ) {
    return null;
  }
  return { cx, cy, innerRadius, outerRadius, startAngle, endAngle };
}

export default function OriginLeadsRadial({ data = defaultData, height, className }: OriginLeadsRadialProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve lead no mês.</span>
      </div>
    );
  }

  /* "ranking" ordena do maior para o menor, só para o texto (líder, razão, origens zeradas).
   * "chartRows" é a mesma lista invertida: o RadialBarChart posiciona o primeiro item no anel
   * mais interno, então o maior valor só cai no anel externo entrando por último no array que
   * vira `data` do gráfico. */
  const ranking = [...data].sort((a, b) => b.count - a.count);
  const chartRows = [...ranking].reverse();
  const leader = ranking[0];
  const runnerUp = ranking[1];
  const zeroOrigins = ranking.filter((row) => row.count === 0);
  const maxValue = Math.max(...ranking.map((row) => row.count), 1);
  const ratio = leader && runnerUp && runnerUp.count > 0 ? leader.count / runnerUp.count : undefined;

  const summary = [
    `Barra radial com os leads de ${String(ranking.length)} origens do mês, do maior para o menor anel.`,
    leader ? `${leader.name} domina com ${formatInt(leader.count)} leads${ratio !== undefined ? `, ${formatDecimal(ratio, 1)} vezes a segunda origem` : ''}.` : '',
    zeroOrigins.length > 0 ? `${zeroOrigins.map((row) => row.name).join(', ')} não gerou nenhum lead no mês.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderLabels = ({ viewBox, index }: RadialLabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : chartRows[index];
    const vb = readPolarViewBox(viewBox);
    if (!row || !vb) return null;
    const { cx, cy, innerRadius, outerRadius } = vb;
    const radius = (innerRadius + outerRadius) / 2;
    return (
      <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor="end" x={cx - LABEL_GAP_PX} y={cy - radius}>
        {row.name}
        <tspan className="font-display" dx={6} fill="var(--text-primary)" fontSize={12} fontWeight={500} style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}>
          {formatInt(row.count)}
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('h-full w-full min-w-0', className)} role="img" style={style}>
      <ResponsiveContainer height="100%" width="100%">
        <RadialBarChart
          accessibilityLayer={false}
          barCategoryGap="16%"
          data={chartRows}
          endAngle={END_ANGLE}
          innerRadius="8%"
          outerRadius="96%"
          startAngle={START_ANGLE}
        >
          <PolarAngleAxis axisLine={false} dataKey="count" domain={[0, maxValue]} tick={false} type="number" />
          <RadialBar
            background={{ fill: TRACK_FILL }}
            cornerRadius={4}
            dataKey="count"
            fill={BAR_FILL}
            isAnimationActive={animate}
            label={renderLabels}
            minPointSize={MIN_POINT_SIZE}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
