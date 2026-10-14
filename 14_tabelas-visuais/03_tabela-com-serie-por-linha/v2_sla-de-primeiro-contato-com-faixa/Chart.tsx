import { formatDecimal } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QueueContactTime } from './data';

/**
 * Tabela com sparkline por linha, escala fixa comum a todas as filas: 0 a 30 minutos, com a faixa
 * aceitável de 0 a 15 minutos sombreada em todas as linhas. Diferente da escala própria por linha,
 * aqui o volume PODE se comparar entre filas, porque a régua é a mesma para todas.
 */
export interface QueueSlaTrendTableProps {
  readonly data?: readonly QueueContactTime[];
  readonly className?: string;
}

const SPARK_WIDTH = 296;
const SPARK_HEIGHT = 22;
const SCALE_MIN = 0;
const SCALE_MAX = 30;
const BAND_MAX = 15;

function scaleY(minutes: number): number {
  return SPARK_HEIGHT * (1 - (minutes - SCALE_MIN) / (SCALE_MAX - SCALE_MIN));
}

interface Row {
  readonly queue: QueueContactTime;
  readonly path: string;
  readonly outsidePoints: readonly { x: number; y: number }[];
  readonly lastX: number;
  readonly lastY: number;
  readonly current: number;
  readonly weeksOutside: number;
}

function buildRow(queue: QueueContactTime): Row {
  const values = queue.series.map((point) => point.minutes);
  const step = values.length > 1 ? SPARK_WIDTH / (values.length - 1) : 0;
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${scaleY(v).toFixed(1)}`).join(' ');
  const outsidePoints = values.flatMap((v, i) => (v > BAND_MAX ? [{ x: i * step, y: scaleY(v) }] : []));
  const lastIndex = values.length - 1;
  const lastValue = values[lastIndex] ?? SCALE_MIN;
  return {
    queue,
    path,
    outsidePoints,
    lastX: lastIndex * step,
    lastY: scaleY(lastValue),
    current: lastValue,
    weeksOutside: outsidePoints.length,
  };
}

export default function QueueSlaTrendTable({ data = defaultData, className }: QueueSlaTrendTableProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <span>Nenhuma fila neste recorte: não há série para desenhar.</span>
      </div>
    );
  }

  const rows = data.map(buildRow);
  const [firstRow, ...restRows] = rows;
  if (!firstRow) return null;
  const worst = restRows.reduce((best, row) => (row.weeksOutside > best.weeksOutside ? row : best), firstRow);
  const bandY = scaleY(BAND_MAX);

  const summary = `Tabela com sparkline: tempo de primeiro contato de ${String(data.length)} filas nas últimas 8 semanas, escala comum de ${String(SCALE_MIN)} a ${String(SCALE_MAX)} minutos, faixa aceitável até ${String(BAND_MAX)} minutos sombreada. ${worst.queue.name} estourou a faixa em ${String(worst.weeksOutside)} das 8 semanas, a pior da tabela.`;

  return (
    <div className={cn('flex h-full w-full min-w-0 flex-col', className)}>
      <p className="mb-1.5 text-xs leading-4 text-text-muted tabular-nums">
        Escala comum a todas as filas, de {String(SCALE_MIN)} a {String(SCALE_MAX)} min; faixa sombreada de {String(SCALE_MIN)} a{' '}
        {String(BAND_MAX)} min.
      </p>
      <table aria-label={summary} className="w-full min-w-0 flex-1 border-collapse text-xs" role="table">
        <thead>
          <tr className="border-b border-line-subtle text-left text-text-muted">
            <th className="pb-1 font-medium" scope="col">
              Fila
            </th>
            <th className="pb-1 font-medium tabular-nums" scope="col" style={{ width: SPARK_WIDTH }}>
              últimas 8 semanas
            </th>
            <th className="pb-1 text-right font-medium" scope="col">
              semana atual
            </th>
            <th className="pb-1 text-right font-medium" scope="col">
              semanas fora da faixa
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-line-subtle last:border-0" key={row.queue.id}>
              <td className="py-1 pr-2 text-text-secondary">{row.queue.name}</td>
              <td className="py-1">
                <svg aria-hidden height={SPARK_HEIGHT} viewBox={`0 0 ${String(SPARK_WIDTH)} ${String(SPARK_HEIGHT)}`} width={SPARK_WIDTH}>
                  <rect fill="var(--surface-sunken)" height={SPARK_HEIGHT - bandY} width={SPARK_WIDTH} x={0} y={bandY} />
                  <path
                    d={row.path}
                    fill="none"
                    stroke="var(--chart-1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.4}
                    vectorEffect="non-scaling-stroke"
                  />
                  {row.outsidePoints.map((point) => (
                    <circle cx={point.x} cy={point.y} fill="var(--warning)" key={`${String(point.x)}-${String(point.y)}`} r={2} />
                  ))}
                </svg>
              </td>
              <td className={cn('kpi-number py-1 text-right', row.current > BAND_MAX ? 'font-semibold text-warning' : 'text-text-secondary')}>
                {formatDecimal(row.current)} min
              </td>
              <td className={cn('kpi-number py-1 text-right', row.weeksOutside > 0 ? 'text-warning' : 'text-text-muted')}>
                {String(row.weeksOutside)} de {String(data[0]?.series.length ?? 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
