import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type DaySlaEntries } from './data';

/**
 * Barra radial empilhada: entradas por dia útil da semana, cada arco dividido em até três
 * status de SLA. O dia de feriado não desenha arco nenhum, só o trilho e o rótulo dizendo que
 * não houve expediente; o total de cada dia aberto vai na ponta do arco.
 */
export interface DaySlaRadialProps {
  readonly data?: readonly DaySlaEntries[];
  readonly height?: number;
  readonly className?: string;
}

const WITHIN_FILL = 'var(--chart-1)';
const OUTSIDE_FILL = 'var(--chart-3)';
const PENDING_FILL = 'var(--chart-6)';
const TRACK_FILL = 'var(--surface-sunken)';
const SEPARATOR = 'var(--surface-raised)';
const START_ANGLE = 90;
const END_ANGLE = -180;
const LABEL_GAP_PX = 6;

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

export default function DaySlaRadial({ data = defaultData, height, className }: DaySlaRadialProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve entrada na semana.</span>
      </div>
    );
  }

  const rows = data.map((row) => ({ ...row, total: row.withinSla + row.outsideSla + row.pending }));
  const maxValue = Math.max(...rows.map((row) => row.total), 1);
  const holiday = rows.find((row) => row.closed);
  const worst = [...rows.filter((row) => !row.closed)].sort((a, b) => b.outsideSla + b.pending - (a.outsideSla + a.pending))[0];

  const summary = [
    `Barra radial empilhada com as entradas de ${String(rows.length)} dias úteis da semana em até três status de SLA.`,
    holiday ? `${holiday.day} está sem expediente.` : '',
    worst ? `${worst.day} tem o maior volume fora do SLA ou pendente, ${formatInt(worst.outsideSla + worst.pending)} entradas.` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderTotal = ({ viewBox, index }: RadialLabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    const vb = readPolarViewBox(viewBox);
    if (!row || !vb) return null;
    const { cx, cy, innerRadius, outerRadius } = vb;
    const radius = (innerRadius + outerRadius) / 2;
    /* O nome do dia fica na origem angular comum do anel (START_ANGLE, o topo), nunca no
     * `startAngle` que o viewBox devolve: esse label está preso ao segmento `pending`, cujo
     * `startAngle` já é o ponto onde os dois segmentos anteriores terminam, não o início do
     * anel. Usar esse valor jogava o nome para o meio do arco, perto do total do vizinho. */
    if (row.closed) {
      return (
        <text className="font-sans" dominantBaseline="central" fill="var(--text-muted)" fontSize={11} textAnchor="end" x={cx - LABEL_GAP_PX} y={cy - radius}>
          {row.day}, sem expediente
        </text>
      );
    }
    /* Rótulo do total: em qualquer recorte com valor perto do teto o arco varre quase 270 graus
     * e o gap tangencial da LABEL_GAP_PX pode não bastar para o texto nascer fora da própria
     * marca (ROT-7). O halo garante que o par de contraste seja sempre texto contra
     * `--surface-raised`, nunca texto contra a cor categórica do último segmento. */
    return (
      <text className="font-sans" dominantBaseline="central" fill="var(--text-secondary)" fontSize={11} fontWeight={500} textAnchor="end" x={cx - LABEL_GAP_PX} y={cy - radius}>
        {row.day}
        <tspan className="font-display" dx={6} fill="var(--text-primary)" fontSize={12} fontWeight={500} style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}>
          {formatInt(row.total)}
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-2', className)} role="img" style={style}>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <RadialBarChart accessibilityLayer={false} barCategoryGap="24%" data={rows} endAngle={END_ANGLE} innerRadius="14%" outerRadius="94%" startAngle={START_ANGLE}>
            <PolarAngleAxis axisLine={false} dataKey="total" domain={[0, maxValue]} tick={false} type="number" />
            <RadialBar background={{ fill: TRACK_FILL }} dataKey="withinSla" fill={WITHIN_FILL} isAnimationActive={animate} stackId="dia" stroke={SEPARATOR} strokeWidth={2} />
            <RadialBar dataKey="outsideSla" fill={OUTSIDE_FILL} isAnimationActive={animate} stackId="dia" stroke={SEPARATOR} strokeWidth={2} />
            <RadialBar cornerRadius={4} dataKey="pending" fill={PENDING_FILL} isAnimationActive={animate} label={renderTotal} stackId="dia" stroke={SEPARATOR} strokeWidth={2} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <ul aria-hidden className="flex shrink-0 flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-text-secondary">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: WITHIN_FILL }} />
          Dentro do SLA
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: OUTSIDE_FILL }} />
          Fora do SLA
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: PENDING_FILL }} />
          Pendente
        </li>
      </ul>
    </div>
  );
}
