import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, today as defaultToday, type QueueDailySla } from './data';

/**
 * Tabela com tracker por linha: uma fileira de blocos, um por dia, colorida pelo status de SLA de
 * cada fila nos últimos 30 dias. O resumo à direita não depende da cor. As linhas ficam em ordem
 * decrescente de dias com estouro, para a fila mais crítica aparecer primeiro.
 */
export interface QueueSlaTrackerTableProps {
  readonly data?: readonly QueueDailySla[];
  readonly today?: string;
  readonly className?: string;
}

const BLOCK_SIZE = 18;
const BLOCK_GAP = 2;

function countOf(pattern: string, code: string): number {
  return pattern.split('').filter((c) => c === code).length;
}

interface Row {
  readonly queue: QueueDailySla;
  readonly estouro: number;
  readonly atencao: number;
  readonly dentro: number;
}

function buildRow(queue: QueueDailySla): Row {
  return { queue, estouro: countOf(queue.pattern, 'E'), atencao: countOf(queue.pattern, 'A'), dentro: countOf(queue.pattern, 'D') };
}

function blockColor(code: string): string {
  if (code === 'E') return 'var(--negative)';
  if (code === 'A') return 'var(--warning)';
  return 'var(--positive)';
}

export default function QueueSlaTrackerTable({ data = defaultData, today = defaultToday, className }: QueueSlaTrackerTableProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <span>Nenhuma fila neste recorte: não há tracker para desenhar.</span>
      </div>
    );
  }

  const days = data[0]?.pattern.length ?? 30;
  const rows = [...data.map(buildRow)].sort((a, b) => b.estouro - a.estouro || b.atencao - a.atencao);
  const [worstRow] = rows;

  const summary = worstRow
    ? `Tabela com tracker: status diário de SLA de ${String(data.length)} filas nos últimos ${String(days)} dias, ordenadas da mais crítica. ${worstRow.queue.name} estourou o SLA em ${String(worstRow.estouro)} dos ${String(days)} dias, a pior da tabela.`
    : '';

  return (
    <div className={cn('flex h-full w-full min-w-0 flex-col', className)}>
      <div className="mb-1.5 flex items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-[2px]" style={{ backgroundColor: 'var(--positive)' }} />
          dentro do SLA
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-[2px]" style={{ backgroundColor: 'var(--warning)' }} />
          atenção
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-[2px]" style={{ backgroundColor: 'var(--negative)' }} />
          estouro
        </span>
        <span className="ml-auto">hoje: {formatDate(today)}</span>
      </div>
      <table aria-label={summary} className="w-full min-w-0 flex-1 border-collapse text-xs" role="table">
        <thead>
          <tr className="border-b border-line-subtle text-left text-text-muted">
            <th className="pb-1 font-medium" scope="col">
              Fila
            </th>
            <th className="pb-1 font-medium" scope="col">
              últimos {String(days)} dias
            </th>
            <th className="pb-1 text-right font-medium" scope="col">
              dias no SLA
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-line-subtle last:border-0" key={row.queue.id}>
              <td className="py-1 pr-2 text-text-secondary">{row.queue.name}</td>
              <td className="py-1">
                <div aria-hidden className="flex" style={{ gap: BLOCK_GAP }}>
                  {row.queue.pattern.split('').map((code, index) => (
                    <span
                      className="rounded-[2px]"
                      key={`${row.queue.id}-${String(index)}`}
                      style={{
                        backgroundColor: blockColor(code),
                        boxShadow: index === days - 1 ? 'inset 0 0 0 2px var(--text-primary)' : undefined,
                        height: BLOCK_SIZE,
                        width: BLOCK_SIZE,
                      }}
                    />
                  ))}
                </div>
              </td>
              <td className={cn('kpi-number py-1 text-right', row.estouro > 0 ? 'text-negative' : 'text-text-secondary')}>
                {formatInt(row.dentro)} de {formatInt(days)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
