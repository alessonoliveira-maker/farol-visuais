import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SdrAgendas } from './data';

/**
 * Barra radial de uma cor só: agendas marcadas por SDR na semana, do maior anel (fora) para o
 * menor (dentro). Nome no início de cada arco, valor na ponta, trilho atrás de cada um e teto
 * de 270 graus para nenhum anel parecer um total de 100%.
 */
export interface SdrAgendasRadialProps {
  readonly data?: readonly SdrAgendas[];
  readonly height?: number;
  readonly className?: string;
}

const BAR_FILL = 'var(--chart-1)';
const TRACK_FILL = 'var(--surface-sunken)';
const START_ANGLE = 90;
const END_ANGLE = -180;
/** Respiro em pixels entre o fim do texto e o início do arco, na raia do próprio anel. O valor
 * fica colado ao nome, no início do arco: lá a raia é horizontal e as linhas de anéis vizinhos
 * ficam a um passo de anel uma da outra, então nenhum valor chega perto da ponta alheia. */
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

export default function SdrAgendasRadial({ data = defaultData, height, className }: SdrAgendasRadialProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma linha neste recorte: não houve agenda marcada na semana.</span>
      </div>
    );
  }

  /* Crescente: o RadialBarChart posiciona o primeiro item da lista no anel mais interno, então
   * para o maior valor cair no anel externo (a leitura que o modelo promete) a ordem no array
   * precisa ser do menor para o maior, não do maior para o menor. */
  const rows = [...data].sort((a, b) => a.count - b.count);
  const leader = rows[rows.length - 1];
  const smallest = rows[0];
  const maxValue = Math.max(...rows.map((row) => row.count), 1);

  const summary =
    leader && smallest
      ? `Barra radial com as agendas de ${String(rows.length)} SDRs na semana, do maior para o menor anel. Lidera ${leader.name}, com ${formatInt(leader.count)} agendas; ${smallest.name} tem a menor marca, ${formatInt(smallest.count)}.`
      : '';

  const renderLabels = ({ viewBox, index }: RadialLabelProps): ReactElement | null => {
    const row = index === undefined ? undefined : rows[index];
    const vb = readPolarViewBox(viewBox);
    if (!row || !vb) return null;
    const { cx, cy, innerRadius, outerRadius } = vb;
    const radius = (innerRadius + outerRadius) / 2;
    /* Nome e valor numa linha só, terminando antes do início do arco (quadrante ainda não
     * varrido, sem trilho). Halo da ROT-7 no valor: o texto sempre pousa sobre `--surface-raised`. */
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
          barCategoryGap="18%"
          data={rows}
          endAngle={END_ANGLE}
          innerRadius="10%"
          outerRadius="96%"
          startAngle={START_ANGLE}
        >
          <PolarAngleAxis axisLine={false} dataKey="count" domain={[0, maxValue]} tick={false} type="number" />
          <RadialBar background={{ fill: TRACK_FILL }} cornerRadius={4} dataKey="count" fill={BAR_FILL} isAnimationActive={animate} label={renderLabels} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
