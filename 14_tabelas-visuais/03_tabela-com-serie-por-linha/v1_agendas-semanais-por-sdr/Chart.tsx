import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type SdrWeeklyAgenda } from './data';

/**
 * Tabela com sparkline por linha: a trajetória semanal de agendas de cada SDR ao lado da produção
 * da semana atual. Cada linha usa a própria escala (mínimo e máximo da série), então a forma se lê,
 * mas o volume não se compara entre SDRs; o aviso fica escrito acima da tabela (ponto delicado do
 * modelo). Path calculado em função pura, sem uma instância de Recharts por linha.
 */
export interface SdrAgendaTrendTableProps {
  readonly data?: readonly SdrWeeklyAgenda[];
  readonly className?: string;
}

const NAME_COL_WIDTH = 118;
const SPARK_WIDTH = 216;
const SPARK_HEIGHT = 26;
const SPARK_PAD_Y = 3;
const VALUE_COL_WIDTH = 96;

interface Row {
  readonly sdr: SdrWeeklyAgenda;
  readonly path: string;
  readonly lastX: number;
  readonly lastY: number;
  readonly current: number;
}

function buildRow(sdr: SdrWeeklyAgenda): Row {
  const values = sdr.series.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? SPARK_WIDTH / (values.length - 1) : 0;
  const y = (v: number) => SPARK_PAD_Y + (1 - (v - min) / span) * (SPARK_HEIGHT - SPARK_PAD_Y * 2);
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const lastIndex = values.length - 1;
  const lastValue = values[lastIndex] ?? min;
  return { sdr, path, lastX: lastIndex * step, lastY: y(lastValue), current: lastValue };
}

export default function SdrAgendaTrendTable({ data = defaultData, className }: SdrAgendaTrendTableProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <span>Nenhum SDR neste recorte: não há série para desenhar.</span>
      </div>
    );
  }

  const rows = data.map(buildRow);
  const [firstRow, ...restRows] = rows;
  if (!firstRow) return null;
  const leader = restRows.reduce((best, row) => (row.current > best.current ? row : best), firstRow);
  const firstWeek = data[0]?.series[0]?.week;
  const lastWeek = data[0]?.series.at(-1)?.week;

  const summary = `Tabela com sparkline: agendas semanais de ${String(data.length)} SDRs entre ${firstWeek ? formatDate(firstWeek) : ''} e ${lastWeek ? formatDate(lastWeek) : ''}, cada linha na própria escala. ${leader.sdr.name} lidera a semana atual com ${formatInt(leader.current)} agendas.`;

  return (
    <div className={cn('flex h-full w-full min-w-0 flex-col', className)}>
      <p className="mb-2 text-xs leading-5 text-text-muted">
        Escala própria por linha: cada sparkline usa o mínimo e o máximo da própria série. Mostra a forma de cada SDR; não serve para
        comparar o volume entre eles.
      </p>
      <table aria-label={summary} className="w-full min-w-0 flex-1 border-collapse text-xs" role="table">
        <thead>
          <tr className="border-b border-line-subtle text-left text-text-muted">
            <th className="pb-1.5 font-medium" scope="col" style={{ width: NAME_COL_WIDTH }}>
              SDR
            </th>
            <th className="pb-1.5 font-medium tabular-nums" scope="col" style={{ width: SPARK_WIDTH }}>
              últimas 12 semanas
            </th>
            <th className="pb-1.5 text-right font-medium" scope="col" style={{ width: VALUE_COL_WIDTH }}>
              agendas na semana atual
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isLeader = row.sdr.id === leader.sdr.id;
            return (
              <tr className="border-b border-line-subtle last:border-0" key={row.sdr.id}>
                <td className={cn('py-1.5 pr-2', isLeader ? 'font-semibold text-text-primary' : 'text-text-secondary')}>{row.sdr.name}</td>
                <td className="py-1.5">
                  <svg aria-hidden height={SPARK_HEIGHT} viewBox={`0 0 ${String(SPARK_WIDTH)} ${String(SPARK_HEIGHT)}`} width={SPARK_WIDTH}>
                    <path
                      d={row.path}
                      fill="none"
                      stroke="var(--chart-1)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle cx={row.lastX} cy={row.lastY} fill="var(--chart-1)" r={2.4} />
                  </svg>
                </td>
                <td
                  className={cn(
                    'kpi-number py-1.5 text-right',
                    isLeader ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary',
                  )}
                >
                  {formatInt(row.current)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
